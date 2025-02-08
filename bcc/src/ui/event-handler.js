/**
 * Event Handling Module for Body Composition Calculator
 * 
 * @fileOverview Centralized event management and delegation
 * @author Yutori Labs
 * @version 1.0.1
 * @created 2024-02-07
 * @updated 2024-02-08
 * @timestamp 16:02:44 UTC
 * 
 * Changelog:
 * - Added comprehensive diagnostic logging
 * - Enhanced event delegation
 * - Improved error tracking
 */

import calculatorState from '../core/state.js';
import ErrorManager from './error-manager.js';

class EventHandler {
    constructor() {
        this.state = calculatorState;
        this.errorManager = ErrorManager;
        this.initializeListeners();
    }

    /**
     * Initialize global event listeners with comprehensive logging
     */
    initializeListeners() {
        console.group('🔍 EventHandler Initialization');
        console.log('Setting up global event listeners');
        
        document.addEventListener('click', this.handleGlobalClick.bind(this), {
            capture: true,  // Ensure early event capture
            passive: false  // Allow preventDefault if needed
        });

        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
        
        console.log('Event listeners attached successfully');
        console.groupEnd();
    }

    /**
     * Comprehensive global click event handler
     * @param {Event} event - Click event
     */
    handleGlobalClick(event) {
        console.group('🖱️ Click Event Detected');
        console.log('Raw Event:', event);

        const actionButton = event.target.closest('[data-action]');
        if (!actionButton) {
            console.log('No action button found');
            console.groupEnd();
            return;
        }

        const action = actionButton.dataset.action;
        console.log('Action Button Details:', {
            action,
            buttonElement: actionButton,
            currentState: this.state.getState()
        });

        try {
            this.processAction(action, event);
        } catch (error) {
            this.errorManager.displayError(`Action processing failed: ${action}`);
            console.error('Action Processing Error:', error);
        }

        console.groupEnd();
    }

    /**
     * Process different action types with detailed logging
     * @param {string} action - Action type
     * @param {Event} event - Original event
     */
    processAction(action, event) {
        console.group(`🔨 Processing Action: ${action}`);
        
        const actionMap = {
            'next': this.moveToNextStep.bind(this),
            'back': this.moveToPreviousStep.bind(this),
            'reset': this.resetCalculator.bind(this)
        };

        const actionHandler = actionMap[action];
        
        if (actionHandler) {
            event.preventDefault();  // Prevent default button behavior
            event.stopPropagation();  // Stop event bubbling
            
            console.log('Action Handler Found. Executing...');
            actionHandler();
        } else {
            console.warn(`No handler for action: ${action}`);
        }
        
        console.groupEnd();
    }

    /**
     * Move to next step with comprehensive state logging
     */
    moveToNextStep() {
        const currentState = this.state.getState();
        const nextStep = Math.min(currentState.currentStep + 1, 5);
        
        console.group('➡️ Moving to Next Step');
        console.log('Current State:', currentState);
        console.log('Target Next Step:', nextStep);
        
        const updateResult = this.state.set('currentStep', nextStep);
        
        console.log('State Update Result:', updateResult);
        console.groupEnd();
    }

    /**
     * Move to previous step with comprehensive state logging
     */
    moveToPreviousStep() {
        const currentState = this.state.getState();
        const prevStep = Math.max(currentState.currentStep - 1, 1);
        
        console.group('⬅️ Moving to Previous Step');
        console.log('Current State:', currentState);
        console.log('Target Previous Step:', prevStep);
        
        const updateResult = this.state.set('currentStep', prevStep);
        
        console.log('State Update Result:', updateResult);
        console.groupEnd();
    }

    /**
     * Reset calculator with detailed logging
     */
    resetCalculator() {
        console.group('🔄 Resetting Calculator');
        
        try {
            this.state.reset();
            console.log('Calculator reset to initial state');
        } catch (error) {
            console.error('Reset Failed:', error);
            this.errorManager.displayError('Failed to reset calculator');
        }
        
        console.groupEnd();
    }

    /**
     * Handle keyboard navigation events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardNavigation(event) {
        if (event.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.dataset.action) {
                this.processAction(activeElement.dataset.action, event);
            }
        }
    }
}

// Create singleton instance
const eventHandler = new EventHandler();

// Attach to window for global access
if (typeof window !== 'undefined') {
    window.eventHandler = eventHandler;
}

export default eventHandler;