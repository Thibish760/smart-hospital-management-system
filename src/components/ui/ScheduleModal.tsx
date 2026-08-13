import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { patientsService, doctorsService, appointmentsService } from '../../lib/firebaseService';
import { getTodayISODate } from '../../lib/utils';
import type { Patient, Doctor, Appointment } from '../../types';

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  initialDoctorId?: string;
  initialPatientId?: string;
  onSuccess?: () => void;
}

const APPOINTMENT_TYPES: Appointment['type'][] = [
  'consultation',
  'follow-up',
  'checkup',
  'emergency',
  'procedure',
];

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM',
];

export function ScheduleModal({ open, onClose, initialDoctorId, initialPatientId, onSuccess }: ScheduleModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [saving, setSaving] = useState(false);

  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || '');
  const [customPatientName, setCustomPatientName] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId || '');
  const [department, setDepartment] = useState('');
  const [date, setDate] = useState(getTodayISODate());
  const [time, setTime] = useState('09:00 AM');
  const [type, setType] = useState<Appointment['type']>('consultation');
  const [room, setRoom] = useState('C-104');
  const [fee, setFee] = useState('1500');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const unsubPatients = patientsService.subscribe(setPatients);
    const unsubDoctors = doctorsService.subscribe(setDoctors);
    return () => {
      unsubPatients();
      unsubDoctors();
    };
  }, []);

  useEffect(() => {
    if (open) {
      if (initialDoctorId) {
        setSelectedDoctorId(initialDoctorId);
        const doc = doctors.find(d => d.id === initialDoctorId);
        if (doc) {
          setDepartment(doc.department);
          setFee(doc.consultationFee.toString());
        }
      } else if (doctors.length > 0) {
        const doc = doctors.find(d => d.id === selectedDoctorId) || doctors[0];
        setSelectedDoctorId(doc.id);
        setDepartment(doc.department);
        setFee(doc.consultationFee.toString());
      }

      if (initialPatientId) {
        setSelectedPatientId(initialPatientId);
      } else if (patients.length > 0) {
        const pat = patients.find(p => p.id === selectedPatientId) || patients[0];
        setSelectedPatientId(pat.id);
      }
    }
  }, [open, initialDoctorId, initialPatientId, doctors, patients]);

  const handleDoctorChange = (docId: string) => {
    setSelectedDoctorId(docId);
    const doc = doctors.find(d => d.id === docId);
    if (doc) {
      setDepartment(doc.department);
      setFee(doc.consultationFee.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let patName = customPatientName.trim();
    let patId = selectedPatientId;
    let patAvatar: string | undefined = undefined;

    if (selectedPatientId !== 'custom') {
      const pat = patients.find(p => p.id === selectedPatientId);
      if (pat) {
        patName = pat.name;
        patId = pat.id;
        patAvatar = pat.avatar;
      }
    }

    if (!patName) {
      patName = 'Patient ' + Math.floor(Math.random() * 1000);
    }

    const doc = doctors.find(d => d.id === selectedDoctorId);
    const docName = doc ? doc.name : 'Dr. General Specialist';
    const deptName = department || (doc ? doc.department : 'General Medicine');

    try {
      await appointmentsService.add({
        patientId: patId || 'p_new',
        patientName: patName,
        patientAvatar: patAvatar,
        doctorId: selectedDoctorId || 'd_gen',
        doctorName: docName,
        department: deptName,
        date: date || '2026-08-05',
        time: time || '09:00 AM',
        duration: 30,
        type: type,
        status: 'pending',
        notes: notes || undefined,
        fee: Number(fee) || 1500,
        room: room || 'C-104',
      });

      setSaving(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule Appointment"
      subtitle="Book a new patient appointment with a specialist"
      size="lg"
      footer={
        <>
          <button className="btn-secondary text-xs sm:text-sm !py-1.5 !px-3" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="btn-primary text-xs sm:text-sm !py-1.5 !px-3" form="schedule-appointment-form" type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Scheduling…
              </>
            ) : (
              'Confirm Schedule'
            )}
          </button>
        </>
      }
    >
      <form id="schedule-appointment-form" onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {/* Patient Selection */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-semibold text-heading">Select Patient *</label>
            <select
              className="input-base"
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.mrn} — {p.department})
                </option>
              ))}
              <option value="custom">+ Enter Custom Patient Name</option>
            </select>
          </div>

          {selectedPatientId === 'custom' && (
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-heading">Patient Name *</label>
              <input
                className="input-base"
                required
                placeholder="e.g. John Doe"
                value={customPatientName}
                onChange={e => setCustomPatientName(e.target.value)}
              />
            </div>
          )}

          {/* Doctor Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Doctor *</label>
            <select
              className="input-base"
              value={selectedDoctorId}
              onChange={e => handleDoctorChange(e.target.value)}
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialty})
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Department</label>
            <input
              className="input-base bg-background/50"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="e.g. Cardiology"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Date *</label>
            <input
              type="date"
              className="input-base"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Time Slot *</label>
            <select className="input-base" value={time} onChange={e => setTime(e.target.value)}>
              {TIME_SLOTS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Appointment Type</label>
            <select
              className="input-base capitalize"
              value={type}
              onChange={e => setType(e.target.value as Appointment['type'])}
            >
              {APPOINTMENT_TYPES.map(t => (
                <option key={t} value={t} className="capitalize">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Room / Office</label>
            <input
              className="input-base"
              placeholder="e.g. C-104"
              value={room}
              onChange={e => setRoom(e.target.value)}
            />
          </div>

          {/* Fee */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-heading">Consultation Fee (₹)</label>
            <input
              type="number"
              className="input-base"
              placeholder="1500"
              value={fee}
              onChange={e => setFee(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-semibold text-heading">Notes / Symptom Description</label>
            <textarea
              className="input-base min-h-[70px]"
              placeholder="e.g. Routine cardiac checkup and BP review"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
