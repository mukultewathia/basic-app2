import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap, switchMap, filter, take } from 'rxjs/operators';
import { API_URLS } from '../config/api.config';

interface LoginResponse {
  userId: number;
  username: string;
  accessToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: LoginResponse | null = null;
  private userLoggedIn: boolean = false;
  private readonly TOKEN_KEY = 'jwt_token';
  private isRefreshingToken = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) { 
    console.log('ctr:: AuthService - Initialized');
    // Try to restore token from localStorage on service initialization
    this.restoreTokenFromStorage();
  }

  get username(): string | null {
    return this.user?.username || null;
  }

  get isLoggedIn(): boolean {
    return this.userLoggedIn;
  }

  get accessToken(): string | null {
    return this.user?.accessToken || localStorage.getItem(this.TOKEN_KEY);
  }

  get isRefreshing(): boolean {
    return this.isRefreshingToken;
  }

   reset(): void {
    this.user = null;
    this.userLoggedIn = false;
    localStorage.removeItem(this.TOKEN_KEY);
    this.refreshTokenSubject.next(null);
  }

  private setUser(userData: any): void {
    this.user = {
      userId: userData.id || userData.userId,
      username: userData.username,
      accessToken: userData.accessToken
    };
    this.userLoggedIn = true;
    
    // Store token in localStorage for persistence
    if (this.user.accessToken) {
      localStorage.setItem(this.TOKEN_KEY, this.user.accessToken);
    }
  }

  private restoreTokenFromStorage(): void {
    const storedToken = localStorage.getItem(this.TOKEN_KEY);
    if (storedToken) {
      this.userLoggedIn = true;
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(API_URLS.LOGIN, { username, password }).pipe(
      tap((user) => {
        this.setUser(user);
        console.log('AuthService - Login successful user:', user);
      }),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(API_URLS.LOGOUT, {}).pipe(
      tap(() => this.reset()),
      catchError(() => {
        console.log('AuthService - Logout failed');
        this.reset(); // Reset locally even if server logout fails
        return of(void 0);
      })
    );
  }

  // Returns a stream of the new token. The stream will emit the new token when it is available.
  refreshToken(): Observable<string> {
    if (this.isRefreshingToken) {
      // If already refreshing, return the current refresh token subject
      // It will be emitted when the refresh is complete and is null currently
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1)
      );
    }

    this.isRefreshingToken = true;
    this.refreshTokenSubject.next(null);

    return this.http.post<any>(API_URLS.REFRESH, {}).pipe(
      tap((user) => {
        this.setUser(user);
        this.isRefreshingToken = false;
        this.refreshTokenSubject.next(user.accessToken);
        console.log('AuthService - Token refreshed successfully');
      }),
      catchError((error) => {
        this.isRefreshingToken = false;
        this.refreshTokenSubject.next(null);
        this.reset();
        console.log('AuthService - Token refresh failed:', error);
        return throwError(() => error);
      }),
      map(user => user.accessToken)
    );
  }

  isUserLoggedIn(): Observable<boolean> {
    return this.http.get<LoginResponse | null>(API_URLS.ME).pipe(
      map((response) => {
        if (response) {
          console.log('AuthService - User logged in', response);
          this.setUser(response);
          return true;
        } else {
          this.reset();
          return false;
        }
      }),
    );
  }

  signup(username: string, password: string): Observable<any> {
    return this.http.post<any>(API_URLS.SIGNUP, { username, password }).pipe(
      tap((user) => {
        console.log('AuthService - Signup successful', user);
      })
    );
  }
}
