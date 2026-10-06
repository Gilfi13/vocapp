// Grammar topics: tenses. Explanations in German, examples in English.
// Exercise types: "c" = choice (o = options, a = index of the right one),
//                 "g" = gap (a = accepted answers). e = short explanation.
// Exercise ids are stored with the user's progress – never change or reuse them.

const BC = "https://learnenglish.britishcouncil.org/free-resources/grammar";

export default [
  {
    id: "present",
    cat: "Zeiten",
    title: "Present simple vs. present continuous",
    short: "Gewohnheit oder gerade jetzt? Plus: Zustandsverben",
    links: [
      { t: "British Council – Present simple", u: `${BC}/english-grammar-reference/present-simple` },
      { t: "British Council – Present continuous", u: `${BC}/english-grammar-reference/present-continuous` },
      { t: "British Council – Stative verbs", u: `${BC}/b1-b2/stative-verbs` },
    ],
    html: `
<p class="lead">Das Deutsche hat nur <em>ein</em> Präsens („ich arbeite“). Das Englische unterscheidet: <b>dauerhaft/regelmäßig</b> (simple) oder <b>gerade im Gange/vorübergehend</b> (continuous).</p>
<h3>Bildung</h3>
<table>
<tr><th></th><th>Present simple</th><th>Present continuous</th></tr>
<tr><td>+</td><td>She <b>works</b>.</td><td>She <b>is working</b>.</td></tr>
<tr><td>–</td><td>She <b>doesn't work</b>.</td><td>She <b>isn't working</b>.</td></tr>
<tr><td>?</td><td><b>Does</b> she <b>work</b>?</td><td><b>Is</b> she <b>working</b>?</td></tr>
</table>
<h3>Present simple</h3>
<ul>
<li>Gewohnheiten, Routinen: <i>I <b>go</b> to the gym twice a week.</i></li>
<li>Allgemeine Wahrheiten, Fakten: <i>Water <b>boils</b> at 100 °C.</i></li>
<li>Dauerhafte Situationen: <i>She <b>lives</b> in Munich.</i></li>
<li>Fahrpläne, Programme (auch Zukunft): <i>The train <b>leaves</b> at 6:45.</i></li>
<li>Zustandsverben (s. u.): <i>I <b>know</b> what you <b>mean</b>.</i></li>
</ul>
<h3>Present continuous</h3>
<ul>
<li>Gerade im Moment: <i>Be quiet – the baby <b>is sleeping</b>.</i></li>
<li>Vorübergehend, „zurzeit“: <i>She <b>is living</b> in Berlin this term.</i></li>
<li>Veränderungen und Trends: <i>My English <b>is getting</b> better.</i></li>
<li>Feste Verabredungen in der Zukunft: <i>I<b>'m meeting</b> my supervisor tomorrow.</i></li>
<li>Mit <i>always/constantly</i> für Ärger über Wiederholtes: <i>He<b>'s always losing</b> his keys!</i></li>
</ul>
<h3>Zustandsverben (stative verbs)</h3>
<p>Verben, die einen Zustand und keine Handlung ausdrücken, stehen normalerweise <b>nicht</b> in der Verlaufsform:</p>
<ul>
<li>Denken/Meinen: <i>know, believe, understand, mean, remember, think</i> (= meinen)</li>
<li>Gefühle/Wünsche: <i>like, love, hate, want, need, prefer</i></li>
<li>Sinne/Eindruck: <i>seem, appear, sound, taste, smell</i> (= Eigenschaft)</li>
<li>Besitz/Bestehen: <i>have</i> (= besitzen), <i>own, belong, contain, consist of</i></li>
</ul>
<div class="tip"><b>Doppelte Bedeutung:</b> Manche Verben haben eine Zustands- und eine Handlungsbedeutung.
<i>I <b>think</b> it's a good idea</i> (Meinung) ↔ <i>I'<b>m thinking</b> about my essay</i> (nachdenken).
<i>The soup <b>tastes</b> great</i> (Eigenschaft) ↔ <i>The chef <b>is tasting</b> the soup</i> (Handlung).
<i>We <b>have</b> a car</i> ↔ <i>We'<b>re having</b> dinner</i>.
<i>He <b>is</b> rude</i> (Charakter) ↔ <i>He'<b>s being</b> rude</i> (verhält sich gerade so).</div>
<h3>Signalwörter</h3>
<p><b>Simple:</b> always, usually, often, sometimes, never, every day, on Mondays<br>
<b>Continuous:</b> now, right now, at the moment, currently, this week/term, Look!, Listen!</p>
<div class="warn"><b>Typischer Fehler:</b> <s>I am understanding</s> → <b>I understand</b>. <s>What are you thinking about the lecture?</s> (Meinung) → <b>What do you think</b> about the lecture?</div>`,
    ex: [
      { id: "present-01", t: "g", q: "Water ___ (boil) at 100 degrees Celsius.", a: ["boils"], e: "Naturgesetz/allgemeine Wahrheit → present simple." },
      { id: "present-02", t: "g", q: "Be quiet! The baby ___ (sleep).", a: ["is sleeping", "'s sleeping"], e: "Passiert genau jetzt → present continuous." },
      { id: "present-03", t: "c", q: "I ___ what you mean.", o: ["am understanding", "understand"], a: 1, e: "understand ist ein Zustandsverb → keine Verlaufsform." },
      { id: "present-04", t: "c", q: "She ___ in Berlin this term, but she normally lives in Munich.", o: ["lives", "is living"], a: 1, e: "Vorübergehende Situation („this term“) → present continuous." },
      { id: "present-05", t: "c", q: "What ___ about the new lecturer? (= Meinung)", o: ["are you thinking", "do you think"], a: 1, e: "think = meinen ist ein Zustandsverb → present simple." },
      { id: "present-06", t: "c", q: "Sorry, I can't talk now – I ___ about my essay.", o: ["think", "am thinking"], a: 1, e: "think = nachdenken (Tätigkeit, gerade jetzt) → Verlaufsform möglich." },
      { id: "present-07", t: "c", q: "We ___ dinner right now – can I call you back?", o: ["have", "are having"], a: 1, e: "have = essen ist eine Handlung → Verlaufsform." },
      { id: "present-08", t: "g", q: "The train to Hamburg ___ (leave) at 6:45 tomorrow morning.", a: ["leaves"], e: "Fahrplan → present simple, auch mit Zukunftsbezug." },
      { id: "present-09", t: "c", q: "My English ___ better and better.", o: ["gets", "is getting"], a: 1, e: "Veränderung/Entwicklung → present continuous." },
      { id: "present-10", t: "c", q: "It drives me crazy! He ___ his keys.", o: ["is always losing", "always is losing", "loses always"], a: 0, e: "Ärger über Wiederholtes: be + always + -ing. Das Adverb steht nach is." },
      { id: "present-11", t: "c", q: "This soup ___ delicious.", o: ["tastes", "is tasting"], a: 0, e: "taste = Eigenschaft (schmeckt) → Zustandsverb, present simple." },
      { id: "present-12", t: "c", q: "Look! The chef ___ the soup to check the salt.", o: ["tastes", "is tasting"], a: 1, e: "taste = probieren (Handlung, gerade jetzt) → Verlaufsform." },
      { id: "present-13", t: "c", q: "You ___ very rude today – that's not like you.", o: ["are", "are being"], a: 1, e: "be + -ing = sich (vorübergehend) so verhalten. „You are rude“ wäre eine Charaktereigenschaft." },
      { id: "present-14", t: "c", q: "How often ___ to the library?", o: ["are you going", "do you go"], a: 1, e: "How often = Gewohnheit → present simple." },
    ],
  },

  {
    id: "past",
    cat: "Zeiten",
    title: "Past simple, past continuous, used to & would",
    short: "Abgeschlossene Handlung oder im Verlauf? Vergangene Gewohnheiten",
    links: [
      { t: "British Council – Past continuous and past simple", u: `${BC}/a1-a2/past-continuous-past-simple` },
      { t: "British Council – Past habits: used to, would", u: `${BC}/b1-b2-grammar/past-habits-used-to-would-past-simple` },
    ],
    html: `
<p class="lead">Das <b>past simple</b> erzählt abgeschlossene Ereignisse, das <b>past continuous</b> beschreibt, was gerade im Gange war – oft als Hintergrund.</p>
<h3>Bildung</h3>
<table>
<tr><th></th><th>Past simple</th><th>Past continuous</th></tr>
<tr><td>+</td><td>I <b>worked</b> / I <b>went</b></td><td>I <b>was working</b> / they <b>were working</b></td></tr>
<tr><td>–</td><td>I <b>didn't work</b></td><td>I <b>wasn't working</b></td></tr>
<tr><td>?</td><td><b>Did</b> you <b>work</b>?</td><td><b>Were</b> you <b>working</b>?</td></tr>
</table>
<h3>Verwendung</h3>
<ul>
<li>Past simple: abgeschlossene Handlung zu einem vergangenen Zeitpunkt, auch Abfolgen: <i>She <b>got up</b>, <b>closed</b> the window and <b>went</b> back to bed.</i></li>
<li>Past continuous: Handlung war zu einem Zeitpunkt im Gange: <i>At 8 pm I <b>was watching</b> TV.</i></li>
<li>Kombination: Hintergrund (continuous) wird unterbrochen (simple): <i>I <b>was reading</b> when the lights <b>went</b> out.</i></li>
<li>Zwei parallele Handlungen: <i>While I <b>was cooking</b>, he <b>was studying</b>.</i></li>
</ul>
<div class="tip"><b>when vs. while:</b> <i>while</i> steht meist mit der Verlaufsform (Dauer), <i>when</i> oft mit dem kurzen, unterbrechenden Ereignis.</div>
<h3>Vergangene Gewohnheiten: used to & would</h3>
<ul>
<li><b>used to + Infinitiv</b>: früher regelmäßig/früher so, heute nicht mehr – für Handlungen <em>und</em> Zustände: <i>I <b>used to live</b> in Hamburg. I <b>used to have</b> a dog.</i></li>
<li><b>would + Infinitiv</b>: nur für wiederholte <em>Handlungen</em>, typisch beim Erzählen: <i>Every summer we <b>would spend</b> weeks at the lake.</i> Nicht für Zustände: <s>I would have a dog.</s></li>
<li>Frage/Verneinung: <i><b>Did</b> you <b>use to</b> play…? I <b>didn't use to</b> like coffee.</i> (nach did: <b>use</b>, ohne d)</li>
</ul>
<div class="warn"><b>Nicht verwechseln:</b> <i>used to do</i> (früher getan) ↔ <i>be/get used to <b>doing</b></i> (an etwas gewöhnt sein/sich gewöhnen): <i>I'm not used to <b>getting</b> up so early.</i></div>`,
    ex: [
      { id: "past-01", t: "g", q: "I ___ (read) when the lights went out.", a: ["was reading"], e: "Handlung im Gange, die unterbrochen wird → past continuous." },
      { id: "past-02", t: "g", q: "When she heard the news, she ___ (call) her mother immediately.", a: ["called"], e: "Kurze, abgeschlossene Handlung, Reaktion → past simple." },
      { id: "past-03", t: "c", q: "While I ___ dinner, the phone rang.", o: ["cooked", "was cooking"], a: 1, e: "while + Hintergrundhandlung → past continuous." },
      { id: "past-04", t: "c", q: "At 8 o'clock last night I ___ TV when the phone rang.", o: ["watched", "was watching"], a: 1, e: "Zu einem bestimmten Zeitpunkt im Gange und unterbrochen → past continuous." },
      { id: "past-05", t: "c", q: "She got up, ___ the window and went back to bed.", o: ["closed", "was closing"], a: 0, e: "Abfolge abgeschlossener Handlungen → past simple." },
      { id: "past-06", t: "c", q: "We ___ across the park when it started to rain.", o: ["walked", "were walking"], a: 1, e: "Hintergrundhandlung, unterbrochen vom Regen → past continuous." },
      { id: "past-07", t: "g", q: "What were you ___ (do) at midnight yesterday?", a: ["doing"], e: "were you + -ing = past continuous (im Gange zu einem Zeitpunkt)." },
      { id: "past-08", t: "c", q: "I ___ live in Hamburg, but now I live in Leipzig.", o: ["used to", "would", "was used to"], a: 0, e: "Früherer Zustand → used to. would geht bei Zuständen nicht." },
      { id: "past-09", t: "c", q: "When we were kids, we ___ spend every summer at the lake.", o: ["would", "are used to", "use to"], a: 0, e: "Wiederholte Handlung in der Vergangenheit → would (oder used to)." },
      { id: "past-10", t: "c", q: "I ___ have a dog when I was a child.", o: ["would", "used to"], a: 1, e: "have = besitzen ist ein Zustand → nur used to, nicht would." },
      { id: "past-11", t: "g", q: "Did you ___ to play an instrument as a child? (use)", a: ["use"], e: "Nach did steht der Infinitiv: did you use to (ohne -d)." },
      { id: "past-12", t: "c", q: "I'm not used to ___ up so early.", o: ["get", "getting", "got"], a: 1, e: "be used to + -ing = an etwas gewöhnt sein." },
    ],
  },

  {
    id: "perfect",
    cat: "Zeiten",
    title: "Present perfect vs. past simple",
    short: "Die wichtigste Falle für Deutschsprachige",
    links: [
      { t: "Oxford – Present perfect simple and past simple", u: "https://www.oxfordlearnersdictionaries.com/grammar/online-grammar/present-perfect-simple-and-past-simple" },
      { t: "Oxford – just, already and yet", u: "https://www.oxfordlearnersdictionaries.com/grammar/online-grammar/present-perfect-simple-with-just-already-and-yet" },
      { t: "Oxford – been and gone", u: "https://www.oxfordlearnersdictionaries.com/us/grammar/online-grammar/present-perfect-simple-been-and-gone" },
    ],
    html: `
<p class="lead">Das deutsche Perfekt („Ich habe ihn gestern getroffen“) ist meist <b>past simple</b> im Englischen. Das <b>present perfect</b> verbindet Vergangenheit und <b>Gegenwart</b>.</p>
<h3>Bildung</h3>
<p><b>have/has + past participle</b>: <i>I <b>have finished</b>. She <b>hasn't called</b>. <b>Have</b> you <b>seen</b> it?</i></p>
<h3>Present perfect – wenn …</h3>
<ul>
<li>… das Ergebnis jetzt wichtig ist: <i>She <b>has lost</b> her phone</i> (→ sie hat es jetzt nicht).</li>
<li>… es um Erfahrungen im Leben geht (wann ist egal): <i><b>Have</b> you ever <b>eaten</b> sushi?</i></li>
<li>… der Zeitraum noch nicht vorbei ist: <i>I<b>'ve written</b> three essays <b>this semester</b>.</i></li>
<li>… etwas bis jetzt andauert (mit since/for): <i>I<b>'ve known</b> her for years.</i></li>
<li>Nach <i>It's the first time …</i>: <i>This is the first time I<b>'ve given</b> a lecture in English.</i></li>
</ul>
<h3>Past simple – wenn …</h3>
<ul>
<li>… ein abgeschlossener Zeitpunkt genannt oder gemeint ist: <i>yesterday, last week, in 2019, two days ago, when I was a child</i>.</li>
<li>… nach dem Zeitpunkt gefragt wird: <i><b>When did</b> you <b>move</b> to Berlin?</i> (nie <s>When have you moved</s>)</li>
<li>… die Person/Sache nicht mehr existiert: <i>Shakespeare <b>wrote</b> many plays.</i></li>
</ul>
<h3>Signalwörter</h3>
<p><b>Present perfect:</b> ever, never, just, already, yet, so far, up to now, recently, since, for, this week/year<br>
<b>Past simple:</b> yesterday, ago, last …, in 2019, when …, then</p>
<div class="tip"><b>been vs. gone:</b> <i>He <b>has gone</b> to the library</i> (ist dort/unterwegs) ↔ <i>I <b>have been</b> to Rome twice</i> (war dort und bin zurück).</div>
<div class="tip"><b>Unterschied BE/AE:</b> Im amerikanischen Englisch ist bei just/already/yet auch das past simple üblich (<i>Did you eat yet?</i>). In Klausuren gilt meist britisches Englisch.</div>
<div class="warn"><b>Typische Fehler:</b> <s>I have met him yesterday.</s> → <b>I met him yesterday.</b> · <s>I live here since 2019.</s> → <b>I have lived here since 2019.</b></div>`,
    ex: [
      { id: "perfect-01", t: "c", q: "I ___ that film last week.", o: ["have seen", "saw"], a: 1, e: "last week = abgeschlossener Zeitpunkt → past simple." },
      { id: "perfect-02", t: "c", q: "___ you ever ___ sushi?", o: ["Have … eaten", "Did … eat"], a: 0, e: "Lebenserfahrung mit ever → present perfect." },
      { id: "perfect-03", t: "g", q: "She ___ (lose) her phone, so she can't call you.", a: ["has lost", "'s lost"], e: "Ergebnis in der Gegenwart wichtig → present perfect." },
      { id: "perfect-04", t: "c", q: "Shakespeare ___ many plays.", o: ["has written", "wrote"], a: 1, e: "Abgeschlossene Lebenszeit (er lebt nicht mehr) → past simple." },
      { id: "perfect-05", t: "c", q: "I ___ three essays this semester so far.", o: ["wrote", "have written"], a: 1, e: "Zeitraum noch nicht vorbei (this semester, so far) → present perfect." },
      { id: "perfect-06", t: "c", q: "When ___ to Berlin?", o: ["did you move", "have you moved"], a: 0, e: "Frage nach dem Zeitpunkt (When) → past simple." },
      { id: "perfect-07", t: "g", q: "I ___ (not / finish) my thesis yet.", a: ["haven't finished", "have not finished"], e: "yet in Verneinung → present perfect." },
      { id: "perfect-08", t: "c", q: "Tom isn't here – he ___ to the library.", o: ["has been", "has gone"], a: 1, e: "gone = ist hingegangen und noch nicht zurück." },
      { id: "perfect-09", t: "c", q: "We ___ to Rome twice – it's a wonderful city.", o: ["have been", "have gone"], a: 0, e: "been = war dort und ist zurück (Erfahrung)." },
      { id: "perfect-10", t: "c", q: "I ___ him two days ago.", o: ["have met", "met"], a: 1, e: "ago verlangt immer past simple." },
      { id: "perfect-11", t: "c", q: "This is the first time I ___ a lecture in English.", o: ["give", "am giving", "have given"], a: 2, e: "Nach „It's the first time …“ steht das present perfect." },
      { id: "perfect-12", t: "c", q: "Gestern habe ich ihn getroffen. →", o: ["I have met him yesterday.", "I met him yesterday."], a: 1, e: "Deutsches Perfekt mit Zeitangabe (gestern) = englisches past simple." },
      { id: "perfect-13", t: "g", q: "A: Is Lisa there? B: No, she ___ (just / leave).", a: ["has just left", "'s just left"], e: "just + Ergebnis jetzt relevant → present perfect; just steht zwischen has und Partizip." },
    ],
  },

  {
    id: "perfect-cont",
    cat: "Zeiten",
    title: "Present perfect simple vs. continuous, since & for",
    short: "Ergebnis oder Dauer? Und die „seit“-Falle",
    links: [
      { t: "Oxford – Present perfect simple and continuous", u: "https://www.oxfordlearnersdictionaries.com/us/grammar/online-grammar/present-perfect-simple-and-present-perfect-continuous" },
      { t: "British Council – Present perfect", u: `${BC}/english-grammar-reference/present-perfect` },
    ],
    html: `
<p class="lead">Beide verbinden Vergangenheit und Gegenwart. Das <b>simple</b> betont das <b>Ergebnis</b> (wie viel, wie oft, fertig), das <b>continuous</b> die <b>Tätigkeit/Dauer</b>.</p>
<h3>Bildung</h3>
<p>Simple: <b>have/has + past participle</b> – <i>I've read four chapters.</i><br>
Continuous: <b>have/has been + -ing</b> – <i>I've been reading all afternoon.</i></p>
<h3>Simple oder continuous?</h3>
<ul>
<li>Ergebnis, Anzahl, abgeschlossen: <i>I<b>'ve read</b> four chapters today.</i></li>
<li>Dauer, Tätigkeit (evtl. noch nicht fertig): <i>I<b>'ve been reading</b> this book all afternoon.</i></li>
<li>Sichtbare Spuren einer Tätigkeit: <i>You look tired – <b>have</b> you <b>been running</b>?</i></li>
<li>Zustandsverben nur im simple: <i>I<b>'ve known</b> him for ages</i> (nicht <s>have been knowing</s>).</li>
<li>Bei manchen Verben (live, work, study, teach) ist der Unterschied gering: <i>I've lived / I've been living here for five years.</i></li>
</ul>
<h3>since vs. for</h3>
<table>
<tr><th>since + Zeitpunkt</th><th>for + Zeitraum</th></tr>
<tr><td>since 2020, since January, since Monday, since I was a child</td><td>for three years, for ages, for two hours, for a long time</td></tr>
</table>
<div class="warn"><b>Die „seit“-Falle:</b> Deutsches Präsens + seit = englisches <b>present perfect</b>!<br>
<i>Ich lerne seit drei Jahren Spanisch.</i> → <s>I learn Spanish since three years.</s> → <b>I have been learning Spanish for three years.</b><br>
<i>Wie lange wartest du schon?</i> → <b>How long have you been waiting?</b></div>`,
    ex: [
      { id: "pcont-01", t: "c", q: "I ___ here since 2020.", o: ["live", "am living", "have lived"], a: 2, e: "since + bis heute → present perfect (seit-Falle)." },
      { id: "pcont-02", t: "c", q: "She has worked here ___ three years.", o: ["since", "for"], a: 1, e: "for + Zeitraum (three years)." },
      { id: "pcont-03", t: "c", q: "She has worked here ___ January.", o: ["since", "for"], a: 0, e: "since + Zeitpunkt (January)." },
      { id: "pcont-04", t: "c", q: "You look exhausted. ___?", o: ["Have you been running", "Have you run"], a: 0, e: "Sichtbare Folgen einer Tätigkeit → present perfect continuous." },
      { id: "pcont-05", t: "c", q: "I ___ four chapters today.", o: ["have read", "have been reading"], a: 0, e: "Anzahl/Ergebnis → present perfect simple." },
      { id: "pcont-06", t: "c", q: "I ___ this book all afternoon, but I haven't finished it yet.", o: ["have read", "have been reading"], a: 1, e: "Dauer der Tätigkeit, nicht abgeschlossen → continuous." },
      { id: "pcont-07", t: "c", q: "How long ___?", o: ["are you waiting", "have you been waiting", "do you wait"], a: 1, e: "How long + bis jetzt → present perfect continuous." },
      { id: "pcont-08", t: "c", q: "I ___ him for ages.", o: ["have been knowing", "have known", "know"], a: 1, e: "know ist ein Zustandsverb → nur simple; for ages → present perfect." },
      { id: "pcont-09", t: "c", q: "Ich lerne seit drei Jahren Spanisch. → I ___ Spanish for three years.", o: ["learn", "am learning", "have been learning"], a: 2, e: "seit + andauernd → present perfect (continuous)." },
      { id: "pcont-10", t: "g", q: "I ___ (live) in Leipzig for five years.", a: ["have lived", "'ve lived", "have been living", "'ve been living"], e: "for + bis jetzt → present perfect; bei live sind simple und continuous möglich." },
      { id: "pcont-11", t: "c", q: "It's the first time we ___ each other since school.", o: ["see", "saw", "have seen"], a: 2, e: "It's the first time … → present perfect." },
      { id: "pcont-12", t: "c", q: "Sorry about the mess – we ___ the kitchen all morning.", o: ["have been painting", "have painted"], a: 0, e: "Dauer (all morning) und sichtbare Spuren der Tätigkeit → continuous." },
    ],
  },

  {
    id: "past-perfect",
    cat: "Zeiten",
    title: "Past perfect (simple & continuous)",
    short: "Vorvergangenheit: was vorher schon passiert war",
    links: [
      { t: "British Council – Past perfect", u: `${BC}/b1-b2/past-perfect` },
      { t: "British Council – Talking about the past", u: `${BC}/english-grammar-reference/talking-about-past` },
    ],
    html: `
<p class="lead">Das past perfect blickt von einem Punkt in der Vergangenheit <b>noch weiter zurück</b> – wie das deutsche Plusquamperfekt („hatte gemacht“).</p>
<h3>Bildung</h3>
<p>Simple: <b>had + past participle</b> – <i>The film <b>had</b> already <b>started</b>.</i><br>
Continuous: <b>had been + -ing</b> – <i>She <b>had been working</b> all day.</i></p>
<h3>Verwendung</h3>
<ul>
<li>Früheres Ereignis vor einem anderen vergangenen Ereignis: <i>When we arrived, the film <b>had</b> already <b>started</b>.</i></li>
<li>Bedeutungsunterschied: <i>When I got to the station, the train <b>left</b></i> (fuhr gerade ab, als ich ankam) ↔ <i>the train <b>had left</b></i> (war schon weg).</li>
<li>Erfahrung bis zu einem Punkt in der Vergangenheit: <i>I <b>had never seen</b> a kangaroo before I went to Australia.</i></li>
<li>Continuous: Dauer bis zu einem Punkt, oft mit sichtbaren Folgen: <i>She was exhausted because she <b>had been working</b> all day.</i></li>
<li>In der indirekten Rede und nach <i>wish/if</i> (siehe dort).</li>
</ul>
<div class="tip">Wenn die Reihenfolge schon durch <i>after/before</i> klar ist, ist das past perfect oft optional: <i>After he (had) passed his exams, he went on holiday.</i> Mit <i>by the time</i> ist es dagegen nötig.</div>
<h3>Signalwörter</h3>
<p>already, just, never … before, by the time, by then, after, before, until</p>`,
    ex: [
      { id: "pperf-01", t: "g", q: "When we arrived, the film ___ (already / start).", a: ["had already started", "'d already started"], e: "Vor einem anderen vergangenen Ereignis abgeschlossen → past perfect." },
      { id: "pperf-02", t: "c", q: "She was exhausted because she ___ all day.", o: ["had been working", "has been working", "is working"], a: 0, e: "Dauer bis zu einem Punkt in der Vergangenheit → past perfect continuous." },
      { id: "pperf-03", t: "c", q: "I ___ never ___ a kangaroo before I went to Australia.", o: ["had … seen", "have … seen"], a: 0, e: "Erfahrung bis zu einem vergangenen Zeitpunkt → past perfect." },
      { id: "pperf-04", t: "c", q: "By the time the police arrived, the thief ___.", o: ["escaped", "had escaped", "has escaped"], a: 1, e: "by the time + Vergangenheit → past perfect für das frühere Ereignis." },
      { id: "pperf-05", t: "g", q: "I didn't recognise him because he ___ (grow) a beard.", a: ["had grown", "'d grown"], e: "Der Bart wuchs vor dem Treffen → past perfect." },
      { id: "pperf-06", t: "c", q: "When I got to the station, the train ___. I had to wait an hour for the next one.", o: ["had already left", "has already left", "is already leaving"], a: 0, e: "Der Zug war schon weg, bevor ich ankam → past perfect (had left). Ohne already hieße „the train left“: Er fuhr genau in dem Moment ab." },
      { id: "pperf-07", t: "c", q: "We ___ for two hours when the bus finally came.", o: ["had been waiting", "have been waiting", "are waiting"], a: 0, e: "Dauer bis zu einem vergangenen Zeitpunkt → past perfect continuous." },
      { id: "pperf-08", t: "c", q: "It was the best meal I ___ ever ___.", o: ["had … eaten", "have … eaten"], a: 0, e: "Superlativ in einer Erzählung in der Vergangenheit → past perfect." },
      { id: "pperf-09", t: "c", q: "How long ___ married when they had their first child?", o: ["had they been", "have they been", "were they being"], a: 0, e: "Dauer bis zu einem Punkt in der Vergangenheit → past perfect." },
      { id: "pperf-10", t: "g", q: "She was nervous because she ___ (never / fly) before.", a: ["had never flown", "'d never flown"], e: "never … before bis zu einem vergangenen Punkt → past perfect; fly – flew – flown." },
    ],
  },

  {
    id: "future",
    cat: "Zeiten",
    title: "Zukunft: will, going to, present continuous & Co.",
    short: "Wann will und wann going to?",
    links: [
      { t: "British Council – Future forms: will, be going to, present continuous", u: `${BC}/b1-b2/future-forms-will-be-going-present-continuous` },
      { t: "British Council – Talking about the future", u: `${BC}/english-grammar-reference/talking-about-future` },
      { t: "British Council – The future: degrees of certainty", u: `${BC}/b1-b2/future-degrees-certainty` },
    ],
    html: `
<p class="lead">Das Englische hat kein einzelnes „Futur“. Welche Form passt, hängt davon ab, <b>wann</b> die Entscheidung fiel und <b>worauf</b> sich eine Vorhersage stützt.</p>
<h3>will</h3>
<ul>
<li><b>Spontane Entscheidung</b> im Moment des Sprechens: <i>The phone's ringing. – I<b>'ll get</b> it!</i></li>
<li>Vorhersage aufgrund von <b>Meinung/Wissen</b> (oft mit <i>I think, probably, I'm sure</i>): <i>I think Germany <b>will win</b>.</i></li>
<li>Versprechen, Angebote, Drohungen, Bitten: <i>I <b>won't tell</b> anyone. <b>Will</b> you help me?</i></li>
<li>Zukünftige Fakten: <i>The sun <b>will rise</b> at 6:12.</i></li>
</ul>
<h3>be going to</h3>
<ul>
<li><b>Absicht/Plan</b>, schon <em>vorher</em> beschlossen: <i>I've decided – I<b>'m going to apply</b> for a semester abroad.</i></li>
<li>Vorhersage aufgrund von <b>Anzeichen in der Gegenwart</b>: <i>Look at those clouds! It<b>'s going to rain</b>.</i></li>
</ul>
<div class="tip"><b>Merksatz:</b> Entscheidung <em>jetzt</em> → will. Entscheidung <em>vorher</em> → going to.<br>
<i>A: We've run out of milk. B: Oh, I<b>'ll buy</b> some.</i> (gerade entschieden)<br>
<i>A: Why the trainers? B: I<b>'m going to go</b> for a run.</i> (schon geplant)</div>
<h3>Present continuous und present simple</h3>
<ul>
<li>Present continuous: <b>feste Verabredung</b> (mit anderen, Zeit/Ort stehen): <i>I<b>'m meeting</b> my supervisor at 10 tomorrow.</i></li>
<li>Present simple: <b>Fahrpläne, Stundenpläne, Programme</b>: <i>The lecture <b>starts</b> at 9:15.</i></li>
<li>Present simple in <b>Zeit- und if-Sätzen</b> (when, after, before, as soon as, until, if): <i>I'll call you when I <b>get</b> home.</i> (nicht <s>when I will get</s>)</li>
</ul>
<h3>Weitere Formen</h3>
<ul>
<li><b>shall</b> (BE) für Angebote und Vorschläge in Fragen: <i><b>Shall</b> I open the window? <b>Shall</b> we go?</i></li>
<li><b>be about to</b>: gleich, unmittelbar bevorstehend: <i>The lecture is <b>about to</b> start.</i></li>
<li>Unsicherheit: <i>might / may / could</i>: <i>I <b>might</b> come later.</i></li>
</ul>
<div class="warn"><b>Typische Fehler:</b> <s>I will call you when I will be home.</s> → <b>when I am home</b>. · <i>will</i> heißt nicht „wollen“: <i>Ich will gehen</i> = <b>I want to go</b>.</div>`,
    ex: [
      { id: "future-01", t: "c", q: "Most natural: Look at those clouds! It ___ rain.", o: ["will", "is going to"], a: 1, e: "Vorhersage aufgrund sichtbarer Anzeichen → going to." },
      { id: "future-02", t: "g", q: "A: The phone's ringing. B: I ___ (get) it!", a: ["'ll get", "will get"], e: "Spontane Entscheidung im Moment des Sprechens → will." },
      { id: "future-03", t: "c", q: "I've thought about it a lot and I've decided: I ___ apply for a semester abroad.", o: ["will", "am going to"], a: 1, e: "Vorher gefasster Entschluss/Absicht → going to." },
      { id: "future-04", t: "c", q: "Most natural: I ___ my supervisor at 10 tomorrow – it's in her calendar.", o: ["will meet", "am meeting"], a: 1, e: "Feste Verabredung mit Zeit → present continuous." },
      { id: "future-05", t: "c", q: "Most natural: According to the timetable, the bus ___ at 7:10.", o: ["leaves", "is going to leave", "will be leaving"], a: 0, e: "Fahrplan → present simple ist am natürlichsten." },
      { id: "future-06", t: "c", q: "I'll call you when I ___ home.", o: ["get", "will get"], a: 0, e: "In Zeitsätzen (when, after, as soon as …) steht present simple statt will." },
      { id: "future-07", t: "c", q: "If it ___ tomorrow, we'll stay inside.", o: ["rains", "will rain"], a: 0, e: "if-Satz (1. Kondizional) → present simple." },
      { id: "future-08", t: "c", q: "I think Germany ___ the match tomorrow.", o: ["will win", "wins", "is winning"], a: 0, e: "Vorhersage aufgrund einer Meinung (I think) → will." },
      { id: "future-09", t: "c", q: "It's hot in here. ___ I open the window?", o: ["Shall", "Will"], a: 0, e: "Angebot in Frageform → Shall I …?" },
      { id: "future-10", t: "c", q: "Don't worry, I ___ tell anyone. I promise.", o: ["won't", "don't", "am not telling"], a: 0, e: "Versprechen → will/won't." },
      { id: "future-11", t: "c", q: "Quick, sit down – the lecture is ___ start.", o: ["about to", "going", "will"], a: 0, e: "Unmittelbar bevorstehend → be about to + Infinitiv." },
      { id: "future-12", t: "c", q: "A: We've run out of milk. B: Oh, really? I ___ some on my way home.", o: ["'ll buy", "'m buying"], a: 0, e: "B entscheidet sich gerade erst → will." },
      { id: "future-13", t: "c", q: "A: Why are you wearing your trainers? B: I ___ for a run.", o: ["'ll go", "'m going to go"], a: 1, e: "Der Plan stand schon vorher (Schuhe sind schon an) → going to." },
      { id: "future-14", t: "c", q: "Ich will morgen früh losfahren. → I ___ leave early tomorrow.", o: ["will", "want to"], a: 1, e: "deutsch „wollen“ = want to, nicht will." },
    ],
  },

  {
    id: "future-adv",
    cat: "Zeiten",
    title: "Future continuous, future perfect & was going to",
    short: "Was wird gerade laufen, was wird erledigt sein?",
    links: [
      { t: "British Council – Future continuous and future perfect", u: `${BC}/b1-b2/future-continuous-future-perfect` },
    ],
    html: `
<p class="lead">Für Zeitpunkte in der Zukunft: Was ist dann <b>gerade im Gange</b> (future continuous) und was ist bis dahin <b>abgeschlossen</b> (future perfect)?</p>
<h3>Future continuous: will be + -ing</h3>
<ul>
<li>Handlung, die zu einem Zeitpunkt in der Zukunft im Gange ist: <i>This time tomorrow I<b>'ll be flying</b> to New York.</i></li>
<li>Höfliche Frage nach Plänen (ohne Druck): <i><b>Will</b> you <b>be using</b> the car tonight?</i></li>
</ul>
<h3>Future perfect: will have + past participle</h3>
<ul>
<li>Bis zu einem Zeitpunkt in der Zukunft abgeschlossen, oft mit <b>by</b> / <b>by the time</b>: <i>By the end of June I<b>'ll have finished</b> my thesis.</i></li>
<li>Continuous: Dauer bis zu einem Zeitpunkt in der Zukunft: <i>In two weeks I<b>'ll have been working</b> here for a year.</i></li>
</ul>
<h3>Zukunft in der Vergangenheit</h3>
<ul>
<li><b>was/were going to</b>: Plan, der nicht umgesetzt wurde: <i>I <b>was going to</b> call you, but I forgot.</i></li>
<li><b>would</b>: Zukunft aus Sicht der Vergangenheit: <i>She knew she <b>would</b> pass.</i></li>
</ul>
<div class="tip"><b>by</b> = spätestens bis; <b>until</b> = die ganze Zeit bis. <i>I'll have finished <b>by</b> Friday.</i> ↔ <i>I'll be here <b>until</b> Friday.</i></div>`,
    ex: [
      { id: "futadv-01", t: "g", q: "This time tomorrow I ___ (fly) to New York.", a: ["will be flying", "'ll be flying"], e: "Zu einem Zeitpunkt in der Zukunft im Gange → future continuous." },
      { id: "futadv-02", t: "g", q: "By the end of June I ___ (finish) my thesis.", a: ["will have finished", "'ll have finished"], e: "by + Zeitpunkt, dann abgeschlossen → future perfect." },
      { id: "futadv-03", t: "c", q: "Don't call at 8 – we ___ dinner then.", o: ["will have had", "will be having", "had"], a: 1, e: "Um 8 im Gange → future continuous." },
      { id: "futadv-04", t: "c", q: "By 2030 they ___ the new library.", o: ["will build", "will have built", "will be building"], a: 1, e: "Bis 2030 fertig → future perfect." },
      { id: "futadv-05", t: "c", q: "In two weeks' time I ___ here for a year.", o: ["will work", "will have been working", "am working"], a: 1, e: "Dauer bis zu einem Zeitpunkt in der Zukunft → future perfect continuous." },
      { id: "futadv-06", t: "c", q: "I ___ call you, but I forgot.", o: ["will", "was going to", "am going to"], a: 1, e: "Nicht umgesetzter Plan → was going to." },
      { id: "futadv-07", t: "c", q: "By the time you arrive, the meeting ___.", o: ["will have ended", "will end", "ends"], a: 0, e: "by the time + vorher abgeschlossen → future perfect." },
      { id: "futadv-08", t: "g", q: "Next year my parents ___ (be) married for 30 years.", a: ["will have been", "'ll have been"], e: "Dauer bis zu einem Zeitpunkt in der Zukunft → will have been." },
      { id: "futadv-09", t: "c", q: "Polite question: ___ the car tonight? If not, could I borrow it?", o: ["Will you be using", "Did you use", "Have you used"], a: 0, e: "Höfliche Frage nach Plänen → future continuous." },
      { id: "futadv-10", t: "c", q: "Please send the report ___ Friday at the latest.", o: ["by", "until"], a: 0, e: "by = spätestens bis; until = durchgehend bis." },
    ],
  },
];
