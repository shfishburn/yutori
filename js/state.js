// state.js
const calculatorState = {
  data: {
    currentStep: 1,
    // ... existing state properties
  },

  update(key, value) {
    try {
      if (!(key in this.data)) {
        throw new Error(`Invalid state key: ${key}`);
      }

      // Type checking for critical values
      switch(key) {
        case 'currentStep':
          if (!Number.isInteger(Number(value)) || value < 1 || value > 5) {
            throw new Error('Invalid step number');
          }
          break;
        case 'age':
        case 'leanMass':
        case 'fatMass':
        case 'totalWeight':
        case 'bodyFatPct':
        case 'dailyAdjustment':
        case 'leanMassChange':
          if (value !== '' && isNaN(Number(value))) {
            throw new Error(`Invalid numeric value for ${key}`);
          }
          break;
      }

      this.data[key] = value;
      calculatorUI.updateDisplay();
    } catch (error) {
      console.error('State update error:', error);
      calculatorUI.showError('system', `System Error: ${error.message}`);
    }
  },

  get(key) {
    try {
      if (!(key in this.data)) {
        throw new Error(`Invalid state key: ${key}`);
      }
      return this.data[key];
    } catch (error) {
      console.error('State get error:', error);
      return null;
    }
  }
};