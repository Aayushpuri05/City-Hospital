import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { DepartmentsSection } from './components/DepartmentsSection';
import { DoctorsSection } from './components/DoctorsSection';
import { AppointmentsSection } from './components/AppointmentsSection';
import { LabAnalyzerSection } from './components/LabAnalyzerSection';
import { ContactSection } from './components/ContactSection';
import { AuthPage } from './components/AuthPage';
import { DashboardSection } from './components/DashboardSection';
import { Doctor, DepartmentId } from './types';
import { DEPARTMENTS, DOCTORS } from './data/mockData';
import { ArrowRight, Sparkles, HeartPulse } from 'lucide-react';
import labImg from './assets/images/lab_diagnostics_1792910454471.jpg';

function HospitalApp() {
  const { user, redirectDestination, setRedirectDestination } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [bookingDeptId, setBookingDeptId] = useState<DepartmentId | undefined>(undefined);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  // Safe navigation wrapper enforcing Section 10 authentication requirements
  const handleNavigate = (tab: string) => {
    if ((tab === 'appointments' || tab === 'lab-analyzer') && !user) {
      setRedirectDestination({ tab });
      setAuthMode('signin');
      setActiveTab('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick navigation handlers with auth check & preservation of destination
  const handleBookAppointmentClick = () => {
    if (!user) {
      setRedirectDestination({ tab: 'appointments' });
      setAuthMode('signin');
      setActiveTab('auth');
    } else {
      setActiveTab('appointments');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreDepartments = () => {
    setActiveTab('departments');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyzeLabReport = () => {
    if (!user) {
      setRedirectDestination({ tab: 'lab-analyzer' });
      setAuthMode('signin');
      setActiveTab('auth');
    } else {
      setActiveTab('lab-analyzer');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDoctorForBooking = (doc: Doctor) => {
    if (!user) {
      setRedirectDestination({
        tab: 'appointments',
        doctor: doc,
        departmentId: doc.departmentId
      });
      setAuthMode('signin');
      setActiveTab('auth');
    } else {
      setBookingDoctor(doc);
      setBookingDeptId(doc.departmentId);
      setActiveTab('appointments');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDepartmentForBooking = (deptId: DepartmentId) => {
    if (!user) {
      setRedirectDestination({
        tab: 'appointments',
        departmentId: deptId
      });
      setAuthMode('signin');
      setActiveTab('auth');
    } else {
      setBookingDeptId(deptId);
      setBookingDoctor(null);
      setActiveTab('appointments');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignInClick = () => {
    setAuthMode('signin');
    setActiveTab('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDashboardClick = () => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called after successful Firebase Sign In or Sign Up
  const handleAuthSuccess = () => {
    if (redirectDestination) {
      const target = redirectDestination.tab;
      if (redirectDestination.doctor) {
        setBookingDoctor(redirectDestination.doctor);
      }
      if (redirectDestination.departmentId) {
        setBookingDeptId(redirectDestination.departmentId as DepartmentId);
      }
      setRedirectDestination(null);
      setActiveTab(target);
    } else {
      setActiveTab('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Bar / Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onBookAppointmentClick={handleBookAppointmentClick}
        onSignInClick={handleSignInClick}
        onDashboardClick={handleDashboardClick}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW: AUTHENTICATION (SIGN IN / SIGN UP / FORGOT PASSWORD) */}
        {activeTab === 'auth' && (
          <AuthPage
            initialMode={authMode}
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => {
              setRedirectDestination(null);
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW: PATIENT ACCOUNT DASHBOARD (SECURE & PROTECTED) */}
        {activeTab === 'dashboard' && (
          <DashboardSection
            onStartNewLabAnalysis={() => {
              setActiveTab('lab-analyzer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBookNewAppointment={() => {
              setActiveTab('appointments');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div>
            {/* Hero Section with Headline and CTAs */}
            <HeroSection
              onBookAppointment={handleBookAppointmentClick}
              onExploreDepartments={handleExploreDepartments}
              onAnalyzeLabReport={handleAnalyzeLabReport}
            />

            {/* Featured Departments Spotlight */}
            <section className="py-14 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-1">
                      Tertiary Healthcare
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Featured Medical Specialties
                    </h2>
                  </div>
                  <button
                    onClick={handleExploreDepartments}
                    className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All 10 Departments</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {DEPARTMENTS.slice(0, 4).map((dept) => (
                    <div
                      key={dept.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-cyan-300 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-cyan-700 mb-3 shadow-2xs">
                          <HeartPulse className="w-5 h-5 text-cyan-700" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                        <p className="text-xs text-cyan-700 font-medium mb-1.5">{dept.tagline}</p>
                        <p className="text-xs text-slate-600 line-clamp-2">{dept.description}</p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">{dept.bedCount} Beds</span>
                        <button
                          onClick={() => handleSelectDepartmentForBooking(dept.id)}
                          className="font-semibold text-cyan-700 hover:text-cyan-900 cursor-pointer"
                        >
                          Book Visit →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Interactive Lab Analyzer Teaser Banner */}
            <section className="py-14 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 text-white border-b border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-950 border border-cyan-800 text-xs font-semibold text-cyan-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Interactive Clinical Tool</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Got Recent Blood Test Results? Analyze Them in Seconds.
                    </h2>

                    <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                      Enter your laboratory values for Hemoglobin, Fasting Glucose, HbA1c, Creatinine, MCV, or ALT. Our analyzer highlights standard reference ranges, prediabetes screening thresholds, and safe clinical questions to ask your physician.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <button
                        onClick={handleAnalyzeLabReport}
                        className="px-6 py-3 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap font-bold"
                      >
                        Launch Lab Report Analyzer
                      </button>
                      <span className="text-xs text-slate-400">
                        Secure & Confidential · City Hospital Clinical Engine
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 rounded-xl overflow-hidden border border-slate-700 shadow-xl">
                    <img
                      src={labImg}
                      alt="Automated Clinical Diagnostics Workstation"
                      className="w-full h-48 sm:h-56 object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Doctors Teaser */}
            <section className="py-14 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-1">
                      Clinical Faculty
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Experienced Attending Physicians
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('doctors');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All 24+ Doctors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {DOCTORS.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-cyan-300 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3.5 mb-3">
                          <img
                            src={doc.photo}
                            alt={doc.name}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                            <p className="text-xs text-cyan-700 font-medium">{doc.departmentName}</p>
                            <p className="text-[11px] text-slate-500 tabular-nums">{doc.experienceYears}y exp · ★ {doc.rating}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">{doc.bio}</p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">{doc.room}</span>
                        <button
                          onClick={() => handleSelectDoctorForBooking(doc)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg transition-colors cursor-pointer"
                        >
                          Book Visit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Hospital Contact & Emergency Information */}
            <ContactSection />
          </div>
        )}

        {/* VIEW 2: ABOUT PAGE */}
        {activeTab === 'about' && (
          <div>
            <AboutSection />
            <ContactSection />
          </div>
        )}

        {/* VIEW 3: DEPARTMENTS PAGE */}
        {activeTab === 'departments' && (
          <DepartmentsSection
            onSelectDepartmentForBooking={handleSelectDepartmentForBooking}
            onSelectDoctorForBooking={handleSelectDoctorForBooking}
          />
        )}

        {/* VIEW 4: DOCTORS PAGE */}
        {activeTab === 'doctors' && (
          <DoctorsSection
            onSelectDoctorForBooking={handleSelectDoctorForBooking}
            selectedDeptFilter={bookingDeptId || 'all'}
          />
        )}

        {/* VIEW 5: APPOINTMENTS PAGE */}
        {activeTab === 'appointments' && (
          <AppointmentsSection
            initialDepartmentId={bookingDeptId}
            initialDoctor={bookingDoctor}
            onClearInitialDoctor={() => {
              setBookingDoctor(null);
            }}
            onRequireSignIn={() => {
              setRedirectDestination({
                tab: 'appointments',
                doctor: bookingDoctor,
                departmentId: bookingDeptId
              });
              setAuthMode('signin');
              setActiveTab('auth');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 6: LAB REPORT ANALYZER */}
        {activeTab === 'lab-analyzer' && (
          <LabAnalyzerSection
            onBookConsultation={handleBookAppointmentClick}
            onRequireSignIn={() => {
              setRedirectDestination({ tab: 'lab-analyzer' });
              setAuthMode('signin');
              setActiveTab('auth');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewDashboard={handleDashboardClick}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer setActiveTab={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HospitalApp />
    </AuthProvider>
  );
}
