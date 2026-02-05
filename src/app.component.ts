import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from './components/task-list.component';
import { UserProfileComponent } from './components/user-profile.component';
import { NotificationComponent } from './components/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TaskListComponent, UserProfileComponent, NotificationComponent],
  template: `
    <app-notification />
    @if (currentView() === 'tasks') {
      <app-task-list (goToProfile)="currentView.set('settings')" />
    } @else {
      <app-user-profile (goBack)="currentView.set('tasks')" />
    }
  `
})
export class AppComponent {
  currentView = signal<'tasks' | 'settings'>('tasks');
}