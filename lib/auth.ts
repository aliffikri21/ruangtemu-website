// lib/auth.ts
// Edge-compatible HMAC token signer and verifier using Web Crypto API

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.ADMIN_PASSWORD ||
  "ruangtemu-photobooth-secure-auth-secret-key-2026";

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createAdminToken(expiresInHours = 24): Promise<string> {
  const payload = JSON.stringify({
    role: "admin",
    exp: Date.now() + expiresInHours * 60 * 60 * 1000,
  });
  const encodedPayload = base64UrlEncode(payload);

  const key = await getHmacKey();
  const enc = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(encodedPayload));

  const binStr = Array.from(new Uint8Array(signature))
    .map((b) => String.fromCharCode(b))
    .join("");
  const encodedSignature = base64UrlEncode(binStr);

  return `${encodedPayload}.${encodedSignature}`;
}

export async function verifyAdminToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [encodedPayload, encodedSignature] = parts;

  try {
    const key = await getHmacKey();
    const enc = new TextEncoder();
    const binStr = base64UrlDecode(encodedSignature);
    const rawSig = Uint8Array.from(binStr, (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      rawSig,
      enc.encode(encodedPayload)
    );

    if (!isValid) return false;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.role !== "admin" || !payload.exp || Date.now() > payload.exp) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

