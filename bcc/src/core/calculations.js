/**
* Calculation Algorithms for Body Composition Calculator
* 
* @fileOverview Provides robust, validated calculation methods for body composition analysis
* @author Yutori Labs
* @version 1.0.0
* @created 2024-02-06
* @updated 2024-02-06
* @timestamp 15:12:44 UTC
* 
* Changelog:
* - Comprehensive calculation methods for body composition
* - Enhanced error handling and input validation
* - Modular design with clear calculation strategies
*/

class BodyCompCalculations {
  // Calculation Constants and Configuration
  static CONSTANTS = {
    CONVERSION: {
      KG_TO_LBS: 2.20462,
      LBS_TO_KG: 0.453592
    },
    LIMITS: {
      AGE: { MIN: 20, MAX: 69 },
      BODY_FAT: { MIN: 3, MAX: 60 },
      WEIGHT: {
        LBS: { MIN: 88, MAX: 599 },
        KG: { MIN: 40, MAX: 272 }
      },
      ACTIVITY_LEVELS: [1.2, 1.375, 1.55, 1.725, 1.9],
      CALORIES: {
        MIN: 1200,
        MAX: 10000
      }
    }
  };
 
  /**
   * Validate input parameters for calculations
   * @param {Object} input - Calculation input parameters
   * @throws {Error} If any input fails validation
   */
  static validateInput(input) {
    const { 
      age, 
      gender, 
      totalMass, 
      bodyFat, 
      activityLevel, 
      unit 
    } = input;
 
    // Age validation
    if (!Number.isInteger(age) || 
        age < this.CONSTANTS.LIMITS.AGE.MIN || 
        age > this.CONSTANTS.LIMITS.AGE.MAX) {
      throw new Error(`Invalid age. Must be between ${this.CONSTANTS.LIMITS.AGE.MIN} and ${this.CONSTANTS.LIMITS.AGE.MAX}.`);
    }
 
    // Gender validation
    if (!['male', 'female'].includes(gender)) {
      throw new Error('Invalid gender. Must be "male" or "female".');
    }
 
    // Weight validation
    const weightRules = this.CONSTANTS.LIMITS.WEIGHT[unit];
    if (!weightRules || 
        totalMass < weightRules.MIN || 
        totalMass > weightRules.MAX) {
      throw new Error(`Invalid weight for ${unit}. Must be between ${weightRules.MIN} and ${weightRules.MAX}.`);
    }
 
    // Body fat percentage validation
    const { MIN, MAX } = this.CONSTANTS.LIMITS.BODY_FAT;
    if (bodyFat < MIN || bodyFat > MAX) {
      throw new Error(`Invalid body fat percentage. Must be between ${MIN} and ${MAX}.`);
    }
 
    // Activity level validation
    if (!this.CONSTANTS.LIMITS.ACTIVITY_LEVELS.includes(parseFloat(activityLevel))) {
      throw new Error('Invalid activity level. Must be one of: ' + 
        this.CONSTANTS.LIMITS.ACTIVITY_LEVELS.join(', '));
    }
  }
 
  /**
   * Calculate body composition
   * @param {number} totalMass - Total body mass
   * @param {number} bodyFatPercent - Body fat percentage
   * @param {string} [unit='lbs'] - Unit of measurement
   * @returns {Object} Detailed body composition breakdown
   */
  static calculateComposition(totalMass, bodyFatPercent, unit = 'lbs') {
    // Validate body fat percentage
    if (bodyFatPercent < 0 || bodyFatPercent > 100) {
      throw new Error('Body fat percentage must be between 0 and 100.');
    }
 
    // Convert mass to kg if needed
    const massKg = unit === 'kg' ? totalMass : totalMass * this.CONSTANTS.CONVERSION.LBS_TO_KG;
    
    // Calculate mass components
    const fatMassKg = massKg * (bodyFatPercent / 100);
    const leanMassKg = massKg - fatMassKg;
 
    return {
      leanMassKg: Number(leanMassKg.toFixed(2)),
      fatMassKg: Number(fatMassKg.toFixed(2)),
      totalMassKg: Number(massKg.toFixed(2)),
      bodyFatPercent: Number(bodyFatPercent.toFixed(2)),
      conversions: {
        leanMassLbs: Number((leanMassKg * this.CONSTANTS.CONVERSION.KG_TO_LBS).toFixed(2)),
        fatMassLbs: Number((fatMassKg * this.CONSTANTS.CONVERSION.KG_TO_LBS).toFixed(2)),
        totalMassLbs: Number((massKg * this.CONSTANTS.CONVERSION.KG_TO_LBS).toFixed(2))
      }
    };
  }
 
  /**
   * Calculate Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE)
   * @param {number} leanMassKg - Lean body mass in kilograms
   * @param {number} activityLevel - Activity multiplier
   * @returns {Object} BMR and TDEE calculations
   */
  static calculateEnergy(leanMassKg, activityLevel) {
    // Validate inputs
    if (leanMassKg <= 0) {
      throw new Error('Lean mass must be a positive number.');
    }
 
    if (!this.CONSTANTS.LIMITS.ACTIVITY_LEVELS.includes(activityLevel)) {
      throw new Error('Invalid activity level.');
    }
 
    // Precise BMR calculation based on lean mass
    const BMR = 370 + (21.6 * leanMassKg);
    
    // Total Daily Energy Expenditure
    const TDEE = BMR * activityLevel;
 
    return { 
      BMR: Number(BMR.toFixed(0)), 
      TDEE: Number(TDEE.toFixed(0)) 
    };
  }
 
  /**
   * Calculate macronutrient targets
   * @param {number} calories - Daily calorie target
   * @param {number} leanMassKg - Lean body mass in kilograms
   * @param {Object} [options={}] - Calculation options
   * @returns {Object} Detailed macro breakdown
   */
  static calculateMacros(calories, leanMassKg, options = {}) {
    const {
      approach = 'balanced',
      hasInsulinResistance = false,
      proteinMultiplier = 2.2
    } = options;
 
    // Validate calories
    if (calories < this.CONSTANTS.LIMITS.CALORIES.MIN || 
        calories > this.CONSTANTS.LIMITS.CALORIES.MAX) {
      throw new Error(`Calories must be between ${this.CONSTANTS.LIMITS.CALORIES.MIN} and ${this.CONSTANTS.LIMITS.CALORIES.MAX}.`);
    }
 
    if (leanMassKg <= 0) {
      throw new Error('Lean mass must be a positive number.');
    }
 
    // Protein calculation
    const proteinGrams = Number((leanMassKg * proteinMultiplier).toFixed(0));
    const proteinKcal = proteinGrams * 4;
    
    // Remaining calories for carbs and fat
    const remainingKcal = calories - proteinKcal;
    
    // Macro ratio adjustments
    let carbRatio = hasInsulinResistance ? 0.2 : 0.5;
    switch(approach) {
      case 'low-carb': carbRatio = 0.2; break;
      case 'high-protein': carbRatio = 0.6; break;
    }
 
    const carbKcal = remainingKcal * carbRatio;
    const fatKcal = remainingKcal * (1 - carbRatio);
 
    return {
      protein: {
        grams: proteinGrams,
        kcal: Math.round(proteinKcal)
      },
      carbs: {
        grams: Math.round(carbKcal / 4),
        kcal: Math.round(carbKcal)
      },
      fat: {
        grams: Math.round(fatKcal / 9),
        kcal: Math.round(fatKcal)
      },
      totalKcal: calories
    };
  }
 
  /**
   * Project fitness goals
   * @param {number} currentMass - Current body mass
   * @param {number} currentBF - Current body fat percentage
   * @param {number} targetBF - Target body fat percentage
   * @param {number} calorieDeficit - Daily calorie deficit/surplus
   * @returns {Object} Detailed goal projection
   */
  static projectGoals(currentMass, currentBF, targetBF, calorieDeficit) {
    // Validate inputs
    if (currentMass <= 0 || 
        currentBF < 0 || currentBF > 100 || 
        targetBF < 0 || targetBF > 100) {
      throw new Error('Invalid mass or body fat percentage.');
    }
 
    const weeklyDeficit = calorieDeficit * 7;
    const weeklyLoss = weeklyDeficit / 3500; // lbs per week
    const targetMass = currentMass * (1 - (currentBF - targetBF) / 100);
    const weeksToGoal = (currentMass - targetMass) / weeklyLoss;
 
    return {
      targetMass: Number(targetMass.toFixed(2)),
      weeklyLoss: Number(weeklyLoss.toFixed(2)),
      weeksToGoal: Math.ceil(weeksToGoal),
      expectedCompletion: new Date(Date.now() + (weeksToGoal * 7 * 24 * 60 * 60 * 1000))
    };
  }
 
  /**
   * Categorize body fat percentage
   * @param {number} bodyFatPercent - Body fat percentage
   * @returns {string} Body fat percentage category
   */
  static getBodyFatCategory(bodyFatPercent) {
    if (bodyFatPercent < 10) return 'Dangerously Low';
    if (bodyFatPercent < 15) return 'Excellent';
    if (bodyFatPercent < 20) return 'Good';
    if (bodyFatPercent < 25) return 'Fair';
    if (bodyFatPercent < 30) return 'Poor';
    return 'Dangerously High';
  }
 }
 
 export default BodyCompCalculations;