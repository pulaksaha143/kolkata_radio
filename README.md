# Kolkata Radio • কলকাতা রেডিও

> A minimalist monochrome radio dashboard inspired by Satyajit Ray's 35mm celluloid aesthetic, streaming live public All India Radio (AIR) broadcasts from Kolkata.

---

## Live Radio Channels

| Channel | Station | Frequency Band | Language / Focus |
| :--- | :--- | :--- | :--- |
| **CH 01** | **Akashvani Kolkata Geetanjali** | MW 657 kHz | Bengali Primary & Culture |
| **CH 02** | **Akashvani Maitree Kolkata** | MW 594 kHz | Cross-border Bengali Broadcast |
| **CH 03** | **Akashvani FM Gold 100.1** | 100.1 MHz FM | Classic Melodies & News |
| **CH 04** | **Akashvani FM Rainbow 107** | 107.0 MHz FM | Contemporary Music & Youth |
| **CH 05** | **Vividh Bharati Kolkata** | 101.8 MHz FM | Golden Era Hindi & Film Songs |
| **CH 06** | **Akashvani Sanchayita** | MW 1008 kHz | Archive & Literary Heritage |

---

## How to Use

### 1. Starting Playback & Tuning
- **One-Click Play / Pause:** Tap the large `RECEIVING [ STATION ]` button on the console to start or stop the broadcast immediately.
- **Direct Channel Selection:** Click any card in the **Channel Directory** at the bottom to tune directly to that station. The dial needle moves automatically, locks frequency, and switches streams seamlessly.
- **Category Filter:** Filter stations by language/genre using the `ALL CHANNELS`, `BENGALI`, and `HINDI` filter tabs.

### 2. Interactive Frequency Dial
- **Manual Tuning:** Click or drag the amber-white needle along the 520–1500 kHz frequency scale.
- **Resonance Lock:** When tuned within proximity of an active broadcast frequency, the monitor locks at `RESONANCE: 100% [LOCKED]`.

### 3. Real-Time Modulation Monitor
- **Live Audio Waveform:** The central oscilloscope visualizer connects directly to the audio stream through the Web Audio API, decoding real-time broadcast amplitude and speech waveforms.
- **Phosphor Status Readout:** Shows carrier lock status, current frequency, and audio decode state in real-time.

### 4. Volume & Audio Controls
- **Volume Slider:** Adjust the volume smoothly from 0% to 100%. Your selected volume level is automatically saved in your browser and restored on every visit.
- **Instant Mute:** Click the speaker icon button next to the volume slider to quickly mute and restore your audio.
- **System Media Keys:** You can use your keyboard media keys (Play / Pause / Next) or OS Control Center to control the radio.

### 5. Custom Stream URL
- Click **+ STREAM URL** to open the custom stream dialog.
- Enter any direct HLS (`.m3u8`), AAC, or MP3 live stream link to play it through the console.

---

## Local Setup

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

---

## License

MIT • 1931–2026
