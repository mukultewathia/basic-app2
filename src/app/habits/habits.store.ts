import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, distinctUntilChanged, shareReplay, startWith } from 'rxjs';
import { Habit, HabitEntry, CalendarDay } from './models';

/// State which stores the currently selected habits (name and id) and the entries for each habit for the
/// current calendar month.
export interface HabitsState {
  // The habits that are available to the user
  habits: Habit[];
  // Selected habits by id
  selectedHabitIds: number[];
  // Map< habitId, Map<date, HabitEntry> >
  entriesByHabitId: Map<number, Map<string, HabitEntry>>;
  // The current year and month
  currentYear: number;
  currentMonth: number;
  loading: boolean;
  error: string | null;
}

const initialState: HabitsState = {
  habits: [],
  selectedHabitIds: [],
  entriesByHabitId: new Map(),
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  loading: false,
  error: null
};

@Injectable({
  providedIn: 'root'
})
export class HabitsStore {
  private stateSubject = new BehaviorSubject<HabitsState>(initialState);
  public state$ = this.stateSubject.asObservable();

  // Derived observables with memoization and distinctUntilChanged
  public habits$ = this.state$.pipe(
    map(state => state.habits),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    shareReplay(1)
  );
  
  public selectedHabitIds$ = this.state$.pipe(
    map(state => state.selectedHabitIds),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    shareReplay(1)
  );
  
  public selectedHabits$ = this.state$.pipe(
    map(state => state.habits.filter(habit => state.selectedHabitIds.includes(habit.id))),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    shareReplay(1)
  );
  
  public entriesByHabitId$ = this.state$.pipe(
    map(state => state.entriesByHabitId),
  );
  
  public currentYear$ = this.state$.pipe(
    map(state => state.currentYear),
    startWith(initialState.currentYear),
    distinctUntilChanged(),
    shareReplay(1)
  );
  
  public currentMonth$ = this.state$.pipe(
    map(state => state.currentMonth),
    startWith(initialState.currentMonth),
    distinctUntilChanged(),
    shareReplay(1)
  );
  
  public loading$ = this.state$.pipe(
    map(state => state.loading),
    startWith(initialState.loading),
    distinctUntilChanged(),
    shareReplay(1)
  );
  
  public error$ = this.state$.pipe(
    map(state => state.error),
    startWith(initialState.error),
    distinctUntilChanged(),
    shareReplay(1)
  );

  // Helper method to get current state
  private get currentState(): HabitsState {
    return this.stateSubject.value;
  }

  // Helper method to update state
  private updateState(updates: Partial<HabitsState>): void {
    this.stateSubject.next({ ...this.currentState, ...updates });
  }



  // Actions
  setHabits(habits: Habit[]): void {
    this.updateState({ habits });
  }

  addHabit(habit: Habit): void {
    const currentHabits = this.currentState.habits;
    this.updateState({ habits: [...currentHabits, habit] });
  }

  removeHabit(habitId: number): void {
    const currentHabits = this.currentState.habits.filter(h => h.id !== habitId);
    const currentSelectedIds = this.currentState.selectedHabitIds.filter(id => id !== habitId);

    // Remove entries for this habit
    const currentEntries = this.currentState.entriesByHabitId;
    currentEntries.delete(habitId);
    
    this.updateState({ 
      habits: currentHabits, 
      selectedHabitIds: currentSelectedIds,
      entriesByHabitId: new Map(currentEntries)
    });
  }

  selectHabit(habitId: number): void {
    const currentSelectedIds = this.currentState.selectedHabitIds;
    if (currentSelectedIds.length >= 3) {
      return; // Max 3 habits allowed
    }

    if (!currentSelectedIds.includes(habitId)) {
      this.updateState({ 
        selectedHabitIds: [...currentSelectedIds, habitId] 
      });
    }
  }

  deselectHabit(habitId: number): void {
    const currentSelectedIds = this.currentState.selectedHabitIds.filter(id => id !== habitId);
    this.updateState({ selectedHabitIds: currentSelectedIds });
  }

  setEntries(habitId: number, entries: HabitEntry[]): void {
    const currentEntries = new Map(this.currentState.entriesByHabitId);
    const entriesMap = new Map<string, HabitEntry>();
    
    entries.forEach(entry => {
      entriesMap.set(entry.date, entry);
    });
    
    currentEntries.set(habitId, entriesMap);
    this.updateState({ entriesByHabitId: currentEntries });
  }

  updateEntry(habitId: number, entry: HabitEntry): void {
    const currentEntries = new Map(this.currentState.entriesByHabitId);
    const habitEntries = new Map(currentEntries.get(habitId) || []);
    habitEntries.set(entry.date, entry);
    currentEntries.set(habitId, habitEntries);
    console.log("updateEntry", currentEntries);
    this.updateState({ entriesByHabitId: currentEntries });
  }

  removeEntry(habitId: number, date: string): void {
    const currentEntries = new Map(this.currentState.entriesByHabitId);
    const habitEntries = currentEntries.get(habitId);
    if (habitEntries) {
      const updatedHabitEntries = new Map(habitEntries);
      updatedHabitEntries.delete(date);
      currentEntries.set(habitId, updatedHabitEntries);
      this.updateState({ entriesByHabitId: currentEntries });
    }
  }

  setCurrentMonth(year: number, month: number): void {
    this.updateState({ currentYear: year, currentMonth: month });
  }

  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  // Utility methods
  getEntryForDate(habitId: number, date: string): HabitEntry | undefined {
    const habitEntries = this.currentState.entriesByHabitId.get(habitId);
    return habitEntries?.get(date);
  }

  getSelectedHabitsCount(): number {
    return this.currentState.selectedHabitIds.length;
  }

  isHabitSelected(habitId: number): boolean {
    return this.currentState.selectedHabitIds.includes(habitId);
  }

  canSelectMoreHabits(): boolean {
    return this.currentState.selectedHabitIds.length < 3;
  }

  getSelectedHabitIds(): number[] {
    return this.currentState.selectedHabitIds;
  }

  getHabitById(habitId: number): Habit | undefined {
    return this.currentState.habits.find(habit => habit.id === habitId);
  }
}
