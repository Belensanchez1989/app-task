import { Component, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService, Task } from '../services/store.service';
import { ThemeService } from '../services/theme.service';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-24">
      <!-- Header -->
      <header class="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-blue-100 dark:border-slate-800">
        <button class="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-blue-100 dark:hover:bg-surface-dark transition-colors text-slate-900 dark:text-white">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <h2 class="text-lg font-bold leading-tight tracking-[-0.015em] text-center text-slate-900 dark:text-white">Gestor de Tareas</h2>
        
        <div class="flex items-center gap-3">
          <!-- Theme Toggle Switch -->
          <button 
            (click)="themeService.toggleTheme()" 
            class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            [class.bg-slate-300]="!themeService.isDarkMode()"
            [class.dark:bg-primary]="themeService.isDarkMode()"
            [class.bg-primary]="themeService.isDarkMode()"
            title="Cambiar tema"
          >
            <span class="sr-only">Cambiar tema</span>
            <span 
              class="inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-300"
              [class.translate-x-1]="!themeService.isDarkMode()"
              [class.translate-x-7]="themeService.isDarkMode()"
            >
              @if (themeService.isDarkMode()) {
                <span class="material-symbols-outlined text-[16px] text-primary">dark_mode</span>
              } @else {
                <span class="material-symbols-outlined text-[16px] text-yellow-500">light_mode</span>
              }
            </span>
          </button>

          <button (click)="goToProfile.emit()" class="flex size-10 shrink-0 items-center justify-center rounded-full overflow-hidden bg-blue-100 dark:bg-surface-dark text-slate-900 dark:text-white ring-2 ring-transparent hover:ring-primary transition-all">
            <img [src]="store.user().avatarUrl" class="w-full h-full object-cover" alt="User" />
          </button>
        </div>
      </header>

      <!-- Hero / Add Task -->
      <section class="@container">
        <div class="flex flex-col justify-end gap-6 px-4 py-8 @[480px]:gap-8 @[480px]:px-10 @[480px]:py-12">
          <div class="flex flex-col gap-2 text-center items-center">
            <h1 class="text-3xl font-black leading-tight tracking-tight max-w-[720px] text-slate-900 dark:text-white">
              Añadir nueva tarea
            </h1>
            <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm">Mantente organizado y productivo</p>
          </div>
          <div class="flex flex-1 justify-center w-full">
            <label class="flex flex-col w-full max-w-[480px]">
              <div class="group flex w-full items-center rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm ring-1 transition-all overflow-hidden h-14"
                   [class.ring-red-500]="newTaskControl.invalid && newTaskControl.touched"
                   [class.ring-blue-100]="newTaskControl.valid || !newTaskControl.touched"
                   [class.dark:ring-transparent]="newTaskControl.valid || !newTaskControl.touched"
                   [class.focus-within:ring-2]="newTaskControl.valid"
                   [class.focus-within:ring-primary]="newTaskControl.valid">
                <input 
                  [formControl]="newTaskControl" 
                  (keydown.enter)="addTask()"
                  class="flex-1 w-full bg-transparent border-none text-slate-900 dark:text-white placeholder:text-text-secondary-light/60 dark:placeholder:text-slate-400 px-4 text-base focus:ring-0 focus:outline-none h-full" 
                  placeholder="¿Qué necesitas hacer?"
                />
                <div class="pr-2">
                  <button (click)="addTask()" class="flex items-center justify-center h-10 px-4 rounded-lg bg-primary hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-md shadow-blue-900/20 active:scale-95">
                    <span class="hidden sm:inline mr-1">Añadir</span>
                    <span class="material-symbols-outlined text-[20px]">add</span>
                  </button>
                </div>
              </div>
              @if (newTaskControl.invalid && newTaskControl.touched) {
                <span class="text-red-500 text-xs mt-1 ml-1">{{ getValidationError() }}</span>
              }
            </label>
          </div>
        </div>
      </section>

      <!-- Filter Buttons -->
      <section class="px-4 pb-2">
        <div class="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <button 
            (click)="setFilter('all')"
            class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all"
            [class]="filter() === 'all' ? 'bg-primary text-white shadow-lg shadow-blue-900/20' : 'bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 border border-blue-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800'"
          >
            <span class="material-symbols-outlined text-[18px]">calendar_today</span>
            <span class="text-sm font-medium leading-normal">Todas</span>
            <span class="text-xs opacity-80">({{ getTotalTasks() }})</span>
          </button>
          <button 
            (click)="setFilter('pending')"
            class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all"
            [class]="filter() === 'pending' ? 'bg-primary text-white shadow-lg shadow-blue-900/20' : 'bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 border border-blue-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800'"
          >
            <span class="material-symbols-outlined text-[18px]">pending_actions</span>
            <span class="text-sm font-medium leading-normal">Pendientes</span>
            <span class="text-xs opacity-80">({{ getPendingCount() }})</span>
          </button>
          <button 
            (click)="setFilter('completed')"
            class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all"
            [class]="filter() === 'completed' ? 'bg-primary text-white shadow-lg shadow-blue-900/20' : 'bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 border border-blue-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800'"
          >
            <span class="material-symbols-outlined text-[18px]">check_circle</span>
            <span class="text-sm font-medium leading-normal">Completadas</span>
            <span class="text-xs opacity-80">({{ getCompletedCount() }})</span>
          </button>
        </div>
      </section>

      <!-- Task List Header -->
      <section class="mt-4">
        <h3 class="text-xl font-bold leading-tight px-4 text-left pb-3 text-slate-900 dark:text-white flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">{{ getFilterIcon() }}</span>
          {{ getFilterTitle() }}
        </h3>
      </section>

      <!-- Main List -->
      <main class="flex flex-col gap-1">
        @for (task of filteredTasks(); track task.id) {
          <div class="task-item group relative overflow-hidden transition-all hover:bg-blue-500/5 dark:hover:bg-white/5">
            <div class="flex items-center gap-4 px-4 py-5 justify-between" [class.opacity-60]="task.completed">
              
              <div class="flex items-center gap-4 flex-1 cursor-pointer" (click)="toggleTask(task.id)">
                <!-- Custom Checkbox -->
                <div class="relative flex items-center justify-center h-6 w-6 rounded-md border-2 border-blue-200 dark:border-slate-600 transition-all"
                     [class.bg-primary]="task.completed" 
                     [class.border-primary]="task.completed"
                     [class.scale-110]="task.completed">
                   @if (task.completed) {
                     <span class="material-symbols-outlined text-white text-[18px]">check</span>
                   }
                </div>

                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full">
                  <p class="text-base font-semibold leading-snug text-slate-900 dark:text-white transition-all"
                     [class.line-through]="task.completed"
                     [class.decoration-slate-400]="task.completed"
                     [class.text-slate-500]="task.completed">
                    {{ task.title }}
                  </p>
                  <span class="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-medium whitespace-nowrap sm:ml-2 mt-1 sm:mt-0">
                    Creado: {{ task.createdAt }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="shrink-0 z-10 flex gap-1">
                @if (!task.completed) {
                  <!-- Edit Button -->
                  <button 
                    (click)="openEditModal(task, $event)" 
                    class="text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-blue-100 dark:hover:bg-surface-dark"
                    title="Editar tarea"
                  >
                    <span class="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                }
                <!-- Delete Button -->
                <button 
                  (click)="confirmDelete(task, $event)" 
                  class="text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Eliminar tarea"
                >
                  <span class="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>

            </div>
            <div class="absolute bottom-0 left-4 right-4 h-px bg-blue-100 dark:bg-slate-800"></div>
          </div>
        } @empty {
          <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div class="bg-blue-50 dark:bg-slate-800/50 p-6 rounded-full mb-4">
              <span class="material-symbols-outlined text-4xl text-primary/50">{{ getEmptyStateIcon() }}</span>
            </div>
            <p class="text-slate-600 dark:text-slate-400 font-medium">{{ getEmptyStateMessage() }}</p>
            <p class="text-slate-400 text-sm mt-1">{{ getEmptyStateSubtext() }}</p>
          </div>
        }
      </main>

      <!-- FAB (Mobile) -->
      <div class="fixed bottom-6 right-6 lg:hidden z-40">
        <button (click)="openCreateModal()" class="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-blue-900/40 hover:scale-105 active:scale-95 transition-transform">
          <span class="material-symbols-outlined text-[28px]">add</span>
        </button>
      </div>
    </div>

    <!-- Create Task Modal -->
    @if (isCreatingTask()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" (click)="closeCreateModal()">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md modal-content" (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-blue-100 dark:border-slate-800">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">add_circle</span>
              Nueva Tarea
            </h3>
            <button (click)="closeCreateModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="px-6 py-4">
            <label class="flex flex-col gap-2">
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">¿Qué necesitas hacer?</span>
              <div class="flex flex-col">
                <textarea
                  [formControl]="createTaskControl"
                  class="w-full px-4 py-3 rounded-lg border-2 transition-colors bg-white dark:bg-background-dark text-slate-900 dark:text-white resize-none"
                  [class.border-blue-200]="createTaskControl.valid || !createTaskControl.touched"
                  [class.dark:border-slate-700]="createTaskControl.valid || !createTaskControl.touched"
                  [class.border-red-500]="createTaskControl.invalid && createTaskControl.touched"
                  [class.focus:border-primary]="createTaskControl.valid"
                  placeholder="Escribe tu tarea aquí..."
                  rows="3"
                  (keydown.enter)="$event.preventDefault(); saveNewTask()"
                ></textarea>
                @if (createTaskControl.invalid && createTaskControl.touched) {
                  <span class="text-red-500 text-xs mt-1">{{ getCreateValidationError() }}</span>
                }
              </div>
            </label>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
              💡 Presiona Enter para crear rápidamente
            </p>
          </div>

          <!-- Modal Footer -->
          <div class="flex gap-3 px-6 py-4 border-t border-blue-100 dark:border-slate-800">
            <button 
              (click)="closeCreateModal()"
              class="flex-1 px-4 py-2 rounded-lg border-2 border-blue-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button 
              (click)="saveNewTask()"
              [disabled]="createTaskControl.invalid"
              class="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-[20px]">add</span>
              Crear
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Edit Modal -->
    @if (editingTask()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" (click)="closeEditModal()">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md modal-content" (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-blue-100 dark:border-slate-800">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">edit</span>
              Editar Tarea
            </h3>
            <button (click)="closeEditModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="px-6 py-4">
            <label class="flex flex-col gap-2">
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Título de la tarea</span>
              <div class="flex flex-col">
                <input 
                  [formControl]="editTaskControl"
                  class="w-full px-4 py-3 rounded-lg border-2 transition-colors bg-white dark:bg-background-dark text-slate-900 dark:text-white"
                  [class.border-blue-200]="editTaskControl.valid || !editTaskControl.touched"
                  [class.dark:border-slate-700]="editTaskControl.valid || !editTaskControl.touched"
                  [class.border-red-500]="editTaskControl.invalid && editTaskControl.touched"
                  [class.focus:border-primary]="editTaskControl.valid"
                  placeholder="Nueva descripción de la tarea"
                  (keydown.enter)="saveEdit()"
                />
                @if (editTaskControl.invalid && editTaskControl.touched) {
                  <span class="text-red-500 text-xs mt-1">{{ getEditValidationError() }}</span>
                }
              </div>
            </label>
          </div>

          <!-- Modal Footer -->
          <div class="flex gap-3 px-6 py-4 border-t border-blue-100 dark:border-slate-800">
            <button 
              (click)="closeEditModal()"
              class="flex-1 px-4 py-2 rounded-lg border-2 border-blue-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button 
              (click)="saveEdit()"
              [disabled]="editTaskControl.invalid"
              class="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-blue-900/20"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (deletingTask()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" (click)="cancelDelete()">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md modal-content" (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-blue-100 dark:border-slate-800">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-red-500">warning</span>
              Confirmar Eliminación
            </h3>
            <button (click)="cancelDelete()" class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="px-6 py-4">
            <p class="text-slate-600 dark:text-slate-400">
              ¿Estás seguro de que deseas eliminar la tarea <strong class="text-slate-900 dark:text-white">"{{ deletingTask()?.title }}"</strong>?
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-500 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>

          <!-- Modal Footer -->
          <div class="flex gap-3 px-6 py-4 border-t border-blue-100 dark:border-slate-800">
            <button 
              (click)="cancelDelete()"
              class="flex-1 px-4 py-2 rounded-lg border-2 border-blue-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button 
              (click)="executeDelete()"
              class="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-md shadow-red-900/20"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class TaskListComponent {
  store = inject(StoreService);
  themeService = inject(ThemeService);
  goToProfile = output<void>();

  // Form controls with validation
  newTaskControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(100),
    this.noWhitespaceValidator
  ]);

  createTaskControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(100),
    this.noWhitespaceValidator
  ]);

  editTaskControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(100),
    this.noWhitespaceValidator
  ]);

  filter = signal<'all' | 'pending' | 'completed'>('all');
  editingTask = signal<Task | null>(null);
  deletingTask = signal<Task | null>(null);
  isCreatingTask = signal<boolean>(false);

  filteredTasks = computed(() => {
    const all = this.store.tasks();
    const filter = this.filter();
    if (filter === 'pending') return all.filter(t => !t.completed);
    if (filter === 'completed') return all.filter(t => t.completed);
    return all;
  });

  // Custom validator for whitespace
  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    return !isWhitespace ? null : { whitespace: true };
  }

  addTask() {
    this.newTaskControl.markAsTouched();
    if (this.newTaskControl.valid) {
      const val = this.newTaskControl.value?.trim();
      if (val) {
        this.store.addTask(val);
        this.newTaskControl.reset();
      }
    } else {
      this.store.showNotification(this.getValidationError(), 'error');
    }
  }

  toggleTask(id: string) {
    this.store.toggleTask(id);
  }

  openCreateModal() {
    this.isCreatingTask.set(true);
    this.createTaskControl.reset();
    this.createTaskControl.markAsUntouched();
  }

  closeCreateModal() {
    this.isCreatingTask.set(false);
    this.createTaskControl.reset();
  }

  saveNewTask() {
    this.createTaskControl.markAsTouched();
    if (this.createTaskControl.valid) {
      const val = this.createTaskControl.value?.trim();
      if (val) {
        this.store.addTask(val);
        this.closeCreateModal();
      }
    } else {
      this.store.showNotification(this.getCreateValidationError(), 'error');
    }
  }

  openEditModal(task: Task, event: Event) {
    event.stopPropagation();
    this.editingTask.set(task);
    this.editTaskControl.setValue(task.title);
    this.editTaskControl.markAsUntouched();
  }

  closeEditModal() {
    this.editingTask.set(null);
    this.editTaskControl.reset();
  }

  saveEdit() {
    this.editTaskControl.markAsTouched();
    if (this.editTaskControl.valid && this.editingTask()) {
      const val = this.editTaskControl.value?.trim();
      if (val) {
        this.store.editTask(this.editingTask()!.id, val);
        this.closeEditModal();
      }
    } else {
      this.store.showNotification(this.getEditValidationError(), 'error');
    }
  }

  confirmDelete(task: Task, event: Event) {
    event.stopPropagation();
    this.deletingTask.set(task);
  }

  cancelDelete() {
    this.deletingTask.set(null);
  }

  executeDelete() {
    if (this.deletingTask()) {
      this.store.deleteTask(this.deletingTask()!.id);
      this.deletingTask.set(null);
    }
  }

  setFilter(f: 'all' | 'pending' | 'completed') {
    this.filter.set(f);
  }

  focusInput() {
    const input = document.querySelector('input') as HTMLInputElement;
    if (input) input.focus();
  }

  // Validation error messages
  getValidationError(): string {
    if (this.newTaskControl.hasError('required') || this.newTaskControl.hasError('whitespace')) {
      return 'La tarea no puede estar vacía';
    }
    if (this.newTaskControl.hasError('minlength')) {
      return 'La tarea debe tener al menos 3 caracteres';
    }
    if (this.newTaskControl.hasError('maxlength')) {
      return 'La tarea no puede tener más de 100 caracteres';
    }
    return 'Error de validación';
  }

  getCreateValidationError(): string {
    if (this.createTaskControl.hasError('required') || this.createTaskControl.hasError('whitespace')) {
      return 'La tarea no puede estar vacía';
    }
    if (this.createTaskControl.hasError('minlength')) {
      return 'La tarea debe tener al menos 3 caracteres';
    }
    if (this.createTaskControl.hasError('maxlength')) {
      return 'La tarea no puede tener más de 100 caracteres';
    }
    return 'Error de validación';
  }

  getEditValidationError(): string {
    if (this.editTaskControl.hasError('required') || this.editTaskControl.hasError('whitespace')) {
      return 'La tarea no puede estar vacía';
    }
    if (this.editTaskControl.hasError('minlength')) {
      return 'La tarea debe tener al menos 3 caracteres';
    }
    if (this.editTaskControl.hasError('maxlength')) {
      return 'La tarea no puede tener más de 100 caracteres';
    }
    return 'Error de validación';
  }

  // Helper methods for display
  getTotalTasks(): number {
    return this.store.tasks().length;
  }

  getPendingCount(): number {
    return this.store.tasks().filter(t => !t.completed).length;
  }

  getCompletedCount(): number {
    return this.store.tasks().filter(t => t.completed).length;
  }

  getFilterIcon(): string {
    switch (this.filter()) {
      case 'all': return 'calendar_today';
      case 'pending': return 'pending_actions';
      case 'completed': return 'check_circle';
      default: return 'calendar_today';
    }
  }

  getFilterTitle(): string {
    switch (this.filter()) {
      case 'all': return 'Todas tus tareas';
      case 'pending': return 'Tareas pendientes';
      case 'completed': return 'Tareas completadas';
      default: return 'Tus tareas';
    }
  }

  getEmptyStateIcon(): string {
    switch (this.filter()) {
      case 'pending': return 'task_alt';
      case 'completed': return 'celebration';
      default: return 'inbox';
    }
  }

  getEmptyStateMessage(): string {
    switch (this.filter()) {
      case 'pending': return '¡Genial! No tienes tareas pendientes';
      case 'completed': return 'Aún no has completado ninguna tarea';
      default: return 'No hay tareas';
    }
  }

  getEmptyStateSubtext(): string {
    switch (this.filter()) {
      case 'pending': return '¡Sigue así!';
      case 'completed': return '¡Completa tu primera tarea!';
      default: return '¡Añade una nueva tarea para comenzar!';
    }
  }
}