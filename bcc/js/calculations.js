// calculations.js
const calculatorCalculations = {
  calculate() {
    try {
      const inputMode = calculatorState.get('inputMode');
      let leanMass, fatMass, currentWeight, currentBF;

      // Validate activity level first
      const activityLevel = calculatorState.get('activityLevel');
      if (!activityLevel) {
        throw new Error('Activity level is required');
      }

      // Handle different input modes
      if (inputMode === 'leanFat') {
        leanMass = parseFloat(calculatorState.get('leanMass'));
        fatMass = parseFloat(calculatorState.get('fatMass'));
        
        // Validate lean and fat mass
        if (!leanMass || leanMass <= 0) {
          throw new Error('Lean mass must be greater than 0');
        }
        if (fatMass < 0) {
          throw new Error('Fat mass cannot be negative');
        }
        if (leanMass + fatMass > 1000) {
          throw new Error('Total weight exceeds reasonable limits');
        }

        currentWeight = leanMass + fatMass;
        currentBF = (fatMass / currentWeight) * 100;
      } else {
        // Weight + BF% mode
        const totalWeight = parseFloat(calculatorState.get('totalWeight'));
        const bodyFatPct = parseFloat(calculatorState.get('bodyFatPct'));

        // Validate total weight and body fat percentage
        if (!totalWeight || totalWeight <= 0) {
          throw new Error('Total weight must be greater than 0');
        }
        if (!bodyFatPct || bodyFatPct < 0 || bodyFatPct > 100) {
          throw new Error('Body fat percentage must be between 0 and 100');
        }

        currentWeight = totalWeight;
        fatMass = currentWeight * (bodyFatPct / 100);
        leanMass = currentWeight - fatMass;
        currentBF = bodyFatPct;
      }

      // Body fat percentage sanity check
      if (currentBF > 100) {
        throw new Error('Body fat percentage calculation error');
      }

      // Calculate BMR
      const bmr = this.calculateBMR(leanMass);
      if (bmr < 500 || bmr > 5000) {
        throw new Error('BMR calculation outside reasonable range');
      }

      // Additional calculations (placeholder - replace with your actual logic)
      const tdee = this.calculateTDEE(bmr);
      const { protein, carbs, fat } = this.calculateMacros(currentWeight, leanMass);

      return {
        currentWeight: currentWeight.toFixed(1),
        currentLean: leanMass.toFixed(1),
        currentFat: fatMass.toFixed(1),
        currentBF: currentBF.toFixed(1),
        bmr: bmr.toFixed(0),
        tdee: tdee.toFixed(0),
        protein: protein.toFixed(0),
        carbs: carbs.toFixed(0),
        fat: fat.toFixed(0),
        // Add other relevant result fields
        goalLabel: calculatorState.get('weightGoal'),
        approachLabel: calculatorState.get('dietaryApproach'),
        activityLabel: this.getActivityLabel(calculatorState.get('activityLevel'))
      };
    } catch (error) {
      console.error('Calculation error:', error);
      calculatorUI.showError('calculation', `Calculation Error: ${error.message}`);
      return null;
    }
  },

  calculateBMR(leanMass) {
    // Implement your BMR calculation logic
    // This is a placeholder - replace with your actual formula
    return leanMass * 22;
  },

  calculateTDEE(bmr) {
    const activityLevel = parseFloat(calculatorState.get('activityLevel'));
    return bmr * activityLevel;
  },

  calculateMacros(currentWeight, leanMass) {
    // Implement your macro calculation logic
    // This is a placeholder - replace with your actual macro calculation
    return {
      protein: leanMass * 2.2,  // 2.2g per kg of lean mass
      carbs: currentWeight * 2,  // Adjust as needed
      fat: currentWeight * 0.5   // Adjust as needed
    };
  },

  getActivityLabel(activityLevel) {
    const activityLabels = {
      '1.2': 'Sedentary',
      '1.375': 'Light Activity',
      '1.55': 'Moderate Activity',
      '1.725': 'Very Active',
      '1.9': 'Extremely Active'
    };
    return activityLabels[activityLevel] || 'Unknown';
  },

  getLeanFatMass() {
    const inputMode = calculatorState.get('inputMode');
    
    if (inputMode === 'leanFat') {
      return {
        leanMass: parseFloat(calculatorState.get('leanMass')),
        fatMass: parseFloat(calculatorState.get('fatMass'))
      };
    } else {
      const totalWeight = parseFloat(calculatorState.get('totalWeight'));
      const bodyFatPct = parseFloat(calculatorState.get('bodyFatPct'));
      
      const fatMass = totalWeight * (bodyFatPct / 100);
      const leanMass = totalWeight - fatMass;
      
      return { leanMass, fatMass };
    }
  }
};