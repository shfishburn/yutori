/**
 * Step 3: Body Composition Input Module
 * 
 * @fileOverview Handles body composition measurements input and validation
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-07
 * @updated 2024-02-07
 * @timestamp 17:55:33 UTC
 * 
 * Changelog:
 * - Updated validator import to use BCC namespace
 * - Enhanced measurement validation
 * - Improved unit conversion handling
 */

import calculatorState from '../core/state.js';
import ErrorManager from '../ui/error-manager.js';
import SanitizationUtils from '../utils/sanitization.js';
import ConversionUtils from '../utils/conversion.js';

const step3Module = {
    /**
     * Attach event listeners for step 3
     * @param {HTMLElement} container - Step container element
     */
    attachListeners(container) {
        if (!container) return;

        const state = calculatorState.getState();
        
        if (state.inputMode === 'totalWeight') {
            this.attachTotalWeightListeners(container);
        } else {
            this.attachLeanFatListeners(container);
        }
    },

    /**
     * Attach listeners for total weight input mode
     * @param {HTMLElement} container - Container element
     */
    attachTotalWeightListeners(container) {
        const weightInput = container.querySelector('input[name="totalWeight"]');
        const bfInput = container.querySelector('input[name="bodyFatPct"]');

        if (weightInput) {
            weightInput.addEventListener('input', this.handleWeightInput.bind(this));
        }
        if (bfInput) {
            bfInput.addEventListener('input', this.handleBodyFatInput.bind(this));
        }
    },

    /**
     * Attach listeners for lean/fat mass input mode
     * @param {HTMLElement} container - Container element
     */
    attachLeanFatListeners(container) {
        const leanInput = container.querySelector('input[name="leanMass"]');
        const fatInput = container.querySelector('input[name="fatMass"]');

        if (leanInput) {
            leanInput.addEventListener('input', this.handleLeanMassInput.bind(this));
        }
        if (fatInput) {
            fatInput.addEventListener('input', this.handleFatMassInput.bind(this));
        }
    },

    /**
     * Handle total weight input
     * @param {Event} event - Input event
     */
    handleWeightInput(event) {
        try {
            const value = event.target.value;
            const state = calculatorState.getState();
            
            const sanitizedWeight = SanitizationUtils.sanitizeNumber(value, {
                min: state.unit === 'kg' ? 40 : 88,
                max: state.unit === 'kg' ? 272 : 599,
                allowNull: true
            });

            if (!window.BCC.Validator.RULES.WEIGHT.validate(sanitizedWeight, state.unit)) {
                throw new Error('Invalid weight value');
            }

            calculatorState.set('totalWeight', sanitizedWeight);
            
        } catch (error) {
            ErrorManager.displayError('Invalid weight input');
            console.error('Weight input error:', error);
        }
    },

    /**
     * Handle body fat percentage input
     * @param {Event} event - Input event
     */
    handleBodyFatInput(event) {
        try {
            const value = event.target.value;
            
            const sanitizedBF = SanitizationUtils.sanitizeNumber(value, {
                min: 3,
                max: 60,
                allowNull: true
            });

            if (sanitizedBF !== null && !window.BCC.Validator.RULES.BODY_FAT.validate(sanitizedBF)) {
                throw new Error('Invalid body fat percentage');
            }

            calculatorState.set('bodyFatPct', sanitizedBF);
            
        } catch (error) {
            ErrorManager.displayError('Invalid body fat percentage');
            console.error('Body fat input error:', error);
        }
    },

    /**
     * Handle lean mass input
     * @param {Event} event - Input event
     */
    handleLeanMassInput(event) {
        try {
            const value = event.target.value;
            const state = calculatorState.getState();
            
            const sanitizedLeanMass = SanitizationUtils.sanitizeNumber(value, {
                min: state.unit === 'kg' ? 20 : 44,
                max: state.unit === 'kg' ? 136 : 300,
                allowNull: true
            });

            calculatorState.set('leanMass', sanitizedLeanMass);
            
        } catch (error) {
            ErrorManager.displayError('Invalid lean mass input');
            console.error('Lean mass input error:', error);
        }
    },

    /**
     * Handle fat mass input
     * @param {Event} event - Input event
     */
    handleFatMassInput(event) {
        try {
            const value = event.target.value;
            const state = calculatorState.getState();
            
            const sanitizedFatMass = SanitizationUtils.sanitizeNumber(value, {
                min: 0,
                max: state.unit === 'kg' ? 136 : 300,
                allowNull: true
            });

            calculatorState.set('fatMass', sanitizedFatMass);
            
        } catch (error) {
            ErrorManager.displayError('Invalid fat mass input');
            console.error('Fat mass input error:', error);
        }
    },

    /**
     * Validate step 3 inputs
     * @returns {boolean} Validation result
     */
    validate() {
        const state = calculatorState.getState();
        return window.BCC.Validator.validateStep(3, state);
    }
};

// Attach to window for global access
if (typeof window !== 'undefined') {
    window.step3Module = step3Module;
}

export default step3Module;