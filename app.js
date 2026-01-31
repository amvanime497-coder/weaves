const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function makeWavDataUrl({ freq = 220, seconds = 8, sampleRate = 22050, gain = 0.18, detune = 0 }) {
  // Simple 16-bit PCM mono WAV generator (no copyrighted audio).
  const totalSamples = Math.max(1, Math.floor(sampleRate * seconds));
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = totalSamples * blockAlign;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  let off = 0;
  const writeStr = (s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off++, s.charCodeAt(i));
  };

  writeStr('RIFF');
  view.setUint32(off, 36 + dataSize, true); off += 4;
  writeStr('WAVE');
  writeStr('fmt ');
  view.setUint32(off, 16, true); off += 4; // PCM chunk size
  view.setUint16(off, 1, true); off += 2; // PCM format
  view.setUint16(off, numChannels, true); off += 2;
  view.setUint32(off, sampleRate, true); off += 4;
  view.setUint32(off, byteRate, true); off += 4;
  view.setUint16(off, blockAlign, true); off += 2;
  view.setUint16(off, bitsPerSample, true); off += 2;
  writeStr('data');
  view.setUint32(off, dataSize, true); off += 4;

  // Tone with small attack/release to avoid clicks.
  const attack = Math.floor(sampleRate * 0.02);
  const release = Math.floor(sampleRate * 0.06);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const f = freq * Math.pow(2, detune / 1200);
    const env = i < attack ? (i / attack) : (i > totalSamples - release ? ((totalSamples - i) / release) : 1);
    const wave = Math.sin(2 * Math.PI * f * t) * Math.sin(2 * Math.PI * (f * 0.5) * t) * 0.7 + Math.sin(2 * Math.PI * f * t) * 0.3;
    const sample = clamp(wave * gain * env, -1, 1);
    view.setInt16(off, Math.floor(sample * 32767), true);
    off += 2;
  }

  // Convert to base64
  const u8 = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    binary += String.fromCharCode(...u8.subarray(i, i + chunk));
  }
  const b64 = btoa(binary);
  return `data:audio/wav;base64,${b64}`;
}

const db = {
  featured: {
    title: 'Weave',
    desc: 'Klik PLAY untuk memutar lagu dari folder assets kamu. Jika file belum ada, player akan menampilkan error dan tetap responsif.',
    accent: ['#1ee3ff', '#7c4dff'],
    trackId: 't_kami_belum_tentu',
  },
  categories: [
    { id: 'indo', name: 'Lagu Indo', icon: '🇮🇩' },
    { id: 'english', name: 'Lagu Inggris', icon: 'ENG' },
  ],
  tracks: [
    {
      id: 't_kami_belum_tentu',
      title: 'Kami Belum Tentu',
      artist: 'Beberapa Orang Memaafkan • 2018',
      durationHint: '',
      cover: ['#7c4dff', '#1ee3ff'],
      coverImg: 'assets/covers/kami-belum-tentu.jpg',
      src: 'assets/audio/kami-belum-tentu.mp3',
      lyricsLrc: 'assets/lyrics/kami-belum-tentu.lrc',
      lyricsTxt: 'assets/lyrics/kami-belum-tentu.txt',
      category: 'indo',
    },
    {
      id: 't_politirk',
      title: 'Politrik',
      artist: 'Membangun & Menghancurkan • 2024',
      durationHint: '',
      cover: ['#1ee3ff', '#18d07f'],
      coverImg: 'assets/covers/Politirk.jpg',
      src: 'assets/audio/politrik.mp3',
      lyricsLrc: 'assets/lyrics/politrik.lrc',
      lyricsTxt: 'assets/lyrics/politrik.txt',
      category: 'indo',
    },
    {
      id: 't_o_tuan',
      title: 'o, Tuan',
      artist: 'Membangun & Menghancurkan • 2022',
      durationHint: '',
      cover: ['#ff5bb8', '#7c4dff'],
      coverImg: 'assets/covers/o-tuan.jpg',
      src: 'assets/audio/o-tuan.mp3',
      lyricsLrc: 'assets/lyrics/o-tuan.lrc',
      lyricsTxt: 'assets/lyrics/o-tuan.txt',
      category: 'indo',
    },
    {
      id: 't_nina',
      title: 'Nina',
      artist: 'Membangun & Menghancurkan • 2024',
      durationHint: '',
      cover: ['#ffb24c', '#1ee3ff'],
      coverImg: 'assets/covers/nina.jpg',
      src: 'assets/audio/nina.mp3',
      lyricsLrc: 'assets/lyrics/nina.lrc',
      lyricsTxt: 'assets/lyrics/nina.txt',
      category: 'indo',
    },
    {
      id: 't_patah_hati',
      title: 'Patah-Hati',
      artist: 'The Rain • 2015',
      durationHint: '',
      cover: ['#18d07f', '#7c4dff'],
      coverImg: 'assets/covers/patah-hati.jpg',
      src: 'assets/audio/patah-hati.mp3',
      lyricsLrc: 'assets/lyrics/patah-hati.lrc',
      lyricsTxt: 'assets/lyrics/patah-hati.txt',
      category: 'indo',
    },
    {
      id: 't_sunset_di_tanah_anarki',
      title: 'Sunset di Tanah Anarki',
      artist: 'Superman Is Dead • 2013',
      durationHint: '',
      cover: ['#1ee3ff', '#ff5bb8'],
      coverImg: 'assets/covers/sunset-di-tanah-anarki.jpg',
      src: 'assets/audio/sunset-di-tanah-anarki.mp3',
      lyricsLrc: 'assets/lyrics/sunset-di-tanah-anarki.lrc',
      lyricsTxt: 'assets/lyrics/sunset-di-tanah-anarki.txt',
      category: 'indo',
    },
    {
      id: 't_untuk_perempuan',
      title: 'Untuk Perempuan yang Sedang dalam Pelukan',
      artist: 'Payung Teduh • 2017',
      durationHint: '',
      cover: ['#7c4dff', '#ffb24c'],
      coverImg: 'assets/covers/untuk-perempuan.jpg',
      src: 'assets/audio/untuk-perempuan.mp3',
      lyricsLrc: 'assets/lyrics/untuk-perempuan.lrc',
      lyricsTxt: 'assets/lyrics/untuk-perempuan.txt',
      category: 'indo',
    },
    {
      id: 't_cinta_di_pantai_bali',
      title: 'Cinta di Pantai Bali',
      artist: 'Slank • 1995',
      durationHint: '',
      cover: ['#ff5bb8', '#18d07f'],
      coverImg: 'assets/covers/cinta-di-pantai-bali.jpg',
      src: 'assets/audio/cinta-di-pantai-bali.mp3',
      lyricsLrc: 'assets/lyrics/cinta-di-pantai-bali.lrc',
      lyricsTxt: 'assets/lyrics/cinta-di-pantai-bali.txt',
      category: 'indo',
    },
    {
      id: 't_1_1_cinta',
      title: '1+1=Cinta',
      artist: 'Thinkywinky • 2022',
      durationHint: '',
      cover: ['#18d07f', '#1ee3ff'],
      coverImg: 'assets/covers/1-1-cinta.jpg',
      src: 'assets/audio/1-1-cinta.mp3',
      lyricsLrc: 'assets/lyrics/1-1-cinta.lrc',
      lyricsTxt: 'assets/lyrics/1-1-cinta.txt',
      category: 'indo',
    },
    {
      id: 't_mangu',
      title: 'Mangu',
      artist: 'Artis • 2024',
      durationHint: '',
      cover: ['#ff6b6b', '#ffa500'],
      coverImg: 'assets/covers/mangu.jpg',
      src: 'assets/audio/mangu.mp3',
      lyricsLrc: 'assets/lyrics/mangu.lrc',
      lyricsTxt: '',
      category: 'indo',
    },
    // English Songs
    {
      id: 't_you_broke_me_first',
      title: 'You Broke Me First',
      artist: 'Tate McRae • 2020',
      durationHint: '',
      cover: ['#e91e63', '#9c27b0'],
      coverImg: 'assets/covers/you-broke-me-first.jpg',
      src: 'assets/audio/you-broke-me-first.mp3',
      lyricsLrc: 'assets/lyrics/you-broke-me-first.lrc',
      lyricsTxt: '',
      category: 'english',
    },
    {
      id: 't_the_night_we_met',
      title: 'The Night We Met',
      artist: 'Lord Huron • 2015',
      durationHint: '',
      cover: ['#3f51b5', '#1a237e'],
      coverImg: 'assets/covers/the-night-we-met.jpg',
      src: 'assets/audio/the-night-we-met.mp3',
      lyricsLrc: 'assets/lyrics/the-night-we-met.lrc',
      lyricsTxt: '',
      category: 'english',
    },
    {
      id: 't_summertime_sadness',
      title: 'Summertime Sadness',
      artist: 'Lana Del Rey • 2012',
      durationHint: '',
      cover: ['#ff5722', '#ff9800'],
      coverImg: 'assets/covers/summertime-sadness.jpg',
      src: 'assets/audio/summertime-sadness.mp3',
      lyricsLrc: 'assets/lyrics/summertime-sadness.lrc',
      lyricsTxt: '',
      category: 'english',
    },
    {
      id: 't_young_and_beautiful',
      title: 'Young and Beautiful',
      artist: 'Lana Del Rey • 2013',
      durationHint: '',
      cover: ['#673ab7', '#e91e63'],
      coverImg: 'assets/covers/young-and-beautiful.jpg',
      src: 'assets/audio/young-and-beautiful.mp3',
      lyricsLrc: 'assets/lyrics/young-and-beautiful.lrc',
      lyricsTxt: '',
      category: 'english',
    },
    {
      id: 't_take_me_to_church',
      title: 'Take Me to Church',
      artist: 'Hozier • 2013',
      durationHint: '',
      cover: ['#212121', '#616161'],
      coverImg: 'assets/covers/take-me-to-church.jpg',
      src: 'assets/audio/take-me-to-church.mp3',
      lyricsLrc: 'assets/lyrics/take-me-to-church.lrc',
      lyricsTxt: '',
      category: 'english',
    },
    {
      id: 't_apologize',
      title: 'Apologize',
      artist: 'OneRepublic • 2007',
      durationHint: '',
      cover: ['#607d8b', '#455a64'],
      coverImg: 'assets/covers/apologize.jpg',
      src: 'assets/audio/apologize.mp3',
      lyricsLrc: 'assets/lyrics/apologize.lrc',
      lyricsTxt: '',
      category: 'english',
    },
    {
      id: 't_heat_waves',
      title: 'Heat Waves',
      artist: 'Glass Animals • 2020',
      durationHint: '',
      cover: ['#ff6f00', '#ff3d00'],
      coverImg: 'assets/covers/heat-waves.jpg',
      src: 'assets/audio/heat-waves.mp3',
      lyricsLrc: 'assets/lyrics/heat-waves.lrc',
      lyricsTxt: '',
      category: 'english',
    },
    {
      id: 't_love_me_not',
      title: 'Love Me Not',
      artist: 'Artis • 2020',
      durationHint: '',
      cover: ['#c2185b', '#880e4f'],
      coverImg: 'assets/covers/love-me-not.jpg',
      src: 'assets/audio/love-me-not.mp3',
      lyricsLrc: 'assets/lyrics/love-me-not.lrc',
      lyricsTxt: '',
      category: 'english',
    },
    {
      id: 't_ignite',
      title: 'Ignite',
      artist: 'Alan Walker • 2017',
      durationHint: '',
      cover: ['#00bcd4', '#006064'],
      coverImg: 'assets/covers/ignite.jpg',
      src: 'assets/audio/ignite.mp3',
      lyricsLrc: 'assets/lyrics/ignite.lrc',
      lyricsTxt: '',
      category: 'english',
    },
    {
      id: 't_sailor_song',
      title: 'Sailor Song',
      artist: 'Gigi Perez • 2024',
      durationHint: '',
      cover: ['#0288d1', '#01579b'],
      coverImg: 'assets/covers/sailor-song.jpg',
      src: 'assets/audio/sailor-song.mp3',
      lyricsLrc: 'assets/lyrics/sailor-song.lrc',
      lyricsTxt: '',
      category: 'english',
    },
    {
      id: 't_i_wanna_be_yours',
      title: 'I Wanna Be Yours',
      artist: 'Arctic Monkeys • 2013',
      durationHint: '',
      cover: ['#424242', '#212121'],
      coverImg: 'assets/covers/i-wanna-be-yours.jpg',
      src: 'assets/audio/i-wanna-be-yours.mp3',
      lyricsLrc: 'assets/lyrics/i-wanna-be-yours.lrc',
      lyricsTxt: '',
      category: 'english',
    },
    {
      id: 't_always',
      title: 'Always',
      artist: 'Daniel Caesar • 2017',
      durationHint: '',
      cover: ['#7b1fa2', '#4a148c'],
      coverImg: 'assets/covers/always.jpg',
      src: 'assets/audio/always.mp3',
      lyricsLrc: 'assets/lyrics/always.lrc',
      lyricsTxt: '',
      category: 'english',
    },
    {
      id: 't_im_not_angry_anymore',
      title: "I'm Not Angry Anymore x Somebody",
      artist: 'Paramore x The Chainsmokers',
      durationHint: '',
      cover: ['#f44336', '#d32f2f'],
      coverImg: 'assets/covers/im-not-angry-anymore.jpg',
      src: 'assets/audio/im-not-angry-anymore.mp3',
      lyricsLrc: 'assets/lyrics/im-not-angry-anymore.lrc',
      lyricsTxt: '',
      category: 'english',
    },
    {
      id: 't_daylight',
      title: 'Daylight',
      artist: 'David Kushner • 2023',
      durationHint: '',
      cover: ['#ffeb3b', '#ffc107'],
      coverImg: 'assets/covers/daylight.jpg',
      src: 'assets/audio/daylight.mp3',
      lyricsLrc: 'assets/lyrics/daylight.lrc',
      lyricsTxt: '',
      category: 'english',
    },
    {
      id: 't_dandelions',
      title: 'Dandelions',
      artist: 'Ruth B. • 2017',
      durationHint: '',
      cover: ['#8bc34a', '#558b2f'],
      coverImg: 'assets/covers/dandelions.jpg',
      src: 'assets/audio/dandelions.mp3',
      lyricsLrc: 'assets/lyrics/dandelions.lrc',
      lyricsTxt: '',
      category: 'english',
    },
    {
      id: 't_judas',
      title: 'Judas',
      artist: 'Lady Gaga • 2011',
      durationHint: '',
      cover: ['#9e9e9e', '#616161'],
      coverImg: 'assets/covers/judas.jpg',
      src: 'assets/audio/judas.mp3',
      lyricsLrc: 'assets/lyrics/judas.lrc',
      lyricsTxt: '',
      category: 'english',
    },
  ],
};

const els = {
  sidebar: $('#sidebar'),
  overlay: $('#overlay'),
  openSidebar: $('#openSidebar'),
  collapseSidebar: $('#collapseSidebar'),
  trackList: $('#trackList'),

  heroBg: $('#heroBg'),
  heroTitle: $('#heroTitle'),
  heroDesc: $('#heroDesc'),
  heroPlay: $('#heroPlay'),
  heroCover: $('#heroCover'),
  heroLyricsHint: $('#heroLyricsHint'),
  heroLyricsLines: $('#heroLyricsLines'),

  playerCover: $('#playerCover'),
  playerTitle: $('#playerTitle'),
  playerArtist: $('#playerArtist'),

  lyricsHint: $('#lyricsHint'),
  lyricsLines: $('#lyricsLines'),

  btnPrev: $('#btnPrev'),
  btnPlay: $('#btnPlay'),
  btnNext: $('#btnNext'),

  seek: $('#seek'),
  timeNow: $('#timeNow'),
  timeTotal: $('#timeTotal'),

  btnMute: $('#btnMute'),
  volume: $('#volume'),

  searchInput: $('#searchInput'),
  
  // Mobile elements
  mobileSearchInput: $('#mobileSearchInput'),
  mobileHeroCover: $('#mobileHeroCover'),
  mobileHeroTitle: $('#mobileHeroTitle'),
  mobileHeroArtist: $('#mobileHeroArtist'),
  mobilePlayBtn: $('#mobilePlayBtn'),
  mobileShuffleBtn: $('#mobileShuffleBtn'),
  mobileTrackList: $('#mobileTrackList'),
  mobilePlayerCover: $('#mobilePlayerCover'),
  mobilePlayerTitle: $('#mobilePlayerTitle'),
  mobilePlayerArtist: $('#mobilePlayerArtist'),
  mobilePlayerPlayBtn: $('#mobilePlayerPlayBtn'),
  mobilePlayerNextBtn: $('#mobilePlayerNextBtn'),
  
  // Category elements
  categorySection: $('#categorySection'),
  categoryCards: $('#categoryCards'),
  playlistView: $('#playlistView'),
  playlistViewTitle: $('#playlistViewTitle'),
  playlistViewTracks: $('#playlistViewTracks'),
  backToCategories: $('#backToCategories'),
};

const state = {
  queue: db.tracks.slice(),
  filteredQueue: db.tracks.slice(),
  index: 0,
  isPlaying: false,
  isSeeking: false,
  lastVolume: 0.85,
  uiMode: 'discover', // discover | track | last | playlist
  currentRoute: 'discover', // discover | last | playlist
  currentCategory: null, // Currently selected category id
  lastListening: [], // Array of recently played track IDs
  lyrics: {
    mode: 'none', // none | txt | lrc
    lines: [],
    activeIndex: -1,
  },
};

// Load last listening history from localStorage
function loadLastListening() {
  try {
    const saved = localStorage.getItem('weave_last_listening');
    if (saved) {
      state.lastListening = JSON.parse(saved);
    }
  } catch (e) {
    state.lastListening = [];
  }
}

// Save last listening history to localStorage
function saveLastListening() {
  try {
    localStorage.setItem('weave_last_listening', JSON.stringify(state.lastListening));
  } catch (e) {}
}

// Add track to last listening history
function addToLastListening(trackId) {
  // Remove if already exists
  state.lastListening = state.lastListening.filter(id => id !== trackId);
  // Add to beginning
  state.lastListening.unshift(trackId);
  // Keep only last 20 tracks
  state.lastListening = state.lastListening.slice(0, 20);
  saveLastListening();
}

// Render category cards
function renderCategoryCards() {
  if (!els.categoryCards) return;
  els.categoryCards.innerHTML = '';
  
  db.categories.forEach(cat => {
    const count = db.tracks.filter(t => t.category === cat.id).length;
    const card = document.createElement('div');
    card.className = 'category-card';
    card.dataset.categoryId = cat.id;
    card.innerHTML = `
      <span class="category-card__icon">${cat.icon}</span>
      <h3 class="category-card__name">${escapeHtml(cat.name)}</h3>
      <p class="category-card__count">${count} lagu</p>
    `;
    card.addEventListener('click', () => {
      selectCategory(cat.id);
    });
    els.categoryCards.appendChild(card);
  });
}

// Select a category and show its tracks
function selectCategory(categoryId) {
  state.currentCategory = categoryId;
  const category = db.categories.find(c => c.id === categoryId);
  
  if (!category) return;
  
  // Hide category section, show playlist view
  if (els.categorySection) els.categorySection.hidden = true;
  if (els.playlistView) els.playlistView.hidden = false;
  
  // Update title
  if (els.playlistViewTitle) {
    els.playlistViewTitle.textContent = `${category.icon} ${category.name}`;
  }
  
  // Render filtered tracks
  renderPlaylistTracks(categoryId);
}

// Render tracks for a specific category
function renderPlaylistTracks(categoryId) {
  if (!els.playlistViewTracks) return;
  els.playlistViewTracks.innerHTML = '';
  
  const tracks = db.tracks.filter(t => t.category === categoryId);
  
  tracks.forEach((track, idx) => {
    const el = document.createElement('div');
    el.className = 'playlist-track';
    el.dataset.trackId = track.id;
    
    const coverStyle = track.coverImg 
      ? `background-image:url('${escapeAttr(track.coverImg)}')`
      : `background:linear-gradient(135deg, ${track.cover[0]}, ${track.cover[1]})`;
    
    el.innerHTML = `
      <span class="playlist-track__num">${String(idx + 1).padStart(2, '0')}</span>
      <div class="playlist-track__cover" style="${coverStyle}"></div>
      <div class="playlist-track__info">
        <div class="playlist-track__title">${escapeHtml(track.title)}</div>
        <div class="playlist-track__artist">${escapeHtml(track.artist)}</div>
      </div>
    `;
    
    el.addEventListener('click', () => {
      // Set queue to category tracks and play
      state.queue = tracks.slice();
      state.filteredQueue = tracks.slice();
      const trackIndex = tracks.findIndex(t => t.id === track.id);
      loadIndex(trackIndex >= 0 ? trackIndex : 0);
      play();
    });
    
    els.playlistViewTracks.appendChild(el);
  });
}

// Get tracks from last listening history (only 1 last played)
function getLastListeningTracks() {
  return state.lastListening
    .slice(0, 1) // Only get 1 last played track
    .map(id => db.tracks.find(t => t.id === id))
    .filter(t => t !== undefined);
}

const audio = new Audio();
audio.preload = 'metadata';
audio.crossOrigin = 'anonymous';

function setGradient(el, colors) {
  const [a, b] = colors;
  el.style.background = `linear-gradient(135deg, ${a}, ${b})`;
}

function setHero() {
  els.heroTitle.textContent = db.featured.title;
  els.heroDesc.textContent = db.featured.desc;
  els.heroBg.style.background =
    `radial-gradient(700px 440px at 72% 30%, ${db.featured.accent[0]}33, transparent 60%),` +
    `radial-gradient(560px 420px at 42% 60%, ${db.featured.accent[1]}2e, transparent 62%),` +
    `linear-gradient(135deg, ${db.featured.accent[0]}22, ${db.featured.accent[1]}22),` +
    `linear-gradient(0deg, rgba(0,0,0,.28), rgba(0,0,0,.28))`;
}

function setHeroForTrack(track) {
  if (!track) return;
  els.heroTitle.textContent = track.title;
  els.heroDesc.textContent = track.artist;
  els.heroBg.style.background =
    `radial-gradient(760px 520px at 70% 30%, ${track.cover?.[0] ?? '#1ee3ff'}30, transparent 60%),` +
    `radial-gradient(620px 520px at 42% 62%, ${track.cover?.[1] ?? '#7c4dff'}2a, transparent 62%),` +
    `linear-gradient(135deg, ${(track.cover?.[0] ?? '#1ee3ff')}22, ${(track.cover?.[1] ?? '#7c4dff')}22),` +
    `linear-gradient(0deg, rgba(0,0,0,.30), rgba(0,0,0,.30))`;

  // Cover in hero (use image if present, otherwise gradient)
  if (els.heroCover) {
    setGradient(els.heroCover, track.cover || ['#1ee3ff', '#7c4dff']);
    if (track.coverImg) {
      els.heroCover.style.backgroundImage = `url(${track.coverImg}), ${els.heroCover.style.background}`;
      els.heroCover.style.backgroundSize = 'cover, auto';
      els.heroCover.style.backgroundPosition = 'center, center';
    } else {
      els.heroCover.style.backgroundImage = '';
    }
  }
}

function setUiMode(mode) {
  state.uiMode = mode;
  document.body.classList.toggle('mode-track', mode === 'track');
}

function renderTrackList() {
  els.trackList.innerHTML = '';
  const tracksToRender = state.currentRoute === 'last' ? getLastListeningTracks() : state.filteredQueue;
  
  if (state.currentRoute === 'last' && tracksToRender.length === 0) {
    els.trackList.innerHTML = '<div class="track-empty">Belum ada lagu yang diputar.</div>';
    renderMobileTrackList();
    return;
  }
  
  tracksToRender.forEach((t, i) => {
    const idx = String(i + 1).padStart(2, '0');
    const el = document.createElement('div');
    el.className = 'track';
    el.dataset.trackId = t.id;
    const thumbHtml = t.coverImg
      ? `<div class="track__thumb"><img src="${escapeAttr(t.coverImg)}" alt="" loading="lazy" onerror="this.remove()"></div>`
      : `<div class="track__thumb" aria-hidden="true"></div>`;
    el.innerHTML = `
      <div class="track__idx">${idx}</div>
      ${thumbHtml}
      <div>
        <div class="track__title">${escapeHtml(t.title)}</div>
        <div class="track__artist">${escapeHtml(t.artist)}</div>
      </div>
      <div class="track__dur">${t.durationHint || ''}</div>
    `;
    el.addEventListener('click', () => {
      const realIndex = state.queue.findIndex((q) => q.id === t.id);
      if (realIndex >= 0) {
        setUiMode('track');
        loadIndex(realIndex);
        play();
        closeSidebarIfMobile();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    els.trackList.appendChild(el);
  });
  syncActiveTrackUI();
  renderMobileTrackList();
}

function renderMobileTrackList() {
  if (!els.mobileTrackList) return;
  els.mobileTrackList.innerHTML = '';
  const tracksToRender = state.currentRoute === 'last' ? getLastListeningTracks() : state.filteredQueue;
  
  if (state.currentRoute === 'last' && tracksToRender.length === 0) {
    els.mobileTrackList.innerHTML = '<div class="mobile-track-empty">Belum ada lagu yang diputar.</div>';
    return;
  }
  
  tracksToRender.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = 'mobile-track';
    el.dataset.trackId = t.id;
    
    const coverStyle = t.coverImg 
      ? `background-image: url(${escapeAttr(t.coverImg)})`
      : `background: linear-gradient(135deg, ${t.cover[0]}, ${t.cover[1]})`;
    
    el.innerHTML = `
      <div class="mobile-track__cover" style="${coverStyle}"></div>
      <div class="mobile-track__info">
        <div class="mobile-track__title">${escapeHtml(t.title)}</div>
        <div class="mobile-track__artist">${escapeHtml(t.artist)}</div>
      </div>
      <button class="mobile-track__more" type="button" aria-label="More">⋯</button>
    `;
    
    el.addEventListener('click', (e) => {
      if (e.target.closest('.mobile-track__more')) return;
      const realIndex = state.queue.findIndex((q) => q.id === t.id);
      if (realIndex >= 0) {
        loadIndex(realIndex);
        play();
      }
    });
    
    els.mobileTrackList.appendChild(el);
  });
  syncMobileActiveTrack();
}

function switchRoute(route) {
  state.currentRoute = route;
  
  // Update sidebar nav active state
  $$('.nav__item').forEach(el => {
    el.classList.toggle('nav__item--active', el.dataset.route === route);
  });
  
  // Update mobile nav active state
  $$('.mobile-nav__item').forEach(el => {
    el.classList.toggle('mobile-nav__item--active', el.dataset.route === route);
  });
  
  // Update tabs active state
  $$('.tab').forEach(el => {
    el.classList.toggle('tab--active', el.dataset.tab === route);
  });
  
  // Handle visibility of sections
  const hero = $('.hero');
  const mobileHero = $('.mobile-hero');
  const mobileTracks = $('.mobile-tracks');
  
  if (route === 'playlist') {
    // Show category selection
    if (hero) hero.style.display = 'none';
    if (mobileHero) mobileHero.style.display = 'none';
    if (mobileTracks) mobileTracks.style.display = 'none';
    if (els.trackList) els.trackList.style.display = 'none';
    if (els.categorySection) els.categorySection.hidden = false;
    if (els.playlistView) els.playlistView.hidden = true;
    state.currentCategory = null;
    renderCategoryCards();
  } else {
    // Show normal discover/last view
    if (hero) hero.style.display = '';
    if (mobileHero) mobileHero.style.display = '';
    if (mobileTracks) mobileTracks.style.display = '';
    if (els.trackList) els.trackList.style.display = '';
    if (els.categorySection) els.categorySection.hidden = true;
    if (els.playlistView) els.playlistView.hidden = true;
  }
  
  // Re-render track list based on route
  renderTrackList();
}

function syncMobileActiveTrack() {
  if (!els.mobileTrackList) return;
  const activeId = state.queue[state.index]?.id;
  $$('.mobile-track', els.mobileTrackList).forEach((el) => {
    el.classList.toggle('mobile-track--active', el.dataset.trackId === activeId);
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function loadIndex(i) {
  state.index = clamp(i, 0, state.queue.length - 1);
  const t = state.queue[state.index];
  setHeroForTrack(t);
  audio.src = t.src;
  audio.load();

  els.playerTitle.textContent = t.title;
  els.playerArtist.textContent = t.artist;
  setGradient(els.playerCover, t.cover);
  if (t.coverImg) {
    els.playerCover.style.backgroundImage = `url(${t.coverImg}), ${els.playerCover.style.background}`;
    els.playerCover.style.backgroundSize = 'cover, auto';
    els.playerCover.style.backgroundPosition = 'center, center';
  } else {
    els.playerCover.style.backgroundImage = '';
  }

  els.timeNow.textContent = '0:00';
  els.timeTotal.textContent = '0:00';
  els.seek.value = '0';

  state.lyrics = { mode: 'none', lines: [], activeIndex: -1 };
  renderLyricsEmpty(`Memuat lirik untuk: ${t.title}…`);
  void loadLyricsForTrack(t);

  syncActiveTrackUI();
  updateMobileUI(t);
}

function updateMobileUI(t) {
  // Update mobile hero
  if (els.mobileHeroTitle) els.mobileHeroTitle.textContent = t.title;
  if (els.mobileHeroArtist) els.mobileHeroArtist.textContent = t.artist;
  if (els.mobileHeroCover) {
    setGradient(els.mobileHeroCover, t.cover);
    if (t.coverImg) {
      els.mobileHeroCover.style.backgroundImage = `url(${t.coverImg})`;
      els.mobileHeroCover.style.backgroundSize = 'cover';
      els.mobileHeroCover.style.backgroundPosition = 'center';
    } else {
      els.mobileHeroCover.style.backgroundImage = '';
    }
  }
  
  // Update mobile mini player
  if (els.mobilePlayerTitle) els.mobilePlayerTitle.textContent = t.title;
  if (els.mobilePlayerArtist) els.mobilePlayerArtist.textContent = t.artist;
  if (els.mobilePlayerCover) {
    setGradient(els.mobilePlayerCover, t.cover);
    if (t.coverImg) {
      els.mobilePlayerCover.style.backgroundImage = `url(${t.coverImg})`;
      els.mobilePlayerCover.style.backgroundSize = 'cover';
      els.mobilePlayerCover.style.backgroundPosition = 'center';
    } else {
      els.mobilePlayerCover.style.backgroundImage = '';
    }
  }
}

function renderLyricsEmptyTo(hintEl, linesEl, msg) {
  if (!hintEl || !linesEl) return;
  hintEl.textContent = msg;
  hintEl.hidden = false;
  linesEl.hidden = true;
  linesEl.innerHTML = '';
}

function renderLyricsLinesTo(hintEl, linesEl, lines, activeIndex = -1, cls = 'ly', activeCls = 'ly--active') {
  if (!hintEl || !linesEl) return;
  hintEl.hidden = true;
  linesEl.hidden = false;
  linesEl.innerHTML = '';
  lines.forEach((ln, idx) => {
    const div = document.createElement('div');
    div.className = cls + (idx === activeIndex ? ` ${activeCls}` : '');
    div.textContent = ln.text;
    linesEl.appendChild(div);
  });
}

function renderLyricsEmpty(msg) {
  renderLyricsEmptyTo(els.lyricsHint, els.lyricsLines, msg);
  renderLyricsEmptyTo(els.heroLyricsHint, els.heroLyricsLines, msg);
}

function renderLyricsLines(lines, activeIndex = -1) {
  renderLyricsLinesTo(els.lyricsHint, els.lyricsLines, lines, activeIndex, 'ly', 'ly--active');
  renderLyricsLinesTo(els.heroLyricsHint, els.heroLyricsLines, lines, activeIndex, 'hly', 'hly--active');
}

async function fetchTextMaybe(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseLrc(text) {
  const lines = [];
  const raw = String(text || '').split(/\r?\n/);
  for (const row of raw) {
    // Support multiple timestamps per line
    const matches = [...row.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
    const content = row.replace(/\[(\d+):(\d+(?:\.\d+)?)\]/g, '').trim();
    if (!matches.length) continue;
    for (const m of matches) {
      const mm = Number(m[1]);
      const ss = Number(m[2]);
      const t = mm * 60 + ss;
      if (Number.isFinite(t) && content) lines.push({ t, text: content });
    }
  }
  lines.sort((a, b) => a.t - b.t);
  return lines;
}

function parsePlainLines(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((s) => s.trimEnd())
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ text: s }));
}

function autoTimeLines(plainLines, duration) {
  const n = plainLines.length;
  if (!n || !Number.isFinite(duration) || duration <= 0) return [];

  const start = 0.25;
  const end = Math.max(start + 0.25, duration - 0.75);
  const step = n === 1 ? 0 : (end - start) / (n - 1);
  return plainLines.map((ln, i) => ({ t: start + step * i, text: ln.text }));
}

function maybeEnableAutoTimedLyrics() {
  if (state.lyrics.mode !== 'txt') return;
  if (!state.lyrics.lines.length) return;
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

  const timed = autoTimeLines(state.lyrics.lines, audio.duration);
  if (!timed.length) return;

  state.lyrics = { mode: 'lrc', lines: timed, activeIndex: -1, auto: true };
  renderLyricsLines(timed, -1);
  syncActiveLyric();
}

async function loadLyricsForTrack(track) {
  // Note: We can't provide copyrighted lyrics. This loads user-supplied lyrics files.
  const lrc = await fetchTextMaybe(track.lyricsLrc);
  if (lrc) {
    const parsed = parseLrc(lrc);
    if (parsed.length) {
      state.lyrics = { mode: 'lrc', lines: parsed, activeIndex: -1 };
      renderLyricsLines(parsed, -1);
      return;
    }

    // If .lrc exists but has no timestamps, treat it as plain text.
    const plain = parsePlainLines(lrc);
    if (plain.length) {
      state.lyrics = { mode: 'txt', lines: plain, activeIndex: -1 };
      renderLyricsLines(plain, -1);
      maybeEnableAutoTimedLyrics();
      return;
    }
  }

  const txt = await fetchTextMaybe(track.lyricsTxt);
  if (txt) {
    const parsed = parsePlainLines(txt);
    state.lyrics = { mode: 'txt', lines: parsed, activeIndex: -1 };
    renderLyricsLines(parsed, -1);
    maybeEnableAutoTimedLyrics();
    return;
  }

  renderLyricsEmpty(
    `Lirik belum ada. Taruh file lirik di:\n${track.lyricsLrc}\natau\n${track.lyricsTxt}`
  );
}

function syncActiveLyric() {
  if (state.lyrics.mode !== 'lrc' || !state.lyrics.lines.length) return;
  const t = audio.currentTime;
  let idx = -1;
  for (let i = 0; i < state.lyrics.lines.length; i++) {
    if (state.lyrics.lines[i].t <= t) idx = i;
    else break;
  }
  if (idx === state.lyrics.activeIndex) return;
  state.lyrics.activeIndex = idx;
  renderLyricsLines(state.lyrics.lines, idx);

  // Keep active line in view.
  const elA = els.lyricsLines?.children?.[idx];
  if (elA && typeof elA.scrollIntoView === 'function') elA.scrollIntoView({ block: 'nearest' });
  const elB = els.heroLyricsLines?.children?.[idx];
  if (elB && typeof elB.scrollIntoView === 'function') elB.scrollIntoView({ block: 'nearest' });
}

function syncActiveTrackUI() {
  const activeId = state.queue[state.index]?.id;
  $$('.track', els.trackList).forEach((el) => {
    el.classList.toggle('track--active', el.dataset.trackId === activeId);
  });
}

async function play() {
  try {
    await audio.play();
    state.isPlaying = true;
    els.btnPlay.textContent = '❚❚';
    updateMobilePlayButtons();
    syncMobileActiveTrack();
    
    // Add to last listening history
    const currentTrack = state.queue[state.index];
    if (currentTrack) {
      addToLastListening(currentTrack.id);
    }
  } catch (e) {
    // iOS/Safari will block autoplay; requires a user gesture.
    state.isPlaying = false;
    els.btnPlay.textContent = '▶';
    updateMobilePlayButtons();
  }
}

function pause() {
  audio.pause();
  state.isPlaying = false;
  els.btnPlay.textContent = '▶';
  updateMobilePlayButtons();
}

function togglePlay() {
  if (audio.paused) play();
  else pause();
}

function next() {
  const nextIndex = (state.index + 1) % state.queue.length;
  loadIndex(nextIndex);
  play();
}

function prev() {
  const prevIndex = (state.index - 1 + state.queue.length) % state.queue.length;
  loadIndex(prevIndex);
  play();
}

function shuffleQueue() {
  // Fisher-Yates shuffle
  const arr = state.queue.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  state.queue = arr;
  state.filteredQueue = arr.slice();
  renderTrackList();
}

function updateMobilePlayButtons() {
  const icon = state.isPlaying ? '⏸' : '▶';
  if (els.mobilePlayBtn) {
    const iconEl = els.mobilePlayBtn.querySelector('.mobile-btn__icon');
    if (iconEl) iconEl.textContent = icon;
  }
  if (els.mobilePlayerPlayBtn) {
    els.mobilePlayerPlayBtn.textContent = icon;
  }
}

function openSidebar() {
  els.sidebar.classList.add('sidebar--open');
  els.overlay.hidden = false;
}

function closeSidebar() {
  els.sidebar.classList.remove('sidebar--open');
  els.overlay.hidden = true;
}

function closeSidebarIfMobile() {
  closeSidebar();
}

function applySearch(q) {
  const query = String(q || '').trim().toLowerCase();
  if (!query) {
    state.filteredQueue = state.queue.slice();
    renderTrackList();
    return;
  }
  state.filteredQueue = state.queue.filter((t) => {
    return (t.title + ' ' + t.artist).toLowerCase().includes(query);
  });
  renderTrackList();
}

function scrollerBy(el, dir = 1) {
  const amount = el.clientWidth * 0.85;
  el.scrollBy({ left: amount * dir, behavior: 'smooth' });
}

function bindEvents() {
  // Sidebar
  els.openSidebar.addEventListener('click', openSidebar);
  els.collapseSidebar.addEventListener('click', closeSidebarIfMobile);
  els.overlay.addEventListener('click', closeSidebar);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // Player
  els.btnPlay.addEventListener('click', togglePlay);
  els.btnNext.addEventListener('click', next);
  els.btnPrev.addEventListener('click', prev);

  els.seek.addEventListener('input', () => {
    state.isSeeking = true;
  });
  els.seek.addEventListener('change', () => {
    const pct = Number(els.seek.value) / 100;
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = pct * audio.duration;
    }
    state.isSeeking = false;
  });

  els.volume.addEventListener('input', () => {
    const v = Number(els.volume.value);
    audio.volume = clamp(v, 0, 1);
    if (audio.volume > 0) state.lastVolume = audio.volume;
    els.btnMute.textContent = audio.volume === 0 ? '🔇' : '🔊';
  });

  els.btnMute.addEventListener('click', () => {
    if (audio.volume === 0) {
      audio.volume = state.lastVolume || 0.85;
    } else {
      state.lastVolume = audio.volume;
      audio.volume = 0;
    }
    els.volume.value = String(audio.volume);
    els.btnMute.textContent = audio.volume === 0 ? '🔇' : '🔊';
  });

  audio.addEventListener('timeupdate', () => {
    if (state.isSeeking) return;
    els.timeNow.textContent = formatTime(audio.currentTime);
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      els.seek.value = String((audio.currentTime / audio.duration) * 100);
    }
    syncActiveLyric();
  });

  audio.addEventListener('loadedmetadata', () => {
    els.timeTotal.textContent = formatTime(audio.duration);
    maybeEnableAutoTimedLyrics();
  });

  audio.addEventListener('ended', next);

  audio.addEventListener('error', () => {
    // Most common case: assets not found (404) when audio files aren't placed yet.
    pause();
    const t = state.queue[state.index];
    els.timeTotal.textContent = '0:00';
    // Keep it simple: alert once per click attempt.
    // eslint-disable-next-line no-alert
    alert(
      `File audio tidak ditemukan atau format tidak didukung.\n\nPastikan ada file:\n${t.src}\n\nLihat assets/README.md untuk nama file yang benar.`
    );
  });

  // Hero
  els.heroPlay.addEventListener('click', () => {
    const idx = state.queue.findIndex((t) => t.id === db.featured.trackId);
    if (idx >= 0) loadIndex(idx);
    setUiMode('track');
    play();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Sidebar nav items
  $$('.nav__item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const route = item.dataset.route;
      if (route) {
        switchRoute(route);
        closeSidebarIfMobile();
      }
    });
  });

  // Tabs
  $$('.tab').forEach((b) => {
    b.addEventListener('click', () => {
      const route = b.dataset.tab;
      if (route) {
        switchRoute(route);
      }
    });
  });

  // Back to categories button
  if (els.backToCategories) {
    els.backToCategories.addEventListener('click', () => {
      state.currentCategory = null;
      if (els.categorySection) els.categorySection.hidden = false;
      if (els.playlistView) els.playlistView.hidden = true;
    });
  }

  // Mobile nav items
  $$('.mobile-nav__item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const route = item.dataset.route;
      if (route) {
        switchRoute(route);
      }
    });
  });

  // Search
  let t = null;
  els.searchInput.addEventListener('input', () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => applySearch(els.searchInput.value), 80);
  });

  // Mobile search
  if (els.mobileSearchInput) {
    let mt = null;
    els.mobileSearchInput.addEventListener('input', () => {
      window.clearTimeout(mt);
      mt = window.setTimeout(() => {
        applySearch(els.mobileSearchInput.value);
      }, 80);
    });
  }

  // Mobile play button
  if (els.mobilePlayBtn) {
    els.mobilePlayBtn.addEventListener('click', () => {
      togglePlay();
    });
  }

  // Mobile shuffle button
  if (els.mobileShuffleBtn) {
    els.mobileShuffleBtn.addEventListener('click', () => {
      shuffleQueue();
      loadIndex(0);
      play();
    });
  }

  // Mobile mini player buttons
  if (els.mobilePlayerPlayBtn) {
    els.mobilePlayerPlayBtn.addEventListener('click', togglePlay);
  }
  if (els.mobilePlayerNextBtn) {
    els.mobilePlayerNextBtn.addEventListener('click', next);
  }

  // Improve iOS: unlock audio on first interaction
  const unlock = async () => {
    try {
      // Play/pause a silent tick to allow subsequent play.
      const tmp = new Audio(makeWavDataUrl({ freq: 1, seconds: 0.08, gain: 0.0 }));
      await tmp.play();
      tmp.pause();
    } catch {}
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
}

function showWelcome() {
  const welcomeScreen = $('#welcomeScreen');
  const app = $('#app');
  const startBtn = $('#welcomeStart');

  // Check if user has visited before
  if (localStorage.getItem('weave_welcomed')) {
    welcomeScreen.classList.add('hide');
    setTimeout(() => welcomeScreen.remove(), 500);
    app.hidden = false;
    return;
  }

  startBtn.addEventListener('click', () => {
    localStorage.setItem('weave_welcomed', 'true');
    welcomeScreen.classList.add('hide');
    setTimeout(() => welcomeScreen.remove(), 500);
    app.hidden = false;
  });
}

function init() {
  loadLastListening();
  showWelcome();
  setHero();
  setUiMode('discover');
  renderTrackList();

  audio.volume = state.lastVolume;
  els.volume.value = String(audio.volume);

  loadIndex(0);
  bindEvents();
}

init();
