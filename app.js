/* ============================================================
   Metas & Plata  —  app.js
   Vanilla JS, sin dependencias. Estado centralizado, cálculos
   puros, render declarativo simple. Todo se guarda en localStorage.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Helpers DOM ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
  function uid() { return "g" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function num(v, def = 0) {
    const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
    return isFinite(n) ? n : def;
  }
  function nonneg(n) { return n < 0 ? 0 : n; }
  function prefersReduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- Íconos (SVG inline estilo Lucide, sin emojis) ---------- */
  const ICON_PATHS = {
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    dumbbell: '<path d="M2 12h2"/><rect x="4" y="7" width="3" height="10" rx="1.2"/><path d="M7 12h10"/><rect x="17" y="7" width="3" height="10" rx="1.2"/><path d="M20 12h2"/>',
    droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    laptop: '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    apple: '<path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
    grad: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    bike: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    bellOff: '<path d="M8.7 3A6 6 0 0 1 18 8c0 4.5 1.2 6.8 2.2 8"/><path d="M17 17H3s3-2 3-9c0-.6.1-1.2.3-1.8"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="m2 2 20 20"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    banknote: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/>',
    pie: '<path d="M21 12c.6 0 1-.4.95-1a10 10 0 0 0-8.95-8.95c-.55-.05-1 .4-1 .95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>'
  };
  function icon(name, size) {
    size = size || 18;
    return `<svg class="ico" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ICON_PATHS.target}</svg>`;
  }
  // Íconos elegibles para una meta (antes eran emojis; los datos viejos
  // se migran con EMOJI_TO_ICON en normalizeGoal).
  const GOAL_ICONS = ["target", "zap", "book", "dumbbell", "droplet", "heart", "music", "laptop",
    "palette", "leaf", "apple", "ban", "coins", "sparkles", "pencil", "mic", "grad", "trophy", "bike", "moon"];
  const EMOJI_TO_ICON = {
    "🎯": "target", "🏃": "zap", "📚": "book", "💪": "dumbbell", "💧": "droplet",
    "🧘": "heart", "🎸": "music", "💻": "laptop", "🎨": "palette", "🌱": "leaf",
    "🍎": "apple", "🚭": "ban", "💰": "coins", "🧹": "sparkles", "✍️": "pencil",
    "🗣️": "mic", "🎓": "grad", "⚽": "trophy", "🚴": "bike", "🛏️": "moon"
  };
  const COLORS = ["#ff6b6b", "#ffb84d", "#ffd93d", "#6bcf7f", "#4ecdc4", "#5b8def", "#b088f9", "#ff8fab"];
  const PERIODS = [
    { k: "diaria", label: "Diaria" }, { k: "semanal", label: "Semanal" },
    { k: "mensual", label: "Mensual" }, { k: "semestral", label: "Semestral" },
    { k: "anual", label: "Anual" }
  ];
  const PERIOD_LABEL = PERIODS.reduce((a, p) => (a[p.k] = p.label, a), {});
  const CATEGORIES = [
    { key: "vivienda", label: "Vivienda", color: "#5b8def", bucket: "nec" },
    { key: "comida", label: "Comida", color: "#6bcf7f", bucket: "nec" },
    { key: "transporte", label: "Transporte", color: "#4ecdc4", bucket: "nec" },
    { key: "suscripciones", label: "Suscripciones", color: "#b088f9", bucket: "gus" },
    { key: "salidas", label: "Salidas", color: "#ff8fab", bucket: "gus" },
    { key: "otros", label: "Otros", color: "#ffb84d", bucket: "gus" }
  ];
  const CAT_BY_KEY = CATEGORIES.reduce((a, c) => (a[c.key] = c, a), {});
  const KEY = "app_v1";

  /* ---------- Almacenamiento con fallback en memoria ---------- */
  const Store = (function () {
    let ok = true, mem = null, warned = false;
    try {
      localStorage.setItem("__probe__", "1");
      localStorage.removeItem("__probe__");
    } catch (e) { ok = false; }
    return {
      get() {
        if (ok) { try { return localStorage.getItem(KEY); } catch (e) { ok = false; } }
        return mem;
      },
      set(v) {
        if (ok) {
          try { localStorage.setItem(KEY, v); return true; }
          catch (e) { ok = false; mem = v; warnOnce(); return false; }
        }
        mem = v; return false;
      }
    };
    function warnOnce() {
      if (!warned) { warned = true; toast("Sin acceso a almacenamiento: guardo en memoria temporal de esta sesión.", "bad", 4500); }
    }
  })();

  /* ---------- Estado ---------- */
  let state = null;
  let uiTab = "metas";

  function defaultState() {
    return {
      version: 1,
      theme: "dark",
      notif: { enabled: false, time: "20:00", lastFired: null },
      goals: [],
      finance: {
        currency: "UYU",
        salary: 0,
        extraIncome: [],
        fixedExpenses: []
      },
      calc: {
        active: "compuesto",
        compuesto: { inicial: 10000, mensual: 3000, tasa: 8, anios: 10 },
        emergencia: { gastos: 0, meses: 4, tengo: 0, ahorroMes: 3000 },
        ahorro: { modo: "cuanto", objetivo: 50000, meses: 12, tengo: 0, ahorroMes: 4000 },
        costo: { precio: 5000, horasSemana: 40 }
      }
    };
  }

  function seedState() {
    const s = defaultState();
    const now = new Date();
    const dk = (off) => { const d = new Date(now); d.setDate(d.getDate() - off); return dayKey(d); };

    s.goals = [
      normalizeGoal({
        id: uid(), title: "Tomar agua", icon: "droplet", color: "#4ecdc4",
        period: "diaria", type: "numerica", unit: "vasos", target: 8, current: 3, order: 0,
        dayHistory: [
          { key: dk(3), completed: true, value: 8 },
          { key: dk(2), completed: false, value: 5 },
          { key: dk(1), completed: true, value: 8 }
        ]
      }),
      normalizeGoal({
        id: uid(), title: "Entrenar", icon: "dumbbell", color: "#ff6b6b",
        period: "diaria", type: "habito", order: 1, done: false,
        dayHistory: [
          { key: dk(4), completed: true, value: 1 },
          { key: dk(3), completed: true, value: 1 },
          { key: dk(2), completed: true, value: 1 },
          { key: dk(1), completed: true, value: 1 }
        ]
      }),
      normalizeGoal({
        id: uid(), title: "Leer", icon: "book", color: "#b088f9",
        period: "mensual", type: "numerica", unit: "libros", target: 2, current: 1, order: 2
      })
    ];
    s.finance.salary = 35000;
    s.finance.extraIncome = [{ id: uid(), name: "Freelance", amount: 5000 }];
    s.finance.fixedExpenses = [
      { id: uid(), name: "Alquiler", amount: 12000, category: "vivienda" },
      { id: uid(), name: "Súper / comida", amount: 8000, category: "comida" },
      { id: uid(), name: "Ómnibus / nafta", amount: 2500, category: "transporte" },
      { id: uid(), name: "Spotify + Netflix", amount: 700, category: "suscripciones" },
      { id: uid(), name: "Salidas", amount: 4000, category: "salidas" }
    ];
    return s;
  }

  function normalizeGoal(g) {
    g = g || {};
    const type = g.type === "habito" ? "habito" : "numerica";
    return {
      id: g.id || uid(),
      title: typeof g.title === "string" ? g.title : "Meta",
      icon: ICON_PATHS[g.icon] && GOAL_ICONS.indexOf(g.icon) >= 0 ? g.icon : (EMOJI_TO_ICON[g.emoji] || "target"),
      color: COLORS.indexOf(g.color) >= 0 ? g.color : COLORS[0],
      period: PERIOD_LABEL[g.period] ? g.period : "diaria",
      type: type,
      unit: typeof g.unit === "string" ? g.unit : "",
      target: type === "numerica" ? nonneg(num(g.target, 1)) || 1 : 1,
      current: type === "numerica" ? nonneg(num(g.current, 0)) : 0,
      done: !!g.done,
      periodKey: typeof g.periodKey === "string" ? g.periodKey : null,
      dayHistory: Array.isArray(g.dayHistory) ? g.dayHistory.filter(d => d && d.key).map(d => ({
        key: String(d.key), completed: !!d.completed, value: num(d.value, 0)
      })) : [],
      periodHistory: Array.isArray(g.periodHistory) ? g.periodHistory.filter(d => d && d.key).map(d => ({
        key: String(d.key), completed: !!d.completed, value: num(d.value, 0), target: nonneg(num(d.target, 1)) || 1
      })) : [],
      bestStreak: nonneg(num(g.bestStreak, 0)),
      order: num(g.order, 0)
    };
  }

  function normalizeState(raw) {
    const d = defaultState();
    if (!raw || typeof raw !== "object") return d;
    const s = defaultState();
    s.theme = (raw.theme === "light" || raw.theme === "dark") ? raw.theme : "dark";
    if (raw.notif && typeof raw.notif === "object") {
      s.notif.enabled = !!raw.notif.enabled;
      s.notif.time = /^\d{2}:\d{2}$/.test(raw.notif.time) ? raw.notif.time : "20:00";
      s.notif.lastFired = typeof raw.notif.lastFired === "string" ? raw.notif.lastFired : null;
    }
    s.goals = Array.isArray(raw.goals) ? raw.goals.map(normalizeGoal) : [];
    s.goals.forEach((g, i) => { if (!isFinite(g.order)) g.order = i; });
    if (raw.finance && typeof raw.finance === "object") {
      const f = raw.finance;
      s.finance.currency = f.currency === "USD" ? "USD" : "UYU";
      s.finance.salary = nonneg(num(f.salary, 0));
      s.finance.extraIncome = Array.isArray(f.extraIncome) ? f.extraIncome.map(e => ({
        id: (e && e.id) || uid(), name: (e && typeof e.name === "string") ? e.name : "", amount: nonneg(num(e && e.amount, 0))
      })) : [];
      s.finance.fixedExpenses = Array.isArray(f.fixedExpenses) ? f.fixedExpenses.map(e => ({
        id: (e && e.id) || uid(), name: (e && typeof e.name === "string") ? e.name : "",
        amount: nonneg(num(e && e.amount, 0)),
        category: (e && CAT_BY_KEY[e.category]) ? e.category : "otros"
      })) : [];
    }
    if (raw.calc && typeof raw.calc === "object") {
      const c = raw.calc, dc = d.calc;
      dc.active = ["compuesto", "emergencia", "ahorro", "costo"].indexOf(c.active) >= 0 ? c.active : "compuesto";
      ["compuesto", "emergencia", "ahorro", "costo"].forEach(k => {
        if (c[k] && typeof c[k] === "object") Object.keys(dc[k]).forEach(f => {
          if (f === "modo") dc[k][f] = (c[k][f] === "cuando" ? "cuando" : "cuanto");
          else if (typeof c[k][f] !== "undefined") dc[k][f] = nonneg(num(c[k][f], dc[k][f]));
        });
      });
      s.calc = dc;
    }
    return s;
  }

  function isValidImport(o) {
    return o && typeof o === "object" && Array.isArray(o.goals) &&
      o.finance && typeof o.finance === "object" &&
      Array.isArray(o.finance.extraIncome) && Array.isArray(o.finance.fixedExpenses);
  }

  /* Guardado con debounce: serializar todo el estado en cada tecla o tick
     de slider traba el hilo principal; agrupamos escrituras y flushSave()
     garantiza que nada quede sin persistir al ocultar/cerrar la app. */
  let saveTimer = null, savePending = false;
  function save() {
    savePending = true;
    if (saveTimer == null) saveTimer = setTimeout(flushSave, 250);
  }
  function flushSave() {
    if (saveTimer != null) { clearTimeout(saveTimer); saveTimer = null; }
    if (!savePending) return;
    savePending = false;
    Store.set(JSON.stringify(state));
  }

  /* ---------- Fechas y períodos ---------- */
  function dayKey(d) {
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  }
  function startOfWeekMon(d) {
    const x = new Date(d); x.setHours(0, 0, 0, 0);
    const day = (x.getDay() + 6) % 7; // 0 = lunes
    x.setDate(x.getDate() - day);
    return x;
  }
  function periodKeyFor(period, d) {
    switch (period) {
      case "diaria": return "D" + dayKey(d);
      case "semanal": return "W" + dayKey(startOfWeekMon(d));
      case "mensual": return "M" + d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
      case "semestral": return "S" + d.getFullYear() + "-" + (d.getMonth() < 6 ? 1 : 2);
      case "anual": return "Y" + d.getFullYear();
      default: return "D" + dayKey(d);
    }
  }
  function shortPeriodLabel(key) {
    const t = key[0], rest = key.slice(1);
    if (t === "M") return rest.split("-")[1] || rest;
    if (t === "Y") return rest;
    if (t === "S") return "S" + (rest.split("-")[1] || "");
    if (t === "W") return rest.slice(8);
    return rest.slice(-2);
  }

  /* ---------- Reset por período (puro sobre el estado) ---------- */
  function applyResets() {
    const now = new Date();
    let changed = false;
    for (const g of state.goals) {
      const nowKey = periodKeyFor(g.period, now);
      if (!g.periodKey) { g.periodKey = nowKey; changed = true; continue; }
      if (g.periodKey !== nowKey) {
        const completed = isGoalDone(g);
        if (g.period === "diaria") {
          const endedDay = g.periodKey.slice(1);
          g.dayHistory.push({ key: endedDay, completed, value: g.type === "numerica" ? g.current : (completed ? 1 : 0) });
          if (g.dayHistory.length > 400) g.dayHistory = g.dayHistory.slice(-400);
        } else {
          g.periodHistory.push({
            key: g.periodKey, completed,
            value: g.type === "numerica" ? g.current : (completed ? 1 : 0),
            target: g.type === "numerica" ? g.target : 1
          });
          if (g.periodHistory.length > 60) g.periodHistory = g.periodHistory.slice(-60);
        }
        g.done = false;
        if (g.type === "numerica") g.current = 0;
        g.periodKey = nowKey;
        changed = true;
      }
    }
    if (changed) save();
    return changed;
  }

  /* ---------- Cálculos puros sobre metas ---------- */
  function isGoalDone(g) {
    return g.type === "habito" ? !!g.done : (g.target > 0 && g.current >= g.target);
  }
  function goalProgress(g) {
    return g.type === "habito" ? (g.done ? 1 : 0) : (g.target > 0 ? clamp(g.current / g.target, 0, 1) : 0);
  }
  function smartStep(target) {
    target = Math.abs(num(target));
    if (target <= 10) return 1;
    if (target <= 100) return 5;
    if (target <= 1000) return 25;
    if (target <= 10000) return 100;
    return 1000;
  }
  function computeStreak(g) {
    if (g.period !== "diaria") return 0;
    const map = new Map(g.dayHistory.map(d => [d.key, !!d.completed]));
    let streak = 0;
    if (isGoalDone(g)) streak++;
    const cur = new Date(); cur.setDate(cur.getDate() - 1);
    for (let k = 0; k < 400; k++) {
      if (map.get(dayKey(cur)) === true) { streak++; cur.setDate(cur.getDate() - 1); }
      else break;
    }
    return streak;
  }
  function computeBestStreak(g) {
    if (g.period !== "diaria") return 0;
    const days = g.dayHistory.filter(d => d.completed).map(d => d.key).sort();
    let best = 0, run = 0, prev = null;
    for (const key of days) {
      if (prev) {
        const pd = new Date(prev + "T00:00:00"); pd.setDate(pd.getDate() + 1);
        run = dayKey(pd) === key ? run + 1 : 1;
      } else run = 1;
      best = Math.max(best, run); prev = key;
    }
    return Math.max(best, computeStreak(g), g.bestStreak || 0);
  }

  /* ---------- Cálculos puros de finanzas ---------- */
  function financeTotals() {
    const f = state.finance;
    const income = nonneg(num(f.salary)) + f.extraIncome.reduce((a, e) => a + nonneg(num(e.amount)), 0);
    const expenses = f.fixedExpenses.reduce((a, e) => a + nonneg(num(e.amount)), 0);
    return { income, expenses, free: income - expenses };
  }
  function expensesByCategory() {
    const m = {};
    for (const e of state.finance.fixedExpenses) {
      const k = CAT_BY_KEY[e.category] ? e.category : "otros";
      m[k] = (m[k] || 0) + nonneg(num(e.amount));
    }
    return CATEGORIES.filter(c => m[c.key] > 0).map(c => ({ key: c.key, label: c.label, color: c.color, value: m[c.key] }));
  }
  function rule503020() {
    const S = nonneg(num(state.finance.salary));
    const t = financeTotals();
    let realNec = 0, realGus = 0;
    for (const e of state.finance.fixedExpenses) {
      const c = CAT_BY_KEY[e.category];
      if (c && c.bucket === "nec") realNec += nonneg(num(e.amount));
      else realGus += nonneg(num(e.amount));
    }
    return {
      salary: S,
      rows: [
        { key: "nec", label: "Necesidades", ico: "home", budget: S * 0.5, real: realNec, color: "#5b8def", goodWhenUnder: true },
        { key: "gus", label: "Gustos", ico: "sparkles", budget: S * 0.3, real: realGus, color: "#ff8fab", goodWhenUnder: true },
        { key: "aho", label: "Ahorro / inversión", ico: "wallet", budget: S * 0.2, real: t.free, color: "#6bcf7f", goodWhenUnder: false }
      ]
    };
  }

  /* ---------- Cálculos puros de calculadoras ---------- */
  function calcCompound(p, m, ratePct, years) {
    p = nonneg(p); m = nonneg(m); years = Math.max(0, Math.round(years));
    const i = ratePct / 100 / 12, n = years * 12;
    let bal = p, contributed = p;
    const points = [{ year: 0, total: p, contrib: p }];
    const rows = [];
    for (let month = 1; month <= n; month++) {
      bal = i === 0 ? bal + m : bal * (1 + i) + m;
      contributed += m;
      if (month % 12 === 0) {
        const yr = month / 12;
        points.push({ year: yr, total: bal, contrib: contributed });
        rows.push({ year: yr, contrib: contributed, total: bal, interest: bal - contributed });
      }
    }
    return { fv: bal, contributed, interest: bal - contributed, points, rows };
  }
  function calcEmergency(gastos, meses, tengo, ahorroMes) {
    gastos = nonneg(gastos); tengo = nonneg(tengo); ahorroMes = nonneg(ahorroMes);
    const objetivo = gastos * Math.max(0, meses);
    const falta = Math.max(0, objetivo - tengo);
    const mesesParaLlegar = falta <= 0 ? 0 : (ahorroMes > 0 ? Math.ceil(falta / ahorroMes) : Infinity);
    const cobertura = gastos > 0 ? tengo / gastos : 0;
    return { objetivo, falta, mesesParaLlegar, cobertura };
  }
  function calcSavingsPerMonth(objetivo, meses, tengo) {
    const falta = Math.max(0, nonneg(objetivo) - nonneg(tengo));
    return meses > 0 ? falta / meses : Infinity;
  }
  function calcSavingsWhen(objetivo, ahorroMes, tengo) {
    const falta = Math.max(0, nonneg(objetivo) - nonneg(tengo));
    if (falta <= 0) return 0;
    return ahorroMes > 0 ? Math.ceil(falta / ahorroMes) : Infinity;
  }
  function calcHourly(salaryMonthly, horasSemana) {
    const weeks = 4.333;
    const horasMes = nonneg(horasSemana) * weeks;
    return horasMes > 0 ? nonneg(salaryMonthly) / horasMes : 0;
  }

  /* ---------- Formato ---------- */
  function money(n) {
    n = isFinite(n) ? n : 0;
    const cur = state.finance.currency;
    try {
      return n.toLocaleString("es-UY", { style: "currency", currency: cur, minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } catch (e) {
      return (cur === "USD" ? "US$ " : "$ ") + Math.round(n).toLocaleString("es-UY");
    }
  }
  function fmtNum(n) {
    n = num(n);
    return Number.isInteger(n) ? n.toLocaleString("es-UY")
      : n.toLocaleString("es-UY", { maximumFractionDigits: 2 });
  }
  function fmtMonths(m) {
    if (!isFinite(m)) return "—";
    if (m <= 0) return "ya está";
    const y = Math.floor(m / 12), r = m % 12;
    if (y <= 0) return m + (m === 1 ? " mes" : " meses");
    if (r === 0) return y + (y === 1 ? " año" : " años");
    return y + (y === 1 ? " año" : " años") + " y " + r + (r === 1 ? " mes" : " meses");
  }

  /* ============================================================
     GRÁFICAS — Chart.js si está disponible (CDN, cacheado por el
     SW para offline); si no cargó, caemos a los SVG hechos a mano.
     ============================================================ */
  const Charts = {};
  function hasChartJS() { return typeof window.Chart === "function"; }
  function destroyChart(key) {
    if (Charts[key]) { Charts[key].destroy(); delete Charts[key]; }
  }
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function hexA(hex, a) {
    const h = hex.replace("#", "");
    const v = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
    const n = parseInt(v, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }
  function moneyShort(n) {
    const s = n < 0 ? "-" : "";
    n = Math.abs(n);
    if (n >= 1e6) return s + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return s + Math.round(n / 1e3) + "k";
    return s + Math.round(n);
  }
  function setupChartDefaults() {
    if (!hasChartJS()) return;
    Chart.defaults.font.family = "'Outfit', -apple-system, 'Segoe UI', sans-serif";
    Chart.defaults.font.weight = 600;
    Chart.defaults.animation.duration = prefersReduced() ? 0 : 700;
  }
  function chartTooltipStyle() {
    return {
      backgroundColor: cssVar("--surface-3") || "#352a4f",
      titleColor: cssVar("--text"),
      bodyColor: cssVar("--text"),
      borderColor: cssVar("--border-strong"),
      borderWidth: 1,
      padding: 10,
      cornerRadius: 12,
      displayColors: true,
      boxPadding: 4
    };
  }
  function donutCenterPlugin() {
    return {
      id: "donutCenter",
      afterDraw(chart) {
        const total = chart.data.datasets[0].data.reduce((a, v) => a + v, 0);
        const { left, right, top, bottom } = chart.chartArea;
        const x = (left + right) / 2, y = (top + bottom) / 2;
        const ctx = chart.ctx;
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = cssVar("--text");
        ctx.font = "800 16px 'Outfit', sans-serif";
        ctx.fillText(money(total), x, y - 8);
        ctx.fillStyle = cssVar("--muted");
        ctx.font = "600 10px 'Outfit', sans-serif";
        ctx.fillText("gastos/mes", x, y + 12);
        ctx.restore();
      }
    };
  }
  function mountDonut() {
    const cv = $("#donutChart");
    if (!cv || !hasChartJS()) return;
    destroyChart("donut");
    const segs = expensesByCategory();
    const total = segs.reduce((a, s) => a + s.value, 0);
    if (total <= 0) return;
    Charts.donut = new Chart(cv, {
      type: "doughnut",
      data: {
        labels: segs.map(s => s.label),
        datasets: [{
          data: segs.map(s => s.value),
          backgroundColor: segs.map(s => s.color),
          borderWidth: 0,
          hoverOffset: 10,
          borderRadius: 7,
          spacing: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        layout: { padding: 8 },
        plugins: {
          legend: { display: false },
          tooltip: Object.assign(chartTooltipStyle(), {
            callbacks: {
              // El total se recalcula acá (y no desde el closure) porque los
              // datos del chart se actualizan en el lugar sin remontarlo.
              label: (ctx) => {
                const tot = ctx.dataset.data.reduce((a, v) => a + v, 0) || 1;
                return " " + money(ctx.parsed) + " · " + Math.round(ctx.parsed / tot * 100) + "%";
              }
            }
          })
        }
      },
      plugins: [donutCenterPlugin()]
    });
  }
  function mountLineChart(points) {
    const cv = $("#lineChart");
    if (!cv || !hasChartJS()) return;
    // Si el chart ya vive en este canvas, actualizamos los datos en el lugar:
    // destruir/recrear en cada tick del slider re-anima todo y traba el arrastre.
    const live = Charts.line;
    if (live && live.canvas === cv) {
      live.data.labels = points.map(p => "año " + p.year);
      live.data.datasets[0].data = points.map(p => Math.round(p.total));
      live.data.datasets[1].data = points.map(p => Math.round(p.contrib));
      live.update("none");
      return;
    }
    destroyChart("line");
    const coral = cssVar("--coral") || "#ff6b6b";
    Charts.line = new Chart(cv, {
      type: "line",
      data: {
        labels: points.map(p => "año " + p.year),
        datasets: [
          {
            label: "Con interés",
            data: points.map(p => Math.round(p.total)),
            borderColor: coral,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: coral,
            tension: 0.35,
            fill: true,
            backgroundColor(c) {
              const area = c.chart.chartArea;
              if (!area) return hexA(coral, 0.18);
              const g = c.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
              g.addColorStop(0, hexA(coral, 0.35));
              g.addColorStop(1, hexA(coral, 0));
              return g;
            }
          },
          {
            label: "Solo aportes",
            data: points.map(p => Math.round(p.contrib)),
            borderColor: cssVar("--muted") || "#b3a8cc",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.35,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: cssVar("--faint"), maxTicksLimit: 6, font: { size: 10 } }
          },
          y: {
            grid: { color: cssVar("--border") || "rgba(255,255,255,.09)" },
            border: { display: false },
            ticks: { color: cssVar("--faint"), callback: (v) => moneyShort(v), font: { size: 10 } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: Object.assign(chartTooltipStyle(), {
            callbacks: { label: (ctx) => " " + ctx.dataset.label + ": " + money(ctx.parsed.y) }
          })
        }
      }
    });
  }

  /* ============================================================
     GRÁFICAS SVG (hechas a mano — fallback sin red)
     ============================================================ */
  function svgRing(pct, size, stroke) {
    size = size || 132; stroke = stroke || 13;
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - clamp(pct, 0, 1));
    return `<svg class="chart" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Progreso ${Math.round(pct * 100)}%">
      <defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="var(--coral)"/><stop offset="1" stop-color="var(--amber)"/>
      </linearGradient></defs>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--track)" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="url(#ringGrad)" stroke-width="${stroke}"
        stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}"
        transform="rotate(-90 ${size / 2} ${size / 2})" style="transition: stroke-dashoffset .8s var(--ease)"/>
    </svg>`;
  }
  function svgDonut(segments, size, stroke) {
    size = size || 150; stroke = stroke || 24;
    const r = (size - stroke) / 2, c = 2 * Math.PI * r;
    const total = segments.reduce((a, s) => a + s.value, 0);
    if (total <= 0) {
      return `<svg class="chart" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--track)" stroke-width="${stroke}"/></svg>`;
    }
    let off = 0, parts = "";
    for (const s of segments) {
      const dash = (s.value / total) * c;
      parts += `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${s.color}"
        stroke-width="${stroke}" stroke-dasharray="${dash.toFixed(2)} ${(c - dash).toFixed(2)}"
        stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})"
        style="transition: stroke-dasharray .6s var(--ease)"/>`;
      off += dash;
    }
    return `<svg class="chart" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Distribución de gastos">
      ${parts}
      <text x="${size / 2}" y="${size / 2 - 4}" text-anchor="middle" class="donut-center" fill="var(--text)" font-size="13" font-weight="800">${esc(money(total))}</text>
      <text x="${size / 2}" y="${size / 2 + 13}" text-anchor="middle" fill="var(--muted)" font-size="9">gastos/mes</text>
    </svg>`;
  }
  function svgLineChart(points) {
    const W = 320, H = 180, pl = 6, pr = 6, pt = 12, pb = 22;
    const n = points.length;
    const maxY = Math.max(1, ...points.map(p => p.total));
    const X = (i) => pl + (n > 1 ? i / (n - 1) : 0) * (W - pl - pr);
    const Y = (v) => pt + (1 - v / maxY) * (H - pt - pb);
    const path = (sel) => points.map((p, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(sel(p)).toFixed(1)}`).join(" ");
    const lineTotal = path(p => p.total);
    const lineContrib = path(p => p.contrib);
    const area = `M${X(0).toFixed(1)} ${Y(0).toFixed(1)} ` +
      points.map((p, i) => `L${X(i).toFixed(1)} ${Y(p.total).toFixed(1)}`).join(" ") +
      ` L${X(n - 1).toFixed(1)} ${Y(0).toFixed(1)} Z`;
    let grid = "";
    for (let g = 0; g <= 2; g++) {
      const v = maxY * g / 2, y = Y(v);
      grid += `<line class="grid-line" x1="${pl}" y1="${y.toFixed(1)}" x2="${W - pr}" y2="${y.toFixed(1)}"/>
        <text class="axis-lbl" x="${pl + 2}" y="${(y - 3).toFixed(1)}">${esc(money(v))}</text>`;
    }
    let xl = "";
    const lastYear = points[n - 1] ? points[n - 1].year : 0;
    [0, Math.round(lastYear / 2), lastYear].forEach((yr, idx) => {
      const i = idx === 0 ? 0 : (idx === 2 ? n - 1 : Math.round((n - 1) / 2));
      xl += `<text class="axis-lbl" x="${X(i).toFixed(1)}" y="${H - 6}" text-anchor="${idx === 0 ? "start" : idx === 2 ? "end" : "middle"}">año ${yr}</text>`;
    });
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Evolución del ahorro">
      <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--coral)" stop-opacity="0.35"/>
        <stop offset="1" stop-color="var(--coral)" stop-opacity="0"/>
      </linearGradient></defs>
      ${grid}
      ${xl}
      <path class="area" d="${area}"/>
      <path class="line contrib" d="${lineContrib}"/>
      <path class="line" d="${lineTotal}"/>
      <circle class="dot" cx="${X(n - 1).toFixed(1)}" cy="${Y(points[n - 1].total).toFixed(1)}" r="3.5"/>
    </svg>`;
  }
  function miniBars(g) {
    const now = new Date();
    const map = new Map(g.dayHistory.map(d => [d.key, d]));
    const WD = ["D", "L", "M", "M", "J", "V", "S"];
    let html = "";
    for (let off = 6; off >= 0; off--) {
      const d = new Date(now); d.setDate(d.getDate() - off);
      const key = dayKey(d), isToday = off === 0;
      let val, done;
      if (isToday) { val = g.type === "numerica" ? g.current : (g.done ? 1 : 0); done = isGoalDone(g); }
      else { const h = map.get(key); val = h ? h.value : 0; done = h ? h.completed : false; }
      const denom = g.type === "numerica" ? (g.target || 1) : 1;
      const h = clamp(val / denom, 0, 1);
      html += `<div class="mb"><i class="${done ? "on" : ""} ${isToday ? "today" : ""}" style="height:${Math.max(8, h * 100).toFixed(0)}%"></i><span>${WD[d.getDay()]}</span></div>`;
    }
    return `<div class="mini-bars" aria-label="Últimos 7 días">${html}</div>`;
  }
  function periodBars(g) {
    const hist = g.periodHistory.slice(-6);
    if (!hist.length) return "";
    let html = "";
    for (const h of hist) {
      const ratio = clamp((h.value || 0) / (h.target || 1), 0, 1);
      html += `<div class="mb"><i class="${h.completed ? "on" : ""}" style="height:${Math.max(8, ratio * 100).toFixed(0)}%"></i><span>${esc(shortPeriodLabel(h.key))}</span></div>`;
    }
    return `<div class="mini-bars" aria-label="Historial de períodos">${html}</div>`;
  }

  /* ============================================================
     RENDER: METAS
     ============================================================ */
  function sortedGoals() { return state.goals.slice().sort((a, b) => a.order - b.order); }

  function dashHTML(goals) {
    const total = goals.length;
    const doneCount = goals.filter(isGoalDone).length;
    const progress = total ? goals.reduce((a, g) => a + goalProgress(g), 0) / total : 0;
    const best = goals.filter(g => g.period === "diaria").reduce((a, g) => Math.max(a, computeBestStreak(g)), 0);
    return `<div class="card dash">
      <div class="ring-wrap">${svgRing(progress)}
        <div class="ring-center"><span class="pct">${Math.round(progress * 100)}%</span><span class="pct-lbl">Global</span></div>
      </div>
      <div class="stats">
        <div class="stat"><div class="num">${total}</div><div class="lbl">Metas activas</div></div>
        <div class="stat"><div class="num" style="color:var(--good)">${doneCount}</div><div class="lbl">Completadas</div></div>
        <div class="stat"><div class="num fire">${icon("flame", 18)} ${best}</div><div class="lbl">Mejor racha</div></div>
        <div class="stat"><div class="num">${total - doneCount}</div><div class="lbl">Pendientes</div></div>
      </div>
    </div>`;
  }

  function renderMetas() {
    const panel = $("#panel-metas");
    const goals = sortedGoals();
    const total = goals.length;

    const header = `<div class="section-title"><h2>Mis metas</h2>
      <button class="btn primary sm" data-act="new-goal">＋ Nueva meta</button></div>`;

    let list;
    if (!total) {
      list = `<div class="empty"><div class="big">${icon("target", 44)}</div>
        <p>Todavía no tenés metas.<br>Arrancá creando la primera.</p>
        <button class="btn primary" data-act="new-goal" style="margin-top:8px">Crear meta</button></div>`;
    } else {
      list = `<div class="goal-list" id="goalList">${goals.map((g, i) => goalCard(g, i, total)).join("")}</div>`;
    }

    panel.innerHTML = `<div id="metasDash">${dashHTML(goals)}</div>` + header + list;
    bindGoalDnD();
  }

  // Actualización puntual: redibujar todo el panel en cada +/− o check
  // parpadea y pierde la posición de scroll; reemplazamos solo la tarjeta.
  function updateGoalCard(g) {
    const list = $("#goalList");
    const old = list && $(`.goal[data-id="${g.id}"]`, list);
    if (!old) { renderMetas(); return; }
    const goals = sortedGoals();
    const i = goals.findIndex(x => x.id === g.id);
    const tmp = document.createElement("div");
    tmp.innerHTML = goalCard(g, i, goals.length);
    const fresh = tmp.firstElementChild;
    old.replaceWith(fresh);
    bindCardDnD(fresh, list);
    const dash = $("#metasDash");
    if (dash) dash.innerHTML = dashHTML(goals);
  }

  function goalCard(g, i, total) {
    const done = isGoalDone(g);
    const streak = computeStreak(g);
    let body;
    if (g.type === "habito") {
      body = `<button class="habit-toggle ${g.done ? "done" : ""}" data-act="toggle" data-id="${g.id}">
        ${g.done ? icon("check", 17) + " ¡Hecho por hoy!" : "Marcar como hecho"}</button>`;
    } else {
      const pc = g.target > 0 ? Math.round(clamp(g.current / g.target, 0, 1) * 100) : 0;
      const step = smartStep(g.target);
      body = `<div class="goal-progress-line">
          <span class="val">${fmtNum(g.current)} <small>/ ${fmtNum(g.target)} ${esc(g.unit)}</small></span>
          <span class="pc">${pc}%</span></div>
        <div class="bar"><i style="width:${pc}%"></i></div>
        <div class="num-controls">
          <button class="step-btn" data-act="dec" data-id="${g.id}" aria-label="Restar ${step}">−</button>
          <input type="number" inputmode="decimal" value="${g.current}" data-act="set" data-id="${g.id}" aria-label="Valor actual de ${esc(g.title)}"/>
          <button class="step-btn" data-act="inc" data-id="${g.id}" aria-label="Sumar ${step}">＋</button>
        </div>`;
    }
    let hist = "";
    if (g.period === "diaria") hist = miniBars(g);
    else if (g.periodHistory.length) hist = periodBars(g);

    return `<article class="goal" style="--g:${g.color}" draggable="true" data-id="${g.id}">
      <div class="goal-head">
        <span class="drag-handle" data-handle title="Arrastrar para reordenar" aria-hidden="true">⠿</span>
        <span class="goal-emoji">${icon(g.icon, 25)}</span>
        <div class="goal-info">
          <div class="goal-title">${esc(g.title)} ${streak > 0 ? `<span class="streak">${icon("flame", 13)} ${streak}</span>` : ""}</div>
          <div class="goal-meta">
            <span class="chip">${PERIOD_LABEL[g.period]}</span>
            <span class="chip">${g.type === "habito" ? "Hábito" : "Numérica"}</span>
            ${done ? '<span class="chip" style="color:var(--good)">✓ Completa</span>' : ""}
          </div>
        </div>
        <div class="goal-actions">
          <div class="move-btns">
            <button data-act="up" data-id="${g.id}" ${i === 0 ? "disabled" : ""} aria-label="Subir">▲</button>
            <button data-act="down" data-id="${g.id}" ${i === total - 1 ? "disabled" : ""} aria-label="Bajar">▼</button>
          </div>
          <button class="icon-btn" data-act="edit" data-id="${g.id}" aria-label="Editar ${esc(g.title)}">${icon("pencil", 16)}</button>
        </div>
      </div>
      <div class="goal-body">${body}${hist}</div>
    </article>`;
  }

  /* ----- Acciones sobre metas ----- */
  function findGoal(id) { return state.goals.find(g => g.id === id); }

  function stepGoal(id, dir) {
    const g = findGoal(id); if (!g || g.type !== "numerica") return;
    const before = isGoalDone(g);
    const step = smartStep(g.target);
    g.current = nonneg(num(g.current) + dir * step);
    afterGoalChange(g, before);
  }
  function setGoalValue(id, value) {
    const g = findGoal(id); if (!g || g.type !== "numerica") return;
    const before = isGoalDone(g);
    g.current = nonneg(num(value));
    afterGoalChange(g, before);
  }
  function toggleGoal(id) {
    const g = findGoal(id); if (!g || g.type !== "habito") return;
    const before = isGoalDone(g);
    g.done = !g.done;
    afterGoalChange(g, before);
  }
  function afterGoalChange(g, wasDone) {
    if (g.period === "diaria") g.bestStreak = Math.max(g.bestStreak || 0, computeStreak(g));
    save();
    updateGoalCard(g);
    if (!wasDone && isGoalDone(g)) celebrate(g);
  }
  function moveGoal(id, dir) {
    const sorted = sortedGoals();
    const idx = sorted.findIndex(g => g.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= sorted.length) return;
    const a = sorted[idx], b = sorted[swap];
    const tmp = a.order; a.order = b.order; b.order = tmp;
    save(); renderMetas();
  }
  function reorderGoals(draggedId, targetId) {
    if (draggedId === targetId) return;
    const sorted = sortedGoals();
    const from = sorted.findIndex(g => g.id === draggedId);
    const to = sorted.findIndex(g => g.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = sorted.splice(from, 1);
    sorted.splice(to, 0, moved);
    sorted.forEach((g, i) => g.order = i);
    save(); renderMetas();
  }

  /* ----- Drag & drop (escritorio) ----- */
  let dragId = null;
  function bindGoalDnD() {
    const list = $("#goalList");
    if (!list) return;
    $$(".goal", list).forEach(card => bindCardDnD(card, list));
  }
  function bindCardDnD(card, list) {
    card.addEventListener("dragstart", (e) => {
      dragId = card.dataset.id; card.classList.add("dragging");
      if (e.dataTransfer) { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", dragId); }
    });
    card.addEventListener("dragend", () => {
      dragId = null; $$(".goal", list).forEach(c => c.classList.remove("dragging", "drag-over"));
    });
    card.addEventListener("dragover", (e) => { e.preventDefault(); card.classList.add("drag-over"); });
    card.addEventListener("dragleave", () => card.classList.remove("drag-over"));
    card.addEventListener("drop", (e) => {
      e.preventDefault(); card.classList.remove("drag-over");
      const id = dragId || (e.dataTransfer && e.dataTransfer.getData("text/plain"));
      if (id) reorderGoals(id, card.dataset.id);
    });
  }

  /* ----- Editor de meta (bottom-sheet) ----- */
  function openGoalEditor(existing) {
    const isNew = !existing;
    const draft = existing ? JSON.parse(JSON.stringify(existing)) : {
      id: uid(), title: "", icon: "target", color: COLORS[0], period: "diaria",
      type: "habito", unit: "", target: 1, current: 0, order: state.goals.length,
      dayHistory: [], periodHistory: [], bestStreak: 0, periodKey: null
    };

    const body = `
      <label class="field"><span class="lbl">Título</span>
        <input type="text" id="ed-title" maxlength="60" placeholder="Ej: Salir a correr" value="${esc(draft.title)}"></label>

      <div class="field"><span class="lbl">Ícono</span>
        <div class="picker" id="ed-icon">${GOAL_ICONS.map(k =>
          `<button type="button" class="opt" data-icon="${k}" aria-pressed="${k === draft.icon}" aria-label="Ícono ${k}">${icon(k, 21)}</button>`).join("")}</div>
      </div>

      <div class="field"><span class="lbl">Color</span>
        <div class="picker colors" id="ed-color">${COLORS.map(c =>
          `<button type="button" class="opt" data-color="${c}" aria-pressed="${c === draft.color}" aria-label="Color"><span class="swatch" style="background:${c}"></span></button>`).join("")}</div>
      </div>

      <label class="field"><span class="lbl">Período</span>
        <select id="ed-period">${PERIODS.map(p =>
          `<option value="${p.k}" ${p.k === draft.period ? "selected" : ""}>${p.label}</option>`).join("")}</select></label>

      <div class="field"><span class="lbl">Tipo</span>
        <div class="seg" id="ed-type">
          <button type="button" data-type="habito" aria-pressed="${draft.type === "habito"}">Hábito (sí/no)</button>
          <button type="button" data-type="numerica" aria-pressed="${draft.type === "numerica"}">Numérica</button>
        </div>
      </div>

      <div id="ed-num" class="row" style="${draft.type === "numerica" ? "" : "display:none"}">
        <label class="field" style="flex:1"><span class="lbl">Objetivo</span>
          <input type="number" id="ed-target" inputmode="decimal" min="0" step="any" value="${draft.target}"></label>
        <label class="field" style="flex:1"><span class="lbl">Unidad</span>
          <input type="text" id="ed-unit" maxlength="16" placeholder="km, libros, $…" value="${esc(draft.unit)}"></label>
      </div>`;

    const footer = `
      ${isNew ? "" : `<button class="btn danger" id="ed-delete">${icon("trash", 15)} Borrar</button>`}
      <button class="btn primary" id="ed-save">${isNew ? "Crear meta" : "Guardar"}</button>`;

    openSheet({
      title: isNew ? "Nueva meta" : "Editar meta",
      bodyHTML: body,
      footerHTML: footer,
      onMount(sheet) {
        $("#ed-title", sheet).addEventListener("input", e => draft.title = e.target.value);
        $("#ed-icon", sheet).addEventListener("click", e => {
          const b = e.target.closest("[data-icon]"); if (!b) return;
          draft.icon = b.dataset.icon;
          $$("#ed-icon .opt", sheet).forEach(o => o.setAttribute("aria-pressed", o === b));
        });
        $("#ed-color", sheet).addEventListener("click", e => {
          const b = e.target.closest("[data-color]"); if (!b) return;
          draft.color = b.dataset.color;
          $$("#ed-color .opt", sheet).forEach(o => o.setAttribute("aria-pressed", o === b));
        });
        $("#ed-period", sheet).addEventListener("change", e => draft.period = e.target.value);
        $("#ed-type", sheet).addEventListener("click", e => {
          const b = e.target.closest("[data-type]"); if (!b) return;
          draft.type = b.dataset.type;
          $$("#ed-type button", sheet).forEach(o => o.setAttribute("aria-pressed", o === b));
          $("#ed-num", sheet).style.display = draft.type === "numerica" ? "" : "none";
        });
        $("#ed-target", sheet).addEventListener("input", e => draft.target = num(e.target.value, 0));
        $("#ed-unit", sheet).addEventListener("input", e => draft.unit = e.target.value);

        $("#ed-save", sheet).addEventListener("click", () => {
          if (!draft.title.trim()) { toast("Poné un título para la meta.", "bad"); $("#ed-title", sheet).focus(); return; }
          if (draft.type === "numerica" && !(num(draft.target) > 0)) { toast("El objetivo tiene que ser mayor a 0.", "bad"); $("#ed-target", sheet).focus(); return; }
          const clean = normalizeGoal(draft);
          clean.periodKey = periodKeyFor(clean.period, new Date());
          if (isNew) state.goals.push(clean);
          else {
            const idx = state.goals.findIndex(g => g.id === clean.id);
            // Preservamos historial si cambia el tipo/período.
            clean.dayHistory = state.goals[idx].dayHistory;
            clean.periodHistory = state.goals[idx].periodHistory;
            clean.order = state.goals[idx].order;
            state.goals[idx] = clean;
          }
          save(); closeSheet(); renderMetas();
          toast(isNew ? "Meta creada" : "Meta actualizada", "good");
        });

        const del = $("#ed-delete", sheet);
        if (del) del.addEventListener("click", async () => {
          const ok = await confirmDialog({
            title: "¿Borrar esta meta?",
            message: "Se pierde su historial y sus rachas.",
            okLabel: "Borrar meta", danger: true
          });
          if (!ok) return;
          state.goals = state.goals.filter(g => g.id !== draft.id);
          save(); closeSheet(); renderMetas();
          toast("Meta borrada", "bad");
        });

        const t = $("#ed-title", sheet); if (isNew && t) t.focus();
      }
    });
  }

  /* ============================================================
     RENDER: FINANZAS
     ============================================================ */
  function renderFinanzas() {
    const panel = $("#panel-finanzas");
    const f = state.finance;

    const incomeRows = f.extraIncome.map(e => `
      <div class="list-row" data-id="${e.id}">
        <input type="text" class="nm" data-fin="inc-name" placeholder="Ej: Changa, propina" value="${esc(e.name)}" maxlength="30">
        <input type="number" class="amt" data-fin="inc-amount" inputmode="decimal" min="0" placeholder="0" value="${e.amount || ""}">
        <button class="del" data-fin="inc-del" aria-label="Quitar ingreso">✕</button>
      </div>`).join("");

    const expenseRows = f.fixedExpenses.map(e => `
      <div class="list-row" data-id="${e.id}">
        <input type="text" class="nm" data-fin="exp-name" placeholder="Nombre del gasto" value="${esc(e.name)}" maxlength="30">
        <input type="number" class="amt" data-fin="exp-amount" inputmode="decimal" min="0" placeholder="0" value="${e.amount || ""}">
        <select class="cat" data-fin="exp-cat" aria-label="Categoría">
          ${CATEGORIES.map(c => `<option value="${c.key}" ${c.key === e.category ? "selected" : ""}>${c.label}</option>`).join("")}
        </select>
        <button class="del" data-fin="exp-del" aria-label="Quitar gasto">✕</button>
      </div>`).join("");

    panel.innerHTML = `
      <div id="finKpis">${kpisHTML()}</div>

      <div class="section-title"><h2>${icon("banknote", 17)} Ingresos</h2><span class="hint">por mes</span></div>
      <div class="card">
        <label class="field"><span class="lbl">Sueldo mensual</span>
          <input type="number" id="fin-salary" inputmode="decimal" min="0" placeholder="0" value="${f.salary || ""}"></label>
        <span class="lbl" style="display:block;margin-bottom:6px">Ingresos extra</span>
        <div id="fin-income-list">${incomeRows || '<p style="color:var(--faint);font-size:.85rem;margin:2px 0 10px">Sin ingresos extra todavía.</p>'}</div>
        <button class="btn sm" data-fin="inc-add">＋ Agregar ingreso</button>
        <label class="field" style="margin-top:16px"><span class="lbl">Moneda</span>
          <select id="fin-currency">
            <option value="UYU" ${f.currency === "UYU" ? "selected" : ""}>Pesos uruguayos ($ UYU)</option>
            <option value="USD" ${f.currency === "USD" ? "selected" : ""}>Dólares (US$)</option>
          </select></label>
      </div>

      <div class="section-title"><h2>${icon("receipt", 17)} Gastos fijos</h2><span class="hint">por mes</span></div>
      <div class="card">
        <div id="fin-expense-list">${expenseRows || '<p style="color:var(--faint);font-size:.85rem;margin:2px 0 10px">Sin gastos cargados.</p>'}</div>
        <button class="btn sm" data-fin="exp-add">＋ Agregar gasto</button>
      </div>

      <div class="section-title"><h2>${icon("pie", 17)} ¿En qué se te va?</h2></div>
      <div class="card" id="finDonut">${donutHTML()}</div>

      <div class="section-title"><h2>${icon("scale", 17)} Regla 50 / 30 / 20</h2><span class="hint">sobre el sueldo</span></div>
      <div class="card" id="finRule">${ruleHTML()}</div>
    `;
    mountDonut();
  }

  function kpisHTML() {
    const t = financeTotals();
    return `<div class="kpi-grid">
      <div class="kpi"><div class="lbl">Ingresos</div><div class="v">${money(t.income)}</div></div>
      <div class="kpi"><div class="lbl">Gastos</div><div class="v">${money(t.expenses)}</div></div>
      <div class="kpi free"><div class="lbl">Plata libre del mes</div>
        <div class="v ${t.free >= 0 ? "pos" : "neg"}">${money(t.free)}</div></div>
    </div>`;
  }
  function donutLegendHTML(segs) {
    const total = segs.reduce((a, s) => a + s.value, 0) || 1;
    return segs.map(s => `<div class="li"><span class="dot" style="background:${s.color}"></span>
      ${esc(s.label)} <span class="amt">${money(s.value)} · ${Math.round(s.value / total * 100)}%</span></div>`).join("");
  }
  function donutHTML() {
    const segs = expensesByCategory();
    if (!segs.length) return '<p style="color:var(--muted);margin:0">Cargá gastos para ver la distribución.</p>';
    const graphic = hasChartJS()
      ? '<div class="donut-box"><canvas id="donutChart" role="img" aria-label="Distribución de gastos"></canvas></div>'
      : `<div>${svgDonut(segs)}</div>`;
    return `<div class="donut-wrap">${graphic}<div class="legend" id="donutLegend" style="flex:1;min-width:160px">${donutLegendHTML(segs)}</div></div>`;
  }
  // Mientras se tipea un monto, actualizamos los datos del chart en el lugar;
  // solo remontamos si cambió la forma (categorías que aparecen/desaparecen).
  function refreshDonut(host) {
    const segs = expensesByCategory();
    const chart = Charts.donut, legend = $("#donutLegend", host);
    const sameShape = chart && legend && segs.length &&
      chart.data.labels.length === segs.length &&
      chart.data.labels.every((l, i) => l === segs[i].label);
    if (sameShape) {
      chart.data.datasets[0].data = segs.map(s => s.value);
      chart.update("none");
      legend.innerHTML = donutLegendHTML(segs);
    } else {
      host.innerHTML = donutHTML();
      mountDonut();
    }
  }
  function ruleHTML() {
    const r = rule503020();
    if (r.salary <= 0) return '<p style="color:var(--muted);margin:0">Cargá tu sueldo para ver la regla 50/30/20.</p>';
    const rows = r.rows.map(row => {
      const scale = Math.max(row.real, row.budget, 1);
      const realW = clamp(row.real / scale, 0, 1) * 100;
      const markW = clamp(row.budget / scale, 0, 1) * 100;
      const ok = row.goodWhenUnder ? row.real <= row.budget : row.real >= row.budget;
      const barColor = ok ? "var(--good)" : (row.goodWhenUnder ? "var(--bad)" : "var(--amber)");
      const diff = row.real - row.budget;
      const sub = row.goodWhenUnder
        ? (diff <= 0 ? `Te sobran ${money(-diff)} de margen` : `Te pasaste ${money(diff)}`)
        : (diff >= 0 ? `Vas ${money(diff)} arriba del ideal` : `Te faltan ${money(-diff)} para el ideal`);
      return `<div class="rule-row">
        <div class="rule-top"><b>${icon(row.ico, 14)} ${esc(row.label)}</b><span>${money(row.real)} <span style="color:var(--faint)">/ ${money(row.budget)}</span></span></div>
        <div class="rule-track"><div class="real" style="width:${realW}%;background:${barColor}"></div>
          <div class="target-mark" style="left:${markW}%"></div></div>
        <div class="rule-sub">${esc(sub)}</div>
      </div>`;
    }).join("");
    return `<div class="rule-bars">${rows}</div>
      <p class="rule-sub" style="margin-top:12px">La marca vertical es el ideal (50% necesidades, 30% gustos, 20% ahorro). La barra es lo real.</p>`;
  }

  function updateFinanceDerived() {
    const k = $("#finKpis"), d = $("#finDonut"), r = $("#finRule");
    if (k) k.innerHTML = kpisHTML();
    if (d) refreshDonut(d);
    if (r) r.innerHTML = ruleHTML();
  }

  // Binding único: el panel persiste entre renders, así que delegamos una sola
  // vez y leemos state.finance dinámicamente (sobrevive a import/borrar todo).
  function bindFinanceOnce() {
    const panel = $("#panel-finanzas");

    panel.addEventListener("click", e => {
      const btn = e.target.closest("[data-fin]"); if (!btn) return;
      const f = state.finance, act = btn.dataset.fin;
      if (act === "inc-add") { f.extraIncome.push({ id: uid(), name: "", amount: 0 }); save(); renderFinanzas(); }
      else if (act === "exp-add") { f.fixedExpenses.push({ id: uid(), name: "", amount: 0, category: "otros" }); save(); renderFinanzas(); }
      else if (act === "inc-del") { const id = btn.closest(".list-row").dataset.id; f.extraIncome = f.extraIncome.filter(x => x.id !== id); save(); renderFinanzas(); }
      else if (act === "exp-del") { const id = btn.closest(".list-row").dataset.id; f.fixedExpenses = f.fixedExpenses.filter(x => x.id !== id); save(); renderFinanzas(); }
    });

    panel.addEventListener("input", e => {
      const f = state.finance;
      if (e.target.id === "fin-salary") { f.salary = nonneg(num(e.target.value)); save(); updateFinanceDerived(); return; }
      const inp = e.target.closest("[data-fin]"); if (!inp) return;
      const row = inp.closest(".list-row"); if (!row) return;
      const id = row.dataset.id, act = inp.dataset.fin;
      if (act === "inc-name") { const x = f.extraIncome.find(i => i.id === id); if (x) { x.name = inp.value; save(); } }
      else if (act === "inc-amount") { const x = f.extraIncome.find(i => i.id === id); if (x) { x.amount = nonneg(num(inp.value)); save(); updateFinanceDerived(); } }
      else if (act === "exp-name") { const x = f.fixedExpenses.find(i => i.id === id); if (x) { x.name = inp.value; save(); } }
      else if (act === "exp-amount") { const x = f.fixedExpenses.find(i => i.id === id); if (x) { x.amount = nonneg(num(inp.value)); save(); updateFinanceDerived(); } }
    });

    panel.addEventListener("change", e => {
      const f = state.finance;
      if (e.target.id === "fin-currency") { f.currency = e.target.value === "USD" ? "USD" : "UYU"; save(); renderFinanzas(); return; }
      const sel = e.target.closest('[data-fin="exp-cat"]'); if (!sel) return;
      const id = sel.closest(".list-row").dataset.id;
      const x = f.fixedExpenses.find(i => i.id === id);
      if (x) { x.category = CAT_BY_KEY[sel.value] ? sel.value : "otros"; save(); updateFinanceDerived(); }
    });
  }

  /* ============================================================
     RENDER: CALCULADORAS
     ============================================================ */
  // Íconos SVG inline (los emojis nuevos, ej. 🛟, no se renderizan en
  // Windows 10 ni Android viejos; el SVG se ve igual en todos lados).
  const calcIco = paths =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const CALCS = [
    { k: "compuesto", label: "Interés compuesto", icon: calcIco('<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>') },
    { k: "emergencia", label: "Fondo de emergencia", icon: calcIco('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m9.17 14.83-4.24 4.24"/>') },
    { k: "ahorro", label: "Meta de ahorro", icon: calcIco('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>') },
    { k: "costo", label: "¿Cuánto cuesta?", icon: calcIco('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>') }
  ];

  function renderCalc() {
    const panel = $("#panel-calc");
    panel.innerHTML = `
      <div class="calc-tabs" role="tablist">${CALCS.map(c =>
        `<button class="calc-tab" role="tab" data-calc="${c.k}" aria-selected="${c.k === state.calc.active}"><span class="ci">${c.icon}</span><span>${esc(c.label)}</span></button>`).join("")}</div>
      <div id="calcBody"></div>`;
    panel.querySelector(".calc-tabs").addEventListener("click", e => {
      const b = e.target.closest("[data-calc]"); if (!b) return;
      if (state.calc.active === b.dataset.calc) return;
      state.calc.active = b.dataset.calc; save();
      $$(".calc-tab", panel).forEach(t => t.setAttribute("aria-selected", t === b));
      b.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      buildCalcBody();
    });
    // Delegación de precargas y modo: #calcBody se recrea con cada renderCalc,
    // así que este listener se agrega una sola vez por elemento (sin acumular).
    $("#calcBody", panel).addEventListener("click", e => {
      const c = state.calc[state.calc.active];
      const pf = e.target.closest("[data-prefill]");
      if (pf) {
        const t = financeTotals();
        const map = { free: t.free, expenses: t.expenses };
        c[pf.dataset.target] = nonneg(map[pf.dataset.prefill]);
        save(); buildCalcBody(); return;
      }
      const seg = e.target.closest("[data-modo]");
      if (seg) { c.modo = seg.dataset.modo; save(); buildCalcBody(); }
    });
    // Centra la tab activa en la fila (en celular puede quedar fuera de vista).
    const tabsEl = panel.querySelector(".calc-tabs");
    const act = tabsEl.querySelector('[aria-selected="true"]');
    if (act) tabsEl.scrollLeft = act.offsetLeft - (tabsEl.clientWidth - act.offsetWidth) / 2;
    buildCalcBody();
  }

  function sliderField(f) {
    return `<div class="slider-field" data-field="${f.k}">
      <div class="top"><span class="lbl">${esc(f.label)}</span>
        <div class="num-in"><input type="number" data-role="num" inputmode="decimal" min="${f.min}" step="${f.step}" value="${f.value}"></div>
      </div>
      <input type="range" data-role="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${clamp(f.value, f.min, f.max)}" aria-label="${esc(f.label)}">
    </div>`;
  }
  const DISCLAIMER = `<div class="disclaimer"><span>${icon("info", 16)}</span><div>Son <b>simulaciones educativas</b>, no asesoramiento financiero. Los rendimientos reales varían y la inflación no está incluida. Usalas como guía, no como promesa.</div></div>`;

  function buildCalcBody() {
    const host = $("#calcBody");
    const a = state.calc.active;
    if (a === "compuesto") host.innerHTML = bodyCompuesto();
    else if (a === "emergencia") host.innerHTML = bodyEmergencia();
    else if (a === "ahorro") host.innerHTML = bodyAhorro();
    else host.innerHTML = bodyCosto();
    bindCalcFields(host);
    renderCalcResults();
  }

  function bindCalcFields(host) {
    const c = state.calc[state.calc.active];
    $$("[data-field]", host).forEach(fd => {
      const k = fd.dataset.field;
      const range = $('[data-role="range"]', fd), numI = $('[data-role="num"]', fd);
      const min = num(range.min), max = num(range.max);
      range.addEventListener("input", () => { const v = num(range.value); c[k] = v; numI.value = v; save(); scheduleCalcResults(); });
      numI.addEventListener("input", () => { const v = nonneg(num(numI.value)); c[k] = v; range.value = clamp(v, min, max); save(); scheduleCalcResults(); });
    });
  }

  function prefillNote(targetKey, source, text) {
    return `<div class="prefill-note"><span>${icon("bulb", 16)}</span><span>${esc(text)}</span>
      <button class="btn sm" data-prefill="${source}" data-target="${targetKey}">Usar</button></div>`;
  }

  function bodyCompuesto() {
    const c = state.calc.compuesto;
    return `
      ${prefillNote("mensual", "free", "Podés usar tu plata libre como aporte mensual.")}
      ${sliderField({ k: "inicial", label: "Aporte inicial", min: 0, max: 500000, step: 1000, value: c.inicial })}
      ${sliderField({ k: "mensual", label: "Aporte por mes", min: 0, max: 50000, step: 500, value: c.mensual })}
      ${sliderField({ k: "tasa", label: "Tasa anual estimada (%)", min: 0, max: 30, step: 0.5, value: c.tasa })}
      ${sliderField({ k: "anios", label: "Años", min: 1, max: 40, step: 1, value: c.anios })}
      <div id="calcResults"></div>
      ${DISCLAIMER}`;
  }
  function bodyEmergencia() {
    const c = state.calc.emergencia;
    return `
      ${prefillNote("gastos", "expenses", "Usar tus gastos fijos del mes.")}
      ${sliderField({ k: "gastos", label: "Gastos mensuales", min: 0, max: 200000, step: 1000, value: c.gastos })}
      ${sliderField({ k: "meses", label: "Meses de colchón (3 a 6)", min: 1, max: 12, step: 1, value: c.meses })}
      ${sliderField({ k: "tengo", label: "Lo que ya tengo ahorrado", min: 0, max: 500000, step: 1000, value: c.tengo })}
      ${sliderField({ k: "ahorroMes", label: "Cuánto puedo ahorrar por mes", min: 0, max: 50000, step: 500, value: c.ahorroMes })}
      <div id="calcResults"></div>
      ${DISCLAIMER}`;
  }
  function bodyAhorro() {
    const c = state.calc.ahorro;
    return `
      <div class="seg" style="margin-bottom:16px" id="ahorro-modo">
        <button type="button" data-modo="cuanto" aria-pressed="${c.modo === "cuanto"}">¿Cuánto por mes?</button>
        <button type="button" data-modo="cuando" aria-pressed="${c.modo === "cuando"}">¿Cuándo llego?</button>
      </div>
      ${sliderField({ k: "objetivo", label: "Quiero juntar", min: 0, max: 1000000, step: 1000, value: c.objetivo })}
      ${sliderField({ k: "tengo", label: "Ya tengo", min: 0, max: 1000000, step: 1000, value: c.tengo })}
      ${c.modo === "cuanto"
        ? sliderField({ k: "meses", label: "En cuántos meses", min: 1, max: 120, step: 1, value: c.meses })
        : sliderField({ k: "ahorroMes", label: "Ahorrando por mes", min: 0, max: 100000, step: 500, value: c.ahorroMes })}
      <div id="calcResults"></div>
      ${DISCLAIMER}`;
  }
  function bodyCosto() {
    const c = state.calc.costo;
    return `
      <p class="prefill-note"><span>${icon("bulb", 16)}</span><span>Usa tu sueldo de la sección Finanzas: ${money(state.finance.salary)}/mes.</span></p>
      ${sliderField({ k: "precio", label: "Precio de eso que querés", min: 0, max: 200000, step: 100, value: c.precio })}
      ${sliderField({ k: "horasSemana", label: "Horas que trabajás por semana", min: 1, max: 80, step: 1, value: c.horasSemana })}
      <div id="calcResults"></div>
      ${DISCLAIMER}`;
  }

  // Coalescencia por frame: arrastrar un slider dispara muchos eventos input
  // por frame; recalculamos y pintamos como mucho una vez por frame.
  let calcRaf = 0;
  function scheduleCalcResults() {
    if (calcRaf) return;
    calcRaf = requestAnimationFrame(() => { calcRaf = 0; renderCalcResults(); });
  }

  function renderCalcResults() {
    const box = $("#calcResults"); if (!box) return;
    const a = state.calc.active, c = state.calc[a];
    if (a === "compuesto") {
      const r = calcCompound(c.inicial, c.mensual, c.tasa, c.anios);
      const rows = r.rows.map(row => `<tr><td>${row.year}</td><td>${money(row.contrib)}</td><td>${money(row.interest)}</td><td><b>${money(row.total)}</b></td></tr>`).join("")
        || '<tr><td colspan="4" style="text-align:center;color:var(--muted)">Subí los años para ver el desglose</td></tr>';
      // Estructura estable: la creamos una vez y después solo actualizamos
      // valores/tabla, así el canvas del chart sobrevive entre ticks del slider.
      if (box.dataset.view !== "compuesto") {
        box.dataset.view = "compuesto";
        box.innerHTML = `
          <div class="result-grid">
            <div class="result"><div class="lbl">Total aportado</div><div class="v" id="cmp-contrib"></div></div>
            <div class="result hl"><div class="lbl">Total con interés</div><div class="v good" id="cmp-fv"></div></div>
          </div>
          <div class="result" style="margin-bottom:10px"><div class="lbl">Ganado por interés (gratis)</div><div class="v amber" id="cmp-interest"></div></div>
          ${hasChartJS() ? '<div class="chart-box"><canvas id="lineChart" role="img" aria-label="Evolución del ahorro"></canvas></div>' : '<div id="cmp-svg"></div>'}
          <div class="legend" style="flex-direction:row;gap:16px;margin:8px 2px 0">
            <div class="li"><span class="dot" style="background:var(--coral)"></span>Con interés</div>
            <div class="li"><span class="dot" style="background:var(--muted)"></span>Solo aportes</div>
          </div>
          <div class="table-scroll"><table class="breakdown">
            <thead><tr><th>Año</th><th>Aportado</th><th>Interés</th><th>Total</th></tr></thead>
            <tbody id="cmp-tbody"></tbody>
          </table></div>`;
      }
      $("#cmp-contrib", box).textContent = money(r.contributed);
      $("#cmp-fv", box).textContent = money(r.fv);
      $("#cmp-interest", box).textContent = money(r.interest);
      $("#cmp-tbody", box).innerHTML = rows;
      if (hasChartJS()) mountLineChart(r.points);
      else $("#cmp-svg", box).innerHTML = svgLineChart(r.points);
    } else if (a === "emergencia") {
      const r = calcEmergency(c.gastos, c.meses, c.tengo, c.ahorroMes);
      box.innerHTML = `
        <div class="result-grid">
          <div class="result hl"><div class="lbl">Fondo objetivo (${c.meses} meses)</div><div class="v">${money(r.objetivo)}</div></div>
          <div class="result"><div class="lbl">Te falta juntar</div><div class="v ${r.falta <= 0 ? "good" : ""}">${r.falta <= 0 ? "¡Ya lo tenés!" : money(r.falta)}</div></div>
        </div>
        <div class="result-grid">
          <div class="result"><div class="lbl">Lo llegás en</div><div class="v amber">${r.falta <= 0 ? "—" : fmtMonths(r.mesesParaLlegar)}</div></div>
          <div class="result"><div class="lbl">Hoy te cubre</div><div class="v">${fmtNum(Math.round(r.cobertura * 10) / 10)} ${r.cobertura === 1 ? "mes" : "meses"}</div></div>
        </div>
        ${r.falta > 0 && c.ahorroMes <= 0 ? `<p class="rule-sub" style="margin-top:8px">${icon("alert", 13)} Cargá cuánto podés ahorrar por mes para estimar cuándo llegás.</p>` : ""}`;
    } else if (a === "ahorro") {
      if (c.modo === "cuanto") {
        const perMonth = calcSavingsPerMonth(c.objetivo, c.meses, c.tengo);
        const t = financeTotals();
        const factible = t.free > 0 ? perMonth <= t.free : null;
        box.innerHTML = `
          <div class="result hl"><div class="lbl">Tenés que ahorrar por mes</div><div class="v good">${money(perMonth)}</div></div>
          <p class="rule-sub" style="margin-top:10px">Para juntar ${money(c.objetivo)} en ${fmtMonths(c.meses)}${c.tengo > 0 ? " (ya tenés " + money(c.tengo) + ")" : ""}.</p>
          ${factible === null ? "" : `<p class="rule-sub">${factible ? icon("check", 13) + " Te entra dentro de tu plata libre (" + money(t.free) + "/mes)." : icon("alert", 13) + " Es más que tu plata libre actual (" + money(t.free) + "/mes). Quizás estirá el plazo."}</p>`}`;
      } else {
        const months = calcSavingsWhen(c.objetivo, c.ahorroMes, c.tengo);
        box.innerHTML = `
          <div class="result hl"><div class="lbl">Vas a llegar en</div><div class="v good">${months === 0 ? "¡Ya llegaste!" : fmtMonths(months)}</div></div>
          <p class="rule-sub" style="margin-top:10px">Ahorrando ${money(c.ahorroMes)}/mes para juntar ${money(c.objetivo)}${c.tengo > 0 ? " (ya tenés " + money(c.tengo) + ")" : ""}.</p>
          ${!isFinite(months) ? `<p class="rule-sub">${icon("alert", 13)} Con $0 de ahorro mensual no llegás nunca. Subí el ahorro.</p>` : ""}`;
      }
    } else if (a === "costo") {
      const hourly = calcHourly(state.finance.salary, c.horasSemana);
      const horas = hourly > 0 ? c.precio / hourly : Infinity;
      const jornadas = horas / 8;
      const pctSueldo = state.finance.salary > 0 ? c.precio / state.finance.salary * 100 : 0;
      box.innerHTML = `
        <div class="result hl"><div class="lbl">Te cuesta</div>
          <div class="v amber">${isFinite(horas) ? fmtNum(Math.round(horas * 10) / 10) + " horas de laburo" : "—"}</div></div>
        <div class="result-grid" style="margin-top:10px">
          <div class="result"><div class="lbl">En jornadas de 8h</div><div class="v">${isFinite(jornadas) ? fmtNum(Math.round(jornadas * 10) / 10) : "—"}</div></div>
          <div class="result"><div class="lbl">Tu hora vale</div><div class="v">${money(hourly)}</div></div>
        </div>
        <p class="rule-sub" style="margin-top:10px">${state.finance.salary > 0 ? "Eso es el " + fmtNum(Math.round(pctSueldo * 10) / 10) + "% de tu sueldo mensual." : "Cargá tu sueldo en Finanzas para más precisión."}</p>`;
    }
  }

  /* ============================================================
     Modales / sheets
     ============================================================ */
  function openSheet(opts) {
    const root = $("#modalRoot");
    root.innerHTML = `<div class="modal-backdrop" data-close>
      <div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(opts.title)}">
        <div class="grip"></div>
        <div class="sheet-head"><h3>${esc(opts.title)}</h3><button class="x" data-close aria-label="Cerrar">✕</button></div>
        <div class="sheet-body">${opts.bodyHTML}</div>
        ${opts.footerHTML ? `<div class="sheet-actions">${opts.footerHTML}</div>` : ""}
      </div></div>`;
    root.querySelector(".modal-backdrop").addEventListener("click", e => {
      if (e.target.hasAttribute("data-close")) closeSheet();
    });
    document.addEventListener("keydown", escClose);
    if (opts.onMount) opts.onMount(root.querySelector(".sheet"));
  }
  function closeSheet() { $("#modalRoot").innerHTML = ""; document.removeEventListener("keydown", escClose); }
  function escClose(e) { if (e.key === "Escape") closeSheet(); }

  // Confirmación propia: window.confirm() se bloquea en PWAs instaladas
  // (Android/WebView devuelve false sin mostrar nada). Devuelve Promise<bool>.
  // Usa su propio overlay (no #modalRoot) para poder apilarse sobre un sheet.
  function confirmDialog({ title, message, okLabel = "Confirmar", cancelLabel = "Cancelar", danger = false }) {
    return new Promise(resolve => {
      const ov = document.createElement("div");
      ov.className = "confirm-backdrop";
      const ico = danger
        ? '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>'
        : '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>';
      ov.innerHTML = `
        <div class="confirm-card${danger ? " danger" : ""}" role="alertdialog" aria-modal="true" aria-label="${esc(title)}">
          <div class="confirm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ico}</svg></div>
          <h3>${esc(title)}</h3>
          <p>${esc(message)}</p>
          <div class="confirm-actions">
            <button class="btn ghost" type="button" data-x="0">${esc(cancelLabel)}</button>
            <button class="btn ${danger ? "danger solid" : "primary"}" type="button" data-x="1">${esc(okLabel)}</button>
          </div>
        </div>`;
      const onKey = e => { if (e.key === "Escape") done(false); };
      const done = v => {
        document.removeEventListener("keydown", onKey);
        ov.classList.add("out");
        setTimeout(() => ov.remove(), 200);
        resolve(v);
      };
      ov.addEventListener("click", e => {
        const b = e.target.closest("[data-x]");
        if (b) done(b.dataset.x === "1");
        else if (e.target === ov) done(false);
      });
      document.addEventListener("keydown", onKey);
      document.body.appendChild(ov);
      ov.querySelector('[data-x="0"]').focus();
    });
  }

  /* ============================================================
     Confeti (canvas-confetti vía CDN; el SW la deja cacheada
     en la primera visita, así que offline también funciona)
     ============================================================ */
  function fireConfetti() {
    if (prefersReduced() || typeof window.confetti !== "function") return;
    const colors = COLORS;
    window.confetti({ particleCount: 90, spread: 75, startVelocity: 38, origin: { x: 0.5, y: 0.55 }, colors, scalar: 1.05, ticks: 200 });
    window.confetti({ particleCount: 45, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
    window.confetti({ particleCount: 45, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
  }

  function celebrate(g) {
    fireConfetti();
    toast(`¡Completaste «${g.title}»!`, "good", 2200);
    const card = $(`.goal[data-id="${g.id}"]`);
    if (card && !prefersReduced()) { card.classList.add("done-pulse"); setTimeout(() => card.classList.remove("done-pulse"), 550); }
  }

  /* ============================================================
     Toast
     ============================================================ */
  let toastTimer = null;
  function toast(msg, kind, ms) {
    const el = $("#toast");
    el.textContent = msg;
    el.className = "toast" + (kind ? " " + kind : "");
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, ms || 2600);
  }

  /* ============================================================
     Notificaciones (recordatorio diario, sin backend)
     ============================================================ */
  const APP_ICON = document.querySelector('link[rel="icon"]') ?
    document.querySelector('link[rel="icon"]').href : undefined;

  function notifSupported() { return "Notification" in window; }

  // Safari viejo usa callback; los modernos devuelven promesa (y aceptan
  // callback a la vez), así que protegemos contra doble llamada.
  function askPermission(cb) {
    let called = false;
    const once = (res) => { if (!called) { called = true; cb(res); } };
    try {
      const p = Notification.requestPermission(once);
      if (p && typeof p.then === "function") p.then(once);
    } catch (e) { once(Notification.permission); }
  }

  function fireNotification(title, body) {
    if (!notifSupported() || Notification.permission !== "granted") return;
    const opts = { body, icon: APP_ICON, badge: APP_ICON, tag: "apex-reminder" };
    // En Android el constructor Notification() tira error: hay que ir por el SW.
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg && reg.showNotification) reg.showNotification(title, opts);
        else { try { new Notification(title, opts); } catch (e) {} }
      }).catch(() => { try { new Notification(title, opts); } catch (e) {} });
    } else {
      try { new Notification(title, opts); } catch (e) {}
    }
  }

  function pendingMessage() {
    const pending = state.goals.filter(g => !isGoalDone(g)).length;
    if (!state.goals.length) return "Entrá y creá tu primera meta.";
    return pending > 0
      ? `Te quedan ${pending} ${pending === 1 ? "meta" : "metas"} por completar hoy. ¡Dale que podés!`
      : "¡Completaste todo por hoy! Entrá a ver tu racha.";
  }

  function isPastNotifTime(now) {
    const parts = String(state.notif.time || "20:00").split(":");
    const h = num(parts[0], 20), m = num(parts[1], 0);
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
  }

  function notifTick() {
    const n = state.notif;
    if (!n.enabled || !notifSupported() || Notification.permission !== "granted") return;
    const now = new Date(), today = dayKey(now);
    if (n.lastFired === today || !isPastNotifTime(now)) return;
    fireNotification("Apex", pendingMessage());
    n.lastFired = today;
    save();
  }

  function openNotifSheet() {
    const supported = notifSupported();
    const denied = supported && Notification.permission === "denied";
    const body = `
      ${supported ? "" : `<p class="rule-sub" style="margin-bottom:12px">${icon("alert", 13)} Tu navegador no soporta notificaciones.</p>`}
      ${denied ? `<p class="rule-sub" style="margin-bottom:12px">${icon("alert", 13)} Bloqueaste las notificaciones para esta página. Habilitalas desde la configuración del navegador.</p>` : ""}
      <div class="field"><span class="lbl">Recordatorio diario de metas</span>
        <div class="seg" id="nf-toggle">
          <button type="button" data-on="1" aria-pressed="${state.notif.enabled}">${icon("bell", 15)} Activado</button>
          <button type="button" data-on="0" aria-pressed="${!state.notif.enabled}">${icon("bellOff", 15)} Apagado</button>
        </div>
      </div>
      <label class="field"><span class="lbl">Hora del recordatorio</span>
        <input type="time" id="nf-time" value="${esc(state.notif.time)}"></label>
      <button class="btn block" id="nf-test" ${supported ? "" : "disabled"}>Probar notificación</button>
      <p class="rule-sub" style="margin-top:14px">Como Apex no usa servidores, el recordatorio salta cuando la app está abierta (en una pestaña o instalada en tu pantalla de inicio).</p>`;

    openSheet({
      title: "Recordatorios",
      bodyHTML: body,
      footerHTML: '<button class="btn primary" data-close>Listo</button>',
      onMount(sheet) {
        const setToggle = (on) => {
          state.notif.enabled = on;
          $$("#nf-toggle button", sheet).forEach(b => b.setAttribute("aria-pressed", String((b.dataset.on === "1") === on)));
          save();
        };
        $("#nf-toggle", sheet).addEventListener("click", e => {
          const b = e.target.closest("[data-on]"); if (!b) return;
          const wantOn = b.dataset.on === "1";
          if (!wantOn) { setToggle(false); return; }
          if (!supported) { toast("Tu navegador no soporta notificaciones.", "bad"); return; }
          askPermission(res => {
            if (res === "granted") {
              // Si la hora de hoy ya pasó, no dispares al toque: arrancá mañana.
              state.notif.lastFired = isPastNotifTime(new Date()) ? dayKey(new Date()) : null;
              setToggle(true);
              toast("Recordatorio activado", "good");
            } else {
              setToggle(false);
              toast("Sin permiso de notificaciones. Habilitalas en el navegador.", "bad", 3500);
            }
          });
        });
        $("#nf-time", sheet).addEventListener("change", e => {
          const v = e.target.value;
          if (/^\d{2}:\d{2}$/.test(v)) {
            state.notif.time = v;
            state.notif.lastFired = isPastNotifTime(new Date()) ? dayKey(new Date()) : null;
            save();
          }
        });
        $("#nf-test", sheet).addEventListener("click", () => {
          if (Notification.permission === "granted") fireNotification("Apex", pendingMessage());
          else askPermission(res => {
            if (res === "granted") fireNotification("Apex", pendingMessage());
            else toast("Sin permiso de notificaciones.", "bad");
          });
        });
      }
    });
  }

  /* ============================================================
     Tema, tabs, menú, import/export
     ============================================================ */
  function setTheme(t) {
    state.theme = t === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", state.theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", state.theme === "light" ? "#f6f2fb" : "#16111f");
    const tIco = $("#themeBtn .theme-emoji");
    if (tIco) tIco.innerHTML = icon(state.theme === "light" ? "moon" : "sun", 20);
  }
  function renderCurrentPanel() {
    if (uiTab === "metas") renderMetas();
    else if (uiTab === "finanzas") renderFinanzas();
    else renderCalc();
  }
  function toggleTheme() {
    setTheme(state.theme === "light" ? "dark" : "light");
    save();
    // Re-render del panel activo para que las gráficas tomen los colores del tema.
    renderCurrentPanel();
  }

  function switchTab(tab) {
    uiTab = tab;
    $$(".tab").forEach(t => t.setAttribute("aria-selected", t.dataset.tab === tab));
    $("#panel-metas").hidden = tab !== "metas";
    $("#panel-finanzas").hidden = tab !== "finanzas";
    $("#panel-calc").hidden = tab !== "calc";
    if (tab === "metas") renderMetas();
    else if (tab === "finanzas") renderFinanzas();
    else renderCalc();
    window.scrollTo({ top: 0, behavior: prefersReduced() ? "auto" : "smooth" });
  }

  function exportData() {
    const text = JSON.stringify(state, null, 2);
    try {
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `apex-${dayKey(new Date())}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast("Datos exportados", "good");
    } catch (e) {
      // Fallback: data URI
      const a = document.createElement("a");
      a.href = "data:application/json;charset=utf-8," + encodeURIComponent(text);
      a.download = `apex-${dayKey(new Date())}.json`;
      a.click();
      toast("Datos exportados", "good");
    }
  }
  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      let obj;
      try { obj = JSON.parse(reader.result); }
      catch (e) { toast("El archivo no es un JSON válido.", "bad"); return; }
      if (!isValidImport(obj)) { toast("El JSON no tiene el formato esperado.", "bad", 3500); return; }
      state = normalizeState(obj);
      save(); applyResets(); setTheme(state.theme); switchTab(uiTab);
      toast("Datos importados", "good");
    };
    reader.onerror = () => toast("No pude leer el archivo.", "bad");
    reader.readAsText(file);
  }
  async function wipeData() {
    const ok = await confirmDialog({
      title: "¿Borrar todo?",
      message: "Se borran tus metas, finanzas y configuración. Esto no se puede deshacer.",
      okLabel: "Sí, borrar todo", danger: true
    });
    if (!ok) return;
    state = defaultState();
    setTheme(state.theme); save(); switchTab("metas");
    toast("Todo borrado. Arrancás de cero.", "bad");
  }
  async function loadSeed() {
    if (state.goals.length || state.finance.salary || state.finance.fixedExpenses.length) {
      const ok = await confirmDialog({
        title: "Cargar datos de ejemplo",
        message: "Esto reemplaza tus datos actuales por los de ejemplo.",
        okLabel: "Cargar ejemplo"
      });
      if (!ok) return;
    }
    const theme = state.theme;
    state = seedState(); state.theme = theme;
    save(); applyResets(); switchTab("metas");
    toast("Datos de ejemplo cargados", "good");
  }

  /* ============================================================
     Bind global + init
     ============================================================ */
  function toggleMenu(force) {
    const menu = $("#menu"), btn = $("#menuBtn");
    const open = typeof force === "boolean" ? force : menu.hidden;
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
  }

  function bindGlobal() {
    $("#themeBtn").addEventListener("click", toggleTheme);

    $("#menuBtn").addEventListener("click", e => { e.stopPropagation(); toggleMenu(); });
    $("#menu").addEventListener("click", e => {
      const b = e.target.closest("[data-action]"); if (!b) return;
      toggleMenu(false);
      const act = b.dataset.action;
      if (act === "notif") openNotifSheet();
      else if (act === "export") exportData();
      else if (act === "import") $("#importFile").click();
      else if (act === "seed") loadSeed();
      else if (act === "wipe") wipeData();
    });
    document.addEventListener("click", e => {
      if (!e.target.closest(".appbar-actions")) toggleMenu(false);
    });
    $("#importFile").addEventListener("change", e => {
      const file = e.target.files && e.target.files[0];
      if (file) importData(file);
      e.target.value = "";
    });

    $$(".tab").forEach(t => t.addEventListener("click", () => switchTab(t.dataset.tab)));

    // Delegación de acciones en el panel de Metas
    $("#panel-metas").addEventListener("click", e => {
      const b = e.target.closest("[data-act]"); if (!b) return;
      const act = b.dataset.act, id = b.dataset.id;
      if (act === "new-goal") openGoalEditor(null);
      else if (act === "edit") openGoalEditor(findGoal(id));
      else if (act === "toggle") toggleGoal(id);
      else if (act === "inc") stepGoal(id, 1);
      else if (act === "dec") stepGoal(id, -1);
      else if (act === "up") moveGoal(id, -1);
      else if (act === "down") moveGoal(id, 1);
    });
    $("#panel-metas").addEventListener("change", e => {
      const inp = e.target.closest('input[data-act="set"]'); if (!inp) return;
      setGoalValue(inp.dataset.id, inp.value);
    });

    bindFinanceOnce();

    // Reset al volver a la pestaña / cambiar de día. Al ocultarse,
    // flusheamos el guardado pendiente: es la última oportunidad confiable
    // de escribir antes de que el sistema mate la pestaña/PWA.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { flushSave(); return; }
      if (applyResets()) switchTab(uiTab);
      notifTick();
    });
    window.addEventListener("pagehide", flushSave);

    // Sincronización entre pestañas: si otra pestaña guardó, adoptamos su
    // estado (y descartamos el pendiente local para no pisarla con datos viejos).
    window.addEventListener("storage", (e) => {
      if (e.key !== KEY || e.newValue == null) return;
      let incoming;
      try { incoming = normalizeState(JSON.parse(e.newValue)); } catch (err) { return; }
      if (saveTimer != null) { clearTimeout(saveTimer); saveTimer = null; }
      savePending = false;
      state = incoming;
      setTheme(state.theme);
      applyResets();
      renderCurrentPanel();
    });
  }

  function registerSW() {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  function init() {
    const raw = Store.get();
    if (raw) { try { state = normalizeState(JSON.parse(raw)); } catch (e) { state = seedState(); } }
    else { state = seedState(); save(); }

    setTheme(state.theme);
    setupChartDefaults();
    applyResets();
    bindGlobal();
    switchTab("metas");
    registerSW();
    setInterval(notifTick, 30000);
    notifTick();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
