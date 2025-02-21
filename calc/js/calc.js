"use strict";

import ChartManager from "./charts.js";
import {
  calculateDemographicContext,
  getPercentileDescriptor,
  getAgeRange,
  bodyFatPercentiles,
  getBFCat
} from "/calc/js/population-data.js";

/***************************************
 * Global State Management
 ***************************************/
const state = {
  steps: [],
  currentStepIndex: 0,
  chartManager: null,
  isCalculating: false,
  cleanupHandlers: [],
  initialized: false
};

/**
 * Adds an event listener and stores its removal function.
 * @param {Element} target - The target element.
 * @param {string} event - The event type.
 * @param {Function} handler - The handler function.
 * @param {Object|boolean} [options] - Optional options.
 */
function addEventListenerWithCleanup(target, event, handler, options) {
  target.addEventListener(event, handler, options);
  state.cleanupHandlers.push(() => {
    target.removeEventListener(event, handler, options);
  });
}

/***************************************
 * DOM Helper Functions
 ***************************************/
function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with id '${id}' not found`);
  }
  return element;
}

function setTextContent(id, text) {
  const element = getElement(id);
  if (element) {
    element.textContent = text;
  }
}

function showError(element, message) {
  if (!element) return;
  clearErrors();
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message text-red-500 text-sm mt-1";
  errorDiv.textContent = message;
  element.classList.add("invalid-input", "border-red-500");
  element.parentNode.insertBefore(errorDiv, element.nextSibling);
}

function clearErrors() {
  document.querySelectorAll(".error-message").forEach((el) => el.remove());
  document.querySelectorAll(".invalid-input").forEach((el) => {
    el.classList.remove("invalid-input", "border-red-500");
  });
}

function showGlobalError(message) {
  const container = getElement("globalErrorContainer");
  if (container) {
    container.textContent = message;
    container.classList.remove("hidden");
  }
}

/***************************************
 * Initialization & Setup
 ***************************************/
document.addEventListener("DOMContentLoaded", () => {
  try {
    console.log("Initializing calculator...");

    // Find all wizard steps.
    state.steps = Array.from(document.querySelectorAll(".wizard-step"));
    if (!state.steps.length) {
      throw new Error("No wizard steps found");
    }

    // Initialize ChartManager.
    state.chartManager = new ChartManager();

    // Set initial step (Step 1 active).
    showStep(0);

    // Populate default values for body fat options and recommendations.
    const defaultGender =
      document.querySelector('input[name="gender"]:checked')?.value.toLowerCase() ||
      "male";
    populateGoalBodyFatOptions(defaultGender);
    updateBFRecommendation();

    // Attach event listeners.
    attachEventListeners();

    state.initialized = true;
    console.log("Calculator initialized successfully");
  } catch (error) {
    console.error("Initialization failed:", error);
    showGlobalError("Failed to initialize calculator. Please refresh the page.");
  }
});

// Cleanup event listeners on unload.
window.addEventListener("beforeunload", () => {
  state.cleanupHandlers.forEach(remove => remove());
});

/***************************************
 * Navigation & Validation Functions
 ***************************************/
function showStep(index) {
  if (index < 0 || index >= state.steps.length) return;
  state.steps.forEach((step, i) => {
    step.classList.toggle("active", i === index);
  });
  state.currentStepIndex = index;
  clearErrors();
}

function validateCurrentStep() {
  clearErrors();
  switch (state.currentStepIndex) {
    case 0:
      return validateStep1();
    case 1:
      return validateStep2();
    default:
      return true;
  }
}

function validateStep1() {
  const requiredFields = ["ageInput", "heightInput", "totalWeightInput", "bodyFatPctInput"];
  let isValid = true;
  for (const fieldId of requiredFields) {
    const field = getElement(fieldId);
    if (!field) continue;
    const value = field.value?.trim();
    if (!value) {
      showError(field, "This field is required");
      isValid = false;
      continue;
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      showError(field, "Please enter a valid number");
      isValid = false;
      continue;
    }
    switch (fieldId) {
      case "ageInput":
        if (numValue < 18 || numValue > 75) {
          showError(field, "Age must be between 18 and 75");
          isValid = false;
        }
        break;
      case "heightInput": {
        const isMetric = document.querySelector('input[name="unit"]:checked')?.value === "kg";
        const minHeight = isMetric ? 120 : 47;
        const maxHeight = isMetric ? 220 : 87;
        if (numValue < minHeight || numValue > maxHeight) {
          showError(field, `Height must be between ${minHeight} and ${maxHeight} ${isMetric ? "cm" : "inches"}`);
          isValid = false;
        }
        break;
      }
      case "bodyFatPctInput":
        if (numValue < 5 || numValue > 60) {
          showError(field, "Body fat % must be between 5 and 60");
          isValid = false;
        }
        break;
    }
  }
  return isValid;
}

function validateStep2() {
  const fatGoalSelect = getElement("fatGoalCategorySelect");
  if (!fatGoalSelect?.value) {
    showError(fatGoalSelect, "Please select a body fat goal");
    return false;
  }
  return true;
}

/***************************************
 * Event Handlers & Listener Attachment
 ***************************************/
function attachEventListeners() {
  // Attach age input "blur" event.
  const ageInput = getElement("ageInput");
  if (ageInput) {
    ageInput.addEventListener("blur", (e) => {
      try {
        handleAgeChange(e);
      } catch (error) {
        console.error("Error in age blur handler:", error);
      }
    });
  }

  // Attach gender radio change events.
  document.querySelectorAll('input[name="gender"]').forEach((radio) => {
    const genderHandler = (e) => {
      try {
        handleGenderChange(e);
      } catch (error) {
        console.error("Error in gender change:", error);
      }
    };
    addEventListenerWithCleanup(radio, "change", genderHandler);
  });

  // Attach Next button events.
  document.querySelectorAll("[data-next-step]").forEach((btn) => {
    const nextHandler = (e) => {
      e.preventDefault();
      try {
        if (validateCurrentStep()) {
          console.log("[DEBUG] Validation passed, advancing to next step.");
          showStep(state.currentStepIndex + 1);
        } else {
          console.log("[DEBUG] Validation failed; not advancing.");
        }
      } catch (error) {
        console.error("Error on next step:", error);
      }
    };
    addEventListenerWithCleanup(btn, "click", nextHandler);
  });

  // Attach Previous button events.
  document.querySelectorAll("[data-prev-step]").forEach((btn) => {
    const prevHandler = (e) => {
      e.preventDefault();
      try {
        if (state.currentStepIndex > 0) {
          showStep(state.currentStepIndex - 1);
        }
      } catch (error) {
        console.error("Error on previous step:", error);
      }
    };
    addEventListenerWithCleanup(btn, "click", prevHandler);
  });

  // Attach Calculate button event.
  const calcButton = getElement("calculateButton");
  if (calcButton) {
    const calcHandler = async (e) => {
      e.preventDefault();
      if (state.isCalculating) return;
      try {
        state.isCalculating = true;
        calcButton.disabled = true;
        calcButton.innerHTML = '<span class="loading-spinner"></span> Calculating...';
        await doFinalCalculation();
      } catch (error) {
        console.error("Calculation error:", error);
        showError(calcButton, "Calculation failed. Please check your inputs.");
      } finally {
        state.isCalculating = false;
        calcButton.disabled = false;
        calcButton.textContent = "Calculate";
      }
    };
    addEventListenerWithCleanup(calcButton, "click", calcHandler);
  }
}

function handleAgeChange(event) {
  const input = event.target;
  console.log("[DEBUG] Age blur event. Current value:", input.value);
  const age = parseInt(input.value, 10);
  const errorContainer = getElement("ageErrorContainer");
  if (errorContainer) {
    errorContainer.textContent = "";
  }
  if (isNaN(age)) {
    if (errorContainer) errorContainer.textContent = "Please enter a valid number";
    return;
  }
  if (age < 18 || age > 75) {
    if (errorContainer) errorContainer.textContent = "Age must be between 18 and 75";
    return;
  }
  console.log("[DEBUG] Age valid:", age);
  const currentGender = document.querySelector('input[name="gender"]:checked')?.value.toLowerCase();
  if (currentGender) {
    populateGoalBodyFatOptions(currentGender);
    updateBFRecommendation();
  }
}

function handleGenderChange(event) {
  try {
    const normalizedGender = event.target.value.toLowerCase();
    if (!["male", "female"].includes(normalizedGender)) {
      throw new Error(`Invalid gender: ${normalizedGender}`);
    }
    populateGoalBodyFatOptions(normalizedGender);
    updateBFRecommendation();
  } catch (error) {
    console.error("Gender change error:", error);
  }
}

/***************************************
 * Calculation & Simulation Functions
 ***************************************/
async function doFinalCalculation() {
  try {
    const unit = document.querySelector('input[name="unit"]:checked')?.value;
    if (!unit) throw new Error("Please select a unit");
    const isMetric = unit === "kg";
    const weightVal = parseFloat(getElement("totalWeightInput").value);
    const bfVal = parseFloat(getElement("bodyFatPctInput").value);
    const ageVal = parseInt(getElement("ageInput").value, 10) || 30;
    const gender = document.querySelector('input[name="gender"]:checked')?.value.toLowerCase();
    const heightVal = parseFloat(getElement("heightInput").value);
    const heightCm = unit === "lbs" ? heightVal * 2.54 : heightVal;
    const af = parseFloat(getElement("activityLevelSelect").value) || 1.55;
    const dailyAdjVal = getElement("dailyAdjustmentSelect").value;
    const dietary = document.querySelector('input[name="dietaryApproach"]:checked')?.value;
    const fatGoalOption = getElement("fatGoalCategorySelect").selectedOptions[0];
    if (!fatGoalOption) throw new Error("Please select a body fat goal");

    const targetBFRange = {
      min: Number(fatGoalOption.dataset.targetMin),
      max: Number(fatGoalOption.dataset.targetMax)
    };

    const simParams = {
      initialWeight: weightVal,
      isKg: isMetric,
      bodyFatPct: bfVal,
      age: ageVal,
      gender,
      activityMultiplier: af,
      weightGoal: "lose",
      deficitValue: String(dailyAdjVal),
      dietaryApproach: dietary,
      targetBFRange,
      heightCm
    };

    const simResultLower = await simulateDynamicMetabolicAdaptation({ ...simParams, targetBF: targetBFRange.min });
    const simResultUpper = await simulateDynamicMetabolicAdaptation({ ...simParams, targetBF: targetBFRange.max });
    if (simResultLower.error || simResultUpper.error) {
      throw new Error(simResultLower.error || simResultUpper.error);
    }
    await updateUIWithResults(simResultLower, simResultUpper, isMetric, simParams);

    try {
      await state.chartManager.renderForecastCharts(
        simResultLower.weeklyData,
        simResultLower.startDate
      );
    } catch (error) {
      console.error("Chart render error:", error);
      throw new Error("Failed to render charts");
    }
    // Advance to Step 3.
    showStep(2);
  } catch (error) {
    console.error("Calculation failed:", error);
    showGlobalError("Calculation failed. " + error.message);
    throw error;
  }
}

function calculateMacros(calories, dietaryApproach) {
  if (!calories || calories < 0) throw new Error("Invalid calorie value");
  const macros = { protein: 0, carbs: 0, fat: 0 };
  switch (dietaryApproach) {
    case "low-carb":
      macros.protein = Math.round((calories * 0.3) / 4);
      macros.carbs = Math.round((calories * 0.2) / 4);
      macros.fat = Math.round((calories * 0.5) / 9);
      break;
    case "high-protein":
      macros.protein = Math.round((calories * 0.4) / 4);
      macros.carbs = Math.round((calories * 0.35) / 4);
      macros.fat = Math.round((calories * 0.25) / 9);
      break;
    default:
      macros.protein = Math.round((calories * 0.3) / 4);
      macros.carbs = Math.round((calories * 0.4) / 4);
      macros.fat = Math.round((calories * 0.3) / 9);
  }
  return macros;
}

function formatMeasurement(value, type, isMetric) {
  if (typeof value !== "number") return "--";
  value = Math.round(value * 10) / 10;
  switch (type) {
    case "weight":
      return `${value} ${isMetric ? "kg" : "lbs"}`;
    case "length":
      return `${value} ${isMetric ? "cm" : "in"}`;
    default:
      return value.toString();
  }
}

function validateInput(params) {
  const { initialWeight, bodyFatPct, age, gender, activityMultiplier, heightCm } = params;
  if (!initialWeight || !bodyFatPct || !age || !gender || !activityMultiplier || !heightCm) {
    throw new Error("Missing required parameters");
  }
  if (bodyFatPct < 5 || bodyFatPct > 60) {
    throw new Error("Body fat percentage must be between 5% and 60%");
  }
  if (age < 18 || age > 75) {
    throw new Error("Age must be between 18 and 75");
  }
  if (activityMultiplier < 1.2 || activityMultiplier > 2.0) {
    throw new Error("Invalid activity multiplier");
  }
  return params;
}

/***************************************
 * Calculation Helper Functions
 ***************************************/
function calculateRMR(weightKg, heightCm, age, gender) {
  return gender === "male"
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

function getBFPartitionRatio(bf) {
  if (bf > 30) return 0.9;
  else if (bf >= 20) return 0.75;
  return 0.6;
}

/***************************************
 * Simulation Function
 ***************************************/
async function simulateDynamicMetabolicAdaptation(params) {
  try {
    const validatedParams = validateInput(params);
    const {
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
      targetBF
    } = validatedParams;
    const userTargetBF = targetBF !== undefined ? targetBF : targetBFRange.min;
    const safeMinBF = gender === "male" ? 10 : 15;
    const effectiveTargetBF = Math.max(userTargetBF, safeMinBF);
    
    let currentWeight = isKg ? initialWeight * 2.20462 : initialWeight;
    let currentFat = currentWeight * (bodyFatPct / 100);
    let currentLean = currentWeight - currentFat;
    let currentBF = bodyFatPct;
    
    console.log("[DEBUG] Starting simulation with currentBF:", currentBF, "and effectiveTargetBF:", effectiveTargetBF);
    
    if (currentBF <= effectiveTargetBF) {
      console.log("[DEBUG] Current BF already meets target. Returning initial stats.");
      return {
        initialStats: {
          totalWeight: initialWeight,
          leanMass: initialWeight * (1 - bodyFatPct / 100),
          fatMass: initialWeight * (bodyFatPct / 100),
          bodyFatPct
        },
        weeklyData: [{
          week: 0,
          totalWeight: currentWeight,
          leanMass: currentLean,
          fatMass: currentFat,
          bodyFatPercent: currentBF,
          rmr: calculateRMR(isKg ? initialWeight : currentWeight / 2.20462, heightCm, age, gender),
          tdee: calculateRMR(isKg ? initialWeight : currentWeight / 2.20462, heightCm, age, gender) * activityMultiplier,
          targetCalories: Math.max(
            calculateRMR(isKg ? initialWeight : currentWeight / 2.20462, heightCm, age, gender) * activityMultiplier + Number(deficitValue),
            gender === "male" ? 1500 : 1200
          ),
          macros: calculateMacros(
            Math.max(
              calculateRMR(isKg ? initialWeight : currentWeight / 2.20462, heightCm, age, gender) * activityMultiplier + Number(deficitValue),
              gender === "male" ? 1500 : 1200
            ),
            dietaryApproach
          ),
          fatLoss: 0,
          leanLoss: 0,
          weeklyWeightLoss: 0,
          weekDate: new Date()
        }],
        baselineRMR: calculateRMR(isKg ? initialWeight : currentWeight / 2.20462, heightCm, age, gender),
        baselineTDEE: calculateRMR(isKg ? initialWeight : currentWeight / 2.20462, heightCm, age, gender) * activityMultiplier,
        startDate: new Date(),
        endDate: new Date()
      };
    }
    
    const weightKg = isKg ? initialWeight : currentWeight / 2.20462;
    const baselineRMR = calculateRMR(weightKg, heightCm, age, gender);
    const baselineTDEE = baselineRMR * activityMultiplier;
    const dailyDeficit = Number(deficitValue);
    const weeklyDeficit = Math.abs(dailyDeficit) * 7;
    const beta = 0.1;
    const E_eff = 4000;
    const weeklyData = [];
    const startDate = new Date();
    let week = 0;
    const maxWeeks = 500;
    
    while (currentBF > effectiveTargetBF && week <= maxWeeks) {
      const adaptiveLoss = beta * weeklyDeficit;
      const effectiveDeficit = weeklyDeficit - adaptiveLoss;
      const deltaWeight = effectiveDeficit / E_eff;
      if (deltaWeight <= 0 || isNaN(deltaWeight)) {
        throw new Error("Invalid weight change calculated");
      }
      const fatRatio = getBFPartitionRatio(currentBF);
      const fatLoss = deltaWeight * fatRatio;
      const leanLoss = deltaWeight - fatLoss;
      currentWeight = Math.max(0.1, currentWeight - deltaWeight);
      currentFat = Math.max(0, currentFat - fatLoss);
      currentLean = Math.max(0.1, currentLean - leanLoss);
      currentBF = (currentFat / currentWeight) * 100;
      const currentWeightKg = currentWeight / 2.20462;
      const currentRMR = calculateRMR(currentWeightKg, heightCm, age, gender);
      const currentTDEE = currentRMR * activityMultiplier;
      const targetCalories = Math.max(
        currentTDEE + dailyDeficit,
        gender === "male" ? 1500 : 1200
      );
      const weekDate = new Date(startDate);
      weekDate.setDate(startDate.getDate() + (week + 1) * 7);
      weeklyData.push({
        week: week + 1,
        totalWeight: currentWeight,
        leanMass: currentLean,
        fatMass: currentFat,
        bodyFatPercent: currentBF,
        rmr: currentRMR,
        tdee: currentTDEE,
        targetCalories,
        macros: calculateMacros(targetCalories, dietaryApproach),
        fatLoss,
        leanLoss,
        weeklyWeightLoss: deltaWeight,
        weekDate
      });
      week++;
    }
    
    if (weeklyData.length === 0) {
      console.warn("[DEBUG] No simulation data generated; using initial stats as fallback.");
      weeklyData.push({
        week: 0,
        totalWeight: currentWeight,
        leanMass: currentLean,
        fatMass: currentFat,
        bodyFatPercent: currentBF,
        rmr: calculateRMR(currentWeight / 2.20462, heightCm, age, gender),
        tdee: calculateRMR(currentWeight / 2.20462, heightCm, age, gender) * activityMultiplier,
        targetCalories: Math.max(
          calculateRMR(currentWeight / 2.20462, heightCm, age, gender) * activityMultiplier + dailyDeficit,
          gender === "male" ? 1500 : 1200
        ),
        macros: calculateMacros(
          Math.max(
            calculateRMR(currentWeight / 2.20462, heightCm, age, gender) * activityMultiplier + dailyDeficit,
            gender === "male" ? 1500 : 1200
          ),
          dietaryApproach
        ),
        fatLoss: 0,
        leanLoss: 0,
        weeklyWeightLoss: 0,
        weekDate: new Date()
      });
    }
    
    return {
      initialStats: {
        totalWeight: initialWeight,
        leanMass: initialWeight * (1 - bodyFatPct / 100),
        fatMass: initialWeight * (bodyFatPct / 100),
        bodyFatPct
      },
      weeklyData,
      baselineRMR,
      baselineTDEE,
      startDate,
      endDate: weeklyData[weeklyData.length - 1].weekDate
    };
  } catch (error) {
    console.error("Simulation failed:", error);
    return { error: error.message };
  }
}

/***************************************
 * Population & UI Update Functions
 ***************************************/
function populateGoalBodyFatOptions(gender) {
  try {
    const goalSelect = getElement("fatGoalCategorySelect");
    if (!goalSelect) return;
    goalSelect.innerHTML = '<option value="" disabled selected>Select a Body Fat Goal</option>';
    const ageInput = getElement("ageInput");
    const ageVal = ageInput ? parseInt(ageInput.value, 10) : null;
    if (!ageVal || isNaN(ageVal)) return;
    const ageRange = getAgeRange(ageVal);
    const demographicData = bodyFatPercentiles[gender]?.[ageRange];
    if (!demographicData?.categories) return;
    Object.entries(demographicData.categories).forEach(([key, data]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)} (${data.range})`;
      const rangeNumbers = data.range.match(/\d+\.?\d*/g);
      option.dataset.targetMin = rangeNumbers ? rangeNumbers[0] : "";
      option.dataset.targetMax = rangeNumbers && rangeNumbers[1] ? rangeNumbers[1] : (rangeNumbers ? rangeNumbers[0] : "");
      option.dataset.range = data.range;
      goalSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error populating body fat options:", error);
  }
}

function updateBFRecommendation() {
  try {
    const ageInput = getElement("ageInput");
    const gender = document.querySelector('input[name="gender"]:checked')?.value.toLowerCase();
    if (!ageInput || !gender) {
      setTextContent("recommendedBFRange", "N/A");
      return;
    }
    const age = parseInt(ageInput.value, 10);
    if (isNaN(age)) {
      setTextContent("recommendedBFRange", "N/A");
      return;
    }
    const ageRange = getAgeRange(age);
    const data = bodyFatPercentiles[gender]?.[ageRange];
    if (data?.categories?.average) {
      setTextContent("recommendedBFRange", data.categories.average.range);
    } else {
      setTextContent("recommendedBFRange", "N/A");
    }
  } catch (error) {
    console.error("BF recommendation error:", error);
    setTextContent("recommendedBFRange", "Error");
  }
}

/***************************************
 * UI Update Functions for Step 3
 ***************************************/
function updateCurrentStats(currentStats, isMetric, gender) {
  setTextContent("currentWeightSpan", formatMeasurement(currentStats.totalWeight, "weight", isMetric));
  setTextContent("currentLeanSpan", formatMeasurement(currentStats.leanMass, "weight", isMetric));
  setTextContent("currentFatSpan", `${formatMeasurement(currentStats.fatMass, "weight", isMetric)} (${currentStats.bodyFatPct.toFixed(1)}%)`);
  setTextContent("currentBFpctSpan", `${currentStats.bodyFatPct.toFixed(1)}%`);
  setTextContent("currentBFcatSpan", getBFCat(currentStats.fatMass / currentStats.totalWeight, gender));
}

function updateGoalRanges(finalWeekLower, finalWeekUpper, isMetric, gender) {
  const ranges = {
    weight: [finalWeekLower.totalWeight, finalWeekUpper.totalWeight],
    fat: [finalWeekLower.fatMass, finalWeekUpper.fatMass],
    lean: [finalWeekLower.leanMass, finalWeekUpper.leanMass],
    bf: [finalWeekLower.bodyFatPercent, finalWeekUpper.bodyFatPercent]
  };
  Object.keys(ranges).forEach(key => {
    ranges[key].sort((a, b) => a - b);
  });
  setTextContent("goalWeightSpan", `${formatMeasurement(ranges.weight[0], "weight", isMetric)} - ${formatMeasurement(ranges.weight[1], "weight", isMetric)}`);
  setTextContent("goalFatSpan", `${formatMeasurement(ranges.fat[0], "weight", isMetric)} - ${formatMeasurement(ranges.fat[1], "weight", isMetric)}`);
  setTextContent("goalLeanSpan", `${formatMeasurement(ranges.lean[0], "weight", isMetric)} - ${formatMeasurement(ranges.lean[1], "weight", isMetric)}`);
  setTextContent("goalBFpctSpan", `${ranges.bf[0].toFixed(1)}% - ${ranges.bf[1].toFixed(1)}%`);
  setTextContent("goalBFcatSpan", getBFCat(finalWeekLower.fatMass / finalWeekLower.totalWeight, gender));
}

function updateSummaryFields(params, currentStats, isMetric) {
  const { gender, age, heightCm, dietaryApproach } = params;
  const heightVal = isMetric ? heightCm : heightCm / 2.54;
  const summaryUpdates = {
    summaryGender: gender,
    summaryAge: age,
    summaryUnits: isMetric ? "kg/cm" : "lbs/inches",
    summaryHeight: formatMeasurement(heightVal, "length", isMetric),
    summaryTotalWeight: formatMeasurement(currentStats.totalWeight, "weight", isMetric),
    summaryBodyFatPct: currentStats.bodyFatPct + "%",
    summaryDietary: dietaryApproach,
    summaryActivity: getElement("activityLevelSelect")?.selectedOptions[0]?.textContent || "",
    summaryCalorieDeficit: getElement("dailyAdjustmentSelect")?.value || "",
    summaryFatGoal: getElement("fatGoalCategorySelect")?.selectedOptions[0]?.textContent || ""
  };
  Object.entries(summaryUpdates).forEach(([id, value]) => {
    setTextContent(id, value);
  });
}

function updateTimelineFields(finalWeekLower, finalWeekUpper, simResultLower, simResultUpper, isMetric) {
  const dateOptions = { month: "short", day: "numeric", year: "numeric" };
  const timelineUpdates = {
    timelineHighWeight: formatMeasurement(finalWeekUpper.totalWeight, "weight", isMetric),
    timelineHighWeeks: `${finalWeekUpper.week} weeks`,
    timelineHighDate: finalWeekUpper.weekDate.toLocaleDateString(undefined, dateOptions),
    timelineLowWeight: formatMeasurement(finalWeekLower.totalWeight, "weight", isMetric),
    timelineLowWeeks: `${finalWeekLower.week} weeks`,
    timelineLowDate: finalWeekLower.weekDate.toLocaleDateString(undefined, dateOptions),
    startDate: simResultLower.startDate.toLocaleDateString(undefined, dateOptions),
    endDate: `${simResultLower.endDate.toLocaleDateString(undefined, dateOptions)} - ${simResultUpper.endDate.toLocaleDateString(undefined, dateOptions)}`
  };
  Object.entries(timelineUpdates).forEach(([id, value]) => {
    setTextContent(id, value);
  });
}

function updateLosses(simResultLower, isMetric) {
  const finalWeek = simResultLower.weeklyData[simResultLower.weeklyData.length - 1];
  const initialLean = simResultLower.initialStats.leanMass;
  const initialFat  = simResultLower.initialStats.fatMass;
  const leanLoss = initialLean - finalWeek.leanMass;
  const fatLoss  = initialFat - finalWeek.fatMass;
  setTextContent("leanMassLossSpan", formatMeasurement(leanLoss, "weight", isMetric));
  setTextContent("fatLossSpan", formatMeasurement(fatLoss, "weight", isMetric));
}

/***************************************
 * Updated Demographic Context Update Functions
 ***************************************/
async function updateDemographicContextWrapper(gender, age, currentStats, finalWeekLower) {
  try {
    const ageRange = getAgeRange(age);
    const demographicData = bodyFatPercentiles[gender]?.[ageRange];
    if (!demographicData) {
      setDefaultDemographicValues();
      return;
    }
    if (demographicData.categories) {
      setTextContent("demoAverageBF", demographicData.categories.average.range);
      setTextContent("demoFitnessBF", demographicData.categories.fitness.range);
      const currentPercentile = getBFCat(currentStats.fatMass / currentStats.totalWeight, gender);
      const goalPercentile = getBFCat(finalWeekLower.fatMass / finalWeekLower.totalWeight, gender);
      setTextContent("demoCurrentBF", currentStats.bodyFatPct.toFixed(1));
      setTextContent("demoCurrentPercentile", currentPercentile);
      setTextContent("demoGoalBF", finalWeekLower.bodyFatPercent.toFixed(1));
      setTextContent("demoGoalPercentile", goalPercentile);
      const fatGoalOption = getElement("fatGoalCategorySelect")?.selectedOptions[0];
      if (fatGoalOption) {
        setTextContent("demoGoalBFRange", fatGoalOption.dataset.range || "--");
        const selectedCategory = demographicData.categories[fatGoalOption.value];
        setTextContent("demoGoalPercentileRange", selectedCategory?.percentileRange || "--");
        setTextContent("demoGoalDescription", selectedCategory?.description || "--");
      }
    }
    // --- Populate Health Risks Comparison ---
    const currentCategoryKey = getBFCat(currentStats.fatMass / currentStats.totalWeight, gender).toLowerCase();
    const projectedCategoryKey = getBFCat(finalWeekLower.fatMass / finalWeekLower.totalWeight, gender).toLowerCase();
    const currentCategory = demographicData.categories[currentCategoryKey];
    const projectedCategory = demographicData.categories[projectedCategoryKey];
    populateCategoryRiskList(currentCategory, "currentHealthRisksList");
    populateCategoryRiskList(projectedCategory, "projectedHealthRisksList");
    // --- Populate Data Sources ---
    const sourceStudies = demographicData.sourceStudies || [];
    populateSourceStudiesList(sourceStudies);
  } catch (error) {
    console.error("Demographic context update error:", error);
    setDefaultDemographicValues();
  }
}

function populateCategoryRiskList(category, listId) {
  const ul = getElement(listId);
  if (!ul) return;
  ul.innerHTML = "";
  if (!category) {
    ul.innerHTML = "<li>No health risk data available</li>";
    return;
  }
  const liRange = document.createElement("li");
  liRange.textContent = `Range: ${category.range}`;
  ul.appendChild(liRange);
  
  const liPercentile = document.createElement("li");
  liPercentile.textContent = `Percentile Range: ${category.percentileRange}`;
  ul.appendChild(liPercentile);
  
  const liDescription = document.createElement("li");
  liDescription.textContent = `Description: ${category.description}`;
  ul.appendChild(liDescription);
}

function populateSourceStudiesList(studiesArray) {
  const ul = getElement("demoSourceStudies");
  if (!ul) return;
  ul.innerHTML = "";
  if (!studiesArray.length) {
    ul.innerHTML = "<li>No source studies available</li>";
    return;
  }
  studiesArray.forEach(study => {
    const li = document.createElement("li");
    li.textContent = `${study.name} - ${study.citation}`;
    ul.appendChild(li);
  });
}

function setDefaultDemographicValues() {
  const defaults = {
    demoAverageBF: "--",
    demoFitnessBF: "--",
    demoCurrentPercentile: "N/A",
    demoGoalPercentile: "N/A",
    demoGoalBFRange: "N/A",
    demoGoalPercentileRange: "N/A",
    demoGoalDescription: "N/A"
  };
  Object.entries(defaults).forEach(([id, value]) => {
    setTextContent(id, value);
  });
}

/***************************************
 * updateUIWithResults (Defined Before Use)
 ***************************************/
async function updateUIWithResults(simResultLower, simResultUpper, isMetric, simParams) {
  try {
    const currentStats = simResultLower.initialStats;
    updateCurrentStats(currentStats, isMetric, simParams.gender);
    updateGoalRanges(
      simResultLower.weeklyData[simResultLower.weeklyData.length - 1],
      simResultUpper.weeklyData[simResultUpper.weeklyData.length - 1],
      isMetric,
      simParams.gender
    );
    updateSummaryFields(simParams, currentStats, isMetric);
    updateTimelineFields(
      simResultLower.weeklyData[simResultLower.weeklyData.length - 1],
      simResultUpper.weeklyData[simResultUpper.weeklyData.length - 1],
      simResultLower,
      simResultUpper,
      isMetric
    );
    // Set input summary values.
    setTextContent("currentWeightInputSpan", formatMeasurement(simParams.initialWeight, "weight", isMetric));
    setTextContent("bodyFatPctInputSpan", simParams.bodyFatPct.toFixed(1) + "%");
    updateLosses(simResultLower, isMetric);
    setTextContent("calorieDeficitSpan", simParams.deficitValue);
    // Update demographic context, including health risks and source studies.
    await updateDemographicContextWrapper(simParams.gender, simParams.age, currentStats, simResultLower.weeklyData[simResultLower.weeklyData.length - 1]);
  } catch (error) {
    console.error("UI update error:", error);
    throw new Error("UI update failed");
  }
}

/***************************************
 * Exports for Use by Other Modules
 ***************************************/
export {
  validateInput,
  formatMeasurement,
  calculateMacros,
  simulateDynamicMetabolicAdaptation,
  doFinalCalculation,
  populateGoalBodyFatOptions,
  updateBFRecommendation,
  showStep,
  validateCurrentStep,
  showError,
  clearErrors,
  getElement,
  setTextContent
};
