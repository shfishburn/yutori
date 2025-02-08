import calculatorState from './core/state.js';
import calculatorTemplates from './templates.js';

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

        if (!calculatorState || typeof calculatorState.getState !== 'function') {
            console.error('Error: calculatorState is not properly loaded.');
            return;
        }

        if (!this.initialized) {
            this.attachEventListeners();
            this.initialized = true;
        }

        this.updateDisplay();
    },

    attachEventListeners() {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (button) {
                this.handleAction(button.dataset.action);
            }
        });
    },

    handleAction(action) {
        switch (action) {
            case 'next':
                calculatorState.set('currentStep', calculatorState.get('currentStep') + 1);
                this.updateDisplay();
                break;
            case 'back':
                calculatorState.set('currentStep', calculatorState.get('currentStep') - 1);
                this.updateDisplay();
                break;
            case 'reset':
                calculatorState.reset();
                this.updateDisplay();
                break;
        }
    },

    updateDisplay() {
        const state = calculatorState.getState();
        const currentStep = state.currentStep;

        if (!calculatorTemplates[`step${currentStep}`]) {
            console.error(`Template function for step ${currentStep} is missing.`);
            return;
        }

        this.root.innerHTML = calculatorTemplates[`step${currentStep}`](state);
    }
};

window.calculatorUI = calculatorUI;
export default calculatorUI;
