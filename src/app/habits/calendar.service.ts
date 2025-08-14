import { Injectable } from '@angular/core';
import { CalendarDay, HabitEntry } from './models';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  
  /**
   * Generate calendar days for a given month
   */
  generateCalendarDays(year: number, month: number): CalendarDay[] {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const today = new Date();
    
    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Calculate the start date of the calendar (including previous month's days)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);
    
    const calendarDays: CalendarDay[] = [];
    
    // Generate 42 days (6 weeks * 7 days) to ensure we cover the entire month
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateString = this.formatDate(currentDate);
      const dayOfMonth = currentDate.getDate();
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = this.isSameDate(currentDate, today);
      
      calendarDays.push({
        date: dateString,
        dayOfMonth,
        isCurrentMonth,
        isToday,
        entries: []
      });
    }
    
    return calendarDays;
  }
  
  /**
   * Populate calendar days with habit entries
   */
  populateCalendarDays(
    calendarDays: CalendarDay[], 
    selectedHabitIds: number[], 
    entriesByHabitId: Map<number, Map<string, HabitEntry>>
  ): CalendarDay[] {
    return calendarDays.map(day => {
      const entries: HabitEntry[] = [];
      
      selectedHabitIds.forEach(habitId => {
        const habitEntries = entriesByHabitId.get(habitId);
        if (habitEntries) {
          const entry = habitEntries.get(day.date);
          if (entry) {
            entries.push(entry);
          }
        }
      });
      
      return { ...day, entries };
    });
  }
  
  /**
   * Get month start and end dates for API calls
   */
  getMonthDateRange(year: number, month: number): { monthStart: string; monthEnd: string } {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    return {
      monthStart: this.formatDate(firstDay),
      monthEnd: this.formatDate(lastDay)
    };
  }
  
  /**
   * Format date to YYYY-MM-DD
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Check if two dates are the same day
   */
  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
  
  /**
   * Get month name
   */
  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  }
  
  /**
   * Get day of week names
   */
  getDayNames(): string[] {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }
  
  /**
   * Navigate to previous month
   */
  getPreviousMonth(year: number, month: number): { year: number; month: number } {
    if (month === 0) {
      return { year: year - 1, month: 11 };
    }
    return { year, month: month - 1 };
  }
  
  /**
   * Navigate to next month
   */
  getNextMonth(year: number, month: number): { year: number; month: number } {
    if (month === 11) {
      return { year: year + 1, month: 0 };
    }
    return { year, month: month + 1 };
  }
  
  /**
   * Check if a date is in the future
   */
  isFutureDate(date: string): boolean {
    const today = new Date();
    const targetDate = new Date(date);
    return targetDate > today;
  }
  
  /**
   * Check if a date is today
   */
  isToday(date: string): boolean {
    const today = new Date();
    const targetDate = new Date(date);
    return this.isSameDate(targetDate, today);
  }
}
