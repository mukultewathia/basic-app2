import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, catchError, throwError, map } from 'rxjs';
import { API_URLS } from '../config/api.config';
import { 
  ChallengeSummaryResponse, 
  ChallengeDetailResponse,
  SaveHabitEntryRequest,
  SaveNoteRequest,
  SaveHabitEntryResponse,
  SaveNoteResponse,
  NoteResponse,
  CreateChallengeRequest,
  CreateChallengeResponse
} from './models';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  constructor(private http: HttpClient) {}

  /**
   * Get challenges by status
   */
  list(status?: 'active' | 'expired' | 'scheduled' | 'deleted'): Observable<ChallengeSummaryResponse[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ChallengeSummaryResponse[]>(API_URLS.CHALLENGES.LIST, { params });
  }

  /**
   * Get challenge details by ID
   */
  detail(challengeId: number): Observable<ChallengeDetailResponse> {
    const url = API_URLS.CHALLENGES.DETAIL.replace('{challengeId}', challengeId.toString());
    return this.http.get<ChallengeDetailResponse>(url);
  }

  /**
   * Create a new challenge
   */
  create(challengeData: CreateChallengeRequest): Observable<CreateChallengeResponse> {
    return this.http.post<CreateChallengeResponse>(API_URLS.CHALLENGES.CREATE, challengeData);
  }

  /**
   * Update challenge (partial update)
   */
  update(challengeId: number, updates: any): Observable<ChallengeDetailResponse> {
    const url = API_URLS.CHALLENGES.UPDATE.replace('{challengeId}', challengeId.toString());
    return this.http.patch<ChallengeDetailResponse>(url, updates);
  }

  /**
   * Delete challenge (soft delete)
   */
  delete(challengeId: number): Observable<void> {
    const url = API_URLS.CHALLENGES.DELETE.replace('{challengeId}', challengeId.toString());
    return this.http.delete<void>(url);
  }

  /**
   * Add habit to challenge
   */
  addHabit(challengeId: number, habitId: number): Observable<void> {
    const url = API_URLS.CHALLENGES.ADD_HABIT
      .replace('{challengeId}', challengeId.toString())
      .replace('{habitId}', habitId.toString());
    return this.http.put<void>(url, {});
  }

  /**
   * Remove habit from challenge
   */
  removeHabit(challengeId: number, habitId: number): Observable<void> {
    const url = API_URLS.CHALLENGES.REMOVE_HABIT
      .replace('{challengeId}', challengeId.toString())
      .replace('{habitId}', habitId.toString());
    return this.http.delete<void>(url);
  }

  // --- Habit entry management methods ---

  /**
   * Save habit entry using habits API
   */
  saveHabitEntry(challengeId: number, habitId: number, date: string, performed: boolean, habitName: string): Observable<SaveHabitEntryResponse> {
    const entryRequest = {
      habitName: habitName,
      entryDate: date,
      performed: performed,
      notes: undefined
    };
    
    return this.http.post<any>(API_URLS.HABITS.CREATE_ENTRY, entryRequest).pipe(
      map(response => ({
        entryId: response.entryId || Math.floor(Math.random() * 1000),
        success: true
      })),
      catchError(error => {
        console.error('Failed to save habit entry:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Save note using the challenge note endpoint
   */
  saveNote(challengeId: number, date: string, noteText: string): Observable<SaveNoteResponse> {
    const url = API_URLS.CHALLENGES.UPSERT_NOTE.replace('{challengeId}', challengeId.toString());
    
    const request: SaveNoteRequest = {
      noteDate: date,
      noteText: noteText
    };
    
    return this.http.post<SaveNoteResponse>(url, request).pipe(
      catchError(error => {
        console.error('Failed to save note:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get habit entry for specific challenge, habit, and date
   * TODO: Implement when backend endpoint is available
   */
  getHabitEntry(challengeId: number, habitId: number, date: string): Observable<any> {
    // This would be used to fetch existing entries for optimistic updates
    return of(null);
  }

  /**
   * Get all notes for a challenge
   */
  getNotes(challengeId: number): Observable<NoteResponse[]> {
    const url = API_URLS.CHALLENGES.GET_NOTES.replace('{challengeId}', challengeId.toString());
    return this.http.get<NoteResponse[]>(url).pipe(
      catchError(error => {
        console.error('Failed to get notes:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get notes for specific challenge and date
   * TODO: Implement when backend endpoint is available
   */
  getNote(challengeId: number, date: string): Observable<any> {
    // This would be used to fetch existing notes for optimistic updates
    return of(null);
  }

  /**
   * Update challenge details
   */
  updateChallenge(challengeId: number, updateData: any): Observable<any> {
    const url = API_URLS.CHALLENGES.UPDATE.replace('{challengeId}', challengeId.toString());
    return this.http.patch(url, updateData, {
      headers: {
        'Content-Type': 'application/merge-patch+json'
      }
    }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error updating challenge:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete challenge (soft delete)
   */
  deleteChallenge(challengeId: number): Observable<any> {
    const url = API_URLS.CHALLENGES.DELETE.replace('{challengeId}', challengeId.toString());
    return this.http.delete(url).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error deleting challenge:', error);
        return throwError(() => error);
      })
    );
  }
}
