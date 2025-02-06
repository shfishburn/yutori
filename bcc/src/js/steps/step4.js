/**
 * Step 4 Module: Goals and Activity
 * Handles weight goals, activity level, and calorie adjustments
 */
const step4 = {
    /**
     * Attach event listeners for goals and activity inputs
     */
    attachListeners() {
      // Weight goal radio inputs
      document.querySelectorAll('input[name="weightGoal"]').forEach(input => {
        input.addEventListener('change', this.handleWeightGoalChange);
      });
  
      // Activity level select
      const activitySelect = document.querySelector('select[name="activityLevel"]');
      if (activitySelect) {
        activitySelect.addEventListener('change', this.handleActivityLevelChange);
      }
  
      // Active energy input
      const activeEnergyInput = document.querySelector('input[name="activeEnergy"]');
      if (activeEnergyInput) {
        activeEnergyInput.addEventListener('input', this.handleActiveEnergyInput);
      }
  
      // Daily adjustment input
      const adjustmentInput = document.querySelector('input[name="dailyAdjustment"]');
      if (adjustmentInput) {
        adjustmentInput.addEventListener('input', this.handleAdjustmentInput);
      }
    },
  
    /**
     * Handle weight goal selection
     * @param {Event} e - Change event
     */
    handleWeightGoalChange(e) {
      const newGoal = e.target.value;
      calculatorState.update('weightGoal', newGoal);
      
      // Set default adjustment based on goal
      let defaultAdjustment = 0;
      switch(newGoal) {
        case 'lose': defaultAdjustment = -500; break;
        case 'gain': defaultAdjustment = 300; break;
      }
      
      calculatorState.update('dailyAdjustment', defaultAdjustment);
      calculatorUI.updateDisplay();
    },
  
    /**
     * Handle activity level selection
     * @param {Event} e - Change event
     */
    handleActivityLevelChange(e) {
      calculatorState.update('activityLevel', e.target.value);
    },
  
    /**
     * Handle active energy input
     * @param {Event} e - Input event
     */
    handleActiveEnergyInput(e) {
      // Remove non-numeric characters
      let value = e.target.value.replace(/[^\d]/g, '');
      
      // Limit to 3000
      if (value !== '' && parseInt(value) > 3000) value = '3000';
      
      calculatorState.update('activeEnergy', value);
    },
  
    /**
     * Handle daily adjustment input
     * @param {Event} e - Input event
     */
    handleAdjustmentInput(e) {
      // Remove non-numeric and multiple minus signs
      let value = e.target.value.replace(/[^\d-]/g, '');
      
      // Ensure only one minus sign
      if (value.indexOf('-') > 0) value = value.replace(/-/g, '');
      
      // Limit value range
      if (value !== '' && value !== '-') {
        const numValue = parseInt(value);
        if (numValue < -1000) value = '-1000';
        if (numValue > 1000) value = '1000';
      }
      
      calculatorState.update('dailyAdjustment', value);
    }
  };