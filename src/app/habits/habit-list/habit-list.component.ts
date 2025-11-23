import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Habit, CreateHabitDto } from '../models';
import { HabitsStore, MAX_SELECTED_HABITS } from '../habits.store';
import { HabitsApiService } from '../habits-api.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-habit-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habit-list.component.html',
  styleUrls: ['./habit-list.component.scss']
})
export class HabitListComponent implements OnInit, OnDestroy {
  habits: Habit[] = [];
  selectedHabitIds: number[] = [];
  newHabitName: string = '';
  loading: boolean = false;
  error: string | null = null;
  showAllHabits: boolean = false;
  readonly MAX_SELECTED_HABITS = MAX_SELECTED_HABITS;

  private subscriptions = new Subscription();

  constructor(
    private habitsStore: HabitsStore,
    private habitsApiService: HabitsApiService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Subscribe to store observables
    const habitsSubscription = this.habitsStore.habits$.subscribe(habits => {
      this.habits = habits;
    });

    const selectedSubscription = this.habitsStore.selectedHabitIds$.subscribe(selectedIds => {
      this.selectedHabitIds = selectedIds;
    });

    const loadingSubscription = this.habitsStore.loading$.subscribe(loading => {
      this.loading = loading;
    });

    const errorSubscription = this.habitsStore.error$.subscribe(error => {
      this.error = error;
    });

    this.subscriptions.add(habitsSubscription);
    this.subscriptions.add(selectedSubscription);
    this.subscriptions.add(loadingSubscription);
    this.subscriptions.add(errorSubscription);

    // Load habits on init
    console.log('Loading habits');
    this.checkAuthenticationAndLoadHabits();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  maxLoadRetries: number = 3;
  currentLoadRetries: number = 0;

  private checkAuthenticationAndLoadHabits(): void {
    this.loadHabits();
  }

  loadHabits(): void {
    this.habitsStore.setLoading(true);
    this.habitsStore.setError(null);

    if (this.currentLoadRetries >= this.maxLoadRetries) {
      this.habitsStore.setError('Failed to load habits. Please try again.');
      this.habitsStore.setLoading(false);
      return;
    }

    this.currentLoadRetries++;

    this.habitsApiService.getHabits().subscribe({
      next: (habits) => {
        // Convert AllHabitData to Habit format
        const convertedHabits: Habit[] = habits.map(habit => ({
          id: habit.habitId,
          name: habit.name,
          description: habit.description,
          createdAt: habit.createdAt
        }));
        this.habitsStore.setHabits(convertedHabits);

        this.habitsStore.autoSelectTopHabits();

        this.habitsStore.setLoading(false);
      },
      error: (error) => {
        console.error('Failed to load habits:', error);
        this.habitsStore.setError('Failed to load habits. Please try again.');
        this.habitsStore.setLoading(false);
      }
    });
  }

  createHabit(): void {
    if (!this.newHabitName.trim()) {
      return;
    }

    this.habitsStore.setLoading(true);
    this.habitsStore.setError(null);

    const createHabitDto: CreateHabitDto = {
      habitName: this.newHabitName.trim(),
      description: undefined
    };

    this.habitsApiService.createHabit(createHabitDto).subscribe({
      next: (response) => {
        // Convert response to Habit format and add to store
        const newHabit: Habit = {
          id: response.habitId,
          name: response.name,
          description: response.description,
          createdAt: response.createdAt
        };
        this.habitsStore.addHabit(newHabit);
        this.newHabitName = '';
        this.habitsStore.setLoading(false);
      },
      error: (error) => {
        console.error('Failed to create habit:', error);
        this.habitsStore.setError('Failed to create habit. Please try again.');
        this.habitsStore.setLoading(false);
      }
    });
  }

  deleteHabit(habitId: number): void {
    if (!confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      return;
    }

    this.habitsStore.setLoading(true);
    this.habitsStore.setError(null);

    this.habitsApiService.deleteHabit(habitId).subscribe({
      next: () => {
        // Remove from local state after successful API call
        this.habitsStore.removeHabit(habitId);
        this.habitsStore.setLoading(false);
        console.log('Habit deleted successfully');
      },
      error: (error) => {
        console.error('Failed to delete habit:', error);
        this.habitsStore.setError('Failed to delete habit. Please try again.');
        this.habitsStore.setLoading(false);
      }
    });
  }

  toggleHabitSelection(habitId: number): void {
    if (this.habitsStore.isHabitSelected(habitId)) {
      this.habitsStore.deselectHabit(habitId);
    } else {
      this.habitsStore.selectHabit(habitId);
    }
  }

  isHabitSelected(habitId: number): boolean {
    return this.habitsStore.isHabitSelected(habitId);
  }

  getSelectedCount(): number {
    return this.habitsStore.getSelectedHabitsCount();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.createHabit();
    }
  }

  clearError(): void {
    this.habitsStore.setError(null);
  }

  trackByHabitId(index: number, habit: Habit): number {
    return habit.id;
  }

  canSelectMoreHabits(): boolean {
    return this.habitsStore.getSelectedHabitsCount() < MAX_SELECTED_HABITS;
  }

  getCheckboxTooltip(habitId: number): string {
    if (this.isHabitSelected(habitId)) {
      return 'Click to deselect this habit';
    } else if (this.canSelectMoreHabits()) {
      return 'Click to select this habit for tracking';
    } else {
      return `Maximum ${MAX_SELECTED_HABITS} habits selected. Deselect another habit first.`;
    }
  }

  /**
   * Returns the list of habits to display based on the current view mode.
   * If showAllHabits is true, returns all habits.
   * Otherwise, returns only the selected habits.
   */
  get visibleHabits(): Habit[] {
    if (this.showAllHabits) {
      return this.habits;
    }
    return this.habits.filter(h => this.isHabitSelected(h.id));
  }

  /**
   * Toggles the visibility of non-selected habits.
   * When true, all habits are shown to allow selection.
   * When false, only selected habits are shown for a cleaner view.
   */
  toggleShowAllHabits(): void {
    this.showAllHabits = !this.showAllHabits;
  }
}
