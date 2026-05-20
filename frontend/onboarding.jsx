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
      {/* logo — grunge ink-splash circle with a bold "2", transparent backdrop */}
      <div style={{
        marginTop: 8, position: 'relative',
        width: 112, height: 112,
        animation: logoBeat ? 'tg-pulse 2.4s cubic-bezier(.4,.0,.2,1) infinite' : 'none',
      }}>
        <svg viewBox="0 0 120 120" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            <filter id="ink-grunge" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/>
              <feDisplacementMap in="SourceGraphic" scale="5"/>
            </filter>
            <filter id="ink-edge" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="3"/>
              <feDisplacementMap in="SourceGraphic" scale="9"/>
            </filter>
          </defs>
          {/* outer rough ring + ink blot, displaced for an inky edge */}
          <g filter="url(#ink-edge)">
            <circle cx="60" cy="60" r="46" fill="#0a0a0a"/>
            {/* drips */}
            <ellipse cx="46" cy="106" rx="3" ry="9" fill="#0a0a0a"/>
            <ellipse cx="74" cy="108" rx="2.4" ry="7" fill="#0a0a0a"/>
            <circle cx="46" cy="114" r="2.2" fill="#0a0a0a"/>
            {/* splatter dots */}
            <circle cx="14" cy="40" r="2" fill="#0a0a0a"/>
            <circle cx="108" cy="32" r="1.6" fill="#0a0a0a"/>
            <circle cx="106" cy="78" r="2.2" fill="#0a0a0a"/>
            <circle cx="20" cy="84" r="1.4" fill="#0a0a0a"/>
          </g>
          {/* the "2" — bold, slightly grungy */}
          <g filter="url(#ink-grunge)">
            <text x="60" y="84"
                  textAnchor="middle"
                  fontFamily='Impact, "Anton", "Oswald", Haettenschweiler, "Arial Narrow Bold", system-ui, sans-serif'
                  fontSize="78"
                  fontWeight="900"
                  fill="#ffffff"
                  letterSpacing="-2">2</text>
          </g>
        </svg>
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
