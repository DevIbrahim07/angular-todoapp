import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { TodoPriority, TodoFilter } from '../../models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [FormsModule, TodoItemComponent],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css',
})
export class TodoListComponent {
  protected readonly todoService = inject(TodoService);

  readonly newTodoText = signal('');
  readonly selectedPriority = signal<TodoPriority>('medium');
  readonly isInputFocused = signal(false);

  addTodo(): void {
    this.todoService.addTodo(this.newTodoText(), this.selectedPriority());
    this.newTodoText.set('');
    this.selectedPriority.set('medium');
  }

  onInputChange(value: string): void {
    this.newTodoText.set(value);
  }

  onPriorityChange(priority: TodoPriority): void {
    this.selectedPriority.set(priority);
  }

  setFilter(filter: TodoFilter): void {
    this.todoService.setFilter(filter);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  getFormattedDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }
}
