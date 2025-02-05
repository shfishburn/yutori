const step3 = {
  attachListeners() {
    const knownMetricsCheck = document.querySelector('input[name="knownMetrics"]');
    if (knownMetricsCheck) {
      knownMetricsCheck.addEventListener('change', this.handleKnownMetricsChange);
    }

    if (calculatorState.get('inputMode') === 'leanFat') {
      this.attachLeanFatListeners();
    } else {
      this.attachTotalBFListeners();
    }

    const insulinResistanceCheck = document.querySelector('input[name="insulinResistance"]');
    if (insulinResistanceCheck) {
      insulinResistanceCheck.addEventListener('change', this.handleInsRChange);
    }
  },

  handleKnownMetricsChange(e) {
    calculatorState.update('knownMetrics', e.target.checked);
    calculatorUI.updateDisplay();
  },

  attachLeanFatListeners() {
    ['leanMass', 'fatMass'].forEach(field => {
      const input = document.querySelector(`input[name="${field}"]`);
      if (input) {
        input.addEventListener('input', (e) => {
          let value = e.target.value.replace(/[^\d.]/g, '');
          const parts = value.split('.');
          if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
          if (value !== '' && parseFloat(value) > 500) value = '500';
          calculatorState.update(field, value);
        });
      }
    });
  },

  attachTotalBFListeners() {
    const weightInput = document.querySelector('input[name="totalWeight"]');
    if (weightInput) {
      weightInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^\d.]/g, '');
        if (value !== '' && parseFloat(value) > 1000) value = '1000';
        calculatorState.update('totalWeight', value);
      });
    }

    const bfInput = document.querySelector('input[name="bodyFatPct"]');
    if (bfInput) {
      bfInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^\d.]/g, '');
        if (value !== '' && parseFloat(value) > 100) value = '100';
        calculatorState.update('bodyFatPct', value);
      });
    }
  },

  handleInsRChange(e) {
    calculatorState.update('insulinResistance', e.target.checked);
  }
};