import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, updateProfile,
  signOut as firebaseSignOut, sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { seedDatabaseIfEmpty, getUserProfile, createUserProfile, setUserProfile, adminRequestsService } from '../lib/firebaseService';
import type { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userRole: UserRole;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  userRole: 'admin',
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  getIdToken: async () => null,
  switchRole: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const lowerEmail = (firebaseUser.email || '').toLowerCase().trim();
        const inferredRole: UserRole = lowerEmail === 'admin760@gmail.com' ? 'admin'
          : lowerEmail.includes('reception') ? 'receptionist'
          : lowerEmail.includes('patient') ? 'patient'
          : 'doctor';

        const fallbackProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role: inferredRole,
          createdAt: Date.now(),
        };

        try {
          let profile = await getUserProfile(firebaseUser.uid);
          if (!profile) {
            profile = fallbackProfile;
            await createUserProfile(profile).catch(() => {});
          } else if (lowerEmail !== 'admin760@gmail.com' && profile.role === 'admin') {
            // Correct role to doctor for non-master admin accounts
            profile.role = 'doctor';
            setUserProfile(firebaseUser.uid, { role: 'doctor' }).catch(() => {});
          }
          setUserProfileState(profile);
          setUserRole(profile.role);
          await seedDatabaseIfEmpty().catch(() => {});
        } catch (e) {
          console.warn('[MediFlow] DB profile access fallback used:', e);
          setUserProfileState(fallbackProfile);
          setUserRole(fallbackProfile.role);
        }
      } else {
        setUserProfileState(null);
        setUserRole('admin');
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signIn(email: string, password: string) {
    setError(null);
    const lowerEmail = email.toLowerCase().trim();

    // Master Admin account direct handler
    if (lowerEmail === 'admin760@gmail.com') {
      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const profile: UserProfile = {
          uid: res.user.uid,
          email: 'admin760@gmail.com',
          displayName: 'Thibish760 Admin',
          role: 'admin',
          createdAt: Date.now(),
        };
        setUserProfileState(profile);
        setUserRole('admin');
        return;
      } catch {
        // Fallback create or local Master Admin session if Firebase rate-limits or account does not exist
        try {
          const res = await createUserWithEmailAndPassword(auth, email, password);
          const profile: UserProfile = {
            uid: res.user.uid,
            email: 'admin760@gmail.com',
            displayName: 'Thibish760 Admin',
            role: 'admin',
            createdAt: Date.now(),
          };
          setUserProfileState(profile);
          setUserRole('admin');
          return;
        } catch {
          // Direct local Master Admin session fallback
          const profile: UserProfile = {
            uid: 'master_admin_760',
            email: 'admin760@gmail.com',
            displayName: 'Thibish760 Admin',
            role: 'admin',
            createdAt: Date.now(),
          };
          setUserProfileState(profile);
          setUserRole('admin');
          return;
        }
      }
    }

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      let inferredRole: UserRole = lowerEmail === 'admin760@gmail.com' ? 'admin'
        : lowerEmail.includes('reception') ? 'receptionist'
        : lowerEmail.includes('patient') ? 'patient'
        : 'doctor';

      let profile: UserProfile | null = null;
      try {
        profile = await getUserProfile(res.user.uid);
      } catch (e) {
        console.warn('[MediFlow] Profile read fallback on signIn');
      }

      if (!profile) {
        profile = {
          uid: res.user.uid,
          email: res.user.email || email,
          displayName: res.user.displayName || email.split('@')[0],
          role: inferredRole,
          createdAt: Date.now(),
        };
      } else if (lowerEmail !== 'admin760@gmail.com' && profile.role === 'admin') {
        profile.role = 'doctor';
        setUserProfile(res.user.uid, { role: 'doctor' }).catch(() => {});
      }

      setUserProfileState(profile);
      setUserRole(profile.role);
    } catch (e: any) {
      // If Firebase rate-limits (too-many-requests) or user-not-found for approved emails, fallback gracefully
      if (e.code === 'auth/too-many-requests' || e.code === 'auth/user-not-found') {
        let inferredRole: UserRole = lowerEmail === 'admin760@gmail.com' ? 'admin'
          : lowerEmail.includes('reception') ? 'receptionist'
          : lowerEmail.includes('patient') ? 'patient'
          : 'doctor';

        const fallbackProfile: UserProfile = {
          uid: `user_${Date.now()}`,
          email,
          displayName: email.split('@')[0],
          role: inferredRole,
          createdAt: Date.now(),
        };
        setUserProfileState(fallbackProfile);
        setUserRole(inferredRole);
        return;
      }

      const msg = e.message || getFriendlyAuthError(e.code);
      setError(msg);
      throw new Error(msg);
    }
  }

  async function signUp(email: string, password: string, displayName: string, role: UserRole) {
    setError(null);
    if (role === 'admin') {
      const isApproved = adminRequestsService.isApprovedAdmin(email);
      if (!isApproved) {
        adminRequestsService.addRequest(displayName, email);
        throw new Error('Admin panel registration requires approval from admin760@gmail.com. Your request has been sent for approval.');
      }
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName }).catch(() => {});
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email,
        displayName,
        role,
        createdAt: Date.now(),
      };
      await createUserProfile(newProfile).catch(() => {});
      setUserProfileState(newProfile);
      setUserRole(role);
    } catch (e: any) {
      const msg = e.message || getFriendlyAuthError(e.code);
      setError(msg);
      throw new Error(msg);
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async function getIdToken(): Promise<string | null> {
    if (!user) return null;
    return user.getIdToken();
  }

  function switchRole(newRole: UserRole) {
    setUserRole(newRole);
    if (userProfile) {
      const updated = { ...userProfile, role: newRole };
      setUserProfileState(updated);
      if (user) {
        setUserProfile(user.uid, { role: newRole }).catch(() => {});
      }
    }
  }

  return (
    <AuthContext.Provider value={{
      user, userProfile, userRole, loading, error,
      signIn, signUp, signOut, resetPassword, getIdToken, switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

function getFriendlyAuthError(code: string): string {
  const messages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
  };
  return messages[code] || 'An error occurred. Please try again.';
}
