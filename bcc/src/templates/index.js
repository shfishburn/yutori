/**
 * Template Management for Body Composition Calculator
 * 
 * @fileOverview Centralized template rendering and management
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-06
 * @updated 2024-02-06
 * @timestamp 16:17:55 UTC
 * 
 * Changelog:
 * - Centralized template management
 * - Dynamic template rendering
 * - Flexible state-driven templates
 */

import ActionButton from './components/action-button.js';
import InputField from './components/input-field.js';

const calculatorTemplates = {
  /**
   * Step 1 Template: Input Method Selection
   * @param {Object} state - Current application state
   * @returns {string} HTML template
   */
  step1: (state) => `
    <div class="wizard-step">
      <h2 class="text-2xl font-bold mb-4">Step 1: Input Method</h2>
      
      <div class="form-group mb-4">
        <label class="block mb-2">Select Input Method:</label>
        <div class="space-y-2">
          <label class="flex items-center">
            <input 
              type="radio" 
              name="inputMode" 
              value="leanFat" 
              class="mr-2"
              ${state.inputMode === 'leanFat' ? 'checked' : ''}
            >
            Lean Mass & Fat Mass
          </label>
          <label class="flex items-center">
            <input 
              type="radio" 
              name="inputMode" 
              value="totalWeight" 
              class="mr-2"
              ${state.inputMode === 'totalWeight' ? 'checked' : ''}
            >
            Total Weight & Body Fat %
          </label>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        ${ActionButton({ 
          action: 'next', 
          label: 'Next', 
          classes: 'bg-primary text-white' 
        })}
      </div>
    </div>
  `,

  /**
   * Step 2 Template: Personal Information
   * @param {Object} state - Current application state
   * @returns {string} HTML template
   */
  step2: (state) => `
    <div class="wizard-step">
      <h2 class="text-2xl font-bold mb-4">Step 2: Personal Details</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${InputField({
          name: 'age', 
          label: 'Age', 
          type: 'number', 
          value: state.age || '',
          min: 20,
          max: 69
        })}

        <div class="form-group">
          <label class="block mb-2">Gender</label>
          <select name="gender" class="w-full border p-2 rounded">
            <option 
              value="male" 
              ${state.gender === 'male' ? 'selected' : ''}
            >
              Male
            </option>
            <option 
              value="female" 
              ${state.gender === 'female' ? 'selected' : ''}
            >
              Female
            </option>
          </select>
        </div>
      </div>

      <div class="flex justify-between mt-6">
        ${ActionButton({ 
          action: 'back', 
          label: 'Back', 
          classes: 'bg-secondary text-gray-700' 
        })}
        ${ActionButton({ 
          action: 'next', 
          label: 'Next', 
          classes: 'bg-primary text-white' 
        })}
      </div>
    </div>
  `,

  // Additional step templates would follow the same pattern
  step3: (state) => `
    <div class="wizard-step">
      <h2 class="text-2xl font-bold mb-4">Step 3: Body Composition</h2>
      
      ${state.inputMode === 'totalWeight' 
        ? `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${InputField({
              name: 'totalWeight', 
              label: `Total Weight (${state.unit})`, 
              type: 'number',
              value: state.totalWeight || '',
              min: 0,
              max: 500
            })}
            ${InputField({
              name: 'bodyFatPct', 
              label: 'Body Fat Percentage', 
              type: 'number',
              value: state.bodyFatPct || '',
              min: 0,
              max: 100
            })}
          </div>
        `
        : `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${InputField({
              name: 'leanMass', 
              label: `Lean Mass (${state.unit})`, 
              type: 'number',
              value: state.leanMass || '',
              min: 0,
              max: 300
            })}
            ${InputField({
              name: 'fatMass', 
              label: `Fat Mass (${state.unit})`, 
              type: 'number',
              value: state.fatMass || '',
              min: 0,
              max: 300
            })}
          </div>
        `
      }

      <div class="flex justify-between mt-6">
        ${ActionButton({ 
          action: 'back', 
          label: 'Back', 
          classes: 'bg-secondary text-gray-700' 
        })}
        ${ActionButton({ 
          action: 'next', 
          label: 'Next', 
          classes: 'bg-primary text-white' 
        })}
      </div>
    </div>
  `,

  // Remaining steps would be implemented similarly
};

// Attach to window for global access
if (typeof window !== 'undefined') {
  window.calculatorTemplates = calculatorTemplates;
}

export default calculatorTemplates;