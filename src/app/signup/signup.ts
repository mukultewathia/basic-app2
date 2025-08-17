import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

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

  constructor(
    private readonly router: Router, 
    private readonly authService: AuthService
  ) {
    this.authService.isUserLoggedIn().subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.router.navigate(['/metrics-app/home']);
      }
    });
  }

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

  signupUser(form: { value: { username: string; password: string } }) {
    const { username, password } = form.value;
    this.message = null;
    this.isError = false;

    this.authService.signup(username, password).subscribe({
      next: () => {
        this.loginAndgoToHome(username, password);
      },
      error: () => {
        this.message = 'Signup failed. Please try again.';
        this.isError = true;
      }
    });
  }

  private loginAndgoToHome(username: string, password: string): void {
    this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate(['/metrics-app/home']);
      },
      error: () => {
        this.message = 'login after signup failed.';
        this.isError = false;
      }
    });
  }
}
