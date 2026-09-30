# TaskFlow — Single-Page To-Do & Task Notes App

**TaskFlow** is a modern Single-Page Application (SPA) built with HTML5, CSS3, and Vanilla JavaScript. It delivers a fast task management experience with inline notes support, priority tracking, and zero full-page reloads.

---

## ✨ Features

- **Single-Page Architecture (SPA)**: All operations—creating tasks, toggling completion, setting priorities/due dates, live search, and note drawer management—happen seamlessly on one screen.
- **Embedded Task Notes**: Expand inline drawers on any task card to add, pin, and delete multiple notes per task.
- **Priority & Due Date Tracking**: Assign High, Medium, or Low priorities with glowing badges and automatic overdue badges.
- **Real-Time Client-Side Search & Filter**: Filter tasks instantly by status (`All`, `Active`, `Completed`, `High Priority`) and search across titles, descriptions, and note content.
- **Dark Glassmorphism UI**: Styled with modern typography (Plus Jakarta Sans), smooth micro-animations, custom checkmarks, and toast notifications.
- **Local Persistence**: Saves all tasks and notes reliably in `localStorage`.

---

## 📁 Project Structure

- `index.html` — Single page layout structure.
- `styles.css` — Glassmorphism CSS design system.
- `app.js` — Core JavaScript SPA engine & `localStorage` manager.
- `vercel.json` — Static deployment configuration for Vercel.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/mr-wizzy/toDoApp.git
cd toDoApp

# Serve locally
npx serve .
```

Open `http://localhost:3000` or double-click `index.html` to run directly in any web browser!
