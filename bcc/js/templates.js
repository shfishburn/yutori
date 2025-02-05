// templates.js
const calculatorTemplates = {
  step1: () => `
    <h2 class="project-title">Step 1: Mode & Units</h2>
    <div class="form-group">
      <div class="input-row">
        <label class="radio-label">
          <input type="radio" name="inputMode" value="leanFat" ${calculatorState.get('inputMode') === 'leanFat' ? 'checked' : ''}>
          <span>Lean/Fat mass</span>
        </label>
        <label class="radio-label">
          <input type="radio" name="inputMode" value="weightBF" ${calculatorState.get('inputMode') === 'weightBF' ? 'checked' : ''}>
          <span>Weight + BF%</span>
        </label>
      </div>
      <div class="input-row">
        <label class="radio-label">
          <input type="radio" name="unit" value="lbs" ${calculatorState.get('unit') === 'lbs' ? 'checked' : ''}>
          <span>lbs</span>
        </label>
        <label class="radio-label">
          <input type="radio" name="unit" value="kg" ${calculatorState.get('unit') === 'kg' ? 'checked' : ''}>
          <span>kg</span>
        </label>
      </div>
    </div>
    <div class="button-row">
      <button type="button" class="project-button" data-action="next">Next</button>
    </div>
  `,

  step2: () => `
    <h2 class="project-title">Step 2: Age & Gender</h2>
    <div class="form-group">
      <label class="input-label">AGE (20-69)</label>
      <input type="number" name="age" min="20" max="69" value="${calculatorState.get('age')}" class="form-input">
      <div class="input-row">
        <label class="radio-label">
          <input type="radio" name="gender" value="female" ${calculatorState.get('gender') === 'female' ? 'checked' : ''}>
          <span>Female</span>
        </label>
        <label class="radio-label">
          <input type="radio" name="gender" value="male" ${calculatorState.get('gender') === 'male' ? 'checked' : ''}>
          <span>Male</span>
        </label>
      </div>
    </div>
    <div class="button-row">
      <button type="button" class="project-button secondary" data-action="prev">Back</button>
      <button type="button" class="project-button" data-action="next">Next</button>
    </div>
  `,

  step3: () => {
    const isLeanFatMode = calculatorState.get('inputMode') === 'leanFat';
    return `
      <h2 class="project-title">Step 3: Composition</h2>
      <div class="form-group" id="leanFatInputs" style="display: ${isLeanFatMode ? 'block' : 'none'}">
        <label class="input-label">LEAN MASS</label>
        <input type="number" name="leanMass" value="${calculatorState.get('leanMass') || ''}" class="form-input" step="0.1">
        <label class="input-label">FAT MASS</label>
        <input type="number" name="fatMass" value="${calculatorState.get('fatMass') || ''}" class="form-input" step="0.1">
      </div>
      <div class="form-group" id="weightBFInputs" style="display: ${isLeanFatMode ? 'none' : 'block'}">
        <label class="input-label">TOTAL WEIGHT</label>
        <input type="number" name="totalWeight" value="${calculatorState.get('totalWeight') || ''}" class="form-input" step="0.1">
        <label class="input-label">BODY FAT (%)</label>
        <input type="number" name="bodyFatPct" step="0.1" value="${calculatorState.get('bodyFatPct') || ''}" class="form-input">
      </div>
      <div class="button-row">
        <button type="button" class="project-button secondary" data-action="prev">Back</button>
        <button type="button" class="project-button" data-action="next">Next</button>
      </div>
    `;
  },

  step4: () => `
    <h2 class="project-title">Step 4: Goals & Activity</h2>
    <div class="form-group">
      <label class="input-label">Weight Goal</label>
      <div class="input-row">
        <label class="radio-label">
          <input type="radio" name="weightGoal" value="lose" ${calculatorState.get('weightGoal') === 'lose' ? 'checked' : ''}>
          <span>Lose Weight</span>
        </label>
        <label class="radio-label">
          <input type="radio" name="weightGoal" value="maintain" ${calculatorState.get('weightGoal') === 'maintain' ? 'checked' : ''}>
          <span>Maintain</span>
        </label>
        <label class="radio-label">
          <input type="radio" name="weightGoal" value="gain" ${calculatorState.get('weightGoal') === 'gain' ? 'checked' : ''}>
          <span>Gain Lean Mass</span>
        </label>
      </div>

      <label class="input-label">Dietary Approach</label>
      <div class="input-row">
        <label class="radio-label">
          <input type="radio" name="dietaryApproach" value="low-carb" ${calculatorState.get('dietaryApproach') === 'low-carb' ? 'checked' : ''}>
          <span>Low-Carb</span>
        </label>
        <label class="radio-label">
          <input type="radio" name="dietaryApproach" value="high-protein" ${calculatorState.get('dietaryApproach') === 'high-protein' ? 'checked' : ''}>
          <span>High-Protein</span>
        </label>
        <label class="radio-label">
          <input type="radio" name="dietaryApproach" value="balanced" ${calculatorState.get('dietaryApproach') === 'balanced' ? 'checked' : ''}>
          <span>Balanced</span>
        </label>
      </div>

      <label class="input-label">Activity Level</label>
      <select name="activityLevel" class="form-input">
        <option value="1.2" ${calculatorState.get('activityLevel') === '1.2' ? 'selected' : ''}>Sedentary (1.2)</option>
        <option value="1.375" ${calculatorState.get('activityLevel') === '1.375' ? 'selected' : ''}>Light (1.375)</option>
        <option value="1.55" ${calculatorState.get('activityLevel') === '1.55' ? 'selected' : ''}>Moderate (1.55)</option>
        <option value="1.725" ${calculatorState.get('activityLevel') === '1.725' ? 'selected' : ''}>Very Active (1.725)</option>
        <option value="1.9" ${calculatorState.get('activityLevel') === '1.9' ? 'selected' : ''}>Extremely Active (1.9)</option>
      </select>

      <label class="input-label">Daily Calorie Adjustment</label>
      <input type="number" name="dailyAdjustment" value="${calculatorState.get('dailyAdjustment')}" placeholder="-500, 0, +300" class="form-input">

      <label class="input-label">Lean Mass Change %</label>
      <input type="number" name="leanMassChange" value="${calculatorState.get('leanMassChange') || ''}" placeholder="Lean Goal %" step="0.01" class="form-input">

      <label class="input-label">Body Fat Goal Range</label>
      <select name="fatGoalCategory" class="form-input">
        <option value="excellent" ${calculatorState.get('fatGoalCategory') === 'excellent' ? 'selected' : ''}>Excellent (10-15%)</option>
        <option value="good" ${calculatorState.get('fatGoalCategory') === 'good' ? 'selected' : ''}>Good (15-20%)</option>
        <option value="fair" ${calculatorState.get('fatGoalCategory') === 'fair' ? 'selected' : ''}>Fair (20-25%)</option>
      </select>
    </div>
    <div class="button-row">
      <button type="button" class="project-button secondary" data-action="prev">Back</button>
      <button type="button" class="project-button" data-action="calculate">Calculate</button>
    </div>
  `,

  step5: () => {
    const results = calculatorState.get('results');
    if (!results) {
      return `
        <div class="error-message">
          <p>No calculation results available. Please complete all steps.</p>
          <button type="button" class="project-button" data-action="reset">Start Over</button>
        </div>
      `;
    }

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
        <button type="button" class="project-button" data-action="reset">Start Over</button>
      </div>
    `;
  }
};