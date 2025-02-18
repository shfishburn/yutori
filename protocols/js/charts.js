/* charts.js - Comprehensive Charting and Gamification */
window.app = window.app || {};

window.app.charts = (function (store) {
  // Defensive color palette with good contrast and accessibility
  const chartColors = {
    primary: 'rgba(250, 140, 22, 0.8)',    // Vibrant Orange
    secondary: 'rgba(59, 130, 246, 0.8)',   // Bright Blue
    success: 'rgba(40, 167, 69, 0.8)',      // Healthy Green
    danger: 'rgba(220, 53, 69, 0.8)',       // Alert Red
    warning: 'rgba(255, 193, 7, 0.8)',      // Caution Yellow
    info: 'rgba(23, 162, 184, 0.8)',        // Informative Cyan
    light: 'rgba(248, 249, 250, 0.8)',      // Soft Light Gray
    dark: 'rgba(52, 58, 64, 0.8)'           // Deep Dark Gray
  };

  // Chart instance management
  const chartInstances = new Map();

  // Wait for Chart.js to be available
  function waitForChart() {
    return new Promise((resolve, reject) => {
      if (typeof Chart !== 'undefined') {
        resolve();
        return;
      }

      const maxAttempts = 10;
      let attempts = 0;

      const interval = setInterval(() => {
        attempts++;
        if (typeof Chart !== 'undefined') {
          clearInterval(interval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Chart.js not loaded'));
        }
      }, 500);
    });
  }

  // Improved chart configuration with better layout settings
  async function createOrUpdateChart(id, config) {
    try {
      await waitForChart();

      const canvas = document.getElementById(id);
      if (!canvas) {
        window.app.errorLogger.log('CreateChart', 
          new Error(`Canvas not found: ${id}`), 
          { 
            chartId: id, 
            configType: config?.type 
          }
        );
        return null;
      }

      // Cleanup existing chart
      if (chartInstances.has(id)) {
        const existingChart = chartInstances.get(id);
        existingChart?.destroy();
        chartInstances.delete(id);
      }

      // Enhanced default configuration with improved layout settings
      const defaultConfig = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500,  // Reduced for faster rendering
          easing: 'easeOutQuart'
        },
        layout: {
          padding: {
            top: 10,
            right: 25,
            bottom: 25,
            left: 25
          }
        },
        plugins: {
          legend: {
            position: 'top',  // Changed from bottom to save vertical space
            labels: {
              boxWidth: 12,   // Smaller legend boxes
              padding: 15,
              font: { 
                size: 11,
                family: "'Inter', sans-serif"
              }
            }
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            padding: 8,
            backgroundColor: 'rgba(0,0,0,0.7)',
            titleFont: { size: 12 },
            bodyFont: { size: 11 },
            displayColors: true,
            boxWidth: 8,
            boxPadding: 3
          },
          title: {
            font: { 
              size: 14,
              family: "'Inter', sans-serif",
              weight: 'bold'
            },
            padding: {
              top: 5,
              bottom: 10
            }
          }
        }
      };

      // Better merge strategy for nested objects
      const mergedConfig = {
        ...defaultConfig,
        ...config,
        plugins: {
          ...defaultConfig.plugins,
          ...(config.plugins || {}),
          // Ensure title is properly merged if it exists in both
          title: {
            ...(defaultConfig.plugins.title || {}),
            ...(config.plugins?.title || {})
          },
          // Ensure legend is properly merged if it exists in both
          legend: {
            ...(defaultConfig.plugins.legend || {}),
            ...(config.plugins?.legend || {})
          },
          // Ensure tooltip is properly merged if it exists in both
          tooltip: {
            ...(defaultConfig.plugins.tooltip || {}),
            ...(config.plugins?.tooltip || {})
          }
        }
      };

      // Apply type-specific optimizations
      if (config.type === 'doughnut' || config.type === 'pie') {
        mergedConfig.cutout = config.type === 'doughnut' ? '70%' : undefined;
        mergedConfig.radius = '90%';  // Better size within container
        
        // Make sure we have proper legend for doughnut/pie
        if (!mergedConfig.plugins.legend) {
          mergedConfig.plugins.legend = {};
        }
        mergedConfig.plugins.legend.position = 'right';  // Better for pie/doughnut
      }
      
      if (config.type === 'bar') {
        // Adjust bar charts for better proportions
        if (!mergedConfig.options) mergedConfig.options = {};
        if (!mergedConfig.options.scales) mergedConfig.options.scales = {};
        if (!mergedConfig.options.scales.x) mergedConfig.options.scales.x = {};
        if (!mergedConfig.options.scales.y) mergedConfig.options.scales.y = {};
        
        // Better bar thickness handling
        mergedConfig.options.scales.x.ticks = {
          ...mergedConfig.options.scales.x.ticks,
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          font: { size: 10 }
        };
        
        // Make grid lines lighter to reduce visual clutter
        mergedConfig.options.scales.x.grid = {
          ...mergedConfig.options.scales.x.grid,
          color: 'rgba(0,0,0,0.05)'
        };
        
        mergedConfig.options.scales.y.grid = {
          ...mergedConfig.options.scales.y.grid,
          color: 'rgba(0,0,0,0.05)'
        };
      }
      
      if (config.type === 'radar') {
        // Adjust radar charts
        if (!mergedConfig.options) mergedConfig.options = {};
        if (!mergedConfig.options.scales) mergedConfig.options.scales = {};
        if (!mergedConfig.options.scales.r) mergedConfig.options.scales.r = {};
        
        // Better radar chart proportions
        mergedConfig.options.scales.r.ticks = {
          ...mergedConfig.options.scales.r.ticks,
          backdropColor: 'transparent',
          font: { size: 10 },
          stepSize: 5
        };
        
        mergedConfig.options.scales.r.angleLines = {
          ...mergedConfig.options.scales.r.angleLines,
          color: 'rgba(0,0,0,0.1)'
        };
        
        mergedConfig.options.scales.r.grid = {
          ...mergedConfig.options.scales.r.grid,
          color: 'rgba(0,0,0,0.05)'
        };
      }

      // Setup canvas before creating chart
      const parent = canvas.parentElement;
      if (parent && parent.classList.contains('chart-container')) {
        // Ensure proper aspect ratio for different chart types
        let aspectRatio = 1.6;  // default
        if (config.type === 'doughnut' || config.type === 'pie') {
          aspectRatio = 1.2;
        } else if (config.type === 'radar') {
          aspectRatio = 1;
        }
        
        // Make sure the parent has proper sizing
        parent.style.height = '300px';
        parent.style.margin = '0 auto 2rem auto';
        parent.style.maxWidth = `${Math.round(300 * aspectRatio)}px`;
      }

      const ctx = canvas.getContext('2d');
      const chart = new Chart(ctx, mergedConfig);
      chartInstances.set(id, chart);

      return chart;
    } catch (error) {
      window.app.errorLogger.log('CreateChart', error, { 
        chartId: id, 
        configType: config?.type 
      });
      return null;
    }
  }

  async function cleanup() {
    try {
      const promises = Array.from(chartInstances.entries()).map(async ([id, chart]) => {
        try {
          chart?.destroy();
        } catch (error) {
          window.app.errorLogger.log('ChartCleanup', 
            error, 
            { chartId: id }
          );
        }
      });

      await Promise.all(promises);
      chartInstances.clear();
    } catch (error) {
      window.app.errorLogger.log('ChartCleanup', error);
    }
  }

  async function updateWorkoutCharts(workouts) {
    if (!Array.isArray(workouts)) {
      window.app.errorLogger.log('UpdateWorkoutCharts', 
        new Error('Invalid workouts data'), 
        { workoutsType: typeof workouts }
      );
      return;
    }

    try {
      // Filter to only show workouts for the selected date
      const selectedWorkouts = filterWorkoutsBySelectedDate(workouts);
      
      // Daily MET Chart
      await createOrUpdateChart('dailyMETChart', {
        type: 'bar',  // Changed from line to bar for better readability with fewer data points
        data: {
          labels: selectedWorkouts.map((w) => w.exercise),
          datasets: [{
            label: 'Daily METs',
            data: selectedWorkouts.map((w) => w.completed ? w.baseMET : 0),
            backgroundColor: chartColors.primary,
            borderColor: 'transparent',
            barThickness: 'flex',
            minBarLength: 3
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Daily MET Progress'
            }
          },
          scales: {
            x: {
              ticks: {
                autoSkip: true,
                maxRotation: 45,
                minRotation: 45
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'METs'
              }
            }
          }
        }
      });

      // Workout Completion Chart
      const completed = selectedWorkouts.filter((w) => w.completed).length;
      const remaining = selectedWorkouts.length - completed;
      await createOrUpdateChart('workoutCompletionChart', {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Remaining'],
          datasets: [{
            data: [completed, remaining],
            backgroundColor: [chartColors.success, chartColors.danger]
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Workout Completion'
            }
          }
        }
      });

      // Workout Type Distribution
      const typeDistribution = selectedWorkouts.reduce((acc, w) => {
        acc[w.session] = (acc[w.session] || 0) + 1;
        return acc;
      }, {});

      await createOrUpdateChart('workoutTypeDistributionChart', {
        type: 'pie',
        data: {
          labels: Object.keys(typeDistribution),
          datasets: [{
            data: Object.values(typeDistribution),
            backgroundColor: Object.keys(typeDistribution).map(
              (_, i) => Object.values(chartColors)[i % Object.keys(chartColors).length]
            )
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Workout Type Distribution'
            }
          }
        }
      });

      // Muscle Group Distribution
      const muscleDistribution = selectedWorkouts.reduce((acc, w) => {
        // Split multiple muscle groups and count each one
        const muscles = w.muscleExercised.split(', ');
        muscles.forEach(muscle => {
          acc[muscle] = (acc[muscle] || 0) + 1;
        });
        return acc;
      }, {});

      await createOrUpdateChart('muscleGroupDistributionChart', {
        type: 'radar',
        data: {
          labels: Object.keys(muscleDistribution),
          datasets: [{
            label: 'Exercises per Muscle Group',
            data: Object.values(muscleDistribution),
            backgroundColor: `${chartColors.primary}40`,
            borderColor: chartColors.primary,
            borderWidth: 2
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Muscle Group Focus'
            }
          }
        }
      });
    } catch (error) {
      window.app.errorLogger.log('UpdateWorkoutCharts', error);
    }
  }

  async function updateSupplementCharts(supplements) {
    if (!Array.isArray(supplements)) {
      window.app.errorLogger.log('UpdateSupplementCharts', 
        new Error('Invalid supplements data'), 
        { supplementsType: typeof supplements }
      );
      return;
    }

    try {
      // Note: Supplements are the same for all days, so no date filtering is needed
      const selectedSupplements = supplements;
      
      // Supplement Completion Chart
      const completed = selectedSupplements.filter((s) => s.completed).length;
      const remaining = selectedSupplements.length - completed;
      await createOrUpdateChart('supplementCompletionChart', {
        type: 'doughnut',
        data: {
          labels: ['Taken', 'Remaining'],
          datasets: [{
            data: [completed, remaining],
            backgroundColor: [chartColors.success, chartColors.danger]
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Supplement Completion'
            }
          }
        }
      });

      // Supplement Type Distribution
      const typeDistribution = selectedSupplements.reduce((acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1;
        return acc;
      }, {});

      await createOrUpdateChart('supplementTypeDistributionChart', {
        type: 'pie',
        data: {
          labels: Object.keys(typeDistribution),
          datasets: [{
            data: Object.values(typeDistribution),
            backgroundColor: Object.keys(typeDistribution).map(
              (_, i) => Object.values(chartColors)[i % Object.keys(chartColors).length]
            )
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Supplement Type Distribution'
            }
          }
        }
      });

      // Supplement Timing Distribution
      const timingDistribution = selectedSupplements.reduce((acc, s) => {
        acc[s.timeSlot] = (acc[s.timeSlot
        ] || 0) + 1;
        return acc;
      }, {});

      await createOrUpdateChart('supplementTimingChart', {
        type: 'bar',
        data: {
          labels: Object.keys(timingDistribution),
          datasets: [{
            label: 'Supplements per Time Slot',
            data: Object.values(timingDistribution),
            backgroundColor: chartColors.secondary
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Supplement Timing Distribution'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Supplements'
              }
            }
          }
        }
      });

      // Supplement Trend Chart - Simpler version to improve readability
      const timeData = selectedSupplements
        .map((s) => {
          const [hours, minutes] = s.time.replace(/AM|PM/g, '').trim().split(':').map(Number);
          return hours * 60 + minutes;
        })
        .sort((a, b) => a - b);

      await createOrUpdateChart('supplementTrendChart', {
        type: 'line',
        data: {
          labels: timeData.map((t) => 
            `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
          ),
          datasets: [{
            label: 'Supplement Schedule',
            data: timeData.map((_, i) => i + 1),
            backgroundColor: chartColors.info,
            borderColor: chartColors.info,
            pointRadius: 4,
            pointHoverRadius: 6,
            stepped: true
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Supplement Timing Progression'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cumulative Supplements'
              }
            }
          }
        }
      });
    } catch (error) {
      window.app.errorLogger.log('UpdateSupplementCharts', error);
    }
  }

  // Helper function to get current selected day number (1-7)
  function getSelectedDayNumber() {
    try {
      const selectedDate = document.getElementById('datePicker')?.value;
      if (!selectedDate) {
        return null;
      }
      
      // Create a Date object with time set to noon in local time zone
      const parts = selectedDate.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JavaScript months are 0-indexed
      const day = parseInt(parts[2]);
      
      const dateObj = new Date(year, month, day, 12, 0, 0);
      
      // Get the day of week (0-6) and convert to 1-7 format for JSON
      const jsDay = dateObj.getDay();
      const jsonDay = jsDay === 0 ? 7 : jsDay;
      
      return jsonDay;
    } catch (error) {
      window.app.errorLogger.log('GetSelectedDayNumber', error);
      return null;
    }
  }
  
  // Helper function to filter workouts by selected date
  function filterWorkoutsBySelectedDate(workouts) {
    try {
      const jsonDay = getSelectedDayNumber();
      if (jsonDay === null) {
        return workouts;
      }
      
      // Filter workouts by the correct day format
      return workouts.filter(w => w.dayOfWeek === jsonDay);
    } catch (error) {
      window.app.errorLogger.log('FilterWorkoutsByDate', error);
      return workouts;
    }
  }

  // Gamification Achievement Tracking Functions
  function trackUserAchievements(workouts, supplements) {
    try {
      const completedWorkouts = workouts.filter(w => w.completed).length;
      const completedSupplements = supplements.filter(s => s.completed).length;
      
      // Create achievement tracking
      const achievements = {
        // Streak tracking
        currentStreak: calculateStreak(workouts),
        longestStreak: getLongestStreak(workouts),
        
        // Milestone tracking
        workoutMilestones: calculateMilestones(completedWorkouts),
        supplementMilestones: calculateMilestones(completedSupplements),
        
        // Mastery levels
        workoutMasteryLevel: calculateMasteryLevel(workouts),
        supplementMasteryLevel: calculateMasteryLevel(supplements)
      };

      // Trigger achievement notifications
      displayAchievementNotifications(achievements);

      return achievements;
    } catch (error) {
      window.app.errorLogger.log('TrackUserAchievements', error);
      return null;
    }
  }

  // Gamification Helper Functions
  function calculateStreak(activities) {
    // Implement streak calculation logic
    const sortedActivities = activities.sort((a, b) => new Date(a.date) - new Date(b.date));
    let currentStreak = 0;
    let maxStreak = 0;

    for (let i = 0; i < sortedActivities.length; i++) {
      if (sortedActivities[i].completed) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return {
      current: currentStreak,
      max: maxStreak
    };
  }

  function getLongestStreak(activities) {
    return calculateStreak(activities).max;
  }

  function calculateMilestones(completedCount) {
    const milestones = [
      { threshold: 5, name: 'Beginner', reward: 'Bronze Badge' },
      { threshold: 20, name: 'Consistent', reward: 'Silver Badge' },
      { threshold: 50, name: 'Champion', reward: 'Gold Badge' },
      { threshold: 100, name: 'Master', reward: 'Platinum Badge' }
    ];

    return milestones.filter(m => completedCount >= m.threshold)
      .map(m => ({ ...m, progress: Math.min(completedCount / m.threshold, 1) }));
  }

  function calculateMasteryLevel(activities) {
    const totalActivities = activities.length;
    const completedActivities = activities.filter(a => a.completed).length;
    const completionRate = totalActivities > 0 ? completedActivities / totalActivities : 0;

    const levels = [
      { min: 0, max: 0.3, name: 'Novice', color: 'bronze' },
      { min: 0.3, max: 0.6, name: 'Intermediate', color: 'silver' },
      { min: 0.6, max: 0.9, name: 'Advanced', color: 'gold' },
      { min: 0.9, max: 1, name: 'Expert', color: 'platinum' }
    ];

    const currentLevel = levels.find(l => 
      completionRate >= l.min && completionRate < l.max
    ) || levels[0];

    return {
      name: currentLevel.name,
      color: currentLevel.color,
      progress: completionRate
    };
  }

  function displayAchievementNotifications(achievements) {
    const notificationContainer = document.getElementById('achievement-notifications');
    if (!notificationContainer) return;

    // Clear previous notifications
    notificationContainer.innerHTML = '';

    const createNotification = (message, type) => {
      const notification = document.createElement('div');
      notification.className = `achievement-notification ${type}`;
      notification.textContent = message;
      notificationContainer.appendChild(notification);

      // Auto-remove after a few seconds
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
      }, 3000);
    };

    // Workout streak notifications
    if (achievements.currentStreak.current > 3) {
      createNotification(`${achievements.currentStreak.current} Day Workout Streak!`, 'success');
    }

    // Milestone notifications
    achievements.workoutMilestones.forEach(milestone => {
      createNotification(`Milestone Reached: ${milestone.name} (${milestone.reward})`, 'milestone');
    });

    // Mastery level notifications
    if (achievements.workoutMasteryLevel.name !== 'Novice') {
      createNotification(`Workout Mastery: ${achievements.workoutMasteryLevel.name}`, 'level-up');
    }
  }

  // Main chart update function
  async function updateAllCharts() {
    try {
      const state = store.getState();
      if (!state || !state.workouts || !state.supplements) {
        window.app.errorLogger.log('UpdateAllCharts', 
          new Error('No state data available for charts'), 
          { state }
        );
        return;
      }

      // Only update if we're on the progress tab
      const progressTab = document.getElementById('tab-progress');
      if (!progressTab || progressTab.classList.contains('hidden')) {
        return;
      }

      // First check if we have a valid selected date
      const selectedDay = getSelectedDayNumber();
      if (selectedDay === null) {
        console.log('No valid date selected, skipping chart updates');
        return;
      }
      
      const selectedWorkouts = filterWorkoutsBySelectedDate(state.workouts);
      if (selectedWorkouts.length === 0) {
        console.log(`No workouts found for selected day (${selectedDay})`);
      }

      await cleanup();
      await updateWorkoutCharts(state.workouts);
      await updateSupplementCharts(state.supplements);
      
      // Track and display achievements
      trackUserAchievements(state.workouts, state.supplements);
    } catch (error) {
      window.app.errorLogger.log('UpdateAllCharts', error);
    }
  }

  // Register event listener to update charts when date changes
  function initDateChangeListener() {
    const dateInput = document.getElementById('datePicker');
    if (dateInput) {
      dateInput.addEventListener('change', () => {
        console.log('Date changed, updating charts...');
        updateAllCharts();
      });
    }
  }

  // Public API
  const api = {
    createOrUpdateChart,
    updateCharts: updateAllCharts,
    cleanup,
    chartColors,
    trackAchievements: trackUserAchievements
  };

  // Add debounced function only if debounce is available
  if (typeof window.app.debounce === 'function') {
    api.updateChartsDebounced = window.app.debounce(updateAllCharts, 100);
  } else {
    // Fallback to regular update method
    api.updateChartsDebounced = updateAllCharts;
    window.app.errorLogger.log('ChartInitialization', 
      new Error('Debounce function not found. Using regular update method.')
    );
  }
  
  // Initialize date change listener
  initDateChangeListener();

  return api;
})(window.app.state);