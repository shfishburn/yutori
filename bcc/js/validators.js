const calculatorValidators = {
  validateStep(step) {
    calculatorUI.clearErrors();
    switch(step) {
      case 1: return true;
      case 2: return this.validateAge();
      case 3: return this.validateComposition() && this.validateKnownMetrics();
      case 4: return this.validateGoals() && this.validateActivity();
      default: return true;
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

  validateKnownMetrics() {
    if (!calculatorState.get('knownMetrics')) return true;
    
    const bmr = parseFloat(calculatorState.get('measuredBMR'));
    const tdee = parseFloat(calculatorState.get('measuredTDEE'));
    
    if (!bmr || bmr < 800 || bmr > 5000) {
      calculatorUI.showError('measuredBMR', 'BMR should be between 800-5000');
      return false;
    }
    if (!tdee || tdee < bmr || tdee > 10000) {
      calculatorUI.showError('measuredTDEE', 'TDEE should be between BMR and 10000');
      return false;
    }
    return true;
  },

  validateActivity() {
    const activityLevel = parseFloat(calculatorState.get('activityLevel'));
    const activeEnergy = parseFloat(calculatorState.get('activeEnergy'));

    if (!activeEnergy && (activityLevel < 1.2 || activityLevel > 1.9)) {
      calculatorUI.showError('activityLevel', 'Activity level must be between 1.2 and 1.9');
      return false;
    }
    if (activeEnergy && (activeEnergy < 0 || activeEnergy > 3000)) {
      calculatorUI.showError('activeEnergy', 'Active energy must be between 0 and 3000');
      return false;
    }
    return true;
  },

  validateGoals() {
    const weightGoal = calculatorState.get('weightGoal');
    const dailyAdjustment = parseFloat(calculatorState.get('dailyAdjustment'));
    
    if (!weightGoal) {
      calculatorUI.showError('weightGoal', 'Please select a weight goal');
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
    return true;
  }
};
