// Hard-coded demo credentials. Client-side only — not real security.
const CREDENTIALS = { username: 'admin', password: 'password123' };

const SESSION_KEY = 'todo-session';
const TODOS_KEY = 'todo-items';

const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const who = document.getElementById('who');
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const filters = document.getElementById('filters');
const count = document.getElementById('count');

let todos = loadTodos();
let filter = 'all';

/* ---------- auth ---------- */

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
    sessionStorage.setItem(SESSION_KEY, username);
    loginForm.reset();
    loginError.hidden = true;
    showApp(username);
  } else {
    loginError.textContent = 'Incorrect username or password.';
    loginError.hidden = false;
    document.getElementById('password').value = '';
  }
});

document.getElementById('logout').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  appScreen.hidden = true;
  loginScreen.hidden = false;
  document.getElementById('username').focus();
});

function showApp(username) {
  who.textContent = username;
  loginScreen.hidden = true;
  appScreen.hidden = false;
  render();
  todoInput.focus();
}

/* ---------- todos ---------- */

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  todos.push({ id: Date.now(), text, done: false });
  todoInput.value = '';
  saveTodos();
  render();
});

todoList.addEventListener('click', (e) => {
  const id = Number(e.target.closest('li')?.dataset.id);
  if (!id) return;

  if (e.target.matches('input[type="checkbox"]')) {
    const todo = todos.find((t) => t.id === id);
    if (todo) todo.done = e.target.checked;
    saveTodos();
    render();
  } else if (e.target.matches('.delete')) {
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    render();
  }
});

filters.addEventListener('click', (e) => {
  if (!e.target.matches('.filter')) return;
  filter = e.target.dataset.filter;
  for (const btn of filters.querySelectorAll('.filter')) {
    btn.classList.toggle('is-active', btn === e.target);
  }
  render();
});

document.getElementById('clear-done').addEventListener('click', () => {
  todos = todos.filter((t) => !t.done);
  saveTodos();
  render();
});

function visibleTodos() {
  if (filter === 'active') return todos.filter((t) => !t.done);
  if (filter === 'done') return todos.filter((t) => t.done);
  return todos;
}

function render() {
  todoList.innerHTML = '';
  const items = visibleTodos();

  if (items.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = todos.length === 0 ? 'Nothing here yet. Add your first todo.' : 'No todos in this view.';
    todoList.appendChild(li);
  }

  for (const todo of items) {
    const li = document.createElement('li');
    li.dataset.id = todo.id;
    if (todo.done) li.classList.add('done');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'delete';
    del.title = 'Delete';
    del.textContent = '×';

    li.append(checkbox, span, del);
    todoList.appendChild(li);
  }

  const left = todos.filter((t) => !t.done).length;
  count.textContent = `${left} ${left === 1 ? 'item' : 'items'} left`;
}

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(TODOS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos() {
  try {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  } catch {
    /* storage unavailable — todos stay in memory only */
  }
}

/* ---------- boot ---------- */

const existing = sessionStorage.getItem(SESSION_KEY);
if (existing) {
  showApp(existing);
} else {
  document.getElementById('username').focus();
}
