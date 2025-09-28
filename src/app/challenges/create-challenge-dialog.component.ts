import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { CreateChallengeData } from './models';
import { HabitsApiService } from '../habits/habits-api.service';
import { AllHabitData, CreateHabitDto } from '../habits/models';

@Component({
  selector: 'app-create-challenge-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-challenge-dialog.component.html',
  styleUrls: ['./create-challenge-dialog.component.scss']
})
export class CreateChallengeDialogComponent implements OnInit, OnDestroy {
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<CreateChallengeData>();

  challengeForm: FormGroup;
  availableHabits: AllHabitData[] = [];
  isCreating: boolean = false;
  showCreateHabit: boolean = false;
  isCreatingHabit: boolean = false;
  newlyCreatedHabitIds: number[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private habitsApiService: HabitsApiService
  ) {
    this.challengeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      startDate: ['', Validators.required],
      durationDays: [30, [Validators.required, Validators.min(1), Validators.max(365)]],
      habitIds: [[], [Validators.required, Validators.minLength(1)]],
      newHabitName: [''],
      newHabitDescription: ['']
    });
  }

  ngOnInit(): void {
    this.loadHabits();
    this.setDefaultStartDate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadHabits(): void {
    this.habitsApiService.getHabits()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (habits) => {
          this.availableHabits = habits;
        },
        error: (error) => {
          console.error('Failed to load habits:', error);
        }
      });
  }

  private setDefaultStartDate(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    this.challengeForm.patchValue({ startDate: dateString });
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget && !this.isCreating) {
      this.onClose();
    }
  }

  onClose(): void {
    if (!this.isCreating) {
      this.close.emit();
    }
  }

  onSubmit(): void {
    if (this.challengeForm.valid && !this.isCreating) {
      const formValue = this.challengeForm.value;
      const challengeData: CreateChallengeData = {
        name: formValue.name,
        habitIds: formValue.habitIds,
        startDate: formValue.startDate,
        durationDays: formValue.durationDays
      };
      
      this.create.emit(challengeData);
    }
  }

  toggleHabitSelection(habitId: number): void {
    const currentHabitIds = this.challengeForm.get('habitIds')?.value || [];
    const index = currentHabitIds.indexOf(habitId);
    
    if (index > -1) {
      currentHabitIds.splice(index, 1);
    } else {
      currentHabitIds.push(habitId);
    }
    
    this.challengeForm.patchValue({ habitIds: currentHabitIds });
    this.challengeForm.get('habitIds')?.markAsTouched();
  }

  isHabitSelected(habitId: number): boolean {
    const currentHabitIds = this.challengeForm.get('habitIds')?.value || [];
    return currentHabitIds.includes(habitId);
  }

  getSelectedHabitsText(): string {
    const selectedHabitIds = this.challengeForm.get('habitIds')?.value || [];
    const selectedHabits = this.availableHabits.filter(habit => 
      selectedHabitIds.includes(habit.habitId)
    );
    return selectedHabits.map(habit => habit.name).join(', ') || 'None selected';
  }

  getEndDate(): string {
    const startDate = this.challengeForm.get('startDate')?.value;
    const durationDays = this.challengeForm.get('durationDays')?.value;
    
    if (startDate && durationDays) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + durationDays - 1);
      return end.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    return '';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  trackByHabitId(index: number, habit: AllHabitData): number {
    return habit.habitId;
  }

  setCreatingState(creating: boolean): void {
    this.isCreating = creating;
  }

  toggleCreateHabit(): void {
    this.showCreateHabit = !this.showCreateHabit;
    if (!this.showCreateHabit) {
      this.cancelCreateHabit();
    }
  }

  createNewHabit(): void {
    const newHabitName = this.challengeForm.get('newHabitName')?.value;
    if (!newHabitName || newHabitName.trim() === '' || this.isCreatingHabit) {
      return;
    }

    this.isCreatingHabit = true;
    const habitData: CreateHabitDto = {
      habitName: this.challengeForm.get('newHabitName')?.value,
      description: this.challengeForm.get('newHabitDescription')?.value || undefined
    };

    this.habitsApiService.createHabit(habitData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isCreatingHabit = false)
      )
      .subscribe({
        next: (createdHabit) => {
          console.log('Habit created successfully:', createdHabit);
          
          // Add to available habits list
          const newHabit: AllHabitData = {
            habitId: createdHabit.habitId,
            name: createdHabit.name,
            description: createdHabit.description,
            createdAt: createdHabit.createdAt
          };
          
          this.availableHabits.push(newHabit);
          this.newlyCreatedHabitIds.push(createdHabit.habitId);
          
          // Auto-select the newly created habit
          const currentHabitIds = this.challengeForm.get('habitIds')?.value || [];
          currentHabitIds.push(createdHabit.habitId);
          this.challengeForm.patchValue({ habitIds: currentHabitIds });
          
          // Reset form and hide create habit section
          this.challengeForm.patchValue({ 
            newHabitName: '', 
            newHabitDescription: '' 
          });
          this.showCreateHabit = false;
        },
        error: (error) => {
          console.error('Failed to create habit:', error);
          // TODO: Show error toast
        }
      });
  }

  cancelCreateHabit(): void {
    this.showCreateHabit = false;
    this.challengeForm.patchValue({ 
      newHabitName: '', 
      newHabitDescription: '' 
    });
    this.challengeForm.get('newHabitName')?.markAsUntouched();
  }

  isNewlyCreatedHabit(habitId: number): boolean {
    return this.newlyCreatedHabitIds.includes(habitId);
  }
}
