import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <!-- Header -->
      <header class="sticky top-0 z-50 flex items-center px-4 py-3 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-blue-100 dark:border-slate-800">
        <button (click)="goBack.emit()" class="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-blue-100 dark:hover:bg-surface-dark transition-colors text-slate-900 dark:text-white">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 class="flex-1 text-lg font-bold leading-tight tracking-tight text-center pr-10">Ajustes</h2>
      </header>

      <main class="flex-1 px-6 py-8 flex flex-col items-center max-w-lg mx-auto w-full">
        
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Perfil de Usuario</h1>
          <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm">Actualiza tu información personal</p>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="w-full space-y-6">
          
          <!-- Name Input -->
          <div class="space-y-2">
            <label for="name" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
            <input 
              id="name" 
              type="text" 
              formControlName="name"
              class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark px-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <!-- Surname Input -->
          <div class="space-y-2">
            <label for="surname" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Apellidos</label>
            <input 
              id="surname" 
              type="text" 
              formControlName="surname"
              class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark px-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <!-- Image URL Input -->
          <div class="space-y-2">
            <label for="avatarUrl" class="block text-sm font-medium text-slate-700 dark:text-slate-300">URL de Imagen de Perfil</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">link</span>
              <input 
                id="avatarUrl" 
                type="text" 
                formControlName="avatarUrl"
                class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400 truncate"
              />
            </div>
          </div>

          <!-- Avatar Preview -->
          <div class="flex justify-center py-4">
            <div class="relative">
              <div class="size-32 rounded-full ring-4 ring-white dark:ring-surface-dark shadow-xl overflow-hidden bg-slate-100">
                <img [src]="profileForm.get('avatarUrl')?.value" alt="Profile" class="w-full h-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=User'"/>
              </div>
              <button type="button" class="absolute bottom-1 right-1 bg-primary text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center border-4 border-background-light dark:border-background-dark">
                <span class="material-symbols-outlined text-[20px]">edit</span>
              </button>
            </div>
          </div>

          <!-- Save Button -->
          <button 
            type="submit" 
            [disabled]="!profileForm.valid"
            class="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            Guardar Cambios
          </button>
        </form>

        <div class="w-full h-px bg-slate-200 dark:bg-slate-800 my-8"></div>

        <!-- Settings List -->
        <div class="w-full space-y-1">
          <button class="w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-colors group">
            <span class="font-medium text-slate-900 dark:text-white">Notificaciones</span>
            <span class="material-symbols-outlined text-slate-400 group-hover:text-primary">chevron_right</span>
          </button>
          <button class="w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-colors group">
            <span class="font-medium text-slate-900 dark:text-white">Privacidad y Seguridad</span>
            <span class="material-symbols-outlined text-slate-400 group-hover:text-primary">chevron_right</span>
          </button>
          <button class="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group mt-4">
            <span class="font-medium text-red-500">Cerrar Sesión</span>
            <span class="material-symbols-outlined text-red-400 group-hover:text-red-500">logout</span>
          </button>
        </div>

      </main>
    </div>
  `
})
export class UserProfileComponent {
  store = inject(StoreService);
  fb = inject(FormBuilder);
  goBack = output<void>();

  profileForm = this.fb.group({
    name: ['', Validators.required],
    surname: ['', Validators.required],
    avatarUrl: ['', Validators.required]
  });

  constructor() {
    const u = this.store.user();
    this.profileForm.patchValue({
      name: u.name,
      surname: u.surname,
      avatarUrl: u.avatarUrl
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.store.updateUser({
        name: this.profileForm.value.name!,
        surname: this.profileForm.value.surname!,
        avatarUrl: this.profileForm.value.avatarUrl!
      });
      this.goBack.emit();
    }
  }
}