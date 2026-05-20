// premium-gate.jsx — soft-block overlay for Premium-only demos.
// Per the addendum: never a hard block. Always offers "See Premium" + "Continue
// without". Uses the canonical Telegram Premium gradient (purple → blue).
//
// Gradient: 135deg, #6C5CE7 → #5F27CD → #4834D4.

function PremiumGate({ visible, title = 'Premium feature', reason, onUnlock, onContinue, children }) {
  const tap = useHaptic();
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    // Reset when becoming visible again (new card opened).
    if (visible) setDismissed(false);
  }, [visible]);

  if (!visible || dismissed) return children || null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 6,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 28px 110px',
      textAlign: 'center',
      animation: 'tg-fade-in 280ms',
      background: 'color-mix(in srgb, var(--tg-bg) 38%, transparent)',
      backdropFilter: 'blur(28px) saturate(140%)',
      WebkitBackdropFilter: 'blur(28px) saturate(140%)',
    }}>
      <PremiumOrb/>

      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
        background: 'linear-gradient(135deg, #6C5CE7 0%, #5F27CD 50%, #4834D4 100%)',
        WebkitBackgroundClip: 'text', backgroundClip: 'text',
        color: 'transparent', fontWeight: 800,
        marginTop: 18,
      }}>Telegram Premium</div>

      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 22, fontWeight: 700, letterSpacing: -0.4,
        color: 'var(--tg-text)', marginTop: 6,
      }}>{title}</div>

      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 14, color: 'var(--tg-subtitle-text)',
        marginTop: 8, maxWidth: 280, lineHeight: 1.45,
      }}>{reason || 'Premium unlocks this feature, alongside double limits and a few hundred others.'}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22, width: '100%', maxWidth: 280 }}>
        <button onClick={(e) => { tap('soft', e); onUnlock && onUnlock(); }}
          style={{
            height: 46, borderRadius: 13, border: 0,
            background: 'linear-gradient(135deg, #6C5CE7 0%, #5F27CD 50%, #4834D4 100%)',
            color: '#fff', cursor: 'pointer',
            fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 15,
            boxShadow: '0 10px 28px rgba(95,39,205,0.4)',
          }}>See Premium</button>
        <button onClick={(e) => {
            tap('selection', e);
            setDismissed(true);
            onContinue && onContinue();
          }}
          style={{
            height: 40, borderRadius: 13, border: 0,
            background: 'transparent', color: 'var(--tg-link)',
            cursor: 'pointer',
            fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 14,
          }}>Continue without</button>
      </div>
    </div>
  );
}

function PremiumOrb() {
  return (
    <div style={{
      position: 'relative', width: 92, height: 92,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: 24,
        background: 'linear-gradient(135deg, #6C5CE7 0%, #5F27CD 50%, #4834D4 100%)',
        boxShadow: '0 18px 42px rgba(95,39,205,0.5), inset 0 1px 0 rgba(255,255,255,0.35)',
        animation: 'tg-premium-pulse 2.8s ease-in-out infinite',
      }}/>
      <svg viewBox="0 0 92 92" style={{ position: 'absolute', inset: 0 }}>
        <path d="M46 22 L52 38 L68 40 L56 52 L60 68 L46 60 L32 68 L36 52 L24 40 L40 38 z"
              fill="rgba(255,255,255,0.92)"
              stroke="rgba(255,255,255,0.5)" strokeWidth="0.5"/>
      </svg>
    </div>
  );
}

Object.assign(window, { PremiumGate, PremiumOrb });
