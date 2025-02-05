const calculatorUI = {
  root: null,
  initialized: false,

  init() {
    console.log('Initializing calculator UI');
    this.root = document.getElementById('calculatorRoot');
    if (!this.root) {
      console.error('Calculator root element not found');
      return;
    }
    if (!this.initialized) {
      this.attachEventListeners();
      this.initialized = true;
    }
    this.updateDisplay();
  },

  // In calculatorUI
  updateDisplay() {
    try {
      const currentStep = calculatorState.get('currentStep');
      console.log('Rendering step:', currentStep);
      const state = calculatorState.getState();
      console.log('State for template:', state); // Debug log

      // Get the template function for the current step
      const templateFn = calculatorTemplates[`step${currentStep}`];
      if (!templateFn) {
        console.error('Template not found for step:', currentStep);
        return;
      }

      // Pass the full state to the template
      this.root.innerHTML = templateFn(state);

      // Attach any step-specific listeners
      const stepModule = window[`step${currentStep}`];
      if (stepModule?.attachListeners) {
        stepModule.attachListeners(this.root);
      }
    } catch (error) {
      console.error('Error updating display:', error);
      this.root.innerHTML = `<div class="error-message"><p>Error: ${error.message}</p></div>`;
    }
  },

  attachEventListeners() {
    if (!this.root) return;

    // Use event delegation for buttons
    this.root.addEventListener('click', (e) => {
      const button = e.target.closest('[data-action]');
      if (button) {
        const action = button.dataset.action;
        this.handleAction(action);
      }
    });

    // Use event delegation for form inputs
    this.root.addEventListener('change', (e) => {
      const input = e.target;
      if (input.matches('input, select')) {
        const { name, value, type, checked } = input;

        switch(type) {
          case 'checkbox':
            calculatorState.set(name, checked);
            if (name === 'knownMetrics') {
              this.updateDisplay();
            }
            break;
          case 'radio':
            if (checked) {
              calculatorState.set(name, value);
              if (['inputMode', 'unit'].includes(name)) {
                this.updateDisplay();
              }
            }
            break;
          case 'number':
            calculatorState.set(name, parseFloat(value));
            break;
          default:
            calculatorState.set(name, value);
        }
      }
    });
  },

  handleAction(action) {
    switch(action) {
      case 'next':
        if (this.validateCurrentStep()) {
          calculatorState.set('currentStep', calculatorState.get('currentStep') + 1);
          this.updateDisplay();
        }
        break;
      case 'prev':
        calculatorState.set('currentStep', calculatorState.get('currentStep') - 1);
        this.updateDisplay();
        break;
      case 'calculate':
        if (this.validateCurrentStep()) {
          try {
            this.root.classList.add('calculating');
            console.log('Current state before calculation:', calculatorState.getState());  // Debug log
            const results = calculatorCalculations.calculate();
            console.log('Raw calculation results:', results);  // Debug log

            if (results) {
              calculatorState.update({
                currentStep: 5,
                results: results
              });
              console.log('Updated state after calculation:', calculatorState.getState());  // Debug log
              this.updateDisplay();
            } else {
              this.showError('general', 'Calculation failed. Please check inputs.');
            }
          } catch (error) {
            console.error('Calculation error:', error);
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

// Explicitly attach to window
window.calculatorUI = calculatorUI;