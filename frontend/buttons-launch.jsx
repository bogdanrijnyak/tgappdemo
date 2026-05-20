// buttons-launch.jsx — twelve demos covering Buttons & Navigation, Launch
// Methods (custom splash / preview medias / store tile), the two remaining
// Sensors (Compass, Horizon), Location, and Realtime (live viewer + haptic echo).

// ════════════════════════════════════════════════════════════════════════
//  BUTTONS & NAVIGATION (4)
// ════════════════════════════════════════════════════════════════════════

// ─── 1. MainButton lab — color / shine / progress ───────────────────────
function MainButtonLabDemo() {
  const tg = window.Telegram && window.Telegram.WebApp;
  const [label, setLabel] = React.useState('Continue');
  const [shine, setShine] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [dest, setDest] = React.useState(false);

  React.useEffect(() => {
    if (!tg || !tg.MainButton) return undefined;
    const mb = tg.MainButton;
    try {
      mb.setParams({
        text: label || 'Continue',
        color: dest ? '#ff3b30' : (tg.themeParams && tg.themeParams.button_color) || '#2481cc',
        text_color: '#ffffff',
        is_visible: true,
        is_active: !busy,
        has_shine_effect: !!shine && !busy,
      });
      if (busy) mb.showProgress(false); else mb.hideProgress();
    } catch (e) {}
    return () => { try { mb.hide(); mb.hideProgress(); } catch (e) {} };
  }, [tg, label, shine, busy, dest]);

  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>The MainButton is Telegram's primary CTA, pinned above the home
         indicator. It carries the user's accent, supports a shine sweep, a
         spinner state, and a destructive variant.</div>

      <input value={label} onChange={(e) => setLabel(e.target.value)}
        style={blLabInput}/>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        <BlToggle label="Shine sweep"  value={shine} onChange={setShine}/>
        <BlToggle label="Loading"      value={busy}  onChange={setBusy}/>
        <BlToggle label="Destructive"  value={dest}  onChange={setDest}/>
      </div>

      <div style={{
        marginTop: 18, padding: 18, borderRadius: 14,
        background: 'var(--tg-secondary-bg)',
        textAlign: 'center',
        fontFamily: '-apple-system, system-ui',
        fontSize: 11, color: 'var(--tg-subtitle-text)',
      }}>↓ Live preview pinned to bottom ↓</div>

      <MainButton label={label || 'Continue'} shine={shine && !busy}
                  loading={busy} variant={dest ? 'destructive' : 'primary'}
                  haptic={dest ? 'warning' : 'medium'} onClick={() => {}}/>
    </div>
  );
}

const blLabInput = {
  width: '100%', height: 44, padding: '0 14px',
  borderRadius: 12, border: '1px solid var(--tg-section-separator)',
  background: 'var(--tg-secondary-bg)',
  color: 'var(--tg-text)',
  fontFamily: '-apple-system, system-ui', fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
};

function BlToggle({ label, value, onChange }) {
  const tap = useHaptic();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 12,
      background: 'var(--tg-section-bg)',
      border: '0.5px solid var(--tg-card-border)',
    }}>
      <div style={{ flex: 1, fontFamily: '-apple-system, system-ui', fontSize: 13, fontWeight: 500 }}>{label}</div>
      <button onClick={(e) => { tap('selection', e); onChange(!value); }}
        style={{
          width: 40, height: 24, borderRadius: 999, border: 0, padding: 0,
          background: value ? 'oklch(0.65 0.18 145)' : 'var(--tg-section-separator)',
          position: 'relative', cursor: 'pointer',
        }}>
        <span style={{
          position: 'absolute', top: 2, left: value ? 18 : 2,
          width: 20, height: 20, borderRadius: '50%',
          background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 200ms cubic-bezier(.2,.7,.3,1)',
        }}/>
      </button>
    </div>
  );
}

// ─── 2. SecondaryButton lab — slides between 4 slots ────────────────────
function SecondaryButtonDemo() {
  const tap = useHaptic();
  const tg = window.Telegram && window.Telegram.WebApp;
  const [position, setPosition] = React.useState('left');
  const positions = [
    { id: 'top',    label: 'Top' },
    { id: 'left',   label: 'Left' },
    { id: 'right',  label: 'Right' },
    { id: 'bottom', label: 'Bottom' },
  ];
  React.useEffect(() => {
    if (!tg || !tg.MainButton || !tg.SecondaryButton) return undefined;
    const main = tg.MainButton, sec = tg.SecondaryButton;
    try {
      main.setParams({ text: 'Continue', is_visible: true, is_active: true });
      sec.setParams({ text: 'Cancel', is_visible: true, position });
    } catch (e) {}
    return () => { try { main.hide(); sec.hide(); } catch (e) {} };
  }, [tg, position]);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>SecondaryButton sits beside MainButton. The host picks one of four
         slots — top/left/right/bottom — and animates the pair into place.</div>

      <div style={{
        position: 'relative', height: 260, borderRadius: 18,
        background: 'var(--tg-secondary-bg)',
        border: '0.5px solid var(--tg-card-border)',
        marginBottom: 14, padding: 14,
        overflow: 'hidden',
      }}>
        {/* Main button stays anchored */}
        <BlButton main label="Continue"
          style={{
            position: 'absolute',
            left: position === 'left' ? '50%' : position === 'right' ? 14 : 14,
            right: position === 'left' ? 14 : position === 'right' ? '50%' : 14,
            top: position === 'top' ? 60 : position === 'bottom' ? 14 : 'auto',
            bottom: position === 'top' ? 'auto' : position === 'bottom' ? 60 : 14,
          }}/>
        <BlButton label="Cancel"
          style={{
            position: 'absolute',
            left: position === 'left' ? 14 : position === 'right' ? '50%' : 14,
            right: position === 'left' ? '50%' : position === 'right' ? 14 : 14,
            top: position === 'top' ? 14 : position === 'bottom' ? 'auto' : 'auto',
            bottom: position === 'top' ? 'auto' : position === 'bottom' ? 14 : (position === 'left' || position === 'right') ? 14 : 60,
          }}/>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 11, background: 'var(--tg-secondary-bg)' }}>
        {positions.map((p) => {
          const on = position === p.id;
          return (
            <PressCard key={p.id} haptic="selection"
              onPress={(e) => { tap('selection', e); setPosition(p.id); }}
              style={{
                flex: 1, padding: 8, borderRadius: 9, textAlign: 'center',
                background: on ? 'var(--tg-section-bg)' : 'transparent',
                boxShadow: on ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                color: on ? 'var(--tg-text)' : 'var(--tg-subtitle-text)',
                fontFamily: '-apple-system, system-ui',
                fontSize: 12, fontWeight: 600,
              }}>{p.label}</PressCard>
          );
        })}
      </div>
    </div>
  );
}

function BlButton({ label, main = false, style = {} }) {
  return (
    <button style={{
      height: 38, borderRadius: 11, border: 0, padding: '0 14px',
      background: main ? 'var(--tg-button)' : 'var(--tg-section-bg)',
      color: main ? 'var(--tg-button-text)' : 'var(--tg-text)',
      fontFamily: '-apple-system, system-ui', fontSize: 13, fontWeight: 600,
      cursor: 'pointer',
      boxShadow: main
        ? '0 4px 12px color-mix(in oklch, var(--tg-button) 30%, transparent)'
        : '0 1px 3px rgba(0,0,0,0.08)',
      transition: 'all 320ms cubic-bezier(.2,.7,.3,1)',
      ...style,
    }}>{label}</button>
  );
}

// ─── 3. Settings sheet — host-level bottom sheet menu ───────────────────
function SettingsSheetDemo() {
  const tap = useHaptic();
  const tg = window.Telegram && window.Telegram.WebApp;
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (!tg || !tg.SettingsButton) return undefined;
    const sb = tg.SettingsButton;
    const onClick = () => setOpen(true);
    try { sb.show && sb.show(); sb.onClick && sb.onClick(onClick); } catch (e) {}
    return () => { try { sb.offClick && sb.offClick(onClick); sb.hide && sb.hide(); } catch (e) {} };
  }, [tg]);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>The Settings ⓘ button in the top-right header opens the host's
         actions sheet. Apps can register entries via <code style={blCode}>SettingsButton.show()</code>.</div>

      <PressCard haptic="soft"
        onPress={(e) => { tap('soft', e); setOpen(true); }}
        style={{
          padding: '12px 14px', borderRadius: 12,
          background: 'var(--tg-section-bg)',
          border: '0.5px solid var(--tg-card-border)',
          boxShadow: 'var(--tg-card-shadow)',
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%',
        }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'linear-gradient(135deg, oklch(0.78 0.06 250), oklch(0.55 0.1 270))',
          color: '#fff', display: 'grid', placeItems: 'center',
        }}>
          <Glyph name="gear" size={18}/>
        </div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 14, fontWeight: 600,
        }}>Open Settings sheet</div>
      </PressCard>

      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'absolute', inset: 0, zIndex: 8,
          background: 'rgba(15,17,20,0.45)',
          display: 'flex', alignItems: 'flex-end',
          animation: 'tg-fade-in 220ms',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--tg-section-bg)', color: 'var(--tg-text)',
            width: '100%', borderRadius: '20px 20px 0 0',
            padding: '14px 0 28px',
            animation: 'tg-sheet-up 280ms cubic-bezier(.2,.7,.3,1)',
          }}>
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: 'var(--tg-section-separator)',
              margin: '0 auto 14px',
            }}/>
            {[
              { label: 'Account preferences', icon: 'user' },
              { label: 'Notifications',        icon: 'echo' },
              { label: 'Theme',                icon: 'palette' },
              { label: 'Privacy',              icon: 'shield' },
              { label: 'Help & feedback',      icon: 'msg' },
            ].map((it, i, arr) => (
              <div key={it.label} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px',
                borderBottom: i === arr.length - 1 ? 'none' : '0.5px solid var(--tg-section-separator)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'var(--tg-secondary-bg)',
                  color: 'var(--tg-link)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <Glyph name={it.icon} size={16}/>
                </div>
                <div style={{
                  flex: 1,
                  fontFamily: '-apple-system, system-ui',
                  fontSize: 15, fontWeight: 500,
                }}>{it.label}</div>
                <svg width="8" height="14" viewBox="0 0 8 14" style={{ color: 'var(--tg-hint)' }}>
                  <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const blCode = {
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 11, padding: '0 4px', borderRadius: 4,
  background: 'var(--tg-secondary-bg)',
};

function rgbToHex(rgb) {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb || '');
  if (!m) return '#000000';
  const toHex = (n) => Number(n).toString(16).padStart(2, '0');
  return '#' + toHex(m[1]) + toHex(m[2]) + toHex(m[3]);
}

// ─── 4. Chrome colors — header / bottom bar / background sliders ────────
function ChromeColorsDemo() {
  const tap = useHaptic();
  const tg = window.Telegram && window.Telegram.WebApp;
  const [hue, setHue] = React.useState(215);
  const [tint, setTint] = React.useState(50);
  React.useEffect(() => {
    const headerColor = `oklch(${0.92 - tint*0.004} 0.04 ${hue})`;
    const bgColor = `oklch(${0.94 - tint*0.003} 0.03 ${hue})`;
    document.documentElement.style.setProperty('--tg-header-bg', headerColor);
    document.documentElement.style.setProperty('--tg-bottom-bar-bg', bgColor);
    // Convert OKLCH -> hex for Telegram (approx via computed style).
    const probe = document.createElement('span');
    probe.style.color = headerColor;
    document.body.appendChild(probe);
    const headerHex = rgbToHex(getComputedStyle(probe).color);
    probe.style.color = bgColor;
    const bgHex = rgbToHex(getComputedStyle(probe).color);
    document.body.removeChild(probe);
    if (tg) {
      try { tg.setHeaderColor && tg.setHeaderColor(headerHex); } catch (e) {}
      try { tg.setBackgroundColor && tg.setBackgroundColor(bgHex); } catch (e) {}
      try { tg.setBottomBarColor && tg.setBottomBarColor(bgHex); } catch (e) {}
    }
    return () => {
      document.documentElement.style.removeProperty('--tg-header-bg');
      document.documentElement.style.removeProperty('--tg-bottom-bar-bg');
      if (tg) {
        try { tg.setHeaderColor && tg.setHeaderColor('bg_color'); } catch (e) {}
        try { tg.setBackgroundColor && tg.setBackgroundColor('bg_color'); } catch (e) {}
        try { tg.setBottomBarColor && tg.setBottomBarColor('bottom_bar_bg_color'); } catch (e) {}
      }
    };
  }, [hue, tint]);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>The host header and bottom bar pick up <code style={blCode}>themeParams.header_bg_color</code>
         and <code style={blCode}>bottom_bar_bg_color</code>. Mini Apps can override them per-screen.</div>

      <div style={{
        marginBottom: 14, height: 200, borderRadius: 16, overflow: 'hidden',
        background: 'var(--tg-bg)', position: 'relative',
        border: '0.5px solid var(--tg-card-border)',
      }}>
        <div style={{ height: 44, background: 'var(--tg-header-bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: '-apple-system, system-ui',
                      fontSize: 12, fontWeight: 600, color: 'var(--tg-text)' }}>Header</div>
        <div style={{ height: 'calc(100% - 88px)', background: 'var(--tg-bg)',
                      display: 'grid', placeItems: 'center',
                      fontFamily: '-apple-system, system-ui',
                      fontSize: 12, color: 'var(--tg-subtitle-text)' }}>Content area</div>
        <div style={{ height: 44, background: 'var(--tg-bottom-bar-bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: '-apple-system, system-ui',
                      fontSize: 12, fontWeight: 600, color: 'var(--tg-text)' }}>Bottom bar</div>
      </div>

      <Slider label={`Hue · ${Math.round(hue)}°`} value={hue} min={0} max={360}
              onChange={(v) => { tap('selection'); setHue(v); }}/>
      <Slider label={`Tint · ${Math.round(tint)}%`} value={tint} min={0} max={100}
              onChange={(v) => { tap('selection'); setTint(v); }}/>
    </div>
  );
}

function Slider({ label, value, min, max, onChange }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 12, color: 'var(--tg-subtitle-text)',
        marginBottom: 4,
      }}>{label}</div>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--tg-accent)' }}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  LAUNCH METHODS (3 — splash / preview medias / store tile)
// ════════════════════════════════════════════════════════════════════════

// ─── 5. Custom splash — botAppSettings preview ──────────────────────────
function CustomSplashDemo() {
  const [dark, setDark] = React.useState(false);
  const [headerTint, setHeaderTint] = React.useState(215);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}><code style={blCode}>botAppSettings</code> lets bots ship a branded splash:
         logo, background colors for light + dark, and a header tint. Telegram
         shows it while the Mini App is loading.</div>

      <div style={{
        height: 280, borderRadius: 22, overflow: 'hidden',
        background: dark ? '#0e1116' : '#ffffff',
        border: '0.5px solid var(--tg-card-border)',
        position: 'relative', marginBottom: 14,
        transition: 'background 320ms',
      }}>
        <div style={{
          height: 44, background: `oklch(${dark ? 0.22 : 0.92} 0.04 ${headerTint})`,
          transition: 'background 320ms',
        }}/>
        <div style={{
          position: 'absolute', inset: 44, display: 'grid', placeItems: 'center',
          color: dark ? '#fff' : '#0e1116',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, margin: '0 auto', borderRadius: 22,
              background: `linear-gradient(135deg, oklch(0.72 0.16 ${headerTint}), oklch(0.5 0.2 ${headerTint + 18}))`,
              display: 'grid', placeItems: 'center',
              color: '#fff', fontFamily: '-apple-system, system-ui',
              fontSize: 30, fontWeight: 800, letterSpacing: -1,
              boxShadow: '0 14px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}>API</div>
            <div style={{
              marginTop: 14,
              fontFamily: '-apple-system, system-ui',
              fontSize: 18, fontWeight: 700,
            }}>API Showcase</div>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 12, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
              marginTop: 2,
            }}>Loading the Mini App…</div>
            <div style={{
              width: 30, height: 2, margin: '14px auto 0',
              background: `oklch(0.62 0.18 ${headerTint})`,
              borderRadius: 1, animation: 'tg-shine 1.4s linear infinite',
            }}/>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <BlToggle label="Dark variant" value={dark} onChange={setDark}/>
      </div>
      <Slider label={`Header tint hue · ${Math.round(headerTint)}°`} value={headerTint} min={0} max={360}
              onChange={(v) => setHeaderTint(v)}/>
    </div>
  );
}

// ─── 6. Bot preview medias — horizontal carousel ────────────────────────
function BotPreviewMediasDemo() {
  const [idx, setIdx] = React.useState(0);
  const slides = [
    { hue: 215, label: '01 · Onboarding', sub: 'A 3-second first impression' },
    { hue: 305, label: '02 · Gifts',       sub: 'Collectibles with pattern + backdrop' },
    { hue: 145, label: '03 · Haptics',     sub: 'Nine pads, eight-step sequencer' },
    { hue: 50,  label: '04 · Sensors',     sub: 'A live 3D cube tracking the accelerometer' },
    { hue: 25,  label: '05 · Theme',       sub: 'Three swatches, live morph' },
  ];
  React.useEffect(() => {
    const id = setInterval(() => setIdx((n) => (n + 1) % slides.length), 3600);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Bots upload preview medias for the Mini App Store. Up to 9 slides
         per locale; auto-cycle inside the catalog tile.</div>

      <div style={{
        height: 250, borderRadius: 18, overflow: 'hidden',
        position: 'relative', marginBottom: 14,
        background: `linear-gradient(160deg, oklch(0.74 0.16 ${slides[idx].hue}), oklch(0.38 0.18 ${slides[idx].hue + 30}))`,
        color: '#fff', padding: 18,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        transition: 'background 700ms cubic-bezier(.2,.7,.3,1)',
        boxShadow: `0 16px 32px oklch(0.5 0.18 ${slides[idx].hue} / 0.32)`,
      }}>
        <div style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 10, fontWeight: 700, opacity: 0.75, letterSpacing: 0.4,
        }}>{slides[idx].label}</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 22, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2,
          marginTop: 4, textShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}>{slides[idx].sub}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            width: i === idx ? 22 : 6, height: 6, borderRadius: 3,
            background: i === idx ? 'var(--tg-accent)' : 'var(--tg-section-separator)',
            transition: 'width 320ms, background 200ms',
          }}/>
        ))}
      </div>
    </div>
  );
}

// ─── 7. Store entry — Telegram catalog tile mock ────────────────────────
function StoreEntryDemo() {
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>The Mini App Store renders bot listings with icon, name, category,
         rating, and a one-tap Open button. This is how API Showcase shows up.</div>

      <div style={{
        padding: 14, borderRadius: 14,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 62, height: 62, borderRadius: 16,
            background: 'linear-gradient(135deg, oklch(0.74 0.16 215), oklch(0.5 0.2 240))',
            color: '#fff', display: 'grid', placeItems: 'center',
            fontFamily: '-apple-system, system-ui',
            fontSize: 22, fontWeight: 800, letterSpacing: -0.6,
            boxShadow: '0 8px 18px rgba(15,80,180,0.32), inset 0 1px 0 rgba(255,255,255,0.35)',
            flexShrink: 0,
          }}>API</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 15, fontWeight: 700, color: 'var(--tg-text)',
            }}>API Showcase</div>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 12, color: 'var(--tg-subtitle-text)', marginTop: 2,
            }}>Developer tools · 83 demos</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
              fontFamily: '-apple-system, system-ui',
              fontSize: 11, color: 'var(--tg-subtitle-text)',
            }}>
              <span style={{ color: 'oklch(0.65 0.2 55)' }}>★ 4.9</span>
              · 12 480 viewers
            </div>
          </div>
          <button style={{
            height: 32, padding: '0 14px', borderRadius: 10, border: 0,
            background: 'var(--tg-button)', color: 'var(--tg-button-text)',
            fontFamily: '-apple-system, system-ui',
            fontSize: 13, fontWeight: 700,
            cursor: 'pointer', flexShrink: 0,
          }}>Open</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  SENSORS (2 — Compass, Horizon)
// ════════════════════════════════════════════════════════════════════════

// ─── 8. Compass — gyroscope-driven heading ──────────────────────────────
function CompassDemo() {
  const [heading, setHeading] = React.useState(0);
  const [running, setRunning] = React.useState(true);

  React.useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setHeading((h) => (h + 1.5) % 360), 60);
    return () => clearInterval(id);
  }, [running]);

  React.useEffect(() => {
    let canceled = false;
    const onOrient = (e) => {
      if (canceled) return;
      const a = (typeof e.webkitCompassHeading === 'number' ? e.webkitCompassHeading : e.alpha);
      if (a != null) { setRunning(false); setHeading(a); }
    };
    window.addEventListener('deviceorientation', onOrient);

    // iOS requires DeviceOrientationEvent.requestPermission() to ride a user
    // gesture. We try once at mount (works if Telegram pre-granted it) and
    // schedule a one-shot retry on the next touch/click so real data starts
    // flowing without an extra "Enable" button.
    const needsGesture = typeof DeviceOrientationEvent !== 'undefined' &&
                         typeof DeviceOrientationEvent.requestPermission === 'function';
    let cleanupGesture = () => {};
    if (needsGesture) {
      try { DeviceOrientationEvent.requestPermission().catch(() => {}); } catch (_) {}
      const retry = () => {
        try { DeviceOrientationEvent.requestPermission().catch(() => {}); } catch (_) {}
        cleanupGesture();
      };
      window.addEventListener('touchstart', retry, { once: true, passive: true });
      window.addEventListener('click', retry, { once: true });
      cleanupGesture = () => {
        window.removeEventListener('touchstart', retry);
        window.removeEventListener('click', retry);
      };
    }
    return () => {
      canceled = true;
      window.removeEventListener('deviceorientation', onOrient);
      cleanupGesture();
    };
  }, []);

  const dir = ['N','NE','E','SE','S','SW','W','NW'][Math.round(heading / 45) % 8];
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>The gyroscope reports yaw as <code style={blCode}>alpha</code> (0–360°).
         The compass needle below follows it; on Desktop it auto-spins.</div>

      <div style={{
        margin: '0 auto', width: 220, height: 220, position: 'relative',
        marginBottom: 14,
      }}>
        <svg viewBox="0 0 220 220" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <radialGradient id="compass-rim" cx="0.5" cy="0.5">
              <stop offset="0.85" stopColor="rgba(0,0,0,0)"/>
              <stop offset="1" stopColor="rgba(0,0,0,0.18)"/>
            </radialGradient>
          </defs>
          <circle cx={110} cy={110} r={104} fill="var(--tg-section-bg)" stroke="var(--tg-section-separator)" strokeWidth={1}/>
          <circle cx={110} cy={110} r={104} fill="url(#compass-rim)"/>
          {/* tick marks */}
          {Array.from({ length: 36 }, (_, i) => {
            const a = (i * 10) * Math.PI / 180;
            const r1 = 96, r2 = i % 9 === 0 ? 80 : 88;
            return <line key={i}
              x1={110 + r1 * Math.sin(a)} y1={110 - r1 * Math.cos(a)}
              x2={110 + r2 * Math.sin(a)} y2={110 - r2 * Math.cos(a)}
              stroke={i % 9 === 0 ? 'var(--tg-text)' : 'var(--tg-section-separator)'}
              strokeWidth={i % 9 === 0 ? 2 : 1}/>;
          })}
          {/* labels */}
          {['N','E','S','W'].map((d, i) => {
            const a = i * 90 * Math.PI / 180;
            const r = 66;
            return <text key={d}
              x={110 + r * Math.sin(a)} y={110 - r * Math.cos(a) + 4}
              textAnchor="middle"
              fontFamily="-apple-system, system-ui"
              fontSize={14} fontWeight={700}
              fill={d === 'N' ? 'oklch(0.55 0.2 25)' : 'var(--tg-text)'}>{d}</text>;
          })}
        </svg>
        {/* needle */}
        <div style={{
          position: 'absolute', inset: 0,
          transform: `rotate(${-heading}deg)`,
          transition: running ? 'none' : 'transform 280ms ease',
        }}>
          <svg viewBox="0 0 220 220">
            <path d="M110 30 L120 110 L110 120 L100 110 z" fill="oklch(0.55 0.2 25)"/>
            <path d="M110 190 L120 110 L110 100 L100 110 z" fill="var(--tg-text)"/>
            <circle cx={110} cy={110} r={5} fill="var(--tg-text)"/>
          </svg>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatChip2 label="Heading" value={`${Math.round(heading)}°`}/>
        <StatChip2 label="Direction" value={dir}/>
      </div>
    </div>
  );
}

function StatChip2({ label, value }) {
  return (
    <div style={{
      padding: 12, borderRadius: 12,
      background: 'var(--tg-section-bg)',
      border: '0.5px solid var(--tg-card-border)',
      boxShadow: 'var(--tg-card-shadow)',
    }}>
      <div style={{
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: 10, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
        color: 'var(--tg-subtitle-text)',
      }}>{label}</div>
      <div style={{
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: 20, fontWeight: 700, color: 'var(--tg-text)', marginTop: 2,
      }}>{value}</div>
    </div>
  );
}

// ─── 9. Horizon — pitch & roll ──────────────────────────────────────────
function HorizonDemo() {
  const [pitch, setPitch] = React.useState(8);
  const [roll, setRoll] = React.useState(-4);
  const [live, setLive] = React.useState(false);

  React.useEffect(() => {
    if (live) return undefined;
    let t = 0;
    const id = setInterval(() => { t += 0.05; setPitch(Math.sin(t) * 22); setRoll(Math.cos(t * 0.7) * 14); }, 50);
    return () => clearInterval(id);
  }, [live]);

  React.useEffect(() => {
    let canceled = false;
    const onOrient = (e) => {
      if (canceled) return;
      if (e.beta != null && e.gamma != null) {
        setLive(true);
        setPitch(e.beta);
        setRoll(e.gamma);
      }
    };
    window.addEventListener('deviceorientation', onOrient);

    // See CompassDemo for the iOS gesture rationale.
    const needsGesture = typeof DeviceOrientationEvent !== 'undefined' &&
                         typeof DeviceOrientationEvent.requestPermission === 'function';
    let cleanupGesture = () => {};
    if (needsGesture) {
      try { DeviceOrientationEvent.requestPermission().catch(() => {}); } catch (_) {}
      const retry = () => {
        try { DeviceOrientationEvent.requestPermission().catch(() => {}); } catch (_) {}
        cleanupGesture();
      };
      window.addEventListener('touchstart', retry, { once: true, passive: true });
      window.addEventListener('click', retry, { once: true });
      cleanupGesture = () => {
        window.removeEventListener('touchstart', retry);
        window.removeEventListener('click', retry);
      };
    }
    return () => {
      canceled = true;
      window.removeEventListener('deviceorientation', onOrient);
      cleanupGesture();
    };
  }, []);

  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Pitch tilts the artificial horizon up/down; roll spins it. Same data
         the accelerometer demo uses, displayed pilot-style.</div>

      <div style={{
        height: 220, borderRadius: 16, overflow: 'hidden',
        position: 'relative',
        background: '#0e1116',
        marginBottom: 14,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          transform: `rotate(${roll}deg) translateY(${pitch * 2}px)`,
          transformOrigin: 'center',
        }}>
          <div style={{
            position: 'absolute', top: '-50%', left: '-30%', right: '-30%', height: '100%',
            background: 'linear-gradient(to bottom, #4ec0ff 0%, #2480c0 100%)',
          }}/>
          <div style={{
            position: 'absolute', bottom: '-50%', left: '-30%', right: '-30%', height: '100%',
            background: 'linear-gradient(to bottom, #6b3e22 0%, #38200f 100%)',
          }}/>
          <div style={{
            position: 'absolute', top: '50%', left: '-30%', right: '-30%', height: 2,
            background: '#fff', boxShadow: '0 0 6px rgba(255,255,255,0.7)',
          }}/>
        </div>
        {/* center reticle */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 60, height: 60, border: '2px solid oklch(0.78 0.18 50)',
          borderRadius: '50%',
        }}/>
        <div style={{
          position: 'absolute', top: '50%', left: 10, right: 10,
          height: 2, background: 'oklch(0.78 0.18 50)',
          transform: 'translateY(-1px)',
          maskImage: 'linear-gradient(to right, transparent 0%, transparent 35%, black 38%, black 45%, transparent 45%, transparent 55%, black 55%, black 62%, transparent 65%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 35%, black 38%, black 45%, transparent 45%, transparent 55%, black 55%, black 62%, transparent 65%, transparent 100%)',
        }}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatChip2 label="Pitch" value={`${Math.round(pitch)}°`}/>
        <StatChip2 label="Roll"  value={`${Math.round(roll)}°`}/>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  LOCATION (1)
// ════════════════════════════════════════════════════════════════════════

function LocationDemo() {
  const tap = useHaptic();
  const [stage, setStage] = React.useState('idle'); // idle | locating | located | denied
  const [coords, setCoords] = React.useState(null);
  const [errorMsg, setErrorMsg] = React.useState(null);

  const handleCoords = (lat, lon, accuracy = null, speed = null) => {
    setCoords({ lat, lon, accuracy, speed });
    setStage('located');
    tap('success');
    setErrorMsg(null);
  };

  const askBrowserGeo = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation not supported.');
      setStage('denied'); tap('error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => handleCoords(pos.coords.latitude, pos.coords.longitude, Math.round(pos.coords.accuracy || 0), pos.coords.speed || 0),
      (err) => {
        setErrorMsg(err.message || 'Permission denied');
        setStage('denied'); tap('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const get = (e) => {
    tap('soft', e); setStage('locating'); setErrorMsg(null);
    const lm = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.LocationManager;
    if (lm && typeof lm.getLocation === 'function') {
      const ask = () => lm.getLocation((data) => {
        if (data && typeof data.latitude === 'number') {
          handleCoords(data.latitude, data.longitude, Math.round(data.horizontal_accuracy || 0), data.speed || 0);
        } else {
          // Telegram refused (permission denied) — fall back to browser geolocation.
          askBrowserGeo();
        }
      });
      if (lm.isInited) ask(); else lm.init(ask);
      return;
    }
    askBrowserGeo();
  };

  // Build an OSM embed URL once we have coords.
  const bbox = coords && (() => {
    const d = 0.005;
    return [coords.lon - d, coords.lat - d, coords.lon + d, coords.lat + d].join(',');
  })();
  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lon}`
    : null;

  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}><code style={blCode}>LocationManager.getLocation()</code> asks the host
         once and returns lat/lon + accuracy. Falls back to <code style={blCode}>navigator.geolocation</code> when the Telegram API isn't available.</div>

      <div style={{
        height: 260, borderRadius: 16, overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(140deg, oklch(0.88 0.05 200) 0%, oklch(0.78 0.07 165) 100%)',
        marginBottom: 14,
        border: '0.5px solid var(--tg-card-border)',
      }}>
        {mapSrc ? (
          <iframe
            title="Your location"
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ width: '100%', height: '100%', border: 0 }}
          />
        ) : stage === 'locating' ? (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'grid', placeItems: 'center',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              border: '3px solid rgba(232,92,111,0.5)',
              animation: 'tg-ripple 1.4s infinite',
            }}/>
          </div>
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'grid', placeItems: 'center',
            padding: 16, textAlign: 'center',
            fontFamily: '-apple-system, system-ui',
            fontSize: 13, color: stage === 'denied' ? 'oklch(0.45 0.15 25)' : 'rgba(0,0,0,0.6)', fontWeight: 600,
          }}>
            {stage === 'denied'
              ? (errorMsg ? `Couldn't get location: ${errorMsg}` : "Permission denied. Enable location in settings.")
              : 'Tap "Locate me" to drop a pin on a real map.'}
          </div>
        )}
        {coords && (
          <div style={{
            position: 'absolute', left: 10, top: 10,
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(255,255,255,0.92)',
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 10, fontWeight: 700, color: '#23130b',
            pointerEvents: 'none',
          }}>{coords.lat.toFixed(4)}° · {coords.lon.toFixed(4)}°{coords.accuracy ? ` · ±${coords.accuracy} m` : ''}</div>
        )}
      </div>

      <MainButton label={stage === 'locating' ? 'Locating…' : stage === 'located' ? 'Refresh' : 'Locate me'}
                  loading={stage === 'locating'} haptic="soft" onClick={get}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  REALTIME (2 — live viewers, haptic echo)
// ════════════════════════════════════════════════════════════════════════

function LiveViewerDemo() {
  const [count, setCount] = React.useState((window.API && window.API.online) || 247);
  const [trend, setTrend] = React.useState(0);
  // Always run the simulation; the moment a real presence message arrives we
  // stop ticking the simulation so the WS feed wins. Previously the fallback
  // never ran when window.API existed, so a quiet WS left the counter frozen.
  React.useEffect(() => {
    const seen = { real: false };
    let unsub = () => {};
    if (window.API && typeof window.API.subscribe === 'function') {
      unsub = window.API.subscribe('presence', (msg) => {
        seen.real = true;
        if (typeof msg.online !== 'number') return;
        setCount((c) => {
          setTrend(msg.online - c);
          return msg.online;
        });
      });
    }
    const id = setInterval(() => {
      if (seen.real) return;
      const delta = Math.floor(Math.random() * 9) - 3;
      setCount((c) => Math.max(80, c + delta));
      setTrend(delta);
    }, 1800);
    return () => { unsub(); clearInterval(id); };
  }, []);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>The Mini App can subscribe to a Redis Pub/Sub topic via a backend
         relay. Counters update sub-second across all devices.</div>

      <div style={{
        height: 230, borderRadius: 18, overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(160deg, oklch(0.72 0.16 165), oklch(0.32 0.18 200))',
        color: '#fff', padding: 22,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        marginBottom: 12,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 6,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: '#fff',
            boxShadow: '0 0 0 4px rgba(255,255,255,0.32)',
            animation: 'tg-cloud-pulse 1.4s ease-in-out infinite',
          }}/>
          <span style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
            opacity: 0.85, fontWeight: 800,
          }}>LIVE</span>
        </div>
        <div key={count} style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 60, fontWeight: 800, letterSpacing: -2, lineHeight: 1,
          animation: 'tg-pop 380ms cubic-bezier(.2,1.6,.3,1)',
        }}>{count.toLocaleString()}</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 14, opacity: 0.85, marginTop: 4,
        }}>people viewing this Mini App right now {trend > 0 && <span style={{ color: '#caffd9' }}>↑ {trend}</span>}{trend < 0 && <span style={{ color: '#ffd6c8' }}>↓ {-trend}</span>}</div>
      </div>
    </div>
  );
}

function HapticEchoDemo() {
  const tap = useHaptic();
  const [bursts, setBursts] = React.useState([]);
  const seqRef = React.useRef(0);

  React.useEffect(() => {
    if (!window.API) return undefined;
    return window.API.subscribe('haptic_echo', (msg) => {
      const id = ++seqRef.current;
      setBursts((bs) => [...bs, { id, t: Date.now() }]);
      tap(msg.style || 'soft', { x: window.innerWidth / 2, y: window.innerHeight * 0.4 });
      setTimeout(() => setBursts((bs) => bs.filter((b) => b.id !== id)), 1100);
    });
  }, [tap]);

  const triggerEcho = (e) => {
    const id = ++seqRef.current;
    tap('medium', e);
    setBursts((bs) => [...bs, { id, t: Date.now() }]);
    if (window.API && window.API.isReady()) {
      window.API.send({ type: 'haptic_emit', target_device: 'any', style: 'heavy' });
    }
    setTimeout(() => {
      tap('soft', { x: window.innerWidth / 2, y: window.innerHeight * 0.4 });
      setBursts((bs) => bs.filter((b) => b.id !== id));
    }, 1100);
  };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Tap one device, another device vibrates ~1 s later. We mock both
         sides — tap the pad and watch the echo travel across.</div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: 18, borderRadius: 18,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
        marginBottom: 14, position: 'relative', overflow: 'hidden',
      }}>
        <DevicePad label="You"  active={bursts.length > 0}/>
        <svg width="44" height="22" viewBox="0 0 44 22" style={{ flexShrink: 0 }}>
          <path d="M2 11 H 42" stroke="var(--tg-section-separator)" strokeWidth={1.5} strokeDasharray="3 3"/>
          {bursts.map((b) => (
            <circle key={b.id} cx={2} cy={11} r={3} fill="var(--tg-accent)"
                    style={{ animation: 'tg-echo-fly 1.1s linear forwards' }}/>
          ))}
        </svg>
        <DevicePad label="Friend" active={false}/>
      </div>

      <PressCard haptic="medium" onPress={triggerEcho}
        style={{
          width: '100%', height: 86, borderRadius: 18,
          background: 'linear-gradient(135deg, oklch(0.65 0.18 165), oklch(0.42 0.2 200))',
          color: '#fff',
          display: 'grid', placeItems: 'center',
          fontFamily: '-apple-system, system-ui',
          fontSize: 16, fontWeight: 700,
          boxShadow: '0 12px 28px oklch(0.5 0.18 180 / 0.3)',
        }}>Tap to send a pulse</PressCard>
    </div>
  );
}

function DevicePad({ label, active }) {
  return (
    <div style={{
      width: 64, height: 96, borderRadius: 11,
      background: active
        ? 'linear-gradient(160deg, oklch(0.62 0.18 165), oklch(0.32 0.2 200))'
        : 'var(--tg-secondary-bg)',
      border: '0.5px solid var(--tg-card-border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 4, flexShrink: 0,
      transition: 'background 220ms',
      animation: active ? 'tg-pulse 600ms ease-in-out' : 'none',
    }}>
      <div style={{ width: 30, height: 4, borderRadius: 2, background: active ? 'rgba(255,255,255,0.6)' : 'var(--tg-section-separator)' }}/>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: active ? '#fff' : 'var(--tg-section-separator)' }}/>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 10, fontWeight: 700,
        color: active ? '#fff' : 'var(--tg-subtitle-text)',
        marginTop: 4,
      }}>{label}</div>
    </div>
  );
}

Object.assign(window, {
  MainButtonLabDemo, SecondaryButtonDemo, SettingsSheetDemo, ChromeColorsDemo,
  CustomSplashDemo, BotPreviewMediasDemo, StoreEntryDemo,
  CompassDemo, HorizonDemo,
  LocationDemo,
  LiveViewerDemo, HapticEchoDemo,
});
