/**
 * Step 1: Input Method Selection Module
 * 
 * @fileOverview Handles input method selection and validation
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-07
 * @updated 2024-02-07
 * @timestamp 17:35:22 UTC
 * 
 * Changelog:
 * - Updated validator import to use BCC namespace
 * - Enhanced error handling
 * - Improved input validation
 */

import calculatorState from '../core/state.js';
import ErrorManager from '../ui/error-manager.js';

const step1Module = {
    /**
     * Attach event listeners for step 1
     * @param {HTMLElement} container - Step container element
     */
    attachListeners(container) {
        if (!container) return;

        // Input mode radio buttons
        const inputModeInputs = container.querySelectorAll('input[name="inputMode"]');
        inputModeInputs.forEach(input => {
            input.addEventListener('change', this.handleInputModeChange);
        });

        // Unit selection
        const unitInputs = container.querySelectorAll('input[name="unit"]');
        unitInputs.forEach(input => {
            input.addEventListener('change', this.handleUnitChange);
        });
    },

    /**
     * Handle input mode selection change
     * @param {Event} event - Change event
     */
    handleInputModeChange(event) {
        try {
            const newMode = event.target.value;
            
            calculatorState.update({
                inputMode: newMode,
                // Reset composition fields when mode changes
                leanMass: null,
                fatMass: null,
                totalWeight: null,
                bodyFatPct: null
            });
            
        } catch (error) {
            ErrorManager.displayError('Failed to update input mode');
            console.error('Input mode change error:', error);
        }
    },

    /**
     * Handle measurement unit change
     * @param {Event} event - Change event
     */
    handleUnitChange(event) {
        try {
            const newUnit = event.target.value;
            const currentState = calculatorState.getState();
            
            if (!window.BCC.Validator.RULES.WEIGHT.validate(currentState.totalWeight, newUnit)) {
                throw new Error('Invalid unit selection');
            }

            calculatorState.set('unit', newUnit);
            
        } catch (error) {
            ErrorManager.displayError('Failed to update measurement unit');
            console.error('Unit change error:', error);
        }
    },

    /**
     * Validate step 1 inputs
     * @returns {boolean} Validation result
     */
    validate() {
        const state = calculatorState.getState();
        return window.BCC.Validator.validateStep(1, state);
    }
};

// Attach to window for global access
if (typeof window !== 'undefined') {
    window.step1Module = step1Module;
}

export default step1Module;