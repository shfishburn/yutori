// protocols.js - Fixed Implementation

/* ====================================================
   Global Error Handling & Initial Setup
==================================================== */
window.app = window.app || {};

// Centralized Error Logging Mechanism
window.app.errorLogger = {
  log: function(context, error, additionalInfo = {}) {
    const timestamp = new Date().toISOString();
    const errorLog = {
      timestamp,
      context,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      ...additionalInfo
    };

    // Console logging for development
    console.error(`[${context}] Error:`, errorLog);

    // Optional: Add telemetry or error tracking
    if (window.app.telemetry) {
      window.app.telemetry.reportError(errorLog);
    }
  },

  // Method for tracking events
  track: function(event, details = {}) {
    const trackLog = {
      timestamp: new Date().toISOString(),
      event,
      ...details
    };

    console.log(`[TRACK] ${event}:`, trackLog);

    // Optional: Send to telemetry if available
    if (window.app.telemetry) {
      window.app.telemetry.trackEvent(trackLog);
    }
  }
};

window.app.debounce = function(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
};

window.onerror = function(msg, url, lineNo, columnNo, error) {
  window.app.errorLogger.log('GlobalError', 
    new Error(msg), 
    { 
      url, 
      lineNo, 
      columnNo,
      userAgent: navigator.userAgent
    }
  );
  return false;
};


/* ====================================================
   Utility Functions
==================================================== */
window.app.getLocalDateString = function() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/* ====================================================
   Data Module
==================================================== */
window.app.data = (function() {
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
    }
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
    }
  ];

  async function loadData() {
    let workoutsData = null, supplementsData = null;
    
    try {
      const response = await fetch('/protocols/workouts.json');
      if (response.ok) {
        workoutsData = await response.json();
      } else {
        console.error('Failed to fetch workouts.json, status:', response.status);
      }
    } catch (e) {
      console.error('Error fetching workouts.json:', e);
    }
    
    try {
      const response = await fetch('/protocols/supplements.json');
      if (response.ok) {
        supplementsData = await response.json();
      } else {
        console.error('Failed to fetch supplements.json, status:', response.status);
      }
    } catch (e) {
      console.error('Error fetching supplements.json:', e);
    }

    return {
      workouts: workoutsData || defaultWorkouts.slice(),
      supplements: supplementsData || defaultSupplements.slice()
    };
  }

  function saveData(workouts, supplements) {
    console.log('Saving data is disabled in production mode.');
  }

  return { loadData, saveData, defaultWorkouts, defaultSupplements };
})();

/* ====================================================
   State Management Module
==================================================== */
window.app.state = (function() {
  let state = { workouts: [], supplements: [] };
  const listeners = new Set();

  function subscribe(listener) {
    if (typeof listener === 'function') {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  }

  function dispatch(action) {
    const prevState = { ...state };
    
    switch (action.type) {
      case 'UPDATE_WORKOUT':
        state.workouts = state.workouts.map(w =>
          w.id === action.payload.id ? action.payload : w
        );
        break;
        
      case 'TOGGLE_WORKOUT':
        state.workouts = state.workouts.map(w =>
          w.id === action.payload.id ? { ...w, completed: action.payload.completed } : w
        );
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
        return;
    }

    if (JSON.stringify(prevState) !== JSON.stringify(state)) {
      listeners.forEach(listener => listener(state));
    }
  }

  function getState() {
    return state;
  }

  function init(initialData) {
    state = {
      workouts: initialData.workouts,
      supplements: initialData.supplements
    };
    console.log(
      'State initialized: workouts count =',
      state.workouts.length,
      'supplements count =',
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
      const state = {
        workouts: Object.fromEntries(this.workouts),
        supplements: Object.fromEntries(this.supplements)
      };
      localStorage.setItem('collapseState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving collapse state:', error);
    }
  },
  
  load() {
    try {
      const saved = localStorage.getItem('collapseState');
      if (saved) {
        const state = JSON.parse(saved);
        this.workouts = new Map(Object.entries(state.workouts));
        this.supplements = new Map(Object.entries(state.supplements));
      }
    } catch (error) {
      console.error('Error loading collapse state:', error);
    }
  },
  
  reset() {
    this.workouts.clear();
    this.supplements.clear();
    try {
      localStorage.removeItem('collapseState');
    } catch (error) {
      console.error('Error resetting collapse state:', error);
    }
  }
};

/* ====================================================
   Group Collapse/Expand Functionality
==================================================== */
function toggleGroupCollapse(group, force) {
  if (!group) return;

  const contentDiv = group.querySelector('.group-content');
  const toggleBtn = group.querySelector('.toggle-btn');
  
  if (!contentDiv || !toggleBtn) {
    console.warn('Required elements not found in group:', group);
    return;
  }

  const groupId = group.dataset.groupId;
  const type = group.classList.contains('workout-group') ? 'workouts' : 'supplements';
  const shouldCollapse = force !== undefined ? force : !group.classList.contains('collapsed');

  // Store current scroll position
  const scrollPosition = window.scrollY;

  // Remove any existing transition styles
  contentDiv.style.removeProperty('height');
  contentDiv.style.removeProperty('display');
  contentDiv.style.removeProperty('transition');

  if (!shouldCollapse) {
    // Expanding
    contentDiv.style.display = 'block';
    contentDiv.style.height = '0px';
    
    // Force browser reflow
    contentDiv.offsetHeight;

    const height = contentDiv.scrollHeight;
    contentDiv.style.transition = 'height 0.3s ease-in-out';
    contentDiv.style.height = `${height}px`;

    group.classList.remove('collapsed');
    toggleBtn.style.transform = 'rotate(0deg)';
  } else {
    // Collapsing
    const height = contentDiv.scrollHeight;
    contentDiv.style.height = `${height}px`;
    
    // Force browser reflow
    contentDiv.offsetHeight;

    contentDiv.style.transition = 'height 0.3s ease-in-out';
    contentDiv.style.height = '0px';

    group.classList.add('collapsed');
    toggleBtn.style.transform = 'rotate(-90deg)';
  }

  // Update collapse state
  window.app.collapseState[type].set(groupId, shouldCollapse);
  window.app.collapseState.save();

  // Handle transition completion
  const transitionEndHandler = function() {
    contentDiv.removeEventListener('transitionend', transitionEndHandler);
    
    if (shouldCollapse) {
      contentDiv.style.display = 'none';
    } else {
      contentDiv.style.removeProperty('height');
    }

    // Clean up transition
    contentDiv.style.removeProperty('transition');

    // Restore scroll position
    window.scrollTo(0, scrollPosition);

    // Re-render content if expanding
    if (!shouldCollapse) {
      if (type === 'workouts') {
        window.app.render.renderWorkouts();
      } else {
        window.app.render.renderSupplements();
      }
    }
  };

  contentDiv.addEventListener('transitionend', transitionEndHandler, { once: true });
}

/* ====================================================
   Render Module
==================================================== */
window.app.render = (function(store) {
  function createWorkoutCard(workout) {
    const card = document.createElement('div');
    card.className = 'workout-card card border p-4 rounded mb-2 bg-gray-50';
    card.dataset.timeOfDay = workout.timeOfDay;
    card.dataset.session = workout.session;
    card.dataset.focusArea = workout.focusArea;
    card.dataset.muscleExercised = workout.muscleExercised;
    card.dataset.equipment = workout.equipment;
    card.dataset.id = workout.id;

    const header = document.createElement('div');
    header.className = 'exercise-card-header flex justify-between items-center';

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
      store.dispatch({
        type: 'TOGGLE_WORKOUT',
        payload: { id: workout.id, completed: e.target.checked }
      });
    });
    leftDiv.appendChild(checkbox);

    const exerciseName = document.createElement('span');
    exerciseName.className = 'card-exercise-name font-semibold';
    exerciseName.textContent = workout.exercise;
    leftDiv.appendChild(exerciseName);

    header.appendChild(leftDiv);
    card.appendChild(header);

    const detailsList = document.createElement('ul');
    detailsList.className = 'exercise-details mt-2 text-sm';
    
    const fields = [
      { label: 'Focus', value: workout.focusArea },
      { label: 'Session', value: workout.session },
      { label: 'Muscles', value: workout.muscleExercised },
      { label: 'Equipment', value: workout.equipment },
      { label: 'Sets/Reps', value: `${workout.sets} × ${workout.reps}` },
      { label: 'Load', value: workout.load },
      { label: 'Notes', value: workout.notes }
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
      if (!container) {
        console.warn('Workout container not found');
        return;
      }
  
      container.innerHTML = '';
      let workouts = store.getState().workouts;
  
      // Filter by selected date
      const selectedDate = document.getElementById('datePicker')?.value;
      if (selectedDate) {
        // Create a Date object with time set to noon in local time zone
        // This avoids timezone issues when using getDay()
        const parts = selectedDate.split('-');
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // JavaScript months are 0-indexed
        const day = parseInt(parts[2]);
        
        const dateObj = new Date(year, month, day, 12, 0, 0);
        
        // Get the day of week (0-6) and convert to 1-7 format for JSON
        const jsDay = dateObj.getDay();
        const jsonDay = jsDay === 0 ? 7 : jsDay;
        
        console.log('Date selected:', selectedDate);
        console.log('JavaScript day (0-6):', jsDay);
        console.log('JSON day format (1-7):', jsonDay);
        
        // Filter workouts using the converted day format
        workouts = workouts.filter(w => w.dayOfWeek === jsonDay);
        
        console.log('Workouts being shown:', workouts.map(w => ({day: w.dayOfWeek, exercise: w.exercise})));
      }
      
      // Group workouts by timeOfDay
      const groups = workouts.reduce((acc, workout) => {
        const key = workout.timeOfDay;
        if (!acc[key]) acc[key] = [];
        acc[key].push(workout);
        return acc;
      }, {});
  
      // Count total workouts
      const totalDayWorkouts = workouts.length;
      const morningWorkouts = groups['Morning'] ? groups['Morning'].length : 0;
      const eveningWorkouts = groups['Evening'] ? groups['Evening'].length : 0;
  
      // Add workout count summary
      const summaryDiv = document.createElement('div');
      summaryDiv.className = 'workout-summary mb-4 p-2 bg-gray-100 rounded';
      summaryDiv.innerHTML = `
        <p class="font-bold">
          Total Workouts: ${totalDayWorkouts} 
          (Morning: ${morningWorkouts}, Evening: ${eveningWorkouts})
        </p>
      `;
      container.appendChild(summaryDiv);
  
      const orderMap = { Morning: 1, Evening: 2 };
      
      Object.entries(groups)
        .sort(([a], [b]) => orderMap[a] - orderMap[b])
        .forEach(([timeOfDay, groupWorkouts]) => {
          const groupDiv = document.createElement('div');
          groupDiv.className = 'workout-group card-container exercise-group mb-4 border rounded overflow-hidden';
          groupDiv.dataset.groupId = timeOfDay;
  
          const headerDiv = document.createElement('div');
          headerDiv.className = 'group-header bg-gray-200 p-2 flex justify-between items-center cursor-pointer';
          headerDiv.innerHTML = `
            <span class="group-title font-bold">${timeOfDay}</span>
            <span class="toggle-btn">▼</span>
          `;
  
          const contentDiv = document.createElement('div');
          contentDiv.className = 'group-content p-2';
  
          // Sort and add workout cards
          groupWorkouts
            .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999))
            .forEach(workout => {
              contentDiv.appendChild(createWorkoutCard(workout));
            });
  
          groupDiv.appendChild(headerDiv);
          groupDiv.appendChild(contentDiv);
  
          // Initialize collapse state
          if (window.app.collapseState.workouts.get(timeOfDay)) {
            toggleGroupCollapse(groupDiv, true);
          }
  
          // Add event listeners
          headerDiv.addEventListener('click', e => {
            e.stopPropagation();
            toggleGroupCollapse(groupDiv);
          });
  
          // Initialize Sortable
          if (typeof Sortable !== 'undefined') {
            Sortable.create(contentDiv, {
              animation: 150,
              handle: '.drag-handle',
              onEnd: function() {
                const cards = contentDiv.querySelectorAll('.workout-card');
                cards.forEach((card, index) => {
                  const id = parseInt(card.dataset.id);
                  const workout = store.getState().workouts.find(w => w.id === id);
                  if (workout) {
                    workout.sortOrder = index + 1;
                  }
                });
                store.dispatch({ 
                  type: 'UPDATE_WORKOUT',
                  payload: { id: -1 }
                });
              }
            });
          }
  
          container.appendChild(groupDiv);
        });
    } catch (error) {
      console.error('Error rendering workouts:', error);
    }
}

 function renderSupplements() {
  try {
    const container = document.getElementById('supplementsContainer');
    if (!container) {
      console.warn('Supplements container not found');
      return;
    }

    container.innerHTML = '';
    const supplements = store.getState().supplements;

    // Group supplements by timeSlot
    const groups = supplements.reduce((acc, supp) => {
      const key = supp.timeSlot;
      if (!acc[key]) acc[key] = [];
      acc[key].push(supp);
      return acc;
    }, {});

    // Sort groups by earliest time in each group
    const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
      const minTimeA = Math.min(...groups[a].map(s => {
        const [h, m] = s.time.split(':').map(Number);
        return h * 60 + m;
      }));
      const minTimeB = Math.min(...groups[b].map(s => {
        const [h, m] = s.time.split(':').map(Number);
        return h * 60 + m;
      }));
      return minTimeA - minTimeB;
    });

    sortedGroupKeys.forEach(timeSlot => {
      // Sort supplements within group by time
      groups[timeSlot].sort((a, b) => {
        const [ah, am] = a.time.split(':').map(Number);
        const [bh, bm] = b.time.split(':').map(Number);
        const timeA = ah * 60 + am;
        const timeB = bh * 60 + bm;
        return timeA === timeB ? a.supplement.localeCompare(b.supplement) : timeA - timeB;
      });

      const groupDiv = document.createElement('div');
      groupDiv.className = 'supplement-group card-container mb-4 border rounded overflow-hidden';
      groupDiv.dataset.groupId = timeSlot;

      const headerDiv = document.createElement('div');
      headerDiv.className = 'group-header bg-gray-200 p-2 flex justify-between items-center cursor-pointer';
      headerDiv.innerHTML = `
        <span class="group-title font-bold">${timeSlot}</span>
        <span class="toggle-btn">▼</span>
      `;

      const contentDiv = document.createElement('div');
      contentDiv.className = 'group-content p-2';

      groups[timeSlot].forEach(supplement => {
        const card = document.createElement('div');
        card.className = 'supplement-card card border p-4 rounded mb-2 bg-gray-50';
        card.dataset.timeSlot = supplement.timeSlot;
        card.dataset.type = supplement.type;
        card.dataset.supplier = supplement.supplier;
        card.dataset.id = supplement.id;

        const header = document.createElement('div');
        header.className = 'supplement-header flex justify-between items-center';
        
        const leftDiv = document.createElement('div');
        leftDiv.className = 'flex items-center gap-2';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = supplement.completed;
        checkbox.addEventListener('change', (e) => {
          e.stopPropagation();
          store.dispatch({
            type: 'TOGGLE_SUPPLEMENT',
            payload: { id: supplement.id, completed: e.target.checked }
          });
        });
        leftDiv.appendChild(checkbox);

        const name = document.createElement('span');
        name.className = 'supplement-name font-semibold';
        name.textContent = supplement.supplement;
        leftDiv.appendChild(name);

        header.appendChild(leftDiv);
        card.appendChild(header);

        const detailsList = document.createElement('ul');
        detailsList.className = 'supplement-details mt-2 text-sm';
        
        const fields = [
          { label: 'Time', value: supplement.time },
          { label: 'Supplier', value: supplement.supplier },
          { label: 'Type', value: supplement.type },
          { label: 'Amount', value: supplement.amount },
          { label: 'Unit', value: supplement.unit },
          { label: 'Description', value: supplement.description }
        ];

        fields.forEach(field => {
          if (field.value) {
            const li = document.createElement('li');
            li.innerHTML = `<span class="detail-label font-bold">${field.label}:</span> <span class="detail-value">${field.value}</span>`;
            detailsList.appendChild(li);
          }
        });

        card.appendChild(detailsList);
        contentDiv.appendChild(card);
      });

      groupDiv.appendChild(headerDiv);
      groupDiv.appendChild(contentDiv);

      // Initialize collapse state
      if (window.app.collapseState.supplements.get(timeSlot)) {
        toggleGroupCollapse(groupDiv, true);
      }

      // Add event listeners
      headerDiv.addEventListener('click', e => {
        e.stopPropagation();
        toggleGroupCollapse(groupDiv);
      });

      container.appendChild(groupDiv);
    });
  } catch (error) {
    console.error('Error rendering supplements:', error);
  }
}

return {
  renderWorkouts,
  renderSupplements,
  createWorkoutCard
};
})(window.app.state);

/* ====================================================
 App Initialization
==================================================== */
(async function initApp() {
try {
  // Load initial data
  const data = await window.app.data.loadData();
  window.app.state.init(data);

  // Load saved collapse states
  window.app.collapseState.load();

  // Initialize date picker
  const dateInput = document.getElementById('datePicker');
  if (dateInput) {
    dateInput.value = window.app.getLocalDateString();
    dateInput.addEventListener('change', () => {
      console.log('DatePicker changed to:', dateInput.value);
      window.app.render.renderWorkouts();
    });
  }

  // Initialize tab switching with chart updates
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      
      // Hide all tab content
      document.querySelectorAll('.tab-content').forEach(tc => {
        tc.classList.remove('active');
        tc.classList.add('hidden');
      });
      
      // Show selected tab content
      const targetEl = document.getElementById(target);
      if (targetEl) {
        targetEl.classList.remove('hidden');
        targetEl.classList.add('active');
        
        // If switching to progress tab, update charts
        if (target === 'tab-progress' && window.app.charts) {
          setTimeout(() => window.app.charts.updateCharts(), 100);
        }
      }

      // Update active state of tab buttons
      tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === target) {
          button.classList.add('active');
        }
      });
    });
  });

  // Subscribe to state changes
  window.app.state.subscribe(() => {
    window.app.render.renderWorkouts();
    window.app.render.renderSupplements();
    
    // Update charts if on progress tab
    const progressTab = document.getElementById('tab-progress');
    if (progressTab && !progressTab.classList.contains('hidden') && window.app.charts) {
      window.app.charts.updateChartsDebounced();
    }
  });

  // Initial render
  window.app.render.renderWorkouts();
  window.app.render.renderSupplements();

  // Initialize charts if starting on progress tab
  const progressTab = document.getElementById('tab-progress');
  if (progressTab && !progressTab.classList.contains('hidden') && window.app.charts) {
    window.app.charts.updateCharts();
  }

} catch (error) {
  console.error('Error initializing app:', error);
}
})();