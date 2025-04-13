let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let sortDirection = 'newest';

const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const filterButtons = document.querySelectorAll('#status-filters button');
const sortBtn = document.getElementById('sort-btn');

const exportTxtBtn = document.getElementById('export-txt-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const importJsonBtn = document.getElementById('import-json-btn');
const importTxtBtn = document.getElementById('import-txt-btn');
const importJsonInput = document.getElementById('import-json');
const importTxtInput = document.getElementById('import-txt');

const chartCanvas = document.getElementById('progress-chart');
let progressChart;

function renderTasks() {
  taskList.innerHTML = '';

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

  updateProgressChart();
}

function updateProgressChart() {
  const completed = tasks.filter(t => t.completed).length;
  const remaining = tasks.length - completed;

  if (progressChart) progressChart.destroy();

  progressChart = new Chart(chartCanvas, {
    type: 'doughnut',
    data: {
      labels: ['Виконано', 'Невиконано'],
      datasets: [{
        data: [completed, remaining],
        backgroundColor: ['#28a745', '#e0e0e0']
      }]
    },
    options: {
      plugins: {
        legend: {
          display: true
        }
      },
      cutout: 0
    }
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
      completedAt: null
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

// ====== Експорт ======
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

exportTxtBtn.addEventListener('click', () => {
  const lines = tasks.map(t => {
    const status = t.completed ? '[ВИКОНАНО]' : '[ ]';
    const date = new Date(t.createdAt).toLocaleString('uk-UA');
    return `${status} ${t.text} (Додано: ${date})`;
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  downloadBlob(blob, 'todo-tasks.txt');
});

exportJsonBtn.addEventListener('click', () => {
  const json = JSON.stringify(tasks, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, 'todo-tasks.json');
});

// ====== Імпорт ======
importJsonBtn.addEventListener('click', () => importJsonInput.click());
importTxtBtn.addEventListener('click', () => importTxtInput.click());

importJsonInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const data = JSON.parse(reader.result);
      if (Array.isArray(data)) {
        tasks = data;
        saveTasks();
      } else {
        alert('Файл JSON має бути масивом!');
      }
    } catch {
      alert('Помилка парсингу JSON!');
    }
  };
  reader.readAsText(file);
});

importTxtInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    const lines = reader.result.split('\n').filter(Boolean);
    const imported = lines.map(line => {
      const isDone = line.startsWith('[ВИКОНАНО]');
      const text = line.replace(/\[.*?\]\s*/, '').split('(Додано')[0].trim();
      return {
        text,
        completed: isDone,
        createdAt: new Date().toISOString(),
        completedAt: isDone ? new Date().toISOString() : null
      };
    });
    tasks = tasks.concat(imported);
    saveTasks();
  };
  reader.readAsText(file);
});

// ====== Дії ======
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
