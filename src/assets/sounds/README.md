# Sound Files Directory

## How to Add Your Own Sniper Sound

### Option 1: Use External File (Recommended)
1. Get a sniper sound file (MP3, WAV, or OGG format)
2. Rename it to `sniper.mp3` and place it in this directory
3. Update the audio service to use the file path

### Option 2: Use Base64 Encoded Sound
The current implementation uses a base64 encoded sound that works without external files.

### Option 3: Use Web Audio API
The service also includes a fallback that generates sounds using Web Audio API.

## File Structure
```
src/assets/sounds/
├── README.md          # This file
└── sniper.mp3         # Your sound file (optional)
```

## Supported Formats
- MP3 (recommended)
- WAV
- OGG
- Base64 encoded data URLs

## Volume Control
The sound volume is set to 30% by default. You can adjust this in `src/app/services/audio.service.ts`:
```typescript
this.sniperSound.volume = 0.3; // Change this value (0.0 to 1.0)
``` 