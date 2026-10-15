// Mathe-Karteikarten: Angewandte Statistik und Mathematik (HNU, WS 2026/27).
// Übungsblatt 1 (Symbole & Begriffe) plus die Begriffe aus Skript Teil 1 und 2.
// Jede Karte: f = Vorderseite (Symbol oder Begriff), n = Name, d = Bedeutung,
// b = kurzes Beispiel. HTML ist erlaubt (statischer Inhalt aus dem Repo).
// Wahrheitswerte immer als 1 (wahr) und 0 (falsch).
// Die id ist der Schlüssel für den Lernfortschritt – nicht nachträglich ändern.

// Schreibhilfen für Formeln (Unicode + etwas CSS, kein LaTeX)
const lim = (sub) => `<span class="m-op">lim<small>${sub}</small></span>`;
const big = (sym, lo, hi) => `<span class="m-op m-big"><small>${hi}</small>${sym}<small>${lo}</small></span>`;
const frac = (a, b) => `<span class="m-frac"><span>${a}</span><span>${b}</span></span>`;
const ol = (x) => `<span class="m-ol">${x}</span>`;

export const CATEGORIES = [
  "1. Elementare Logik",
  "2. Mengen",
  "3. Zahlenmengen",
  "4. Funktionen",
  "5. Grenzwerte von Funktionen",
];

export const CHAPTERS = [
  /* ---------------- 1. Elementare Logik ---------------- */
  {
    id: "logik",
    cat: "1. Elementare Logik",
    title: "Aussagenlogik",
    short: "Aussagen, Junktoren, De Morgan, Schlussfolgerungen",
    cards: [
      { id: "ma-aussage", f: "P, Q", n: "Aussagen", d: "Sätze, denen man genau einen Wahrheitswert zuordnen kann: wahr (1) oder falsch (0).", b: "„7 ist eine Primzahl“ → 1; „2 + 2 = 5“ → 0" },
      { id: "ma-negation", f: "¬P", n: "Negation (nicht)", d: "Dreht den Wahrheitswert um.", b: "¬0 = 1, ¬1 = 0" },
      { id: "ma-konjunktion", f: "P ∧ Q", n: "Konjunktion (und)", d: "Nur 1, wenn beide Aussagen 1 sind.", b: "1 ∧ 1 = 1, 1 ∧ 0 = 0, 0 ∧ 0 = 0" },
      { id: "ma-disjunktion", f: "P ∨ Q", n: "Disjunktion (oder)", d: "1, wenn mindestens eine Aussage 1 ist (kein „entweder – oder“).", b: "1 ∨ 1 = 1, 1 ∨ 0 = 1, 0 ∨ 0 = 0" },
      { id: "ma-implikation", f: "P ⇒ Q", n: "Implikation (wenn …, dann …)", d: "Nur 0, wenn P = 1 und Q = 0, sonst 1.", b: "1 ⇒ 0 = 0, 0 ⇒ 1 = 1, 0 ⇒ 0 = 1" },
      { id: "ma-aequivalenz", f: "P ⇔ Q", n: "Äquivalenz (genau dann, wenn)", d: "1, wenn P und Q den gleichen Wahrheitswert haben, sonst 0.", b: "1 ⇔ 1 = 1, 0 ⇔ 0 = 1, 1 ⇔ 0 = 0" },
      { id: "ma-de-morgan", f: "De Morgan", n: "Negation einer Klammer", d: "¬(P ∧ Q) = ¬P ∨ ¬Q und ¬(P ∨ Q) = ¬P ∧ ¬Q – das Zeichen kippt mit!", b: "„nicht (Regen und kalt)“ = „kein Regen oder nicht kalt“" },
      { id: "ma-modus-tollens", f: "Modus Tollens", n: "Rückwärts-Schluss aus der Implikation", d: "(P ⇒ Q) ∧ ¬Q ⇒ ¬P: Ist Q = 0, dann muss auch P = 0 sein.", b: "„Wenn es regnet, ist die Straße nass.“ Straße nicht nass → es regnet nicht." },
      { id: "ma-fehlschluss", f: "Fehlschluss bei Implikation", n: "Aus P = 0 folgt nichts über Q", d: "Ist P falsch, kann man über Q keine Aussage treffen. Wer trotzdem schließt, macht einen Fehlschluss.", b: "„Wenn ich mit dem Rad fahre, komme ich pünktlich.“ Nicht mit dem Rad gefahren → keine Aussage über die Ankunftszeit." },
    ],
  },
  {
    id: "quantoren",
    cat: "1. Elementare Logik",
    title: "Quantoren",
    short: "für alle, es gibt, Aufbau, Verneinung",
    cards: [
      { id: "ma-allquantor", f: "∀", n: "Allquantor, „für alle“", d: "Die Aussage gilt für jedes x der Menge.", b: "∀x ∈ ℕ : x³ ≥ x (= 1)" },
      { id: "ma-existenzquantor", f: "∃", n: "Existenzquantor, „es gibt (mindestens ein)“", d: "Es gibt mindestens ein x, für das die Aussage gilt.", b: "∃x : x + 5 = 12 (= 1, nämlich x = 7)" },
      { id: "ma-aussageform", f: "a(x)", n: "Aussageform", d: "Aussage mit einer Variablen. Erst wenn man für x etwas einsetzt, ist sie 1 oder 0.", b: "a(x): x &gt; 3. a(5) = 1, a(2) = 0" },
      { id: "ma-quantor-aufbau", f: "Aufbau einer Quantor-Aussage", n: "Quantor + Variable ∈ Menge + „:“ + Bedingung", d: "„:“ heißt „gilt“ bzw. „so dass“.", b: "∀x ∈ ℕ : x³ ≥ x = „Für alle x aus ℕ gilt x³ ≥ x.“" },
      { id: "ma-quantor-verneinung", f: "Verneinung von Quantoren", n: "Quantor kippt, Bedingung wird verneint", d: "∀ ↔ ∃: ¬(∀x : a(x)) = ∃x : ¬a(x) und ¬(∃x : a(x)) = ∀x : ¬a(x)", b: "„Es gibt einen Vogel, der nicht fliegen kann“ → Verneinung: „Alle Vögel können fliegen“" },
    ],
  },

  /* ---------------- 2. Mengen ---------------- */
  {
    id: "mengen",
    cat: "2. Mengen",
    title: "Mengen – Grundbegriffe",
    short: "Mengenklammern, Element, Mächtigkeit, Teilmengen",
    cards: [
      { id: "ma-mengenklammern", f: "{ }", n: "Mengenklammern", d: "Fassen eindeutig bestimmte Objekte (Elemente) zu einer Menge zusammen. Jedes Element nur einmal, die Reihenfolge ist egal.", b: "A = {2, 4, 6, 8}; {1, 2} = {2, 1}" },
      { id: "ma-element", f: "∈", n: "Element von", d: "o ∈ M: o liegt in der Menge M.", b: "A = {2, 4, 6, 8}: 4 ∈ A" },
      { id: "ma-kein-element", f: "∉", n: "kein Element von", d: "o ∉ M: o liegt nicht in der Menge M.", b: "A = {2, 4, 6, 8}: 5 ∉ A" },
      { id: "ma-grundmenge", f: "G", n: "Grundmenge", d: "Menge, aus der alle betrachteten Mengen stammen.", b: "G = {1, 2, …, 10}; A = {2, 4, 6, 8} liegt ganz in G" },
      { id: "ma-maechtigkeit", f: "|B|", n: "Mächtigkeit", d: "Anzahl der Elemente einer Menge.", b: "B = {6, 9} → |B| = 2" },
      { id: "ma-leere-menge", f: "{ } bzw. ∅", n: "leere Menge", d: "Menge ohne Elemente, |{ }| = 0. Sie ist Teilmenge jeder Menge.", b: "{x ∈ ℕ | x &lt; 1} = { }" },
      { id: "ma-mengen-gleich", f: "M = N", n: "Gleichheit von Mengen", d: "Zwei Mengen sind gleich, wenn sie genau die gleichen Elemente enthalten, sonst M ≠ N.", b: "{1, 2, 3} = {3, 1, 2}, aber {1, 2} ≠ {1, 2, 3}" },
      { id: "ma-teilmenge", f: "Teilmenge", n: "Menge, deren Elemente alle in der anderen Menge liegen", d: "Auch die leere Menge und die Menge selbst sind Teilmengen.", b: "Teilmengen von {6, 9}: { }, {6}, {9}, {6, 9}" },
      { id: "ma-teilmenge-zeichen", f: "A ⊆ B", n: "A ist Teilmenge von B", d: "Jedes Element von A liegt auch in B. Andersherum: B ⊇ A („B ist Obermenge von A“). Gilt das nicht: A ⊈ B.", b: "{6} ⊆ {6, 9} und {6, 9} ⊆ {6, 9}; {4} ⊈ {6, 9}" },
      { id: "ma-echte-teilmenge", f: "A ⊂ B", n: "echte Teilmenge", d: "A ⊆ B und A ≠ B: B hat mindestens ein Element mehr als A.", b: "{6} ⊂ {6, 9}, aber {6, 9} ist keine echte Teilmenge von {6, 9}" },
      { id: "ma-mengenschreibweise", f: "{x | Eigenschaft von x}", n: "beschreibende Mengenschreibweise", d: "Menge über eine gemeinsame Eigenschaft der Elemente. „|“ liest man „für die gilt“.", b: "{x ∈ ℕ | x &lt; 4} = {1, 2, 3}" },
    ],
  },
  {
    id: "mengenoperationen",
    cat: "2. Mengen",
    title: "Mengenoperationen",
    short: "Schnitt, Vereinigung, Differenz, Komplement, kartesisches Produkt",
    cards: [
      { id: "ma-schnittmenge", f: "A ∩ C", n: "Schnittmenge / Durchschnitt", d: "Elemente, die in beiden Mengen vorkommen. Zeichen: umgedrehtes U, nach unten offen.", b: "{2, 4, 6, 8} ∩ {4, 9, 1} = {4}" },
      { id: "ma-vereinigung", f: "B ∪ C", n: "Vereinigung", d: "Alle Elemente aus beiden Mengen, gemeinsame nur einmal. Zeichen: U, nach oben offen.", b: "{6, 9} ∪ {4, 9, 1} = {1, 4, 6, 9}" },
      { id: "ma-differenz", f: "G \\ A", n: "Differenz („ohne“)", d: "Elemente aus G, die nicht in A sind.", b: "{1, 2, 3, 4} \\ {2, 4} = {1, 3}" },
      { id: "ma-komplement", f: ol("A"), n: "Komplement von A", d: `Alles aus der Grundmenge G, was nicht in A liegt: ${ol("A")} = G \\ A.`, b: `G = {1, 2, 3, 4, 5}, A = {1, 2} → ${ol("A")} = {3, 4, 5}` },
      { id: "ma-kartesisches-produkt", f: "B × C", n: "Kartesisches Produkt", d: "Alle geordneten Paare (erst aus B, dann aus C). Paare wie (9, 9) sind erlaubt, die Reihenfolge zählt.", b: "{6, 9} × {4, 9, 1} = {(6, 4), (6, 9), (6, 1), (9, 4), (9, 9), (9, 1)}" },
      { id: "ma-geordnetes-paar", f: "(a, b)", n: "geordnetes Paar (2-Tupel)", d: "Die Reihenfolge zählt: (a, b) = (a′, b′) nur, wenn a = a′ und b = b′.", b: "(6, 9) ≠ (9, 6)" },
      { id: "ma-relation", f: "Relation", n: "Teilmenge des kartesischen Produkts", d: "Die Paare, die tatsächlich in Beziehung stehen. Je nach Anzahl der Mengen ein- oder mehrstellig.", b: "R = {(a, b) ∈ {6, 9} × {4, 9, 1} | a &lt; b} = {(6, 9)}" },
    ],
  },

  /* ---------------- 3. Zahlenmengen ---------------- */
  {
    id: "zahlenmengen",
    cat: "3. Zahlenmengen",
    title: "Zahlenmengen",
    short: "ℕ, ℕ₀, ℤ, ℚ, ℝ, Betrag",
    cards: [
      { id: "ma-n", f: "ℕ", n: "natürliche Zahlen", d: "Die Zählzahlen ohne 0.", b: "ℕ = {1, 2, 3, …}" },
      { id: "ma-n0", f: "ℕ₀", n: "natürliche Zahlen mit 0", d: "ℕ₀ = ℕ ∪ {0}", b: "ℕ₀ = {0, 1, 2, 3, …}" },
      { id: "ma-z", f: "ℤ", n: "ganze Zahlen", d: "Natürliche Zahlen, 0 und die negativen Zahlen.", b: "ℤ = {…, −2, −1, 0, 1, 2, …}" },
      { id: "ma-z-minus", f: "ℤ⁻", n: "negative ganze Zahlen", d: "Alle ganzen Zahlen kleiner als 0.", b: "ℤ⁻ = {…, −3, −2, −1}" },
      { id: "ma-z-plus", f: "ℤ⁺", n: "positive ganze Zahlen", d: "Alle ganzen Zahlen größer als 0 (also gleich ℕ).", b: "ℤ⁺ = {1, 2, 3, …}" },
      { id: "ma-q", f: "ℚ", n: "rationale Zahlen", d: `Alle Brüche: ℚ = {${frac("p", "q")} | p, q ∈ ℤ, q ≠ 0}`, b: `${frac("1", "2")}, −${frac("3", "4")}, 5 = ${frac("5", "1")}` },
      { id: "ma-r", f: "ℝ", n: "reelle Zahlen", d: "Alle Zahlen auf dem Zahlenstrahl, auch unendliche nicht-periodische Dezimalzahlen.", b: "−2, 0,5, √2, π ∈ ℝ" },
      { id: "ma-m0-plus-minus", f: "M₀, M⁺, M⁻", n: "Notation für Zahlenbereiche", d: "M₀ = M ∪ {0}, M⁺ = {x ∈ M | x &gt; 0}, M⁻ = {x ∈ M | x &lt; 0}", b: "ℝ⁺ = alle positiven reellen Zahlen, ℝ₀⁺ = [0, ∞)" },
      { id: "ma-zahlbereiche", f: "ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ", n: "Zahlbereiche ineinander", d: "Jeder Zahlbereich ist echte Teilmenge des nächsten.", b: "5 ∈ ℕ, also auch 5 ∈ ℤ, ℚ, ℝ und ℂ" },
      { id: "ma-betrag-reell", f: "|a|", n: "Betrag einer reellen Zahl", d: "Abstand zur 0: |a| = a, wenn a ≥ 0, und |a| = −a, wenn a &lt; 0.", b: "|−3| = 3, |3| = 3" },
    ],
  },
  {
    id: "intervalle",
    cat: "3. Zahlenmengen",
    title: "Intervalle",
    short: "eckige und runde Klammern, ∞",
    cards: [
      { id: "ma-intervall-geschlossen", f: "[a, b]", n: "abgeschlossenes Intervall", d: "a und b gehören dazu: {x ∈ ℝ | a ≤ x ≤ b}", b: "[1, 3] enthält 1, 2,5 und 3" },
      { id: "ma-intervall-offen", f: "(a, b)", n: "offenes Intervall", d: "a und b gehören nicht dazu: {x ∈ ℝ | a &lt; x &lt; b}", b: "(1, 3) enthält 2, aber nicht 1 und 3" },
      { id: "ma-intervall-halboffen", f: "[a, b) bzw. (a, b]", n: "halboffenes Intervall", d: "Eckige Klammer = Grenze gehört dazu, runde = nicht.", b: "[1, 3) enthält 1, aber nicht 3" },
      { id: "ma-unendlich", f: "∞", n: "unendlich", d: "Keine Zahl, sondern „ohne Grenze“. Steht immer mit runder Klammer.", b: "[−1, ∞) = {x ∈ ℝ | x ≥ −1}" },
      { id: "ma-intervall-umschreiben", f: "Mengenschreibweise ↔ Intervall", n: "Umschreiben", d: "&lt; wird zur runden Klammer, ≤ zur eckigen.", b: "{x ∈ ℝ | −5 &lt; x ≤ 3} = (−5, 3]" },
    ],
  },
  {
    id: "komplex",
    cat: "3. Zahlenmengen",
    title: "Komplexe Zahlen",
    short: "i, Real- und Imaginärteil, Betrag, Rechnen",
    cards: [
      { id: "ma-i", f: "i", n: "imaginäre Einheit", d: "Zahl, deren Quadrat −1 ist: i² = −1", b: "i² = −1, i³ = −i, i⁴ = 1" },
      { id: "ma-c", f: "ℂ", n: "komplexe Zahlen", d: "ℂ = {x + iy | x, y ∈ ℝ} mit i² = −1", b: "3 + i5 ∈ ℂ; jede reelle Zahl auch (y = 0)" },
      { id: "ma-komplexe-zahl", f: "a + ib", n: "komplexe Zahl", d: "a ist der Realteil, b der Imaginärteil (beide reell).", b: "3 + i5" },
      { id: "ma-realteil", f: "Re", n: "Realteil", d: "Der Teil ohne i.", b: "Re(3 + i5) = 3" },
      { id: "ma-imaginaerteil", f: "Im", n: "Imaginärteil", d: "Die reelle Zahl vor dem i (ohne das i).", b: "Im(3 + i5) = 5" },
      { id: "ma-konjugiert", f: ol("z"), n: "konjugiert komplexe Zahl", d: `Vorzeichen des Imaginärteils umdrehen: z = x + iy → ${ol("z")} = x − iy`, b: `z = 3 + i5 → ${ol("z")} = 3 − i5` },
      { id: "ma-betrag-komplex", f: "|z|", n: "Betrag einer komplexen Zahl", d: `|a + ib| = √(a² + b²) = √(z · ${ol("z")})`, b: "|3 + i5| = √(9 + 25) = √34" },
      { id: "ma-komplex-addition", f: "(x₁ + iy₁) + (x₂ + iy₂)", n: "Addition komplexer Zahlen", d: "Real- und Imaginärteile getrennt addieren: (x₁ + x₂) + i(y₁ + y₂)", b: "(3 + i5) + (1 + i2) = 4 + i7" },
      { id: "ma-komplex-multiplikation", f: "(x₁ + iy₁) · (x₂ + iy₂)", n: "Multiplikation komplexer Zahlen", d: "Ausmultiplizieren, i² = −1 einsetzen: (x₁x₂ − y₁y₂) + i(x₁y₂ + y₁x₂)", b: "(3 + i5) · (1 + i2) = (3 − 10) + i(6 + 5) = −7 + i11" },
    ],
  },
  {
    id: "summen",
    cat: "3. Zahlenmengen",
    title: "Summen & Produkte",
    short: "Σ, Π, Laufindex",
    cards: [
      { id: "ma-summe", f: "Σ", n: "Summenzeichen", d: `${big("Σ", "n=i", "j")} f(n) = f(i) + f(i+1) + … + f(j)`, b: `${big("Σ", "n=1", "5")} 2n = 2 + 4 + 6 + 8 + 10 = 30` },
      { id: "ma-produkt", f: "Π", n: "Produktzeichen", d: `${big("Π", "n=i", "j")} f(n) = f(i) · f(i+1) · … · f(j)`, b: `${big("Π", "n=1", "4")} 3ⁿ = 3 · 9 · 27 · 81` },
      { id: "ma-laufindex", f: "Laufindex", n: "Variable unter dem Zeichen (z. B. n)", d: "Läuft in Einerschritten vom Startwert (unten) bis zum Endwert (oben).", b: `${big("Σ", "n=1", "5")}: n läuft 1, 2, 3, 4, 5` },
    ],
  },

  /* ---------------- 4. Funktionen ---------------- */
  {
    id: "funktionen",
    cat: "4. Funktionen",
    title: "Funktionen – Grundbegriffe",
    short: "Abbildung, D und W, injektiv, surjektiv, bijektiv",
    cards: [
      { id: "ma-abbildung", f: "f : D → W", n: "Abbildung / Funktion", d: "Ordnet jedem Element aus D genau ein Element aus W zu.", b: "f : ℝ → ℝ, f(x) = x²" },
      { id: "ma-definitionsbereich", f: "D", n: "Definitionsbereich", d: "Alle x-Werte, die man in f einsetzen darf.", b: `f(x) = ${frac("1", "x")}: D = ℝ \\ {0}` },
      { id: "ma-wertebereich", f: "W", n: "Wertebereich", d: "Menge, in der die Funktionswerte f(x) liegen.", b: "f(x) = x² mit D = ℝ: alle Werte liegen in [0, ∞)" },
      { id: "ma-injektiv", f: "injektiv", n: "verschiedene x → verschiedene y", d: "Verschiedene Elemente von D werden auf verschiedene Elemente von W abgebildet (jedes y höchstens einmal getroffen).", b: "f(x) = 2x ist injektiv; x² auf ℝ nicht, da f(−2) = f(2) = 4" },
      { id: "ma-surjektiv", f: "surjektiv", n: "jedes y wird erreicht", d: "Jedes Element des Wertebereichs W wird mindestens einmal getroffen.", b: "x² : ℝ → ℝ nicht surjektiv (−1 wird nie erreicht), x² : ℝ → [0, ∞) schon" },
      { id: "ma-bijektiv", f: "bijektiv", n: "injektiv und surjektiv", d: "Jedes y aus W wird genau einmal getroffen. Dann ist f umkehrbar.", b: "f : ℝ → ℝ, f(x) = 2x + 1" },
      { id: "ma-reelle-funktion", f: "reelle Funktion", n: "Funktion mit einer Variablen", d: "Abbildung mit D ⊆ ℝ und W ⊆ ℝ.", b: "f(x) = x², f(x) = ln(x)" },
      { id: "ma-vertikaler-linientest", f: "Vertikaler Linientest", n: "Ist der Graph eine Funktion?", d: "Ja, wenn jede senkrechte Linie den Graphen höchstens einmal schneidet (Graph ist eindeutig).", b: "Normalparabel x²: ja; Einheitskreis x² + y² = 1: nein" },
      { id: "ma-polynom", f: "f(x) = aₙxⁿ + … + a₁x + a₀", n: "Polynomfunktion", d: "Mit aₙ ≠ 0. Die höchste Potenz n ∈ ℕ₀ ist der Grad.", b: "f(x) = 3x² − 2x + 1 hat Grad 2" },
    ],
  },
  {
    id: "eigenschaften",
    cat: "4. Funktionen",
    title: "Eigenschaften von Funktionen",
    short: "Symmetrie, Periodizität, Schranken, Monotonie, Steckbrief",
    cards: [
      { id: "ma-achsensymmetrisch", f: "f(−x) = f(x)", n: "achsensymmetrisch (gerade)", d: "Graph ist spiegelsymmetrisch zur y-Achse (für alle x ∈ D).", b: "x², x⁴, cos(x)" },
      { id: "ma-punktsymmetrisch", f: "f(−x) = −f(x)", n: "punktsymmetrisch (ungerade)", d: "Graph ist symmetrisch zum Ursprung (für alle x ∈ D).", b: "x, x³, sin(x)" },
      { id: "ma-periodisch", f: "f(x + c) = f(x)", n: "periodisch mit Periode c", d: "Für ein festes c ≠ 0 wiederholt sich der Graph alle c Einheiten.", b: "sin(x + 2π) = sin(x): Periode 2π" },
      { id: "ma-oben-beschraenkt", f: "∀x ∈ D : f(x) ≤ k", n: "nach oben beschränkt", d: "Es gibt eine Zahl k ∈ ℝ (obere Schranke), die f nie überschreitet.", b: "sin(x) ≤ 1; −x² ≤ 0" },
      { id: "ma-unten-beschraenkt", f: "∀x ∈ D : f(x) ≥ k", n: "nach unten beschränkt", d: "Es gibt eine Zahl k ∈ ℝ (untere Schranke), die f nie unterschreitet.", b: "x² ≥ 0; eˣ ≥ 0" },
      { id: "ma-beschraenkt", f: "beschränkt / unbeschränkt", n: "Beschränktheit", d: "Beschränkt = nach oben und nach unten beschränkt. Sonst unbeschränkt.", b: "sin(x) liegt zwischen −1 und 1 → beschränkt; x³ → unbeschränkt" },
      { id: "ma-monoton-steigend", f: "x &lt; x′ ⇒ f(x) ≤ f(x′)", n: "monoton steigend", d: "Für alle x, x′ ∈ D: größeres x → Funktionswert wird nicht kleiner.", b: "eˣ, x³, 2x + 1" },
      { id: "ma-monoton-fallend", f: "x &lt; x′ ⇒ f(x) ≥ f(x′)", n: "monoton fallend", d: "Für alle x, x′ ∈ D: größeres x → Funktionswert wird nicht größer. Geht auch nur in Teilbereichen.", b: `−x; ${frac("1", "x")} auf (0, ∞); x² auf (−∞, 0]` },
      { id: "ma-nullstelle", f: "f(x) = 0", n: "Nullstelle", d: "x-Wert, an dem der Graph die x-Achse schneidet oder berührt.", b: "f(x) = x² − 4: Nullstellen x = −2 und x = 2" },
      { id: "ma-fundamentalsatz", f: "Fundamentalsatz der Algebra", n: "Anzahl der Nullstellen", d: "Ein komplexes Polynom n-ten Grades hat genau n komplexe Nullstellen (mit Vielfachheit). Reell können es weniger sein.", b: "x² + 1: in ℝ keine, in ℂ zwei (i und −i)" },
      { id: "ma-steckbrief", f: "Steckbrief einer Funktion", n: "Checkliste zur Untersuchung", d: "D und W, Symmetrie, Periodizität, Schranken, Monotonie, Umkehrfunktion, Nullstellen, Asymptoten und Definitionslücken.", b: "Später dazu: Hochpunkte, Tiefpunkte, Wendepunkte (Differentialrechnung)" },
    ],
  },
  {
    id: "spezielle-funktionen",
    cat: "4. Funktionen",
    title: "Verkettung, Umkehrung, spezielle Funktionen",
    short: "g ∘ f, f⁻¹, eˣ, ln, sin, cos",
    cards: [
      { id: "ma-komposition", f: "g ∘ f", n: "Komposition / Verkettung", d: "(g ∘ f)(x) = g(f(x)): erst f, dann g. Voraussetzung: W_f ⊆ D_g.", b: `f(x) = ${frac("2", "x")}, g(x) = x² → (g ∘ f)(x) = ${frac("4", "x²")}` },
      { id: "ma-umkehrfunktion", f: "f⁻¹", n: "Umkehrfunktion", d: "Macht f rückgängig: f⁻¹(f(x)) = x und f(f⁻¹(y)) = y. Gibt es nur, wenn f umkehrbar ist.", b: "f(x) = 2x → f⁻¹(x) = x/2; x² auf [0, ∞) → √x" },
      { id: "ma-horizontaler-linientest", f: "Horizontaler Linientest", n: "Ist die Funktion umkehrbar?", d: "Ja, wenn jede waagrechte Linie den Graphen höchstens einmal schneidet (W = f(D)).", b: "x² auf ℝ: nein (y = 4 trifft −2 und 2); auf [0, ∞): ja" },
      { id: "ma-exp", f: "eˣ = exp(x)", n: "natürliche Exponentialfunktion", d: "Basis e ≈ 2,718. Immer positiv, monoton steigend. Umkehrfunktion: ln(x).", b: "e⁰ = 1, e¹ ≈ 2,718" },
      { id: "ma-ln", f: "ln(x) = logₑ(x)", n: "natürlicher Logarithmus", d: "Umkehrfunktion von eˣ, nur für x &gt; 0 definiert.", b: "ln(1) = 0, ln(e) = 1, ln(eˣ) = x" },
      { id: "ma-exponentialfunktion", f: "g(x) = c · aˣ", n: "Exponentialfunktion", d: "Mit c ≠ 0, a &gt; 0, a ≠ 1. Für a &gt; 1 gibt es ein festes d &gt; 0 mit 2 · g(x) = g(x + d) („Verdopplung“).", b: "g(x) = 3 · 2ˣ verdoppelt sich, wenn x um d = 1 wächst" },
      { id: "ma-sin", f: "sin(α)", n: "Sinus", d: `${frac("Gegenkathete von α", "Hypotenuse")}`, b: "sin(30°) = 0,5; sin(90°) = 1" },
      { id: "ma-cos", f: "cos(α)", n: "Kosinus", d: `${frac("Ankathete von α", "Hypotenuse")}`, b: "cos(0°) = 1; cos(60°) = 0,5" },
      { id: "ma-csc-sec", f: "csc(α), sec(α)", n: "Kosekans und Sekans", d: `csc(α) = ${frac("1", "sin(α)")}, sec(α) = ${frac("1", "cos(α)")}`, b: "csc(30°) = 2; sec(0°) = 1" },
      { id: "ma-einheitskreis", f: "x² + y² = 1", n: "Einheitskreis", d: "Kreis um den Ursprung mit Radius r = 1. Kein Funktionsgraph (vertikaler Linientest).", b: "Der Punkt (cos α, sin α) liegt auf dem Einheitskreis" },
    ],
  },

  /* ---------------- 5. Grenzwerte ---------------- */
  {
    id: "grenzwerte",
    cat: "5. Grenzwerte von Funktionen",
    title: "Grenzwerte",
    short: "Limes, eigentlich, uneigentlich, einseitig",
    cards: [
      { id: "ma-limes", f: `${lim("x→x₀")} f(x) = y₀`, n: "Grenzwert / Limes", d: "Wert y₀, dem sich f annähert, wenn x gegen x₀ geht – f muss ihn nicht erreichen.", b: `${lim("x→1")} ${frac("3x² − 3x", "x − 1")} = ${lim("x→1")} 3x = 3` },
      { id: "ma-eigentlicher-gw", f: "eigentlicher Grenzwert", n: "Grenzwert ist eine Zahl", d: "y₀ ∈ ℝ", b: `${lim("x→∞")} ${frac("1", "x")} = 0` },
      { id: "ma-uneigentlicher-gw", f: "uneigentlicher Grenzwert", n: "Grenzwert ist ±∞", d: "y₀ = +∞ oder y₀ = −∞", b: `${lim("x→∞")} eˣ = ∞` },
      { id: "ma-gw-unendlich", f: "x → ∞ bzw. x → −∞", n: "Grenzwert im Unendlichen", d: "Beschreibt, wie sich f für sehr große bzw. sehr kleine x verhält.", b: `${lim("x→−∞")} eˣ = 0, ${lim("x→∞")} ${frac("1", "x")} = 0` },
      { id: "ma-linksseitig", f: lim("x→x₀⁻") + " f(x)", n: "linksseitiger Grenzwert", d: "Annäherung von links (x &lt; x₀).", b: `${lim("x→0⁻")} ${frac("1", "x")} = −∞` },
      { id: "ma-rechtsseitig", f: lim("x→x₀⁺") + " f(x)", n: "rechtsseitiger Grenzwert", d: "Annäherung von rechts (x &gt; x₀).", b: `${lim("x→0⁺")} ${frac("1", "x")} = +∞` },
      { id: "ma-gw-existenz", f: "Wann existiert der Grenzwert?", n: "links = rechts", d: "Nur wenn beide einseitigen Grenzwerte existieren und gleich sind (u₀ = v₀).", b: `${frac("1", "x")} bei x₀ = 0: links −∞, rechts +∞ → kein Grenzwert` },
    ],
  },
  {
    id: "asymptoten",
    cat: "5. Grenzwerte von Funktionen",
    title: "Asymptoten & Definitionslücken",
    short: "vertikal, horizontal, hebbar, Polstelle, Sprungstelle",
    cards: [
      { id: "ma-asymptote", f: "Asymptote", n: "Gerade, der sich f annähert", d: "Allgemein auch eine Kurve, an die sich der Graph immer weiter anschmiegt.", b: `${frac("1", "x")} hat die Asymptoten x = 0 und y = 0` },
      { id: "ma-vertikale-asymptote", f: "x = x₀", n: "vertikale Asymptote", d: `Einseitiger Grenzwert ist ±∞: ${lim("x→x₀⁻")} f(x) = ±∞ oder ${lim("x→x₀⁺")} f(x) = ±∞`, b: `${frac("1", "x")}: x = 0` },
      { id: "ma-horizontale-asymptote", f: "y = c", n: "horizontale Asymptote", d: `${lim("x→±∞")} f(x) = c, c ∈ ℝ. Achtung: nicht dasselbe wie eine Schranke!`, b: `${frac("1", "x")}: y = 0; eˣ: y = 0 (für x → −∞)` },
      { id: "ma-definitionsluecke", f: "Definitionslücke", n: "x₀ ∉ D, aber annäherbar", d: "Stelle, die nicht im Definitionsbereich liegt, der man sich innerhalb von D aber annähern kann.", b: `${frac("1", "x")} bei x₀ = 0` },
      { id: "ma-hebbar", f: "hebbare Definitionslücke", n: "Lücke, die man „stopfen“ kann", d: "An x₀ existiert ein eigentlicher Grenzwert.", b: `${frac("x · (x − 1)", "x − 1")} bei x₀ = 1: Grenzwert 1` },
      { id: "ma-polstelle", f: "Polstelle", n: "nicht hebbare Definitionslücke", d: "x₀ ist Stelle einer vertikalen Asymptote.", b: `${frac("1", "x")} hat bei x₀ = 0 eine Polstelle` },
      { id: "ma-sprungstelle", f: "Sprungstelle", n: "Graph springt an x₀", d: "Links- und rechtsseitiger eigentlicher Grenzwert existieren, sind aber verschieden. Keine Definitionslücke.", b: "f(x) = x² für 0 ≤ x &lt; 1, −x + 3 für x ≥ 1: bei x₀ = 1 links 1, rechts 2" },
    ],
  },
  {
    id: "grenzwertsaetze",
    cat: "5. Grenzwerte von Funktionen",
    title: "Grenzwertsätze",
    short: "Summe, Faktor, Produkt, Quotient",
    cards: [
      { id: "ma-gw-summenregel", f: "Summen-/Differenzregel", n: `${lim("x→x₀")} (f(x) ± g(x)) = a ± b`, d: `Gilt, wenn ${lim("x→x₀")} f(x) = a und ${lim("x→x₀")} g(x) = b eigentliche Grenzwerte sind.`, b: `${lim("x→2")} (x² + 3x) = 4 + 6 = 10` },
      { id: "ma-gw-faktorregel", f: "Faktorregel", n: `${lim("x→x₀")} (c · f(x)) = c · a`, d: "Konstante Faktoren c ∈ ℝ darf man vor den Limes ziehen.", b: `${lim("x→2")} 5x² = 5 · 4 = 20` },
      { id: "ma-gw-produktregel", f: "Produktregel", n: `${lim("x→x₀")} (f(x) · g(x)) = a · b`, d: "Grenzwert eines Produkts = Produkt der Grenzwerte (beide eigentlich).", b: `${lim("x→0")} (x + 1) · eˣ = 1 · 1 = 1` },
      { id: "ma-gw-quotientenregel", f: "Quotientenregel", n: `${lim("x→x₀")} ${frac("f(x)", "g(x)")} = ${frac("a", "b")}`, d: "Nur wenn b ≠ 0.", b: `4 · ${lim("x→−∞")} ${frac("eˣ + 3", "(eˣ − 7)(1/x + 2)")} = 4 · ${frac("3", "(−7) · 2")} = −${frac("6", "7")}` },
    ],
  },
];
