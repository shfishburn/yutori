/***************************************
 * ChartManager Class
 ***************************************/
class ChartManager {
    constructor() {
      this.charts = new Map();
      this.chartDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 10 },
        plugins: { legend: { position: "top" }, title: { display: false } },
        scales: { x: { title: { display: true, text: "Timeline" } }, y: {} },
        elements: { line: { tension: 0.3 } },
      };
      this.debouncedResize = this.debounce(() => this.updateCharts(), 250);
      window.addEventListener("resize", this.debouncedResize);
    }
    
    createTimelineLabels(weeklyData, startDate) {
      return weeklyData.map((data, index) => {
        let weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + index * 7);
        let weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const options = { month: "short", day: "numeric" };
        return `${weekStart.toLocaleDateString(undefined, options)} - ${weekEnd.toLocaleDateString(undefined, options)}`;
      });
    }
    
    createChart(canvasId, type, labels, datasets, extraOptions = {}) {
      try {
        const ctx = document.getElementById(canvasId)?.getContext("2d");
        if (!ctx) throw new Error(`Canvas with id "${canvasId}" not found.`);
        const options = Object.assign({}, this.chartDefaults, extraOptions);
        const chart = new Chart(ctx, { type, data: { labels, datasets }, options });
        this.charts.set(canvasId, chart);
        return chart;
      } catch (error) {
        console.error(`Error creating chart (${canvasId}):`, error);
        return null;
      }
    }
    
    updateCharts() {
      this.charts.forEach((chart) => chart.update());
    }
    
    destroyChart(canvasId) {
      const chart = this.charts.get(canvasId);
      if (chart && typeof chart.destroy === "function") {
        chart.destroy();
        this.charts.delete(canvasId);
      }
    }
    
    debounce(func, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }

    showChart(chartId) {
      const chartsDisplay = document.getElementById('chartsDisplay');
      if (chartsDisplay) {
        chartsDisplay.querySelectorAll('.single-chart-container').forEach(div => {
          div.style.display = 'none';
        });
        const chartContainer = chartsDisplay.querySelector(`[data-chart-id="${chartId}"]`);
        if (chartContainer) {
          chartContainer.style.display = 'block';
        }
        
        // Update the chart to ensure proper rendering
        const chart = this.charts.get(chartId);
        if (chart) {
          setTimeout(() => {
            chart.resize();
            chart.update();
          }, 10);
        }
      }
    }
  
    async renderForecastCharts(weeklyData, startDate) {
      console.log("renderForecastCharts called with:", { weeklyData, startDate });
      
      const chartConfigs = [
        {
          id: 'progressChart',
          title: 'Weekly Progress Breakdown',
          type: 'bar',
          datasets: [
            {
              label: 'Weekly Fat Loss (lbs)',
              data: weeklyData.map((pt, i) => 
                i > 0 ? Math.round((weeklyData[i-1].fatMass - pt.fatMass) * 10) / 10 : 0
              ),
              backgroundColor: 'rgba(255, 99, 132, 0.7)',
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 1
            },
            {
              label: 'Weekly Lean Mass Change (lbs)',
              data: weeklyData.map((pt, i) => 
                i > 0 ? Math.round((weeklyData[i-1].leanMass - pt.leanMass) * 10) / 10 : 0
              ),
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderColor: 'rgb(54, 162, 235)',
              borderWidth: 1
            }
          ],
          options: {
            plugins: { 
              title: { display: true, text: 'Weekly Changes in Body Composition' }
            },
            scales: { 
              y: { 
                title: { display: true, text: 'Weight Change (lbs)' },
                stacked: false
              }
            }
          }
        },
        {
          id: 'ratioChart',
          title: 'Body Fat % Timeline',
          type: 'line',
          datasets: [
            {
              label: 'Body Fat %',
              data: weeklyData.map(pt => Math.round(pt.bodyFatPercent * 10) / 10),
              borderColor: 'rgb(153, 102, 255)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              fill: true,
              tension: 0.4
            }
          ],
          options: {
            plugins: { 
              title: { display: true, text: 'Body Fat Percentage Over Time' }
            },
            scales: { 
              y: { 
                title: { display: true, text: 'Body Fat %' }
              }
            }
          }
        },
        {
          id: 'metabolicChart',
          title: 'Metabolic Changes',
          type: 'line',
          datasets: [
            {
              label: 'BMR (kcal)',
              data: weeklyData.map(pt => Math.round(pt.rmr)),
              borderColor: 'rgb(255, 159, 64)',
              backgroundColor: 'rgba(255, 159, 64, 0.2)',
              fill: true,
              yAxisID: 'y'
            },
            {
              label: 'TDEE (kcal)',
              data: weeklyData.map(pt => Math.round(pt.tdee)),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
              yAxisID: 'y'
            }
          ],
          options: {
            plugins: { 
              title: { display: true, text: 'Metabolic Rate Changes' }
            },
            scales: { 
              y: { 
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: 'Calories' }
              }
            }
          }
        },
        {
          id: 'weightChart',
          title: 'Weight Loss Trajectory',
          type: 'line',
          datasets: [
            {
              label: 'Predicted Weight (lbs)',
              data: weeklyData.map((pt) => Math.round(pt.totalWeight)),
              borderColor: 'rgb(153, 102, 255)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              fill: true
            }
          ],
          options: {
            plugins: { 
              title: { display: true, text: 'Weight Loss Trajectory' }
            },
            scales: { 
              y: { title: { display: true, text: 'Weight (lbs)' } }
            }
          }
        },
        {
          id: 'calorieChart',
          title: 'Calorie Forecast',
          type: 'line',
          datasets: [
            {
              label: 'Daily Calorie Target',
              data: weeklyData.map((pt) => Math.round(pt.targetCalories)),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true
            }
          ],
          options: {
            plugins: { 
              title: { display: true, text: 'Calorie Forecast' }
            },
            scales: { 
              y: { title: { display: true, text: 'Calories' } }
            }
          }
        },
        {
          id: 'macroChart',
          title: 'Macro Trajectory',
          type: 'line',
          datasets: [
            {
              label: 'Protein (g)',
              data: weeklyData.map((pt) => pt.macros.protein),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              fill: true
            },
            {
              label: 'Carbs (g)',
              data: weeklyData.map((pt) => pt.macros.carbs),
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: true
            },
            {
              label: 'Fat (g)',
              data: weeklyData.map((pt) => pt.macros.fat),
              borderColor: 'rgb(255, 205, 86)',
              backgroundColor: 'rgba(255, 205, 86, 0.2)',
              fill: true
            }
          ],
          options: {
            plugins: { 
              title: { display: true, text: 'Macro Trajectory' }
            },
            scales: { 
              y: { title: { display: true, text: 'Grams' } }
            }
          }
        },
        {
          id: 'compositionChart',
          title: 'Body Composition',
          type: 'line',
          datasets: [
            {
              label: 'Fat Mass (lbs)',
              data: weeklyData.map((pt) => Math.round(pt.fatMass)),
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgb(255, 99, 132)',
              fill: true,
              order: 2
            },
            {
              label: 'Lean Mass (lbs)',
              data: weeklyData.map((pt) => Math.round(pt.leanMass)),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgb(54, 162, 235)',
              fill: true,
              order: 1
            }
          ],
          options: {
            plugins: { 
              title: { display: true, text: 'Body Composition Changes' }
            },
            scales: { 
              y: { 
                stacked: true,
                title: { display: true, text: 'Weight (lbs)' } 
              } 
            }
          }
        },
        {
          id: 'nutrientTimingChart',
          title: 'Daily Nutrient Distribution',
          type: 'bar',
          datasets: [
            {
              label: 'Protein (g)',
              data: [
                weeklyData[0].macros.protein * 0.25,
                weeklyData[0].macros.protein * 0.35,
                weeklyData[0].macros.protein * 0.40
              ],
              backgroundColor: 'rgba(255, 99, 132, 0.7)',
              borderColor: 'rgb(255, 99, 132)',
              borderWidth: 1
            },
            {
              label: 'Carbs (g)',
              data: [
                weeklyData[0].macros.carbs * 0.35,
                weeklyData[0].macros.carbs * 0.45,
                weeklyData[0].macros.carbs * 0.20
              ],
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderColor: 'rgb(54, 162, 235)',
              borderWidth: 1
            },
            {
              label: 'Fat (g)',
              data: [
                weeklyData[0].macros.fat * 0.30,
                weeklyData[0].macros.fat * 0.40,
                weeklyData[0].macros.fat * 0.30
              ],
              backgroundColor: 'rgba(255, 206, 86, 0.7)',
              borderColor: 'rgb(255, 206, 86)',
              borderWidth: 1
            }
          ],
          options: {
            plugins: { 
              title: { display: true, text: 'Optimal Daily Nutrient Timing' },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.dataset.label || '';
                    const value = Math.round(context.parsed.y);
                    return `${label}: ${value}g`;
                  }
                }
              }
            },
            scales: { 
              x: {
                title: { display: true, text: 'Time of Day' },
                labels: ['Morning', 'Midday', 'Evening']
              },
              y: { 
                title: { display: true, text: 'Grams' },
                stacked: false,
                beginAtZero: true
              }
            }
          }
        }
      ];
      
      console.log("Chart configs created:", chartConfigs);
      
      // Add loading indicator
      const loadingEl = document.createElement("div");
      loadingEl.className = "chart-loading";
      loadingEl.textContent = "Loading charts...";
      const chartsDisplay = document.getElementById('chartsDisplay');
      if (chartsDisplay) {
        chartsDisplay.prepend(loadingEl);
      }
  
      try {
        console.log("Starting chart rendering...");
        const timelineLabels = this.createTimelineLabels(weeklyData, startDate);
        console.log("Timeline labels created:", timelineLabels);
        
        // Clear previous charts
        ['progressChart', 'ratioChart', 'metabolicChart', 'weightChart', 'calorieChart', 'macroChart', 'compositionChart', 'nutrientTimingChart'].forEach(id => this.destroyChart(id));
        
        // Create chart tabs container
        const tabsContainer = document.getElementById('chartTabsContainer');
        if (!tabsContainer) return;

        // Create tab container
        tabsContainer.innerHTML = '';
        const tabsNav = document.createElement('div');
        tabsNav.className = 'chart-tabs-container';

        // Create dropdown for mobile
        const mobileSelect = document.createElement('select');
        mobileSelect.className = 'chart-tabs-mobile';
        mobileSelect.setAttribute('aria-label', 'Select chart');

        // Create grid container for desktop
        const desktopTabs = document.createElement('div');
        desktopTabs.className = 'chart-tabs';

        chartConfigs.forEach((config, index) => {
          // Create desktop tab button
          const tab = document.createElement('button');
          tab.className = `chart-tab ${index === 0 ? 'tab-active' : ''}`;
          tab.textContent = config.title;tab.dataset.chartId = config.id;
          desktopTabs.appendChild(tab);

          // Create mobile option
          const option = document.createElement('option');
          option.value = config.id;
          option.textContent = config.title;
          if (index === 0) option.selected = true;
          mobileSelect.appendChild(option);
        });

        // Add both to container
        tabsContainer.appendChild(mobileSelect);
        tabsContainer.appendChild(desktopTabs);

        // Add change handler for mobile
        mobileSelect.addEventListener('change', (e) => {
          const chartId = e.target.value;
          this.showChart(chartId);
        });

        // Add click handler for desktop
        desktopTabs.addEventListener('click', e => {
          if (e.target.classList.contains('chart-tab')) {
            e.preventDefault();
            e.stopPropagation();
            
            // Update active tab
            desktopTabs.querySelectorAll('.chart-tab').forEach(tab => {
              tab.classList.remove('tab-active');
            });
            e.target.classList.add('tab-active');
            
            // Show corresponding chart
            const chartId = e.target.dataset.chartId;
            this.showChart(chartId);
          }
        });
        
        // Clear chart display container
        if (chartsDisplay) {
          chartsDisplay.innerHTML = '';
          chartsDisplay.appendChild(loadingEl);
        }
        
        // Create chart containers and charts
        chartConfigs.forEach((config, index) => {
          const chartDiv = document.createElement('div');
          chartDiv.className = 'single-chart-container';
          chartDiv.style.display = index === 0 ? 'block' : 'none';
          chartDiv.style.height = '350px';
          chartDiv.dataset.chartId = config.id;
          
          const canvas = document.createElement('canvas');
          canvas.id = config.id;
          canvas.setAttribute('role', 'img');
          canvas.setAttribute('aria-label', `${config.title} chart`);
          
          chartDiv.appendChild(canvas);
          if (chartsDisplay) {
            chartsDisplay.appendChild(chartDiv);
          }
          
          // Create the chart
          this.createChart(
            config.id,
            config.type,
            timelineLabels,
            config.datasets,
            config.options
          );
        });

      } finally {
        loadingEl.remove();
      }
    }
}

// Export the ChartManager class
export default ChartManager;