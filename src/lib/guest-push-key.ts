const GUEST_PUSH_KEY_STORAGE = "butik_busana_guest_push_key";

export function getOrCreateGuestPushKey(): string {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem(GUEST_PUSH_KEY_STORAGE);
  if (existing) return existing;
  const guestPushKey = crypto.randomUUID();
  localStorage.setItem(GUEST_PUSH_KEY_STORAGE, guestPushKey);
  return guestPushKey;
}
