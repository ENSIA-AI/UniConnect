document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!currentUser) {
    alert('Please sign in to access this page');
    window.location.href = 'signin.html';
    return;
  }
  
  await loadTasks();
  attachFormListener();
});

async function loadTasks() {
  try {
    const tasks = await apiCall(API_ENDPOINTS.TODOS.GET_ALL);
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

      await apiCall(API_ENDPOINTS.TODOS.CREATE, {
        method: 'POST',
        body: JSON.stringify(taskData)
      });

      form.reset();
      await loadTasks();
    } catch (error) {
      alert('Failed to create task: ' + error.message);
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

  deleteTask(task.id, false);

  document.querySelector('.add-task').scrollIntoView({ behavior: 'smooth' });
}

let taskToDelete = null;

function showDeletePopup(taskId) {
  taskToDelete = taskId;
  document.getElementById("confirmPopup").style.display = "flex";
}

document.getElementById("confirmYes").onclick = function() {
  deleteTask(taskToDelete, true);
  document.getElementById("confirmPopup").style.display = "none";
};

document.getElementById("confirmNo").onclick = function() {
  document.getElementById("confirmPopup").style.display = "none";
};

async function deleteTask(taskId, showNotification = true) {
  try {
    await apiCall(API_ENDPOINTS.TODOS.DELETE(taskId), {
      method: 'DELETE'
    });

    if (showNotification) {
      // Could add a success notification here
    }
    
    await loadTasks();
  } catch (error) {
    if (showNotification) {
      alert('Failed to delete task: ' + error.message);
    }
  }
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