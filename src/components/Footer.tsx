import React from 'react';
import { Cross, MapPin, Phone, Mail, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';
import { HOSPITAL_INFO } from '../data/mockData';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const scrollTo = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Commitment */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
                <Cross className="w-5 h-5 fill-white stroke-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                City Hospital
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dedicated to clinical excellence, patient-centered empathy, and cutting-edge medical technology. Serving our community with compassionate healthcare 24 hours a day.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-cyan-400">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>JCI Accredited Simulation & Safety Protocols</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Patient Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => scrollTo('departments')}
                  className="hover:text-white transition-colors text-slate-400 text-left"
                >
                  Medical Departments
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('doctors')}
                  className="hover:text-white transition-colors text-slate-400 text-left"
                >
                  Find a Doctor
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('appointments')}
                  className="hover:text-white transition-colors text-slate-400 text-left"
                >
                  Book Consultation Slot
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('lab-analyzer')}
                  className="hover:text-white transition-colors text-slate-400 text-left flex items-center gap-1.5"
                >
                  <span>Lab Report Analyzer</span>
                  <span className="text-[10px] text-cyan-300 bg-cyan-950 border border-cyan-800/80 px-1.5 py-0.5 rounded">
                    Interactive
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('about')}
                  className="hover:text-white transition-colors text-slate-400 text-left"
                >
                  About Our Hospital & Facilities
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Clinical Hours & Emergency */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Hours & Emergency
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white block font-medium">Emergency Care:</span>
                  <span>24 Hours / 7 Days a Week</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white block font-medium">Outpatient Consultations:</span>
                  <span>Mon – Sat: 8:00 AM – 8:00 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white block font-medium">Diagnostic Lab Center:</span>
                  <span>Mon – Sun: 7:00 AM – 9:00 PM</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Location & Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Contact Hospital
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{HOSPITAL_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href={`tel:${HOSPITAL_INFO.phone}`} className="hover:text-white transition-colors">
                  {HOSPITAL_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-rose-300 font-medium">
                  {HOSPITAL_INFO.emergencyPhone}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{HOSPITAL_INFO.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Demo Notice & Disclaimer */}
        <div className="pt-8 text-xs text-slate-400 space-y-3">
          <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <strong className="text-white block mb-0.5">Hackathon Demonstration Prototype</strong>
              <p className="text-[11px] text-slate-400">
                {HOSPITAL_INFO.sampleDataNotice} No medical diagnosis is rendered.
              </p>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono shrink-0">
              BUILD v2026.10 · Verified Demo
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
            <p>© {new Date().getFullYear()} City Hospital Healthcare Network. All rights reserved.</p>
            <p>Designed with patient safety, clinical transparency, and modern ergonomics.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
