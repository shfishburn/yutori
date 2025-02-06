/**
 * Step 2 Module: Personal Information
 * Handles age and gender input for body composition calculator
 */
const step2Module = {
    /**
     * Attach event listeners for personal information inputs
     * @param {HTMLElement} [root] - Root element of the current step
     */
    attachListeners(root) {
      // Use document if no root provided for backward compatibility
      const container = root || document;
  
      // Age input listener
      const ageInput = container.querySelector('input[name="age"]');
      if (ageInput) {
        ageInput.addEventListener('input', this.handleAgeInput);
      }
  
      // Gender input listeners
      const genderInputs = container.querySelectorAll('input[name="gender"]');
      genderInputs.forEach(input => {
        input.addEventListener('change', this.handleGenderChange);
      });
    },
  
    /**
     * Sanitize and validate age input
     * @param {Event} e - Input event
     */
    handleAgeInput(e) {
      // Remove non-numeric characters
      let value = e.target.value.replace(/[^0-9]/g, '');
      
      // Validate age range
      if (value !== '') {
        const numValue = parseInt(value, 10);
        
        // Enforce age limits
        if (numValue < 20) value = '20';
        if (numValue > 69) value = '69';
      }
  
      // Update state
      calculatorState.update('age', value === '' ? null : parseInt(value, 10));
    },
  
    /**
     * Handle gender selection
     * @param {Event} e - Change event
     */
    handleGenderChange(e) {
      const selectedGender = e.target.value;
      
      // Update state with selected gender
      calculatorState.update('gender', selectedGender);
    }
  };
  
  // Explicitly attach to window to maintain compatibility with existing code
  window.step2 = step2Module;
  
  export default step2Module;