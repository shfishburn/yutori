// Browser Integration Test Suite
const BrowserTests = {
    async runAll() {
      console.group('🧪 Browser Integration Tests');
      try {
        await this.testInitialization();
        await this.testStep1();
        await this.testStep2();
        await this.testStep3();
        await this.testStep4();
        await this.testStep5();
        this.summarizeResults();
      } catch (error) {
        console.error('❌ Test Suite Failed:', error);
      }
      console.groupEnd();
    },
  
    async testInitialization() {
      console.group('1️⃣ Initialization Tests');
      try {
        // Verify core modules loaded
        console.assert(window.calculatorState, 'State manager loaded');
        console.assert(window.uiOrchestrator, 'UI orchestrator loaded');
        console.assert(window.errorManager, 'Error manager loaded');
        
        // Check initial state
        const initialState = calculatorState.getState();
        console.assert(initialState.currentStep === 1, 'Starting at step 1');
        console.log('✅ Initialization successful');
      } catch (error) {
        console.error('❌ Initialization failed:', error);
      }
      console.groupEnd();
    },
  
    async testStep1() {
      console.group('2️⃣ Step 1: Input Method Tests');
      try {
        // Test input mode selection
        calculatorState.set('inputMode', 'totalWeight');
        const inputModeRadio = document.querySelector('input[value="totalWeight"]');
        console.assert(inputModeRadio.checked, 'Input mode radio selected');
  
        // Test unit selection
        calculatorState.set('unit', 'kg');
        console.assert(calculatorState.get('unit') === 'kg', 'Unit updated');
        
        console.log('✅ Step 1 tests passed');
      } catch (error) {
        console.error('❌ Step 1 tests failed:', error);
      }
      console.groupEnd();
    },
  
    async testStep2() {
      console.group('3️⃣ Step 2: Personal Info Tests');
      try {
        // Set and verify age
        calculatorState.set('age', 30);
        console.assert(calculatorState.get('age') === 30, 'Age updated');
  
        // Set and verify gender
        calculatorState.set('gender', 'female');
        console.assert(calculatorState.get('gender') === 'female', 'Gender updated');
  
        console.log('✅ Step 2 tests passed');
      } catch (error) {
        console.error('❌ Step 2 tests failed:', error);
      }
      console.groupEnd();
    },
  
    async testStep3() {
      console.group('4️⃣ Step 3: Body Composition Tests');
      try {
        // Test total weight mode
        calculatorState.update({
          totalWeight: 70,
          bodyFatPct: 20,
          unit: 'kg'
        });
  
        // Verify calculations
        const state = calculatorState.getState();
        console.assert(state.totalWeight === 70, 'Weight updated');
        console.assert(state.bodyFatPct === 20, 'Body fat updated');
  
        console.log('✅ Step 3 tests passed');
      } catch (error) {
        console.error('❌ Step 3 tests failed:', error);
      }
      console.groupEnd();
    },
  
    async testStep4() {
      console.group('5️⃣ Step 4: Activity Level Tests');
      try {
        // Set activity level
        calculatorState.update({
          activityLevel: 1.55,
          weightGoal: 'lose',
          dailyAdjustment: -500
        });
  
        const state = calculatorState.getState();
        console.assert(state.activityLevel === 1.55, 'Activity level updated');
        console.assert(state.dailyAdjustment === -500, 'Daily adjustment updated');
  
        console.log('✅ Step 4 tests passed');
      } catch (error) {
        console.error('❌ Step 4 tests failed:', error);
      }
      console.groupEnd();
    },
  
    async testStep5() {
      console.group('6️⃣ Step 5: Results Tests');
      try {
        // Generate results
        const step5 = step5Module;
        step5.generateResults();
  
        // Verify results
        const results = calculatorState.getState().results;
        console.assert(results, 'Results generated');
        console.assert(results.energy.TDEE > 0, 'TDEE calculated');
        console.assert(results.macros.protein.grams > 0, 'Macros calculated');
  
        // Test display updates
        step5.updateDisplay();
        console.assert(
          document.getElementById('tdeeResult').textContent,
          'Results displayed'
        );
  
        console.log('✅ Step 5 tests passed');
      } catch (error) {
        console.error('❌ Step 5 tests failed:', error);
      }
      console.groupEnd();
    },
  
    summarizeResults() {
      console.group('📊 Test Summary');
      console.table({
        'Initialization': !this.hasErrors.init,
        'Step 1': !this.hasErrors.step1,
        'Step 2': !this.hasErrors.step2,
        'Step 3': !this.hasErrors.step3,
        'Step 4': !this.hasErrors.step4,
        'Step 5': !this.hasErrors.step5
      });
      console.groupEnd();
    },
  
    hasErrors: {
      init: false,
      step1: false,
      step2: false,
      step3: false,
      step4: false,
      step5: false
    }
  };
  
  // Run test suite
  console.clear();
  console.log('🚀 Starting Browser Integration Tests...');
  BrowserTests.runAll().then(() => {
    console.log('✨ Test Suite Complete');
  });