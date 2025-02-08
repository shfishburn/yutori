/**
* Sanitization Utilities for Body Composition Calculator
* 
* @fileOverview Comprehensive input sanitization methods
* @author Yutori Labs
* @version 1.0.0
* @created 2024-02-06
* @updated 2024-02-06
* @timestamp 17:20:33 UTC
* 
* Changelog:
* - Centralized input sanitization methods
* - Support for various input types
* - Robust validation and cleaning
*/

class SanitizationUtils {
    /**
     * Sanitize numeric input
     * @param {*} value - Input value
     * @param {Object} [options] - Sanitization options
     * @returns {number|null} Sanitized number
     */
    static sanitizeNumber(value, options = {}) {
      const {
        min = -Infinity,
        max = Infinity,
        decimals = 2,
        allowNull = false
      } = options;
   
      // Handle null or undefined
      if (value === null || value === undefined) {
        return allowNull ? null : 0;
      }
   
      // Convert to number, removing non-numeric characters
      const sanitized = parseFloat(
        String(value)
          .replace(/[^\d.-]/g, '')
          .replace(/(\..*)\./g, '$1')
      );
   
      // Check if result is a valid number
      if (isNaN(sanitized)) {
        return allowNull ? null : 0;
      }
   
      // Clamp value
      const clamped = Math.max(min, Math.min(max, sanitized));
   
      // Round to specified decimal places
      return Number(clamped.toFixed(decimals));
    }
   
    /**
     * Sanitize text input
     * @param {*} value - Input value
     * @param {Object} [options] - Sanitization options
     * @returns {string} Sanitized string
     */
    static sanitizeText(value, options = {}) {
      const {
        maxLength = 200,
        allowSpecialChars = false,
        trim = true
      } = options;
   
      // Handle null or undefined
      if (value === null || value === undefined) {
        return '';
      }
   
      // Convert to string
      let sanitized = String(value);
   
      // Trim whitespace
      if (trim) {
        sanitized = sanitized.trim();
      }
   
      // Remove special characters if not allowed
      if (!allowSpecialChars) {
        sanitized = sanitized.replace(/[^\w\s]/gi, '');
      }
   
      // Truncate to max length
      return sanitized.substring(0, maxLength);
    }
   
    /**
     * Sanitize boolean input
     * @param {*} value - Input value
     * @returns {boolean} Sanitized boolean
     */
    static sanitizeBoolean(value) {
      if (typeof value === 'boolean') return value;
      
      const truthy = ['true', '1', 'yes', 'on'];
      const falsy = ['false', '0', 'no', 'off'];
   
      if (truthy.includes(String(value).toLowerCase())) return true;
      if (falsy.includes(String(value).toLowerCase())) return false;
   
      return Boolean(value);
    }
   
    /**
     * Sanitize email input
     * @param {*} value - Input value
     * @returns {string|null} Sanitized email or null
     */
    static sanitizeEmail(value) {
      if (value === null || value === undefined) return null;
   
      const sanitized = String(value)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '');
   
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(sanitized) ? sanitized : null;
    }
   
    /**
     * Validate and sanitize body composition inputs
     * @param {Object} input - Input object
     * @param {string} inputMode - Input method
     * @returns {Object} Sanitized input
     */
    static sanitizeBodyCompInput(input, inputMode) {
      const sanitizationRules = {
        totalWeight: {
          min: 40,
          max: 600
        },
        bodyFatPct: {
          min: 3,
          max: 60
        },
        leanMass: {
          min: 20,
          max: 300
        },
        fatMass: {
          min: 0,
          max: 300
        }
      };
   
      const sanitized = {};
   
      if (inputMode === 'totalWeight') {
        sanitized.totalWeight = this.sanitizeNumber(input.totalWeight, sanitizationRules.totalWeight);
        sanitized.bodyFatPct = this.sanitizeNumber(input.bodyFatPct, sanitizationRules.bodyFatPct);
      } else {
        sanitized.leanMass = this.sanitizeNumber(input.leanMass, sanitizationRules.leanMass);
        sanitized.fatMass = this.sanitizeNumber(input.fatMass, sanitizationRules.fatMass);
      }
   
      return sanitized;
    }
   }
   
   // Attach to window for global access
   if (typeof window !== 'undefined') {
    window.SanitizationUtils = SanitizationUtils;
   }
   
   export default SanitizationUtils;