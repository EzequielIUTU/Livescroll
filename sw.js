// Service worker mínimo: solo lo necesario para que el navegador
// permita instalar la app. No cachea nada todavía (la app siempre
// necesita datos frescos de Supabase, así que no conviene cachear
// agresivo por ahora).
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Passthrough simple: no interferimos con ningún pedido.
  return;
});
