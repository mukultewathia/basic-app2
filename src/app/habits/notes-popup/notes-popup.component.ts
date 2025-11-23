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

  constructor(private notesService: NotesService) { }

  ngOnInit(): void {
    this.loadNote();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['date'] && changes['date'].currentValue !== changes['date'].previousValue) {
      this.loadNote();
    }
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
        // TODO: Show error toast
      }
    });
  }
}
