/**
 * Sticky Wall Engine - Pure JavaScript SPA matching Reference UI Design
 */

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'sticky_wall_cards';
  const LISTS_KEY = 'sticky_wall_lists';
  const TAGS_KEY = 'sticky_wall_tags';

  // Application State
  let cards = loadData(STORAGE_KEY, getSeedCards());
  let customLists = loadData(LISTS_KEY, ['Personal', 'Work', 'List 1']);
  let customTags = loadData(TAGS_KEY, [{ name: 'Tag 1', color: 'cyan' }, { name: 'Tag 2', color: 'pink' }]);

  let activeView = 'sticky-wall';
  let activeListFilter = null;
  let currentSearch = '';

  // DOM Elements
  const stickyGrid = document.getElementById('stickyGrid');
  const pageTitle = document.getElementById('pageTitle');
  const sidebarSearchInput = document.getElementById('sidebarSearchInput');
  const navItems = document.querySelectorAll('.nav-item');
  const listsContainer = document.getElementById('listsContainer');
  const tagsContainer = document.getElementById('tagsContainer');

  // Modal Elements
  const cardModal = document.getElementById('cardModal');
  const modalTitle = document.getElementById('modalTitle');
  const cardForm = document.getElementById('cardForm');
  const cardIdInput = document.getElementById('cardId');
  const cardTitleInput = document.getElementById('cardTitleInput');
  const cardContentInput = document.getElementById('cardContentInput');
  const cardListSelect = document.getElementById('cardListSelect');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const addNewListBtn = document.getElementById('addNewListBtn');
  const addNewTagBtn = document.getElementById('addNewTagBtn');

  // Initial Setup
  initEventListeners();
  renderLists();
  renderTags();
  renderApp();

  /* ==========================================================================
     Storage & Data Helpers
     ========================================================================== */
  function loadData(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  function saveData(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  function getSeedCards() {
    return [
      {
        id: 1,
        title: 'Social Media',
        content: '- Plan social content\n- Build content calendar\n- Plan promotion and distribution',
        color: 'yellow',
        list: 'Personal',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Content Strategy',
        content: 'Would need time to get insights (goals, personals, budget, audits), but after, it would be good to focus on assembling my team (start with SEO specialist, then perhaps an email marketer?). Also need to brainstorm on tooling.',
        color: 'cyan',
        list: 'Work',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        title: 'Email A/B Tests',
        content: '- Subject lines\n- Sender\n- CTA\n- Sending times',
        color: 'pink',
        list: 'Work',
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        title: 'Banner Ads',
        content: 'Notes from the workshop:\n- Sizing matters\n- Choose distinctive imagery\n- The landing page must match the display ad',
        color: 'orange',
        list: 'List 1',
        created_at: new Date().toISOString()
      }
    ];
  }

  /* ==========================================================================
     Event Listeners Initializer
     ========================================================================== */
  function initEventListeners() {
    // Sidebar Navigation Click
    document.querySelector('.sidebar').addEventListener('click', (e) => {
      const navItem = e.target.closest('.nav-item');
      if (navItem) {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        navItem.classList.add('active');

        if (navItem.dataset.view) {
          activeView = navItem.dataset.view;
          activeListFilter = null;
          pageTitle.textContent = getTitleForView(activeView);
        } else if (navItem.dataset.list) {
          activeView = 'list';
          activeListFilter = navItem.dataset.list;
          pageTitle.textContent = activeListFilter;
        }
        renderApp();
      }
    });

    // Search Input Handler
    if (sidebarSearchInput) {
      let timeout;
      sidebarSearchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          currentSearch = e.target.value.toLowerCase().trim();
          renderApp();
        }, 150);
      });
    }

    // Modal Close Triggers
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    cardModal.addEventListener('click', (e) => {
      if (e.target === cardModal) closeModal();
    });

    // Submit Card Form
    if (cardForm) {
      cardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveCardFromModal();
      });
    }

    // Add New List Button
    if (addNewListBtn) {
      addNewListBtn.addEventListener('click', () => {
        const name = prompt('Enter new list name:');
        if (name && name.trim()) {
          const listName = name.trim();
          if (!customLists.includes(listName)) {
            customLists.push(listName);
            saveData(LISTS_KEY, customLists);
            renderLists();
            showToast(`List "${listName}" created!`, 'success');
          }
        }
      });
    }

    // Add New Tag Button
    if (addNewTagBtn) {
      addNewTagBtn.addEventListener('click', () => {
        const tagName = prompt('Enter new tag name:');
        if (tagName && tagName.trim()) {
          const colors = ['cyan', 'pink', 'yellow', 'orange', 'green'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          customTags.push({ name: tagName.trim(), color: randomColor });
          saveData(TAGS_KEY, customTags);
          renderTags();
          showToast(`Tag "${tagName.trim()}" added!`, 'success');
        }
      });
    }
  }

  /* ==========================================================================
     Card CRUD & Modal Actions
     ========================================================================== */
  function openModalForCreate() {
    modalTitle.textContent = 'New Sticky Note';
    cardIdInput.value = '';
    cardTitleInput.value = '';
    cardContentInput.value = '';
    updateListSelectOptions();
    
    // Default color yellow
    const yellowRadio = document.querySelector('input[name="cardColor"][value="yellow"]');
    if (yellowRadio) yellowRadio.checked = true;

    cardModal.classList.add('open');
    cardTitleInput.focus();
  }

  function openModalForEdit(card) {
    modalTitle.textContent = 'Edit Sticky Note';
    cardIdInput.value = card.id;
    cardTitleInput.value = card.title;
    cardContentInput.value = card.content;
    updateListSelectOptions();
    cardListSelect.value = card.list || 'Personal';

    const colorRadio = document.querySelector(`input[name="cardColor"][value="${card.color}"]`);
    if (colorRadio) colorRadio.checked = true;

    cardModal.classList.add('open');
  }

  function closeModal() {
    cardModal.classList.remove('open');
  }

  function updateListSelectOptions() {
    if (!cardListSelect) return;
    cardListSelect.innerHTML = customLists.map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join('');
  }

  function saveCardFromModal() {
    const id = cardIdInput.value ? parseInt(cardIdInput.value) : null;
    const title = cardTitleInput.value.trim();
    const content = cardContentInput.value.trim();
    const color = document.querySelector('input[name="cardColor"]:checked')?.value || 'yellow';
    const list = cardListSelect.value;

    if (!title) {
      showToast('Please enter a title', 'error');
      return;
    }

    if (id) {
      // Edit existing card
      const card = cards.find(c => c.id === id);
      if (card) {
        card.title = title;
        card.content = content;
        card.color = color;
        card.list = list;
        showToast('Card updated!', 'success');
      }
    } else {
      // Create new card
      const newCard = {
        id: Date.now(),
        title: title,
        content: content,
        color: color,
        list: list,
        created_at: new Date().toISOString()
      };
      cards.push(newCard);
      showToast('New Sticky Note added!', 'success');
    }

    saveData(STORAGE_KEY, cards);
    closeModal();
    renderApp();
  }

  window.deleteCard = function(id, event) {
    if (event) event.stopPropagation();
    if (!confirm('Delete this sticky note?')) return;

    cards = cards.filter(c => c.id !== id);
    saveData(STORAGE_KEY, cards);
    showToast('Note deleted', 'success');
    renderApp();
  };

  window.editCard = function(id, event) {
    if (event) event.stopPropagation();
    const card = cards.find(c => c.id === id);
    if (card) {
      openModalForEdit(card);
    }
  };

  /* ==========================================================================
     Rendering Functions
     ========================================================================== */
  function renderApp() {
    const filteredCards = getFilteredCards();
    renderGrid(filteredCards);
    updateCounts();
  }

  function getFilteredCards() {
    return cards.filter(card => {
      // View or List filter
      if (activeView === 'list' && activeListFilter) {
        if (card.list !== activeListFilter) return false;
      }

      // Search Filter
      if (currentSearch) {
        const titleMatch = card.title.toLowerCase().includes(currentSearch);
        const bodyMatch = card.content && card.content.toLowerCase().includes(currentSearch);
        if (!titleMatch && !bodyMatch) return false;
      }

      return true;
    });
  }

  function renderGrid(cardList) {
    if (!stickyGrid) return;

    let html = cardList.map(card => `
      <div class="sticky-card ${card.color}" onclick="editCard(${card.id}, event)">
        <div class="card-actions">
          <button class="card-action-btn" onclick="editCard(${card.id}, event)" title="Edit Card">✏️</button>
          <button class="card-action-btn danger" onclick="deleteCard(${card.id}, event)" title="Delete Card">🗑️</button>
        </div>

        <div>
          <div class="card-title">${escapeHtml(card.title)}</div>
          <div class="card-body">${escapeHtml(card.content)}</div>
        </div>
      </div>
    `).join('');

    // Add New Card Tile (Always positioned at end of grid)
    html += `
      <div class="add-card-tile" id="addTileBtn">
        <span class="plus-icon">+</span>
      </div>
    `;

    stickyGrid.innerHTML = html;

    // Attach click listener to Add Tile
    const addTileBtn = document.getElementById('addTileBtn');
    if (addTileBtn) {
      addTileBtn.addEventListener('click', openModalForCreate);
    }
  }

  function renderLists() {
    if (!listsContainer) return;
    const colors = ['yellow', 'cyan', 'orange', 'green', 'pink', 'purple'];

    listsContainer.innerHTML = customLists.map((listName, idx) => {
      const color = colors[idx % colors.length];
      const count = cards.filter(c => c.list === listName).length;
      const isActive = activeView === 'list' && activeListFilter === listName;

      return `
        <li class="nav-item ${isActive ? 'active' : ''}" data-list="${escapeHtml(listName)}">
          <span class="nav-label"><span class="color-sq ${color}"></span> ${escapeHtml(listName)}</span>
          <span class="count-badge">${count}</span>
        </li>
      `;
    }).join('');
  }

  function renderTags() {
    if (!tagsContainer) return;
    const tagsHtml = customTags.map(tag => `
      <span class="tag-pill ${tag.color}">${escapeHtml(tag.name)}</span>
    `).join('');

    tagsContainer.innerHTML = tagsHtml + `<button class="add-tag-btn" id="addNewTagBtn">+ Add Tag</button>`;

    const newAddTagBtn = document.getElementById('addNewTagBtn');
    if (newAddTagBtn) {
      newAddTagBtn.addEventListener('click', () => {
        const tagName = prompt('Enter new tag name:');
        if (tagName && tagName.trim()) {
          const colors = ['cyan', 'pink', 'yellow', 'orange', 'green'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          customTags.push({ name: tagName.trim(), color: randomColor });
          saveData(TAGS_KEY, customTags);
          renderTags();
          showToast(`Tag "${tagName.trim()}" added!`, 'success');
        }
      });
    }
  }

  function updateCounts() {
    const upcomingCount = document.getElementById('countUpcoming');
    const todayCount = document.getElementById('countToday');

    if (upcomingCount) upcomingCount.textContent = cards.length * 3; // matching demo design scale
    if (todayCount) todayCount.textContent = cards.length;

    renderLists();
  }

  function getTitleForView(view) {
    switch (view) {
      case 'upcoming': return 'Upcoming Tasks';
      case 'today': return "Today's Tasks";
      case 'calendar': return 'Calendar Overview';
      case 'sticky-wall':
      default:
        return 'Sticky Wall';
    }
  }

  function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : 'ℹ️'}</span> ${escapeHtml(message)}`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(30px)';
      setTimeout(() => toast.remove(), 250);
    }, 2500);
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
