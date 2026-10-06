// Grammar section: topic explanations, exercises and spaced repetition.
// Content lives in ./grammar/*.js, progress per exercise on the server.
import { TOPICS, CATEGORIES } from "./grammar/index.js";

const KNOWN_BOX = 3; // from box 3 on (≥ 3× right in a row over days) an exercise is "sicher"
const NEW_PER_TRAINING = 10;
const MAX_DUE_PER_TRAINING = 25;

const ITEMS = new Map(); // exercise id → { ...exercise, topic }
for (const topic of TOPICS) for (const ex of topic.ex) ITEMS.set(ex.id, { ...ex, topic });

/* ---------- answer checking ---------- */

// Lower-case, unify apostrophes/spaces and expand contractions, so that
// "won't" = "will not", "'ll get" = "will get", "haven't" = "have not".
export function normalize(text) {
  return ` ${String(text)} `
    .toLowerCase()
    .replace(/[‘’ʼ`´]/g, "'")
    .replace(/[.!?,;:"“”„]/g, " ")
    .replace(/\bwon't\b/g, "will not")
    .replace(/\bcan't\b/g, "cannot")
    .replace(/\bshan't\b/g, "shall not")
    .replace(/n't\b/g, " not")
    .replace(/'ll\b/g, " will")
    .replace(/'ve\b/g, " have")
    .replace(/'re\b/g, " are")
    .replace(/\bi'm\b/g, "i am")
    .replace(/\bcan not\b/g, "cannot")
    .replace(/\s+/g, " ")
    .trim();
}

export function isCorrectGap(input, answers) {
  const given = normalize(input);
  return given !== "" && answers.some((a) => normalize(a) === given);
}

/* ---------- module ---------- */

export function initGrammar({ api, show, toast, setBar, plural, shuffle, isVisible }) {
  const $ = (sel) => document.querySelector(sel);
  let progress = new Map(); // item id → { box, due_at, ... }

  const status = (id) => {
    const p = progress.get(id);
    if (!p) return "fresh";
    return p.box >= KNOWN_BOX ? "known" : "learning";
  };
  const isDue = (id) => {
    const p = progress.get(id);
    return !!p && new Date(p.due_at) <= new Date();
  };
  const dueItems = () => [...ITEMS.keys()].filter(isDue);
  const counts = (ids) => {
    const c = { known: 0, learning: 0, fresh: 0, due: 0 };
    for (const id of ids) {
      c[status(id)]++;
      if (isDue(id)) c.due++;
    }
    return c;
  };

  async function loadProgress() {
    const rows = await api("/grammar");
    progress = new Map(rows.map((r) => [r.item_id, r]));
  }

  /* ---------- home card ---------- */

  async function refreshHome() {
    try {
      await loadProgress();
    } catch {
      return; // the home screen shows its own error toast
    }
    const c = counts(ITEMS.keys());
    $("#gc-due").textContent = c.due;
    $("#gc-due-label").textContent = c.due === 1 ? "Übung heute fällig" : "Übungen heute fällig";
    $("#gc-known").textContent = c.known;
    $("#gc-total").textContent = ITEMS.size;
    setBar($("#gc-bar"), c.known, c.learning, ITEMS.size);
    $("#gc-train").textContent = c.due ? `Trainieren (${c.due})` : "Trainieren";
  }

  /* ---------- topic list ---------- */

  async function showGrammar() {
    show("view-grammar");
    try {
      await loadProgress();
    } catch (ex) {
      toast(ex.message);
    }
    renderTopicList();
  }

  function renderTopicList() {
    const all = counts(ITEMS.keys());
    $("#gt-due").textContent = all.due;
    $("#gt-info").textContent = all.due
      ? `${plural(all.due, "Übung ist", "Übungen sind")} heute zum Wiederholen dran. Danach kommen neue Übungen dazu.`
      : "Gerade ist nichts fällig – das Training startet mit neuen Übungen.";
    setBar($("#gt-bar"), all.known, all.learning, ITEMS.size);
    $("#gt-known").textContent = `${all.known} sicher · ${all.learning} am Lernen · ${all.fresh} neu`;

    const list = $("#topic-list");
    list.innerHTML = "";
    for (const cat of CATEGORIES) {
      const section = document.createElement("section");
      section.className = "topic-section";
      section.innerHTML = `<h2></h2><div class="topic-grid"></div>`;
      section.querySelector("h2").textContent = cat;
      const grid = section.querySelector(".topic-grid");
      for (const topic of TOPICS.filter((t) => t.cat === cat)) {
        const c = counts(topic.ex.map((e) => e.id));
        const el = document.createElement("button");
        el.className = "topic-tile";
        el.innerHTML = `
          <span class="topic-title"></span>
          <span class="topic-short muted"></span>
          <span class="stackbar"><span class="known"></span><span class="learning"></span></span>
          <span class="topic-meta muted"></span>`;
        el.querySelector(".topic-title").textContent = topic.title;
        el.querySelector(".topic-short").textContent = topic.short;
        setBar(el.querySelector(".stackbar"), c.known, c.learning, topic.ex.length);
        el.querySelector(".topic-meta").textContent =
          `${plural(topic.ex.length, "Übung", "Übungen")} · ${c.known} sicher` + (c.due ? ` · ${c.due} fällig` : "");
        el.onclick = () => showTopic(topic);
        grid.appendChild(el);
      }
      list.appendChild(section);
    }
  }

  /* ---------- topic page ---------- */

  let currentTopic = null;

  function showTopic(topic) {
    currentTopic = topic;
    $("#topic-title").textContent = topic.title;
    $("#topic-article").innerHTML = topic.html; // static content from the repo
    const links = $("#topic-links");
    links.innerHTML = "";
    for (const l of topic.links) {
      const a = document.createElement("a");
      a.href = l.u;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = l.t;
      const li = document.createElement("li");
      li.appendChild(a);
      links.appendChild(li);
    }
    const c = counts(topic.ex.map((e) => e.id));
    for (const btn of document.querySelectorAll("[data-topic-start]")) {
      btn.textContent = `Übungen starten (${topic.ex.length})`;
    }
    $("#topic-due-btn").hidden = !c.due;
    $("#topic-due-btn").textContent = `Nur fällige (${c.due})`;
    $("#topic-progress").textContent = `${c.known} von ${topic.ex.length} Übungen sicher`;
    show("view-topic");
  }

  document.querySelectorAll("[data-topic-start]").forEach((btn) =>
    btn.addEventListener("click", () => startQuiz(shuffle(currentTopic.ex.map((e) => e.id)), currentTopic.title)),
  );
  $("#topic-due-btn").addEventListener("click", () =>
    startQuiz(shuffle(currentTopic.ex.map((e) => e.id).filter(isDue)), currentTopic.title),
  );

  /* ---------- training (spaced repetition) ---------- */

  async function startTraining() {
    try {
      await loadProgress();
    } catch (ex) {
      return toast(ex.message);
    }
    const due = shuffle(dueItems()).slice(0, MAX_DUE_PER_TRAINING);
    // new exercises in learning order, so the topics are worked through one by one
    const fresh = [...ITEMS.keys()].filter((id) => !progress.has(id)).slice(0, NEW_PER_TRAINING);
    const ids = [...due, ...fresh];
    if (!ids.length) {
      return toast("Alles geschafft! Gerade ist keine Übung fällig und alle sind bearbeitet.");
    }
    startQuiz(ids, "Grammatik-Training");
  }

  /* ---------- quiz ---------- */

  const quiz = { ids: [], queue: [], title: "", firstTry: new Set(), wrongOnce: new Set(), answered: false };

  function startQuiz(ids, title) {
    if (!ids.length) return toast("Keine Übungen ausgewählt.");
    Object.assign(quiz, {
      ids,
      queue: [...ids],
      title,
      firstTry: new Set(),
      wrongOnce: new Set(),
      answered: false,
    });
    show("view-quiz");
    showQuestion();
  }

  function showQuestion() {
    const total = quiz.ids.length;
    $("#quiz-bar").style.width = `${((total - quiz.queue.length) / total) * 100}%`;
    $("#quiz-counter").textContent = `${quiz.queue.length} übrig`;
    if (!quiz.queue.length) return finishQuiz();

    const item = ITEMS.get(quiz.queue[0]);
    quiz.answered = false;
    $("#quiz-topic").textContent = item.topic.title;
    $("#quiz-feedback").hidden = true;
    $("#quiz-next").hidden = true;

    const q = $("#quiz-question");
    q.innerHTML = "";
    const [before, ...rest] = item.q.split("___");
    const after = rest.join("___");
    q.append(before);
    if (item.t === "g") {
      const input = document.createElement("input");
      Object.assign(input, { id: "quiz-input", type: "text", autocomplete: "off", spellcheck: false });
      input.setAttribute("autocapitalize", "off");
      input.setAttribute("autocorrect", "off");
      input.setAttribute("enterkeyhint", "done");
      input.className = "gap-input";
      q.append(input);
    } else if (rest.length) {
      const blank = document.createElement("span");
      blank.className = "gap-blank";
      blank.textContent = "_____";
      q.append(blank);
    }
    q.append(after);

    const options = $("#quiz-options");
    options.innerHTML = "";
    $("#quiz-check").hidden = item.t !== "g";
    if (item.t === "c") {
      item.o.forEach((text, i) => {
        const b = document.createElement("button");
        b.className = "option";
        b.innerHTML = `<span class="key">${i + 1}</span><span></span>`;
        b.lastChild.textContent = text;
        b.onclick = () => answer(i === item.a, i);
        options.appendChild(b);
      });
    } else {
      setTimeout(() => $("#quiz-input")?.focus(), 50);
    }
  }

  function checkGap() {
    const item = ITEMS.get(quiz.queue[0]);
    const value = $("#quiz-input").value;
    if (!value.trim()) return toast("Schreib zuerst deine Antwort in die Lücke.");
    answer(isCorrectGap(value, item.a));
  }

  function answer(correct, chosen) {
    if (quiz.answered) return;
    quiz.answered = true;
    const id = quiz.queue[0];
    const item = ITEMS.get(id);

    // show feedback
    if (item.t === "c") {
      [...$("#quiz-options").children].forEach((b, i) => {
        b.disabled = true;
        if (i === item.a) b.classList.add("right");
        else if (i === chosen) b.classList.add("wrong");
      });
    } else {
      const input = $("#quiz-input");
      input.readOnly = true;
      input.classList.add(correct ? "right" : "wrong");
    }
    $("#quiz-check").hidden = true;
    const fb = $("#quiz-feedback");
    fb.className = `feedback ${correct ? "right" : "wrong"}`;
    $("#quiz-verdict").textContent = correct ? "Richtig!" : "Leider falsch";
    const solution = item.t === "c" ? item.o[item.a] : item.a.join(" / ");
    $("#quiz-solution").textContent = correct && item.t === "c" ? "" : `Lösung: ${solution}`;
    $("#quiz-explain").textContent = item.e;
    fb.hidden = false;
    $("#quiz-next").hidden = false;
    $("#quiz-next").focus();

    // save (spaced repetition) and update the queue
    if (!correct) quiz.wrongOnce.add(id);
    else if (!quiz.wrongOnce.has(id)) quiz.firstTry.add(id);
    api("/grammar/review", { method: "POST", body: { item: id, correct } })
      .then((row) => progress.set(id, row))
      .catch(() => toast("Antwort konnte nicht gespeichert werden"));
  }

  function next() {
    if (!quiz.answered) return;
    const id = quiz.queue.shift();
    const lastWasWrong = $("#quiz-feedback").classList.contains("wrong");
    if (lastWasWrong) quiz.queue.push(id); // wrong answers come back at the end
    showQuestion();
  }

  function finishQuiz() {
    const total = quiz.ids.length;
    $("#quiz-done-title").textContent = quiz.title;
    $("#quiz-done-stats").textContent =
      `${quiz.firstTry.size} von ${total} beim ersten Versuch richtig` +
      (quiz.wrongOnce.size ? ` · ${quiz.wrongOnce.size} wiederholt` : " – perfekt!");
    show("view-quiz-done");
  }

  $("#quiz-check").addEventListener("click", checkGap);
  $("#quiz-next").addEventListener("click", next);

  document.addEventListener("keydown", (e) => {
    if (!isVisible("view-quiz")) return;
    if (e.key === "Enter") {
      e.preventDefault();
      if (quiz.answered) next();
      else if (ITEMS.get(quiz.queue[0])?.t === "g") checkGap();
    } else if (!quiz.answered && /^[1-9]$/.test(e.key) && document.activeElement?.id !== "quiz-input") {
      $("#quiz-options").children[Number(e.key) - 1]?.click();
    }
  });

  /* ---------- navigation ---------- */

  $("#gc-train").addEventListener("click", startTraining);
  $("#gc-topics").addEventListener("click", showGrammar);
  $("#gt-train").addEventListener("click", startTraining);
  $("#quiz-again").addEventListener("click", () => startQuiz(shuffle([...quiz.ids]), quiz.title));
  document.querySelectorAll("[data-grammar]").forEach((b) => b.addEventListener("click", showGrammar));

  return { refreshHome };
}
