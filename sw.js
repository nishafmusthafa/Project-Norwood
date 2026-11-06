// Project Norwood service worker: shows push notifications from teammates' updates.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Project Norwood", {
    body: d.body || "The plan was updated.",
    tag: d.tag || "norwood-hq",
    renotify: true,
    icon: "icon-192.png",
    badge: "icon-192.png",
    data: { url: new URL(d.url || "./", self.registration.scope).href },
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    for (const c of cs) if (c.url.startsWith(self.registration.scope) && "focus" in c) return c.focus();
    return self.clients.openWindow(e.notification.data.url);
  }));
});
