const step2 = {
  attachListeners() {
    const ageInput = document.querySelector('input[name="age"]');
    if (ageInput) {
      ageInput.addEventListener('input', this.handleAgeInput);
    }
    document.querySelectorAll('input[name="gender"]').forEach(input => {
      input.addEventListener('change', this.handleGenderChange);
    });
  },

  handleAgeInput(e) {
    let value = e.target.value.replace(/[^0-9]/g, '');
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