// Subject "Programmieren": Java cheat sheet for Programmiertechnik (HNU WS 2026/27,
// LV1–LV3 + Goll/Heinisch Kap. 1 & 3). Same format as datenbanken.js.

export default {
  links: [
    { t: "W3Schools Java – kurze Lektionen mit „Try it Yourself“", u: "https://www.w3schools.com/java/default.asp" },
    { t: "dev.java – offizielle Java-Tutorials", u: "https://dev.java/learn/" },
    { t: "JDoodle – Java-Einsteigerkurs & Online-Compiler", u: "https://www.jdoodle.com/tutorials/java-module/java-beginner" },
    { t: "OnlineGDB – Java direkt im Browser ausführen (auch mit Scanner-Eingabe)", u: "https://www.onlinegdb.com/online_java_compiler" },
    { t: "Java ist auch eine Insel (Ullenboom) – Openbook", u: "https://openbook.rheinwerk-verlag.de/javainsel/" },
  ],
  sections: [
    {
      id: "grundlagen",
      title: "Grundbegriffe",
      html: `
<p class="lead">Ein <b>Computer</b> verarbeitet <b>Eingabewerte</b> nach einem <b>Programm</b> (Folge von Anweisungen) zu <b>Ausgabewerten</b>. Die CPU führt die Anweisungen aus, der Hauptspeicher hält Daten und Programm – dort liegen auch deine Variablen.</p>
<div class="jflow"><span>Eingabe</span><b>→</b><span class="hl">Programm</span><b>→</b><span>Ausgabe</span></div>
<table>
<tr><th>Begriff</th><th>Bedeutung</th></tr>
<tr><td><b>Algorithmus</b></td><td>Ausführbare, <b>eindeutige</b>, <b>endliche</b> Verarbeitungsvorschrift: wandelt Eingabe- in Ausgabedaten in endlich vielen Schritten um.</td></tr>
<tr><td><b>Programm</b></td><td>Ein Algorithmus + die benötigten Daten, formuliert in einer Programmiersprache, ausführbar auf einem echten Computer.</td></tr>
<tr><td><b>Anwendung</b></td><td>Programm mit nützlicher Funktion für Anwender (Buchhaltung, Textverarbeitung, CAD …). Qualität: korrekt, vollständig, effizient.</td></tr>
</table>
<h3>Beispiel: Euklid (größter gemeinsamer Teiler)</h3>
<pre><code>solange b ≠ 0 wiederhole
    wenn a &gt; b  dann a = a - b
               sonst b = b - a
Ergebnis: a ist der ggT</code></pre>
<p>Durchgespielt mit a = 12, b = 18: (12,18) → (12,6) → (6,6) → (6,0) → <b>ggT = 6</b>.</p>
<h3>Arten von Programmiersprachen</h3>
<table>
<tr><th>Ebene</th><th>Was ist das?</th><th>Übersetzt durch</th></tr>
<tr><td>Maschinensprache</td><td>Befehlssatz des Prozessors, direkt ausführbar</td><td>–</td></tr>
<tr><td>Assembler</td><td>Maschinensprache mit Kürzeln statt Zahlen</td><td>Assembler</td></tr>
<tr><td>Höhere Sprachen</td><td>Java, C, Python … Paradigmen: imperativ, objektorientiert, funktional</td><td>Compiler / Interpreter</td></tr>
<tr><td>4GL</td><td>Business-Anwendungen, datenbank-orientiert (z. B. SQL)</td><td>–</td></tr>
</table>
<h3>Klassisches Programm vs. KI</h3>
<table>
<tr><th></th><th>Klassisches Programm</th><th>KI-Anwendung</th></tr>
<tr><td>Verhalten kommt von</td><td>Mensch schreibt Regeln (Algorithmus)</td><td>Modell lernt Parameter aus Daten</td></tr>
<tr><td>Gleiche Eingabe</td><td>immer gleiche Ausgabe</td><td>oft unterschiedliche Ausgabe</td></tr>
<tr><td>Nachvollziehbar</td><td>Schritt für Schritt</td><td>kaum, wahrscheinliche Antwort</td></tr>
<tr><td>Fehler</td><td>Bug, reproduzierbar</td><td>plausibel klingend, aber falsch</td></tr>
</table>
<p class="tip">Klassisch: <b>Regeln + Daten → Ergebnisse</b>. Maschinelles Lernen: <b>Daten + Ergebnisse → Regeln</b>.</p>`,
    },
    {
      id: "java",
      title: "Java & JVM",
      html: `
<p class="lead">Java ist <b>objektorientiert</b>: jedes Programm besteht aus <b>Klassen</b>. Eine ausführbare Klasse braucht eine Methode <code>main</code>. Java ist <b>case sensitive</b> – <code>Main</code> ≠ <code>main</code>.</p>
<h3>Vom Quelltext zur Ausführung</h3>
<div class="jflow">
<span>HelloWorld.java<small>Quellcode</small></span><b>javac →</b>
<span>HelloWorld.class<small>Bytecode</small></span><b>java →</b>
<span class="hl">JVM<small>übersetzt in Maschinencode</small></span>
</div>
<pre><code>javac HelloWorld.java    // kompilieren → erzeugt HelloWorld.class
java HelloWorld          // ausführen (ohne .class!)</code></pre>
<p>Der <b>Bytecode</b> ist die Maschinensprache eines <i>virtuellen</i> Computers. Die <b>Java Virtual Machine (JVM)</b> gibt es für jedes Betriebssystem – sie übersetzt den Bytecode zur Laufzeit in echte Maschinensprache. Darum: <b>„Write once, run anywhere“</b>.</p>
<table>
<tr><th>Vorteile der JVM</th><th>Nachteile der JVM</th></tr>
<tr><td>✅ Bytecode ist plattformunabhängig<br>✅ Sicherheit (Sandbox-Modell)</td><td>❌ langsamer als native Programme<br>❌ Plattform-Besonderheiten nur begrenzt nutzbar<br>❌ JVM muss installiert sein</td></tr>
</table>
<h3>Das Programm-Gerüst</h3>
<table>
<tr><th>Klassisch (alle Versionen) – <span style="color:var(--red)">Klausur!</span></th><th>Kurzform (ab Java 25)</th></tr>
<tr><td><pre><code>public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello, world!");
  }
}</code></pre></td><td><pre><code>void main() {
  IO.println("Hello, world!");
}</code></pre></td></tr>
</table>
<p class="warn">Die <b>klassische Form</b> musst du sicher können – sie läuft überall. Die Kurzform geht nur mit Java 25+. Der Dateiname muss zum Klassennamen passen: <code>public class HelloWorld</code> → <code>HelloWorld.java</code>.</p>
<h3>Kommentare</h3>
<pre><code>// einzeilig, bis zum Zeilenende
/* ein- oder
   mehrzeilig */</code></pre>
<p>Werden vom Compiler ignoriert. Tipp: Ideen und Konzepte erklären, nicht jede einzelne Anweisung.</p>
<h3>Werkzeuge</h3>
<ul>
<li><b>JDK</b> (Java Development Kit) = Compiler <code>javac</code> + JVM + Bibliotheken. Wir nutzen <b>Java 25 (LTS)</b>.</li>
<li><b>IntelliJ IDEA</b> = IDE: Projektverwaltung, Editor, Compiler, Debugger, Git, Plug-ins. Code liegt im <code>src</code>-Ordner, Ein-/Ausgabe im Run-Fenster.</li>
<li>Alle 6 Monate eine neue Java-Version, alle 2 Jahre eine <b>LTS</b>-Version (Long-Term Support).</li>
</ul>`,
    },
    {
      id: "variablen",
      title: "Variablen & Datentypen",
      html: `
<p class="lead">Eine <b>Variable</b> ist ein benannter Speicherplatz mit veränderbarem Wert. Jede Variable hat einen <b>Datentyp</b> – der legt <b>Wertebereich</b> und erlaubte <b>Operationen</b> fest.</p>
<div class="jvars">
<div><span class="box">5</span><code>x</code><small>int</small></div>
<div><span class="box">4.0</span><code>r</code><small>double</small></div>
<div><span class="box">'A'</span><code>buchstabe</code><small>char</small></div>
<div><span class="box">true</span><code>fertig</code><small>boolean</small></div>
</div>
<pre><code>int x = 5;                 // Typ  Name = Wert;
double r = 4.0;
char buchstabe = 'A';      // char: einfache Anführungszeichen
boolean fertig = true;
String name = "Susi";      // String: doppelte Anführungszeichen, KEIN primitiver Typ
double k = 1000.0, z = 4.0;  // mehrere auf einmal
int anzahl;                // nur deklarieren …
anzahl = 3;                // … später Wert zuweisen</code></pre>
<p>Regel: <b>Vor der ersten Verwendung deklarieren</b> (Name + Typ, ggf. Startwert).</p>
<h3>Die 8 primitiven Datentypen</h3>
<table>
<tr><th>Typ</th><th>Wertebereich</th><th>Wofür?</th></tr>
<tr><td><code>byte</code></td><td>-128 … 127</td><td>sehr kleine Ganzzahlen</td></tr>
<tr><td><code>short</code></td><td>-32.768 … 32.767</td><td>kleine Ganzzahlen</td></tr>
<tr><td><code>int</code></td><td>ca. ±2,1 Milliarden</td><td><b>Standard für Ganzzahlen</b></td></tr>
<tr><td><code>long</code></td><td>ca. ±9,2 · 10<sup>18</sup></td><td>sehr große Ganzzahlen</td></tr>
<tr><td><code>float</code></td><td>±3,4 · 10<sup>38</sup> (ungenauer)</td><td>Kommazahl, selten</td></tr>
<tr><td><code>double</code></td><td>±1,8 · 10<sup>308</sup></td><td><b>Standard für Kommazahlen</b></td></tr>
<tr><td><code>boolean</code></td><td><code>true</code> / <code>false</code></td><td>Bedingungen</td></tr>
<tr><td><code>char</code></td><td>ein Unicode-Zeichen, z. B. <code>'A'</code></td><td>einzelne Zeichen</td></tr>
</table>
<p class="tip">Merkhilfe Größe: <b>byte &lt; short &lt; int &lt; long &lt; float &lt; double</b>. Kommazahlen in Java immer mit <b>Punkt</b>: <code>4.0</code>, nicht <code>4,0</code>.</p>
<h3>Konstanten</h3>
<ul>
<li><b>Literale</b> = feste Werte im Code: <code>-5</code>, <code>1.23</code>, <code>'A'</code>, <code>"1 Jahr: k="</code>, <code>true</code>. Ihr Typ ist automatisch klar: <code>1.23</code> ist <code>double</code>, <code>'A'</code> ist <code>char</code>, <code>5</code> ist <code>int</code>.</li>
<li>Mit <code>final</code> wird eine Variable unveränderlich: <code>final int MAX = 10;</code> – ein späteres <code>MAX = 11;</code> gibt einen Compilerfehler.</li>
</ul>
<h3>Anweisungen &amp; Blöcke</h3>
<ul>
<li><b>Anweisung</b> = ein Programmschritt, endet mit <code>;</code>. Wird der Reihe nach ausgeführt.</li>
<li><b>Block</b> = Anweisungen in <code>{ }</code>. Eine Variable, die im Block deklariert wird, gilt <b>nur in diesem Block</b> (lokale Variable).</li>
</ul>
<pre><code>{
  int i = 5;
}
System.out.println(i);   // FEHLER: i gibt es hier nicht mehr</code></pre>`,
    },
    {
      id: "operatoren",
      title: "Operatoren",
      html: `
<p class="lead">Ein <b>Ausdruck</b> verknüpft Variablen, Konstanten und Methodenaufrufe mit Operatoren und hat immer einen <b>Ergebniswert</b>. Punkt vor Strich gilt, Klammern ändern die Reihenfolge.</p>
<table>
<tr><th>Operator</th><th>Bedeutung</th><th>Beispiel → Ergebnis</th></tr>
<tr><td><code>=</code></td><td>Zuweisung (rechts wird nach links gespeichert)</td><td><code>k = k * q;</code></td></tr>
<tr><td><code>+ - * /</code></td><td>Grundrechenarten</td><td><code>1.0 + 4.0 / 100.0</code> → <code>1.04</code></td></tr>
<tr><td><code>%</code></td><td>Modulo = Rest der Division</td><td><code>7 % 2</code> → <code>1</code></td></tr>
<tr><td><code>++</code> / <code>--</code></td><td>um 1 erhöhen / verringern</td><td><code>n++;</code> ist <code>n = n + 1;</code></td></tr>
<tr><td><code>+= -= *= /=</code></td><td>Kurzform</td><td><code>k *= q;</code> ist <code>k = k * q;</code></td></tr>
<tr><td><code>+</code> mit String</td><td>Text verketten</td><td><code>"k=" + 1040.0</code> → <code>"k=1040.0"</code></td></tr>
</table>
<p class="warn"><b>Ganzzahl-Division!</b> <code>7 / 2</code> ergibt <code>3</code> (nicht 3.5), weil beide Werte <code>int</code> sind. Lösung: <code>7.0 / 2</code> → <code>3.5</code>. Genauso: <code>r / 100</code> mit <code>int r = 4</code> ergibt <code>0</code>!</p>
<h3>Gerade oder ungerade?</h3>
<pre><code>if (zahl % 2 == 0) {
    System.out.println(zahl + " ist gerade");
} else {
    System.out.println(zahl + " ist ungerade");
}</code></pre>
<h3>Beispiel aus der Vorlesung: Zinsen</h3>
<pre><code>public class Verzinsung {
  public static void main(String[] args) {
    double k = 1000.0, r = 4.0;    // Kapital, Zinssatz
    double q = 1.0 + r / 100.0;    // Aufzinsungsfaktor 1.04
    k = k * q;                     // k nach einem Jahr
    System.out.println("1 Jahr: k=" + k);   // 1 Jahr: k=1040.0
  }
}</code></pre>
<p class="tip">Vorsicht bei Strings: <code>"Summe: " + 2 + 3</code> → <code>"Summe: 23"</code>, aber <code>"Summe: " + (2 + 3)</code> → <code>"Summe: 5"</code>. Es wird von links nach rechts gerechnet.</p>`,
    },
    {
      id: "casting",
      title: "Type Casting",
      html: `
<p class="lead"><b>Casting</b> = einen Wert in einen anderen Datentyp umwandeln.</p>
<table>
<tr><th>Automatisch (Widening)</th><th>Manuell (Narrowing)</th></tr>
<tr><td>klein → groß, kein Datenverlust<br><code>byte → short → int → long → float → double</code></td><td>groß → klein, mit <b>Klammern + Zieltyp</b><br><code>double → float → long → int → short → byte</code></td></tr>
<tr><td><pre><code>int i = 9;
double d = i;   // 9.0</code></pre></td><td><pre><code>double d = 9.78;
int i = (int) d;   // 9</code></pre></td></tr>
</table>
<p class="warn">Der Cast nach <code>int</code> <b>schneidet ab</b>, er rundet nicht! <code>(int) 7.8</code> → <code>7</code>. Runden geht mit <code>Math.round(7.8)</code> → <code>8</code>.</p>
<h3>Übung Paketgewicht</h3>
<pre><code>double gewicht = 7.8;
System.out.println("Gewicht: " + gewicht);   // Gewicht: 7.8
int kilo = (int) gewicht;
System.out.println("Kilo: " + kilo);         // Kilo: 7</code></pre>
<h3>Halbe Äpfel?</h3>
<pre><code>int anzahlAepfel = 5;
anzahlAepfel += 3;              // 8
anzahlAepfel += 1.5;            // geht (+= castet heimlich) → 9, die 0.5 sind weg!
// anzahlAepfel = anzahlAepfel + 1.5;   // FEHLER: double passt nicht in int
double aepfel = 8;              // besser: gleich double nehmen
aepfel += 1.5;                  // 9.5</code></pre>
<h3>Text → Zahl</h3>
<pre><code>int a = Integer.parseInt("42");
double b = Double.parseDouble("2.5");</code></pre>`,
    },
    {
      id: "io",
      title: "Ein- & Ausgabe",
      html: `
<h3>Ausgabe</h3>
<pre><code>System.out.println("Hallo");    // mit Zeilenumbruch danach
System.out.print("Name: ");     // ohne Zeilenumbruch
int i = 1; double k = 1000.0;
System.out.println(i + ". Jahr: k=" + k);   // 1. Jahr: k=1000.0</code></pre>
<p>Sobald ein Operand ein <code>String</code> ist, wird <code>+</code> zum Verketten.</p>
<h3>Eingabe mit Scanner (alle Java-Versionen)</h3>
<pre><code>import java.util.Scanner;           // ganz oben, vor der Klasse

public class Zinsrechner {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    System.out.print("Kapital: ");
    double k = sc.nextDouble();
    System.out.print("Zinssatz in %: ");
    double r = sc.nextDouble();
    k = k * (1 + r / 100);
    System.out.println("1 Jahr: k=" + k);
  }
}</code></pre>
<table>
<tr><th>Methode</th><th>liefert</th></tr>
<tr><td><code>sc.nextLine()</code></td><td>ganze Zeile als <code>String</code></td></tr>
<tr><td><code>sc.next()</code></td><td>ein Wort als <code>String</code></td></tr>
<tr><td><code>sc.nextInt()</code></td><td><code>int</code></td></tr>
<tr><td><code>sc.nextDouble()</code></td><td><code>double</code> (je nach Spracheinstellung <code>2,5</code> oder <code>2.5</code> eingeben)</td></tr>
</table>
<h3>Eingabe mit IO (ab Java 25)</h3>
<pre><code>String name = IO.readln("Name: ");
int alter = Integer.parseInt(IO.readln("Alter: "));
IO.println("Hallo " + name);</code></pre>
<p><code>IO</code> braucht keinen Import, kann aber nur <code>print</code>, <code>println</code>, <code>readln</code>. <code>readln</code> liefert immer einen <code>String</code>. In Lehrbüchern und altem Code findest du fast immer den Scanner.</p>`,
    },
    {
      id: "logik",
      title: "Boolesche Logik",
      html: `
<p class="lead">Bedingungen sind <b>boolesche Ausdrücke</b> (nach George Boole) – ihr Ergebnis ist immer <code>true</code> oder <code>false</code>.</p>
<h3>Vergleichsoperatoren</h3>
<table>
<tr><th>Operator</th><th>Bedeutung</th><th>Beispiel</th></tr>
<tr><td><code>==</code></td><td>gleich</td><td><code>note == 1</code></td></tr>
<tr><td><code>!=</code></td><td>ungleich</td><td><code>b != 0</code></td></tr>
<tr><td><code>&gt;</code> <code>&gt;=</code></td><td>größer (gleich)</td><td><code>akku &gt;= 50</code></td></tr>
<tr><td><code>&lt;</code> <code>&lt;=</code></td><td>kleiner (gleich)</td><td><code>jahr &lt; 1972</code></td></tr>
<tr><td><code>a.equals(b)</code></td><td>Objekte / <b>Strings</b> vergleichen</td><td><code>name.equals("John")</code></td></tr>
</table>
<p class="warn"><code>=</code> ist Zuweisung, <code>==</code> ist Vergleich. Und Strings <b>nie</b> mit <code>==</code> vergleichen, immer mit <code>equals</code>: <code>antwort.equals("j")</code>.</p>
<h3>Logische Operatoren</h3>
<table>
<tr><th>Operator</th><th>Name</th><th>ist true, wenn …</th></tr>
<tr><td><code>&amp;&amp;</code></td><td>UND (AND)</td><td><b>beide</b> true sind</td></tr>
<tr><td><code>||</code></td><td>ODER (OR)</td><td><b>mindestens einer</b> true ist</td></tr>
<tr><td><code>!</code></td><td>NICHT (NOT)</td><td>der Wert false ist (dreht um)</td></tr>
</table>
<h3>Wahrheitstabelle</h3>
<table class="jtruth">
<tr><th>a</th><th>b</th><th>a &amp;&amp; b</th><th>a || b</th><th>!a</th></tr>
<tr><td>false</td><td>false</td><td>false</td><td>false</td><td>true</td></tr>
<tr><td>false</td><td>true</td><td>false</td><td>true</td><td>true</td></tr>
<tr><td>true</td><td>false</td><td>false</td><td>true</td><td>false</td></tr>
<tr><td>true</td><td>true</td><td>true</td><td>true</td><td>false</td></tr>
</table>
<pre><code>boolean isOldie = jahr &lt; 1972;
boolean erwachsenMitTicket = alter &gt;= 18 &amp;&amp; hatTicket;
boolean frei = alter &lt; 6 || alter &gt;= 100;</code></pre>
<h3>De Morgan’sche Regeln</h3>
<p>Ein <code>!</code> vor einer Klammer dreht <code>&amp;&amp;</code> und <code>||</code> um – und verneint jeden Teil:</p>
<div class="jrule"><code>!(a || b)</code><b>=</b><code>!a &amp;&amp; !b</code></div>
<div class="jrule"><code>!(a &amp;&amp; b)</code><b>=</b><code>!a || !b</code></div>
<p>Auch Vergleiche drehen sich: <code>!(alter &lt; 18)</code> ist <code>alter &gt;= 18</code>, <code>!(x == 5)</code> ist <code>x != 5</code>.</p>
<pre><code>if (!(alter &lt; 18 || !hatTicket)) { ... }   // schwer lesbar
if (alter &gt;= 18 &amp;&amp; hatTicket) { ... }       // gleich, gut lesbar</code></pre>
<p>Beweis per Wahrheitstabelle (Regel 1):</p>
<table class="jtruth">
<tr><th>a</th><th>b</th><th>a || b</th><th class="eq">!(a || b)</th><th>!a</th><th>!b</th><th class="eq">!a &amp;&amp; !b</th></tr>
<tr><td>false</td><td>false</td><td>false</td><td class="eq">true</td><td>true</td><td>true</td><td class="eq">true</td></tr>
<tr><td>false</td><td>true</td><td>true</td><td class="eq">false</td><td>true</td><td>false</td><td class="eq">false</td></tr>
<tr><td>true</td><td>false</td><td>true</td><td class="eq">false</td><td>false</td><td>true</td><td class="eq">false</td></tr>
<tr><td>true</td><td>true</td><td>true</td><td class="eq">false</td><td>false</td><td>false</td><td class="eq">false</td></tr>
</table>
<p>Regel 2 genauso: <code>!(a &amp;&amp; b)</code> und <code>!a || !b</code> sind nur bei a = b = true <code>false</code>, sonst <code>true</code>. Zwei Ausdrücke sind gleichwertig, wenn sie für <b>jede</b> Belegung denselben Wert haben.</p>`,
    },
    {
      id: "verzweigungen",
      title: "if & switch",
      html: `
<p class="lead"><b>Kontrollstrukturen</b> bestimmen die Reihenfolge der Anweisungen: <b>Sequenz</b> (nacheinander), <b>Verzweigung</b> (wenn … dann … sonst), <b>Schleife</b> (wiederholen) und <b>Routine</b> (Methode aufrufen).</p>
<h3>if</h3>
<pre><code>if (bedingung) {
    // nur wenn bedingung true ist
}</code></pre>
<h3>if – else</h3>
<pre><code>if (zahl % 2 == 0) {
    System.out.println("gerade");
} else {
    System.out.println("ungerade");   // wenn die Bedingung false ist
}</code></pre>
<h3>if – else if – else</h3>
<pre><code>int akku = sc.nextInt();
if (akku &gt;= 50) {
    System.out.println("OK");
} else if (akku &gt;= 20) {           // wird nur geprüft, wenn akku &lt; 50
    System.out.println("Bald laden");
} else {
    System.out.println("Akku fast leer");
}</code></pre>
<p class="tip">Es wird von oben nach unten geprüft, <b>nur der erste passende Zweig</b> läuft. Darum große Grenzen zuerst. Und auf die Grenzen achten: ist 50 schon „OK“? → <code>&gt;=</code> statt <code>&gt;</code>.</p>
<h3>switch</h3>
<pre><code>int note = sc.nextInt();
switch (note) {
    case 1:
        System.out.println("sehr gut");
        break;                 // ohne break läuft es in den nächsten case weiter!
    case 2:
        System.out.println("gut");
        break;
    case 3:
        System.out.println("befriedigend");
        break;
    case 4:
        System.out.println("ausreichend");
        break;
    case 5:
        System.out.println("mangelhaft");
        break;
    case 6:
        System.out.println("ungenügend");
        break;
    default:                   // alle anderen Werte
        System.out.println("keine gültige Note");
}</code></pre>
<h3>Wann was?</h3>
<table>
<tr><th></th><th>if / else if / else</th><th>switch</th></tr>
<tr><td>Prüft</td><td>beliebige Bedingungen: Bereiche (<code>&gt;=</code>), <code>&amp;&amp;</code>, <code>||</code>, <code>equals</code></td><td>einen Wert auf <b>genaue Gleichheit</b> (<code>int</code>, <code>char</code>, <code>String</code>)</td></tr>
<tr><td>✅ Vorteil</td><td>flexibel, für Bereiche wie „ab 50“</td><td>übersichtlich bei vielen festen Fällen</td></tr>
<tr><td>❌ Nachteil</td><td>bei vielen Fällen lange Ketten</td><td>keine Bereiche; <code>break</code> vergessen = Fehler</td></tr>
<tr><td>Beispiel</td><td>Akku-Ampel, Eintrittspreis nach Alter</td><td>Wochentag 1–7, Note 1–6</td></tr>
</table>
<h3>Übung Eintrittspreis</h3>
<pre><code>int alter = sc.nextInt();
String student = sc.next();          // "j" oder "n"
int preis;
if (alter &lt; 6) {
    preis = 0;
} else if (alter &lt;= 17) {
    preis = 5;
} else if (alter &gt;= 65) {
    preis = 7;
} else {
    preis = 10;
}
if (student.equals("j") &amp;&amp; preis &gt; 0) {
    preis -= 2;                      // Rabatt nur, wenn nicht ohnehin frei
}
System.out.println("Preis: " + preis + " €");</code></pre>`,
    },
    {
      id: "arrays",
      title: "Arrays",
      html: `
<p class="lead">Ein <b>Array</b> (Feld) speichert <b>mehrere Werte vom gleichen Datentyp</b> unter einem Namen. Zugriff über den <b>Index, der bei 0 beginnt</b>. Die Größe ist <b>fest</b>.</p>
<div class="jarr">
<div class="jarr-name"><code>String[] vorNamen</code></div>
<div class="jarr-row">
<div><small>Index 0</small><span>"Susi"</span></div>
<div><small>Index 1</small><span>"Rudi"</span></div>
<div><small>Index 2</small><span>"Jose"</span></div>
<div><small>Index 3</small><span>"Jan"</span></div>
</div>
<p class="muted">vorNamen.length = 4 · erster Index 0 · letzter Index length - 1 = 3</p>
</div>
<h3>Anlegen</h3>
<pre><code>// 1) mit festen Werten
String[] vorNamen = {"Susi", "Rudi", "Jose", "Jan"};
int[] schritte = {4200, 10300, 8100, 12500, 6000};
double[] einzahlungen = {2.5, 4.0, 1.5};

// 2) mit fester Größe, dann einzeln befüllen
String[] nachNamen = new String[4];
nachNamen[0] = "Sorglos";
nachNamen[1] = "Rüssel";</code></pre>
<h3>Zugreifen</h3>
<pre><code>System.out.println(vorNamen[0]);       // Susi  (erstes Element)
System.out.println(vorNamen[1]);       // Rudi  (zweites Element!)
vorNamen[3] = "Mary";                  // überschreiben
System.out.println(vorNamen.length);   // 4  (ohne Klammern!)
System.out.println(vorNamen[vorNamen.length - 1]);   // letztes Element</code></pre>
<table>
<tr><th>Neues Array mit <code>new</code> – Startwerte</th><th></th></tr>
<tr><td><code>int</code>, <code>double</code> …</td><td><code>0</code> bzw. <code>0.0</code></td></tr>
<tr><td><code>boolean</code></td><td><code>false</code></td></tr>
<tr><td><code>String</code> / Objekte</td><td><code>null</code></td></tr>
</table>
<p class="warn"><code>vorNamen[4]</code> bei 4 Elementen → <b>ArrayIndexOutOfBoundsException</b>. Der letzte gültige Index ist immer <code>length - 1</code>.</p>
<table>
<tr><th>✅ Vorteile</th><th>❌ Nachteile</th></tr>
<tr><td>viele Werte unter einem Namen<br>schneller Zugriff über den Index<br>perfekt für Schleifen</td><td>Größe fest, nicht nachträglich änderbar<br>nur ein Datentyp<br>Index-Fehler bei falscher Grenze</td></tr>
</table>
<h3>Übung Kaffeekasse</h3>
<pre><code>double[] einzahlungen = {2.5, 4.0, 1.5};
double summe = einzahlungen[0] + einzahlungen[1] + einzahlungen[2];
System.out.println("Anzahl: " + einzahlungen.length);   // Anzahl: 3
System.out.println("Summe: " + summe);                  // Summe: 8.0</code></pre>
<p>Mit Schleife geht das für beliebig lange Arrays – siehe <b>Schleifen</b>.</p>`,
    },
    {
      id: "schleifen",
      title: "Schleifen",
      html: `
<p class="lead">Eine <b>Schleife</b> wiederholt Anweisungen, solange eine Bedingung <code>true</code> ist. Die Bedingung wird <b>vor</b> oder <b>nach</b> jedem Durchlauf geprüft.</p>
<div class="jloops">
<div>
<h3>while</h3>
<p class="muted">vorprüfend / abweisend</p>
<pre><code>int n = 0;
while (n &lt; 2) {
    System.out.println(n);
    n++;
}
// 0 1</code></pre>
<p>Erst prüfen, dann ausführen. Läuft evtl. <b>gar nicht</b>.</p>
</div>
<div>
<h3>do … while</h3>
<p class="muted">nachprüfend / annehmend</p>
<pre><code>int n = 0;
do {
    System.out.println(n);
    n++;
} while (n &lt; 2);   // ; nicht vergessen!
// 0 1</code></pre>
<p>Erst ausführen, dann prüfen. Läuft <b>mindestens 1-mal</b>.</p>
</div>
<div>
<h3>for</h3>
<p class="muted">Zählschleife</p>
<pre><code>for (int i = 0; i &lt; n; i++) {
    k = k * q;
}</code></pre>
<p><code>for (Start; Bedingung; Schritt)</code><br>Start: 1× zu Beginn · Bedingung: vor jedem Durchlauf · Schritt: nach jedem Durchlauf.</p>
</div>
<div>
<h3>for-each</h3>
<p class="muted">für Arrays</p>
<pre><code>for (String c : cars) {
    System.out.println(c);
}</code></pre>
<p>Lies: „für jedes <code>c</code> in <code>cars</code>“. Kein Index nötig.</p>
</div>
</div>
<h3>Vergleich: Wann welche Schleife?</h3>
<table>
<tr><th>Schleife</th><th>Nimm sie, wenn …</th><th>✅ Vorteil</th><th>❌ Nachteil</th></tr>
<tr><td><code>while</code></td><td>du <b>nicht weißt, wie oft</b> – „bis ein Ziel erreicht ist“</td><td>flexibel, läuft 0-mal wenn nötig</td><td>Zähler selbst hochzählen; vergessen = Endlosschleife</td></tr>
<tr><td><code>do-while</code></td><td>der Block <b>mindestens einmal</b> laufen muss (z. B. Eingabe abfragen, bis sie gültig ist)</td><td>garantiert ein Durchlauf</td><td>selten nötig; Bedingung steht unten</td></tr>
<tr><td><code>for</code></td><td>die <b>Anzahl feststeht</b> („n Jahre“) oder du den Index brauchst</td><td>alles in einer Zeile, kompakt</td><td>Off-by-one-Fehler (<code>&lt;</code> vs. <code>&lt;=</code>)</td></tr>
<tr><td><code>for-each</code></td><td>du <b>jedes Element</b> eines Arrays nur lesen willst</td><td>am kürzesten, kein Index-Fehler möglich</td><td>kein Index, Array-Werte nicht änderbar, immer alle Elemente</td></tr>
</table>
<h3>Beispiel: Wie viele Jahre bis 10.000 €? → while</h3>
<pre><code>double k = 1000.0, q = 1.04;
int jahre = 0;
while (k &lt; 10000) {
    k = k * q;
    jahre++;
}
System.out.println(jahre + " Jahre");   // 59 Jahre</code></pre>
<h3>Beispiel: Kapital nach 5 Jahren? → for</h3>
<pre><code>double k = 2000.0, q = 1.03;
for (int i = 0; i &lt; 5; i++) {
    k = k * q;
}
System.out.println(k);    // ≈ 2318.55</code></pre>
<h3>Array mit Index durchlaufen</h3>
<pre><code>String[] cars = {"Volvo", "BMW", "Ford", "Mazda"};
for (int i = 0; i &lt; cars.length; i++) {      // &lt; length, NICHT &lt;=
    System.out.println(i + ": " + cars[i]);
}</code></pre>
<h3>Typische Muster</h3>
<pre><code>// Zählen: an wie vielen Tagen ≥ 10000 Schritte?
int tage = 0;
for (int s : schritte) {
    if (s &gt;= 10000) {
        tage++;
    }
}

// Summe &amp; Durchschnitt
double summe = 0;
for (double e : einzahlungen) {
    summe += e;
}
double schnitt = summe / einzahlungen.length;

// Maximum suchen
int max = zahlen[0];
for (int z : zahlen) {
    if (z &gt; max) max = z;
}

// gerade / ungerade ausgeben
for (int z : zahlen) {
    if (z % 2 == 0) System.out.println(z + " ist gerade");
    else            System.out.println(z + " ist ungerade");
}</code></pre>
<p class="warn"><b>Endlosschleife:</b> Wenn sich in der Schleife nichts an der Bedingung ändert (z. B. <code>n++</code> vergessen), hört sie nie auf.</p>`,
    },
    {
      id: "fehler",
      title: "Typische Fehler",
      html: `
<p class="lead">Checkliste für Moodle-Tests und die Klausur (im EDV-Labor, <b>ohne Internet</b>).</p>
<table>
<tr><th>Fehler</th><th>Richtig</th></tr>
<tr><td><code>System.out.println("Hallo")</code></td><td>Semikolon vergessen → <code>…("Hallo");</code></td></tr>
<tr><td><code>system.out.Println</code></td><td>Java ist case sensitive: <code>System.out.println</code></td></tr>
<tr><td><code>if (x = 5)</code></td><td><code>if (x == 5)</code></td></tr>
<tr><td><code>if (name == "Susi")</code></td><td><code>if (name.equals("Susi"))</code></td></tr>
<tr><td><code>double r = 4,0;</code></td><td><code>double r = 4.0;</code></td></tr>
<tr><td><code>7 / 2</code> soll 3.5 sein</td><td><code>7.0 / 2</code></td></tr>
<tr><td><code>(int) 7.8</code> soll 8 sein</td><td>Cast schneidet ab → <code>Math.round(7.8)</code></td></tr>
<tr><td><code>for (int i = 0; i &lt;= arr.length; i++)</code></td><td><code>i &lt; arr.length</code></td></tr>
<tr><td><code>arr.length()</code></td><td><code>arr.length</code> (bei Arrays ohne Klammern; bei Strings <code>text.length()</code>)</td></tr>
<tr><td><code>char c = "A";</code></td><td><code>char c = 'A';</code> – char in einfachen Anführungszeichen</td></tr>
<tr><td><code>switch</code> ohne <code>break</code></td><td>nach jedem <code>case</code> ein <code>break;</code></td></tr>
<tr><td><code>} while (n &lt; 2)</code></td><td>bei do-while Semikolon am Ende: <code>} while (n &lt; 2);</code></td></tr>
<tr><td>Scanner ohne Import</td><td><code>import java.util.Scanner;</code> ganz oben</td></tr>
</table>
<h3>Wiederholungsfragen aus der Vorlesung</h3>
<ul>
<li>Was ist ein Computer, was ist ein Algorithmus, welche Arten von Programmiersprachen gibt es?</li>
<li>Was ist die JVM? Vorteile und Nachteile? Wie erstellt und startet man ein Java-Programm?</li>
<li>Was sind Variablen und Konstanten? Wie deklariert man sie?</li>
<li>Wie definiert man ein Array und greift auf Elemente zu?</li>
<li>Was sind boolesche Ausdrücke? Wie sind <code>&amp;&amp;</code>, <code>||</code>, <code>!</code> definiert? Was sagen die De Morgan’schen Regeln?</li>
<li>Welche Kontrollstrukturen gibt es? Wie schreibt man Verzweigungen und Schleifen?</li>
<li>Wie iteriert man elementweise über ein Array?</li>
</ul>`,
    },
  ],
};
