import type {
  Patient, Doctor, Appointment, MedicalRecord, Invoice,
  Department, Notification, ChartDataPoint
} from '../types';

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
export const departments: Department[] = [
  { id: 'd1', name: 'Cardiology', head: 'Dr. Sarah Mitchell', doctorCount: 8, bedCount: 40, bedsOccupied: 28, color: '#EF4444' },
  { id: 'd2', name: 'Neurology', head: 'Dr. James Hawkins', doctorCount: 6, bedCount: 30, bedsOccupied: 19, color: '#8B5CF6' },
  { id: 'd3', name: 'Orthopedics', head: 'Dr. Rachel Chen', doctorCount: 7, bedCount: 35, bedsOccupied: 24, color: '#F59E0B' },
  { id: 'd4', name: 'Pediatrics', head: 'Dr. Emily Foster', doctorCount: 9, bedCount: 50, bedsOccupied: 31, color: '#22C55E' },
  { id: 'd5', name: 'Oncology', head: 'Dr. Michael Torres', doctorCount: 5, bedCount: 25, bedsOccupied: 18, color: '#3B82F6' },
  { id: 'd6', name: 'Emergency', head: 'Dr. Kevin Shah', doctorCount: 12, bedCount: 20, bedsOccupied: 14, color: '#EC4899' },
  { id: 'd7', name: 'Radiology', head: 'Dr. Anna Petrov', doctorCount: 4, bedCount: 10, bedsOccupied: 3, color: '#14B8A6' },
  { id: 'd8', name: 'Dermatology', head: 'Dr. Lucas Green', doctorCount: 5, bedCount: 15, bedsOccupied: 6, color: '#F97316' },
];

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
export const patients: Patient[] = [
  {
    id: 'p1', mrn: 'MRN-001842', name: 'Eleanor Whitfield', age: 54, gender: 'Female',
    bloodGroup: 'O+', phone: '+1 (555) 234-7891', email: 'e.whitfield@email.com',
    address: '1204 Maple Street, Boston, MA 02134', dateOfBirth: '1970-03-12',
    registeredDate: '2022-01-15', lastVisit: '2026-07-28', primaryDoctor: 'Dr. Sarah Mitchell',
    department: 'Cardiology', status: 'active', insuranceProvider: 'BlueCross BlueShield',
    insuranceId: 'BCBS-4821937', allergies: ['Penicillin', 'Sulfa'], conditions: ['Hypertension', 'Type 2 Diabetes'],
  },
  {
    id: 'p2', mrn: 'MRN-001843', name: 'Marcus T. Johnson', age: 38, gender: 'Male',
    bloodGroup: 'A+', phone: '+1 (555) 891-3456', email: 'marcus.j@email.com',
    address: '87 Oak Avenue, Chicago, IL 60601', dateOfBirth: '1986-07-22',
    registeredDate: '2023-03-08', lastVisit: '2026-08-01', primaryDoctor: 'Dr. James Hawkins',
    department: 'Neurology', status: 'admitted', insuranceProvider: 'Aetna',
    insuranceId: 'AET-7823001', allergies: ['Aspirin'], conditions: ['Migraines', 'Anxiety Disorder'],
  },
  {
    id: 'p3', mrn: 'MRN-001844', name: 'Sophia Ramirez', age: 29, gender: 'Female',
    bloodGroup: 'B-', phone: '+1 (555) 456-1234', email: 'sophia.r@email.com',
    address: '329 Elm Court, Austin, TX 78701', dateOfBirth: '1995-11-04',
    registeredDate: '2023-09-20', lastVisit: '2026-07-15', primaryDoctor: 'Dr. Rachel Chen',
    department: 'Orthopedics', status: 'active', allergies: [], conditions: ['ACL Tear (Post-surgery)'],
  },
  {
    id: 'p4', mrn: 'MRN-001845', name: 'Robert K. Chen', age: 67, gender: 'Male',
    bloodGroup: 'AB+', phone: '+1 (555) 321-9870', email: 'robert.chen@email.com',
    address: '12 Harbor View, Seattle, WA 98101', dateOfBirth: '1957-05-30',
    registeredDate: '2021-06-14', lastVisit: '2026-08-02', primaryDoctor: 'Dr. Michael Torres',
    department: 'Oncology', status: 'admitted', insuranceProvider: 'Medicare',
    insuranceId: 'MCR-1029384', allergies: ['Codeine', 'Iodine'], conditions: ['Prostate Cancer Stage II', 'Hypertension'],
  },
  {
    id: 'p5', mrn: 'MRN-001846', name: 'Isabelle Fontaine', age: 12, gender: 'Female',
    bloodGroup: 'A-', phone: '+1 (555) 678-4321', email: 'fontaine.family@email.com',
    address: '45 Birchwood Drive, Miami, FL 33101', dateOfBirth: '2012-02-18',
    registeredDate: '2026-01-10', lastVisit: '2026-08-03', primaryDoctor: 'Dr. Emily Foster',
    department: 'Pediatrics', status: 'active', insuranceProvider: 'United Health',
    insuranceId: 'UH-5829102', allergies: ['Peanuts', 'Latex'], conditions: ['Asthma', 'Eczema'],
  },
  {
    id: 'p6', mrn: 'MRN-001847', name: 'David Okonkwo', age: 45, gender: 'Male',
    bloodGroup: 'O-', phone: '+1 (555) 112-3456', email: 'd.okonkwo@email.com',
    address: '501 Pine Lane, New York, NY 10001', dateOfBirth: '1979-09-07',
    registeredDate: '2022-11-28', lastVisit: '2026-07-20', primaryDoctor: 'Dr. Kevin Shah',
    department: 'Emergency', status: 'discharged', allergies: ['NSAIDs'],
    conditions: ['Appendectomy (Recovered)', 'Hypertension'],
  },
  {
    id: 'p7', mrn: 'MRN-001848', name: 'Priya Nair', age: 33, gender: 'Female',
    bloodGroup: 'B+', phone: '+1 (555) 987-6543', email: 'priya.nair@email.com',
    address: '234 Rosewood Ave, San Francisco, CA 94102', dateOfBirth: '1991-04-25',
    registeredDate: '2026-03-15', lastVisit: '2026-08-01', primaryDoctor: 'Dr. Lucas Green',
    department: 'Dermatology', status: 'active', insuranceProvider: 'Kaiser Permanente',
    insuranceId: 'KP-7341829', allergies: ['Sulfa'], conditions: ['Psoriasis'],
  },
  {
    id: 'p8', mrn: 'MRN-001849', name: 'Thomas Bradford', age: 58, gender: 'Male',
    bloodGroup: 'A+', phone: '+1 (555) 345-6789', email: 'thomas.b@email.com',
    address: '89 Walnut Street, Denver, CO 80201', dateOfBirth: '1966-12-03',
    registeredDate: '2020-08-22', lastVisit: '2026-07-25', primaryDoctor: 'Dr. Anna Petrov',
    department: 'Radiology', status: 'active', insuranceProvider: 'Cigna',
    insuranceId: 'CGN-2847192', allergies: ['Contrast Dye'], conditions: ['Kidney Stones', 'Hyperlipidemia'],
  },
];

// ─── DOCTORS ─────────────────────────────────────────────────────────────────
export const doctors: Doctor[] = [
  {
    id: 'doc1', name: 'Dr. Sarah Mitchell', specialty: 'Interventional Cardiology',
    department: 'Cardiology', qualification: 'MD, FACC, FSCAI', experience: 18,
    consultationFee: 350, rating: 4.9, reviewCount: 387, phone: '+1 (555) 100-0001',
    email: 's.mitchell@mediflow.com', status: 'available', joinedDate: '2006-07-01',
    patientCount: 142, availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    bio: 'Dr. Mitchell specializes in complex coronary interventions and structural heart disease. She has performed over 3,000 procedures and is a leading voice in cardiac care innovation.',
  },
  {
    id: 'doc2', name: 'Dr. James Hawkins', specialty: 'Neurosurgery',
    department: 'Neurology', qualification: 'MD, PhD, FAANS', experience: 22,
    consultationFee: 420, rating: 4.8, reviewCount: 241, phone: '+1 (555) 100-0002',
    email: 'j.hawkins@mediflow.com', status: 'busy', joinedDate: '2002-03-15',
    patientCount: 98, availableDays: ['Mon', 'Wed', 'Fri'],
    bio: 'With over two decades of experience, Dr. Hawkins is renowned for minimally invasive brain and spine surgery. He has pioneered several surgical techniques used globally.',
  },
  {
    id: 'doc3', name: 'Dr. Rachel Chen', specialty: 'Sports Medicine & Orthopedics',
    department: 'Orthopedics', qualification: 'MD, FAAOS', experience: 14,
    consultationFee: 280, rating: 4.7, reviewCount: 312, phone: '+1 (555) 100-0003',
    email: 'r.chen@mediflow.com', status: 'available', joinedDate: '2010-09-01',
    patientCount: 187, availableDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    bio: 'Dr. Chen is a fellowship-trained orthopedic surgeon specializing in sports-related injuries, joint replacement, and arthroscopic procedures.',
  },
  {
    id: 'doc4', name: 'Dr. Emily Foster', specialty: 'Pediatric Medicine',
    department: 'Pediatrics', qualification: 'MD, FAAP', experience: 11,
    consultationFee: 240, rating: 4.9, reviewCount: 498, phone: '+1 (555) 100-0004',
    email: 'e.foster@mediflow.com', status: 'available', joinedDate: '2013-06-01',
    patientCount: 314, availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    bio: 'Dr. Foster brings warmth and expertise to pediatric care, specializing in childhood development, immunology, and complex neonatal conditions.',
  },
  {
    id: 'doc5', name: 'Dr. Michael Torres', specialty: 'Medical Oncology',
    department: 'Oncology', qualification: 'MD, PhD, FASCO', experience: 19,
    consultationFee: 400, rating: 4.8, reviewCount: 178, phone: '+1 (555) 100-0005',
    email: 'm.torres@mediflow.com', status: 'on-leave', joinedDate: '2005-01-10',
    patientCount: 76, availableDays: ['Tue', 'Wed', 'Thu'],
    bio: 'Dr. Torres is a leading oncologist with expertise in targeted therapy and immunotherapy for solid tumors. He leads multiple clinical trials at MediFlow.',
  },
  {
    id: 'doc6', name: 'Dr. Kevin Shah', specialty: 'Emergency Medicine',
    department: 'Emergency', qualification: 'MD, FACEP', experience: 13,
    consultationFee: 310, rating: 4.6, reviewCount: 562, phone: '+1 (555) 100-0006',
    email: 'k.shah@mediflow.com', status: 'busy', joinedDate: '2011-04-01',
    patientCount: 421, availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    bio: 'Dr. Shah has responded to thousands of emergency cases across trauma, cardiac, and neurological emergencies. He directs the emergency medicine training program.',
  },
  {
    id: 'doc7', name: 'Dr. Anna Petrov', specialty: 'Diagnostic Radiology',
    department: 'Radiology', qualification: 'MD, FRCR', experience: 16,
    consultationFee: 260, rating: 4.7, reviewCount: 143, phone: '+1 (555) 100-0007',
    email: 'a.petrov@mediflow.com', status: 'available', joinedDate: '2008-11-01',
    patientCount: 92, availableDays: ['Mon', 'Tue', 'Wed', 'Thu'],
    bio: 'Dr. Petrov specializes in cross-sectional imaging, interventional radiology, and AI-assisted diagnostics with a focus on oncological imaging.',
  },
  {
    id: 'doc8', name: 'Dr. Lucas Green', specialty: 'Dermatology & Aesthetics',
    department: 'Dermatology', qualification: 'MD, FAAD', experience: 10,
    consultationFee: 220, rating: 4.8, reviewCount: 276, phone: '+1 (555) 100-0008',
    email: 'l.green@mediflow.com', status: 'available', joinedDate: '2014-02-01',
    patientCount: 203, availableDays: ['Mon', 'Wed', 'Thu', 'Fri'],
    bio: 'Dr. Green is a board-certified dermatologist with expertise in skin cancer surgery, inflammatory dermatoses, and advanced aesthetic procedures.',
  },
];

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
export const appointments: Appointment[] = [
  { id: 'a1', patientId: 'p1', patientName: 'Eleanor Whitfield', doctorId: 'doc1', doctorName: 'Dr. Sarah Mitchell', department: 'Cardiology', date: '2026-08-05', time: '09:00', duration: 30, type: 'consultation', status: 'pending', fee: 350, room: 'C-104', notes: 'Follow-up on ECG results' },
  { id: 'a2', patientId: 'p2', patientName: 'Marcus T. Johnson', doctorId: 'doc2', doctorName: 'Dr. James Hawkins', department: 'Neurology', date: '2026-08-05', time: '10:30', duration: 45, type: 'follow-up', status: 'completed', fee: 420, room: 'N-201' },
  { id: 'a3', patientId: 'p3', patientName: 'Sophia Ramirez', doctorId: 'doc3', doctorName: 'Dr. Rachel Chen', department: 'Orthopedics', date: '2026-08-05', time: '11:00', duration: 30, type: 'checkup', status: 'in-progress', fee: 280, room: 'O-108' },
  { id: 'a4', patientId: 'p4', patientName: 'Robert K. Chen', doctorId: 'doc5', doctorName: 'Dr. Michael Torres', department: 'Oncology', date: '2026-08-05', time: '13:00', duration: 60, type: 'consultation', status: 'pending', fee: 400, room: 'ON-301' },
  { id: 'a5', patientId: 'p5', patientName: 'Isabelle Fontaine', doctorId: 'doc4', doctorName: 'Dr. Emily Foster', department: 'Pediatrics', date: '2026-08-05', time: '14:00', duration: 30, type: 'checkup', status: 'pending', fee: 240, room: 'P-105' },
  { id: 'a6', patientId: 'p6', patientName: 'David Okonkwo', doctorId: 'doc6', doctorName: 'Dr. Kevin Shah', department: 'Emergency', date: '2026-08-04', time: '08:00', duration: 45, type: 'emergency', status: 'completed', fee: 620, room: 'ER-02' },
  { id: 'a7', patientId: 'p7', patientName: 'Priya Nair', doctorId: 'doc8', doctorName: 'Dr. Lucas Green', department: 'Dermatology', date: '2026-08-06', time: '10:00', duration: 30, type: 'consultation', status: 'pending', fee: 220, room: 'D-203' },
  { id: 'a8', patientId: 'p8', patientName: 'Thomas Bradford', doctorId: 'doc7', doctorName: 'Dr. Anna Petrov', department: 'Radiology', date: '2026-08-06', time: '11:30', duration: 60, type: 'procedure', status: 'pending', fee: 800, room: 'R-101' },
  { id: 'a9', patientId: 'p1', patientName: 'Eleanor Whitfield', doctorId: 'doc1', doctorName: 'Dr. Sarah Mitchell', department: 'Cardiology', date: '2026-07-28', time: '09:30', duration: 30, type: 'follow-up', status: 'completed', fee: 350, room: 'C-104' },
  { id: 'a10', patientId: 'p2', patientName: 'Marcus T. Johnson', doctorId: 'doc2', doctorName: 'Dr. James Hawkins', department: 'Neurology', date: '2026-08-07', time: '15:00', duration: 30, type: 'follow-up', status: 'rescheduled', fee: 420, notes: 'Patient requested reschedule' },
];

// ─── MEDICAL RECORDS ──────────────────────────────────────────────────────────
export const medicalRecords: MedicalRecord[] = [
  { id: 'mr1', patientId: 'p1', patientName: 'Eleanor Whitfield', date: '2026-07-28', type: 'lab-report', title: 'Complete Blood Count (CBC)', description: 'CBC with differential — all values within normal range. Hemoglobin 13.2 g/dL, WBC 7.1 × 10³/µL.', doctor: 'Dr. Sarah Mitchell', department: 'Cardiology', tags: ['Blood Test', 'Routine'], attachments: ['cbc_whitfield_jul2026.pdf'] },
  { id: 'mr2', patientId: 'p1', patientName: 'Eleanor Whitfield', date: '2026-07-28', type: 'prescription', title: 'Antihypertensive Prescription', description: 'Amlodipine 5mg OD, Metformin 500mg BD with meals. Monitor BP daily.', doctor: 'Dr. Sarah Mitchell', department: 'Cardiology', tags: ['Prescription', 'Hypertension', 'Diabetes'] },
  { id: 'mr3', patientId: 'p2', patientName: 'Marcus T. Johnson', date: '2026-08-01', type: 'scan', title: 'MRI Brain — Full Scan', description: 'T1/T2 weighted MRI showing no acute infarct. Small white matter changes noted in periventricular region.', doctor: 'Dr. James Hawkins', department: 'Neurology', tags: ['MRI', 'Brain Scan'], attachments: ['mri_johnson_aug2026.dcm', 'mri_report_aug2026.pdf'] },
  { id: 'mr4', patientId: 'p3', patientName: 'Sophia Ramirez', date: '2026-06-15', type: 'surgery', title: 'ACL Reconstruction Surgery', description: 'Arthroscopic ACL reconstruction with patellar tendon autograft. Surgery uncomplicated.', doctor: 'Dr. Rachel Chen', department: 'Orthopedics', tags: ['Surgery', 'ACL', 'Knee'] },
  { id: 'mr5', patientId: 'p4', patientName: 'Robert K. Chen', date: '2026-08-02', type: 'diagnosis', title: 'Oncology Assessment — Q3 2026', description: 'PSA levels showing stable disease. Continued hormonal therapy recommended.', doctor: 'Dr. Michael Torres', department: 'Oncology', tags: ['Oncology', 'Prostate', 'Assessment'] },
];

// ─── INVOICES ─────────────────────────────────────────────────────────────────
export const invoices: Invoice[] = [
  {
    id: 'inv1', invoiceNumber: 'INV-2026-0847', patientId: 'p1', patientName: 'Eleanor Whitfield',
    date: '2026-07-28', dueDate: '2026-08-28', status: 'paid', paymentMethod: 'insurance',
    services: [
      { description: 'Cardiology Consultation', quantity: 1, unitPrice: 350, total: 350 },
      { description: 'ECG Test', quantity: 1, unitPrice: 120, total: 120 },
      { description: 'CBC Lab Work', quantity: 1, unitPrice: 85, total: 85 },
    ],
    subtotal: 555, tax: 0, discount: 55, total: 500,
  },
  {
    id: 'inv2', invoiceNumber: 'INV-2026-0848', patientId: 'p2', patientName: 'Marcus T. Johnson',
    date: '2026-08-01', dueDate: '2026-09-01', status: 'pending',
    services: [
      { description: 'Neurology Consultation', quantity: 1, unitPrice: 420, total: 420 },
      { description: 'MRI Brain Scan', quantity: 1, unitPrice: 1200, total: 1200 },
    ],
    subtotal: 1620, tax: 162, discount: 0, total: 1782,
  },
  {
    id: 'inv3', invoiceNumber: 'INV-2026-0849', patientId: 'p4', patientName: 'Robert K. Chen',
    date: '2026-08-02', dueDate: '2026-09-02', status: 'partial',
    services: [
      { description: 'Oncology Consultation', quantity: 1, unitPrice: 400, total: 400 },
      { description: 'Hormonal Therapy (Month 3)', quantity: 1, unitPrice: 800, total: 800 },
      { description: 'Blood Tumor Markers Panel', quantity: 1, unitPrice: 280, total: 280 },
    ],
    subtotal: 1480, tax: 148, discount: 0, total: 1628,
  },
  {
    id: 'inv4', invoiceNumber: 'INV-2026-0846', patientId: 'p6', patientName: 'David Okonkwo',
    date: '2026-08-04', dueDate: '2026-09-04', status: 'overdue',
    services: [
      { description: 'Emergency Consultation', quantity: 1, unitPrice: 620, total: 620 },
      { description: 'Emergency Surgery', quantity: 1, unitPrice: 4200, total: 4200 },
      { description: 'ICU Stay (2 days)', quantity: 2, unitPrice: 800, total: 1600 },
    ],
    subtotal: 6420, tax: 0, discount: 420, total: 6000,
  },
  {
    id: 'inv5', invoiceNumber: 'INV-2026-0845', patientId: 'p3', patientName: 'Sophia Ramirez',
    date: '2026-06-15', dueDate: '2026-07-15', status: 'paid', paymentMethod: 'card',
    services: [
      { description: 'ACL Reconstruction Surgery', quantity: 1, unitPrice: 8500, total: 8500 },
      { description: 'Anesthesia', quantity: 1, unitPrice: 1200, total: 1200 },
      { description: 'Operating Room (4 hrs)', quantity: 4, unitPrice: 400, total: 1600 },
      { description: 'Post-op Physical Therapy', quantity: 1, unitPrice: 180, total: 180 },
    ],
    subtotal: 11480, tax: 0, discount: 1480, total: 10000,
  },
];

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const notifications: Notification[] = [
  { id: 'n1', type: 'danger', title: 'Emergency Admission', message: 'Patient David Okonkwo admitted via ER — Room ER-02', time: '12 min ago', read: false },
  { id: 'n2', type: 'warning', title: 'Invoice Overdue', message: 'Invoice INV-2026-0846 is overdue by 3 days', time: '1 hr ago', read: false },
  { id: 'n3', type: 'success', title: 'Lab Results Ready', message: 'CBC results for Eleanor Whitfield are available', time: '2 hrs ago', read: false },
  { id: 'n4', type: 'info', title: 'Dr. Torres on Leave', message: 'Dr. Michael Torres is on scheduled leave until Aug 10', time: '5 hrs ago', read: true },
  { id: 'n5', type: 'success', title: 'Payment Received', message: 'Invoice INV-2026-0847 paid via BlueCross BlueShield', time: 'Yesterday', read: true },
  { id: 'n6', type: 'info', title: 'System Maintenance', message: 'Scheduled maintenance tonight 2:00–4:00 AM EST', time: 'Yesterday', read: true },
];

// ─── CHART DATA ───────────────────────────────────────────────────────────────
export const revenueData: ChartDataPoint[] = [
  { name: 'Jan', value: 128000 }, { name: 'Feb', value: 142000 }, { name: 'Mar', value: 135000 },
  { name: 'Apr', value: 158000 }, { name: 'May', value: 149000 }, { name: 'Jun', value: 172000 },
  { name: 'Jul', value: 168000 }, { name: 'Aug', value: 185000 },
];

export const appointmentData: ChartDataPoint[] = [
  { name: 'Mon', value: 48, value2: 12 }, { name: 'Tue', value: 62, value2: 8 },
  { name: 'Wed', value: 55, value2: 15 }, { name: 'Thu', value: 71, value2: 6 },
  { name: 'Fri', value: 66, value2: 10 }, { name: 'Sat', value: 34, value2: 4 },
  { name: 'Sun', value: 18, value2: 2 },
];

export const patientGrowthData: ChartDataPoint[] = [
  { name: 'Jan', value: 1840 }, { name: 'Feb', value: 1920 }, { name: 'Mar', value: 1980 },
  { name: 'Apr', value: 2110 }, { name: 'May', value: 2240 }, { name: 'Jun', value: 2380 },
  { name: 'Jul', value: 2490 }, { name: 'Aug', value: 2614 },
];

export const departmentDistribution: ChartDataPoint[] = [
  { name: 'Cardiology', value: 22 }, { name: 'Neurology', value: 14 },
  { name: 'Orthopedics', value: 18 }, { name: 'Pediatrics', value: 24 },
  { name: 'Oncology', value: 10 }, { name: 'Emergency', value: 8 },
  { name: 'Other', value: 4 },
];

export const kpiSparklines = {
  patients: [48, 52, 49, 61, 58, 67, 72, 68, 74, 82, 78, 89],
  revenue: [12, 18, 14, 22, 19, 28, 24, 31, 27, 35, 32, 41],
  appointments: [8, 12, 10, 15, 13, 18, 16, 20, 18, 24, 22, 28],
  emergency: [2, 4, 3, 5, 4, 6, 5, 7, 6, 8, 5, 9],
};
