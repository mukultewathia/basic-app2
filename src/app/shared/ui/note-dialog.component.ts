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

  ngOnInit(): void {
    this.noteText = this.initialNote;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialNote'] && changes['initialNote'].currentValue !== changes['initialNote'].previousValue) {
      this.noteText = this.initialNote;
    }
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
    // Simulate save delay
    setTimeout(() => {
      this.save.emit({ date: this.date, noteText: this.noteText });
      this.isSaving = false;
    }, 300);
  }
}
