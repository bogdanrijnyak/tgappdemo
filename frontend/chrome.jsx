// chrome.jsx — host header, MainButton, haptic system, scrolling shell.

// ─── Haptic context ──────────────────────────────────────────────────────
// Fires a visual ripple + label at a clientX/Y, optionally pulses the device
// (navigator.vibrate where available). Single global API: const tap = useHaptic();
// tap('soft', event)  — pass the source event, ripple positions at the tap.
// tap('soft', { x, y }) — explicit coordinates also accepted.

const HapticContext = React.createContext(() => {});
const useHaptic = () => React.useContext(HapticContext);

// Map our internal kinds to the Telegram WebApp.HapticFeedback API.
const TG_IMPACT_STYLES = new Set(['light', 'medium', 'heavy', 'rigid', 'soft']);
const TG_NOTIFICATION_TYPES = new Set(['error', 'success', 'warning']);

function fireTelegramHaptic(kind) {
  const tg = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback;
  if (!tg) return false;
  try {
    if (kind === 'selection') { tg.selectionChanged(); return true; }
    if (TG_NOTIFICATION_TYPES.has(kind)) { tg.notificationOccurred(kind); return true; }
    if (TG_IMPACT_STYLES.has(kind)) { tg.impactOccurred(kind); return true; }
    tg.impactOccurred('light');
    return true;
  } catch (e) { return false; }
}

function HapticProvider({ children, soundOn = false }) {
  const fire = React.useCallback((kind /*, eOrPos */) => {
    const h = HAPTICS[kind] || HAPTICS.light;
    // Prefer real Telegram haptics when the SDK is present (iOS / Android client).
    const tgFired = fireTelegramHaptic(kind);
    // Fallback for desktop / browser preview: Web Vibration API.
    if (!tgFired) {
      try { navigator.vibrate && navigator.vibrate(h.ms); } catch (e) { /* noop */ }
    }
    if (soundOn) {
      try {
        const ctx = HapticProvider._ac || (HapticProvider._ac = new (window.AudioContext || window.webkitAudioContext)());
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = 600 + h.pulse * 200;
        g.gain.value = 0.04;
        o.connect(g); g.connect(ctx.destination); o.start();
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
        o.stop(ctx.currentTime + 0.1);
      } catch (e) { /* noop */ }
    }
  }, [soundOn]);

  return (
    <HapticContext.Provider value={fire}>
      {children}
    </HapticContext.Provider>
  );
}

// ─── Host chrome (the slim "messaging client" bar above the Mini App) ───
// Single liquid-glass slab that covers both the status bar area and the host
// header row — rounded bottom corners give it the iOS 26 "floating dock" feel.
function HostHeader({ title, onBack, onClose, scrolled = false }) {
  const dark = document.documentElement.dataset.tgMode === 'dark';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 8,
      height: 98,
      padding: '54px 14px 0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
      backdropFilter: 'blur(36px) saturate(220%) brightness(1.06)',
      WebkitBackdropFilter: 'blur(36px) saturate(220%) brightness(1.06)',
      background: dark
        ? `linear-gradient(to bottom, rgba(22,22,26,${scrolled ? 0.5 : 0.30}), rgba(22,22,26,${scrolled ? 0.4 : 0.18}))`
        : `linear-gradient(to bottom, rgba(255,255,255,${scrolled ? 0.62 : 0.38}), rgba(255,255,255,${scrolled ? 0.42 : 0.20}))`,
      // Glass rim: highlight strip at the top edge, faint hairline at the bottom, soft cast shadow.
      boxShadow: dark
        ? 'inset 0 0.5px 0 rgba(255,255,255,0.18), inset 0 -0.5px 0 rgba(255,255,255,0.05), 0 6px 22px rgba(0,0,0,0.38)'
        : 'inset 0 0.5px 0 rgba(255,255,255,0.85), inset 0 -0.5px 0 rgba(0,0,0,0.08), 0 6px 22px rgba(15,17,20,0.10)',
      borderBottom: dark
        ? '0.5px solid rgba(255,255,255,0.10)'
        : '0.5px solid rgba(255,255,255,0.55)',
      transition: 'background 220ms ease, box-shadow 220ms ease',
      color: 'var(--tg-text)',
      boxSizing: 'border-box',
    }}>
      <button onClick={onBack} aria-label="Back" style={iconBtn(onBack ? 1 : 0)}>
        <svg width="11" height="18" viewBox="0 0 11 18" fill="none" aria-hidden>
          <path d="M9 2L2 9l7 7" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontWeight: 600, fontSize: 16, letterSpacing: -0.2,
        color: 'var(--tg-text)',
      }}>{title}</div>
      <button onClick={onClose} aria-label="Close" style={iconBtn(1)}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

const iconBtn = (visible) => ({
  width: 32, height: 32, borderRadius: 16,
  display: 'grid', placeItems: 'center',
  border: 0, background: 'transparent', cursor: 'pointer',
  color: 'var(--tg-hint)',
  opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none',
  transition: 'opacity 200ms ease, background 200ms ease',
});

// ─── MainButton ─────────────────────────────────────────────────────────
// Native-feeling primary CTA pinned above the home indicator.
// Supports `shine`, `progress` (in-button 3s spinner before resolving),
// and `disabled`. Fires the configured haptic on press.

function MainButton({
  label, onClick, visible = true, shine = false, disabled = false,
  haptic = 'medium', loading: extLoading = false,
  variant = 'primary',  // 'primary' | 'destructive'
}) {
  const tap = useHaptic();
  const [busy, setBusy] = React.useState(false);
  const loading = busy || extLoading;
  const handle = (e) => {
    if (disabled || loading) return;
    tap(haptic, e);
    if (onClick) {
      const r = onClick(e);
      if (r && typeof r.then === 'function') {
        setBusy(true);
        r.finally(() => setBusy(false));
      }
    }
  };
  if (!visible) return null;

  const isDest = variant === 'destructive';
  return (
    <div style={{
      position: 'absolute', bottom: 36, left: 0, right: 0, zIndex: 6,
      padding: '0 14px', pointerEvents: 'none',
    }}>
      <button onClick={handle} disabled={disabled || loading}
        style={{
          width: '100%', height: 50, borderRadius: 14, border: 0,
          background: isDest ? 'var(--tg-destructive-text)' : 'var(--tg-button)',
          color: 'var(--tg-button-text)',
          fontFamily: '-apple-system, system-ui',
          fontWeight: 600, fontSize: 17, letterSpacing: 0.1,
          position: 'relative', overflow: 'hidden',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'default' : 'pointer',
          pointerEvents: 'auto',
          boxShadow: '0 6px 18px color-mix(in oklch, var(--tg-button) 38%, transparent)',
          transform: 'translateZ(0)',
          transition: 'transform 120ms cubic-bezier(.3,.7,.4,1), opacity 200ms',
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.985)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
        {loading ? (
          <span style={{
            display: 'inline-block', width: 22, height: 22,
            border: '2.5px solid rgba(255,255,255,0.35)',
            borderTopColor: '#fff', borderRadius: '50%',
            animation: 'tg-spin 800ms linear infinite',
            verticalAlign: '-6px',
          }} />
        ) : label}
        {shine && !loading && (
          <span style={{
            position: 'absolute', top: 0, left: '-40%', height: '100%', width: '40%',
            background: 'linear-gradient(110deg, transparent, rgba(255,255,255,0.45), transparent)',
            transform: 'skewX(-18deg)',
            animation: 'tg-shine 2.6s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        )}
      </button>
    </div>
  );
}

// ─── Scroll surface (just the Mini App content area) ─────────────────────
function MiniAppSurface({ children, padTop = 98, padBottom = 110, onScroll }) {
  return (
    <div onScroll={onScroll} style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      paddingTop: padTop, paddingBottom: padBottom,
      overflowY: 'auto', overflowX: 'hidden',
      background: 'var(--tg-bg)',
      color: 'var(--tg-text)',
      WebkitOverflowScrolling: 'touch',
    }}>
      {children}
    </div>
  );
}

// ─── Generic press-able card with selection haptic ──────────────────────
function PressCard({ haptic = 'selection', onPress, style, children, disabled = false, ...rest }) {
  const tap = useHaptic();
  return (
    <button
      onClick={(e) => { if (disabled) return; tap(haptic, e); onPress && onPress(e); }}
      disabled={disabled}
      style={{
        textAlign: 'left', border: 0, background: 'transparent',
        padding: 0, font: 'inherit', color: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      {...rest}
    >{children}</button>
  );
}

Object.assign(window, {
  HapticProvider, useHaptic, HostHeader, MainButton, MiniAppSurface, PressCard,
  fireTelegramHaptic,
});
