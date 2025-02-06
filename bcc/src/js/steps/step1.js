/**
 * Step 1 Module: Input Method Selection
 * Handles input mode and unit selection for body composition calculator
 */
const step1Module = {
    /**
     * Attach event listeners for input method selection
     * @param {HTMLElement} root - Root element of the current step
     */
    attachListeners(root) {
      if (!root) return;
  
      // Input mode listeners
      const inputModeInputs = root.querySelectorAll('input[name="inputMode"]');
      inputModeInputs.forEach(input => {
        input.addEventListener('change', this.handleInputModeChange);
      });
  
      // Unit conversion listeners
      const unitInputs = root.querySelectorAll('input[name="unit"]');
      unitInputs.forEach(input => {
        input.addEventListener('change', this.handleUnitChange);
      });
    },
  
    /**
     * Handle changes in input mode (lean mass/fat mass or total weight)
     * @param {Event} e - Change event
     */
    handleInputModeChange(e) {
      const newMode = e.target.value;
      
      // Update state with new input mode
      calculatorState.update({
        inputMode: newMode,
        // Reset composition fields when mode changes
        leanMass: null,
        fatMass: null,
        totalWeight: null,
        bodyFatPct: null
      });
  
      // Refresh UI to show appropriate inputs
      calculatorUI.updateDisplay();
    },
  
    /**
     * Handle unit conversion between lbs and kg
     * @param {Event} e - Change event
     */
    handleUnitChange(e) {
      const newUnit = e.target.value;
      const oldUnit = calculatorState.get('unit');
      
      // Conversion function
      const convertValue = (value) => {
        if (value === null || value === undefined) return null;
        
        return newUnit === 'kg' 
          ? Number((value * 0.453592).toFixed(2))
          : Number((value * 2.20462).toFixed(2));
      };
  
      // Prepare state updates
      const updates = { 
        unit: newUnit 
      };
      
      // Convert values based on current input mode
      if (calculatorState.get('inputMode') === 'leanFat') {
        updates.leanMass = convertValue(calculatorState.get('leanMass'));
        updates.fatMass = convertValue(calculatorState.get('fatMass'));
      } else {
        updates.totalWeight = convertValue(calculatorState.get('totalWeight'));
        updates.bodyFatPct = calculatorState.get('bodyFatPct');
      }
  
      // Update state and refresh UI
      calculatorState.update(updates);
      calculatorUI.updateDisplay();
    }
  };
  
  // Explicitly attach to window to maintain compatibility with existing code
  window.step1 = step1Module;
  
  export default step1Module;