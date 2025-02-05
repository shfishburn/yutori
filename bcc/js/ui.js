// ui.js
const calculatorUI = {
  root: null,
  
  init() {
    console.log('UI Init called');
    console.log('Global objects:', {
      calculatorState: typeof calculatorState,
      calculatorTemplates: typeof calculatorTemplates,
      calculatorValidators: typeof calculatorValidators
    });

    this.root = document.getElementById('calculatorRoot');
    console.log('Root element:', this.root);
    
    if (!this.root) {
      console.error('Calculator root element not found');
      return;
    }
    
    console.log('Current Step:', calculatorState.get('currentStep'));
    
    this.attachEventListeners();
    this.updateDisplay();
  },

  updateDisplay() {
    try {
      const currentStep = calculatorState.get('currentStep');
      console.log('Rendering step:', currentStep);
      this.root.innerHTML = calculatorTemplates[`step${currentStep}`]();
      this.attachStepListeners(currentStep);
    } catch (error) {
      console.error('Error updating display:', error);
      this.root.innerHTML = `
        <div class="error-message">
          <p>An error occurred while rendering the calculator.</p>
          <p>${error.message}</p>
        </div>
      `;
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
        const { name, value, type } = e.target;
        
        // Handle different input types
        switch(type) {
          case 'radio':
            if (e.target.checked) {
              calculatorState.update(name, value);
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

  attachStepListeners(step) {
    // Dynamically attach step-specific listeners if needed
    const stepModule = window[`step${step}`];
    if (stepModule && typeof stepModule.attachListeners === 'function') {
      stepModule.attachListeners(this.root);
    }
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
            const results = calculatorCalculations.calculate();
            console.log('Calculation results:', results);
            
            if (results) {
              calculatorState.update({
                currentStep: 5,
                results: results
              });
              this.updateDisplay();
            } else {
              console.error('Calculation returned null');
              this.showError('general', 'Unable to complete calculation. Please check your inputs.');
            }
          } catch (error) {
            console.error('Calculation error:', error);
            this.showError('general', `Calculation failed: ${error.message}`);
          }
        }
        break;
      case 'reset':
        calculatorState.reset();
        this.updateDisplay();
        break;
      default:
        console.warn(`Unhandled action: ${action}`);
    }
  },

  validateCurrentStep() {
    const currentStep = calculatorState.get('currentStep');
    try {
      return calculatorValidators.validateStep(currentStep);
    } catch (error) {
      console.error('Validation error:', error);
      this.showError('general', error.message);
      return false;
    }
  },

  showError(fieldName, message) {
    // Remove any existing errors
    this.clearErrors();

    // If it's a general error, show at the top
    if (fieldName === 'general') {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message general-error';
      errorDiv.textContent = message;
      
      if (this.root.firstChild) {
        this.root.insertBefore(errorDiv, this.root.firstChild);
      } else {
        this.root.appendChild(errorDiv);
      }
      return;
    }

    // Field-specific error
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
    // Remove general errors
    const generalErrors = this.root.querySelectorAll('.general-error');
    generalErrors.forEach(el => el.remove());

    // Remove input-specific errors
    this.root.querySelectorAll('.invalid-input').forEach(el => {
      el.classList.remove('invalid-input');
    });
    this.root.querySelectorAll('.error-message').forEach(el => {
      el.remove();
    });
  }
};