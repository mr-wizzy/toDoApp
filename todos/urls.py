from django.urls import path
from . import views

app_name = 'todos'

urlpatterns = [
    path('', views.index, name='index'),
    path('api/tasks/', views.api_tasks_list, name='api_tasks_list'),
    path('api/tasks/create/', views.api_task_create, name='api_task_create'),
    path('api/tasks/<int:task_id>/update/', views.api_task_update, name='api_task_update'),
    path('api/tasks/<int:task_id>/toggle/', views.api_task_toggle, name='api_task_toggle'),
    path('api/tasks/<int:task_id>/delete/', views.api_task_delete, name='api_task_delete'),
    path('api/tasks/<int:task_id>/notes/create/', views.api_note_create, name='api_note_create'),
    path('api/notes/<int:note_id>/delete/', views.api_note_delete, name='api_note_delete'),
    path('api/notes/<int:note_id>/toggle-pin/', views.api_note_toggle_pin, name='api_note_toggle_pin'),
]
