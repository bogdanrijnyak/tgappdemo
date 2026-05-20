// collectible.jsx — Collectible Gift hero (v2.0 flagship).
// Six-layer recipe per the addendum:
//   1. radial-gradient backdrop (center → edge)
//   2. SVG pattern overlay (opacity 0.15, top-fading mask)
//   3. holographic diagonal shimmer (4 s cycle, 2 s pass)
//   4. central model, tilted ±10° via accelerometer / mouse
//   5. floating symbol, 3 s vertical bob
//   6. monospace #num, bottom-right, opacity 0.6
//
// Long-press fires `heavy` and opens a fullscreen zoom with intensified parallax.

function CollectibleGiftCard({ preset, size = 'demo', tilt = { x: 0, y: 0 } }) {
  // Sizes — phone-frame is 402 px wide, so 'demo' is the largest practical card.
  const dims = {
    card: { w: 240, h: 300, model: 110, sym: 22, num: 10 },
    demo: { w: 280, h: 360, model: 130, sym: 26, num: 11 },
    full: { w: 340, h: 440, model: 168, sym: 30, num: 13 },
  }[size];

  const tiltX = Math.max(-10, Math.min(10, tilt.y * (size === 'full' ? 1.4 : 1)));
  const tiltY = Math.max(-10, Math.min(10, tilt.x * (size === 'full' ? 1.4 : 1)));

  return (
    <div style={{
      width: dims.w, height: dims.h,
      borderRadius: 24, overflow: 'hidden',
      position: 'relative',
      transform: `perspective(900px) rotateX(${-tiltX}deg) rotateY(${tiltY}deg)`,
      transformStyle: 'preserve-3d',
      transition: 'transform 80ms linear',
      boxShadow: `0 30px 60px ${preset.edge}99, 0 8px 22px ${preset.edge}77, inset 0 1px 0 rgba(255,255,255,0.2)`,
    }}>
      {/* Layer 1 — radial gradient backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 40%, ${preset.center} 0%, ${preset.edge} 100%)`,
      }}/>

      {/* Layer 2 — pattern overlay */}
      <GiftPattern preset={preset} dims={dims}/>

      {/* Layer 3 — holographic shimmer */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
        backgroundSize: '220% 100%',
        animation: 'tg-gift-shimmer 4s cubic-bezier(0.4,0,0.2,1) infinite',
        mixBlendMode: 'overlay',
      }}/>

      {/* Layer 4 — model */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: dims.model, height: dims.model,
        transform: `translate(-50%, -52%) translateZ(20px)`,
        filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.35))',
      }}>
        <GiftModel kind={preset.model} hue={preset.patternHue}/>
      </div>

      {/* Layer 5 — symbol, bobbing */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        width: dims.sym, height: dims.sym,
        display: 'grid', placeItems: 'center',
        color: 'rgba(255,255,255,0.85)',
        fontSize: dims.sym - 4,
        fontFamily: '-apple-system, system-ui',
        textShadow: '0 1px 6px rgba(0,0,0,0.5)',
        animation: 'tg-gift-bob 3s ease-in-out infinite',
      }}>{preset.symbol}</div>

      {/* Layer 6 — serial number */}
      <div style={{
        position: 'absolute', bottom: 10, right: 12,
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: dims.num, fontWeight: 600,
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 1,
      }}>#{preset.num}</div>

      {/* gift name pinned at top-left */}
      <div style={{
        position: 'absolute', top: 12, left: 14,
        fontFamily: '-apple-system, system-ui',
        fontSize: size === 'card' ? 11 : 12, fontWeight: 600,
        color: 'rgba(255,255,255,0.78)',
        textTransform: 'uppercase', letterSpacing: 1.2,
      }}>{preset.name}</div>
    </div>
  );
}

// Pattern layer — repeating SVG tile, mask-fades toward bottom.
function GiftPattern({ preset, dims }) {
  const tile = PATTERN_TILES[preset.model] || PATTERN_TILES.crystal;
  const id = 'gp-' + preset.id;
  return (
    <svg width="100%" height="100%" style={{
      position: 'absolute', inset: 0, opacity: 0.18,
      WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
      maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
    }}>
      <defs>
        <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
          <g fill={preset.patternColor} stroke="none">
            {tile}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`}/>
    </svg>
  );
}

const PATTERN_TILES = {
  crystal: <>
    <path d="M20 4l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" opacity="0.85"/>
    <circle cx="6" cy="32" r="1.2"/>
    <circle cx="34" cy="30" r="1.2"/>
  </>,
  flame: <>
    <path d="M20 8c4 4 6 8 4 12-2 3-6 3-8 0-2-4 0-8 4-12z" opacity="0.9"/>
    <circle cx="6" cy="8" r="1.2"/>
    <circle cx="34" cy="34" r="1.2"/>
  </>,
  bloom: <>
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <ellipse key={a} cx="20" cy="14" rx="2.6" ry="6"
               transform={`rotate(${a} 20 20)`} opacity="0.85"/>
    ))}
    <circle cx="20" cy="20" r="1.4"/>
  </>,
};

// Models — each is a stylized SVG illustration scaled to fit dims.model.
function GiftModel({ kind, hue }) {
  if (kind === 'crystal') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <linearGradient id="gem-light" x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95"/>
            <stop offset="0.6" stopColor={`oklch(0.7 0.2 ${hue})`} stopOpacity="0.85"/>
            <stop offset="1" stopColor={`oklch(0.42 0.18 ${hue})`} stopOpacity="0.95"/>
          </linearGradient>
          <linearGradient id="gem-dark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={`oklch(0.55 0.2 ${hue + 12})`}/>
            <stop offset="1" stopColor={`oklch(0.22 0.12 ${hue + 24})`}/>
          </linearGradient>
        </defs>
        {/* gem outline */}
        <path d="M50 10 L86 38 L70 84 L30 84 L14 38 z" fill="url(#gem-dark)"/>
        {/* upper light facet */}
        <path d="M50 10 L86 38 L50 52 L14 38 z" fill="url(#gem-light)"/>
        {/* central facet */}
        <path d="M50 52 L86 38 L70 84 L50 86 z" fill={`oklch(0.6 0.2 ${hue})`} opacity="0.8"/>
        <path d="M50 52 L14 38 L30 84 L50 86 z" fill={`oklch(0.5 0.2 ${hue + 18})`} opacity="0.7"/>
        {/* center highlight */}
        <path d="M50 10 L62 24 L50 52 L38 24 z" fill="rgba(255,255,255,0.55)"/>
        {/* inner sparkle */}
        <circle cx="50" cy="32" r="2.4" fill="#fff" opacity="0.9"/>
      </svg>
    );
  }
  if (kind === 'flame') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <linearGradient id="flame-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe7c2"/>
            <stop offset="0.4" stopColor="#ffae5a"/>
            <stop offset="0.8" stopColor="#d23a1e"/>
            <stop offset="1" stopColor="#5a0808"/>
          </linearGradient>
          <radialGradient id="flame-core" cx="0.5" cy="0.7" r="0.4">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95"/>
            <stop offset="1" stopColor="#fff" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <path d="M50 8 C60 24 78 36 76 56 C74 80 60 90 50 90 C40 90 26 80 24 56 C22 36 40 24 50 8z" fill="url(#flame-grad)"/>
        <ellipse cx="50" cy="62" rx="14" ry="22" fill="url(#flame-core)"/>
        <circle cx="50" cy="60" r="6" fill="rgba(255,255,200,0.9)"/>
      </svg>
    );
  }
  // bloom
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <radialGradient id="petal-grad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95"/>
          <stop offset="0.6" stopColor={`oklch(0.78 0.18 ${hue})`}/>
          <stop offset="1" stopColor={`oklch(0.42 0.2 ${hue + 14})`}/>
        </radialGradient>
      </defs>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
        <ellipse key={a} cx="50" cy="26" rx="11" ry="22"
                 transform={`rotate(${a} 50 50)`}
                 fill="url(#petal-grad)"
                 opacity={0.7 + (i % 2) * 0.2}/>
      ))}
      <circle cx="50" cy="50" r="11" fill={`oklch(0.95 0.18 ${(hue + 60) % 360})`}/>
      <circle cx="50" cy="50" r="5" fill={`oklch(0.7 0.22 ${(hue + 90) % 360})`}/>
    </svg>
  );
}

// ─── Demo view ──────────────────────────────────────────────────────────
function CollectibleGifts() {
  const tap = useHaptic();
  const [presetId, setPresetId] = React.useState('cosmic');
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [zoomed, setZoomed] = React.useState(false);
  const [upgraded, setUpgraded] = React.useState(false);
  const preset = GIFT_PRESETS[presetId];

  // Track tilt — mouse on desktop, deviceorientation on mobile.
  React.useEffect(() => {
    const onMouse = (e) => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      setTilt({ x: (e.clientX - cx) / (window.innerWidth / 2) * 8,
                y: (e.clientY - cy) / (window.innerHeight / 2) * 6 });
    };
    const onOrient = (e) => {
      if (e.beta == null) return;
      setTilt({ x: Math.max(-10, Math.min(10, (e.gamma || 0))),
                y: Math.max(-10, Math.min(10, ((e.beta || 0) - 50))) });
    };
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('deviceorientation', onOrient);
    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('deviceorientation', onOrient);
    };
  }, []);

  // Long-press → zoom fullscreen
  const longRef = React.useRef(null);
  const startLong = (e) => {
    longRef.current = setTimeout(() => {
      tap('heavy', e);
      setZoomed(true);
      longRef.current = null;
    }, 380);
  };
  const cancelLong = () => { if (longRef.current) { clearTimeout(longRef.current); longRef.current = null; } };

  const switchPreset = (id) => (e) => { tap('selection', e); setPresetId(id); };

  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Six layers: backdrop · pattern · shimmer · model · symbol · serial. Tilt the device. Press &amp; hold to enlarge.</div>

      <div style={{ display: 'grid', placeItems: 'center', marginBottom: 18,
                    minHeight: 360 }}>
        <div onMouseDown={startLong} onMouseUp={cancelLong} onMouseLeave={cancelLong}
             onTouchStart={startLong} onTouchEnd={cancelLong}
             style={{ cursor: 'pointer' }}>
          <CollectibleGiftCard preset={preset} size="demo" tilt={tilt}/>
        </div>
      </div>

      {/* Preset switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {Object.values(GIFT_PRESETS).map((p) => {
          const on = p.id === presetId;
          return (
            <PressCard key={p.id} haptic="selection" onPress={switchPreset(p.id)}
              style={{
                flex: 1, padding: '10px 8px',
                borderRadius: 12,
                background: on
                  ? `linear-gradient(135deg, ${p.center}, ${p.edge})`
                  : 'var(--tg-secondary-bg)',
                color: on ? '#fff' : 'var(--tg-text)',
                border: '0.5px solid ' + (on ? 'rgba(255,255,255,0.18)' : 'var(--tg-card-border)'),
                textAlign: 'center',
                fontFamily: '-apple-system, system-ui',
                fontSize: 12, fontWeight: 600,
                position: 'relative', overflow: 'hidden',
                transition: 'background 220ms',
              }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{p.symbol}</div>
              {p.name.split(' ')[0]}
            </PressCard>
          );
        })}
      </div>

      {/* Sub-flows breadth */}
      <div style={{
        background: 'var(--tg-section-bg)', borderRadius: 14,
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
        padding: 14, marginBottom: 14,
      }}>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 12, fontWeight: 700,
          color: 'var(--tg-section-header-text)',
          letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8,
        }}>17 more sub-flows</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Upgrade', 'Resell', 'Transfer', 'TON withdraw', 'Emoji status',
            'Chat theme', 'Collections', 'Pin to top', 'Channel gift',
            'Birthday', 'Star rating', 'Subscriptions', 'Referrals',
            'Giveaways', 'Paid msg', 'Paid media', 'Suggested posts'].map((t) => (
            <span key={t} style={{
              padding: '4px 9px', borderRadius: 999,
              background: 'var(--tg-secondary-bg)',
              fontFamily: '-apple-system, system-ui',
              fontSize: 11, fontWeight: 500,
              color: 'var(--tg-subtitle-text)',
            }}>{t}</span>
          ))}
        </div>
      </div>

      {zoomed && (
        <ZoomedGift preset={preset} tilt={tilt} onDismiss={() => { setZoomed(false); tap('soft'); }}/>
      )}

      <MainButton
        label={upgraded ? 'Upgraded ✦' : 'Upgrade to Collectible'}
        haptic={upgraded ? 'success' : 'medium'}
        disabled={upgraded}
        onClick={async () => {
          await new Promise((r) => setTimeout(r, 900));
          setUpgraded(true);
          tap('success', { x: window.innerWidth/2, y: window.innerHeight/2 });
        }}
      />
    </div>
  );
}

function ZoomedGift({ preset, tilt, onDismiss }) {
  return (
    <div onClick={onDismiss} style={{
      position: 'absolute', inset: 0, zIndex: 7,
      background: `radial-gradient(circle at 50% 40%, ${preset.edge}cc 0%, rgba(8,8,12,0.92) 100%)`,
      backdropFilter: 'blur(14px) saturate(160%)',
      WebkitBackdropFilter: 'blur(14px) saturate(160%)',
      display: 'grid', placeItems: 'center',
      animation: 'tg-fade-in 220ms',
      cursor: 'pointer',
    }}>
      <CollectibleGiftCard preset={preset} size="full" tilt={tilt}/>
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0,
        textAlign: 'center',
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'rgba(255,255,255,0.7)',
      }}>Tap anywhere to close · #{preset.num}</div>
    </div>
  );
}

Object.assign(window, { CollectibleGiftCard, CollectibleGifts });
