// event-log.jsx — developer-facing event log overlay (addendum §4.5).
// User-facing copy stayed unchanged in v2.0, but several SDK event names did
// change. This little floating panel surfaces them so demos can demonstrate
// the corrected names side-by-side with the action that fired them.
//
// Renaming map (v1 → v2):
//   activated / deactivated  → visibility_changed
//   shareMessageSent         → prepared_message_sent
//   shareMessageFailed       → prepared_message_failed
//   (new in v2)              → secure_storage_cleared
//   (new in v2)              → home_screen_failed
//
// Public API:
//   window.tgLog(eventName, payload?)  — emit an event into the log
//   <EventLog visible/>                — render the floating overlay

// In-memory ring buffer + tiny pub/sub.
const __tg_log_buffer = [];
const __tg_log_listeners = new Set();
let __tg_log_seq = 0;

window.tgLog = function (event, payload) {
  const entry = {
    id: ++__tg_log_seq, event,
    payload: payload || null,
    t: new Date().toLocaleTimeString('en-US', { hour12: false }),
  };
  __tg_log_buffer.push(entry);
  while (__tg_log_buffer.length > 12) __tg_log_buffer.shift();
  __tg_log_listeners.forEach((fn) => fn());
};

// Hook visibility_changed once — the SDK does it for us.
(function bindVisibility() {
  if (window.__tg_visibility_bound) return;
  window.__tg_visibility_bound = true;
  let last = !document.hidden;
  document.addEventListener('visibilitychange', () => {
    const isVisible = !document.hidden;
    if (isVisible !== last) {
      last = isVisible;
      window.tgLog('visibility_changed', { is_visible: isVisible });
    }
  });
})();

function EventLog({ visible }) {
  const [, force] = React.useReducer((n) => n + 1, 0);
  React.useEffect(() => {
    __tg_log_listeners.add(force);
    return () => __tg_log_listeners.delete(force);
  }, []);
  if (!visible) return null;
  const recent = __tg_log_buffer.slice(-5).reverse();
  return (
    <div style={{
      position: 'absolute', left: 10, bottom: 100, zIndex: 9,
      width: 220,
      padding: 8,
      borderRadius: 12,
      background: 'rgba(8,10,14,0.82)',
      backdropFilter: 'blur(14px) saturate(180%)',
      WebkitBackdropFilter: 'blur(14px) saturate(180%)',
      border: '0.5px solid rgba(255,255,255,0.1)',
      color: '#fff',
      boxShadow: '0 8px 22px rgba(0,0,0,0.4)',
      pointerEvents: 'none',
    }}>
      <div style={{
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: 9, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.55)',
        marginBottom: 6,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'oklch(0.7 0.2 145)',
          animation: 'tg-cloud-pulse 1.4s ease-in-out infinite',
        }}/>
        EventLog · v2 names
      </div>
      {recent.length === 0 && (
        <div style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 10, color: 'rgba(255,255,255,0.4)',
          padding: '4px 2px',
        }}>idle — interact with a demo</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {recent.map((e) => (
          <div key={e.id} style={{
            display: 'flex', alignItems: 'baseline', gap: 6,
            padding: '4px 6px', borderRadius: 6,
            background: 'rgba(255,255,255,0.06)',
            animation: 'tg-fade-in 220ms',
          }}>
            <span style={{
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 8, color: 'rgba(255,255,255,0.5)', flexShrink: 0,
            }}>{e.t.slice(3)}</span>
            <span style={{
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 10, color: '#9ee6c0', fontWeight: 600,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{e.event}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { EventLog });
