import json
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db.models import Q, Count
from .models import Task, TaskNote
from .forms import TaskForm, TaskNoteForm


@ensure_csrf_cookie
def index(request):
    """Render the Single-Page Application dashboard."""
    tasks = Task.objects.prefetch_related('notes').all()
    
    total_count = tasks.count()
    completed_count = tasks.filter(is_completed=True).count()
    pending_count = tasks.filter(is_completed=False).count()
    overdue_count = sum(1 for t in tasks if t.is_overdue)

    context = {
        'tasks': tasks,
        'stats': {
            'total': total_count,
            'completed': completed_count,
            'pending': pending_count,
            'overdue': overdue_count,
        },
        'priority_choices': Task.PRIORITY_CHOICES,
        'task_form': TaskForm(),
        'note_form': TaskNoteForm(),
    }
    return render(request, 'todos/index.html', context)


def api_tasks_list(request):
    """Return JSON list of tasks with filtering and searching capabilities."""
    queryset = Task.objects.prefetch_related('notes').all()

    # Filter by completion status
    status_filter = request.GET.get('status', 'all')
    if status_filter == 'active':
        queryset = queryset.filter(is_completed=False)
    elif status_filter == 'completed':
        queryset = queryset.filter(is_completed=True)

    # Filter by priority
    priority_filter = request.GET.get('priority', '')
    if priority_filter in ['LOW', 'MEDIUM', 'HIGH']:
        queryset = queryset.filter(priority=priority_filter)

    # Search query in task title, description, or notes
    search_query = request.GET.get('search', '').strip()
    if search_query:
        queryset = queryset.filter(
            Q(title__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(notes__content__icontains=search_query)
        ).distinct()

    tasks_data = [task.to_dict() for task in queryset]
    
    all_tasks = Task.objects.all()
    stats = {
        'total': all_tasks.count(),
        'completed': all_tasks.filter(is_completed=True).count(),
        'pending': all_tasks.filter(is_completed=False).count(),
        'overdue': sum(1 for t in all_tasks if t.is_overdue),
    }

    return JsonResponse({
        'success': True,
        'tasks': tasks_data,
        'stats': stats
    })


@require_http_methods(["POST"])
def api_task_create(request):
    """Create a new task via AJAX/JSON."""
    try:
        if request.content_type == 'application/json':
            data = json.loads(request.body)
            form = TaskForm(data)
        else:
            form = TaskForm(request.POST)

        if form.is_valid():
            task = form.save()
            return JsonResponse({
                'success': True,
                'task': task.to_dict(),
                'message': 'Task created successfully!'
            }, status=201)
        else:
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_http_methods(["POST", "PUT"])
def api_task_update(request, task_id):
    """Update an existing task via AJAX/JSON."""
    task = get_object_or_404(Task, pk=task_id)
    try:
        if request.content_type == 'application/json':
            data = json.loads(request.body)
            form = TaskForm(data, instance=task)
        else:
            form = TaskForm(request.POST, instance=task)

        if form.is_valid():
            updated_task = form.save()
            return JsonResponse({
                'success': True,
                'task': updated_task.to_dict(),
                'message': 'Task updated successfully!'
            })
        else:
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_http_methods(["POST"])
def api_task_toggle(request, task_id):
    """Toggle task completed status."""
    task = get_object_or_404(Task, pk=task_id)
    task.is_completed = not task.is_completed
    task.save()
    return JsonResponse({
        'success': True,
        'task': task.to_dict(),
        'message': f"Task marked as {'completed' if task.is_completed else 'active'}."
    })


@require_http_methods(["POST", "DELETE"])
def api_task_delete(request, task_id):
    """Delete a task."""
    task = get_object_or_404(Task, pk=task_id)
    task.delete()
    return JsonResponse({
        'success': True,
        'task_id': task_id,
        'message': 'Task deleted successfully!'
    })


@require_http_methods(["POST"])
def api_note_create(request, task_id):
    """Add a note to a specific task."""
    task = get_object_or_404(Task, pk=task_id)
    try:
        if request.content_type == 'application/json':
            data = json.loads(request.body)
            content = data.get('content', '').strip()
            is_pinned = data.get('is_pinned', False)
        else:
            content = request.POST.get('content', '').strip()
            is_pinned = request.POST.get('is_pinned') == 'true' or request.POST.get('is_pinned') == 'on'

        if not content:
            return JsonResponse({'success': False, 'error': 'Note content cannot be empty.'}, status=400)

        note = TaskNote.objects.create(
            task=task,
            content=content,
            is_pinned=is_pinned
        )
        return JsonResponse({
            'success': True,
            'note': note.to_dict(),
            'notes_count': task.notes.count(),
            'message': 'Note added successfully!'
        }, status=201)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_http_methods(["POST", "DELETE"])
def api_note_delete(request, note_id):
    """Delete a note."""
    note = get_object_or_404(TaskNote, pk=note_id)
    task = note.task
    note.delete()
    return JsonResponse({
        'success': True,
        'note_id': note_id,
        'task_id': task.id,
        'notes_count': task.notes.count(),
        'message': 'Note deleted successfully!'
    })


@require_http_methods(["POST"])
def api_note_toggle_pin(request, note_id):
    """Toggle note pinned state."""
    note = get_object_or_404(TaskNote, pk=note_id)
    note.is_pinned = not note.is_pinned
    note.save()
    return JsonResponse({
        'success': True,
        'note': note.to_dict(),
        'message': f"Note {'pinned' if note.is_pinned else 'unpinned'}."
    })
