# Vocapp

Vokabel-Karteikarten mit Handschrift (iPad + Apple Pencil).

## Architektur

```
Browser (iPad)                    Vercel                 Supabase
┌───────────────────┐   static   ┌──────────┐
│ web/ (HTML/CSS/JS)│ ◀───────── │ web/     │
│ Canvas-Handschrift│            └──────────┘
│ Lernrunde (lokal) │  fetch + x-app-token    ┌──────────────────────┐   ┌──────────┐
│                   │ ──────────────────────▶ │ Edge Function `api`  │──▶│ Postgres │
└───────────────────┘                         │ Login, Stapel, Karten│   │ decks    │
                                              └──────────────────────┘   │ cards    │
                                                                         └──────────┘
```

- **Frontend** (`web/`): Vanilla HTML/CSS/JS, keine Build-Schritte. Handschrift wird
  auf `<canvas>` gezeichnet (Pencil-Druck, Handballen-Erkennung) und als transparentes PNG gespeichert.
- **Backend** (`supabase/functions/api`): eine Edge Function. Prüft den Login gegen
  die Tabelle `users` (Passwörter als PBKDF2-SHA256 mit Salt), stellt ein HMAC-signiertes
  Token mit der Benutzer-ID aus (30 Tage) und liest/schreibt die Tabellen mit dem
  Service-Role-Key – jede Abfrage ist auf den angemeldeten Benutzer beschränkt.
- **Mehrere Benutzer**: Jeder Stapel, jede Karte und jede Antwort hat eine `user_id`.
  Admins (`users.is_admin`) legen unter „Benutzer verwalten“ neue Konten an, setzen
  Passwörter neu oder löschen Konten. Eine offene Registrierung gibt es nicht.
- **Datenbank** (`supabase/migrations`): `decks` und `cards` (Englisch-/Deutsch-Bild als Data-URL).
  RLS ist aktiv ohne Policies – direkter Zugriff mit dem öffentlichen Key ist gesperrt.
- **Lernen**: Die Lernrunde (Reihenfolge, offene Karten) liegt im `localStorage`,
  sodass man jederzeit unterbrechen und weitermachen kann. Richtig → Karte fliegt raus,
  falsch → Karte kommt ans Ende des Stapels. Einzelne Stapel oder alle gemischt.
- **Fortschritt**: Jede Karte hat eine Leitner-Box (richtig → +1, falsch → 0).
  Ab Box 2 „sitzt“ ein Wort. Jede Antwort landet in `reviews` (Serie & „heute“).
- **Handschrift**: [perfect-freehand](https://github.com/steveruizok/perfect-freehand)
  (MIT, in `web/vendor/`) für glatte, druckempfindliche Striche. Alle Karten nutzen
  ein festes 3:2-Koordinatensystem (600 × 400) und werden als 900 × 600 PNG gespeichert.

## Grammatik

- Inhalte liegen versioniert im Frontend: `web/grammar/{tenses,clauses,words}.js`
  (Erklärung als HTML, Links, Übungen). Übungstypen: `c` = Auswahl, `g` = Lücke.
  Lücken-Antworten werden normalisiert (Kurzformen wie *won't* = *will not*),
  damit Eingaben per Apple-Pencil-Scribble funktionieren.
- Übungs-IDs sind der Schlüssel für den Lernstand – nie ändern oder wiederverwenden.
- Lernstand pro Benutzer und Übung in `grammar_progress` (Leitner-Box 0–5, nächste
  Wiederholung nach 1, 3, 7, 14, 30 Tagen; falsch → sofort wieder fällig). Ab Box 3
  gilt eine Übung als „sicher“. Jede Antwort landet in `grammar_reviews`.
- Training: alle fälligen Übungen (max. 25), danach bis zu 10 neue in Themenreihenfolge.

## API

| Methode | Pfad | |
|---|---|---|
| POST | `/login` | `{username, password}` → `{token}` |
| GET | `/me` | angemeldeter Benutzer |
| POST | `/me/password` | `{current, password}` eigenes Passwort ändern |
| GET/POST | `/users` | (Admin) Benutzer auflisten / anlegen |
| PATCH/DELETE | `/users/:id` | (Admin) Passwort neu setzen / Benutzer löschen |
| GET/POST | `/decks` | Stapel auflisten / anlegen |
| PATCH/DELETE | `/decks/:id` | umbenennen / löschen |
| GET/POST | `/decks/:id/cards` | Karten laden / anlegen |
| GET | `/cards` | alle Karten aller Stapel |
| PUT/DELETE | `/cards/:id` | Karte ändern / löschen |
| POST | `/cards/:id/review` | `{correct}` → neue Box & Zähler |
| GET | `/stats` | `{today, streak}` (Vokabeln + Grammatik) |
| GET | `/grammar` | eigener Lernstand pro Grammatik-Übung |
| POST | `/grammar/review` | `{item, correct}` → neue Box & Fälligkeit |
