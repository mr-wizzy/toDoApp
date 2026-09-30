/**
 * TaskFlow JS Engine - Pure JavaScript Single Page Application Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'taskflow_js_tasks';

  // Application State
  let tasks = loadTasksFromStorage();
  let currentFilter = 'all';
  let currentSearch = '';

  // DOM Elements
  const quickTaskForm = document.getElementById('quickTaskForm');
  const taskSearchInput = document.getElementById('taskSearchInput');
  const filterTabs = document.querySelectorAll('.tab-btn');
  const taskListContainer = document.getElementById('taskListContainer');

  // Initial Seeding & Setup
  if (tasks.length === 0) {
    tasks = getSeedData();
    saveTasksToStorage();
  }

  initEventListeners();
  renderApp();

  /* ==========================================================================
     State & Storage
     ========================================================================== */
  function loadTasksFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse localStorage tasks:', e);
      return [];
    }
  }

  function saveTasksToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  function getSeedData() {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 2);

    return [
      {
        id: 101,
        title: 'Design System Review',
        description: 'Review dark mode glassmorphism UI components and color palette.',
        priority: 'HIGH',
        due_date: futureDate.toISOString().split('T')[0],
        is_completed: false,
        created_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        notes: [
          { id: 201, content: 'Check contrast ratios on high-priority badges.', is_pinned: true, created_at: 'Just now' },
          { id: 202, content: 'Ensure responsive design looks crisp on mobile screens.', is_pinned: false, created_at: '5 mins ago' }
        ]
      },
      {
        id: 102,
        title: 'Build Pure JS Single-Page App',
        description: 'Refactored backend architecture to zero-dependency client-side SPA.',
        priority: 'MEDIUM',
        due_date: today.toISOString().split('T')[0],
        is_completed: false,
        created_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        notes: [
          { id: 203, content: 'Implemented localStorage persistence for instant offline usage.', is_pinned: true, created_at: '10 mins ago' }
        ]
      }
    ];
  }

  /* ==========================================================================
     Event Listeners Initializer
     ========================================================================== */
  function initEventListeners() {
    if (quickTaskForm) {
      quickTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleTaskCreate();
      });
    }

    if (taskSearchInput) {
      let searchTimeout;
      taskSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          currentSearch = e.target.value.toLowerCase().trim();
          renderApp();
        }, 200);
      });
    }

    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.filter || 'all';
        renderApp();
      });
    });
  }

  /* ==========================================================================
     Task Operations
     ========================================================================== */
  function handleTaskCreate() {
    const titleInput = document.getElementById('taskTitle');
    const descInput = document.getElementById('taskDesc');
    const prioritySelect = document.getElementById('taskPriority');
    const dueDateInput = document.getElementById('taskDueDate');

    const title = titleInput.value.trim();
    if (!title) {
      showToast('Please enter a task title', 'error');
      return;
    }

    const newTask = {
      id: Date.now(),
      title: title,
      description: descInput ? descInput.value.trim() : '',
      priority: prioritySelect ? prioritySelect.value : 'MEDIUM',
      due_date: dueDateInput ? dueDateInput.value : '',
      is_completed: false,
      created_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      notes: []
    };

    tasks.unshift(newTask);
    saveTasksToStorage();

    titleInput.value = '';
    if (descInput) descInput.value = '';
    if (dueDateInput) dueDateInput.value = '';

    showToast('Task created successfully!', 'success');
    renderApp();
  }

  window.toggleTaskComplete = function(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.is_completed = !task.is_completed;
      saveTasksToStorage();
      showToast(`Task marked as ${task.is_completed ? 'completed' : 'active'}.`, 'success');
      renderApp();
    }
  };

  window.deleteTask = function(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasksToStorage();
    showToast('Task deleted', 'success');
    renderApp();
  };

  /* ==========================================================================
     Notes Operations
     ========================================================================== */
  window.toggleNotesDrawer = function(taskId) {
    const drawer = document.getElementById(`notes-drawer-${taskId}`);
    if (drawer) {
      drawer.classList.toggle('open');
    }
  };

  window.addNoteToTask = function(taskId, event) {
    event.preventDefault();
    const input = document.getElementById(`note-input-${taskId}`);
    const content = input ? input.value.trim() : '';

    if (!content) {
      showToast('Note content cannot be empty', 'error');
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newNote = {
        id: Date.now(),
        content: content,
        is_pinned: false,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      task.notes.unshift(newNote);
      saveTasksToStorage();
      input.value = '';
      showToast('Note added!', 'success');
      renderApp();
      // Keep drawer open after adding note
      setTimeout(() => window.toggleNotesDrawer(taskId), 50);
    }
  };

  window.deleteNote = function(noteId, taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.notes = task.notes.filter(n => n.id !== noteId);
      saveTasksToStorage();
      showToast('Note deleted', 'success');
      renderApp();
      setTimeout(() => window.toggleNotesDrawer(taskId), 50);
    }
  };

  window.togglePinNote = function(noteId, taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const note = task.notes.find(n => n.id === noteId);
      if (note) {
        note.is_pinned = !note.is_pinned;
        // Sort notes so pinned stay on top
        task.notes.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
        saveTasksToStorage();
        showToast(note.is_pinned ? 'Note pinned' : 'Note unpinned', 'success');
        renderApp();
        setTimeout(() => window.toggleNotesDrawer(taskId), 50);
      }
    }
  };

  /* ==========================================================================
     Rendering & UI Updates
     ========================================================================== */
  function renderApp() {
    const filteredTasks = filterTasks(tasks);
    renderTasksList(filteredTasks);
    updateStats(tasks);
  }

  function filterTasks(taskList) {
    return taskList.filter(task => {
      // Status filter
      if (currentFilter === 'active' && task.is_completed) return false;
      if (currentFilter === 'completed' && !task.is_completed) return false;
      if (currentFilter === 'high' && task.priority !== 'HIGH') return false;

      // Search filter
      if (currentSearch) {
        const matchesTitle = task.title.toLowerCase().includes(currentSearch);
        const matchesDesc = task.description && task.description.toLowerCase().includes(currentSearch);
        const matchesNotes = task.notes && task.notes.some(n => n.content.toLowerCase().includes(currentSearch));
        if (!matchesTitle && !matchesDesc && !matchesNotes) return false;
      }

      return true;
    });
  }

  function renderTasksList(taskList) {
    if (!taskListContainer) return;

    if (!taskList || taskList.length === 0) {
      taskListContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>No tasks found</h3>
          <p>Create a task above or adjust your search filters.</p>
        </div>
      `;
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    taskListContainer.innerHTML = taskList.map(task => {
      const isOverdue = task.due_date && !task.is_completed && task.due_date < todayStr;
      const notesCount = task.notes ? task.notes.length : 0;

      return `
        <div class="task-card ${task.is_completed ? 'completed' : ''} priority-${task.priority}" id="task-card-${task.id}">
          <div class="task-header">
            <label class="custom-checkbox">
              <input type="checkbox" ${task.is_completed ? 'checked' : ''} onchange="toggleTaskComplete(${task.id})">
              <span class="checkmark"></span>
            </label>

            <div class="task-content">
              <div class="task-title">${escapeHtml(task.title)}</div>
              ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}

              <div class="task-meta">
                <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
                ${task.due_date ? `
                  <span class="date-badge ${isOverdue ? 'overdue' : ''}">
                    📅 ${task.due_date} ${isOverdue ? '(Overdue)' : ''}
                  </span>
                ` : ''}
                
                <button class="notes-count-badge" onclick="toggleNotesDrawer(${task.id})">
                  💬 ${notesCount} ${notesCount === 1 ? 'Note' : 'Notes'}
                </button>
              </div>
            </div>

            <div class="task-actions">
              <button class="icon-btn danger" onclick="deleteTask(${task.id})" title="Delete Task">
                🗑️
              </button>
            </div>
          </div>

          <!-- Single Page Inline Notes Expander -->
          <div class="notes-drawer" id="notes-drawer-${task.id}">
            <div class="notes-header">
              <h4>📌 Notes & Updates (${notesCount})</h4>
            </div>

            <form class="add-note-form" onsubmit="addNoteToTask(${task.id}, event)">
              <input type="text" class="form-control" id="note-input-${task.id}" placeholder="Type a note for this task..." required>
              <button type="submit" class="btn-primary" style="padding: 8px 16px;">Add Note</button>
            </form>

            <div class="notes-list">
              ${notesCount > 0 ? task.notes.map(note => `
                <div class="note-item ${note.is_pinned ? 'pinned' : ''}">
                  <div>
                    <div class="note-content">${escapeHtml(note.content)}</div>
                    <div class="note-meta">${note.is_pinned ? '📌 Pinned • ' : ''}${note.created_at}</div>
                  </div>
                  <div class="note-actions">
                    <button class="icon-btn" onclick="togglePinNote(${note.id}, ${task.id})" title="${note.is_pinned ? 'Unpin' : 'Pin'}">
                      ${note.is_pinned ? '📌' : '📍'}
                    </button>
                    <button class="icon-btn danger" onclick="deleteNote(${note.id}, ${task.id})" title="Delete Note">
                      ❌
                    </button>
                  </div>
                </div>
              `).join('') : '<p style="font-size: 0.85rem; color: var(--text-muted);">No notes added yet. Type above to add notes to this task!</p>'}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function updateStats(taskList) {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = taskList.length;
    const completed = taskList.filter(t => t.is_completed).length;
    const pending = total - completed;
    const overdue = taskList.filter(t => t.due_date && !t.is_completed && t.due_date < todayStr).length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statCompleted').textContent = completed;
    document.getElementById('statOverdue').textContent = overdue;
  }

  function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
      <div>${escapeHtml(message)}</div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
