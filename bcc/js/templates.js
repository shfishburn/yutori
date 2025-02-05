const calculatorTemplates = {
  step1: () => `
    <div class="wizard-step">
      <h2>Input Method</h2>
      <div class="form-group">
        <div class="input-row">
          <label class="radio-label">
            <input type="radio" name="inputMode" value="leanFat" checked />
            Lean mass and fat mass
          </label>
          <label class="radio-label">
            <input type="radio" name="inputMode" value="totalBF" />
            Total weight and body fat %
          </label>
        </div>
        <div class="input-row">
          <label class="radio-label">
            <input type="radio" name="unit" value="lbs" checked />
            Pounds (lbs)
          </label>
          <label class="radio-label">
            <input type="radio" name="unit" value="kg" />
            Kilograms (kg)
          </label>
        </div>
      </div>
      <div class="button-row">
        <button class="project-button" data-action="next">Next</button>
      </div>
    </div>
  `,

  step2: () => `
    <div class="wizard-step">
      <h2>Basic Information</h2>
      <div class="form-group">
        <label class="input-label">Age</label>
        <input type="number" name="age" class="form-input" min="20" max="69" />
      </div>
      <div class="form-group">
        <div class="input-row">
          <label class="radio-label">
            <input type="radio" name="gender" value="male" checked />
            Male
          </label>
          <label class="radio-label">
            <input type="radio" name="gender" value="female" />
            Female
          </label>
        </div>
      </div>
      <div class="button-row">
        <button class="project-button secondary" data-action="prev">Back</button>
        <button class="project-button" data-action="next">Next</button>
      </div>
    </div>
  `,

  step3: (state) => `
    <div class="wizard-step">
      <h2>Body Composition</h2>
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" name="knownMetrics" ${state.knownMetrics ? 'checked' : ''} />
          I know my BMR/TDEE from health tracking
        </label>
      </div>

      ${state.knownMetrics ? `
        <div class="form-group">
          <label class="input-label">Measured BMR (calories)</label>
          <input type="number" name="measuredBMR" class="form-input" value="${state.measuredBMR || ''}" />
        </div>
        <div class="form-group">
          <label class="input-label">Measured TDEE (calories)</label>
          <input type="number" name="measuredTDEE" class="form-input" value="${state.measuredTDEE || ''}" />
        </div>
      ` : ''}

      ${state.inputMode === 'leanFat' ? `
        <div class="form-group">
          <label class="input-label">Lean Mass (${state.unit})</label>
          <input type="number" name="leanMass" class="form-input" step="0.1" />
        </div>
        <div class="form-group">
          <label class="input-label">Fat Mass (${state.unit})</label>
          <input type="number" name="fatMass" class="form-input" step="0.1" />
        </div>
      ` : `
        <div class="form-group">
          <label class="input-label">Total Weight (${state.unit})</label>
          <input type="number" name="totalWeight" class="form-input" step="0.1" />
        </div>
        <div class="form-group">
          <label class="input-label">Body Fat %</label>
          <input type="number" name="bodyFatPct" class="form-input" step="0.1" />
        </div>
      `}

      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" name="insulinResistance" ${state.insulinResistance ? 'checked' : ''} />
          Insulin Resistance
        </label>
      </div>

      <div class="button-row">
        <button class="project-button secondary" data-action="prev">Back</button>
        <button class="project-button" data-action="next">Next</button>
      </div>
    </div>
  `,

  step4: () => `
    <div class="wizard-step">
      <h2>Goals & Activity</h2>
      <div class="form-group">
        <label class="input-label">Weight Goal</label>
        <div class="input-row">
          <label class="radio-label">
            <input type="radio" name="weightGoal" value="lose" />
            Lose
          </label>
          <label class="radio-label">
            <input type="radio" name="weightGoal" value="maintain" checked />
            Maintain
          </label>
          <label class="radio-label">
            <input type="radio" name="weightGoal" value="gain" />
            Gain
          </label>
        </div>
      </div>

      <div class="form-group">
        <label class="input-label">Activity Level</label>
        <select name="activityLevel" class="form-input">
          <option value="1.2">Sedentary</option>
          <option value="1.375">Light Activity</option>
          <option value="1.55" selected>Moderate Activity</option>
          <option value="1.725">Very Active</option>
          <option value="1.9">Extremely Active</option>
        </select>
      </div>

      <div class="form-group">
        <label class="input-label">Active Energy (optional)</label>
        <input type="number" name="activeEnergy" class="form-input" />
      </div>

      <div class="form-group">
        <label class="input-label">Daily Calorie Adjustment</label>
        <input type="number" name="dailyAdjustment" class="form-input" value="0" />
      </div>

      <div class="button-row">
        <button class="project-button secondary" data-action="prev">Back</button>
        <button class="project-button" data-action="calculate">Calculate</button>
      </div>
    </div>
  `,

  step5: (results) => {
    if (!results) {
      return `
        <div class="wizard-step">
          <h2>Error</h2>
          <p>Failed to calculate results. Please try again.</p>
          <div class="button-row">
            <button class="project-button" data-action="reset">Start Over</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="wizard-step">
        <h2>Results</h2>
        <div class="results-grid">
          <div class="result-card">
            <h3>Current Composition</h3>
            <div class="result-content">
              <p>Weight: ${(results.currentWeight || 0).toFixed(1)} ${calculatorState.get('unit')}</p>
              <p>Lean Mass: ${(results.currentLean || 0).toFixed(1)} ${calculatorState.get('unit')}</p>
              <p>Body Fat: ${(results.currentBF || 0).toFixed(1)}%</p>
              <p>Category: ${results.currentBFCategory || 'N/A'}</p>
            </div>
          </div>

          <div class="result-card">
            <h3>Energy Requirements</h3>
            <div class="result-content">
              <p>BMR: ${results.bmr || 0} calories</p>
              <p>TDEE: ${results.tdee || 0} calories</p>
              <p>Target: ${results.finalCals || 0} calories</p>
            </div>
          </div>

          <div class="result-card">
            <h3>Macro Targets</h3>
            <div class="result-content">
              <p>Protein: ${results.macros?.proteinGrams || 0}g (${results.percentages?.protein || 0}%)</p>
              <p>Carbs: ${results.macros?.carbsGrams || 0}g (${results.percentages?.carbs || 0}%)</p>
              <p>Fat: ${results.macros?.fatGrams || 0}g (${results.percentages?.fat || 0}%)</p>
            </div>
          </div>
        </div>

        <div class="button-row">
          <button class="project-button" data-action="reset">New Calculation</button>
        </div>
      </div>
    `;
  }
};