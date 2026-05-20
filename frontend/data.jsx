// data.jsx — feature catalogue + theme tokens + glyph icons.
// Exposed on window for sibling Babel scripts.

// ─── Theme tokens ────────────────────────────────────────────────────────
const THEMES = {
  light: {
    '--tg-bg': '#ffffff',
    '--tg-text': '#000000',
    '--tg-hint': '#9aa0a8',
    '--tg-link': '#2481cc',
    '--tg-button': '#2481cc',
    '--tg-button-text': '#ffffff',
    '--tg-secondary-bg': '#eff1f5',
    '--tg-header-bg': '#f7f8fa',
    '--tg-bottom-bar-bg': '#ffffff',
    '--tg-accent': '#2481cc',
    '--tg-section-bg': '#ffffff',
    '--tg-section-header-text': '#6d6d72',
    '--tg-section-separator': '#e6e6eb',
    '--tg-subtitle-text': '#8e8e93',
    '--tg-destructive-text': '#ff3b30',
    '--tg-card-shadow': '0 1px 0 rgba(15,17,20,0.04), 0 4px 18px rgba(15,17,20,0.06)',
    '--tg-card-border': 'rgba(15,17,20,0.06)',
    '--tg-glass-bg': 'rgba(255,255,255,0.72)',
    '--tg-stage-1': '#eef1f6',
    '--tg-stage-2': '#dfe4ec',
    '--tg-mode': 'light',
  },
  dark: {
    '--tg-bg': '#15171b',
    '--tg-text': '#ffffff',
    '--tg-hint': '#8b9099',
    '--tg-link': '#62bcf9',
    '--tg-button': '#2ea6ff',
    '--tg-button-text': '#ffffff',
    '--tg-secondary-bg': '#0c0d10',
    '--tg-header-bg': '#0c0d10',
    '--tg-bottom-bar-bg': '#15171b',
    '--tg-accent': '#62bcf9',
    '--tg-section-bg': '#1d2026',
    '--tg-section-header-text': '#9098a5',
    '--tg-section-separator': 'rgba(255,255,255,0.08)',
    '--tg-subtitle-text': '#7d8590',
    '--tg-destructive-text': '#ff6f5f',
    '--tg-card-shadow': '0 1px 0 rgba(0,0,0,0.35), 0 6px 22px rgba(0,0,0,0.32)',
    '--tg-card-border': 'rgba(255,255,255,0.06)',
    '--tg-glass-bg': 'rgba(28,30,36,0.72)',
    '--tg-stage-1': '#0a0b0e',
    '--tg-stage-2': '#1a1d22',
    '--tg-mode': 'dark',
  },
  coral: {
    '--tg-bg': '#fffaf6',
    '--tg-text': '#23130b',
    '--tg-hint': '#a08574',
    '--tg-link': '#e85c6f',
    '--tg-button': '#e85c6f',
    '--tg-button-text': '#ffffff',
    '--tg-secondary-bg': '#fbede5',
    '--tg-header-bg': '#fbede5',
    '--tg-bottom-bar-bg': '#fffaf6',
    '--tg-accent': '#e85c6f',
    '--tg-section-bg': '#ffffff',
    '--tg-section-header-text': '#8a6453',
    '--tg-section-separator': '#f1ddd0',
    '--tg-subtitle-text': '#a08574',
    '--tg-destructive-text': '#d6332c',
    '--tg-card-shadow': '0 1px 0 rgba(80,30,15,0.04), 0 6px 22px rgba(80,30,15,0.07)',
    '--tg-card-border': 'rgba(80,30,15,0.07)',
    '--tg-glass-bg': 'rgba(255,250,246,0.78)',
    '--tg-stage-1': '#f6e2d4',
    '--tg-stage-2': '#e9c4b1',
    '--tg-mode': 'light',
  },
};

function applyTheme(name) {
  const t = THEMES[name] || THEMES.light;
  const root = document.documentElement;
  Object.entries(t).forEach(([k, v]) => root.style.setProperty(k, v));
  root.dataset.tgMode = t['--tg-mode'];
}

// ─── Glyph icons (minimal SVG, currentColor) ─────────────────────────────
const GLYPHS = {
  user:    'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8.4c0-3.2 3.1-5.4 7-5.4s7 2.2 7 5.4V21H5v-.6z',
  theme:   'M12 4a8 8 0 100 16V4z M12 4a8 8 0 010 16',
  cpu:     'M9 4h6v3h3v3h3v4h-3v3h-3v3h-6v-3H6v-3H3v-4h3V7h3V4zm0 5v6h6V9H9z',
  view:    'M5 5h14v14H5V5zm2 2v10h10V7H7z',
  swipe:   'M7 7l5 5 5-5M7 12l5 5 5-5',
  fs:      'M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm14 0h2v6h-6v-2h4v-4z',
  safe:    'M5 5h14v14H5V5zm2 2v10h10V7H7zm2 2h6v6H9V9z',
  lock:    'M12 3a4 4 0 014 4v3h1a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8a2 2 0 012-2h1V7a4 4 0 014-4zm0 2a2 2 0 00-2 2v3h4V7a2 2 0 00-2-2z',
  main:    'M3 11h18v2H3v-2z M3 8h18v2H3V8z',
  second:  'M3 11h12v2H3v-2zm0-3h12v2H3V8z',
  back:    'M11 5l-7 7 7 7M4 12h17',
  gear:    'M12 8a4 4 0 100 8 4 4 0 000-8zm9 4l-2-1 1-3-2-2-3 1-1-2h-4l-1 2-3-1-2 2 1 3-2 1v4l2 1-1 3 2 2 3-1 1 2h4l1-2 3 1 2-2-1-3 2-1v-4z',
  palette: 'M12 3a9 9 0 109 9c0-2-2-3-4-3h-2a2 2 0 110-4c2 0 3-1 3-2a9 9 0 00-6 0z',
  pulse:   'M3 12h4l3-9 4 18 3-9h4',
  cloud:   'M7 19h11a4 4 0 100-8 6 6 0 00-11.6-1A4 4 0 007 19z',
  device:  'M6 4h12v16H6V4zm2 2v10h8V6H8zm3 12h2v1h-2v-1z',
  vault:   'M5 5h14v14H5V5zm9 7a2 2 0 11-4 0 2 2 0 014 0zm0 0v3',
  cube:    'M12 3l8 4v10l-8 4-8-4V7l8-4zm0 2L6 8v8l6 3 6-3V8l-6-3z',
  compass: 'M12 3a9 9 0 110 18 9 9 0 010-18zm3.5 5.5L13 13l-4.5 2.5L11 11l4.5-2.5z',
  horizon: 'M3 12h18M3 9l4 3-4 3M21 9l-4 3 4 3',
  pin:     'M12 3a7 7 0 017 7c0 5-7 11-7 11s-7-6-7-11a7 7 0 017-7zm0 4a3 3 0 100 6 3 3 0 000-6z',
  share:   'M14 4l6 6-6 6v-3H8a4 4 0 00-4 4v1c0-5 4-9 8-9h2V4z',
  story:   'M12 3a9 9 0 100 18 9 9 0 000-18zm0 3a6 6 0 110 12 6 6 0 010-12z',
  download:'M12 3v10m0 0l-4-4m4 4l4-4M5 17v2h14v-2',
  msg:     'M4 5h16v11H8l-4 4V5zm2 2v10l1.5-1.5H18V7H6z',
  star:    'M12 3l2.8 6 6.2.9-4.5 4.3 1.1 6.3L12 17.5 6.4 20.5l1.1-6.3L3 9.9l6.2-.9L12 3z',
  gift:    'M5 9h14v3H5V9zm1 4h12v8H6v-8zm5-7a2 2 0 100 4 2 2 0 000-4zm2 0a2 2 0 100 4 2 2 0 000-4zm-1 3v15',
  home:    'M4 11l8-7 8 7v9h-6v-6h-4v6H4v-9z',
  emoji:   'M12 3a9 9 0 110 18 9 9 0 010-18zm-3 7a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zm6 0a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zM8 14c1 2 3 3 4 3s3-1 4-3',
  qr:      'M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm9-2h2v2h-2v-2zm4 0h3v3h-3v-3zm-4 4h2v3h-2v-3zm4 1h3v2h-3v-2z',
  clip:    'M9 4h6v3h3v14H6V7h3V4zm2 2v3h2V6h-2z',
  contact: 'M8 7a4 4 0 118 0 4 4 0 01-8 0zm-4 13c0-4 4-7 8-7s8 3 8 7v1H4v-1z',
  write:   'M5 19V5h9v2H7v10h10v-7h2v9H5z M14 4l6 6-9 9-3 .5L8 16l6-12z',
  popup:   'M4 5h16v10h-7l-4 4v-4H4V5zm2 2v6h13V7H6z',
  eye:     'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z',
  echo:    'M12 8v8m-4-6v4m8-4v4M4 10v4m16-4v4',
  premium: 'M12 2l2.5 5 5.5.5-4 4 1 5.5L12 14l-5 3 1-5.5-4-4 5.5-.5L12 2z',
  shield:  'M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3zm0 6a2.5 2.5 0 100 5 2.5 2.5 0 000-5z',
  bldg:    'M5 21V5h14v16H5zm2-2h4v-4h2v4h4V7H7v12zm2-9h2V8H9v2zm4 0h2V8h-2v2zm-4 4h2v-2H9v2zm4 0h2v-2h-2v2z',
  sparkle: 'M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5zm7 11l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2zM5 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z',
  link:    'M10 14a3 3 0 010-4l3-3a3 3 0 014 4l-1 1m-3 2a3 3 0 01-4 0l-3-3a3 3 0 010-4l1-1',
  side:    'M3 4h6v16H3V4zm8 0h10v6H11V4zm0 8h10v8H11v-8z',
  paid:    'M5 6h14v12H5V6zm2 2v8h10V8H7zm3 4a2 2 0 104 0 2 2 0 00-4 0z',
};

function Glyph({ name, size = 18, stroke = false, style }) {
  const d = GLYPHS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}
         fill={stroke ? 'none' : 'currentColor'}
         stroke={stroke ? 'currentColor' : 'none'}
         strokeWidth={stroke ? 1.8 : 0}
         strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// Category icon: gradient blob with glyph.
function CatIcon({ hue, glyph, size = 36, stroke = false }) {
  const bg = `linear-gradient(135deg, oklch(0.78 0.16 ${hue}), oklch(0.62 0.18 ${hue + 18}))`;
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32,
      background: bg, color: '#fff',
      display: 'grid', placeItems: 'center', flexShrink: 0,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), 0 1px 2px oklch(0.5 0.18 ${hue} / 0.3)`,
    }}>
      <Glyph name={glyph} size={size * 0.55} stroke={stroke} />
    </div>
  );
}

// ─── Catalogue: 50+ demos across 16 categories (v2.0) ───────────────────
// state: 'new' | 'opened' | 'completed' | 'unsupported'
// demoId: opens a hero demo when set; otherwise stub state is shown.
// showCount: advertised v2 demo count for the category — drives the badge.
// More cards exist in v2 than we enumerate; the count communicates breadth.

const CATEGORIES = [
  {
    id: 'identity', title: 'Identity & Theme', hue: 215, glyph: 'user',
    subtitle: 'Who I am, what platform, what theme',
    showCount: 3,
    cards: [
      { id: 'who',       title: 'Who am I',           subtitle: 'Verified by the host', glyph: 'user',    state: 'completed', demoId: 'who' },
      { id: 'theme',     title: 'Dynamic theme',      subtitle: 'Light / dark morph',   glyph: 'theme',   state: 'completed', stroke: true, demoId: 'theme' },
      { id: 'platform',  title: 'Platform & version', subtitle: 'Capability chips',     glyph: 'cpu',     state: 'new', demoId: 'platform' },
    ],
  },
  {
    id: 'launch', title: 'Launch Methods', hue: 265, glyph: 'link',
    subtitle: 'Seven ways the viewer arrives here',
    showCount: 7, stroke: true,
    cards: [
      { id: 'launch-direct',  title: 'How you got here', subtitle: 'Detects all 7 entry points', glyph: 'link',  state: 'opened', demoId: 'launch', hero: false, stroke: true },
      { id: 'splash',         title: 'Custom splash',    subtitle: 'botAppSettings preview',     glyph: 'palette', state: 'new', demoId: 'splash' },
      { id: 'preview-medias', title: 'Bot preview',      subtitle: 'Mini App Store carousel',    glyph: 'story',  state: 'new', stroke: true, demoId: 'preview-medias' },
      { id: 'store-tile',     title: 'Store entry',      subtitle: 'Telegram catalog tile',      glyph: 'home',   state: 'new', demoId: 'store-tile' },
    ],
  },
  {
    id: 'viewport', title: 'Viewport & Safe Area', hue: 175, glyph: 'view',
    subtitle: 'Stable height, fullscreen, insets',
    showCount: 6,
    cards: [
      { id: 'vp',     title: 'Viewport meter',  subtitle: 'Live height readout',      glyph: 'view',  state: 'new', demoId: 'vp' },
      { id: 'swipe',  title: 'Vertical swipes', subtitle: 'Protect accidental close', glyph: 'swipe', state: 'new', stroke: true, demoId: 'swipe' },
      { id: 'fs',     title: 'Fullscreen',      subtitle: 'Enter / exit',             glyph: 'fs',    state: 'new', demoId: 'fs' },
      { id: 'safe',   title: 'Safe Area',       subtitle: 'Inset visualizer',         glyph: 'safe',  state: 'new', demoId: 'safe' },
      { id: 'rot',    title: 'Lock orientation', subtitle: 'Pin to portrait',         glyph: 'lock',  state: 'new', demoId: 'rot' },
    ],
  },
  {
    id: 'buttons', title: 'Buttons & Navigation', hue: 250, glyph: 'main',
    subtitle: 'Native CTAs and chrome',
    showCount: 4,
    cards: [
      { id: 'mb',       title: 'MainButton lab',     subtitle: 'Color · shine · progress', glyph: 'main',   state: 'opened', demoId: 'mb' },
      { id: 'sb',       title: 'SecondaryButton lab', subtitle: 'Slides between 4 slots',  glyph: 'second', state: 'new', demoId: 'sb' },
      { id: 'settings', title: 'Settings sheet',     subtitle: 'Bottom-sheet host menu',   glyph: 'gear',   state: 'new', demoId: 'settings' },
      { id: 'chrome',   title: 'Chrome colors',      subtitle: 'Header · bar · background', glyph: 'palette', state: 'new', demoId: 'chrome' },
    ],
  },
  {
    id: 'haptics', title: 'Haptics & Sound', hue: 22, glyph: 'pulse',
    subtitle: 'Feel the rhythm of the platform',
    showCount: 1,
    cards: [
      { id: 'haptic-lab', title: 'Haptic Lab', subtitle: '9 pads · 8-step sequencer', glyph: 'pulse', state: 'new', demoId: 'haptic', hero: true },
    ],
  },
  {
    id: 'gifts', title: 'Gifts & Stars', hue: 305, glyph: 'gift',
    subtitle: 'Collectible NFT gifts, paid reactions, TON',
    showCount: 22, isHeroCategory: true,
    cards: [
      { id: 'collectible', title: 'Collectible Gifts', subtitle: 'Pattern · backdrop · model', glyph: 'sparkle', state: 'new', demoId: 'collectible', hero: true },
      { id: 'get-gift',    title: 'Get a gift',         subtitle: 'Pick from the catalog',      glyph: 'gift',    state: 'new', demoId: 'get-gift' },
      { id: 'upgrade-gift', title: 'Upgrade gift', subtitle: 'Plain → crystal morph',     glyph: 'sparkle', state: 'new', demoId: 'upgrade-gift', stroke: true },
      { id: 'transfer-gift', title: 'Transfer gift', subtitle: 'Send to a friend',         glyph: 'share',   state: 'new', demoId: 'transfer-gift' },
      { id: 'resell-gift',   title: 'Resell',         subtitle: 'Marketplace · filters',    glyph: 'paid',    state: 'new', demoId: 'resell-gift' },
      { id: 'withdraw-ton',  title: 'Withdraw to TON', subtitle: 'On-chain export · QR',    glyph: 'download', state: 'new', demoId: 'withdraw-ton', stroke: true },
      { id: 'emoji-status-gift', title: 'Status from gift', subtitle: 'Use as emoji status', glyph: 'emoji', state: 'new', demoId: 'emoji-status-gift' },
      { id: 'chat-theme-gift',  title: 'Chat theme',   subtitle: 'Recolor chat from gift',  glyph: 'palette', state: 'new', demoId: 'chat-theme-gift' },
      { id: 'gift-collections', title: 'Collections',  subtitle: 'Group into buckets',      glyph: 'vault',   state: 'new', demoId: 'gift-collections' },
      { id: 'pin-gifts',     title: 'Pin gifts',      subtitle: 'Show first on profile',     glyph: 'pin',    state: 'new', demoId: 'pin-gifts', stroke: true },
      { id: 'channel-gifts', title: 'Channel gifts',  subtitle: 'Post · claim first',        glyph: 'share',  state: 'new', demoId: 'channel-gifts', stroke: true },
      { id: 'birthday-gift', title: 'Birthday gift',  subtitle: 'Special state · 🎂',       glyph: 'gift',    state: 'new', demoId: 'birthday-gift' },
      { id: 'star-rating',   title: 'Star rating',    subtitle: 'Monthly leaderboard',     glyph: 'star',    state: 'new', demoId: 'star-rating' },
      { id: 'star-pack',     title: 'Subs · Refs · Giveaways', subtitle: 'Three Stars stats', glyph: 'star', state: 'new', demoId: 'star-pack' },
      { id: 'stars',       title: 'Send a Star',       subtitle: '1 Star · auto-refund',     glyph: 'star',   state: 'new', demoId: 'payment' },
      { id: 'paid-msg',    title: 'Paid messages',     subtitle: '1 ⭐ to read a DM',         glyph: 'paid',   state: 'new', demoId: 'paid-msg' },
      { id: 'paid-media',  title: 'Paid media',        subtitle: 'Pay to unlock a photo',    glyph: 'eye',    state: 'new', demoId: 'paid-media' },
      { id: 'suggested-posts', title: 'Suggested posts', subtitle: 'Pay-to-publish in channel', glyph: 'msg', state: 'new', demoId: 'suggested-posts' },
      { id: 'ton',         title: 'Stars ↔ TON',       subtitle: 'Same gift, two currencies', glyph: 'star',  state: 'new', stroke: true, demoId: 'ton-toggle' },
    ],
  },
  {
    id: 'storage', title: 'Storage', hue: 200, glyph: 'cloud',
    subtitle: 'Cloud, device, secure — inspect live',
    showCount: 3,
    cards: [
      { id: 'cloud',   title: 'CloudStorage',  subtitle: '1024 keys · 4 KB each',  glyph: 'cloud',  state: 'new', demoId: 'storage' },
      { id: 'device',  title: 'DeviceStorage', subtitle: 'Local · up to 5 MB',     glyph: 'device', state: 'new' },
      { id: 'secure',  title: 'SecureStorage', subtitle: '10 items · Keychain',    glyph: 'vault',  state: 'new' },
    ],
  },
  {
    id: 'biometrics', title: 'Biometrics', hue: 290, glyph: 'vault',
    subtitle: 'Face / finger / PIN fallback',
    showCount: 1,
    cards: [
      { id: 'vault', title: 'The Vault', subtitle: 'Unlock with Face or finger', glyph: 'vault', state: 'new', demoId: 'biometrics', hero: true },
    ],
  },
  {
    id: 'sensors', title: 'Sensors', hue: 145, glyph: 'cube',
    subtitle: 'Accelerometer · gyro · orientation',
    showCount: 3,
    cards: [
      { id: 'cube',    title: '3D Cube',  subtitle: 'Accelerometer tilt',  glyph: 'cube',    state: 'new', demoId: 'sensors' },
      { id: 'compass', title: 'Compass',  subtitle: 'Gyroscope',           glyph: 'compass', state: 'new', demoId: 'compass' },
      { id: 'horizon', title: 'Horizon',  subtitle: 'Pitch & roll',        glyph: 'horizon', state: 'new', stroke: true, demoId: 'horizon' },
    ],
  },
  {
    id: 'reactions', title: 'Reactions & Age', hue: 25, glyph: 'sparkle',
    subtitle: 'Paid reactions, age-gated content',
    showCount: 2,
    cards: [
      { id: 'paid-reactions', title: 'Paid reactions', subtitle: 'Stars counter · shimmer', glyph: 'sparkle', state: 'new', demoId: 'reactions' },
      { id: 'age-gate',       title: 'Age verification', subtitle: 'Native gate · 18+',     glyph: 'shield',  state: 'new', stroke: true, demoId: 'age' },
    ],
  },
  {
    id: 'location', title: 'Location', hue: 12, glyph: 'pin',
    subtitle: 'Pin on map with accuracy & speed',
    showCount: 1,
    cards: [
      { id: 'where', title: 'Where are you?', subtitle: 'Map · accuracy · speed', glyph: 'pin', state: 'new', demoId: 'where' },
    ],
  },
  {
    id: 'business', title: 'Business', hue: 130, glyph: 'bldg',
    subtitle: 'Hours, location, quick replies',
    showCount: 7,
    cards: [
      { id: 'biz-profile', title: 'Business profile', subtitle: 'All 7 surfaces in one screen', glyph: 'bldg', state: 'new', demoId: 'business', hero: true },
    ],
  },
  {
    id: 'share', title: 'Share & Stories', hue: 320, glyph: 'share',
    subtitle: 'Stories, messages, downloads',
    showCount: 4,
    cards: [
      { id: 's-story',   title: 'Share to Story', subtitle: 'Generate a 1080×1920 card', glyph: 'story',    state: 'new', stroke: true, demoId: 's-story' },
      { id: 's-msg',     title: 'Share message',  subtitle: 'Native "send to" sheet',   glyph: 'msg',      state: 'new', demoId: 's-msg' },
      { id: 's-dl',      title: 'Download file',  subtitle: 'Personalized wallpaper',   glyph: 'download', state: 'new', stroke: true, demoId: 's-dl' },
      { id: 's-inline',  title: 'Switch inline',  subtitle: 'Open in any chat',         glyph: 'share',    state: 'new', demoId: 's-inline' },
    ],
  },
  {
    id: 'system', title: 'System integrations', hue: 95, glyph: 'home',
    subtitle: 'Home screen, scan QR, share contact',
    showCount: 11,
    cards: [
      { id: 'homescr', title: 'Home Screen',  subtitle: '5 states · incl. failed', glyph: 'home',  state: 'new', demoId: 'homescr' },
      { id: 'rpc',     title: 'Custom RPC',   subtitle: 'invokeCustomMethod',     glyph: 'cpu',   state: 'new', demoId: 'rpc' },
      { id: 'ton',     title: 'TON Site',     subtitle: 'tonsite:// embed',       glyph: 'link',  state: 'new', demoId: 'ton', stroke: true },
      { id: 'hide-kb', title: 'Hide keyboard', subtitle: 'Programmatic dismiss',  glyph: 'write', state: 'new', demoId: 'hide-kb' },
      { id: 'close-confirm', title: 'Closing confirmation', subtitle: 'Warn before discard', glyph: 'popup', state: 'new', demoId: 'close-confirm' },
      { id: 'qr',      title: 'QR scanner',   subtitle: 'Native camera scanner',  glyph: 'qr',    state: 'new', demoId: 'qr' },
      { id: 'clip',    title: 'Clipboard',    subtitle: 'Read with mask',         glyph: 'clip',  state: 'new', demoId: 'clip' },
      { id: 'write',   title: 'Write access', subtitle: 'Bot can DM you',         glyph: 'write', state: 'new', stroke: true, demoId: 'write' },
      { id: 'phone-only',  title: 'Phone only',   subtitle: 'Just the number, no vCard', glyph: 'contact', state: 'new', demoId: 'phone-only' },
      { id: 'tg-link',     title: 'Open Telegram link', subtitle: 't.me/… inline',       glyph: 'link',    state: 'new', demoId: 'tg-link', stroke: true },
      { id: 'browser-opts', title: 'Browser options', subtitle: 'IV + try_browser dropdown', glyph: 'compass', state: 'new', demoId: 'browser-opts' },
    ],
  },
  {
    id: 'realtime', title: 'Realtime', hue: 165, glyph: 'echo',
    subtitle: 'Multi-device — feel the connection',
    showCount: 2,
    cards: [
      { id: 'live',  title: 'Live viewer counter', subtitle: 'Right now N people…',     glyph: 'eye',  state: 'new', stroke: true, demoId: 'live' },
      { id: 'echo',  title: 'Haptic Echo',         subtitle: 'Tap here, vibrates there', glyph: 'echo', state: 'new', stroke: true, demoId: 'echo' },
    ],
  },
  {
    id: 'premium', title: 'Premium', hue: 280, glyph: 'premium',
    subtitle: 'Soft-gated for Telegram Premium users',
    showCount: 6,
    cards: [
      { id: 'emoji',     title: 'Emoji status',    subtitle: 'Set for 1 hour',       glyph: 'emoji',   state: 'new', premium: true, demoId: 'emoji-status' },
      { id: 'pr-promo',  title: 'Premium promo',   subtitle: 'Open the upgrade page', glyph: 'premium', state: 'new', premium: true, demoId: 'pr-promo' },
      { id: 'pr-limits', title: 'Double limits',   subtitle: 'Folders · pins · saved', glyph: 'sparkle', state: 'new', premium: true, stroke: true, demoId: 'pr-limits' },
      { id: 'voice',     title: 'Voice-to-text',   subtitle: 'Premium transcription',  glyph: 'pulse',   state: 'new', premium: true, demoId: 'voice' },
      { id: 'profile-vid', title: 'Profile videos', subtitle: 'Looping avatar',         glyph: 'story',   state: 'new', premium: true, demoId: 'profile-vid', stroke: true },
      { id: 'folder-tags', title: 'Folder tags',    subtitle: 'Colored chat folders',   glyph: 'palette', state: 'new', premium: true, demoId: 'folder-tags' },
    ],
  },
];

const TOTAL_DEMOS = CATEGORIES.reduce((n, c) => n + (c.showCount || c.cards.length), 0);

// ─── Launch modes — the 7 ways to enter a Mini App (Launch Methods cat) ──
const LAUNCH_MODES = [
  { id: 'mini-app',    title: 'Main Mini App link', subtitle: 't.me/<bot>?startapp=…',          emoji: '🔗' },
  { id: 'direct',      title: 'Direct Link',        subtitle: 't.me/<bot>/<short>?startapp=…',  emoji: '🎯' },
  { id: 'attach',      title: 'Attachment menu',    subtitle: 'startattach',                    emoji: '📎' },
  { id: 'side',        title: 'Side menu',          subtitle: 'Telegram side panel',            emoji: '📋' },
  { id: 'menu',        title: 'Menu button',        subtitle: 'Chat-level menu',                emoji: '☰' },
  { id: 'inline-btn',  title: 'Inline button',      subtitle: 'Inline keyboard',                emoji: '🔘' },
  { id: 'inline-mode', title: 'Inline mode',        subtitle: 'From an inline result',          emoji: '⌨️' },
];
const DEFAULT_LAUNCH_MODE = 'direct';

// ─── Collectible Gift presets — patterns / backdrops / models (3 variants)
const GIFT_PRESETS = {
  cosmic: {
    id: 'cosmic', name: 'Cosmic Crystal', num: '000234',
    center: '#2f4e8b', edge: '#0a1126',
    patternHue: 210, patternColor: 'rgba(180,210,255,0.55)',
    model: 'crystal', symbol: '✦',
  },
  ember: {
    id: 'ember', name: 'Eternal Ember', num: '000012',
    center: '#7a2415', edge: '#16060a',
    patternHue: 22, patternColor: 'rgba(255,200,150,0.55)',
    model: 'flame', symbol: '✸',
  },
  bloom: {
    id: 'bloom', name: 'Velvet Bloom', num: '001892',
    center: '#5b1a4e', edge: '#160520',
    patternHue: 320, patternColor: 'rgba(255,200,235,0.55)',
    model: 'bloom', symbol: '❋',
  },
};

// ─── Haptic vocabulary ──────────────────────────────────────────────────
// Visual ripple + label + navigator.vibrate pattern.
const HAPTICS = {
  light:     { label: 'light',     ms: 8,   color: 215, pulse: 1.0 },
  soft:      { label: 'soft',      ms: 12,  color: 200, pulse: 1.1 },
  medium:    { label: 'medium',    ms: 20,  color: 230, pulse: 1.2 },
  rigid:     { label: 'rigid',     ms: 32,  color: 250, pulse: 1.3 },
  heavy:     { label: 'heavy',     ms: 50,  color: 270, pulse: 1.5 },
  selection: { label: 'selection', ms: 6,   color: 175, pulse: 0.9 },
  success:   { label: 'success',   ms: [12, 30, 18], color: 145, pulse: 1.3 },
  warning:   { label: 'warning',   ms: [18, 40, 18, 40], color: 45,  pulse: 1.3 },
  error:     { label: 'error',     ms: [40, 30, 40, 30, 40], color: 18, pulse: 1.5 },
};

Object.assign(window, {
  THEMES, applyTheme, GLYPHS, Glyph, CatIcon, CATEGORIES, TOTAL_DEMOS, HAPTICS,
  LAUNCH_MODES, DEFAULT_LAUNCH_MODE, GIFT_PRESETS,
});
