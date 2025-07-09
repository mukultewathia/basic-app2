import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppDataService {
  username: string | null = null;
  loggedIn: boolean = false;

  constructor() {}

  reset(): void {
    this.username = null;
    this.loggedIn = false;
  }

  setUser(username: string): void {
    this.username = username;
    this.loggedIn = true;
  }
}