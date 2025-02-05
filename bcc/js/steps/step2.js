// step2.js
const step2 = {
  attachListeners() {
    // Handle age input
    const ageInput = document.querySelector('input[name="age"]');
    if (ageInput) {
      ageInput.addEventListener('input', this.handleAgeInput);
    }

    // Handle gender selection
    document.querySelectorAll('input[name="gender"]').forEach(input => {
      input.addEventListener('change', this.handleGenderChange);
    });
  },

  handleAgeInput(e) {
    let value = e.target.value;
    // Remove any non-numeric characters
    value = value.replace(/[^0-9]/g, '');
    
    // Constrain to valid range
    if (value !== '') {
      const numValue = parseInt(value);
      if (numValue < 20) value = '20';
      if (numValue > 69) value = '69';
    }
    
    calculatorState.update('age', value);
  },

  handleGenderChange(e) {
    calculatorState.update('gender', e.target.value);
  }
};