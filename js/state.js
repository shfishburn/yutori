// state.js
const calculatorState = {
  data: {
    currentStep: 1,
    inputMode: 'weightBF',
    unit: 'lbs',
    gender: 'female',
    age: '',
    leanMass: '',
    fatMass: '',
    totalWeight: '',
    bodyFatPct: '',
    weightGoal: '',
    dietaryApproach: '',
    activityLevel: '1.55',
    dailyAdjustment: '',
    leanMassChange: '',
    fatGoalCategory: 'excellent'
  },

  // Update state and trigger UI update
  update(key, value) {
    this.data[key] = value;
    calculatorUI.updateDisplay();
  },

  // Get current state
  get(key) {
    return this.data[key];
  },

  // Reset state
  reset() {
    Object.assign(this.data, {
      currentStep: 1,
      inputMode: 'weightBF',
      unit: 'lbs',
      gender: 'female',
      age: '',
      leanMass: '',
      fatMass: '',
      totalWeight: '',
      bodyFatPct: '',
      weightGoal: '',
      dietaryApproach: '',
      activityLevel: '1.55',
      dailyAdjustment: '',
      leanMassChange: '',
      fatGoalCategory: 'excellent'
    });
    calculatorUI.updateDisplay();
  }
};