import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize, forkJoin } from 'rxjs';
import { ChallengeService } from './challenge.service';
import { HabitsApiService } from '../habits/habits-api.service';
import { 
  ChallengeDetail, 
  ChallengeGridDate, 
  ChallengeGridHabit, 
  ChallengeGridCell,
  ChallengeGridNote 
} from './models';
import { AllHabitData } from '../habits/models';
import { NoteDialogComponent } from '../shared/ui/note-dialog.component';
import { HabitConfirmationComponent } from './habit-confirmation.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../shared/ui/confirmation-dialog.component';
import { MarkdownModule } from 'ngx-markdown';

// Modular Sub-components
import { ChallengeHeaderComponent } from './components/challenge-header/challenge-header.component';
import { ChallengeDesktopGridComponent } from './components/challenge-desktop-grid/challenge-desktop-grid.component';
import { ChallengeMobileViewComponent } from './components/challenge-mobile-view/challenge-mobile-view.component';
import { ChallengeModifyDialogComponent } from './components/challenge-modify-dialog/challenge-modify-dialog.component';

@Component({
  selector: 'app-challenge-detail-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule, 
    FormsModule, 
    NoteDialogComponent, 
    HabitConfirmationComponent, 
    ConfirmationDialogComponent, 
    MarkdownModule,
    ChallengeHeaderComponent,
    ChallengeDesktopGridComponent,
    ChallengeMobileViewComponent,
    ChallengeModifyDialogComponent
  ],
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

  // Mobile navigation state
  selectedMobileDate: ChallengeGridDate | null = null;
  showMiniMatrix = false;
  animatingHabits = new Map<number, string>();
  isHeaderExpanded = false;
  last7DaysDates: { date: string; label: string }[] = [];
  
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
  
  // Analysis state
  showAnalysisDialog = false;
  analysisResult = '';
  isAnalyzing = false;

  // Retrospective state
  isEditingRetrospective = false;
  retrospectiveText = '';

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
      durationDays: ['', [Validators.required, Validators.min(1)]],
      challengeDescription: ['']
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

    // Initialize or preserve selectedMobileDate for mobile view
    if (this.dates.length > 0) {
      const urlDate = this.route.snapshot.queryParams['date'];
      const matchingUrlDate = urlDate ? this.dates.find(d => d.date === urlDate) : null;
      
      if (matchingUrlDate) {
        this.selectedMobileDate = matchingUrlDate;
      } else {
        const previouslySelectedDate = this.selectedMobileDate ? this.dates.find(d => d.date === this.selectedMobileDate?.date) : null;
        if (previouslySelectedDate) {
          this.selectedMobileDate = previouslySelectedDate;
        } else {
          const todayStr = this.formatDateLocal(new Date());
          const todayDate = this.dates.find(d => d.date === todayStr);
          if (todayDate) {
            this.selectedMobileDate = todayDate;
          } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const firstDate = new Date(this.dates[0].date);
            if (today < firstDate) {
              this.selectedMobileDate = this.dates[0];
            } else {
              this.selectedMobileDate = this.dates[this.dates.length - 1];
            }
          }
        }
      }
    }

    // Pre-calculate last 7 days dates
    this.last7DaysDates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = this.formatDateLocal(d);
      const label = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      this.last7DaysDates.push({ date: dateStr, label });
    }
  }

  formatDateLocal(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  selectMobileDate(date: ChallengeGridDate): void {
    this.selectedMobileDate = date;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { date: date.date },
      queryParamsHandling: 'merge'
    });

    setTimeout(() => {
      const activeEl = document.querySelector('.mobile-date-card.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 50);
  }

  selectPreviousMobileDate(): void {
    if (!this.selectedMobileDate || this.dates.length === 0) return;
    const currentIndex = this.dates.findIndex(d => d.date === this.selectedMobileDate?.date);
    if (currentIndex > 0) {
      this.selectMobileDate(this.dates[currentIndex - 1]);
    }
  }

  selectNextMobileDate(): void {
    if (!this.selectedMobileDate || this.dates.length === 0) return;
    const currentIndex = this.dates.findIndex(d => d.date === this.selectedMobileDate?.date);
    if (currentIndex < this.dates.length - 1) {
      this.selectMobileDate(this.dates[currentIndex + 1]);
    }
  }

  toggleMobileHabit(event: { habitId: number; performed: boolean }): void {
    const { habitId, performed } = event;
    if (!this.selectedMobileDate) return;
    
    const cellDate = new Date(this.selectedMobileDate.date);
    cellDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (cellDate > today) return;

    const targetState = performed ? 'completed' : 'missed';
    this.animatingHabits.set(habitId, targetState);

    setTimeout(() => {
      const key = `${habitId}|${this.selectedMobileDate!.date}`;
      const cell = this.cells.get(key);
      
      if (!cell || cell.performed !== performed) {
        this.toggleHabitEntry(habitId, this.selectedMobileDate!.date, performed);
      }
      this.animatingHabits.delete(habitId);
    }, 280);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.showMiniMatrix && !target.closest('.history-popup-container')) {
      this.showMiniMatrix = false;
    }
  }

  toggleHeaderExpansion(): void {
    this.isHeaderExpanded = !this.isHeaderExpanded;
  }

  toggleMiniMatrix(): void {
    this.showMiniMatrix = !this.showMiniMatrix;
  }

  closeMiniMatrix(): void {
    this.showMiniMatrix = false;
  }

  private loadExistingNotes(): void {
    if (!this.challenge) return;

    this.challengeService.getNotes(this.challenge.challengeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notes) => {
          this.notes.clear();
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
        }
      });
  }

  private generateDateRange(startDate: string, endDate: string): ChallengeGridDate[] {
    const dates: ChallengeGridDate[] = [];
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const effectiveEnd = end < today ? end : today;

    for (let d = new Date(start); d <= effectiveEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = this.formatDateLocal(d);
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

  onHabitCellClick(event: { habitId: number; date: string }): void {
    const { habitId, date } = event;
    const cellDate = new Date(date);
    cellDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (cellDate > today) return;

    const key = `${habitId}|${date}`;
    const cell = this.cells.get(key);
    
    if (!cell || cell.performed === null) {
      this.showHabitConfirmationDialog(habitId, date);
      return;
    }

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
    
    if (!habit) return;

    const newCell: ChallengeGridCell = {
      habitId,
      date,
      performed,
      entryId: existingCell?.entryId,
      notes: existingCell?.notes
    };
    this.cells.set(key, newCell);

    this.challengeService.saveHabitEntry(this.challenge!.challengeId, habitId, date, performed, habit.habitName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.entryId) {
            newCell.entryId = response.entryId;
            this.cells.set(key, newCell);
          }
        },
        error: (error) => {
          console.error('Failed to save habit entry:', error);
          if (existingCell) {
            this.cells.set(key, existingCell);
          } else {
            this.cells.delete(key);
          }
        }
      });
  }

  onNotesCellClick(date: string): void {
    this.selectedNoteDate = date;
    this.selectedNoteText = this.notes.get(date)?.noteText || '';
    this.showNoteDialog = true;
  }

  onNoteDialogClose(): void {
    this.showNoteDialog = false;
    this.selectedNoteDate = '';
    this.selectedNoteText = '';
  }

  onNoteDialogSave(event: {date: string, noteText: string}): void {
    const note: ChallengeGridNote = {
      date: event.date,
      noteText: event.noteText,
      hasNote: event.noteText.trim().length > 0
    };
    this.notes.set(event.date, note);

    this.challengeService.saveNote(this.challenge!.challengeId, event.date, event.noteText)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const updatedNote: ChallengeGridNote = {
            date: response.noteDate,
            noteText: response.noteText,
            hasNote: response.noteText.trim().length > 0
          };
          this.notes.set(response.noteDate, updatedNote);
        },
        error: (error) => {
          console.error('Failed to save note:', error);
          this.notes.delete(event.date);
        }
      });

    this.onNoteDialogClose();
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
          const challengeHabitIds = this.challenge?.habitsInfo?.map(h => h.habitId) || [];
          this.availableHabits = habits.filter(habit => !challengeHabitIds.includes(habit.habitId));
        },
        error: (error) => {
          console.error('Error loading available habits:', error);
          this.error = 'Failed to load available habits';
        }
      });
  }

  toggleHabitSelection(event: { habitId: number; event: Event }): void {
    const target = event.event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedHabitIds.push(event.habitId);
    } else {
      this.selectedHabitIds = this.selectedHabitIds.filter(id => id !== event.habitId);
    }
  }

  removeHabit(event: { habitId: number; habitName: string }): void {
    if (!this.challenge) return;

    this.pendingHabitRemoval = event;

    this.confirmationDialogData = {
      title: 'Remove Habit',
      message: `Are you sure you want to remove "${event.habitName}" from this challenge? This action cannot be undone.`,
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
        durationDays: this.challenge.durationDays,
        challengeDescription: this.challenge.challengeDescription || ''
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

    this.challengeService.updateChallenge(challengeId, formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.selectedHabitIds.length > 0) {
            this.addSelectedHabitsToChallenge(challengeId);
          } else {
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
    const addHabitObservables = this.selectedHabitIds.map(habitId => {
      const habit = this.availableHabits.find(h => h.habitId === habitId);
      const habitName = habit?.name || 'Unknown Habit';
      const challengeName = this.challenge?.name || 'Challenge';
      return this.challengeService.addHabit(challengeId, habitId, habitName, challengeName);
    });

    forkJoin(addHabitObservables)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadChallenge();
          this.closeHabitSelectionDialog();
          this.isUpdatingChallenge = false;
        },
        error: (error) => {
          console.error('Error adding habits to challenge:', error);
          this.error = 'Failed to add some habits to challenge';
          this.loadChallenge();
          this.closeHabitSelectionDialog();
          this.isUpdatingChallenge = false;
        }
      });
  }

  analyzeChallenge(): void {
    if (!this.challenge) return;

    this.isAnalyzing = true;
    const progress = this.getCompletionProgress();
    const daysRemaining = progress.total - progress.completed;
    
    const habitStrings = this.challenge.habitsInfo.map(habit => {
      const performedCount = habit.habitEntries.filter(e => e.performed).length;
      return `Habit name: ${habit.habitName}, Number of times habit was done: ${performedCount}`;
    });

    const notesStrings: string[] = [];
    this.notes.forEach((note, date) => {
      if (note.hasNote) {
        notesStrings.push(`Date: ${date}, Note: ${note.noteText}`);
      }
    });

    const query = "Please analyze the my challenge details for me." + 
    `Days remaining: ${daysRemaining} 
     Days elapsed: ${progress.completed} ${habitStrings.join(' ')}
     Additional notes by user for the challenge days: ${notesStrings.join('\n')}`;

    this.challengeService.analyzeChallenge(query, this.challenge.challengeId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isAnalyzing = false)
      )
      .subscribe({
        next: (response) => {
          this.analysisResult = response.response;
          this.showAnalysisDialog = true;
        },
        error: (error) => {
          console.error('Analysis failed:', error);
        }
      });
  }

  closeAnalysisDialog(): void {
    this.showAnalysisDialog = false;
    this.analysisResult = '';
  }

  startEditingRetrospective(): void {
    if (this.challenge) {
      this.retrospectiveText = this.challenge.retrospective || '';
      this.isEditingRetrospective = true;
    }
  }

  cancelEditingRetrospective(): void {
    this.isEditingRetrospective = false;
    this.retrospectiveText = '';
  }

  saveRetrospective(): void {
    if (!this.challenge) return;
    
    this.challengeService.update(this.challenge.challengeId, { retrospective: this.retrospectiveText })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.challenge) {
            this.challenge.retrospective = this.retrospectiveText;
          }
          this.isEditingRetrospective = false;
        },
        error: (error) => {
          console.error('Failed to save retrospective:', error);
        }
      });
  }
}
