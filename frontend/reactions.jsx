// reactions.jsx — Reactions & Paid Reactions (v2.0 §2.2).
// Two sections in one picker:
//   • Regular emoji reactions — horizontal row, instant feedback
//   • Paid reactions — a Stars counter that increments per tap and shimmers
//     proportionally to the Stars amount.
// Demonstrated against a mock chat message AND a mock story.

const REGULAR_REACTIONS = ['❤️', '👍', '🔥', '😂', '🥰', '👏', '🤯', '🎉', '😍'];

function ReactionPicker({ targetKind = 'message', onClose }) {
  const tap = useHaptic();
  const [picked, setPicked] = React.useState({}); // emoji -> count for THIS user
  const [paid, setPaid] = React.useState(0);
  const [shimmerSeed, setShimmerSeed] = React.useState(0);

  const togglePick = (emoji, e) => {
    tap('selection', e);
    setPicked((p) => {
      const cur = p[emoji] || 0;
      const next = { ...p, [emoji]: cur ? 0 : 1 };
      window.API && window.API.track && window.API.track(cur ? 'reaction_removed' : 'reaction_added', { emoji });
      return next;
    });
  };

  const addStar = (e) => {
    tap(paid < 5 ? 'medium' : 'heavy', e);
    setPaid((n) => Math.min(99, n + 1));
    setShimmerSeed((s) => s + 1);
    window.API && window.API.track && window.API.track('paid_reaction_star_added', { total: paid + 1 });
  };

  return (
    <div style={{
      background: 'var(--tg-section-bg)',
      borderRadius: 18,
      border: '0.5px solid var(--tg-card-border)',
      boxShadow: 'var(--tg-card-shadow)',
      padding: '14px 14px 16px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10,
      }}>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, fontWeight: 700, color: 'var(--tg-text)',
        }}>React to this {targetKind}</div>
        {onClose && (
          <button onClick={onClose} style={{
            width: 22, height: 22, borderRadius: 11,
            border: 0, background: 'var(--tg-secondary-bg)',
            color: 'var(--tg-hint)', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}>
            <svg width="9" height="9" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        )}
      </div>

      {/* Regular row */}
      <div style={{
        display: 'flex', overflowX: 'auto', overflowY: 'hidden',
        gap: 6, padding: '4px 2px 6px',
        scrollbarWidth: 'none',
      }}>
        {REGULAR_REACTIONS.map((emoji) => {
          const on = !!picked[emoji];
          return (
            <button key={emoji} onClick={(e) => togglePick(emoji, e)}
              style={{
                flexShrink: 0,
                width: 38, height: 38, borderRadius: 19,
                border: 0,
                background: on ? 'color-mix(in oklch, var(--tg-accent) 18%, transparent)' : 'transparent',
                cursor: 'pointer', position: 'relative',
                fontSize: 22, lineHeight: 1, padding: 0,
                transform: on ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 180ms cubic-bezier(.2,1.6,.3,1), background 180ms',
              }}>
              {emoji}
            </button>
          );
        })}
      </div>

      {/* Paid section */}
      <div style={{
        marginTop: 10, padding: '12px 12px 14px',
        borderRadius: 14, position: 'relative', overflow: 'hidden',
        background: paid > 0
          ? `linear-gradient(135deg, oklch(${0.86 - Math.min(paid, 20) * 0.008} 0.13 55) 0%, oklch(${0.74 - Math.min(paid, 20) * 0.01} 0.18 35) 100%)`
          : 'var(--tg-secondary-bg)',
        color: paid > 0 ? '#fff' : 'var(--tg-text)',
        transition: 'background 300ms ease',
      }}>
        {/* Shimmer — single diagonal pass each time a star is added. Speed
            scales with the Stars total: more stars = faster shimmer. */}
        {paid > 0 && (
          <PaidShimmer key={shimmerSeed} intensity={Math.min(paid, 20)}/>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 12, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
              opacity: paid > 0 ? 0.85 : 0.55,
            }}>Paid reaction</div>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 17, fontWeight: 700, marginTop: 2,
            }}>
              {paid > 0 ? (
                <>
                  <Glyph name="star" size={16} style={{ verticalAlign: '-2px', marginRight: 4 }}/>
                  Sent <span style={{ fontVariantNumeric: 'tabular-nums' }}>{paid}</span> Star{paid === 1 ? '' : 's'}
                </>
              ) : 'Tap a Star to boost this post'}
            </div>
          </div>
          <PressCard haptic={paid < 5 ? 'medium' : 'heavy'} onPress={addStar}
            style={{
              flexShrink: 0, position: 'relative',
              width: 60, height: 60, borderRadius: 18,
              background: 'rgba(255,255,255,0.22)',
              backdropFilter: 'blur(10px)',
              border: '0.5px solid rgba(255,255,255,0.35)',
              boxShadow: paid > 0
                ? '0 8px 22px oklch(0.7 0.2 55 / 0.6), inset 0 1px 0 rgba(255,255,255,0.4)'
                : 'inset 0 1px 0 rgba(255,255,255,0.25)',
              display: 'grid', placeItems: 'center', cursor: 'pointer',
              transition: 'box-shadow 300ms',
            }}>
            <svg viewBox="0 0 32 32" width={32} height={32}>
              <defs>
                <linearGradient id="star-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff"/>
                  <stop offset="1" stopColor="oklch(0.86 0.14 55)"/>
                </linearGradient>
              </defs>
              <path d="M16 3 L19.6 11.3 L28.5 12.6 L22 19 L23.6 28 L16 23.6 L8.4 28 L10 19 L3.5 12.6 L12.4 11.3 z"
                    fill="url(#star-fill)"
                    stroke="rgba(255,255,255,0.6)" strokeWidth={0.6}/>
            </svg>
          </PressCard>
        </div>
        {/* Top supporters */}
        {paid > 0 && (
          <div style={{ position: 'relative', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar i={0}/>
            <Avatar i={1}/>
            <Avatar i={2}/>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 11, fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
            }}>You and {Math.max(2, paid * 3 - 1)} others sent Stars</div>
          </div>
        )}
      </div>
    </div>
  );
}

function PaidShimmer({ intensity }) {
  // Speed scales 0.6 s (low) → 1.6 s (high). Bigger amount = faster shimmer.
  const dur = Math.max(0.6, 1.6 - intensity * 0.05);
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
      transform: 'translateX(-100%) skewX(-12deg)',
      animation: `tg-shine ${dur}s cubic-bezier(0.4, 0, 0.2, 1) 1`,
      pointerEvents: 'none',
    }}/>
  );
}

function Avatar({ i }) {
  const hues = [25, 200, 145];
  return (
    <div style={{
      width: 20, height: 20, borderRadius: '50%',
      background: `linear-gradient(135deg, oklch(0.8 0.18 ${hues[i]}), oklch(0.55 0.2 ${hues[i] + 24}))`,
      border: '1.5px solid #fff',
      marginLeft: i === 0 ? 0 : -7,
      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
    }}/>
  );
}

// ─── Demo screen — picker against a mock message + a mock story ──────────
function ReactionsDemo() {
  const [target, setTarget] = React.useState('message');
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        display: 'flex', gap: 6, padding: 3,
        background: 'var(--tg-secondary-bg)', borderRadius: 11,
        marginBottom: 14,
      }}>
        {[
          { id: 'message', label: 'On a message' },
          { id: 'story', label: 'On a story' },
        ].map((t) => {
          const on = target === t.id;
          return (
            <PressCard key={t.id} haptic="selection" onPress={() => setTarget(t.id)}
              style={{
                flex: 1, padding: '7px 10px', borderRadius: 9,
                background: on ? 'var(--tg-section-bg)' : 'transparent',
                boxShadow: on ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                textAlign: 'center',
                color: on ? 'var(--tg-text)' : 'var(--tg-subtitle-text)',
                fontFamily: '-apple-system, system-ui',
                fontSize: 12, fontWeight: 600,
              }}>{t.label}</PressCard>
          );
        })}
      </div>

      {target === 'message' ? <MockMessage/> : <MockStory/>}

      <div style={{ height: 14 }}/>
      <ReactionPicker targetKind={target}/>
    </div>
  );
}

function MockMessage() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
      <Avatar i={0}/>
      <div style={{
        maxWidth: '78%', padding: '10px 12px 12px',
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        borderRadius: '16px 16px 16px 4px',
        boxShadow: 'var(--tg-card-shadow)',
      }}>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 12, fontWeight: 700,
          color: 'oklch(0.55 0.18 25)',
          marginBottom: 2,
        }}>Lina</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 14, color: 'var(--tg-text)', lineHeight: 1.4,
        }}>Just shipped the new gallery design. Boost the post if you liked
           where it landed 🙌</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 10, color: 'var(--tg-hint)', textAlign: 'right',
          marginTop: 6,
        }}>11:42</div>
      </div>
    </div>
  );
}

function MockStory() {
  return (
    <div style={{
      height: 170, borderRadius: 16, overflow: 'hidden', position: 'relative',
      background: 'linear-gradient(135deg, oklch(0.6 0.2 305), oklch(0.4 0.22 270))',
    }}>
      {/* progress segments */}
      <div style={{
        position: 'absolute', top: 8, left: 10, right: 10,
        display: 'flex', gap: 4,
      }}>
        {[1,2,3].map((i) => (
          <div key={i} style={{
            flex: 1, height: 2.5, borderRadius: 2,
            background: i === 1 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.32)',
          }}/>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 18, left: 10, display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
        <Avatar i={1}/>
        <div>
          <div style={{ fontFamily: '-apple-system, system-ui', fontSize: 12, fontWeight: 700 }}>noa</div>
          <div style={{ fontFamily: '-apple-system, system-ui', fontSize: 10, opacity: 0.75 }}>4h</div>
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 14, left: 14, right: 14,
        fontFamily: '-apple-system, system-ui',
        fontSize: 17, fontWeight: 700, color: '#fff',
        textShadow: '0 1px 4px rgba(0,0,0,0.4)', lineHeight: 1.25,
      }}>Saturday morning, no agenda.</div>
    </div>
  );
}

Object.assign(window, { ReactionPicker, ReactionsDemo });
