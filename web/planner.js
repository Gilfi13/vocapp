// Kalender & Tagesplaner: Termine, To-dos, Pausen-Tasks und Lernaufgaben.
// Einträge liegen auf dem Server (/planner); "Tag planen" fragt Claude
// (/planner/plan) und verteilt sonst nach einer einfachen Regel.
// Verbunden mit MyStudy: Lernaufgaben haben einen "link" (vocab, grammar,
// subject:<id>), öffnen den passenden Bereich und haken sich nach einer
// Lernrunde selbst ab.

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
const toMin = (t) => { if (!t || !/^\d{1,2}:\d{2}$/.test(t)) return null; const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const fromMin = (n) => (n >= 1440 ? "24:00" : `${pad(Math.floor(n / 60))}:${pad(n % 60)}`);
const fmtDur = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`);
const today = () => ymd(new Date());
const nowMinutes = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };

const WD = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const WDS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const MO = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const DURS = [5, 10, 15, 30, 45, 60, 90, 120, 180];
const COLORS = ["coral", "orange", "yellow", "green", "teal", "blue", "violet", "pink"];
const EMOJIS = ["📅", "✏️", "💻", "📚", "🧠", "📞", "✉️", "👥", "🩺", "👓", "⚽", "🏃", "🧘", "🍽️", "☕", "🛒", "🧺", "🧹", "🚿", "😴", "🚆", "💶", "🎉", "🎵", "🎮", "🌱", "❤️", "⭐"];
const GUESS = [
  [/fußball|fussball|training|spiel:/i, "⚽"], [/sport|gym|laufen|joggen|fitness|rad/i, "🏃"], [/yoga|medit/i, "🧘"],
  [/essen|mittag|frühstück|abendessen|kochen|lunch/i, "🍽️"], [/kaffee|pause/i, "☕"],
  [/anruf|telefon|call|anrufen/i, "📞"], [/mail|brief/i, "✉️"], [/optiker|brille/i, "👓"],
  [/arzt|zahn|physio|therap/i, "🩺"], [/einkauf|supermarkt|besorg/i, "🛒"],
  [/wäsche/i, "🧺"], [/putz|aufräum|staubsaug|spül|küche/i, "🧹"],
  [/vokabel|lern|schule|uni|hausaufgab|lesen|prüfung|klausur|grammatik/i, "📚"],
  [/meeting|besprechung|team/i, "👥"], [/schlaf|nickerchen|ruhe/i, "😴"],
  [/bahn|zug|fahrt|auto|bus|flug|losfahren/i, "🚆"], [/geld|bank|rechnung|steuer|überweis/i, "💶"],
  [/geburtstag|party|freunde|feier/i, "🎉"], [/musik|gitarre|klavier/i, "🎵"],
  [/arbeit|projekt|bewerbung|code|programm|sql|präsentation/i, "💻"],
];
const KIND_DEF = {
  todo: { color: "coral", emoji: "✏️" },
  pausetask: { color: "green", emoji: "🌱" },
  termin: { color: "blue", emoji: "📅" },
  pause: { color: "yellow", emoji: "☕" },
};
const REPEAT_LABEL = { daily: "täglich", weekdays: "Mo–Fr", weekly: "wöchentlich" };
const DEFAULT_PREFS = {
  dayStart: "08:00", dayEnd: "21:00", focusMin: 90, breakMin: 15, lunch: "12:30", lunchMin: 45, wishes: "",
  // Anfahrt zur Uni: Fußweg zum Heimatbahnhof, Bahnhof → Hochschule, Zugliste "06:17-07:27" pro Zeile
  travelOn: true, homeStation: "Memmingen", uniStation: "Neu-Ulm", walkStation: 0, walkUni: 20, rideMin: 35,
  trainsOut: "", trainsBack: "", about: "",
  // Wochentage (0 = So … 6 = Sa), an denen hin bzw. zurück mit dem Zug gefahren wird
  trainOutDays: [1, 2, 3, 4, 5], trainBackDays: [1, 2, 3, 4, 5],
  // Hinfahrt ohne Zug (z. B. mit dem Auto) an diesen Tagen, feste Zeiten
  carOutDays: [], carDep: "07:00", carArr: "07:50", carTitle: "Fahrt nach Ulm",
  // Sport daheim: ab diesem Tag beim Planen vorschlagen (leer = aus)
  sportFrom: "", sportPerWeek: 3, sportMin: 45, sportMade: [],
  noTravel: [], // Tage ohne automatische Anfahrt
  // nach jeder Vorlesung eine Nacharbeiten-Aufgabe bis zur nächsten Vorlesung des Fachs
  reviewOn: true, reviewMin: 45, reviewMade: [],
};
const LINK_LABEL = { vocab: "Vokabeln lernen", grammar: "Grammatik trainieren" };

const guessEmoji = (title, k) => { for (const [re, e] of GUESS) if (re.test(title)) return e; return KIND_DEF[k].emoji; };
const kindOf = (it) => it.kind || "todo";
const subKind = (it) => (kindOf(it) === "todo" && it.forBreak ? "pausetask" : kindOf(it));
const durOf = (it) => Math.max(5, Number(it.duration) || 30);
const colorVar = (c) => `var(--pl-${c})`;
const colorOf = (it) => colorVar(COLORS.includes(it.color) ? it.color : KIND_DEF[subKind(it)].color);
const emojiOf = (it) => it.emoji || KIND_DEF[subKind(it)].emoji;
const isOpenTodo = (it) => kindOf(it) === "todo" && !it.done;
const newId = () => "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function occursOn(it, date) {
  const r = it.repeat || "none";
  if (r === "none" || kindOf(it) === "todo") return it.date === date;
  if (!it.date || date < it.date) return false;
  if (it.until && date > it.until) return false;
  if (Array.isArray(it.skip) && it.skip.includes(date)) return false;
  const dow = parseYmd(date).getDay();
  if (r === "daily") return true;
  if (r === "weekdays") return dow >= 1 && dow <= 5;
  if (r === "weekly") return dow === parseYmd(it.date).getDay();
  return it.date === date;
}

export function initPlanner({ api, show, toast, openStudy }) {
  const $ = (sel) => document.querySelector(sel);
  const items = new Map();
  let prefs = { ...DEFAULT_PREFS };
  let notes = {};
  let cur = today();
  let loaded = false;
  let tab = "day";
  let dragId = null;
  const canDrag = window.matchMedia?.("(pointer: fine)").matches ?? false;

  /* ---------- data ---------- */

  async function load() {
    const data = await api("/planner");
    items.clear();
    for (const it of data.items) { const { id, ...rest } = it; items.set(id, rest); }
    prefs = { ...DEFAULT_PREFS, ...(data.prefs || {}) };
    notes = data.notes || {};
    loaded = true;
  }

  // Save and delete entries in one request; the screen updates right away.
  async function sync(upsert = [], remove = []) {
    for (const { id, data } of upsert) items.set(id, data);
    for (const id of remove) items.delete(id);
    renderAll();
    try {
      await api("/planner/sync", { method: "POST", body: { upsert, remove } });
    } catch (ex) {
      toast(`Nicht gespeichert: ${ex.message}`);
      await load().catch(() => {});
      renderAll();
    }
  }
  const save = (id, data) => sync([{ id, data }]);
  const patch = (id, data) => { const old = items.get(id); return old ? save(id, { ...old, ...data }) : null; };
  const patchMany = (list) => sync(list.filter(([id]) => items.has(id)).map(([id, data]) => ({ id, data: { ...items.get(id), ...data } })));

  async function setNote(date, text, by) {
    if (text) notes[date] = { text, by }; else delete notes[date];
    renderNote();
    try {
      if (text) await api(`/planner/notes/${date}`, { method: "PUT", body: { text, by } });
      else await api(`/planner/notes/${date}`, { method: "DELETE" });
    } catch { /* the note is only a nice-to-have */ }
  }

  function dayItems(date) {
    const out = [];
    for (const [id, it] of items) if (toMin(it.start) != null && occursOn(it, date)) out.push({ ...it, id, date });
    return out.sort((a, b) => toMin(a.start) - toMin(b.start) || durOf(b) - durOf(a));
  }
  function inboxItems(date) {
    const t = today();
    return [...items.entries()].map(([id, it]) => ({ ...it, id }))
      .filter((it) => isOpenTodo(it) && (toMin(it.start) == null ? (!it.date || it.date <= date) : it.date < t))
      .sort((a, b) => String(a.due || "9999").localeCompare(String(b.due || "9999")) || (a.priority || 2) - (b.priority || 2) || String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
  }

  /* ---------- week strip ---------- */

  function renderWeek() {
    const w = $("#pl-week");
    w.textContent = "";
    const monday = addDays(cur, -((parseYmd(cur).getDay() + 6) % 7));
    const prev = el("button", "pl-nav", "‹");
    prev.setAttribute("aria-label", "Vorherige Woche");
    prev.onclick = () => go(addDays(cur, -7));
    w.append(prev);
    const t = today();
    for (let i = 0; i < 7; i++) {
      const ds = addDays(monday, i);
      const dd = parseYmd(ds);
      const b = el("button", "pl-wd" + (ds === cur ? " sel" : "") + (ds === t ? " today" : ""));
      b.setAttribute("aria-label", `${WD[dd.getDay()]} ${dd.getDate()}. ${MO[dd.getMonth()]}`);
      b.append(el("span", "n", WDS[dd.getDay()]), el("span", "d", dd.getDate()));
      const dots = el("span", "dots");
      dayItems(ds).filter((x) => kindOf(x) !== "pause" && x.source !== "travel").slice(0, 4).forEach((x) => {
        const i2 = el("i");
        i2.style.setProperty("--c", colorOf(x));
        dots.append(i2);
      });
      b.append(dots);
      b.onclick = () => go(ds);
      w.append(b);
    }
    const next = el("button", "pl-nav", "›");
    next.setAttribute("aria-label", "Nächste Woche");
    next.onclick = () => go(addDays(cur, 7));
    w.append(next);
  }

  /* ---------- day ---------- */

  function freeMinutes(list) {
    const s = toMin(prefs.dayStart) ?? 480;
    const e = toMin(prefs.dayEnd) ?? 1260;
    let cursor = cur === today() ? Math.max(s, nowMinutes()) : s;
    let free = 0;
    for (const it of list) {
      if (it.forBreak) continue;
      const a = toMin(it.start);
      if (a > cursor) free += Math.min(a, e) - cursor;
      cursor = Math.max(cursor, a + durOf(it));
      if (cursor >= e) break;
    }
    if (e > cursor) free += e - cursor;
    return Math.max(0, free);
  }

  function renderHead(list) {
    const d = parseYmd(cur);
    const t = today();
    const rel = cur === t ? "Heute" : cur === addDays(t, 1) ? "Morgen" : cur === addDays(t, -1) ? "Gestern" : null;
    $("#pl-day-title").textContent = `${rel || WD[d.getDay()]}, ${d.getDate()}. ${MO[d.getMonth()]}`;
    const sub = $("#pl-day-sub");
    sub.textContent = "";
    const todos = list.filter((i) => kindOf(i) === "todo");
    const termine = list.filter((i) => kindOf(i) === "termin").length;
    const add = (val, label) => { const s = el("span"); s.append(el("b", null, val), ` ${label}`); sub.append(s); };
    if (rel) sub.append(el("span", null, WD[d.getDay()]));
    add(todos.length ? `${todos.filter((i) => i.done).length}/${todos.length}` : "0", todos.length === 1 ? "To-do" : "To-dos");
    add(String(termine), termine === 1 ? "Termin" : "Termine");
    const free = freeMinutes(list);
    if (free > 0) add(fmtDur(free), "frei");
  }

  function renderDay() {
    const box = $("#pl-rows");
    box.textContent = "";
    const list = dayItems(cur);
    renderHead(list);

    // break tasks are shown inside the break they fall into
    const pauses = list.filter((i) => kindOf(i) === "pause");
    const inPause = new Map();
    const main = [];
    for (const it of list) {
      if (kindOf(it) === "todo" && it.forBreak) {
        const s = toMin(it.start);
        const p = pauses.find((p) => s >= toMin(p.start) && s < toMin(p.start) + durOf(p));
        if (p) {
          if (!inPause.has(p.id)) inPause.set(p.id, []);
          inPause.get(p.id).push(it);
          continue;
        }
      }
      main.push(it);
    }

    const dayS = toMin(prefs.dayStart) ?? 480;
    const dayE = toMin(prefs.dayEnd) ?? 1260;
    const nowM = nowMinutes();
    const isToday = cur === today();
    // the item running right now gets the red line inside its capsule
    const running = isToday ? main.find((i) => toMin(i.start) <= nowM && nowM < toMin(i.start) + durOf(i)) : null;
    let nowPlaced = !isToday || !!running;
    const putNow = (before) => {
      if (!nowPlaced && nowM < before) { nowPlaced = true; box.append(nowRow(nowM)); }
    };
    const gapUntil = (from, to) => {
      if (!nowPlaced && nowM >= from && nowM < to) { putNow(to); box.append(gapRow(Math.max(from, nowM), to)); }
      else { putNow(from); box.append(gapRow(from, to)); }
    };
    let cursor = Math.min(dayS, ...main.map((i) => toMin(i.start)));
    let prevEnd = -1;
    for (const it of main) {
      const s = toMin(it.start);
      if (s - cursor >= 10) gapUntil(cursor, s);
      putNow(s);
      box.append(itemRow(it, inPause.get(it.id) || [], s < prevEnd, it === running ? nowM : null));
      prevEnd = Math.max(prevEnd, s + durOf(it));
      cursor = Math.max(cursor, s + durOf(it));
    }
    if (dayE - cursor >= 10) gapUntil(cursor, dayE);
    putNow(1441);

    if (!main.length) {
      const em = el("div", "pl-empty");
      em.append(el("strong", null, "Der Tag ist noch frei"),
        "Trag To-dos in den Eingang ein und tippe auf „Tag planen“. Termine legst du mit dem Plus an.");
      box.prepend(em);
    }
  }

  function nowRow(m) {
    const r = el("div", "pl-now");
    r.append(el("span", "tm", fromMin(m)), el("span", "ln"));
    return r;
  }

  function gapRow(a, b) {
    const r = el("div", "pl-gap");
    r.append(el("span", "tm", fromMin(a)), el("span", "dotc"));
    const btn = el("button", null, `+ ${fmtDur(b - a)} frei`);
    btn.setAttribute("aria-label", `Etwas um ${fromMin(a)} eintragen`);
    btn.onclick = () => openGapPicker(Math.ceil(a / 5) * 5, b);
    r.dataset.drop = Math.ceil(a / 5) * 5;
    r.append(btn);
    return r;
  }

  // Tap on free time: put an open to-do there, or create a new entry.
  function openGapPicker(start, end) {
    const open = inboxItems(cur);
    sheet.textContent = "";
    sheet.append(el("div", "pl-grab"), el("h3", null, `${fromMin(start)} – ${fromMin(end)} frei`));
    if (open.length) {
      sheet.append(el("p", "pl-hint", "Tipp ein To-do an, dann kommt es hier hin."));
      const ul = el("ul", "pl-list pl-pick");
      for (const it of open) {
        const li = el("li");
        li.style.setProperty("--c", colorOf(it));
        const b = el("button", "ttl", it.title);
        b.onclick = () => { closeSheet(); placeAt(it.id, start); };
        const fits = durOf(it) <= end - start;
        const m = el("span", "m" + (fits ? "" : " late"), fmtDur(durOf(it)) + (fits ? "" : " · zu lang"));
        li.append(el("span", "e", emojiOf(it)), b, m);
        li.onclick = (e) => { if (e.target === li) b.click(); };
        ul.append(li);
      }
      sheet.append(ul);
    } else {
      sheet.append(el("p", "pl-hint", "Im Eingang wartet gerade nichts."));
    }
    const acts = el("div", "pl-actions");
    const cancel = el("button", "btn ghost", "Abbrechen");
    cancel.onclick = closeSheet;
    const add = el("button", "btn primary", "Neuer Eintrag");
    add.onclick = () => openSheet(null, { date: cur, start: fromMin(start) });
    acts.append(el("span", "spacer"), cancel, add);
    sheet.append(acts);
    sheetBg.hidden = false;
  }

  function placeAt(id, start) {
    const it = items.get(id);
    if (!it) return;
    patch(id, { date: cur, start: fromMin(Math.max(0, Math.min(1435, start))) });
    toast(`„${it.title}“ um ${fromMin(start)} eingeplant`);
  }

  function itemRow(it, minis, overlap, nowIn) {
    const k = kindOf(it);
    const s = toMin(it.start);
    const e = s + durOf(it);
    const r = el("div", "pl-it" + (it.done ? " done" : ""));
    // drop target: a to-do dropped here starts when this block ends (break tasks go into the break)
    r.dataset.drop = e;
    if (k === "pause") r.dataset.dropBreak = s;
    if (k === "todo" && canDrag) makeDraggable(r, it.id);
    r.style.setProperty("--c", colorOf(it));
    const tm = el("div", "tm", fromMin(s));
    tm.append(el("span", null, fromMin(e)));
    const cap = el("div", "pl-cap", emojiOf(it));
    const capH = Math.max(56, Math.min(200, durOf(it) * 1.1)) + minis.length * 22;
    cap.style.height = `${capH}px`;
    if (nowIn != null) {
      r.classList.add("running");
      const line = el("div", "pl-nowin");
      line.style.top = `${6 + Math.round(((nowIn - s) / durOf(it)) * capH)}px`;
      line.append(el("span", "tm", fromMin(nowIn)), el("span", "ln"));
      r.append(line);
    }
    const card = el("div", "card");
    const ttl = el("button", "ttl", it.title || (k === "pause" ? "Pause" : "Ohne Titel"));
    ttl.onclick = () => openSheet(it.id, null, it.date);
    card.append(ttl);
    const meta = el("span", "meta");
    meta.append(fmtDur(durOf(it)));
    if (it.source === "travel") meta.append(el("span", "pl-pill", "Anfahrt"));
    else if (k === "termin") meta.append(el("span", "pl-pill", it.place === "uni" ? "Uni" : "Termin"));
    if (k === "pause") meta.append(el("span", "pl-pill", "Pause"));
    if (REPEAT_LABEL[it.repeat]) meta.append(el("span", "pl-pill", REPEAT_LABEL[it.repeat]));
    if (it.notes) meta.append(el("span", "note", it.notes));
    if (overlap) meta.append(el("span", "pl-pill warn", "überschneidet sich"));
    card.append(meta);
    if (it.link && !it.done) card.append(studyButton(it));
    if (minis.length) {
      const w = el("div", "pl-minis");
      for (const m of minis) {
        const c = el("div", "pl-mini" + (m.done ? " done" : ""));
        c.style.setProperty("--c", colorOf(m));
        const label = el("button", "lbl", `${emojiOf(m)} ${m.title} · ${durOf(m)} min`);
        label.onclick = () => openSheet(m.id);
        c.append(checkBtn(m), label);
        if (m.link && !m.done) c.append(studyButton(m, true));
        w.append(c);
      }
      card.append(w);
    }
    r.append(tm, cap, card, k === "todo" ? checkBtn(it) : el("span"));
    return r;
  }

  function studyButton(it, small) {
    const b = el("button", "pl-go" + (small ? " small" : ""), small ? "Los" : `${LINK_LABEL[it.link] || "Öffnen"} →`);
    b.onclick = (e) => { e.stopPropagation(); openStudy(it.link); };
    return b;
  }

  function checkBtn(it) {
    const c = el("button", "pl-chk" + (it.done ? " on" : ""));
    c.setAttribute("aria-label", it.done ? "Als offen markieren" : "Erledigt");
    c.onclick = (e) => { e.stopPropagation(); patch(it.id, { done: !it.done }); };
    return c;
  }

  function renderNote() {
    const box = $("#pl-note");
    box.textContent = "";
    const n = notes[cur];
    if (!n?.text) return;
    const d = el("div", "pl-notecard");
    const txt = el("div");
    txt.append(el("span", "who", n.by === "claude" ? "Claude zu deinem Plan" : "Zum Plan"), n.text);
    d.append(el("span", "av", n.by === "claude" ? "C" : "i"), txt);
    box.append(d);
  }

  function renderInbox() {
    const box = $("#pl-inbox");
    box.textContent = "";
    const list = inboxItems(cur);
    $("#pl-inbox-count").textContent = list.length ? `${list.length} offen` : "";
    $("#pl-tab-count").textContent = list.length ? `· ${list.length}` : "";
    if (!list.length) {
      box.append(el("p", "pl-empty small", "Alles eingeplant. Neue To-dos warten hier, bis sie einen Platz im Tag bekommen."));
      return;
    }
    for (const [label, arr] of [["To-dos", list.filter((i) => !i.forBreak)], ["Für die Pause", list.filter((i) => i.forBreak)]]) {
      if (!arr.length) continue;
      box.append(el("div", "pl-sub", label));
      const ul = el("ul", "pl-list");
      for (const it of arr) {
        const li = el("li");
        li.style.setProperty("--c", colorOf(it));
        if (canDrag) makeDraggable(li, it.id);
        const tt = el("button", "ttl", it.title);
        tt.onclick = () => openSheet(it.id);
        const m = el("span", "m");
        if (toMin(it.start) != null && it.date < today()) { m.append(el("span", "late", "verpasst"), el("br")); }
        else if (it.due) { m.append(el("span", it.due <= addDays(today(), 1) ? "late" : null, `bis ${shortDate(it.due)}`), el("br")); }
        else if (it.priority === 1) { m.append(el("span", "late", "wichtig"), el("br")); }
        m.append(fmtDur(durOf(it)));
        li.append(checkBtn(it), el("span", "e", emojiOf(it)), tt, m);
        if (it.link) li.append(studyButton(it, true));
        ul.append(li);
      }
      box.append(ul);
    }
  }

  function renderAll() {
    if (!loaded || $("#view-planner").hidden) return;
    renderWeek();
    renderDay();
    renderInbox();
    renderNote();
  }

  /* ---------- "Heute" card on the start page ---------- */

  async function refreshTodayCard() {
    const box = $("#today-card");
    if (!box) return;
    try {
      await load();
      await ensureTravel();
    } catch {
      box.hidden = true;
      return;
    }
    const t = today();
    const nowM = nowMinutes();
    const list = dayItems(t).filter((i) => !i.done && toMin(i.start) + durOf(i) > nowM && kindOf(i) !== "pause");
    const open = inboxItems(t).length;
    box.hidden = false;
    const ul = $("#today-list");
    ul.textContent = "";
    if (!list.length) ul.append(el("li", "muted", "Heute steht nichts mehr an."));
    for (const it of list.slice(0, 3)) {
      const li = el("li");
      li.style.setProperty("--c", colorOf(it));
      li.append(el("span", "t", it.start), el("span", "e", emojiOf(it)), el("span", "n", it.title));
      ul.append(li);
    }
    $("#today-more").textContent = open ? `${open} ${open === 1 ? "To-do wartet" : "To-dos warten"} im Eingang` : "";
  }

  /* ---------- add / edit sheet ---------- */

  const sheetBg = $("#pl-sheet-bg");
  const sheet = $("#pl-sheet");
  function closeSheet() { sheetBg.hidden = true; sheet.textContent = ""; }
  sheetBg.addEventListener("click", (e) => { if (e.target === sheetBg) closeSheet(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!sheetBg.hidden) closeSheet();
    else if (!$("#pl-chat").hidden) $("#pl-chat").hidden = true;
  });

  function field(label, input) {
    const f = el("label", "pl-field");
    f.append(el("span", "lbl", label), input);
    return f;
  }
  function selectEl(options, value) {
    const s = el("select");
    for (const [v, t] of options) { const o = el("option", null, t); o.value = v; s.append(o); }
    s.value = String(value);
    return s;
  }
  function inputEl(type, value, attrs = {}) {
    const i = el("input");
    i.type = type;
    i.value = value ?? "";
    Object.assign(i, attrs);
    return i;
  }

  function openTravelSheet(it) {
    sheet.textContent = "";
    sheet.append(el("div", "pl-grab"), el("h3", null, `${emojiOf(it)} ${it.title}`));
    sheet.append(el("p", "pl-hint", `${shortDate(it.date)} · ${it.start}–${fromMin(toMin(it.start) + durOf(it))}${it.notes ? ` · ${it.notes}` : ""}`));
    sheet.append(el("p", "pl-hint", "Die Anfahrt rechnet die App selbst aus deinen Uni-Terminen und der Zugliste aus. Ändern kannst du sie in den Einstellungen."));
    const acts = el("div", "pl-actions");
    const off = el("button", "btn danger-ghost", "Diesen Tag ohne Anfahrt");
    off.onclick = async () => {
      closeSheet();
      prefs.noTravel = [...new Set([...(prefs.noTravel || []), it.date])].filter((d) => d >= addDays(today(), -7));
      await ensureTravel();
      await savePrefs();
      toast(`Am ${shortDate(it.date)} keine Anfahrt mehr`);
    };
    const set = el("button", "btn ghost", "Anfahrt einstellen");
    set.onclick = openSettings;
    const close = el("button", "btn primary", "OK");
    close.onclick = closeSheet;
    acts.append(off, el("span", "spacer"), set, close);
    sheet.append(acts);
    sheetBg.hidden = false;
  }

  function openSheet(id, preset, occDate) {
    const it = id ? items.get(id) : null;
    if (id && !it) return;
    if (it?.source === "travel") return openTravelSheet({ ...it, id });
    const st = it ? { ...it } : { title: "", kind: "todo", duration: 30, priority: 2, date: preset?.date || null, start: preset?.start || null, repeat: "none" };
    let kind = subKind(st);
    let color = COLORS.includes(st.color) ? st.color : KIND_DEF[kind].color;
    let colorTouched = !!st.color;
    let emoji = st.emoji || null;
    let dur = durOf(st);
    const isSeries = !!it && REPEAT_LABEL[it.repeat];

    sheet.textContent = "";
    sheet.append(el("div", "pl-grab"), el("h3", null, it ? "Bearbeiten" : "Neuer Eintrag"));

    const seg = el("div", "pl-seg");
    const kinds = [["todo", "To-do"], ["termin", "Termin"], ["pausetask", "Pausen-Task"], ["pause", "Pause"]];
    for (const [k, label] of kinds) {
      const b = el("button", null, label);
      b.type = "button";
      b.dataset.k = k;
      b.onclick = () => {
        kind = k;
        if (!colorTouched) color = KIND_DEF[k].color;
        if (!it) dur = { todo: 30, termin: 60, pausetask: 10, pause: 15 }[k];
        paint();
      };
      seg.append(b);
    }

    const cap = el("div", "pl-cap");
    const title = inputEl("text", st.title, { placeholder: "Was?" });
    const preview = el("div", "pl-preview");
    preview.append(cap, field("Was?", title));
    const hint = el("p", "pl-hint");

    const durs = el("div", "pl-durs");
    for (const d of DURS.includes(dur) ? DURS : [...DURS, dur].sort((a, b) => a - b)) {
      const b = el("button", null, d >= 60 ? `${String(d / 60).replace(".", ",")} h` : `${d} min`);
      b.type = "button";
      b.dataset.d = d;
      b.onclick = () => { dur = d; paint(); };
      durs.append(b);
    }
    const date = inputEl("date", isSeries && occDate ? occDate : st.date || "");
    const due = inputEl("date", st.due || "");
    const dueF = field("Erledigen bis", due);
    const onlyBox = inputEl("checkbox", "");
    onlyBox.checked = true;
    const onlyWrap = el("label", "pl-check");
    onlyWrap.append(onlyBox, el("span", null, `Nur am ${occDate ? shortDate(occDate) : ""} ändern (sonst die ganze Serie)`));
    onlyWrap.hidden = !(isSeries && occDate);
    const start = inputEl("time", st.start || "", { step: 300 });
    const prio = selectEl([[1, "Wichtig"], [2, "Normal"], [3, "Kann warten"]], st.priority || 2);
    const rep = selectEl([["none", "Nie"], ["daily", "Jeden Tag"], ["weekdays", "Mo–Fr"], ["weekly", "Jede Woche"]], st.repeat || "none");
    const prioF = field("Wie wichtig?", prio);
    const repF = field("Wiederholen", rep);
    const row1 = el("div", "pl-frow");
    row1.append(field("Tag", date), field("Uhrzeit", start), dueF);
    const row2 = el("div", "pl-frow");
    row2.append(prioF, repF);

    const swatches = el("div", "pl-swatches");
    for (const c of COLORS) {
      const b = el("button");
      b.type = "button";
      b.dataset.c = c;
      b.style.setProperty("--c", colorVar(c));
      b.setAttribute("aria-label", `Farbe ${c}`);
      b.onclick = () => { color = c; colorTouched = true; paint(); };
      swatches.append(b);
    }
    const emojis = el("div", "pl-emojis");
    for (const e of EMOJIS) {
      const b = el("button", null, e);
      b.type = "button";
      b.onclick = () => { emoji = e; paint(); };
      emojis.append(b);
    }
    const noteIn = el("textarea");
    noteIn.value = st.notes || "";
    noteIn.placeholder = "Optional, z. B. Raum oder Adresse";

    const durWrap = el("div", "pl-field");
    durWrap.append(el("span", "lbl", "Dauer"), durs);
    const colWrap = el("div", "pl-field");
    colWrap.append(el("span", "lbl", "Farbe"), swatches);
    const emoWrap = el("div", "pl-field");
    emoWrap.append(el("span", "lbl", "Symbol"), emojis);

    const uniBox = inputEl("checkbox", "");
    uniBox.checked = st.place === "uni";
    const uniWrap = el("label", "pl-check");
    uniWrap.append(uniBox, el("span", null, "An der Uni – Anfahrt mit dem Zug automatisch eintragen"));
    sheet.append(seg, preview, hint, onlyWrap, durWrap, row1, row2, uniWrap, colWrap, emoWrap, field("Notiz", noteIn));

    const HINT = {
      todo: "Ohne Uhrzeit kommt es in den Eingang, und beim Planen bekommt es einen guten Platz.",
      termin: "Fester Termin, z. B. Vorlesung oder Training. Bleibt beim Planen frei. Braucht eine Uhrzeit.",
      pausetask: "Kleinkram für zwischendurch, z. B. eine Vokabelrunde. Kommt beim Planen in deine Pausen.",
      pause: "Feste Pause, z. B. Mittag. Pausen-Tasks können hinein.",
    };
    function paint() {
      seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === kind)));
      hint.textContent = HINT[kind];
      prioF.hidden = !(kind === "todo" || kind === "pausetask");
      repF.hidden = !(kind === "termin" || kind === "pause");
      uniWrap.hidden = kind !== "termin";
      dueF.hidden = !(kind === "todo" || kind === "pausetask");
      const e = emoji || guessEmoji(title.value, kind);
      cap.textContent = e;
      cap.style.setProperty("--c", colorVar(color));
      swatches.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.c === color)));
      emojis.querySelectorAll("button").forEach((b) => {
        b.setAttribute("aria-pressed", String(b.textContent === e));
        b.style.setProperty("--c", colorVar(color));
      });
      durs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.d === dur)));
    }
    title.addEventListener("input", () => { if (!emoji) paint(); });

    const acts = el("div", "pl-actions");
    const btn = (label, cls, fn) => { const b = el("button", `btn ${cls}`, label); b.type = "button"; b.onclick = fn; acts.append(b); return b; };
    if (it) {
      if (isSeries && occDate) {
        let armed1 = false;
        const b1 = btn("Nur diesen Tag löschen", "danger-ghost", () => {
          if (!armed1) { armed1 = true; b1.textContent = "Sicher?"; return; }
          closeSheet();
          patch(id, { skip: [...(it.skip || []), occDate] });
        });
      }
      let armed = false;
      const del = btn(isSeries ? "Serie löschen" : "Löschen", "danger-ghost", () => {
        if (!armed) { armed = true; del.textContent = "Wirklich löschen?"; return; }
        closeSheet();
        sync([], [id]);
      });
      if (kindOf(it) === "todo" && it.start) btn("In den Eingang", "ghost", () => { closeSheet(); patch(id, { start: null, date: null }); });
    }
    acts.append(el("span", "spacer"));
    btn("Abbrechen", "ghost", closeSheet);
    btn(it ? "Speichern" : "Hinzufügen", "primary", () => {
      const t = title.value.trim();
      if (!t && kind !== "pause") { title.focus(); title.placeholder = "Bitte einen Titel eingeben"; return; }
      const s = start.value || null;
      if ((kind === "termin" || kind === "pause") && !s) { start.focus(); return; }
      let d = date.value || null;
      if (s && !d) d = cur;
      const data = {
        ...(it || {}),
        title: t || "Pause",
        kind: kind === "pausetask" ? "todo" : kind,
        forBreak: kind === "pausetask",
        duration: dur,
        priority: Number(prio.value),
        date: d,
        start: s,
        repeat: kind === "termin" || kind === "pause" ? rep.value : "none",
        color,
        emoji: emoji || guessEmoji(t, kind),
        notes: noteIn.value.trim(),
        due: kind === "todo" || kind === "pausetask" ? due.value || null : null,
        place: kind === "termin" && uniBox.checked ? "uni" : null,
        lecture: kind === "termin" && (uniBox.checked || !!it?.lecture),
        done: it ? !!it.done : false,
        source: it?.source === "plan" && kind !== "pause" ? "manual" : it?.source || "manual",
        createdAt: it?.createdAt || new Date().toISOString(),
      };
      closeSheet();
      if (isSeries && occDate && onlyBox.checked) {
        // one-off copy for this day, the series skips it
        const { skip, until, ...single } = data;
        return sync([
          { id: newId(), data: { ...single, date: d || occDate, repeat: "none", source: "manual" } },
          { id, data: { ...it, skip: [...new Set([...(it.skip || []), occDate])] } },
        ]);
      }
      if (isSeries && occDate && d === occDate) data.date = it.date; // keep the series start
      save(id || newId(), data);
    });
    sheet.append(acts);
    paint();
    sheetBg.hidden = false;
    if (!it) title.focus();
  }

  function openSettings() {
    sheet.textContent = "";
    sheet.append(el("div", "pl-grab"), el("h3", null, "Einstellungen"));
    const sS = inputEl("time", prefs.dayStart, { step: 300 });
    const sE = inputEl("time", prefs.dayEnd, { step: 300 });
    const sF = selectEl([[45, "45 min"], [60, "1 h"], [75, "1 h 15"], [90, "1 h 30"], [120, "2 h"]], prefs.focusMin);
    const sB = selectEl([[5, "5 min"], [10, "10 min"], [15, "15 min"], [20, "20 min"], [30, "30 min"]], prefs.breakMin);
    const sL = inputEl("time", prefs.lunch, { step: 300 });
    const sLM = selectEl([[0, "kein Mittag"], [30, "30 min"], [45, "45 min"], [60, "1 h"]], prefs.lunchMin);
    const sW = el("textarea");
    sW.value = prefs.wishes || "";
    sW.placeholder = "z. B. Schweres am Vormittag. Nach 18 Uhr nur Leichtes. Vokabeln lieber in kurzen Runden.";
    const r1 = el("div", "pl-frow"); r1.append(field("Mein Tag beginnt", sS), field("und endet", sE));
    const r2 = el("div", "pl-frow"); r2.append(field("Pause nach", sF), field("Pausenlänge", sB));
    const r3 = el("div", "pl-frow"); r3.append(field("Mittag um", sL), field("Mittag dauert", sLM));
    const tOn = inputEl("checkbox", "");
    tOn.checked = prefs.travelOn !== false;
    const tOnWrap = el("label", "pl-check");
    tOnWrap.append(tOn, el("span", null, "Anfahrt zur Uni automatisch eintragen"));
    const tWalk = selectEl([[0, "–"], [5, "5 min"], [10, "10 min"], [15, "15 min"], [20, "20 min"], [25, "25 min"], [30, "30 min"]], prefs.walkStation);
    const tUni = selectEl([[5, "5 min"], [10, "10 min"], [15, "15 min"], [20, "20 min"], [25, "25 min"], [30, "30 min"]], prefs.walkUni);
    const tRide = selectEl([[20, "20 min"], [25, "25 min"], [30, "30 min"], [35, "35 min"], [40, "40 min"], [45, "45 min"], [60, "1 h"], [75, "1 h 15"]], prefs.rideMin);
    const tOut = el("textarea");
    tOut.value = prefs.trainsOut || "";
    tOut.placeholder = "Eine Verbindung pro Zeile: Abfahrt-Ankunft\n06:17-07:27\n07:17-08:27";
    const tBack = el("textarea");
    tBack.value = prefs.trainsBack || "";
    tBack.placeholder = "z. B.\n16:33-17:43\n17:33-18:43";
    const r4 = el("div", "pl-frow");
    r4.append(field(`Von daheim zum Bahnhof ${prefs.homeStation}`, tWalk), field(`Bahnhof ${prefs.uniStation} → Hochschule`, tUni), field("Zugfahrt etwa", tRide));
    const dayPicker = (label, days) => {
      const chosen = new Set(days || [1, 2, 3, 4, 5]);
      const wrap = el("div", "pl-field");
      const row = el("div", "pl-durs");
      for (const d of [1, 2, 3, 4, 5, 6, 0]) {
        const b = el("button", null, WDS[d]);
        b.type = "button";
        b.setAttribute("aria-pressed", String(chosen.has(d)));
        b.onclick = () => { chosen.has(d) ? chosen.delete(d) : chosen.add(d); b.setAttribute("aria-pressed", String(chosen.has(d))); };
        row.append(b);
      }
      wrap.append(el("span", "lbl", label), row);
      wrap.value = () => [...chosen].sort();
      return wrap;
    };
    const daysOut = dayPicker("Hinfahrt mit dem Zug an", prefs.trainOutDays);
    const daysBack = dayPicker("Rückfahrt mit dem Zug an", prefs.trainBackDays);
    const daysCar = dayPicker("Andere Hinfahrt (z. B. Auto) an", prefs.carOutDays || []);
    const cDep = inputEl("time", prefs.carDep || "07:00", { step: 300 });
    const cArr = inputEl("time", prefs.carArr || "07:50", { step: 300 });
    const r6 = el("div", "pl-frow");
    r6.append(field("Los um", cDep), field("Da um", cArr));
    const r5 = el("div", "pl-frow");
    r5.append(field(`Züge ${prefs.homeStation} → ${prefs.uniStation}`, tOut), field(`Züge ${prefs.uniStation} → ${prefs.homeStation}`, tBack));
    const about = el("textarea");
    about.value = prefs.about || "";
    about.placeholder = "z. B. Ich studiere in Kempten, spiele Fußball beim FC Hawangen …";
    const travelHead = el("h4", "pl-h4", "Anfahrt zur Uni");
    const travelHint = el("p", "pl-hint", "Ohne Zugliste schätzt die App die Fahrt (ca. " + prefs.rideMin + " min) und markiert sie zum Prüfen. Am genauesten wird es, wenn du deine üblichen Züge aus dem DB Navigator einträgst.");
    const acts = el("div", "pl-actions");
    const cancel = el("button", "btn ghost", "Abbrechen");
    cancel.onclick = closeSheet;
    const ok = el("button", "btn primary", "Speichern");
    ok.onclick = async () => {
      prefs = {
        ...prefs,
        dayStart: sS.value || "08:00", dayEnd: sE.value || "21:00",
        focusMin: Number(sF.value), breakMin: Number(sB.value),
        lunch: sL.value || "12:30", lunchMin: Number(sLM.value), wishes: sW.value.trim(),
        travelOn: tOn.checked, walkStation: Number(tWalk.value), walkUni: Number(tUni.value), rideMin: Number(tRide.value),
        trainsOut: tOut.value.trim(), trainsBack: tBack.value.trim(), about: about.value.trim(),
        trainOutDays: daysOut.value(), trainBackDays: daysBack.value(),
        carOutDays: daysCar.value(), carDep: cDep.value || "07:00", carArr: cArr.value || "07:50",
      };
      closeSheet();
      renderAll();
      ensureTravel();
      try { await api("/planner/prefs", { method: "PUT", body: { prefs } }); }
      catch (ex) { toast(`Nicht gespeichert: ${ex.message}`); }
    };
    acts.append(el("span", "spacer"), cancel, ok);
    sheet.append(r1, r2, r3, field("Das soll Claude beim Planen wissen", sW),
      travelHead, tOnWrap, r4, daysOut, daysBack, r5, daysCar, r6, travelHint, field("Über mich (für Claude)", about), acts);
    sheetBg.hidden = false;
  }

  /* ---------- planning ---------- */

  function planContext(date) {
    const all = dayItems(date);
    const nowMin = date === today() ? Math.ceil(nowMinutes() / 5) * 5 : null;
    const fixed = all.filter((i) =>
      kindOf(i) === "termin" ||
      (kindOf(i) === "pause" && i.source !== "plan") ||
      (kindOf(i) === "todo" && (i.done || (nowMin != null && toMin(i.start) < nowMin))));
    const fixedIds = new Set(fixed.map((i) => i.id));
    const seen = new Set();
    const todos = [
      ...all.filter((i) => isOpenTodo(i) && !fixedIds.has(i.id)),
      ...inboxItems(date).filter((i) => !(i.date === date && toMin(i.start) != null)),
    ].filter((i) => !seen.has(i.id) && seen.add(i.id));
    const oldPlanPauses = all.filter((i) => kindOf(i) === "pause" && i.source === "plan");
    return { fixed, todos, oldPlanPauses, nowMin };
  }

  // Simple fallback: by priority into free slots, a break after every focus block,
  // break tasks into the breaks.
  function rulePlan(ctx) {
    const dayS = Math.max(toMin(prefs.dayStart) ?? 480, ctx.nowMin ?? 0);
    const dayE = toMin(prefs.dayEnd) ?? 1260;
    const busy = ctx.fixed.filter((i) => !i.forBreak).map((i) => [toMin(i.start), toMin(i.start) + durOf(i)]);
    const pauses = [];
    const lunchS = toMin(prefs.lunch);
    if (prefs.lunchMin > 0 && lunchS != null && lunchS >= dayS && lunchS + prefs.lunchMin <= dayE &&
      !busy.some(([s, e]) => s < lunchS + prefs.lunchMin && e > lunchS) &&
      !ctx.fixed.some((i) => kindOf(i) === "pause" && Math.abs(toMin(i.start) - lunchS) < 90)) {
      pauses.push({ start: lunchS, duration: prefs.lunchMin, title: "Mittagspause" });
      busy.push([lunchS, lunchS + prefs.lunchMin]);
    }
    const isBusy = (s, e) => busy.some(([a, b]) => a < e && b > s);
    const nextFree = (t) => {
      let moved = true;
      while (moved) { moved = false; for (const [a, b] of busy) if (t >= a && t < b) { t = b; moved = true; } }
      return t;
    };
    const queue = ctx.todos.filter((i) => !i.forBreak);
    const small = ctx.todos.filter((i) => i.forBreak);
    const schedule = [];
    let t = dayS;
    let streak = 0;
    while (queue.length && t < dayE) {
      t = nextFree(t);
      if (streak >= prefs.focusMin) {
        if (!isBusy(t, t + prefs.breakMin) && t + prefs.breakMin <= dayE) {
          pauses.push({ start: t, duration: prefs.breakMin, title: "Pause" });
          busy.push([t, t + prefs.breakMin]);
          t += prefs.breakMin;
        }
        streak = 0;
        continue;
      }
      const idx = queue.findIndex((i) => t + durOf(i) <= dayE && !isBusy(t, t + durOf(i)) && streak + durOf(i) <= Math.max(prefs.focusMin, durOf(i)));
      if (idx === -1) {
        const nb = busy.filter(([a]) => a > t).sort((x, y) => x[0] - y[0])[0];
        if (!nb) { if (streak > 0) { streak = prefs.focusMin; continue; } break; }
        t = nb[1];
        streak = 0;
        continue;
      }
      const it = queue.splice(idx, 1)[0];
      schedule.push({ id: it.id, start: t });
      busy.push([t, t + durOf(it)]);
      t += durOf(it);
      streak += durOf(it);
    }
    const slots = [
      ...pauses.map((p) => ({ s: p.start, left: p.duration })),
      ...ctx.fixed.filter((i) => kindOf(i) === "pause").map((i) => ({ s: toMin(i.start), left: durOf(i) })),
    ].filter((p) => p.s >= dayS).sort((a, b) => a.s - b.s);
    const used = new Map();
    for (const it of small) {
      const p = slots.find((p) => p.left >= durOf(it));
      if (!p) continue;
      const off = used.get(p) || 0;
      schedule.push({ id: it.id, start: p.s + off });
      used.set(p, off + durOf(it));
      p.left -= durOf(it);
    }
    return { schedule, pauses, note: `Nach Wichtigkeit verteilt, mit einer Pause nach je ${fmtDur(prefs.focusMin)}.` };
  }

  async function claudePlan(date, ctx) {
    const d = parseYmd(date);
    const data = {
      datum: date,
      wochentag: WD[d.getDay()],
      jetzt: ctx.nowMin != null ? fromMin(ctx.nowMin) : null,
      einstellungen: {
        tagesbeginn: prefs.dayStart, tagesende: prefs.dayEnd,
        pause_nach_min: prefs.focusMin, pausenlaenge_min: prefs.breakMin,
        mittag: prefs.lunchMin ? prefs.lunch : null, mittag_min: prefs.lunchMin, wuensche: prefs.wishes || null,
      },
      feste_bloecke: ctx.fixed.map((i) => ({ art: kindOf(i) === "todo" ? "todo_fix" : kindOf(i), titel: i.title, start: i.start, dauer_min: durOf(i) })),
      todos: ctx.todos.map((i) => ({
        id: i.id, titel: i.title, dauer_min: durOf(i),
        prioritaet: ["", "hoch", "normal", "niedrig"][i.priority || 2],
        pausen_task: !!i.forBreak, wunschtag: i.date || null, notiz: i.notes || null,
        frist: i.due || null, sport: !!i.sport,
      })),
    };
    const res = await api("/planner/plan", { method: "POST", body: { data } });
    const valid = new Set(ctx.todos.map((i) => i.id));
    if (!res || !Array.isArray(res.schedule)) throw new Error("Unerwartete Antwort");
    return {
      schedule: res.schedule.filter((s) => valid.has(s.id) && toMin(s.start) != null).map((s) => ({ id: s.id, start: toMin(s.start) })),
      pauses: (res.pauses || []).filter((p) => toMin(p.start) != null).map((p) => ({
        start: toMin(p.start),
        duration: Math.min(90, Math.max(5, Number(p.duration) || 15)),
        title: String(p.title || "Pause").slice(0, 60),
      })),
      note: String(res.note || "").slice(0, 800),
    };
  }

  async function applyPlan(date, ctx, plan, by) {
    const upsert = [];
    const placed = new Set();
    for (const s of plan.schedule) {
      if (s.start < 0 || s.start >= 1440 || placed.has(s.id)) continue;
      placed.add(s.id);
      upsert.push({ id: s.id, data: { ...items.get(s.id), date, start: fromMin(s.start) } });
    }
    for (const t of ctx.todos) {
      if (!placed.has(t.id) && t.date === date && toMin(t.start) != null) upsert.push({ id: t.id, data: { ...items.get(t.id), start: null } });
    }
    for (const p of plan.pauses) {
      if (p.start < 0 || p.start + p.duration > 1440) continue;
      upsert.push({
        id: newId() + upsert.length,
        data: {
          title: p.title, kind: "pause", forBreak: false, duration: p.duration, date, start: fromMin(p.start),
          done: false, color: "yellow", emoji: /mittag/i.test(p.title) ? "🍽️" : "☕", repeat: "none",
          source: "plan", createdAt: new Date().toISOString(),
        },
      });
    }
    await sync(upsert, ctx.oldPlanPauses.map((p) => p.id));
    await setNote(date, plan.note, by);
    return { placed: placed.size, unplanned: ctx.todos.length - placed.size };
  }

  let planning = false;
  async function planDay() {
    if (planning) return;
    const date = cur;
    if (date < today()) return toast("Vergangene Tage kann ich nicht mehr planen.");
    await ensureTravel();
    await ensureReviews();
    await ensureSport(date);
    const ctx = planContext(date);
    if (!ctx.todos.length) return toast("Keine offenen To-dos. Trag erst etwas in den Eingang ein.");
    planning = true;
    const btn = $("#pl-plan");
    btn.disabled = true;
    btn.lastChild.textContent = "Plane …";
    let plan = null;
    let by = "claude";
    try {
      plan = await claudePlan(date, ctx);
    } catch {
      plan = rulePlan(ctx);
      by = "regel";
    }
    const r = await applyPlan(date, ctx, plan, by);
    toast(`${r.placed} eingeplant` + (r.unplanned ? ` · ${r.unplanned} passen nicht und bleiben im Eingang` : ""));
    planning = false;
    btn.disabled = false;
    btn.lastChild.textContent = "Tag planen";
    setTab("day");
  }

  let clearArmed = false;
  async function clearPlan() {
    const b = $("#pl-clear");
    if (!clearArmed) {
      clearArmed = true;
      b.textContent = "Wirklich leeren?";
      setTimeout(() => { clearArmed = false; b.textContent = "Plan leeren"; }, 4000);
      return;
    }
    clearArmed = false;
    b.textContent = "Plan leeren";
    const all = dayItems(cur);
    await sync(
      all.filter(isOpenTodo).map((i) => ({ id: i.id, data: { ...items.get(i.id), start: null, date: null } })),
      all.filter((i) => kindOf(i) === "pause" && i.source === "plan").map((i) => i.id),
    );
    await setNote(cur, "", "regel");
    toast("Plan geleert. Deine To-dos liegen wieder im Eingang.");
  }

  /* ---------- connection to MyStudy ---------- */

  // Adds learning tasks from the current progress (words that don't sit yet,
  // grammar exercises that are due), without duplicating open ones.
  async function suggestStudy() {
    try {
      const [decks, grammar] = await Promise.all([api("/decks"), api("/grammar")]);
      const notKnown = decks.reduce((n, d) => n + d.count - d.known, 0);
      const due = grammar.filter((g) => new Date(g.due_at) <= new Date()).length;
      const open = [...items.values()].filter(isOpenTodo);
      const upsert = [];
      const base = { kind: "todo", repeat: "none", done: false, date: null, start: null, source: "mystudy", createdAt: new Date().toISOString() };
      const wantRounds = Math.min(3, Math.ceil(notKnown / 10));
      for (let i = open.filter((x) => x.link === "vocab").length; i < wantRounds; i++) {
        upsert.push({ id: newId() + i, data: { ...base, title: "Vokabelrunde (10 Wörter)", forBreak: true, duration: 10, priority: 2, color: "green", emoji: "📚", link: "vocab", notes: `${notKnown} Wörter sitzen noch nicht` } });
      }
      if (!open.some((x) => x.link === "grammar")) {
        upsert.push({ id: newId() + "g", data: { ...base, title: due ? `Grammatik-Training (${due} fällig)` : "Grammatik: neues Thema üben", forBreak: false, duration: due > 15 ? 30 : 20, priority: due ? 1 : 3, color: "violet", emoji: "✏️", link: "grammar" } });
      }
      if (!upsert.length) return toast("Deine Lernaufgaben sind schon im Plan.");
      await sync(upsert);
      toast(`${upsert.length} Lernaufgaben im Eingang`);
      setTab("todo");
    } catch (ex) {
      toast(ex.message);
    }
  }

  // Called after a finished vocabulary round or grammar training.
  async function studyDone(link) {
    try {
      if (!loaded) await load();
    } catch {
      return;
    }
    const t = today();
    const candidates = [...items.entries()]
      .filter(([, it]) => isOpenTodo(it) && it.link === link && (!it.date || it.date <= t))
      .sort(([, a], [, b]) => (a.date === t ? 0 : 1) - (b.date === t ? 0 : 1) || (toMin(a.start) ?? 9999) - (toMin(b.start) ?? 9999));
    if (!candidates.length) return;
    const [id, it] = candidates[0];
    await patch(id, { done: true, date: it.date || t, start: it.start || fromMin(Math.max(0, nowMinutes() - durOf(it))) });
    toast(`„${it.title}“ im Kalender abgehakt ✓`);
  }

  /* ---------- Nacharbeiten & Sport ---------- */

  const isLecture = (it) => kindOf(it) === "termin" && (it.place === "uni" || it.lecture);
  const shortDate = (d) => `${WDS[parseYmd(d).getDay()]} ${d.slice(8)}.${d.slice(5, 7)}.`;

  async function savePrefs() {
    try { await api("/planner/prefs", { method: "PUT", body: { prefs } }); } catch { /* next save retries */ }
  }

  // After a lecture: "Nacharbeiten: <Fach>" with a deadline before the next lecture of that subject.
  async function ensureReviews() {
    if (prefs.reviewOn === false) return;
    const t = today();
    const nowM = nowMinutes();
    const made = new Set(prefs.reviewMade || []);
    const upsert = [];
    for (let back = 3; back >= 0; back--) {
      const d = addDays(t, -back);
      for (const lec of dayItems(d).filter((i) => isLecture(i) && REPEAT_LABEL[i.repeat])) {
        if (d === t && toMin(lec.start) + durOf(lec) > nowM) continue; // not over yet
        const id = `rv-${lec.id}-${d}`.slice(0, 64);
        if (made.has(id) || items.has(id)) continue;
        let next = null;
        for (let i = 1; i <= 21 && !next; i++) {
          const nd = addDays(d, i);
          if (occursOn(items.get(lec.id), nd)) next = nd;
        }
        if (!next) continue;
        made.add(id);
        upsert.push({ id, data: {
          title: `Nacharbeiten: ${lec.title}`, kind: "todo", forBreak: false, duration: Number(prefs.reviewMin) || 45,
          priority: 2, date: null, start: null, due: next, done: false, repeat: "none", color: "violet", emoji: "📖",
          notes: `Stoff vom ${shortDate(d)} – bis vor der nächsten Vorlesung am ${shortDate(next)}`,
          source: "review", createdAt: new Date().toISOString(),
        } });
      }
    }
    if (!upsert.length) return;
    prefs.reviewMade = [...made].slice(-80);
    await sync(upsert);
    await savePrefs();
  }

  // From prefs.sportFrom on: suggest a home workout on days that have room, about sportPerWeek times a week.
  async function ensureSport(date) {
    if (!prefs.sportFrom || date < prefs.sportFrom) return;
    if ((prefs.sportMade || []).includes(date)) return; // already suggested (maybe deleted on purpose)
    const all = [...items.values()];
    const has = (d) => all.some((it) => it.sport && it.date === d);
    if (has(date) || has(addDays(date, -1))) return;
    const monday = addDays(date, -((parseYmd(date).getDay() + 6) % 7));
    let week = 0;
    for (let i = 0; i < 7; i++) if (has(addDays(monday, i))) week++;
    if (week >= (Number(prefs.sportPerWeek) || 3)) return;
    if (dayItems(date).some((i) => /spiel|training|party/i.test(i.title || ""))) return;
    prefs.sportMade = [...(prefs.sportMade || []), date].slice(-60);
    savePrefs();
    await save(newId(), {
      title: "Sport daheim", kind: "todo", forBreak: false, sport: true, duration: Number(prefs.sportMin) || 45,
      priority: 2, date, start: null, done: false, repeat: "none", color: "green", emoji: "🏃",
      notes: "Vorschlag – passt es heute nicht, einfach löschen oder verschieben", source: "sport", createdAt: new Date().toISOString(),
    });
  }

  /* ---------- Anfahrt zur Uni ---------- */

  // "06:17-07:27" lines → [{dep, arr}] in minutes
  function parseTrains(text) {
    return String(text || "").split(/\n+/).map((l) => l.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\s*(.*)/))
      .filter(Boolean).map((m) => ({ dep: toMin(m[1]), arr: toMin(m[2]), label: m[3].trim() })).filter((t) => t.arr > t.dep)
      .sort((a, b) => a.dep - b.dep);
  }

  // The travel blocks a uni day needs: walk + train there, train + walk back.
  function travelPlan(date) {
    if ((prefs.noTravel || []).includes(date)) return [];
    const lectures = dayItems(date).filter((i) => kindOf(i) === "termin" && i.place === "uni");
    if (!lectures.length) return [];
    const first = Math.min(...lectures.map((i) => toMin(i.start)));
    const last = Math.max(...lectures.map((i) => toMin(i.start) + durOf(i)));
    const walkS = Math.max(0, Number(prefs.walkStation) || 0);
    const walkU = Math.max(0, Number(prefs.walkUni) || 0);
    const ride = Number(prefs.rideMin) || 35;
    const home = prefs.homeStation;
    const uni = prefs.uniStation.replace(/ \(Allgäu\) Hbf$| Hbf$/, "");
    const mustArrive = first - walkU;
    const mayLeave = last + walkU;
    // a listed train only counts if it doesn't mean waiting for ages
    const out = parseTrains(prefs.trainsOut).filter((t) => t.arr <= mustArrive && t.arr >= mustArrive - 75).pop()
      || { arr: Math.floor((mustArrive - 5) / 5) * 5, dep: Math.floor((mustArrive - 5) / 5) * 5 - ride, guess: true };
    const back = parseTrains(prefs.trainsBack).find((t) => t.dep >= mayLeave && t.dep <= mayLeave + 75)
      || { dep: Math.ceil((mayLeave + 5) / 5) * 5, arr: Math.ceil((mayLeave + 5) / 5) * 5 + ride, guess: true };
    const check = "Zeit geschätzt – bitte im DB Navigator prüfen";
    const base = { kind: "termin", forBreak: false, repeat: "none", done: false, date, color: "teal", source: "travel", priority: 2 };
    const block = (key, start, duration, title, emoji, notes) =>
      ({ id: `tr-${date}-${key}`, data: { ...base, start: fromMin(start), duration, title, emoji, notes } });
    const dow = parseYmd(date).getDay();
    const outOn = (prefs.trainOutDays || [1, 2, 3, 4, 5]).includes(dow);
    const backOn = (prefs.trainBackDays || [1, 2, 3, 4, 5]).includes(dow);
    return [
      block("a", out.dep - walkS, walkS, `Zum Bahnhof ${home}`, "🚶", ""),
      block("b", out.dep, out.arr - out.dep, `${out.label || "Zug"} ${home} → ${uni}`, "🚆", out.guess ? check : "laut Fahrplan"),
      block("c", out.arr, walkU, "Zur Hochschule", "🚶", ""),
      block("d", back.dep - walkU, walkU, `Zum Bahnhof ${uni}`, "🚶", ""),
      block("e", back.dep, back.arr - back.dep, `${back.label || "Zug"} ${uni} → ${home}`, "🚆", back.guess ? check : "laut Fahrplan"),
      block("f", back.arr, walkS, "Heimweg", "🏠", ""),
      block("g", toMin(prefs.carDep) ?? 420, (toMin(prefs.carArr) ?? 470) - (toMin(prefs.carDep) ?? 420), prefs.carTitle || "Fahrt nach Ulm", "🚗", ""),
    ].filter((b) => !b.id.endsWith("-g") || (prefs.carOutDays || []).includes(dow)).filter((b) => (/-[abc]$/.test(b.id) ? outOn : /-g$/.test(b.id) || backOn) && toMin(b.data.start) >= 0 && b.data.duration > 0);
  }

  // Keeps the travel blocks of the next days in line with lectures and settings.
  async function ensureTravel(days = 8) {
    const t = today();
    const upsert = [];
    const remove = [];
    for (let i = 0; i < days; i++) {
      const date = addDays(t, i);
      const want = prefs.travelOn === false ? [] : travelPlan(date);
      const have = [...items.entries()].filter(([, it]) => it.source === "travel" && it.date === date);
      const wantIds = new Set(want.map((w) => w.id));
      for (const [id] of have) if (!wantIds.has(id)) remove.push(id);
      for (const w of want) {
        const old = items.get(w.id);
        const same = old && old.start === w.data.start && old.duration === w.data.duration && old.title === w.data.title && old.notes === w.data.notes;
        if (!same) upsert.push({ ...w, data: { ...w.data, createdAt: old?.createdAt || new Date().toISOString() } });
      }
    }
    if (upsert.length || remove.length) await sync(upsert, remove);
  }

  /* ---------- Claude im Kalender ---------- */

  const CHAT_KEY = "planner.chat";
  let chat = [];
  try { chat = JSON.parse(localStorage.getItem(CHAT_KEY)) || []; } catch { chat = []; }
  const saveChat = () => { try { localStorage.setItem(CHAT_KEY, JSON.stringify(chat.slice(-30))); } catch { /* ignore */ } };

  function renderChat() {
    const log = $("#pl-chat-log");
    log.textContent = "";
    if (!chat.length) {
      log.append(el("p", "pl-chat-empty", "Frag mich etwas oder sag mir, was ich eintragen soll. Zum Beispiel: „Plan mir morgen“, „Trag mir Mittwoch 18 Uhr Zahnarzt ein“ oder „Wann spielt FC Hawangen als Nächstes?“"));
    }
    for (const m of chat) {
      const b = el("div", `pl-msg ${m.role}`, m.content);
      if (m.files?.length) b.prepend(el("span", "pl-att", `📎 ${m.files.join(", ")}`));
      log.append(b);
    }
    log.scrollTop = log.scrollHeight;
  }

  function openChat() {
    $("#pl-chat").hidden = false;
    renderChat();
    $("#pl-chat-input").focus();
  }

  let chatting = false;
  let attachments = []; // [{name, type, data}] for the next message

  const readAsBase64 = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

  async function addFiles(files) {
    for (const f of files) {
      if (!/^(application\/pdf|image\/(png|jpeg|gif|webp))$/.test(f.type)) { toast(`${f.name}: nur PDF oder Bilder`); continue; }
      if (attachments.reduce((n, a) => n + a.size, 0) + f.size > 8 * 1024 * 1024) { toast("Zusammen höchstens 8 MB"); break; }
      attachments.push({ name: f.name, type: f.type, size: f.size, data: await readAsBase64(f) });
    }
    renderAttachments();
  }
  function renderAttachments() {
    const box = $("#pl-chat-files");
    box.textContent = "";
    box.hidden = !attachments.length;
    attachments.forEach((a, i) => {
      const chip = el("button", "pl-file", `📎 ${a.name} ✕`);
      chip.type = "button";
      chip.onclick = () => { attachments.splice(i, 1); renderAttachments(); };
      box.append(chip);
    });
  }

  async function sendChat(text) {
    if (chatting || (!text.trim() && !attachments.length)) return;
    chatting = true;
    const files = attachments;
    attachments = [];
    renderAttachments();
    chat.push({ role: "user", content: text.trim() || "Hier sind Unterlagen aus der Vorlesung. Schätz ab, was zu tun ist, und plan es vor der nächsten Vorlesung ein.", files: files.map((f) => f.name) });
    saveChat();
    renderChat();
    const thinking = el("div", "pl-msg assistant thinking", "Claude denkt nach …");
    $("#pl-chat-log").append(thinking);
    $("#pl-chat-log").scrollTop = $("#pl-chat-log").scrollHeight;
    const n = new Date();
    try {
      const res = await api("/planner/chat", {
        method: "POST",
        body: {
          messages: chat.filter((m) => !m.err).slice(-16).map(({ role, content }) => ({ role, content })),
          attachments: files.map(({ name, type, data }) => ({ name, type, data })),
          today: today(), now: fromMin(nowMinutes()), weekday: WD[n.getDay()], viewing: cur,
        },
      });
      chat.push({ role: "assistant", content: res.reply || "Erledigt." });
      if (res.changed) { await load(); await ensureTravel(); renderAll(); }
    } catch (ex) {
      const msg = /eingerichtet/.test(ex.message)
        ? "Ich bin in der App noch nicht eingerichtet: In Supabase fehlt das Secret ANTHROPIC_API_KEY."
        : `Das hat nicht geklappt: ${ex.message}`;
      chat.push({ role: "assistant", content: msg, err: true });
    }
    saveChat();
    chatting = false;
    renderChat();
  }

  $("#pl-chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#pl-chat-input");
    const text = input.value;
    input.value = "";
    sendChat(text);
  });
  $("#pl-chat-open").addEventListener("click", openChat);
  $("#pl-chat-attach").addEventListener("click", () => $("#pl-chat-file").click());
  $("#pl-chat-file").addEventListener("change", (e) => { addFiles([...e.target.files]); e.target.value = ""; });
  $("#pl-chat-close").addEventListener("click", () => { $("#pl-chat").hidden = true; });
  $("#pl-chat-clear").addEventListener("click", () => { chat = []; saveChat(); renderChat(); });

  /* ---------- navigation ---------- */

  function go(date) { cur = date; renderAll(); }
  function setTab(t) {
    tab = t;
    $("#pl-grid").dataset.tab = t;
    $("#pl-tab-day").setAttribute("aria-selected", String(t === "day"));
    $("#pl-tab-todo").setAttribute("aria-selected", String(t === "todo"));
  }

  async function open(date) {
    if (date) cur = date;
    show("view-planner");
    if (location.hash !== "#kalender") history.replaceState(null, "", "#kalender");
    setTab(tab);
    $("#pl-rows").textContent = "";
    $("#pl-rows").append(el("p", "pl-empty", "Lade deinen Tag …"));
    try {
      await load();
    } catch (ex) {
      toast(ex.message);
    }
    renderAll();
    await ensureTravel();
    ensureReviews();
  }

  // "morgen 14 Uhr Mathe lernen 1h" → {title, date, start, duration}
  function parseQuick(text) {
    let t = ` ${text.trim()} `;
    let date = null, start = null, duration = 30;
    const take = (re, fn) => { const m = t.match(re); if (m) { fn(m); t = t.replace(m[0], " "); } };
    const t0 = today();
    take(/\s(heute)\s/i, () => { date = t0; });
    take(/\s(übermorgen)\s/i, () => { date = addDays(t0, 2); });
    take(/\s(morgen)\s/i, () => { date = addDays(t0, 1); });
    // short weekday only after "am" ("am do"), so words like "so" stay in the title
    take(/\s(?:am\s(mo|di|mi|do|fr|sa|so)\.?|(?:am\s)?(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag))\s/i, (m) => {
      const want = ["so", "mo", "di", "mi", "do", "fr", "sa"].indexOf((m[1] || m[2]).slice(0, 2).toLowerCase());
      let d = addDays(t0, 1);
      while (parseYmd(d).getDay() !== want) d = addDays(d, 1);
      date = d;
    });
    take(/\s(?:am\s)?(\d{1,2})\.(\d{1,2})\.?\s/, (m) => {
      const y = new Date().getFullYear();
      let d = `${y}-${pad(m[2])}-${pad(m[1])}`;
      if (d < t0) d = `${y + 1}-${pad(m[2])}-${pad(m[1])}`;
      date = d;
    });
    take(/\s(?:um\s)?(\d{1,2})(?::(\d{2}))?\s?uhr\s/i, (m) => { start = `${pad(m[1])}:${pad(m[2] || 0)}`; });
    take(/\s(?:um\s)?(\d{1,2}):(\d{2})\s/, (m) => { start = `${pad(m[1])}:${m[2]}`; });
    take(/\s(\d+(?:[.,]5)?)\s?(h|std|stunden?)\s/i, (m) => { duration = Math.round(parseFloat(m[1].replace(",", ".")) * 60); });
    take(/\s(\d{1,3})\s?(min|minuten)\s/i, (m) => { duration = Number(m[1]); });
    if (start && !date) date = t0;
    if (start && toMin(start) == null) start = null;
    return { title: t.replace(/\s+/g, " ").trim(), date, start, duration: Math.max(5, Math.min(600, duration)) };
  }

  /* ---------- drag & drop (laptop) ---------- */

  function makeDraggable(node, id) {
    node.draggable = true;
    node.classList.add("pl-draggable");
    node.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
      dragId = id;
      document.body.classList.add("pl-dragging");
    });
    node.addEventListener("dragend", () => {
      dragId = null;
      document.body.classList.remove("pl-dragging");
      document.querySelectorAll(".pl-over").forEach((n) => n.classList.remove("pl-over"));
    });
  }

  const rows = $("#pl-rows");
  const target = (e) => e.target.closest?.("[data-drop]");
  rows.addEventListener("dragover", (e) => {
    const t = target(e);
    if (!t || !dragId) return;
    e.preventDefault();
    document.querySelectorAll(".pl-over").forEach((n) => n !== t && n.classList.remove("pl-over"));
    t.classList.add("pl-over");
  });
  rows.addEventListener("dragleave", (e) => { const t = target(e); if (t && !t.contains(e.relatedTarget)) t.classList.remove("pl-over"); });
  rows.addEventListener("drop", (e) => {
    const t = target(e);
    const id = e.dataTransfer.getData("text/plain") || dragId;
    if (!t || !id || !items.has(id)) return;
    e.preventDefault();
    t.classList.remove("pl-over");
    const it = items.get(id);
    // only break tasks go into a break; anything else starts after it
    const start = t.dataset.dropBreak && it.forBreak ? Number(t.dataset.dropBreak) : Number(t.dataset.drop);
    placeAt(id, Math.ceil(start / 5) * 5);
  });
  // drop back onto the inbox: take it out of the day again
  const inboxPanel = $("#pl-inbox").closest(".pl-panel");
  inboxPanel.addEventListener("dragover", (e) => { if (dragId && items.get(dragId)?.start) { e.preventDefault(); inboxPanel.classList.add("pl-over"); } });
  inboxPanel.addEventListener("dragleave", (e) => { if (!inboxPanel.contains(e.relatedTarget)) inboxPanel.classList.remove("pl-over"); });
  inboxPanel.addEventListener("drop", (e) => {
    inboxPanel.classList.remove("pl-over");
    const id = e.dataTransfer.getData("text/plain") || dragId;
    if (!id || !items.get(id)?.start) return;
    e.preventDefault();
    patch(id, { start: null, date: null });
  });

  $("#pl-quick").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#pl-quick-title");
    const q = parseQuick(input.value);
    if (!q.title) return;
    input.value = "";
    save(newId(), { kind: "todo", forBreak: false, priority: 2, done: false, color: "coral", emoji: guessEmoji(q.title, "todo"), source: "manual", createdAt: new Date().toISOString(), ...q });
    if (q.date || q.start) toast(`„${q.title}“${q.date ? ` am ${shortDate(q.date)}` : ""}${q.start ? ` um ${q.start}` : ""} eingetragen`);
  });
  $("#pl-plan").addEventListener("click", planDay);
  $("#pl-clear").addEventListener("click", clearPlan);
  $("#pl-study").addEventListener("click", suggestStudy);
  $("#pl-settings").addEventListener("click", openSettings);
  $("#pl-today").addEventListener("click", () => go(today()));
  $("#pl-fab").addEventListener("click", () => openSheet(null, { date: cur }));
  $("#pl-tab-day").addEventListener("click", () => setTab("day"));
  $("#pl-tab-todo").addEventListener("click", () => setTab("todo"));
  $("#today-card").addEventListener("click", () => open(today()));

  let touchX = null, touchY = null;
  const dayBox = $(".pl-day");
  dayBox.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
  dayBox.addEventListener("touchend", (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    touchX = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) go(addDays(cur, dx < 0 ? 1 : -1));
  });
  document.addEventListener("keydown", (e) => {
    if ($("#view-planner").hidden || !sheetBg.hidden || !$("#pl-chat").hidden) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
    if (e.key === "ArrowLeft") go(addDays(cur, -1));
    else if (e.key === "ArrowRight") go(addDays(cur, 1));
    else if (e.key === "t") go(today());
    else if (e.key === "n") { e.preventDefault(); openSheet(null, { date: cur }); }
  });
  document.addEventListener("visibilitychange", async () => {
    if (document.hidden) return;
    if (!$("#view-planner").hidden && sheetBg.hidden) {
      try { await load(); renderAll(); await ensureTravel(); ensureReviews(); } catch { /* offline */ }
    } else if (!$("#view-subjects").hidden) refreshTodayCard();
  });
  setInterval(() => { if (!$("#view-planner").hidden && sheetBg.hidden && cur === today()) renderDay(); }, 60000);

  return { open, refreshTodayCard, studyDone };
}
