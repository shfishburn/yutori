const step5 = {
  attachListeners(root) {
    const resetButton = root.querySelector('[data-action="reset"]');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        calculatorState.reset();
        calculatorUI.updateDisplay();
      });
    }

    const shareButton = root.querySelector('#shareResults');
    if (shareButton) {
      shareButton.addEventListener('click', this.handleShare);
    }
  },

  handleShare() {
    const results = calculatorState.get('results');
    if (!results) return;

    const text = `Body Composition Results:
Weight: ${results.currentWeight.toFixed(1)} ${calculatorState.get('unit')}
Body Fat: ${results.currentBF}%
Daily Calories: ${results.finalCals}
Protein: ${results.macros.proteinGrams}g
Carbs: ${results.macros.carbsGrams}g
Fat: ${results.macros.fatGrams}g`;

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