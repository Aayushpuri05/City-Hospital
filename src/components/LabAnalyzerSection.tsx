import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Printer,
  RotateCcw,
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  Shield,
  Stethoscope,
  Activity,
  HeartPulse,
  BookmarkPlus,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { LabTestKey, LabAnalysisReport } from '../types';
import { LAB_TESTS_METADATA, LAB_SAMPLE_PRESETS } from '../data/mockData';
import { analyzeLabReport } from '../utils/labAnalyzer';
import { useAuth } from '../contexts/AuthContext';
import { saveLabReportToFirestore } from '../services/firestoreService';
import labImg from '../assets/images/lab_diagnostics_1792910454471.jpg';

interface LabAnalyzerSectionProps {
  onBookConsultation: () => void;
  onRequireSignIn?: () => void;
  onViewDashboard?: () => void;
}

export const LabAnalyzerSection: React.FC<LabAnalyzerSectionProps> = ({
  onBookConsultation,
  onRequireSignIn,
  onViewDashboard
}) => {
  const { user } = useAuth();

  // Explicit storage consent & persistence state
  const [saveConsent, setSaveConsent] = useState<boolean>(false);
  const [isSavingReport, setIsSavingReport] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Step 1: Patient demographics
  const [patientSex, setPatientSex] = useState<'male' | 'female'>('female');
  const [patientAge, setPatientAge] = useState<string>('34');
  const [isPregnant, setIsPregnant] = useState<boolean>(false);
  const [useCustomRanges, setUseCustomRanges] = useState<boolean>(false);

  // Step 2: Lab Test Inputs
  const [testValues, setTestValues] = useState<Partial<Record<LabTestKey, string>>>({
    hemoglobin: '',
    wbc: '',
    platelets: '',
    mcv: '',
    fasting_glucose: '',
    hba1c: '',
    creatinine: '',
    alt: ''
  });

  // Custom reference ranges override
  const [customRanges, setCustomRanges] = useState<
    Partial<Record<LabTestKey, { min?: string; max?: string }>>
  >({});

  // Analysis result
  const [report, setReport] = useState<LabAnalysisReport | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showRefTable, setShowRefTable] = useState<boolean>(true);

  // Handle value changes
  const handleValueChange = (key: LabTestKey, val: string) => {
    setTestValues((prev) => ({ ...prev, [key]: val }));
    if (report) setReport(null); // Reset report on change so user re-analyzes
  };

  const handleCustomRangeChange = (
    key: LabTestKey,
    field: 'min' | 'max',
    val: string
  ) => {
    setCustomRanges((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: val
      }
    }));
  };

  // Preset loaders for fast demonstration
  const loadPreset = (preset: (typeof LAB_SAMPLE_PRESETS)[0]) => {
    setPatientSex(preset.patientSex);
    setPatientAge(preset.patientAge.toString());
    setIsPregnant(false);

    const stringifiedValues: Partial<Record<LabTestKey, string>> = {};
    for (const [k, v] of Object.entries(preset.values)) {
      stringifiedValues[k as LabTestKey] = v.toString();
    }
    setTestValues(stringifiedValues);
    setValidationError(null);

    // Auto-analyze preset
    const numAge = preset.patientAge;
    const generatedReport = analyzeLabReport({
      patientSex: preset.patientSex,
      patientAge: numAge,
      isPregnant: false,
      values: preset.values,
      customRanges: {}
    });
    setReport(generatedReport);
  };

  const handleClearAll = () => {
    setTestValues({
      hemoglobin: '',
      wbc: '',
      platelets: '',
      mcv: '',
      fasting_glucose: '',
      hba1c: '',
      creatinine: '',
      alt: ''
    });
    setCustomRanges({});
    setReport(null);
    setValidationError(null);
  };

  const handleAnalyze = () => {
    setValidationError(null);

    const numAge = parseInt(patientAge, 10);
    if (!patientAge || isNaN(numAge) || numAge < 1 || numAge > 120) {
      setValidationError('Please enter a valid patient age between 1 and 120.');
      return;
    }

    // Check if at least one test is filled
    const hasAtLeastOne = Object.values(testValues).some(
      (v) => v !== undefined && v !== null && v.trim() !== ''
    );

    if (!hasAtLeastOne) {
      setValidationError(
        'Please enter a value for at least one laboratory test, or choose a 1-click sample panel above.'
      );
      return;
    }

    // Format numbers
    const parsedValues: Partial<Record<LabTestKey, number>> = {};
    for (const [k, v] of Object.entries(testValues)) {
      if (v && v.trim() !== '') {
        const num = parseFloat(v);
        if (!isNaN(num)) {
          parsedValues[k as LabTestKey] = num;
        }
      }
    }

    const parsedCustomRanges: Partial<
      Record<LabTestKey, { min?: number; max?: number }>
    > = {};
    if (useCustomRanges) {
      for (const [k, range] of Object.entries(customRanges)) {
        if (range) {
          parsedCustomRanges[k as LabTestKey] = {
            min: range.min ? parseFloat(range.min) : undefined,
            max: range.max ? parseFloat(range.max) : undefined
          };
        }
      }
    }

    const generatedReport = analyzeLabReport({
      patientSex,
      patientAge: numAge,
      isPregnant,
      values: parsedValues,
      customRanges: parsedCustomRanges
    });

    setReport(generatedReport);

    // Scroll slightly to results
    setTimeout(() => {
      const resultsEl = document.getElementById('lab-results-anchor');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const testList: LabTestKey[] = [
    'hemoglobin',
    'wbc',
    'platelets',
    'mcv',
    'fasting_glucose',
    'hba1c',
    'creatinine',
    'alt'
  ];

  return (
    <div className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Lab Header & Photo Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-50 border border-cyan-200 text-xs font-semibold text-cyan-800">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>Interactive Patient Diagnostic Companion</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Lab Report Analyzer
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Understand your routine blood panel with transparent clinical reference intervals, screening thresholds for prediabetes, and clear educational next steps.
            </p>
          </div>

          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <img
              src={labImg}
              alt="Clinical Pathology Laboratory blood testing instrumentation"
              className="w-full h-44 sm:h-52 object-cover"
              loading="lazy"
            />
            <div className="p-2.5 bg-slate-900 text-slate-300 text-[11px] flex items-center justify-between">
              <span>City Hospital Clinical Pathology Division</span>
              <span className="text-cyan-400 font-medium">CAP & CLIA Compliant</span>
            </div>
          </div>
        </div>

        {/* Mandatory Safety Notice Banner (Section 8) */}
        <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200/90 text-cyan-950 text-xs flex items-start gap-3">
          <Shield className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block text-cyan-900 font-bold">
              Educational & Screening Purpose Notice:
            </strong>
            <p className="text-slate-600 leading-relaxed">
              This tool provides educational information about laboratory results. It does not diagnose diseases or replace advice from a qualified healthcare professional. Reference intervals can vary by individual laboratory equipment, geographic population, and clinical situation. Do not initiate or alter prescription medications based on this tool.
            </p>
          </div>
        </div>

        {/* 1-Click Demonstration Presets Bar */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-700" />
              <span>Quick Test Panels (1-Click Sample Fill):</span>
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Instant evaluation profiles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {LAB_SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPreset(preset)}
                className="p-3 text-left bg-white hover:bg-cyan-50/50 border border-slate-200 hover:border-cyan-400 rounded-xl transition-all cursor-pointer shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-800">
                    {preset.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {preset.patientSex === 'female' ? 'F' : 'M'}, {preset.patientAge}y
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 1: PATIENT DEMOGRAPHICS & RANGE SETTINGS */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-700 text-white text-[11px] flex items-center justify-center font-bold">
                1
              </span>
              <span>Patient Information & Reference Basis</span>
            </h3>
            <span className="text-xs text-slate-500">Step 1 of 3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sex Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Biological Sex *
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPatientSex('female')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    patientSex === 'female'
                      ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Female
                </button>
                <button
                  type="button"
                  onClick={() => setPatientSex('male')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    patientSex === 'male'
                      ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Male
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Calibrates sex-specific Hb, Creatinine, & ALT baselines.
              </p>
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Age (Years) *
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="w-full p-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {parseInt(patientAge, 10) < 18 && (
                <p className="text-[10px] text-amber-700 mt-1 font-medium">
                  Pediatric age detected. Adult ranges cannot be automatically applied.
                </p>
              )}
            </div>

            {/* Pregnancy check */}
            {patientSex === 'female' && (
              <div className="flex flex-col justify-center">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pregnancy Status
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={isPregnant}
                    onChange={(e) => setIsPregnant(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Currently pregnant</span>
                </label>
                <p className="text-[10px] text-slate-400 mt-1">
                  Alerts on hemodilution shifts.
                </p>
              </div>
            )}

            {/* Custom Range Toggle */}
            <div className="flex flex-col justify-center">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Printed Lab Report Ranges
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={useCustomRanges}
                  onChange={(e) => setUseCustomRanges(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span>Enter custom ranges</span>
              </label>
              <p className="text-[10px] text-slate-400 mt-1">
                Matches your specific laboratory slip.
              </p>
            </div>
          </div>
        </div>

        {/* STEP 2: TEST INPUTS (8 TESTS) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-700 text-white text-[11px] flex items-center justify-center font-bold">
                  2
                </span>
                <span>Enter Laboratory Test Values (8 Parameters)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Leave any test blank if not included on your lab panel.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Inputs</span>
            </button>
          </div>

          {/* Test Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testList.map((key) => {
              const meta = LAB_TESTS_METADATA[key];
              const defaultRange =
                patientSex === 'male' ? meta.defaultMaleRange : meta.defaultFemaleRange;
              const currentValue = testValues[key] || '';
              const customMin = customRanges[key]?.min || '';
              const customMax = customRanges[key]?.max || '';

              return (
                <div
                  key={key}
                  className={`p-4 rounded-xl border transition-all ${
                    currentValue
                      ? 'bg-cyan-50/30 border-cyan-300'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {meta.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {meta.category} · {meta.shortName}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {meta.unit}
                    </span>
                  </div>

                  {/* Standard reference range pill text */}
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-2.5">
                    <span>Adult {patientSex} standard:</span>
                    <strong className="text-slate-700 tabular-nums">
                      {defaultRange[0]} – {defaultRange[1]} {meta.unit}
                    </strong>
                    {key === 'mcv' && (
                      <span className="text-slate-400 italic">
                        (corrects typo MCB)
                      </span>
                    )}
                  </div>

                  {/* Input field */}
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder={`e.g. ${
                        key === 'platelets'
                          ? '250000'
                          : key === 'wbc'
                          ? '6500'
                          : defaultRange[0]
                      }`}
                      value={currentValue}
                      onChange={(e) => handleValueChange(key, e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                    />
                  </div>

                  {/* Custom Range Overrides */}
                  {useCustomRanges && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-500 block">Custom Min</label>
                        <input
                          type="number"
                          step="any"
                          placeholder={defaultRange[0].toString()}
                          value={customMin}
                          onChange={(e) =>
                            handleCustomRangeChange(key, 'min', e.target.value)
                          }
                          className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Custom Max</label>
                        <input
                          type="number"
                          step="any"
                          placeholder={defaultRange[1].toString()}
                          value={customMax}
                          onChange={(e) =>
                            handleCustomRangeChange(key, 'max', e.target.value)
                          }
                          className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Informational micro-explainer */}
                  <p className="text-[10px] text-slate-500 mt-2 line-clamp-1">
                    {meta.whatItMeasures}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Action Trigger Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Analysis strictly adheres to clinical screening thresholds and safety invariants.
            </p>
            <button
              type="button"
              onClick={handleAnalyze}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze Results</span>
            </button>
          </div>
        </div>

        {/* STEP 3: REFERENCE RANGES & SCREENING THRESHOLDS ACCORDION TABLE */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <button
            type="button"
            onClick={() => setShowRefTable(!showRefTable)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-700" />
                <span>Reference Ranges & Screening Thresholds Guide</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Educational reference intervals from standard clinical laboratory guidelines.
              </p>
            </div>
            <div className="p-1 rounded-md text-slate-500 hover:bg-slate-100">
              {showRefTable ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {showRefTable && (
            <div className="space-y-4 pt-2">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">Test Name</th>
                      <th className="py-2.5 px-3">Male Standard</th>
                      <th className="py-2.5 px-3">Female Standard</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3">Screening / Diagnostic Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">Hemoglobin (Hb)</td>
                      <td className="py-2.5 px-3">13.5 – 17.5</td>
                      <td className="py-2.5 px-3">12.0 – 15.5</td>
                      <td className="py-2.5 px-3">g/dL</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">Low = Anemia; Critical &lt; 7.0</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">White Blood Cell Count (WBC)</td>
                      <td className="py-2.5 px-3">4,000 – 11,000</td>
                      <td className="py-2.5 px-3">4,000 – 11,000</td>
                      <td className="py-2.5 px-3">cells/µL</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">Elevated = Immune/Infection response</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">Platelet Count</td>
                      <td className="py-2.5 px-3">150,000 – 450,000</td>
                      <td className="py-2.5 px-3">150,000 – 450,000</td>
                      <td className="py-2.5 px-3">cells/µL</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">Low = Bleeding tendency; Critical &lt; 50k</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">Mean Corpuscular Volume (MCV)</td>
                      <td className="py-2.5 px-3">80 – 100</td>
                      <td className="py-2.5 px-3">80 – 100</td>
                      <td className="py-2.5 px-3">fL</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">&lt;80 microcytic; &gt;100 macrocytic (MCB typo correction)</td>
                    </tr>
                    <tr className="bg-amber-50/40">
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">Fasting Blood Glucose</td>
                      <td className="py-2.5 px-3">70 – 99</td>
                      <td className="py-2.5 px-3">70 – 99</td>
                      <td className="py-2.5 px-3">mg/dL</td>
                      <td className="py-2.5 px-3 font-sans text-slate-800">
                        &lt;70 Low · 70–99 Normal · 100–125 Prediabetes · ≥126 Diabetes bracket
                      </td>
                    </tr>
                    <tr className="bg-amber-50/40">
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">HbA1c</td>
                      <td className="py-2.5 px-3">Below 5.7%</td>
                      <td className="py-2.5 px-3">Below 5.7%</td>
                      <td className="py-2.5 px-3">%</td>
                      <td className="py-2.5 px-3 font-sans text-slate-800">
                        &lt;5.7% Normal · 5.7–6.4% Prediabetes · ≥6.5% Diabetes bracket
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">Serum Creatinine</td>
                      <td className="py-2.5 px-3">0.7 – 1.3</td>
                      <td className="py-2.5 px-3">0.6 – 1.1</td>
                      <td className="py-2.5 px-3">mg/dL</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">Requires hydration & eGFR context; Critical &gt; 3.0</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">Alanine Aminotransferase (ALT)</td>
                      <td className="py-2.5 px-3">7 – 55</td>
                      <td className="py-2.5 px-3">7 – 45</td>
                      <td className="py-2.5 px-3">U/L</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">Hepatocellular enzyme; Critical &gt; 250</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Explicit Diabetes Clinical Assessment Notice */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <strong>Clinical Confirmation Invariant:</strong> A diagnosis of prediabetes or diabetes mellitus requires clinical assessment, symptom evaluation, and confirmatory testing by a licensed physician unless clear acute clinical criteria are present. Screening categories provide statistical risk estimation, not definitive standalone diagnoses.
              </div>
            </div>
          )}
        </div>

        {/* STEP 4 & 5 & 6: ANALYSIS RESULTS & NEXT STEPS */}
        {report && (
          <div id="lab-results-anchor" className="space-y-8 pt-4">
            {/* Results Header Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded border border-cyan-200">
                      REPORT ID: {report.id}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500">{report.timestamp}</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                    Laboratory Analysis & Next-Step Guidance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient Profile: {report.patientSex === 'female' ? 'Female' : 'Male'}, {report.patientAge} Years Old
                  </p>
                </div>

                {/* Print button */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print Results Summary</span>
                </button>
              </div>

              {/* Status Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-medium text-slate-500 block">Tests Analyzed</span>
                  <span className="text-2xl font-bold text-slate-900 tabular-nums">
                    {report.totalTestsEntered}
                  </span>
                </div>

                <div
                  className={`p-4 rounded-xl border ${
                    report.abnormalCount > 0
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-emerald-50/70 border-emerald-200'
                  }`}
                >
                  <span className="text-xs font-medium text-slate-600 block">
                    Flagged / Out of Range
                  </span>
                  <span
                    className={`text-2xl font-bold tabular-nums ${
                      report.abnormalCount > 0 ? 'text-amber-800' : 'text-emerald-800'
                    }`}
                  >
                    {report.abnormalCount}
                  </span>
                </div>

                <div
                  className={`p-4 rounded-xl border ${
                    report.criticalCount > 0
                      ? 'bg-rose-50 border-rose-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="text-xs font-medium text-slate-600 block">
                    Prompt Review Flags
                  </span>
                  <span
                    className={`text-2xl font-bold tabular-nums ${
                      report.criticalCount > 0 ? 'text-rose-700' : 'text-slate-700'
                    }`}
                  >
                    {report.criticalCount}
                  </span>
                </div>
              </div>

              {/* Multi-Marker Integrated Observations */}
              {report.multiMarkerInsights.length > 0 && (
                <div className="p-5 rounded-xl bg-cyan-50/60 border border-cyan-200/90 space-y-3">
                  <h4 className="text-xs font-bold text-cyan-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-cyan-700" />
                    <span>Multi-Test Integrated Observations</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {report.multiMarkerInsights.map((obs, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-700 font-bold mt-0.5">•</span>
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Individual Analyzed Test Cards */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Individual Parameter Breakdown & Clinical Explanations
                </h4>

                <div className="grid grid-cols-1 gap-4">
                  {report.analyzedItems.map((item) => {
                    const isWithin = item.classification === 'within_range';
                    const isCritical = item.isUrgent;

                    return (
                      <div
                        key={item.id}
                        className={`p-5 rounded-xl border transition-all ${
                          isCritical
                            ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-200'
                            : isWithin
                            ? 'bg-emerald-50/20 border-slate-200'
                            : 'bg-amber-50/30 border-amber-200'
                        }`}
                      >
                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-slate-900">{item.name}</h5>
                              <span
                                className={`px-2.5 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                                  isCritical
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : isWithin
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {isWithin ? (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                )}
                                <span>{item.statusLabel}</span>
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Ref interval: {item.referenceIntervalUsed} ({item.sourceOfRange})
                            </span>
                          </div>

                          <div className="text-left sm:text-right font-mono">
                            <span className="text-lg font-extrabold text-slate-900">
                              {item.value}
                            </span>
                            <span className="text-xs text-slate-500 ml-1 font-sans">
                              {item.unit}
                            </span>
                          </div>
                        </div>

                        {/* Critical prompt warning */}
                        {item.urgentReviewPrompt && (
                          <div className="mt-3 p-3 rounded-lg bg-rose-100/80 border border-rose-300 text-rose-900 text-xs font-medium flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                            <div>
                              <strong>Urgent Attention:</strong> {item.urgentReviewPrompt}
                            </div>
                          </div>
                        )}

                        {/* Explanation */}
                        <div className="mt-3 space-y-2 text-xs text-slate-700">
                          <p className="leading-relaxed">{item.interpretationText}</p>

                          {/* Non-diagnostic causes */}
                          {item.possibleReasons.length > 0 && (
                            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                              <span className="font-semibold text-slate-800 block text-[11px]">
                                Common non-diagnostic clinical factors:
                              </span>
                              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                                {item.possibleReasons.map((r, idx) => (
                                  <li key={idx}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Next Steps */}
                          <div className="pt-1">
                            <span className="font-semibold text-slate-800 block text-[11px] mb-1">
                              Recommended Next Step:
                            </span>
                            <ul className="space-y-1 text-slate-600 text-[11px]">
                              {item.nextSteps.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-cyan-600 font-bold">→</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 6: SUGGESTED QUESTIONS FOR THE DOCTOR */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-cyan-700" />
                  <span>Suggested Questions to Bring to Your Doctor</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {report.doctorDiscussionQuestions.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-100">
                      <span className="text-cyan-700 font-semibold">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* STEP 7: SAVE TO PRIVATE ACCOUNT HISTORY (EXPLICIT CONSENT) */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-700" />
                      <span>Save Analysis to Private Medical Records</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Archive this assessment securely in your Firestore patient account for future consultations.
                    </p>
                  </div>
                  {user && (
                    <span className="text-[11px] font-medium text-cyan-800 bg-cyan-100/60 px-2.5 py-1 rounded-full border border-cyan-200 inline-flex items-center gap-1">
                      <Lock className="w-3 h-3 text-cyan-700" />
                      Patient: {user.displayName || user.email}
                    </span>
                  )}
                </div>

                {saveSuccessMessage && (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{saveSuccessMessage}</span>
                    </div>
                    {onViewDashboard && (
                      <button
                        type="button"
                        onClick={onViewDashboard}
                        className="px-3 py-1 bg-white border border-emerald-300 rounded text-emerald-900 font-semibold hover:bg-emerald-50 text-[11px] whitespace-nowrap cursor-pointer"
                      >
                        Open Dashboard →
                      </button>
                    )}
                  </div>
                )}

                {saveErrorMessage && (
                  <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{saveErrorMessage}</span>
                  </div>
                )}

                <div className="space-y-3 pt-1">
                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-white cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={saveConsent}
                      onChange={(e) => {
                        setSaveConsent(e.target.checked);
                        setSaveErrorMessage(null);
                      }}
                      className="rounded text-cyan-600 focus:ring-cyan-500 mt-0.5"
                    />
                    <span className="leading-relaxed">
                      <strong>Explicit Consent:</strong> I authorize City Hospital to securely store this laboratory report summary under my authenticated account profile for my private clinical reference. I understand I can delete this record at any time.
                    </span>
                  </label>

                  <div className="flex items-center gap-3">
                    {user ? (
                      <button
                        type="button"
                        disabled={isSavingReport || !saveConsent}
                        onClick={async () => {
                          setSaveErrorMessage(null);
                          if (!saveConsent) {
                            setSaveErrorMessage('Please check the explicit consent checkbox before saving your health information.');
                            return;
                          }
                          try {
                            setIsSavingReport(true);
                            const res = await saveLabReportToFirestore(report, user.userId);
                            setIsSavingReport(false);
                            if (res?.success) {
                              setSaveSuccessMessage('Assessment successfully archived to your private medical history.');
                            } else {
                              setSaveErrorMessage(res?.error || 'Failed to save report to database.');
                            }
                          } catch (err: any) {
                            setIsSavingReport(false);
                            console.error('Error saving lab report:', err);
                            setSaveErrorMessage('Could not save report to your private medical history. Please check connection and try again.');
                          }
                        }}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <BookmarkPlus className="w-4 h-4 text-cyan-400" />
                        <span>{isSavingReport ? 'Encrypting & Saving...' : 'Save to My Patient Records'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onRequireSignIn}
                        className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Sign In to Save This Report</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Report Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print & Download Summary</span>
                </button>

                <button
                  type="button"
                  onClick={onBookConsultation}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HeartPulse className="w-4 h-4" />
                  <span>Book In-Person Doctor Review</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
