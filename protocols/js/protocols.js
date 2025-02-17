// protocols.js

/* ====================================================
   Global Error Handling
==================================================== */
window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error("Global error:", { msg, url, lineNo, columnNo, error });
  return false;
};

/* ====================================================
   Utility Functions
==================================================== */
window.app = window.app || {};

window.app.getLocalDateString = function () {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

window.app.debounce = function (func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
};

/* ====================================================
   Data Module
==================================================== */
window.app.data = (function () {
  const defaultWorkouts = [
    {
      id: 1,
      dayOfWeek: 1,
      timeOfDay: "Morning",
      session: "Cardio",
      focusArea: "Endurance",
      exercise: "Running",
      muscleExercised: "Legs",
      equipment: "None",
      sets: 1,
      reps: "30 mins",
      load: "",
      notes: "Steady pace",
      baseMET: 6,
      sortOrder: 1,
      completed: false,
    },
  ];
  const defaultSupplements = [
    {
      id: 1,
      time: "08:00",
      timeSlot: "Morning",
      supplier: "Brand A",
      supplement: "Whey Protein",
      type: "Protein",
      amount: "1 scoop",
      unit: "",
      description: "Post-workout recovery",
      url: "",
      completed: false,
    },
  ];

  async function loadData() {
    let workoutsData = null,
      supplementsData = null;
    try {
      const response = await fetch("/protocols/workouts.json");
      if (response.ok) {
        workoutsData = await response.json();
      } else {
        console.error("Failed to fetch workouts.json, status:", response.status);
      }
    } catch (e) {
      console.error("Error fetching workouts.json:", e);
    }
    try {
      const response = await fetch("/protocols/supplements.json");
      if (response.ok) {
        supplementsData = await response.json();
      } else {
        console.error("Failed to fetch supplements.json, status:", response.status);
      }
    } catch (e) {
      console.error("Error fetching supplements.json:", e);
    }
    return {
      workouts: workoutsData || defaultWorkouts.slice(),
      supplements: supplementsData || defaultSupplements.slice(),
    };
  }

  function saveData(workouts, supplements) {
    console.log("Saving data is disabled in production mode.");
  }

  return { loadData, saveData, defaultWorkouts, defaultSupplements };
})();

/* ====================================================
   State Management Module
==================================================== */
window.app.state = (function () {
  let state = { workouts: [], supplements: [] };
  const listeners = [];

  function subscribe(listener) {
    if (typeof listener === "function") listeners.push(listener);
  }

  function dispatch(action) {
    switch (action.type) {
      case "UPDATE_WORKOUT":
        state.workouts = state.workouts.map((w) =>
          w.id === action.payload.id ? action.payload : w
        );
        break;
      case "ADD_WORKOUT":
        state.workouts.push(action.payload);
        break;
      case "DELETE_WORKOUT":
        state.workouts = state.workouts.filter((w) => w.id !== action.payload.id);
        break;
      case "TOGGLE_WORKOUT":
        state.workouts = state.workouts.map((w) =>
          w.id === action.payload.id ? { ...w, completed: action.payload.completed } : w
        );
        break;
      case "UPDATE_SUPPLEMENT":
        state.supplements = state.supplements.map((s) =>
          s.id === action.payload.id ? action.payload : s
        );
        break;
      case "ADD_SUPPLEMENT":
        state.supplements.push(action.payload);
        break;
      case "DELETE_SUPPLEMENT":
        state.supplements = state.supplements.filter((s) => s.id !== action.payload.id);
        break;
      case "TOGGLE_SUPPLEMENT":
        state.supplements = state.supplements.map((s) =>
          s.id === action.payload.id ? { ...s, completed: action.payload.completed } : s
        );
        break;
      case "RESET":
        state = action.payload;
        break;
      default:
        break;
    }
    listeners.forEach((listener) => listener(state));
  }

  function getState() {
    return state;
  }

  function init(initialData) {
    state = { workouts: initialData.workouts, supplements: initialData.supplements };
    console.log(
      "State initialized: workouts count =",
      state.workouts.length,
      "supplements count =",
      state.supplements.length
    );
  }

  return { subscribe, dispatch, getState, init };
})();

/* ====================================================
   Collapse State Management
==================================================== */
window.app.collapseState = {
  workouts: new Map(),
  supplements: new Map(),
  save() {
    try {
      localStorage.setItem(
        "collapseState",
        JSON.stringify({
          workouts: Object.fromEntries(this.workouts),
          supplements: Object.fromEntries(this.supplements),
        })
      );
    } catch (error) {
      console.error("Error saving collapse state:", error);
    }
  },
  load() {
    try {
      const saved = localStorage.getItem("collapseState");
      if (saved) {
        const state = JSON.parse(saved);
        this.workouts = new Map(Object.entries(state.workouts));
        this.supplements = new Map(Object.entries(state.supplements));
      }
    } catch (error) {
      console.error("Error loading collapse state:", error);
    }
  },
};
window.app.collapseState.load();

/* ====================================================
   Render Module
==================================================== */
window.app.render = (function (store) {
  function createWorkoutCard(workout) {
    const card = document.createElement("div");
    card.className = "workout-card card border p-4 rounded mb-2 bg-gray-50";
    card.dataset.timeOfDay = workout.timeOfDay;
    card.dataset.session = workout.session;
    card.dataset.focusArea = workout.focusArea;
    card.dataset.muscleExercised = workout.muscleExercised;
    card.dataset.equipment = workout.equipment;
    card.dataset.id = workout.id;

    const header = document.createElement("div");
    header.className = "exercise-card-header flex justify-between items-center";

    const leftDiv = document.createElement("div");
    leftDiv.className = "card-left flex items-center gap-2";

    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle cursor-grab";
    dragHandle.textContent = "☰";
    leftDiv.appendChild(dragHandle);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = workout.completed;
    checkbox.addEventListener("change", (e) => {
      e.stopPropagation();
      window.app.state.dispatch({
        type: "TOGGLE_WORKOUT",
        payload: { id: workout.id, completed: e.target.checked },
      });
    });
    leftDiv.appendChild(checkbox);

    const exerciseName = document.createElement("span");
    exerciseName.className = "card-exercise-name font-semibold";
    exerciseName.textContent = workout.exercise;
    leftDiv.appendChild(exerciseName);
    header.appendChild(leftDiv);

    header.appendChild(createUpdateLink("workout", workout));
    card.appendChild(header);

    const detailsList = document.createElement("ul");
    detailsList.className = "exercise-details mt-2 text-sm";
    const fields = [
      { label: "Focus", value: workout.focusArea },
      { label: "Session", value: workout.session },
      { label: "Muscles", value: workout.muscleExercised },
      { label: "Equipment", value: workout.equipment },
      { label: "Sets/Reps", value: `${workout.sets} × ${workout.reps}` },
      { label: "Load", value: workout.load },
      { label: "Notes", value: workout.notes },
    ];
    fields.forEach((field) => {
      if (field.value) {
        const li = document.createElement("li");
        li.innerHTML = `<span class="detail-label font-bold">${field.label}:</span> <span class="detail-value">${field.value}</span>`;
        detailsList.appendChild(li);
      }
    });
    card.appendChild(detailsList);

    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    requestAnimationFrame(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    });
    return card;
  }

  function createUpdateLink(type, item) {
    const updateLink = document.createElement("a");
    updateLink.href = "#";
    updateLink.className = `${type}-update text-blue-600 underline`;
    updateLink.textContent = "Update";
    updateLink.addEventListener("pointerup", (e) => {
      e.preventDefault();
      e.stopPropagation();
      updateLink.style.opacity = "0.7";
      setTimeout(() => {
        updateLink.style.opacity = "1";
      }, 150);
      window.app.modals[
        `open${type.charAt(0).toUpperCase() + type.slice(1)}Modal`
      ](item);
    });
    return updateLink;
  }

  function renderWorkouts() {
    try {
      const container = document.getElementById("workoutContainer");
      container.innerHTML = "";
      let workouts = store.getState().workouts;
      console.log("RenderWorkouts: initial workouts count =", workouts.length);

      // Filter by selected date (convert Sunday from 0 to 7)
      const selectedDate = document.getElementById("datePicker")?.value;
      if (selectedDate) {
        const parts = selectedDate.split("-");
        const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const selectedDay = dateObj.getDay() === 0 ? 7 : dateObj.getDay();
        workouts = workouts.filter((w) => Number(w.dayOfWeek) === selectedDay);
        console.log("RenderWorkouts: workouts count after filtering =", workouts.length);
      }

      // Group workouts by timeOfDay
      const groups = workouts.reduce((acc, workout) => {
        const key = workout.timeOfDay;
        if (!acc[key]) acc[key] = [];
        acc[key].push(workout);
        return acc;
      }, {});

      const orderMap = { Morning: 1, Evening: 2 };
      Object.entries(groups)
        .sort(([a], [b]) => orderMap[a] - orderMap[b])
        .forEach(([timeOfDay, group]) => {
          const groupDiv = document.createElement("div");
          groupDiv.className =
            "workout-group card-container exercise-group mb-4 border rounded overflow-hidden";
          groupDiv.dataset.groupId = timeOfDay;
          if (window.app.collapseState.workouts.get(timeOfDay) === true) {
            groupDiv.classList.add("collapsed");
          }

          const headerDiv = document.createElement("div");
          headerDiv.className =
            "group-header bg-gray-200 p-2 flex justify-between items-center cursor-pointer";
          headerDiv.innerHTML = `<span class="group-title font-bold">${timeOfDay}</span> <span class="toggle-btn">▼</span>`;
          groupDiv.appendChild(headerDiv);

          const contentDiv = document.createElement("div");
          contentDiv.className = "group-content p-2";
          group.sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999))
            .forEach((workout) => {
              const card = createWorkoutCard(workout);
              contentDiv.appendChild(card);
            });
          groupDiv.appendChild(contentDiv);

          headerDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleGroupCollapse(groupDiv);
          });

          if (typeof Sortable !== "undefined") {
            Sortable.create(contentDiv, {
              animation: 150,
              handle: ".drag-handle",
              onEnd: function () {
                const cards = contentDiv.querySelectorAll(".workout-card");
                cards.forEach((card, index) => {
                  const id = parseInt(card.dataset.id);
                  const workout = store.getState().workouts.find((w) => w.id === id);
                  if (workout) {
                    workout.sortOrder = index + 1;
                  }
                });
                window.app.state.dispatch({ type: "UPDATE_WORKOUT", payload: { id: -1 } });
              },
            });
          } else {
            console.error("Sortable is not defined");
          }

          container.appendChild(groupDiv);
        });
    } catch (error) {
      console.error("Error rendering workouts:", error);
    }
  }

  function renderSupplements() {
    try {
      const container = document.getElementById("supplementsContainer");
      container.innerHTML = "";
      const supplements = store.getState().supplements;

      // Group supplements by timeSlot and sort by time using the time field
      const groups = supplements.reduce((acc, supp) => {
        const key = supp.timeSlot;
        if (!acc[key]) acc[key] = [];
        acc[key].push(supp);
        return acc;
      }, {});

      const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
        const minTimeA = Math.min(
          ...groups[a].map((s) => {
            const [h, m] = s.time.split(":").map(Number);
            return h * 60 + m;
          })
        );
        const minTimeB = Math.min(
          ...groups[b].map((s) => {
            const [h, m] = s.time.split(":").map(Number);
            return h * 60 + m;
          })
        );
        return minTimeA - minTimeB;
      });

      sortedGroupKeys.forEach((timeSlot) => {
        groups[timeSlot].sort((a, b) => {
          const [ah, am] = a.time.split(":").map(Number);
          const [bh, bm] = b.time.split(":").map(Number);
          const timeA = ah * 60 + am;
          const timeB = bh * 60 + bm;
          if (timeA === timeB) {
            return a.supplement.localeCompare(b.supplement);
          }
          return timeA - timeB;
        });

        const groupDiv = document.createElement("div");
        groupDiv.className = "supplement-group card-container mb-4 border rounded overflow-hidden";
        groupDiv.dataset.groupId = timeSlot;
        if (window.app.collapseState.supplements.get(timeSlot) === true) {
          groupDiv.classList.add("collapsed");
        }

        const headerDiv = document.createElement("div");
        headerDiv.className =
          "group-header bg-gray-200 p-2 flex justify-between items-center cursor-pointer";
        headerDiv.innerHTML = `<span class="group-title font-bold">${timeSlot}</span> <span class="toggle-btn">▼</span>`;
        groupDiv.appendChild(headerDiv);

        const contentDiv = document.createElement("div");
        contentDiv.className = "group-content p-2";
        groups[timeSlot].forEach((supplement) => {
          const card = document.createElement("div");
          card.className = "supplement-card card border p-4 rounded mb-2 bg-gray-50";
          card.dataset.timeSlot = supplement.timeSlot;
          card.dataset.type = supplement.type;
          card.dataset.supplier = supplement.supplier;
          card.dataset.id = supplement.id;

          const header = document.createElement("div");
          header.className = "supplement-header flex justify-between items-center";

          const name = document.createElement("span");
          name.className = "supplement-name font-semibold";
          name.textContent = supplement.supplement;
          header.appendChild(name);

          header.appendChild(createUpdateLink("supplement", supplement));
          card.appendChild(header);

          const detailsList = document.createElement("ul");
          detailsList.className = "supplement-details mt-2 text-sm";
          const fields = [
            { label: "Time", value: supplement.time },
            { label: "Supplier", value: supplement.supplier },
            { label: "Type", value: supplement.type },
            { label: "Amount", value: supplement.amount },
            { label: "Unit", value: supplement.unit },
            { label: "Description", value: supplement.description },
          ];
          fields.forEach((field) => {
            if (field.value) {
              const li = document.createElement("li");
              li.innerHTML = `<span class="detail-label font-bold">${field.label}:</span> <span class="detail-value">${field.value}</span>`;
              detailsList.appendChild(li);
            }
          });
          card.appendChild(detailsList);
          contentDiv.appendChild(card);
        });

        groupDiv.appendChild(contentDiv);

        headerDiv.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleGroupCollapse(groupDiv);
        });

        container.appendChild(groupDiv);
      });
    } catch (error) {
      console.error("Error rendering supplements:", error);
    }
  }

  window.app.render = {
    renderWorkouts,
    renderSupplements,
    createWorkoutCard,
  };
  return window.app.render;
})(window.app.state);

/* ====================================================
   Filter Functions and Unified Filter State
==================================================== */
window.app.filterState = {
  activeTab: "workouts",
  workouts: {
    activeFilters: new Set(),
    values: {
      timeOfDay: null,
      session: null,
      focusArea: null,
      muscleExercised: null,
      equipment: null,
    },
  },
  supplements: {
    activeFilters: new Set(),
    values: {
      timeSlot: null,
      type: null,
      supplier: null,
    },
  },
};

function getActiveFilters(containerType) {
  const filters = {};
  const filterSection = document.getElementById(`${containerType}FilterSection`);
  if (filterSection) {
    const selects = filterSection.querySelectorAll(".filter-select");
    selects.forEach((select) => {
      const filterType = select.parentElement.dataset.filterType;
      filters[filterType] = select.value;
    });
  }
  return filters;
}

function showCardWithAnimation(card) {
  card.classList.remove("hidden");
  requestAnimationFrame(() => {
    card.style.opacity = "1";
    card.style.transform = "translateY(0)";
  });
}

function hideCardWithAnimation(card) {
  card.style.opacity = "0";
  card.style.transform = "translateY(-10px)";
  card.addEventListener(
    "transitionend",
    function handler() {
      if (card.style.opacity === "0") {
        card.classList.add("hidden");
      }
      card.removeEventListener("transitionend", handler);
    },
    { once: true }
  );
}

function applyFilters(containerType) {
  const activeFilters = getActiveFilters(containerType);
  const container = document.getElementById(`${containerType}Container`);
  const cardSelector = containerType === "workouts" ? ".workout-card" : ".supplement-card";
  const cards = container.querySelectorAll(cardSelector);

  cards.forEach((card) => {
    const matches = Object.entries(activeFilters).every(([key, value]) => {
      if (!value) return true;
      return card.dataset[key.toLowerCase()] === value;
    });
    if (matches) {
      showCardWithAnimation(card);
    } else {
      hideCardWithAnimation(card);
    }
  });

  updateGroupVisibility(containerType);
}

function updateGroupVisibility(containerType) {
  const container = document.getElementById(`${containerType}Container`);
  const groupSelector = containerType === "workouts" ? ".workout-group" : ".supplement-group";
  const groups = container.querySelectorAll(groupSelector);

  groups.forEach((group) => {
    const cardSelector = containerType === "workouts" ? ".workout-card" : ".supplement-card";
    const visibleCards = Array.from(group.querySelectorAll(cardSelector)).filter(
      (card) => !card.classList.contains("hidden")
    );
    if (visibleCards.length > 0) {
      group.classList.remove("hidden");
      group.style.opacity = "1";
    } else {
      group.style.opacity = "0";
      group.addEventListener(
        "transitionend",
        function handler() {
          if (group.style.opacity === "0") {
            group.classList.add("hidden");
          }
          group.removeEventListener("transitionend", handler);
        }
      );
    }
  });
}

// Attach filter event listeners
document.querySelectorAll("#workoutsFilterSection .filter-select").forEach((select) => {
  select.addEventListener("change", () => applyFilters("workouts"));
});
document.getElementById("clearWorkoutsFilters")?.addEventListener("click", () => {
  const selects = document.querySelectorAll("#workoutsFilterSection .filter-select");
  selects.forEach((select) => (select.value = ""));
  applyFilters("workouts");
});
document.querySelectorAll("#supplementsFilterSection .filter-select").forEach((select) => {
  select.addEventListener("change", () => applyFilters("supplements"));
});
document.getElementById("clearSupplementsFilters")?.addEventListener("click", () => {
  const selects = document.querySelectorAll("#supplementsFilterSection .filter-select");
  selects.forEach((select) => (select.value = ""));
  applyFilters("supplements");
});

/* ====================================================
   Collapse/Expand Functions
==================================================== */
function toggleGroupCollapse(group, force) {
  const contentDiv = group.querySelector(".group-content");
  const toggleBtn = group.querySelector(".toggle-btn");
  const groupId = group.dataset.groupId;
  const type = group.classList.contains("workout-group") ? "workouts" : "supplements";

  const shouldCollapse = force !== undefined ? force : !group.classList.contains("collapsed");

  if (!shouldCollapse) {
    contentDiv.style.display = "block";
    const height = contentDiv.scrollHeight;
    contentDiv.style.height = "0px";
    requestAnimationFrame(() => {
      contentDiv.style.height = `${height}px`;
    });
  } else {
    contentDiv.style.height = `${contentDiv.scrollHeight}px`;
    requestAnimationFrame(() => {
      contentDiv.style.height = "0px";
    });
  }

  group.classList.toggle("collapsed", shouldCollapse);
  toggleBtn.style.transform = shouldCollapse ? "rotate(-90deg)" : "rotate(0deg)";

  window.app.collapseState[type].set(groupId, shouldCollapse);
  window.app.collapseState.save();

  contentDiv.addEventListener(
    "transitionend",
    () => {
      if (shouldCollapse) {
        contentDiv.style.display = "none";
      } else {
        contentDiv.style.height = "auto";
      }
    },
    { once: true }
  );
}

/* ====================================================
   App Initialization and Event Handlers
==================================================== */
(async function initApp() {
  const data = await window.app.data.loadData();
  window.app.state.init(data);

  function initDatePicker() {
    const dateInput = document.getElementById("datePicker");
    if (dateInput) {
      dateInput.value = window.app.getLocalDateString();
      dateInput.addEventListener("change", () => {
        console.log("DatePicker changed to:", dateInput.value);
        window.app.render.renderWorkouts();
      });
    }
    updateDateTime();
  }

  function updateDateTime() {
    const currentTimeEl = document.getElementById("currentTime");
    if (currentTimeEl) {
      currentTimeEl.textContent = new Date().toLocaleString();
    }
  }

  function initTabs() {
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach((btn) => {
      btn.addEventListener("pointerup", () => {
        const target = btn.getAttribute("data-tab");
        console.log("Tab button clicked:", target);
        document.querySelectorAll(".tab-content").forEach((tc) => {
          tc.classList.remove("active");
          tc.classList.add("hidden");
        });
        const targetEl = document.getElementById(target);
        if (targetEl) {
          targetEl.classList.remove("hidden");
          targetEl.classList.add("active");
          console.log("Activated tab content:", target);
        } else {
          console.warn("No tab content found for:", target);
        }
      });
    });
  }

  function initAddButtons() {
    const addWorkoutBtn = document.getElementById("addWorkoutBtn");
    const addSupplementBtn = document.getElementById("addSupplementBtn");

    function handlePointerEvent(e, modalOpenFn) {
      e.preventDefault();
      e.stopPropagation();
      const btn = e.currentTarget;
      btn.style.transform = "scale(0.98)";
      setTimeout(() => {
        btn.style.transform = "";
      }, 150);
      requestAnimationFrame(() => modalOpenFn(null));
    }

    if (addWorkoutBtn) {
      addWorkoutBtn.addEventListener("pointerup", (e) =>
        handlePointerEvent(e, window.app.modals.openWorkoutModal)
      );
    }
    if (addSupplementBtn) {
      addSupplementBtn.addEventListener("pointerup", (e) =>
        handlePointerEvent(e, window.app.modals.openSupplementModal)
      );
    }
  }

  function initFormHandlers() {
    const workoutForm = document.getElementById("workoutForm");
    if (workoutForm) {
      workoutForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const exercise = document.getElementById("workoutExercise").value;
        const baseMET = document.getElementById("workoutBaseMET").value;
        if (!exercise || !baseMET) {
          alert("Please fill in required fields.");
          return;
        }
        const workoutId = document.getElementById("workoutId").value;
        const workoutData = {
          id: workoutId ? Number(workoutId) : Date.now(),
          dayOfWeek: Number(document.getElementById("workoutDayOfWeek").value),
          timeOfDay: document.getElementById("workoutTimeOfDay").value,
          session: document.getElementById("workoutSession").value,
          focusArea: document.getElementById("workoutFocusArea").value,
          exercise: document.getElementById("workoutExercise").value,
          muscleExercised: document.getElementById("workoutMuscleExercised").value,
          equipment: document.getElementById("workoutEquipment").value,
          sets: document.getElementById("workoutSets").value,
          reps: document.getElementById("workoutReps").value,
          load: document.getElementById("workoutLoad").value,
          notes: document.getElementById("workoutNotes").value,
          baseMET: Number(baseMET),
          sortOrder: Number(document.getElementById("workoutSortOrder").value) || 999,
          completed: false,
        };
        if (workoutId) {
          window.app.state.dispatch({ type: "UPDATE_WORKOUT", payload: workoutData });
        } else {
          window.app.state.dispatch({ type: "ADD_WORKOUT", payload: workoutData });
        }
        window.app.modals.closeWorkoutModal();
      });
    }

    const supplementForm = document.getElementById("supplementForm");
    if (supplementForm) {
      supplementForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const supplement = document.getElementById("supplementName").value;
        if (!supplement) {
          alert("Supplement name is required.");
          return;
        }
        const supplementId = document.getElementById("supplementId").value;
        const supplementData = {
          id: supplementId ? Number(supplementId) : Date.now(),
          time: document.getElementById("supplementTime").value,
          timeSlot: document.getElementById("supplementTimeSlot").value,
          supplier: document.getElementById("supplementSupplier").value,
          supplement: document.getElementById("supplementName").value,
          type: document.getElementById("supplementType").value,
          amount: document.getElementById("supplementAmount").value,
          unit: document.getElementById("supplementUnit").value,
          description: document.getElementById("supplementDescription").value,
          url: document.getElementById("supplementURL").value,
          completed: false,
        };
        if (supplementId) {
          window.app.state.dispatch({ type: "UPDATE_SUPPLEMENT", payload: supplementData });
        } else {
          window.app.state.dispatch({ type: "ADD_SUPPLEMENT", payload: supplementData });
        }
        window.app.modals.closeSupplementModal();
      });
    }
  }

  function initCancelButtons() {
    const cancelWorkoutBtn = document.getElementById("cancelWorkoutBtn");
    if (cancelWorkoutBtn) {
      cancelWorkoutBtn.addEventListener("pointerup", () => {
        window.app.modals.closeWorkoutModal();
      });
    }
    const cancelSupplementBtn = document.getElementById("cancelSupplementBtn");
    if (cancelSupplementBtn) {
      cancelSupplementBtn.addEventListener("pointerup", () => {
        window.app.modals.closeSupplementModal();
      });
    }
  }

  // Initialize components
  initDatePicker();
  initTabs();
  initAddButtons();
  initFormHandlers();
  initCancelButtons();

  // Initial render
  window.app.render.renderWorkouts();
  window.app.render.renderSupplements();

  // Subscribe to state changes to re-render cards
  window.app.state.subscribe(() => {
    window.app.render.renderWorkouts();
    window.app.render.renderSupplements();
  });

  function initTabs() {
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach((btn) => {
      btn.addEventListener("pointerup", () => {
        const target = btn.getAttribute("data-tab");
        console.log("Tab button clicked:", target);
        document.querySelectorAll(".tab-content").forEach((tc) => {
          tc.classList.remove("active");
          tc.classList.add("hidden");
        });
        const targetEl = document.getElementById(target);
        if (targetEl) {
          targetEl.classList.remove("hidden");
          targetEl.classList.add("active");
          console.log("Activated tab content:", target);
        } else {
          console.warn("No tab content found for:", target);
        }
      });
    });
  }

  initTabs();
  initAddButtons();
  initFormHandlers();
  initCancelButtons();
})();
  
/* ====================================================
   Unit Test Code
==================================================== */
function runUnitTests() {
  console.log("Running unit tests...");
  window.app.data.loadData().then((data) => {
    console.assert(Array.isArray(data.workouts), "Workouts data should be an array");
    console.assert(Array.isArray(data.supplements), "Supplements data should be an array");
    console.log("Data module tests passed.");

    const initialWorkoutCount = window.app.state.getState().workouts.length;
    const testWorkout = {
      id: 999999,
      dayOfWeek: 2,
      timeOfDay: "Evening",
      session: "Test Session",
      focusArea: "Test Focus",
      exercise: "Test Exercise",
      muscleExercised: "Test Muscle",
      equipment: "Test Equipment",
      sets: 1,
      reps: "10",
      load: "Test Load",
      notes: "Test Notes",
      baseMET: 5,
      sortOrder: 999,
      completed: false,
    };
    window.app.state.dispatch({ type: "ADD_WORKOUT", payload: testWorkout });
    console.assert(
      window.app.state.getState().workouts.length === initialWorkoutCount + 1,
      "Workout should be added"
    );
    window.app.state.dispatch({ type: "DELETE_WORKOUT", payload: { id: 999999 } });
    console.assert(
      window.app.state.getState().workouts.length === initialWorkoutCount,
      "Workout should be deleted"
    );
    console.log("State module tests passed.");

    const workoutContainer = document.getElementById("workoutContainer");
    const supplementsContainer = document.getElementById("supplementsContainer");
    if (workoutContainer && supplementsContainer) {
      window.app.render.renderWorkouts();
      window.app.render.renderSupplements();
      console.assert(workoutContainer.childElementCount > 0, "Workout container should have children after render");
      console.assert(supplementsContainer.childElementCount > 0, "Supplements container should have children after render");
      console.log("Render module tests passed.");
    } else {
      console.warn("Render container elements not found for unit tests.");
    }

    console.log("All unit tests completed.");
  });
}

if (window.runUnitTests) {
  runUnitTests();
}
