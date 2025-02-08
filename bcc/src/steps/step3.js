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
import Validator from '../core/validators.js';

const step3Module = {
    attachListeners(container) {
        if (!container) return;

        const weightInput = container.querySelector('input[name="totalWeight"]');
        const bfInput = container.querySelector('input[name="bodyFatPct"]');

        if (weightInput) {
            weightInput.addEventListener('input', this.handleWeightInput);
        }
        if (bfInput) {
            bfInput.addEventListener('input', this.handleBodyFatInput);
        }
    },

    handleWeightInput(event) {
        try {
            const value = parseFloat(event.target.value);
            if (!Validator.RULES.WEIGHT.validate(value, calculatorState.get('unit'))) {
                throw new Error('Invalid weight value');
            }
            calculatorState.set('totalWeight', value);
        } catch (error) {
            ErrorManager.displayError('Invalid weight input');
            console.error('Weight input error:', error);
        }
    },

    handleBodyFatInput(event) {
        try {
            const value = parseFloat(event.target.value);
            if (!Validator.RULES.BODY_FAT.validate(value)) {
                throw new Error('Invalid body fat percentage');
            }
            calculatorState.set('bodyFatPct', value);
        } catch (error) {
            ErrorManager.displayError('Invalid body fat percentage');
            console.error('Body fat input error:', error);
        }
    },

    validate() {
        return Validator.validateStep(3, calculatorState.getState());
    }
};

export default step3Module;
