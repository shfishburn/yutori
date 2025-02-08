/**
 * Action Button Component for Body Composition Calculator
 * 
 * @fileOverview Reusable action button component
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-06
 * @updated 2024-02-06
 * @timestamp 16:35:12 UTC
 * 
 * Changelog:
 * - Flexible action button generation
 * - Support for custom classes and attributes
 */

/**
 * Generate an action button HTML string
 * @param {Object} config - Button configuration
 * @param {string} config.action - Data action attribute
 * @param {string} config.label - Button text
 * @param {string} [config.classes=''] - Additional CSS classes
 * @param {Object} [config.attributes={}] - Additional HTML attributes
 * @returns {string} HTML button string
 */
const ActionButton = (config) => {
    const {
      action, 
      label, 
      classes = '', 
      attributes = {}
    } = config;
  
    // Prepare additional attributes
    const attributeString = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  
    return `
      <button 
        data-action="${action}"
        class="px-4 py-2 rounded transition-all duration-200 ${classes}"
        ${attributeString}
      >
        ${label}
      </button>
    `;
  };
  
  export default ActionButton;