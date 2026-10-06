"use strict";

// Backend: Supabase Edge Function (see supabase/functions/api)
const API = "https://imhmxumgnemzrkfdzkle.supabase.co/functions/v1/api";
const TOKEN_KEY = "vocapp.token";
const SESSION_KEY = (deckId) => `vocapp.session.${deckId}`;
const LANG = { en: "Englisch", de: "Deutsch" };

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 2600);
}

function show(id) {
  $$(".view").forEach((v) => (v.hidden = v.id !== id));
  window.scrollTo(0, 0);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function storage(key, value) {
  try {
    if (value === undefined) return JSON.parse(localStorage.getItem(key));
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return null;
  }
}

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-app-token": storage(TOKEN_KEY) || "",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && path !== "/login") {
    logout();
    throw new Error("Bitte erneut anmelden");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Fehler beim Speichern");
  return data;
}

/* ------------------------------------------------------------------ */
/* Handwriting pad                                                     */
/* ------------------------------------------------------------------ */

class Pad {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.strokes = [];
    this.current = null;
    this.bg = null; // existing handwriting image when editing a card
    this.dirty = false;
    this.penSeen = false;

    new ResizeObserver(() => this.resize()).observe(canvas);
    canvas.addEventListener("pointerdown", (e) => this.down(e));
    canvas.addEventListener("pointermove", (e) => this.move(e));
    canvas.addEventListener("pointerup", (e) => this.up(e));
    canvas.addEventListener("pointercancel", (e) => this.up(e));
    // stop iOS from scrolling / magnifying while writing
    canvas.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
    canvas.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
  }

  get width() { return this.canvas.clientWidth; }
  get height() { return this.canvas.clientHeight; }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(this.width * dpr);
    const h = Math.round(this.height * dpr);
    if (!w || !h) return;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.redraw();
  }

  point(e) {
    const r = this.canvas.getBoundingClientRect();
    const pressure = e.pointerType === "pen" ? (e.pressure || 0.5) : 0.5;
    return { x: e.clientX - r.left, y: e.clientY - r.top, p: pressure };
  }

  down(e) {
    if (e.pointerType === "pen") this.penSeen = true;
    // palm rejection: once the Pencil is used, ignore finger touches
    if (e.pointerType === "touch" && this.penSeen) return;
    if (e.button > 0) return;
    e.preventDefault();
    this.canvas.setPointerCapture(e.pointerId);
    this.current = { id: e.pointerId, w: e.pointerType === "pen" ? 3.2 : 3.6, pts: [this.point(e)] };
    this.strokes.push(this.current);
    this.dirty = true;
    this.drawDot(this.ctx, this.current, 1);
  }

  move(e) {
    if (!this.current || e.pointerId !== this.current.id) return;
    e.preventDefault();
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events.length ? events : [e]) {
      this.current.pts.push(this.point(ev));
      this.drawLastSegment(this.ctx, this.current, 1);
    }
  }

  up(e) {
    if (!this.current || e.pointerId !== this.current.id) return;
    this.current = null;
  }

  lineWidth(stroke, p, scale) {
    return stroke.w * (0.55 + p * 0.9) * scale;
  }

  drawDot(ctx, stroke, scale) {
    const p = stroke.pts[0];
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(p.x * scale, p.y * scale, this.lineWidth(stroke, p.p, scale) / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smooth curve through the midpoints of the last three points.
  drawSegment(ctx, stroke, i, scale) {
    const pts = stroke.pts;
    const a = pts[i - 2] || pts[i - 1];
    const b = pts[i - 1];
    const c = pts[i];
    const m1 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const m2 = { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 };
    ctx.strokeStyle = "#000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = this.lineWidth(stroke, (b.p + c.p) / 2, scale);
    ctx.beginPath();
    ctx.moveTo(m1.x * scale, m1.y * scale);
    ctx.quadraticCurveTo(b.x * scale, b.y * scale, m2.x * scale, m2.y * scale);
    ctx.stroke();
  }

  drawLastSegment(ctx, stroke, scale) {
    if (stroke.pts.length >= 2) this.drawSegment(ctx, stroke, stroke.pts.length - 1, scale);
  }

  drawStroke(ctx, stroke, scale) {
    this.drawDot(ctx, stroke, scale);
    for (let i = 1; i < stroke.pts.length; i++) this.drawSegment(ctx, stroke, i, scale);
  }

  drawBg(ctx, w, h) {
    if (!this.bg || this.bg.pending) return;
    const s = Math.min(w / this.bg.width, h / this.bg.height);
    const bw = this.bg.width * s;
    const bh = this.bg.height * s;
    ctx.drawImage(this.bg, (w - bw) / 2, (h - bh) / 2, bw, bh);
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBg(this.ctx, this.width, this.height);
    for (const s of this.strokes) this.drawStroke(this.ctx, s, 1);
  }

  clear() {
    this.strokes = [];
    this.current = null;
    this.bg = null;
    this.dirty = true;
    this.redraw();
  }

  undo() {
    if (this.strokes.length) this.strokes.pop();
    else if (this.bg) this.bg = null;
    else return;
    this.dirty = true;
    this.redraw();
  }

  reset() {
    this.clear();
    this.dirty = false;
  }

  isEmpty() {
    return !this.bg && this.strokes.length === 0;
  }

  load(dataUrl) {
    this.reset();
    if (!dataUrl) return;
    // placeholder so isEmpty() is false while the image loads
    const placeholder = { pending: true };
    this.bg = placeholder;
    const img = new Image();
    img.onload = () => {
      if (this.bg !== placeholder) return; // card changed meanwhile
      this.bg = img;
      this.redraw();
    };
    img.src = dataUrl;
  }

  // Transparent PNG with black ink, max ~1200px wide.
  toDataURL() {
    if (this.isEmpty()) return null;
    const scale = Math.min(2, 1200 / this.width);
    const out = document.createElement("canvas");
    out.width = Math.round(this.width * scale);
    out.height = Math.round(this.height * scale);
    const ctx = out.getContext("2d");
    this.drawBg(ctx, out.width, out.height);
    for (const s of this.strokes) this.drawStroke(ctx, s, scale);
    return out.toDataURL("image/png");
  }
}

const pads = {
  en: new Pad($("#pad-en")),
  de: new Pad($("#pad-de")),
  answer: new Pad($("#pad-answer")),
};

$$("[data-undo]").forEach((b) => b.addEventListener("click", () => pads[b.dataset.undo].undo()));
$$("[data-clear]").forEach((b) => b.addEventListener("click", () => pads[b.dataset.clear].clear()));

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.submitter || $("#login-form button");
  const err = $("#login-error");
  err.hidden = true;
  btn.disabled = true;
  try {
    const { token } = await api("/login", {
      method: "POST",
      body: { username: $("#login-user").value.trim(), password: $("#login-pass").value },
    });
    storage(TOKEN_KEY, token);
    $("#login-pass").value = "";
    showDecks();
  } catch (ex) {
    err.textContent = ex.message === "Login fehlgeschlagen" ? "Benutzername oder Passwort falsch." : ex.message;
    err.hidden = false;
  } finally {
    btn.disabled = false;
  }
});

function logout() {
  storage(TOKEN_KEY, null);
  show("view-login");
}

$("#logout-btn").addEventListener("click", logout);

/* ------------------------------------------------------------------ */
/* Decks                                                               */
/* ------------------------------------------------------------------ */

let decks = [];

async function showDecks() {
  show("view-decks");
  try {
    decks = await api("/decks");
    renderDecks();
  } catch (ex) {
    toast(ex.message);
  }
}

function renderDecks() {
  const list = $("#deck-list");
  list.innerHTML = "";
  $("#deck-empty").hidden = decks.length > 0;
  for (const deck of decks) {
    const open = storage(SESSION_KEY(deck.id));
    const el = document.createElement("div");
    el.className = "deck";
    el.innerHTML = `
      <div>
        <div class="deck-name"></div>
        <div class="deck-meta"></div>
      </div>
      <div class="deck-actions">
        <button class="btn" data-act="edit">Karten erstellen</button>
        <button class="btn primary" data-act="learn">Lernen</button>
      </div>
      <div class="deck-more">
        <button class="btn ghost" data-act="rename">Umbenennen</button>
        <button class="btn danger-ghost" data-act="delete">Löschen</button>
      </div>`;
    el.querySelector(".deck-name").textContent = deck.name;
    el.querySelector(".deck-meta").textContent =
      `${deck.count} ${deck.count === 1 ? "Karte" : "Karten"}` +
      (open && open.queue?.length ? ` · offene Runde (${open.queue.length} übrig)` : "");
    const learnBtn = el.querySelector('[data-act="learn"]');
    learnBtn.disabled = deck.count === 0;
    el.querySelector('[data-act="edit"]').onclick = () => openEditor(deck);
    learnBtn.onclick = () => openSetup(deck);
    el.querySelector('[data-act="rename"]').onclick = () => renameDeck(deck);
    el.querySelector('[data-act="delete"]').onclick = () => deleteDeck(deck);
    list.appendChild(el);
  }
}

$("#new-deck-btn").addEventListener("click", async () => {
  const name = prompt("Name des neuen Stapels:", "");
  if (name === null) return;
  try {
    const deck = await api("/decks", { method: "POST", body: { name } });
    deck.count = 0;
    openEditor(deck);
  } catch (ex) {
    toast(ex.message);
  }
});

async function renameDeck(deck) {
  const name = prompt("Neuer Name:", deck.name);
  if (!name || !name.trim()) return;
  try {
    await api(`/decks/${deck.id}`, { method: "PATCH", body: { name } });
    showDecks();
  } catch (ex) {
    toast(ex.message);
  }
}

async function deleteDeck(deck) {
  if (!confirm(`Stapel „${deck.name}“ mit ${deck.count} Karten wirklich löschen?`)) return;
  try {
    await api(`/decks/${deck.id}`, { method: "DELETE" });
    storage(SESSION_KEY(deck.id), null);
    showDecks();
  } catch (ex) {
    toast(ex.message);
  }
}

/* ------------------------------------------------------------------ */
/* Card editor                                                         */
/* ------------------------------------------------------------------ */

const edit = { deck: null, cards: [], index: 0, busy: false };

async function openEditor(deck) {
  edit.deck = deck;
  edit.cards = [];
  $("#edit-title").textContent = deck.name;
  show("view-edit");
  setEditIndex(0);
  try {
    edit.cards = await api(`/decks/${deck.id}/cards`);
    setEditIndex(edit.cards.length); // start with a fresh blank card
  } catch (ex) {
    toast(ex.message);
  }
}

function setEditIndex(i) {
  edit.index = i;
  const card = edit.cards[i];
  if (card) {
    pads.en.load(card.english);
    pads.de.load(card.german);
    $("#edit-counter").textContent = `Karte ${i + 1} / ${edit.cards.length}`;
  } else {
    pads.en.reset();
    pads.de.reset();
    $("#edit-counter").textContent = `Neue Karte · ${edit.cards.length} gespeichert`;
  }
  $("#edit-delete").hidden = !card;
  $("#edit-prev").disabled = i === 0;
}

// Saves the current card if needed.
// Returns "saved", "unchanged", "empty" (blank new card) or "incomplete".
async function saveCurrentCard() {
  const card = edit.cards[edit.index];
  const changed = pads.en.dirty || pads.de.dirty;
  if (!card && pads.en.isEmpty() && pads.de.isEmpty()) return "empty";
  if (card && !changed) return "unchanged";
  if (pads.en.isEmpty() || pads.de.isEmpty()) return "incomplete";

  const body = { english: pads.en.toDataURL(), german: pads.de.toDataURL() };
  if (card) {
    await api(`/cards/${card.id}`, { method: "PUT", body });
    Object.assign(card, body);
  } else {
    const created = await api(`/decks/${edit.deck.id}/cards`, { method: "POST", body });
    edit.cards.push(created);
  }
  pads.en.dirty = pads.de.dirty = false;
  return "saved";
}

async function withBusy(fn) {
  if (edit.busy) return;
  edit.busy = true;
  $("#edit-next").disabled = true;
  try {
    await fn();
  } catch (ex) {
    toast(ex.message);
  } finally {
    edit.busy = false;
    $("#edit-next").disabled = false;
  }
}

$("#edit-next").addEventListener("click", () =>
  withBusy(async () => {
    const result = await saveCurrentCard();
    if (result === "empty") return toast("Schreibe zuerst auf beide Seiten.");
    if (result === "incomplete") return toast("Bitte beide Seiten beschreiben.");
    setEditIndex(edit.index + 1);
  }),
);

async function leaveCard() {
  const result = await saveCurrentCard();
  if (result === "incomplete") {
    return confirm("Eine Seite ist leer. Änderungen an dieser Karte verwerfen?");
  }
  return true;
}

$("#edit-prev").addEventListener("click", () =>
  withBusy(async () => {
    if (edit.index === 0) return;
    if (await leaveCard()) setEditIndex(edit.index - 1);
  }),
);

$("#edit-delete").addEventListener("click", () =>
  withBusy(async () => {
    const card = edit.cards[edit.index];
    if (!card || !confirm("Diese Karte löschen?")) return;
    await api(`/cards/${card.id}`, { method: "DELETE" });
    edit.cards.splice(edit.index, 1);
    setEditIndex(Math.min(edit.index, edit.cards.length));
  }),
);

/* ------------------------------------------------------------------ */
/* Learning                                                            */
/* ------------------------------------------------------------------ */

const learn = { deck: null, cards: new Map(), session: null };

async function openSetup(deck) {
  learn.deck = deck;
  $("#setup-title").textContent = deck.name;
  const open = storage(SESSION_KEY(deck.id));
  $("#resume-box").hidden = !(open && open.queue?.length);
  if (open && open.queue?.length) {
    $("#resume-info").textContent =
      `${LANG[open.dir]} zuerst · noch ${open.queue.length} von ${open.total} Karten`;
  }
  show("view-setup");
}

async function loadLearnCards() {
  const cards = await api(`/decks/${learn.deck.id}/cards`);
  learn.cards = new Map(cards.map((c) => [c.id, c]));
  return cards;
}

$$(".choice").forEach((btn) =>
  btn.addEventListener("click", async () => {
    try {
      const cards = await loadLearnCards();
      if (!cards.length) return toast("Dieser Stapel hat noch keine Karten.");
      const ids = cards.map((c) => c.id);
      if ($("#shuffle").checked) shuffle(ids);
      learn.session = {
        deckId: learn.deck.id,
        dir: btn.dataset.dir, // side shown first
        queue: ids,
        total: ids.length,
        wrong: 0,
      };
      saveSession();
      startLearning();
    } catch (ex) {
      toast(ex.message);
    }
  }),
);

$("#resume-btn").addEventListener("click", async () => {
  try {
    await loadLearnCards();
    learn.session = storage(SESSION_KEY(learn.deck.id));
    startLearning();
  } catch (ex) {
    toast(ex.message);
  }
});

function saveSession() {
  storage(SESSION_KEY(learn.session.deckId), learn.session.queue.length ? learn.session : null);
}

function startLearning() {
  const s = learn.session;
  // drop cards that were deleted in the meantime
  s.queue = s.queue.filter((id) => learn.cards.has(id));
  const answerDir = s.dir === "de" ? "en" : "de";
  $("#prompt-label").textContent = LANG[s.dir];
  $("#answer-label").textContent = `${LANG[answerDir]} – hier schreiben`;
  show("view-learn");
  showCurrentCard();
}

function showCurrentCard() {
  const s = learn.session;
  saveSession();
  const done = s.total - s.queue.length;
  $("#progress-bar").style.width = `${(done / s.total) * 100}%`;
  $("#learn-counter").textContent = `${s.queue.length} übrig`;

  if (!s.queue.length) return finishLearning();

  const card = learn.cards.get(s.queue[0]);
  const shown = s.dir === "de" ? card.german : card.english;
  const hidden = s.dir === "de" ? card.english : card.german;
  $("#prompt-img").src = shown;
  $("#solution-img").src = hidden;
  $("#solution").hidden = true;
  $("#reveal-btn").hidden = false;
  $("#judge").hidden = true;
  pads.answer.reset();
}

$("#reveal-btn").addEventListener("click", () => {
  $("#solution").hidden = false;
  $("#reveal-btn").hidden = true;
  $("#judge").hidden = false;
});

$("#right-btn").addEventListener("click", () => {
  learn.session.queue.shift();
  showCurrentCard();
});

$("#wrong-btn").addEventListener("click", () => {
  const q = learn.session.queue;
  q.push(q.shift());
  learn.session.wrong++;
  showCurrentCard();
});

function finishLearning() {
  const s = learn.session;
  storage(SESSION_KEY(s.deckId), null);
  $("#done-stats").textContent =
    `${s.total} ${s.total === 1 ? "Karte" : "Karten"} gelernt` +
    (s.wrong ? ` · ${s.wrong}× falsch` : " · alles beim ersten Mal richtig!");
  show("view-done");
}

$("#again-btn").addEventListener("click", () => openSetup(learn.deck));

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

$$("[data-back]").forEach((b) =>
  b.addEventListener("click", async () => {
    if (!$("#view-edit").hidden) {
      let ok = false;
      await withBusy(async () => (ok = await leaveCard()));
      if (!ok) return;
    }
    showDecks();
  }),
);

/* ------------------------------------------------------------------ */
/* Start                                                               */
/* ------------------------------------------------------------------ */

if (storage(TOKEN_KEY)) showDecks();
else show("view-login");
