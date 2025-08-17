import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  constructor(
    public readonly authService: AuthService,
    public readonly router: Router
  ) {
    console.log('HomeComponent - Initialized');
    console.log('HomeComponent - Username:', this.authService.username);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      console.log('HomeComponent - Logout successful');
      this.router.navigate(['/metrics-app/login']);
    });
  }
}
