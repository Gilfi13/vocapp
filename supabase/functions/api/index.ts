// Vocapp API – a single Supabase Edge Function that handles login, users and
// all deck/card operations. The database tables have RLS enabled without
// policies, so only this function (using the service role) can read them.
// Every query is scoped to the logged-in user.
import { createClient } from "npm:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk";

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const PBKDF2_ITERATIONS = 210_000;
const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;
const MIN_PASSWORD = 3;

const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(Deno.env.get("SUPABASE_URL")!, SERVICE_KEY, {
  auth: { persistSession: false },
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-app-token, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

const enc = new TextEncoder();

function toHex(buf: ArrayBuffer | Uint8Array): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  return new Uint8Array((hex.match(/../g) ?? []).map((b) => parseInt(b, 16)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ---------- passwords ---------- */

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return toHex(bits);
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${await pbkdf2(password, salt, PBKDF2_ITERATIONS)}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iter, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2") return false;
  return safeEqual(await pbkdf2(password, fromHex(salt), Number(iter)), hash);
}

// used when the username does not exist, so the response time does not reveal it
const DUMMY_HASH = `pbkdf2$${PBKDF2_ITERATIONS}$00000000000000000000000000000000$0`;

/* ---------- tokens: "v2.<user id>.<expiry>.<hmac>" ---------- */

async function hmac(text: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SERVICE_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, enc.encode(text)));
}

async function createToken(userId: string): Promise<string> {
  const payload = `v2.${userId}.${Date.now() + TOKEN_TTL_MS}`;
  return `${payload}.${await hmac(payload)}`;
}

async function verifyToken(token: string | null): Promise<string | null> {
  const parts = (token ?? "").split(".");
  if (parts.length !== 4) return null;
  const [version, userId, exp, sig] = parts;
  if (version !== "v2" || !(Number(exp) > Date.now())) return null;
  return safeEqual(sig, await hmac(`${version}.${userId}.${exp}`)) ? userId : null;
}

/* ---------- validation ---------- */

const CARD_FIELDS = "id, deck_id, position, english, german, box, correct_count, wrong_count, last_reviewed";
const KNOWN_BOX = 2; // a card "sitzt" from this Leitner box on

function isImage(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:image/") && value.length < 2_000_000;
}

const cleanUsername = (value: unknown) => String(value ?? "").trim().toLowerCase();

function checkNewCredentials(username: string, password: string): string | null {
  if (!USERNAME_RE.test(username)) {
    return "Benutzername: 3–32 Zeichen, nur Kleinbuchstaben, Zahlen, Punkt, Minus, Unterstrich";
  }
  if (password.length < MIN_PASSWORD) return `Passwort: mindestens ${MIN_PASSWORD} Zeichen`;
  return null;
}

/* ---------- planner: day planning with Claude ---------- */

const PLANNER_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const anthropic = ANTHROPIC_KEY ? new Anthropic({ apiKey: ANTHROPIC_KEY }) : null;

const PLAN_PROMPT = `Du bist ein persönlicher Tagesplaner für einen Studenten. Plane den Tag realistisch und sinnvoll.

Regeln:
- Feste Blöcke (Termine, Vorlesungen, feste Pausen) dürfen nicht überlappt werden. Plane nichts vor "jetzt" (falls gesetzt) und nur zwischen Tagesbeginn und Tagesende.
- Normale To-dos dürfen sich nicht überlappen. Lass 5–10 Minuten Luft vor und nach Terminen, wenn Platz ist.
- Nach spätestens pause_nach_min Minuten Arbeit am Stück kommt eine Pause (pausenlaenge_min). Plane eine Mittagspause ein, falls mittag gesetzt ist und noch keine feste Pause in der Nähe liegt.
- Wichtige und anspruchsvolle Aufgaben eher früh und in lange freie Blöcke. Ähnliches bündeln. Kurzes in Lücken. Lernaufgaben zu einem Fach gern kurz vor der Vorlesung dieses Fachs.
- To-dos mit pausen_task=true gehören IN Pausen (deine neuen oder die festen) oder in kurze Lücken zwischen Vorlesungen. Start innerhalb der Pause/Lücke, nicht länger als sie.
- To-dos mit "frist" müssen vor diesem Tag erledigt sein; je näher die Frist, desto eher einplanen (z. B. Nacharbeiten vor der nächsten Vorlesung).
- To-dos mit sport=true: Bewegung nicht direkt nach dem Essen und nicht spät abends, gern als Ausgleich nach langem Sitzen.
- Was nicht sinnvoll passt, kommt in "unplanned" (lieber ehrlich als überladen). Beachte die Wünsche.

Antworte NUR mit JSON in genau dieser Form, ohne Text davor oder danach:
{"schedule":[{"id":"<todo id>","start":"HH:MM"}],"pauses":[{"start":"HH:MM","duration":15,"title":"Pause"}],"unplanned":["<todo id>"],"note":"2–3 kurze, freundliche Sätze auf Deutsch, du-Form: warum der Plan so ist und worauf man achten sollte."}

Daten:
`;

async function planWithClaude(input: string) {
  const response = await anthropic!.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages: [{ role: "user", content: PLAN_PROMPT + input }],
  } as any);
  if (response.stop_reason === "refusal") throw new Error("Claude hat die Planung abgelehnt");
  const text = response.content.map((b: any) => (b.type === "text" ? b.text : "")).join("");
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Claude hat keinen Plan geliefert");
  return JSON.parse(match[0]);
}

/* ---------- planner: Claude as calendar assistant ---------- */

const pad2 = (n: number) => String(n).padStart(2, "0");
const ymdOf = (d: Date) => `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
const dayIndex = (s: string) => new Date(`${s}T00:00:00Z`).getUTCDay();

// Does a planner entry take place on this date? (same rules as web/planner.js)
function occursOn(it: any, date: string): boolean {
  const r = it.repeat || "none";
  if (r === "none" || (it.kind || "todo") === "todo") return it.date === date;
  if (!it.date || date < it.date) return false;
  if (it.until && date > it.until) return false;
  if (Array.isArray(it.skip) && it.skip.includes(date)) return false;
  const dow = dayIndex(date);
  if (r === "daily") return true;
  if (r === "weekdays") return dow >= 1 && dow <= 5;
  if (r === "weekly") return dow === dayIndex(it.date);
  return it.date === date;
}

const ENTRY_SCHEMA = {
  type: "object",
  properties: {
    id: { type: "string", description: "Nur zum Ändern eines bestehenden Eintrags angeben" },
    title: { type: "string" },
    kind: { type: "string", enum: ["todo", "termin", "pause"] },
    date: { type: ["string", "null"], description: "YYYY-MM-DD; bei To-dos ohne festen Tag null" },
    start: { type: ["string", "null"], description: "HH:MM; bei To-dos ohne Uhrzeit null (landen im Eingang)" },
    duration: { type: "integer", description: "Minuten" },
    repeat: { type: "string", enum: ["none", "daily", "weekdays", "weekly"] },
    forBreak: { type: "boolean", description: "Kleiner Pausen-Task, der in Pausen gelegt wird" },
    priority: { type: "integer", enum: [1, 2, 3], description: "1 wichtig, 2 normal, 3 kann warten" },
    place: { type: ["string", "null"], enum: ["uni", null], description: "uni = findet an der Hochschule statt; die App trägt dann Anfahrt und Zug automatisch ein" },
    done: { type: "boolean" },
    due: { type: ["string", "null"], description: "Frist YYYY-MM-DD: bis wann das To-do erledigt sein soll" },
    sport: { type: "boolean", description: "Sport-Einheit" },
    notes: { type: "string" },
    color: { type: "string", enum: ["coral", "orange", "yellow", "green", "teal", "blue", "violet", "pink"] },
    emoji: { type: "string" },
    link: { type: ["string", "null"], description: "vocab, grammar oder subject:<fach-id> für Lernaufgaben in MyStudy" },
  },
  required: ["title", "kind"],
};

const CHAT_TOOLS = [
  {
    name: "list_entries",
    description: "Liest Termine, Pausen und eingeplante To-dos zwischen zwei Tagen (wiederkehrende Termine sind aufgelöst) sowie alle offenen To-dos im Eingang.",
    input_schema: {
      type: "object",
      properties: { from: { type: "string", description: "YYYY-MM-DD" }, to: { type: "string", description: "YYYY-MM-DD" } },
      required: ["from", "to"],
    },
  },
  {
    name: "save_entries",
    description: "Legt Einträge an oder ändert sie (mit id). Felder, die du bei einer Änderung weglässt, bleiben erhalten.",
    input_schema: { type: "object", properties: { entries: { type: "array", items: ENTRY_SCHEMA } }, required: ["entries"] },
  },
  {
    name: "delete_entries",
    description: "Löscht Einträge (bei wiederkehrenden die ganze Serie).",
    input_schema: { type: "object", properties: { ids: { type: "array", items: { type: "string" } } }, required: ["ids"] },
  },
  {
    name: "skip_occurrence",
    description: "Lässt einen wiederkehrenden Termin an einem einzelnen Tag ausfallen.",
    input_schema: { type: "object", properties: { id: { type: "string" }, date: { type: "string" } }, required: ["id", "date"] },
  },
  {
    name: "study_status",
    description: "Lernstand in MyStudy: Vokabeln (wie viele sitzen) und fällige Grammatik-Übungen.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "update_settings",
    description: "Ändert Einstellungen: about (Infos über den Nutzer), wishes (Wünsche fürs Planen), trainsOut / trainsBack (Zugliste, eine Verbindung pro Zeile 'HH:MM-HH:MM'), walkStation, walkUni (Minuten).",
    input_schema: {
      type: "object",
      properties: {
        about: { type: "string" }, wishes: { type: "string" }, trainsOut: { type: "string" }, trainsBack: { type: "string" },
        walkStation: { type: "integer" }, walkUni: { type: "integer" },
      },
    },
  },
  { type: "web_search_20260209", name: "web_search", max_uses: 5 },
];

async function runChatTool(uid: string, name: string, input: any, state: { changed: boolean }): Promise<string> {
  if (name === "list_entries") {
    const { data, error } = await db.from("planner_items").select("id, data").eq("user_id", uid);
    if (error) throw error;
    const from = String(input.from), to = String(input.to);
    const days: Record<string, any[]> = {};
    for (let d = new Date(`${from}T00:00:00Z`); ymdOf(d) <= to && Object.keys(days).length < 31; d.setUTCDate(d.getUTCDate() + 1)) {
      const day = ymdOf(d);
      days[day] = data
        .filter((r: any) => r.data.start && occursOn(r.data, day))
        .map((r: any) => ({ id: r.id, ...r.data, date: day }))
        .sort((a: any, b: any) => a.start.localeCompare(b.start));
    }
    const inbox = data.filter((r: any) => (r.data.kind || "todo") === "todo" && !r.data.done && !r.data.start)
      .map((r: any) => ({ id: r.id, ...r.data }));
    return JSON.stringify({ days, inbox });
  }
  if (name === "save_entries") {
    const entries = Array.isArray(input.entries) ? input.entries.slice(0, 50) : [];
    const ids = entries.map((e: any) => e.id).filter(Boolean);
    const { data: existing } = ids.length
      ? await db.from("planner_items").select("id, data").eq("user_id", uid).in("id", ids)
      : { data: [] as any[] };
    const old = new Map((existing ?? []).map((r: any) => [r.id, r.data]));
    const rows = entries.map((e: any) => {
      const id = e.id && PLANNER_ID_RE.test(e.id) ? e.id : `c${Date.now().toString(36)}${crypto.randomUUID().slice(0, 6)}`;
      const { id: _drop, ...fields } = e;
      const data = { done: false, repeat: "none", forBreak: false, priority: 2, source: "claude", createdAt: new Date().toISOString(), ...(old.get(id) ?? {}), ...fields };
      return { user_id: uid, id, data, updated_at: new Date().toISOString() };
    });
    if (rows.length) {
      const { error } = await db.from("planner_items").upsert(rows);
      if (error) throw error;
      state.changed = true;
    }
    return JSON.stringify({ saved: rows.map((r: any) => ({ id: r.id, title: r.data.title, date: r.data.date, start: r.data.start })) });
  }
  if (name === "delete_entries") {
    const ids = (Array.isArray(input.ids) ? input.ids : []).filter((id: unknown) => typeof id === "string" && PLANNER_ID_RE.test(id));
    if (ids.length) {
      const { error } = await db.from("planner_items").delete().eq("user_id", uid).in("id", ids);
      if (error) throw error;
      state.changed = true;
    }
    return JSON.stringify({ deleted: ids });
  }
  if (name === "skip_occurrence") {
    const { data: row } = await db.from("planner_items").select("data").eq("user_id", uid).eq("id", String(input.id)).maybeSingle();
    if (!row) return "Eintrag nicht gefunden";
    const skip = [...new Set([...(row.data.skip ?? []), String(input.date)])];
    const { error } = await db.from("planner_items").update({ data: { ...row.data, skip } }).eq("user_id", uid).eq("id", String(input.id));
    if (error) throw error;
    state.changed = true;
    return "ok";
  }
  if (name === "study_status") {
    const [decks, grammar] = await Promise.all([
      db.from("cards").select("box, last_reviewed").eq("user_id", uid),
      db.from("grammar_progress").select("due_at").eq("user_id", uid),
    ]);
    const cards = decks.data ?? [];
    return JSON.stringify({
      vokabeln_gesamt: cards.length,
      vokabeln_sitzen: cards.filter((c: any) => c.box >= KNOWN_BOX).length,
      grammatik_faellig: (grammar.data ?? []).filter((g: any) => new Date(g.due_at) <= new Date()).length,
    });
  }
  if (name === "update_settings") {
    const { data: row } = await db.from("planner_settings").select("prefs").eq("user_id", uid).maybeSingle();
    const allowed = ["about", "wishes", "trainsOut", "trainsBack", "walkStation", "walkUni"];
    const patch = Object.fromEntries(Object.entries(input ?? {}).filter(([k]) => allowed.includes(k)));
    const { error } = await db.from("planner_settings").upsert({ user_id: uid, prefs: { ...(row?.prefs ?? {}), ...patch }, updated_at: new Date().toISOString() });
    if (error) throw error;
    state.changed = true;
    return "ok";
  }
  return "Unbekanntes Werkzeug";
}

async function chatWithClaude(uid: string, body: any) {
  const { data: settings } = await db.from("planner_settings").select("prefs").eq("user_id", uid).maybeSingle();
  const prefs = settings?.prefs ?? {};
  const system = `Du bist Claude, der persönliche Assistent in der App MyStudy. Du führst den Kalender des Nutzers und planst mit ihm seinen Tag. Sprich Deutsch, locker, in Du-Form, und antworte kurz (das läuft am Handy).

Heute ist ${body.weekday}, ${body.today}, es ist ${body.now} Uhr (Europe/Berlin). Gerade angezeigt wird der ${body.viewing}.

Was du über den Nutzer weißt:
${prefs.about || "(noch nichts eingetragen)"}
Wünsche fürs Planen: ${prefs.wishes || "–"}
Tag von ${prefs.dayStart ?? "08:00"} bis ${prefs.dayEnd ?? "21:00"}, Pause nach ${prefs.focusMin ?? 90} min Arbeit.
Anfahrt zur Uni: ${prefs.walkStation ?? 20} min zu Fuß zum Bahnhof ${prefs.homeStation ?? "Neu-Ulm"}, dann Zug nach ${prefs.uniStation ?? "Kempten (Allgäu) Hbf"}, von dort ${prefs.walkUni ?? 15} min zur Hochschule.
Zugliste hin: ${prefs.trainsOut || "(leer)"} · zurück: ${prefs.trainsBack || "(leer)"}

So arbeitest du:
- Lies mit list_entries, bevor du planst oder etwas verschiebst. Ändere nur, was der Nutzer will oder was er dir aufgetragen hat.
- Termine an der Hochschule bekommen place "uni". Die App trägt dann Fußweg und Zug hin und zurück automatisch ein (Einträge mit source "travel" – die nicht selbst anlegen oder ändern). Wenn du echte Zugzeiten kennst oder findest, schreib sie mit update_settings in die Zugliste.
- Beim Planen: feste Termine nicht überlappen, Wichtiges früh, Pausen einplanen, kleine Pausen-Tasks (forBreak) in Pausen oder Lücken, Lernaufgaben vor der passenden Vorlesung. To-dos plant man ein, indem man date und start setzt.
- Nach jeder Vorlesung legt die App ein To-do "Nacharbeiten: <Fach>" mit Frist (due) bis zur nächsten Vorlesung an. Plane solche Lernzeit vor der Frist ein.
- Lädt der Nutzer Vorlesungsunterlagen hoch (PDF/Bilder): finde heraus, zu welchem Fach sie gehören, schätze realistisch ab, was zu tun ist (lesen, Aufgaben rechnen, Begriffe lernen), und lege konkrete To-dos mit Dauer und due = Tag der nächsten Vorlesung dieses Fachs an (oder passe das Nacharbeiten-To-do an). Fasse kurz zusammen, worum es in den Unterlagen geht.
- Sport: wenn der Nutzer Sport machen will, schlag ab und zu eine passende Einheit vor und plane sie mit ein.
- Für Infos aus dem Internet (z. B. Spielplan FC Hawangen auf bfv.de) nutze web_search. Sag ehrlich, wenn du etwas nicht sicher weißt.
- Sag am Ende kurz, was du eingetragen oder geändert hast.`;

  const messages: any[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m: any) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-16)
    .map((m: any) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length) throw new Error("Keine Nachricht");

  // uploaded lecture material goes with the newest user message
  const files = (Array.isArray(body.attachments) ? body.attachments : []).slice(0, 5)
    .filter((f: any) => typeof f?.data === "string" && /^(application\/pdf|image\/(png|jpeg|gif|webp))$/.test(f.type));
  const last = messages[messages.length - 1];
  if (files.length && last.role === "user") {
    last.content = [
      ...files.map((f: any) => f.type === "application/pdf"
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: f.data }, title: String(f.name ?? "Unterlagen").slice(0, 200) }
        : { type: "image", source: { type: "base64", media_type: f.type, data: f.data } }),
      { type: "text", text: last.content },
    ];
  }

  const state = { changed: false };
  for (let i = 0; i < 12; i++) {
    const response: any = await anthropic!.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system,
      tools: CHAT_TOOLS,
      messages,
    } as any);
    if (response.stop_reason === "refusal") return { reply: "Dabei kann ich leider nicht helfen.", changed: state.changed };
    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason === "pause_turn") continue;
    const uses = response.content.filter((b: any) => b.type === "tool_use");
    if (response.stop_reason !== "tool_use" || !uses.length) {
      const reply = response.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("").trim();
      return { reply, changed: state.changed };
    }
    const results = [];
    for (const u of uses) {
      let content: string;
      let isError = false;
      try {
        content = await runChatTool(uid, u.name, u.input ?? {}, state);
      } catch (err) {
        content = `Fehler: ${String((err as Error)?.message ?? err)}`;
        isError = true;
      }
      results.push({ type: "tool_result", tool_use_id: u.id, content, is_error: isError });
    }
    messages.push({ role: "user", content: results });
  }
  return { reply: "Das war mir zu viel auf einmal – frag mich bitte Schritt für Schritt.", changed: state.changed };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  // Path after ".../api", e.g. "/decks/123/cards"
  const path = new URL(req.url).pathname.replace(/^.*?\/api(?=\/|$)/, "") || "/";
  const seg = path.split("/").filter(Boolean);
  const method = req.method;

  try {
    if (method === "POST" && path === "/login") {
      const { username, password } = await req.json();
      const { data: user } = await db
        .from("users")
        .select("id, password_hash")
        .eq("username", cleanUsername(username))
        .maybeSingle();
      const ok = await verifyPassword(String(password ?? ""), user?.password_hash ?? DUMMY_HASH);
      if (!user || !ok) {
        await new Promise((r) => setTimeout(r, 800)); // slow down guessing
        return json({ error: "Login fehlgeschlagen" }, 401);
      }
      return json({ token: await createToken(user.id) });
    }

    const userId = await verifyToken(req.headers.get("x-app-token"));
    const { data: me } = userId
      ? await db.from("users").select("id, username, is_admin").eq("id", userId).maybeSingle()
      : { data: null };
    if (!me) return json({ error: "Nicht angemeldet" }, 401);
    const uid: string = me.id;

    // GET /me
    if (method === "GET" && path === "/me") return json(me);

    // POST /me/password {current, password}
    if (method === "POST" && path === "/me/password") {
      const { current, password } = await req.json();
      const { data: row } = await db.from("users").select("password_hash").eq("id", uid).single();
      if (!(await verifyPassword(String(current ?? ""), row!.password_hash))) {
        return json({ error: "Aktuelles Passwort ist falsch" }, 400);
      }
      const problem = checkNewCredentials(me.username, String(password ?? ""));
      if (problem) return json({ error: problem }, 400);
      await db.from("users").update({ password_hash: await hashPassword(password) }).eq("id", uid);
      return json({ ok: true });
    }

    /* ---------- user management (admin only) ---------- */

    if (seg[0] === "users") {
      if (!me.is_admin) return json({ error: "Keine Berechtigung" }, 403);

      // GET /users – all accounts with their number of decks and cards
      if (method === "GET" && seg.length === 1) {
        const { data, error } = await db
          .from("users")
          .select("id, username, is_admin, created_at, decks(count), cards(count)")
          .order("created_at");
        if (error) throw error;
        return json(
          data.map((u: any) => ({
            id: u.id,
            username: u.username,
            is_admin: u.is_admin,
            created_at: u.created_at,
            decks: u.decks?.[0]?.count ?? 0,
            cards: u.cards?.[0]?.count ?? 0,
          })),
        );
      }

      // POST /users {username, password}
      if (method === "POST" && seg.length === 1) {
        const body = await req.json();
        const username = cleanUsername(body.username);
        const password = String(body.password ?? "");
        const problem = checkNewCredentials(username, password);
        if (problem) return json({ error: problem }, 400);
        const { data, error } = await db
          .from("users")
          .insert({ username, password_hash: await hashPassword(password) })
          .select("id, username, is_admin, created_at")
          .single();
        if (error?.code === "23505") return json({ error: "Diesen Benutzernamen gibt es schon" }, 400);
        if (error) throw error;
        return json({ ...data, decks: 0, cards: 0 }, 201);
      }

      const targetId = seg[1];

      // PATCH /users/:id {password} – reset a password
      if (method === "PATCH" && seg.length === 2) {
        const { data: target } = await db.from("users").select("username").eq("id", targetId).maybeSingle();
        if (!target) return json({ error: "Benutzer nicht gefunden" }, 404);
        const password = String((await req.json()).password ?? "");
        const problem = checkNewCredentials(target.username, password);
        if (problem) return json({ error: problem }, 400);
        await db.from("users").update({ password_hash: await hashPassword(password) }).eq("id", targetId);
        return json({ ok: true });
      }

      // DELETE /users/:id – removes the account with all its decks and cards
      if (method === "DELETE" && seg.length === 2) {
        if (targetId === uid) return json({ error: "Du kannst dich nicht selbst löschen" }, 400);
        const { error } = await db.from("users").delete().eq("id", targetId);
        if (error) throw error;
        return json({ ok: true });
      }
    }

    /* ---------- grammar practice ---------- */

    // GET /grammar – own progress per grammar exercise
    if (method === "GET" && path === "/grammar") {
      const { data, error } = await db
        .from("grammar_progress")
        .select("item_id, box, correct_count, wrong_count, last_reviewed, due_at")
        .eq("user_id", uid);
      if (error) throw error;
      return json(data);
    }

    // POST /grammar/review {item, correct}
    if (method === "POST" && path === "/grammar/review") {
      const { item, correct } = await req.json();
      if (typeof item !== "string" || !/^[a-z0-9-]{1,40}$/.test(item)) {
        return json({ error: "Ungültige Übung" }, 400);
      }
      const { data, error } = await db.rpc("record_grammar_review", {
        p_user: uid,
        p_item: item,
        p_correct: correct === true,
      });
      if (error) throw error;
      return json(data);
    }

    /* ---------- planner (calendar, to-dos, breaks) ---------- */

    if (seg[0] === "planner") {
      // GET /planner – all own entries, settings and day notes
      if (method === "GET" && seg.length === 1) {
        const [items, settings, notes] = await Promise.all([
          db.from("planner_items").select("id, data").eq("user_id", uid),
          db.from("planner_settings").select("prefs").eq("user_id", uid).maybeSingle(),
          db.from("planner_notes").select("day, text, author").eq("user_id", uid),
        ]);
        if (items.error) throw items.error;
        if (notes.error) throw notes.error;
        return json({
          items: items.data.map((r: any) => ({ ...r.data, id: r.id })),
          prefs: settings.data?.prefs ?? {},
          notes: Object.fromEntries(notes.data.map((n: any) => [n.day, { text: n.text, by: n.author }])),
        });
      }

      // POST /planner/sync {upsert: [{id, data}], remove: [id]} – save or delete entries
      if (method === "POST" && path === "/planner/sync") {
        const { upsert = [], remove = [] } = await req.json();
        if (!Array.isArray(upsert) || !Array.isArray(remove) || upsert.length + remove.length > 200) {
          return json({ error: "Ungültige Änderung" }, 400);
        }
        const rows = [];
        for (const u of upsert) {
          const ok = typeof u?.id === "string" && PLANNER_ID_RE.test(u.id) &&
            u.data && typeof u.data === "object" && !Array.isArray(u.data) &&
            JSON.stringify(u.data).length <= 8000;
          if (!ok) return json({ error: "Ungültiger Eintrag" }, 400);
          const { id: _ignored, ...data } = u.data;
          rows.push({ user_id: uid, id: u.id, data, updated_at: new Date().toISOString() });
        }
        if (remove.some((id: unknown) => typeof id !== "string" || !PLANNER_ID_RE.test(id))) {
          return json({ error: "Ungültiger Eintrag" }, 400);
        }
        if (rows.length) {
          const { error } = await db.from("planner_items").upsert(rows);
          if (error) throw error;
        }
        if (remove.length) {
          const { error } = await db.from("planner_items").delete().eq("user_id", uid).in("id", remove);
          if (error) throw error;
        }
        return json({ ok: true });
      }

      // PUT /planner/prefs {prefs}
      if (method === "PUT" && path === "/planner/prefs") {
        const { prefs } = await req.json();
        if (!prefs || typeof prefs !== "object" || JSON.stringify(prefs).length > 4000) {
          return json({ error: "Ungültige Einstellungen" }, 400);
        }
        const { error } = await db
          .from("planner_settings")
          .upsert({ user_id: uid, prefs, updated_at: new Date().toISOString() });
        if (error) throw error;
        return json({ ok: true });
      }

      // PUT /planner/notes/:day {text, by} · DELETE /planner/notes/:day
      if (seg[1] === "notes" && /^\d{4}-\d{2}-\d{2}$/.test(seg[2] ?? "") && seg.length === 3) {
        if (method === "DELETE") {
          const { error } = await db.from("planner_notes").delete().eq("user_id", uid).eq("day", seg[2]);
          if (error) throw error;
          return json({ ok: true });
        }
        if (method === "PUT") {
          const { text, by } = await req.json();
          const { error } = await db.from("planner_notes").upsert({
            user_id: uid,
            day: seg[2],
            text: String(text ?? "").slice(0, 1000),
            author: by === "claude" ? "claude" : "regel",
            updated_at: new Date().toISOString(),
          });
          if (error) throw error;
          return json({ ok: true });
        }
      }

      // POST /planner/plan {data} – Claude plans the day (needs the ANTHROPIC_API_KEY secret)
      if (method === "POST" && path === "/planner/plan") {
        if (!anthropic) return json({ error: "Claude ist noch nicht eingerichtet" }, 501);
        const { data } = await req.json();
        const input = JSON.stringify(data ?? {});
        if (input.length > 30000) return json({ error: "Zu viele Einträge" }, 400);
        return json(await planWithClaude(input));
      }

      // POST /planner/chat {messages, today, now, weekday, viewing} – Claude as calendar assistant
      if (method === "POST" && path === "/planner/chat") {
        if (!anthropic) return json({ error: "Claude ist noch nicht eingerichtet" }, 501);
        return json(await chatWithClaude(uid, await req.json()));
      }
    }

    /* ---------- decks & cards of the logged-in user ---------- */

    // GET /decks – own decks with learning progress
    if (method === "GET" && path === "/decks") {
      const { data, error } = await db
        .from("decks")
        .select("id, name, created_at, cards(box, last_reviewed)")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json(
        data.map((d: any) => {
          const cards = d.cards ?? [];
          const known = cards.filter((c: any) => c.box >= KNOWN_BOX).length;
          const fresh = cards.filter((c: any) => !c.last_reviewed).length;
          return {
            id: d.id,
            name: d.name,
            created_at: d.created_at,
            count: cards.length,
            known,
            learning: cards.length - known - fresh,
            fresh,
          };
        }),
      );
    }

    // GET /stats – answers today and learning streak
    if (method === "GET" && path === "/stats") {
      const { data, error } = await db.rpc("review_stats", { uid, tz: "Europe/Berlin" });
      if (error) throw error;
      return json(data);
    }

    // GET /cards – every own card
    if (method === "GET" && path === "/cards") {
      const { data, error } = await db
        .from("cards")
        .select(CARD_FIELDS)
        .eq("user_id", uid)
        .order("deck_id")
        .order("position")
        .order("created_at");
      if (error) throw error;
      return json(data);
    }

    // POST /decks {name}
    if (method === "POST" && path === "/decks") {
      const { name } = await req.json();
      const clean = String(name ?? "").trim().slice(0, 100) || "Neuer Stapel";
      const { data, error } = await db
        .from("decks")
        .insert({ name: clean, user_id: uid })
        .select("id, name, created_at")
        .single();
      if (error) throw error;
      return json(data, 201);
    }

    if (seg[0] === "decks" && seg[1]) {
      const deckId = seg[1];
      const { data: deck } = await db
        .from("decks")
        .select("id")
        .eq("id", deckId)
        .eq("user_id", uid)
        .maybeSingle();
      if (!deck) return json({ error: "Stapel nicht gefunden" }, 404);

      // PATCH /decks/:id {name}
      if (method === "PATCH" && seg.length === 2) {
        const { name } = await req.json();
        const clean = String(name ?? "").trim().slice(0, 100);
        if (!clean) return json({ error: "Name fehlt" }, 400);
        const { error } = await db.from("decks").update({ name: clean }).eq("id", deckId);
        if (error) throw error;
        return json({ ok: true });
      }

      // DELETE /decks/:id
      if (method === "DELETE" && seg.length === 2) {
        const { error } = await db.from("decks").delete().eq("id", deckId);
        if (error) throw error;
        return json({ ok: true });
      }

      // GET /decks/:id/cards
      if (method === "GET" && seg[2] === "cards") {
        const { data, error } = await db
          .from("cards")
          .select(CARD_FIELDS)
          .eq("deck_id", deckId)
          .order("position")
          .order("created_at");
        if (error) throw error;
        return json(data);
      }

      // POST /decks/:id/cards {english, german}
      if (method === "POST" && seg[2] === "cards") {
        const { english, german } = await req.json();
        if (!isImage(english) || !isImage(german)) return json({ error: "Ungültige Karte" }, 400);
        const { count } = await db
          .from("cards")
          .select("id", { count: "exact", head: true })
          .eq("deck_id", deckId);
        const { data, error } = await db
          .from("cards")
          .insert({ deck_id: deckId, user_id: uid, english, german, position: count ?? 0 })
          .select(CARD_FIELDS)
          .single();
        if (error) throw error;
        return json(data, 201);
      }
    }

    // POST /cards/:id/review {correct} – right: one box up, wrong: back to box 0
    if (method === "POST" && seg[0] === "cards" && seg[1] && seg[2] === "review") {
      const { correct } = await req.json();
      const { data, error } = await db.rpc("record_review", {
        p_card: seg[1],
        p_user: uid,
        p_correct: correct === true,
      });
      if (error) throw error;
      if (!data) return json({ error: "Karte nicht gefunden" }, 404);
      return json(data);
    }

    if (seg[0] === "cards" && seg[1] && seg.length === 2) {
      const cardId = seg[1];

      // PUT /cards/:id {english, german}
      if (method === "PUT") {
        const { english, german } = await req.json();
        if (!isImage(english) || !isImage(german)) return json({ error: "Ungültige Karte" }, 400);
        const { data, error } = await db
          .from("cards")
          .update({ english, german })
          .eq("id", cardId)
          .eq("user_id", uid)
          .select("id");
        if (error) throw error;
        if (!data.length) return json({ error: "Karte nicht gefunden" }, 404);
        return json({ ok: true });
      }

      // DELETE /cards/:id
      if (method === "DELETE") {
        const { error } = await db.from("cards").delete().eq("id", cardId).eq("user_id", uid);
        if (error) throw error;
        return json({ ok: true });
      }
    }

    return json({ error: "Nicht gefunden" }, 404);
  } catch (err) {
    console.error(err);
    return json({ error: "Serverfehler" }, 500);
  }
});
