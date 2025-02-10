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

    // --- Simulation Function using Mifflin–St Jeor ---
    function simulateMetabolicAdaptation(params) {
      try {
        if (typeof params !== "object") throw new Error("Input parameters must be provided in an object.");
        const {
          initialWeight,
          isKg,
          bodyFatPct,
          leanMass,
          age,
          gender,
          activityMultiplier,
          weightGoal,
          deficitFraction,
          dietaryApproach,
          carbTolerance,
          targetBFRange,
          forecastWeeks,
          adaptationFactor = 0.02,
          adaptationCap = 0.20
        } = params;
        if (!initialWeight || initialWeight <= 0) throw new Error("Initial weight must be positive.");
        if (bodyFatPct < 0 || bodyFatPct > 100) throw new Error("Body fat percentage must be 0-100.");
        if (!age || age <= 0) throw new Error("Age must be positive.");
        if (!activityMultiplier || activityMultiplier < 1) throw new Error("Activity multiplier must be >= 1.");
        if (!["lose"].includes(weightGoal)) throw new Error("Only weight loss is supported.");
        if (typeof deficitFraction !== "number") throw new Error("Deficit fraction must be a number.");
        if (!["balanced", "low-carb", "high-protein"].includes(dietaryApproach))
          throw new Error("Invalid dietary approach.");
        if (!targetBFRange || typeof targetBFRange.min !== "number" || typeof targetBFRange.max !== "number")
          throw new Error("Target BF range must have min and max values.");
        if (!forecastWeeks || forecastWeeks <= 0) throw new Error("Forecast weeks must be at least 1.");

        // Convert weight to kg if needed
        const lbsToKg = (lbs) => lbs / 2.20462;
        const unit = document.querySelector('input[name="unit"]:checked').value;
        let weightKg = unit === "lbs" ? lbsToKg(initialWeight) : initialWeight;

        // Convert height to cm (if unit is lbs then height is in inches)
        let heightInput = parseFloat(document.getElementById("heightInput").value);
        if (isNaN(heightInput) || heightInput <= 0) throw new Error("Height must be provided.");
        let heightCm = unit === "lbs" ? (heightInput * 2.54) : heightInput;

        // Compute RMR using Mifflin–St Jeor
        let baselineRMR;
        if (gender === "male") {
          baselineRMR = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
        } else {
          baselineRMR = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
        }

        // For simulation, compute lean mass from total weight and BF%
        let currentWeight = initialWeight;
        let currentLeanMass = initialWeight * (1 - (bodyFatPct / 100));
        const baselineTDEE = baselineRMR * activityMultiplier;
        let initialCalTarget = baselineTDEE * (1 - deficitFraction);
        const minCal = gender === "male" ? 1500 : 1200;
        if (initialCalTarget < minCal) initialCalTarget = minCal;

        let leanLossPercent;
        switch (dietaryApproach) {
          case "high-protein":
            leanLossPercent = 0.10;
            break;
          case "balanced":
            leanLossPercent = 0.15;
            break;
          case "low-carb":
            leanLossPercent = 0.20;
            break;
          default:
            leanLossPercent = 0.15;
        }
        // For low-carb, force carb percent to 20%
        let carbPercent = dietaryApproach === "low-carb" ? 0.20 : (carbTolerance === "Low" ? 0.20 : 0.35);

        // IMPORTANT: When calculating protein, convert lean mass (in lbs) to kg if needed
        let proteinMultiplier = (age < 60) ? 2.2 : (gender === "male" ? 2.5 : 2.6);

        const weeklyData = [];
        let cumulativeAdaptation = 0;
        let currentRMR = baselineRMR;
        let currentTDEE = baselineTDEE;
        let currentCalTarget = initialCalTarget;

        for (let week = 1; week <= forecastWeeks; week++) {
          const dailyCalDiff = currentTDEE - currentCalTarget;
          const weeklyCalDiff = dailyCalDiff * 7;

          // Dynamic effective energy density: E_eff = L × 760 + (1 – L) × 3500
          const L = leanLossPercent;
          const E_eff = L * 760 + (1 - L) * 3500;

          // Weight change (in lbs) = weeklyCalDiff / E_eff
          const weightChange = weeklyCalDiff / E_eff;
          // Compute lean mass change (note: currentLeanMass is in lbs; conversion will occur when computing protein)
          const leanMassChange = weightChange * leanLossPercent;

          currentWeight = currentWeight - weightChange;
          currentLeanMass = currentLeanMass - leanMassChange;
          if (currentWeight < 0) currentWeight = 0;
          if (currentLeanMass < 0) currentLeanMass = 0;

          // Update RMR based on new weight (keep height, age, gender constant)
          let newWeightKg = unit === "lbs" ? lbsToKg(currentWeight) : currentWeight;
          if (gender === "male") {
            currentRMR = (10 * newWeightKg) + (6.25 * heightCm) - (5 * age) + 5;
          } else {
            currentRMR = (10 * newWeightKg) + (6.25 * heightCm) - (5 * age) - 161;
          }

          cumulativeAdaptation += adaptationFactor;
          if (cumulativeAdaptation > adaptationCap) cumulativeAdaptation = adaptationCap;
          currentTDEE = baselineTDEE * (1 - cumulativeAdaptation);
          currentCalTarget = currentTDEE * (1 - deficitFraction);
          if (currentCalTarget < minCal) currentCalTarget = minCal;

          // Compute protein target using lean mass converted to kg
          const proteinGrams = Math.max((unit === "lbs" ? lbsToKg(currentLeanMass) : currentLeanMass) * proteinMultiplier, (0.30 * currentCalTarget) / 4);
          const carbGrams = (currentCalTarget * carbPercent) / 4;
          const fatGrams = (currentCalTarget - (proteinGrams * 4 + carbGrams * 4)) / 9;

          weeklyData.push({
            week,
            weight: currentWeight,
            TDEE: currentTDEE,
            calorieTarget: currentCalTarget,
            macros: {
              protein: Math.round(proteinGrams),
              carbs: Math.round(carbGrams),
              fat: Math.round(fatGrams)
            }
          });
        }

        return {
          weeklyData,
          disclaimer: "This calculator is for informational purposes only. Consult a healthcare professional before making any major changes to your diet or exercise program."
        };
      } catch (error) {
        console.error("Simulation error:", error);
        return null;
      }
    }

    // --- New Scenario Button ---
    document.getElementById("newScenarioBtn").addEventListener("click", () => {
      steps.forEach(s => s.style.display = "none");
      document.querySelectorAll('input[type="number"]').forEach(inp => inp.value = "");
      dailyAdjustmentSelect.value = "-250";
      document.getElementById("radioLbs").checked = true;
      showStep(0);
    });

    // --- Modal Handlers ---
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
    document.getElementById("disclaimerLink").addEventListener("click", () => {
      document.getElementById("disclaimerModal").style.display = "flex";
    });

    // --- Navigation & UI Handling ---
    const steps = Array.from(document.querySelectorAll(".wizard-step"));
    let currentStepIndex = 0;
    function showStep(index) {
      steps.forEach((s, i) => s.style.display = i === index ? "block" : "none");
      currentStepIndex = index;
    }
    document.querySelectorAll("[data-next-step]").forEach((btn) => {
      btn.addEventListener("click", () => { if (!validateCurrentStep()) return; showStep(currentStepIndex + 1); });
    });
    document.querySelectorAll("[data-prev-step]").forEach((btn) => {
      btn.addEventListener("click", () => showStep(currentStepIndex - 1));
    });

    // --- Calorie Adjustment Dropdown ---
    const weightGoalRadios = document.getElementsByName("weightGoal");
    function updateCalorieDropdown() {
      let optionsHTML = `
        <option value="-250" selected>Slow loss: (~250 cal/day deficit) ≈ 0.5 lb/week</option>
        <option value="-500">Moderate loss: (~500 cal/day deficit) ≈ 1 lb/week</option>
        <option value="-750">Rapid loss: (~750 cal/day deficit) ≈ 1.5 lb/week</option>
        <option value="-1000">Dangerous loss: (~1,000+ cal/day deficit) ≈ 2 lb/week or more</option>
      `;
      dailyAdjustmentSelect.innerHTML = optionsHTML;
    }
    updateCalorieDropdown();
    Array.from(weightGoalRadios).forEach(r => r.addEventListener("change", updateCalorieDropdown));

    // --- Basic Validation ---
    function validateCurrentStep() {
      clearErrors(steps[currentStepIndex]);
      // In merged step 1, validate height, age, weight and BF%
      if (currentStepIndex === 0) {
        const heightVal = parseFloat(document.getElementById("heightInput").value);
        const ageVal = parseInt(document.getElementById("ageInput").value || "", 10);
        const weightVal = parseFloat(document.getElementById("totalWeightInput").value);
        const bfVal = parseFloat(document.getElementById("bodyFatPctInput").value);
        if (isNaN(heightVal) || heightVal <= 0) {
          showError(document.getElementById("heightInput"), "Height must be provided and positive.");
          return false;
        }
        if (isNaN(ageVal) || ageVal < 18 || ageVal > 75) {
          showError(document.getElementById("ageInput"), "Age must be 18-75");
          return false;
        }
        if (isNaN(weightVal) || weightVal <= 0) {
          showError(document.getElementById("totalWeightInput"), "Invalid weight");
          return false;
        }
        if (isNaN(bfVal) || bfVal < 0 || bfVal > 100) {
          showError(document.getElementById("bodyFatPctInput"), "BF% must be between 8% and 40%");
          return false;
        }
      }
      return true;
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

    // --- On Calculate Button ---
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

    // --- Final Calculation, UI Update, and Chart Rendering ---
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

      // Compute RMR using Mifflin–St Jeor
      let RMR;
      if (gender === "male") {
        RMR = (10 * weightKg) + (6.25 * heightCm) - (5 * ageVal) + 5;
      } else {
        RMR = (10 * weightKg) + (6.25 * heightCm) - (5 * ageVal) - 161;
      }

      // Compute lean mass from total weight and BF%
      const leanMass = weightVal * (1 - (bfVal / 100));
      const cWeight = unit === "lbs" ? weightVal : (weightVal * 2.20462);
      setTextContent("currentWeightSpan", fmtWeight(cWeight, false));
      const fatMass = weightVal * (bfVal / 100);
      setTextContent("currentFatSpan", fmtWeight(fatMass, false) + " (" + ((fatMass / weightVal) * 100).toFixed(1) + "%)");
      setTextContent("currentLeanSpan", fmtWeight(leanMass, false));
      setTextContent("currentBFpctSpan", ((fatMass / weightVal) * 100).toFixed(1) + "%");
      setTextContent("currentBFcatSpan", getBFCat(fatMass / weightVal));

      // --- Compute Goal Range (Low-High) ---
      const fatRangeLookup = {
        dangerouslyLow: { pLow: 0.08, pHigh: 0.10 },
        excellent: { pLow: 0.10, pHigh: 0.15 },
        good: { pLow: 0.15, pHigh: 0.20 },
        fair: { pLow: 0.20, pHigh: 0.25 },
        poor: { pLow: 0.25, pHigh: 0.30 },
        dangerouslyHigh: { pLow: 0.30, pHigh: 0.35 }
      };
      const catKey = document.getElementById("fatGoalCategorySelect").value;
      const range = fatRangeLookup[catKey] || { pLow: 0.10, pHigh: 0.15 };
      const goalWeightLow = leanMass / (1 - range.pLow);
      const goalWeightHigh = leanMass / (1 - range.pHigh);
      const goalFatLow = goalWeightLow - leanMass;
      const goalFatHigh = goalWeightHigh - leanMass;
      const goalBFpctLow = (goalFatLow / goalWeightLow) * 100;
      const goalBFpctHigh = (goalFatHigh / goalWeightHigh) * 100;

      setTextContent("goalWeightSpan", fmtWeight(goalWeightLow, false) + "–" + fmtWeight(goalWeightHigh, false));
      setTextContent("goalFatSpan", fmtWeight(goalFatLow, false) + "–" + fmtWeight(goalFatHigh, false));
      setTextContent("goalLeanSpan", fmtWeight(leanMass, false));
      setTextContent("goalBFpctSpan", goalBFpctLow.toFixed(1) + "%–" + goalBFpctHigh.toFixed(1) + "%");
      setTextContent("goalBFcatSpan", catKey);

      // --- Summary Settings (Settings Card) ---
      const dietary = document.querySelector('input[name="dietaryApproach"]:checked').value;
      setTextContent("summaryAge", document.getElementById("ageInput").value || "--");
      setTextContent("summaryGender", gender || "--");
      const deficitVal = document.getElementById("dailyAdjustmentSelect").value;
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
      const leanInfo = leanLossLookup[dietary] ? leanLossLookup[dietary][deficitVal] : null;
      if (leanInfo) {
        setTextContent("summaryLeanGoalPct", leanInfo.lean + "% lean loss, " + leanInfo.fat + "% fat loss");
      } else {
        setTextContent("summaryLeanGoalPct", "--");
      }
      setTextContent("summaryWeightGoal", "Lose Weight");
      setTextContent("summaryDietApproach", dietary);
      const af = parseFloat(document.getElementById("activityLevelSelect").value) || 1.55;
      setTextContent("summaryActivityLevel", af);
      const dailyAdjVal = parseFloat(document.getElementById("dailyAdjustmentSelect").value) || 0;
      setTextContent("summaryDailyAdj", dailyAdjVal);

      // --- Compute RMR, TDEE, and Final Calories using Mifflin–St Jeor ---
      let RMR_final;
      if (gender === "male") {
        RMR_final = (10 * weightKg) + (6.25 * heightCm) - (5 * ageVal) + 5;
      } else {
        RMR_final = (10 * weightKg) + (6.25 * heightCm) - (5 * ageVal) - 161;
      }
      const TDEE = RMR_final * af;
      let finalCals = TDEE + dailyAdjVal;
      if (finalCals < 1200) finalCals = 1200;

      // --- Run Simulation with Dynamic Energy Density ---
      const simParams = {
        initialWeight: cWeight,
        isKg: false,
        bodyFatPct: bfVal,
        leanMass: leanMass,
        age: ageVal,
        gender: gender,
        activityMultiplier: af,
        weightGoal: "lose",
        deficitFraction: Math.abs(parseFloat(document.getElementById("dailyAdjustmentSelect").value)) / TDEE,
        dietaryApproach: dietary,
        carbTolerance: "Unsure",
        targetBFRange: { min: 15, max: 20 },
        forecastWeeks: 16,
        adaptationFactor: 0.02,
        adaptationCap: 0.20
      };
      const simResult = simulateMetabolicAdaptation(simParams);
      if (simResult && simResult.weeklyData) {
        const calArray = simResult.weeklyData.map(x => x.calorieTarget);
        const tdeeArray = simResult.weeklyData.map(x => x.TDEE);
        const proteinArray = simResult.weeklyData.map(x => x.macros.protein);
        const carbsArray = simResult.weeklyData.map(x => x.macros.carbs);
        const fatArray = simResult.weeklyData.map(x => x.macros.fat);

        const finalCalsLow = Math.min(...calArray);
        const finalCalsHigh = Math.max(...calArray);
        const tdeeLow = Math.min(...tdeeArray);
        const tdeeHigh = Math.max(...tdeeArray);
        const proteinLow = Math.min(...proteinArray);
        const proteinHigh = Math.max(...proteinArray);
        const carbsLow = Math.min(...carbsArray);
        const carbsHigh = Math.max(...carbsArray);
        const fatLow = Math.min(...fatArray);
        const fatHigh = Math.max(...fatArray);

        setTextContent("bmrSpan", Math.round(RMR_final) + " kcal/day");
        setTextContent("tdeeSpan", Math.round(tdeeLow) + "–" + Math.round(tdeeHigh) + " kcal/day");
        setTextContent("finalCalsSpan", Math.round(finalCalsLow) + "–" + Math.round(finalCalsHigh) + " kcal/day");
        setTextContent("carbsSpan", Math.round(carbsLow) + "–" + Math.round(carbsHigh) + " g");
        setTextContent("proteinSpan", Math.round(proteinLow) + "–" + Math.round(proteinHigh) + " g");
        setTextContent("fatSpan", Math.round(fatLow) + "–" + Math.round(fatHigh) + " g");
        setTextContent("macroHealthComment", getAdvice(finalCals - TDEE));

        renderForecastCharts(simResult.weeklyData);
        console.log("Simulation Result:", simResult);

        // --- Additional Explanation for Goal Range Card ---
        const weightArray = simResult.weeklyData.map(x => x.weight);
        const initialSimWeight = cWeight;
        const finalSimWeight = weightArray[weightArray.length - 1];
        const avgWeeklyLoss = (initialSimWeight - finalSimWeight) / simResult.weeklyData.length;
        const midGoalWeight = (goalWeightLow + goalWeightHigh) / 2;
        const weeksToGoal = (cWeight - midGoalWeight) / (avgWeeklyLoss || 1);
        const currentDate = new Date();
        const projectedGoalDate = new Date(currentDate.getTime() + weeksToGoal * 7 * 24 * 60 * 60 * 1000);
        const extraInfo = document.createElement("p");
        extraInfo.className = "mt-2 text-sm text-gray-700";
        extraInfo.textContent = `For a reference user, the Goal Range is:
Weight: ${fmtWeight(goalWeightLow, false)}–${fmtWeight(goalWeightHigh, false)},
Fat Mass: ${fmtWeight(goalFatLow, false)}–${fmtWeight(goalFatHigh, false)},
Lean Mass: ${fmtWeight(leanMass, false)},
BF%: ${goalBFpctLow.toFixed(1)}%–${goalBFpctHigh.toFixed(1)}% (${catKey.toUpperCase()}).
Based on current projections, you should lose up to ${avgWeeklyLoss.toFixed(2)} lbs per week.
Over ${simResult.weeklyData.length} weeks, you will lose a total of ${(initialSimWeight - finalSimWeight).toFixed(2)} lbs.`;
        const goalRangeCard = document.querySelector("#goalWeightSpan").parentElement.parentElement;
        if (goalRangeCard) goalRangeCard.appendChild(extraInfo);
      } else {
        console.error("No simulation data available.");
      }
    }

    // --- Unit Test: Log Simulation Result for our reference user ---
    try {
      const testSim = simulateMetabolicAdaptation({
        initialWeight: 287.5,
        isKg: false,
        bodyFatPct: 35.7,
        age: 62,
        gender: "male",
        activityMultiplier: 1.55,
        weightGoal: "lose",
        deficitFraction: 0.50,  // Moderate loss (~500 cal/day deficit)
        dietaryApproach: "low-carb",
        carbTolerance: "Unsure",
        targetBFRange: { min: 15, max: 20 },
        forecastWeeks: 16,
        adaptationFactor: 0.02,
        adaptationCap: 0.20
      });
      console.log("Unit Test Simulation Result:", testSim);
    } catch (error) {
      console.error("Unit Test Simulation Error:", error);
    }
  })();