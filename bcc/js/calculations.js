const calculatorCalculations = {
  calculate() {
    try {
      const state = calculatorState.getState();
      const isKg = state.unit === 'kg';
      const toKg = (value) => isKg ? value : value / 2.20462;
      const toLbs = (value) => isKg ? value * 2.20462 : value;

      // Composition calculations
      let leanMassKg, fatMassKg;
      if (state.inputMode === 'leanFat') {
        leanMassKg = toKg(parseFloat(state.leanMass));
        fatMassKg = toKg(parseFloat(state.fatMass));
      } else {
        const totalWeightKg = toKg(parseFloat(state.totalWeight));
        const bodyFatPct = parseFloat(state.bodyFatPct);
        fatMassKg = totalWeightKg * (bodyFatPct / 100);
        leanMassKg = totalWeightKg - fatMassKg;
      }

      // BMR & TDEE calculations
      let BMR, TDEE;
      if (state.knownMetrics) {
        BMR = parseFloat(state.measuredBMR);
        TDEE = parseFloat(state.measuredTDEE);
      } else {
        BMR = 370 + (21.6 * leanMassKg);
        TDEE = state.activeEnergy ? 
          BMR + parseFloat(state.activeEnergy) :
          BMR * parseFloat(state.activityLevel);
      }

      // Final calories with adjustment
      let finalCals = TDEE;
      if (state.weightGoal !== 'maintain') {
        finalCals += parseFloat(state.dailyAdjustment || 0);
      }
      finalCals = Math.max(finalCals, 1200);

      // Macro calculations
      let proteinMultiplier = state.weightGoal === 'lose' ? 2.2 : 
                             state.weightGoal === 'gain' ? 2.0 : 1.6;
      
      if (state.age > 60) {
        proteinMultiplier = Math.max(proteinMultiplier, 2.0);
      }

      const maxProteinGrams = leanMassKg * 2.5;
      const proteinGrams = Math.min(
        Math.round(leanMassKg * proteinMultiplier),
        maxProteinGrams
      );
      const proteinCals = proteinGrams * 4;

      const baseCarbPercent = state.insulinResistance ? 0.20 :
                             state.dietaryApproach === 'high-protein' ? 0.30 :
                             state.dietaryApproach === 'low-carb' ? 0.10 : 0.40;
      
      const carbCals = (finalCals - proteinCals) * baseCarbPercent;
      const carbGrams = Math.round(carbCals / 4);

      const fatCals = finalCals - proteinCals - carbCals;
      const fatGrams = Math.round(fatCals / 9);

      const totalWeightKg = leanMassKg + fatMassKg;
      const currentBF = (fatMassKg / totalWeightKg) * 100;

      return {
        currentWeight: toLbs(totalWeightKg),
        currentLean: toLbs(leanMassKg),
        currentFat: toLbs(fatMassKg),
        currentBF: currentBF.toFixed(1),
        currentBFCategory: this.getBFCategory(currentBF / 100),
        bmr: Math.round(BMR),
        tdee: Math.round(TDEE),
        finalCals: Math.round(finalCals),
        macros: {
          proteinGrams,
          carbsGrams: carbGrams,
          fatGrams
        },
        percentages: {
          protein: Math.round((proteinCals / finalCals) * 100),
          carbs: Math.round((carbCals / finalCals) * 100),
          fat: Math.round((fatCals / finalCals) * 100)
        }
      };
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
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