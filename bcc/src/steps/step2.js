/**
 * Step 2: Personal Information Module
 * 
 * @fileOverview Handles personal information input and validation
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-07
 * @updated 2024-02-07
 * @timestamp 17:45:44 UTC
 * 
 * Changelog:
 * - Updated validator import to use BCC namespace
 * - Enhanced input sanitization
 * - Improved error reporting
 */

import calculatorState from '../core/state.js';
import ErrorManager from '../ui/error-manager.js';
import SanitizationUtils from '../utils/sanitization.js';
import Validator from '../core/validators.js';

const step2Module = {
    /**
     * Attach event listeners for step 2
     * @param {HTMLElement} container - Step container element
     */
    attachListeners(container) {
        if (!container) return;

        // Age input listener
        const ageInput = container.querySelector('input[name="age"]');
        if (ageInput) {
            ageInput.addEventListener('input', this.handleAgeInput);
        }

        // Gender selection listener
        const genderSelect = container.querySelector('select[name="gender"]');
        if (genderSelect) {
            genderSelect.addEventListener('change', this.handleGenderChange);
        }
    },

    /**
     * Handle age input
     * @param {Event} event - Input event
     */
    handleAgeInput(event) {
        try {
            const value = event.target.value;
            
            // Sanitize and validate age input
            const sanitizedAge = SanitizationUtils.sanitizeNumber(value, {
                min: 20,
                max: 69,
                allowNull: true
            });

            if (sanitizedAge !== null && !Validator.RULES.AGE.validate(sanitizedAge)) {
                throw new Error('Invalid age value');
            }

            calculatorState.set('age', sanitizedAge);
            
        } catch (error) {
            ErrorManager.displayError('Invalid age input');
            console.error('Age input error:', error);
        }
    },

    /**
     * Handle gender selection
     * @param {Event} event - Change event
     */
    handleGenderChange(event) {
        try {
            const value = event.target.value;
            
            if (!Validator.RULES.GENDER.validate(value)) {
                throw new Error('Invalid gender selection');
            }

            calculatorState.set('gender', value);
            
        } catch (error) {
            ErrorManager.displayError('Invalid gender selection');
            console.error('Gender selection error:', error);
        }
    },

    /**
     * Validate step 2 inputs
     * @returns {boolean} Validation result
     */
    validate() {
        const state = calculatorState.getState();
        return Validator.validateStep(2, state);
    }
};

// Attach to window for global access
if (typeof window !== 'undefined') {
    window.step2Module = step2Module;
}

export default step2Module;
