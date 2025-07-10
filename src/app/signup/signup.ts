import { Component } from '@angular/core';
import { FormsModule }       from '@angular/forms';
import { CommonModule }       from '@angular/common';
import { HttpClient }       from '@angular/common/http';
import { catchError }       from 'rxjs/operators';
import { of }               from 'rxjs';
import { API_URLS } from '../config/api.config';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class Signup {
  message: string | null = null;
  isError: boolean = false;

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

  constructor(private http: HttpClient) {}

   onSubmit(form: { value: { username: string; password: string } }) {
      const payload = {
        username: form.value.username,
        password: form.value.password
      };

      // Reset message state
      this.message = null;
      this.isError = false;

      this.http
      .post(API_URLS.SIGNUP, payload, { responseType: 'text' })
      .pipe(
        catchError(err => {
          console.error('Signup error', err);
          this.message = 'Signup failed. Please try again.';
          this.isError = true;
          return of('');       // emit an empty string so subscribe still fires
        })
      )
      .subscribe(responseText => {
        if (responseText && responseText.includes('user created')) {
          this.message = 'Signup successful! Please log in.';
          this.isError = false;
        } else {
          this.message = this.message || 'Signup failed. Please try again.';
          this.isError = true;
        }
      });

    }
}
