import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  constructor() { }

  /**
   * Get a cookie value by name
   * @param name The name of the cookie
   * @returns The cookie value or null if not found
   */
  getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  }

  /**
   * Get the XSRF token from the XSRF-TOKEN cookie
   * @returns The XSRF token value or null if not found
   */
  getXsrfToken(): string | null {
    return this.getCookie('XSRF-TOKEN');
  }

  /**
   * Check if XSRF token exists
   * @returns True if XSRF token exists, false otherwise
   */
  hasXsrfToken(): boolean {
    return this.getXsrfToken() !== null;
  }
}
