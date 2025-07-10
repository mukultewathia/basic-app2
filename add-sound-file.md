# How to Add Your Own Sniper Sound File

## Step 1: Get Your Sound File
1. Find or create a sniper/gun sound file (MP3, WAV, or OGG format)
2. Make sure the file is relatively short (0.5-2 seconds) for best performance

## Step 2: Add the File to Your Project
1. Create the sounds folder: `mkdir -p src/assets/sounds`
2. Copy your sound file to: `src/assets/sounds/sniper.mp3`

## Step 3: Update the Audio Service (if needed)
If your file has a different name or format, update the path in `src/app/services/audio.service.ts`:

```typescript
// Change this line to match your file:
this.sniperSound = new Audio('/assets/sounds/sniper.mp3');

// For example, if your file is called "gunshot.wav":
this.sniperSound = new Audio('/assets/sounds/gunshot.wav');
```

## Step 4: Test the Sound
1. Start your Angular development server: `ng serve`
2. Navigate to `/mafia` route
3. Click anywhere on the page to test the sound

## Alternative: Use Multiple Sound Files
You can also add multiple sound files and randomize them:

```typescript
private sniperSounds: HTMLAudioElement[] = [];

private initializeSniperSound(): void {
  const soundFiles = [
    '/assets/sounds/sniper1.mp3',
    '/assets/sounds/sniper2.mp3',
    '/assets/sounds/sniper3.mp3'
  ];
  
  soundFiles.forEach(file => {
    const audio = new Audio(file);
    audio.volume = 1;
    audio.preload = 'auto';
    this.sniperSounds.push(audio);
  });
}

playSniperSound(): void {
  if (this.sniperSounds.length > 0) {
    const randomSound = this.sniperSounds[Math.floor(Math.random() * this.sniperSounds.length)];
    randomSound.currentTime = 0;
    randomSound.play().catch(error => {
      console.log('Sound play failed:', error);
    });
  }
}
```

## Recommended Sound Sources
- Free sound effects websites (freesound.org, zapsplat.com)
- Game sound effect packs
- Create your own using audio editing software 