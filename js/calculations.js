// calculations.js
const calculatorCalculations = {
  formatWeight(weight, unit = null) {
    unit = unit || calculatorState.get('unit');
    const value = unit === 'kg' ? weight / 2.20462 : weight;
    return `${value.toFixed(1)} ${unit}`;
  },

  getLeanFatMass() {
    const isKg = calculatorState.get('unit') === 'kg';
    
    if (calculatorState.get('inputMode') === 'leanFat') {
      let leanMass = parseFloat(calculatorState.get('leanMass'));
      let fatMass = parseFloat(calculatorState.get('fatMass'));
      
      if (isKg) {
        leanMass *= 2.20462;
        fatMass *= 2.20462;
      }
      
      return { leanMass, fatMass };
    } else {
      const weight = parseFloat(calculatorState.get('totalWeight'));
      const bf = parseFloat(calculatorState.get('bodyFatPct'));
      const totalLbs = isKg ? weight * 2.20462 : weight;
      
      const fatMass = (bf / 100) * totalLbs;
      const leanMass = totalLbs - fatMass;
      
      return { leanMass, fatMass };
    }
  },

  calculateBMR(leanMassLbs) {
    const leanMassKg = leanMassLbs / 2.20462;
    return 370 + (21.6 * leanMassKg);
  },

  calculateMacros(calories, approach) {
    let protein, carbs, fat;
    
    switch(approach) {
      case 'low-carb':
        protein = (calories * 0.35) / 4;
        fat = (calories * 0.55) / 9;
        carbs = (calories * 0.10) / 4;
        break;
      
      case 'high-protein':
        protein = (calories * 0.40) / 4;
        fat = (calories * 0.30) / 9;
        carbs = (calories * 0.30) / 4;
        break;
      
      default: // balanced
        protein = (calories * 0.33) / 4;
        fat = (calories * 0.34) / 9;
        carbs = (calories * 0.33) / 4;
        break;
    }
    
    return {
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat)
    };
  },

  calculate() {
    // Get current composition
    const { leanMass, fatMass } = this.getLeanFatMass();
    const currentWeight = leanMass + fatMass;
    const currentBF = (fatMass / currentWeight) * 100;

    // Calculate BMR and TDEE
    const bmr = this.calculateBMR(leanMass);
    const activityLevel = parseFloat(calculatorState.get('activityLevel'));
    const tdee = bmr * activityLevel;
    
    // Calculate final calories
    const dailyAdjustment = parseFloat(calculatorState.get('dailyAdjustment')) || 0;
    let finalCals = tdee + dailyAdjustment;
    if (finalCals < 1200) finalCals = 1200;

    // Calculate macros
    const macros = this.calculateMacros(finalCals, calculatorState.get('dietaryApproach'));

    // Calculate goal ranges based on selected category
    const fatRanges = {
      excellent: { low: 10, high: 15 },
      good: { low: 15, high: 20 },
      fair: { low: 20, high: 25 }
    };
    
    const category = calculatorState.get('fatGoalCategory');
    const targetRange = fatRanges[category];
    const leanChange = parseFloat(calculatorState.get('leanMassChange')) / 100;

    // Calculate goal weights
    const goalLeanLow = leanMass * (1 + leanChange);
    const goalWeightLow = goalLeanLow / (1 - targetRange.low/100);
    const goalFatLow = goalWeightLow - goalLeanLow;

    const goalLeanHigh = leanMass * (1 + leanChange);
    const goalWeightHigh = goalLeanHigh / (1 - targetRange.high/100);
    const goalFatHigh = goalWeightHigh - goalLeanHigh;

    // Return formatted results
    return {
      currentWeight: this.formatWeight(currentWeight),
      currentLean: this.formatWeight(leanMass),
      currentFat: this.formatWeight(fatMass),
      currentBF: currentBF.toFixed(1) + '%',
      
      goalWeight: `${this.formatWeight(goalWeightLow)} - ${this.formatWeight(goalWeightHigh)}`,
      goalLean: `${this.formatWeight(goalLeanLow)} - ${this.formatWeight(goalLeanHigh)}`,
      goalFat: `${this.formatWeight(goalFatLow)} - ${this.formatWeight(goalFatHigh)}`,
      goalBF: `${targetRange.low}% - ${targetRange.high}%`,
      
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      finalCals: Math.round(finalCals),
      protein: `${macros.protein}g`,
      carbs: `${macros.carbs}g`,
      fat: `${macros.fat}g`,
      
      goalLabel: this.getGoalLabel(),
      approachLabel: this.getApproachLabel(),
      activityLabel: activityLevel,
      dailyAdjustment: dailyAdjustment > 0 ? `+${dailyAdjustment}` : dailyAdjustment,
      leanGoalPct: `${(leanChange * 100).toFixed(1)}%`
    };
  },

  getGoalLabel() {
    const goal = calculatorState.get('weightGoal');
    switch(goal) {
      case 'lose': return 'Lose Weight';
      case 'maintain': return 'Maintain';
      case 'gain': return 'Gain Lean Mass';
      default: return '';
    }
  },

  getApproachLabel() {
    const approach = calculatorState.get('dietaryApproach');
    switch(approach) {
      case 'low-carb': return 'Low-Carb';
      case 'high-protein': return 'High-Protein';
      case 'balanced': return 'Balanced';
      default: return '';
    }
  }
};