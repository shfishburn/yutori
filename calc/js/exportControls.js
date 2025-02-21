"use strict";

/**
 * Attaches event listeners to export control buttons.
 */
export function attachExportControls() {
  const printBtn = document.getElementById("printResultsBtn");
  const pdfBtn = document.getElementById("saveAsPdfBtn");

  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
    console.log("[exportControls] Attached listener to Print Results button.");
  } else {
    console.warn("[exportControls] Print Results button not found.");
  }

  if (pdfBtn) {
    pdfBtn.addEventListener("click", () => {
      alert("PDF export functionality is not implemented yet. Please integrate a library like jsPDF.");
    });
    console.log("[exportControls] Attached listener to Save as PDF button.");
  } else {
    console.warn("[exportControls] Save as PDF button not found.");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", attachExportControls);
} else {
  attachExportControls();
}
