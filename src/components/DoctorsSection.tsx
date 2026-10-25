import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Star, Clock, MapPin, Award, ArrowRight, UserCheck } from 'lucide-react';
import { Doctor, DepartmentId } from '../types';
import { DOCTORS, DEPARTMENTS } from '../data/mockData';
import { DoctorModal } from './DoctorModal';
import doctorsTeamImg from '../assets/images/doctors_team_1792910454277.jpg';

interface DoctorsSectionProps {
  onSelectDoctorForBooking: (doctor: Doctor) => void;
  selectedDeptFilter?: DepartmentId | 'all';
}

export const DoctorsSection: React.FC<DoctorsSectionProps> = ({
  onSelectDoctorForBooking,
  selectedDeptFilter = 'all'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDept, setActiveDept] = useState<DepartmentId | 'all'>(selectedDeptFilter);
  const [selectedDoctorModal, setSelectedDoctorModal] = useState<Doctor | null>(null);

  const filteredDoctors = useMemo(() => {
    return DOCTORS.filter((doc) => {
      const matchesDept = activeDept === 'all' || doc.departmentId === activeDept;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        doc.name.toLowerCase().includes(query) ||
        doc.specialization.toLowerCase().includes(query) ||
        doc.departmentName.toLowerCase().includes(query) ||
        doc.qualifications.toLowerCase().includes(query);

      return matchesDept && matchesQuery;
    });
  }, [searchQuery, activeDept]);

  return (
    <div className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Heading & Team Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs font-semibold text-cyan-800 uppercase tracking-wider">
              Faculty Directory
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Meet Our Medical Specialists
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Browse board-certified attending doctors across 10 hospital departments. Review qualifications, clinic hours, and book instant outpatient appointments.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>All doctor profiles and schedules are simulated demonstration data for evaluation.</span>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <img
              src={doctorsTeamImg}
              alt="City Hospital Attending Physicians and Specialists"
              className="w-full h-48 sm:h-56 object-cover"
              loading="lazy"
            />
            <div className="p-3 bg-slate-900 text-slate-300 text-[11px] flex items-center justify-between">
              <span>City Hospital Attending Medical Staff</span>
              <span className="text-cyan-400 font-medium">Over 24 Specialists</span>
            </div>
          </div>
        </div>

        {/* Search & Department Filter Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by doctor name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Department Filter Dropdown for Mobile / Direct selection */}
            <div className="md:col-span-7 flex items-center justify-between md:justify-end gap-2">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-cyan-700" />
                Department:
              </span>
              <select
                value={activeDept}
                onChange={(e) => setActiveDept(e.target.value as any)}
                aria-label="Filter by department"
                className="text-xs py-2 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Departments (10)</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Segmented Department Buttons for Tablet/Desktop */}
          <div className="hidden sm:flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-200/80">
            <button
              onClick={() => setActiveDept('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeDept === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              All Specialties ({DOCTORS.length})
            </button>
            {DEPARTMENTS.map((dept) => {
              const count = DOCTORS.filter((doc) => doc.departmentId === dept.id).length;
              const isSelected = activeDept === dept.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => setActiveDept(dept.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-cyan-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {dept.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filteredDoctors.length}</strong> doctor
            {filteredDoctors.length === 1 ? '' : 's'}
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-cyan-700 hover:underline font-medium"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Doctor Cards Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <p className="text-sm font-semibold text-slate-700">No doctors match your query</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search keywords or switch to "All Specialties".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveDept('all');
              }}
              className="px-4 py-2 text-xs font-medium text-cyan-800 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Doctor Card Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={doctor.photo}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                          {doctor.departmentName}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span className="tabular-nums">{doctor.rating}</span>
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1 truncate">
                        {doctor.name}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-1">{doctor.specialization}</p>
                    </div>
                  </div>

                  {/* Qualifications & Experience */}
                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Award className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                      <span className="truncate">{doctor.qualifications}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Experience: <strong className="text-slate-800 tabular-nums">{doctor.experienceYears} Years</strong></span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{doctor.room}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Days: {doctor.consultationDays.join(', ')}</span>
                    </div>
                  </div>

                  {/* Available Slots Preview */}
                  <div className="mt-3">
                    <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">
                      Next available slots:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {doctor.availableSlots.slice(0, 3).map((slot) => (
                        <span
                          key={slot}
                          className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded"
                        >
                          {slot}
                        </span>
                      ))}
                      {doctor.availableSlots.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{doctor.availableSlots.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedDoctorModal(doctor)}
                    className="text-xs font-semibold text-slate-600 hover:text-cyan-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Bio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectDoctorForBooking(doctor)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Doctor Modal */}
      {selectedDoctorModal && (
        <DoctorModal
          doctor={selectedDoctorModal}
          onClose={() => setSelectedDoctorModal(null)}
          onBookAppointment={(doc) => {
            setSelectedDoctorModal(null);
            onSelectDoctorForBooking(doc);
          }}
        />
      )}
    </div>
  );
};
