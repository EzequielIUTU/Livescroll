Warning: truncated output (original token count: 209598)
Total output lines: 19769

// ============================================================
// LIVESCROLL · FIRMA OFICIAL DEL PROYECTO
// Creador público: @EzequielIUTU · Argentina · 2026
// Project ID: LS-AR-2026-3124CAB98D0F0FD3
// Firma SHA-256: 3124cab98d0f0fd3cd465d3c05c49b4d789c2549719dadd127e631d6db287b76
// ============================================================
const LIVESCROLL_PROJECT_IDENTITY = Object.freeze({
  project:"LiveScroll",
  projectId:"LS-AR-2026-3124CAB98D0F0FD3",
  creator:"@EzequielIUTU",
  country:"Argentina",
  founded:"2026",
  signature:"3124cab98d0f0fd3cd465d3c05c49b4d789c2549719dadd127e631d6db287b76"
});

// La WebApp es compartida, pero la APK 7 anuncia su identidad en el User-Agent.
// Así LiveScroll 6 conserva su experiencia y LiveScroll 7 recibe la propia.
const LIVESCROLL_RUNTIME = Object.freeze({
  isAndroid8:/LiveScrollAndroid\/8(?:\.|\/|\s)/i.test(navigator.userAgent) || new URLSearchParams(location.search).get("ls8preview") === "1",
  isAndroid7:/LiveScrollAndroid\/7(?:\.|\/|\s)/i.test(navigator.userAgent),
  isAndroid6:/LiveScrollAndroid\/6(?:\.|\/|\s)/i.test(navigator.userAgent),
  generation:(/LiveScrollAndroid\/8(?:\.|\/|\s)/i.test(navigator.userAgent) || new URLSearchParams(location.search).get("ls8preview") === "1") ? 8 : /LiveScrollAndroid\/7(?:\.|\/|\s)/i.test(navigator.userAgent) ? 7 : 6
});

if (LIVESCROLL_RUNTIME.isAndroid6) document.documentElement.classList.add("ls6-app-runtime");
if (LIVESCROLL_RUNTIME.isAndroid8) document.documentElement.classList.add("ls8-app-runtime");

function isLiveScroll7App() {
  return LIVESCROLL_RUNTIME.isAndroid7 === true || LIVESCROLL_RUNTIME.isAndroid8 === true;
}
window.isLiveScroll7App = isLiveScroll7App;

function isLiveScroll8App() {
  return LIVESCROLL_RUNTIME.isAndroid8 === true;
}
window.isLiveScroll8App = isLiveScroll8App;

function getLiveScrollRuntimeGeneration() {
  return isLiveScroll8App() ? 8 : (LIVESCROLL_RUNTIME.isAndroid7 ? 7 : 6);
}

function getLiveScrollClientOrigin() {
  if (LIVESCROLL_RUNTIME.isAndroid8) return "ls8";
  if (LIVESCROLL_RUNTIME.isAndroid7) return "ls7";
  if (LIVESCROLL_RUNTIME.isAndroid6) return "ls6";
  return "web";
}

function renderClientOriginBadge(origin, compact = false) {
  const value = String(origin || "").toLowerCase();
  const labels = { ls6:"LS6", ls7:"LS7", ls8:"LS8", web:"WEB" };
  if (!labels[value]) return "";
  const title = value === "ls8"
    ? "Publicado desde LiveScroll 8"
    : value === "ls7"
    ? "Publicado desde LiveScroll 7"
    : value === "ls6"
      ? "Publicado desde LiveScroll 6"
      : "Publicado desde LiveScroll Web";
  return `<span class="ls-client-origin ls-origin-${value}${compact ? " is-compact" : ""}" title="${title}" aria-label="${title}">${labels[value]}</span>`;
}

let lsGenerationFeedFilter = ["all","ls6","ls7"].includes(localStorage.getItem("ls-generation-filter"))
  ? localStorage.getItem("ls-generation-filter")
  : "all";

function setGenerationFeedFilter(filter) {
  if (!["all","ls6","ls7"].includes(filter) || filter === lsGenerationFeedFilter) return;
  lsGenerationFeedFilter = filter;
  localStorage.setItem("ls-generation-filter", filter);
  renderFeed(++lsTabRenderToken);
}

function renderGenerationFeedFilter() {
  const options = [
    ["all", "Todos"],
    ["ls6", "LS6"],
    ["ls7", "LS7"]
  ];
  return `<div class="ls-generation-filter-shell">
    <div class="ls-generation-filter" aria-label="Filtrar por generación">${options.map(([value,label]) =>
      `<button type="button" class="${lsGenerationFeedFilter === value ? "active" : ""}" onclick="setGenerationFeedFilter('${value}')">${label}</button>`
    ).join("")}</div>
    <div class="ls-generation-weekly-pulse" id="lsGenerationWeeklyPulse">Esta semana · calculando pulso…</div>
  </div>`;
}

let lsGenerationPulseCache = { data:null, at:0 };

function getArgentinaWeekStartIso() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone:"America/Argentina/Buenos_Aires",
    year:"numeric", month:"2-digit", day:"2-digit"
  }).formatToParts(new Date());
  const pick = type => Number(parts.find(part => part.type === type)?.value || 0);
  const todayUtc = new Date(Date.UTC(pick("year"), pick("month") - 1, pick("day")));
  const isoDay = todayUtc.getUTCDay() || 7;
  todayUtc.setUTCDate(todayUtc.getUTCDate() - (isoDay - 1));
  return `${todayUtc.toISOString().slice(0,10)}T03:00:00.000Z`;
}

async function loadGenerationWeeklyPulse() {
  const target = document.getElementById("lsGenerationWeeklyPulse");
  if (!target) return;
  if (lsGenerationPulseCache.data && Date.now() - lsGenerationPulseCache.at < 300000) {
    const { ls6, ls7 } = lsGenerationPulseCache.data;
    target.innerHTML = `Esta semana · <b>LS6 ${ls6}</b><i>VS</i><b>LS7 ${ls7}</b>`;
    return;
  }
  const weekStart = getArgentinaWeekStartIso();
  const [sixResult, sevenResult] = await Promise.all([
    sb.from("videos").select("id", { count:"exact", head:true }).eq("client_origin", "ls6").gte("created_at", weekStart),
    sb.from("videos").select("id", { count:"exact", head:true }).eq("client_origin", "ls7").gte("created_at", weekStart)
  ]);
  if (!document.getElementById("lsGenerationWeeklyPulse")) return;
  const data = { ls6:sixResult?.count || 0, ls7:sevenResult?.count || 0 };
  lsGenerationPulseCache = { data, at:Date.now() };
  document.getElementById("lsGenerationWeeklyPulse").innerHTML = `Esta semana · <b>LS6 ${data.ls6}</b><i>VS</i><b>LS7 ${data.ls7}</b>`;
}

function getGenerationIdentityStats(videos = []) {
  const stats = { ls6:0, ls7:0, web:0 };
  videos.forEach(video => {
    if (Object.prototype.hasOwnProperty.call(stats, video?.client_origin)) stats[video.client_origin] += 1;
  });
  return { ...stats, both:stats.ls6 > 0 && stats.ls7 > 0 };
}

function renderGenerationIdentityCard(videos = [], own = false) {
  const stats = getGenerationIdentityStats(videos);
  if (!stats.ls6 && !stats.ls7 && !stats.web) return "";
  return `<section class="ls-generation-identity${stats.both ? " is-dual" : ""}">
    <div class="ls-generation-copy">
      <small>IDENTIDAD GENERACIONAL</small>
      <strong>${stats.both ? "⚡ Usuario de ambas generaciones" : stats.ls7 ? "Nueva Generación" : stats.ls6 ? "Generación Clásica" : "LiveScroll Web"}</strong>
      <span>${stats.both ? "Publicó desde LiveScroll 6 y LiveScroll 7." : own ? "Tu historia en LiveScroll se construye con cada publicación." : "Su recorrido dentro de LiveScroll."}</span>
    </div>
    <div class="ls-generation-counts">
      <div class="ls-generation-six"><b>${stats.ls6}</b><span>LS6</span></div>
      <div class="ls-generation-seven"><b>${stats.ls7}</b><span>LS7</span></div>
      ${stats.web ? `<div class="ls-generation-web"><b>${stats.web}</b><span>WEB</span></div>` : ""}
    </div>
  </section>`;
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("lsClientOriginStyles")) return;
  const style = document.createElement("style");
  style.id = "lsClientOriginStyles";
  style.textContent = `
    .ls-client-origin{display:inline-flex;align-items:center;justify-content:center;min-height:18px;padding:1px 6px;border-radius:999px;font:900 8px 'JetBrains Mono',monospace;letter-spacing:.07em;vertical-align:middle;border:1px solid transparent;box-sizing:border-box}
    .ls-origin-ls6{color:#eef3f7;background:linear-gradient(135deg,rgba(203,213,225,.20),rgba(71,85,105,.38));border-color:rgba(226,232,240,.42);box-shadow:0 0 10px rgba(203,213,225,.10)}
    .ls-origin-ls7{color:#e9fcff;background:linear-gradient(135deg,rgba(57,231,255,.20),rgba(138,85,255,.34));border-color:rgba(90,235,255,.52);box-shadow:0 0 13px rgba(57,231,255,.20)}
    .ls-origin-ls8{color:#fff5ff;background:linear-gradient(135deg,rgba(255,62,165,.30),rgba(98,255,196,.22));border-color:rgba(255,112,198,.58);box-shadow:0 0 14px rgba(255,62,165,.22)}
    .ls-origin-web{color:#a9b4bf;background:rgba(148,163,184,.09);border-color:rgba(148,163,184,.22)}
    .ls-client-origin.is-compact{min-height:16px;padding:0 5px;font-size:7px}
    .ls-generation-filter-shell{position:relative;z-index:8;padding:5px 10px 8px;background:linear-gradient(180deg,var(--ink),rgba(5,9,13,.78))}.ls-generation-filter{display:flex;justify-content:center;gap:7px;padding:2px 0 5px}
    .ls-generation-filter button{min-width:68px;height:32px;padding:0 13px;border:1px solid var(--border);border-radius:999px;background:var(--panel-2);color:var(--text-dim);font:850 9px 'JetBrains Mono',monospace;letter-spacing:.06em;cursor:pointer}
    .ls-generation-filter button.active{color:#fff;border-color:rgba(57,231,255,.48);background:linear-gradient(135deg,rgba(203,213,225,.20),rgba(57,231,255,.18),rgba(138,85,255,.24));box-shadow:0 0 18px rgba(57,231,255,.10)}
    .ls-generation-weekly-pulse{text-align:center;color:var(--text-dim);font:800 7px 'JetBrains Mono',monospace;letter-spacing:.06em}.ls-generation-weekly-pulse b{margin:0 5px;color:#d9f9ff}.ls-generation-weekly-pulse i{font-style:normal;color:#8b5cff}
    .ls-generation-identity{margin:16px 0 20px;padding:16px;border:1px solid rgba(203,213,225,.24);border-radius:20px;background:linear-gradient(145deg,rgba(71,85,105,.20),rgba(8,13,20,.96));display:flex;align-items:center;justify-content:space-between;gap:15px;box-shadow:0 15px 36px rgba(0,0,0,.20)}
    .ls-generation-identity.is-dual{border-color:rgba(57,231,255,.30);background:radial-gradient(circle at 95% 0,rgba(138,85,255,.18),transparent 42%),linear-gradient(145deg,rgba(203,213,225,.10),rgba(6,17,32,.97));box-shadow:0 18px 45px rgba(0,0,0,.24),0 0 28px rgba(57,231,255,.06)}
    .ls-generation-copy{display:flex;flex-direction:column;gap:4px;min-width:0}.ls-generation-copy small{color:#68eaff;font:900 8px 'JetBrains Mono',monospace;letter-spacing:.12em}.ls-generation-copy strong{font-size:15px}.ls-generation-copy span{color:var(--text-dim);font-size:10px;line-height:1.4}
    .ls-generation-counts{display:flex;gap:7px;flex:0 0 auto}.ls-generation-counts>div{min-width:47px;padding:8px 7px;border:1px solid var(--border);border-radius:13px;text-align:center;background:rgba(4,8,14,.55)}.ls-generation-counts b{display:block;font:900 18px 'JetBrains Mono',monospace}.ls-generation-counts span{display:block;margin-top:2px;font:900 7px 'JetBrains Mono',monospace;letter-spacing:.08em}.ls-generation-six b{color:#e2e8f0}.ls-generation-seven b{color:#57eaff}.ls-generation-web b{color:#94a3b8}
    @media(max-width:520px){.ls-generation-identity{align-items:flex-start;flex-direction:column}.ls-generation-counts{width:100%}.ls-generation-counts>div{flex:1}.ls-generation-filter{padding-top:5px}.ls-generation-filter button{min-width:62px}}
  `;
  document.head.appendChild(style);
}, { once:true });

function applyLiveScrollRuntimeBranding() {
  if (isLiveScroll8App()) {
    document.documentElement.classList.add("ls7-app-runtime","ls8-app-runtime");
    document.querySelectorAll(".nav-brand").forEach(node => {
      node.innerHTML = '<span class="nav-brand-live">Live</span><span class="nav-brand-scroll">Scroll</span><b>8</b>';
      node.setAttribute("aria-label", "LiveScroll 8");
    });
    document.title = "LiveScroll 8";
    return;
  }
  if (!isLiveScroll7App()) return;
  document.documentElement.classList.add("ls7-app-runtime");
  document.querySelectorAll(".nav-brand").forEach(node => {
    node.innerHTML = '<span class="nav-brand-live">Live</span><span class="nav-brand-scroll">Scroll</span><b>7</b>';
    node.setAttribute("aria-label", "LiveScroll 7");
  });
  document.title = "LiveScroll 7 — La nueva generación";
}

function installLiveScroll7NativeFeel() {
  if ((!isLiveScroll7App() && !isLiveScroll8App()) || window.__ls7NativeFeelInstalled) return;
  window.__ls7NativeFeelInstalled = true;
  let lastPulseAt = 0;

  document.addEventListener("pointerup", event => {
    const control = event.target?.closest?.("button,[role='button'],a[href],.feed-action-btn");
    if (!control || control.disabled || control.getAttribute("aria-disabled") === "true") return;
    const now = performance.now();
    if (now - lastPulseAt < 70) return;
    lastPulseAt = now;

    const strong = control.classList.contains("liked") ||
      control.classList.contains("ls-dock-create") ||
      /delete|remove|report|danger/i.test(control.className || "");
    try {
      window.LiveScrollAndroid?.hapticFeedback?.(strong ? "confirm" : "tap");
    } catch (_) {}
  }, { passive:true, capture:true });
}

function updateLiveScroll7Boot(progress, message) {
  if (!isLiveScroll7App()) return;
  const bar = document.getElementById("ls7BootProgress");
  const copy = document.getElementById("ls7BootCopy");
  if (bar) bar.style.width = `${Math.max(8, Math.min(100, Number(progress) || 8))}%`;
  if (copy && message) copy.textContent = message;
}

function finishLiveScroll7Boot({ authenticated = false } = {}) {
  if (!isLiveScroll7App()) return;
  const screen = document.getElementById("ls7BootScreen");
  if (!screen || screen.dataset.finished === "1") return;
  screen.dataset.finished = "1";
  screen.classList.toggle("is-welcome", authenticated);
  const hold = authenticated ? 720 : 180;
  window.setTimeout(() => {
    screen.classList.add("is-leaving");
    window.setTimeout(() => {
      document.documentElement.classList.remove("ls7-boot-pending");
      screen.remove();
    }, 380);
  }, hold);
}
window.finishLiveScroll7Boot = finishLiveScroll7Boot;

// ============================================================
// CONFIGURACIÓN — reemplazá con tus datos de Supabase
// (Project Settings > API en tu dashboard de Supabase)
// ============================================================
const SUPABASE_URL = "https://lxpjqvlphvjyygifedeb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4cGpxdmxwaHZqeXlnaWZlZGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTMyMTMsImV4cCI6MjA5ODk4OTIxM30.9ovZlNQ-XKdSszZuMYb6PzRnXtX5eejuzBeqpKgkVnk";
const LIVESCROLL_MEDIA_API = "https://livescroll-media-api.ezequielmarcosrodriguez.workers.dev";

let sb;
try {
  if (!window.supabase) {
    throw new Error("La librería de Supabase no cargó (revisá tu conexión a internet o si un bloqueador de anuncios la está frenando).");
  }
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (err) {
  document.addEventListener("DOMContentLoaded", () => {
    document.body.innerHTML = `
      <div style="max-width:500px;margin:80px auto;padding:24px;background:#1C2027;border:1px solid #F87171;border-radius:12px;color:#fff;font-family:sans-serif;">
        <h2 style="color:#F87171;margin-top:0;">Error al conectar</h2>
        <p>${err.message}</p>
        <p style="color:#9AA0A8;font-size:13px;">Revisá la consola del navegador (F12) para más detalle.</p>
      </div>`;
  });
  console.error("Error inicializando Supabase:", err);
}

let currentUser = null;
let currentProfile = null;
let currentTab = "feed";
let previousTabForAndroidBack = "feed";
let suppressAndroidTabHistory = false;
let watchIntervals = {}; // video_id -> intervalId
let watchSeconds = {};   // video_id -> segundos acumulados sin enviar aún
let feedObserverInstance = null;
let loadedEmbeds = new Set(); // video_id -> reproductor real cargado ahora mismo
let lsAuthActivationPromise = null;
let lsAuthActivationUserId = null;
let lsAuthenticatedAppReadyUserId = null;
let lsExplicitLoginInProgress = false;

async function activateAuthenticatedSession(session, { openShared = false, explicitLogin = false } = {}) {
  const user = session?.user;
  if (!user?.id) return false;

  // onAuthStateChange y getSession pueden informar la misma sesión casi al
  // mismo tiempo. Reutilizamos una sola carga para no duplicar perfil, Feed,
  // novedades, listeners ni consultas.
  if (lsAuthActivationPromise && lsAuthActivationUserId === user.id) {
    await lsAuthActivationPromise;
    if (openShared && window.sharedVideoId) openSharedVideo(window.sharedVideoId);
    return true;
  }

  if (lsAuthenticatedAppReadyUserId === user.id && currentUser?.id === user.id) {
    finishLiveScroll7Boot({ authenticated:true });
    if (openShared && window.sharedVideoId) openSharedVideo(window.sharedVideoId);
    return true;
  }

  currentUser = user;
  lsAuthActivationUserId = user.id;
  const activation = (async () => {
    await loadProfile();
    if (explicitLogin) {
      closeAuthModal();
      await showPostLoginIntro();
    }
    await renderApp();
    lsAuthenticatedAppReadyUserId = user.id;
  })();
  lsAuthActivationPromise = activation;

  try {
    await activation;
    finishLiveScroll7Boot({ authenticated:true });
    if (openShared && window.sharedVideoId) openSharedVideo(window.sharedVideoId);
    return true;
  } catch (error) {
    console.error("No se pudo iniciar la experiencia autenticada:", error);
    lsAuthenticatedAppReadyUserId = null;
    renderLanding();
    finishLiveScroll7Boot({ authenticated:false });
    showToast?.("No pudimos cargar tu cuenta. Revisá tu conexión e intentá nuevamente.");
    return false;
  } finally {
    if (lsAuthActivationPromise === activation) {
      lsAuthActivationPromise = null;
      lsAuthActivationUserId = null;
    }
  }
}

async function uploadMediaToR2(file) {
  if (!(file instanceof Blob) || !file.size) throw new Error("El archivo está vacío");

  const { data:{ session }, error:sessionError } = await sb.auth.getSession();
  if (sessionError || !session?.access_token) {
    throw new Error("Tu sesión venció. Volvé a iniciar sesión para subir el archivo.");
  }

  const response = await fetch(`${LIVESCROLL_MEDIA_API}/upload`, {
    method:"POST",
    headers:{
      "Authorization":`Bearer ${session.access_token}`,
      "Content-Type":file.type || "application/octet-stream"
    },
    body:file
  });

  let result = null;
  try { result = await response.json(); } catch (_) {}

  if (!response.ok || !result?.ok || !result?.url) {
    const messages = {
      usuario_no_autorizado:"Tu sesión venció. Volvé a iniciar sesión.",
      tipo_de_archivo_no_permitido:"Ese formato todavía no está permitido.",
      archivo_demasiado_grande:`El archivo supera el límite de ${result?.max_mb || 95} MB.`,
      origen_no_autorizado:"LiveScroll no pudo validar el origen de la subida.",
      configuracion_incompleta:"El servidor de archivos todavía no terminó de configurarse."
    };
    throw new Error(messages[result?.error] || "No se pudo guardar el archivo en el servidor.");
  }

  return result;
}

function getR2ObjectKey(publicUrl) {
  try {
    const parsed = new URL(publicUrl);
    const base = new URL("https://pub-e9c48f11ee0b4c9f8cb233e29b77f61a.r2.dev");
    if (parsed.origin !== base.origin) return null;
    const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
    return key.startsWith("usuarios/") && !key.includes("..") ? key : null;
  } catch (_) {
    return null;
  }
}

async function deleteMediaFromR2(publicUrl) {
  const key = getR2ObjectKey(publicUrl);
  if (!key) return { ok:true, skipped:true };

  const { data:{ session } } = await sb.auth.getSession();
  if (!session?.access_token) return { ok:false, error:"sesion_vencida" };

  try {
    const response = await fetch(`${LIVESCROLL_MEDIA_API}/object?key=${encodeURIComponent(key)}`, {
      method:"DELETE",
      headers:{ "Authorization":`Bearer ${session.access_token}` }
    });
    const result = await response.json().catch(() => null);
    return response.ok && result?.ok ? result : { ok:false, error:result?.error || "delete_failed" };
  } catch (_) {
    return { ok:false, error:"network_error" };
  }
}

async function getVideoMediaForCleanup(videoId) {
  const { data } = await sb.from("videos")
    .select("video_url,thumbnail_url")
    .eq("id", videoId)
    .maybeSingle();
  return data || null;
}

async function cleanupR2VideoMedia(media) {
  if (!media) return;
  const results = await Promise.allSettled([
    deleteMediaFromR2(media.video_url),
    deleteMediaFromR2(media.thumbnail_url)
  ]);
  if (results.some(item => item.status === "rejected" || item.value?.ok === false)) {
    console.warn("El registro se eliminó, pero quedó un archivo pendiente de limpieza en R2.");
  }
}

// ============================================================
// 5.8.8 · MOBILE STABILITY
// Altura visible real para barras móviles, teclado y zonas seguras.
// ============================================================
let lsViewportSyncFrame = null;
let lsViewportSyncBound = false;

function syncLiveScrollViewportMetrics() {
  if (lsViewportSyncFrame) cancelAnimationFrame(lsViewportSyncFrame);

  lsViewportSyncFrame = requestAnimationFrame(() => {
    lsViewportSyncFrame = null;
    const viewport = window.visualViewport;
    const visibleHeight = Math.max(320, Math.round(viewport?.height || window.innerHeight));
    const hiddenByKeyboard = Math.max(0, Math.round(window.innerHeight - visibleHeight));

    document.documentElement.style.setProperty("--ls-visible-height", `${visibleHeight}px`);
    document.documentElement.style.setProperty("--ls-keyboard-height", `${hiddenByKeyboard}px`);
    document.documentElement.classList.toggle("ls-keyboard-open", hiddenByKeyboard > 150);
  });
}

function ensureMobileStabilityLayer() {
  if (!document.getElementById("lsMobileStabilityStyles")) {
    const style = document.createElement("style");
    style.id = "lsMobileStabilityStyles";
    style.textContent = `
      :root { --ls-visible-height:100dvh; --ls-keyboard-height:0px; }

      #globalModalWrap .modal-overlay {
        height:var(--ls-visible-height);
        max-height:var(--ls-visible-height);
        overscroll-behavior:contain;
      }

      #globalModalWrap .modal-box {
        max-height:calc(var(--ls-visible-height) - 28px) !important;
      }

      #globalModalWrap .modal-box-body {
        min-height:0;
        overscroll-behavior:contain;
        -webkit-overflow-scrolling:touch;
      }

      @media (max-width:700px) {
        html.ls-keyboard-open #globalModalWrap .modal-overlay {
          align-items:flex-start !important;
          padding-top:8px !important;
          padding-bottom:8px !important;
        }

        html.ls-keyboard-open #globalModalWrap .modal-box {
          max-height:calc(var(--ls-visible-height) - 16px) !important;
        }

        #globalModalWrap input,
        #globalModalWrap textarea,
        #globalModalWrap select {
          font-size:16px !important;
        }

        #globalModalWrap .modal-box-footer {
          flex-shrink:0;
          padding-bottom:max(12px, env(safe-area-inset-bottom)) !important;
        }

        button, a, input, textarea, select {
          touch-action:manipulation;
        }
      }
    `;
    document.head.appendChild(style);
  }

  if (!lsViewportSyncBound) {
    lsViewportSyncBound = true;
    window.addEventListener("resize", syncLiveScrollViewportMetrics, { passive:true });
    window.addEventListener("orientationchange", syncLiveScrollViewportMetrics, { passive:true });
    window.visualViewport?.addEventListener("resize", syncLiveScrollViewportMetrics, { passive:true });
    window.visualViewport?.addEventListener("scroll", syncLiveScrollViewportMetrics, { passive:true });
  }

  syncLiveScrollViewportMetrics();
}

document.addEventListener("DOMContentLoaded", ensureMobileStabilityLayer, { once:true });




document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("lsNoTextSelectionStyle")) return;

  const style = document.createElement("style");
  style.id = "lsNoTextSelectionStyle";
  style.textContent = `
    html, body, #appView, #landingView, nav, header, main, section, article,
    div, span, p, h1, h2, h3, h4, button, a, img, video {
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }

    input, textarea, [contenteditable="true"], .allow-select {
      -webkit-user-select: text !important;
      user-select: text !important;
      -webkit-touch-callout: default;
    }

    button, a, [onclick] {
      -webkit-tap-highlight-color: transparent;
    }
  `;
  document.head.appendChild(style);
});

// ============================================================
// ARRANQUE
// ============================================================

(function installSecurityReportContrastStyles() {
  if (document.getElementById("lsSecurityReportContrastStyles")) return;

  const style = document.createElement("style");
  style.id = "lsSecurityReportContrastStyles";
  style.textContent = `
    .ls-security-reason-select {
      background:#080b10 !important;
      color:#ffffff !important;
      border-color:rgba(255,255,255,.34) !important;
      font-weight:700 !important;
    }

    .ls-security-reason-select option {
      background:#080b10 !important;
      color:#ffffff !important;
      font-weight:700 !important;
    }

    .ls-security-reason-select:focus {
      outline:none !important;
      border-color:#fb7185 !important;
      box-shadow:0 0 0 3px rgba(251,113,133,.13) !important;
    }
  `;
  document.head.appendChild(style);
})();

// ============================================================
// LIVESCROLL · REPORTE DE SEGURIDAD V1
// Flujo público desde el correo "Tu contraseña fue cambiada".
// NO cambia contraseñas. Solo registra un caso para revisión.
// ============================================================

function isLiveScrollSecurityReportLink() {
  const params = new URLSearchParams(window.location.search);
  return params.get("security") === "password-changed";
}

function getLiveScrollSecurityReportEmail() {
  const params = new URLSearchParams(window.location.search);
  return String(params.get("email") || "").trim().replace(/ /g, "+").toLowerCase();
}

function renderSecurityReportScreen() {
  const reportEmail = getLiveScrollSecurityReportEmail();

  const landing = document.getElementById("landingView");
  const app = document.getElementById("appView");

  if (landing) landing.classList.add("hidden");
  if (app) app.classList.add("hidden");

  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  wrap.innerHTML = `
    <div id="lsSecurityReportScreen" style="
      position:fixed;
      inset:0;
      z-index:700;
      overflow-y:auto;
      padding:22px;
      display:flex;
      align-items:center;
      justify-content:center;
      background:
        radial-gradient(circle at 50% 16%, rgba(239,68,68,.12), transparent 32%),
        #070a0f;
    ">
      <div class="auth-box" style="
        width:min(100%,500px);
        margin:0;
        border:1px solid rgba(248,113,113,.24);
        box-shadow:0 26px 90px rgba(0,0,0,.60);
      ">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="
            width:60px;height:60px;margin:0 auto 12px;border-radius:18px;
            display:flex;align-items:center;justify-content:center;
            font-size:27px;background:rgba(239,68,68,.09);
            border:1px solid rgba(248,113,113,.24);
          ">🚨</div>

          <div style="
            font-size:9px;
            font-weight:900;
            letter-spacing:.14em;
            color:#fb7185;
          ">LIVESCROLL · SEGURIDAD</div>

          <h2 style="margin:7px 0 6px;">Reportar cambio de contraseña</h2>

          <p style="
            margin:0;
            color:var(--text-dim);
            font-size:11px;
            line-height:1.55;
          ">
            Completá este formulario solamente si recibiste un aviso de cambio
            de contraseña que no reconocés. El reporte será revisado antes de
            realizar cualquier acción sobre la cuenta.
          </p>
        </div>

        ${reportEmail ? "" : `
          <div style="
            margin:0 0 14px;
            padding:11px 12px;
            border:1px solid rgba(248,113,113,.28);
            border-radius:11px;
            background:rgba(239,68,68,.06);
            color:#fca5a5;
            font-size:10px;
            line-height:1.5;
          ">
            Este enlace no contiene una cuenta válida. Volvé al correo de seguridad
            de LiveScroll y usá el botón “No fui yo”.
          </div>
        `}

        <div class="field">
          <label>Correo de la cuenta afectada</label>
          <input
            id="securityReportEmail"
            type="email"
            value="${escapeHtml(reportEmail)}"
            readonly
            aria-readonly="true"
            style="
              opacity:.92;
              cursor:not-allowed;
              background:var(--panel-2);
            "
          >
          <div style="font-size:9px;color:var(--text-dim);margin-top:5px;">
            🔒 Este correo viene del aviso de seguridad y no puede editarse.
          </div>
        </div>

        <div class="field">
          <label>¿Qué ocurrió?</label>
          <select id="securityReportReason" class="ls-security-reason-select" style="
            width:100%;
            padding:11px;
            background:#080b10;
            color:#ffffff;
            border:1px solid rgba(255,255,255,.34);
            border-radius:9px;
            font-family:inherit;
            font-weight:700;
          ">
            <option value="">Seleccioná un motivo</option>
            <option value="password_change_not_recognized">No reconozco el cambio de contraseña</option>
            <option value="lost_access_after_change">Perdí el acceso después del cambio</option>
            <option value="possible_account_takeover">Creo que otra persona ingresó a mi cuenta</option>
            <option value="suspicious_security_email">Recibí un correo de seguridad que me resulta sospechoso</option>
            <option value="other">Otro problema relacionado con mi contraseña</option>
          </select>
        </div>

        <div class="field">
          <label>Contanos qué pasó</label>
          <textarea
            id="securityReportDetails"
            maxlength="1500"
            rows="6"
            placeholder="Ejemplo: recibí el correo a las 12:20, yo no había solicitado ningún cambio y desde entonces no puedo entrar..."
            style="
              width:100%;
              resize:vertical;
              min-height:120px;
              padding:11px;
              background:var(--ink);
              color:var(--text);
              border:1px solid var(--border);
              border-radius:9px;
              font-family:inherit;
              box-sizing:border-box;
            "
          ></textarea>
          <div style="font-size:9px;color:var(--text-dim);margin-top:5px;">
            No escribas contraseñas ni códigos de verificación.
          </div>
        </div>

        <div style="
          padding:11px 12px;
          border-radius:11px;
          border:1px solid var(--border);
          background:rgba(255,255,255,.018);
          color:var(--text-dim);
          font-size:10px;
          line-height:1.5;
          margin-bottom:13px;
        ">
          🔐 Enviar este reporte <strong>no cambia tu contraseña</strong> y no
          desbloquea la cuenta automáticamente. Primero se revisa el caso.
        </div>

        <button id="securityReportSubmitBtn" class="btn"
          style="width:100%;min-height:48px;"
          ${reportEmail ? "" : "disabled"}
          onclick="submitSecurityIncidentReport()">
          Enviar reporte de seguridad
        </button>

        <button class="btn-outline"
          style="width:100%;margin-top:9px;"
          onclick="exitSecurityReportScreen()">
          Volver al inicio
        </button>

        <div id="securityReportError" class="error-msg" style="margin-top:10px;"></div>
      </div>
    </div>`;
}

async function submitSecurityIncidentReport() {
  const email = document.getElementById("securityReportEmail")?.value.trim().toLowerCase() || "";
  const reason = document.getElementById("securityReportReason")?.value || "";
  const details = document.getElementById("securityReportDetails")?.value.trim() || "";
  const errorEl = document.getElementById("securityReportError");
  const btn = document.getElementById("securityReportSubmitBtn");

  if (errorEl) {
    errorEl.style.color = "";
    errorEl.textContent = "";
  }

  if (!email || !email.includes("@")) {
    if (errorEl) errorEl.textContent = "Ingresá el correo de la cuenta afectada.";
    return;
  }

  if (!reason) {
    if (errorEl) errorEl.textContent = "Seleccioná el motivo del reporte.";
    return;
  }

  if (details.length < 20) {
    if (errorEl) errorEl.textContent = "Contanos un poco más sobre lo ocurrido (mínimo 20 caracteres).";
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Enviando reporte...";
  }

  const { data, error } = await sb.rpc("create_security_incident_report", {
    p_email: email,
    p_reason: reason,
    p_details: details
  });

  if (error || !data?.ok) {
    if (errorEl) {
      errorEl.textContent =
        data?.error === "rate_limited"
          ? "Ya recibimos un reporte reciente para este correo. Esperá un momento antes de enviar otro."
          : "No pudimos enviar el reporte. Intentá nuevamente.";
    }

    if (btn) {
      btn.disabled = false;
      btn.textContent = "Enviar reporte de seguridad";
    }
    return;
  }

  showSecurityReportSuccess(data.case_code || "");
}

function showSecurityReportSuccess(caseCode = "") {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  wrap.innerHTML = `
    <div style="
      position:fixed;
      inset:0;
      z-index:710;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:22px;
      background:#070a0f;
    ">
      <div class="auth-box" style="width:min(100%,450px);margin:0;text-align:center;">
        <div style="
          width:62px;height:62px;border-radius:20px;
          margin:0 auto 14px;
          display:flex;align-items:center;justify-content:center;
          background:rgba(34,197,94,.09);
          border:1px solid rgba(34,197,94,.25);
          font-size:28px;
        ">✓</div>

        <h2 style="margin:0 0 8px;">Reporte recibido</h2>

        <p style="
          color:var(--text-dim);
          font-size:12px;
          line-height:1.6;
          margin:0 0 14px;
        ">
          Registramos tu reporte de seguridad. No se realizará ningún cambio
          automático sobre la cuenta: el caso debe ser revisado.
        </p>

        ${caseCode ? `
          <div style="
            display:inline-block;
            margin:0 0 15px;
            padding:7px 10px;
            border:1px solid var(--border);
            border-radius:999px;
            font-family:'JetBrains Mono',monospace;
            font-size:10px;
            color:var(--gold);
          ">CASO ${escapeHtml(caseCode)}</div>
        ` : ""}

        <div style="
          text-align:left;
          padding:12px;
          border:1px solid var(--border);
          border-radius:12px;
          color:var(--text-dim);
          font-size:10px;
          line-height:1.5;
          margin-bottom:14px;
        ">
          Guardá el código del caso si aparece arriba. No compartas contraseñas
          ni códigos de acceso con nadie.
        </div>

        <button class="btn" style="width:100%;"
          onclick="exitSecurityReportScreen()">
          Volver a LiveScroll
        </button>
      </div>
    </div>`;
}

function exitSecurityReportScreen() {
  try {
    history.replaceState({}, document.title, window.location.pathname);
  } catch (_) {}

  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";

  renderLanding();
}

document.addEventListener("DOMContentLoaded", async () => {
  applyLiveScrollRuntimeBranding();
  if ("serviceWorker" in navigator) {
    const registerSW = () => navigator.serviceWorker.register("sw.js").catch(() => {});
    if ("requestIdleCallback" in window) {
      requestIdleCallback(registerSW, { timeout: 2200 });
    } else {
      setTimeout(registerSW, 1200);
    }
  }

  const params = new URLSearchParams(window.location.search);
  window.referralCode = params.get("ref");
  window.sharedVideoId = params.get("video");

  // El enlace "No fui yo" abre el reporte público y no inicia la app normal.
  if (isLiveScrollSecurityReportLink()) {
    renderSecurityReportScreen();
    animateLandingOdometer();
    return;
  }

  // Suscribimos primero para capturar PASSWORD_RECOVERY antes de tratar
  // la sesión temporal del enlace como un inicio de sesión normal.
  let lsRecoveryMode = false;

  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      lsRecoveryMode = true;
      currentUser = session?.user || null;
      showNewPasswordForm();
      return;
    }

    if (lsRecoveryMode) {
      // Mientras estamos cambiando la contraseña, ignoramos eventos de sesión
      // que podrían mandar al usuario al Feed.
      if (event === "SIGNED_OUT") {
        currentUser = null;
        currentProfile = null;
      }
      return;
    }

    if (event === "SIGNED_IN") {
      // handleLogin conserva la transición visual y completará esta misma
      // sesión mediante activateAuthenticatedSession.
      if (lsExplicitLoginInProgress) return;
      await activateAuthenticatedSession(session);
    } else if (event === "SIGNED_OUT") {
      currentUser = null;
      currentProfile = null;
      lsAuthenticatedAppReadyUserId = null;
      lsAuthActivationPromise = null;
      lsAuthActivationUserId = null;
      clearAllWatchIntervals();
      renderLanding();
    }
  });

  // Damos un instante a Supabase para procesar el enlace de recuperación.
  await new Promise(resolve => setTimeout(resolve, 80));

  let session = null;
  try {
    const sessionResult = await sb.auth.getSession();
    session = sessionResult?.data?.session || null;
    if (sessionResult?.error) console.warn("No se pudo recuperar la sesión:", sessionResult.error.message);
  } catch (error) {
    console.warn("La recuperación de sesión falló:", error);
  }

  if (!lsRecoveryMode) {
    if (session) {
      await activateAuthenticatedSession(session, { openShared:true });
    } else {
      renderLanding();
      finishLiveScroll7Boot({ authenticated:false });
    }
  }

  // El listener de Auth ya fue instalado antes de leer la sesión.


  animateLandingOdometer();
});



// ============================================================
// LIVESCROLL · POST LOGIN INTRO V1
// Transición breve entre iniciar sesión y entrar al Feed.
// No aparece al recargar una sesión ya iniciada.
// ============================================================

function showPostLoginIntro() {
  return new Promise(resolve => {
    const wrap = document.getElementById("globalModalWrap");
    if (!wrap) {
      resolve();
      return;
    }

    const username = currentProfile?.username || currentUser?.email?.split("@")[0] || "";
    const isLs7 = isLiveScroll7App();
    const modernGeneration = getLiveScrollRuntimeGeneration();
    const seasonalKey = typeof getSeasonalThemeKey === "function"
      ? getSeasonalThemeKey()
      : "normal";

    const seasonal = typeof LS_SEASONAL_THEMES !== "undefined"
      ? (LS_SEASONAL_THEMES[seasonalKey] || LS_SEASONAL_THEMES.normal)
      : null;

    const accent = isLs7 ? "#58d8ff" : (seasonal?.accent || "var(--gold)");
    const seasonEmoji = isLs7 ? String(modernGeneration) : (seasonal?.emoji || "✦");
    const introKicker = isLs7 ? `LIVESCROLL ${modernGeneration} · ANDROID` : "LiveScroll";
    const introTitle = isLs7
      ? (username ? `Cargando tu mundo, @${escapeHtml(username)}` : `Cargando LiveScroll ${modernGeneration}`)
      : (username ? `Hola, @${escapeHtml(username)}` : "Bienvenido");
    const introSubtitle = isLs7
      ? "Preparando tu feed y sincronizando tu cuenta…"
      : "Preparando tu LiveScroll…";

    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
      document.body?.classList.contains("ls-legacy");

    wrap.innerHTML = `
      <div id="lsPostLoginIntro" style="
        position:fixed;
        inset:0;
        z-index:220;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:22px;
        background:
          radial-gradient(circle at 50% 36%, color-mix(in srgb, ${accent} 14%, transparent), transparent 32%),
          ${isLs7 ? "linear-gradient(145deg,rgba(4,8,22,.98),rgba(21,8,46,.98))" : "rgba(7,10,14,.96)"};
        backdrop-filter:blur(12px);
        -webkit-backdrop-filter:blur(12px);
      ">
        <div class="ls-login-intro-card" style="
          width:min(420px,92vw);
          text-align:center;
          position:relative;
        ">
          <div class="ls-login-intro-mark" style="
            width:64px;
            height:64px;
            margin:0 auto 16px;
            border-radius:20px;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:29px;
            border:1px solid color-mix(in srgb, ${accent} 38%, var(--border));
            background:
              linear-gradient(145deg,color-mix(in srgb, ${accent} 11%, var(--panel)),var(--panel));
            box-shadow:0 0 38px color-mix(in srgb, ${accent} 16%, transparent);
          ">${seasonEmoji}</div>

          <div style="
            font-size:10px;
            text-transform:uppercase;
            letter-spacing:.18em;
            color:${accent};
            font-weight:900;
            margin-bottom:8px;
          ">${introKicker}</div>

          <div style="
            font-size:clamp(23px,6vw,34px);
            font-weight:950;
            letter-spacing:-.035em;
            line-height:1.05;
          ">
            ${introTitle}
          </div>

          <div style="
            font-size:12px;
            color:var(--text-dim);
            margin-top:8px;
          ">${introSubtitle}</div>

          <div style="
            width:min(230px,68vw);
            height:3px;
            margin:22px auto 0;
            border-radius:999px;
            overflow:hidden;
            background:rgba(255,255,255,.07);
          ">
            <div class="ls-login-intro-progress" style="
              width:0;
              height:100%;
              border-radius:999px;
              background:${accent};
              box-shadow:0 0 14px color-mix(in srgb, ${accent} 45%, transparent);
            "></div>
          </div>
        </div>
      </div>`;

    const style = document.createElement("style");
    style.id = "lsPostLoginIntroStyle";
    style.textContent = `
      @keyframes lsLoginIntroCardIn {
        from { opacity:0; transform:translateY(12px) scale(.975); }
        to { opacity:1; transform:translateY(0) scale(1); }
      }

      @keyframes lsLoginIntroMark {
        0% { transform:scale(.88) rotate(-5deg); opacity:0; }
        60% { transform:scale(1.05) rotate(2deg); opacity:1; }
        100% { transform:scale(1) rotate(0); opacity:1; }
      }

      @keyframes lsLoginIntroProgress {
        from { width:0; }
        to { width:100%; }
      }

      @keyframes lsLoginIntroOut {
        from { opacity:1; }
        to { opacity:0; }
      }

      #lsPostLoginIntro .ls-login-intro-card {
        animation:lsLoginIntroCardIn .34s cubic-bezier(.2,.8,.2,1) both;
      }

      #lsPostLoginIntro .ls-login-intro-mark {
        animation:lsLoginIntroMark .42s cubic-bezier(.2,.8,.2,1) both;
      }

      #lsPostLoginIntro .ls-login-intro-progress {
        animation:lsLoginIntroProgress .95s cubic-bezier(.2,.75,.25,1) .08s both;
      }

      #lsPostLoginIntro.ls-closing {
        animation:lsLoginIntroOut .18s ease forwards;
      }

      @media (prefers-reduced-motion:reduce) {
        #lsPostLoginIntro *,
        #lsPostLoginIntro {
          animation:none !important;
        }

        #lsPostLoginIntro .ls-login-intro-progress {
          width:100% !important;
        }
      }
    `;
    document.head.appendChild(style);

    const duration = reducedMotion ? 320 : 1120;

    setTimeout(() => {
      const intro = document.getElementById("lsPostLoginIntro");
      if (!intro) {
        style.remove();
        resolve();
        return;
      }

      intro.classList.add("ls-closing");

      setTimeout(() => {
        wrap.innerHTML = "";
        style.remove();
        resolve();
      }, reducedMotion ? 20 : 190);
    }, duration);
  });
}

// ============================================================
// AUTH
// ============================================================
function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    btnEl.textContent = "🙈";
  } else {
    input.type = "password";
    btnEl.textContent = "👁";
  }
}

function showAuth(mode) {
  renderAuthForm(mode);
}


const LS_REMEMBER_EMAIL_KEY = "livescroll_remembered_email";

function getRememberedLoginEmail() {
  return localStorage.getItem(LS_REMEMBER_EMAIL_KEY) || "";
}

function syncRememberedLoginEmail() {
  const emailInput = document.getElementById("authEmail");
  const rememberInput = document.getElementById("authRememberEmail");
  if (!emailInput || !rememberInput) return;

  const savedEmail = getRememberedLoginEmail();

  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberInput.checked = true;
  }
}

function saveRememberedLoginEmail() {
  const emailInput = document.getElementById("authEmail");
  const rememberInput = document.getElementById("authRememberEmail");
  if (!emailInput || !rememberInput) return;

  if (rememberInput.checked && emailInput.value.trim()) {
    localStorage.setItem(LS_REMEMBER_EMAIL_KEY, emailInput.value.trim());
  } else {
    localStorage.removeItem(LS_REMEMBER_EMAIL_KEY);
  }
}

function renderAuthForm(mode) {
  const wrap = document.getElementById("globalModalWrap");
  const isSignup = mode === "signup";
  const runtimeGeneration = getLiveScrollRuntimeGeneration();
  wrap.innerHTML = `
    <div class="ls-access-evolution" onclick="if(event.target===this) closeAuthModal()">
      <div class="ls-access-orb ls-access-orb-a" aria-hidden="true"></div>
      <div class="ls-access-orb ls-access-orb-b" aria-hidden="true"></div>
      <div class="auth-box ls-access-card">
        <button class="ls-access-close" onclick="closeAuthModal()" aria-label="Cerrar">✕</button>
        <div class="ls-access-brand" aria-label="LiveScroll ${runtimeGeneration}">
          <div class="ls-access-logo">${runtimeGeneration}</div>
          <div>
            <div class="ls-access-word">Live<span>Scroll</span></div>
            <small>${isSignup ? "CREÁ TU IDENTIDAD" : "VOLVÉ A CONECTAR"}</small>
          </div>
        </div>
        <div class="ls-access-tabs">
          <button onclick="renderAuthForm('login')" class="${!isSignup ? "btn" : "btn-outline"}" style="flex:1; padding:8px; font-size:13px;">Iniciar sesión</button>
          <button onclick="renderAuthForm('signup')" class="${isSignup ? "btn" : "btn-outline"}" style="flex:1; padding:8px; font-size:13px;">Crear cuenta</button>
        </div>
        <h2>${isSignup ? "Tu camino empieza acá" : "Qué bueno verte de nuevo"}</h2>
        <p class="ls-access-subtitle">${isSignup ? "Sumate a la próxima generación de creadores y usuarios." : "Ingresá para continuar recorriendo LiveScroll."}</p>
        ${isSignup && window.referralCode ? `<p style="font-size:12px; color:var(--gold); margin-top:-8px; margin-bottom:14px;">🎉 Te invitó @${escapeHtml(window.referralCode)}</p>` : ""}
        ${isSignup ? `
          <div class="field">
            <label>Nombre de usuario</label>
            <input type="text" id="authUsername" placeholder="ej: ezequieliutu" autocomplete="username">
          </div>` : ""}
        <div class="field">
          <label>Email</label>
          <input type="email" id="authEmail" placeholder="tu@email.com" autocomplete="email">
        </div>
        <div class="field">
          <label>Contraseña</label>
          <div class="password-field-wrap">
            <input type="password" id="authPassword" placeholder="••••••••" autocomplete="${isSignup ? "new-password" : "current-password"}">
            <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('authPassword', this)">👁</button>
          </div>
        </div>
        ${!isSignup ? `
          <div class="field" style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:10px;
            margin-top:-3px;
          ">
            <label for="authRememberEmail" style="
              display:flex;
              align-items:center;
              gap:7px;
              cursor:pointer;
              font-size:12px;
              color:var(--text-dim);
            ">
              <input type="checkbox" id="authRememberEmail">
              Recordar mi correo
            </label>
            <span style="font-size:9px;color:var(--text-dim);opacity:.75;">
              La contraseña la guarda tu dispositivo
            </span>
          </div>` : ""}
        ${isSignup ? `
          <div class="field" style="display:flex; align-items:flex-start; gap:8px;">
            <input type="checkbox" id="authAcceptTerms" style="margin-top:3px;">
            <label for="authAcceptTerms" style="font-size:12px; color:var(--text-dim); cursor:pointer;">
              Soy mayor de 18 años y acepto los <a href="terminos.html" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>.
            </label>
          </div>` : ""}
        <button class="btn ls-access-submit" style="width:100%" onclick="${isSignup ? "handleSignup()" : "handleLogin()"}">
          ${isSignup ? "Crear cuenta" : "Entrar"}
        </button>
        ${!isSignup ? `<div style="text-align:center; margin-top:10px;"><button onclick="handleForgotPassword()" style="background:none;border:none;color:var(--text-dim);font-size:12px;cursor:pointer;text-decoration:underline;">¿Olvidaste tu contraseña?</button></div>` : ""}
        <div id="authError" class="error-msg"></div>
      </div>
    </div>`;

  if (!isSignup) {
    setTimeout(syncRememberedLoginEmail, 0);
  }
}

function closeAuthModal() {
  document.getElementById("globalModalWrap").innerHTML = "";
}

async function handleSignup() {
  const username = document.getElementById("authUsername").value.trim();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const errEl = document.getElementById("authError");
  errEl.textContent = "";
  errEl.style.color = "";

  if (!username || !email || !password) {
    errEl.textContent = "Completá todos los campos.";
    return;
  }

  if (password.length < 8) {
    errEl.textContent = "La contraseña tiene que tener al menos 8 caracteres.";
    return;
  }

  if (!document.getElementById("authAcceptTerms").checked) {
    errEl.textContent = "Tenés que aceptar los Términos y Condiciones para continuar.";
    return;
  }

  let ip = null;
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    ip = (await ipRes.json()).ip;
  } catch (e) {
    // Si falla la detección de IP, seguimos igual sin bloquear el registro por eso
  }

  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { username, signup_ip: ip, ref: window.referralCode || null } }
  });
  if (error) { errEl.textContent = error.message; return; }

  currentUser = data.user;

  if (!data.session) {
    errEl.style.color = "var(--green)";
    errEl.textContent = "¡Cuenta creada! Revisá tu email para confirmar antes de iniciar sesión.";
    return;
  }

  await loadProfile();

  if (currentProfile && currentProfile.is_blocked) {
    errEl.style.color = "var(--red)";
    errEl.textContent = "Tu cuenta fue marcada para revisión. Contactanos si creés que es un error.";
    return;
  }

  closeAuthModal();

  // La primera entrada de una cuenta nueva también recibe la transición.
  await showPostLoginIntro();

  renderApp();
}

function showNewPasswordForm() {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  // La recuperación tiene su propia pantalla: no dejamos que el usuario
  // termine dentro del Feed/Perfil por haber abierto el enlace del correo.
  wrap.innerHTML = `
    <div id="lsPasswordRecoveryScreen" style="
      position:fixed;
      inset:0;
      z-index:500;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      overflow-y:auto;
      background:
        radial-gradient(circle at 50% 18%, rgba(214,177,82,.13), transparent 32%),
        #070a0f;
    ">
      <div class="auth-box" style="
        width:min(100%,430px);
        margin:0;
        border:1px solid var(--border);
        box-shadow:0 24px 80px rgba(0,0,0,.55);
      ">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="
            width:58px;height:58px;border-radius:18px;
            margin:0 auto 12px;
            display:flex;align-items:center;justify-content:center;
            background:rgba(214,177,82,.10);
            border:1px solid rgba(214,177,82,.28);
            font-size:26px;
          ">🔐</div>
          <div style="font-size:10px;letter-spacing:.14em;color:var(--gold);font-weight:900;">
            LIVESCROLL · SEGURIDAD
          </div>
          <h2 style="margin:6px 0 6px;">Crear nueva contraseña</h2>
          <div style="font-size:11px;line-height:1.5;color:var(--text-dim);">
            Elegí una contraseña nueva para volver a acceder a tu cuenta.
          </div>
        </div>

        <div class="field">
          <label>Nueva contraseña</label>
          <div class="password-field-wrap">
            <input
              type="password"
              id="newPasswordInput"
              autocomplete="new-password"
              placeholder="Mínimo 8 caracteres"
            >
            <button type="button" class="password-toggle-btn"
              onclick="togglePasswordVisibility('newPasswordInput', this)">👁</button>
          </div>
        </div>

        <div class="field">
          <label>Repetir contraseña</label>
          <div class="password-field-wrap">
            <input
              type="password"
              id="repeatNewPasswordInput"
              autocomplete="new-password"
              placeholder="Repetí la contraseña"
              onkeydown="if(event.key==='Enter') submitNewPassword()"
            >
            <button type="button" class="password-toggle-btn"
              onclick="togglePasswordVisibility('repeatNewPasswordInput', this)">👁</button>
          </div>
        </div>

        <div style="
          padding:10px 11px;
          margin:4px 0 13px;
          border:1px solid var(--border);
          border-radius:11px;
          color:var(--text-dim);
          font-size:10px;
          line-height:1.45;
        ">
          Por seguridad, después del cambio vas a volver al inicio de sesión
          y tendrás que entrar con tu contraseña nueva.
        </div>

        <button id="newPasswordSubmitBtn" class="btn" style="width:100%;min-height:48px;"
          onclick="submitNewPassword()">Cambiar contraseña</button>

        <div id="newPasswordError" class="error-msg" style="margin-top:10px;"></div>
      </div>
    </div>`;
}

async function submitNewPassword() {
  const password = document.getElementById("newPasswordInput")?.value || "";
  const repeat = document.getElementById("repeatNewPasswordInput")?.value || "";
  const errEl = document.getElementById("newPasswordError");
  const btn = document.getElementById("newPasswordSubmitBtn");

  if (errEl) {
    errEl.style.color = "";
    errEl.textContent = "";
  }

  if (!password || password.length < 8) {
    if (errEl) errEl.textContent = "La contraseña tiene que tener al menos 8 caracteres.";
    return;
  }

  if (password !== repeat) {
    if (errEl) errEl.textContent = "Las contraseñas no coinciden.";
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Cambiando contraseña...";
  }

  const { error } = await sb.auth.updateUser({ password });

  if (error) {
    if (errEl) errEl.textContent = error.message || "No pudimos cambiar la contraseña.";
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Cambiar contraseña";
    }
    return;
  }

  // La sesión del enlace de recuperación no se usa como sesión normal.
  // Al terminar, cerramos sesión y volvemos al Login.
  try {
    await sb.auth.signOut();
  } catch (_) {}

  currentUser = null;
  currentProfile = null;
  clearAllWatchIntervals?.();

  // Quitamos tokens/hash de recuperación de la barra del navegador.
  try {
    history.replaceState({}, document.title, window.location.pathname);
  } catch (_) {}

  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";

  renderLanding();
  showAuth("login");

  setTimeout(() => {
    const loginEmail = document.getElementById("authEmail");
    if (loginEmail) {
      const remembered = getRememberedLoginEmail?.();
      if (remembered && !loginEmail.value) loginEmail.value = remembered;
    }
  }, 0);

  showToast("Contraseña cambiada ✓ Iniciá sesión con tu contraseña nueva.");
}

async function handleForgotPassword() {
  const email = document.getElementById("authEmail").value.trim();
  const errEl = document.getElementById("authError");
  errEl.style.color = "";
  errEl.textContent = "";

  if (!email) {
    errEl.textContent = "Escribí tu email arriba primero, y volvé a tocar 'Olvidaste tu contraseña'.";
    return;
  }

  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname
  });

  if (error) { errEl.textContent = error.message; return; }

  errEl.style.color = "var(--green)";
  errEl.textContent = "Te mandamos un mail con un link para elegir una nueva contraseña. Revisá también Spam.";
}

async function handleLogin() {
  saveRememberedLoginEmail();

  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const errEl = document.getElementById("authError");
  errEl.textContent = "";

  lsExplicitLoginInProgress = true;
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      errEl.textContent = error.message;
      return;
    }
    await activateAuthenticatedSession(data.session || { user:data.user }, {
      openShared:true,
      explicitLogin:true
    });
  } finally {
    lsExplicitLoginInProgress = false;
  }
}

async function handleLogout() {
  // El cierre de sesión no depende únicamente del evento SIGNED_OUT.
  // Limpiamos la interfaz y el estado local inmediatamente para evitar
  // que el Feed quede visible hasta recargar la página.
  clearAllWatchIntervals();

  if (notifRealtimeChannel) {
    try {
      await sb.removeChannel(notifRealtimeChannel);
    } catch (_) {}
    notifRealtimeChannel = null;
  }
  notifRealtimeUserId = null;
  stopNotificationFallback();
  if (notifUiRefreshFrame) {
    cancelAnimationFrame(notifUiRefreshFrame);
    notifUiRefreshFrame = null;
  }

  const { error } = await sb.auth.signOut();

  if (error) {
    console.error("Error al cerrar sesión:", error);
    showToast("No pudimos cerrar la sesión. Intentá nuevamente.");
    return;
  }

  currentUser = null;
  currentProfile = null;

  // Limpiamos cualquier modal/panel que haya quedado abierto.
  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";

  const notifPanel = document.getElementById("notifPanel");
  if (notifPanel) notifPanel.remove();

  // Volvemos al inicio sin esperar a que onAuthStateChange vuelva a renderizar.
  renderLanding();

  try {
    history.replaceState({}, document.title, window.location.pathname);
  } catch (_) {}

  // Respaldo: verificamos que Supabase realmente haya eliminado la sesión.
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    console.warn("La sesión seguía activa después de signOut; reintentando cierre local.");
    try {
      await sb.auth.signOut({ scope: "local" });
    } catch (_) {}
  }
}

async function loadProfile() {
  const [profileResult, statusResult, creatorResult, ls7CustomizationResult, creatorProgramResult] = await Promise.all([
    sb.rpc("get_my_profile_data"),
    sb.rpc("get_my_status"),
    sb.rpc("get_my_creator_access"),
    isLiveScroll7App()
      ? sb.rpc("get_my_ls7_profile_customization")
      : Promise.resolve({ data:null, error:null }),
    sb.rpc("get_my_creator_program_status")
  ]);

  if (!profileResult.error && profileResult.data?.ok) {
    currentProfile = profileResult.data.profile;
    if (!ls7CustomizationResult?.error && ls7CustomizationResult?.data?.ok) {
      currentProfile.profile_featured_video_id = ls7CustomizationResult.data.profile_featured_video_id || null;
      currentProfile.profile_visual_style = ["electric","cosmic","minimal"].includes(ls7CustomizationResult.data.profile_visual_style)
        ? ls7CustomizationResult.data.profile_visual_style
        : "electric";
    }
  } else {
    console.error("No se pudo cargar el perfil privado:", profileResult.error || profileResult.data?.error);
    currentProfile = null;
    return;
  }

  const status = statusResult?.data;

  // Doble verificación de permisos:
  // - get_my_profile_data trae is_admin/is_blocked de forma privada.
  // - get_my_status queda como respaldo.
  if (status && currentProfile) {
    currentProfile.is_admin =
      currentProfile.is_admin === true || status.is_admin === true;

    if (typeof status.is_blocked === "boolean") {
      currentProfile.is_blocked = status.is_blocked;
    }
  }

  currentProfile.is_admin = currentProfile.is_admin === true;
  currentProfile.is_blocked = currentProfile.is_blocked === true;

  // 6.0.7v: las cuentas nuevas normales se verifican solas. Una sancion o
  // una señal sospechosa siempre permanece para revision humana.
  if (currentProfile.is_blocked) {
    const { data:autoVerification, error:autoVerificationError } = await sb.rpc("auto_verify_current_user");
    if (autoVerificationError) {
      console.warn("SMART VERIFICATION no pudo completar el control:", autoVerificationError.message);
    }
    if (autoVerification?.status === "verified") {
      currentProfile.is_blocked = false;
      currentProfile.auto_verification_reason = autoVerification.reason || "controles_superados";
    } else {
      currentProfile.auto_verification_reason = autoVerification?.reason || "revision_manual";
    }
  }

  currentProfile.is_creator = creatorResult?.data?.is_creator === true;
  currentProfile.creator_application_status = creatorResult?.data?.application_status || null;
  currentProfile.creator_video_count = Number(creatorResult?.data?.video_count || 0);
  currentProfile.creator_account_days = Number(creatorResult?.data?.account_days || 0);
  currentProfile.is_creator_verified = creatorProgramResult?.data?.is_creator_verified === true;
  currentProfile.creator_terms_version = creatorProgramResult?.data?.terms_version || null;
  currentProfile.creator_terms_accepted_at = creatorProgramResult?.data?.terms_accepted_at || null;

  // Una cuenta de streaming ya vinculada debe aparecer en el perfil sin que
  // el creador tenga que abrir Editar perfil ni copiar un enlace manual.
  if (currentProfile.is_creator && window.__lsStreamAutoSyncUserId !== currentUser?.id) {
    window.__lsStreamAutoSyncUserId = currentUser.id;
    setTimeout(() => loadStreamAccountConnectionStatus(), 0);
  }
}

// ============================================================
// LANDING
// ============================================================
function renderLanding() {
  ensureMobileStabilityLayer();
  document.getElementById("lsMobileDock")?.remove();
  document.body.classList.remove("ls-navigation-ready");
  closeMobileMenu();
  document.getElementById("landingView").classList.remove("hidden");
  document.getElementById("appView").classList.add("hidden");
  document.getElementById("navLinks").innerHTML = "";
  document.getElementById("navRight").innerHTML = `
    <button class="btn-outline" onclick="showAuth('login')">Iniciar sesión</button>`;

  if (window.sharedVideoId) {
    const hero = document.querySelector(".hero");
    if (hero && !document.getElementById("sharedVideoTeaser")) {
      const teaser = document.createElement("div");
      teaser.id = "sharedVideoTeaser";
      teaser.className = "form-card";
      teaser.style.cssText = "max-width:460px; margin:0 auto 24px; border-color:var(--gold-dim); text-align:center;";
      teaser.innerHTML = `<p style="margin:0; font-size:14px;">👀 Te compartieron un clip en LiveScroll. <strong style="color:var(--gold);">Creá tu cuenta o iniciá sesión</strong> para verlo.</p>`;
      hero.insertBefore(teaser, hero.firstChild);
    }
  }
}

let landingOdometerRefreshTimer = null;

async function animateLandingOdometer() {
  const el = document.getElementById("landingOdometer");
  if (!el) return;

  // Puede llamarse al iniciar y también al volver al landing. Conservamos
  // un solo reloj para evitar consultas duplicadas cada 60 segundos.
  if (landingOdometerRefreshTimer) {
    clearInterval(landingOdometerRefreshTimer);
    landingOdometerRefreshTimer = null;
  }

  const { data, error } = await sb.rpc("get_todays_total_points");
  if (!error && data !== null) {
    el.textContent = data.toLocaleString("es-AR");
  } else {
    el.textContent = "0";
  }

  // Refresca cada 60s para que se sienta viva, siempre con el dato real
  landingOdometerRefreshTimer = setInterval(async () => {
    const currentEl = document.getElementById("landingOdometer");
    if (!currentEl || document.hidden || currentUser) return;
    const { data: fresh } = await sb.rpc("get_todays_total_points");
    if (fresh !== null && fresh !== undefined) currentEl.textContent = fresh.toLocaleString("es-AR");
  }, 60000);
}


// ============================================================
// LIVESCROLL 5.8.4 · CONFIGURACIÓN + ACCESIBILIDAD V1
// - Zoom completamente bloqueado (pinch/doble toque/ctrl+wheel)
// - Configuración en menú hamburguesa
// - Visión cómoda
// - Contraste
// - Peso de fuente
// - Vista previa
// - Aplicar / Cancelar
// ============================================================


const LS_SETTINGS_KEY = "livescroll_ui_settings_v584";
const LS_SETTINGS_DEFAULTS = {
  vision: "normal",
  contrast: "normal",
  fontWeight: "normal",
  seasonalTheme: "auto"
};

let lsSettingsDraft = null;

function getLiveScrollSettings() {
  try {
    return {
      ...LS_SETTINGS_DEFAULTS,
      ...(JSON.parse(localStorage.getItem(LS_SETTINGS_KEY) || "{}") || {})
    };
  } catch (_) {
    return { ...LS_SETTINGS_DEFAULTS };
  }
}

function saveLiveScrollSettings(settings) {
  localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
}

function ensureLiveScrollAccessibilityStyles() {
  if (document.getElementById("lsAccessibilityV584Styles")) return;

  const style = document.createElement("style");
  style.id = "lsAccessibilityV584Styles";
  style.textContent = `
    html, body {
      touch-action: pan-x pan-y;
      -ms-touch-action: pan-x pan-y;
    }

    body.ls-vision-large {
      --ls-access-font-scale: 1.10;
    }

    body.ls-vision-xlarge {
      --ls-access-font-scale: 1.20;
    }

    body.ls-vision-large main,
    body.ls-vision-large .modal-box,
    body.ls-vision-large .mobile-menu-panel {
      font-size: calc(1em * var(--ls-access-font-scale));
    }

    body.ls-vision-xlarge main,
    body.ls-vision-xlarge .modal-box,
    body.ls-vision-xlarge .mobile-menu-panel {
      font-size: calc(1em * var(--ls-access-font-scale));
    }

    body.ls-vision-large button,
    body.ls-vision-large input,
    body.ls-vision-large select,
    body.ls-vision-large textarea {
      min-height: 44px;
    }

    body.ls-vision-xlarge button,
    body.ls-vision-xlarge input,
    body.ls-vision-xlarge select,
    body.ls-vision-xlarge textarea {
      min-height: 48px;
      font-size: 1.06em;
    }

    body.ls-font-medium,
    body.ls-font-medium button,
    body.ls-font-medium input,
    body.ls-font-medium select,
    body.ls-font-medium textarea {
      font-weight: 550;
    }

    body.ls-font-strong,
    body.ls-font-strong button,
    body.ls-font-strong input,
    body.ls-font-strong select,
    body.ls-font-strong textarea {
      font-weight: 650;
    }

    body.ls-high-contrast {
      --text:#ffffff;
      --text-dim:#d8dde5;
      --border:rgba(255,255,255,.24);
    }

    body.ls-high-contrast .modal-box,
    body.ls-high-contrast .form-card,
    body.ls-high-contrast .video-card,
    body.ls-high-contrast .profile-card,
    body.ls-high-contrast .ledger-row {
      border-color:rgba(255,255,255,.25) !important;
    }


    /* ======================================================
       5.8.4 · ACCESIBILIDAD TAMBIÉN EN CARTELES / MODALES
       ====================================================== */

    body.ls-vision-large #globalModalWrap .modal-box {
      --ls-modal-scale:1.10;
    }

    body.ls-vision-xlarge #globalModalWrap .modal-box {
      --ls-modal-scale:1.22;
    }

    #globalModalWrap .modal-box {
      --ls-modal-scale:1;
    }

    /* Escalamos tipografías comunes usadas en carteles sin romper jerarquías. */
    body.ls-vision-large #globalModalWrap [style*="font-size:8px"],
    body.ls-vision-large #globalModalWrap [style*="font-size: 8px"] {
      font-size:9px !important;
    }
    body.ls-vision-large #globalModalWrap [style*="font-size:9px"],
    body.ls-vision-large #globalModalWrap [style*="font-size: 9px"] {
      font-size:10px !important;
    }
    body.ls-vision-large #globalModalWrap [style*="font-size:10px"],
    body.ls-vision-large #globalModalWrap [style*="font-size: 10px"] {
      font-size:11px !important;
    }
    body.ls-vision-large #globalModalWrap [style*="font-size:11px"],
    body.ls-vision-large #globalModalWrap [style*="font-size: 11px"] {
      font-size:12px !important;
    }
    body.ls-vision-large #globalModalWrap [style*="font-size:12px"],
    body.ls-vision-large #globalModalWrap [style*="font-size: 12px"] {
      font-size:13px !important;
    }
    body.ls-vision-large #globalModalWrap [style*="font-size:13px"],
    body.ls-vision-large #globalModalWrap [style*="font-size: 13px"] {
      font-size:14px !important;
    }
    body.ls-vision-large #globalModalWrap [style*="font-size:14px"],
    body.ls-vision-large #globalModalWrap [style*="font-size: 14px"] {
      font-size:15px !important;
    }
    body.ls-vision-large #globalModalWrap [style*="font-size:16px"],
    body.ls-vision-large #globalModalWrap [style*="font-size: 16px"] {
      font-size:18px !important;
    }
    body.ls-vision-large #globalModalWrap [style*="font-size:18px"],
    body.ls-vision-large #globalModalWrap [style*="font-size: 18px"] {
      font-size:20px !important;
    }
    body.ls-vision-large #globalModalWrap [style*="font-size:20px"],
    body.ls-vision-large #globalModalWrap [style*="font-size: 20px"] {
      font-size:22px !important;
    }
    body.ls-vision-large #globalModalWrap [style*="font-size:22px"],
    body.ls-vision-large #globalModalWrap [style*="font-size: 22px"] {
      font-size:24px !important;
    }

    body.ls-vision-xlarge #globalModalWrap [style*="font-size:8px"],
    body.ls-vision-xlarge #globalModalWrap [style*="font-size: 8px"] {
      font-size:10px !important;
    }
    body.ls-vision-xlarge #globalModalWrap [style*="font-size:9px"],
    body.ls-vision-xlarge #globalModalWrap [style*="font-size: 9px"] {
      font-size:11px !important;
    }
    body.ls-vision-xlarge #globalModalWrap [style*="font-size:10px"],
    body.ls-vision-xlarge #globalModalWrap [style*="font-size: 10px"] {
      font-size:12px !important;
    }
    body.ls-vision-xlarge #globalModalWrap [style*="font-size:11px"],
    body.ls-vision-xlarge #globalModalWrap [style*="font-size: 11px"] {
      font-size:13px !important;
    }
    body.ls-vision-xlarge #globalModalWrap [style*="font-size:12px"],
    body.ls-vision-xlarge #globalModalWrap [style*="font-size: 12px"] {
      font-size:15px !important;
    }
    body.ls-vision-xlarge #globalModalWrap [style*="font-size:13px"],
    body.ls-vision-xlarge #globalModalWrap [style*="font-size: 13px"] {
      font-size:16px !important;
    }
    body.ls-vision-xlarge #globalModalWrap [style*="font-size:14px"],
    body.ls-vision-xlarge #globalModalWrap [style*="font-size: 14px"] {
      font-size:17px !important;
    }
    body.ls-vision-xlarge #globalModalWrap [style*="font-size:16px"],
    body.ls-vision-xlarge #globalModalWrap [style*="font-size: 16px"] {
      font-size:20px !important;
    }
    body.ls-vision-xlarge #globalModalWrap [style*="font-size:18px"],
    body.ls-vision-xlarge #globalModalWrap [style*="font-size: 18px"] {
      font-size:22px !important;
    }
    body.ls-vision-xlarge #globalModalWrap [style*="font-size:20px"],
    body.ls-vision-xlarge #globalModalWrap [style*="font-size: 20px"] {
      font-size:25px !important;
    }
    body.ls-vision-xlarge #globalModalWrap [style*="font-size:22px"],
    body.ls-vision-xlarge #globalModalWrap [style*="font-size: 22px"] {
      font-size:27px !important;
    }

    /* Botones y controles de los carteles también siguen Visión cómoda. */
    body.ls-vision-large #globalModalWrap button,
    body.ls-vision-large #globalModalWrap input,
    body.ls-vision-large #globalModalWrap select,
    body.ls-vision-large #globalModalWrap textarea {
      min-height:44px !important;
    }

    body.ls-vision-xlarge #globalModalWrap button,
    body.ls-vision-xlarge #globalModalWrap input,
    body.ls-vision-xlarge #globalModalWrap select,
    body.ls-vision-xlarge #globalModalWrap textarea {
      min-height:48px !important;
    }

    /* Peso de texto: aplica también a Novedades y cualquier cartel futuro. */
    body.ls-font-medium #globalModalWrap,
    body.ls-font-medium #globalModalWrap button,
    body.ls-font-medium #globalModalWrap input,
    body.ls-font-medium #globalModalWrap select,
    body.ls-font-medium #globalModalWrap textarea {
      font-weight:550 !important;
    }

    body.ls-font-strong #globalModalWrap,
    body.ls-font-strong #globalModalWrap button,
    body.ls-font-strong #globalModalWrap input,
    body.ls-font-strong #globalModalWrap select,
    body.ls-font-strong #globalModalWrap textarea {
      font-weight:650 !important;
    }

    body.ls-font-strong #globalModalWrap h1,
    body.ls-font-strong #globalModalWrap h2,
    body.ls-font-strong #globalModalWrap h3,
    body.ls-font-strong #globalModalWrap strong {
      font-weight:900 !important;
    }

    /* Contraste alto: Novedades, tutorial, términos, configuración, perfil, etc. */
    body.ls-high-contrast #globalModalWrap .modal-overlay {
      background:rgba(0,0,0,.88) !important;
    }

    body.ls-high-contrast #globalModalWrap .modal-box {
      background:#07090d !important;
      border-color:rgba(255,255,255,.34) !important;
      color:#ffffff !important;
      box-shadow:0 24px 80px rgba(0,0,0,.75) !important;
    }

    body.ls-high-contrast #globalModalWrap .modal-box-body,
    body.ls-high-contrast #globalModalWrap .modal-box-footer,
    body.ls-high-contrast #globalModalWrap .modal-box-header {
      color:#ffffff !important;
    }

    body.ls-high-contrast #globalModalWrap [style*="color:var(--text-dim)"],
    body.ls-high-contrast #globalModalWrap [style*="color: var(--text-dim)"] {
      color:#e6e9ef !important;
    }

    body.ls-high-contrast #globalModalWrap [style*="border:1px solid var(--border)"],
    body.ls-high-contrast #globalModalWrap [style*="border: 1px solid var(--border)"] {
      border-color:rgba(255,255,255,.30) !important;
    }

    /* Evita que Extra grande haga imposible usar carteles en celular. */
    body.ls-vision-large #globalModalWrap .modal-box,
    body.ls-vision-xlarge #globalModalWrap .modal-box {
      max-height:92dvh !important;
      overflow:hidden;
    }

    body.ls-vision-large #globalModalWrap .modal-box-body,
    body.ls-vision-xlarge #globalModalWrap .modal-box-body {
      overflow-y:auto !important;
      min-height:0;
    }

    .ls-settings-grid {
      display:grid;
      grid-template-columns:1fr;
      gap:14px;
    }

    .ls-settings-section {
      border:1px solid var(--border);
      border-radius:14px;
      padding:13px;
      background:rgba(255,255,255,.018);
    }

    .ls-settings-title {
      font-size:12px;
      font-weight:900;
      margin-bottom:4px;
    }

    .ls-settings-help {
      font-size:10px;
      line-height:1.45;
      color:var(--text-dim);
      margin-bottom:10px;
    }

    .ls-settings-options {
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:7px;
    }

    .ls-settings-option {
      min-height:40px;
      padding:8px 7px;
      border:1px solid var(--border);
      border-radius:10px;
      background:var(--panel-2);
      color:var(--text-dim);
      cursor:pointer;
      font-family:inherit;
      font-size:10px;
      font-weight:750;
    }

    .ls-settings-option.active {
      color:var(--text);
      border-color:var(--gold);
      box-shadow:0 0 0 1px color-mix(in srgb,var(--gold) 35%,transparent);
      background:color-mix(in srgb,var(--gold) 8%,var(--panel-2));
    }

    .ls-settings-preview {
      border:1px solid var(--border);
      border-radius:15px;
      padding:14px;
      background:var(--ink);
      overflow:hidden;
    }

    .ls-settings-preview-card {
      border:1px solid var(--border);
      border-radius:12px;
      background:var(--panel);
      padding:12px;
      transition:all .18s ease;
    }

    .ls-settings-preview-card[data-vision="large"] {
      font-size:15px;
    }

    .ls-settings-preview-card[data-vision="xlarge"] {
      font-size:17px;
    }

    .ls-settings-preview-card[data-contrast="high"] {
      color:#fff;
      border-color:rgba(255,255,255,.36);
      background:#090b0f;
    }

    .ls-settings-preview-card[data-weight="medium"] {
      font-weight:550;
    }

    .ls-settings-preview-card[data-weight="strong"] {
      font-weight:700;
    }

    @media(max-width:420px) {
      .ls-settings-options {
        grid-template-columns:1fr;
      }
    }
  `;
  document.head.appendChild(style);
}

function installLiveScrollZoomLock() {
  if (window.__lsZoomLockInstalled) return;
  window.__lsZoomLockInstalled = true;

  // Refuerza el viewport aunque index.html todavía tenga el meta anterior.
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement("meta");
    viewport.name = "viewport";
    document.head.appendChild(viewport);
  }
  viewport.setAttribute(
    "content",
    "width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover"
  );

  document.addEventListener("gesturestart", e => e.preventDefault(), { passive:false });
  document.addEventListener("gesturechange", e => e.preventDefault(), { passive:false });
  document.addEventListener("gestureend", e => e.preventDefault(), { passive:false });

  document.addEventListener("touchmove", e => {
    if (e.touches && e.touches.length > 1) e.preventDefault();
  }, { passive:false });

  let lastTouchEnd = 0;
  document.addEventListener("touchend", e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive:false });

  window.addEventListener("wheel", e => {
    if (e.ctrlKey || e.metaKey) e.preventDefault();
  }, { passive:false });

  window.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && ["+","=","-","0"].includes(e.key)) {
      e.preventDefault();
    }
  });
}

function applyLiveScrollSettings(settings = getLiveScrollSettings()) {
  ensureLiveScrollAccessibilityStyles();

  const body = document.body;
  if (!body) return;

  body.classList.remove(
    "ls-vision-large",
    "ls-vision-xlarge",
    "ls-high-contrast",
    "ls-font-medium",
    "ls-font-strong"
  );

  if (settings.vision === "large") body.classList.add("ls-vision-large");
  if (settings.vision === "xlarge") body.classList.add("ls-vision-xlarge");
  if (settings.contrast === "high") body.classList.add("ls-high-contrast");
  if (settings.fontWeight === "medium") body.classList.add("ls-font-medium");
  if (settings.fontWeight === "strong") body.classList.add("ls-font-strong");

  document.documentElement.lang =
    settings.language === "en" ? "en" :
    settings.language === "pt" ? "pt-BR" : "es";

  window.__lsLanguage = settings.language;

  if (typeof applySeasonalTheme === "function") {
    applySeasonalTheme();
  }

  // La elección de idioma ahora sí se refleja inmediatamente en la interfaz.
}

function lsSettingsLabel(group, value) {
  const labels = {
    vision:{ normal:"Normal", large:"Grande", xlarge:"Extra grande" },
    contrast:{ normal:"Normal", high:"Alto" },
    fontWeight:{ normal:"Normal", medium:"Medio", strong:"Fuerte" }
  };
  return labels[group]?.[value] || value;
}

function openLiveScrollSettings() {
  ensureLiveScrollAccessibilityStyles();
  lsSettingsDraft = { ...getLiveScrollSettings() };

  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked" data-modal-locked="1" style="z-index:270;">
      <div class="modal-box" style="
        max-width:520px;
        max-height:92dvh;
        overflow:hidden;
        display:flex;
        flex-direction:column;
      ">
        <div class="modal-box-header" style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
        ">
          <div>
            <h2 style="margin:0;font-size:20px;">⚙️ Configuración</h2>
            <div style="font-size:10px;color:var(--text-dim);margin-top:4px;">
              Apariencia y accesibilidad
            </div>
          </div>

          <button
            type="button"
            onclick="cancelLiveScrollSettings()"
            aria-label="Cerrar"
            style="
              width:40px;height:40px;min-width:40px;border-radius:50%;
              border:1px solid var(--border);background:var(--panel-2);
              color:var(--text);font-size:18px;cursor:pointer;
            "
          >✕</button>
        </div>

        <div class="modal-box-body" style="overflow-y:auto;min-height:0;">
          <div class="ls-settings-grid">

            <div class="ls-settings-section">
              <div class="ls-settings-title">👁️ Visión cómoda</div>
              <div class="ls-settings-help">
                Agranda texto, botones y controles de forma ordenada sin usar zoom.
              </div>
              <div class="ls-settings-options">
                ${["normal","large","xlarge"].map(v => `
                  <button class="ls-settings-option"
                    data-setting="vision" data-value="${v}"
                    onclick="setLiveScrollDraft('vision','${v}')">
                    ${lsSettingsLabel("vision",v)}
                  </button>
                `).join("")}
              </div>
            </div>

            <div class="ls-settings-section">
              <div class="ls-settings-title">◐ Contraste</div>
              <div class="ls-settings-help">
                Aumenta la diferencia entre texto, fondos y bordes.
              </div>
              <div class="ls-settings-options" style="grid-template-columns:repeat(2,minmax(0,1fr));">
                ${["normal","high"].map(v => `
                  <button class="ls-settings-option"
                    data-setting="contrast" data-value="${v}"
                    onclick="setLiveScrollDraft('contrast','${v}')">
                    ${lsSettingsLabel("contrast",v)}
                  </button>
                `).join("")}
              </div>
            </div>

            <div class="ls-settings-section">
              <div class="ls-settings-title">Aa · Fuerza de texto</div>
              <div class="ls-settings-help">
                Elegí qué tan marcada querés ver la letra.
              </div>
              <div class="ls-settings-options">
                ${["normal","medium","strong"].map(v => `
                  <button class="ls-settings-option"
                    data-setting="fontWeight" data-value="${v}"
                    onclick="setLiveScrollDraft('fontWeight','${v}')">
                    ${lsSettingsLabel("fontWeight",v)}
                  </button>
                `).join("")}
              </div>
            </div>

            ${isLiveScroll7App() ? `
              <div class="ls-settings-section">
                <div class="ls-settings-title">🌦️ Ambiente de temporada</div>
                <div class="ls-settings-help">
                  Automático sigue el calendario argentino. También podés elegir una temporada o apagar los efectos solo en este dispositivo.
                </div>
                <select
                  id="lsPersonalSeasonalSelect"
                  aria-label="Ambiente de temporada"
                  onchange="setLiveScrollDraft('seasonalTheme',this.value)"
                  style="width:100%;min-height:44px;padding:9px 11px;border:1px solid var(--border);border-radius:10px;background:var(--panel-2);color:var(--text);font:inherit;"
                >
                  <option value="auto">🗓️ Automático según la fecha</option>
                  <option value="off">⚫ Desactivado</option>
                  ${Object.entries(LS_SEASONAL_THEMES)
                    .filter(([key]) => key !== "normal")
                    .map(([key, theme]) => `<option value="${key}">${theme.emoji} ${theme.label}</option>`)
                    .join("")}
                </select>
                <div id="lsPersonalSeasonalStatus" style="margin-top:8px;color:var(--text-dim);font-size:9px;line-height:1.4;"></div>
              </div>
            ` : ""}

            <div>
              <div style="
                font-size:10px;
                font-weight:900;
                color:var(--text-dim);
                letter-spacing:.06em;
                margin:0 0 7px 2px;
              ">VISTA PREVIA</div>

              <div class="ls-settings-preview">
                <div id="lsSettingsPreviewCard" class="ls-settings-preview-card">
                  <div style="display:flex;align-items:center;gap:9px;margin-bottom:10px;">
                    <div style="
                      width:38px;height:38px;border-radius:50%;
                      display:flex;align-items:center;justify-content:center;
                      background:var(--panel-2);font-size:18px;
                    ">🎬</div>
                    <div>
                      <div style="font-weight:900;">LiveScroll</div>
                      <div style="font-size:.78em;color:var(--text-dim);">@usuario</div>
                    </div>
                  </div>

                  <div style="line-height:1.48;">
                    Así vas a ver los textos, botones y elementos principales de la interfaz.
                  </div>

                  <button class="btn" style="margin-top:11px;width:100%;pointer-events:none;">
                    Botón de ejemplo
                  </button>
                </div>
              </div>
            </div>

            <div style="
              border:1px solid var(--border);
              border-radius:12px;
              padding:11px 12px;
              color:var(--text-dim);
              font-size:10px;
              line-height:1.5;
            ">
              🔒 El zoom de la página está desactivado. Visión cómoda permite
              agrandar la interfaz sin deformarla.
            </div>

            <div style="
              border:1px solid var(--border);
              border-radius:14px;
              padding:13px;
              background:rgba(255,255,255,.018);
            ">
              <div style="font-size:12px;font-weight:900;margin-bottom:4px;">
                ↺ Restablecer apariencia
              </div>
              <div style="
                font-size:10px;
                line-height:1.45;
                color:var(--text-dim);
                margin-bottom:10px;
              ">
                Volvé a la apariencia original de LiveScroll: visión, contraste
                y fuerza de texto en Normal.
              </div>
              <button
                type="button"
                class="btn-outline"
                style="width:100%;min-height:44px;"
                onclick="resetLiveScrollSettings()"
              >Restablecer valores</button>
            </div>

            ${isLiveScroll7App() ? `
              <div class="ls7-runtime-settings-card">
                <div class="ls7-runtime-settings-head"><span>${getLiveScrollRuntimeGeneration()}</span><div><strong>Experiencia LiveScroll ${getLiveScrollRuntimeGeneration()}</strong><small>Entrada exclusiva de la aplicación Android</small></div></div>
                <p>Esta versión reemplaza el antiguo Portal 6 por una bienvenida propia, más directa y preparada para la nueva generación.</p>
                <button type="button" class="btn-outline" style="width:100%;min-height:46px;" onclick="replayLiveScroll7LoginWelcome()">▶ Volver a ver la bienvenida</button>
              </div>` : `
              <div style="border:1px solid rgba(250,204,21,.28);border-radius:14px;padding:13px;background:linear-gradient(135deg,rgba(250,204,21,.07),rgba(72,221,242,.045));">
                <div style="font-size:12px;font-weight:900;margin-bottom:4px;color:var(--gold);">✨ Portal LiveScroll 6</div>
                <div style="font-size:10px;line-height:1.45;color:var(--text-dim);margin-bottom:10px;">Probá nuevamente la puerta, el acceso mantenido y el viaje hacia la nueva era. En Legacy se abre una versión liviana.</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                  <button type="button" class="btn-outline" style="min-height:44px;padding:9px;" onclick="replayLiveScrollRoadTo6Intro()">▶ Presentación completa</button>
                  <button type="button" class="btn-outline" style="min-height:44px;padding:9px;" onclick="replayLiveScrollPortalOnly()">🌀 Solo portal</button>
                </div>
                <button type="button" class="btn-outline ls7-settings-replay" style="width:100%;min-height:46px;margin-top:8px;" onclick="replayLiveScroll7Pulse()">◈ Volver a ver LiveScroll 7 · El Pulso</button>
              </div>`}

            <div style="border:1px solid rgba(103,232,249,.25);border-radius:14px;padding:13px;background:rgba(103,232,249,.045);">
              <div style="font-size:12px;font-weight:900;margin-bottom:4px;color:#67e8f9;">🙈 Videos ocultos</div>
              <div style="font-size:10px;line-height:1.45;color:var(--text-dim);margin-bottom:10px;">
                Revisá los videos que marcaste como “No me interesa” y volvé a mostrarlos cuando quieras.
              </div>
              <button type="button" class="btn-outline" style="width:100%;min-height:44px;" onclick="openHiddenVideosManager()">Administrar videos ocultos</button>
            </div>

            ${isLiveScroll7App() ? `
              <div class="ls7-runtime-status-card">
                <div class="ls7-runtime-status-head"><span></span><strong>LiveScroll ${getLiveScrollRuntimeGeneration()} · Desarrollo activo</strong></div>
                <p>Estás dentro de LiveScroll ${getLiveScrollRuntimeGeneration()} para Android. La cuenta, el contenido y las funciones actuales siguen sincronizados.</p>
                <button type="button" class="btn-outline" onclick="showLiveScroll7AppNotice()">Conocer esta etapa</button>
              </div>` : `
              <div class="ls6-active-support-card">
                <div class="ls6-active-support-head"><span></span><strong>LiveScroll 6 · Activo y con soporte</strong></div>
                <p>Las nuevas funciones están pausadas mientras construimos LiveScroll 7. LiveScroll 6 continúa funcionando y recibirá mantenimiento, seguridad y correcciones urgentes.</p>
                <button type="button" class="btn-outline" onclick="showLiveScroll6BridgeNotice({manual:true})">Leer comunicado</button>
              </div>`}
          </div>
        </div>

        <div class="modal-box-footer" style="
          display:flex;
          gap:10px;
          position:sticky;
          bottom:0;
          background:var(--panel);
          border-top:1px solid var(--border);
        ">
          <button class="btn-outline" style="flex:1;min-height:48px;"
            onclick="cancelLiveScrollSettings()">Cancelar</button>
          <button class="btn" style="flex:1;min-height:48px;"
            onclick="applyLiveScrollSettingsDraft()">Aplicar cambios</button>
        </div>
      </div>
    </div>`;

  refreshLiveScrollSettingsUI();
}

function replayLiveScrollRoadTo6Intro() {
  try { localStorage.removeItem("livescroll_portal_600_seen"); } catch (_) {}
  const url = new URL(window.location.href);
  url.searchParams.set("preview600", "1");
  url.searchParams.delete("portalOnly");
  window.location.href = url.toString();
}

window.replayLiveScrollRoadTo6Intro = replayLiveScrollRoadTo6Intro;

function replayLiveScrollPortalOnly() {
  const url = new URL(window.location.href);
  url.searchParams.set("preview600", "1");
  url.searchParams.set("portalOnly", "1");
  window.location.href = url.toString();
}

window.replayLiveScrollPortalOnly = replayLiveScrollPortalOnly;

async function openHiddenVideosManager() {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;
  wrap.innerHTML = `<div class="modal-overlay ls-modal-locked" data-modal-locked="1" style="z-index:280;">
    <div class="modal-box" style="max-width:520px;max-height:92dvh;display:flex;flex-direction:column;">
      <div class="modal-box-header" style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
        <div><h2 style="margin:0;font-size:20px;">🙈 Videos ocultos</h2><div style="font-size:10px;color:var(--text-dim);margin-top:4px;">Sólo vos podés ver esta lista</div></div>
        <button type="button" onclick="openLiveScrollSettings()" aria-label="Volver" class="btn-outline" style="min-height:40px;">← Volver</button>
      </div>
      <div class="modal-box-body" style="overflow-y:auto;min-height:0;">
        <div id="hiddenVideosList" style="color:var(--text-dim);">Cargando...</div>
      </div>
    </div>
  </div>`;
  let { data, error } = await sb.rpc("get_my_hidden_videos");
  // Recuperación para instalaciones donde la función anterior quedó desactualizada.
  if (error) {
    const hiddenResult = await sb
      .from("user_hidden_videos")
      .select("video_id,created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending:false });
    if (!hiddenResult.error) {
      const rows = hiddenResult.data || [];
      const ids = rows.map(row => row.video_id);
      const videoResult = ids.length
        ? await sb.from("videos").select("id,title,thumbnail_url").in("id", ids)
        : { data:[], error:null };
      const byId = new Map((videoResult.data || []).map(video => [video.id, video]));
      data = rows.map(row => ({
        video_id:row.video_id,
        title:byId.get(row.video_id)?.title || "Video",
        thumbnail_url:byId.get(row.video_id)?.thumbnail_url || null,
        hidden_at:row.created_at
      }));
      error = videoResult.error;
    }
  }
  const list = document.getElementById("hiddenVideosList");
  if (!list) return;
  if (error) { list.textContent = "No pudimos cargar los videos ocultos."; return; }
  const videos = data || [];
  if (!videos.length) { list.innerHTML = `<div class="form-card" style="text-align:center;padding:24px;">No tenés videos ocultos ✓</div>`; return; }
  list.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;"><span>${videos.length} video${videos.length === 1 ? "" : "s"}</span><button class="btn-outline" onclick="restoreAllHiddenVideos()">Restaurar todos</button></div>${videos.map(video => `<div class="ledger-row" id="hidden-video-${video.video_id}" style="gap:10px;"><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(video.title || "Video")}</span><button class="btn-outline" style="flex:none;" onclick="restoreHiddenVideo('${video.video_id}')">Restaurar</button></div>`).join("")}`;
}
window.openHiddenVideosManager = openHiddenVideosManager;

async function restoreHiddenVideo(videoId) {
  const { data, error } = await sb.rpc("restore_hidden_video", { p_video_id:videoId });
  if (error || !data?.ok) return showToast("No se pudo restaurar el video");
  document.getElementById(`hidden-video-${videoId}`)?.remove();
  lsPerfCache.feed = { data:null, at:0 };
  showToast("Video restaurado ✓");
  if (currentTab === "feed") renderFeed();
  else openHiddenVideosManager();
}
window.restoreHiddenVideo = restoreHiddenVideo;

async function restoreAllHiddenVideos() {
  if (!confirm("¿Volver a mostrar todos los videos ocultos?")) return;
  const { data, error } = await sb.rpc("restore_all_hidden_videos");
  if (error || !data?.ok) return showToast("No se pudieron restaurar los videos");
  lsPerfCache.feed = { data:null, at:0 };
  showToast(`${Number(data.restored || 0)} video(s) restaurado(s)`);
  if (currentTab === "feed") renderFeed();
  else openHiddenVideosManager();
}
window.restoreAllHiddenVideos = restoreAllHiddenVideos;

function setLiveScrollDraft(key, value) {
  if (!lsSettingsDraft) lsSettingsDraft = { ...getLiveScrollSettings() };
  lsSettingsDraft[key] = value;
  refreshLiveScrollSettingsUI();
}

function refreshLiveScrollSettingsUI() {
  if (!lsSettingsDraft) return;

  document.querySelectorAll(".ls-settings-option[data-setting]").forEach(btn => {
    btn.classList.toggle(
      "active",
      lsSettingsDraft[btn.dataset.setting] === btn.dataset.value
    );
  });

  const seasonalSelect = document.getElementById("lsPersonalSeasonalSelect");
  if (seasonalSelect) {
    const validSeason = lsSettingsDraft.seasonalTheme === "auto" ||
      lsSettingsDraft.seasonalTheme === "off" ||
      !!LS_SEASONAL_THEMES[lsSettingsDraft.seasonalTheme];
    seasonalSelect.value = validSeason ? lsSettingsDraft.seasonalTheme : "auto";
  }

  const seasonalStatus = document.getElementById("lsPersonalSeasonalStatus");
  if (seasonalStatus) {
    const choice = lsSettingsDraft.seasonalTheme || "auto";
    const automatic = getAutomaticSeasonalTheme();
    const automaticLabel = LS_SEASONAL_THEMES[automatic]?.label || "LiveScroll normal";
    seasonalStatus.textContent = choice === "auto"
      ? `Ahora se aplicará: ${automaticLabel}.`
      : choice === "off"
        ? "Los fondos, luces y partículas estacionales quedarán apagados."
        : `Selección manual: ${LS_SEASONAL_THEMES[choice]?.label || choice}.`;
  }

  const preview = document.getElementById("lsSettingsPreviewCard");
  if (preview) {
    preview.dataset.vision = lsSettingsDraft.vision;
    preview.dataset.contrast = lsSettingsDraft.contrast;
    preview.dataset.weight = lsSettingsDraft.fontWeight;
  }
}

function cancelLiveScrollSetting…159598 tokens truncated…perfil para que aparezca inmediatamente
  // en la lista de medallas equipables.
  lsPerfCache.profileVideos.at = 0;

  showToast(`🏅 ¡${data.badge_name || "Medalla"} agregada a tu colección!`);
  renderStore();
}

async function handleBuyStoreItem(itemId) {
  const { data, error } = await sb.rpc("buy_store_item", { p_item_id: itemId });
  if (error || !data.ok) {
    const msgs = { saldo_insuficiente: "No tenés suficientes puntos.", ya_lo_tenes: "Ya tenés este artículo.", no_disponible: "Este artículo ya no está disponible." };
    showToast(msgs[data?.error] || "No se pudo comprar");
    return;
  }
  await loadProfile();
  updateBalanceUI();
  showToast("¡Compra realizada! Revisá Mi colección para equiparlo.");
  renderStore();
}

async function handleBuyPlan(planId) {
  if (!confirm(`¿Cambiar tu plan usando puntos? Esto te va a descontar el saldo correspondiente.`)) return;
  const { data, error } = await sb.rpc("buy_plan_with_points", { p_user_id: currentUser.id, p_plan_id: planId });
  if (error || !data.ok) {
    showToast(data?.error === "saldo_insuficiente" ? "No tenés suficientes puntos." : "No se pudo cambiar");
    return;
  }
  await loadProfile();
  updateBalanceUI();
  showToast("¡Plan actualizado!");
  renderStore();
}

let plansCache = null;

async function loadPlans() {
  if (plansCache) return plansCache;
  const { data } = await sb.from("plans").select("*").order("price_ars", { ascending: true });
  plansCache = data || [];
  return plansCache;
}

async function renderPlans(renderToken = lsTabRenderToken) {
  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando planes...</p>`;

  // Planes, datos de pago y solicitudes no dependen entre sí. Al cargarlos
  // juntos evitamos tres esperas consecutivas cada vez que se abre la sección.
  const [paymentResult, plans, requestsResult] = await Promise.all([
    sb.from("app_text_config")
      .select("key,value")
      .in("key", ["plans_visibility", "payment_cvu", "payment_alias"]),
    loadPlans(),
    sb.from("subscription_requests")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  // Una respuesta vieja no debe reemplazar la pestaña que el usuario abrió después.
  if (renderToken !== lsTabRenderToken || currentTab !== "plans") return;

  const paymentInfo = paymentResult?.data || [];
  const plansVisibility = paymentInfo?.find(c => c.key === "plans_visibility")?.value || "open";

  if (plansVisibility === "closed" && !currentProfile.is_admin) {
    main.innerHTML = `
      <div style="text-align:center; padding:60px 20px;">
        <div style="font-size:44px; margin-bottom:10px;">🔧</div>
        <h1 class="page-title">Estamos ajustando los planes</h1>
        <p style="color:var(--text-dim);">Volvé pronto, ya casi está.</p>
      </div>`;
    return;
  }

  const cvu = paymentInfo?.find(c => c.key === "payment_cvu")?.value || "—";
  const alias = paymentInfo?.find(c => c.key === "payment_alias")?.value || "—";
  const myRequests = requestsResult?.data || [];

  main.innerHTML = `
    <h1 class="page-title">Planes</h1>
    <p class="page-sub">Más plan, más boost, menos comisión al retirar.</p>
    ${plansVisibility === "closed" && currentProfile.is_admin ? `<div style="background:rgba(248,113,113,0.1); border:1px solid var(--red); color:var(--red); font-size:12px; padding:10px 14px; border-radius:8px; margin-bottom:16px;">🔒 Esta sección está CERRADA para el resto de los usuarios ahora mismo. Solo vos la ves completa. Cambialo desde el panel de Admin.</div>` : ""}

    <div class="form-card" style="margin-bottom:20px; border-color:var(--gold-dim);">
      <h3 style="margin-top:0;">💳 Cómo pagar un plan</h3>
      <p style="font-size:13px; color:var(--text-dim); margin-bottom:12px;">
        Transferí el monto de tu plan a estos datos, y después reportalo abajo con el número de comprobante.
        Confirmamos manualmente y te activamos el plan (puede demorar unas horas).
      </p>
      <div style="font-size:13px; line-height:1.8;">
        <div>CVU: <strong class="mono" id="payCvu" data-real="${escapeHtml(cvu)}" data-masked="true">${maskPaymentInfo(cvu)}</strong> <button onclick="togglePaymentInfo('payCvu')" style="background:none;border:none;cursor:pointer;font-size:12px;">👁</button></div>
        <div>Alias: <strong class="mono" id="payAlias" data-real="${escapeHtml(alias)}" data-masked="true">${maskPaymentInfo(alias)}</strong> <button onclick="togglePaymentInfo('payAlias')" style="background:none;border:none;cursor:pointer;font-size:12px;">👁</button></div>
      </div>
      <div style="margin-top:14px; padding-top:14px; border-top:1px solid var(--border); font-size:13px;">
        📧 Mandá el comprobante de la transferencia a <strong class="mono" style="color:var(--gold)" id="payEmail" data-real="livescroll.oficial@gmail.com" data-masked="true">${maskEmail("livescroll.oficial@gmail.com")}</strong> <button onclick="togglePaymentInfo('payEmail')" style="background:none;border:none;cursor:pointer;font-size:12px;">👁</button>
        <div style="color:var(--text-dim); font-size:12px; margin-top:4px;">Tiempo de respuesta estimado: 5 a 10 minutos, según el tránsito. 🚦</div>
      </div>
    </div>

    <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
      ${plans.map(p => renderPlanCard(p)).join("")}
    </div>

    ${myRequests && myRequests.length ? `
      <h3>Tus pagos reportados</h3>
      <div>
        ${myRequests.map(r => `
          <div class="ledger-row">
            <span>${plans.find(p => p.id === r.plan_id)?.name || r.plan_id} · $${r.amount_ars} · ${new Date(r.created_at).toLocaleDateString("es-AR")}</span>
            <span class="mono" style="color:${r.status === 'approved' ? 'var(--green)' : r.status === 'rejected' ? 'var(--red)' : 'var(--gold)'}">${r.status}</span>
          </div>
        `).join("")}
      </div>` : ""}`;
}

function renderPlanCard(plan) {
  const isCurrent = currentProfile.plan_id === plan.id;
  const boostText = plan.boost_cooldown_days
    ? `x${plan.boost_multiplier}, activable 1 vez cada ${plan.boost_cooldown_days} días`
    : `x1 (sin boost activable)`;

  return `
    <div class="form-card" style="flex:1; min-width:240px; ${isCurrent ? "border-color:var(--gold)" : ""}">
      <h3 style="margin-top:0; color:${plan.id === 'diamante' ? 'var(--gold)' : 'var(--text)'}">${plan.name}</h3>
      <div class="mono" style="font-size:24px; margin-bottom:14px;">
        ${plan.price_ars > 0 ? "$" + plan.price_ars.toLocaleString("es-AR") + "/mes" : "Gratis"}
      </div>
      <div style="font-size:13px; color:var(--text-dim); line-height:1.8;">
        <div>⚡ Boost: <span style="color:var(--text)">${boostText}</span></div>
        <div>📅 Tope diario normal: <span style="color:var(--text)">${plan.daily_cap_normal} pts</span></div>
        ${plan.daily_cap_boosted ? `<div>🚀 Tope diario boosteado: <span style="color:var(--text)">${plan.daily_cap_boosted} pts</span></div>` : ""}
        <div>💰 Tope de canje semanal: <span style="color:var(--text)">$${plan.weekly_redemption_cap.toLocaleString("es-AR")}</span></div>
        ${plan.max_balance ? `<div>🏦 Saldo máximo acumulable: <span style="color:var(--text)">${plan.max_balance.toLocaleString("es-AR")} pts</span></div>` : ""}
        <div>💸 Comisión por retiro: <span style="color:var(--text)">${(plan.commission_pct * 100).toFixed(0)}%</span></div>
      </div>
      ${isCurrent
        ? `<button class="btn-outline" style="width:100%; margin-top:16px;" disabled>Plan actual</button>`
        : plan.price_ars === 0
          ? `<button class="btn" style="width:100%; margin-top:16px;" onclick="handleChangePlan('${plan.id}')">Cambiar a este plan</button>`
          : `<button class="btn" style="width:100%; margin-top:16px;" onclick="openSubscriptionForm('${plan.id}', ${plan.price_ars})">Pagar este plan</button>`
      }
    </div>`;
}

async function openSubscriptionForm(planId, amount) {
  const { data, error } = await sb.rpc("create_subscription_request", {
    p_user_id: currentUser.id,
    p_plan_id: planId
  });

  if (error || !data.ok) { showToast("No se pudo generar el código de pago"); return; }

  showPaymentCodeModal(data.code, data.amount);
  notifyAdminByEmail(currentProfile.username, planId, amount, data.code);
}

// ============================================================
// EMAILJS — aviso automático a tu correo dedicado de pagos
// ============================================================
// Completá estos 3 datos después de armar tu cuenta en emailjs.com
const EMAILJS_PUBLIC_KEY = "TU-PUBLIC-KEY";
const EMAILJS_SERVICE_ID = "TU-SERVICE-ID";
const EMAILJS_TEMPLATE_ID = "TU-TEMPLATE-ID";

function notifyAdminByEmail(username, planId, amount, code) {
  if (EMAILJS_PUBLIC_KEY === "TU-PUBLIC-KEY") return; // todavía no se configuró, no hacemos nada

  try {
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      username, plan: planId, amount, code
    }, EMAILJS_PUBLIC_KEY).catch(() => {});
  } catch (e) { /* si falla el aviso, no rompemos el flujo del usuario */ }
}

function showPaymentCodeModal(code, amount) {
  const wrap = document.getElementById("globalModalWrap");
  const modal = document.createElement("div");
  modal.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px;";
  modal.innerHTML = `
    <div style="background:var(--panel); max-width:380px; border-radius:16px; padding:28px; border:1px solid var(--gold-dim);">
      <h3 style="margin-top:0;">💳 Un último paso</h3>
      <p style="font-size:13px; color:var(--text-dim);">Transferí <strong style="color:var(--green)">$${amount.toLocaleString("es-AR")}</strong> y poné este código EXACTO en el concepto de la transferencia:</p>
      <div class="mono" style="background:var(--ink); border:1px solid var(--gold); border-radius:10px; padding:14px; text-align:center; font-size:20px; color:var(--gold); margin:14px 0;">${code}</div>
      <p style="font-size:12px; color:var(--text-dim);">Sin ese código no podemos confirmar que la transferencia es tuya. Guardalo hasta que te confirmemos (5 a 10 min según el tránsito 🚦).</p>
      <button class="btn" style="width:100%; margin-top:10px;" onclick="this.closest('div[style*=fixed]').remove(); switchTab('store');">Listo, ya lo anoté</button>
    </div>`;
  document.body.appendChild(modal);
}

async function handleChangePlan(planId) {
  const { data, error } = await sb.rpc("change_plan", { p_user_id: currentUser.id, p_plan_id: planId });
  if (error || !data.ok) { showToast("No se pudo cambiar el plan"); return; }
  currentProfile.plan_id = planId;
  showToast("Plan actualizado");
  renderPlans();
}


// ============================================================
// UTILS
// ============================================================
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}


// ============================================================
// UPLOAD PREVIEW HARD LAYOUT FIX
// La preview siempre usa un frame 16:9 dentro del ancho del formulario.
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("lsUploadPreviewHardFix")) return;

  const style = document.createElement("style");
  style.id = "lsUploadPreviewHardFix";
  style.textContent = `
    #fileFields,
    #fileFields .field,
    #uploadPreviewSafe {
      min-width:0 !important;
      max-width:100% !important;
      box-sizing:border-box !important;
    }

    #uploadPreviewSafe.active {
      display:block !important;
      width:100% !important;
      aspect-ratio:16 / 9 !important;
      height:auto !important;
      overflow:hidden !important;
    }

    #uploadPreviewVideoSafe {
      position:absolute !important;
      inset:0 !important;
      width:100% !important;
      height:100% !important;
      max-width:none !important;
      max-height:none !important;
      object-fit:contain !important;
      object-position:center !important;
    }

    @media (max-width:700px) {
      #uploadPreviewSafe.active {
        width:100% !important;
        aspect-ratio:16 / 9 !important;
        height:auto !important;
      }
    }
  `;
  document.head.appendChild(style);
});


// ============================================================
// LIVESCROLL · UI VIVA V1
// Mejora visual global: más contraste, saturación y profundidad.
// No cambia lógica, tamaños críticos del feed ni comportamiento.
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("lsUiVivaV1")) return;

  const style = document.createElement("style");
  style.id = "lsUiVivaV1";
  style.textContent = `
    :root {
      --ls-glow-gold: rgba(250,204,21,.18);
      --ls-glow-green: rgba(34,197,94,.15);
      --ls-glow-red: rgba(239,68,68,.15);
      --ls-panel-shine: rgba(255,255,255,.025);
    }

    body {
      background:
        radial-gradient(circle at 18% -8%, rgba(250,204,21,.07), transparent 28%),
        radial-gradient(circle at 92% 12%, rgba(34,197,94,.045), transparent 24%),
        var(--ink) !important;
    }

    #appView {
      position:relative;
    }

    /* Navegación más presente sin cambiar estructura */
    nav,
    .top-nav,
    .navbar {
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
    }

    #navLinks button,
    #navRight button {
      transition:
        transform .16s ease,
        border-color .16s ease,
        background .16s ease,
        color .16s ease,
        box-shadow .16s ease;
    }

    #navLinks button:hover,
    #navRight button:hover {
      transform:translateY(-1px);
    }

    #navLinks button.active,
    #navLinks button[aria-current="page"] {
      border-color:rgba(250,204,21,.42) !important;
      background:rgba(250,204,21,.08) !important;
      color:var(--gold) !important;
      box-shadow:0 0 18px rgba(250,204,21,.08);
    }

    /* Paneles: mejor separación del fondo */
    .form-card,
    .modal-box,
    .ledger-row,
    .profile-card,
    .plan-card,
    .store-card,
    .notification-panel {
      background:
        linear-gradient(145deg, var(--ls-panel-shine), transparent 50%),
        var(--panel) !important;
    }

    .form-card,
    .profile-card,
    .plan-card,
    .store-card {
      box-shadow:
        0 14px 38px rgba(0,0,0,.20),
        inset 0 1px 0 rgba(255,255,255,.018);
    }

    /* Inputs más legibles */
    input,
    textarea,
    select {
      border-color:rgba(255,255,255,.11) !important;
      transition:
        border-color .16s ease,
        box-shadow .16s ease,
        background .16s ease;
    }

    input:focus,
    textarea:focus,
    select:focus {
      outline:none !important;
      border-color:rgba(250,204,21,.52) !important;
      box-shadow:0 0 0 3px rgba(250,204,21,.07) !important;
      background:rgba(255,255,255,.025) !important;
    }

    /* Botones principales con un poco más de vida */
    .btn {
      box-shadow:0 8px 22px rgba(250,204,21,.10);
      transition:
        transform .15s ease,
        box-shadow .15s ease,
        filter .15s ease;
    }

    .btn:hover {
      transform:translateY(-1px);
      box-shadow:0 10px 28px rgba(250,204,21,.16);
      filter:saturate(1.08);
    }

    .btn:active {
      transform:translateY(0) scale(.985);
    }

    .btn-outline {
      transition:
        transform .15s ease,
        border-color .15s ease,
        background .15s ease;
    }

    .btn-outline:hover {
      transform:translateY(-1px);
      border-color:rgba(250,204,21,.34) !important;
      background:rgba(250,204,21,.035) !important;
    }

    /* Títulos y chips */
    .page-title {
      letter-spacing:-.025em;
      text-shadow:0 0 28px rgba(255,255,255,.025);
    }

    .tag,
    .nav-plan-chip {
      box-shadow:inset 0 1px 0 rgba(255,255,255,.025);
    }

    /* Feed: no tocamos medidas ni object-fit */
    .feed-phone {
      box-shadow:
        0 22px 56px rgba(0,0,0,.28),
        0 0 0 1px rgba(255,255,255,.018);
    }

    .feed-action-btn {
      backdrop-filter:blur(8px);
      -webkit-backdrop-filter:blur(8px);
    }

    /* Perfil: un toque más vivo alrededor de la identidad */
    .profile-avatar,
    .avatar-circle {
      box-shadow:
        0 0 0 1px rgba(250,204,21,.16),
        0 0 24px rgba(250,204,21,.06);
    }

    /* Tienda / colección */
    .ls-collection-filter.active,
    .ls-collection-rarity-filter.active {
      background:rgba(250,204,21,.08) !important;
      box-shadow:0 0 14px rgba(250,204,21,.07);
    }

    /* Modales más nítidos */
    .modal-overlay {
      backdrop-filter:blur(8px);
      -webkit-backdrop-filter:blur(8px);
    }

    .modal-box {
      box-shadow:
        0 28px 90px rgba(0,0,0,.52),
        0 0 0 1px rgba(255,255,255,.018);
    }

    /* Scrollbar desktop */
    @media (min-width:701px) {
      * {
        scrollbar-width:thin;
        scrollbar-color:rgba(250,204,21,.30) transparent;
      }

      *::-webkit-scrollbar {
        width:8px;
        height:8px;
      }

      *::-webkit-scrollbar-thumb {
        background:rgba(250,204,21,.24);
        border-radius:999px;
      }

      *::-webkit-scrollbar-track {
        background:transparent;
      }
    }

    /* Mobile: conservar fluidez y no alterar layout */
    @media (max-width:700px) {
      body {
        background:
          radial-gradient(circle at 50% -5%, rgba(250,204,21,.055), transparent 25%),
          var(--ink) !important;
      }

      .form-card,
      .modal-box {
        box-shadow:0 12px 34px rgba(0,0,0,.24);
      }

      .btn:hover,
      .btn-outline:hover,
      #navLinks button:hover,
      #navRight button:hover {
        transform:none;
      }
    }

    @media (prefers-reduced-motion:reduce) {
      .btn,
      .btn-outline,
      #navLinks button,
      #navRight button,
      input,
      textarea,
      select {
        transition:none !important;
      }
    }
  `;

  document.head.appendChild(style);
});


// ============================================================
// PERFIL · RESUMEN DE COLECCIÓN
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("lsCollectionSummaryMobile")) return;
  const style = document.createElement("style");
  style.id = "lsCollectionSummaryMobile";
  style.textContent = `
    @media (max-width:520px) {
      .profile-section button.form-card[onclick="openMyMedalsPanel()"] {
        grid-template-columns:repeat(2,1fr) !important;
      }

      .profile-section button.form-card[onclick="openMyMedalsPanel()"] > div {
        border-left:none !important;
      }

      .profile-section button.form-card[onclick="openMyMedalsPanel()"] > div:nth-child(even) {
        border-left:1px solid var(--border) !important;
      }
    }
  `;
  document.head.appendChild(style);
});

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("lsUnifiedCollectionProfileV1")) return;
  const style = document.createElement("style");
  style.id = "lsUnifiedCollectionProfileV1";
  style.textContent = `
    .ls-profile-collection-hub button {
      transition:background .15s ease,color .15s ease;
    }
    .ls-profile-collection-hub button:hover {
      background:rgba(250,204,21,.035) !important;
    }
    @media (max-width:520px) {
      .ls-profile-collection-hub > button[onclick*="openMyMedalsPanel('all')"] {
        grid-template-columns:repeat(2,1fr) !important;
      }
      .ls-profile-collection-hub > button[onclick*="openMyMedalsPanel('all')"] > div:nth-child(odd) {
        border-left:none !important;
      }
      .ls-profile-collection-hub > button[onclick*="openMyMedalsPanel('all')"] > div:nth-child(even) {
        border-left:1px solid var(--border) !important;
      }
    }
  `;
  document.head.appendChild(style);
});

// Compatibilidad con botones viejos del Admin que puedan seguir llamando nombres anteriores.
async function handleAdminChangePlan(userId, planId) {
  return handleAdminSetUserPlan(userId, planId);
}
async function adminChangeUserPlan(userId, planId) {
  return handleAdminSetUserPlan(userId, planId);
}


// ============================================================
// LIVESCROLL · SEASONAL ENGINE V1
// Eventos visuales automáticos según fecha de Argentina.
// El icono instalado/PWA NO se modifica.
// Solo decoramos la interfaz y el logo dentro de la app.
// ============================================================

const LS_SEASONAL_OVERRIDE_KEY = "livescroll_seasonal_admin_preview";
window.__lsGlobalSeasonalTheme = window.__lsGlobalSeasonalTheme || "auto";

const LS_SEASONAL_THEMES = {
  normal: {
    label:"LiveScroll normal",
    emoji:"",
    accent:null,
    accent2:null,
    glow:null,
    decorations:[]
  },
  spring: {
    label:"Primavera",
    emoji:"🌸",
    accent:"#ff8fbd",
    accent2:"#fff4fa",
    glow:"rgba(255,143,189,.18)",
    decorations:["🌸","🌼","🌸"]
  },
  halloween: {
    label:"Halloween",
    emoji:"🎃",
    accent:"#ff8a34",
    accent2:"#a879ff",
    glow:"rgba(255,138,52,.18)",
    decorations:["🎃","🕸️","👻"]
  },
  christmas: {
    label:"Navidad",
    emoji:"🎄",
    accent:"#ef5350",
    accent2:"#f7f7f7",
    glow:"rgba(239,83,80,.17)",
    decorations:["❄️","🎄","❄️"]
  },
  newyear: {
    label:"Año Nuevo",
    emoji:"🎆",
    accent:"#ffd45c",
    accent2:"#f8f8ff",
    glow:"rgba(255,212,92,.18)",
    decorations:["✨","🎆","✨"]
  },
  reyes: {
    label:"Día de Reyes",
    emoji:"👑",
    accent:"#d7b7ff",
    accent2:"#ffd75e",
    glow:"rgba(215,183,255,.17)",
    decorations:["⭐","👑","⭐"]
  },
  valentines: {
    label:"San Valentín",
    emoji:"💗",
    accent:"#ff6f9f",
    accent2:"#ffd6e4",
    glow:"rgba(255,111,159,.17)",
    decorations:["💗","✨","💗"]
  },
  patria: {
    label:"Fecha patria",
    emoji:"🇦🇷",
    accent:"#75cfff",
    accent2:"#ffffff",
    glow:"rgba(117,207,255,.17)",
    decorations:["🇦🇷","☀️","🇦🇷"]
  },
  father: {
    label:"Día del Padre",
    emoji:"👨",
    accent:"#73b8ff",
    accent2:"#e9f5ff",
    glow:"rgba(115,184,255,.16)",
    decorations:["💙","👨","💙"]
  },
  childhood: {
    label:"Día de las Infancias",
    emoji:"🧒",
    accent:"#75dfb5",
    accent2:"#ffd96e",
    glow:"rgba(117,223,181,.17)",
    decorations:["🎈","🧸","🎈"]
  },
  mother: {
    label:"Día de la Madre",
    emoji:"🌷",
    accent:"#ff93b9",
    accent2:"#fff0f6",
    glow:"rgba(255,147,185,.17)",
    decorations:["🌷","💗","🌷"]
  },
  easter: {
    label:"Pascuas",
    emoji:"🐰",
    accent:"#b99cff",
    accent2:"#ffe8a3",
    glow:"rgba(185,156,255,.17)",
    decorations:["🐰","🥚","🌷"]
  }
};

// LiveScroll 7 · atmósferas con luz, profundidad y materiales propios.
// Se mantienen las mismas temporadas y fechas; esta capa solo eleva su apariencia.
const LS_SEASONAL_ATMOSPHERES = {
  spring:{sky:"rgba(255,126,190,.18)",light:"rgba(137,255,200,.13)",surface:"rgba(255,220,237,.07)"},
  halloween:{sky:"rgba(255,102,21,.20)",light:"rgba(107,49,190,.20)",surface:"rgba(255,151,57,.06)"},
  christmas:{sky:"rgba(24,153,121,.16)",light:"rgba(218,45,66,.17)",surface:"rgba(235,250,255,.09)"},
  newyear:{sky:"rgba(255,203,74,.19)",light:"rgba(128,91,255,.18)",surface:"rgba(255,245,194,.08)"},
  reyes:{sky:"rgba(160,96,255,.17)",light:"rgba(255,202,62,.18)",surface:"rgba(245,225,255,.08)"},
  valentines:{sky:"rgba(255,73,137,.18)",light:"rgba(179,61,255,.13)",surface:"rgba(255,222,234,.08)"},
  patria:{sky:"rgba(71,185,255,.18)",light:"rgba(255,236,146,.14)",surface:"rgba(225,247,255,.09)"},
  father:{sky:"rgba(55,135,255,.17)",light:"rgba(76,224,216,.12)",surface:"rgba(220,238,255,.07)"},
  childhood:{sky:"rgba(50,220,167,.15)",light:"rgba(255,191,58,.17)",surface:"rgba(232,255,247,.08)"},
  mother:{sky:"rgba(255,112,163,.17)",light:"rgba(255,206,228,.13)",surface:"rgba(255,230,240,.08)"},
  easter:{sky:"rgba(164,112,255,.17)",light:"rgba(255,209,98,.16)",surface:"rgba(244,231,255,.08)"}
};

function lsArgentinaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone:"America/Argentina/Buenos_Aires",
    year:"numeric",
    month:"2-digit",
    day:"2-digit",
    weekday:"short"
  }).formatToParts(date);

  const pick = type => parts.find(p => p.type === type)?.value;
  return {
    year:Number(pick("year")),
    month:Number(pick("month")),
    day:Number(pick("day")),
    weekday:pick("weekday")
  };
}

function lsDateKey(y, m, d) {
  return y * 10000 + m * 100 + d;
}

function lsNthWeekdayOfMonth(year, month, weekday, nth) {
  // weekday: 0 domingo ... 6 sábado
  const first = new Date(Date.UTC(year, month - 1, 1, 12));
  const firstDay = first.getUTCDay();
  const offset = (weekday - firstDay + 7) % 7;
  return 1 + offset + (nth - 1) * 7;
}

function lsEasterDate(year) {
  // Algoritmo gregoriano de Meeus/Jones/Butcher.
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function getAutomaticSeasonalTheme(date = new Date()) {
  const p = lsArgentinaDateParts(date);
  const key = lsDateKey(p.year, p.month, p.day);

  // Prioridad: eventos puntuales > temporadas amplias.
  const easter = lsEasterDate(p.year);
  if (p.month === easter.month && p.day === easter.day) return "easter";

  // Año Nuevo: 27 dic -> 2 ene
  if (
    key >= lsDateKey(p.year, 12, 27) ||
    key <= lsDateKey(p.year, 1, 2)
  ) return "newyear";

  // Reyes: 5 y 6 de enero.
  if (p.month === 1 && p.day >= 5 && p.day <= 6) return "reyes";

  if (p.month === 2 && p.day === 14) return "valentines";

  // Fechas patrias principales de Argentina.
  if ((p.month === 5 && p.day === 25) || (p.month === 7 && p.day === 9)) {
    return "patria";
  }

  // Día del Padre: tercer domingo de junio.
  const fatherDay = lsNthWeekdayOfMonth(p.year, 6, 0, 3);
  if (p.month === 6 && p.day === fatherDay) return "father";

  // Día de las Infancias: tercer domingo de agosto.
  const childhoodDay = lsNthWeekdayOfMonth(p.year, 8, 0, 3);
  if (p.month === 8 && p.day === childhoodDay) return "childhood";

  // Primavera: semana de lanzamiento.
  if (p.month === 9 && p.day >= 21 && p.day <= 30) return "spring";

  // Día de la Madre: tercer domingo de octubre.
  const motherDay = lsNthWeekdayOfMonth(p.year, 10, 0, 3);
  if (p.month === 10 && p.day === motherDay) return "mother";

  // Halloween: últimos 7 días de octubre.
  if (p.month === 10 && p.day >= 25 && p.day <= 31) return "halloween";

  // Navidad: 8 al 26 de diciembre.
  if (p.month === 12 && p.day >= 8 && p.day <= 26) return "christmas";

  return "normal";
}

function getSeasonalThemeKey() {
  // LiveScroll 7 permite una preferencia local por dispositivo.
  // La V6 conserva exactamente la apariencia global publicada.
  if (isLiveScroll7App()) {
    const personal = String(getLiveScrollSettings()?.seasonalTheme || "auto");
    if (personal === "off") return "normal";
    if (personal !== "auto" && LS_SEASONAL_THEMES[personal]) return personal;
  }

  const published = String(window.__lsGlobalSeasonalTheme || "auto");
  if (published !== "auto" && LS_SEASONAL_THEMES[published]) {
    return published;
  }
  return getAutomaticSeasonalTheme();
}

async function loadGlobalSeasonalTheme() {
  try {
    const { data, error } = await sb.rpc("get_global_seasonal_theme");
    if (!error) {
      const key = String(data?.theme || data || "auto");
      window.__lsGlobalSeasonalTheme = key === "auto" || LS_SEASONAL_THEMES[key] ? key : "auto";
      localStorage.removeItem(LS_SEASONAL_OVERRIDE_KEY);
    }
  } catch (_) {}
  applySeasonalTheme();
}

function clearSeasonalDecorations() {
  document.getElementById("lsSeasonalStyle")?.remove();
  document.getElementById("lsSeasonalLogoDecor")?.remove();
  document.getElementById("lsSeasonalAmbient")?.remove();
  document.getElementById("lsSeasonalAtmosphere")?.remove();
  document.body?.removeAttribute("data-ls-season");
}

function applySeasonalTheme() {
  if (!document.body || window.__lsSeasonalApplying) return;

  window.__lsSeasonalApplying = true;

  const key = getSeasonalThemeKey();
  const theme = LS_SEASONAL_THEMES[key] || LS_SEASONAL_THEMES.normal;
  const atmosphere = LS_SEASONAL_ATMOSPHERES[key] || {
    sky:theme.glow,
    light:"rgba(255,255,255,.04)",
    surface:"rgba(255,255,255,.035)"
  };

  // Varias zonas pueden pedir sincronizar el tema durante el arranque.
  // Si ya está completo, lo reutilizamos sin quitar estilos ni reconstruir DOM.
  const sameTheme = document.body.dataset.lsSeason === key;
  const navExists = !!document.querySelector("nav");
  const seasonalStyleReady = key === "normal" || !!document.getElementById("lsSeasonalStyle");
  const navDecorationReady = key === "normal" || !navExists || !!document.getElementById("lsSeasonalLogoDecor");
  const atmosphereReady = key === "normal" || !!document.getElementById("lsSeasonalAtmosphere");

  if (sameTheme && seasonalStyleReady && navDecorationReady && atmosphereReady) {
    syncSeasonalAdminControls();
    window.__lsSeasonalApplying = false;
    return;
  }

  clearSeasonalDecorations();
  document.body.dataset.lsSeason = key;

  if (key === "normal") {
    syncSeasonalAdminControls();
    window.__lsSeasonalApplying = false;
    return;
  }

  const style = document.createElement("style");
  style.id = "lsSeasonalStyle";

  const springExtra = key === "spring" ? `
    body[data-ls-season="spring"] .form-card,
    body[data-ls-season="spring"] .modal-box {
      border-color:rgba(255,143,189,.16) !important;
    }
    body[data-ls-season="spring"] .page-title::after {
      content:"  🌸";
      font-size:.55em;
      vertical-align:middle;
      opacity:.85;
    }
  ` : "";

  style.textContent = `
    body[data-ls-season="${key}"] {
      --gold:${theme.accent};
      --gold-dim:${theme.accent};
      background:
        radial-gradient(circle at 16% 0%, ${theme.glow}, transparent 27%),
        radial-gradient(circle at 92% 14%, color-mix(in srgb, ${theme.accent2} 12%, transparent), transparent 26%),
        var(--ink) !important;
    }

    #lsSeasonalAtmosphere {
      position:fixed;
      inset:0;
      z-index:0;
      overflow:hidden;
      pointer-events:none;
      background:
        radial-gradient(ellipse at 16% 3%,${atmosphere.sky},transparent 37%),
        radial-gradient(ellipse at 88% 26%,${atmosphere.light},transparent 42%),
        linear-gradient(118deg,transparent 18%,${atmosphere.surface} 49%,transparent 72%);
      opacity:.92;
      transform:translateZ(0);
    }

    #lsSeasonalAtmosphere::before,
    #lsSeasonalAtmosphere::after {
      content:"";
      position:absolute;
      inset:-25%;
      pointer-events:none;
    }

    #lsSeasonalAtmosphere::before {
      background:conic-gradient(from 110deg,transparent,${atmosphere.surface},transparent 19%,${atmosphere.sky},transparent 42%);
      opacity:.36;
      animation:lsSeasonalLightOrbit 26s linear infinite;
    }

    #lsSeasonalAtmosphere::after {
      background-image:radial-gradient(circle,rgba(255,255,255,.24) 0 1px,transparent 1.4px);
      background-size:46px 46px;
      opacity:.055;
      transform:rotate(9deg);
    }

    body[data-ls-season="${key}"] nav {
      border-bottom-color:color-mix(in srgb, ${theme.accent} 25%, var(--border)) !important;
      box-shadow:0 8px 30px ${theme.glow};
    }

    body[data-ls-season="${key}"] .btn {
      box-shadow:0 8px 24px ${theme.glow};
    }

    body[data-ls-season="${key}"] .form-card,
    body[data-ls-season="${key}"] .modal-box,
    body[data-ls-season="${key}"] .profile-card,
    body[data-ls-season="${key}"] .store-card {
      box-shadow:
        0 16px 42px rgba(0,0,0,.22),
        0 0 24px ${theme.glow};
      background-image:linear-gradient(145deg,${atmosphere.surface},transparent 46%) !important;
    }

    .ls-seasonal-logo-decor {
      display:flex;
      align-items:center;
      gap:1px;
      font-size:15px;
      line-height:1;
      pointer-events:none;
      filter:drop-shadow(0 2px 8px ${theme.glow});
      animation:lsSeasonalFloat 3.2s ease-in-out infinite;
    }

    .ls-seasonal-logo-decor span:nth-child(2) {
      transform:translateY(-4px) scale(.82);
    }

    @keyframes lsSeasonalFloat {
      0%,100% { transform:translateY(0) rotate(-2deg); }
      50% { transform:translateY(-2px) rotate(2deg); }
    }

    .ls-seasonal-ambient-item {
      position:fixed;
      top:-30px;
      z-index:8;
      pointer-events:none;
      font-size:13px;
      opacity:.34;
      will-change:transform, opacity;
      filter:drop-shadow(0 6px 9px rgba(0,0,0,.28));
    }

    .ls-seasonal-ambient-item:nth-child(3n+1) { filter:blur(.25px) drop-shadow(0 8px 12px rgba(0,0,0,.28));transform:scale(.82);opacity:.22; }
    .ls-seasonal-ambient-item:nth-child(3n+2) { font-size:18px;opacity:.40; }

    @keyframes lsSeasonalLightOrbit {
      from { transform:rotate(0deg) scale(1); }
      50% { transform:rotate(180deg) scale(1.08); }
      to { transform:rotate(360deg) scale(1); }
    }

    .ls-seasonal-fall {
      animation:lsSeasonalFall linear infinite;
    }

    .ls-seasonal-fly {
      top:auto;
      bottom:18%;
      animation:lsSeasonalFly ease-in-out infinite;
    }

    .ls-seasonal-twinkle {
      top:12%;
      animation:lsSeasonalTwinkle ease-in-out infinite;
    }

    .ls-seasonal-float {
      top:auto;
      bottom:-30px;
      animation:lsSeasonalFloatUp ease-in-out infinite;
    }

    .ls-seasonal-wave {
      top:auto;
      bottom:8%;
      animation:lsSeasonalWave ease-in-out infinite;
    }

    .ls-seasonal-bounce {
      top:auto;
      bottom:-25px;
      animation:lsSeasonalBounce ease-in-out infinite;
    }

    @keyframes lsSeasonalFall {
      from { transform:translate3d(0,-35px,0) rotate(0deg); }
      to { transform:translate3d(38px,110vh,0) rotate(360deg); }
    }

    @keyframes lsSeasonalFly {
      0%,100% { transform:translate3d(-18px,0,0) rotate(-7deg); }
      50% { transform:translate3d(42px,-65px,0) rotate(7deg); }
    }

    @keyframes lsSeasonalTwinkle {
      0%,100% { opacity:.12; transform:scale(.7) rotate(0deg); }
      50% { opacity:.52; transform:scale(1.18) rotate(25deg); }
    }

    @keyframes lsSeasonalFloatUp {
      0% { transform:translate3d(0,0,0) rotate(-5deg); opacity:.12; }
      50% { opacity:.38; }
      100% { transform:translate3d(18px,-110vh,0) rotate(8deg); opacity:.08; }
    }

    @keyframes lsSeasonalWave {
      0%,100% { transform:translate3d(-12px,0,0) rotate(-4deg); }
      50% { transform:translate3d(20px,-18px,0) rotate(4deg); }
    }

    @keyframes lsSeasonalBounce {
      0% { transform:translate3d(0,0,0) scale(.9); }
      50% { transform:translate3d(0,-75vh,0) scale(1.05); }
      100% { transform:translate3d(20px,-110vh,0) scale(.92); }
    }

    @media (prefers-reduced-motion:reduce) {
      .ls-seasonal-logo-decor,
      .ls-seasonal-ambient-item,
      #lsSeasonalAtmosphere::before {
        animation:none !important;
      }
      .ls-seasonal-ambient-item { display:none !important; }
    }

    html.ls-legacy .ls-seasonal-ambient-item {
      display:none !important;
    }

    html.ls-legacy #lsSeasonalAtmosphere::before,
    html.ls-legacy #lsSeasonalAtmosphere::after { display:none !important; }
    html.ls-legacy #lsSeasonalAtmosphere { opacity:.42; }

    ${springExtra}
  `;
  document.head.appendChild(style);

  const atmosphereLayer = document.createElement("div");
  atmosphereLayer.id = "lsSeasonalAtmosphere";
  atmosphereLayer.setAttribute("aria-hidden", "true");
  document.body.prepend(atmosphereLayer);

  // Decoramos el logo/área de marca SIN reemplazarlo.
  const nav = document.querySelector("nav");
  if (nav) {
    const decor = document.createElement("div");
    decor.id = "lsSeasonalLogoDecor";
    decor.className = "ls-seasonal-logo-decor";
    decor.setAttribute("aria-hidden", "true");
    decor.innerHTML = (theme.decorations || []).map(x => `<span>${x}</span>`).join("");

    const brandCandidates = [
      nav.querySelector(".brand"),
      nav.querySelector(".logo"),
      nav.querySelector(".nav-brand"),
      nav.querySelector("[class*='brand']"),
      nav.querySelector("[class*='logo']")
    ].filter(Boolean);

    const brand = brandCandidates[0];

    if (brand) {
      brand.style.position = brand.style.position || "relative";
      decor.style.position = "absolute";
      decor.style.right = "-27px";
      decor.style.top = "-7px";
      brand.appendChild(decor);
    } else {
      // Fallback seguro: decoración pequeña en la esquina del nav.
      nav.style.position = nav.style.position || "relative";
      decor.style.position = "absolute";
      decor.style.left = "7px";
      decor.style.top = "3px";
      decor.style.zIndex = "5";
      nav.appendChild(decor);
    }
  }

  // Efectos ambientales suaves por evento.
  if (!document.documentElement.classList.contains("ls-legacy")) {
    const ambientMap = {
      spring: {
        items:["🌸","🌼","🌸","🌸","🌼","🌸"],
        className:"ls-seasonal-fall"
      },
      halloween: {
        items:["🦇","🦇","🦇","🦇","🦇"],
        className:"ls-seasonal-fly"
      },
      christmas: {
        items:["🎁","❄️","🎁","❄️","🎁"],
        className:"ls-seasonal-fall"
      },
      newyear: {
        items:["✨","⭐","✨","🌟","✨","⭐"],
        className:"ls-seasonal-twinkle"
      },
      reyes: {
        items:["👑","⭐","👑","⭐"],
        className:"ls-seasonal-float"
      },
      valentines: {
        items:["💗","💕","💗","💕","💗"],
        className:"ls-seasonal-float"
      },
      patria: {
        items:["🇦🇷","🇦🇷","☀️","🇦🇷"],
        className:"ls-seasonal-wave"
      },
      father: {
        items:["👔","💙","👔","💙"],
        className:"ls-seasonal-float"
      },
      childhood: {
        items:["🧸","🪀","🎈","🧸","🎈"],
        className:"ls-seasonal-float"
      },
      mother: {
        items:["🌹","🌷","🌹","🌷","🌹"],
        className:"ls-seasonal-fall"
      },
      easter: {
        items:["🥚","🐰","🥚","🌷","🥚"],
        className:"ls-seasonal-bounce"
      }
    };

    const config = ambientMap[key];

    if (config) {
      const ambient = document.createElement("div");
      ambient.id = "lsSeasonalAmbient";
      ambient.setAttribute("aria-hidden", "true");

      ambient.innerHTML = config.items.map((item, i) => `
        <span
          class="ls-seasonal-ambient-item ${config.className}"
          style="
            left:${6 + (i * 17)}%;
            animation-duration:${8 + (i * 1.3)}s;
            animation-delay:-${i * 1.7}s;
          "
        >${item}</span>
      `).join("");

      document.body.appendChild(ambient);
    }
  }

  syncSeasonalAdminControls();
  window.__lsSeasonalApplying = false;
}

async function setSeasonalAdminPreview(value) {
  if (!currentProfile?.is_admin) return;
  const next = !value ? "auto" : value;
  const { data, error } = await sb.rpc("admin_set_global_seasonal_theme", { p_theme:next });
  if (error || !data?.ok) {
    showToast("No se pudo publicar la apariencia");
    syncSeasonalAdminControls();
    return;
  }
  window.__lsGlobalSeasonalTheme = next;
  localStorage.removeItem(LS_SEASONAL_OVERRIDE_KEY);
  applySeasonalTheme();
  showToast(
    next === "auto"
      ? "🎨 Apariencia global en Automático"
      : `🎨 Publicado para todos: ${LS_SEASONAL_THEMES[next]?.label || next}`
  );
}

function syncSeasonalAdminControls() {
  const select = document.getElementById("seasonalThemeAdminSelect");
  const status = document.getElementById("seasonalAdminStatus");
  if (!select && !status) return;

  const forced = String(window.__lsGlobalSeasonalTheme || "auto");

  if (select) {
    select.value = (forced === "auto" || LS_SEASONAL_THEMES[forced]) ? forced : "auto";
  }

  if (status) {
    const automatic = getAutomaticSeasonalTheme();
    const active = getSeasonalThemeKey();
    const activeLabel = LS_SEASONAL_THEMES[active]?.label || active;
    const autoLabel = LS_SEASONAL_THEMES[automatic]?.label || automatic;

    status.textContent = forced === "auto"
      ? `Publicado: Automático · Ahora: ${activeLabel}`
      : `Publicado para todos: ${activeLabel} · En automático sería: ${autoLabel}`;
  }
}

// Aplicamos el tema al cargar.
// No usamos MutationObserver global: el Admin reconstruye mucho DOM y eso
// podía generar un ciclo de reaplicación que frenaba la carga del panel.
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(loadGlobalSeasonalTheme, 80);
});

// Si el app ya estaba cargado antes de registrar DOMContentLoaded.
if (document.readyState !== "loading") {
  setTimeout(applySeasonalTheme, 80);
}

// 6.1.1v · SOCIAL CLARITY
function ensureSocialClarity611Styles() {
  if (document.getElementById("lsSocialClarity611Styles")) return;
  const style = document.createElement("style");
  style.id = "lsSocialClarity611Styles";
  style.textContent = `
    .feed-action-btn.ls-like-action-611,
    .feed-action-btn.ls-comment-action-611 {
      width:58px !important;
      min-height:54px;
      height:auto !important;
      padding:7px 4px 6px !important;
      border-radius:18px !important;
      display:flex !important;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap:2px;
    }
    .feed-action-btn.ls-like-action-611 > span,
    .feed-action-btn.ls-comment-action-611 > span {
      font-size:25px;
      line-height:1;
      font-style:normal;
    }
    .feed-action-btn.ls-like-action-611 > i,
    .feed-action-btn.ls-comment-action-611 > i {
      font:900 7px 'JetBrains Mono',monospace;
      letter-spacing:.055em;
      color:rgba(255,255,255,.72);
    }
    .feed-action-btn.ls-like-action-611.liked {
      color:#fff !important;
      border-color:rgba(255,78,111,.88) !important;
      background:linear-gradient(145deg,#ff416c,#821b42) !important;
      box-shadow:0 0 0 3px rgba(255,65,108,.16),0 10px 28px rgba(255,65,108,.38) !important;
    }
    .feed-action-btn.ls-like-action-611.liked > span {
      filter:drop-shadow(0 0 8px rgba(255,255,255,.62));
    }
    .feed-action-btn.ls-like-action-611.liked > i { color:#fff; }
    .feed-action-btn.ls-comment-action-611 {
      border-color:rgba(72,221,242,.38) !important;
      background:linear-gradient(145deg,rgba(20,92,112,.82),rgba(5,31,43,.88)) !important;
    }
    .ls-comments-overlay-611 {
      position:fixed;inset:0;z-index:300;display:flex;align-items:flex-end;justify-content:center;
      padding-top:40px;background:rgba(0,0,0,.76);backdrop-filter:blur(7px);
    }
    .ls-comments-panel-611 {
      width:min(100%,520px);max-height:78vh;max-height:78dvh;padding:20px;
      padding-bottom:max(20px,env(safe-area-inset-bottom));display:flex;flex-direction:column;overflow:hidden;
      border:1px solid rgba(72,221,242,.24);border-bottom:0;border-radius:26px 26px 0 0;
      background:linear-gradient(180deg,rgba(18,27,34,.98),rgba(7,12,17,.99));
      box-shadow:0 -24px 70px rgba(0,0,0,.48),0 0 32px rgba(72,221,242,.07);
    }
    .ls-comment-compose-611 { display:flex;gap:9px;flex-shrink:0;align-items:center; }
    .ls-comment-compose-611 input {
      flex:1;min-width:0;padding:13px 14px;border:1px solid rgba(72,221,242,.22);border-radius:14px;
      background:rgba(2,9,13,.74);color:var(--text);font-family:inherit;outline:none;
    }
    .ls-comment-compose-611 input:focus {
      border-color:rgba(72,221,242,.72);box-shadow:0 0 0 3px rgba(72,221,242,.09);
    }
    .ls-hidden-undo-611 {
      position:fixed;left:50%;bottom:max(22px,env(safe-area-inset-bottom));z-index:800;
      width:min(calc(100% - 28px),440px);transform:translateX(-50%);display:flex;align-items:center;gap:12px;
      padding:12px 13px;border:1px solid rgba(103,232,249,.35);border-radius:16px;
      background:rgba(5,15,21,.96);box-shadow:0 16px 45px rgba(0,0,0,.48);backdrop-filter:blur(14px);
      animation:lsUndoIn611 .22s ease both;
    }
    .ls-hidden-undo-611 span { min-width:0;flex:1;display:flex;flex-direction:column;gap:2px; }
    .ls-hidden-undo-611 strong { color:var(--text);font-size:13px; }
    .ls-hidden-undo-611 small { color:var(--text-dim);font-size:10px; }
    .ls-hidden-undo-611 button {
      flex:none;padding:9px 12px;border:1px solid rgba(103,232,249,.48);border-radius:11px;
      background:rgba(103,232,249,.10);color:#67e8f9;font:900 11px 'JetBrains Mono',monospace;cursor:pointer;
    }
    .ls-admin-profile-delete-611 {
      position:absolute;top:8px;right:8px;z-index:12;width:38px;height:38px;border-radius:12px;
      border:1px solid rgba(255,90,110,.62);background:rgba(80,8,22,.90);color:#fff;font-size:16px;cursor:pointer;
      box-shadow:0 8px 22px rgba(0,0,0,.34);
    }
    @keyframes lsUndoIn611 { from{opacity:0;transform:translate(-50%,12px)} to{opacity:1;transform:translate(-50%,0)} }
    .ls-legacy .feed-action-btn.ls-like-action-611,
    .ls-legacy .feed-action-btn.ls-comment-action-611 { box-shadow:none !important;backdrop-filter:none !important; }
    @media(max-width:700px) {
      .feed-action-btn.ls-like-action-611,.feed-action-btn.ls-comment-action-611 { width:54px !important;min-height:51px; }
      .ls-comments-panel-611 { max-height:82dvh;padding:17px 15px max(16px,env(safe-area-inset-bottom)); }
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && currentUser?.id) {
    pollNotificationsFallback();
    if (!notifRealtimeChannel) subscribeToNotifications();
  }
});

ensureSocialClarity611Styles();

function ensureLiveScroll7RuntimeStyles() {
  if (!isLiveScroll7App() || document.getElementById("ls7RuntimeStyles")) return;
  const style = document.createElement("style");
  style.id = "ls7RuntimeStyles";
  style.textContent = `
    html.ls7-app-runtime {
      --ls7-blue:#58d8ff;--ls7-violet:#8a5cff;--ls7-gold:#f4c95d;
      --ink:#050711;--panel:#0b1221;--panel-2:#111d32;--gold:#74e4ff;--gold-dim:#43b9dc;
      --green:#7b62ff;--text:#f7f9ff;--text-dim:#aebbd1;--border:#233653;
      color-scheme:dark;
    }
    html.ls7-app-runtime body {
      background:radial-gradient(circle at 12% -10%,rgba(88,216,255,.10),transparent 30%),radial-gradient(circle at 108% 35%,rgba(138,92,255,.10),transparent 31%),var(--ink);
    }
    html.ls7-app-runtime nav {
      border-color:rgba(88,216,255,.16);background:rgba(5,7,17,.88);
      box-shadow:0 10px 34px rgba(0,0,0,.22);backdrop-filter:blur(16px) saturate(130%);
    }
    html.ls7-app-runtime .nav-brand { gap:0;font-size:20px;font-weight:850;letter-spacing:-.045em;color:#f7f9ff; }
    html.ls7-app-runtime .nav-brand-live { color:#f7f9ff; }
    html.ls7-app-runtime .nav-brand-scroll { color:var(--ls7-blue); }
    html.ls7-app-runtime .nav-brand b {
      color:#171003;background:linear-gradient(145deg,#fff2a8,#e7a92e);border-color:rgba(255,235,158,.64);
      filter:drop-shadow(0 0 9px rgba(244,201,93,.38));box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 5px 18px rgba(244,201,93,.17);
    }
    html.ls7-app-runtime .form-card,html.ls7-app-runtime .video-card,html.ls7-app-runtime .auth-box {
      border-color:rgba(88,216,255,.15);background:linear-gradient(145deg,rgba(15,27,47,.94),rgba(8,14,28,.96));
      box-shadow:inset 0 1px 0 rgba(255,255,255,.025),0 14px 40px rgba(0,0,0,.16);
    }
    html.ls7-app-runtime input,html.ls7-app-runtime textarea,html.ls7-app-runtime select {
      border-color:rgba(118,151,194,.32);background:#080e1b;color:#f7f9ff;
    }
    html.ls7-app-runtime input:focus,html.ls7-app-runtime textarea:focus,html.ls7-app-runtime select:focus {
      outline:3px solid rgba(88,216,255,.13);border-color:rgba(88,216,255,.7);
    }
    html.ls7-app-runtime button:focus-visible,html.ls7-app-runtime a:focus-visible {
      outline:3px solid rgba(244,201,93,.55)!important;outline-offset:3px;
    }
    html.ls7-app-runtime .btn { background:linear-gradient(135deg,#43cbed,#7658ee);color:#fff;border-color:rgba(126,226,255,.35); }
    html.ls7-app-runtime .btn-outline { border-color:rgba(88,216,255,.28);color:#dff8ff;background:rgba(88,216,255,.035); }
    html.ls7-app-runtime .page-title { color:#f9fbff;text-shadow:0 0 26px rgba(88,216,255,.08); }
    html.ls7-app-runtime .nav-links button.active { color:#dffaff;background:linear-gradient(135deg,rgba(88,216,255,.12),rgba(138,92,255,.10)); }
    html.ls7-app-runtime .nav-links button.active::after { background:linear-gradient(90deg,var(--ls7-blue),var(--ls7-violet),var(--ls7-gold)); }
    html.ls7-app-runtime .ls-access-evolution {
      background:radial-gradient(circle at 20% 10%,rgba(88,216,255,.13),transparent 34%),radial-gradient(circle at 85% 80%,rgba(138,92,255,.17),transparent 38%),#050711;
    }
    html.ls7-app-runtime .ls-access-logo {
      color:var(--ls7-gold);border-color:rgba(88,216,255,.48);
      background:linear-gradient(145deg,rgba(88,216,255,.15),rgba(138,92,255,.16));
      box-shadow:0 0 28px rgba(88,216,255,.14);
    }
    .ls7-runtime-settings-card,.ls7-runtime-status-card {
      border:1px solid rgba(88,216,255,.28);border-radius:16px;padding:14px;
      background:linear-gradient(145deg,rgba(20,64,92,.14),rgba(68,34,116,.13));
      box-shadow:inset 0 1px 0 rgba(255,255,255,.025);
    }
    .ls7-runtime-settings-head { display:flex;align-items:center;gap:11px;margin-bottom:9px; }
    .ls7-runtime-settings-head > span {
      width:42px;height:42px;display:grid;place-items:center;border-radius:14px;
      border:1px solid rgba(244,201,93,.48);color:var(--ls7-gold);font:950 24px 'Space Grotesk',sans-serif;
      background:rgba(244,201,93,.07);box-shadow:0 0 24px rgba(244,201,93,.10);
    }
    .ls7-runtime-settings-head div { min-width:0;display:flex;flex-direction:column;gap:2px; }
    .ls7-runtime-settings-head strong { color:#f8fbff;font-size:13px; }
    .ls7-runtime-settings-head small { color:#8ea9c7;font-size:9px; }
    .ls7-runtime-settings-card p,.ls7-runtime-status-card p { margin:0 0 11px;color:var(--text-dim);font-size:10px;line-height:1.5; }
    .ls7-runtime-status-card { border-color:rgba(138,92,255,.34); }
    .ls7-runtime-status-head { display:flex;align-items:center;gap:8px;margin-bottom:6px; }
    .ls7-runtime-status-head span { width:8px;height:8px;border-radius:50%;background:#58d8ff;box-shadow:0 0 14px #58d8ff; }
    .ls7-runtime-status-head strong { color:#c8f4ff;font-size:12px; }
    .ls7-runtime-notice-overlay { background:rgba(1,3,10,.86);backdrop-filter:blur(10px); }
    .ls7-runtime-notice { max-width:480px;border:1px solid rgba(88,216,255,.30);background:linear-gradient(165deg,#0a1425,#130b29); }
    .ls7-runtime-notice .modal-box-body { text-align:center;padding-top:26px; }
    .ls7-runtime-notice-mark {
      width:84px;height:84px;margin:0 auto 14px;display:grid;place-items:center;border-radius:26px;
      border:1px solid rgba(244,201,93,.55);color:var(--ls7-gold);font:950 54px 'Space Grotesk',sans-serif;
      background:radial-gradient(circle,rgba(244,201,93,.13),rgba(88,216,255,.05));
      box-shadow:0 0 50px rgba(88,216,255,.10);
    }
    .ls7-runtime-notice small { color:var(--ls7-blue);font:900 9px 'JetBrains Mono',monospace;letter-spacing:.16em; }
    .ls7-runtime-notice h2 { margin:9px 0 12px;font-size:28px; }
    .ls7-runtime-notice p { color:var(--text-dim);font-size:13px;line-height:1.55; }
    .ls7-runtime-roadmap { display:grid;grid-template-columns:auto 1fr;gap:8px 11px;margin:18px 0;padding:13px;border:1px solid rgba(88,216,255,.16);border-radius:14px;text-align:left; }
    .ls7-runtime-roadmap span { color:var(--ls7-blue);font:900 8px 'JetBrains Mono',monospace; }
    .ls7-runtime-roadmap b { color:var(--text);font-size:11px; }
    .ls7-runtime-notice blockquote { margin:14px 0 0;color:var(--text-dim);font-size:13px;line-height:1.55; }
    .ls7-runtime-notice blockquote strong { color:var(--ls7-gold); }

    /* INTERFACE MOTION 2 · identidad grafito, titanio, dorado y rojo eléctrico */
    html.ls7-app-runtime {
      --ls7-blue:#c9d4df;--ls7-violet:#ff4d45;--ls7-gold:#f4c95d;
      --ink:#090a0d;--panel:#121419;--panel-2:#1b1e24;--gold:#f4c95d;--gold-dim:#c99c36;
      --green:#ff554c;--text:#f7f5ef;--text-dim:#b9bec6;--border:#32363e;
    }
    html.ls7-app-runtime body {
      background:radial-gradient(circle at 12% -10%,rgba(244,201,93,.09),transparent 28%),radial-gradient(circle at 108% 38%,rgba(255,77,69,.075),transparent 30%),linear-gradient(145deg,#090a0d,#0d0f13 52%,#08090b);
    }
    html.ls7-app-runtime nav {
      border-color:rgba(244,201,93,.16);background:rgba(9,10,13,.90);
      box-shadow:0 12px 38px rgba(0,0,0,.34),inset 0 -1px 0 rgba(255,255,255,.018);backdrop-filter:blur(18px) saturate(120%);
    }
    html.ls7-app-runtime .nav-brand-scroll { color:#d9dee5; }
    html.ls7-app-runtime .form-card,html.ls7-app-runtime .video-card,html.ls7-app-runtime .auth-box {
      border-color:rgba(201,212,223,.13);background:linear-gradient(145deg,rgba(26,28,34,.96),rgba(13,14,18,.97));
      box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 18px 45px rgba(0,0,0,.24);
    }
    html.ls7-app-runtime input,html.ls7-app-runtime textarea,html.ls7-app-runtime select {
      border-color:rgba(201,212,223,.25);background:#0d0f13;color:#f7f5ef;
    }
    html.ls7-app-runtime input:focus,html.ls7-app-runtime textarea:focus,html.ls7-app-runtime select:focus {
      outline:3px solid rgba(244,201,93,.13);border-color:rgba(244,201,93,.66);
    }
    html.ls7-app-runtime .btn { background:linear-gradient(135deg,#dbab3e,#ff554c);color:#111;border-color:rgba(255,225,145,.38);box-shadow:0 10px 28px rgba(255,85,76,.12); }
    html.ls7-app-runtime .btn-outline { border-color:rgba(201,212,223,.25);color:#edf0f4;background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.012)); }
    html.ls7-app-runtime .page-title { color:#fbf8ef;text-shadow:0 0 28px rgba(244,201,93,.07); }
    html.ls7-app-runtime .nav-links button.active { color:#fff2c1;background:linear-gradient(135deg,rgba(244,201,93,.11),rgba(255,77,69,.07)); }
    html.ls7-app-runtime .nav-links button.active::after { background:linear-gradient(90deg,#d9dee5,var(--ls7-gold),#ff554c); }

    html.ls7-app-runtime .feed-actions {
      gap:8px!important;padding:8px 6px;border:1px solid rgba(201,212,223,.13);border-radius:26px;
      background:linear-gradient(160deg,rgba(25,27,33,.76),rgba(8,9,12,.70));
      box-shadow:0 18px 44px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.045);
      backdrop-filter:blur(15px) saturate(125%);
    }
    html.ls7-app-runtime .feed-action-btn {
      width:50px!important;min-height:50px!important;height:50px!important;padding:5px!important;border-radius:17px!important;
      border:1px solid rgba(201,212,223,.16)!important;background:linear-gradient(145deg,rgba(40,43,51,.88),rgba(14,15,19,.92))!important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 8px 18px rgba(0,0,0,.25)!important;
      color:#edf0f4!important;display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:1px;
    }
    html.ls7-app-runtime .feed-action-btn > span { font:850 22px 'Space Grotesk',sans-serif;line-height:1; }
    html.ls7-app-runtime .feed-action-btn > i { color:#aeb4bd;font:850 6px 'JetBrains Mono',monospace;letter-spacing:.05em; }
    html.ls7-app-runtime .feed-action-btn:active { transform:scale(.88)!important;box-shadow:inset 0 3px 12px rgba(0,0,0,.35)!important; }
    html.ls7-app-runtime .feed-action-btn.liked {
      border-color:rgba(255,82,74,.65)!important;background:linear-gradient(145deg,#c92f31,#6d151d)!important;
      box-shadow:0 0 0 3px rgba(255,82,74,.12),0 10px 25px rgba(201,47,49,.28)!important;
    }
    html.ls7-app-runtime .ls7-action-share > span { color:#f4c95d; }
    html.ls7-app-runtime .ls7-action-hide > span { color:#c9d4df; }
    html.ls7-app-runtime .ls7-action-report { border-color:rgba(255,82,74,.25)!important; }
    html.ls7-app-runtime .ls7-action-report > span { color:#ff6259;font-weight:950; }
    html.ls7-app-runtime #appView.ls7-swipe-left { animation:ls7SwipeLeft .13s ease both; }
    html.ls7-app-runtime #appView.ls7-swipe-right { animation:ls7SwipeRight .13s ease both; }
    html.ls7-app-runtime #ls7SwipeRail {
      position:fixed;left:50%;top:calc(max(64px,env(safe-area-inset-top) + 56px));z-index:74;
      width:154px;height:29px;transform:translateX(-50%);display:flex;align-items:center;justify-content:space-between;
      padding:0 11px;border:1px solid rgba(244,201,93,.22);border-radius:999px;
      background:rgba(12,13,17,.78);box-shadow:0 8px 25px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.04);
      color:#f4c95d;backdrop-filter:blur(12px);touch-action:pan-x;transition:opacity .16s ease,transform .16s ease;
    }
    html.ls7-app-runtime #ls7SwipeRail b { color:#d8dce2;font:850 7px 'JetBrains Mono',monospace;letter-spacing:.09em; }
    html.ls7-app-runtime #ls7SwipeRail span { font-size:16px;line-height:1; }
    html.ls7-app-runtime #ls7SwipeRail.is-left { transform:translateX(calc(-50% - 8px)); }
    html.ls7-app-runtime #ls7SwipeRail.is-right { transform:translateX(calc(-50% + 8px)); }
    html.ls7-app-runtime #ls7SwipeRail.is-hidden { opacity:0;pointer-events:none; }

    /* Menú hamburguesa LiveScroll 7 · centro de control */
    html.ls7-app-runtime .mobile-menu-overlay { background:rgba(3,4,6,.76);backdrop-filter:blur(7px); }
    html.ls7-app-runtime .ls7-mobile-menu-panel {
      width:min(90%,365px);max-width:365px;padding:18px 14px 0;border-left:1px solid rgba(244,201,93,.18);
      background:radial-gradient(circle at 110% -5%,rgba(255,77,69,.14),transparent 30%),linear-gradient(165deg,rgba(27,29,35,.99),rgba(9,10,13,.995));
      box-shadow:-26px 0 70px rgba(0,0,0,.58),inset 1px 0 0 rgba(255,255,255,.025);
      animation:ls7ControlCenterIn .32s cubic-bezier(.16,1,.3,1) both;
    }
    html.ls7-app-runtime .ls7-mobile-menu-panel .ls-mobile-menu-head {
      padding:3px 4px 15px;border-bottom:1px solid rgba(244,201,93,.13);
    }
    html.ls7-app-runtime .ls7-mobile-menu-panel .ls-mobile-menu-head strong { font-size:24px;letter-spacing:-.055em; }
    html.ls7-app-runtime .ls7-mobile-menu-panel .ls-mobile-menu-head strong em { color:#f4c95d;text-shadow:0 0 16px rgba(244,201,93,.28); }
    html.ls7-app-runtime .ls7-mobile-menu-panel .ls-mobile-menu-head small { color:#aeb4bd;letter-spacing:.15em; }
    html.ls7-app-runtime .ls7-mobile-menu-panel .ls-mobile-menu-close {
      border-color:rgba(201,212,223,.18);background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.012));color:#e6e9ed;
    }
    html.ls7-app-runtime .ls7-menu-runtime-line {
      margin:11px 2px 4px;padding:8px 10px;display:flex;align-items:center;gap:7px;border:1px solid rgba(244,201,93,.12);border-radius:11px;
      background:linear-gradient(90deg,rgba(244,201,93,.055),rgba(255,77,69,.035));font:800 7px 'JetBrains Mono',monospace;letter-spacing:.09em;color:#aeb4bd;
    }
    html.ls7-app-runtime .ls7-menu-runtime-line i { width:6px;height:6px;border-radius:50%;background:#ff554c;box-shadow:0 0 10px rgba(255,85,76,.75); }
    html.ls7-app-runtime .ls7-menu-runtime-line b { margin-left:auto;color:#f4c95d; }
    html.ls7-app-runtime .ls7-mobile-menu-panel .ls-mobile-menu-label { color:#777f8a;letter-spacing:.17em;padding-top:15px; }
    html.ls7-app-runtime .ls7-mobile-menu-panel .ls-mobile-menu-scroll > button {
      min-height:51px;margin-bottom:3px;padding:7px 10px;border:1px solid transparent;border-bottom-color:rgba(201,212,223,.065);border-radius:14px;
      color:#d7dbe1;transition:transform .15s ease,background .15s ease,border-color .15s ease;
    }
    html.ls7-app-runtime .ls7-mobile-menu-panel .ls-mobile-menu-scroll > button span {
      background:linear-gradient(145deg,rgba(201,212,223,.075),rgba(255,255,255,.015));border:1px solid rgba(201,212,223,.07);filter:grayscale(.2);
    }
    html.ls7-app-runtime .ls7-mobile-menu-panel .ls-mobile-menu-scroll > button.active {
      color:#fff1bd;border-color:rgba(244,201,93,.19);background:linear-gradient(135deg,rgba(244,201,93,.105),rgba(255,77,69,.055));
      box-shadow:inset 3px 0 0 #f4c95d,0 8px 22px rgba(0,0,0,.13);
    }
    html.ls7-app-runtime .ls7-mobile-menu-panel .ls-mobile-menu-scroll > button:active { transform:scale(.975); }
    html.ls7-app-runtime .ls7-mobile-menu-panel .ls-mobile-menu-exit { border-color:rgba(244,201,93,.13); }
    @keyframes ls7ControlCenterIn { from{opacity:.65;transform:translate3d(38px,0,0)}to{opacity:1;transform:none} }

    /* Creator Studio LiveScroll 7 · subida moderna y accesible */
    html.ls7-app-runtime .ls-upload-studio-shell { perspective:900px; }
    html.ls7-app-runtime .ls-upload-studio-hero {
      border-color:rgba(244,201,93,.22)!important;border-radius:24px!important;padding:25px!important;
      background:radial-gradient(circle at 88% 8%,rgba(255,77,69,.16),transparent 32%),radial-gradient(circle at 12% 110%,rgba(244,201,93,.09),transparent 36%),linear-gradient(145deg,rgba(35,37,44,.98),rgba(11,12,16,.98))!important;
      box-shadow:0 24px 60px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.05);
    }
    html.ls7-app-runtime .ls-upload-studio-hero::after {
      content:"7";position:absolute;right:20px;top:-25px;color:rgba(244,201,93,.035);font:950 150px 'Space Grotesk',sans-serif;pointer-events:none;
    }
    html.ls7-app-runtime .ls-upload-studio-steps > div {
      position:relative;overflow:hidden;min-height:68px!important;padding:13px!important;border-color:rgba(201,212,223,.13)!important;border-radius:15px!important;
      background:linear-gradient(145deg,rgba(30,32,38,.94),rgba(13,14,18,.95))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.03),0 9px 23px rgba(0,0,0,.15);
    }
    html.ls7-app-runtime .ls-upload-studio-steps > div strong { color:#f4c95d!important;font:900 13px 'JetBrains Mono',monospace; }
    html.ls7-app-runtime .ls-upload-mode-grid button {
      min-height:72px;border-radius:17px!important;border:1px solid rgba(201,212,223,.16)!important;
      background:linear-gradient(145deg,rgba(38,40,47,.96),rgba(13,14,18,.96))!important;color:#eef0f3!important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.045),0 12px 30px rgba(0,0,0,.18)!important;
    }
    html.ls7-app-runtime .ls-upload-mode-grid button.btn {
      border-color:rgba(244,201,93,.42)!important;background:linear-gradient(135deg,rgba(216,165,50,.96),rgba(255,85,76,.88))!important;color:#14100c!important;
    }
    html.ls7-app-runtime .ls-upload-studio-form {
      border-radius:23px!important;padding:21px!important;border-color:rgba(201,212,223,.14)!important;
      background:linear-gradient(155deg,rgba(27,29,35,.98),rgba(10,11,14,.985))!important;box-shadow:0 22px 55px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.035)!important;
    }
    html.ls7-app-runtime .ls-upload-studio-form .field label { color:#e8e9eb;font-weight:750; }
    html.ls7-app-runtime .ls-upload-studio-form input,html.ls7-app-runtime .ls-upload-studio-form select {
      min-height:48px;border-radius:13px!important;background:rgba(7,8,11,.78)!important;border-color:rgba(201,212,223,.20)!important;
    }
    html.ls7-app-runtime .ls-upload-file-drop {
      min-height:150px!important;border:1px dashed rgba(244,201,93,.44)!important;border-radius:20px!important;
      background:radial-gradient(circle at 50% 40%,rgba(244,201,93,.10),transparent 38%),linear-gradient(145deg,rgba(255,255,255,.025),rgba(255,77,69,.025))!important;
      box-shadow:inset 0 0 0 5px rgba(244,201,93,.018);transition:transform .18s ease,border-color .18s ease,background .18s ease;
    }
    html.ls7-app-runtime .ls-upload-file-drop:active { transform:scale(.985);border-color:rgba(255,85,76,.62)!important; }
    html.ls7-app-runtime #uploadSubmitBtn { min-height:54px;border-radius:16px!important;font-size:14px;letter-spacing:.01em; }
    html.ls7-app-runtime #uploadProgressBar { background:linear-gradient(90deg,#f4c95d,#ff554c)!important;box-shadow:0 0 15px rgba(255,85,76,.35); }
    @media(max-width:560px) {
      html.ls7-app-runtime .ls-upload-studio-hero { padding:20px 17px!important; }
      html.ls7-app-runtime .ls-upload-studio-steps { gap:5px!important; }
      html.ls7-app-runtime .ls-upload-studio-steps > div { padding:10px 8px!important;font-size:9px!important; }
      html.ls7-app-runtime .ls-upload-studio-form { padding:16px!important; }
    }

    /* Barra inferior LiveScroll 7 · flotante, metálica y separada de LS6 */
    @media(max-width:780px) {
      html.ls7-app-runtime body.ls-navigation-ready .ls-mobile-dock {
        left:max(12px,env(safe-area-inset-left));right:max(12px,env(safe-area-inset-right));
        bottom:max(10px,env(safe-area-inset-bottom));width:auto;max-width:520px;height:68px;margin:0 auto;
        transform:none!important;
        padding:7px 8px 6px;border:1px solid rgba(218,224,232,.16);border-radius:24px;
        background:linear-gradient(165deg,rgba(33,35,42,.94),rgba(10,11,14,.96));
        box-shadow:0 20px 48px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.065),inset 0 -1px 0 rgba(0,0,0,.65);
        backdrop-filter:blur(20px) saturate(130%);
      }
      html.ls7-app-runtime .ls-mobile-dock::before {
        content:"";position:absolute;left:14%;right:14%;top:-1px;height:1px;
        background:linear-gradient(90deg,transparent,rgba(244,201,93,.62),rgba(255,77,69,.52),transparent);
      }
      html.ls7-app-runtime .ls-mobile-dock button {
        min-height:52px;border-radius:17px;color:#9299a4;transition:transform .18s cubic-bezier(.2,.8,.2,1),color .18s ease,background .18s ease;
      }
      html.ls7-app-runtime .ls-mobile-dock button small { font:800 7px 'JetBrains Mono',monospace;letter-spacing:.035em; }
      html.ls7-app-runtime .ls-mobile-dock button.active {
        color:#f5f1e7;background:linear-gradient(145deg,rgba(244,201,93,.11),rgba(255,77,69,.055));
        box-shadow:inset 0 1px 0 rgba(255,255,255,.035);
      }
      html.ls7-app-runtime .ls-mobile-dock button.active::after {
        bottom:1px;width:22px;height:2px;background:linear-gradient(90deg,#f4c95d,#ff554c);box-shadow:0 0 10px rgba(244,201,93,.36);
      }
      html.ls7-app-runtime .ls7-dock-icon { width:25px;height:25px;display:grid;place-items:center; }
      html.ls7-app-runtime .ls7-dock-icon svg { width:21px;height:21px;overflow:visible;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round; }
      html.ls7-app-runtime .ls-mobile-dock button.active .ls7-dock-icon { filter:drop-shadow(0 0 7px rgba(244,201,93,.30));animation:ls7DockIconIn .3s cubic-bezier(.16,1,.3,1) both; }
      html.ls7-app-runtime .ls-mobile-dock .ls-dock-create { overflow:visible;background:transparent!important;box-shadow:none!important; }
      html.ls7-app-runtime .ls-mobile-dock .ls-dock-create::after { display:none; }
      html.ls7-app-runtime .ls7-dock-create-core {
        width:45px;height:45px;margin-top:-25px;display:grid;place-items:center;border:1px solid rgba(255,231,159,.58);border-radius:16px;
        background:linear-gradient(145deg,#ffe594,#d49a29 58%,#ff554c);color:#15100a;
        box-shadow:0 10px 27px rgba(0,0,0,.42),0 0 0 5px rgba(9,10,13,.9),inset 0 1px 0 rgba(255,255,255,.58);
        transform:rotate(45deg);transition:transform .2s cubic-bezier(.2,.8,.2,1);
      }
      html.ls7-app-runtime .ls7-dock-create-core svg { width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;transform:rotate(-45deg); }
      html.ls7-app-runtime .ls-dock-create.active .ls7-dock-create-core { transform:rotate(45deg) scale(1.07);box-shadow:0 12px 32px rgba(0,0,0,.48),0 0 0 5px rgba(9,10,13,.92),0 0 22px rgba(255,85,76,.24),inset 0 1px 0 rgba(255,255,255,.62); }
      html.ls7-app-runtime .ls-mobile-dock .ls-dock-create small { margin-top:2px;color:#d8dde4; }
      @keyframes ls7DockIconIn { from{transform:translateY(3px) scale(.86);opacity:.7}to{transform:none;opacity:1} }
    }

    /* Medallas LiveScroll 7 · metal, grabado, relieve y textura por rareza */
    html.ls7-app-runtime .ls-equipped-medal,
    html.ls7-app-runtime .ls-store-badge-icon,
    html.ls7-app-runtime .ls-medal-detail-icon,
    html.ls7-app-runtime .ls-medal-picker-icon {
      --ls7-medal-a:#e7ebef;--ls7-medal-b:#69717c;--ls7-medal-edge:#cbd2d9;--ls7-medal-glow:rgba(203,210,217,.14);
      position:relative;isolation:isolate;border-color:var(--ls7-medal-edge)!important;
      background:
        radial-gradient(circle at 29% 20%,rgba(255,255,255,.80) 0 3%,rgba(255,255,255,.18) 9%,transparent 24%),
        repeating-conic-gradient(from 18deg,rgba(255,255,255,.055) 0 4deg,rgba(0,0,0,.035) 4deg 8deg),
        radial-gradient(circle at 50% 48%,var(--ls7-medal-a),var(--ls7-medal-b) 74%,#23262c 100%)!important;
      box-shadow:
        inset 0 0 0 2px rgba(8,9,12,.34),inset 0 0 0 4px rgba(255,255,255,.085),
        inset 3px 4px 8px rgba(255,255,255,.12),inset -4px -5px 9px rgba(0,0,0,.44),
        0 8px 17px rgba(0,0,0,.40),0 0 22px var(--ls7-medal-glow)!important;
      text-shadow:0 1px 0 rgba(255,255,255,.38),0 2px 5px rgba(0,0,0,.56);
      filter:saturate(1.08) contrast(1.04);
    }
    html.ls7-app-runtime .ls-medal-rarity-rara,
    html.ls7-app-runtime .ls-rarity-rara { --ls7-medal-a:#d7f5ff;--ls7-medal-b:#2387a8;--ls7-medal-edge:#83e2ff;--ls7-medal-glow:rgba(70,202,241,.28); }
    html.ls7-app-runtime .ls-medal-rarity-epica,
    html.ls7-app-runtime .ls-rarity-epica { --ls7-medal-a:#efd9ff;--ls7-medal-b:#6f2aa1;--ls7-medal-edge:#d59cff;--ls7-medal-glow:rgba(190,101,255,.31); }
    html.ls7-app-runtime .ls-medal-rarity-legendaria,
    html.ls7-app-runtime .ls-rarity-legendaria { --ls7-medal-a:#fff0a8;--ls7-medal-b:#b16d09;--ls7-medal-edge:#ffd65e;--ls7-medal-glow:rgba(244,190,48,.34); }
    html.ls7-app-runtime .ls-medal-rarity-exclusiva,
    html.ls7-app-runtime .ls-rarity-exclusiva { --ls7-medal-a:#ffd4df;--ls7-medal-b:#a32e57;--ls7-medal-edge:#ff8daa;--ls7-medal-glow:rgba(255,87,137,.34); }
    html.ls7-app-runtime .ls-medal-rarity-mitica,
    html.ls7-app-runtime .ls-rarity-mitica {
      --ls7-medal-a:#ffcc73;--ls7-medal-b:#a70d27;--ls7-medal-edge:#ff3c4f;--ls7-medal-glow:rgba(255,42,67,.50);
      background:
        radial-gradient(circle at 29% 18%,rgba(255,245,183,.88) 0 3%,rgba(255,194,103,.22) 9%,transparent 23%),
        repeating-conic-gradient(from 12deg,rgba(255,212,93,.14) 0 5deg,rgba(75,0,13,.09) 5deg 10deg),
        radial-gradient(circle at 50% 48%,#ffbd56,#c31535 58%,#5d0717 83%,#d9a62b 100%)!important;
    }
    html.ls7-app-runtime .ls-equipped-medal { font-size:18px; }
    html.ls7-app-runtime .ls-equipped-medal > *,html.ls7-app-runtime .ls-store-badge-icon > * { position:relative;z-index:2; }
    html.ls7-app-runtime .ls-store-badge-icon { width:76px;height:76px;border-width:2px;font-size:39px; }
    html.ls7-app-runtime .ls-medal-detail-icon { width:88px;height:88px;border-width:2px;font-size:48px; }
    html.ls7-app-runtime .ls-medal-picker-icon { width:43px;height:43px;display:grid;place-items:center;border:1px solid;border-radius:50%;font-size:25px; }
    html.ls7-app-runtime .ls-medal-picker-item { background:linear-gradient(155deg,rgba(37,39,46,.90),rgba(14,15,19,.94));box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 9px 22px rgba(0,0,0,.18); }
    html.ls7-app-runtime .ls-equipped-medal:hover { transform:translateY(-3px) rotateX(7deg) rotateY(-6deg) scale(1.08); }
    @keyframes ls7SwipeLeft { to{opacity:.55;transform:translate3d(-22px,0,0) scale(.995)} }
    @keyframes ls7SwipeRight { to{opacity:.55;transform:translate3d(22px,0,0) scale(.995)} }
    @media(max-width:700px) {
      html.ls7-app-runtime .feed-actions { right:8px!important;padding:6px 5px; }
      html.ls7-app-runtime .feed-action-btn { width:46px!important;min-height:46px!important;height:46px!important;border-radius:15px!important; }
    }
  `;
  document.head.appendChild(style);
}

ensureLiveScroll7RuntimeStyles();

// 7.0.1 · IDENTIDAD ELÉCTRICA
// Esta capa está al final a propósito: reemplaza la prueba roja anterior
// únicamente dentro de la APK LiveScroll 7.
function ensureLiveScroll7ElectricIdentity() {
  if (!isLiveScroll7App() || document.getElementById("ls7ElectricIdentity701")) return;
  const style = document.createElement("style");
  style.id = "ls7ElectricIdentity701";
  style.textContent = `
    html.ls7-app-runtime {
      --ls7-cyan:#39e7ff;--ls7-blue:#2588ff;--ls7-violet:#8a55ff;--ls7-gold:#ffd66b;
      --ink:#020610;--panel:#071426;--panel-2:#0b1d35;--gold:#39e7ff;--gold-dim:#2588ff;
      --green:#39e7ff;--red:#8a55ff;--text:#f5fbff;--text-dim:#9eb6d1;--border:#183b61;
    }
    html.ls7-app-runtime body {
      background:radial-gradient(circle at 8% -5%,rgba(57,231,255,.16),transparent 28%),radial-gradient(circle at 108% 22%,rgba(138,85,255,.18),transparent 31%),linear-gradient(155deg,#020610,#061124 55%,#030713)!important;
    }
    html.ls7-app-runtime nav { border-color:rgba(57,231,255,.20)!important;background:rgba(2,8,20,.88)!important;box-shadow:0 14px 44px rgba(0,0,0,.38),0 0 40px rgba(37,136,255,.055)!important; }
    html.ls7-app-runtime nav { top:max(30px,calc(env(safe-area-inset-top) + 6px))!important;margin-top:max(30px,calc(env(safe-area-inset-top) + 6px))!important; }
    html.ls7-app-runtime .nav-brand-scroll { color:#39e7ff!important;text-shadow:0 0 18px rgba(57,231,255,.35); }
    html.ls7-app-runtime .nav-brand b { color:#eafbff!important;background:linear-gradient(145deg,#2588ff,#8a55ff)!important;border-color:rgba(120,226,255,.55)!important;box-shadow:0 0 20px rgba(57,231,255,.28)!important; }
    html.ls7-app-runtime .form-card,html.ls7-app-runtime .video-card,html.ls7-app-runtime .auth-box { border-color:rgba(57,231,255,.15)!important;background:linear-gradient(145deg,rgba(8,28,52,.96),rgba(4,10,25,.98))!important; }
    html.ls7-app-runtime .btn { color:#fff!important;background:linear-gradient(125deg,#168ce8,#684dff 58%,#27d8ee)!important;border-color:rgba(120,229,255,.40)!important;box-shadow:0 10px 30px rgba(37,136,255,.18)!important; }
    html.ls7-app-runtime .btn-outline { color:#dffaff!important;border-color:rgba(57,231,255,.28)!important;background:rgba(27,120,190,.08)!important; }
    html.ls7-app-runtime .nav-links button.active { color:#e7fbff!important;background:linear-gradient(135deg,rgba(57,231,255,.13),rgba(138,85,255,.11))!important; }
    html.ls7-app-runtime .nav-links button.active::after { background:linear-gradient(90deg,#39e7ff,#2588ff,#8a55ff,#ffd66b)!important; }

    html.ls7-app-runtime .ls7-electric-profile {
      isolation:isolate;border:1px solid rgba(57,231,255,.30)!important;border-radius:28px!important;
      background:radial-gradient(circle at 90% 4%,rgba(138,85,255,.22),transparent 34%),radial-gradient(circle at 5% 72%,rgba(57,231,255,.14),transparent 35%),linear-gradient(150deg,#091d38,#050b19 62%,#100a29)!important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 22px 65px rgba(0,0,0,.40),0 0 50px rgba(37,136,255,.08)!important;
    }
    html.ls7-app-runtime .ls7-electric-profile::before { content:"";position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.34;background:linear-gradient(115deg,transparent 0 42%,rgba(57,231,255,.12) 43%,transparent 44% 55%,rgba(138,85,255,.10) 56%,transparent 57%);background-size:180% 100%;animation:ls7ProfileScan 6s linear infinite; }
    html.ls7-app-runtime .ls7-electric-profile .profile-cover { min-height:164px;border-bottom:1px solid rgba(57,231,255,.22)!important;background-color:#061529;background-image:linear-gradient(120deg,rgba(57,231,255,.12),rgba(37,136,255,.04),rgba(138,85,255,.16)); }
    html.ls7-app-runtime .ls7-profile-emblem { position:absolute;right:15px;top:108px;z-index:6;width:66px;height:66px;object-fit:contain;filter:drop-shadow(0 0 14px rgba(57,231,255,.65)) drop-shadow(0 0 28px rgba(138,85,255,.30));animation:ls7EmblemFloat 3.5s ease-in-out infinite; }
    html.ls7-app-runtime .ls7-electric-profile .profile-avatar-ring { padding:3px!important;border:0!important;background:conic-gradient(from 30deg,#39e7ff,#2588ff,#8a55ff,#ffd66b,#39e7ff)!important;box-shadow:0 0 0 5px rgba(5,14,31,.92),0 0 32px rgba(57,231,255,.35)!important; }
    html.ls7-app-runtime .ls7-electric-profile .profile-name-block h1 { color:#f8fdff;letter-spacing:-.04em;text-shadow:0 0 22px rgba(57,231,255,.15); }
    html.ls7-app-runtime .ls7-electric-profile .profile-role-badge { border:1px solid rgba(57,231,255,.26);background:linear-gradient(90deg,rgba(57,231,255,.11),rgba(138,85,255,.10));color:#caf8ff; }
    html.ls7-app-runtime .ls7-electric-profile .profile-bio { color:#c6d8ea;line-height:1.6; }
    html.ls7-app-runtime .ls7-electric-profile .stat-pill { border:1px solid rgba(57,231,255,.18)!important;border-radius:16px!important;background:linear-gradient(145deg,rgba(17,55,89,.52),rgba(8,15,34,.72))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035); }
    html.ls7-app-runtime .ls7-electric-profile .stat-pill .num { color:#72efff!important;text-shadow:0 0 14px rgba(57,231,255,.28); }
    html.ls7-app-runtime .profile-section { border-color:rgba(57,231,255,.10); }
    html.ls7-app-runtime .profile-section-head .ico { border:1px solid rgba(57,231,255,.20);background:linear-gradient(145deg,rgba(57,231,255,.11),rgba(138,85,255,.09));box-shadow:0 0 18px rgba(37,136,255,.07); }
    html.ls7-app-runtime .video-grid-tile { border:1px solid rgba(57,231,255,.15);border-radius:18px;overflow:hidden;background:#071326;box-shadow:0 12px 28px rgba(0,0,0,.28);transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease; }
    html.ls7-app-runtime .video-grid-tile:active { transform:scale(.965);border-color:rgba(57,231,255,.52);box-shadow:0 0 28px rgba(57,231,255,.16); }
    html.ls7-app-runtime .ls7-living-profile { margin:18px 0 22px;padding:18px;border:1px solid rgba(57,231,255,.22);border-radius:26px;background:radial-gradient(circle at 4% 0,rgba(57,231,255,.10),transparent 30%),linear-gradient(150deg,rgba(8,28,53,.96),rgba(5,9,23,.98));box-shadow:0 20px 48px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.04);overflow:hidden;position:relative; }
    html.ls7-app-runtime .ls7-living-profile::after { content:"";position:absolute;inset:-60% -30%;pointer-events:none;background:conic-gradient(from 90deg,transparent,rgba(57,231,255,.06),transparent 18%,rgba(138,85,255,.06),transparent 36%);animation:ls7LivingOrbit 13s linear infinite; }
    html.ls7-app-runtime .ls7-living-head,html.ls7-app-runtime .ls7-living-grid { position:relative;z-index:1; }
    html.ls7-app-runtime .ls7-living-head { display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:14px; }
    html.ls7-app-runtime .ls7-living-head small { color:#55eaff;font:900 8px 'JetBrains Mono',monospace;letter-spacing:.17em; }
    html.ls7-app-runtime .ls7-living-head h2 { margin:4px 0 0;font-size:24px;letter-spacing:-.045em; }
    html.ls7-app-runtime .ls7-living-head > span { display:flex;align-items:center;gap:7px;padding:7px 9px;border:1px solid rgba(57,231,255,.20);border-radius:999px;color:#a9c7df;font:850 7px 'JetBrains Mono',monospace;letter-spacing:.09em;background:rgba(4,14,30,.72); }
    html.ls7-app-runtime .ls7-living-head > span i { width:7px;height:7px;border-radius:50%;background:#39e7ff;box-shadow:0 0 13px #39e7ff;animation:ls7SignalPulse 1.6s ease-in-out infinite; }
    html.ls7-app-runtime .ls7-living-head > span.is-live i { background:#ffd66b;box-shadow:0 0 15px #ffd66b; }
    html.ls7-app-runtime .ls7-living-head-actions { display:flex;align-items:center;gap:8px; }
    html.ls7-app-runtime .ls7-living-head-actions > span { display:flex;align-items:center;gap:7px;padding:7px 9px;border:1px solid rgba(57,231,255,.20);border-radius:999px;color:#a9c7df;font:850 7px 'JetBrains Mono',monospace;letter-spacing:.09em;background:rgba(4,14,30,.72); }
    html.ls7-app-runtime .ls7-living-head-actions > span i { width:7px;height:7px;border-radius:50%;background:#39e7ff;box-shadow:0 0 13px #39e7ff;animation:ls7SignalPulse 1.6s ease-in-out infinite; }
    html.ls7-app-runtime .ls7-profile-customize-btn { min-height:31px;padding:0 11px;border:1px solid rgba(138,85,255,.35);border-radius:999px;background:linear-gradient(135deg,rgba(57,231,255,.10),rgba(138,85,255,.16));color:#e9faff;font:850 8px 'JetBrains Mono',monospace;letter-spacing:.07em;cursor:pointer; }
    html.ls7-app-runtime .ls7-living-grid { display:grid;grid-template-columns:minmax(0,1.45fr) minmax(220px,.55fr);gap:13px; }
    html.ls7-app-runtime .ls7-featured-video { min-height:260px;padding:0;position:relative;overflow:hidden;border:1px solid rgba(57,231,255,.22);border-radius:21px;background:#040a16;color:#fff;text-align:left;cursor:pointer;box-shadow:0 18px 35px rgba(0,0,0,.30); }
    html.ls7-app-runtime .ls7-featured-cover,html.ls7-app-runtime .ls7-featured-cover > * { position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important; }
    html.ls7-app-runtime .ls7-featured-shade { position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,7,18,.05),rgba(3,8,19,.30) 45%,rgba(3,8,20,.95)); }
    html.ls7-app-runtime .ls7-featured-copy { position:absolute;left:17px;right:17px;bottom:16px;display:flex;flex-direction:column;gap:4px; }
    html.ls7-app-runtime .ls7-featured-copy small { color:#62edff;font:900 8px 'JetBrains Mono',monospace;letter-spacing:.14em; }
    html.ls7-app-runtime .ls7-featured-copy strong { font-size:20px;line-height:1.15;text-shadow:0 2px 10px #000; }
    html.ls7-app-runtime .ls7-featured-copy span { color:#c4d6e6;font-size:10px; }
    html.ls7-app-runtime .ls7-featured-empty { min-height:240px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:10px;padding:24px;border:1px dashed rgba(57,231,255,.30);border-radius:21px;background:linear-gradient(145deg,rgba(57,231,255,.06),rgba(138,85,255,.05)); }
    html.ls7-app-runtime .ls7-featured-empty b { font-size:21px; }html.ls7-app-runtime .ls7-featured-empty span { color:#9eb6d1;font-size:12px;line-height:1.5; }
    html.ls7-app-runtime .ls7-live-data { display:flex;flex-direction:column;gap:10px; }
    html.ls7-app-runtime .ls7-live-data > div,html.ls7-app-runtime .ls7-live-data > p { margin:0;padding:13px;border:1px solid rgba(57,231,255,.14);border-radius:16px;background:linear-gradient(145deg,rgba(22,59,94,.35),rgba(8,14,31,.72)); }
    html.ls7-app-runtime .ls7-live-data > div:first-child { display:grid;grid-template-columns:1fr auto;align-items:center;gap:7px; }
    html.ls7-app-runtime .ls7-live-data small { color:#89a6c2;font:850 7px 'JetBrains Mono',monospace;letter-spacing:.08em; }
    html.ls7-app-runtime .ls7-live-data strong { color:#71efff;font:900 19px 'Space Grotesk',sans-serif; }
    html.ls7-app-runtime .ls7-live-data > div:first-child > i { grid-column:1/-1;height:4px;border-radius:99px;background:#07101f;overflow:hidden; }
    html.ls7-app-runtime .ls7-live-data > div:first-child > i b { display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#39e7ff,#2588ff,#8a55ff);box-shadow:0 0 12px #2588ff; }
    html.ls7-app-runtime .ls7-data-pair { display:grid!important;grid-template-columns:1fr 1fr;gap:9px; }
    html.ls7-app-runtime .ls7-data-pair span { display:flex;flex-direction:column;gap:3px;min-width:0; }
    html.ls7-app-runtime .ls7-data-pair b { color:#eefbff;font-size:15px;overflow:hidden;text-overflow:ellipsis; }
    html.ls7-app-runtime .ls7-live-data > p { color:#a9c0d7;font-size:9px;line-height:1.45;display:flex;align-items:center;gap:7px; }
    html.ls7-app-runtime .ls7-live-data > p i { flex:0 0 auto;width:6px;height:6px;border-radius:50%;background:#8a55ff;box-shadow:0 0 10px #8a55ff; }
    html.ls7-app-runtime .ls7-living-profile.ls7-profile-style-cosmic { border-color:rgba(181,117,255,.34);background:radial-gradient(circle at 82% 2%,rgba(175,103,255,.24),transparent 34%),radial-gradient(circle at 8% 82%,rgba(37,136,255,.14),transparent 35%),linear-gradient(145deg,#100a2c,#050717 66%,#071a35); }
    html.ls7-app-runtime .ls7-living-profile.ls7-profile-style-minimal { border-color:rgba(174,203,225,.15);background:linear-gradient(155deg,#0b1019,#05070c);box-shadow:0 18px 45px rgba(0,0,0,.32)!important; }
    html.ls7-app-runtime .ls7-living-profile.ls7-profile-style-minimal::after { display:none; }
    html.ls7-app-runtime .ls7-profile-customizer-overlay { align-items:flex-start;justify-content:center;padding:clamp(24px,6vh,58px) 12px max(76px,calc(env(safe-area-inset-bottom) + 64px));background:rgba(1,4,12,.88);backdrop-filter:blur(12px);overflow:hidden; }
    html.ls7-app-runtime .ls7-profile-customizer-box { width:min(520px,100%);max-height:calc(100dvh - max(116px,calc(env(safe-area-inset-bottom) + 102px)));display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(57,231,255,.28);border-radius:26px;background:linear-gradient(155deg,#07172b,#090719 72%,#150b2b);box-shadow:0 30px 90px rgba(0,0,0,.65),0 0 50px rgba(37,136,255,.10); }
    html.ls7-app-runtime .ls7-profile-customizer-box .modal-box-head { flex:0 0 auto; }
    html.ls7-app-runtime .ls7-profile-customizer-box .modal-box-body { flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding-bottom:18px; }
    html.ls7-app-runtime .ls7-profile-customizer-box .modal-box-actions { position:relative;z-index:2;flex:0 0 auto;margin:0;padding:12px 16px max(15px,env(safe-area-inset-bottom));border-top:1px solid rgba(57,231,255,.14);background:linear-gradient(180deg,rgba(7,13,31,.96),#080b1c);box-shadow:0 -12px 25px rgba(1,4,12,.34); }
    html.ls7-app-runtime .ls7-profile-customizer-box .modal-box-head small { color:#57eaff;font:900 8px 'JetBrains Mono',monospace;letter-spacing:.16em; }
    html.ls7-app-runtime .ls7-profile-customizer-box .modal-box-head h2 { margin:4px 0 0; }
    html.ls7-app-runtime .ls7-customizer-label { display:block;margin:5px 0 7px;color:#9fb9d2;font:850 8px 'JetBrains Mono',monospace;letter-spacing:.10em;text-transform:uppercase; }
    html.ls7-app-runtime #ls7FeaturedVideoSelect { width:100%;margin-bottom:18px; }
    html.ls7-app-runtime .ls7-style-picker { display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px; }
    html.ls7-app-runtime .ls7-style-picker button { min-height:86px;padding:10px;border:1px solid rgba(57,231,255,.13);border-radius:15px;background:rgba(8,20,38,.72);color:#eaf8ff;text-align:left;display:flex;align-items:flex-start;gap:8px;cursor:pointer; }
    html.ls7-app-runtime .ls7-style-picker button.active { border-color:rgba(57,231,255,.56);background:linear-gradient(145deg,rgba(57,231,255,.14),rgba(138,85,255,.14));box-shadow:0 0 24px rgba(37,136,255,.10),inset 0 1px 0 rgba(255,255,255,.06); }
    html.ls7-app-runtime .ls7-style-picker button > b { font-size:20px;color:#63edff; }html.ls7-app-runtime .ls7-style-picker button span { display:flex;flex-direction:column;gap:4px; }html.ls7-app-runtime .ls7-style-picker button strong { font-size:11px; }html.ls7-app-runtime .ls7-style-picker button small { color:#8fa9c2;font-size:8px;line-height:1.35; }
    html.ls7-app-runtime .ls7-style-preview { min-height:104px;padding:15px;border:1px solid rgba(57,231,255,.22);border-radius:17px;display:flex;align-items:center;gap:13px;background:linear-gradient(145deg,#092241,#090a1b);transition:background .2s ease,border-color .2s ease; }
    html.ls7-app-runtime .ls7-style-preview > i { width:48px;height:48px;border-radius:50%;background:conic-gradient(#39e7ff,#2588ff,#8a55ff,#ffd66b,#39e7ff);box-shadow:0 0 24px rgba(57,231,255,.28); }
    html.ls7-app-runtime .ls7-style-preview > div { display:flex;flex-direction:column;gap:3px; }html.ls7-app-runtime .ls7-style-preview small { color:#62edff;font:850 7px 'JetBrains Mono',monospace;letter-spacing:.1em; }html.ls7-app-runtime .ls7-style-preview strong { font-size:18px; }html.ls7-app-runtime .ls7-style-preview span { color:#9fb4c9;font-size:9px; }
    html.ls7-app-runtime .ls7-style-preview.ls7-profile-style-cosmic { border-color:rgba(173,103,255,.38);background:radial-gradient(circle at 85% 5%,rgba(160,82,255,.28),transparent 40%),linear-gradient(145deg,#190d3a,#08091a); }
    html.ls7-app-runtime .ls7-style-preview.ls7-profile-style-minimal { border-color:rgba(180,205,225,.16);background:linear-gradient(145deg,#111720,#06080d); }
    html.ls7-app-runtime .ls7-electric-update-overlay { position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:20px 20px calc(20px + 9vh);background:rgba(1,4,13,.88);backdrop-filter:blur(13px); }
    html.ls7-app-runtime .ls7-electric-update-card { width:min(440px,100%);padding:25px;text-align:center;color:#f7fcff;border:1px solid rgba(57,231,255,.38);border-radius:28px;background:radial-gradient(circle at 50% 0,rgba(57,231,255,.14),transparent 38%),linear-gradient(155deg,#071a31,#090817 68%,#180b35);box-shadow:0 30px 90px rgba(0,0,0,.68),0 0 55px rgba(37,136,255,.14); }
    html.ls7-app-runtime .ls7-electric-update-logo { width:94px;height:94px;object-fit:contain;filter:drop-shadow(0 0 18px rgba(57,231,255,.56));animation:ls7EmblemFloat 3s ease-in-out infinite; }
    html.ls7-app-runtime .ls7-electric-update-kicker { margin:4px 0 8px;color:#66eaff;font:900 10px 'JetBrains Mono',monospace;letter-spacing:.17em; }
    html.ls7-app-runtime .ls7-electric-update-card h2 { margin:0 0 10px;font-size:26px; }
    html.ls7-app-runtime .ls7-electric-update-card p { margin:0 0 20px;color:#adc2d9;font-size:14px;line-height:1.55; }
    html.ls7-app-runtime .ls7-electric-update-actions { display:grid;grid-template-columns:1fr 1.25fr;gap:10px; }
    html.ls7-app-runtime .ls7-electric-update-actions button { min-height:49px; }
    html.ls7-app-runtime .ls7-electric-update-card small { display:block;margin-top:13px;color:#809bb8; }
    @keyframes ls7ProfileScan { from{background-position:180% 0}to{background-position:-180% 0} }
    @keyframes ls7EmblemFloat { 0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-6px) rotate(2deg)} }
    @keyframes ls7LivingOrbit { to{transform:rotate(360deg)} }
    @keyframes ls7SignalPulse { 50%{opacity:.4;transform:scale(.75)} }
    @media(max-width:700px) { html.ls7-app-runtime .ls7-electric-profile { border-radius:22px!important; }html.ls7-app-runtime .ls7-profile-emblem { width:56px;height:56px;top:116px;right:11px; }html.ls7-app-runtime .ls7-living-profile{padding:14px;border-radius:22px}html.ls7-app-runtime .ls7-living-grid{grid-template-columns:1fr}html.ls7-app-runtime .ls7-featured-video{min-height:230px}html.ls7-app-runtime .ls7-live-data{display:grid;grid-template-columns:1fr 1fr}html.ls7-app-runtime .ls7-live-data>div:first-child,html.ls7-app-runtime .ls7-live-data>p{grid-column:1/-1}html.ls7-app-runtime .ls7-style-picker{grid-template-columns:1fr}html.ls7-app-runtime .ls7-style-picker button{min-height:64px}html.ls7-app-runtime .ls7-living-head{align-items:flex-start}html.ls7-app-runtime .ls7-living-head-actions{flex-direction:column;align-items:flex-end}html.ls7-app-runtime .ls7-profile-customizer-overlay{padding-top:max(20px,calc(env(safe-area-inset-top) + 14px));padding-bottom:max(82px,calc(env(safe-area-inset-bottom) + 70px))}html.ls7-app-runtime .ls7-profile-customizer-box{max-height:calc(100dvh - max(122px,calc(env(safe-area-inset-top) + env(safe-area-inset-bottom) + 100px)));border-radius:22px}html.ls7-app-runtime .ls7-profile-customizer-box .modal-box-actions{display:grid;grid-template-columns:.8fr 1.2fr;gap:9px}html.ls7-app-runtime .ls7-profile-customizer-box .modal-box-actions button{min-height:50px} }
    @media(prefers-reduced-motion:reduce) { html.ls7-app-runtime .ls7-electric-profile::before,html.ls7-app-runtime .ls7-profile-emblem,html.ls7-app-runtime .ls7-electric-update-logo { animation:none!important; } }
  `;
  document.head.appendChild(style);
}
ensureLiveScroll7ElectricIdentity();

function ensureLiveScroll8Prototype() {
  if (!isLiveScroll8App() || document.getElementById("ls8WorldsStyles")) return;
  const style = document.createElement("style");
  style.id = "ls8WorldsStyles";
  style.textContent = `
    html.ls8-app-runtime{--ink:#07040b;--panel:#130b18;--panel-2:#1b1022;--gold:#68ffc5;--gold-dim:#32d99a;--green:#ff45ac;--text:#fff8fd;--text-dim:#c8b7c5;--border:#38213f;color-scheme:dark}
    html.ls8-app-runtime body{background:radial-gradient(circle at 8% -8%,rgba(98,255,196,.14),transparent 30%),radial-gradient(circle at 108% 20%,rgba(255,62,165,.18),transparent 34%),linear-gradient(150deg,#050208,#100713 55%,#050207)!important}
    html.ls8-app-runtime nav{border-color:rgba(98,255,196,.20)!important;background:rgba(8,3,12,.90)!important;box-shadow:0 14px 48px rgba(0,0,0,.44),0 0 42px rgba(255,62,165,.06)!important}
    html.ls8-app-runtime .nav-brand-scroll{color:#68ffc5!important;text-shadow:0 0 18px rgba(98,255,196,.34)}
    html.ls8-app-runtime .nav-brand b{color:#fff!important;background:linear-gradient(145deg,#ff3ea5,#753cff)!important;border-color:rgba(255,129,208,.52)!important;box-shadow:0 0 22px rgba(255,62,165,.30)!important}
    html.ls8-app-runtime .btn{color:#09050b!important;background:linear-gradient(125deg,#68ffc5,#42dfa8 46%,#ff58b5)!important;border-color:rgba(179,255,227,.45)!important;box-shadow:0 10px 30px rgba(98,255,196,.13)!important}
    html.ls8-app-runtime .btn-outline{color:#ffeafa!important;border-color:rgba(255,87,180,.27)!important;background:rgba(255,62,165,.045)!important}
    html.ls8-app-runtime .form-card,html.ls8-app-runtime .video-card,html.ls8-app-runtime .auth-box{border-color:rgba(255,96,188,.15)!important;background:linear-gradient(145deg,rgba(28,12,34,.96),rgba(9,5,14,.98))!important}
    html.ls8-app-runtime .nav-links button.active{color:#fff;background:linear-gradient(135deg,rgba(98,255,196,.11),rgba(255,62,165,.12))!important}
    html.ls8-app-runtime .nav-links button.active::after{background:linear-gradient(90deg,#68ffc5,#ff3ea5,#8a55ff)!important}
    html.ls8-app-runtime .ls-mobile-dock{border-color:rgba(98,255,196,.18)!important;background:rgba(9,4,13,.95)!important}
    html.ls8-app-runtime .ls-mobile-dock button.active{color:#72ffd0!important}
    html.ls8-app-runtime .ls7-dock-create-core{background:linear-gradient(145deg,#68ffc5,#ff45ac)!important;color:#08050a!important}
    .ls8-worlds-gate{position:fixed;inset:0;z-index:2147483600;display:grid;place-items:center;padding:20px;overflow:hidden;background:radial-gradient(circle at 20% 10%,rgba(98,255,196,.18),transparent 32%),radial-gradient(circle at 86% 82%,rgba(255,62,165,.22),transparent 36%),#050208;color:#fff;font-family:Inter,system-ui,sans-serif}
    .ls8-worlds-gate::before{content:"";position:absolute;width:70vmax;height:70vmax;border:1px solid rgba(98,255,196,.16);border-radius:50%;box-shadow:0 0 100px rgba(255,62,165,.10);animation:ls8WorldOrbit 16s linear infinite}.ls8-worlds-gate::after{content:"";position:absolute;inset:-70%;background:conic-gradient(transparent,rgba(98,255,196,.06),transparent 18%,rgba(255,62,165,.08),transparent 38%);animation:ls8WorldOrbit 22s linear infinite reverse}
    .ls8-gate-card{position:relative;z-index:2;width:min(470px,100%);padding:34px 25px 27px;border:1px solid rgba(255,113,199,.31);border-radius:32px;text-align:center;background:linear-gradient(155deg,rgba(29,12,36,.94),rgba(7,4,12,.97));box-shadow:0 35px 110px rgba(0,0,0,.70),0 0 60px rgba(255,62,165,.10);overflow:hidden}.ls8-gate-mark{width:94px;height:94px;margin:0 auto 18px;display:grid;place-items:center;border:1px solid rgba(98,255,196,.48);border-radius:50% 50% 44% 56%;background:conic-gradient(from 30deg,rgba(98,255,196,.19),rgba(255,62,165,.22),rgba(117,60,255,.24),rgba(98,255,196,.19));color:#fff;font:950 54px 'Space Grotesk',sans-serif;box-shadow:0 0 38px rgba(98,255,196,.17);animation:ls8MarkPulse 3s ease-in-out infinite}.ls8-gate-card small{color:#6effca;font:900 9px 'JetBrains Mono',monospace;letter-spacing:.21em}.ls8-gate-card h1{margin:9px 0 5px;font-size:clamp(34px,10vw,50px);letter-spacing:-.065em}.ls8-gate-card h1 span{color:#ff58b5}.ls8-gate-card p{margin:0 auto 22px;max-width:360px;color:#cdbdca;font-size:13px;line-height:1.55}.ls8-gate-card button{width:100%;min-height:54px;border:1px solid rgba(176,255,225,.42);border-radius:17px;background:linear-gradient(125deg,#68ffc5,#ff58b5);color:#09050b;font-weight:950;letter-spacing:.04em;cursor:pointer}.ls8-gate-card em{display:block;margin-top:13px;color:#806f82;font:800 8px 'JetBrains Mono',monospace;font-style:normal;letter-spacing:.1em}
    .ls8-worlds-gate.is-leaving{animation:ls8GateLeave .55s cubic-bezier(.4,0,.2,1) forwards}@keyframes ls8WorldOrbit{to{transform:rotate(360deg)}}@keyframes ls8MarkPulse{50%{transform:scale(1.06) rotate(3deg);box-shadow:0 0 55px rgba(255,62,165,.22)}}@keyframes ls8GateLeave{to{opacity:0;transform:scale(1.04);visibility:hidden}}
    @media(prefers-reduced-motion:reduce){.ls8-worlds-gate::before,.ls8-worlds-gate::after,.ls8-gate-mark{animation:none!important}}
  `;
  document.head.appendChild(style);
}

function enterLiveScroll8Worlds() {
  const gate = document.getElementById("ls8WorldsGate");
  try { sessionStorage.setItem("ls8_worlds_gate_seen", "1"); } catch (_) {}
  if (!gate) return;
  gate.classList.add("is-leaving");
  setTimeout(() => gate.remove(), 580);
}
window.enterLiveScroll8Worlds = enterLiveScroll8Worlds;

function showLiveScroll8WorldsGate() {
  if (!isLiveScroll8App() || document.getElementById("ls8WorldsGate")) return;
  try { if (sessionStorage.getItem("ls8_worlds_gate_seen") === "1") return; } catch (_) {}
  const gate = document.createElement("div");
  gate.id = "ls8WorldsGate";
  gate.className = "ls8-worlds-gate";
  gate.innerHTML = `<div class="ls8-gate-card"><div class="ls8-gate-mark">8</div><small>PROTOTIPO DE NUEVA GENERACIÓN</small><h1>LiveScroll <span>WORLDS</span></h1><p>Cada creador tiene un mundo. Entrá a la primera prueba privada de LiveScroll 8.</p><button onclick="enterLiveScroll8Worlds()">ENTRAR AL PRIMER MUNDO</button><em>VISTA PREVIA · NO ES UNA VERSIÓN PÚBLICA</em></div>`;
  document.body.appendChild(gate);
}

document.addEventListener("DOMContentLoaded", () => {
  applyLiveScrollRuntimeBranding();
}, { once:true });


document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("lsSeasonalSelectContrastFix")) return;
  const style = document.createElement("style");
  style.id = "lsSeasonalSelectContrastFix";
  style.textContent = `
    #seasonalThemeAdminSelect {
      color: var(--text) !important;
      background: var(--ink) !important;
    }

    #seasonalThemeAdminSelect option {
      color: #1d1f23 !important;
      background: #ffffff !important;
      font-weight: 700;
    }

    @media (prefers-color-scheme: dark) {
      #seasonalThemeAdminSelect option {
        color: #1d1f23 !important;
        background: #ffffff !important;
      }
    }
  `;
  document.head.appendChild(style);
});
