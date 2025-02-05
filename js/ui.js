// ui.js
const calculatorUI = {
  root: null,

  init() {
    this.root = document.getElementById('calculatorRoot');
    this.attachEventListeners();
    this.updateDisplay();
  },

  updateDisplay() {
    const currentStep = calculatorState.get('currentStep');
    this.root.innerHTML = calculatorTemplates[`step${currentStep}`]();
    this.attachStepListeners(currentStep);
  },

  attachEventListeners() {
    this.root.addEventListener('click', (e) => {
      if (e.target.matches('[data-action]')) {
        const action = e.target.dataset.action;
        this.handleAction(action);
      }
    });

    this.root.addEventListener('change', (e) => {
      if (e.target.matches('input, select')) {
        calculatorState.update(e.target.name, e.target.value);
      }
    });
  },

  attachStepListeners(step) {
    switch(step) {
      case 1:
        step1.attachListeners();
        break;
      case 2:
        step2.attachListeners();
        break;
      // ... etc
    }
  },

  handleAction(action) {
    switch(action) {
      case 'next':
        if (calculatorValidators.validateStep(calculatorState.get('currentStep'))) {
          calculatorState.update('currentStep', calculatorState.get('currentStep') + 1);
        }
        break;
      case 'prev':
        calculatorState.update('currentStep', calculatorState.get('currentStep') - 1);
        break;
      case 'calculate':
        if (calculatorValidators.validateStep(calculatorState.get('currentStep'))) {
          calculatorCalculations.calculate();
          calculatorState.update('currentStep', 5);
        }
        break;
      case 'reset':
        calculatorState.reset();
        break;
    }
  },

  showError(fieldName, message) {
    const input = this.root.querySelector(`[name="${fieldName}"]`);
    if (input) {
      input.classList.add('invalid-input');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }
  },

  clearErrors() {
    this.root.querySelectorAll('.invalid-input').forEach(el => {
      el.classList.remove('invalid-input');
    });
    this.root.querySelectorAll('.error-message').forEach(el => {
      el.remove();
    });
  }
};