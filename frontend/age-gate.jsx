// age-gate.jsx — 18+ AgeVerificationGate (v2.0 §2.2).
// Frosted blur over a sensitive-content card with a "Verify your age" CTA.
// Tapping triggers the native Telegram age-verification flow (mocked here as
// a 1.4 s scan with a success haptic). The gate dissolves with a 600 ms morph
// reveal — the underlying content scales in from 0.96 with a fade.
// Country code + minimum age live as small labels on the gate.

function AgeVerificationGate({
  visible = true,
  country = 'UA',
  minAge = 18,
  onVerified,
  children,
  contentLabel = 'Sensitive content',
}) {
  const tap = useHaptic();
  const [stage, setStage] = React.useState('locked'); // 'locked' | 'verifying' | 'unlocked'
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    if (!visible) { setStage('locked'); setRevealed(false); }
  }, [visible]);

  const verify = async (e) => {
    tap('soft', e);
    setStage('verifying');
    window.API && window.API.track && window.API.track('age_verify_requested', { country, min_age: minAge });
    await new Promise((r) => setTimeout(r, 1400));
    tap('success');
    setStage('unlocked');
    window.tgLog && window.tgLog('age_verification_passed', { country, min_age: minAge });
    window.API && window.API.track && window.API.track('age_verify_passed', { country, min_age: minAge });
    // 600 ms morph reveal — gate fades out, content scales in.
    setTimeout(() => {
      setRevealed(true);
      onVerified && onVerified();
    }, 600);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 18 }}>
      <div style={{
        opacity: revealed ? 1 : 0.3,
        transform: revealed ? 'scale(1)' : 'scale(0.96)',
        transition: 'opacity 600ms cubic-bezier(.2,.7,.3,1), transform 600ms cubic-bezier(.2,.7,.3,1)',
      }}>{children}</div>

      {!revealed && (
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: 18,
          backdropFilter: 'blur(28px) saturate(140%)',
          WebkitBackdropFilter: 'blur(28px) saturate(140%)',
          background: 'color-mix(in srgb, var(--tg-bg) 60%, transparent)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '22px 18px',
          textAlign: 'center', gap: 10,
          opacity: stage === 'unlocked' ? 0 : 1,
          transition: 'opacity 580ms cubic-bezier(.2,.7,.3,1)',
        }}>
          <ShieldOrb stage={stage}/>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
            color: 'var(--tg-destructive-text)', opacity: 0.62, fontWeight: 800,
          }}>{contentLabel}</div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 18, fontWeight: 700, letterSpacing: -0.3,
            color: 'var(--tg-text)',
          }}>Verify your age to view</div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 12, color: 'var(--tg-subtitle-text)',
            maxWidth: 260, lineHeight: 1.45,
          }}>Telegram confirms you're at least {minAge}. We don't see your ID
             — only a yes/no comes back to the Mini App.</div>

          {/* Country + age labels */}
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <Label>🌐 {country}</Label>
            <Label>{minAge}+</Label>
          </div>

          <button onClick={verify} disabled={stage !== 'locked'}
            style={{
              marginTop: 12,
              height: 42, padding: '0 22px', borderRadius: 12, border: 0,
              background: stage === 'verifying'
                ? 'color-mix(in oklch, var(--tg-destructive-text) 60%, var(--tg-button))'
                : 'var(--tg-destructive-text)',
              color: '#fff', cursor: stage === 'locked' ? 'pointer' : 'wait',
              fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 14,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              transition: 'background 280ms',
              boxShadow: '0 8px 22px color-mix(in oklch, var(--tg-destructive-text) 28%, transparent)',
            }}>
            {stage === 'verifying' ? (
              <>
                <span style={{
                  display: 'inline-block', width: 14, height: 14,
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'tg-spin 800ms linear infinite',
                }}/>
                Verifying…
              </>
            ) : 'Verify your age'}
          </button>
        </div>
      )}
    </div>
  );
}

function Label({ children }) {
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 999,
      background: 'var(--tg-secondary-bg)',
      border: '0.5px solid var(--tg-card-border)',
      color: 'var(--tg-subtitle-text)',
      fontFamily: 'ui-monospace, "SF Mono", monospace',
      fontSize: 10, fontWeight: 700, letterSpacing: 0.2,
    }}>{children}</span>
  );
}

function ShieldOrb({ stage }) {
  return (
    <div style={{
      position: 'relative',
      width: 72, height: 72,
      display: 'grid', placeItems: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 22,
        background: stage === 'unlocked'
          ? 'linear-gradient(135deg, oklch(0.7 0.18 145), oklch(0.55 0.2 165))'
          : 'linear-gradient(135deg, color-mix(in oklch, var(--tg-destructive-text) 92%, white), color-mix(in oklch, var(--tg-destructive-text) 60%, black))',
        opacity: 0.55,
        boxShadow: '0 16px 36px color-mix(in oklch, var(--tg-destructive-text) 30%, transparent)',
        transition: 'background 400ms',
      }}/>
      <svg viewBox="0 0 36 36" width={36} height={36} style={{ position: 'relative', color: '#fff' }}>
        {stage === 'unlocked' ? (
          <path d="M8 18 L15 25 L28 12" stroke="currentColor" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        ) : (
          <path d="M18 4 L30 9 V18 C30 25 24 31 18 33 C12 31 6 25 6 18 V9 z M18 13 V20 M18 24 v.5"
                stroke="currentColor" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        )}
      </svg>
      {stage === 'verifying' && (
        <div style={{
          position: 'absolute', inset: -6, borderRadius: 26,
          border: '2px solid var(--tg-destructive-text)',
          opacity: 0.4,
          animation: 'tg-pulse 1.4s ease-in-out infinite',
        }}/>
      )}
    </div>
  );
}

// ─── Demo screen — the gate over a single sensitive content card ─────────
function AgeVerificationDemo() {
  const [resetKey, setResetKey] = React.useState(0);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Mini Apps can ask the host to verify the viewer's age. Telegram runs
         the flow; only a yes/no comes back — no ID, no birthdate.</div>

      <AgeVerificationGate
        key={resetKey}
        country="UA" minAge={18}
        contentLabel="Whiskey tasting · 18+">
        <SensitiveContent/>
      </AgeVerificationGate>

      <div style={{ height: 14 }}/>
      <PressCard haptic="selection" onPress={() => setResetKey((k) => k + 1)}
        style={{
          padding: '10px 12px', borderRadius: 12,
          background: 'var(--tg-secondary-bg)',
          textAlign: 'center',
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, fontWeight: 600, color: 'var(--tg-link)',
          display: 'block', width: '100%',
        }}>Lock again</PressCard>
    </div>
  );
}

function SensitiveContent() {
  return (
    <div style={{
      borderRadius: 18, overflow: 'hidden',
      background: 'linear-gradient(160deg, oklch(0.4 0.13 35), oklch(0.22 0.1 45))',
      color: '#fff', padding: 16,
      minHeight: 240,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      position: 'relative',
    }}>
      {/* mock bottle silhouette */}
      <svg viewBox="0 0 200 200" style={{
        position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
        opacity: 0.55,
      }} width={140} height={140}>
        <defs>
          <linearGradient id="bottle-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(255,210,140,0.9)"/>
            <stop offset="1" stopColor="rgba(180,90,40,0.9)"/>
          </linearGradient>
        </defs>
        <rect x={88} y={20} width={24} height={28} rx={3} fill="rgba(40,18,8,0.85)"/>
        <path d="M82 48 H 118 V 70 L 130 90 V 180 H 70 V 90 L 82 70 z"
              fill="url(#bottle-grad)" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5}/>
        <rect x={80} y={110} width={40} height={42} rx={3} fill="rgba(255,255,255,0.18)"/>
        <text x={100} y={134} textAnchor="middle"
              fontFamily="-apple-system, system-ui"
              fontSize={9} fontWeight={700} fill="rgba(40,18,8,0.85)">12</text>
        <text x={100} y={146} textAnchor="middle"
              fontFamily="-apple-system, system-ui"
              fontSize={6} letterSpacing={1.5} fill="rgba(40,18,8,0.75)">YR · 46%</text>
      </svg>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', opacity: 0.7,
        fontWeight: 800, marginBottom: 4,
      }}>Tasting flight · 03</div>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 20, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2,
        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
      }}>Three highland whiskies, side-by-side.</div>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 12, color: 'rgba(255,255,255,0.75)',
        marginTop: 4, lineHeight: 1.4,
      }}>Saturday · 19:00 · 8 seats left</div>
    </div>
  );
}

Object.assign(window, { AgeVerificationGate, AgeVerificationDemo });
