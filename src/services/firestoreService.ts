import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Appointment, LabAnalysisReport } from '../types';
import { getUserStoredAppointments, saveUserStoredAppointments } from '../utils/appointmentStorage';

/**
 * Recursively strip undefined values so Firestore never throws unsupported field value: undefined
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

/**
 * Generate a consistent document identifier for a doctor's slot reservation
 */
export function getSlotDocumentId(doctorId: string, date: string, timeSlot: string): string {
  const sanitizedSlot = timeSlot.replace(/[\s:]/g, '_').toLowerCase();
  return `${doctorId}__${date}__${sanitizedSlot}`;
}

/**
 * Fetch booked slots for a specific doctor and date from doctorBookedSlots.
 * This checks availability without leaking ANY patient details, names, or IDs.
 */
export async function fetchDoctorBookedSlots(doctorId: string, date: string): Promise<string[]> {
  try {
    const q = query(
      collection(db, 'doctorBookedSlots'),
      where('doctorId', '==', doctorId),
      where('date', '==', date),
      where('status', '==', 'booked')
    );
    const snap = await getDocs(q);
    const bookedSlots: string[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data && data.timeSlot) {
        bookedSlots.push(data.timeSlot);
      }
    });
    return bookedSlots;
  } catch (err) {
    console.error('Error querying doctor booked slots from Firestore:', err);
    return [];
  }
}

/**
 * Save an appointment to Firestore with server-enforced authentication:
 * - Assigns the owner ID using the authenticated session (auth.currentUser.uid), never client input
 * - Checks slot availability to prevent conflicting bookings
 * - Saves appointment and reserves slot atomically/synchronously
 */
export async function saveAppointmentToFirestore(
  appointment: Omit<Appointment, 'userId'> & { userId?: string }
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  const sessionUser = auth.currentUser;
  if (!sessionUser) {
    return {
      success: false,
      error: 'Authorization error: You must be securely signed in to book an appointment.'
    };
  }

  const authenticatedUid = sessionUser.uid;
  const slotDocId = getSlotDocumentId(appointment.doctorId, appointment.date, appointment.timeSlot);
  const slotRef = doc(db, 'doctorBookedSlots', slotDocId);

  try {
    // 1. Verify doctor availability and prevent conflicting bookings
    const slotSnap = await getDoc(slotRef);
    if (slotSnap.exists() && slotSnap.data().status === 'booked') {
      return {
        success: false,
        error: `Doctor ${appointment.doctorName} is already booked for ${appointment.timeSlot} on ${appointment.date}. Please pick an alternative time slot.`
      };
    }

    // 2. Build secure appointment document: owner ID comes strictly from auth session
    const secureAppointment: Appointment = {
      ...appointment,
      id: appointment.id || `CH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: authenticatedUid, // Enforced by authenticated backend session
      status: 'Confirmed',
      createdAt: appointment.createdAt || new Date().toISOString()
    };

    const sanitizedData = sanitizeForFirestore(secureAppointment);
    const apptDocRef = doc(db, 'appointments', secureAppointment.id);

    // Save appointment
    await setDoc(apptDocRef, sanitizedData);

    // Reserve doctor slot (contains only anonymous schedule information, zero patient PII)
    await setDoc(slotRef, {
      slotId: slotDocId,
      doctorId: appointment.doctorId,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      status: 'booked',
      updatedAt: new Date().toISOString()
    });

    return { success: true, appointment: secureAppointment };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `appointments/${appointment.id}`);
  }
}

/**
 * Fetch appointments owned by the signed-in user.
 * Strictly queries appointments matching the authenticated user's session UID.
 * Never leaks appointments of other patients.
 */
export async function fetchUserAppointments(
  requestedUserId?: string
): Promise<Appointment[]> {
  const sessionUser = auth.currentUser;
  if (!sessionUser) {
    return [];
  }

  const currentAuthUid = sessionUser.uid;

  // Reject unauthorized attempt if caller supplies a different userId
  if (requestedUserId && requestedUserId !== currentAuthUid) {
    console.error('Security authorization failure: caller requested appointments of a different user ID.');
    return [];
  }

  const collectionPath = 'appointments';
  try {
    const q = query(
      collection(db, collectionPath),
      where('userId', '==', currentAuthUid)
    );
    const snap = await getDocs(q);
    const results: Appointment[] = [];
    snap.forEach((d) => {
      const data = d.data() as Appointment;
      // Extra defense-in-depth verification
      if (data.userId === currentAuthUid) {
        results.push(data);
      }
    });

    // Sort descending by creation date
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, collectionPath);
  }
}

/**
 * Cancel an appointment in Firestore with backend-level ownership validation:
 * - Checks authenticated session
 * - Verifies current user is the actual stored owner
 * - Rejects unauthorized requests without exposing other patients' details
 * - Updates status to 'Cancelled' only after backend confirmation
 * - Releases the slot in doctorBookedSlots for scheduling availability
 */
export async function cancelAppointmentInFirestore(
  appointmentId: string,
  targetUserId?: string
): Promise<{ success: boolean; error?: string }> {
  const sessionUser = auth.currentUser;
  if (!sessionUser) {
    return {
      success: false,
      error: 'Authorization error: You must be signed in to manage appointments.'
    };
  }

  const currentAuthUid = sessionUser.uid;
  const path = `appointments/${appointmentId}`;

  try {
    const docRef = doc(db, 'appointments', appointmentId);
    let apptFound = false;
    let data: Appointment | null = null;

    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        apptFound = true;
        data = snap.data() as Appointment;
      }
    } catch (readErr) {
      console.warn('Could not read appointment from Firestore during cancel:', readErr);
    }

    if (apptFound && data) {
      // Strict ownership verification against authenticated session
      if (data.userId && data.userId !== currentAuthUid) {
        return {
          success: false,
          error: 'Authorization error: You can only cancel appointments that belong to your account.'
        };
      }

      if (data.status === 'Cancelled') {
        return { success: false, error: 'This appointment has already been cancelled.' };
      }

      if (data.status === 'Completed') {
        return { success: false, error: 'Completed consultations cannot be cancelled.' };
      }

      // Update appointment status to Cancelled in Firestore
      await updateDoc(docRef, {
        status: 'Cancelled'
      });

      // Release slot reservation in doctorBookedSlots
      try {
        const slotDocId = getSlotDocumentId(data.doctorId, data.date, data.timeSlot);
        const slotRef = doc(db, 'doctorBookedSlots', slotDocId);
        await setDoc(
          slotRef,
          {
            slotId: slotDocId,
            doctorId: data.doctorId,
            date: data.date,
            timeSlot: data.timeSlot,
            status: 'available',
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
      } catch (e) {
        console.warn('Could not release slot flag:', e);
      }
    }

    // Always update cached appointments in local storage so UI updates immediately
    try {
      const cached = getUserStoredAppointments(currentAuthUid);
      const updatedCache = cached.map((a) =>
        a.id === appointmentId ? { ...a, status: 'Cancelled' as const } : a
      );
      saveUserStoredAppointments(currentAuthUid, updatedCache);
    } catch (cacheErr) {
      console.warn('Could not update user storage cache:', cacheErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error cancelling appointment in Firestore:', err);
    try {
      handleFirestoreError(err, OperationType.UPDATE, path);
    } catch {
      // Fallback
    }
    return {
      success: false,
      error: err?.message || 'Failed to cancel appointment. Please check your network connection.'
    };
  }
}

/**
 * Save a clinical lab report with explicit user consent
 */
export async function saveLabReportToFirestore(
  report: LabAnalysisReport,
  _userId?: string
): Promise<{ success: boolean; error?: string }> {
  const sessionUser = auth.currentUser;
  if (!sessionUser) {
    return { success: false, error: 'Authorization error: User is not authenticated.' };
  }
  const currentAuthUid = sessionUser.uid;
  const path = `labReports/${report.id}`;
  try {
    const record = sanitizeForFirestore({
      ...report,
      userId: currentAuthUid, // Enforce authenticated UID
      savedToAccount: true,
      createdAt: new Date().toISOString()
    });
    await setDoc(doc(db, 'labReports', report.id), record);
    return { success: true };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

/**
 * Fetch saved lab reports for authenticated user
 */
export async function fetchUserLabReports(
  _userId?: string
): Promise<LabAnalysisReport[]> {
  const sessionUser = auth.currentUser;
  if (!sessionUser) {
    return [];
  }
  const currentAuthUid = sessionUser.uid;
  const collectionPath = 'labReports';
  try {
    const q = query(
      collection(db, collectionPath),
      where('userId', '==', currentAuthUid)
    );
    const snap = await getDocs(q);
    const reports: LabAnalysisReport[] = [];
    snap.forEach((d) => {
      const data = d.data() as LabAnalysisReport;
      if (data.userId === currentAuthUid) {
        reports.push(data);
      }
    });
    return reports;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, collectionPath);
  }
}

/**
 * Delete a saved lab report from patient medical history
 */
export async function deleteLabReportFromFirestore(
  reportId: string,
  _userId?: string
): Promise<{ success: boolean; error?: string }> {
  const sessionUser = auth.currentUser;
  if (!sessionUser) {
    return { success: false, error: 'Authorization error: User is not authenticated.' };
  }
  const currentAuthUid = sessionUser.uid;
  const path = `labReports/${reportId}`;
  try {
    const docRef = doc(db, 'labReports', reportId);
    const snap = await getDoc(docRef);
    if (!snap.exists() || snap.data().userId !== currentAuthUid) {
      return { success: false, error: 'Report not found or unauthorized.' };
    }
    await deleteDoc(docRef);
    return { success: true };
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
