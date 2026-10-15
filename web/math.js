// Mathe: Karteikarten (Symbol/Begriff → Name, Bedeutung, Beispiel).
// Karten liegen in ./math/cards.js. Der Fortschritt pro Karte nutzt dieselbe
// Speicherung wie die Grammatik-Übungen (/grammar, Leitner mit 1–30 Tagen).
import { CHAPTERS, CATEGORIES } from "./math/cards.js";

const KNOWN_BOX = 3; // like grammar: from box 3 on a card "sitzt"
const NEW_PER_TRAINING = 10;
const MAX_DUE_PER_TRAINING = 30;

const CARDS = new Map(); // card id → { ...card, chapter }
for (const chapter of CHAPTERS) for (const c of chapter.cards) CARDS.set(c.id, { ...c, chapter });

export function initMath({ api, show, toast, setBar, plural, shuffle, isVisible }) {
  const $ = (sel) => document.querySelector(sel);
  let progress = new Map(); // card id → { box, due_at, ... }

  const status = (id) => {
    const p = progress.get(id);
    if (!p) return "fresh";
    return p.box >= KNOWN_BOX ? "known" : "learning";
  };
  const isDue = (id) => {
    const p = progress.get(id);
    return !!p && new Date(p.due_at) <= new Date();
  };
  const counts = (ids) => {
    const c = { known: 0, learning: 0, fresh: 0, due: 0 };
    for (const id of ids) {
      c[status(id)]++;
      if (isDue(id)) c.due++;
    }
    return c;
  };
  const ids = (chapter) => chapter.cards.map((c) => c.id);

  async function loadProgress() {
    const rows = await api("/grammar");
    progress = new Map(rows.filter((r) => CARDS.has(r.item_id)).map((r) => [r.item_id, r]));
  }

  /* ---------- overview ---------- */

  async function showMath() {
    show("view-math");
    try {
      await loadProgress();
    } catch (ex) {
      toast(ex.message);
    }
    renderOverview();
  }

  function renderOverview() {
    const all = counts(CARDS.keys());
    $("#mt-due").textContent = all.due;
    $("#mt-due-label").textContent = all.due === 1 ? "Karte fällig" : "Karten fällig";
    $("#mt-info").textContent = all.due
      ? `${plural(all.due, "Karte ist", "Karten sind")} heute zum Wiederholen dran. Danach kommen neue Karten dazu.`
      : all.fresh
        ? "Gerade ist nichts fällig – das Training startet mit neuen Karten."
        : "Alles wiederholt! Neue Wiederholungen kommen in den nächsten Tagen.";
    setBar($("#mt-bar"), all.known, all.learning, CARDS.size);
    $("#mt-known").textContent = `${all.known} sitzen · ${all.learning} am Lernen · ${all.fresh} neu`;

    const list = $("#math-chapters");
    list.innerHTML = "";
    for (const cat of CATEGORIES) {
      const section = document.createElement("section");
      section.className = "topic-section";
      section.innerHTML = `<h2></h2><div class="topic-grid"></div>`;
      section.querySelector("h2").textContent = cat;
      const grid = section.querySelector(".topic-grid");
      for (const chapter of CHAPTERS.filter((ch) => ch.cat === cat)) {
        const c = counts(ids(chapter));
        const el = document.createElement("button");
        el.className = "topic-tile";
        el.innerHTML = `
          <span class="topic-title"></span>
          <span class="topic-short muted"></span>
          <span class="stackbar"><span class="known"></span><span class="learning"></span></span>
          <span class="topic-meta muted"></span>`;
        el.querySelector(".topic-title").textContent = chapter.title;
        el.querySelector(".topic-short").textContent = chapter.short;
        setBar(el.querySelector(".stackbar"), c.known, c.learning, chapter.cards.length);
        el.querySelector(".topic-meta").textContent =
          `${plural(chapter.cards.length, "Karte", "Karten")} · ${c.known} sitzen` + (c.due ? ` · ${c.due} fällig` : "");
        el.onclick = () => showChapter(chapter);
        grid.appendChild(el);
      }
      list.appendChild(section);
    }
  }

  /* ---------- chapter: all cards ---------- */

  let currentChapter = null;

  function showChapter(chapter) {
    currentChapter = chapter;
    $("#mc-title").textContent = chapter.title;
    const c = counts(ids(chapter));
    $("#mc-start").textContent = `Alle abfragen (${chapter.cards.length})`;
    $("#mc-due").hidden = !c.due;
    $("#mc-due").textContent = `Nur fällige (${c.due})`;
    $("#mc-progress").textContent = `${c.known} von ${chapter.cards.length} Karten sitzen`;

    const list = $("#mc-list");
    list.innerHTML = "";
    for (const card of chapter.cards) {
      const row = document.createElement("details");
      row.className = "m-row";
      row.innerHTML = `
        <summary>
          <i class="dot"></i>
          <span class="m-row-front"></span>
          <span class="m-row-name muted"></span>
        </summary>
        <div class="m-row-body">
          <div class="m-back"></div>
          <button class="btn small">Nur diese Karte abfragen</button>
        </div>`;
      row.querySelector(".dot").classList.add(status(card.id));
      row.querySelector(".m-row-front").innerHTML = card.f; // static content from the repo
      row.querySelector(".m-row-name").innerHTML = card.n;
      row.querySelector(".m-back").innerHTML = backHtml(card);
      row.querySelector("button").onclick = () => startSession([card.id], chapter.title);
      list.appendChild(row);
    }
    show("view-math-chapter");
  }

  function backHtml(card) {
    return `
      <p class="m-name">${card.n}</p>
      <p class="m-label">Bedeutung</p>
      <p class="m-text">${card.d}</p>
      <p class="m-label">Beispiel</p>
      <p class="m-text m-example">${card.b}</p>`;
  }

  $("#mc-start").addEventListener("click", () => startSession(shuffle(ids(currentChapter)), currentChapter.title));
  $("#mc-due").addEventListener("click", () =>
    startSession(shuffle(ids(currentChapter).filter(isDue)), currentChapter.title),
  );

  /* ---------- training (spaced repetition) ---------- */

  async function startTraining() {
    try {
      await loadProgress();
    } catch (ex) {
      return toast(ex.message);
    }
    const due = shuffle([...CARDS.keys()].filter(isDue)).slice(0, MAX_DUE_PER_TRAINING);
    // new cards in chapter order, so the chapters are worked through one by one
    const fresh = [...CARDS.keys()].filter((id) => !progress.has(id)).slice(0, NEW_PER_TRAINING);
    const all = [...due, ...fresh];
    if (!all.length) return toast("Alles geschafft! Gerade ist keine Karte fällig und alle sind gelernt.");
    startSession(all, "Mathe-Training");
  }

  /* ---------- learning ---------- */

  const session = { ids: [], queue: [], title: "", firstTry: new Set(), wrongOnce: new Set(), flipped: false };

  function startSession(list, title) {
    if (!list.length) return toast("Keine Karten ausgewählt.");
    Object.assign(session, { ids: list, queue: [...list], title, firstTry: new Set(), wrongOnce: new Set() });
    show("view-math-learn");
    showCard();
  }

  function showCard() {
    const total = session.ids.length;
    $("#ml-bar").style.width = `${((total - session.queue.length) / total) * 100}%`;
    $("#ml-counter").textContent = `${session.queue.length} übrig`;
    if (!session.queue.length) return finish();

    const card = CARDS.get(session.queue[0]);
    session.flipped = false;
    const flip = $("#ml-flip");
    flip.classList.add("instant"); // jump back to the front without animation
    flip.classList.remove("flipped");
    void flip.offsetWidth;
    flip.classList.remove("instant");
    $("#ml-chapter").textContent = card.chapter.title;
    $("#ml-chapter-back").textContent = card.chapter.title;
    $("#ml-front").innerHTML = card.f; // static content from the repo
    $("#ml-front-small").innerHTML = card.f;
    $("#ml-back").innerHTML = backHtml(card);
    $("#ml-reveal").hidden = false;
    $("#ml-judge").hidden = true;
  }

  function reveal() {
    if (session.flipped || !session.queue.length) return;
    session.flipped = true;
    $("#ml-flip").classList.add("flipped");
    $("#ml-reveal").hidden = true;
    $("#ml-judge").hidden = false;
  }

  function judge(correct) {
    if (!session.flipped) return;
    const id = session.queue.shift();
    if (!correct) {
      session.wrongOnce.add(id);
      session.queue.push(id); // wrong cards come back at the end
    } else if (!session.wrongOnce.has(id)) {
      session.firstTry.add(id);
    }
    api("/grammar/review", { method: "POST", body: { item: id, correct } })
      .then((row) => progress.set(id, row))
      .catch(() => toast("Antwort konnte nicht gespeichert werden"));
    showCard();
  }

  function finish() {
    const total = session.ids.length;
    $("#md-title").textContent = session.title;
    $("#md-stats").textContent =
      `${session.firstTry.size} von ${plural(total, "Karte", "Karten")} auf Anhieb gewusst` +
      (session.wrongOnce.size ? ` · ${session.wrongOnce.size} wiederholt` : " – perfekt!");
    show("view-math-done");
  }

  $("#ml-flip").addEventListener("click", reveal);
  $("#ml-reveal").addEventListener("click", reveal);
  $("#ml-right").addEventListener("click", () => judge(true));
  $("#ml-wrong").addEventListener("click", () => judge(false));

  document.addEventListener("keydown", (e) => {
    if (!isVisible("view-math-learn")) return;
    if (!session.flipped && (e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      reveal();
    } else if (session.flipped && (e.key === "1" || e.key === "ArrowLeft")) {
      judge(false);
    } else if (session.flipped && (e.key === "2" || e.key === "ArrowRight" || e.key === "Enter")) {
      e.preventDefault();
      judge(true);
    }
  });

  /* ---------- navigation ---------- */

  $("#mt-train").addEventListener("click", startTraining);
  $("#md-again").addEventListener("click", () => startSession(shuffle([...session.ids]), session.title));
  document.querySelectorAll("[data-math]").forEach((b) => b.addEventListener("click", showMath));

  return { showMath };
}
