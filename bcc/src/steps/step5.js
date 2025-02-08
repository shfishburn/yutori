/**
 * Step 5: Results Display Module
 * 
 * @fileOverview Handles results display and sharing functionality with enhanced validation
 * @author Yutori Labs
 * @version 1.1.0
 * @created 2024-02-07
 * @updated 2024-02-07
 * @timestamp 15:30:00 UTC
 */

import calculatorState from '../core/state.js';
import ErrorManager from '../ui/error-manager.js';
import BodyCompCalculations from '../core/calculations.js';
import Validator from '../core/validators.js';

const step5Module = {
    attachListeners(container) {
        if (!container) return;

        const resetButton = container.querySelector('[data-action="reset"]');
        if (resetButton) {
            resetButton.addEventListener('click', this.handleReset);
        }

        this.generateResults();
    },

    generateResults() {
        try {
            const state = calculatorState.getState();
            if (!Validator.validateStep(5, state).isValid) {
                throw new Error('Missing required values');
            }

            const composition = BodyCompCalculations.calculateComposition(
                state.totalWeight,
                state.bodyFatPct,
                state.unit
            );

            const energy = BodyCompCalculations.calculateEnergy(
                composition.leanMassKg,
                state.activityLevel
            );

            calculatorState.update({
                results: {
                    composition,
                    energy
                }
            });

            this.updateDisplay();
        } catch (error) {
            ErrorManager.displayError('Failed to generate results');
            console.error('Results generation error:', error);
        }
    },

    updateDisplay() {
        const state = calculatorState.getState();
        const results = state.results;
        if (!results) return;

        document.getElementById('tdeeResult').textContent = `${results.energy.TDEE} kcal`;
        document.getElementById('bmrResult').textContent = `${results.energy.BMR} kcal`;
    },

    handleReset() {
        if (confirm('Are you sure you want to reset?')) {
            calculatorState.reset();
        }
    },

    validate() {
        return true;
    }
};

export default step5Module;
