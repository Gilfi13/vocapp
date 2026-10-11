// Subject "Datenbanken": MySQL cheat sheet. Each section is shown as its own block
// with a jump chip at the top of the page.

export default {
  links: [
    { t: "SQL Island – SQL lernen als Spiel (Deutsch)", u: "https://sql-island.informatik.uni-kl.de" },
    { t: "SQLBolt – interaktive Lektionen", u: "https://sqlbolt.com" },
    { t: "SQLZoo – Übungsaufgaben nach Thema", u: "https://sqlzoo.net" },
    { t: "SQL Murder Mystery – Kriminalfall mit SQL lösen", u: "https://mystery.knightlab.com" },
    { t: "DB Fiddle – MySQL direkt im Browser ausprobieren", u: "https://www.db-fiddle.com" },
    { t: "MySQL-Referenzhandbuch", u: "https://dev.mysql.com/doc/refman/8.0/en/" },
  ],
  sections: [
    {
      id: "basics",
      title: "Grundgerüst",
      html: `
<p class="lead">Jede Abfrage folgt diesem Gerüst. Nur <code>SELECT</code> und <code>FROM</code> sind Pflicht, die Reihenfolge der Klauseln ist fest.</p>
<pre><code>SELECT   spalte1, AVG(spalte2)    -- welche Spalten
FROM     tabelle                  -- aus welcher Tabelle
JOIN     andere ON ...            -- weitere Tabellen verknüpfen
WHERE    bedingung                -- Zeilen filtern (vor dem Gruppieren)
GROUP BY spalte1                  -- Gruppen bilden
HAVING   AVG(spalte2) &gt; 10        -- Gruppen filtern
ORDER BY spalte1 DESC             -- sortieren
LIMIT    10;                      -- Anzahl begrenzen</code></pre>
<p>Ausgeführt wird in einer anderen Reihenfolge: <b>FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</b>. Deshalb kann <code>WHERE</code> keinen Alias aus <code>SELECT</code> benutzen, <code>ORDER BY</code> aber schon.</p>
<table>
<tr><th>Gruppe</th><th>Bedeutung</th><th>Befehle</th></tr>
<tr><td>DQL</td><td>Daten abfragen</td><td><code>SELECT</code></td></tr>
<tr><td>DML</td><td>Daten ändern</td><td><code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code></td></tr>
<tr><td>DDL</td><td>Struktur definieren</td><td><code>CREATE</code>, <code>ALTER</code>, <code>DROP</code>, <code>TRUNCATE</code></td></tr>
<tr><td>DCL / TCL</td><td>Rechte und Transaktionen</td><td><code>GRANT</code>, <code>REVOKE</code>, <code>COMMIT</code>, <code>ROLLBACK</code></td></tr>
</table>
<h3>Datenbank auswählen (MySQL)</h3>
<pre><code>SHOW DATABASES;               -- alle Datenbanken
CREATE DATABASE uni;
USE uni;                      -- mit dieser Datenbank arbeiten
SHOW TABLES;                  -- alle Tabellen
DESCRIBE studenten;           -- Spalten einer Tabelle (kurz: DESC)
DROP DATABASE uni;</code></pre>`,
    },
    {
      id: "select",
      title: "Abfragen",
      html: `
<p class="lead">Mit <code>SELECT</code> liest du Spalten aus, mit <code>WHERE</code> filterst du Zeilen.</p>
<pre><code>SELECT * FROM studenten;                          -- alle Spalten
SELECT name, jahre FROM studenten;                -- bestimmte Spalten
SELECT DISTINCT stadt FROM studenten;             -- ohne Duplikate
SELECT name AS student FROM studenten;            -- Alias
SELECT name, note * 10 AS punkte FROM pruefungen; -- rechnen

SELECT * FROM studenten WHERE jahre &gt;= 21 AND stadt = 'Berlin';
SELECT * FROM studenten ORDER BY nachname ASC, jahre DESC;
SELECT * FROM studenten LIMIT 5;                  -- erste 5 Zeilen
SELECT * FROM studenten LIMIT 10, 5;              -- 5 Zeilen ab Zeile 11
SELECT * FROM studenten LIMIT 5 OFFSET 10;        -- dasselbe</code></pre>
<table>
<tr><th>Operator</th><th>Bedeutung</th><th>Beispiel</th></tr>
<tr><td><code>=</code>, <code>&lt;&gt;</code> / <code>!=</code></td><td>gleich, ungleich</td><td><code>stadt &lt;&gt; 'Berlin'</code></td></tr>
<tr><td><code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code></td><td>Vergleich</td><td><code>jahre &gt;= 18</code></td></tr>
<tr><td><code>AND</code>, <code>OR</code>, <code>NOT</code></td><td>logisch verknüpfen</td><td><code>jahre &gt; 18 AND NOT stadt = 'Bonn'</code></td></tr>
<tr><td><code>BETWEEN a AND b</code></td><td>Bereich, Grenzen inklusive</td><td><code>note BETWEEN 1.0 AND 2.0</code></td></tr>
<tr><td><code>IN (...)</code></td><td>einer von mehreren Werten</td><td><code>stadt IN ('Berlin', 'Hamburg')</code></td></tr>
<tr><td><code>LIKE</code></td><td>Muster: <code>%</code> = beliebig viele Zeichen, <code>_</code> = genau eins</td><td><code>name LIKE 'M%'</code></td></tr>
<tr><td><code>REGEXP</code></td><td>regulärer Ausdruck (MySQL)</td><td><code>name REGEXP '^[AB]'</code></td></tr>
<tr><td><code>IS NULL</code>, <code>IS NOT NULL</code></td><td>Wert fehlt / ist vorhanden</td><td><code>email IS NULL</code></td></tr>
</table>
<h3>Nützliche Funktionen</h3>
<ul>
<li>Text: <code>CONCAT(a, ' ', b)</code>, <code>UPPER()</code>, <code>LOWER()</code>, <code>LENGTH()</code>, <code>SUBSTRING(s, start, länge)</code>, <code>TRIM()</code>, <code>REPLACE()</code></li>
<li>Zahlen: <code>ROUND(x, 2)</code>, <code>ABS()</code>, <code>CEIL()</code>, <code>FLOOR()</code>, <code>MOD(a, b)</code>, <code>a DIV b</code> (ganzzahlig)</li>
<li>Datum: <code>NOW()</code>, <code>CURDATE()</code>, <code>YEAR(datum)</code>, <code>MONTH()</code>, <code>DATEDIFF(a, b)</code>, <code>DATE_ADD(datum, INTERVAL 7 DAY)</code>, <code>DATE_FORMAT(datum, '%d.%m.%Y')</code></li>
<li>Leere Werte: <code>IFNULL(spalte, 'Ersatz')</code> oder <code>COALESCE(a, b, c)</code></li>
<li>Bedingung kurz: <code>IF(note &lt;= 4, 'bestanden', 'durchgefallen')</code></li>
</ul>`,
    },
    {
      id: "group",
      title: "Gruppieren",
      html: `
<p class="lead">Aggregatfunktionen fassen viele Zeilen zu einem Wert zusammen. Mit <code>GROUP BY</code> bekommst du einen Wert pro Gruppe.</p>
<table>
<tr><th>Funktion</th><th>Ergebnis</th></tr>
<tr><td><code>COUNT(*)</code></td><td>Anzahl Zeilen (inklusive NULL)</td></tr>
<tr><td><code>COUNT(spalte)</code></td><td>Anzahl Werte ohne NULL</td></tr>
<tr><td><code>COUNT(DISTINCT spalte)</code></td><td>Anzahl verschiedener Werte</td></tr>
<tr><td><code>SUM()</code>, <code>AVG()</code></td><td>Summe, Durchschnitt</td></tr>
<tr><td><code>MIN()</code>, <code>MAX()</code></td><td>kleinster / größter Wert</td></tr>
<tr><td><code>GROUP_CONCAT(name)</code></td><td>alle Werte einer Gruppe als Text (MySQL)</td></tr>
</table>
<pre><code>-- Anzahl Studenten und Durchschnittsalter pro Stadt,
-- nur Städte mit mehr als 10 Studenten
SELECT   stadt, COUNT(*) AS anzahl, AVG(jahre) AS schnitt
FROM     studenten
WHERE    semester &gt;= 1
GROUP BY stadt
HAVING   COUNT(*) &gt; 10
ORDER BY anzahl DESC;</code></pre>
<ul>
<li><code>WHERE</code> filtert einzelne Zeilen <b>vor</b> dem Gruppieren und darf keine Aggregatfunktionen enthalten.</li>
<li><code>HAVING</code> filtert ganze Gruppen <b>nach</b> dem Gruppieren.</li>
<li>Jede Spalte in <code>SELECT</code>, die nicht in einer Aggregatfunktion steht, muss auch in <code>GROUP BY</code> stehen (in MySQL 8 sonst Fehler wegen <code>ONLY_FULL_GROUP_BY</code>).</li>
</ul>`,
    },
    {
      id: "join",
      title: "JOINs",
      html: `
<p class="lead">Ein JOIN verknüpft Tabellen über gemeinsame Spalten, meist Fremdschlüssel = Primärschlüssel.</p>
<table>
<tr><th>JOIN-Art</th><th>Liefert</th></tr>
<tr><td><code>INNER JOIN</code> (oder nur <code>JOIN</code>)</td><td>nur Zeilen mit Treffer in beiden Tabellen</td></tr>
<tr><td><code>LEFT JOIN</code></td><td>alle Zeilen der linken Tabelle, rechts NULL ohne Treffer</td></tr>
<tr><td><code>RIGHT JOIN</code></td><td>alle Zeilen der rechten Tabelle, links NULL ohne Treffer</td></tr>
<tr><td><code>CROSS JOIN</code></td><td>jede Zeile mit jeder (kartesisches Produkt)</td></tr>
<tr><td>Self-Join</td><td>eine Tabelle mit sich selbst, über zwei Aliase</td></tr>
</table>
<div class="warn"><b>MySQL kennt kein <code>FULL OUTER JOIN</code>.</b> Stattdessen <code>LEFT JOIN … UNION … RIGHT JOIN</code> (Beispiel unten).</div>
<pre><code>-- Studenten mit ihren Noten (nur wer eine Prüfung hat)
SELECT s.name, p.fach, p.note
FROM   studenten s
JOIN   pruefungen p ON p.student_id = s.id;

-- Alle Studenten, auch ohne Prüfung
SELECT s.name, p.note
FROM   studenten s
LEFT JOIN pruefungen p ON p.student_id = s.id;

-- Studenten OHNE Prüfung
SELECT s.name
FROM   studenten s
LEFT JOIN pruefungen p ON p.student_id = s.id
WHERE  p.student_id IS NULL;

-- Drei Tabellen
SELECT s.name, v.titel
FROM   studenten s
JOIN   belegt b      ON b.student_id = s.id
JOIN   vorlesungen v ON v.id = b.vorlesung_id;

-- Self-Join: Mitarbeiter mit Chef
SELECT m.name, c.name AS chef
FROM   mitarbeiter m
LEFT JOIN mitarbeiter c ON m.chef_id = c.id;

-- FULL OUTER JOIN nachbauen
SELECT s.name, p.note FROM studenten s LEFT JOIN  pruefungen p ON p.student_id = s.id
UNION
SELECT s.name, p.note FROM studenten s RIGHT JOIN pruefungen p ON p.student_id = s.id;</code></pre>
<p>Ältere Schreibweise ohne <code>JOIN</code>: <code>SELECT … FROM studenten s, pruefungen p WHERE p.student_id = s.id;</code> ergibt dasselbe wie ein <code>INNER JOIN</code>. Haben beide Spalten denselben Namen, geht auch <code>JOIN pruefungen USING (student_id)</code>.</p>`,
    },
    {
      id: "sub",
      title: "Unterabfragen",
      html: `
<p class="lead">Eine Unterabfrage ist ein <code>SELECT</code> in Klammern innerhalb einer anderen Abfrage.</p>
<pre><code>-- Wert vergleichen: Studenten älter als der Durchschnitt
SELECT name FROM studenten
WHERE  jahre &gt; (SELECT AVG(jahre) FROM studenten);

-- Liste: Studenten, die eine Prüfung haben
SELECT name FROM studenten
WHERE  id IN (SELECT student_id FROM pruefungen);

-- Existenz (korreliert: bezieht sich auf die äußere Zeile s)
SELECT name FROM studenten s
WHERE  NOT EXISTS (SELECT 1 FROM pruefungen p WHERE p.student_id = s.id);

-- Vergleich mit allen / irgendeinem Wert
SELECT name FROM studenten
WHERE  jahre &gt; ALL (SELECT jahre FROM tutoren);   -- ANY / SOME analog

-- Unterabfrage als Tabelle in FROM (braucht in MySQL einen Alias!)
SELECT t.stadt, t.anzahl
FROM  (SELECT stadt, COUNT(*) AS anzahl FROM studenten GROUP BY stadt) AS t
WHERE  t.anzahl &gt; 5;

-- WITH (CTE, ab MySQL 8.0): Unterabfrage mit Namen
WITH schnitt AS (
  SELECT student_id, AVG(note) AS avg_note FROM pruefungen GROUP BY student_id
)
SELECT s.name, sc.avg_note
FROM   studenten s JOIN schnitt sc ON sc.student_id = s.id;</code></pre>
<h3>Mengenoperationen</h3>
<p>Beide Abfragen brauchen gleich viele Spalten mit passenden Typen.</p>
<table>
<tr><th>Operator</th><th>Ergebnis</th></tr>
<tr><td><code>UNION</code></td><td>Vereinigung ohne Duplikate</td></tr>
<tr><td><code>UNION ALL</code></td><td>Vereinigung mit Duplikaten (schneller)</td></tr>
<tr><td><code>INTERSECT</code></td><td>nur Zeilen, die in beiden vorkommen (erst ab MySQL 8.0.31)</td></tr>
<tr><td><code>EXCEPT</code></td><td>Zeilen der ersten ohne die der zweiten (erst ab MySQL 8.0.31)</td></tr>
</table>
<p>In älterem MySQL: <code>INTERSECT</code> mit <code>IN (…)</code> und <code>EXCEPT</code> mit <code>NOT IN (…)</code> bzw. <code>NOT EXISTS</code> nachbauen.</p>
<h3>CASE</h3>
<pre><code>SELECT name,
       CASE
         WHEN note &lt;= 1.5 THEN 'sehr gut'
         WHEN note &lt;= 4.0 THEN 'bestanden'
         ELSE 'nicht bestanden'
       END AS bewertung
FROM   pruefungen;</code></pre>`,
    },
    {
      id: "dml",
      title: "Daten ändern",
      html: `
<p class="lead">Mit <code>INSERT</code>, <code>UPDATE</code> und <code>DELETE</code> änderst du den Inhalt. Ohne <code>WHERE</code> treffen <code>UPDATE</code> und <code>DELETE</code> <b>alle</b> Zeilen.</p>
<pre><code>-- Einfügen
INSERT INTO studenten (name, jahre) VALUES ('Anna', 22);   -- id per AUTO_INCREMENT
INSERT INTO studenten (name, jahre) VALUES ('Ben', 24), ('Cem', 21);
INSERT INTO archiv (id, name) SELECT id, name FROM studenten WHERE jahre &gt; 30;
SELECT LAST_INSERT_ID();                                   -- zuletzt vergebene id

-- Ändern
UPDATE studenten SET jahre = 23, stadt = 'Köln' WHERE id = 1;
UPDATE pruefungen SET note = note - 0.3 WHERE fach = 'Datenbanken';

-- Löschen
DELETE FROM studenten WHERE id = 3;
DELETE FROM studenten;          -- löscht alle Zeilen!
TRUNCATE TABLE studenten;       -- leert die Tabelle schneller, setzt AUTO_INCREMENT zurück

-- MySQL: einfügen oder, falls der Schlüssel existiert, ändern
INSERT INTO studenten (id, name) VALUES (1, 'Anna')
  ON DUPLICATE KEY UPDATE name = 'Anna';</code></pre>
<div class="tip"><b>Safe Update Mode:</b> MySQL Workbench verbietet standardmäßig <code>UPDATE</code>/<code>DELETE</code> ohne <code>WHERE</code> auf einem Schlüssel. Ausschalten mit <code>SET SQL_SAFE_UPDATES = 0;</code></div>`,
    },
    {
      id: "ddl",
      title: "Tabellen",
      html: `
<p class="lead">Mit <code>CREATE TABLE</code> legst du Spalten, Datentypen und Regeln (Constraints) fest.</p>
<pre><code>CREATE TABLE studenten (
  id        INT          AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(255) UNIQUE,
  jahre     INT          CHECK (jahre &gt;= 16),
  stadt     VARCHAR(50)  DEFAULT 'Berlin',
  erstellt  DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pruefungen (
  student_id INT,
  fach       VARCHAR(50),
  note       DECIMAL(2,1),
  PRIMARY KEY (student_id, fach),                 -- zusammengesetzter Schlüssel
  FOREIGN KEY (student_id) REFERENCES studenten(id)
    ON DELETE CASCADE                             -- Prüfungen mitlöschen
);

ALTER TABLE studenten ADD semester INT;
ALTER TABLE studenten ADD COLUMN semester INT AFTER name;   -- an bestimmter Stelle
ALTER TABLE studenten DROP COLUMN stadt;
ALTER TABLE studenten MODIFY name VARCHAR(200) NOT NULL;     -- Typ ändern
ALTER TABLE studenten CHANGE name vollname VARCHAR(200);     -- umbenennen + Typ
ALTER TABLE studenten RENAME COLUMN vollname TO name;        -- nur umbenennen
ALTER TABLE pruefungen ADD CONSTRAINT fk_student
  FOREIGN KEY (student_id) REFERENCES studenten(id);
RENAME TABLE studenten TO student;

DROP TABLE studenten;
DROP TABLE IF EXISTS studenten;</code></pre>
<table>
<tr><th>Datentyp</th><th>Für</th></tr>
<tr><td><code>INT</code>, <code>BIGINT</code>, <code>TINYINT</code></td><td>ganze Zahlen</td></tr>
<tr><td><code>DECIMAL(p,s)</code></td><td>exakte Kommazahlen: p Stellen, davon s nach dem Komma (Geld, Noten)</td></tr>
<tr><td><code>FLOAT</code>, <code>DOUBLE</code></td><td>ungenaue Kommazahlen</td></tr>
<tr><td><code>CHAR(n)</code></td><td>Text fester Länge</td></tr>
<tr><td><code>VARCHAR(n)</code></td><td>Text bis n Zeichen</td></tr>
<tr><td><code>TEXT</code></td><td>langer Text</td></tr>
<tr><td><code>DATE</code>, <code>TIME</code>, <code>DATETIME</code>, <code>TIMESTAMP</code></td><td>Datum, Uhrzeit, beides</td></tr>
<tr><td><code>BOOLEAN</code></td><td>wahr / falsch (intern <code>TINYINT(1)</code>: 1 / 0)</td></tr>
<tr><td><code>ENUM('a','b')</code></td><td>genau einer aus festen Werten</td></tr>
</table>
<table>
<tr><th>Constraint</th><th>Bedeutung</th></tr>
<tr><td><code>PRIMARY KEY</code></td><td>eindeutig und nicht NULL, identifiziert die Zeile</td></tr>
<tr><td><code>FOREIGN KEY … REFERENCES</code></td><td>Wert muss in der anderen Tabelle existieren</td></tr>
<tr><td><code>NOT NULL</code></td><td>Pflichtfeld</td></tr>
<tr><td><code>UNIQUE</code></td><td>keine doppelten Werte</td></tr>
<tr><td><code>CHECK (…)</code></td><td>Bedingung muss erfüllt sein (wird erst ab MySQL 8.0.16 geprüft)</td></tr>
<tr><td><code>DEFAULT</code></td><td>Standardwert, wenn nichts angegeben ist</td></tr>
<tr><td><code>AUTO_INCREMENT</code></td><td>Zahl wird automatisch hochgezählt (MySQL)</td></tr>
</table>
<p>Optionen bei <code>ON DELETE</code> / <code>ON UPDATE</code>: <code>CASCADE</code> (mitändern), <code>SET NULL</code>, <code>RESTRICT</code> / <code>NO ACTION</code> (verbieten, Standard).</p>`,
    },
    {
      id: "more",
      title: "Views & Co.",
      html: `
<p class="lead">Views, Indizes, Transaktionen und Rechte kommen seltener vor, werden in der Klausur aber oft abgefragt.</p>
<pre><code>-- View: gespeicherte Abfrage, die man wie eine Tabelle benutzt
CREATE VIEW gute_studenten AS
  SELECT s.name, AVG(p.note) AS schnitt
  FROM studenten s JOIN pruefungen p ON p.student_id = s.id
  GROUP BY s.name
  HAVING AVG(p.note) &lt;= 2.0;
SELECT * FROM gute_studenten;
DROP VIEW gute_studenten;

-- Index: beschleunigt Suchen nach einer Spalte
CREATE INDEX idx_name ON studenten (name);
CREATE UNIQUE INDEX idx_email ON studenten (email);
DROP INDEX idx_name ON studenten;          -- MySQL: mit ON tabelle
SHOW INDEX FROM studenten;

-- Transaktion: alles oder nichts
START TRANSACTION;
UPDATE konto SET stand = stand - 100 WHERE id = 1;
UPDATE konto SET stand = stand + 100 WHERE id = 2;
COMMIT;                                    -- speichern
-- ROLLBACK;                               -- stattdessen alles zurücknehmen

-- Benutzer und Rechte
CREATE USER 'tutor'@'localhost' IDENTIFIED BY 'geheim';
GRANT SELECT, INSERT ON uni.studenten TO 'tutor'@'localhost';
GRANT ALL PRIVILEGES ON uni.* TO 'tutor'@'localhost';
REVOKE INSERT ON uni.studenten FROM 'tutor'@'localhost';
SHOW GRANTS FOR 'tutor'@'localhost';</code></pre>
<p>Transaktionen erfüllen die <b>ACID</b>-Eigenschaften: <b>A</b>tomicity (alles oder nichts), <b>C</b>onsistency (Regeln bleiben erfüllt), <b>I</b>solation (parallele Transaktionen stören sich nicht), <b>D</b>urability (nach <code>COMMIT</code> dauerhaft gespeichert).</p>
<div class="tip">MySQL speichert normalerweise jeden Befehl sofort (<code>autocommit = 1</code>). Erst <code>START TRANSACTION</code> sammelt Befehle bis <code>COMMIT</code> oder <code>ROLLBACK</code>. Transaktionen funktionieren nur mit der Speicher-Engine InnoDB (Standard).</div>`,
    },
    {
      id: "traps",
      title: "Klausurfallen",
      html: `
<p class="lead">Diese Fehler kosten in Klausuren am häufigsten Punkte.</p>
<ul>
<li><code>= NULL</code> funktioniert nie. Richtig ist <code>IS NULL</code> bzw. <code>IS NOT NULL</code>.</li>
<li>Aggregatfunktionen in <code>WHERE</code> sind verboten. Dafür gibt es <code>HAVING</code>.</li>
<li>Eine Spalte in <code>SELECT</code>, die weder in <code>GROUP BY</code> noch in einer Aggregatfunktion steht, ergibt einen Fehler.</li>
<li><code>COUNT(*)</code> zählt auch Zeilen mit NULL, <code>COUNT(spalte)</code> nicht.</li>
<li>Text in einfache Anführungszeichen: <code>'Berlin'</code>. Namen mit Leerzeichen oder reservierte Wörter in Backticks: <code>\`order\`</code>.</li>
<li>In MySQL ist <code>||</code> ein logisches ODER, kein Text-Verbinden. Text verbindet man mit <code>CONCAT()</code>.</li>
<li>Ohne <code>ON</code>-Bedingung wird ein JOIN zum kartesischen Produkt (jede Zeile mit jeder).</li>
<li>Ein <code>LEFT JOIN</code> mit einer Bedingung auf die rechte Tabelle in <code>WHERE</code> wirkt wie ein <code>INNER JOIN</code>. Die Bedingung gehört dann in <code>ON</code>.</li>
<li><code>NOT IN</code> mit einer Unterabfrage, die NULL enthält, liefert gar keine Zeilen. <code>NOT EXISTS</code> ist sicherer.</li>
<li><code>UPDATE</code> oder <code>DELETE</code> ohne <code>WHERE</code> trifft die ganze Tabelle.</li>
<li>Unterabfragen in <code>FROM</code> brauchen in MySQL immer einen Alias (<code>AS t</code>).</li>
<li>Textvergleiche sind in MySQL meist unabhängig von Groß-/Kleinschreibung: <code>'abc' = 'ABC'</code> ist wahr.</li>
</ul>`,
    },
  ],
};
