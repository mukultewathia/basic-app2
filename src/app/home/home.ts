import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppDataService } from '../app_service_data';
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
     public readonly appDataService: AppDataService,
     public readonly router: Router
  ) {}

  logout(): void {
    this.appDataService.reset();
    this.router.navigate(['/metrics-app/login']);
  }
}
