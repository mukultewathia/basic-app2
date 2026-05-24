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
  step: number = 1;
  message: string | null = null;
  isError: boolean = false;
  isLoading: boolean = false;

  usernameData: string = '';
  emailData: string = '';

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

  // Validation function for username
  validateInput(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // Handle input validation for username
  onUsernameInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    target.value = this.validateInput(target.value);
  }

  // Prevent invalid characters on keypress for username
  onKeyPress(event: KeyboardEvent): void {
    const key = event.key;
    if (!key.match(/[a-z0-9]/i)) {
      event.preventDefault();
    }
  }

  requestOtp(form: { value: { username: string; email: string } }) {
    const { username, email } = form.value;
    if (!username || !email) return;

    this.isLoading = true;
    this.message = null;
    this.isError = false;

    this.authService.requestSignupOtp(username, email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.usernameData = username;
        this.emailData = email;
        this.step = 2;
        this.message = res?.message || 'OTP sent successfully';
        this.isError = false;
      },
      error: (err) => {
        console.log('mafia: err', err);
        this.isLoading = false;
        this.message = err.error?.error || 'Failed to request OTP. Please check your details.';
        this.isError = true;
      }
    });
  }

  verifyAndSignup(form: { value: { password: string; otp: string } }) {
    const { password, otp } = form.value;
    if (!password || !otp) return;

    this.isLoading = true;
    this.message = null;
    this.isError = false;

    this.authService.signup(this.usernameData, this.emailData, password, otp).subscribe({
      next: () => {
        this.loginAndgoToHome(this.usernameData, password);
      },
      error: (err) => {
        this.isLoading = false;
        this.message = err.error?.error || 'Signup failed. Invalid OTP or request.';
        this.isError = true;
      }
    });
  }

  goToStep1() {
    this.step = 1;
    this.message = null;
    this.isError = false;
  }

  private loginAndgoToHome(username: string, password: string): void {
    this.authService.login(username, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/metrics-app/home']);
      },
      error: () => {
        this.isLoading = false;
        this.message = 'Login after signup failed.';
        this.isError = true;
      }
    });
  }
}

