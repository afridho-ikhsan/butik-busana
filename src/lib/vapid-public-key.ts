export function normalizeVapidPublicKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  return key.trim().replace(/^["']|["']$/g, "");
}

export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function vapidPublicKeyToApplicationServerKey(
  key: string | undefined
): Uint8Array | null {
  const normalized = normalizeVapidPublicKey(key);
  if (!normalized) return null;
  try {
    const bytes = urlBase64ToUint8Array(normalized);
    if (bytes.byteLength !== 65) return null;
    return Uint8Array.from(bytes);
  } catch {
    return null;
  }
}
