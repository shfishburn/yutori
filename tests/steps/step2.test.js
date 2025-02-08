/**
 * Step 2 (Personal Information) Tests
 * 
 * @fileOverview Test suite for step 2 module
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-06
 * @updated 2024-02-06
 * @timestamp 20:30:12 UTC
 */

import step2Module from '../../src/steps/step2.js';
import calculatorState from '../../src/core/state.js';

describe('Step 2: Personal Information Tests', () => {
  let container;

  beforeEach(() => {
    calculatorState.reset();
    container = document.createElement('div');
    container.innerHTML = `
      <input type="number" name="age" min="20" max="69">
      <select name="gender">
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
    `;
  });

  describe('Age Input Handling', () => {
    test('should update state with valid age', () => {
      const ageInput = container.querySelector('input[name="age"]');
      ageInput.value = '25';
      ageInput.dispatchEvent(new Event('input'));
      
      expect(calculatorState.get('age')).toBe(25);
    });

    test('should handle invalid age inputs', () => {
      const ageInput = container.querySelector('input[name="age"]');
      
      // Test below minimum
      ageInput.value = '15';
      ageInput.dispatchEvent(new Event('input'));
      expect(calculatorState.get('age')).toBeNull();

      // Test above maximum
      ageInput.value = '75';
      ageInput.dispatchEvent(new Event('input'));
      expect(calculatorState.get('age')).toBeNull();
    });
  });

  describe('Gender Selection', () => {
    test('should update state with valid gender', () => {
      const genderSelect = container.querySelector('select[name="gender"]');
      genderSelect.value = 'female';
      genderSelect.dispatchEvent(new Event('change'));
      
      expect(calculatorState.get('gender')).toBe('female');
    });
  });

  describe('Validation', () => {
    test('should validate complete inputs', () => {
      calculatorState.update({
        age: 30,
        gender: 'male'
      });
      expect(step2Module.validate()).toBe(true);
    });

    test('should fail validation with missing inputs', () => {
      calculatorState.update({
        age: null,
        gender: 'male'
      });
      expect(step2Module.validate()).toBe(false);
    });
  });
});



