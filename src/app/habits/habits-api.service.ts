import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { API_URLS } from '../config/api.config';
import { SnackbarService } from '../services/snackbar.service';
import { 
  AllHabitData,
  HabitEntryResponse,
  HabitRequest,
  HabitEntryRequest,
  CreateHabitDto,
  CreateHabitEntryDto,
  NoteRequest,
  NoteResponse
} from './models';

@Injectable({
  providedIn: 'root'
})
export class HabitsApiService {
  constructor(
    private http: HttpClient,
    private snackbarService: SnackbarService
  ) {}

  /**
   * Get all habits for a user
   */
  getHabits(habitName?: string): Observable<AllHabitData[]> {
    let params = new HttpParams();
    if (habitName) {
      params = params.set('habitName', habitName);
    }
    
    return this.http.get<AllHabitData[]>(API_URLS.HABITS.GET_ALL, { params });
  }

  /**
   * Create a new habit
   */
  createHabit(payload: CreateHabitDto): Observable<any> {
    const habitRequest: HabitRequest = {
      habitName: payload.habitName,
      description: payload.description
    };
    return this.http.post<any>(API_URLS.HABITS.CREATE, habitRequest).pipe(
      tap(() => {
        this.snackbarService.showHabitCreated(payload.habitName);
      }),
      catchError((error) => {
        this.snackbarService.showApiError('create habit');
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a habit
   */
  deleteHabit(habitId: number, habitName?: string): Observable<void> {
    const url = API_URLS.HABITS.DELETE.replace('{habitId}', habitId.toString());
    return this.http.delete<void>(url).pipe(
      tap(() => {
        if (habitName) {
          this.snackbarService.showHabitDeleted(habitName);
        }
      }),
      catchError((error) => {
        this.snackbarService.showApiError('delete habit');
        return throwError(() => error);
      })
    );
  }

  /**
   * Get habit entries for specified habits
   */
  getEntries(habitNames: string[]): Observable<HabitEntryResponse[]> {
    let params = new HttpParams()
      .set('habitNames', habitNames.join(','));
    
    return this.http.get<HabitEntryResponse[]>(API_URLS.HABITS.GET_ENTRIES, { params });
  }

  /**
   * Create a habit entry
   */
  createEntry(payload: CreateHabitEntryDto): Observable<HabitEntryResponse> {
    const entryRequest: HabitEntryRequest = {
      habitName: payload.habitName,
      entryDate: payload.entryDate,
      performed: payload.performed,
      notes: payload.notes
    };
    return this.http.post<HabitEntryResponse>(API_URLS.HABITS.CREATE_ENTRY, entryRequest);
  }

  /**
   * Delete a habit entry
   */
  deleteEntry(entryId: number): Observable<void> {
    const params = new HttpParams().set('entryId', entryId.toString());
    return this.http.delete<void>(API_URLS.HABITS.DELETE_ENTRY, { params });
  }

  /**
   * Upsert a note for a specific date
   */
  upsertNote(noteDate: string, noteText: string): Observable<NoteResponse> {
    const noteRequest: NoteRequest = {
      noteDate: noteDate,
      noteText: noteText
    };
    return this.http.post<NoteResponse>(API_URLS.HABITS.UPSERT_NOTE, noteRequest);
  }

  /**
   * Get all notes for the current user
   */
  getNotes(): Observable<NoteResponse[]> {
    return this.http.get<NoteResponse[]>(API_URLS.HABITS.GET_NOTES);
  }
}
