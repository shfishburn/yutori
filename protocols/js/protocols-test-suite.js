// protocols-test-suite.js - Cleaned Implementation
window.protocolsTestSuite = {
    runFullTestSuite: function() {
      console.group('🧪 Protocols Application Test Suite');
      
      // Run tests with a small delay to ensure app is initialized
      setTimeout(() => {
        this.testDataLoading();
        this.testStateManagement();
        this.testCollapseExpandFunctionality();
        this.testTabSwitching();
        this.testProgressChartsRendering();
        
        // Restore default tab after tests
        setTimeout(() => {
          const workoutsTab = document.querySelector('button[data-tab="tab-workout"]');
          if (workoutsTab) {
            workoutsTab.click();
          }
        }, 1000);
      }, 500);
      
      console.groupEnd();
    },
  
    testDataLoading: function() {
      console.group('📂 Data Loading Test');
      try {
        const state = window.app.state.getState();
        console.assert(Array.isArray(state.workouts), 'Workouts should be an array');
        console.assert(Array.isArray(state.supplements), 'Supplements should be an array');
        console.log('✅ Data loaded successfully');
      } catch (error) {
        console.error('❌ Data loading test failed:', error);
      }
      console.groupEnd();
    },
  
    testStateManagement: function() {
      console.group('🔄 State Management Test');
      try {
        const state = window.app.state.getState();
        if (state.workouts.length > 0) {
          const firstWorkout = state.workouts[0];
          const originalState = firstWorkout.completed;
          
          // Test toggling workout completion
          window.app.state.dispatch({
            type: 'TOGGLE_WORKOUT',
            payload: { id: firstWorkout.id, completed: !originalState }
          });
          
          const updatedState = window.app.state.getState();
          const updatedWorkout = updatedState.workouts.find(w => w.id === firstWorkout.id);
          
          console.assert(
            updatedWorkout.completed === !originalState,
            'Workout completion toggle should work'
          );
          
          // Restore original state
          window.app.state.dispatch({
            type: 'TOGGLE_WORKOUT',
            payload: { id: firstWorkout.id, completed: originalState }
          });
          
          console.log('✅ State management working correctly');
        } else {
          console.warn('⚠️ No workouts available for testing');
        }
      } catch (error) {
        console.error('❌ State management test failed:', error);
      }
      console.groupEnd();
    },
  
    testCollapseExpandFunctionality: function() {
      console.group('🔄 Collapse/Expand Test');
      try {
        const workoutGroup = document.querySelector('.workout-group');
        if (!workoutGroup) {
          console.warn('⚠️ No workout groups found for testing');
          console.groupEnd();
          return;
        }
  
        const header = workoutGroup.querySelector('.group-header');
        const content = workoutGroup.querySelector('.group-content');
        
        if (!header || !content) {
          console.error('❌ Required elements not found in workout group');
          console.groupEnd();
          return;
        }
  
        // Test collapsing
        header.click();
        setTimeout(() => {
          console.assert(
            workoutGroup.classList.contains('collapsed'),
            'Group should be collapsed after clicking header'
          );
  
          // Test expanding
          header.click();
          setTimeout(() => {
            console.assert(
              !workoutGroup.classList.contains('collapsed'),
              'Group should be expanded after clicking header again'
            );
            console.log('✅ Collapse/Expand functionality working');
          }, 400);
        }, 400);
      } catch (error) {
        console.error('❌ Collapse/Expand test failed:', error);
      }
      console.groupEnd();
    },
  
    testTabSwitching: function() {
      console.group('🔄 Tab Switching Test');
      try {
        const tabs = ['tab-workout', 'tab-supplements', 'tab-progress'];
        let currentIndex = 0;
  
        const testNextTab = () => {
          if (currentIndex >= tabs.length) {
            console.log('✅ Tab switching working correctly');
            console.groupEnd();
            return;
          }
  
          const tabButton = document.querySelector(`button[data-tab="${tabs[currentIndex]}"]`);
          const tabContent = document.getElementById(tabs[currentIndex]);
          
          if (!tabButton || !tabContent) {
            console.error(`❌ Tab elements not found for ${tabs[currentIndex]}`);
            console.groupEnd();
            return;
          }
  
          tabButton.click();
          
          setTimeout(() => {
            console.assert(
              !tabContent.classList.contains('hidden'),
              `${tabs[currentIndex]} content should be visible`
            );
            currentIndex++;
            testNextTab();
          }, 300);
        };
  
        testNextTab();
      } catch (error) {
        console.error('❌ Tab switching test failed:', error);
        console.groupEnd();
      }
    },
  
    testProgressChartsRendering: function() {
      console.group('📊 Progress Charts Test');
      try {
        const progressTab = document.querySelector('button[data-tab="tab-progress"]');
        if (!progressTab) {
          console.warn('⚠️ Progress tab not found');
          console.groupEnd();
          return;
        }
  
        progressTab.click();
        
        setTimeout(() => {
          const chartCanvases = document.querySelectorAll('#tab-progress canvas');
          console.log(`Found ${chartCanvases.length} chart canvases`);
          
          const chartDiagnostics = Array.from(chartCanvases).map((canvas) => {
            const chart = Chart.getChart(canvas);
            return {
              id: canvas.id,
              hasChart: !!chart,
              hasData: chart ? chart.data.datasets.length > 0 : false,
              isVisible: canvas.offsetWidth > 0 && canvas.offsetHeight > 0
            };
          });
  
          console.table(chartDiagnostics);
          
          const allChartsValid = chartDiagnostics.every(
            chart => chart.hasChart && chart.hasData && chart.isVisible
          );
          
          if (allChartsValid) {
            console.log('✅ Charts initialized and rendered correctly');
          } else {
            console.warn('⚠️ Some charts may not be rendering correctly');
          }
        }, 1000);
      } catch (error) {
        console.error('❌ Progress charts test failed:', error);
      }
      console.groupEnd();
    }
  };
  
  // Run tests when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Running Protocols Test Suite');
    window.protocolsTestSuite.runFullTestSuite();
  });