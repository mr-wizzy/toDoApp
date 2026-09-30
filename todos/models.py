from django.db import models
from django.utils import timezone


class Task(models.Model):
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    due_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['is_completed', '-created_at']

    def __str__(self):
        return self.title

    @property
    def is_overdue(self):
        if self.due_date and not self.is_completed:
            return self.due_date < timezone.now().date()
        return False

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'is_completed': self.is_completed,
            'is_overdue': self.is_overdue,
            'created_at': self.created_at.strftime('%b %d, %Y %H:%M'),
            'updated_at': self.updated_at.strftime('%b %d, %Y %H:%M'),
            'notes_count': self.notes.count(),
            'notes': [note.to_dict() for note in self.notes.all()]
        }


class TaskNote(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='notes')
    content = models.TextField()
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return f"Note for Task #{self.task_id}: {self.content[:30]}"

    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'content': self.content,
            'is_pinned': self.is_pinned,
            'created_at': self.created_at.strftime('%b %d, %Y %H:%M'),
        }
