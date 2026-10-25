import React, { useState, useRef, useEffect } from 'react';
import { Cross, Menu, X, PhoneCall, LogIn, User, LogOut, FileText, Calendar, ChevronDown, Sparkles } from 'lucide-react';
import { HOSPITAL_INFO } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBookAppointmentClick: () => void;
  onSignInClick: () => void;
  onDashboardClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onBookAppointmentClick,
  onSignInClick,
  onDashboardClick
}) => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'departments', label: 'Departments' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'lab-analyzer', label: 'Lab Analyzer' }
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Emergency alert bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-medium text-slate-100">Emergency & Trauma Center Active 24/7</span>
            <span className="text-slate-400 hidden sm:inline">·</span>
            <span className="text-slate-300 hidden sm:inline">Call Hotline: {HOSPITAL_INFO.emergencyPhone}</span>
          </div>
          <div className="text-slate-400 text-[11px] flex items-center gap-3">
            <span>{HOSPITAL_INFO.hours}</span>
          </div>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-18">
          {/* Zone 1: Brand wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left text-slate-900 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 group focus:outline-none"
            aria-label="City Hospital Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-sm shadow-cyan-700/20 group-hover:scale-[1.02] transition-transform">
              <Cross className="w-5 h-5 fill-white stroke-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans'] block leading-none">
                City Hospital
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                Healthcare Center
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-cyan-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Authentication & Action CTA */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              /* Signed In Profile Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="w-6 h-6 rounded-lg bg-cyan-700 text-white flex items-center justify-center text-xs uppercase font-bold">
                    {user.displayName ? user.displayName.charAt(0) : 'P'}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {user.displayName || 'Patient'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user.displayName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1 text-xs text-slate-700">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onDashboardClick();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-cyan-700" />
                        <span>My Account Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onDashboardClick();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4 text-cyan-700" />
                        <span>My Appointments</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onDashboardClick();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-cyan-700" />
                        <span>My Saved Lab Reports</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged Out: Clearly visible Sign In button */
              <button
                onClick={onSignInClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/90 rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-700" />
                <span>Sign In</span>
              </button>
            )}

            {/* Book an Appointment CTA */}
            <button
              onClick={onBookAppointmentClick}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer hover:shadow-md"
            >
              Book an Appointment
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {user && (
            <div className="p-3 bg-cyan-50/70 rounded-lg border border-cyan-100 mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{user.displayName}</p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onDashboardClick();
                }}
                className="text-xs font-semibold text-cyan-800 bg-white px-2.5 py-1 rounded border border-cyan-200"
              >
                Dashboard
              </button>
            </div>
          )}

          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === link.id
                  ? 'bg-cyan-50 text-cyan-800 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {!user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignInClick();
                }}
                className="w-full py-2.5 px-4 text-center text-sm font-semibold text-slate-800 bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-cyan-700" />
                <span>Sign In / Create Account</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="w-full py-2 px-4 text-center text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBookAppointmentClick();
              }}
              className="w-full py-2.5 px-4 text-center text-sm font-medium text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg transition-colors"
            >
              Book an Appointment
            </button>

            <a
              href={`tel:${HOSPITAL_INFO.emergencyPhone}`}
              className="w-full py-2 px-4 text-center text-xs font-medium text-slate-700 bg-slate-100 rounded-lg flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
              Emergency: {HOSPITAL_INFO.emergencyPhone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
