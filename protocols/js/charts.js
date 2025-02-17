// charts.js
window.app = window.app || {};

window.app.charts = (function (store) {
  const chartInstances = new Map();

  const chartColors = {
    primary: "rgba(250, 140, 22, 0.8)", // Orange
    secondary: "rgba(59, 130, 246, 0.8)", // Blue
    success: "rgba(40, 167, 69, 0.8)", // Green
    danger: "rgba(220, 53, 69, 0.8)", // Red
    warning: "rgba(255, 193, 7, 0.8)", // Yellow
    info: "rgba(23, 162, 184, 0.8)", // Cyan
    light: "rgba(248, 249, 250, 0.8)",
    dark: "rgba(52, 58, 64, 0.8)",
  };

  function createOrUpdateChart(id, config) {
    if (chartInstances.has(id)) {
      chartInstances.get(id).destroy();
    }
    const ctx = document.getElementById(id)?.getContext("2d");
    if (ctx) {
      chartInstances.set(id, new Chart(ctx, config));
    }
  }

  // Workout Charts
  function updateWorkoutCharts(workouts) {
    // Daily MET Chart (Line)
    createOrUpdateChart("dailyMETChart", {
      type: "line",
      data: {
        labels: workouts.map((w) => w.exercise),
        datasets: [
          {
            label: "Daily METs",
            data: workouts.map((w) => (w.completed ? w.baseMET : 0)),
            backgroundColor: chartColors.primary,
            borderColor: chartColors.primary,
            fill: true,
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: "Daily MET Progress" },
          legend: { position: "bottom" },
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "METs" } },
        },
      },
    });

    // Workout Completion Chart (Doughnut)
    const completed = workouts.filter((w) => w.completed).length;
    const remaining = workouts.length - completed;
    createOrUpdateChart("workoutCompletionChart", {
      type: "doughnut",
      data: {
        labels: ["Completed", "Remaining"],
        datasets: [
          {
            data: [completed, remaining],
            backgroundColor: [chartColors.success, chartColors.danger],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: "Workout Completion" } },
      },
    });

    // Workout Type Distribution (Pie)
    const typeDistribution = workouts.reduce((acc, w) => {
      acc[w.session] = (acc[w.session] || 0) + 1;
      return acc;
    }, {});
    createOrUpdateChart("workoutTypeDistributionChart", {
      type: "pie",
      data: {
        labels: Object.keys(typeDistribution),
        datasets: [
          {
            data: Object.values(typeDistribution),
            backgroundColor: Object.keys(typeDistribution).map(
              (_, i) => Object.values(chartColors)[i % Object.keys(chartColors).length]
            ),
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: "Workout Type Distribution" } },
      },
    });

    // Muscle Group Distribution (Radar)
    const muscleDistribution = workouts.reduce((acc, w) => {
      acc[w.muscleExercised] = (acc[w.muscleExercised] || 0) + 1;
      return acc;
    }, {});
    createOrUpdateChart("muscleGroupDistributionChart", {
      type: "radar",
      data: {
        labels: Object.keys(muscleDistribution),
        datasets: [
          {
            label: "Exercises per Muscle Group",
            data: Object.values(muscleDistribution),
            backgroundColor: chartColors.primary + "40",
            borderColor: chartColors.primary,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: "Muscle Group Focus" } },
      },
    });
  }

  // Supplement Charts
  function updateSupplementCharts(supplements) {
    // Supplement Completion (Doughnut)
    const completed = supplements.filter((s) => s.completed).length;
    const remaining = supplements.length - completed;
    createOrUpdateChart("supplementCompletionChart", {
      type: "doughnut",
      data: {
        labels: ["Taken", "Remaining"],
        datasets: [
          {
            data: [completed, remaining],
            backgroundColor: [chartColors.success, chartColors.danger],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: "Supplement Completion" } },
      },
    });

    // Supplement Type Distribution (Pie)
    const typeDistribution = supplements.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {});
    createOrUpdateChart("supplementTypeDistributionChart", {
      type: "pie",
      data: {
        labels: Object.keys(typeDistribution),
        datasets: [
          {
            data: Object.values(typeDistribution),
            backgroundColor: Object.keys(typeDistribution).map(
              (_, i) => Object.values(chartColors)[i % Object.keys(chartColors).length]
            ),
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: "Supplement Type Distribution" } },
      },
    });

    // Supplement Timing Distribution (Bar)
    const timingDistribution = supplements.reduce((acc, s) => {
      acc[s.timeSlot] = (acc[s.timeSlot] || 0) + 1;
      return acc;
    }, {});
    createOrUpdateChart("supplementTimingChart", {
      type: "bar",
      data: {
        labels: Object.keys(timingDistribution),
        datasets: [
          {
            label: "Supplements per Time Slot",
            data: Object.values(timingDistribution),
            backgroundColor: chartColors.secondary,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: "Supplement Timing Distribution" } },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Number of Supplements" },
          },
        },
      },
    });

    // Supplement Trend (Line)
    const timeData = supplements
      .map((s) => {
        const [hours, minutes] = s.time.split(":").map(Number);
        return hours * 60 + minutes;
      })
      .sort((a, b) => a - b);
    createOrUpdateChart("supplementTrendChart", {
      type: "line",
      data: {
        labels: timeData.map((t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`),
        datasets: [
          {
            label: "Supplement Schedule",
            data: timeData.map((_, i) => i + 1),
            backgroundColor: chartColors.info,
            borderColor: chartColors.info,
            stepped: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: "Supplement Timing Progression" } },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Cumulative Supplements" },
          },
        },
      },
    });
  }

  function updateOverallProgress(workouts, supplements) {
    const workoutComplete = workouts.filter((w) => w.completed).length;
    const supplementComplete = supplements.filter((s) => s.completed).length;
    const workoutRemaining = workouts.length - workoutComplete;
    const supplementRemaining = supplements.length - supplementComplete;

    createOrUpdateChart("overallProgressChart", {
      type: "bar",
      data: {
        labels: ["Workouts", "Supplements"],
        datasets: [
          {
            label: "Completed",
            data: [workoutComplete, supplementComplete],
            backgroundColor: chartColors.success,
          },
          {
            label: "Remaining",
            data: [workoutRemaining, supplementRemaining],
            backgroundColor: chartColors.danger,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: "Overall Progress" },
          legend: { position: "bottom" },
        },
        scales: {
          x: { stacked: true },
          y: { stacked: true, beginAtZero: true, title: { display: true, text: "Count" } },
        },
      },
    });

    const workoutCompleteEl = document.getElementById("dailyProgress");
    const supplementCompleteEl = document.getElementById("supplementProgress");
    const totalProgressEl = document.getElementById("totalProgress");
    if (workoutCompleteEl) {
      workoutCompleteEl.textContent = `${workoutComplete}/${workouts.length}`;
    }
    if (supplementCompleteEl) {
      supplementCompleteEl.textContent = `${supplementComplete}/${supplements.length}`;
    }
    if (totalProgressEl) {
      totalProgressEl.textContent = `${workoutComplete + supplementComplete}/${workouts.length + supplements.length}`;
    }
  }

  function updateAllCharts() {
    const state = store.getState();
    updateWorkoutCharts(state.workouts);
    updateSupplementCharts(state.supplements);
    updateOverallProgress(state.workouts, state.supplements);
  }

  function cleanup() {
    chartInstances.forEach((chart) => {
      if (chart && typeof chart.destroy === "function") {
        chart.destroy();
      }
    });
    chartInstances.clear();
  }

  const updateChartsDebounced = window.app.debounce(updateAllCharts, 50);

  return {
    updateCharts: updateAllCharts,
    updateChartsDebounced,
    cleanup,
  };
})(window.app.state);
