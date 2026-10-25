import React, { useState, useEffect } from 'react';
import {
  User,
  Calendar,
  FileText,
  Clock,
  MapPin,
  Trash2,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Sparkles,
  Settings,
  Phone,
  Mail,
  ShieldCheck,
  CalendarPlus,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Appointment, LabAnalysisReport } from '../types';
import {
  fetchUserAppointments,
  cancelAppointmentInFirestore,
  fetchUserLabReports,
  deleteLabReportFromFirestore
} from '../services/firestoreService';

interface DashboardSectionProps {
  onStartNewLabAnalysis: () => void;
  onBookNewAppointment: () => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  onStartNewLabAnalysis,
  onBookNewAppointment
}) => {
  const { user, firebaseUser, signOut, updateProfileData } = useAuth();

  const [activeTab, setActiveTab] = useState<'appointments' | 'reports' | 'profile'>('appointments');

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppts, setIsLoadingAppts] = useState<boolean>(true);

  // Lab Reports State
  const [labReports, setLabReports] = useState<LabAnalysisReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(true);
  const [selectedReportDetail, setSelectedReportDetail] = useState<LabAnalysisReport | null>(null);

  // Profile Edit State
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '+91 ');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Cancellation Modal state
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [isCancellingAppt, setIsCancellingAppt] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.displayName);
      setEditPhone(user.phone || '+91 ');
    }
  }, [user]);

  // Load user data from Firestore
  const loadAppointments = async () => {
    if (!firebaseUser) return;
    setIsLoadingAppts(true);
    try {
      const list = await fetchUserAppointments(firebaseUser.uid);
      setAppointments(list);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoadingAppts(false);
    }
  };

  const loadLabReports = async () => {
    if (!firebaseUser) return;
    setIsLoadingReports(true);
    try {
      const reports = await fetchUserLabReports(firebaseUser.uid);
      setLabReports(reports);
    } catch (err) {
      console.error('Error fetching lab reports:', err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    if (firebaseUser) {
      loadAppointments();
      loadLabReports();
    }
  }, [firebaseUser]);

  const handleInitiateCancel = (appt: Appointment) => {
    setActionMessage(null);
    setAppointmentToCancel(appt);
  };

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel || !firebaseUser) return;
    setIsCancellingAppt(true);
    try {
      const res = await cancelAppointmentInFirestore(appointmentToCancel.id, firebaseUser.uid);
      if (res.success) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appointmentToCancel.id ? { ...a, status: 'Cancelled' as const } : a
          )
        );
        setActionMessage(`Appointment ${appointmentToCancel.id} has been successfully cancelled.`);
        setAppointmentToCancel(null);
        await loadAppointments();
        setTimeout(() => setActionMessage(null), 5000);
      } else {
        setActionMessage(res.error || 'Failed to cancel appointment. Please try again.');
        setAppointmentToCancel(null);
      }
    } catch (err: any) {
      console.error('Cancellation error:', err);
      setActionMessage('Failed to cancel appointment. Please try again.');
      setAppointmentToCancel(null);
    } finally {
      setIsCancellingAppt(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!firebaseUser) return;
    if (window.confirm('Permanently remove this saved lab report from your medical account history?')) {
      const res = await deleteLabReportFromFirestore(reportId, firebaseUser.uid);
      if (res.success) {
        setActionMessage('Lab report removed from your account history.');
        if (selectedReportDetail?.id === reportId) {
          setSelectedReportDetail(null);
        }
        loadLabReports();
        setTimeout(() => setActionMessage(null), 4000);
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfileData(editName, editPhone);
    if (res.success) {
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 4000);
    }
  };

  if (!firebaseUser) {
    return null;
  }

  return (
    <div className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Hero Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-600/80 border border-cyan-400/40 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-sm">
              {user?.displayName ? user.displayName.charAt(0) : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                  Patient Health Portal
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-slate-300">Firebase Encrypted</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {user?.displayName || 'Patient'}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {user?.email} {user?.phone ? `· ${user.phone}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onBookNewAppointment}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-cyan-700" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={onStartNewLabAnalysis}
              className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze Lab Report</span>
            </button>

            <button
              onClick={() => signOut()}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4 text-rose-300" />
            </button>
          </div>
        </div>

        {/* Action feedback */}
        {actionMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Dashboard Nav Segments */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'appointments'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Appointments ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Saved Lab Reports ({labReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Account Settings</span>
          </button>
        </div>

        {/* TAB 1: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Scheduled Consultations & Visit History
                </h3>
                <p className="text-xs text-slate-500">
                  Backed securely by City Hospital Firestore Cloud database.
                </p>
              </div>

              <button
                onClick={loadAppointments}
                disabled={isLoadingAppts}
                className="text-xs text-cyan-700 hover:text-cyan-900 flex items-center gap-1 cursor-pointer font-medium"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAppts ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {isLoadingAppts ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Loading your appointments...
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-10 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">You haven't booked any appointments yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Schedule an in-person consultation with any of our 24+ specialists across 10 hospital departments.
                </p>
                <button
                  onClick={onBookNewAppointment}
                  className="px-4 py-2 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg transition-colors cursor-pointer"
                >
                  Book an Appointment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appt) => {
                  const isCancelled = appt.status === 'Cancelled';
                  return (
                    <div
                      key={appt.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCancelled
                          ? 'bg-slate-50/60 border-slate-200 opacity-75'
                          : 'bg-white border-slate-200 hover:border-cyan-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-cyan-800">
                              {appt.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                isCancelled
                                  ? 'bg-slate-200 text-slate-600'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {appt.status}
                            </span>
                            <span className="text-[11px] text-slate-400">·</span>
                            <span className="text-xs font-semibold text-slate-800">
                              {appt.departmentName}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900">
                            Patient: {appt.patientName} ({appt.age} yrs)
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span>Doctor: <strong className="text-slate-800">{appt.doctorName}</strong></span>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-semibold text-cyan-900">
                              <Clock className="w-3.5 h-3.5 text-cyan-700" />
                              {appt.date} at {appt.timeSlot}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 italic pt-0.5">
                            Reason: {appt.reason}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {appt.status === 'Confirmed' ? (
                            <button
                              type="button"
                              onClick={() => handleInitiateCancel(appt)}
                              className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel Booking</span>
                            </button>
                          ) : isCancelled ? (
                            <span className="text-xs text-slate-400 italic">
                              Cancelled
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-600 font-medium">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED LAB REPORTS */}
        {activeTab === 'reports' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Consensually Saved Lab Report Summaries
                </h3>
                <p className="text-xs text-slate-500">
                  Private to your account. Sensitive health entries are only saved when explicitly requested.
                </p>
              </div>

              <button
                onClick={loadLabReports}
                disabled={isLoadingReports}
                className="text-xs text-cyan-700 hover:text-cyan-900 flex items-center gap-1 cursor-pointer font-medium"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReports ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {isLoadingReports ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Loading saved reports...
              </div>
            ) : labReports.length === 0 ? (
              <div className="p-10 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No saved lab reports</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Run our Lab Report Analyzer and choose the "Save to My Private Medical History" option to archive your reports.
                </p>
                <button
                  onClick={onStartNewLabAnalysis}
                  className="px-4 py-2 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg transition-colors cursor-pointer"
                >
                  Analyze a Lab Report Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {labReports.map((rpt) => (
                  <div
                    key={rpt.id}
                    className="p-5 rounded-xl border border-slate-200 hover:border-cyan-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                            {rpt.id}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-600 font-medium">
                            {rpt.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Patient: {rpt.patientSex === 'female' ? 'Female' : 'Male'}, {rpt.patientAge} Years Old
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-semibold ${
                            rpt.abnormalCount > 0
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {rpt.abnormalCount > 0 ? `${rpt.abnormalCount} Flagged Abnormal` : 'All Within Range'}
                        </span>

                        <button
                          onClick={() => handleDeleteReport(rpt.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                          title="Delete saved report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Report Parameters Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {rpt.analyzedItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-100"
                        >
                          <span className="text-[10px] text-slate-500 block truncate">
                            {item.name}
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {item.value} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>

                    {rpt.multiMarkerInsights.length > 0 && (
                      <div className="p-3 bg-cyan-50/60 rounded-lg border border-cyan-100 text-xs text-cyan-950">
                        <strong className="block mb-1 text-[11px] uppercase tracking-wider">Key Insight:</strong>
                        <p>{rpt.multiMarkerInsights[0]}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACCOUNT PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 max-w-2xl">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Account Profile & Settings
              </h3>
              <p className="text-xs text-slate-500">
                Update your contact details for appointment communications.
              </p>
            </div>

            {profileSaveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Profile details saved successfully.</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Primary Account Login)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Email authentication is linked to your Firebase user identity.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 98200 12345"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* In-app Confirmation Dialog for Dashboard Appointment Cancellation */}
      {appointmentToCancel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Cancel Appointment
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Are you sure you want to cancel this appointment?
                  </p>
                </div>
              </div>

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
                    <span className="text-slate-500 block">Department:</span>
                    <span className="text-slate-700">{appointmentToCancel.departmentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Schedule:</span>
                    <span className="font-semibold text-cyan-900">
                      {appointmentToCancel.date} at {appointmentToCancel.timeSlot}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Location:</span>
                    <span className="text-slate-700">East Bandra, Mumbai 400051</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isCancellingAppt}
                  onClick={() => setAppointmentToCancel(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  disabled={isCancellingAppt}
                  onClick={confirmCancelAppointment}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                >
                  {isCancellingAppt ? (
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
