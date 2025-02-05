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
    
    try {
      this.attachEventListeners();
      this.updateDisplay();
    } catch (error) {
      console.error('Initialization error:', error);
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

  // ... rest of the methods remain the same
};