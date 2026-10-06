// Grammar topics: verbs and words. Same format as tenses.js.

const BC = "https://learnenglish.britishcouncil.org/free-resources/grammar";

export default [
  {
    id: "modals-obligation",
    cat: "Verben",
    title: "Modalverben: must, have to, mustn't, needn't, should",
    short: "Pflicht, Verbot, keine Notwendigkeit, Rat",
    links: [
      { t: "British Council – Modals: permission and obligation", u: `${BC}/b1-b2/modals-permission-obligation` },
      { t: "British Council – Modal verbs", u: `${BC}/english-grammar-reference/modal-verbs` },
    ],
    html: `
<p class="lead">Die größte Falle: <b>mustn't ≠ „muss nicht“</b>. <i>mustn't</i> heißt „darf nicht“.</p>
<table>
<tr><th>Bedeutung</th><th>Form</th><th>Beispiel</th></tr>
<tr><td>Pflicht (vom Sprecher / Regel)</td><td>must</td><td><i>Students <b>must</b> submit by Friday.</i></td></tr>
<tr><td>Pflicht (von außen, Umstände)</td><td>have to</td><td><i>I <b>have to</b> work tomorrow.</i></td></tr>
<tr><td>Verbot</td><td>mustn't</td><td><i>You <b>mustn't</b> smoke here.</i></td></tr>
<tr><td>keine Notwendigkeit</td><td>don't have to / needn't / don't need to</td><td><i>You <b>don't have to</b> come.</i></td></tr>
<tr><td>Rat, Empfehlung</td><td>should / ought to</td><td><i>You <b>should</b> apologise.</i></td></tr>
</table>
<h3>Andere Zeiten</h3>
<p><i>must</i> hat keine Vergangenheits- oder Zukunftsform → <b>had to</b> / <b>will have to</b>: <i>Yesterday I <b>had to</b> work late. Will you <b>have to</b> work this weekend?</i></p>
<h3>Vergangenheit: needn't have vs. didn't need to</h3>
<ul>
<li><b>needn't have + Partizip</b>: Man hat es getan, aber es war unnötig: <i>You <b>needn't have bought</b> milk – we still had some.</i></li>
<li><b>didn't need to / didn't have to</b>: Es war nicht nötig (und meist hat man es auch nicht getan): <i>We <b>didn't need to</b> hurry, so we walked slowly.</i></li>
<li><b>should have + Partizip</b>: Kritik/Bedauern: <i>You <b>should have told</b> me earlier!</i></li>
</ul>
<div class="warn"><b>Typische Fehler:</b> <i>Ich muss nicht kommen</i> → <b>I don't have to come</b> (nicht <s>I mustn't come</s>). · <s>must to</s> / <s>should to</s> gibt es nicht.</div>`,
    ex: [
      { id: "modob-01", t: "c", q: "You ___ smoke in the library. It's forbidden.", o: ["mustn't", "don't have to", "needn't"], a: 0, e: "Verbot → mustn't." },
      { id: "modob-02", t: "c", q: "Tomorrow is Sunday, so I ___ get up early.", o: ["mustn't", "don't have to"], a: 1, e: "Keine Notwendigkeit → don't have to." },
      { id: "modob-03", t: "c", q: "Yesterday I ___ work late.", o: ["must", "had to", "musted"], a: 1, e: "must hat keine Vergangenheit → had to." },
      { id: "modob-04", t: "c", q: "You ___ see that film – it's brilliant!", o: ["must", "mustn't", "need"], a: 0, e: "Dringende Empfehlung → must." },
      { id: "modob-05", t: "c", q: "You ___ bought milk – there was still some in the fridge.", o: ["needn't have", "mustn't have", "shouldn't"], a: 0, e: "Getan, aber unnötig → needn't have + Partizip." },
      { id: "modob-06", t: "c", q: "We had plenty of time, so we ___ hurry and walked slowly.", o: ["didn't need to", "needn't have"], a: 0, e: "Nicht nötig und nicht getan → didn't need to." },
      { id: "modob-07", t: "c", q: "You ___ apologise to her – you were really rude.", o: ["should", "would", "shall"], a: 0, e: "Rat → should." },
      { id: "modob-08", t: "c", q: "You ___ told me earlier! Now it's too late.", o: ["should have", "must have", "would have"], a: 0, e: "Kritik an der Vergangenheit → should have + Partizip." },
      { id: "modob-09", t: "g", q: "Ich musste nicht kommen. → I ___ come.", a: ["didn't have to", "did not have to", "didn't need to", "did not need to"], e: "Keine Notwendigkeit in der Vergangenheit → didn't have to / didn't need to." },
      { id: "modob-10", t: "c", q: "Will you ___ work this weekend?", o: ["must", "have to", "has to"], a: 1, e: "Zukunft → will have to." },
      { id: "modob-11", t: "c", q: "Ist der Satz korrekt? „You must to bring your ID.“", o: ["Ja", "Nein – You must bring your ID."], a: 1, e: "Nach Modalverben steht der Infinitiv ohne to." },
    ],
  },

  {
    id: "modals-deduction",
    cat: "Verben",
    title: "Modalverben: Vermutungen (must, might, can't – auch mit have)",
    short: "Wie sicher bin ich? Jetzt und in der Vergangenheit",
    links: [
      { t: "British Council – Modals: deductions about the present", u: `${BC}/b1-b2/modals-deductions-about-present` },
      { t: "British Council – Modals: deductions about the past", u: `${BC}/b1-b2/modals-deductions-about-past` },
    ],
    html: `
<p class="lead">Modalverben drücken auch aus, <b>wie sicher</b> man sich ist. Für die Vergangenheit: <b>Modalverb + have + Partizip</b>.</p>
<table>
<tr><th>Sicherheit</th><th>Gegenwart</th><th>Vergangenheit</th></tr>
<tr><td>fast sicher: ja</td><td>must be</td><td>must have been</td></tr>
<tr><td>möglich</td><td>might / may / could be</td><td>might / may / could have been</td></tr>
<tr><td>fast sicher: nein</td><td>can't / couldn't be</td><td>can't / couldn't have been</td></tr>
</table>
<ul>
<li><i>She's been working for 12 hours. She <b>must be</b> exhausted.</i></li>
<li><i>That <b>can't be</b> Tom – he's in Spain.</i> (Gegenteil von must ist <b>can't</b>, nicht <s>mustn't</s>)</li>
<li><i>The lights are off. They <b>must have gone</b> to bed.</i></li>
<li><i>I can't find my keys. I <b>might have left</b> them at the office.</i></li>
<li><i>He <b>can't have seen</b> me – he didn't say hello.</i></li>
</ul>
<div class="tip"><b>could have</b> hat zwei Bedeutungen: Vermutung (<i>It could have been John</i>) oder ungenutzte Möglichkeit/Vorwurf (<i>You <b>could have</b> called! I was worried.</i>).</div>
<div class="warn"><b>Deutsch → Englisch:</b> <i>Er muss es vergessen haben</i> = <b>He must have forgotten</b> (nicht <s>He had to forget</s>). · <i>Er hat es vielleicht nicht gehört</i> = <b>He may/might not have heard it.</b></div>`,
    ex: [
      { id: "moded-01", t: "c", q: "She's been working for 12 hours. She ___ be exhausted.", o: ["must", "can't", "mustn't"], a: 0, e: "Logische Schlussfolgerung (fast sicher) → must." },
      { id: "moded-02", t: "c", q: "That ___ be Tom – he's in Spain this week.", o: ["mustn't", "can't", "needn't"], a: 1, e: "Fast sicher nicht → can't." },
      { id: "moded-03", t: "c", q: "I'm not sure where Anna is. She ___ be in the library.", o: ["might", "must", "can't"], a: 0, e: "Möglichkeit → might/may/could." },
      { id: "moded-04", t: "c", q: "The lights are off. They ___ gone to bed.", o: ["must have", "must", "can't have"], a: 0, e: "Schlussfolgerung über die Vergangenheit → must have + Partizip." },
      { id: "moded-05", t: "c", q: "He ___ have seen me – he didn't say hello.", o: ["can't", "mustn't"], a: 0, e: "Fast sicher nicht (Vergangenheit) → can't have." },
      { id: "moded-06", t: "g", q: "I can't find my keys. I ___ (leave) them at the office – I'm not sure.", a: ["might have left", "may have left", "could have left"], e: "Möglichkeit in der Vergangenheit → might/may/could have + Partizip." },
      { id: "moded-07", t: "c", q: "You ___ have called! I was worried.", o: ["could", "must", "can't"], a: 0, e: "Vorwurf: es wäre möglich gewesen → could have." },
      { id: "moded-08", t: "c", q: "It ___ have been easy to move to a new country alone.", o: ["can't", "mustn't", "needn't"], a: 0, e: "Vermutung: sicher nicht leicht → can't have been." },
      { id: "moded-09", t: "c", q: "Er muss es vergessen haben. → He ___ it.", o: ["must have forgotten", "must forget", "had to forget"], a: 0, e: "Vermutung über die Vergangenheit → must have + Partizip." },
      { id: "moded-10", t: "c", q: "Er hat es vielleicht nicht gehört. → He ___ it.", o: ["may not have heard", "mustn't have heard", "can't hear"], a: 0, e: "Vielleicht nicht (Vergangenheit) → may/might not have + Partizip." },
    ],
  },

  {
    id: "gerund",
    cat: "Verben",
    title: "Gerund (-ing) oder Infinitiv (to …)?",
    short: "enjoy doing, decide to do – und stop, remember, try",
    links: [
      { t: "British Council – Verbs followed by -ing or infinitive", u: `${BC}/a1-a2/verbs-followed-ing-or-infinitive` },
      { t: "British Council – -ing or infinitive to change meaning", u: `${BC}/b1-b2/verbs-followed-ing-or-infinitive-change-meaning` },
      { t: "British Council – -ing forms", u: `${BC}/english-grammar-reference/ing-forms` },
    ],
    html: `
<h3>Verben mit -ing</h3>
<p><i>enjoy, mind, avoid, admit, deny, consider, finish, give up, keep, miss, practise, risk, suggest, can't help, can't stand, feel like, look forward to, be used to, it's no use, it's worth</i><br>
<i>I enjoy <b>swimming</b>. Would you mind <b>opening</b> the window?</i></p>
<h3>Verben mit to-Infinitiv</h3>
<p><i>want, decide, hope, plan, agree, refuse, promise, offer, afford, manage, fail, expect, learn, seem, would like</i><br>
<i>We decided <b>to rent</b> a car. I can't afford <b>to buy</b> a new laptop.</i></p>
<h3>Nach Präpositionen immer -ing</h3>
<p><i>interested in <b>learning</b>, good at <b>writing</b>, before <b>leaving</b>, instead of <b>waiting</b></i> – auch nach <b>to</b> als Präposition: <i>look forward to <b>seeing</b>, be used to <b>writing</b>, object to <b>paying</b></i>.</p>
<h3>Bedeutungsunterschied</h3>
<table>
<tr><th>Verb</th><th>+ -ing</th><th>+ to-Infinitiv</th></tr>
<tr><td>stop</td><td>aufhören: <i>I stopped <b>smoking</b>.</i></td><td>anhalten, um zu: <i>I stopped <b>to buy</b> bread.</i></td></tr>
<tr><td>remember / forget</td><td>sich erinnern (Vergangenes): <i>I remember <b>meeting</b> him.</i></td><td>daran denken (zu tun): <i>Remember <b>to lock</b> the door.</i></td></tr>
<tr><td>try</td><td>ausprobieren: <i>Try <b>restarting</b> it.</i></td><td>sich bemühen: <i>I'm trying <b>to learn</b> Japanese.</i></td></tr>
<tr><td>regret</td><td>bereuen: <i>I regret <b>telling</b> her.</i></td><td>bedauern mitteilen zu müssen: <i>We regret <b>to inform</b> you …</i></td></tr>
<tr><td>go on</td><td>weitermachen: <i>He went on <b>talking</b>.</i></td><td>dann zu etwas anderem übergehen: <i>He went on <b>to talk</b> about …</i></td></tr>
</table>
<div class="tip"><i>like, love, hate, prefer, begin, start, continue</i> gehen mit beidem ohne großen Unterschied. Aber <i>would like/love/prefer</i> → immer <b>to</b>.</div>`,
    ex: [
      { id: "gerund-01", t: "c", q: "I enjoy ___ in the morning.", o: ["swimming", "to swim"], a: 0, e: "enjoy + -ing." },
      { id: "gerund-02", t: "c", q: "We decided ___ a car.", o: ["renting", "to rent"], a: 1, e: "decide + to-Infinitiv." },
      { id: "gerund-03", t: "c", q: "I stopped ___ two years ago – I don't smoke any more.", o: ["smoking", "to smoke"], a: 0, e: "stop + -ing = mit etwas aufhören." },
      { id: "gerund-04", t: "c", q: "On the way home I stopped ___ some bread.", o: ["buying", "to buy"], a: 1, e: "stop + to = anhalten, um etwas zu tun." },
      { id: "gerund-05", t: "c", q: "Remember ___ the door when you leave!", o: ["locking", "to lock"], a: 1, e: "remember + to = daran denken, etwas zu tun." },
      { id: "gerund-06", t: "c", q: "I remember ___ him at a conference years ago.", o: ["meeting", "to meet"], a: 0, e: "remember + -ing = sich an Vergangenes erinnern." },
      { id: "gerund-07", t: "c", q: "If it doesn't work, try ___ the computer off and on again.", o: ["turning", "to turn"], a: 0, e: "try + -ing = etwas ausprobieren." },
      { id: "gerund-08", t: "c", q: "I'm looking forward to ___ you.", o: ["see", "seeing"], a: 1, e: "look forward to: to ist hier Präposition → -ing." },
      { id: "gerund-09", t: "c", q: "It's no use ___ about it now.", o: ["worrying", "to worry"], a: 0, e: "it's no use + -ing." },
      { id: "gerund-10", t: "c", q: "I can't afford ___ a new laptop.", o: ["buying", "to buy"], a: 1, e: "afford + to-Infinitiv." },
      { id: "gerund-11", t: "c", q: "Would you mind ___ the window?", o: ["opening", "to open"], a: 0, e: "mind + -ing." },
      { id: "gerund-12", t: "c", q: "We regret ___ you that the course has been cancelled.", o: ["informing", "to inform"], a: 1, e: "regret + to = bedauern, mitteilen zu müssen (formell)." },
      { id: "gerund-13", t: "c", q: "I'm interested in ___ a semester abroad.", o: ["doing", "to do"], a: 0, e: "Nach Präpositionen (in) → -ing." },
      { id: "gerund-14", t: "c", q: "She would like ___ linguistics.", o: ["studying", "to study"], a: 1, e: "would like + to-Infinitiv." },
    ],
  },

  {
    id: "articles",
    cat: "Wörter",
    title: "Articles: a/an, the, kein Artikel",
    short: "Wo Deutsch und Englisch sich unterscheiden",
    links: [
      { t: "British Council – Articles: a, an, the", u: `${BC}/a1-a2-grammar/articles-a-an-the` },
      { t: "British Council – Articles: the or no article", u: `${BC}/a1-a2-grammar/articles-the-or-no-article` },
      { t: "British Council – The definite article", u: `${BC}/english-grammar-reference/definite-article` },
    ],
    html: `
<h3>a / an</h3>
<ul>
<li>Richtet sich nach dem <b>Laut</b>, nicht dem Buchstaben: <i><b>an</b> hour, <b>an</b> honour, <b>an</b> MA</i> ↔ <i><b>a</b> university, <b>a</b> European, <b>a</b> one-way ticket</i>.</li>
<li>Berufe (anders als im Deutschen!): <i>She is <b>an</b> engineer.</i> (Sie ist Ingenieurin.)</li>
<li>Ausrufe: <i>What <b>a</b> beautiful day!</i></li>
</ul>
<h3>Kein Artikel (zero article)</h3>
<ul>
<li>Allgemeine Aussagen mit Abstrakta, Stoffnamen, Plural: <i><b>Life</b> is short. I love <b>music</b>. <b>Students</b> need sleep.</i> (Deutsch: „<i>Das</i> Leben“)</li>
<li>Mahlzeiten: <i>We had <b>lunch</b> in the canteen.</i></li>
<li>Institutionen in ihrer Funktion: <i>go to <b>church</b> / <b>school</b> / <b>university</b> / <b>bed</b> / <b>hospital</b></i> (BE) – aber <i>I went to <b>the</b> church to look at the windows.</i></li>
<li>Die meisten Länder, Städte, Seen, Berge, Straßen: <i>Germany, Lake Constance, Oxford Street</i>.</li>
</ul>
<h3>the</h3>
<ul>
<li>Bestimmtes, bekanntes oder einzigartiges: <i>I love music, but I don't like <b>the</b> music they play here.</i></li>
<li>Länder mit <i>Republic/Kingdom/States</i> oder im Plural: <i><b>the</b> UK, <b>the</b> USA, <b>the</b> Netherlands</i>; Flüsse, Meere, Gebirge: <i><b>the</b> Rhine, <b>the</b> Alps</i>.</li>
<li>Musikinstrumente (BE): <i>She plays <b>the</b> piano.</i></li>
<li>Adjektiv als Gruppe: <i><b>the</b> unemployed, <b>the</b> rich, <b>the</b> elderly</i>.</li>
</ul>
<div class="warn"><b>Typische Fehler:</b> <s>The life is beautiful.</s> → <b>Life is beautiful.</b> · <s>She is teacher.</s> → <b>She is a teacher.</b> · <s>in the Germany</s> → <b>in Germany</b></div>`,
    ex: [
      { id: "articles-01", t: "c", q: "___ life is too short to worry so much.", o: ["The", "— (kein Artikel)"], a: 1, e: "Abstraktum, allgemein → kein Artikel." },
      { id: "articles-02", t: "c", q: "She is ___ engineer.", o: ["— (kein Artikel)", "an", "the"], a: 1, e: "Berufe mit a/an; engineer beginnt mit Vokallaut → an." },
      { id: "articles-03", t: "c", q: "I love ___ music, but I don't like ___ music they play here.", o: ["— / the", "the / the", "— / —"], a: 0, e: "Allgemein → kein Artikel; bestimmt (they play here) → the." },
      { id: "articles-04", t: "c", q: "Amsterdam is in ___ Netherlands.", o: ["the", "— (kein Artikel)"], a: 0, e: "Ländernamen im Plural → the." },
      { id: "articles-05", t: "c", q: "He goes to ___ church every Sunday.", o: ["— (kein Artikel)", "the"], a: 0, e: "Institution in ihrer Funktion (Gottesdienst) → kein Artikel." },
      { id: "articles-06", t: "c", q: "She plays ___ piano beautifully.", o: ["the", "— (kein Artikel)"], a: 0, e: "Musikinstrumente (BE) → the." },
      { id: "articles-07", t: "c", q: "I'm studying English at ___ university in Leipzig.", o: ["a", "an"], a: 0, e: "university beginnt mit dem Laut /juː/ → a." },
      { id: "articles-08", t: "c", q: "___ unemployed need more support.", o: ["The", "— (kein Artikel)"], a: 0, e: "the + Adjektiv = Personengruppe." },
      { id: "articles-09", t: "c", q: "It's ___ honour to be here.", o: ["a", "an"], a: 1, e: "honour: h ist stumm → Vokallaut → an." },
      { id: "articles-10", t: "c", q: "What ___ beautiful day!", o: ["a", "— (kein Artikel)", "the"], a: 0, e: "What a + zählbares Nomen im Singular." },
      { id: "articles-11", t: "c", q: "We had ___ lunch in the canteen.", o: ["— (kein Artikel)", "a", "the"], a: 0, e: "Mahlzeiten → normalerweise kein Artikel." },
      { id: "articles-12", t: "c", q: "She's lived in ___ Germany for years.", o: ["— (kein Artikel)", "the"], a: 0, e: "Die meisten Ländernamen → kein Artikel." },
    ],
  },

  {
    id: "quantifiers",
    cat: "Wörter",
    title: "Countable/uncountable: much, many, few, little, some, any",
    short: "information, advice & Co. – und few vs. a few",
    links: [
      { t: "British Council – Common problems with count and uncount nouns", u: `${BC}/english-grammar-reference/common-problems-count-uncount-nouns` },
      { t: "British Council – Determiners and quantifiers", u: `${BC}/english-grammar-reference/determiners-quantifiers` },
    ],
    html: `
<h3>Nicht zählbar im Englischen (oft anders als im Deutschen)</h3>
<p><i><b>information, advice, news, furniture, luggage/baggage, equipment, research, evidence, knowledge, homework, progress, feedback, software</b></i><br>
→ kein Plural, kein a/an: <i>some advice / a piece of advice</i>, <i>The news <b>is</b> good.</i></p>
<table>
<tr><th></th><th>zählbar (Plural)</th><th>nicht zählbar</th></tr>
<tr><td>viel</td><td>many</td><td>much</td></tr>
<tr><td>wenig (negativ: kaum)</td><td>few</td><td>little</td></tr>
<tr><td>einige (positiv)</td><td>a few</td><td>a little</td></tr>
<tr><td>weniger</td><td>fewer</td><td>less</td></tr>
</table>
<ul>
<li><b>few/little</b> = kaum, zu wenig: <i>Unfortunately, <b>few</b> people came.</i></li>
<li><b>a few / a little</b> = ein paar, etwas (positiv): <i>I have <b>a few</b> friends in Berlin. Could I have <b>a little</b> more coffee?</i></li>
<li>In positiven Sätzen statt much/many oft <b>a lot of / lots of</b>: <i>We have a lot of time.</i></li>
</ul>
<h3>some / any</h3>
<ul>
<li><b>some</b> in positiven Sätzen und in Angeboten/Bitten: <i>Would you like <b>some</b> tea?</i></li>
<li><b>any</b> in Verneinungen und offenen Fragen: <i>I don't have <b>any</b> money. Do you have <b>any</b> questions?</i></li>
</ul>
<div class="warn"><b>Typische Fehler:</b> <s>informations, advices, furnitures</s> · <s>an information</s> → <b>a piece of information</b> · <s>The police is coming</s> → <b>The police are coming</b> (police ist immer Plural).</div>`,
    ex: [
      { id: "quant-01", t: "c", q: "How ___ information do you need?", o: ["much", "many"], a: 0, e: "information ist nicht zählbar → much." },
      { id: "quant-02", t: "c", q: "Can you give me some ___?", o: ["advice", "advices"], a: 0, e: "advice ist nicht zählbar → kein Plural." },
      { id: "quant-03", t: "c", q: "Unfortunately, ___ people came – the room was almost empty.", o: ["few", "a few"], a: 0, e: "few = kaum (negativ)." },
      { id: "quant-04", t: "c", q: "I have ___ friends in Berlin, so I'm not lonely there.", o: ["few", "a few"], a: 1, e: "a few = ein paar (positiv)." },
      { id: "quant-05", t: "c", q: "We have ___ time left – let's hurry.", o: ["little", "a little", "few"], a: 0, e: "little = kaum (negativ), time ist nicht zählbar." },
      { id: "quant-06", t: "c", q: "Could I have ___ more coffee, please?", o: ["a little", "a few", "few"], a: 0, e: "a little = etwas, coffee nicht zählbar." },
      { id: "quant-07", t: "c", q: "My ___ is still in the car.", o: ["luggage", "luggages", "baggages"], a: 0, e: "luggage ist nicht zählbar → kein Plural." },
      { id: "quant-08", t: "c", q: "I don't have ___ money with me.", o: ["some", "any"], a: 1, e: "Verneinung → any." },
      { id: "quant-09", t: "c", q: "Would you like ___ tea?", o: ["some", "any"], a: 0, e: "Angebot → some." },
      { id: "quant-10", t: "c", q: "We need ___ new furniture for the flat.", o: ["a", "some", "many"], a: 1, e: "furniture ist nicht zählbar → some (nicht a/many)." },
      { id: "quant-11", t: "c", q: "There are ___ students in the course this year.", o: ["fewer", "less"], a: 0, e: "students ist zählbar → fewer (less gilt bei Zählbarem als umgangssprachlich)." },
      { id: "quant-12", t: "c", q: "The news ___ good.", o: ["is", "are"], a: 0, e: "news ist nicht zählbar und steht im Singular." },
    ],
  },

  {
    id: "pitfalls",
    cat: "Wörter",
    title: "Typische Fehler deutscher Muttersprachler",
    short: "make/do, say/tell, become/get, good/well & mehr",
    links: [
      { t: "British Council – B1-B2 Grammatik (Übersicht)", u: `${BC}/b1-b2` },
      { t: "British Council – Clause structure and verb patterns", u: `${BC}/english-grammar-reference/clause-structure-verb-patterns` },
    ],
    html: `
<p class="lead">Eine Sammlung von Fehlern, die durch Übertragung aus dem Deutschen entstehen – auch bei fortgeschrittenen Lernenden.</p>
<h3>Verwechslungen</h3>
<ul>
<li><b>make</b> (herstellen, verursachen): <i>make a mistake, a decision, a plan, progress, a suggestion</i> · <b>do</b> (Tätigkeit): <i>do homework, research, a favour, your best</i></li>
<li><b>say</b> something · <b>tell</b> somebody something: <i>She <b>told me</b> the truth.</i></li>
<li><b>become</b> = werden ≠ bekommen. <i>Ich bekomme ein neues Auto</i> = <b>I'm getting</b> a new car.</li>
<li><b>actually</b> = eigentlich/tatsächlich, nicht „aktuell“ → <b>currently</b>. <b>eventually</b> = schließlich, nicht „eventuell“ → <b>possibly</b>.</li>
<li><b>since</b> + Zeitpunkt / <b>for</b> + Zeitraum (siehe present perfect).</li>
</ul>
<h3>Adjektiv oder Adverb?</h3>
<ul>
<li>Verben werden mit dem Adverb beschrieben: <i>She sings <b>well</b>. He drives <b>carefully</b>.</i></li>
<li>Nach <i>be, seem, look, feel, sound, taste, smell</i> (Zustand) steht das <b>Adjektiv</b>: <i>It sounds <b>good</b>.</i></li>
<li><i>I feel <b>good</b></i> (Stimmung) / <i>I feel <b>well</b></i> (gesund) – beides korrekt.</li>
</ul>
<h3>Satzbau</h3>
<ul>
<li><s>I want that you come.</s> → <b>I want you to come.</b> (auch: would like/expect somebody to do)</li>
<li><s>He explained me the problem.</s> → <b>He explained the problem to me.</b> (ebenso <i>describe/suggest something to somebody</i>)</li>
<li>Wortstellung Subjekt–Verb–Objekt, Zeit eher ans Ende: <s>I like very much football.</s> → <b>I like football very much.</b></li>
<li>Präpositionen der Zeit: <b>on</b> Monday / on 3 May · <b>at</b> 5 pm / at the weekend (BE) · <b>in</b> May / in 2024 / in the morning</li>
</ul>
<h3>Singular oder Plural?</h3>
<p><b>Plural:</b> <i>police, people, trousers, glasses</i> · <b>Singular:</b> <i>news, information, advice, physics, economics</i></p>`,
    ex: [
      { id: "pitfall-01", t: "c", q: "I ___ a mistake in the exam.", o: ["made", "did"], a: 0, e: "make a mistake." },
      { id: "pitfall-02", t: "c", q: "Can you ___ me a favour?", o: ["do", "make"], a: 0, e: "do somebody a favour." },
      { id: "pitfall-03", t: "c", q: "She ___ me the truth.", o: ["said", "told"], a: 1, e: "tell + Person." },
      { id: "pitfall-04", t: "c", q: "Ich bekomme nächste Woche ein neues Auto. → I ___ a new car next week.", o: ["am becoming", "am getting"], a: 1, e: "bekommen = get; become = werden." },
      { id: "pitfall-05", t: "c", q: "She sings very ___.", o: ["good", "well"], a: 1, e: "Ein Verb (sings) wird mit dem Adverb beschrieben → well." },
      { id: "pitfall-06", t: "c", q: "\"I feel ___ today.\" Was ist korrekt?", o: ["good", "well", "beides – good (Stimmung) und well (Gesundheit)"], a: 2, e: "feel ist ein Zustandsverb: good = gut gelaunt, well = gesund." },
      { id: "pitfall-07", t: "c", q: "We are ___ working on the project. (= derzeit)", o: ["actually", "currently"], a: 1, e: "aktuell/derzeit = currently; actually = eigentlich/tatsächlich." },
      { id: "pitfall-08", t: "c", q: "I'll see you ___ Monday.", o: ["on", "at", "in"], a: 0, e: "Wochentage und Daten → on." },
      { id: "pitfall-09", t: "c", q: "He ___ in Berlin since 2019.", o: ["lives", "has lived", "is living"], a: 1, e: "seit + bis heute → present perfect." },
      { id: "pitfall-10", t: "c", q: "Welcher Satz ist korrekt?", o: ["I want that you come to the party.", "I want you to come to the party."], a: 1, e: "want somebody to do something – kein that-Satz." },
      { id: "pitfall-11", t: "c", q: "The police ___ investigating the case.", o: ["is", "are"], a: 1, e: "police steht immer im Plural." },
      { id: "pitfall-12", t: "c", q: "I look forward to ___ from you.", o: ["hear", "hearing"], a: 1, e: "look forward to + -ing." },
      { id: "pitfall-13", t: "c", q: "He explained ___ the problem.", o: ["me", "to me"], a: 1, e: "explain something to somebody (oder: explained the problem to me)." },
      { id: "pitfall-14", t: "c", q: "___, we could meet next week – it's not certain yet. (= eventuell)", o: ["Eventually", "Possibly"], a: 1, e: "eventuell = possibly/maybe; eventually = schließlich, am Ende." },
      { id: "pitfall-15", t: "c", q: "Welcher Satz ist korrekt?", o: ["I like very much football.", "I like football very much."], a: 1, e: "Kein Adverb zwischen Verb und Objekt: like football very much." },
    ],
  },
];
