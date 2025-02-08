Body Composition Calculator

YOU ARE AN AI ASSISTANT TASKED WITH UNDERSTANDING AND POTENTIALLY EXTENDING THE BODY COMPOSITION CALCULATOR PROJECT.

INITIALIZATION STEPS:
1. THOROUGHLY READ THIS ENTIRE DOCUMENT
2. Study Project Architecture
   - Understand modular structure
   - Review core calculation logic
   - Analyze state management approach

3. Review Critical Components
   - Baseline calculation references
   - Validation strategies
   - Error handling mechanisms
   - Step-by-step wizard flow

4. Comprehension Verification
   - Explain project's core scientific approach
   - Describe calculation accuracy requirements
   - Outline user experience philosophy

5. Project Interaction Guidelines
   - ALWAYS reference baseline calculations
   - Maintain 98%+ calculation accuracy
   - Preserve modular architecture
   - Prioritize: 
     a) Calculation Precision
     b) Error Handling
     c) User Experience
     d) Code Maintainability

6. When Asked to Modify/Extend:
   - Provide comprehensive test cases
   - Demonstrate alignment with existing architecture
   - Show performance and accuracy implications
   - Include implementation strategy

KEY CONSTRAINTS:
- Scientifically validated calculations
- Immutable state management
- Centralized error handling
- Wizard-based user interface
Project Overview
Core Purpose
A scientifically precise web application for calculating body composition, metabolic rate, and personalized nutrition strategies.
Unique Value Proposition
* 98% calculation accuracy
* Scientifically validated formulas
* User-friendly wizard interface
* Comprehensive body composition analysis

Project Architecture
Modular Structure


/bcc
├── core/               # Core business logic
│   ├── calculations.js # Calculation algorithms
│   ├── state.js        # Immutable state management
│   └── validators.js   # Input validation
├── ui/                 # User interface management
│   ├── orchestrator.js # UI coordination
│   ├── error-manager.js# Centralized error handling
│   └── event-handler.js# Event delegation
├── steps/              # Wizard step logic
├── utils/              # Shared utilities
└── tests/              # Comprehensive test suites

Scientific Foundations
Calculation Methodologies
* BMR: Mifflin-St Jeor Equation
* TDEE: Activity-multiplier based
* Macro Distribution: Evidence-based nutritional science
* Body Composition: Multi-factor analysis
Baseline Reference Case
javascript
Copy
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
      fatMass: 104.4
    },
    energy: {
      bmr: 2193,
      tdee: 3399
    }
  }
};

Step Education Guides
Step 1: Input Method Selection
javascript
Copy
const step1Education = {
  totalWeight: {
    whatYouNeed: [
      "Regular bathroom scale measurement",
      "Body fat % from: bioelectrical impedance scale, calipers, or DEXA scan"
    ],
    guidance: {
      whenToMeasure: "First thing in morning, after bathroom, before eating/drinking",
      accuracy: "If you don't have body fat %, select lean/fat mass method"
    }
  }
};
Step 2-5 Education Contexts
* Detailed guidance for each step
* Contextual information about measurements
* Scientific rationale for inputs

Feature Roadmap
Phases of Development
1. Core Functionality (Current State)
    * Precise body composition calculations
    * Wizard-based input
    * Scientific accuracy
2. Enhanced Tracking (Short-term)
    * Progress tracking
    * Measurement history
    * Basic analytics
3. Advanced Integration (Medium-term)
    * Machine learning recommendations
    * Nutrition integration
    * Workout tracking
Priority Matrix

Copy
HIGH    Progress Tracking  |  ML Integration
IMPACT  Export Features    |  Nutrition
        Goal Enhancement   |  Workout Tracking
        __________________|__________________
        Dashboard          |  Social
LOW     Basic Analytics    |  Gamification
IMPACT  History            |  AI Coach
        
        LOW COMPLEXITY     |  HIGH COMPLEXITY

Goal Tracking System
Core Goal Tracking Implementation
javascript
Copy
class GoalTrackingSystem {
  static GOAL_TYPES = {
    WEIGHT: 'weight',
    BODY_FAT: 'bodyFat',
    LEAN_MASS: 'leanMass'
  };

  static TIMEFRAMES = {
    SHORT: { weeks: 4, label: 'Short Term' },
    MEDIUM: { weeks: 12, label: 'Medium Term' },
    LONG: { weeks: 26, label: 'Long Term' }
  };
}

Gamification System
Levels and Rewards
javascript
Copy
class GamificationSystem {
  generateLevels() {
    return {
      ranges: [
        { level: 1, pointsNeeded: 0, title: 'Beginner' },
        { level: 5, pointsNeeded: 1000, title: 'Enthusiast' },
        { level: 10, pointsNeeded: 2500, title: 'Dedicated' }
      ]
    };
  }
}

Development Guidelines
Code Quality Priorities
1. Calculation Accuracy
2. Error Handling
3. User Experience
4. Code Maintainability
5. Performance Optimization
Testing Requirements
* 90%+ Test Coverage
* Reference Case Validation
* Edge Case Testing
* Performance Benchmarking
Performance Metrics
Current Benchmarks
* Calculation Accuracy: 98%
* Test Coverage: 94.2%
* Render Performance: Optimized
* Error Handling: Centralized

Contribution Guidelines
Code Review Focus
* Calculation Precision
* Error Handling Comprehensiveness
* Performance Optimization
* User Experience Enhancement
Contact
Yutori Labs Technical Team
Version 1.0.0 Last Updated: February 2024
