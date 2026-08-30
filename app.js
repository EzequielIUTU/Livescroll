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
  isAndroid7:/LiveScrollAndroid\/7(?:\.|\/|\s)/i.test(navigator.userAgent),
  isAndroid6:/LiveScrollAndroid\/6(?:\.|\/|\s)/i.test(navigator.userAgent),
  generation:/LiveScrollAndroid\/7(?:\.|\/|\s)/i.test(navigator.userAgent) ? 7 : 6
});

if (LIVESCROLL_RUNTIME.isAndroid6) document.documentElement.classList.add("ls6-app-runtime");

function isLiveScroll7App() {
  return LIVESCROLL_RUNTIME.isAndroid7 === true;
}
window.isLiveScroll7App = isLiveScroll7App;

function getLiveScrollClientOrigin() {
  if (LIVESCROLL_RUNTIME.isAndroid7) return "ls7";
  if (LIVESCROLL_RUNTIME.isAndroid6) return "ls6";
  return "web";
}

function renderClientOriginBadge(origin, compact = false) {
  const value = String(origin || "").toLowerCase();
  const labels = { ls6:"LS6", ls7:"LS7", web:"WEB" };
  if (!labels[value]) return "";
  const title = value === "ls7"
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
  if (!isLiveScroll7App()) return;
  document.documentElement.classList.add("ls7-app-runtime");
  document.querySelectorAll(".nav-brand").forEach(node => {
    node.innerHTML = '<span class="nav-brand-live">Live</span><span class="nav-brand-scroll">Scroll</span><b>7</b>';
    node.setAttribute("aria-label", "LiveScroll 7");
  });
  document.title = "LiveScroll 7 — La nueva generación";
}

function installLiveScroll7NativeFeel() {
  if (!isLiveScroll7App() || window.__ls7NativeFeelInstalled) return;
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

  const { data: authListenerData } = sb.auth.onAuthStateChange(async (event, session) => {
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
      if (currentUser && currentUser.id === session.user.id) return;
      currentUser = session.user;
      await loadProfile();
      await renderApp();
      finishLiveScroll7Boot({ authenticated:true });
    } else if (event === "SIGNED_OUT") {
      currentUser = null;
      currentProfile = null;
      clearAllWatchIntervals();
      renderLanding();
    }
  });

  // Damos un instante a Supabase para procesar el enlace de recuperación.
  await new Promise(resolve => setTimeout(resolve, 80));

  const { data: { session } } = await sb.auth.getSession();

  if (!lsRecoveryMode) {
    if (session) {
      currentUser = session.user;
      await loadProfile();
      await renderApp();
      finishLiveScroll7Boot({ authenticated:true });
      if (window.sharedVideoId) openSharedVideo(window.sharedVideoId);
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
    const seasonalKey = typeof getSeasonalThemeKey === "function"
      ? getSeasonalThemeKey()
      : "normal";

    const seasonal = typeof LS_SEASONAL_THEMES !== "undefined"
      ? (LS_SEASONAL_THEMES[seasonalKey] || LS_SEASONAL_THEMES.normal)
      : null;

    const accent = isLs7 ? "#58d8ff" : (seasonal?.accent || "var(--gold)");
    const seasonEmoji = isLs7 ? "7" : (seasonal?.emoji || "✦");
    const introKicker = isLs7 ? "LIVESCROLL 7 · ANDROID" : "LiveScroll";
    const introTitle = isLs7
      ? (username ? `Cargando tu mundo, @${escapeHtml(username)}` : "Cargando LiveScroll 7")
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
  const runtimeGeneration = isLiveScroll7App() ? 7 : 6;
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

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { errEl.textContent = error.message; return; }

  currentUser = data.user;
  await loadProfile();
  closeAuthModal();

  // Intro breve SOLO después de un inicio de sesión explícito.
  await showPostLoginIntro();

  renderApp();
  if (window.sharedVideoId) openSharedVideo(window.sharedVideoId);
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
  const [profileResult, statusResult, creatorResult, ls7CustomizationResult] = await Promise.all([
    sb.rpc("get_my_profile_data"),
    sb.rpc("get_my_status"),
    sb.rpc("get_my_creator_access"),
    isLiveScroll7App()
      ? sb.rpc("get_my_ls7_profile_customization")
      : Promise.resolve({ data:null, error:null })
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
                <div class="ls7-runtime-settings-head"><span>7</span><div><strong>Experiencia LiveScroll 7</strong><small>Entrada exclusiva de la aplicación Android</small></div></div>
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
                <div class="ls7-runtime-status-head"><span></span><strong>LiveScroll 7 · Desarrollo activo</strong></div>
                <p>Estás dentro de la primera etapa real de LiveScroll 7 para Android. La cuenta y el contenido siguen sincronizados mientras renovamos cada apartado.</p>
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

function cancelLiveScrollSettings() {
  lsSettingsDraft = null;
  closeManagedModal();
}

function applyLiveScrollSettingsDraft() {
  if (!lsSettingsDraft) return;

  const next = { ...lsSettingsDraft };
  saveLiveScrollSettings(next);
  applyLiveScrollSettings(next);
  lsSettingsDraft = null;
  closeManagedModal();

  showToast("Configuración aplicada ✓");

  // Fuerza actualización inmediata de la pantalla actual.
}

function resetLiveScrollSettings() {
  lsSettingsDraft = { ...LS_SETTINGS_DEFAULTS };
  refreshLiveScrollSettingsUI();
  showToast("Valores restablecidos. Tocá Aplicar cambios para guardar.");
}



function installLiveScrollModalAccessibilityBridge() {
  if (window.__lsModalAccessibilityBridgeInstalled) return;
  window.__lsModalAccessibilityBridgeInstalled = true;

  const root = document.getElementById("globalModalWrap");
  if (!root) return;

  const observer = new MutationObserver(() => {
    // Las reglas dependen de clases del body; solo garantizamos que estén vigentes
    // cuando aparece un cartel nuevo.
    applyLiveScrollSettings();
  });

  observer.observe(root, { childList:true, subtree:false });
}

document.addEventListener("DOMContentLoaded", () => {
  ensureLiveScrollAccessibilityStyles();
  installLiveScrollZoomLock();
  applyLiveScrollSettings();
  installLiveScrollModalAccessibilityBridge();
});




// ============================================================
// LIVESCROLL 5.8.4 · TUERQUITA SOLO PC
// En celular Configuración sigue únicamente dentro del menú ☰.
// ============================================================
(function installDesktopSettingsGearRule() {
  if (document.getElementById("lsPcSettingsGearStyle")) return;
  const style = document.createElement("style");
  style.id = "lsPcSettingsGearStyle";
  style.textContent = `
    .ls-pc-settings-gear { display:inline-block; }

    /* En celular:
       - Configuración queda dentro de ☰
       - Novedades queda dentro de ☰
       - evitamos duplicar iconos en la barra superior */
    @media (max-width: 768px) {
      .ls-pc-settings-gear,
      .nav-changelog-btn {
        display:none !important;
      }
    }
  `;
  document.head.appendChild(style);
})();

// ============================================================
// LIVESCROLL 5.8.4 · MODALES V1
// Protección contra cierres accidentales.
// ============================================================

function installLiveScrollLockedModalUX() {
  if (window.__lsLockedModalUXInstalled) return;
  window.__lsLockedModalUXInstalled = true;

  if (!document.getElementById("lsLockedModalStyles")) {
    const style = document.createElement("style");
    style.id = "lsLockedModalStyles";
    style.textContent = `
      @keyframes lsLockedModalHint {
        0%,100% { transform:translateY(0) scale(1); }
        45% { transform:translateY(-1px) scale(1.008); }
      }

      .ls-modal-locked.ls-modal-hint .modal-box,
      .ls-modal-locked.ls-modal-hint .auth-box,
      .ls-modal-locked.ls-modal-hint > div {
        animation:lsLockedModalHint .18s ease;
      }

      .ls-modal-locked {
        overscroll-behavior:contain;
      }

      @media(max-width:430px) {
        .ls-modal-locked .modal-box-footer[style*="grid-template-columns:1fr 1fr 1fr"] {
          grid-template-columns:1fr !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.addEventListener("click", event => {
    const overlay = event.target?.closest?.("[data-modal-locked='1']");
    if (!overlay || event.target !== overlay) return;

    // Tocar el fondo ya no cierra. Solo damos una respuesta visual mínima.
    overlay.classList.remove("ls-modal-hint");
    void overlay.offsetWidth;
    overlay.classList.add("ls-modal-hint");

    setTimeout(() => overlay.classList.remove("ls-modal-hint"), 220);
  }, true);

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    const overlay = document.querySelector(
      "#globalModalWrap [data-modal-locked='1']"
    );

    if (!overlay) return;

    // ESC tampoco descarta silenciosamente una edición importante.
    event.preventDefault();
    overlay.classList.remove("ls-modal-hint");
    void overlay.offsetWidth;
    overlay.classList.add("ls-modal-hint");
    setTimeout(() => overlay.classList.remove("ls-modal-hint"), 220);
  }, true);
}

document.addEventListener("DOMContentLoaded", installLiveScrollLockedModalUX);


// ============================================================
// APP SHELL
// ============================================================
function getLiveScroll6ModeMenuMarkup() {
  const mode = window.__liveScrollExperienceMode || "nova";
  const isLegacy = mode === "legacy";
  const generation = isLiveScroll7App() ? 7 : 6;
  const modeName = isLiveScroll7App()
    ? (isLegacy ? "Fluido" : "Inmersivo")
    : (isLegacy ? "Legacy" : "Nova");
  return `
    <button type="button" class="ls-menu-mode-button ${isLegacy ? "is-legacy" : "is-nova"}"
      onclick="openLiveScrollModeInfo()" aria-label="Experiencia LiveScroll ${generation} ${modeName}">
      <span>${isLegacy ? "⚡" : "✦"}</span>
      <b>LiveScroll ${generation} ${modeName}</b>
    </button>`;
}

function toggleMobileMenu() {
  if (!currentProfile) return;
  const existing = document.getElementById("mobileMenuPanel");
  if (existing) { closeMobileMenu(); return; }

  const overlay = document.createElement("div");
  overlay.className = "mobile-menu-overlay";
  overlay.id = "mobileMenuOverlay";
  overlay.onclick = closeMobileMenu;

  const panel = document.createElement("div");
  panel.className = `mobile-menu-panel${isLiveScroll7App() ? " ls7-mobile-menu-panel" : ""}`;
  panel.id = "mobileMenuPanel";
  const activeTab = currentTab || "feed";
  panel.innerHTML = `
    <div class="ls-mobile-menu-head">
      <div><strong>LiveScroll <em>${isLiveScroll7App() ? "7" : "6"}</em></strong><small>${isLiveScroll7App() ? "Centro de control" : "Explorá la aplicación"}</small></div>
      <button class="ls-mobile-menu-close" onclick="closeMobileMenu()" aria-label="Cerrar">✕</button>
    </div>
    ${isLiveScroll7App() ? `<div class="ls7-menu-runtime-line"><i></i><span>SESIÓN ACTIVA</span><b>${window.__liveScrollExperienceMode === "legacy" ? "FLUIDO" : "INMERSIVO"} 7</b></div>` : ""}
    <div class="ls-mobile-menu-scroll">
      <div class="ls-mobile-menu-label">Principal</div>
      <button class="${activeTab === 'feed' ? 'active' : ''}" onclick="switchTab('feed'); closeMobileMenu();"><span>▶️</span><b>Mirar</b></button>
      <button class="${activeTab === 'foryou' ? 'active' : ''}" onclick="switchTab('foryou'); closeMobileMenu();"><span>✨</span><b>Para Ti</b></button>
      <button class="${activeTab === 'upload' ? 'active' : ''}" onclick="switchTab('upload'); closeMobileMenu();"><span>＋</span><b>Subir video</b></button>
      <button class="${activeTab === 'profile' ? 'active' : ''}" onclick="switchTab('profile'); closeMobileMenu();"><span>👤</span><b>Mi Perfil</b></button>
      <button class="${activeTab === 'users' ? 'active' : ''}" onclick="switchTab('users'); closeMobileMenu();"><span>👥</span><b>Usuarios</b></button>
      <button class="${activeTab === 'directos' ? 'active' : ''}" onclick="switchTab('directos'); closeMobileMenu();"><span>🔴</span><b>Directos</b></button>
      <div class="ls-mobile-menu-label">Mi cuenta</div>
      ${!window.__navWalletLocked ? `<button class="${activeTab === 'wallet' ? 'active' : ''}" onclick="switchTab('wallet'); closeMobileMenu();"><span>💰</span><b>Billetera</b></button>` : ""}
      <button class="${activeTab === 'store' ? 'active' : ''}" onclick="switchTab('store'); closeMobileMenu();"><span>🛍️</span><b>Tienda</b></button>
      <button class="${activeTab === 'ranking' ? 'active' : ''}" onclick="switchTab('ranking'); closeMobileMenu();"><span>🏆</span><b>Ranking</b></button>
      <div class="ls-mobile-menu-label">Ayuda y ajustes</div>
      <button onclick="openChangelogHistory(); closeMobileMenu();"><span>📢</span><b>Novedades</b></button>
      <button onclick="showTutorialModal(); closeMobileMenu();"><span>❓</span><b>Cómo funciona</b></button>
      <button onclick="openLiveScrollSettings(); closeMobileMenu();"><span>⚙️</span><b>Configuración</b></button>
      ${currentProfile.is_admin ? `<button class="${activeTab === 'admin' ? 'active' : ''}" onclick="switchTab('admin'); closeMobileMenu();"><span>🛠</span><b>Admin</b></button>` : ""}
      <div class="ls-mobile-menu-exit">
        ${getLiveScroll6ModeMenuMarkup()}
        <button onclick="handleLogout(); closeMobileMenu();"><span>↪</span><b>Salir</b></button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  document.body.appendChild(panel);
}

function closeMobileMenu() {
  document.getElementById("mobileMenuOverlay")?.remove();
  document.getElementById("mobileMenuPanel")?.remove();
}

// ============================================================
// 6.0.8 · EL PULSO — ADELANTO DE LIVESCROLL 7
// ============================================================
function openLiveScroll7Teaser(options = {}) {
  const isReplay = options.replay === true;
  if (document.getElementById("ls7TeaserOverlay")) return;
  const overlay = document.createElement("div");
  overlay.id = "ls7TeaserOverlay";
  overlay.className = "ls7-teaser-overlay";
  overlay.innerHTML = `
    <section class="ls7-teaser-shell" role="dialog" aria-modal="true" aria-label="Adelanto de LiveScroll 7">
      <header>
        <div><small>EL FUTURO EMPIEZA ACÁ</small><strong>LiveScroll <em>7</em></strong></div>
      </header>
      <div class="ls7-native-stage" id="ls7NativeStage" aria-label="Animación interactiva de LiveScroll 7">
        <div class="ls7-native-grid"></div>
        <div class="ls7-native-beam beam-a"></div><div class="ls7-native-beam beam-b"></div>
        <div class="ls7-native-copy copy-a">TODO LO QUE CONOCÍAS...</div>
        <div class="ls7-native-copy copy-b"><span>ESTÁ A PUNTO</span><b>DE EVOLUCIONAR.</b></div>
        <div class="ls7-native-seven" aria-hidden="true">
          <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
        </div>
        <div class="ls7-seven-trail" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="ls7-android-word" aria-label="Android"><span>A</span><span>N</span><span>D</span><span>R</span><span>O</span><span>I</span><span>D</span></div>
        <div class="ls7-native-name"><span>Live</span><b>Scroll</b><em>7</em></div>
        <div class="ls7-native-tag">LA NUEVA EVOLUCIÓN</div>
        <div class="ls7-native-spark s1"></div><div class="ls7-native-spark s2"></div><div class="ls7-native-spark s3"></div>
        <button type="button" class="ls7-native-start" id="ls7NativeStart"><span>◈</span><b>TOCÁ PARA INICIAR EL PULSO</b></button>
        <audio id="ls7NativeAudio" preload="auto"><source src="ls7-pulse-theme.mp3" type="audio/mpeg"></audio>
      </div>
      <div class="ls7-real-hold" id="ls7RealHold" aria-hidden="true">
        <p>EL FUTURO ESTÁ EN TUS MANOS</p>
        <button type="button" id="ls7HoldButton"><i></i><b>MANTENÉ<br>EL PULSO</b></button>
        <small>Mantené presionado hasta completar el círculo</small>
      </div>
      <div class="ls7-real-reveal" id="ls7RealReveal" aria-hidden="true">
        <span>PRÓXIMAMENTE</span><b>25 DE OCTUBRE DE 2026</b><small>LiveScroll 7</small>
      </div>
    </section>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("is-visible"));
  const audio = overlay.querySelector("#ls7NativeAudio");
  const stage = overlay.querySelector("#ls7NativeStage");
  const startButton = overlay.querySelector("#ls7NativeStart");
  const holdArea = overlay.querySelector("#ls7RealHold");
  const holdButton = overlay.querySelector("#ls7HoldButton");
  let holdTimer = null;
  let holdStartedAt = 0;
  let finished = false;
  let midpointVibrated = false;

  const revealHold = () => {
    if (finished || holdArea.classList.contains("is-visible")) return;
    holdArea.classList.add("is-visible");
    holdArea.setAttribute("aria-hidden", "false");
  };
  stage.classList.add("is-waiting");
  startButton.addEventListener("click", () => {
    if (stage.classList.contains("is-started")) return;
    stage.classList.remove("is-waiting");
    stage.classList.add("is-started");
    audio?.play().catch(() => {});
    setTimeout(revealHold, 15000);
  });

  const cancelHold = () => {
    if (finished) return;
    clearTimeout(holdTimer);
    holdTimer = null;
    holdButton.classList.remove("is-holding");
    holdButton.style.setProperty("--ls7-hold", "0%");
    midpointVibrated = false;
  };
  const completeHold = () => {
    if (finished) return;
    finished = true;
    clearTimeout(holdTimer);
    holdButton.classList.add("is-complete");
    holdButton.style.setProperty("--ls7-hold", "100%");
    holdArea.classList.remove("is-visible");
    const reveal = overlay.querySelector("#ls7RealReveal");
    reveal.classList.add("is-visible");
    reveal.setAttribute("aria-hidden", "false");
    if (!isReplay) {
      localStorage.setItem(`livescroll_ls7_pulse_seen_${currentUser.id}`, "1");
      Promise.resolve(sb.rpc("mark_my_ls7_pulse_seen")).catch(() => {});
    }
    setTimeout(() => {
      overlay.classList.remove("is-visible");
      setTimeout(() => {
        overlay.remove();
        if (!isReplay) {
          window.__lsStartupOptionalModalShown = false;
          checkPendingContent();
        }
      }, 220);
    }, 3200);
  };
  const startHold = event => {
    if (finished || !holdArea.classList.contains("is-visible")) return;
    event.preventDefault();
    holdStartedAt = performance.now();
    holdButton.classList.add("is-holding");
    const animate = now => {
      if (!holdTimer || finished) return;
      const progress = Math.min(100, ((now - holdStartedAt) / 1800) * 100);
      holdButton.style.setProperty("--ls7-hold", `${progress}%`);
      if (progress >= 50 && !midpointVibrated) {
        midpointVibrated = true;
        try { navigator.vibrate?.(24); } catch (_) {}
      }
      if (progress < 100) requestAnimationFrame(animate);
    };
    holdTimer = setTimeout(completeHold, 1800);
    requestAnimationFrame(animate);
  };
  ["pointerdown","touchstart"].forEach(name => holdButton.addEventListener(name, startHold, { passive:false }));
  ["pointerup","pointercancel","pointerleave","touchend","touchcancel"].forEach(name => holdButton.addEventListener(name, cancelHold));
}

function replayLiveScroll7Pulse() {
  document.getElementById("globalModalWrap").innerHTML = "";
  setTimeout(() => openLiveScroll7Teaser({ replay:true }), 120);
}

async function replayLiveScroll7LoginWelcome() {
  document.getElementById("globalModalWrap").innerHTML = "";
  await showPostLoginIntro();
}
window.replayLiveScroll7LoginWelcome = replayLiveScroll7LoginWelcome;

function showLiveScroll7AppNotice() {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked ls7-runtime-notice-overlay" data-modal-locked="1" style="z-index:310;">
      <section class="modal-box ls7-runtime-notice" role="dialog" aria-modal="true" aria-label="Primera etapa de LiveScroll 7">
        <div class="modal-box-body">
          <div class="ls7-runtime-notice-mark">7</div>
          <small>PRIMERA ETAPA · ANDROID</small>
          <h2>Bienvenido a la evolución</h2>
          <p>LiveScroll 7 ya comenzó. Esta primera versión conserva tus cuentas, videos y funciones esenciales mientras construimos una experiencia Android cada vez más nativa.</p>
          <div class="ls7-runtime-roadmap"><span>AHORA</span><b>Nueva identidad y entrada</b><span>PRÓXIMO</span><b>Interfaz y rendimiento nativos</b></div>
          <blockquote>Tu contenido continúa.<br><strong>La experiencia evoluciona.</strong></blockquote>
        </div>
        <div class="modal-box-footer"><button class="btn" style="width:100%;min-height:48px;" onclick="document.getElementById('globalModalWrap').innerHTML=''">Entrar a LiveScroll 7</button></div>
      </section>
    </div>`;
}
window.showLiveScroll7AppNotice = showLiveScroll7AppNotice;

// ============================================================
// 6.1.0 · EL PUENTE — CONTINUIDAD DE LIVESCROLL 6
// ============================================================
function showLiveScroll6BridgeNotice(options = {}) {
  const manual = options.manual === true;
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="modal-overlay ls-bridge-overlay" id="lsBridgeNoticeOverlay" style="z-index:170;">
      <section class="modal-box ls-bridge-box" role="dialog" aria-modal="true" aria-label="LiveScroll 6 continúa activo">
        <div class="ls-bridge-mark"><span>6</span><i></i><b>7</b></div>
        <div class="modal-box-body">
          <small class="ls-bridge-kicker">6.1.0 · EL PUENTE</small>
          <h2>LiveScroll 6 sigue más vivo que nunca</h2>
          <p>Las nuevas versiones con funciones quedarán pausadas temporalmente mientras concentramos nuestro trabajo en construir LiveScroll 7.</p>
          <p><strong>LiveScroll 6 continuará funcionando con normalidad.</strong> Tus cuentas, videos, perfiles, Directos, puntos y contenido permanecerán disponibles.</p>
          <p>Durante este período seguiremos realizando correcciones urgentes, mantenimiento y mejoras de seguridad cuando sean necesarias.</p>
          <blockquote>Esto no es una despedida.<br><b>Es el puente hacia la próxima evolución.</b></blockquote>
          <div class="ls-bridge-date"><span>LiveScroll 7</span><b>25 DE OCTUBRE DE 2026</b></div>
          <div class="ls-bridge-status"><i></i><span>LiveScroll 6 continúa activo y con soporte</span></div>
        </div>
        <div class="modal-box-footer ls-bridge-actions">
          <button class="btn-outline" onclick="handleLiveScroll6BridgePulse(${manual ? "true" : "false"})">◈ Volver a ver El Pulso</button>
          <button class="btn" onclick="handleAcceptLiveScroll6Bridge(${manual ? "true" : "false"})">Entendido</button>
        </div>
      </section>
    </div>`;
}

async function markLiveScroll6BridgeSeen() {
  if (!currentUser?.id) return;
  localStorage.setItem(`livescroll_bridge_610_seen_${currentUser.id}`, "1");
  await sb.rpc("mark_my_bridge_notice_seen");
  const shownVersion = Number(window.__lsBridgeShownVersion || 0);
  if (shownVersion > 0) {
    localStorage.setItem(`livescroll_changelog_seen_${currentUser.id}`, String(shownVersion));
    await sb.rpc("set_my_changelog_seen_version", { p_version:shownVersion });
  }
  await sb.rpc("acknowledge_content", { p_user_id:currentUser.id, p_content_key:"changelog" });
}

async function handleAcceptLiveScroll6Bridge(manual = false) {
  if (!manual) await markLiveScroll6BridgeSeen();
  document.getElementById("globalModalWrap").innerHTML = "";
  if (!manual) {
    window.__lsStartupOptionalModalShown = false;
    setTimeout(() => checkPendingContent(), 350);
  }
}

async function handleLiveScroll6BridgePulse(manual = false) {
  if (!manual) await markLiveScroll6BridgeSeen();
  document.getElementById("globalModalWrap").innerHTML = "";
  setTimeout(() => openLiveScroll7Teaser({ replay:true }), 140);
}

function closeLiveScroll7Teaser() {
  const overlay = document.getElementById("ls7TeaserOverlay");
  if (!overlay) return;
  const audio = overlay.querySelector("audio");
  if (audio) audio.pause();
  overlay.classList.remove("is-visible");
  setTimeout(() => overlay.remove(), 180);
}

// ============================================================
// 6.0.4v · BOTÓN ATRÁS NATIVO
// Android consulta esta función antes de cerrar la Activity.
// ============================================================
function handleLiveScrollAndroidBack() {
  const portal = document.getElementById("ls6LaunchPortal");
  const intro = document.getElementById("introOverlay");
  if (portal || intro) return "handled";

  if (document.getElementById("ls7TeaserOverlay")) {
    closeLiveScroll7Teaser();
    return "handled";
  }

  if (document.getElementById("lsTutorialV3Layer")) {
    showToast("Completá el recorrido para continuar");
    return "handled";
  }

  if (document.getElementById("mobileMenuPanel") || document.getElementById("mobileMenuOverlay")) {
    closeMobileMenu();
    return "handled";
  }

  const notifPanel = document.getElementById("notifPanel");
  if (notifPanel) {
    notifPanel.remove();
    return "handled";
  }

  const modalWrap = document.getElementById("globalModalWrap");
  if (modalWrap && modalWrap.innerHTML.trim()) {
    const lockedModal = modalWrap.querySelector("[data-modal-locked='1'], .ls-modal-locked");
    if (lockedModal) {
      showToast("Completá esta pantalla para continuar");
      return "handled";
    }
    modalWrap.innerHTML = "";
    return "handled";
  }

  if (currentTab && currentTab !== "feed") {
    const target = previousTabForAndroidBack && previousTabForAndroidBack !== currentTab
      ? previousTabForAndroidBack
      : "feed";
    suppressAndroidTabHistory = true;
    switchTab(target);
    suppressAndroidTabHistory = false;
    previousTabForAndroidBack = "feed";
    return "handled";
  }

  return "exit";
}

window.handleLiveScrollAndroidBack = handleLiveScrollAndroidBack;

// ============================================================
// 6.0.2v · ANDROID PERMISSION CONTEXT
// Explica el uso antes de abrir cámara o selector de archivos.
// En la web normal abre el selector directamente.
// ============================================================
function isLiveScrollAndroidContainer() {
  const preview = new URLSearchParams(window.location.search).get("androidPreview") === "1";
  return preview || !!window.LiveScrollAndroid || /LiveScrollAndroid/i.test(navigator.userAgent || "");
}

function closeLiveScrollAndroidPermissionInfo() {
  document.getElementById("lsAndroidPermissionInfo")?.remove();
}

function triggerLiveScrollMediaInput(inputId, source) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (source === "camera") input.setAttribute("capture", "environment");
  else input.removeAttribute("capture");
  input.click();
}

function continueLiveScrollAndroidAccess(kind, inputId, source) {
  try {
    localStorage.setItem(`livescroll-android-permission-info-${kind}-v1`, "1");
    window.LiveScrollAndroid?.notePermissionPurpose?.(kind);
  } catch (_) {}
  closeLiveScrollAndroidPermissionInfo();
  triggerLiveScrollMediaInput(inputId, source);
}

function openLiveScrollAndroidMedia(kind, inputId, purpose, source = "files") {
  if (!isLiveScrollAndroidContainer()) {
    triggerLiveScrollMediaInput(inputId, source);
    return;
  }

  let explained = false;
  try { explained = localStorage.getItem(`livescroll-android-permission-info-${kind}-v1`) === "1"; } catch (_) {}
  if (explained) {
    triggerLiveScrollMediaInput(inputId, source);
    return;
  }

  closeLiveScrollAndroidPermissionInfo();
  const overlay = document.createElement("div");
  overlay.id = "lsAndroidPermissionInfo";
  overlay.className = "ls-android-permission-overlay";
  const isCamera = kind === "camera";
  overlay.innerHTML = `
    <div class="ls-android-permission-card" role="dialog" aria-modal="true" aria-label="Permiso de ${isCamera ? "cámara" : "archivos"}">
      <div class="ls-android-permission-icon">${isCamera ? "📷" : "📁"}</div>
      <div class="ls-android-permission-kicker">LIVESCROLL 6 · PERMISO EXPLICADO</div>
      <h2>${isCamera ? "Acceso a la cámara" : "Acceso a tus archivos"}</h2>
      <p>${isCamera
        ? `LiveScroll necesita la cámara solamente para ${escapeHtml(purpose)}. No se utilizará en segundo plano ni se grabará sin que lo decidas.`
        : `LiveScroll abrirá el selector de Android para ${escapeHtml(purpose)}. Solo podrá usar el archivo que elijas; no revisará el resto de tu almacenamiento.`}</p>
      <div class="ls-android-permission-note">${isCamera
        ? "Si no lo permitís, podrás seguir usando LiveScroll y elegir una imagen desde tus archivos."
        : "Si cancelás, no se subirá nada y podrás continuar usando todas las demás funciones."}</div>
      <div class="ls-android-permission-actions">
        <button class="btn-outline" onclick="closeLiveScrollAndroidPermissionInfo()">Ahora no</button>
        <button class="btn" onclick="continueLiveScrollAndroidAccess('${kind}','${inputId}','${source}')">Continuar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

function ensureNavigationEvolution597() {
  document.body.classList.add("ls-navigation-ready");
  let dock = document.getElementById("lsMobileDock");
  if (!dock) {
    dock = document.createElement("div");
    dock.id = "lsMobileDock";
    dock.className = "ls-mobile-dock";
    dock.setAttribute("aria-label", "Navegación principal");
    dock.innerHTML = isLiveScroll7App() ? `
      <button data-tab="feed" onclick="switchTab('feed')" aria-label="Mirar"><span class="ls7-dock-icon"><svg viewBox="0 0 24 24"><path d="M4 5.5h16v13H4zM10 9l5 3-5 3z"/></svg></span><small>Mirar</small></button>
      <button data-tab="foryou" onclick="switchTab('foryou')" aria-label="Para Ti"><span class="ls7-dock-icon"><svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg></span><small>Para Ti</small></button>
      <button data-tab="upload" class="ls-dock-create" onclick="switchTab('upload')" aria-label="Subir video"><span class="ls7-dock-create-core"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span><small>Crear</small></button>
      <button data-tab="profile" onclick="switchTab('profile')" aria-label="Perfil"><span class="ls7-dock-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6"/></svg></span><small>Perfil</small></button>
      <button data-tab="more" onclick="toggleMobileMenu()" aria-label="Más opciones"><span class="ls7-dock-icon"><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg></span><small>Más</small></button>` : `
      <button data-tab="feed" onclick="switchTab('feed')"><span>▶</span><small>Mirar</small></button>
      <button data-tab="foryou" onclick="switchTab('foryou')"><span>✦</span><small>Para Ti</small></button>
      <button data-tab="upload" class="ls-dock-create" onclick="switchTab('upload')"><span>＋</span><small>Subir</small></button>
      <button data-tab="profile" onclick="switchTab('profile')"><span>👤</span><small>Perfil</small></button>
      <button data-tab="more" onclick="toggleMobileMenu()"><span>☰</span><small>Más</small></button>`;
    document.body.appendChild(dock);
  }
  updateNavigationEvolution597(currentTab || "feed");
}

function updateNavigationEvolution597(tab) {
  document.querySelectorAll("#navLinks button").forEach(button => {
    const active = button.id === `tab-${tab}`;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });

  const primaryTabs = ["feed", "foryou", "upload", "profile"];
  document.querySelectorAll("#lsMobileDock button[data-tab]").forEach(button => {
    const buttonTab = button.dataset.tab;
    const active = buttonTab === tab || (buttonTab === "more" && !primaryTabs.includes(tab));
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}


// ============================================================
// COMPATIBILIDAD LEGACY — Android/celulares de recursos limitados
// No cambia la experiencia normal: solo activa ajustes livianos cuando
// el navegador/dispositivo parece antiguo o muy limitado.
// ============================================================
function detectLiveScrollExperience() {
  if (isLiveScroll7App()) {
    try {
      const preference = localStorage.getItem("livescroll7-experience-preference") || "automatic";
      if (preference === "immersive") return "nova";
      if (preference === "fluid") return "legacy";
    } catch (_) {}
  }

  let legacy = false;

  try {
    const ua = navigator.userAgent || "";
    const androidMatch = ua.match(/Android\s([0-9]+)/i);
    const androidMajor = androidMatch ? parseInt(androidMatch[1], 10) : null;
    const chromeMatch = ua.match(/(?:Chrome|CriOS)\/([0-9]+)/i);
    const chromeMajor = chromeMatch ? parseInt(chromeMatch[1], 10) : null;
    const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 2;
    const lowCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
    const narrowOldAndroid = androidMajor !== null && androidMajor <= 8 && window.innerWidth <= 420;

    legacy =
      (androidMajor !== null && androidMajor <= 7) ||
      (chromeMajor !== null && chromeMajor < 80) ||
      lowMemory ||
      (narrowOldAndroid && lowCpu);
  } catch (_) {
    legacy = false;
  }

  return legacy ? "legacy" : "nova";
}


function closeLiveScrollModeInfo() {
  document.getElementById("lsModeInfoOverlay")?.remove();
}

function openLiveScrollModeInfo() {
  const mode = window.__liveScrollExperienceMode || "nova";
  const generation = isLiveScroll7App() ? 7 : 6;
  closeLiveScrollModeInfo();

  const overlay = document.createElement("div");
  overlay.id = "lsModeInfoOverlay";
  overlay.className = "ls-mode-overlay";
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeLiveScrollModeInfo();
  });

  const isLegacy = mode === "legacy";
  const isSeven = isLiveScroll7App();
  const modeName = isSeven ? (isLegacy ? "Fluido" : "Inmersivo") : (isLegacy ? "Legacy" : "Nova");
  let preference = "automatic";
  try { preference = localStorage.getItem("livescroll7-experience-preference") || "automatic"; } catch (_) {}

  overlay.innerHTML = `
    <div class="ls-mode-panel" role="dialog" aria-modal="true" aria-label="Modo de experiencia LiveScroll">
      <div class="ls-mode-handle"></div>

      <div class="ls-mode-head">
        <div class="ls-mode-icon">${isLegacy ? "⚡" : "✨"}</div>
        <div class="ls-mode-title">
          <strong>LiveScroll ${generation} ${modeName}</strong>
          <span>${isLegacy ? "Máxima fluidez y estabilidad" : "Experiencia visual completa"}</span>
        </div>
      </div>

      <div class="ls-mode-current">
        <strong>Este dispositivo está usando LiveScroll ${generation} ${modeName}.</strong><br>
        ${isSeven ? "Podés dejar que LiveScroll decida o elegir tu experiencia visual." : "LiveScroll elige automáticamente el modo que mejor se adapta al dispositivo."}
      </div>

      ${isSeven ? `
        <div class="ls-mode-selector" role="group" aria-label="Elegir experiencia visual">
          <button type="button" class="${preference === "automatic" ? "active" : ""}" onclick="setLiveScrollExperiencePreference('automatic')"><b>Automático</b><span>Se adapta al celular</span></button>
          <button type="button" class="${preference === "immersive" ? "active" : ""}" onclick="setLiveScrollExperiencePreference('immersive')"><b>Inmersivo</b><span>Todos los efectos</span></button>
          <button type="button" class="${preference === "fluid" ? "active" : ""}" onclick="setLiveScrollExperiencePreference('fluid')"><b>Fluido</b><span>Prioriza estabilidad</span></button>
        </div>
      ` : ""}

      ${isLegacy ? `
        <div class="ls-mode-feature">
          <div class="ico">⚡</div>
          <div><strong>Menos carga visual</strong><span>Reduce animaciones, desenfoques y efectos pesados.</span></div>
        </div>
        <div class="ls-mode-feature">
          <div class="ico">📱</div>
          <div><strong>Mejor compatibilidad</strong><span>Está pensado para celulares antiguos o con recursos limitados.</span></div>
        </div>
        <div class="ls-mode-feature">
          <div class="ico">❤️</div>
          <div><strong>Mismo LiveScroll</strong><span>Tu cuenta, contenido, puntos y funciones siguen siendo los mismos.</span></div>
        </div>
      ` : `
        <div class="ls-mode-feature">
          <div class="ico">✨</div>
          <div><strong>Experiencia visual completa</strong><span>Animaciones, efectos y detalles modernos activos.</span></div>
        </div>
        <div class="ls-mode-feature">
          <div class="ico">🚀</div>
          <div><strong>Interfaz avanzada</strong><span>LiveScroll aprovecha las capacidades del dispositivo para ofrecer la experiencia completa.</span></div>
        </div>
        <div class="ls-mode-feature">
          <div class="ico">🔄</div>
          <div><strong>Adaptación automática</strong><span>Si LiveScroll detecta un dispositivo limitado, puede activar el modo Fluido automáticamente.</span></div>
        </div>
      `}

      <div class="ls-mode-note">
        No necesitás configurar nada. El modo se selecciona automáticamente para priorizar una buena experiencia.
      </div>

      <button type="button" class="ls-mode-close">Entendido</button>
    </div>
  `;

  overlay.querySelector(".ls-mode-close")?.addEventListener("click", closeLiveScrollModeInfo);
  document.body.appendChild(overlay);
}

function setLiveScrollExperiencePreference(preference) {
  if (!isLiveScroll7App() || !["automatic", "immersive", "fluid"].includes(preference)) return;
  try { localStorage.setItem("livescroll7-experience-preference", preference); } catch (_) {}

  const mode = detectLiveScrollExperience();
  window.__liveScrollExperienceMode = mode;
  window.__liveScrollLegacyMode = mode === "legacy";
  document.documentElement.classList.toggle("ls-legacy", mode === "legacy");
  document.documentElement.classList.toggle("ls-nova", mode === "nova");
  document.documentElement.classList.toggle("ls7-fluid", mode === "legacy");
  document.documentElement.classList.toggle("ls7-immersive", mode === "nova");

  closeLiveScrollModeInfo();
  closeMobileMenu();
  applySeasonalTheme();
  showToast(`Experiencia ${mode === "legacy" ? "Fluido" : "Inmersivo"} activada`);
}

function initLiveScrollExperienceMode() {
  const mode = detectLiveScrollExperience();
  window.__liveScrollExperienceMode = mode;
  window.__liveScrollLegacyMode = mode === "legacy";

  document.documentElement.classList.toggle("ls-legacy", mode === "legacy");
  document.documentElement.classList.toggle("ls-nova", mode === "nova");
  document.documentElement.classList.toggle("ls7-fluid", isLiveScroll7App() && mode === "legacy");
  document.documentElement.classList.toggle("ls7-immersive", isLiveScroll7App() && mode === "nova");

  if (!document.getElementById("lsExperienceStyles")) {
    const style = document.createElement("style");
    style.id = "lsExperienceStyles";
    style.textContent = `
      .ls-experience-badge {
        position:fixed;
        right:12px;
        bottom:max(12px, env(safe-area-inset-bottom));
        z-index:190;
        padding:7px 10px;
        border-radius:999px;
        border:1px solid var(--border);
        background:rgba(13,16,20,.88);
        color:var(--text-dim);
        font-size:10px;
        font-weight:700;
        letter-spacing:.2px;
        box-shadow:0 8px 24px rgba(0,0,0,.28);
        pointer-events:auto;
        cursor:pointer;
        user-select:none;
        touch-action:manipulation;
      }

      .ls-experience-badge:active {
        transform:scale(.96);
      }

      @media (max-width:700px) {
        .ls-experience-badge {
          bottom:max(12px, env(safe-area-inset-bottom)) !important;
          right:10px !important;
          z-index:340 !important;
        }
      }

      .ls-mode-overlay {
        position:fixed;
        inset:0;
        z-index:520;
        background:rgba(0,0,0,.72);
        display:flex;
        align-items:flex-end;
        justify-content:center;
        padding:12px;
        padding-bottom:max(12px, env(safe-area-inset-bottom));
      }

      .ls-mode-panel {
        width:min(460px, 100%);
        box-sizing:border-box;
        background:var(--panel);
        border:1px solid var(--border);
        border-radius:22px;
        padding:16px;
        color:var(--text);
        box-shadow:0 -18px 50px rgba(0,0,0,.48);
      }

      .ls-mode-handle {
        width:42px;
        height:4px;
        border-radius:10px;
        background:rgba(255,255,255,.2);
        margin:0 auto 14px;
      }

      .ls-mode-head {
        display:flex;
        gap:12px;
        align-items:center;
        margin-bottom:14px;
      }

      .ls-mode-icon {
        width:48px;
        height:48px;
        border-radius:14px;
        background:var(--panel-2);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:25px;
        flex:0 0 48px;
      }

      .ls-mode-title {
        min-width:0;
      }

      .ls-mode-title strong {
        display:block;
        font-size:17px;
        color:var(--gold);
      }

      .ls-nova .ls-mode-title strong {
        color:#ffe88a;
        animation:ls601NovaNameGlow 2.4s ease-in-out infinite;
      }

      .ls-legacy .ls-mode-title strong {
        color:#d9dde2;
        text-shadow:none;
      }

      .ls-mode-title span {
        display:block;
        margin-top:2px;
        font-size:11px;
        color:var(--text-dim);
      }

      .ls-mode-current {
        border:1px solid var(--gold-dim);
        background:rgba(255,255,255,.025);
        border-radius:14px;
        padding:12px;
        margin-bottom:12px;
        font-size:12px;
        line-height:1.5;
      }

      .ls-mode-selector {
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:7px;
        margin:0 0 12px;
      }

      .ls-mode-selector button {
        min-width:0;
        min-height:62px;
        padding:9px 7px;
        border:1px solid var(--border);
        border-radius:13px;
        background:var(--panel-2);
        color:var(--text);
        font-family:inherit;
        cursor:pointer;
      }

      .ls-mode-selector button.active {
        border-color:rgba(57,231,255,.65);
        background:linear-gradient(145deg,rgba(57,231,255,.14),rgba(138,85,255,.16));
        box-shadow:0 0 20px rgba(57,231,255,.10),inset 0 1px 0 rgba(255,255,255,.08);
      }

      .ls-mode-selector b,.ls-mode-selector span { display:block; }
      .ls-mode-selector b { font-size:11px; }
      .ls-mode-selector span { margin-top:4px;color:var(--text-dim);font-size:8px;line-height:1.25; }

      .ls-mode-feature {
        display:flex;
        gap:10px;
        align-items:flex-start;
        padding:9px 4px;
        font-size:12px;
        line-height:1.4;
      }

      .ls-mode-feature .ico {
        width:24px;
        flex:0 0 24px;
        text-align:center;
        font-size:17px;
      }

      .ls-mode-feature strong {
        display:block;
        font-size:12px;
        margin-bottom:1px;
      }

      .ls-mode-feature span {
        color:var(--text-dim);
      }

      .ls-mode-note {
        margin-top:10px;
        padding-top:10px;
        border-top:1px solid var(--border);
        color:var(--text-dim);
        font-size:10px;
        line-height:1.45;
      }

      .ls-mode-close {
        width:100%;
        min-height:46px;
        margin-top:14px;
        border:0;
        border-radius:12px;
        background:var(--gold);
        color:#10120f;
        font-family:inherit;
        font-weight:800;
        cursor:pointer;
      }

      .ls-experience-toast {
        position:fixed;
        left:50%;
        bottom:max(24px, calc(env(safe-area-inset-bottom) + 24px));
        transform:translateX(-50%);
        width:min(390px, calc(100vw - 24px));
        z-index:500;
        box-sizing:border-box;
        padding:14px 15px;
        border-radius:16px;
        background:var(--panel);
        border:1px solid var(--border);
        box-shadow:0 16px 45px rgba(0,0,0,.5);
        color:var(--text);
        font-size:13px;
        line-height:1.4;
        animation:lsExperienceIn .25s ease;
      }

      .ls-experience-toast strong {
        display:block;
        margin-bottom:3px;
        color:var(--gold);
      }

      @keyframes lsExperienceIn {
        from { opacity:0; transform:translate(-50%, 12px); }
        to { opacity:1; transform:translate(-50%, 0); }
      }

      .ls-legacy *,
      .ls-legacy *::before,
      .ls-legacy *::after {
        animation-duration:0.001ms !important;
        animation-iteration-count:1 !important;
        transition-duration:0.001ms !important;
        scroll-behavior:auto !important;
      }

      .ls-legacy [style*="backdrop-filter"],
      .ls-legacy .ls-action-sheet-overlay,
      .ls-legacy .grid-menu-btn {
        backdrop-filter:none !important;
        -webkit-backdrop-filter:none !important;
      }

      .ls-legacy .profile-hero,
      .ls-legacy .form-card,
      .ls-legacy .profile-section,
      .ls-legacy .modal-box,
      .ls-legacy .ls-action-sheet {
        box-shadow:none !important;
      }

      .ls-legacy video {
        filter:none !important;
      }

      @media (max-width:420px) {
        .ls-legacy #appView {
          padding-left:7px !important;
          padding-right:7px !important;
        }

        .ls-legacy .profile-hero,
        .ls-legacy .profile-section,
        .ls-legacy .form-card {
          border-radius:12px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 6.0.1v: el modo deja de flotar sobre el contenido. Vive junto a Salir.
  document.getElementById("lsExperienceBadge")?.remove();

  const storageKey = `livescroll-experience-notice-${mode}-v1`;
  let alreadyShown = false;

  try {
    alreadyShown = localStorage.getItem(storageKey) === "1";
  } catch (_) {}

  if (!alreadyShown) {
    const toast = document.createElement("div");
    toast.className = "ls-experience-toast";

    if (mode === "legacy") {
      toast.innerHTML = `
        <strong>⚡ LiveScroll ${isLiveScroll7App() ? "7 Fluido" : "6 Legacy"} activado</strong>
        Optimizamos automáticamente la experiencia para que LiveScroll funcione mejor en este dispositivo.
      `;
    } else {
      toast.innerHTML = `
        <strong>✨ LiveScroll ${isLiveScroll7App() ? "7 Inmersivo" : "6 Nova"}</strong>
        Estás usando la experiencia completa de LiveScroll.
      `;
    }

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), mode === "legacy" ? 6000 : 4000);

    try {
      localStorage.setItem(storageKey, "1");
    } catch (_) {}
  }
}

async function renderApp() {
  ensureMobileStabilityLayer();
  applyLiveScrollRuntimeBranding();
  installLiveScroll7NativeFeel();
  if (landingOdometerRefreshTimer) {
    clearInterval(landingOdometerRefreshTimer);
    landingOdometerRefreshTimer = null;
  }

  // Anti-spam POR CUENTA. Si en el mismo teléfono se cierra sesión y entra
  // otra cuenta, esa cuenta debe poder recibir sus propias Novedades.
  if (window.__lsStartupUserId !== currentUser?.id) {
    window.__lsStartupUserId = currentUser?.id || null;
    window.__lsStartupOptionalModalShown = false;
  }

  claimLiveScroll6LaunchReward();

  initLiveScrollExperienceMode();
  setTimeout(applySeasonalTheme, 0);
  ensureModernMobileStyles();

  document.getElementById("landingView").classList.add("hidden");
  document.getElementById("appView").classList.remove("hidden");

  // 5.4.6: mostramos respuesta inmediata mientras resolvemos
  // las pocas cosas necesarias para construir la navegación.
  const appView = document.getElementById("appView");
  if (appView) appView.innerHTML = renderFastSkeleton(7, "feed");

  // Empezamos a preparar el Feed mientras resolvemos navegación y planes.
  // renderFeed reutiliza esta misma promesa, por lo que nunca duplica la consulta.
  loadFeedVideosCached().catch(() => {});

  const [visibilityResult, plans] = await Promise.all([
    sb.rpc("get_app_visibility"),
    loadPlans()
  ]);

  const visibilityData = visibilityResult?.data || {};
  const walletLocked =
    String(visibilityData.wallet_visibility || "open") === "closed" &&
    !currentProfile.is_admin;

  const plansLocked =
    String(visibilityData.plans_visibility || "open") === "closed" &&
    !currentProfile.is_admin;

  window.__navWalletLocked = walletLocked;
  window.__navPlansLocked = plansLocked;

  document.getElementById("navLinks").innerHTML = `
    <button id="tab-feed" onclick="switchTab('feed')">Mirar</button>
    <button id="tab-foryou" onclick="switchTab('foryou')">✨ Para Ti</button>
    <button id="tab-upload" onclick="switchTab('upload')">Subir video</button>
    <button id="tab-profile" onclick="switchTab('profile')">Mi Perfil</button>
    <button id="tab-users" onclick="switchTab('users')">👥 Usuarios</button>
    <button id="tab-directos" onclick="switchTab('directos')" style="color:var(--red)">🔴 Directos</button>
    ${!walletLocked ? `<button id="tab-wallet" onclick="switchTab('wallet')">Billetera</button>` : ""}
    <button id="tab-store" onclick="switchTab('store')">🛍️ Tienda</button>
    <button id="tab-ranking" onclick="switchTab('ranking')">🏆 Ranking</button>
    ${currentProfile.is_admin ? `<button id="tab-admin" onclick="switchTab('admin')" style="color:var(--green)">🛠 Admin</button>` : ""}`;

  const currentPlan =
    plans.find(p => p.id === currentProfile.plan_id) ||
    plans[0] ||
    { name: currentProfile.plan_id || "Plan" };

  document.getElementById("navRight").innerHTML = `
    <div class="nav-plan-chip">
      <span class="plan-name">${escapeHtml(currentPlan.name || "Plan")}</span>
      <span class="divider"></span>
      <span class="pts mono" id="navBalance">${currentProfile.points_balance} pts</span>
    </div>
    <button onclick="openChangelogHistory()" title="Novedades" class="nav-changelog-btn" style="background:none; border:none; font-size:17px; cursor:pointer; margin-left:8px;">📢</button>
    <button class="ls-pc-settings-gear" onclick="openLiveScrollSettings()" title="Configuración" aria-label="Configuración" style="background:none; border:none; font-size:18px; cursor:pointer; margin-left:4px;">⚙️</button>
    <button id="notifBell" onclick="toggleNotifPanel()" style="position:relative; background:none; border:none; font-size:18px; cursor:pointer; margin-left:4px;">
      🔔<span id="notifBadge" class="hidden" style="position:absolute; top:-4px; right:-6px; background:var(--red); color:#fff; font-size:10px; border-radius:10px; padding:1px 5px;"></span>
    </button>
    <button class="btn-outline nav-logout-btn" style="margin-left:10px" onclick="handleLogout()">Salir</button>`;

  ensureNavigationEvolution597();
  ensureLiveScroll7HorizontalNavigation();


  // Lo visible primero.
  checkBlockedStatus();
  switchTab("feed");

  // Lo secundario ya no bloquea la aparición del Feed.
  // Realtime se conecta enseguida. El resto espera a que el navegador tenga
  // un pequeño espacio libre para no competir con el primer video.
  subscribeToNotifications();
  startLiveScroll6UpdateWatcher();
  startLiveScroll7UpdateWatcher();

  const startupUserId = currentUser?.id;
  const loadSecondaryStartupData = () => {
    if (!startupUserId || currentUser?.id !== startupUserId) return;
    Promise.allSettled([
      loadNotifications(),
      checkBoostStatus(),
      checkPendingContent()
    ]).catch(() => {});
  };

  if ("requestIdleCallback" in window) {
    requestIdleCallback(loadSecondaryStartupData, { timeout:900 });
  } else {
    setTimeout(loadSecondaryStartupData, 250);
  }
}

// 6.1.2 · NUBE LIVESCROLL
// Desde esta versión, una publicación futura puede avisar a quienes todavía
// tengan LiveScroll 6 abierto y ofrecerles recargar sin cerrar su sesión.
const LIVESCROLL6_CLIENT_BUILD = 60202;
let ls6UpdateWatchTimer = null;
let ls6UpdateCheckRunning = false;

function formatLiveScrollBuild(code) {
  const value = Math.max(0, Math.trunc(Number(code) || 0));
  return `${Math.trunc(value / 10000)}.${Math.trunc((value % 10000) / 100)}.${value % 100}`;
}

async function checkLiveScroll6Update() {
  if (isLiveScroll7App() || !currentUser || ls6UpdateCheckRunning) return;
  if (document.getElementById("ls6LiveUpdatePrompt")) return;

  ls6UpdateCheckRunning = true;
  try {
    const { data, error } = await sb.from("app_config")
      .select("value")
      .eq("key", "ls6_required_build")
      .maybeSingle();
    if (error || !data?.value) return;

    const requiredBuildCode = Math.trunc(Number(data.value) || 0);
    if (requiredBuildCode <= LIVESCROLL6_CLIENT_BUILD) return;
    const requiredBuild = formatLiveScrollBuild(requiredBuildCode);

    const snoozeUntil = Number(sessionStorage.getItem(`ls6_update_snooze_${requiredBuildCode}`) || 0);
    if (Date.now() < snoozeUntil) return;
    showLiveScroll6UpdatePrompt(requiredBuild, requiredBuildCode);
  } catch (error) {
    console.warn("No se pudo comprobar la versión de LiveScroll 6:", error);
  } finally {
    ls6UpdateCheckRunning = false;
  }
}

function showLiveScroll6UpdatePrompt(requiredBuild, requiredBuildCode) {
  if (document.getElementById("ls6LiveUpdatePrompt")) return;
  const overlay = document.createElement("div");
  overlay.id = "ls6LiveUpdatePrompt";
  overlay.style.cssText = "position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(10px)";
  overlay.innerHTML = `
    <div style="width:min(430px,100%);border:1px solid rgba(250,204,21,.36);border-radius:22px;padding:24px;background:linear-gradient(150deg,#111827,#07131d);box-shadow:0 28px 90px rgba(0,0,0,.65),0 0 45px rgba(34,197,94,.12);color:#f8fafc;text-align:center;">
      <div style="font-size:38px;margin-bottom:10px;">☁️</div>
      <div style="font:800 11px 'JetBrains Mono',monospace;letter-spacing:.16em;color:#facc15;margin-bottom:8px;">ACTUALIZACIÓN ${escapeHtml(requiredBuild)}</div>
      <h2 style="margin:0 0 10px;font-size:24px;">Nueva actualización disponible</h2>
      <p style="margin:0 0 20px;color:#cbd5e1;font-size:14px;line-height:1.55;">LiveScroll recibió mejoras mientras estabas usando la aplicación. Reiniciá para cargar la versión más reciente.</p>
      <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:10px;">
        <button id="ls6UpdateLater" class="btn-outline" style="min-height:48px;">Más tarde</button>
        <button id="ls6UpdateNow" class="btn" style="min-height:48px;">Reiniciar ahora</button>
      </div>
      <p style="margin:13px 0 0;color:#94a3b8;font-size:11px;">Tu sesión continuará iniciada.</p>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById("ls6UpdateLater")?.addEventListener("click", () => {
    sessionStorage.setItem(`ls6_update_snooze_${requiredBuildCode}`, String(Date.now() + 10 * 60 * 1000));
    overlay.remove();
  });
  document.getElementById("ls6UpdateNow")?.addEventListener("click", restartLiveScrollForUpdate);
}

async function restartLiveScrollForUpdate() {
  const button = document.getElementById("ls6UpdateNow") || document.getElementById("ls7UpdateNow");
  if (button) { button.disabled = true; button.textContent = "Actualizando…"; }
  try {
    const registrations = await navigator.serviceWorker?.getRegistrations?.();
    await Promise.allSettled((registrations || []).map(registration => registration.update()));
    if (window.caches) {
      const keys = await caches.keys();
      await Promise.allSettled(keys.map(key => caches.delete(key)));
    }
  } catch (_) {}
  const cleanUrl = `${location.pathname}${location.search}${location.search ? "&" : "?"}update=${Date.now()}`;
  location.replace(cleanUrl);
}

function startLiveScroll6UpdateWatcher() {
  if (isLiveScroll7App() || ls6UpdateWatchTimer) return;
  checkLiveScroll6Update();
  ls6UpdateWatchTimer = setInterval(checkLiveScroll6Update, 60000);
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") checkLiveScroll6Update();
});

window.addEventListener("online", () => {
  checkLiveScroll6Update();
}, { passive:true });

// 7.0.1 · ACTUALIZACIONES EN VIVO
// LiveScroll 7 usa su propio canal de versión para no interferir con la 6.
const LIVESCROLL7_CLIENT_BUILD = 70008;
let ls7UpdateWatchTimer = null;
let ls7UpdateCheckRunning = false;

async function checkLiveScroll7Update() {
  if (!isLiveScroll7App() || !currentUser || ls7UpdateCheckRunning) return;
  if (document.getElementById("ls7LiveUpdatePrompt")) return;
  ls7UpdateCheckRunning = true;
  try {
    const { data, error } = await sb.from("app_config")
      .select("value").eq("key", "ls7_required_build").maybeSingle();
    if (error || !data?.value) return;
    const requiredBuildCode = Math.trunc(Number(data.value) || 0);
    const installedBuildCode = getLiveScroll7InstalledBuild();
    if (requiredBuildCode <= installedBuildCode) return;
    const snoozeUntil = Number(sessionStorage.getItem(`ls7_update_snooze_${requiredBuildCode}`) || 0);
    if (Date.now() < snoozeUntil) return;
    showLiveScroll7UpdatePrompt(formatLiveScrollBuild(requiredBuildCode), requiredBuildCode);
  } catch (error) {
    console.warn("No se pudo comprobar la versión de LiveScroll 7:", error);
  } finally {
    ls7UpdateCheckRunning = false;
  }
}

function getLiveScroll7InstalledBuild() {
  let installedBuild = 0;
  try {
    const installedVersion = String(window.AndroidBridge?.getAppVersion?.() || "");
    const parts = installedVersion.match(/(\d+)\.(\d+)\.(\d+)/);
    if (parts) {
      installedBuild = (Number(parts[1]) * 10000) + (Number(parts[2]) * 100) + Number(parts[3]);
    }
  } catch (_) {}
  // El cliente web puede avanzar sin exigir una APK nueva.
  return Math.max(installedBuild, LIVESCROLL7_CLIENT_BUILD);
}

function showLiveScroll7UpdatePrompt(requiredBuild, requiredBuildCode) {
  if (document.getElementById("ls7LiveUpdatePrompt")) return;
  const overlay = document.createElement("div");
  overlay.id = "ls7LiveUpdatePrompt";
  overlay.className = "ls7-electric-update-overlay";
  overlay.innerHTML = `
    <div class="ls7-electric-update-card">
      <img src="livescroll7-icon.png" alt="" class="ls7-electric-update-logo">
      <div class="ls7-electric-update-kicker">EVOLUCIÓN ${escapeHtml(requiredBuild)}</div>
      <h2>Nueva energía disponible</h2>
      <p>LiveScroll 7 evolucionó mientras estabas conectado. Reiniciá para activar la experiencia más reciente.</p>
      <div class="ls7-electric-update-actions">
        <button id="ls7UpdateLater" class="btn-outline">Más tarde</button>
        <button id="ls7UpdateNow" class="btn">Activar ahora</button>
      </div>
      <small>Tu sesión seguirá iniciada.</small>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById("ls7UpdateLater")?.addEventListener("click", () => {
    sessionStorage.setItem(`ls7_update_snooze_${requiredBuildCode}`, String(Date.now() + 10 * 60 * 1000));
    overlay.remove();
  });
  document.getElementById("ls7UpdateNow")?.addEventListener("click", restartLiveScrollForUpdate);
}

function startLiveScroll7UpdateWatcher() {
  if (!isLiveScroll7App() || ls7UpdateWatchTimer) return;
  checkLiveScroll7Update();
  ls7UpdateWatchTimer = setInterval(checkLiveScroll7Update, 60000);
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") checkLiveScroll7Update();
});
window.addEventListener("online", checkLiveScroll7Update, { passive:true });

const CHANGELOG_AUTO_BASELINE_VERSION = 24; // 5.8.1: desde la 25 en adelante el aviso tiene fallback automático
let lsStartupChangelogHistoryCache = { data:null, at:0 };
let lsStartupChangelogHistoryPromise = null;

async function loadStartupChangelogHistory() {
  if (Array.isArray(lsStartupChangelogHistoryCache.data) &&
      Date.now() - lsStartupChangelogHistoryCache.at < 60000) {
    return { data:lsStartupChangelogHistoryCache.data, error:null };
  }

  if (lsStartupChangelogHistoryPromise) return lsStartupChangelogHistoryPromise;

  lsStartupChangelogHistoryPromise = sb
    .rpc("get_changelog_history_v2", { p_limit:200 })
    .then(result => {
      if (!result?.error && Array.isArray(result?.data)) {
        lsStartupChangelogHistoryCache = { data:result.data, at:Date.now() };
      }
      return result;
    })
    .finally(() => {
      lsStartupChangelogHistoryPromise = null;
    });

  return lsStartupChangelogHistoryPromise;
}

// Evita el efecto "cerré un cartel y apareció otro".
// Términos y tutorial conservan prioridad, pero las novedades/teasers opcionales
// se limitan a UNA interrupción automática por sesión.
window.__lsStartupOptionalModalShown = window.__lsStartupOptionalModalShown || false;

async function checkPendingContent() {
  if (!currentUser?.id) return;

  // 6.0.3v: la bienvenida manda. Las novedades esperan a que termine el
  // portal y aparecen una sola vez, ya dentro del Feed.
  if (window.__ls6StartupPresentationActive || document.getElementById("ls6LaunchPortal")) {
    if (!window.__lsPendingContentWaitingForPresentation) {
      window.__lsPendingContentWaitingForPresentation = true;
      let continuedAfterPresentation = false;
      const continueAfterPresentation = () => {
        if (continuedAfterPresentation) return;
        continuedAfterPresentation = true;
        window.__lsPendingContentWaitingForPresentation = false;
        setTimeout(() => checkPendingContent(), 1100);
      };
      window.addEventListener("livescroll6:presentation-finished", continueAfterPresentation, { once:true });
      // Respaldo por si el WebView pausa o descarta el evento durante el viaje.
      setTimeout(() => {
        if (!window.__ls6StartupPresentationActive && !document.getElementById("ls6LaunchPortal")) {
          continueAfterPresentation();
        }
      }, 18000);
    }
    return;
  }

  // 5.8.6: Novedades vuelve a aparecer automáticamente cuando existe
  // una versión pendiente. El sistema de confirmación y la marca local
  // garantizan que cada versión se muestre una sola vez por usuario.
  const allowAutomaticChangelog = true;

  const seenKey = `livescroll_changelog_seen_${currentUser.id}`;

  // Leemos backend + historial en paralelo.
  // Si el backend por algún motivo no marca "pending", el historial funciona
  // como respaldo desde la versión interna 25 en adelante.
  const [pendingResult, historyResult, syncResult] = await Promise.allSettled([
    sb.rpc("get_pending_content", { p_user_id: currentUser.id }),
    loadStartupChangelogHistory(),
    sb.rpc("get_my_app_sync_state")
  ]);

  const pendingData =
    pendingResult.status === "fulfilled"
      ? pendingResult.value?.data
      : null;

  const rawHistory =
    historyResult.status === "fulfilled" && Array.isArray(historyResult.value?.data)
      ? historyResult.value.data
      : [];

  const semverParts = (value) => String(value || "0.0.0")
    .split(".")
    .map(n => Number.parseInt(n, 10) || 0);

  const compareSemver = (a, b) => {
    const pa = semverParts(a);
    const pb = semverParts(b);
    const max = Math.max(pa.length, pb.length, 3);
    for (let i = 0; i < max; i++) {
      const av = pa[i] || 0;
      const bv = pb[i] || 0;
      if (av !== bv) return av - bv;
    }
    return 0;
  };

  // La 6 y la 7 comparten backend, pero no comparten relato de versiones.
  // Cada runtime ve solamente la familia de novedades que le corresponde.
  const history = rawHistory.filter(entry => {
    const display = String(entry?.display_version || "");
    const isVersion7 = /^7(?:\.|$)/.test(display);
    if (isLiveScroll7App()) return isVersion7;
    return !isVersion7 && compareSemver(display, "6.1.2") >= 0;
  });

  const syncState =
    syncResult.status === "fulfilled" && !syncResult.value?.error
      ? (syncResult.value?.data || {})
      : {};

  const latestInternal = history.reduce(
    (max, e) => Math.max(max, Number(e.version || 0)),
    0
  );

  const latestDisplay = history.length
    ? history
        .map(e => String(e.display_version || `${e.version}.0.0`))
        .sort(compareSemver)
        .at(-1)
    : null;

  const latestRows = latestDisplay
    ? history.filter(
        e => String(e.display_version || `${e.version}.0.0`) === latestDisplay
      )
    : [];

  const storedSeenRaw = localStorage.getItem(seenKey);
  let locallySeen = storedSeenRaw === null
    ? 0
    : Number(storedSeenRaw || 0);
  const cloudSeen = Number(syncState?.changelog_seen_version || 0);
  locallySeen = Math.max(locallySeen, cloudSeen);

  // Una cuenta que ya reconoció Novedades en el backend no debe reconstruir
  // todo el historial al abrir otro dispositivo por primera vez.
  if (pendingData?.changelog_pending === false && cloudSeen === 0 && latestInternal > 0) {
    locallySeen = latestInternal;
    localStorage.setItem(seenKey, String(latestInternal));
    Promise.resolve(sb.rpc("set_my_changelog_seen_version", { p_version:latestInternal })).catch(() => {});
  } else if (cloudSeen > 0 && cloudSeen > Number(storedSeenRaw || 0)) {
    localStorage.setItem(seenKey, String(cloudSeen));
  } else if (locallySeen > cloudSeen) {
    Promise.resolve(sb.rpc("set_my_changelog_seen_version", { p_version:locallySeen })).catch(() => {});
  }

  const accountCreatedAt = new Date(currentUser?.created_at || 0).getTime();
  const isRecentlyCreatedAccount = Number.isFinite(accountCreatedAt) &&
    accountCreatedAt > 0 &&
    Date.now() - accountCreatedAt < 7 * 24 * 60 * 60 * 1000;
  const newAccountBaselineKey = `livescroll_new_account_changelog_baselined_${currentUser.id}`;

  // La nube es la fuente principal. localStorage queda solamente como respaldo
  // para una carga sin conexión o una falla temporal del RPC.

  // Si el usuario se perdió varias versiones, mostramos TODAS juntas
  // en "Mientras no estabas..." en lugar de abrir un popup por versión.
  const allUnseenRows = history
    .filter(e => Number(e.version || 0) > locallySeen);
  const lastFourUnseenVersions = [...new Set(allUnseenRows
    .map(e => Number(e.version || 0))
    .filter(Boolean))]
    .sort((a,b) => b - a)
    .slice(0,4);
  const unseenRows = allUnseenRows
    .filter(e => lastFourUnseenVersions.includes(Number(e.version || 0)))
    .sort((a, b) => {
      const va = Number(a.version || 0);
      const vb = Number(b.version || 0);
      if (va !== vb) return va - vb;
      return Number(a.sort_order || 0) - Number(b.sort_order || 0);
    });

  // 1) Contenido obligatorio / tutorial conservan prioridad.
  // Novedades NO se muestra automáticamente; queda manual.
  if (pendingData?.terms_pending) {
    showTermsUpdateModal();
    return;
  }

  if (pendingData?.tutorial_pending) {
    showTutorialModal();
    return;
  }

  // 6.1.0 · EL PUENTE: comunicado único por cuenta. No anuncia el final de
  // LiveScroll 6; confirma que continúa activo mientras construimos LS7.
  const bridgeKey = `livescroll_bridge_610_seen_${currentUser.id}`;
  const localBridgeSeen = localStorage.getItem(bridgeKey) === "1";
  const cloudBridgeSeen = syncState?.bridge_notice_seen === true;
  if (localBridgeSeen && !cloudBridgeSeen) {
    Promise.resolve(sb.rpc("mark_my_bridge_notice_seen")).catch(() => {});
  }
  if (cloudBridgeSeen && !localBridgeSeen) localStorage.setItem(bridgeKey,"1");
  if (!isLiveScroll7App() && !localBridgeSeen && !cloudBridgeSeen && !window.__lsStartupOptionalModalShown) {
    window.__lsStartupOptionalModalShown = true;
    window.__lsBridgeShownVersion = latestInternal;
    showLiveScroll6BridgeNotice();
    return;
  }

  // 6.0.8 · EL PULSO: no vive en el menú. Aparece automáticamente una sola
  // vez por Usuario y solamente se completa manteniendo presionado de verdad.
  const ls7PulseKey = `livescroll_ls7_pulse_seen_${currentUser.id}`;
  const localPulseSeen = localStorage.getItem(ls7PulseKey) === "1";
  const cloudPulseSeen = syncState?.ls7_pulse_seen === true;
  const ls7PulseSeen = cloudPulseSeen || localPulseSeen;
  if (localPulseSeen && !cloudPulseSeen) Promise.resolve(sb.rpc("mark_my_ls7_pulse_seen")).catch(() => {});
  if (cloudPulseSeen && !localPulseSeen) localStorage.setItem(ls7PulseKey,"1");
  if (
    !isLiveScroll7App() &&
    !ls7PulseSeen &&
    !window.__lsStartupOptionalModalShown
  ) {
    window.__lsStartupOptionalModalShown = true;
    openLiveScroll7Teaser();
    return;
  }

  // Una cuenta nueva no puede tener versiones "perdidas": comienza desde la
  // version que estaba publicada cuando llego. El tutorial sigue siendo
  // obligatorio, pero el historial anterior queda disponible solo desde 📢.
  if (isRecentlyCreatedAccount && localStorage.getItem(newAccountBaselineKey) !== "1") {
    if (latestInternal > 0) localStorage.setItem(seenKey, String(latestInternal));
    if (latestInternal > 0) await sb.rpc("set_my_changelog_seen_version", { p_version:latestInternal });
    localStorage.setItem(newAccountBaselineKey, "1");
    await sb.rpc("acknowledge_content", {
      p_user_id:currentUser.id,
      p_content_key:"changelog"
    });
    return;
  }

  // 2) Backend normal: si marca Novedades pendientes, mostramos eso.
  // y completamos con la versión visible más reciente si hiciera falta.
  if (
    allowAutomaticChangelog &&
    pendingData?.changelog_pending &&
    !window.__lsStartupOptionalModalShown
  ) {
    let entries = Array.isArray(pendingData.changelog_entries)
        ? pendingData.changelog_entries.filter(entry => {
          const display = String(entry?.display_version || "");
          const isVersion7 = /^7(?:\.|$)/.test(display);
          if (isLiveScroll7App()) return isVersion7;
          return !isVersion7 && compareSemver(display, "6.1.2") >= 0;
        })
      : [];

    // El backend compartido puede avisar que existe una versión pendiente de
    // la otra aplicación. Si este runtime no tiene nada nuevo, no repetimos su
    // última novedad ni confirmamos contenido ajeno.
    if (!unseenRows.length && !entries.length) return;

    // Historial como respaldo: agregamos versiones no vistas que el backend
    // no haya incluido, evitando duplicados.
    const candidateRows = unseenRows.length ? unseenRows : latestRows;
    candidateRows.forEach(row => {
      const duplicate = entries.some(e =>
        Number(e.version || 0) === Number(row.version || 0) &&
        String(e.category || "") === String(row.category || "") &&
        String(e.content || "") === String(row.content || "")
      );
      if (!duplicate) entries.push(row);
    });

    const allowedVersions = [...new Set(entries.map(e => Number(e.version || 0)).filter(Boolean))]
      .sort((a,b) => b - a)
      .slice(0,4);
    entries = entries.filter(e => allowedVersions.includes(Number(e.version || 0)));

    if (!entries.length) return;

    window.__lsChangelogShownVersion = Math.max(
      latestInternal,
      ...entries.map(e => Number(e.version || 0)),
      0
    );

    window.__lsStartupOptionalModalShown = true;
    showChangelogModal(entries);
    return;
  }

  // 3) FALLBACK AUTOMÁTICO.
  // Desde la versión interna 25, si existe una versión nueva en el historial
  // que este dispositivo todavía no vio, el cartel aparece aunque
  // get_pending_content() haya fallado o devuelva false.
  if (
    allowAutomaticChangelog &&
    !window.__lsStartupOptionalModalShown &&
    latestInternal > CHANGELOG_AUTO_BASELINE_VERSION &&
    latestInternal > locallySeen &&
    unseenRows.length
  ) {
    window.__lsChangelogShownVersion = latestInternal;
    window.__lsStartupOptionalModalShown = true;
    showChangelogModal(unseenRows);
    return;
  }

  // 4) Teasers opcionales: como máximo UNO por sesión y nunca inmediatamente
  // después de haber mostrado Novedades.
  if (window.__lsStartupOptionalModalShown) return;

  if (pendingData?.road_to_6_teaser_pending) {
    window.__lsStartupOptionalModalShown = true;
    showRoadTo6Teaser();
  } else {
    checkCollection568Launch();
  }
}


async function checkConnected579Launch() {
  if (!currentUser?.id || window.__lsStartupOptionalModalShown) return;

  const { data, error } = await sb.rpc("get_connected_579_launch_pending");
  if (error || !data?.pending) return;

  window.__lsStartupOptionalModalShown = true;
  showConnected579Launch();
}

function showConnected579Launch() {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="ls-next-era-changelog">
      <div class="ls-next-era-box" style="max-width:520px;text-align:center;">
        <div class="ls-next-era-scan"></div>

        <div class="ls-next-era-head">
          <div class="ls-next-era-kicker">LIVE SCROLL · NEXT ERA</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--gold);letter-spacing:.16em;margin:13px 0 5px;">NUEVA ETAPA</div>
          <h2 class="ls-next-era-title" style="font-size:clamp(29px,7vw,48px);line-height:.98;margin-bottom:8px;">5.7.9</h2>
          <div style="font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:900;color:var(--gold);letter-spacing:.12em;">CONNECTED</div>
        </div>

        <div class="ls-next-era-body" style="text-align:center;">
          <div style="font-size:40px;margin:3px 0 10px;">📡</div>
          <h3 style="margin:0 0 8px;font-size:19px;">Una nueva forma de conectarnos comienza.</h3>
          <p style="font-size:12px;color:var(--text-dim);line-height:1.65;max-width:405px;margin:0 auto;">
            Empezamos a construir una nueva generación de LiveScroll:
            directos más rápidos, una experiencia móvil más inmediata
            y nuevas formas de mantenerte conectado.
          </p>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0 4px;">
            <div style="padding:11px 6px;border:1px solid var(--border);border-radius:12px;background:var(--panel-2);">
              <div style="font-size:20px;">⚡</div>
              <div style="font-size:9px;font-weight:800;margin-top:5px;">DIRECTOS MÁS RÁPIDOS</div>
            </div>
            <div style="padding:11px 6px;border:1px solid var(--border);border-radius:12px;background:var(--panel-2);">
              <div style="font-size:20px;">📱</div>
              <div style="font-size:9px;font-weight:800;margin-top:5px;">MÓVIL</div>
            </div>
            <div style="padding:11px 6px;border:1px solid var(--border);border-radius:12px;background:var(--panel-2);">
              <div style="font-size:20px;">🔔</div>
              <div style="font-size:9px;font-weight:800;margin-top:5px;">CONECTADOS</div>
            </div>
          </div>

          <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--gold);letter-spacing:.12em;margin-top:14px;">
            PRÓXIMAMENTE
          </div>
        </div>

        <div class="ls-next-era-foot">
          <button class="ls-road6-btn" style="width:100%;" onclick="acknowledgeConnected579Launch(this)">
            CONTINUAR EL CAMINO →
          </button>
          <div style="font-size:9px;color:var(--text-dim);margin-top:9px;">5.7.9 se encuentra actualmente en desarrollo.</div>
        </div>
      </div>
    </div>`;
}

async function acknowledgeConnected579Launch(btn) {
  if (btn) {
    btn.disabled = true;
    btn.textContent = "CONECTANDO...";
  }

  const { data, error } = await sb.rpc("acknowledge_connected_579_launch");

  if (error || !data?.ok) {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "CONTINUAR EL CAMINO →";
    }
    showToast("No se pudo guardar el aviso");
    return;
  }

  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";
}


async function checkCollection568Launch() {
  if (!currentUser?.id || window.__lsStartupOptionalModalShown) return;

  const { data, error } = await sb.rpc("get_collection_568_launch_pending");
  if (error) return;

  if (data?.pending) {
    window.__lsStartupOptionalModalShown = true;
    showCollection568Launch();
    return;
  }

  checkConnected579Launch();
}

function showCollection568Launch() {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="ls-next-era-changelog">
      <div class="ls-next-era-box" style="max-width:520px;text-align:center;">
        <div class="ls-next-era-scan"></div>

        <div class="ls-next-era-head">
          <div class="ls-next-era-kicker">LIVE SCROLL · NEXT ERA</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--gold);letter-spacing:.16em;margin:13px 0 5px;">NUEVA ETAPA</div>
          <h2 class="ls-next-era-title" style="font-size:clamp(29px,7vw,48px);line-height:.98;margin-bottom:8px;">5.6.8</h2>
          <div style="font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:900;color:var(--gold);letter-spacing:.12em;">COLLECTION</div>
        </div>

        <div class="ls-next-era-body" style="text-align:center;">
          <div style="font-size:38px;margin:3px 0 10px;">🛍️</div>
          <h3 style="margin:0 0 10px;font-size:18px;">Tu colección está por evolucionar.</h3>
          <p style="font-size:12px;color:var(--text-dim);line-height:1.65;max-width:390px;margin:0 auto;">
            Comenzamos oficialmente a trabajar en una nueva etapa de LiveScroll.
            Nuevos coleccionables, ediciones especiales y nuevas formas de distinguir tu perfil.
          </p>

          <div style="margin:18px auto 4px;max-width:360px;padding:11px;border:1px solid rgba(250,204,21,.16);border-radius:12px;background:rgba(250,204,21,.035);">
            <div style="font-size:10px;color:var(--text-dim);">ESTO RECIÉN EMPIEZA</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:900;color:var(--gold);margin-top:4px;">RUMBO A LIVESCROLL 6</div>
          </div>
        </div>

        <div style="padding:0 22px 22px;">
          <button class="ls-road6-btn" style="width:100%;" onclick="acknowledgeCollection568Launch(this)">
            DESCUBRIR 5.6.8 →
          </button>
          <div style="font-size:9px;color:var(--text-dim);margin-top:9px;">5.6.8 se encuentra actualmente en desarrollo.</div>
        </div>
      </div>
    </div>`;
}

async function acknowledgeCollection568Launch(btn) {
  if (btn) {
    btn.disabled = true;
    btn.textContent = "ENTRANDO A COLLECTION...";
  }

  const { data, error } = await sb.rpc("acknowledge_collection_568_launch");

  if (error || !data?.ok) {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "DESCUBRIR 5.6.8 →";
    }
    showToast("No se pudo guardar el aviso");
    return;
  }

  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";

  // Si todavía no vio la siguiente etapa, la mostramos sin obligarlo
  // a cerrar y volver a abrir la app.
  checkConnected579Launch();
}

function showRoadTo6Teaser() {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="ls-road6-overlay">
      <div class="ls-road6-card">
        <div class="ls-road6-scan"></div>
        <div class="ls-road6-content">
          <div class="ls-road6-kicker">LIVE SCROLL · NEXT ERA</div>
          <div class="ls-road6-mark">◈</div>

          <h2 class="ls-road6-title">Algo grande<br>está comenzando.</h2>

          <div class="ls-road6-copy">
            LiveScroll está entrando en una nueva etapa. Durante las próximas versiones vas a empezar a descubrir partes de lo que estamos preparando.
          </div>

          <div class="ls-road6-signals">
            <div class="ls-road6-signal"><b>⚡</b>Más rápido</div>
            <div class="ls-road6-signal"><b>🏅</b>Más personal</div>
            <div class="ls-road6-signal"><b>🔔</b>Más conectado</div>
            <div class="ls-road6-signal"><b>📡</b>Más cerca</div>
          </div>

          <div class="ls-road6-road">
            5.4.6 → 5.5.7 → 5.6.8 → 5.7.9<br>
            5.8.0 → 5.9.0 → 5.9.1 → 5.9.2 → 5.9.3 → 5.9.4 → 5.9.5 → 5.9.6 → 5.9.7 → 5.9.8 → 5.9.9 → <strong>6.0.0</strong>
          </div>

          <button class="ls-road6-btn" onclick="acknowledgeRoadTo6Teaser()">
            Comenzar el camino →
          </button>

          <div class="ls-road6-foot">
            El camino hacia LiveScroll 6 comienza ahora.
          </div>
        </div>
      </div>
    </div>`;
}

async function acknowledgeRoadTo6Teaser() {
  const btn = document.querySelector(".ls-road6-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Preparando lo que viene...";
  }

  const { data, error } = await sb.rpc("acknowledge_road_to_6_teaser");

  if (error || !data?.ok) {
    console.error(error || data);
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Intentar nuevamente";
    }
    showToast("No se pudo guardar todavía");
    return;
  }

  const overlay = document.querySelector(".ls-road6-overlay");
  const card = document.querySelector(".ls-road6-card");

  if (overlay) overlay.style.opacity = "0";
  if (card) {
    card.style.transform = "scale(.94) translateY(-14px)";
    card.style.opacity = "0";
  }

  setTimeout(() => {
    const wrap = document.getElementById("globalModalWrap");
    if (wrap) wrap.innerHTML = "";
  }, 360);
}


// ============================================================
// LIVESCROLL · TUTORIAL V3.1 · TOUR COMPLETO MEJORADO
// - PC: acceso visible al tutorial.
// - Omitir más grande.
// - SIN Billetera ni Planes.
// - Mejor lectura.
// - Novedades/Configuración visibles en ☰ móvil.
// - Visión cómoda abre Configuración real.
// - Recuperación explicada con flujo visual.
// ============================================================

const LS_TUTORIAL_V31_STEPS = [
  {
    key:"welcome",
    icon:"👋",
    eyebrow:"BIENVENIDA",
    title:"Conocé LiveScroll de verdad",
    text:"Este recorrido obligatorio aparece una sola vez para mostrarte todo lo nuevo. Podés avanzar y volver atrás; al terminar no volverá a interrumpirte."
  },
  {
    key:"feed",
    tab:"feed",
    selector:"#tab-feed",
    icon:"🎬",
    eyebrow:"MIRAR",
    title:"El Feed principal",
    text:"Acá aparecen los videos de Usuarios y Creadores. Deslizá o desplazate para descubrir contenido nuevo."
  },
  {
    key:"feed-actions",
    tab:"feed",
    selector:".feed-actions",
    icon:"❤️",
    eyebrow:"INTERACTUAR",
    title:"Me gusta, comentarios y compartir",
    text:"Los controles del video sirven para reaccionar, comentar y compartir. Si todavía no hay videos, el recorrido continúa normalmente."
  },
  {
    key:"foryou",
    tab:"foryou",
    selector:"#tab-foryou",
    icon:"✨",
    eyebrow:"DESCUBRIR",
    title:"Para Ti",
    text:"Esta sección reúne contenido destacado para ayudarte a encontrar publicaciones que pueden interesarte."
  },
  {
    key:"upload",
    tab:"upload",
    selector:"#tab-upload",
    icon:"⬆️",
    eyebrow:"CREAR",
    title:"Subir video",
    text:"Desde acá publicás tus clips. Elegís el archivo, completás los datos y LiveScroll prepara la publicación."
  },
  {
    key:"video-edit",
    tab:"upload",
    icon:"✂️",
    eyebrow:"RECORTAR",
    title:"Videos largos y reedición",
    text:"Podés elegir un video largo, recortar solamente el fragmento que querés publicar y reeditar después tus videos propios sin borrar primero el original."
  },
  {
    key:"profile",
    tab:"profile",
    selector:"#tab-profile",
    icon:"👤",
    eyebrow:"TU ESPACIO",
    title:"Mi Perfil",
    text:"Tu perfil reúne tu identidad, tus videos, medallas y actividad. Puede tardar un instante en cargar toda la información."
  },
  {
    key:"profile-edit",
    tab:"profile",
    selector:"button[onclick*='openEditProfile'],button[onclick*='showEditProfile']",
    icon:"✏️",
    eyebrow:"PERSONALIZAR",
    title:"Editar perfil",
    text:"Desde Editar perfil podés cambiar foto, portada, bio y otros datos de tu cuenta."
  },
  {
    key:"users",
    tab:"users",
    selector:"#tab-users",
    icon:"👥",
    eyebrow:"USUARIOS",
    title:"Usuarios",
    text:"Buscá otras personas, visitá perfiles y descubrí nuevos Usuarios y Creadores dentro de LiveScroll."
  },
  {
    key:"creators",
    tab:"profile",
    icon:"🔓",
    eyebrow:"CREADORES",
    title:"Acceso a Creador",
    text:"Todo Usuario puede agregar Instagram. Con al menos cinco videos puede solicitar acceso a Creador para desbloquear TikTok, YouTube, Twitch y Kick."
  },
  {
    key:"directos",
    tab:"directos",
    selector:"#tab-directos",
    icon:"🔴",
    eyebrow:"EN VIVO",
    title:"Directos",
    text:"Cuando haya transmisiones públicas activas, las vas a encontrar acá."
  },
  {
    key:"store",
    tab:"store",
    selector:"#tab-store",
    icon:"🛍️",
    eyebrow:"PERSONALIZAR",
    title:"Tienda",
    text:"Explorá medallas, emojis, títulos y otros artículos disponibles dentro de LiveScroll."
  },
  {
    key:"ranking",
    tab:"ranking",
    selector:"#tab-ranking",
    icon:"🏆",
    eyebrow:"COMUNIDAD",
    title:"Ranking",
    text:"Consultá quiénes tuvieron más actividad y puntos durante el período mostrado."
  },
  {
    key:"notifications",
    selector:"#notifBell",
    icon:"🔔",
    eyebrow:"AL DÍA",
    title:"Notificaciones",
    text:"La campanita te avisa sobre interacciones, novedades y otros eventos importantes de tu cuenta."
  },
  {
    key:"news",
    selector:".nav-changelog-btn",
    icon:"📢",
    eyebrow:"NOVEDADES",
    title:"Novedades",
    text:"Acá podés revisar versiones, mejoras, reparaciones y revisiones publicadas de LiveScroll."
  },
  {
    key:"settings",
    selector:".ls-pc-settings-gear",
    icon:"⚙️",
    eyebrow:"CONFIGURACIÓN",
    title:"Configuración",
    text:"En PC tenés acceso directo con la tuerquita. En celular está dentro del menú ☰."
  },
  {
    key:"comfortable-vision",
    icon:"👁️",
    eyebrow:"ACCESIBILIDAD",
    title:"Visión cómoda",
    text:"LiveScroll puede agrandar textos, botones y controles de forma ordenada. También podés ajustar contraste y fuerza del texto."
  },
  {
    key:"android-back",
    icon:"↩️",
    eyebrow:"ANDROID",
    title:"Botón Atrás inteligente",
    text:"Atrás cierra primero menús y ventanas, vuelve al Feed desde otros apartados y solamente sale de la aplicación con una segunda pulsación."
  },
  {
    key:"nova-legacy",
    icon:"✨",
    eyebrow:"RENDIMIENTO",
    title:"LiveScroll 6 Nova y Legacy",
    text:"Nova ofrece la experiencia visual completa. Legacy reduce efectos en celulares modestos para mantener la navegación más estable."
  },
  {
    key:"recovery",
    icon:"🔐",
    eyebrow:"SEGURIDAD",
    title:"Si olvidás tu contraseña",
    text:"Tocá “Olvidaste tu contraseña”, abrí el correo de recuperación, escribí la nueva contraseña dos veces y LiveScroll te devuelve al inicio para entrar con la clave nueva.",
    visual:"recovery"
  },
  {
    key:"finish",
    icon:"🚀",
    eyebrow:"TODO LISTO",
    title:"Ya conocés LiveScroll",
    text:"Terminaste el recorrido. Cuando quieras repasarlo, abrí “Cómo funciona” desde el menú o desde el acceso de PC."
  }
];

let tutorialStepIndex = 0;
let lsTutorialV31Steps = [];

function installTutorialV31Styles() {
  if (document.getElementById("lsTutorialV31Styles")) return;

  const style = document.createElement("style");
  style.id = "lsTutorialV31Styles";
  style.textContent = `
    #lsTutorialV3Layer {
      position:fixed;
      inset:0;
      z-index:380;
      pointer-events:none;
    }

    #lsTutorialV3Shade {
      position:absolute;
      inset:0;
      background:rgba(3,5,9,.48);
      backdrop-filter:blur(1px);
    }

    .ls-tutorial-spotlight {
      border-radius:12px !important;
      outline:2px solid var(--gold) !important;
      outline-offset:4px !important;
      box-shadow:0 0 0 6px rgba(218,165,32,.12) !important;
    }

    #lsTutorialV3Card {
      pointer-events:auto;
      position:fixed;
      z-index:390;
      width:min(430px,calc(100vw - 24px));
      left:50%;
      bottom:18px;
      transform:translateX(-50%);
      border:1px solid rgba(255,255,255,.14);
      border-radius:18px;
      background:color-mix(in srgb,var(--panel) 97%,black);
      box-shadow:0 26px 90px rgba(0,0,0,.58);
      overflow:hidden;
    }

    .ls-tut-v3-head {
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:12px;
      padding:17px 18px 9px;
    }

    .ls-tut-v3-eye {
      color:var(--gold);
      font-size:10px;
      line-height:1;
      font-weight:950;
      letter-spacing:.14em;
      margin-bottom:6px;
    }

    .ls-tut-v3-head h2 {
      margin:0;
      font-size:21px;
      line-height:1.22;
    }

    .ls-tut-v3-count {
      white-space:nowrap;
      padding:6px 9px;
      border-radius:999px;
      border:1px solid var(--border);
      color:var(--text);
      font-size:11px;
      font-weight:850;
      background:var(--panel-2);
    }

    .ls-tut-v3-body {
      padding:7px 18px 14px;
    }

    .ls-tut-v3-row {
      display:flex;
      align-items:flex-start;
      gap:12px;
    }

    .ls-tut-v3-icon {
      width:46px;
      height:46px;
      flex:0 0 auto;
      display:grid;
      place-items:center;
      border-radius:14px;
      border:1px solid rgba(218,165,32,.23);
      background:rgba(218,165,32,.09);
      font-size:23px;
    }

    .ls-tut-v3-copy {
      margin:0;
      color:var(--text);
      font-size:15px;
      font-weight:520;
      line-height:1.58;
    }

    .ls-tut-v3-progress {
      display:flex;
      gap:3px;
      padding:0 18px 12px;
    }

    .ls-tut-v3-progress span {
      height:5px;
      flex:1;
      border-radius:999px;
      background:var(--border);
    }

    .ls-tut-v3-progress span.done,
    .ls-tut-v3-progress span.active {
      background:var(--gold);
    }

    .ls-tut-v3-footer {
      padding:12px 18px 16px;
      border-top:1px solid var(--border);
    }

    .ls-tut-v3-controls {
      display:grid;
      grid-template-columns:1fr 1.25fr;
      gap:9px;
    }

    .ls-tut-v3-controls.one {
      grid-template-columns:1fr;
    }

    .ls-tut-v3-controls button {
      min-height:46px;
      font-size:12px;
      font-weight:850;
    }

    .ls-tut-v3-skip {
      margin-top:10px;
      width:100%;
      min-height:42px;
      border:1px solid var(--border);
      border-radius:11px;
      background:var(--panel-2);
      color:var(--text);
      font-family:inherit;
      font-size:12px;
      font-weight:800;
      cursor:pointer;
      padding:9px;
    }

    .ls-tut-v3-target-note {
      margin-top:10px;
      padding:10px 11px;
      border-radius:10px;
      border:1px solid var(--border);
      color:var(--text);
      font-size:14px;
      line-height:1.55;
      background:rgba(255,255,255,.02);
    }

    .ls-tut-recovery-flow {
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:7px;
      margin-top:12px;
    }

    .ls-tut-recovery-flow div {
      padding:9px 7px;
      border:1px solid var(--border);
      border-radius:11px;
      text-align:center;
      background:rgba(255,255,255,.02);
    }

    .ls-tut-recovery-flow b,
    .ls-tut-recovery-flow span {
      display:block;
    }

    .ls-tut-recovery-flow b {
      font-size:18px;
      margin-bottom:5px;
    }

    .ls-tut-recovery-flow span {
      color:var(--text-dim);
      font-size:10px;
      line-height:1.3;
    }

    body.ls-vision-large #lsTutorialV3Card .ls-tut-v3-copy {
      font-size:17px;
    }

    body.ls-vision-xlarge #lsTutorialV3Card .ls-tut-v3-copy {
      font-size:19px;
    }

    body.ls-font-strong #lsTutorialV3Card {
      font-weight:650;
    }

    body.ls-high-contrast #lsTutorialV3Card {
      border-color:rgba(255,255,255,.34);
      background:#07090d;
    }

    .ls-pc-tutorial-btn { display:inline-block; }

    @media(max-width:768px) {
      .ls-pc-tutorial-btn { display:none !important; }
    }

    @media(max-width:700px) {
      #lsTutorialV3Card {
        bottom:8px;
        width:calc(100vw - 14px);
        border-radius:16px;
      }

      #lsTutorialV3Shade {
        background:rgba(3,5,9,.34);
        backdrop-filter:none;
      }

      .ls-tut-v3-head {
        padding:14px 14px 8px;
      }

      .ls-tut-v3-head h2 {
        font-size:20px;
      }

      .ls-tut-v3-body {
        padding:6px 14px 12px;
      }

      .ls-tut-v3-copy {
        font-size:15px;
      }

      .ls-tut-v3-progress {
        padding:0 14px 10px;
      }

      .ls-tut-v3-footer {
        padding:10px 14px 13px;
      }

      .ls-tutorial-spotlight {
        outline-offset:2px !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function clearTutorialV31Spotlight() {
  document.querySelectorAll(".ls-tutorial-spotlight").forEach(el => {
    el.classList.remove("ls-tutorial-spotlight");
  });
}

function findTutorialV31Target(step) {
  if (!step?.selector) return null;

  const candidates = document.querySelectorAll(step.selector);
  for (const el of candidates) {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden"
    ) {
      return el;
    }
  }

  return null;
}

function findMobileMenuTutorialButton(label) {
  const panel = document.getElementById("mobileMenuPanel");
  if (!panel) return null;

  return Array.from(panel.querySelectorAll("button"))
    .find(btn => btn.textContent.includes(label)) || null;
}

function findSettingsSectionByText(text) {
  return Array.from(document.querySelectorAll(".ls-settings-section"))
    .find(section => section.textContent.includes(text)) || null;
}

async function prepareTutorialV31Step(step) {
  clearTutorialV31Spotlight();

  // Cerramos Configuración cuando dejamos ese tramo del recorrido.
  if (!["comfortable-vision"].includes(step.key)) {
    const settingsOverlay = document.querySelector("#globalModalWrap .modal-overlay");
    if (settingsOverlay && settingsOverlay.textContent.includes("Configuración")) {
      const wrap = document.getElementById("globalModalWrap");
      if (wrap) wrap.innerHTML = "";
    }
  }

  if (step.tab && currentTab !== step.tab) {
    switchTab(step.tab);

    // Para Perfil no frenamos el tutorial esperando toda la carga.
    const wait = step.tab === "profile" ? 70 : 120;
    await new Promise(resolve => setTimeout(resolve, wait));
  }

  // Novedades y Configuración: en móvil abrimos el ☰ REAL.
  if (window.innerWidth <= 700 && ["news","settings"].includes(step.key)) {
    if (!document.getElementById("mobileMenuPanel")) {
      toggleMobileMenu();
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const mobileTarget =
      step.key === "news"
        ? findMobileMenuTutorialButton("Novedades")
        : findMobileMenuTutorialButton("Configuración");

    if (mobileTarget) {
      mobileTarget.classList.add("ls-tutorial-spotlight");
      return mobileTarget;
    }
  } else if (window.innerWidth <= 700 && document.getElementById("mobileMenuPanel")) {
    closeMobileMenu();
  }

  // Visión cómoda: abrimos Configuración REAL para que el usuario la vea.
  if (step.key === "comfortable-vision") {
    if (document.getElementById("mobileMenuPanel")) closeMobileMenu();

    openLiveScrollSettings();
    await new Promise(resolve => setTimeout(resolve, 60));

    // El tutorial queda arriba del modal, pero quitamos el velo para que
    // Configuración se vea claramente detrás.
    const shade = document.getElementById("lsTutorialV3Shade");
    if (shade) shade.style.display = "none";

    const section = findSettingsSectionByText("Visión cómoda");
    if (section) {
      section.classList.add("ls-tutorial-spotlight");
      try {
        section.scrollIntoView({ behavior:"smooth", block:"center" });
      } catch (_) {}
      return section;
    }
  }

  const shade = document.getElementById("lsTutorialV3Shade");
  if (shade) shade.style.display = "";

  let target = findTutorialV31Target(step);

  // Editar perfil puede aparecer después de que el perfil termina de cargar.
  if (!target && step.key === "profile-edit") {
    for (let i = 0; i < 5 && !target; i++) {
      await new Promise(resolve => setTimeout(resolve, 80));
      target = findTutorialV31Target(step);
    }
  }

  if (target) {
    target.classList.add("ls-tutorial-spotlight");

    // Los controles del video deben quedarse EXACTAMENTE donde están.
    // Solo les dibujamos una marca simple; no los movemos ni centramos.
    if (step.key !== "feed-actions") {
      try {
        target.scrollIntoView({
          behavior:"smooth",
          block:"center",
          inline:"center"
        });
      } catch (_) {}
    }
  }

  return target;
}

function showTutorialModal() {
  installTutorialV31Styles();

  lsTutorialV31Steps = [...LS_TUTORIAL_V31_STEPS];
  tutorialStepIndex = 0;

  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";

  document.getElementById("lsTutorialV3Layer")?.remove();

  const layer = document.createElement("div");
  layer.id = "lsTutorialV3Layer";

  layer.innerHTML = `
    <div id="lsTutorialV3Shade"></div>

    <div id="lsTutorialV3Card">
      <div class="ls-tut-v3-head">
        <div>
          <div class="ls-tut-v3-eye" id="lsTutorialV3Eyebrow"></div>
          <h2 id="lsTutorialV3Title"></h2>
        </div>
        <div class="ls-tut-v3-count" id="lsTutorialV3Count"></div>
      </div>

      <div class="ls-tut-v3-body">
        <div class="ls-tut-v3-row">
          <div class="ls-tut-v3-icon" id="lsTutorialV3Icon"></div>
          <p class="ls-tut-v3-copy" id="lsTutorialV3Text"></p>
        </div>

        <div id="lsTutorialV3Extra"></div>

        <div class="ls-tut-v3-target-note" id="lsTutorialV3TargetNote">
          La zona resaltada es la parte real de LiveScroll que estamos explicando.
        </div>
      </div>

      <div class="ls-tut-v3-progress" id="lsTutorialV3Progress"></div>

      <div class="ls-tut-v3-footer">
        <div class="ls-tut-v3-controls" id="lsTutorialV3Controls">
          <button class="btn-outline" id="lsTutorialV3Back" onclick="tutorialPreviousStep()">Anterior</button>
          <button class="btn" id="lsTutorialV3Next" onclick="tutorialNextStep()">Siguiente</button>
        </div>

        <div class="ls-tut-v3-skip" id="lsTutorialV3Required">
          Recorrido obligatorio · aparece una sola vez
        </div>
      </div>
    </div>`;

  document.body.appendChild(layer);
  renderTutorialStep();
}

async function renderTutorialStep() {
  const step = lsTutorialV31Steps[tutorialStepIndex];
  if (!step) return;

  const first = tutorialStepIndex === 0;
  const last = tutorialStepIndex === lsTutorialV31Steps.length - 1;

  document.getElementById("lsTutorialV3Eyebrow").textContent = step.eyebrow;
  document.getElementById("lsTutorialV3Title").textContent = step.title;
  document.getElementById("lsTutorialV3Count").textContent =
    `${tutorialStepIndex + 1} de ${lsTutorialV31Steps.length}`;
  document.getElementById("lsTutorialV3Icon").textContent = step.icon;
  document.getElementById("lsTutorialV3Text").textContent = step.text;

  const extra = document.getElementById("lsTutorialV3Extra");
  extra.innerHTML = step.visual === "recovery" ? `
    <div class="ls-tut-recovery-flow">
      <div><b>1️⃣</b><span>Pedís recuperar</span></div>
      <div><b>📧</b><span>Abrís el correo</span></div>
      <div><b>🔐</b><span>Creás una clave nueva</span></div>
    </div>
  ` : "";

  document.getElementById("lsTutorialV3Progress").innerHTML =
    lsTutorialV31Steps.map((_, i) => `
      <span class="${i < tutorialStepIndex ? "done" : i === tutorialStepIndex ? "active" : ""}"></span>
    `).join("");

  const back = document.getElementById("lsTutorialV3Back");
  const next = document.getElementById("lsTutorialV3Next");
  const controls = document.getElementById("lsTutorialV3Controls");
  const note = document.getElementById("lsTutorialV3TargetNote");

  back.style.display = first ? "none" : "";
  next.textContent = last ? "Entrar a LiveScroll" : "Siguiente";
  controls.classList.toggle("one", first || last);

  const target = await prepareTutorialV31Step(step);

  if (step.key === "comfortable-vision") {
    note.style.display = "";
    note.textContent = "Esta es la opción real de Visión cómoda dentro de Configuración.";
  } else if (step.selector) {
    note.style.display = "";
    note.textContent = target
      ? "La zona resaltada es la parte real de LiveScroll que estamos explicando."
      : "La función existe, aunque en este momento no haya un elemento disponible para resaltar.";
  } else {
    note.style.display = "none";
  }
}

function tutorialPreviousStep() {
  if (tutorialStepIndex <= 0) return;
  tutorialStepIndex--;
  renderTutorialStep();
}

function tutorialNextStep() {
  if (tutorialStepIndex < lsTutorialV31Steps.length - 1) {
    tutorialStepIndex++;
    renderTutorialStep();
    return;
  }

  handleAcceptTutorial();
}

async function handleAcceptTutorial() {
  clearTutorialV31Spotlight();

  document.getElementById("lsTutorialV3Layer")?.remove();

  if (document.getElementById("mobileMenuPanel")) {
    closeMobileMenu();
  }

  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";

  if (currentUser?.id) {
    await sb.rpc("acknowledge_content", {
      p_user_id: currentUser.id,
      p_content_key: "tutorial"
    });
  }

  if (typeof switchTab === "function") {
    switchTab("feed");
  }

  checkPendingContent();
}

function showTermsUpdateModal() {
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="modal-overlay" style="z-index:130;">
      <div class="modal-box">
        <div class="modal-box-header"><h2>📋 Actualizamos los Términos</h2></div>
        <div class="modal-box-body">
        <p style="color:var(--text-dim); font-size:13px;">Cambiamos nuestros Términos y Condiciones. Por favor, revisalos antes de seguir usando LiveScroll.</p>
        <a href="terminos.html" target="_blank" rel="noopener noreferrer" class="btn-outline" style="display:block; text-align:center; text-decoration:none; margin-bottom:14px;">Leer Términos y Condiciones</a>
        <div class="field" style="display:flex; align-items:flex-start; gap:8px;">
          <input type="checkbox" id="acceptNewTerms" style="margin-top:3px;">
          <label for="acceptNewTerms" style="font-size:12px; color:var(--text-dim); cursor:pointer;">Leí y acepto los Términos y Condiciones actualizados.</label>
        </div>
        <div id="acceptTermsError" class="error-msg"></div>
        </div>
        <div class="modal-box-footer">
          <button class="btn" style="width:100%;" onclick="handleAcceptNewTerms()">Continuar</button>
        </div>
      </div>
    </div>`;
}

async function handleAcceptNewTerms() {
  const errEl = document.getElementById("acceptTermsError");
  if (!document.getElementById("acceptNewTerms").checked) {
    errEl.textContent = "Tenés que tildar el casillero para continuar.";
    return;
  }
  await sb.rpc("acknowledge_content", { p_user_id: currentUser.id, p_content_key: "terms" });
  document.getElementById("globalModalWrap").innerHTML = "";
  checkPendingContent(); // por si también hay tutorial o changelog pendiente, se muestra después
}


const LS_SECONDARY_REVISION_PREFIX = "[REVISION_SECUNDARIA]";

function isSecondaryRevisionEntry(entry) {
  return String(entry?.content || "").trim().startsWith(LS_SECONDARY_REVISION_PREFIX);
}

function cleanChangelogContent(content) {
  let value = String(content || "").trim();

  if (value.startsWith(LS_SECONDARY_REVISION_PREFIX)) {
    value = value.slice(LS_SECONDARY_REVISION_PREFIX.length).trim();
  }

  // Evitamos repetir el nombre de la app dentro de cada punto.
  value = value
    .replace(/^Revisión secundaria de LiveScroll\s+[0-9.]+\s+/i, "")
    .replace(/\bLiveScroll\b(?=\s+continúa|\s+mantiene|\s+fue)/gi, "La app");

  return value;
}

function showLiveScroll7PulseUpdate(entries) {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  const categoryMeta = {
    nuevo:{ label:"NUEVO", icon:"✦", color:"#ff435c" },
    actualizado:{ label:"EVOLUCIÓN", icon:"↗", color:"#f4c95d" },
    emergencia:{ label:"ALERTA RESUELTA", icon:"!", color:"#fb923c" },
    reparado:{ label:"ESTABILIZADO", icon:"✓", color:"#7dd3fc" },
    proximamente:{ label:"PRÓXIMA EVOLUCIÓN", icon:"◌", color:"#c4b5fd" }
  };
  const byVersion = {};

  (Array.isArray(entries) ? entries : []).forEach(entry => {
    const internal = Number(entry.version || 0);
    if (!byVersion[internal]) {
      byVersion[internal] = {
        display:String(entry.display_version || `${internal}.0.0`),
        releaseDate:entry.release_date || null,
        lines:[]
      };
    }
    const content = cleanChangelogContent(entry.content);
    const duplicate = byVersion[internal].lines.some(line =>
      line.category === entry.category && line.content === content
    );
    if (content && !duplicate) {
      byVersion[internal].lines.push({ category:String(entry.category || "actualizado"), content });
    }
  });

  const versions = Object.keys(byVersion).map(Number).sort((a,b) => a-b);
  const newest = versions.at(-1) || 0;
  const newestLabel = byVersion[newest]?.display || "7";
  const multipleVersions = versions.length > 1;
  const totalSignals = versions.reduce((sum, version) => sum + byVersion[version].lines.length, 0);
  window.__lsChangelogShownVersion = Math.max(Number(window.__lsChangelogShownVersion || 0), newest);

  const formatDate = value => {
    if (!value) return "";
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("es-AR", { day:"2-digit", month:"short", year:"numeric" });
  };

  wrap.innerHTML = `
    <div id="changelogOverlay" class="ls7-pulse-update-overlay ls-modal-locked" data-modal-locked="1">
      <div class="ls7-pulse-update-atmosphere" aria-hidden="true"><i></i><i></i><i></i></div>
      <div id="changelogBox" class="ls7-pulse-update-box">
        <div class="ls7-pulse-update-scan" aria-hidden="true"></div>
        <header class="ls7-pulse-update-head">
          <div class="ls7-pulse-update-core" aria-hidden="true">
            <span>7</span><i></i><b></b>
          </div>
          <div class="ls7-pulse-update-copy">
            <div class="ls7-pulse-update-kicker"><i></i> EVOLUCIÓN DE LIVESCROLL 7</div>
            <h2>${multipleVersions ? "LiveScroll 7 evolucionó" : "Nueva evolución disponible"}</h2>
            <p>${multipleVersions
              ? `Hay nuevas mejoras esperando por vos. Reunimos ${versions.length} etapas y ${totalSignals} cambios desde tu última visita.`
              : `Hay nuevas mejoras esperando por vos. La experiencia avanzó a ${escapeHtml(newestLabel)}.`}</p>
          </div>
        </header>

        <div class="ls7-pulse-update-progress" aria-hidden="true"><span></span><i></i><b></b></div>

        <div class="ls7-pulse-update-body">
          ${versions.map((version, versionIndex) => {
            const info = byVersion[version];
            return `
              <section class="ls7-pulse-update-version" style="--pulse-delay:${versionIndex * 85}ms">
                <div class="ls7-pulse-update-version-head">
                  <div>
                    <small>ETAPA ${String(versionIndex + 1).padStart(2,"0")}</small>
                    <strong>LiveScroll ${escapeHtml(info.display)}</strong>
                  </div>
                  <div>
                    ${info.releaseDate ? `<time>${escapeHtml(formatDate(info.releaseDate))}</time>` : ""}
                    ${version === newest ? `<span>ACTUAL</span>` : ""}
                  </div>
                </div>
                <div class="ls7-pulse-update-lines">
                  ${info.lines.map((line, lineIndex) => {
                    const meta = categoryMeta[line.category] || { label:String(line.category || "CAMBIO").toUpperCase(), icon:"•", color:"#a3a3a3" };
                    return `
                      <div class="ls7-pulse-update-line" style="--line-color:${meta.color};--line-delay:${(versionIndex * 85) + (lineIndex * 45)}ms">
                        <span>${meta.icon}</span>
                        <div><small>${escapeHtml(meta.label)}</small><p>${escapeHtml(line.content)}</p></div>
                      </div>`;
                  }).join("")}
                </div>
              </section>`;
          }).join("")}
        </div>

        <footer class="ls7-pulse-update-foot">
          <button onclick="handleAcceptChangelog()"><span>Descubrir los cambios</span><b>→</b></button>
          <small>LIVE<span>SCROLL</span> 7 · TU EXPERIENCIA SIGUE EVOLUCIONANDO</small>
        </footer>
      </div>
    </div>`;
}

function showChangelogModal(entries) {
  applyLiveScrollSettings();
  const allEntries = Array.isArray(entries) ? entries : [];

  // LiveScroll 7 utiliza una experiencia propia. LiveScroll 6 conserva su
  // cartel clásico y todo el comportamiento de confirmación existente.
  if (isLiveScroll7App()) {
    const version7Entries = allEntries.filter(entry =>
      /^7(?:\.|$)/.test(String(entry?.display_version || ""))
    );
    if (version7Entries.length) showLiveScroll7PulseUpdate(version7Entries);
    return;
  }
  const secondaryEntries = allEntries.filter(isSecondaryRevisionEntry);

  // Si este aviso corresponde SOLO a una revisión secundaria,
  // lo mostramos separado de la publicación principal de la versión.
  if (secondaryEntries.length && secondaryEntries.length === allEntries.length) {
    const wrap = document.getElementById("globalModalWrap");
    if (!wrap) return;

    const newest = secondaryEntries.reduce(
      (max, e) => Math.max(max, Number(e.version || 0)),
      0
    );

    const displayVersion =
      secondaryEntries.find(e => e.display_version)?.display_version ||
      secondaryEntries[0]?.display_version ||
      "";

    const cleaned = secondaryEntries
      .map(e => cleanChangelogContent(e.content))
      .filter(Boolean)
      // El encabezado ya comunica que la revisión fue aprobada.
      .filter(c => !/^completada y aprobada\.?$/i.test(c))
      .filter((c, i, arr) => arr.indexOf(c) === i);

    window.__lsChangelogShownVersion = Math.max(
      Number(window.__lsChangelogShownVersion || 0),
      newest
    );

    wrap.innerHTML = `
      <div id="changelogOverlay" class="modal-overlay ls-modal-locked" data-modal-locked="1" style="z-index:140;">
        <div id="changelogBox" class="modal-box" style="
          max-width:480px;
          max-height:88vh;
          overflow:hidden;
          display:flex;
          flex-direction:column;
          border:1px solid rgba(96,165,250,.24);
          box-shadow:0 24px 80px rgba(0,0,0,.52),0 0 36px rgba(59,130,246,.08);
        ">
          <div class="modal-box-header" style="align-items:flex-start;">
            <div>
              <div style="
                display:inline-flex;
                align-items:center;
                gap:6px;
                font-size:9px;
                font-weight:900;
                letter-spacing:.1em;
                color:#7dd3fc;
                border:1px solid rgba(125,211,252,.22);
                background:rgba(125,211,252,.06);
                padding:4px 8px;
                border-radius:999px;
                margin-bottom:9px;
              ">🛡️ REVISIÓN SECUNDARIA</div>

              <h2 style="margin:0;font-size:22px;">Seguridad revisada y aprobada</h2>

              <div style="font-size:11px;color:var(--text-dim);margin-top:5px;">
                ${escapeHtml(displayVersion)} · revisión adicional
              </div>
            </div>
          </div>

          <div class="modal-box-body" style="overflow-y:auto;min-height:0;">
            <p style="
              margin:0 0 14px;
              font-size:12px;
              line-height:1.55;
              color:var(--text-dim);
            ">
              Completamos una nueva revisión interna enfocada en protección,
              permisos y funcionamiento seguro.
            </p>

            <div style="
              border:1px solid rgba(96,165,250,.18);
              background:rgba(59,130,246,.045);
              border-radius:14px;
              padding:12px 13px;
            ">
              ${cleaned.map(c => `
                <div style="
                  display:flex;
                  align-items:flex-start;
                  gap:8px;
                  font-size:12px;
                  line-height:1.5;
                  color:var(--text-dim);
                  margin:${cleaned.indexOf(c) === cleaned.length - 1 ? "0" : "0 0 9px"};
                ">
                  <span style="color:#60a5fa;font-weight:900;">✓</span>
                  <span>${escapeHtml(c)}</span>
                </div>
              `).join("")}
            </div>

            <div style="
              margin-top:12px;
              font-size:10px;
              color:var(--text-dim);
              opacity:.85;
              text-align:center;
            ">
              Sin cambios necesarios de tu parte.
            </div>
          </div>

          <div class="modal-box-footer">
            <button class="btn" style="width:100%;" onclick="handleAcceptChangelog()">
              Entendido ✓
            </button>
          </div>
        </div>
      </div>`;
    return;
  }

  const labels = {
    nuevo: { title: "🆕 Nuevo", color: "var(--green)" },
    actualizado: { title: "🔄 Mejora", color: "var(--gold)" },
    emergencia: { title: "⚠️ Reparación de emergencia", color: "#facc15" },
    reparado: { title: "🛠️ Reparado", color: "#7dd3fc" },
    proximamente: { title: "🔜 Próximamente", color: "var(--text-dim)" }
  };

  const byVersion = {};

  (entries || []).forEach(e => {
    const version = Number(e.version || 0);
    if (!byVersion[version]) {
      byVersion[version] = {
        display:e.display_version || null,
        releaseDate:e.release_date || null,
        cats:{}
      };
    }
    if (e.display_version && !byVersion[version].display) {
      byVersion[version].display = e.display_version;
    }
    if (e.release_date && !byVersion[version].releaseDate) {
      byVersion[version].releaseDate = e.release_date;
    }
    const normalizedCategory = e.category === "emergencia" ? "reparado" : e.category;
    byVersion[version].cats[normalizedCategory] = byVersion[version].cats[normalizedCategory] || [];
    const cleanedContent = cleanChangelogContent(e.content);
    if (cleanedContent && !byVersion[version].cats[normalizedCategory].includes(cleanedContent)) {
      byVersion[version].cats[normalizedCategory].push(cleanedContent);
    }
  });

  const versions = Object.keys(byVersion).map(Number).sort((a,b) => a-b);
  const multipleVersions = versions.length > 1;
  const newest = versions[versions.length - 1];
  const newestLabel = byVersion[newest]?.display || "";
  const isNextEra = versions.some(v => {
    const label = byVersion[v]?.display || "";
    const majorMinor = label.split(".").map(Number);
    return (majorMinor[0] === 5 && majorMinor[1] >= 4) || majorMinor[0] >= 6;
  });

  // Versiones anteriores al camino a 6 conservan el modal clásico.
  if (!isNextEra) {
    const wrap = document.getElementById("globalModalWrap");
    wrap.innerHTML = `
      <div id="changelogOverlay" class="modal-overlay" style="transition:opacity .35s ease;">
        <div id="changelogBox" class="modal-box" style="max-width:440px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;transition:transform .35s ease,opacity .35s ease;">
          <div class="modal-box-header">
            <div>
              <h2 style="margin:0;">${multipleVersions ? "👋 Mientras no estabas..." : "✨ Novedades"}</h2>
              ${multipleVersions ? `<div style="font-size:11px;color:var(--text-dim);margin-top:4px;">Mirá todo lo que fuimos sumando desde tu última visita.</div>` : ""}
            </div>
          </div>
          <div class="modal-box-body" style="overflow-y:auto;min-height:0;">
            ${versions.map(v => {
              const info=byVersion[v];
              const label=info.display || `${v}.0.0`;
              return `<div style="margin-bottom:20px;padding-bottom:17px;border-bottom:1px solid var(--border);">
                <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text);font-weight:700;margin-bottom:10px;">LiveScroll ${escapeHtml(label)}</div>
                ${["nuevo","actualizado","reparado","proximamente"].map(cat => (info.cats[cat]?.length || cat === "reparado") ? `
                  <div style="margin-bottom:11px;">
                    <div style="font-weight:600;font-size:12px;color:${labels[cat]?.color || "var(--text-dim)"};margin-bottom:5px;">${labels[cat]?.title || escapeHtml(cat)}</div>
                    ${(info.cats[cat]?.length ? info.cats[cat] : ["No hubo ninguna reparación en esta actualización."]).map(c => `<div style="font-size:13px;color:var(--text-dim);margin-bottom:5px;line-height:1.45;">• ${escapeHtml(c)}</div>`).join("")}
                  </div>`:"").join("")}
              </div>`;
            }).join("")}
          </div>
          <div class="modal-box-footer"><button class="btn" style="width:100%;" onclick="handleAcceptChangelog()">${multipleVersions ? "Ya estoy al día ✓" : "Aceptar"}</button></div>
        </div>
      </div>`;
    return;
  }

  const stageNames = {
    "5.4.6":"PERFORMANCE",
    "5.5.7":"IDENTITY",
    "5.6.8":"COLLECTION",
    "5.7.9":"CONNECTED",
    "5.8.0":"LIVE",
    "5.8.1":"SECURITY",
    "5.8.2":"FINANCIAL",
    "5.8.6":"CREATOR ACCESS",
    "5.8.7":"DIRECTOS CLEANUP",
    "5.8.8":"MOBILE STABILITY",
    "5.8.9":"ROAD TO 5.9",
    "5.9.0":"ROAD TO 6",
    "5.9.1":"VISUAL EVOLUTION",
    "5.9.2":"FEED EXPERIENCE",
    "5.9.3":"IDENTITY EXPERIENCE",
    "5.9.4":"MOTION UPGRADE",
    "5.9.5":"SIGNATURE MOTION",
    "5.9.6":"ACCESS EVOLUTION",
    "5.9.7":"NAVIGATION EVOLUTION",
    "5.9.8":"SOCIAL PULSE",
    "5.9.9":"VIDEO REVISION",
    "6.0.0":"NEW ERA",
    "6.0.1v":"CORE REVIEW",
    "6.0.2v":"ANDROID READY",
    "6.1.2":"NUBE LIVESCROLL",
    "6.1.3":"ACTUALIZACIÓN EN VIVO",
    "6.1.4":"CONEXIÓN CONTINUA",
    "6.2.2":"PROFILE PERFORMANCE"
  };
  const stage = stageNames[newestLabel] || "ACTUALIZACIÓN";

  const formatLaunchDate = (value) => {
    if (!value) return "";
    const d = new Date(`${value}T12:00:00`);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("es-AR", {
      day:"2-digit",
      month:"short",
      year:"numeric"
    });
  };

  const wrap = document.getElementById("globalModalWrap");

  wrap.innerHTML = `
    <div id="changelogOverlay" class="ls-next-era-changelog">
      <div id="changelogBox" class="ls-next-era-box">
        <div class="ls-next-era-scan"></div>

        <div class="ls-next-era-head">
          <div class="ls-next-era-kicker">LIVE SCROLL · ACTUALIZACIÓN</div>
          <h2 class="ls-next-era-title">${multipleVersions ? "Mientras no estabas..." : `${escapeHtml(newestLabel)} · ${stage}`}</h2>
          <div class="ls-next-era-sub">
            ${multipleVersions
              ? "Te perdiste algunas etapas del camino. Acá tenés todo lo que cambió desde la última vez que estuviste."
              : newestLabel === "6.0.0"
                ? "Llegamos. Bienvenido a la nueva era de LiveScroll."
                : newestLabel === "6.0.1v"
                  ? "LiveScroll 6 refuerza su núcleo para responder más rápido, cargar mejor y proteger cada cuenta."
                  : newestLabel === "6.0.2v"
                    ? "LiveScroll comienza su preparación para llegar a Android con permisos claros y mayor compatibilidad."
                : newestLabel === "5.8.1"
                  ? "Una actualización enfocada en seguridad, privacidad y protección de tu cuenta."
                  : newestLabel === "5.8.2"
                    ? "Los puntos evolucionan: más recompensas, Boost más accesible y una economía más clara."
                    : newestLabel === "5.8.6"
                      ? "Usuarios y Creadores ahora tienen accesos, perfiles y herramientas claramente diferenciados."
                    : newestLabel === "5.8.7"
                      ? "Directos se simplifica y queda enfocado en las integraciones de Kick y Twitch."
                    : newestLabel === "5.8.8"
                      ? "Una actualización enfocada en estabilidad móvil, pantallas verticales y navegación más segura."
                    : "Una nueva etapa del camino hacia LiveScroll 6 acaba de comenzar."}
          </div>
        </div>

        <div class="ls-next-era-body">
          ${versions.map(v => {
            const info=byVersion[v];
            const label=info.display || `${v}.0.0`;
            return `
              <div class="ls-next-era-version">
                <div class="ls-next-era-version-head">
                  <div>
                    <div class="ls-next-era-version-name">LiveScroll ${escapeHtml(label)}</div>
                    ${info.releaseDate ? `<div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-dim);margin-top:3px;">${escapeHtml(formatLaunchDate(info.releaseDate))}</div>` : ""}
                  </div>
                  ${v === newest ? `<span class="ls-next-era-latest">MÁS RECIENTE</span>` : ""}
                </div>
                ${["nuevo","actualizado","reparado","proximamente"].map(cat => (info.cats[cat]?.length || cat === "reparado") ? `
                  <div class="ls-next-era-category">
                    <div class="ls-next-era-category-title" style="color:${labels[cat]?.color || "var(--text-dim)"}">${labels[cat]?.title || escapeHtml(cat)}</div>
                    ${(info.cats[cat]?.length ? info.cats[cat] : ["No hubo ninguna reparación en esta actualización."]).map(c => `<div class="ls-next-era-line">• ${escapeHtml(c)}</div>`).join("")}
                  </div>`:"").join("")}
              </div>`;
          }).join("")}
        </div>

        <div class="ls-next-era-foot">
          <button class="ls-next-era-btn" onclick="handleAcceptChangelog()">
            ${multipleVersions ? "Ya estoy al día ✓" : newestLabel === "6.0.0" ? "Entrar a la nueva era →" : newestLabel.startsWith("6.") ? "Continuar en LiveScroll 6 →" : "Continuar el camino →"}
          </button>
          <div class="ls-next-era-road">6.1.2 NUBE LIVESCROLL → 6.1.3 ACTUALIZACIÓN EN VIVO → 6.1.4 CONEXIÓN CONTINUA → 6.2.2 PROFILE PERFORMANCE</div>
        </div>
      </div>
    </div>`;
}


// ============================================================
// NOVEDADES — SISTEMA DINÁMICO DESDE 5.8.1
// El cartel toma la versión visible más reciente del historial cuando existe
// una actualización pendiente, evitando quedar clavado en una versión anterior.
// ============================================================

let lsChangelogHistoryObserver = null;

async function openChangelogHistory() {
  if (lsChangelogHistoryObserver) {
    lsChangelogHistoryObserver.disconnect();
    lsChangelogHistoryObserver = null;
  }
  applyLiveScrollSettings();
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked${isLiveScroll7App() ? " ls7-pulse-archive-overlay" : ""}" style="z-index:100;backdrop-filter:none;-webkit-backdrop-filter:none;" data-modal-locked="1">
      <div class="modal-box${isLiveScroll7App() ? " ls7-pulse-archive-box" : ""}" style="max-width:470px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">
        <div class="modal-box-header">
          <div>
            ${isLiveScroll7App() ? `<div class="ls7-pulse-archive-kicker"><i></i> LIVESCROLL 7</div>` : ""}
            <h2 style="margin:0;">${isLiveScroll7App() ? "Historial de Evolución" : "📢 Novedades"}</h2>
            <div style="font-size:10px;color:var(--text-dim);margin-top:3px;">
              ${isLiveScroll7App() ? "Hay nuevas mejoras esperando por vos." : "Versiones y revisiones publicadas"}
            </div>
          </div>
          <button onclick="closeChangelogHistory()" style="background:none;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;">✕</button>
        </div>

        <div class="modal-box-body" style="overflow-y:auto;min-height:0;overscroll-behavior:contain;contain:layout paint style;">
          <div id="changelogHistoryList">Cargando...</div>
        </div>
      </div>
    </div>`;

  const labels = {
    nuevo: { title: "🆕 Nuevo", color: "var(--green)" },
    actualizado: { title: "🔄 Mejora", color: "var(--gold)" },
    emergencia: { title: "⚠️ Reparación de emergencia", color: "#facc15" },
    reparado: { title: "🛠️ Reparado", color: "#7dd3fc" },
    proximamente: { title: "🔜 Próximamente", color: "var(--text-dim)" }
  };

  // Reutiliza el historial que ya pudo cargar el inicio y evita otra consulta igual.
  const { data: allHistoryEntries, error } = await loadStartupChangelogHistory();
  const list = document.getElementById("changelogHistoryList");
  if (!list) return;

  const entries = (Array.isArray(allHistoryEntries) ? allHistoryEntries : []).filter(entry => {
    const display = String(entry?.display_version || "");
    const isVersion7 = /^7(?:\.|$)/.test(display);
    return isLiveScroll7App() ? isVersion7 : !isVersion7;
  });

  if (error || !entries || !entries.length) {
    list.innerHTML = `<p style="color:var(--text-dim);font-size:13px;">${isLiveScroll7App() ? "La primera evolución de LiveScroll 7 todavía no fue publicada." : "Todavía no hay novedades publicadas."}</p>`;
    return;
  }

  const semverParts = (value) => String(value || "0.0.0")
    .split(".")
    .map(n => Number.parseInt(n, 10) || 0);

  const compareSemverDesc = (a, b) => {
    const pa = semverParts(a);
    const pb = semverParts(b);
    const max = Math.max(pa.length, pb.length, 3);

    for (let i = 0; i < max; i++) {
      const av = pa[i] || 0;
      const bv = pb[i] || 0;
      if (av !== bv) return bv - av;
    }

    return 0;
  };

  // Agrupamos primero por versión visible y luego por revisión interna.
  // Así 5.8.3 principal y 5.8.3 revisión secundaria NO quedan mezcladas.
  const byDisplayVersion = {};

  entries.forEach(e => {
    const display = String(e.display_version || `${e.version}.0.0`);
    const internal = Number(e.version || 0);

    if (!byDisplayVersion[display]) {
      byDisplayVersion[display] = {
        display,
        releaseDate:e.release_date || null,
        revisions:{}
      };
    }

    if (!byDisplayVersion[display].releaseDate && e.release_date) {
      byDisplayVersion[display].releaseDate = e.release_date;
    }

    if (!byDisplayVersion[display].revisions[internal]) {
      byDisplayVersion[display].revisions[internal] = {
        internal,
        secondary:false,
        cats:{}
      };
    }

    const revision = byDisplayVersion[display].revisions[internal];
    if (isSecondaryRevisionEntry(e)) revision.secondary = true;

    const cleaned = cleanChangelogContent(e.content);

    revision.cats[e.category] = revision.cats[e.category] || [];

    if (cleaned && !revision.cats[e.category].includes(cleaned)) {
      revision.cats[e.category].push(cleaned);
    }
  });

  const versions = Object.keys(byDisplayVersion).sort(compareSemverDesc);
  const currentDisplayVersion = versions[0];

  const formatReleaseDate = (value) => {
    if (!value) return "";
    const d = new Date(`${value}T12:00:00`);
    return Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleDateString("es-AR", {
          day:"2-digit",
          month:"short",
          year:"numeric"
        });
  };

  const renderSecondaryRevision = (revision) => {
    const allLines = Object.values(revision.cats)
      .flat()
      .filter(Boolean)
      // No repetimos una línea genérica que ya expresa el encabezado.
      .filter(c => !/^completada y aprobada\.?$/i.test(c))
      .filter((c, i, arr) => arr.indexOf(c) === i);

    return `
      <div style="
        margin:12px 0 14px;
        border:1px solid rgba(96,165,250,.20);
        background:linear-gradient(135deg,rgba(59,130,246,.055),rgba(255,255,255,.012));
        border-radius:14px;
        padding:12px 13px;
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px;">
          <div style="
            display:flex;
            align-items:center;
            gap:7px;
            font-size:12px;
            font-weight:900;
            color:#7dd3fc;
          ">
            <span>🛡️</span>
            <span>Revisión secundaria</span>
          </div>

          <span style="
            font-size:8px;
            font-weight:900;
            letter-spacing:.06em;
            color:#93c5fd;
            border:1px solid rgba(147,197,253,.18);
            padding:3px 6px;
            border-radius:999px;
          ">APROBADA</span>
        </div>

        <div style="font-size:10px;color:var(--text-dim);margin-bottom:9px;">
          Seguridad y protección
        </div>

        ${allLines.map(c => `
          <div style="
            display:flex;
            align-items:flex-start;
            gap:7px;
            font-size:12px;
            line-height:1.5;
            color:var(--text-dim);
            margin-bottom:7px;
          ">
            <span style="color:#60a5fa;font-weight:900;">✓</span>
            <span>${escapeHtml(c)}</span>
          </div>
        `).join("")}
      </div>`;
  };

  const renderMainRevision = (revision) => {
    return ["nuevo","actualizado","reparado","proximamente"].map(cat => {
      const lines = revision.cats[cat] || [];
      if (!lines.length && cat !== "reparado") return "";
      const visibleLines = lines.length
        ? lines
        : ["No hubo ninguna reparación en esta actualización."];

      return `
        <div style="margin-bottom:12px;">
          <div style="
            font-weight:700;
            font-size:12px;
            color:${labels[cat]?.color || "var(--text-dim)"};
            margin-bottom:6px;
          ">
            ${labels[cat]?.title || escapeHtml(cat)}
          </div>

          ${visibleLines.map(c => `
            <div style="
              font-size:12px;
              color:var(--text-dim);
              margin-bottom:5px;
              line-height:1.48;
            ">• ${escapeHtml(c)}</div>
          `).join("")}
        </div>`;
    }).join("");
  };

  const renderVersionSection = (display) => {
    const info = byDisplayVersion[display];
    const revisions = Object.values(info.revisions)
      .sort((a, b) => b.internal - a.internal);

    const secondary = revisions.filter(r => r.secondary);
    const main = revisions.filter(r => !r.secondary);
    const groupedMain = { cats:{} };

    main.forEach(revision => {
      Object.entries(revision.cats || {}).forEach(([category, lines]) => {
        const normalizedCategory = category === "emergencia" ? "reparado" : category;
        groupedMain.cats[normalizedCategory] = groupedMain.cats[normalizedCategory] || [];
        (lines || []).forEach(line => {
          if (line && !groupedMain.cats[normalizedCategory].includes(line)) {
            groupedMain.cats[normalizedCategory].push(line);
          }
        });
      });
    });

    const dateText = formatReleaseDate(info.releaseDate);

    return `
      <section class="ls-changelog-history-version${isLiveScroll7App() ? " ls7-pulse-archive-version" : ""}" style="
        margin-bottom:18px;
        padding-bottom:18px;
        border-bottom:1px solid var(--border);
        content-visibility:auto;
        contain-intrinsic-size:1px 260px;
        contain:layout paint style;
      ">
        <div style="
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:10px;
          margin-bottom:10px;
        ">
          <div>
            <div style="
              font-family:'JetBrains Mono',monospace;
              font-size:14px;
              color:var(--text);
              font-weight:900;
            ">${escapeHtml(display)}</div>

            ${dateText ? `
              <div style="
                font-family:'JetBrains Mono',monospace;
                font-size:9px;
                color:var(--text-dim);
                margin-top:3px;
              ">${escapeHtml(dateText)}</div>
            ` : ""}
          </div>

          ${display === currentDisplayVersion
            ? `<span style="
                font-size:9px;
                font-weight:900;
                color:${isLiveScroll7App() ? "#fff" : "#12130f"};
                background:${isLiveScroll7App() ? "linear-gradient(135deg,#ff2345,#a70020)" : "var(--green)"};
                padding:3px 8px;
                border-radius:20px;
                letter-spacing:.04em;
              ">ACTUAL</span>`
            : ""}
        </div>

        ${secondary.map(renderSecondaryRevision).join("")}

        ${main.length ? `
          <div style="
            padding:${secondary.length ? "4px 2px 0" : "0 2px"};
          ">
            ${renderMainRevision(groupedMain)}
          </div>
        ` : ""}
      </section>`;
  };

  // No insertamos todo el historial en el DOM de una sola vez. Agregamos
  // pocas versiones por tanda cuando el usuario se acerca al final.
  const batchSize = window.__liveScrollLegacyMode ? 4 : 6;
  let renderedCount = 0;

  list.innerHTML = `<div id="changelogHistoryItems"></div><div id="changelogHistorySentinel" style="height:1px;"></div>`;
  const itemsWrap = document.getElementById("changelogHistoryItems");
  const sentinel = document.getElementById("changelogHistorySentinel");

  const appendNextChangelogBatch = () => {
    if (!itemsWrap || renderedCount >= versions.length) {
      lsChangelogHistoryObserver?.disconnect();
      lsChangelogHistoryObserver = null;
      sentinel?.remove();
      return;
    }

    const nextVersions = versions.slice(renderedCount, renderedCount + batchSize);
    itemsWrap.insertAdjacentHTML("beforeend", nextVersions.map(renderVersionSection).join(""));
    renderedCount += nextVersions.length;

    if (renderedCount >= versions.length) {
      lsChangelogHistoryObserver?.disconnect();
      lsChangelogHistoryObserver = null;
      sentinel?.remove();
    }
  };

  appendNextChangelogBatch();

  if (sentinel?.isConnected && "IntersectionObserver" in window) {
    const scrollRoot = sentinel.closest(".modal-box-body");
    lsChangelogHistoryObserver = new IntersectionObserver(entriesList => {
      if (entriesList.some(entry => entry.isIntersecting)) appendNextChangelogBatch();
    }, { root:scrollRoot, rootMargin:"500px 0px", threshold:0 });
    lsChangelogHistoryObserver.observe(sentinel);
  } else {
    while (renderedCount < versions.length) appendNextChangelogBatch();
  }
}


function closeChangelogHistory() {
  if (lsChangelogHistoryObserver) {
    lsChangelogHistoryObserver.disconnect();
    lsChangelogHistoryObserver = null;
  }
  document.getElementById("globalModalWrap").innerHTML = "";
}

async function handleAcceptChangelog() {
  const shownVersion = Number(window.__lsChangelogShownVersion || 0);
  const seenKey = currentUser?.id
    ? `livescroll_changelog_seen_${currentUser.id}`
    : null;

  const { error } = await sb.rpc("acknowledge_content", {
    p_user_id: currentUser.id,
    p_content_key: "changelog"
  });

  // El backend sigue siendo la fuente principal, pero el dispositivo
  // guarda también qué versión vio. Esto evita que una falla puntual
  // del RPC vuelva a ocultar/romper el flujo automático.
  if (seenKey && shownVersion > 0) {
    localStorage.setItem(seenKey, String(shownVersion));
    await sb.rpc("set_my_changelog_seen_version", { p_version:shownVersion });
  }

  if (error) {
    console.warn("No se pudo sincronizar Novedades con el servidor:", error);
  }

  const box = document.getElementById("changelogBox");
  const overlay = document.getElementById("changelogOverlay");

  const continuePendingFlow = () => {
    const wrap = document.getElementById("globalModalWrap");
    if (wrap) wrap.innerHTML = "";

    // No encadenamos otro popup automático en la misma sesión.
    // Lo pendiente queda guardado para el próximo ingreso o accesible desde Novedades.
  };

  if (box && overlay) {
    box.style.transform = "translate(140%, 140%) scale(0.15)";
    box.style.opacity = "0";
    overlay.style.opacity = "0";
    setTimeout(continuePendingFlow, 350);
  } else {
    continuePendingFlow();
  }
}

async function recordDailyChallengeEvent(type, targetId) {
  if (!currentUser?.id || !targetId) return;
  try {
    const { data, error } = await sb.rpc("record_daily_challenge_event", {
      p_event_type:type,
      p_target_id:targetId
    });
    if (!error && data?.ok && document.getElementById("lsDailyChallengeWrap")) {
      loadDailyChallenges();
    }
  } catch (_) {}
}

let lsDailyChallengeRefreshTimer = null;

function getArgentinaDateKey() {
  try {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone:"America/Argentina/Buenos_Aires",
      year:"numeric",
      month:"2-digit",
      day:"2-digit"
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(part => [part.type,part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  } catch (_) {
    return new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0,10);
  }
}

function scheduleDailyChallengeRefresh(challengeDate) {
  if (lsDailyChallengeRefreshTimer) clearTimeout(lsDailyChallengeRefreshTimer);
  lsDailyChallengeRefreshTimer = setTimeout(() => {
    if (!document.getElementById("lsDailyChallengeWrap")) {
      lsDailyChallengeRefreshTimer = null;
      return;
    }
    if (getArgentinaDateKey() !== String(challengeDate || "")) {
      loadDailyChallenges();
      return;
    }
    scheduleDailyChallengeRefresh(challengeDate);
  }, 60000);
}

function getDailyChallengeSummary(data) {
  const isSeven = isLiveScroll7App();
  const challenges = (data?.challenges || []).slice(0, isSeven ? 3 : 1);
  const completed = challenges.filter(item => Number(item.progress) >= Number(item.target)).length;
  const totalProgress = challenges.reduce((sum,item) => sum + Math.min(Number(item.progress),Number(item.target)),0);
  const totalTarget = challenges.reduce((sum,item) => sum + Number(item.target),0);
  return {
    isSeven,
    challenges,
    completed,
    percent:totalTarget ? Math.round(totalProgress / totalTarget * 100) : 0
  };
}

function renderDailyChallengeRows(challenges) {
  return challenges.map(item => {
    const done = Number(item.progress) >= Number(item.target);
    return `<div style="display:grid;grid-template-columns:36px 1fr auto;align-items:center;gap:9px;padding:10px;border:1px solid ${done ? "rgba(34,197,94,.35)" : "var(--border)"};border-radius:12px;background:rgba(255,255,255,.025);">
      <span style="font-size:21px;text-align:center;">${done ? "✅" : item.emoji}</span>
      <strong style="font-size:11px;">${escapeHtml(item.title)}</strong>
      <span style="font:800 9px 'JetBrains Mono',monospace;color:${done ? "var(--green)" : "var(--text-dim)"};">${item.progress}/${item.target}</span>
    </div>`;
  }).join("");
}

async function loadDailyChallenges() {
  const wrap = document.getElementById("lsDailyChallengeWrap");
  if (!wrap || !currentUser?.id) return;

  try {
    const { data, error } = await sb.rpc("get_daily_challenges");
    if (error || !data?.ok || !Array.isArray(data.challenges)) {
      wrap.innerHTML = "";
      return;
    }

    window.__lsDailyChallengeData = data;
    scheduleDailyChallengeRefresh(data.date);
    const summary = getDailyChallengeSummary(data);
    const accent = summary.isSeven ? "#58efff" : "var(--gold)";
    const title = summary.isSeven ? "Pulso Diario" : "Reto de hoy";

    wrap.innerHTML = `
      <button type="button" onclick="openDailyChallengesModal()" aria-label="Abrir ${title}" style="width:100%;min-height:58px;margin-bottom:10px;padding:9px 12px;display:grid;grid-template-columns:36px minmax(0,1fr) auto;align-items:center;gap:10px;border:1px solid ${summary.isSeven ? "rgba(57,231,255,.30)" : "var(--gold-dim)"};border-radius:14px;background:${summary.isSeven ? "linear-gradient(135deg,rgba(14,38,64,.82),rgba(33,13,59,.76))" : "var(--panel)"};color:var(--text);text-align:left;cursor:pointer;">
        <span style="width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:${summary.isSeven ? "rgba(57,231,255,.12)" : "color-mix(in srgb,var(--gold) 10%,transparent)"};font-size:18px;">${summary.isSeven ? "◉" : "🎯"}</span>
        <span style="min-width:0;">
          <span style="display:flex;align-items:center;justify-content:space-between;gap:8px;"><strong style="font-size:11px;">${title}</strong><small style="color:${accent};font:900 8px 'JetBrains Mono',monospace;">${summary.completed}/${summary.challenges.length}</small></span>
          <span style="display:block;height:4px;margin-top:6px;border-radius:99px;background:rgba(255,255,255,.09);overflow:hidden;"><i style="display:block;width:${summary.percent}%;height:100%;background:${summary.isSeven ? "linear-gradient(90deg,#39e7ff,#a970ff)" : "var(--gold)"};"></i></span>
        </span>
        <span style="color:var(--text-dim);font-size:16px;">›</span>
      </button>`;
  } catch (_) {
    wrap.innerHTML = "";
  }
}

function openDailyChallengesModal() {
  const data = window.__lsDailyChallengeData;
  if (!data?.challenges) return;
  const summary = getDailyChallengeSummary(data);
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked" data-modal-locked="1" style="z-index:275;">
      <div class="modal-box" style="max-width:430px;">
        <div class="modal-box-header" style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div><small style="color:${summary.isSeven ? "#58efff" : "var(--gold)"};font-weight:900;letter-spacing:.1em;">${summary.isSeven ? "LIVESCROLL PULSE" : "RETO DIARIO"}</small><h2 style="margin:3px 0 0;">${summary.isSeven ? "Tu Pulso de hoy" : "Tu misión de hoy"}</h2></div>
          <button type="button" onclick="closeDailyChallengesModal()" aria-label="Cerrar" style="width:40px;height:40px;border:1px solid var(--border);border-radius:50%;background:var(--panel-2);color:var(--text);font-size:18px;">✕</button>
        </div>
        <div class="modal-box-body">
          <div style="display:grid;gap:8px;">${renderDailyChallengeRows(summary.challenges)}</div>
          <div style="height:7px;margin-top:14px;border-radius:99px;background:rgba(255,255,255,.09);overflow:hidden;"><span style="display:block;width:${summary.percent}%;height:100%;background:${summary.isSeven ? "linear-gradient(90deg,#39e7ff,#a970ff)" : "var(--gold)"};"></span></div>
          <p style="margin:10px 0 0;color:var(--text-dim);font-size:9px;line-height:1.5;">Se renueva automáticamente cada día. Esta etapa prueba el progreso antes de habilitar premios adicionales.</p>
        </div>
      </div>
    </div>`;
}

function closeDailyChallengesModal() {
  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";
}

async function checkAndShowLoginStreak() {
  const { data } = await sb.rpc("get_login_streak_status", { p_user_id: currentUser.id });
  const banner = document.getElementById("loginStreakBannerWrap");
  if (!data || !data.ok || !data.rewards || !data.rewards.length) { if (banner) banner.innerHTML = ""; return; }

  window.__loginStreakData = data;
  if (data.new_week && data.week_start) {
    const weekNoticeKey = `ls-week-started-${data.week_start}`;
    if (!localStorage.getItem(weekNoticeKey)) {
      localStorage.setItem(weekNoticeKey, "1");
      showToast("🔥 Comenzó una nueva semana en LiveScroll");
    }
  }
  const claimableDay = data.current_day >= 7 ? 1 : data.current_day + 1;

  if (banner) {
    banner.innerHTML = data.claimed_today ? "" : `
      <div class="form-card" style="margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; border-color:var(--gold-dim);" onclick="showLoginStreakModal()">
        <div><strong>🔥 Inicio de Sesión</strong><div style="font-size:12px; color:var(--text-dim);">Día ${claimableDay} de 7 · tocá para reclamar</div></div>
        <div class="btn" style="pointer-events:none; padding:6px 14px; font-size:13px;">Ver</div>
      </div>`;
  }

  if (!data.claimed_today && !window.__loginStreakShownThisSession) {
    window.__loginStreakShownThisSession = true;
    showLoginStreakModal();
  }
}

function closeLoginStreakModal() {
  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";
}

function showLoginStreakModal() {
  const data = window.__loginStreakData;
  if (!data) return;
  const claimedToday = data.claimed_today;
  const currentDay = data.current_day || 0;
  const claimableDay = claimedToday ? null : (currentDay >= 7 ? 1 : currentDay + 1);
  const rewards = data.rewards || [];
  const days1to6 = rewards.filter(r => r.day_number !== 7);
  const day7 = rewards.find(r => r.day_number === 7);

  const isDayDone = (dayNum) => claimedToday ? dayNum <= currentDay : dayNum < claimableDay;

  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="modal-overlay" style="z-index:125;">
      <div class="modal-box" style="max-width:380px;">
        <div class="modal-box-header">
          <h2>📅 Inicio de Sesión</h2>
          <button onclick="closeLoginStreakModal()" style="background:none;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;">✕</button>
        </div>
        <div class="modal-box-body">
          <p style="color:var(--text-dim); font-size:12px; margin-top:0;">Entrá todos los días que puedas — si faltás uno, no se rompe nada, seguís de donde quedaste.</p>
          <div class="login-streak-grid">
            ${days1to6.map(r => `
              <div class="login-streak-day ${isDayDone(r.day_number) ? "done" : ""} ${r.day_number === claimableDay ? "claimable" : ""}">
                <div class="d">Día ${r.day_number}</div>
                <div class="ic">${r.emoji_reward || r.badge_icon || "⭐"}</div>
                <div class="p">+${r.points}</div>
              </div>`).join("")}
          </div>
          ${day7 ? `
            <div class="login-streak-bigday ${isDayDone(7) ? "done" : ""}">
              <div class="tag">GRAN PREMIO · DÍA 7</div>
              <div class="ic">${day7.emoji_reward || day7.badge_icon || "🎁"}</div>
              <div class="p">+${day7.points} pts${day7.badge_name ? ` · 🏅 ${escapeHtml(day7.badge_name)}` : ""}</div>
            </div>` : ""}
        </div>
        <div class="modal-box-footer">
          ${claimedToday
            ? `<button class="btn-outline" style="width:100%;" disabled>Ya reclamaste hoy ✓</button>`
            : `<button class="btn" id="claimLoginStreakBtn" style="width:100%;min-height:48px;" onclick="handleClaimLoginStreak()">Reclamar Día ${claimableDay}</button>`}
        </div>
      </div>
    </div>`;
}

async function handleClaimLoginStreak() {
  const btn = document.getElementById("claimLoginStreakBtn");

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Reclamando...";
  }

  const { data, error } = await sb.rpc("claim_daily_streak", {
    p_user_id: currentUser.id
  });

  if (error || !data?.ok) {
    const reason = data?.error || error?.message || "error_desconocido";

    const messages = {
      ya_reclamado: "Ya reclamaste la recompensa de hoy.",
      not_authenticated: "Tu sesión venció. Volvé a iniciar sesión.",
      invalid_user: "No pudimos validar tu cuenta. Recargá LiveScroll.",
      cuenta_bloqueada: "Tu cuenta todavía no puede reclamar recompensas."
    };

    showToast(messages[reason] || "No se pudo reclamar. Probá nuevamente.");

    if (btn) {
      btn.disabled = false;
      btn.textContent = "Reclamar";
    }

    console.warn("Error reclamando Inicio de Sesión:", reason, error || data);
    return;
  }

  currentProfile.points_balance += Number(data.points || 0);
  currentProfile.streak_current_day = data.day;
  currentProfile.streak_last_login_date = new Date().toISOString().slice(0, 10);

  updateBalanceUI();
  showFloatingPointsSafe(Number(data.points || 0));

  // Cerramos el selector, pero mantenemos oculta la navegación
  // porque enseguida mostramos el premio.
  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";

  showStreakModal(data);

  const banner = document.getElementById("loginStreakBannerWrap");
  if (banner) banner.innerHTML = "";
}

async function handleClaimStreak() {
  const { data, error } = await sb.rpc("claim_daily_streak", { p_user_id: currentUser.id });
  if (error || !data.ok) { showToast("No se pudo reclamar, probá de nuevo"); return; }

  currentProfile.points_balance += data.points;
  currentProfile.streak_current_day = data.day;
  currentProfile.streak_last_login_date = new Date().toISOString().slice(0, 10);
  updateBalanceUI();
  showStreakModal(data);
  renderProfile();
}

async function claimDailyStreak() {
  if (currentProfile.is_blocked) return; // cuentas pendientes de verificar no acumulan racha todavía
  if (window.streakClaimAttempted) return; // seguro: nunca reclamar más de una vez por sesión
  window.streakClaimAttempted = true;

  const { data, error } = await sb.rpc("claim_daily_streak", { p_user_id: currentUser.id });
  if (error || !data.ok) return; // ya reclamado hoy, o sin configurar: no molestamos

  currentProfile.points_balance += data.points;
  currentProfile.streak_current_day = data.day;
  updateBalanceUI();
  showFloatingPointsSafe(data.points);
  showStreakModal(data);
}

function closeStreakRewardModal() {
  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";
}

function showStreakModal(data) {
  const wrap = document.getElementById("globalModalWrap");
  const wasCompleted = data.completed_week;

  wrap.innerHTML = `
    <div style="position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:120; display:flex; align-items:center; justify-content:center; padding:20px;">
      <div class="auth-box" style="margin:0; text-align:center;">
        ${wasCompleted ? `
          <div style="font-size:44px; margin-bottom:8px;">🎉</div>
          <h2>¡Racha completa!</h2>
          <p style="color:var(--text-dim); font-size:14px;">Completaste los 7 días. ¡Hasta la próxima semana!</p>
        ` : `
          <div style="font-size:44px; margin-bottom:8px;">🔥</div>
          <h2>Día ${data.day} de 7</h2>
        `}
        <div class="mono" style="font-size:28px; color:var(--gold); margin:14px 0;">+${data.points} pts</div>
        ${data.badge_name ? `
          <div style="background:var(--panel-2); border:1px solid var(--gold-dim); border-radius:12px; padding:14px; margin-bottom:14px;">
            <div style="font-size:32px;">${data.badge_icon || "🏅"}</div>
            <div style="font-size:13px; color:var(--gold); margin-top:6px;">¡Ganaste la medalla "${escapeHtml(data.badge_name)}"!</div>
          </div>` : ""}
        ${data.emoji_reward ? `
          <div style="background:var(--panel-2); border:1px solid var(--green); border-radius:12px; padding:14px; margin-bottom:14px;">
            <div style="font-size:32px;">${data.emoji_reward}</div>
            <div style="font-size:13px; color:var(--green); margin-top:6px;">¡Nuevo emoji de avatar desbloqueado!</div>
          </div>` : ""}
        <button class="btn" style="width:100%;min-height:48px;" onclick="closeStreakRewardModal()">Genial</button>
      </div>
    </div>`;
}


async function handlePinVideo(videoId) {
  const { data, error } = await sb.rpc("pin_video", { p_video_id: videoId, p_user_id: currentUser.id });
  if (error || !data.ok) {
    const messages = { limite_alcanzado: "Ya usaste todos tus cupos de anclado por ahora.", plan_sin_anclado: "Tu plan no incluye anclar videos." };
    showToast(messages[data?.error] || "No se pudo anclar");
    return;
  }
  showToast("¡Video anclado en Para Ti por 24hs!");
  lsPerfCache.profileVideos.at = 0;
  renderProfile();
}

async function handleDeleteOwnVideo(videoId) {
  if (!confirm("¿Eliminar este video para siempre? Se borran también sus likes, comentarios y vistas. No se puede deshacer.")) return;
  const mediaToDelete = await getVideoMediaForCleanup(videoId);
  const { data, error } = await sb.rpc("delete_own_video", { p_video_id: videoId });
  if (error || !data?.ok) {
    console.error("delete_own_video:", error, data);
    const messages = {
      no_autenticado:"Tu sesión venció. Volvé a ingresar.",
      no_autorizado:"Solamente el dueño puede eliminar este video.",
      video_no_encontrado:"El video ya no existe.",
      delete_failed:"No pudimos completar la eliminación. Probá nuevamente."
    };
    showToast(messages[data?.error] || "No se pudo eliminar el video");
    return;
  }
  await cleanupR2VideoMedia(mediaToDelete);
  document.getElementById(`tile-${videoId}`)?.remove();
  showToast("Video eliminado definitivamente ✓");
  lsPerfCache.profileVideos.at = 0;
  lsPerfCache.feed.at = 0;
  renderProfile();
}

async function handleAdminDeleteProfileVideo(videoId, username) {
  if (!currentProfile?.is_admin) return;
  if (!confirm("¿Eliminar este video como administrador? Esta acción no se puede deshacer.")) return;
  const mediaToDelete = await getVideoMediaForCleanup(videoId);
  const { data, error } = await sb.rpc("admin_delete_video", { p_video_id:videoId });
  if (error || !data?.ok) {
    console.error("admin_delete_video perfil:", error, data);
    showToast(`No se pudo eliminar: ${data?.detail || data?.error || error?.message || "error desconocido"}`);
    return;
  }
  await cleanupR2VideoMedia(mediaToDelete);
  document.getElementById(`public-tile-${videoId}`)?.remove();
  lsPerfCache.profileVideos.at = 0;
  lsPerfCache.feed.at = 0;
  showToast("Video eliminado por administración ✓");
  await viewPublicProfile(username);
}
window.handleAdminDeleteProfileVideo = handleAdminDeleteProfileVideo;


function checkBlockedStatus() {
  const wrap = document.getElementById("blockedBannerWrap");
  if (currentProfile.is_blocked) {
    const verificationMessages = {
      correo_sin_confirmar:"Confirmá el enlace que enviamos a tu correo y volvé a ingresar.",
      nombre_invalido:"Tu nombre de usuario necesita una revisión rápida.",
      registro_masivo_misma_red:"Detectamos varios registros recientes desde la misma conexión. La cuenta quedó protegida para revisión.",
      sancion_activa:"Esta cuenta tiene una restricción activa y requiere revisión del equipo.",
      perfil_incompleto:"Estamos terminando de preparar tu perfil.",
      revision_manual:"La cuenta necesita una revisión rápida del equipo."
    };
    const verificationDetail = verificationMessages[currentProfile.auto_verification_reason] || verificationMessages.revision_manual;
    wrap.innerHTML = `
      <div style="max-width:920px;margin:14px auto 0;padding:10px 18px;background:rgba(34,197,94,0.08);border:1px solid var(--gold-dim);border-radius:10px;color:var(--text);font-size:13px;text-align:center;">
        🕒 ${escapeHtml(verificationDetail)} Podés navegar, pero todavía no vas a sumar puntos.
      </div>`;
  } else {
    wrap.innerHTML = "";
  }
}

let boostActive = false;

async function checkBoostStatus() {
  const { data, error } = await sb.rpc("get_boost_status", { p_user_id: currentUser.id });
  if (error || !data) return;
  boostActive = data.active;
  if (boostActive) {
    const expires = new Date(data.expires_at);
    showBoostBanner(expires);
  }
}

function showBoostBanner(expiresAt) {
  const wrap = document.getElementById("boostBannerWrap");
  wrap.innerHTML = `
    <div style="max-width:920px;margin:14px auto 0;padding:10px 18px;background:var(--panel-2);border:1px solid var(--gold-dim);border-radius:10px;color:var(--gold);font-size:13px;text-align:center;">
      ⚡ Boost de bienvenida activo: ganás <strong>x2 puntos</strong> hasta ${expiresAt.toLocaleString("es-AR")}
    </div>`;
}


function ensureSafeMobileUpgradeStyles() {
  if (document.getElementById("lsSafeMobileUpgradeStyles")) return;

  const style = document.createElement("style");
  style.id = "lsSafeMobileUpgradeStyles";
  style.textContent = `
    body,
    button,
    a,
    label,
    p,
    span,
    div,
    h1, h2, h3, h4, h5, h6,
    .form-card,
    .profile-hero,
    .profile-section,
    .feed-item {
      -webkit-user-select:none;
      user-select:none;
      -webkit-touch-callout:none;
    }

    input,
    textarea,
    select,
    [contenteditable="true"],
    .allow-text-select {
      -webkit-user-select:text !important;
      user-select:text !important;
      -webkit-touch-callout:default;
    }


    /* ===== LiveScroll Modern Pass: visual only ===== */
    .feed-item {
      border-radius:18px !important;
      overflow:hidden;
      border:1px solid rgba(255,255,255,.07) !important;
      box-shadow:0 10px 28px rgba(0,0,0,.16);
    }

    .feed-item button {
      transition:transform .16s ease, opacity .16s ease, background .16s ease, border-color .16s ease;
    }

    .feed-item button:active {
      transform:scale(.94);
    }

    .profile-hero,
    .profile-section,
    .form-card {
      border-radius:18px !important;
    }

    .profile-stats-row {
      gap:8px !important;
    }

    .stat-pill {
      border-radius:14px !important;
      transition:transform .18s ease, border-color .18s ease;
    }

    .stat-pill:active {
      transform:scale(.97);
    }

    .btn,
    .btn-outline {
      min-height:42px;
      border-radius:12px !important;
      transition:transform .15s ease, opacity .15s ease, box-shadow .15s ease;
      touch-action:manipulation;
    }

    .btn:active,
    .btn-outline:active {
      transform:scale(.97);
    }

    .modal-box {
      border-radius:20px;
      box-shadow:0 22px 70px rgba(0,0,0,.42);
    }

    .modal-box-header {
      padding-bottom:12px;
    }

    .modal-box-footer {
      gap:10px;
    }

    .ls-nova .feed-item {
      box-shadow:0 14px 36px rgba(0,0,0,.22);
      backdrop-filter:blur(5px);
      -webkit-backdrop-filter:blur(5px);
    }

    .ls-nova .profile-hero,
    .ls-nova .profile-section,
    .ls-nova .form-card {
      box-shadow:0 10px 30px rgba(0,0,0,.12);
    }

    .ls-nova .btn:hover,
    .ls-nova .btn-outline:hover {
      transform:translateY(-1px);
    }

    .ls-legacy .feed-item,
    .ls-legacy .profile-hero,
    .ls-legacy .profile-section,
    .ls-legacy .form-card,
    .ls-legacy .modal-box {
      box-shadow:none !important;
      backdrop-filter:none !important;
      -webkit-backdrop-filter:none !important;
    }

    @media (max-width:700px) {
      .feed-item {
        border-radius:15px !important;
      }

      .profile-hero,
      .profile-section,
      .form-card {
        border-radius:15px !important;
      }

      .btn,
      .btn-outline {
        min-height:44px;
      }

      .modal-box {
        max-width:calc(100vw - 18px);
      }
    }

    @media (max-width:360px) {
      .feed-item {
        border-radius:12px !important;
      }

      .profile-stats-row {
        gap:5px !important;
      }

      .stat-pill {
        padding-left:7px !important;
        padding-right:7px !important;
      }
    }


    /* v5.3.5 — Perfil Nova: actividad + profundidad */
    .ls-profile-nova {
      transform-style:preserve-3d;
      perspective:900px;
    }
    .ls-profile-nova-inner {
      position:relative;
      z-index:2;
      transform-style:preserve-3d;
      transition:transform .18s ease;
      will-change:transform;
    }
    .ls-profile-nova::after {
      content:"";
      position:absolute;
      inset:-35%;
      z-index:1;
      pointer-events:none;
      opacity:0;
      background:radial-gradient(circle at var(--ls-glow-x,50%) var(--ls-glow-y,35%), rgba(255,255,255,.11), transparent 34%);
      transition:opacity .22s ease;
    }
    .ls-profile-nova:hover::after { opacity:1; }

    .ls-activity-aura {
      position:relative;
      isolation:isolate;
    }
    .ls-activity-aura::before {
      content:"";
      position:absolute;
      inset:-5px;
      border-radius:50%;
      z-index:-1;
      background:conic-gradient(from 0deg, #facc15, #7dd3fc, #a78bfa, #22c55e, #facc15);
      animation:lsActivityAuraSpin 4s linear infinite;
    }
    .ls-activity-aura::after {
      content:"";
      position:absolute;
      inset:-9px;
      border-radius:50%;
      z-index:-2;
      background:rgba(125,211,252,.16);
      filter:blur(7px);
      animation:lsActivityAuraPulse 2.2s ease-in-out infinite;
    }
    @keyframes lsActivityAuraSpin { to { transform:rotate(360deg); } }
    @keyframes lsActivityAuraPulse {
      0%,100% { opacity:.42; transform:scale(.96); }
      50% { opacity:.9; transform:scale(1.06); }
    }

    .ls-recent-activity {
      display:grid;
      gap:8px;
    }
    .ls-activity-item {
      display:flex;
      align-items:center;
      gap:11px;
      padding:11px 12px;
      border:1px solid var(--border);
      border-radius:12px;
      background:rgba(255,255,255,.025);
    }
    .ls-activity-icon {
      width:36px;
      height:36px;
      flex:0 0 36px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:11px;
      background:var(--panel-2);
      font-size:18px;
    }
    .ls-activity-copy { min-width:0; flex:1; }
    .ls-activity-title { font-size:12px; color:var(--text); }
    .ls-activity-time { margin-top:2px; font-size:9px; color:var(--text-dim); }

    .ls-new-video-badge {
      position:absolute;
      top:7px;
      left:7px;
      z-index:5;
      padding:4px 7px;
      border-radius:999px;
      background:rgba(8,10,13,.82);
      border:1px solid var(--gold-dim);
      color:var(--gold);
      font-size:9px;
      font-weight:800;
      letter-spacing:.03em;
      pointer-events:none;
    }

    /* Legacy queda liviano */
    .ls-legacy .ls-profile-nova-inner { transform:none !important; }
    .ls-legacy .ls-profile-nova::after,
    .ls-legacy .ls-activity-aura::before,
    .ls-legacy .ls-activity-aura::after { animation:none !important; filter:none !important; }

    @media (hover:none), (max-width:700px) {
      .ls-profile-nova-inner { transform:none !important; }
      .ls-profile-nova::after { display:none; }
    }

    .ls-like-pop-safe { animation:lsLikePopSafe .32s ease; }
    @keyframes lsLikePopSafe {
      0%,100% { transform:scale(1); }
      50% { transform:scale(1.28); }
    }

    .ls-balance-pop-safe { animation:lsBalancePopSafe .4s ease; }
    @keyframes lsBalancePopSafe {
      0%,100% { transform:scale(1); }
      50% { transform:scale(1.08); }
    }

    .ls-legacy .ls-like-pop-safe,
    .ls-legacy .ls-balance-pop-safe {
      animation:none !important;
    }

    @media (max-width:700px) {

    }

    .ls-view-enter-safe {
      animation:lsViewEnterSafe .20s ease both;
    }

    @keyframes lsViewEnterSafe {
      from { opacity:.45; transform:translateY(5px); }
      to { opacity:1; transform:translateY(0); }
    }

    .ls-points-float-safe {
      position:fixed;
      z-index:600;
      pointer-events:none;
      color:var(--gold);
      font-family:'JetBrains Mono', monospace;
      font-weight:800;
      font-size:15px;
      text-shadow:0 2px 8px rgba(0,0,0,.7);
      animation:lsPointsFloatSafe .95s ease-out forwards;
    }

    @keyframes lsPointsFloatSafe {
      0% { opacity:0; transform:translate(-50%, 6px) scale(.9); }
      15% { opacity:1; }
      100% { opacity:0; transform:translate(-50%, -44px) scale(1.06); }
    }

    .ls-upload-preview-safe {
      display:none;
      position:relative;
      margin:12px 0 0;
      width:100%;
      max-width:100%;
      min-width:0;
      height:clamp(190px, 34vw, 340px);
      overflow:hidden;
      box-sizing:border-box;
      border-radius:12px;
      border:1px solid var(--border);
      background:#050607;
      align-items:center;
      justify-content:center;
    }

    .ls-upload-preview-safe.active {
      display:flex;
    }

    /* Preview estable:
       la CAJA aprovecha todo el ancho disponible y nunca se sale del formulario.
       El video se adapta dentro sin recortarse. */
    .ls-upload-preview-safe video {
      display:block;
      width:100%;
      height:100%;
      min-width:0;
      max-width:100%;
      max-height:100%;
      object-fit:contain;
      object-position:center center;
      background:#000;
      margin:0;
      box-sizing:border-box;
    }

    @media (max-width:700px) {
      .ls-upload-preview-safe {
        width:100%;
        height:190px;
        max-height:190px;
        margin-left:0;
        margin-right:0;
      }

      .ls-upload-preview-safe video {
        width:100%;
        height:100%;
      }
    }

    .ls-upload-preview-safe .tag {
      position:absolute;
      top:8px;
      left:8px;
      z-index:2;
      padding:4px 8px;
      border-radius:999px;
      background:rgba(0,0,0,.72);
      color:#fff;
      font-size:10px;
      font-weight:700;
    }

    .ls-upload-preview-msg-safe {
      display:none;
      padding:14px;
      color:var(--text-dim);
      font-size:12px;
      line-height:1.45;
      text-align:center;
    }

    .ls-upload-preview-msg-safe.active {
      display:block;
    }

    .ls-legacy .ls-view-enter-safe,
    .ls-legacy .ls-points-float-safe {
      animation:none !important;
    }


    @media (max-width:700px) {
      .ls-profile-edit-modal {
        width:100% !important;
        max-width:100% !important;
        height:100vh !important;
        max-height:100vh !important;
        margin:0 !important;
        border-radius:0 !important;
        display:flex !important;
        flex-direction:column !important;
        overflow:hidden !important;
      }

      .ls-profile-edit-header {
        flex:0 0 auto !important;
        position:sticky !important;
        top:0 !important;
        z-index:20 !important;
        background:var(--panel) !important;
        border-bottom:1px solid var(--border) !important;
      }

      .ls-profile-edit-body {
        flex:1 1 auto !important;
        min-height:0 !important;
        overflow-y:auto !important;
        -webkit-overflow-scrolling:touch;
      }

      .ls-profile-edit-footer {
        flex:0 0 auto !important;
        position:sticky !important;
        bottom:0 !important;
        z-index:20 !important;
        background:var(--panel) !important;
        border-top:1px solid var(--border) !important;
        padding-bottom:max(10px, env(safe-area-inset-bottom)) !important;
      }

      .ls-comments-overlay-safe {
        align-items:flex-end !important;
        padding:0 !important;
        box-sizing:border-box !important;
      }

      .ls-comments-panel-safe {
        width:100% !important;
        max-width:560px !important;
        height:min(66vh, 560px) !important;
        max-height:calc(100vh - 96px) !important;
        border-radius:18px 18px 0 0 !important;
        margin:0 !important;
        box-sizing:border-box !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function closeManagedModal() {
  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";
}

function safePulseElement(el, className) {
  if (!el || window.__liveScrollLegacyMode) return;

  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);

  setTimeout(() => el.classList.remove(className), 450);
}

function animateCurrentViewSafe() {
  if (window.__liveScrollLegacyMode) return;

  const main = document.getElementById("appView");
  if (!main) return;

  main.classList.remove("ls-view-enter-safe");
  void main.offsetWidth;
  main.classList.add("ls-view-enter-safe");

  setTimeout(() => main.classList.remove("ls-view-enter-safe"), 260);
}

function showFloatingPointsSafe(amount, anchorEl = null) {
  const points = Number(amount);
  if (!Number.isFinite(points) || points <= 0 || window.__liveScrollLegacyMode) return;

  const anchor = anchorEl || document.getElementById("navBalance");
  const rect = anchor?.getBoundingClientRect();

  const el = document.createElement("div");
  el.className = "ls-points-float-safe";
  el.textContent = `+${points} pts`;

  if (rect) {
    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top = `${Math.max(56, rect.top + rect.height / 2)}px`;
  } else {
    el.style.left = "50%";
    el.style.top = "90px";
  }

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1050);
}


const lsPerfCache = {
  feed: { data:null, at:0 },
  directos: { data:null, at:0 },
  profileVideos: { data:null, at:0 },
  profileViewsLedger: { data:null, at:0 }
};
let lsFeedLoadPromise = null;
let lsTabRenderToken = 0;

async function loadFeedVideosCached() {
  if (lsCacheFresh(lsPerfCache.feed, 45000)) {
    return { data:lsPerfCache.feed.data, error:null };
  }

  if (lsFeedLoadPromise) return lsFeedLoadPromise;

  lsFeedLoadPromise = sb
    .from("videos")
    .select("*, profiles!videos_user_id_fkey(username, plan_id), video_hashtags(hashtags(slug, display_name))")
    .order("created_at", { ascending:false })
    .limit(20)
    .then(result => {
      if (!result.error && result.data) {
        lsPerfCache.feed = { data:result.data, at:Date.now() };
      }
      return result;
    })
    .finally(() => {
      lsFeedLoadPromise = null;
    });

  return lsFeedLoadPromise;
}

function renderFastSkeleton(lines = 5, type = "generic") {
  if (type === "feed") {
    return `<div style="display:grid;place-items:center;min-height:58vh;">
      <div style="width:min(390px,100%);height:58vh;border-radius:18px;background:var(--panel-2);overflow:hidden;position:relative;">
        <div class="ls-fast-shimmer" style="position:absolute;inset:0;"></div>
      </div>
    </div>`;
  }
  if (type === "profile") {
    return `<div class="ls-fast-profile-skeleton">
      <div class="ls-fast-profile-hero">
        <span class="ls-fast-avatar"></span>
        <div style="flex:1;display:grid;gap:9px;"><i style="width:44%;"></i><i style="width:64%;"></i></div>
      </div>
      <div class="ls-fast-stats">${"<i></i>".repeat(3)}</div>
      <div class="ls-fast-skeleton">${"<i></i>".repeat(3)}</div>
    </div>`;
  }
  if (type === "directos") return `<div class="ls-fast-skeleton">${'<i style="height:78px;"></i>'.repeat(3)}</div>`;
  return `<div class="ls-fast-skeleton">${Array.from({length:lines}, () => "<i></i>").join("")}</div>`;
}

function renderRuntimeShareButton(video) {
  const videoId = escapeHtml(String(video?.id || ""));
  const encodedUrl = encodeURIComponent(video?.video_url || "");
  if (!isLiveScroll7App()) {
    return `<button class="feed-action-btn" data-label="Compartir" aria-label="Compartir video" title="Compartir" onclick="handleShare('${videoId}', '${encodedUrl}')">🔗</button>`;
  }
  return `<button class="feed-action-btn ls7-action-share" data-label="Compartir" aria-label="Compartir video" title="Compartir" onclick="handleShare('${videoId}', '${encodedUrl}')"><span>↗</span><i>ENVIAR</i></button>`;
}

function renderRuntimeHideButton(videoId) {
  const safeId = escapeHtml(String(videoId || ""));
  if (!isLiveScroll7App()) {
    return `<button class="feed-action-btn" data-label="No me interesa" aria-label="No me interesa" title="No me interesa" onclick="hideVideoFromDiscovery('${safeId}')">🙈</button>`;
  }
  return `<button class="feed-action-btn ls7-action-hide" data-label="No me interesa" aria-label="No me interesa" title="No me interesa" onclick="hideVideoFromDiscovery('${safeId}')"><span>−</span><i>OCULTAR</i></button>`;
}

function renderRuntimeReportButton(videoId) {
  const safeId = escapeHtml(String(videoId || ""));
  if (!isLiveScroll7App()) {
    return `<button class="feed-action-btn" data-label="Reportar" aria-label="Reportar video" title="Reportar" onclick="openReportModal('${safeId}')">🚩</button>`;
  }
  return `<button class="feed-action-btn ls7-action-report" data-label="Reportar" aria-label="Reportar video" title="Reportar" onclick="openReportModal('${safeId}')"><span>!</span><i>REPORTE</i></button>`;
}

function lsCacheFresh(entry, maxAgeMs) {
  return !!entry?.data && (Date.now() - entry.at) < maxAgeMs;
}

function switchTab(tab) {
  // Los planes siguen disponibles dentro de Tienda, pero ya no existen como
  // apartado independiente. Los accesos viejos también terminan allí.
  if (tab === "plans") tab = "store";
  stopConnectedLiveRefresh();

  clearAllWatchIntervals();
  if (!suppressAndroidTabHistory && currentTab && tab !== currentTab) {
    previousTabForAndroidBack = currentTab;
  }
  currentTab = tab;
  syncLiveScroll7SwipeRail(tab);
  const renderToken = ++lsTabRenderToken;

  document.querySelectorAll(".nav-links button").forEach(b => b.classList.remove("active"));
  const activeBtn = document.getElementById("tab-" + tab);
  if (activeBtn) activeBtn.classList.add("active");
  updateNavigationEvolution597(tab);

  const main = document.getElementById("appView");
  if (main) {
    main.classList.remove("ls-nav-view-enter");
    void main.offsetWidth;
    main.classList.add("ls-nav-view-enter");
    setTimeout(() => main.classList.remove("ls-nav-view-enter"), 240);
  }

  // Feedback visual en el mismo frame del toque.
  if (main && ["feed","foryou","profile","users","directos","wallet","plans","store","ranking","admin"].includes(tab)) {
    const skeletonType = (tab === "feed" || tab === "foryou") ? "feed" : tab === "profile" ? "profile" : tab === "directos" ? "directos" : "generic";
    main.innerHTML = renderFastSkeleton(5, skeletonType);
  }

  if (tab === "feed") renderFeed(renderToken);
  if (tab === "foryou") renderForYou(renderToken);
  if (tab === "upload") renderUpload();
  if (tab === "profile") renderProfile();
  if (tab === "users") renderUsersDirectory();
  if (tab === "directos") renderDirectos(renderToken);
  if (tab === "wallet") renderWallet();
  if (tab === "store") renderStore();
  if (tab === "ranking") renderRanking();
  if (tab === "admin") renderAdmin();

  // En desktop conservamos la entrada Nova; en móvil aparece instantáneo.
  if (window.innerWidth > 700) {
    requestAnimationFrame(() => animateCurrentViewSafe());
  }

  // Seasonal: solo sincroniza controles si estamos en Admin.
  // No reconstruye el tema ni observa todo el DOM.
  if (tab === "admin") {
    setTimeout(syncSeasonalAdminControls, 250);
  }

}

// LiveScroll 7 · navegación horizontal con intención.
// Solo actúa cuando el gesto es claramente lateral y nunca dentro de videos,
// formularios, menús o ventanas modales.
function ensureLiveScroll7HorizontalNavigation() {
  if (window.__ls7HorizontalNavigationReady) return;
  const surface = document.getElementById("appView");
  if (!surface) return;
  window.__ls7HorizontalNavigationReady = true;

  if (!document.getElementById("lsSharedSwipeRailStyles")) {
    const style = document.createElement("style");
    style.id = "lsSharedSwipeRailStyles";
    style.textContent = `
      html:not(.ls7-app-runtime) #ls7SwipeRail {
        position:fixed;left:50%;top:calc(max(64px,env(safe-area-inset-top) + 56px));z-index:74;
        width:154px;height:29px;transform:translateX(-50%);display:flex;align-items:center;justify-content:space-between;
        padding:0 11px;border:1px solid rgba(56,221,242,.22);border-radius:999px;
        background:rgba(5,17,22,.80);box-shadow:0 8px 25px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.04);
        color:#2ef27c;backdrop-filter:blur(12px);touch-action:pan-x;transition:opacity .16s ease,transform .16s ease;
      }
      html:not(.ls7-app-runtime) #ls7SwipeRail b { color:#d6edf1;font:850 7px 'JetBrains Mono',monospace;letter-spacing:.09em; }
      html:not(.ls7-app-runtime) #ls7SwipeRail span { font-size:16px;line-height:1; }
      html:not(.ls7-app-runtime) #ls7SwipeRail.is-left { transform:translateX(calc(-50% - 8px)); }
      html:not(.ls7-app-runtime) #ls7SwipeRail.is-right { transform:translateX(calc(-50% + 8px)); }
      html:not(.ls7-app-runtime) #ls7SwipeRail.is-hidden { opacity:0;pointer-events:none; }
    `;
    document.head.appendChild(style);
  }

  const tabs = ["feed", "foryou", "profile"];
  let startX = 0;
  let startY = 0;
  let startedAt = 0;
  let blocked = false;

  surface.addEventListener("touchstart", event => {
    const touch = event.touches?.[0];
    if (!touch || event.touches.length !== 1) return;
    const target = event.target;
    blocked = !!target?.closest?.("button,a,input,textarea,select,video,iframe,.modal-overlay,.ls-comments-overlay-611,.mobile-menu-panel");
    startX = touch.clientX;
    startY = touch.clientY;
    startedAt = performance.now();
  }, { passive:true });

  surface.addEventListener("touchend", event => {
    if (blocked) return;
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    const elapsed = performance.now() - startedAt;
    if (elapsed > 760 || Math.abs(dx) < 72 || Math.abs(dx) < Math.abs(dy) * 1.35) return;

    const index = tabs.indexOf(currentTab);
    if (index < 0) return;
    const nextIndex = dx < 0 ? index + 1 : index - 1;
    if (nextIndex < 0 || nextIndex >= tabs.length) return;

    surface.classList.remove("ls7-swipe-left", "ls7-swipe-right");
    surface.classList.add(dx < 0 ? "ls7-swipe-left" : "ls7-swipe-right");
    window.setTimeout(() => {
      switchTab(tabs[nextIndex]);
      surface.classList.remove("ls7-swipe-left", "ls7-swipe-right");
    }, 115);
  }, { passive:true });

  // Los reproductores embebidos consumen los gestos antes de que lleguen a
  // la página. Esta pequeña franja queda por encima del video y ofrece un
  // lugar seguro para cambiar de apartado sin pelear con el scroll vertical.
  const rail = document.createElement("div");
  rail.id = "ls7SwipeRail";
  rail.setAttribute("role", "navigation");
  rail.setAttribute("aria-label", "Deslizar entre Mirar, Para Ti y Perfil");
  rail.innerHTML = '<span>‹</span><b id="ls7SwipeRailLabel">MIRAR · DESLIZÁ</b><span>›</span>';
  document.body.appendChild(rail);

  let railX = 0;
  let railY = 0;
  rail.addEventListener("touchstart", event => {
    const touch = event.touches?.[0];
    if (!touch) return;
    railX = touch.clientX;
    railY = touch.clientY;
  }, { passive:true });
  rail.addEventListener("touchend", event => {
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    const dx = touch.clientX - railX;
    const dy = touch.clientY - railY;
    if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.1) return;
    const index = tabs.indexOf(currentTab);
    const nextIndex = dx < 0 ? index + 1 : index - 1;
    if (index < 0 || nextIndex < 0 || nextIndex >= tabs.length) return;
    rail.classList.add(dx < 0 ? "is-left" : "is-right");
    window.setTimeout(() => {
      rail.classList.remove("is-left", "is-right");
      switchTab(tabs[nextIndex]);
    }, 105);
  }, { passive:true });
  syncLiveScroll7SwipeRail(currentTab);
}

function syncLiveScroll7SwipeRail(tab = currentTab) {
  const rail = document.getElementById("ls7SwipeRail");
  if (!rail) return;
  const names = { feed:"MIRAR", foryou:"PARA TI", profile:"PERFIL" };
  rail.classList.toggle("is-hidden", !names[tab]);
  const label = document.getElementById("ls7SwipeRailLabel");
  if (label && names[tab]) label.textContent = `${names[tab]} · DESLIZÁ`;
}

function updateBalanceUI() {
  const el = document.getElementById("navBalance");
  if (el) {
    el.textContent = currentProfile.points_balance + " pts";
    safePulseElement(el, "ls-balance-pop-safe");
  }
}

function ensureModernToastStyles() {
  if (document.getElementById("lsModernToastStyles")) return;
  const style = document.createElement("style");
  style.id = "lsModernToastStyles";
  style.textContent = `
    #toastWrap{
      position:fixed!important;
      z-index:2147482500!important;
      left:50%!important;
      right:auto!important;
      bottom:calc(154px + env(safe-area-inset-bottom, 0px))!important;
      width:min(92vw,430px)!important;
      display:flex!important;
      flex-direction:column!important;
      gap:9px!important;
      pointer-events:none!important;
      transform:translateX(-50%)!important;
    }
    #toastWrap .ls-modern-toast{
      --toast-accent:#f2c94c;
      position:relative;
      display:grid;
      grid-template-columns:42px minmax(0,1fr);
      align-items:center;
      gap:11px;
      width:100%;
      min-height:66px;
      padding:10px 14px 10px 11px;
      overflow:hidden;
      border:1px solid color-mix(in srgb,var(--toast-accent) 43%,transparent);
      border-radius:19px;
      background:linear-gradient(125deg,rgba(12,18,22,.97),rgba(8,11,14,.96));
      color:#f7f8fa;
      box-shadow:0 16px 42px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.06);
      backdrop-filter:blur(18px) saturate(1.3);
      -webkit-backdrop-filter:blur(18px) saturate(1.3);
      animation:lsToastArrive .38s cubic-bezier(.16,1,.3,1) both;
      pointer-events:auto;
    }
    #toastWrap .ls-modern-toast:before{
      content:"";position:absolute;inset:0 auto 0 0;width:3px;
      background:var(--toast-accent);box-shadow:0 0 18px var(--toast-accent);
    }
    #toastWrap .ls-toast-icon{
      width:42px;height:42px;display:grid;place-items:center;border-radius:14px;
      color:var(--toast-accent);font:900 19px/1 Inter,system-ui,sans-serif;
      background:color-mix(in srgb,var(--toast-accent) 13%,rgba(255,255,255,.025));
      border:1px solid color-mix(in srgb,var(--toast-accent) 30%,transparent);
    }
    #toastWrap .ls-toast-copy{min-width:0;text-align:left}
    #toastWrap .ls-toast-title{display:block;margin-bottom:3px;color:var(--toast-accent);font:800 10px/1.2 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase}
    #toastWrap .ls-toast-message{display:block;color:#f3f5f7;font:700 13px/1.35 Inter,system-ui,sans-serif;overflow-wrap:anywhere}
    #toastWrap .ls-modern-toast.is-success{--toast-accent:#45e6a8}
    #toastWrap .ls-modern-toast.is-error{--toast-accent:#ff5875}
    #toastWrap .ls-modern-toast.is-info{--toast-accent:#59d8ff}
    #toastWrap .ls-modern-toast.is-leaving{animation:lsToastLeave .22s ease forwards}
    html.ls7-app-runtime #toastWrap .ls-modern-toast{
      background:linear-gradient(125deg,rgba(10,12,20,.98),rgba(18,10,25,.97));
      border-radius:21px;
      box-shadow:0 18px 50px rgba(0,0,0,.54),0 0 26px color-mix(in srgb,var(--toast-accent) 13%,transparent),inset 0 1px 0 rgba(255,255,255,.07);
    }
    html:not(.ls7-app-runtime) #toastWrap .ls-modern-toast{
      border-color:rgba(244,201,93,.38);background:linear-gradient(125deg,rgba(24,21,10,.98),rgba(10,12,13,.98));
      box-shadow:0 18px 48px rgba(0,0,0,.52),0 0 24px rgba(244,201,93,.10),inset 0 1px 0 rgba(255,244,190,.07);
    }
    @keyframes lsToastArrive{from{opacity:0;transform:translate3d(0,24px,0) scale(.94)}to{opacity:1;transform:none}}
    @keyframes lsToastLeave{to{opacity:0;transform:translate3d(0,12px,0) scale(.97)}}
    @media(min-width:760px){#toastWrap{bottom:28px!important;left:auto!important;right:28px!important;transform:none!important;width:min(390px,calc(100vw - 56px))!important}}
    @media(prefers-reduced-motion:reduce){#toastWrap .ls-modern-toast{animation:none!important}}
  `;
  document.head.appendChild(style);
}

function ensureFeedPolishStyles() {
  if (document.getElementById("lsFeedPolishStyles")) return;
  const style = document.createElement("style");
  style.id = "lsFeedPolishStyles";
  style.textContent = `
    .mobile-menu-panel{padding-top:calc(22px + env(safe-area-inset-top,0px))!important}
    .ls-mobile-menu-head{flex:0 0 auto}
    html:not(.ls7-app-runtime) .mobile-menu-panel{
      top:0!important;bottom:0!important;height:100dvh!important;max-height:100dvh!important;
      box-sizing:border-box!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;
    }
    html:not(.ls7-app-runtime) .mobile-menu-panel .ls-mobile-menu-scroll{
      flex:1 1 auto!important;min-height:0!important;overflow-x:hidden!important;overflow-y:auto!important;
      padding-bottom:calc(34px + env(safe-area-inset-bottom,0px))!important;
      overscroll-behavior-y:contain!important;touch-action:pan-y!important;-webkit-overflow-scrolling:touch!important;
    }
    #feedVertical,#profileFeedVertical,#foryouList .feed-vertical{
      overscroll-behavior-y:contain;scroll-snap-type:y mandatory!important;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;
    }
    #feedVertical>.feed-item,#profileFeedVertical>.feed-item,#foryouList .feed-vertical>.feed-item{
      scroll-snap-align:start!important;scroll-snap-stop:always!important;transform:translateZ(0);
    }
    .feed-item.ls-upload-feed-item video{transform:translateZ(0);backface-visibility:hidden;image-rendering:auto}
    .feed-item.ls-upload-feed-item.ls-feed-active video{will-change:transform}
    .ls-mp4-sound{
      position:absolute;left:14px;top:58px;z-index:16;display:flex;align-items:center;gap:7px;
      min-height:40px;padding:0 12px;border:1px solid rgba(255,255,255,.33);border-radius:999px;
      background:rgba(3,6,9,.82);color:#fff;font:850 10px 'JetBrains Mono',monospace;letter-spacing:.06em;
      box-shadow:0 8px 25px rgba(0,0,0,.42),0 0 18px rgba(89,216,255,.20);backdrop-filter:blur(9px);
      animation:lsSoundGlow 1.8s ease-in-out infinite;cursor:pointer;
    }
    .ls-mp4-sound span{font-size:19px;filter:drop-shadow(0 0 7px #59d8ff)}
    .ls-mp4-sound.is-on{border-color:rgba(69,230,168,.72);color:#bfffe6;animation:none;box-shadow:0 8px 25px rgba(0,0,0,.42),0 0 20px rgba(69,230,168,.24)}
    @keyframes lsSoundGlow{50%{border-color:rgba(89,216,255,.78);box-shadow:0 8px 25px rgba(0,0,0,.42),0 0 26px rgba(89,216,255,.36)}}
    html.ls7-app-runtime #appView,.ls7-mobile-menu-panel{transform:translateZ(0);backface-visibility:hidden}
    html.ls7-app-runtime .feed-action-btn,html.ls7-app-runtime .nav-btn,html.ls7-app-runtime button{transition-timing-function:cubic-bezier(.22,.8,.25,1)!important}
    html.ls7-app-runtime .feed-phone{box-shadow:0 12px 34px rgba(0,0,0,.32)!important}
    html.ls7-app-runtime .feed-item.ls-upload-feed-item .feed-phone:after{
      content:"";position:absolute;inset:0;pointer-events:none;z-index:2;
      box-shadow:inset 0 0 55px rgba(86,105,255,.055),inset 0 -90px 90px rgba(0,0,0,.18);
    }
    @media(max-width:700px){
      html.ls7-app-runtime .feed-action-btn{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
      html.ls7-app-runtime .feed-phone{contain:layout paint style}
    }
    @media(prefers-reduced-motion:reduce){.ls-mp4-sound{animation:none}}
  `;
  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", ensureFeedPolishStyles);

function toggleFeedVideoSound(button) {
  const video = button?.closest(".dbltap-like-zone")?.querySelector("video");
  if (!video) return;
  const wantsSound = video.dataset.lsSoundWanted !== "1";
  video.dataset.lsSoundWanted = wantsSound ? "1" : "0";
  video.volume = 1;
  const frameReady = video.closest(".feed-embed-frame")?.classList.contains("ls-video-frame-ready");
  video.muted = !(wantsSound && frameReady);
  button.classList.toggle("is-on", wantsSound);
  button.querySelector("span").textContent = wantsSound ? "🔊" : "🔇";
  button.querySelector("b").textContent = wantsSound ? "SONIDO ACTIVO" : "ACTIVAR SONIDO";
  if (wantsSound) video.play().catch(() => {});
}

function setupOneVideoScroll(container) {
  if (!container || container.dataset.oneVideoScroll === "1") return;
  container.dataset.oneVideoScroll = "1";
  let startIndex = 0, startY = 0, settling = false;
  const items = () => Array.from(container.children).filter(el => el.classList.contains("feed-item"));
  const nearestIndex = () => {
    const rows = items();
    let best = 0, distance = Infinity;
    rows.forEach((row,index) => {
      const d = Math.abs(row.offsetTop - container.scrollTop);
      if (d < distance) { distance = d; best = index; }
    });
    return best;
  };
  const go = index => {
    const rows = items();
    const target = rows[Math.max(0,Math.min(rows.length - 1,index))];
    if (!target) return;
    settling = true;
    container.scrollTo({ top:target.offsetTop, behavior:"smooth" });
    setTimeout(() => { settling = false; }, 420);
  };
  container.addEventListener("touchstart", event => {
    startIndex = nearestIndex();
    startY = event.touches[0]?.clientY || 0;
  }, { passive:true });
  container.addEventListener("touchend", event => {
    const endY = event.changedTouches[0]?.clientY || startY;
    const delta = startY - endY;
    if (Math.abs(delta) < 34) return go(startIndex);
    requestAnimationFrame(() => go(startIndex + (delta > 0 ? 1 : -1)));
  }, { passive:true });
  container.addEventListener("wheel", event => {
    if (settling || Math.abs(event.deltaY) < 8) return;
    event.preventDefault();
    go(nearestIndex() + (event.deltaY > 0 ? 1 : -1));
  }, { passive:false });
}

function showToast(msg, type = "") {
  ensureModernToastStyles();
  const wrap = document.getElementById("toastWrap");
  if (!wrap) return;
  const message = String(msg || "Aviso");
  const normalized = String(type || "").toLowerCase();
  const isError = normalized === "error" || /no se pudo|error|cancelad|bloquead/i.test(message);
  const isSuccess = normalized === "success" || /✓|listo|publicad|actualizad|guardad|activad|enviad|copiad|restaurad/i.test(message);
  const kind = isError ? "error" : (isSuccess ? "success" : "info");
  const meta = {
    error:{ icon:"!", title:"Revisá esto" },
    success:{ icon:"✓", title:"Todo listo" },
    info:{ icon:"i", title:"LiveScroll" }
  }[kind];
  const t = document.createElement("div");
  t.className = `ls-modern-toast is-${kind}`;
  t.setAttribute("role", kind === "error" ? "alert" : "status");
  t.innerHTML = `<span class="ls-toast-icon" aria-hidden="true">${meta.icon}</span><span class="ls-toast-copy"><strong class="ls-toast-title">${meta.title}</strong><span class="ls-toast-message"></span></span>`;
  t.querySelector(".ls-toast-message").textContent = message;
  wrap.appendChild(t);
  while (wrap.children.length > 3) wrap.firstElementChild?.remove();
  const removeToast = () => {
    if (!t.isConnected) return;
    t.classList.add("is-leaving");
    setTimeout(() => t.remove(), 240);
  };
  t.addEventListener("click", removeToast, { once:true });
  setTimeout(removeToast, kind === "error" ? 4200 : 3000);
}

// ============================================================
// FEED — ver videos de otros y ganar puntos por minuto
// ============================================================
function ensureFeedExperience592Styles() {
  if (document.getElementById("lsFeedExperience592Styles")) return;
  const style = document.createElement("style");
  style.id = "lsFeedExperience592Styles";
  style.textContent = `
    html:not(.ls-legacy) .feed-item {
      background:
        radial-gradient(circle at 50% 34%,rgba(56,221,242,.055),transparent 46%),
        transparent;
    }

    html:not(.ls-legacy) .feed-phone {
      border:1px solid rgba(56,221,242,.19) !important;
      background:#020608;
      box-shadow:
        0 26px 76px rgba(0,0,0,.48),
        0 0 0 1px rgba(46,242,124,.035),
        0 0 46px rgba(56,221,242,.055) !important;
    }

    html:not(.ls-legacy) .feed-phone::before {
      content:"";
      position:absolute;
      inset:0;
      z-index:3;
      pointer-events:none;
      border-radius:inherit;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.07);
    }

    html:not(.ls-legacy) .feed-overlay {
      min-height:154px;
      padding:50px 76px 22px 18px;
      background:linear-gradient(180deg,transparent 0%,rgba(1,5,7,.18) 18%,rgba(2,7,10,.92) 74%,rgba(2,7,10,.985) 100%);
      gap:10px;
      pointer-events:none;
    }

    html:not(.ls-legacy) .feed-overlay > div:first-child {
      min-width:0;
      max-width:100%;
      pointer-events:auto;
    }

    html:not(.ls-legacy) .feed-overlay .title {
      max-width:100%;
      margin:0 0 8px;
      overflow:hidden;
      text-overflow:ellipsis;
      font-family:'Space Grotesk',sans-serif;
      font-size:17px;
      font-weight:700;
      line-height:1.22;
      letter-spacing:-.025em;
      color:#fff;
      text-shadow:0 2px 14px rgba(0,0,0,.7);
    }

    html:not(.ls-legacy) .feed-overlay .author {
      display:flex;
      align-items:center;
      gap:6px;
      flex-wrap:wrap;
      width:max-content;
      max-width:100%;
      color:rgba(244,251,252,.78);
      font-size:11px;
      font-weight:650;
    }

    html:not(.ls-legacy) .feed-platform-chip {
      display:inline-flex;
      align-items:center;
      min-height:20px;
      padding:3px 7px;
      border:1px solid rgba(56,221,242,.19);
      border-radius:999px;
      background:rgba(56,221,242,.075);
      color:#8beaf5;
      font:700 8px 'JetBrains Mono',monospace;
      letter-spacing:.06em;
      text-transform:uppercase;
    }

    html:not(.ls-legacy) .feed-overlay .live-pts {
      position:absolute;
      right:14px;
      bottom:24px;
      min-width:48px;
      padding:6px 8px;
      border:1px solid rgba(46,242,124,.22);
      border-radius:999px;
      background:rgba(6,24,17,.72);
      color:var(--gold);
      text-align:center;
      box-shadow:0 8px 22px rgba(0,0,0,.20);
      backdrop-filter:blur(8px);
    }

    html:not(.ls-legacy) .feed-actions {
      right:12px !important;
      bottom:112px !important;
      gap:10px;
      z-index:14;
    }

    html:not(.ls-legacy) .feed-action-btn {
      position:relative;
      width:46px;
      height:46px;
      border:1px solid rgba(255,255,255,.15);
      background:linear-gradient(145deg,rgba(13,32,40,.82),rgba(4,12,16,.72));
      color:#fff;
      box-shadow:0 10px 26px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.07);
      backdrop-filter:blur(12px) saturate(130%);
      -webkit-backdrop-filter:blur(12px) saturate(130%);
      transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease;
    }

    html:not(.ls-legacy) .feed-action-btn:hover {
      transform:translateY(-2px) scale(1.03);
      border-color:rgba(56,221,242,.38);
      background:linear-gradient(145deg,rgba(18,48,58,.92),rgba(6,21,27,.86));
      box-shadow:0 13px 30px rgba(0,0,0,.34),0 0 18px rgba(56,221,242,.08);
    }

    html:not(.ls-legacy) .feed-action-btn:active {
      transform:scale(.92);
    }

    html:not(.ls-legacy) .feed-action-btn.liked {
      border-color:rgba(248,113,113,.45);
      background:linear-gradient(145deg,rgba(248,113,113,.30),rgba(80,16,28,.72));
      box-shadow:0 10px 28px rgba(248,113,113,.12),inset 0 1px 0 rgba(255,255,255,.08);
    }

    html:not(.ls-legacy) .feed-action-btn::after {
      content:attr(data-label);
      position:absolute;
      right:54px;
      top:50%;
      transform:translateY(-50%) translateX(5px);
      padding:5px 8px;
      border:1px solid rgba(56,221,242,.16);
      border-radius:8px;
      background:rgba(4,13,17,.9);
      color:rgba(255,255,255,.78);
      font:700 8px 'JetBrains Mono',monospace;
      letter-spacing:.04em;
      white-space:nowrap;
      opacity:0;
      pointer-events:none;
      transition:opacity .15s ease,transform .15s ease;
    }

    html:not(.ls-legacy) .feed-action-btn:hover::after {
      opacity:1;
      transform:translateY(-50%) translateX(0);
    }

    html:not(.ls-legacy) .feed-nudge {
      border:1px solid rgba(255,255,255,.10);
      background:rgba(4,13,17,.58);
      color:rgba(255,255,255,.66);
      box-shadow:0 8px 24px rgba(0,0,0,.18);
      backdrop-filter:blur(8px);
    }

    html.ls-legacy .feed-action-btn {
      border:1px solid rgba(255,255,255,.10);
      background:rgba(0,0,0,.58);
      box-shadow:none;
      backdrop-filter:none;
    }

    html.ls-legacy .feed-action-btn::after {
      display:none;
    }

    @media(max-width:700px) {
      html:not(.ls-legacy) #feedVertical .feed-overlay,
      html:not(.ls-legacy) #profileFeedVertical .feed-overlay,
      html:not(.ls-legacy) #foryouList .feed-overlay {
        left:0 !important;
        right:0 !important;
        bottom:0 !important;
        padding:52px 76px max(22px,env(safe-area-inset-bottom)) 16px !important;
      }

      html:not(.ls-legacy) .feed-item.ls-upload-feed-item .feed-overlay {
        bottom:52px !important;
      }

      html:not(.ls-legacy) #feedVertical .feed-actions,
      html:not(.ls-legacy) #profileFeedVertical .feed-actions,
      html:not(.ls-legacy) #foryouList .feed-actions {
        right:10px !important;
        bottom:112px !important;
      }

      html:not(.ls-legacy) .feed-item.ls-upload-feed-item .feed-actions {
        bottom:164px !important;
      }

      html:not(.ls-legacy) .feed-action-btn {
        width:44px;
        height:44px;
      }

      html:not(.ls-legacy) .feed-action-btn::after {
        display:none;
      }

      html:not(.ls-legacy) .feed-overlay .title {
        font-size:16px;
      }

      html:not(.ls-legacy) .feed-overlay .live-pts {
        right:13px;
        bottom:max(22px,env(safe-area-inset-bottom));
      }
    }
  `;
  document.head.appendChild(style);
}

async function renderFeed(renderToken = lsTabRenderToken) {
  ensureFeedExperience592Styles();
  const main = document.getElementById("appView");
  if (!main) return;

  main.innerHTML = `
    <div id="loginStreakBannerWrap" class="login-streak-banner-float"></div>
    <div id="lsDailyChallengeWrap"></div>
    <div id="lsGenerationFeedFilterWrap">${renderGenerationFeedFilter()}</div>
    <div id="feedList">${renderFastSkeleton(7, "feed")}</div>`;
  loadGenerationWeeklyPulse();
  checkAndShowLoginStreak();
  loadDailyChallenges();

  const feedResult = await loadFeedVideosCached();
  let videos = feedResult?.data || [];
  const error = feedResult?.error;

  // La preferencia "No me interesa" es privada y nunca borra el video.
  if (currentUser?.id && videos.length) {
    const { data:hiddenRows } = await sb
      .from("user_hidden_videos")
      .select("video_id")
      .eq("user_id", currentUser.id)
      .in("video_id", videos.map(v => v.id));
    const hiddenIds = new Set((hiddenRows || []).map(row => row.video_id));
    videos = videos.filter(video => !hiddenIds.has(video.id));
  }

  if (lsGenerationFeedFilter !== "all") {
    videos = videos.filter(video => video.client_origin === lsGenerationFeedFilter);
  }

  // Si el usuario ya tocó otra pestaña, esta respuesta vieja no pisa la nueva vista.
  if (renderToken !== lsTabRenderToken || currentTab !== "feed") return;

  const list = document.getElementById("feedList");
  if (!list) return;
  if (error) { list.textContent = "Error cargando videos: " + error.message; return; }
  if (!videos.length) {
    list.innerHTML = `<div style="padding:40px 0; text-align:center;">
      <h1 class="page-title">${lsGenerationFeedFilter === "all" ? "Mirá y ganá" : `Generación ${lsGenerationFeedFilter.toUpperCase()}`}</h1>
      <p style="color:var(--text-dim)">${lsGenerationFeedFilter === "all" ? "Todavía no hay videos de otros usuarios. ¡Subí el primero!" : "Todavía no hay publicaciones nuevas de esta generación."}</p>
    </div>`;
    return;
  }

  const { data: myLikes } = await sb
    .from("video_likes")
    .select("video_id")
    .eq("user_id", currentUser.id)
    .in("video_id", videos.map(v => v.id));
  const likedSet = new Set((myLikes || []).map(l => l.video_id));

  list.innerHTML = `
    <div class="feed-vertical" id="feedVertical">
      ${videos.map((v, i) => {
        const isMine = v.user_id === currentUser.id;
        return `
        <div class="feed-item${v.platform === "upload" ? " ls-upload-feed-item" : ""}" data-video-id="${v.id}" style="content-visibility:auto;contain-intrinsic-size:1px var(--ls-mobile-feed-height,720px);">
          <div class="feed-phone">
            <div class="feed-embed-frame" id="embed-${v.id}">${getEmbedPlaceholderHtml(v)}</div>
            ${isMine ? `<div style="position:absolute; top:14px; left:14px; background:rgba(0,0,0,0.6); color:var(--gold); font-size:11px; padding:4px 10px; border-radius:20px; z-index:6;">Tu video · sin puntos</div>` : ""}
            <div class="feed-actions">
              <button class="feed-action-btn ls-like-action-611 ${likedSet.has(v.id) ? "liked" : ""}" id="like-${v.id}" data-label="${likedSet.has(v.id) ? "Te gusta" : "Me gusta"}" aria-label="${likedSet.has(v.id) ? "Te gusta" : "Me gusta"}" aria-pressed="${likedSet.has(v.id)}" title="${likedSet.has(v.id) ? "Te gusta" : "Me gusta"}" onclick="handleLike('${v.id}')"><span>${likedSet.has(v.id) ? "♥" : "♡"}</span><i>${likedSet.has(v.id) ? "TU LIKE" : "LIKE"}</i></button>
              <button class="feed-action-btn ls-comment-action-611" data-label="Comentar" aria-label="Abrir comentarios" title="Comentarios" onclick="openComments('${v.id}')"><span>💬</span><i>COMENTAR</i></button>
              ${renderRuntimeShareButton(v)}
              ${!isMine ? renderRuntimeHideButton(v.id) : ""}
              ${!isMine ? renderRuntimeReportButton(v.id) : ""}
            </div>
            <div class="feed-overlay">
              <div>
                <div class="title">${escapeHtml(v.title)}</div>
                ${renderVideoHashtags(v)}
                <div class="author" style="cursor:pointer;" onclick="viewPublicProfile('${escapeHtml(v.profiles?.username || "")}')"><span>@${escapeHtml(v.profiles?.username || "usuario")}</span> ${getPlanBadgeHtml(v.profiles?.plan_id)} ${renderClientOriginBadge(v.client_origin)} <span class="feed-platform-chip">${escapeHtml(v.platform)}</span></div>
              </div>
              <div class="live-pts" id="pts-${v.id}"><span class="mono" id="secs-${v.id}">0s</span></div>
            </div>
            ${i === 0 ? `<div class="feed-nudge">Deslizá hacia arriba para el siguiente ↑</div>` : ""}
          </div>
        </div>`;
      }).join("")}
    </div>`;

  setupFeedObserver(videos);
  setupDoubleTapLike();
  fitMobileFeedViewport("feedVertical");
  setupPullToRefresh(renderFeed);
  setupSwipeNavigation("feed", { left: "foryou" });
}


let lsFeedViewportResizeBound = false;

function fitMobileFeedViewport(containerId = "feedVertical") {
  if (window.innerWidth > 700) return;

  const container = document.getElementById(containerId);
  if (!container) return;
  setupOneVideoScroll(container);

  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const top = Math.max(0, container.getBoundingClientRect().top);

  // Si el dock movil esta visible, el feed termina justo encima para que
  // los controles nativos del MP4 (sonido, progreso y pantalla completa)
  // nunca queden tapados. En un modal el dock ya queda por detras.
  const dock = document.getElementById("lsMobileDock");
  const feedIsInsideModal = !!container.closest("#globalModalWrap, .modal-overlay");
  const dockIsVisible = !!(
    dock &&
    !feedIsInsideModal &&
    window.getComputedStyle(dock).display !== "none"
  );
  const safeBottom = dockIsVisible
    ? Math.ceil(dock.getBoundingClientRect().height + 20)
    : 8;
  const usable = Math.max(430, Math.floor(viewportHeight - top - safeBottom));

  container.style.setProperty("--ls-mobile-feed-height", `${usable}px`);
  document.documentElement.style.setProperty("--ls-mobile-feed-height", `${usable}px`);

  if (!lsFeedViewportResizeBound) {
    lsFeedViewportResizeBound = true;

    const refresh = () => {
      const active =
        document.getElementById("profileFeedVertical") ||
        document.getElementById("feedVertical") ||
        document.querySelector("#foryouList .feed-vertical");

      if (active) fitMobileFeedViewport(active.id || "feedVertical");
    };

    window.addEventListener("resize", refresh, { passive:true });
    window.visualViewport?.addEventListener("resize", refresh, { passive:true });
  }
}

function setupPullToRefresh(refreshFn) {
  const container = document.getElementById("feedVertical");
  if (!container) return;

  let startY = 0, pulling = false, indicator = null;

  container.addEventListener("touchstart", (e) => {
    pulling = container.scrollTop <= 0;
    startY = e.touches[0].clientY;
  }, { passive: true });

  container.addEventListener("touchmove", (e) => {
    if (!pulling || container.scrollTop > 0) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY <= 0) return;

    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "pullRefreshIndicator";
      indicator.style.cssText = "position:absolute; top:0; left:0; right:0; text-align:center; padding:14px; color:var(--gold); font-size:13px; z-index:15;";
      container.style.position = "relative";
      container.prepend(indicator);
    }
    const pull = Math.min(deltaY, 100);
    indicator.style.transform = `translateY(${pull}px)`;
    indicator.textContent = pull > 70 ? "🔄 Soltá para actualizar" : "⬇️ Deslizá para actualizar";
    indicator.dataset.pull = pull;
  }, { passive: true });

  container.addEventListener("touchend", () => {
    if (!pulling) return;
    pulling = false;
    if (!indicator) return;
    const pullAmount = parseInt(indicator.dataset.pull || 0, 10);
    indicator.remove();
    indicator = null;
    if (pullAmount > 70) {
      showToast("Actualizando...");
      refreshFn();
    }
  }, { passive: true });
}

function setupDoubleTapLike() {
  document.querySelectorAll(".dbltap-like-zone").forEach(zone => {
    let lastTap = 0;
    zone.addEventListener("touchend", () => {
      const now = Date.now();
      if (now - lastTap < 350) {
        const videoId = zone.dataset.videoId;
        handleLike(videoId);
        showHeartPop(zone);
      }
      lastTap = now;
    });
  });
}

function showHeartPop(container) {
  const heart = document.createElement("div");
  heart.textContent = "❤️";
  heart.style.cssText = "position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:70px; z-index:20; pointer-events:none; animation:heartPop 0.6s ease forwards;";
  container.style.position = "relative";
  container.appendChild(heart);
  setTimeout(() => heart.remove(), 600);
}

function setupSwipeNavigation(fromTab, targets) {
  const container = document.getElementById("feedVertical");
  if (!container) return;

  let startX = 0, startY = 0, tracking = false;

  container.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  }, { passive: true });

  container.addEventListener("touchend", (e) => {
    if (!tracking) return;
    tracking = false;
    const deltaX = e.changedTouches[0].clientX - startX;
    const deltaY = e.changedTouches[0].clientY - startY;

    if (Math.abs(deltaX) < 70 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return; // no fue un swipe lateral claro

    if (deltaX < 0 && targets.left) { switchTab(targets.left); }
    else if (deltaX > 0 && targets.right) { switchTab(targets.right); }
  }, { passive: true });
}

function preloadFeedVideo(video) {
  if (!video || loadedEmbeds.has(video.id)) return;
  const el = document.getElementById(`embed-${video.id}`);
  if (!el || video.platform !== "upload" || !isSafeUrl(video.video_url)) return;

  const saveData = navigator.connection?.saveData === true;
  const slowNetwork = ["slow-2g", "2g"].includes(navigator.connection?.effectiveType);
  const isLegacyMode = document.documentElement.classList.contains("ls-legacy");

  if (saveData || slowNetwork || isLegacyMode) return;

  el.innerHTML = `<div class="dbltap-like-zone" data-video-id="${video.id}" style="width:100%;height:100%;position:relative;">
    <video src="${escapeHtml(video.video_url)}" ${video.thumbnail_url && isSafeUrl(video.thumbnail_url) ? `poster="${escapeHtml(video.thumbnail_url)}"` : ""} controls muted loop playsinline preload="metadata" style="width:100%;height:100%;object-fit:contain;"></video>
    <button type="button" class="ls-mp4-sound" onclick="event.stopPropagation();toggleFeedVideoSound(this)"><span>🔇</span><b>ACTIVAR SONIDO</b></button>
  </div>`;
  loadedEmbeds.add(video.id);
}

function activateLoadedEmbed(video) {
  if (!video) return;
  const player = document.querySelector(`#embed-${video.id} video`);
  if (!player) return;

  // Cada activación recibe un identificador. Así una respuesta de carga antigua
  // nunca puede volver a reproducir audio cuando la tarjeta ya salió de pantalla.
  const requestId = String((Number(player.dataset.lsPlaybackRequest || 0) + 1));
  player.dataset.lsPlaybackRequest = requestId;
  player.dataset.lsPlaybackWanted = "1";
  player.autoplay = true;

  const isStillActive = () =>
    player.isConnected &&
    player.dataset.lsPlaybackWanted === "1" &&
    player.dataset.lsPlaybackRequest === requestId &&
    player.closest(".feed-item")?.classList.contains("ls-feed-active");

  const markDecodedFrame = () => {
    if (!isStillActive()) return;
    const frame = player.closest(".feed-embed-frame");
    frame?.classList.add("ls-video-frame-ready");
    frame?.classList.remove("ls-video-frame-buffering");
    if (player.dataset.lsSoundWanted === "1") player.muted = false;
  };

  const startPlayback = () => {
    if (!isStillActive()) return;
    const frame = player.closest(".feed-embed-frame");
    frame?.classList.add("ls-video-frame-buffering");
    frame?.classList.remove("ls-video-frame-ready");
    // El audio espera al primer cuadro decodificado para no sonar sobre una
    // pantalla negra. La preferencia del usuario se conserva en el dataset.
    player.muted = true;

    player.play()
      .then(() => {
        if (!isStillActive()) {
          try { player.pause(); } catch (_) {}
          return;
        }
        if (typeof player.requestVideoFrameCallback === "function") {
          player.requestVideoFrameCallback(markDecodedFrame);
        } else {
          // WebViews antiguos no confirman el cuadro decodificado. Dejamos
          // pasar dos repintados y un margen corto antes de devolver el sonido.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setTimeout(markDecodedFrame, 90));
          });
        }
      })
      .catch(() => frame?.classList.remove("ls-video-frame-buffering"));
  };

  if (player.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) startPlayback();
  else player.addEventListener("loadeddata", startPlayback, { once:true });
}

function pauseFeedMedia(videoId = null) {
  const selector = videoId
    ? `#embed-${videoId} video, #embed-${videoId} audio`
    : ".feed-item video, .feed-item audio";

  document.querySelectorAll(selector).forEach(media => {
    media.dataset.lsPlaybackWanted = "0";
    media.dataset.lsPlaybackRequest = String(Number(media.dataset.lsPlaybackRequest || 0) + 1);
    media.autoplay = false;
    media.closest(".feed-embed-frame")?.classList.remove("ls-video-frame-buffering");
    try { media.pause(); } catch (_) {}
  });
}

function pauseAllFeedMediaExcept(videoId) {
  document.querySelectorAll(".feed-item video, .feed-item audio").forEach(media => {
    const host = media.closest("[id^='embed-']");
    const hostId = host?.id?.replace("embed-", "");
    if (String(hostId) !== String(videoId)) {
      media.dataset.lsPlaybackWanted = "0";
      media.dataset.lsPlaybackRequest = String(Number(media.dataset.lsPlaybackRequest || 0) + 1);
      media.autoplay = false;
      media.closest(".feed-embed-frame")?.classList.remove("ls-video-frame-buffering");
      try { media.pause(); } catch (_) {}
    }
  });
}

function releaseFeedMediaElement(el) {
  if (!el) return;

  el.querySelectorAll("video, audio").forEach(media => {
    media.dataset.lsPlaybackWanted = "0";
    media.dataset.lsPlaybackRequest = String(Number(media.dataset.lsPlaybackRequest || 0) + 1);
    media.autoplay = false;
    try { media.pause(); } catch (_) {}
    try {
      media.removeAttribute("src");
      media.load();
    } catch (_) {}
  });

  el.querySelectorAll("iframe").forEach(frame => {
    try { frame.src = "about:blank"; } catch (_) {}
  });
}

function setupFeedObserver(videos) {
  const videoMap = Object.fromEntries(videos.map(v => [String(v.id), v]));
  const orderedIds = videos.map(v => String(v.id));
  loadedEmbeds.clear();

  const keepWarmAround = (videoId) => {
    const idx = orderedIds.indexOf(String(videoId));
    if (idx < 0) return;
    const isLegacyMode = document.documentElement.classList.contains("ls-legacy");
    const keep = new Set((isLegacyMode
      ? [orderedIds[idx]]
      : [orderedIds[idx], orderedIds[idx + 1]]).filter(Boolean));
    const nextId = orderedIds[idx + 1];
    if (!isLegacyMode && nextId && videoMap[nextId]) preloadFeedVideo(videoMap[nextId]);

    Array.from(loadedEmbeds).forEach(id => {
      if (!keep.has(String(id))) unloadEmbed(id, videoMap[String(id)]);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const videoId = String(entry.target.dataset.videoId);
      if (entry.isIntersecting && entry.intersectionRatio > 0.58) {
        entry.target.classList.add("ls-feed-active");
        pauseAllFeedMediaExcept(videoId);
        loadEmbed(videoMap[videoId]);
        activateLoadedEmbed(videoMap[videoId]);
        keepWarmAround(videoId);
        startWatching(videoMap[videoId]);
      } else if (entry.intersectionRatio < 0.25) {
        entry.target.classList.remove("ls-feed-active");
        pauseFeedMedia(videoId);
        stopWatching(videoId);
      }
    });
  }, {
    threshold:[0,.25,.58,1],
    rootMargin:document.documentElement.classList.contains("ls-legacy") ? "4% 0px" : "12% 0px"
  });

  document.querySelectorAll(".feed-item").forEach(el => observer.observe(el));
  feedObserverInstance = observer;

  if (videos[0]) {
    loadEmbed(videos[0]);
    activateLoadedEmbed(videos[0]);
    if (!document.documentElement.classList.contains("ls-legacy") && videos[1]) preloadFeedVideo(videos[1]);
  }
}

function isSafeUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (e) {
    return false;
  }
}

function getEmbedPlaceholderHtml(video) {
  const icons = { tiktok: "🎵", kick: "🟢", twitch: "🟣", youtube: "🔴", upload: "🎬" };
  const thumb = (video.platform === "youtube" || video.platform === "upload") ? getThumbnailHtml(video) : "";

  if (video.platform === "upload" && thumb.startsWith("<video")) {
    return `<div class="feed-fallback" style="position:relative;overflow:hidden;">
      ${thumb
        .replace('preload="metadata"', 'preload="none"')
        .replace("<video ", `<video style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.7;pointer-events:none;" `)}
      <div class="platform-icon" style="position:relative;z-index:2;">▶️</div>
    </div>`;
  }

  return `<div class="feed-fallback">
    ${thumb && thumb.startsWith("<img") ? thumb.replace(/alt="[^"]*"/, 'alt="miniatura"').replace("<img ", `<img style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;opacity:0.55;" `) : ""}
    <div class="platform-icon" style="position:relative;">${icons[video.platform] || "▶️"}</div>
  </div>`;
}

function loadEmbed(video) {
  if (!video || loadedEmbeds.has(video.id)) return;
  const el = document.getElementById(`embed-${video.id}`);
  if (!el) return;
  el.innerHTML = getEmbedHtml(video);
  loadedEmbeds.add(video.id);
}

function unloadEmbed(videoId, video) {
  if (!loadedEmbeds.has(videoId)) return;
  const el = document.getElementById(`embed-${videoId}`);
  if (!el) return;

  releaseFeedMediaElement(el);
  el.innerHTML = video ? getEmbedPlaceholderHtml(video) : "";
  loadedEmbeds.delete(videoId);
}

function getEmbedHtml(video) {
  const url = video.video_url;
  if (!isSafeUrl(url)) {
    return `<div class="feed-fallback"><p>Link de video inválido.</p></div>`;
  }
  if (video.platform === "upload") {
    const isLegacyMode = document.documentElement.classList.contains("ls-legacy");
    return `<div class="dbltap-like-zone" data-video-id="${video.id}" style="width:100%; height:100%; position:relative;">
      <video src="${escapeHtml(url)}" ${video.thumbnail_url && isSafeUrl(video.thumbnail_url) ? `poster="${escapeHtml(video.thumbnail_url)}"` : ""} controls muted loop playsinline preload="${isLegacyMode ? "metadata" : "auto"}" style="width:100%;height:100%;object-fit:contain;"></video>
      <button type="button" class="ls-mp4-sound" onclick="event.stopPropagation();toggleFeedVideoSound(this)"><span>🔇</span><b>ACTIVAR SONIDO</b></button>
    </div>`;
  }
  if (video.platform === "youtube") {
    const id = extractYoutubeId(url);
    if (id) return `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&mute=1&playsinline=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  }
  if (video.platform === "twitch") {
    const twitch = extractTwitchVideo(url);
    if (twitch?.type === "clip") return `<iframe src="https://clips.twitch.tv/embed?clip=${encodeURIComponent(twitch.id)}&parent=${encodeURIComponent(location.hostname)}&autoplay=true&muted=true" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    if (twitch?.type === "video") return `<iframe src="https://player.twitch.tv/?video=v${encodeURIComponent(twitch.id)}&parent=${encodeURIComponent(location.hostname)}&autoplay=true&muted=true" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  }
  if (video.platform === "kick") {
    return getExternalVideoCard("kick", url, "Kick protege algunos videos contra la reproducción externa.");
  }
  if (video.platform === "tiktok") {
    const id = extractTikTokVideoId(url);
    if (id) return `<iframe src="https://www.tiktok.com/player/v1/${encodeURIComponent(id)}?autoplay=1&loop=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  }
  if (["kick", "twitch", "tiktok"].includes(video.platform)) {
    return getExternalVideoCard(video.platform, url, `Este enlace se reproduce directamente en ${video.platform === "tiktok" ? "TikTok" : video.platform === "twitch" ? "Twitch" : "Kick"}.`);
  }
  const icons = { tiktok: "🎵", kick: "🟢", twitch: "🟣" };
  return `<div class="feed-fallback">
    <div class="platform-icon">${icons[video.platform] || "▶️"}</div>
    <p>Este video se ve mejor en ${escapeHtml(video.platform)}</p>
    <a class="btn" href="${escapeHtml(url)}" target="_blank" rel="noopener">Abrir y mirar ahí</a>
  </div>`;
}

function extractTwitchVideo(value) {
  try {
    const parsed = new URL(String(value || "").trim());
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "clips.twitch.tv") {
      const id = parsed.pathname.split("/").filter(Boolean)[0] || "";
      return /^[A-Za-z0-9_-]+$/.test(id) ? { type:"clip", id } : null;
    }
    if (host !== "twitch.tv" && host !== "m.twitch.tv") return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts[0] === "videos" && /^\d+$/.test(parts[1] || "")) return { type:"video", id:parts[1] };
    const clipIndex = parts.indexOf("clip");
    if (clipIndex >= 0 && /^[A-Za-z0-9_-]+$/.test(parts[clipIndex + 1] || "")) return { type:"clip", id:parts[clipIndex + 1] };
  } catch (_) {}
  return null;
}

function extractTikTokVideoId(value) {
  try {
    const parsed = new URL(String(value || "").trim());
    if (!/(^|\.)tiktok\.com$/i.test(parsed.hostname)) return null;
    const match = parsed.pathname.match(/\/video\/(\d{8,30})/);
    return match ? match[1] : null;
  } catch (_) { return null; }
}

function ensureExternalVideoCardStyles() {
  if (document.getElementById("lsExternalVideoCardStyles")) return;
  const style = document.createElement("style");
  style.id = "lsExternalVideoCardStyles";
  style.textContent = `
    .ls-external-video-card{--platform:#53fc18;position:relative!important;isolation:isolate;overflow:hidden!important;display:flex!important;align-items:flex-start!important;justify-content:flex-end!important;gap:0!important;padding:24px 22px 28px!important;text-align:left!important;background:radial-gradient(circle at 18% 14%,color-mix(in srgb,var(--platform) 22%,transparent),transparent 38%),linear-gradient(155deg,#111720 0%,#070a0e 58%,#020304 100%)!important}
    .ls-external-video-card[data-platform="twitch"]{--platform:#9146ff}.ls-external-video-card[data-platform="tiktok"]{--platform:#25f4ee}.ls-external-video-card::before{content:"";position:absolute;z-index:-1;width:68%;aspect-ratio:1;left:-22%;top:-24%;border:1px solid color-mix(in srgb,var(--platform) 38%,transparent);border-radius:50%;box-shadow:0 0 80px color-mix(in srgb,var(--platform) 12%,transparent);animation:lsExternalOrbit 9s linear infinite}.ls-external-video-card::after{content:"";position:absolute;z-index:-1;inset:-45% -70%;background:linear-gradient(110deg,transparent 43%,color-mix(in srgb,var(--platform) 13%,transparent) 50%,transparent 57%);animation:lsExternalScan 3.8s ease-in-out infinite}
    .ls-external-brand{display:grid;grid-template-columns:52px minmax(0,1fr);align-items:center;gap:13px;width:100%;margin:auto 0 18px}.ls-external-brand-logo{width:52px;height:52px;padding:12px;border:1px solid color-mix(in srgb,var(--platform) 50%,transparent);border-radius:16px;background:rgba(0,0,0,.42);box-shadow:0 12px 30px rgba(0,0,0,.34),0 0 22px color-mix(in srgb,var(--platform) 15%,transparent)}.ls-external-brand-logo img{display:block;width:100%;height:100%;object-fit:contain}.ls-external-brand-copy{min-width:0}.ls-external-brand-copy small{display:block;margin-bottom:5px;color:var(--platform);font:900 8px 'JetBrains Mono',monospace;letter-spacing:.16em}.ls-external-brand-copy strong{display:block;color:#fff;font-size:21px;line-height:1.05}.ls-external-brand-copy span{display:block;margin-top:6px;color:#aab4c2;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ls-external-video-card .ls-external-reason{max-width:330px;margin:0 0 16px!important;color:#c1c8d1!important;font-size:11px!important;line-height:1.5}.ls-external-open{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:44px;padding:11px 14px;border:1px solid color-mix(in srgb,var(--platform) 58%,transparent);border-radius:13px;background:color-mix(in srgb,var(--platform) 16%,rgba(0,0,0,.7));color:#fff!important;text-decoration:none;font-size:12px;font-weight:900;box-shadow:0 10px 26px rgba(0,0,0,.28);transition:transform .18s ease,background .18s ease}.ls-external-open:hover{transform:translateY(-2px);background:color-mix(in srgb,var(--platform) 25%,rgba(0,0,0,.7))}.ls-external-open b{color:var(--platform);font-size:17px}
    @keyframes lsExternalOrbit{to{transform:rotate(360deg)}}@keyframes lsExternalScan{0%,20%{transform:translateX(-30%)}80%,100%{transform:translateX(30%)}}
    .ls-legacy .ls-external-video-card::before,.ls-legacy .ls-external-video-card::after{animation:none!important;display:none}.ls-legacy .ls-external-video-card{background:#10151c!important}
    @media (prefers-reduced-motion:reduce){.ls-external-video-card::before,.ls-external-video-card::after{animation:none!important}}
  `;
  document.head.appendChild(style);
}

function getExternalVideoIdentity(platform, url) {
  const config = {
    kick:{ label:"Kick", brand:"kick", color:"53FC18" },
    twitch:{ label:"Twitch", brand:"twitch", color:"9146FF" },
    tiktok:{ label:"TikTok", brand:"tiktok", color:"FFFFFF" }
  }[platform] || { label:"Plataforma", brand:"playstation", color:"FFFFFF" };
  let handle = "Contenido externo";
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    const candidate = platform === "tiktok" && parts[0]?.startsWith("@") ? parts[0] : parts[0];
    if (candidate && candidate.length <= 50) handle = candidate.startsWith("@") ? candidate : `@${candidate}`;
  } catch (_) {}
  return { ...config, handle };
}

function getExternalVideoCard(platform, url, reason = "") {
  ensureExternalVideoCardStyles();
  const identity = getExternalVideoIdentity(platform, url);
  return `<div class="feed-fallback ls-external-video-card" data-platform="${escapeHtml(platform)}">
    <div class="ls-external-brand">
      <div class="ls-external-brand-logo"><img src="${getSocialBrandIconUrl(identity.brand,identity.color)}" alt="" loading="lazy" decoding="async"></div>
      <div class="ls-external-brand-copy"><small>CONTENIDO EN ${identity.label.toUpperCase()}</small><strong>${identity.label}</strong><span>${escapeHtml(identity.handle)}</span></div>
    </div>
    ${reason ? `<p class="ls-external-reason">${escapeHtml(reason)}</p>` : ""}
    <a class="ls-external-open" href="${escapeHtml(url)}" target="_blank" rel="noopener"><span>Abrir y reproducir</span><b>↗</b></a>
  </div>`;
}

async function openSharedVideo(videoId) {
  const { data: video } = await sb
    .from("videos")
    .select("*, profiles!videos_user_id_fkey(username, plan_id)")
    .eq("id", videoId)
    .single();
  if (!video) return;

  openProfileVideoFeed([video], video.id, { username: video.profiles?.username || "usuario", plan_id: video.profiles?.plan_id });
}

async function openProfileVideoFeed(videos, startVideoId, authorInfo) {
  const { data: myLikes } = await sb
    .from("video_likes")
    .select("video_id")
    .eq("user_id", currentUser.id)
    .in("video_id", videos.map(v => v.id));
  const likedSet = new Set((myLikes || []).map(l => l.video_id));

  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div id="profileFeedOverlay" style="position:fixed; inset:0; background:var(--ink); z-index:150;">
      <button onclick="closeProfileVideoFeed()" style="position:absolute; top:max(14px, env(safe-area-inset-top)); right:14px; z-index:20; background:rgba(0,0,0,0.55); border:none; color:#fff; width:36px; height:36px; border-radius:50%; font-size:18px; cursor:pointer;">✕</button>
      <div class="feed-vertical" id="profileFeedVertical" style="height:100dvh; margin:0;">
        ${videos.map((v) => {
          const isMine = v.user_id === currentUser.id;
          return `
          <div class="feed-item${v.platform === "upload" ? " ls-upload-feed-item" : ""}" data-video-id="${v.id}" style="content-visibility:auto;contain-intrinsic-size:1px var(--ls-mobile-feed-height,720px);">
            <div class="feed-phone">
              <div class="feed-embed-frame" id="embed-${v.id}">${getEmbedPlaceholderHtml(v)}</div>
              ${isMine ? `<div style="position:absolute; top:14px; left:14px; background:rgba(0,0,0,0.6); color:var(--gold); font-size:11px; padding:4px 10px; border-radius:20px; z-index:6;">Tu video · sin puntos</div>` : ""}
              <div class="feed-actions">
                <button class="feed-action-btn ls-like-action-611 ${likedSet.has(v.id) ? "liked" : ""}" id="like-${v.id}" data-label="${likedSet.has(v.id) ? "Te gusta" : "Me gusta"}" aria-label="${likedSet.has(v.id) ? "Te gusta" : "Me gusta"}" aria-pressed="${likedSet.has(v.id)}" title="${likedSet.has(v.id) ? "Te gusta" : "Me gusta"}" onclick="handleLike('${v.id}')"><span>${likedSet.has(v.id) ? "♥" : "♡"}</span><i>${likedSet.has(v.id) ? "TU LIKE" : "LIKE"}</i></button>
                <button class="feed-action-btn ls-comment-action-611" data-label="Comentar" aria-label="Abrir comentarios" title="Comentarios" onclick="openComments('${v.id}')"><span>💬</span><i>COMENTAR</i></button>
                ${renderRuntimeShareButton(v)}
                ${!isMine ? renderRuntimeReportButton(v.id) : ""}
              </div>
              <div class="feed-overlay">
                <div>
                  <div class="title">${escapeHtml(v.title)}</div>
                  <div class="author"><span>@${escapeHtml(authorInfo.username)}</span> ${getPlanBadgeHtml(authorInfo.plan_id)} ${renderClientOriginBadge(v.client_origin)} <span class="feed-platform-chip">${escapeHtml(v.platform)}</span></div>
                </div>
                <div class="live-pts" id="pts-${v.id}"><span class="mono" id="secs-${v.id}">0s</span></div>
              </div>
            </div>
          </div>`;
        }).join("")}
      </div>
    </div>`;

  setupFeedObserver(videos);
  setupDoubleTapLike();
  fitMobileFeedViewport("profileFeedVertical");

  const container = document.getElementById("profileFeedVertical");
  const startEl = document.querySelector(`#profileFeedVertical [data-video-id="${startVideoId}"]`);
  if (container && startEl) container.scrollTop = startEl.offsetTop;
}

function closeProfileVideoFeed() {
  clearAllWatchIntervals();
  closeManagedModal();
}

function getGridCoverHtml(video) {
  const thumb = getThumbnailHtml(video);

  if (thumb.startsWith("<img")) {
    return thumb.replace("<img ", `<img style="width:100%;height:100%;object-fit:cover;" `);
  }

  if (thumb.startsWith("<video")) {
    return thumb;
  }

  return `<div class="grid-fallback">${thumb}</div>`;
}

let lsProfilePreviewObserver = null;
let lsProfilePreviewQueue = [];
let lsProfilePreviewBusy = false;

function lsLoadNextProfilePreview() {
  if (lsProfilePreviewBusy) return;
  const cover = lsProfilePreviewQueue.shift();
  if (!cover) return;
  if (!cover.isConnected || cover.dataset.lsPreviewLoaded === "1") {
    requestAnimationFrame(lsLoadNextProfilePreview);
    return;
  }

  const video = cover.querySelector("video");
  const src = cover.dataset.lsPreviewSrc;
  if (!video || !src) {
    requestAnimationFrame(lsLoadNextProfilePreview);
    return;
  }

  lsProfilePreviewBusy = true;
  cover.dataset.lsPreviewLoaded = "1";
  video.preload = "metadata";
  video.src = src;

  let completed = false;
  const finish = () => {
    if (completed) return;
    completed = true;
    cover.classList.add("ls-preview-ready");
    lsProfilePreviewBusy = false;
    setTimeout(lsLoadNextProfilePreview, 90);
  };
  video.addEventListener("loadeddata", finish, { once:true });
  video.addEventListener("error", finish, { once:true });
  setTimeout(finish, 2200);
  video.load();
}

function initLazyProfilePreviews() {
  if (lsProfilePreviewObserver) lsProfilePreviewObserver.disconnect();
  lsProfilePreviewQueue = [];
  lsProfilePreviewBusy = false;
  const covers = document.querySelectorAll(".ls-lazy-video-cover[data-ls-preview-src]");
  document.querySelectorAll(".video-grid-tile > img").forEach((image, index) => {
    image.decoding = "async";
    if (index < 4) image.loading = "eager";
    image.fetchPriority = index < 3 ? "high" : "low";
  });
  if (!covers.length) return;

  if (!("IntersectionObserver" in window)) {
    lsProfilePreviewQueue = Array.from(covers).slice(0, 6);
    lsLoadNextProfilePreview();
    return;
  }

  lsProfilePreviewObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      lsProfilePreviewObserver.unobserve(entry.target);
      if (!lsProfilePreviewQueue.includes(entry.target)) lsProfilePreviewQueue.push(entry.target);
    });
    lsLoadNextProfilePreview();
  }, { root:null, rootMargin:"220px 0px", threshold:0.01 });

  covers.forEach(cover => lsProfilePreviewObserver.observe(cover));
}

function ensureModernMobileStyles() {
  if (document.getElementById("livescrollModernMobileStyles")) return;

  const style = document.createElement("style");
  style.id = "livescrollModernMobileStyles";
  style.textContent = `

    /* Road to LiveScroll 6 — teaser único por cuenta */
    .ls-road6-overlay {
      position:fixed;
      inset:0;
      z-index:920;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:18px;
      box-sizing:border-box;
      background:
        radial-gradient(circle at 50% 110%, rgba(250,204,21,.16), transparent 42%),
        radial-gradient(circle at 18% 10%, rgba(125,211,252,.10), transparent 32%),
        rgba(2,4,8,.94);
      backdrop-filter:blur(14px);
      animation:lsRoad6OverlayIn .55s ease both;
    }

    .ls-road6-card {
      position:relative;
      width:min(440px,100%);
      overflow:hidden;
      border-radius:24px;
      border:1px solid rgba(250,204,21,.28);
      background:linear-gradient(160deg, rgba(22,24,31,.98), rgba(7,9,13,.99) 64%);
      box-shadow:0 30px 100px rgba(0,0,0,.72), 0 0 45px rgba(250,204,21,.08);
      transform-origin:center;
      animation:lsRoad6CardIn .85s cubic-bezier(.16,1,.3,1) both;
    }

    .ls-road6-card::before {
      content:"";
      position:absolute;
      width:180px;
      height:180px;
      top:-95px;
      right:-70px;
      border-radius:50%;
      background:rgba(250,204,21,.13);
      filter:blur(12px);
      animation:lsRoad6Glow 3s ease-in-out infinite;
    }

    .ls-road6-scan {
      position:absolute;
      inset:0;
      pointer-events:none;
      opacity:.24;
      background:linear-gradient(110deg, transparent 20%, rgba(255,255,255,.12) 45%, transparent 70%);
      transform:translateX(-120%);
      animation:lsRoad6Scan 2.8s 1s ease-in-out infinite;
    }

    .ls-road6-content {
      position:relative;
      z-index:2;
      padding:30px 24px 22px;
      text-align:center;
    }

    .ls-road6-kicker {
      font-family:'JetBrains Mono',monospace;
      font-size:10px;
      letter-spacing:.20em;
      color:var(--gold);
      text-transform:uppercase;
      opacity:0;
      animation:lsRoad6Rise .55s .42s ease forwards;
    }

    .ls-road6-mark {
      width:72px;
      height:72px;
      margin:18px auto 16px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:22px;
      border:1px solid rgba(250,204,21,.30);
      background:rgba(250,204,21,.07);
      font-size:34px;
      box-shadow:inset 0 0 25px rgba(250,204,21,.05);
      opacity:0;
      animation:lsRoad6Mark .7s .55s cubic-bezier(.16,1,.3,1) forwards;
    }

    .ls-road6-title {
      margin:0;
      font-size:clamp(25px,7vw,34px);
      line-height:1.05;
      letter-spacing:-.04em;
      color:var(--text);
      opacity:0;
      animation:lsRoad6Rise .6s .68s ease forwards;
    }

    .ls-road6-copy {
      max-width:350px;
      margin:13px auto 0;
      color:var(--text-dim);
      font-size:13px;
      line-height:1.55;
      opacity:0;
      animation:lsRoad6Rise .6s .82s ease forwards;
    }

    .ls-road6-signals {
      display:grid;
      grid-template-columns:repeat(4,1fr);
      gap:7px;
      margin:22px 0 18px;
      opacity:0;
      animation:lsRoad6Rise .6s .96s ease forwards;
    }

    .ls-road6-signal {
      padding:10px 4px;
      border-radius:12px;
      border:1px solid rgba(255,255,255,.08);
      background:rgba(255,255,255,.025);
      font-size:9px;
      color:var(--text-dim);
    }

    .ls-road6-signal b {
      display:block;
      margin-bottom:5px;
      font-size:19px;
      font-weight:400;
    }

    .ls-road6-road {
      padding:12px 13px;
      border-radius:13px;
      border:1px solid rgba(250,204,21,.16);
      background:rgba(250,204,21,.035);
      font-family:'JetBrains Mono',monospace;
      font-size:10px;
      color:var(--gold);
      line-height:1.5;
      opacity:0;
      animation:lsRoad6Rise .6s 1.08s ease forwards;
    }

    .ls-road6-btn {
      width:100%;
      min-height:48px;
      margin-top:18px;
      border:0;
      border-radius:13px;
      cursor:pointer;
      font-family:inherit;
      font-weight:800;
      color:#12130f;
      background:linear-gradient(135deg, #fde047, #f59e0b);
      box-shadow:0 10px 28px rgba(245,158,11,.15);
      opacity:0;
      animation:lsRoad6Rise .6s 1.2s ease forwards;
    }

    .ls-road6-foot {
      margin-top:11px;
      font-size:9px;
      color:var(--text-dim);
      opacity:0;
      animation:lsRoad6Rise .6s 1.32s ease forwards;
    }

    @keyframes lsRoad6OverlayIn {
      from { opacity:0; }
      to { opacity:1; }
    }
    @keyframes lsRoad6CardIn {
      0% { opacity:0; transform:translateY(38px) scale(.92); filter:blur(8px); }
      70% { opacity:1; transform:translateY(-3px) scale(1.01); filter:blur(0); }
      100% { opacity:1; transform:none; filter:blur(0); }
    }
    @keyframes lsRoad6Rise {
      from { opacity:0; transform:translateY(12px); }
      to { opacity:1; transform:none; }
    }
    @keyframes lsRoad6Mark {
      from { opacity:0; transform:scale(.55) rotate(-12deg); }
      to { opacity:1; transform:none; }
    }
    @keyframes lsRoad6Glow {
      0%,100% { opacity:.45; transform:scale(.9); }
      50% { opacity:1; transform:scale(1.15); }
    }
    @keyframes lsRoad6Scan {
      0%,55% { transform:translateX(-120%); }
      85%,100% { transform:translateX(120%); }
    }

    @media (max-width:420px) {
      .ls-road6-overlay { padding:10px; }
      .ls-road6-content { padding:25px 17px 18px; }
      .ls-road6-signals { gap:5px; }
      .ls-road6-signal { font-size:8px; }
    }

    @media (prefers-reduced-motion:reduce) {
      .ls-road6-overlay,
      .ls-road6-card,
      .ls-road6-card *,
      .ls-road6-card::before {
        animation:none !important;
        opacity:1 !important;
        transform:none !important;
        filter:none !important;
      }
    }



    /* NEXT ERA — carteles de versión 5.4.6 → 6.0.0 */
    .ls-next-era-changelog {
      position:fixed;
      inset:0;
      z-index:910;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:16px;
      box-sizing:border-box;
      background:
        radial-gradient(circle at 50% 105%, rgba(250,204,21,.15), transparent 42%),
        radial-gradient(circle at 12% 8%, rgba(125,211,252,.08), transparent 28%),
        rgba(2,4,8,.95);
      backdrop-filter:blur(13px);
      animation:lsRoad6OverlayIn .45s ease both;
    }
    .ls-next-era-box {
      position:relative;
      width:min(455px,100%);
      max-height:90vh;
      overflow:hidden;
      display:flex;
      flex-direction:column;
      border-radius:24px;
      border:1px solid rgba(250,204,21,.27);
      background:linear-gradient(160deg, rgba(22,24,31,.99), rgba(7,9,13,.99) 66%);
      box-shadow:0 30px 100px rgba(0,0,0,.74), 0 0 45px rgba(250,204,21,.07);
      animation:lsRoad6CardIn .78s cubic-bezier(.16,1,.3,1) both;
      transition:transform .35s ease, opacity .35s ease;
    }
    .ls-next-era-box::before {
      content:"";
      position:absolute;
      width:180px;
      height:180px;
      top:-110px;
      right:-65px;
      border-radius:50%;
      background:rgba(250,204,21,.14);
      filter:blur(13px);
      animation:lsRoad6Glow 3.2s ease-in-out infinite;
      pointer-events:none;
    }
    .ls-next-era-scan {
      position:absolute;
      inset:0;
      z-index:1;
      pointer-events:none;
      opacity:.20;
      background:linear-gradient(110deg,transparent 20%,rgba(255,255,255,.12) 45%,transparent 70%);
      transform:translateX(-120%);
      animation:lsRoad6Scan 3s 1s ease-in-out infinite;
    }
    .ls-next-era-head {
      position:relative;
      z-index:2;
      padding:25px 22px 15px;
      border-bottom:1px solid rgba(255,255,255,.07);
    }
    .ls-next-era-kicker {
      font-family:'JetBrains Mono',monospace;
      font-size:9px;
      letter-spacing:.20em;
      color:var(--gold);
      text-transform:uppercase;
    }
    .ls-next-era-title {
      margin:8px 0 0;
      font-size:25px;
      line-height:1.08;
      letter-spacing:-.035em;
      color:var(--text);
    }
    .ls-next-era-sub {
      margin-top:7px;
      color:var(--text-dim);
      font-size:11px;
      line-height:1.45;
    }
    .ls-next-era-body {
      position:relative;
      z-index:2;
      overflow-y:auto;
      min-height:0;
      padding:17px 22px 4px;
    }
    .ls-next-era-version {
      position:relative;
      margin-bottom:16px;
      padding:13px;
      border:1px solid rgba(250,204,21,.11);
      border-radius:14px;
      background:rgba(255,255,255,.018);
    }
    .ls-next-era-version-head {
      display:flex;
      align-items:center;
      gap:8px;
      margin-bottom:10px;
    }
    .ls-next-era-version-name {
      font-family:'JetBrains Mono',monospace;
      font-size:11px;
      font-weight:800;
      color:var(--gold);
    }
    .ls-next-era-latest {
      padding:2px 7px;
      border-radius:999px;
      background:var(--gold);
      color:#12130f;
      font-size:8px;
      font-weight:900;
    }
    .ls-next-era-category { margin-bottom:10px; }
    .ls-next-era-category:last-child { margin-bottom:0; }
    .ls-next-era-category-title {
      margin-bottom:4px;
      font-size:11px;
      font-weight:700;
    }
    .ls-next-era-line {
      color:var(--text-dim);
      font-size:12px;
      line-height:1.45;
      margin:4px 0;
    }
    .ls-next-era-foot {
      position:relative;
      z-index:3;
      padding:14px 22px 20px;
      background:linear-gradient(to top,rgba(7,9,13,1),rgba(7,9,13,.94));
      border-top:1px solid rgba(255,255,255,.06);
    }
    .ls-next-era-btn {
      width:100%;
      min-height:46px;
      border:0;
      border-radius:13px;
      cursor:pointer;
      font-family:inherit;
      font-weight:850;
      color:#12130f;
      background:linear-gradient(135deg,#fde047,#f59e0b);
      box-shadow:0 10px 28px rgba(245,158,11,.14);
    }
    .ls-next-era-road {
      margin-top:9px;
      text-align:center;
      font-family:'JetBrains Mono',monospace;
      font-size:8px;
      letter-spacing:.05em;
      color:rgba(250,204,21,.66);
    }
    @media (max-width:420px) {
      .ls-next-era-changelog { padding:8px; }
      .ls-next-era-box { max-height:96vh; }
      .ls-next-era-head { padding:21px 17px 13px; }
      .ls-next-era-body { padding:14px 17px 2px; }
      .ls-next-era-foot { padding:12px 17px 16px; }
    }



    /* 5.5.7 — Medallas exclusivas de Tienda */
    .ls-store-badge-card {
      position:relative;
      overflow:hidden;
      text-align:center;
      min-height:185px;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap:6px;
    }

    .ls-store-badge-card::before {
      content:"";
      position:absolute;
      inset:-40%;
      pointer-events:none;
      opacity:.14;
      background:radial-gradient(circle, currentColor 0%, transparent 42%);
      filter:blur(18px);
    }

    .ls-store-badge-icon {
      position:relative;
      z-index:1;
      width:66px;
      height:66px;
      display:flex;
      align-items:center;
      justify-content:center;
      margin-bottom:4px;
      border-radius:50%;
      font-size:35px;
      background:rgba(5,7,10,.72);
      border:1px solid currentColor;
      box-shadow:0 12px 30px rgba(0,0,0,.30);
    }

    .ls-rarity-comun { color:#cbd5e1; }
    .ls-rarity-rara { color:#7dd3fc; }
    .ls-rarity-epica { color:#c084fc; }
    .ls-rarity-legendaria { color:#fbbf24; }
    .ls-rarity-exclusiva { color:#fb7185; }
    .ls-rarity-mitica { color:#ff365d;text-shadow:0 0 11px rgba(255,54,93,.62),0 0 19px rgba(244,211,94,.30); }

    .ls-profile-title-chip {
      --title-color:#cbd5e1;
      --title-rgb:203,213,225;
      position:relative;
      overflow:hidden;
      border-color:rgba(var(--title-rgb),.42) !important;
      background:linear-gradient(135deg,rgba(var(--title-rgb),.15),rgba(var(--title-rgb),.04)) !important;
      color:var(--title-color) !important;
      box-shadow:0 0 16px rgba(var(--title-rgb),.13);
    }
    .ls-profile-title-chip.ls-rarity-rara { --title-color:#7dd3fc; --title-rgb:125,211,252; }
    .ls-profile-title-chip.ls-rarity-epica { --title-color:#c084fc; --title-rgb:192,132,252; box-shadow:0 0 20px rgba(192,132,252,.24); }
    .ls-profile-title-chip.ls-rarity-legendaria { --title-color:#fbbf24; --title-rgb:251,191,36; box-shadow:0 0 24px rgba(251,191,36,.28); }
    .ls-profile-title-chip.ls-rarity-exclusiva { --title-color:#fb7185; --title-rgb:251,113,133; box-shadow:0 0 26px rgba(251,113,133,.30); }
    .ls-profile-title-chip.ls-rarity-epica::before,
    .ls-profile-title-chip.ls-rarity-legendaria::before,
    .ls-profile-title-chip.ls-rarity-exclusiva::before {
      content:"";
      position:absolute;
      inset:-80% -35%;
      pointer-events:none;
      background:linear-gradient(105deg,transparent 42%,rgba(255,255,255,.30) 50%,transparent 58%);
      animation:lsTitleShine 3.4s ease-in-out infinite;
    }
    @keyframes lsTitleShine {
      0%,62% { transform:translateX(-55%) rotate(8deg); opacity:0; }
      72% { opacity:1; }
      100% { transform:translateX(55%) rotate(8deg); opacity:0; }
    }

    .ls-rarity-tag {
      position:relative;
      z-index:1;
      font-family:'JetBrains Mono',monospace;
      font-size:8px;
      font-weight:900;
      letter-spacing:.08em;
      text-transform:uppercase;
    }


    .ls-limited-urgency {
      position:relative;
      z-index:1;
      margin-top:6px;
      padding:4px 8px;
      border-radius:999px;
      font-family:'JetBrains Mono',monospace;
      font-size:8px;
      font-weight:900;
      letter-spacing:.06em;
      border:1px solid rgba(251,146,60,.28);
      background:rgba(251,146,60,.06);
      color:#fdba74;
      animation:lsLimitedUrgency 1.8s ease-in-out infinite;
    }

    .ls-limited-last {
      border-color:rgba(248,113,113,.34);
      background:rgba(248,113,113,.07);
      color:#fca5a5;
      animation:lsLimitedUrgency .95s ease-in-out infinite;
    }

    @keyframes lsLimitedUrgency {
      0%,100% { transform:scale(1); opacity:.86; }
      50% { transform:scale(1.035); opacity:1; }
    }

    @media (prefers-reduced-motion:reduce) {
      .ls-limited-urgency,
      .ls-limited-last {
        animation:none !important;
      }
    }

    .ls-store-badge-desc {
      position:relative;
      z-index:1;
      max-width:180px;
      min-height:30px;
      font-size:10px;
      line-height:1.4;
      color:var(--text-dim);
    }

    /* LiveScroll 5.5.7 — IDENTITY */
    .ls-equipped-medals {
      display:flex;
      align-items:center;
      gap:7px;
      margin-top:8px;
      min-height:30px;
      flex-wrap:wrap;
    }


    .ls-equipped-medal.ls-medal-rarity-comun {
      border-color:#cbd5e1;
      box-shadow:0 0 0 2px rgba(203,213,225,.12), 0 5px 16px rgba(0,0,0,.24);
    }
    .ls-equipped-medal.ls-medal-rarity-rara {
      border-color:#7dd3fc;
      box-shadow:0 0 0 2px rgba(125,211,252,.16), 0 0 16px rgba(125,211,252,.20), 0 5px 16px rgba(0,0,0,.24);
    }
    .ls-equipped-medal.ls-medal-rarity-epica {
      border-color:#c084fc;
      box-shadow:0 0 0 2px rgba(192,132,252,.16), 0 0 18px rgba(192,132,252,.24), 0 5px 16px rgba(0,0,0,.24);
    }
    .ls-equipped-medal.ls-medal-rarity-legendaria {
      border-color:#fbbf24;
      box-shadow:0 0 0 2px rgba(251,191,36,.18), 0 0 20px rgba(251,191,36,.28), 0 5px 16px rgba(0,0,0,.24);
    }

    .ls-equipped-medal.ls-medal-rarity-legendaria::before,
    .ls-equipped-medal.ls-medal-rarity-exclusiva::before {
      content:"";
      position:absolute;
      inset:-7px;
      border-radius:50%;
      pointer-events:none;
      opacity:.30;
      filter:blur(6px);
      background:currentColor;
      animation:lsMedalHalo 2.8s ease-in-out infinite;
      z-index:-1;
    }

    .ls-equipped-medal.ls-medal-rarity-exclusiva {
      background:
        radial-gradient(circle at 30% 22%, rgba(255,255,255,.16), transparent 28%),
        linear-gradient(145deg, rgba(251,113,133,.10), rgba(192,132,252,.06)),
        rgba(8,10,13,.78);
    }

    @keyframes lsMedalHalo {
      0%,100% { opacity:.18; transform:scale(.92); }
      50% { opacity:.42; transform:scale(1.08); }
    }

    .ls-public-medals-wrap {
      display:inline-flex;
      align-items:center;
      gap:6px;
      margin-top:7px;
      padding:4px 7px;
      border-radius:999px;
      background:rgba(255,255,255,.025);
      border:1px solid rgba(255,255,255,.06);
      backdrop-filter:blur(5px);
    }

    .ls-public-medals-wrap .ls-equipped-medals {
      margin:0 !important;
      min-height:0 !important;
      gap:6px !important;
    }


    .ls-public-medals-wrap .ls-equipped-medal.ls-medal-favorite {
      width:32px;
      height:32px;
      flex-basis:32px;
      font-size:18px;
    }

    .ls-public-medals-wrap .ls-equipped-medal {
      width:28px;
      height:28px;
      font-size:15px;
      margin:0;
      flex:0 0 28px;
    }

    .ls-medal-detail-meta {
      display:flex;
      justify-content:center;
      gap:7px;
      flex-wrap:wrap;
      margin-top:10px;
    }



    @media (max-width:520px) {
      .ls-collection-filter {
        flex:1 1 auto;
        min-height:34px;
      }

      #collection568Grid > div {
        grid-template-columns:repeat(2,minmax(0,1fr)) !important;
      }

      #collection568Sort {
        flex:1 1 150px;
        min-height:36px;
      }
    }

    .ls-collection-filter.active {
      border-color:var(--gold) !important;
      color:var(--gold) !important;
      background:rgba(250,204,21,.045) !important;
    }

    .ls-medal-detail-chip {
      padding:4px 8px;
      border-radius:999px;
      border:1px solid var(--border);
      background:var(--panel-2);
      font-size:9px;
      color:var(--text-dim);
    }

    .ls-equipped-medal.ls-medal-rarity-exclusiva {
      border-color:#fb7185;
      box-shadow:0 0 0 2px rgba(251,113,133,.18), 0 0 22px rgba(251,113,133,.30), 0 5px 16px rgba(0,0,0,.24);
    }

    .ls-equipped-medal.ls-medal-rarity-mitica {
      color:#f4d35e;
      border-color:#ff365d;
      background:radial-gradient(circle at 32% 23%,#ff879b 0 7%,transparent 24%),linear-gradient(145deg,#6f061d 4%,#ee214b 43%,#7e071e 67%,#d69b1f 100%);
      box-shadow:0 0 0 2px rgba(244,211,94,.28),0 0 18px rgba(255,32,77,.65),0 0 34px rgba(244,211,94,.28),0 7px 20px rgba(0,0,0,.38);
      animation:ls6MythicPulse 1.85s ease-in-out infinite;
    }
    .ls-equipped-medal.ls-medal-rarity-mitica::after {
      content:"";position:absolute;inset:-5px;border:1px solid #f4d35e;border-radius:50%;opacity:.52;pointer-events:none;
    }
    @keyframes ls6MythicPulse { 0%,100%{transform:translateZ(0) scale(1);filter:saturate(1)}50%{transform:translateZ(0) scale(1.07);filter:saturate(1.22)} }

    .ls-equipped-medal.ls-medal-rarity-rara::after,
    .ls-equipped-medal.ls-medal-rarity-epica::after,
    .ls-equipped-medal.ls-medal-rarity-legendaria::after,
    .ls-equipped-medal.ls-medal-rarity-exclusiva::after {
      content:"";
      position:absolute;
      inset:-4px;
      border-radius:50%;
      border:1px solid currentColor;
      opacity:.18;
      pointer-events:none;
    }

    .ls-equipped-medal.ls-medal-rarity-epica,
    .ls-equipped-medal.ls-medal-rarity-legendaria,
    .ls-equipped-medal.ls-medal-rarity-exclusiva {
      animation:lsMedalRarePulse 2.6s ease-in-out infinite;
    }

    @keyframes lsMedalRarePulse {
      0%,100% { transform:translateZ(0) scale(1); }
      50% { transform:translateZ(0) scale(1.055); }
    }

    @media (prefers-reduced-motion:reduce) {
      .ls-equipped-medal {
        animation:none !important;
      }
    }


    .ls-equipped-medal.ls-medal-favorite {
      width:36px;
      height:36px;
      font-size:20px;
      box-shadow:
        0 0 0 2px rgba(250,204,21,.16),
        0 0 22px rgba(250,204,21,.18),
        0 8px 20px rgba(0,0,0,.28);
    }

    .ls-equipped-medal.ls-medal-favorite::before {
      content:"★";
      position:absolute;
      top:-7px;
      right:-5px;
      z-index:3;
      font-size:10px;
      line-height:1;
      color:var(--gold);
      text-shadow:0 0 8px rgba(250,204,21,.55);
      pointer-events:none;
    }

    .ls-favorite-note {
      margin:8px 0 13px;
      padding:8px 10px;
      border-radius:10px;
      border:1px solid rgba(250,204,21,.16);
      background:rgba(250,204,21,.035);
      color:var(--text-dim);
      font-size:10px;
      line-height:1.45;
    }

    .ls-medal-order-row {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:8px;
      margin-top:8px;
    }

    .ls-medal-order-btn {
      min-width:31px;
      height:28px;
      border-radius:8px;
      border:1px solid var(--border);
      background:var(--panel);
      color:var(--text);
      cursor:pointer;
      font-size:12px;
    }

    .ls-equipped-medal {
      position:relative;
      width:31px;
      height:31px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      border-radius:50%;
      border:1px solid rgba(250,204,21,.28);
      background:
        radial-gradient(circle at 32% 24%, rgba(255,255,255,.12), transparent 32%),
        rgba(8,10,13,.72);
      box-shadow:0 5px 16px rgba(0,0,0,.24), inset 0 0 12px rgba(250,204,21,.035);
      font-size:17px;
      cursor:pointer;
      transform:translateZ(0);
      transition:transform .14s ease, border-color .14s ease;
    }

    .ls-equipped-medal:hover {
      transform:translateY(-2px) scale(1.05);
      border-color:rgba(250,204,21,.58);
    }

    .ls-equipped-medal-slot {
      width:31px;
      height:31px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      border-radius:50%;
      border:1px dashed rgba(255,255,255,.16);
      color:var(--text-dim);
      background:rgba(255,255,255,.018);
      font-size:12px;
    }

    .ls-medal-picker-grid {
      display:grid;
      grid-template-columns:repeat(auto-fill,minmax(118px,1fr));
      gap:9px;
    }

    .ls-medal-picker-item {
      min-height:88px;
      padding:11px 9px;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap:6px;
      text-align:center;
      border-radius:13px;
      border:1px solid var(--border);
      background:var(--panel-2);
      color:var(--text);
      cursor:pointer;
      font-family:inherit;
      transition:transform .14s ease,border-color .14s ease,background .14s ease;
    }

    .ls-medal-picker-item:hover {
      transform:translateY(-2px);
      border-color:var(--gold-dim);
    }

    .ls-medal-picker-item.selected {
      border-color:var(--gold);
      background:rgba(250,204,21,.065);
      box-shadow:inset 0 0 0 1px rgba(250,204,21,.08);
    }

    .ls-medal-picker-icon {
      font-size:27px;
      line-height:1;
    }

    .ls-medal-picker-name {
      font-size:10px;
      line-height:1.25;
      color:var(--text-dim);
    }

    .ls-medal-detail-icon {
      width:72px;
      height:72px;
      margin:0 auto 14px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:50%;
      font-size:40px;
      border:1px solid rgba(250,204,21,.32);
      background:radial-gradient(circle at 35% 25%,rgba(255,255,255,.12),transparent 32%),rgba(250,204,21,.045);
      box-shadow:0 15px 42px rgba(0,0,0,.35);
    }

    @media (max-width:700px) {
      .ls-equipped-medal,
      .ls-equipped-medal-slot {
        width:30px;
        height:30px;
      }
      .ls-equipped-medal {
        transition:none;
      }
    }

    /* LiveScroll 5.4.6 — PERFORMANCE / Mobile Fast */
    .ls-fast-shimmer,
    .ls-fast-profile-skeleton i,
    .ls-fast-avatar {
      background:linear-gradient(100deg, var(--panel-2), rgba(255,255,255,.055), var(--panel-2));
      background-size:220% 100%;
      animation:lsSkeleton 1.05s linear infinite;
    }
    .ls-fast-profile-skeleton { display:grid; gap:12px; }
    .ls-fast-profile-hero {
      min-height:128px; display:flex; align-items:center; gap:14px; padding:18px;
      border-radius:16px; background:var(--panel); border:1px solid var(--border);
    }
    .ls-fast-profile-hero i { display:block; height:13px; border-radius:999px; }
    .ls-fast-avatar { width:66px; height:66px; flex:0 0 66px; border-radius:50%; }
    .ls-fast-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
    .ls-fast-stats i { display:block; height:54px; border-radius:13px; }

    .ls-fast-skeleton {
      display:grid;
      gap:10px;
      padding:4px 0;
    }
    .ls-fast-skeleton > i {
      display:block;
      height:62px;
      border-radius:13px;
      background:linear-gradient(100deg, var(--panel-2), rgba(255,255,255,.055), var(--panel-2));
      background-size:220% 100%;
      animation:lsSkeleton 1.05s linear infinite;
    }
    @keyframes lsSkeleton { to { background-position:-220% 0; } }

    @media (max-width:700px) {
      /* En móvil priorizamos respuesta inmediata sobre animación decorativa. */
      #appView {
        transition:none !important;
      }
      #appView .page-title,
      #appView .page-sub,
      #appView .form-card,
      #appView .video-card,
      #appView .directo-card,
      #appView .profile-section,
      #appView .store-item,
      #appView .ranking-row {
        animation-duration:.14s !important;
        animation-delay:0s !important;
        transition-duration:.12s !important;
      }
      .toast { animation-duration:.16s !important; }
      .modal-overlay { animation-duration:.16s !important; }
      .modal-box { transition-duration:.16s !important; }
    }

    @media (prefers-reduced-motion:reduce) {
      .ls-fast-skeleton > i { animation:none !important; }
    }

    /* v5.3.5 — Mobile Feed Full View */
    :root {
      --ls-mobile-feed-height: 640px;
    }

    @media (max-width:700px) {
      #feedVertical,
      #profileFeedVertical,
      #foryouList .feed-vertical {
        scroll-snap-type:y mandatory !important;
      }

      #feedVertical > .feed-item,
      #profileFeedVertical > .feed-item,
      #foryouList .feed-vertical > .feed-item {
        height:var(--ls-mobile-feed-height) !important;
        min-height:var(--ls-mobile-feed-height) !important;
        max-height:var(--ls-mobile-feed-height) !important;
        margin:0 !important;
        scroll-snap-align:start !important;
        scroll-snap-stop:always !important;
        overflow:hidden !important;
      }

      #feedVertical .feed-phone,
      #profileFeedVertical .feed-phone,
      #foryouList .feed-phone {
        width:100% !important;
        height:100% !important;
        min-height:100% !important;
        max-height:100% !important;
        margin:0 !important;
        border-radius:0 !important;
        overflow:hidden !important;
      }

      #feedVertical .feed-embed-frame,
      #profileFeedVertical .feed-embed-frame,
      #foryouList .feed-embed-frame {
        position:absolute !important;
        inset:0 !important;
        width:100% !important;
        height:100% !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        background:#000 !important;
      }

      #feedVertical .feed-embed-frame iframe,
      #profileFeedVertical .feed-embed-frame iframe,
      #foryouList .feed-embed-frame iframe {
        width:100% !important;
        height:100% !important;
        border:0 !important;
      }

      #feedVertical .feed-actions,
      #profileFeedVertical .feed-actions,
      #foryouList .feed-actions {
        right:10px !important;
        bottom:118px !important;
        z-index:12 !important;
      }

      #feedVertical .feed-overlay,
      #profileFeedVertical .feed-overlay,
      #foryouList .feed-overlay {
        left:12px !important;
        right:68px !important;
        bottom:18px !important;
        z-index:10 !important;
      }

      /* MP4: reservamos abajo la barra nativa del reproductor. */
      .feed-item.ls-upload-feed-item .feed-overlay {
        bottom:72px !important;
        pointer-events:none !important;
      }

      .feed-item.ls-upload-feed-item .feed-overlay .author {
        pointer-events:auto !important;
      }

      .feed-item.ls-upload-feed-item .feed-actions {
        bottom:148px !important;
      }

      .feed-item.ls-upload-feed-item .dbltap-like-zone {
        width:100% !important;
        height:100% !important;
      }

      .feed-item.ls-upload-feed-item video {
        width:100% !important;
        height:100% !important;
        object-fit:contain !important;
        background:#000 !important;
      }

      .feed-nudge {
        top:14px !important;
        bottom:auto !important;
        left:50% !important;
        transform:translateX(-50%) !important;
        white-space:nowrap !important;
        z-index:11 !important;
        opacity:.72 !important;
      }
    }

    /* LiveScroll Mobile/UI Upgrade */
    html, body {
      max-width:100%;
      overflow-x:hidden;
    }

    #appView,
    .profile-section,
    .profile-hero,
    .form-card,
    .modal-box {
      box-sizing:border-box;
      max-width:100%;
    }

    .grid-menu-btn {
      width:42px !important;
      height:42px !important;
      min-width:42px !important;
      min-height:42px !important;
      border-radius:50% !important;
      display:flex !important;
      align-items:center !important;
      justify-content:center !important;
      font-size:25px !important;
      line-height:1 !important;
      background:rgba(8,10,14,.78) !important;
      backdrop-filter:blur(10px);
      -webkit-backdrop-filter:blur(10px);
      border:1px solid rgba(255,255,255,.16) !important;
      color:#fff !important;
      padding:0 0 7px !important;
      z-index:12 !important;
      box-shadow:0 6px 18px rgba(0,0,0,.28);
      touch-action:manipulation;
    }

    .grid-menu-btn:active {
      transform:scale(.94);
    }

    .ls-action-sheet-overlay {
      position:fixed;
      inset:0;
      z-index:400;
      background:rgba(0,0,0,.66);
      backdrop-filter:blur(3px);
      -webkit-backdrop-filter:blur(3px);
      display:flex;
      align-items:flex-end;
      justify-content:center;
      padding:12px;
      padding-bottom:max(12px, env(safe-area-inset-bottom));
      animation:lsFadeIn .16s ease;
    }

    .ls-action-sheet {
      width:min(520px, 100%);
      background:var(--panel);
      border:1px solid var(--border);
      border-radius:22px;
      padding:10px;
      box-shadow:0 -18px 55px rgba(0,0,0,.55);
      animation:lsSheetUp .22s cubic-bezier(.2,.8,.2,1);
      overflow:hidden;
    }

    .ls-action-sheet-handle {
      width:42px;
      height:4px;
      border-radius:10px;
      background:rgba(255,255,255,.22);
      margin:3px auto 10px;
    }

    .ls-action-sheet-title {
      padding:6px 10px 13px;
      border-bottom:1px solid var(--border);
      margin-bottom:6px;
    }

    .ls-action-sheet-title strong {
      display:block;
      font-size:14px;
      color:var(--text);
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }

    .ls-action-sheet-title span {
      display:block;
      margin-top:3px;
      color:var(--text-dim);
      font-size:11px;
    }

    .ls-sheet-action {
      width:100%;
      min-height:52px;
      border:0;
      border-radius:13px;
      background:transparent;
      color:var(--text);
      display:flex;
      align-items:center;
      gap:12px;
      padding:10px 13px;
      font-family:inherit;
      font-size:14px;
      text-align:left;
      cursor:pointer;
      touch-action:manipulation;
    }

    .ls-sheet-action:hover,
    .ls-sheet-action:active {
      background:var(--panel-2);
    }

    .ls-sheet-action .ico {
      width:34px;
      height:34px;
      flex:0 0 34px;
      border-radius:10px;
      background:rgba(255,255,255,.06);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:18px;
    }

    .ls-sheet-action .txt {
      min-width:0;
      flex:1;
    }

    .ls-sheet-action .txt strong {
      display:block;
      font-size:14px;
    }

    .ls-sheet-action .txt small {
      display:block;
      color:var(--text-dim);
      font-size:11px;
      margin-top:2px;
    }

    .ls-sheet-action.danger {
      color:var(--red);
    }

    .ls-sheet-action[disabled] {
      opacity:.46;
      cursor:not-allowed;
    }

    @keyframes lsSheetUp {
      from { transform:translateY(28px); opacity:0; }
      to { transform:translateY(0); opacity:1; }
    }

    @keyframes lsFadeIn {
      from { opacity:0; }
      to { opacity:1; }
    }

    @media (max-width:700px) {
      #appView {
        width:100% !important;
        padding-left:10px !important;
        padding-right:10px !important;
      }

      .profile-hero,
      .profile-section,
      .form-card {
        border-radius:16px !important;
      }

      .profile-hero {
        overflow:hidden !important;
      }

      .profile-stats-row {
        display:grid !important;
        grid-template-columns:repeat(3, minmax(0,1fr)) !important;
        gap:7px !important;
        width:100% !important;
      }

      .stat-pill {
        min-width:0 !important;
        padding:10px 5px !important;
      }

      .stat-pill .num {
        font-size:clamp(18px, 6vw, 24px) !important;
      }

      .stat-pill .lbl {
        font-size:10px !important;
        white-space:normal !important;
        line-height:1.15 !important;
      }

      .profile-name-block h1 {
        font-size:clamp(20px, 6vw, 28px) !important;
        overflow-wrap:anywhere;
      }

      .profile-section-head {
        gap:8px !important;
        align-items:center !important;
      }

      .profile-section-head h3 {
        min-width:0;
        font-size:15px !important;
      }

      .profile-section-head .sub {
        font-size:10px !important;
        text-align:right;
      }

      .video-grid {
        gap:7px !important;
      }

      .video-grid-tile {
        min-width:0 !important;
        overflow:hidden !important;
      }

      .grid-menu-btn {
        width:46px !important;
        height:46px !important;
        min-width:46px !important;
        min-height:46px !important;
        font-size:28px !important;
        top:8px !important;
        right:8px !important;
      }

      .video-grid-menu {
        display:none !important;
      }

      .modal-overlay {
        padding:10px !important;
        align-items:flex-end !important;
      }

      .modal-box,
      .auth-box {
        width:100% !important;
        max-width:100% !important;
        max-height:92dvh !important;
        overflow-y:auto !important;
        border-radius:20px !important;
      }

      button,
      .btn,
      .btn-outline {
        touch-action:manipulation;
      }

      input,
      textarea,
      select {
        max-width:100% !important;
        box-sizing:border-box !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function closeVideoActionSheet() {
  document.getElementById("videoActionSheetOverlay")?.remove();
}

function openVideoActionSheet(videoId) {
  const video = (window.__profileFeedVideos || []).find(v => v.id === videoId);
  if (!video) return;

  const pin = window.__profilePinContext || {};
  const isPinned = Array.isArray(pin.pinnedIds) && pin.pinnedIds.includes(videoId);
  const canPin = !!pin.canPin;
  const limitReached = canPin && !isPinned && (pin.pinsUsed >= pin.maxPinned);

  closeVideoActionSheet();

  const overlay = document.createElement("div");
  overlay.id = "videoActionSheetOverlay";
  overlay.className = "ls-action-sheet-overlay";
  overlay.onclick = (e) => {
    if (e.target === overlay) closeVideoActionSheet();
  };

  let pinAction = "";
  if (isPinned) {
    pinAction = `
      <button class="ls-sheet-action" disabled>
        <span class="ico">📌</span>
        <span class="txt">
          <strong>Video anclado</strong>
          <small>Ya está destacado en Para Ti</small>
        </span>
      </button>`;
  } else if (canPin) {
    pinAction = `
      <button class="ls-sheet-action" ${limitReached ? "disabled" : ""}
        onclick="closeVideoActionSheet(); handlePinVideo('${videoId}')">
        <span class="ico">📌</span>
        <span class="txt">
          <strong>Anclar 24 h</strong>
          <small>${limitReached
            ? `Ya usaste ${pin.pinsUsed}/${pin.maxPinned} espacios disponibles`
            : `Destacalo en Para Ti · ${pin.pinsUsed}/${pin.maxPinned} usados`}</small>
        </span>
      </button>`;
  } else {
    pinAction = `
      <button class="ls-sheet-action" disabled>
        <span class="ico">📌</span>
        <span class="txt">
          <strong>Anclar 24 h</strong>
          <small>Tu plan actual no incluye videos anclados</small>
        </span>
      </button>`;
  }

  overlay.innerHTML = `
    <div class="ls-action-sheet">
      <div class="ls-action-sheet-handle"></div>

      <div class="ls-action-sheet-title">
        <strong>${escapeHtml(video.title || "Video")}</strong>
        <span>Opciones del video</span>
      </div>

      ${pinAction}

      <button class="ls-sheet-action"
        onclick="closeVideoActionSheet(); openProfileVideoFeed(window.__profileFeedVideos, '${videoId}', window.__profileFeedAuthor)">
        <span class="ico">▶️</span>
        <span class="txt">
          <strong>Ver video</strong>
          <small>Abrir dentro de LiveScroll</small>
        </span>
      </button>

      ${video.platform === "upload" ? `
        <button class="ls-sheet-action" onclick="openVideoReeditor('${videoId}')">
          <span class="ico">✂️</span>
          <span class="txt">
            <strong>Reeditar video</strong>
            <small>Cambiar el inicio o el final sin perder interacciones</small>
          </span>
        </button>` : `
        <button class="ls-sheet-action" disabled>
          <span class="ico">✂️</span>
          <span class="txt"><strong>Reeditar video</strong><small>Disponible para MP4 subidos a LiveScroll</small></span>
        </button>`}

      <button class="ls-sheet-action"
        onclick="closeVideoActionSheet(); window.open('${escapeHtml(video.video_url)}', '_blank', 'noopener')">
        <span class="ico">🔗</span>
        <span class="txt">
          <strong>Abrir enlace</strong>
          <small>Ver el archivo o plataforma original</small>
        </span>
      </button>

      <button class="ls-sheet-action danger"
        onclick="closeVideoActionSheet(); handleDeleteOwnVideo('${videoId}')">
        <span class="ico">🗑️</span>
        <span class="txt">
          <strong>Eliminar video</strong>
          <small>Esta acción no se puede deshacer</small>
        </span>
      </button>

      <button class="ls-sheet-action" onclick="closeVideoActionSheet()">
        <span class="ico">✕</span>
        <span class="txt"><strong>Cancelar</strong></span>
      </button>
    </div>`;

  document.body.appendChild(overlay);
}

function toggleVideoTileMenu(videoId) {
  ensureModernMobileStyles();

  if (window.matchMedia("(max-width: 700px)").matches) {
    openVideoActionSheet(videoId);
    return;
  }

  document.querySelectorAll(".video-grid-menu").forEach(el => {
    if (el.id !== `menu-${videoId}`) el.classList.add("hidden");
  });
  document.getElementById(`menu-${videoId}`)?.classList.toggle("hidden");
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".grid-menu-btn") && !e.target.closest(".video-grid-menu")) {
    document.querySelectorAll(".video-grid-menu").forEach(el => el.classList.add("hidden"));
  }
});

function getThumbnailHtml(video) {
  if (video.platform === "youtube") {
    const id = extractYoutubeId(video.video_url);
    if (id) return `<img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" alt="miniatura" loading="lazy" decoding="async">`;
  }

  if (video.platform === "upload") {
    if (video.thumbnail_url && isSafeUrl(video.thumbnail_url)) {
      return `<img src="${escapeHtml(video.thumbnail_url)}" alt="carátula del video" loading="lazy" decoding="async">`;
    }

    // En Legacy no abrimos varios MP4 solamente para fabricar miniaturas: eso
    // compite con el reproductor principal y en equipos antiguos deja audio sin imagen.
    if (document.documentElement.classList.contains("ls-legacy")) {
      return `<div class="ls-legacy-cover-placeholder"><span aria-hidden="true">▶</span><small>VIDEO</small></div>`;
    }

    // Videos viejos sin carátula persistida: el MP4 se activa recién cerca de la pantalla.
    if (isSafeUrl(video.video_url)) {
      return `<div class="ls-lazy-video-cover" data-ls-preview-src="${escapeHtml(video.video_url)}#t=0.3">
        <span aria-hidden="true">▶</span>
        <video preload="none" muted playsinline disablepictureinpicture
          style="width:100%;height:100%;object-fit:cover;pointer-events:none;background:#071116;"></video>
      </div>`;
    }

    return "🎬";
  }

  const icons = { kick: "🟢", twitch: "🟣", tiktok: "🎵" };
  return icons[video.platform] || "▶️";
}

function extractYoutubeId(url) {
  if (typeof url !== "string" || !url.trim()) return null;

  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    let candidate = null;

    if (host === "youtu.be") {
      candidate = parsed.pathname.split("/").filter(Boolean)[0];
    } else if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      if (parsed.pathname === "/watch") candidate = parsed.searchParams.get("v");
      else if (["shorts", "embed", "live"].includes(pathParts[0])) candidate = pathParts[1];
    }

    return /^[A-Za-z0-9_-]{11}$/.test(candidate || "") ? candidate : null;
  } catch (error) {
    // Respaldo para enlaces pegados sin protocolo.
    const match = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})(?:[?&#/]|$)/i);
    return match ? match[1] : null;
  }
}

const lsDiscoveryStartedVideos = new Set();

function recordDiscoverySignal(videoId, eventType, watchSecondsValue = 0) {
  if (!currentUser?.id || !videoId) return;
  sb.rpc("record_discovery_event", {
    p_video_id: videoId,
    p_event_type: eventType,
    p_watch_seconds: Math.max(0, Math.round(Number(watchSecondsValue) || 0))
  }).then(({ error }) => {
    if (error) console.warn("Señal de descubrimiento no registrada:", error.message);
  });
}

function renderVideoHashtags(video) {
  const tags = (video?.video_hashtags || [])
    .map(row => row?.hashtags)
    .filter(Boolean)
    .slice(0, 5);
  if (!tags.length) return "";
  return `<div style="display:flex;gap:6px;flex-wrap:wrap;margin:7px 0 2px;">${tags.map(tag =>
    `<button type="button" onclick="event.stopPropagation();openHashtagFeed('${escapeHtml(tag.slug)}')" style="border:0;background:transparent;color:#67e8f9;padding:0;font:800 11px 'JetBrains Mono',monospace;cursor:pointer;">#${escapeHtml(tag.display_name || tag.slug)}</button>`
  ).join("")}</div>`;
}

async function hideVideoFromDiscovery(videoId) {
  const { data, error } = await sb.rpc("hide_video_for_user", { p_video_id: videoId });
  if (error || data?.ok === false) return showToast("No se pudo ocultar el video");
  document.querySelector(`.feed-item[data-video-id="${videoId}"]`)?.remove();
  lsPerfCache.feed = { data:null, at:0 };
  showHiddenVideoUndo(videoId);
}
window.hideVideoFromDiscovery = hideVideoFromDiscovery;

function showHiddenVideoUndo(videoId) {
  document.getElementById("lsHiddenUndo")?.remove();
  const bar = document.createElement("div");
  bar.id = "lsHiddenUndo";
  bar.className = "ls-hidden-undo-611";
  bar.innerHTML = `<span><strong>Video ocultado</strong><small>Ya no aparecerá en tu inicio.</small></span><button type="button">Deshacer</button>`;
  bar.querySelector("button").onclick = async () => {
    const { data, error } = await sb.rpc("restore_hidden_video", { p_video_id:videoId });
    if (error || !data?.ok) return showToast("No se pudo restablecer el video");
    bar.remove();
    lsPerfCache.feed = { data:null, at:0 };
    showToast("Video restablecido ✓");
    if (currentTab === "feed") renderFeed();
  };
  document.body.appendChild(bar);
  setTimeout(() => bar.remove(), 6500);
}

async function openHashtagFeed(rawSlug) {
  const slug = normalizeHashtag(rawSlug);
  if (!slug) return;
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `<div class="modal-overlay" onclick="if(event.target===this)this.innerHTML=''">
    <div class="modal-box"><div class="modal-box-body"><h2 style="margin:0 0 14px;color:var(--gold)">#${escapeHtml(slug)}</h2><div id="hashtagVideoList" style="color:var(--text-dim)">Buscando videos...</div></div></div>
  </div>`;
  const { data:ids, error } = await sb.rpc("get_video_ids_by_hashtag", { p_slug:slug, p_limit:30 });
  const list = document.getElementById("hashtagVideoList");
  if (!list) return;
  if (error) { list.textContent = "No pudimos cargar esta etiqueta."; return; }
  const videoIds = (ids || []).map(row => row.video_id);
  if (!videoIds.length) { list.textContent = "Todavía no hay videos con esta etiqueta."; return; }
  const { data:videos } = await sb.from("videos").select("id,title,thumbnail_url,profiles!videos_user_id_fkey(username)").in("id", videoIds);
  const byId = new Map((videos || []).map(video => [video.id, video]));
  list.innerHTML = videoIds.map(id => byId.get(id)).filter(Boolean).map(video => `<button class="btn-outline" style="width:100%;display:flex;justify-content:space-between;gap:10px;margin:8px 0;text-align:left" onclick="openSharedVideo('${video.id}')"><span>${escapeHtml(video.title)}</span><span style="color:var(--text-dim)">@${escapeHtml(video.profiles?.username || "usuario")}</span></button>`).join("");
}
window.openHashtagFeed = openHashtagFeed;

function startWatching(video) {
  if (video.user_id === currentUser.id) return;
  if (watchIntervals[video.id]) return; // ya está corriendo, no duplicar

  if (!lsDiscoveryStartedVideos.has(video.id)) {
    lsDiscoveryStartedVideos.add(video.id);
    recordDiscoverySignal(video.id, "view_start", 0);
  }

  watchSeconds[video.id] = watchSeconds[video.id] || 0;

  const interval = setInterval(async () => {
    if (document.hidden) return;

    watchSeconds[video.id] += 5;
    const secsEl = document.getElementById(`secs-${video.id}`);
    if (secsEl) secsEl.textContent = watchSeconds[video.id] + "s";

    if (watchSeconds[video.id] % 15 === 0) {
      recordDiscoverySignal(video.id, "watch_progress", watchSeconds[video.id]);
      const { data, error } = await sb.rpc("award_watch_points", {
        p_video_id: video.id,
        p_viewer_id: currentUser.id,
        p_new_seconds: 15
      });

      if (error) return;

      if (data.ok) {
        currentProfile.points_balance += data.points_viewer;
        updateBalanceUI();
        showFloatingPointsSafe(data.points_viewer, document.getElementById(`pts-${video.id}`));
        const ptsEl = document.getElementById(`pts-${video.id}`);
        if (ptsEl) ptsEl.innerHTML = `+${data.points_viewer} pts <span class="mono">${watchSeconds[video.id]}s</span>`;
      } else if (data.error === "daily_cap_reached") {
        stopWatching(video.id);
        showToast("Alcanzaste tu tope diario de puntos por mirar hoy");
      } else if (data.error === "cuenta_bloqueada") {
        stopWatching(video.id);
      } else if (data.error === "video_repetido") {
        stopWatching(video.id);
        showToast("Ya sumaste el máximo por este video hoy — mirá otro para seguir ganando");
      } else if (data.error === "saldo_maximo") {
        stopWatching(video.id);
        showToast("Llegaste al tope de saldo de tu plan — canjeá para seguir ganando 💰");
      }
    }
  }, 5000);

  watchIntervals[video.id] = interval;
}

function stopWatching(videoId) {
  if (watchIntervals[videoId]) {
    clearInterval(watchIntervals[videoId]);
    delete watchIntervals[videoId];
  }
}

function clearAllWatchIntervals() {
  Object.values(watchIntervals).forEach(clearInterval);
  watchIntervals = {};
  watchSeconds = {};

  // 5.4.6 FINAL: nada del Feed queda reproduciéndose detrás de otra pantalla.
  document.querySelectorAll(".feed-item [id^='embed-'], [id^='embed-'].feed-embed-frame").forEach(releaseFeedMediaElement);
  pauseFeedMedia();

  loadedEmbeds.clear();

  if (feedObserverInstance) {
    feedObserverInstance.disconnect();
    feedObserverInstance = null;
  }
}

// ============================================================
// SUBIR VIDEO
// ============================================================
function normalizeHashtag(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/^#+/, "")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 28);
}

function getUploadHashtags() {
  const raw = document.getElementById("uploadHashtags")?.value || "";
  const parts = raw.split(/[\s,]+/).map(normalizeHashtag).filter(tag => tag.length >= 2);
  const unique = [...new Set(parts)];
  return { tags:unique.slice(0, 5), tooMany:unique.length > 5 };
}

function refreshUploadHashtagPreview() {
  const { tags, tooMany } = getUploadHashtags();
  const preview = document.getElementById("uploadHashtagPreview");
  if (!preview) return;
  preview.innerHTML = `${tags.map(tag => `<span style="border:1px solid rgba(103,232,249,.28);background:rgba(103,232,249,.08);color:#67e8f9;border-radius:20px;padding:5px 9px;">#${escapeHtml(tag)}</span>`).join("")}${tooMany ? `<span style="color:var(--red)">Máximo 5 etiquetas</span>` : ""}`;
}
window.refreshUploadHashtagPreview = refreshUploadHashtagPreview;

async function loadTrendingHashtagSuggestions() {
  const { data } = await sb.rpc("get_trending_hashtags", { p_limit:12 });
  const datalist = document.getElementById("uploadHashtagSuggestions");
  if (datalist) datalist.innerHTML = (data || []).map(tag => `<option value="#${escapeHtml(tag.slug)}"></option>`).join("");
}

async function saveVideoHashtags(videoId) {
  const { tags, tooMany } = getUploadHashtags();
  if (tooMany) throw new Error("Podés usar como máximo 5 hashtags.");
  const { error } = await sb.rpc("set_video_hashtags", { p_video_id:videoId, p_tags:tags });
  if (error) throw error;
}

async function renderUpload() {
  rawSelectedFile = null;
  trimmedFile = null;

  const main = document.getElementById("appView");
  main.innerHTML = `<p style="color:var(--text-dim);">Preparando Subir video...</p>`;

  let uploadReward = 40;
  try {
    const { data } = await sb
      .from("app_config")
      .select("value")
      .eq("key", "points_per_upload")
      .single();

    if (data?.value != null) {
      uploadReward = Number(data.value) || 40;
    }
  } catch (_) {}

  main.innerHTML = `
    <div class="ls-upload-studio-shell" style="max-width:860px;margin:0 auto;">
      <div class="ls-upload-studio-hero" style="
        position:relative;
        overflow:hidden;
        padding:22px;
        margin-bottom:18px;
        border:1px solid rgba(250,204,21,.22);
        border-radius:18px;
        background:
          radial-gradient(circle at 85% 15%, rgba(250,204,21,.11), transparent 32%),
          linear-gradient(145deg, rgba(255,255,255,.025), rgba(255,255,255,.006));
      ">
        <div style="
          font-family:'JetBrains Mono',monospace;
          font-size:9px;
          font-weight:900;
          letter-spacing:.13em;
          color:var(--gold);
          text-transform:uppercase;
          margin-bottom:7px;
        ">CREATOR STUDIO</div>

        <div style="display:flex;justify-content:space-between;gap:18px;align-items:flex-end;flex-wrap:wrap;">
          <div>
            <h1 class="page-title" style="margin-bottom:5px;">Subir video</h1>
            <p class="page-sub" style="margin:0;max-width:560px;">
              Compartí un enlace o publicá tu archivo. LiveScroll prepara todo antes de enviarlo.
            </p>
          </div>

          <div style="
            border:1px solid rgba(34,197,94,.28);
            background:rgba(34,197,94,.07);
            border-radius:12px;
            padding:10px 13px;
            min-width:150px;
          ">
            <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.08em;">Recompensa</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:900;color:var(--green);margin-top:2px;">
              +${uploadReward} pts
            </div>
          </div>
        </div>
      </div>

      <div class="ls-upload-studio-steps" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;">
        <div style="padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--panel);font-size:11px;">
          <strong style="color:var(--gold);">01</strong><br>
          <span style="color:var(--text-dim);">Elegí origen</span>
        </div>
        <div style="padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--panel);font-size:11px;">
          <strong style="color:var(--gold);">02</strong><br>
          <span style="color:var(--text-dim);">Revisá el contenido</span>
        </div>
        <div style="padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--panel);font-size:11px;">
          <strong style="color:var(--gold);">03</strong><br>
          <span style="color:var(--text-dim);">Publicá</span>
        </div>
      </div>

      <div class="ls-upload-mode-grid" style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
        margin-bottom:16px;
      ">
        <button
          class="btn"
          id="modeLinkBtn"
          onclick="setUploadMode('link')"
          style="padding:14px;border-radius:12px;"
        >
          🔗 Usar enlace
          <span style="display:block;font-size:9px;opacity:.72;margin-top:3px;">Kick · Twitch · YouTube · TikTok</span>
        </button>

        <button
          class="btn-outline"
          id="modeFileBtn"
          onclick="setUploadMode('file')"
          style="padding:14px;border-radius:12px;"
        >
          🎬 Subir archivo
          <span style="display:block;font-size:9px;opacity:.72;margin-top:3px;">MP4 · MKV · WEBM</span>
        </button>
      </div>

      <div class="form-card ls-upload-studio-form" style="
        border-radius:16px;
        border:1px solid var(--border);
        padding:18px;
        min-width:0;
        overflow:hidden;
        box-sizing:border-box;
      ">
        <div id="linkFields">
          <div style="font-size:11px;font-weight:800;margin-bottom:12px;">🔗 Video desde plataforma</div>

          <div class="field">
            <label>Plataforma</label>
            <select
              id="uploadPlatform"
              style="width:100%;padding:12px;background:var(--ink);border:1px solid var(--border);border-radius:10px;color:var(--text);font-family:inherit"
            >
              <option value="kick">Kick</option>
              <option value="twitch">Twitch</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>

          <div class="field">
            <label>Link del video</label>
            <input type="text" id="uploadUrl" placeholder="Pegá acá el enlace del video">
          </div>
        </div>

        <div id="fileFields" class="hidden">
          <div style="font-size:11px;font-weight:800;margin-bottom:12px;">🎬 Archivo desde tu dispositivo</div>

          <div class="field">
            <label>Archivo de video</label>

            <button class="ls-upload-file-drop"
              type="button"
              onclick="openLiveScrollAndroidMedia('files','uploadFile','elegir el video que querés publicar','files')"
              style="
                width:100%;
                display:block;
                border:1px dashed rgba(250,204,21,.35);
                background:rgba(250,204,21,.035);
                color:var(--text);
                font-family:inherit;
                border-radius:14px;
                padding:22px 14px;
                text-align:center;
                cursor:pointer;
              "
            >
              <div style="font-size:28px;margin-bottom:6px;">＋</div>
              <div style="font-weight:800;font-size:12px;">Elegir video</div>
              <div style="font-size:10px;color:var(--text-dim);margin-top:4px;">
                MP4, MKV o WEBM · máximo 50 MB
              </div>
            </button>

            <input
              type="file"
              id="uploadFile"
              accept=".mp4,.mkv,video/mp4,video/x-matroska,video/webm"
              onchange="previewFileSize()"
              style="display:none;"
            >

            <div id="fileSizeInfo" style="font-size:12px;margin-top:8px;"></div>

            <p style="font-size:10px;color:var(--text-dim);margin:8px 0 0;line-height:1.5;">
              Si el video es demasiado largo o pesado, podés seleccionarlo igual:
              LiveScroll te ofrecerá recortarlo antes de subirlo.
            </p>

            <div
              id="uploadPreviewSafe"
              class="ls-upload-preview-safe"
              style="
                display:none;
                position:relative !important;
                width:100% !important;
                max-width:100% !important;
                min-width:0 !important;
                aspect-ratio:16 / 9 !important;
                height:auto !important;
                margin:12px 0 0 !important;
                overflow:hidden !important;
                box-sizing:border-box !important;
                border-radius:12px;
                border:1px solid var(--border);
                background:#000;
              "
            >
              <div class="tag">Vista previa</div>
              <video
                id="uploadPreviewVideoSafe"
                controls
                muted
                playsinline
                preload="metadata"
                style="
                  position:absolute !important;
                  inset:0 !important;
                  display:block !important;
                  width:100% !important;
                  height:100% !important;
                  max-width:none !important;
                  max-height:none !important;
                  min-width:0 !important;
                  object-fit:contain !important;
                  object-position:center center !important;
                  margin:0 !important;
                  padding:0 !important;
                  background:#000 !important;
                  box-sizing:border-box !important;
                "
              ></video>
              <div id="uploadPreviewMsgSafe" class="ls-upload-preview-msg-safe"></div>
            </div>
          </div>

          <div id="uploadProgress" class="hidden" style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-dim);margin-bottom:5px;">
              <span>SUBIENDO</span>
              <span>LiveScroll</span>
            </div>
            <div style="background:var(--panel-2);border-radius:20px;height:10px;overflow:hidden;">
              <div id="uploadProgressBar" style="width:0%;height:100%;background:var(--gold);transition:width .2s;"></div>
            </div>
          </div>
        </div>

        <div style="border-top:1px solid var(--border);margin:16px 0;"></div>

        <div class="field">
          <label>Título</label>
          <input
            type="text"
            id="uploadTitle"
            maxlength="100"
            placeholder="Ej: Jugada increíble en vivo"
          >
          <div style="font-size:9px;color:var(--text-dim);margin-top:5px;">
            Corto, claro y fácil de reconocer.
          </div>
        </div>

        <div class="field">
          <label>Hashtags <span style="color:var(--text-dim);font-weight:500">(hasta 5)</span></label>
          <input type="text" id="uploadHashtags" list="uploadHashtagSuggestions" maxlength="150" placeholder="#gaming #futbol #humor" oninput="refreshUploadHashtagPreview()">
          <datalist id="uploadHashtagSuggestions"></datalist>
          <div id="uploadHashtagPreview" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;font-size:10px;"></div>
          <div style="font-size:9px;color:var(--text-dim);margin-top:6px;">Ayudan a encontrar tu video. Separalos con espacios.</div>
        </div>

        <button
          class="btn"
          id="uploadSubmitBtn"
          onclick="handleUpload()"
          style="width:100%;padding:13px;border-radius:11px;font-weight:900;"
        >
          Publicar video · +${uploadReward} pts
        </button>

        <div id="uploadError" class="error-msg" style="margin-top:8px;"></div>
      </div>
    </div>`;

  setUploadMode("link");
  loadTrendingHashtagSuggestions();
}

const MAX_FILE_MB = 50;
let rawSelectedFile = null;
let trimmedFile = null;
let uploadPreviewUrlSafe = null;
let videoReeditContext = null;
let videoReeditAbortController = null;

function cancelVideoReeditorPreparation() {
  window.__lsVideoReeditCancelledByUser = true;
  if (videoReeditAbortController) {
    try { videoReeditAbortController.abort(); } catch (_) {}
  }
  videoReeditAbortController = null;
  videoReeditContext = null;
  rawSelectedFile = null;
  trimmedFile = null;
  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";
  showToast("Preparación cancelada. El video original sigue intacto.");
}

window.cancelVideoReeditorPreparation = cancelVideoReeditorPreparation;

function previewFileSize() {
  rawSelectedFile = document.getElementById("uploadFile").files[0] || null;
  trimmedFile = null;
  refreshFileSizeUI();
  refreshUploadPreviewSafe();
}

function clearUploadPreviewSafe() {
  const preview = document.getElementById("uploadPreviewSafe");
  const video = document.getElementById("uploadPreviewVideoSafe");
  const msg = document.getElementById("uploadPreviewMsgSafe");

  if (uploadPreviewUrlSafe) {
    URL.revokeObjectURL(uploadPreviewUrlSafe);
    uploadPreviewUrlSafe = null;
  }

  if (video) {
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.style.display = "";
  }

  if (msg) {
    msg.textContent = "";
    msg.classList.remove("active");
  }

  if (preview) {
    preview.classList.remove("active", "landscape", "portrait", "square");
    preview.style.setProperty("display", "none", "important");
    preview.style.setProperty("aspect-ratio", "16 / 9", "important");
    preview.style.setProperty("height", "auto", "important");
    delete preview.dataset.detectedRatio;
  }
}

function refreshUploadPreviewSafe() {
  const preview = document.getElementById("uploadPreviewSafe");
  const video = document.getElementById("uploadPreviewVideoSafe");
  const msg = document.getElementById("uploadPreviewMsgSafe");
  const file = trimmedFile || rawSelectedFile;

  if (!preview || !video || !msg) return;

  clearUploadPreviewSafe();
  if (!file) return;

  uploadPreviewUrlSafe = URL.createObjectURL(file);
  preview.classList.add("active");
  preview.style.setProperty("display", "block", "important");
  preview.style.setProperty("width", "100%", "important");
  preview.style.setProperty("max-width", "100%", "important");
  preview.style.setProperty("aspect-ratio", "16 / 9", "important");
  preview.style.setProperty("height", "auto", "important");
  preview.style.setProperty("overflow", "hidden", "important");
  video.src = uploadPreviewUrlSafe;

  video.onerror = () => {
    video.style.display = "none";
    msg.textContent = "Este formato no puede previsualizarse en este navegador, pero podés subirlo normalmente.";
    msg.classList.add("active");
  };

  video.onloadedmetadata = () => {
    video.style.setProperty("display", "block", "important");
    msg.classList.remove("active");

    // Caja fija responsive 16:9:
    // horizontales llenan el ancho;
    // verticales quedan centrados con barras laterales;
    // nunca se modifica el tamaño del contenedor según metadata del MP4.
    preview.style.setProperty("display", "block", "important");
    preview.style.setProperty("width", "100%", "important");
    preview.style.setProperty("max-width", "100%", "important");
    preview.style.setProperty("aspect-ratio", "16 / 9", "important");
    preview.style.setProperty("height", "auto", "important");
  };
}

function refreshFileSizeUI() {
  const info = document.getElementById("fileSizeInfo");
  document.getElementById("trimActionsWrap")?.remove();
  if (!info) return;

  const effectiveFile = trimmedFile || rawSelectedFile;
  if (!effectiveFile) { info.textContent = ""; return; }

  const mb = (effectiveFile.size / (1024 * 1024)).toFixed(1);
  const overLimit = effectiveFile.size > MAX_FILE_MB * 1024 * 1024;

  info.innerHTML = trimmedFile
    ? `<span style="color:${overLimit ? "var(--red)" : "var(--green)"}">✂️ Recortado: ${mb}MB${overLimit ? ` — todavía supera los ${MAX_FILE_MB}MB, recortá un poco más` : " — perfecto"}</span>`
    : (overLimit
        ? `<span style="color:var(--red)">${mb}MB — supera el máximo de ${MAX_FILE_MB}MB</span>`
        : `<span style="color:var(--green)">${mb}MB — perfecto, entra sin problema</span>`);

  const actionsWrap = document.createElement("div");
  actionsWrap.id = "trimActionsWrap";
  actionsWrap.style.cssText = "margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;";
  actionsWrap.innerHTML = `
    <button type="button" class="btn-outline" style="font-size:12px; padding:6px 12px;" onclick="openVideoTrimmer()">✂️ ${trimmedFile ? "Recortar de nuevo" : "Recortar este video"}</button>
    ${trimmedFile ? `<button type="button" class="btn-outline" style="font-size:12px; padding:6px 12px;" onclick="discardTrim()">Usar el original</button>` : ""}`;
  info.insertAdjacentElement("afterend", actionsWrap);
}

function discardTrim() {
  trimmedFile = null;
  refreshFileSizeUI();
  refreshUploadPreviewSafe();
}

function formatTrimSeconds(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

async function openVideoReeditor(videoId) {
  const video = (window.__profileFeedVideos || []).find(v => v.id === videoId);
  if (!video || video.user_id !== currentUser.id) {
    showToast("No encontramos ese video en tu perfil");
    return;
  }
  if (video.platform !== "upload" || !isSafeUrl(video.video_url)) {
    showToast("Solo se pueden reeditar videos subidos directamente a LiveScroll");
    return;
  }
  if (!window.MediaRecorder || !HTMLVideoElement.prototype.captureStream) {
    showToast("Este navegador no permite reeditar videos. Probá con Chrome o Firefox actualizados.");
    return;
  }

  closeVideoActionSheet();
  document.querySelectorAll(".video-grid-menu").forEach(el => el.classList.add("hidden"));
  if (videoReeditAbortController) {
    try { videoReeditAbortController.abort(); } catch (_) {}
  }
  window.__lsVideoReeditCancelledByUser = false;
  videoReeditAbortController = new AbortController();
  const localAbortController = videoReeditAbortController;
  let preparationTimedOut = false;
  const preparationTimeout = setTimeout(() => {
    preparationTimedOut = true;
    try { localAbortController.abort(); } catch (_) {}
  }, 90000);

  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="modal-overlay" style="z-index:140;">
      <div class="modal-box" style="max-width:420px;text-align:center;">
        <div class="modal-box-body" style="padding:30px 22px;">
          <div style="font-size:38px;margin-bottom:12px;">✂️</div>
          <h2 style="margin:0 0 7px;">Preparando tu video</h2>
          <p id="videoReeditPrepareStatus" style="margin:0;color:var(--text-dim);font-size:12px;line-height:1.5;">Descargando una copia segura para editar. El original todavía no se modifica.</p>
          <div class="ls-reedit-loading"><i></i></div>
          <button class="btn-outline" style="width:100%;margin-top:16px;" onclick="cancelVideoReeditorPreparation()">Cancelar</button>
        </div>
      </div>
    </div>`;

  try {
    const response = await fetch(video.video_url, {
      cache:"no-store",
      signal:localAbortController.signal
    });
    if (!response.ok) throw new Error(`No se pudo descargar (${response.status})`);
    const contentLength = Number(response.headers.get("content-length") || 0);
    const prepareStatus = document.getElementById("videoReeditPrepareStatus");
    if (prepareStatus && contentLength > 0) {
      prepareStatus.textContent = `Descargando ${(contentLength / (1024 * 1024)).toFixed(1)} MB para editar sin tocar el original...`;
    }
    const blob = await response.blob();
    if (!blob.size) throw new Error("El archivo recibido está vacío");
    if (blob.size > MAX_FILE_MB * 1024 * 1024) {
      throw new Error(`El archivo supera los ${MAX_FILE_MB} MB permitidos para reedición`);
    }
    const extension = blob.type.includes("webm") ? "webm" : "mp4";
    rawSelectedFile = new File([blob], `video-${video.id}.${extension}`, { type:blob.type || "video/mp4" });
    trimmedFile = null;
    videoReeditContext = {
      videoId:video.id,
      title:video.title || "Video",
      oldVideoUrl:video.video_url,
      oldThumbnailUrl:video.thumbnail_url || null
    };
    openVideoTrimmer();
  } catch (error) {
    if (window.__lsVideoReeditCancelledByUser) return;
    console.error("No se pudo preparar la reedición:", error);
    wrap.innerHTML = "";
    videoReeditContext = null;
    rawSelectedFile = null;
    showToast(preparationTimedOut
      ? "La descarga tardó demasiado. Probá nuevamente con una conexión más estable."
      : "No pudimos preparar el video. El original sigue intacto.");
  } finally {
    clearTimeout(preparationTimeout);
    if (videoReeditAbortController === localAbortController) {
      videoReeditAbortController = null;
    }
  }
}

function getClipStoragePathFromPublicUrl(publicUrl) {
  try {
    const parsed = new URL(publicUrl);
    const marker = "/storage/v1/object/public/clip-videos/";
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex < 0) return null;
    return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
  } catch (_) {
    return null;
  }
}

async function saveReeditedVideo(file) {
  const context = videoReeditContext;
  if (!context || !file) throw new Error("Falta el contexto de reedición");
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new Error(`La nueva edición supera los ${MAX_FILE_MB} MB`);
  }

  const progressText = document.getElementById("trimProgressText");
  const progressBar = document.getElementById("trimProgressBar");
  if (progressText) progressText.textContent = "Subiendo la nueva edición de forma segura...";
  if (progressBar) progressBar.style.width = "35%";

  const newR2Urls = [];
  try {
  const videoUpload = await uploadMediaToR2(file);
  const newVideoUrl = videoUpload.url;
  newR2Urls.push(newVideoUrl);
  if (!newVideoUrl) throw new Error("No se obtuvo la URL de la nueva edición");
  if (progressBar) progressBar.style.width = "65%";

  let newThumbnailUrl = null;
  try {
    const thumbnailBlob = await createVideoThumbnailBlob(file);
    if (thumbnailBlob) {
      const thumbUpload = await uploadMediaToR2(thumbnailBlob);
      newThumbnailUrl = thumbUpload?.url || null;
      if (newThumbnailUrl) newR2Urls.push(newThumbnailUrl);
    }
  } catch (thumbnailError) {
    console.warn("No se pudo crear la nueva carátula:", thumbnailError);
  }
  if (progressBar) progressBar.style.width = "82%";

  const { data:updateResult, error:updateError } = await sb.rpc("replace_own_video_media", {
    p_video_id:context.videoId,
    p_video_url:newVideoUrl,
    p_thumbnail_url:newThumbnailUrl
  });
  if (updateError || !updateResult?.ok) {
    throw updateError || new Error(updateResult?.error || "No se pudo guardar la edición");
  }
  if (progressBar) progressBar.style.width = "100%";

  const oldPaths = [
    getClipStoragePathFromPublicUrl(context.oldVideoUrl),
    getClipStoragePathFromPublicUrl(context.oldThumbnailUrl)
  ].filter(Boolean);
  if (oldPaths.length) {
    sb.storage.from("clip-videos").remove(oldPaths).catch(error => {
      console.warn("La edición se guardó, pero no se pudo limpiar un archivo anterior:", error);
    });
  }

  const editedTitle = context.title;
  closeVideoTrimmer();
  lsPerfCache.profileVideos.at = 0;
  lsPerfCache.feed.at = 0;
  loadedEmbeds.clear();
  showToast(`✂️ “${editedTitle}” fue reeditado sin perder sus interacciones`);
  await renderProfile();
  } catch (error) {
    await Promise.allSettled(newR2Urls.map(deleteMediaFromR2));
    throw error;
  }
}

function openVideoTrimmer() {
  if (!rawSelectedFile) return;
  if (!window.MediaRecorder || !HTMLVideoElement.prototype.captureStream) {
    showToast("Tu navegador no permite recortar acá. Probá con Chrome o Firefox actualizados.");
    return;
  }

  const wrap = document.getElementById("globalModalWrap");
  const objectUrl = URL.createObjectURL(rawSelectedFile);
  wrap.innerHTML = `
    <div class="modal-overlay" style="z-index:140;">
      <div class="modal-box" style="max-width:420px;">
        <div class="modal-box-header"><h2>✂️ ${videoReeditContext ? "Reeditar video" : "Recortar video"}</h2></div>
        <div class="modal-box-body">
          <video id="trimPreviewVideo" src="${objectUrl}" controls muted style="width:100%; border-radius:10px; margin-bottom:14px; background:#000;"></video>
          <div id="trimLoadingMsg" style="font-size:12px; color:var(--text-dim); margin-bottom:10px;">Cargando video...</div>
          <div id="trimControls" class="hidden">
            <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-dim); margin-bottom:4px;">
              <span>Inicio: <span id="trimStartLabel" class="mono">0:00</span></span>
              <span>Fin: <span id="trimEndLabel" class="mono">0:00</span></span>
            </div>
            <label style="font-size:11px; color:var(--text-dim);">Arrastrá para elegir dónde empieza:</label>
            <input type="range" id="trimStartRange" min="0" max="1" step="0.1" value="0" style="width:100%;">
            <label style="font-size:11px; color:var(--text-dim);">Arrastrá para elegir dónde termina:</label>
            <input type="range" id="trimEndRange" min="0" max="1" step="0.1" value="1" style="width:100%;">
            <div style="font-size:12px; color:var(--text-dim); margin-top:8px;">Duración elegida: <strong id="trimDurationLabel" class="mono" style="color:var(--gold);">0s</strong></div>
          </div>
          <div id="trimProgressWrap" class="hidden" style="margin-top:14px;">
            <div style="background:var(--panel-2); border-radius:20px; height:10px; overflow:hidden;">
              <div id="trimProgressBar" style="width:0%; height:100%; background:var(--gold); transition:width 0.15s;"></div>
            </div>
            <div id="trimProgressText" style="font-size:12px; color:var(--text-dim); margin-top:6px; text-align:center;">Procesando, no cierres esta ventana...</div>
          </div>
        </div>
        <div class="modal-box-footer">
          <div style="display:flex; gap:10px;">
            <button class="btn-outline" style="flex:1;" onclick="closeVideoTrimmer()">Cancelar</button>
            <button class="btn" id="trimConfirmBtn" style="flex:1;" onclick="confirmVideoTrim()" disabled>${videoReeditContext ? "Guardar nueva edición" : "Recortar y usar"}</button>
          </div>
        </div>
      </div>
    </div>`;

  const video = document.getElementById("trimPreviewVideo");
  video.addEventListener("loadedmetadata", () => {
    const dur = video.duration;
    document.getElementById("trimLoadingMsg").classList.add("hidden");
    document.getElementById("trimControls").classList.remove("hidden");
    document.getElementById("trimConfirmBtn").disabled = false;

    const startRange = document.getElementById("trimStartRange");
    const endRange = document.getElementById("trimEndRange");
    startRange.max = dur; endRange.max = dur;
    startRange.value = 0; endRange.value = dur;
    updateTrimLabels();

    startRange.addEventListener("input", () => {
      if (parseFloat(startRange.value) >= parseFloat(endRange.value)) startRange.value = Math.max(0, parseFloat(endRange.value) - 1);
      video.currentTime = parseFloat(startRange.value);
      updateTrimLabels();
    });
    endRange.addEventListener("input", () => {
      if (parseFloat(endRange.value) <= parseFloat(startRange.value)) endRange.value = Math.min(dur, parseFloat(startRange.value) + 1);
      video.currentTime = parseFloat(endRange.value);
      updateTrimLabels();
    });
  });
}

function updateTrimLabels() {
  const startRange = document.getElementById("trimStartRange");
  const endRange = document.getElementById("trimEndRange");
  if (!startRange || !endRange) return;
  const start = parseFloat(startRange.value);
  const end = parseFloat(endRange.value);
  document.getElementById("trimStartLabel").textContent = formatTrimSeconds(start);
  document.getElementById("trimEndLabel").textContent = formatTrimSeconds(end);
  document.getElementById("trimDurationLabel").textContent = formatTrimSeconds(end - start);
}

function closeVideoTrimmer() {
  const wasReediting = !!videoReeditContext;
  document.getElementById("globalModalWrap").innerHTML = "";
  videoReeditContext = null;
  if (wasReediting) {
    rawSelectedFile = null;
    trimmedFile = null;
  }
}

async function confirmVideoTrim() {
  const video = document.getElementById("trimPreviewVideo");
  const startRange = document.getElementById("trimStartRange");
  const endRange = document.getElementById("trimEndRange");
  const start = parseFloat(startRange.value);
  const end = parseFloat(endRange.value);

  if (end - start < 1) { showToast("Elegí al menos 1 segundo de duración"); return; }

  document.getElementById("trimControls").classList.add("hidden");
  document.getElementById("trimProgressWrap").classList.remove("hidden");
  document.getElementById("trimConfirmBtn").disabled = true;
  document.getElementById("trimConfirmBtn").textContent = "Procesando...";

  try {
    const result = await trimVideoClientSide(video, start, end, (pct) => {
      const bar = document.getElementById("trimProgressBar");
      if (bar) bar.style.width = `${Math.round(pct * 100)}%`;
    });

    const ext = result.mimeType.includes("mp4") ? "mp4" : "webm";
    const baseName = rawSelectedFile.name.replace(/\.[^.]+$/, "");
    trimmedFile = new File([result.blob], `${baseName}-recorte.${ext}`, { type: result.mimeType });

    if (videoReeditContext) {
      await saveReeditedVideo(trimmedFile);
    } else {
      closeVideoTrimmer();
      refreshFileSizeUI();
      refreshUploadPreviewSafe();
      showToast("¡Video recortado!");
    }
  } catch (e) {
    console.error("Error recortando video:", e);
    showToast("No se pudo recortar. El video original sigue intacto.");
    closeVideoTrimmer();
    videoReeditContext = null;
  }
}

function trimVideoClientSide(video, startSec, endSec, onProgress) {
  return new Promise((resolve, reject) => {
    try {
      const stream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
      const mimeCandidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
      const mimeType = mimeCandidates.find(m => window.MediaRecorder.isTypeSupported(m)) || "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onerror = (e) => reject(e.error || new Error("Error al grabar"));
      recorder.onstop = () => {
        resolve({ blob: new Blob(chunks, { type: mimeType || "video/webm" }), mimeType: mimeType || "video/webm" });
      };

      video.currentTime = startSec;
      video.onseeked = () => {
        video.onseeked = null;
        recorder.start();
        video.play();

        const step = () => {
          if (video.currentTime >= endSec || video.ended) {
            video.pause();
            recorder.stop();
            return;
          }
          if (onProgress) onProgress(Math.min(1, (video.currentTime - startSec) / (endSec - startSec)));
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };
    } catch (e) {
      reject(e);
    }
  });
}

async function setUploadMode(mode) {
  window.currentUploadMode = mode;
  videoReeditContext = null;
  rawSelectedFile = null;
  trimmedFile = null;
  clearUploadPreviewSafe();
  document.getElementById("linkFields").classList.toggle("hidden", mode !== "link");
  document.getElementById("fileFields").classList.toggle("hidden", mode !== "file");
  document.getElementById("modeLinkBtn").className = mode === "link" ? "btn" : "btn-outline";
  document.getElementById("modeFileBtn").className = mode === "file" ? "btn" : "btn-outline";
}

async function handleUpload() {
  if (window.currentUploadMode === "file") {
    await handleUploadFile();
  } else {
    await handleUploadLink();
  }
}

async function getUploadRewardPoints() {
  try {
    const { data } = await sb
      .from("app_config")
      .select("value")
      .eq("key", "points_per_upload")
      .single();

    return Number(data?.value) || 40;
  } catch (_) {
    return 40;
  }
}

function showVideoPublishedSuccess(title, pointsEarned) {
  const existing = document.getElementById("videoPublishedSuccessModal");
  if (existing) existing.remove();

  const safeTitle = escapeHtml(title || "Tu video");

  const modal = document.createElement("div");
  modal.id = "videoPublishedSuccessModal";
  modal.style.cssText = `
    position:fixed;inset:0;z-index:99999;
    background:rgba(0,0,0,.76);
    display:flex;align-items:center;justify-content:center;
    padding:18px;box-sizing:border-box;
    backdrop-filter:blur(7px);
  `;

  modal.innerHTML = `
    <div style="
      width:min(100%,430px);
      background:var(--panel);
      border:1px solid rgba(34,197,94,.38);
      border-radius:18px;
      padding:22px;
      box-shadow:0 22px 70px rgba(0,0,0,.55);
      text-align:center;
    ">
      <div style="
        width:58px;height:58px;border-radius:50%;
        margin:0 auto 12px;
        display:flex;align-items:center;justify-content:center;
        background:rgba(34,197,94,.12);
        border:1px solid rgba(34,197,94,.35);
        font-size:28px;
      ">✓</div>

      <div style="
        font-family:'JetBrains Mono',monospace;
        font-size:9px;font-weight:900;
        color:var(--green);
        letter-spacing:.12em;text-transform:uppercase;
        margin-bottom:6px;
      ">PUBLICADO</div>

      <h2 style="margin:0 0 7px;font-size:20px;">¡Video publicado!</h2>
      <p style="margin:0;color:var(--text-dim);font-size:12px;line-height:1.5;">
        ${safeTitle}
      </p>

      ${pointsEarned > 0 ? `
        <div style="
          margin:16px 0;
          padding:12px;
          border-radius:12px;
          border:1px solid rgba(34,197,94,.25);
          background:rgba(34,197,94,.07);
        ">
          <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.08em;">
            Ganaste
          </div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:23px;font-weight:900;color:var(--green);">
            +${pointsEarned} pts
          </div>
        </div>
      ` : `
        <div style="margin:16px 0;color:var(--text-dim);font-size:11px;">
          Video publicado sin recompensa de puntos.
        </div>
      `}

      <button class="btn" onclick="closeVideoPublishedSuccess(true)" style="width:100%;padding:12px;">
        ▶ Ver en LiveScroll
      </button>

      <button class="btn-outline" onclick="closeVideoPublishedSuccess(false)" style="width:100%;padding:10px;margin-top:8px;">
        Cerrar
      </button>
    </div>
  `;

  document.body.appendChild(modal);
}

function closeVideoPublishedSuccess(goToFeed) {
  document.getElementById("videoPublishedSuccessModal")?.remove();
  if (goToFeed) switchTab("feed");
}

async function handleUploadLink() {
  const platform = document.getElementById("uploadPlatform").value;
  const title = document.getElementById("uploadTitle").value.trim();
  const url = document.getElementById("uploadUrl").value.trim();
  const errEl = document.getElementById("uploadError");
  errEl.textContent = "";

  if (!title || !url) { errEl.textContent = "Completá título y link."; return; }
  if (getUploadHashtags().tooMany) { errEl.textContent = "Podés usar como máximo 5 hashtags."; return; }

  const { data:createdVideo, error } = await sb.from("videos").insert({
    user_id: currentUser.id,
    platform,
    title,
    video_url: url,
    client_origin: getLiveScrollClientOrigin()
  }).select("id").single();

  if (error) { errEl.textContent = error.message; return; }
  try {
    await saveVideoHashtags(createdVideo.id);
  } catch (tagError) {
    errEl.textContent = "El video se publicó, pero faltan los hashtags: " + tagError.message;
  }
  lsPerfCache.feed = { data:null, at:0 };

  const reward = await getUploadRewardPoints();
  let earned = 0;

  if (currentProfile.is_blocked) {
    showToast("Video publicado (sin puntos: cuenta bloqueada)");
  } else {
    earned = reward;
    currentProfile.points_balance += reward;
    updateBalanceUI();
    showFloatingPointsSafe(reward);
  }

  recordDailyChallengeEvent("upload_video", createdVideo.id);
  showVideoPublishedSuccess(title, earned);
}


async function createVideoThumbnailBlob(file) {
  return new Promise((resolve) => {
    let objectUrl = null;
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    const cleanup = () => {
      try { video.pause(); } catch (_) {}
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };

    const fail = () => {
      cleanup();
      resolve(null);
    };

    video.onerror = fail;

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      video.currentTime = Math.min(Math.max(0.2, duration * 0.12), Math.max(0.2, duration - 0.1));
    };

    video.onseeked = () => {
      try {
        const sourceW = video.videoWidth || 1280;
        const sourceH = video.videoHeight || 720;
        const maxW = 720;
        const scale = Math.min(1, maxW / sourceW);

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(sourceW * scale));
        canvas.height = Math.max(1, Math.round(sourceH * scale));

        const ctx = canvas.getContext("2d");
        if (!ctx) return fail();

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          cleanup();
          resolve(blob || null);
        }, "image/jpeg", 0.82);
      } catch (_) {
        fail();
      }
    };

    try {
      objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;
    } catch (_) {
      fail();
    }
  });
}

async function handleUploadFile() {
  const title = document.getElementById("uploadTitle").value.trim();
  const file = trimmedFile || rawSelectedFile;
  const errEl = document.getElementById("uploadError");
  const btn = document.getElementById("uploadSubmitBtn");
  errEl.textContent = "";

  if (!title || !file) { errEl.textContent = "Completá el título y elegí un archivo."; return; }
  if (getUploadHashtags().tooMany) { errEl.textContent = "Podés usar como máximo 5 hashtags."; return; }
  if (file.size > MAX_FILE_MB * 1024 * 1024) { errEl.textContent = `El archivo supera los ${MAX_FILE_MB}MB permitidos. Probá recortarlo un poco más.`; return; }

  btn.disabled = true;
  btn.textContent = "Subiendo...";
  document.getElementById("uploadProgress").classList.remove("hidden");

  let videoUpload;
  try {
    videoUpload = await uploadMediaToR2(file);
  } catch (uploadError) {
    errEl.textContent = "Error al subir: " + uploadError.message;
    btn.disabled = false;
    btn.textContent = "Publicar video";
    return;
  }

  let thumbnailUrl = null;
  try {
    const thumbnailBlob = await createVideoThumbnailBlob(file);

    if (thumbnailBlob) {
      const thumbUpload = await uploadMediaToR2(thumbnailBlob);
      thumbnailUrl = thumbUpload?.url || null;
    }
  } catch (thumbErr) {
    console.warn("No se pudo generar la carátula, el video se sube igual:", thumbErr);
  }

  const { data:createdVideo, error: insertError } = await sb.from("videos").insert({
    user_id: currentUser.id,
    platform: "upload",
    title,
    video_url: videoUpload.url,
    thumbnail_url: thumbnailUrl,
    client_origin: getLiveScrollClientOrigin()
  }).select("id").single();

  btn.disabled = false;
  btn.textContent = "Publicar video";

  if (insertError) {
    await Promise.allSettled([
      deleteMediaFromR2(videoUpload?.url),
      deleteMediaFromR2(thumbnailUrl)
    ]);
    errEl.textContent = insertError.message;
    return;
  }
  try {
    await saveVideoHashtags(createdVideo.id);
  } catch (tagError) {
    showToast("Video publicado; no pudimos guardar sus hashtags");
  }
  lsPerfCache.feed = { data:null, at:0 };

  const reward = await getUploadRewardPoints();
  let earned = 0;

  if (currentProfile.is_blocked) {
    showToast("Video publicado (sin puntos: cuenta bloqueada)");
  } else {
    earned = reward;
    currentProfile.points_balance += reward;
    updateBalanceUI();
    showFloatingPointsSafe(reward);
  }

  recordDailyChallengeEvent("upload_video", createdVideo.id);
  showVideoPublishedSuccess(title, earned);
}

// ============================================================
// BILLETERA / CANJE
// ============================================================
async function renderWallet() {
  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando billetera...</p>`;

  const plans = await loadPlans();
  const plan = plans.find(p => p.id === currentProfile.plan_id) || plans[0];

  const { data: ledger } = await sb
    .from("points_ledger")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(60);

  const { data: boostStatus } = await sb.rpc("get_boost_status", { p_user_id: currentUser.id });
  const { data: walletConfig } = await sb.from("app_text_config").select("*").eq("key", "wallet_visibility").single();
  const walletClosed = walletConfig?.value === "closed" && !currentProfile.is_admin;

  const MIN_REDEEM = 1500;
  const progressPct = Math.min(100, (currentProfile.points_balance / MIN_REDEEM) * 100);
  const missing = Math.max(0, MIN_REDEEM - currentProfile.points_balance);
  const commissionPreview = Math.round(MIN_REDEEM * plan.commission_pct);

  main.innerHTML = `
    <h1 class="page-title">Billetera</h1>
    ${walletConfig?.value === "closed" && currentProfile.is_admin ? `<div style="background:rgba(248,113,113,0.1); border:1px solid var(--red); color:var(--red); font-size:12px; padding:10px 14px; border-radius:8px; margin-bottom:16px;">🔒 Los retiros están CERRADOS para el resto de los usuarios ahora mismo. Vos seguís pudiendo retirar. Cambialo desde el panel de Admin.</div>` : ""}
    <p class="page-sub">Plan actual: <strong style="color:var(--gold)">${plan.name}</strong> · Comisión por retiro: ${(plan.commission_pct * 100).toFixed(0)}% · Canje mínimo: 1.500 pts</p>

    <div class="wallet-hero">
      <div>
        <div class="label">Balance actual</div>
        <div class="big mono">${currentProfile.points_balance} pts</div>
      </div>
      <div>
        <div class="label">Equivale aprox. a (antes de comisión)</div>
        <div class="big mono" style="color:var(--green)">$${currentProfile.points_balance.toLocaleString("es-AR")} ARS</div>
      </div>
    </div>

    ${renderBoostBox(plan, boostStatus)}

    <div style="margin-bottom:28px">
      <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text-dim);margin-bottom:8px;">
        <span>Progreso hacia tu próximo canje</span>
        <span class="mono">${currentProfile.points_balance} / ${MIN_REDEEM} pts</span>
      </div>
      <div style="background:var(--panel-2);border:1px solid var(--border);border-radius:20px;height:14px;overflow:hidden;">
        <div style="width:${progressPct}%;height:100%;background:linear-gradient(90deg, var(--gold-dim), var(--gold));transition:width 0.4s ease;"></div>
      </div>
      <div style="font-size:12px;color:var(--text-dim);margin-top:6px;">
        ${missing > 0 ? `Te faltan <span style="color:var(--gold)">${missing} pts</span> para poder canjear` : `¡Ya podés solicitar tu canje! 🎉`}
      </div>
    </div>

    ${walletClosed ? `
    <div class="form-card" style="margin-bottom:28px; text-align:center; border-color:var(--red);">
      <div style="font-size:32px; margin-bottom:8px;">🔒</div>
      <h3 style="margin-top:0;">Retiros pausados</h3>
      <p style="color:var(--text-dim); font-size:13px;">Estamos ajustando el sistema de canjes. Tus puntos siguen a salvo, volvé a intentar más tarde.</p>
    </div>` : `
    <div class="form-card" style="margin-bottom:28px">
      <h3 style="margin-top:0">Solicitar canje</h3>
      <div class="field">
        <label>Puntos a canjear (mínimo 1.500)</label>
        <input type="number" id="redeemPoints" placeholder="1500" min="1500" max="${currentProfile.points_balance}" oninput="updateRedeemPreview(${plan.commission_pct})">
      </div>
      <div class="field">
        <label>Alias de MercadoPago</label>
        <input type="text" id="redeemAlias" placeholder="tu.alias.mp">
      </div>
      <div id="redeemPreview" style="font-size:13px; color:var(--text-dim); margin-bottom:14px;">
        Con la comisión de tu plan (${(plan.commission_pct * 100).toFixed(0)}%), 1.500 pts te darían <strong style="color:var(--green)">$${(1500 - commissionPreview).toLocaleString("es-AR")}</strong>
      </div>
      <button class="btn" onclick="handleRedeem(${plan.commission_pct})">Solicitar canje</button>
      <div id="redeemError" class="error-msg"></div>
      <p style="color:var(--text-dim); font-size:12px; margin-top:10px;">
        Los canjes se revisan manualmente antes de acreditarse. El saldo se descuenta al solicitar.
        Tope de canje semanal en tu plan: $${plan.weekly_redemption_cap.toLocaleString("es-AR")}.
      </p>
    </div>`}

    <h3>Historial de movimientos</h3>
    <div id="ledgerList">
      ${(ledger || []).map(l => `
        <div class="ledger-row">
          <span>${reasonLabel(l.reason)} · ${new Date(l.created_at).toLocaleString("es-AR")}</span>
          <span class="amt mono ${l.amount >= 0 ? "pos" : "neg"}">${l.amount >= 0 ? "+" : ""}${l.amount}</span>
        </div>
      `).join("") || "<p style='color:var(--text-dim)'>Sin movimientos todavía.</p>"}
    </div>`;
}

function renderBoostBox(plan, status) {
  if (!status || !status.has_boost_plan) {
    return `
      <div class="form-card" style="margin-bottom:24px; text-align:center; color:var(--text-dim); font-size:13px;">
        Tu plan (${plan.name}) no incluye boost activable. <button onclick="switchTab('store')" style="background:none;border:none;color:var(--gold);cursor:pointer;font-family:inherit;">Ver planes en Tienda →</button>
      </div>`;
  }
  if (status.active) {
    const expires = new Date(status.expires_at);
    return `
      <div class="form-card" style="margin-bottom:24px; border-color:var(--green);">
        ⚡ Boost <strong>x${plan.boost_multiplier}</strong> activo hasta <strong>${expires.toLocaleString("es-AR")}</strong>
      </div>`;
  }
  if (!status.can_activate) {
    const next = new Date(status.next_available);
    return `
      <div class="form-card" style="margin-bottom:24px; color:var(--text-dim); font-size:13px;">
        Tu próximo boost x${plan.boost_multiplier} estará disponible el <strong style="color:var(--text)">${next.toLocaleString("es-AR")}</strong>
      </div>`;
  }
  return `
    <div class="form-card" style="margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <span>Tenés disponible tu boost <strong style="color:var(--gold)">x${plan.boost_multiplier}</strong> por 24hs</span>
      <button class="btn" onclick="handleActivateBoost()">Activar boost</button>
    </div>`;
}

async function handleActivateBoost() {
  const { data, error } = await sb.rpc("activate_boost", { p_user_id: currentUser.id });
  if (error || !data.ok) { showToast("No se pudo activar el boost"); return; }
  showToast("¡Boost activado por 24hs!");
  renderWallet();
}

function updateRedeemPreview(commissionPct) {
  const input = document.getElementById("redeemPoints");
  const preview = document.getElementById("redeemPreview");
  const points = parseInt(input.value, 10) || 1500;
  const commission = Math.round(points * commissionPct);
  preview.innerHTML = `Con la comisión de tu plan (${(commissionPct * 100).toFixed(0)}%), ${points} pts te darían <strong style="color:var(--green)">$${(points - commission).toLocaleString("es-AR")}</strong>`;
}

function reasonLabel(reason) {
  const labels = {
    upload: "Subiste un video",
    watch: "Miraste un video",
    watched_by_other: "Miraron tu video",
    redemption: "Canje solicitado",
    adjustment: "Ajuste manual"
  };
  return labels[reason] || reason;
}

async function handleRedeem() {
  const points = parseInt(document.getElementById("redeemPoints").value, 10);
  const alias = document.getElementById("redeemAlias").value.trim();
  const errEl = document.getElementById("redeemError");
  errEl.textContent = "";

  if (!points || !alias) { errEl.textContent = "Completá los puntos y el alias."; return; }

  const { data, error } = await sb.rpc("request_redemption", {
    p_user_id: currentUser.id,
    p_points: points,
    p_alias: alias
  });

  if (error) { errEl.textContent = error.message; return; }
  if (!data.ok) {
    const messages = {
      below_minimum: "El mínimo para canjear es 1.500 puntos.",
      insufficient_balance: "No tenés suficientes puntos.",
      weekly_cap_exceeded: `Superaste el tope de canje semanal de tu plan. Te quedan $${Math.max(0, data.remaining || 0).toLocaleString("es-AR")} disponibles esta semana.`,
      cuenta_bloqueada: "Tu cuenta está bloqueada para canjes (detectamos otra cuenta desde la misma red). Contactanos si creés que es un error."
    };
    errEl.textContent = messages[data.error] || data.error;
    return;
  }

  currentProfile.points_balance -= points;
  updateBalanceUI();
  showToast(`Canje solicitado: recibís $${data.amount_ars.toLocaleString("es-AR")} (comisión: $${data.commission_ars})`);
  renderWallet();
}

// ============================================================
// MI PERFIL — videos propios y cuánto generaron
// ============================================================

function lsTimeAgo(dateString) {
  if (!dateString) return "";
  const diff = Math.max(0, Date.now() - new Date(dateString).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days} d`;
}

function lsIsWithinHours(dateString, hours) {
  if (!dateString) return false;
  const t = new Date(dateString).getTime();
  return Number.isFinite(t) && (Date.now() - t) >= 0 && (Date.now() - t) <= hours * 3600000;
}

function lsBuildRecentActivity(videos, badges) {
  const items = [];

  (videos || []).slice(0, 3).forEach(v => {
    items.push({
      icon:"🎬",
      title:`Subiste “${v.title || "un video"}”`,
      date:v.created_at
    });
  });

  (badges || []).slice(-2).forEach(b => {
    const d = b.earned_at || b.created_at || b.unlocked_at;
    if (d) items.push({
      icon:b.badge_icon || "🏅",
      title:`Ganaste la medalla “${b.badge_name || "Nueva medalla"}”`,
      date:d
    });
  });

  return items
    .filter(x => x.date)
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);
}

function initProfileNovaTilt() {
  const hero = document.getElementById("lsProfileNovaHero");
  const inner = document.getElementById("lsProfileNovaInner");
  if (!hero || !inner || window.matchMedia("(hover:none)").matches) return;

  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  const paint = () => {
    frame = 0;
    const r = hero.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (pointerX - r.left) / r.width));
    const y = Math.max(0, Math.min(1, (pointerY - r.top) / r.height));
    const ry = (x - .5) * 3.2;
    const rx = (.5 - y) * 2.4;
    hero.style.setProperty("--ls-glow-x", `${x*100}%`);
    hero.style.setProperty("--ls-glow-y", `${y*100}%`);
    inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  };
  const move = (e) => {
    pointerX = e.clientX;
    pointerY = e.clientY;
    if (!frame) frame = requestAnimationFrame(paint);
  };
  const reset = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    inner.style.transform = "";
  };
  hero.addEventListener("mousemove", move);
  hero.addEventListener("mouseleave", reset);
}


async function getMyProfileTitle() {
  const { data, error } = await sb.rpc("get_my_profile_title");
  if (error) {
    console.warn("No se pudo cargar el título propio:", error);
    return null;
  }
  return data?.item_id ? await hydrateProfileTitleRarity(data) : null;
}

async function getPublicProfileTitle(userId) {
  if (!userId) return null;
  const { data, error } = await sb.rpc("get_profile_title", { p_user_id:userId });
  if (error) {
    console.warn("No se pudo cargar el título público:", error);
    return null;
  }
  return data?.item_id ? await hydrateProfileTitleRarity(data) : null;
}

function normalizeProfileTitleRarity(value) {
  const normalized = String(value || "comun")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
  const aliases = {
    comun:"comun", common:"comun",
    rara:"rara", raro:"rara", rare:"rara",
    epica:"epica", epico:"epica", epic:"epica",
    legendaria:"legendaria", legendario:"legendaria", legendary:"legendaria",
    exclusiva:"exclusiva", exclusivo:"exclusiva", exclusive:"exclusiva",
    mitica:"mitica", mitico:"mitica", mythic:"mitica"
  };
  return aliases[normalized] || "comun";
}

async function hydrateProfileTitleRarity(title) {
  if (!title?.item_id) return title;
  if (title.rarity) return { ...title, rarity:normalizeProfileTitleRarity(title.rarity) };
  const { data } = await sb.from("store_items").select("rarity").eq("id", title.item_id).maybeSingle();
  return { ...title, rarity:normalizeProfileTitleRarity(data?.rarity) };
}

function renderProfileTitleInline(title, isOwnProfile = false) {
  if (!title?.item_id) {
    if (!isOwnProfile) return "";

    return `
      <button
        type="button"
        onclick="openMyTitlesFromProfile()"
        title="Equipar un título"
        style="
          display:inline-flex;
          align-items:center;
          justify-content:center;
          width:30px;
          height:30px;
          margin-top:5px;
          border-radius:999px;
          border:1px solid rgba(34,197,94,.45);
          background:rgba(34,197,94,.10);
          color:var(--green);
          font-size:20px;
          font-weight:900;
          cursor:pointer;
          box-shadow:0 0 14px rgba(34,197,94,.16);
        "
      >+</button>`;
  }

  const rarity = normalizeProfileTitleRarity(title.rarity);
  const rarityClass = getStoreBadgeRarityClass(rarity);
  const rarityLabel = getStoreBadgeRarityLabel(rarity);
  return `
    <button
      class="ls-profile-title-chip ${rarityClass}"
      type="button"
      ${isOwnProfile ? 'onclick="openMyTitlesFromProfile()"' : ""}
      title="${isOwnProfile ? "Cambiar título" : "Título de perfil"}"
      style="
        display:inline-flex;
        align-items:center;
        gap:6px;
        margin-top:5px;
        padding:4px 9px;
        border-radius:999px;
        border:1px solid rgba(203,213,225,.22);
        font-family:'JetBrains Mono',monospace;
        font-size:9px;
        font-weight:900;
        letter-spacing:.04em;
        text-transform:uppercase;
        ${isOwnProfile ? "cursor:pointer;" : "cursor:default;"}
      "
    >
      <span style="font-size:13px;">${title.icon || "🏷️"}</span>
      <span style="position:relative;z-index:1;">${escapeHtml(title.name || "Título")} · ${escapeHtml(rarityLabel)}</span>
    </button>`;
}

function openMyBadgesFromProfile() {
  openMyMedalsPanel("badge");
}

function openMyTitlesFromProfile() {
  openMyMedalsPanel("title");
}

async function handleEquipProfileTitle(itemId) {
  const { data, error } = await sb.rpc("equip_profile_title", { p_item_id:itemId });

  if (error || !data?.ok) {
    const msgs = {
      titulo_no_disponible:"Este título ya no está disponible.",
      titulo_no_desbloqueado:"Primero tenés que conseguir este título.",
      not_authenticated:"Volvé a iniciar sesión."
    };
    showToast(msgs[data?.error] || "No se pudo equipar el título");
    return;
  }

  showToast(`🏷️ Título equipado: ${data.title || "listo"}`);
  window.__myProfileTitle = data;
  closeManagedModal();
  await renderProfile();
}

async function handleUnequipProfileTitle() {
  const { data, error } = await sb.rpc("unequip_profile_title");

  if (error || !data?.ok) {
    showToast("No se pudo quitar el título");
    return;
  }

  window.__myProfileTitle = null;
  showToast("Título quitado");
  closeManagedModal();
  await renderProfile();
}

function openTitleDetail(itemId, name, icon, equipped = false, obtainedAt = "", rarity = "comun") {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  const safeRarity = normalizeProfileTitleRarity(rarity);
  const rarityClass = getStoreBadgeRarityClass(safeRarity);
  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked" style="z-index:240;" data-modal-locked="1">
      <div class="modal-box" style="max-width:350px;">
        <div class="modal-box-body" style="padding:26px;text-align:center;">
          <div class="ls-profile-title-chip ${rarityClass}" style="width:76px;height:76px;border:1px solid;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:44px;margin:0 auto 10px;">${icon || "🏷️"}</div>
          <h2 style="margin:0 0 6px;">${escapeHtml(name || "Título")}</h2>
          <div style="font-size:10px;color:var(--gold);font-family:'JetBrains Mono',monospace;font-weight:900;">
            TÍTULO ${escapeHtml(getStoreBadgeRarityLabel(safeRarity).toUpperCase())}
          </div>
          <p style="font-size:12px;color:var(--text-dim);line-height:1.5;margin:13px 0 0;">
            Este título se muestra debajo de tu nombre tanto en tu perfil como cuando otras personas visitan tu perfil.
          </p>
          ${obtainedAt ? `<div style="font-size:9px;color:var(--text-dim);margin-top:10px;">Obtenido ${new Date(obtainedAt).toLocaleDateString("es-AR")}</div>` : ""}
          <div style="display:flex;gap:8px;margin-top:18px;">
            <button class="btn-outline" style="flex:1;" onclick="openMyMedalsPanel()">Volver</button>
            ${equipped
              ? `<button class="btn" style="flex:1;" onclick="handleUnequipProfileTitle()">Quitar</button>`
              : `<button class="btn" style="flex:1;" onclick="handleEquipProfileTitle('${itemId}')">Equipar</button>`}
          </div>
        </div>
      </div>
    </div>`;
}


async function getEquippedProfileMedals(userId) {
  if (!userId) return [];

  const [{ data, error }, { data: owned }, { data: storeMeta }, { data: claims }] = await Promise.all([
    sb.rpc("get_equipped_profile_badges", { p_user_id:userId }),
    sb.from("user_badges").select("badge_name,badge_icon,earned_at").eq("user_id", userId),
    sb.from("store_badges").select("id,badge_name,rarity,description,is_limited,stock_total"),
    sb.from("user_store_badge_claims").select("badge_id,serial_number").eq("user_id", userId)
  ]);

  if (error) {
    console.warn("No se pudieron cargar medallas equipadas:", error);
    return [];
  }

  const ownedByName = {};
  (owned || []).forEach(b => {
    ownedByName[String(b.badge_name || "").toLowerCase()] = b;
  });

  const storeByName = {};
  (storeMeta || []).forEach(b => {
    storeByName[String(b.badge_name || "").toLowerCase()] = b;
  });

  const claimByBadgeId = {};
  (claims || []).forEach(c => {
    claimByBadgeId[c.badge_id] = c;
  });

  return (data || [])
    .map(m => {
      const key = String(m.badge_name || "").toLowerCase();
      const ownedBadge = ownedByName[key] || {};
      const storeBadge = storeByName[key] || {};
      const launchBadge = getLiveScroll6LaunchBadgeMeta(m.badge_name) || {};
      const claim = claimByBadgeId[storeBadge.id] || {};

      return {
        ...m,
        badge_icon: m.badge_icon || ownedBadge.badge_icon || "🏅",
        earned_at: ownedBadge.earned_at || "",
        rarity: m.rarity || storeBadge.rarity || launchBadge.rarity || "",
        description: storeBadge.description || launchBadge.description || "",
        is_limited: !!storeBadge.is_limited || !!launchBadge.is_limited,
        stock_total: storeBadge.stock_total || null,
        serial_number: claim.serial_number || null
      };
    })
    .sort((a,b) => Number(a.slot_number) - Number(b.slot_number));
}


function getProfileMedalRarityClass(rarity) {
  const safe = ["comun","rara","epica","legendaria","exclusiva","mitica"].includes(rarity)
    ? rarity
    : "";
  return safe ? `ls-medal-rarity-${safe}` : "";
}

function getProfileMedalRarityLabel(rarity) {
  return ({
    comun:"Común",
    rara:"Rara",
    epica:"Épica",
    legendaria:"Legendaria",
    exclusiva:"Exclusiva",
    mitica:"Mítica"
  })[rarity] || "";
}

function getLiveScroll6LaunchBadgeMeta(name) {
  return String(name || "").trim().toLowerCase() === "fundador de la nueva era"
    ? {
        rarity:"mitica",
        description:"Recompensa única para quienes estuvieron presentes durante los primeros 7 días de LiveScroll 6.",
        is_limited:true
      }
    : null;
}

function renderEquippedMedalsInline(medals, ownProfile = false) {
  const safe = Array.isArray(medals) ? medals.slice(0,3) : [];
  const slots = [];

  for (let i = 1; i <= 3; i++) {
    const medal = safe.find(m => Number(m.slot_number) === i);

    if (medal) {
      slots.push(`
        <button type="button"
          class="ls-equipped-medal ${getProfileMedalRarityClass(medal.rarity)}${Number(medal.slot_number) === 1 ? " ls-medal-favorite" : ""}"
          title="${escapeHtml(medal.badge_name || "Medalla")}${getProfileMedalRarityLabel(medal.rarity) ? ` · ${getProfileMedalRarityLabel(medal.rarity)}` : ""}"
          onclick="event.stopPropagation(); openMedalDetail('${escapeHtml(medal.badge_name || "")}', '${escapeHtml(medal.badge_icon || "🏅")}', '${escapeHtml(medal.rarity || "")}', '${escapeHtml(medal.description || "")}', '${escapeHtml(medal.earned_at || "")}', '${escapeHtml(medal.serial_number || "")}', '${escapeHtml(medal.stock_total || "")}')">
          ${medal.badge_icon || "🏅"}
        </button>`);
    } else if (ownProfile) {
      slots.push(`<button type="button" class="ls-equipped-medal-slot" title="Espacio libre" onclick="openEquipMedalsPanel()">＋</button>`);
    }
  }

  return `
    <div class="ls-equipped-medals">
      ${slots.join("")}
      ${ownProfile ? `<button type="button" onclick="openEquipMedalsPanel()" style="background:none;border:0;color:var(--gold);font-family:inherit;font-size:10px;cursor:pointer;padding:5px 2px;">Editar</button>` : ""}
    </div>`;
}

function openMedalDetail(name, icon, rarity = "", description = "", earnedAt = "", serialNumber = "", stockTotal = "") {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked" style="z-index:240;" data-modal-locked="1">
      <div class="modal-box" style="max-width:350px;">
        <div class="modal-box-body" style="padding:26px;text-align:center;">
          <div class="ls-medal-detail-icon">${icon || "🏅"}</div>
          <h2 style="margin:0 0 6px;">${escapeHtml(name || "Medalla")}</h2>
          <div style="font-size:11px;color:var(--gold);font-family:'JetBrains Mono',monospace;">
            ${getProfileMedalRarityLabel(rarity) ? `MEDALLA ${getProfileMedalRarityLabel(rarity).toUpperCase()}` : "MEDALLA DE PERFIL"}
          </div>
          <p style="font-size:12px;color:var(--text-dim);line-height:1.5;margin:13px 0 0;">
            ${escapeHtml(description || "Esta medalla forma parte de la identidad pública de este perfil.")}
          </p>
          <div class="ls-medal-detail-meta">
            ${getProfileMedalRarityLabel(rarity) ? `<span class="ls-medal-detail-chip">${getProfileMedalRarityLabel(rarity)}</span>` : ""}
            ${earnedAt ? `<span class="ls-medal-detail-chip">Obtenida ${new Date(earnedAt).toLocaleDateString("es-AR")}</span>` : ""}
            ${serialNumber && stockTotal ? `<span class="ls-medal-detail-chip" style="color:var(--gold);border-color:rgba(250,204,21,.25);">LIMITED #${serialNumber}/${stockTotal}</span>` : ""}
          </div>
          <button class="btn" style="width:100%;margin-top:18px;" onclick="document.getElementById('globalModalWrap').innerHTML=''">Cerrar</button>
        </div>
      </div>
    </div>`;
}

async function openEquipMedalsPanel() {
  const badges = window.__myProfileBadges || [];
  const current = await getEquippedProfileMedals(currentUser.id);
  const selected = current.map(m => m.badge_name).filter(Boolean);

  window.__selectedProfileMedals = selected.slice(0,3);

  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked" style="z-index:230;" data-modal-locked="1">
      <div class="modal-box" style="max-width:450px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">
        <div class="modal-box-header">
          <div>
            <h2 style="margin:0;">🏅 Tu identidad</h2>
            <div style="font-size:10px;color:var(--text-dim);margin-top:4px;">Elegí hasta 3 medallas. La primera queda como tu favorita ★.</div>
          </div>
          <button onclick="document.getElementById('globalModalWrap').innerHTML=''" style="background:none;border:0;color:var(--text-dim);font-size:19px;cursor:pointer;">✕</button>
        </div>

        <div class="modal-box-body" style="overflow-y:auto;min-height:0;">
          <div id="medalSelectionCount" style="font-size:11px;color:var(--gold);margin-bottom:8px;">${window.__selectedProfileMedals.length}/3 seleccionadas</div>
          <div class="ls-favorite-note">★ La medalla que quede primera será tu favorita y tendrá un destaque especial en tu perfil.</div>

          ${badges.length ? `
            <div class="ls-medal-picker-grid">
              ${badges.map(b => `
                <div
                  class="ls-medal-picker-item ${window.__selectedProfileMedals.includes(b.badge_name) ? "selected" : ""}"
                  data-medal-name="${escapeHtml(b.badge_name)}"
                  onclick="toggleProfileMedalSelection(this, '${escapeHtml(b.badge_name)}')">
                  <div class="ls-medal-picker-icon">${b.badge_icon || "🏅"}</div>
                  <div class="ls-medal-picker-name">${escapeHtml(b.badge_name)}</div>
                  <div class="ls-medal-order-row" onclick="event.stopPropagation();">
                    <button type="button" class="ls-medal-order-btn" title="Mover antes"
                      onclick="moveSelectedProfileMedal('${escapeHtml(b.badge_name)}', -1)">←</button>
                    <span class="mono" style="font-size:9px;color:var(--text-dim);" id="medalOrder-${escapeHtml(b.badge_name)}"></span>
                    <button type="button" class="ls-medal-order-btn" title="Mover después"
                      onclick="moveSelectedProfileMedal('${escapeHtml(b.badge_name)}', 1)">→</button>
                  </div>
                </div>
              `).join("")}
            </div>` :
            `<div style="padding:24px 8px;text-align:center;color:var(--text-dim);font-size:12px;">Todavía no tenés medallas para equipar.</div>`
          }
        </div>

        <div class="modal-box-footer" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
          <button class="btn-outline" onclick="closeManagedModal()">Cancelar</button>
          <button class="btn-outline" onclick="clearProfileMedalSelection()">Quitar todas</button>
          <button class="btn" onclick="saveEquippedProfileMedals()">Guardar</button>
        </div>
      </div>
    </div>`;

  setTimeout(() => refreshProfileMedalOrderUI(), 0);
}


function refreshProfileMedalOrderUI() {
  const list = window.__selectedProfileMedals || [];

  document.querySelectorAll(".ls-medal-picker-item").forEach(el => {
    const name = el.dataset.medalName;
    const idx = list.indexOf(name);
    el.classList.toggle("selected", idx >= 0);

    const orderEl = el.querySelector("[id^='medalOrder-']");
    if (orderEl) {
      orderEl.textContent = idx >= 0 ? (idx === 0 ? "★ 1" : `${idx + 1}`) : "";
    }
  });

  const count = document.getElementById("medalSelectionCount");
  if (count) count.textContent = `${list.length}/3 seleccionadas`;
}

function moveSelectedProfileMedal(badgeName, direction) {
  const list = window.__selectedProfileMedals || [];
  const idx = list.indexOf(badgeName);

  if (idx < 0) {
    showToast("Primero seleccioná esa medalla");
    return;
  }

  const next = idx + Number(direction);
  if (next < 0 || next >= list.length) return;

  [list[idx], list[next]] = [list[next], list[idx]];
  window.__selectedProfileMedals = list;
  refreshProfileMedalOrderUI();
}

function toggleProfileMedalSelection(button, badgeName) {
  const list = window.__selectedProfileMedals || [];
  const idx = list.indexOf(badgeName);

  if (idx >= 0) {
    list.splice(idx,1);
    button?.classList.remove("selected");
  } else {
    if (list.length >= 3) {
      showToast("Podés mostrar hasta 3 medallas");
      return;
    }
    list.push(badgeName);
    button?.classList.add("selected");
  }

  window.__selectedProfileMedals = list;
  refreshProfileMedalOrderUI();
}

function clearProfileMedalSelection() {
  window.__selectedProfileMedals = [];
  refreshProfileMedalOrderUI();
}

async function saveEquippedProfileMedals() {
  const selected = (window.__selectedProfileMedals || []).slice(0,3);

  const { data, error } = await sb.rpc("set_equipped_profile_badges", {
    p_badge_names: selected
  });

  if (error || !data?.ok) {
    console.error(error || data);
    showToast("No se pudieron guardar las medallas");
    return;
  }

  document.getElementById("globalModalWrap").innerHTML = "";
  showToast("🏅 Identidad actualizada");
  renderProfile();
}

async function getMyCollectionSummary() {
  const [
    { data: unlockedEmojis },
    { data: unlockedItems },
    { data: titleItems }
  ] = await Promise.all([
    sb.from("user_unlocked_emojis").select("emoji").eq("user_id", currentUser.id),
    sb.from("user_unlocked_items").select("item_id").eq("user_id", currentUser.id),
    sb.from("store_items").select("id,category").eq("category", "title")
  ]);

  const titleIds = new Set((titleItems || []).map(t => t.id));
  const titleCount = (unlockedItems || []).filter(i => titleIds.has(i.item_id)).length;

  return {
    emojis: (unlockedEmojis || []).length,
    titles: titleCount
  };
}

function ensureIdentityExperience593Styles() {
  if (document.getElementById("lsIdentityExperience593Styles")) return;
  const style = document.createElement("style");
  style.id = "lsIdentityExperience593Styles";
  style.textContent = `
    html:not(.ls-legacy) .profile-hero {
      border:1px solid rgba(56,221,242,.18) !important;
      border-radius:24px !important;
      background:
        radial-gradient(circle at 88% 18%,rgba(56,221,242,.11),transparent 30%),
        radial-gradient(circle at 10% 82%,rgba(46,242,124,.09),transparent 34%),
        linear-gradient(150deg,rgba(13,32,40,.98),rgba(7,17,22,.97)) !important;
      box-shadow:0 24px 70px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.04) !important;
    }

    html:not(.ls-legacy) .profile-cover {
      height:142px;
      border-bottom:1px solid rgba(56,221,242,.13);
      background-color:#0b2730;
      background-image:
        radial-gradient(circle at 22% 30%,rgba(46,242,124,.18),transparent 28%),
        linear-gradient(120deg,#0d2932,#09202a 55%,#10333c);
    }

    html:not(.ls-legacy) .profile-cover::before {
      content:"";
      position:absolute;
      inset:0;
      background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);
      background-size:28px 28px;
      pointer-events:none;
    }

    html:not(.ls-legacy) .profile-cover-edit-btn {
      top:12px;
      right:12px;
      min-height:34px;
      padding:6px 11px;
      border-color:rgba(255,255,255,.16);
      background:rgba(4,13,17,.68);
      box-shadow:0 8px 20px rgba(0,0,0,.20);
      backdrop-filter:blur(8px);
    }

    html:not(.ls-legacy) .profile-avatar-ring {
      width:82px;
      height:82px;
      border:2px solid var(--gold-dim);
      background:linear-gradient(145deg,#102d36,#071116);
      box-shadow:0 0 0 5px rgba(7,17,22,.78),0 14px 34px rgba(0,0,0,.27),0 0 28px rgba(46,242,124,.08);
    }

    html:not(.ls-legacy) .profile-avatar-ring img {
      width:70px;
      height:70px;
    }

    html:not(.ls-legacy) .profile-name-block h1 {
      font-size:24px;
      font-weight:700;
      letter-spacing:-.045em;
      text-wrap:balance;
    }

    .profile-role-badge {
      display:inline-flex;
      align-items:center;
      width:max-content;
      margin-top:5px;
      padding:5px 9px;
      border:1px solid var(--border);
      border-radius:999px;
      font:800 9px 'JetBrains Mono',monospace !important;
      letter-spacing:.06em;
      text-transform:uppercase;
    }

    html:not(.ls-legacy) .profile-role-badge.user {
      color:#a9c1c7;
      border-color:rgba(154,179,186,.20);
      background:rgba(154,179,186,.06);
    }

    html:not(.ls-legacy) .profile-role-badge.creator {
      color:var(--gold);
      border-color:rgba(46,242,124,.25);
      background:linear-gradient(135deg,rgba(46,242,124,.10),rgba(56,221,242,.055));
      box-shadow:0 0 20px rgba(46,242,124,.06);
    }

    html:not(.ls-legacy) .profile-bio {
      max-width:680px;
      padding:11px 13px;
      border-left:2px solid rgba(56,221,242,.35);
      border-radius:0 11px 11px 0;
      background:rgba(4,14,18,.30);
      color:#b9cdd2;
    }

    .ls-profile-socials {
      display:flex;
      gap:8px;
      margin:0 0 16px;
      flex-wrap:wrap;
      position:relative;
      z-index:3;
    }

    .ls-profile-social-link {
      display:inline-flex;
      align-items:center;
      gap:6px;
      min-height:34px;
      padding:6px 10px;
      border:1px solid var(--border);
      border-radius:10px;
      background:var(--panel-2);
      color:var(--text);
      text-decoration:none;
      font-size:10px;
      font-weight:750;
      transition:transform .16s ease,border-color .16s ease,background .16s ease;
    }

    .ls-profile-social-logo {
      width:17px;
      height:17px;
      display:block;
      flex:0 0 17px;
      object-fit:contain;
    }

    html:not(.ls-legacy) .ls-profile-social-link {
      border-color:rgba(56,221,242,.15);
      background:rgba(7,24,30,.66);
      box-shadow:inset 0 1px 0 rgba(255,255,255,.025);
    }

    html:not(.ls-legacy) .ls-profile-social-link:hover {
      transform:translateY(-2px);
      border-color:rgba(46,242,124,.30);
      background:rgba(18,48,58,.78);
    }

    html:not(.ls-legacy) .profile-stats-row {
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:9px !important;
    }

    html:not(.ls-legacy) .stat-pill {
      min-width:0;
      padding:12px 10px;
      border:1px solid rgba(56,221,242,.14);
      border-radius:14px !important;
      background:linear-gradient(145deg,rgba(18,48,58,.58),rgba(7,21,27,.50));
      box-shadow:inset 0 1px 0 rgba(255,255,255,.025);
    }

    html:not(.ls-legacy) .stat-pill .num {
      font-size:20px;
      color:var(--gold);
      text-shadow:0 0 18px rgba(46,242,124,.12);
    }

    html:not(.ls-legacy) .profile-section-head .ico {
      border-color:rgba(56,221,242,.17);
      border-radius:11px;
      background:linear-gradient(145deg,rgba(46,242,124,.08),rgba(56,221,242,.07));
      box-shadow:inset 0 1px 0 rgba(255,255,255,.025);
    }

    html:not(.ls-legacy) .profile-section-head h3 {
      font-size:16px;
      letter-spacing:-.025em;
    }

    html:not(.ls-legacy) .video-grid-tile {
      border:1px solid rgba(56,221,242,.10);
      border-radius:10px;
      box-shadow:0 10px 24px rgba(0,0,0,.18);
      transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;
    }

    html:not(.ls-legacy) .video-grid-tile:hover {
      transform:translateY(-2px);
      border-color:rgba(46,242,124,.24);
      box-shadow:0 14px 30px rgba(0,0,0,.25);
    }

    .users-directory-tabs {
      display:grid !important;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:8px !important;
      margin-bottom:12px;
      padding:5px;
      border:1px solid var(--border);
      border-radius:15px;
      background:var(--panel);
    }

    html:not(.ls-legacy) .users-directory-tabs {
      border-color:rgba(56,221,242,.14);
      background:linear-gradient(145deg,rgba(13,32,40,.82),rgba(7,17,22,.76));
      box-shadow:inset 0 1px 0 rgba(255,255,255,.025);
    }

    .users-directory-tabs button {
      width:100%;
      min-width:0;
    }

    html:not(.ls-legacy) .user-directory-search {
      min-height:48px;
      margin-bottom:14px;
      padding-left:15px;
      border-color:rgba(56,221,242,.17);
      border-radius:14px;
      background:rgba(4,14,18,.68);
    }

    html:not(.ls-legacy) .user-directory-row {
      min-height:68px;
      margin-bottom:9px;
      padding:12px 14px;
      border-color:rgba(56,221,242,.12) !important;
      background:linear-gradient(145deg,rgba(13,32,40,.88),rgba(8,22,28,.84)) !important;
      transition:transform .17s ease,border-color .17s ease,background .17s ease;
    }

    html:not(.ls-legacy) .user-directory-row:hover {
      transform:translateX(3px);
      border-color:rgba(46,242,124,.24) !important;
      background:linear-gradient(145deg,rgba(15,39,47,.94),rgba(8,25,31,.90)) !important;
    }

    html:not(.ls-legacy) .user-directory-row .avatar-sm {
      width:44px;
      height:44px;
      border-color:rgba(56,221,242,.20);
      box-shadow:0 7px 18px rgba(0,0,0,.20);
    }

    .ls-directory-role {
      display:inline-flex;
      margin-top:4px;
      color:var(--text-dim);
      font:750 9px 'JetBrains Mono',monospace;
      letter-spacing:.05em;
      text-transform:uppercase;
    }

    .ls-directory-role.creator {
      color:var(--gold);
    }

    html.ls-legacy .profile-hero,
    html.ls-legacy .user-directory-row,
    html.ls-legacy .video-grid-tile {
      box-shadow:none !important;
      backdrop-filter:none !important;
    }

    @media(max-width:600px) {
      html:not(.ls-legacy) .profile-hero {
        border-radius:18px !important;
        padding-left:16px;
        padding-right:16px;
      }

      html:not(.ls-legacy) .profile-cover {
        height:122px;
        margin-left:-16px;
        margin-right:-16px;
      }

      html:not(.ls-legacy) .profile-avatar-ring {
        width:68px;
        height:68px;
      }

      html:not(.ls-legacy) .profile-avatar-ring img {
        width:58px;
        height:58px;
      }

      html:not(.ls-legacy) .profile-name-block h1 {
        font-size:20px;
        overflow-wrap:anywhere;
      }

      html:not(.ls-legacy) .profile-stats-row {
        gap:6px !important;
      }

      html:not(.ls-legacy) .stat-pill {
        padding:10px 5px;
      }

      html:not(.ls-legacy) .stat-pill .num {
        font-size:17px;
      }

      html:not(.ls-legacy) .stat-pill .lbl {
        font-size:8px;
      }
    }
  `;
  document.head.appendChild(style);
}

function renderLiveScroll7LivingProfile({ profile, videos = [], followersCount = 0, totalViews = 0, own = false }) {
  if (!isLiveScroll7App()) return "";
  const visualStyle = ["electric","cosmic","minimal"].includes(profile?.profile_visual_style) ? profile.profile_visual_style : "electric";
  const featured = videos.find(video => video.id === profile?.profile_featured_video_id) || videos[0] || null;
  const latestLabel = featured?.created_at ? lsTimeAgo(featured.created_at) : "Sin publicaciones";
  const statusLabel = profile?.is_live ? "EN DIRECTO" : (featured ? "NUEVA SEÑAL" : "PERFIL EN ESPERA");
  return `
    <section class="ls7-living-profile ls7-profile-style-${visualStyle}" aria-label="Perfil Vivo LiveScroll 7">
      <div class="ls7-living-head">
        <div><small>◈ PERFIL VIVO 7</small><h2>Ahora mismo</h2></div>
        <div class="ls7-living-head-actions">
          ${own ? `<button class="ls7-profile-customize-btn" onclick="openLiveScroll7ProfileCustomizer()">Personalizar</button>` : ""}
          <span class="${profile?.is_live ? "is-live" : ""}"><i></i>${statusLabel}</span>
        </div>
      </div>
      <div class="ls7-living-grid">
        ${featured ? `
          <button class="ls7-featured-video" onclick="openProfileVideoFeed(window.__profileFeedVideos, '${featured.id}', window.__profileFeedAuthor)" aria-label="Reproducir video destacado">
            <div class="ls7-featured-cover">${getGridCoverHtml(featured)}</div>
            <div class="ls7-featured-shade"></div>
            <div class="ls7-featured-copy">
              <small>VIDEO PROTAGONISTA</small>
              <strong>${escapeHtml(featured.title || "Última publicación")}</strong>
              <span>▶ Reproducir · ${escapeHtml(latestLabel)}</span>
            </div>
          </button>` : `
          <div class="ls7-featured-empty">
            <b>Tu señal empieza acá</b>
            <span>${own ? "Publicá tu primer video y convertí tu perfil en una experiencia." : "Este Usuario todavía no publicó su primera señal."}</span>
            ${own ? `<button class="btn" onclick="switchTab('upload')">Crear señal</button>` : ""}
          </div>`}
        <div class="ls7-live-data">
          <div><small>ENERGÍA DEL PERFIL</small><strong>${Math.min(100, 18 + videos.length * 9 + Math.min(28, followersCount * 2))}%</strong><i><b style="width:${Math.min(100, 18 + videos.length * 9 + Math.min(28, followersCount * 2))}%"></b></i></div>
          <div class="ls7-data-pair"><span><b>${videos.length}</b><small>Señales</small></span><span><b>${followersCount}</b><small>Conexiones</small></span></div>
          <div class="ls7-data-pair"><span><b>${totalViews}</b><small>Impactos</small></span><span><b>${profile?.is_creator ? "CREATOR" : "USER"}</b><small>Nivel</small></span></div>
          <p><i></i>${profile?.is_live ? "Transmitiendo ahora en LiveScroll." : featured ? `Último movimiento: ${escapeHtml(latestLabel)}.` : "Esperando la primera publicación."}</p>
        </div>
      </div>
    </section>`;
}

function openLiveScroll7ProfileCustomizer() {
  if (!isLiveScroll7App()) return;
  const videos = Array.isArray(window.__profileFeedVideos) ? window.__profileFeedVideos : [];
  const selectedVideo = currentProfile?.profile_featured_video_id || videos[0]?.id || "";
  const selectedStyle = ["electric","cosmic","minimal"].includes(currentProfile?.profile_visual_style) ? currentProfile.profile_visual_style : "electric";
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked ls7-profile-customizer-overlay" data-modal-locked="1">
      <div class="modal-box ls7-profile-customizer-box">
        <div class="modal-box-head"><div><small>PERFIL VIVO 7</small><h2>Tu perfil, tus reglas</h2></div><button onclick="closeLiveScroll7ProfileCustomizer()">✕</button></div>
        <div class="modal-box-body">
          <label class="ls7-customizer-label">Video protagonista</label>
          <select id="ls7FeaturedVideoSelect">
            ${videos.length ? videos.map(video => `<option value="${video.id}" ${video.id === selectedVideo ? "selected" : ""}>${escapeHtml(video.title || "Video sin título")}</option>`).join("") : `<option value="">Todavía no hay videos</option>`}
          </select>
          <label class="ls7-customizer-label">Estilo visual</label>
          <div class="ls7-style-picker" id="ls7StylePicker">
            ${[
              ["electric","⚡","Eléctrico","Cian, azul y energía viva"],
              ["cosmic","◉","Cósmico","Violeta profundo y estrellas"],
              ["minimal","◇","Minimal","Oscuro, limpio y elegante"]
            ].map(([value,icon,name,copy]) => `<button class="${value === selectedStyle ? "active" : ""}" data-style="${value}" onclick="selectLiveScroll7ProfileStyle('${value}')"><b>${icon}</b><span><strong>${name}</strong><small>${copy}</small></span></button>`).join("")}
          </div>
          <div class="ls7-style-preview ls7-profile-style-${selectedStyle}" id="ls7StylePreview"><i></i><div><small>VISTA PREVIA</small><strong>@${escapeHtml(currentProfile?.username || "usuario")}</strong><span>Así se sentirá tu Perfil Vivo.</span></div></div>
        </div>
        <div class="modal-box-actions"><button class="btn-outline" onclick="closeLiveScroll7ProfileCustomizer()">Cancelar</button><button class="btn" id="ls7SaveProfileStyle" onclick="saveLiveScroll7ProfileCustomization()">Guardar cambios</button></div>
      </div>
    </div>`;
}

function selectLiveScroll7ProfileStyle(style) {
  if (!["electric","cosmic","minimal"].includes(style)) return;
  document.querySelectorAll("#ls7StylePicker button").forEach(button => button.classList.toggle("active", button.dataset.style === style));
  const preview = document.getElementById("ls7StylePreview");
  if (preview) preview.className = `ls7-style-preview ls7-profile-style-${style}`;
}

function closeLiveScroll7ProfileCustomizer() {
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = "";
}

async function saveLiveScroll7ProfileCustomization() {
  const button = document.getElementById("ls7SaveProfileStyle");
  const featuredVideoId = document.getElementById("ls7FeaturedVideoSelect")?.value || null;
  const visualStyle = document.querySelector("#ls7StylePicker button.active")?.dataset.style || "electric";
  if (button) { button.disabled = true;button.textContent = "Guardando…"; }
  const { data, error } = await sb.rpc("set_my_ls7_profile_customization", {
    p_featured_video_id:featuredVideoId,
    p_visual_style:visualStyle
  });
  if (error) {
    if (button) { button.disabled = false;button.textContent = "Guardar cambios"; }
    showToast("No se pudo guardar. Ejecutá primero el SQL 7.0.3v.");
    return;
  }
  if (data?.ok === false) {
    if (button) { button.disabled = false;button.textContent = "Guardar cambios"; }
    showToast(data.error === "video_invalido" ? "Ese video no pertenece a tu perfil." : "No se pudo guardar el perfil.");
    return;
  }
  currentProfile.profile_featured_video_id = data?.profile_featured_video_id || featuredVideoId;
  currentProfile.profile_visual_style = ["electric","cosmic","minimal"].includes(data?.profile_visual_style)
    ? data.profile_visual_style
    : visualStyle;
  closeLiveScroll7ProfileCustomizer();
  showToast("Perfil Vivo actualizado");
  renderProfile();
}

const LS6_PROFILE_VIDEO_COLUMNS = "id,user_id,platform,title,video_url,thumbnail_url,created_at,client_origin";

async function renderProfile() {
  ensureIdentityExperience593Styles();
  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando tu perfil...</p>`;

  const videosPromise = lsCacheFresh(lsPerfCache.profileVideos, 30000)
    ? Promise.resolve({ data:lsPerfCache.profileVideos.data, error:null })
    : sb.from("videos").select(isLiveScroll7App() ? "*" : LS6_PROFILE_VIDEO_COLUMNS).eq("user_id", currentUser.id).order("created_at", { ascending:false });

  const viewsLedgerPromise = lsCacheFresh(lsPerfCache.profileViewsLedger, 30000)
    ? Promise.resolve({ data:lsPerfCache.profileViewsLedger.data, error:null })
    : sb.from("points_ledger").select("amount").eq("user_id", currentUser.id).eq("reason", "watched_by_other");

  const [videosResult, viewsLedgerResult] = await Promise.all([videosPromise, viewsLedgerPromise]);
  const videos = videosResult?.data || [];
  const error = videosResult?.error;

  if (!error && !lsCacheFresh(lsPerfCache.profileVideos, 30000)) {
    lsPerfCache.profileVideos = { data:videos, at:Date.now() };
  }

  if (error) { main.innerHTML = `<p class="error-msg">Error cargando tus videos: ${escapeHtml(error.message || "Error desconocido")}</p>`; return; }

  const watchedByOther = viewsLedgerResult?.data || [];
  if (!viewsLedgerResult?.error && !lsCacheFresh(lsPerfCache.profileViewsLedger, 30000)) {
    lsPerfCache.profileViewsLedger = { data:watchedByOther, at:Date.now() };
  }

  const totalFromViews = (watchedByOther || []).reduce((sum, r) => sum + r.amount, 0);

  const videoIds = videos.map(v => v.id);
  const [
    pinsResult,
    plans,
    followersResult,
    badgesResult,
    equippedBadges,
    equippedTitle,
    collectionSummary,
    sessionsResult,
    likesResult,
    referralResult
  ] = await Promise.all([
    sb.rpc("get_my_pinned_videos", { p_user_id:currentUser.id }),
    loadPlans(),
    sb.from("follows").select("follower_id", { count:"exact", head:true }).eq("followed_id", currentUser.id),
    sb.from("user_badges").select("*").eq("user_id", currentUser.id).order("earned_at", { ascending:false }),
    getEquippedProfileMedals(currentUser.id),
    getMyProfileTitle(),
    getMyCollectionSummary(),
    videoIds.length ? sb.from("watch_sessions").select("video_id, viewer_id").in("video_id", videoIds) : Promise.resolve({ data:[] }),
    videoIds.length ? sb.from("video_likes").select("video_id").in("video_id", videoIds) : Promise.resolve({ data:[] }),
    sb.from("app_config").select("key, value").in("key", ["referral_referrer_pts", "referral_referred_pts"])
  ]);

  const myPins = pinsResult?.data || [];
  const pinnedIds = new Set((myPins || []).map(p => p.video_id));
  const myPlan = plans.find(p => p.id === currentProfile.plan_id);
  const canPin = myPlan && myPlan.max_pinned_videos > 0;
  const pinsUsed = pinnedIds.size;
  const followersCount = followersResult?.count || 0;
  const badges = badgesResult?.data || [];
  const sessions = sessionsResult?.data || [];
  const likes = likesResult?.data || [];
  const referralConfig = referralResult?.data || [];
  window.__myProfileTitle = equippedTitle;

  let socialClicksHtml = "";
  if (myPlan && myPlan.id !== "standard") {
    const { data: clicks } = await sb.rpc("get_my_social_clicks", { p_user_id: currentUser.id });
    if (clicks && clicks.length) {
      socialClicksHtml = `
        <div class="profile-section">
          <div class="profile-section-head">
            <div class="ico">📊</div>
            <h3>Clics a tus redes</h3>
            <div class="sub">Beneficio ${escapeHtml(myPlan.name)}</div>
          </div>
          <div class="form-card">
            <div style="display:flex; gap:16px; flex-wrap:wrap;">
              ${clicks.map(c => `<div style="text-align:center;"><div class="mono" style="font-size:20px; color:var(--gold);">${c.total}</div><div style="font-size:11px; color:var(--text-dim);">${escapeHtml(c.platform)}</div></div>`).join("")}
            </div>
          </div>
        </div>`;
    }
  }

  const viewsByVideo = {};
  (sessions || []).forEach(s => {
    viewsByVideo[s.video_id] = viewsByVideo[s.video_id] || new Set();
    viewsByVideo[s.video_id].add(s.viewer_id);
  });
  const likesByVideo = {};
  (likes || []).forEach(l => { likesByVideo[l.video_id] = (likesByVideo[l.video_id] || 0) + 1; });

  const referrerPts = referralConfig?.find(c => c.key === "referral_referrer_pts")?.value || 150;
  const referredPts = referralConfig?.find(c => c.key === "referral_referred_pts")?.value || 100;

  const streakSectionHtml = "";


  const collectionSummaryHtml = `
    <div class="profile-section">
      <div class="profile-section-head">
        <div class="ico">💎</div>
        <h3>Mi colección</h3>
        <div class="sub">
          <button
            onclick="openMyMedalsPanel('all')"
            style="background:none;border:none;color:var(--gold);cursor:pointer;font-family:inherit;font-size:12px;"
          >Explorar →</button>
        </div>
      </div>

      <div
        class="form-card ls-profile-collection-hub"
        style="
          border:1px solid var(--border);
          border-radius:16px;
          overflow:hidden;
          padding:0;
        "
      >
        <div style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          padding:14px;
          border-bottom:1px solid var(--border);
          background:linear-gradient(135deg,rgba(250,204,21,.055),rgba(255,255,255,.012));
          flex-wrap:wrap;
        ">
          <div>
            <div style="font-size:10px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.08em;">
              En tu perfil
            </div>
            <div style="font-size:13px;font-weight:800;margin-top:3px;">
              Tus 3 medallas destacadas
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:8px;">
            ${renderEquippedMedalsInline(equippedBadges, true)}
            <button
              class="btn-outline"
              onclick="openEquipMedalsPanel()"
              style="padding:7px 10px;font-size:10px;white-space:nowrap;"
            >Editar</button>
          </div>
        </div>

        <button
          type="button"
          onclick="openMyMedalsPanel('all')"
          style="
            width:100%;
            border:0;
            background:transparent;
            color:var(--text);
            cursor:pointer;
            display:grid;
            grid-template-columns:repeat(4,1fr);
            gap:0;
            padding:10px;
          "
        >
          <div style="text-align:center;padding:10px 5px;">
            <div style="font-size:20px;margin-bottom:4px;">💎</div>
            <div class="mono" style="font-size:19px;font-weight:900;color:var(--gold);">
              ${(badges || []).length + (collectionSummary.emojis || 0) + (collectionSummary.titles || 0)}
            </div>
            <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;">Objetos</div>
          </div>

          <div style="text-align:center;padding:10px 5px;border-left:1px solid var(--border);">
            <div style="font-size:20px;margin-bottom:4px;">🏅</div>
            <div class="mono" style="font-size:19px;font-weight:900;">${(badges || []).length}</div>
            <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;">Medallas</div>
          </div>

          <div style="text-align:center;padding:10px 5px;border-left:1px solid var(--border);">
            <div style="font-size:20px;margin-bottom:4px;">😎</div>
            <div class="mono" style="font-size:19px;font-weight:900;">${collectionSummary.emojis || 0}</div>
            <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;">Emojis</div>
          </div>

          <div style="text-align:center;padding:10px 5px;border-left:1px solid var(--border);">
            <div style="font-size:20px;margin-bottom:4px;">🏷️</div>
            <div class="mono" style="font-size:19px;font-weight:900;">${collectionSummary.titles || 0}</div>
            <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;">Títulos</div>
          </div>
        </button>

        <div style="
          display:grid;
          grid-template-columns:repeat(3,1fr);
          border-top:1px solid var(--border);
        ">
          <button
            onclick="openMyMedalsPanel('badge')"
            style="padding:10px;border:0;border-right:1px solid var(--border);background:transparent;color:var(--text);cursor:pointer;font-family:inherit;font-size:10px;"
          >🏅 Medallas</button>
          <button
            onclick="openMyMedalsPanel('emoji')"
            style="padding:10px;border:0;border-right:1px solid var(--border);background:transparent;color:var(--text);cursor:pointer;font-family:inherit;font-size:10px;"
          >😎 Emojis</button>
          <button
            onclick="openMyMedalsPanel('title')"
            style="padding:10px;border:0;background:transparent;color:var(--text);cursor:pointer;font-family:inherit;font-size:10px;"
          >🏷️ Títulos</button>
        </div>
      </div>
    </div>`;

  const recentActivity = lsBuildRecentActivity(videos, badges || []);
  const latestVideo = videos?.[0] || null;
  const hasFreshActivity = !!(
    (latestVideo && lsIsWithinHours(latestVideo.created_at, 24)) ||
    currentProfile.is_live
  );

  const recentActivityHtml = recentActivity.length ? `
    <div class="profile-section">
      <div class="profile-section-head">
        <div class="ico">⚡</div>
        <h3>Actividad reciente</h3>
        <div class="sub">Lo último en tu perfil</div>
      </div>
      <div class="form-card ls-recent-activity">
        ${recentActivity.map(a => `
          <div class="ls-activity-item">
            <div class="ls-activity-icon">${a.icon}</div>
            <div class="ls-activity-copy">
              <div class="ls-activity-title">${escapeHtml(a.title)}</div>
              <div class="ls-activity-time">${lsTimeAgo(a.date)}</div>
            </div>
          </div>`).join("")}
      </div>
    </div>` : "";

  window.__myProfileBadges = badges || [];

  const referralSectionHtml = `
    <div class="profile-section">
      <div class="profile-section-head">
        <div class="ico">🎁</div>
        <h3>Invitá y ganá</h3>
        <div class="sub">+${referrerPts} pts por invitado</div>
      </div>
      <div class="form-card">
        <p style="font-size:13px; color:var(--text-dim); margin-top:0; margin-bottom:12px;">
          Compartí tu link. Cuando la persona invitada suba o mire algo por primera vez, ganás ${referrerPts} pts y ella gana ${referredPts} pts.
          Tope: 3 invitaciones premiadas por mes.
        </p>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <input readonly id="referralLinkInput" value="${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(currentProfile.username)}"
            style="flex:1; min-width:200px; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:'JetBrains Mono', monospace; font-size:12px;">
          <button class="btn" onclick="copyReferralLink()">Copiar link</button>
        </div>
      </div>
    </div>`;

  window.__profileFeedVideos = videos;
  window.__profileFeedAuthor = { username: currentProfile.username, plan_id: currentProfile.plan_id };
  window.__profilePinContext = {
    canPin,
    pinsUsed,
    maxPinned: myPlan?.max_pinned_videos || 0,
    pinnedIds: Array.from(pinnedIds)
  };

  const videosSectionHtml = `
    <div class="profile-section">
      <div class="profile-section-head">
        <div class="ico">🎬</div>
        <h3>Mis videos</h3>
        <div class="sub">${videos.length} en total${canPin ? ` · 📌 ${pinsUsed}/${myPlan.max_pinned_videos} anclados` : ""}</div>
      </div>
      ${videos.length ? `
        <div class="video-grid">
          ${videos.map(v => `
            <div class="video-grid-tile" id="tile-${v.id}">
              ${getGridCoverHtml(v)}
              ${lsIsWithinHours(v.created_at, 24) ? `<div class="ls-new-video-badge">🔥 NUEVO</div>` : ""}
              ${pinnedIds.has(v.id) ? `<div class="pinned-badge">📌</div>` : ""}
              <button class="grid-menu-btn" aria-label="Opciones del video" title="Opciones" onclick="event.stopPropagation(); toggleVideoTileMenu('${v.id}')">⋮</button>
              <div class="grid-overlay" onclick="openProfileVideoFeed(window.__profileFeedVideos, '${v.id}', window.__profileFeedAuthor)">
                <div class="grid-stats">
                  <span>👁 ${(viewsByVideo[v.id]?.size || 0)}</span>
                  <span>❤️ ${likesByVideo[v.id] || 0}</span>
                </div>
              </div>
              <div class="video-grid-menu hidden" id="menu-${v.id}">
                <div style="padding:6px 10px 4px; font-size:11px; color:var(--text-dim); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(v.title)}</div>
                ${canPin ? (pinnedIds.has(v.id)
                    ? `<div style="padding:8px 10px; font-size:12px; color:var(--green);">📌 Anclado en "Para Ti"</div>`
                    : `<button ${pinsUsed >= myPlan.max_pinned_videos ? "disabled" : ""} onclick="handlePinVideo('${v.id}')">📌 Anclar 24hs</button>`) : ""}
                ${v.platform === "upload" ? `<button onclick="openVideoReeditor('${v.id}')">✂️ Reeditar video</button>` : ""}
                ${isSafeUrl(v.video_url) ? `<button onclick="window.open('${escapeHtml(v.video_url)}', '_blank', 'noopener,noreferrer')">🔗 Abrir link</button>` : ""}
                <button class="danger" onclick="handleDeleteOwnVideo('${v.id}')">🗑 Eliminar</button>
              </div>
            </div>
          `).join("")}
        </div>
      ` : `<p style="color:var(--text-dim)">Todavía no subiste ningún video. <button onclick="switchTab('upload')" style="background:none;border:none;color:var(--gold);cursor:pointer;font-family:inherit;">Subí el primero →</button></p>`}
      </div>
    </div>`;

  const livingProfileHtml = renderLiveScroll7LivingProfile({
    profile:currentProfile,
    videos,
    followersCount,
    totalViews:totalFromViews,
    own:true
  });

  main.innerHTML = `
    <div class="profile-hero ls-profile-nova${isLiveScroll7App() ? " ls7-electric-profile" : ""}" id="lsProfileNovaHero" style="position:relative; overflow:hidden;">
      <div class="profile-cover${currentProfile.cover_url ? " has-image" : ""}" id="profileCoverBanner"
        style="position:relative; z-index:4; ${currentProfile.cover_url ? `background-image:url('${escapeHtml(currentProfile.cover_url)}'); background-position:center ${Number(currentProfile.cover_position_y ?? 50)}%;` : ""}">
        <button class="profile-cover-edit-btn" onclick="openEditProfile()">🖼️ Editar portada</button>
      </div>

      ${currentProfile.profile_side_image_url ? `
        <div aria-hidden="true" style="
          position:absolute;
          left:0;
          right:0;
          top:150px;
          bottom:0;
          z-index:1;
          overflow:hidden;
          pointer-events:none;
        ">
          <img
            src="${escapeHtml(currentProfile.profile_side_image_url)}"
            alt=""
            style="
              position:absolute;
              inset:0;
              width:100%;
              height:100%;
              object-fit:cover;
              object-position:center center;
              opacity:0.42;
              filter:saturate(0.95) contrast(1.06);
            "
          >
          <div style="
            position:absolute;
            inset:0;
            background:
              linear-gradient(180deg,
                rgba(13,16,20,0.16) 0%,
                rgba(13,16,20,0.28) 48%,
                rgba(13,16,20,0.72) 100%),
              linear-gradient(90deg,
                rgba(13,16,20,0.40) 0%,
                rgba(13,16,20,0.18) 50%,
                rgba(13,16,20,0.30) 100%);
          "></div>
        </div>
      ` : ""}

      <div class="ls-profile-nova-inner" id="lsProfileNovaInner" style="position:relative; z-index:2;">
        <div class="profile-hero-top">
          <div class="profile-avatar-ring ${getAvatarRingClass(currentProfile.plan_id)}${currentProfile.is_live ? " avatar-live-ring" : ""}${hasFreshActivity ? " ls-activity-aura" : ""}" title="${hasFreshActivity ? "Actividad reciente" : ""}">${renderAvatarHtml(currentProfile, 60)}</div>
          <div class="profile-name-block">
            <h1>@${escapeHtml(currentProfile.username)} ${getPlanBadgeHtml(currentProfile.plan_id)}</h1>
            <div class="handle profile-role-badge ${currentProfile.is_creator ? "creator" : "user"}">${currentProfile.is_creator ? "🎬 Creador" : "👤 Usuario"}</div>
            ${renderProfileTitleInline(equippedTitle, true)}
            ${renderEquippedMedalsInline(equippedBadges, true)}
          </div>
        </div>
        ${currentProfile.bio ? `<p class="profile-bio">${escapeHtml(currentProfile.bio)}</p>` : ""}
        ${renderSocialIcons(currentProfile)}
        <div class="profile-stats-row">
          <div class="stat-pill"><div class="num">${videos.length}</div><div class="lbl">Videos</div></div>
          <div class="stat-pill"><div class="num">${totalFromViews}</div><div class="lbl">Pts. por vistas</div></div>
          <div class="stat-pill"><div class="num">${followersCount || 0}</div><div class="lbl">Seguidores</div></div>
        </div>
        <div class="profile-hero-actions">
          <button class="btn-outline" onclick="openEditProfile()">✏️ Editar perfil</button>
        </div>
      </div>
    </div>

    ${renderGenerationIdentityCard(videos, true)}
    ${livingProfileHtml}

    ${collectionSummaryHtml}
    ${recentActivityHtml}
    ${socialClicksHtml}
    ${streakSectionHtml}
    ${referralSectionHtml}
    ${videosSectionHtml}`;

  initProfileNovaTilt();
  initLazyProfilePreviews();
}

async function handleLike(videoId) {
  const btn = document.getElementById(`like-${videoId}`);
  if (!btn) return;
  if (btn.classList.contains("liked")) return;

  const { data, error } = await sb.rpc("give_like", { p_video_id: videoId, p_user_id: currentUser.id });
  if (error || !data.ok) {
    if (data?.error === "tope_diario") showToast("Alcanzaste tu tope diario de likes");
    if (data?.error === "no_self_like") showToast("No podés darle like a tu propio video");
    return;
  }

  btn.classList.add("liked");
  btn.dataset.label = "Te gusta";
  btn.title = "Te gusta";
  btn.setAttribute("aria-label", "Te gusta");
  btn.setAttribute("aria-pressed", "true");
  const icon = btn.querySelector("span");
  const label = btn.querySelector("i");
  if (icon) icon.textContent = "♥";
  if (label) label.textContent = "TU LIKE";
  safePulseElement(btn, "ls-like-pop-safe");
  currentProfile.points_balance += data.points;
  updateBalanceUI();
  showFloatingPointsSafe(data.points, btn);
  showToast(`+${data.points} pt por el like`);
  recordDailyChallengeEvent("like_video", videoId);
}

async function handleShare(videoId, url) {
  const shareUrl = `${window.location.origin}${window.location.pathname}?video=${videoId}`;
  let shared = false;
  if (navigator.share) {
    try {
      const { data:video } = await sb.from("videos")
        .select("title,thumbnail_url,profiles!videos_user_id_fkey(username)")
        .eq("id",videoId).maybeSingle();
      const title = video?.title || "Mirá este video en LiveScroll";
      const creator = video?.profiles?.username ? ` de @${video.profiles.username}` : "";
      const shareData = { title, text:`Mirá “${title}”${creator} en LiveScroll`, url:shareUrl };

      if (video?.thumbnail_url && isSafeUrl(video.thumbnail_url) && window.File && navigator.canShare) {
        try {
          const response = await fetch(video.thumbnail_url, { cache:"no-store" });
          if (response.ok) {
            const blob = await response.blob();
            const extension = blob.type.includes("png") ? "png" : "jpg";
            const cover = new File([blob], `livescroll-portada-${videoId}.${extension}`, { type:blob.type || "image/jpeg" });
            if (navigator.canShare({ files:[cover] })) shareData.files = [cover];
          }
        } catch (_) {}
      }

      try {
        await navigator.share(shareData);
      } catch (shareError) {
        if (shareError?.name === "AbortError" || !shareData.files) throw shareError;
        delete shareData.files;
        await navigator.share(shareData);
      }
      shared = true;
    } catch (e) {
      if (e?.name !== "AbortError") showToast("No pudimos abrir el menú para compartir.", "error");
    }
  } else {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Link copiado para compartir");
      shared = true;
    } catch (e) { /* nada */ }
  }

  if (!shared) return;
  const { data, error } = await sb.rpc("give_share", { p_video_id: videoId, p_user_id: currentUser.id });
  if (error || !data.ok) return; // ya compartido antes, o tope diario: no molestamos con error
  currentProfile.points_balance += data.points;
  updateBalanceUI();
  showFloatingPointsSafe(data.points);
  showToast(`+${data.points} pts por compartir`);
}

async function openComments(videoId, focusCommentId = null) {
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="ls-comments-overlay-611" onclick="if(event.target===this) closeComments()">
      <div class="ls-comments-panel-611">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-shrink:0;">
          <h3 style="margin:0;">💬 Comentarios</h3>
          <button onclick="closeComments()" style="background:none;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;">✕</button>
        </div>
        <div id="commentsList" style="overflow-y:auto; -webkit-overflow-scrolling:touch; flex:1 1 auto; min-height:0; margin-bottom:14px;">Cargando...</div>
        <div class="ls-comment-compose-611">
          <input id="newCommentInput" placeholder="Escribí un comentario..." maxlength="500" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submitComment('${videoId}');}">
          <button class="btn" onclick="submitComment('${videoId}')">Enviar ➜</button>
        </div>
      </div>
    </div>`;

  await loadComments(videoId, focusCommentId);
}

async function loadComments(videoId, focusCommentId = null) {
  const { data: comments } = await sb
    .from("video_comments")
    .select("*, profiles!video_comments_user_id_fkey(username, plan_id)")
    .eq("video_id", videoId)
    .order("created_at", { ascending: false });

  const list = document.getElementById("commentsList");
  if (!list) return;

  list.innerHTML = comments && comments.length
    ? comments.map(c => `
        <div id="comment-${c.id}" style="margin-bottom:10px; padding:10px; font-size:13px; border-radius:10px; transition:background 0.3s ease, border-color 0.3s ease; ${focusCommentId === c.id ? "background:rgba(255,255,255,0.05); border:1px solid var(--gold-dim);" : "border:1px solid transparent;"}">
          <div>
            <strong style="color:var(--gold); cursor:pointer;" onclick="closeComments(); viewPublicProfile('${escapeHtml(c.profiles?.username || "")}')">@${escapeHtml(c.profiles?.username || "usuario")}</strong>
            ${getPlanBadgeHtml(c.profiles?.plan_id)}
            ${renderClientOriginBadge(c.client_origin, true)}
            <span style="color:var(--text-dim); font-size:11px;"> · ${new Date(c.created_at).toLocaleDateString("es-AR")}</span>
          </div>
          <div style="margin-top:4px; line-height:1.4;">${escapeHtml(c.content)}</div>
        </div>`).join("")
    : `<p style="color:var(--text-dim); font-size:13px;">Sé el primero en comentar.</p>`;

  if (focusCommentId) {
    setTimeout(() => {
      const commentEl = document.getElementById(`comment-${focusCommentId}`);
      if (!commentEl) return;
      commentEl.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        commentEl.style.background = "";
        commentEl.style.borderColor = "transparent";
      }, 2500);
    }, 150);
  }
}

async function submitComment(videoId) {
  const input = document.getElementById("newCommentInput");
  const content = input.value.trim();
  if (content.length < 3) { showToast("Escribí al menos 3 caracteres"); return; }

  const { data, error } = await sb.rpc("add_comment", { p_video_id: videoId, p_user_id: currentUser.id, p_content: content });
  if (error || !data.ok) { showToast("No se pudo comentar"); return; }

  const { error: originError } = await sb.rpc("mark_latest_comment_origin", {
    p_video_id: videoId,
    p_origin: getLiveScrollClientOrigin()
  });
  if (originError) console.warn("No se pudo registrar el origen del comentario:", originError.message);

  input.value = "";
  await loadComments(videoId);
  await loadProfile(); // por si sumó puntos por primer comentario
  updateBalanceUI();
}

function closeComments() {
  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";
}

function renderAvatarHtml(profile, size) {
  size = size || 32;
  if (profile.avatar_url) {
    return `<img src="${escapeHtml(profile.avatar_url)}" alt="avatar" loading="lazy" decoding="async" style="width:${size}px; height:${size}px; border-radius:50%; object-fit:cover; vertical-align:middle;">`;
  }
  return `<span style="font-size:${Math.round(size * 0.85)}px; vertical-align:middle;">${profile.avatar_emoji || "🎬"}</span>`;
}

function getPlanBadgeHtml(planId) {
  if (planId === "plus") return `<span style="color:var(--gold); font-size:11px;">⭐ Plus</span>`;
  if (planId === "diamante") return `<span style="color:#7dd3fc; font-size:11px;">💎 Diamante</span>`;
  return "";
}

function getAvatarRingClass(planId) {
  if (planId === "plus") return "plan-plus";
  if (planId === "diamante") return "plan-diamante";
  return "";
}

function getSocialBrandIconUrl(brand, color) {
  const safeBrand = ["kick","twitch","youtube","tiktok","instagram"].includes(brand) ? brand : "youtube";
  // 6.2.2: LiveScroll 6 lleva los SVG dentro de la aplicación para que los
  // logos sigan visibles con conexión inestable. LS7 conserva su entrega actual.
  return isLiveScroll7App()
    ? `https://cdn.simpleicons.org/${safeBrand}/${color}`
    : `brand-${safeBrand}.svg?v=6.2.2`;
}

function renderSocialIcons(profile) {
  const ownConnectedUrls = profile?.id === currentUser?.id ? {
    social_kick:lsGetConnectedStreamProfileUrl("kick"),
    social_twitch:lsGetConnectedStreamProfileUrl("twitch")
  } : {};
  const socials = [
    { key: "social_kick", brand: "kick", color: "53FC18", label: "Kick" },
    { key: "social_twitch", brand: "twitch", color: "9146FF", label: "Twitch" },
    { key: "social_youtube", brand: "youtube", color: "FF0000", label: "YouTube" },
    { key: "social_tiktok", brand: "tiktok", color: "FFFFFF", label: "TikTok" },
    { key: "social_instagram", brand: "instagram", color: "E4405F", label: "Instagram" }
  ];
  const active = socials.map(s => {
    const rawUrl = ownConnectedUrls[s.key] || profile[s.key] || "";
    const kickChannel = s.key === "social_kick" ? getKickChannelFromUrl(rawUrl) : "";
    const twitchChannel = s.key === "social_twitch" ? getTwitchChannelFromUrl(rawUrl) : "";
    const url = kickChannel
      ? `https://kick.com/${encodeURIComponent(kickChannel)}`
      : twitchChannel
        ? `https://www.twitch.tv/${encodeURIComponent(twitchChannel)}`
        : rawUrl;
    return { ...s, url };
  }).filter(s => {
    if (s.key === "social_kick") return !!getKickChannelFromUrl(s.url);
    if (s.key === "social_twitch") return !!getTwitchChannelFromUrl(s.url);
    return isSafeUrl(s.url);
  });
  if (!active.length) return "";
  return `<div class="ls-profile-socials">
    ${active.map(s => `<a class="ls-profile-social-link" href="${escapeHtml(s.url)}" target="_blank" rel="noopener" title="${s.label}" onclick="logSocialClick('${profile.id}', '${s.label}')"><img class="ls-profile-social-logo" src="${getSocialBrandIconUrl(s.brand,s.color)}" alt="" loading="lazy" decoding="async"><span>${s.label}</span></a>`).join("")}
  </div>`;
}

function logSocialClick(ownerId, platform) {
  if (!ownerId || ownerId === currentUser?.id) return; // no contamos clics a tus propias redes
  sb.rpc("log_social_click", { p_owner_id: ownerId, p_platform: platform }).catch(() => {});
}

// ============================================================
// PARA TI — videos destacados/anclados por Plus y Diamante
// ============================================================
async function renderForYou(renderToken = lsTabRenderToken) {
  const main = document.getElementById("appView");
  main.innerHTML = `<div id="foryouList">Cargando destacados...</div>`;

  const { data: featured, error } = await sb.rpc("get_featured_videos");
  if (renderToken !== lsTabRenderToken || currentTab !== "foryou") return;
  const list = document.getElementById("foryouList");

  if (error) { list.textContent = "Error cargando destacados: " + error.message; return; }
  if (!featured || !featured.length) {
    list.innerHTML = `<div style="padding:40px 0; text-align:center;">
      <h1 class="page-title">✨ Para Ti</h1>
      <p style="color:var(--text-dim)">Todavía no hay videos destacados. Los usuarios Plus y Diamante pueden anclar los suyos acá desde Mi Perfil.</p>
    </div>`;
    return;
  }

  const videos = featured.map(f => ({
    id: f.video_id, title: f.title, video_url: f.video_url, platform: f.platform,
    user_id: f.owner_id, profiles: { username: f.username, plan_id: f.plan_id }
  }));

  const { data: myLikes } = await sb.from("video_likes").select("video_id").eq("user_id", currentUser.id).in("video_id", videos.map(v => v.id));
  if (renderToken !== lsTabRenderToken || currentTab !== "foryou") return;
  const likedSet = new Set((myLikes || []).map(l => l.video_id));

  list.innerHTML = `
    <div class="feed-vertical" id="feedVertical">
      ${videos.map((v, i) => `
        <div class="feed-item${v.platform === "upload" ? " ls-upload-feed-item" : ""}" data-video-id="${v.id}">
          <div class="feed-phone">
            <div style="position:absolute; top:14px; left:14px; background:rgba(0,0,0,0.6); color:var(--gold); font-size:11px; padding:4px 10px; border-radius:20px; z-index:6;">📌 Destacado</div>
            <div class="feed-embed-frame" id="embed-${v.id}">${getEmbedPlaceholderHtml(v)}</div>
            <div class="feed-actions">
              <button class="feed-action-btn ls-like-action-611 ${likedSet.has(v.id) ? "liked" : ""}" id="like-${v.id}" data-label="${likedSet.has(v.id) ? "Te gusta" : "Me gusta"}" aria-label="${likedSet.has(v.id) ? "Te gusta" : "Me gusta"}" aria-pressed="${likedSet.has(v.id)}" title="${likedSet.has(v.id) ? "Te gusta" : "Me gusta"}" onclick="handleLike('${v.id}')"><span>${likedSet.has(v.id) ? "♥" : "♡"}</span><i>${likedSet.has(v.id) ? "TU LIKE" : "LIKE"}</i></button>
              <button class="feed-action-btn ls-comment-action-611" data-label="Comentar" aria-label="Abrir comentarios" title="Comentarios" onclick="openComments('${v.id}')"><span>💬</span><i>COMENTAR</i></button>
              ${renderRuntimeShareButton(v)}
            </div>
            <div class="feed-overlay">
              <div>
                <div class="title">${escapeHtml(v.title)}</div>
                <div class="author" style="cursor:pointer;" onclick="viewPublicProfile('${escapeHtml(v.profiles.username)}')"><span>@${escapeHtml(v.profiles.username)}</span> ${getPlanBadgeHtml(v.profiles.plan_id)} ${renderClientOriginBadge(v.client_origin)} <span class="feed-platform-chip">${escapeHtml(v.platform)}</span></div>
              </div>
              <div class="live-pts" id="pts-${v.id}"><span class="mono" id="secs-${v.id}">0s</span></div>
            </div>
            ${i === 0 ? `<div class="feed-nudge">Deslizá hacia arriba para el siguiente ↑</div>` : ""}
          </div>
        </div>
      `).join("")}
    </div>`;

  setupFeedObserver(videos);
  fitMobileFeedViewport("feedVertical");
  setupDoubleTapLike();
  setupPullToRefresh(renderForYou);
  setupSwipeNavigation("foryou", { right: "feed" });
}


let previousTabBeforeProfile = "feed";

// ============================================================
// DIRECTORIO DE USUARIOS
// ============================================================
let usersDirectorySearchTimeout = null;
let usersDirectoryRequestToken = 0;

// ============================================================
// DIRECTOS (usuarios en vivo ahora)
// ============================================================
let lsConnectedLiveRefreshTimer = null;

function stopConnectedLiveRefresh() {
  if (lsConnectedLiveRefreshTimer) {
    clearInterval(lsConnectedLiveRefreshTimer);
    lsConnectedLiveRefreshTimer = null;
  }
}

function startConnectedLiveRefresh() {
  stopConnectedLiveRefresh();
  lsConnectedLiveRefreshTimer = setInterval(() => {
    if (document.hidden || currentTab !== "directos") return;
    lsPerfCache.directos = { data:null, at:0 };
    renderDirectos(lsTabRenderToken);
  }, 20000);
}

function getTwitchChannelFromUrl(value) {
  try {
    const parsed = new URL(String(value || "").trim());
    if (!/(^|\.)twitch\.tv$/i.test(parsed.hostname)) return "";
    const channel = parsed.pathname.split("/").filter(Boolean)[0] || "";
    return /^[a-z0-9_]{3,25}$/i.test(channel) ? channel.toLowerCase() : "";
  } catch (_) {
    return "";
  }
}

function getKickChannelFromUrl(value) {
  try {
    const parsed = new URL(String(value || "").trim());
    if (!/(^|\.)kick\.com$/i.test(parsed.hostname)) return "";
    const channel = parsed.pathname.split("/").filter(Boolean)[0] || "";
    return /^[a-z0-9_.-]{2,50}$/i.test(channel) ? channel.toLowerCase() : "";
  } catch (_) {
    return "";
  }
}

function getYouTubeChannelUrl(value) {
  try {
    const parsed = new URL(String(value || "").trim());
    if (!/(^|\.)youtube\.com$/i.test(parsed.hostname) && !/(^|\.)youtu\.be$/i.test(parsed.hostname)) return "";
    return parsed.href;
  } catch (_) { return ""; }
}

function getTikTokProfileUrl(value) {
  try {
    const parsed = new URL(String(value || "").trim());
    if (!/(^|\.)tiktok\.com$/i.test(parsed.hostname)) return "";
    return parsed.href;
  } catch (_) { return ""; }
}

function livePlatformSet(profile) {
  const values = String(profile?.live_platform || "").toLowerCase().split(/[^a-z]+/).filter(Boolean);
  if (profile?.youtube_is_live) values.push("youtube");
  if (profile?.tiktok_is_live) values.push("tiktok");
  return new Set(values);
}

function ensureLiveStartAlertStyles() {
  if (document.getElementById("lsLiveStartAlertStyles")) return;
  const style = document.createElement("style");
  style.id = "lsLiveStartAlertStyles";
  style.textContent = `
    .ls-watch-inside{border-color:rgba(145,70,255,.58)!important;background:linear-gradient(135deg,#6d2ee8,#9146ff)!important;color:#fff!important}
    .ls-live-start-alert{position:fixed;z-index:2147482500;top:max(72px,calc(env(safe-area-inset-top) + 58px));left:50%;width:min(440px,calc(100% - 24px));transform:translateX(-50%);display:grid;grid-template-columns:52px 1fr auto;align-items:center;gap:11px;padding:11px 12px;border-radius:17px;color:#fff;text-align:left;box-shadow:0 18px 55px rgba(0,0,0,.55);animation:lsLiveAlertIn .5s cubic-bezier(.16,1,.3,1) both;overflow:hidden}
    .ls-live-start-alert.ls6{border:1px solid rgba(255,62,92,.48);background:linear-gradient(135deg,rgba(20,26,38,.98),rgba(50,12,25,.98))}.ls-live-start-alert.ls7{border:1px solid rgba(57,231,255,.48);background:radial-gradient(circle at 0 0,rgba(57,231,255,.20),transparent 42%),linear-gradient(135deg,#06162b,#160a32);box-shadow:0 18px 60px rgba(0,0,0,.62),0 0 35px rgba(57,231,255,.16)}
    .ls-live-start-alert.ls7::after{content:"";position:absolute;inset:-80% -20%;background:linear-gradient(110deg,transparent 42%,rgba(57,231,255,.22) 49%,transparent 56%);animation:lsLiveAlertScan 2.2s linear infinite;pointer-events:none}.ls-live-start-avatar{position:relative;z-index:1;width:48px;height:48px;display:grid;place-items:center;border:2px solid #ff315c;border-radius:50%;background:#101522;font-size:24px;overflow:hidden;box-shadow:0 0 18px rgba(255,49,92,.34)}.ls-live-start-alert.ls7 .ls-live-start-avatar{border-color:#39e7ff;box-shadow:0 0 22px rgba(57,231,255,.45)}.ls-live-start-avatar img{width:100%;height:100%;object-fit:cover}.ls-live-start-copy{position:relative;z-index:1;min-width:0;display:flex;flex-direction:column;gap:2px}.ls-live-start-copy small{color:#ff718d;font:900 7px 'JetBrains Mono',monospace;letter-spacing:.14em}.ls-live-start-alert.ls7 small{color:#58efff}.ls-live-start-copy strong{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ls-live-start-copy em{color:#aeb7c8;font-size:8px;font-style:normal}.ls-live-start-alert>i{position:relative;z-index:1;padding:6px 7px;border-radius:8px;background:#ff315c;color:#fff;font:900 7px 'JetBrains Mono',monospace;letter-spacing:.08em;font-style:normal;animation:lsLivePulse 1.1s infinite}
    .ls-live-start-alert.platform-twitch>i{background:#9146ff}.ls-live-start-alert.platform-twitch .ls-live-start-avatar{border-color:#a970ff}
    .ls-live-start-alert.platform-kick>i{background:#53fc18;color:#071006}.ls-live-start-alert.platform-kick .ls-live-start-avatar{border-color:#53fc18;box-shadow:0 0 22px rgba(83,252,24,.34)}
    .ls-live-start-alert.platform-youtube>i{background:#ff0033}.ls-live-start-alert.platform-youtube .ls-live-start-avatar{border-color:#ff0033}
    .ls-live-start-alert.platform-tiktok>i{background:#111;border:1px solid #35f1e5}.ls-live-start-alert.platform-tiktok .ls-live-start-avatar{border-color:#35f1e5}
    .ls-live-start-alert.platform-both>i{background:linear-gradient(100deg,#53fc18 0 48%,#9146ff 52%);color:#fff}.ls-live-start-alert.platform-both .ls-live-start-avatar{border-color:#c88cff}
    @keyframes lsLivePulse{50%{opacity:.35;transform:scale(.75)}}
    @keyframes lsLiveAlertIn{from{opacity:0;transform:translate(-50%,-24px) scale(.94)}to{opacity:1;transform:translate(-50%,0) scale(1)}}@keyframes lsLiveAlertScan{to{transform:translateX(70%)}}
    html.ls6-app-runtime nav{top:max(30px,calc(env(safe-area-inset-top) + 6px))!important;margin-top:max(30px,calc(env(safe-area-inset-top) + 6px))!important}
  `;
  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", ensureLiveStartAlertStyles);



async function renderDirectos(renderToken = lsTabRenderToken) {
  startConnectedLiveRefresh();
  const main = document.getElementById("appView");
  main.innerHTML = `
    <h1 class="page-title" style="margin-bottom:0;">🔴 Directos</h1>
    <p class="page-sub">Descubrí quién está en vivo en Kick, Twitch, YouTube o TikTok.</p>
    <div id="directosList">Cargando...</div>`;

  // Conservamos exclusivamente la integración existente de Kick y Twitch.
  const { data:liveUsersData } = await sb.from("profiles")
    .select("id,username,avatar_emoji,avatar_url,plan_id,live_platform,live_started_at,social_kick,social_twitch,social_youtube,social_tiktok,youtube_is_live,youtube_live_video_id,tiktok_is_live")
    .or("is_live.eq.true,youtube_is_live.eq.true,tiktok_is_live.eq.true")
    .is("ban_reason",null)
    .order("live_started_at",{ascending:false});

  const liveUsers = liveUsersData || [];

  if (renderToken !== lsTabRenderToken || currentTab !== "directos") return;
  const list = document.getElementById("directosList");
  if (!list) return;

  let html = "";

  if (liveUsers.length) {
    html += `<section>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px;">
        <h3 style="margin:0;font-size:12px;letter-spacing:.04em;">📺 DIRECTOS EN LIVESCROLL</h3>
        <span style="font-size:9px;color:var(--text-dim);">KICK · TWITCH · YOUTUBE · TIKTOK</span>
      </div>
      ${liveUsers.map(u => {
        const platforms = livePlatformSet(u);
        const platformLabel = [["kick","🟢 Kick"],["twitch","🟣 Twitch"],["youtube","🔴 YouTube"],["tiktok","⚫ TikTok"]].filter(([key]) => platforms.has(key)).map(([,label]) => label).join(" + ") || "🔴 En vivo";
        const kickChannel = getKickChannelFromUrl(u.social_kick);
        const twitchChannel = getTwitchChannelFromUrl(u.social_twitch);
        const youtubeUrl = u.youtube_live_video_id ? `https://www.youtube.com/watch?v=${encodeURIComponent(u.youtube_live_video_id)}` : getYouTubeChannelUrl(u.social_youtube);
        const tiktokUrl = getTikTokProfileUrl(u.social_tiktok);
        const watchButtons = [
          platforms.has("kick") && kickChannel
            ? `<a href="https://kick.com/${encodeURIComponent(kickChannel)}" target="_blank" rel="noopener" class="watch-btn" style="text-decoration:none;">Ver en Kick</a>` : "",
          platforms.has("twitch") && twitchChannel
            ? `<a href="https://www.twitch.tv/${encodeURIComponent(twitchChannel)}" target="_blank" rel="noopener" class="watch-btn ls-watch-inside" style="text-decoration:none;">Ver en Twitch</a>` : "",
          platforms.has("youtube") && youtubeUrl
            ? `<a href="${escapeHtml(youtubeUrl)}" target="_blank" rel="noopener" class="watch-btn" style="text-decoration:none;background:#ff0033;color:#fff;">Ver en YouTube</a>` : "",
          platforms.has("tiktok") && tiktokUrl
            ? `<a href="${escapeHtml(tiktokUrl)}" target="_blank" rel="noopener" class="watch-btn" style="text-decoration:none;background:#111;color:#fff;border-color:#35f1e5;">Ver en TikTok</a>` : ""
        ].join("");
        return `<div class="directo-card">
          <div class="avatar-lg" onclick="viewPublicProfile('${escapeHtml(u.username)}')" style="cursor:pointer;">${renderAvatarHtml(u,52)}</div>
          <div class="info" onclick="viewPublicProfile('${escapeHtml(u.username)}')" style="cursor:pointer;">
            <div class="uname">@${escapeHtml(u.username)} ${getPlanBadgeHtml(u.plan_id)}</div>
            <div class="plat">${platformLabel} · en vivo</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">${watchButtons}</div>
        </div>`;
      }).join("")}
    </section>`;
  }

  if (!liveUsers.length) {
    html = `
      <div style="
        margin-top:12px;
        padding:22px 16px;
        border:1px solid var(--border);
        border-radius:16px;
        background:var(--panel);
        text-align:center;
      ">
        <div style="font-size:28px;margin-bottom:8px;">📡</div>
        <div style="font-size:13px;font-weight:900;">No hay directos públicos ahora</div>
        <div style="font-size:10px;color:var(--text-dim);margin-top:5px;">
          Cuando un creador inicie una transmisión, va a aparecer acá.
        </div>
      </div>`;
  }

  list.innerHTML = html;
}

async function renderUsersDirectory() {
  ensureIdentityExperience593Styles();
  const main = document.getElementById("appView");
  main.innerHTML = `
    <h1 class="page-title">👥 Usuarios</h1>
    <p class="page-sub">Buscá personas y descubrí a los creadores de LiveScroll.</p>
    <div class="users-directory-tabs">
      <button id="usersFilterAll" class="btn" onclick="setUsersDirectoryType('users')" style="flex:1;font-size:13px;padding:11px 14px;">👥 Usuarios</button>
      <button id="usersFilterCreators" class="btn-outline" onclick="setUsersDirectoryType('creators')" style="flex:1;font-size:13px;padding:11px 14px;">🎬 Creadores</button>
    </div>
    <input type="text" id="userSearchInput" class="user-directory-search" placeholder="Buscar por nombre de usuario..." oninput="handleUserSearchInput()">
    <div id="usersDirectoryList">Cargando...</div>`;

  window.__usersDirectoryType = "users";
  await loadUsersDirectory("");
}

function setUsersDirectoryType(type) {
  window.__usersDirectoryType = type === "creators" ? "creators" : "users";
  document.getElementById("usersFilterAll")?.classList.toggle("btn", window.__usersDirectoryType === "users");
  document.getElementById("usersFilterAll")?.classList.toggle("btn-outline", window.__usersDirectoryType !== "users");
  document.getElementById("usersFilterCreators")?.classList.toggle("btn", window.__usersDirectoryType === "creators");
  document.getElementById("usersFilterCreators")?.classList.toggle("btn-outline", window.__usersDirectoryType !== "creators");
  loadUsersDirectory(document.getElementById("userSearchInput")?.value.trim() || "");
}

function handleUserSearchInput() {
  clearTimeout(usersDirectorySearchTimeout);
  const input = document.getElementById("userSearchInput");
  if (!input) return;
  const term = input.value.trim();
  usersDirectorySearchTimeout = setTimeout(() => loadUsersDirectory(term), 350);
}

async function loadUsersDirectory(term) {
  const requestToken = ++usersDirectoryRequestToken;
  const list = document.getElementById("usersDirectoryList");
  if (!list) return;
  list.innerHTML = "Buscando...";

  let query = sb.from("profiles")
    .select("id, username, avatar_emoji, avatar_url, plan_id, is_live, live_platform, is_creator")
    .is("ban_reason", null)
    .neq("id", currentUser.id)
    .order("is_live", { ascending: false })
    .order("username")
    .limit(40);

  if (term) query = query.ilike("username", `%${term}%`);
  if (window.__usersDirectoryType === "creators") query = query.eq("is_creator", true);
  else query = query.eq("is_creator", false);

  const { data: users, error } = await query;
  if (requestToken !== usersDirectoryRequestToken) return;
  if (!document.getElementById("usersDirectoryList")) return; // el usuario ya cambió de pestaña
  if (error) { list.innerHTML = `<p class="error-msg">No se pudo cargar la lista de usuarios.</p>`; return; }
  if (!users || !users.length) {
    list.innerHTML = `<p style="color:var(--text-dim); font-size:13px;">No encontramos usuarios${term ? ` para "${escapeHtml(term)}"` : ""}.</p>`;
    return;
  }

  list.innerHTML = users.map(u => `
    <div class="user-directory-row" onclick="viewPublicProfile('${escapeHtml(u.username)}')">
      <div class="avatar-sm${u.is_live ? " avatar-live-ring" : ""}">${renderAvatarHtml(u, 40)}</div>
      <div class="info">
        <div class="uname" style="font-size:14px;">${u.is_live ? `<span class="live-dot-badge"></span>` : ""}@${escapeHtml(u.username)} ${getPlanBadgeHtml(u.plan_id)}</div>
        <div class="ls-directory-role ${u.is_creator ? "creator" : "user"}">${u.is_creator ? "🎬 Creador" : "👤 Usuario"}</div>
      </div>
      <div style="color:var(--text-dim); font-size:16px;">›</div>
    </div>`).join("");
}



function openEmojiDetail(name, emoji, rarity = "", obtainedAt = "", serialNumber = "", stockTotal = "") {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  const rarityLabel = rarity ? getProfileMedalRarityLabel(rarity) : "Emoji";
  const rarityClass = rarity ? getProfileMedalRarityClass(rarity) : "";

  const rarityColor =
    rarity === "rara" ? "#7dd3fc" :
    rarity === "epica" ? "#c084fc" :
    rarity === "legendaria" ? "#fbbf24" :
    rarity === "exclusiva" ? "#fb7185" :
    rarity === "comun" ? "#cbd5e1" :
    "var(--text-dim)";

  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked" style="z-index:240;" data-modal-locked="1">
      <div class="modal-box" style="max-width:390px;text-align:center;overflow:hidden;">
        <div style="position:relative;padding:28px 22px 20px;background:
          radial-gradient(circle at 50% 15%, ${rarityColor}18, transparent 48%),
          var(--panel);">

          <button type="button" onclick="openMyMedalsPanel()"
            style="position:absolute;right:14px;top:14px;width:38px;height:38px;border-radius:50%;border:1px solid var(--border);background:var(--panel-2);color:var(--text);font-size:17px;cursor:pointer;">✕</button>

          <div style="font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:900;letter-spacing:.14em;color:var(--text-dim);margin-bottom:17px;">
            LIVESCROLL · COLLECTION
          </div>

          <div class="ls-equipped-medal ${rarityClass}"
            style="width:92px;height:92px;margin:0 auto 15px;font-size:52px;pointer-events:none;">
            ${emoji}
          </div>

          <h2 style="margin:0;font-size:22px;">${escapeHtml(name || "Emoji")}</h2>

          <div style="font-size:9px;font-weight:900;letter-spacing:.09em;text-transform:uppercase;color:${rarityColor};margin-top:7px;">
            ${escapeHtml(rarityLabel)}
          </div>

          ${serialNumber && stockTotal ? `
            <div style="display:inline-flex;margin-top:13px;padding:6px 10px;border-radius:999px;border:1px solid rgba(250,204,21,.25);background:rgba(250,204,21,.05);font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:900;color:var(--gold);">
              LIMITED #${serialNumber}/${stockTotal}
            </div>` : ""}

          <div style="margin:18px auto 0;max-width:290px;padding:12px;border-radius:12px;background:var(--panel-2);border:1px solid var(--border);">
            <div style="font-size:11px;color:var(--text-dim);line-height:1.55;">
              Emoji desbloqueado para usar en tu perfil de LiveScroll.
            </div>
            ${obtainedAt ? `
              <div style="font-size:10px;color:var(--text-dim);margin-top:8px;">
                Obtenido el ${new Date(obtainedAt).toLocaleDateString("es-AR")}
              </div>` : ""}
          </div>
        </div>

        <div style="padding:0 22px 22px;">
          <button class="btn-outline" style="width:100%;" onclick="openMyMedalsPanel()">Volver a Mi colección</button>
        </div>
      </div>
    </div>`;
}

async function openMyMedalsPanel(initialFilter = "all") {
  const badges = window.__myProfileBadges || [];
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  const [
    { data: storeBadges },
    equipped,
    { data: badgeClaims },
    { data: unlockedEmojis },
    { data: storeEmojis },
    { data: emojiClaims },
    { data: unlockedItems },
    { data: titleItems },
    equippedTitle
  ] = await Promise.all([
    sb.from("store_badges").select("id,badge_name,rarity,description,is_limited,stock_total"),
    getEquippedProfileMedals(currentUser.id),
    sb.from("user_store_badge_claims").select("badge_id,serial_number,claimed_at").eq("user_id", currentUser.id),
    sb.from("user_unlocked_emojis").select("emoji").eq("user_id", currentUser.id),
    sb.from("store_emojis").select("id,emoji,name,rarity,is_limited,stock_total"),
    sb.from("user_store_emoji_claims").select("emoji_id,serial_number,claimed_at").eq("user_id", currentUser.id),
    sb.from("user_unlocked_items").select("item_id,unlocked_at").eq("user_id", currentUser.id),
    sb.from("store_items").select("id,category,icon,name,rarity").eq("category", "title"),
    getMyProfileTitle()
  ]);

  const storeBadgeByName = {};
  (storeBadges || []).forEach(b => {
    storeBadgeByName[String(b.badge_name || "").toLowerCase()] = b;
  });

  const badgeClaimById = {};
  (badgeClaims || []).forEach(c => { badgeClaimById[c.badge_id] = c; });

  const equippedSet = new Set((equipped || []).map(b => b.badge_name));

  const normalizedBadges = badges.map(b => {
    const meta = storeBadgeByName[String(b.badge_name || "").toLowerCase()] || {};
    const launchMeta = getLiveScroll6LaunchBadgeMeta(b.badge_name) || {};
    const claim = badgeClaimById[meta.id] || {};
    return {
      type:"badge",
      icon:b.badge_icon || "🏅",
      name:b.badge_name || "Medalla",
      rarity:meta.rarity || launchMeta.rarity || null,
      description:meta.description || launchMeta.description || "",
      is_limited:!!meta.is_limited || !!launchMeta.is_limited,
      stock_total:meta.stock_total || null,
      serial_number:claim.serial_number || null,
      obtained_at:claim.claimed_at || b.earned_at || null,
      equipped:equippedSet.has(b.badge_name)
    };
  });

  const emojiMetaByChar = {};
  (storeEmojis || []).forEach(e => { emojiMetaByChar[e.emoji] = e; });

  const emojiClaimById = {};
  (emojiClaims || []).forEach(c => { emojiClaimById[c.emoji_id] = c; });

  const normalizedEmojis = (unlockedEmojis || []).map(e => {
    const meta = emojiMetaByChar[e.emoji] || {};
    const claim = emojiClaimById[meta.id] || {};
    return {
      type:"emoji",
      icon:e.emoji,
      name:meta.name || "Emoji",
      rarity:meta.rarity || null,
      description:"Emoji desbloqueado para usar en tu perfil.",
      is_limited:!!meta.is_limited,
      stock_total:meta.stock_total || null,
      serial_number:claim.serial_number || null,
      obtained_at:claim.claimed_at || null,
      equipped:false
    };
  });

  const unlockedItemById = {};
  (unlockedItems || []).forEach(i => { unlockedItemById[i.item_id] = i; });

  const normalizedTitles = (titleItems || [])
    .filter(t => unlockedItemById[t.id])
    .map(t => ({
      type:"title",
      item_id:t.id,
      icon:t.icon || "🏷️",
      name:t.name || "Título",
      rarity:t.rarity || "comun",
      description:"Título equipable para mostrar debajo de tu nombre.",
      is_limited:false,
      stock_total:null,
      serial_number:null,
      obtained_at:unlockedItemById[t.id]?.unlocked_at || null,
      equipped:equippedTitle?.item_id === t.id
    }));

  window.__collection568Items = [...normalizedBadges, ...normalizedEmojis, ...normalizedTitles];
  // La colección se reconstruye desde Supabase cada vez que se abre,
  // evitando mostrar stock/seriales viejos después de una compra.
  window.__collection568Filter = initialFilter || "all";
  window.__collection568RarityFilter = "all";
  window.__collection568Sort = "rarity";

  const allItems = window.__collection568Items;

  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked" style="z-index:210;" data-modal-locked="1">
      <div class="modal-box" style="max-width:520px;max-height:90dvh;overflow:hidden;display:flex;flex-direction:column;">
        <div class="modal-box-header" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
          <div>
            <h2 style="margin:0;font-size:19px;">💎 Mi colección</h2>
            <div style="font-size:11px;color:var(--text-dim);margin-top:3px;">
              ${allItems.length} objeto${allItems.length===1?"":"s"} · ${normalizedBadges.length} medallas · ${normalizedEmojis.length} emojis · ${normalizedTitles.length} títulos
            </div>
          </div>
          <button type="button" onclick="closeManagedModal()"
            style="width:40px;height:40px;border-radius:50%;border:1px solid var(--border);background:var(--panel-2);color:var(--text);font-size:18px;cursor:pointer;">✕</button>
        </div>

        <div class="modal-box-body" style="overflow-y:auto;">
          <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px;">
            <button class="btn-outline ls-collection-filter active" data-filter="all" onclick="setCollection568Filter('all',this)" style="padding:6px 9px;font-size:10px;">Todos</button>
            <button class="btn-outline ls-collection-filter" data-filter="badge" onclick="setCollection568Filter('badge',this)" style="padding:6px 9px;font-size:10px;">Medallas</button>
            <button class="btn-outline ls-collection-filter" data-filter="emoji" onclick="setCollection568Filter('emoji',this)" style="padding:6px 9px;font-size:10px;">Emojis</button>
            <button class="btn-outline ls-collection-filter" data-filter="title" onclick="setCollection568Filter('title',this)" style="padding:6px 9px;font-size:10px;">Títulos</button>
            <button class="btn-outline ls-collection-filter" data-filter="limited" onclick="setCollection568Filter('limited',this)" style="padding:6px 9px;font-size:10px;">Limitados</button>
            <button class="btn-outline ls-collection-filter" data-filter="top" onclick="setCollection568Filter('top',this)" style="padding:6px 9px;font-size:10px;">Legendarios+</button>
          </div>
          <div style="margin:4px 0 12px;padding-top:10px;border-top:1px solid var(--border);">
            <div style="font-size:9px;color:var(--text-dim);font-family:'JetBrains Mono',monospace;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em;">
              Rareza
            </div>
            <div id="collection568RarityFilters" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px;flex-wrap:wrap;">
            <select id="collection568Sort" onchange="setCollection568Sort(this.value)"
              style="padding:8px 10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:inherit;font-size:10px;">
              <option value="rarity">Más raros</option>
              <option value="newest">Más nuevos</option>
              <option value="serial">Nº de edición</option>
              <option value="name">Nombre A-Z</option>
            </select>

            <button class="btn-outline" style="padding:6px 10px;font-size:10px;" onclick="openEquipMedalsPanel()">Editar mis 3 medallas</button>
          </div>

          <div id="collection568Summary" style="font-size:10px;color:var(--text-dim);margin-bottom:10px;"></div>
          <div id="collection568Grid"></div>
        </div>
      </div>
    </div>`;

  const initialBtn = document.querySelector(`.ls-collection-filter[data-filter="${window.__collection568Filter}"]`);
  document.querySelectorAll(".ls-collection-filter").forEach(btn => {
    const active = btn === initialBtn;
    btn.classList.toggle("active", active);
    btn.style.borderColor = active ? "var(--gold)" : "";
    btn.style.color = active ? "var(--gold)" : "";
  });

  renderCollection568RarityFilters(window.__collection568Filter);
  renderCollection568Grid();
}

function setCollection568Filter(filter, button) {
  window.__collection568Filter = filter || "all";
  window.__collection568RarityFilter = "all";

  document.querySelectorAll(".ls-collection-filter").forEach(btn => {
    btn.classList.toggle("active", btn === button);
    btn.style.borderColor = btn === button ? "var(--gold)" : "";
    btn.style.color = btn === button ? "var(--gold)" : "";
  });

  renderCollection568RarityFilters(window.__collection568Filter);
  renderCollection568Grid();
}

function setCollection568RarityFilter(filter, button) {
  window.__collection568RarityFilter = filter || "all";

  document.querySelectorAll(".ls-collection-rarity-filter").forEach(btn => {
    btn.classList.toggle("active", btn === button);
    btn.style.borderColor = btn === button ? "var(--gold)" : "";
    btn.style.color = btn === button ? "var(--gold)" : "";
  });

  renderCollection568Grid();
}

function renderCollection568RarityFilters(activeType) {
  const wrap = document.getElementById("collection568RarityFilters");
  if (!wrap) return;

  const all = window.__collection568Items || [];
  const scoped = ["badge","emoji","title"].includes(activeType)
    ? all.filter(i => i.type === activeType)
    : all;

  const available = new Set();
  scoped.forEach(item => {
    const rarity = String(item.rarity || "").toLowerCase();
    if (rarity) available.add(rarity);
    if (item.is_limited) available.add("limited");
  });

  const options = [
    ["all","Todos"],
    ["comun","Común"],
    ["rara","Rara"],
    ["epica","Épica"],
    ["legendaria","Legendaria"],
    ["exclusiva","Exclusiva"],
    ["mitica","Mítica"],
    ["limited","Limitada"]
  ].filter(([key]) => key === "all" || available.has(key));

  if (!options.some(([key]) => key === window.__collection568RarityFilter)) {
    window.__collection568RarityFilter = "all";
  }

  wrap.innerHTML = options.map(([key,label]) => `
    <button
      class="btn-outline ls-collection-rarity-filter ${window.__collection568RarityFilter === key ? "active" : ""}"
      onclick="setCollection568RarityFilter('${key}',this)"
      style="
        padding:5px 8px;
        font-size:9px;
        ${window.__collection568RarityFilter === key ? "border-color:var(--gold);color:var(--gold);" : ""}
      "
    >${label}</button>
  `).join("");
}

function setCollection568Sort(sort) {
  window.__collection568Sort = sort || "rarity";
  renderCollection568Grid();
}

function renderCollection568Grid() {
  const grid = document.getElementById("collection568Grid");
  const summary = document.getElementById("collection568Summary");
  if (!grid) return;

  const rarityRank = { mitica:6, exclusiva:5, legendaria:4, epica:3, rara:2, comun:1 };
  const filter = window.__collection568Filter || "all";
  const sort = window.__collection568Sort || "rarity";

  let items = [...(window.__collection568Items || [])];

  if (filter === "badge") items = items.filter(i => i.type === "badge");
  if (filter === "emoji") items = items.filter(i => i.type === "emoji");
  if (filter === "title") items = items.filter(i => i.type === "title");
  if (filter === "limited") items = items.filter(i => i.is_limited);
  if (filter === "top") items = items.filter(i => ["legendaria","exclusiva","mitica"].includes(i.rarity));

  const rarityFilter = window.__collection568RarityFilter || "all";
  if (rarityFilter === "limited") {
    items = items.filter(i => i.is_limited);
  } else if (rarityFilter !== "all") {
    items = items.filter(i => String(i.rarity || "").toLowerCase() === rarityFilter);
  }

  if (sort === "rarity") {
    items.sort((a,b) => {
      const rarityDiff=(rarityRank[b.rarity]||0)-(rarityRank[a.rarity]||0);
      if (rarityDiff) return rarityDiff;
      return new Date(b.obtained_at || 0)-new Date(a.obtained_at || 0);
    });
  }

  if (sort === "newest") {
    items.sort((a,b) => new Date(b.obtained_at || 0)-new Date(a.obtained_at || 0));
  }

  if (sort === "serial") {
    items.sort((a,b) => {
      const aHas = Number.isFinite(Number(a.serial_number)) && Number(a.serial_number) > 0;
      const bHas = Number.isFinite(Number(b.serial_number)) && Number(b.serial_number) > 0;
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      if (aHas && bHas) return Number(a.serial_number)-Number(b.serial_number);
      return (rarityRank[b.rarity]||0)-(rarityRank[a.rarity]||0);
    });
  }

  if (sort === "name") {
    items.sort((a,b) => String(a.name || "").localeCompare(String(b.name || ""), "es"));
  }

  if (summary) {
    const labels = {
      all:"Todos",
      badge:"Medallas",
      emoji:"Emojis",
      title:"Títulos",
      limited:"Limitados",
      top:"Legendarios, exclusivos y míticos"
    };
    const rarityLabels = {
      all:"Todos",
      comun:"Común",
      rara:"Rara",
      epica:"Épica",
      legendaria:"Legendaria",
      exclusiva:"Exclusiva",
      mitica:"Mítica",
      limited:"Limitada"
    };
    const rarityText = rarityFilter === "all"
      ? ""
      : ` · ${rarityLabels[rarityFilter] || rarityFilter}`;
    summary.textContent = `${labels[filter] || "Todos"}${rarityText} · ${items.length} resultado${items.length===1?"":"s"}`;
  }

  if (!items.length) {
    grid.innerHTML = `
      <div style="text-align:center;padding:28px 10px;color:var(--text-dim);font-size:12px;">
        <div style="font-size:36px;margin-bottom:8px;">💎</div>
        No hay objetos que coincidan con este filtro.
      </div>`;
    return;
  }

  const renderItem = (item) => {
    const rarityClass=item.rarity ? getProfileMedalRarityClass(item.rarity) : "";
    const rarityLabel=item.rarity
      ? getProfileMedalRarityLabel(item.rarity)
      : item.type==="emoji"
        ? "Emoji"
        : item.type==="title"
          ? "Título"
          : "Logro";
    const rarityColor =
      item.rarity === "rara" ? "#7dd3fc" :
      item.rarity === "epica" ? "#c084fc" :
      item.rarity === "legendaria" ? "#fbbf24" :
      item.rarity === "exclusiva" ? "#fb7185" :
      item.rarity === "mitica" ? "#ff365d" :
      item.rarity === "comun" ? "#cbd5e1" :
      "var(--text-dim)";

    const onclick = item.type === "badge"
      ? `openMedalDetail('${escapeHtml(item.name)}','${escapeHtml(item.icon)}','${escapeHtml(item.rarity || "")}','${escapeHtml(item.description || "")}','${escapeHtml(item.obtained_at || "")}','${escapeHtml(item.serial_number || "")}','${escapeHtml(item.stock_total || "")}')`
      : item.type === "title"
        ? `openTitleDetail('${item.item_id}','${escapeHtml(item.name)}','${escapeHtml(item.icon)}',${item.equipped ? "true" : "false"},'${escapeHtml(item.obtained_at || "")}','${escapeHtml(item.rarity || "comun")}')`
        : `openEmojiDetail('${escapeHtml(item.name)}','${escapeHtml(item.icon)}','${escapeHtml(item.rarity || "")}','${escapeHtml(item.obtained_at || "")}','${escapeHtml(item.serial_number || "")}','${escapeHtml(item.stock_total || "")}')`;

    return `
      <button type="button" onclick="${onclick}"
        style="position:relative;background:var(--panel-2);border:1px solid ${item.rarity ? rarityColor : "var(--border)"};border-radius:14px;padding:14px;text-align:center;color:var(--text);font-family:inherit;cursor:pointer;overflow:hidden;">
        ${item.equipped ? `<div style="position:absolute;top:7px;right:7px;font-size:8px;font-weight:900;color:var(--green);background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.25);border-radius:999px;padding:2px 6px;">${item.type === "title" ? "EQUIPADO" : "EQUIPADA"}</div>` : ""}
        <div class="ls-equipped-medal ${rarityClass}" style="width:52px;height:52px;margin:2px auto 10px;font-size:28px;pointer-events:none;">
          ${item.icon}
        </div>
        <div style="font-size:12px;font-weight:700;color:var(--text);">${escapeHtml(item.name)}</div>
        <div style="font-size:8px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:${rarityColor};margin-top:5px;">
          ${escapeHtml(rarityLabel)}
        </div>
        ${item.serial_number && item.stock_total ? `<div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--gold);font-weight:900;margin-top:5px;">LIMITED #${item.serial_number}/${item.stock_total}</div>` : ""}
        ${item.obtained_at ? `<div style="font-size:9px;color:var(--text-dim);margin-top:5px;">${new Date(item.obtained_at).toLocaleDateString("es-AR")}</div>` : ""}
      </button>`;
  };

  grid.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:10px;">
      ${items.map(renderItem).join("")}
    </div>`;
}

async function viewPublicProfile(username) {
  ensureIdentityExperience593Styles();
  if (!username) return;
  if (username === currentProfile.username) { switchTab("profile"); return; }

  clearAllWatchIntervals();
  previousTabBeforeProfile = currentTab;

  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando perfil...</p>`;
  document.querySelectorAll(".nav-links button").forEach(b => b.classList.remove("active"));

  const { data: profile } = await sb.from("profiles").select("id, username, avatar_emoji, avatar_url, cover_url, cover_position_y, profile_side_image_url, bio, social_kick, social_twitch, social_youtube, social_tiktok, social_instagram, plan_id, is_live, live_platform, is_creator").eq("username", username).single();
  if (!profile) { main.innerHTML = `<p class="error-msg">Usuario no encontrado.</p>`; return; }
  recordDailyChallengeEvent("profile_view", profile.id);

  const [
    videosResult,
    followersResult,
    followingResult,
    badgesResult,
    theirEquippedBadges,
    theirTitle
  ] = await Promise.all([
    sb.from("videos").select(isLiveScroll7App() ? "*" : LS6_PROFILE_VIDEO_COLUMNS).eq("user_id", profile.id).order("created_at", { ascending:false }),
    sb.from("follows").select("follower_id").eq("followed_id", profile.id),
    sb.from("follows").select("follower_id").eq("followed_id", profile.id).eq("follower_id", currentUser.id).maybeSingle(),
    sb.from("user_badges").select("*").eq("user_id", profile.id).order("earned_at", { ascending:false }),
    getEquippedProfileMedals(profile.id),
    getPublicProfileTitle(profile.id)
  ]);

  const videos = videosResult?.data || [];
  const followers = followersResult?.data || [];
  const amIFollowing = followingResult?.data || null;
  const theirBadges = badgesResult?.data || [];

  const videoIds = (videos || []).map(v => v.id);

  const [sessionsResult, likesResult] = await Promise.all([
    videoIds.length ? sb.from("watch_sessions").select("video_id, viewer_id").in("video_id", videoIds) : Promise.resolve({ data:[] }),
    videoIds.length ? sb.from("video_likes").select("video_id").in("video_id", videoIds) : Promise.resolve({ data:[] })
  ]);
  const sessions = sessionsResult?.data || [];
  const likes = likesResult?.data || [];

  const viewsByVideo = {};
  (sessions || []).forEach(s => {
    viewsByVideo[s.video_id] = viewsByVideo[s.video_id] || new Set();
    viewsByVideo[s.video_id].add(s.viewer_id);
  });
  const likesByVideo = {};
  (likes || []).forEach(l => { likesByVideo[l.video_id] = (likesByVideo[l.video_id] || 0) + 1; });

  const isFollowing = !!amIFollowing;
  window.__profileFeedVideos = videos;
  window.__profileFeedAuthor = { username:profile.username, plan_id:profile.plan_id };
  const livingProfileHtml = renderLiveScroll7LivingProfile({
    profile,
    videos,
    followersCount:(followers || []).length,
    totalViews:Object.values(viewsByVideo).reduce((sum, viewers) => sum + viewers.size, 0),
    own:false
  });

  main.innerHTML = `
    <button class="btn-outline" style="margin-bottom:18px;" onclick="switchTab('${previousTabBeforeProfile}')">← Volver</button>

    <div class="profile-hero${isLiveScroll7App() ? " ls7-electric-profile" : ""}" style="position:relative; overflow:hidden;">
      <div class="profile-cover${profile.cover_url ? " has-image" : ""}"
        style="position:relative; z-index:4; ${profile.cover_url ? `background-image:url('${escapeHtml(profile.cover_url)}'); background-position:center ${Number(profile.cover_position_y ?? 50)}%;` : ""}">
      </div>

      ${profile.profile_side_image_url ? `
        <div aria-hidden="true" style="position:absolute;left:0;right:0;top:150px;bottom:0;z-index:1;overflow:hidden;pointer-events:none;">
          <img src="${escapeHtml(profile.profile_side_image_url)}" alt=""
            style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center;opacity:.42;filter:saturate(.95) contrast(1.06);">
          <div style="position:absolute;inset:0;background:
            linear-gradient(180deg,rgba(13,16,20,.16) 0%,rgba(13,16,20,.28) 48%,rgba(13,16,20,.72) 100%),
            linear-gradient(90deg,rgba(13,16,20,.40) 0%,rgba(13,16,20,.18) 50%,rgba(13,16,20,.30) 100%);"></div>
        </div>` : ""}

      <div style="position:relative;z-index:2;">
        <div class="profile-hero-top">
          <div class="profile-avatar-ring ${getAvatarRingClass(profile.plan_id)}${profile.is_live ? " avatar-live-ring" : ""}">${renderAvatarHtml(profile, 60)}</div>
          <div class="profile-name-block">
            <h1>@${escapeHtml(profile.username)} ${getPlanBadgeHtml(profile.plan_id)}</h1>
            <div class="handle profile-role-badge ${profile.is_creator ? "creator" : "user"}">${profile.is_creator ? "🎬 Creador" : "👤 Usuario"}</div>
            ${renderProfileTitleInline(theirTitle, false)}
            ${theirEquippedBadges.length ? `<div class="ls-public-medals-wrap">${renderEquippedMedalsInline(theirEquippedBadges, false)}</div>` : ""}
          </div>
        </div>
        ${profile.bio ? `<p class="profile-bio">${escapeHtml(profile.bio)}</p>` : ""}
        ${renderSocialIcons(profile)}
        <div class="profile-stats-row">
          <div class="stat-pill"><div class="num">${videos?.length || 0}</div><div class="lbl">Videos</div></div>
          <div class="stat-pill"><div class="num">${(followers || []).length}</div><div class="lbl">Seguidores</div></div>
        </div>
        <div class="profile-hero-actions">
          <button class="btn${isFollowing ? "-outline" : ""}" id="followBtn" onclick="handleToggleFollow('${profile.id}')">${isFollowing ? "Siguiendo ✓" : "+ Seguir"}</button>
        </div>
      </div>
    </div>

    ${renderGenerationIdentityCard(videos, false)}
    ${livingProfileHtml}

    ${theirBadges && theirBadges.length ? `
      <div class="profile-section">
        <div class="profile-section-head">
          <div class="ico">🏅</div>
          <h3>Medallas</h3>
          <div class="sub">${theirBadges.length}</div>
        </div>
        <div class="form-card">
          <div class="streak-badges">
            ${theirBadges.map(b => `<div class="badge-icon" title="${escapeHtml(b.badge_name)}">${b.badge_icon || "🏅"}</div>`).join("")}
          </div>
        </div>
      </div>` : ""}

    <div class="profile-section">
      <div class="profile-section-head">
        <div class="ico">🎬</div>
        <h3>Videos</h3>
        <div class="sub">${videos?.length || 0} en total</div>
      </div>
      ${videos && videos.length ? (() => {
        window.__profileFeedVideos = videos;
        window.__profileFeedAuthor = { username: profile.username, plan_id: profile.plan_id };
        return `
        <div class="video-grid">
          ${videos.map(v => `
            <div class="video-grid-tile" id="public-tile-${v.id}" onclick="openProfileVideoFeed(window.__profileFeedVideos, '${v.id}', window.__profileFeedAuthor)">
              ${getGridCoverHtml(v)}
              ${currentProfile.is_admin ? `<button class="ls-admin-profile-delete-611" title="Eliminar como administrador" aria-label="Eliminar video como administrador" onclick="event.stopPropagation();handleAdminDeleteProfileVideo('${v.id}','${escapeHtml(profile.username)}')">🗑</button>` : ""}
              <div class="grid-overlay">
                <div class="grid-stats">
                  <span>👁 ${(viewsByVideo[v.id]?.size || 0)}</span>
                  <span>❤️ ${likesByVideo[v.id] || 0}</span>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      `;
      })() : `<p style="color:var(--text-dim)">Todavía no subió videos.</p>`}
    </div>`;
}

async function handleToggleFollow(followedId) {
  const { data, error } = await sb.rpc("toggle_follow", { p_follower_id: currentUser.id, p_followed_id: followedId });
  if (error || !data.ok) return;
  const btn = document.getElementById("followBtn");
  if (data.following) {
    btn.textContent = "Siguiendo ✓";
    btn.className = "btn-outline";
    showToast("Ahora seguís a este creador");
  } else {
    btn.textContent = "+ Seguir";
    btn.className = "btn";
  }
}

function openReportModal(videoId) {
  const wrap = document.getElementById("globalModalWrap");
  const reasons = ["Contenido violento", "Spam o engañoso", "Derechos de autor", "Contenido sexual", "Otro"];
  wrap.innerHTML = `
    <div class="ls-modal-locked" data-modal-locked="1" style="position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px;">
      <div style="background:var(--panel); width:100%; max-width:340px; border-radius:16px; padding:22px;">
        <h3 style="margin-top:0;">🚩 Reportar video</h3>
        <p style="font-size:13px; color:var(--text-dim); margin-bottom:14px;">¿Por qué querés reportarlo?</p>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${reasons.map(r => `<button class="btn-outline" style="text-align:left;" onclick="submitReport('${videoId}', '${r}')">${r}</button>`).join("")}
        </div>
        <button class="btn-outline" style="width:100%;margin-top:12px;" onclick="closeManagedModal()">Cancelar</button>
      </div>
    </div>`;
}

async function submitReport(videoId, reason) {
  const { data, error } = await sb.rpc("report_video", { p_video_id: videoId, p_reporter_id: currentUser.id, p_reason: reason });
  document.getElementById("globalModalWrap").innerHTML = "";
  if (error || !data.ok) {
    showToast(data?.error === "ya_reportado" ? "Ya habías reportado este video" : "No se pudo reportar");
    return;
  }
  showToast("Reportado. Gracias por avisarnos.");
}

let notifCache = [];
let notifRealtimeChannel = null;
let notifRealtimeUserId = null;
let notifUiRefreshFrame = null;
let notifVisibleCount = 18;
let notifSoundContext = null;
let notifRealtimeConnected = false;
let notifFallbackTimer = null;
const LS_NOTIFICATION_SOUND_KEY = "livescroll_notification_sound_v598";

function stopNotificationFallback() {
  if (notifFallbackTimer) clearInterval(notifFallbackTimer);
  notifFallbackTimer = null;
  notifRealtimeConnected = false;
}

async function pollNotificationsFallback() {
  if (!currentUser?.id || document.hidden || notifRealtimeConnected) return;
  const newestAt = notifCache[0]?.created_at || new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .eq("user_id", currentUser.id)
    .gt("created_at", newestAt)
    .order("created_at", { ascending:false })
    .limit(20);
  if (error || !data?.length) return;
  const known = new Set(notifCache.map(n => n.id));
  const fresh = data.filter(n => !known.has(n.id));
  if (!fresh.length) return;
  notifCache = [...fresh, ...notifCache].slice(0, 60);
  scheduleNotificationUIRefresh();
  playLiveScrollNotificationSound();
  const latest = fresh[0];
  showToast(`${getNotificationIcon(latest.type)} ${latest.message || "Nueva notificación"}`);
  if (latest.type === "live") showLiveStartAnimation(latest);
}

function startNotificationFallback() {
  if (notifFallbackTimer) return;
  notifFallbackTimer = setInterval(pollNotificationsFallback, 8000);
}

function isNotificationSoundEnabled() {
  try { return localStorage.getItem(LS_NOTIFICATION_SOUND_KEY) === "1"; }
  catch (_) { return false; }
}

function playLiveScrollNotificationSound() {
  if (!isNotificationSoundEnabled() || document.hidden) return;
  try {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) return;
    notifSoundContext = notifSoundContext || new AudioEngine();
    const ctx = notifSoundContext;
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(940, now + .12);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(.085, now + .018);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .20);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + .22);
  } catch (_) {}
}

function toggleLiveScrollNotificationSound() {
  const enabled = !isNotificationSoundEnabled();
  try { localStorage.setItem(LS_NOTIFICATION_SOUND_KEY, enabled ? "1" : "0"); } catch (_) {}
  if (enabled) playLiveScrollNotificationSound();
  renderNotificationPanelContent();
  showToast(enabled ? "🔊 Sonido de notificaciones activado" : "🔇 Sonido de notificaciones desactivado");
}

function scheduleNotificationUIRefresh() {
  if (notifUiRefreshFrame) return;
  notifUiRefreshFrame = requestAnimationFrame(() => {
    notifUiRefreshFrame = null;
    updateNotificationBadge();
    if (document.getElementById("notifPanel")) renderNotificationPanelContent();
  });
}

function getNotificationIcon(type) {
  const icons = { like: "❤️", comment: "💬", follow: "👤", live: "🔴", admin: "🛠️", system: "🔔", points: "🪙", streak: "🔥", plan: "💎" };
  return icons[type] || "🔔";
}

const LS_LIVE_ALERT_HISTORY_KEY = "livescroll_live_alert_sessions_v1";

function hasShownLiveSessionAlert(key) {
  try {
    const history = JSON.parse(sessionStorage.getItem(LS_LIVE_ALERT_HISTORY_KEY) || "{}");
    const now = Date.now();
    Object.keys(history).forEach(item => {
      if (now - Number(history[item] || 0) > 24 * 60 * 60 * 1000) delete history[item];
    });
    if (history[key]) return true;
    history[key] = now;
    const trimmed = Object.fromEntries(Object.entries(history).slice(-40));
    sessionStorage.setItem(LS_LIVE_ALERT_HISTORY_KEY, JSON.stringify(trimmed));
    return false;
  } catch (_) {
    window.__lsLiveAlertFallbackHistory = window.__lsLiveAlertFallbackHistory || new Set();
    if (window.__lsLiveAlertFallbackHistory.has(key)) return true;
    window.__lsLiveAlertFallbackHistory.add(key);
    return false;
  }
}

async function showLiveStartAnimation(notification) {
  if (!notification?.actor_id) return;
  const { data:creator } = await sb.from("profiles")
    .select("username,avatar_url,avatar_emoji,live_platform,live_started_at")
    .eq("id",notification.actor_id).maybeSingle();
  if (!creator) return;

  const platform = ["kick","twitch","both","youtube","tiktok"].includes(creator.live_platform)
    ? creator.live_platform
    : "twitch";
  const sessionStarted = creator.live_started_at || notification.created_at || "active";
  const sessionKey = `${notification.actor_id}:${platform}:${sessionStarted}`;
  if (hasShownLiveSessionAlert(sessionKey)) return;

  document.getElementById("lsLiveStartedAlert")?.remove();

  const platformLabel = platform === "both"
    ? "KICK + TWITCH"
    : platform === "kick" ? "KICK" : platform === "youtube" ? "YOUTUBE" : platform === "tiktok" ? "TIKTOK" : "TWITCH";
  const isLs7 = isLiveScroll7App();
  const alert = document.createElement("button");
  alert.id = "lsLiveStartedAlert";
  alert.type = "button";
  alert.className = `ls-live-start-alert ${isLs7 ? "ls7" : "ls6"} platform-${platform}`;
  alert.onclick = () => { alert.remove(); switchTab("directos"); };
  alert.innerHTML = `
    <span class="ls-live-start-avatar">${creator.avatar_url ? `<img src="${escapeHtml(creator.avatar_url)}" alt="">` : escapeHtml(creator.avatar_emoji || "🎬")}</span>
    <span class="ls-live-start-copy"><small>${isLs7 ? "SEÑAL DETECTADA" : "NUEVO DIRECTO"} · ${platformLabel}</small><strong>@${escapeHtml(creator.username)} está en vivo</strong><em>Tocá para ver las opciones del directo</em></span>
    <i>${platformLabel}</i>`;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 12000);
}

function updateNotificationBadge() {
  const unread = notifCache.filter(n => !n.read).length;
  const badge = document.getElementById("notifBadge");
  if (!badge) return;
  if (unread > 0) {
    badge.textContent = unread > 99 ? "99+" : unread;
    badge.classList.remove("hidden");
  } else {
    badge.textContent = "";
    badge.classList.add("hidden");
  }
}

async function loadNotifications() {
  if (!currentUser) return;
  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error cargando notificaciones:", error);
    return;
  }

  notifCache = data || [];
  updateNotificationBadge();
  if (document.getElementById("notifPanel")) renderNotificationPanelContent();
  if (!window.__lsLiveStartupAlertShown) {
    const recentLive = notifCache.find(n => n.type === "live" && !n.read && Date.now() - new Date(n.created_at).getTime() < 3 * 60 * 1000);
    if (recentLive) {
      window.__lsLiveStartupAlertShown = true;
      showLiveStartAnimation(recentLive);
    }
  }
}

function subscribeToNotifications() {
  if (!currentUser) return;
  if (notifRealtimeChannel && notifRealtimeUserId === currentUser.id) return;
  if (notifRealtimeChannel) {
    sb.removeChannel(notifRealtimeChannel);
    notifRealtimeChannel = null;
    notifRealtimeUserId = null;
  }

  notifRealtimeUserId = currentUser.id;
  notifRealtimeConnected = false;
  startNotificationFallback();
  notifRealtimeChannel = sb
    .channel(`notifications-${currentUser.id}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "notifications",
      filter: `user_id=eq.${currentUser.id}`
    }, payload => {
      const notification = payload.new;
      // El sondeo de respaldo puede haber incorporado exactamente este aviso
      // unos milisegundos antes. En ese caso no repetimos sonido, toast ni cartel.
      if (notifCache.some(n => n.id === notification.id)) return;
      notifCache.unshift(notification);
      notifCache = notifCache.slice(0, 60);
      scheduleNotificationUIRefresh();
      playLiveScrollNotificationSound();
      showToast(`${getNotificationIcon(notification.type)} ${notification.message || "Nueva notificación"}`);
      if (notification.type === "live") showLiveStartAnimation(notification);
    })
    .subscribe(status => {
      if (status === "SUBSCRIBED") {
        notifRealtimeConnected = true;
        console.log("Notificaciones Realtime conectadas");
      }
      if (status === "CHANNEL_ERROR" || status === "CLOSED") {
        notifRealtimeConnected = false;
        notifRealtimeChannel = null;
        notifRealtimeUserId = null;
        setTimeout(() => {
          if (currentUser?.id && !document.hidden) subscribeToNotifications();
        }, 1800);
      }
    });
}

function renderNotificationPanelContent() {
  const list = document.getElementById("notifPanelList");
  if (!list) return;
  if (!notifCache.length) {
    list.innerHTML = `<div class="ls-notif-empty"><span>🔔</span><strong>Todo tranquilo por acá</strong><small>Las novedades de tu cuenta aparecerán en este lugar.</small></div>`;
    return;
  }

  const grouped = [];
  const groupsByKey = new Map();
  notifCache.forEach(n => {
    const key = n.type === "like"
      ? `like:${n.video_id || n.message || "general"}`
      : n.type === "follow"
        ? `follow:${n.actor_id || n.message || n.id}`
        : n.type === "comment"
          ? `comment:${n.video_id || ""}:${n.actor_id || n.id}`
          : n.type === "live"
            ? `live:${n.actor_id || n.message || n.id}`
            : `${n.type || "system"}:${n.message || n.id}`;
    let group = groupsByKey.get(key);
    if (!group) {
      group = { ...n, members:[], groupUnread:false };
      groupsByKey.set(key, group);
      grouped.push(group);
    }
    group.members.push(n.id);
    if (!n.read) group.groupUnread = true;
  });

  window.__notifGroupMembers = {};
  grouped.forEach(group => { window.__notifGroupMembers[group.id] = group.members; });
  const visible = grouped.slice(0, notifVisibleCount);
  const newItems = visible.filter(n => n.groupUnread);
  const previousItems = visible.filter(n => !n.groupUnread);

  const renderGroup = (items, title) => items.length ? `
    <section class="ls-notif-section">
      <div class="ls-notif-section-title">${title}<span>${items.length}</span></div>
      ${items.map(n => {
        const clickable = n.video_id || n.actor_id || n.comment_id;
        return `<button class="ls-notif-item${n.groupUnread ? " is-unread" : ""}" onclick="${clickable ? `handleNotificationClick('${n.id}')` : "void(0)"}">
          <span class="ls-notif-icon">${getNotificationIcon(n.type)}</span>
          <span class="ls-notif-copy">
            <strong>${escapeHtml(n.message || "Nueva notificación")}${n.members.length > 1 ? ` <em>+${n.members.length - 1}</em>` : ""}</strong>
            <small>${formatNotificationTime(n.created_at)}${clickable ? " · Tocá para abrir" : ""}</small>
          </span>
          ${n.groupUnread ? `<i aria-label="Nueva"></i>` : ""}
        </button>`;
      }).join("")}
    </section>` : "";

  list.innerHTML = `
    <div class="ls-notif-tools">
      <button onclick="toggleLiveScrollNotificationSound()">${isNotificationSoundEnabled() ? "🔊 Sonido activo" : "🔇 Activar sonido"}</button>
      ${notifCache.some(n => !n.read) ? `<button onclick="markAllNotificationsRead()">✓ Leer todas</button>` : `<span>Todo leído</span>`}
    </div>
    ${renderGroup(newItems, "Nuevas")}
    ${renderGroup(previousItems, "Anteriores")}
    ${grouped.length > visible.length ? `<button class="ls-notif-more" onclick="notifVisibleCount += 18; renderNotificationPanelContent()">Ver anteriores (${grouped.length - visible.length})</button>` : ""}`;
}

async function markAllNotificationsRead() {
  if (!currentUser) return;
  const result = await sb.rpc("mark_notifications_read", { p_user_id:currentUser.id });
  if (result?.error) {
    showToast("No se pudieron marcar las notificaciones");
    return;
  }
  notifCache = notifCache.map(n => ({ ...n, read:true }));
  updateNotificationBadge();
  renderNotificationPanelContent();
}

async function markNotificationGroupRead(notificationId) {
  const ids = window.__notifGroupMembers?.[notificationId] || [notificationId];
  const idSet = new Set(ids);
  notifCache = notifCache.map(n => idSet.has(n.id) ? ({ ...n, read:true }) : n);
  updateNotificationBadge();
  try {
    await sb.from("notifications").update({ read:true }).eq("user_id", currentUser.id).in("id", ids);
  } catch (_) {}
}

function formatNotificationTime(dateString) {
  const date = new Date(dateString);
  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return "Ahora";
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days <= 7) return `Hace ${days} d`;
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function toggleNotifPanel() {
  const existing = document.getElementById("notifPanel");
  if (existing) { existing.remove(); return; }

  notifVisibleCount = 18;
  const panel = document.createElement("div");
  panel.id = "notifPanel";
  panel.className = "ls-social-pulse-panel";
  panel.innerHTML = `
    <div class="ls-notif-head">
      <div><span>SOCIAL PULSE</span><strong>Notificaciones</strong><small>Tu actividad en tiempo real</small></div>
      <button onclick="document.getElementById('notifPanel')?.remove()" aria-label="Cerrar">✕</button>
    </div>
    <div id="notifPanelList" class="ls-notif-list"></div>`;
  document.body.appendChild(panel);
  renderNotificationPanelContent();

  setTimeout(() => {
    document.addEventListener("click", function closeOnOutsideClick(e) {
      const panelEl = document.getElementById("notifPanel");
      if (!panelEl) { document.removeEventListener("click", closeOnOutsideClick); return; }
      if (!panelEl.contains(e.target) && e.target.id !== "notifBell" && !e.target.closest("#notifBell")) {
        panelEl.remove();
        document.removeEventListener("click", closeOnOutsideClick);
      }
    });
  }, 0);
}

async function handleNotificationClick(notificationId) {
  const notification = notifCache.find(n => n.id === notificationId);
  if (!notification) return;
  document.getElementById("notifPanel")?.remove();
  markNotificationGroupRead(notificationId);

  if (notification.type === "comment" && notification.video_id) {
    await openComments(notification.video_id, notification.comment_id || null);
    return;
  }
  if (notification.type === "like" && notification.video_id) {
    await openSharedVideo(notification.video_id);
    return;
  }
  if (notification.type === "live") {
    switchTab("directos");
    return;
  }
  if (notification.type === "follow" && notification.actor_id) {
    const { data: actor } = await sb.from("profiles").select("username").eq("id", notification.actor_id).maybeSingle();
    if (!actor?.username) { showToast("Ese perfil ya no está disponible"); return; }
    await viewPublicProfile(actor.username);
    return;
  }
  if (notification.video_id) { await openSharedVideo(notification.video_id); return; }
  if (notification.actor_id) {
    const { data: actor } = await sb.from("profiles").select("username").eq("id", notification.actor_id).maybeSingle();
    if (actor?.username) await viewPublicProfile(actor.username);
  }
}

function copyReferralLink() {
  const input = document.getElementById("referralLinkInput");
  input.select();
  navigator.clipboard.writeText(input.value).then(() => {
    showToast("¡Link copiado!");
  }).catch(() => {
    showToast("No se pudo copiar, seleccionalo a mano");
  });
}

async function openEditProfile() {
  const baseEmojis = ["🎬","⚡","🔥","🎮","🎧","🐐","🚀","💎","😎","🎯"];
  const { data: unlocked } = await sb.from("user_unlocked_emojis").select("emoji").eq("user_id", currentUser.id);
  const emojis = [...baseEmojis, ...(unlocked || []).map(u => u.emoji).filter(e => !baseEmojis.includes(e))];
  const isCreator = currentProfile.is_creator === true;
  const creatorStatus = currentProfile.creator_application_status;
  const creatorRequirementsMet = currentProfile.creator_video_count >= 5 && currentProfile.creator_account_days >= 7 && !currentProfile.is_blocked;

  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked" data-modal-locked="1" style="z-index:100;">
      <div class="modal-box ls-profile-edit-modal" style="max-width:420px;max-height:92dvh;overflow:hidden;display:flex;flex-direction:column;">
        <div class="modal-box-header ls-profile-edit-header" style="display:flex;align-items:center;justify-content:space-between;gap:10px;position:sticky;top:0;z-index:5;background:var(--panel);">
          <h2 style="font-size:19px;margin:0;">Editar perfil</h2>
          <button type="button" onclick="closeManagedModal()"
            aria-label="Cerrar"
            style="width:40px;height:40px;min-width:40px;border-radius:50%;border:1px solid var(--border);background:var(--panel-2);color:var(--text);font-size:18px;cursor:pointer;">✕</button>
        </div>
        <div class="modal-box-body ls-profile-edit-body" style="overflow-y:auto;min-height:0;">
        <div class="field" style="text-align:center;">
          <label>Foto de perfil</label>
          <div style="margin-bottom:10px;">
            ${currentProfile.avatar_url
              ? `<img src="${escapeHtml(currentProfile.avatar_url)}" alt="avatar" style="width:80px; height:80px; border-radius:50%; object-fit:cover; border:2px solid var(--gold-dim);">`
              : `<div style="width:80px; height:80px; border-radius:50%; background:var(--panel-2); display:flex; align-items:center; justify-content:center; font-size:36px; margin:0 auto;">${currentProfile.avatar_emoji || "🎬"}</div>`}
          </div>
          <input type="file" id="avatarPhotoInput" accept="image/*" onchange="handleAvatarPhotoUpload()" style="display:none;">
          <div class="ls-android-media-actions">
            <button type="button" class="btn-outline" onclick="openLiveScrollAndroidMedia('files','avatarPhotoInput','elegir una foto para tu perfil','files')">📁 Elegir foto</button>
            <button type="button" class="btn-outline" onclick="openLiveScrollAndroidMedia('camera','avatarPhotoInput','tomar una foto para tu perfil','camera')">📷 Usar cámara</button>
          </div>
          <div id="avatarUploadStatus" style="font-size:11px; color:var(--text-dim); margin-top:6px;">Máximo 3MB. Si subís una foto, tapa al emoji.</div>
          ${currentProfile.avatar_url ? `<button type="button" class="btn-outline" style="margin-top:10px; padding:9px 14px; font-size:13px; width:100%; color:var(--red); border-color:var(--red); font-weight:600;" onclick="handleRemoveAvatarPhoto()">🗑️ Quitar foto y volver al emoji</button>` : ""}
        </div>
        <div class="field">
          <label>Portada del perfil</label>
          <div id="coverPositionPreview"
            style="border-radius:10px;overflow:hidden;height:105px;background:${currentProfile.cover_url ? `url('${escapeHtml(currentProfile.cover_url)}') center ${Number(currentProfile.cover_position_y ?? 50)}%/cover no-repeat` : "var(--panel-2)"};margin-bottom:10px;border:1px solid var(--border);">
          </div>

          ${currentProfile.cover_url ? `
            <div style="margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:5px;">
                <span style="font-size:11px;color:var(--text-dim);">Acomodar imagen</span>
                <span id="coverPositionValue" class="mono" style="font-size:10px;color:var(--gold);">${Number(currentProfile.cover_position_y ?? 50)}%</span>
              </div>
              <input type="range" id="coverPositionRange" min="0" max="100" step="1"
                value="${Number(currentProfile.cover_position_y ?? 50)}"
                oninput="previewCoverPosition(this.value)"
                style="width:100%;">
              <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-dim);margin-top:2px;"><span>Arriba</span><span>Abajo</span></div>
            </div>` : ""}

          <input type="file" id="coverPhotoInput" accept="image/*" onchange="handleCoverPhotoUpload()" style="display:none;">
          <div class="ls-android-media-actions">
            <button type="button" class="btn-outline" onclick="openLiveScrollAndroidMedia('files','coverPhotoInput','elegir la portada de tu perfil','files')">📁 Elegir portada</button>
            <button type="button" class="btn-outline" onclick="openLiveScrollAndroidMedia('camera','coverPhotoInput','tomar una foto para tu portada','camera')">📷 Usar cámara</button>
          </div>
          <div id="coverUploadStatus" style="font-size:11px; color:var(--text-dim); margin-top:6px;">Máximo 5MB. Después podés elegir qué parte de la foto se ve.</div>
          ${currentProfile.cover_url ? `<button type="button" class="btn-outline" style="margin-top:10px; padding:9px 14px; font-size:13px; width:100%; color:var(--red); border-color:var(--red); font-weight:600;" onclick="handleRemoveCoverPhoto()">🗑️ Quitar portada</button>` : ""}
        </div>
        <div class="field">
          <label>Imagen de fondo del perfil</label>
          <div style="
            position:relative;
            height:150px;
            border-radius:12px;
            overflow:hidden;
            background:var(--panel-2);
            margin-bottom:10px;
            border:1px solid var(--border);
          ">
            ${currentProfile.profile_side_image_url
              ? `
                <img
                  src="${escapeHtml(currentProfile.profile_side_image_url)}"
                  alt="Fondo decorativo"
                  style="
                    width:100%;
                    height:100%;
                    object-fit:cover;
                    object-position:center top;
                    opacity:0.55;
                  "
                >
                <div style="position:absolute; inset:0; background:linear-gradient(90deg, rgba(13,16,20,.9), rgba(13,16,20,.2));"></div>
                <div style="position:absolute; left:12px; bottom:10px; font-size:12px; color:#fff; font-weight:600;">Vista previa · queda detrás del contenido</div>
              `
              : `
                <div style="height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-size:12px; text-align:center; padding:16px;">
                  Subí una imagen vertical o temática.<br>Se mostrará detrás del contenido, no reemplaza la portada.
                </div>
              `}
          </div>
          <input
            type="file"
            id="profileSideImageInput"
            accept="image/*"
            onchange="handleProfileSideImageUpload()"
            style="display:none;"
          >
          <div class="ls-android-media-actions">
            <button type="button" class="btn-outline" onclick="openLiveScrollAndroidMedia('files','profileSideImageInput','elegir la imagen de fondo de tu perfil','files')">📁 Elegir imagen</button>
            <button type="button" class="btn-outline" onclick="openLiveScrollAndroidMedia('camera','profileSideImageInput','tomar una foto para el fondo de tu perfil','camera')">📷 Usar cámara</button>
          </div>
          <div id="profileSideImageStatus" style="font-size:11px; color:var(--text-dim); margin-top:6px;">
            Máximo 5MB. Recomendado: imagen vertical. Se usa como fondo decorativo en segundo plano.
          </div>
          ${currentProfile.profile_side_image_url
            ? `<button type="button" class="btn-outline" style="margin-top:10px; padding:9px 14px; font-size:13px; width:100%; color:var(--red); border-color:var(--red); font-weight:600;" onclick="handleRemoveProfileSideImage()">🗑️ Quitar imagen de fondo</button>`
            : ""}
        </div>

        <div class="field">
          <label>Avatar (si no tenés foto)</label>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${emojis.map(e => `<button onclick="selectAvatarEmoji('${e}')" id="emoji-${e}" style="font-size:20px; padding:8px; background:${e === currentProfile.avatar_emoji ? "var(--panel-2)" : "transparent"}; border:1px solid var(--border); border-radius:8px; cursor:pointer;">${e}</button>`).join("")}
          </div>
        </div>
        <div class="field">
          <label>Nombre de usuario</label>
          <input type="text" id="editUsername" value="${escapeHtml(currentProfile.username)}">
        </div>
        <div class="field">
          <label>Bio (opcional)</label>
          <input type="text" id="editBio" value="${escapeHtml(currentProfile.bio || "")}" placeholder="Contá algo sobre vos" maxlength="120">
        </div>
        <div class="field">
          <label>Mis redes (opcional)</label>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; align-items:center; gap:8px;"><span>🩷</span><input type="text" id="socialInstagram" value="${escapeHtml(currentProfile.social_instagram || "")}" placeholder="Link de tu Instagram" style="flex:1;"></div>
            ${isCreator ? `
              <div class="ls-connected-social-primary"><span>🟢</span><div id="streamConnectionKick" style="flex:1;"></div></div>
              <details class="ls-social-secondary-link"><summary>Enlace alternativo de Kick (opcional)</summary><input type="text" id="socialKick" value="${escapeHtml(currentProfile.social_kick || "")}" placeholder="Solo si querés usar otro enlace"></details>
              <div class="ls-connected-social-primary"><span>🟣</span><div id="streamConnectionTwitch" style="flex:1;"></div></div>
              <details class="ls-social-secondary-link"><summary>Enlace alternativo de Twitch (opcional)</summary><input type="text" id="socialTwitch" value="${escapeHtml(currentProfile.social_twitch || "")}" placeholder="Solo si querés usar otro enlace"></details>
              <div style="display:flex; align-items:center; gap:8px;"><span>🔴</span><input type="text" id="socialYoutube" value="${escapeHtml(currentProfile.social_youtube || "")}" placeholder="Link de tu YouTube" style="flex:1;"></div>
              <div style="display:flex; align-items:center; gap:8px;"><span>⚫</span><input type="text" id="socialTiktok" value="${escapeHtml(currentProfile.social_tiktok || "")}" placeholder="Link de tu TikTok" style="flex:1;"></div>
              <button type="button" id="tiktokLiveToggle" class="${currentProfile.tiktok_is_live ? "btn" : "btn-outline"}" onclick="toggleTikTokLive()" style="width:100%;">${currentProfile.tiktok_is_live ? "■ Finalizar directo de TikTok" : "🔴 Estoy en vivo por TikTok"}</button>
              <div style="font-size:10px;color:var(--text-dim);">TikTok se desactiva automáticamente después de 4 horas si olvidás finalizarlo.</div>
            ` : `
              <div style="padding:12px;border:1px solid var(--border);border-radius:10px;background:var(--panel-2);">
                <div style="font-size:14px;font-weight:800;margin-bottom:8px;">🔒 Kick, Twitch, YouTube y TikTok</div>
                <div style="font-size:12px;color:var(--text-dim);line-height:1.55;margin-bottom:10px;">
                  Para habilitar estas redes necesitás ser Creador: 5 videos, una cuenta de 7 días y no tener sanciones.
                </div>
                ${creatorStatus === "pending"
                  ? `<button type="button" class="btn-outline" disabled style="width:100%;">⏳ Solicitud en revisión</button>`
                  : `<button type="button" class="btn-outline" onclick="requestCreatorAccess()" ${creatorRequirementsMet ? "" : "disabled"} style="width:100%;">🎬 Solicitar acceso como creador</button>`}
                <div style="font-size:11px;color:${creatorRequirementsMet ? "var(--green)" : "var(--text-dim)"};margin-top:8px;">
                  Videos: ${currentProfile.creator_video_count}/5 · Antigüedad: ${currentProfile.creator_account_days}/7 días
                </div>
              </div>
            `}
          </div>
        </div>
        <div id="editProfileError" class="error-msg"></div>
        <div style="border-top:1px solid var(--border); margin-top:16px; padding-top:16px;">
          <button class="btn-outline" style="width:100%;" onclick="openChangePassword()">🔒 Cambiar contraseña</button>
        </div>
        </div>
        <div class="modal-box-footer ls-profile-edit-footer" style="display:flex;gap:10px;position:sticky;bottom:0;z-index:6;background:var(--panel);border-top:1px solid var(--border);">
          <button class="btn-outline" style="flex:1;min-height:48px;" onclick="closeManagedModal()">Cancelar</button>
          <button class="btn" style="flex:1;min-height:48px;" onclick="saveProfileEdits()">Guardar</button>
        </div>
      </div>
    </div>`;
  window.selectedAvatarEmoji = currentProfile.avatar_emoji || "🎬";
  if (isCreator) setTimeout(loadStreamAccountConnectionStatus, 0);
}

function streamConnectionEntry(payload, provider) {
  const direct = payload?.[provider];
  if (direct && typeof direct === "object") return direct;
  const list = payload?.connections || payload?.data || [];
  if (Array.isArray(list)) return list.find(item => String(item?.provider || "").toLowerCase() === provider) || null;
  return null;
}

const lsStreamConnections = { kick:null, twitch:null };

function lsConnectionProfileUrl(connection, provider) {
  const directUrl = connection?.profile_url || connection?.channel_url || connection?.url || "";
  if (isSafeUrl(directUrl)) return directUrl;
  const username = String(connection?.provider_username || connection?.username || connection?.display_name || "")
    .trim()
    .replace(/^@/, "");
  if (!/^[a-zA-Z0-9_.-]{2,50}$/.test(username)) return "";
  return provider === "twitch"
    ? `https://www.twitch.tv/${encodeURIComponent(username)}`
    : `https://kick.com/${encodeURIComponent(username)}`;
}

function lsGetConnectedStreamProfileUrl(provider) {
  const connection = lsStreamConnections[provider];
  if (!connection || connection.connected === false || connection.is_connected === false) return "";
  const url = lsConnectionProfileUrl(connection, provider);
  return isSafeUrl(url) ? url : "";
}

async function syncConnectedStreamProfileUrls() {
  if (!currentUser?.id || !currentProfile) return;
  const updates = {};
  const kickUrl = lsGetConnectedStreamProfileUrl("kick");
  const twitchUrl = lsGetConnectedStreamProfileUrl("twitch");
  if (kickUrl && kickUrl !== currentProfile.social_kick) updates.social_kick = kickUrl;
  if (twitchUrl && twitchUrl !== currentProfile.social_twitch) updates.social_twitch = twitchUrl;
  if (!Object.keys(updates).length) return;

  const { error } = await sb.from("profiles").update(updates).eq("id", currentUser.id);
  if (error) {
    console.warn("No se pudo sincronizar el enlace de la cuenta conectada:", error.message);
    return;
  }
  Object.assign(currentProfile, updates);
  Object.entries(updates).forEach(([key, value]) => {
    const input = document.getElementById(key === "social_kick" ? "socialKick" : "socialTwitch");
    if (input && !input.value) input.value = value;
  });
}

function renderStreamConnectionControl(provider, connection) {
  const host = document.getElementById(`streamConnection${provider === "twitch" ? "Twitch" : "Kick"}`);
  if (!host) return;
  const label = provider === "twitch" ? "Twitch" : "Kick";
  const connected = !!connection && connection.connected !== false && connection.is_connected !== false;
  const username = connection?.provider_username || connection?.username || connection?.display_name || "";
  host.innerHTML = connected
    ? `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border:1px solid var(--border);border-radius:9px;background:var(--panel-2);">
         <span style="font-size:11px;color:var(--green);font-weight:800;">✓ ${label} conectado${username ? ` · @${escapeHtml(username)}` : ""}</span>
         <button type="button" class="btn-outline" style="padding:6px 9px;font-size:11px;" onclick="disconnectStreamAccount('${provider}')">Desconectar</button>
       </div>`
    : `<button type="button" class="btn-outline" style="width:100%;padding:8px 10px;font-size:12px;" onclick="connectStreamAccount('${provider}')">Conectar cuenta de ${label}</button>`;
}

async function loadStreamAccountConnectionStatus() {
  ["kick", "twitch"].forEach(provider => {
    const host = document.getElementById(`streamConnection${provider === "twitch" ? "Twitch" : "Kick"}`);
    if (host) host.innerHTML = `<span style="font-size:11px;color:var(--text-dim);">Comprobando conexión…</span>`;
  });
  const { data, error } = await sb.functions.invoke("stream-account-connect", { body:{ action:"status" } });
  if (error || data?.ok === false) {
    lsStreamConnections.kick = null;
    lsStreamConnections.twitch = null;
    ["kick", "twitch"].forEach(provider => renderStreamConnectionControl(provider, null));
    return;
  }
  lsStreamConnections.kick = streamConnectionEntry(data, "kick");
  lsStreamConnections.twitch = streamConnectionEntry(data, "twitch");
  renderStreamConnectionControl("kick", lsStreamConnections.kick);
  renderStreamConnectionControl("twitch", lsStreamConnections.twitch);
  await syncConnectedStreamProfileUrls();
}

async function connectStreamAccount(provider) {
  if (!currentUser) { showToast("Primero iniciá sesión en LiveScroll"); return; }
  showToast(`Abriendo ${provider === "twitch" ? "Twitch" : "Kick"}…`);
  const { data, error } = await sb.functions.invoke("stream-account-connect", {
    body:{ action:"start", provider }
  });
  const authorizationUrl = data?.authorization_url || data?.url;
  if (error || data?.ok === false || !authorizationUrl) {
    showToast(data?.error || "No se pudo iniciar la conexión");
    return;
  }
  localStorage.setItem("ls_stream_oauth_pending", provider);
  window.location.assign(authorizationUrl);
}

async function disconnectStreamAccount(provider) {
  const label = provider === "twitch" ? "Twitch" : "Kick";
  if (!confirm(`¿Desconectar tu cuenta de ${label}?`)) return;
  const { data, error } = await sb.functions.invoke("stream-account-connect", {
    body:{ action:"disconnect", provider }
  });
  if (error || data?.ok === false) {
    showToast(data?.error || "No se pudo desconectar la cuenta");
    return;
  }
  showToast(`${label} desconectado`);
  lsStreamConnections[provider] = null;
  loadStreamAccountConnectionStatus();
}

async function finishPendingStreamOAuth() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");
  const provider = localStorage.getItem("ls_stream_oauth_pending");
  if (!code || !state || !provider) return;

  let attempts = 0;
  const waitForSession = setInterval(async () => {
    attempts++;
    if (!currentUser && attempts < 40) return;
    clearInterval(waitForSession);
    if (!currentUser) {
      showToast("Iniciá sesión en LiveScroll para completar la conexión");
      return;
    }
    const { data, error } = await sb.functions.invoke("stream-account-connect", {
      body:{ action:"callback", provider, code, state }
    });
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("code");
    cleanUrl.searchParams.delete("state");
    cleanUrl.searchParams.delete("scope");
    history.replaceState({}, document.title, cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
    localStorage.removeItem("ls_stream_oauth_pending");
    if (error || data?.ok === false) {
      showToast(data?.error || "No se pudo conectar la cuenta");
      return;
    }
    showToast(`✓ Cuenta de ${provider === "twitch" ? "Twitch" : "Kick"} conectada`);
    if (data?.profile_url && currentProfile) {
      const profileKey = provider === "twitch" ? "social_twitch" : "social_kick";
      currentProfile[profileKey] = data.profile_url;
      await sb.from("profiles").update({ [profileKey]:data.profile_url }).eq("id", currentUser.id);
    }
    await loadStreamAccountConnectionStatus();
  }, 250);
}

window.connectStreamAccount = connectStreamAccount;
window.disconnectStreamAccount = disconnectStreamAccount;
window.loadStreamAccountConnectionStatus = loadStreamAccountConnectionStatus;
setTimeout(finishPendingStreamOAuth, 0);

function openChangePassword() {
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="ls-modal-locked" data-modal-locked="1" style="position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:110; display:flex; align-items:center; justify-content:center; padding:20px;">
      <div class="auth-box" style="margin:0;">
        <h2>Cambiar contraseña</h2>
        <div class="field">
          <label>Nueva contraseña</label>
          <div class="password-field-wrap">
            <input type="password" id="changePasswordInput" placeholder="••••••••">
            <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('changePasswordInput', this)">👁</button>
          </div>
        </div>
        <div style="display:flex;gap:9px;">
          <button class="btn-outline" style="flex:1;" onclick="closeManagedModal()">Cancelar</button>
          <button class="btn" style="flex:1;" onclick="submitChangePassword()">Guardar</button>
        </div>
        <div id="changePasswordError" class="error-msg"></div>
      </div>
    </div>`;
}

async function submitChangePassword() {
  const password = document.getElementById("changePasswordInput").value;
  const errEl = document.getElementById("changePasswordError");
  if (!password || password.length < 8) {
    errEl.textContent = "La contraseña tiene que tener al menos 8 caracteres.";
    return;
  }

  const { error } = await sb.auth.updateUser({ password });
  if (error) { errEl.textContent = error.message; return; }

  openEditProfile();
  showToast("Contraseña actualizada");
}

async function handleAvatarPhotoUpload() {
  const fileInput = document.getElementById("avatarPhotoInput");
  const file = fileInput.files[0];
  const statusEl = document.getElementById("avatarUploadStatus");
  if (!file) return;

  if (!file.type.startsWith("image/")) { statusEl.textContent = "Tiene que ser una imagen."; statusEl.style.color = "var(--red)"; return; }
  if (file.size > 3 * 1024 * 1024) { statusEl.textContent = "El archivo supera los 3MB."; statusEl.style.color = "var(--red)"; return; }

  statusEl.textContent = "Subiendo...";
  statusEl.style.color = "var(--text-dim)";

  const ext = file.name.split(".").pop().replace(/[^a-zA-Z0-9]/g, "");
  const path = `${currentUser.id}/avatar.${ext}`;

  const { error: uploadError } = await sb.storage.from("avatars").upload(path, file, { cacheControl: "3600", upsert: true });
  if (uploadError) { statusEl.textContent = "Error al subir: " + uploadError.message; statusEl.style.color = "var(--red)"; return; }

  const { data: publicUrlData } = sb.storage.from("avatars").getPublicUrl(path);
  const freshUrl = publicUrlData.publicUrl + "?t=" + Date.now(); // evita que quede una versión vieja en caché

  const { error: updateError } = await sb.from("profiles").update({ avatar_url: freshUrl }).eq("id", currentUser.id);
  if (updateError) { statusEl.textContent = "No se pudo guardar."; statusEl.style.color = "var(--red)"; return; }

  currentProfile.avatar_url = freshUrl;
  showToast("¡Foto de perfil actualizada!");
  openEditProfile();
}

async function handleRemoveAvatarPhoto() {
  const { error } = await sb.from("profiles").update({ avatar_url: null }).eq("id", currentUser.id);
  if (error) { showToast("No se pudo quitar la foto"); return; }
  currentProfile.avatar_url = null;
  showToast("Foto quitada, volviste al emoji");
  openEditProfile();
}


function previewCoverPosition(value) {
  const y = Math.max(0, Math.min(100, Number(value) || 50));
  const preview = document.getElementById("coverPositionPreview");
  const label = document.getElementById("coverPositionValue");

  if (preview && currentProfile.cover_url) {
    preview.style.backgroundPosition = `center ${y}%`;
  }
  if (label) label.textContent = `${y}%`;
}

async function handleCoverPhotoUpload() {
  const fileInput = document.getElementById("coverPhotoInput");
  const file = fileInput.files[0];
  const statusEl = document.getElementById("coverUploadStatus");
  if (!file) return;

  if (!file.type.startsWith("image/")) { statusEl.textContent = "Tiene que ser una imagen."; statusEl.style.color = "var(--red)"; return; }
  if (file.size > 5 * 1024 * 1024) { statusEl.textContent = "El archivo supera los 5MB."; statusEl.style.color = "var(--red)"; return; }

  statusEl.textContent = "Subiendo...";
  statusEl.style.color = "var(--text-dim)";

  const ext = file.name.split(".").pop().replace(/[^a-zA-Z0-9]/g, "");
  const path = `${currentUser.id}/cover.${ext}`;

  const { error: uploadError } = await sb.storage.from("avatars").upload(path, file, { cacheControl: "3600", upsert: true });
  if (uploadError) { statusEl.textContent = "Error al subir: " + uploadError.message; statusEl.style.color = "var(--red)"; return; }

  const { data: publicUrlData } = sb.storage.from("avatars").getPublicUrl(path);
  const freshUrl = publicUrlData.publicUrl + "?t=" + Date.now();

  const { error: updateError } = await sb.from("profiles").update({ cover_url: freshUrl, cover_position_y: 50 }).eq("id", currentUser.id);
  if (updateError) { statusEl.textContent = "No se pudo guardar."; statusEl.style.color = "var(--red)"; return; }

  currentProfile.cover_url = freshUrl;
  currentProfile.cover_position_y = 50;
  showToast("¡Portada actualizada! Ahora podés acomodarla.");
  openEditProfile();
}

async function handleRemoveCoverPhoto() {
  const { error } = await sb.from("profiles").update({ cover_url: null }).eq("id", currentUser.id);
  if (error) { showToast("No se pudo quitar la portada"); return; }
  currentProfile.cover_url = null;
  showToast("Portada quitada");
  openEditProfile();
}


async function handleProfileSideImageUpload() {
  const fileInput = document.getElementById("profileSideImageInput");
  const file = fileInput?.files?.[0];
  const statusEl = document.getElementById("profileSideImageStatus");
  if (!file || !statusEl) return;

  if (!file.type.startsWith("image/")) {
    statusEl.textContent = "Tiene que ser una imagen.";
    statusEl.style.color = "var(--red)";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    statusEl.textContent = "El archivo supera los 5MB.";
    statusEl.style.color = "var(--red)";
    return;
  }

  statusEl.textContent = "Subiendo...";
  statusEl.style.color = "var(--text-dim)";

  const ext = file.name.split(".").pop().replace(/[^a-zA-Z0-9]/g, "") || "jpg";
  const path = `${currentUser.id}/profile-background.${ext}`;

  const { error: uploadError } = await sb.storage
    .from("avatars")
    .upload(path, file, { cacheControl: "3600", upsert: true });

  if (uploadError) {
    statusEl.textContent = "Error al subir: " + uploadError.message;
    statusEl.style.color = "var(--red)";
    return;
  }

  const { data: publicUrlData } = sb.storage.from("avatars").getPublicUrl(path);
  const freshUrl = publicUrlData.publicUrl + "?t=" + Date.now();

  const { error: updateError } = await sb
    .from("profiles")
    .update({ profile_side_image_url: freshUrl })
    .eq("id", currentUser.id);

  if (updateError) {
    statusEl.textContent = "No se pudo guardar.";
    statusEl.style.color = "var(--red)";
    return;
  }

  currentProfile.profile_side_image_url = freshUrl;
  showToast("¡Fondo del perfil actualizado!");
  openEditProfile();
}

async function handleRemoveProfileSideImage() {
  const { error } = await sb
    .from("profiles")
    .update({ profile_side_image_url: null })
    .eq("id", currentUser.id);

  if (error) {
    showToast("No se pudo quitar la imagen de fondo");
    return;
  }

  currentProfile.profile_side_image_url = null;
  showToast("Imagen de fondo quitada");
  openEditProfile();
}

function selectAvatarEmoji(emoji) {
  window.selectedAvatarEmoji = emoji;
  document.querySelectorAll("[id^='emoji-']").forEach(b => b.style.background = "transparent");
  document.getElementById(`emoji-${emoji}`).style.background = "var(--panel-2)";
}

async function requestCreatorAccess() {
  const { data, error } = await sb.rpc("request_creator_access");
  if (error || !data?.ok) {
    const messages = {
      videos_insuficientes:"Necesitás publicar al menos 5 videos.",
      cuenta_muy_nueva:"Tu cuenta debe tener al menos 7 días.",
      cuenta_sancionada:"No podés postularte mientras tengas una sanción.",
      solicitud_pendiente:"Tu solicitud ya está en revisión.",
      ya_es_creador:"Tu cuenta ya es Creador."
    };
    showToast(messages[data?.error] || "No se pudo enviar la solicitud");
    return;
  }
  currentProfile.creator_application_status = "pending";
  showToast("🎬 Solicitud enviada al administrador");
  openEditProfile();
}

async function toggleTikTokLive() {
  if (!currentProfile?.is_creator) { showToast("Esta opción es solo para Creadores"); return; }
  const url = document.getElementById("socialTiktok")?.value.trim() || currentProfile.social_tiktok || "";
  if (!currentProfile.tiktok_is_live && !getTikTokProfileUrl(url)) {
    showToast("Primero agregá el enlace de tu perfil de TikTok");
    return;
  }
  const activate = !currentProfile.tiktok_is_live;
  const button = document.getElementById("tiktokLiveToggle");
  if (button) button.disabled = true;
  const { data, error } = await sb.rpc("set_my_tiktok_live", { p_live:activate, p_profile_url:url || null });
  if (error || data?.ok === false) {
    if (button) button.disabled = false;
    showToast(data?.error === "invalid_tiktok_url" ? "El enlace de TikTok no es válido" : "No se pudo actualizar el directo de TikTok");
    return;
  }
  currentProfile.tiktok_is_live = activate;
  if (url) currentProfile.social_tiktok = url;
  showToast(activate ? "🔴 Tu directo de TikTok ya aparece en Directos" : "Directo de TikTok finalizado");
  openEditProfile();
}

async function saveProfileEdits() {
  const newUsername = document.getElementById("editUsername").value.trim();
  const bio = document.getElementById("editBio").value.trim();
  const errEl = document.getElementById("editProfileError");

  if (newUsername !== currentProfile.username) {
    const { data, error } = await sb.rpc("update_username", { p_user_id: currentUser.id, p_new_username: newUsername });
    if (error || !data.ok) {
      errEl.textContent = data?.error === "nombre_ocupado" ? "Ese nombre de usuario ya está en uso." : "El nombre tiene que tener al menos 3 caracteres.";
      return;
    }
    currentProfile.username = newUsername;
  }

  const coverPositionEl = document.getElementById("coverPositionRange");
  const coverPositionY = coverPositionEl ? Math.max(0, Math.min(100, Number(coverPositionEl.value) || 50)) : Number(currentProfile.cover_position_y ?? 50);

  const kickEl = document.getElementById("socialKick");
  const twitchEl = document.getElementById("socialTwitch");
  const youtubeEl = document.getElementById("socialYoutube");
  const tiktokEl = document.getElementById("socialTiktok");
  const socialPayload = {
    social_instagram:document.getElementById("socialInstagram").value.trim() || null
  };
  if (currentProfile.is_creator) {
    socialPayload.social_kick = lsGetConnectedStreamProfileUrl("kick") || kickEl?.value.trim() || null;
    socialPayload.social_twitch = lsGetConnectedStreamProfileUrl("twitch") || twitchEl?.value.trim() || null;
    socialPayload.social_youtube = youtubeEl?.value.trim() || null;
    socialPayload.social_tiktok = tiktokEl?.value.trim() || null;
  }

  const invalidSocial = Object.entries(socialPayload).find(([, value]) => value && !isSafeUrl(value));
  if (invalidSocial) {
    errEl.textContent = "Los enlaces de redes deben comenzar con https:// o http://";
    return;
  }
  if (socialPayload.social_kick && !getKickChannelFromUrl(socialPayload.social_kick)) {
    errEl.textContent = "El enlace alternativo de Kick debe pertenecer a kick.com.";
    return;
  }
  if (socialPayload.social_twitch && !getTwitchChannelFromUrl(socialPayload.social_twitch)) {
    errEl.textContent = "El enlace alternativo de Twitch debe pertenecer a twitch.tv.";
    return;
  }

  const { error: updateError } = await sb.from("profiles").update({
    bio,
    avatar_emoji: window.selectedAvatarEmoji,
    cover_position_y: coverPositionY,
    ...socialPayload
  }).eq("id", currentUser.id);

  if (updateError) { errEl.textContent = "No se pudo guardar."; return; }

  currentProfile.bio = bio;
  currentProfile.avatar_emoji = window.selectedAvatarEmoji;
  currentProfile.cover_position_y = coverPositionY;
  if (currentProfile.is_creator) {
    currentProfile.social_kick = socialPayload.social_kick || "";
    currentProfile.social_twitch = socialPayload.social_twitch || "";
    currentProfile.social_youtube = youtubeEl?.value.trim() || "";
    currentProfile.social_tiktok = tiktokEl?.value.trim() || "";
  }
  currentProfile.social_instagram = document.getElementById("socialInstagram").value.trim();
  closeManagedModal();
  showToast("Perfil actualizado");
  renderProfile();
}

function openLiveScroll590AdminPreview() {
  if (!currentProfile?.is_admin) {
    showToast("Esta prueba está disponible solo para administradores");
    return;
  }

  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked" data-modal-locked="1" style="z-index:9998;padding:0;background:#000;">
      <button
        type="button"
        aria-label="Cerrar previsualización"
        onclick="closeLiveScroll590AdminPreview()"
        style="position:fixed;z-index:10002;top:max(14px,env(safe-area-inset-top));left:max(14px,env(safe-area-inset-left));width:42px;height:42px;border:1px solid rgba(255,255,255,.24);border-radius:50%;background:rgba(5,6,8,.82);color:#fff;font-size:20px;cursor:pointer;backdrop-filter:blur(10px);"
      >✕</button>
      <iframe
        title="Prueba privada ROAD TO 5.9"
        src="PREVIEW-INTRO-LIVESCROLL-6.html?v=5.8.9-road-to-59"
        allow="autoplay"
        style="display:block;width:100%;height:100%;height:100dvh;border:0;background:#050608;"
      ></iframe>
    </div>`;
}

function closeLiveScroll590AdminPreview() {
  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";
}

window.openLiveScroll590AdminPreview = openLiveScroll590AdminPreview;
window.closeLiveScroll590AdminPreview = closeLiveScroll590AdminPreview;

async function loadAdminPendingVideoReports() {
  const rpcResult = await sb.rpc("admin_get_pending_video_reports");
  if (!rpcResult?.error && rpcResult?.data?.ok) {
    const reports = Array.isArray(rpcResult.data.reports) ? rpcResult.data.reports : [];
    return {
      data:reports.map(r => ({
        ...r,
        videos:{ title:r.video_title || null, video_url:r.video_url || null },
        profiles:{ username:r.reporter_username || null }
      })),
      error:null
    };
  }

  // Respaldo compatible con instalaciones donde la función nueva todavía no
  // fue ejecutada. Evita depender del nombre interno de una clave foránea.
  const rawResult = await sb.from("video_reports")
    .select("*")
    .order("created_at", { ascending:true });

  if (rawResult.error) return { data:[], error:rawResult.error };

  const closedStatuses = new Set(["dismissed", "resolved", "closed", "rejected", "descartado", "resuelto", "cerrado"]);
  const rawReports = (rawResult.data || []).filter(r =>
    !closedStatuses.has(String(r.status || "pending").toLowerCase())
  );
  const videoIds = [...new Set(rawReports.map(r => r.video_id).filter(Boolean))];
  const reporterIds = [...new Set(rawReports.map(r => r.reporter_id).filter(Boolean))];

  const [videosResult, profilesResult] = await Promise.all([
    videoIds.length
      ? sb.from("videos").select("id,title,video_url").in("id", videoIds)
      : Promise.resolve({ data:[], error:null }),
    reporterIds.length
      ? sb.from("profiles").select("id,username").in("id", reporterIds)
      : Promise.resolve({ data:[], error:null })
  ]);

  const videosById = Object.fromEntries((videosResult.data || []).map(v => [v.id, v]));
  const profilesById = Object.fromEntries((profilesResult.data || []).map(p => [p.id, p]));

  return {
    data:rawReports.map(r => ({
      ...r,
      videos:videosById[r.video_id] || null,
      profiles:profilesById[r.reporter_id] || null
    })),
    error:null
  };
}

const LS_FINANCE_LAB_KEY = "livescroll6_finance_lab_v1";

function getFinanceLabState() {
  const empty = {
    userCoins:0,
    creatorPending:0,
    creatorAvailable:0,
    liveScrollGross:0,
    collectedArs:0,
    movements:[]
  };
  try {
    const saved = JSON.parse(localStorage.getItem(LS_FINANCE_LAB_KEY) || "null");
    return saved && typeof saved === "object" ? { ...empty, ...saved } : empty;
  } catch (_) {
    return empty;
  }
}

function saveFinanceLabState(state) {
  localStorage.setItem(LS_FINANCE_LAB_KEY, JSON.stringify(state));
}

function addFinanceLabMovement(state, type, detail, amount, tone="normal") {
  state.movements.unshift({
    id:`lab-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    detail,
    amount,
    tone,
    createdAt:new Date().toISOString()
  });
  state.movements = state.movements.slice(0, 20);
}

function simulateFinanceLabPurchase() {
  if (!currentProfile?.is_admin) return;
  const state = getFinanceLabState();
  state.collectedArs += 10000;
  state.userCoins += 10000;
  addFinanceLabMovement(state, "COMPRA SIMULADA", "Usuario de prueba compró 10.000 monedas", 10000, "green");
  saveFinanceLabState(state);
  showToast("Compra ficticia agregada: 10.000 monedas");
  renderAdmin();
}

function simulateFinanceLabGift() {
  if (!currentProfile?.is_admin) return;
  const state = getFinanceLabState();
  if (state.userCoins < 5000) {
    showToast("Primero simulá una compra de monedas");
    return;
  }
  state.userCoins -= 5000;
  state.creatorPending += 3500;
  state.liveScrollGross += 1500;
  addFinanceLabMovement(state, "REGALO SIMULADO", "Regalo de 5.000 monedas · 70% creador / 30% LiveScroll", 5000, "gold");
  saveFinanceLabState(state);
  showToast("Regalo ficticio enviado: $3.500 quedaron pendientes para el creador");
  renderAdmin();
}

function simulateFinanceLabRelease() {
  if (!currentProfile?.is_admin) return;
  const state = getFinanceLabState();
  if (state.creatorPending <= 0) {
    showToast("No hay saldo pendiente para liberar");
    return;
  }
  const released = state.creatorPending;
  state.creatorPending = 0;
  state.creatorAvailable += released;
  addFinanceLabMovement(state, "SALDO LIBERADO", "Terminó el plazo ficticio de seguridad", released, "blue");
  saveFinanceLabState(state);
  showToast("Saldo ficticio disponible para el creador");
  renderAdmin();
}

function resetFinanceLab() {
  if (!currentProfile?.is_admin) return;
  if (!confirm("¿Reiniciar completamente el laboratorio financiero?")) return;
  localStorage.removeItem(LS_FINANCE_LAB_KEY);
  showToast("Laboratorio financiero reiniciado");
  renderAdmin();
}

function renderAdminFinancialLab() {
  if (!currentProfile?.is_admin || isLiveScroll7App()) return "";
  const state = getFinanceLabState();
  const money = value => Number(value || 0).toLocaleString("es-AR");
  return `
    <h3 style="margin-top:24px;">🧪 Centro Financiero Experimental</h3>
    <div class="form-card ls-finance-lab" style="margin-bottom:14px;border-color:rgba(250,204,21,.34);background:linear-gradient(145deg,rgba(250,204,21,.07),rgba(59,130,246,.045));">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:14px;">
        <div>
          <div style="font-weight:900;color:var(--gold);letter-spacing:.02em;">LABORATORIO PRIVADO · SOLO ADMIN</div>
          <div style="font-size:12px;color:var(--text-dim);line-height:1.5;margin-top:5px;max-width:680px;">
            Sistema experimental. Los saldos son ficticios, no poseen valor monetario y no pueden canjearse por dinero.
          </div>
        </div>
        <span style="padding:5px 9px;border:1px solid rgba(250,204,21,.32);border-radius:999px;color:var(--gold);font-size:9px;font-weight:900;">MODO PRUEBA</span>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:9px;margin-bottom:14px;">
        <div class="form-card" style="margin:0;padding:12px;"><div style="font-size:10px;color:var(--text-dim);">Cobrado ficticio</div><strong class="mono" style="font-size:18px;">$${money(state.collectedArs)}</strong></div>
        <div class="form-card" style="margin:0;padding:12px;"><div style="font-size:10px;color:var(--text-dim);">Monedas del usuario</div><strong class="mono" style="font-size:18px;color:var(--gold);">${money(state.userCoins)}</strong></div>
        <div class="form-card" style="margin:0;padding:12px;"><div style="font-size:10px;color:var(--text-dim);">Creador pendiente</div><strong class="mono" style="font-size:18px;color:#fbbf24;">$${money(state.creatorPending)}</strong></div>
        <div class="form-card" style="margin:0;padding:12px;"><div style="font-size:10px;color:var(--text-dim);">Creador disponible</div><strong class="mono" style="font-size:18px;color:#60a5fa;">$${money(state.creatorAvailable)}</strong></div>
        <div class="form-card" style="margin:0;padding:12px;"><div style="font-size:10px;color:var(--text-dim);">LiveScroll bruto</div><strong class="mono" style="font-size:18px;color:var(--green);">$${money(state.liveScrollGross)}</strong></div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px;">
        <button class="btn" onclick="simulateFinanceLabPurchase()">1 · Simular compra $10.000</button>
        <button class="btn-outline" onclick="simulateFinanceLabGift()">2 · Enviar regalo 5.000</button>
        <button class="btn-outline" onclick="simulateFinanceLabRelease()">3 · Liberar saldo pendiente</button>
        <button class="btn-outline" style="color:var(--red);margin-left:auto;" onclick="resetFinanceLab()">Reiniciar</button>
      </div>

      <div style="font-size:11px;font-weight:850;margin-bottom:8px;">Últimos movimientos ficticios</div>
      ${state.movements.length ? state.movements.map(m => `
        <div class="ledger-row" style="gap:10px;align-items:center;">
          <span style="min-width:0;"><strong style="font-size:10px;">${escapeHtml(m.type)}</strong><br><span style="font-size:10px;color:var(--text-dim);">${escapeHtml(m.detail)} · ${new Date(m.createdAt).toLocaleString("es-AR")}</span></span>
          <strong class="mono" style="color:${m.tone === "green" ? "var(--green)" : m.tone === "gold" ? "var(--gold)" : m.tone === "blue" ? "#60a5fa" : "var(--text)"};">${money(m.amount)}</strong>
        </div>
      `).join("") : `<div style="font-size:11px;color:var(--text-dim);padding:10px 0;">Todavía no realizaste movimientos de prueba.</div>`}
    </div>`;
}


async function renderAdmin() {
  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando panel de Admin...</p>`;

  // Estas consultas no dependen entre sí. Las ejecutamos juntas para conservar
  // toda la información del panel sin esperar cada respuesta en cadena.
  const [
    redemptionsResult,
    profilesOverviewResult,
    pendingUsersResult,
    subscriptionsResult,
    plans,
    reportsResult,
    statsResult,
    creatorApplicationsResult,
    securityReportsResult,
    autoVerificationResult
  ] = await Promise.all([
    sb.from("redemptions")
      .select("*, profiles!redemptions_user_id_fkey(username)")
      .order("created_at", { ascending:true }),
    sb.rpc("admin_get_profiles_overview"),
    sb.rpc("admin_get_pending_users"),
    sb.from("subscription_requests")
      .select("*, profiles!subscription_requests_user_id_fkey(username)")
      .order("created_at", { ascending:true }),
    loadPlans(),
    loadAdminPendingVideoReports(),
    sb.rpc("admin_get_stats"),
    sb.rpc("admin_get_creator_applications"),
    sb.rpc("admin_get_security_incident_reports"),
    sb.rpc("admin_get_auto_verification_log", { p_limit:30 })
  ]);

  const { data:redemptions, error } = redemptionsResult;

  if (error) { main.innerHTML = `<p class="error-msg">Error: ${escapeHtml(error.message || "Error desconocido")}</p>`; return; }

  // Vista completa solo para admins: IP y estado de bloqueo de cada cuenta
  const profilesOverview = profilesOverviewResult?.data || [];
  const profileById = {};
  (profilesOverview || []).forEach(p => { profileById[p.id] = p; });

  const ipCounts = {};
  (profilesOverview || []).forEach(p => {
    if (p.signup_ip) ipCounts[p.signup_ip] = (ipCounts[p.signup_ip] || 0) + 1;
  });

  const pending = (redemptions || []).filter(r => r.status === "pending");
  const resolved = (redemptions || []).filter(r => r.status !== "pending").slice(0, 15);

  const pendingUsersFull = pendingUsersResult?.data || [];
  let blockedUsers = (pendingUsersFull && pendingUsersFull.length) ? pendingUsersFull : (profilesOverview || []).filter(p => p.is_blocked);

  const subRequests = subscriptionsResult?.data || [];
  const pendingSubs = (subRequests || []).filter(s => s.status === "pending");

  const reports = reportsResult?.data || [];
  const reportsError = reportsResult?.error || null;
  const stats = statsResult?.data;
  const creatorApplications = creatorApplicationsResult?.data || [];
  const pendingCreatorApplications = (creatorApplications || []).filter(a => a.status === "pending");
  const autoVerificationLog = autoVerificationResult?.data || [];

  // Reportes de seguridad separados del sistema de reportes de videos.
  const securityReports = securityReportsResult?.data || [];
  const pendingSecurityReports = (securityReports || []).filter(r =>
    ["pending", "reviewing", "recovery_authorized"].includes(r.status)
  );

  main.innerHTML = `
    <h1 class="page-title">🛠 Panel de Admin</h1>

    <div class="form-card" style="margin-bottom:18px;border-color:rgba(250,204,21,.32);background:linear-gradient(135deg,rgba(250,204,21,.09),rgba(59,130,246,.055));overflow:hidden;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;">
        <div style="min-width:0;flex:1;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:7px;">
            <strong style="color:var(--gold);">${isLiveScroll7App() ? "◈ Bienvenida oficial LiveScroll 7" : "✨ Presentación ROAD TO 6"}</strong>
            <span style="padding:3px 7px;border:1px solid rgba(250,204,21,.3);border-radius:999px;color:var(--gold);font-size:9px;font-weight:900;letter-spacing:.08em;">${isLiveScroll7App() ? "7.0.0v" : "5.9.0"}</span>
          </div>
          <div style="color:var(--text-dim);font-size:12px;line-height:1.5;">${isLiveScroll7App() ? "Reproducí nuevamente la entrada visual de esta primera etapa para Android." : "Volvé a reproducir la presentación oficial que reciben los usuarios."}</div>
        </div>
        <button class="btn" type="button" onclick="${isLiveScroll7App() ? "replayLiveScroll7Pulse()" : "replayLiveScrollRoadTo6Intro()"}">▶ Volver a verla</button>
      </div>
    </div>

    ${stats && !stats.error ? `
    <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:10px; margin-bottom:24px;">
      <div class="form-card"><div style="font-size:11px;color:var(--text-dim);">Usuarios totales</div><div class="mono" style="font-size:20px;">${stats.total_users}</div></div>
      <div class="form-card"><div style="font-size:11px;color:var(--text-dim);">Verificados</div><div class="mono" style="font-size:20px;color:var(--green);">${stats.verified_users}</div></div>
      <div class="form-card"><div style="font-size:11px;color:var(--text-dim);">Pendientes</div><div class="mono" style="font-size:20px;color:var(--gold);">${stats.pending_users}</div></div>
      <div class="form-card"><div style="font-size:11px;color:var(--text-dim);">Activos (7 días)</div><div class="mono" style="font-size:20px;">${stats.active_last_7d}</div></div>
      <div class="form-card"><div style="font-size:11px;color:var(--text-dim);">Videos subidos</div><div class="mono" style="font-size:20px;">${stats.total_videos}</div></div>
      <div class="form-card"><div style="font-size:11px;color:var(--text-dim);">Puntos totales (deuda)</div><div class="mono" style="font-size:20px;color:var(--red);">$${Number(stats.total_points_balance).toLocaleString("es-AR")}</div></div>
      <div class="form-card"><div style="font-size:11px;color:var(--text-dim);">Ya pagado</div><div class="mono" style="font-size:20px;">$${Number(stats.total_paid_ars).toLocaleString("es-AR")}</div></div>
      <div class="form-card"><div style="font-size:11px;color:var(--text-dim);">Por pagar (pendiente)</div><div class="mono" style="font-size:20px;color:var(--gold);">$${Number(stats.total_pending_ars).toLocaleString("es-AR")}</div></div>
    </div>` : ""}
    <p class="page-sub">${pending.length} canje${pending.length === 1 ? "" : "s"} · ${pendingSubs.length} pago${pendingSubs.length === 1 ? "" : "s"} de plan · ${pendingCreatorApplications.length} solicitud${pendingCreatorApplications.length === 1 ? "" : "es"} de creador · ${pendingSecurityReports.length} caso${pendingSecurityReports.length === 1 ? "" : "s"} de seguridad</p>

    <h3 style="margin-top:24px;">🎬 Solicitudes de creadores (${pendingCreatorApplications.length})</h3>
    ${pendingCreatorApplications.length ? pendingCreatorApplications.map(a => `
      <div class="form-card" style="margin-bottom:12px;border-color:rgba(250,204,21,.28);">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
          <div>
            <div style="font-weight:800;">@${escapeHtml(a.username)}</div>
            <div style="font-size:13px;color:var(--text-dim);margin-top:5px;line-height:1.45;">
              ${a.video_count} videos · ${a.account_days} días de antigüedad · solicitó ${new Date(a.requested_at).toLocaleDateString("es-AR")}
            </div>
          </div>
          <div style="display:flex;gap:7px;flex-wrap:wrap;">
            <button class="btn-outline" onclick="viewPublicProfile('${escapeHtml(a.username)}')">Ver perfil</button>
            <button class="btn" onclick="handleCreatorApplication('${a.application_id}','approve')">✓ Aprobar</button>
            <button class="btn-outline" style="color:var(--red);" onclick="handleCreatorApplication('${a.application_id}','reject')">✕ Rechazar</button>
          </div>
        </div>
      </div>
    `).join("") : `<div class="form-card" style="font-size:12px;color:var(--text-dim);">No hay solicitudes pendientes.</div>`}

    ${pendingSecurityReports.length ? `
      <h3>🚨 Reportes de seguridad</h3>
      <p style="color:var(--text-dim);font-size:12px;margin:-4px 0 12px;">
        Casos relacionados con acceso, contraseña o actividad sospechosa.
      </p>

      ${pendingSecurityReports.map(r => `
        <div class="form-card" style="
          margin-bottom:12px;
          border-color:${r.status === "pending" ? "rgba(248,113,113,.30)" : "rgba(250,204,21,.24)"};
          background:linear-gradient(135deg,rgba(248,113,113,.035),rgba(255,255,255,.012));
        ">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
            <div style="min-width:0;flex:1;">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px;">
                <strong class="mono" style="color:#fb7185;">${escapeHtml(r.case_code || "SIN-CÓDIGO")}</strong>
                <span style="
                  font-size:9px;
                  font-weight:900;
                  padding:3px 7px;
                  border-radius:999px;
                  border:1px solid var(--border);
                  color:${r.status === "pending" ? "#fca5a5" : "var(--gold)"};
                ">${escapeHtml(getAdminSecurityStatusLabel(r.status))}</span>
              </div>

              <div style="font-size:12px;color:var(--text);font-weight:700;">
                ${escapeHtml(r.email || "Cuenta sin correo")}
              </div>

              <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">
                ${escapeHtml(getAdminSecurityReasonLabel(r.reason))}
              </div>

              <div style="
                font-size:11px;
                color:var(--text-dim);
                margin-top:7px;
                line-height:1.45;
                max-width:720px;
              ">${escapeHtml(r.details || "Sin descripción")}</div>

              <div style="font-size:9px;color:var(--text-dim);margin-top:8px;">
                ${r.created_at ? new Date(r.created_at).toLocaleString("es-AR") : ""}
              </div>
            </div>

            <button class="btn-outline"
              onclick="openAdminSecurityIncidentDetail('${escapeHtml(r.case_code || "")}')">
              Revisar caso
            </button>
          </div>
        </div>
      `).join("")}
    ` : `
      <h3>🚨 Reportes de seguridad</h3>
      <div class="form-card" style="color:var(--text-dim);font-size:12px;">
        No hay reportes de seguridad pendientes. ✓
      </div>
    `}

    <h3>🚩 Videos reportados (${reports.length})</h3>
    ${reportsError ? `
      <div class="form-card" style="margin-bottom:14px;border-color:rgba(248,113,113,.28);color:var(--red);font-size:12px;line-height:1.5;">
        No se pudieron consultar los reportes. Ejecutá el SQL de reparación de reportes Admin y volvé a abrir el panel.
      </div>
    ` : reports && reports.length ? `
      ${reports.map(r => `
        <div class="form-card" style="margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
            <div>
              <div style="font-weight:600;">${escapeHtml(r.videos?.title || "video eliminado")}</div>
              <div style="color:var(--text-dim); font-size:12px;">Reportado por @${escapeHtml(r.profiles?.username || "usuario")} · ${new Date(r.created_at).toLocaleString("es-AR")}</div>
              <div style="margin-top:6px; font-size:13px; color:var(--gold);">Motivo: ${escapeHtml(r.reason)}</div>
              ${r.videos?.video_url ? (isSafeUrl(r.videos.video_url) ? `<a href="${escapeHtml(r.videos.video_url)}" target="_blank" rel="noopener" style="font-size:12px; color:var(--text-dim);">Ver video →</a>` : `<span style="font-size:12px; color:var(--red);">⚠️ Link sospechoso, no se abre</span>`) : ""}
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn" style="background:var(--red); color:#fff;" onclick="handleDeleteVideo('${r.video_id}')">🗑 Eliminar video</button>
              <button class="btn-outline" onclick="handleDismissReport('${r.id}')">Descartar</button>
            </div>
          </div>
        </div>
      `).join("")}` : `
      <div class="form-card" style="margin-bottom:14px;color:var(--text-dim);font-size:12px;">
        No hay videos reportados pendientes. ✓
      </div>
    `}

    ${renderAdminFinancialLab()}

    ${pendingSubs.length ? `
    <h3 style="margin-top:24px;">💳 Pagos de suscripción a confirmar</h3>
      ${pendingSubs.map(s => `
        <div class="form-card" style="margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
            <div>
              <div style="font-weight:600;">@${escapeHtml(s.profiles?.username || "usuario")} → ${plans.find(p => p.id === s.plan_id)?.name || s.plan_id}</div>
              <div style="color:var(--text-dim); font-size:12px;">${new Date(s.created_at).toLocaleString("es-AR")}</div>
              <div style="margin-top:8px; font-size:13px;">
                <div>Monto: <span class="mono" style="color:var(--green)">$${s.amount_ars}</span></div>
                <div>Código a buscar en tu banco: <strong class="mono" style="color:var(--gold)">${escapeHtml(s.reference)}</strong></div>
              </div>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn" onclick="handleApproveSubscription('${s.id}')">✓ Confirmar pago</button>
              <button class="btn-outline" onclick="handleRejectSubscription('${s.id}')">✕ Rechazar</button>
            </div>
          </div>
        </div>
      `).join("")}` : ""}

    <h3 style="margin-top:24px;">💸 Canjes pendientes</h3>

    <div id="pendingList">
      ${pending.length ? pending.map(r => {
        const userIp = profileById[r.user_id]?.signup_ip;
        const sharedIp = userIp && ipCounts[userIp] > 1;
        return `
        <div class="form-card" style="margin-bottom:14px; ${sharedIp ? "border-color:var(--gold-dim);" : ""}">
          ${sharedIp ? `<div style="color:var(--gold); font-size:12px; margin-bottom:8px;">⚠️ Esta cuenta comparte red (wifi) con otra(s) ${ipCounts[userIp] - 1} cuenta(s) — revisá antes de aprobar</div>` : ""}
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
            <div>
              <div style="font-weight:600;">@${escapeHtml(r.profiles?.username || "usuario")}</div>
              <div style="color:var(--text-dim); font-size:12px;">${new Date(r.created_at).toLocaleString("es-AR")}</div>
              <div style="margin-top:8px; font-size:13px;">
                <div>Puntos usados: <span class="mono">${r.points_used}</span></div>
                <div>Comisión: <span class="mono" style="color:var(--text-dim)">$${r.commission_ars}</span></div>
                <div>A transferir: <span class="mono" style="color:var(--green)">$${r.amount_ars}</span></div>
                <div>Alias MP: <strong class="mono">${escapeHtml(r.mercadopago_alias)}</strong></div>
              </div>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn" onclick="handleApproveRedemption('${r.id}')">✓ Aprobar (ya pagué)</button>
              <button class="btn-outline" onclick="handleRejectRedemption('${r.id}')">✕ Rechazar</button>
            </div>
          </div>
        </div>`;
      }).join("") : `<p style="color:var(--text-dim)">No hay canjes pendientes por ahora. 🎉</p>`}
    </div>

    ${blockedUsers && blockedUsers.length ? `
      <h3 style="margin-top:32px;">🆕 Cuentas nuevas pendientes de verificar (${blockedUsers.length})</h3>
      <p style="color:var(--text-dim); font-size:12px; margin-bottom:12px;">SMART VERIFICATION sólo deja acá las cuentas que necesitan una revisión humana.</p>
      ${blockedUsers.map(u => `
        <div class="ledger-row">
          <span>@${escapeHtml(u.username)} · <span id="email-pending-${u.id}" data-masked="true">${escapeHtml(maskEmail(u.email))}</span> <button onclick="toggleEmailVisibility('email-pending-${u.id}', '${escapeHtml(u.email || "")}')" style="background:none;border:none;cursor:pointer;font-size:12px;">👁</button> · ${new Date(u.created_at).toLocaleDateString("es-AR")}</span>
          <button class="btn-outline" style="padding:4px 12px; font-size:12px;" onclick="handleUnblockUser('${u.id}')">✓ Verificar</button>
        </div>
      `).join("")}` : ""}

    <h3 style="margin-top:32px;">🛡️ Verificación automática</h3>
    <div class="form-card" style="margin-bottom:14px;">
      <div style="font-size:12px;color:var(--text-dim);margin-bottom:10px;">Últimos controles de Usuarios nuevos. Las solicitudes de Creadores funcionan por separado.</div>
      ${autoVerificationLog.length ? autoVerificationLog.slice(0,12).map(entry => `<div class="ledger-row" style="gap:10px;"><span>@${escapeHtml(entry.username || "usuario")} · ${escapeHtml(entry.reason || "control")}</span><span class="mono" style="color:${entry.decision === "verified" ? "var(--green)" : "var(--gold)"};">${entry.decision === "verified" ? "VERIFICADO" : "REVISIÓN"}</span></div>`).join("") : `<div style="font-size:12px;color:var(--text-dim);">Todavía no hay verificaciones automáticas registradas.</div>`}
    </div>

    <h3 style="margin-top:32px;">🎨 Eventos visuales</h3>
    <div class="form-card" style="margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;">
        <div style="flex:1;min-width:220px;">
          <div style="font-size:13px;font-weight:800;">Seasonal LiveScroll</div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:3px;line-height:1.5;">
            En Automático, LiveScroll cambia solo según la fecha de Argentina.
            Lo que publiques acá se aplica a todos los Usuarios en PC y celular.
          </div>
          <div id="seasonalAdminStatus" style="font-size:10px;color:var(--gold);margin-top:7px;"></div>
        </div>

        <select
          id="seasonalThemeAdminSelect"
          onchange="setSeasonalAdminPreview(this.value)"
          style="
            min-width:190px;
            padding:10px 12px;
            background:var(--ink);
            border:1px solid var(--border);
            border-radius:10px;
            color:var(--text);
          "
        >
          <option value="auto">🗓️ Automático</option>
          <option value="normal">⚫ Normal</option>
          <option value="spring">🌸 Primavera</option>
          <option value="halloween">🎃 Halloween</option>
          <option value="christmas">🎄 Navidad</option>
          <option value="newyear">🎆 Año Nuevo</option>
          <option value="reyes">👑 Reyes</option>
          <option value="valentines">💗 San Valentín</option>
          <option value="patria">🇦🇷 Fecha patria</option>
          <option value="father">👨 Día del Padre</option>
          <option value="childhood">🧒 Día de las Infancias</option>
          <option value="mother">🌷 Día de la Madre</option>
          <option value="easter">🐰 Pascuas</option>
        </select>
      </div>
    </div>

    <h3 style="margin-top:32px;">🔒 Acceso a Billetera</h3>
    <div class="form-card" style="margin-bottom:14px;padding:0;overflow:hidden;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding:14px;">
        <div style="flex:1;min-width:190px;">
          <div style="font-size:13px;font-weight:700;">👛 Billetera</div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:2px;">Pausá o habilitá el acceso a canjes.</div>
        </div>
        <button class="btn" id="walletLockBtn" onclick="handleToggleWalletLock()">Cargando...</button>
      </div>

      <div style="padding:0 14px 12px;color:var(--text-dim);font-size:10px;">
        Tu cuenta de administrador mantiene acceso a la Billetera aunque esté pausada para los demás usuarios.
      </div>
    </div>

    <h3 style="margin-top:32px;">💵 Precios de la tienda</h3>
    <div class="form-card" style="margin-bottom:14px;">
      <p style="font-size:12px; color:var(--text-dim); margin-top:0;">Estos precios se aplican al toque, no hace falta publicar ninguna versión.</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
        <div>
          <label style="font-size:12px; color:var(--text-dim); display:block; margin-bottom:4px;">Boost extra — plan Plus</label>
          <input type="number" id="priceBoostPlus" style="width:100%; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text);">
        </div>
        <div>
          <label style="font-size:12px; color:var(--text-dim); display:block; margin-bottom:4px;">Boost extra — plan Diamante</label>
          <input type="number" id="priceBoostDiamante" style="width:100%; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text);">
        </div>
        <div>
          <label style="font-size:12px; color:var(--text-dim); display:block; margin-bottom:4px;">Cambiar a Plus con puntos</label>
          <input type="number" id="pricePlanPlus" style="width:100%; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text);">
        </div>
        <div>
          <label style="font-size:12px; color:var(--text-dim); display:block; margin-bottom:4px;">Cambiar a Diamante con puntos</label>
          <input type="number" id="pricePlanDiamante" style="width:100%; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text);">
        </div>
      </div>
      <button class="btn" onclick="handleSaveStorePrices()">Guardar precios</button>
    </div>

    <h3 style="margin-top:32px;">🎨 Emojis de la tienda</h3>
    <div class="form-card" style="margin-bottom:14px;">
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
        <input type="text" id="newEmojiChar" placeholder="🐐" maxlength="4" style="width:60px; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text); text-align:center;">
        <button type="button" class="btn-outline" onclick="openEmojiPicker('newEmojiChar', FACE_EMOJIS)">Elegir</button>
        <input type="text" id="newEmojiName" placeholder="Nombre (ej: GOAT)" style="flex:1; min-width:140px; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text);">
        <input type="number" id="newEmojiPrice" min="0" placeholder="0 = GRATIS" style="width:120px; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text);">
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 120px;gap:8px;margin-bottom:10px;">
        <select id="newEmojiRarity" style="padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);">
          <option value="comun">Común</option>
          <option value="rara">Rara</option>
          <option value="epica">Épica</option>
          <option value="legendaria">Legendaria</option>
          <option value="exclusiva">Exclusiva</option>
        </select>

        <select id="newEmojiEdition"
          onchange="document.getElementById('newEmojiStock').disabled=this.value!=='limited';"
          style="padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);">
          <option value="standard">Edición normal</option>
          <option value="limited">Edición limitada</option>
        </select>

        <input type="number" id="newEmojiStock" min="1" placeholder="Stock" disabled
          style="padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);">
      </div>

      <button class="btn" onclick="handleAddStoreEmoji()">Agregar emoji</button>
      <div id="storeEmojisList">Cargando...</div>
    </div>


    <h3 style="margin-top:32px;">🏅 Medallas exclusivas de la tienda</h3>
    <div class="form-card" style="margin-bottom:14px;">
      <p style="font-size:12px;color:var(--text-dim);margin-top:0;">
        Creá medallas coleccionables. Cuando alguien la compra, pasa a su colección real y puede equiparla entre sus 3 medallas de perfil.
      </p>

      <div style="display:grid;grid-template-columns:70px 1fr;gap:8px;margin-bottom:8px;">
        <input type="text" id="newStoreBadgeIcon" placeholder="🏅" maxlength="8"
          style="padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);text-align:center;font-size:20px;">
        <input type="text" id="newStoreBadgeName" placeholder="Nombre de la medalla"
          style="padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);">
      </div>

      <textarea id="newStoreBadgeDescription" maxlength="180" rows="2" placeholder="Descripción corta..."
        style="width:100%;padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);resize:vertical;margin-bottom:8px;"></textarea>

      <div style="display:grid;grid-template-columns:1fr 130px;gap:8px;margin-bottom:8px;">
        <select id="newStoreBadgeRarity"
          style="padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);">
          <option value="comun">Común</option>
          <option value="rara">Rara</option>
          <option value="epica">Épica</option>
          <option value="legendaria">Legendaria</option>
          <option value="exclusiva">Exclusiva</option>
        </select>
        <input type="number" id="newStoreBadgePrice" min="0" placeholder="Precio pts · 0 = GRATIS"
          style="padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);">
      </div>

      <div style="display:grid;grid-template-columns:1fr 130px;gap:8px;margin-bottom:8px;">
        <select id="newStoreBadgeEdition"
          onchange="document.getElementById('newStoreBadgeStock').disabled=this.value!=='limited';"
          style="padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);">
          <option value="standard">Edición normal</option>
          <option value="limited">Edición limitada</option>
        </select>
        <input type="number" id="newStoreBadgeStock" min="1" placeholder="Unidades" disabled
          style="padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);">
      </div>

      <div style="display:flex;gap:8px;">
        <button type="button" class="btn-outline" onclick="openEmojiPicker('newStoreBadgeIcon', MEDAL_EMOJIS)">Elegir ícono</button>
        <button class="btn" onclick="handleAddStoreBadge()">Crear medalla</button>
      </div>

      <div id="storeBadgesAdminList" style="margin-top:14px;">Cargando...</div>
    </div>

    <h3 style="margin-top:32px;">🏷️ Títulos de perfil</h3>
    <div class="form-card" style="margin-bottom:14px;">
      <p style="font-size:12px;color:var(--text-dim);margin-top:0;line-height:1.5;">
        Creá títulos que los usuarios pueden comprar, guardar en Mi colección y equipar debajo de su nombre.
        La categoría se asigna automáticamente como <code>title</code>.
      </p>

      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <input
          type="text"
          id="newProfileTitleIcon"
          placeholder="👑"
          maxlength="4"
          style="width:62px;padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);text-align:center;"
        >
        <button type="button" class="btn-outline" onclick="openEmojiPicker('newProfileTitleIcon', FACE_EMOJIS)">Elegir</button>

        <input
          type="text"
          id="newProfileTitleName"
          placeholder="Ej: Leyenda"
          maxlength="40"
          style="flex:1;min-width:160px;padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);"
        >

        <select
          id="newProfileTitleRarity"
          style="width:145px;padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);"
        >
          <option value="comun">Común</option>
          <option value="rara">Rara</option>
          <option value="epica">Épica</option>
          <option value="legendaria">Legendaria</option>
          <option value="exclusiva">Exclusiva</option>
        </select>

        <input
          type="number"
          id="newProfileTitlePrice"
          min="0"
          placeholder="Precio pts"
          style="width:125px;padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);"
        >

        <button class="btn" onclick="handleAddProfileTitleAdmin()">Crear título</button>
      </div>

      <div id="profileTitlesAdminList" style="margin-top:14px;">Cargando...</div>
    </div>

    <h3 style="margin-top:32px;">✨ Otros artículos de la tienda</h3>
    <div class="form-card" style="margin-bottom:14px;">
      <p style="font-size:12px; color:var(--text-dim); margin-top:0;">Cualquier cosa nueva que quieras vender: insignias, marcos, lo que se te ocurra. Vos elegís la categoría (el texto), el ícono, el nombre y el precio.</p>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px;">
        <input type="text" id="newItemCategory" placeholder="Categoría (ej: Insignia)" style="width:140px; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text);">
        <input type="text" id="newItemIcon" placeholder="🏅" maxlength="4" style="width:60px; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text); text-align:center;">
        <button type="button" class="btn-outline" onclick="openEmojiPicker('newItemIcon', FACE_EMOJIS)">Elegir</button>
        <input type="text" id="newItemName" placeholder="Nombre" style="flex:1; min-width:140px; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text);">
        <input type="number" id="newItemPrice" placeholder="Precio en pts" style="width:120px; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text);">
        <button class="btn" onclick="handleAddStoreItem()">Agregar</button>
      </div>
      <div id="storeItemsList">Cargando...</div>
    </div>

    <h3 style="margin-top:32px;">📢 Novedades y Términos</h3>
    <div class="form-card" style="margin-bottom:14px;">
      <p style="font-size:12px; color:var(--text-dim); margin-bottom:12px;">
        Para publicar novedades nuevas: cargá filas en la tabla <code>changelog_entries</code> con el número de versión siguiente, y después subí la versión acá. Para términos: actualizá <code>terminos.html</code> y subí la versión de "Términos" — a todos les va a volver a aparecer para aceptar.
      </p>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn-outline" onclick="handleBumpVersion('changelog')">📣 Subir versión de Novedades</button>
        <button class="btn-outline" onclick="handleBumpVersion('terms')">📋 Subir versión de Términos</button>
      </div>
    </div>



    <h3 style="margin-top:32px;">🔥 Racha semanal — cargar premios</h3>
    <div class="form-card" style="margin-bottom:14px;">
      <p style="font-size:12px; color:var(--text-dim); margin-bottom:12px;">
        Elegí el lunes de la semana que querés configurar, y completá los 7 días. Se puede cargar con anticipación.
      </p>
      <div class="field">
        <label>Semana que empieza el (fecha del lunes)</label>
        <input type="date" id="streakWeekStart" style="width:100%; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:inherit;">
      </div>
      <div id="streakDaysForm"></div>
      <button class="btn" onclick="loadStreakDaysForm()" style="margin-bottom:10px;">Cargar formulario de esa semana</button>
      <div id="streakSaveResult"></div>
    </div>
    <div id="streakWeeksOverview" style="margin-bottom:14px;"></div>

    <h3 style="margin-top:32px;">🔍 Buscar y gestionar cualquier cuenta</h3>
    <div class="form-card" style="margin-bottom:14px;">
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <input type="text" id="userSearchInput" placeholder="Nombre de usuario o email..." style="flex:1; min-width:180px; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:inherit;">
        <button class="btn" onclick="handleUserSearch()" style="flex:1; min-width:100px;">Buscar</button>
        <button class="btn-outline" onclick="handleListAllUsers()" style="flex:1; min-width:100px;">📋 Ver todos</button>
      </div>
      <div id="userSearchResults" style="margin-top:14px;"></div>
    </div>

    ${resolved.length ? `
      <h3 style="margin-top:32px;">Historial reciente</h3>
      <div>
        ${resolved.map(r => `
          <div class="ledger-row">
            <span>@${escapeHtml(r.profiles?.username || "usuario")} · $${r.amount_ars} · ${new Date(r.created_at).toLocaleDateString("es-AR")}</span>
            <span class="mono" style="color:${r.status === 'paid' ? 'var(--green)' : r.status === 'approved' ? 'var(--green)' : 'var(--red)'}">${r.status}</span>
          </div>
        `).join("")}
      </div>` : ""}`;

  organizeAdminPanel();
  loadStreakWeeksOverview();
  loadWalletLockStatus();
  setTimeout(syncSeasonalAdminControls, 0);
  loadStoreEmojisList();
  loadStorePrices();
  loadStoreBadgesAdminList();
  loadStoreItemsList();
  loadProfileTitlesAdminList();
}


function getAdminSecurityReasonLabel(reason) {
  const labels = {
    password_change_not_recognized: "Cambio de contraseña no reconocido",
    lost_access_after_change: "Perdió acceso después del cambio",
    possible_account_takeover: "Posible acceso de otra persona",
    suspicious_security_email: "Correo de seguridad sospechoso",
    other: "Otro problema de seguridad"
  };
  return labels[reason] || reason || "Sin motivo";
}

function getAdminSecurityStatusLabel(status) {
  const labels = {
    pending: "PENDIENTE",
    reviewing: "EN REVISIÓN",
    recovery_authorized: "RECUPERACIÓN AUTORIZADA",
    resolved: "RESUELTO",
    rejected: "RECHAZADO"
  };
  return labels[status] || String(status || "").toUpperCase();
}

async function openAdminSecurityIncidentDetail(caseCode) {
  const { data: rows, error } = await sb.rpc("admin_get_security_incident_reports");

  if (error) {
    showToast("No pudimos abrir el reporte");
    return;
  }

  const incident = (rows || []).find(r => r.case_code === caseCode);

  if (!incident) {
    showToast("Reporte no encontrado");
    return;
  }

  const canReview = incident.status === "pending";
  const canAuthorize = ["pending", "reviewing"].includes(incident.status);
  const canReject = ["pending", "reviewing"].includes(incident.status);

  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked" data-modal-locked="1" style="z-index:320;">
      <div class="modal-box" style="
        max-width:560px;
        max-height:90dvh;
        overflow:hidden;
        display:flex;
        flex-direction:column;
        border-color:rgba(248,113,113,.24);
      ">
        <div class="modal-box-header" style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
          <div>
            <div style="font-size:9px;color:#fb7185;font-weight:900;letter-spacing:.12em;">
              🚨 SEGURIDAD
            </div>
            <h2 style="margin:4px 0 3px;">${escapeHtml(incident.case_code)}</h2>
            <div style="font-size:10px;color:var(--text-dim);">
              ${escapeHtml(getAdminSecurityStatusLabel(incident.status))}
            </div>
          </div>
          <button type="button" onclick="closeManagedModal()"
            style="width:40px;height:40px;border-radius:50%;border:1px solid var(--border);background:var(--panel-2);color:var(--text);font-size:18px;cursor:pointer;">✕</button>
        </div>

        <div class="modal-box-body" style="overflow-y:auto;min-height:0;">
          <div class="form-card" style="margin-bottom:10px;">
            <div style="font-size:9px;color:var(--text-dim);">CUENTA</div>
            <div style="font-size:13px;font-weight:800;margin-top:3px;">${escapeHtml(incident.email || "")}</div>
            <div class="mono" style="font-size:9px;color:var(--text-dim);margin-top:4px;">
              ${escapeHtml(incident.user_id || "Sin user_id")}
            </div>
          </div>

          <div class="form-card" style="margin-bottom:10px;">
            <div style="font-size:9px;color:var(--text-dim);">MOTIVO</div>
            <div style="font-size:12px;font-weight:800;margin-top:4px;">
              ${escapeHtml(getAdminSecurityReasonLabel(incident.reason))}
            </div>
          </div>

          <div class="form-card" style="margin-bottom:10px;">
            <div style="font-size:9px;color:var(--text-dim);">DESCRIPCIÓN DEL USUARIO</div>
            <div style="font-size:12px;line-height:1.55;margin-top:5px;white-space:pre-wrap;">
              ${escapeHtml(incident.details || "Sin descripción")}
            </div>
          </div>

          <div style="font-size:10px;color:var(--text-dim);line-height:1.5;">
            Reportado: ${incident.created_at ? new Date(incident.created_at).toLocaleString("es-AR") : "—"}<br>
            ${incident.reviewed_at ? `Revisado: ${new Date(incident.reviewed_at).toLocaleString("es-AR")}<br>` : ""}
            Estado actual: ${escapeHtml(getAdminSecurityStatusLabel(incident.status))}
          </div>

          ${incident.status === "recovery_authorized" ? `
            <div style="
              margin-top:14px;
              padding:12px;
              border:1px solid rgba(34,197,94,.22);
              background:rgba(34,197,94,.05);
              border-radius:11px;
              color:var(--text-dim);
              font-size:10px;
              line-height:1.5;
            ">
              🔐 Recuperación autorizada. El código temporal fue generado por el servidor,
              vence en 5 minutos y tiene un máximo de 5 intentos.
            </div>
          ` : ""}
        </div>

        <div class="modal-box-footer" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;">
          ${canReview ? `
            <button class="btn-outline"
              onclick="adminSetSecurityIncidentStatus('${escapeHtml(incident.case_code)}','reviewing')">
              🔎 En revisión
            </button>
          ` : ""}

          ${canAuthorize ? `
            <button class="btn"
              onclick="adminAuthorizeSecurityRecovery('${escapeHtml(incident.case_code)}')">
              🔐 Autorizar recuperación
            </button>
          ` : ""}

          ${canReject ? `
            <button class="btn-outline"
              style="color:var(--red);border-color:rgba(248,113,113,.35);"
              onclick="adminRejectSecurityIncident('${escapeHtml(incident.case_code)}')">
              ✕ Rechazar
            </button>
          ` : ""}

          <button class="btn-outline" onclick="closeManagedModal()">Cerrar</button>
        </div>
      </div>
    </div>`;
}

async function adminSetSecurityIncidentStatus(caseCode, status) {
  const { data, error } = await sb.rpc("admin_set_security_incident_status", {
    p_case_code: caseCode,
    p_status: status,
    p_admin_notes: null
  });

  if (error || !data?.ok) {
    showToast("No pudimos actualizar el caso");
    return;
  }

  showToast(status === "reviewing" ? "Caso marcado En revisión" : "Caso actualizado");
  closeManagedModal();
  await renderAdmin();
}

async function adminRejectSecurityIncident(caseCode) {
  if (!confirm("¿Rechazar este reporte de seguridad?")) return;

  const note = prompt("Motivo interno del rechazo (opcional):", "") ?? null;

  const { data, error } = await sb.rpc("admin_set_security_incident_status", {
    p_case_code: caseCode,
    p_status: "rejected",
    p_admin_notes: note
  });

  if (error || !data?.ok) {
    showToast("No pudimos rechazar el caso");
    return;
  }

  showToast("Reporte rechazado");
  closeManagedModal();
  await renderAdmin();
}

async function adminAuthorizeSecurityRecovery(caseCode) {
  if (!confirm(
    "¿Autorizar recuperación para este caso?\\n\\n" +
    "Se generará un código temporal de 6 dígitos, válido por 5 minutos, " +
    "y se enviará al correo de la cuenta."
  )) return;

  showToast("Generando código temporal...");

  const { data, error } = await sb.functions.invoke("security-recovery", {
    body: {
      action: "issue_code",
      case_code: caseCode
    }
  });

  if (error || !data?.ok) {
    console.error("security-recovery:", error, data);

    const msg =
      data?.error === "no_autorizado" ? "La función no reconoció tu cuenta como Admin" :
      data?.error === "case_not_found" ? "No encontramos ese caso" :
      data?.error === "case_not_recoverable" ? "Ese caso ya no admite recuperación" :
      data?.error === "email_send_failed" ? "Se generó el código pero falló el envío del correo" :
      data?.error === "resend_not_configured" ? "Falta configurar Resend en la función" :
      "No pudimos autorizar la recuperación";

    showToast(msg);
    return;
  }

  showToast("Código temporal enviado ✓");
  closeManagedModal();
  await renderAdmin();
}

function organizeAdminPanel() {
  const main = document.getElementById("appView");
  if (!main) return;

  // renderAdmin() reemplaza todo el innerHTML cada vez que se actualiza el panel.
  // El atributo data-admin-organized queda en appView, por lo que NO debemos
  // usarlo para impedir una nueva organización: si lo hacemos, después de una
  // acción Admin el contenido vuelve a quedar todo apilado.
  main.dataset.adminOrganized = "1";

  if (!document.getElementById("lsAdminOrganizationStyles")) {
    const style = document.createElement("style");
    style.id = "lsAdminOrganizationStyles";
    style.textContent = `
      .ls-admin-nav {
        position:sticky;
        top:8px;
        z-index:30;
        display:flex;
        gap:7px;
        overflow-x:auto;
        padding:7px;
        margin:0 0 18px;
        border:1px solid var(--border);
        background:color-mix(in srgb,var(--panel) 94%,transparent);
        backdrop-filter:blur(12px);
        border-radius:14px;
        scrollbar-width:none;
      }
      .ls-admin-nav::-webkit-scrollbar { display:none; }

      .ls-admin-nav button {
        white-space:nowrap;
        border:1px solid transparent;
        background:transparent;
        color:var(--text-dim);
        border-radius:10px;
        padding:9px 12px;
        cursor:pointer;
        font-family:inherit;
        font-size:10px;
        font-weight:850;
      }

      .ls-admin-nav button.active {
        color:var(--text);
        background:var(--panel-2);
        border-color:var(--border);
        box-shadow:0 4px 16px rgba(0,0,0,.18);
      }

      .ls-admin-group {
        display:none;
        animation:lsAdminGroupIn .16s ease;
      }

      .ls-admin-group.active {
        display:block;
      }

      .ls-admin-group > h3:first-child {
        margin-top:4px !important;
      }

      @keyframes lsAdminGroupIn {
        from { opacity:.45; transform:translateY(3px); }
        to { opacity:1; transform:none; }
      }

      @media(max-width:700px) {
        .ls-admin-nav {
          top:4px;
          border-radius:12px;
          margin-left:-2px;
          margin-right:-2px;
        }
        .ls-admin-nav button {
          padding:9px 10px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const title = main.querySelector(".page-title");
  if (!title) return;

  const nav = document.createElement("div");
  const securityHeadingsText = Array.from(main.querySelectorAll("h3"))
    .map(h => h.textContent || "")
    .join(" ");
  const videoReportsMatch = securityHeadingsText.match(/Videos reportados\s*\((\d+)\)/i);
  const visibleVideoReportsCount = videoReportsMatch ? Number(videoReportsMatch[1]) : 0;
  nav.className = "ls-admin-nav";
  nav.innerHTML = `
    <button data-admin-tab="resumen" class="active" onclick="switchAdminPanelGroup('resumen',this)">📊 Resumen</button>
    <button data-admin-tab="seguridad" onclick="switchAdminPanelGroup('seguridad',this)">🚨 Seguridad${visibleVideoReportsCount ? ` (${visibleVideoReportsCount})` : ""}</button>
    <button data-admin-tab="usuarios" onclick="switchAdminPanelGroup('usuarios',this)">👥 Usuarios</button>
    <button data-admin-tab="finanzas" onclick="switchAdminPanelGroup('finanzas',this)">💰 Finanzas</button>
    <button data-admin-tab="tienda" onclick="switchAdminPanelGroup('tienda',this)">🛍️ Tienda</button>
    <button data-admin-tab="sistema" onclick="switchAdminPanelGroup('sistema',this)">⚙️ Sistema</button>
  `;

  title.insertAdjacentElement("afterend", nav);

  const nodes = Array.from(main.children).filter(n => n !== title && n !== nav);

  const headingGroup = text => {
    const value = String(text || "").toLowerCase();

    if (value.includes("reportes de seguridad") || value.includes("videos reportados")) return "seguridad";
    if (value.includes("solicitudes de creadores") || value.includes("cuentas nuevas") || value.includes("buscar y gestionar")) return "usuarios";
    if (value.includes("centro financiero experimental") || value.includes("pagos de suscripción") || value.includes("canjes pendientes") || value.includes("historial reciente")) return "finanzas";
    if (value.includes("precios de la tienda") || value.includes("emojis de la tienda") ||
        value.includes("medallas exclusivas") || value.includes("títulos de perfil") ||
        value.includes("otros artículos")) return "tienda";
    if (value.includes("eventos visuales") || value.includes("acceso a billetera") ||
        value.includes("novedades y términos") || value.includes("racha semanal")) return "sistema";

    return "resumen";
  };

  const groups = {};
  ["resumen","seguridad","usuarios","finanzas","tienda","sistema"].forEach(key => {
    const el = document.createElement("div");
    el.className = `ls-admin-group ${key === "resumen" ? "active" : ""}`;
    el.dataset.adminGroup = key;
    groups[key] = el;
    main.appendChild(el);
  });

  let currentGroup = "resumen";

  nodes.forEach(node => {
    if (node.tagName === "H3") {
      currentGroup = headingGroup(node.textContent);
    }
    groups[currentGroup].appendChild(node);
  });
}

function switchAdminPanelGroup(group, button) {
  const main = document.getElementById("appView");
  if (!main) return;

  main.querySelectorAll(".ls-admin-group").forEach(el => {
    el.classList.toggle("active", el.dataset.adminGroup === group);
  });

  main.querySelectorAll(".ls-admin-nav button").forEach(btn => {
    btn.classList.toggle("active", btn === button);
  });

  try {
    window.scrollTo({ top:0, behavior:"smooth" });
  } catch (_) {
    window.scrollTo(0,0);
  }
}

async function handleDeleteVideo(videoId) {
  if (!confirm("¿Eliminar este video para siempre? Se borran también sus likes, comentarios y reportes.")) return;
  const mediaToDelete = await getVideoMediaForCleanup(videoId);
  const { data, error } = await sb.rpc("admin_delete_video", { p_video_id: videoId });
  if (error || !data?.ok) {
    console.error("admin_delete_video:", error, data);
    const detail = data?.detail || error?.message || "Error desconocido";
    showToast(`No se pudo eliminar: ${detail}`);
    return;
  }
  await cleanupR2VideoMedia(mediaToDelete);
  showToast("Video eliminado");
  renderAdmin();
}

async function handleDismissReport(reportId) {
  const { data, error } = await sb.rpc("admin_dismiss_report", { p_report_id: reportId });
  if (error || !data.ok) { showToast("No se pudo descartar"); return; }
  showToast("Reporte descartado");
  renderAdmin();
}

async function handleApproveSubscription(id) {
  const { data, error } = await sb.rpc("admin_approve_subscription", { p_request_id: id });
  if (error || !data.ok) { showToast("No se pudo confirmar el pago"); return; }
  showToast("Pago confirmado, plan activado");
  renderAdmin();
}

async function handleRejectSubscription(id) {
  if (!confirm("¿Rechazar este pago de suscripción?")) return;
  const { data, error } = await sb.rpc("admin_reject_subscription", { p_request_id: id });
  if (error || !data.ok) { showToast("No se pudo rechazar"); return; }
  showToast("Pago rechazado");
  renderAdmin();
}

async function openEmojiPicker(targetInputId, list) {
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked" style="z-index:140;" data-modal-locked="1">
      <div class="modal-box" style="max-width:360px;">
        <div class="modal-box-header"><h2 style="font-size:16px;">Elegí uno</h2></div>
        <div class="modal-box-body">
          <div style="display:grid; grid-template-columns:repeat(6,1fr); gap:8px;">
            ${list.map(e => `<button onclick="pickEmoji('${targetInputId}','${e}')" style="font-size:22px; background:var(--panel-2); border:1px solid var(--border); border-radius:8px; padding:8px; cursor:pointer;">${e}</button>`).join("")}
          </div>
        </div>
        <div class="modal-box-footer">
          <button class="btn-outline" style="width:100%;" onclick="document.getElementById('globalModalWrap').innerHTML=''">Cerrar</button>
        </div>
      </div>
    </div>`;
}

function pickEmoji(targetInputId, emoji) {
  const input = document.getElementById(targetInputId);
  if (input) input.value = emoji;
  document.getElementById("globalModalWrap").innerHTML = "";
}

const MEDAL_EMOJIS = ["🥇","🥈","🥉","🏅","🎖️","🏆","🌟","⭐","✨","🔥","💪","👑","🎗️","🔰","💠","🛡️","⚡","🎯"];
const FACE_EMOJIS = ["😀","😎","🤩","🥳","😇","🤠","🥷","🤖","👽","🐐","🐉","🦁","🐯","🦊","🦄","🐺","🦅","🦉","🐸","🐢","🦈","🐙","🦖","🦕","👻","💀","🎃","🤡","👑","💎","🔥","⚡","🌈","🍀","🎮","🎧","🚀","🛸","🌙","☀️"];

async function loadStreakDaysForm() {
  const weekStart = document.getElementById("streakWeekStart").value;
  if (!weekStart) { showToast("Elegí primero una fecha"); return; }

  const { data: existing } = await sb.rpc("admin_get_streak_rewards");
  const existingForWeek = (existing || []).filter(r => r.week_start === weekStart);
  const byDay = {};
  existingForWeek.forEach(r => { byDay[r.day_number] = r; });

  const formEl = document.getElementById("streakDaysForm");
  formEl.innerHTML = Array.from({ length: 7 }, (_, i) => i + 1).map(day => `
    <div class="form-card" style="margin-bottom:10px; padding:12px;">
      <div style="font-size:13px; color:var(--gold); font-weight:600; margin-bottom:8px;">Día ${day}</div>
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px; flex-wrap:wrap;">
        <input type="number" id="streakPts${day}" placeholder="puntos" value="${byDay[day]?.points ?? ""}" style="width:90px; padding:8px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text);">
        <input type="text" id="streakBadgeName${day}" placeholder="nombre medalla (opcional)" value="${escapeHtml(byDay[day]?.badge_name || "")}" style="flex:1; min-width:120px; padding:8px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text);">
        <input type="text" id="streakBadgeIcon${day}" placeholder="🏅" maxlength="4" value="${escapeHtml(byDay[day]?.badge_icon || "")}" style="width:50px; padding:8px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text); text-align:center;">
        <button type="button" class="btn-outline" style="padding:8px 10px; font-size:12px;" onclick="openEmojiPicker('streakBadgeIcon${day}', MEDAL_EMOJIS)">Elegir</button>
      </div>
      <div style="display:flex; gap:8px; align-items:center; background:var(--panel-2); border:1px solid var(--gold-dim); border-radius:8px; padding:8px;">
        <span style="font-size:11px; color:var(--gold); white-space:nowrap;">🎁 Emoji que se gana gratis ese día:</span>
        <input type="text" id="streakEmojiReward${day}" placeholder="ej: 🐉" maxlength="4" value="${escapeHtml(byDay[day]?.emoji_reward || "")}" style="width:60px; padding:6px; background:var(--ink); border:1px solid var(--border); border-radius:6px; color:var(--text); text-align:center;">
        <button type="button" class="btn-outline" style="padding:6px 10px; font-size:12px;" onclick="openEmojiPicker('streakEmojiReward${day}', FACE_EMOJIS)">Elegir</button>
      </div>
    </div>
  `).join("") + `
    <div style="display:flex; gap:8px; margin-top:10px;">
      <button class="btn" style="flex:1;" onclick="saveStreakWeek()">Guardar toda la semana</button>
      <button class="btn-outline" onclick="cancelStreakForm()">Cancelar</button>
    </div>`;
}

function cancelStreakForm() {
  document.getElementById("streakDaysForm").innerHTML = "";
  document.getElementById("streakWeekStart").value = "";
}

async function saveStreakWeek() {
  const weekStart = document.getElementById("streakWeekStart").value;
  const resultEl = document.getElementById("streakSaveResult");
  resultEl.textContent = "Guardando...";

  for (let day = 1; day <= 7; day++) {
    const points = parseInt(document.getElementById(`streakPts${day}`).value, 10) || 0;
    const badgeName = document.getElementById(`streakBadgeName${day}`).value.trim();
    const badgeIcon = document.getElementById(`streakBadgeIcon${day}`).value.trim();
    const emojiReward = document.getElementById(`streakEmojiReward${day}`).value.trim();

    await sb.rpc("admin_set_streak_reward", {
      p_week_start: weekStart,
      p_day: day,
      p_points: points,
      p_badge_name: badgeName,
      p_badge_icon: badgeIcon,
      p_emoji_reward: emojiReward
    });
  }

  resultEl.textContent = "";
  showToast("Semana guardada");
  loadStreakWeeksOverview();
}

async function loadStreakWeeksOverview() {
  const el = document.getElementById("streakWeeksOverview");
  if (!el) return;
  const { data } = await sb.rpc("admin_get_streak_rewards");
  if (!data || !data.length) { el.innerHTML = ""; return; }

  const byWeek = {};
  data.forEach(r => {
    byWeek[r.week_start] = byWeek[r.week_start] || [];
    byWeek[r.week_start].push(r);
  });

  el.innerHTML = `<h4 style="font-size:14px; color:var(--text-dim); margin-bottom:8px;">Semanas ya cargadas:</h4>` +
    Object.keys(byWeek).sort().reverse().map(week => `
      <div class="ledger-row">
        <span>Semana del ${new Date(week + "T00:00:00").toLocaleDateString("es-AR")} — ${byWeek[week].length}/7 días cargados</span>
        <button class="btn-outline" style="padding:4px 10px; font-size:12px; color:var(--red);" onclick="handleDeleteStreakWeek('${week}')">🗑 Eliminar</button>
      </div>
    `).join("");
}

async function handleDeleteStreakWeek(weekStart) {
  if (!confirm(`¿Eliminar toda la configuración de la semana del ${new Date(weekStart + "T00:00:00").toLocaleDateString("es-AR")}?`)) return;
  const { data, error } = await sb.rpc("admin_delete_streak_week", { p_week_start: weekStart });
  if (error || !data.ok) { showToast("No se pudo eliminar"); return; }
  showToast("Semana eliminada");
  loadStreakWeeksOverview();
}

async function loadStoreEmojisList() {
  const el = document.getElementById("storeEmojisList");
  if (!el) return;
  const { data } = await sb.rpc("admin_get_store_emojis");
  if (!data || !data.length) { el.innerHTML = `<p style="color:var(--text-dim); font-size:12px;">Todavía no cargaste ningún emoji.</p>`; return; }

  el.innerHTML = data.map(e => `
    <div class="ledger-row">
      <span>
        ${e.emoji} ${escapeHtml(e.name)}
        · <span class="${getStoreBadgeRarityClass(e.rarity || "comun")}">${getStoreBadgeRarityLabel(e.rarity || "comun")}</span>
        · <span class="mono">${Number(e.price_points) === 0 ? "GRATIS" : `${e.price_points} pts`}</span>
        ${e.is_limited ? ` · <span style="color:var(--gold);font-weight:800;">LIMITED ${Math.max(0, Number(e.stock_total || 0)-Number(e.stock_sold || 0))}/${e.stock_total}</span>` : ""}
        ${!e.active ? '<span style="color:var(--text-dim);">(desactivado)</span>' : ""}
      </span>
      <div style="display:flex; gap:6px;">
        <button class="btn-outline" style="padding:4px 8px; font-size:11px;" onclick="handleToggleStoreEmoji('${e.id}', ${!e.active})">${e.active ? "Desactivar" : "Activar"}</button>
        <button class="btn-outline" style="padding:4px 8px; font-size:11px; color:var(--red);" onclick="handleDeleteStoreEmoji('${e.id}')">🗑</button>
      </div>
    </div>
  `).join("");
}

async function handleAddStoreEmoji() {
  const emoji = document.getElementById("newEmojiChar").value.trim();
  const name = document.getElementById("newEmojiName").value.trim();
  const price = Number(document.getElementById("newEmojiPrice").value || 0);
  const rarity = document.getElementById("newEmojiRarity")?.value || "comun";
  const isLimited = document.getElementById("newEmojiEdition")?.value === "limited";
  const stock = Number(document.getElementById("newEmojiStock")?.value || 0);

  if (!emoji || !name || Number.isNaN(price) || price < 0) {
    showToast("Completá emoji, nombre y precio");
    return;
  }

  if (isLimited && stock < 1) {
    showToast("Indicá el stock de la edición limitada");
    return;
  }

  const { data, error } = await sb.rpc("admin_add_store_emoji", {
    p_emoji: emoji,
    p_name: name,
    p_price: Math.floor(price),
    p_rarity: rarity,
    p_is_limited: isLimited,
    p_stock_total: isLimited ? Math.floor(stock) : null
  });

  if (error || !data?.ok) {
    showToast(data?.error === "duplicate_emoji" ? "Ese emoji ya existe" : "No se pudo agregar");
    return;
  }

  document.getElementById("newEmojiChar").value = "";
  document.getElementById("newEmojiName").value = "";
  document.getElementById("newEmojiPrice").value = "";
  document.getElementById("newEmojiRarity").value = "comun";
  document.getElementById("newEmojiEdition").value = "standard";
  document.getElementById("newEmojiStock").value = "";
  document.getElementById("newEmojiStock").disabled = true;

  showToast(isLimited ? "😎 Emoji limitado creado" : "Emoji agregado");
  loadStoreEmojisList();
}

async function handleToggleStoreEmoji(id, newActive) {
  const { data, error } = await sb.rpc("admin_toggle_store_emoji", { p_id: id, p_active: newActive });
  if (error || !data.ok) { showToast("No se pudo cambiar"); return; }
  loadStoreEmojisList();
}

async function handleDeleteStoreEmoji(id) {
  if (!confirm("¿Eliminar este emoji del catálogo? Quien ya lo compró lo conserva igual.")) return;
  const { data, error } = await sb.rpc("admin_delete_store_emoji", { p_id: id });
  if (error || !data.ok) { showToast("No se pudo eliminar"); return; }
  showToast("Emoji eliminado");
  loadStoreEmojisList();
}

async function loadStorePrices() {
  const { data } = await sb.rpc("admin_get_store_prices");
  if (!data || !data.ok || !data.prices) return;
  const p = data.prices;
  if (document.getElementById("priceBoostPlus")) document.getElementById("priceBoostPlus").value = p.boost_price_plus || "";
  if (document.getElementById("priceBoostDiamante")) document.getElementById("priceBoostDiamante").value = p.boost_price_diamante || "";
  if (document.getElementById("pricePlanPlus")) document.getElementById("pricePlanPlus").value = p.plan_upgrade_price_plus || "";
  if (document.getElementById("pricePlanDiamante")) document.getElementById("pricePlanDiamante").value = p.plan_upgrade_price_diamante || "";
}

async function handleSaveStorePrices() {
  const boostPlus = parseInt(document.getElementById("priceBoostPlus").value, 10);
  const boostDiamante = parseInt(document.getElementById("priceBoostDiamante").value, 10);
  const planPlus = parseInt(document.getElementById("pricePlanPlus").value, 10);
  const planDiamante = parseInt(document.getElementById("pricePlanDiamante").value, 10);

  if ([boostPlus, boostDiamante, planPlus, planDiamante].some(n => isNaN(n) || n < 0)) {
    showToast("Revisá que los 4 precios sean números válidos");
    return;
  }

  const { data, error } = await sb.rpc("admin_set_store_prices", {
    p_boost_price_plus: boostPlus,
    p_boost_price_diamante: boostDiamante,
    p_plan_price_plus: planPlus,
    p_plan_price_diamante: planDiamante,
  });
  if (error || !data.ok) { showToast("No se pudieron guardar los precios"); return; }
  showToast("Precios actualizados");
}


function getLimitedStockStatus(badge) {
  if (!badge?.is_limited) return "";

  const total = Math.max(0, Number(badge.stock_total || 0));
  const sold = Math.max(0, Number(badge.stock_sold || 0));
  const left = Math.max(0, total - sold);

  if (left === 0) return "soldout";
  if (left === 1) return "last";
  if (left <= 5) return "low";
  return "";
}

function getStoreBadgeRarityLabel(rarity) {
  return ({
    comun:"Común",
    rara:"Rara",
    epica:"Épica",
    legendaria:"Legendaria",
    exclusiva:"Exclusiva",
    mitica:"Mítica"
  })[rarity] || "Común";
}

function getStoreBadgeRarityClass(rarity) {
  return `ls-rarity-${["comun","rara","epica","legendaria","exclusiva","mitica"].includes(rarity) ? rarity : "comun"}`;
}

function renderLiveScroll6MythicModal(isOfficialReward = false) {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap || !document.documentElement.classList.contains("ls6-golden-preview")) return;
  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked ls6-mythic-preview-overlay" style="z-index:260;" data-modal-locked="1">
      <div class="modal-box ls6-mythic-preview-box">
        <div class="modal-box-body">
          <div class="ls6-preview-label">${isOfficialReward ? "RECOMPENSA DESBLOQUEADA · TUYA PARA SIEMPRE" : "VISTA PREVIA · TODAVÍA NO ENTREGADA"}</div>
          <div class="ls6-mythic-medal ls-equipped-medal ls-medal-rarity-mitica" aria-label="Medalla mítica Fundador de la Nueva Era"><span>6</span></div>
          <div class="ls6-mythic-rarity">MEDALLA MÍTICA</div>
          <h2>Fundador de la Nueva Era</h2>
          <p>${isOfficialReward ? "Estuviste presente en el comienzo de la Nueva Era." : "Recompensa única del lanzamiento de LiveScroll 6."}</p>
          <div class="ls6-launch-window"><b>${isOfficialReward ? "OBTENIDA" : "7 DÍAS"}</b><span>${isOfficialReward ? "ya forma parte permanente de tu colección" : "para conseguirla desde el lanzamiento"}</span></div>
          <small>${isOfficialReward ? "Es única por cuenta, no puede comprarse, venderse ni transferirse." : "Después desaparece para quienes no la obtuvieron. Quien la gane la conserva para siempre."}</small>
          <button class="btn" onclick="document.getElementById('globalModalWrap').innerHTML=''">CONTINUAR A LIVESCROLL 6</button>
        </div>
      </div>
    </div>`;
}

function openLiveScroll6MythicPreview() {
  renderLiveScroll6MythicModal(false);
}

function queueLiveScroll6MythicRewardReveal() {
  let attempts = 0;
  const tryReveal = () => {
    attempts += 1;
    const portalVisible = !!document.getElementById("ls6LaunchPortal");
    const wrap = document.getElementById("globalModalWrap");
    const anotherModalVisible = !!String(wrap?.innerHTML || "").trim();
    if (!portalVisible && !anotherModalVisible) {
      renderLiveScroll6MythicModal(true);
      return;
    }
    if (attempts < 40) setTimeout(tryReveal, 750);
  };
  setTimeout(tryReveal, 900);
}

async function claimLiveScroll6LaunchReward() {
  if (!currentUser?.id || window.__ls6LaunchClaimAttemptedFor === currentUser.id) return;
  window.__ls6LaunchClaimAttemptedFor = currentUser.id;
  try {
    const { data, error } = await sb.rpc("claim_livescroll6_launch_reward");
    if (error) {
      console.warn("Recompensa LiveScroll 6 no disponible:", error.message || error);
      return;
    }
    if (data?.ok && data?.claimed) {
      window.__myProfileBadges = null;
      queueLiveScroll6MythicRewardReveal();
    }
  } catch (error) {
    console.warn("No se pudo comprobar la recompensa LiveScroll 6:", error);
  }
}

async function loadStoreBadgesAdminList() {
  const el = document.getElementById("storeBadgesAdminList");
  if (!el) return;

  const { data, error } = await sb.rpc("admin_get_store_badges");
  if (error || !data?.length) {
    el.innerHTML = `<p style="color:var(--text-dim);font-size:12px;">Todavía no creaste medallas de tienda.</p>`;
    return;
  }

  el.innerHTML = data.map(b => `
    <div class="ledger-row">
      <span>
        ${b.badge_icon || "🏅"} ${escapeHtml(b.badge_name)}
        · <span class="${getStoreBadgeRarityClass(b.rarity)}">${getStoreBadgeRarityLabel(b.rarity)}</span>
        · <span class="mono">${b.price_points} pts</span>
        ${b.is_limited ? ` · <span style="color:var(--gold);font-weight:800;">LIMITED ${Math.max(0, Number(b.stock_total || 0) - Number(b.stock_sold || 0))}/${b.stock_total}</span>` : ""}
        ${!b.active ? `<span style="color:var(--text-dim);">(desactivada)</span>` : ""}
      </span>
      <div style="display:flex;gap:6px;">
        <button class="btn-outline" style="padding:4px 8px;font-size:11px;"
          onclick="openEditStoreBadge('${b.id}')">✏️ Editar</button>
        <button class="btn-outline" style="padding:4px 8px;font-size:11px;"
          onclick="handleToggleStoreBadge('${b.id}', ${!b.active})">${b.active ? "Desactivar" : "Activar"}</button>
        <button class="btn-outline" style="padding:4px 8px;font-size:11px;color:var(--red);"
          onclick="handleDeleteStoreBadge('${b.id}')">🗑</button>
      </div>
    </div>
  `).join("");
}

async function handleAddStoreBadge() {
  const icon = document.getElementById("newStoreBadgeIcon")?.value.trim() || "";
  const name = document.getElementById("newStoreBadgeName")?.value.trim() || "";
  const description = document.getElementById("newStoreBadgeDescription")?.value.trim() || "";
  const rarity = document.getElementById("newStoreBadgeRarity")?.value || "comun";
  const price = Number(document.getElementById("newStoreBadgePrice")?.value || 0);
  const isLimited = document.getElementById("newStoreBadgeEdition")?.value === "limited";
  const stock = Number(document.getElementById("newStoreBadgeStock")?.value || 0);

  if (!icon || !name || Number.isNaN(price) || price < 0) {
    showToast("Completá ícono, nombre y precio");
    return;
  }
  if (isLimited && stock < 1) {
    showToast("Indicá cuántas unidades tendrá la edición limitada");
    return;
  }

  const { data, error } = await sb.rpc("admin_add_store_badge", {
    p_badge_icon: icon,
    p_badge_name: name,
    p_description: description,
    p_rarity: rarity,
    p_price_points: Math.floor(price),
    p_is_limited: isLimited,
    p_stock_total: isLimited ? Math.floor(stock) : null
  });

  if (error || !data?.ok) {
    showToast(data?.error === "duplicate_name" ? "Ya existe una medalla con ese nombre" : "No se pudo crear");
    return;
  }

  document.getElementById("newStoreBadgeIcon").value = "";
  document.getElementById("newStoreBadgeName").value = "";
  document.getElementById("newStoreBadgeDescription").value = "";
  document.getElementById("newStoreBadgePrice").value = "";
  document.getElementById("newStoreBadgeEdition").value = "standard";
  document.getElementById("newStoreBadgeStock").value = "";
  document.getElementById("newStoreBadgeStock").disabled = true;
  showToast(isLimited ? "💎 Edición limitada creada" : "🏅 Medalla creada");
  loadStoreBadgesAdminList();
}


async function openEditStoreBadge(id) {
  const { data, error } = await sb.rpc("admin_get_store_badges");
  if (error) {
    showToast("No se pudo cargar la medalla");
    return;
  }

  const badge = (data || []).find(b => b.id === id);
  if (!badge) {
    showToast("Medalla no encontrada");
    return;
  }

  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="modal-overlay ls-modal-locked" style="z-index:260;" data-modal-locked="1">
      <div class="modal-box" style="max-width:440px;">
        <div class="modal-box-header" style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <h2 style="margin:0;font-size:18px;">✏️ Editar medalla</h2>
            <div style="font-size:10px;color:var(--text-dim);margin-top:3px;">Podés cambiar sus datos sin borrarla.</div>
          </div>
          <button onclick="document.getElementById('globalModalWrap').innerHTML=''"
            style="background:none;border:0;color:var(--text-dim);font-size:19px;cursor:pointer;">✕</button>
        </div>

        <div class="modal-box-body">
          <div style="display:grid;grid-template-columns:70px 1fr;gap:8px;margin-bottom:8px;">
            <input id="editStoreBadgeIcon" value="${escapeHtml(badge.badge_icon || "🏅")}" maxlength="8"
              style="padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);text-align:center;font-size:20px;">
            <input id="editStoreBadgeName" value="${escapeHtml(badge.badge_name || "")}"
              style="padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);">
          </div>

          <textarea id="editStoreBadgeDescription" rows="2" maxlength="180"
            style="width:100%;padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);resize:vertical;margin-bottom:8px;">${escapeHtml(badge.description || "")}</textarea>

          <div style="display:grid;grid-template-columns:1fr 130px;gap:8px;margin-bottom:8px;">
            <select id="editStoreBadgeRarity"
              style="padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);">
              ${["comun","rara","epica","legendaria","exclusiva"].map(r => `<option value="${r}" ${badge.rarity===r ? "selected" : ""}>${getStoreBadgeRarityLabel(r)}</option>`).join("")}
            </select>
            <input type="number" id="editStoreBadgePrice" min="0" value="${Number(badge.price_points || 0)}"
              style="padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);">
          </div>

          <div style="display:grid;grid-template-columns:1fr 130px;gap:8px;">
            <select id="editStoreBadgeEdition"
              onchange="document.getElementById('editStoreBadgeStock').disabled=this.value!=='limited';"
              style="padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);">
              <option value="standard" ${badge.is_limited ? "" : "selected"}>Edición normal</option>
              <option value="limited" ${badge.is_limited ? "selected" : ""}>Edición limitada</option>
            </select>
            <input type="number" id="editStoreBadgeStock" min="${Math.max(1, Number(badge.stock_sold || 0))}"
              value="${badge.is_limited ? Number(badge.stock_total || 1) : ""}"
              ${badge.is_limited ? "" : "disabled"}
              style="padding:10px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);">
          </div>

          ${badge.is_limited ? `<div style="font-size:9px;color:var(--text-dim);margin-top:6px;">
            Ya reclamadas/compradas: ${Number(badge.stock_sold || 0)}. El stock total no puede quedar por debajo de ese número.
          </div>` : ""}
        </div>

        <div class="modal-box-footer" style="display:flex;gap:9px;">
          <button class="btn-outline" style="flex:1;" onclick="closeManagedModal()">Cancelar</button>
          <button class="btn" style="flex:1;" onclick="handleSaveStoreBadgeEdit('${badge.id}')">Guardar cambios</button>
        </div>
      </div>
    </div>`;
}

async function handleSaveStoreBadgeEdit(id) {
  const icon = document.getElementById("editStoreBadgeIcon")?.value.trim() || "";
  const name = document.getElementById("editStoreBadgeName")?.value.trim() || "";
  const description = document.getElementById("editStoreBadgeDescription")?.value.trim() || "";
  const rarity = document.getElementById("editStoreBadgeRarity")?.value || "comun";
  const price = Number(document.getElementById("editStoreBadgePrice")?.value || 0);
  const isLimited = document.getElementById("editStoreBadgeEdition")?.value === "limited";
  const stock = Number(document.getElementById("editStoreBadgeStock")?.value || 0);

  if (!icon || !name || Number.isNaN(price) || price < 0) {
    showToast("Revisá ícono, nombre y precio");
    return;
  }

  if (isLimited && stock < 1) {
    showToast("La edición limitada necesita stock");
    return;
  }

  const { data, error } = await sb.rpc("admin_update_store_badge", {
    p_badge_id: id,
    p_badge_icon: icon,
    p_badge_name: name,
    p_description: description,
    p_rarity: rarity,
    p_price_points: Math.floor(price),
    p_is_limited: isLimited,
    p_stock_total: isLimited ? Math.floor(stock) : null
  });

  if (error || !data?.ok) {
    const messages = {
      duplicate_name:"Ya existe otra medalla con ese nombre",
      stock_below_sold:"El stock total no puede ser menor a lo ya entregado",
      invalid_price:"El precio no puede ser negativo",
      invalid_stock:"Revisá el stock"
    };
    showToast(messages[data?.error] || "No se pudo guardar");
    return;
  }

  document.getElementById("globalModalWrap").innerHTML = "";
  showToast("🏅 Medalla actualizada");
  loadStoreBadgesAdminList();
}

async function handleToggleStoreBadge(id, active) {
  const { data, error } = await sb.rpc("admin_toggle_store_badge", {
    p_badge_id: id,
    p_active: active
  });

  if (error || !data?.ok) {
    showToast("No se pudo cambiar");
    return;
  }

  loadStoreBadgesAdminList();
}

async function handleDeleteStoreBadge(id) {
  if (!confirm("¿Eliminar esta medalla de la tienda? Quienes ya la compraron la conservan.")) return;

  const { data, error } = await sb.rpc("admin_delete_store_badge", {
    p_badge_id: id
  });

  if (error || !data?.ok) {
    showToast("No se pudo eliminar");
    return;
  }

  showToast("Medalla eliminada de la tienda");
  loadStoreBadgesAdminList();
}

async function loadStoreItemsList() {
  const el = document.getElementById("storeItemsList");
  if (!el) return;
  const { data } = await sb.rpc("admin_get_store_items");
  if (!data || !data.length) { el.innerHTML = `<p style="color:var(--text-dim); font-size:12px;">Todavía no cargaste ningún artículo nuevo.</p>`; return; }

  el.innerHTML = data.map(it => `
    <div class="ledger-row">
      <span>${it.icon} ${escapeHtml(it.name)} <span style="color:var(--text-dim); font-size:11px;">(${escapeHtml(it.category)})</span> · <span class="mono">${it.price_points} pts</span> ${!it.active ? '<span style="color:var(--text-dim);">(desactivado)</span>' : ""}</span>
      <div style="display:flex; gap:6px;">
        <button class="btn-outline" style="padding:4px 8px; font-size:11px;" onclick="handleToggleStoreItem('${it.item_id}', ${!it.active})">${it.active ? "Desactivar" : "Activar"}</button>
        <button class="btn-outline" style="padding:4px 8px; font-size:11px; color:var(--red);" onclick="handleDeleteStoreItem('${it.item_id}')">🗑</button>
      </div>
    </div>
  `).join("");
}

async function loadProfileTitlesAdminList() {
  const el = document.getElementById("profileTitlesAdminList");
  if (!el) return;

  const [{ data, error }, { data: rarityRows }] = await Promise.all([
    sb.rpc("admin_get_store_items"),
    sb.from("store_items").select("id,rarity").eq("category", "title")
  ]);
  if (error) {
    el.innerHTML = `<p class="error-msg">No se pudieron cargar los títulos.</p>`;
    return;
  }

  const rarityById = new Map((rarityRows || []).map(row => [row.id, normalizeProfileTitleRarity(row.rarity)]));
  const titles = (data || [])
    .filter(it => String(it.category || "").toLowerCase() === "title")
    .map(it => ({
      ...it,
      rarity:rarityById.get(it.item_id || it.id) || normalizeProfileTitleRarity(it.rarity)
    }));

  if (!titles.length) {
    el.innerHTML = `<p style="color:var(--text-dim);font-size:12px;">Todavía no creaste títulos de perfil.</p>`;
    return;
  }

  el.innerHTML = titles.map(it => `
    <div class="ledger-row">
      <span>
        ${it.icon || "🏷️"} ${escapeHtml(it.name)}
        · <span class="${getStoreBadgeRarityClass(normalizeProfileTitleRarity(it.rarity))}" style="font-size:10px;font-weight:900;text-transform:uppercase;">${getStoreBadgeRarityLabel(normalizeProfileTitleRarity(it.rarity))}</span>
        · <span class="mono">${it.price_points} pts</span>
        ${!it.active ? '<span style="color:var(--text-dim);">(desactivado)</span>' : ""}
      </span>
      <div style="display:flex;gap:6px;">
        <select
          id="profileTitleRarity-${it.item_id}"
          class="${getStoreBadgeRarityClass(normalizeProfileTitleRarity(it.rarity))}"
          onchange="handleSaveProfileTitleRarityAdmin('${it.item_id}', this.value)"
          style="padding:4px 7px;font-size:10px;font-weight:900;background:var(--ink);border:1px solid currentColor;border-radius:7px;"
          title="Cambiar rareza"
        >
          ${["comun","rara","epica","legendaria","exclusiva"].map(r => `<option value="${r}" ${normalizeProfileTitleRarity(it.rarity) === r ? "selected" : ""}>${getStoreBadgeRarityLabel(r)}</option>`).join("")}
        </select>
        <button
          class="btn-outline"
          style="padding:4px 8px;font-size:11px;"
          onclick="handleToggleStoreItem('${it.item_id}', ${!it.active}); setTimeout(loadProfileTitlesAdminList,250);"
        >${it.active ? "Desactivar" : "Activar"}</button>
        <button
          class="btn-outline"
          style="padding:4px 8px;font-size:11px;color:var(--red);"
          onclick="handleDeleteStoreItem('${it.item_id}'); setTimeout(loadProfileTitlesAdminList,250);"
        >🗑</button>
      </div>
    </div>
  `).join("");
}

async function handleSaveProfileTitleRarityAdmin(itemId, rarity) {
  const safeRarity = normalizeProfileTitleRarity(rarity);
  const { data, error } = await sb.rpc("admin_set_store_item_rarity", {
    p_item_id:itemId,
    p_rarity:safeRarity
  });

  if (error || !data?.ok) {
    showToast("No se pudo guardar la rareza. Ejecutá el SQL incluido.");
    await loadProfileTitlesAdminList();
    return;
  }

  showToast(`Rareza guardada: ${getStoreBadgeRarityLabel(safeRarity)}`);
  await loadProfileTitlesAdminList();
}

async function handleAddProfileTitleAdmin() {
  const icon = document.getElementById("newProfileTitleIcon")?.value.trim();
  const name = document.getElementById("newProfileTitleName")?.value.trim();
  const rarity = document.getElementById("newProfileTitleRarity")?.value || "comun";
  const rawPrice = document.getElementById("newProfileTitlePrice")?.value;
  const price = Number.parseInt(rawPrice, 10);

  if (!icon || !name || Number.isNaN(price) || price < 0) {
    showToast("Completá ícono, nombre y precio");
    return;
  }

  const { data, error } = await sb.rpc("admin_add_profile_title", {
    p_icon:icon,
    p_name:name,
    p_rarity:rarity,
    p_price:price
  });

  if (error || !data?.ok) {
    const messages = {
      no_autorizado:"No tenés permiso de administrador.",
      datos_incompletos:"Completá ícono y nombre.",
      precio_invalido:"El precio no es válido.",
      rareza_invalida:"La rareza no es válida.",
      titulo_duplicado:"Ya existe un título con ese nombre."
    };
    showToast(messages[data?.error] || "No se pudo crear el título. Ejecutá el SQL incluido.");
    return;
  }

  document.getElementById("newProfileTitleIcon").value = "";
  document.getElementById("newProfileTitleName").value = "";
  document.getElementById("newProfileTitleRarity").value = "comun";
  document.getElementById("newProfileTitlePrice").value = "";

  showToast(`🏷️ Título ${getStoreBadgeRarityLabel(rarity)} creado correctamente`);
  await loadProfileTitlesAdminList();
  loadStoreItemsList();
}

async function handleAddStoreItem() {
  const category = document.getElementById("newItemCategory").value.trim();
  const icon = document.getElementById("newItemIcon").value.trim();
  const name = document.getElementById("newItemName").value.trim();
  const price = parseInt(document.getElementById("newItemPrice").value, 10);

  if (!category || !icon || !name || !price) { showToast("Completá los 4 campos"); return; }

  const { data, error } = await sb.rpc("admin_add_store_item", { p_category: category, p_icon: icon, p_name: name, p_price: price });
  if (error || !data.ok) { showToast("No se pudo agregar"); return; }

  document.getElementById("newItemCategory").value = "";
  document.getElementById("newItemIcon").value = "";
  document.getElementById("newItemName").value = "";
  document.getElementById("newItemPrice").value = "";
  showToast("Artículo agregado");
  loadStoreItemsList();
}

async function handleToggleStoreItem(id, newActive) {
  const { data, error } = await sb.rpc("admin_toggle_store_item", { p_id: id, p_active: newActive });
  if (error || !data.ok) { showToast("No se pudo cambiar"); return; }
  loadStoreItemsList();
}

async function handleDeleteStoreItem(id) {
  if (!confirm("¿Eliminar este artículo? Quien ya lo compró lo conserva igual.")) return;
  const { data, error } = await sb.rpc("admin_delete_store_item", { p_id: id });
  if (error || !data.ok) { showToast("No se pudo eliminar"); return; }
  showToast("Artículo eliminado");
  loadStoreItemsList();
}

async function handleBumpVersion(key) {
  if (!confirm(`¿Subir la versión de "${key}"? Esto hace que le vuelva a aparecer a TODOS los usuarios.`)) return;
  const { data, error } = await sb.rpc("admin_bump_content_version", { p_content_key: key });
  if (error || !data.ok) {
    if (data?.error === "sin_contenido_cargado") {
      showToast(`Cargá primero las novedades de la versión ${data.version_esperada} en la tabla changelog_entries`);
    } else {
      showToast("No se pudo actualizar");
    }
    return;
  }
  if (key === "changelog") {
    lsStartupChangelogHistoryCache = { data:null, at:0 };
  }
  showToast("Versión actualizada");
}

async function loadPlansLockStatus() {
  const btn = document.getElementById("plansLockBtn");
  if (!btn) return;

  const { data, error } = await sb.rpc("get_app_visibility");

  if (error) {
    console.warn("No se pudo leer visibilidad de Planes:", error);
    btn.textContent = "⚠️ No se pudo leer el estado";
    btn.className = "btn-outline";
    btn.dataset.current = "open";
    return;
  }

  const status = String(data?.plans_visibility || "open");
  btn.textContent = status === "open"
    ? "🟢 Abierto — cerrar ahora"
    : "🔴 Cerrado — abrir ahora";
  btn.className = status === "open" ? "btn" : "btn-outline";
  btn.dataset.current = status;
}

async function handleTogglePlansLock() {
  const btn = document.getElementById("plansLockBtn");
  if (!btn) return;

  // Antes de cambiar, consultamos el estado REAL en Supabase.
  // Así no dependemos de un dataset viejo del botón.
  const { data: visibilityBefore, error: readError } = await sb.rpc("get_app_visibility");

  if (readError) {
    console.warn("No se pudo leer Planes antes del cambio:", readError);
    showToast("No se pudo leer el estado actual de Planes");
    return;
  }

  const current = String(visibilityBefore?.plans_visibility || "open");
  const newStatus = current === "open" ? "closed" : "open";

  btn.disabled = true;
  btn.textContent = newStatus === "open" ? "Abriendo..." : "Cerrando...";

  const { data, error } = await sb.rpc("admin_set_plans_visibility", {
    p_status: newStatus
  });

  if (error || !data?.ok) {
    btn.disabled = false;
    console.warn("No se pudo cambiar Planes:", error || data);

    const errors = {
      no_autorizado: "Tu cuenta no figura como administradora",
      not_authenticated: "Volvé a iniciar sesión",
      estado_invalido: "Estado de Planes inválido"
    };

    showToast(errors[data?.error] || `No se pudo cambiar Planes${error?.message ? ": " + error.message : ""}`);
    await loadPlansLockStatus();
    return;
  }

  // Verificación REAL posterior al cambio.
  const { data: visibilityAfter, error: verifyError } = await sb.rpc("get_app_visibility");
  const savedStatus = String(visibilityAfter?.plans_visibility || "");

  btn.disabled = false;

  if (verifyError || savedStatus !== newStatus) {
    console.warn("Planes no confirmó el cambio:", verifyError, visibilityAfter);
    showToast("Supabase no confirmó el cambio de Planes");
    await loadPlansLockStatus();
    return;
  }

  await loadPlansLockStatus();

  showToast(
    savedStatus === "open"
      ? "🟢 Planes activados"
      : "🔴 Planes desactivados"
  );
}

async function loadWalletLockStatus() {
  const btn = document.getElementById("walletLockBtn");
  if (!btn) return;
  const { data } = await sb.from("app_text_config").select("*").eq("key", "wallet_visibility").single();
  const status = data?.value || "open";
  btn.textContent = status === "open" ? "🟢 Abierto — cerrar ahora" : "🔴 Cerrado — abrir ahora";
  btn.className = status === "open" ? "btn" : "btn-outline";
  btn.dataset.current = status;
}

async function handleToggleWalletLock() {
  const btn = document.getElementById("walletLockBtn");
  const newStatus = btn.dataset.current === "open" ? "closed" : "open";
  const { data, error } = await sb.rpc("admin_set_wallet_visibility", { p_status: newStatus });
  if (error || !data.ok) { showToast("No se pudo cambiar"); return; }
  showToast(newStatus === "closed" ? "Billetera cerrada para los demás" : "Billetera abierta de nuevo");
  loadWalletLockStatus();
}


async function handleAdminSetUserPlan(userId, planId) {
  if (!currentProfile?.is_admin) {
    showToast("Solo un administrador puede cambiar planes");
    return;
  }

  const planNames = {
    standard:"Estándar",
    plus:"Plus",
    diamante:"Diamante"
  };

  const label = planNames[planId] || planId;

  if (!confirm(`¿Asignar el plan ${label} a este usuario?`)) return;

  const { data, error } = await sb.rpc("admin_set_user_plan", {
    p_user_id:userId,
    p_plan_id:planId
  });

  if (error || !data?.ok) {
    console.warn("No se pudo asignar el plan:", error || data);

    const errors = {
      no_autorizado:"Solo un administrador puede cambiar planes",
      usuario_no_encontrado:"No se encontró el usuario",
      plan_invalido:"Ese plan no existe"
    };

    showToast(errors[data?.error] || "No se pudo activar el plan");
    return;
  }

  showToast(`💎 Plan ${label} activado`);
  await renderAdmin();
}

async function handleUserSearch() {
  const query = document.getElementById("userSearchInput").value.trim();
  const resultsEl = document.getElementById("userSearchResults");
  if (!query) { resultsEl.innerHTML = ""; return; }

  resultsEl.innerHTML = "Buscando...";
  const { data, error } = await sb.rpc("admin_search_users", { p_query: query });
  renderUserCards(data, error, resultsEl);
}

async function handleCreatorApplication(applicationId, decision) {
  const approving = decision === "approve";
  if (!confirm(approving ? "¿Aprobar esta cuenta como Creador?" : "¿Rechazar esta solicitud?")) return;

  const { data, error } = await sb.rpc("admin_decide_creator_application", {
    p_application_id:applicationId,
    p_decision:approving ? "approved" : "rejected"
  });

  if (error || !data?.ok) {
    showToast("No se pudo procesar la solicitud");
    return;
  }

  showToast(approving ? "🎬 Creador aprobado" : "Solicitud rechazada");
  await renderAdmin();
  setTimeout(() => switchAdminPanelGroup("usuarios", document.querySelector('[data-admin-tab="usuarios"]')), 0);
}

async function handleListAllUsers() {
  const resultsEl = document.getElementById("userSearchResults");
  resultsEl.innerHTML = "Cargando todos los usuarios...";
  const { data, error } = await sb.rpc("admin_list_all_users");
  renderUserCards(data, error, resultsEl, true);
}

function maskPaymentInfo(value) {
  if (!value) return "";
  return "•".repeat(Math.min(value.length, 14));
}

function togglePaymentInfo(elId) {
  const el = document.getElementById(elId);
  const isMasked = el.dataset.masked !== "false";
  const realValue = el.dataset.real;
  el.textContent = isMasked ? realValue : (elId === "payEmail" ? maskEmail(realValue) : maskPaymentInfo(realValue));
  el.dataset.masked = isMasked ? "false" : "true";
}

function maskEmail(email) {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(3, user.length - 2))}@${domain}`;
}

function toggleEmailVisibility(spanId, realEmail) {
  const el = document.getElementById(spanId);
  const isMasked = el.dataset.masked !== "false";
  el.textContent = isMasked ? realEmail : maskEmail(realEmail);
  el.dataset.masked = isMasked ? "false" : "true";
}

async function renderUserCards(data, error, resultsEl, showAll) {
  if (error || !data || !data.length) {
    resultsEl.innerHTML = `<p style="color:var(--text-dim); font-size:13px;">Sin resultados.</p>`;
    return;
  }

  const plans = await loadPlans();

  resultsEl.innerHTML = (showAll ? `<p style="color:var(--text-dim); font-size:12px; margin-bottom:10px;">${data.length} usuario${data.length === 1 ? "" : "s"} en total</p>` : "") + data.map(u => `
    <div class="form-card" style="margin-bottom:10px;">
      <div style="font-weight:600;">@${escapeHtml(u.username)} ${u.ban_reason ? `<span style="color:var(--red); font-size:11px;">🚫 BANEADO</span>` : u.is_blocked ? `<span style="color:var(--gold); font-size:11px;">🕒 pendiente</span>` : ""}</div>
      <div style="color:var(--text-dim); font-size:12px;"><span id="email-card-${u.id}" data-masked="true">${escapeHtml(maskEmail(u.email))}</span> <button onclick="toggleEmailVisibility('email-card-${u.id}', '${escapeHtml(u.email || "")}')" style="background:none;border:none;cursor:pointer;font-size:12px;">👁</button> · ${u.points_balance} pts${u.plan_id ? ` · plan ${escapeHtml(plans.find(p => p.id === u.plan_id)?.name || u.plan_id)}` : ""} · desde ${new Date(u.created_at).toLocaleDateString("es-AR")}</div>
      <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn-outline" style="padding:4px 10px; font-size:12px;" onclick="handleAdjustPoints('${u.id}', '${escapeHtml(u.username)}')">± Ajustar puntos</button>
        <button class="btn-outline" style="padding:4px 10px; font-size:12px;" onclick="handleSetPlan('${u.id}', '${escapeHtml(u.username)}')">📦 Activar plan</button>
        ${u.ban_reason
          ? `<button class="btn-outline" style="padding:4px 10px; font-size:12px;" onclick="handleUnbanUser('${u.id}')">Levantar ban</button>`
          : `<button class="btn-outline" style="padding:4px 10px; font-size:12px; color:var(--red);" onclick="handleBanUser('${u.id}', '${escapeHtml(u.username)}')">🚫 Banear</button>`}
        <button class="btn-outline" style="padding:4px 10px; font-size:12px; color:var(--red);" onclick="handleDeleteAccount('${u.id}', '${escapeHtml(u.username)}')">🗑 Eliminar cuenta</button>
      </div>
    </div>
  `).join("");
}

async function handleSetPlan(userId, username) {
  if (!currentProfile?.is_admin) {
    showToast("Solo un administrador puede cambiar planes");
    return;
  }

  const plans = await loadPlans();
  const options = plans.map(p => p.name).join(" / ");
  const chosen = prompt(`Activar plan para @${username}.

Escribí exactamente uno de estos: ${options}`);
  if (!chosen) return;

  const plan = plans.find(
    p => p.name.toLowerCase() === chosen.trim().toLowerCase()
  );

  if (!plan) {
    showToast("Ese plan no existe, escribilo exacto");
    return;
  }

  const { data, error } = await sb.rpc("admin_set_user_plan", {
    p_user_id:userId,
    p_plan_id:plan.id
  });

  if (error || !data?.ok) {
    console.warn("Error activando plan:", error || data);
    showToast("No se pudo activar el plan");
    return;
  }

  showToast(`💎 Plan ${plan.name} activado`);
  handleUserSearch();
}

async function handleAdjustPoints(userId, username) {
  const amountStr = prompt(`Ajustar puntos de @${username}.\n\nPoné un número negativo para descontar (ej: -100), o positivo para sumar (ej: 50):`);
  if (amountStr === null || amountStr.trim() === "") return;
  const amount = parseInt(amountStr, 10);
  if (isNaN(amount)) { showToast("Eso no es un número válido"); return; }

  const reason = prompt("Motivo (para el registro interno):") || "";

  const { data, error } = await sb.rpc("admin_adjust_points", {
    p_user_id:userId,
    p_amount:amount,
    p_reason:reason
  });

  if (error || !data?.ok) {
    console.warn("Error ajustando puntos:", error || data);
    showToast("No se pudo ajustar los puntos");
    return;
  }

  showToast(`Puntos ajustados: ${amount > 0 ? "+" : ""}${amount}`);
  handleUserSearch();
}

async function handleBanUser(userId, username) {
  const reason = prompt(`¿Por qué baneás a @${username}? (esto queda registrado)`);
  if (!reason || !reason.trim()) { showToast("Necesitás poner un motivo"); return; }
  if (!confirm(`¿Seguro que querés banear a @${username}? No va a poder ganar puntos ni canjear.`)) return;

  const { data, error } = await sb.rpc("admin_ban_user", { p_user_id: userId, p_reason: reason.trim() });
  if (error || !data.ok) { showToast("No se pudo banear"); return; }
  showToast("Cuenta baneada");
  handleUserSearch();
}

async function handleUnbanUser(userId) {
  const { data, error } = await sb.rpc("admin_unban_user", { p_user_id: userId });
  if (error || !data.ok) { showToast("No se pudo levantar el ban"); return; }
  showToast("Ban levantado");
  handleUserSearch();
}

async function handleDeleteAccount(userId, username) {
  const confirmText = prompt(`Esto borra TODO de @${username} para siempre (videos, puntos, comentarios, todo). No se puede deshacer.\n\nEscribí "eliminar" para confirmar:`);
  if (confirmText?.trim().toLowerCase() !== "eliminar") { showToast("Cancelado"); return; }

  const { data, error } = await sb.rpc("admin_delete_account", { p_user_id: userId });
  if (error || !data.ok) { showToast("No se pudo eliminar"); return; }
  showToast("Cuenta eliminada por completo");
  handleUserSearch();
}

async function handleUnblockUser(userId) {
  const { data, error } = await sb.rpc("admin_unblock_user", { p_user_id: userId });
  if (error || !data.ok) { showToast("No se pudo desbloquear"); return; }
  showToast("Cuenta desbloqueada");
  renderAdmin();
}

async function handleApproveRedemption(id) {
  const { data, error } = await sb.rpc("admin_approve_redemption", { p_redemption_id: id });
  if (error || !data.ok) { showToast("No se pudo aprobar"); return; }
  showToast("Canje marcado como pagado");
  renderAdmin();
}

async function handleRejectRedemption(id) {
  if (!confirm("¿Seguro que querés rechazar este canje? Los puntos se le devuelven al usuario.")) return;
  const { data, error } = await sb.rpc("admin_reject_redemption", { p_redemption_id: id });
  if (error || !data.ok) { showToast("No se pudo rechazar"); return; }
  showToast("Canje rechazado, puntos devueltos");
  renderAdmin();
}

// ============================================================
// RANKING SEMANAL
// ============================================================
async function renderRanking() {
  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando ranking...</p>`;

  const { data: leaderboard, error } = await sb.rpc("get_weekly_leaderboard");
  if (error) { main.innerHTML = `<p class="error-msg">${escapeHtml(error.message || "Error desconocido")}</p>`; return; }

  const medals = ["🥇", "🥈", "🥉"];

  main.innerHTML = `
    <h1 class="page-title">🏆 Ranking semanal</h1>
    <p class="page-sub">Los que más puntos generaron en los últimos 7 días.</p>
    <div>
      ${(leaderboard || []).map((u, i) => `
        <div class="ledger-row" style="${u.username === currentProfile.username ? 'background:var(--panel-2); border-radius:8px; padding:10px;' : ''}">
          <span>${medals[i] || `#${i + 1}`} ${u.avatar_emoji || "🎬"} @${escapeHtml(u.username)}</span>
          <span class="mono" style="color:var(--gold)">${u.total_points} pts</span>
        </div>
      `).join("") || `<p style="color:var(--text-dim)">Todavía no hay actividad esta semana.</p>`}
    </div>`;
}

// ============================================================
// TIENDA DE PUNTOS
// ============================================================
async function renderStore() {
  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando tienda...</p>`;

  let emojis, myEmojis, plans, storeItems, myItems, pricesData, storeBadges, myBadges;
  try {
    const results = await Promise.allSettled([
      sb.from("store_emojis").select("*").eq("active", true).order("price_points"),
      sb.from("user_unlocked_emojis").select("emoji").eq("user_id", currentUser.id),
      loadPlans(),
      sb.from("store_items").select("*").eq("active", true).order("category").order("sort_order"),
      sb.from("user_unlocked_items").select("item_id").eq("user_id", currentUser.id),
      sb.rpc("get_store_prices"),
      sb.from("store_badges").select("*").eq("active", true).order("sort_order").order("price_points"),
      sb.from("user_badges").select("badge_name").eq("user_id", currentUser.id)
    ]);

    emojis = results[0].status === "fulfilled" ? results[0].value?.data : null;
    myEmojis = results[1].status === "fulfilled" ? results[1].value?.data : null;
    plans = results[2].status === "fulfilled" ? results[2].value : [];
    storeItems = results[3].status === "fulfilled" ? results[3].value?.data : null;
    myItems = results[4].status === "fulfilled" ? results[4].value?.data : null;
    pricesData = results[5].status === "fulfilled" ? results[5].value?.data : null;
    storeBadges = results[6].status === "fulfilled" ? results[6].value?.data : null;
    myBadges = results[7].status === "fulfilled" ? results[7].value?.data : null;

    results.forEach((r, i) => { if (r.status === "rejected") console.log("Tienda: falló la consulta #" + i, r.reason); });
  } catch (e) {
    console.log("Error cargando la tienda:", e);
    main.innerHTML = `<p class="error-msg">No se pudo cargar la tienda. Probá recargar la página.</p>`;
    return;
  }

  const myEmojiSet = new Set((myEmojis || []).map(e => e.emoji));
  const myItemSet = new Set((myItems || []).map(i => i.item_id));
  const myBadgeSet = new Set((myBadges || []).map(b => b.badge_name));
  const myPlan = plans.find(p => p.id === currentProfile.plan_id);
  const canBoost = myPlan && myPlan.id !== "standard";
  const planPrices = (pricesData && pricesData.ok && pricesData.prices) ? pricesData.prices : {};
  const boostPrice = myPlan?.id === "diamante" ? (planPrices.boost_price_diamante ?? 13500) : (planPrices.boost_price_plus ?? 3500);
  const planRank = { standard:0, plus:1, diamante:2 };
  const currentPlanRank = planRank[currentProfile.plan_id] ?? 0;

  const itemsByCategoryMap = {};
  (storeItems || []).forEach(it => {
    itemsByCategoryMap[it.category] = itemsByCategoryMap[it.category] || [];
    itemsByCategoryMap[it.category].push(it);
  });
  const itemsByCategory = Object.entries(itemsByCategoryMap);

  main.innerHTML = `
    <h1 class="page-title">🛍️ Tienda de puntos</h1>
    <p class="page-sub">Balance: <strong class="mono" style="color:var(--gold)">${currentProfile.points_balance} pts</strong></p>

    <div style="
      display:flex;
      gap:7px;
      overflow-x:auto;
      padding:4px 0 10px;
      margin-bottom:8px;
      scrollbar-width:none;
    ">
      <button class="btn-outline" onclick="document.getElementById('storePlans')?.scrollIntoView({behavior:'smooth'})" style="white-space:nowrap;padding:7px 10px;font-size:10px;">💎 Planes</button>
      <button class="btn-outline" onclick="document.getElementById('storeBoost')?.scrollIntoView({behavior:'smooth'})" style="white-space:nowrap;padding:7px 10px;font-size:10px;">⚡ Boost</button>
      <button class="btn-outline" onclick="document.getElementById('storeBadges')?.scrollIntoView({behavior:'smooth'})" style="white-space:nowrap;padding:7px 10px;font-size:10px;">🏅 Medallas</button>
      <button class="btn-outline" onclick="document.getElementById('storeEmojis')?.scrollIntoView({behavior:'smooth'})" style="white-space:nowrap;padding:7px 10px;font-size:10px;">😎 Emojis</button>
      <button class="btn-outline" onclick="document.getElementById('storeExtras')?.scrollIntoView({behavior:'smooth'})" style="white-space:nowrap;padding:7px 10px;font-size:10px;">✨ Extras</button>
    </div>

    <div id="storePlans" style="scroll-margin-top:90px;">
      <h3 style="margin-top:18px;">💎 Planes</h3>
      <p style="font-size:11px;color:var(--text-dim);margin-top:-5px;margin-bottom:12px;">
        Compará los planes y mirá claramente cuál tenés activo.
      </p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-bottom:24px;">
        ${(plans || []).map(p => {
          const isCurrent = p.id === currentProfile.plan_id;
          const rank = planRank[p.id] ?? 0;
          const canUpgrade = rank > currentPlanRank && p.id !== "standard";
          const planPrice = p.id === "plus"
            ? planPrices.plan_upgrade_price_plus
            : p.id === "diamante"
              ? planPrices.plan_upgrade_price_diamante
              : 0;

          return `
            <div class="form-card" style="
              position:relative;
              border:${isCurrent ? "1px solid rgba(250,204,21,.42)" : "1px solid var(--border)"};
              border-radius:14px;
              padding:14px;
              overflow:hidden;
              ${isCurrent ? "box-shadow:0 0 24px rgba(250,204,21,.08);" : ""}
            ">
              ${isCurrent ? `
                <div style="
                  position:absolute;top:9px;right:9px;
                  font-size:8px;font-weight:900;
                  color:var(--gold);
                  border:1px solid rgba(250,204,21,.28);
                  background:rgba(250,204,21,.07);
                  padding:3px 6px;border-radius:999px;
                ">TU PLAN</div>` : ""}

              <div style="font-size:16px;font-weight:900;margin-bottom:7px;">${escapeHtml(p.name)}</div>
              <div style="display:grid;gap:5px;font-size:10px;color:var(--text-dim);margin-bottom:12px;">
                <div>⚡ Boost x${p.boost_multiplier}</div>
                <div>🎯 Tope diario: ${Number(p.daily_cap_normal || 0).toLocaleString("es-AR")} pts</div>
                <div>📌 Videos anclados: ${p.max_pinned_videos || 0}</div>
              </div>

              ${isCurrent
                ? `<button class="btn-outline" disabled style="width:100%;opacity:.65;">Activo</button>`
                : canUpgrade
                  ? `<button class="btn" onclick="handleBuyPlan('${p.id}')" style="width:100%;">
                      Mejorar · ${Number(planPrice || 0).toLocaleString("es-AR")} pts
                    </button>`
                  : `<button class="btn-outline" disabled style="width:100%;opacity:.55;">${rank < currentPlanRank ? "Plan inferior" : "Gratis"}</button>`}
            </div>`;
        }).join("")}
      </div>
    </div>

    <div id="storeBadges" style="scroll-margin-top:90px;">
    <h3 style="margin-top:24px;">🏅 Medallas exclusivas</h3>
    <p style="font-size:11px;color:var(--text-dim);margin-top:-5px;margin-bottom:12px;">
      Coleccionalas para siempre y equipá hasta 3 en tu perfil.
    </p>

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-bottom:24px;">
      ${(storeBadges || []).length ? storeBadges.map(b => `
        <div class="form-card ls-store-badge-card ${getStoreBadgeRarityClass(b.rarity)}">
          <div class="ls-store-badge-icon">${b.badge_icon || "🏅"}</div>
          <div style="position:relative;z-index:1;font-size:12px;font-weight:700;color:var(--text);">${escapeHtml(b.badge_name)}</div>
          <div class="ls-rarity-tag">${getStoreBadgeRarityLabel(b.rarity)}</div>
          ${b.is_limited ? `
            <div style="position:relative;z-index:1;font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:900;letter-spacing:.08em;color:var(--gold);border:1px solid rgba(250,204,21,.22);background:rgba(250,204,21,.05);padding:3px 7px;border-radius:999px;">
              LIMITED · ${Math.max(0, Number(b.stock_total || 0) - Number(b.stock_sold || 0))}/${b.stock_total}
            </div>
            ${getLimitedStockStatus(b) === "last"
              ? `<div class="ls-limited-urgency ls-limited-last">⚠ ÚLTIMA UNIDAD</div>`
              : getLimitedStockStatus(b) === "low"
                ? `<div class="ls-limited-urgency">🔥 ÚLTIMAS ${Math.max(0, Number(b.stock_total || 0) - Number(b.stock_sold || 0))}</div>`
                : ""}` : ""}
          <div class="ls-store-badge-desc">${escapeHtml(b.description || "Medalla exclusiva de LiveScroll.")}</div>
          ${myBadgeSet.has(b.badge_name)
            ? `<div style="position:relative;z-index:1;font-size:10px;color:var(--green);margin-top:5px;">✓ En tu colección</div>`
            : (b.is_limited && Number(b.stock_sold || 0) >= Number(b.stock_total || 0))
              ? `<div style="position:relative;z-index:1;font-size:10px;font-weight:900;color:var(--text-dim);margin-top:5px;">AGOTADA</div>`
              : `<button class="btn-outline" style="position:relative;z-index:1;padding:6px 10px;font-size:10px;margin-top:5px;"
                  onclick="handleBuyStoreBadge('${b.id}')">${Number(b.price_points) === 0 ? "GRATIS" : `${b.price_points} pts`}</button>`}
        </div>
      `).join("") : `<p style="font-size:12px;color:var(--text-dim);">Todavía no hay medallas disponibles.</p>`}
    </div>

    </div>

    <div id="storeEmojis" style="scroll-margin-top:90px;">
    <h3 style="margin-top:24px;">😎 Emojis exclusivos</h3>
    <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:10px; margin-bottom:24px;">
      ${(emojis || []).map(e => `
        <div class="form-card ls-store-badge-card ${getStoreBadgeRarityClass(e.rarity || "comun")}" style="text-align:center;min-height:170px;">
          <div class="ls-store-badge-icon" style="font-size:34px;">${e.emoji}</div>
          <div style="position:relative;z-index:1;font-size:12px;font-weight:700;color:var(--text);">${escapeHtml(e.name)}</div>
          <div class="ls-rarity-tag">${getStoreBadgeRarityLabel(e.rarity || "comun")}</div>

          ${e.is_limited ? `
            <div style="position:relative;z-index:1;font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:900;letter-spacing:.08em;color:var(--gold);border:1px solid rgba(250,204,21,.22);background:rgba(250,204,21,.05);padding:3px 7px;border-radius:999px;">
              LIMITED · ${Math.max(0, Number(e.stock_total || 0)-Number(e.stock_sold || 0))}/${e.stock_total}
            </div>
            ${getLimitedStockStatus(e) === "last"
              ? `<div class="ls-limited-urgency ls-limited-last">⚠ ÚLTIMA UNIDAD</div>`
              : getLimitedStockStatus(e) === "low"
                ? `<div class="ls-limited-urgency">🔥 ÚLTIMAS ${Math.max(0, Number(e.stock_total || 0)-Number(e.stock_sold || 0))}</div>`
                : ""}` : ""}

          ${myEmojiSet.has(e.emoji)
            ? `<span style="position:relative;z-index:1;font-size:10px;color:var(--green);margin-top:5px;">✓ En tu colección</span>`
            : (e.is_limited && Number(e.stock_sold || 0) >= Number(e.stock_total || 0))
              ? `<span style="position:relative;z-index:1;font-size:10px;font-weight:900;color:var(--text-dim);margin-top:5px;">AGOTADO</span>`
              : `<button class="btn-outline" style="position:relative;z-index:1;padding:6px 10px;font-size:10px;margin-top:5px;" onclick="handleBuyEmoji('${e.id}')">${Number(e.price_points) === 0 ? "GRATIS" : `${e.price_points} pts`}</button>`}
        </div>
      `).join("")}
    </div>

    </div>

    <div id="storeBoost" style="scroll-margin-top:90px;">
    <h3 style="margin-top:24px;">⚡ Boost extra</h3>
    <div class="form-card" style="margin-bottom:24px;">
      ${canBoost ? `
        <p style="font-size:13px; color:var(--text-dim); margin-bottom:10px;">Activá un boost x${myPlan.boost_multiplier} por 24hs ahora mismo, aparte del gratis de tu plan.</p>
        <button class="btn" onclick="handleBuyBoost()">Comprar boost — ${boostPrice} pts</button>
      ` : `<p style="font-size:13px; color:var(--text-dim);">Este beneficio es solo para planes Plus o Diamante.</p>`}
    </div>

    </div>

    <div id="storeExtras" style="scroll-margin-top:90px;">
    ${itemsByCategory.length ? itemsByCategory.map(([category, items]) => `
      <h3 style="margin-top:24px;">${String(category).toLowerCase() === "title" ? "🏷️ Títulos de perfil" : `✨ ${escapeHtml(category)}`}</h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:10px; margin-bottom:24px;">
        ${items.map(it => {
          const isTitle = String(it.category || "").toLowerCase() === "title";
          const itemRarity = normalizeProfileTitleRarity(it.rarity);
          const rarityClass = isTitle ? getStoreBadgeRarityClass(itemRarity) : "";
          return `
          <div class="form-card ${isTitle ? `ls-store-badge-card ${rarityClass}` : ""}" style="text-align:center;">
            <div class="${isTitle ? "ls-store-badge-icon" : ""}" style="font-size:30px;${isTitle ? "margin-left:auto;margin-right:auto;" : ""}">${it.icon}</div>
            <div style="font-size:12px; margin:4px 0;">${escapeHtml(it.name)}</div>
            ${isTitle ? `<div class="ls-rarity-tag">${getStoreBadgeRarityLabel(itemRarity)}</div>` : ""}
            ${myItemSet.has(it.id)
              ? `<span style="font-size:11px; color:var(--green);">✓ Tenés este</span>`
              : `<button class="btn-outline" style="padding:4px 8px; font-size:11px;" onclick="handleBuyStoreItem('${it.id}')">${it.price_points} pts</button>`}
          </div>
        `}).join("")}
      </div>
    `).join("") : ""}`;
}

async function handleBuyEmoji(emojiId) {
  const btn = document.querySelector(`[onclick="handleBuyEmoji('${emojiId}')"]`);
  const isFree = btn?.textContent?.trim() === "GRATIS";

  if (!confirm(isFree
    ? "¿Reclamar este emoji gratis? Quedará en tu colección."
    : "¿Comprar este emoji? Quedará en tu colección.")) return;

  const { data, error } = await sb.rpc("buy_emoji", {
    p_user_id: currentUser.id,
    p_emoji_id: emojiId
  });

  if (error || !data?.ok) {
    const msgs = {
      saldo_insuficiente:"No tenés suficientes puntos.",
      ya_lo_tenes:"Ya tenés este emoji.",
      no_disponible:"Este emoji ya no está disponible.",
      agotado:"Esta edición limitada se agotó."
    };
    showToast(msgs[data?.error] || "No se pudo obtener el emoji");
    return;
  }

  currentProfile.points_balance = Number(data.new_balance ?? currentProfile.points_balance);
  updateBalanceUI();

  const serialText = data.serial_number && data.stock_total
    ? ` · #${data.serial_number}/${data.stock_total}`
    : "";

  showToast(`¡Desbloqueaste ${data.emoji}!${serialText}`);
  renderStore();
}

async function handleBuyBoost() {
  const { data, error } = await sb.rpc("buy_extra_boost", { p_user_id: currentUser.id });
  if (error || !data.ok) {
    const msgs = { saldo_insuficiente: "No tenés suficientes puntos.", boost_ya_activo: "Ya tenés un boost activo." };
    showToast(msgs[data?.error] || "No se pudo comprar");
    return;
  }
  await loadProfile();
  updateBalanceUI();
  showToast("¡Boost activado por 24hs!");
  renderStore();
}


async function handleBuyStoreBadge(badgeId) {
  const badgeCard = document.querySelector(`[onclick="handleBuyStoreBadge('${badgeId}')"]`);
  const isFree = badgeCard?.textContent?.trim() === "GRATIS";

  if (!confirm(isFree
    ? "¿Reclamar esta medalla gratis? Quedará permanentemente en tu colección."
    : "¿Comprar esta medalla? Quedará permanentemente en tu colección.")) return;

  const { data, error } = await sb.rpc("buy_store_badge", {
    p_badge_id: badgeId
  });

  if (error || !data?.ok) {
    console.error("Compra de medalla falló:", error || data);
    const code = data?.error || "";
    const messages = {
      saldo_insuficiente:"No tenés suficientes puntos.",
      ya_la_tenes:"Ya tenés esta medalla.",
      no_disponible:"Esta medalla ya no está disponible.",
      agotada:"Esta edición limitada se agotó.",
      not_authenticated:"Tu sesión necesita renovarse."
    };
    showToast(messages[code] || "No se pudo comprar la medalla");
    return;
  }

  currentProfile.points_balance = Number(data.new_balance ?? currentProfile.points_balance);
  updateBalanceUI();

  // Forzamos refresco del perfil para que aparezca inmediatamente
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
