// Service worker mínimo: solo lo necesario para que el navegador
// permita instalar la app. No cachea nada todavía (la app siempre
// necesita datos frescos de Supabase, así que no conviene cachear
// agresivo por ahora).
//
// "navigation preload": en celulares viejos o lentos, el Service Worker
// puede tardar en arrancar. Sin esto, Chrome espera a que arranque
// ANTES de empezar a pedir la página — en equipos lentos eso puede
// superar el tiempo de espera de Chrome y mostrar "tiempo agotado"
// al abrir la app instalada (aunque ande bien en el navegador normal).
// Con navigation preload, el pedido de red arranca en paralelo
// mientras el Service Worker termina de levantar.
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    if (self.registration.navigationPreload) {
      await self.registration.navigationPreload.enable();
    }
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const preloadResponse = await e.preloadResponse;
        if (preloadResponse) return preloadResponse;
        return await fetch(e.request);
      } catch (err) {
        return await fetch(e.request);
      }
    })());
    return;
  }
  // Para todo lo demás (imágenes, JS, CSS, pedidos a Supabase, etc.)
  // no interferimos: pasa directo a la red, sin caché.
});
