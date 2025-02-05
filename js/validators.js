// validators.js
const calculatorValidators = {
  validateStep(step) {
    calculatorUI.clearErrors();
    
    switch(step) {
      case 1:
        return true; // Basic mode selection always valid
      
      case 2:
        return this.validateAge();
      
      case 3:
        return this.validateComposition();
      
      case 4:
        return this.validateGoals();
      
      default:
        return true;
    }
  },

  validateAge() {
    const age = parseInt(calculatorState.get('age'));
    if (isNaN(age) || age < 20 || age > 69) {
      calculatorUI.showError('age', 'Age must be between 20 and 69');
      return false;
    }
    return true;
  },

  validateComposition() {
    if (calculatorState.get('inputMode') === 'leanFat') {
      const leanMass = parseFloat(calculatorState.get('leanMass'));
      const fatMass = parseFloat(calculatorState.get('fatMass'));
      
      if (!leanMass || leanMass <= 0) {
        calculatorUI.showError('leanMass', 'Invalid lean mass');
        return false;
      }
      if (!fatMass || fatMass < 0) {
        calculatorUI.showError('fatMass', 'Invalid fat mass');
        return false;
      }
      
      return true;
    } else {
      const totalWeight = parseFloat(calculatorState.get('totalWeight'));
      const bodyFatPct = parseFloat(calculatorState.get('bodyFatPct'));
      
      if (!totalWeight || totalWeight <= 0) {
        calculatorUI.showError('totalWeight', 'Invalid weight');
        return false;
      }
      if (!bodyFatPct || bodyFatPct < 0 || bodyFatPct > 100) {
        calculatorUI.showError('bodyFatPct', 'Body fat % must be between 0 and 100');
        return false;
      }
      
      return true;
    }
  },

  validateGoals() {
    const weightGoal = calculatorState.get('weightGoal');
    const dietaryApproach = calculatorState.get('dietaryApproach');
    const dailyAdjustment = parseFloat(calculatorState.get('dailyAdjustment'));
    const leanMassChange = parseFloat(calculatorState.get('leanMassChange'));

    if (!weightGoal) {
      calculatorUI.showError('weightGoal', 'Please select a weight goal');
      return false;
    }

    if (!dietaryApproach) {
      calculatorUI.showError('dietaryApproach', 'Please select a dietary approach');
      return false;
    }

    if (weightGoal === 'lose' && dailyAdjustment > 0) {
      calculatorUI.showError('dailyAdjustment', 'Adjustment should be negative for weight loss');
      return false;
    }

    if (weightGoal === 'gain' && dailyAdjustment < 0) {
      calculatorUI.showError('dailyAdjustment', 'Adjustment should be positive for weight gain');
      return false;
    }

    if (!leanMassChange || leanMassChange < 0 || leanMassChange > 100) {
      calculatorUI.showError('leanMassChange', 'Lean mass change % must be between 0 and 100');
      return false;
    }

    return true;
  }
};