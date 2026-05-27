const GUEST_CART_KEY = "butik_busana_guest_cart";

export interface GuestCartLineItem {
  _id: string;
  productId: string;
  variantId?: string | null;
  variantName?: string | null;
  quantity: number;
  price: number;
  productName: string;
  image: string;
  physicalProperties?: { weight?: number };
  catalogReference?: {
    appId?: string;
    catalogItemId?: string;
    options?: { productLink?: string; variantId?: string; variantName?: string };
  };
}

export interface GuestCart {
  lineItems: GuestCartLineItem[];
  subtotal?: { amount: string };
}

function loadGuestCart(): GuestCart {
  if (typeof window === "undefined") return { lineItems: [] };
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return { lineItems: [] };
    const parsed = JSON.parse(raw) as GuestCart;
    return { lineItems: parsed.lineItems || [], subtotal: parsed.subtotal };
  } catch {
    return { lineItems: [] };
  }
}

export const GUEST_CART_UPDATED = "guest-cart-updated";

function saveGuestCart(cart: GuestCart) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent(GUEST_CART_UPDATED));
  } catch (e) {
    console.error("Failed to save guest cart", e);
  }
}

function notifyGuestCartCleared() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(GUEST_CART_UPDATED));
}

export function getGuestCart(): GuestCart {
  const cart = loadGuestCart();
  const subtotal = cart.lineItems.reduce(
    (acc, i) => acc + (i.price || 0) * (i.quantity || 0),
    0
  );
  return {
    ...cart,
    subtotal: { amount: subtotal.toString() },
  };
}

export function addToGuestCart(item: Omit<GuestCartLineItem, "_id">): GuestCart {
  const cart = loadGuestCart();
  const items = cart.lineItems as GuestCartLineItem[];
  const variantKey = (v: string | undefined | null) => v || null;
  const existing = items.findIndex(
    (lineItem) =>
      lineItem.productId === item.productId &&
      variantKey(lineItem.variantId) === variantKey(item.variantId)
  );

  let updated: GuestCartLineItem[];
  if (existing >= 0) {
    updated = items.map((it, idx) =>
      idx === existing
        ? { ...it, quantity: (it.quantity || 0) + item.quantity }
        : it
    );
  } else {
    const newItem: GuestCartLineItem = {
      ...item,
      _id: `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };
    updated = [...items, newItem];
  }

  const newCart: GuestCart = {
    lineItems: updated,
    subtotal: {
      amount: updated.reduce((a, i) => a + i.price * i.quantity, 0).toString(),
    },
  };
  saveGuestCart(newCart);
  return newCart;
}

export function removeFromGuestCart(itemId: string): GuestCart {
  const cart = loadGuestCart();
  const updated = cart.lineItems.filter((i) => i._id !== itemId);
  const newCart: GuestCart = {
    lineItems: updated,
    subtotal: {
      amount: updated.reduce((a, i) => a + i.price * i.quantity, 0).toString(),
    },
  };
  saveGuestCart(newCart);
  return newCart;
}

export function updateGuestCartQuantity(itemId: string, quantity: number): GuestCart {
  const cart = loadGuestCart();
  const updated = cart.lineItems.map((i) =>
    i._id === itemId ? { ...i, quantity: Math.max(0, quantity) } : i
  ).filter((i) => i.quantity > 0);
  const newCart: GuestCart = {
    lineItems: updated,
    subtotal: {
      amount: updated.reduce((a, i) => a + i.price * i.quantity, 0).toString(),
    },
  };
  saveGuestCart(newCart);
  return newCart;
}

export function clearGuestCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_CART_KEY);
  notifyGuestCartCleared();
}
