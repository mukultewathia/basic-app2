import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-habit-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isVisible) {
      <div class="confirmation-overlay" (click)="onOverlayClick($event)">
        <div class="confirmation-popup" (click)="$event.stopPropagation()">
          <div class="confirmation-header">
            <h4>Habit Entry</h4>
            <button 
              class="close-button" 
              (click)="onClose()"
              aria-label="Close">
              ×
            </button>
          </div>
          
          <div class="confirmation-content">
            <p class="confirmation-message">
              Did you perform <strong>"{{ habitName }}"</strong> on <strong>{{ date | date:'MMM d, y' }}</strong>?
            </p>
          </div>
          
          <div class="confirmation-actions">
            <button 
              class="btn btn-secondary" 
              (click)="onCancel()">
              No
            </button>
            <button 
              class="btn btn-primary" 
              (click)="onConfirm()">
              Yes
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['./habit-confirmation.component.scss']
})
export class HabitConfirmationComponent {
  @Input() isVisible: boolean = false;
  @Input() habitName: string = '';
  @Input() date: string = '';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
