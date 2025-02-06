import BodyCompCalculations from '../src/js/core/calculations.js';

describe('BodyCompCalculations', () => {
  // Input Validation Tests
  describe('Input Validation', () => {
    const validInput = {
      age: 35,
      gender: 'male',
      totalMass: 200,
      bodyFat: 20,
      activityLevel: 1.55,
      unit: 'lbs'
    };

    test('validates correct input', () => {
      expect(() => BodyCompCalculations.validateInput(validInput)).not.toThrow();
    });

    test('throws error for invalid age', () => {
      const invalidInputs = [
        { ...baseInput, age: 19 },
        { ...baseInput, age: 70 },
        { ...baseInput, age: null }
      ];

      invalidInputs.forEach(input => {
        expect(() => BodyCompCalculations.validateInput(input)).toThrow();
      });
    });

    test('throws error for invalid gender', () => {
      const invalidInputs = [
        { ...baseInput, gender: 'other' },
        { ...baseInput, gender: null }
      ];

      invalidInputs.forEach(input => {
        expect(() => BodyCompCalculations.validateInput(input)).toThrow();
      });
    });

    test('throws error for invalid weight', () => {
      const invalidInputs = [
        { ...baseInput, totalMass: 30, unit: 'kg' },
        { ...baseInput, totalMass: 300, unit: 'kg' },
        { ...baseInput, totalMass: 50, unit: 'lbs' },
        { ...baseInput, totalMass: 700, unit: 'lbs' }
      ];

      invalidInputs.forEach(input => {
        expect(() => BodyCompCalculations.validateInput(input)).toThrow();
      });
    });
  });

  // Composition Calculation Tests
  describe('Composition Calculations', () => {
    test('calculates composition correctly for lbs', () => {
      const result = BodyCompCalculations.calculateComposition(200, 20, 'lbs');
      
      expect(result).toMatchObject({
        leanMassKg: expect.any(Number),
        fatMassKg: expect.any(Number),
        totalMassKg: expect.any(Number),
        bodyFatPercent: 20,
        conversions: {
          leanMassLbs: expect.any(Number),
          fatMassLbs: expect.any(Number),
          totalMassLbs: 200
        }
      });
    });

    test('calculates composition correctly for kg', () => {
      const result = BodyCompCalculations.calculateComposition(90, 20, 'kg');
      
      expect(result).toMatchObject({
        leanMassKg: expect.any(Number),
        fatMassKg: expect.any(Number),
        totalMassKg: 90,
        bodyFatPercent: 20,
        conversions: {
          leanMassLbs: expect.any(Number),
          fatMassLbs: expect.any(Number),
          totalMassLbs: expect.any(Number)
        }
      });
    });

    test('throws error for invalid body fat percentage', () => {
      expect(() => BodyCompCalculations.calculateComposition(200, -1, 'lbs')).toThrow();
      expect(() => BodyCompCalculations.calculateComposition(200, 101, 'lbs')).toThrow();
    });
  });

  // Energy Calculation Tests
  describe('Energy Calculations', () => {
    test('calculates energy correctly', () => {
      const result = BodyCompCalculations.calculateEnergy(80, 1.55);
      
      expect(result).toMatchObject({
        BMR: expect.any(Number),
        TDEE: expect.any(Number)
      });
    });

    test('throws error for invalid lean mass', () => {
      expect(() => BodyCompCalculations.calculateEnergy(0, 1.55)).toThrow();
      expect(() => BodyCompCalculations.calculateEnergy(-10, 1.55)).toThrow();
    });
  });

  // Macro Calculation Tests
  describe('Macro Calculations', () => {
    const baseOptions = { leanMassKg: 80, calories: 2500 };

    test('calculates macros for balanced approach', () => {
      const result = BodyCompCalculations.calculateMacros(
        baseOptions.calories, 
        baseOptions.leanMassKg
      );
      
      expect(result).toMatchObject({
        protein: { grams: expect.any(Number), kcal: expect.any(Number) },
        carbs: { grams: expect.any(Number), kcal: expect.any(Number) },
        fat: { grams: expect.any(Number), kcal: expect.any(Number) },
        totalKcal: 2500
      });
    });

    test('calculates macros for low-carb approach', () => {
      const result = BodyCompCalculations.calculateMacros(
        baseOptions.calories, 
        baseOptions.leanMassKg,
        { approach: 'low-carb' }
      );
      
      expect(result.carbs.grams).toBeLessThan(
        BodyCompCalculations.calculateMacros(
          baseOptions.calories, 
          baseOptions.leanMassKg
        ).carbs.grams
      );
    });

    test('throws error for invalid calories', () => {
      expect(() => BodyCompCalculations.calculateMacros(
        0, 
        baseOptions.leanMassKg
      )).toThrow();
    });
  });

  // Goal Projection Tests
  describe('Goal Projections', () => {
    test('projects goals correctly', () => {
      const result = BodyCompCalculations.projectGoals(200, 30, 20, 500);
      
      expect(result).toMatchObject({
        targetMass: expect.any(Number),
        weeklyLoss: expect.any(Number),
        weeksToGoal: expect.any(Number),
        expectedCompletion: expect.any(Date)
      });
    });

    test('throws error for invalid input', () => {
      expect(() => BodyCompCalculations.projectGoals(-200, 30, 20, 500)).toThrow();
      expect(() => BodyCompCalculations.projectGoals(200, -30, 20, 500)).toThrow();
      expect(() => BodyCompCalculations.projectGoals(200, 30, 120, 500)).toThrow();
    });
  });
});

// Baseline input for repeated use in tests
const baseInput = {
  age: 35,
  gender: 'male',
  totalMass: 200,
  bodyFat: 20,
  activityLevel: 1.55,
  unit: 'lbs'
};