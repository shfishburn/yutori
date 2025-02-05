// calculations.js
const calculatorCalculations = {
  // ... existing methods ...

  calculate() {
    try {
      // Input validation
      const requiredFields = {
        leanMass: 'Lean mass',
        fatMass: 'Fat mass',
        totalWeight: 'Total weight',
        bodyFatPct: 'Body fat percentage',
        activityLevel: 'Activity level'
      };

      for (const [field, label] of Object.entries(requiredFields)) {
        const value = calculatorState.get(field);
        if (!value && value !== 0) {
          throw new Error(`${label} is required`);
        }
      }

      // Range validation
      const { leanMass, fatMass } = this.getLeanFatMass();
      
      if (leanMass <= 0) {
        throw new Error('Lean mass must be greater than 0');
      }
      if (fatMass < 0) {
        throw new Error('Fat mass cannot be negative');
      }
      if (leanMass + fatMass > 1000) {
        throw new Error('Total weight exceeds reasonable limits');
      }

      // Perform calculations with error checking
      const currentWeight = leanMass + fatMass;
      const currentBF = (fatMass / currentWeight) * 100;

      if (currentBF > 100) {
        throw new Error('Body fat percentage calculation error');
      }

      const bmr = this.calculateBMR(leanMass);
      if (bmr < 500 || bmr > 5000) {
        throw new Error('BMR calculation outside reasonable range');
      }

      // ... rest of calculation logic ...

      return {
        // ... calculation results ...
      };
    } catch (error) {
      console.error('Calculation error:', error);
      calculatorUI.showError('calculation', `Calculation Error: ${error.message}`);
      return null;
    }
  },

  getLeanFatMass() {
    try {
      // ... existing logic ...
    } catch (error) {
      console.error('Mass calculation error:', error);
      throw new Error('Error calculating body composition');
    }
  }
};