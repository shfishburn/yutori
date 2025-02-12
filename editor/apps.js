/*
 * app.js
 * JSON File Manager
 *
 * This file handles:
 * - Loading and parsing a JSON file via the File System Access API
 * - Rendering JSON objects with pagination, a total count, and per‑object subheadings
 * - Editing/adding objects via a responsive modal with a sticky header and scrollable body
 * - Deleting objects and saving changes back to the file
 * - Hiding the JSON Manager controls when the modal is open
 */

"use strict";

// -------------------------------------------------------------------------
// Global Variables
// -------------------------------------------------------------------------
let fileHandle = null;         // Reference to the opened file handle.
let jsonData = [];             // Array of JSON objects loaded from the file.
let columns = [];              // Union of keys across all objects.
let editingIndex = null;       // Index of the object being edited (null if adding a new object).
let itemsToShow = 10;          // Number of objects to render initially (pagination).

// -------------------------------------------------------------------------
// Event Listeners
// -------------------------------------------------------------------------
document.getElementById("openFileBtn").addEventListener("click", openFile);
document.getElementById("saveFileBtn").addEventListener("click", saveFile);
document.getElementById("addItemBtn").addEventListener("click", () => {
  editingIndex = null; // When adding a new object, no object is being edited.
  showItemForm({});
});

// -------------------------------------------------------------------------
// File Loading and Parsing
// -------------------------------------------------------------------------
async function openFile() {
  const loader = document.getElementById("loadingIndicator");
  loader.classList.remove("hidden"); // Show loader
  try {
    if (!window.showOpenFilePicker) {
      alert("File System Access API is not supported in this browser.");
      return;
    }
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: "JSON Files",
        accept: { "application/json": [".json"] },
      }],
      multiple: false
    });
    fileHandle = handle;
    const file = await handle.getFile();
    let contents = await file.text();
    // Remove BOM if present.
    contents = contents.replace(/^\uFEFF/, "");
    console.log("File contents:", contents);
    jsonData = JSON.parse(contents);
    if (!Array.isArray(jsonData)) {
      alert("The JSON file does not contain an array.");
      jsonData = [];
      return;
    }
    itemsToShow = 10; // Reset pagination on file load.
    computeColumns();
    renderTables();
    // Enable Save and Add buttons.
    document.getElementById("saveFileBtn").disabled = false;
    document.getElementById("addItemBtn").disabled = false;
  } catch (error) {
    console.error("Error opening file:", error);
    alert("Failed to open file. See console for details.");
  } finally {
    loader.classList.add("hidden"); // Hide loader
  }
}

function computeColumns() {
  const cols = new Set();
  jsonData.forEach(item => {
    Object.keys(item).forEach(key => cols.add(key));
  });
  columns = Array.from(cols);
}

// -------------------------------------------------------------------------
// Dropdown Options
// -------------------------------------------------------------------------
function getDropdownOptions(fieldName) {
  const freq = {};
  jsonData.forEach(item => {
    if (item[fieldName] !== undefined) {
      const val = item[fieldName];
      freq[val] = (freq[val] || 0) + 1;
    }
  });
  const options = Object.keys(freq);
  // Sort alphabetically (A–Z)
  options.sort((a, b) => a.localeCompare(b));
  return options;
}

// -------------------------------------------------------------------------
// Rendering JSON Objects
// -------------------------------------------------------------------------
function renderTables() {
  const dataContainer = document.getElementById("dataContainer");
  dataContainer.innerHTML = "";

  // Display total object count.
  const countHeader = document.createElement("h2");
  countHeader.textContent = `Total Objects: ${jsonData.length}`;
  countHeader.classList.add("mb-4", "text-xl", "font-bold");
  dataContainer.appendChild(countHeader);

  // Render only the subset of objects for pagination.
  const currentItems = jsonData.slice(0, itemsToShow);
  currentItems.forEach((item, index) => {
    const globalIndex = index; // Because we slice from the beginning.

    // Object container.
    const objectContainer = document.createElement("div");
    objectContainer.classList.add("object-container", "mb-6", "p-4", "bg-gray-100");

    // Subheading with object number.
    const objectHeader = document.createElement("h3");
    objectHeader.textContent = `Object ${globalIndex + 1} of ${jsonData.length}`;
    objectHeader.classList.add("mb-2", "text-lg", "font-semibold");
    objectContainer.appendChild(objectHeader);

    // Icon container for Edit and Delete icons.
    const iconContainer = document.createElement("div");
    iconContainer.classList.add("icon-container", "mb-2", "flex", "space-x-2");

    // Edit icon.
    const editIcon = document.createElement("span");
    editIcon.innerHTML = `
      <svg class="h-6 w-6 cursor-pointer" width="24" height="24" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>`;
    editIcon.addEventListener("click", () => {
      try {
        const globalIndex = jsonData.indexOf(item);
        console.log("Edit icon clicked for index:", globalIndex, item);
        if (globalIndex === -1) {
          throw new Error("Item not found in jsonData array");
        }
        editingIndex = globalIndex;
        showItemForm(item);
      } catch (err) {
        console.error("Error editing item:", err);
      }
    });
    iconContainer.appendChild(editIcon);

    // Delete icon.
    const deleteIcon = document.createElement("span");
    deleteIcon.innerHTML = `
      <svg class="h-6 w-6 cursor-pointer" width="24" height="24" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z"/>
        <line x1="4" y1="7" x2="20" y2="7"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
        <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/>
        <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>
      </svg>`;
    deleteIcon.addEventListener("click", async () => {
      try {
        const globalIndex = jsonData.indexOf(item);
        console.log("Delete icon clicked for index:", globalIndex, item);
        if (globalIndex === -1) {
          throw new Error("Item not found in jsonData array");
        }
        if (confirm("Are you sure you want to delete this item?")) {
          jsonData.splice(globalIndex, 1);
          computeColumns();
          renderTables();
          await saveFile();
        }
      } catch (err) {
        console.error("Error deleting item:", err);
      }
    });
    iconContainer.appendChild(deleteIcon);

    objectContainer.appendChild(iconContainer);

    // Create a table for the object's data.
    const table = document.createElement("table");
    table.classList.add("data-table", "w-full", "mb-4");

    // Table header row ("FIELD" and "DATA")
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const fieldHeader = document.createElement("th");
    fieldHeader.textContent = "FIELD";
    fieldHeader.classList.add("text-left", "px-2", "py-1");
    headerRow.appendChild(fieldHeader);
    const dataHeader = document.createElement("th");
    dataHeader.textContent = "DATA";
    dataHeader.classList.add("text-left", "px-2", "py-1");
    headerRow.appendChild(dataHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body: list each field/value pair.
    const tbody = document.createElement("tbody");
    columns.forEach((key) => {
      const row = document.createElement("tr");
      const th = document.createElement("th");
      th.textContent = key;
      th.classList.add("text-left", "px-2", "py-1");
      row.appendChild(th);
      const td = document.createElement("td");
      td.textContent = item[key] !== undefined ? item[key] : "";
      td.classList.add("text-left", "px-2", "py-1");
      row.appendChild(td);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    objectContainer.appendChild(table);
    dataContainer.appendChild(objectContainer);
  });

  // Add "Load More" button if more objects exist.
  if (itemsToShow < jsonData.length) {
    const loadMoreBtn = document.createElement("button");
    loadMoreBtn.textContent = "Load More";
    loadMoreBtn.classList.add("btn", "mt-4");
    loadMoreBtn.addEventListener("click", () => {
      itemsToShow += 10;
      renderTables();
    });
    dataContainer.appendChild(loadMoreBtn);
  }
}

// -------------------------------------------------------------------------
// Modal Editing and Dropdown Handling
// -------------------------------------------------------------------------

// createFieldInput: Creates a form field for a given key and current value.
// If common dropdown options exist (sorted alphabetically) for the field,
// it creates a select dropdown with an "Other" option and a custom input.
// On EDIT, if no valid current value is provided, the select defaults to the first option.
function createFieldInput(key, currentValue) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("mb-2");

  const label = document.createElement("label");
  label.textContent = key + ": ";
  label.classList.add("block", "font-medium", "mb-1");
  wrapper.appendChild(label);

  const options = getDropdownOptions(key);
  if (options.length > 0) {
    const select = document.createElement("select");
    select.name = key;
    select.classList.add("border", "p-1", "w-full");
    options.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option;
      opt.textContent = option;
      select.appendChild(opt);
    });
    // Always add an "Other" option.
    const otherOption = document.createElement("option");
    otherOption.value = "Other";
    otherOption.textContent = "Other";
    select.appendChild(otherOption);

    // Set the select's value:
    // If currentValue is defined, nonempty, and exists among options, use it;
    // otherwise, default to the first option.
    if (currentValue !== undefined && currentValue !== "" && options.includes(currentValue)) {
      select.value = currentValue;
    } else {
      select.value = options[0];
    }

    // Create a custom input for new values.
    const customInput = document.createElement("input");
    customInput.type = "text";
    customInput.name = key + "_custom";
    customInput.classList.add("border", "p-1", "w-full", "mt-1");
    // Initially hide the custom input.
    customInput.style.display = "none";

    // When the select changes, toggle the custom input if "Other" is selected.
    select.addEventListener("change", function () {
      if (this.value === "Other") {
        customInput.style.display = "block";
      } else {
        customInput.style.display = "none";
      }
    });

    // When the custom input loses focus, add its value to the select if nonempty.
    customInput.addEventListener("blur", function () {
      const newValue = this.value.trim();
      if (newValue !== "") {
        let found = false;
        for (const opt of select.options) {
          if (opt.value === newValue) {
            found = true;
            break;
          }
        }
        if (!found) {
          const newOption = document.createElement("option");
          newOption.value = newValue;
          newOption.textContent = newValue;
          // Insert new option before the "Other" option.
          select.insertBefore(newOption, select.lastElementChild);
        }
        select.value = newValue;
        customInput.style.display = "none";
      }
    });

    wrapper.appendChild(select);
    wrapper.appendChild(customInput);
  } else {
    // If no common options exist, simply create a text input.
    const input = document.createElement("input");
    input.type = "text";
    input.name = key;
    input.value = currentValue !== undefined ? currentValue : "";
    input.classList.add("border", "p-1", "w-full");
    wrapper.appendChild(input);
  }
  return wrapper;
}

// showItemForm: Opens the modal with an editing (or adding) form.
// It hides the JSON Manager controls so they don't overlap the modal.
// The modal content is split into a sticky header and a scrollable body.
function showItemForm(item = {}) {
  // Hide JSON Manager controls.
  const controls = document.querySelector("#json-manager .controls");
  if (controls) {
    controls.classList.add("hidden");
  }

  const modalContainer = document.getElementById("modalContainer");
  const modalContent = document.getElementById("modalContent");
  if (!modalContainer || !modalContent) {
    console.error("Modal container elements not found in HTML.");
    return;
  }
  modalContent.innerHTML = "";

  // Create sticky header.
  const headerContainer = document.createElement("div");
  headerContainer.classList.add("sticky-header");
  const formTitle = document.createElement("h2");
  formTitle.id = "formTitle";
  formTitle.textContent = editingIndex === null ? "Add New Item" : "Edit Item";
  formTitle.classList.add("mb-2", "text-lg", "font-bold");
  headerContainer.appendChild(formTitle);
  modalContent.appendChild(headerContainer);

  // Create scrollable modal body.
  const modalBody = document.createElement("div");
  modalBody.classList.add("modal-body");

  // Create the form element.
  const form = document.createElement("form");
  form.id = "itemForm";
  const formFields = document.createElement("div");
  formFields.id = "formFields";

  // Build a union of global columns and the keys from the current item.
  const formColumns = new Set(columns);
  Object.keys(item).forEach((key) => formColumns.add(key));
  formColumns.forEach((key) => {
    const fieldWrapper = createFieldInput(key, item[key]);
    formFields.appendChild(fieldWrapper);
  });
  form.appendChild(formFields);

  // Create form buttons.
  const formButtons = document.createElement("div");
  formButtons.classList.add("flex", "space-x-2", "mt-2");

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.textContent = "Save Object";
  saveButton.classList.add("btn");
  formButtons.appendChild(saveButton);

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancel";
  cancelButton.classList.add("btn");
  cancelButton.addEventListener("click", hideModal);
  formButtons.appendChild(cancelButton);

  form.appendChild(formButtons);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    saveItemFromModal(form);
  });
  modalBody.appendChild(form);
  modalContent.appendChild(modalBody);
  modalContainer.classList.remove("hidden");
  console.log("Show item form with item:", item);
}

// hideModal: Hides the modal and restores the JSON Manager controls.
function hideModal() {
  const modalContainer = document.getElementById("modalContainer");
  modalContainer.classList.add("hidden");
  console.log("Modal hidden");

  const controls = document.querySelector("#json-manager .controls");
  if (controls) {
    controls.classList.remove("hidden");
  }
}

// saveItemFromModal: Processes the modal form submission,
// collects field values (handling dropdowns and custom inputs),
// and updates or adds the object.
function saveItemFromModal(form) {
  const formFields = form.querySelector("#formFields");
  const newItem = {};
  formFields.childNodes.forEach((fieldWrapper) => {
    const select = fieldWrapper.querySelector("select");
    if (select) {
      const key = select.name;
      if (select.value === "Other") {
        const customInput = fieldWrapper.querySelector(`input[type="text"][name="${key}_custom"]`);
        newItem[key] = customInput ? customInput.value.trim() : "";
      } else {
        newItem[key] = select.value;
      }
    } else {
      const input = fieldWrapper.querySelector("input");
      if (input && input.name) {
        newItem[input.name] = input.value.trim();
      }
    }
  });
  if (Object.keys(newItem).length === 0) {
    alert("No data entered.");
    return;
  }
  if (editingIndex !== null) {
    jsonData[editingIndex] = newItem;
  } else {
    jsonData.push(newItem);
  }
  computeColumns();
  renderTables();
  hideModal();
}

// parseValue: Parses a string value into a Number, Boolean, or returns it as a string.
function parseValue(value) {
  const trimmed = value.trim();
  if (!isNaN(trimmed) && trimmed !== "") {
    return Number(trimmed);
  }
  if (trimmed.toLowerCase() === "true") {
    return true;
  }
  if (trimmed.toLowerCase() === "false") {
    return false;
  }
  return value;
}

// saveFile: Saves the current jsonData back to the file.
async function saveFile() {
  try {
    if (!fileHandle) {
      alert("No file is currently open.");
      return;
    }
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(jsonData, null, 2));
    await writable.close();
    alert("File saved successfully.");
  } catch (error) {
    console.error("Error saving file:", error);
    alert("Failed to save file. See console for details.");
  }
}
