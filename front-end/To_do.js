document.addEventListener('DOMContentLoaded', async () => {
  await loadTasks();
  attachFormListener();
});


// Storage fallback: use backend if available, otherwise localStorage
const STORAGE_KEY = 'uc_todo_tasks_v1';
const useApi = (typeof apiCall === 'function' && typeof API_ENDPOINTS !== 'undefined');

async function loadTasks() {
  try {
    let tasks;
    if (useApi) {
      try {
        tasks = await apiCall(API_ENDPOINTS.TODOS.GET_ALL);
      } catch (e) {
        console.warn('API unavailable, falling back to local tasks.', e);
        tasks = getLocalTasks();
      }
    } else {
      tasks = getLocalTasks();
    }

    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (!tasks || tasks.length === 0) {
      taskList.classList.add('empty');
      const msgBox = document.createElement('div');
      msgBox.textContent = 'No tasks yet';
      msgBox.className = 'no-tasks-box';
      taskList.appendChild(msgBox);
      return;
    }

    taskList.classList.remove('empty');
    tasks.forEach((task) => addTaskToDOM(task));
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

function attachFormListener() {
  const form = document.getElementById('taskForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value.trim();
    const desc = document.getElementById('taskDesc').value.trim();
    const date = document.getElementById('taskDate').value;
    const dateObj = new Date(date);

    if (!title || !date || isNaN(dateObj.getTime())) {
      alert('Please fill in all required fields with a valid date!');
      return;
    }

    try {
      const taskData = {
        title: title,
        description: desc,
        due_date: date,
        completed: false
      };

      if (useApi) {
        try {
          await apiCall(API_ENDPOINTS.TODOS.CREATE, { method: 'POST', body: JSON.stringify(taskData) });
        } catch (e) {
          console.warn('Create API failed, saving task locally.', e);
          createLocalTask(taskData);
        }
      } else {
        createLocalTask(taskData);
      }

      form.reset();
      await loadTasks();
    } catch (error) {
      alert('Failed to create task: ' + (error.message || error));
    }
  });
}

function addTaskToDOM(task) {
  const taskList = document.getElementById('taskList');

  const noTasksBox = taskList.querySelector('.no-tasks-box');
  if (noTasksBox) noTasksBox.remove();

  const taskCard = document.createElement('div');
  taskCard.className = 'task-card';
  taskCard.dataset.id = task.id;

  taskCard.innerHTML = `
    <div class="task-header">
      <h3 class="task-title">${escapeHtml(task.title)}</h3>
      <div class="task-buttons">
        <button class="edit-btn"><i class="fas fa-pen"></i></button>
      </div>
    </div>
    <p class="task-date">Due: ${formatDate(task.due_date)}</p>
    <p class="task-desc">${escapeHtml(task.description)}</p>
    <button class="delete-btn"><i class="fas fa-trash"></i></button>
  `;

  taskList.appendChild(taskCard);

  taskCard.querySelector('.edit-btn').addEventListener('click', () => editTask(task));
  taskCard.querySelector('.delete-btn').addEventListener('click', () => showDeletePopup(task.id));
}

function editTask(task) {
  document.getElementById('taskTitle').value = task.title;
  document.getElementById('taskDesc').value = task.description;
  document.getElementById('taskDate').value = task.due_date;

  // Remove original so saving will create an updated copy
  if (useApi) {
    // best-effort: delete on server then reload after save
    deleteTask(task.id, false);
  } else {
    deleteLocalTask(task.id);
    const taskList = document.getElementById('taskList');
    const card = taskList.querySelector(`[data-id=\"${task.id}\"]`);
    if (card) card.remove();
  }

  document.querySelector('.add-task').scrollIntoView({ behavior: 'smooth' });
}

let taskToDelete = null;

function showDeletePopup(taskId) {
  taskToDelete = taskId;
  document.getElementById('confirmPopup').style.display = 'flex';
}

document.getElementById('confirmYes').onclick = async function() {
  if (taskToDelete == null) return;
  if (useApi) await deleteTask(taskToDelete, true);
  else {
    deleteLocalTask(taskToDelete);
    await loadTasks();
  }
  taskToDelete = null;
  document.getElementById('confirmPopup').style.display = 'none';
};

document.getElementById('confirmNo').onclick = function() {
  taskToDelete = null;
  document.getElementById('confirmPopup').style.display = 'none';
};

async function deleteTask(taskId, showNotification = true) {
  try {
    await apiCall(API_ENDPOINTS.TODOS.DELETE(taskId), { method: 'DELETE' });
    if (showNotification) {
      // Optionally show success message
    }
    await loadTasks();
  } catch (error) {
    console.warn('Delete API failed, removing locally instead.', error);
    deleteLocalTask(taskId);
    if (showNotification) {
      // still reload the UI
    }
    await loadTasks();
  }
}

// Local storage helpers
function getLocalTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createLocalTask(taskData) {
  const tasks = getLocalTasks();
  const id = Date.now().toString();
  const newTask = Object.assign({ id }, taskData);
  tasks.push(newTask);
  saveLocalTasks(tasks);
  return newTask;
}

function deleteLocalTask(taskId) {
  const tasks = getLocalTasks().filter(t => String(t.id) !== String(taskId));
  saveLocalTasks(tasks);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr || '';
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text || '').replace(/[&<>"']/g, m => map[m]);
}