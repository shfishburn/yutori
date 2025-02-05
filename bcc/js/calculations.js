// templates.js - Step 1 Template
step1: () => `
  <h2 class="project-title">Step 1: Mode & Units</h2>
  <div class="form-group">
    <div class="input-row">
      <label class="radio-label">
        <input type="radio" name="inputMode" value="leanFat" 
          ${calculatorState.get('inputMode') === 'leanFat' ? 'checked' : ''}>
        <span>Lean/Fat mass</span>
      </label>
      <label class="radio-label">
        <input type="radio" name="inputMode" value="weightBF" 
          ${calculatorState.get('inputMode') === 'weightBF' ? 'checked' : ''}>
        <span>Weight + BF%</span>
      </label>
    </div>
    <div class="input-row">
      <label class="radio-label">
        <input type="radio" name="unit" value="lbs" 
          ${calculatorState.get('unit') === 'lbs' ? 'checked' : ''}>
        <span>lbs</span>
      </label>
      <label class="radio-label">
        <input type="radio" name="unit" value="kg" 
          ${calculatorState.get('unit') === 'kg' ? 'checked' : ''}>
        <span>kg</span>
      </label>
    </div>
  </div>
  <div class="button-row">
    <button type="button" class="project-button" data-action="next">Next</button>
  </div>
`

// step1.js - Add more robust unit conversion
const step1 = {
  attachListeners(root) {
    root.querySelectorAll('input[name="unit"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const newUnit = e.target.value;
        const oldUnit = calculatorState.get('unit');
        
        // Conversion factors
        const conversionFactors = {
          'lbs_to_kg': 0.453592,
          'kg_to_lbs': 2.20462
        };

        // Conversion logic for different input modes
        if (calculatorState.get('inputMode') === 'leanFat') {
          ['leanMass', 'fatMass'].forEach(field => {
            const currentValue = calculatorState.get(field);
            if (currentValue) {
              const convertedValue = oldUnit === 'lbs' 
                ? currentValue * conversionFactors.lbs_to_kg
                : currentValue * conversionFactors.kg_to_lbs;
              
              calculatorState.update(field, Number(convertedValue.toFixed(2)));
            }
          });
        } else {
          ['totalWeight', 'bodyFatPct'].forEach(field => {
            const currentValue = calculatorState.get(field);
            if (currentValue && field !== 'bodyFatPct') {
              const convertedValue = oldUnit === 'lbs'
                ? currentValue * conversionFactors.lbs_to_kg
                : currentValue * conversionFactors.kg_to_lbs;
              
              calculatorState.update(field, Number(convertedValue.toFixed(2)));
            }
          });
        }

        // Update unit in state
        calculatorState.update('unit', newUnit);
        
        // Trigger display update to reflect changes
        calculatorUI.updateDisplay();
      });
    });
  }
};

// templates.js - Step 3 Template
step3: () => {
  const isLeanFatMode = calculatorState.get('inputMode') === 'leanFat';
  const unit = calculatorState.get('unit');
  
  return `
    <h2 class="project-title">Step 3: Composition</h2>
    <div class="form-group" id="leanFatInputs" style="display: ${isLeanFatMode ? 'block' : 'none'}">
      <label class="input-label">LEAN MASS (${unit})</label>
      <input type="number" name="leanMass" 
        value="${calculatorState.get('leanMass') || ''}" 
        class="form-input" step="0.1">
      <label class="input-label">FAT MASS (${unit})</label>
      <input type="number" name="fatMass" 
        value="${calculatorState.get('fatMass') || ''}" 
        class="form-input" step="0.1">
    </div>
    <div class="form-group" id="weightBFInputs" style="display: ${isLeanFatMode ? 'none' : 'block'}">
      <label class="input-label">TOTAL WEIGHT (${unit})</label>
      <input type="number" name="totalWeight" 
        value="${calculatorState.get('totalWeight') || ''}" 
        class="form-input" step="0.1">
      <label class="input-label">BODY FAT (%)</label>
      <input type="number" name="bodyFatPct" 
        step="0.1" 
        value="${calculatorState.get('bodyFatPct') || ''}" 
        class="form-input">
    </div>
    <div class="button-row">
      <button type="button" class="project-button secondary" data-action="prev">Back</button>
      <button type="button" class="project-button" data-action="next">Next</button>
    </div>
  `;
}