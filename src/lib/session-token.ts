// Edge- and Node-compatible HMAC-SHA256 stateless session token utility
// Uses Web Crypto API so Next.js Middleware (Edge Runtime) and Node API routes share exact signing & verification.

export const SESSION_COOKIE_NAME = "denish_admin_session";
export const SESSION_EXPIRY_SECONDS = 60 * 60 * 24; // 24 hours

export interface AdminSession {
  adminId: number;
  username: string;
  email: string;
  role: "super_admin" | "technician";
  name: string;
  exp: number;
}

const globalForAuth = globalThis as unknown as {
  __denishEphemeralAuthSecret?: string;
};

function getAuthSecret(): string | null {
  const configured =
    process.env.ADMIN_JWT_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim();

  if (configured && configured.length >= 16) {
    return configured;
  }

  // Derive stable fallback from database credentials if present (high-entropy secret)
  const dbUrl = (process.env.DATABASE_URL || process.env.POSTGRES_URL || "").trim();
  if (dbUrl.length >= 20) {
    let hash = 0;
    for (let i = 0; i < dbUrl.length; i++) {
      hash = ((hash << 5) - hash + dbUrl.charCodeAt(i)) | 0;
    }
    return `denish_sec_${Math.abs(hash)}_${dbUrl.slice(-16)}`;
  }

  // Never allow an unconfigured fallback in production if no DB is available
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  // In local dev/test without env vars, generate a per-process CSPRNG secret (never hardcoded)
  if (!globalForAuth.__denishEphemeralAuthSecret) {
    const bytes = new Uint8Array(32);
    globalThis.crypto.getRandomValues(bytes);
    globalForAuth.__denishEphemeralAuthSecret = Array.from(bytes, (b) =>
      b.toString(16).padStart(2, "0")
    ).join("");
    console.warn(
      "[AUTH_DEV_WARNING] Set ADMIN_JWT_SECRET or JWT_SECRET in .env.local so admin sessions persist across restarts."
    );
  }
  return globalForAuth.__denishEphemeralAuthSecret;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(str: string): Uint8Array | null {
  try {
    const normalized = str.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + "=".repeat(padLength);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a signed stateless session token: base64url(payload).base64url(signature)
 */
export async function createSessionToken(admin: {
  id: number;
  username: string;
  email: string;
  role: "super_admin" | "technician";
  name: string;
}): Promise<string> {
  const secret = getAuthSecret();
  if (!secret) {
    throw new Error("Server authentication secret (ADMIN_JWT_SECRET / JWT_SECRET) is not configured.");
  }

  const payload: AdminSession = {
    adminId: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    name: admin.name,
    exp: Math.floor(Date.now() / 1000) + SESSION_EXPIRY_SECONDS,
  };

  const encoder = new TextEncoder();
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const key = await importHmacKey(secret);
  const sigBuffer = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(encodedPayload)
  );
  const signature = toBase64Url(new Uint8Array(sigBuffer));

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies and decodes a signed session token. Returns null if invalid, tampered, or expired.
 */
export async function verifySessionToken(token: string): Promise<AdminSession | null> {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, receivedSig] = parts;
  if (!encodedPayload || !receivedSig) return null;

  const secret = getAuthSecret();
  if (!secret) return null;

  const sigBytes = fromBase64Url(receivedSig);
  const payloadBytes = fromBase64Url(encodedPayload);
  if (!sigBytes || !payloadBytes) return null;

  try {
    const encoder = new TextEncoder();
    const key = await importHmacKey(secret);
    const sigCopy = new Uint8Array(sigBytes.length);
    sigCopy.set(sigBytes);
    const isValidSig = await globalThis.crypto.subtle.verify(
      "HMAC",
      key,
      sigCopy.buffer,
      encoder.encode(encodedPayload)
    );
    if (!isValidSig) return null;

    const decoder = new TextDecoder();
    const payload = JSON.parse(decoder.decode(payloadBytes)) as AdminSession;
    const now = Math.floor(Date.now() / 1000);
    if (
      !payload ||
      typeof payload.adminId !== "number" ||
      typeof payload.exp !== "number" ||
      payload.exp <= now
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

