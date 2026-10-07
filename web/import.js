// Import a word list (e.g. from a Claude chat) into a deck.
// Each line becomes a card; the text is drawn onto the card image, so imported
// cards work exactly like handwritten ones (same 900 × 600 PNG format).

const CARD_W = 900;
const CARD_H = 600;
// handwriting-like fonts available on iPad/iPhone, Mac and Windows
const FONT = '"Noteworthy", "Bradley Hand", "Segoe Print", "Comic Sans MS", system-ui, sans-serif';

// Separators, most specific first. Hyphens/colons only count with spaces
// around them, so "well-known" or "e-mail" stay intact.
const SEPARATORS = [/\t+/, /\s*;\s*/, /\s+=\s+/, /\s+[–—]\s+/, /\s+-\s+/, /\s*\|\s*/, /\s+:\s+/];

function cleanCell(text) {
  return text
    .replace(/\*\*|__/g, "") // markdown bold
    .replace(/^["'„“”`]+|["'„“”`]+$/g, "")
    .trim();
}

// Returns { pairs: [{ en, de }], skipped: [line, …] }
export function parseWordList(text) {
  const pairs = [];
  const skipped = [];
  for (const raw of String(text).split(/\r?\n/)) {
    let line = raw.trim();
    if (!line) continue;
    if (/^\|?[\s:|-]+\|?$/.test(line)) continue; // markdown table separator |---|---|
    line = line
      .replace(/^\|(.*)\|$/, "$1") // markdown table row
      .replace(/^([-*•·]|\d+[.)])\s+/, ""); // bullets and numbering

    let parts = null;
    for (const sep of SEPARATORS) {
      const p = line.split(sep);
      if (p.length >= 2) {
        parts = [p[0], p.slice(1).join(", ")];
        break;
      }
    }
    const [en, de] = (parts || []).map(cleanCell);
    if (!en || !de) {
      skipped.push(raw.trim());
      continue;
    }
    // header lines like "Englisch ; Deutsch" or "English | German"
    if (/^(englisch|english|wort|word|en)$/i.test(en) && /^(deutsch|german|übersetzung|translation|de)$/i.test(de)) continue;
    pairs.push({ en, de });
  }
  return { pairs, skipped };
}

// Break text into at most `maxLines` lines that fit `width` at the current font.
function wrap(ctx, text, width, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= width || !line) line = test;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines.length <= maxLines ? lines : null;
}

// Draw `text` centred on a transparent card-sized canvas, as large as fits.
export function renderTextCard(text) {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxWidth = CARD_W * 0.84;
  let size = 110;
  let lines = null;
  while (size >= 28) {
    ctx.font = `${size}px ${FONT}`;
    lines = wrap(ctx, text, maxWidth, 3);
    if (lines && lines.every((l) => ctx.measureText(l).width <= maxWidth)) break;
    size -= 6;
  }
  if (!lines) {
    ctx.font = `28px ${FONT}`;
    lines = wrap(ctx, text, maxWidth, 99);
  }
  const lineHeight = size * 1.25;
  // text sits below the blue header line of the index card (17 % from the top)
  const centre = CARD_H * 0.58;
  const top = centre - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, CARD_W / 2, top + i * lineHeight, maxWidth));
  return canvas.toDataURL("image/png");
}

export function initImport({ api, toast, plural, onDone }) {
  const $ = (sel) => document.querySelector(sel);
  const dialog = $("#import-dialog");
  const input = $("#import-text");
  let deck = null;
  let busy = false;

  function preview() {
    const { pairs, skipped } = parseWordList(input.value);
    const list = $("#import-preview");
    list.innerHTML = "";
    for (const { en, de } of pairs.slice(0, 50)) {
      const li = document.createElement("li");
      li.innerHTML = `<span class="en"></span><span class="arrow">→</span><span class="de"></span>`;
      li.querySelector(".en").textContent = en;
      li.querySelector(".de").textContent = de;
      list.appendChild(li);
    }
    if (pairs.length > 50) {
      const li = document.createElement("li");
      li.className = "more";
      li.textContent = `… und ${pairs.length - 50} weitere`;
      list.appendChild(li);
    }
    $("#import-count").textContent = pairs.length
      ? `${plural(pairs.length, "Wort", "Wörter")} erkannt`
      : "Noch keine Wörter erkannt";
    const warn = $("#import-skipped");
    warn.hidden = !skipped.length;
    warn.textContent = skipped.length
      ? `${plural(skipped.length, "Zeile wird", "Zeilen werden")} übersprungen (kein Trennzeichen gefunden): ${skipped.slice(0, 3).join(" · ")}${skipped.length > 3 ? " …" : ""}`
      : "";
    $("#import-submit").disabled = !pairs.length || busy;
    $("#import-submit").textContent = pairs.length ? `${plural(pairs.length, "Karte", "Karten")} anlegen` : "Karten anlegen";
    return pairs;
  }

  function open(target) {
    deck = target;
    busy = false;
    $("#import-title").textContent = `Wörter importieren · ${deck.name}`;
    input.value = "";
    $("#import-progress").hidden = true;
    input.disabled = false;
    preview();
    dialog.showModal();
    input.focus();
  }

  async function paste() {
    try {
      input.value = await navigator.clipboard.readText();
      preview();
    } catch {
      toast("Einfügen nicht erlaubt – bitte lange ins Feld tippen und „Einsetzen“ wählen.");
    }
  }

  async function submit() {
    const pairs = preview();
    if (!pairs.length || busy) return;
    busy = true;
    input.disabled = true;
    $("#import-submit").disabled = true;
    const bar = $("#import-progress");
    bar.hidden = false;
    let done = 0;
    let failed = 0;
    const update = () => {
      bar.querySelector("span").style.width = `${((done + failed) / pairs.length) * 100}%`;
      $("#import-count").textContent = `Lege Karten an … ${done + failed} / ${pairs.length}`;
    };
    update();
    // a few requests in parallel, in list order
    let next = 0;
    async function worker() {
      while (next < pairs.length) {
        const { en, de } = pairs[next++];
        try {
          await api(`/decks/${deck.id}/cards`, {
            method: "POST",
            body: { english: renderTextCard(en), german: renderTextCard(de) },
          });
          done++;
        } catch {
          failed++;
        }
        update();
      }
    }
    await Promise.all([worker(), worker(), worker()]);
    busy = false;
    dialog.close();
    toast(
      failed
        ? `${done} Karten angelegt, ${failed} fehlgeschlagen – bitte nochmal versuchen.`
        : `${plural(done, "Karte", "Karten")} in „${deck.name}“ angelegt`,
    );
    onDone();
  }

  input.addEventListener("input", preview);
  $("#import-paste").addEventListener("click", paste);
  $("#import-submit").addEventListener("click", submit);
  $("#import-cancel").addEventListener("click", () => !busy && dialog.close());
  dialog.addEventListener("cancel", (e) => busy && e.preventDefault());

  return { open };
}
