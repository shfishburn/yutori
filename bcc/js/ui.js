// ui.js
const calculatorUI = {
  root: null,
  
  init() {
    this.root = document.getElementById('calculatorRoot');
    if (!this.root) {
      console.error('Calculator root element not found');
      return;
    }
    this.attachEventListeners();
    this.updateDisplay();
  },

  updateDisplay() {
    try {
      const currentStep = calculatorState.get('currentStep');
      this.root.innerHTML = calculatorTemplates[`step${currentStep}`](calculatorState.getState());
      this.attachStepListeners(currentStep);
    } catch (error) {
      console.error('Error updating display:', error);
      this.root.innerHTML = `<div class="error-message"><p>Error: ${error.message}</p></div>`;
    }
  },

  attachEventListeners() {
    if (!this.root) return;

    this.root.addEventListener('click', (e) => {
      if (e.target.matches('[data-action]')) {
        const action = e.target.dataset.action;
        this.handleAction(action);
      }
    });

    this.root.addEventListener('change', (e) => {
      if (e.target.matches('input, select')) {
        const { name, value, type, checked } = e.target;
        
        switch(type) {
          case 'checkbox':
            calculatorState.update(name, checked);
            if (name === 'knownMetrics') {
              this.updateDisplay();
            }
            break;
          case 'radio':
            if (checked) {
              calculatorState.update(name, value);
              if (['inputMode', 'unit'].includes(name)) {
                this.updateDisplay();
              }
            }
            break;
          case 'number':
            calculatorState.update(name, parseFloat(value));
            break;
          default:
            calculatorState.update(name, value);
        }
      }
    });
  },

  handleAction(action) {
    switch(action) {
      case 'next':
        if (this.validateCurrentStep()) {
          calculatorState.update('currentStep', calculatorState.get('currentStep') + 1);
          this.updateDisplay();
        }
        break;
      case 'prev':
        calculatorState.update('currentStep', calculatorState.get('currentStep') - 1);
        this.updateDisplay();
        break;
      case 'calculate':
        if (this.validateCurrentStep()) {
          try {
            this.root.classList.add('calculating');
            const results = calculatorCalculations.calculate();
            if (results) {
              calculatorState.update({
                currentStep: 5,
                results: results
              });
              this.updateDisplay();
            } else {
              this.showError('general', 'Calculation failed. Please check inputs.');
            }
          } catch (error) {
            this.showError('general', `Error: ${error.message}`);
          } finally {
            this.root.classList.remove('calculating');
          }
        }
        break;
      case 'reset':
        calculatorState.reset();
        this.updateDisplay();
        break;
    }
  },

  validateCurrentStep() {
    return calculatorValidators.validateStep(calculatorState.get('currentStep'));
  },

  showError(fieldName, message) {
    this.clearErrors();
    const errorDiv = document.createElement('div');
    errorDiv.className = `error-message ${fieldName === 'general' ? 'general-error' : ''}`;
    errorDiv.textContent = message;
    
    if (fieldName === 'general') {
      this.root.insertBefore(errorDiv, this.root.firstChild);
    } else {
      const input = this.root.querySelector(`[name="${fieldName}"]`);
      if (input) {
        input.classList.add('invalid-input');
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
      }
    }
  },

  clearErrors() {
    this.root.querySelectorAll('.error-message, .invalid-input').forEach(el => {
      el.classList.remove('invalid-input');
      if (el.classList.contains('error-message')) {
        el.remove();
      }
    });
  }
};