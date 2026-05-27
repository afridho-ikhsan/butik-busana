/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener("push", (event: PushEvent) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Butik Busana";
  const options: NotificationOptions = {
    body: data.body || "",
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    data: data.data || {},
    tag: data.tag || "default",
    requireInteraction: data.requireInteraction ?? false,
  };
  event.waitUntil(sw.registration.showNotification(title, options));
});

sw.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url || "/";
  event.waitUntil(
    (async () => {
      const clientList = await sw.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientList) {
        if (client.url.includes(sw.location.origin) && "focus" in client) {
          await (client as WindowClient).navigate(url);
          return (client as WindowClient).focus();
        }
      }
      if (sw.clients.openWindow) return sw.clients.openWindow(url);
    })()
  );
});