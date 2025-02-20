// Global configuration objects
const ANATOMY_TRAINS = [
  "Arm Lines",
  "Deep Front Line",
  "Lateral Line",
  "Spiral Line",
  "Superficial Back Line",
  "Superficial Front Line"
];

const NASM_CATEGORIES = [
  "Dynamic",
  "Pull",
  "Push",
  "Stabilization"
];

const MOVEMENT_TYPES = [
  "Compound",
  "Controlled",
  "Dynamic",
  "Explosive",
  "Isometric",
  "Isolation",
  "Plyometric",
  "Unilateral"
];

const MUSCLES = {
  "Core & Trunk": [
      "Rectus Abdominis",
      "External Obliques", 
      "Internal Obliques",
      "Transverse Abdominis",
      "Erector Spinae",
      "Core Stabilizers",
      "Quadratus Lumborum"
  ],
  "Upper Body": {
      "Chest": [
          "Pectoralis Major", 
          "Upper Pectoralis Major", 
          "Lower Pectoralis Major", 
          "Serratus Anterior"
      ],
      "Back": [
          "Latissimus Dorsi", 
          "Upper Trapezius", 
          "Middle Trapezius", 
          "Lower Trapezius", 
          "Rhomboids"
      ],
      "Shoulders": [
          "Anterior Deltoid", 
          "Lateral Deltoid", 
          "Posterior Deltoid", 
          "Rotator Cuff"
      ],
      "Arms": [
          "Biceps Brachii", 
          "Triceps Brachii", 
          "Forearm Flexors",
          "Forearm Extensors"
      ]
  },
  "Lower Body": [
      "Quadriceps", 
      "Hamstrings", 
      "Gluteus Maximus", 
      "Gluteus Medius", 
      "Gluteus Minimus",
      "Adductors", 
      "Hip Flexors", 
      "Gastrocnemius", 
      "Soleus"
  ]
};

const MUSCLE_ALIASES = {
  "Abs": "Rectus Abdominis",
  "Pecs": "Pectoralis Major",
  "Lats": "Latissimus Dorsi",
  "Biceps": "Biceps Brachii",
  "Triceps": "Triceps Brachii",
  "Quads": "Quadriceps",
  "Glutes": "Gluteus Maximus"
};

const EQUIPMENT_TYPES = {
  "Bodyweight": [
      "Bodyweight",
      "Pull-Up Bar",
      "Parallel Bars",
      "Gymnastic Rings"
  ],
  "Free Weights": [
      "Barbell",
      "Dumbbell",
      "Kettlebell",
      "Medicine Ball",
      "Sandbag"
  ],
  "Machines": [
      "Cable Machine",
      "Smith Machine",
      "Hyperextension Bench",
      "Stability Ball"
  ],
  "Resistance": [
      "Resistance Band",
      "TRX",
      "Battle Ropes"
  ],
  "Specialty": [
      "Ab Wheel",
      "Plyo Box",
      "Prowler Sled",
      "Tractor Tire",
      "Farmer's Yoke"
  ]
};

// Global state variables
let exercises = [];
let currentPage = 1;
let itemsPerPage = 25; // default value
let filteredExercises = [];

// Main document ready function
$(document).ready(function() {
  // Initialize Select2 for all filter dropdowns
  $("#anatomyTrainsFilter, #muscleGroupFilter, #musclesFilter, #nasmCategoryFilter, #movementTypeFilter, #equipmentTypeFilter").select2({
      placeholder: "Select options",
      allowClear: true,
      width: '100%'
  });

  // Load and process the exercise data
  $.getJSON("/strength/data/strength.json", function(data) {
      console.log("Raw JSON data:", data);
      
      exercises = flattenExercises(data);
      console.log("Flattened exercises:", exercises);
      console.log("Total exercises found:", exercises.length);
      
      // Populate all filter dropdowns
      populateSelect($("#anatomyTrainsFilter"), ANATOMY_TRAINS);
      populateMuscleGroupFilter();
      populateMusclesFilter();
      populateSelect($("#nasmCategoryFilter"), NASM_CATEGORIES);
      populateSelect($("#movementTypeFilter"), MOVEMENT_TYPES);
      
      const allEquipmentTypes = Object.values(EQUIPMENT_TYPES).flat();
      populateSelect($("#equipmentTypeFilter"), allEquipmentTypes);

      // Initial render
      applyFilters();
  }).fail(function(jqXHR, textStatus, errorThrown) {
      console.error("Error loading JSON:", textStatus, errorThrown);
      $("#exerciseList").html('<p class="text-red-600 text-center">Error loading exercises. Please try again later.</p>');
  });

  // Helper function to populate select dropdowns
  function populateSelect($select, options) {
      $select.empty();
      options.forEach(option => {
          $select.append(new Option(option, option));
      });
  }

  // Populate muscle group filter
  function populateMuscleGroupFilter() {
      const $select = $("#muscleGroupFilter");
      $select.empty();
      $select.append(new Option("Core & Trunk", "Core & Trunk"));
      Object.keys(MUSCLES["Upper Body"]).forEach(category => {
          $select.append(new Option(category, category));
      });
      $select.append(new Option("Lower Body", "Lower Body"));
  }

  // Populate specific muscles filter
  function populateMusclesFilter() {
      const $select = $("#musclesFilter");
      $select.empty();
      MUSCLES["Core & Trunk"].forEach(muscle => {
          $select.append(new Option(muscle, muscle));
      });
      Object.values(MUSCLES["Upper Body"]).forEach(muscleGroup => {
          muscleGroup.forEach(muscle => {
              $select.append(new Option(muscle, muscle));
          });
      });
      MUSCLES["Lower Body"].forEach(muscle => {
          $select.append(new Option(muscle, muscle));
      });
  }

  // Filter application
  function applyFilters() {
      const selectedAnatomy = $("#anatomyTrainsFilter").val() || [];
      const selectedMuscleGroups = $("#muscleGroupFilter").val() || [];
      const selectedMuscles = $("#musclesFilter").val() || [];
      const selectedNasm = $("#nasmCategoryFilter").val() || [];
      const selectedMovement = $("#movementTypeFilter").val() || [];
      const selectedEquip = $("#equipmentTypeFilter").val() || [];
      const searchQuery = $("#searchBox").val().toLowerCase().trim();

      filteredExercises = exercises.filter(function(item) {
          const d = item.details;
          
          // Text search on exercise name
          if (searchQuery && !item.name.toLowerCase().includes(searchQuery)) return false;

          // Anatomy Trains filter
          if (selectedAnatomy.length > 0) {
              if (!(d.anatomy_trains && selectedAnatomy.some(t => d.anatomy_trains.includes(t)))) return false;
          }

          // Muscle Group filter
          if (selectedMuscleGroups.length > 0) {
              const hasMatchingGroup = selectedMuscleGroups.some(group => {
                  const primaryMatch = d.muscles?.primary && 
                      d.muscles.primary.split(',').some(m => 
                          isMuscleBelongingToGroup(m.trim(), group)
                      );
                  
                  const secondaryMatch = d.muscles?.secondary && 
                      d.muscles.secondary.split(',').some(m => 
                          isMuscleBelongingToGroup(m.trim(), group)
                      );
                  
                  return primaryMatch || secondaryMatch;
              });
              
              if (!hasMatchingGroup) return false;
          }

          // Specific Muscles filter
          if (selectedMuscles.length > 0) {
              const hasMuscleMatch = selectedMuscles.some(muscle => {
                  const primaryMatch = d.muscles?.primary && 
                      d.muscles.primary.split(',').some(m => 
                          m.trim() === muscle || MUSCLE_ALIASES[m.trim()] === muscle
                      );
                  
                  const secondaryMatch = d.muscles?.secondary && 
                      d.muscles.secondary.split(',').some(m => 
                          m.trim() === muscle || MUSCLE_ALIASES[m.trim()] === muscle
                      );
                  
                  return primaryMatch || secondaryMatch;
              });
              
              if (!hasMuscleMatch) return false;
          }

          // NASM Category filter
          if (selectedNasm.length > 0) {
              if (!selectedNasm.includes(d.nasm_category)) return false;
          }

          // Movement Type filter
          if (selectedMovement.length > 0) {
              if (d.movement_type) {
                  const movTypes = d.movement_type.split(/,| or /).map(s => s.trim());
                  if (!selectedMovement.every(mt => movTypes.includes(mt))) return false;
              } else {
                  return false;
              }
          }

          // Equipment Type filter
          if (selectedEquip.length > 0) {
              if (d.equipment_type) {
                  const eqTypes = d.equipment_type.split(/,| or /).map(s => s.trim());
                  if (!selectedEquip.every(eq => eqTypes.includes(eq))) return false;
              } else {
                  return false;
              }
          }
          return true;
      });

      currentPage = 1; // Reset to first page when filters change
      renderExercises(filteredExercises);
  }

  // Pagination and rendering
  function renderExercises(list) {
      const totalItems = list.length;
      const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / itemsPerPage);
      
      // Update pagination info
      currentPage = Math.min(currentPage, totalPages);
      if (currentPage < 1) currentPage = 1;
      
      // Calculate start and end indices
      const start = itemsPerPage === 'all' ? 0 : (currentPage - 1) * itemsPerPage;
      const end = itemsPerPage === 'all' ? totalItems : Math.min(start + itemsPerPage, totalItems);
      
      // Update UI elements
      document.getElementById('currentPage').textContent = currentPage;
      document.getElementById('totalPages').textContent = totalPages;
      document.getElementById('resultsCount').textContent = `Showing ${start + 1}-${end} of ${totalItems} exercises`;

      // Get the paginated subset of exercises
      const paginatedList = itemsPerPage === 'all' ? list : list.slice(start, end);
      
      // Render the exercises
      const $exerciseList = $("#exerciseList");
      $exerciseList.empty();
      
      if (paginatedList.length === 0) {
          $exerciseList.html('<p class="text-center text-red-600">No exercises found.</p>');
          return;
      }

      // Group exercises by category and subcategory
      const groupedExercises = {};
      paginatedList.forEach(item => {
          const category = item.category;
          const subcategory = item.subcategory;
          
          if (!groupedExercises[category]) {
              groupedExercises[category] = {};
          }
          if (!groupedExercises[category][subcategory]) {
              groupedExercises[category][subcategory] = [];
          }
          groupedExercises[category][subcategory].push(item);
      });

      // Render grouped exercises
      Object.entries(groupedExercises).forEach(([category, subcategories]) => {
          // Create category container
          const categoryDiv = $(`
              <div class="category-section mb-12">
                  <h2 class="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">${category}</h2>
              </div>
          `);

          // Add subcategories
          Object.entries(subcategories).forEach(([subcategory, items]) => {
              const subcategoryDiv = $(`
                  <div class="subcategory-section mb-8">
                      <h3 class="text-xl font-semibold text-gray-700 mb-4">${subcategory}</h3>
                      <div class="exercise-grid grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"></div>
                  </div>
              `);

              // Sort items alphabetically by name before rendering
              const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
              
              // Add exercise cards to subcategory grid
              const exerciseGrid = subcategoryDiv.find('.exercise-grid');
              sortedItems.forEach(item => {
                  const cardHtml = generateExerciseCard(item, item.details);
                  exerciseGrid.append(cardHtml);
              });

              categoryDiv.append(subcategoryDiv);
          });

          $exerciseList.append(categoryDiv);
      });

      // Enable/disable pagination buttons
      const prevButtons = document.querySelectorAll('#prevPage');
      const nextButtons = document.querySelectorAll('#nextPage');
      
      prevButtons.forEach(btn => {
          btn.disabled = currentPage === 1;
          btn.classList.toggle('opacity-50', currentPage === 1);
      });
      
      nextButtons.forEach(btn => {
          btn.disabled = currentPage === totalPages;
          btn.classList.toggle('opacity-50', currentPage === totalPages);
      });
  }

  // Event listeners
  $("#itemsPerPage").on('change', function(e) {
      itemsPerPage = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
      currentPage = 1;
      renderExercises(filteredExercises);
  });

  // Pagination button handlers
  $('#prevPage').on('click', function() {
      if (currentPage > 1) {
          currentPage--;
          renderExercises(filteredExercises);
      }
  });

  $('#nextPage').on('click', function() {
      const totalPages = Math.ceil(filteredExercises.length / itemsPerPage);
      if (currentPage < totalPages) {
          currentPage++;
          renderExercises(filteredExercises);
      }
  });

  // Filter event handlers
  $("#anatomyTrainsFilter, #muscleGroupFilter, #musclesFilter, #nasmCategoryFilter, #movementTypeFilter, #equipmentTypeFilter")
      .on("change", applyFilters);
  
  $("#searchBox").on("keyup", applyFilters);

  // Clear filters button
  $("#clearAllFilters").on("click", function() {
      $("#anatomyTrainsFilter, #muscleGroupFilter, #musclesFilter, #nasmCategoryFilter, #movementTypeFilter, #equipmentTypeFilter")
          .val(null).trigger("change");
      $("#searchBox").val("").trigger("keyup");
  });
});

// Helper function to check muscle group membership
function isMuscleBelongingToGroup(muscle, group) {
  if (group === 'Core & Trunk' && MUSCLES['Core & Trunk'].includes(muscle)) return true;
  if (group === 'Lower Body' && MUSCLES['Lower Body'].includes(muscle)) return true;
  
  const upperBodyGroups = Object.keys(MUSCLES['Upper Body']);
  if (upperBodyGroups.includes(group)) {
      return MUSCLES['Upper Body'][group].includes(muscle);
  }
  
  return false;
}

// Exercise card generation with improved UI structure
function generateExerciseCard(item, d) {
  // Format instructions into numbered list with better UI structure
  let instructionsHtml = '';
  
  if (d.instructions && d.instructions !== 'N/A') {
      // Split instructions by periods, filter out empty strings
      const steps = d.instructions.split('.')
          .map(step => step.trim())
          .filter(step => step.length > 0);
      
      instructionsHtml = `
          <div class="space-y-4">
              <div>
                  <p class="text-sm font-bold text-gray-700 mb-2">Steps</p>
                  ${steps.length > 1 ? 
                      `<ol class="list-decimal pl-5 space-y-1 text-sm text-gray-600">
                          ${steps.map(step => `<li>${step}.</li>`).join('')}
                      </ol>` : 
                      `<p class="text-sm text-gray-600">${d.instructions}</p>`
                  }
              </div>
              <div>
                  <p class="text-sm font-bold text-gray-700 mb-1">Tempo</p>
                  <p class="text-sm text-gray-600">${d.tempo_timing || 'N/A'}</p>
              </div>
              <div>
                  <p class="text-sm font-bold text-gray-700 mb-1">Tips</p>
                  <p class="text-sm text-gray-600">${d.coach_tips || 'N/A'}</p>
              </div>
          </div>`;
  } else {
      instructionsHtml = '<p class="text-sm text-gray-600">N/A</p>';
  }

  return `
      <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100">
          <h4 class="text-lg font-semibold text-gray-800 mb-4">${item.name}</h4>
          
          <!-- Movement Classification -->
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <h5 class="text-sm font-bold text-gray-700 mb-2">Movement Classification</h5>
              <div class="space-y-1 text-sm">
                  <p class="text-gray-600"><span class="font-medium">NASM Category:</span> ${d.nasm_category || 'N/A'}</p>
                  <p class="text-gray-600"><span class="font-medium">Movement Type:</span> ${d.movement_type || 'N/A'}</p>
                  <p class="text-gray-600"><span class="font-medium">Equipment:</span> ${d.equipment_type || 'N/A'}</p>
              </div>
          </div>

          <!-- Muscle Engagement -->
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <h5 class="text-sm font-bold text-gray-700 mb-2">Muscle Engagement</h5>
              <div class="space-y-2">
                  <div>
                      <p class="text-xs font-medium text-gray-600 mb-1">Primary Muscles:</p>
                      <div class="flex flex-wrap gap-1">
                          ${generateMuscleTags(d.muscles?.primary || '', true)}
                      </div>
                  </div>
                  <div class="border-t border-gray-200 pt-2">
                      <p class="text-xs font-medium text-gray-600 mb-1">Secondary Muscles:</p>
                      <div class="flex flex-wrap gap-1">
                          ${generateMuscleTags(d.muscles?.secondary || '', false)}
                      </div>
                  </div>
              </div>
          </div>

          <!-- Instructions -->
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <h5 class="text-sm font-bold text-gray-700 mb-2">Instructions</h5>
              ${instructionsHtml}
          </div>

          <!-- Safety & Modifications -->
          <div class="bg-red-50 rounded-lg p-4">
              <h5 class="text-sm font-bold text-gray-700 mb-2">Safety & Modifications</h5>
              <div class="space-y-2 text-sm">
                  <div>
                      <p class="font-bold text-red-700 mb-1">Safety</p>
                      <p class="text-red-700">${d.safety_contraindications || 'N/A'}</p>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                          <p class="font-bold text-gray-700 mb-1">Progression</p>
                          <p class="text-gray-700">
                              ${d.progressions_regressions?.split(';')[0]?.replace('Progress:', '').trim() || 'N/A'}
                          </p>
                      </div>
                      <div>
                          <p class="font-bold text-gray-700 mb-1">Regression</p>
                          <p class="text-gray-700">
                              ${d.progressions_regressions?.split(';')[1]?.replace('regress:', '').trim() || 'N/A'}
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  `;
}

// Muscle tag generation
function generateMuscleTags(muscles, isPrimary = true) {
  if (!muscles) return '';
  
  let muscleList = [];
  
  if (typeof muscles === 'string') {
      muscleList = muscles.split(',').map(m => m.trim());
  } else if (typeof muscles === 'object') {
      const muscleString = isPrimary ? muscles.primary : muscles.secondary;
      if (muscleString) {
          muscleList = muscleString.split(',').map(m => m.trim());
      }
  }
  
  return muscleList.map(muscle => {
      let muscleGroup = 'core';
      // Check upper body muscles
      for (const group in MUSCLES['Upper Body']) {
          if (MUSCLES['Upper Body'][group].includes(muscle)) {
              muscleGroup = 'upper-body';
              break;
          }
      }
      // Check lower body muscles
      if (MUSCLES['Lower Body'].includes(muscle)) {
          muscleGroup = 'lower-body';
      }
      // Check core muscles
      if (MUSCLES['Core & Trunk'].includes(muscle)) {
          muscleGroup = 'core';
      }

      return `
          <span class="muscle-tag muscle-tag-${muscleGroup} ${isPrimary ? 'muscle-primary' : 'muscle-secondary'}">
              ${muscle}
          </span>
      `;
  }).join(' ');
}

// Citation stripping
function stripCitation(name) {
  return name.replace(/\s*\[oai_citation_attribution:[^\]]+\]/g, "").trim();
}

// Exercise flattening
function flattenExercises(obj, path = []) {
  let result = [];
  if (obj && typeof obj === "object") {
      if ("id" in obj) {
          const exerciseName = stripCitation(path[path.length - 1] || "");
          result.push({
              name: exerciseName,
              details: obj,
              category: path[0] || "",
              subcategory: path[1] || ""
          });
      } else {
          for (const key in obj) {
              if (key === "definitions") continue;
              result = result.concat(flattenExercises(obj[key], path.concat(key)));
          }
      }
  }
  return result;
}