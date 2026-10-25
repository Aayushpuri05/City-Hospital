import {
  LabTestKey,
  AnalyzedTestItem,
  LabAnalysisReport,
  ResultClassification
} from '../types';
import { LAB_TESTS_METADATA } from '../data/mockData';

export interface AnalyzerInput {
  patientSex: 'male' | 'female';
  patientAge: number;
  isPregnant?: boolean;
  values: Partial<Record<LabTestKey, number | string | null | undefined>>;
  customRanges?: Partial<Record<LabTestKey, { min?: number; max?: number }>>;
}

export function analyzeLabReport(input: AnalyzerInput): LabAnalysisReport {
  const { patientSex, patientAge, isPregnant = false, values, customRanges = {} } = input;
  const analyzedItems: AnalyzedTestItem[] = [];
  let abnormalCount = 0;
  let criticalCount = 0;

  const activeKeys: LabTestKey[] = [
    'hemoglobin',
    'wbc',
    'platelets',
    'mcv',
    'fasting_glucose',
    'hba1c',
    'creatinine',
    'alt'
  ];

  for (const key of activeKeys) {
    const rawVal = values[key];
    if (rawVal === undefined || rawVal === null || rawVal === '') continue;

    const numVal = typeof rawVal === 'string' ? parseFloat(rawVal) : rawVal;
    if (isNaN(numVal)) continue;

    const meta = LAB_TESTS_METADATA[key];
    if (!meta) continue;

    // Determine reference range (custom vs sex-based default)
    const custom = customRanges[key];
    const defaultRange = patientSex === 'male' ? meta.defaultMaleRange : meta.defaultFemaleRange;
    const minRange = (custom && custom.min !== undefined && !isNaN(custom.min)) ? custom.min : defaultRange[0];
    const maxRange = (custom && custom.max !== undefined && !isNaN(custom.max)) ? custom.max : defaultRange[1];

    const sourceOfRange = custom && (custom.min !== undefined || custom.max !== undefined)
      ? 'Custom user laboratory report interval'
      : `Standard adult ${patientSex} reference range`;

    const displayInterval = `${minRange} – ${maxRange} ${meta.unit}`;

    // Plausibility check
    const isPlausible = numVal >= meta.plausibleRange[0] && numVal <= meta.plausibleRange[1];

    // Classification & Next-step guidance logic
    let classification: ResultClassification = 'within_range';
    let badgeColor: 'emerald' | 'amber' | 'rose' | 'sky' = 'emerald';
    let statusLabel = 'Within Normal Range';
    let interpretationText = '';
    const possibleReasons: string[] = [];
    const nextSteps: string[] = [];
    let urgentNotice: string | undefined = undefined;
    let isUrgent = false;

    if (!isPlausible) {
      classification = 'clinical_interpretation_needed';
      badgeColor = 'rose';
      statusLabel = 'Physiological Limit Alert';
      interpretationText = `The entered value (${numVal} ${meta.unit}) falls outside typical physiological limits. Please confirm accuracy with your paper report.`;
      nextSteps.push('Verify number and decimal point from your original laboratory report.');
    } else if (key === 'fasting_glucose') {
      // Specialized Screening Thresholds for Fasting Blood Glucose
      if (numVal < 70) {
        if (numVal < 55) {
          classification = 'critical_low';
          badgeColor = 'rose';
          statusLabel = 'Critical Low (Severe Hypoglycemia Risk)';
          isUrgent = true;
          urgentNotice = 'Fast-acting glucose or carbohydrates recommended if symptomatic (shakiness, diaphoresis, confusion). Seek immediate emergency medical care if persistent or accompanied by neuroglycopenic symptoms.';
        } else {
          classification = 'abnormal_low';
          badgeColor = 'amber';
          statusLabel = 'Low (Mild Hypoglycemia)';
        }
        abnormalCount++;
        interpretationText = 'Fasting blood glucose is below the expected minimum of 70 mg/dL. This may reflect prolonged fasting, medication effects, or altered metabolic clearance.';
        possibleReasons.push(...meta.commonCausesLow);
        nextSteps.push('Discuss fasting protocols and any diabetic medications with your clinician.');
      } else if (numVal <= 99) {
        classification = 'within_range';
        badgeColor = 'emerald';
        statusLabel = 'Normal Fasting Range (70–99 mg/dL)';
        interpretationText = 'Normal fasting glucose. Reflects effective basal glycemic homeostasis following an overnight fast.';
        nextSteps.push('Maintain a balanced diet and regular physical activity to sustain healthy metabolic function.');
      } else if (numVal <= 125) {
        classification = 'borderline';
        badgeColor = 'amber';
        statusLabel = 'Prediabetes Range (100–125 mg/dL)';
        abnormalCount++;
        interpretationText = 'Your fasting glucose is in the prediabetes screening bracket (impaired fasting glucose). Note: Screening values identify risk and do not constitute a standalone clinical diagnosis.';
        possibleReasons.push('Early insulin resistance', 'Recent carbohydrate intake if not strictly fasting 8–10 hours', 'Acute physical or psychological stress', 'Medication side effects (e.g., glucocorticoids)');
        nextSteps.push('Repeat fasting glucose or schedule a formal HbA1c test with your primary care physician.');
        nextSteps.push('Discuss evidence-based dietary modifications, cardiovascular exercise, and metabolic screening.');
      } else {
        // >= 126
        if (numVal >= 300) {
          classification = 'critical_high';
          badgeColor = 'rose';
          statusLabel = 'Critical High Glucose (≥300 mg/dL)';
          isUrgent = true;
          urgentNotice = 'Marked hyperglycemia. Risk of acute metabolic decompensation (such as diabetic ketoacidosis or hyperosmolar state). Seek urgent clinical care, especially if nausea, vomiting, or extreme thirst are present.';
        } else {
          classification = 'abnormal_high';
          badgeColor = 'rose';
          statusLabel = 'Diabetes Range (≥126 mg/dL)';
        }
        abnormalCount++;
        interpretationText = 'Fasting glucose meets or exceeds the 126 mg/dL screening threshold for diabetes. Definitive diagnosis requires formal confirmation by a healthcare provider (such as a repeat test or confirmatory HbA1c).';
        possibleReasons.push(...meta.commonCausesHigh);
        nextSteps.push('Consult an endocrinologist or primary care doctor for comprehensive diagnostic evaluation.');
        nextSteps.push('Ensure test was conducted after a true 8–10 hour water-only fast.');
      }
    } else if (key === 'hba1c') {
      // Specialized Screening Thresholds for HbA1c
      if (numVal < 5.7) {
        classification = 'within_range';
        badgeColor = 'emerald';
        statusLabel = 'Normal Glycemic Control (<5.7%)';
        interpretationText = 'Your HbA1c is below 5.7%, indicating normal 2 to 3-month average blood glucose levels.';
        nextSteps.push('Continue healthy nutritional habits and annual routine checkups.');
      } else if (numVal <= 6.4) {
        classification = 'borderline';
        badgeColor = 'amber';
        statusLabel = 'Prediabetes Range (5.7%–6.4%)';
        abnormalCount++;
        interpretationText = 'HbA1c between 5.7% and 6.4% indicates elevated average blood sugar over the last 90 days, consistent with prediabetes screening criteria.';
        possibleReasons.push('Progressive insulin resistance', 'Dietary pattern rich in ultra-processed carbohydrates', 'Sedentary routine or genetic predisposition');
        nextSteps.push('Review this result with your doctor for lifestyle interventions proven to prevent progression.');
        nextSteps.push('Consider testing fasting lipid profile and blood pressure alongside glycemic markers.');
      } else {
        // >= 6.5%
        if (numVal >= 10.0) {
          classification = 'critical_high';
          badgeColor = 'rose';
          statusLabel = 'Significantly Elevated (≥10.0%)';
          isUrgent = true;
          urgentNotice = 'Substantially elevated 3-month glycemic exposure. Prompt medical evaluation is required to evaluate regimen adjustments and prevent microvascular complications.';
        } else {
          classification = 'abnormal_high';
          badgeColor = 'rose';
          statusLabel = 'Diabetes Threshold (≥6.5%)';
        }
        abnormalCount++;
        interpretationText = 'HbA1c is at or above 6.5%. Clinical guidelines consider this consistent with diabetes, but confirmation through clinical assessment and repeat testing is standard practice.';
        possibleReasons.push(...meta.commonCausesHigh);
        nextSteps.push('Schedule an in-person appointment with an internal medicine doctor or endocrinologist.');
        nextSteps.push('Do not start, stop, or adjust prescription medications without direct medical supervision.');
      }
    } else {
      // General Tests (Hemoglobin, WBC, Platelets, MCV, Creatinine, ALT)
      // Check critical thresholds first
      if (meta.criticalLow && numVal < meta.criticalLow) {
        classification = 'critical_low';
        badgeColor = 'rose';
        statusLabel = 'Critically Low';
        isUrgent = true;
        urgentNotice = `Critically low ${meta.shortName}. Immediate clinical review is strongly advised to prevent severe medical complications.`;
        abnormalCount++;
      } else if (meta.criticalHigh && numVal > meta.criticalHigh) {
        classification = 'critical_high';
        badgeColor = 'rose';
        statusLabel = 'Critically Elevated';
        isUrgent = true;
        urgentNotice = `Critically elevated ${meta.shortName}. This degree of elevation warrants prompt in-person medical evaluation.`;
        abnormalCount++;
      } else if (numVal < minRange) {
        classification = 'abnormal_low';
        badgeColor = 'amber';
        statusLabel = 'Below Normal Range';
        abnormalCount++;
      } else if (numVal > maxRange) {
        classification = 'abnormal_high';
        badgeColor = 'amber';
        statusLabel = 'Above Normal Range';
        abnormalCount++;
      } else {
        classification = 'within_range';
        badgeColor = 'emerald';
        statusLabel = 'Within Reference Range';
      }

      // Contextual explanations
      if (classification === 'within_range') {
        interpretationText = `Your result of ${numVal} ${meta.unit} is within the laboratory reference interval (${minRange}–${maxRange} ${meta.unit}). Normal values suggest balanced physiology but do not rule out all medical conditions.`;
        nextSteps.push('No immediate action required for this test in isolation. Discuss overall findings during routine follow-ups.');
      } else if (numVal < minRange) {
        interpretationText = `Your result is lower than the reference interval (${minRange}–${maxRange} ${meta.unit}). An abnormal finding does not automatically indicate a specific disease and must be reviewed in whole-body context.`;
        possibleReasons.push(...meta.commonCausesLow);
        nextSteps.push(`Discuss this low ${meta.shortName} finding with your healthcare provider.`);
      } else {
        interpretationText = `Your result is higher than the reference interval (${minRange}–${maxRange} ${meta.unit}). Isolated elevations frequently relate to temporary physiological shifts, medications, or specific organ stress.`;
        possibleReasons.push(...meta.commonCausesHigh);
        nextSteps.push(`Review this elevated ${meta.shortName} with your physician to determine if re-testing or additional workup is warranted.`);
      }

      // Creatinine-specific context reminder
      if (key === 'creatinine') {
        interpretationText += ' (Clinical note: Serum creatinine must always be interpreted alongside hydration, muscle mass, age, and estimated GFR rather than used in isolation to diagnose kidney disease).';
      }
    }

    if (isUrgent) {
      criticalCount++;
    }

    analyzedItems.push({
      id: key,
      name: meta.name,
      value: numVal,
      unit: meta.unit,
      referenceIntervalUsed: displayInterval,
      sourceOfRange,
      classification,
      badgeColor,
      statusLabel,
      whatItMeasures: meta.whatItMeasures,
      interpretationText,
      possibleReasons,
      nextSteps,
      urgentReviewPrompt: urgentNotice || null,
      isUrgent
    });
  }

  // Cross-Test Multi-Marker Synthesis
  const multiMarkerInsights: string[] = [];
  const doctorDiscussionQuestions: string[] = [
    'Are my laboratory values consistent with my overall medical history, symptoms, and current lifestyle?',
    'Should any of these tests be re-checked in 4 to 12 weeks to distinguish transient fluctuations from chronic trends?'
  ];

  const valMap = (k: LabTestKey): number | null => {
    const item = analyzedItems.find((i) => i.id === k);
    return item ? item.value : null;
  };

  const hb = valMap('hemoglobin');
  const mcv = valMap('mcv');
  const glucose = valMap('fasting_glucose');
  const a1c = valMap('hba1c');
  const creat = valMap('creatinine');
  const alt = valMap('alt');
  const platelets = valMap('platelets');
  const wbc = valMap('wbc');

  // 1. Anemia Pattern
  if (hb !== null && mcv !== null) {
    const hbMin = patientSex === 'male' ? 13.5 : 12.0;
    if (hb < hbMin && mcv < 80) {
      multiMarkerInsights.push(
        'Microcytic Anemia Correlation: Low hemoglobin accompanied by low MCV (<80 fL) strongly suggests a microcytic red blood cell morphology. The most common etiology is iron deficiency (nutritional or blood loss), though thalassemia minor and anemia of chronic inflammation are differential possibilities.'
      );
      doctorDiscussionQuestions.push('Does my microcytic red blood cell pattern suggest iron deficiency, and should we test Serum Ferritin and Iron Binding Capacity?');
    } else if (hb < hbMin && mcv > 100) {
      multiMarkerInsights.push(
        'Macrocytic Anemia Correlation: Low hemoglobin with high MCV (>100 fL) indicates macrocytic red cells. Common clinical causes include Vitamin B12 deficiency, folate deficiency, alcohol use, thyroid underactivity, or medication effects.'
      );
      doctorDiscussionQuestions.push('Would it be helpful to evaluate Vitamin B12 and Serum Folate levels for my macrocytic blood cell picture?');
    }
  }

  // 2. Glycemic Correlation
  if (glucose !== null && a1c !== null) {
    if (glucose >= 100 || a1c >= 5.7) {
      multiMarkerInsights.push(
        'Dual Glycemic Assessment: Both acute fasting glucose and 3-month HbA1c reflect metabolic regulation. Having both elevated provides an integrated picture of sustained glycemic exposure rather than a single transient spike.'
      );
      doctorDiscussionQuestions.push('What personalized lifestyle, dietary, or pharmacologic steps are recommended based on my combined glucose and HbA1c results?');
    }
  }

  // 3. Hepato-Renal Markers
  if (creat !== null && alt !== null) {
    const creatMax = patientSex === 'male' ? 1.3 : 1.1;
    const altMax = patientSex === 'male' ? 55 : 45;
    if (creat > creatMax && alt > altMax) {
      multiMarkerInsights.push(
        'Combined Hepatorenal Observation: Simultaneous mild elevations in serum creatinine and liver enzymes (ALT) frequently warrant a medication review (such as NSAIDs, statins, or herbal supplements), evaluation of hydration status, and blood pressure monitoring.'
      );
      doctorDiscussionQuestions.push('Could any of my current prescription medications, over-the-counter painkillers, or dietary supplements be affecting my kidney or liver markers?');
    }
  }

  // 4. Immune/Hematologic
  if (wbc !== null && platelets !== null) {
    if (wbc > 11000 && platelets > 450000) {
      multiMarkerInsights.push(
        'Reactive Inflammatory Profile: Concurrently elevated WBC and platelets frequently represent a coordinated reactive response to physical stress, bacterial infection, or tissue inflammation.'
      );
      doctorDiscussionQuestions.push('Are my elevated white cell and platelet counts consistent with a recent bacterial or viral infection?');
    }
  }

  // Pediatric warning
  const isPediatricAlert = patientAge < 18;
  if (isPediatricAlert) {
    multiMarkerInsights.unshift(
      'Pediatric Range Warning: Patient is under 18 years of age. Pediatric reference intervals for hemoglobin, WBC, and alkaline markers differ substantially from adults based on age and pubertal stage. Consult a pediatrician for pediatric-specific evaluation.'
    );
  }

  if (isPregnant) {
    multiMarkerInsights.unshift(
      'Pregnancy Reference Alert: Gestational physiology causes physiologic plasma expansion (lowering hemoglobin and creatinine baselines). Standard non-pregnant reference ranges cannot be reliably applied. Please consult an obstetrician.'
    );
  }

  return {
    id: `LAB-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    patientSex,
    patientAge,
    isPediatricAlert,
    totalTestsEntered: analyzedItems.length,
    abnormalCount,
    criticalCount,
    analyzedItems,
    multiMarkerInsights,
    doctorDiscussionQuestions,
    safetyDisclaimer:
      'This tool provides educational information about laboratory results. It does not diagnose diseases, recommend medications, or replace direct clinical evaluation by a qualified healthcare professional. Do not modify or discontinue prescription therapies based solely on these automated insights.'
  };
}
