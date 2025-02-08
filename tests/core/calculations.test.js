/**
 * Body Composition Calculations Tests
 * 
 * @fileOverview Test suite for calculation algorithms with precision validation
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-06
 * @updated 2024-02-06
 * @timestamp 20:00:44 UTC
 */

import BodyCompCalculations from '../../src/core/calculations.js';

describe('Body Composition Calculations Tests', () => {
  // Known reference values from verified sources
  const REFERENCE_CASES = [
    {
      input: {
        totalMass: 290,
        bodyFat: 36,
        unit: 'lbs',
        activityLevel: 1.55,
        gender: 'male'
      },
      expected: {
        composition: {
          leanMassLbs: 185.6,
          fatMassLbs: 104.4,
          leanMassKg: 84.19,
          fatMassKg: 47.35
        },
        energy: {
          bmr: 2193,
          tdee: 3399
        },
        macros: {
          protein: { grams: 186, kcal: 744 },
          fat: { grams: 80, kcal: 720 },
          carbs: { grams: 234, kcal: 935 }
        }
      }
    },
    // Additional reference case with different profile
    {
      input: {
        totalMass: 70,
        bodyFat: 25,
        unit: 'kg',
        activityLevel: 1.375,
        gender: 'female'
      },
      expected: {
        composition: {
          leanMassKg: 52.5,
          fatMassKg: 17.5,
          leanMassLbs: 115.74,
          fatMassLbs: 38.58
        },
        energy: {
          bmr: 1504,
          tdee: 2068
        },
        macros: {
          protein: { grams: 116, kcal: 464 },
          fat: { grams: 58, kcal: 522 },
          carbs: { grams: 271, kcal: 1082 }
        }
      }
    }
  ];

  describe('Body Composition Calculations', () => {
    test('should calculate composition accurately for reference cases', () => {
      REFERENCE_CASES.forEach(({ input, expected }) => {
        const result = BodyCompCalculations.calculateComposition(
          input.totalMass,
          input.bodyFat,
          input.unit
        );

        // Test with 0.1% tolerance
        const tolerance = 0.001;
        
        expect(Math.abs(result.leanMassKg - expected.composition.leanMassKg))
          .toBeLessThan(expected.composition.leanMassKg * tolerance);
        expect(Math.abs(result.fatMassKg - expected.composition.fatMassKg))
          .toBeLessThan(expected.composition.fatMassKg * tolerance);
      });
    });

    test('should handle unit conversions accurately', () => {
      const testCases = [
        { mass: 100, unit: 'kg', expectedLbs: 220.462 },
        { mass: 220.462, unit: 'lbs', expectedKg: 100 }
      ];

      testCases.forEach(({ mass, unit, expectedLbs, expectedKg }) => {
        const result = BodyCompCalculations.calculateComposition(mass, 20, unit);
        
        if (unit === 'kg') {
          expect(Math.abs(result.conversions.totalMassLbs - expectedLbs))
            .toBeLessThan(0.01);
        } else {
          expect(Math.abs(result.totalMassKg - expectedKg))
            .toBeLessThan(0.01);
        }
      });
    });

    test('should validate composition inputs', () => {
      expect(() => {
        BodyCompCalculations.calculateComposition(-100, 20, 'lbs');
      }).toThrow();

      expect(() => {
        BodyCompCalculations.calculateComposition(100, -1, 'lbs');
      }).toThrow();

      expect(() => {
        BodyCompCalculations.calculateComposition(100, 101, 'lbs');
      }).toThrow();
    });
  });

  describe('Energy Calculations', () => {
    test('should calculate BMR and TDEE accurately for reference cases', () => {
      REFERENCE_CASES.forEach(({ input, expected }) => {
        const composition = BodyCompCalculations.calculateComposition(
          input.totalMass,
          input.bodyFat,
          input.unit
        );

        const result = BodyCompCalculations.calculateEnergy(
          composition.leanMassKg,
          input.activityLevel
        );

        // Test with 1% tolerance for energy calculations
        const tolerance = 0.01;
        
        expect(Math.abs(result.BMR - expected.energy.bmr))
          .toBeLessThan(expected.energy.bmr * tolerance);
        expect(Math.abs(result.TDEE - expected.energy.tdee))
          .toBeLessThan(expected.energy.tdee * tolerance);
      });
    });

    test('should handle different activity levels correctly', () => {
      const leanMassKg = 70;
      const activityLevels = [1.2, 1.375, 1.55, 1.725, 1.9];
      
      activityLevels.forEach(level => {
        const result = BodyCompCalculations.calculateEnergy(leanMassKg, level);
        expect(result.TDEE).toBe(result.BMR * level);
      });
    });

    test('should validate energy calculation inputs', () => {
      expect(() => {
        BodyCompCalculations.calculateEnergy(-70, 1.55);
      }).toThrow();

      expect(() => {
        BodyCompCalculations.calculateEnergy(70, 3.0);
      }).toThrow();
    });
  });

  describe('Macronutrient Calculations', () => {
    test('should calculate macros accurately for reference cases', () => {
      REFERENCE_CASES.forEach(({ input, expected }) => {
        const composition = BodyCompCalculations.calculateComposition(
          input.totalMass,
          input.bodyFat,
          input.unit
        );

        const result = BodyCompCalculations.calculateMacros(
          expected.energy.tdee,
          composition.leanMassKg
        );

        // Test with 1g tolerance for macros
        const tolerance = 1;
        
        expect(Math.abs(result.protein.grams - expected.macros.protein.grams))
          .toBeLessThan(tolerance);
        expect(Math.abs(result.fat.grams - expected.macros.fat.grams))
          .toBeLessThan(tolerance);
        expect(Math.abs(result.carbs.grams - expected.macros.carbs.grams))
          .toBeLessThan(tolerance);
      });
    });

    test('should handle different macro distribution approaches', () => {
      const calories = 2000;
      const leanMassKg = 70;

      const approaches = ['balanced', 'low-carb', 'high-protein'];
      
      approaches.forEach(approach => {
        const result = BodyCompCalculations.calculateMacros(
          calories,
          leanMassKg,
          { approach }
        );

        // Verify total calories match
        const totalKcal = result.protein.kcal + result.fat.kcal + result.carbs.kcal;
        expect(Math.abs(totalKcal - calories)).toBeLessThan(1);

        // Verify protein is based on lean mass
        expect(result.protein.grams).toBeCloseTo(leanMassKg * 2.2, 0);
      });
    });

    test('should adjust macros for insulin resistance', () => {
      const calories = 2000;
      const leanMassKg = 70;

      const regular = BodyCompCalculations.calculateMacros(calories, leanMassKg);
      const adjusted = BodyCompCalculations.calculateMacros(
        calories,
        leanMassKg,
        { hasInsulinResistance: true }
      );

      expect(adjusted.carbs.grams).toBeLessThan(regular.carbs.grams);
      expect(adjusted.fat.grams).toBeGreaterThan(regular.fat.grams);
    });
  });

  describe('Goal Projections', () => {
    test('should calculate weight loss projections accurately', () => {
      const currentMass = 200;
      const currentBF = 30;
      const targetBF = 20;
      const calorieDeficit = 500;

      const result = BodyCompCalculations.projectGoals(
        currentMass,
        currentBF,
        targetBF,
        calorieDeficit
      );

      // Verify target mass calculation
      const expectedTargetMass = currentMass * (1 - (currentBF - targetBF) / 100);
      expect(result.targetMass).toBeCloseTo(expectedTargetMass, 1);

      // Verify weekly loss calculation (500 cal/day = 1 lb/week)
      expect(result.weeklyLoss).toBeCloseTo(1, 2);
    });

    test('should validate goal projection inputs', () => {
      expect(() => {
        BodyCompCalculations.projectGoals(-200, 30, 20, 500);
      }).toThrow();

      expect(() => {
        BodyCompCalculations.projectGoals(200, -1, 20, 500);
      }).toThrow();

      expect(() => {
        BodyCompCalculations.projectGoals(200, 30, 101, 500);
      }).toThrow();
    });
  });
});