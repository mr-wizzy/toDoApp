import json
from datetime import date, timedelta
from django.test import TestCase, Client
from django.urls import reverse
from .models import Task, TaskNote


class TaskModelTest(TestCase):
    def setUp(self):
        self.task = Task.objects.create(
            title="Buy Groceries",
            description="Milk, Bread, Eggs",
            priority="HIGH",
            due_date=date.today() - timedelta(days=1)  # Overdue
        )

    def test_task_creation(self):
        self.assertEqual(self.task.title, "Buy Groceries")
        self.assertEqual(self.task.priority, "HIGH")
        self.assertFalse(self.task.is_completed)
        self.assertTrue(self.task.is_overdue)

    def test_task_to_dict(self):
        task_dict = self.task.to_dict()
        self.assertEqual(task_dict['id'], self.task.id)
        self.assertEqual(task_dict['title'], "Buy Groceries")
        self.assertEqual(task_dict['notes_count'], 0)


class TaskNoteModelTest(TestCase):
    def setUp(self):
        self.task = Task.objects.create(title="Project Meeting", priority="MEDIUM")
        self.note = TaskNote.objects.create(
            task=self.task,
            content="Prepare slide deck for presentation.",
            is_pinned=True
        )

    def test_note_creation(self):
        self.assertEqual(self.note.task, self.task)
        self.assertEqual(self.note.content, "Prepare slide deck for presentation.")
        self.assertTrue(self.note.is_pinned)
        self.assertEqual(self.task.notes.count(), 1)

    def test_cascade_delete(self):
        task_id = self.task.id
        self.task.delete()
        self.assertEqual(TaskNote.objects.filter(task_id=task_id).count(), 0)


class ViewsApiTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.task = Task.objects.create(
            title="Review PRs",
            description="Check code quality",
            priority="HIGH"
        )

    def test_index_view(self):
        response = self.client.get(reverse('todos:index'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/index.html')

    def test_api_tasks_list(self):
        response = self.client.get(reverse('todos:api_tasks_list'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(len(data['tasks']), 1)
        self.assertEqual(data['tasks'][0]['title'], "Review PRs")

    def test_api_task_create(self):
        url = reverse('todos:api_task_create')
        payload = {
            'title': 'Write Documentation',
            'description': 'Docs for API endpoints',
            'priority': 'LOW',
            'due_date': str(date.today() + timedelta(days=5))
        }
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['task']['title'], 'Write Documentation')

    def test_api_task_toggle(self):
        url = reverse('todos:api_task_toggle', args=[self.task.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.task.refresh_from_db()
        self.assertTrue(self.task.is_completed)

    def test_api_task_delete(self):
        url = reverse('todos:api_task_delete', args=[self.task.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Task.objects.filter(id=self.task.id).exists())

    def test_api_note_create_and_delete(self):
        # Create note
        create_url = reverse('todos:api_note_create', args=[self.task.id])
        payload = {'content': 'Initial note content'}
        response = self.client.post(create_url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.json()
        note_id = data['note']['id']
        self.assertEqual(data['notes_count'], 1)

        # Toggle Pin
        pin_url = reverse('todos:api_note_toggle_pin', args=[note_id])
        pin_resp = self.client.post(pin_url)
        self.assertEqual(pin_resp.status_code, 200)
        self.assertTrue(pin_resp.json()['note']['is_pinned'])

        # Delete note
        delete_url = reverse('todos:api_note_delete', args=[note_id])
        del_resp = self.client.post(delete_url)
        self.assertEqual(del_resp.status_code, 200)
        self.assertEqual(self.task.notes.count(), 0)
