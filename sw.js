// LiveScroll Service Worker — compatibilidad / red fresca
// La app y los datos siguen contra la red. Sólo conservamos hasta 32 imágenes
// públicas de perfil para evitar descargas repetidas desde Storage.
const LS_PROFILE_IMAGE_CACHE = "livescroll-profile-images-v1";
const LS_PROFILE_IMAGE_CACHE_LIMIT = 32;

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

    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys
      .filter(key => key.startsWith("livescroll-profile-images-") && key !== LS_PROFILE_IMAGE_CACHE)
      .map(key => caches.delete(key)));
  })());
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  const isSupabaseProfileImage =
    event.request.method === "GET" &&
    event.request.destination === "image" &&
    requestUrl.hostname === "lxpjqvlphvjyygifedeb.supabase.co" &&
    requestUrl.pathname.includes("/storage/v1/object/public/avatars/");

  if (isSupabaseProfileImage) {
    event.respondWith((async () => {
      const cache = await caches.open(LS_PROFILE_IMAGE_CACHE);
      const cached = await cache.match(event.request);
      if (cached) return cached;

      const response = await fetch(event.request);
      if (response.ok || response.type === "opaque") {
        await cache.put(event.request, response.clone());
        const keys = await cache.keys();
        if (keys.length > LS_PROFILE_IMAGE_CACHE_LIMIT) {
          await Promise.all(keys.slice(0, keys.length - LS_PROFILE_IMAGE_CACHE_LIMIT).map(key => cache.delete(key)));
        }
      }
      return response;
    })());
    return;
  }

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
