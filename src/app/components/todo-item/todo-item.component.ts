import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.css',
})
export class TodoItemComponent {
  readonly todo = input.required<Todo>();
  readonly toggled = output<string>();
  readonly deleted = output<string>();
  readonly edited = output<{ id: string; text: string }>();

  readonly isEditing = signal(false);
  readonly editText = signal('');

  startEdit(): void {
    this.isEditing.set(true);
    this.editText.set(this.todo().text);
  }

  saveEdit(): void {
    const trimmed = this.editText().trim();
    if (trimmed) {
      this.edited.emit({ id: this.todo().id, text: trimmed });
    }
    this.isEditing.set(false);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  onEditKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.saveEdit();
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }

  onEditInput(value: string): void {
    this.editText.set(value);
  }

  getPriorityLabel(): string {
    const p = this.todo().priority;
    return p.charAt(0).toUpperCase() + p.slice(1);
  }

  getTimeAgo(): string {
    const now = new Date();
    const created = new Date(this.todo().createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }
}
