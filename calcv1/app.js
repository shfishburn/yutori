(function () {
    "use strict";
  
    // --- Constants ---
    const PROTEIN_MULTIPLIERS = {
      LOSE: { UNDER_60: 2.2, MALE_60_PLUS: 2.5, FEMALE_60_PLUS: 2.6 },
      GAIN: 2.0,
      MAINTAIN: 1.6,
    };
  
    const ACTIVITY_LEVEL_MULTIPLIERS = {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTRA_ACTIVE: 1.9,
    };
  
    const BODY_FAT_CATEGORIES = {
      VERY_LOW: { min: 0, max: 10 },
      EXCELLENT: { min: 10, max: 15 },
      GOOD: { min: 15, max: 20 },
      FAIR: { min: 20, max: 25 },
      POOR: { min: 25, max: 30 },
      VERY_HIGH: { min: 30, max: Infinity },
    };
  
    // --- Input Data Object (defaults; updated from form) ---
    const inputData = {
      age: 30,
      gender: "male",
      totalWeight: 290, // in lbs
      bodyFat: 36, // in %
      leanLoss: 10, // in %
      fatGoal: "good",
      unit: "lbs", // "lbs" or "kg"
      mode: "leanFat", // "leanFat" or "weightBF"
      leanMass: 186, // in lbs
      fatMass: 104, // in lbs
      activityLevel: ACTIVITY_LEVEL_MULTIPLIERS.MODERATELY_ACTIVE,
      dailyAdjustment: -500, // from dropdown
      dietaryApproach: "balanced",
      carbohydrateTolerance: "Unsure", // "Low", "Unsure", "High"
      isKg: false,
    };
  
    // --- Helper Functions ---
    function fmtWeight(weight, isKg) {
      if (typeof weight !== "number") {
        console.error("fmtWeight expects a number; received:", typeof weight);
        return "";
      }
      return isKg ? (weight).toFixed(1) + " kg" : weight.toFixed(1) + " lbs";
    }
  
    function getBFCat(ratio) {
      let pct = ratio * 100;
      for (const cat in BODY_FAT_CATEGORIES) {
        const { min, max } = BODY_FAT_CATEGORIES[cat];
        if (pct >= min && pct < max) {
          return cat;
        }
      }
      return "VERY_HIGH";
    }
  
    // --- Modules ---
    const InputValidation = (function () {
      function validateCurrentStep() {
        clearErrors(getCurrentStepElement());
        if (currentStepIndex === 1) {
          const ageInput = document.querySelector('[data-input="age"]');
          const ageVal = parseInt(ageInput.value || "", 10);
          if (isNaN(ageVal) || ageVal < 20 || ageVal > 69) {
            showError(ageInput, "Age must be between 20 and 69");
            return false;
          }
          // Additional validations for Step 1 can be added here.
        }
        if (currentStepIndex === 2) {
          const mode = document.querySelector('[data-input="mode"]:checked').value;
          if (mode === "leanFat") {
            const leanInput = document.querySelector('[data-input="leanMass"]');
            const fatInput = document.querySelector('[data-input="fatMass"]');
            const leanVal = parseFloat(leanInput.value);
            const fatVal = parseFloat(fatInput.value);
            if (isNaN(leanVal) || leanVal <= 0) {
              showError(leanInput, "Invalid lean mass");
              return false;
            }
            if (isNaN(fatVal) || fatVal < 0) {
              showError(fatInput, "Invalid fat mass");
              return false;
            }
            if (leanVal + fatVal <= 0) {
              showError(fatInput, "Lean+fat must be greater than 0");
              return false;
            }
          } else {
            const weightInput = document.querySelector('[data-input="totalWeightAlternate"]');
            const bfInput = document.querySelector('[data-input="bodyFatAlternate"]');
            const weightVal = parseFloat(weightInput.value);
            const bfVal = parseFloat(bfInput.value);
            if (isNaN(weightVal) || weightVal <= 0) {
              showError(weightInput, "Invalid weight");
              return false;
            }
            if (isNaN(bfVal) || bfVal < 0 || bfVal > 100) {
              showError(bfInput, "BF% must be between 0 and 100");
              return false;
            }
          }
        }
        return true;
      }
  
      function clearErrors(element) {
        element.querySelectorAll(".error-message").forEach((e) => e.remove());
        element.querySelectorAll(".invalid-input").forEach((inp) => inp.classList.remove("invalid-input"));
      }
  
      function showError(element, msg) {
        element.classList.add("invalid-input");
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = msg;
        element.insertAdjacentElement("afterend", errorDiv);
      }
  
      return { validateCurrentStep, clearErrors, showError };
    })();
  
    const Calculation = (function () {
      function calculateBaselineTDEE(leanMass, activityMultiplier) {
        const leanMassKg = leanMass / 2.20462;
        const BMR = 370 + 21.6 * leanMassKg;
        return BMR * activityMultiplier;
      }
  
      function computeMacros(finalCals, approach) {
        let macros = {};
        if (approach === "balanced") {
          macros.carbsGrams = Math.round((finalCals * 0.40) / 4);
          macros.proteinGrams = Math.round((finalCals * 0.30) / 4);
          macros.fatGrams = Math.round((finalCals * 0.30) / 9);
        } else if (approach === "low-carb") {
          macros.carbsGrams = Math.round((finalCals * 0.25) / 4);
          macros.proteinGrams = Math.round((finalCals * 0.40) / 4);
          macros.fatGrams = Math.round((finalCals * 0.35) / 9);
        } else if (approach === "high-protein") {
          macros.carbsGrams = Math.round((finalCals * 0.35) / 4);
          macros.proteinGrams = Math.round((finalCals * 0.45) / 4);
          macros.fatGrams = Math.round((finalCals * 0.20) / 9);
        } else {
          macros.carbsGrams = Math.round((finalCals * 0.40) / 4);
          macros.proteinGrams = Math.round((finalCals * 0.30) / 4);
          macros.fatGrams = Math.round((finalCals * 0.30) / 9);
        }
        return macros;
      }
  
      function computeOne(M0, F0, alpha, p) {
        let numerator = p * (M0 - alpha * F0);
        let denominator = 1 - p * (alpha + 1);
        if (denominator <= 0) return null;
        let F1 = numerator / denominator;
        if (F1 < 0) return null;
        let M1 = M0 - alpha * (F0 - F1);
        let T1 = M1 + F1;
        let bfPct = (F1 / T1) * 100;
        return { M1, F1, T1, bfPct };
      }
  
      function doGoalRange(M0, F0, isKg) {
        const fatGoalSelect = document.querySelector('[data-input="fatGoal"]');
        const fatGoalRanges = {
          dangerouslyLow: 0.10,
          excellent: 0.15,
          good: 0.20,
          fair: 0.25,
          poor: 0.30,
          dangerouslyHigh: 0.35,
        };
        let targetBF = fatGoalRanges[fatGoalSelect.value] || 0.15;
        let goalWeight = M0 / (1 - targetBF);
        let goalFat = goalWeight - M0;
        let goalBFpct = (goalFat / goalWeight) * 100;
        return { goalWeight, goalFat, goalBFpct };
      }
  
      return { calculateBaselineTDEE, computeMacros, computeOne, doGoalRange };
    })();
  
    const UI = (function () {
      function showStep(index) {
        const steps = Array.from(document.querySelectorAll("[data-step]"));
        steps.forEach((s, i) => (s.style.display = i === index ? "block" : "none"));
        currentStepIndex = index;
      }
  
      function updateModeUI() {
        const leanFatSection = document.querySelector('[data-section="leanFat"]');
        const weightBFSection = document.querySelector('[data-section="weightBF"]');
        const modeRadio = document.querySelector('[data-input="mode"]:checked');
        if (modeRadio.value === "leanFat") {
          leanFatSection.style.display = "block";
          weightBFSection.style.display = "none";
        } else {
          leanFatSection.style.display = "none";
          weightBFSection.style.display = "block";
        }
      }
  
      function updateCalorieDropdown() {
        const dailyAdjustmentSelect = document.querySelector('[data-input="dailyAdjustment"]');
        let optionsHTML = `
          <option value="-250" selected>Slow loss: (~250 cal/day deficit) ≈ 0.5 lb/week</option>
          <option value="-500">Moderate loss: (~500 cal/day deficit) ≈ 1 lb/week</option>
          <option value="-750">Rapid loss: (~750 cal/day deficit) ≈ 1.5 lb/week</option>
          <option value="-1000">Dangerous loss: (~1,000+ cal/day deficit) ≈ 2 lb/week or more</option>
        `;
        dailyAdjustmentSelect.innerHTML = optionsHTML;
      }
  
      return { showStep, updateModeUI, updateCalorieDropdown };
    })();
  
    const DataDisplay = (function () {
      function updateCurrentStats(cWeight, F0, M0) {
        document.querySelector('[data-output="currentWeight"]').textContent = fmtWeight(cWeight, inputData.unit === "kg");
        document.querySelector('[data-output="currentFat"]').textContent =
          fmtWeight(F0, inputData.unit === "kg") +
          " (" +
          ((F0 / cWeight) * 100).toFixed(1) +
          "%)";
        document.querySelector('[data-output="currentLean"]').textContent = fmtWeight(M0, inputData.unit === "kg");
        document.querySelector('[data-output="currentBFpct"]').textContent = ((F0 / cWeight) * 100).toFixed(1) + "%";
        document.querySelector('[data-output="currentBFcat"]').textContent = getBFCat(F0 / cWeight);
      }
  
      function updateSummary(settings) {
        document.querySelector('[data-output="summaryWeightGoal"]').textContent = settings.goal;
        document.querySelector('[data-output="summaryDietApproach"]').textContent = settings.dietaryApproach;
        document.querySelector('[data-output="summaryActivityLevel"]').textContent = settings.activityLevel;
        document.querySelector('[data-output="summaryDailyAdj"]').textContent = settings.dailyAdjustment;
        document.querySelector('[data-output="summaryLeanGoalPct"]').textContent = settings.leanGoalInfo;
      }
  
      function updateEnergyStats(bmr, tdee, finalCals) {
        document.querySelector('[data-output="bmr"]').textContent = Math.round(bmr);
        document.querySelector('[data-output="tdee"]').textContent = Math.round(tdee);
        document.querySelector('[data-output="finalCals"]').textContent = Math.round(finalCals);
      }
  
      function updateMacros(macros) {
        document.querySelector('[data-output="protein"]').textContent = macros.proteinGrams + " g";
        document.querySelector('[data-output="carbs"]').textContent = macros.carbsGrams + " g";
        document.querySelector('[data-output="fat"]').textContent = macros.fatGrams + " g";
      }
  
      function updateGoalRange(goalData, unit) {
        document.querySelector('[data-output="goalWeight"]').textContent = fmtWeight(goalData.goalWeight, unit === "kg");
        document.querySelector('[data-output="goalFat"]').textContent =
          fmtWeight(goalData.goalFat, unit === "kg") +
          " (" +
          goalData.goalBFpct.toFixed(1) +
          "%)";
        document.querySelector('[data-output="goalLean"]').textContent = fmtWeight(goalData.goalWeight - goalData.goalFat, unit === "kg");
        document.querySelector('[data-output="goalBFpct"]').textContent = goalData.goalBFpct.toFixed(1) + "%";
        // For simplicity, use the computed goal BF category from current data.
        document.querySelector('[data-output="goalBFcat"]').textContent = getBFCat(goalData.goalFat / goalData.goalWeight);
      }
  
      function updateTimeToGoal(text) {
        document.querySelector('[data-output="timeToGoal"]').textContent = text;
      }
  
      function updateExplanation(text) {
        document.querySelector('[data-output="resultsExplanation"]').textContent = text;
      }
  
      function updateInsulinNote(text) {
        document.querySelector('[data-output="insulinNote"]').textContent = text;
      }
  
      return { updateCurrentStats, updateSummary, updateEnergyStats, updateMacros, updateGoalRange, updateTimeToGoal, updateExplanation, updateInsulinNote };
    })();
  
    // --- Global Variables for Steps ---
    const steps = Array.from(document.querySelectorAll("[data-step]"));
    let currentStepIndex = 0;
    function getCurrentStepElement() {
      return steps[currentStepIndex];
    }
  
    // --- Event Handling and Initialization ---
    UI.showStep(currentStepIndex);
    UI.updateModeUI();
    UI.updateCalorieDropdown();
  
    // Set initial values into DOM from inputData
    document.querySelector('[data-input="age"]').value = inputData.age;
    document.querySelector('[data-input="totalWeight"]').value = inputData.totalWeight;
    document.querySelector('[data-input="bodyFat"]').value = inputData.bodyFat;
    document.querySelector('[data-input="gender"]').value = inputData.gender;
    document.querySelector('[data-input="leanLoss"]').value = inputData.leanLoss;
    document.querySelector('[data-input="fatGoal"]').value = inputData.fatGoal;
    document.querySelector('[data-input="unit"][value="' + inputData.unit + '"]').checked = true;
    document.querySelector('[data-input="mode"][value="' + inputData.mode + '"]').checked = true;
    document.querySelector('[data-input="leanMass"]').value = inputData.leanMass;
    document.querySelector('[data-input="fatMass"]').value = inputData.fatMass;
    document.querySelector('[data-input="activityLevel"]').value = inputData.activityLevel;
    document.querySelector('[data-input="dailyAdjustment"]').value = inputData.dailyAdjustment;
    document.querySelector('[data-input="dietaryApproach"][value="' + inputData.dietaryApproach + '"]').checked = true;
  
    // Event listener for Start button
    document.querySelector('[data-button="start"]').addEventListener("click", () => {
      UI.showStep(1);
    });
  
    // Event listeners for Next/Prev buttons
    document.querySelectorAll("[data-next-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!InputValidation.validateCurrentStep()) return;
        UI.showStep(currentStepIndex + 1);
      });
    });
    document.querySelectorAll("[data-prev-step]").forEach((btn) => {
      btn.addEventListener("click", () => UI.showStep(currentStepIndex - 1));
    });
  
    // Event listener for Calculate button
    document.querySelector('[data-button="calculate"]').addEventListener("click", () => {
      if (!InputValidation.validateCurrentStep()) return;
  
      // Update inputData from DOM elements
      inputData.age = parseInt(document.querySelector('[data-input="age"]').value);
      inputData.totalWeight = parseFloat(document.querySelector('[data-input="totalWeight"]').value);
      inputData.bodyFat = parseFloat(document.querySelector('[data-input="bodyFat"]').value);
      inputData.gender = document.querySelector('[data-input="gender"]').value;
      inputData.leanLoss = parseFloat(document.querySelector('[data-input="leanLoss"]').value);
      inputData.fatGoal = document.querySelector('[data-input="fatGoal"]').value;
      inputData.unit = document.querySelector('[data-input="unit"]:checked').value;
      inputData.mode = document.querySelector('[data-input="mode"]:checked').value;
      if (inputData.mode === "leanFat") {
        inputData.leanMass = parseFloat(document.querySelector('[data-input="leanMass"]').value);
        inputData.fatMass = parseFloat(document.querySelector('[data-input="fatMass"]').value);
      } else {
        inputData.totalWeight = parseFloat(document.querySelector('[data-input="totalWeightAlternate"]').value);
        inputData.bodyFat = parseFloat(document.querySelector('[data-input="bodyFatAlternate"]').value);
      }
      inputData.activityLevel = parseFloat(document.querySelector('[data-input="activityLevel"]').value);
      inputData.dailyAdjustment = parseFloat(document.querySelector('[data-input="dailyAdjustment"]').value);
      inputData.dietaryApproach = document.querySelector('[data-input="dietaryApproach"]:checked').value;
      // Update carbohydrateTolerance if needed here.
      
      // --- Final Calculations ---
      let weight, M0, F0;
      if (inputData.mode === "leanFat") {
        M0 = inputData.leanMass;
        F0 = inputData.fatMass;
        weight = M0 + F0;
      } else {
        weight = inputData.totalWeight;
        F0 = (inputData.bodyFat / 100) * weight;
        M0 = weight - F0;
      }
      DataDisplay.updateCurrentStats(weight, F0, M0);
  
      // Compute baseline TDEE using current lean mass
      const baselineTDEE = Calculation.calculateBaselineTDEE(M0, inputData.activityLevel);
      let finalCals = baselineTDEE + inputData.dailyAdjustment;
      if (finalCals < 1200) finalCals = 1200;
      const macros = Calculation.computeMacros(finalCals, inputData.dietaryApproach);
      DataDisplay.updateEnergyStats(baselineTDEE, baselineTDEE, finalCals);
      DataDisplay.updateMacros(macros);
  
      // Compute goal range using current lean mass and fat mass (simple version)
      const fatGoalRanges = {
        dangerouslyLow: 0.10,
        excellent: 0.15,
        good: 0.20,
        fair: 0.25,
        poor: 0.30,
        dangerouslyHigh: 0.35,
      };
      let targetBF = fatGoalRanges[inputData.fatGoal] || 0.15;
      const goalData = Calculation.doGoalRange(M0, F0, inputData.unit === "kg");
      const goalWeight = M0 / (1 - targetBF);
      const goalFat = goalWeight - M0;
      const goalBFpct = (goalFat / goalWeight) * 100;
      const goalRangeData = { goalWeight, goalFat, goalBFpct };
      DataDisplay.updateGoalRange(goalRangeData, inputData.unit);
  
      // Compute time-to-goal (midpoint between current weight and goal weight)
      (function () {
        let netDeficit = finalCals - baselineTDEE;
        let weeklyChange = (Math.abs(netDeficit) * 7) / 3500;
        if (weeklyChange === 0) {
          DataDisplay.updateTimeToGoal("Insufficient deficit for measurable weight change.");
          return;
        }
        let weightDiff = Math.abs(weight - goalWeight) / 2;
        let weeks = weightDiff / weeklyChange;
        DataDisplay.updateTimeToGoal(weeks.toFixed(1) + " weeks to mid-goal");
      })();
  
      DataDisplay.updateExplanation(
        "Your results are shown as ranges because they estimate your final body makeup. " +
        "The calorie target is dynamic—it starts around " + Math.round(baselineTDEE + inputData.dailyAdjustment) +
        " calories and adjusts as you lose weight. Your macros are based on your current mass (" +
        macros.proteinGrams + " g protein, " + macros.carbsGrams + " g carbs, and " +
        macros.fatGrams + " g fat). We estimate you’ll reach your mid-goal weight (" +
        fmtWeight(goalWeight, inputData.unit === "kg") + ") in roughly " +
        document.querySelector('[data-output="timeToGoal"]').textContent + "."
      );
  
      // (Optionally, insert forecast chart logic here.)
      UI.showStep(4);
    });
  
    // --- New Scenario Reset ---
    document.querySelector('[data-button="newScenario"]').addEventListener("click", () => {
      steps.forEach((s) => (s.style.display = "none"));
      document.querySelectorAll('input[type="number"]').forEach((inp) => (inp.value = ""));
      document.querySelectorAll('select').forEach((sel) => (sel.selectedIndex = 0));
      document.querySelectorAll('input[type="radio"]').forEach((r) => (r.checked = false));
      // Reset defaults:
      document.querySelector('[data-input="unit"][value="lbs"]').checked = true;
      document.querySelector('[data-input="mode"][value="leanFat"]').checked = true;
      UI.updateModeUI();
      UI.updateCalorieDropdown();
      UI.showStep(0);
    });
  
    // --- Modal Functionality ---
    document.querySelectorAll("[data-open-modal]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        let modalId = a.getAttribute("data-open-modal");
        document.querySelector('[data-modal="' + modalId + '"]').style.display = "block";
      });
    });
    document.querySelectorAll(".close-modal-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        let modalId = btn.getAttribute("data-close-modal");
        document.querySelector('[data-modal="' + modalId + '"]').style.display = "none";
      });
    });
    document.querySelector('[data-button="disclaimer"]').addEventListener("click", () => {
      document.querySelector('[data-modal="disclaimerModal"]').style.display = "block";
    });
  })();
  