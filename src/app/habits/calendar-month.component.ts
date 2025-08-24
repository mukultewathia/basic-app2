import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { CalendarDay, HabitEntry, CreateHabitEntryDto } from './models';
import { CalendarService } from './calendar.service';
import { HabitsStore } from './habits.store';
import { HabitsApiService } from './habits-api.service';
import { AuthService } from '../auth/auth.service';
import { NotesService } from './notes.service';
import { NotesPopupComponent } from './notes-popup.component';
import { HabitConfirmationComponent } from './habit-confirmation.component';

@Component({
  selector: 'app-calendar-month',
  standalone: true,
  imports: [CommonModule, NotesPopupComponent, HabitConfirmationComponent],
  templateUrl: './calendar-month.component.html',
  styleUrls: ['./calendar-month.component.scss']
})
export class CalendarMonthComponent implements OnInit, OnDestroy {
  calendarDays: CalendarDay[] = [];
  dayNames: string[] = [];
  monthName: string = '';
  year: number = 0;
  month: number = 0;
  
  // Habit selector popover state
  showHabitSelectorPopover: boolean = false;
  habitSelectorDate: string = '';
  habitSelectorHabitIds: number[] = [];
  habitSelectorPosition: { x: number; y: number } = { x: 0, y: 0 };
  habitSelectorShowAbove: boolean = false;
  
  // Notes popup state
  showNotesPopup: boolean = false;
  notesPopupDate: string = '';
  
  // Habit confirmation dialog state
  showHabitConfirmation: boolean = false;
  confirmationHabitId: number = 0;
  confirmationHabitName: string = '';
  confirmationDate: string = '';
  
  private subscriptions = new Subscription();

  constructor(
    public calendarService: CalendarService,
    private habitsStore: HabitsStore,
    private habitsApiService: HabitsApiService,
    private router: Router,
    private authService: AuthService,
    private notesService: NotesService
  ) {}

  ngOnInit(): void {
    this.dayNames = this.calendarService.getDayNames();
    
    // Load notes from backend
    this.notesService.loadNotes().subscribe({
      next: () => {
        console.log('Notes loaded successfully');
      },
      error: (error) => {
        console.error('Failed to load notes:', error);
        // Continue with calendar initialization even if notes fail to load
      }
    });
    
    // Subscribe to state changes with debouncing to prevent excessive updates
    const stateSubscription = combineLatest([
      this.habitsStore.selectedHabitIds$,
      this.habitsStore.entriesByHabitId$,
      this.habitsStore.currentYear$,
      this.habitsStore.currentMonth$
    ]).subscribe(([selectedHabitIds, entriesByHabitId, year, month]) => {
      console.log("state changed");
      // Only update if year or month actually changed
      if (this.year !== year || this.month !== month) {
        this.year = year;
        this.month = month;
        this.monthName = this.calendarService.getMonthName(month);
        
        // Generate calendar days
        this.calendarDays = this.calendarService.generateCalendarDays(year, month);
        console.log("calendarDays 0", this.calendarDays);
      }
      
      // Always populate with entries when they change
      this.calendarDays = this.calendarService.populateCalendarDays(
        this.calendarDays,
        selectedHabitIds,
        entriesByHabitId
      );
      console.log("calendarDays 1", this.calendarDays);
    });

    this.subscriptions.add(stateSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onDayClick(day: CalendarDay, event?: Event): void {
    if (!day.isCurrentMonth || this.calendarService.isFutureDate(day.date)) {
      return;
    }

    const selectedHabitIds = this.habitsStore.getSelectedHabitIds();
    
    if (selectedHabitIds.length === 0) {
      alert('Please select a habit first by checking the checkbox next to it in the left sidebar.');
      return;
    }

    this.showHabitSelector(day.date, selectedHabitIds, event);
  }

  // Toggles the habit entry for a given habit and date. (if not one, creates one with perfomed = true)
  private toggleHabitEntry(habitId: number, date: string): void {
    const currentEntry = this.habitsStore.getEntryForDate(habitId, date);
    
    // If there's an existing entry, just toggle it
    if (currentEntry) {
      const isCompleted = !currentEntry.isCompleted;
      this.createOrUpdateEntry(habitId, date, isCompleted);
      return;
    }
    
    // If no entry exists, show confirmation dialog
    const habit = this.habitsStore.getHabitById(habitId);
    if (!habit) {
      console.error('Habit not found for ID:', habitId);
      return;
    }
    
    this.confirmationHabitId = habitId;
    this.confirmationHabitName = habit.name;
    this.confirmationDate = date;
    this.showHabitConfirmation = true;
  }

  private createOrUpdateEntry(habitId: number, date: string, performed: boolean): void {
    const habit = this.habitsStore.getHabitById(habitId);
    if (!habit) {
      console.error('Habit not found for ID:', habitId);
      return;
    }

    const createEntryDto: CreateHabitEntryDto = {
      habitName: habit.name,
      entryDate: date,
      performed: performed,
      notes: undefined
    };

    this.habitsApiService.createEntry(createEntryDto).subscribe({
      next: (entryResponse) => {
        // Convert response to HabitEntry format
        const entry: HabitEntry = {
          id: entryResponse.entryId,
          habitId: entryResponse.habitId,
          habitName: entryResponse.habitName,
          date: entryResponse.entryDate,
          isCompleted: entryResponse.performed,
          notes: entryResponse.notes,
          createdAt: entryResponse.createdAt
        };
        this.habitsStore.updateEntry(habitId, entry);
      },
      error: (error) => {
        console.error('Failed to create/update habit entry:', error);
      }
    });
  }

  private showHabitSelector(date: string, habitIds: number[], event?: Event): void {
    // Get the clicked element to position the popover
    const clickedElement = event?.target as HTMLElement;
    if (clickedElement) {
      const rect = clickedElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate position with bounds checking
      let x = rect.left + rect.width / 2;
      let y = rect.bottom + 10;
      
      // Ensure popover doesn't go off-screen horizontally
      if (x < 140) x = 140; // min-width/2
      if (x > viewportWidth - 140) x = viewportWidth - 140;
      
      // If popover would go below viewport, show it above the element
      if (y > viewportHeight - 200) {
        y = rect.top - 10;
        this.habitSelectorShowAbove = true;
      } else {
        this.habitSelectorShowAbove = false;
      }
      
      this.habitSelectorPosition = { x, y };
    }
    
    this.habitSelectorDate = date;
    this.habitSelectorHabitIds = habitIds;
    this.showHabitSelectorPopover = true;
  }

  onPreviousMonth(): void {
    const { year, month } = this.calendarService.getPreviousMonth(this.year, this.month);
    this.habitsStore.setCurrentMonth(year, month);
  }

  onNextMonth(): void {
    const { year, month } = this.calendarService.getNextMonth(this.year, this.month);
    this.habitsStore.setCurrentMonth(year, month);
  }


  getHabitIndicatorClass(entry: HabitEntry): string {
    return entry.isCompleted ? 'habit-completed' : 'habit-missed';
  }

  getDayClass(day: CalendarDay): string {
    let classes = ['calendar-day'];
    
    if (!day.isCurrentMonth) {
      classes.push('other-month');
    }
    
    if (day.isToday) {
      classes.push('today');
    }
    
    if (this.calendarService.isFutureDate(day.date)) {
      classes.push('future-date');
    }
    
    return classes.join(' ');
  }

  getTooltipText(day: CalendarDay): string {
    const date = new Date(day.date);
    const dateStr = date.toLocaleDateString();
    
    if (day.entries.length === 0) {
      return `${dateStr} - No habits tracked`;
    }
    
    const entryTexts = day.entries.map(entry => {
      const status = entry.isCompleted ? 'Done' : 'Missed';
      return `${entry.habitId}: ${status}`;
    });
    
    return `${dateStr} - ${entryTexts.join(', ')}`;
  }



  getSelectedHabitsCount(): number {
    return this.habitsStore.getSelectedHabitsCount();
  }

  onHabitSelect(habitId: number): void {
    this.toggleHabitEntry(habitId, this.habitSelectorDate);
    this.closeHabitSelector();
  }

  closeHabitSelector(): void {
    this.showHabitSelectorPopover = false;
    this.habitSelectorDate = '';
    this.habitSelectorHabitIds = [];
    this.habitSelectorShowAbove = false;
  }

  getHabitName(habitId: number): string {
    const habit = this.habitsStore.getHabitById(habitId);
    return habit?.name || `Habit ${habitId}`;
  }

  getHabitStatus(habitId: number, date: string): { isCompleted: boolean; hasEntry: boolean } {
    const entry = this.habitsStore.getEntryForDate(habitId, date);
    return {
      isCompleted: entry?.isCompleted || false,
      hasEntry: !!entry
    };
  }

  // Notes-related methods
  onNotesClick(day: CalendarDay, event: Event): void {
    if (!day.isCurrentMonth || this.calendarService.isFutureDate(day.date)) {
      return;
    }

    event.stopPropagation(); // Prevent triggering day click
    this.showNotesPopup = true;
    this.notesPopupDate = day.date;
  }

  onNotesClose(): void {
    this.showNotesPopup = false;
    this.notesPopupDate = '';
  }

  onNotesSave(data: {date: string, noteText: string}): void {
    // Note is already saved by the notes service
    console.log('Note saved for date:', data.date);
    
    // Refresh notes to ensure UI is up to date
    this.refreshNotes();
  }

  hasNote(date: string): boolean {
    return this.notesService.hasNote(date);
  }

  getNotesTooltip(date: string): string {
    const note = this.notesService.getNote(date);
    if (note) {
      const preview = note.noteText.length > 50 
        ? note.noteText.substring(0, 50) + '...' 
        : note.noteText;
      return `Edit notes: ${preview}`;
    }
    return 'Add notes';
  }

  private refreshNotes(): void {
    this.notesService.loadNotes().subscribe({
      next: () => {
        console.log('Notes refreshed successfully');
      },
      error: (error) => {
        console.error('Failed to refresh notes:', error);
      }
    });
  }

  // Habit confirmation dialog methods
  onHabitConfirmationConfirm(): void {
    this.createOrUpdateEntry(this.confirmationHabitId, this.confirmationDate, true);
    this.closeHabitConfirmation();
  }

  onHabitConfirmationCancel(): void {
    // Create an entry with performed: false when user clicks Cancel
    this.createOrUpdateEntry(this.confirmationHabitId, this.confirmationDate, false);
    this.closeHabitConfirmation();
  }

  closeHabitConfirmation(): void {
    this.showHabitConfirmation = false;
    this.confirmationHabitId = 0;
    this.confirmationHabitName = '';
    this.confirmationDate = '';
  }
}
