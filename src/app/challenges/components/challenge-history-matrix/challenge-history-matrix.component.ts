import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeGridHabit, ChallengeGridCell } from '../../models';

@Component({
  selector: 'app-challenge-history-matrix',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './challenge-history-matrix.component.html',
  styleUrls: ['./challenge-history-matrix.component.scss']
})
export class ChallengeHistoryMatrixComponent {
  @Input() isVisible = false;
  @Input() habits: ChallengeGridHabit[] = [];
  @Input() last7DaysDates: { date: string; label: string }[] = [];
  @Input() cells: Map<string, ChallengeGridCell> = new Map();

  @Output() close = new EventEmitter<void>();

  onClose(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.close.emit();
  }

  getCellStatus(habitId: number, date: string): 'completed' | 'missed' | 'unknown' {
    const key = `${habitId}|${date}`;
    const cell = this.cells.get(key);
    
    if (!cell || cell.performed === null) {
      return 'unknown';
    }
    
    return cell.performed ? 'completed' : 'missed';
  }
}
