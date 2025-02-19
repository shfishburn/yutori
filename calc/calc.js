import ChartManager from './charts.js';
import { calculateDemographicContext, getPercentileDescriptor, getAgeRange, bodyFatPercentiles } from '/calc/population-data.js';

"use strict";

/***************************************
 * Custom Error Classes
 ***************************************/
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}
class StateError extends Error {
  constructor(message) {
    super(message);
    this.name = "StateError";
  }
}
class DOMError extends Error {
  constructor(message) {
    super(message);
    this.name = "DOMError";
  }
}

/***************************************
 * Input Validation & Error Handling
 ***************************************/
function validateInput(params) {
  if (typeof params !== "object" || params === null) {
    throw new ValidationError("Input parameters must be provided in an object.");
  }
  const validators = {
    initialWeight: (value) => ({
      isValid: typeof value === "number" && isFinite(value) && value > 0,
      message: `Initial weight must be a positive number. Received: ${value}`,
    }),
    bodyFatPct: (value) => ({
      isValid: typeof value === "number" && isFinite(value) && value >= 8 && value <= 40,
      message: `Body fat percentage must be between 8% and 40%. Received: ${value}`,
    }),
    age: (value) => ({
      isValid: typeof value === "number" && isFinite(value) && value >= 18 && value <= 75,
      message: `Age must be between 18 and 75. Received: ${value}`,
    }),
    activityMultiplier: (value) => ({
      isValid: typeof value === "number" && isFinite(value) && value >= 1,
      message: `Activity multiplier must be >= 1. Received: ${value}`,
    }),
    heightCm: (value) => ({
      isValid: typeof value === "number" && isFinite(value) && value > 0,
      message: `Height in centimeters must be positive. Received: ${value}`,
    }),
    dietaryApproach: (value) => ({
      isValid: ["balanced", "low-carb", "high-protein"].includes(value),
      message: `Invalid dietary approach. Received: ${value}`,
    }),
  };
  const errors = [];
  for (const [key, validator] of Object.entries(validators)) {
    if (params[key] !== undefined) {
      const result = validator(params[key]);
      if (!result.isValid) {
        errors.push({ field: key, message: result.message });
      }
    }
  }
  if (errors.length > 0) {
    throw new ValidationError(`Validation errors: ${errors.map((e) => e.message).join(", ")}`);
  }
  return Object.assign({}, params);
}

function handleCalculatorError(error, context) {
  console.error(`[${context}] ${error.message}`, {
    errorType: error.name,
    stack: error.stack,
  });
  return { error: true, message: "An error occurred during calculation. Please check your input." };
}

/***************************************
 * Helper Functions
 ***************************************/
function setTextContent(id, value) {
  try {
    const el = document.getElementById(id);
    if (!el) {
      throw new DOMError(`Element with id '${id}' not found.`);
    }
    el.textContent = value;
  } catch (error) {
    console.error(`Error in setTextContent for id ${id}:`, error);
  }
}

function fmtWeight(weight, isKg) {
  if (typeof weight !== "number") {
    console.error("fmtWeight expects a number; received:", typeof weight);
    return "";
  }
  return isKg ? (weight / 2.20462).toFixed(2) + " kg" : weight.toFixed(2) + " lbs";
}

function getBFCat(ratio, gender) {
  const bfPercent = ratio * 100;
  let classifications;
  if (gender === "male") {
    classifications = [
      { min: 3, max: 5, name: "Essential Fat" },
      { min: 6, max: 13, name: "Below Average/Athletes" },
      { min: 14, max: 17, name: "General Fitness" },
      { min: 18, max: 24, name: "Average/Acceptable" },
      { min: 25, max: Infinity, name: "Obese (Level I & II)" },
    ];
  } else {
    classifications = [
      { min: 9, max: 11, name: "Essential Fat" },
      { min: 12, max: 19, name: "Below Average/Athletes" },
      { min: 20, max: 24, name: "General Fitness" },
      { min: 25, max: 29, name: "Average/Acceptable" },
      { min: 30, max: Infinity, name: "Obese (Level I & II)" },
    ];
  }
  for (let i = 0; i < classifications.length; i++) {
    const cls = classifications[i];
    if (bfPercent >= cls.min && bfPercent <= cls.max) {
      return cls.name;
    }
  }
  return classifications[0].name;
}

function calculateMacros(calories, approach) {
  const distributions = {
    balanced: { carbs: 0.40, protein: 0.30, fat: 0.30 },
    "low-carb": { carbs: 0.25, protein: 0.40, fat: 0.35 },
    "high-protein": { carbs: 0.35, protein: 0.45, fat: 0.20 },
  };
  const dist = distributions[approach] || distributions.balanced;
  return {
    protein: Math.round((calories * dist.protein) / 4),
    carbs: Math.round((calories * dist.carbs) / 4),
    fat: Math.round((calories * dist.fat) / 9),
  };
}

/***************************************
 * Dynamic Simulation Function (with targetBF override)
 ***************************************/
function simulateDynamicMetabolicAdaptation(params) {
  try {
    const validatedParams = validateInput(params);
    let {
      initialWeight,
      isKg,
      bodyFatPct,
      age,
      gender,
      activityMultiplier,
      deficitValue,
      dietaryApproach,
      heightCm,
      targetBFRange,
      targetBF,
    } = validatedParams;

    const userTargetBF = targetBF !== undefined ? targetBF : targetBFRange.min;
    const safeMinBF = gender === "male" ? 10 : 15;
    const effectiveTargetBF = Math.max(userTargetBF, safeMinBF);

    let currentWeight = isKg ? initialWeight * 2.20462 : initialWeight;
    let currentFat = currentWeight * (bodyFatPct / 100);
    let currentLean = currentWeight - currentFat;
    let currentBF = bodyFatPct;

    const weightKg = isKg ? initialWeight : currentWeight / 2.20462;
    const baselineRMR =
      gender === "male"
        ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    const baselineTDEE = baselineRMR * activityMultiplier;

    const dailyDeficit = Number(deficitValue);
    const weeklyDeficit = Math.abs(dailyDeficit) * 7;
    const beta = 0.10;
    const E_eff = 4000;

    function partitionFatRatio(bf) {
      if (bf > 30) return 0.90;
      else if (bf >= 20 && bf <= 30) return 0.75;
      else return 0.60;
    }

    let week = 0;
    let weeklyData = [];
    const startDate = new Date();

    while (currentBF > effectiveTargetBF) {
      const adaptiveLoss = beta * weeklyDeficit;
      const effectiveDeficit = weeklyDeficit - adaptiveLoss;
      const deltaWeight = effectiveDeficit / E_eff;

      const fatRatio = partitionFatRatio(currentBF);
      const fatLoss = deltaWeight * fatRatio;
      const leanLoss = deltaWeight - fatLoss;

      currentWeight -= deltaWeight;
      currentFat -= fatLoss;
      currentLean -= leanLoss;
      currentBF = (currentFat / currentWeight) * 100;

      const currentWeightKg = currentWeight / 2.20462;
      const currentRMR =
        gender === "male"
          ? 10 * currentWeightKg + 6.25 * heightCm - 5 * age + 5
          : 10 * currentWeightKg + 6.25 * heightCm - 5 * age - 161;
      const currentTDEE = currentRMR * activityMultiplier;
      let targetCalories = currentTDEE + dailyDeficit;
      targetCalories = Math.max(targetCalories, gender === "male" ? 1500 : 1200);
      const macros = calculateMacros(targetCalories, dietaryApproach);

      let weekDate = new Date(startDate);
      weekDate.setDate(startDate.getDate() + (week + 1) * 7);

      weeklyData.push({
        week: week + 1,
        totalWeight: currentWeight,
        leanMass: currentLean,
        fatMass: currentFat,
        bodyFatPercent: currentBF,
        rmr: currentRMR,
        tdee: currentTDEE,
        targetCalories: targetCalories,
        macros: macros,
        fatLoss: fatLoss,
        leanLoss: leanLoss,
        weeklyWeightLoss: deltaWeight,
        weekDate: weekDate,
      });

      week++;
      if (week > 500) {
        console.warn("Simulation exceeded 500 weeks; terminating loop.");
        break;
      }
    }

    return {
      initialStats: {
        totalWeight: initialWeight,
        leanMass: initialWeight * (1 - bodyFatPct / 100),
        fatMass: initialWeight * (bodyFatPct / 100),
        bodyFatPct: bodyFatPct,
      },
      weeklyData: weeklyData,
      baselineRMR: baselineRMR,
      baselineTDEE: baselineTDEE,
      startDate: startDate,
      endDate: weeklyData.length ? weeklyData[weeklyData.length - 1].weekDate : startDate,
    };
  } catch (error) {
    return handleCalculatorError(error, "simulateDynamicMetabolicAdaptation");
  }
}

/***************************************
 * Feature Flag & Legacy Simulation (if needed)
 ***************************************/
const useDynamicModel = true;
function simulateMetabolicAdaptationWeekly(params) {
  return {};
}

/***************************************
 * Populate Goal Body Fat Options Based on Gender
 ***************************************/
function populateGoalBodyFatOptions(gender) {
  let options;
  if (gender === "male") {
    options = [
      { value: "athletic", label: "Below Average/Athletes (6-13%)", targetRange: { min: 6, max: 13 } },
      { value: "fitness", label: "General Fitness (14-17%)", targetRange: { min: 14, max: 17 } },
      { value: "average", label: "Average/Acceptable (18-24%)", targetRange: { min: 18, max: 24 } },
      { value: "obese", label: "Obese (25% or more)", targetRange: { min: 25, max: 35 } },
    ];
  } else {
    options = [
      { value: "athletic", label: "Below Average/Athletes (12-19%)", targetRange: { min: 12, max: 19 } },
      { value: "fitness", label: "General Fitness (20-24%)", targetRange: { min: 20, max: 24 } },
      { value: "average", label: "Average/Acceptable (25-29%)", targetRange: { min: 25, max: 29 } },
      { value: "obese", label: "Obese (30% or more)", targetRange: { min: 30, max: 40 } },
    ];
  }
  const goalSelect = document.getElementById("fatGoalCategorySelect");
  if (!goalSelect) {
    console.error("Fat goal select element not found.");
    return;
  }
  const previousValue = goalSelect.value;
  goalSelect.innerHTML = "";
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  placeholderOption.textContent = "Select a Body Fat Goal";
  goalSelect.appendChild(placeholderOption);

  options.forEach((opt) => {
    const optionEl = document.createElement("option");
    optionEl.value = opt.value;
    optionEl.dataset.targetMin = opt.targetRange.min;
    optionEl.dataset.targetMax = opt.targetRange.max;
    optionEl.textContent = opt.label;
    goalSelect.appendChild(optionEl);
  });

  if (goalSelect.querySelector(`option[value="${previousValue}"]`)) {
    goalSelect.value = previousValue;
  } else {
    goalSelect.value = "fitness";
  }
}
document.querySelectorAll('input[name="gender"]').forEach((radio) => {
  radio.addEventListener("change", function () {
    populateGoalBodyFatOptions(this.value);
  });
});

/***************************************
 * ChartManager Class & Chart Rendering
 ***************************************/
let chartManager = new ChartManager();

/***************************************
 * UI & Navigation Functions
 ***************************************/
const steps = Array.from(document.querySelectorAll(".wizard-step"));
let currentStepIndex = 0;
function showStep(index) {
  steps.forEach((s, i) => {
    if (i === index) {
      s.classList.add("active");
    } else {
      s.classList.remove("active");
    }
  });
  currentStepIndex = index;
}
function getActiveStepId() {
  const active = document.querySelector(".wizard-step.active");
  return active ? active.id : null;
}
function clearErrors(stepEl) {
  stepEl.querySelectorAll(".error-message").forEach((e) => e.remove());
  stepEl.querySelectorAll(".invalid-input").forEach((inp) => inp.classList.remove("invalid-input"));
}
function showError(inputEl, msg) {
  inputEl.classList.add("invalid-input");
  const e = document.createElement("div");
  e.className = "error-message";
  e.textContent = msg;
  inputEl.insertAdjacentElement("afterend", e);
}
function validateCurrentStep() {
  clearErrors(steps[currentStepIndex]);
  const unit = document.querySelector('input[name="unit"]:checked')?.value;
  const heightInput = document.getElementById("heightInput");
  const ageInput = document.getElementById("ageInput");
  const weightInput = document.getElementById("totalWeightInput");
  const bfInput = document.getElementById("bodyFatPctInput");
  const heightVal = parseFloat(heightInput.value);
  const ageVal = parseInt(ageInput.value || "", 10);
  const weightVal = parseFloat(weightInput.value);
  const bfVal = parseFloat(bfInput.value);
  if (!unit) {
    showError(heightInput, "Please select a unit (lbs or kg).");
    return false;
  }
  if (isNaN(ageVal) || ageVal < 18 || ageVal > 75) {
    showError(ageInput, "Age must be between 18 and 75.");
    return false;
  }
  if (isNaN(bfVal) || bfVal < 8 || bfVal > 40) {
    showError(bfInput, "BF% must be between 8 and 40.");
    return false;
  }
  if (unit === "lbs") {
    if (isNaN(heightVal) || heightVal < 60 || heightVal > 84) {
      showError(heightInput, "Height must be between 60 and 84 inches.");
      return false;
    }
    if (isNaN(weightVal) || weightVal < 100 || weightVal > 400) {
      showError(weightInput, "Weight must be between 100 and 400 lbs.");
      return false;
    }
  } else if (unit === "kg") {
    if (isNaN(heightVal) || heightVal < 152 || heightVal > 213) {
      showError(heightInput, "Height must be between 152 and 213 cm.");
      return false;
    }
    if (isNaN(weightVal) || weightVal < 45 || weightVal > 181) {
      showError(weightInput, "Weight must be between 45 and 181 kg.");
      return false;
    }
  }
  return true;
}

/***************************************
 * doFinalCalculation
 ***************************************/
async function doFinalCalculation() {
  try {
    const unit = document.querySelector('input[name="unit"]:checked').value;
    const isKg = unit === "kg";
    const weightVal = parseFloat(document.getElementById("totalWeightInput").value);
    const bfVal = parseFloat(document.getElementById("bodyFatPctInput").value);
    const ageVal = parseInt(document.getElementById("ageInput").value) || 30;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const heightVal = parseFloat(document.getElementById("heightInput").value);
    const heightCm = unit === "lbs" ? heightVal * 2.54 : heightVal;
    const af = parseFloat(document.getElementById("activityLevelSelect").value) || 1.55;
    const dailyAdjVal = document.getElementById("dailyAdjustmentSelect").value;
    const dietary = document.querySelector('input[name="dietaryApproach"]:checked').value;

    // Preserve the user's selection from Step 2
    const fatGoalOption = document.getElementById("fatGoalCategorySelect").selectedOptions[0];
    const targetBFRange = {
      min: Number(fatGoalOption.dataset.targetMin),
      max: Number(fatGoalOption.dataset.targetMax),
    };

    // Simulation parameters
    const simParams = {
      initialWeight: weightVal,
      isKg: false,
      bodyFatPct: bfVal,
      age: ageVal,
      gender: gender,
      activityMultiplier: af,
      weightGoal: "lose",
      deficitValue: String(dailyAdjVal),
      dietaryApproach: dietary,
      targetBFRange: targetBFRange,
      heightCm: heightCm,
    };

    // Run simulation for min & max target BF% in the target range
    const simResultLower = simulateDynamicMetabolicAdaptation({ ...simParams, targetBF: targetBFRange.min });
    const simResultUpper = simulateDynamicMetabolicAdaptation({ ...simParams, targetBF: targetBFRange.max });
    if (simResultLower.error || simResultUpper.error) {
      console.error("Calculation halted due to simulation error.");
      return;
    }

    // Current stats from the simulation
    const currentStats = simResultLower.initialStats;
    setTextContent("currentWeightSpan", fmtWeight(currentStats.totalWeight, false));
    setTextContent("currentLeanSpan", fmtWeight(currentStats.leanMass, false));
    setTextContent("currentFatSpan", fmtWeight(currentStats.fatMass, false) + ` (${currentStats.bodyFatPct.toFixed(1)}%)`);
    setTextContent("currentBFpctSpan", currentStats.bodyFatPct.toFixed(1) + "%");
    setTextContent("currentBFcatSpan", getBFCat(currentStats.fatMass / currentStats.totalWeight, gender));

    // Populate Step 3 Summary fields
    const unitText = unit === "lbs" ? "lbs/inches" : "kg/cm";
    setTextContent("summaryGender", gender);
    setTextContent("summaryAge", ageVal);
    setTextContent("summaryUnits", unitText);
    setTextContent("summaryHeight", heightVal);
    setTextContent("summaryTotalWeight", weightVal);
    setTextContent("summaryBodyFatPct", bfVal + "%");
    setTextContent("summaryDietary", dietary);
    setTextContent("summaryActivity", document.getElementById("activityLevelSelect").selectedOptions[0].textContent);
    setTextContent("summaryCalorieDeficit", dailyAdjVal);
    setTextContent("summaryFatGoal", fatGoalOption.textContent);

    // Final stats from the simulation (lower & upper)
    const finalWeekLower = simResultLower.weeklyData[simResultLower.weeklyData.length - 1];
    const finalWeekUpper = simResultUpper.weeklyData[simResultUpper.weeklyData.length - 1];

    const finalWeightRange = [finalWeekLower.totalWeight, finalWeekUpper.totalWeight].sort((a, b) => a - b);
    const fatMassRange = [finalWeekLower.fatMass, finalWeekUpper.fatMass].sort((a, b) => a - b);
    const leanMassRange = [finalWeekLower.leanMass, finalWeekUpper.leanMass].sort((a, b) => a - b);
    const bfRange = [finalWeekLower.bodyFatPercent, finalWeekUpper.bodyFatPercent].sort((a, b) => a - b);

    const totalWeightLossLower = currentStats.totalWeight - finalWeekLower.totalWeight;
    const totalWeightLossUpper = currentStats.totalWeight - finalWeekUpper.totalWeight;
    const leanLossLower = currentStats.leanMass - finalWeekLower.leanMass;
    const leanLossUpper = currentStats.leanMass - finalWeekUpper.leanMass;
    const fatLossLower = currentStats.fatMass - finalWeekLower.fatMass;
    const fatLossUpper = currentStats.fatMass - finalWeekUpper.fatMass;

    setTextContent("goalWeightSpan", `${fmtWeight(finalWeightRange[0], false)} - ${fmtWeight(finalWeightRange[1], false)}`);
    setTextContent("goalFatSpan", `${fmtWeight(fatMassRange[0], false)} - ${fmtWeight(fatMassRange[1], false)}`);
    setTextContent("goalLeanSpan", `${fmtWeight(leanMassRange[0], false)} - ${fmtWeight(leanMassRange[1], false)}`);
    setTextContent("goalBFpctSpan", `${bfRange[0].toFixed(1)}% - ${bfRange[1].toFixed(1)}%`);
    setTextContent("goalBFcatSpan", getBFCat(finalWeekLower.fatMass / finalWeekLower.totalWeight, gender));

    // Re-populate summary subfields
    setTextContent("currentWeightInputSpan", fmtWeight(currentStats.totalWeight, false));
    setTextContent("bodyFatPctInputSpan", currentStats.bodyFatPct.toFixed(1) + "%");
    const totalWLRange = [totalWeightLossLower, totalWeightLossUpper].sort((a, b) => a - b);
    setTextContent("totalWeightLossSpan", `${totalWLRange[0].toFixed(2)} - ${totalWLRange[1].toFixed(2)}`);
    const leanLR = [leanLossLower, leanLossUpper].sort((a, b) => a - b);
    setTextContent("leanMassLossSpan", `${leanLR[0].toFixed(2)} - ${leanLR[1].toFixed(2)}`);
    const fatLR = [fatLossLower, fatLossUpper].sort((a, b) => a - b);
    setTextContent("fatLossSpan", `${fatLR[0].toFixed(2)} - ${fatLR[1].toFixed(2)}`);

    // Timeline information
    setTextContent("calorieDeficitSpan", dailyAdjVal);
    const weeklyLoss = simResultLower.weeklyData.length ? simResultLower.weeklyData[0].weeklyWeightLoss.toFixed(2) : "0";
    setTextContent("weeklyWeightLossSpan", weeklyLoss);
    const options = { month: "short", day: "numeric", year: "numeric" };
    setTextContent("startDate", simResultLower.startDate.toLocaleDateString(undefined, options));
    setTextContent("endDate", `${simResultLower.endDate.toLocaleDateString(undefined, options)} - ${simResultUpper.endDate.toLocaleDateString(undefined, options)}`);

    // Timeline goal range
    setTextContent("timelineHighWeight", `${finalWeekUpper.totalWeight.toFixed(2)} lbs`);
    setTextContent("timelineHighWeeks", `${finalWeekUpper.week} weeks`);
    setTextContent("timelineHighDate", finalWeekUpper.weekDate.toLocaleDateString(undefined, options));
    setTextContent("timelineLowWeight", `${finalWeekLower.totalWeight.toFixed(2)} lbs`);
    setTextContent("timelineLowWeeks", `${finalWeekLower.week} weeks`);
    setTextContent("timelineLowDate", finalWeekLower.weekDate.toLocaleDateString(undefined, options));
    setTextContent("timelineDeficitSpan", dailyAdjVal);

    // Demographic Context updates
    const ageRangeVal = getAgeRange(ageVal);
    const demographicData = bodyFatPercentiles[gender][ageRangeVal];
    if (demographicData) {
      if (gender === "male" && ageRangeVal === "60-69") {
        setTextContent("demoAverageBF", "25–30%");
        setTextContent("demoFitnessBF", "13–20%");
      } else {
        setTextContent("demoAverageBF", demographicData.categories.average.range);
        setTextContent("demoFitnessBF", demographicData.categories.fitness.range);
      }
    } else {
      setTextContent("demoAverageBF", "--");
      setTextContent("demoFitnessBF", "--");
    }

    // Get demographic context for current and goal BF.
    let currentDemo, goalDemo;
    if (gender === "female") {
      currentDemo = calculateDemographicContext(currentStats.bodyFatPct, ageVal, gender);
      goalDemo = calculateDemographicContext(finalWeekLower.bodyFatPercent, ageVal, gender);
    } else {
      if (demographicData) {
        // For males, use the demographicData for both current and goal risks.
        currentDemo = { 
          percentile: 50, 
          healthRisks: demographicData.healthRisks || [] 
        };
        goalDemo = { 
          percentile: 50, 
          healthRisks: demographicData.healthRisks || [] 
        };
      } else {
        currentDemo = { healthRisks: [] };
        goalDemo = { healthRisks: [] };
      }
    }
    setTextContent("demoCurrentBF", currentStats.bodyFatPct.toFixed(1));
    if (currentDemo && currentDemo.healthRisks) {
      setTextContent("demoCurrentPercentile", getPercentileDescriptor(currentDemo.percentile || 50));
    } else {
      setTextContent("demoCurrentPercentile", "N/A");
    }
    setTextContent("demoGoalBF", finalWeekLower.bodyFatPercent.toFixed(1));
    if (goalDemo && goalDemo.healthRisks) {
      setTextContent("demoGoalPercentile", getPercentileDescriptor(goalDemo.percentile || 50));
      setTextContent("demoGoalBFRange", gender === "male" ? demographicData.categories.average.range : goalDemo.range);
      setTextContent("demoGoalPercentileRange", gender === "male" ? "Derived" : goalDemo.percentileRange);
    } else {
      setTextContent("demoGoalPercentile", "N/A");
      setTextContent("demoGoalBFRange", `${targetBFRange.min}% - ${targetBFRange.max}%`);
      setTextContent("demoGoalPercentileRange", "N/A");
    }

    // Populate Data Sources
    if (demographicData && demographicData.sourceStudies) {
      const studiesHTML = demographicData.sourceStudies.map(study => {
        return `<li><strong>${study.name}:</strong> ${study.sampleSize}, ${study.method}. ${study.citation}</li>`;
      }).join("");
      document.getElementById("demoSourceStudies").innerHTML = studiesHTML;
    }

    // Populate Health Risks table with descriptions
    let healthRisksHTML = "";
    if (
      currentDemo &&
      currentDemo.healthRisks &&
      currentDemo.healthRisks.length > 0 &&
      goalDemo &&
      goalDemo.healthRisks &&
      goalDemo.healthRisks.length > 0
    ) {
      currentDemo.healthRisks.forEach((risk, i) => {
        const goalRisk = goalDemo.healthRisks[i] || { riskLevel: "N/A", description: "N/A" };
        healthRisksHTML += `
          <tr>
            <td class="p-2 text-sm">${risk.condition}</td>
            <td class="p-2 text-sm">${risk.riskLevel}</td>
            <td class="p-2 text-sm">${risk.description}</td>
            <td class="p-2 text-sm">${goalRisk.riskLevel}</td>
            <td class="p-2 text-sm">${goalRisk.description}</td>
          </tr>
        `;
      });
      document.getElementById("healthRisksTable").innerHTML = healthRisksHTML;
    } else {
      document.getElementById("healthRisksTable").innerHTML = `<tr><td colspan="5" class="p-2 text-sm">No health risk data available.</td></tr>`;
    }

    // Dynamic description for goal BF
    let desc = `Your target body fat of ${finalWeekLower.bodyFatPercent.toFixed(1)}% falls into the category "${getPercentileDescriptor(goalDemo ? goalDemo.percentile : 0)}".`;
    setTextContent("demoGoalDescription", desc);

    // Render charts in Step 3
    try {
      console.log("About to render charts with data:", simResultLower.weeklyData);
      await chartManager.renderForecastCharts(simResultLower.weeklyData, simResultLower.startDate);
      console.log("Charts rendered successfully");
      showStep(2); // Switch to Step 3 view
    } catch (error) {
      console.error("Error rendering forecast charts:", error);
    }
  } catch (error) {
    console.error("Error in doFinalCalculation:", error);
  }
}

/***************************************
 * Event Listeners
 ***************************************/
document.querySelectorAll("[data-next-step]").forEach((btn) => {
  btn.addEventListener("click", () => {
    try {
      if (!validateCurrentStep()) return;
      showStep(currentStepIndex + 1);
    } catch (error) {
      console.error("Error in next-step event:", error);
    }
  });
});
document.querySelectorAll("[data-prev-step]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (getActiveStepId() === "step3") {
      ["calorieChart", "macroChart", "weightChart"].forEach((id) => chartManager.destroyChart(id));
    }
    showStep(currentStepIndex - 1);
  });
});
document.getElementById("calculateButton").addEventListener("click", async () => {
  try {
    clearErrors(steps[currentStepIndex]);
    const dailyAdj = parseFloat(document.getElementById("dailyAdjustmentSelect").value) || 0;
    if (dailyAdj > 0) {
      showError(document.getElementById("dailyAdjustmentSelect"), "For weight loss, select a deficit (negative value)");
      return;
    }
    await doFinalCalculation();
  } catch (error) {
    console.error("Error during calculateButton click:", error);
  }
});

document.querySelectorAll("[data-open-modal]").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const modalId = a.getAttribute("data-open-modal");
    document.getElementById(modalId).style.display = "flex";
  });
});
document.querySelectorAll(".close-modal-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-close-modal");
    document.getElementById(id).style.display = "none";
  });
});
document.getElementById("disclaimerLink")?.addEventListener("click", () => {
  document.getElementById("disclaimerModal").style.display = "flex";
});

/***************************************
 * Export Controls Event Listeners
 ***************************************/
document.getElementById("printResultsBtn").addEventListener("click", () => {
  window.print();
});
document.getElementById("saveAsPdfBtn").addEventListener("click", () => {
  // Using html2pdf.js (ensure the library is included in your HTML)
  const element = document.getElementById("calculator");
  html2pdf()
    .from(element)
    .save()
    .catch((err) => console.error("Error generating PDF:", err));
});

/***************************************
 * Test Simulation (for development)
 ***************************************/
function runTestCases() {
  const baseParams = {
    age: 62,
    gender: "male",
    heightInches: 72,
    totalWeight: 288,
    bodyFatPct: 36,
  };
  const heightCm = baseParams.heightInches * 2.54;
  const testCase1 = simulateDynamicMetabolicAdaptation({
    initialWeight: baseParams.totalWeight,
    isKg: false,
    bodyFatPct: baseParams.bodyFatPct,
    age: baseParams.age,
    gender: baseParams.gender,
    activityMultiplier: 1.2,
    weightGoal: "lose",
    deficitValue: "-250",
    dietaryApproach: "low-carb",
    targetBFRange: { min: 6, max: 13 },
    heightCm: heightCm,
  });
  console.log("Test Case 1 (Sedentary, Low-Carb, Dynamic):", JSON.stringify(testCase1, null, 2));

  const testCase2 = simulateDynamicMetabolicAdaptation({
    initialWeight: baseParams.totalWeight,
    isKg: false,
    bodyFatPct: baseParams.bodyFatPct,
    age: baseParams.age,
    gender: baseParams.gender,
    activityMultiplier: 1.375,
    weightGoal: "lose",
    deficitValue: "-250",
    dietaryApproach: "high-protein",
    targetBFRange: { min: 6, max: 13 },
    heightCm: heightCm,
  });
  console.log("Test Case 2 (Light Activity, High-Protein, Dynamic):", JSON.stringify(testCase2, null, 2));

  const testCase3 = simulateDynamicMetabolicAdaptation({
    initialWeight: baseParams.totalWeight,
    isKg: false,
    bodyFatPct: baseParams.bodyFatPct,
    age: baseParams.age,
    gender: baseParams.gender,
    activityMultiplier: 1.55,
    weightGoal: "lose",
    deficitValue: "-250",
    dietaryApproach: "balanced",
    targetBFRange: { min: 6, max: 13 },
    heightCm: heightCm,
  });
  console.log("Test Case 3 (Moderate Activity, Balanced, Dynamic):", JSON.stringify(testCase3, null, 2));
}
runTestCases();

document.addEventListener("DOMContentLoaded", function () {
  const defaultGender = document.querySelector('input[name="gender"]:checked').value;
  populateGoalBodyFatOptions(defaultGender);
});
