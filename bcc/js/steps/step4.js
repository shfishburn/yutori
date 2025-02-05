// step4.js
const step4 = {
  attachListeners() {
    // Handle weight goal selection
    document.querySelectorAll('input[name="weightGoal"]').forEach(input => {
      input.addEventListener('change', this.handleWeightGoalChange);
    });

    // Handle dietary approach selection
    document.querySelectorAll('input[name="dietaryApproach"]').forEach(input => {
      input.addEventListener('change', this.handleDietaryApproachChange);
    });

    // Handle activity level selection
    const activitySelect = document.querySelector('select[name="activityLevel"]');
    if (activitySelect) {
      activitySelect.addEventListener('change', this.handleActivityLevelChange);
    }

    // Handle daily adjustment input
    const adjustmentInput = document.querySelector('input[name="dailyAdjustment"]');
    if (adjustmentInput) {
      adjustmentInput.addEventListener('input', this.handleDailyAdjustmentInput);
    }

    // Handle lean mass change input
    const leanMassChangeInput = document.querySelector('input[name="leanMassChange"]');
    if (leanMassChangeInput) {
      leanMassChangeInput.addEventListener('input', this.handleLeanMassChangeInput);
    }

    // Handle fat goal category selection
    const fatGoalSelect = document.querySelector('select[name="fatGoalCategory"]');
    if (fatGoalSelect) {
      fatGoalSelect.addEventListener('change', this.handleFatGoalCategoryChange);
    }
  },

  handleWeightGoalChange(e) {
    const newGoal = e.target.value;
    calculatorState.update('weightGoal', newGoal);
    
    // Reset daily adjustment when goal changes
    calculatorState.update('dailyAdjustment', '');
    
    // Set default adjustment based on goal
    switch(newGoal) {
      case 'lose':
        calculatorState.update('dailyAdjustment', '-500');
        break;
      case 'gain':
        calculatorState.update('dailyAdjustment', '300');
        break;
      case 'maintain':
        calculatorState.update('dailyAdjustment', '0');
        break;
    }
  },

  handleDietaryApproachChange(e) {
    calculatorState.update('dietaryApproach', e.target.value);
  },

  handleActivityLevelChange(e) {
    calculatorState.update('activityLevel', e.target.value);
  },

  handleDailyAdjustmentInput(e) {
    let value = e.target.value;
    // Allow negative sign, numbers only
    value = value.replace(/[^\d-]/g, '');
    
    // Ensure only one negative sign at start
    if (value.indexOf('-') > 0) {
      value = value.replace(/-/g, '');
    }
    
    // Constrain to reasonable range
    if (value !== '' && value !== '-') {
      const numValue = parseInt(value);
      if (numValue < -1000) value = '-1000';
      if (numValue > 1000) value = '1000';
    }
    
    calculatorState.update('dailyAdjustment', value);
  },

  handleLeanMassChangeInput(e) {
    let value = e.target.value;
    // Allow decimal points and numbers only
    value = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
    
    // Constrain to valid percentage range
    if (value !== '') {
      const numValue = parseFloat(value);
      if (numValue < 0) value = '0';
      if (numValue > 100) value = '100';
    }
    
    calculatorState.update('leanMassChange', value);
  },

  handleFatGoalCategoryChange(e) {
    calculatorState.update('fatGoalCategory', e.target.value);
  }
};