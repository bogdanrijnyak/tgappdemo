// system-share-premium.jsx — final ten stub demos covering the remaining
// System cards (QR / Clipboard / Write access), Share & Stories (4), and the
// last three Premium surfaces (Emoji status / Promo / Double limits).

// ════════════════════════════════════════════════════════════════════════
//  SYSTEM (3)
// ════════════════════════════════════════════════════════════════════════

// ─── 1. QR scanner — native camera scanner with animated reticle ────────
function QRScannerDemo() {
  const tap = useHaptic();
  const [stage, setStage] = React.useState('idle'); // idle | scanning | found
  const [scanned, setScanned] = React.useState(null);
  const scan = (e) => {
    tap('soft', e); setStage('scanning'); setScanned(null);
    setTimeout(() => { setScanned('t.me/durov?startapp=hi'); setStage('found'); tap('success'); }, 1800);
  };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>The host opens its native QR scanner with a custom prompt and returns
         the decoded text. The Mini App can keep the camera open for batch
         scans, or close it on the first hit.</div>

      <div style={{
        height: 260, borderRadius: 18, overflow: 'hidden', position: 'relative',
        background: '#0c1014',
        marginBottom: 14,
      }}>
        {/* camera feed mock */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 50%, oklch(0.18 0.04 250), oklch(0.08 0.02 240))',
        }}>
          <svg width="100%" height="100%" viewBox="0 0 320 260" preserveAspectRatio="none">
            <rect x={80} y={50} width={160} height={160} fill="rgba(255,255,255,0.05)"/>
            <rect x={100} y={90} width={120} height={20} fill="rgba(255,255,255,0.06)"/>
            <rect x={100} y={140} width={80} height={50} fill="rgba(255,255,255,0.04)"/>
          </svg>
        </div>
        {/* reticle corners */}
        {[
          { t: 14, l: 14, br: 0, bb: 0 },
          { t: 14, r: 14, bl: 0, bb: 0 },
          { b: 14, l: 14, br: 0, bt: 0 },
          { b: 14, r: 14, bl: 0, bt: 0 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: c.t, right: c.r, bottom: c.b, left: c.l,
            width: 32, height: 32,
            border: '3px solid #fff',
            borderRight: c.br === 0 ? 'none' : undefined,
            borderLeft: c.bl === 0 ? 'none' : undefined,
            borderTop: c.bt === 0 ? 'none' : undefined,
            borderBottom: c.bb === 0 ? 'none' : undefined,
            borderRadius: 4,
          }}/>
        ))}
        {/* scan line */}
        {stage === 'scanning' && (
          <div style={{
            position: 'absolute', left: 20, right: 20, height: 2,
            background: 'oklch(0.7 0.2 145)', boxShadow: '0 0 10px oklch(0.65 0.2 145)',
            animation: 'tg-scanline 1.4s linear infinite',
          }}/>
        )}
        {stage === 'idle' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: '-apple-system, system-ui',
            fontSize: 13, fontWeight: 600,
          }}>Point at a QR code</div>
        )}
        {stage === 'found' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
            background: 'rgba(8,40,16,0.62)',
            color: '#fff',
            animation: 'tg-fade-in 320ms',
          }}>
            <div style={{ textAlign: 'center' }}>
              <svg width="44" height="44" viewBox="0 0 44 44" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))' }}>
                <circle cx={22} cy={22} r={20} fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth={2}/>
                <path d="M12 22 L20 30 L33 14" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{
                marginTop: 8,
                fontFamily: '-apple-system, system-ui',
                fontSize: 13, fontWeight: 700,
              }}>Decoded</div>
              <div style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11, opacity: 0.85, marginTop: 4,
              }}>{scanned}</div>
            </div>
          </div>
        )}
      </div>

      <MainButton label={stage === 'scanning' ? 'Scanning…' : stage === 'found' ? 'Scan another' : 'Open QR scanner'}
                  loading={stage === 'scanning'} haptic="soft" onClick={scan}/>
    </div>
  );
}

// ─── 2. Clipboard — read with mask reveal ───────────────────────────────
function ClipboardDemo() {
  const tap = useHaptic();
  const [revealed, setRevealed] = React.useState(false);
  const value = 'sk_live_71fA8df9-c0Ac-4f3b-b1c4-e10ffe11d402';
  const masked = value.replace(/[a-zA-Z0-9]/g, (c, i) => i < 8 || i > value.length - 4 ? c : '•');
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>The Mini App reads the clipboard via the host; Telegram shows a system
         prompt the first time. You see what's there before exposing it to the
         page — preview is masked, full value reveals on tap.</div>

      <div style={{
        padding: 14, borderRadius: 14,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
        marginBottom: 10,
      }}>
        <div style={sspPaneHeader}>Clipboard contents</div>
        <div style={{
          marginTop: 6,
          padding: '10px 12px', borderRadius: 10,
          background: 'var(--tg-secondary-bg)',
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 13, wordBreak: 'break-all', lineHeight: 1.5,
        }}>{revealed ? value : masked}</div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px', borderRadius: 12,
        background: 'color-mix(in oklch, oklch(0.7 0.18 50) 14%, transparent)',
        border: '0.5px solid color-mix(in oklch, oklch(0.6 0.18 50) 38%, transparent)',
        color: 'oklch(0.45 0.16 50)',
        fontFamily: '-apple-system, system-ui',
        fontSize: 12, lineHeight: 1.4, marginBottom: 14,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1 L15 14 L1 14 z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round"/>
          <path d="M8 6 V 9 M 8 11 v.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/>
        </svg>
        Looks like an API key. Reveal before pasting somewhere new.
      </div>

      <PressCard haptic="soft" onPress={(e) => { tap('soft', e); setRevealed((r) => !r); }}
        style={{
          padding: '12px', borderRadius: 12,
          background: revealed ? 'var(--tg-destructive-text)' : 'var(--tg-button)',
          color: '#fff',
          textAlign: 'center', width: '100%', display: 'block',
          fontFamily: '-apple-system, system-ui',
          fontSize: 14, fontWeight: 600,
        }}>{revealed ? 'Hide value' : 'Reveal full value'}</PressCard>
    </div>
  );
}

const sspPaneHeader = {
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 10, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
  color: 'var(--tg-subtitle-text)',
};

// ─── 3. Write access — bot can DM you ───────────────────────────────────
function WriteAccessDemo() {
  const tap = useHaptic();
  const [stage, setStage] = React.useState('idle'); // idle | asking | granted | denied
  const ask = (decision) => (e) => {
    tap('soft', e); setStage('asking');
    setTimeout(() => {
      setStage(decision); tap(decision === 'granted' ? 'success' : 'warning');
    }, 700);
  };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Some bots want to DM the user later — order updates, reminders, end-of-day
         summaries. The user grants <code style={sspCode}>write_to_pm</code> once;
         the bot can message any time after.</div>

      <div style={{
        padding: 18, borderRadius: 18,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
        textAlign: 'center', marginBottom: 14,
      }}>
        <div style={{
          width: 64, height: 64, margin: '0 auto', borderRadius: 18,
          background: 'linear-gradient(135deg, oklch(0.74 0.16 35), oklch(0.5 0.2 25))',
          color: '#fff', display: 'grid', placeItems: 'center',
          fontFamily: '-apple-system, system-ui',
          fontSize: 26, fontWeight: 700,
        }}>✉</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 16, fontWeight: 700, marginTop: 12,
        }}>Let @APIShowcaseBot message you?</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, color: 'var(--tg-subtitle-text)',
          marginTop: 6, lineHeight: 1.4, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto',
        }}>They'll only ping you when something new ships in API Showcase.
           You can stop it any time from the bot's chat.</div>

        {stage === 'granted' || stage === 'denied' ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 14,
            padding: '6px 12px', borderRadius: 999,
            background: stage === 'granted'
              ? 'color-mix(in oklch, oklch(0.7 0.18 145) 14%, transparent)'
              : 'color-mix(in oklch, oklch(0.7 0.18 25) 14%, transparent)',
            color: stage === 'granted' ? 'oklch(0.42 0.16 145)' : 'oklch(0.5 0.16 25)',
            fontFamily: '-apple-system, system-ui',
            fontSize: 11, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
            animation: 'tg-pop 320ms cubic-bezier(.2,1.6,.3,1)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}/>
            {stage === 'granted' ? 'Granted' : 'Denied'}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={ask('denied')} style={sspDialogBtn(false)}>Not now</button>
            <button onClick={ask('granted')} style={sspDialogBtn(true)}>Allow</button>
          </div>
        )}
      </div>
    </div>
  );
}

const sspCode = {
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 11, padding: '0 4px', borderRadius: 4,
  background: 'var(--tg-secondary-bg)',
};
const sspDialogBtn = (primary) => ({
  flex: 1, height: 42, borderRadius: 12, border: 0,
  background: primary ? 'var(--tg-button)' : 'var(--tg-secondary-bg)',
  color: primary ? 'var(--tg-button-text)' : 'var(--tg-text)',
  fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 14,
  cursor: 'pointer',
});

// ════════════════════════════════════════════════════════════════════════
//  SHARE & STORIES (4)
// ════════════════════════════════════════════════════════════════════════

// ─── 4. Share to Story — 1080×1920 card preview ─────────────────────────
function ShareToStoryDemo() {
  const tap = useHaptic();
  const [busy, setBusy] = React.useState(false);

  const openStoryComposer = async () => {
    tap('success');
    if (!window.API || !window.API.isReady()) return;
    setBusy(true);
    try {
      const res = await window.API.fetch('/api/share/story', {
        method: 'POST',
        body: JSON.stringify({ template: 'collectible', preset: 'bloom' }),
      });
      // poll for completion (500ms x 12)
      let info = res;
      for (let i = 0; i < 12 && info.status !== 'done'; i++) {
        await new Promise((r) => setTimeout(r, 500));
        info = await window.API.fetch('/api/share/story/' + res.task_id);
      }
      const tg = window.Telegram && window.Telegram.WebApp;
      if (tg && typeof tg.shareToStory === 'function' && info.url) {
        tg.shareToStory(info.url, {
          text: 'Built with the API Showcase ✨',
          widget_link: { url: 'https://t.me/APIShowcaseBot', name: 'Open showcase' },
        });
      } else if (info.url) {
        window.open(info.url, '_blank', 'noopener');
      }
    } catch (e) { console.warn('story', e); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Mini Apps can generate a 1080×1920 image and hand it to the Story
         composer pre-filled. The user adjusts, then posts — your branding
         travels with them.</div>

      {/* 9:16 preview */}
      <div style={{
        margin: '0 auto', width: 180, aspectRatio: '9/16', borderRadius: 22, overflow: 'hidden',
        background: `radial-gradient(circle at 50% 30%, ${GIFT_PRESETS.bloom.center}, ${GIFT_PRESETS.bloom.edge})`,
        color: '#fff', position: 'relative', marginBottom: 14,
        boxShadow: '0 18px 36px rgba(80,16,72,0.4)',
      }}>
        {/* status bar mock */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 12px',
          fontFamily: '-apple-system, system-ui',
          fontSize: 9, fontWeight: 700, opacity: 0.85,
        }}>
          <span>9:41</span><span>•••</span>
        </div>
        {/* content */}
        <div style={{ padding: '60px 18px', textAlign: 'center' }}>
          <div style={{
            fontSize: 64, lineHeight: 1, filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
          }}>{GIFT_PRESETS.bloom.symbol}</div>
          <div style={{
            marginTop: 14,
            fontFamily: '-apple-system, system-ui',
            fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', opacity: 0.85,
          }}>Velvet Bloom</div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 17, fontWeight: 700, marginTop: 4, lineHeight: 1.15,
            textShadow: '0 1px 4px rgba(0,0,0,0.32)',
          }}>I just minted #{GIFT_PRESETS.bloom.num}</div>
        </div>
        {/* sticker bar */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16, right: 16,
          padding: '6px 12px', borderRadius: 999,
          background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
          fontFamily: '-apple-system, system-ui',
          fontSize: 9, fontWeight: 600, textAlign: 'center',
        }}>via @APIShowcaseBot</div>
      </div>

      <MainButton label={busy ? "Rendering…" : "Open Story composer"} haptic="soft" loading={busy} onClick={openStoryComposer}/>
    </div>
  );
}

// ─── 5. Share message — native send-to sheet ────────────────────────────
function ShareMessageDemo() {
  const tap = useHaptic();
  const [open, setOpen] = React.useState(false);
  const [sent, setSent] = React.useState(null);
  const friends = [
    { id: 'lina', name: 'Lina', hue: 25 },
    { id: 'noa',  name: 'Noa',  hue: 305 },
    { id: 'mark', name: 'Mark', hue: 215 },
    { id: 'priya', name: 'Priya', hue: 145 },
    { id: 'group-1', name: 'Design team', hue: 220, group: true },
    { id: 'channel-1', name: 'Daily Café', hue: 305, channel: true },
  ];
  const sendTo = (id, e) => {
    tap('success', e); setSent(id); setOpen(false);
    window.tgLog && window.tgLog('prepared_message_sent', { peer_id: id });
    setTimeout(() => setSent(null), 2000);
  };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>The host opens its own send-to sheet — recent chats first, then
         contacts/groups/channels. The Mini App passes the message body; the user
         picks the recipient.</div>

      <div style={{
        padding: 14, borderRadius: 14,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
        marginBottom: 14,
      }}>
        <div style={sspPaneHeader}>Message to share</div>
        <div style={{
          marginTop: 8,
          fontFamily: '-apple-system, system-ui',
          fontSize: 14, lineHeight: 1.4,
        }}>"Just shipped the v2 of API Showcase — collectibles, paid reactions,
           and a working haptic lab. Open it 👉 <span style={{ color: 'var(--tg-link)' }}>t.me/apishowcasebot</span>"</div>
      </div>

      {sent && (
        <div style={{
          padding: 10, borderRadius: 12, marginBottom: 12,
          background: 'color-mix(in oklch, oklch(0.7 0.18 145) 14%, transparent)',
          border: '0.5px solid color-mix(in oklch, oklch(0.6 0.18 145) 38%, transparent)',
          color: 'oklch(0.4 0.16 145)',
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, fontWeight: 600, textAlign: 'center',
          animation: 'tg-pop 320ms cubic-bezier(.2,1.6,.3,1)',
        }}>✓ Sent to {friends.find((f) => f.id === sent).name}</div>
      )}

      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'absolute', inset: 0, zIndex: 8,
          background: 'rgba(15,17,20,0.45)',
          display: 'flex', alignItems: 'flex-end',
          animation: 'tg-fade-in 220ms',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--tg-section-bg)', color: 'var(--tg-text)',
            width: '100%', borderRadius: '20px 20px 0 0',
            padding: '14px 14px 24px', maxHeight: '70%', overflowY: 'auto',
            animation: 'tg-sheet-up 280ms cubic-bezier(.2,.7,.3,1)',
          }}>
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: 'var(--tg-section-separator)',
              margin: '0 auto 12px',
            }}/>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 17, fontWeight: 700, marginBottom: 12, padding: '0 4px',
            }}>Send to…</div>
            {friends.map((f) => (
              <PressCard key={f.id} haptic="success"
                onPress={(e) => sendTo(f.id, e)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 4px',
                  borderBottom: '0.5px solid var(--tg-section-separator)',
                  width: '100%',
                }}>
                <div style={{
                  width: 38, height: 38, borderRadius: f.channel ? 10 : '50%',
                  background: `linear-gradient(135deg, oklch(0.78 0.16 ${f.hue}), oklch(0.5 0.2 ${f.hue + 24}))`,
                  color: '#fff', display: 'grid', placeItems: 'center',
                  fontFamily: '-apple-system, system-ui',
                  fontSize: 14, fontWeight: 700,
                }}>{f.channel ? '📢' : f.group ? '👥' : f.name[0]}</div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{
                    fontFamily: '-apple-system, system-ui',
                    fontSize: 14, fontWeight: 600,
                  }}>{f.name}</div>
                  <div style={{
                    fontFamily: '-apple-system, system-ui',
                    fontSize: 11, color: 'var(--tg-subtitle-text)', marginTop: 1,
                  }}>{f.channel ? 'channel · 4218 subs' : f.group ? 'group · 22 members' : 'contact'}</div>
                </div>
              </PressCard>
            ))}
          </div>
        </div>
      )}

      <MainButton label="Open send-to sheet" haptic="soft" onClick={(e) => { tap('soft', e); setOpen(true); }}/>
    </div>
  );
}

// ─── 6. Download file — personalized wallpaper ──────────────────────────
function DownloadFileDemo() {
  const tap = useHaptic();
  const [stage, setStage] = React.useState('idle'); // idle | building | done
  const [hue, setHue] = React.useState(215);
  const build = async (e) => {
    tap('soft', e); setStage('building');
    if (window.API && window.API.isReady()) {
      try {
        const res = await window.API.fetch('/api/share/download', {
          method: 'POST',
          body: JSON.stringify({ template: 'wallpaper', preset: 'bloom' }),
        });
        let info = res;
        for (let i = 0; i < 12 && info.status !== 'done'; i++) {
          await new Promise((r) => setTimeout(r, 500));
          info = await window.API.fetch('/api/share/story/' + res.task_id);
        }
        const tg = window.Telegram && window.Telegram.WebApp;
        if (tg && typeof tg.downloadFile === 'function' && info.url) {
          tg.downloadFile({ url: info.url, file_name: 'wallpaper-' + hue + 'deg.png' }, () => {});
        } else if (info.url) {
          const a = document.createElement('a');
          a.href = info.url; a.download = 'wallpaper-' + hue + 'deg.png';
          document.body.appendChild(a); a.click(); a.remove();
        }
      } catch (err) { console.warn('download', err); }
    } else {
      await new Promise((r) => setTimeout(r, 1100));
    }
    setStage('done'); tap('success');
  };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>The Mini App can build a file on the fly and trigger a Telegram
         download. Here: a wallpaper generated from the user's accent color.</div>

      <div style={{
        margin: '0 auto', width: 200, height: 280, borderRadius: 18, overflow: 'hidden',
        marginBottom: 14, position: 'relative',
        background: `linear-gradient(160deg, oklch(0.7 0.16 ${hue}), oklch(0.32 0.2 ${hue + 30}))`,
        boxShadow: '0 14px 32px rgba(0,0,0,0.25)',
        transition: 'background 500ms',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18), transparent 55%), radial-gradient(circle at 80% 90%, oklch(0.74 0.18 ${hue + 60} / 0.5), transparent 60%)`,
        }}/>
        <div style={{
          position: 'absolute', left: 14, bottom: 14,
          color: '#fff',
          fontFamily: '-apple-system, system-ui',
          fontSize: 11, opacity: 0.85, fontWeight: 700,
        }}>API Showcase · {hue}°</div>
      </div>

      <Slider2 label={`Accent hue · ${Math.round(hue)}°`} value={hue} min={0} max={360}
               onChange={(v) => setHue(v)}/>

      {stage === 'done' && (
        <div style={{
          marginTop: 6, padding: 10, borderRadius: 10,
          background: 'color-mix(in oklch, oklch(0.7 0.18 145) 14%, transparent)',
          color: 'oklch(0.4 0.16 145)',
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, fontWeight: 600, textAlign: 'center',
          animation: 'tg-pop 320ms cubic-bezier(.2,1.6,.3,1)',
        }}>✓ wallpaper-{hue}deg.png · saved to Files</div>
      )}

      <MainButton label={stage === 'building' ? 'Building…' : stage === 'done' ? 'Build another' : 'Build & download'}
                  loading={stage === 'building'} haptic="soft" onClick={build}/>
    </div>
  );
}

function Slider2({ label, value, min, max, onChange }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 12, color: 'var(--tg-subtitle-text)',
        marginBottom: 4,
      }}>{label}</div>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--tg-accent)' }}/>
    </div>
  );
}

// ─── 7. Switch inline — open the bot in any chat ────────────────────────
function SwitchInlineDemo() {
  const tap = useHaptic();
  const [stage, setStage] = React.useState('idle'); // idle | opening | done
  const start = (e) => {
    tap('soft', e); setStage('opening');
    setTimeout(() => { setStage('done'); tap('success'); }, 700);
  };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}><code style={sspCode}>switchInlineQuery</code> takes the user to the chat
         picker and pre-fills the input with <code style={sspCode}>@bot query</code>.
         Whatever they pick, the Mini App's query shows as inline results.</div>

      <div style={{
        padding: 14, borderRadius: 14,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
        marginBottom: 14,
      }}>
        <div style={sspPaneHeader}>switchInlineQuery args</div>
        <pre style={{
          margin: '6px 0 0',
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 11, color: 'var(--tg-text)', lineHeight: 1.5,
        }}>{`{
  query: "cosmic-crystal",
  chat_types: ["users", "groups"]
}`}</pre>
      </div>

      {stage === 'done' && (
        <div style={{
          padding: 12, borderRadius: 12, marginBottom: 12,
          background: 'var(--tg-section-bg)',
          border: '0.5px solid var(--tg-card-border)',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'tg-pop 320ms cubic-bezier(.2,1.6,.3,1)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, oklch(0.78 0.16 215), oklch(0.45 0.2 240))',
            color: '#fff', display: 'grid', placeItems: 'center',
            fontFamily: '-apple-system, system-ui',
            fontSize: 12, fontWeight: 700,
          }}>L</div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: '-apple-system, system-ui',
              fontSize: 13, fontWeight: 600,
            }}>Picked: Lina</div>
            <div style={{
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 11, color: 'var(--tg-subtitle-text)', marginTop: 1,
            }}>@apishowcasebot cosmic-crystal</div>
          </div>
        </div>
      )}

      <MainButton label={stage === 'opening' ? 'Opening picker…' : stage === 'done' ? 'Run again' : 'Open chat picker'}
                  loading={stage === 'opening'} haptic="soft" onClick={start}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  PREMIUM (3) — emoji status / promo / double limits
// ════════════════════════════════════════════════════════════════════════

function EmojiStatusDemo() {
  const tap = useHaptic();
  const [pick, setPick] = React.useState('🔥');
  const [active, setActive] = React.useState(null);
  const choices = ['🔥', '✨', '🎁', '🌹', '👑', '🦄', '🧊', '☘️'];
  const setStatus = (e) => { tap('success', e); setActive({ emoji: pick, until: Date.now() + 3600000 }); };
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Premium lets the user wear a custom emoji as a status — visible next
         to their name in every chat. Defaults expire in 1 h, can be made
         permanent.</div>

      <div style={{
        padding: 16, borderRadius: 18,
        background: 'var(--tg-section-bg)',
        border: '0.5px solid var(--tg-card-border)',
        boxShadow: 'var(--tg-card-shadow)',
        marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, oklch(0.74 0.16 215), oklch(0.45 0.2 240))',
          color: '#fff', display: 'grid', placeItems: 'center',
          fontFamily: '-apple-system, system-ui',
          fontSize: 22, fontWeight: 700,
        }}>A</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: '-apple-system, system-ui',
            fontSize: 16, fontWeight: 700,
          }}>Alex Carter {active && (
            <span style={{
              fontSize: 16, animation: 'tg-pop 360ms cubic-bezier(.2,1.6,.3,1)',
            }}>{active.emoji}</span>
          )}</div>
          <div style={{
            fontFamily: '-apple-system, system-ui',
            fontSize: 11, color: 'var(--tg-subtitle-text)', marginTop: 2,
          }}>{active ? `Status expires in 60 min` : 'No emoji status'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {choices.map((e) => {
          const on = pick === e;
          return (
            <PressCard key={e} haptic="selection"
              onPress={(ev) => { tap('selection', ev); setPick(e); }}
              style={{
                width: 44, height: 44, borderRadius: 11,
                background: on ? 'color-mix(in oklch, var(--tg-accent) 18%, transparent)' : 'var(--tg-secondary-bg)',
                border: '0.5px solid ' + (on ? 'var(--tg-accent)' : 'transparent'),
                display: 'grid', placeItems: 'center',
                fontSize: 24, padding: 0,
              }}>{e}</PressCard>
          );
        })}
      </div>

      <MainButton label={active ? 'Clear status' : `Set ${pick} for 1 hour`}
                  haptic={active ? 'warning' : 'success'}
                  variant={active ? 'destructive' : 'primary'}
                  onClick={active ? () => { tap('warning'); setActive(null); } : setStatus}/>
    </div>
  );
}

// ─── 8. Premium promo — open the upgrade page ───────────────────────────
function PremiumPromoDemo() {
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Any Mini App can open Telegram's native Premium promo page via
         <code style={sspCode}>showPremiumPromo()</code> — same gradient, same
         feature list, same in-app purchase.</div>

      <div style={{
        padding: '28px 18px',
        borderRadius: 22, marginBottom: 14,
        background: 'linear-gradient(135deg, #6C5CE7 0%, #5F27CD 50%, #4834D4 100%)',
        color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* stars */}
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: ((i * 37) % 100) + '%', top: ((i * 53) % 100) + '%',
            width: (i % 3) + 1, height: (i % 3) + 1, borderRadius: '50%',
            background: '#fff', opacity: 0.6 + ((i % 4) * 0.1),
          }}/>
        ))}
        <div style={{
          position: 'relative', width: 64, height: 64, margin: '0 auto',
        }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 18,
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(10px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
            animation: 'tg-premium-pulse 2.8s ease-in-out infinite',
          }}/>
          <svg viewBox="0 0 64 64" style={{ position: 'absolute', inset: 0 }}>
            <path d="M32 14 L37 28 L52 30 L40 41 L43 56 L32 48 L21 56 L24 41 L12 30 L27 28 z"
                  fill="#fff" stroke="rgba(255,255,255,0.6)" strokeWidth={0.5}/>
          </svg>
        </div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase',
          opacity: 0.85, fontWeight: 800, marginTop: 14,
        }}>Telegram Premium</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginTop: 4,
        }}>Get the full set.</div>
        <div style={{
          fontFamily: '-apple-system, system-ui',
          fontSize: 13, opacity: 0.85, marginTop: 4, lineHeight: 1.4,
          maxWidth: 240, marginLeft: 'auto', marginRight: 'auto',
        }}>Double limits, voice transcription, animated avatars,
           custom emoji statuses, and a few hundred more touches.</div>
      </div>

      <MainButton label="Open Premium promo" haptic="soft"
                  onClick={() => {}}/>
    </div>
  );
}

// ─── 9. Double limits visualizer ────────────────────────────────────────
function DoubleLimitsDemo() {
  const limits = [
    { name: 'Channels',            free: 500,  prem: 1000 },
    { name: 'Folders',             free: 10,   prem: 20 },
    { name: 'Pinned chats',        free: 5,    prem: 10 },
    { name: 'Pinned in folders',   free: 5,    prem: 10 },
    { name: 'Reactions per post',  free: 1,    prem: 3 },
    { name: 'Saved GIFs',          free: 200,  prem: 400 },
    { name: 'Connected accounts',  free: 3,    prem: 4 },
    { name: 'File upload, GB',     free: 2,    prem: 4 },
  ];
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>Premium roughly doubles every per-user ceiling. Visualizing it makes
         the "this is worth €5/mo" pitch concrete.</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {limits.map((l) => (
          <div key={l.name} style={{
            padding: '10px 14px', borderRadius: 12,
            background: 'var(--tg-section-bg)',
            border: '0.5px solid var(--tg-card-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{
                fontFamily: '-apple-system, system-ui',
                fontSize: 13, fontWeight: 600,
              }}>{l.name}</div>
              <div style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11, color: 'var(--tg-subtitle-text)',
              }}>{l.free} <span style={{ color: '#5F27CD', fontWeight: 700 }}>→ {l.prem}</span></div>
            </div>
            <div style={{
              marginTop: 6, height: 5, borderRadius: 3, overflow: 'hidden',
              background: 'var(--tg-section-separator)',
              display: 'flex',
            }}>
              <div style={{
                width: `${(l.free / l.prem) * 100}%`,
                background: 'var(--tg-hint)',
              }}/>
              <div style={{
                flex: 1,
                background: 'linear-gradient(90deg, #6C5CE7, #4834D4)',
                animation: 'tg-fade-in 320ms',
              }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  QRScannerDemo, ClipboardDemo, WriteAccessDemo,
  ShareToStoryDemo, ShareMessageDemo, DownloadFileDemo, SwitchInlineDemo,
  EmojiStatusDemo, PremiumPromoDemo, DoubleLimitsDemo,
});
