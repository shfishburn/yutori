/**
* Conversion Utilities for Body Composition Calculator
* 
* @fileOverview Comprehensive unit conversion methods
* @author Yutori Labs
* @version 1.0.0
* @created 2024-02-06
* @updated 2024-02-06
* @timestamp 17:05:22 UTC
* 
* Changelog:
* - Centralized unit conversion methods
* - Support for weight, length, and body composition conversions
* - Precise and configurable conversion utilities
*/

class ConversionUtils {
    // Conversion constants
    static CONSTANTS = {
      WEIGHT: {
        KG_TO_LBS: 2.20462,
        LBS_TO_KG: 0.453592
      },
      LENGTH: {
        CM_TO_INCHES: 0.393701,
        INCHES_TO_CM: 2.54
      }
    };
   
    /**
     * Convert weight between kg and lbs
     * @param {number} value - Value to convert
     * @param {string} from - Source unit ('kg' or 'lbs')
     * @param {number} [precision=2] - Decimal precision
     * @returns {number} Converted weight
     */
    static convertWeight(value, from, precision = 2) {
      if (value === null || value === undefined) return null;
   
      const conversions = {
        'kg_to_lbs': () => value * this.CONSTANTS.WEIGHT.KG_TO_LBS,
        'lbs_to_kg': () => value * this.CONSTANTS.WEIGHT.LBS_TO_KG
      };
   
      const conversionKey = `${from}_to_${from === 'kg' ? 'lbs' : 'kg'}`;
      const convertedValue = conversions[conversionKey]();
   
      return Number(convertedValue.toFixed(precision));
    }
   
    /**
     * Convert length between cm and inches
     * @param {number} value - Value to convert
     * @param {string} from - Source unit ('cm' or 'inches')
     * @param {number} [precision=2] - Decimal precision
     * @returns {number} Converted length
     */
    static convertLength(value, from, precision = 2) {
      if (value === null || value === undefined) return null;
   
      const conversions = {
        'cm_to_inches': () => value * this.CONSTANTS.LENGTH.CM_TO_INCHES,
        'inches_to_cm': () => value * this.CONSTANTS.LENGTH.INCHES_TO_CM
      };
   
      const conversionKey = `${from}_to_${from === 'cm' ? 'inches' : 'cm'}`;
      const convertedValue = conversions[conversionKey]();
   
      return Number(convertedValue.toFixed(precision));
    }
   
    /**
     * Convert body composition metrics
     * @param {Object} composition - Body composition object
     * @param {string} from - Source unit
     * @returns {Object} Converted body composition
     */
    static convertBodyComposition(composition, from) {
      if (!composition) return null;
   
      return {
        leanMass: this.convertWeight(composition.leanMass, from),
        fatMass: this.convertWeight(composition.fatMass, from),
        totalMass: this.convertWeight(composition.totalMass, from)
      };
    }
   
    /**
     * Validate conversion inputs
     * @param {number} value - Value to validate
     * @param {string} unit - Unit to validate
     * @returns {boolean} Validation result
     */
    static validateConversion(value, unit) {
      const validUnits = {
        weight: ['kg', 'lbs'],
        length: ['cm', 'inches']
      };
   
      return value !== null && 
             value !== undefined && 
             !isNaN(value) && 
             validUnits[unit] ? validUnits[unit].includes(unit) : false;
    }
   }
   
   // Attach to window for global access
   if (typeof window !== 'undefined') {
    window.ConversionUtils = ConversionUtils;
   }
   
   export default ConversionUtils;