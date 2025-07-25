import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { AppDataService } from './app_service_data';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  constructor(
    public appDataService: AppDataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  get isMafiaRoute(): boolean {
    return this.router.url === '/mafia';
  }

  logout(): void {
    this.appDataService.reset();
    this.router.navigate(['/metrics-app/login']);
  }
}
