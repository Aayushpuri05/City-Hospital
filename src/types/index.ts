export type DepartmentId =
  | 'cardiology'
  | 'neurology'
  | 'orthopedics'
  | 'general-medicine'
  | 'pediatrics'
  | 'gynecology'
  | 'dermatology'
  | 'gastroenterology'
  | 'nephrology'
  | 'endocrinology';

export interface Department {
  id: DepartmentId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  headOfDepartment: string;
  location: string;
  bedCount: number;
  emergencyAvailable: boolean;
  services: string[];
  keyProcedures: string[];
}

export interface Doctor {
  id: string;
  name: string;
  departmentId: DepartmentId;
  departmentName: string;
  photo: string;
  gender: 'male' | 'female';
  specialization: string;
  qualifications: string;
  experienceYears: number;
  consultationDays: string[];
  availableSlots: string[];
  room: string;
  rating: number;
  reviewsCount: number;
  bio: string;
  languages: string[];
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Appointment {
  id: string;
  userId?: string; // Owner Firebase Auth UID
  patientName: string;
  age: number;
  contactNumber: string;
  email: string;
  departmentId: DepartmentId;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:30 AM"
  reason: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export type LabTestKey =
  | 'hemoglobin'
  | 'wbc'
  | 'platelets'
  | 'mcv'
  | 'fasting_glucose'
  | 'hba1c'
  | 'creatinine'
  | 'alt';

export interface ReferenceRange {
  maleMin: number;
  maleMax: number;
  femaleMin: number;
  femaleMax: number;
  unit: string;
  displayMaleRange: string;
  displayFemaleRange: string;
  screeningNote?: string;
}

export interface LabTestMetadata {
  id: LabTestKey;
  name: string;
  shortName: string;
  unit: string;
  category: 'Hematology' | 'Metabolic & Diabetes' | 'Renal & Liver Function';
  defaultMaleRange: [number, number];
  defaultFemaleRange: [number, number];
  plausibleRange: [number, number];
  criticalLow?: number;
  criticalHigh?: number;
  whatItMeasures: string;
  clinicalSignificance: string;
  commonCausesHigh: string[];
  commonCausesLow: string[];
  screeningThresholds?: {
    lowRiskMax?: number;
    prediabetesMin?: number;
    prediabetesMax?: number;
    diabetesThreshold?: number;
  };
}

export type ResultClassification =
  | 'within_range'
  | 'borderline'
  | 'abnormal_low'
  | 'abnormal_high'
  | 'critical_low'
  | 'critical_high'
  | 'clinical_interpretation_needed';

export interface AnalyzedTestItem {
  id: LabTestKey;
  name: string;
  value: number;
  unit: string;
  referenceIntervalUsed: string;
  sourceOfRange: string;
  classification: ResultClassification;
  badgeColor: 'emerald' | 'amber' | 'rose' | 'sky';
  statusLabel: string;
  whatItMeasures: string;
  interpretationText: string;
  possibleReasons: string[];
  nextSteps: string[];
  urgentReviewPrompt?: string | null;
  isUrgent: boolean;
}

export interface LabAnalysisReport {
  id: string;
  userId?: string;
  timestamp: string;
  patientSex: 'male' | 'female';
  patientAge: number;
  isPediatricAlert: boolean;
  totalTestsEntered: number;
  abnormalCount: number;
  criticalCount: number;
  analyzedItems: AnalyzedTestItem[];
  multiMarkerInsights: string[];
  doctorDiscussionQuestions: string[];
  safetyDisclaimer: string;
  savedToAccount?: boolean;
}
