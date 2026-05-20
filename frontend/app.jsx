// app.jsx — wires everything together: theme, routing, iOS frame, Tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "#2481cc",
  "userName": "Alex",
  "isPremium": false,
  "motionDensity": "regular",
  "sound": false,
  "showHapticLabels": true,
  "desktopFallback": false,
  "progress": 3,
  "eventLog": false,
  "frame": "auto"
}/*EDITMODE-END*/;

const ACCENT_PRESETS = ['#2481cc', '#0a84ff', '#7a5af8', '#e85c6f', '#1f8a5b'];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState('onboarding'); // 'onboarding' | 'gallery' | {demo, card}
  const [transitionDir, setTransitionDir] = React.useState('forward');
  const [progress, setProgress] = React.useState(t.progress);
  const [scrolled, setScrolled] = React.useState(false);
  const completedRef = React.useRef(new Set());

  // Apply theme + accent override every render.
  React.useEffect(() => {
    applyTheme(t.theme);
    if (t.accent) document.documentElement.style.setProperty('--tg-accent', t.accent);
    if (t.accent && t.theme !== 'coral') {
      document.documentElement.style.setProperty('--tg-button', t.accent);
      document.documentElement.style.setProperty('--tg-link', t.accent);
    }
  }, [t.theme, t.accent]);

  React.useEffect(() => { setProgress(t.progress); }, [t.progress]);

  // Compute device frame dark mode from theme token.
  const dark = (THEMES[t.theme] || THEMES.light)['--tg-mode'] === 'dark';

  const openCard = (card) => {
    if (card.demoId) {
      setTransitionDir('forward');
      setRoute({ kind: 'demo', card, demoId: card.demoId });
    } else {
      setTransitionDir('forward');
      setRoute({ kind: 'stub', card });
    }
    if (!completedRef.current.has(card.id)) {
      completedRef.current.add(card.id);
      setProgress((p) => Math.min(TOTAL_DEMOS, p + 1));
    }
    window.tgLog && window.tgLog('mainButton_clicked', { card: card.id });
  };

  const backToGallery = () => {
    setTransitionDir('back');
    setRoute('gallery');
  };

  // Edge-swipe-back: drag from the left edge to pop the current demo/stub.
  // Required because the chevron in HostHeader is easy to miss on real
  // devices, leaving users stuck inside a demo with no obvious way out.
  const canSwipeBack = typeof route === 'object' && (route.kind === 'demo' || route.kind === 'stub');
  React.useEffect(() => {
    if (!canSwipeBack) return;
    const EDGE = 28;        // touch must start within this many px of the left edge
    const DIST = 64;        // horizontal distance required to fire
    const ANGLE = 0.7;      // |dy/dx| must stay below this (mostly horizontal)
    let sx = 0, sy = 0, tracking = false;
    const start = (e) => {
      const t = e.touches[0];
      if (!t) return;
      if (t.clientX <= EDGE) { sx = t.clientX; sy = t.clientY; tracking = true; }
    };
    const move = (e) => {
      if (!tracking) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - sx;
      const dy = Math.abs(t.clientY - sy);
      if (dx > DIST && dy / Math.max(dx, 1) < ANGLE) {
        tracking = false;
        backToGallery();
      } else if (dx < -10 || dy > 80) {
        tracking = false;
      }
    };
    const end = () => { tracking = false; };
    window.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', end, { passive: true });
    window.addEventListener('touchcancel', end, { passive: true });
    return () => {
      window.removeEventListener('touchstart', start);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
      window.removeEventListener('touchcancel', end);
    };
  }, [canSwipeBack]);

  // Title shown in the host header.
  const headerTitle = route === 'onboarding'
    ? 'API Showcase'
    : route === 'gallery'
    ? 'API Showcase'
    : route.kind === 'demo' || route.kind === 'stub'
    ? route.card.title
    : 'API Showcase';

  const showBack = typeof route === 'object' && (route.kind === 'demo' || route.kind === 'stub');
  const closeOk = () => { /* would close the Mini App in real life — no-op here */ };

  // Decide whether to wrap the Mini App in an iOS-frame mock (desktop preview)
  // or render it directly into the viewport (real Telegram client + narrow
  // browser windows). Auto-detects unless overridden via the Tweaks panel.
  const [vw, setVw] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const r = () => setVw(window.innerWidth);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const useFrame = (
    t.frame === 'phone' ? true :
    t.frame === 'fullscreen' ? false :
    // auto: skip the mock when running inside Telegram or on a narrow viewport.
    (vw > 540 && !(window.Telegram && window.Telegram.WebApp))
  );

  const shellContent = (
    <React.Fragment>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--tg-header-bg)' }}/>
      <HostHeader
        title={headerTitle}
        onBack={showBack ? backToGallery : null}
        onClose={closeOk}
        scrolled={scrolled && route !== 'onboarding'}
      />

      <View routeKey={routeKey(route)} dir={transitionDir}>
        {route === 'onboarding' && (
          <Onboarding userName={t.userName} motionDensity={t.motionDensity}
                      onDone={() => { setTransitionDir('forward'); setRoute('gallery'); }}/>
        )}
        {route === 'gallery' && (
          <Gallery userName={t.userName} progress={progress}
                   isPremium={t.isPremium} onOpen={openCard}
                   onScroll={(top) => setScrolled(top > 6)}/>
        )}
        {typeof route === 'object' && route.kind === 'demo' && (
          <MiniAppSurface padTop={98} padBottom={96}>
            <DemoBody demoId={route.demoId} card={route.card}/>
            <PremiumGate
              visible={!!route.card.premium && !t.isPremium}
              title={route.card.title}
              reason={`${route.card.title} is part of Telegram Premium. Activate Premium to enable this and a few hundred other touches.`}
              onUnlock={() => setTweak('isPremium', true)}
            />
          </MiniAppSurface>
        )}
        {typeof route === 'object' && route.kind === 'stub' && (
          <MiniAppSurface padTop={98} padBottom={96}>
            <StubDemo card={route.card} hue={hueFor(route.card.id)} onBackToGallery={backToGallery}/>
            <PremiumGate
              visible={!!route.card.premium && !t.isPremium}
              title={route.card.title}
              reason={`${route.card.title} is part of Telegram Premium. Activate Premium to enable this and a few hundred other touches.`}
              onUnlock={() => setTweak('isPremium', true)}
            />
          </MiniAppSurface>
        )}
      </View>

      {t.desktopFallback && (
        <DesktopOverlay onDismiss={() => setTweak('desktopFallback', false)}/>
      )}
      <EventLog visible={t.eventLog}/>
    </React.Fragment>
  );

  return (
    <HapticProvider soundOn={t.sound}>
      {useFrame ? (
        <Stage>
          <IOSDevice dark={dark}>
            {shellContent}
          </IOSDevice>
        </Stage>
      ) : (
        <FullscreenShell dark={dark}>
          {shellContent}
        </FullscreenShell>
      )}

      <TweaksPanel title="Showcase tweaks">
        <TweakSection label="Identity"/>
        <TweakText label="Greeting name" value={t.userName}
                   placeholder="Alex"
                   onChange={(v) => setTweak('userName', v || 'Alex')}/>
        <TweakToggle label="Telegram Premium" value={t.isPremium}
                     onChange={(v) => setTweak('isPremium', v)}/>

        <TweakSection label="Theme"/>
        <TweakRadio label="Mode" value={t.theme}
                    options={['light', 'dark', 'coral']}
                    onChange={(v) => setTweak('theme', v)}/>
        <TweakColor label="Accent" value={t.accent}
                    options={ACCENT_PRESETS}
                    onChange={(v) => setTweak('accent', v)}/>

        <TweakSection label="Feel"/>
        <TweakRadio label="Motion" value={t.motionDensity}
                    options={['reduced', 'regular', 'lively']}
                    onChange={(v) => setTweak('motionDensity', v)}/>
        <TweakToggle label="Sound on" value={t.sound}
                     onChange={(v) => setTweak('sound', v)}/>

        <TweakSection label="Preview"/>
        <TweakRadio label="Device frame" value={t.frame}
                    options={['auto', 'phone', 'fullscreen']}
                    onChange={(v) => setTweak('frame', v)}/>

        <TweakSection label="State"/>
        <TweakSlider label="Demos explored" value={progress}
                     min={0} max={TOTAL_DEMOS}
                     onChange={(v) => { setProgress(v); setTweak('progress', v); }}/>
        <TweakToggle label="Desktop fallback view" value={t.desktopFallback}
                     onChange={(v) => setTweak('desktopFallback', v)}/>
        <TweakToggle label="Event log overlay" value={t.eventLog}
                     onChange={(v) => setTweak('eventLog', v)}/>

        <TweakSection label="Jump"/>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <TweakButton label="Onboarding" secondary onClick={() => setRoute('onboarding')}/>
          <TweakButton label="Gallery" secondary onClick={() => setRoute('gallery')}/>
          <TweakButton label="Haptic Lab" onClick={() => jumpDemo(setRoute, 'haptic-lab', 'haptic')}/>
          <TweakButton label="Storage" secondary onClick={() => jumpDemo(setRoute, 'cloud', 'storage')}/>
          <TweakButton label="Sensors" secondary onClick={() => jumpDemo(setRoute, 'cube', 'sensors')}/>
          <TweakButton label="Stars pay" secondary onClick={() => jumpDemo(setRoute, 'stars', 'payment')}/>
          <TweakButton label="Vault" secondary onClick={() => jumpDemo(setRoute, 'vault', 'biometrics')}/>
        </div>
      </TweaksPanel>
    </HapticProvider>
  );
}

function jumpDemo(setRoute, cardId, demoId) {
  const card = CATEGORIES.flatMap((c) => c.cards).find((c) => c.id === cardId);
  setRoute({ kind: 'demo', card: card || { id: cardId, title: cardId }, demoId });
}

function routeKey(route) {
  if (typeof route === 'string') return route;
  return route.kind + ':' + (route.card?.id || '');
}

function hueFor(cardId) {
  for (const c of CATEGORIES) if (c.cards.some((x) => x.id === cardId)) return c.hue;
  return 215;
}

// ─── Demo router ────────────────────────────────────────────────────────
function DemoBody({ demoId, card }) {
  if (demoId === 'haptic') return <HapticLab/>;
  if (demoId === 'storage') return <StorageInspector/>;
  if (demoId === 'sensors') return <SensorsCube/>;
  if (demoId === 'payment') return <StarsPayment/>;
  if (demoId === 'biometrics') return <BiometricVault/>;
  if (demoId === 'collectible') return <CollectibleGifts/>;
  if (demoId === 'launch') return <LaunchModesDemo/>;
  if (demoId === 'business') return <BusinessProfileDemo/>;
  if (demoId === 'reactions') return <ReactionsDemo/>;
  if (demoId === 'age') return <AgeVerificationDemo/>;
  if (demoId === 'rpc') return <CustomMethodInspector/>;
  if (demoId === 'ton') return <TONSiteDemo/>;
  if (demoId === 'hide-kb') return <HideKeyboardDemo/>;
  if (demoId === 'close-confirm') return <ClosingConfirmDemo/>;
  if (demoId === 'homescr') return <HomeScreenDemo/>;
  if (demoId === 'phone-only') return <PhoneOnlyDemo/>;
  if (demoId === 'tg-link') return <OpenTelegramLinkDemo/>;
  if (demoId === 'browser-opts') return <BrowserOptionsDemo/>;
  if (demoId === 'voice') return <VoiceToTextDemo/>;
  if (demoId === 'profile-vid') return <ProfileVideoDemo/>;
  if (demoId === 'folder-tags') return <FolderTagsDemo/>;
  if (demoId === 'upgrade-gift') return <UpgradeGiftDemo/>;
  if (demoId === 'transfer-gift') return <TransferGiftDemo/>;
  if (demoId === 'resell-gift') return <ResellGiftDemo/>;
  if (demoId === 'birthday-gift') return <BirthdayGiftDemo/>;
  if (demoId === 'paid-msg') return <PaidMessagesDemo/>;
  if (demoId === 'paid-media') return <PaidMediaDemo/>;
  if (demoId === 'get-gift') return <GetRegularGiftDemo/>;
  if (demoId === 'withdraw-ton') return <WithdrawTonDemo/>;
  if (demoId === 'emoji-status-gift') return <EmojiStatusFromGiftDemo/>;
  if (demoId === 'chat-theme-gift') return <ChatThemeFromGiftDemo/>;
  if (demoId === 'gift-collections') return <GiftCollectionsDemo/>;
  if (demoId === 'pin-gifts') return <PinGiftsDemo/>;
  if (demoId === 'channel-gifts') return <ChannelGiftsDemo/>;
  if (demoId === 'star-rating') return <StarRatingDemo/>;
  if (demoId === 'star-pack') return <StarPackDemo/>;
  if (demoId === 'suggested-posts') return <SuggestedPostsDemo/>;
  if (demoId === 'ton-toggle') return <TonToggleDemo/>;
  // Identity / theme
  if (demoId === 'who') return <WhoAmIDemo/>;
  if (demoId === 'theme') return <DynamicThemeDemo/>;
  if (demoId === 'platform') return <PlatformDemo/>;
  // Viewport
  if (demoId === 'vp') return <ViewportMeterDemo/>;
  if (demoId === 'swipe') return <VerticalSwipesDemo/>;
  if (demoId === 'fs') return <FullscreenDemo/>;
  if (demoId === 'safe') return <SafeAreaDemo/>;
  if (demoId === 'rot') return <LockOrientationDemo/>;
  // Buttons / chrome
  if (demoId === 'mb') return <MainButtonLabDemo/>;
  if (demoId === 'sb') return <SecondaryButtonDemo/>;
  if (demoId === 'settings') return <SettingsSheetDemo/>;
  if (demoId === 'chrome') return <ChromeColorsDemo/>;
  // Launch surfaces
  if (demoId === 'splash') return <CustomSplashDemo/>;
  if (demoId === 'preview-medias') return <BotPreviewMediasDemo/>;
  if (demoId === 'store-tile') return <StoreEntryDemo/>;
  // Sensors / location
  if (demoId === 'compass') return <CompassDemo/>;
  if (demoId === 'horizon') return <HorizonDemo/>;
  if (demoId === 'where') return <LocationDemo/>;
  // Realtime
  if (demoId === 'live') return <LiveViewerDemo/>;
  if (demoId === 'echo') return <HapticEchoDemo/>;
  // System extras
  if (demoId === 'qr') return <QRScannerDemo/>;
  if (demoId === 'clip') return <ClipboardDemo/>;
  if (demoId === 'write') return <WriteAccessDemo/>;
  // Share & stories
  if (demoId === 's-story') return <ShareToStoryDemo/>;
  if (demoId === 's-msg') return <ShareMessageDemo/>;
  if (demoId === 's-dl') return <DownloadFileDemo/>;
  if (demoId === 's-inline') return <SwitchInlineDemo/>;
  // Premium
  if (demoId === 'emoji-status') return <EmojiStatusDemo/>;
  if (demoId === 'pr-promo') return <PremiumPromoDemo/>;
  if (demoId === 'pr-limits') return <DoubleLimitsDemo/>;
  return null;
}

// Inline list of all 7 launch entry points, current one highlighted.
// (LaunchModeBadge lives in the gallery greeting; this is the full demo view.)
function LaunchModesDemo() {
  const tap = useHaptic();
  const [activeId, setActiveId] = React.useState(DEFAULT_LAUNCH_MODE);
  return (
    <div style={{ padding: '4px 16px 0', color: 'var(--tg-text)' }}>
      <div style={{
        fontFamily: '-apple-system, system-ui',
        fontSize: 13, color: 'var(--tg-subtitle-text)',
        marginBottom: 14,
      }}>The Mini App SDK reports which of seven entry points the viewer used.
         Tap any row to pretend you arrived that way — the "You" pin moves.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {LAUNCH_MODES.map((m) => {
          const on = m.id === activeId;
          return (
            <PressCard key={m.id} haptic={on ? 'selection' : 'success'}
              onPress={(e) => { tap('success', e); setActiveId(m.id); }}
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
  );
}

// ─── View with slide transition ─────────────────────────────────────────
// Inline crossfade + slide. Two layers swap on routeKey change.
function View({ routeKey, dir, children }) {
  const [layers, setLayers] = React.useState([{ key: routeKey, children, dir, leaving: false }]);
  const prevKey = React.useRef(routeKey);

  React.useEffect(() => {
    if (prevKey.current === routeKey) {
      // Same route — update children in place.
      setLayers((ls) => ls.map((l, i) => i === ls.length - 1 ? { ...l, children } : l));
      return;
    }
    setLayers((ls) => [
      ...ls.map((l) => ({ ...l, leaving: true, dir })),
      { key: routeKey, children, leaving: false, dir },
    ]);
    prevKey.current = routeKey;
    const id = setTimeout(() => {
      setLayers((ls) => ls.filter((l) => !l.leaving));
    }, 360);
    return () => clearTimeout(id);
  }, [routeKey, children, dir]);

  return (
    <>
      {layers.map((l) => (
        <ViewLayer key={l.key} leaving={l.leaving} dir={l.dir}>{l.children}</ViewLayer>
      ))}
    </>
  );
}

// One layer of the View — content is always visible; outgoing layers fade.
function ViewLayer({ leaving, dir, children }) {
  const leaveTo = dir === 'forward' ? -28 : 28;
  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
      opacity: leaving ? 0 : 1,
      transform: leaving ? `translateX(${leaveTo}px)` : 'translateX(0)',
      transition: 'opacity 240ms cubic-bezier(.2,.7,.3,1), transform 280ms cubic-bezier(.2,.7,.3,1)',
      willChange: 'opacity, transform',
    }}>{children}</div>
  );
}

// ─── Stage — scales the iOS frame to fit the viewport ───────────────────
function Stage({ children }) {
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    let raf = 0;
    const fit = () => {
      const sw = window.innerWidth - 32;
      const sh = window.innerHeight - 32;
      const dw = 402, dh = 874;
      if (sw < 100 || sh < 100) {
        // Iframe hasn't laid out yet — try again next frame.
        raf = requestAnimationFrame(fit);
        return;
      }
      setScale(Math.max(0.2, Math.min(1, sw / dw, sh / dh)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => { window.removeEventListener('resize', fit); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'grid', placeItems: 'center',
      background: 'radial-gradient(circle at 50% 30%, var(--tg-stage-1, #1a1d22) 0%, var(--tg-stage-2, #0a0b0e) 70%, #07080a 100%)',
      overflow: 'hidden',
    }}>
      <div style={{
        transform: `scale(${scale})`, transformOrigin: 'center',
      }}>{children}</div>
    </div>
  );
}

// Fullscreen shell — used when running inside real Telegram (or any narrow
// viewport). Skips the iOS-frame mock and lets the Mini App content fill
// 100vw × 100vh. Behavior is otherwise identical to IOSDevice's positioned
// container — HostHeader and MiniAppSurface still rely on absolute layout.
function FullscreenShell({ dark, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--tg-bg)',
      color: 'var(--tg-text)',
      overflow: 'hidden',
      WebkitFontSmoothing: 'antialiased',
      fontFamily: '-apple-system, system-ui, sans-serif',
    }}>{children}</div>
  );
}

function DesktopOverlay({ onDismiss }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 9,
      background: 'rgba(8,10,14,0.66)', color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 28, textAlign: 'center',
      animation: 'tg-fade-in 240ms',
    }}>
      <div style={{
        width: 76, height: 76, borderRadius: 22,
        background: 'rgba(255,255,255,0.08)',
        display: 'grid', placeItems: 'center', marginBottom: 18,
        border: '0.5px solid rgba(255,255,255,0.18)',
      }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect x="3" y="6" width="30" height="20" rx="2" stroke="#fff" strokeWidth="1.8"/>
          <path d="M12 30h12M16 26v4M20 26v4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ fontFamily: '-apple-system, system-ui', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
        Better on a phone
      </div>
      <div style={{ fontFamily: '-apple-system, system-ui', fontSize: 14, color: 'rgba(255,255,255,0.7)', maxWidth: 280, lineHeight: 1.4 }}>
        Haptics, biometrics, sensors and home-screen install only fire on iOS or Android.
        Scan the link with Telegram on your phone to feel everything.
      </div>
      <button onClick={onDismiss} style={{
        marginTop: 22, padding: '10px 18px',
        borderRadius: 12, border: 0,
        background: 'var(--tg-button)', color: 'var(--tg-button-text)',
        fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 14,
        cursor: 'pointer',
      }}>Show me anyway</button>
    </div>
  );
}

// Mount.
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
