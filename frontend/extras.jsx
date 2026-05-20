// extras.jsx — the small/medium demos that filled the v2 MoreTile placeholders.
// Six system-and-premium demos and six gift sub-flows. Each is intentionally
// compact (one screen, one wow-moment) — the gallery is wide and we'd rather
// have many sharp surfaces than a handful of bloated ones.

// ════════════════════════════════════════════════════════════════════════
//  SYSTEM (3) — phone-only / open-Telegram-link / external link options
// ════════════════════════════════════════════════════════════════════════

// ─── Phone-only request — distinct from contact request ─────────────────
function PhoneOnlyDemo() {
  const tap = useHaptic();
  const [picked, setPicked] = React.useState(null); // 'phone' | 'contact' | null
  const sample = picked === 'phone'
    ? { phone_number: '+380 50 555 04 12' }
    : picked === 'contact'
    ? { phone_number: '+380 50 555 04 12', first_name: 'Alex', last_name: 'Carter', user_id: 802441099, vcard: 'BEGIN:VCARD\nVERSION:3.0\nFN:Alex Carter\nTEL:+380505550412\nEND:VCARD' }
    : null;
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Two distinct host APIs: <code style={extrasCodeStyle}>requestPhone</code> returns
         just the number, while <code style={extrasCodeStyle}>requestContact</code> hands back
         the full vCard. Side-by-side they make the trade-off obvious.</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <PressCard haptic="soft" onPress={() => { tap('success'); setPicked('phone'); }}
          style={tradeCardStyle(picked === 'phone', 200)}>
          <div style={{ fontSize: 22 }}>📞</div>
          <div style={tradeTitleStyle}>Phone only</div>
          <div style={tradeHintStyle}>Minimal scope · just the number</div>
        </PressCard>
        <PressCard haptic="soft" onPress={() => { tap('success'); setPicked('contact'); }}
          style={tradeCardStyle(picked === 'contact', 50)}>
          <div style={{ fontSize: 22 }}>📇</div>
          <div style={tradeTitleStyle}>Full contact</div>
          <div style={tradeHintStyle}>Number + name + vCard</div>
        </PressCard>
      </div>

      {sample && (
        <div style={{
          marginTop: 14, padding: 12, borderRadius: 12,
          background: 'var(--tg-section-bg)',
          border: '0.5px solid var(--tg-card-border)',
          boxShadow: 'var(--tg-card-shadow)',
          animation: 'tg-pop 320ms cubic-bezier(.2,1.6,.3,1)',
        }}>
          <div style={{
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 10, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
            color: 'var(--tg-subtitle-text)', marginBottom: 6,
          }}>Returned payload</div>
          <pre style={extrasJsonPre}>{JSON.stringify(sample, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

const tradeCardStyle = (on, hue) => ({
  padding: 14, borderRadius: 14,
  background: on
    ? `linear-gradient(160deg, oklch(0.78 0.14 ${hue}), oklch(0.55 0.18 ${hue + 24}))`
    : 'var(--tg-section-bg)',
  color: on ? '#fff' : 'var(--tg-text)',
  border: '0.5px solid ' + (on ? 'transparent' : 'var(--tg-card-border)'),
  boxShadow: on
    ? `0 10px 24px oklch(0.55 0.18 ${hue} / 0.32)`
    : 'var(--tg-card-shadow)',
  transition: 'all 220ms',
  display: 'flex', flexDirection: 'column', gap: 6, minHeight: 90, textAlign: 'left',
});
const tradeTitleStyle = {
  fontFamily: '-apple-system, system-ui', fontSize: 14, fontWeight: 700,
  letterSpacing: -0.1,
};
const tradeHintStyle = {
  fontFamily: '-apple-system, system-ui', fontSize: 11, opacity: 0.78,
  marginTop: 'auto', lineHeight: 1.3,
};
const extrasCodeStyle = {
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 11, padding: '0 4px', borderRadius: 4,
  background: 'var(--tg-secondary-bg)',
};
const extrasJsonPre = {
  margin: 0,
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 10.5, lineHeight: 1.5, color: 'var(--tg-text)',
  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
};

// ─── Open a t.me/... link from inside the Mini App ──────────────────────
function OpenTelegramLinkDemo() {
  const tap = useHaptic();
  const [url, setUrl] = React.useState('t.me/durov/12345');
  const [opening, setOpening] = React.useState(false);
  const [opened, setOpened] = React.useState(null);
  const open = (e) => {
    tap('soft', e);
    setOpening(true); setOpened(null);
    setTimeout(() => { setOpening(false); setOpened(url); tap('success'); }, 700);
  };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}><code style={extrasCodeStyle}>openTelegramLink</code> hands a <code style={extrasCodeStyle}>t.me/…</code> URL
         to the host, which routes it inline — no jump to Safari.</div>
      <input value={url} onChange={(e) => setUrl(e.target.value)}
        style={{
          width: '100%', height: 46, padding: '0 14px',
          borderRadius: 12, border: '1px solid var(--tg-section-separator)',
          background: 'var(--tg-secondary-bg)',
          color: 'var(--tg-text)',
          fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 13,
          outline: 'none', boxSizing: 'border-box',
        }}/>
      <div style={{ height: 12 }}/>
      {opened && (
        <div style={{
          padding: 14, borderRadius: 14, marginBottom: 12,
          background: 'var(--tg-section-bg)',
          border: '0.5px solid var(--tg-card-border)',
          boxShadow: 'var(--tg-card-shadow)',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'tg-pop 320ms cubic-bezier(.2,1.6,.3,1)',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #2481cc, #0a84ff)',
            color: '#fff', display: 'grid', placeItems: 'center', fontSize: 18,
          }}>✈</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 13, fontWeight: 600, color: 'var(--tg-text)',
            }}>Opened in Telegram</div>
            <div style={{
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 11, color: 'var(--tg-subtitle-text)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{opened}</div>
          </div>
        </div>
      )}
      <MainButton label={opening ? 'Routing…' : 'Open link'}
                  loading={opening} haptic="soft" onClick={open}/>
    </div>
  );
}

// ─── External link options — try_instant_view + try_browser dropdown ────
function BrowserOptionsDemo() {
  const tap = useHaptic();
  const [iv, setIv] = React.useState(true);
  const [browser, setBrowser] = React.useState('default');
  const BROWSERS = [
    { id: 'default', label: 'Default', tint: 215 },
    { id: 'chrome',  label: 'Chrome',  tint: 60 },
    { id: 'firefox', label: 'Firefox', tint: 25 },
    { id: 'safari',  label: 'Safari',  tint: 200 },
    { id: 'brave',   label: 'Brave',   tint: 35 },
  ];
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}><code style={extrasCodeStyle}>openLink</code> takes flags. The platform respects them
         where it can; on Desktop the browser picker is meaningful, on iOS only Safari.</div>

      <Toggle label="Try Instant View first"
        hint="If the URL has an IV template, render that instead of the page."
        value={iv} onChange={setIv}/>

      <div style={{ marginTop: 14 }}>
        <div style={extrasSectionHeader}>try_browser</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {BROWSERS.map((b) => {
            const on = b.id === browser;
            return (
              <PressCard key={b.id} haptic="selection"
                onPress={() => { tap('selection'); setBrowser(b.id); }}
                style={{
                  padding: '7px 12px', borderRadius: 999,
                  background: on
                    ? `color-mix(in oklch, oklch(0.62 0.18 ${b.tint}) 22%, transparent)`
                    : 'var(--tg-secondary-bg)',
                  color: on ? `oklch(0.42 0.18 ${b.tint})` : 'var(--tg-text)',
                  border: '0.5px solid ' + (on ? `color-mix(in oklch, oklch(0.5 0.18 ${b.tint}) 38%, transparent)` : 'transparent'),
                  fontFamily: '-apple-system, system-ui',
                  fontSize: 12, fontWeight: 600,
                }}>{b.label}</PressCard>
            );
          })}
        </div>
      </div>

      <div style={{
        marginTop: 18, padding: 12, borderRadius: 12,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
      }}>
        <div style={extrasSectionHeader}>Resulting call</div>
        <pre style={extrasJsonPre}>{`openLink("https://example.com", {
  try_instant_view: ${iv},
  try_browser: "${browser}"
})`}</pre>
      </div>
    </div>
  );
}

const extrasSectionHeader = {
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 10, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
  color: 'var(--tg-subtitle-text)', marginBottom: 6,
};

function Toggle({ label, hint, value, onChange }) {
  const tap = useHaptic();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px', borderRadius: 12,
      background: 'var(--tg-section-bg)',
      border: '0.5px solid var(--tg-card-border)',
      boxShadow: 'var(--tg-card-shadow)',
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

// ════════════════════════════════════════════════════════════════════════
//  PREMIUM (3) — voice-to-text / animated profile videos / folder tags
// ════════════════════════════════════════════════════════════════════════

function VoiceToTextDemo() {
  const tap = useHaptic();
  const [stage, setStage] = React.useState('idle'); // idle | playing | transcribing | done
  React.useEffect(() => {
    if (stage !== 'transcribing') return undefined;
    const id = setTimeout(() => { setStage('done'); tap('success'); }, 1600);
    return () => clearTimeout(id);
  }, [stage, tap]);
  const lines = [
    'Hey — quick voice memo while I walk.',
    'Push the v2 build to staging tonight, ',
    'and let\'s pair on the gift card recipe tomorrow.',
  ];
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Voice messages get transcribed inline. The 0.5 s "AA→text" morph is
         one of the few Premium animations the SDK exposes for Mini Apps.</div>

      <div style={{
        padding: '12px 14px', borderRadius: 18,
        background: 'linear-gradient(135deg, oklch(0.86 0.05 280), oklch(0.78 0.07 250))',
        color: '#23130b',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={() => { tap('soft'); setStage('playing'); setTimeout(() => setStage('transcribing'), 900); }}
          disabled={stage !== 'idle' && stage !== 'done'}
          style={{
            width: 44, height: 44, borderRadius: 22, border: 0,
            background: '#fff', color: 'oklch(0.45 0.18 280)',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}>
          <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor"><path d="M2 1 L13 8 L2 15 z"/></svg>
        </button>
        <Waveform active={stage === 'playing' || stage === 'transcribing'}/>
        <div style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 11, fontWeight: 700,
        }}>0:14</div>
      </div>

      {stage === 'transcribing' && (
        <div style={{
          marginTop: 14, padding: 14, borderRadius: 14,
          background: 'color-mix(in oklch, oklch(0.6 0.18 280) 10%, var(--tg-secondary-bg))',
          border: '0.5px solid color-mix(in oklch, oklch(0.5 0.18 280) 24%, transparent)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            display: 'inline-block', width: 16, height: 16,
            border: '2px solid color-mix(in oklch, oklch(0.5 0.18 280) 38%, transparent)',
            borderTopColor: 'oklch(0.5 0.18 280)', borderRadius: '50%',
            animation: 'tg-spin 800ms linear infinite',
          }}/>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 13, color: 'oklch(0.42 0.18 280)', fontWeight: 600,
          }}>Transcribing…</div>
        </div>
      )}

      {stage === 'done' && (
        <div style={{
          marginTop: 14, padding: 14, borderRadius: 14,
          background: 'var(--tg-section-bg)',
          border: '0.5px solid var(--tg-card-border)',
          boxShadow: 'var(--tg-card-shadow)',
          animation: 'tg-fade-in 320ms',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{
              padding: '2px 7px', borderRadius: 999,
              background: 'linear-gradient(135deg, #6C5CE7, #4834D4)',
              color: '#fff',
              fontFamily: '-apple-system, system-ui',
              fontSize: 9, fontWeight: 800, letterSpacing: 0.4,
            }}>PREMIUM</span>
            <span style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 10, color: 'var(--tg-subtitle-text)', fontWeight: 600,
            }}>Auto-transcribed</span>
          </div>
          {lines.map((l, i) => (
            <span key={i} style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 14, color: 'var(--tg-text)', lineHeight: 1.5,
              opacity: 0, animation: `tg-fade-in 400ms ${i * 200}ms forwards`,
            }}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function Waveform({ active }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 32 }}>
      {Array.from({ length: 28 }, (_, i) => {
        const phase = (i % 7) / 6;
        const h = 6 + phase * 22;
        return (
          <span key={i} style={{
            display: 'inline-block',
            width: 2.5, height: h, borderRadius: 2,
            background: 'rgba(35,19,11,0.45)',
            transform: active ? `scaleY(${0.4 + Math.random() * 0.6})` : 'scaleY(1)',
            transition: 'transform 280ms',
            animation: active ? `tg-wave 800ms ${i * 30}ms ease-in-out infinite alternate` : 'none',
          }}/>
        );
      })}
    </div>
  );
}

function ProfileVideoDemo() {
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Premium users can set a short looping clip as their profile photo.
         It auto-plays in the contact list, profile sheet, and group lists.</div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <div style={{
          width: 130, height: 130, borderRadius: '50%',
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, oklch(0.78 0.16 30), oklch(0.45 0.2 350))',
          boxShadow: '0 14px 36px rgba(95,39,205,0.22), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}>
          {/* mock animated blob */}
          <div style={{
            position: 'absolute', inset: -20,
            background: 'radial-gradient(circle at 30% 40%, rgba(255,220,180,0.7), transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,140,200,0.6), transparent 55%)',
            animation: 'tg-blob 5s ease-in-out infinite',
          }}/>
          <div style={{
            position: 'absolute', top: 6, right: 6,
            padding: '3px 7px', borderRadius: 999,
            background: 'linear-gradient(135deg, #6C5CE7, #4834D4)',
            color: '#fff',
            fontFamily: '-apple-system, system-ui',
            fontSize: 9, fontWeight: 800, letterSpacing: 0.4,
          }}>LIVE</div>
        </div>
      </div>

      <div style={{
        padding: 12, borderRadius: 12,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, oklch(0.78 0.16 30), oklch(0.45 0.2 350))',
        }}/>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 14, fontWeight: 600,
          }}>Alex Carter <span style={{ color: '#5F27CD' }}>★</span></div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 11, color: 'var(--tg-subtitle-text)', marginTop: 1,
          }}>Profile video active · last seen recently</div>
        </div>
      </div>
    </div>
  );
}

function FolderTagsDemo() {
  const tap = useHaptic();
  const [active, setActive] = React.useState('work');
  const folders = [
    { id: 'all',      name: 'All',        hue: null,   unread: 0 },
    { id: 'personal', name: 'Personal',   hue: 25,     unread: 3 },
    { id: 'work',     name: 'Work',       hue: 215,    unread: 12 },
    { id: 'travel',   name: 'Travel',     hue: 145,    unread: 0 },
    { id: 'design',   name: 'Design',     hue: 305,    unread: 5 },
    { id: 'bots',     name: 'Bots',       hue: 280,    unread: 1 },
  ];
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Folder tabs get colored chips, not just text. Each folder picks its
         own hue — the chat list reads at a glance.</div>

      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', overflowY: 'hidden',
        padding: '4px 2px 8px',
        borderBottom: '0.5px solid var(--tg-section-separator)',
        marginBottom: 14, scrollbarWidth: 'none',
      }}>
        {folders.map((f) => {
          const on = active === f.id;
          return (
            <PressCard key={f.id} haptic="selection"
              onPress={(e) => { tap('selection', e); setActive(f.id); }}
              style={{
                flexShrink: 0,
                padding: '7px 12px 9px', borderRadius: 0,
                borderBottom: on
                  ? `2.5px solid ${f.hue ? `oklch(0.6 0.18 ${f.hue})` : 'var(--tg-accent)'}`
                  : '2.5px solid transparent',
                background: 'transparent',
                color: on ? 'var(--tg-text)' : 'var(--tg-subtitle-text)',
                fontFamily: '-apple-system, system-ui',
                fontSize: 14, fontWeight: on ? 700 : 600,
                position: 'relative',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
              {f.hue !== null && (
                <span style={{
                  width: 7, height: 7, borderRadius: 2,
                  background: `linear-gradient(135deg, oklch(0.74 0.16 ${f.hue}), oklch(0.5 0.2 ${f.hue + 18}))`,
                }}/>
              )}
              {f.name}
              {f.unread > 0 && (
                <span style={{
                  padding: '1px 6px', borderRadius: 999,
                  background: f.hue ? `oklch(0.65 0.18 ${f.hue})` : 'var(--tg-accent)',
                  color: '#fff',
                  fontFamily: '-apple-system, system-ui',
                  fontSize: 10, fontWeight: 800, letterSpacing: 0.2,
                }}>{f.unread}</span>
              )}
            </PressCard>
          );
        })}
      </div>

      <div style={{
        padding: 14, borderRadius: 14,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
      }}>
        <div style={extrasSectionHeader}>How it looks in your settings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {folders.filter(f => f.id !== 'all').map((f) => (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 4px',
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 5,
                background: `linear-gradient(135deg, oklch(0.74 0.16 ${f.hue}), oklch(0.5 0.2 ${f.hue + 18}))`,
                flexShrink: 0,
              }}/>
              <span style={{
                flex: 1,
                fontFamily: '-apple-system, system-ui', fontSize: 13,
              }}>{f.name}</span>
              <span style={{
                fontFamily: '-apple-system, system-ui',
                fontSize: 11, color: 'var(--tg-subtitle-text)',
              }}>{f.unread} unread</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  GIFTS sub-flows (6) — upgrade / transfer / resell / birthday /
//                       paid messages / paid media
// ════════════════════════════════════════════════════════════════════════

// ─── Upgrade a regular gift to a Collectible ────────────────────────────
function UpgradeGiftDemo() {
  const tap = useHaptic();
  const [stage, setStage] = React.useState('plain'); // plain | morphing | collectible
  const start = (e) => {
    tap('medium', e); setStage('morphing');
    setTimeout(() => { setStage('collectible'); tap('success'); }, 1400);
  };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Regular gifts can be upgraded to Collectibles — wrapping themselves
         in a crystal shell, gaining a serial number, and joining the marketplace.</div>

      <div style={{
        height: 280, borderRadius: 22, overflow: 'hidden', position: 'relative',
        background: stage === 'collectible'
          ? `radial-gradient(circle at 50% 40%, ${GIFT_PRESETS.cosmic.center} 0%, ${GIFT_PRESETS.cosmic.edge} 100%)`
          : 'linear-gradient(160deg, oklch(0.92 0.04 50), oklch(0.85 0.06 30))',
        display: 'grid', placeItems: 'center',
        transition: 'background 700ms cubic-bezier(.2,.7,.3,1)',
      }}>
        {/* Plain box */}
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          opacity: stage === 'plain' ? 1 : stage === 'morphing' ? 0.5 : 0,
          transform: stage === 'collectible' ? 'scale(0.6) rotateZ(40deg)' : stage === 'morphing' ? 'scale(0.92) rotateZ(8deg)' : 'scale(1)',
          transition: 'all 1.4s cubic-bezier(.2,.7,.3,1)',
        }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <rect x={18} y={42} width={84} height={62} rx={6} fill="#d6442a"/>
            <rect x={18} y={36} width={84} height={14} fill="#a8331f"/>
            <rect x={54} y={36} width={12} height={68} fill="#f7c14c"/>
            <path d="M44 36 Q44 18 60 22 Q76 18 76 36 z" fill="#f7c14c" stroke="#a8331f" strokeWidth={1.5}/>
          </svg>
        </div>
        {/* Collectible crystal */}
        <div style={{
          opacity: stage === 'collectible' ? 1 : 0,
          transform: stage === 'collectible' ? 'scale(1)' : 'scale(0.6) rotateZ(-25deg)',
          transition: 'all 1.4s cubic-bezier(.2,.7,.3,1)',
          color: 'rgba(180,210,255,0.95)',
        }}>
          <svg width="130" height="140" viewBox="0 0 130 140">
            <defs>
              <linearGradient id="upg-cry" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="rgba(255,255,255,0.95)"/>
                <stop offset="1" stopColor="rgba(180,210,255,0.7)"/>
              </linearGradient>
            </defs>
            <path d="M65 8 L110 50 L100 130 L30 130 L20 50 z"
                  fill="url(#upg-cry)" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5}/>
            <path d="M65 8 L110 50 L65 70 z" fill="rgba(255,255,255,0.4)"/>
            <path d="M65 8 L20 50 L65 70 z" fill="rgba(255,255,255,0.25)"/>
          </svg>
        </div>
        {/* Sparkle particles during morphing */}
        {stage === 'morphing' && Array.from({ length: 14 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute', left: '50%', top: '50%',
            width: 6, height: 6, borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            boxShadow: '0 0 8px rgba(255,255,255,0.7)',
            animation: `tg-confetti 1.2s ${i * 60}ms cubic-bezier(.2,.7,.3,1) forwards`,
            '--vx': (Math.cos((i / 14) * Math.PI * 2) * 120) + 'px',
            '--vy': (Math.sin((i / 14) * Math.PI * 2) * 120 - 60) + 'px',
            '--rot': '180deg',
          }}/>
        ))}
        {stage === 'collectible' && (
          <div style={{
            position: 'absolute', bottom: 14, right: 14,
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 11, color: 'rgba(255,255,255,0.6)',
          }}>#000847</div>
        )}
      </div>

      <MainButton label={
        stage === 'plain' ? 'Upgrade to Collectible' :
        stage === 'morphing' ? 'Crystallizing…' : 'Now collectible'
      } haptic="medium" loading={stage === 'morphing'} onClick={start} disabled={stage === 'collectible'}/>
    </div>
  );
}

// ─── Transfer a Collectible to another user ─────────────────────────────
function TransferGiftDemo() {
  const tap = useHaptic();
  const [recipient, setRecipient] = React.useState(null);
  const [stage, setStage] = React.useState('pick');
  const friends = [
    { id: 'lina', name: 'Lina', hue: 25 },
    { id: 'noa',  name: 'Noa',  hue: 305 },
    { id: 'mark', name: 'Mark', hue: 215 },
    { id: 'priya', name: 'Priya', hue: 145 },
  ];
  const send = (e) => {
    tap('soft', e); setStage('sending');
    setTimeout(() => { setStage('sent'); tap('success'); }, 1200);
  };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Collectibles can be transferred to any contact. Once sent, the gift
         leaves your profile and joins theirs — fully signed by Telegram.</div>

      {/* mini collectible preview */}
      <div style={{
        height: 110, borderRadius: 16,
        background: `radial-gradient(circle at 50% 40%, ${GIFT_PRESETS.ember.center}, ${GIFT_PRESETS.ember.edge})`,
        display: 'flex', alignItems: 'center', gap: 14, padding: 14,
        color: '#fff', marginBottom: 14, overflow: 'hidden', position: 'relative',
      }}>
        <div style={{ fontSize: 56, lineHeight: 1, filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }}>🔥</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 16, fontWeight: 700, letterSpacing: -0.2,
          }}>Eternal Ember</div>
          <div style={{
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 11, opacity: 0.7,
          }}>#{GIFT_PRESETS.ember.num}</div>
        </div>
      </div>

      <div style={extrasSectionHeader}>Send to</div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', overflowY: 'hidden',
                    padding: '4px 2px 8px', scrollbarWidth: 'none' }}>
        {friends.map((f) => {
          const on = recipient === f.id;
          return (
            <PressCard key={f.id} haptic="selection"
              onPress={(e) => { tap('selection', e); setRecipient(f.id); }}
              style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: 6,
              }}>
              <div style={{
                width: 54, height: 54, borderRadius: '50%',
                background: `linear-gradient(135deg, oklch(0.78 0.16 ${f.hue}), oklch(0.5 0.2 ${f.hue + 24}))`,
                color: '#fff', display: 'grid', placeItems: 'center',
                fontFamily: '-apple-system, system-ui',
                fontSize: 22, fontWeight: 700,
                boxShadow: on ? '0 0 0 3px var(--tg-accent), 0 6px 16px rgba(0,0,0,0.18)' : '0 2px 6px rgba(0,0,0,0.12)',
                transition: 'box-shadow 200ms',
              }}>{f.name.slice(0,1)}</div>
              <div style={{
                fontFamily: '-apple-system, system-ui',
                fontSize: 12, fontWeight: on ? 700 : 500,
                color: on ? 'var(--tg-text)' : 'var(--tg-subtitle-text)',
              }}>{f.name}</div>
            </PressCard>
          );
        })}
      </div>

      {stage === 'sent' && (
        <div style={{
          marginTop: 8, padding: 14, borderRadius: 14,
          background: 'color-mix(in oklch, oklch(0.7 0.18 145) 14%, transparent)',
          border: '0.5px solid color-mix(in oklch, oklch(0.6 0.18 145) 38%, transparent)',
          color: 'oklch(0.4 0.16 145)',
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, fontWeight: 600,
          animation: 'tg-pop 320ms cubic-bezier(.2,1.6,.3,1)',
        }}>✓ Sent to {friends.find(f => f.id === recipient)?.name}</div>
      )}

      <MainButton label={
        stage === 'sending' ? 'Signing transfer…' :
        stage === 'sent' ? 'Transfer complete' : 'Send'
      } loading={stage === 'sending'} disabled={!recipient || stage === 'sent'}
        haptic="medium" onClick={send}/>
    </div>
  );
}

// ─── Resell on the marketplace — filters by pattern / model / backdrop ──
function ResellGiftDemo() {
  const tap = useHaptic();
  const [filter, setFilter] = React.useState('all');
  const items = [
    { id: 1, name: 'Cosmic Crystal', preset: 'cosmic', price: 24, num: '0234' },
    { id: 2, name: 'Eternal Ember',  preset: 'ember',  price: 88, num: '0012' },
    { id: 3, name: 'Velvet Bloom',   preset: 'bloom',  price: 42, num: '1892' },
    { id: 4, name: 'Cosmic Crystal', preset: 'cosmic', price: 18, num: '4108' },
    { id: 5, name: 'Velvet Bloom',   preset: 'bloom',  price: 56, num: '0903' },
  ];
  const shown = filter === 'all' ? items : items.filter(i => i.preset === filter);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 12,
      }}>List your Collectible for Stars. Buyers filter by pattern, model, or
         backdrop — and grab the lowest serial number they can afford.</div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'cosmic', label: 'Cosmic' },
          { id: 'ember', label: 'Ember' },
          { id: 'bloom', label: 'Bloom' },
        ].map((t) => {
          const on = filter === t.id;
          return (
            <PressCard key={t.id} haptic="selection"
              onPress={(e) => { tap('selection', e); setFilter(t.id); }}
              style={{
                padding: '6px 12px', borderRadius: 999,
                background: on ? 'var(--tg-button)' : 'var(--tg-secondary-bg)',
                color: on ? 'var(--tg-button-text)' : 'var(--tg-text)',
                fontFamily: '-apple-system, system-ui',
                fontSize: 12, fontWeight: 600,
              }}>{t.label}</PressCard>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {shown.map((it) => {
          const p = GIFT_PRESETS[it.preset];
          return (
            <div key={it.id} style={{
              borderRadius: 14, overflow: 'hidden',
              background: `radial-gradient(circle at 50% 40%, ${p.center}, ${p.edge})`,
              color: '#fff', padding: 10,
              height: 140, position: 'relative',
              boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: 28, opacity: 0.8 }}>{p.symbol}</div>
              <div>
                <div style={{
                  fontFamily: '-apple-system, system-ui',
                  fontSize: 11, fontWeight: 700, lineHeight: 1.2,
                }}>{it.name}</div>
                <div style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  fontSize: 9, opacity: 0.65, marginTop: 1,
                }}>#{it.num}</div>
                <div style={{
                  marginTop: 6, padding: '3px 8px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.16)',
                  backdropFilter: 'blur(6px)',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontFamily: '-apple-system, system-ui',
                  fontSize: 11, fontWeight: 700,
                }}>
                  <Glyph name="star" size={11} style={{ color: 'oklch(0.85 0.16 55)' }}/>
                  {it.price}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Birthday gift state ────────────────────────────────────────────────
function BirthdayGiftDemo() {
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Gifts sent on a contact's birthday get the <code style={extrasCodeStyle}>birthday: true</code> flag.
         They render with a cake glyph and a confetti halo — small differentiator,
         big emotional payoff.</div>

      <div style={{
        height: 290, borderRadius: 22, overflow: 'hidden', position: 'relative',
        background: 'radial-gradient(circle at 50% 30%, oklch(0.7 0.16 350), oklch(0.35 0.22 320))',
        display: 'grid', placeItems: 'center',
        boxShadow: '0 20px 48px rgba(160,40,140,0.32)',
      }}>
        {/* confetti */}
        {Array.from({ length: 22 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute', left: '50%', top: 12,
            width: 5, height: 9,
            background: `oklch(0.78 0.2 ${(i * 32) % 360})`,
            transform: `translateX(${(i % 11 - 5) * 22}px)`,
            animation: `tg-confetti 3s ${i * 130}ms cubic-bezier(.2,.7,.3,1) infinite`,
            '--vx': ((i % 11 - 5) * 14) + 'px',
            '--vy': '240px',
            '--rot': (i * 32) + 'deg',
          }}/>
        ))}
        {/* cake */}
        <div style={{ position: 'relative', textAlign: 'center', color: '#fff' }}>
          <div style={{
            fontSize: 96, lineHeight: 1,
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.35))',
          }}>🎂</div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
            opacity: 0.85, marginTop: 10, fontWeight: 800,
          }}>Birthday gift</div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 20, fontWeight: 700, marginTop: 2, letterSpacing: -0.3,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}>Happy birthday, Lina!</div>
        </div>
      </div>

      <div style={{
        marginTop: 14, padding: 12, borderRadius: 12,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
      }}>
        <pre style={extrasJsonPre}>{`{
  "gift_id": "ember-collectible-0012",
  "birthday": true,
  "receiver": "@lina"
}`}</pre>
      </div>
    </div>
  );
}

// ─── Paid messages — 1⭐ to read each DM ────────────────────────────────
function PaidMessagesDemo() {
  const tap = useHaptic();
  const [unlocked, setUnlocked] = React.useState({});
  const msgs = [
    { id: 1, mine: false, t: '11:40', text: 'Was the v2 deck good?' },
    { id: 2, mine: true,  t: '11:41', text: 'It landed. Want to see the recording?', paid: true },
    { id: 3, mine: true,  t: '11:41', text: 'I\'ll send the link — pay 1⭐ to read.', paid: true },
    { id: 4, mine: false, t: '11:42', text: 'Will do — incoming.' },
  ];
  const unlock = (id, e) => { tap('soft', e); setUnlocked((u) => ({ ...u, [id]: true })); };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Creators can charge Stars per message. The bubble shows as a blurred
         preview until paid — the rest of the chat is free.</div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 8,
        padding: 14, borderRadius: 18,
        background: 'var(--tg-secondary-bg)',
        border: '0.5px solid var(--tg-card-border)',
      }}>
        {msgs.map((m) => {
          const blocked = m.paid && !unlocked[m.id];
          return (
            <div key={m.id} style={{
              display: 'flex', justifyContent: m.mine ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '78%', position: 'relative',
                padding: '8px 12px 9px',
                borderRadius: m.mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.mine ? 'var(--tg-button)' : 'var(--tg-section-bg)',
                color: m.mine ? 'var(--tg-button-text)' : 'var(--tg-text)',
                border: m.mine ? 'none' : '0.5px solid var(--tg-card-border)',
                boxShadow: 'var(--tg-card-shadow)',
              }}>
                <div style={{
                  fontFamily: '-apple-system, system-ui',
                  fontSize: 13, lineHeight: 1.4,
                  filter: blocked ? 'blur(5px)' : 'none',
                  userSelect: blocked ? 'none' : 'auto',
                  transition: 'filter 280ms',
                }}>{m.text}</div>
                <div style={{
                  fontFamily: '-apple-system, system-ui',
                  fontSize: 9, color: m.mine ? 'rgba(255,255,255,0.7)' : 'var(--tg-hint)',
                  textAlign: 'right', marginTop: 2,
                }}>{m.t}</div>
                {blocked && (
                  <PressCard haptic="soft" onPress={(e) => unlock(m.id, e)}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 'inherit',
                      display: 'grid', placeItems: 'center',
                      background: 'rgba(255,255,255,0.18)',
                      backdropFilter: 'blur(1px)',
                    }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 999,
                      background: 'rgba(255,255,255,0.92)', color: '#23130b',
                      fontFamily: '-apple-system, system-ui',
                      fontSize: 11, fontWeight: 700,
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}>
                      <Glyph name="star" size={11} style={{ color: 'oklch(0.7 0.2 55)' }}/>
                      Pay 1 to read
                    </span>
                  </PressCard>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Paid media — blurred photo unlocks on payment ──────────────────────
function PaidMediaDemo() {
  const tap = useHaptic();
  const [paid, setPaid] = React.useState(false);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Photos can ship locked. Paying with Stars unlocks the original — the
         reveal uses a 600 ms blur-out so the satisfaction lands.</div>

      <div style={{
        position: 'relative', borderRadius: 18, overflow: 'hidden',
        height: 260,
        background: 'linear-gradient(135deg, oklch(0.78 0.13 165), oklch(0.48 0.18 200))',
      }}>
        {/* mock landscape behind the blur */}
        <svg viewBox="0 0 300 260" preserveAspectRatio="none" width="100%" height="100%"
             style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="oklch(0.84 0.1 215)"/>
              <stop offset="1" stopColor="oklch(0.68 0.16 235)"/>
            </linearGradient>
          </defs>
          <rect width="300" height="260" fill="url(#sky)"/>
          <circle cx={235} cy={75} r={36} fill="rgba(255,235,180,0.85)"/>
          <path d="M0 180 L 70 130 L 130 165 L 195 110 L 260 150 L 300 130 L 300 260 L 0 260 z"
                fill="oklch(0.35 0.12 165)"/>
          <path d="M0 220 L 90 190 L 170 215 L 260 195 L 300 210 L 300 260 L 0 260 z"
                fill="oklch(0.25 0.1 180)"/>
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          backdropFilter: paid ? 'blur(0px) saturate(100%)' : 'blur(22px) saturate(180%)',
          WebkitBackdropFilter: paid ? 'blur(0px) saturate(100%)' : 'blur(22px) saturate(180%)',
          background: paid ? 'transparent' : 'rgba(8,10,14,0.18)',
          transition: 'backdrop-filter 600ms cubic-bezier(.2,.7,.3,1), background 600ms',
        }}/>
        {!paid && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'grid', placeItems: 'center',
          }}>
            <PressCard haptic="medium" onPress={(e) => { tap('medium', e); setPaid(true); tap('success'); }}
              style={{
                padding: '12px 18px', borderRadius: 999,
                background: 'rgba(255,255,255,0.92)', color: '#23130b',
                fontFamily: '-apple-system, system-ui',
                fontSize: 14, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                boxShadow: '0 8px 22px rgba(0,0,0,0.2)',
              }}>
              <Glyph name="star" size={16} style={{ color: 'oklch(0.7 0.2 55)' }}/>
              Unlock for 5 Stars
            </PressCard>
          </div>
        )}
        {paid && (
          <div style={{
            position: 'absolute', bottom: 12, left: 12, right: 12,
            padding: '6px 10px', borderRadius: 10,
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
            color: '#fff',
            fontFamily: '-apple-system, system-ui',
            fontSize: 11, fontWeight: 600,
            animation: 'tg-fade-in 320ms 200ms backwards',
          }}>📷 Sunset over the fjords · paid · unlocked</div>
        )}
      </div>

      {paid && (
        <PressCard haptic="selection" onPress={() => setPaid(false)}
          style={{
            marginTop: 14, padding: '10px 12px', borderRadius: 12,
            background: 'var(--tg-secondary-bg)',
            textAlign: 'center',
            fontFamily: '-apple-system, system-ui',
            fontSize: 13, fontWeight: 600, color: 'var(--tg-link)',
            display: 'block', width: '100%',
          }}>Lock again</PressCard>
      )}
    </div>
  );
}

Object.assign(window, {
  PhoneOnlyDemo, OpenTelegramLinkDemo, BrowserOptionsDemo,
  VoiceToTextDemo, ProfileVideoDemo, FolderTagsDemo,
  UpgradeGiftDemo, TransferGiftDemo, ResellGiftDemo,
  BirthdayGiftDemo, PaidMessagesDemo, PaidMediaDemo,
});
