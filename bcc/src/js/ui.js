/**
 * Calculator UI Management Module
 * Handles user interface interactions and state rendering
 */
const calculatorUI = {
    // Root element for the calculator
    root: null,

    // Initialization flag
    initialized: false,

    /**
     * Initialize the calculator UI
     */
    init() {
        console.log('Initializing calculator UI');

        // Find root element
        this.root = document.getElementById('calculatorRoot');
        if (!this.root) {
            console.error('Calculator root element not found');
            return;
        }

        // Prevent multiple initializations
        if (!this.initialized) {
            this.attachEventListeners();
            this.initialized = true;
        }

        // Initial display render
        this.updateDisplay();
    },

    /**
     * Update the display based on current state
     */
    updateDisplay() {
        try {
            // Get current step from state
            const currentStep = calculatorState.get('currentStep');
            console.log('Rendering step:', currentStep);

            // Get full state
            const state = calculatorState.getState();

            // Find the template for the current step
            const templateFn = calculatorTemplates[`step${currentStep}`];
            if (!templateFn) {
                console.error('Template not found for step:', currentStep);
                return;
            }

            // Use DOM diffing to avoid unnecessary updates
            const newHTML = templateFn(state);
            if (this.root.innerHTML !== newHTML) {
                this.root.innerHTML = newHTML;

                // Attach step-specific listeners after UI update
                const stepModule = window[`step${currentStep}`];
                if (stepModule?.attachListeners) {
                    stepModule.attachListeners(this.root);
                }
            }
        } catch (error) {
            console.error('Error updating display:', error);
            this.root.innerHTML = `
                <div class="error-message">
                    <p>Error: ${error.message}</p>
                </div>
            `;
        }
    },

    /**
     * Attach global event listeners using event delegation
     */
    attachEventListeners() {
        if (!this.root) return;

        // Event delegation for clicks
        document.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (button) {
                const action = button.dataset.action;
                this.handleAction(action);
            }
        });

        // Event delegation for form inputs
        document.addEventListener('input', (e) => {
            const input = e.target;
            if (input.matches('input, select')) {
                const { name, value, type, checked } = input;

                switch (type) {
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

    /**
     * Handle user actions
     * @param {string} action - Action to perform
     */
    handleAction(action) {
        switch (action) {
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
                        const results = calculatorCalculations.calculate();
                        console.log('Calculation results:', results);

                        if (results) {
                            calculatorState.set('results', results);
                            calculatorState.set('currentStep', 5);
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

    /**
     * Validate the current step
     * @returns {boolean} Validation result
     */
    validateCurrentStep() {
        return calculatorValidators.validateStep(calculatorState.get('currentStep'));
    },

    /**
     * Show error message
     * @param {string} fieldName - Name of the field with error
     * @param {string} message - Error message
     */
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

    /**
     * Clear all existing error messages
     */
    clearErrors() {
        this.root.querySelectorAll('.error-message, .invalid-input').forEach(el => {
            el.classList.remove('invalid-input');
            if (el.classList.contains('error-message')) {
                el.remove();
            }
        });
    }
};

// Attach `calculatorUI` to `window` for global access
window.calculatorUI = calculatorUI;

export default calculatorUI;