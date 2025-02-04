(function() {
  "use strict";

  // State management
  const state = {
    currentStep: 1,
    inputMode: 'weightBF',
    unit: 'lbs',
    gender: 'female',
    age: '',
    leanMass: '',
    fatMass: '',
    totalWeight: '',
    bodyFatPct: '',
    weightGoal: '',
    dietaryApproach: '',
    activityLevel: '1.55',
    dailyAdjustment: '',
    leanMassChange: '',
    fatGoalCategory: 'excellent'
  };

  // Templates for each step
  const templates = {
    step1: `
      <h2 class="project-title">Step 1: Mode & Units</h2>
      <div class="form-group">
        <div class="input-row">
          <label class="radio-label">
            <input type="radio" name="inputMode" value="leanFat" ${state.inputMode === 'leanFat' ? 'checked' : ''}>
            <span>Lean/Fat mass</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="inputMode" value="weightBF" ${state.inputMode === 'weightBF' ? 'checked' : ''}>
            <span>Weight + BF%</span>
          </label>
        </div>
        <div class="input-row">
          <label class="radio-label">
            <input type="radio" name="unit" value="lbs" ${state.unit === 'lbs' ? 'checked' : ''}>
            <span>lbs</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="unit" value="kg" ${state.unit === 'kg' ? 'checked' : ''}>
            <span>kg</span>
          </label>
        </div>
      </div>
      <div class="button-row">
        <button type="button" class="project-button" data-action="next">Next</button>
      </div>
    `,

    step2: `
      <h2 class="project-title">Step 2: Age & Gender</h2>
      <div class="form-group">
        <label class="input-label">AGE (20-69)</label>
        <input type="number" name="age" min="20" max="69" value="${state.age}" class="form-input">
        <div class="input-row">
          <label class="radio-label">
            <input type="radio" name="gender" value="female" ${state.gender === 'female' ? 'checked' : ''}>
            <span>Female</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="gender" value="male" ${state.gender === 'male' ? 'checked' : ''}>
            <span>Male</span>
          </label>
        </div>
      </div>
      <div class="button-row">
        <button type="button" class="project-button secondary" data-action="prev">Back</button>
        <button type="button" class="project-button" data-action="next">Next</button>
      </div>
    `,

    step3: `
      <h2 class="project-title">Step 3: Composition</h2>
      <div class="form-group" id="leanFatInputs" style="display: ${state.inputMode === 'leanFat' ? 'block' : 'none'}">
        <label class="input-label">LEAN MASS</label>
        <input type="number" name="leanMass" value="${state.leanMass}" class="form-input">
        <label class="input-label">FAT MASS</label>
        <input type="number" name="fatMass" value="${state.fatMass}" class="form-input">
      </div>
      <div class="form-group" id="weightBFInputs" style="display: ${state.inputMode === 'weightBF' ? 'block' : 'none'}">
        <label class="input-label">TOTAL WEIGHT</label>
        <input type="number" name="totalWeight" value="${state.totalWeight}" class="form-input">
        <label class="input-label">BODY FAT (%)</label>
        <input type="number" name="bodyFatPct" step="0.1" value="${state.bodyFatPct}" class="form-input">
      </div>
      <div class="button-row">
        <button type="button" class="project-button secondary" data-action="prev">Back</button>
        <button type="button" class="project-button" data-action="next">Next</button>
      </div>
    `,

    // Add templates for remaining steps...
  };

  // Validation functions
  const validators = {
    step1: () => true, // Basic mode selection always valid
    
    step2: () => {
      const age = parseInt(state.age);
      if (isNaN(age) || age < 20 || age > 69) {
        showError('age', 'Age must be between 20 and 69');
        return false;
      }
      return true;
    },

    step3: () => {
      if (state.inputMode === 'leanFat') {
        if (!state.leanMass || state.leanMass <= 0) {
          showError('leanMass', 'Invalid lean mass');
          return false;
        }
        if (!state.fatMass || state.fatMass < 0) {
          showError('fatMass', 'Invalid fat mass');
          return false;
        }
      } else {
        if (!state.totalWeight || state.totalWeight <= 0) {
          showError('totalWeight', 'Invalid weight');
          return false;
        }
        if (!state.bodyFatPct || state.bodyFatPct < 0 || state.bodyFatPct > 100) {
          showError('bodyFatPct', 'Body fat % must be between 0 and 100');
          return false;
        }
      }
      return true;
    }
  };

  // Event handlers
  function handleInputChange(e) {
    const { name, value, type } = e.target;
    state[name] = type === 'number' ? parseFloat(value) || '' : value;
    
    if (name === 'inputMode') {
      updateInputModeVisibility();
    }
    
    clearErrors();
  }

  function handleNavigation(e) {
    const action = e.target.dataset.action;
    if (action === 'next' && !validators[`step${state.currentStep}`]()) {
      return;
    }
    
    state.currentStep = action === 'next' ? 
      state.currentStep + 1 : 
      state.currentStep - 1;
    
    renderCurrentStep();
  }

  // UI updates
  function renderCurrentStep() {
    const root = document.getElementById('calculatorRoot');
    root.innerHTML = templates[`step${state.currentStep}`];
    
    // Attach event listeners
    root.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', handleInputChange);
    });
    
    root.querySelectorAll('button[data-action]').forEach(button => {
      button.addEventListener('click', handleNavigation);
    });
  }

  function updateInputModeVisibility() {
    const leanFatInputs = document.getElementById('leanFatInputs');
    const weightBFInputs = document.getElementById('weightBFInputs');
    if (leanFatInputs && weightBFInputs) {
      leanFatInputs.style.display = state.inputMode === 'leanFat' ? 'block' : 'none';
      weightBFInputs.style.display = state.inputMode === 'weightBF' ? 'block' : 'none';
    }
  }

  function showError(fieldName, message) {
    clearErrors();
    const input = document.querySelector(`[name="${fieldName}"]`);
    if (input) {
      input.classList.add('invalid-input');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }
  }

  function clearErrors() {
    document.querySelectorAll('.invalid-input').forEach(el => {
      el.classList.remove('invalid-input');
    });
    document.querySelectorAll('.error-message').forEach(el => {
      el.remove();
    });
  }

  // Initialize calculator
  function init() {
    renderCurrentStep();
  }

  // Start the calculator when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();