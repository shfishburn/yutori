/**
 * Centralized Validation Utility for Body Composition Calculator
 * 
 * @fileOverview Provides robust, comprehensive validation across different steps and inputs
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-06
 * @updated 2024-02-07
 * @timestamp 17:15:22 UTC
 * 
 * Changelog:
 * - Fixed duplicate class declaration issue
 * - Implemented proper module namespacing
 * - Enhanced validation rules
 * - Improved error reporting
 */

class Validator {
  // Validation Constants
  static RULES = {
      AGE: {
          min: 20,
          max: 69,
          validate: (value) => 
              Number.isInteger(value) && 
              value >= 20 && 
              value <= 69
      },
      GENDER: {
          validate: (value) => ['male', 'female'].includes(value)
      },
      WEIGHT: {
          validate: (value, unit) => {
              const limits = unit === 'lbs' 
                  ? { min: 88, max: 599 }  // pounds
                  : { min: 40, max: 272 }; // kilograms
              
              return value !== null && 
                     typeof value === 'number' && 
                     value >= limits.min && 
                     value <= limits.max;
          }
      },
      BODY_FAT: {
          validate: (value) => 
              value !== null && 
              typeof value === 'number' && 
              value >= 3 && 
              value <= 60
      },
      ACTIVITY_LEVEL: {
          validate: (value) => [1.2, 1.375, 1.55, 1.725, 1.9].includes(value)
      }
  };

  /**
   * Validate entire step's inputs
   * @param {number} step - Current wizard step
   * @param {Object} state - Current calculator state
   * @returns {Object} Validation result
   */
  static validateStep(step, state) {
      if (!state) {
          return { isValid: false, errors: ['Invalid state object'] };
      }

      const validationStrategies = {
          1: this.validateInputMethod.bind(this),
          2: this.validatePersonalInfo.bind(this),
          3: this.validateBodyComposition.bind(this),
          4: this.validateActivityAndGoals.bind(this),
          5: () => ({ isValid: true, errors: [] })
      };

      const strategy = validationStrategies[step];
      if (!strategy) {
          return { isValid: false, errors: [`Invalid step: ${step}`] };
      }

      try {
          return strategy(state);
      } catch (error) {
          console.error(`Validation error in step ${step}:`, error);
          return { 
              isValid: false, 
              errors: ['Internal validation error'],
              details: error.message
          };
      }
  }

  /**
   * Validate input method selection
   * @param {Object} state - Current state
   * @returns {Object} Validation result
   */
  static validateInputMethod(state) {
      const isValid = ['leanFat', 'totalWeight'].includes(state.inputMode);
      return {
          isValid,
          errors: isValid ? [] : ['Invalid input method']
      };
  }

  /**
   * Validate personal information
   * @param {Object} state - Current state
   * @returns {Object} Validation result
   */
  static validatePersonalInfo(state) {
      const errors = [];

      if (!this.RULES.AGE.validate(state.age)) {
          errors.push(`Age must be between ${this.RULES.AGE.min} and ${this.RULES.AGE.max}`);
      }

      if (!this.RULES.GENDER.validate(state.gender)) {
          errors.push('Invalid gender selection');
      }

      return {
          isValid: errors.length === 0,
          errors
      };
  }

  /**
   * Validate body composition inputs
   * @param {Object} state - Current state
   * @returns {Object} Validation result
   */
  static validateBodyComposition(state) {
      const errors = [];

      if (state.inputMode === 'totalWeight') {
          if (!this.RULES.WEIGHT.validate(state.totalWeight, state.unit)) {
              errors.push(`Invalid total weight for ${state.unit}`);
          }

          if (!this.RULES.BODY_FAT.validate(state.bodyFatPct)) {
              errors.push('Body fat percentage must be between 3% and 60%');
          }
      } else {
          if (!state.leanMass || !state.fatMass) {
              errors.push('Both lean mass and fat mass are required');
          }
      }

      return {
          isValid: errors.length === 0,
          errors
      };
  }

  /**
   * Validate activity level and goals
   * @param {Object} state - Current state
   * @returns {Object} Validation result
   */
  static validateActivityAndGoals(state) {
      const errors = [];

      if (!this.RULES.ACTIVITY_LEVEL.validate(state.activityLevel)) {
          errors.push('Invalid activity level selection');
      }

      return {
          isValid: errors.length === 0,
          errors
      };
  }
}

// Establish BCC namespace
if (typeof window !== 'undefined') {
  window.BCC = window.BCC || {};
  window.BCC.Validator = Validator;
}

// Single export
export default Validator;