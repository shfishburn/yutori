// calculations.js
const calculatorCalculations = {
  calculate() {
    try {
      // Determine input mode and unit
      const isKg = document.getElementById('radioKg').checked;
      let M0 = 0, F0 = 0;

      // Composition calculation
      const radioLeanFat = document.getElementById('radioLeanFat');
      if (radioLeanFat.checked) {
        M0 = parseFloat(document.getElementById('leanMassInput').value) || 0;
        F0 = parseFloat(document.getElementById('fatMassInput').value) || 0;
        if (isKg) { 
          M0 *= 2.20462; 
          F0 *= 2.20462; 
        }
      } else {
        let w = parseFloat(document.getElementById('totalWeightInput').value) || 0;
        let bf = parseFloat(document.getElementById('bodyFatPctInput').value) || 0;
        if (isKg) w *= 2.20462;
        F0 = (bf / 100) * w;
        M0 = w - F0;
      }

      // Current composition
      const cWeight = M0 + F0;
      const currentBF = (F0 / cWeight) * 100;

      // BMR calculation
      const LMkg = M0 / 2.20462;
      const BMR = 370 + (21.6 * LMkg);

      // Activity and TDEE
      const activityFactor = parseFloat(document.getElementById('activityLevelSelect').value) || 1.55;
      const TDEE = BMR * activityFactor;

      // Daily adjustment
      let dailyAdj = parseFloat(document.getElementById('dailyAdjustmentInput').value) || 0;
      const weightGoal = document.querySelector('input[name="weightGoal"]:checked')?.value;
      if (weightGoal === "maintain") dailyAdj = 0;

      // Final calories
      let finalCals = TDEE + dailyAdj;
      finalCals = Math.max(finalCals, 1200);

      // Macro calculation
      const approach = document.querySelector('input[name="dietaryApproach"]:checked')?.value || "balanced";
      const macros = this.computeMacros(finalCals, approach);

      // Goal range calculation
      const fatRangeCategory = document.getElementById('fatGoalCategorySelect').value;
      const leanMassChangePercent = parseFloat(document.getElementById('leanMassChangeInput').value) || 0;

      // Prepare results object
      return {
        currentWeight: cWeight,
        currentLean: M0,
        currentFat: F0,
        currentBF: currentBF.toFixed(1),
        currentBFCategory: this.getBFCategory(currentBF / 100),
        bmr: Math.round(BMR),
        tdee: Math.round(TDEE),
        finalCals: Math.round(finalCals),
        macros: macros,
        weightGoal: weightGoal,
        dietaryApproach: approach,
        activityFactor: activityFactor,
        dailyAdjustment: dailyAdj,
        leanMassChangePercent: leanMassChangePercent,
        fatRangeCategory: fatRangeCategory
      };
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
  },

  computeMacros(finalCals, approach) {
    const fractions = {
      "balanced": { carbs: 0.33, protein: 0.33, fat: 0.34 },
      "low-carb": { carbs: 0.10, protein: 0.35, fat: 0.55 },
      "high-protein": { carbs: 0.30, protein: 0.40, fat: 0.30 }
    }[approach] || { carbs: 0.33, protein: 0.33, fat: 0.34 };

    return {
      carbsGrams: Math.round(finalCals * fractions.carbs / 4),
      proteinGrams: Math.round(finalCals * fractions.protein / 4),
      fatGrams: Math.round(finalCals * fractions.fat / 9)
    };
  },

  getBFCategory(r) {
    const p = r * 100;
    if (p < 10) return "Dangerously Low";
    if (p < 15) return "Excellent";
    if (p < 20) return "Good";
    if (p < 25) return "Fair";
    if (p < 30) return "Poor";
    return "Dangerously High";
  }
};