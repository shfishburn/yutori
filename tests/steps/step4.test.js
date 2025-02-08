/**
 * Step 4 (Activity Level and Goals) Tests
 * 
 * @fileOverview Test suite for step 4 module
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-06
 * @updated 2024-02-06
 * @timestamp 20:40:22 UTC
 */

import step4Module from '../../src/steps/step4.js';
import calculatorState from '../../src/core/state.js';

describe('Step 4: Activity Level and Goals Tests', () => {
  let container;

  beforeEach(() => {
    calculatorState.reset();
    container = document.createElement('div');
    container.innerHTML = `
      <select name="activityLevel">
        <option value="1.2">Sedentary</option>
        <option value="1.375">Light</option>
        <option value="1.55">Moderate</option>
        <option value="1.725">Very Active</option>
        <option value="1.9">Extra Active</option>
      </select>
      <input type="radio" name="weightGoal" value="lose">
      <input type="radio" name="weightGoal" value="maintain">
      <input type="radio" name="weightGoal" value="gain">
      <input type="number" name="dailyAdjustment">
    `;
  });

  describe('Activity Level Selection', () => {
    test('should update state with valid activity level', () => {
      const activitySelect = container.querySelector('select[name="activityLevel"]');
      activitySelect.value = '1.55';
      activitySelect.dispatchEvent(new Event('change'));
      
      expect(calculatorState.get('activityLevel')).toBe(1.55);
    });

    test('should validate activity level range', () => {
      const validLevels = [1.2, 1.375, 1.55, 1.725, 1.9];
      validLevels.forEach(level => {
        calculatorState.set('activityLevel', level);
        expect(step4Module.validate()).toBe(true);
      });
    });
  });

  describe('Weight Goal Selection', () => {
    test('should handle goal selection', () => {
      const goalInputs = container.querySelectorAll('input[name="weightGoal"]');
      goalInputs[0].checked = true;
      goalInputs[0].dispatchEvent(new Event('change'));
      
      expect(calculatorState.get('weightGoal')).toBe('lose');
    });

    test('should set default adjustment based on goal', () => {
      const loseInput = container.querySelector('input[value="lose"]');
      loseInput.checked = true;
      loseInput.dispatchEvent(new Event('change'));
      
      expect(calculatorState.get('dailyAdjustment')).toBe(-500);
    });
  });

  describe('Daily Adjustment', () => {
    test('should validate adjustment ranges', () => {
      const adjustmentInput = container.querySelector('input[name="dailyAdjustment"]');
      
      // Test valid range
      adjustmentInput.value = '-500';
      adjustmentInput.dispatchEvent(new Event('input'));
      expect(calculatorState.get('dailyAdjustment')).toBe(-500);

      // Test invalid range
      adjustmentInput.value = '-1500';
      adjustmentInput.dispatchEvent(new Event('input'));
      expect(calculatorState.get('dailyAdjustment')).not.toBe(-1500);
    });

    test('should align adjustment with goal', () => {
      calculatorState.set('weightGoal', 'lose');
      const adjustmentInput = container.querySelector('input[name="dailyAdjustment"]');
      
      // Test valid alignment
      adjustmentInput.value = '-500';
      adjustmentInput.dispatchEvent(new Event('input'));
      expect(calculatorState.get('dailyAdjustment')).toBe(-500);

      // Test invalid alignment
      adjustmentInput.value = '500';
      adjustmentInput.dispatchEvent(new Event('input'));
      expect(calculatorState.get('dailyAdjustment')).not.toBe(500);
    });
  });

  describe('Validation', () => {
    test('should validate complete step', () => {
      calculatorState.update({
        activityLevel: 1.55,
        weightGoal: 'lose',
        dailyAdjustment: -500
      });
      expect(step4Module.validate()).toBe(true);
    });

    test('should fail validation with missing inputs', () => {
      calculatorState.update({
        activityLevel: null,
        weightGoal: 'lose'
      });
      expect(step4Module.validate()).toBe(false);
    });
  });
});