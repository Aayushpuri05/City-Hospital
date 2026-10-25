import React from 'react';
import { X, Bed, MapPin, ShieldAlert, CheckCircle, Calendar, ArrowRight, Stethoscope } from 'lucide-react';
import { Department, Doctor } from '../types';

interface DepartmentModalProps {
  department: Department | null;
  doctors: Doctor[];
  onClose: () => void;
  onBookDoctor: (doctor: Doctor) => void;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  department,
  doctors,
  onClose,
  onBookDoctor
}) => {
  if (!department) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
              Department Profile
            </span>
            <h3 className="text-2xl font-bold">{department.name}</h3>
            <p className="text-xs text-slate-300 mt-0.5">{department.tagline}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Quick Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-700 shrink-0" />
              <div>
                <span className="text-slate-500 block">Location</span>
                <span className="font-semibold text-slate-800">{department.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-cyan-700 shrink-0" />
              <div>
                <span className="text-slate-500 block">Dedicated Beds</span>
                <span className="font-semibold text-slate-800 tabular-nums">{department.bedCount} Beds</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-500 block">24/7 Response</span>
                <span className="font-semibold text-slate-800">
                  {department.emergencyAvailable ? 'Available' : 'Day OPD Care'}
                </span>
              </div>
            </div>
          </div>

          {/* Department Description & Leadership */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Clinical Overview
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {department.description}
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Department Lead: <span className="text-slate-900 font-semibold">{department.headOfDepartment}</span>
            </p>
          </div>

          {/* Specialized Services */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Specialized Care & Key Procedures
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {department.services.map((svc, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">{svc}</span>
                </div>
              ))}
              {department.keyProcedures.map((proc, idx) => (
                <div key={`proc-${idx}`} className="flex items-start gap-2 p-2 rounded-lg bg-cyan-50/50 border border-cyan-100/70">
                  <Stethoscope className="w-3.5 h-3.5 text-cyan-700 shrink-0 mt-0.5" />
                  <span className="text-cyan-900 font-medium">Procedure: {proc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Doctors List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Specialists in this Department ({doctors.length})
              </h4>
              <span className="text-xs text-slate-500">Board-certified sample faculty</span>
            </div>

            <div className="space-y-3">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-cyan-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={doc.photo}
                      alt={doc.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">{doc.name}</h5>
                      <p className="text-xs text-cyan-700 font-medium">{doc.specialization}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>{doc.qualifications}</span>
                        <span>·</span>
                        <span className="tabular-nums">{doc.experienceYears} yrs exp</span>
                        <span>·</span>
                        <span className="text-amber-600 font-semibold">★ {doc.rating}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onBookDoctor(doc);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book with {doc.name.split(' ')[1] || 'Doctor'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
