/**
 * @jest-environment jsdom
 */

describe('Calculator Wizard Recalculation', () => {
    beforeEach(() => {
      // Set up a minimal fixture with the key elements
      document.body.innerHTML = `
        <form id="calculatorForm" novalidate>
          <!-- Step 1 -->
          <div class="wizard-step active" id="step1">
            <input type="number" id="totalWeightInput" value="288" />
            <input type="number" id="bodyFatPctInput" value="36" />
            <input type="number" id="ageInput" value="62" />
            <input type="number" id="heightInput" value="72" />
            <button type="button" class="btn" data-next-step>Next</button>
          </div>
          <!-- Step 2 -->
          <div class="wizard-step" id="step2">
            <select id="activityLevelSelect" name="activity" required>
              <option value="1.2">Sedentary</option>
              <option value="1.55" selected>Moderate</option>
            </select>
            <select id="dailyAdjustmentSelect" name="deficit" required>
              <option value="-750" selected>Rapid Loss</option>
            </select>
            <select id="fatGoalCategorySelect" name="fatGoal" required>
              <option value="fitness" data-target-min="14" data-target-max="17" selected>General Fitness (14-17%)</option>
            </select>
            <button type="button" class="btn" data-prev-step>Back</button>
            <button type="button" class="btn" id="calculateButton">Calculate</button>
          </div>
          <!-- Step 3 -->
          <div class="wizard-step" id="step3">
            <div id="summaryTotalWeight">--</div>
            <button type="button" class="btn" data-prev-step>Back</button>
          </div>
        </form>
      `;
  
      // Manually dispatch DOMContentLoaded so calc.js event listeners (if attached on DOMContentLoaded) will run.
      document.dispatchEvent(new Event('DOMContentLoaded'));
    });
  
    // Helper: find the currently active wizard step
    const getActiveStepId = () => {
      const active = document.querySelector('.wizard-step.active');
      return active ? active.id : null;
    };
  
    test('navigates forward and then back to step1 and recalculates updated value', () => {
      const nextBtn = document.querySelector('[data-next-step]');
      const calcBtn = document.getElementById('calculateButton');
  
      // Step 1 → Step 2
      nextBtn.click();
      expect(getActiveStepId()).toBe('step2');
  
      // Step 2 → Step 3 (simulate calculation)
      calcBtn.click();
      expect(getActiveStepId()).toBe('step3');
  
      // Check that some result was rendered (summaryTotalWeight updated from default)
      const initialResult = document.getElementById('summaryTotalWeight').textContent;
      expect(initialResult).not.toBe('--');
  
      // Click Back on step3 to return to step2
      const backBtnStep3 = document.querySelector('#step3 [data-prev-step]');
      backBtnStep3.click();
      expect(getActiveStepId()).toBe('step2');
  
      // Then click Back on step2 to return to step1
      const backBtnStep2 = document.querySelector('#step2 [data-prev-step]');
      backBtnStep2.click();
      expect(getActiveStepId()).toBe('step1');
  
      // Change a value on step1 (e.g., update weight from 288 to 300)
      const weightInput = document.getElementById('totalWeightInput');
      weightInput.value = '300';
  
      // Navigate forward again to recalculate
      nextBtn.click(); // Step1 → Step2
      expect(getActiveStepId()).toBe('step2');
      calcBtn.click(); // Step2 → Step3
      expect(getActiveStepId()).toBe('step3');
  
      const updatedResult = document.getElementById('summaryTotalWeight').textContent;
      expect(updatedResult).not.toBe(initialResult);
    });
  
    test('updates calculation after user changes step2 values', () => {
      const nextBtn = document.querySelector('[data-next-step]');
      const calcBtn = document.getElementById('calculateButton');
  
      // Go to step2 and calculate first
      nextBtn.click(); // Step1 → Step2
      calcBtn.click();  // Step2 → Step3
      const initialResult = document.getElementById('summaryTotalWeight').textContent;
      expect(initialResult).not.toBe('--');
  
      // Navigate back to step2
      const backBtnStep3 = document.querySelector('#step3 [data-prev-step]');
      backBtnStep3.click();
      expect(getActiveStepId()).toBe('step2');
  
      // Change a value on step2 (e.g., update dailyAdjustmentSelect from -750 to -500)
      const deficitSelect = document.getElementById('dailyAdjustmentSelect');
      deficitSelect.value = '-500';
  
      // Navigate forward to recalc
      calcBtn.click();
      expect(getActiveStepId()).toBe('step3');
  
      const updatedResult = document.getElementById('summaryTotalWeight').textContent;
      expect(updatedResult).not.toBe(initialResult);
    });
  });
  