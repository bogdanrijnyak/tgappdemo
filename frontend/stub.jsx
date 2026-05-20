// stub.jsx — designed placeholder shown when a non-hero card is opened.
// Per the brief, "unsupported" states are designed moments, not afterthoughts —
// so this preview is itself a polished card with a hint of what the full demo is.

function StubDemo({ card, hue, onBackToGallery }) {
  const tap = useHaptic();
  const isFallback = !!card.fallback;
  const isPremium  = !!card.premium;
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        height: 220, borderRadius: 22,
        background: isFallback
          ? `linear-gradient(160deg, color-mix(in oklch, var(--tg-text) 6%, transparent), color-mix(in oklch, var(--tg-text) 14%, transparent))`
          : `linear-gradient(155deg, oklch(0.62 0.18 ${hue}), oklch(0.38 0.18 ${hue + 18}))`,
        marginBottom: 18, position: 'relative', overflow: 'hidden',
        display: 'grid', placeItems: 'center',
        boxShadow: isFallback ? 'none' : `0 18px 36px oklch(0.5 0.18 ${hue} / 0.32)`,
      }}>
        <div style={{
          width: 92, height: 92, borderRadius: 28,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(12px)',
          display: 'grid', placeItems: 'center',
          color: isFallback ? 'var(--tg-hint)' : '#fff',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32)',
        }}>
          <Glyph name={card.glyph} size={50} stroke={card.stroke}/>
        </div>

        {/* signature flourish */}
        <FlourishFor id={card.id}/>
      </div>

      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 22, fontWeight: 700, letterSpacing: -0.4,
      }}>{card.title}</div>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 14, color: 'var(--tg-subtitle-text)',
        marginTop: 4, marginBottom: 16,
      }}>{card.subtitle}</div>

      {/* state notice */}
      {isPremium && (
        <Notice
          tone="warning"
          icon={<Glyph name="premium" size={14}/>}
          title="Premium only"
          body="Available for users with Telegram Premium — turn it on in Tweaks to preview."/>
      )}
      {isFallback && (
        <Notice
          tone="muted"
          icon={<svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M7 3v4M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          title={`Not on ${card.fallback}`}
          body={`This capability is mobile-only. The card stays here so the catalogue feels complete.`}/>
      )}
      {!isPremium && !isFallback && (
        <Notice
          tone="info"
          icon={<svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          title="Preview"
          body="This demo is wired into the showcase but not interactive in this pass. Tap the five hero demos for the full experience."/>
      )}

      <div style={{
        marginTop: 16, padding: 14,
        borderRadius: 14, background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
      }}>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 12, color: 'var(--tg-section-header-text)',
          fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
          marginBottom: 8,
        }}>What you’d feel</div>
        <ul style={{
          margin: 0, paddingLeft: 18,
          fontFamily: '-apple-system, system-ui', fontSize: 13,
          lineHeight: 1.55, color: 'var(--tg-text)',
        }}>
          {SUMMARIES[card.id]?.map((line, i) => <li key={i} style={{ marginBottom: 4 }}>{line}</li>)}
          {!SUMMARIES[card.id] && <li>A native moment crafted around “{card.title}”.</li>}
        </ul>
      </div>

      <MainButton
        label="Back to gallery"
        haptic="selection"
        onClick={onBackToGallery}/>
    </div>
  );
}

function Notice({ tone, icon, title, body }) {
  const colors = {
    info:    { bg: 'color-mix(in oklch, var(--tg-accent) 10%, transparent)',
               border: 'color-mix(in oklch, var(--tg-accent) 32%, transparent)',
               fg: 'var(--tg-accent)' },
    warning: { bg: 'color-mix(in oklch, oklch(0.78 0.18 70) 14%, transparent)',
               border: 'color-mix(in oklch, oklch(0.7 0.16 70) 38%, transparent)',
               fg: 'oklch(0.5 0.18 70)' },
    muted:   { bg: 'var(--tg-secondary-bg)',
               border: 'var(--tg-section-separator)',
               fg: 'var(--tg-hint)' },
  }[tone];
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 12,
      background: colors.bg,
      border: '0.5px solid ' + colors.border,
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <div style={{ color: colors.fg, paddingTop: 1 }}>{icon}</div>
      <div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, fontWeight: 700, color: colors.fg,
        }}>{title}</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 12, color: 'var(--tg-subtitle-text)', marginTop: 2,
          lineHeight: 1.4,
        }}>{body}</div>
      </div>
    </div>
  );
}

function FlourishFor({ id }) {
  // Tiny in-card visual signature for each demo.
  if (id === 'compass') {
    return (
      <div style={{ position: 'absolute', right: 18, bottom: 14, color: 'rgba(255,255,255,0.6)' }}>
        <svg width="46" height="46" viewBox="0 0 46 46">
          <circle cx="23" cy="23" r="20" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M23 6v6M23 34v6M6 23h6M34 23h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M23 12 L28 26 L23 22 L18 26 z" fill="currentColor"/>
        </svg>
      </div>
    );
  }
  if (id === 'where') {
    return (
      <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: 60,
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>
        <span>52.520° N</span><span>13.405° E</span><span>±4 m</span>
      </div>
    );
  }
  if (id === 'qr') {
    return (
      <div style={{ position: 'absolute', top: 20, right: 20,
                    width: 56, height: 56, borderRadius: 8,
                    background: 'rgba(255,255,255,0.95)',
                    padding: 6 }}>
        <div style={{
          width: '100%', height: '100%',
          backgroundImage:
            'linear-gradient(90deg, black 25%, transparent 25% 50%, black 50% 75%, transparent 75%),' +
            'linear-gradient(0deg, black 25%, transparent 25% 50%, black 50% 75%, transparent 75%)',
          backgroundSize: '8px 8px, 8px 8px',
          opacity: 0.85,
        }}/>
      </div>
    );
  }
  return null;
}

const SUMMARIES = {
  'who':       ['Avatar blur-to-focus on entry', 'Green “Verified by Telegram” pill', 'Subtle delivery-time ticker'],
  'theme':     ['14 swatches with live labels', '400 ms color morph on system change', 'Center ripple on switch'],
  'platform':  ['Platform badge (iOS / Android / Desktop / Web)', 'Capability chips, green for supported'],
  'vp':        ['Live viewport vs stable height', 'Animated rectangle reflects keyboard rise'],
  'swipe':     ['Toggle to protect from accidental close', 'Designed Desktop fallback chip'],
  'fs':        ['Header fades, custom close fades in', 'Friendly toast on Desktop'],
  'safe':      ['Frame with inset numbers', 'Morphs on rotate / fullscreen'],
  'rot':       ['Pin to portrait', 'Rotation does nothing while locked'],
  'mb':        ['Color slider · shine toggle · text', '3-second in-button progress → success'],
  'sb':        ['Four-chip slot selector', 'Native animated repositioning'],
  'settings':  ['Bottom sheet with sound, motion, debug', 'Live density preview'],
  'chrome':    ['Three color pickers', 'Repaints header · bar · background'],
  'device':    ['Same UI as cloud — labeled local', 'Two-device demo proves no sync'],
  'secure':    ['Padlocked variant', 'Note survives close + reopen'],
  'compass':   ['Analog dial, needle tracks rotation', 'Angular velocity readout'],
  'horizon':   ['Aviation-style horizon, banks with pitch', 'Optional absolute mode with north'],
  'where':     ['Pulsing pin on a mini-map', 'Accuracy · speed · course readout'],
  's-story':   ['1080×1920 card rendered with name', 'Story editor opens pre-loaded'],
  's-msg':     ['Native “Send to…” sheet', 'Inline message with deep-link button'],
  's-dl':      ['Personalized 1170×2532 PNG', 'Native confirmation dialog'],
  's-inline':  ['Closes the Mini App', 'Opens inline mode in picked chat'],
  'gift':      ['Lottie box-opening animation', 'Graceful empty-balance fallback'],
  'homescr':   ['Big CTA · phone Lottie', 'Trophy + confetti on success'],
  'emoji':     ['5×4 emoji grid', 'Sets status for 1 hour, soft upsell for non-Premium'],
  'clip':      ['Read the clipboard with mask', '50% characters hidden for privacy'],
  'write':     ['Permission, then bot DMs you', 'Notification proves the loop closed'],
  'live':      ['“Right now 23 are watching.”', 'Ticks up and down in real time'],
  'echo':      ['Tap here, vibrates on phone B', 'Latency overlay'],
};

Object.assign(window, { StubDemo });
