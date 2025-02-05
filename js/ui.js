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
  // ... rest of the existing code remains the same ...
};