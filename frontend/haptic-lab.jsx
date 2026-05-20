// haptic-lab.jsx — the showpiece.
// 9 MIDI-style pads + 8-step sequencer + tempo + "send to friend" share.
//
// Interaction model:
//  - Tap a pad → fires its haptic AND becomes the "active pad"
//  - Tap a step → assigns active pad to that step + fires it as a preview
//  - Long-press a step → clears it
//  - MainButton = Play (toggle); during play, each step fires every {step}ms

const HAPTIC_KEYS = ['light', 'soft', 'medium', 'rigid', 'heavy', 'selection', 'success', 'warning', 'error'];

function HapticLab({ onShare }) {
  const tap = useHaptic();
  const [pad, setPad] = React.useState('soft');
  const [pattern, setPattern] = React.useState(['soft','selection','medium','selection','soft','rigid','medium','success']);
  const [playing, setPlaying] = React.useState(false);
  const [step, setStep] = React.useState(-1);
  const [tempo, setTempo] = React.useState(220);
  const [sent, setSent] = React.useState(false);
  const stepRef = React.useRef(step);
  stepRef.current = step;
  const patternRef = React.useRef(pattern);
  patternRef.current = pattern;

  React.useEffect(() => {
    if (!playing) return undefined;
    let i = 0;
    setStep(0);
    const tick = (idx) => {
      const v = patternRef.current[idx];
      if (v) tap(v, { x: window.innerWidth / 2, y: window.innerHeight / 2 + 40 });
    };
    tick(0);
    const id = setInterval(() => {
      i = (i + 1) % 8;
      setStep(i);
      tick(i);
    }, tempo);
    return () => { clearInterval(id); setStep(-1); };
  }, [playing, tempo, tap]);

  const onPad = (k, e) => {
    setPad(k);
    tap(k, e);
  };

  const onStep = (i, e) => {
    setPattern((p) => {
      const next = p.slice();
      next[i] = pad;
      return next;
    });
    tap(pad, e);
  };

  const clearStep = (i) => {
    setPattern((p) => {
      const next = p.slice();
      next[i] = null;
      return next;
    });
  };

  const clearAll = () => {
    setPattern(['','','','','','','',''].map(() => null));
    tap('warning');
  };

  const share = async (e) => {
    tap('success', e);
    setSent(true);
    setTimeout(() => setSent(false), 2200);
    onShare && onShare(pattern);
    const non_empty = pattern.filter((s) => s).length;
    window.API && window.API.track && window.API.track('haptic_pattern_shared', { steps: pattern.length, filled: non_empty });
    if (window.API && window.API.isReady()) {
      try {
        const result = await window.API.fetch('/api/haptic-patterns', {
          method: 'POST', body: JSON.stringify({ steps: pattern }),
        });
        const tg = window.Telegram && window.Telegram.WebApp;
        if (tg && typeof tg.shareMessage === 'function' && result.share_message_id) {
          tg.shareMessage(result.share_message_id);
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText('https://t.me/APIShowcaseBot?startapp=p_' + result.id).catch(() => {});
        }
      } catch (err) { console.warn('share pattern', err); }
    }
  };

  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Tap a pad to feel it. Tap the sequencer to write the beat. Press play.</div>

      {/* Pads */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8, marginBottom: 18,
      }}>
        {HAPTIC_KEYS.map((k) => {
          const h = HAPTICS[k];
          const active = pad === k;
          return (
            <PressCard key={k} haptic={k} onPress={(e) => onPad(k, e)} style={{
              aspectRatio: '1 / 0.74',
              borderRadius: 14, position: 'relative', overflow: 'hidden',
              background: active
                ? `linear-gradient(155deg, oklch(0.65 0.21 ${h.color}), oklch(0.42 0.2 ${h.color + 14}))`
                : `linear-gradient(155deg, oklch(0.28 0.05 ${h.color}), oklch(0.18 0.04 ${h.color}))`,
              color: '#fff',
              boxShadow: active
                ? `0 8px 22px oklch(0.55 0.21 ${h.color} / 0.55), inset 0 1px 0 rgba(255,255,255,0.4)`
                : `inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.4), 0 1px 1px rgba(0,0,0,0.3)`,
              transition: 'transform 110ms cubic-bezier(.3,.7,.4,1), box-shadow 220ms, background 220ms',
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.94)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* waveform */}
              <Waveform kind={k} active={active}/>
              <div style={{
                position: 'absolute', top: 7, left: 9,
                fontFamily: '-apple-system, "SF Mono", ui-monospace, monospace',
                fontSize: 9.5, letterSpacing: 0.8,
                opacity: 0.55, textTransform: 'uppercase',
              }}>{k.slice(0,3)}</div>
              <div style={{
                position: 'absolute', bottom: 8, left: 10,
                fontFamily: '-apple-system, system-ui',
                fontSize: 13, fontWeight: 600,
              }}>{h.label}</div>
            </PressCard>
          );
        })}
      </div>

      {/* Sequencer */}
      <div style={{
        background: 'var(--tg-section-bg)',
        borderRadius: 18,
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
        padding: 12, marginBottom: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 12, fontWeight: 700,
            color: 'var(--tg-section-header-text)',
            letterSpacing: 0.5, textTransform: 'uppercase',
          }}>Sequencer · 8 steps</div>
          <button onClick={clearAll} style={{
            border: 0, background: 'transparent',
            color: 'var(--tg-accent)',
            fontFamily: '-apple-system, system-ui',
            fontSize: 12, fontWeight: 600,
            cursor: 'pointer',
          }}>Clear</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5 }}>
          {pattern.map((v, i) => {
            const h = v && HAPTICS[v];
            const live = step === i;
            return (
              <StepCell key={i} index={i} value={v} hue={h ? h.color : null}
                        live={live} onPress={(e) => onStep(i, e)} onLongPress={() => clearStep(i)}/>
            );
          })}
        </div>

        {/* Tempo */}
        <div style={{ marginTop: 12 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: '-apple-system, system-ui',
            fontSize: 11, color: 'var(--tg-subtitle-text)',
            marginBottom: 4,
          }}>
            <span>Tempo</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.round(60000 / tempo)} bpm</span>
          </div>
          <input type="range" min="120" max="500" value={tempo}
                 onChange={(e) => setTempo(Number(e.target.value))}
                 style={{ width: '100%', accentColor: 'var(--tg-accent)' }}/>
        </div>
      </div>

      {/* Secondary actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <PressCard haptic="selection" onPress={share}
          style={{
            flex: 1, height: 44, borderRadius: 12,
            background: 'var(--tg-secondary-bg)',
            color: 'var(--tg-text)',
            border: '0.5px solid var(--tg-card-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: '-apple-system, system-ui', fontSize: 14, fontWeight: 600,
            position: 'relative', overflow: 'hidden',
          }}>
          {sent ? (
            <span style={{ color: 'oklch(0.5 0.16 145)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" style={{ verticalAlign: -2, marginRight: 4 }}><path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
              Pattern sent
            </span>
          ) : <>
            <Glyph name="msg" size={16}/> Send to a friend
          </>}
        </PressCard>
      </div>

      <PlatformHint/>

      <MainButton
        label={playing ? 'Stop' : 'Play pattern'}
        haptic={playing ? 'warning' : 'soft'}
        variant={playing ? 'destructive' : 'primary'}
        onClick={() => {
          setPlaying((p) => {
            const next = !p;
            window.API && window.API.track && window.API.track(next ? 'haptic_pattern_play' : 'haptic_pattern_stop');
            return next;
          });
        }}
      />
    </div>
  );
}

function StepCell({ index, value, hue, live, onPress, onLongPress }) {
  const longRef = React.useRef(null);
  const startLong = (e) => {
    longRef.current = setTimeout(() => { onLongPress && onLongPress(); longRef.current = null; }, 480);
  };
  const cancelLong = () => { if (longRef.current) { clearTimeout(longRef.current); longRef.current = null; } };
  return (
    <PressCard haptic={value || 'light'}
      onPress={(e) => { cancelLong(); onPress(e); }}
      style={{
        position: 'relative', aspectRatio: '1 / 1.6',
        borderRadius: 8, overflow: 'hidden',
        background: value
          ? `linear-gradient(165deg, oklch(0.62 0.21 ${hue}), oklch(0.4 0.18 ${hue + 12}))`
          : 'color-mix(in oklch, var(--tg-text) 6%, transparent)',
        boxShadow: live
          ? `inset 0 0 0 2px var(--tg-accent), 0 0 16px var(--tg-accent)`
          : value ? 'inset 0 -1px 0 rgba(0,0,0,0.18)' : 'none',
        transition: 'box-shadow 120ms, transform 140ms',
        transform: live ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseDown={startLong}
      onMouseUp={cancelLong}
      onMouseLeave={cancelLong}>
      <div style={{
        position: 'absolute', top: 4, left: 4,
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: 8, color: value ? 'rgba(255,255,255,0.55)' : 'var(--tg-hint)',
      }}>{index + 1}</div>
      {value && <div style={{
        position: 'absolute', bottom: 4, left: 4, right: 4,
        fontFamily: '-apple-system, system-ui',
        fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'uppercase',
        letterSpacing: 0.4, textAlign: 'center',
      }}>{value.slice(0, 3)}</div>}
    </PressCard>
  );
}

// Tiny per-haptic waveform — purely decorative signature for each pad.
function Waveform({ kind, active }) {
  const sig = {
    light:     'M0 12 H40',
    soft:      'M0 12 Q10 6 20 12 T40 12',
    medium:    'M0 12 Q10 0 20 12 T40 12',
    rigid:     'M0 14 L8 4 L16 14 L24 4 L32 14 L40 4',
    heavy:     'M0 16 L6 2 L12 18 L18 4 L24 18 L30 2 L36 18 L40 4',
    selection: 'M0 12 L10 12 L10 6 L20 6 L20 18 L30 18 L30 12 L40 12',
    success:   'M0 14 L8 14 L14 6 L22 18 L30 6 L40 14',
    warning:   'M0 14 L10 14 L10 6 L18 6 L18 18 L26 18 L26 6 L40 6',
    error:     'M0 4 L6 18 L12 4 L18 18 L24 4 L30 18 L36 4 L40 18',
  };
  return (
    <svg viewBox="0 0 40 24" preserveAspectRatio="none"
         style={{
           position: 'absolute', inset: 0,
           width: '100%', height: '100%',
           opacity: active ? 0.6 : 0.18,
         }}>
      <path d={sig[kind] || sig.light} stroke="white" strokeWidth="1.6" fill="none"
            strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PlatformHint() {
  // Detect: roughly mobile if matchMedia coarse pointer + has vibrate
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    setIsMobile(coarse && 'vibrate' in navigator);
  }, []);
  return (
    <div style={{
      padding: '10px 12px',
      borderRadius: 12,
      background: 'color-mix(in oklch, var(--tg-accent) 10%, transparent)',
      border: '0.5px solid color-mix(in oklch, var(--tg-accent) 30%, transparent)',
      color: 'var(--tg-text)',
      fontFamily: '-apple-system, system-ui',
      fontSize: 12, lineHeight: 1.4,
      marginBottom: 12,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>{isMobile ? '📳' : '🔌'}</span>
      <span style={{ flex: 1 }}>
        {isMobile
          ? 'Real device — every tap fires a real haptic.'
          : 'On desktop you see the haptic — plug in your phone to feel it.'}
      </span>
    </div>
  );
}

Object.assign(window, { HapticLab });
