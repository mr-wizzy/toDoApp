/**
 * TaskFlow SPA Engine - Single Page Application Core JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  window.currentFilter = 'all';
  window.currentPriority = '';
  window.currentSearch = '';

  // DOM Elements
  const quickTaskForm = document.getElementById('quickTaskForm');
  const taskSearchInput = document.getElementById('taskSearchInput');
  const filterTabs = document.querySelectorAll('.tab-btn');
  const taskListContainer = document.getElementById('taskListContainer');

  // Initial Load
  initEventListeners();
  refreshTaskList();

  /* ==========================================================================
     CSRF Helper
     ========================================================================== */
  function getCsrfToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, 10) === ('csrftoken=')) {
          cookieValue = decodeURIComponent(cookie.substring(10));
          break;
        }
      }
    }
    return cookieValue || document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
  }

  /* ==========================================================================
     Event Listeners Initializer
     ========================================================================== */
  function initEventListeners() {
    // Quick Create Task Form Submit
    if (quickTaskForm) {
      quickTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleTaskCreate();
      });
    }

    // Live Search Input with Debounce
    if (taskSearchInput) {
      let searchTimeout;
      taskSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          window.currentSearch = e.target.value;
          refreshTaskList();
        }, 250);
      });
    }

    // Filter Tabs
    filterTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        window.currentFilter = tab.dataset.filter || 'all';
        refreshTaskList();
      });
    });
  }

  /* ==========================================================================
     Task API Operations
     ========================================================================== */
  async function refreshTaskList() {
    try {
      const params = new URLSearchParams({
        status: window.currentFilter,
        priority: window.currentPriority,
        search: window.currentSearch
      });

      const response = await fetch(`/api/tasks/?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        renderTasks(data.tasks);
        updateStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      showToast('Failed to load tasks', 'error');
    }
  }

  async function handleTaskCreate() {
    const titleInput = document.getElementById('taskTitle');
    const descInput = document.getElementById('taskDesc');
    const prioritySelect = document.getElementById('taskPriority');
    const dueDateInput = document.getElementById('taskDueDate');

    const title = titleInput.value.trim();
    if (!title) {
      showToast('Please enter a task title', 'error');
      return;
    }

    const payload = {
      title: title,
      description: descInput ? descInput.value.trim() : '',
      priority: prioritySelect ? prioritySelect.value : 'MEDIUM',
      due_date: dueDateInput ? dueDateInput.value : ''
    };

    try {
      const response = await fetch('/api/tasks/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        titleInput.value = '';
        if (descInput) descInput.value = '';
        if (dueDateInput) dueDateInput.value = '';
        
        showToast(data.message || 'Task created!', 'success');
        refreshTaskList();
      } else {
        showToast('Error creating task', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to connect to server', 'error');
    }
  }

  window.toggleTaskComplete = async function(taskId) {
    try {
      const response = await fetch(`/api/tasks/${taskId}/toggle/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCsrfToken()
        }
      });
      const data = await response.json();
      if (data.success) {
        showToast(data.message, 'success');
        refreshTaskList();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to toggle task status', 'error');
    }
  };

  window.deleteTask = async function(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}/delete/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCsrfToken()
        }
      });
      const data = await response.json();
      if (data.success) {
        showToast('Task deleted', 'success');
        refreshTaskList();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete task', 'error');
    }
  };

  /* ==========================================================================
     Notes API Operations (Single Page Thread Management)
     ========================================================================== */
  window.toggleNotesDrawer = function(taskId) {
    const drawer = document.getElementById(`notes-drawer-${taskId}`);
    if (drawer) {
      drawer.classList.toggle('open');
    }
  };

  window.addNoteToTask = async function(taskId, event) {
    event.preventDefault();
    const input = document.getElementById(`note-input-${taskId}`);
    const content = input ? input.value.trim() : '';

    if (!content) {
      showToast('Note text cannot be empty', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}/notes/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ content: content })
      });
      const data = await response.json();

      if (data.success) {
        input.value = '';
        showToast('Note added!', 'success');
        refreshTaskList();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to add note', 'error');
    }
  };

  window.deleteNote = async function(noteId, taskId) {
    try {
      const response = await fetch(`/api/notes/${noteId}/delete/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCsrfToken()
        }
      });
      const data = await response.json();

      if (data.success) {
        showToast('Note deleted', 'success');
        refreshTaskList();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete note', 'error');
    }
  };

  window.togglePinNote = async function(noteId) {
    try {
      const response = await fetch(`/api/notes/${noteId}/toggle-pin/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCsrfToken()
        }
      });
      const data = await response.json();

      if (data.success) {
        showToast(data.message, 'success');
        refreshTaskList();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to pin note', 'error');
    }
  };

  /* ==========================================================================
     DOM Rendering Helpers
     ========================================================================== */
  function renderTasks(tasks) {
    if (!taskListContainer) return;

    if (!tasks || tasks.length === 0) {
      taskListContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>No tasks found</h3>
          <p>Create a task above or adjust your search filters.</p>
        </div>
      `;
      return;
    }

    taskListContainer.innerHTML = tasks.map(task => `
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
                <span class="date-badge ${task.is_overdue ? 'overdue' : ''}">
                  📅 ${task.due_date} ${task.is_overdue ? '(Overdue)' : ''}
                </span>
              ` : ''}
              
              <button class="notes-count-badge" onclick="toggleNotesDrawer(${task.id})">
                💬 ${task.notes_count} ${task.notes_count === 1 ? 'Note' : 'Notes'}
              </button>
            </div>
          </div>

          <div class="task-actions">
            <button class="icon-btn danger" onclick="deleteTask(${task.id})" title="Delete Task">
              🗑️
            </button>
          </div>
        </div>

        <!-- Single Page Inline Notes Drawer -->
        <div class="notes-drawer" id="notes-drawer-${task.id}">
          <div class="notes-header">
            <h4>📌 Notes & Updates (${task.notes_count})</h4>
          </div>

          <form class="add-note-form" onsubmit="addNoteToTask(${task.id}, event)">
            <input type="text" class="form-control" id="note-input-${task.id}" placeholder="Type a note for this task..." required>
            <button type="submit" class="btn-primary" style="padding: 8px 16px;">Add Note</button>
          </form>

          <div class="notes-list">
            ${task.notes && task.notes.length > 0 ? task.notes.map(note => `
              <div class="note-item ${note.is_pinned ? 'pinned' : ''}">
                <div>
                  <div class="note-content">${escapeHtml(note.content)}</div>
                  <div class="note-meta">${note.is_pinned ? '📌 Pinned • ' : ''}${note.created_at}</div>
                </div>
                <div class="note-actions">
                  <button class="icon-btn" onclick="togglePinNote(${note.id})" title="${note.is_pinned ? 'Unpin' : 'Pin'}">
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
    `).join('');
  }

  function updateStats(stats) {
    if (!stats) return;
    document.getElementById('statTotal').textContent = stats.total || 0;
    document.getElementById('statCompleted').textContent = stats.completed || 0;
    document.getElementById('statPending').textContent = stats.pending || 0;
    document.getElementById('statOverdue').textContent = stats.overdue || 0;
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
