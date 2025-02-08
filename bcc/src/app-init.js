/**
 * Application Initialization Module for Body Composition Calculator
 * 
 * @fileOverview Manages core module loading, initialization, and dependency verification
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-07
 * @updated 2024-02-07
 * @timestamp 14:45:33 UTC
 * 
 * Changelog:
 * - Fixed template import path
 * - Updated UIOrchestrator import
 */

import calculatorState from './src/core/state.js';
import ErrorManager from './src/ui/error-manager.js';
import { UIOrchestrator } from './src/ui/orchestrator.js';
import calculatorTemplates from './src/templates/templates.js';
import step1Module from './src/steps/step1.js';
import step2Module from './src/steps/step2.js';
import step3Module from './src/steps/step3.js';
import step4Module from './src/steps/step4.js';
import step5Module from './src/steps/step5.js';

class BodyCompCalculatorApp {
    constructor() {
        this.errorManager = ErrorManager;
        this.uiOrchestrator = new UIOrchestrator();
        this.initializationComplete = false;
        this.moduleLoadTimestamps = new Map();
    }

    /**
     * Initialize the application with dependency checks
     * @returns {Promise<void>}
     */
    async init() {
        try {
            console.log('🚀 Starting application initialization...');
            
            // Attach core modules to window
            this.attachModulesToWindow();
            
            // Verify core module initialization
            if (!this.verifyModules()) {
                throw new Error('Core modules failed to initialize');
            }

            // Initialize UI orchestrator
            await this.uiOrchestrator.init();
            
            // Attach global error handlers
            this.attachGlobalErrorHandlers();
            
            // Mark initialization as complete
            this.initializationComplete = true;
            console.log('✅ Application initialized successfully');
            
            // Log initialization metrics
            this.logInitializationMetrics();
        } catch (error) {
            this.handleInitializationError(error);
        }
    }

    /**
     * Attach all required modules to window object
     */
    attachModulesToWindow() {
        const modules = {
            calculatorState,
            errorManager: ErrorManager,
            uiOrchestrator: UIOrchestrator,
            calculatorTemplates,
            step1Module,
            step2Module,
            step3Module,
            step4Module,
            step5Module
        };

        Object.entries(modules).forEach(([name, module]) => {
            window[name] = module;
            this.moduleLoadTimestamps.set(name, Date.now());
        });
    }

    /**
     * Verify all required modules are loaded
     * @returns {boolean} Whether all modules are properly loaded
     */
    verifyModules() {
        const requiredModules = [
            'calculatorState',
            'errorManager',
            'uiOrchestrator',
            'calculatorTemplates',
            'step1Module',
            'step2Module',
            'step3Module',
            'step4Module',
            'step5Module'
        ];

        return requiredModules.every(module => {
            const isLoaded = typeof window[module] !== 'undefined';
            if (!isLoaded) {
                console.error(`Missing required module: ${module}`);
            }
            return isLoaded;
        });
    }

    /**
     * Attach global error handlers
     */
    attachGlobalErrorHandlers() {
        window.addEventListener('error', (event) => {
            this.errorManager.logError(event.error, {
                type: 'global',
                timestamp: new Date().toISOString()
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.errorManager.logError(event.reason, {
                type: 'promise',
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * Handle initialization errors
     * @param {Error} error - The initialization error
     */
    handleInitializationError(error) {
        this.errorManager.logInitError('AppInit', error);
        this.errorManager.displayFatalError(
            'Application Initialization Failed',
            error
        );
        
        console.error('Initialization Error Details:', {
            error: error.message,
            moduleStates: this.errorManager.getModuleStates(),
            loadTimestamps: Object.fromEntries(this.moduleLoadTimestamps),
            initializationComplete: this.initializationComplete
        });
    }

    /**
     * Log initialization metrics
     */
    logInitializationMetrics() {
        const initStart = Math.min(...this.moduleLoadTimestamps.values());
        const initEnd = Date.now();
        
        console.log('📊 Initialization Metrics:', {
            totalDuration: `${initEnd - initStart}ms`,
            moduleLoadOrder: Array.from(this.moduleLoadTimestamps.entries())
                .sort((a, b) => a[1] - b[1])
                .map(([module, timestamp]) => ({
                    module,
                    loadTime: `${timestamp - initStart}ms`
                }))
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const app = new BodyCompCalculatorApp();
    app.init().catch(error => {
        console.error('Fatal initialization error:', error);
    });
});

export default BodyCompCalculatorApp;