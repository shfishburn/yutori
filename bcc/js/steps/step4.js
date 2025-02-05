const step4 = {
  attachListeners() {
    document.querySelectorAll('input[name="weightGoal"]').forEach(input => {
      input.addEventListener('change', this.handleWeightGoalChange);
    });

    const activitySelect = document.querySelector('select[name="activityLevel"]');
    if (activitySelect) {
      activitySelect.addEventListener('change', this.handleActivityLevelChange);
    }

    const activeEnergyInput = document.querySelector('input[name="activeEnergy"]');
    if (activeEnergyInput) {
      activeEnergyInput.addEventListener('input', this.handleActiveEnergyInput);
    }

    const adjustmentInput = document.querySelector('input[name="dailyAdjustment"]');
    if (adjustmentInput) {
      adjustmentInput.addEventListener('input', this.handleAdjustmentInput);
    }
  },

  handleWeightGoalChange(e) {
    const newGoal = e.target.value;
    calculatorState.update('weightGoal', newGoal);
    
    let defaultAdjustment = 0;
    switch(newGoal) {
      case 'lose': defaultAdjustment = -500; break;
      case 'gain': defaultAdjustment = 300; break;
    }
    calculatorState.update('dailyAdjustment', defaultAdjustment);
    calculatorUI.updateDisplay();
  },

  handleActivityLevelChange(e) {
    calculatorState.update('activityLevel', e.target.value);
  },

  handleActiveEnergyInput(e) {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value !== '' && parseInt(value) > 3000) value = '3000';
    calculatorState.update('activeEnergy', value);
  },

  handleAdjustmentInput(e) {
    let value = e.target.value.replace(/[^\d-]/g, '');
    if (value.indexOf('-') > 0) value = value.replace(/-/g, '');
    if (value !== '' && value !== '-') {
      const numValue = parseInt(value);
      if (numValue < -1000) value = '-1000';
      if (numValue > 1000) value = '1000';
    }
    calculatorState.update('dailyAdjustment', value);
  }
};