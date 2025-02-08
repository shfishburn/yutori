/**
 * Template Management for Body Composition Calculator
 * Provides structured UI templates for each step.
 */

const calculatorTemplates = {
    step1: (state) => `
        <div class="wizard-step">
            <h2>Step 1: Input Method Selection</h2>
            <div class="form-group">
                <label>
                    <input type="radio" name="inputMode" value="leanFat" ${state.inputMode === "leanFat" ? "checked" : ""}>
                    Lean Mass & Fat Mass
                </label>
                <label>
                    <input type="radio" name="inputMode" value="totalWeight" ${state.inputMode === "totalWeight" ? "checked" : ""}>
                    Total Weight & Body Fat %
                </label>
            </div>
            <div class="button-row">
                <button data-action="next" class="project-button">Next</button>
            </div>
        </div>
    `,
    
    step2: (state) => `
        <div class="wizard-step">
            <h2>Step 2: Personal Information</h2>
            <div class="form-group">
                <label>Age:
                    <input type="number" name="age" value="${state.age || ''}" min="20" max="69" required>
                </label>
            </div>
            <div class="form-group">
                <label>Gender:
                    <select name="gender" required>
                        <option value="male" ${state.gender === "male" ? "selected" : ""}>Male</option>
                        <option value="female" ${state.gender === "female" ? "selected" : ""}>Female</option>
                    </select>
                </label>
            </div>
            <div class="button-row">
                <button data-action="back" class="project-button secondary">Back</button>
                <button data-action="next" class="project-button">Next</button>
            </div>
        </div>
    `,

    step3: (state) => `
        <div class="wizard-step">
            <h2>Step 3: Body Composition</h2>
            <div class="form-group">
                <label>Weight (${state.unit}):
                    <input type="number" name="totalWeight" value="${state.totalWeight || ''}" required>
                </label>
            </div>
            <div class="form-group">
                <label>Body Fat %:
                    <input type="number" name="bodyFatPct" value="${state.bodyFatPct || ''}" min="0" max="100" required>
                </label>
            </div>
            <div class="button-row">
                <button data-action="back" class="project-button secondary">Back</button>
                <button data-action="next" class="project-button">Next</button>
            </div>
        </div>
    `,

    step4: (state) => `
        <div class="wizard-step">
            <h2>Step 4: Activity Level</h2>
            <div class="form-group">
                <label>Activity Level:
                    <select name="activityLevel" required>
                        <option value="1.2" ${state.activityLevel === 1.2 ? "selected" : ""}>Sedentary</option>
                        <option value="1.375" ${state.activityLevel === 1.375 ? "selected" : ""}>Lightly Active</option>
                        <option value="1.55" ${state.activityLevel === 1.55 ? "selected" : ""}>Moderately Active</option>
                        <option value="1.725" ${state.activityLevel === 1.725 ? "selected" : ""}>Very Active</option>
                        <option value="1.9" ${state.activityLevel === 1.9 ? "selected" : ""}>Super Active</option>
                    </select>
                </label>
            </div>
            <div class="button-row">
                <button data-action="back" class="project-button secondary">Back</button>
                <button data-action="next" class="project-button">Calculate</button>
            </div>
        </div>
    `,

    step5: (state) => `
        <div class="wizard-step">
            <h2>Step 5: Results</h2>
            <p>Your estimated Total Daily Energy Expenditure (TDEE): ${state.results?.tdee || 'N/A'} kcal</p>
            <p>Your recommended daily protein intake: ${state.results?.protein || 'N/A'}g</p>
            <div class="button-row">
                <button data-action="back" class="project-button secondary">Back</button>
                <button data-action="reset" class="project-button">Restart</button>
            </div>
        </div>
    `
};

export default calculatorTemplates;
