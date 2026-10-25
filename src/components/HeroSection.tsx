import React from 'react';
import { Calendar, ArrowRight, Activity, ShieldCheck, HeartPulse, Clock, Sparkles } from 'lucide-react';
import heroImg from '../assets/images/hero_city_hospital_1792910453045.jpg';

interface HeroSectionProps {
  onBookAppointment: () => void;
  onExploreDepartments: () => void;
  onAnalyzeLabReport: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBookAppointment,
  onExploreDepartments,
  onAnalyzeLabReport
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-cyan-50/20 to-slate-50 pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 2-column Hero split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headline, Value Proposition, Action CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Editorial kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-800 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-600" />
              <span>Leading Metropolitan Medical Center</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-normal">Est. 1988</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12] text-balance">
              Your Health, <span className="text-cyan-700">Our Priority.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              City Hospital combines world-class medical specialists, advanced surgical suites, and an intelligent clinical diagnostic lab. From 24/7 emergency response to routine prevention, we deliver compassionate healthcare tailored to every stage of life.
            </p>

            {/* Required Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onBookAppointment}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer hover:shadow-md hover:-translate-y-0.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Book an Appointment</span>
              </button>

              <button
                onClick={onExploreDepartments}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 transition-all whitespace-nowrap cursor-pointer shadow-xs"
              >
                <span>Explore Departments</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={onAnalyzeLabReport}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-cyan-900 bg-cyan-50 hover:bg-cyan-100 rounded-xl border border-cyan-200 transition-all whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>Analyze Lab Report</span>
              </button>
            </div>

            {/* Trust markers */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-700">JCI & NABH Accredited Facility</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-600 shrink-0" />
                <span className="font-medium text-slate-700">Zero Wait Emergency Triage</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium text-slate-700">Fully Automated Pathology Lab</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100">
              <img
                src={heroImg}
                alt="City Hospital Modern Architectural Exterior and Entrance"
                className="w-full h-80 sm:h-96 lg:h-[420px] object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Overlay card for real-time facility stats */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-white/60 shadow-lg text-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Main Campus & Trauma Center</p>
                      <p className="text-[11px] text-slate-500">East Bandra, Mumbai 400051 · Active 24/7</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    Open Now
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-column KPI / Metric Strip in a clean full-width row below */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Medical Specialties
            </p>
            <p className="text-3xl font-extrabold text-slate-900 tabular-nums">
              10+
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Cardiology to Endocrinology
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Specialist Doctors
            </p>
            <p className="text-3xl font-extrabold text-slate-900 tabular-nums">
              24+
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Board-certified clinicians
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Inpatient Beds
            </p>
            <p className="text-3xl font-extrabold text-slate-900 tabular-nums">
              450+
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ICU, CCU & Private Suites
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Lab Turnaround Time
            </p>
            <p className="text-3xl font-extrabold text-slate-900 tabular-nums">
              &lt; 2 hrs
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Automated high-throughput tests
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
