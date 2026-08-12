// ─────────────────────────────────────────────────────────────────────────────
// MediFlow — Firebase Realtime Database Service
// LOCAL-FIRST ARCHITECTURE:
//   • All data starts from mock (guaranteed display)
//   • Firebase reads update local store when available
//   • All writes update local store IMMEDIATELY (instant UI)
//   • Firebase writes attempted in background (best-effort)
// ─────────────────────────────────────────────────────────────────────────────
import {
  ref, push, set, update, remove, get, onValue, off,
  type DataSnapshot,
} from 'firebase/database';
import { db } from './firebase';
import {
  patients as mockPatients,
  doctors as mockDoctors,
  appointments as mockAppointments,
  invoices as mockInvoices,
  medicalRecords as mockRecords,
  notifications as mockNotifications,
} from '../data/mockData';
import type {
  Patient, Doctor, Appointment, Invoice,
  MedicalRecord, Notification, UserProfile,
} from '../types';

// ─── Local-first reactive store ───────────────────────────────────────────────

class LocalStore<T extends { id: string }> {
  private items: T[] = [];
  private listeners = new Set<(items: T[]) => void>();

  init(seed: T[]) {
    if (this.items.length === 0) {
      this.items = [...seed];
      this.broadcast();
    }
  }

  replace(items: T[]) {
    this.items = items;
    this.broadcast();
  }

  add(item: T) {
    // Avoid duplicates
    if (!this.items.find(i => i.id === item.id)) {
      this.items = [...this.items, item];
    } else {
      this.items = this.items.map(i => i.id === item.id ? { ...i, ...item } : i);
    }
    this.broadcast();
  }

  update(id: string, partial: Partial<T>) {
    this.items = this.items.map(i => i.id === id ? { ...i, ...partial } : i);
    this.broadcast();
  }

  remove(id: string) {
    this.items = this.items.filter(i => i.id !== id);
    this.broadcast();
  }

  get(): T[] {
    return this.items;
  }

  subscribe(cb: (items: T[]) => void): () => void {
    this.listeners.add(cb);
    cb([...this.items]); // immediately fire with current data
    return () => this.listeners.delete(cb);
  }

  private broadcast() {
    const snapshot = [...this.items];
    this.listeners.forEach(cb => cb(snapshot));
  }
}

// ─── Store instances ──────────────────────────────────────────────────────────

const stores = {
  patients:      new LocalStore<Patient>(),
  doctors:       new LocalStore<Doctor>(),
  appointments:  new LocalStore<Appointment>(),
  invoices:      new LocalStore<Invoice>(),
  records:       new LocalStore<MedicalRecord>(),
  notifications: new LocalStore<Notification>(),
};

// Seed all stores from mock data immediately (guarantees data on first render)
stores.patients.init(mockPatients);
stores.doctors.init(mockDoctors);
stores.appointments.init(mockAppointments);
stores.invoices.init(mockInvoices);
stores.records.init(mockRecords);
stores.notifications.init(mockNotifications as unknown as Notification[]);

// ─── Firebase sync (best-effort, non-blocking) ────────────────────────────────

function syncFromFirebase<T extends { id: string }>(
  path: string,
  store: LocalStore<T>,
): () => void {
  const dbRef = ref(db, path);
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) {
      // Firebase empty — try to seed it with what's in the store
      seedFirebasePath(path, store.get()).catch(() => {});
      return;
    }
    const data = snap.val() as Record<string, Omit<T, 'id'>>;
    const items = Object.entries(data).map(([id, val]) => ({ ...val, id } as T));
    store.replace(items);
  };

  onValue(dbRef, handler, () => {
    // Permission error — local store already has mock data, nothing to do
  });

  return () => off(dbRef, 'value', handler);
}

async function seedFirebasePath<T extends { id: string }>(
  path: string,
  items: T[],
): Promise<void> {
  try {
    const snap = await get(ref(db, path));
    if (snap.exists()) return;
    await Promise.all(
      items.map(item => {
        const { id, ...rest } = item as any;
        return set(ref(db, `${path}/${id}`), rest);
      })
    );
  } catch {
    // Silently swallow — Firebase rules may block writes
  }
}

// Start Firebase sync in background (won't block initial render)
const _unsubPatients      = syncFromFirebase('patients', stores.patients);
const _unsubDoctors       = syncFromFirebase('doctors', stores.doctors);
const _unsubAppointments  = syncFromFirebase('appointments', stores.appointments);
const _unsubInvoices      = syncFromFirebase('invoices', stores.invoices);
const _unsubRecords       = syncFromFirebase('records', stores.records);
const _unsubNotifications = syncFromFirebase('notifications', stores.notifications);

// Suppress "unused variable" lint warnings
void _unsubPatients; void _unsubDoctors; void _unsubAppointments;
void _unsubInvoices; void _unsubRecords; void _unsubNotifications;

// ─── Firebase write helpers (best-effort) ─────────────────────────────────────

async function fbSet(path: string, data: object): Promise<void> {
  try { await set(ref(db, path), { ...data, updatedAt: Date.now() }); } catch { /* ignored */ }
}
async function fbUpdate(path: string, data: object): Promise<void> {
  try { await update(ref(db, path), { ...data, updatedAt: Date.now() }); } catch { /* ignored */ }
}
async function fbRemove(path: string): Promise<void> {
  try { await remove(ref(db, path)); } catch { /* ignored */ }
}
async function fbPush(path: string, data: object): Promise<string> {
  try {
    const newRef = push(ref(db, path));
    await set(newRef, { ...data, createdAt: Date.now() });
    return newRef.key!;
  } catch {
    return '';
  }
}

// ─── Nano-ID generator (works without Firebase push) ─────────────────────────

function nanoId(prefix = 'local'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── User profile helpers ─────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await get(ref(db, `users/${uid}`));
    return snap.exists() ? (snap.val() as UserProfile) : null;
  } catch { return null; }
}

export async function setUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
  await fbUpdate(`users/${uid}`, profile);
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  await fbSet(`users/${profile.uid}`, profile);
}

// ─── Legacy helpers (kept for compatibility) ──────────────────────────────────

export function subscribeToCollection<T>(
  path: string,
  cb: (items: T[]) => void,
  _onError?: (e: Error) => void,
  _mockFallback?: T[]
): () => void {
  // Route to local store
  const storeKey = path as keyof typeof stores;
  const store = stores[storeKey] as LocalStore<any> | undefined;
  if (store) return store.subscribe(cb);
  // Unknown path — return no-op
  cb([]);
  return () => {};
}

export async function addDocument<T extends object>(
  path: string, data: T
): Promise<string> {
  // This is only called for paths not covered by typed services below
  const id = nanoId(path);
  fbPush(path, data).catch(() => {});
  return id;
}

export async function updateDocument<T extends object>(
  path: string, id: string, data: Partial<T>
): Promise<void> {
  fbUpdate(`${path}/${id}`, data).catch(() => {});
}

export async function deleteDocument(path: string, id: string): Promise<void> {
  fbRemove(`${path}/${id}`).catch(() => {});
}

export async function readCollection<T>(path: string): Promise<T[]> {
  try {
    const snap = await get(ref(db, path));
    if (!snap.exists()) return [];
    const data = snap.val() as Record<string, T>;
    return Object.entries(data).map(([id, val]) => ({ ...val, id } as T));
  } catch { return []; }
}

// ─── Typed services ───────────────────────────────────────────────────────────

export const patientsService = {
  subscribe: (cb: (p: Patient[]) => void, _onErr?: (e: Error) => void) =>
    stores.patients.subscribe(cb),

  add: async (p: Omit<Patient, 'id'>): Promise<string> => {
    const id = nanoId('p');
    const item: Patient = { ...p, id } as Patient;
    stores.patients.add(item);                                 // ← instant UI
    fbPush('patients', p).then(fbId => {
      if (fbId) stores.patients.update(id, { id: fbId });     // reconcile ID
    }).catch(() => {});
    return id;
  },

  update: async (id: string, p: Partial<Patient>): Promise<void> => {
    stores.patients.update(id, p);                             // ← instant UI
    fbUpdate(`patients/${id}`, p).catch(() => {});
  },

  delete: async (id: string): Promise<void> => {
    stores.patients.remove(id);                                // ← instant UI
    fbRemove(`patients/${id}`).catch(() => {});
  },
};

export const doctorsService = {
  subscribe: (cb: (d: Doctor[]) => void, _onErr?: (e: Error) => void) =>
    stores.doctors.subscribe(cb),

  add: async (d: Omit<Doctor, 'id'>): Promise<string> => {
    const id = nanoId('doc');
    stores.doctors.add({ ...d, id } as Doctor);
    fbPush('doctors', d).catch(() => {});
    return id;
  },

  update: async (id: string, d: Partial<Doctor>): Promise<void> => {
    stores.doctors.update(id, d);
    fbUpdate(`doctors/${id}`, d).catch(() => {});
  },

  delete: async (id: string): Promise<void> => {
    stores.doctors.remove(id);
    fbRemove(`doctors/${id}`).catch(() => {});
  },
};

export const appointmentsService = {
  subscribe: (cb: (a: Appointment[]) => void, _onErr?: (e: Error) => void) =>
    stores.appointments.subscribe(cb),

  add: async (a: Omit<Appointment, 'id'>): Promise<string> => {
    const id = nanoId('a');
    stores.appointments.add({ ...a, id } as Appointment);
    fbPush('appointments', a).catch(() => {});
    return id;
  },

  update: async (id: string, a: Partial<Appointment>): Promise<void> => {
    stores.appointments.update(id, a);
    fbUpdate(`appointments/${id}`, a).catch(() => {});
  },

  delete: async (id: string): Promise<void> => {
    stores.appointments.remove(id);
    fbRemove(`appointments/${id}`).catch(() => {});
  },
};

export const invoicesService = {
  subscribe: (cb: (i: Invoice[]) => void, _onErr?: (e: Error) => void) =>
    stores.invoices.subscribe(cb),

  add: async (i: Omit<Invoice, 'id'>): Promise<string> => {
    const id = nanoId('inv');
    stores.invoices.add({ ...i, id } as Invoice);
    fbPush('invoices', i).catch(() => {});
    return id;
  },

  update: async (id: string, i: Partial<Invoice>): Promise<void> => {
    stores.invoices.update(id, i);
    fbUpdate(`invoices/${id}`, i).catch(() => {});
  },

  delete: async (id: string): Promise<void> => {
    stores.invoices.remove(id);
    fbRemove(`invoices/${id}`).catch(() => {});
  },
};

export const recordsService = {
  subscribe: (cb: (r: MedicalRecord[]) => void, _onErr?: (e: Error) => void) =>
    stores.records.subscribe(cb),

  add: async (r: Omit<MedicalRecord, 'id'>): Promise<string> => {
    const id = nanoId('mr');
    stores.records.add({ ...r, id } as MedicalRecord);
    fbPush('records', r).catch(() => {});
    return id;
  },

  update: async (id: string, r: Partial<MedicalRecord>): Promise<void> => {
    stores.records.update(id, r);
    fbUpdate(`records/${id}`, r).catch(() => {});
  },

  delete: async (id: string): Promise<void> => {
    stores.records.remove(id);
    fbRemove(`records/${id}`).catch(() => {});
  },
};

export const notificationsService = {
  subscribe: (cb: (n: Notification[]) => void, _onErr?: (e: Error) => void) =>
    (stores.notifications as unknown as LocalStore<Notification>).subscribe(cb),

  markRead: async (id: string): Promise<void> => {
    (stores.notifications as unknown as LocalStore<Notification>)
      .update(id, { read: true } as any);
    fbUpdate(`notifications/${id}`, { read: true }).catch(() => {});
  },

  delete: async (id: string): Promise<void> => {
    (stores.notifications as unknown as LocalStore<Notification>).remove(id);
    fbRemove(`notifications/${id}`).catch(() => {});
  },
};

// ─── Seeder (kept for compatibility) ─────────────────────────────────────────

export async function seedDatabaseIfEmpty(): Promise<void> {
  // Local stores are already seeded from mock data at module load time.
  // Attempt Firebase seed as well (best-effort).
  await seedFirebasePath('patients',      mockPatients);
  await seedFirebasePath('doctors',       mockDoctors);
  await seedFirebasePath('appointments',  mockAppointments);
  await seedFirebasePath('invoices',      mockInvoices);
  await seedFirebasePath('records',       mockRecords);
  await seedFirebasePath('notifications', mockNotifications);
}

// ─── ADMIN ACCESS & APPROVALS SERVICE ───────────────────────────────────────
export interface AdminRequest {
  id: string;
  name: string;
  email: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

let approvedAdminsList: string[] = ['admin760@gmail.com', 'admin@mediflow.com'];
let adminRequestsList: AdminRequest[] = [
  { id: 'req1', name: 'Dr. Robert Vance', email: 'r.vance@mediflow.com', date: '2026-08-10', status: 'pending' },
  { id: 'req2', name: 'Sarah Jenkins', email: 's.jenkins@mediflow.com', date: '2026-08-11', status: 'pending' },
];

export const adminRequestsService = {
  isApprovedAdmin: (email: string): boolean => {
    if (!email) return false;
    const lower = email.toLowerCase();
    return lower === 'admin760@gmail.com' || approvedAdminsList.includes(lower);
  },
  getApprovedAdmins: (): string[] => approvedAdminsList,
  getRequests: (): AdminRequest[] => [...adminRequestsList],
  addRequest: (name: string, email: string): void => {
    const lower = email.toLowerCase();
    const existing = adminRequestsList.find(r => r.email.toLowerCase() === lower);
    if (!existing) {
      const newReq: AdminRequest = {
        id: `req_${Date.now()}`,
        name: name || email.split('@')[0],
        email: lower,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
      };
      adminRequestsList = [newReq, ...adminRequestsList];
    }
  },
  approveRequest: (id: string): void => {
    const req = adminRequestsList.find(r => r.id === id);
    if (req) {
      req.status = 'approved';
      if (!approvedAdminsList.includes(req.email.toLowerCase())) {
        approvedAdminsList.push(req.email.toLowerCase());
      }
    }
  },
  rejectRequest: (id: string): void => {
    const req = adminRequestsList.find(r => r.id === id);
    if (req) {
      req.status = 'rejected';
    }
  },
};
