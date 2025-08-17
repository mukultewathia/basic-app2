import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  message: string | null = null;
  isError: boolean = false;
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

  constructor(
    private readonly router: Router, 
    private readonly authService: AuthService
  ) {
    console.log('login ctor');
    console.log('environment url', environment.apiBaseUrl);
  }

  /**
   * Logs in users when they click the login button.
   */
  loginUser(form: { value: { username: string; password: string } }) {
    const { username, password } = form.value;
    
    this.message = null;
    this.isError = false;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate(['/metrics-app/home']);
      },
      error: () => {
        this.message = 'Login failed. Please check your credentials.';
        this.isError = true;
      }
    });
  }
}
