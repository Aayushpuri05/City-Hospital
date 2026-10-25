import React, { useState } from 'react';
import {
  HeartPulse,
  Brain,
  Activity,
  Stethoscope,
  Baby,
  HeartHandshake,
  Sparkles,
  Layers,
  ShieldAlert,
  Flame,
  ArrowRight,
  Bed,
  Users
} from 'lucide-react';
import { Department, Doctor, DepartmentId } from '../types';
import { DEPARTMENTS, DOCTORS } from '../data/mockData';
import { DepartmentModal } from './DepartmentModal';

interface DepartmentsSectionProps {
  onSelectDepartmentForBooking: (deptId: DepartmentId) => void;
  onSelectDoctorForBooking: (doctor: Doctor) => void;
}

export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({
  onSelectDepartmentForBooking,
  onSelectDoctorForBooking
}) => {
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse':
        return <HeartPulse className="w-6 h-6 text-rose-600" />;
      case 'Brain':
        return <Brain className="w-6 h-6 text-purple-600" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-blue-600" />;
      case 'Stethoscope':
        return <Stethoscope className="w-6 h-6 text-cyan-600" />;
      case 'Baby':
        return <Baby className="w-6 h-6 text-amber-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-pink-600" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-indigo-600" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-emerald-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-6 h-6 text-teal-600" />;
      case 'Flame':
        return <Flame className="w-6 h-6 text-orange-600" />;
      default:
        return <Stethoscope className="w-6 h-6 text-cyan-600" />;
    }
  };

  const getDoctorsInDept = (deptId: DepartmentId): Doctor[] => {
    return DOCTORS.filter((d) => d.departmentId === deptId);
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-2">
              Clinical Specializations
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              10 Centers of Medical Excellence
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Each department is staffed by experienced attending physicians, equipped with state-of-the-art diagnostic technologies and dedicated inpatient beds.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            Sample Academic Medical Departments
          </div>
        </div>

        {/* 10 Departments Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS.map((dept) => {
            const deptDoctors = getDoctorsInDept(dept.id);

            return (
              <div
                key={dept.id}
                className="group p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-400 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Icon & Meta */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getDeptIcon(dept.icon)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-cyan-700" />
                        <span className="tabular-nums">{dept.bedCount} beds</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-600" />
                        <span className="tabular-nums">{deptDoctors.length} doctors</span>
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-800 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-cyan-700 font-semibold mt-0.5 mb-2">
                    {dept.tagline}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                    {dept.description}
                  </p>

                  {/* Highlights list */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <p className="font-semibold text-slate-800">Key Services:</p>
                    {dept.services.slice(0, 2).map((s, idx) => (
                      <p key={idx} className="truncate text-slate-500">
                        • {s}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedDept(dept)}
                    className="text-xs font-semibold text-slate-700 hover:text-cyan-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectDepartmentForBooking(dept.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/80 rounded-lg transition-colors cursor-pointer"
                  >
                    Book in {dept.name.split(' ')[0]}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department Detail Modal */}
      {selectedDept && (
        <DepartmentModal
          department={selectedDept}
          doctors={getDoctorsInDept(selectedDept.id)}
          onClose={() => setSelectedDept(null)}
          onBookDoctor={(doc) => {
            setSelectedDept(null);
            onSelectDoctorForBooking(doc);
          }}
        />
      )}
    </div>
  );
};
