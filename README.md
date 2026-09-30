# Sticky Wall — Task & Notes Dashboard

**Sticky Wall** is a modern Single-Page Application (SPA) built with HTML5, CSS3, and Vanilla JavaScript with `localStorage` persistence. It replicates the pastel sticky note dashboard UI reference, providing an intuitive canvas to organize thoughts, tasks, and notes into color-coded cards.

---

## ✨ Features

- **Sidebar Navigation**: Left sidebar featuring `Menu` header, real-time search input (`Q Search`), `TASKS` views (`Upcoming`, `Today`, `Calendar`, `Sticky Wall`), `LISTS` categories (`Personal`, `Work`, `List 1`), and `TAGS`.
- **Pastel Sticky Note Cards**: Color-coded cards (Yellow 💛, Cyan 💙, Pink 💖, Orange 🧡, Green 💚, Purple 💜) supporting bullet lists and body notes.
- **Interactive Creation & Editing**: Click the prominent `+` tile to open a modal for creating new sticky notes, picking custom colors, or assigning categories.
- **Card Actions**: Edit card details or delete notes with instant hover controls.
- **Dynamic Category & Tag Management**: Add custom list categories (`+ Add New List`) and tag pills (`+ Add Tag`) dynamically.
- **Real-Time Search & Filtering**: Filter sticky notes in real-time by search query or sidebar list selection.
- **Local Persistence**: Automatic offline data persistence using `localStorage`.

---

## 📁 Project Structure

- `index.html` — Sticky Wall dashboard layout structure.
- `styles.css` — Replicated Sticky Wall pastel CSS design system.
- `app.js` — Client-side SPA engine & `localStorage` manager.
- `vercel.json` — Static site deployment configuration for Vercel.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/mr-wizzy/toDoApp.git
cd toDoApp

# Serve locally
npx serve .
```

Open `http://localhost:3000` or open `index.html` in any web browser!
