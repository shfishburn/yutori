// nav.js
document.addEventListener("DOMContentLoaded", function() {
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
  
    // Ensure elements exist (for pages that use the nav)
    if (navToggle && navMenu) {
      navToggle.addEventListener("click", function() {
        navMenu.classList.toggle("hidden");
      });
    }
  });
  