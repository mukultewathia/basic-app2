import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Note } from './models';
import { HabitsApiService } from './habits-api.service';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private notesSubject = new BehaviorSubject<Map<string, Note>>(new Map());
  public notes$ = this.notesSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private habitsApiService: HabitsApiService) {}

  /**
   * Get a note for a specific date
   */
  getNote(date: string): Note | undefined {
    return this.notesSubject.value.get(date);
  }

  /**
   * Get notes as an observable for a specific date
   */
  getNote$(date: string): Observable<Note | undefined> {
    return new Observable(observer => {
      const note = this.getNote(date);
      observer.next(note);
      observer.complete();
    });
  }

  /**
   * Save or update a note for a specific date
   */
  saveNote(noteDate: string, noteText: string): Observable<Note> {
    return new Observable(observer => {
      this.habitsApiService.upsertNote(noteDate, noteText).subscribe({
        next: (response) => {
          const note: Note = {
            id: response.id,
            userId: response.userId,
            noteText: response.noteText,
            noteDate: response.noteDate,
            createdAt: response.createdAt,
            updatedAt: response.updatedAt
          };
          
          const currentNotes = new Map(this.notesSubject.value);
          currentNotes.set(noteDate, note);
          this.notesSubject.next(currentNotes);
          
          observer.next(note);
          observer.complete();
        },
      });
    });
  }

  /**
   * Check if a date has a note
   */
  hasNote(date: string): boolean {
    return this.notesSubject.value.has(date);
  }

  /**
   * Get all notes
   */
  getAllNotes(): Map<string, Note> {
    return this.notesSubject.value;
  }

  /**
   * Check if notes are currently loading
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Clear all notes (useful for logout)
   */
  clearNotes(): void {
    this.notesSubject.next(new Map());
  }

  /**
   * Load all notes from the backend
   */
  loadNotes(): Observable<void> {
    return new Observable(observer => {
      this.loadingSubject.next(true);
      
      this.habitsApiService.getNotes().subscribe({
        next: (responses) => {
          const notesMap = new Map<string, Note>();
          
          responses.forEach(response => {
            const note: Note = {
              id: response.id,
              userId: response.userId,
              noteText: response.noteText,
              noteDate: response.noteDate,
              createdAt: response.createdAt,
              updatedAt: response.updatedAt
            };
            notesMap.set(response.noteDate, note);
          });
          
          this.notesSubject.next(notesMap);
          this.loadingSubject.next(false);
          observer.next();
          observer.complete();
        },
        error: (error) => {
          console.error('Failed to load notes:', error);
          this.loadingSubject.next(false);
          
          // If it's a 404 or 501 error, the notes API might not be implemented yet
          if (error.status === 404 || error.status === 501) {
            console.warn('Notes API not available yet, continuing without notes');
            observer.next(); // Continue without error
          } else {
            observer.error(error);
          }
        }
      });
    });
  }
}
