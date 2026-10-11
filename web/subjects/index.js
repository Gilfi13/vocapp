// Start page: one tile per subject. Englisch opens the vocabulary + grammar page,
// Datenbanken the MySQL cheat sheet, the others a placeholder for now.
import datenbanken from "./datenbanken.js";

export const SUBJECTS = [
  { id: "englisch", name: "Englisch", short: "Vokabeln & Grammatik", tag: "EN", color: "#1f6feb" },
  { id: "mathe", name: "Mathe", short: "Kommt bald", tag: "∑", color: "#e5484d" },
  { id: "dem", name: "DEM", short: "Kommt bald", tag: "DEM", color: "#8e4ec6" },
  { id: "datenbanken", name: "Datenbanken", short: "SQL-Spickzettel (MySQL)", tag: "SQL", color: "#1f9d55", content: datenbanken },
  { id: "programmieren", name: "Programmieren", short: "Kommt bald", tag: "</>", color: "#f76b15" },
  { id: "management", name: "Management", short: "Kommt bald", tag: "MGT", color: "#0d9488" },
];

export function initSubjects({ show, onEnglish }) {
  const $ = (sel) => document.querySelector(sel);

  function showSubjects() {
    show("view-subjects");
  }

  function renderTiles() {
    const grid = $("#subject-grid");
    grid.innerHTML = "";
    for (const s of SUBJECTS) {
      const el = document.createElement("button");
      el.className = "subject-tile";
      el.style.setProperty("--subject", s.color);
      el.innerHTML = `<span class="subject-tag"></span><span class="subject-name"></span><span class="subject-short muted"></span>`;
      el.querySelector(".subject-tag").textContent = s.tag;
      el.querySelector(".subject-name").textContent = s.name;
      el.querySelector(".subject-short").textContent = s.short;
      el.onclick = () => openSubject(s);
      grid.appendChild(el);
    }
  }

  function openSubject(s) {
    if (s.id === "englisch") return onEnglish();
    $("#subject-title").textContent = s.name;
    const page = $("#subject-page");
    page.innerHTML = "";
    if (!s.content) {
      page.innerHTML = `<div class="empty"><p class="subject-soon">Hier ist noch nichts.</p><p class="muted">Inhalte für dieses Fach kommen bald.</p></div>`;
      return show("view-subject");
    }

    // jump chips
    const nav = document.createElement("div");
    nav.className = "chips subject-nav";
    for (const sec of s.content.sections) {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.textContent = sec.title;
      chip.onclick = () => document.getElementById(`sec-${sec.id}`).scrollIntoView({ behavior: "smooth" });
      nav.appendChild(chip);
    }
    page.appendChild(nav);

    for (const sec of s.content.sections) {
      const article = document.createElement("article");
      article.className = "gram subject-section";
      article.id = `sec-${sec.id}`;
      article.innerHTML = `<h2></h2>${sec.html}`; // static content from the repo
      article.querySelector("h2").textContent = sec.title;
      page.appendChild(article);
    }

    if (s.content.links?.length) {
      const panel = document.createElement("section");
      panel.className = "panel links-panel";
      panel.innerHTML = `<h2>Zum Üben im Internet</h2><ul></ul>`;
      for (const l of s.content.links) {
        const a = document.createElement("a");
        Object.assign(a, { href: l.u, target: "_blank", rel: "noopener", textContent: l.t });
        const li = document.createElement("li");
        li.appendChild(a);
        panel.querySelector("ul").appendChild(li);
      }
      page.appendChild(panel);
    }
    show("view-subject");
  }

  renderTiles();
  document.querySelectorAll("[data-subjects]").forEach((b) => b.addEventListener("click", showSubjects));

  return { showSubjects };
}
