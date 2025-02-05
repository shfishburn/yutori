// step3.js
const step3 = {
  attachListeners() {
    // Handle lean mass input
    const leanMassInput = document.querySelector('input[name="leanMass"]');
    if (leanMassInput) {
      leanMassInput.addEventListener('input', this.handleNumberInput.bind(this, 'leanMass'));
    }

    // Handle fat mass input
    const fatMassInput = document.querySelector('input[name="fatMass"]');
    if (fatMassInput) {
      fatMassInput.addEventListener('input', this.handleNumberInput.bind(this, 'fatMass'));
    }

    // Handle total weight input
    const weightInput = document.querySelector('input[name="totalWeight"]');
    if (weightInput) {
      weightInput.addEventListener('input', this.handleNumberInput.bind(this, 'totalWeight'));
    }

    // Handle body fat percentage input
    const bfInput = document.querySelector('input[name="bodyFatPct"]');
    if (bfInput) {
      bfInput.addEventListener('input', this.handleBFInput);
    }
  },

  handleNumberInput(field, e) {
    let value = e.target.value;
    // Allow decimal points and numbers only
    value = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
    
    // Ensure reasonable values based on field
    if (value !== '') {
      const numValue = parseFloat(value);
      if (numValue < 0) value = '0';
      if (field === 'totalWeight' && numValue > 1000) value = '1000';
      if ((field === 'leanMass' || field === 'fatMass') && numValue > 500) value = '500';
    }
    
    calculatorState.update(field, value);
  },

  handleBFInput(e) {
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
    
    calculatorState.update('bodyFatPct', value);
  }
};