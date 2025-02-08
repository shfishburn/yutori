console.clear();
console.log('🔬 Running Comprehensive Test Suite with Baseline Reference');

// 1. Additional Test Scenarios
console.group('1️⃣ Additional Scenarios');
const testScenarios = [
  {
    name: 'Athletic Male',
    input: {
      age: 28,
      gender: 'male',
      totalMass: 180,
      bodyFat: 12,
      activityLevel: 1.725,
      unit: 'lbs'
    }
  },
  {
    name: 'Athletic Female',
    input: {
      age: 25,
      gender: 'female',
      totalMass: 63,
      bodyFat: 18,
      activityLevel: 1.725,
      unit: 'kg'
    }
  }
];

// 2. Edge Cases
console.group('2️⃣ Edge Cases');
const edgeCases = [
  {
    name: 'Minimum Values',
    input: {
      age: 20,
      gender: 'male',
      totalMass: 88,
      bodyFat: 3,
      activityLevel: 1.2,
      unit: 'lbs'
    }
  },
  {
    name: 'Maximum Values',
    input: {
      age: 69,
      gender: 'female',
      totalMass: 272,
      bodyFat: 60,
      activityLevel: 1.9,
      unit: 'kg'
    }
  }
];

// 3. Baseline Reference Test
console.group('3️⃣ Baseline Reference Test');
const baselineTest = {
  input: {
    age: 62,
    gender: 'male',
    totalMass: 290,
    bodyFat: 36,
    activityLevel: 1.55,
    unit: 'lbs'
  },
  expected: {
    composition: {
      leanMass: 185.6,
      fatMass: 104.4,
      bodyFatPercent: 36
    },
    energy: {
      bmr: 2193,
      tdee: 3399,
      deficit: 1000,
      netCalories: 2399
    },
    macros: {
      protein: { grams: 186, kcal: 744 },
      fat: { grams: 80, kcal: 720 },
      carbs: { grams: 234, kcal: 935 }
    }
  }
};

// 4. Error Handling Paths
console.group('4️⃣ Error Handling Tests');
const errorTests = [
  {
    name: 'Invalid Age',
    input: { age: 15 }
  },
  {
    name: 'Invalid Weight',
    input: { totalMass: 1000 }
  },
  {
    name: 'Invalid Body Fat',
    input: { bodyFat: 101 }
  }
];

// Execute Tests
async function runComprehensiveTests() {
  try {
    // Reset calculator state
    calculatorState.reset();
    
    // 1. Run Additional Scenarios
    console.group('Running Additional Scenarios');
    for (const scenario of testScenarios) {
      console.log(`Testing ${scenario.name}...`);
      calculatorState.update(scenario.input);
      step5Module.generateResults();
      const results = calculatorState.getState().results;
      console.log(`Results for ${scenario.name}:`, results);
      calculatorState.reset();
    }
    console.groupEnd();

    // 2. Test Edge Cases
    console.group('Testing Edge Cases');
    for (const edgeCase of edgeCases) {
      console.log(`Testing ${edgeCase.name}...`);
      calculatorState.update(edgeCase.input);
      step5Module.generateResults();
      const results = calculatorState.getState().results;
      console.log(`Results for ${edgeCase.name}:`, results);
      calculatorState.reset();
    }
    console.groupEnd();

    // 3. Run Baseline Reference Test
    console.group('Running Baseline Reference Test');
    calculatorState.update(baselineTest.input);
    step5Module.generateResults();
    const baselineResults = calculatorState.getState().results;
    
    // Compare with expected values
    const comparison = {
      composition: {
        leanMass: Math.abs(baselineResults.composition.conversions.leanMassLbs - baselineTest.expected.composition.leanMass) < 0.1,
        fatMass: Math.abs(baselineResults.composition.conversions.fatMassLbs - baselineTest.expected.composition.fatMass) < 0.1
      },
      energy: {
        bmr: Math.abs(baselineResults.energy.BMR - baselineTest.expected.energy.bmr) < 1,
        tdee: Math.abs(baselineResults.energy.TDEE - baselineTest.expected.energy.tdee) < 1
      },
      macros: {
        protein: Math.abs(baselineResults.macros.protein.grams - baselineTest.expected.macros.protein.grams) < 1,
        fat: Math.abs(baselineResults.macros.fat.grams - baselineTest.expected.macros.fat.grams) < 1,
        carbs: Math.abs(baselineResults.macros.carbs.grams - baselineTest.expected.macros.carbs.grams) < 1
      }
    };
    
    console.log('Baseline Comparison Results:', comparison);
    calculatorState.reset();
    console.groupEnd();

    // 4. Test Error Handling
    console.group('Testing Error Handling');
    for (const errorTest of errorTests) {
      console.log(`Testing ${errorTest.name}...`);
      const result = calculatorState.update(errorTest.input);
      console.log(`Error handling for ${errorTest.name}:`, !result ? 'Correctly rejected' : 'Failed to reject');
      calculatorState.reset();
    }
    console.groupEnd();

  } catch (error) {
    console.error('Test Suite Error:', error);
  }
}

// Run all tests
runComprehensiveTests().then(() => {
  console.log('✨ Comprehensive Test Suite Complete');
});