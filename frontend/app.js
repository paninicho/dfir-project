let score = 0;
let tasksMap = {};
const hintsUsed = {};
let currentUser = localStorage.getItem('user');

function updateScore(points = 0) {
  score += points;
  document.getElementById('score').textContent = `Score: ${score}`;
}

function showAuth() {
  const auth = document.getElementById('auth');
  const scoreDiv = document.getElementById('score');
  const content = document.getElementById('content');
  if (currentUser) {
    auth.innerHTML = `Welcome <b>${currentUser}</b> <button onclick="logout()">Logout</button>`;
    scoreDiv.style.display = 'block';
    loadPaths();
  } else {
    auth.innerHTML = `
      <h2>Login or Sign Up</h2>
      <input id="username" placeholder="Username">
      <input id="password" type="password" placeholder="Password">
      <button onclick="login()">Login</button>
      <button onclick="signup()">Sign Up</button>
    `;
    scoreDiv.style.display = 'none';
    content.innerHTML = '';
  }
}

function signup() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  if (!u || !p) return alert('Enter username and password');
  localStorage.setItem('cred_' + u, p);
  currentUser = u;
  localStorage.setItem('user', u);
  score = 0;
  showAuth();
}

function login() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  if (localStorage.getItem('cred_' + u) === p) {
    currentUser = u;
    localStorage.setItem('user', u);
    score = 0;
    showAuth();
  } else {
    alert('Invalid credentials');
  }
}

function logout() {
  localStorage.removeItem('user');
  currentUser = null;
  score = 0;
  showAuth();
}

async function loadPaths() {
  const res = await fetch('http://localhost:3001/api/paths');
  const paths = await res.json();
  const ul = document.createElement('ul');
  ul.className = 'path-list';
  paths.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.title;
    li.onclick = () => loadPath(p.id);
    ul.appendChild(li);
  });
  const content = document.getElementById('content');
  content.innerHTML = '<h2>Select Path</h2>';
  content.appendChild(ul);
  updateScore(0);
}

async function loadPath(id) {
  const res = await fetch(`http://localhost:3001/api/paths/${id}`);
  const path = await res.json();
  const content = document.getElementById('content');
  content.innerHTML = `<h2>${path.title}</h2>`;
  path.modules.forEach(m => {
    const div = document.createElement('div');
    div.innerHTML = `<h3>${m.title}</h3>`;
    div.onclick = () => loadModule(m.id);
    content.appendChild(div);
  });
}

async function loadModule(id) {
  const res = await fetch(`http://localhost:3001/api/modules/${id}`);
  const mod = await res.json();
  tasksMap = {};
  const content = document.getElementById('content');
  content.innerHTML = `<h2>${mod.title}</h2>`;
  mod.tasks.forEach(t => {
    tasksMap[t.id] = t;
    const div = document.createElement('div');
    div.className = 'task';
    if (t.type === 'content') {
      div.innerHTML = `<p>${t.content}</p>`;
    } else if (t.type === 'quiz') {
      div.innerHTML = `<p>${t.content}</p><p>${t.question}</p><input type="text" id="ans-${t.id}"> <button onclick="checkQuiz('${t.id}')">Submit</button> <button onclick="showHint('${t.id}')">Hint</button> <span id="hint-${t.id}" class="hint"></span> <span id="res-${t.id}"></span>`;
    }
    content.appendChild(div);
  });
}

async function checkQuiz(id) {
  const val = document.getElementById('ans-' + id).value;
  const res = await fetch(`http://localhost:3001/api/tasks/${id}/check`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ answer: val })
  });
  const json = await res.json();
  const result = document.getElementById('res-' + id);
  if (json.correct) {
    const points = hintsUsed[id] ? 3 : 5;
    result.textContent = ` Correct! +${points} points!`;
    updateScore(points);
  } else {
    result.textContent = ' Wrong.';
  }
}

function showHint(id) {
  const span = document.getElementById('hint-' + id);
  span.textContent = tasksMap[id].hint;
  hintsUsed[id] = true;
}

showAuth();
