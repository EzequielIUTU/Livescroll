// LiveScroll Service Worker — compatibilidad / red fresca
// No cacheamos la app ni Supabase: LiveScroll sigue trabajando siempre contra la red.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    try {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
    } catch (_) {
      // Navegadores antiguos pueden no soportarlo completamente.
    }

    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  // Solo intervenimos en navegaciones HTML.
  if (event.request.mode !== "navigate") return;

  event.respondWith((async () => {
    try {
      // Si navigation preload existe, aprovechamos la petición que Chrome
      // ya empezó mientras levantaba el Service Worker.
      if ("preloadResponse" in event) {
        const preload = await event.preloadResponse;
        if (preload) return preload;
      }

      return await fetch(event.request);
    } catch (_) {
      // Sin caché/offline deliberadamente: devolvemos una respuesta HTML
      // simple en vez de provocar otra petición idéntica o un fallo opaco.
      return new Response(
        `<!doctype html>
        <html lang="es">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <meta name="theme-color" content="#0B0D10">
            <title>LiveScroll</title>
            <style>
              body{margin:0;background:#0B0D10;color:#fff;font-family:system-ui,-apple-system,sans-serif;
              min-height:100vh;display:grid;place-items:center;text-align:center;padding:24px;box-sizing:border-box}
              .box{max-width:360px}.muted{opacity:.68;font-size:14px;line-height:1.5}
              button{margin-top:16px;padding:12px 18px;border:0;border-radius:12px;font-weight:700}
            </style>
          </head>
          <body><div class="box"><h2>LiveScroll</h2>
          <p class="muted">No pudimos conectar con LiveScroll. Revisá tu conexión e intentá nuevamente.</p>
          <button onclick="location.reload()">Reintentar</button></div></body>
        </html>`,
        { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
  })());
});
