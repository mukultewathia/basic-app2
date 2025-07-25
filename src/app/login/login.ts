import { Component }       from '@angular/core';
import { AppDataService } from '../app_service_data';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { HttpClient }      from '@angular/common/http';
import { catchError }      from 'rxjs/operators';
import { lastValueFrom, of }              from 'rxjs';
import { Router } from '@angular/router';
import { API_URLS } from '../config/api.config';

interface User {
  username: string;
  password: string;
}


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls:   ['./login.scss']
})
export class LoginComponent {
  message: string | null = null;
  isError: boolean = false;
  users: User[] = [];
  loggedIn: boolean = false;

  // Validation function for username and password
  validateInput(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // Handle input validation for username
  onUsernameInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    target.value = this.validateInput(target.value);
  }

  // Handle input validation for password
  onPasswordInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    target.value = this.validateInput(target.value);
  }

  // Prevent invalid characters on keypress
  onKeyPress(event: KeyboardEvent): void {
    const key = event.key;
    if (!key.match(/[a-z0-9]/i)) {
      event.preventDefault();
    }
  }

  constructor(private readonly http: HttpClient, private readonly router: Router, private readonly appDataService: AppDataService) {
    console.log('login ctor');
    this.appDataService.reset();
  }

  private updateAfterLogin(username: string): void {
    this.appDataService.username = username;
    this.appDataService.loggedIn = true;
  }

  async onSubmit(form: { value: { username: string; password: string } }) {
    const { username, password } = form.value;
    
    // Reset message state
    this.message = null;
    this.isError = false;

    this.http
      .post(API_URLS.LOGIN,{ username, password } )
      .pipe(
        catchError(err => {
          console.error('Login error', err);
          this.message = 'Login failed. Please check your credentials.';
          this.isError = true;
          return of('');
        })
      )
      .subscribe(async response  => {
        if (response) {
          this.message = 'Login successful!';
          this.isError = false;
          this.loggedIn = true;
          await this.loadUsers();
          this.updateAfterLogin(username);
          this.router.navigate(['/metrics-app/weight']);
        } else {
          this.message = 'Login failed. Please try again.';
          this.isError = true;
        }
      });
  }

  async loadUsers(): Promise<void> {
   try {
    const data = await lastValueFrom(this.http.get<User[]>(API_URLS.ALL_USERS));
    this.users = data;
  } catch (err) {
    console.error('Failed to load users', err);
    // Re-throw the error if you want the calling function to know about it
    throw err;
  }
  }
}
