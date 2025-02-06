/**
 * Enhanced State Management for Body Composition Calculator
 * Provides robust, immutable state handling with comprehensive validation
 */
class CalculatorState {
    static INITIAL_STATE = {
        currentStep: 1,
        inputMode: 'leanFat',
        unit: 'lbs',
        age: null,
        gender: null,
        totalWeight: null,
        bodyFatPct: null,
        weightGoal: 'maintain',
        activityLevel: 1.375,
        dailyAdjustment: 0,
        results: null
    };

    constructor() {
        this._state = JSON.parse(JSON.stringify(CalculatorState.INITIAL_STATE));
    }

    /**
     * Validate a specific key or entire state
     * @param {string} key - State key to validate
     * @param {*} value - Value to validate
     * @returns {boolean} Validation result
     */
    validate(key, value) {
        const rule = CalculatorValidators.VALIDATION_RULES[key.toUpperCase()];
        return rule ? rule.validate(value) : true;
    }

    /**
     * Get a specific state value
     * @param {string} key - State key to retrieve
     * @returns {*} State value
     */
    get(key) {
        return this._state[key];
    }

    /**
     * Set a single state value with validation
     * @param {string} key - State key to update
     * @param {*} value - New value
     * @throws {Error} If value fails validation
     */
    set(key, value) {
        if (!this.validate(key, value)) {
            throw new Error(`Invalid value for ${key}: ${value}`);
        }

        this._state = {
            ...this._state,
            [key]: value
        };
    }

    /**
     * Convert units between lbs and kg
     * @param {number} value - Value to convert
     * @param {string} fromUnit - Current unit
     * @param {string} toUnit - Target unit
     * @returns {number} Converted value
     */
    convertUnits(value, fromUnit, toUnit) {
        if (fromUnit === toUnit || value === null) return value;
        return fromUnit === 'lbs'
            ? Number((value * 0.453592).toFixed(2))
            : Number((value * 2.20462).toFixed(2));
    }
}

// Create a singleton instance
const calculatorState = new CalculatorState();

export default calculatorState;
