// gallery.jsx — Feature Gallery (home).
// Header greeting + progress chip + chip scroller + 12 category sections.

function Gallery({ userName, progress, isPremium, onOpen, onScroll }) {
  const [activeChip, setActiveChip] = React.useState('all');
  const tap = useHaptic();
  const sectionRefs = React.useRef({});
  const scrollerRef = React.useRef(null);

  const chips = [{ id: 'all', title: 'All' }, ...CATEGORIES.map((c) => ({ id: c.id, title: c.title.split(' ')[0] }))];

  const onChipPress = (id, e) => {
    tap('selection', e);
    setActiveChip(id);
    if (id === 'all') {
      scrollerRef.current && scrollerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const node = sectionRefs.current[id];
      const parent = scrollerRef.current;
      if (node && parent) {
        parent.scrollTo({ top: node.offsetTop - 110, behavior: 'smooth' });
      }
    }
  };

  return (
    <MiniAppSurface padTop={98} padBottom={32}
    onScroll={(e) => onScroll && onScroll(e.target.scrollTop)}>
      <div ref={scrollerRef} style={{ display: 'contents' }} />
      {/* Greeting + progress */}
      <div style={{ padding: '0 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 13, letterSpacing: 0.3,
            color: 'var(--tg-hint)', fontWeight: 500
          }}>Hi, {userName}.</div>
          <LaunchModeBadge
            modeId={DEFAULT_LAUNCH_MODE}
            onPress={() => {
              const card = CATEGORIES.flatMap((c) => c.cards).find((c) => c.demoId === 'launch');
              if (card) onOpen(card);
            }} />
        </div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 24, fontWeight: 700, letterSpacing: -0.4,
          color: 'var(--tg-text)', lineHeight: 1.15,
          marginTop: 2
        }}>Ready to see what Telegram can do?</div>

        <ProgressChip progress={progress} total={TOTAL_DEMOS} />
      </div>

      {/* Category chip scroller */}
      <div style={{ position: 'sticky', top: 0, zIndex: 5,
        paddingTop: 4, paddingBottom: 10,
        background: 'linear-gradient(to bottom, var(--tg-bg) 70%, transparent)', opacity: "0.9" }}>
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', overflowY: 'hidden',
          padding: '4px 14px 6px',
          scrollbarWidth: 'none', opacity: "1"
        }}>
          {chips.map((c) => {
            const on = activeChip === c.id;
            return (
              <button key={c.id}
              onClick={(e) => onChipPress(c.id, e)}
              style={{
                flexShrink: 0,
                padding: '7px 13px', borderRadius: 999,
                border: 0,
                background: on ? 'var(--tg-button)' : 'var(--tg-secondary-bg)',
                color: on ? 'var(--tg-button-text)' : 'var(--tg-text)',
                fontFamily: '-apple-system, system-ui',
                fontSize: 14, fontWeight: 600, letterSpacing: -0.1,
                cursor: 'pointer',
                transition: 'background 180ms, color 180ms'
              }}>{c.title}</button>);

          })}
        </div>
      </div>

      {/* Category sections */}
      <div className="tg-gallery-scroller" style={{ display: 'flex', flexDirection: 'column', gap: 26, paddingBottom: 24 }}>
        {CATEGORIES.map((cat) =>
        <section key={cat.id} ref={(n) => sectionRefs.current[cat.id] = n}
        style={{ padding: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <CatIcon hue={cat.hue} glyph={cat.glyph} size={28} stroke={cat.stroke} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={{
                  fontFamily: '-apple-system, system-ui',
                  fontSize: 17, fontWeight: 700, letterSpacing: -0.2,
                  color: 'var(--tg-text)'
                }}>{cat.title}</div>
                  {cat.showCount && cat.showCount > 3 &&
                <span style={{
                  padding: '1px 7px', borderRadius: 999,
                  background: `color-mix(in oklch, oklch(0.6 0.18 ${cat.hue}) 14%, transparent)`,
                  color: `oklch(0.42 0.18 ${cat.hue})`,
                  fontFamily: '-apple-system, system-ui',
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.3
                }}>{cat.showCount} demos</span>
                }
                </div>
                <div style={{
                fontFamily: '-apple-system, system-ui',
                fontSize: 12, color: 'var(--tg-subtitle-text)',
                marginTop: 1
              }}>{cat.subtitle}</div>
              </div>
            </div>

            <CardGrid cards={cat.cards} hue={cat.hue} category={cat} isPremium={isPremium} onOpen={onOpen} />
          </section>
        )}

        <div style={{
          padding: '20px 16px 6px',
          fontFamily: '-apple-system, system-ui',
          fontSize: 12, color: 'var(--tg-hint)', textAlign: 'center'
        }}>
          {TOTAL_DEMOS} demos · feel them, share them, ship them.
        </div>
      </div>

      <ScrollerBinder elRef={scrollerRef} />
    </MiniAppSurface>);

}

// Bind the parent scroll container to scrollerRef. The MiniAppSurface itself
// is the scroller, but it's a sibling/ancestor in markup — bind via closest().
function ScrollerBinder({ elRef }) {
  const probeRef = React.useRef(null);
  React.useEffect(() => {
    if (!probeRef.current) return;
    let n = probeRef.current.parentElement;
    while (n) {
      const cs = getComputedStyle(n);
      if (cs.overflowY === 'auto' || cs.overflowY === 'scroll') {
        elRef.current = n;return;
      }
      n = n.parentElement;
    }
  }, [elRef]);
  return <div ref={probeRef} style={{ height: 0 }} />;
}

function ProgressChip({ progress, total }) {
  const pct = Math.round(progress / total * 100);
  return (
    <div style={{
      marginTop: 14,
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '8px 12px 8px 10px',
      borderRadius: 999,
      background: 'var(--tg-secondary-bg)',
      border: '0.5px solid var(--tg-section-separator)'
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 16, position: 'relative',
        background: `conic-gradient(var(--tg-accent) ${pct * 3.6}deg, color-mix(in oklch, var(--tg-accent) 18%, transparent) 0)`
      }}>
        <div style={{
          position: 'absolute', inset: 4, borderRadius: 12,
          background: 'var(--tg-secondary-bg)',
          display: 'grid', placeItems: 'center',
          fontFamily: '-apple-system, system-ui',
          fontSize: 10, fontWeight: 700, color: 'var(--tg-accent)'
        }}>{progress}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, fontWeight: 600, color: 'var(--tg-text)', lineHeight: 1.2
        }}>{progress} of {total} explored</span>
        <span style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 11, color: 'var(--tg-subtitle-text)'
        }}>Keep going — the good stuff is ahead.</span>
      </div>
    </div>);

}

// CardGrid — cards laid out as 2-up grid. Hero cards span both columns.
// "More" tiles (isMore:true) render as a soft summary card with a count.
function CardGrid({ cards, hue, category, isPremium, onOpen }) {
  return (
    <div className="tg-card-grid">
      {cards.map((c) => {
        if (c.isMore) {
          return <MoreTile key={c.id || 'more-' + c.count} count={c.count}
          subtitle={c.subtitle} hue={hue} />;
        }
        if (c.hero) {
          return <HeroCard key={c.id} card={c} hue={hue} onOpen={onOpen}
          category={category}
          style={{ gridColumn: '1 / -1' }} />;
        }
        return (
          <FeatureCard key={c.id} card={c} hue={hue} isPremium={isPremium} onOpen={onOpen} />);

      })}
    </div>);

}

function MoreTile({ count, subtitle, hue }) {
  return (
    <div style={{
      gridColumn: '1 / -1',
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderRadius: 14,
      background: `color-mix(in oklch, oklch(0.6 0.18 ${hue}) 6%, var(--tg-secondary-bg))`,
      border: '0.5px dashed color-mix(in oklch, oklch(0.5 0.18 ' + hue + ') 30%, transparent)'
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: `linear-gradient(135deg, oklch(0.78 0.16 ${hue}), oklch(0.56 0.18 ${hue + 18}))`,
        color: '#fff', display: 'grid', placeItems: 'center',
        fontFamily: '-apple-system, system-ui',
        fontSize: 11, fontWeight: 800, letterSpacing: 0.4
      }}>+{count}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, fontWeight: 600, color: 'var(--tg-text)'
        }}>{count} more demos</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 11, color: 'var(--tg-subtitle-text)',
          marginTop: 1, lineHeight: 1.35
        }}>{subtitle}</div>
      </div>
    </div>);

}

// ─── FeatureCard ─────────────────────────────────────────────────────────
function FeatureCard({ card, hue, isPremium, onOpen }) {
  const dim = card.state === 'opened' && !card.demoId || card.fallback && card.fallback === 'Desktop' && false;
  const lockedForPremium = card.premium && !isPremium;
  return (
    <PressCard
      haptic="selection"
      onPress={() => onOpen(card)}
      style={{
        position: 'relative',
        padding: 12,
        borderRadius: 16,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
        opacity: dim ? 0.72 : 1,
        minHeight: 116,
        display: 'flex', flexDirection: 'column', gap: 10,
        transition: 'transform 140ms cubic-bezier(.3,.7,.4,1), box-shadow 140ms'
      }}
      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <CatIcon hue={hue} glyph={card.glyph} size={32} stroke={card.stroke} />
        <CardBadge card={card} lockedForPremium={lockedForPremium} />
      </div>
      <div style={{ marginTop: 'auto' }}>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 14, fontWeight: 600, letterSpacing: -0.1,
          color: 'var(--tg-text)'
        }}>{card.title}</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 12, color: 'var(--tg-subtitle-text)',
          marginTop: 2, lineHeight: 1.3
        }}>{card.subtitle}</div>
      </div>
      {lockedForPremium && <PremiumOverlay />}
    </PressCard>);

}

function CardBadge({ card, lockedForPremium }) {
  if (lockedForPremium) {
    return <Pill bg="oklch(0.92 0.08 80)" fg="oklch(0.42 0.12 70)" icon={<Glyph name="premium" size={10} />}>Premium</Pill>;
  }
  if (card.fallback) {
    return <Pill bg="rgba(0,0,0,0.05)" fg="var(--tg-hint)">No {card.fallback}</Pill>;
  }
  if (card.state === 'completed') {
    return <Pill bg="oklch(0.93 0.07 145)" fg="oklch(0.42 0.13 145)" icon={<CheckGlyph />}>Done</Pill>;
  }
  if (card.state === 'new') {
    return <div style={{
      width: 8, height: 8, borderRadius: 4,
      background: 'var(--tg-accent)',
      boxShadow: '0 0 0 3px color-mix(in oklch, var(--tg-accent) 22%, transparent)'
    }} />;
  }
  return null;
}

function Pill({ bg, fg, icon, children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '2px 7px 2px 5px',
      background: bg, color: fg,
      borderRadius: 999,
      fontFamily: '-apple-system, system-ui',
      fontSize: 10, fontWeight: 700, letterSpacing: 0.1
    }}>{icon}{children}</span>);

}

const CheckGlyph = () =>
<svg width="9" height="9" viewBox="0 0 14 14"><path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>;


function PremiumOverlay() {
  return null; // handled by badge + tap behavior in App
}

// ─── HeroCard ────────────────────────────────────────────────────────────
// Used for showpiece cards — bigger, bolder, with a visual hook.
function HeroCard({ card, hue, onOpen, category, style = {} }) {
  const isGift = card.id === 'collectible';
  return (
    <PressCard
      haptic="soft"
      onPress={() => onOpen(card)}
      style={{
        position: 'relative',
        padding: 16,
        borderRadius: 22,
        background: isGift ?
        `linear-gradient(135deg, ${GIFT_PRESETS.cosmic.center}, ${GIFT_PRESETS.cosmic.edge})` :
        `linear-gradient(135deg, oklch(0.32 0.16 ${hue}), oklch(0.18 0.12 ${hue + 20}))`,
        color: '#fff',
        overflow: 'hidden',
        minHeight: 150,
        boxShadow: `0 14px 30px oklch(0.4 0.18 ${hue} / 0.32), inset 0 1px 0 rgba(255,255,255,0.18)`,
        transition: 'transform 160ms cubic-bezier(.3,.7,.4,1)',
        ...style
      }}
      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.985)'}
      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
      
      <HeroDecoration kind={card.id} hue={hue} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '3px 9px', borderRadius: 999,
            background: 'rgba(255,255,255,0.16)',
            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            fontFamily: '-apple-system, system-ui', fontSize: 11, fontWeight: 700,
            letterSpacing: 0.4, textTransform: 'uppercase'
          }}>{isGift ? 'New · v2' : 'Showpiece'}</span>
        </div>
        <div style={{ marginTop: 'auto', maxWidth: isGift ? '58%' : 'unset' }}>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 22, fontWeight: 700, letterSpacing: -0.4,
            textShadow: '0 1px 0 rgba(0,0,0,0.12)'
          }}>{card.title}</div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 13, color: 'rgba(255,255,255,0.78)',
            marginTop: 2
          }}>{card.subtitle}</div>
        </div>
        <div style={{
          position: 'absolute', right: 0, bottom: 0,
          width: 32, height: 32, borderRadius: 16,
          background: 'rgba(255,255,255,0.22)',
          display: 'grid', placeItems: 'center',
          backdropFilter: 'blur(8px)'
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8m0 0L8 4m3 3l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </PressCard>);

}

function HeroDecoration({ kind, hue }) {
  // Inline visual hook for each hero — purely decorative; full demos live in demos.jsx.
  if (kind === 'haptic-lab') {
    return (
      <div style={{ position: 'absolute', right: -8, top: -8, bottom: -8,
        width: 150, display: 'grid', gridTemplateColumns: 'repeat(3, 38px)',
        gridAutoRows: 38, gap: 6, transform: 'rotate(-8deg)' }}>
        {Array.from({ length: 9 }, (_, i) =>
        <div key={i} style={{
          borderRadius: 9,
          background: `oklch(${0.7 + i % 3 * 0.05} 0.16 ${hue + i * 18} / ${0.5 + i % 3 * 0.1})`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.18)'
        }} />
        )}
      </div>);

  }
  return null;
}

Object.assign(window, { Gallery });