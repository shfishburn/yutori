# Body Composition Calculator

## Project Overview

The Body Composition Calculator is a comprehensive web application designed to help users calculate and understand their body composition, metabolic requirements, and fitness goals through a step-by-step wizard interface.

## Project Structure

```
bcc/
│
├── src/
│   ├── js/
│   │   ├── core/                  # Core application logic
│   │   │   ├── state.js           # State management
│   │   │   ├── calculations.js    # Calculation algorithms
│   │   │   └── validators.js      # Input validation
│   │   │
│   │   ├── steps/                 # Step-specific modules
│   │   │   ├── step1.js           # Input method selection
│   │   │   ├── step2.js           # Personal information
│   │   │   ├── step3.js           # Body composition
│   │   │   ├── step4.js           # Goals and activity
│   │   │   └── step5.js           # Results display
│   │   │
│   │   ├── templates.js           # UI templates
│   │   └── ui.js                  # UI interaction logic
│   │
│   └── styles/
│       └── styles.css             # Application styling
│
├── assets/                        # Static assets
│   └── logo_400px_wide.png        # Logo image
│
├── tests/                         # Unit and integration tests
│   ├── state.test.js
│   ├── calculations.test.js
│   └── validators.test.js
│
├── bcc.html                       # Main application entry point
└── README.md                      # Project documentation
```

## Key Modules Breakdown

### 1. Core Modules

#### `state.js`
- Manages application state
- Provides robust state management
- Implements immutable state updates
- Includes comprehensive input validation

#### `calculations.js`
- Contains core calculation algorithms
- Handles body composition calculations
- Provides methods for:
  - Calculating lean mass
  - Estimating metabolic rate
  - Determining macro targets

#### `validators.js`
- Implements input validation logic
- Validates each step of the calculator
- Provides granular error checking

### 2. Step Modules

Each step module (`step1.js` - `step5.js`) is responsible for:
- Handling user interactions
- Managing input for specific sections
- Validating user input
- Updating application state

### 3. UI Management

#### `templates.js`
- Generates HTML templates for each step
- Provides dynamic rendering of calculator stages

#### `ui.js`
- Manages user interface interactions
- Handles navigation between steps
- Manages error display
- Coordinates state updates and UI rendering

## Development Principles

### Defensive Coding
- Rigorous input validation
- Comprehensive error handling
- Immutable state management
- Modular design

### State Management
- Centralized state control
- Immutable updates
- Comprehensive validation
- Step-based progression

## Testing Strategy

### Unit Tests
Located in the `tests/` directory, covering:
- State management
- Calculation accuracy
- Input validation

### Test Coverage
- Validate each calculation method
- Test edge cases
- Verify state transitions
- Ensure input sanitization

## Running the Project

### Prerequisites
- Modern web browser
- JavaScript support
- No additional dependencies required

### Local Development
1. Clone the repository
2. Open `bcc.html` in a web browser
3. Use browser developer tools for debugging

## Calculation Logic

The calculator follows a multi-step approach:
1. Select input method (lean mass or total weight)
2. Enter personal information
3. Input body composition details
4. Define fitness goals and activity level
5. Display personalized results

### Calculation Methods
- BMR (Basal Metabolic Rate)
- TDEE (Total Daily Energy Expenditure)
- Macro nutrient distribution
- Body composition analysis

## Browser Compatibility
- Supports modern browsers
- Responsive design
- Mobile-friendly interface

## Future Improvements
- Advanced metric tracking
- Persistence of results
- More detailed fitness recommendations
- Enhanced visualization

## Disclaimer
This calculator provides estimates and should not replace professional medical advice.

## License
&copy; 2025 Yutori Labs. All rights reserved.