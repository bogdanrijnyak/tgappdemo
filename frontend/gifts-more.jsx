// gifts-more.jsx — the eleven remaining Gifts & Stars sub-flows from
// addendum §3.2 + §3.3. Each demo is one focused screen with one wow-moment;
// the gallery has many entries and we keep each card sharp instead of bloated.

// ─── 1. Get a regular gift — entry picker ───────────────────────────────
function GetRegularGiftDemo() {
  const tap = useHaptic();
  const [picked, setPicked] = React.useState(null);
  const gifts = [
    { id: 'rose',  emoji: '🌹', name: 'Rose',         price: 15,   hue: 25 },
    { id: 'cake',  emoji: '🎂', name: 'Birthday cake', price: 50,  hue: 305 },
    { id: 'rocket', emoji: '🚀', name: 'Rocket',       price: 100, hue: 215 },
    { id: 'star',  emoji: '⭐', name: 'Star',          price: 200, hue: 55 },
    { id: 'gem',   emoji: '💎', name: 'Diamond',       price: 500, hue: 175 },
    { id: 'crown', emoji: '👑', name: 'Crown',         price: 1500, hue: 80 },
  ];
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Pick a gift. The catalog is curated by Telegram — every gift can
         later be upgraded into a Collectible for a few extra Stars.</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {gifts.map((g) => {
          const on = picked === g.id;
          return (
            <PressCard key={g.id} haptic="soft"
              onPress={(e) => { tap('success', e); setPicked(g.id); }}
              style={{
                padding: 12, borderRadius: 14,
                background: on
                  ? `linear-gradient(160deg, oklch(0.78 0.14 ${g.hue}), oklch(0.5 0.18 ${g.hue + 22}))`
                  : 'var(--tg-section-bg)',
                color: on ? '#fff' : 'var(--tg-text)',
                border: '0.5px solid ' + (on ? 'transparent' : 'var(--tg-card-border)'),
                boxShadow: on
                  ? `0 8px 22px oklch(0.55 0.18 ${g.hue} / 0.32)`
                  : 'var(--tg-card-shadow)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                transition: 'all 220ms',
              }}>
              <div style={{ fontSize: 32, lineHeight: 1,
                filter: on ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none' }}>{g.emoji}</div>
              <div style={{
                fontFamily: '-apple-system, system-ui',
                fontSize: 11, fontWeight: 600, marginTop: 2,
              }}>{g.name}</div>
              <div style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 10, opacity: 0.85,
                display: 'inline-flex', alignItems: 'center', gap: 2,
              }}>⭐ {g.price}</div>
            </PressCard>
          );
        })}
      </div>

      <MainButton label={picked ? `Send ${gifts.find((g) => g.id === picked).name}` : 'Pick a gift'}
                  disabled={!picked} haptic="medium" onClick={() => tap('success')}/>
    </div>
  );
}

// ─── 2. Withdraw a Collectible to TON ───────────────────────────────────
function WithdrawTonDemo() {
  const tap = useHaptic();
  const [stage, setStage] = React.useState('idle');
  const addr = 'UQAyTQRZ_Lk2nW3D-Nq8XfDg_g8VzPRf4hMjqr1tQq4j6F7t';
  const start = (e) => {
    tap('soft', e); setStage('signing');
    setTimeout(() => { setStage('done'); tap('success'); }, 1400);
  };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>A Collectible lives in Telegram's ledger but can be withdrawn to the
         TON blockchain — once on-chain it's a freely tradable NFT.</div>

      <div style={{
        padding: 16, borderRadius: 18,
        background: 'linear-gradient(160deg, oklch(0.94 0.04 215), oklch(0.86 0.05 235))',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0098EA, #0855a8)',
            color: '#fff', display: 'grid', placeItems: 'center',
            fontFamily: '-apple-system, system-ui',
            fontSize: 14, fontWeight: 700,
          }}>T</div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 13, fontWeight: 700, color: '#0a3a72',
            }}>TON wallet</div>
            <div style={{
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 9, color: 'rgba(10,58,114,0.7)',
              wordBreak: 'break-all', lineHeight: 1.3, marginTop: 2,
            }}>{addr}</div>
          </div>
        </div>
        {/* mock QR */}
        <div style={{
          margin: '0 auto', width: 130, height: 130, padding: 6, borderRadius: 12,
          background: '#fff', border: '0.5px solid rgba(10,58,114,0.2)',
          display: 'grid', gridTemplateColumns: 'repeat(17, 1fr)', gridTemplateRows: 'repeat(17, 1fr)', gap: 1,
        }}>
          {Array.from({ length: 289 }, (_, i) => (
            <div key={i} style={{
              background: ((i * 23 + 17) % 11 < 5) ? '#0a3a72' : 'transparent',
            }}/>
          ))}
        </div>
        <div style={{
          marginTop: 12, padding: '8px 10px', borderRadius: 10,
          background: 'rgba(0,152,234,0.12)', color: '#0a3a72',
          fontFamily: '-apple-system, system-ui',
          fontSize: 11, lineHeight: 1.4, textAlign: 'center',
        }}>~1.2 TON gas · settlement ≈ 18 s</div>
      </div>

      {stage === 'done' && (
        <div style={{
          marginTop: 14, padding: 12, borderRadius: 12,
          background: 'color-mix(in oklch, oklch(0.7 0.18 145) 14%, transparent)',
          border: '0.5px solid color-mix(in oklch, oklch(0.6 0.18 145) 38%, transparent)',
          color: 'oklch(0.4 0.16 145)',
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, fontWeight: 600, textAlign: 'center',
          animation: 'tg-pop 320ms cubic-bezier(.2,1.6,.3,1)',
        }}>✓ Collectible withdrawn · tx 0x9af…b2c1</div>
      )}

      <MainButton label={stage === 'signing' ? 'Signing transaction…' : stage === 'done' ? 'Withdrawn' : 'Withdraw to TON'}
                  loading={stage === 'signing'} disabled={stage === 'done'}
                  haptic="medium" onClick={start}/>
    </div>
  );
}

// ─── 3. Set Collectible as Emoji Status ─────────────────────────────────
function EmojiStatusFromGiftDemo() {
  const tap = useHaptic();
  const [active, setActive] = React.useState(false);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>A Collectible's symbol can stand in as your profile's emoji status —
         the tiny glyph next to your name in every chat and contact list.</div>

      <div style={{
        padding: 18, borderRadius: 18,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, oklch(0.74 0.16 215), oklch(0.45 0.2 240))',
          color: '#fff', display: 'grid', placeItems: 'center',
          fontFamily: '-apple-system, system-ui',
          fontSize: 26, fontWeight: 700,
        }}>A</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 6,
            fontFamily: '-apple-system, system-ui',
            fontSize: 17, fontWeight: 700, color: 'var(--tg-text)',
          }}>Alex Carter {active && (
            <span style={{
              display: 'inline-block', width: 22, height: 22, borderRadius: 6,
              background: `radial-gradient(circle at 50% 40%, ${GIFT_PRESETS.bloom.center}, ${GIFT_PRESETS.bloom.edge})`,
              color: '#fff', textAlign: 'center', lineHeight: '22px',
              fontSize: 13, fontWeight: 700,
              animation: 'tg-pop 320ms cubic-bezier(.2,1.6,.3,1)',
              boxShadow: '0 4px 10px rgba(120,30,90,0.32)',
            }}>{GIFT_PRESETS.bloom.symbol}</span>
          )}</div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 12, color: 'var(--tg-subtitle-text)', marginTop: 2,
          }}>{active ? `Status: Velvet Bloom · expires in 1h` : 'No emoji status'}</div>
        </div>
      </div>

      <MainButton label={active ? 'Clear status' : 'Set Velvet Bloom as status'}
                  haptic={active ? 'warning' : 'success'}
                  variant={active ? 'destructive' : 'primary'}
                  onClick={(e) => { tap(active ? 'warning' : 'success', e); setActive(!active); }}/>
    </div>
  );
}

// ─── 4. Set Collectible as Chat Theme ───────────────────────────────────
function ChatThemeFromGiftDemo() {
  const tap = useHaptic();
  const [presetId, setPresetId] = React.useState('cosmic');
  const p = GIFT_PRESETS[presetId];
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 12,
      }}>Apply a Collectible's palette as the chat background. The accent
         flips, message bubbles re-tint, and the input bar picks up the edge color.</div>

      {/* preset picker */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {Object.values(GIFT_PRESETS).map((preset) => {
          const on = presetId === preset.id;
          return (
            <PressCard key={preset.id} haptic="selection"
              onPress={(e) => { tap('selection', e); setPresetId(preset.id); }}
              style={{
                flex: 1, height: 46, borderRadius: 11,
                background: `radial-gradient(circle at 50% 40%, ${preset.center}, ${preset.edge})`,
                color: '#fff', display: 'grid', placeItems: 'center',
                boxShadow: on ? '0 0 0 2px var(--tg-accent), 0 6px 14px rgba(0,0,0,0.25)' : '0 2px 6px rgba(0,0,0,0.18)',
                transition: 'box-shadow 200ms',
                fontFamily: '-apple-system, system-ui',
                fontSize: 11, fontWeight: 700,
              }}>{preset.name.split(' ')[0]}</PressCard>
          );
        })}
      </div>

      {/* chat mock with theme applied */}
      <div style={{
        borderRadius: 16, overflow: 'hidden',
        background: `radial-gradient(circle at 50% 30%, ${p.center}, ${p.edge})`,
        padding: 12, color: '#fff',
        boxShadow: '0 14px 30px rgba(0,0,0,0.25)',
        transition: 'background 400ms',
      }}>
        <Bubble2 mine={false} text="Did you see what I just got??"/>
        <Bubble2 mine text={`Yeah — ${p.name}, edition #${p.num}. Bonkers.`}/>
        <Bubble2 mine={false} text="Right? The theme even matches it now."/>
        <div style={{
          marginTop: 10, height: 36, borderRadius: 18,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', padding: '0 12px',
          fontFamily: '-apple-system, system-ui',
          fontSize: 12, color: 'rgba(255,255,255,0.7)',
        }}>Message…</div>
      </div>
    </div>
  );
}

function Bubble2({ mine, text }) {
  return (
    <div style={{
      display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start',
      marginBottom: 6,
    }}>
      <div style={{
        maxWidth: '74%', padding: '7px 11px',
        borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: mine ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.32)',
        color: mine ? 'var(--tg-text)' : '#fff',
        fontFamily: '-apple-system, system-ui',
        fontSize: 12, lineHeight: 1.4,
        backdropFilter: 'blur(6px)',
      }}>{text}</div>
    </div>
  );
}

// ─── 5. Gift Collections — drag-and-drop grouping ───────────────────────
function GiftCollectionsDemo() {
  const tap = useHaptic();
  const [collections, setCollections] = React.useState([
    { id: 'gen', name: 'Ungrouped', gifts: ['cosmic-1', 'cosmic-2', 'ember-1', 'bloom-1', 'bloom-2'] },
    { id: 'fav', name: 'Favorites', gifts: ['ember-2'] },
    { id: 'gift-from-noa', name: 'From Noa', gifts: [] },
  ]);
  const [dragging, setDragging] = React.useState(null);
  const giftMeta = {
    'cosmic-1': { p: 'cosmic', n: '0234' },
    'cosmic-2': { p: 'cosmic', n: '4108' },
    'ember-1':  { p: 'ember',  n: '0012' },
    'ember-2':  { p: 'ember',  n: '0901' },
    'bloom-1':  { p: 'bloom',  n: '1892' },
    'bloom-2':  { p: 'bloom',  n: '0903' },
  };
  const move = (giftId, toCollectionId, e) => {
    tap('soft', e);
    setCollections((cs) => cs.map((c) => ({
      ...c, gifts: c.id === toCollectionId
        ? [...c.gifts.filter((g) => g !== giftId), giftId]
        : c.gifts.filter((g) => g !== giftId),
    })));
    setDragging(null);
  };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Group your Collectibles into named buckets — tap a gift to lift it,
         then tap a collection to drop it in. Pure UI; the server stores the
         mapping as a flat list of strings.</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {collections.map((c) => (
          <div key={c.id} style={{
            padding: 12, borderRadius: 14,
            background: 'var(--tg-section-bg)',
            border: dragging
              ? '1px dashed var(--tg-accent)'
              : '0.5px solid var(--tg-card-border)',
            boxShadow: 'var(--tg-card-shadow)',
            transition: 'border 180ms',
            cursor: dragging ? 'pointer' : 'default',
          }} onClick={dragging ? (e) => move(dragging, c.id, e) : undefined}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{
                fontFamily: '-apple-system, system-ui',
                fontSize: 13, fontWeight: 700,
              }}>{c.name}</div>
              <div style={{
                fontFamily: '-apple-system, system-ui',
                fontSize: 11, color: 'var(--tg-subtitle-text)',
              }}>{c.gifts.length} {c.gifts.length === 1 ? 'item' : 'items'}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 50 }}>
              {c.gifts.length === 0 && (
                <div style={{
                  fontFamily: '-apple-system, system-ui',
                  fontSize: 11, color: 'var(--tg-hint)', fontStyle: 'italic',
                  padding: '12px 4px',
                }}>Drop gifts here</div>
              )}
              {c.gifts.map((gid) => {
                const meta = giftMeta[gid];
                const p = GIFT_PRESETS[meta.p];
                const isDragging = dragging === gid;
                return (
                  <PressCard key={gid} haptic="selection"
                    onPress={(e) => { e.stopPropagation && e.stopPropagation(); tap('selection', e); setDragging(isDragging ? null : gid); }}
                    style={{
                      width: 50, height: 50, borderRadius: 11,
                      background: `radial-gradient(circle at 50% 40%, ${p.center}, ${p.edge})`,
                      color: '#fff', display: 'grid', placeItems: 'center',
                      fontSize: 18, position: 'relative',
                      transform: isDragging ? 'scale(1.08)' : 'scale(1)',
                      boxShadow: isDragging
                        ? '0 0 0 2px var(--tg-accent), 0 6px 14px rgba(0,0,0,0.25)'
                        : '0 2px 6px rgba(0,0,0,0.2)',
                      transition: 'all 200ms cubic-bezier(.2,1.6,.3,1)',
                    }}>{p.symbol}</PressCard>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 6. Pin Gifts to top ────────────────────────────────────────────────
function PinGiftsDemo() {
  const tap = useHaptic();
  const [pinned, setPinned] = React.useState(['ember']);
  const gifts = [
    { id: 'cosmic', preset: 'cosmic' },
    { id: 'ember',  preset: 'ember' },
    { id: 'bloom',  preset: 'bloom' },
  ];
  const togglePin = (id, e) => {
    tap('success', e);
    setPinned((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };
  // pinned first
  const sorted = [...gifts].sort((a, b) => {
    const ap = pinned.includes(a.id), bp = pinned.includes(b.id);
    return ap === bp ? 0 : ap ? -1 : 1;
  });
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Hold the gifts you want everyone to see first. Pinned cards fly to
         the top of your profile grid with a tiny pin badge.</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((g) => {
          const p = GIFT_PRESETS[g.preset];
          const isPinned = pinned.includes(g.id);
          return (
            <div key={g.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: 12, borderRadius: 14,
              background: 'var(--tg-section-bg)',
              border: '0.5px solid var(--tg-card-border)',
              boxShadow: 'var(--tg-card-shadow)',
              order: isPinned ? 0 : 1,
              transition: 'order 400ms',
            }}>
              <div style={{
                width: 54, height: 54, borderRadius: 12, flexShrink: 0,
                background: `radial-gradient(circle at 50% 40%, ${p.center}, ${p.edge})`,
                color: '#fff', display: 'grid', placeItems: 'center',
                fontSize: 22, position: 'relative',
              }}>
                {p.symbol}
                {isPinned && (
                  <div style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 22, height: 22, borderRadius: 11,
                    background: 'oklch(0.65 0.18 25)', color: '#fff',
                    display: 'grid', placeItems: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
                    animation: 'tg-pop 360ms cubic-bezier(.2,1.6,.3,1)',
                  }}>
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M9 1 L11 3 L11 6 L13 8 L8 9 L7 14 L6 9 L1 8 L3 6 L3 3 L5 1 z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: '-apple-system, system-ui',
                  fontSize: 14, fontWeight: 700, color: 'var(--tg-text)',
                }}>{p.name}</div>
                <div style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  fontSize: 10, color: 'var(--tg-subtitle-text)', marginTop: 2,
                }}>#{p.num}</div>
              </div>
              <button onClick={(e) => togglePin(g.id, e)}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: 0,
                  background: isPinned ? 'color-mix(in oklch, oklch(0.65 0.18 25) 14%, transparent)' : 'var(--tg-secondary-bg)',
                  color: isPinned ? 'oklch(0.5 0.18 25)' : 'var(--tg-hint)',
                  cursor: 'pointer',
                  display: 'grid', placeItems: 'center',
                  transition: 'all 200ms',
                }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M9 1 L11 3 L11 6 L13 8 L8 9 L7 14 L6 9 L1 8 L3 6 L3 3 L5 1 z"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 7. Channel Gifts — send to a channel ───────────────────────────────
function ChannelGiftsDemo() {
  const tap = useHaptic();
  const [stage, setStage] = React.useState('idle');
  const send = (e) => {
    tap('soft', e); setStage('sending');
    setTimeout(() => { setStage('done'); tap('success'); }, 1200);
  };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Gifts can be sent to a channel as a post. Subscribers see the gift
         card inline with the rest of the feed, with a "Claim" button that
         transfers ownership to whoever taps first.</div>

      {/* channel header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: 12, borderRadius: 14,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        marginBottom: 10,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, oklch(0.78 0.16 305), oklch(0.45 0.2 320))',
          color: '#fff', display: 'grid', placeItems: 'center',
          fontFamily: '-apple-system, system-ui',
          fontSize: 15, fontWeight: 700,
        }}>D</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 14, fontWeight: 700,
          }}>Daily Café · 4 218 subs</div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 11, color: 'var(--tg-subtitle-text)', marginTop: 1,
          }}>Saturday pickups · weekly gifts to subscribers</div>
        </div>
      </div>

      {/* preview of the post once sent */}
      {stage === 'done' ? (
        <div style={{
          padding: 14, borderRadius: 14,
          background: `radial-gradient(circle at 50% 30%, ${GIFT_PRESETS.cosmic.center}, ${GIFT_PRESETS.cosmic.edge})`,
          color: '#fff',
          animation: 'tg-pop 360ms cubic-bezier(.2,1.6,.3,1)',
        }}>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
            opacity: 0.78, fontWeight: 800, marginBottom: 4,
          }}>Subscriber gift</div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 18, fontWeight: 700, letterSpacing: -0.3,
            marginBottom: 12,
          }}>One Cosmic Crystal · first to claim</div>
          <button style={{
            width: '100%', height: 38, borderRadius: 11, border: 0,
            background: 'rgba(255,255,255,0.92)', color: '#23130b',
            fontFamily: '-apple-system, system-ui',
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>Claim it</button>
        </div>
      ) : (
        <div style={{
          padding: 26, borderRadius: 14,
          background: 'var(--tg-secondary-bg)',
          border: '1px dashed var(--tg-section-separator)',
          textAlign: 'center',
          fontFamily: '-apple-system, system-ui',
          fontSize: 12, color: 'var(--tg-subtitle-text)',
        }}>The gift post will appear here.</div>
      )}

      <MainButton label={stage === 'sending' ? 'Posting…' : stage === 'done' ? 'Posted' : 'Send to channel'}
                  loading={stage === 'sending'} disabled={stage === 'done'}
                  haptic="medium" onClick={send}/>
    </div>
  );
}

// ─── 8. Star Rating — activity leaderboard ──────────────────────────────
function StarRatingDemo() {
  const tap = useHaptic();
  const entries = [
    { name: 'noa',     rating: 14820, change: 280, hue: 305 },
    { name: 'You',     rating: 12410, change: 540, hue: 215, you: true },
    { name: 'lina',    rating: 11005, change: -110, hue: 25 },
    { name: 'mark',    rating: 9620, change: 90, hue: 215 },
    { name: 'priya',   rating: 8240, change: 0, hue: 145 },
    { name: 'durov',   rating: 6815, change: 1200, hue: 200 },
  ];
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Every Star you send or receive bumps your rating. The leaderboard
         resets monthly — top 3 get a temporary profile glow.</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {entries.map((e, i) => (
          <div key={e.name} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            background: e.you
              ? 'color-mix(in oklch, var(--tg-accent) 14%, var(--tg-section-bg))'
              : 'var(--tg-section-bg)',
            border: e.you
              ? '0.5px solid color-mix(in oklch, var(--tg-accent) 38%, transparent)'
              : '0.5px solid var(--tg-card-border)',
            boxShadow: 'var(--tg-card-shadow)',
          }}>
            <div style={{
              width: 26, textAlign: 'center',
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 13, fontWeight: 700,
              color: i < 3 ? 'oklch(0.6 0.2 55)' : 'var(--tg-hint)',
            }}>{i + 1}</div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: `linear-gradient(135deg, oklch(0.78 0.16 ${e.hue}), oklch(0.5 0.2 ${e.hue + 24}))`,
              color: '#fff', display: 'grid', placeItems: 'center',
              fontFamily: '-apple-system, system-ui',
              fontSize: 13, fontWeight: 700,
              boxShadow: i < 3 ? '0 0 0 2px oklch(0.7 0.18 55)' : 'none',
            }}>{e.name.slice(0, 1).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: '-apple-system, system-ui',
                fontSize: 13, fontWeight: e.you ? 700 : 600, color: 'var(--tg-text)',
              }}>{e.name}</div>
              <div style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 10, color: 'var(--tg-subtitle-text)', marginTop: 1,
              }}>{e.rating.toLocaleString()} ⭐</div>
            </div>
            <div style={{
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 11, fontWeight: 700,
              color: e.change > 0 ? 'oklch(0.5 0.16 145)' : e.change < 0 ? 'oklch(0.52 0.18 25)' : 'var(--tg-hint)',
            }}>{e.change > 0 ? '+' : ''}{e.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 9. Star Subscriptions + Referrals + Giveaways (3-card row) ─────────
function StarPackDemo() {
  const cards = [
    { id: 'sub', title: 'Subscriptions', value: '3', hint: 'active monthly', hue: 215, icon: '🔄' },
    { id: 'ref', title: 'Referrals', value: '128', hint: 'invited friends',  hue: 145, icon: '👥' },
    { id: 'give', title: 'Giveaways', value: '12', hint: 'won this year',    hue: 305, icon: '🎁' },
  ];
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Three Stars features that show up as small stat cards in the user's
         Stars wallet — same shell, distinct accent.</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {cards.map((c) => (
          <div key={c.id} style={{
            padding: 12, borderRadius: 14,
            background: `linear-gradient(160deg, oklch(0.92 0.06 ${c.hue}), oklch(0.86 0.08 ${c.hue + 18}))`,
            color: `oklch(0.32 0.12 ${c.hue + 10})`,
            display: 'flex', flexDirection: 'column', gap: 4,
            boxShadow: `0 6px 14px oklch(0.65 0.18 ${c.hue} / 0.18)`,
            minHeight: 110,
          }}>
            <div style={{ fontSize: 18 }}>{c.icon}</div>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 22, fontWeight: 800, letterSpacing: -0.4, lineHeight: 1,
              marginTop: 'auto',
            }}>{c.value}</div>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 10, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
              opacity: 0.7,
            }}>{c.title}</div>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 10, opacity: 0.55, lineHeight: 1.3,
            }}>{c.hint}</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 14, padding: 14, borderRadius: 14,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
      }}>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, fontWeight: 700, marginBottom: 6,
        }}>This month</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 12, color: 'var(--tg-subtitle-text)', lineHeight: 1.5,
        }}>You sent <strong style={{ color: 'var(--tg-text)' }}>540 ⭐</strong> across 17 chats,
           collected <strong style={{ color: 'var(--tg-text)' }}>120 ⭐</strong> from
           subscribers, and won a giveaway worth <strong style={{ color: 'var(--tg-text)' }}>500 ⭐</strong>.</div>
      </div>
    </div>
  );
}

// ─── 10. Suggested Posts — channel suggestion with price ────────────────
function SuggestedPostsDemo() {
  const tap = useHaptic();
  const [accepted, setAccepted] = React.useState(false);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Outside contributors can suggest a post to a channel for Stars/TON.
         Admin reviews → accept or reject → on accept the contributor pays
         and the post goes live.</div>

      <div style={{
        padding: 14, borderRadius: 14,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            padding: '2px 7px', borderRadius: 999,
            background: 'color-mix(in oklch, oklch(0.6 0.18 25) 14%, transparent)',
            color: 'oklch(0.45 0.16 25)',
            fontFamily: '-apple-system, system-ui',
            fontSize: 9, fontWeight: 800, letterSpacing: 0.4,
          }}>SUGGESTED</span>
          <span style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 11, color: 'var(--tg-subtitle-text)',
          }}>by @noa · 4h pending</span>
        </div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 14, fontWeight: 600, color: 'var(--tg-text)', lineHeight: 1.4,
        }}>5 espresso recipes you can pull on a basic Gaggia — start with
           the ristretto, end with the affogato. Photos inside.</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginTop: 10,
          padding: '4px 10px', borderRadius: 999,
          background: 'color-mix(in oklch, oklch(0.7 0.18 55) 14%, transparent)',
          color: 'oklch(0.45 0.16 55)',
          fontFamily: '-apple-system, system-ui',
          fontSize: 11, fontWeight: 700,
          width: 'fit-content',
        }}>
          <Glyph name="star" size={12} style={{ color: 'oklch(0.7 0.2 55)' }}/>
          120 ⭐ · or 0.18 TON
        </div>
      </div>

      {accepted ? (
        <div style={{
          padding: 12, borderRadius: 12,
          background: 'color-mix(in oklch, oklch(0.7 0.18 145) 14%, transparent)',
          border: '0.5px solid color-mix(in oklch, oklch(0.6 0.18 145) 38%, transparent)',
          color: 'oklch(0.4 0.16 145)',
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, fontWeight: 600, textAlign: 'center',
          animation: 'tg-pop 320ms cubic-bezier(.2,1.6,.3,1)',
        }}>✓ Accepted — post goes live in 5 min</div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={(e) => { tap('warning', e); }}
            style={{
              flex: 1, height: 44, borderRadius: 12, border: 0,
              background: 'var(--tg-secondary-bg)', color: 'var(--tg-text)',
              fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 14,
              cursor: 'pointer',
            }}>Reject</button>
          <button onClick={(e) => { tap('success', e); setAccepted(true); }}
            style={{
              flex: 1, height: 44, borderRadius: 12, border: 0,
              background: 'var(--tg-button)', color: 'var(--tg-button-text)',
              fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 14,
              cursor: 'pointer',
            }}>Accept for 120 ⭐</button>
        </div>
      )}
    </div>
  );
}

// ─── 11. TON / Stars toggle on a gift price ─────────────────────────────
function TonToggleDemo() {
  const tap = useHaptic();
  const [currency, setCurrency] = React.useState('XTR');
  const giftPrice = { XTR: 1200, TON: 1.8 };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Some flows accept both Stars (<code style={extrasCodeStyle}>XTR</code>) and on-chain
         TON. The user picks at checkout; the gift card flips its price label
         in place.</div>

      {/* gift card with currency-aware price chip */}
      <div style={{
        padding: 18, borderRadius: 18, marginBottom: 14, position: 'relative', overflow: 'hidden',
        background: `radial-gradient(circle at 50% 30%, ${GIFT_PRESETS.bloom.center}, ${GIFT_PRESETS.bloom.edge})`,
        color: '#fff',
        minHeight: 200,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        boxShadow: '0 18px 36px rgba(80,16,72,0.35)',
      }}>
        <div style={{
          position: 'absolute', top: 14, left: 14,
          fontSize: 32, opacity: 0.7,
        }}>{GIFT_PRESETS.bloom.symbol}</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
          opacity: 0.78, fontWeight: 800, marginBottom: 4,
        }}>{GIFT_PRESETS.bloom.name}</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 26, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.1,
        }}>Edition #{GIFT_PRESETS.bloom.num}</div>
        <div style={{
          marginTop: 12, alignSelf: 'flex-start',
          padding: '6px 12px', borderRadius: 999,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(8px)',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: '-apple-system, system-ui',
          fontSize: 15, fontWeight: 700,
          animation: 'tg-fade-in 320ms',
        }} key={currency}>
          {currency === 'XTR' ? (
            <>
              <Glyph name="star" size={14} style={{ color: 'oklch(0.85 0.16 55)' }}/>
              {giftPrice.XTR} ⭐
            </>
          ) : (
            <>
              <span style={{
                width: 14, height: 14, borderRadius: '50%',
                background: '#0098EA', color: '#fff',
                display: 'inline-grid', placeItems: 'center',
                fontFamily: '-apple-system, system-ui',
                fontSize: 9, fontWeight: 800,
              }}>T</span>
              {giftPrice.TON} TON
            </>
          )}
        </div>
      </div>

      {/* currency toggle */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4,
        padding: 4, borderRadius: 12,
        background: 'var(--tg-secondary-bg)',
      }}>
        {['XTR', 'TON'].map((c) => {
          const on = currency === c;
          return (
            <PressCard key={c} haptic="selection"
              onPress={(e) => { tap('selection', e); setCurrency(c); }}
              style={{
                padding: '10px 12px', borderRadius: 9,
                background: on ? 'var(--tg-section-bg)' : 'transparent',
                boxShadow: on ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                textAlign: 'center',
                color: on ? 'var(--tg-text)' : 'var(--tg-subtitle-text)',
                fontFamily: '-apple-system, system-ui',
                fontSize: 13, fontWeight: 600,
              }}>{c === 'XTR' ? 'Stars (XTR)' : 'TON'}</PressCard>
          );
        })}
      </div>

      <div style={{
        marginTop: 12, padding: 10, borderRadius: 10,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: 11, color: 'var(--tg-subtitle-text)',
        textAlign: 'center',
      }}>1 TON ≈ 670 ⭐ · 1 nanoton = 1e-9 TON</div>
    </div>
  );
}

Object.assign(window, {
  GetRegularGiftDemo, WithdrawTonDemo, EmojiStatusFromGiftDemo,
  ChatThemeFromGiftDemo, GiftCollectionsDemo, PinGiftsDemo,
  ChannelGiftsDemo, StarRatingDemo, StarPackDemo,
  SuggestedPostsDemo, TonToggleDemo,
});
