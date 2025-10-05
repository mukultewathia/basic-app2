import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  icon?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" class="confirmation-overlay" (click)="onOverlayClick($event)">
      <div class="confirmation-dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <div class="dialog-icon" *ngIf="data.icon">{{ data.icon }}</div>
          <h3 class="dialog-title">{{ data.title }}</h3>
        </div>
        
        <div class="dialog-body">
          <p class="dialog-message">{{ data.message }}</p>
        </div>
        
        <div class="dialog-footer">
          <button 
            class="btn btn-outline" 
            (click)="onCancel()"
            [disabled]="isLoading">
            {{ data.cancelText || 'Cancel' }}
          </button>
          <button 
            class="btn"
            [class]="data.confirmButtonClass || 'btn-danger'"
            (click)="onConfirm()"
            [disabled]="isLoading">
            <span *ngIf="isLoading" class="loading-spinner"></span>
            {{ data.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
  @Input() isVisible: boolean = false;
  @Input() data: ConfirmationDialogData = {
    title: 'Confirm Action',
    message: 'Are you sure?',
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  };
  @Input() isLoading: boolean = false;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
