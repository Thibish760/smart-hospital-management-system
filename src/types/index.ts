// =====================================================================
// TYPES — MediFlow Hospital Management System
// =====================================================================

export type AppointmentStatus = 'pending' | 'completed' | 'cancelled' | 'rescheduled' | 'in-progress';
export type Gender = 'Male' | 'Female' | 'Other';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial';
export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'patient';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: number;
  phone?: string;
  patientId?: string;
  doctorId?: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  name: string;
  avatar?: string;
  age: number;
  gender: Gender;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  address: string;
  dateOfBirth: string;
  registeredDate: string;
  lastVisit: string;
  primaryDoctor: string;
  department: string;
  status: 'active' | 'inactive' | 'admitted' | 'discharged';
  insuranceProvider?: string;
  insuranceId?: string;
  allergies: string[];
  conditions: string[];
}

export interface Doctor {
  id: string;
  name: string;
  avatar?: string;
  specialty: string;
  department: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  phone: string;
  email: string;
  status: 'available' | 'busy' | 'off-duty' | 'on-leave';
  joinedDate: string;
  patientCount: number;
  availableDays: string[];
  bio: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  duration: number; // minutes
  type: 'consultation' | 'follow-up' | 'emergency' | 'checkup' | 'procedure';
  status: AppointmentStatus;
  notes?: string;
  fee: number;
  room?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: 'lab-report' | 'prescription' | 'diagnosis' | 'surgery' | 'scan' | 'note';
  title: string;
  description: string;
  doctor: string;
  department: string;
  attachments?: string[];
  tags: string[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  dueDate: string;
  services: InvoiceService[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: PaymentStatus;
  paymentMethod?: 'cash' | 'card' | 'insurance' | 'bank-transfer';
}

export interface InvoiceService {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  doctorCount: number;
  bedCount: number;
  bedsOccupied: number;
  color: string;
}

export interface KpiData {
  label: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  unit?: string;
  sparkline?: number[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number;
  value3?: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  message: string;
  time: string;
  read: boolean;
}
