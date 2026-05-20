// identity-viewport.jsx — eight demos covering the Identity & Theme and
// Viewport & Safe Area categories. One focused screen per demo, sharing the
// existing Tweaks panel for user identity (so changing the greeting name
// updates both onboarding and these demos).

// ════════════════════════════════════════════════════════════════════════
//  IDENTITY & THEME (3)
// ════════════════════════════════════════════════════════════════════════

// ─── 1. Who am I — verified user payload ────────────────────────────────
function WhoAmIDemo() {
  // Prefer the verified user payload from the backend (initData → JWT).
  // Falls back to the tweak-panel mock when running outside Telegram.
  const tweakName = (window.__TG_USER_NAME__ || 'Alex');
  const [apiUser, setApiUser] = React.useState(window.API && window.API.user);
  React.useEffect(() => {
    if (!window.API) return undefined;
    const sync = () => setApiUser(window.API.user);
    sync();
    return window.API.subscribe('ready', sync);
  }, []);
  const userName = (apiUser && apiUser.first_name) || tweakName;
  const user = apiUser ? {
    id: apiUser.tg_id,
    first_name: apiUser.first_name || tweakName,
    last_name: apiUser.last_name || '',
    username: apiUser.username || userName.toLowerCase() + '_c',
    language_code: apiUser.language_code || 'en',
    is_premium: !!apiUser.is_premium,
    photo_url: apiUser.photo_url,
    allows_write_to_pm: true,
  } : {
    id: 802441099,
    first_name: tweakName,
    last_name: 'Carter',
    username: tweakName.toLowerCase() + '_c',
    language_code: 'en',
    is_premium: document.documentElement.dataset.premium === '1',
    photo_url: null,
    allows_write_to_pm: true,
  };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>The Mini App boots with a signed <code style={ivCode}>initData</code> payload
         from Telegram. No login screen — the bot knows who you are within milliseconds.</div>

      <div style={{
        padding: 16, borderRadius: 18,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, oklch(0.74 0.16 215), oklch(0.45 0.2 240))',
          color: '#fff', display: 'grid', placeItems: 'center',
          fontFamily: '-apple-system, system-ui',
          fontSize: 26, fontWeight: 700,
        }}>{userName[0]}</div>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: '-apple-system, system-ui',
            fontSize: 17, fontWeight: 700,
          }}>{user.first_name} {user.last_name}
            <svg width="14" height="14" viewBox="0 0 14 14" style={{ color: 'var(--tg-accent)' }}>
              <path d="M7 1.2 L10 3 L13 3.5 L12 6.5 L13 9.5 L10 10 L7 11.8 L4 10 L1 9.5 L2 6.5 L1 3.5 L4 3 z" fill="currentColor"/>
              <path d="M4.5 7 L6 8.5 L9.5 5" stroke="#fff" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 12, color: 'var(--tg-subtitle-text)',
          }}>@{user.username} · id {user.id}</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6,
            padding: '2px 8px', borderRadius: 999,
            background: 'color-mix(in oklch, oklch(0.7 0.18 145) 14%, transparent)',
            color: 'oklch(0.42 0.16 145)',
            fontFamily: '-apple-system, system-ui',
            fontSize: 10, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}/>
            Verified · 6 ms
          </div>
        </div>
      </div>

      <div style={{
        padding: 12, borderRadius: 12,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
      }}>
        <div style={ivPaneHeader}>initDataUnsafe.user</div>
        <pre style={ivJsonPre}>{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  );
}

const ivCode = {
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 11, padding: '0 4px', borderRadius: 4,
  background: 'var(--tg-secondary-bg)',
};
const ivPaneHeader = {
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 10, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
  color: 'var(--tg-subtitle-text)', marginBottom: 6,
};
const ivJsonPre = {
  margin: 0,
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 10.5, lineHeight: 1.5, color: 'var(--tg-text)',
  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
};

// ─── 2. Dynamic theme — light / dark morph + token table ────────────────
function DynamicThemeDemo() {
  const tap = useHaptic();
  const [theme, setTheme] = React.useState(document.documentElement.dataset.tgMode || 'light');
  const apply = (id, e) => {
    tap('selection', e); setTheme(id); applyTheme(id);
    window.API && window.API.track && window.API.track('theme_changed', { theme: id });
  };
  const tokens = [
    { name: '--tg-bg' },
    { name: '--tg-text' },
    { name: '--tg-button' },
    { name: '--tg-button-text' },
    { name: '--tg-accent' },
    { name: '--tg-section-bg' },
    { name: '--tg-secondary-bg' },
    { name: '--tg-hint' },
  ];
  const cs = getComputedStyle(document.documentElement);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Telegram pushes its theme tokens to the Mini App on launch and re-pushes
         on every system change. The page applies them as CSS custom properties —
         every component re-tints in 220 ms.</div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {['light', 'dark', 'coral'].map((id) => {
          const on = theme === id;
          const t = THEMES[id];
          return (
            <PressCard key={id} haptic="selection" onPress={(e) => apply(id, e)}
              style={{
                flex: 1, padding: 12, borderRadius: 12,
                background: t['--tg-bg'],
                border: '1.5px solid ' + (on ? 'var(--tg-accent)' : 'var(--tg-card-border)'),
                color: t['--tg-text'],
                textAlign: 'center',
                fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 12,
                transition: 'border 200ms',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}>
              {id}
            </PressCard>
          );
        })}
      </div>

      <div style={{
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        borderRadius: 14, overflow: 'hidden',
        boxShadow: 'var(--tg-card-shadow)',
      }}>
        {tokens.map((tk, i) => {
          const val = cs.getPropertyValue(tk.name).trim() || '—';
          return (
            <div key={tk.name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              borderBottom: i === tokens.length - 1 ? 'none' : '0.5px solid var(--tg-section-separator)',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8,
                background: val.startsWith('#') || val.startsWith('rgb') ? val : 'transparent',
                border: '0.5px solid var(--tg-section-separator)',
              }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  fontSize: 11, color: 'var(--tg-text)', fontWeight: 600,
                }}>{tk.name}</div>
                <div style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  fontSize: 10, color: 'var(--tg-subtitle-text)', marginTop: 1,
                }}>{val}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 3. Platform & version — capability chips ───────────────────────────
function PlatformDemo() {
  const tg = window.Telegram && window.Telegram.WebApp;
  const tgPlatform = (tg && tg.platform) || null;
  const tgVersion = (tg && tg.version) || null;
  const platform = tgPlatform
    || (navigator.platform.includes('Mac') ? 'macos'
        : navigator.platform.includes('Win') ? 'windows'
        : navigator.platform.includes('Linux') ? 'linux'
        : /iPhone|iPad/.test(navigator.userAgent) ? 'ios'
        : /Android/.test(navigator.userAgent) ? 'android'
        : 'web');
  const isMobile = platform === 'ios' || platform === 'android';
  const isDesktop = ['macos', 'windows', 'linux', 'tdesktop'].includes(platform);
  const caps = [
    { name: 'BiometricManager', ok: isMobile },
    { name: 'Accelerometer',    ok: isMobile },
    { name: 'Gyroscope',        ok: isMobile },
    { name: 'DeviceOrientation', ok: true },
    { name: 'HapticFeedback',   ok: isMobile },
    { name: 'QrTextReceived',   ok: isMobile },
    { name: 'CloudStorage',     ok: true },
    { name: 'SecureStorage',    ok: isMobile },
    { name: 'TONSites',         ok: isMobile },
    { name: 'addToHomeScreen',  ok: isMobile },
    { name: 'requestFullscreen', ok: true },
    { name: 'invokeCustomMethod', ok: true },
  ];
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Capabilities aren't uniform — iOS gets the full set, Desktop loses
         haptics + sensors, Web loses TON Sites. Check before you call.</div>

      <div style={{
        padding: 14, borderRadius: 14,
        background: 'linear-gradient(135deg, oklch(0.78 0.07 215), oklch(0.45 0.18 240))',
        color: '#fff', marginBottom: 14,
      }}>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
          opacity: 0.78, fontWeight: 800,
        }}>Detected platform</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 26, fontWeight: 700, letterSpacing: -0.4, marginTop: 2,
        }}>{platform}</div>
        <div style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 11, opacity: 0.78, marginTop: 4,
        }}>tg.version = "{tgVersion || '—'}" · tg.platform = "{platform}"</div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {caps.map((c) => (
          <span key={c.name} style={{
            padding: '5px 10px', borderRadius: 999,
            background: c.ok
              ? 'color-mix(in oklch, oklch(0.7 0.18 145) 14%, transparent)'
              : 'var(--tg-secondary-bg)',
            color: c.ok ? 'oklch(0.42 0.16 145)' : 'var(--tg-hint)',
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 11, fontWeight: 600,
            textDecoration: c.ok ? 'none' : 'line-through',
            opacity: c.ok ? 1 : 0.6,
          }}>
            {c.ok ? '✓' : '⊘'} {c.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  VIEWPORT & SAFE AREA (5)
// ════════════════════════════════════════════════════════════════════════

// ─── 4. Viewport meter — live height readout ────────────────────────────
function ViewportMeterDemo() {
  const tg = window.Telegram && window.Telegram.WebApp;
  const [vh, setVh] = React.useState((tg && tg.viewportHeight) || window.innerHeight);
  const [stable, setStable] = React.useState(true);
  const [expanded, setExpanded] = React.useState(tg ? !!tg.isExpanded : true);
  React.useEffect(() => {
    if (tg && typeof tg.onEvent === 'function') {
      const onViewport = (e) => {
        setVh(tg.viewportHeight || window.innerHeight);
        setStable(typeof e?.isStateStable === 'boolean' ? e.isStateStable : true);
        setExpanded(!!tg.isExpanded);
      };
      tg.onEvent('viewportChanged', onViewport);
      onViewport({ isStateStable: true });
      return () => tg.offEvent && tg.offEvent('viewportChanged', onViewport);
    }
    const onResize = () => { setVh(window.innerHeight); setStable(false); setTimeout(() => setStable(true), 600); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>The Mini App can be half-height or full-height, swiped, or hidden by
         the keyboard. The SDK fires <code style={ivCode}>viewport_changed</code> with
         <code style={ivCode}> height</code> and <code style={ivCode}>is_state_stable</code>.</div>

      <div style={{
        padding: 18, borderRadius: 16,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
        textAlign: 'center', marginBottom: 14,
      }}>
        <div style={ivPaneHeader}>viewport.height</div>
        <div style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 44, fontWeight: 700, color: 'var(--tg-text)', letterSpacing: -1,
        }}>{vh}</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 12, color: 'var(--tg-subtitle-text)', marginTop: 4,
        }}>px tall right now</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatChip label="State" value={stable ? 'stable' : 'animating'} ok={stable}/>
        <StatChip label="Mode" value={expanded ? 'expanded' : 'half'} ok={expanded}/>
      </div>
    </div>
  );
}

function StatChip({ label, value, ok }) {
  return (
    <div style={{
      padding: 12, borderRadius: 12,
      background: ok
        ? 'color-mix(in oklch, oklch(0.7 0.18 145) 10%, var(--tg-section-bg))'
        : 'color-mix(in oklch, oklch(0.7 0.18 45) 10%, var(--tg-section-bg))',
      border: '0.5px solid var(--tg-card-border)',
    }}>
      <div style={ivPaneHeader}>{label}</div>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 16, fontWeight: 700, color: 'var(--tg-text)', marginTop: 2,
      }}>{value}</div>
    </div>
  );
}

// ─── 5. Vertical swipes — protect accidental close ──────────────────────
function VerticalSwipesDemo() {
  const tap = useHaptic();
  const tg = window.Telegram && window.Telegram.WebApp;
  const [enabled, setEnabled] = React.useState(false);
  React.useEffect(() => {
    if (!tg) return;
    try {
      if (enabled) tg.disableVerticalSwipes && tg.disableVerticalSwipes();
      else tg.enableVerticalSwipes && tg.enableVerticalSwipes();
    } catch (e) {}
    window.API && window.API.track && window.API.track('vertical_swipes_toggled', { disabled: enabled });
  }, [enabled, tg]);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>By default, a downward swipe near the top closes the Mini App.
         Disable it for canvases that scroll vertically — drawing, panning maps,
         long forms — so the user doesn't bail accidentally.</div>

      <div style={{ position: 'relative', height: 220, borderRadius: 18, overflow: 'hidden',
                    background: 'linear-gradient(160deg, oklch(0.4 0.16 235), oklch(0.22 0.12 260))',
                    color: '#fff', padding: 18, marginBottom: 14, }}>
        <div style={ivPaneHeader}>Drag area (mock)</div>
        <div style={{
          position: 'absolute', top: 16, right: 14,
          padding: '4px 8px', borderRadius: 999,
          background: enabled ? 'rgba(80,180,90,0.32)' : 'rgba(255,80,80,0.32)',
          backdropFilter: 'blur(6px)',
          fontFamily: '-apple-system, system-ui',
          fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
        }}>{enabled ? 'SWIPES BLOCKED' : 'SWIPES ACTIVE'}</div>
        {/* fake stroke trails */}
        <svg viewBox="0 0 240 160" width="100%" height="100%" style={{ position: 'absolute', inset: 18 }}>
          <path d="M30 20 Q90 80 60 130 Q40 150 90 140" stroke="rgba(255,255,255,0.7)" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M150 30 Q180 60 140 90 Q110 110 160 130" stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </svg>
      </div>

      <Toggle2 label="Disable vertical swipes" value={enabled}
        hint="Prevents accidental swipe-to-close while the user is drawing."
        onChange={(v) => { tap('selection'); setEnabled(v); }}/>
    </div>
  );
}

// Local toggle (avoids name collision across files).
function Toggle2({ label, hint, value, onChange }) {
  const tap = useHaptic();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px', borderRadius: 12,
      background: 'var(--tg-section-bg)',
      border: '0.5px solid var(--tg-card-border)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 14, fontWeight: 600, color: 'var(--tg-text)',
        }}>{label}</div>
        {hint && (
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 11, color: 'var(--tg-subtitle-text)', marginTop: 2, lineHeight: 1.35,
          }}>{hint}</div>
        )}
      </div>
      <button onClick={(e) => { tap('selection', e); onChange(!value); }}
        style={{
          width: 44, height: 26, borderRadius: 999, border: 0, padding: 0,
          background: value ? 'oklch(0.65 0.18 145)' : 'var(--tg-section-separator)',
          position: 'relative', cursor: 'pointer', transition: 'background 200ms',
          flexShrink: 0,
        }}>
        <span style={{
          position: 'absolute', top: 2, left: value ? 20 : 2,
          width: 22, height: 22, borderRadius: '50%',
          background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 200ms cubic-bezier(.2,.7,.3,1)',
        }}/>
      </button>
    </div>
  );
}

// ─── 6. Fullscreen — enter / exit ───────────────────────────────────────
function FullscreenDemo() {
  const tap = useHaptic();
  const tg = window.Telegram && window.Telegram.WebApp;
  const [fs, setFs] = React.useState(tg ? !!tg.isFullscreen : false);
  React.useEffect(() => {
    if (!tg || typeof tg.onEvent !== 'function') return;
    const sync = () => setFs(!!tg.isFullscreen);
    tg.onEvent('fullscreenChanged', sync);
    tg.onEvent('fullscreenFailed', sync);
    return () => {
      tg.offEvent && tg.offEvent('fullscreenChanged', sync);
      tg.offEvent && tg.offEvent('fullscreenFailed', sync);
    };
  }, [tg]);
  const toggle = (e) => {
    tap('medium', e);
    const wasFs = tg ? tg.isFullscreen : fs;
    if (tg) {
      try {
        if (tg.isFullscreen) tg.exitFullscreen && tg.exitFullscreen();
        else tg.requestFullscreen && tg.requestFullscreen();
      } catch (err) {}
    }
    setFs((f) => !f);
    window.API && window.API.track && window.API.track('fullscreen_toggled', { enabled: !wasFs });
  };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Mini Apps can request true fullscreen — chrome retracts, dynamic island
         tucks under, the Mini App spans the whole screen. Useful for games + media.</div>

      <div style={{
        height: 260, borderRadius: 18, overflow: 'hidden',
        background: fs
          ? 'linear-gradient(160deg, oklch(0.25 0.16 280), oklch(0.1 0.12 260))'
          : 'linear-gradient(160deg, oklch(0.6 0.1 220), oklch(0.4 0.14 240))',
        position: 'relative',
        transition: 'background 400ms',
        marginBottom: 14,
        color: '#fff', padding: 16,
      }}>
        {/* fake phone frame */}
        <div style={{
          position: 'absolute', inset: fs ? 8 : 24,
          borderRadius: fs ? 14 : 22,
          background: 'rgba(255,255,255,0.1)',
          border: '2px solid rgba(255,255,255,0.55)',
          transition: 'inset 400ms cubic-bezier(.2,.7,.3,1), border-radius 400ms',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '8px 14px', fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 11, color: 'rgba(255,255,255,0.7)',
            opacity: fs ? 0 : 1, transition: 'opacity 200ms',
          }}><span>9:41</span><span>chrome</span></div>
          <div style={{
            display: 'grid', placeItems: 'center', height: 'calc(100% - 30px)',
            fontFamily: '-apple-system, system-ui',
            fontSize: fs ? 22 : 14, fontWeight: 700,
            transition: 'font-size 400ms',
          }}>{fs ? 'Immersed.' : 'Mini App content'}</div>
        </div>
      </div>

      <MainButton label={fs ? 'Exit fullscreen' : 'Request fullscreen'}
        haptic="medium" onClick={toggle}/>
    </div>
  );
}

// ─── 7. Safe Area — inset visualizer ────────────────────────────────────
function SafeAreaDemo() {
  const tg = window.Telegram && window.Telegram.WebApp;
  const [insets, setInsets] = React.useState(() => {
    if (tg && tg.contentSafeAreaInset) return { ...tg.contentSafeAreaInset };
    if (tg && tg.safeAreaInset) return { ...tg.safeAreaInset };
    return { top: 44, right: 0, bottom: 34, left: 0 };
  });
  React.useEffect(() => {
    if (!tg || typeof tg.onEvent !== 'function') return;
    const sync = () => setInsets({ ...(tg.contentSafeAreaInset || tg.safeAreaInset || {}) });
    tg.onEvent('safeAreaChanged', sync);
    tg.onEvent('contentSafeAreaChanged', sync);
    return () => {
      tg.offEvent && tg.offEvent('safeAreaChanged', sync);
      tg.offEvent && tg.offEvent('contentSafeAreaChanged', sync);
    };
  }, [tg]);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Safe-area insets push your content away from notches, dynamic islands,
         home indicators, and Telegram's own chrome. Use them via CSS
         <code style={ivCode}>env(safe-area-inset-*)</code> or read them from
         <code style={ivCode}>safeAreaInset</code> in JS.</div>

      <div style={{
        position: 'relative', height: 260, borderRadius: 18, overflow: 'hidden',
        background: 'var(--tg-secondary-bg)',
        border: '0.5px solid var(--tg-card-border)',
        marginBottom: 14,
      }}>
        {/* unsafe zones */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: insets.top,
          background: 'repeating-linear-gradient(45deg, color-mix(in oklch, oklch(0.7 0.18 25) 18%, transparent), color-mix(in oklch, oklch(0.7 0.18 25) 18%, transparent) 6px, transparent 6px, transparent 12px)',
        }}/>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: insets.bottom,
          background: 'repeating-linear-gradient(45deg, color-mix(in oklch, oklch(0.7 0.18 25) 18%, transparent), color-mix(in oklch, oklch(0.7 0.18 25) 18%, transparent) 6px, transparent 6px, transparent 12px)',
        }}/>
        {/* safe zone */}
        <div style={{
          position: 'absolute',
          top: insets.top, right: insets.right, bottom: insets.bottom, left: insets.left,
          background: 'color-mix(in oklch, oklch(0.7 0.18 145) 12%, var(--tg-section-bg))',
          border: '1.5px solid oklch(0.6 0.18 145)',
          borderRadius: 6,
          display: 'grid', placeItems: 'center',
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, fontWeight: 700,
          color: 'oklch(0.42 0.16 145)',
        }}>SAFE</div>
        {/* labels */}
        <div style={{
          position: 'absolute', top: 6, left: 8,
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 10, fontWeight: 700, color: 'oklch(0.45 0.18 25)',
        }}>top: {insets.top}px</div>
        <div style={{
          position: 'absolute', bottom: 6, left: 8,
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 10, fontWeight: 700, color: 'oklch(0.45 0.18 25)',
        }}>bottom: {insets.bottom}px</div>
      </div>

      <pre style={{
        ...ivJsonPre,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        borderRadius: 10, padding: 10,
      }}>{JSON.stringify(insets, null, 2)}</pre>
    </div>
  );
}

// ─── 8. Lock orientation ─────────────────────────────────────────────────
function LockOrientationDemo() {
  const tap = useHaptic();
  const tg = window.Telegram && window.Telegram.WebApp;
  const [locked, setLocked] = React.useState('portrait');
  React.useEffect(() => {
    if (!tg) return;
    try {
      if (locked === 'any') tg.unlockOrientation && tg.unlockOrientation();
      else if (typeof tg.lockOrientation === 'function') tg.lockOrientation(locked);
      else if (screen.orientation && screen.orientation.lock) screen.orientation.lock(locked).catch(() => {});
    } catch (e) {}
    window.API && window.API.track && window.API.track('orientation_locked', { mode: locked });
  }, [locked, tg]);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Apps that don't make sense in landscape (forms, chats, lots of mini-apps)
         can pin to portrait. The host respects the lock for the entire session.</div>

      <div style={{
        height: 220, borderRadius: 18,
        background: 'var(--tg-secondary-bg)',
        border: '0.5px solid var(--tg-card-border)',
        display: 'grid', placeItems: 'center',
        marginBottom: 14, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          width: locked === 'portrait' ? 90 : 160,
          height: locked === 'portrait' ? 160 : 90,
          borderRadius: 14,
          background: 'linear-gradient(135deg, oklch(0.78 0.16 215), oklch(0.45 0.2 240))',
          color: '#fff', display: 'grid', placeItems: 'center',
          fontFamily: '-apple-system, system-ui',
          fontSize: 11, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
          boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
          transition: 'all 460ms cubic-bezier(.2,.7,.3,1)',
        }}>{locked}</div>
      </div>

      <div style={{ display: 'flex', gap: 6, padding: 4, borderRadius: 11, background: 'var(--tg-secondary-bg)' }}>
        {['portrait', 'landscape', 'any'].map((o) => {
          const on = locked === o;
          return (
            <PressCard key={o} haptic="selection"
              onPress={(e) => { tap('selection', e); setLocked(o); }}
              style={{
                flex: 1, padding: '8px', borderRadius: 9,
                background: on ? 'var(--tg-section-bg)' : 'transparent',
                boxShadow: on ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                textAlign: 'center',
                color: on ? 'var(--tg-text)' : 'var(--tg-subtitle-text)',
                fontFamily: '-apple-system, system-ui',
                fontSize: 12, fontWeight: 600,
              }}>{o}</PressCard>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, {
  WhoAmIDemo, DynamicThemeDemo, PlatformDemo,
  ViewportMeterDemo, VerticalSwipesDemo, FullscreenDemo,
  SafeAreaDemo, LockOrientationDemo,
});
