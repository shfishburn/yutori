/**
 * Step 1 (Input Method Selection) Tests
 * 
 * @fileOverview Test suite for step 1 module
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-06
 * @updated 2024-02-06
 * @timestamp 20:15:33 UTC
 */

import step1Module from '../../src/steps/step1.js';
import calculatorState from '../../src/core/state.js';

describe('Step 1: Input Method Selection Tests', () => {
  // Mock DOM elements
  let container;

  beforeEach(() => {
    // Reset state
    calculatorState.reset();
    
    // Setup DOM
    container = document.createElement('div');
    container.innerHTML = `
      <input type="radio" name="inputMode" value="totalWeight">
      <input type="radio" name="inputMode" value="leanFat">
      <input type="radio" name="unit" value="kg">
      <input type="radio" name="unit" value="lbs">
    `;
  });

  describe('Initialization', () => {
    test('should attach listeners successfully', () => {
      expect(() => {
        step1Module.attachListeners(container);
      }).not.toThrow();
    });

    test('should handle null container gracefully', () => {
      expect(() => {
        step1Module.attachListeners(null);
      }).not.toThrow();
    });
  });

  describe('Input Mode Selection', () => {
    beforeEach(() => {
      step1Module.attachListeners(container);
    });

    test('should update state on input mode change', () => {
      const totalWeightInput = container.querySelector('input[value="totalWeight"]');
      totalWeightInput.checked = true;
      totalWeightInput.dispatchEvent(new Event('change'));

      expect(calculatorState.get('inputMode')).toBe('totalWeight');
    });

    test('should clear composition values on input mode change', () => {
      // Set initial values
      calculatorState.update({
        totalWeight: 180,
        bodyFatPct: 20,
        leanMass: 144,
        fatMass: 36
      });

      // Change input mode
      const leanFatInput = container.querySelector('input[value="leanFat"]');
      leanFatInput.checked = true;
      leanFatInput.dispatchEvent(new Event('change'));

      // Verify values are cleared
      const state = calculatorState.getState();
      expect(state.totalWeight).toBeNull();
      expect(state.bodyFatPct).toBeNull();
      expect(state.leanMass).toBeNull();
      expect(state.fatMass).toBeNull();
    });
  });

  describe('Unit Selection', () => {
    beforeEach(() => {
      step1Module.attachListeners(container);
    });

    test('should update state on unit change', () => {
      const kgInput = container.querySelector('input[value="kg"]');
      kgInput.checked = true;
      kgInput.dispatchEvent(new Event('change'));

      expect(calculatorState.get('unit')).toBe('kg');
    });

    test('should handle invalid unit selection', () => {
      // Create invalid unit input
      const invalidInput = document.createElement('input');
      invalidInput.type = 'radio';
      invalidInput.name = 'unit';
      invalidInput.value = 'invalid';
      container.appendChild(invalidInput);

      invalidInput.checked = true;
      invalidInput.dispatchEvent(new Event('change'));

      // Should retain previous valid unit
      expect(calculatorState.get('unit')).toBe('lbs');
    });
  });

  describe('Validation', () => {
    test('should validate input mode selection', () => {
      calculatorState.set('inputMode', 'totalWeight');
      expect(step1Module.validate()).toBe(true);

      calculatorState.set('inputMode', 'invalid');
      expect(step1Module.validate()).toBe(false);
    });

    test('should require input mode selection', () => {
      calculatorState.set('inputMode', null);
      expect(step1Module.validate()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing DOM elements', () => {
      const emptyContainer = document.createElement('div');
      expect(() => {
        step1Module.attachListeners(emptyContainer);
      }).not.toThrow();
    });

    test('should handle invalid event data', () => {
      const event = new Event('change');
      expect(() => {
        step1Module.handleInputModeChange(event);
      }).not.toThrow();
    });
  });

  describe('State Integration', () => {
    test('should maintain state consistency across changes', () => {
      // Set initial state
      calculatorState.update({
        inputMode: 'totalWeight',
        unit: 'lbs',
        totalWeight: 180
      });

      // Change input mode
      const leanFatInput = container.querySelector('input[value="leanFat"]');
      leanFatInput.checked = true;
      leanFatInput.dispatchEvent(new Event('change'));

      // Change unit
      const kgInput = container.querySelector('input[value="kg"]');
      kgInput.checked = true;
      kgInput.dispatchEvent(new Event('change'));

      // Verify final state
      const finalState = calculatorState.getState();
      expect(finalState.inputMode).toBe('leanFat');
      expect(finalState.unit).toBe('kg');
      expect(finalState.totalWeight).toBeNull();
    });
  });
});