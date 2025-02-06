/**
 * Step 5 Module: Results Display
 * Handles results view and sharing functionality
 */
const step5 = {
    /**
     * Attach event listeners for the results page
     * @param {HTMLElement} root - Root element of the current step
     */
    attachListeners(root) {
      // Ensure root element is provided
      if (!root) return;
  
      // Reset button listener
      const resetButton = root.querySelector('[data-action="reset"]');
      if (resetButton) {
        resetButton.addEventListener('click', this.handleReset);
      }
  
      // Share results button listener
      const shareButton = root.querySelector('#shareResults');
      if (shareButton) {
        shareButton.addEventListener('click', this.handleShare);
      }
    },
  
    /**
     * Handle calculator reset
     */
    handleReset() {
      // Reset the calculator state
      calculatorState.reset();
      
      // Update the display to return to the first step
      calculatorUI.updateDisplay();
    },
  
    /**
     * Handle sharing of results
     */
    handleShare() {
      // Retrieve results from state
      const results = calculatorState.get('results');
      
      // Exit if no results are available
      if (!results) return;
  
      // Prepare shareable text
      const text = `Body Composition Results:
  Weight: ${results.currentWeight} ${calculatorState.get('unit')}
  Body Fat: ${results.bodyFatPct}%
  Daily Calories: ${results.finalCals}
  Protein: ${results.macros.protein}g
  Carbs: ${results.macros.carbs}g
  Fat: ${results.macros.fat}g`;
  
      // Attempt to share using native share API
      if (navigator.share) {
        navigator.share({
          title: 'My Body Composition Results',
          text: text
        }).catch(console.error);
      } 
      // Fallback to clipboard if native share is not supported
      else {
        navigator.clipboard.writeText(text)
          .then(() => alert('Results copied to clipboard!'))
          .catch(console.error);
      }
    }
  };
  
  // Explicitly attach to window to maintain compatibility with existing code
  window.step5 = step5;
  
  export default step5;