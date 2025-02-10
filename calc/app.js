/*
  File Name: app.js
  Description: JavaScript logic for the Body Composition Calculator demo. Handles state management,
               UI transitions between introduction and steps 1–4, input collection, spinner simulation,
               progress bar updates, integration of Chart.js, and placeholder calculation stubs.
  Change Control:
    - Version 1.0: Initial creation.
*/

// Global state variables
let currentStep = 0; // 0: Intro, 1: Step1, 2: Step2, 3: Step3, 4: Step4
let measurementPath = "quick"; // default path: "quick", can be "enhanced" or "professional"
let bodyTypeFactor = 1.0; // Calculated from quiz answers (placeholder accumulation)
let userData = {}; // To store user inputs from steps

// Cache DOM elements for easier access
const introSection = document.getElementById("intro-section");
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");
const step4 = document.getElementById("step4");
const sections = [introSection, step1, step2, step3, step4];

const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

// Event listeners for header measurement path selection
document.querySelectorAll(".path-option").forEach(option => {
  option.addEventListener("click", () => {
    // Update the measurement path based on selection
    measurementPath = option.getAttribute("data-path");
    // Update UI selection
    document.querySelectorAll(".path-option").forEach(opt => opt.classList.remove("selected"));
    option.classList.add("selected");
    // Update accuracy indicator in Step 1 based on selected path
    updateAccuracyIndicator();
  });
});

// Event listener for Restart Demo button
document.getElementById("restart-demo").addEventListener("click", resetDemo);

// Start Demo button in the introduction section
document.getElementById("start-demo").addEventListener("click", () => {
  currentStep = 1;
  showCurrentStep();
  updateProgress(10, "10% complete");
});

// Upgrade Accuracy button (in Step 1)
document.getElementById("upgrade-accuracy").addEventListener("click", () => {
  // For demo purposes, if current measurement path is quick, switch to enhanced.
  if (measurementPath === "quick") {
    measurementPath = "enhanced";
    // Update header selection UI accordingly
    document.querySelectorAll(".path-option").forEach(opt => {
      if (opt.getAttribute("data-path") === "enhanced") {
        opt.classList.add("selected");
      } else {
        opt.classList.remove("selected");
      }
    });
  }
  updateAccuracyIndicator();
});

// Quiz answer buttons in Step 1
document.querySelectorAll(".quiz-answer").forEach(button => {
  button.addEventListener("click", () => {
    // For simplicity, add the data-value to the global bodyTypeFactor.
    const value = parseFloat(button.getAttribute("data-value"));
    bodyTypeFactor += value;
    // Optionally, provide immediate feedback (not implemented in demo)
  });
});

// Next button from Step 1 to Step 2
document.getElementById("to-step2").addEventListener("click", () => {
  // Collect inputs from Step 1
  userData.healthGoal = document.querySelector("#health-goal-options .goal-btn.active")?.getAttribute("data-goal") || "Achieve";
  userData.totalWeight = document.getElementById("total-weight").value || "210";
  userData.bodyFat = document.getElementById("body-fat").value || "25";
  userData.age = document.getElementById("age").value || "30";
  userData.gender = document.getElementById("gender").value || "male";
  userData.bodyTypeFactor = bodyTypeFactor.toFixed(2);

  currentStep = 2;
  showCurrentStep();
  updateProgress(33, "33% complete");
  renderPieChart(); // Initialize Chart.js pie chart for Step 2
});

// Next button from Step 2 to Step 3
document.getElementById("to-step3").addEventListener("click", () => {
  // Collect inputs from Step 2
  userData.activityLevel = document.getElementById("activity-level").value || "1.5";
  userData.calorieDeficit = document.getElementById("calorie-deficit").value || "-500";
  userData.dietaryApproach = document.getElementById("dietary-approach").value || "low-carb";

  currentStep = 3;
  showCurrentStep();
  updateProgress(66, "66% complete");
  // Populate confirmation summary (placeholder)
  document.getElementById("summary").innerHTML = `
    <p>Health Goal: ${userData.healthGoal || "Achieve"}</p>
    <p>Total Weight: ${userData.totalWeight} lbs, Body Fat: ${userData.bodyFat}%</p>
    <p>Age: ${userData.age}, Gender: ${userData.gender}</p>
    <p>Activity Level: ${userData.activityLevel}, Calorie Deficit: ${userData.calorieDeficit}</p>
    <p>Diet: ${userData.dietaryApproach}</p>
  `;
});

// Calculate button in Step 3
document.getElementById("calculate-btn").addEventListener("click", () => {
  // Show spinner and simulate a calculation delay (3–5 seconds)
  document.getElementById("spinner").classList.remove("hidden");
  // Disable calculate button during simulation
  document.getElementById("calculate-btn").disabled = true;
  setTimeout(() => {
    // Hide spinner and proceed to Step 4
    document.getElementById("spinner").classList.add("hidden");
    document.getElementById("calculate-btn").disabled = false;
    currentStep = 4;
    showCurrentStep();
    updateProgress(100, "100% complete");
    // Set results using placeholder calculation stubs
    setResults();
  }, 3500); // 3.5 seconds delay
});

/**
 * showCurrentStep - Shows the current step section and hides others.
 */
function showCurrentStep() {
  sections.forEach((sec, index) => {
    if (index === currentStep) {
      sec.classList.remove("hidden");
    } else {
      sec.classList.add("hidden");
    }
  });
}

/**
 * updateProgress - Updates the progress bar width and text.
 * @param {number} percent - The width percentage.
 * @param {string} text - The progress text.
 */
function updateProgress(percent, text) {
  progressBar.style.width = percent + "%";
  progressText.textContent = text;
}

/**
 * updateAccuracyIndicator - Updates the text indicator for measurement accuracy in Step 1.
 */
function updateAccuracyIndicator() {
  const indicator = document.getElementById("accuracy-indicator");
  let text = "";
  if (measurementPath === "quick") {
    text = "Current Accuracy: Basic Accuracy (±10%)";
  } else if (measurementPath === "enhanced") {
    text = "Current Accuracy: Enhanced Accuracy (±5–7%)";
  } else if (measurementPath === "professional") {
    text = "Current Accuracy: Professional Precision (±1–2%)";
  }
  indicator.textContent = text;
}

/**
 * renderPieChart - Uses Chart.js to render an interactive pie chart showing body composition.
 */
function renderPieChart() {
  const ctx = document.getElementById("pieChart").getContext("2d");
  // Placeholder data: assume 70% lean mass and 30% fat mass
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Lean Mass', 'Fat Mass'],
      datasets: [{
        data: [70, 30],
        backgroundColor: ['#27ae60', '#e74c3c']
      }]
    },
    options: {
      responsive: true
    }
  });
}

/**
 * setResults - Placeholder function to set calculated metrics.
 * In a real scenario, formulas for BMR, TDEE, macros, and timeline would be implemented here.
 * References: Appendices C–F.
 */
function setResults() {
  // Placeholder calculations:
  // BMR calculation stub (e.g., BMR = 370 + (21.6 * leanMassInKg))
  const bmr = 1400;
  // TDEE calculation stub (e.g., TDEE = BMR * activityLevel)
  const tdee = 2100;
  // Final Calorie Target calculation stub (e.g., TDEE - calorieDeficit)
  const finalCalorieTarget = 1600;

  document.getElementById("result-bmr").textContent = bmr;
  document.getElementById("result-tdee").textContent = tdee;
  document.getElementById("result-calorie-target").textContent = finalCalorieTarget;
  // Additional metrics (macro recommendations, timeline, etc.) would be similarly set.
}

/**
 * resetDemo - Resets the demo back to the Introduction Section.
 */
function resetDemo() {
  // Clear stored data and reset state variables
  currentStep = 0;
  measurementPath = "quick";
  bodyTypeFactor = 1.0;
  userData = {};

  // Reset header selection UI
  document.querySelectorAll(".path-option").forEach(opt => {
    if (opt.getAttribute("data-path") === "quick") {
      opt.classList.add("selected");
    } else {
      opt.classList.remove("selected");
    }
  });
  updateAccuracyIndicator();
  updateProgress(0, "0% complete");
  showCurrentStep();
}

// Optional: Add active state for goal buttons in Step 1
document.querySelectorAll("#health-goal-options .goal-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#health-goal-options .goal-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});
