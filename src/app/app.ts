import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    console.log('AppComponent - Constructor called');
  }

  ngOnInit(): void {
    console.log('AppComponent - ngOnInit called');
    this.testAuthStatus();
  }

  testAuthStatus(): void {
    console.log('AppComponent - Testing auth status...');
    this.authService.isUserLoggedIn().subscribe({
      next: (isAuthenticated) => {
        console.log('AppComponent - Auth status check result:', isAuthenticated);
        if (isAuthenticated) {
          console.log('AppComponent - User is authenticated');
        } else {
          console.log('AppComponent - User is not authenticated');
        }
      },
      error: (error) => {
        console.log('AppComponent - Auth status check error:', error);
      }
    });
  }

  get isMafiaRoute(): boolean {
    return this.router.url === '/mafia';
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      console.log('AppComponent - Logout successful');
      this.router.navigate(['/metrics-app/login']);
    });
  }
}
