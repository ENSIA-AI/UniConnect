document.addEventListener('DOMContentLoaded', async () => {
  await loadTasks();
  attachFormListener();
});

// Local storage fallback key
const STORAGE_KEY = 'uc_todo_tasks_v1';
let editingTaskId = null;

async function loadTasks() {
  try {
    let tasks = [];
    try {
      tasks = await apiCall(API_ENDPOINTS.TODOS.GET_ALL);
    } catch (e) {
      // fallback to localStorage
      console.warn('API unavailable, using local tasks', e);
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

    // Basic validation
    if (!title) {
      alert('Please enter a task title');
      return;
    }

    if (!date || isNaN(dateObj.getTime())) {
      alert('Please enter a valid due date');
      return;
    }

    
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(date);
    due.setHours(0,0,0,0);
    if (due < today) {
      alert('Due date cannot be in the past');
      return;
    }

    try {
      const taskData = {
        title: title,
        description: desc,
        due_date: date,
        completed: false
      };

      if (editingTaskId) {
        // update
        try {
          await apiCall(API_ENDPOINTS.TODOS.UPDATE, {
            method: 'PUT',
            body: JSON.stringify(Object.assign({ id: editingTaskId }, taskData))
          });
        } catch (e) {
          console.warn('Update API failed, updating locally', e);
          // update local
          const tasks = getLocalTasks();
          const idx = tasks.findIndex(t => String(t.id) === String(editingTaskId));
          if (idx !== -1) {
            tasks[idx] = Object.assign({}, tasks[idx], taskData);
            saveLocalTasks(tasks);
          }
        }
        editingTaskId = null;
      } else {
        // create
        try {
          await apiCall(API_ENDPOINTS.TODOS.CREATE, {
            method: 'POST',
            body: JSON.stringify(taskData)
          });
        } catch (e) {
          console.warn('Create API failed, saving task locally', e);
          createLocalTask(taskData);
        }
      }

      form.reset();
      await loadTasks();
    } catch (error) {
      alert('Failed to save task: ' + (error.message || error));
    }
  });
}

function addTaskToDOM(task) {
  const taskList = document.getElementById('taskList');

  const noTasksBox = taskList.querySelector('.no-tasks-box');
  if (noTasksBox) {
    noTasksBox.remove();
  }

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

 
  editingTaskId = task.id;
  document.querySelector('.add-task').scrollIntoView({ behavior: 'smooth' });
}

let taskToDelete = null;

function showDeletePopup(taskId) {
  taskToDelete = taskId;
  document.getElementById("confirmPopup").style.display = "flex";
}

document.getElementById("confirmYes").onclick = function() {
  if (taskToDelete == null) return;
  deleteTask(taskToDelete, true).then(() => {
    taskToDelete = null;
    const popup = document.getElementById("confirmPopup");
    if (popup) popup.style.display = "none";
  });
};

document.getElementById("confirmNo").onclick = function() {
  document.getElementById("confirmPopup").style.display = "none";
};

async function deleteTask(taskId, showNotification = true) {
  try {
    try {
      await apiCall(API_ENDPOINTS.TODOS.DELETE(taskId), {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Delete API failed, removing locally', e);
      deleteLocalTask(taskId);
    }

    await loadTasks();
  } catch (error) {
    if (showNotification) {
      alert('Failed to delete task: ' + (error.message || error));
    }
  }
}


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
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
