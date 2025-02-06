// step1.js
const step1Module = {
  attachListeners(root) {
    if (!root) return;

    // Input mode listeners
    root.querySelectorAll('input[name="inputMode"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const newMode = e.target.value;
        calculatorState.update({
          inputMode: newMode,
          // Reset composition fields when mode changes
          leanMass: null,
          fatMass: null,
          totalWeight: null,
          bodyFatPct: null
        });
        calculatorUI.updateDisplay();
      });
    });

    // Unit conversion listeners
    root.querySelectorAll('input[name="unit"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const newUnit = e.target.value;
        const oldUnit = calculatorState.get('unit');
        
        const convertValue = (value) => {
          if (value === null || value === undefined) return null;
          return newUnit === 'kg' 
            ? Number((value * 0.453592).toFixed(2))
            : Number((value * 2.20462).toFixed(2));
        };

        const updates = { unit: newUnit };
        
        if (calculatorState.get('inputMode') === 'leanFat') {
          updates.leanMass = convertValue(calculatorState.get('leanMass'));
          updates.fatMass = convertValue(calculatorState.get('fatMass'));
        } else {
          updates.totalWeight = convertValue(calculatorState.get('totalWeight'));
        }

        calculatorState.update(updates);
        calculatorUI.updateDisplay();
      });
    });
  }
};