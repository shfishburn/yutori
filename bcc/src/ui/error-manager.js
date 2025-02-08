/**
 * Error Management Module for Body Composition Calculator
 * 
 * @fileOverview Centralized error handling and user-friendly error reporting
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-06
 * @updated 2024-02-06
 * @timestamp 15:48:33 UTC
 * 
 * Changelog:
 * - Centralized error handling strategies
 * - User-friendly error display methods
 * - Comprehensive error logging
 */

class ErrorManager {
    /**
     * Display validation errors to the user
     * @param {string[]} errors - List of validation error messages
     */
    displayValidationErrors(errors) {
      const errorContainer = this.createErrorContainer(
        'Validation Errors', 
        errors.map(error => `• ${error}`).join('<br>')
      );
      this.appendErrorToRoot(errorContainer);
    }
  
    /**
     * Display a fatal error that prevents further application use
     * @param {string} title - Error title
     * @param {Error} error - Error object
     */
    displayFatalError(title, error) {
      const errorDetails = `
        <strong>Error:</strong> ${error.message}<br>
        <small>Please refresh the page or contact support.</small>
      `;
      
      const errorContainer = this.createErrorContainer(title, errorDetails);
      this.replaceRootContent(errorContainer);
    }
  
    /**
     * Display a generic error message
     * @param {string} message - Error message
     */
    displayError(message) {
      const errorContainer = this.createErrorContainer('Error', message);
      this.appendErrorToRoot(errorContainer);
    }
  
    /**
     * Create an error container element
     * @param {string} title - Error title
     * @param {string} message - Error message
     * @returns {HTMLElement} Error container
     */
    createErrorContainer(title, message) {
      const container = document.createElement('div');
      container.className = 'error-container p-4 bg-red-50 border border-red-300 rounded';
      container.innerHTML = `
        <h2 class="text-lg font-semibold text-red-700 mb-2">${title}</h2>
        <p class="text-red-600 mb-4">${message}</p>
        <button onclick="location.reload()" 
                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Reload
        </button>
      `;
      return container;
    }
  
    /**
     * Append error to the root element
     * @param {HTMLElement} errorContainer - Error container element
     */
    appendErrorToRoot(errorContainer) {
      const root = document.getElementById('calculatorRoot');
      if (root) {
        const existingErrors = root.querySelectorAll('.error-container');
        existingErrors.forEach(error => error.remove());
        root.insertAdjacentElement('afterbegin', errorContainer);
      }
    }
  
    /**
     * Replace root content with error container
     * @param {HTMLElement} errorContainer - Error container element
     */
    replaceRootContent(errorContainer) {
      const root = document.getElementById('calculatorRoot');
      if (root) {
        root.innerHTML = '';
        root.appendChild(errorContainer);
      }
    }
  
    /**
     * Log error to console and potentially to a remote logging service
     * @param {Error} error - Error object
     * @param {Object} [context] - Additional error context
     */
    logError(error, context = {}) {
      console.error('Calculator Error:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
        context
      });
  
      // Future enhancement: Add remote logging
      // this.sendErrorToLoggingService(error, context);
    }
  }
  
  // Create singleton instance
  const errorManager = new ErrorManager();
  
  // Attach to window for global access
  if (typeof window !== 'undefined') {
    window.errorManager = errorManager;
  }
  
  export default errorManager;