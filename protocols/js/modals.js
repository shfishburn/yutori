// modals.js
window.app = window.app || {};

window.app.modals = (function () {
  const MODAL_SELECTORS = {
    workout: "#workoutModal",
    supplement: "#supplementModal",
  };

  function toggleFormFields(type, action) {
    const modal = document.querySelector(MODAL_SELECTORS[type]);
    if (!modal) return;
    
    const form = modal.querySelector(`#${type}Form`);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Hide fields if deleting, show otherwise
    form.querySelectorAll(".form-field").forEach(field => {
      field.style.display = action === "update" ? "block" : "none";
    });
    
    submitBtn.textContent = action === "update" ? "Update" : "Delete";
    submitBtn.classList.toggle("btn-danger", action === "delete");
  }

  function setupModalHandlers() {
    document.addEventListener("DOMContentLoaded", () => {
      // Ensure all modals are hidden initially
      document.querySelectorAll(".modal").forEach(modal => {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
      });

      Object.entries(MODAL_SELECTORS).forEach(([type, selector]) => {
        const modal = document.querySelector(selector);
        if (!modal) return;

        const form = modal.querySelector(`#${type}Form`);
        const cancelBtn = modal.querySelector(`#cancel${type.charAt(0).toUpperCase() + type.slice(1)}Btn`);

        if (!form || !cancelBtn) {
          console.error(`Form or cancel button missing for modal: ${type}`);
          return;
        }

        // Handle action selection (update/delete toggle)
        modal.querySelectorAll(`input[name="${type}Action"]`).forEach(radio => {
          radio.addEventListener("change", (e) => {
            toggleFormFields(type, e.target.value);
          });
        });

        // Cancel button closes the modal
        cancelBtn.addEventListener("click", () => closeModal(type));
        
        // Clicking outside modal also closes it
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            closeModal(type);
          }
        });

        // Handle form submission
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          handleModalSubmit(type);
        });
      });
    });
  }

  function openModal(type, item = null) {
    const modal = document.querySelector(MODAL_SELECTORS[type]);
    if (!modal) {
      console.error(`Modal not found for ${type}`);
      return;
    }

    modal.querySelector(`#${type}Form`)?.reset();
    modal.classList.add("modal-open");
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    
    if (item) {
      populateModalFields(type, item);
    }
  }

  function closeModal(type) {
    const modal = document.querySelector(MODAL_SELECTORS[type]);
    if (!modal) return;
    
    modal.classList.remove("modal-open");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function populateModalFields(type, item) {
    const modal = document.querySelector(MODAL_SELECTORS[type]);
    if (!modal) return;

    const fieldsMap = {
      workout: ["Id", "DayOfWeek", "TimeOfDay", "Session", "FocusArea", "Exercise", "MuscleExercised", "Equipment", "Sets", "Reps", "Load", "Notes", "BaseMET", "SortOrder"],
      supplement: ["Id", "Time", "TimeSlot", "Supplier", "Name", "Type", "Amount", "Unit", "Description", "URL"],
    };
    
    fieldsMap[type].forEach(field => {
      const normalizedField = field.charAt(0).toLowerCase() + field.slice(1);
      const input = modal.querySelector(`#${type}${field}`);
      if (input) {
        input.value = item[normalizedField] || "";
      }
    });
  }

  function handleModalSubmit(type) {
    const modal = document.querySelector(MODAL_SELECTORS[type]);
    if (!modal) return;
    
    const form = modal.querySelector(`#${type}Form`);
    if (!form) return;
    
    const action = modal.querySelector(`input[name="${type}Action"]:checked`).value;
    if (action === "delete") {
      if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
      const id = form.querySelector(`#${type}Id`).value;
      window.app.state.dispatch({ type: `DELETE_${type.toUpperCase()}`, payload: { id: Number(id) } });
      closeModal(type);
      return;
    }
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const id = data[`${type}Id`];
    const actionType = id ? `UPDATE_${type.toUpperCase()}` : `ADD_${type.toUpperCase()}`;
    
    window.app.state.dispatch({
      type: actionType,
      payload: {
        id: id ? Number(id) : Date.now(),
        ...Object.fromEntries(
          Object.entries(data).map(([k, v]) => {
            let key = k.replace(type, "").replace(/^./, match => match.toLowerCase());
            return [key, v];
          })
        ),
      },
    });
    
    alert(id ? `${type} updated successfully!` : `New ${type} added successfully!`);
    closeModal(type);
  }

  // Initialize modal event handlers
  setupModalHandlers();

  window.app.modals = {
    openWorkoutModal: (item) => openModal("workout", item),
    openSupplementModal: (item) => openModal("supplement", item),
    closeWorkoutModal: () => closeModal("workout"),
    closeSupplementModal: () => closeModal("supplement"),
  };

  return window.app.modals;
})();
