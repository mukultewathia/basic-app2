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
  ){}

  ngOnInit(): void {
    this.navigateToHomeOrLogin();
  }

  private navigateToHomeOrLogin(): void {
    this.authService.isUserLoggedIn().subscribe({
      next: () => {
          // this.router.navigate(['/metrics-app/home']);
      }
    });
  }

  get isMafiaRoute(): boolean {
    return this.router.url === '/mafia';
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/metrics-app/login']);
    });
  }
}
