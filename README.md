# Kolkata Radio • কলকাতা রেডিও

> Minimalist monochrome radio player inspired by Satyajit Ray's 35mm celluloid aesthetic, broadcasting live public radio stations from Kolkata.

![Kolkata Radio](public/favicon.svg)

## Features

- **6 Live Kolkata AIR Broadcast Feeds:**
  - `CH 01` Akashvani Kolkata Geetanjali (MW 657 kHz)
  - `CH 02` Akashvani Maitree Kolkata (MW 594 kHz)
  - `CH 03` Akashvani FM Gold 100.1 (100.1 MHz FM)
  - `CH 04` Akashvani FM Rainbow 107 (107.0 MHz FM)
  - `CH 05` Vividh Bharati Kolkata (101.8 MHz FM)
  - `CH 06` Akashvani Sanchayita Kolkata (MW 1008 kHz)
- **Real-Time Cathode-Ray Oscilloscope:**
  - Live audio analysis via Web Audio API (`AudioContext` + `AnalyserNode`) decoding real broadcast waveforms.
  - Analog CRT reticle grid and dynamic carrier frequency readout.
- **Interactive Frequency Dial:**
  - Drag or click to tune frequencies across the MW/AM band with resonance lock indicators.
- **Monochrome 35mm Celluloid Texture:**
  - Procedural film grain canvas simulating authentic 1960s film stock.
- **Two-Way Synchronized Volume & Storage:**
  - User volume preferences persist in `localStorage` across reloads.
  - Full Media Session API integration with system media keys.

---

## Deploy to Cloudflare Pages

### 1. Connect Repository
In your [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**:
Select `kolkata_radio`.

### 2. Build & Deployment Settings
* **Framework preset:** `Vite`
* **Build command:** `npm run build`
* **Build output directory:** `dist`
* **Root directory:** `/`

Cloudflare Pages will build the site using Vite and deploy to a global edge network.

---

## Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Production build
npm run build
```

---

## License

MIT • 1931–2026
