// lib/auth.ts
// =========================================================================================
// SISTEM OTENTIKASI & KEAMANAN TOKEN ADMIN (Web Crypto API)
// Alasan Teknis: Menggunakan Web Crypto bawaan browser/edge runtime standar W3C.
// Kompatibel 100% dengan Edge Middleware Next.js tanpa membutuhkan library npm tambahan.
// =========================================================================================

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.ADMIN_PASSWORD ||
  "ruangtemu-photobooth-secure-auth-secret-key-2026";

/**
 * Mengubah string teks biasa menjadi format Base64URL yang aman untuk URL dan Cookie HTTP
 */
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Mengembalikan Base64URL kembali menjadi string teks biasa
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

/**
 * Mengimpor Kunci Rahasia (Secret Key) ke dalam format CryptoKey HMAC SHA-256
 */
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

/**
 * 1. FUNGSI MEMBUAT TOKEN SESI ADMIN (createAdminToken)
 * Format token: [PAYLOAD_BASE64].[SIGNATURE_HMAC_BASE64]
 * Token ini disimpan di Cookie browser bertipe `httpOnly` sehingga aman dari pencurian script XSS.
 */
export async function createAdminToken(expiresInHours = 24): Promise<string> {
  const payload = JSON.stringify({
    role: "admin",
    exp: Date.now() + expiresInHours * 60 * 60 * 1000, // Masa berlaku token 24 jam
  });
  const encodedPayload = base64UrlEncode(payload);

  const key = await getHmacKey();
  const enc = new TextEncoder();
  // Tandatangani payload secara kriptografis menggunakan algoritma HMAC SHA-256
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(encodedPayload));

  const binStr = Array.from(new Uint8Array(signature))
    .map((b) => String.fromCharCode(b))
    .join("");
  const encodedSignature = base64UrlEncode(binStr);

  return `${encodedPayload}.${encodedSignature}`;
}

/**
 * 2. FUNGSI MEMVERIFIKASI TOKEN SESI (verifyAdminToken)
 * Mengecek apakah token di cookie asli (belum dimanipulasi) dan belum kedaluwarsa.
 */
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

    // Verifikasi keaslian tanda tangan kriptografi
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      rawSig,
      enc.encode(encodedPayload)
    );

    if (!isValid) return false;

    // Periksa masa berlaku waktu (Expiration Check)
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.role !== "admin" || !payload.exp || Date.now() > payload.exp) {
      return false; // Token kadaluwarsa
    }

    return true; // Token sah & terverifikasi
  } catch {
    return false;
  }
}
