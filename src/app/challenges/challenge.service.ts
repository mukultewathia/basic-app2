import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, catchError, throwError, map } from 'rxjs';
import { 
  ChallengeSummaryResponse, 
  ChallengeDetailResponse,
  SaveHabitEntryRequest,
  SaveNoteRequest,
  SaveHabitEntryResponse,
  SaveNoteResponse,
  CreateChallengeRequest,
  CreateChallengeResponse
} from './models';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private readonly baseUrl = 'http://localhost:8080/api/challenge';

  constructor(private http: HttpClient) {}

  /**
   * Get challenges by status
   */
  list(status?: 'active' | 'expired' | 'scheduled' | 'deleted'): Observable<ChallengeSummaryResponse[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ChallengeSummaryResponse[]>(this.baseUrl, { params });
  }

  /**
   * Get challenge details by ID
   */
  detail(challengeId: number): Observable<ChallengeDetailResponse> {
    return this.http.get<ChallengeDetailResponse>(`${this.baseUrl}/${challengeId}`);
  }

  /**
   * Create a new challenge
   */
  create(challengeData: CreateChallengeRequest): Observable<CreateChallengeResponse> {
    return this.http.post<CreateChallengeResponse>(`${this.baseUrl}/create`, challengeData);
  }

  /**
   * Update challenge (partial update)
   */
  update(challengeId: number, updates: any): Observable<ChallengeDetailResponse> {
    return this.http.patch<ChallengeDetailResponse>(`${this.baseUrl}/${challengeId}`, updates);
  }

  /**
   * Delete challenge (soft delete)
   */
  delete(challengeId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${challengeId}`);
  }

  /**
   * Add habit to challenge
   */
  addHabit(challengeId: number, habitId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${challengeId}/addHabit/${habitId}`, {});
  }

  /**
   * Remove habit from challenge
   */
  removeHabit(challengeId: number, habitId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${challengeId}/deleteHabit/${habitId}`);
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
    
    return this.http.post<any>(`${this.baseUrl.replace('/challenge', '/habits')}/addHabitEntry`, entryRequest).pipe(
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
   * Save note with optimistic update
   * TODO: Replace with real endpoint when available
   */
  saveNote(challengeId: number, date: string, note: string): Observable<SaveNoteResponse> {
    // Simulate API call with delay
    return of({ success: true }).pipe(
      delay(150),
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
    return this.http.patch(`${this.baseUrl}/${challengeId}`, updateData, {
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
    return this.http.delete(`${this.baseUrl}/${challengeId}`).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error deleting challenge:', error);
        return throwError(() => error);
      })
    );
  }
}
