// demos.jsx — Storage Inspector, Sensors 3D Cube, Stars payment, Biometric Vault.
// Each is a focused single-screen demo. Wired to MainButton where it makes sense.

// ─────────────────────────────────────────────────────────────────────────
// 1. CloudStorage Inspector
// ─────────────────────────────────────────────────────────────────────────

function StorageInspector() {
  const tap = useHaptic();
  const [tab, setTab] = React.useState('cloud');
  const [entries, setEntries] = React.useState({
    cloud:  [
      { k: 'theme_pref',     v: 'auto',     synced: 'now' },
      { k: 'last_demo',      v: 'haptic',   synced: 'now' },
      { k: 'streak_days',    v: '7',        synced: 'now' },
    ],
    device: [
      { k: 'pad_layout',     v: '3x3' },
      { k: 'sound_enabled',  v: 'false' },
    ],
    secure: [
      { k: 'secret_note',    v: '••••••••••••' },
      { k: 'unlock_pin',     v: '••••' },
    ],
  });
  const [adding, setAdding] = React.useState(false);
  const [flash, setFlash] = React.useState(null); // key being flashed (sync animation)
  const [syncBeat, setSyncBeat] = React.useState(0);
  // Secure-storage system-clear scenario. Per addendum: when the host clears
  // Secure (e.g. user reinstalls Telegram), the SDK fires `secure_storage_cleared`
  // and the app should expose a "restore" banner.
  const [secureCleared, setSecureCleared] = React.useState(false);
  const stashRef = React.useRef(null);

  // Live multi-device sync via backend WebSocket. Falls back to local-only when offline.
  React.useEffect(() => {
    if (tab !== 'cloud') return undefined;
    let cancelled = false;
    const refresh = async () => {
      if (!window.API || !window.API.isReady()) return;
      try {
        const list = await window.API.fetch('/api/cloud');
        if (cancelled) return;
        const mapped = list.map((e) => ({ k: e.key, v: e.value, synced: 'now' }));
        setEntries((all) => ({ ...all, cloud: mapped.length ? mapped : all.cloud }));
      } catch (e) { /* offline ok */ }
    };
    refresh();
    const unsub = window.API && window.API.subscribe('cloud_storage_updated', (msg) => {
      setFlash(msg.key);
      setSyncBeat((n) => n + 1);
      tap('light');
      setEntries((all) => ({
        ...all,
        cloud: all.cloud.map((e) => e.k === msg.key
          ? { ...e, v: incrementOrTouch(e.v), synced: 'now', remote: true }
          : e),
      }));
      setTimeout(() => setFlash(null), 1400);
      refresh();
    });
    return () => { cancelled = true; unsub && unsub(); };
  }, [tab, tap]);

  const tabs = [
    { id: 'cloud',  label: 'Cloud',  hint: 'syncs across devices', glyph: 'cloud' },
    { id: 'device', label: 'Device', hint: 'local only',           glyph: 'device' },
    { id: 'secure', label: 'Secure', hint: 'keychain',             glyph: 'vault' },
  ];

  const list = entries[tab];
  // Real SDK limits per the v2.0 addendum:
  //   Cloud  — 1024 keys, 4 KB / value
  //   Device — 5 MB total (not key-based)
  //   Secure — 10 items per user
  const STORAGE_LIMITS = { cloud: 1024, device: 5 * 1024 * 1024, secure: 10 };
  const max = STORAGE_LIMITS[tab];
  const usedBytes = tab === 'device'
    ? list.reduce((n, e) => n + (e.k.length + String(e.v).length), 0)
    : null;
  const usageLabel = tab === 'cloud'
    ? `${list.length} / ${max} keys`
    : tab === 'device'
    ? `${(usedBytes / 1024).toFixed(1)} KB / 5.0 MB`
    : `${list.length} / ${max} items`;

  const addEntry = (k, v) => {
    setEntries((all) => ({ ...all, [tab]: [...all[tab], { k, v, synced: 'now' }] }));
    tap('success');
    setFlash(k);
    setTimeout(() => setFlash(null), 1400);
    if (tab === 'cloud' && window.API && window.API.isReady()) {
      window.API.fetch('/api/cloud/' + encodeURIComponent(k), {
        method: 'PUT', body: JSON.stringify({ value: String(v) }),
      }).catch((e) => console.warn('cloud put', e));
    }
  };

  const removeEntry = (k) => {
    setEntries((all) => ({ ...all, [tab]: all[tab].filter((e) => e.k !== k) }));
    tap('warning');
    if (tab === 'cloud' && window.API && window.API.isReady()) {
      window.API.fetch('/api/cloud/' + encodeURIComponent(k), { method: 'DELETE' })
        .catch((e) => console.warn('cloud delete', e));
    }
  };

  // Simulate the host firing `secure_storage_cleared` after a few seconds the
  // first time the user lands on the Secure tab. Stash the current items so
  // tapping the banner can `restoreItem()` them with a fade-in.
  React.useEffect(() => {
    if (tab !== 'secure' || stashRef.current) return undefined;
    const id = setTimeout(() => {
      stashRef.current = entries.secure;
      setEntries((all) => ({ ...all, secure: [] }));
      setSecureCleared(true);
      tap('warning');
      window.tgLog && window.tgLog('secure_storage_cleared');
    }, 4500);
    return () => clearTimeout(id);
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const restoreSecure = (e) => {
    tap('success', e);
    setEntries((all) => ({ ...all, secure: stashRef.current || [] }));
    setSecureCleared(false);
  };

  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      {/* Tabs */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        background: 'var(--tg-secondary-bg)', borderRadius: 12, padding: 3,
        marginBottom: 12,
      }}>
        {tabs.map((t) => {
          const on = tab === t.id;
          return (
            <PressCard key={t.id} haptic="selection" onPress={() => setTab(t.id)}
              style={{
                padding: '8px 6px', borderRadius: 10,
                background: on ? 'var(--tg-section-bg)' : 'transparent',
                boxShadow: on ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                textAlign: 'center',
                color: on ? 'var(--tg-text)' : 'var(--tg-subtitle-text)',
                fontFamily: '-apple-system, system-ui',
                fontSize: 13, fontWeight: 600,
                transition: 'all 180ms',
              }}>{t.label}</PressCard>
          );
        })}
      </div>

      {/* Header: usage counter + sync state */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 12, color: 'var(--tg-subtitle-text)',
        }}>{usageLabel} used</div>
        {tab === 'cloud' && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: '-apple-system, system-ui',
            fontSize: 12, color: 'oklch(0.5 0.16 145)', fontWeight: 600,
          }}>
            <CloudIcon beat={syncBeat}/>
            Synced
          </div>
        )}
      </div>

      {/* secure_storage_cleared banner */}
      {tab === 'secure' && secureCleared && (
        <PressCard haptic="success" onPress={restoreSecure} style={{
          width: '100%', padding: '10px 12px', borderRadius: 12,
          background: 'color-mix(in oklch, oklch(0.7 0.18 25) 14%, transparent)',
          border: '0.5px solid color-mix(in oklch, oklch(0.6 0.18 25) 38%, transparent)',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
          animation: 'tg-pop 320ms cubic-bezier(.2,1.6,.3,1)',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'oklch(0.65 0.18 25)', color: '#fff',
            display: 'grid', placeItems: 'center', fontSize: 14, flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v5M12 17h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 13, fontWeight: 600, color: 'var(--tg-text)',
            }}>secure_storage_cleared</div>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 11, color: 'var(--tg-subtitle-text)', marginTop: 1,
            }}>The system wiped your secure items. Tap to restore.</div>
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: 999,
            background: 'oklch(0.65 0.18 25)', color: '#fff',
            fontFamily: '-apple-system, system-ui',
            fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
          }}>Restore</div>
        </PressCard>
      )}

      {/* Entry list */}
      <div style={{
        background: 'var(--tg-section-bg)',
        borderRadius: 16, border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
        overflow: 'hidden', marginBottom: 12,
      }}>
        {list.length === 0 && (
          <div style={{
            padding: 28, textAlign: 'center',
            fontFamily: '-apple-system, system-ui',
            fontSize: 13, color: 'var(--tg-subtitle-text)',
          }}>Empty. Tap + below to add a key.</div>
        )}
        {list.map((e, i) => (
          <Row key={e.k} e={e} flash={flash === e.k} last={i === list.length - 1}
               masked={tab === 'secure'} onRemove={() => removeEntry(e.k)}/>
        ))}
      </div>

      {/* Second-device visualization (Cloud only) */}
      {tab === 'cloud' && (
        <div style={{
          padding: 12, borderRadius: 14,
          background: 'var(--tg-secondary-bg)',
          border: '0.5px solid var(--tg-card-border)',
          fontFamily: '-apple-system, system-ui',
          fontSize: 12, color: 'var(--tg-subtitle-text)',
          marginBottom: 12, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SecondDeviceIllustration beat={syncBeat}/>
            <div>
              <div style={{ color: 'var(--tg-text)', fontWeight: 600, fontSize: 13 }}>
                Connected to one more session
              </div>
              <div>Changes propagate in ≤ 3 s. Watch the keys flash.</div>
            </div>
          </div>
        </div>
      )}

      {/* Add row */}
      {adding && (
        <AddDialog onCancel={() => { setAdding(false); tap('light'); }}
                   onSave={(k, v) => { addEntry(k, v); setAdding(false); }}/>
      )}

      <MainButton
        label={`Add key`}
        haptic="soft"
        onClick={() => setAdding(true)}
      />
    </div>
  );
}

function incrementOrTouch(v) {
  if (/^\d+$/.test(v)) return String(Number(v) + 1);
  const stamps = ['auto', 'light', 'dark', 'auto'];
  if (stamps.includes(v)) return stamps[(stamps.indexOf(v) + 1) % stamps.length];
  return v + '*';
}

function Row({ e, flash, last, masked, onRemove }) {
  const tap = useHaptic();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px',
      borderBottom: last ? 'none' : '0.5px solid var(--tg-section-separator)',
      background: flash ? 'color-mix(in oklch, oklch(0.7 0.18 145) 18%, transparent)' : 'transparent',
      transition: 'background 700ms ease',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 12, color: 'var(--tg-text)', fontWeight: 600,
        }}>{e.k}</div>
        <div style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 12, color: 'var(--tg-subtitle-text)',
          marginTop: 2,
          letterSpacing: masked ? 2 : 0,
        }}>{e.v}{e.remote && !flash && <span style={{ marginLeft: 6, color: 'oklch(0.5 0.16 145)', fontWeight: 700 }}>↻</span>}</div>
      </div>
      <button onClick={(ev) => { tap('warning', ev); onRemove(); }}
        style={{
          width: 28, height: 28, borderRadius: 14, border: 0,
          background: 'transparent', color: 'var(--tg-hint)',
          display: 'grid', placeItems: 'center', cursor: 'pointer',
        }}>
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

function CloudIcon({ beat }) {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" style={{
      animation: beat ? 'tg-cloud-pulse 1s' : 'none',
    }} key={beat}>
      <path d="M5 11h9a3 3 0 100-6 4 4 0 00-7.7-1A3 3 0 005 11z"
            fill="oklch(0.6 0.16 145)"/>
    </svg>
  );
}

function SecondDeviceIllustration({ beat }) {
  return (
    <div style={{ position: 'relative', width: 60, height: 38, flexShrink: 0 }}>
      <div style={{
        position: 'absolute', left: 0, top: 0,
        width: 22, height: 32, borderRadius: 4,
        background: 'var(--tg-section-bg)', border: '1px solid var(--tg-card-border)',
      }}>
        <div style={{ width: 14, height: 1.5, background: 'oklch(0.6 0.16 145)', margin: '5px 3px' }}/>
        <div style={{ width: 10, height: 1, background: 'var(--tg-hint)', margin: '0 3px 2px' }}/>
        <div style={{ width: 12, height: 1, background: 'var(--tg-hint)', margin: '0 3px 2px' }}/>
      </div>
      <div style={{
        position: 'absolute', right: 0, top: 0,
        width: 22, height: 32, borderRadius: 4,
        background: 'var(--tg-section-bg)', border: '1px solid var(--tg-card-border)',
      }}>
        <div style={{ width: 14, height: 1.5, background: 'oklch(0.6 0.16 145)', margin: '5px 3px',
                      opacity: beat ? 1 : 0.5, transition: 'opacity 300ms' }}/>
        <div style={{ width: 10, height: 1, background: 'var(--tg-hint)', margin: '0 3px 2px' }}/>
        <div style={{ width: 12, height: 1, background: 'var(--tg-hint)', margin: '0 3px 2px' }}/>
      </div>
      {/* sync arc */}
      <svg width="60" height="38" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <path d="M22 6 Q30 -2 38 6" stroke="oklch(0.6 0.16 145)" strokeWidth="1.5" fill="none"
              strokeDasharray="3 3" opacity={0.7}/>
        <circle cx={30} cy={1} r={2}
                fill="oklch(0.55 0.18 145)"
                style={{ transform: `translateX(${(beat % 2 === 0 ? -8 : 8)}px)`, transition: 'transform 1s' }}/>
      </svg>
    </div>
  );
}

function AddDialog({ onCancel, onSave }) {
  const [k, setK] = React.useState('');
  const [v, setV] = React.useState('');
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 7,
      background: 'rgba(15,17,20,0.45)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'tg-fade-in 220ms',
    }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--tg-section-bg)', color: 'var(--tg-text)',
        width: '100%', borderRadius: '20px 20px 0 0',
        padding: '18px 18px 28px',
        animation: 'tg-sheet-up 280ms cubic-bezier(.2,.7,.3,1)',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'var(--tg-section-separator)',
          margin: '0 auto 14px',
        }}/>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 17, fontWeight: 700, marginBottom: 12,
        }}>New key</div>
        <input value={k} onChange={(e) => setK(e.target.value)}
               placeholder="key (lowercase_snake)"
               style={inputStyle}/>
        <div style={{ height: 8 }}/>
        <input value={v} onChange={(e) => setV(e.target.value)}
               placeholder="value"
               style={inputStyle}/>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={onCancel} style={sheetBtn(false)}>Cancel</button>
          <button onClick={() => k && onSave(k, v || '–')} style={sheetBtn(true)}>Save</button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', height: 46, padding: '0 14px',
  borderRadius: 12, border: '1px solid var(--tg-section-separator)',
  background: 'var(--tg-secondary-bg)',
  color: 'var(--tg-text)',
  fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
};
const sheetBtn = (primary) => ({
  flex: 1, height: 46, borderRadius: 12, border: 0,
  background: primary ? 'var(--tg-button)' : 'var(--tg-secondary-bg)',
  color: primary ? 'var(--tg-button-text)' : 'var(--tg-text)',
  fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 15,
  cursor: 'pointer',
});

// ─────────────────────────────────────────────────────────────────────────
// 2. Sensors — 3D Cube
// ─────────────────────────────────────────────────────────────────────────

function SensorsCube() {
  const tap = useHaptic();
  const [rot, setRot] = React.useState({ x: -20, y: 30, z: 0 });
  const [auto, setAuto] = React.useState(true);
  const [orient, setOrient] = React.useState(false);

  React.useEffect(() => {
    if (!auto) return undefined;
    const id = setInterval(() => {
      setRot((r) => ({ x: r.x + 0.6, y: r.y + 0.9, z: r.z }));
    }, 30);
    return () => clearInterval(id);
  }, [auto]);

  React.useEffect(() => {
    if (!orient) return undefined;
    const handle = (e) => {
      if (e.beta == null) return;
      setRot({ x: e.beta - 90, y: e.gamma, z: e.alpha ? e.alpha % 360 : 0 });
    };
    window.addEventListener('deviceorientation', handle);
    return () => window.removeEventListener('deviceorientation', handle);
  }, [orient]);

  const askOrient = async (e) => {
    tap('soft', e);
    if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      try { await window.DeviceOrientationEvent.requestPermission(); } catch (_) { /* ignored */ }
    }
    setAuto(false);
    setOrient(true);
  };

  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Tilt the device — or drag the sliders. The cube tracks the accelerometer in real time.</div>

      <div style={{
        height: 260, display: 'grid', placeItems: 'center',
        background: 'radial-gradient(circle at 50% 40%, color-mix(in oklch, var(--tg-accent) 16%, transparent), transparent 65%), var(--tg-secondary-bg)',
        borderRadius: 22, marginBottom: 14, overflow: 'hidden',
        perspective: 800,
      }}>
        <div style={{
          width: 130, height: 130,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) rotateZ(${rot.z}deg)`,
          transition: orient ? 'none' : auto ? 'transform 100ms linear' : 'transform 220ms cubic-bezier(.2,.7,.3,1)',
        }}>
          {[
            { f: 'rotateY(0deg) translateZ(65px)',    hue: 215 },
            { f: 'rotateY(90deg) translateZ(65px)',   hue: 255 },
            { f: 'rotateY(180deg) translateZ(65px)',  hue: 295 },
            { f: 'rotateY(-90deg) translateZ(65px)',  hue: 165 },
            { f: 'rotateX(90deg) translateZ(65px)',   hue: 50 },
            { f: 'rotateX(-90deg) translateZ(65px)',  hue: 125 },
          ].map((face, i) => (
            <div key={i} style={{
              position: 'absolute', width: 130, height: 130,
              transform: face.f,
              background: `linear-gradient(135deg, oklch(0.74 0.18 ${face.hue}), oklch(0.5 0.2 ${face.hue + 14}))`,
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.18)',
              display: 'grid', placeItems: 'center',
              color: 'rgba(255,255,255,0.78)',
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 11, fontWeight: 700, letterSpacing: 2,
            }}>{['+X','+Y','-X','-Y','+Z','-Z'][i]}</div>
          ))}
        </div>
      </div>

      <Axis label="X" value={rot.x} min={-180} max={180}
            onChange={(v) => { setAuto(false); setRot((r) => ({ ...r, x: v })); }}/>
      <Axis label="Y" value={rot.y} min={-180} max={180}
            onChange={(v) => { setAuto(false); setRot((r) => ({ ...r, y: v })); }}/>
      <Axis label="Z" value={rot.z} min={-180} max={180}
            onChange={(v) => { setAuto(false); setRot((r) => ({ ...r, z: v })); }}/>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <PressCard haptic="selection" onPress={() => { setAuto((a) => !a); setOrient(false); }}
          style={{
            flex: 1, height: 40, borderRadius: 11,
            background: 'var(--tg-secondary-bg)', color: 'var(--tg-text)',
            display: 'grid', placeItems: 'center',
            fontFamily: '-apple-system, system-ui', fontSize: 13, fontWeight: 600,
          }}>{auto ? 'Pause' : 'Auto spin'}</PressCard>
        <PressCard haptic="selection" onPress={(e) => askOrient(e)}
          style={{
            flex: 1, height: 40, borderRadius: 11,
            background: orient ? 'var(--tg-accent)' : 'var(--tg-secondary-bg)',
            color: orient ? 'var(--tg-button-text)' : 'var(--tg-text)',
            display: 'grid', placeItems: 'center',
            fontFamily: '-apple-system, system-ui', fontSize: 13, fontWeight: 600,
          }}>{orient ? 'Live tilt on' : 'Use real tilt'}</PressCard>
      </div>

      <MainButton label="Reset" haptic="soft" onClick={() => {
        setAuto(true); setOrient(false); setRot({ x: -20, y: 30, z: 0 });
      }}/>
    </div>
  );
}

function Axis({ label, value, min, max, onChange }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: 11, color: 'var(--tg-subtitle-text)',
        marginBottom: 2,
      }}>
        <span style={{ fontWeight: 700, color: 'var(--tg-text)' }}>{label}</span>
        <span>{Math.round(value)}°</span>
      </div>
      <input type="range" min={min} max={max} value={value}
             onChange={(e) => onChange(Number(e.target.value))}
             style={{ width: '100%', accentColor: 'var(--tg-accent)' }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 3. Stars Payment
// ─────────────────────────────────────────────────────────────────────────

function StarsPayment() {
  const tap = useHaptic();
  const [stage, setStage] = React.useState('idle'); // 'idle' | 'invoice' | 'paying' | 'success'
  const [refund, setRefund] = React.useState(60);
  const [particles, setParticles] = React.useState([]);

  React.useEffect(() => {
    if (stage !== 'success') return undefined;
    setRefund(60);
    const id = setInterval(() => setRefund((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [stage]);

  const pendingPaymentRef = React.useRef(null);

  React.useEffect(() => {
    if (!window.API) return undefined;
    const unsub = window.API.subscribe('payment_completed', (msg) => {
      if (pendingPaymentRef.current && msg.payment_id !== pendingPaymentRef.current) return;
      pendingPaymentRef.current = null;
      setStage('success');
      tap('success', { x: window.innerWidth / 2, y: window.innerHeight / 2 });
      burst();
    });
    return unsub;
  }, [tap]);

  const start = (e) => { tap('soft', e); setStage('invoice'); };
  const confirm = async () => {
    setStage('paying');
    try {
      if (window.API && window.API.isReady()) {
        const inv = await window.API.fetch('/api/stars/invoice', {
          method: 'POST',
          body: JSON.stringify({ purpose: 'demo_heart', amount_stars: 1 }),
        });
        pendingPaymentRef.current = inv.payment_id;
        const tg = window.Telegram && window.Telegram.WebApp;
        if (tg && typeof tg.openInvoice === 'function' && inv.invoice_url && inv.invoice_url.startsWith('https://t.me/')) {
          tg.openInvoice(inv.invoice_url, (status) => {
            if (status === 'paid') return; // WS will flip stage
            if (status === 'cancelled' || status === 'failed') {
              pendingPaymentRef.current = null;
              setStage('idle');
            }
          });
          // safety fallback if WS push never arrives (8s)
          setTimeout(() => {
            if (pendingPaymentRef.current === inv.payment_id) {
              pendingPaymentRef.current = null;
              setStage('success');
              tap('success', { x: window.innerWidth / 2, y: window.innerHeight / 2 });
              burst();
            }
          }, 8000);
          return;
        }
      }
    } catch (e) { console.warn('invoice', e); }
    // mock fallback for browser dev
    await new Promise((r) => setTimeout(r, 1400));
    setStage('success');
    tap('success', { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    burst();
  };
  const cancel = () => { tap('warning'); pendingPaymentRef.current = null; setStage('idle'); };

  const burst = () => {
    const pts = Array.from({ length: 26 }, (_, i) => ({
      id: i + Math.random(),
      x: 0, y: 0,
      vx: (Math.random() - 0.5) * 380,
      vy: -Math.random() * 380 - 50,
      hue: 50 + Math.random() * 25,
      size: 8 + Math.random() * 8,
      rot: Math.random() * 360,
    }));
    setParticles(pts);
    setTimeout(() => setParticles([]), 1700);
  };

  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        height: 230, borderRadius: 22,
        background: stage === 'success'
          ? 'linear-gradient(160deg, oklch(0.85 0.16 55), oklch(0.65 0.22 25))'
          : 'linear-gradient(160deg, oklch(0.86 0.10 55), oklch(0.78 0.14 35))',
        position: 'relative', overflow: 'hidden',
        display: 'grid', placeItems: 'center',
        boxShadow: '0 18px 36px oklch(0.7 0.18 35 / 0.35)',
        transition: 'background 400ms',
      }}>
        <Heart on={stage === 'success'}/>
        {/* particle layer */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {particles.map((p) => (
            <div key={p.id} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: p.size, height: p.size,
              transform: 'translate(-50%, -50%)',
              animation: 'tg-confetti 1.6s cubic-bezier(.2,.7,.3,1) forwards',
              '--vx': p.vx + 'px', '--vy': p.vy + 'px',
              '--rot': p.rot + 'deg',
            }}>
              <svg viewBox="0 0 12 12" style={{ width: '100%', height: '100%' }}>
                <path d="M6 11 L1 5.5 A3 3 0 016 3 A3 3 0 0111 5.5 z"
                      fill={`oklch(0.78 0.22 ${p.hue})`}/>
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 4px 0' }}>
        {stage !== 'success' ? (
          <>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 22, fontWeight: 700, letterSpacing: -0.4,
            }}>Send a heart</div>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 14, color: 'var(--tg-subtitle-text)',
              marginTop: 4, marginBottom: 16,
            }}>One Star · automatically refunded after 60 seconds.</div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px',
              borderRadius: 14, background: 'var(--tg-section-bg)',
              border: '0.5px solid var(--tg-card-border)',
              boxShadow: 'var(--tg-card-shadow)',
            }}>
              <Glyph name="star" size={20} style={{ color: 'oklch(0.78 0.22 55)' }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: '-apple-system, system-ui', fontSize: 14, fontWeight: 600 }}>1 Star</div>
                <div style={{ fontFamily: '-apple-system, system-ui', fontSize: 12, color: 'var(--tg-subtitle-text)' }}>≈ free for this demo</div>
              </div>
              <Pill bg="oklch(0.92 0.05 145)" fg="oklch(0.42 0.13 145)">refund 60s</Pill>
            </div>
          </>
        ) : (
          <SuccessState refund={refund} onUndo={() => setStage('idle')}/>
        )}
      </div>

      {stage === 'invoice' && (
        <InvoiceSheet onConfirm={confirm} onCancel={cancel}/>
      )}

      <MainButton
        label={stage === 'paying' ? 'Paying…' : stage === 'success' ? 'Send another' : 'Pay 1 Star'}
        haptic={stage === 'success' ? 'soft' : 'medium'}
        loading={stage === 'paying'}
        onClick={stage === 'success' ? () => setStage('idle') : start}
      />
    </div>
  );
}

function Heart({ on }) {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120" style={{
      transform: on ? 'scale(1.05)' : 'scale(1)',
      filter: 'drop-shadow(0 8px 20px rgba(120,30,30,0.3))',
      transition: 'transform 300ms cubic-bezier(.2,1.6,.3,1)',
    }}>
      <defs>
        <linearGradient id="heart-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff"/>
          <stop offset="1" stopColor="oklch(0.9 0.14 25)"/>
        </linearGradient>
      </defs>
      <path d="M50 86 L14 50 A20 20 0 0150 22 A20 20 0 0186 50 z"
            fill="url(#heart-grad)" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
    </svg>
  );
}

function InvoiceSheet({ onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 7,
      background: 'rgba(15,17,20,0.45)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'tg-fade-in 220ms',
    }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--tg-section-bg)', color: 'var(--tg-text)',
        width: '100%', borderRadius: '20px 20px 0 0',
        padding: '14px 18px 28px',
        animation: 'tg-sheet-up 280ms cubic-bezier(.2,.7,.3,1)',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'var(--tg-section-separator)',
          margin: '0 auto 14px',
        }}/>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, color: 'var(--tg-subtitle-text)', textAlign: 'center', marginBottom: 4,
        }}>Confirm payment to</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 17, fontWeight: 700, textAlign: 'center',
        }}>@APIShowcaseBot</div>

        <div style={{
          margin: '18px 0', padding: '14px',
          background: 'var(--tg-secondary-bg)', borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'oklch(0.92 0.1 55)',
              display: 'grid', placeItems: 'center',
            }}>
              <Glyph name="star" size={18} style={{ color: 'oklch(0.7 0.22 55)' }}/>
            </div>
            <div>
              <div style={{ fontFamily: '-apple-system, system-ui', fontSize: 14, fontWeight: 600 }}>Heart</div>
              <div style={{ fontFamily: '-apple-system, system-ui', fontSize: 12, color: 'var(--tg-subtitle-text)' }}>Demo gift</div>
            </div>
          </div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 17, fontWeight: 700,
          }}>1 ★</div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={sheetBtn(false)}>Cancel</button>
          <button onClick={onConfirm} style={sheetBtn(true)}>Pay 1 Star</button>
        </div>
      </div>
    </div>
  );
}

function SuccessState({ refund, onUndo }) {
  return (
    <div>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 22, fontWeight: 700, letterSpacing: -0.4,
        animation: 'tg-pop 480ms cubic-bezier(.2,1.6,.3,1)',
      }}>Heart delivered 💛</div>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 14, color: 'var(--tg-subtitle-text)',
        marginTop: 4, marginBottom: 16,
      }}>The bot got your 1 Star.</div>

      <div style={{
        padding: '10px 12px', borderRadius: 12,
        background: 'color-mix(in oklch, oklch(0.7 0.18 145) 14%, transparent)',
        border: '0.5px solid color-mix(in oklch, oklch(0.6 0.18 145) 38%, transparent)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 16,
          background: `conic-gradient(oklch(0.6 0.18 145) ${(refund/60)*360}deg, transparent 0)`,
          display: 'grid', placeItems: 'center',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 13,
            background: 'var(--tg-section-bg)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 11, fontWeight: 700,
          }}>{refund}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: '-apple-system, system-ui', fontSize: 13, fontWeight: 600 }}>
            Auto-refund in {refund}s
          </div>
          <div style={{ fontFamily: '-apple-system, system-ui', fontSize: 11, color: 'var(--tg-subtitle-text)' }}>
            We never keep demo Stars — your balance stays the same.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 4. Biometric Vault
// ─────────────────────────────────────────────────────────────────────────

function BiometricVault() {
  const tap = useHaptic();
  const [stage, setStage] = React.useState('locked'); // 'locked' | 'scanning' | 'unlocked' | 'denied'
  const [confetti, setConfetti] = React.useState(false);
  const [secret, setSecret] = React.useState('Build with Telegram → ship in a weekend.');

  const loadSecret = async () => {
    if (!window.API || !window.API.isReady()) return;
    try {
      const v = await window.API.fetch('/api/vault');
      if (v && v.secret_note) {
        setSecret(v.secret_note);
      } else {
        // seed default for first-time users so the demo shows something
        await window.API.fetch('/api/vault', {
          method: 'PUT',
          body: JSON.stringify({ secret_note: 'Build with Telegram → ship in a weekend.' }),
        });
      }
    } catch (e) { console.warn('vault', e); }
  };

  const unlock = async () => {
    setStage('scanning');
    tap('soft', { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    await new Promise((r) => setTimeout(r, 1400));
    // 92% success
    if (Math.random() < 0.92) {
      tap('success');
      await loadSecret();
      setStage('unlocked');
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1500);
    } else {
      tap('error');
      setStage('denied');
      setTimeout(() => setStage('locked'), 1500);
    }
  };

  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        height: 280, borderRadius: 24,
        background: stage === 'unlocked'
          ? 'linear-gradient(155deg, oklch(0.85 0.13 145), oklch(0.6 0.18 165))'
          : stage === 'denied'
          ? 'linear-gradient(155deg, oklch(0.78 0.16 25), oklch(0.5 0.2 15))'
          : 'linear-gradient(155deg, oklch(0.32 0.08 280), oklch(0.18 0.06 260))',
        position: 'relative', overflow: 'hidden',
        display: 'grid', placeItems: 'center',
        marginBottom: 18,
        boxShadow: '0 18px 36px oklch(0.3 0.1 270 / 0.4)',
        transition: 'background 400ms',
      }}>
        <FaceFrame stage={stage}/>
        {confetti && <ConfettiBurst/>}
      </div>

      {stage === 'unlocked' ? (
        <div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 22, fontWeight: 700, letterSpacing: -0.4,
            animation: 'tg-pop 380ms cubic-bezier(.2,1.6,.3,1)',
          }}>Welcome back.</div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 14, color: 'var(--tg-subtitle-text)', marginTop: 4, marginBottom: 14,
          }}>Secure storage decrypted just for this session.</div>

          <div style={{
            padding: 14, borderRadius: 14,
            background: 'var(--tg-section-bg)',
            border: '0.5px solid var(--tg-card-border)',
            boxShadow: 'var(--tg-card-shadow)',
            fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 12,
          }}>
            <div style={{ color: 'var(--tg-subtitle-text)', marginBottom: 4 }}>secret_note</div>
            <div>“ {secret}”</div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 22, fontWeight: 700, letterSpacing: -0.4,
          }}>{stage === 'scanning' ? 'Look at the camera…' : stage === 'denied' ? 'Try again' : 'The vault is locked'}</div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 14, color: 'var(--tg-subtitle-text)', marginTop: 4,
          }}>{stage === 'denied'
            ? 'We couldn’t verify your face. No worries.'
            : 'Tap unlock to verify with Face or Touch ID.'}</div>
        </div>
      )}

      <MainButton
        label={stage === 'unlocked' ? 'Lock again' : 'Unlock'}
        haptic={stage === 'unlocked' ? 'warning' : 'medium'}
        loading={stage === 'scanning'}
        onClick={stage === 'unlocked' ? () => setStage('locked') : unlock}
      />
    </div>
  );
}

function FaceFrame({ stage }) {
  const corner = (tr) => (
    <div style={{
      position: 'absolute', width: 28, height: 28,
      border: '3px solid rgba(255,255,255,0.85)',
      borderRadius: 6, ...tr,
    }}/>
  );
  return (
    <div style={{
      position: 'relative', width: 158, height: 200,
    }}>
      {corner({ top: 0, left: 0, borderRight: 'none', borderBottom: 'none' })}
      {corner({ top: 0, right: 0, borderLeft: 'none', borderBottom: 'none' })}
      {corner({ bottom: 0, left: 0, borderRight: 'none', borderTop: 'none' })}
      {corner({ bottom: 0, right: 0, borderLeft: 'none', borderTop: 'none' })}
      {/* central glyph */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'grid', placeItems: 'center',
        color: 'rgba(255,255,255,0.92)',
      }}>
        {stage === 'unlocked' ? (
          <svg width="80" height="80" viewBox="0 0 80 80" style={{
            animation: 'tg-pop 380ms cubic-bezier(.2,1.6,.3,1)',
          }}>
            <circle cx="40" cy="40" r="34" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
            <path d="M22 40 L34 52 L58 26" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
            <circle cx="45" cy="52" r="3.4" fill="#fff"/>
            <circle cx="75" cy="52" r="3.4" fill="#fff"/>
            <path d="M45 76 Q60 84 75 76" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"/>
          </svg>
        )}
      </div>
      {stage === 'scanning' && (
        <div style={{
          position: 'absolute', left: 6, right: 6, height: 2,
          top: 30, background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 0 10px rgba(255,255,255,0.7)',
          animation: 'tg-scanline 1.2s linear infinite',
        }}/>
      )}
    </div>
  );
}

function ConfettiBurst() {
  const pieces = React.useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i, hue: 80 + Math.random() * 80,
    vx: (Math.random() - 0.5) * 350,
    vy: -Math.random() * 320 - 50,
    rot: Math.random() * 360,
    size: 6 + Math.random() * 6,
  })), []);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: 'absolute', left: '50%', top: '50%',
          width: p.size, height: p.size, borderRadius: 1,
          background: `oklch(0.7 0.18 ${p.hue})`,
          transform: 'translate(-50%, -50%)',
          animation: 'tg-confetti 1.6s cubic-bezier(.2,.7,.3,1) forwards',
          '--vx': p.vx + 'px', '--vy': p.vy + 'px', '--rot': p.rot + 'deg',
        }}/>
      ))}
    </div>
  );
}

Object.assign(window, { StorageInspector, SensorsCube, StarsPayment, BiometricVault });
