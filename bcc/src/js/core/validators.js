/**
 * Enhanced Validation Utility for Body Composition Calculator
 * Provides comprehensive, robust validation across different steps
 */
class CalculatorValidators {
    // Validation constants with comprehensive rules
    static VALIDATION_RULES = {
        // Personal Information Validation
        AGE: {
            min: 20,
            max: 69,
            validate: (value) =>
                Number.isInteger(value) &&
                value >= this.VALIDATION_RULES.AGE.min &&
                value <= this.VALIDATION_RULES.AGE.max
        },
        GENDER: {
            validate: (value) => ['male', 'female'].includes(value)
        },

        // Body Composition Validation
        BODY_COMPOSITION: {
            WEIGHT: {
                validate: (value, unit) => {
                    const limits = unit === 'lbs' ? { min: 88, max: 599 } : { min: 40, max: 272 };
                    return value !== null && typeof value === 'number' && value >= limits.min && value <= limits.max;
                }
            },
            BODY_FAT_PERCENTAGE: {
                validate: (value) =>
                    value !== null && typeof value === 'number' && value >= 0 && value <= 100
            }
        },

        // Goals and Activity Validation
        GOALS: {
            WEIGHT_GOAL: {
                validate: (value) => ['lose', 'maintain', 'gain'].includes(value)
            },
            DAILY_ADJUSTMENT: {
                validate: (value, goal) => {
                    const isValid = typeof value === 'number' && value >= -1000 && value <= 1000;
                    if (!isValid) return false;

                    // Ensure adjustment logic aligns with goals
                    if (goal === 'lose' && value > 0) return false;
                    if (goal === 'gain' && value < 0) return false;
                    return true;
                }
            }
        },

        // Activity Level Validation (allowing dynamic range)
        ACTIVITY_LEVELS: {
            validate: (value) => !isNaN(value) && value >= 1.2 && value <= 1.9
        }
    };

    /**
     * Validate the entire current step
     * @param {number} step - Current wizard step
     * @param {Object} state - Current calculator state
     * @returns {Object} Validation result with details
     */
    static validateStep(step, state) {
        this.clearErrors();
        switch (step) {
            case 1: return this.validateInputMethod(state);
            case 2: return this.validatePersonalInfo(state);
            case 3: return this.validateBodyComposition(state);
            case 4: return this.validateGoalsAndActivity(state);
            default:
                return {
                    isValid: true,
                    errors: []
                };
        }
    }

    /**
     * Validate body composition step
     * @param {Object} state - Current calculator state
     * @returns {Object} Validation result
     */
    static validateBodyComposition(state) {
        const errors = [];
        const { totalWeight, bodyFatPct, unit } = state;

        // Validate weight
        if (!this.VALIDATION_RULES.BODY_COMPOSITION.WEIGHT.validate(totalWeight, unit)) {
            errors.push({
                field: 'totalWeight',
                message: `Weight must be between ${unit === 'lbs' ? '88-599 lbs' : '40-272 kg'}.`
            });
        }

        // Validate body fat percentage
        if (!this.VALIDATION_RULES.BODY_COMPOSITION.BODY_FAT_PERCENTAGE.validate(bodyFatPct)) {
            errors.push({
                field: 'bodyFatPct',
                message: 'Body fat percentage must be between 0 and 100.'
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export default CalculatorValidators;
