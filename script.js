// =========================================================
// 1. FIREBASE AUTHENTICATION INITIALIZATION
// =========================================================
const profileLoggedOut = document.getElementById('profile-logged-out');
const profileLoggedIn = document.getElementById('profile-logged-in');
const googleLoginBtn = document.getElementById('google-login-btn');
const googleLogoutBtn = document.getElementById('google-logout-btn');

const userAvatar = document.getElementById('user-avatar');
const userDisplayName = document.getElementById('user-display-name');
const userEmail = document.getElementById('user-email');

let currentUser = null;

googleLoginBtn.addEventListener('click', () => {
  auth.signInWithPopup(provider)
    .then((result) => console.log("Logged in user:", result.user.displayName))
    .catch((error) => alert("Google Sign-In Failed: " + error.message));
});

googleLogoutBtn.addEventListener('click', () => {
  auth.signOut().catch((error) => console.error("Logout failed:", error));
});

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

function showSubview(targetSubview) {
  createMainSubview.classList.add('hidden');
  createFileSubview.classList.add('hidden');
  createEditorSubview.classList.add('hidden');

  targetSubview.classList.remove('hidden');
}

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

// Fullscreen Editor & Mobile Landscape Toggle
async function openPianoEditor(title) {
  document.body.classList.add('editor-active');
  showSubview(createEditorSubview);

  // Lock phone to landscape if supported
  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('landscape');
    }
  } catch (e) {
    console.log("Landscape lock waiting for user gesture or mobile browser permissions.");
  }

  renderPiano();
}

function exitPianoEditor() {
  document.body.classList.remove('editor-active');
  if (document.exitFullscreen && document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock();
  }
  showSubview(createMainSubview);
}

closeEditorBtn.addEventListener('click', exitPianoEditor);
closeFileBtn.addEventListener('click', () => showSubview(createMainSubview));

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
// 3. AUDIO SYNTHESIZER & DYNAMIC 88-KEY PIANO ENGINE
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

// 88 Piano Key Setup
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const TOTAL_WHITE_KEYS = 52; 
let visibleWhiteKeys = 7; // Default max zoom in: 7 white keys (5 black keys)

const keyboardElem = document.getElementById('piano-keyboard');
const viewportElem = document.getElementById('piano-viewport');

function generate88Keys() {
  const keys = [];
  for (let i = 0; i < 88; i++) {
    const noteNum = i + 9; // A0 starts at index 9
    const noteName = NOTES[noteNum % 12];
    const octave = Math.floor(noteNum / 12);
    const freq = 440 * Math.pow(2, (i - 48) / 12); // Pitch frequency calculation
    const isBlack = noteName.includes('#');

    keys.push({ note: `${noteName}${octave}`, freq, isBlack });
  }
  return keys;
}

const allKeysData = generate88Keys();

function renderPiano() {
  if (!keyboardElem || !viewportElem) return;
  keyboardElem.innerHTML = '';

  const viewportWidth = viewportElem.clientWidth || window.innerWidth;
  const whiteKeyWidth = viewportWidth / visibleWhiteKeys;
  const blackKeyWidth = whiteKeyWidth * 0.65;

  let currentWhiteIndex = 0;

  allKeysData.forEach((keyData) => {
    const keyEl = document.createElement('div');
    
    if (!keyData.isBlack) {
      keyEl.className = 'key-white';
      keyEl.style.width = `${whiteKeyWidth}px`;

      keyEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        playNote(keyData.freq);
        keyEl.classList.add('active');
      });
      keyEl.addEventListener('pointerup', () => keyEl.classList.remove('active'));
      keyEl.addEventListener('pointerleave', () => keyEl.classList.remove('active'));

      keyboardElem.appendChild(keyEl);
      currentWhiteIndex++;
    } else {
      keyEl.className = 'key-black';
      keyEl.style.width = `${blackKeyWidth}px`;
      const leftPos = (currentWhiteIndex * whiteKeyWidth) - (blackKeyWidth / 2);
      keyEl.style.left = `${leftPos}px`;

      keyEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        playNote(keyData.freq);
        keyEl.classList.add('active');
      });
      keyEl.addEventListener('pointerup', () => keyEl.classList.remove('active'));
      keyEl.addEventListener('pointerleave', () => keyEl.classList.remove('active'));

      keyboardElem.appendChild(keyEl);
    }
  });

  keyboardElem.style.width = `${currentWhiteIndex * whiteKeyWidth}px`;
}

// Zoom Handlers
document.getElementById('zoom-in-btn').addEventListener('click', () => {
  if (visibleWhiteKeys > 7) {
    visibleWhiteKeys = Math.max(7, visibleWhiteKeys - 5);
    renderPiano();
  }
});

document.getElementById('zoom-out-btn').addEventListener('click', () => {
  if (visibleWhiteKeys < TOTAL_WHITE_KEYS) {
    visibleWhiteKeys = Math.min(TOTAL_WHITE_KEYS, visibleWhiteKeys + 5);
    renderPiano();
  }
});

window.addEventListener('resize', renderPiano);

// Initial Load
renderProjects();
