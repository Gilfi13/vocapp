// Grammar topics: sentence structures. Same format as tenses.js.

const BC = "https://learnenglish.britishcouncil.org/free-resources/grammar";

export default [
  {
    id: "conditionals",
    cat: "Satzbau",
    title: "Conditionals (if-Sätze): 0, 1, 2, 3 & mixed",
    short: "Real, möglich, unwahrscheinlich, verpasst",
    links: [
      { t: "British Council – Conditionals: zero, first and second", u: `${BC}/b1-b2/conditionals-zero-first-second` },
      { t: "British Council – Conditionals: third and mixed", u: `${BC}/b1-b2/conditionals-third-mixed` },
      { t: "British Council – Inversion and conditionals (C1)", u: `${BC}/c1/inversion-conditionals` },
    ],
    html: `
<p class="lead">Die Grundregel: Im <b>if-Teil steht nie will oder would</b> – das „würde“ gehört in den Hauptsatz.</p>
<table>
<tr><th>Typ</th><th>if-Satz</th><th>Hauptsatz</th><th>Bedeutung</th></tr>
<tr><td>0</td><td>present simple</td><td>present simple</td><td>immer wahr, Gesetzmäßigkeit</td></tr>
<tr><td>1</td><td>present simple</td><td>will + Infinitiv</td><td>reale Möglichkeit (Zukunft)</td></tr>
<tr><td>2</td><td>past simple</td><td>would + Infinitiv</td><td>unwahrscheinlich/irreal (Gegenwart/Zukunft)</td></tr>
<tr><td>3</td><td>past perfect</td><td>would have + Partizip</td><td>irreal in der Vergangenheit</td></tr>
</table>
<ul>
<li>0: <i>If you <b>heat</b> ice, it <b>melts</b>.</i></li>
<li>1: <i>If it <b>rains</b> tomorrow, we<b>'ll cancel</b> the trip.</i></li>
<li>2: <i>If I <b>had</b> more time, I <b>would learn</b> Japanese.</i> · <i>If I <b>were</b> you, I'd talk to the professor.</i></li>
<li>3: <i>If she <b>had studied</b> harder, she <b>would have passed</b>.</i></li>
</ul>
<h3>Mixed conditionals</h3>
<ul>
<li>Vergangene Bedingung → Folge jetzt: <i>If I <b>hadn't missed</b> the train, I <b>would be</b> here now.</i></li>
<li>Dauerhafte Eigenschaft → Folge in der Vergangenheit: <i>If he <b>were</b> more organised, he <b>wouldn't have missed</b> the deadline.</i></li>
</ul>
<h3>Varianten</h3>
<ul>
<li><b>unless</b> = if … not: <i>You won't pass <b>unless</b> you study.</i></li>
<li>Statt <i>would</i> auch <i>could/might</i> im Hauptsatz: <i>If I had time, I <b>might</b> come.</i></li>
<li>Formell mit Inversion (ohne if): <i><b>Should</b> you need help, call me.</i> · <i><b>Had</b> I known, I would have come.</i> · <i><b>Were</b> I you, …</i></li>
<li><i>If I were</i> ist Standard; <i>If I was</i> ist umgangssprachlich verbreitet.</li>
</ul>
<div class="warn"><b>Typischer Fehler (vom deutschen „würde“):</b> <s>If you would have told me, I would have helped.</s> → <b>If you had told me, I would have helped.</b></div>`,
    ex: [
      { id: "cond-01", t: "g", q: "If you heat ice, it ___ (melt).", a: ["melts"], e: "Zero conditional: Gesetzmäßigkeit → present simple in beiden Teilen." },
      { id: "cond-02", t: "g", q: "If it rains tomorrow, we ___ (cancel) the trip.", a: ["will cancel", "'ll cancel"], e: "First conditional: if + present, Hauptsatz will." },
      { id: "cond-03", t: "g", q: "If I ___ (have) more time, I would learn Japanese.", a: ["had"], e: "Second conditional: if + past simple." },
      { id: "cond-04", t: "g", q: "If she had studied harder, she ___ (pass) the exam.", a: ["would have passed", "'d have passed"], e: "Third conditional: would have + Partizip." },
      { id: "cond-05", t: "c", q: "If I ___ you, I would talk to the professor.", o: ["were", "would be", "am"], a: 0, e: "If I were you – Standardform im second conditional." },
      { id: "cond-06", t: "c", q: "If I hadn't missed the train, I ___ here now.", o: ["would be", "would have been", "will be"], a: 0, e: "Mixed: vergangene Bedingung, Folge jetzt (now) → would + Infinitiv." },
      { id: "cond-07", t: "c", q: "If he were more organised, he ___ the deadline last week.", o: ["wouldn't miss", "wouldn't have missed", "didn't miss"], a: 1, e: "Mixed: allgemeine Eigenschaft, Folge in der Vergangenheit → would have + Partizip." },
      { id: "cond-08", t: "c", q: "___ you need any help, just call me.", o: ["Should", "Would", "Will"], a: 0, e: "Inversion mit should = if you (should) need." },
      { id: "cond-09", t: "c", q: "___ I known, I would have come earlier.", o: ["Had", "If", "Would"], a: 0, e: "Inversion: Had I known = If I had known." },
      { id: "cond-10", t: "c", q: "You won't pass ___ you study more.", o: ["if", "unless", "when"], a: 1, e: "unless = if … not." },
      { id: "cond-11", t: "c", q: "Ist der Satz korrekt? „If you would have told me, I would have helped.“", o: ["Ja", "Nein – If you had told me, …"], a: 1, e: "Kein would im if-Satz → past perfect: If you had told me." },
      { id: "cond-12", t: "g", q: "What would you do if you ___ (win) the lottery?", a: ["won"], e: "Second conditional → if + past simple." },
    ],
  },

  {
    id: "wish",
    cat: "Satzbau",
    title: "wish, if only, would rather & it's time",
    short: "Wünsche und Bedauern",
    links: [
      { t: "British Council – Wishes: wish and if only", u: `${BC}/b1-b2/wishes-wish-if-only` },
      { t: "British Council – Wishes and hypotheses", u: `${BC}/english-grammar-reference/wishes-hypotheses` },
    ],
    html: `
<p class="lead">Nach <i>wish / if only</i> geht die Zeit eine Stufe <b>zurück</b> – wie beim second und third conditional.</p>
<table>
<tr><th>Wunsch bezieht sich auf</th><th>Form</th><th>Beispiel</th></tr>
<tr><td>Gegenwart (Zustand)</td><td>past simple</td><td><i>I wish I <b>had</b> more time.</i> · <i>I wish I <b>were</b> taller.</i></td></tr>
<tr><td>Fähigkeit</td><td>could</td><td><i>I wish I <b>could</b> speak French.</i></td></tr>
<tr><td>Vergangenheit (Bedauern)</td><td>past perfect</td><td><i>I wish I <b>hadn't said</b> that.</i></td></tr>
<tr><td>Ärger über Verhalten anderer / Wunsch nach Änderung</td><td>would</td><td><i>I wish you <b>would stop</b> interrupting me.</i></td></tr>
</table>
<ul>
<li><b>If only</b> = stärkeres <i>I wish</i>: <i>If only I <b>had gone</b> to the lecture!</i></li>
<li><b>would rather + Subjekt + past</b>: <i>I'd rather you <b>didn't</b> smoke here.</i> – aber gleiches Subjekt: <i>I'd rather <b>stay</b> at home.</i></li>
<li><b>It's (high) time + past</b>: <i>It's time we <b>went</b> home.</i></li>
</ul>
<div class="warn"><b>Nicht:</b> <s>I wish I would have more time</s> (gleiches Subjekt, Zustand) → <b>I wish I had more time.</b> · <i>would</i> nach wish nur für (Verhaltens-)Änderungen anderer Personen oder Dinge.</div>`,
    ex: [
      { id: "wish-01", t: "g", q: "I wish I ___ (have) more time for my hobbies.", a: ["had"], e: "Wunsch über die Gegenwart → past simple." },
      { id: "wish-02", t: "g", q: "I wish I ___ (not / say) that yesterday.", a: ["hadn't said", "had not said"], e: "Bedauern über die Vergangenheit → past perfect." },
      { id: "wish-03", t: "c", q: "I wish you ___ interrupting me!", o: ["would stop", "stopped", "had stopped"], a: 0, e: "Ärger über das Verhalten anderer → wish + would." },
      { id: "wish-04", t: "c", q: "I wish I ___ speak French.", o: ["can", "could", "would"], a: 1, e: "Fähigkeit → wish + could." },
      { id: "wish-05", t: "c", q: "If only I ___ to the lecture yesterday!", o: ["went", "had gone", "would go"], a: 1, e: "Bedauern über die Vergangenheit → past perfect." },
      { id: "wish-06", t: "c", q: "I'd rather you ___ smoke in here.", o: ["don't", "didn't", "wouldn't"], a: 1, e: "would rather + anderes Subjekt + past simple." },
      { id: "wish-07", t: "c", q: "It's time we ___ home.", o: ["go", "went", "will go"], a: 1, e: "It's time + Subjekt + past simple." },
      { id: "wish-08", t: "c", q: "I wish it ___ raining – I want to go out.", o: ["stopped", "would stop", "had stopped"], a: 1, e: "Wunsch, dass sich etwas ändert → wish + would." },
      { id: "wish-09", t: "c", q: "I wish I ___ taller.", o: ["am", "were", "would be"], a: 1, e: "Zustand in der Gegenwart → were (umgangssprachlich auch was)." },
      { id: "wish-10", t: "c", q: "I'd rather ___ at home tonight.", o: ["stay", "to stay", "staying"], a: 0, e: "would rather + Infinitiv ohne to (gleiches Subjekt)." },
    ],
  },

  {
    id: "passive",
    cat: "Satzbau",
    title: "Passive voice",
    short: "Wenn die Handlung wichtiger ist als der Handelnde",
    links: [
      { t: "British Council – Passives", u: `${BC}/b1-b2/passives` },
      { t: "British Council – Active and passive voice", u: `${BC}/english-grammar-reference/active-passive-voice` },
    ],
    html: `
<p class="lead">Passiv = <b>be</b> in der passenden Zeit + <b>past participle</b>. Den Handelnden nennt man mit <i>by</i> – nur wenn er wichtig ist.</p>
<table>
<tr><th>Zeit</th><th>Passiv</th></tr>
<tr><td>present simple</td><td>The room <b>is cleaned</b> every day.</td></tr>
<tr><td>present continuous</td><td>A new library <b>is being built</b>.</td></tr>
<tr><td>past simple</td><td>The bridge <b>was built</b> in 1890.</td></tr>
<tr><td>present perfect</td><td>The results <b>have</b> just <b>been published</b>.</td></tr>
<tr><td>past perfect</td><td>All tickets <b>had been sold</b>.</td></tr>
<tr><td>will / Modalverb</td><td>It <b>will be finished</b> soon. · It <b>must be submitted</b> by Friday.</td></tr>
</table>
<h3>Besondere Strukturen</h3>
<ul>
<li>Zwei Objekte: <i>The students <b>were given</b> a new topic.</i> (persönliches Passiv ist im Englischen sehr üblich)</li>
<li>Unpersönlich (wissenschaftlicher Stil): <i><b>It is expected that</b> the economy will grow.</i> / <i>The economy <b>is expected to</b> grow.</i> – ebenso <i>is said / believed / thought to …</i></li>
<li>Etwas machen lassen – <b>have/get something done</b>: <i>I <b>had my hair cut</b>.</i></li>
<li><i>need + -ing</i> (BE) hat passive Bedeutung: <i>My bike <b>needs repairing</b></i> (= needs to be repaired).</li>
</ul>
<div class="tip"><b>Akademisches Schreiben:</b> Das Passiv ist in Methodenteilen üblich (<i>The data <b>were collected</b> …</i>), aber zu viel Passiv macht Texte schwer lesbar.</div>
<div class="warn"><b>Achtung:</b> Ein deutsches Passiv im Präsens beschreibt oft einen laufenden Vorgang: <i>Das Haus wird (gerade) gebaut</i> = <b>is being built</b>, nicht <s>is built</s>.</div>`,
    ex: [
      { id: "passive-01", t: "g", q: "The thesis must ___ (submit) by Friday.", a: ["be submitted"], e: "Modalverb + be + Partizip." },
      { id: "passive-02", t: "g", q: "This bridge ___ (build) in 1890.", a: ["was built"], e: "past simple Passiv: was + Partizip." },
      { id: "passive-03", t: "g", q: "The results ___ (just / publish).", a: ["have just been published", "'ve just been published"], e: "present perfect Passiv: have been + Partizip." },
      { id: "passive-04", t: "g", q: "A new library ___ (build) at the moment.", a: ["is being built", "'s being built"], e: "present continuous Passiv: is being + Partizip." },
      { id: "passive-05", t: "c", q: "The email ___ yet.", o: ["hasn't been sent", "hasn't sent", "didn't send"], a: 0, e: "Die E-Mail sendet nicht selbst → Passiv; yet → present perfect." },
      { id: "passive-06", t: "c", q: "He is said ___ very rich.", o: ["to be", "being", "that he is"], a: 0, e: "be said/believed/thought + to-Infinitiv." },
      { id: "passive-07", t: "c", q: "It ___ that the economy will grow next year.", o: ["is expected", "expects", "is expecting"], a: 0, e: "Unpersönliches Passiv: It is expected that …" },
      { id: "passive-08", t: "c", q: "I had my hair ___ yesterday.", o: ["cut", "to cut", "cutting"], a: 0, e: "have something done: have + Objekt + Partizip." },
      { id: "passive-09", t: "g", q: "By the time we arrived, all the tickets ___ (sell).", a: ["had been sold"], e: "past perfect Passiv: had been + Partizip." },
      { id: "passive-10", t: "c", q: "The students ___ a new topic for their essays.", o: ["were given", "gave", "were giving"], a: 0, e: "Persönliches Passiv mit zwei Objekten: were given." },
      { id: "passive-11", t: "c", q: "My bike needs ___. The brakes don't work.", o: ["repairing", "to repair", "repaired"], a: 0, e: "need + -ing (BE) = muss repariert werden; alternativ needs to be repaired. „needs to repair“ hieße: Das Fahrrad muss selbst etwas reparieren." },
    ],
  },

  {
    id: "reported",
    cat: "Satzbau",
    title: "Reported speech (indirekte Rede)",
    short: "Backshift, Fragen, Aufforderungen, say vs. tell",
    links: [
      { t: "British Council – Reported speech: statements", u: `${BC}/b1-b2/reported-speech-statements` },
      { t: "British Council – Reported speech: questions", u: `${BC}/b1-b2/reported-speech-questions` },
      { t: "British Council – Reported speech: reporting verbs", u: `${BC}/b1-b2/reported-speech-reporting-verbs` },
    ],
    html: `
<p class="lead">Steht das Einleitungsverb in der Vergangenheit (<i>said, told, asked</i>), rückt die Zeit meist eine Stufe zurück (<b>backshift</b>).</p>
<table>
<tr><th>Direkte Rede</th><th>Indirekte Rede</th></tr>
<tr><td>present simple: "I <b>am</b> tired."</td><td>past simple: she said she <b>was</b> tired</td></tr>
<tr><td>present continuous: "I'<b>m working</b>."</td><td>past continuous: he said he <b>was working</b></td></tr>
<tr><td>present perfect / past simple: "I <b>have finished</b>." / "I <b>finished</b>."</td><td>past perfect: he said he <b>had finished</b></td></tr>
<tr><td>will / can / may</td><td>would / could / might</td></tr>
<tr><td>must</td><td>must oder had to</td></tr>
</table>
<h3>Zeit- und Ortsangaben</h3>
<p><i>today → that day · yesterday → the day before / the previous day · tomorrow → the next day / the following day · here → there · this → that · ago → before</i></p>
<h3>Fragen</h3>
<ul>
<li>Normale Wortstellung (kein do/does, keine Umstellung): <i>"Where do you live?" → He asked me where <b>I lived</b>.</i></li>
<li>Ja/Nein-Fragen mit <b>if/whether</b>: <i>She asked <b>if</b> I was coming.</i></li>
</ul>
<h3>Bitten und Befehle</h3>
<p><b>tell/ask + Person + (not) to</b>: <i>"Don't be late!" → He told us <b>not to be</b> late.</i></p>
<h3>say vs. tell</h3>
<p><b>say</b> (something) (to somebody) – <b>tell somebody</b> (something): <i>She <b>said</b> (that) she was busy. She <b>told me</b> (that) she was busy.</i></p>
<div class="tip"><b>Kein Backshift nötig</b>, wenn die Aussage immer noch gilt: <i>She said the earth <b>is/was</b> round.</i> – beides ist korrekt.</div>
<div class="tip"><b>Reporting verbs</b> mit eigenen Mustern: <i>suggest <b>doing</b> / suggest that we do</i>, <i>offer/promise/refuse <b>to do</b></i>, <i>admit/deny <b>doing</b></i>, <i>warn/advise somebody <b>(not) to do</b></i>.</div>`,
    ex: [
      { id: "reported-01", t: "g", q: "\"I am tired,\" she said. → She said (that) she ___ tired.", a: ["was"], e: "Backshift: present simple → past simple." },
      { id: "reported-02", t: "g", q: "\"I have finished,\" he said. → He said he ___ finished.", a: ["had"], e: "Backshift: present perfect → past perfect." },
      { id: "reported-03", t: "g", q: "\"I will call you,\" she said. → She said she ___ call me.", a: ["would"], e: "will → would." },
      { id: "reported-04", t: "c", q: "\"Where do you live?\" he asked. → He asked me where ___.", o: ["I lived", "did I live", "do I live"], a: 0, e: "Indirekte Frage: normale Wortstellung, kein do, Backshift." },
      { id: "reported-05", t: "c", q: "\"Are you coming?\" → She asked ___ I was coming.", o: ["if", "that", "do"], a: 0, e: "Ja/Nein-Frage → if/whether." },
      { id: "reported-06", t: "c", q: "\"Don't be late!\" → He told us ___ late.", o: ["not to be", "don't be", "to not being"], a: 0, e: "Verneinte Aufforderung → tell somebody not to + Infinitiv." },
      { id: "reported-07", t: "c", q: "She ___ me that she was moving to London.", o: ["said", "told", "spoke"], a: 1, e: "tell + Person (me); say ohne Person." },
      { id: "reported-08", t: "c", q: "He ___ that he was busy.", o: ["said", "told", "asked"], a: 0, e: "say + that-Satz (ohne Personenobjekt)." },
      { id: "reported-09", t: "c", q: "\"We saw him yesterday,\" they said. (Eine Woche später erzählt) → They said they had seen him ___.", o: ["yesterday", "the day before", "the next day"], a: 1, e: "yesterday → the day before / the previous day." },
      { id: "reported-10", t: "c", q: "\"The earth is round,\" she said. → She said the earth ___ round.", o: ["is", "was", "is oder was – beides korrekt"], a: 2, e: "Gilt die Aussage weiterhin, ist Backshift optional." },
      { id: "reported-11", t: "c", q: "\"Can you help me?\" → She asked me if I ___ help her.", o: ["can", "could", "would can"], a: 1, e: "can → could." },
      { id: "reported-12", t: "c", q: "He suggested ___ a break.", o: ["taking", "to take", "us to take"], a: 0, e: "suggest + -ing (oder suggest that we take); nicht suggest somebody to do." },
    ],
  },

  {
    id: "relative",
    cat: "Satzbau",
    title: "Relative clauses (Relativsätze)",
    short: "who, which, that, whose, where – und die Kommas",
    links: [
      { t: "British Council – Defining relative clauses", u: `${BC}/b1-b2/relative-clauses-defining-relative-clauses` },
      { t: "British Council – Non-defining relative clauses", u: `${BC}/b1-b2/relative-clauses-non-defining-relative-clauses` },
      { t: "British Council – Relative pronouns and relative clauses", u: `${BC}/english-grammar-reference/relative-pronouns-relative-clauses` },
    ],
    html: `
<p class="lead">Ob ein Relativsatz <b>notwendig</b> (defining) oder <b>Zusatzinfo</b> (non-defining) ist, bestimmt Pronomen und Kommasetzung – anders als im Deutschen, wo immer ein Komma steht.</p>
<h3>Pronomen</h3>
<table>
<tr><th></th><th>defining (ohne Komma)</th><th>non-defining (mit Kommas)</th></tr>
<tr><td>Personen</td><td>who / that</td><td>who</td></tr>
<tr><td>Dinge</td><td>which / that</td><td>which</td></tr>
<tr><td>Besitz</td><td>whose</td><td>whose</td></tr>
<tr><td>Ort / Zeit / Grund</td><td>where / when / why</td><td>where / when</td></tr>
</table>
<h3>Defining relative clauses</h3>
<ul>
<li>Bestimmen, wer/was gemeint ist – <b>keine Kommas</b>: <i>The woman <b>who</b> lives next door is a doctor.</i></li>
<li>Ist das Pronomen <b>Objekt</b>, kann es wegfallen (contact clause): <i>The book (<b>that</b>) I bought is great.</i></li>
</ul>
<h3>Non-defining relative clauses</h3>
<ul>
<li>Zusatzinformation – <b>Kommas</b>, <b>nie that</b>, Pronomen nie weglassbar: <i>My brother, <b>who</b> lives in Vienna, is a teacher.</i></li>
<li>Bezug auf den ganzen Satz → <b>which</b>: <i>He passed the exam, <b>which</b> surprised everyone.</i></li>
</ul>
<div class="tip"><b>Bedeutungsunterschied durch Kommas:</b> <i>My sister <b>who lives in London</b> is a nurse</i> (ich habe mehrere Schwestern) ↔ <i>My sister<b>, who lives in London,</b> is a nurse</i> (ich habe nur eine).</div>
<ul>
<li><b>what</b> = „das, was“ (kein Bezugswort): <i><b>What</b> you said was helpful.</i> – nicht <s>That what you said</s>.</li>
<li>Präposition formell vorne: <i>the people <b>to whom</b> I spoke</i> · informell hinten: <i>the people (who) I spoke <b>to</b></i>.</li>
</ul>`,
    ex: [
      { id: "relative-01", t: "c", q: "The woman ___ lives next door is a doctor.", o: ["who", "which", "whose"], a: 0, e: "Person, Subjekt → who (oder that)." },
      { id: "relative-02", t: "c", q: "The book ___ I bought yesterday is great.", o: ["which", "who", "what"], a: 0, e: "Ding → which/that (oder ganz weglassen, da Objekt)." },
      { id: "relative-03", t: "c", q: "That's the student ___ laptop was stolen.", o: ["who", "whose", "which"], a: 1, e: "Besitz → whose." },
      { id: "relative-04", t: "c", q: "My brother, ___ lives in Vienna, is a teacher.", o: ["that", "who"], a: 1, e: "Non-defining (Kommas) → nie that." },
      { id: "relative-05", t: "c", q: "He passed the exam, ___ surprised everyone.", o: ["that", "which", "what"], a: 1, e: "Bezug auf den ganzen Satz → , which." },
      { id: "relative-06", t: "c", q: "This is the town ___ I grew up.", o: ["where", "which", "that"], a: 0, e: "Ort → where (oder: the town (that) I grew up in)." },
      { id: "relative-07", t: "c", q: "\"The film ___ we watched was boring.\" Braucht man hier ein Relativpronomen?", o: ["Ja, es ist nötig", "Nein, es kann wegfallen"], a: 1, e: "Das Pronomen ist Objekt (we watched it) → kann wegfallen." },
      { id: "relative-08", t: "c", q: "Ich habe nur eine Schwester. Welcher Satz passt?", o: ["My sister, who lives in London, is a nurse.", "My sister who lives in London is a nurse."], a: 0, e: "Nur eine Schwester → Zusatzinformation → Kommas." },
      { id: "relative-09", t: "c", q: "The reason ___ I called is to ask about the exam.", o: ["why", "which", "what"], a: 0, e: "the reason why." },
      { id: "relative-10", t: "c", q: "___ you said was very helpful.", o: ["What", "That", "Which"], a: 0, e: "what = das, was (ohne Bezugswort)." },
      { id: "relative-11", t: "c", q: "Formal: The people ___ I spoke were very friendly.", o: ["to whom", "whom to", "to which"], a: 0, e: "Präposition vorne + whom (formell)." },
    ],
  },
];
