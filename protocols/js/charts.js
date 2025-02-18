/* charts.js - Enhanced with Better Visuals and Daily Summary */
window.app = window.app || {};

window.app.charts = (function (store) {
  // Enhanced color palette with more vibrant, engaging colors
  const chartColors = {
    primary: 'rgba(250, 140, 22, 0.85)',    // Vibrant Orange
    secondary: 'rgba(59, 130, 246, 0.85)',   // Bright Blue
    success: 'rgba(40, 167, 69, 0.85)',      // Healthy Green
    danger: 'rgba(220, 53, 69, 0.85)',       // Alert Red
    warning: 'rgba(255, 193, 7, 0.85)',      // Caution Yellow
    info: 'rgba(23, 162, 184, 0.85)',        // Informative Cyan
    light: 'rgba(248, 249, 250, 0.85)',      // Soft Light Gray
    dark: 'rgba(52, 58, 64, 0.85)',          // Deep Dark Gray
    purple: 'rgba(111, 66, 193, 0.85)',      // Rich Purple
    teal: 'rgba(32, 201, 151, 0.85)',        // Vibrant Teal
    pink: 'rgba(232, 62, 140, 0.85)'         // Bold Pink
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

  // Enhanced chart configuration with better layout and animations
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

      // Enhanced default configuration with improved layout and animations
      const defaultConfig = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 600,
          easing: 'easeOutQuart',
          animateScale: true
        },
        layout: {
          padding: {
            top: 15,
            right: 25,
            bottom: 25,
            left: 25
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 15,
              font: { 
                size: 9,
                family: "'Inter', sans-serif",
                weight: '500'
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            padding: 10,
            backgroundColor: 'rgba(33, 37, 41, 0.85)',
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 },
            cornerRadius: 6,
            displayColors: true,
            boxWidth: 8,
            boxPadding: 4
          },
          title: {
            display: true,
            font: { 
              size: 16,
              family: "'Inter', sans-serif",
              weight: 'bold'
            },
            padding: {
              top: 5,
              bottom: 15
            },
            color: '#333'
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
        mergedConfig.cutout = config.type === 'doughnut' ? '75%' : undefined;
        mergedConfig.radius = '92%';
        
        // Improved legend for doughnut/pie
        if (!mergedConfig.plugins.legend) {
          mergedConfig.plugins.legend = {};
        }
        mergedConfig.plugins.legend.position = 'bottom';
        
        // Add central text display for doughnut charts
        if (config.type === 'doughnut' && !mergedConfig.plugins.afterDraw) {
          mergedConfig.plugins.afterDraw = function(chart) {
            if (!chart.data.datasets[0].data.length) return;
            
            const {ctx, chartArea} = chart;
            ctx.save();
            
            const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const value = chart.data.datasets[0].data[0];
            const percentage = Math.round((value / total) * 100) || 0;
            
            // Draw percentage text
            ctx.font = 'bold 24px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#333';
            
            const centerX = (chartArea.left + chartArea.right) / 2;
            const centerY = (chartArea.top + chartArea.bottom) / 2;
            
            ctx.fillText(percentage + '%', centerX, centerY - 10);
            
            // Draw label (completed/taken)
            ctx.font = '12px "Inter", sans-serif';
            ctx.fillStyle = '#666';
            const label = id.includes('workout') ? 'completed' : 'taken';
            ctx.fillText(label, centerX, centerY + 15);
            
            ctx.restore();
          };
        }
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
        
        // Add border color
        mergedConfig.options.scales.x.border = {
          ...mergedConfig.options.scales.x.border,
          color: 'rgba(0,0,0,0.1)',
          width: 1
        };
        
        mergedConfig.options.scales.y.border = {
          ...mergedConfig.options.scales.y.border,
          color: 'rgba(0,0,0,0.1)',
          width: 1
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

        // Add point styling for better visibility
        if (!mergedConfig.datasets) mergedConfig.datasets = [{}];
        mergedConfig.datasets[0].pointRadius = 4;
        mergedConfig.datasets[0].pointHoverRadius = 6;
      }

      // Setup canvas styling and fix chart container styles
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
        parent.style.position = 'relative';
        parent.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
        parent.style.borderRadius = '8px';
        parent.style.backgroundColor = '#fff';
        parent.style.padding = '15px';
        parent.style.transition = 'transform 0.2s ease';
        
        // Add hover effect
        parent.addEventListener('mouseenter', () => {
          parent.style.transform = 'translateY(-3px)';
        });
        parent.addEventListener('mouseleave', () => {
          parent.style.transform = 'translateY(0)';
        });
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

  // Function to generate achievements based on daily progress
  function generateAchievements(workouts, supplements) {
    const achievements = [];
    
    // Filter workouts by selected date
    const selectedWorkouts = filterWorkoutsBySelectedDate(workouts);
    
    // Calculate completion metrics
    const workoutComplete = selectedWorkouts.filter(w => w.completed).length;
    const supplementComplete = supplements.filter(s => s.completed).length;
    const workoutTotal = selectedWorkouts.length;
    const supplementTotal = supplements.length;
    
    // Perfect day achievement
    if (workoutComplete === workoutTotal && 
        supplementComplete === supplementTotal && 
        workoutTotal > 0) {
      achievements.push({
        icon: '✨',
        title: 'Perfect Day!',
        description: `You completed all ${workoutComplete} workouts and took all ${supplementComplete} supplements!`
      });
    }
    
    // Calculate total METs for completed workouts
    const totalMETs = selectedWorkouts
      .filter(w => w.completed)
      .reduce((sum, w) => sum + w.baseMET, 0);
    
    // MET achievements
    if (totalMETs >= 30) {
      achievements.push({
        icon: '🔥',
        title: 'MET Champion',
        description: `You crushed ${totalMETs.toFixed(1)} METs today!`
      });
    } else if (totalMETs >= 20) {
      achievements.push({
        icon: '💪',
        title: 'MET Master',
        description: `You achieved ${totalMETs.toFixed(1)} METs today!`
      });
    }
    
    // Workout type achievements
    const strengthWorkouts = selectedWorkouts.filter(w => 
      w.session === 'Strength' && w.completed
    ).length;
    
    if (strengthWorkouts >= 5) {
      achievements.push({
        icon: '🏋️',
        title: 'Strength Champion',
        description: `You completed ${strengthWorkouts} strength exercises today!`
      });
    }
    
    return achievements;
  }

  // Update achievement display in the UI
  function updateAchievementDisplay(achievements) {
    const container = document.getElementById('achievementsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (achievements.length === 0) {
      container.innerHTML = `
        <div class="flex items-center justify-center p-4 text-gray-500">
          <p>Complete more workouts to earn achievements!</p>
        </div>
      `;
      return;
    }
    
    achievements.forEach(achievement => {
      const achievementEl = document.createElement('div');
      achievementEl.className = 'achievement-card bg-white rounded-lg p-3 mb-2 flex items-center shadow-sm';
      achievementEl.innerHTML = `
        <div class="achievement-icon text-2xl mr-3">${achievement.icon}</div>
        <div class="achievement-info">
          <h4 class="achievement-title font-bold">${achievement.title}</h4>
          <p class="achievement-description text-sm text-gray-600">${achievement.description}</p>
        </div>
      `;
      container.appendChild(achievementEl);
      
      // Add a small animation
      setTimeout(() => {
        achievementEl.style.transition = 'transform 0.3s ease';
        achievementEl.style.transform = 'scale(1.03)';
        setTimeout(() => {
          achievementEl.style.transform = 'scale(1)';
        }, 300);
      }, 100);
    });
  }

  // Create or update daily summary section
  function updateDailySummary(workouts, supplements) {
    try {
      // First, check if the container exists, if not create it
      let summaryContainer = document.getElementById('dailySummary');
      if (!summaryContainer) {
        // Find where to insert the summary - before the charts
        const progressContainer = document.getElementById('progressContainer');
        if (!progressContainer) return;
        
        summaryContainer = document.createElement('div');
        summaryContainer.id = 'dailySummary';
        summaryContainer.className = 'bg-white rounded-lg shadow-sm p-4 mb-6';
        
        // Create the basic structure
        summaryContainer.innerHTML = `
          <h3 class="text-xl font-bold mb-3 text-gray-800">Today's Health Summary</h3>
          
          <!-- Achievements Display -->
          <div id="achievementsContainer" class="mb-4"></div>
          
          <!-- MET Summary for Today -->
          <div class="flex items-center mb-3">
            <div class="w-1/2">
              <span class="text-sm font-medium text-gray-500">Total METs Today</span>
              <div id="totalMETs" class="text-2xl font-bold">0</div>
            </div>
            <div class="w-1/2">
              <span class="text-sm font-medium text-gray-500">Completion Rate</span>
              <div id="completionRate" class="text-2xl font-bold">0%</div>
            </div>
          </div>
          
          <!-- Next Supplements -->
          <div class="mt-4">
            <span class="text-sm font-medium text-gray-500">Next Supplements</span>
            <div id="nextSupplements" class="text-base"></div>
          </div>
        `;
        
        // Insert at the beginning of the progress container
        progressContainer.insertBefore(summaryContainer, progressContainer.firstChild);
      }
      
      // Update with actual data
      const selectedWorkouts = filterWorkoutsBySelectedDate(workouts);
      
      // Calculate total METs
      const totalMETs = selectedWorkouts
        .filter(w => w.completed)
        .reduce((sum, w) => sum + w.baseMET, 0);
      
      const totalMETsEl = document.getElementById('totalMETs');
      if (totalMETsEl) {
        totalMETsEl.textContent = totalMETs.toFixed(1);
        
        // Add color based on MET value
        totalMETsEl.className = 'text-2xl font-bold';
        if (totalMETs >= 30) {
          totalMETsEl.classList.add('text-green-600');
        } else if (totalMETs >= 20) {
          totalMETsEl.classList.add('text-blue-600');
        } else if (totalMETs >= 10) {
          totalMETsEl.classList.add('text-orange-500');
        } else {
          totalMETsEl.classList.add('text-gray-600');
        }
      }
      
      // Calculate completion rate
      const workoutComplete = selectedWorkouts.filter(w => w.completed).length;
      const supplementComplete = supplements.filter(s => s.completed).length;
      const totalComplete = workoutComplete + supplementComplete;
      const totalItems = selectedWorkouts.length + supplements.length;
      const completionRate = totalItems > 0 ? 
        Math.round((totalComplete / totalItems) * 100) : 0;
      
      const rateEl = document.getElementById('completionRate');
      if (rateEl) {
        rateEl.textContent = `${completionRate}%`;
        
        // Style based on completion rate
        rateEl.className = 'text-2xl font-bold';
        if (completionRate === 100) {
          rateEl.classList.add('text-green-600');
        } else if (completionRate >= 75) {
          rateEl.classList.add('text-blue-600');
        } else if (completionRate >= 50) {
          rateEl.classList.add('text-orange-500');
        } else {
          rateEl.classList.add('text-gray-600');
        }
      }
      
      // Update supplements list
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const upcomingSupplements = supplements
        .filter(s => !s.completed)
        .map(s => {
          const [hours, minutes] = s.time.split(':').map(Number);
          const supplementTime = hours * 60 + minutes;
          return { ...s, minutesUntil: supplementTime - currentTime };
        })
        .filter(s => s.minutesUntil > 0)
        .sort((a, b) => a.minutesUntil - b.minutesUntil)
        .slice(0, 3);
      
      const nextSupplementsEl = document.getElementById('nextSupplements');
      if (nextSupplementsEl) {
        if (upcomingSupplements.length === 0) {
          nextSupplementsEl.innerHTML = '<div class="text-green-600 font-medium">All supplements taken for today! 🎉</div>';
        } else {
          nextSupplementsEl.innerHTML = upcomingSupplements.map(s => {
            const minutesUntil = s.minutesUntil;
            let timeText;
            
            if (minutesUntil < 60) {
              timeText = `in ${minutesUntil} min`;
            } else {
              const hours = Math.floor(minutesUntil / 60);
              const mins = minutesUntil % 60;
              timeText = `in ${hours}h ${mins}m`;
            }
            
            return `<div class="flex justify-between items-center py-1">
              <span>${s.supplement}</span>
              <span class="text-sm text-gray-500">${s.time} <span class="text-xs">(${timeText})</span></span>
            </div>`;
          }).join('');
        }
      }
      
      // Generate and display achievements
      const achievements = generateAchievements(workouts, supplements);
      updateAchievementDisplay(achievements);
      
    } catch (error) {
      window.app.errorLogger.log('UpdateDailySummary', error);
    }
  }

  // Update progress counters with emoji indicators
  function updateProgressCounters(workouts, supplements) {
    try {
      // Update workout progress with emoji
      const workoutEl = document.getElementById('dailyProgress');
      if (workoutEl) {
        const selectedWorkouts = filterWorkoutsBySelectedDate(workouts);
        const completed = selectedWorkouts.filter(w => w.completed).length;
        const total = selectedWorkouts.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        let emoji = '';
        if (percentage === 100) emoji = '🏆';
        else if (percentage >= 75) emoji = '🔥';
        else if (percentage >= 50) emoji = '💪';
        else if (percentage >= 25) emoji = '👍';
        
        workoutEl.innerHTML = `${emoji} ${completed}/${total} <span class="text-sm font-medium ml-1">(${percentage}%)</span>`;
        
        // Add color based on completion percentage
        workoutEl.className = 'font-bold';
        if (percentage === 100) workoutEl.classList.add('text-green-600');
        else if (percentage >= 75) workoutEl.classList.add('text-blue-600');
        else if (percentage >= 50) workoutEl.classList.add('text-orange-500');
        else workoutEl.classList.add('text-gray-600');
      }
      
      // Update supplement progress with emoji
      const suppEl = document.getElementById('supplementProgress');
      if (suppEl) {
        const completed = supplements.filter(s => s.completed).length;
        const total = supplements.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        let emoji = '';
        if (percentage === 100) emoji = '💯';
        else if (percentage >= 75) emoji = '🌟';
        else if (percentage >= 50) emoji = '👌';
        else if (percentage >= 25) emoji = '🌱';
        
        suppEl.innerHTML = `${emoji} ${completed}/${total} <span class="text-sm font-medium ml-1">(${percentage}%)</span>`;
        
        // Add color based on completion percentage
        suppEl.className = 'font-bold';
        if (percentage === 100) suppEl.classList.add('text-green-600');
        else if (percentage >= 75) suppEl.classList.add('text-blue-600');
        else if (percentage >= 50) suppEl.classList.add('text-orange-500');
        else suppEl.classList.add('text-gray-600');
      }
    } catch (error) {
      window.app.errorLogger.log('UpdateProgressCounters', error);
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
        type: 'bar',
        data: {
          labels: selectedWorkouts.map((w) => w.exercise),
          datasets: [{
            label: 'Daily METs',
            data: selectedWorkouts.map((w) => w.completed ? w.baseMET : 0),
            backgroundColor: Array(selectedWorkouts.length).fill().map((_, i) => {
              // Gradient colors based on MET value for visual interest
              const intensity = selectedWorkouts[i].baseMET / 11; // Normalize to 0-1 range (max baseMET is around 11)
              return `rgba(${Math.round(250 - 210 * intensity)}, 
                           ${Math.round(140 - 90 * intensity)}, 
                           ${Math.round(22 + 200 * intensity)}, 0.85)`;
            }),
            borderColor: 'transparent',
            borderRadius: 4,
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
                text: 'METs',
                font: {
                  weight: 'bold'
                }
              }
            }
          }
        }
      });

      // Workout Completion Chart with enhanced visuals
      const completed = selectedWorkouts.filter((w) => w.completed).length;
      const remaining = selectedWorkouts.length - completed;
      await createOrUpdateChart('workoutCompletionChart', {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Remaining'],
          datasets: [{
            data: [completed, remaining],
            backgroundColor: [chartColors.success, chartColors.danger],
            borderWidth: 0,
            hoverOffset: 10
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Workout Completion'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const percentage = Math.round(context.raw / selectedWorkouts.length * 100);
                  return `${context.label}: ${context.raw} (${percentage}%)`;
                }
              }
            }
          }
        }
      });

      // Workout Type Distribution with enhanced visuals
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
              (type, i) => {
                // Use consistent colors for workout types
                const colorMap = {
                  'Strength': chartColors.primary,
                  'Endurance': chartColors.secondary,
                  'Active Recovery': chartColors.info,
                  'Recovery': chartColors.teal,
                  'Cardio': chartColors.purple
                };
                return colorMap[type] || Object.values(chartColors)[i % Object.keys(chartColors).length];
              }
            ),
            borderWidth: 0,
            hoverOffset: 10
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Workout Type Distribution'
            },
            tooltip: {callbacks: {
                label: function(context) {
                  const value = context.raw;
                  const percentage = Math.round(value / selectedWorkouts.length * 100);
                  return `${context.label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });

   // Focus Area Distribution Chart
const focusAreaDistribution = selectedWorkouts.reduce((acc, w) => {
  // Count each focus area
  const focusArea = w.focusArea;
  if (focusArea) {
    acc[focusArea] = (acc[focusArea] || 0) + 1;
  }
  return acc;
}, {});

await createOrUpdateChart('muscleGroupDistributionChart', {
  type: 'radar',
  data: {
    labels: Object.keys(focusAreaDistribution),
    datasets: [{
      label: 'Focus Area',
      data: Object.values(focusAreaDistribution),
      backgroundColor: `${chartColors.primary}40`,
      borderColor: chartColors.primary,
      borderWidth: 2,
      pointBackgroundColor: chartColors.primary,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Focus Area Distribution'  // Updated title
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw} exercises`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          stepSize: 2,
          backdropColor: 'transparent'
        },
        pointLabels: {
          font: {
            size: 9
          }
        }
      }
    }
  }
});
      
      // Update progress counter with emojis
      updateProgressCounters(workouts, supplements);
      
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
      
      // Supplement Completion Chart with enhanced visuals
      const completed = selectedSupplements.filter((s) => s.completed).length;
      const remaining = selectedSupplements.length - completed;
      await createOrUpdateChart('supplementCompletionChart', {
        type: 'doughnut',
        data: {
          labels: ['Taken', 'Remaining'],
          datasets: [{
            data: [completed, remaining],
            backgroundColor: [chartColors.teal, chartColors.danger],
            borderWidth: 0,
            hoverOffset: 10
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Supplement Completion'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const percentage = Math.round(context.raw / selectedSupplements.length * 100);
                  return `${context.label}: ${context.raw} (${percentage}%)`;
                }
              }
            }
          }
        }
      });

      // Supplement Type Distribution with enhanced visuals
      const typeDistribution = selectedSupplements.reduce((acc, s) => {
        acc[s.type || 'Other'] = (acc[s.type || 'Other'] || 0) + 1;
        return acc;
      }, {});

      await createOrUpdateChart('supplementTypeDistributionChart', {
        type: 'pie',
        data: {
          labels: Object.keys(typeDistribution),
          datasets: [{
            data: Object.values(typeDistribution),
            backgroundColor: Object.keys(typeDistribution).map(
              (type, i) => {
                // Use consistent colors for supplement types
                const colorMap = {
                  'Protein': chartColors.teal,
                  'Vitamin': chartColors.purple,
                  'Mineral': chartColors.pink,
                  'Amino': chartColors.secondary,
                  'Other': chartColors.info
                };
                return colorMap[type] || Object.values(chartColors)[i % Object.keys(chartColors).length];
              }
            ),
            borderWidth: 0,
            hoverOffset: 10
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Supplement Type Distribution'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw;
                  const percentage = Math.round(value / selectedSupplements.length * 100);
                  return `${context.label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });

      // Supplement Timing Distribution with enhanced visuals
      const timingDistribution = selectedSupplements.reduce((acc, s) => {
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
            backgroundColor: chartColors.secondary,
            borderRadius: 4,
            barThickness: 'flex'
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
      
      // Get filtered workouts
      const selectedWorkouts = filterWorkoutsBySelectedDate(state.workouts);
      if (selectedWorkouts.length === 0) {
        console.log(`No workouts found for selected day (${selectedDay})`);
      }

      await cleanup();
      await updateWorkoutCharts(state.workouts);  
      await updateSupplementCharts(state.supplements);
      
      // Update the daily summary instead of overall progress
      updateDailySummary(state.workouts, state.supplements);
      
      // Update progress counters with emojis
      updateProgressCounters(state.workouts, state.supplements);
      
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

  // Register event listener for checkbox changes
  function initCheckboxListener() {
    document.addEventListener('change', function(e) {
      if (e.target && e.target.type === 'checkbox') {
        // If we're on the progress tab, update charts when checkboxes change
        const progressTab = document.getElementById('tab-progress');
        if (progressTab && !progressTab.classList.contains('hidden')) {
          // Use debounce if available, otherwise use setTimeout
          if (window.app.debounce) {
            window.app.charts.updateChartsDebounced();
          } else {
            setTimeout(() => window.app.charts.updateCharts(), 100);
          }
        }
      }
    });
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
    api.updateChartsDebounced = window.app.debounce(updateAllCharts, 100);
  } else {
    // Fallback to regular update method
    api.updateChartsDebounced = updateAllCharts;
    window.app.errorLogger.log('ChartInitialization', 
      new Error('Debounce function not found. Using regular update method.')
    );
  }
  
  // Initialize event listeners
  initDateChangeListener();
  initCheckboxListener();

  return api;
})(window.app.state);