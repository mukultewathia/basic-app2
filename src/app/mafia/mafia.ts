import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../services/audio.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mafia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mafia.html',
  styleUrls: ['./mafia.scss']
})
export class MafiaComponent implements OnInit, OnDestroy {
  private audioService: AudioService;
  clickCount: number = 0;

  constructor(audioService: AudioService, private router: Router) {
    this.audioService = audioService;
  }

  ngOnInit(): void {
    // Add global event listeners for the mafia component
    this.addGlobalEventListeners();
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    this.removeGlobalEventListeners();
  }

  @HostListener('click', ['$event'])
  onComponentClick(event: Event): void {
    this.playGunSound();
  }

  @HostListener('touchstart', ['$event'])
  onComponentTouch(event: Event): void {
    this.playGunSound();
  }

  @HostListener('keydown', ['$event'])
  onComponentKeydown(event: KeyboardEvent): void {
    this.playGunSound();
  }

  onJoinButtonClick(event: Event): void {
    // Prevent event bubbling to avoid double triggering
    event.stopPropagation();
    
    // Play gun sound
    this.playGunSound();
    
    // Increment click counter
    this.clickCount++;
    
    // Check if we've reached 4 clicks
    if (this.clickCount >= 4) {
      // Navigate to login page
      this.router.navigate(['/metrics-app/login']);
    }
  }

  private addGlobalEventListeners(): void {
    // Add listeners for all interactive elements
    document.addEventListener('click', this.handleGlobalClick.bind(this), true);
    document.addEventListener('touchstart', this.handleGlobalTouch.bind(this), true);
    document.addEventListener('keydown', this.handleGlobalKeydown.bind(this), true);
  }

  private removeGlobalEventListeners(): void {
    document.removeEventListener('click', this.handleGlobalClick.bind(this), true);
    document.removeEventListener('touchstart', this.handleGlobalTouch.bind(this), true);
    document.removeEventListener('keydown', this.handleGlobalKeydown.bind(this), true);
  }

  private handleGlobalClick(event: Event): void {
    // Only play sound if we're on the mafia route
    if (window.location.pathname === '/mafia') {
      this.playGunSound();
    }
  }

  private handleGlobalTouch(event: Event): void {
    // Only play sound if we're on the mafia route
    if (window.location.pathname === '/mafia') {
      this.playGunSound();
    }
  }

  private handleGlobalKeydown(event: KeyboardEvent): void {
    // Only play sound if we're on the mafia route
    if (window.location.pathname === '/mafia') {
      this.playGunSound();
    }
  }

  private playGunSound(): void {
    // Add a small delay to prevent sound spam
    setTimeout(() => {
      this.audioService.playSniperSound();
    }, Math.random() * 100); // Random delay up to 100ms
  }
} 