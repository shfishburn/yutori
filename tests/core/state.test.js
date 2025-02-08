/**
 * State Management Tests
 * 
 * @fileOverview Test suite for state management module
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-06
 * @updated 2024-02-06
 * @timestamp 19:35:22 UTC
 */

import calculatorState from '../../src/core/state.js';

describe('State Management Tests', () => {
  // Reset state before each test
  beforeEach(() => {
    calculatorState.reset();
  });

  describe('State Initialization', () => {
    test('should initialize with default values', () => {
      const state = calculatorState.getState();
      expect(state).toEqual({
        currentStep: 1,
        inputMode: 'totalWeight',
        unit: 'lbs',
        age: null,
        gender: 'male',
        totalWeight: null,
        bodyFatPct: null,
        activityLevel: 1.2,
        results: null
      });
    });
  });

  describe('State Updates', () => {
    test('should update valid values', () => {
      calculatorState.set('age', 25);
      expect(calculatorState.get('age')).toBe(25);
    });

    test('should reject invalid values', () => {
      const result = calculatorState.set('age', 15);
      expect(result).toBe(false);
      expect(calculatorState.get('age')).toBe(null);
    });

    test('should handle batch updates', () => {
      const updates = {
        age: 30,
        gender: 'female',
        unit: 'kg'
      };
      const result = calculatorState.update(updates);
      expect(result).toBe(true);
      
      const state = calculatorState.getState();
      expect(state.age).toBe(30);
      expect(state.gender).toBe('female');
      expect(state.unit).toBe('kg');
    });
  });

  describe('State Validation', () => {
    test('should validate age range', () => {
      expect(calculatorState.set('age', 20)).toBe(true);
      expect(calculatorState.set('age', 69)).toBe(true);
      expect(calculatorState.set('age', 19)).toBe(false);
      expect(calculatorState.set('age', 70)).toBe(false);
    });

    test('should validate weight values', () => {
      expect(calculatorState.set('totalWeight', 150)).toBe(true);
      expect(calculatorState.set('totalWeight', 0)).toBe(false);
      expect(calculatorState.set('totalWeight', 1000)).toBe(false);
    });

    test('should validate body fat percentage', () => {
      expect(calculatorState.set('bodyFatPct', 15)).toBe(true);
      expect(calculatorState.set('bodyFatPct', -1)).toBe(false);
      expect(calculatorState.set('bodyFatPct', 101)).toBe(false);
    });
  });

  describe('State History', () => {
    test('should track state changes', () => {
      calculatorState.set('age', 25);
      calculatorState.set('gender', 'female');
      
      const history = calculatorState.getHistory();
      expect(history.length).toBeGreaterThan(1);
      expect(history[history.length - 1].action).toBe('SET gender');
    });

    test('should allow rollback', () => {
      calculatorState.set('age', 25);
      const originalState = calculatorState.getState();
      
      calculatorState.set('age', 30);
      calculatorState.rollback();
      
      expect(calculatorState.getState()).toEqual(originalState);
    });
  });

  describe('Error Handling', () => {
    test('should log validation errors', () => {
      calculatorState.set('age', 15);
      const errorLog = calculatorState.getErrorLog();
      expect(errorLog.length).toBeGreaterThan(0);
      expect(errorLog[errorLog.length - 1].message).toContain('Validation failed');
    });
  });
});