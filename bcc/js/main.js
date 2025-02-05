// main.js
const requiredModules = [
 { name: 'calculatorState', file: 'state.js' },
 { name: 'calculatorTemplates', file: 'templates.js' },
 { name: 'calculatorValidators', file: 'validators.js' }, 
 { name: 'calculatorCalculations', file: 'calculations.js' },
 { name: 'calculatorUI', file: 'ui.js' }
];

document.addEventListener('DOMContentLoaded', function() {
 const missingModules = requiredModules.filter(module => {
   if (typeof window[module.name] === 'undefined') {
     console.error(`Missing module ${module.name} from ${module.file}`);
     return true;
   }
   return false;
 });

 if (missingModules.length === 0) {
   calculatorUI.init();
 }
});