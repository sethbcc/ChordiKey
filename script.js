// =========================================================
// 1. FIREBASE AUTHENTICATION INITIALIZATION
// =========================================================
// Replace these placeholders with your config from Firebase Console:
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase Auth
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Profile Page DOM Elements
const profileLoggedOut = document.getElementById('profile-logged-out');
const profileLoggedIn = document.getElementById('profile-logged-in');
const googleLoginBtn = document.getElementById('google-login-btn');
const googleLogoutBtn = document.getElementById('google-logout-btn');

const userAvatar = document.getElementById('user-avatar');
const userDisplayName = document.getElementById('user-display-name');
const userEmail = document.getElementById('user-email');

let currentUser = null;

// Trigger Google Sign-In
googleLoginBtn.addEventListener('click', () => {
  auth.signInWithPopup(provider)
    .then((result) => {
      console.log("Logged in user:", result.user.displayName);
    })
    .catch((error) => {
      console.error("Login failed:", error.message);
      alert("Google Sign-In Failed: " + error.message);
    });
});

// Trigger Sign-Out
googleLogoutBtn.addEventListener('click', () => {
  auth.signOut().catch((error) => console.error("Logout failed:", error));
});

// Update Profile View UI on Login State Change
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    userDisplayName.textContent = user.displayName || "User";
    userEmail.textContent = user.email || "";
    userAvatar.src = user.photoURL || "https://via.placeholder.com/80";

    profileLoggedOut.classList.add('hidden');
    profileLoggedIn.classList.remove('hidden');
  } else {
    currentUser = null;
    profileLoggedIn.classList.add('hidden');
    profileLoggedOut.classList.remove('hidden');
  }
});

// =========================================================
// 2. GENERAL UI & NAVIGATION CONTROL
// =========================================================
const navItems = document.querySelectorAll('.nav-item');
const pageViews = document.querySelectorAll('.page-view');
const searchInput = document.getElementById('main-search-input');

const submitCreateFileBtn = document.getElementById('submit-create-file-btn');
const projectNameInput = document.getElementById('project-name-input');
const currentProjectTitle = document.getElementById('current-project-title');

const createMainSubview = document.getElementById('create-main-subview');
const createFileSubview = document.getElementById('create-file-subview');
const createEditorSubview = document.getElementById('create-editor-subview');

const closeFileBtn = document.getElementById('close-file-btn');
const closeEditorBtn = document.getElementById('close-editor-btn');

const deleteModal = document.getElementById('delete-modal');
const deleteModalText = document.getElementById('delete-modal-text');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

let savedProjects = JSON.parse(localStorage.getItem('chordikey_projects')) || [];
let projectToDeleteId = null;

// Subview Switcher
function showSubview(targetSubview) {
  createMainSubview.classList.add('hidden');
  createFileSubview.classList.add('hidden');
  createEditorSubview.classList.add('hidden');

  targetSubview.classList.remove('hidden');
}

// Render Projects with Live Search
function renderProjects(filterTerm = '') {
  createMainSubview.innerHTML = '';

  const filteredProjects = savedProjects.filter(proj => 
    proj.name.toLowerCase().includes(filterTerm.toLowerCase().trim())
  );

  filteredProjects.forEach((proj) => {
    const item = document.createElement('div');
    item.className = 'project-item';
    item.innerHTML = `
      <div class="saved-project-card">
        <iconify-icon icon="solar:music-note-bold"></iconify-icon>
      </div>
      <div class="project-details">
        <span class="project-name">${proj.name}</span>
        <span class="project-date">${proj.date}</span>
      </div>
      <button class="delete-project-btn" title="Delete file">
        <iconify-icon icon="solar:trash-bin-trash-bold"></iconify-icon>
      </button>
    `;

    item.querySelector('.saved-project-card').addEventListener('click', () => {
      openPianoEditor(proj.name);
    });

    item.querySelector('.delete-project-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      projectToDeleteId = proj.id;
      deleteModalText.textContent = `Are you sure you want to delete "${proj.name}"? This action cannot be undone.`;
      deleteModal.classList.remove('hidden');
    });

    createMainSubview.appendChild(item);
  });

  // Always show "Add New Project" Card
  const addCardItem = document.createElement('div');
  addCardItem.className = 'project-item';
  addCardItem.innerHTML = `
    <div class="new-project-card" id="add-project-btn">
      <iconify-icon icon="ic:round-add"></iconify-icon>
    </div>
    <div class="project-details">
      <span class="project-name">name</span>
      <span class="project-date">date created</span>
    </div>
  `;

  addCardItem.querySelector('#add-project-btn').addEventListener('click', () => {
    projectNameInput.value = '';
    showSubview(createFileSubview);
  });

  createMainSubview.appendChild(addCardItem);
}

function openPianoEditor(title) {
  currentProjectTitle.textContent = `Project: ${title}`;
  showSubview(createEditorSubview);
}

// Search and Enter Key Handlers
searchInput.addEventListener('input', (e) => renderProjects(e.target.value));
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    renderProjects(searchInput.value);
    searchInput.blur();
  }
});

projectNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitCreateFileBtn.click();
  }
});

// Delete Modal Buttons
cancelDeleteBtn.addEventListener('click', () => {
  projectToDeleteId = null;
  deleteModal.classList.add('hidden');
});

confirmDeleteBtn.addEventListener('click', () => {
  if (projectToDeleteId !== null) {
    savedProjects = savedProjects.filter(p => p.id !== projectToDeleteId);
    localStorage.setItem('chordikey_projects', JSON.stringify(savedProjects));
    projectToDeleteId = null;
    deleteModal.classList.add('hidden');
    renderProjects(searchInput.value);
  }
});

closeFileBtn.addEventListener('click', () => showSubview(createMainSubview));
closeEditorBtn.addEventListener('click', () => showSubview(createMainSubview));

// Sidebar Navigation Switcher
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();

    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');

    const targetId = item.getAttribute('data-target');
    pageViews.forEach(view => view.classList.remove('active'));

    const targetView = document.getElementById(targetId);
    if (targetView) targetView.classList.add('active');

    if (targetId === 'create-view') {
      renderProjects(searchInput.value);
      showSubview(createMainSubview);
    }

    const newPlaceholder = item.getAttribute('data-placeholder');
    if (newPlaceholder) searchInput.placeholder = newPlaceholder;
  });
});

// Create File Submit
submitCreateFileBtn.addEventListener('click', () => {
  const fileName = projectNameInput.value.trim() || 'Untitled Project';
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const newProject = { id: Date.now(), name: fileName, date: formattedDate };
  savedProjects.push(newProject);
  localStorage.setItem('chordikey_projects', JSON.stringify(savedProjects));

  projectNameInput.blur();
  renderProjects(searchInput.value);
  openPianoEditor(fileName);
});

// =========================================================
// 3. AUDIO SYNTHESIZER ENGINE
// =========================================================
let audioCtx = null;

function playNote(frequency) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 1.2);
}

const allKeys = document.querySelectorAll('.white-key, .black-key');

function triggerKey(e, key) {
  if (e.type === 'touchstart') e.preventDefault();
  const freq = parseFloat(key.getAttribute('data-freq'));
  if (freq) playNote(freq);
}

allKeys.forEach(key => {
  key.addEventListener('touchstart', (e) => triggerKey(e, key), { passive: false });
  key.addEventListener('mousedown', (e) => triggerKey(e, key));
});

// Initial Render
renderProjects();
