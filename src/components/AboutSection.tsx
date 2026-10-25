import React from 'react';
import { ShieldCheck, Heart, Award, Cpu, Stethoscope, Users, Building, CheckCircle2 } from 'lucide-react';
import facilityImg from '../assets/images/hospital_facilities_1792910453768.jpg';

export const AboutSection: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-2">
            About City Hospital
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Advancing Clinical Excellence with Compassion and Precision
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Since our founding in 1988, City Hospital has remained at the forefront of patient care, surgical advancement, and diagnostic accuracy. We combine tertiary medical expertise with a culture of empathetic listening.
          </p>
        </div>

        {/* Mission, Vision & Core Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Our Mission</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              To provide patient-centered, evidence-based healthcare with unwavering clinical integrity, accessibility for all families, and rigorous safety standards across every specialty.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Our Vision</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              To be the benchmark regional academic medical center recognized for transformative clinical research, technological innovation, and unmatched clinical outcomes.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Our Core Values</h3>
            <ul className="text-sm text-slate-600 space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Patient safety above all else</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Transparent clinical diagnostics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Continuous peer-reviewed learning</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Dignity, empathy, and respect</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Facilities & High-Tech Medical Infrastructure with Photo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-4">
          <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
            <img
              src={facilityImg}
              alt="City Hospital High-Tech Inpatient and Diagnostic Wing"
              className="w-full h-80 sm:h-96 object-cover"
              loading="lazy"
            />
            <div className="p-4 bg-slate-900 text-slate-300 text-xs flex items-center justify-between">
              <span>Main Diagnostic Imaging Wing & Nurse Stations</span>
              <span className="text-cyan-400 font-mono">Floor 3 East</span>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-50 border border-cyan-200 text-xs font-semibold text-cyan-800">
              <Cpu className="w-3.5 h-3.5" />
              <span>Modern Healthcare Technology</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              State-of-the-Art Infrastructure Engineered for Patient Recovery
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our campus features 16 laminar airflow operation theaters, 3T high-resolution MRI, dual-source CT angiography, automated robotic surgical consoles, and a digital continuous telemetry unit.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Building className="w-4 h-4 text-cyan-700" />
                  <span>450+ Inpatient Beds</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Private suites, dedicated pediatric rooms, and isolation units.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Stethoscope className="w-4 h-4 text-cyan-700" />
                  <span>Integrated Pathology</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Zero-delay digital connectivity to patient EHR portals.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Users className="w-4 h-4 text-cyan-700" />
                  <span>Rapid Response Teams</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  On-site intensivists and stroke teams standing by 24/7/365.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-cyan-700" />
                  <span>Sterility Invariants</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  HEPA air filtration and automated UV-C sterilization chambers.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic pt-1">
              * Note: Hospital capacity metrics and infrastructure descriptions are sample demonstrative data for software evaluation purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
