import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'movie-app-theme';
  private readonly themeSubject = new BehaviorSubject<AppTheme>('light');

  readonly theme$ = this.themeSubject.asObservable();

  constructor() {
    const storedTheme = this.readStoredTheme();
    this.setTheme(storedTheme, false);
  }

  toggleTheme() {
    this.setTheme(this.themeSubject.value === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: AppTheme, persist = true) {
    this.themeSubject.next(theme);
    const body = this.document.body;
    body.classList.toggle('dark-theme', theme === 'dark');
    body.classList.toggle('light-theme', theme === 'light');

    if (persist) {
      localStorage.setItem(this.storageKey, theme);
    }
  }

  private readStoredTheme(): AppTheme {
    const saved = localStorage.getItem(this.storageKey);
    return saved === 'dark' ? 'dark' : 'light';
  }
}
