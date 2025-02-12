/*
File: apps.js
Path: /editor/apps.js
Change Control Log:
    2025-02-11 12:20:00 - Initial creation.
    2025-02-11 13:30:00 - Added BOM removal and input trimming.
    2025-02-11 15:30:00 - Refactored rendering for separate tables per object.
    2025-02-11 16:00:00 - Updated render to swap rows and columns (transposed tables).
    2025-02-11 16:30:00 - Updated delete method to auto-save changes.
*/

"use strict";

// Global variables for file handle, JSON data array, union of columns, and editing index.
let fileHandle = null;
let jsonData = [];
let columns = []; // Union of keys across all objects.
let editingIndex = null; // Index of the item being edited (null if adding)

// Event listeners for buttons.
document.getElementById('openFileBtn').addEventListener('click', openFile);
document.getElementById('saveFileBtn').addEventListener('click', saveFile);
document.getElementById('addItemBtn').addEventListener('click', () => {
  editingIndex = null; // Set to null when adding a new item
  showItemForm();
});

// Opens a file picker to select a JSON file and loads its contents.
async function openFile() {
  try {
    if (!window.showOpenFilePicker) {
      alert('File System Access API is not supported in this browser.');
      return;
    }
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: 'JSON Files',
        accept: {'application/json': ['.json']},
      }],
      multiple: false
    });
    fileHandle = handle;
    const file = await handle.getFile();
    let contents = await file.text();
    // Remove BOM if present.
    contents = contents.replace(/^\uFEFF/, '');
    console.log("File contents:", contents);
    jsonData = JSON.parse(contents);
    if (!Array.isArray(jsonData)) {
      alert('The JSON file does not contain an array.');
      jsonData = [];
      return;
    }
    computeColumns();
    renderTables();
    // Enable Save and Add buttons.
    document.getElementById('saveFileBtn').disabled = false;
    document.getElementById('addItemBtn').disabled = false;
  } catch (error) {
    console.error('Error opening file:', error);
    alert('Failed to open file. See console for details.');
  }
}

// Computes the union of keys across all JSON objects.
function computeColumns() {
  const cols = new Set();
  jsonData.forEach(item => {
    Object.keys(item).forEach(key => cols.add(key));
  });
  columns = Array.from(cols);
}

// Renders each JSON object in its own transposed table.
function renderTables() {
  const dataContainer = document.getElementById('dataContainer');
  dataContainer.innerHTML = '';
  jsonData.forEach((item, index) => {
    // Create table element.
    const table = document.createElement('table');
    table.classList.add('data-table');
    
    const tbody = document.createElement('tbody');
    
    // For each column in the union, create a row with key and value.
    columns.forEach(key => {
      const row = document.createElement('tr');
      
      const th = document.createElement('th');
      th.textContent = key;
      row.appendChild(th);
      
      const td = document.createElement('td');
      td.textContent = item[key] !== undefined ? item[key] : '';
      row.appendChild(td);
      
      tbody.appendChild(row);
    });
    
    // Create a row for action buttons.
    const actionRow = document.createElement('tr');
    actionRow.classList.add('actions-row');
    
    const actionCell = document.createElement('td');
    actionCell.colSpan = 2;
    
    // Edit button.
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('btn', 'edit-btn');
    editBtn.addEventListener('click', () => {
      editingIndex = index;
      showItemForm(item);
    });
    actionCell.appendChild(editBtn);
    
    // Delete button. (Updated to auto-save changes)
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('btn', 'delete-btn');
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this item?')) {
        jsonData.splice(index, 1);
        computeColumns();
        renderTables();
        // Auto-save the updated JSON file.
        await saveFile();
      }
    });
    actionCell.appendChild(deleteBtn);
    
    actionRow.appendChild(actionCell);
    tbody.appendChild(actionRow);
    
    table.appendChild(tbody);
    dataContainer.appendChild(table);
  });
}

// Displays the add/edit item form.
function showItemForm(item = {}) {
  const formContainer = document.getElementById('itemFormContainer');
  const formTitle = document.getElementById('formTitle');
  const formFields = document.getElementById('formFields');
  
  formTitle.textContent = editingIndex === null ? 'Add New Item' : 'Edit Item';
  formFields.innerHTML = '';
  
  // Build a set of field names from the union of global columns and the item's keys.
  const formColumns = new Set(columns);
  Object.keys(item).forEach(key => formColumns.add(key));
  
  formColumns.forEach(key => {
    const fieldDiv = document.createElement('div');
    fieldDiv.style.marginBottom = '8px';
    
    const label = document.createElement('label');
    label.textContent = key + ': ';
    fieldDiv.appendChild(label);
    
    const input = document.createElement('input');
    input.type = 'text';
    input.name = key;
    input.value = item[key] !== undefined ? item[key] : '';
    fieldDiv.appendChild(input);
    
    formFields.appendChild(fieldDiv);
  });
  
  // Show the form.
  formContainer.classList.remove('hidden');
}

// Adds a new empty field row to the form.
document.getElementById('addFieldBtn').addEventListener('click', () => {
  const formFields = document.getElementById('formFields');
  const fieldDiv = document.createElement('div');
  fieldDiv.style.marginBottom = '8px';
  
  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.placeholder = 'Field Name';
  keyInput.style.marginRight = '4px';
  
  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.placeholder = 'Field Value';
  
  fieldDiv.appendChild(keyInput);
  fieldDiv.appendChild(valueInput);
  formFields.appendChild(fieldDiv);
});

// Hides the item form.
document.getElementById('cancelItemBtn').addEventListener('click', () => {
  hideItemForm();
});
function hideItemForm() {
  const formContainer = document.getElementById('itemFormContainer');
  formContainer.classList.add('hidden');
}

// Handles form submission to add or update an item.
document.getElementById('itemForm').addEventListener('submit', (e) => {
  e.preventDefault();
  saveItem();
});

function saveItem() {
  const formFields = document.getElementById('formFields');
  const inputs = formFields.querySelectorAll('input');
  const newItem = {};
  
  // Process inputs with a "name" attribute.
  inputs.forEach(input => {
    if (input.name) {
      newItem[input.name] = parseValue(input.value);
    }
  });
  
  // Process additional fields added via the "Add New Field" button.
  const fieldDivs = Array.from(formFields.children);
  fieldDivs.forEach(div => {
    const fieldInputs = div.querySelectorAll('input');
    if (fieldInputs.length === 2 && !fieldInputs[0].name) {
      const key = fieldInputs[0].value.trim();
      const value = fieldInputs[1].value.trim();
      if (key) {
        newItem[key] = parseValue(value);
      }
    }
  });
  
  if (Object.keys(newItem).length === 0) {
    alert('No data entered.');
    return;
  }
  
  if (editingIndex !== null) {
    jsonData[editingIndex] = newItem;
  } else {
    jsonData.push(newItem);
  }
  
  computeColumns();
  renderTables();
  hideItemForm();
}

// Helper function to parse input values.
function parseValue(value) {
  const trimmed = value.trim();
  if (!isNaN(trimmed) && trimmed !== '') {
    return Number(trimmed);
  }
  if (trimmed.toLowerCase() === 'true') {
    return true;
  }
  if (trimmed.toLowerCase() === 'false') {
    return false;
  }
  return value;
}

// Saves the JSON data back to the file.
async function saveFile() {
  try {
    if (!fileHandle) {
      alert('No file is currently open.');
      return;
    }
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(jsonData, null, 2));
    await writable.close();
    alert('File saved successfully.');
  } catch (error) {
    console.error('Error saving file:', error);
    alert('Failed to save file. See console for details.');
  }
}
