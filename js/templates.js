// templates.js
class CalculatorTemplates {
  constructor(state) {
    this.state = state || {};
  }

  // Helper method to check if a value is selected
  _isSelected(name, value) {
    return this.state[name] === value ? 'checked' : '';
  }

  // Helper method to handle default or existing values
  _getValue(name, defaultValue = '') {
    return this.state[name] !== undefined ? this.state[name] : defaultValue;
  }

  step1() {
    return `
      <h2 class="project-title">Step 1: Mode & Units</h2>
      <div class="form-group">
        <div class="input-row">
          <label class="radio-label">
            <input type="radio" name="inputMode" value="leanFat" ${this._isSelected('inputMode', 'leanFat')}>
            <span>Lean/Fat mass</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="inputMode" value="weightBF" ${this._isSelected('inputMode', 'weightBF')}>
            <span>Weight + BF%</span>
          </label>
        </div>
        <div class="input-row">
          <label class="radio-label">
            <input type="radio" name="unit" value="lbs" ${this._isSelected('unit', 'lbs')}>
            <span>lbs</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="unit" value="kg" ${this._isSelected('unit', 'kg')}>
            <span>kg</span>
          </label>
        </div>
      </div>
      <div class="button-row">
        <button type="button" class="project-button" data-action="next">Next</button>
      </div>
    `;
  }

  step2() {
    return `
      <h2 class="project-title">Step 2: Age & Gender</h2>
      <div class="form-group">
        <label class="input-label">AGE (20-69)</label>
        <input type="number" name="age" min="20" max="69" value="${this._getValue('age')}" class="form-input" required>
        <div class="input-row">
          <label class="radio-label">
            <input type="radio" name="gender" value="female" ${this._isSelected('gender', 'female')}>
            <span>Female</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="gender" value="male" ${this._isSelected('gender', 'male')}>
            <span>Male</span>
          </label>
        </div>
      </div>
      <div class="button-row">
        <button type="button" class="project-button secondary" data-action="prev">Back</button>
        <button type="button" class="project-button" data-action="next">Next</button>
      </div>
    `;
  }

  step3() {
    const isLeanFatMode = this.state.inputMode === 'leanFat';
    return `
      <h2 class="project-title">Step 3: Composition</h2>
      <div class="form-group" id="leanFatInputs" style="display: ${isLeanFatMode ? 'block' : 'none'}">
        <label class="input-label">LEAN MASS</label>
        <input type="number" name="leanMass" value="${this._getValue('leanMass')}" class="form-input" step="0.1" ${isLeanFatMode ? 'required' : ''}>
        <label class="input-label">FAT MASS</label>
        <input type="number" name="fatMass" value="${this._getValue('fatMass')}" class="form-input" step="0.1" ${isLeanFatMode ? 'required' : ''}>
      </div>
      <div class="form-group" id="weightBFInputs" style="display: ${isLeanFatMode ? 'none' : 'block'}">
        <label class="input-label">TOTAL WEIGHT</label>
        <input type="number" name="totalWeight" value="${this._getValue('totalWeight')}" class="form-input" step="0.1" ${!isLeanFatMode ? 'required' : ''}>
        <label class="input-label">BODY FAT (%)</label>
        <input type="number" name="bodyFatPct" step="0.1" value="${this._getValue('bodyFatPct')}" class="form-input" ${!isLeanFatMode ? 'required' : ''}>
      </div>
      <div class="button-row">
        <button type="button" class="project-button secondary" data-action="prev">Back</button>
        <button type="button" class="project-button" data-action="next">Next</button>
      </div>
    `;
  }

  step4() {
    return `
      <h2 class="project-title">Step 4: Goals & Activity</h2>
      <div class="form-group">
        <label class="input-label">Weight Goal</label>
        <div class="input-row">
          <label class="radio-label">
            <input type="radio" name="weightGoal" value="lose" ${this._isSelected('weightGoal', 'lose')}>
            <span>Lose Weight</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="weightGoal" value="maintain" ${this._isSelected('weightGoal', 'maintain')}>
            <span>Maintain</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="weightGoal" value="gain" ${this._isSelected('weightGoal', 'gain')}>
            <span>Gain Lean Mass</span>
          </label>
        </div>

        <label class="input-label">Dietary Approach</label>
        <div class="input-row">
          <label class="radio-label">
            <input type="radio" name="dietaryApproach" value="low-carb" ${this._isSelected('dietaryApproach', 'low-carb')}>
            <span>Low-Carb</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="dietaryApproach" value="high-protein" ${this._isSelected('dietaryApproach', 'high-protein')}>
            <span>High-Protein</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="dietaryApproach" value="balanced" ${this._isSelected('dietaryApproach', 'balanced')}>
            <span>Balanced</span>
          </label>
        </div>

        <label class="input-label">Activity Level</label>
        <select name="activityLevel" class="form-input" required>
          <option value="1.2" ${this._isSelected('activityLevel', '1.2')}>Sedentary (1.2)</option>
          <option value="1.375" ${this._isSelected('activityLevel', '1.375')}>Light (1.375)</option>
          <option value="1.55" ${this._isSelected('activityLevel', '1.55')}>Moderate (1.55)</option>
          <option value="1.725" ${this._isSelected('activityLevel', '1.725')}>Very Active (1.725)</option>
          <option value="1.9" ${this._isSelected('activityLevel', '1.9')}>Extremely Active (1.9)</option>
        </select>

        <label class="input-label">Daily Calorie Adjustment</label>
        <input type="number" name="dailyAdjustment" value="${this._getValue('dailyAdjustment', 0)}" placeholder="-500, 0, +300" class="form-input">

        <label class="input-label">Lean Mass Change %</label>
        <input type="number" name="leanMassChange" value="${this._getValue('leanMassChange')}" placeholder="Lean Goal %" step="0.01" class="form-input">

        <label class="input-label">Body Fat Goal Range</label>
        <select name="fatGoalCategory" class="form-input" required>
          <option value="excellent" ${this._isSelected('fatGoalCategory', 'excellent')}>Excellent (10-15%)</option>
          <option value="good" ${this._isSelected('fatGoalCategory', 'good')}>Good (15-20%)</option>
          <option value="fair" ${this._isSelected('fatGoalCategory', 'fair')}>Fair (20-25%)</option>
        </select>
      </div>
      <div class="button-row">
        <button type="button" class="project-button secondary" data-action="prev">Back</button>
        <button type="button" class="project-button" data-action="calculate">Calculate</button>
      </div>
    `;
  }

  step5(results) {
    return `
      <h2 class="project-title">Your Results</h2>
      <div class="results-grid">
        <div class="result-card">
          <h3>Settings</h3>
          <div class="result-content">
            <p><strong>Goal:</strong> ${results.goalLabel}</p>
            <p><strong>Approach:</strong> ${results.approachLabel}</p>
            <p><strong>Activity:</strong> ${results.activityLabel}</p>
            <p><strong>Daily +/-:</strong> ${results.dailyAdjustment}</p>
            <p><strong>Lean Goal %:</strong> ${results.leanGoalPct}</p>
          </div>
        </div>
        <div class="result-card">
          <h3>Current</h3>
          <div class="result-content">
            <p><strong>Weight:</strong> ${results.currentWeight}</p>
            <p><strong>Fat Mass:</strong> ${results.currentFat}</p>
            <p><strong>Lean Mass:</strong> ${results.currentLean}</p>
            <p><strong>BF%:</strong> ${results.currentBF}</p>
          </div>
        </div>
        <div class="result-card">
          <h3>Goal Range</h3>
          <div class="result-content">
            <p><strong>Weight:</strong> ${results.goalWeight}</p>
            <p><strong>Fat Mass:</strong> ${results.goalFat}</p>
            <p><strong>Lean Mass:</strong> ${results.goalLean}</p>
            <p><strong>BF%:</strong> ${results.goalBF}</p>
          </div>
        </div>
      </div>
      <div class="result-card">
        <h3>Calories & Macros</h3>
        <div class="result-content">
          <p><strong>BMR:</strong> ${results.bmr}</p>
          <p><strong>TDEE:</strong> ${results.tdee}</p>
          <p><strong>Final Cals:</strong> ${results.finalCals}</p>
          <p><strong>Protein:</strong> ${results.protein}</p>
          <p><strong>Carbs:</strong> ${results.carbs}</p>
          <p><strong>Fat:</strong> ${results.fat}</p>
        </div>
      </div>
      <div class="button-row">
        <button type="button" class="project-button secondary" data-action="prev">Back</button>
        <button type="button" class="project-button" data-action="reset">Start Over</button>
      </div>
    `;
  }
}

// Export for use in other modules
export default CalculatorTemplates;