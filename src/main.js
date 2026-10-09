/**
 * KOLKATA RADIO — MINIMALIST MONOCHROME RADIO
 * Satyajit Ray 35mm Aesthetic • Dedicated Broadcast Channels Section
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const istClock = document.getElementById('istClock');
  const heroBadgeTag = document.getElementById('heroBadgeTag');
  const heroLiveTag = document.getElementById('heroLiveTag');
  const programTitleBn = document.getElementById('programTitleBn');
  const programTitleEn = document.getElementById('programTitleEn');

  const oscCanvas = document.getElementById('oscCanvas');
  const resonanceText = document.getElementById('resonanceText');
  const visFreqDisplay = document.getElementById('visFreqDisplay');
  const visChannelTag = document.getElementById('visChannelTag');

  const rulerTrack = document.getElementById('rulerTrack');
  const rulerTicks = document.getElementById('rulerTicks');
  const needleWrapper = document.getElementById('needleWrapper');
  const needleChip = document.getElementById('needleChip');
  const freqBadge = document.getElementById('freqBadge');

  const btnReceiver = document.getElementById('btnReceiver');
  const playIcon = document.getElementById('playIcon');
  const receiverLabel = document.getElementById('receiverLabel');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeDisplay = document.getElementById('volumeDisplay');
  const btnAudible = document.getElementById('btnAudible');
  const muteIcon = document.getElementById('muteIcon');

  const filmGrainCanvas = document.getElementById('filmGrainCanvas');

  // Channels Section Elements
  const channelsGrid = document.getElementById('channelsGrid');
  const filterTabs = document.querySelectorAll('.filter-tab');

  // Custom Stream Modal Elements
  const streamModal = document.getElementById('streamModal');
  const btnCustomStream = document.getElementById('btnCustomStream');
  const modalClose = document.getElementById('modalClose');
  const customUrlInput = document.getElementById('customUrlInput');
  const btnSaveCustomUrl = document.getElementById('btnSaveCustomUrl');
  const qlBtns = document.querySelectorAll('.ql-btn');

  // Audio Element
  const audioEl = document.getElementById('radioAudio');

  // State
  const MIN_FREQ = 520;
  const MAX_FREQ = 1500;
  const AIR_KOLKATA_FREQ = 657;

  // Persistent volume (saved level or default 80)
  const savedVolume = localStorage.getItem('kolkata_radio_volume');
  let currentVolume = savedVolume !== null ? parseInt(savedVolume, 10) : 80;
  if (isNaN(currentVolume) || currentVolume < 0 || currentVolume > 100) currentVolume = 80;
  let previousVolume = currentVolume > 0 ? currentVolume : 80;

  // Set initial slider & display UI
  if (volumeSlider) volumeSlider.value = currentVolume;
  if (volumeDisplay) volumeDisplay.textContent = `${currentVolume}%`;
  if (muteIcon) muteIcon.textContent = currentVolume === 0 ? '🔇' : '🔊';

  let currentFrequency = 657;
  let isPlaying = true;
  let currentFilter = 'all';
  let hlsInstance = null;
  let unlockArmed = false;

  // ==========================================================================
  // Channel data — loaded from /channels.json at runtime
  // ==========================================================================
  let kolkataChannels = [];
  let activeStation = null;

  /** Map a raw channels.json entry to the internal channel object */
  function normalizeChannel(raw) {
    return {
      id:       raw.id,
      ch:       raw.ch,
      nameBn:   raw.name_bn,
      nameEn:   raw.name_en,
      tags:     raw.tags || [],
      catLabel: raw.cat_label || '',
      badgeTag: raw.badge_tag || raw.name_en,
      tag:      raw.frequency,
      freq:     raw.freq || 657,
      url:      raw.stream_url,
      type:     raw.audio_type || 'hls'
    };
  }

  /** Flatten all groups from channels.json into a single sorted array */
  function parseChannelsJSON(data) {
    const groups = data?.station_dashboard?.groups || [];
    const flat = [];
    for (const group of groups) {
      for (const ch of group.channels || []) {
        flat.push(normalizeChannel(ch));
      }
    }
    return flat;
  }

  // ==========================================================================
  // 1. Live Kolkata IST Clock
  // ==========================================================================
  function updateISTClock() {
    const now = new Date();
    const options = { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const timeStr = new Intl.DateTimeFormat('en-GB', options).format(now);
    if (istClock) istClock.textContent = `${timeStr} IST`;
  }
  setInterval(updateISTClock, 1000);
  updateISTClock();

  // ==========================================================================
  // 2. Current Channel Display (Direct, Bold, High Readability)
  // ==========================================================================
  function updateStationDisplay() {
    if (!activeStation) {
      if (programTitleBn) programTitleBn.textContent = 'লোড হচ্ছে...';
      if (programTitleEn) programTitleEn.textContent = 'LOADING CHANNEL...';
      return;
    }

    if (programTitleBn) programTitleBn.textContent = activeStation.nameBn;
    if (programTitleEn) programTitleEn.textContent = activeStation.nameEn.toUpperCase();

    if (heroBadgeTag) {
      heroBadgeTag.textContent = `NOW TRANSMITTING • ${activeStation.ch} • ${activeStation.tag || activeStation.frequency}`;
    }
    if (heroLiveTag) {
      heroLiveTag.textContent = isPlaying ? 'LIVE' : 'STANDBY';
    }

    // Display Current Frequency in Modulation Monitor
    if (visFreqDisplay) {
      visFreqDisplay.textContent = `FREQ: ${activeStation.tag || (activeStation.freq + ' kHz')}`;
    }
    if (visChannelTag) {
      visChannelTag.textContent = activeStation.nameEn.toUpperCase();
    }
  }

  // ==========================================================================
  // 3. Direct Interactive Frequency Dial
  // ==========================================================================
  function buildRulerTicks() {
    if (!rulerTicks) return;
    rulerTicks.innerHTML = '';

    const majorNumbers = [540, 600, 800, 1000, 1200, 1400];
    const mediums = [700, 900, 1100, 1300];

    majorNumbers.forEach(freq => {
      const pct = ((freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100;
      const group = document.createElement('div');
      group.className = 'tick-group';
      group.style.left = `${pct}%`;

      const line = document.createElement('div');
      line.className = 'tick-line major';
      const num = document.createElement('span');
      num.className = 'tick-num';
      num.textContent = freq;

      group.appendChild(line);
      group.appendChild(num);
      rulerTicks.appendChild(group);
    });

    mediums.forEach(freq => {
      const pct = ((freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100;
      const group = document.createElement('div');
      group.className = 'tick-group';
      group.style.left = `${pct}%`;
      const line = document.createElement('div');
      line.className = 'tick-line medium';
      group.appendChild(line);
      rulerTicks.appendChild(group);
    });

    for (let f = 540; f <= 1460; f += 25) {
      if (majorNumbers.includes(f) || mediums.includes(f)) continue;
      const pct = ((f - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100;
      const group = document.createElement('div');
      group.className = 'tick-group';
      group.style.left = `${pct}%`;
      const line = document.createElement('div');
      line.className = 'tick-line minor';
      group.appendChild(line);
      rulerTicks.appendChild(group);
    }
  }
  buildRulerTicks();

  function tuneTo(freq) {
    currentFrequency = Math.max(MIN_FREQ, Math.min(MAX_FREQ, freq));
    const pct = ((currentFrequency - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100;
    const safePct = Math.max(2, Math.min(98, pct));

    if (needleWrapper) needleWrapper.style.left = `${safePct}%`;
    if (needleChip) needleChip.textContent = `${Math.round(currentFrequency)} kHz`;

    // Calculate proximity to tuned channel
    const diff = activeStation ? Math.abs(currentFrequency - activeStation.freq) : Math.abs(currentFrequency - AIR_KOLKATA_FREQ);
    const isLocked = diff <= 5;

    if (freqBadge) {
      if (isLocked && activeStation) {
        freqBadge.textContent = `${activeStation.tag} [LOCKED]`;
        if (resonanceText) resonanceText.textContent = 'RESONANCE: 100%';
      } else {
        freqBadge.textContent = `${currentFrequency.toFixed(1)} kHz`;
        const res = Math.max(25, Math.min(95, 100 - diff * 0.12));
        if (resonanceText) resonanceText.textContent = `RESONANCE: ${res.toFixed(0)}%`;
      }
    }

    // Live update Modulation Monitor Frequency & Station tags
    if (visFreqDisplay) {
      if (isLocked && activeStation) {
        visFreqDisplay.textContent = `FREQ: ${activeStation.tag || (activeStation.freq + ' kHz')}`;
      } else {
        visFreqDisplay.textContent = `FREQ: ${currentFrequency.toFixed(1)} kHz`;
      }
    }
    if (visChannelTag) {
      if (isLocked && activeStation) {
        visChannelTag.textContent = activeStation.nameEn.toUpperCase();
      } else {
        visChannelTag.textContent = 'TUNING CARRIER';
      }
    }
  }
  tuneTo(657);

  // Click / drag to tune
  let isDragging = false;
  function handleDialEvent(e) {
    if (!rulerTrack) return;
    const rect = rulerTrack.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const targetFreq = MIN_FREQ + pct * (MAX_FREQ - MIN_FREQ);
    tuneTo(targetFreq);
  }

  rulerTrack?.addEventListener('mousedown', (e) => { isDragging = true; handleDialEvent(e); });
  window.addEventListener('mousemove', (e) => { if (isDragging) handleDialEvent(e); });
  window.addEventListener('mouseup', () => { isDragging = false; });
  rulerTrack?.addEventListener('touchstart', (e) => { isDragging = true; handleDialEvent(e); }, { passive: true });
  window.addEventListener('touchmove', (e) => { if (isDragging) handleDialEvent(e); }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });

  // ==========================================================================
  // 4. Dedicated Channels Section Engine & Filter Tabs
  // ==========================================================================
  function renderChannelsGrid(filter = 'all') {
    if (!channelsGrid) return;
    channelsGrid.innerHTML = '';
    currentFilter = filter;

    const filtered = filter === 'all'
      ? kolkataChannels
      : kolkataChannels.filter(c => c.tags.includes(filter));

    filtered.forEach((channel, idx) => {
      const card = document.createElement('button');
      const isCur = activeStation && channel.id === activeStation.id;
      card.className = `channel-grid-card ${isCur ? 'active' : ''}`;
      card.type = 'button';
      card.setAttribute('data-id', channel.id);

      const numStr = channel.ch || `CH ${String(idx + 1).padStart(2, '0')}`;

      card.innerHTML = `
        <div class="card-top-row">
          <span class="card-num">${numStr}</span>
          <span class="card-cat-badge">${channel.catLabel}</span>
          <span class="card-status-dot">${isCur ? '● TUNED' : 'STANDBY'}</span>
        </div>
        <div class="card-names-row">
          <span class="card-name-bn">${channel.nameBn}</span>
          <span class="card-sep">/</span>
          <span class="card-name-en">${channel.nameEn}</span>
        </div>
        <div class="card-bottom-row">
          <span class="card-freq-tag">${channel.tag}</span>
          <span class="card-tune-action">${isCur ? 'RECEIVING ↗' : 'SELECT ↗'}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        selectChannel(channel);
      });

      channelsGrid.appendChild(card);
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderChannelsGrid(tab.dataset.filter);
    });
  });

  // ==========================================================================
  // 5. AUDIO PLAYBACK ENGINE (Optimized HLS.js + Robust Recovery)
  // ==========================================================================
  const HLS_CONFIG = {
    enableWorker: true,
    lowLatencyMode: false, // BitGravity streams use 10s chunks; keep lowLatencyMode false for buffer stability
    backBufferLength: 30,
    maxBufferLength: 30,
    maxMaxBufferLength: 60,
    liveSyncDurationCount: 3, // Start 3 chunks back to guarantee uninterrupted playback
    liveMaxLatencyDurationCount: 6,
    fragLoadingTimeOut: 25000,
    manifestLoadingTimeOut: 15000,
    levelLoadingTimeOut: 15000,
    fragLoadingMaxRetry: 4,
    manifestLoadingMaxRetry: 4,
  };

  function setAudioVolume(vol) {
    if (audioEl) {
      audioEl.volume = Math.max(0, Math.min(1, vol / 100));
      audioEl.muted = false;
    }
  }

  function setPlaybackActiveUI(active) {
    if (active) {
      isPlaying = true;
      btnReceiver?.classList.remove('paused');
      if (playIcon) playIcon.textContent = '■';
      if (receiverLabel && activeStation) {
        receiverLabel.textContent = `RECEIVING [ ${activeStation.nameEn.toUpperCase()} ]`;
      }
      if (heroLiveTag) heroLiveTag.textContent = 'LIVE';
    } else {
      isPlaying = false;
      btnReceiver?.classList.add('paused');
      if (playIcon) playIcon.textContent = '▶';
      if (receiverLabel) {
        receiverLabel.textContent = 'STANDBY [ PAUSED ]';
      }
      if (heroLiveTag) heroLiveTag.textContent = 'STANDBY';
    }
  }

  function setPlaybackBufferingUI() {
    if (receiverLabel && activeStation) {
      receiverLabel.textContent = `TUNING [ BUFFERING ${activeStation.nameEn.toUpperCase()}… ]`;
    }
  }

  function setPlaybackBlockedUI() {
    isPlaying = false;
    btnReceiver?.classList.add('paused');
    if (playIcon) playIcon.textContent = '▶';
    if (receiverLabel) {
      receiverLabel.textContent = 'STANDBY — CLICK TO UNMUTE & PLAY ▶';
    }
    if (heroLiveTag) heroLiveTag.textContent = 'STANDBY';
  }

  function armGlobalAutoplayUnlock() {
    if (unlockArmed) return;
    unlockArmed = true;

    const unlockHandler = () => {
      unlockArmed = false;
      window.removeEventListener('click', unlockHandler);
      window.removeEventListener('touchstart', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);

      initAudioContext();
      if (audioEl) {
        audioEl.muted = false;
        setAudioVolume(currentVolume);
        const promise = audioEl.play();
        if (promise !== undefined) {
          promise
            .then(() => setPlaybackActiveUI(true))
            .catch(err => console.warn('[Audio] User unlock error:', err));
        }
      }
    };

    window.addEventListener('click', unlockHandler, { once: true });
    window.addEventListener('touchstart', unlockHandler, { once: true });
    window.addEventListener('keydown', unlockHandler, { once: true });
  }

  function loadStream(url) {
    if (!audioEl) return;

    // Clean up any existing HLS instance
    if (hlsInstance) {
      try {
        hlsInstance.stopLoad();
        hlsInstance.detachMedia();
        hlsInstance.destroy();
      } catch (err) {
        console.warn('[HLS] Teardown error:', err);
      }
      hlsInstance = null;
    }

    // Reset native audio element
    audioEl.pause();
    audioEl.removeAttribute('src');
    audioEl.load();

    audioEl.muted = false;
    setAudioVolume(currentVolume);
    setPlaybackBufferingUI();

    const isHLS = url.includes('.m3u8');

    if (isHLS && typeof Hls !== 'undefined' && Hls.isSupported()) {
      hlsInstance = new Hls(HLS_CONFIG);
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(audioEl);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        initAudioContext();
        console.log('[HLS] Manifest parsed, starting playback:', url);
        audioEl.muted = false;
        setAudioVolume(currentVolume);
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setPlaybackActiveUI(true))
            .catch(err => {
              console.warn('[HLS] Browser blocked autoplay, awaiting interaction:', err);
              setPlaybackBlockedUI();
              armGlobalAutoplayUnlock();
            });
        }
      });

      hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
        console.warn('[HLS Event Error]', data.type, data.details, 'fatal:', data.fatal);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('[HLS] Network error encountered, attempting automatic recovery in 1s...');
              setTimeout(() => {
                if (hlsInstance) hlsInstance.startLoad();
              }, 1000);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('[HLS] Media error encountered, attempting recovery...');
              hlsInstance.recoverMediaError();
              break;
            default:
              console.error('[HLS] Unrecoverable error encountered, re-initializing stream...');
              hlsInstance.destroy();
              hlsInstance = null;
              setTimeout(() => {
                if (activeStation && isPlaying) loadStream(activeStation.url);
              }, 1500);
              break;
          }
        }
      });
    } else if (audioEl.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      audioEl.src = url;
      audioEl.muted = false;
      setAudioVolume(currentVolume);
      initAudioContext();
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setPlaybackActiveUI(true))
          .catch(() => {
            setPlaybackBlockedUI();
            armGlobalAutoplayUnlock();
          });
      }
    } else {
      // Direct audio (MP3/AAC)
      audioEl.src = url;
      audioEl.muted = false;
      setAudioVolume(currentVolume);
      initAudioContext();
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setPlaybackActiveUI(true))
          .catch(() => {
            setPlaybackBlockedUI();
            armGlobalAutoplayUnlock();
          });
      }
    }
  }

  // Audio element event listeners
  if (audioEl) {
    audioEl.addEventListener('playing', () => {
      initAudioContext();
      setPlaybackActiveUI(true);
    });
    audioEl.addEventListener('waiting', () => {
      if (isPlaying) setPlaybackBufferingUI();
    });
    audioEl.addEventListener('pause', () => {
      if (!isPlaying) setPlaybackActiveUI(false);
    });
    audioEl.addEventListener('error', (e) => {
      console.warn('[HTMLAudioElement Error] Connection reset or stream interrupted, reconnecting in 2s...', e);
      if (activeStation && isPlaying) {
        setTimeout(() => loadStream(activeStation.url), 2000);
      }
    });
  }

  function selectChannel(channel) {
    initAudioContext();
    activeStation = channel;
    tuneTo(channel.freq);
    updateStationDisplay();
    renderChannelsGrid(currentFilter);

    isPlaying = true;
    audioEl.muted = false;
    setAudioVolume(currentVolume);

    loadStream(channel.url);
  }

  // ==========================================================================
  // 6. Real 35mm Satyajit Ray Film Grain Canvas Engine
  // ==========================================================================
  function initFilmGrain() {
    if (!filmGrainCanvas) return;
    const ctx = filmGrainCanvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    function resize() {
      w = Math.ceil(window.innerWidth / 2);
      h = Math.ceil(window.innerHeight / 2);
      filmGrainCanvas.width = w;
      filmGrainCanvas.height = h;
    }
    window.addEventListener('resize', resize);
    resize();

    let lastTime = 0;
    function loop(t) {
      requestAnimationFrame(loop);
      if (t - lastTime < 41) return; // ~24 fps
      lastTime = t;

      const img = ctx.createImageData(w, h);
      const buf = new Uint32Array(img.data.buffer);
      const len = buf.length;
      for (let i = 0; i < len; i++) {
        if (Math.random() < 0.25) {
          const lum = Math.floor(Math.random() * 255);
          const a = Math.floor(Math.random() * 120);
          buf[i] = (a << 24) | (lum << 16) | (lum << 8) | lum;
        } else {
          buf[i] = 0;
        }
      }
      ctx.putImageData(img, 0, 0);
    }
    requestAnimationFrame(loop);
  }
  initFilmGrain();

  // ==========================================================================
  // 7. Live Cathode-Ray Oscilloscope Visualizer (Web Audio AnalyserNode)
  // ==========================================================================
  let audioCtx = null;
  let analyserNode = null;
  let audioSourceNode = null;
  let timeDomainData = null;

  function initAudioContext() {
    if (!audioCtx) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        audioCtx = new AudioContextClass();
        analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 1024;
        analyserNode.smoothingTimeConstant = 0.75;

        if (audioEl && !audioSourceNode) {
          audioSourceNode = audioCtx.createMediaElementSource(audioEl);
          audioSourceNode.connect(analyserNode);
          analyserNode.connect(audioCtx.destination);
        }

        timeDomainData = new Uint8Array(analyserNode.frequencyBinCount);
      } catch (err) {
        console.warn('[AudioContext] Initializing WebAudio:', err);
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  let wavePhase = 0;
  function resizeOsc() {
    if (!oscCanvas) return;
    const rect = oscCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    oscCanvas.width = rect.width * dpr;
    oscCanvas.height = rect.height * dpr;
  }
  window.addEventListener('resize', resizeOsc);
  resizeOsc();

  function drawOsc() {
    if (!oscCanvas) return;
    const ctx = oscCanvas.getContext('2d');
    if (!ctx) return;

    const width = oscCanvas.width;
    const height = oscCanvas.height;
    const midY = height / 2;

    // Dark vintage phosphor decay
    ctx.fillStyle = 'rgba(2, 3, 2, 0.4)';
    ctx.fillRect(0, 0, width, height);

    // CRT Reticle Grid Markings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    for (let x = width * 0.1; x < width; x += width * 0.1) {
      ctx.moveTo(x, midY - 6);
      ctx.lineTo(x, midY + 6);
    }
    ctx.stroke();

    // Check for live stream audio signal via AnalyserNode
    let hasLiveAudio = false;
    if (analyserNode && isPlaying && audioEl && !audioEl.paused) {
      if (!timeDomainData || timeDomainData.length !== analyserNode.frequencyBinCount) {
        timeDomainData = new Uint8Array(analyserNode.frequencyBinCount);
      }
      analyserNode.getByteTimeDomainData(timeDomainData);

      let sumDiff = 0;
      for (let i = 0; i < timeDomainData.length; i += 8) {
        sumDiff += Math.abs(timeDomainData[i] - 128);
      }
      if (sumDiff > 16) {
        hasLiveAudio = true;
      }
    }

    // Oscilloscope Trace Beam
    ctx.beginPath();
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = '#ffffff';

    const points = 250;
    const step = width / points;
    const volScale = Math.max(0.1, currentVolume / 100);

    if (hasLiveAudio && timeDomainData) {
      // REAL LIVE BROADCAST WAVEFORM FROM ANALYSER
      const len = timeDomainData.length;
      for (let i = 0; i <= points; i++) {
        const x = i * step;
        const dataIdx = Math.floor((i / points) * len);
        const norm = (timeDomainData[dataIdx] - 128) / 128.0;
        const y = midY + norm * (height * 0.44) * volScale + (Math.random() - 0.5) * 1.5;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else if (isPlaying && audioEl && !audioEl.paused) {
      // CARRIER WAVE WITH ANALOG TUBE DRIFT (during buffering or silent station interval)
      const baseAmp = height * 0.22 * volScale;
      for (let i = 0; i <= points; i++) {
        const x = i * step;
        const nx = (i / points) * Math.PI * 4;
        const fundamental = Math.sin(nx + wavePhase);
        const secondHarmonic = 0.28 * Math.sin(nx * 2 - wavePhase * 1.6);
        const y = midY + (fundamental + secondHarmonic) * baseAmp + (Math.random() - 0.5) * 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      wavePhase += 0.045;
    } else {
      // STANDBY / PAUSED PHOSPHOR BASELINE
      for (let i = 0; i <= points; i++) {
        const x = i * step;
        const y = midY + (Math.random() - 0.5) * 1.5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      wavePhase += 0.005;
    }

    // Phosphor glow
    ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Small live CRT display readout inside the scope
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '10px "JetBrains Mono", monospace';
    const currentFreqText = activeStation ? `${activeStation.tag}` : `${currentFrequency.toFixed(1)} kHz`;
    const modeText = (isPlaying && audioEl && !audioEl.paused)
      ? (hasLiveAudio ? 'LIVE AUDIO • DECODED' : 'CARRIER LOCK • SYNC')
      : 'STANDBY';
    ctx.fillText(`${currentFreqText} | ${modeText}`, 14, 20);

    requestAnimationFrame(drawOsc);
  }
  drawOsc();

  // ==========================================================================
  // 8. Play / Pause Receiver Toggle
  // ==========================================================================
  btnReceiver?.addEventListener('click', () => {
    initAudioContext();
    if (!audioEl) return;
    if (isPlaying && !audioEl.paused) {
      // Pause
      audioEl.pause();
      setPlaybackActiveUI(false);
    } else {
      // Resume / Start
      isPlaying = true;
      audioEl.muted = false;
      setAudioVolume(currentVolume);

      if (audioEl.src || hlsInstance) {
        audioEl.play()
          .then(() => setPlaybackActiveUI(true))
          .catch(() => {
            if (activeStation) loadStream(activeStation.url);
          });
      } else if (activeStation) {
        loadStream(activeStation.url);
      }
    }
  });

  // ==========================================================================
  // 9. Volume Controls & Two-Way Audio Sync
  // ==========================================================================
  function updateVol(val, fromAudioEvent = false) {
    currentVolume = Math.max(0, Math.min(100, val));
    if (volumeSlider && (fromAudioEvent || parseInt(volumeSlider.value, 10) !== currentVolume)) {
      volumeSlider.value = currentVolume;
    }
    if (volumeDisplay) volumeDisplay.textContent = `${currentVolume}%`;
    if (muteIcon) muteIcon.textContent = currentVolume === 0 ? '🔇' : '🔊';

    // Persist volume level across page visits
    try {
      localStorage.setItem('kolkata_radio_volume', String(currentVolume));
    } catch (_) {}

    if (!fromAudioEvent) {
      setAudioVolume(currentVolume);
    }
  }

  volumeSlider?.addEventListener('input', (e) => {
    updateVol(parseInt(e.target.value, 10));
  });

  // Two-way sync: reflect any audio element volume changes onto the slider
  if (audioEl) {
    audioEl.addEventListener('volumechange', () => {
      const vol = audioEl.muted ? 0 : Math.round(audioEl.volume * 100);
      if (vol !== currentVolume) {
        updateVol(vol, true);
      }
    });
  }

  btnAudible?.addEventListener('click', () => {
    if (currentVolume > 0) {
      previousVolume = currentVolume;
      updateVol(0);
    } else {
      const restore = previousVolume > 0 ? previousVolume : 80;
      updateVol(restore);
    }
  });

  // ==========================================================================
  // 10. Custom Stream Modal
  // ==========================================================================
  btnCustomStream?.addEventListener('click', () => streamModal?.showModal());
  modalClose?.addEventListener('click', () => streamModal?.close());
  streamModal?.addEventListener('click', (e) => { if (e.target === streamModal) streamModal.close(); });

  qlBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url;
      if (customUrlInput && url) customUrlInput.value = url;
    });
  });

  btnSaveCustomUrl?.addEventListener('click', () => {
    const url = customUrlInput?.value.trim();
    if (url) {
      streamModal?.close();
      activeStation = {
        id: 'custom-stream',
        ch: 'CH 00',
        nameBn: 'কাস্টম রেডিও স্ট্রিম',
        nameEn: 'Custom Radio Stream',
        tags: ['custom'],
        catLabel: 'CUSTOM',
        badgeTag: 'CUSTOM STREAM',
        tag: 'CUSTOM',
        freq: 657,
        url: url,
        type: 'hls'
      };
      updateStationDisplay();
      renderChannelsGrid(currentFilter);
      isPlaying = true;
      loadStream(url);
    }
  });

  // ==========================================================================
  // 11. Initial Start
  // ==========================================================================
  function startPlayback() {
    if (activeStation) {
      updateStationDisplay();
      loadStream(activeStation.url);
    }
  }

  // ==========================================================================
  // BOOTSTRAP: fetch /channels.json (served from public/) → populate → start
  // ==========================================================================
  fetch('/channels.json')
    .then(r => {
      if (!r.ok) throw new Error(`channels.json HTTP ${r.status} ${r.statusText}`);
      return r.json();
    })
    .then(data => {
      kolkataChannels = parseChannelsJSON(data);
      if (!kolkataChannels.length) throw new Error('channels.json parsed but no channels found');

      activeStation = kolkataChannels[0];
      console.log(`[Kolkata Radio] ✓ Loaded ${kolkataChannels.length} channels from channels.json. Default: ${activeStation.nameEn}`);

      // Update hero display with channel name immediately
      updateStationDisplay();
      renderChannelsGrid('all');
      tuneTo(activeStation.freq);

      // Start stream
      setTimeout(startPlayback, 200);
    })
    .catch(err => {
      console.error('[Kolkata Radio] ✗ channels.json load failed:', err);
      if (receiverLabel) receiverLabel.textContent = 'CHANNEL DATA UNAVAILABLE';
      if (channelsGrid) channelsGrid.innerHTML =
        '<p style="color:rgba(255,255,255,0.4);font-family:monospace;padding:24px 16px;">⚠ Could not load channels.json — check DevTools console</p>';
    });

});
