import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private gunSounds: HTMLAudioElement[] = [];
  private sniperSound: HTMLAudioElement | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeGunSounds();
    this.initializeSniperSound();
  }

  private initializeGunSounds(): void {
    // Create multiple gun sound variations
    const gunSoundUrls = <string[]>[
    //   'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
    //   'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
    //   'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
    ];

    // gunSoundUrls.forEach((url, index) => {
    //   const audio = new Audio(url);
    //   audio.volume = 0.2; // Reduced volume for sniper sound
    //   audio.preload = 'auto';
    //   this.gunSounds.push(audio);
    // });

    this.isInitialized = true;
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

  playGunSound(): void {
    if (!this.isInitialized) {
      this.initializeGunSounds();
    }

    // Play a random gun sound
    const randomIndex = Math.floor(Math.random() * this.gunSounds.length);
    const sound = this.gunSounds[randomIndex];
    
    // Reset the audio to start
    sound.currentTime = 0;
    
    // Play the sound
    sound.play().catch(error => {
      console.log('Audio play failed:', error);
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
  playGunSoundWithOscillator(): void {
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
      console.log('Web Audio API not supported, falling back to HTML5 audio');
      this.playGunSound();
    }
  }

  // Alternative sniper sound with more realistic characteristics
  playSniperSoundFromBuffer(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create audio buffer for more realistic sound
      const sampleRate = audioContext.sampleRate;
      const duration = 0.5; // 500ms sniper shot
      const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Generate sniper shot sound
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        
        // Initial sharp crack (high frequency burst)
        const crack = Math.sin(2 * Math.PI * 2000 * t) * Math.exp(-t * 50);
        
        // Lower frequency body
        const body = Math.sin(2 * Math.PI * 300 * t) * Math.exp(-t * 8);
        
        // Noise component
        const noise = (Math.random() - 0.5) * Math.exp(-t * 15);
        
        // Combine all components
        channelData[i] = (crack * 0.4 + body * 0.3 + noise * 0.2) * 0.3;
      }

      // Create buffer source and play
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();

    } catch (error) {
      console.log('Web Audio API not supported, falling back to oscillator');
      this.playGunSoundWithOscillator();
    }
  }
} 