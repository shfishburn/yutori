// modals.js
window.app = window.app || {};

window.app.modals = (function () {
  const MODAL_SELECTORS = {
    workout: "#workoutModal",
    supplement: "#supplementModal",
  };

  function toggleFormFields(type, action) {
    const modal = document.querySelector(MODAL_SELECTORS[type]);
    const form = modal.querySelector(`#${type}Form`);
    const submitBtn = form.querySelector('button[type="submit"]');
    Array.from(form.querySelectorAll(".form-field")).forEach((field) => {
      field.style.display = action === "update" ? "block" : "none";
    });
    submitBtn.textContent = action === "update" ? "Update" : "Delete";
    submitBtn.classList.toggle("btn-danger", action === "delete");
  }

  function setupModalHandlers() {
    document.addEventListener("DOMContentLoaded", () => {
      Object.entries(MODAL_SELECTORS).forEach(([type, selector]) => {
        const modal = document.querySelector(selector);
        const form = modal ? modal.querySelector(`#${type}Form`) : null;
        const cancelBtn = modal
          ? modal.querySelector(`#cancel${type.charAt(0).toUpperCase() + type.slice(1)}Btn`)
          : null;
        if (!modal || !form || !cancelBtn) {
          console.error(`Modal components missing for ${type}`);
          return;
        }
        const radioButtons = modal.querySelectorAll(`input[name="${type}Action"]`);
        radioButtons.forEach((radio) => {
          radio.addEventListener("change", (e) => {
            toggleFormFields(type, e.target.value);
          });
        });
        cancelBtn.addEventListener("click", () => closeModal(type));
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            closeModal(type);
          }
        });
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          handleModalSubmit(type);
        });
      });
    });
  }

  function openModal(type, item = null) {
    const modal = document.querySelector(MODAL_SELECTORS[type]);
    const updateRadio = modal ? modal.querySelector(`input[name="${type}Action"][value="update"]`) : null;
    if (!modal) {
      console.error(`Modal not found for ${type}`);
      return;
    }
    modal.querySelector(`#${type}Form`)?.reset();
    if (updateRadio) updateRadio.checked = true;
    toggleFormFields(type, "update");
    if (item) {
      populateModalFields(type, item);
    }
    requestAnimationFrame(() => {
      modal.classList.add("modal-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  }

  function closeModal(type) {
    const modal = document.querySelector(MODAL_SELECTORS[type]);
    if (!modal) return;
    modal.classList.remove("modal-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function populateModalFields(type, item) {
    const modal = document.querySelector(MODAL_SELECTORS[type]);
    if (!modal) return;
    const fieldsMap = {
      workout: [
        "Id",
        "DayOfWeek",
        "TimeOfDay",
        "Session",
        "FocusArea",
        "Exercise",
        "MuscleExercised",
        "Equipment",
        "Sets",
        "Reps",
        "Load",
        "Notes",
        "BaseMET",
        "SortOrder",
      ],
      supplement: [
        "Id",
        "Time",
        "TimeSlot",
        "Supplier",
        "Name",
        "Type",
        "Amount",
        "Unit",
        "Description",
        "URL",
      ],
    };
    fieldsMap[type].forEach((field) => {
      const normalizedField = field.charAt(0).toLowerCase() + field.slice(1);
      const input = modal.querySelector(`#${type}${field}`);
      if (input) {
        input.value = item[normalizedField] || "";
      }
    });
  }

  function handleModalSubmit(type) {
    const modal = document.querySelector(MODAL_SELECTORS[type]);
    const form = modal ? modal.querySelector(`#${type}Form`) : null;
    if (!form) {
      console.error(`Form not found for ${type}`);
      return;
    }
    const action = modal.querySelector(`input[name="${type}Action"]:checked`).value;
    if (action === "delete") {
      if (!confirm(`Are you sure you want to delete this ${type}?`)) {
        return;
      }
      const id = form.querySelector(`#${type}Id`).value;
      window.app.state.dispatch({
        type: `DELETE_${type.toUpperCase()}`,
        payload: { id: Number(id) },
      });
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
            const prefix = type;
            let keyWithoutPrefix = k.startsWith(prefix) ? k.slice(prefix.length) : k;
            let normalizedKey = keyWithoutPrefix
              ? keyWithoutPrefix.charAt(0).toLowerCase() + keyWithoutPrefix.slice(1)
              : keyWithoutPrefix;
            return [normalizedKey, v];
          })
        ),
      },
    });
    alert(id ? `${type} updated successfully!` : `New ${type} added successfully!`);
    closeModal(type);
  }

  setupModalHandlers();

  window.app.modals = {
    openWorkoutModal: (item) => openModal("workout", item),
    openSupplementModal: (item) => openModal("supplement", item),
    closeWorkoutModal: () => closeModal("workout"),
    closeSupplementModal: () => closeModal("supplement"),
  };

  return window.app.modals;
})();
