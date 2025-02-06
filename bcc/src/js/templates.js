/**
 * Step 5 Module: Results Display
 * Handles results view and sharing functionality
 */
const step5 = {
    /**
     * Attach event listeners for results page
     * @param {HTMLElement} root - Root element of the current step
     */
    attachListeners(root) {
      // Reset button
      const resetButton = root.querySelector('[data-action="reset"]');
      if (resetButton) {
        resetButton.addEventListener('click', () => {
          calculatorState.reset();
          calculatorUI.updateDisplay();
        });
      }
  
      // Share results button
      const shareButton = root.querySelector('#shareResults');
      if (shareButton) {
        shareButton.addEventListener('click', this.handleShare);
      }
    },
  
    /**
     * Handle sharing of results
     */
    handleShare() {
      const results = calculatorState.get('results');
      if (!results) return;
  
      // Prepare shareable text
      const text = `Body Composition Results:
  Weight: ${results.currentWeight.toFixed(1)} ${calculatorState.get('unit')}
  Body Fat: ${results.currentBF}%
  Daily Calories: ${results.finalCals}
  Protein: ${results.macros.proteinGrams}g
  Carbs: ${results.macros.carbsGrams}g
  Fat: ${results.macros.fatGrams}g`;
  
      // Share via native share API or fallback to clipboard
      if (navigator.share) {
        navigator.share({
          title: 'My Body Composition Results',
          text: text
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(text)
          .then(() => alert('Results copied to clipboard!'))
          .catch(console.error);
      }
    }
  };