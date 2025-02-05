// step1.js
const step1 = {
  attachListeners() {
    // Handle mode toggles
    document.querySelectorAll('input[name="inputMode"]').forEach(input => {
      input.addEventListener('change', this.handleModeChange);
    });

    // Handle unit toggles
    document.querySelectorAll('input[name="unit"]').forEach(input => {
      input.addEventListener('change', this.handleUnitChange);
    });
  },

  handleModeChange(e) {
    calculatorState.update('inputMode', e.target.value);
    // Clear any existing composition values when mode changes
    calculatorState.update('leanMass', '');
    calculatorState.update('fatMass', '');
    calculatorState.update('totalWeight', '');
    calculatorState.update('bodyFatPct', '');
  },

  handleUnitChange(e) {
    const newUnit = e.target.value;
    const oldUnit = calculatorState.get('unit');
    const conversionFactor = newUnit === 'kg' ? 0.453592 : 2.20462;

    // Convert existing values if they exist
    if (calculatorState.get('inputMode') === 'leanFat') {
      const leanMass = parseFloat(calculatorState.get('leanMass'));
      const fatMass = parseFloat(calculatorState.get('fatMass'));
      
      if (!isNaN(leanMass)) {
        calculatorState.update('leanMass', (leanMass * conversionFactor).toFixed(1));
      }
      if (!isNaN(fatMass)) {
        calculatorState.update('fatMass', (fatMass * conversionFactor).toFixed(1));
      }
    } else {
      const totalWeight = parseFloat(calculatorState.get('totalWeight'));
      if (!isNaN(totalWeight)) {
        calculatorState.update('totalWeight', (totalWeight * conversionFactor).toFixed(1));
      }
    }

    calculatorState.update('unit', newUnit);
  }
};