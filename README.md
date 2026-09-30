# TaskFlow — Single-Page Django To-Do App

**TaskFlow** is a modern Single-Page Application (SPA) built with Django, HTML5, Vanilla JavaScript, and a dark glassmorphism CSS design system. Manage tasks and attach multiple notes to any task seamlessly on a single screen without page reloads.

## ✨ Features
- **Single-Page Architecture**: Dynamic task creation, completion checkmarks, inline note threads, priority tagging, and live search.
- **Embedded Task Notes**: Attach, pin, and delete multiple notes per task inside interactive inline drawers.
- **Priorities & Due Dates**: Categorize tasks as High, Medium, or Low priorities with overdue indicators.
- **Real-Time Filtering**: Instant search and tab filters (All, Active, Completed).
- **Glassmorphism UI**: Dark mode palette, responsive layout, smooth micro-animations, and toast feedback.

## 🚀 Quick Start
```bash
# Clone repository
git clone https://github.com/mr-wizzy/to-doApp.git
cd to-doApp

# Create virtual environment & install dependencies
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Apply migrations & launch server
python manage.py migrate
python manage.py runserver
```
Open [http://127.0.0.1:8000/](http://127.0.0.1:8000/) in your browser.
