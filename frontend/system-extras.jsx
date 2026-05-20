// system-extras.jsx — System integrations added in v2.0 §4.3 + §4.6.
// Bundled together to keep the file count sane:
//   • CustomMethodInspector — JSON request/response viewer with latency
//   • TONSiteFrame          — tonsite:// embed with fallback state
//   • HideKeyboardDemo      — input + dismiss-keyboard button
//   • ClosingConfirmDemo    — "warn me before closing" toggle + simulated close
//   • ExternalLinkOptions   — try_instant_view + try_browser dropdown
//   • HomeScreenDemo        — 5 states incl. NEW `Failed` state from §4.6

// ─── 1. Custom Method (RPC) Inspector ───────────────────────────────────
function CustomMethodInspector() {
  const tap = useHaptic();
  const [method, setMethod] = React.useState('getInternalState');
  const [params, setParams] = React.useState('{}');
  const [response, setResponse] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [latency, setLatency] = React.useState(null);
  const [paramErr, setParamErr] = React.useState(null);

  const methods = [
    'getInternalState',
    'getRequestedContact',
    'getCurrentTheme',
  ];

  const run = async (e) => {
    tap('soft', e);
    setBusy(true);
    setResponse(null);
    let parsedParams = {};
    try { parsedParams = JSON.parse(params || '{}'); setParamErr(null); }
    catch (err) { setParamErr(err.message); setBusy(false); return; }
    const t0 = performance.now();
    await new Promise((r) => setTimeout(r, 280 + Math.random() * 240));
    const t1 = performance.now();
    setLatency(Math.round(t1 - t0));
    setResponse(MOCK_RESPONSES[method]);
    setBusy(false);
    tap('success');
  };

  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 12,
      }}>The Mini App SDK exposes <code style={codeStyle}>invokeCustomMethod</code>
         — a generic RPC bridge to the host. Pick a method, send a request,
         see what Telegram replies with.</div>

      {/* method picker */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {methods.map((m) => {
          const on = m === method;
          return (
            <PressCard key={m} haptic="selection"
              onPress={() => { setMethod(m); setResponse(null); }}
              style={{
                padding: '6px 10px', borderRadius: 999,
                background: on ? 'var(--tg-button)' : 'var(--tg-secondary-bg)',
                color: on ? 'var(--tg-button-text)' : 'var(--tg-text)',
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11, fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>{m}</PressCard>
          );
        })}
      </div>

      {/* request / response two-pane */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'stretch' }}>
        <Pane title="Request" tint={215}>
          <JSONBlock>
{`{
  "method": "${method}",
  "params": ${prettyParams(params)}
}`}
          </JSONBlock>
        </Pane>
        <Pane title="Response" tint={response ? 145 : 0} muted={!response}>
          {response ? (
            <JSONBlock>{JSON.stringify(response, null, 2)}</JSONBlock>
          ) : (
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 12, color: 'var(--tg-subtitle-text)', textAlign: 'center',
              padding: '12px 8px', lineHeight: 1.4,
            }}>{busy ? 'Awaiting host…' : 'Tap Run to send.'}</div>
          )}
        </Pane>
      </div>

      {/* latency badge between panes */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
        <div style={{
          padding: '4px 10px 4px 8px', borderRadius: 999,
          background: latency
            ? 'color-mix(in oklch, oklch(0.7 0.18 145) 12%, transparent)'
            : 'var(--tg-secondary-bg)',
          color: latency ? 'oklch(0.42 0.16 145)' : 'var(--tg-hint)',
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 11, fontWeight: 700, letterSpacing: 0.1,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: latency ? 'oklch(0.62 0.18 145)' : 'var(--tg-hint)',
          }}/>
          {latency ? `${latency} ms round-trip` : 'idle'}
        </div>
      </div>

      {paramErr && (
        <div style={{
          padding: '8px 10px', borderRadius: 10, marginBottom: 8,
          background: 'color-mix(in oklch, oklch(0.7 0.18 25) 14%, transparent)',
          color: 'oklch(0.5 0.18 25)',
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 11,
        }}>{paramErr}</div>
      )}

      <MainButton label={busy ? 'Sending…' : 'Run'}
                  loading={busy} haptic="soft" onClick={run}/>
    </div>
  );
}

const codeStyle = {
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 11, padding: '0 4px', borderRadius: 4,
  background: 'var(--tg-secondary-bg)',
};

function prettyParams(s) {
  try { return JSON.stringify(JSON.parse(s || '{}'), null, 2).replace(/\n/g, '\n  '); }
  catch (e) { return s; }
}

const MOCK_RESPONSES = {
  getInternalState: {
    version: '9.0',
    platform: 'ios',
    bot_id: 6480219201,
    theme: { is_dark: false, accent: '#2481cc' },
    auth_date: 1748112304,
  },
  getRequestedContact: {
    phone_number: '+380 50 *** ** 12',
    first_name: 'Alex',
    user_id: 802441099,
  },
  getCurrentTheme: {
    bg_color: '#ffffff',
    text_color: '#000000',
    button_color: '#2481cc',
    button_text_color: '#ffffff',
  },
};

function Pane({ title, children, tint = 215, muted = false }) {
  return (
    <div style={{
      background: 'var(--tg-section-bg)',
      border: `0.5px solid color-mix(in oklch, oklch(0.6 0.18 ${tint}) ${muted ? 12 : 24}%, var(--tg-card-border))`,
      borderRadius: 12, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', minHeight: 130,
    }}>
      <div style={{
        padding: '6px 10px',
        background: `color-mix(in oklch, oklch(0.6 0.18 ${tint}) ${muted ? 6 : 12}%, transparent)`,
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: 10, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
        color: muted ? 'var(--tg-subtitle-text)' : `oklch(0.42 0.18 ${tint})`,
      }}>{title}</div>
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 10px' }}>{children}</div>
    </div>
  );
}

function JSONBlock({ children }) {
  return (
    <pre style={{
      margin: 0,
      fontFamily: 'ui-monospace, "SF Mono", monospace',
      fontSize: 10.5, lineHeight: 1.5,
      color: 'var(--tg-text)',
      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    }}>{children}</pre>
  );
}

// ─── 2. TON Site Frame ───────────────────────────────────────────────────
function TONSiteFrame({ url = 'tonsite://hello.ton', supported = true }) {
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      border: '0.5px solid var(--tg-card-border)',
      background: 'var(--tg-section-bg)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 10px',
        background: 'var(--tg-secondary-bg)',
        borderBottom: '0.5px solid var(--tg-section-separator)',
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0098EA, #0855a8)',
          display: 'grid', placeItems: 'center',
          color: '#fff', fontFamily: '-apple-system, system-ui',
          fontSize: 10, fontWeight: 700,
        }}>T</div>
        <div style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 11, color: 'var(--tg-text)', flex: 1,
        }}>{url}</div>
        <span style={{
          padding: '2px 7px', borderRadius: 999,
          background: 'color-mix(in oklch, #0098EA 14%, transparent)',
          color: '#0855a8',
          fontFamily: '-apple-system, system-ui',
          fontSize: 9, fontWeight: 800, letterSpacing: 0.4,
        }}>.TON</span>
      </div>
      {supported ? (
        <div style={{
          padding: '20px 16px',
          minHeight: 160,
          background: 'linear-gradient(135deg, #f0f9ff, #d9eaf7)',
          color: '#0a3a72',
        }}>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 22, fontWeight: 700, letterSpacing: -0.3,
          }}>Hello from TON.</div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 13, marginTop: 6, lineHeight: 1.4, opacity: 0.78,
          }}>This page is served from the TON Sites network — decentralized,
             addressed by domain, rendered inside Telegram.</div>
          <div style={{
            marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap',
          }}>
            {['/whitepaper', '/explorer', '/wallet'].map((s) => (
              <div key={s} style={{
                padding: '5px 9px', borderRadius: 8,
                background: 'rgba(0,152,234,0.14)',
                color: '#0855a8',
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11, fontWeight: 700,
              }}>{s}</div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          padding: '28px 18px', textAlign: 'center',
          color: 'var(--tg-subtitle-text)',
        }}>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 14, fontWeight: 700, color: 'var(--tg-text)',
          }}>TON Sites aren't supported here.</div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 12, marginTop: 6, lineHeight: 1.4,
          }}>Open this Mini App in Telegram for iOS or Android to view the
             embedded site.</div>
        </div>
      )}
    </div>
  );
}

function TONSiteDemo() {
  const [supported, setSupported] = React.useState(true);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Mini Apps can embed <code style={codeStyle}>tonsite://</code> URLs
         directly — no browser jump needed. Older platforms fall back gracefully.</div>
      <TONSiteFrame url="tonsite://hello.ton" supported={supported}/>
      <div style={{ height: 12 }}/>
      <PressCard haptic="selection" onPress={() => setSupported((s) => !s)}
        style={{
          padding: '10px 12px', borderRadius: 12,
          background: 'var(--tg-secondary-bg)',
          textAlign: 'center', display: 'block', width: '100%',
          fontFamily: '-apple-system, system-ui',
          fontSize: 12, fontWeight: 600, color: 'var(--tg-link)',
        }}>{supported ? 'Simulate: TON unsupported on this platform' : 'Restore: TON supported'}</PressCard>
    </div>
  );
}

// ─── 3. Hide keyboard demo ───────────────────────────────────────────────
function HideKeyboardDemo() {
  const tap = useHaptic();
  const inputRef = React.useRef(null);
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Some forms need to programmatically dismiss the virtual keyboard —
         e.g. after autocomplete picks an answer. The SDK exposes <code style={codeStyle}>hideKeyboard()</code>.</div>
      <input ref={inputRef}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder="Type something. The keyboard would be up here."
        style={{
          width: '100%', height: 48, padding: '0 14px',
          borderRadius: 12, border: '1px solid var(--tg-section-separator)',
          background: 'var(--tg-secondary-bg)', color: 'var(--tg-text)',
          fontFamily: '-apple-system, system-ui', fontSize: 14,
          outline: 'none', boxSizing: 'border-box',
        }}/>
      <div style={{ height: 12 }}/>
      <PressCard haptic="soft" disabled={!focused}
        onPress={(e) => { tap('soft', e); inputRef.current && inputRef.current.blur(); }}
        style={{
          padding: '12px', borderRadius: 12,
          background: focused ? 'var(--tg-button)' : 'var(--tg-secondary-bg)',
          color: focused ? 'var(--tg-button-text)' : 'var(--tg-hint)',
          textAlign: 'center', display: 'block', width: '100%',
          fontFamily: '-apple-system, system-ui',
          fontSize: 14, fontWeight: 600,
          opacity: focused ? 1 : 0.6,
          transition: 'all 200ms',
        }}>Dismiss keyboard</PressCard>
      <div style={{
        marginTop: 14, padding: 10, borderRadius: 10,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: 11, color: 'var(--tg-subtitle-text)',
      }}>keyboard_visible: <strong style={{ color: focused ? 'oklch(0.55 0.18 145)' : 'var(--tg-destructive-text)' }}>{String(focused)}</strong></div>
    </div>
  );
}

// ─── 4. Closing confirmation demo ────────────────────────────────────────
function ClosingConfirmDemo() {
  const tap = useHaptic();
  const tg = window.Telegram && window.Telegram.WebApp;
  const [warn, setWarn] = React.useState(true);
  const [edited, setEdited] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);
  React.useEffect(() => {
    if (!tg) return;
    try {
      if (warn) tg.enableClosingConfirmation && tg.enableClosingConfirmation();
      else tg.disableClosingConfirmation && tg.disableClosingConfirmation();
    } catch (e) {}
  }, [warn, tg]);
  const tryClose = (e) => {
    tap('soft', e);
    if (warn && edited) setShowDialog(true);
    else { setEdited(false); }
  };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>When this toggle is on, Telegram shows the native "Changes not saved"
         dialog if the user swipes the Mini App away with unsaved edits.</div>

      <Row label="Warn me before closing" value={warn} onChange={setWarn}/>

      <div style={{
        marginTop: 14, padding: 14, borderRadius: 14,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
      }}>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, fontWeight: 600,
        }}>Draft order</div>
        <textarea value={edited ? 'Two flat whites and a kouign-amann ✨' : ''}
          onChange={(e) => setEdited(!!e.target.value)}
          placeholder="Type to make a fake edit…"
          style={{
            width: '100%', height: 70, marginTop: 8,
            padding: 8, borderRadius: 8,
            border: '1px solid var(--tg-section-separator)',
            background: 'var(--tg-secondary-bg)',
            color: 'var(--tg-text)',
            fontFamily: '-apple-system, system-ui', fontSize: 13,
            outline: 'none', resize: 'none', boxSizing: 'border-box',
          }}/>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 11, color: edited ? 'var(--tg-destructive-text)' : 'var(--tg-subtitle-text)',
          marginTop: 6,
        }}>{edited ? '● unsaved changes' : 'no changes'}</div>
      </div>

      {showDialog && (
        <div onClick={() => setShowDialog(false)} style={{
          position: 'absolute', inset: 0, zIndex: 8,
          background: 'rgba(15,17,20,0.45)',
          display: 'grid', placeItems: 'center', padding: 22,
          animation: 'tg-fade-in 220ms',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--tg-section-bg)', color: 'var(--tg-text)',
            width: '100%', borderRadius: 16, padding: 20, textAlign: 'center',
            animation: 'tg-pop 280ms cubic-bezier(.2,1.6,.3,1)',
          }}>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 17, fontWeight: 700, marginBottom: 4,
            }}>Changes not saved</div>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 13, color: 'var(--tg-subtitle-text)',
              marginBottom: 18,
            }}>Closing now will discard your draft order.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowDialog(false)}
                style={dialogBtn(false)}>Keep editing</button>
              <button onClick={() => { setShowDialog(false); setEdited(false); tap('warning'); }}
                style={dialogBtn(true)}>Discard</button>
            </div>
          </div>
        </div>
      )}

      <MainButton label="Try to close" haptic="soft" onClick={tryClose}/>
    </div>
  );
}

const dialogBtn = (destructive) => ({
  flex: 1, height: 44, borderRadius: 12, border: 0,
  background: destructive ? 'var(--tg-destructive-text)' : 'var(--tg-secondary-bg)',
  color: destructive ? '#fff' : 'var(--tg-text)',
  fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 14,
  cursor: 'pointer',
});

function Row({ label, value, onChange }) {
  const tap = useHaptic();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px', borderRadius: 12,
      background: 'var(--tg-section-bg)',
      border: '0.5px solid var(--tg-card-border)',
    }}>
      <div style={{
        flex: 1,
        fontFamily: '-apple-system, system-ui',
        fontSize: 14, fontWeight: 500, color: 'var(--tg-text)',
      }}>{label}</div>
      <button onClick={(e) => { tap('selection', e); onChange(!value); }}
        style={{
          width: 44, height: 26, borderRadius: 999,
          border: 0, padding: 0, position: 'relative', cursor: 'pointer',
          background: value ? 'oklch(0.65 0.18 145)' : 'var(--tg-section-separator)',
          transition: 'background 200ms',
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

// ─── 5. Home Screen demo — all 5 states incl. v2.0 `Failed` ──────────────
function HomeScreenDemo() {
  const tap = useHaptic();
  const [state, setState] = React.useState('missed');

  const STATES = {
    unsupported: { label: 'Unsupported', hue: 0,   chroma: 0,    icon: '⊘', cta: 'Try on iOS/Android', destructive: false },
    unknown:     { label: 'Unknown',     hue: 230, chroma: 0.04, icon: '?', cta: 'Check status',       destructive: false },
    missed:      { label: 'Not added',   hue: 215, chroma: 0.18, icon: '+', cta: 'Add to home screen', destructive: false },
    added:       { label: 'Added',       hue: 145, chroma: 0.18, icon: '✓', cta: 'On your home screen', destructive: false },
    failed:      { label: 'Failed',      hue: 25,  chroma: 0.16, icon: '!', cta: 'Try again',          destructive: true, isNew: true },
  };
  const cur = STATES[state];

  const tg = window.Telegram && window.Telegram.WebApp;
  React.useEffect(() => {
    if (!tg || typeof tg.onEvent !== 'function') return;
    const sync = (e) => {
      if (e && e.status) setState(e.status === 'added' ? 'added' : e.status === 'missed' ? 'missed' : e.status);
    };
    tg.onEvent('homeScreenChecked', sync);
    tg.onEvent('homeScreenAdded', () => setState('added'));
    tg.onEvent('homeScreenFailed', () => setState('failed'));
    if (typeof tg.checkHomeScreenStatus === 'function') {
      try { tg.checkHomeScreenStatus((status) => sync({ status })); } catch (e) {}
    }
    return () => {
      tg.offEvent && tg.offEvent('homeScreenChecked', sync);
    };
  }, [tg]);

  const press = (e) => {
    tap(state === 'failed' ? 'warning' : 'soft', e);
    if (tg && typeof tg.addToHomeScreen === 'function' && state === 'missed') {
      try { tg.addToHomeScreen(); } catch (err) {}
      return;
    }
    if (state === 'missed') setState('added');
    else if (state === 'failed') setState('missed');
    else if (state === 'added') setState('missed');
  };

  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Five states the SDK reports after asking <code style={codeStyle}>addToHomeScreen()</code>.
         <strong style={{ color: 'var(--tg-text)' }}> Failed</strong> is new in v2.0 — it fires when the host
         couldn't add the icon (separate from "Unsupported").</div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {Object.entries(STATES).map(([k, s]) => {
          const on = k === state;
          return (
            <PressCard key={k} haptic="selection" onPress={() => { setState(k); window.tgLog && window.tgLog('home_screen_' + k); }}
              style={{
                padding: '5px 9px', borderRadius: 999,
                background: on
                  ? `color-mix(in oklch, oklch(0.62 ${s.chroma} ${s.hue}) 22%, transparent)`
                  : 'var(--tg-secondary-bg)',
                color: on ? `oklch(0.42 ${s.chroma} ${s.hue})` : 'var(--tg-text)',
                border: '0.5px solid ' + (on ? `color-mix(in oklch, oklch(0.5 ${s.chroma} ${s.hue}) 40%, transparent)` : 'transparent'),
                fontFamily: '-apple-system, system-ui',
                fontSize: 11, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
              {s.label}
              {s.isNew && (
                <span style={{
                  padding: '0 5px', borderRadius: 4,
                  background: 'oklch(0.62 0.18 25)', color: '#fff',
                  fontFamily: '-apple-system, system-ui',
                  fontSize: 8, fontWeight: 800, letterSpacing: 0.4,
                }}>v2</span>
              )}
            </PressCard>
          );
        })}
      </div>

      {/* mock home-screen tile */}
      <div style={{
        padding: 22, borderRadius: 22, marginBottom: 14,
        background: `linear-gradient(160deg, color-mix(in oklch, oklch(0.62 ${cur.chroma} ${cur.hue}) 26%, var(--tg-secondary-bg)), var(--tg-secondary-bg))`,
        border: `0.5px solid color-mix(in oklch, oklch(0.5 ${cur.chroma} ${cur.hue}) 32%, var(--tg-card-border))`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: `linear-gradient(135deg, oklch(0.7 ${cur.chroma || 0.08} ${cur.hue || 215}), oklch(0.45 ${cur.chroma || 0.1} ${(cur.hue || 215) + 20}))`,
          color: '#fff',
          display: 'grid', placeItems: 'center',
          fontFamily: '-apple-system, system-ui',
          fontSize: 30, fontWeight: 700,
          boxShadow: '0 12px 26px color-mix(in oklch, oklch(0.55 0.2 215) 24%, transparent), inset 0 1px 0 rgba(255,255,255,0.35)',
        }}>{cur.icon}</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, fontWeight: 600, color: 'var(--tg-text)',
        }}>API Showcase</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 12, color: `oklch(0.42 ${cur.chroma} ${cur.hue})`,
          fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
        }}>{cur.label}</div>
        {state === 'added' && (
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ position: 'absolute', top: 12, right: 12, color: 'oklch(0.5 0.18 50)' }}>
            <path d="M12 2 L14.6 8.5 L21.5 9 L16 13.8 L18 21 L12 17 L6 21 L8 13.8 L2.5 9 L9.4 8.5 z"
                  fill="currentColor"/>
          </svg>
        )}
      </div>

      <MainButton label={cur.cta} haptic={state === 'failed' ? 'warning' : 'soft'}
                  variant={cur.destructive ? 'destructive' : 'primary'}
                  onClick={press}/>
    </div>
  );
}

Object.assign(window, {
  CustomMethodInspector, TONSiteFrame, TONSiteDemo,
  HideKeyboardDemo, ClosingConfirmDemo, HomeScreenDemo,
});
