import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Printer,
  CalendarCheck,
  Building,
  Lock,
  ShieldCheck,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { DepartmentId, Doctor, Appointment } from '../types';
import { DEPARTMENTS, DOCTORS } from '../data/mockData';
import {
  getUserStoredAppointments,
  saveUserStoredAppointments,
  getAvailableSlots
} from '../utils/appointmentStorage';
import { useAuth } from '../contexts/AuthContext';
import {
  saveAppointmentToFirestore,
  fetchUserAppointments,
  cancelAppointmentInFirestore,
  fetchDoctorBookedSlots
} from '../services/firestoreService';

interface AppointmentsSectionProps {
  initialDepartmentId?: DepartmentId;
  initialDoctor?: Doctor | null;
  onClearInitialDoctor?: () => void;
  onRequireSignIn?: () => void;
}

export const AppointmentsSection: React.FC<AppointmentsSectionProps> = ({
  initialDepartmentId,
  initialDoctor,
  onClearInitialDoctor,
  onRequireSignIn
}) => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'book' | 'manage'>('book');

  // Form states with default Indian phone format (+91)
  const [patientName, setPatientName] = useState(user?.displayName || '');
  const [age, setAge] = useState<string>('');
  const [contactNumber, setContactNumber] = useState(user?.phone || '+91 ');
  const [email, setEmail] = useState(user?.email || '');
  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentId>(
    initialDepartmentId || (initialDoctor?.departmentId as DepartmentId) || 'cardiology'
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    initialDoctor?.id || ''
  );

  // Synchronize form defaults with user profile when logged in
  useEffect(() => {
    if (user) {
      if (!patientName && user.displayName) setPatientName(user.displayName);
      if (!email && user.email) setEmail(user.email);
      if (user.phone && user.phone.trim()) {
        setContactNumber(user.phone);
      } else if (!contactNumber || contactNumber.trim() === '') {
        setContactNumber('+91 ');
      }
    }
  }, [user]);

  // Default date to tomorrow
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [appointmentDate, setAppointmentDate] = useState<string>(getTomorrowDate());
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [reason, setReason] = useState('');

  // UI feedback states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // User-only appointments list for Manage tab
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [manageSearch, setManageSearch] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Cancellation Modal State (replaces window.confirm to guarantee workability in iframes)
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Real-time doctor booked slots (anonymous slot markers, zero patient PII)
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // Synchronize when initialDoctor or initialDepartmentId changes
  useEffect(() => {
    if (initialDoctor) {
      setSelectedDeptId(initialDoctor.departmentId);
      setSelectedDoctorId(initialDoctor.id);
      setActiveSubTab('book');
    } else if (initialDepartmentId) {
      setSelectedDeptId(initialDepartmentId);
    }
  }, [initialDoctor, initialDepartmentId]);

  // Query doctor booked slots to prevent scheduling conflicts
  useEffect(() => {
    let isMounted = true;
    if (selectedDoctorId && appointmentDate) {
      fetchDoctorBookedSlots(selectedDoctorId, appointmentDate).then((slots) => {
        if (isMounted) setBookedSlots(slots);
      });
    } else {
      setBookedSlots([]);
    }
    return () => {
      isMounted = false;
    };
  }, [selectedDoctorId, appointmentDate]);

  // Load ONLY appointments belonging to the currently authenticated user
  const refreshAppointments = async () => {
    if (!user) {
      setAppointmentsList([]);
      return;
    }
    setIsLoadingAppointments(true);
    try {
      // Backend query strictly filtered by auth user's UID
      const firestoreList = await fetchUserAppointments(user.userId);
      // Double check client filter: only appointments matching current user's userId
      const userOnly = firestoreList.filter((a) => a.userId === user.userId);
      setAppointmentsList(userOnly);
      saveUserStoredAppointments(user.userId, userOnly);
    } catch (err) {
      console.error('Error fetching user appointments from Firestore:', err);
      // Fallback to user-isolated cached appointments only
      const cached = getUserStoredAppointments(user.userId);
      setAppointmentsList(cached);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshAppointments();
    } else {
      setAppointmentsList([]);
    }
  }, [user]);

  // Filter doctors by selected department
  const availableDoctors = useMemo(() => {
    return DOCTORS.filter((d) => d.departmentId === selectedDeptId);
  }, [selectedDeptId]);

  // Auto-select first doctor in department if current selected is invalid
  useEffect(() => {
    if (availableDoctors.length > 0) {
      const exists = availableDoctors.some((d) => d.id === selectedDoctorId);
      if (!exists) {
        setSelectedDoctorId(availableDoctors[0].id);
      }
    } else {
      setSelectedDoctorId('');
    }
  }, [selectedDeptId, availableDoctors, selectedDoctorId]);

  // Available slots for currently selected doctor & date, excluding booked slots
  const availableSlots = useMemo(() => {
    if (!selectedDoctorId || !appointmentDate) return [];
    return getAvailableSlots(selectedDoctorId, appointmentDate, bookedSlots);
  }, [selectedDoctorId, appointmentDate, bookedSlots]);

  // Reset selected slot if not in available slots
  useEffect(() => {
    if (availableSlots.length > 0 && !availableSlots.includes(selectedSlot)) {
      setSelectedSlot(availableSlots[0]);
    } else if (availableSlots.length === 0) {
      setSelectedSlot('');
    }
  }, [availableSlots, selectedSlot]);

  // Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!patientName.trim()) {
      errs.patientName = 'Patient full name is required.';
    }

    const numAge = parseInt(age, 10);
    if (!age || isNaN(numAge) || numAge < 1 || numAge > 120) {
      errs.age = 'Please enter a valid age (1-120).';
    }

    const digitsOnly = contactNumber.replace(/[^0-9]/g, '');
    if (!contactNumber.trim() || contactNumber.trim() === '+91') {
      errs.contactNumber = 'Contact phone number is required.';
    } else if (digitsOnly.length < 10) {
      errs.contactNumber = 'Please enter a valid phone number with +91 (min 10 digits).';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required for confirmation.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please provide a valid email format (e.g. name@domain.com).';
    }

    if (!selectedDoctorId) {
      errs.doctorId = 'Please select an attending doctor.';
    }

    if (!appointmentDate) {
      errs.date = 'Please select a valid consultation date.';
    }

    if (!selectedSlot) {
      errs.slot = 'Please select an available consultation time slot.';
    }

    if (!reason.trim()) {
      errs.reason = 'Please provide a brief reason for visit.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!user) {
      setGeneralError('Please sign in or create an account before completing your appointment booking.');
      if (onRequireSignIn) onRequireSignIn();
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const doc = DOCTORS.find((d) => d.id === selectedDoctorId);
    const dept = DEPARTMENTS.find((d) => d.id === selectedDeptId);

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newAppointmentPayload = {
      id: `CH-2026-${randomNum}`,
      patientName: patientName.trim(),
      age: parseInt(age, 10),
      contactNumber: contactNumber.trim(),
      email: email.trim(),
      departmentId: selectedDeptId,
      departmentName: dept ? dept.name : 'General Care',
      doctorId: selectedDoctorId,
      doctorName: doc ? doc.name : 'Staff Physician',
      date: appointmentDate,
      timeSlot: selectedSlot,
      reason: reason.trim(),
      status: 'Confirmed' as const,
      createdAt: new Date().toISOString()
    };

    // Save strictly to backend Firestore; the owner ID is enforced on the backend session
    const res = await saveAppointmentToFirestore(newAppointmentPayload);
    setIsSubmitting(false);

    if (res.success && res.appointment) {
      setConfirmedBooking(res.appointment);
      await refreshAppointments();
      if (onClearInitialDoctor) onClearInitialDoctor();
    } else {
      setGeneralError(res.error || 'Failed to complete appointment booking. Please try another slot.');
    }
  };

  // Trigger modal cancellation confirmation (replaces window.confirm)
  const handleInitiateCancel = (appointment: Appointment) => {
    if (!user) {
      if (onRequireSignIn) onRequireSignIn();
      return;
    }
    setGeneralError(null);
    setActionSuccessMessage(null);
    setAppointmentToCancel(appointment);
  };

  // Perform cancellation once user confirms in the modal
  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel || !user) return;
    setIsCancelling(true);
    setGeneralError(null);

    try {
      const res = await cancelAppointmentInFirestore(appointmentToCancel.id, user.userId);
      if (res.success) {
        // Optimistically update appointment status in local list immediately
        setAppointmentsList((prev) =>
          prev.map((a) =>
            a.id === appointmentToCancel.id ? { ...a, status: 'Cancelled' as const } : a
          )
        );
        setActionSuccessMessage(`Appointment ${appointmentToCancel.id} has been successfully cancelled.`);
        setAppointmentToCancel(null);
        await refreshAppointments();
        setTimeout(() => setActionSuccessMessage(null), 5000);
      } else {
        setGeneralError(res.error || 'Failed to cancel appointment. Please try again.');
        setAppointmentToCancel(null);
      }
    } catch (err: any) {
      console.error('Cancellation error:', err);
      setGeneralError('Failed to cancel appointment. Please try again.');
      setAppointmentToCancel(null);
    } finally {
      setIsCancelling(false);
    }
  };

  const resetFormForNewBooking = () => {
    setConfirmedBooking(null);
    setGeneralError(null);
    setReason('');
  };

  // Filtered appointments for manage tab — STRICTLY applied to current user's appointments
  const filteredAppointments = useMemo(() => {
    return appointmentsList.filter((a) => {
      // Security guard: must match logged-in user
      if (user && a.userId !== user.userId) return false;
      const q = manageSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        a.id.toLowerCase().includes(q) ||
        a.patientName.toLowerCase().includes(q) ||
        a.contactNumber.includes(q) ||
        a.doctorName.toLowerCase().includes(q) ||
        a.departmentName.toLowerCase().includes(q)
      );
    });
  }, [appointmentsList, manageSearch, user]);

  const selectedDoctorObj = DOCTORS.find((d) => d.id === selectedDoctorId);

  return (
    <div className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-semibold text-cyan-800 uppercase tracking-wider">
            Online Scheduling · East Bandra, Mumbai 400051
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Consultation & Appointment Booking
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Book an in-person clinical visit with a City Hospital specialist in East Bandra, Mumbai. Real-time availability, instant confirmation, and confidential patient records.
          </p>

          {/* User Sign In Status Indicator */}
          {user ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-cyan-700" />
              <span>
                Signed in as <strong>{user.displayName || user.email}</strong> · Appointments are confidential & encrypted
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Sign in is required to complete appointment reservations.{' '}
                <button
                  type="button"
                  onClick={onRequireSignIn}
                  className="font-bold underline hover:text-amber-950 cursor-pointer"
                >
                  Sign in here
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center justify-center">
          <div className="p-1 bg-slate-200/80 rounded-xl inline-flex gap-1">
            <button
              onClick={() => {
                setActiveSubTab('book');
                setGeneralError(null);
              }}
              className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'book'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Book New Appointment
            </button>
            <button
              onClick={() => {
                setActiveSubTab('manage');
                if (user) refreshAppointments();
              }}
              className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'manage'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-cyan-700" />
              <span>My Appointments {user ? `(${appointmentsList.length})` : ''}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: BOOKING FORM OR CONFIRMATION SCREEN */}
        {activeSubTab === 'book' && (
          <div>
            {confirmedBooking ? (
              /* Success Confirmation Card */
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-emerald-200 shadow-lg space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 block">
                      Booking Confirmed & Saved
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Appointment Scheduled Successfully
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Your consultation ID has been saved to your secure patient account in the hospital database.
                    </p>
                  </div>
                </div>

                {/* Printable Ticket Box */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 print:border-black">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">APPOINTMENT ID</span>
                      <span className="text-lg font-mono font-bold text-cyan-800">
                        {confirmedBooking.id}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {confirmedBooking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Patient Name:</span>
                      <strong className="text-slate-900 text-sm">{confirmedBooking.patientName}</strong>
                      <span className="text-slate-500 block text-[11px]">Age: {confirmedBooking.age} yrs</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Doctor / Specialist:</span>
                      <strong className="text-slate-900 text-sm">{confirmedBooking.doctorName}</strong>
                      <span className="text-cyan-700 block text-[11px]">{confirmedBooking.departmentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Scheduled Time:</span>
                      <strong className="text-slate-900 text-sm">{confirmedBooking.timeSlot}</strong>
                      <span className="text-slate-700 block text-[11px] font-medium">{confirmedBooking.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Contact Phone:</span>
                      <span className="text-slate-800 font-medium">{confirmedBooking.contactNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Email:</span>
                      <span className="text-slate-800 font-medium">{confirmedBooking.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Hospital Location:</span>
                      <span className="text-slate-800">East Bandra, Mumbai, India 400051</span>
                    </div>
                    <div className="sm:col-span-2 md:col-span-3">
                      <span className="text-slate-500 block">Reason for Visit:</span>
                      <span className="text-slate-800">{confirmedBooking.reason}</span>
                    </div>
                  </div>
                </div>

                {/* Confirmation Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>Print Appointment Slip</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setActiveSubTab('manage');
                        refreshAppointments();
                      }}
                      className="px-4 py-2.5 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors cursor-pointer"
                    >
                      View My Appointments
                    </button>
                    <button
                      onClick={resetFormForNewBooking}
                      className="px-4 py-2.5 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg transition-colors cursor-pointer"
                    >
                      Book Another Visit
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <form
                onSubmit={handleBookingSubmit}
                className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6"
              >
                {generalError && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Booking Alert:</strong> {generalError}
                    </div>
                  </div>
                )}

                {/* Section 1: Department & Doctor Selection */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Building className="w-4 h-4 text-cyan-700" />
                    <span>1. Select Clinical Specialty & Doctor</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Department Dropdown */}
                    <div>
                      <label htmlFor="booking-department" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Department *
                      </label>
                      <select
                        id="booking-department"
                        value={selectedDeptId}
                        onChange={(e) => {
                          setSelectedDeptId(e.target.value as DepartmentId);
                        }}
                        className="w-full p-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} ({dept.location})
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Doctor list updates automatically when department changes.
                      </p>
                    </div>

                    {/* Doctor Dropdown */}
                    <div>
                      <label htmlFor="booking-doctor" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Attending Doctor *
                      </label>
                      <select
                        id="booking-doctor"
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className={`w-full p-2.5 text-xs sm:text-sm bg-white border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                          errors.doctorId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                        }`}
                      >
                        {availableDoctors.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} — {doc.specialization} ({doc.experienceYears}y exp)
                          </option>
                        ))}
                      </select>
                      {errors.doctorId && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.doctorId}</p>
                      )}
                    </div>
                  </div>

                  {/* Doctor preview strip */}
                  {selectedDoctorObj && (
                    <div className="mt-3 p-3 rounded-xl bg-cyan-50/60 border border-cyan-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedDoctorObj.photo}
                          alt={selectedDoctorObj.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-xs"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <p className="font-bold text-slate-900">{selectedDoctorObj.name}</p>
                          <p className="text-cyan-800 text-[11px]">{selectedDoctorObj.specialization}</p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 hidden sm:block">
                        <p>{selectedDoctorObj.room} · East Bandra Campus</p>
                        <p className="font-semibold text-slate-700">Days: {selectedDoctorObj.consultationDays.join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Date & Available Time Slot */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-700" />
                    <span>2. Date & Time Slot (Real-time Availability)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Date Picker */}
                    <div className="md:col-span-5">
                      <label htmlFor="booking-date" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Consultation Date *
                      </label>
                      <input
                        id="booking-date"
                        type="date"
                        min={getTomorrowDate()}
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className={`w-full p-2.5 text-xs sm:text-sm bg-white border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                          errors.date ? 'border-rose-400' : 'border-slate-300'
                        }`}
                      />
                      {errors.date && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.date}</p>
                      )}
                    </div>

                    {/* Available Slot Picker */}
                    <div className="md:col-span-7">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Available Time Slots on {appointmentDate || 'Selected Date'} *
                      </label>

                      {availableSlots.length === 0 ? (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                          All regular consultation slots for this doctor on {appointmentDate} are fully booked. Please choose another date or an alternative specialist.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {availableSlots.map((slot) => {
                            const isSelected = selectedSlot === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedSlot(slot)}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-cyan-700 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {errors.slot && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.slot}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Patient Information */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-700" />
                    <span>3. Patient Details & Consultation Reason</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Patient Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Patient Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className={`w-full p-2.5 text-xs sm:text-sm bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                          errors.patientName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                        }`}
                      />
                      {errors.patientName && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.patientName}</p>
                      )}
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Age (Years) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        placeholder="e.g. 35"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className={`w-full p-2.5 text-xs sm:text-sm bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                          errors.age ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                        }`}
                      />
                      {errors.age && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.age}</p>
                      )}
                    </div>

                    {/* Contact Number with default +91 */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Contact Phone (+91 Default) *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98200 12345"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        onFocus={() => {
                          if (!contactNumber.trim()) {
                            setContactNumber('+91 ');
                          }
                        }}
                        className={`w-full p-2.5 text-xs sm:text-sm bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                          errors.contactNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                        }`}
                      />
                      {errors.contactNumber && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.contactNumber}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="patient@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full p-2.5 text-xs sm:text-sm bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                          errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>
                      )}
                    </div>

                    {/* Reason for Visit */}
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Reason for Visit / Symptoms *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Briefly describe your symptoms, primary health concern, or previous lab test context..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className={`w-full p-2.5 text-xs sm:text-sm bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                          errors.reason ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                        }`}
                      />
                      {errors.reason && (
                        <p className="text-[11px] text-rose-600 mt-1">{errors.reason}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-500">
                    Appointments are verified in real time and encrypted in your City Hospital patient portal. Location: East Bandra, Mumbai 400051.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting || availableSlots.length === 0}
                    className="w-full sm:w-auto px-7 py-3 text-sm font-semibold text-white bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-400 rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
                  >
                    {isSubmitting ? 'Confirming with Hospital...' : 'Confirm Appointment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: MANAGE & SEARCH BOOKINGS (STRICT USER PRIVACY) */}
        {activeSubTab === 'manage' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            {!user ? (
              /* Unauthenticated Gate */
              <div className="p-10 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Protected Patient Portal</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Hospital appointment records contain private health information and are strictly restricted to authenticated patients.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onRequireSignIn}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Sign In to View My Appointments
                  </button>
                </div>
              </div>
            ) : (
              /* Authenticated User Appointments */
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      My Scheduled Appointments
                    </h3>
                    <p className="text-xs text-slate-500">
                      Review details or cancel appointments booked under your patient account at City Hospital, East Bandra, Mumbai.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Search filter */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search your appointments..."
                        value={manageSearch}
                        onChange={(e) => setManageSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <button
                      onClick={refreshAppointments}
                      disabled={isLoadingAppointments}
                      className="p-2 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Refresh Appointments"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAppointments ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {actionSuccessMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{actionSuccessMessage}</span>
                  </div>
                )}

                {generalError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{generalError}</span>
                  </div>
                )}

                {isLoadingAppointments ? (
                  <div className="p-10 text-center text-xs text-slate-400">
                    Loading your appointments...
                  </div>
                ) : appointmentsList.length === 0 ? (
                  /* User has no appointments */
                  <div className="p-10 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">
                      You haven't booked any appointments yet
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Schedule an in-person consultation with any of our clinical specialists across 10 hospital departments.
                    </p>
                    <button
                      onClick={() => setActiveSubTab('book')}
                      className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg transition-colors cursor-pointer"
                    >
                      Book an Appointment
                    </button>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  /* Search yielded no matches */
                  <div className="p-10 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <p className="text-sm font-semibold text-slate-700">No matching appointments found</p>
                    <p className="text-xs text-slate-500">
                      No appointments in your account match "{manageSearch}".
                    </p>
                    <button
                      onClick={() => setManageSearch('')}
                      className="mt-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Clear Search Filter
                    </button>
                  </div>
                ) : (
                  /* User's appointment cards */
                  <div className="space-y-3">
                    {filteredAppointments.map((appt) => {
                      const isCancelled = appt.status === 'Cancelled';
                      const isCompleted = appt.status === 'Completed';
                      const canCancel = !isCancelled && !isCompleted;

                      return (
                        <div
                          key={appt.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isCancelled
                              ? 'bg-slate-50/60 border-slate-200 opacity-75'
                              : 'bg-white border-slate-200 hover:border-cyan-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-cyan-800">
                                  {appt.id}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    isCancelled
                                      ? 'bg-slate-200 text-slate-600'
                                      : isCompleted
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  }`}
                                >
                                  {appt.status}
                                </span>
                                <span className="text-[11px] text-slate-400">·</span>
                                <span className="text-xs font-medium text-slate-700">
                                  {appt.departmentName}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-slate-900">
                                {appt.patientName} ({appt.age} yrs)
                              </h4>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span>
                                  Doctor: <strong className="text-slate-800">{appt.doctorName}</strong>
                                </span>
                                <span>·</span>
                                <span className="flex items-center gap-1 font-semibold text-cyan-900">
                                  <Clock className="w-3.5 h-3.5 text-cyan-700" />
                                  {appt.date} at {appt.timeSlot}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                                <span>Phone: <strong className="text-slate-700">{appt.contactNumber}</strong></span>
                                <span>·</span>
                                <span>Location: East Bandra, Mumbai 400051</span>
                              </div>

                              <p className="text-xs text-slate-600 italic pt-1">
                                Reason: {appt.reason}
                              </p>
                            </div>

                            {/* Cancellation Action - fully workable button that triggers custom in-app confirmation modal */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              {canCancel ? (
                                <button
                                  type="button"
                                  onClick={() => handleInitiateCancel(appt)}
                                  className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                                  title="Cancel this appointment"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Cancel Appointment</span>
                                </button>
                              ) : isCancelled ? (
                                <span className="text-xs text-slate-400 font-medium italic px-2 py-0.5 bg-slate-100 rounded-md">
                                  Cancelled
                                </span>
                              ) : isCompleted ? (
                                <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-md">
                                  Completed
                                </span>
                              ) : null}

                              <span className="text-[10px] text-slate-400 font-mono">
                                Booked: {new Date(appt.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* In-app Confirmation Dialog for Appointment Cancellation (replaces window.confirm) */}
      {appointmentToCancel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="cancel-dialog-title" className="text-base font-bold text-slate-900">
                    Cancel Appointment
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Are you sure you want to cancel this appointment?
                  </p>
                </div>
              </div>

              {/* Appointment summary box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[11px] text-slate-500 font-medium">APPOINTMENT ID</span>
                  <span className="font-mono font-bold text-cyan-800">{appointmentToCancel.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Doctor:</span>
                    <strong className="text-slate-800">{appointmentToCancel.doctorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Specialty:</span>
                    <span className="text-slate-700">{appointmentToCancel.departmentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Schedule:</span>
                    <span className="font-semibold text-cyan-900">
                      {appointmentToCancel.date} at {appointmentToCancel.timeSlot}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Patient:</span>
                    <span className="text-slate-800">{appointmentToCancel.patientName}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                This consultation slot will be released back to City Hospital scheduling so other patients in East Bandra, Mumbai can book.
              </p>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setAppointmentToCancel(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={confirmCancelAppointment}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                >
                  {isCancelling ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Yes, Cancel Appointment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
