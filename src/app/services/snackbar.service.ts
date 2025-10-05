import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

export interface SnackbarConfig {
  message: string;
  action?: string;
  duration?: number;
  type?: 'success' | 'error' | 'warning' | 'info';
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'end',
    verticalPosition: 'bottom',
    panelClass: ['modern-snackbar']
  };

  constructor(private snackBar: MatSnackBar) {}

  showSuccess(message: string, action?: string, duration?: number): MatSnackBarRef<TextOnlySnackBar> {
    return this.show({
      message,
      action,
      duration: duration || 4000,
      type: 'success',
      icon: '✅'
    });
  }

  showError(message: string, action?: string, duration?: number): MatSnackBarRef<TextOnlySnackBar> {
    return this.show({
      message,
      action,
      duration: duration || 6000,
      type: 'error',
      icon: '❌'
    });
  }

  showWarning(message: string, action?: string, duration?: number): MatSnackBarRef<TextOnlySnackBar> {
    return this.show({
      message,
      action,
      duration: duration || 5000,
      type: 'warning',
      icon: '⚠️'
    });
  }

  showInfo(message: string, action?: string, duration?: number): MatSnackBarRef<TextOnlySnackBar> {
    return this.show({
      message,
      action,
      duration: duration || 4000,
      type: 'info',
      icon: 'ℹ️'
    });
  }

  private show(config: SnackbarConfig): MatSnackBarRef<TextOnlySnackBar> {
    const snackbarConfig: MatSnackBarConfig = {
      ...this.defaultConfig,
      duration: config.duration,
      panelClass: [
        'modern-snackbar',
        `snackbar-${config.type}`,
        config.icon ? 'snackbar-with-icon' : ''
      ],
      data: {
        icon: config.icon,
        type: config.type
      }
    };

    return this.snackBar.open(
      config.message,
      config.action || 'Close',
      snackbarConfig
    );
  }

  // Specific methods for common actions
  showChallengeCreated(challengeName: string): void {
    this.showSuccess(`Challenge "${challengeName}" created successfully!`);
  }

  showChallengeUpdated(challengeName: string): void {
    this.showSuccess(`Challenge "${challengeName}" updated successfully!`);
  }

  showChallengeDeleted(challengeName: string): void {
    this.showInfo(`Challenge "${challengeName}" deleted successfully!`);
  }

  showHabitAdded(habitName: string, challengeName: string): void {
    this.showSuccess(`Habit "${habitName}" added to "${challengeName}"!`);
  }

  showHabitRemoved(habitName: string, challengeName: string): void {
    this.showInfo(`Habit "${habitName}" removed from "${challengeName}"!`);
  }

  showHabitEntrySaved(habitName: string, date: string, performed: boolean): void {
    const status = performed ? 'completed' : 'marked as missed';
    this.showSuccess(`${habitName} ${status} for ${date}!`);
  }

  showNoteSaved(date: string): void {
    this.showSuccess(`Note saved for ${date}!`);
  }

  showHabitCreated(habitName: string): void {
    this.showSuccess(`Habit "${habitName}" created successfully!`);
  }

  showHabitUpdated(habitName: string): void {
    this.showSuccess(`Habit "${habitName}" updated successfully!`);
  }

  showHabitDeleted(habitName: string): void {
    this.showInfo(`Habit "${habitName}" deleted successfully!`);
  }

  showWeightAdded(weight: number, date: string): void {
    this.showSuccess(`Weight ${weight}kg recorded for ${date}!`);
  }

  showApiError(operation: string): void {
    this.showError(`Failed to ${operation}. Please try again.`);
  }

  showNetworkError(): void {
    this.showError('Network error. Please check your connection.', 'Retry', 8000);
  }
}
