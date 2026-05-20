// business.jsx — Business Integration (v2.0 §2.3).
// Seven demos presented as a "business profile" mini-section, all wrapped in
// the shared <BusinessFeatureCard> shell with a connection-status pip.

// ─── Connection pip — green when connected, grey when preview only ───────
function ConnectionPip({ on }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px 2px 5px',
      borderRadius: 999,
      background: on
        ? 'color-mix(in oklch, oklch(0.7 0.18 145) 14%, transparent)'
        : 'var(--tg-secondary-bg)',
      color: on ? 'oklch(0.42 0.16 145)' : 'var(--tg-hint)',
      fontFamily: '-apple-system, system-ui',
      fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: on ? 'oklch(0.62 0.18 145)' : 'var(--tg-hint)',
        boxShadow: on ? '0 0 0 3px color-mix(in oklch, oklch(0.6 0.18 145) 22%, transparent)' : 'none',
      }}/>
      {on ? 'Connected' : 'Preview'}
    </span>
  );
}

// ─── Card shell — every business demo lives inside this ──────────────────
function BusinessFeatureCard({ title, subtitle, connected = true, children, accent = 130 }) {
  return (
    <div style={{
      background: 'var(--tg-section-bg)',
      border: '0.5px solid var(--tg-card-border)',
      borderRadius: 18,
      boxShadow: 'var(--tg-card-shadow)',
      padding: '14px 14px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: `linear-gradient(180deg, oklch(0.72 0.16 ${accent}), oklch(0.55 0.18 ${accent + 14}))`,
      }}/>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 15, fontWeight: 700, letterSpacing: -0.2,
            color: 'var(--tg-text)',
          }}>{title}</div>
          {subtitle && (
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 11, color: 'var(--tg-subtitle-text)',
              marginTop: 1,
            }}>{subtitle}</div>
          )}
        </div>
        <ConnectionPip on={connected}/>
      </div>
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

// ─── 1. Business hours — clock face with active hours arc ────────────────
function HoursCard() {
  // Open Mon–Fri, 09–18.
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const startH = 9, endH = 18;
  const arcAngle = (h) => (h / 24) * 360 - 90;
  const startA = arcAngle(startH), endA = arcAngle(endH);
  const r = 36;
  const polar = (deg, rad) => {
    const a = (deg * Math.PI) / 180;
    return [50 + rad * Math.cos(a), 50 + rad * Math.sin(a)];
  };
  const [sx, sy] = polar(startA, r);
  const [ex, ey] = polar(endA, r);
  const handA = arcAngle(hour);
  const [hx, hy] = polar(handA, 28);
  const isOpen = hour >= startH && hour < endH;
  return (
    <BusinessFeatureCard title="Business hours"
      subtitle="Mon–Fri · 09:00 – 18:00 EET"
      connected accent={130}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={42}
                  fill="var(--tg-secondary-bg)" stroke="var(--tg-section-separator)" strokeWidth={1}/>
          <path d={`M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`}
                fill="none" stroke="oklch(0.7 0.16 145)" strokeWidth={5} strokeLinecap="round"/>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * 360 - 90;
            const [tx, ty] = polar(a, 44);
            const [tx2, ty2] = polar(a, 40);
            return <line key={i} x1={tx} y1={ty} x2={tx2} y2={ty2}
                         stroke="var(--tg-section-separator)" strokeWidth={1}/>;
          })}
          <circle cx={50} cy={50} r={2} fill="var(--tg-text)"/>
          <line x1={50} y1={50} x2={hx} y2={hy}
                stroke="var(--tg-text)" strokeWidth={2} strokeLinecap="round"/>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999,
            background: isOpen
              ? 'color-mix(in oklch, oklch(0.7 0.18 145) 14%, transparent)'
              : 'color-mix(in oklch, oklch(0.7 0.18 25) 14%, transparent)',
            color: isOpen ? 'oklch(0.42 0.16 145)' : 'oklch(0.5 0.16 25)',
            fontFamily: '-apple-system, system-ui',
            fontSize: 11, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}/>
            {isOpen ? 'Open now' : 'Closed'}
          </div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 12, color: 'var(--tg-subtitle-text)',
            marginTop: 8, lineHeight: 1.4,
          }}>Replies arrive automatically outside hours. Visitors see the away message instead.</div>
        </div>
      </div>
    </BusinessFeatureCard>
  );
}

// ─── 2. Business location — mini-map with a pin ──────────────────────────
function LocationCard() {
  return (
    <BusinessFeatureCard title="Business location"
      subtitle="Visible on your profile · ±30 m" connected accent={170}>
      <div style={{
        height: 110, borderRadius: 12, overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(140deg, oklch(0.88 0.05 200) 0%, oklch(0.78 0.07 165) 100%)',
      }}>
        {/* mock streets */}
        <svg width="100%" height="100%" viewBox="0 0 240 110" preserveAspectRatio="none"
             style={{ position: 'absolute', inset: 0 }}>
          <path d="M-10 24 L110 38 L260 32" stroke="rgba(255,255,255,0.55)" strokeWidth={4} fill="none"/>
          <path d="M30 -10 L66 60 L40 130" stroke="rgba(255,255,255,0.45)" strokeWidth={3} fill="none"/>
          <path d="M150 -5 L160 130" stroke="rgba(255,255,255,0.4)" strokeWidth={2} fill="none"/>
          <path d="M-5 80 L260 76" stroke="rgba(255,255,255,0.35)" strokeWidth={2} fill="none"/>
          <rect x={80} y={40} width={40} height={26} fill="rgba(255,255,255,0.25)" rx={2}/>
          <rect x={170} y={50} width={30} height={20} fill="rgba(255,255,255,0.25)" rx={2}/>
        </svg>
        {/* pin */}
        <div style={{
          position: 'absolute', left: '50%', top: '52%',
          transform: 'translate(-50%, -100%)',
        }}>
          <svg width="32" height="40" viewBox="0 0 32 40">
            <defs>
              <radialGradient id="pin-glow" cx="0.5" cy="0.5">
                <stop offset="0" stopColor="rgba(232,92,111,0.5)"/>
                <stop offset="1" stopColor="rgba(232,92,111,0)"/>
              </radialGradient>
            </defs>
            <ellipse cx={16} cy={38} rx={8} ry={2} fill="rgba(0,0,0,0.2)"/>
            <path d="M16 2 C8 2 4 9 4 15 C4 24 16 38 16 38 C16 38 28 24 28 15 C28 9 24 2 16 2 z"
                  fill="oklch(0.62 0.2 25)"/>
            <circle cx={16} cy={15} r={5} fill="#fff"/>
          </svg>
        </div>
        <div style={{
          position: 'absolute', left: 10, top: 10,
          padding: '4px 9px', borderRadius: 999,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 10, fontWeight: 700, color: '#23130b',
        }}>50.4501° N · 30.5234° E</div>
      </div>
    </BusinessFeatureCard>
  );
}

// ─── 3. Quick replies ────────────────────────────────────────────────────
function QuickRepliesCard() {
  const tap = useHaptic();
  const replies = [
    { trigger: '/hi',     text: 'Hey! Thanks for reaching out — I usually respond within an hour.' },
    { trigger: '/price',  text: 'Pricing is on the link in my bio. Happy to walk through it.' },
    { trigger: '/hours',  text: 'I’m around Mon–Fri 09–18. After that I’ll catch up first thing in the morning.' },
  ];
  const [expandedIdx, setExpandedIdx] = React.useState(0);
  return (
    <BusinessFeatureCard title="Quick reply shortcuts"
      subtitle={`${replies.length} of 20 shortcuts`} connected accent={45}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {replies.map((r, i) => {
          const on = i === expandedIdx;
          return (
            <PressCard key={r.trigger} haptic="selection"
              onPress={(e) => { tap('selection', e); setExpandedIdx(i); }}
              style={{
                padding: '8px 10px', borderRadius: 10,
                background: on ? 'var(--tg-secondary-bg)' : 'transparent',
                border: '0.5px solid ' + (on ? 'var(--tg-card-border)' : 'transparent'),
                display: 'block',
              }}>
              <div style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 12, fontWeight: 700, color: 'oklch(0.5 0.16 45)',
              }}>{r.trigger}</div>
              {on && (
                <div style={{
                  fontFamily: '-apple-system, system-ui',
                  fontSize: 12, color: 'var(--tg-subtitle-text)',
                  marginTop: 3, lineHeight: 1.4,
                }}>{r.text}</div>
              )}
            </PressCard>
          );
        })}
      </div>
    </BusinessFeatureCard>
  );
}

// ─── 4. Greeting + Away messages (two paired cards) ──────────────────────
function GreetingAwayCard() {
  return (
    <BusinessFeatureCard title="Greeting / Away messages"
      subtitle="Auto-fires for first contact + after hours" connected accent={290}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Bubble
          tag="Greeting"
          tagColor={145}
          text="👋 Welcome! Drop your message and I'll get back to you soon."
        />
        <Bubble
          tag="Away"
          tagColor={25}
          text="🌙 Currently away — will reply within 12 h. For urgent things, /sos."
        />
      </div>
    </BusinessFeatureCard>
  );
}

function Bubble({ tag, tagColor, text }) {
  return (
    <div style={{
      padding: '10px 10px 11px', borderRadius: 14,
      background: `color-mix(in oklch, oklch(0.7 0.16 ${tagColor}) 8%, var(--tg-secondary-bg))`,
      border: `0.5px solid color-mix(in oklch, oklch(0.6 0.16 ${tagColor}) 24%, transparent)`,
    }}>
      <div style={{
        display: 'inline-block',
        padding: '2px 7px', borderRadius: 999,
        background: `color-mix(in oklch, oklch(0.6 0.18 ${tagColor}) 18%, transparent)`,
        color: `oklch(0.42 0.16 ${tagColor})`,
        fontFamily: '-apple-system, system-ui',
        fontSize: 10, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
        marginBottom: 5,
      }}>{tag}</div>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 12, color: 'var(--tg-text)', lineHeight: 1.4,
      }}>{text}</div>
    </div>
  );
}

// ─── 5. Business intro (sticker + title + description) ───────────────────
function IntroCard() {
  return (
    <BusinessFeatureCard title="Business intro"
      subtitle="Shown above your bio" connected accent={210}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 60, height: 60, borderRadius: 14,
          background: 'linear-gradient(135deg, oklch(0.82 0.16 210), oklch(0.58 0.2 240))',
          display: 'grid', placeItems: 'center',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 32, lineHeight: 1, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }}>☕</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 14, fontWeight: 700, color: 'var(--tg-text)',
          }}>Daily café · since 2019</div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 12, color: 'var(--tg-subtitle-text)',
            marginTop: 3, lineHeight: 1.4,
          }}>Pastries, espresso, slow Saturdays. Ping us before 17:00 for special-order pickups.</div>
        </div>
      </div>
    </BusinessFeatureCard>
  );
}

// ─── 6. Business chat link (t.me/m/<slug> + copy + QR) ───────────────────
function ChatLinkCard() {
  const tap = useHaptic();
  const slug = 'cafe-daily';
  const link = `t.me/m/${slug}`;
  const [copied, setCopied] = React.useState(false);
  const copy = (e) => {
    tap('success', e);
    setCopied(true);
    try { navigator.clipboard && navigator.clipboard.writeText('https://' + link); } catch (_) {}
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <BusinessFeatureCard title="Business chat link"
      subtitle="One-tap entry to your DMs" connected accent={195}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <PressCard haptic="success" onPress={copy} style={{
          flex: 1,
          padding: '10px 12px', borderRadius: 12,
          background: 'var(--tg-secondary-bg)',
          border: '0.5px solid var(--tg-card-border)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 13, color: 'var(--tg-text)', flex: 1, textAlign: 'left',
          }}>{link}</div>
          <div style={{
            padding: '3px 8px', borderRadius: 999,
            background: copied ? 'oklch(0.65 0.18 145)' : 'var(--tg-accent)',
            color: '#fff',
            fontFamily: '-apple-system, system-ui',
            fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
            transition: 'background 200ms',
          }}>{copied ? 'Copied' : 'Copy'}</div>
        </PressCard>
        {/* mock QR — just a coarse grid pattern */}
        <div style={{
          width: 54, height: 54, padding: 4, borderRadius: 10,
          background: '#fff',
          border: '0.5px solid var(--tg-card-border)',
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(8, 1fr)',
          gap: 1,
        }}>
          {Array.from({ length: 64 }, (_, i) => (
            <div key={i} style={{
              background: ((i * 37 + 11) % 7 < 3) ? '#0c0d10' : 'transparent',
            }}/>
          ))}
        </div>
      </div>
    </BusinessFeatureCard>
  );
}

// ─── 7. Connected bots (list with toggle states) ─────────────────────────
function ConnectedBotsCard() {
  const tap = useHaptic();
  const [bots, setBots] = React.useState([
    { id: 'autoreply', name: 'AutoReply', desc: 'Replies to 11 trigger keywords', on: true },
    { id: 'invoice',   name: 'Invoice Bot', desc: 'Sends Stars invoices on /buy', on: true },
    { id: 'crm',       name: 'NotionCRM', desc: 'Logs every new lead', on: false },
  ]);
  const toggle = (id, e) => {
    tap('selection', e);
    setBots((all) => all.map((b) => b.id === id ? { ...b, on: !b.on } : b));
  };
  return (
    <BusinessFeatureCard title="Connected bots"
      subtitle={`${bots.filter(b=>b.on).length} active · ${bots.length} total`} connected accent={260}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {bots.map((b) => (
          <div key={b.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 10,
            background: 'var(--tg-secondary-bg)',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: b.on
                ? 'linear-gradient(135deg, oklch(0.78 0.16 260), oklch(0.55 0.2 285))'
                : 'var(--tg-section-bg)',
              display: 'grid', placeItems: 'center',
              fontFamily: '-apple-system, system-ui',
              fontSize: 13, fontWeight: 700,
              color: b.on ? '#fff' : 'var(--tg-hint)',
            }}>{b.name.slice(0,1)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: '-apple-system, system-ui',
                fontSize: 13, fontWeight: 600, color: 'var(--tg-text)',
              }}>{b.name}</div>
              <div style={{
                fontFamily: '-apple-system, system-ui',
                fontSize: 11, color: 'var(--tg-subtitle-text)', marginTop: 1,
              }}>{b.desc}</div>
            </div>
            <button onClick={(e) => toggle(b.id, e)}
              style={{
                width: 40, height: 24, borderRadius: 999,
                border: 0, padding: 0,
                background: b.on ? 'oklch(0.65 0.18 145)' : 'var(--tg-section-separator)',
                position: 'relative', cursor: 'pointer',
                transition: 'background 200ms',
              }}>
              <span style={{
                position: 'absolute', top: 2, left: b.on ? 18 : 2,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'left 200ms cubic-bezier(.2,.7,.3,1)',
              }}/>
            </button>
          </div>
        ))}
      </div>
    </BusinessFeatureCard>
  );
}

// ─── Composite demo screen — all 7 cards stacked ─────────────────────────
function BusinessProfileDemo() {
  return (
    <div style={{ padding: '4px 16px 16px', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Seven surfaces every Business account exposes. Each card pulls live
         state from Telegram's Business API; the green pip means this bot is
         actually connected to that surface.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <HoursCard/>
        <LocationCard/>
        <QuickRepliesCard/>
        <GreetingAwayCard/>
        <IntroCard/>
        <ChatLinkCard/>
        <ConnectedBotsCard/>
      </div>
    </div>
  );
}

Object.assign(window, {
  BusinessFeatureCard, BusinessProfileDemo,
  HoursCard, LocationCard, QuickRepliesCard, GreetingAwayCard,
  IntroCard, ChatLinkCard, ConnectedBotsCard,
});
