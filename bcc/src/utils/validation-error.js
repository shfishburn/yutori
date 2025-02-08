/**
 * Validation Error Utility for Body Composition Calculator
 * 
 * @fileOverview Provides enhanced error handling for validation failures
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-07
 * @updated 2024-02-07
 * @timestamp 17:25:44 UTC
 * 
 * Changelog:
 * - Created dedicated validation error handling
 * - Added detailed error context
 * - Implemented error tracking
 */

class ValidationError extends Error {
    constructor(message, context = {}) {
        super(message);
        this.name = 'ValidationError';
        this.context = {
            ...context,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Create a validation error with step context
     * @param {string} message - Error message
     * @param {number} step - Validation step
     * @param {Object} details - Additional error details
     * @returns {ValidationError} Configured error instance
     */
    static forStep(message, step, details = {}) {
        return new ValidationError(message, {
            step,
            ...details,
            type: 'step_validation'
        });
    }

    /**
     * Create a validation error for a specific field
     * @param {string} field - Field name
     * @param {*} value - Invalid value
     * @param {string} rule - Failed validation rule
     * @returns {ValidationError} Configured error instance
     */
    static forField(field, value, rule) {
        return new ValidationError(`Invalid ${field}`, {
            field,
            value,
            rule,
            type: 'field_validation'
        });
    }

    /**
     * Log the validation error if error manager exists
     */
    log() {
        if (typeof window !== 'undefined' && window.errorManager) {
            window.errorManager.logError(this, {
                type: 'validation',
                ...this.context
            });
        }
    }
}

// Attach to BCC namespace
if (typeof window !== 'undefined') {
    window.BCC = window.BCC || {};
    window.BCC.ValidationError = ValidationError;
}

export default ValidationError;