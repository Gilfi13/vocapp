// Vocapp API – a single Supabase Edge Function that handles login and
// all deck/card operations. The database tables have RLS enabled without
// policies, so only this function (using the service role) can read them.
import { createClient } from "npm:@supabase/supabase-js@2";

// SHA-256 hashes of the only allowed username and password.
const USER_HASH = "f26358ff6699c5ddc0610acb6e13fdf09897b5eb26412c108d2eb44f48ce973f";
const PASS_HASH = "68ed219511f1da23d17971e2d5bc56b58d60aa8d7710ba1a5bcf17b66a7a7b08";
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

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

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(text: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", enc.encode(text)));
}

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

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function createToken(): Promise<string> {
  const payload = `vocapp.${Date.now() + TOKEN_TTL_MS}`;
  return `${payload}.${await hmac(payload)}`;
}

async function verifyToken(token: string | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [prefix, exp, sig] = parts;
  if (prefix !== "vocapp" || !(Number(exp) > Date.now())) return false;
  return safeEqual(sig, await hmac(`${prefix}.${exp}`));
}

function isImage(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:image/") && value.length < 2_000_000;
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
      const ok = safeEqual(await sha256(String(username ?? "")), USER_HASH) &&
        safeEqual(await sha256(String(password ?? "")), PASS_HASH);
      if (!ok) {
        await new Promise((r) => setTimeout(r, 800)); // slow down guessing
        return json({ error: "Login fehlgeschlagen" }, 401);
      }
      return json({ token: await createToken() });
    }

    if (!(await verifyToken(req.headers.get("x-app-token")))) {
      return json({ error: "Nicht angemeldet" }, 401);
    }

    // GET /decks – all decks with card count
    if (method === "GET" && path === "/decks") {
      const { data, error } = await db
        .from("decks")
        .select("id, name, created_at, cards(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json(
        data.map((d: any) => ({
          id: d.id,
          name: d.name,
          created_at: d.created_at,
          count: d.cards?.[0]?.count ?? 0,
        })),
      );
    }

    // POST /decks {name}
    if (method === "POST" && path === "/decks") {
      const { name } = await req.json();
      const clean = String(name ?? "").trim().slice(0, 100) || "Neuer Stapel";
      const { data, error } = await db.from("decks").insert({ name: clean }).select().single();
      if (error) throw error;
      return json(data, 201);
    }

    if (seg[0] === "decks" && seg[1]) {
      const deckId = seg[1];

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
          .select("id, position, english, german")
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
          .insert({ deck_id: deckId, english, german, position: count ?? 0 })
          .select("id, position, english, german")
          .single();
        if (error) throw error;
        return json(data, 201);
      }
    }

    if (seg[0] === "cards" && seg[1] && seg.length === 2) {
      const cardId = seg[1];

      // PUT /cards/:id {english, german}
      if (method === "PUT") {
        const { english, german } = await req.json();
        if (!isImage(english) || !isImage(german)) return json({ error: "Ungültige Karte" }, 400);
        const { error } = await db.from("cards").update({ english, german }).eq("id", cardId);
        if (error) throw error;
        return json({ ok: true });
      }

      // DELETE /cards/:id
      if (method === "DELETE") {
        const { error } = await db.from("cards").delete().eq("id", cardId);
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
