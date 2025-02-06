/**
 * Step 3 Module: Body Composition Input
 * Handles body composition measurements and known metrics
 */
const step3Module = {
    /**
     * Attach event listeners for body composition inputs
     * @param {HTMLElement} [root] - Root element of the current step
     */
    attachListeners(root) {
      // Use document if no root provided for backward compatibility
      const container = root || document;
  
      // Known metrics checkbox listener
      const knownMetricsCheck = container.querySelector('input[name="knownMetrics"]');
      if (knownMetricsCheck) {
        knownMetricsCheck.addEventListener('change', this.handleKnownMetricsChange);
      }
  
      // Insulin resistance checkbox listener
      const insulinResistanceCheck = container.querySelector('input[name="insulinResistance"]');
      if (insulinResistanceCheck) {
        insulinResistanceCheck.addEventListener('change', this.handleInsRChange);
      }
  
      // Determine input mode and attach appropriate listeners
      const inputMode = calculatorState.get('inputMode');
      if (inputMode === 'leanFat') {
        this.attachLeanFatListeners(container);
      } else {
        this.attachTotalBFListeners(container);
      }
    },
  
    /**
     * Handle known metrics checkbox change
     * @param {Event} e - Change event
     */
    handleKnownMetricsChange(e) {
      const isChecked = e.target.checked;
      
      // Update state and refresh display
      calculatorState.update({
        knownMetrics: isChecked,
        // Reset measured metrics when unchecked
        measuredBMR: isChecked ? calculatorState.get('measuredBMR') : null,
        measuredTDEE: isChecked ? calculatorState.get('measuredTDEE') : null
      });
      
      calculatorUI.updateDisplay();
    },
  
    /**
     * Attach listeners for lean mass and fat mass inputs
     * @param {HTMLElement} container - Container element
     */
    attachLeanFatListeners(container) {
      ['leanMass', 'fatMass'].forEach(field => {
        const input = container.querySelector(`input[name="${field}"]`);
        if (input) {
          input.addEventListener('input', (e) => {
            // Sanitize input to allow only numbers and decimal point
            let value = e.target.value.replace(/[^\d.]/g, '');
            
            // Limit to two decimal places
            const parts = value.split('.');
            if (parts.length > 2) {
              value = parts[0] + '.' + parts.slice(1).join('');
            }
            
            // Limit maximum value
            if (value !== '' && parseFloat(value) > 500) {
              value = '500';
            }
            
            // Update state
            calculatorState.update(field, value === '' ? null : parseFloat(value));
          });
        }
      });
    },
  
    /**
     * Attach listeners for total weight and body fat percentage inputs
     * @param {HTMLElement} container - Container element
     */
    attachTotalBFListeners(container) {
      // Total weight input
      const weightInput = container.querySelector('input[name="totalWeight"]');
      if (weightInput) {
        weightInput.addEventListener('input', (e) => {
          // Sanitize input to allow only numbers and decimal point
          let value = e.target.value.replace(/[^\d.]/g, '');
          
          // Limit maximum value
          if (value !== '' && parseFloat(value) > 1000) {
            value = '1000';
          }
          
          // Update state
          calculatorState.update('totalWeight', value === '' ? null : parseFloat(value));
        });
      }
  
      // Body fat percentage input
      const bfInput = container.querySelector('input[name="bodyFatPct"]');
      if (bfInput) {
        bfInput.addEventListener('input', (e) => {
          // Sanitize input to allow only numbers and decimal point
          let value = e.target.value.replace(/[^\d.]/g, '');
          
          // Limit maximum value
          if (value !== '' && parseFloat(value) > 100) {
            value = '100';
          }
          
          // Update state
          calculatorState.update('bodyFatPct', value === '' ? null : parseFloat(value));
        });
      }
    },
  
    /**
     * Handle insulin resistance checkbox change
     * @param {Event} e - Change event
     */
    handleInsRChange(e) {
      // Update state with insulin resistance status
      calculatorState.update('insulinResistance', e.target.checked);
    }
  };
  
  // Explicitly attach to window to maintain compatibility with existing code
  window.step3 = step3Module;
  
  export default step3Module;