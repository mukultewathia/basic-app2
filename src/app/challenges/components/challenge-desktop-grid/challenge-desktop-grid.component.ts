import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeGridDate, ChallengeGridHabit, ChallengeGridCell, ChallengeGridNote } from '../../models';
import { StatusIconComponent } from '../../../shared/ui/status-icon.component';

@Component({
  selector: 'app-challenge-desktop-grid',
  standalone: true,
  imports: [CommonModule, StatusIconComponent],
  templateUrl: './challenge-desktop-grid.component.html',
  styleUrls: ['./challenge-desktop-grid.component.scss']
})
export class ChallengeDesktopGridComponent {
  @Input() dates: ChallengeGridDate[] = [];
  @Input() habits: ChallengeGridHabit[] = [];
  @Input() cells: Map<string, ChallengeGridCell> = new Map();
  @Input() notes: Map<string, ChallengeGridNote> = new Map();

  @Output() habitCellClick = new EventEmitter<{ habitId: number; date: string }>();
  @Output() notesCellClick = new EventEmitter<string>();

  onHabitClick(habitId: number, date: string): void {
    this.habitCellClick.emit({ habitId, date });
  }

  onNotesClick(date: string): void {
    this.notesCellClick.emit(date);
  }

  getCellStatus(habitId: number, date: string): 'completed' | 'missed' | 'unknown' {
    const key = `${habitId}|${date}`;
    const cell = this.cells.get(key);
    
    if (!cell || cell.performed === null) {
      return 'unknown';
    }
    
    return cell.performed ? 'completed' : 'missed';
  }

  getCellTooltip(habitId: number, date: string): string {
    const habit = this.habits.find(h => h.habitId === habitId);
    const status = this.getCellStatus(habitId, date);
    const statusText = status === 'completed' ? 'Completed' : 
                      status === 'missed' ? 'Missed' : 'Unknown';
    
    return `${habit?.habitName || 'Habit'} - ${statusText}`;
  }

  getNotesPreview(date: string): string {
    const note = this.notes.get(date);
    if (!note || !note.hasNote) {
      return 'Click to add notes';
    }
    return note.noteText;
  }

  getNotesTooltip(date: string): string {
    const note = this.notes.get(date);
    if (!note || !note.hasNote) {
      return 'Add notes for this day';
    }
    return `Edit notes: ${note.noteText}`;
  }

  trackByDate(index: number, date: ChallengeGridDate): string {
    return date.date;
  }

  trackByHabitId(index: number, habit: ChallengeGridHabit): number {
    return habit.habitId;
  }
}
