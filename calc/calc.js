(function () {
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
     * Input Validation & Error Handling Modules
     ***************************************/
    function validateInput(params) {
      if (typeof params !== "object" || params === null) {
        throw new ValidationError("Input parameters must be provided in an object.");
      }
  
      // Composite validators for strict input validation
      const validators = {
        initialWeight: (value) => ({
          isValid: typeof value === "number" && isFinite(value) && value > 0,
          message: `Initial weight must be a positive number. Received: ${value}`
        }),
        bodyFatPct: (value) => ({
          isValid: typeof value === "number" && isFinite(value) && value >= 8 && value <= 40,
          message: `Body fat percentage must be between 8% and 40%. Received: ${value}`
        }),
        age: (value) => ({
          isValid: typeof value === "number" && isFinite(value) && value >= 18 && value <= 75,
          message: `Age must be between 18 and 75. Received: ${value}`
        }),
        activityMultiplier: (value) => ({
          isValid: typeof value === "number" && isFinite(value) && value >= 1,
          message: `Activity multiplier must be >= 1. Received: ${value}`
        }),
        heightCm: (value) => ({
          isValid: typeof value === "number" && isFinite(value) && value > 0,
          message: `Height in centimeters must be positive. Received: ${value}`
        }),
        dietaryApproach: (value) => ({
          isValid: ["balanced", "low-carb", "high-protein"].includes(value),
          message: `Invalid dietary approach. Received: ${value}`
        })
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
        throw new ValidationError(
          `Validation errors: ${errors.map(e => e.message).join(", ")}`
        );
      }
  
      return Object.assign({}, params);
    }
  
    function handleCalculatorError(error, context) {
      console.error(`[${context}] ${error.message}`, {
        errorType: error.name,
        stack: error.stack
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
        console.error(`Error in setTextContent for id ${id}:`, {
          errorType: error.name,
          message: error.message,
          stack: error.stack
        });
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
        classifications = {
          essential: { min: 3, max: 5, name: "Essential Fat" },
          athletic: { min: 6, max: 13, name: "Below Average/Athletes" },
          fitness: { min: 14, max: 17, name: "General Fitness" },
          average: { min: 18, max: 24, name: "Average/Acceptable" },
          obese: { min: 25, max: Infinity, name: "Obese (Level I & II)" }
        };
      } else {
        classifications = {
          essential: { min: 9, max: 11, name: "Essential Fat" },
          athletic: { min: 12, max: 19, name: "Below Average/Athletes" },
          fitness: { min: 20, max: 24, name: "General Fitness" },
          average: { min: 25, max: 29, name: "Average/Acceptable" },
          obese: { min: 30, max: Infinity, name: "Obese (Level I & II)" }
        };
      }
      for (let key in classifications) {
        const cls = classifications[key];
        if (bfPercent >= cls.min && bfPercent <= cls.max) {
          return cls.name;
        }
      }
      return "Undefined";
    }
  
    function calculateMacros(calories, approach) {
      const distributions = {
        balanced: { carbs: 0.40, protein: 0.30, fat: 0.30 },
        "low-carb": { carbs: 0.25, protein: 0.40, fat: 0.35 },
        "high-protein": { carbs: 0.35, protein: 0.45, fat: 0.20 }
      };
      const dist = distributions[approach] || distributions.balanced;
      return {
        protein: Math.round((calories * dist.protein) / 4),
        carbs: Math.round((calories * dist.carbs) / 4),
        fat: Math.round((calories * dist.fat) / 9)
      };
    }
  
    function getAdvice(netDiff) {
      if (netDiff < 0) return "Calorie deficit: aiming for weight loss.";
      if (netDiff > 0) return "Calorie surplus: aiming for weight gain.";
      return "Calorie maintenance.";
    }
  
    /***************************************
     * Lean Loss Lookup Table
     ***************************************/
    const leanLossLookup = {
      balanced: {
        "-250": { fat: 90, lean: 10 },
        "-500": { fat: 85, lean: 15 },
        "-750": { fat: 80, lean: 20 },
        "-1000": { fat: 75, lean: 25 }
      },
      "low-carb": {
        "-250": { fat: 87, lean: 13 },
        "-500": { fat: 82, lean: 18 },
        "-750": { fat: 78, lean: 22 },
        "-1000": { fat: 72, lean: 28 }
      },
      "high-protein": {
        "-250": { fat: 95, lean: 5 },
        "-500": { fat: 92, lean: 8 },
        "-750": { fat: 88, lean: 12 },
        "-1000": { fat: 85, lean: 15 }
      }
    };
  
    /***************************************
     * Simulation Function: calculate metabolic adaptation
     ***************************************/
    function simulateMetabolicAdaptation(params) {
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
          heightCm
        } = validatedParams;
  
        if (!["lose"].includes(params.weightGoal)) {
          throw new ValidationError("Only weight loss is supported.");
        }
  
        const lossRatios = leanLossLookup[dietaryApproach] && leanLossLookup[dietaryApproach][deficitValue];
        if (!lossRatios) {
          throw new ValidationError("Invalid dietary approach or deficit value.");
        }
  
        const weightKg = isKg ? initialWeight : initialWeight / 2.20462;
  
        const initialStats = {
          totalWeight: initialWeight,
          leanMass: initialWeight * (1 - (bodyFatPct / 100)),
          fatMass: initialWeight * (bodyFatPct / 100),
          bodyFatPct
        };
  
        const baselineRMR =
          gender === "male"
            ? (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
            : (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
        const baselineTDEE = baselineRMR * activityMultiplier;
  
        // Determine target body fat percentages
        const targetPercentages = [35, 30, 25, 20, 15, 10, 8];
        let filteredTargets = targetPercentages.filter(targetBF => targetBF < bodyFatPct);
        if (params.targetBFRange &&
            typeof params.targetBFRange.min === "number" &&
            typeof params.targetBFRange.max === "number") {
          filteredTargets = filteredTargets.filter(bf => bf >= params.targetBFRange.min && bf <= params.targetBFRange.max);
        }
        if (filteredTargets.length === 0) {
          filteredTargets = targetPercentages.filter(targetBF => targetBF < bodyFatPct);
        }
        const progressionStats = filteredTargets.map(targetBF => {
          const P = targetBF / 100;
          const fatLossPercent = lossRatios.fat / 100;
          const leanLossPercent = lossRatios.lean / 100;
  
          const totalWeightLoss = (initialStats.fatMass - (P * initialStats.totalWeight)) / (fatLossPercent - P);
          const fatLoss = totalWeightLoss * fatLossPercent;
          const leanLoss = totalWeightLoss * leanLossPercent;
  
          const finalTotalWeight = initialStats.totalWeight - totalWeightLoss;
          const finalLeanMass = initialStats.leanMass - leanLoss;
          const finalFatMass = initialStats.fatMass - fatLoss;
          const finalWeightKg = isKg ? finalTotalWeight : finalTotalWeight / 2.20462;
          const rmr =
            gender === "male"
              ? (10 * finalWeightKg) + (6.25 * heightCm) - (5 * age) + 5
              : (10 * finalWeightKg) + (6.25 * heightCm) - (5 * age) - 161;
          const tdee = rmr * activityMultiplier;
          const targetCalories = tdee + Number(deficitValue);
          const minCal = gender === "male" ? 1500 : 1200;
          const finalCalories = Math.max(targetCalories, minCal);
          const macros = calculateMacros(finalCalories, dietaryApproach);
  
          return {
            targetBF,
            totalWeight: finalTotalWeight,
            leanMass: finalLeanMass,
            fatMass: finalFatMass,
            bodyFatPercent: (finalFatMass / finalTotalWeight) * 100,
            totalLoss: totalWeightLoss,
            fatLoss,
            leanLoss,
            rmr,
            tdee,
            targetCalories: finalCalories,
            macros
          };
        });
  
        return {
          initialStats,
          progressionStats,
          lossRatios,
          baselineRMR,
          baselineTDEE
        };
      } catch (error) {
        return handleCalculatorError(error, "simulateMetabolicAdaptation");
      }
    }
  
    /***************************************
     * Helper: Populate Goal Body Fat Options Based on Gender
     ***************************************/
    function populateGoalBodyFatOptions(gender) {
      let options;
      if (gender === "male") {
        options = [
          { value: "athletic", label: "Below Average/Athletes (6-13%)" },
          { value: "fitness", label: "General Fitness (14-17%)" },
          { value: "average", label: "Average/Acceptable (18-24%)" },
          { value: "obese", label: "Obese (25% or more)" }
        ];
      } else { // female
        options = [
          { value: "athletic", label: "Below Average/Athletes (12-19%)" },
          { value: "fitness", label: "General Fitness (20-24%)" },
          { value: "average", label: "Average/Acceptable (25-29%)" },
          { value: "obese", label: "Obese (30% or more)" }
        ];
      }
      const goalSelect = document.getElementById("fatGoalCategorySelect");
      if (goalSelect) {
        goalSelect.innerHTML = "";
        options.forEach(opt => {
          const optionEl = document.createElement("option");
          optionEl.value = opt.value;
          optionEl.textContent = opt.label;
          goalSelect.appendChild(optionEl);
        });
      }
    }
  
    // Call the function on gender change (if the gender input is updated by the user)
    document.querySelectorAll('input[name="gender"]').forEach(radio => {
      radio.addEventListener("change", function () {
        populateGoalBodyFatOptions(this.value);
      });
    });
  
    /***************************************
     * UI & Navigation Functions
     ***************************************/
    const steps = Array.from(document.querySelectorAll(".wizard-step"));
    let currentStepIndex = 0;
  
    function showStep(index) {
      steps.forEach((s, i) => (s.style.display = i === index ? "block" : "none"));
      currentStepIndex = index;
    }
  
    function clearErrors(stepEl) {
      stepEl.querySelectorAll(".error-message").forEach(e => e.remove());
      stepEl.querySelectorAll(".invalid-input").forEach(inp => inp.classList.remove("invalid-input"));
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
        showError(bfInput, "BF% must be between 8% and 40%.");
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
  
    function doFinalCalculation() {
      try {
        const unit = document.querySelector('input[name="unit"]:checked').value;
        const isKg = unit === "kg";
        const weightVal = parseFloat(document.getElementById("totalWeightInput").value);
        const bfVal = parseFloat(document.getElementById("bodyFatPctInput").value);
        const ageVal = parseInt(document.getElementById("ageInput").value) || 30;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const heightVal = parseFloat(document.getElementById("heightInput").value);
        const heightCm = unit === "lbs" ? (heightVal * 2.54) : heightVal;
        const af = parseFloat(document.getElementById("activityLevelSelect").value) || 1.55;
        const dailyAdjVal = document.getElementById("dailyAdjustmentSelect").value;
        const dietary = document.querySelector('input[name="dietaryApproach"]:checked').value;
  
        // Populate Goal Body Fat % options based on gender
        populateGoalBodyFatOptions(gender);
  
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
          targetBFRange: { min: 15, max: 20 },
          heightCm: heightCm
        };
  
        const simResult = simulateMetabolicAdaptation(simParams);
        if (simResult.error) {
          console.error("Calculation halted:", simResult.error);
          return;
        }
        
        // Update "Current Composition" card (baseline values)
        const currentStats = simResult.initialStats;
        setTextContent("currentWeightSpan", fmtWeight(currentStats.totalWeight, false));
        setTextContent("currentLeanSpan", fmtWeight(currentStats.leanMass, false));
        setTextContent("currentFatSpan", fmtWeight(currentStats.fatMass, false) + " (" + currentStats.bodyFatPct.toFixed(1) + "%)");
        setTextContent("currentBFpctSpan", currentStats.bodyFatPct.toFixed(1) + "%");
        setTextContent("currentBFcatSpan", getBFCat(currentStats.fatMass / currentStats.totalWeight, gender));
  
        // Update "About You" card with step-1 inputs
        const unitText = (document.querySelector('input[name="unit"]:checked').value === "lbs") ? "lbs/inches" : "kg/cm";
        setTextContent("summaryGender", gender);
        setTextContent("summaryAge", ageVal);
        setTextContent("summaryUnits", unitText);
        setTextContent("summaryHeight", heightVal);
        setTextContent("summaryTotalWeight", weightVal);
        setTextContent("summaryBodyFatPct", bfVal + "%");
  
        // Compute range for projected composition from progressionStats
        const progression = simResult.progressionStats;
        const minProj = {
          totalWeight: Math.min(...progression.map(s => s.totalWeight)),
          fatMass: Math.min(...progression.map(s => s.fatMass)),
          leanMass: Math.min(...progression.map(s => s.leanMass)),
          bodyFatPercent: Math.min(...progression.map(s => s.bodyFatPercent))
        };
        const maxProj = {
          totalWeight: Math.max(...progression.map(s => s.totalWeight)),
          fatMass: Math.max(...progression.map(s => s.fatMass)),
          leanMass: Math.max(...progression.map(s => s.leanMass)),
          bodyFatPercent: Math.max(...progression.map(s => s.bodyFatPercent))
        };
  
        setTextContent("goalWeightSpan", `${fmtWeight(minProj.totalWeight, false)} - ${fmtWeight(maxProj.totalWeight, false)}`);
        setTextContent("goalFatSpan", `${fmtWeight(minProj.fatMass, false)} - ${fmtWeight(maxProj.fatMass, false)}`);
        setTextContent("goalLeanSpan", `${fmtWeight(minProj.leanMass, false)} - ${fmtWeight(maxProj.leanMass, false)}`);
        setTextContent("goalBFpctSpan", `${minProj.bodyFatPercent.toFixed(1)}% - ${maxProj.bodyFatPercent.toFixed(1)}%`);
        const catMin = getBFCat(minProj.fatMass / minProj.totalWeight, gender);
        const catMax = getBFCat(maxProj.fatMass / maxProj.totalWeight, gender);
        setTextContent("goalBFcatSpan", catMin === catMax ? catMin : `${catMin} - ${catMax}`);
  
        // Build data object for Projected Composition card update
        const projectionData = {
          weightRange: `${fmtWeight(minProj.totalWeight, false)} - ${fmtWeight(maxProj.totalWeight, false)}`,
          fatMassRange: `${fmtWeight(minProj.fatMass, false)} - ${fmtWeight(maxProj.fatMass, false)}`,
          leanMassRange: `${fmtWeight(minProj.leanMass, false)} - ${fmtWeight(maxProj.leanMass, false)}`,
          bfPercentRange: `${minProj.bodyFatPercent.toFixed(1)}% - ${maxProj.bodyFatPercent.toFixed(1)}%`,
          category: catMin === catMax ? catMin : `${catMin} - ${catMax}`,
          currentWeight: fmtWeight(currentStats.totalWeight, false),
          currentBF: currentStats.bodyFatPct.toFixed(1) + "%",
          totalWeightLoss: "N", // Replace with your computed value
          leanMassLoss: "Y",    // Replace with your computed value
          fatLoss: "Z",         // Replace with your computed value
          calorieDeficit: dailyAdjVal,
          weeklyLoss: "#s",     // Replace with computed weekly loss
          dateA: "DATE A",      // Replace with computed start date
          dateB: "DATE B"       // Replace with computed end date
        };
  
        // Update the Projected Composition card with summary & timeline info
        updateProjectedCompositionCard(projectionData);
  
        // Compute ranges for Calories & Macros from progressionStats
        const bmrRange = {
          min: Math.min(...progression.map(s => s.rmr)),
          max: Math.max(...progression.map(s => s.rmr))
        };
        const tdeeRange = {
          min: Math.min(...progression.map(s => s.tdee)),
          max: Math.max(...progression.map(s => s.tdee))
        };
        const finalCalsRange = {
          min: Math.min(...progression.map(s => s.targetCalories)),
          max: Math.max(...progression.map(s => s.targetCalories))
        };
        const carbsRange = {
          min: Math.min(...progression.map(s => s.macros.carbs)),
          max: Math.max(...progression.map(s => s.macros.carbs))
        };
        const proteinRange = {
          min: Math.min(...progression.map(s => s.macros.protein)),
          max: Math.max(...progression.map(s => s.macros.protein))
        };
        const fatRange = {
          min: Math.min(...progression.map(s => s.macros.fat)),
          max: Math.max(...progression.map(s => s.macros.fat))
        };
  
        setTextContent("bmrSpan", `${Math.round(bmrRange.min)} - ${Math.round(bmrRange.max)} kcal/day`);
        setTextContent("tdeeSpan", `${Math.round(tdeeRange.min)} - ${Math.round(tdeeRange.max)} kcal/day`);
        setTextContent("finalCalsSpan", `${Math.round(finalCalsRange.min)} - ${Math.round(finalCalsRange.max)} kcal/day`);
        setTextContent("carbsSpan", `${carbsRange.min} - ${carbsRange.max} g`);
        setTextContent("proteinSpan", `${proteinRange.min} - ${proteinRange.max} g`);
        setTextContent("fatSpan", `${fatRange.min} - ${fatRange.max} g`);
  
        const netDiff = finalCalsRange.min - simResult.baselineTDEE;
        setTextContent("macroHealthComment", getAdvice(netDiff));
  
        if (typeof renderForecastCharts === "function") {
          renderForecastCharts(simResult.progressionStats);
        }
      } catch (error) {
        console.error("Error in doFinalCalculation:", {
          errorType: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    }
  
    /***************************************
     * Chart Rendering
     ***************************************/
    let calorieChart, macroChart, weightChart;
    function renderForecastCharts(weeklyData) {
      try {
        const weeks = weeklyData.map(pt => pt.targetBF + "%");
        const calorieTargets = weeklyData.map(pt => Math.round(pt.targetCalories));
        const weights = weeklyData.map(pt => Math.round(pt.totalWeight));
        const proteins = weeklyData.map(pt => pt.macros.protein);
        const carbs = weeklyData.map(pt => pt.macros.carbs);
        const fats = weeklyData.map(pt => pt.macros.fat);
  
        if (calorieChart && typeof calorieChart.destroy === "function") calorieChart.destroy();
        if (macroChart && typeof macroChart.destroy === "function") macroChart.destroy();
        if (weightChart && typeof weightChart.destroy === "function") weightChart.destroy();
  
        const ctxCal = document.getElementById("calorieChart").getContext("2d");
        calorieChart = new Chart(ctxCal, {
          type: "line",
          data: {
            labels: weeks,
            datasets: [{
              label: "Daily Calorie Target",
              data: calorieTargets,
              borderColor: "rgb(75, 192, 192)",
              fill: false
            }]
          },
          options: {
            responsive: true,
            plugins: { title: { display: true, text: "Calorie Forecast" } },
            scales: {
              x: { title: { display: true, text: "Target BF%" } },
              y: { title: { display: true, text: "Calories" } }
            }
          }
        });
  
        const ctxMacro = document.getElementById("macroChart").getContext("2d");
        macroChart = new Chart(ctxMacro, {
          type: "line",
          data: {
            labels: weeks,
            datasets: [
              { label: "Protein (g)", data: proteins, borderColor: "rgb(255, 99, 132)", fill: false },
              { label: "Carbs (g)", data: carbs, borderColor: "rgb(54, 162, 235)", fill: false },
              { label: "Fat (g)", data: fats, borderColor: "rgb(255, 205, 86)", fill: false }
            ]
          },
          options: {
            responsive: true,
            plugins: { title: { display: true, text: "Macro Trajectory" } },
            scales: {
              x: { title: { display: true, text: "Target BF%" } },
              y: { title: { display: true, text: "Grams" } }
            }
          }
        });
  
        const ctxWeight = document.getElementById("weightChart").getContext("2d");
        weightChart = new Chart(ctxWeight, {
          type: "line",
          data: {
            labels: weeks,
            datasets: [{
              label: "Predicted Weight (lbs)",
              data: weights,
              borderColor: "rgb(153, 102, 255)",
              fill: false
            }]
          },
          options: {
            responsive: true,
            plugins: { title: { display: true, text: "Weight Loss Trajectory" } },
            scales: {
              x: { title: { display: true, text: "Target BF%" } },
              y: { title: { display: true, text: "Weight (lbs)" } }
            }
          }
        });
      } catch (error) {
        console.error("Error rendering charts:", {
          errorType: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    }
  
    /***************************************
     * Function to update the Projected Composition Card
     ***************************************/
    function updateProjectedCompositionCard(data) {
      // Update key metric ranges
      document.getElementById("goalWeightSpan").textContent = data.weightRange;
      document.getElementById("goalFatSpan").textContent = data.fatMassRange;
      document.getElementById("goalLeanSpan").textContent = data.leanMassRange;
      document.getElementById("goalBFpctSpan").textContent = data.bfPercentRange;
      document.getElementById("goalBFcatSpan").textContent = data.category;
      
      // Update summary details
      document.getElementById("currentWeightInputSpan").textContent = data.currentWeight;
      document.getElementById("bodyFatPctInputSpan").textContent = data.currentBF;
      document.getElementById("totalWeightLossSpan").textContent = data.totalWeightLoss;
      document.getElementById("leanMassLossSpan").textContent = data.leanMassLoss;
      document.getElementById("fatLossSpan").textContent = data.fatLoss;
      
      // Update timeline information
      document.getElementById("calorieDeficitSpan").textContent = data.calorieDeficit;
      document.getElementById("weeklyWeightLossSpan").textContent = data.weeklyLoss;
      document.getElementById("dateA").textContent = data.dateA;
      document.getElementById("dateB").textContent = data.dateB;
    }
  
    /***************************************
     * UI Event Listeners
     ***************************************/
    document.querySelectorAll("[data-next-step]").forEach(btn => {
      btn.addEventListener("click", () => {
        try {
          if (!validateCurrentStep()) return;
          showStep(currentStepIndex + 1);
        } catch (error) {
          console.error("Error in next-step event:", {
            errorType: error.name,
            message: error.message,
            stack: error.stack
          });
        }
      });
    });
  
    document.querySelectorAll("[data-prev-step]").forEach(btn => {
      btn.addEventListener("click", () => showStep(currentStepIndex - 1));
    });
  
    document.getElementById("calculateButton").addEventListener("click", () => {
      try {
        clearErrors(steps[currentStepIndex]);
        const dailyAdj = parseFloat(document.getElementById("dailyAdjustmentSelect").value) || 0;
        if (dailyAdj > 0) {
          showError(document.getElementById("dailyAdjustmentSelect"), "For weight loss, select a deficit (negative value)");
          return;
        }
        doFinalCalculation();
        showStep(2);
      } catch (error) {
        console.error("Error during calculateButton click:", {
          errorType: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    });
  
    document.querySelectorAll("[data-open-modal]").forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        let modalId = a.getAttribute("data-open-modal");
        document.getElementById(modalId).style.display = "flex";
      });
    });
  
    document.querySelectorAll(".close-modal-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        let id = btn.getAttribute("data-close-modal");
        document.getElementById(id).style.display = "none";
      });
    });
  
    document.getElementById("disclaimerLink")?.addEventListener("click", () => {
      document.getElementById("disclaimerModal").style.display = "flex";
    });
  
    /***************************************
     * Test Simulation: Running test cases (for development)
     ***************************************/
    function runTestCases() {
      const baseParams = {
        age: 62,
        gender: "male",
        heightInches: 72,
        totalWeight: 288,
        bodyFatPct: 36
      };
  
      const heightCm = baseParams.heightInches * 2.54;
  
      const testCase1 = simulateMetabolicAdaptation({
        initialWeight: baseParams.totalWeight,
        isKg: false,
        bodyFatPct: baseParams.bodyFatPct,
        age: baseParams.age,
        gender: baseParams.gender,
        activityMultiplier: 1.2,
        weightGoal: "lose",
        deficitValue: "-250",
        dietaryApproach: "low-carb",
        targetBFRange: { min: 15, max: 20 },
        heightCm: heightCm
      });
      console.log("Test Case 1 (Sedentary, Low-Carb, Good):", JSON.stringify(testCase1, null, 2));
  
      const testCase2 = simulateMetabolicAdaptation({
        initialWeight: baseParams.totalWeight,
        isKg: false,
        bodyFatPct: baseParams.bodyFatPct,
        age: baseParams.age,
        gender: baseParams.gender,
        activityMultiplier: 1.375,
        weightGoal: "lose",
        deficitValue: "-250",
        dietaryApproach: "high-protein",
        targetBFRange: { min: 15, max: 20 },
        heightCm: heightCm
      });
      console.log("Test Case 2 (Light Activity, High-Protein, Good):", JSON.stringify(testCase2, null, 2));
  
      const testCase3 = simulateMetabolicAdaptation({
        initialWeight: baseParams.totalWeight,
        isKg: false,
        bodyFatPct: baseParams.bodyFatPct,
        age: baseParams.age,
        gender: baseParams.gender,
        activityMultiplier: 1.55,
        weightGoal: "lose",
        deficitValue: "-250",
        dietaryApproach: "balanced",
        targetBFRange: { min: 15, max: 20 },
        heightCm: heightCm
      });
      console.log("Test Case 3 (Moderate Activity, Balanced, Good):", JSON.stringify(testCase3, null, 2));
    }
  
    runTestCases();
  
    // Ensure the fat goal dropdown is populated on page load with the default gender
    document.addEventListener("DOMContentLoaded", function() {
      const defaultGender = document.querySelector('input[name="gender"]:checked').value;
      populateGoalBodyFatOptions(defaultGender);
    });
    
  })();
  