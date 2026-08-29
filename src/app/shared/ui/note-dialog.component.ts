import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-note-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-dialog.component.html',
  styleUrls: ['./note-dialog.component.scss']
})
export class NoteDialogComponent implements OnInit, OnChanges {
  @Input() date: string = '';
  @Input() isVisible: boolean = false;
  @Input() initialNote: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{date: string, noteText: string}>();

  noteText: string = '';
  isSaving: boolean = false;

  // Add Log feature state
  showAddLog: boolean = false;
  logTime: string = '';
  logDraft: string = '';

  ngOnInit(): void {
    this.noteText = this.initialNote;
    this.logTime = this.getCurrentTimeFormatted();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']?.currentValue === true || changes['initialNote']) {
      this.noteText = this.initialNote;
      this.showAddLog = false;
      this.logDraft = '';
      this.logTime = this.getCurrentTimeFormatted();
    }
  }

  getCurrentTimeFormatted(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  toggleAddLog(): void {
    this.showAddLog = !this.showAddLog;
    if (this.showAddLog && !this.logTime) {
      this.logTime = this.getCurrentTimeFormatted();
    }
  }

  addLogToNote(): void {
    if (!this.logDraft.trim()) return;

    const timestamp = this.formatLogTimestamp(this.date, this.logTime);
    const logEntry = `${timestamp} - ${this.logDraft.trim()}\n\n`;
    this.noteText = logEntry + (this.noteText || '');
    this.logDraft = '';
    this.showAddLog = false;
  }

  formatLogTimestamp(dateStr: string, timeStr: string): string {
    let dateObj = new Date();
    if (dateStr) {
      const parts = dateStr.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
      }
    }

    if (timeStr) {
      const timeParts = timeStr.split(':').map(Number);
      if (timeParts.length >= 2 && !isNaN(timeParts[0]) && !isNaN(timeParts[1])) {
        dateObj.setHours(timeParts[0], timeParts[1], 0, 0);
      }
    }

    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const timeFormatted = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();

    return `[${dayName} | ${timeFormatted}]`;
  }

  formatDate(date: string): string {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    if (this.isSaving) return;
    
    this.isSaving = true;
    setTimeout(() => {
      this.save.emit({ date: this.date, noteText: this.noteText });
      this.isSaving = false;
    }, 300);
  }
}
