import { Injectable, signal, computed } from '@angular/core';
import { Todo, TodoPriority, TodoFilter } from '../models/todo.model';

const STORAGE_KEY = 'angular-todo-app';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly todosSignal = signal<Todo[]>(this.loadFromStorage());
  readonly filter = signal<TodoFilter>('all');

  readonly todos = computed(() => {
    const all = this.todosSignal();
    const filter = this.filter();
    switch (filter) {
      case 'active':
        return all.filter(t => !t.completed);
      case 'completed':
        return all.filter(t => t.completed);
      default:
        return all;
    }
  });

  readonly allTodos = computed(() => this.todosSignal());
  readonly activeCount = computed(() => this.todosSignal().filter(t => !t.completed).length);
  readonly completedCount = computed(() => this.todosSignal().filter(t => t.completed).length);
  readonly totalCount = computed(() => this.todosSignal().length);
  readonly allCompleted = computed(() => this.todosSignal().length > 0 && this.activeCount() === 0);
  readonly progress = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  addTodo(text: string, priority: TodoPriority = 'medium'): void {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false,
      priority,
      createdAt: new Date(),
    };

    this.todosSignal.update(todos => [newTodo, ...todos]);
    this.saveToStorage();
  }

  toggleTodo(id: string): void {
    this.todosSignal.update(todos =>
      todos.map(t =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date() : undefined }
          : t
      )
    );
    this.saveToStorage();
  }

  deleteTodo(id: string): void {
    this.todosSignal.update(todos => todos.filter(t => t.id !== id));
    this.saveToStorage();
  }

  updateTodoText(id: string, text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    this.todosSignal.update(todos =>
      todos.map(t => (t.id === id ? { ...t, text: trimmed } : t))
    );
    this.saveToStorage();
  }

  toggleAll(): void {
    const allDone = this.allCompleted();
    this.todosSignal.update(todos =>
      todos.map(t => ({ ...t, completed: !allDone, completedAt: !allDone ? new Date() : undefined }))
    );
    this.saveToStorage();
  }

  clearCompleted(): void {
    this.todosSignal.update(todos => todos.filter(t => !t.completed));
    this.saveToStorage();
  }

  setFilter(filter: TodoFilter): void {
    this.filter.set(filter);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todosSignal()));
    } catch (e) {
      console.error('Failed to save todos to localStorage', e);
    }
  }

  private loadFromStorage(): Todo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.map((t: Todo) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
        }));
      }
    } catch (e) {
      console.error('Failed to load todos from localStorage', e);
    }
    return [];
  }
}
