class CalculatorState {
  constructor() {
    this.state = {
      // Navigation
      currentStep: 1,
      
      // Step 1
      inputMode: 'leanFat',
      unit: 'lbs',
      
      // Step 2
      age: 30,
      gender: 'male',
      
      // Step 3
      leanMass: null,
      fatMass: null,
      totalWeight: null,
      bodyFatPct: null,
      measuredBMR: null,
      measuredTDEE: null,
      knownMetrics: false,
      insulinResistance: false,
      
      // Step 4
      weightGoal: 'maintain',
      dietaryApproach: 'balanced',
      activityLevel: '1.375',
      activeEnergy: null,
      dailyAdjustment: 0,
      
      // Results
      results: null
    };
  }

  get(key) { 
    return this.state[key]; 
  }

  set(key, value) { 
    this.state[key] = value; 
    return this; 
  }

  update(updates) {
    if (typeof updates === 'object') {
      Object.assign(this.state, updates);
    }
    return this;
  }

  reset() {
    this.state = new CalculatorState().state;
    return this;
  }

  getState() { 
    return { ...this.state }; 
  }
}

const calculatorState = new CalculatorState();