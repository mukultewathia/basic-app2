import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { API_URLS } from '../config/api.config';

interface LoginResponse {
  userId: number;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: LoginResponse | null = null;
  private userLoggedIn: boolean = false;

  constructor(private http: HttpClient) { 
    console.log('ctr:: AuthService - Initialized');
  }

  get username(): string | null {
    return this.user?.username || null;
  }

  get isLoggedIn(): boolean {
    return this.userLoggedIn;
  }

   reset(): void {
    this.user = null;
    this.userLoggedIn = false;
  }

  private setUser(userData: any): void {
    this.user = {
      userId: userData.id || userData.userId,
      username: userData.username
    };
    this.userLoggedIn = true;
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(API_URLS.LOGIN, { username, password }).pipe(
      tap((user) => {
        this.setUser(user);
        console.log('AuthService - Login successful', user);
        console.log('AuthService - User', this.user);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(API_URLS.LOGOUT, {}).pipe(
      tap(() => this.reset()),
      catchError(() => {
        console.log('AuthService - Logout failed');
        return of(void 0);
      })
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
