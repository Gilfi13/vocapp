import { getStroke } from "./vendor/perfect-freehand.js";
import { initGrammar } from "./grammar.js";
import { initImport } from "./import.js";

// Backend: Supabase Edge Function (see supabase/functions/api)
const API = "https://imhmxumgnemzrkfdzkle.supabase.co/functions/v1/api";
const TOKEN_KEY = "vocapp.token";
// open learning rounds are stored per user on this device
const SESSION_KEY = (deckId) => `vocapp.session.${me?.id}.${deckId}`;
const LANG = { en: "Englisch", de: "Deutsch" };
const ALL_DECKS = { id: "all", name: "Alle Stapel" };
const KNOWN_BOX = 2; // same rule as the backend: from box 2 on a word "sitzt"

let me = null; // logged-in user {id, username, is_admin}

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
  closeMenu();
  $$(".view").forEach((v) => (v.hidden = v.id !== id));
  window.scrollTo(0, 0);
}

const isVisible = (id) => !$(`#${id}`).hidden;

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
  let res;
  try {
    res = await fetch(API + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-app-token": storage(TOKEN_KEY) || "",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Keine Verbindung – bitte Internet prüfen");
  }
  if (res.status === 401 && path !== "/login") {
    logout();
    throw new Error("Bitte erneut anmelden");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Da ist etwas schiefgelaufen");
  return data;
}

function cardStatus(card) {
  if (card.box >= KNOWN_BOX) return "known";
  return card.last_reviewed ? "learning" : "fresh";
}

function countStatus(cards) {
  const c = { known: 0, learning: 0, fresh: 0 };
  for (const card of cards) c[cardStatus(card)]++;
  return c;
}

function setBar(el, known, learning, total) {
  el.querySelector(".known").style.width = total ? `${(known / total) * 100}%` : "0";
  el.querySelector(".learning").style.width = total ? `${(learning / total) * 100}%` : "0";
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/* ------------------------------------------------------------------ */
/* Handwriting pad                                                     */
/* ------------------------------------------------------------------ */

// Every card uses the same 3:2 coordinate system, so handwriting looks the
// same on every screen size and in every view.
const CARD_W = 600;
const CARD_H = 400;
const EXPORT_SCALE = 1.5; // saved images are 900 x 600 px
const STROKE = {
  size: 6.5,
  thinning: 0.55,
  smoothing: 0.6,
  streamline: 0.45,
  start: { cap: true, taper: 0 },
  end: { cap: true, taper: 0 },
};

// Fill a perfect-freehand outline with smooth quadratic curves.
function fillOutline(ctx, pts, k) {
  const n = pts.length;
  if (n < 3) return;
  ctx.beginPath();
  ctx.moveTo(((pts[0][0] + pts[1][0]) / 2) * k, ((pts[0][1] + pts[1][1]) / 2) * k);
  for (let i = 1; i <= n; i++) {
    const p = pts[i % n];
    const q = pts[(i + 1) % n];
    ctx.quadraticCurveTo(p[0] * k, p[1] * k, ((p[0] + q[0]) / 2) * k, ((p[1] + q[1]) / 2) * k);
  }
  ctx.closePath();
  ctx.fillStyle = "#000";
  ctx.fill();
}

// Draw an image centered without distortion (older cards have another aspect ratio).
function drawContained(ctx, img, w, h) {
  const s = Math.min(w / img.width, h / img.height);
  ctx.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s);
}

class Pad {
  static penSeen = false;

  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    // committed strokes are cached here; only the live stroke is redrawn per frame
    this.base = document.createElement("canvas");
    this.bctx = this.base.getContext("2d");
    this.k = 1;
    this.strokes = [];
    this.current = null;
    this.bg = null; // existing handwriting when editing a card
    this.dirty = false;
    this.frame = 0;
    this.ready = Promise.resolve(); // resolves once a loaded card image is drawn

    new ResizeObserver(() => this.resize()).observe(canvas);
    canvas.addEventListener("pointerdown", (e) => this.down(e));
    canvas.addEventListener("pointermove", (e) => this.move(e));
    canvas.addEventListener("pointerup", (e) => this.up(e));
    canvas.addEventListener("pointercancel", (e) => this.up(e));
    // stop iOS from scrolling / magnifying while writing
    canvas.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
    canvas.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(this.canvas.clientWidth * dpr);
    const h = Math.round(this.canvas.clientHeight * dpr);
    if (!w || !h) return;
    for (const c of [this.canvas, this.base]) {
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
    }
    this.k = w / CARD_W;
    this.rebuild();
  }

  point(e) {
    const r = this.canvas.getBoundingClientRect();
    const pressure = e.pointerType === "pen" ? e.pressure || 0.5 : 0.5;
    return [((e.clientX - r.left) / r.width) * CARD_W, ((e.clientY - r.top) / r.height) * CARD_H, pressure];
  }

  down(e) {
    if (e.pointerType === "pen") Pad.penSeen = true;
    // palm rejection: once the Pencil was used, ignore finger touches
    if (e.pointerType === "touch" && Pad.penSeen) return;
    if (e.button > 0 || this.current) return;
    e.preventDefault();
    this.canvas.setPointerCapture(e.pointerId);
    this.current = { id: e.pointerId, pen: e.pointerType === "pen", pts: [this.point(e)] };
    this.dirty = true;
    this.schedule();
  }

  move(e) {
    if (!this.current || e.pointerId !== this.current.id) return;
    e.preventDefault();
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    for (const ev of events.length ? events : [e]) this.current.pts.push(this.point(ev));
    this.schedule();
  }

  up(e) {
    if (!this.current || e.pointerId !== this.current.id) return;
    this.strokes.push(this.current);
    this.drawStroke(this.bctx, this.current, this.k, true);
    this.current = null;
    this.schedule();
  }

  drawStroke(ctx, stroke, k, last) {
    const outline = getStroke(stroke.pts, { ...STROKE, simulatePressure: !stroke.pen, last });
    fillOutline(ctx, outline, k);
  }

  schedule() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.render();
    });
  }

  render() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(this.base, 0, 0);
    if (this.current) this.drawStroke(this.ctx, this.current, this.k, false);
  }

  rebuild() {
    const { width, height } = this.base;
    this.bctx.clearRect(0, 0, width, height);
    if (this.bg && !this.bg.pending) drawContained(this.bctx, this.bg, width, height);
    for (const s of this.strokes) this.drawStroke(this.bctx, s, this.k, true);
    this.render();
  }

  clear() {
    this.strokes = [];
    this.current = null;
    this.bg = null;
    this.dirty = true;
    this.rebuild();
  }

  undo() {
    if (this.strokes.length) this.strokes.pop();
    else if (this.bg) this.bg = null;
    else return;
    this.dirty = true;
    this.rebuild();
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
    this.ready = new Promise((resolve) => {
      img.onload = () => {
        if (this.bg === placeholder) {
          this.bg = img; // only if the card was not changed meanwhile
          this.rebuild();
        }
        resolve();
      };
      img.onerror = resolve;
    });
    img.src = dataUrl;
  }

  // Transparent PNG with black ink.
  toDataURL() {
    if (this.isEmpty()) return null;
    const out = document.createElement("canvas");
    out.width = CARD_W * EXPORT_SCALE;
    out.height = CARD_H * EXPORT_SCALE;
    const ctx = out.getContext("2d");
    if (this.bg && !this.bg.pending) drawContained(ctx, this.bg, out.width, out.height);
    for (const s of this.strokes) this.drawStroke(ctx, s, EXPORT_SCALE, true);
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
  const btn = $("#login-form button");
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
    await start();
  } catch (ex) {
    err.textContent = ex.message === "Login fehlgeschlagen" ? "Benutzername oder Passwort falsch." : ex.message;
    err.hidden = false;
  } finally {
    btn.disabled = false;
  }
});

function logout() {
  storage(TOKEN_KEY, null);
  me = null;
  show("view-login");
}

// Load the logged-in user, then open the overview.
async function start() {
  me = await api("/me");
  $("#user-name").textContent = me.username;
  $("#hello").textContent = `Hallo, ${me.username[0].toUpperCase()}${me.username.slice(1)}!`;
  $("#user-initial").textContent = me.username[0];
  $('[data-user="users"]').hidden = !me.is_admin;
  await showHome();
}

/* ---------- user menu ---------- */

$("#user-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  openMenu($("#user-menu"), e.currentTarget);
});

$("#user-menu").addEventListener("click", (e) => {
  const action = e.target.closest("[data-user]")?.dataset.user;
  closeMenu();
  if (action === "logout") logout();
  if (action === "users") showUsers();
  if (action === "password") {
    openForm({
      title: "Passwort ändern",
      submitLabel: "Speichern",
      fields: [
        { name: "current", label: "Aktuelles Passwort", type: "password", autocomplete: "current-password" },
        { name: "password", label: "Neues Passwort", type: "password", autocomplete: "new-password" },
        { name: "repeat", label: "Neues Passwort wiederholen", type: "password", autocomplete: "new-password" },
      ],
      async onSubmit({ current, password, repeat }) {
        if (password !== repeat) throw new Error("Die neuen Passwörter stimmen nicht überein.");
        await api("/me/password", { method: "POST", body: { current, password } });
        toast("Passwort geändert");
      },
    });
  }
});

/* ---------- form dialog ---------- */

let formSubmit = null;

function openForm({ title, fields, submitLabel = "OK", onSubmit }) {
  const dialog = $("#form-dialog");
  $("#form-title").textContent = title;
  $("#form-submit").textContent = submitLabel;
  $("#form-error").hidden = true;
  const box = $("#form-fields");
  box.innerHTML = "";
  for (const f of fields) {
    const label = document.createElement("label");
    label.textContent = f.label;
    const input = document.createElement("input");
    Object.assign(input, { name: f.name, type: f.type ?? "text", required: true, value: f.value ?? "" });
    input.setAttribute("autocomplete", f.autocomplete ?? "off");
    input.setAttribute("autocapitalize", "off");
    label.appendChild(input);
    box.appendChild(label);
  }
  formSubmit = onSubmit;
  dialog.showModal();
  box.querySelector("input")?.focus();
}

$("#form-dialog form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const values = Object.fromEntries(new FormData(e.target));
  const btn = $("#form-submit");
  btn.disabled = true;
  try {
    await formSubmit(values);
    $("#form-dialog").close();
  } catch (ex) {
    $("#form-error").textContent = ex.message;
    $("#form-error").hidden = false;
  } finally {
    btn.disabled = false;
  }
});

$("#form-cancel").addEventListener("click", () => $("#form-dialog").close());

/* ------------------------------------------------------------------ */
/* User management (admin)                                             */
/* ------------------------------------------------------------------ */

async function showUsers() {
  show("view-users");
  try {
    renderUsers(await api("/users"));
  } catch (ex) {
    toast(ex.message);
  }
}

function renderUsers(users) {
  const list = $("#user-list");
  list.innerHTML = "";
  for (const user of users) {
    const isMe = user.id === me.id;
    const el = document.createElement("div");
    el.className = "user-row";
    el.innerHTML = `
      <span class="avatar"></span>
      <div class="user-info">
        <strong></strong>${user.is_admin ? '<span class="badge known">Admin</span>' : ""}${isMe ? '<span class="badge learning">Du</span>' : ""}
        <div class="muted small">${plural(user.decks, "Stapel", "Stapel")} · ${plural(user.cards, "Karte", "Karten")}</div>
      </div>
      <div class="user-actions">
        <button class="btn" data-act="password">Passwort setzen</button>
        ${isMe ? "" : '<button class="btn danger-ghost" data-act="delete">Löschen</button>'}
      </div>`;
    el.querySelector(".avatar").textContent = user.username[0];
    el.querySelector("strong").textContent = user.username;
    el.querySelector('[data-act="password"]').onclick = () =>
      openForm({
        title: `Neues Passwort für „${user.username}“`,
        submitLabel: "Speichern",
        fields: [{ name: "password", label: "Neues Passwort", autocomplete: "off" }],
        async onSubmit({ password }) {
          await api(`/users/${user.id}`, { method: "PATCH", body: { password } });
          toast("Passwort gespeichert");
        },
      });
    const del = el.querySelector('[data-act="delete"]');
    if (del) {
      del.onclick = async () => {
        if (!confirm(`„${user.username}“ mit allen Stapeln und Karten (${user.cards}) endgültig löschen?`)) return;
        try {
          await api(`/users/${user.id}`, { method: "DELETE" });
          showUsers();
        } catch (ex) {
          toast(ex.message);
        }
      };
    }
    list.appendChild(el);
  }
}

$("#new-user-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("#new-user-error");
  err.hidden = true;
  const username = $("#new-user-name").value.trim().toLowerCase();
  try {
    await api("/users", { method: "POST", body: { username, password: $("#new-user-pass").value } });
    $("#new-user-name").value = "";
    $("#new-user-pass").value = "";
    toast(`„${username}“ kann sich jetzt anmelden`);
    showUsers();
  } catch (ex) {
    err.textContent = ex.message;
    err.hidden = false;
  }
});

/* ------------------------------------------------------------------ */
/* Home: overall progress + decks                                      */
/* ------------------------------------------------------------------ */

let decks = [];

async function showHome() {
  show("view-home");
  grammar.refreshHome();
  try {
    const [deckList, stats] = await Promise.all([api("/decks"), api("/stats").catch(() => null)]);
    decks = deckList;
    renderHero(stats);
    renderDecks();
  } catch (ex) {
    toast(ex.message);
  }
}

function renderHero(stats) {
  const total = decks.reduce((n, d) => n + d.count, 0);
  const known = decks.reduce((n, d) => n + d.known, 0);
  const learning = decks.reduce((n, d) => n + d.learning, 0);
  $("#hero-known").textContent = known;
  $("#hero-total").textContent = total;
  $("#leg-known").textContent = known;
  $("#leg-learning").textContent = learning;
  $("#leg-fresh").textContent = total - known - learning;
  setBar($("#hero-bar"), known, learning, total);
  const streak = stats?.streak ?? 0;
  const today = stats?.today ?? 0;
  $("#stat-streak").textContent = streak;
  $("#stat-streak-label").textContent = streak === 1 ? "Tag in Folge" : "Tage in Folge";
  $("#stat-today").textContent = today;
  $("#stat-today-label").textContent = today === 1 ? "Antwort heute" : "Antworten heute";
  $("#learn-all-btn").disabled = total === 0;
}

function renderDecks() {
  const list = $("#deck-list");
  list.innerHTML = "";
  $("#deck-empty").hidden = decks.length > 0;
  for (const deck of decks) {
    const el = document.createElement("div");
    el.className = "deck";
    el.innerHTML = `
      <div class="deck-top">
        <div class="deck-name"></div>
        <button class="menu-btn" aria-label="Optionen">⋯</button>
      </div>
      <div class="deck-meta"><span class="count"></span><span class="known"></span></div>
      <div class="stackbar"><span class="known"></span><span class="learning"></span></div>
      <div class="deck-actions">
        <button class="btn small" data-act="edit">Karten</button>
        <button class="btn primary small" data-act="learn">Lernen</button>
      </div>`;
    el.querySelector(".deck-name").textContent = deck.name;
    el.querySelector(".deck-meta .count").textContent = plural(deck.count, "Karte", "Karten");
    el.querySelector(".deck-meta .known").innerHTML = deck.count ? `<b>${deck.known}</b> sitzen` : "";
    setBar(el.querySelector(".stackbar"), deck.known, deck.learning, deck.count);
    const learnBtn = el.querySelector('[data-act="learn"]');
    learnBtn.disabled = deck.count === 0;
    learnBtn.onclick = () => openSetup(deck);
    el.querySelector('[data-act="edit"]').onclick = () => openEditor(deck);
    el.querySelector(".menu-btn").onclick = (e) => {
      e.stopPropagation();
      menuDeck = deck;
      openMenu($("#menu"), e.currentTarget);
    };
    list.appendChild(el);
  }
}

$("#new-deck-btn").addEventListener("click", async () => {
  const name = prompt("Name des neuen Stapels:", "");
  if (name === null) return;
  try {
    const deck = await api("/decks", { method: "POST", body: { name } });
    openEditor({ ...deck, count: 0 });
  } catch (ex) {
    toast(ex.message);
  }
});

// new deck straight from a word list
$("#import-deck-btn").addEventListener("click", async () => {
  const name = prompt("Name des neuen Stapels für die importierten Wörter:", "");
  if (name === null) return;
  try {
    const deck = await api("/decks", { method: "POST", body: { name } });
    await showHome();
    importer.open(deck);
  } catch (ex) {
    toast(ex.message);
  }
});

$("#learn-all-btn").addEventListener("click", () => openSetup(ALL_DECKS));
$("#words-btn").addEventListener("click", () => showWords());

/* ---------- deck menu (⋯) ---------- */

let menuDeck = null;

// Show a dropdown menu right-aligned below its button.
function openMenu(menu, button) {
  closeMenu();
  menu.hidden = false;
  const r = button.getBoundingClientRect();
  menu.style.top = `${r.bottom + 6}px`;
  menu.style.left = `${Math.max(8, r.right - menu.offsetWidth)}px`;
}

function closeMenu() {
  $$(".menu").forEach((m) => (m.hidden = true));
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".menu")) closeMenu();
});

$("#menu").addEventListener("click", async (e) => {
  const action = e.target.closest("[data-menu]")?.dataset.menu;
  const deck = menuDeck;
  closeMenu();
  if (!deck) return;
  try {
    if (action === "import") return importer.open(deck);
    if (action === "rename") {
      const name = prompt("Neuer Name:", deck.name);
      if (!name || !name.trim()) return;
      await api(`/decks/${deck.id}`, { method: "PATCH", body: { name } });
    } else if (action === "delete") {
      if (!confirm(`Stapel „${deck.name}“ mit ${plural(deck.count, "Karte", "Karten")} wirklich löschen?`)) return;
      await api(`/decks/${deck.id}`, { method: "DELETE" });
      storage(SESSION_KEY(deck.id), null);
    }
    showHome();
  } catch (ex) {
    toast(ex.message);
  }
});

/* ------------------------------------------------------------------ */
/* All words                                                           */
/* ------------------------------------------------------------------ */

const words = { cards: [], filter: "all" };

async function showWords() {
  show("view-words");
  $("#word-list").innerHTML = '<p class="empty">Lade Wörter …</p>';
  try {
    const [deckList, cards] = await Promise.all([api("/decks"), api("/cards")]);
    decks = deckList;
    words.cards = cards;
    renderWords();
  } catch (ex) {
    toast(ex.message);
  }
}

function renderWords() {
  const counts = countStatus(words.cards);
  counts.all = words.cards.length;
  for (const chip of $$("#word-filters .chip")) {
    chip.classList.toggle("active", chip.dataset.filter === words.filter);
    chip.querySelector("b").textContent = counts[chip.dataset.filter];
  }

  const list = $("#word-list");
  list.innerHTML = "";
  const visible = words.cards.filter((c) => words.filter === "all" || cardStatus(c) === words.filter);
  $("#word-empty").hidden = visible.length > 0;

  const labels = { known: "Sitzt", learning: "Am Lernen", fresh: "Neu" };
  for (const deck of decks) {
    const cards = visible.filter((c) => c.deck_id === deck.id);
    if (!cards.length) continue;
    const section = document.createElement("section");
    section.className = "word-section";
    section.innerHTML = `<h2></h2><div class="word-grid"></div>`;
    section.querySelector("h2").textContent = deck.name;
    section.querySelector("h2").insertAdjacentHTML("beforeend", `<span>${plural(cards.length, "Wort", "Wörter")}</span>`);
    const grid = section.querySelector(".word-grid");
    for (const card of cards) {
      const status = cardStatus(card);
      const el = document.createElement("button");
      el.className = "word";
      el.innerHTML = `
        <div class="word-cards">
          <div class="flashcard"><img alt="Englisch"></div>
          <div class="flashcard"><img alt="Deutsch"></div>
        </div>
        <div class="word-foot">
          <span class="badge ${status}">${labels[status]}</span>
          <span>${card.last_reviewed ? `✓ ${card.correct_count} · ✕ ${card.wrong_count}` : "noch nicht gelernt"}</span>
        </div>`;
      const [en, de] = el.querySelectorAll("img");
      en.src = card.english;
      de.src = card.german;
      el.onclick = () => openEditor(deck, card.id);
      grid.appendChild(el);
    }
    list.appendChild(section);
  }
}

$("#word-filters").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  words.filter = chip.dataset.filter;
  renderWords();
});

/* ------------------------------------------------------------------ */
/* Card editor                                                         */
/* ------------------------------------------------------------------ */

const edit = { deck: null, cards: [], index: 0, busy: false };

async function openEditor(deck, cardId) {
  edit.deck = deck;
  edit.cards = [];
  $("#edit-title").textContent = deck.name;
  show("view-edit");
  setEditIndex(0);
  $("#view-edit .stage").classList.add("loading");
  await withBusy(async () => {
    edit.cards = await api(`/decks/${deck.id}/cards`);
    const i = edit.cards.findIndex((c) => c.id === cardId);
    setEditIndex(i >= 0 ? i : edit.cards.length); // default: a fresh blank card
  });
  $("#view-edit .stage").classList.remove("loading");
}

function setEditIndex(i) {
  edit.index = i;
  const card = edit.cards[i];
  if (card) {
    pads.en.load(card.english);
    pads.de.load(card.german);
    $("#edit-counter").textContent = `${i + 1} / ${edit.cards.length}`;
  } else {
    pads.en.reset();
    pads.de.reset();
    $("#edit-counter").textContent = `Neu · ${edit.cards.length + 1}`;
  }
  $("#edit-delete").hidden = !card;
  $("#edit-prev").disabled = i === 0;
  $("#edit-next").textContent = card ? "Weiter →" : "Speichern & weiter →";
}

// Saves the current card if needed.
// Returns "saved", "unchanged", "empty" (blank new card) or "incomplete".
async function saveCurrentCard() {
  const card = edit.cards[edit.index];
  const changed = pads.en.dirty || pads.de.dirty;
  if (!card && pads.en.isEmpty() && pads.de.isEmpty()) return "empty";
  if (card && !changed) return "unchanged";
  if (pads.en.isEmpty() || pads.de.isEmpty()) return "incomplete";

  await Promise.all([pads.en.ready, pads.de.ready]);
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

const learn = { deck: null, cards: new Map(), loaded: false, session: null, revealed: false, pending: [] };

async function loadLearnCards() {
  const path = learn.deck.id === ALL_DECKS.id ? "/cards" : `/decks/${learn.deck.id}/cards`;
  const cards = await api(path);
  learn.cards = new Map(cards.map((c) => [c.id, c]));
  return cards;
}

async function openSetup(deck) {
  learn.deck = deck;
  learn.cards = new Map();
  learn.loaded = false;
  $("#setup-title").textContent = deck.name;
  $("#setup-info").textContent = "Lade Karten …";
  const open = storage(SESSION_KEY(deck.id));
  $("#resume-box").hidden = !(open && open.queue?.length);
  if (open && open.queue?.length) {
    $("#resume-info").textContent = `${LANG[open.dir]} zuerst · noch ${open.queue.length} von ${open.total} Karten`;
  }
  show("view-setup");
  try {
    const cards = await loadLearnCards();
    if (learn.deck !== deck) return; // another deck was opened meanwhile
    learn.loaded = true;
    const { known } = countStatus(cards);
    const unsure = cards.length - known;
    $("#setup-info").textContent = `${plural(cards.length, "Karte", "Karten")} · ${known} ${known === 1 ? "sitzt" : "sitzen"} schon`;
    const only = $("#only-unsure");
    only.disabled = unsure === 0 || unsure === cards.length;
    if (only.disabled) only.checked = false;
    $("#only-unsure-label").textContent = `Nur Wörter, die noch nicht sitzen (${unsure})`;
  } catch (ex) {
    toast(ex.message);
  }
}

$$(".choice").forEach((btn) =>
  btn.addEventListener("click", () => {
    if (!learn.loaded) return toast("Karten werden noch geladen …");
    let cards = [...learn.cards.values()];
    if ($("#only-unsure").checked) cards = cards.filter((c) => cardStatus(c) !== "known");
    if (!cards.length) return toast("Keine Karten zum Lernen.");
    const ids = cards.map((c) => c.id);
    if ($("#shuffle").checked) shuffle(ids);
    learn.session = {
      deckId: learn.deck.id,
      dir: btn.dataset.dir, // side shown first
      queue: ids,
      total: ids.length,
      wrong: 0,
      nowKnown: 0,
    };
    startLearning();
  }),
);

$("#resume-btn").addEventListener("click", () => {
  if (!learn.loaded) return toast("Karten werden noch geladen …");
  learn.session = { wrong: 0, nowKnown: 0, ...storage(SESSION_KEY(learn.deck.id)) };
  startLearning();
});

function saveSession() {
  storage(SESSION_KEY(learn.session.deckId), learn.session.queue.length ? learn.session : null);
}

function startLearning() {
  const s = learn.session;
  s.queue = s.queue.filter((id) => learn.cards.has(id)); // drop deleted cards
  show("view-learn");
  showCurrentCard();
}

function showCurrentCard() {
  const s = learn.session;
  saveSession();
  $("#progress-bar").style.width = `${((s.total - s.queue.length) / s.total) * 100}%`;
  $("#learn-counter").textContent = `${s.queue.length} übrig`;
  if (!s.queue.length) return finishLearning();

  const card = learn.cards.get(s.queue[0]);
  const answerDir = s.dir === "de" ? "en" : "de";
  learn.revealed = false;

  // turn the card back to the front without animation
  const flip = $("#flip");
  flip.classList.add("instant");
  flip.classList.remove("flipped");
  void flip.offsetWidth;
  flip.classList.remove("instant");

  $("#prompt-img").src = s.dir === "de" ? card.german : card.english;
  $("#solution-img").src = s.dir === "de" ? card.english : card.german;
  $("#prompt-label").textContent = LANG[s.dir];
  $("#answer-label").textContent = `${LANG[answerDir]} – hier schreiben`;
  $("#card-origin").textContent =
    s.deckId === ALL_DECKS.id ? decks.find((d) => d.id === card.deck_id)?.name ?? "" : "";
  $("#reveal-btn").hidden = false;
  $("#judge").hidden = true;
  pads.answer.reset();
}

function reveal() {
  if (learn.revealed) return;
  learn.revealed = true;
  const answerDir = learn.session.dir === "de" ? "en" : "de";
  $("#flip").classList.add("flipped");
  $("#prompt-label").textContent = `Lösung · ${LANG[answerDir]}`;
  $("#reveal-btn").hidden = true;
  $("#judge").hidden = false;
}

// tap the card to peek at the question again
$("#flip").addEventListener("click", () => {
  if (!learn.revealed) return;
  const flipped = $("#flip").classList.toggle("flipped");
  const s = learn.session;
  $("#prompt-label").textContent = flipped ? `Lösung · ${LANG[s.dir === "de" ? "en" : "de"]}` : LANG[s.dir];
});

function judge(correct) {
  if (!learn.revealed) return;
  const s = learn.session;
  const id = s.queue.shift();
  const card = learn.cards.get(id);
  if (!correct) {
    s.queue.push(id);
    s.wrong++;
  }
  const wasKnown = cardStatus(card) === "known";
  const saving = api(`/cards/${id}/review`, { method: "POST", body: { correct } })
    .then((update) => {
      Object.assign(card, update);
      if (!wasKnown && cardStatus(card) === "known") s.nowKnown++;
    })
    .catch(() => {
      // not saved: the card stays in the round so the answer isn't lost
      if (!s.queue.includes(id)) s.queue.push(id);
      storage(SESSION_KEY(s.deckId), s);
      toast("Antwort nicht gespeichert – die Karte kommt nochmal dran");
    });
  learn.pending.push(saving);
  showCurrentCard();
}

$("#reveal-btn").addEventListener("click", reveal);
$("#right-btn").addEventListener("click", () => judge(true));
$("#wrong-btn").addEventListener("click", () => judge(false));

// keyboard (e.g. iPad with keyboard): space = solution, → = right, ← = wrong
document.addEventListener("keydown", (e) => {
  if (!isVisible("view-learn")) return;
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    reveal();
  } else if (e.key === "ArrowRight") judge(true);
  else if (e.key === "ArrowLeft") judge(false);
});

async function finishLearning() {
  const s = learn.session;
  learn.revealed = false;
  $("#judge").hidden = true;
  $("#reveal-btn").hidden = true;
  // wait until every answer is saved; failed ones come back into the round
  await Promise.allSettled(learn.pending);
  learn.pending = [];
  if (learn.session !== s || !isVisible("view-learn")) return; // user left meanwhile
  if (s.queue.length) return showCurrentCard();

  storage(SESSION_KEY(s.deckId), null);
  $("#done-stats").textContent =
    `${plural(s.total, "Karte", "Karten")} gelernt` +
    (s.wrong ? ` · ${s.wrong}× nochmal` : " · alles beim ersten Mal richtig!");
  $("#done-progress").textContent = "";
  setBar($("#done-bar"), 0, 0, 0);
  show("view-done");
  const cards = [...learn.cards.values()];
  const c = countStatus(cards);
  setBar($("#done-bar"), c.known, c.learning, cards.length);
  $("#done-progress").textContent =
    `In „${learn.deck.name}“ sitzen jetzt ${c.known} von ${cards.length} Wörtern` +
    (s.nowKnown ? ` (+${s.nowKnown} neu)` : "");
}

$("#again-btn").addEventListener("click", () => openSetup(learn.deck));

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

$$("[data-home]").forEach((b) =>
  b.addEventListener("click", async () => {
    if (isVisible("view-edit")) {
      let ok = false;
      await withBusy(async () => (ok = await leaveCard()));
      if (!ok) return;
    }
    showHome();
  }),
);

/* ------------------------------------------------------------------ */
/* Start                                                               */
/* ------------------------------------------------------------------ */

const grammar = initGrammar({ api, show, toast, setBar, plural, shuffle, isVisible });
const importer = initImport({ api, toast, plural, onDone: () => showHome() });

if (storage(TOKEN_KEY)) start().catch(() => show("view-login"));
else show("view-login");
