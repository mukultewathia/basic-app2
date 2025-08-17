import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export function AuthInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Clone the request and ensure credentials are included
  const authRequest = request.clone({
    withCredentials: true // This ensures cookies are sent with the request
  });

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        const currentUrl = router.url;
        const isMeEndpoint = request.url.includes('/me');
        const isOnSignupPage = currentUrl.includes('/signup');
        const isMafiaRoute = currentUrl.includes('/mafia');
        
        if (isMafiaRoute) {
          console.log('AuthInterceptor - On mafia route, not redirecting to login');
        } 
        else if (isOnSignupPage && isMeEndpoint) {
          console.log('AuthInterceptor - On signup page and /me endpoint failed, not redirecting to login');
        } else {
          console.log('Authentication error, redirecting to login');
          authService.reset();
          router.navigate(['/metrics-app/login']);
        }
      }
      return throwError(() => error);
    })
  );
}
