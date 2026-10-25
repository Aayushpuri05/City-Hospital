import React from 'react';
import { X, Calendar, Award, Clock, MapPin, Globe, Star, Stethoscope } from 'lucide-react';
import { Doctor } from '../types';

interface DoctorModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBookAppointment: (doctor: Doctor) => void;
}

export const DoctorModal: React.FC<DoctorModalProps> = ({
  doctor,
  onClose,
  onBookAppointment
}) => {
  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-cyan-950 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
              Physician Profile · {doctor.departmentName}
            </span>
            <h3 className="text-2xl font-bold">{doctor.name}</h3>
            <p className="text-xs text-slate-300 mt-0.5">{doctor.specialization}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Main Info Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src={doctor.photo}
              alt={doctor.name}
              className="w-28 h-28 rounded-2xl object-cover border-2 border-slate-200 shadow-md"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 bg-cyan-50 text-cyan-800 border border-cyan-200 rounded-md">
                  {doctor.departmentName}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span className="tabular-nums">{doctor.rating}</span>
                  <span className="text-amber-700 font-normal">({doctor.reviewsCount} reviews)</span>
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-700">{doctor.qualifications}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-cyan-700" />
                  <span className="tabular-nums font-semibold text-slate-700">{doctor.experienceYears} Years</span> Experience
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-700" />
                  <span>{doctor.room}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Bio */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Clinical Background & Special Interests
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {doctor.bio}
            </p>
          </div>

          {/* Consultation Schedule & Slots */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Consultation Schedule & Appointment Slots
            </h4>
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Clock className="w-4 h-4 text-cyan-700 shrink-0" />
                <span className="font-semibold">Clinic Days:</span>
                <span>{doctor.consultationDays.join(', ')}</span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block mb-2 font-medium">Standard Daily Time Slots:</span>
                <div className="flex flex-wrap gap-2">
                  {doctor.availableSlots.map((slot) => (
                    <span
                      key={slot}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Languages spoken: {doctor.languages.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
            <strong>Sample Demonstration Profile:</strong> Dr. {doctor.name} is a fictional faculty profile designed to demonstrate City Hospital's online scheduling workflows.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onBookAppointment(doctor);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg shadow-sm transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment with {doctor.name.split(' ')[1] || 'Doctor'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
