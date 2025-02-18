/* charts.js - Fixed Chart Management Module */
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

      // Enhanced default configuration
      const defaultConfig = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 750,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 12 },
              padding: 20
            }
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            padding: 10,
            backgroundColor: 'rgba(0,0,0,0.8)'
          }
        }
      };

      const mergedConfig = {
        ...defaultConfig,
        ...config,
        plugins: {
          ...defaultConfig.plugins,
          ...(config.plugins || {})
        }
      };

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
      // Daily MET Chart
      await createOrUpdateChart('dailyMETChart', {
        type: 'line',
        data: {
          labels: workouts.map((w) => w.exercise),
          datasets: [{
            label: 'Daily METs',
            data: workouts.map((w) => w.completed ? w.baseMET : 0),
            backgroundColor: chartColors.primary,
            borderColor: chartColors.primary,
            fill: true,
            tension: 0.2
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Daily MET Progress',
              font: { size: 16 }
            }
          },
          scales: {
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
      const completed = workouts.filter((w) => w.completed).length;
      const remaining = workouts.length - completed;
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
      const typeDistribution = workouts.reduce((acc, w) => {
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
      const muscleDistribution = workouts.reduce((acc, w) => {
        acc[w.muscleExercised] = (acc[w.muscleExercised] || 0) + 1;
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
      // Supplement Completion Chart
      const completed = supplements.filter((s) => s.completed).length;
      const remaining = supplements.length - completed;
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
      const typeDistribution = supplements.reduce((acc, s) => {
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
      const timingDistribution = supplements.reduce((acc, s) => {
        acc[s.timeSlot] = (acc[s.timeSlot] || 0) + 1;
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

      // Supplement Trend Chart
      const timeData = supplements
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

  async function updateOverallProgress(workouts, supplements) {
    if (!Array.isArray(workouts) || !Array.isArray(supplements)) {
      window.app.errorLogger.log('UpdateOverallProgress', 
        new Error('Invalid data for overall progress chart'), 
        { 
          workoutsType: typeof workouts,
          supplementsType: typeof supplements 
        }
      );
      return;
    }

    try {
      const workoutComplete = workouts.filter((w) => w.completed).length;
      const supplementComplete = supplements.filter((s) => s.completed).length;
      const workoutRemaining = workouts.length - workoutComplete;
      const supplementRemaining = supplements.length - supplementComplete;

      await createOrUpdateChart('overallProgressChart', {
        type: 'bar',
        data: {
          labels: ['Workouts', 'Supplements'],
          datasets: [
            {
              label: 'Completed',
              data: [workoutComplete, supplementComplete],
              backgroundColor: chartColors.success
            },
            {
              label: 'Remaining',
              data: [workoutRemaining, supplementRemaining],
              backgroundColor: chartColors.danger
            }
          ]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Overall Progress'
            },
            legend: { position: 'bottom' }
          },
          scales: {
            x: { stacked: true },
            y: { 
              stacked: true, 
              beginAtZero: true,
              title: { 
                display: true, 
                text: 'Count' 
              }
            }
          }
        }
      });

      // Update progress text elements
      const elements = {
        dailyProgress: document.getElementById('dailyProgress'),
        supplementProgress: document.getElementById('supplementProgress'),
        totalProgress: document.getElementById('totalProgress')
      };

      if (elements.dailyProgress) {
        elements.dailyProgress.textContent = `${workoutComplete}/${workouts.length}`;
      }
      if (elements.supplementProgress) {
        elements.supplementProgress.textContent = `${supplementComplete}/${supplements.length}`;
      }
      if (elements.totalProgress) {
        elements.totalProgress.textContent = 
          `${workoutComplete + supplementComplete}/${workouts.length + supplements.length}`;
      }
    } catch (error) {
      window.app.errorLogger.log('UpdateOverallProgress', error);
    }
  }

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

      await cleanup();
      await updateWorkoutCharts(state.workouts);
      await updateSupplementCharts(state.supplements);
      await updateOverallProgress(state.workouts, state.supplements);
    } catch (error) {
      window.app.errorLogger.log('UpdateAllCharts', error);
    }
  }

// Public API
  const api = {
    createOrUpdateChart,
    updateCharts: updateAllCharts,
    cleanup,
    chartColors
  };

  // Add debounced function only if debounce is available
  if (typeof window.app.debounce === 'function') {
    api.updateChartsDebounced = window.app.debounce(updateAllCharts, 50);
  } else {
    // Fallback to regular update method
    api.updateChartsDebounced = updateAllCharts;
    window.app.errorLogger.log('ChartInitialization', 
      new Error('Debounce function not found. Using regular update method.')
    );
  }

  return api;
})(window.app.state);