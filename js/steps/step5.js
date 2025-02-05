// step5.js
const step5 = {
  attachListeners() {
    // Handle reset button
    const resetButton = document.querySelector('button[data-action="reset"]');
    if (resetButton) {
      resetButton.addEventListener('click', this.handleReset);
    }
  },

  handleReset() {
    calculatorState.reset();
  },

  // Helper methods for formatting display values
  formatResult(value, type) {
    switch(type) {
      case 'percentage':
        return value + '%';
      case 'calories':
        return value.toLocaleString() + ' kcal';
      case 'weight':
        const unit = calculatorState.get('unit');
        return `${parseFloat(value).toFixed(1)} ${unit}`;
      default:
        return value;
    }
  },

  formatRange(low, high, type) {
    return `${this.formatResult(low, type)} - ${this.formatResult(high, type)}`;
  }
};