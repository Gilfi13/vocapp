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
- **Backend** (`supabase/functions/api`): eine Edge Function. Prüft Login
  (nur gehashte Zugangsdaten im Code), stellt ein HMAC-signiertes Token (30 Tage) aus
  und liest/schreibt die Tabellen mit dem Service-Role-Key.
- **Datenbank** (`supabase/migrations`): `decks` und `cards` (Englisch-/Deutsch-Bild als Data-URL).
  RLS ist aktiv ohne Policies – direkter Zugriff mit dem öffentlichen Key ist gesperrt.
- **Lernen**: Die Lernrunde (Reihenfolge, offene Karten) liegt im `localStorage`,
  sodass man jederzeit unterbrechen und weitermachen kann. Richtig → Karte fliegt raus,
  falsch → Karte kommt ans Ende des Stapels.

## API

| Methode | Pfad | |
|---|---|---|
| POST | `/login` | `{username, password}` → `{token}` |
| GET/POST | `/decks` | Stapel auflisten / anlegen |
| PATCH/DELETE | `/decks/:id` | umbenennen / löschen |
| GET/POST | `/decks/:id/cards` | Karten laden / anlegen |
| PUT/DELETE | `/cards/:id` | Karte ändern / löschen |
