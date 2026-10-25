import { Appointment } from '../types';
import { DOCTORS } from '../data/mockData';

// Clean up legacy global appointment key if it exists in browser
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('city_hospital_appointments_v1');
  }
} catch {
  // Ignore in SSR
}

/**
 * Retrieve user-scoped cached appointments.
 * Never returns mock data or records belonging to other patients.
 */
export function getUserStoredAppointments(userId?: string): Appointment[] {
  if (!userId) {
    return [];
  }
  try {
    const key = `city_hospital_appts_${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed: Appointment[] = JSON.parse(raw);
    // Defense-in-depth: only return appointments where userId matches
    return Array.isArray(parsed) ? parsed.filter((a) => a.userId === userId) : [];
  } catch (err) {
    console.error('Failed to read user appointments from localStorage:', err);
    return [];
  }
}

/**
 * Save user-scoped cached appointments.
 */
export function saveUserStoredAppointments(userId: string, appointments: Appointment[]): void {
  if (!userId) return;
  try {
    const key = `city_hospital_appts_${userId}`;
    const clean = appointments.filter((a) => a.userId === userId);
    localStorage.setItem(key, JSON.stringify(clean));
  } catch (err) {
    console.error('Failed to save user appointments to localStorage:', err);
  }
}

/**
 * Calculate available slots for a doctor on a specific date,
 * filtering out slots that have already been booked.
 */
export function getAvailableSlots(
  doctorId: string,
  _date: string,
  bookedSlots: string[] = []
): string[] {
  const doctor = DOCTORS.find((d) => d.id === doctorId);
  if (!doctor) return [];
  return doctor.availableSlots.filter((slot) => !bookedSlots.includes(slot));
}

/**
 * Backwards compatible helper for getStoredAppointments:
 * Scoped strictly to the provided userId or returns empty array.
 */
export function getStoredAppointments(userId?: string): Appointment[] {
  return getUserStoredAppointments(userId);
}
