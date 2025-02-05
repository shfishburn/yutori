// state.js
class CalculatorState {
  constructor() {
    // Initialize default state
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
      
      // Step 4
      weightGoal: 'maintain',
      dietaryApproach: 'balanced',
      activityLevel: '1.375',
      dailyAdjustment: 0,
      leanMassChange: null,
      fatGoalCategory: 'good',
      
      // Calculation results
      results: null
    };
  }

  // Get a specific state value
  get(key) {
    return this.state[key];
  }

  // Set a specific state value
  set(key, value) {
    this.state[key] = value;
    return this;
  }

  // Update multiple state values at once
  update(key, value) {
    if (typeof key === 'object') {
      this.state = { ...this.state, ...key };
    } else {
      this.state[key] = value;
    }
    return this;
  }

  // Reset state to initial values
  reset() {
    this.state = new CalculatorState().state;
    return this;
  }

  // Get the entire state
  getState() {
    return { ...this.state };
  }
}

// Global state instance
const calculatorState = new CalculatorState();