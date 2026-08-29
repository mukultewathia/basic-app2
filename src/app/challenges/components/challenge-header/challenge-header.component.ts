import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChallengeDetail, ChallengeGridHabit, ChallengeGridCell } from '../../models';
import { ChallengeHistoryMatrixComponent } from '../challenge-history-matrix/challenge-history-matrix.component';

@Component({
  selector: 'app-challenge-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ChallengeHistoryMatrixComponent],
  templateUrl: './challenge-header.component.html',
  styleUrls: ['./challenge-header.component.scss']
})
export class ChallengeHeaderComponent {
  @Input() challenge: ChallengeDetail | null = null;
  @Input() isHeaderExpanded = false;
  @Input() isAnalyzing = false;
  @Input() showMiniMatrix = false;
  @Input() habits: ChallengeGridHabit[] = [];
  @Input() last7DaysDates: { date: string; label: string }[] = [];
  @Input() cells: Map<string, ChallengeGridCell> = new Map();
  @Input() retrospectiveText = '';
  @Input() isEditingRetrospective = false;

  @Output() toggleHeaderExpansion = new EventEmitter<void>();
  @Output() toggleMiniMatrix = new EventEmitter<void>();
  @Output() closeMiniMatrix = new EventEmitter<void>();
  @Output() modifyChallenge = new EventEmitter<void>();
  @Output() analyzeChallenge = new EventEmitter<void>();
  @Output() startEditingRetrospective = new EventEmitter<void>();
  @Output() cancelEditingRetrospective = new EventEmitter<void>();
  @Output() saveRetrospective = new EventEmitter<void>();
  @Output() retrospectiveTextChange = new EventEmitter<string>();

  onRetrospectiveTextChange(text: string): void {
    this.retrospectiveTextChange.emit(text);
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getCompletionProgress(): { completed: number; total: number; percentage: number } {
    if (!this.challenge) return { completed: 0, total: 0, percentage: 0 };

    const totalDays = this.challenge.durationDays;
    const startDate = new Date(this.challenge.startDate);
    const currentDate = new Date();

    if (startDate > currentDate) {
      return { completed: 0, total: totalDays, percentage: 0 };
    }

    currentDate.setHours(0, 0, 0, 0);
    const endDate = new Date(this.challenge.endDate);
    const actualEndDate = currentDate > endDate ? endDate : currentDate;
    
    const timeDiff = actualEndDate.getTime() - startDate.getTime();
    const daysElapsed = Math.max(1, 1 + Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    const percentage = totalDays > 0 ? Math.round((daysElapsed / totalDays) * 100) : 0;

    return {
      completed: daysElapsed,
      total: totalDays,
      percentage
    };
  }
}
