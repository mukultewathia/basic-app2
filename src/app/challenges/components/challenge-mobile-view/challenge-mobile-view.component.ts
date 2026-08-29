import { Component, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeGridDate, ChallengeGridHabit, ChallengeGridCell } from '../../models';

@Component({
  selector: 'app-challenge-mobile-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './challenge-mobile-view.component.html',
  styleUrls: ['./challenge-mobile-view.component.scss']
})
export class ChallengeMobileViewComponent implements AfterViewInit, OnChanges {
  @Input() dates: ChallengeGridDate[] = [];
  @Input() habits: ChallengeGridHabit[] = [];
  @Input() cells: Map<string, ChallengeGridCell> = new Map();
  @Input() selectedMobileDate: ChallengeGridDate | null = null;
  @Input() animatingHabits: Map<number, string> = new Map();
  @Input() notesText = '';

  @Output() selectDate = new EventEmitter<ChallengeGridDate>();
  @Output() selectPreviousDate = new EventEmitter<void>();
  @Output() selectNextDate = new EventEmitter<void>();
  @Output() toggleHabit = new EventEmitter<{ habitId: number; performed: boolean }>();
  @Output() notesClick = new EventEmitter<string>();

  ngAfterViewInit(): void {
    this.scrollToActiveDate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedMobileDate'] || changes['dates']) {
      setTimeout(() => this.scrollToActiveDate(), 50);
    }
  }

  private scrollToActiveDate(): void {
    const activeEl = document.querySelector('.mobile-date-card.active');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  hasPreviousMobileDate(): boolean {
    if (!this.selectedMobileDate || this.dates.length === 0) return false;
    const currentIndex = this.dates.findIndex(d => d.date === this.selectedMobileDate?.date);
    return currentIndex > 0;
  }

  hasNextMobileDate(): boolean {
    if (!this.selectedMobileDate || this.dates.length === 0) return false;
    const currentIndex = this.dates.findIndex(d => d.date === this.selectedMobileDate?.date);
    return currentIndex < this.dates.length - 1;
  }

  getCellStatus(habitId: number, date: string): 'completed' | 'missed' | 'unknown' {
    const key = `${habitId}|${date}`;
    const cell = this.cells.get(key);
    
    if (!cell || cell.performed === null) {
      return 'unknown';
    }
    
    return cell.performed ? 'completed' : 'missed';
  }

  getCompletedHabits(): ChallengeGridHabit[] {
    if (!this.selectedMobileDate) return [];
    return this.habits.filter(h => this.getCellStatus(h.habitId, this.selectedMobileDate!.date) === 'completed');
  }

  getMissedHabits(): ChallengeGridHabit[] {
    if (!this.selectedMobileDate) return [];
    return this.habits.filter(h => this.getCellStatus(h.habitId, this.selectedMobileDate!.date) === 'missed');
  }

  getPendingHabits(): ChallengeGridHabit[] {
    if (!this.selectedMobileDate) return [];
    return this.habits.filter(h => this.getCellStatus(h.habitId, this.selectedMobileDate!.date) === 'unknown');
  }

  getHabitSlideState(habitId: number): string | undefined {
    return this.animatingHabits.get(habitId);
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  trackByHabitId(index: number, habit: ChallengeGridHabit): number {
    return habit.habitId;
  }
}
