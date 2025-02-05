document.addEventListener('DOMContentLoaded', () => {
  // Ensure all critical global objects are defined
  const requiredModules = [
    'calculatorState', 
    'calculatorUI', 
    'calculatorTemplates', 
    'calculatorValidators',
    'calculatorCalculations'
  ];

  const missingModules = requiredModules.filter(module => typeof window[module] === 'undefined');

  if (missingModules.length > 0) {
    console.error('Missing required modules:', missingModules);
    return;
  }

  try {
    calculatorUI.init();
  } catch (error) {
    console.error('Initialization failed:', error);
  }
});