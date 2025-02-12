/* Change Control:
     Path: /workouts/apps.js
     File: apps.js
     Changes:
       - Data Module loads production data asynchronously from:
           Workouts from /workouts/workouts.json
           Supplements from /workouts/supplements.json
       - State Management Module now has an init() method that logs state counts.
       - Render Module logs workouts count before/after filtering.
       - Charts Module logs totals for progress.
       - Added additional logging to renderSupplements and updateProgressCharts.
       - Updated initTabs() to use Tailwind utility classes ("hidden" and "block") so that the active tab displays in the UI.
*/

// BEGIN: Global Error Handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error("Global error:", { msg, url, lineNo, columnNo, error });
    return false;
  };
  // END: Global Error Handling
  
  // BEGIN: Utility Functions
  window.app = window.app || {};
  
  window.app.getLocalDateString = function() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  window.app.debounce = function(func, delay) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };
  // END: Utility Functions
  
  // BEGIN: Data Module
  window.app.data = (function() {
    const WORKOUTS_KEY = 'workouts';
    const SUPPLEMENTS_KEY = 'supplements';
  
    // Default seed data for workouts
    const defaultWorkouts = [
      {
        "id": 300,
        "dayOfWeek": 1,
        "timeOfDay": "Morning",
        "session": "Active Recovery",
        "focusArea": "Light Endurance",
        "exercise": "Treadmill Warm-Up",
        "muscleExercised": "Legs",
        "equipment": "Treadmill",
        "sets": 6,
        "reps": "Minutes",
        "load": "Zone 1",
        "notes": "Light walk ~6–8 min",
        "baseMET": 4,
        "sortOrder": 1,
        "completed": false
      },
      {
        "id": 301,
        "dayOfWeek": 1,
        "timeOfDay": "Morning",
        "session": "Active Recovery",
        "focusArea": "Fascial Integration",
        "exercise": "Stretching",
        "muscleExercised": "Full Body",
        "equipment": "Yoga Mat",
        "sets": 20,
        "reps": "Minutes",
        "load": "Zone 1",
        "notes": "2-minute hold per stretch",
        "baseMET": 4,
        "sortOrder": 2,
        "completed": false
      }
    ];
  
    // Default seed data for supplements
    const defaultSupplements = [
      {
        "id": 301,
        "time": "5:30 AM",
        "timeSlot": "Wake-Up",
        "supplier": "Kicking Horse Coffee",
        "supplement": "Coffee",
        "type": "Liquid",
        "amount": "1",
        "unit": "cup",
        "description": "Mild thermogenic effect; mental clarity",
        "url": "https://www.amazon.com/Kicking-Horse-Coffee-Roast-Whole/dp/B0027Z8VES",
        "completed": false
      },
      {
        "id": 302,
        "time": "5:30 AM",
        "timeSlot": "Wake-Up",
        "supplier": "Bulletproof",
        "supplement": "Brain Octane C8 MCT Oil",
        "type": "Liquid",
        "amount": "1",
        "unit": "Tbsp",
        "description": "Quick energy source; mild thermogenic effect",
        "url": "https://www.amazon.com/Bulletproof-Octane-Reliable-Source-Ketogenic/dp/B00P8E0QQG",
        "completed": false
      },
      {
        "id": 303,
        "time": "5:30 AM",
        "timeSlot": "Wake-Up",
        "supplier": "Fairchild's Brand",
        "supplement": "Apple Cider Vinegar",
        "type": "Liquid",
        "amount": "1",
        "unit": "Tbsp",
        "description": "Digestive & metabolic support",
        "url": "https://www.fairchildsvinegar.com/product/2-pack-of-32-oz-bottles/",
        "completed": false
      },
      {
        "id": 304,
        "time": "5:30 AM",
        "timeSlot": "Wake-Up",
        "supplier": "Thorne",
        "supplement": "Vitamin D + K2",
        "type": "Liquid",
        "amount": "2",
        "unit": "droppers",
        "description": "Bone & immune support",
        "url": "https://www.amazon.com/Thorne-Research-Dispenser-Supplement-Vitamins/dp/B0038NF8MG",
        "completed": false
      }
    ];
  
    async function loadData() {
      let workoutsData = null, supplementsData = null;
      try {
        if (window.localStorage) {
          workoutsData = localStorage.getItem(WORKOUTS_KEY);
          supplementsData = localStorage.getItem(SUPPLEMENTS_KEY);
        }
      } catch (e) {
        console.error("LocalStorage error:", e);
      }
      // Load production workout data from /workouts/workouts.json
      if (!workoutsData) {
        try {
          const response = await fetch("/workouts/workouts.json");
          if (response.ok) {
            workoutsData = await response.text();
            if (window.localStorage) {
              localStorage.setItem(WORKOUTS_KEY, workoutsData);
            }
          }
        } catch (e) {
          console.error("Error fetching workouts.json:", e);
        }
      }
      // Load production supplement data from /workouts/supplements.json
      if (!supplementsData) {
        try {
          const response = await fetch("/workouts/supplements.json");
          if (response.ok) {
            supplementsData = await response.text();
            if (window.localStorage) {
              localStorage.setItem(SUPPLEMENTS_KEY, supplementsData);
            }
          }
        } catch (e) {
          console.error("Error fetching supplements.json:", e);
        }
      }
      return {
        workouts: workoutsData ? JSON.parse(workoutsData) : defaultWorkouts.slice(),
        supplements: supplementsData ? JSON.parse(supplementsData) : defaultSupplements.slice()
      };
    }
  
    function saveData(workouts, supplements) {
      try {
        if (window.localStorage) {
          localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
          localStorage.setItem(SUPPLEMENTS_KEY, JSON.stringify(supplements));
        }
      } catch (err) {
        console.error("Error saving data:", err);
      }
    }
  
    return { loadData, saveData, defaultWorkouts, defaultSupplements };
  })();
  // END: Data Module
  
  // BEGIN: State Management Module
  window.app.state = (function() {
    let state = { workouts: [], supplements: [] };
    const listeners = [];
  
    function subscribe(listener) {
      if (typeof listener === 'function') listeners.push(listener);
    }
  
    function dispatch(action) {
      switch (action.type) {
        case 'UPDATE_WORKOUT':
          state.workouts = state.workouts.map(w =>
            w.id === action.payload.id ? action.payload : w
          );
          break;
        case 'ADD_WORKOUT':
          state.workouts.push(action.payload);
          break;
        case 'DELETE_WORKOUT':
          state.workouts = state.workouts.filter(w => w.id !== action.payload.id);
          break;
        case 'TOGGLE_WORKOUT':
          state.workouts = state.workouts.map(w =>
            w.id === action.payload.id ? { ...w, completed: action.payload.completed } : w
          );
          break;
        case 'UPDATE_SUPPLEMENT':
          state.supplements = state.supplements.map(s =>
            s.id === action.payload.id ? action.payload : s
          );
          break;
        case 'ADD_SUPPLEMENT':
          state.supplements.push(action.payload);
          break;
        case 'DELETE_SUPPLEMENT':
          state.supplements = state.supplements.filter(s => s.id !== action.payload.id);
          break;
        case 'TOGGLE_SUPPLEMENT':
          state.supplements = state.supplements.map(s =>
            s.id === action.payload.id ? { ...s, completed: action.payload.completed } : s
          );
          break;
        case 'RESET':
          state = action.payload;
          break;
        default:
          break;
      }
      window.app.data.saveData(state.workouts, state.supplements);
      listeners.forEach(listener => listener(state));
    }
  
    function getState() {
      return state;
    }
  
    // Initialize state once data is loaded and log counts
    function init(initialData) {
      state = { workouts: initialData.workouts, supplements: initialData.supplements };
      console.log("State initialized: workouts count =", state.workouts.length,
                  "supplements count =", state.supplements.length);
    }
  
    return { subscribe, dispatch, getState, init };
  })();
  // END: State Management Module
  
  // BEGIN: Render Module
  window.app.render = (function(store) {
  
    function createWorkoutCard(workout) {
      const card = document.createElement('div');
      card.className = 'exercise-card border p-4 rounded mb-2 bg-gray-50';
      card.setAttribute('data-id', workout.id);
  
      // Card Header
      const header = document.createElement('div');
      header.className = 'exercise-card-header flex justify-between items-center';
  
      // Left section: drag handle, checkbox, exercise name
      const leftDiv = document.createElement('div');
      leftDiv.className = 'card-left flex items-center gap-2';
  
      const dragHandle = document.createElement('span');
      dragHandle.className = 'drag-handle cursor-grab';
      dragHandle.textContent = '☰';
      leftDiv.appendChild(dragHandle);
  
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = workout.completed;
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        window.app.state.dispatch({
          type: 'TOGGLE_WORKOUT',
          payload: { id: workout.id, completed: e.target.checked }
        });
        window.app.charts.updateProgressCharts();
      });
      leftDiv.appendChild(checkbox);
  
      const exerciseName = document.createElement('span');
      exerciseName.className = 'card-exercise-name font-semibold';
      exerciseName.textContent = workout.exercise;
      leftDiv.appendChild(exerciseName);
      header.appendChild(leftDiv);
  
      // Right section: Update link
      const updateLink = document.createElement('a');
      updateLink.href = "#";
      updateLink.className = 'card-button text-blue-600 underline';
      updateLink.textContent = "Update";
      updateLink.addEventListener('pointerup', (e) => {
        e.preventDefault();
        window.app.modals.openWorkoutModal(workout);
      });
      header.appendChild(updateLink);
  
      card.appendChild(header);
  
      // Details List
      const detailsList = document.createElement('ul');
      detailsList.className = 'exercise-details mt-2 text-sm';
      const fields = [
        { label: "Focus", value: workout.focusArea },
        { label: "Session", value: workout.session },
        { label: "Muscles", value: workout.muscleExercised },
        { label: "Equipment", value: workout.equipment },
        { label: "Sets/Reps", value: `${workout.sets} × ${workout.reps}` },
        { label: "Load", value: workout.load },
        { label: "Notes", value: workout.notes }
      ];
      fields.forEach(field => {
        if (field.value) {
          const li = document.createElement('li');
          li.innerHTML = `<span class="detail-label font-bold">${field.label}:</span> <span class="detail-value">${field.value}</span>`;
          detailsList.appendChild(li);
        }
      });
      card.appendChild(detailsList);
      return card;
    }
  
    function renderWorkouts() {
      try {
        const container = document.getElementById('workoutContainer');
        container.innerHTML = '';
        let workouts = store.getState().workouts;
        console.log("RenderWorkouts: initial workouts count =", workouts.length);
  
        // Filter workouts by selected date (if any)
        const selectedDate = document.getElementById('datePicker')?.value;
        if (selectedDate) {
          const parts = selectedDate.split('-');
          const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          let selectedDay = dateObj.getDay();
          selectedDay = selectedDay === 0 ? 7 : selectedDay;
          console.log('RenderWorkouts: selectedDay:', selectedDay);
          workouts = workouts.filter(w => w.dayOfWeek === selectedDay);
          console.log("RenderWorkouts: workouts count after filtering =", workouts.length);
        }
  
        // Group workouts by timeOfDay
        const groups = workouts.reduce((acc, workout) => {
          const key = workout.timeOfDay;
          if (!acc[key]) acc[key] = [];
          acc[key].push(workout);
          return acc;
        }, {});
  
        // Sort groups: Morning first, then Evening
        const orderMap = { "Morning": 1, "Evening": 2 };
        Object.entries(groups)
          .sort(([a], [b]) => orderMap[a] - orderMap[b])
          .forEach(([timeOfDay, group]) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'exercise-group mb-4 border rounded overflow-hidden';
  
            // Group header with toggle
            const headerDiv = document.createElement('div');
            headerDiv.className = 'group-header bg-gray-200 p-2 flex justify-between items-center cursor-pointer';
            headerDiv.innerHTML = `<span class="group-title font-bold">${timeOfDay}</span> <button class="toggle-btn">▼</button>`;
            groupDiv.appendChild(headerDiv);
  
            const contentDiv = document.createElement('div');
            contentDiv.className = 'group-content p-2';
            group.sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999))
              .forEach(workout => {
                const card = createWorkoutCard(workout);
                contentDiv.appendChild(card);
              });
            groupDiv.appendChild(contentDiv);
  
            headerDiv.addEventListener('click', () => {
              groupDiv.classList.toggle('collapsed');
              const toggleBtn = headerDiv.querySelector('.toggle-btn');
              toggleBtn.style.transform = groupDiv.classList.contains('collapsed') ? 'rotate(-90deg)' : 'rotate(0deg)';
            });
            container.appendChild(groupDiv);
          });
  
        // Enable drag-and-drop with Sortable.js
        if (typeof Sortable !== 'undefined') {
          Sortable.create(container, {
            animation: 150,
            handle: '.drag-handle',
            onEnd: function() {
              const cards = container.querySelectorAll('.exercise-card');
              cards.forEach((card, index) => {
                const id = parseInt(card.getAttribute('data-id'));
                const workout = store.getState().workouts.find(w => w.id === id);
                if (workout) {
                  workout.sortOrder = index + 1;
                }
              });
              window.app.state.dispatch({ type: 'UPDATE_WORKOUT', payload: { id: -1 } });
            }
          });
        } else {
          console.error("Sortable is not defined");
        }
      } catch (error) {
        console.error('Error rendering workouts:', error);
      }
    }
  
    function renderSupplements() {
      try {
        const container = document.getElementById('supplementsContainer');
        container.innerHTML = '';
        let supplements = store.getState().supplements;
        console.log("RenderSupplements: supplements data loaded:", supplements);
        
        supplements.sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
        const groups = {};
        supplements.forEach(item => {
          const key = item.time + " (" + item.timeSlot + ")";
          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
        });
        console.log("RenderSupplements: grouped supplements:", groups);
        
        Object.keys(groups).forEach(group => {
          const groupDiv = document.createElement('div');
          const groupTitle = document.createElement('div');
          groupTitle.className = 'group-title font-bold my-2';
          groupTitle.textContent = group;
          groupDiv.appendChild(groupTitle);
          groups[group].forEach(item => {
            const card = document.createElement('div');
            card.className = 'supplement-card border p-4 rounded mb-2 bg-gray-50';
            card.setAttribute('data-id', item.id);
  
            const titleDiv = document.createElement('div');
            titleDiv.className = 'supplement-title flex items-center gap-2';
  
            const dragHandle = document.createElement('span');
            dragHandle.className = 'drag-handle cursor-grab';
            dragHandle.textContent = '☰';
            titleDiv.appendChild(dragHandle);
  
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.completed;
            checkbox.addEventListener('change', (e) => {
              window.app.state.dispatch({
                type: 'TOGGLE_SUPPLEMENT',
                payload: { id: item.id, completed: e.target.checked }
              });
            });
            titleDiv.appendChild(checkbox);
  
            const nameSpan = document.createElement('span');
            nameSpan.className = 'supplement-name font-semibold';
            nameSpan.textContent = item.supplement;
            titleDiv.appendChild(nameSpan);
  
            const updateLink = document.createElement('a');
            updateLink.href = "#";
            updateLink.className = 'card-button text-blue-600 underline';
            updateLink.textContent = "Update";
            updateLink.addEventListener('pointerup', (e) => {
              e.preventDefault();
              window.app.modals.openSupplementModal(item);
            });
            titleDiv.appendChild(updateLink);
            card.appendChild(titleDiv);
  
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'supplement-details mt-2 text-sm';
            detailsDiv.textContent = (item.type ? item.type + ", " : "") +
                                     (item.amount + " " + item.unit).trim() +
                                     " – " + item.description;
            card.appendChild(detailsDiv);
            groupDiv.appendChild(card);
          });
          container.appendChild(groupDiv);
          console.log("RenderSupplements: Rendered group:", group, "with", groups[group].length, "items");
        });
        
        if (typeof Sortable !== 'undefined') {
          Sortable.create(container, {
            animation: 150,
            handle: '.drag-handle',
            onEnd: function() {
              const cards = container.querySelectorAll('.supplement-card');
              cards.forEach((card, index) => {
                const id = parseInt(card.getAttribute('data-id'));
                const supplement = store.getState().supplements.find(s => s.id === id);
                if (supplement) {
                  supplement.sortOrder = index + 1;
                }
              });
              window.app.state.dispatch({ type: 'UPDATE_SUPPLEMENT', payload: { id: -1 } });
            }
          });
        } else {
          console.error("Sortable is not defined");
        }
      } catch (error) {
        console.error('Error rendering supplements:', error);
      }
    }
  
    window.app.render = {
      renderWorkouts: renderWorkouts,
      renderSupplements: renderSupplements,
      createWorkoutCard: createWorkoutCard
    };
  
    return window.app.render;
  })(window.app.state);
  // END: Render Module
  
  // BEGIN: Charts Module
  window.app.charts = (function(store) {
    const chartInstances = {
      dailyMET: null,
      dailyCompleted: null,
      weeklyCompleted: null
    };
  
    function updateProgressCharts() {
      const state = store.getState();
      const totalWorkouts = state.workouts.length;
      const completedWorkouts = state.workouts.filter(w => w.completed).length;
      const totalSupplements = state.supplements.length;
      const completedSupplements = state.supplements.filter(s => s.completed).length;
      console.log("updateProgressCharts:", { totalWorkouts, completedWorkouts, totalSupplements, completedSupplements });
  
      document.getElementById('dailyProgress').textContent = `${completedWorkouts}/${totalWorkouts}`;
      document.getElementById('weeklyProgress').textContent = `${completedWorkouts + completedSupplements}/${totalWorkouts + totalSupplements}`;
  
      const dailyMETCtx = document.getElementById('dailyMETChart')?.getContext('2d');
      if (dailyMETCtx) {
        const workoutLabels = state.workouts.map(w => w.exercise);
        const workoutMETData = state.workouts.map(w => w.completed ? w.baseMET : 0);
        if (chartInstances.dailyMET && typeof chartInstances.dailyMET.destroy === 'function') {
          chartInstances.dailyMET.destroy();
        }
        chartInstances.dailyMET = new Chart(dailyMETCtx, {
          type: 'line',
          data: {
            labels: workoutLabels,
            datasets: [{
              label: 'Daily METs (Workouts)',
              data: workoutMETData,
              backgroundColor: 'rgba(0,123,255,0.5)',
              borderColor: 'rgba(0,123,255,1)',
              fill: true,
              tension: 0.2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { autoSkip: true, maxRotation: 45, minRotation: 45 } },
              y: { beginAtZero: true }
            },
            plugins: { legend: { position: 'bottom' } }
          }
        });
      }
  
      const dailyCompletedCtx = document.getElementById('dailyCompletedChart')?.getContext('2d');
      if (dailyCompletedCtx) {
        const dailyCompleted = completedWorkouts;
        const dailyRemaining = totalWorkouts - completedWorkouts;
        if (chartInstances.dailyCompleted && typeof chartInstances.dailyCompleted.destroy === 'function') {
          chartInstances.dailyCompleted.destroy();
        }
        chartInstances.dailyCompleted = new Chart(dailyCompletedCtx, {
          type: 'pie',
          data: {
            labels: ['Workouts Completed', 'Remaining'],
            datasets: [{
              data: [dailyCompleted, dailyRemaining],
              backgroundColor: ['#28a745', '#dc3545']
            }]
          },
          options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
      }
  
      const weeklyCompletedCtx = document.getElementById('weeklyCompletedChart')?.getContext('2d');
      if (weeklyCompletedCtx) {
        const totalCombined = totalWorkouts + totalSupplements;
        const completedCombined = completedWorkouts + completedSupplements;
        const remainingCombined = totalCombined - completedCombined;
        if (chartInstances.weeklyCompleted && typeof chartInstances.weeklyCompleted.destroy === 'function') {
          chartInstances.weeklyCompleted.destroy();
        }
        chartInstances.weeklyCompleted = new Chart(weeklyCompletedCtx, {
          type: 'pie',
          data: {
            labels: ['Total Completed', 'Remaining'],
            datasets: [{
              data: [completedCombined, remainingCombined],
              backgroundColor: ['#28a745', '#dc3545']
            }]
          },
          options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
      }
    }
  
    function cleanup() {
      Object.values(chartInstances).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
      Object.keys(chartInstances).forEach(key => chartInstances[key] = null);
    }
  
    const updateProgressChartsDebounced = window.app.debounce(updateProgressCharts, 50);
  
    window.app.charts = { 
      updateProgressCharts: updateProgressCharts, 
      updateProgressChartsDebounced: updateProgressChartsDebounced,
      cleanup: cleanup
    };
  
    return window.app.charts;
  })(window.app.state);
  // END: Charts Module
  
  // BEGIN: Modals Module
  window.app.modals = (function() {
    const MODAL_SELECTORS = {
      workout: '#workoutModal',
      supplement: '#supplementModal'
    };
  
    function toggleFormFields(type, action) {
      const modal = document.querySelector(MODAL_SELECTORS[type]);
      const form = modal.querySelector(`#${type}Form`);
      const submitBtn = form.querySelector('button[type="submit"]');
      Array.from(form.querySelectorAll('.form-field')).forEach(field => {
        field.style.display = action === 'update' ? 'block' : 'none';
      });
      submitBtn.textContent = action === 'update' ? 'Update' : 'Delete';
      submitBtn.classList.toggle('btn-danger', action === 'delete');
    }
  
    function setupModalHandlers() {
      document.addEventListener('DOMContentLoaded', () => {
        Object.entries(MODAL_SELECTORS).forEach(([type, selector]) => {
          const modal = document.querySelector(selector);
          const form = modal ? modal.querySelector(`#${type}Form`) : null;
          const cancelBtn = modal ? modal.querySelector(`#cancel${type.charAt(0).toUpperCase() + type.slice(1)}Btn`) : null;
          if (!modal || !form || !cancelBtn) {
            console.error(`Modal components missing for ${type}`);
            return;
          }
          const radioButtons = modal.querySelectorAll(`input[name="${type}Action"]`);
          radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => {
              toggleFormFields(type, e.target.value);
            });
          });
          cancelBtn.addEventListener('click', () => closeModal(type));
          modal.addEventListener('click', (e) => {
            if (e.target === modal) { closeModal(type); }
          });
          form.addEventListener('submit', (e) => {
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
      toggleFormFields(type, 'update');
      if (item) { populateModalFields(type, item); }
      requestAnimationFrame(() => {
        modal.classList.add('modal-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    }
  
    function closeModal(type) {
      const modal = document.querySelector(MODAL_SELECTORS[type]);
      if (!modal) return;
      modal.classList.remove('modal-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  
    function populateModalFields(type, item) {
      const modal = document.querySelector(MODAL_SELECTORS[type]);
      if (!modal) return;
      const fieldsMap = {
        workout: [
          'Id', 'DayOfWeek', 'TimeOfDay', 'Session', 'FocusArea', 
          'Exercise', 'MuscleExercised', 'Equipment', 'Sets', 
          'Reps', 'Load', 'Notes', 'BaseMET', 'SortOrder'
        ],
        supplement: [
          'Id', 'Time', 'TimeSlot', 'Supplier', 'Name', 
          'Type', 'Amount', 'Unit', 'Description', 'URL'
        ]
      };
      fieldsMap[type].forEach(field => {
        const normalizedField = field.charAt(0).toLowerCase() + field.slice(1);
        const input = modal.querySelector(`#${type}${field}`);
        if (input) { input.value = item[normalizedField] || ''; }
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
      if (action === 'delete') {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) { return; }
        const id = form.querySelector(`#${type}Id`).value;
        window.app.state.dispatch({
          type: `DELETE_${type.toUpperCase()}`,
          payload: { id: Number(id) }
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
              let normalizedKey = keyWithoutPrefix ? keyWithoutPrefix.charAt(0).toLowerCase() + keyWithoutPrefix.slice(1) : keyWithoutPrefix;
              return [normalizedKey, v];
            })
          )
        }
      });
      alert(id ? `${type} updated successfully!` : `New ${type} added successfully!`);
      closeModal(type);
    }
  
    setupModalHandlers();
  
    window.app.modals = {
      openWorkoutModal: (item) => openModal('workout', item),
      openSupplementModal: (item) => openModal('supplement', item),
      closeWorkoutModal: () => closeModal('workout'),
      closeSupplementModal: () => closeModal('supplement')
    };
  
    return window.app.modals;
  })(window.app.state);
  // END: Modals Module
  
  // BEGIN: App Initialization and Event Handlers
  (async function initApp() {
    // Load data asynchronously and initialize state
    const data = await window.app.data.loadData();
    window.app.state.init(data);
  
    function initDatePicker() {
      const dateInput = document.getElementById('datePicker');
      if (dateInput) {
        dateInput.value = window.app.getLocalDateString();
        dateInput.addEventListener('change', () => {
          console.log("DatePicker changed to:", dateInput.value);
          window.app.render.renderWorkouts();
          window.app.charts.updateProgressChartsDebounced();
        });
      }
      updateDateTime();
    }
  
    function updateDateTime() {
      const currentTimeEl = document.getElementById('currentTime');
      if (currentTimeEl) {
        currentTimeEl.textContent = new Date().toLocaleString();
      }
    }
  
    function initTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
          btn.addEventListener('pointerup', () => {
            const target = btn.getAttribute('data-tab');
            console.log("Tab button clicked:", target);
            // Hide all tab content by removing "active" and adding "hidden"
            document.querySelectorAll('.tab-content').forEach(tc => {
              tc.classList.remove('active');
              tc.classList.add('hidden');
            });
            // Activate the target tab content
            const targetEl = document.getElementById(target);
            if (targetEl) {
              targetEl.classList.remove('hidden');
              targetEl.classList.add('active');
              console.log("Activated tab content:", target);
              if (target === 'tab-progress') {
                window.app.charts.updateProgressCharts();
              }
            } else {
              console.warn("No tab content found for:", target);
            }
          });
        });
      }
      
  
    function initAddButtons() {
      const addWorkoutBtn = document.getElementById('addWorkoutBtn');
      const addSupplementBtn = document.getElementById('addSupplementBtn');
  
      function handlePointerEvent(e, modalOpenFn) {
        e.preventDefault();
        e.stopPropagation();
        const btn = e.currentTarget;
        btn.style.transform = 'scale(0.98)';
        setTimeout(() => { btn.style.transform = ''; }, 150);
        requestAnimationFrame(() => modalOpenFn(null));
      }
  
      if (addWorkoutBtn) {
        addWorkoutBtn.addEventListener('pointerup', e =>
          handlePointerEvent(e, window.app.modals.openWorkoutModal)
        );
      }
      if (addSupplementBtn) {
        addSupplementBtn.addEventListener('pointerup', e =>
          handlePointerEvent(e, window.app.modals.openSupplementModal)
        );
      }
    }
  
    function initFormHandlers() {
      const workoutForm = document.getElementById("workoutForm");
      if (workoutForm) {
        workoutForm.addEventListener("submit", function(e) {
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
            completed: false
          };
          if (workoutId) {
            window.app.state.dispatch({ type: 'UPDATE_WORKOUT', payload: workoutData });
          } else {
            window.app.state.dispatch({ type: 'ADD_WORKOUT', payload: workoutData });
          }
          window.app.modals.closeWorkoutModal();
        });
      }
  
      const supplementForm = document.getElementById("supplementForm");
      if (supplementForm) {
        supplementForm.addEventListener("submit", function(e) {
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
            completed: false
          };
          if (supplementId) {
            window.app.state.dispatch({ type: 'UPDATE_SUPPLEMENT', payload: supplementData });
          } else {
            window.app.state.dispatch({ type: 'ADD_SUPPLEMENT', payload: supplementData });
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
  
    // Initialize application after data is loaded and state is set.
    initDatePicker();
    initTabs();
    initAddButtons();
    initFormHandlers();
    initCancelButtons();
    window.app.render.renderWorkouts();
    window.app.render.renderSupplements();
    window.app.charts.updateProgressChartsDebounced();
    window.app.state.subscribe(() => {
      window.app.render.renderWorkouts();
      window.app.render.renderSupplements();
      window.app.charts.updateProgressCharts();
    });
  })();
  // END: App Initialization and Event Handlers
  
  // BEGIN: Unit Test Code
  function runUnitTests() {
    console.log("Running unit tests...");
  
    window.app.data.loadData().then(data => {
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
        completed: false
      };
      window.app.state.dispatch({ type: 'ADD_WORKOUT', payload: testWorkout });
      console.assert(window.app.state.getState().workouts.length === initialWorkoutCount + 1, "Workout should be added");
      window.app.state.dispatch({ type: 'DELETE_WORKOUT', payload: { id: 999999 } });
      console.assert(window.app.state.getState().workouts.length === initialWorkoutCount, "Workout should be deleted");
      console.log("State module tests passed.");
  
      const workoutContainer = document.getElementById('workoutContainer');
      const supplementsContainer = document.getElementById('supplementsContainer');
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
  // END: Unit Test Code
  