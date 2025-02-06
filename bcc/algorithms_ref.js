//Baseline reference and validation method. Use validateAgainstBaseline() to verify calculations match expected values.



const bodyCompReference = {
  // Unit conversion constants
  KG_TO_LBS: 2.20462,
  LBS_TO_KG: 0.453592,

  // Baseline reference case for validation
  BASELINE_REFERENCE: {
    input: {
      age: 62,
      gender: 'male',
      totalMass: 290,  // lbs
      bodyFat: 36,     // percent
      activityLevel: 1.55,
      unit: 'lbs'
    },
    expected: {
      composition: {
        leanMass: 185.6,   // lbs
        fatMass: 104.4,    // lbs
        bodyFatPercent: 36
      },
      energy: {
        bmr: 2193,         // kcal
        tdee: 3399,        // kcal
        deficit: 1000,     // kcal
        netCalories: 2399  // kcal
      },
      macros: {
        protein: { grams: 186, kcal: 744 },
        fat: { grams: 80, kcal: 720 },
        carbs: { grams: 234, kcal: 935 }
      },
      goals: {
        targetBodyFat: 18, // percent 
        targetMass: 238.5, // lbs
        weeklyLoss: 2,     // lbs
        weeksToGoal: 26
      }
    }
  },

  calculateComposition(totalMass, bodyFatPercent, unit = 'lbs') {
    const massKg = unit === 'kg' ? totalMass : totalMass * this.LBS_TO_KG;
    const fatMassKg = massKg * (bodyFatPercent / 100);
    const leanMassKg = massKg - fatMassKg;

    return {
      leanMassKg,
      fatMassKg,
      totalMassKg: massKg,
      bodyFatPercent
    };
  },

  calculateEnergy(leanMassKg, activityLevel) {
    const BMR = 370 + (21.6 * leanMassKg);
    const TDEE = BMR * activityLevel;
    return { BMR, TDEE };
  },

  calculateMacros(calories, leanMassKg, approach = 'balanced', hasInsulinResistance = false) {
    // Protein based on lean mass
    const proteinGrams = leanMassKg * 2.2;
    const proteinKcal = proteinGrams * 4;
    
    const remainingKcal = calories - proteinKcal;
    let carbRatio = hasInsulinResistance ? 0.2 : 0.5;
    
    switch(approach) {
      case 'low-carb': carbRatio = 0.2; break;
      case 'high-protein': carbRatio = 0.6; break;
    }

    const carbKcal = remainingKcal * carbRatio;
    const fatKcal = remainingKcal * (1 - carbRatio);

    return {
      protein: {
        grams: Math.round(proteinGrams),
        kcal: Math.round(proteinKcal)
      },
      carbs: {
        grams: Math.round(carbKcal / 4),
        kcal: Math.round(carbKcal)
      },
      fat: {
        grams: Math.round(fatKcal / 9),
        kcal: Math.round(fatKcal)
      }
    };
  },

  projectGoals(currentMass, currentBF, targetBF, calorieDeficit) {
    const weeklyDeficit = calorieDeficit * 7;
    const weeklyLoss = weeklyDeficit / 3500; // lbs per week
    const targetMass = currentMass * (1 - (currentBF - targetBF) / 100);
    const weeksToGoal = (currentMass - targetMass) / weeklyLoss;

    return {
      targetMass,
      weeklyLoss,
      weeksToGoal: Math.ceil(weeksToGoal),
      expectedCompletion: new Date(Date.now() + (weeksToGoal * 7 * 24 * 60 * 60 * 1000))
    };
  },

  validateAgainstBaseline() {
    const ref = this.BASELINE_REFERENCE;
    const comp = this.calculateComposition(ref.input.totalMass, ref.input.bodyFat, ref.input.unit);
    const energy = this.calculateEnergy(comp.leanMassKg, ref.input.activityLevel);
    const macros = this.calculateMacros(ref.expected.energy.netCalories, comp.leanMassKg);
    const goals = this.projectGoals(ref.input.totalMass, ref.input.bodyFat, ref.expected.goals.targetBodyFat, ref.expected.energy.deficit);

    return {
      composition: comp,
      energy,
      macros,
      goals,
      matches: {
        bmr: Math.abs(energy.BMR - ref.expected.energy.bmr) < 1,
        tdee: Math.abs(energy.TDEE - ref.expected.energy.tdee) < 1,
        protein: Math.abs(macros.protein.grams - ref.expected.macros.protein.grams) < 1
      }
    };
  }
};