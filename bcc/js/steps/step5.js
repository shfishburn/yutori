// step5.js
const step5 = {
  attachListeners(root) {
    console.log('Attaching listeners to step 5');
    
    // New Scenario / Reset button
    const resetButton = root.querySelector('[data-action="reset"]');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        calculatorState.reset();
        calculatorUI.updateDisplay();
      });
    }

    // Additional step 5 specific listeners can be added here
    const newScenarioBtn = root.querySelector('#newScenarioBtn');
    if (newScenarioBtn) {
      newScenarioBtn.addEventListener('click', () => {
        calculatorState.reset();
        calculatorUI.updateDisplay();
      });
    }

    // Disclaimer link
    const disclaimerLink = root.querySelector('#disclaimerLink');
    if (disclaimerLink) {
      disclaimerLink.addEventListener('click', () => {
        const disclaimerModal = document.getElementById('disclaimerModal');
        if (disclaimerModal) {
          disclaimerModal.style.display = 'block';
        }
      });
    }
  }
};