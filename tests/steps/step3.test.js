/**
 * Step 3 (Body Composition) Tests
 * 
 * @fileOverview Test suite for step 3 module
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-06
 * @updated 2024-02-06
 * @timestamp 20:35:44 UTC
 */

import step3Module from '../../src/steps/step3.js';
import calculatorState from '../../src/core/state.js';

describe('Step 3: Body Composition Tests', () => {
  let container;

  beforeEach(() => {
    calculatorState.reset();
    container = document.createElement('div');
    container.innerHTML = `
      <input type="number" name="totalWeight">
      <input type="number" name="bodyFatPct">
      <input type="number" name="leanMass">
      <input type="number" name="fatMass">
    `;
  });

  describe('Total Weight Mode', () => {
    beforeEach(() => {
      calculatorState.set('inputMode', 'totalWeight');
    });

    test('should handle valid weight input', () => {
      const weightInput = container.querySelector('input[name="totalWeight"]');
      weightInput.value = '180';
      weightInput.dispatchEvent(new Event('input'));
      
      expect(calculatorState.get('totalWeight')).toBe(180);
    });

    test('should handle valid body fat percentage', () => {
      const bfInput = container.querySelector('input[name="bodyFatPct"]');
      bfInput.value = '20';
      bfInput.dispatchEvent(new Event('input'));
      
      expect(calculatorState.get('bodyFatPct')).toBe(20);
    });

    test('should validate total weight inputs', () => {
      calculatorState.update({
        totalWeight: 180,
        bodyFatPct: 20
      });
      expect(step3Module.validate()).toBe(true);
    });
  });

  describe('Lean/Fat Mass Mode', () => {
    beforeEach(() => {
      calculatorState.set('inputMode', 'leanFat');
    });

    test('should handle valid lean mass input', () => {
      const leanInput = container.querySelector('input[name="leanMass"]');
      leanInput.value = '150';
      leanInput.dispatchEvent(new Event('input'));
      
      expect(calculatorState.get('leanMass')).toBe(150);
    });

    test('should handle valid fat mass input', () => {
      const fatInput = container.querySelector('input[name="fatMass"]');
      fatInput.value = '30';
      fatInput.dispatchEvent(new Event('input'));
      
      expect(calculatorState.get('fatMass')).toBe(30);
    });
  });

  describe('Unit Conversion', () => {
    test('should handle unit changes', () => {
      calculatorState.update({
        unit: 'lbs',
        totalWeight: 180
      });
      
      calculatorState.set('unit', 'kg');
      const weightInput = container.querySelector('input[name="totalWeight"]');
      expect(weightInput.value).toBe('81.6');
    });
  });
});