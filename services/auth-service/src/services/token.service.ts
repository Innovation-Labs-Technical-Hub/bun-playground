import { config } from "../config.ts";
import type { JwtPayload } from "../models/auth.model.ts";

const encoder = new TextEncoder();

function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // default 15 minutes
  const value = parseInt(match[1]!);
  const unit = match[2];
  switch (unit) {
    case "s": return value;
    case "m": return value * 60;
    case "h": return value * 3600;
    case "d": return value * 86400;
    default: return 900;
  }
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(config.jwt.secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function base64UrlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export const tokenService = {
  async generateAccessToken(payload: JwtPayload): Promise<string> {
    const key = await getKey();
    const expiresIn = parseExpiry(config.jwt.accessExpiry);
    const now = Math.floor(Date.now() / 1000);

    const header = { alg: "HS256", typ: "JWT" };
    const body = { ...payload, iat: now, exp: now + expiresIn };

    const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
    const bodyB64 = base64UrlEncode(encoder.encode(JSON.stringify(body)));
    const signingInput = `${headerB64}.${bodyB64}`;

    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
    const signatureB64 = base64UrlEncode(new Uint8Array(signature));

    return `${signingInput}.${signatureB64}`;
  },

  async verifyAccessToken(token: string): Promise<JwtPayload | null> {
    try {
      const key = await getKey();
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const signingInput = `${parts[0]}.${parts[1]}`;
      const signature = base64UrlDecode(parts[2]!);

      const valid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(signingInput));
      if (!valid) return null;

      const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1]!)));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

      return payload as JwtPayload;
    } catch {
      return null;
    }
  },

  generateRefreshToken(): string {
    const bytes = new Uint8Array(48);
    crypto.getRandomValues(bytes);
    return base64UrlEncode(bytes);
  },

  getAccessExpirySeconds(): number {
    return parseExpiry(config.jwt.accessExpiry);
  },

  getRefreshExpiryDate(): Date {
    const seconds = parseExpiry(config.jwt.refreshExpiry);
    return new Date(Date.now() + seconds * 1000);
  },
};
