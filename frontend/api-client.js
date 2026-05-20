/* global Telegram */
// API Showcase — bridge between the React prototype and the FastAPI backend.
// Loaded BEFORE every jsx file; exposes window.API.
(function () {
  const ORIGIN = (window.__API_BASE__ || '').replace(/\/+$/, '') || '';
  const WS_BASE = ORIGIN.startsWith('http')
    ? ORIGIN.replace(/^http/, 'ws')
    : (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host;

  const state = {
    base: ORIGIN,
    token: null,
    user: null,
    launchMode: null,
    ready: false,
    readyResolvers: [],
    subscribers: new Map(), // type -> Set<callback>
    wsSocket: null,
    wsReconnectMs: 800,
    online: 0,
  };

  function emit(type, payload) {
    const subs = state.subscribers.get(type);
    if (!subs) return;
    subs.forEach((cb) => {
      try { cb(payload); } catch (e) { console.error('[API]', type, e); }
    });
  }

  function subscribe(type, cb) {
    if (!state.subscribers.has(type)) state.subscribers.set(type, new Set());
    state.subscribers.get(type).add(cb);
    return () => state.subscribers.get(type).delete(cb);
  }

  function whenReady() {
    if (state.ready) return Promise.resolve();
    return new Promise((res) => state.readyResolvers.push(res));
  }

  async function apiFetch(path, opts = {}) {
    const url = (state.base || '') + path;
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (state.token) headers['Authorization'] = 'Bearer ' + state.token;
    const res = await fetch(url, { ...opts, headers });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error('HTTP ' + res.status + ' ' + txt);
    }
    if (res.status === 204) return null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json();
    return res.text();
  }

  function getInitData() {
    try {
      const tg = window.Telegram && window.Telegram.WebApp;
      if (tg && tg.initData) return tg.initData;
    } catch (e) {}
    const id = window.__TG_USER_ID__ || 802441099;
    const name = window.__TG_USER_NAME__ || 'Alex';
    return '__dev__:' + id + ':' + name;
  }

  async function verify() {
    const init = getInitData();
    const res = await fetch((state.base || '') + '/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Init-Data': init },
    });
    if (!res.ok) throw new Error('verify failed: ' + res.status);
    const data = await res.json();
    state.token = data.token;
    state.user = data.user;
    state.launchMode = data.launch_mode;
    try { localStorage.setItem('tg_api_token', data.token); } catch (e) {}
    return data;
  }

  function connectWS() {
    if (!state.token) return;
    try { state.wsSocket && state.wsSocket.close(); } catch (e) {}
    const url = WS_BASE + '/ws?token=' + encodeURIComponent(state.token);
    const sock = new WebSocket(url);
    state.wsSocket = sock;
    sock.addEventListener('open', () => {
      state.wsReconnectMs = 800;
      emit('ws_open', {});
      // identify
      try {
        sock.send(JSON.stringify({ type: 'identify', device_id: navigator.userAgent.slice(0, 64) }));
      } catch (e) {}
    });
    sock.addEventListener('message', (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch (e) { return; }
      if (msg && msg.type) {
        if (msg.type === 'presence' && typeof msg.online === 'number') {
          state.online = msg.online;
        }
        emit(msg.type, msg);
        emit('*', msg);
      }
    });
    const reconnect = () => {
      emit('ws_close', {});
      setTimeout(connectWS, state.wsReconnectMs);
      state.wsReconnectMs = Math.min(state.wsReconnectMs * 1.7, 8000);
    };
    sock.addEventListener('close', reconnect);
    sock.addEventListener('error', () => { try { sock.close(); } catch (e) {} });

    // ping every 25s
    const pingId = setInterval(() => {
      if (sock.readyState !== 1) { clearInterval(pingId); return; }
      try { sock.send(JSON.stringify({ type: 'ping' })); } catch (e) {}
    }, 25000);
  }

  function send(obj) {
    const s = state.wsSocket;
    if (!s || s.readyState !== 1) return false;
    try { s.send(JSON.stringify(obj)); return true; } catch (e) { return false; }
  }

  async function init() {
    try {
      const tg = window.Telegram && window.Telegram.WebApp;
      if (tg) {
        try { tg.ready && tg.ready(); } catch (e) {}
        try { tg.expand && tg.expand(); } catch (e) {}
        try { tg.requestFullscreen && tg.requestFullscreen(); } catch (e) {}
        try { tg.disableVerticalSwipes && tg.disableVerticalSwipes(); } catch (e) {}
        try { tg.enableClosingConfirmation && tg.enableClosingConfirmation(); } catch (e) {}
      }
    } catch (e) {}
    try {
      await verify();
      connectWS();
      state.ready = true;
      state.readyResolvers.forEach((r) => r());
      state.readyResolvers = [];
      emit('ready', { user: state.user });
      console.log('[API] ready as', state.user && state.user.first_name, state.token ? '(token ok)' : '');
    } catch (e) {
      console.warn('[API] init failed, frontend stays in mock mode:', e);
      state.ready = false;
    }
  }

  // Public surface
  window.API = {
    state,
    fetch: apiFetch,
    subscribe,
    whenReady,
    init,
    send,
    get token() { return state.token; },
    get user() { return state.user; },
    get launchMode() { return state.launchMode; },
    get online() { return state.online; },
    isReady: () => state.ready,
  };

  // Auto-init after DOM/scripts settle (Babel compiles asynchronously).
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 0));
  } else {
    setTimeout(init, 0);
  }
})();
