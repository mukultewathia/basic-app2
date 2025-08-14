import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { HabitListComponent } from './habit-list.component';
import { CalendarMonthComponent } from './calendar-month.component';
import { HabitsStore } from './habits.store';
import { HabitsApiService } from './habits-api.service';
import { CalendarService } from './calendar.service';
import { AppDataService } from '../app_service_data';

@Component({
  selector: 'app-habits-page',
  standalone: true,
  imports: [CommonModule, HabitListComponent, CalendarMonthComponent],
  templateUrl: './habits.page.html',
  styleUrls: ['./habits.page.scss']
})
export class HabitsPageComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  error: string | null = null;
  
  private subscriptions = new Subscription();
  private lastLoadedKey: string = ''; // Cache key to prevent duplicate loads

  constructor(
    private habitsStore: HabitsStore,
    private habitsApiService: HabitsApiService,
    private calendarService: CalendarService,
    private router: Router,
    private appDataService: AppDataService
  ) {}

  ngOnInit(): void {
    this.checkAuthenticationAndLoadData();
  }

  private checkAuthenticationAndLoadData(): void {
    const username = this.appDataService.username;
    
    if (!username) {
      console.warn('No username available, redirecting to login');
      this.router.navigate(['/metrics-app/login']);
      return;
    }

    this.initializeSubscriptions();
    this.loadHabits(username);
  }

  private initializeSubscriptions(): void {
    // Subscribe to loading and error states
    const loadingSubscription = this.habitsStore.loading$.subscribe(loading => {
      this.loading = loading;
    });

    const errorSubscription = this.habitsStore.error$.subscribe(error => {
      this.error = error;
    });

    // Subscribe to changes in selected habits and current month to load entries
    const entriesSubscription = combineLatest([
      this.habitsStore.selectedHabitIds$,
      this.habitsStore.currentYear$,
      this.habitsStore.currentMonth$
    ]).subscribe(([selectedHabitIds, year, month]) => {
      console.log("updated");
      // Only load entries if we have selected habits and the data isn't already loaded
      if (selectedHabitIds.length > 0) {
        this.loadEntriesForMonth(year, month, selectedHabitIds);
      }
    });

    this.subscriptions.add(loadingSubscription);
    this.subscriptions.add(errorSubscription);
    this.subscriptions.add(entriesSubscription);
  }

  private loadHabits(username: string): void {
    this.habitsStore.setLoading(true);
    this.habitsStore.setError(null);

    this.habitsApiService.getHabits(username).subscribe({
      next: (habitsData) => {
        console.log('Habits loaded:', habitsData);
        // Transform AllHabitData[] to Habit[]
        const habits = habitsData.map(habitData => ({
          id: habitData.habitId,
          name: habitData.name,
          description: habitData.description,
          createdAt: habitData.createdAt
        }));
        this.habitsStore.setHabits(habits);
        this.habitsStore.setLoading(false);
      },
      error: (error) => {
        console.error('Error loading habits:', error);
        this.habitsStore.setError('Failed to load habits. Please try again.');
        this.habitsStore.setLoading(false);
        
        // Redirect to login on auth errors
        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/metrics-app/login']);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  maxLoadRetries: number = 50;
  currentLoadRetries: number = 0;

  private loadEntriesForMonth(year: number, month: number, habitIds: number[]): void {
    // Create a cache key to prevent duplicate API calls
    const cacheKey = `${year}-${month}-${habitIds.sort().join(',')}`;
    if (this.lastLoadedKey === cacheKey) {
      return; // Already loaded this data
    }
    
    // Get habit names for the selected habit IDs
    const selectedHabits = habitIds.map(id => {
      const habit = this.habitsStore.getHabitById(id);
      return habit?.name;
    }).filter(name => name !== undefined) as string[];

    if (selectedHabits.length === 0) {
      return;
    }

    if (this.currentLoadRetries >= this.maxLoadRetries) {
      this.habitsStore.setError('Faiiiiled to load entries. Please try again.');
      this.habitsStore.setLoading(false);
      return;
    }

    this.currentLoadRetries++;

    const username = this.appDataService.username;
    if (!username) {
      console.warn('No username available for loading entries');
      return;
    }

    this.habitsApiService.getEntries(username, selectedHabits).subscribe({
      next: (entries) => {
        // Group entries by habit ID
        const entriesByHabitId = new Map<number, any[]>();
        
        habitIds.forEach((habitId: number) => {
          const habit = this.habitsStore.getHabitById(habitId);
          if (habit) {
            const habitEntries = entries
              .filter(entry => entry.habitName === habit.name)
              .map(entry => ({
                id: entry.entryId,
                habitId: entry.habitId,
                habitName: entry.habitName,
                date: entry.entryDate,
                isCompleted: entry.performed,
                notes: entry.notes,
                createdAt: entry.createdAt
              }));
            entriesByHabitId.set(habitId, habitEntries);
          }
        });

        // Update store
        entriesByHabitId.forEach((entries, habitId) => {
          this.habitsStore.setEntries(habitId, entries);
        });
        
        // Update cache key
        this.lastLoadedKey = cacheKey;
      },
      error: (error) => {
        console.error('Failed to load entries:', error);
        // Don't set global error for entries loading, just log it
      }
    });
  }

  clearError(): void {
    this.habitsStore.setError(null);
  }
}
