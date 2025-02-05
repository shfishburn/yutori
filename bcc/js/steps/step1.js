// step1.js
const step1 = {
  attachListeners(root) {
    // Ensure root is passed and use it for querying
    if (!root) {
      console.error('No root element provided for step 1 listeners');
      return;
    }

    // Handle mode toggles
    root.querySelectorAll('input[name="inputMode"]').forEach(input => {
      input.addEventListener('change', this.handleModeChange);
    });
    
    // Handle unit toggles
    root.querySelectorAll('input[name="unit"]').forEach(input => {
      input.addEventListener('change', this.handleUnitChange);
    });
  },
  handleModeChange(e) {
    calculatorState.update('inputMode', e.target.value);
    // Clear any existing composition values when mode changes
    calculatorState.update({
      leanMass: '',
      fatMass: '',
      totalWeight: '',
      bodyFatPct: ''
    });
    
    // Trigger display update to show/hide appropriate inputs
    calculatorUI.updateDisplay();
  },
  handleUnitChange(e) {
    const newUnit = e.target.value;
    const oldUnit = calculatorState.get('unit');
    const conversionFactor = newUnit === 'kg' ? 0.453592 : 2.20462;
    
    // Convert existing values if they exist
    if (calculatorState.get('inputMode') === 'leanFat') {
      const leanMass = parseFloat(calculatorState.get('leanMass'));
      const fatMass = parseFloat(calculatorState.get('fatMass'));
      
      calculatorState.update({
        leanMass: leanMass ? (leanMass * conversionFactor).toFixed(1) : '',
        fatMass: fatMass ? (fatMass * conversionFactor).toFixed(1) : '',
        unit: newUnit
      });
    } else {
      const totalWeight = parseFloat(calculatorState.get('totalWeight'));
      
      calculatorState.update({
        totalWeight: totalWeight ? (totalWeight * conversionFactor).toFixed(1) : '',
        unit: newUnit
      });
    }
    
    // Trigger display update to reflect new unit
    calculatorUI.updateDisplay();
  }
};