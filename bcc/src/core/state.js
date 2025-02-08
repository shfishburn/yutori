/**
 * State Management Module for Body Composition Calculator
 * 
 * @fileOverview Complete State Management with validation, history, and error tracking
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-06
 * @updated 2024-02-06
 * @timestamp 14:52:33 UTC
 * 
 * Changelog:
 * - Refined state management with comprehensive validation
 * - Added immutable state updates
 * - Implemented robust error logging and history tracking
 */

const stateSchema = {
    currentStep: {
      type: 'number',
      validate: (value) => Number.isInteger(value) && value >= 1 && value <= 5,
      required: true,
      default: 1
    },
    inputMode: {
      type: 'string',
      validate: (value) => ['leanFat', 'totalWeight'].includes(value),
      required: true,
      default: 'totalWeight'
    },
    unit: {
      type: 'string',
      validate: (value) => ['kg', 'lbs'].includes(value),
      required: true,
      default: 'lbs'
    },
    age: {
      type: 'number',
      validate: (value) => value === null || (Number.isInteger(value) && value >= 20 && value <= 69),
      required: false,
      default: null
    },
    gender: {
      type: 'string',
      validate: (value) => ['male', 'female'].includes(value),
      required: true,
      default: 'male'
    },
    totalWeight: {
      type: 'number',
      validate: (value) => value === null || (typeof value === 'number' && value > 0 && value <= 500),
      required: false,
      default: null
    },
    bodyFatPct: {
      type: 'number',
      validate: (value) => value === null || (typeof value === 'number' && value >= 0 && value <= 100),
      required: false,
      default: null
    },
    leanMass: {
      type: 'number',
      validate: (value) => value === null || (typeof value === 'number' && value > 0 && value <= 300),
      required: false,
      default: null
    },
    fatMass: {
      type: 'number',
      validate: (value) => value === null || (typeof value === 'number' && value >= 0 && value <= 300),
      required: false,
      default: null
    },
    activityLevel: {
      type: 'number',
      validate: (value) => [1.2, 1.375, 1.55, 1.725, 1.9].includes(value),
      required: true,
      default: 1.2
    },
    results: {
      type: 'object',
      validate: (value) => value === null || typeof value === 'object',
      required: false,
      default: null
    }
  };
  
  class StateManager {
    constructor() {
      // Initialize state with schema defaults
      this.state = Object.entries(stateSchema).reduce((acc, [key, schema]) => {
        acc[key] = schema.default ?? null;
        return acc;
      }, {});
  
      // State change history for debugging and rollback
      this.history = [{
        timestamp: new Date(),
        action: 'INIT',
        state: { ...this.state }
      }];
  
      // Error log
      this.errorLog = [];
  
      // Update listeners
      this.listeners = new Set();
  
      // Maximum history length
      this.MAX_HISTORY = 50;
    }
  
    /**
     * Validates a single value against its schema
     * @param {string} key - State key to validate
     * @param {*} value - Value to validate
     * @returns {boolean} Validation result
     */
    validateValue(key, value) {
      if (!this.has(key)) {
        this.logError(`Invalid state key: ${key}`);
        return false;
      }
      const schema = stateSchema[key];
  
      // Type checking
      if (value !== null && typeof value !== schema.type) {
        this.logError(`Type mismatch for ${key}: expected ${schema.type}, got ${typeof value}`);
        return false;
      }
  
      // Required check
      if (schema.required && value === null) {
        this.logError(`Required value missing for ${key}`);
        return false;
      }
  
      // Custom validation
      if (schema.validate && !schema.validate(value)) {
        this.logError(`Validation failed for ${key}: ${value}`);
        return false;
      }
  
      return true;
    }
  
    /**
     * Logs an error with timestamp and state snapshot
     * @param {string} message - Error message
     */
    logError(message) {
      this.errorLog.push({
        timestamp: new Date(),
        message,
        stateSnapshot: { ...this.state }
      });
      console.error(`State Error: ${message}`);
    }
  
    /**
     * Records state change in history
     * @param {string} action - Action description
     * @param {Object} prevState - Previous state
     */
    recordHistory(action, prevState) {
      this.history.push({
        timestamp: new Date(),
        action,
        prevState: { ...prevState },
        newState: { ...this.state }
      });
  
      if (this.history.length > this.MAX_HISTORY) {
        this.history.shift();
      }
    }
  
    /**
     * Gets the complete current state
     * @returns {Object} Current state
     */
    getState() {
      return { ...this.state };
    }
  
    /**
     * Gets a single state value
     * @param {string} key - State key
     * @returns {*} State value
     */
    get(key) {
      if (!this.has(key)) {
        this.logError(`Attempted to access invalid key: ${key}`);
        return null;
      }
      return this.state[key];
    }
  
    /**
     * Sets a single state value with validation
     * @param {string} key - State key
     * @param {*} value - Value to set
     * @returns {boolean} Success of state update
     */
    set(key, value) {
      if (!this.validateValue(key, value)) {
        return false;
      }
  
      const prevState = { ...this.state };
      this.state[key] = value;
      
      this.recordHistory(`SET ${key}`, prevState);
      this.notifyListeners();
      return true;
    }
  
    /**
     * Updates multiple state values with validation
     * @param {Object} updates - Updates to apply
     * @returns {boolean} Success of state update
     */
    update(updates) {
      const isValid = Object.entries(updates).every(([key, value]) => 
        this.validateValue(key, value)
      );
  
      if (!isValid) {
        return false;
      }
  
      const prevState = { ...this.state };
      Object.assign(this.state, updates);
  
      this.recordHistory('BATCH_UPDATE', prevState);
      this.notifyListeners();
      return true;
    }
  
    /**
     * Resets state to defaults
     */
    reset() {
      const prevState = { ...this.state };
      
      this.state = Object.entries(stateSchema).reduce((acc, [key, schema]) => {
        acc[key] = schema.default;
        return acc;
      }, {});
  
      this.recordHistory('RESET', prevState);
      this.notifyListeners();
    }
  
    /**
     * Rolls back to previous state
     * @returns {boolean} Success of rollback
     */
    rollback() {
      if (this.history.length < 2) {
        this.logError('No history available for rollback');
        return false;
      }
  
      const prevState = this.history[this.history.length - 2].newState;
      this.state = { ...prevState };
      
      this.recordHistory('ROLLBACK', this.state);
      this.notifyListeners();
      return true;
    }
  
    /**
     * Subscribes to state changes
     * @param {Function} listener - Listener function
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
  
    /**
     * Notifies all listeners of state change
     */
    notifyListeners() {
      this.listeners.forEach(listener => {
        try {
          listener(this.state);
        } catch (error) {
          this.logError(`Listener error: ${error.message}`);
        }
      });
    }
  
    /**
     * Gets error log
     * @returns {Array} Error log
     */
    getErrorLog() {
      return [...this.errorLog];
    }
  
    /**
     * Gets state change history
     * @returns {Array} State history
     */
    getHistory() {
      return [...this.history];
    }
  
    /**
     * Checks if a state key exists in the schema
     * @param {string} key - The state key to check
     * @returns {boolean} Whether the key exists in the schema
     */
    has(key) {
      return Object.prototype.hasOwnProperty.call(stateSchema, key);
    }
  }
  
  // Create singleton instance
  const calculatorState = new StateManager();
  
  // Attach to window for global access
  if (typeof window !== 'undefined') {
    window.calculatorState = calculatorState;
  }
  
  export default calculatorState;