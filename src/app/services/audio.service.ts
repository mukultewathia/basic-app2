import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private sniperSound: HTMLAudioElement | null = null;

  constructor() {
    this.initializeSniperSound();
  }

  private initializeSniperSound(): void {
    // Load the sniper sound from file
    this.sniperSound = new Audio('assets/sounds/sniper.mp3');
    this.sniperSound.volume = 0.3; // Set volume to 30%
    this.sniperSound.preload = 'auto';
    
    // Handle loading errors
    this.sniperSound.addEventListener('error', (e) => {
      console.error('Failed to load sniper sound file:', e);
      // Fallback to generated sound if file fails to load
      this.sniperSound = null;
    });

    // Test load the sound
    this.sniperSound.addEventListener('canplaythrough', () => {
      console.log('Sniper sound loaded successfully');
    });
  }

  // Play sniper sound from file
  playSniperSound(): void {
    if (this.sniperSound) {
      // Reset the audio to start
      this.sniperSound.currentTime = 0;
      
      // Play the sound
      this.sniperSound.play().catch(error => {
        console.log('Sniper sound play failed:', error);
        // Fallback to generated sound if file fails
        this.playGunSoundWithOscillator();
      });
    } else {
      console.log('Sniper sound not loaded');
      // Fallback to generated sound if file is not loaded
      this.playGunSoundWithOscillator();
    }
  }

  // Enhanced sniper shot sound using Web Audio API
  private playGunSoundWithOscillator(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create multiple oscillators for a more complex sniper sound
      const mainOscillator = audioContext.createOscillator();
      const subOscillator = audioContext.createOscillator();
      const noiseOscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();
      const compressorNode = audioContext.createDynamicsCompressor();

      // Connect the audio nodes
      mainOscillator.connect(gainNode);
      subOscillator.connect(gainNode);
      noiseOscillator.connect(gainNode);
      gainNode.connect(filterNode);
      filterNode.connect(compressorNode);
      compressorNode.connect(audioContext.destination);

      // Configure compressor for punch
      compressorNode.threshold.setValueAtTime(-50, audioContext.currentTime);
      compressorNode.knee.setValueAtTime(40, audioContext.currentTime);
      compressorNode.ratio.setValueAtTime(12, audioContext.currentTime);
      compressorNode.attack.setValueAtTime(0, audioContext.currentTime);
      compressorNode.release.setValueAtTime(0.25, audioContext.currentTime);

      // Configure filter for sniper characteristics
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(8000, audioContext.currentTime);
      filterNode.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
      filterNode.Q.setValueAtTime(1, audioContext.currentTime);

      // Main oscillator (high frequency initial burst)
      mainOscillator.type = 'sawtooth';
      mainOscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      mainOscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.2);

      // Sub oscillator (lower frequency for body)
      subOscillator.type = 'square';
      subOscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      subOscillator.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.3);

      // Noise oscillator (for realistic gun sound)
      noiseOscillator.type = 'sawtooth';
      noiseOscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      noiseOscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.25);

      // Gain envelope for sniper shot characteristics
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.001); // Sharp attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4); // Long decay

      // Start all oscillators
      mainOscillator.start(audioContext.currentTime);
      subOscillator.start(audioContext.currentTime);
      noiseOscillator.start(audioContext.currentTime);

      // Stop oscillators after the sound duration
      mainOscillator.stop(audioContext.currentTime + 0.4);
      subOscillator.stop(audioContext.currentTime + 0.4);
      noiseOscillator.stop(audioContext.currentTime + 0.4);

    } catch (error) {
      console.log('Web Audio API not supported');
    }
  }
} 