// onboarding.jsx — first-impression sequence (v2.0, 8-second tact sheet).
// 0.0 s  : screen settles
// 0.2 s  : logo enters
// 1.6 s  : logo settles (no haptic yet — the silence before the first beat)
// 3.0 s  : FIRST HAPTIC — 'medium'. The single most important metric.
// 3.0–6.0 s : three lines fade in (1.5 s each), each fires 'selection'
// 6.0 s  : MainButton appears with shine
// tap    : 'rigid' → onDone()

function Onboarding({ userName = 'Alex', onDone, motionDensity = 'regular' }) {
  const tap = useHaptic();
  const [step, setStep] = React.useState(0);   // 0..3 = lines visible
  const [logoBeat, setLogoBeat] = React.useState(0);
  const reduced = motionDensity === 'reduced';

  // Auto-fire logo haptic + step the lines.
  React.useEffect(() => {
    if (reduced) { setStep(3); setLogoBeat(1); return undefined; }
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2 - 60;
    const settle = setTimeout(() => setLogoBeat(1), 200);
    // 3.0 s — the cornerstone first haptic. This timing is non-negotiable.
    const first = setTimeout(() => {
      tap('medium', { x: cx, y: cy });
      setStep(1);
    }, 3000);
    const t2 = setTimeout(() => { tap('selection', { x: cx, y: cy + 120 }); setStep(2); }, 4500);
    const t3 = setTimeout(() => { tap('selection', { x: cx, y: cy + 150 }); setStep(3); }, 6000);
    return () => [settle, first, t2, t3].forEach(clearTimeout);
  }, [tap, reduced]);

  const lines = [
    'I know who you are.',
    'I can feel your phone.',
    'I live inside Telegram.',
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 4,
      background: 'var(--tg-bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '120px 32px 110px',
      color: 'var(--tg-text)',
      overflow: 'hidden',
    }}>
      {/* logo — bitmap mark with an orange glow ring */}
      <div style={{
        marginTop: 8, position: 'relative',
        width: 112, height: 112,
        borderRadius: '50%',
        // local accent override so tg-pulse uses orange instead of the global blue
        ['--tg-accent']: '#ff6a1a',
        animation: logoBeat ? 'tg-pulse 2.4s cubic-bezier(.4,.0,.2,1) infinite' : 'none',
      }}>
        <img
          src="uploads/new_logo_swap_to_this_and_set_the_size_if_needed.png"
          alt="API Showcase logo"
          width={112}
          height={112}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      <div style={{
        marginTop: 26,
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase',
        color: 'var(--tg-hint)',
        opacity: step >= 1 ? 1 : 0, transition: 'opacity 500ms',
      }}>
        Hi, {userName}.
      </div>

      <h1 style={{
        marginTop: 6, marginBottom: 0,
        fontFamily: '-apple-system, system-ui',
        fontSize: 26, fontWeight: 700, letterSpacing: -0.5,
        textAlign: 'center',
        opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 500ms ease, transform 500ms cubic-bezier(.2,.7,.3,1)',
      }}>Ready to see what Telegram can do?</h1>

      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
        {lines.map((t, i) => (
          <div key={i} style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 18, fontWeight: 500, color: 'var(--tg-text)',
            opacity: step > i ? 1 : 0,
            transform: step > i ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 480ms cubic-bezier(.2,.7,.3,1), transform 480ms cubic-bezier(.2,.7,.3,1)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--tg-accent)',
              boxShadow: step > i ? '0 0 0 4px color-mix(in oklch, var(--tg-accent) 28%, transparent)' : 'none',
              transition: 'box-shadow 500ms ease',
            }}/>
            {t}
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* verified pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px 6px 8px',
        borderRadius: 999,
        background: 'color-mix(in oklch, oklch(0.7 0.18 145) 14%, transparent)',
        color: 'oklch(0.45 0.15 145)',
        fontFamily: '-apple-system, system-ui', fontSize: 12, fontWeight: 600,
        opacity: step >= 3 ? 1 : 0, transition: 'opacity 600ms',
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        Verified by Telegram · signed in 6 ms
      </div>

      <MainButton
        label="Start the tour"
        haptic="rigid"
        shine={true}
        visible={step >= 3}
        onClick={() => {
          setTimeout(() => onDone && onDone(), 220);
        }}
      />
    </div>
  );
}

Object.assign(window, { Onboarding });
