self.addEventListener("push", function (event) {
  var data = event.data ? event.data.json() : {};
  var title = data.title || "Butik Busana";
  var options = {
    body: data.body || "",
    icon: data.icon || "/logo-butik.png",
    badge: data.badge || "/logo-butik.png",
    data: data.data || {},
    tag: data.tag || "default",
    requireInteraction: data.requireInteraction ?? false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    (async function () {
      var clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf(self.location.origin) !== -1 && "focus" in client) {
          await client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })()
  );
});
