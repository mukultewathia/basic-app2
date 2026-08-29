import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChallengeDetail } from '../../models';
import { AllHabitData } from '../../../habits/models';

@Component({
  selector: 'app-challenge-modify-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './challenge-modify-dialog.component.html',
  styleUrls: ['./challenge-modify-dialog.component.scss']
})
export class ChallengeModifyDialogComponent {
  @Input() isVisible = false;
  @Input() challenge: ChallengeDetail | null = null;
  @Input() challengeUpdateForm!: FormGroup;
  @Input() availableHabits: AllHabitData[] = [];
  @Input() isUpdatingChallenge = false;
  @Input() isRemovingHabit = false;

  @Output() close = new EventEmitter<void>();
  @Output() updateChallenge = new EventEmitter<void>();
  @Output() removeHabit = new EventEmitter<{ habitId: number; habitName: string }>();
  @Output() toggleHabitSelection = new EventEmitter<{ habitId: number; event: Event }>();

  getCurrentHabitsCount(): number {
    return this.challenge?.habitsInfo?.length || 0;
  }
}
