let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let sortDirection = 'newest';

const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const filterButtons = document.querySelectorAll('#status-filters button');
const sortBtn = document.getElementById('sort-btn');

function renderTasks() {
  taskList.innerHTML = '';

  // Генеруємо список реальних індексів
  let visibleTasks = tasks
    .map((task, realIndex) => ({ task, realIndex }))
    .filter(({ task }) => {
      if (currentFilter === 'active') return !task.completed;
      if (currentFilter === 'completed') return task.completed;
      return true;
    });

  visibleTasks.sort((a, b) => {
    return sortDirection === 'newest'
      ? new Date(b.task.createdAt) - new Date(a.task.createdAt)
      : new Date(a.task.createdAt) - new Date(b.task.createdAt);
  });

  visibleTasks.forEach(({ task, realIndex }) => {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : '';

    const createdAt = new Date(task.createdAt).toLocaleString('uk-UA');
    const completedAt = task.completedAt
      ? `<br><small>Виконано: ${new Date(task.completedAt).toLocaleString('uk-UA')}</small>`
      : '';

    li.innerHTML = `
      <div class="task-text">
        <strong>${task.text}</strong><br>
        <small>Додано: ${createdAt}</small>
        ${completedAt}
      </div>
      <div class="actions">
        ${!task.completed ? `<button onclick="markDone(${realIndex})">✅</button>` : ''}
        <button onclick="editTask(${realIndex})">✏️</button>
        <button onclick="deleteTask(${realIndex})">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}


taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text) {
    tasks.push({
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    });
    saveTasks();
    taskInput.value = '';
  }
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

sortBtn.addEventListener('click', () => {
  sortDirection = sortDirection === 'newest' ? 'oldest' : 'newest';
  sortBtn.textContent =
    sortDirection === 'newest' ? 'Сортувати: найновіші' : 'Сортувати: найстаріші';
  renderTasks();
});

function markDone(index) {
  tasks[index].completed = true;
  tasks[index].completedAt = new Date().toISOString();
  saveTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
}

function editTask(index) {
  const newText = prompt('Редагувати завдання:', tasks[index].text);
  if (newText !== null) {
    tasks[index].text = newText.trim();
    saveTasks();
  }
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

renderTasks();
