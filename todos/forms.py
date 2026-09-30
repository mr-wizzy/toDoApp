from django import forms
from .models import Task, TaskNote


class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ['title', 'description', 'priority', 'due_date', 'is_completed']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter task title...',
                'required': True,
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Add details or context (optional)...',
                'rows': 3,
            }),
            'priority': forms.Select(attrs={
                'class': 'form-select',
            }),
            'due_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date',
            }),
        }


class TaskNoteForm(forms.ModelForm):
    class Meta:
        model = TaskNote
        fields = ['content', 'is_pinned']
        widgets = {
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Type your note here...',
                'rows': 2,
                'required': True,
            }),
        }
