import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (store.notification(); as notification) {
      <div class="fixed top-20 right-4 z-50 animate-slide-in">
        <div 
          class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-sm min-w-[300px] max-w-[400px]"
          [class]="getNotificationClasses(notification.type)"
        >
          <span class="material-symbols-outlined text-xl shrink-0">
            {{ getIcon(notification.type) }}
          </span>
          <p class="text-sm font-medium flex-1">{{ notification.message }}</p>
          <button 
            (click)="store.clearNotification()" 
            class="shrink-0 hover:opacity-70 transition-opacity"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class NotificationComponent {
  store = inject(StoreService);

  getNotificationClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'notifications';
    }
  }
}
