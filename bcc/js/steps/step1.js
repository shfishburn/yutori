const step1 = {
  attachListeners(root) {
    if (!root) return;
    
    root.querySelectorAll('input[name="inputMode"]').forEach(input => {
      input.addEventListener('change', this.handleModeChange);
    });
    
    root.querySelectorAll('input[name="unit"]').forEach(input => {
      input.addEventListener('change', this.handleUnitChange);
    });
  },

  handleModeChange(e) {
    calculatorState.update('inputMode', e.target.value);
    calculatorState.update({
      leanMass: '',
      fatMass: '',
      totalWeight: '',
      bodyFatPct: ''
    });
    calculatorUI.updateDisplay();
  },

  handleUnitChange(e) {
    const newUnit = e.target.value;
    const oldUnit = calculatorState.get('unit');
    const conversionFactor = newUnit === 'kg' ? 0.453592 : 2.20462;
    
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
    calculatorUI.updateDisplay();
  }
};
