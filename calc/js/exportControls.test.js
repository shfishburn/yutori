// exportControls.test.js
"use strict";

// For this test, we assume exportControls.js exports attachExportControls.
// Ensure that the module is loaded after the DOM is ready. 
import { attachExportControls } from "./exportcontrols.js";

// Setup a simulated DOM environment if needed (for example, via jsdom).
// For browsers, the document is already available.

// Override window.print and window.alert to capture calls.
let printCalled = false;
let alertCalled = false;
window.print = function() {
  printCalled = true;
  console.log("[TEST] window.print was called.");
};
window.alert = function(message) {
  alertCalled = true;
  console.log("[TEST] window.alert was called with message:", message);
};

// Create dummy export control buttons and append them to the DOM.
function setupExportControlElements() {
  // Remove existing elements if any.
  const existingPrintBtn = document.getElementById("printResultsBtn");
  const existingPdfBtn = document.getElementById("saveAsPdfBtn");
  if (existingPrintBtn) existingPrintBtn.remove();
  if (existingPdfBtn) existingPdfBtn.remove();

  const printBtn = document.createElement("button");
  printBtn.id = "printResultsBtn";
  printBtn.textContent = "Print Results";
  document.body.appendChild(printBtn);

  const pdfBtn = document.createElement("button");
  pdfBtn.id = "saveAsPdfBtn";
  pdfBtn.textContent = "Save as PDF";
  document.body.appendChild(pdfBtn);
}

// Run tests for export control buttons.
function runExportControlsTests() {
  // Setup dummy buttons in the document.
  setupExportControlElements();

  // Ensure that DOMContentLoaded has already fired.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      attachExportControls();
      simulateClicks();
    });
  } else {
    attachExportControls();
    simulateClicks();
  }
  
  function simulateClicks() {
    // Reset flags.
    printCalled = false;
    alertCalled = false;
    
    // Simulate click events.
    const printBtn = document.getElementById("printResultsBtn");
    const pdfBtn = document.getElementById("saveAsPdfBtn");
    if (printBtn) printBtn.click();
    if (pdfBtn) pdfBtn.click();
    
    // Use console.assert to validate behavior.
    console.assert(printCalled, "Test Failed: Print button did not call window.print()");
    console.assert(alertCalled, "Test Failed: PDF button did not call window.alert()");
    
    if (printCalled && alertCalled) {
      console.log("Export controls tests passed.");
    } else {
      console.error("Export controls tests failed.");
    }
  }
}

runExportControlsTests();
