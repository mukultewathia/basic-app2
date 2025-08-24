import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CookieService } from '../services/cookie.service';

export function AuthInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const router = inject(Router);
  const authService = inject(AuthService);
  const cookieService = inject(CookieService);

  console.log('AuthInterceptor : xsrfToken:', cookieService.getXsrfToken());
  console.log('AuthInterceptor : jwtToken:', authService.accessToken);

  let authRequest = addJwtAndXsrfHeaders(request, cookieService.getXsrfToken() || '', authService.accessToken || '');

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
        } 
        else if (error.error?.code === 'TOKEN_EXPIRED') {
          console.log('AuthInterceptor - Token expired, attempting refresh');
          return authService.refreshToken().pipe(
            switchMap((newToken) => {
              console.log('AuthInterceptor - Token refreshed, retrying original request');
              
              const retryRequest = addJwtAndXsrfHeaders(request, cookieService.getXsrfToken() || '', newToken || '');
              
              return next(retryRequest);
            }),
            catchError((refreshError) => {
              console.log('AuthInterceptor - Token refresh failed, redirecting to login');
              authService.reset();
              router.navigate(['/metrics-app/login']);
              return throwError(() => refreshError);
            })
          );
        }
        else {
          console.log('AuthInterceptor - Authentication error, redirecting to login');
          authService.reset();
          router.navigate(['/metrics-app/login']);
        }
      }
      return throwError(() => error);
    })
  );
}


function addJwtAndXsrfHeaders(request: HttpRequest<unknown>, xsrfToken: string , jwtToken: string ): HttpRequest<unknown> {
  const headers: { [key: string]: string } = {};
  headers['Authorization'] = `Bearer ${jwtToken}`;
  headers['X-XSRF-TOKEN'] = xsrfToken;

  return request.clone({
    setHeaders: headers,
    withCredentials: true // This ensures cookies are sent with the request
  });
}
