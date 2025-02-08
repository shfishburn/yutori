/**
 * Input Field Component for Body Composition Calculator
 * 
 * @fileOverview Reusable input field component
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-06
 * @updated 2024-02-06
 * @timestamp 16:40:33 UTC
 * 
 * Changelog:
 * - Flexible input field generation
 * - Support for various input types
 * - Comprehensive attribute handling
 */

/**
 * Generate an input field HTML string
 * @param {Object} config - Input field configuration
 * @param {string} config.name - Input name attribute
 * @param {string} config.label - Input label text
 * @param {string} [config.type='text'] - Input type
 * @param {string|number} [config.value=''] - Input value
 * @param {Object} [config.attributes={}] - Additional HTML attributes
 * @returns {string} HTML input field string
 */
const InputField = (config) => {
    const {
      name,
      label,
      type = 'text',
      value = '',
      attributes = {}
    } = config;
  
    // Prepare additional attributes
    const attributeString = Object.entries({
      min: attributes.min,
      max: attributes.max,
      step: attributes.step,
      ...attributes
    })
      .filter(([, val]) => val !== undefined)
      .map(([key, val]) => `${key}="${val}"`)
      .join(' ');
  
    return `
      <div class="form-group">
        <label for="${name}" class="block mb-2">${label}</label>
        <input
          type="${type}"
          id="${name}"
          name="${name}"
          value="${value}"
          class="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          ${attributeString}
        >
      </div>
    `;
  };
  
  export default InputField;