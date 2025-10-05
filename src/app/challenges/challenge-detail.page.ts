import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize, exhaustMap, forkJoin } from 'rxjs';
import { ChallengeService } from './challenge.service';
import { HabitsApiService } from '../habits/habits-api.service';
import { 
  ChallengeDetail, 
  ChallengeGridDate, 
  ChallengeGridHabit, 
  ChallengeGridCell,
  ChallengeGridNote,
  ChallengeScheduleStatus 
} from './models';
import { AllHabitData } from '../habits/models';
import { StatusIconComponent } from '../shared/ui/status-icon.component';
import { NoteDialogComponent } from '../shared/ui/note-dialog.component';
import { HabitConfirmationComponent } from './habit-confirmation.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../shared/ui/confirmation-dialog.component';

@Component({
  selector: 'app-challenge-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, StatusIconComponent, NoteDialogComponent, HabitConfirmationComponent, ConfirmationDialogComponent],
  templateUrl: './challenge-detail.page.html',
  styleUrls: ['./challenge-detail.page.scss']
})
export class ChallengeDetailPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  challenge: ChallengeDetail | null = null;
  dates: ChallengeGridDate[] = [];
  habits: ChallengeGridHabit[] = [];
  cells: Map<string, ChallengeGridCell> = new Map();
  notes: Map<string, ChallengeGridNote> = new Map();
  
  isLoading = false;
  error: string | null = null;
  
  // Note dialog state
  showNoteDialog = false;
  selectedNoteDate = '';
  selectedNoteText = '';

  // Habit confirmation dialog state
  showHabitConfirmation = false;
  confirmationHabitId = 0;
  confirmationHabitName = '';
  confirmationDate = '';

  // Habit management properties
  showHabitSelectionDialog = false;
  availableHabits: AllHabitData[] = [];
  selectedHabitIds: number[] = [];
  isRemovingHabit = false;
  isHabitsSectionExpanded = false;

  // Challenge update properties
  challengeUpdateForm: FormGroup;
  isUpdatingChallenge = false;

  // Confirmation dialog properties
  showConfirmationDialog = false;
  confirmationDialogData: ConfirmationDialogData = {
    title: 'Confirm Action',
    message: 'Are you sure?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmButtonClass: 'btn-danger',
    icon: '⚠️'
  };
  pendingHabitRemoval: { habitId: number; habitName: string } | null = null;

  constructor(
    private challengeService: ChallengeService,
    private habitsApiService: HabitsApiService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.challengeUpdateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      startDate: ['', [Validators.required]],
      durationDays: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const challengeId = +params['id'];
        if (challengeId) {
          this.loadChallenge();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChallenge(): void {
    const challengeId = +this.route.snapshot.params['id'];
    if (!challengeId || isNaN(challengeId)) {
      this.error = 'Invalid challenge ID';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.challengeService.detail(challengeId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (challenge) => {
          this.challenge = challenge;
          this.buildGridData();
          this.loadExistingNotes();
        },
        error: (error) => {
          console.error('Failed to load challenge:', error);
          this.error = 'Failed to load challenge details. Please try again.';
        }
      });
  }

  private buildGridData(): void {
    if (!this.challenge) return;

    // Build dates array
    this.dates = this.generateDateRange(this.challenge.startDate, this.challenge.endDate);
    
    // Build habits array
    this.habits = this.challenge.habitsInfo.map(habit => ({
      habitId: habit.habitId,
      habitName: habit.habitName,
      habitDescription: habit.habitDescription
    }));

    // Build cells map
    this.cells.clear();
    this.challenge.habitsInfo.forEach(habit => {
      habit.habitEntries.forEach(entry => {
        const key = `${habit.habitId}|${entry.entryDate}`;
        this.cells.set(key, {
          habitId: habit.habitId,
          date: entry.entryDate,
          performed: entry.performed,
          entryId: entry.entryId,
          notes: entry.notes
        });
      });
    });
  }

  private loadExistingNotes(): void {
    if (!this.challenge) return;

    this.challengeService.getNotes(this.challenge.challengeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notes) => {
          // Clear existing notes
          this.notes.clear();
          
          // Populate notes map
          notes.forEach(note => {
            const gridNote: ChallengeGridNote = {
              date: note.noteDate,
              noteText: note.noteText,
              hasNote: note.noteText.trim().length > 0
            };
            this.notes.set(note.noteDate, gridNote);
          });
        },
        error: (error) => {
          console.error('Failed to load existing notes:', error);
          // Don't show error to user as this is not critical functionality
        }
      });
  }

  private generateDateRange(startDate: string, endDate: string): ChallengeGridDate[] {
    const dates: ChallengeGridDate[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const cellDate = new Date(d);
      cellDate.setHours(0, 0, 0, 0);
      
      const isToday = cellDate.getTime() === today.getTime();
      const isPast = cellDate < today;
      const isFuture = cellDate > today;

      dates.push({
        date: dateStr,
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        formattedDate: d.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }),
        isToday,
        isPast,
        isFuture
      });
    }

    return dates;
  }

  onHabitCellClick(habitId: number, date: string): void {
    // Check if date is in the future
    const cellDate = new Date(date);
    cellDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (cellDate > today) {
      // Disable editing for future dates
      return;
    }

    const key = `${habitId}|${date}`;
    const cell = this.cells.get(key);
    
    if (!cell || cell.performed === null) {
      // No entry exists or status is unknown, show confirmation
      this.showHabitConfirmationDialog(habitId, date);
      return;
    }

    // Toggle existing entry
    this.toggleHabitEntry(habitId, date, !cell.performed);
  }

  private showHabitConfirmationDialog(habitId: number, date: string): void {
    const habit = this.habits.find(h => h.habitId === habitId);
    if (!habit) return;

    this.confirmationHabitId = habitId;
    this.confirmationHabitName = habit.habitName;
    this.confirmationDate = date;
    this.showHabitConfirmation = true;
  }

  private toggleHabitEntry(habitId: number, date: string, performed: boolean): void {
    const key = `${habitId}|${date}`;
    const existingCell = this.cells.get(key);
    const habit = this.habits.find(h => h.habitId === habitId);
    
    if (!habit) {
      console.error('Habit not found for ID:', habitId);
      return;
    }

    // Optimistic update
    const newCell: ChallengeGridCell = {
      habitId,
      date,
      performed,
      entryId: existingCell?.entryId,
      notes: existingCell?.notes
    };
    this.cells.set(key, newCell);

    // Call service with real backend API
    this.challengeService.saveHabitEntry(this.challenge!.challengeId, habitId, date, performed, habit.habitName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Update with real entry ID if provided
          if (response.entryId) {
            newCell.entryId = response.entryId;
            this.cells.set(key, newCell);
          }
        },
        error: (error) => {
          console.error('Failed to save habit entry:', error);
          // Revert optimistic update
          if (existingCell) {
            this.cells.set(key, existingCell);
          } else {
            this.cells.delete(key);
          }
          // TODO: Show error toast
        }
      });
  }

  onNotesCellClick(date: string): void {
    this.selectedNoteDate = date;
    this.selectedNoteText = this.getNotesText(date);
    this.showNoteDialog = true;
  }

  onNoteDialogClose(): void {
    this.showNoteDialog = false;
    this.selectedNoteDate = '';
    this.selectedNoteText = '';
  }

  onNoteDialogSave(event: {date: string, noteText: string}): void {
    // Optimistic update
    const note: ChallengeGridNote = {
      date: event.date,
      noteText: event.noteText,
      hasNote: event.noteText.trim().length > 0
    };
    this.notes.set(event.date, note);

    // Call service
    this.challengeService.saveNote(this.challenge!.challengeId, event.date, event.noteText)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Note saved successfully:', response);
          // Update the note with the response data (includes ID, timestamps, etc.)
          const updatedNote: ChallengeGridNote = {
            date: response.noteDate,
            noteText: response.noteText,
            hasNote: response.noteText.trim().length > 0
          };
          this.notes.set(response.noteDate, updatedNote);
        },
        error: (error) => {
          console.error('Failed to save note:', error);
          // Revert optimistic update
          this.notes.delete(event.date);
          // TODO: Show error toast
        }
      });

    this.onNoteDialogClose();
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

  getNotesText(date: string): string {
    return this.notes.get(date)?.noteText || '';
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

  getStatusIcon(status: ChallengeScheduleStatus): 'active' | 'expired' | 'scheduled' | 'deleted' {
    return status;
  }

  getStatusLabel(status: ChallengeScheduleStatus): string {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'scheduled':
        return 'Scheduled';
      case 'deleted':
        return 'Deleted';
      default:
        return 'Unknown';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  trackByDate(index: number, date: ChallengeGridDate): string {
    return date.date;
  }

  trackByHabitId(index: number, habit: ChallengeGridHabit): number {
    return habit.habitId;
  }

  // Habit confirmation dialog methods
  onHabitConfirmationConfirm(): void {
    this.toggleHabitEntry(this.confirmationHabitId, this.confirmationDate, true);
    this.closeHabitConfirmation();
  }

  onHabitConfirmationCancel(): void {
    this.toggleHabitEntry(this.confirmationHabitId, this.confirmationDate, false);
    this.closeHabitConfirmation();
  }

  closeHabitConfirmation(): void {
    this.showHabitConfirmation = false;
    this.confirmationHabitId = 0;
    this.confirmationHabitName = '';
    this.confirmationDate = '';
  }

  // Habit management methods
  toggleHabitsSection(): void {
    this.isHabitsSectionExpanded = !this.isHabitsSectionExpanded;
  }

  closeHabitSelectionDialog(): void {
    this.showHabitSelectionDialog = false;
    this.availableHabits = [];
    this.selectedHabitIds = [];
  }

  loadAvailableHabits(): void {
    this.habitsApiService.getHabits()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (habits) => {
          // Filter out habits that are already in the challenge
          const challengeHabitIds = this.challenge?.habitsInfo?.map(h => h.habitId) || [];
          this.availableHabits = habits.filter(habit => !challengeHabitIds.includes(habit.habitId));
        },
        error: (error) => {
          console.error('Error loading available habits:', error);
          this.error = 'Failed to load available habits';
        }
      });
  }

  toggleHabitSelection(habitId: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedHabitIds.push(habitId);
    } else {
      this.selectedHabitIds = this.selectedHabitIds.filter(id => id !== habitId);
    }
  }

  removeHabit(habitId: number, habitName: string): void {
    if (!this.challenge) return;

    // Store the habit info for later removal
    this.pendingHabitRemoval = { habitId, habitName };

    // Show confirmation dialog
    this.confirmationDialogData = {
      title: 'Remove Habit',
      message: `Are you sure you want to remove "${habitName}" from this challenge? This action cannot be undone.`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-danger',
      icon: '🗑️'
    };
    this.showConfirmationDialog = true;
  }

  onConfirmationDialogConfirm(): void {
    if (!this.pendingHabitRemoval || !this.challenge) return;

    this.showConfirmationDialog = false;
    this.isRemovingHabit = true;
    const challengeId = this.challenge.challengeId;
    const { habitId } = this.pendingHabitRemoval;

    this.challengeService.removeHabit(challengeId, habitId, this.pendingHabitRemoval.habitName, this.challenge.name)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Reload the challenge to get updated data
          this.loadChallenge();
        },
        error: (error) => {
          console.error('Error removing habit from challenge:', error);
          this.error = 'Failed to remove habit from challenge';
        },
        complete: () => {
          this.isRemovingHabit = false;
          this.pendingHabitRemoval = null;
        }
      });
  }

  onConfirmationDialogCancel(): void {
    this.showConfirmationDialog = false;
    this.pendingHabitRemoval = null;
  }

  onConfirmationDialogClose(): void {
    this.showConfirmationDialog = false;
    this.pendingHabitRemoval = null;
  }

  getCurrentHabitsCount(): number {
    return this.challenge?.habitsInfo?.length || 0;
  }

  getCompletionProgress(): { completed: number; total: number; percentage: number } {
    if (!this.challenge) return { completed: 0, total: 0, percentage: 0 };

    const totalDays = this.challenge.durationDays;
    
    // Calculate days elapsed since challenge started (including current day)
    const startDate = new Date(this.challenge.startDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
    
    const endDate = new Date(this.challenge.endDate);
    const actualEndDate = currentDate > endDate ? endDate : currentDate;
    
    const timeDiff = actualEndDate.getTime() - startDate.getTime();
    const daysElapsed = Math.max(1, 1 + Math.ceil(timeDiff / (1000 * 60 * 60 * 24))); // At least 1 day
    
    const percentage = totalDays > 0 ? Math.round((daysElapsed / totalDays) * 100) : 0;

    return {
      completed: daysElapsed,
      total: totalDays,
      percentage: percentage
    };
  }

  showModifyChallengeDialog(): void {
    this.showHabitSelectionDialog = true;
    this.loadAvailableHabits();
    this.initializeChallengeUpdateForm();
  }

  initializeChallengeUpdateForm(): void {
    if (this.challenge) {
      this.challengeUpdateForm.patchValue({
        name: this.challenge.name,
        startDate: this.challenge.startDate,
        durationDays: this.challenge.durationDays
      });
    }
  }

  updateChallenge(): void {
    if (this.challengeUpdateForm.invalid || !this.challenge) {
      return;
    }

    this.isUpdatingChallenge = true;
    const formValue = this.challengeUpdateForm.value;
    const challengeId = this.challenge.challengeId;

    // First, update the challenge details
    this.challengeService.updateChallenge(challengeId, formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // If there are selected habits to add, add them after updating the challenge
          if (this.selectedHabitIds.length > 0) {
            this.addSelectedHabitsToChallenge(challengeId);
          } else {
            // No habits to add, just reload and close
            this.loadChallenge();
            this.closeHabitSelectionDialog();
            this.isUpdatingChallenge = false;
          }
        },
        error: (error) => {
          console.error('Error updating challenge:', error);
          this.error = 'Failed to update challenge';
          this.isUpdatingChallenge = false;
        }
      });
  }

  private addSelectedHabitsToChallenge(challengeId: number): void {
    // Add habits one by one using RxJS operators
    const addHabitObservables = this.selectedHabitIds.map(habitId => {
      const habit = this.availableHabits.find(h => h.habitId === habitId);
      const habitName = habit?.name || 'Unknown Habit';
      const challengeName = this.challenge?.name || 'Challenge';
      return this.challengeService.addHabit(challengeId, habitId, habitName, challengeName);
    });

    // Use forkJoin to wait for all habit additions to complete
    forkJoin(addHabitObservables)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // All habits added successfully, reload challenge and close dialog
          this.loadChallenge();
          this.closeHabitSelectionDialog();
          this.isUpdatingChallenge = false;
        },
        error: (error) => {
          console.error('Error adding habits to challenge:', error);
          this.error = 'Failed to add some habits to challenge';
          // Still reload the challenge to show any successful updates
          this.loadChallenge();
          this.closeHabitSelectionDialog();
          this.isUpdatingChallenge = false;
        }
      });
  }
}
