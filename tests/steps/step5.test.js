/**
 * Step 5 (Results Display) Tests
 * 
 * @fileOverview Test suite for step 5 module
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-06
 * @updated 2024-02-06
 * @timestamp 20:55:44 UTC
 */

import step5Module from '../../src/steps/step5.js';
import calculatorState from '../../src/core/state.js';
import BodyCompCalculations from '../../src/core/calculations.js';

describe('Step 5: Results Display Tests', () => {
  let container;
  const mockResults = {
    composition: {
      leanMassKg: 70,
      fatMassKg: 20,
      bodyFatPercent: 22.2
    },
    energy: {
      BMR: 1800,
      TDEE: 2700
    },
    macros: {
      protein: { grams: 154, kcal: 616 },
      carbs: { grams: 300, kcal: 1200 },
      fat: { grams: 98, kcal: 884 }
    }
  };

  beforeEach(() => {
    calculatorState.reset();
    container = document.createElement('div');
    container.innerHTML = `
      <div id="tdeeResult"></div>
      <div id="bmrResult"></div>
      <div id="proteinResult"></div>
      <div id="carbsResult"></div>
      <div id="fatResult"></div>
      <button id="shareResults">Share</button>
      <button data-action="reset">Reset</button>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Results Generation', () => {
    test('should generate results from state', () => {
      calculatorState.update({
        totalWeight: 200,
        bodyFatPct: 22.2,
        activityLevel: 1.55,
        unit: 'lbs'
      });

      step5Module.generateResults();
      const state = calculatorState.getState();
      
      expect(state.results).toBeTruthy();
      expect(state.results.energy.TDEE).toBeGreaterThan(0);
    });

    test('should handle missing inputs gracefully', () => {
      expect(() => {
        step5Module.generateResults();
      }).not.toThrow();
    });
  });

  describe('Display Updates', () => {
    beforeEach(() => {
      calculatorState.update({ results: mockResults });
    });

    test('should update all result elements', () => {
      step5Module.updateDisplay();

      expect(document.getElementById('tdeeResult').textContent)
        .toContain('2700');
      expect(document.getElementById('proteinResult').textContent)
        .toContain('154');
    });

    test('should format numbers appropriately', () => {
      step5Module.updateDisplay();
      
      const tdeeText = document.getElementById('tdeeResult').textContent;
      expect(tdeeText).toMatch(/[\d,]+ kcal/);
    });
  });

  describe('Share Functionality', () => {
    beforeEach(() => {
      calculatorState.update({ results: mockResults });
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue(undefined)
      };
    });

    test('should generate share text', () => {
      const shareText = step5Module.generateShareText(mockResults);
      expect(shareText).toContain('TDEE:');
      expect(shareText).toContain('Protein:');
    });

    test('should handle share button click', async () => {
      const shareButton = document.getElementById('shareResults');
      shareButton.click();
      
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  describe('Reset Functionality', () => {
    test('should reset calculator state', () => {
      // Mock confirm to return true
      global.confirm = jest.fn(() => true);
      
      calculatorState.update({ results: mockResults });
      const resetButton = container.querySelector('[data-action="reset"]');
      resetButton.click();

      expect(calculatorState.getState().results).toBeNull();
    });
  });

  describe('Validation', () => {
    test('should always validate (display-only step)', () => {
      expect(step5Module.validate()).toBe(true);
    });
  });
});