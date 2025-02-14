(function () {
  "use strict";

  // --- Helper: setTextContent defensively ---
  function setTextContent(id, value) {
    const el = document.getElementById(id);
    if (!el) {
      console.error(`Element with id '${id}' not found.`);
      return;
    }
    el.textContent = value;
  }

  // --- Helper Functions ---
  function fmtWeight(weight, isKg) {
    if (typeof weight !== "number") {
      console.error("fmtWeight expects a number; received:", typeof weight);
      return "";
    }
    return isKg ? (weight / 2.20462).toFixed(2) + " kg" : weight.toFixed(2) + " lbs";
  }

  function getBFCat(ratio) {
    if (ratio < 0.1) return "Very Low";
    if (ratio < 0.15) return "Excellent";
    if (ratio < 0.2) return "Good";
    if (ratio < 0.25) return "Fair";
    if (ratio < 0.3) return "Poor";
    return "Very High";
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

  function getAdvice(netDiff) {
    if (netDiff < 0) return "Calorie deficit: aiming for weight loss.";
    if (netDiff > 0) return "Calorie surplus: aiming for weight gain.";
    return "Calorie maintenance.";
  }

  // --- Time-to-Mid-Goal Calculation (not used in current layout) ---
  function timeToGoal(cWeight, goalWeight, finalCals, TDEE, isKg) {
    let netDiff = TDEE - finalCals;
    let absNetDiff = Math.abs(netDiff);
    if (absNetDiff === 0) {
      setTextContent("timeToGoalText", "No calorie change – time cannot be determined.");
      return;
    }
    let weightDiff = Math.abs(cWeight - goalWeight);
    let weeklyChange = (absNetDiff * 7) / 3500;
    if (weeklyChange === 0) {
      setTextContent("timeToGoalText", "Insufficient deficit for measurable weight change.");
      return;
    }
    let weeks = (weightDiff / 2) / weeklyChange;
    weeks = Math.round(weeks * 10) / 10;
    setTextContent("timeToGoalText", weeks + " weeks to mid-goal");
  }

  // --- Chart Rendering ---
  let calorieChart, macroChart, weightChart;
  function renderForecastCharts(weeklyData) {
    try {
      const weeks = weeklyData.map(pt => pt.week);
      const calorieTargets = weeklyData.map(pt => Math.round(pt.calorieTarget));
      const weights = weeklyData.map(pt => Math.round(pt.weight));
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
            x: { title: { display: true, text: "Weeks" } },
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
            x: { title: { display: true, text: "Weeks" } },
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
            x: { title: { display: true, text: "Weeks" } },
            y: { title: { display: true, text: "Weight (lbs)" } }
          }
        }
      });
    } catch (error) {
      console.error("Error rendering charts:", error);
    }
  }

  // --- Simulation Functions ---
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

  function calculateMacros(calories, approach) {
    const distributions = {
      balanced: { carbs: 0.40, protein: 0.30, fat: 0.30 },
      'low-carb': { carbs: 0.25, protein: 0.40, fat: 0.35 },
      'high-protein': { carbs: 0.35, protein: 0.45, fat: 0.20 }
    };

    const dist = distributions[approach] || distributions.balanced;
    
    return {
      protein: Math.round((calories * dist.protein) / 4),
      carbs: Math.round((calories * dist.carbs) / 4),
      fat: Math.round((calories * dist.fat) / 9)
    };
  }

  function simulateMetabolicAdaptation(params) {
    try {
      // Initial parameter validation
      if (typeof params !== "object") {
        throw new Error("Input parameters must be provided in an object.");
      }

      const {
        initialWeight,
        isKg,
        bodyFatPct,
        age,
        gender,
        activityMultiplier,
        weightGoal,
        deficitValue,
        dietaryApproach,
        targetBFRange,
        heightCm
      } = params;

      // Validate all required parameters
      if (!initialWeight || initialWeight <= 0) {
        throw new Error(`Initial weight must be positive. Received: ${initialWeight}`);
      }
      if (bodyFatPct < 8 || bodyFatPct > 40) {
        throw new Error("Body fat percentage must be between 8% and 40%.");
      }
      if (!age || age < 18 || age > 75) {
        throw new Error("Age must be between 18 and 75.");
      }
      if (!activityMultiplier || activityMultiplier < 1) {
        throw new Error("Activity multiplier must be >= 1.");
      }
      if (!["lose"].includes(weightGoal)) {
        throw new Error("Only weight loss is supported.");
      }
      if (!heightCm || heightCm <= 0) {
        throw new Error("Height must be provided in centimeters.");
      }
      if (!["balanced", "low-carb", "high-protein"].includes(dietaryApproach)) {
        throw new Error("Invalid dietary approach.");
      }

      // Get loss ratios from lookup table
      const lossRatios = leanLossLookup[dietaryApproach][deficitValue];
      if (!lossRatios) {
        throw new Error('Invalid dietary approach or deficit value');
      }

      // Convert to kg if needed
      const weightKg = isKg ? initialWeight : initialWeight / 2.20462;

      // Calculate initial stats
      const initialStats = {
        totalWeight: initialWeight,
        leanMass: initialWeight * (1 - (bodyFatPct / 100)),
        fatMass: initialWeight * (bodyFatPct / 100),
        bodyFatPct
      };

      // Calculate RMR and TDEE
      const baselineRMR = gender === "male"
        ? (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
        : (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
      const baselineTDEE = baselineRMR * activityMultiplier;

      // Calculate progression for different body fat percentages
      const targetPercentages = [35, 30, 25, 20, 15, 10, 8];
      const progressionStats = targetPercentages
        .filter(targetBF => targetBF < bodyFatPct)
        .map(targetBF => {
          // For each target BF%, calculate required loss
          const P = targetBF / 100;
          const fatLossPercent = lossRatios.fat / 100;
          const leanLossPercent = lossRatios.lean / 100;

          // Calculate total weight loss needed
          const totalWeightLoss = (initialStats.fatMass - (P * initialStats.totalWeight)) / 
                                (fatLossPercent - P);

          // Calculate component losses
          const fatLoss = totalWeightLoss * fatLossPercent;
          const leanLoss = totalWeightLoss * leanLossPercent;

          // Final weights
          const finalTotalWeight = initialStats.totalWeight - totalWeightLoss;
          const finalLeanMass = initialStats.leanMass - leanLoss;
          const finalFatMass = initialStats.fatMass - fatLoss;

          // Calculate RMR at this weight
          const finalWeightKg = isKg ? finalTotalWeight : finalTotalWeight / 2.20462;
          const rmr = gender === "male"
            ? (10 * finalWeightKg) + (6.25 * heightCm) - (5 * age) + 5
            : (10 * finalWeightKg) + (6.25 * heightCm) - (5 * age) - 161;

          const tdee = rmr * activityMultiplier;
          const targetCalories = tdee + Number(deficitValue);
          const minCal = gender === "male" ? 1500 : 1200;
          const finalCalories = Math.max(targetCalories, minCal);

          // Calculate macros
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
      console.error("Simulation error:", error);
      throw error;
    }
  }

  // --- UI & Navigation ---
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

    console.log(`Unit: ${unit}, Height: ${heightVal}, Age: ${ageVal}, Weight: ${weightVal}, BF%: ${bfVal}`);

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
    const unit = document.querySelector('input[name="unit"]:checked').value;
    const isKg = unit === "kg";
    const weightVal = parseFloat(document.getElementById("totalWeightInput").value);
    const bfVal = parseFloat(document.getElementById("bodyFatPctInput").value);
    const ageVal = parseInt(document.getElementById("ageInput").value) || 30;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const heightVal = parseFloat(document.getElementById("heightInput").value);
    const heightCm = unit === "lbs" ? (heightVal * 2.54) : heightVal;
    const lbsToKg = (lbs) => lbs / 2.20462;
    const weightKg = unit === "lbs" ? lbsToKg(weightVal) : weightVal;

    // Validate weight before proceeding
    if (!weightVal || weightVal <= 0) {
      console.error("Invalid weight value, cannot proceed");
      return;
    }

    const af = parseFloat(document.getElementById("activityLevelSelect").value) || 1.55;
    const dailyAdjVal = parseFloat(document.getElementById("dailyAdjustmentSelect").value) || 0;
    const dietary = document.querySelector('input[name="dietaryApproach"]:checked').value;

    // Run Simulation with Dynamic Energy Density
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
    
    if (simResult && simResult.progressionStats) {
      // Update UI with results
      const currentStats = simResult.initialStats;
      setTextContent("currentWeightSpan", fmtWeight(currentStats.totalWeight, false));
      setTextContent("currentFatSpan", 
        fmtWeight(currentStats.fatMass, false) + 
        " (" + currentStats.bodyFatPct.toFixed(1) + "%)"
      );
      setTextContent("currentLeanSpan", fmtWeight(currentStats.leanMass, false));
      setTextContent("currentBFpctSpan", currentStats.bodyFatPct.toFixed(1) + "%");
      setTextContent("currentBFcatSpan", getBFCat(currentStats.fatMass / currentStats.totalWeight));

      // Update RMR and TDEE displays
      setTextContent("bmrSpan", Math.round(simResult.baselineRMR) + " kcal/day");
      setTextContent("tdeeSpan", Math.round(simResult.baselineTDEE) + " kcal/day");

      // Get progression stats
      const lastStats = simResult.progressionStats[simResult.progressionStats.length - 1];
      setTextContent("finalCalsSpan", Math.round(lastStats.targetCalories) + " kcal/day");
      setTextContent("carbsSpan", lastStats.macros.carbs + " g");
      setTextContent("proteinSpan", lastStats.macros.protein + " g");
      setTextContent("fatSpan", lastStats.macros.fat + " g");

      // Update goal ranges
      if (lastStats) {
        setTextContent("goalWeightSpan", fmtWeight(lastStats.totalWeight, false));
        setTextContent("goalFatSpan", fmtWeight(lastStats.fatMass, false));
        setTextContent("goalLeanSpan", fmtWeight(lastStats.leanMass, false));
        setTextContent("goalBFpctSpan", lastStats.bodyFatPercent.toFixed(1) + "%");
      }

      // Chart rendering if needed
      if (typeof renderForecastCharts === "function") {
        renderForecastCharts(simResult.progressionStats);
      }
    }
  }

  // Event Listeners
  document.querySelectorAll("[data-next-step]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!validateCurrentStep()) return;
      showStep(currentStepIndex + 1);
    });
  });

  document.querySelectorAll("[data-prev-step]").forEach(btn => {
    btn.addEventListener("click", () => showStep(currentStepIndex - 1));
  });

  document.getElementById("calculateButton").addEventListener("click", () => {
    clearErrors(steps[currentStepIndex]);
    const dailyAdj = parseFloat(document.getElementById("dailyAdjustmentSelect").value) || 0;
    if (dailyAdj > 0) {
      showError(document.getElementById("dailyAdjustmentSelect"), "For weight loss, select a deficit (negative value)");
      return;
    }
    doFinalCalculation();
    showStep(2);
  });

  // Initialize calorie dropdown
  const weightGoalRadios = document.getElementsByName("weightGoal");
  function updateCalorieDropdown() {
    const dailyAdjustmentSelect = document.getElementById("dailyAdjustmentSelect");
    if (dailyAdjustmentSelect) {
      dailyAdjustmentSelect.innerHTML = `
        <option value="-250" selected>Slow loss: (~250 cal/day deficit) ≈ 0.5 lb/week</option>
        <option value="-500">Moderate loss: (~500 cal/day deficit) ≈ 1 lb/week</option>
        <option value="-750">Rapid loss: (~750 cal/day deficit) ≈ 1.5 lb/week</option>
        <option value="-1000">Dangerous loss: (~1,000+ cal/day deficit) ≈ 2 lb/week or more</option>
      `;
    }
  }
  updateCalorieDropdown();
  Array.from(weightGoalRadios).forEach(r => r.addEventListener("change", updateCalorieDropdown));

  // Modal handlers
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

  // Test simulation
  try {
    const testSim = simulateMetabolicAdaptation({
      initialWeight: 287.5,
      isKg: false,
      bodyFatPct: 35.7,
      age: 62,
      gender: "male",
      activityMultiplier: 1.55,
      weightGoal: "lose",
      deficitValue: "-500",
      dietaryApproach: "low-carb",
      targetBFRange: { min: 15, max: 20 },
      heightCm: 182.88
    });
    console.log("Unit Test Simulation Result:", testSim);
  } catch (error) {
    console.error("Unit Test Simulation Error:", error);
  }
})();