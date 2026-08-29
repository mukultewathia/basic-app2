import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from '../models';
import { NotesService } from '../notes.service';

@Component({
  selector: 'app-notes-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isVisible) {
      <div class="notes-overlay" (click)="onOverlayClick($event)">
        <div class="notes-popup" (click)="$event.stopPropagation()">
          <div class="notes-header">
            <h4>Notes for {{ date | date:'MMM d, y' }}</h4>
            <button 
              class="close-button" 
              (click)="onClose()"
              aria-label="Close notes">
              ×
            </button>
          </div>
          
          <div class="notes-content">
            <!-- Add Log Action Trigger & Expandable Section -->
            <div class="add-log-container">
              <button 
                type="button" 
                class="btn btn-add-log" 
                (click)="toggleAddLog()">
                <span>{{ showAddLog ? '➖ Close Log Form' : '➕ Add Log Entry' }}</span>
              </button>

              <div *ngIf="showAddLog" class="add-log-card">
                <div class="log-input-header">
                  <label class="log-time-label">
                    <span>Time:</span>
                    <input type="time" [(ngModel)]="logTime" class="log-time-input">
                  </label>
                </div>
                <textarea
                  [(ngModel)]="logDraft"
                  placeholder="Type your log entry here..."
                  rows="2"
                  class="log-draft-textarea">
                </textarea>
                <div class="log-card-actions">
                  <button 
                    type="button" 
                    class="btn btn-secondary btn-sm" 
                    (click)="toggleAddLog()">
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-primary btn-sm" 
                    (click)="addLogToNote()"
                    [disabled]="!logDraft.trim()">
                    Prepend Log
                  </button>
                </div>
              </div>
            </div>

            <textarea
              [(ngModel)]="noteText"
              placeholder="Add your notes for this day..."
              rows="6"
              class="notes-textarea"
              (keydown.ctrl.enter)="onSave()"
              (keydown.meta.enter)="onSave()">
            </textarea>
          </div>
          
          <div class="notes-actions">
            <button 
              class="btn btn-secondary" 
              (click)="onClose()">
              Cancel
            </button>
            <button 
              class="btn btn-primary" 
              (click)="onSave()"
              [disabled]="isSaving">
              {{ isSaving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['./notes-popup.component.scss']
})
export class NotesPopupComponent implements OnInit, OnChanges {
  @Input() date: string = '';
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ date: string, noteText: string }>();

  noteText: string = '';
  isSaving: boolean = false;
  currentNote: Note | undefined;

  // Add Log feature state
  showAddLog: boolean = false;
  logTime: string = '';
  logDraft: string = '';

  constructor(private notesService: NotesService) { }

  ngOnInit(): void {
    this.loadNote();
    this.logTime = this.getCurrentTimeFormatted();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['date'] && changes['date'].currentValue !== changes['date'].previousValue) {
      this.loadNote();
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

  private loadNote(): void {
    this.currentNote = this.notesService.getNote(this.date);
    this.noteText = this.currentNote?.noteText || '';
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
    this.notesService.saveNote(this.date, this.noteText).subscribe({
      next: () => {
        this.isSaving = false;
        this.save.emit({ date: this.date, noteText: this.noteText });
        this.onClose();
      },
      error: (error) => {
        console.error('Failed to save note:', error);
        this.isSaving = false;
      }
    });
  }
}
