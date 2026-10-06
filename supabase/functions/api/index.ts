// Vocapp API – a single Supabase Edge Function that handles login, users and
// all deck/card operations. The database tables have RLS enabled without
// policies, so only this function (using the service role) can read them.
// Every query is scoped to the logged-in user.
import { createClient } from "npm:@supabase/supabase-js@2";

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
