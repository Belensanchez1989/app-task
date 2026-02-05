import { Injectable, signal, effect } from '@angular/core';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface User {
  name: string;
  surname: string;
  avatarUrl: string;
}

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const STORAGE_KEYS = {
  TASKS: 'gestor-tareas-tasks',
  USER: 'gestor-tareas-user'
};

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // Load tasks from localStorage or use default
  readonly tasks = signal<Task[]>(this.loadTasks());

  // Load user from localStorage or use default
  readonly user = signal<User>(this.loadUser());

  // Notification system
  readonly notification = signal<Notification | null>(null);
  private notificationTimeout: any = null;

  constructor() {
    // Auto-save tasks to localStorage whenever they change
    effect(() => {
      this.saveTasks(this.tasks());
    });

    // Auto-save user to localStorage whenever they change
    effect(() => {
      this.saveUser(this.user());
    });
  }

  // Load tasks from localStorage
  private loadTasks(): Task[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
    }
    // Default tasks if nothing in localStorage
    return [
      { id: '1', title: 'Actualizar Sistema de Diseño', completed: false, createdAt: '10 Oct' },
      { id: '2', title: 'Revisar PR #204', completed: false, createdAt: '11 Oct' },
      { id: '3', title: 'Hacer la compra', completed: true, createdAt: '08 Oct' },
    ];
  }

  // Save tasks to localStorage
  private saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
      this.showNotification('Error al guardar las tareas', 'error');
    }
  }

  // Load user from localStorage
  private loadUser(): User {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
    // Default user
    return {
      name: 'Juan',
      surname: 'Pérez',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
    };
  }

  // Save user to localStorage
  private saveUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }

  addTask(title: string) {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    };
    this.tasks.update(tasks => [newTask, ...tasks]);
    this.showNotification('Tarea creada con éxito', 'success');
  }

  editTask(id: string, title: string) {
    this.tasks.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, title } : t)
    );
    this.showNotification('Tarea actualizada', 'success');
  }

  toggleTask(id: string) {
    const task = this.tasks().find(t => t.id === id);
    this.tasks.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
    if (task) {
      this.showNotification(
        task.completed ? 'Tarea marcada como pendiente' : 'Tarea completada',
        'success'
      );
    }
  }

  deleteTask(id: string) {
    this.tasks.update(tasks => tasks.filter(t => t.id !== id));
    this.showNotification('Tarea eliminada', 'success');
  }

  updateUser(updatedUser: User) {
    this.user.set(updatedUser);
    this.showNotification('Perfil actualizado', 'success');
  }

  // Notification methods
  showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    // Clear existing timeout
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    this.notification.set({ message, type });

    // Auto-dismiss after 3 seconds
    this.notificationTimeout = setTimeout(() => {
      this.notification.set(null);
    }, 3000);
  }

  clearNotification() {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.notification.set(null);
  }
}