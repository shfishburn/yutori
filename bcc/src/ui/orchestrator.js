/**
 * UI Orchestrator for Body Composition Calculator
 * 
 * @fileOverview Manages UI interactions, state updates, and rendering
 * @author Yutori Labs
 * @version 1.0.0
 * @created 2024-02-07
 * @updated 2024-02-07
 * @timestamp 18:25:33 UTC
 * 
 * Changelog:
 * - Fixed template import path
 * - Fixed class export
 */

import calculatorState from '../core/state.js';
import calculatorTemplates from '../templates/templates.js';
import ErrorManager from './error-manager.js';

export class UIOrchestrator {
    constructor() {
        this.root = null;
        this.currentTemplate = null;
        this.initialized = false;
        
        this.updateView = this.updateView.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
    }

    /**
     * Initialize the UI orchestrator
     */
    init() {
        try {
            this.root = document.getElementById('calculatorRoot');
            if (!this.root) {
                throw new Error('Calculator root element not found');
            }

            // Subscribe to state changes
            calculatorState.subscribe(this.handleStateChange);
            
            // Initial render
            this.updateView();
            
            this.initialized = true;
            console.log('UI Orchestrator initialized successfully');
            
        } catch (error) {
            ErrorManager.logError(error, {
                context: 'UIOrchestrator.init',
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    /**
     * Handle state changes
     * @param {Object} newState - Updated calculator state
     */
    handleStateChange(newState) {
        try {
            const currentStep = newState.currentStep;
            if (this.currentTemplate !== `step${currentStep}`) {
                this.currentTemplate = `step${currentStep}`;
                this.updateView();
            }
        } catch (error) {
            ErrorManager.logError(error, {
                context: 'UIOrchestrator.handleStateChange',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Update view based on current state
     */
    updateView() {
        try {
            const state = calculatorState.getState();
            const stepTemplate = calculatorTemplates[`step${state.currentStep}`];
            
            if (!stepTemplate) {
                throw new Error(`Template not found for step ${state.currentStep}`);
            }

            // Render template
            this.root.innerHTML = stepTemplate(state);
            
            // Attach step-specific listeners
            this.attachStepListeners(state.currentStep);
            
        } catch (error) {
            ErrorManager.logError(error, {
                context: 'UIOrchestrator.updateView',
                timestamp: new Date().toISOString()
            });
            this.displayError('Failed to update view');
        }
    }

    /**
     * Attach listeners for current step
     * @param {number} step - Current step number
     */
    attachStepListeners(step) {
        try {
            const stepModule = window[`step${step}Module`];
            if (stepModule && typeof stepModule.attachListeners === 'function') {
                stepModule.attachListeners(this.root);
            }
        } catch (error) {
            ErrorManager.logError(error, {
                context: 'UIOrchestrator.attachStepListeners',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Display error message in UI
     * @param {string} message - Error message
     */
    displayError(message) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-container p-4 bg-red-50 border border-red-300 rounded';
        errorContainer.innerHTML = `
            <p class="text-red-600">${message}</p>
            <button onclick="location.reload()" 
                    class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Reload Calculator
            </button>
        `;
        
        if (this.root) {
            this.root.innerHTML = '';
            this.root.appendChild(errorContainer);
        }
    }
}