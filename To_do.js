document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  attachFormListener();
});

// Get tasks from localStorage
function getTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

// Save tasks to localStorage
function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load all tasks and display them
function loadTasks() {
  const tasks = getTasks();
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.classList.add('empty'); 

    const msgBox = document.createElement('div');
    msgBox.textContent = 'No tasks yet';
    msgBox.className = 'no-tasks-box';
    taskList.appendChild(msgBox);
    return;
  }

  taskList.classList.remove('empty'); // remove flex if tasks exist
  tasks.forEach((task, index) => addTaskToDOM(task, index));
}

// Attach form submit listener
function attachFormListener() {
  const form = document.getElementById('taskForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value.trim();
    const desc = document.getElementById('taskDesc').value.trim();
    const date = document.getElementById('taskDate').value;
    const dateObj = new Date(date);

    // Validate title and date
    if (!title || !date || isNaN(dateObj.getTime())) {
      alert('Please fill in all required fields with a valid date!');
      return;
    }

    const task = { title, description: desc, date };
    const tasks = getTasks();
    tasks.push(task);
    saveTasks(tasks);

    addTaskToDOM(task, tasks.length - 1);

    form.reset();
  });
}

// Add a single task to the DOM
function addTaskToDOM(task, index) {
  const taskList = document.getElementById('taskList');

  // Remove "No tasks yet" box if it exists
  const noTasksBox = taskList.querySelector('.no-tasks-box');
  if (noTasksBox) {
    noTasksBox.remove();
  }

  const taskCard = document.createElement('div');
  taskCard.className = 'task-card';
  taskCard.dataset.index = index;

  taskCard.innerHTML = `
    <div class="task-header">
      <h3 class="task-title">${escapeHtml(task.title)}</h3>
      <div class="task-buttons">
        <button class="edit-btn"><i class="fas fa-pen"></i></button>
      </div>
    </div>
    <p class="task-date">Due: ${formatDate(task.date)}</p>
    <p class="task-desc">${escapeHtml(task.description)}</p>
    <button class="delete-btn"><i class="fas fa-trash"></i></button>
  `;

  taskList.appendChild(taskCard);

  // Edit and delete event listeners
  taskCard.querySelector('.edit-btn').addEventListener('click', () => editTask(index));
  taskCard.querySelector('.delete-btn').addEventListener('click', () => showDeletePopup(index));
}


// Edit a task
function editTask(index) {
  const tasks = getTasks();
  const task = tasks[index];

  document.getElementById('taskTitle').value = task.title;
  document.getElementById('taskDesc').value = task.description;
  document.getElementById('taskDate').value = task.date;

  tasks.splice(index, 1);
  saveTasks(tasks);
  loadTasks();

  document.querySelector('.add-task').scrollIntoView({ behavior: 'smooth' });
}

// Delete task with confirmation popup
let taskToDelete = null;
function showDeletePopup(taskId) {
  taskToDelete = taskId;
  document.getElementById("confirmPopup").style.display = "flex";
}

document.getElementById("confirmYes").onclick = function() {
  deleteTask(taskToDelete);
  document.getElementById("confirmPopup").style.display = "none";
};

document.getElementById("confirmNo").onclick = function() {
  document.getElementById("confirmPopup").style.display = "none";
};

function deleteTask(index) {
  const tasks = getTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  loadTasks();
}

// Format date to "day short(month) year" format
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}


// Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

