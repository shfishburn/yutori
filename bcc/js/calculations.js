// calculations.js
const calculatorCalculations = {
  calculate() {
    try {
      const state = calculatorState.getState();
      
      // Determine composition
      const inputMode = state.inputMode;
      let leanMass, fatMass, totalWeight, bodyFatPct;

      if (inputMode === 'leanFat') {
        leanMass = state.leanMass;
        fatMass = state.fatMass;
        totalWeight = leanMass + fatMass;
        bodyFatPct = (fatMass / totalWeight) * 100;
      } else {
        totalWeight = state.totalWeight;
        bodyFatPct = state.bodyFatPct;
        fatMass = totalWeight * (bodyFatPct / 100);
        leanMass = totalWeight - fatMass;
      }

      // BMR Calculation
      const leanMassKg = leanMass / 2.20462;
      const bmr = 370 + (21.6 * leanMassKg);
      
      // TDEE Calculation
      const activityMultiplier = parseFloat(state.activityLevel || 1.55);
      const tdee = bmr * activityMultiplier;
      
      // Final Calories
      const dailyAdjustment = parseFloat(state.dailyAdjustment || 0);
      const finalCals = tdee + dailyAdjustment;

      // Macro Calculations
      const proteinGrams = leanMassKg * 2.0;  // 2g per kg of lean mass
      const carbGrams = (finalCals * 0.3) / 4;
      const fatGrams = (finalCals * 0.3) / 9;

      return {
        currentWeight: totalWeight.toFixed(1),
        leanMass: leanMass.toFixed(1),
        fatMass: fatMass.toFixed(1),
        bodyFatPct: bodyFatPct.toFixed(1),
        bmr: bmr.toFixed(0),
        tdee: tdee.toFixed(0),
        finalCals: finalCals.toFixed(0),
        macros: {
          protein: proteinGrams.toFixed(0),
          carbs: carbGrams.toFixed(0),
          fat: fatGrams.toFixed(0)
        }
      };
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
  }
};