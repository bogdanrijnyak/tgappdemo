// launch-badge.jsx — chip in the host chrome showing which of 7 launch
// methods brought the viewer here. Tap → sheet with all 7 modes, current one
// highlighted and firing a success haptic.

function LaunchModeBadge({ modeId, onPress }) {
  const tap = useHaptic();
  const mode = LAUNCH_MODES.find((m) => m.id === modeId) || LAUNCH_MODES[1];
  return (
    <button onClick={(e) => { tap('selection', e); onPress && onPress(); }}
      style={{
        appearance: 'none', border: 0, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '3px 10px 3px 7px',
        borderRadius: 999,
        background: 'color-mix(in oklch, var(--tg-text) 6%, transparent)',
        color: 'var(--tg-subtitle-text)',
        fontFamily: '-apple-system, system-ui', fontSize: 10.5, fontWeight: 600,
        letterSpacing: 0.1,
        maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
      <span style={{ fontSize: 11 }}>{mode.emoji}</span>
      <span>{mode.title}</span>
    </button>
  );
}

function LaunchModeSheet({ activeId, onPick, onCancel }) {
  const tap = useHaptic();
  return (
    <div onClick={onCancel} style={{
      position: 'absolute', inset: 0, zIndex: 9,
      background: 'rgba(8,10,14,0.45)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'tg-fade-in 220ms',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--tg-section-bg)', color: 'var(--tg-text)',
        width: '100%', borderRadius: '20px 20px 0 0',
        padding: '14px 14px 28px',
        animation: 'tg-sheet-up 280ms cubic-bezier(.2,.7,.3,1)',
        maxHeight: '80%', overflowY: 'auto',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'var(--tg-section-separator)',
          margin: '0 auto 14px',
        }}/>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 17, fontWeight: 700, marginBottom: 4, padding: '0 6px',
        }}>Seven ways to arrive</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, color: 'var(--tg-subtitle-text)', marginBottom: 14, padding: '0 6px',
        }}>The Mini App SDK reports which one was used — most viewers never realise there’s a difference.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {LAUNCH_MODES.map((m) => {
            const on = m.id === activeId;
            return (
              <PressCard key={m.id} haptic={on ? 'success' : 'selection'}
                onPress={(e) => { tap(on ? 'success' : 'selection', e); onPick(m.id); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 12,
                  background: on ? 'color-mix(in oklch, var(--tg-accent) 14%, transparent)' : 'var(--tg-secondary-bg)',
                  border: '0.5px solid ' + (on ? 'color-mix(in oklch, var(--tg-accent) 38%, transparent)' : 'var(--tg-card-border)'),
                }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: on
                    ? 'linear-gradient(135deg, color-mix(in oklch, var(--tg-accent) 80%, white), var(--tg-accent))'
                    : 'var(--tg-section-bg)',
                  display: 'grid', placeItems: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>{m.emoji}</div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{
                    fontFamily: '-apple-system, system-ui',
                    fontSize: 14, fontWeight: 600, color: 'var(--tg-text)',
                  }}>{m.title}</div>
                  <div style={{
                    fontFamily: 'ui-monospace, "SF Mono", monospace',
                    fontSize: 11, color: 'var(--tg-subtitle-text)', marginTop: 2,
                  }}>{m.subtitle}</div>
                </div>
                {on && (
                  <div style={{
                    padding: '2px 7px', borderRadius: 999,
                    background: 'oklch(0.65 0.18 145)', color: '#fff',
                    fontFamily: '-apple-system, system-ui',
                    fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
                  }}>You</div>
                )}
              </PressCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LaunchModeBadge, LaunchModeSheet });
