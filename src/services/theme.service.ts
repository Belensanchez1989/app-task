import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly STORAGE_KEY = 'gestor-tareas-theme';

    // Signal for dark mode state
    readonly isDarkMode = signal<boolean>(this.loadTheme());

    constructor() {
        // Apply theme on init
        this.applyTheme(this.isDarkMode());

        // Auto-save and apply theme whenever it changes
        effect(() => {
            const darkMode = this.isDarkMode();
            this.saveTheme(darkMode);
            this.applyTheme(darkMode);
        });
    }

    // Load theme from localStorage
    private loadTheme(): boolean {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored !== null) {
                return stored === 'dark';
            }
            // Default to light mode if nothing stored
            return false;
        } catch (error) {
            console.error('Error loading theme from localStorage:', error);
            return false;
        }
    }

    // Save theme to localStorage
    private saveTheme(isDark: boolean): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, isDark ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme to localStorage:', error);
        }
    }

    // Apply theme to document
    private applyTheme(isDark: boolean): void {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    // Toggle theme
    toggleTheme(): void {
        this.isDarkMode.update(current => !current);
    }
}
