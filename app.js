// ============================================================
// LIVESCROLL ¬∑ FIRMA OFICIAL DEL PROYECTO
// Creador p√∫blico: @EzequielIUTU ¬∑ Argentina ¬∑ 2026
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
// As√≠ LiveScroll 6 conserva su experiencia y LiveScroll 7 recibe la propia.
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
    <div class="ls-generation-filter" aria-label="Filtrar por generaci√≥n">${options.map(([value,label]) =>
      `<button type="button" class="${lsGenerationFeedFilter === value ? "active" : ""}" onclick="setGenerationFeedFilter('${value}')">${label}</button>`
    ).join("")}</div>
    <div class="ls-generation-weekly-pulse" id="lsGenerationWeeklyPulse">Esta semana ¬∑ calculando pulso‚Ä¶</div>
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
    target.innerHTML = `Esta semana ¬∑ <b>LS6 ${ls6}</b><i>VS</i><b>LS7 ${ls7}</b>`;
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
  document.getElementById("lsGenerationWeeklyPulse").innerHTML = `Esta semana ¬∑ <b>LS6 ${data.ls6}</b><i>VS</i><b>LS7 ${data.ls7}</b>`;
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
      <strong>${stats.both ? "‚ö° Usuario de ambas generaciones" : stats.ls7 ? "Nueva Generaci√≥n" : stats.ls6 ? "Generaci√≥n Cl√°sica" : "LiveScroll Web"}</strong>
      <span>${stats.both ? "Public√≥ desde LiveScroll 6 y LiveScroll 7." : own ? "Tu historia en LiveScroll se construye con cada publicaci√≥n." : "Su recorrido dentro de LiveScroll."}</span>
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
  document.title = "LiveScroll 7 ‚Äî La nueva generaci√≥n";
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
// CONFIGURACI√ìN ‚Äî reemplaz√° con tus datos de Supabase
// (Project Settings > API en tu dashboard de Supabase)
// ============================================================
const SUPABASE_URL = "https://lxpjqvlphvjyygifedeb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4cGpxdmxwaHZqeXlnaWZlZGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTMyMTMsImV4cCI6MjA5ODk4OTIxM30.9ovZlNQ-XKdSszZuMYb6PzRnXtX5eejuzBeqpKgkVnk";
const LIVESCROLL_MEDIA_API = "https://livescroll-media-api.ezequielmarcosrodriguez.workers.dev";

let sb;
try {
  if (!window.supabase) {
    throw new Error("La librer√≠a de Supabase no carg√≥ (revis√° tu conexi√≥n a internet o si un bloqueador de anuncios la est√° frenando).");
  }
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (err) {
  document.addEventListener("DOMContentLoaded", () => {
    document.body.innerHTML = `
      <div style="max-width:500px;margin:80px auto;padding:24px;background:#1C2027;border:1px solid #F87171;border-radius:12px;color:#fff;font-family:sans-serif;">
        <h2 style="color:#F87171;margin-top:0;">Error al conectar</h2>
        <p>${err.message}</p>
        <p style="color:#9AA0A8;font-size:13px;">Revis√° la consola del navegador (F12) para m√°s detalle.</p>
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
let watchSeconds = {};   // video_id -> segundos acumulados sin enviar a√∫n
let feedObserverInstance = null;
let loadedEmbeds = new Set(); // video_id -> reproductor real cargado ahora mismo

async function uploadMediaToR2(file) {
  if (!(file instanceof Blob) || !file.size) throw new Error("El archivo est√° vac√≠o");

  const { data:{ session }, error:sessionError } = await sb.auth.getSession();
  if (sessionError || !session?.access_token) {
    throw new Error("Tu sesi√≥n venci√≥. Volv√© a iniciar sesi√≥n para subir el archivo.");
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
      usuario_no_autorizado:"Tu sesi√≥n venci√≥. Volv√© a iniciar sesi√≥n.",
      tipo_de_archivo_no_permitido:"Ese formato todav√≠a no est√° permitido.",
      archivo_demasiado_grande:`El archivo supera el l√≠mite de ${result?.max_mb || 95} MB.`,
      origen_no_autorizado:"LiveScroll no pudo validar el origen de la subida.",
      configuracion_incompleta:"El servidor de archivos todav√≠a no termin√≥ de configurarse."
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
    console.warn("El registro se elimin√≥, pero qued√≥ un archivo pendiente de limpieza en R2.");
  }
}

// ============================================================
// 5.8.8 ¬∑ MOBILE STABILITY
// Altura visible real para barras m√≥viles, teclado y zonas seguras.
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
// LIVESCROLL ¬∑ REPORTE DE SEGURIDAD V1
// Flujo p√∫blico desde el correo "Tu contrase√±a fue cambiada".
// NO cambia contrase√±as. Solo registra un caso para revisi√≥n.
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
          ">üö®</div>

          <div style="
            font-size:9px;
            font-weight:900;
            letter-spacing:.14em;
            color:#fb7185;
          ">LIVESCROLL ¬∑ SEGURIDAD</div>

          <h2 style="margin:7px 0 6px;">Reportar cambio de contrase√±a</h2>

          <p style="
            margin:0;
            color:var(--text-dim);
            font-size:11px;
            line-height:1.55;
          ">
            Complet√° este formulario solamente si recibiste un aviso de cambio
            de contrase√±a que no reconoc√©s. El reporte ser√° revisado antes de
            realizar cualquier acci√≥n sobre la cuenta.
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
            Este enlace no contiene una cuenta v√°lida. Volv√© al correo de seguridad
            de LiveScroll y us√° el bot√≥n ‚ÄúNo fui yo‚Äù.
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
            üîí Este correo viene del aviso de seguridad y no puede editarse.
          </div>
        </div>

        <div class="field">
          <label>¬øQu√© ocurri√≥?</label>
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
            <option value="">Seleccion√° un motivo</option>
            <option value="password_change_not_recognized">No reconozco el cambio de contrase√±a</option>
            <option value="lost_access_after_change">Perd√≠ el acceso despu√©s del cambio</option>
            <option value="possible_account_takeover">Creo que otra persona ingres√≥ a mi cuenta</option>
            <option value="suspicious_security_email">Recib√≠ un correo de seguridad que me resulta sospechoso</option>
            <option value="other">Otro problema relacionado con mi contrase√±a</option>
          </select>
        </div>

        <div class="field">
          <label>Contanos qu√© pas√≥</label>
          <textarea
            id="securityReportDetails"
            maxlength="1500"
            rows="6"
            placeholder="Ejemplo: recib√≠ el correo a las 12:20, yo no hab√≠a solicitado ning√∫n cambio y desde entonces no puedo entrar..."
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
            No escribas contrase√±as ni c√≥digos de verificaci√≥n.
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
          üîê Enviar este reporte <strong>no cambia tu contrase√±a</strong> y no
          desbloquea la cuenta autom√°ticamente. Primero se revisa el caso.
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
    if (errorEl) errorEl.textContent = "Ingres√° el correo de la cuenta afectada.";
    return;
  }

  if (!reason) {
    if (errorEl) errorEl.textContent = "Seleccion√° el motivo del reporte.";
    return;
  }

  if (details.length < 20) {
    if (errorEl) errorEl.textContent = "Contanos un poco m√°s sobre lo ocurrido (m√≠nimo 20 caracteres).";
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
          ? "Ya recibimos un reporte reciente para este correo. Esper√° un momento antes de enviar otro."
          : "No pudimos enviar el reporte. Intent√° nuevamente.";
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
        ">‚úì</div>

        <h2 style="margin:0 0 8px;">Reporte recibido</h2>

        <p style="
          color:var(--text-dim);
          font-size:12px;
          line-height:1.6;
          margin:0 0 14px;
        ">
          Registramos tu reporte de seguridad. No se realizar√° ning√∫n cambio
          autom√°tico sobre la cuenta: el caso debe ser revisado.
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
          Guard√° el c√≥digo del caso si aparece arriba. No compartas contrase√±as
          ni c√≥digos de acceso con nadie.
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

  // El enlace "No fui yo" abre el reporte p√∫blico y no inicia la app normal.
  if (isLiveScrollSecurityReportLink()) {
    renderSecurityReportScreen();
    animateLandingOdometer();
    return;
  }

  // Suscribimos primero para capturar PASSWORD_RECOVERY antes de tratar
  // la sesi√≥n temporal del enlace como un inicio de sesi√≥n normal.
  let lsRecoveryMode = false;

  const { data: authListenerData } = sb.auth.onAuthStateChange(async (event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      lsRecoveryMode = true;
      currentUser = session?.user || null;
      showNewPasswordForm();
      return;
    }

    if (lsRecoveryMode) {
      // Mientras estamos cambiando la contrase√±a, ignoramos eventos de sesi√≥n
      // que podr√≠an mandar al usuario al Feed.
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

  // Damos un instante a Supabase para procesar el enlace de recuperaci√≥n.
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

  // El listener de Auth ya fue instalado antes de leer la sesi√≥n.


  animateLandingOdometer();
});



// ============================================================
// LIVESCROLL ¬∑ POST LOGIN INTRO V1
// Transici√≥n breve entre iniciar sesi√≥n y entrar al Feed.
// No aparece al recargar una sesi√≥n ya iniciada.
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
    const seasonEmoji = isLs7 ? "7" : (seasonal?.emoji || "‚ú¶");
    const introKicker = isLs7 ? "LIVESCROLL 7 ¬∑ ANDROID" : "LiveScroll";
    const introTitle = isLs7
      ? (username ? `Cargando tu mundo, @${escapeHtml(username)}` : "Cargando LiveScroll 7")
      : (username ? `Hola, @${escapeHtml(username)}` : "Bienvenido");
    const introSubtitle = isLs7
      ? "Preparando tu feed y sincronizando tu cuenta‚Ä¶"
      : "Preparando tu LiveScroll‚Ä¶";

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
    btnEl.textContent = "üôà";
  } else {
    input.type = "password";
    btnEl.textContent = "üëÅ";
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
        <button class="ls-access-close" onclick="closeAuthModal()" aria-label="Cerrar">‚úï</button>
        <div class="ls-access-brand" aria-label="LiveScroll ${runtimeGeneration}">
          <div class="ls-access-logo">${runtimeGeneration}</div>
          <div>
            <div class="ls-access-word">Live<span>Scroll</span></div>
            <small>${isSignup ? "CRE√Å TU IDENTIDAD" : "VOLV√â A CONECTAR"}</small>
          </div>
        </div>
        <div class="ls-access-tabs">
          <button onclick="renderAuthForm('login')" class="${!isSignup ? "btn" : "btn-outline"}" style="flex:1; padding:8px; font-size:13px;">Iniciar sesi√≥n</button>
          <button onclick="renderAuthForm('signup')" class="${isSignup ? "btn" : "btn-outline"}" style="flex:1; padding:8px; font-size:13px;">Crear cuenta</button>
        </div>
        <h2>${isSignup ? "Tu camino empieza ac√°" : "Qu√© bueno verte de nuevo"}</h2>
        <p class="ls-access-subtitle">${isSignup ? "Sumate a la pr√≥xima generaci√≥n de creadores y usuarios." : "Ingres√° para continuar recorriendo LiveScroll."}</p>
        ${isSignup && window.referralCode ? `<p style="font-size:12px; color:var(--gold); margin-top:-8px; margin-bottom:14px;">üéâ Te invit√≥ @${escapeHtml(window.referralCode)}</p>` : ""}
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
          <label>Contrase√±a</label>
          <div class="password-field-wrap">
            <input type="password" id="authPassword" placeholder="‚Ä¢‚Ä¢‚Ä¢‚Ä¢‚Ä¢‚Ä¢‚Ä¢‚Ä¢" autocomplete="${isSignup ? "new-password" : "current-password"}">
            <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('authPassword', this)">üëÅ</button>
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
              La contrase√±a la guarda tu dispositivo
            </span>
          </div>` : ""}
        ${isSignup ? `
          <div class="field" style="display:flex; align-items:flex-start; gap:8px;">
            <input type="checkbox" id="authAcceptTerms" style="margin-top:3px;">
            <label for="authAcceptTerms" style="font-size:12px; color:var(--text-dim); cursor:pointer;">
              Soy mayor de 18 a√±os y acepto los <a href="terminos.html" target="_blank" rel="noopener noreferrer">T√©rminos y Condiciones</a>.
            </label>
          </div>` : ""}
        <button class="btn ls-access-submit" style="width:100%" onclick="${isSignup ? "handleSignup()" : "handleLogin()"}">
          ${isSignup ? "Crear cuenta" : "Entrar"}
        </button>
        ${!isSignup ? `<div style="text-align:center; margin-top:10px;"><button onclick="handleForgotPassword()" style="background:none;border:none;color:var(--text-dim);font-size:12px;cursor:pointer;text-decoration:underline;">¬øOlvidaste tu contrase√±a?</button></div>` : ""}
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
    errEl.textContent = "Complet√° todos los campos.";
    return;
  }

  if (password.length < 8) {
    errEl.textContent = "La contrase√±a tiene que tener al menos 8 caracteres.";
    return;
  }

  if (!document.getElementById("authAcceptTerms").checked) {
    errEl.textContent = "Ten√©s que aceptar los T√©rminos y Condiciones para continuar.";
    return;
  }

  let ip = null;
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    ip = (await ipRes.json()).ip;
  } catch (e) {
    // Si falla la detecci√≥n de IP, seguimos igual sin bloquear el registro por eso
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
    errEl.textContent = "¬°Cuenta creada! Revis√° tu email para confirmar antes de iniciar sesi√≥n.";
    return;
  }

  await loadProfile();

  if (currentProfile && currentProfile.is_blocked) {
    errEl.style.color = "var(--red)";
    errEl.textContent = "Tu cuenta fue marcada para revisi√≥n. Contactanos si cre√©s que es un error.";
    return;
  }

  closeAuthModal();

  // La primera entrada de una cuenta nueva tambi√©n recibe la transici√≥n.
  await showPostLoginIntro();

  renderApp();
}

function showNewPasswordForm() {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  // La recuperaci√≥n tiene su propia pantalla: no dejamos que el usuario
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
          ">üîê</div>
          <div style="font-size:10px;letter-spacing:.14em;color:var(--gold);font-weight:900;">
            LIVESCROLL ¬∑ SEGURIDAD
          </div>
          <h2 style="margin:6px 0 6px;">Crear nueva contrase√±a</h2>
          <div style="font-size:11px;line-height:1.5;color:var(--text-dim);">
            Eleg√≠ una contrase√±a nueva para volver a acceder a tu cuenta.
          </div>
        </div>

        <div class="field">
          <label>Nueva contrase√±a</label>
          <div class="password-field-wrap">
            <input
              type="password"
              id="newPasswordInput"
              autocomplete="new-password"
              placeholder="M√≠nimo 8 caracteres"
            >
            <button type="button" class="password-toggle-btn"
              onclick="togglePasswordVisibility('newPasswordInput', this)">üëÅ</button>
          </div>
        </div>

        <div class="field">
          <label>Repetir contrase√±a</label>
          <div class="password-field-wrap">
            <input
              type="password"
              id="repeatNewPasswordInput"
              autocomplete="new-password"
              placeholder="Repet√≠ la contrase√±a"
              onkeydown="if(event.key==='Enter') submitNewPassword()"
            >
            <button type="button" class="password-toggle-btn"
              onclick="togglePasswordVisibility('repeatNewPasswordInput', this)">üëÅ</button>
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
          Por seguridad, despu√©s del cambio vas a volver al inicio de sesi√≥n
          y tendr√°s que entrar con tu contrase√±a nueva.
        </div>

        <button id="newPasswordSubmitBtn" class="btn" style="width:100%;min-height:48px;"
          onclick="submitNewPassword()">Cambiar contrase√±a</button>

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
    if (errEl) errEl.textContent = "La contrase√±a tiene que tener al menos 8 caracteres.";
    return;
  }

  if (password !== repeat) {
    if (errEl) errEl.textContent = "Las contrase√±as no coinciden.";
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Cambiando contrase√±a...";
  }

  const { error } = await sb.auth.updateUser({ password });

  if (error) {
    if (errEl) errEl.textContent = error.message || "No pudimos cambiar la contrase√±a.";
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Cambiar contrase√±a";
    }
    return;
  }

  // La sesi√≥n del enlace de recuperaci√≥n no se usa como sesi√≥n normal.
  // Al terminar, cerramos sesi√≥n y volvemos al Login.
  try {
    await sb.auth.signOut();
  } catch (_) {}

  currentUser = null;
  currentProfile = null;
  clearAllWatchIntervals?.();

  // Quitamos tokens/hash de recuperaci√≥n de la barra del navegador.
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

  showToast("Contrase√±a cambiada ‚úì Inici√° sesi√≥n con tu contrase√±a nueva.");
}

async function handleForgotPassword() {
  const email = document.getElementById("authEmail").value.trim();
  const errEl = document.getElementById("authError");
  errEl.style.color = "";
  errEl.textContent = "";

  if (!email) {
    errEl.textContent = "Escrib√≠ tu email arriba primero, y volv√© a tocar 'Olvidaste tu contrase√±a'.";
    return;
  }

  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname
  });

  if (error) { errEl.textContent = error.message; return; }

  errEl.style.color = "var(--green)";
  errEl.textContent = "Te mandamos un mail con un link para elegir una nueva contrase√±a. Revis√° tambi√©n Spam.";
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

  // Intro breve SOLO despu√©s de un inicio de sesi√≥n expl√≠cito.
  await showPostLoginIntro();

  renderApp();
  if (window.sharedVideoId) openSharedVideo(window.sharedVideoId);
}

async function handleLogout() {
  // El cierre de sesi√≥n no depende √∫nicamente del evento SIGNED_OUT.
  // Limpiamos la interfaz y el estado local inmediatamente para evitar
  // que el Feed quede visible hasta recargar la p√°gina.
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
    console.error("Error al cerrar sesi√≥n:", error);
    showToast("No pudimos cerrar la sesi√≥n. Intent√° nuevamente.");
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

  // Respaldo: verificamos que Supabase realmente haya eliminado la sesi√≥n.
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    console.warn("La sesi√≥n segu√≠a activa despu√©s de signOut; reintentando cierre local.");
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

  // Doble verificaci√≥n de permisos:
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
  // una se√±al sospechosa siempre permanece para revision humana.
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
    <button class="btn-outline" onclick="showAuth('login')">Iniciar sesi√≥n</button>`;

  if (window.sharedVideoId) {
    const hero = document.querySelector(".hero");
    if (hero && !document.getElementById("sharedVideoTeaser")) {
      const teaser = document.createElement("div");
      teaser.id = "sharedVideoTeaser";
      teaser.className = "form-card";
      teaser.style.cssText = "max-width:460px; margin:0 auto 24px; border-color:var(--gold-dim); text-align:center;";
      teaser.innerHTML = `<p style="margin:0; font-size:14px;">üëÄ Te compartieron un clip en LiveScroll. <strong style="color:var(--gold);">Cre√° tu cuenta o inici√° sesi√≥n</strong> para verlo.</p>`;
      hero.insertBefore(teaser, hero.firstChild);
    }
  }
}

let landingOdometerRefreshTimer = null;

async function animateLandingOdometer() {
  const el = document.getElementById("landingOdometer");
  if (!el) return;

  // Puede llamarse al iniciar y tambi√©n al volver al landing. Conservamos
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
// LIVESCROLL 5.8.4 ¬∑ CONFIGURACI√ìN + ACCESIBILIDAD V1
// - Zoom completamente bloqueado (pinch/doble toque/ctrl+wheel)
// - Configuraci√≥n en men√∫ hamburguesa
// - Visi√≥n c√≥moda
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
       5.8.4 ¬∑ ACCESIBILIDAD TAMBI√âN EN CARTELES / MODALES
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

    /* Escalamos tipograf√≠as comunes usadas en carteles sin romper jerarqu√≠as. */
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

    /* Botones y controles de los carteles tambi√©n siguen Visi√≥n c√≥moda. */
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

    /* Peso de texto: aplica tambi√©n a Novedades y cualquier cartel futuro. */
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

    /* Contraste alto: Novedades, tutorial, t√©rminos, configuraci√≥n, perfil, etc. */
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

  // Refuerza el viewport aunque index.html todav√≠a tenga el meta anterior.
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

  // La elecci√≥n de idioma ahora s√≠ se refleja inmediatamente en la interfaz.
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
            <h2 style="margin:0;font-size:20px;">‚öôÔ∏è Configuraci√≥n</h2>
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
          >‚úï</button>
        </div>

        <div class="modal-box-body" style="overflow-y:auto;min-height:0;">
          <div class="ls-settings-grid">

            <div class="ls-settings-section">
              <div class="ls-settings-title">üëÅÔ∏è Visi√≥n c√≥moda</div>
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
              <div class="ls-settings-title">‚óê Contraste</div>
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
              <div class="ls-settings-title">Aa ¬∑ Fuerza de texto</div>
              <div class="ls-settings-help">
                Eleg√≠ qu√© tan marcada quer√©s ver la letra.
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
                <div class="ls-settings-title">üå¶Ô∏è Ambiente de temporada</div>
                <div class="ls-settings-help">
                  Autom√°tico sigue el calendario argentino. Tambi√©n pod√©s elegir una temporada o apagar los efectos solo en este dispositivo.
                </div>
                <select
                  id="lsPersonalSeasonalSelect"
                  aria-label="Ambiente de temporada"
                  onchange="setLiveScrollDraft('seasonalTheme',this.value)"
                  style="width:100%;min-height:44px;padding:9px 11px;border:1px solid var(--border);border-radius:10px;background:var(--panel-2);color:var(--text);font:inherit;"
                >
                  <option value="auto">üóìÔ∏è Autom√°tico seg√∫n la fecha</option>
                  <option value="off">‚ö´ Desactivado</option>
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
                    ">üé¨</div>
                    <div>
                      <div style="font-weight:900;">LiveScroll</div>
                      <div style="font-size:.78em;color:var(--text-dim);">@usuario</div>
                    </div>
                  </div>

                  <div style="line-height:1.48;">
                    As√≠ vas a ver los textos, botones y elementos principales de la interfaz.
                  </div>

                  <button class="btn" style="margin-top:11px;width:100%;pointer-events:none;">
                    Bot√≥n de ejemplo
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
              üîí El zoom de la p√°gina est√° desactivado. Visi√≥n c√≥moda permite
              agrandar la interfaz sin deformarla.
            </div>

            <div style="
              border:1px solid var(--border);
              border-radius:14px;
              padding:13px;
              background:rgba(255,255,255,.018);
            ">
              <div style="font-size:12px;font-weight:900;margin-bottom:4px;">
                ‚Ü∫ Restablecer apariencia
              </div>
              <div style="
                font-size:10px;
                line-height:1.45;
                color:var(--text-dim);
                margin-bottom:10px;
              ">
                Volv√© a la apariencia original de LiveScroll: visi√≥n, contraste
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
                <div class="ls7-runtime-settings-head"><span>7</span><div><strong>Experiencia LiveScroll 7</strong><small>Entrada exclusiva de la aplicaci√≥n Android</small></div></div>
                <p>Esta versi√≥n reemplaza el antiguo Portal 6 por una bienvenida propia, m√°s directa y preparada para la nueva generaci√≥n.</p>
                <button type="button" class="btn-outline" style="width:100%;min-height:46px;" onclick="replayLiveScroll7LoginWelcome()">‚ñ∂ Volver a ver la bienvenida</button>
              </div>` : `
              <div style="border:1px solid rgba(250,204,21,.28);border-radius:14px;padding:13px;background:linear-gradient(135deg,rgba(250,204,21,.07),rgba(72,221,242,.045));">
                <div style="font-size:12px;font-weight:900;margin-bottom:4px;color:var(--gold);">‚ú® Portal LiveScroll 6</div>
                <div style="font-size:10px;line-height:1.45;color:var(--text-dim);margin-bottom:10px;">Prob√° nuevamente la puerta, el acceso mantenido y el viaje hacia la nueva era. En Legacy se abre una versi√≥n liviana.</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                  <button type="button" class="btn-outline" style="min-height:44px;padding:9px;" onclick="replayLiveScrollRoadTo6Intro()">‚ñ∂ Presentaci√≥n completa</button>
                  <button type="button" class="btn-outline" style="min-height:44px;padding:9px;" onclick="replayLiveScrollPortalOnly()">üåÄ Solo portal</button>
                </div>
                <button type="button" class="btn-outline ls7-settings-replay" style="width:100%;min-height:46px;margin-top:8px;" onclick="replayLiveScroll7Pulse()">‚óà Volver a ver LiveScroll 7 ¬∑ El Pulso</button>
              </div>`}

            <div style="border:1px solid rgba(103,232,249,.25);border-radius:14px;padding:13px;background:rgba(103,232,249,.045);">
              <div style="font-size:12px;font-weight:900;margin-bottom:4px;color:#67e8f9;">üôà Videos ocultos</div>
              <div style="font-size:10px;line-height:1.45;color:var(--text-dim);margin-bottom:10px;">
                Revis√° los videos que marcaste como ‚ÄúNo me interesa‚Äù y volv√© a mostrarlos cuando quieras.
              </div>
              <button type="button" class="btn-outline" style="width:100%;min-height:44px;" onclick="openHiddenVideosManager()">Administrar videos ocultos</button>
            </div>

            ${isLiveScroll7App() ? `
              <div class="ls7-runtime-status-card">
                <div class="ls7-runtime-status-head"><span></span><strong>LiveScroll 7 ¬∑ Desarrollo activo</strong></div>
                <p>Est√°s dentro de la primera etapa real de LiveScroll 7 para Android. La cuenta y el contenido siguen sincronizados mientras renovamos cada apartado.</p>
                <button type="button" class="btn-outline" onclick="showLiveScroll7AppNotice()">Conocer esta etapa</button>
              </div>` : `
              <div class="ls6-active-support-card">
                <div class="ls6-active-support-head"><span></span><strong>LiveScroll 6 ¬∑ Activo y con soporte</strong></div>
                <p>Las nuevas funciones est√°n pausadas mientras construimos LiveScroll 7. LiveScroll 6 contin√∫a funcionando y recibir√° mantenimiento, seguridad y correcciones urgentes.</p>
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
        <div><h2 style="margin:0;font-size:20px;">üôà Videos ocultos</h2><div style="font-size:10px;color:var(--text-dim);margin-top:4px;">S√≥lo vos pod√©s ver esta lista</div></div>
        <button type="button" onclick="openLiveScrollSettings()" aria-label="Volver" class="btn-outline" style="min-height:40px;">‚Üê Volver</button>
      </div>
      <div class="modal-box-body" style="overflow-y:auto;min-height:0;">
        <div id="hiddenVideosList" style="color:var(--text-dim);">Cargando...</div>
      </div>
    </div>
  </div>`;
  let { data, error } = await sb.rpc("get_my_hidden_videos");
  // Recuperaci√≥n para instalaciones donde la funci√≥n anterior qued√≥ desactualizada.
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
  if (!videos.length) { list.innerHTML = `<div class="form-card" style="text-align:center;padding:24px;">No ten√©s videos ocultos ‚úì</div>`; return; }
  list.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;"><span>${videos.length} video${videos.length === 1 ? "" : "s"}</span><button class="btn-outline" onclick="restoreAllHiddenVideos()">Restaurar todos</button></div>${videos.map(video => `<div class="ledger-row" id="hidden-video-${video.video_id}" style="gap:10px;"><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(video.title || "Video")}</span><button class="btn-outline" style="flex:none;" onclick="restoreHiddenVideo('${video.video_id}')">Restaurar</button></div>`).join("")}`;
}
window.openHiddenVideosManager = openHiddenVideosManager;

async function restoreHiddenVideo(videoId) {
  const { data, error } = await sb.rpc("restore_hidden_video", { p_video_id:videoId });
  if (error || !data?.ok) return showToast("No se pudo restaurar el video");
  document.getElementById(`hidden-video-${videoId}`)?.remove();
  lsPerfCache.feed = { data:null, at:0 };
  showToast("Video restaurado ‚úì");
  if (currentTab === "feed") renderFeed();
  else openHiddenVideosManager();
}
window.restoreHiddenVideo = restoreHiddenVideo;

async function restoreAllHiddenVideos() {
  if (!confirm("¬øVolver a mostrar todos los videos ocultos?")) return;
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
      ? `Ahora se aplicar√°: ${automaticLabel}.`
      : choice === "off"
        ? "Los fondos, luces y part√≠culas estacionales quedar√°n apagados."
        : `Selecci√≥n manual: ${LS_SEASONAL_THEMES[choice]?.label || choice}.`;
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

  showToast("Configuraci√≥n aplicada ‚úì");

  // Fuerza actualizaci√≥n inmediata de la pantalla actual.
}

function resetLiveScrollSettings() {
  lsSettingsDraft = { ...LS_SETTINGS_DEFAULTS };
  refreshLiveScrollSettingsUI();
  showToast("Valores restablecidos. Toc√° Aplicar cambios para guardar.");
}



function installLiveScrollModalAccessibilityBridge() {
  if (window.__lsModalAccessibilityBridgeInstalled) return;
  window.__lsModalAccessibilityBridgeInstalled = true;

  const root = document.getElementById("globalModalWrap");
  if (!root) return;

  const observer = new MutationObserver(() => {
    // Las reglas dependen de clases del body; solo garantizamos que est√©n vigentes
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
// LIVESCROLL 5.8.4 ¬∑ TUERQUITA SOLO PC
// En celular Configuraci√≥n sigue √∫nicamente dentro del men√∫ ‚ò∞.
// ============================================================
(function installDesktopSettingsGearRule() {
  if (document.getElementById("lsPcSettingsGearStyle")) return;
  const style = document.createElement("style");
  style.id = "lsPcSettingsGearStyle";
  style.textContent = `
    .ls-pc-settings-gear { display:inline-block; }

    /* En celular:
       - Configuraci√≥n queda dentro de ‚ò∞
       - Novedades queda dentro de ‚ò∞
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
// LIVESCROLL 5.8.4 ¬∑ MODALES V1
// Protecci√≥n contra cierres accidentales.
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

    // Tocar el fondo ya no cierra. Solo damos una respuesta visual m√≠nima.
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

    // ESC tampoco descarta silenciosamente una edici√≥n importante.
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
      <span>${isLegacy ? "‚ö°" : "‚ú¶"}</span>
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
      <div><strong>LiveScroll <em>${isLiveScroll7App() ? "7" : "6"}</em></strong><small>${isLiveScroll7App() ? "Centro de control" : "Explor√° la aplicaci√≥n"}</small></div>
      <button class="ls-mobile-menu-close" onclick="closeMobileMenu()" aria-label="Cerrar">‚úï</button>
    </div>
    ${isLiveScroll7App() ? `<div class="ls7-menu-runtime-line"><i></i><span>SESI√ìN ACTIVA</span><b>${window.__liveScrollExperienceMode === "legacy" ? "FLUIDO" : "INMERSIVO"} 7</b></div>` : ""}
    <div class="ls-mobile-menu-scroll">
      <div class="ls-mobile-menu-label">Principal</div>
      <button class="${activeTab === 'feed' ? 'active' : ''}" onclick="switchTab('feed'); closeMobileMenu();"><span>‚ñ∂Ô∏è</span><b>Mirar</b></button>
      <button class="${activeTab === 'foryou' ? 'active' : ''}" onclick="switchTab('foryou'); closeMobileMenu();"><span>‚ú®</span><b>Para Ti</b></button>
      <button class="${activeTab === 'upload' ? 'active' : ''}" onclick="switchTab('upload'); closeMobileMenu();"><span>Ôºã</span><b>Subir video</b></button>
      <button class="${activeTab === 'profile' ? 'active' : ''}" onclick="switchTab('profile'); closeMobileMenu();"><span>üë§</span><b>Mi Perfil</b></button>
      <button class="${activeTab === 'users' ? 'active' : ''}" onclick="switchTab('users'); closeMobileMenu();"><span>üë•</span><b>Usuarios</b></button>
      <button class="${activeTab === 'directos' ? 'active' : ''}" onclick="switchTab('directos'); closeMobileMenu();"><span>üî¥</span><b>Directos</b></button>
      <div class="ls-mobile-menu-label">Mi cuenta</div>
      ${!window.__navWalletLocked ? `<button class="${activeTab === 'wallet' ? 'active' : ''}" onclick="switchTab('wallet'); closeMobileMenu();"><span>üí∞</span><b>Billetera</b></button>` : ""}
      <button class="${activeTab === 'store' ? 'active' : ''}" onclick="switchTab('store'); closeMobileMenu();"><span>üõçÔ∏è</span><b>Tienda</b></button>
      <button class="${activeTab === 'ranking' ? 'active' : ''}" onclick="switchTab('ranking'); closeMobileMenu();"><span>üèÜ</span><b>Ranking</b></button>
      <div class="ls-mobile-menu-label">Ayuda y ajustes</div>
      <button onclick="openChangelogHistory(); closeMobileMenu();"><span>üì¢</span><b>Novedades</b></button>
      <button onclick="showTutorialModal(); closeMobileMenu();"><span>‚ùì</span><b>C√≥mo funciona</b></button>
      <button onclick="openLiveScrollSettings(); closeMobileMenu();"><span>‚öôÔ∏è</span><b>Configuraci√≥n</b></button>
      ${currentProfile.is_admin ? `<button class="${activeTab === 'admin' ? 'active' : ''}" onclick="switchTab('admin'); closeMobileMenu();"><span>üõ†</span><b>Admin</b></button>` : ""}
      <div class="ls-mobile-menu-exit">
        ${getLiveScroll6ModeMenuMarkup()}
        <button onclick="handleLogout(); closeMobileMenu();"><span>‚Ü™</span><b>Salir</b></button>
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
// 6.0.8 ¬∑ EL PULSO ‚Äî ADELANTO DE LIVESCROLL 7
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
        <div><small>EL FUTURO EMPIEZA AC√Å</small><strong>LiveScroll <em>7</em></strong></div>
      </header>
      <div class="ls7-native-stage" id="ls7NativeStage" aria-label="Animaci√≥n interactiva de LiveScroll 7">
        <div class="ls7-native-grid"></div>
        <div class="ls7-native-beam beam-a"></div><div class="ls7-native-beam beam-b"></div>
        <div class="ls7-native-copy copy-a">TODO LO QUE CONOC√çAS...</div>
        <div class="ls7-native-copy copy-b"><span>EST√Å A PUNTO</span><b>DE EVOLUCIONAR.</b></div>
        <div class="ls7-native-seven" aria-hidden="true">
          <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
        </div>
        <div class="ls7-seven-trail" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="ls7-android-word" aria-label="Android"><span>A</span><span>N</span><span>D</span><span>R</span><span>O</span><span>I</span><span>D</span></div>
        <div class="ls7-native-name"><span>Live</span><b>Scroll</b><em>7</em></div>
        <div class="ls7-native-tag">LA NUEVA EVOLUCI√ìN</div>
        <div class="ls7-native-spark s1"></div><div class="ls7-native-spark s2"></div><div class="ls7-native-spark s3"></div>
        <button type="button" class="ls7-native-start" id="ls7NativeStart"><span>‚óà</span><b>TOC√Å PARA INICIAR EL PULSO</b></button>
        <audio id="ls7NativeAudio" preload="auto"><source src="ls7-pulse-theme.mp3" type="audio/mpeg"></audio>
      </div>
      <div class="ls7-real-hold" id="ls7RealHold" aria-hidden="true">
        <p>EL FUTURO EST√Å EN TUS MANOS</p>
        <button type="button" id="ls7HoldButton"><i></i><b>MANTEN√â<br>EL PULSO</b></button>
        <small>Manten√© presionado hasta completar el c√≠rculo</small>
      </div>
      <div class="ls7-real-reveal" id="ls7RealReveal" aria-hidden="true">
        <span>PR√ìXIMAMENTE</span><b>25 DE OCTUBRE DE 2026</b><small>LiveScroll 7</small>
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
          <small>PRIMERA ETAPA ¬∑ ANDROID</small>
          <h2>Bienvenido a la evoluci√≥n</h2>
          <p>LiveScroll 7 ya comenz√≥. Esta primera versi√≥n conserva tus cuentas, videos y funciones esenciales mientras construimos una experiencia Android cada vez m√°s nativa.</p>
          <div class="ls7-runtime-roadmap"><span>AHORA</span><b>Nueva identidad y entrada</b><span>PR√ìXIMO</span><b>Interfaz y rendimiento nativos</b></div>
          <blockquote>Tu contenido contin√∫a.<br><strong>La experiencia evoluciona.</strong></blockquote>
        </div>
        <div class="modal-box-footer"><button class="btn" style="width:100%;min-height:48px;" onclick="document.getElementById('globalModalWrap').innerHTML=''">Entrar a LiveScroll 7</button></div>
      </section>
    </div>`;
}
window.showLiveScroll7AppNotice = showLiveScroll7AppNotice;

// ============================================================
// 6.1.0 ¬∑ EL PUENTE ‚Äî CONTINUIDAD DE LIVESCROLL 6
// ============================================================
function showLiveScroll6BridgeNotice(options = {}) {
  const manual = options.manual === true;
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="modal-overlay ls-bridge-overlay" id="lsBridgeNoticeOverlay" style="z-index:170;">
      <section class="modal-box ls-bridge-box" role="dialog" aria-modal="true" aria-label="LiveScroll 6 contin√∫a activo">
        <div class="ls-bridge-mark"><span>6</span><i></i><b>7</b></div>
        <div class="modal-box-body">
          <small class="ls-bridge-kicker">6.1.0 ¬∑ EL PUENTE</small>
          <h2>LiveScroll 6 sigue m√°s vivo que nunca</h2>
          <p>Las nuevas versiones con funciones quedar√°n pausadas temporalmente mientras concentramos nuestro trabajo en construir LiveScroll 7.</p>
          <p><strong>LiveScroll 6 continuar√° funcionando con normalidad.</strong> Tus cuentas, videos, perfiles, Directos, puntos y contenido permanecer√°n disponibles.</p>
          <p>Durante este per√≠odo seguiremos realizando correcciones urgentes, mantenimiento y mejoras de seguridad cuando sean necesarias.</p>
          <blockquote>Esto no es una despedida.<br><b>Es el puente hacia la pr√≥xima evoluci√≥n.</b></blockquote>
          <div class="ls-bridge-date"><span>LiveScroll 7</span><b>25 DE OCTUBRE DE 2026</b></div>
          <div class="ls-bridge-status"><i></i><span>LiveScroll 6 contin√∫a activo y con soporte</span></div>
        </div>
        <div class="modal-box-footer ls-bridge-actions">
          <button class="btn-outline" onclick="handleLiveScroll6BridgePulse(${manual ? "true" : "false"})">‚óà Volver a ver El Pulso</button>
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
// 6.0.4v ¬∑ BOT√ìN ATR√ÅS NATIVO
// Android consulta esta funci√≥n antes de cerrar la Activity.
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
    showToast("Complet√° el recorrido para continuar");
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
      showToast("Complet√° esta pantalla para continuar");
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
// 6.0.2v ¬∑ ANDROID PERMISSION CONTEXT
// Explica el uso antes de abrir c√°mara o selector de archivos.
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
    <div class="ls-android-permission-card" role="dialog" aria-modal="true" aria-label="Permiso de ${isCamera ? "c√°mara" : "archivos"}">
      <div class="ls-android-permission-icon">${isCamera ? "üì∑" : "üìÅ"}</div>
      <div class="ls-android-permission-kicker">LIVESCROLL 6 ¬∑ PERMISO EXPLICADO</div>
      <h2>${isCamera ? "Acceso a la c√°mara" : "Acceso a tus archivos"}</h2>
      <p>${isCamera
        ? `LiveScroll necesita la c√°mara solamente para ${escapeHtml(purpose)}. No se utilizar√° en segundo plano ni se grabar√° sin que lo decidas.`
        : `LiveScroll abrir√° el selector de Android para ${escapeHtml(purpose)}. Solo podr√° usar el archivo que elijas; no revisar√° el resto de tu almacenamiento.`}</p>
      <div class="ls-android-permission-note">${isCamera
        ? "Si no lo permit√≠s, podr√°s seguir usando LiveScroll y elegir una imagen desde tus archivos."
        : "Si cancel√°s, no se subir√° nada y podr√°s continuar usando todas las dem√°s funciones."}</div>
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
    dock.setAttribute("aria-label", "Navegaci√≥n principal");
    dock.innerHTML = isLiveScroll7App() ? `
      <button data-tab="feed" onclick="switchTab('feed')" aria-label="Mirar"><span class="ls7-dock-icon"><svg viewBox="0 0 24 24"><path d="M4 5.5h16v13H4zM10 9l5 3-5 3z"/></svg></span><small>Mirar</small></button>
      <button data-tab="foryou" onclick="switchTab('foryou')" aria-label="Para Ti"><span class="ls7-dock-icon"><svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg></span><small>Para Ti</small></button>
      <button data-tab="upload" class="ls-dock-create" onclick="switchTab('upload')" aria-label="Subir video"><span class="ls7-dock-create-core"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span><small>Crear</small></button>
      <button data-tab="profile" onclick="switchTab('profile')" aria-label="Perfil"><span class="ls7-dock-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6"/></svg></span><small>Perfil</small></button>
      <button data-tab="more" onclick="toggleMobileMenu()" aria-label="M√°s opciones"><span class="ls7-dock-icon"><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg></span><small>M√°s</small></button>` : `
      <button data-tab="feed" onclick="switchTab('feed')"><span>‚ñ∂</span><small>Mirar</small></button>
      <button data-tab="foryou" onclick="switchTab('foryou')"><span>‚ú¶</span><small>Para Ti</small></button>
      <button data-tab="upload" class="ls-dock-create" onclick="switchTab('upload')"><span>Ôºã</span><small>Subir</small></button>
      <button data-tab="profile" onclick="switchTab('profile')"><span>üë§</span><small>Perfil</small></button>
      <button data-tab="more" onclick="toggleMobileMenu()"><span>‚ò∞</span><small>M√°s</small></button>`;
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
// COMPATIBILIDAD LEGACY ‚Äî Android/celulares de recursos limitados
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
        <div class="ls-mode-icon">${isLegacy ? "‚ö°" : "‚ú®"}</div>
        <div class="ls-mode-title">
          <strong>LiveScroll ${generation} ${modeName}</strong>
          <span>${isLegacy ? "M√°xima fluidez y estabilidad" : "Experiencia visual completa"}</span>
        </div>
      </div>

      <div class="ls-mode-current">
        <strong>Este dispositivo est√° usando LiveScroll ${generation} ${modeName}.</strong><br>
        ${isSeven ? "Pod√©s dejar que LiveScroll decida o elegir tu experiencia visual." : "LiveScroll elige autom√°ticamente el modo que mejor se adapta al dispositivo."}
      </div>

      ${isSeven ? `
        <div class="ls-mode-selector" role="group" aria-label="Elegir experiencia visual">
          <button type="button" class="${preference === "automatic" ? "active" : ""}" onclick="setLiveScrollExperiencePreference('automatic')"><b>Autom√°tico</b><span>Se adapta al celular</span></button>
          <button type="button" class="${preference === "immersive" ? "active" : ""}" onclick="setLiveScrollExperiencePreference('immersive')"><b>Inmersivo</b><span>Todos los efectos</span></button>
          <button type="button" class="${preference === "fluid" ? "active" : ""}" onclick="setLiveScrollExperiencePreference('fluid')"><b>Fluido</b><span>Prioriza estabilidad</span></button>
        </div>
      ` : ""}

      ${isLegacy ? `
        <div class="ls-mode-feature">
          <div class="ico">‚ö°</div>
          <div><strong>Menos carga visual</strong><span>Reduce animaciones, desenfoques y efectos pesados.</span></div>
        </div>
        <div class="ls-mode-feature">
          <div class="ico">üì±</div>
          <div><strong>Mejor compatibilidad</strong><span>Est√° pensado para celulares antiguos o con recursos limitados.</span></div>
        </div>
        <div class="ls-mode-feature">
          <div class="ico">‚ù§Ô∏è</div>
          <div><strong>Mismo LiveScroll</strong><span>Tu cuenta, contenido, puntos y funciones siguen siendo los mismos.</span></div>
        </div>
      ` : `
        <div class="ls-mode-feature">
          <div class="ico">‚ú®</div>
          <div><strong>Experiencia visual completa</strong><span>Animaciones, efectos y detalles modernos activos.</span></div>
        </div>
        <div class="ls-mode-feature">
          <div class="ico">üöÄ</div>
          <div><strong>Interfaz avanzada</strong><span>LiveScroll aprovecha las capacidades del dispositivo para ofrecer la experiencia completa.</span></div>
        </div>
        <div class="ls-mode-feature">
          <div class="ico">üîÑ</div>
          <div><strong>Adaptaci√≥n autom√°tica</strong><span>Si LiveScroll detecta un dispositivo limitado, puede activar el modo Fluido autom√°ticamente.</span></div>
        </div>
      `}

      <div class="ls-mode-note">
        No necesit√°s configurar nada. El modo se selecciona autom√°ticamente para priorizar una buena experiencia.
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
        <strong>‚ö° LiveScroll ${isLiveScroll7App() ? "7 Fluido" : "6 Legacy"} activado</strong>
        Optimizamos autom√°ticamente la experiencia para que LiveScroll funcione mejor en este dispositivo.
      `;
    } else {
      toast.innerHTML = `
        <strong>‚ú® LiveScroll ${isLiveScroll7App() ? "7 Inmersivo" : "6 Nova"}</strong>
        Est√°s usando la experiencia completa de LiveScroll.
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

  // Anti-spam POR CUENTA. Si en el mismo tel√©fono se cierra sesi√≥n y entra
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
  // las pocas cosas necesarias para construir la navegaci√≥n.
  const appView = document.getElementById("appView");
  if (appView) appView.innerHTML = renderFastSkeleton(7, "feed");

  // Empezamos a preparar el Feed mientras resolvemos navegaci√≥n y planes.
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
    <button id="tab-foryou" onclick="switchTab('foryou')">‚ú® Para Ti</button>
    <button id="tab-upload" onclick="switchTab('upload')">Subir video</button>
    <button id="tab-profile" onclick="switchTab('profile')">Mi Perfil</button>
    <button id="tab-users" onclick="switchTab('users')">üë• Usuarios</button>
    <button id="tab-directos" onclick="switchTab('directos')" style="color:var(--red)">üî¥ Directos</button>
    ${!walletLocked ? `<button id="tab-wallet" onclick="switchTab('wallet')">Billetera</button>` : ""}
    <button id="tab-store" onclick="switchTab('store')">üõçÔ∏è Tienda</button>
    <button id="tab-ranking" onclick="switchTab('ranking')">üèÜ Ranking</button>
    ${currentProfile.is_admin ? `<button id="tab-admin" onclick="switchTab('admin')" style="color:var(--green)">üõ† Admin</button>` : ""}`;

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
    <button onclick="openChangelogHistory()" title="Novedades" class="nav-changelog-btn" style="background:none; border:none; font-size:17px; cursor:pointer; margin-left:8px;">üì¢</button>
    <button class="ls-pc-settings-gear" onclick="openLiveScrollSettings()" title="Configuraci√≥n" aria-label="Configuraci√≥n" style="background:none; border:none; font-size:18px; cursor:pointer; margin-left:4px;">‚öôÔ∏è</button>
    <button id="notifBell" onclick="toggleNotifPanel()" style="position:relative; background:none; border:none; font-size:18px; cursor:pointer; margin-left:4px;">
      üîî<span id="notifBadge" class="hidden" style="position:absolute; top:-4px; right:-6px; background:var(--red); color:#fff; font-size:10px; border-radius:10px; padding:1px 5px;"></span>
    </button>
    <button class="btn-outline nav-logout-btn" style="margin-left:10px" onclick="handleLogout()">Salir</button>`;

  ensureNavigationEvolution597();
  ensureLiveScroll7HorizontalNavigation();


  // Lo visible primero.
  checkBlockedStatus();
  switchTab("feed");

  // Lo secundario ya no bloquea la aparici√≥n del Feed.
  // Realtime se conecta enseguida. El resto espera a que el navegador tenga
  // un peque√±o espacio libre para no competir con el primer video.
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

// 6.1.2 ¬∑ NUBE LIVESCROLL
// Desde esta versi√≥n, una publicaci√≥n futura puede avisar a quienes todav√≠a
// tengan LiveScroll 6 abierto y ofrecerles recargar sin cerrar su sesi√≥n.
const LIVESCROLL6_CLIENT_BUILD = 60109;
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
    console.warn("No se pudo comprobar la versi√≥n de LiveScroll 6:", error);
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
      <div style="font-size:38px;margin-bottom:10px;">‚òÅÔ∏è</div>
      <div style="font:800 11px 'JetBrains Mono',monospace;letter-spacing:.16em;color:#facc15;margin-bottom:8px;">ACTUALIZACI√ìN ${escapeHtml(requiredBuild)}</div>
      <h2 style="margin:0 0 10px;font-size:24px;">Nueva actualizaci√≥n disponible</h2>
      <p style="margin:0 0 20px;color:#cbd5e1;font-size:14px;line-height:1.55;">LiveScroll recibi√≥ mejoras mientras estabas usando la aplicaci√≥n. Reinici√° para cargar la versi√≥n m√°s reciente.</p>
      <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:10px;">
        <button id="ls6UpdateLater" class="btn-outline" style="min-height:48px;">M√°s tarde</button>
        <button id="ls6UpdateNow" class="btn" style="min-height:48px;">Reiniciar ahora</button>
      </div>
      <p style="margin:13px 0 0;color:#94a3b8;font-size:11px;">Tu sesi√≥n continuar√° iniciada.</p>
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
  if (button) { button.disabled = true; button.textContent = "Actualizando‚Ä¶"; }
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

// 7.0.1 ¬∑ ACTUALIZACIONES EN VIVO
// LiveScroll 7 usa su propio canal de versi√≥n para no interferir con la 6.
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
    console.warn("No se pudo comprobar la versi√≥n de LiveScroll 7:", error);
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
      <div class="ls7-electric-update-kicker">EVOLUCI√ìN ${escapeHtml(requiredBuild)}</div>
      <h2>Nueva energ√≠a disponible</h2>
      <p>LiveScroll 7 evolucion√≥ mientras estabas conectado. Reinici√° para activar la experiencia m√°s reciente.</p>
      <div class="ls7-electric-update-actions">
        <button id="ls7UpdateLater" class="btn-outline">M√°s tarde</button>
        <button id="ls7UpdateNow" class="btn">Activar ahora</button>
      </div>
      <small>Tu sesi√≥n seguir√° iniciada.</small>
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

const CHANGELOG_AUTO_BASELINE_VERSION = 24; // 5.8.1: desde la 25 en adelante el aviso tiene fallback autom√°tico
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

// Evita el efecto "cerr√© un cartel y apareci√≥ otro".
// T√©rminos y tutorial conservan prioridad, pero las novedades/teasers opcionales
// se limitan a UNA interrupci√≥n autom√°tica por sesi√≥n.
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

  // 5.8.6: Novedades vuelve a aparecer autom√°ticamente cuando existe
  // una versi√≥n pendiente. El sistema de confirmaci√≥n y la marca local
  // garantizan que cada versi√≥n se muestre una sola vez por usuario.
  const allowAutomaticChangelog = true;

  const seenKey = `livescroll_changelog_seen_${currentUser.id}`;

  // Leemos backend + historial en paralelo.
  // Si el backend por alg√∫n motivo no marca "pending", el historial funciona
  // como respaldo desde la versi√≥n interna 25 en adelante.
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

  // Una cuenta que ya reconoci√≥ Novedades en el backend no debe reconstruir
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
  // para una carga sin conexi√≥n o una falla temporal del RPC.

  // Si el usuario se perdi√≥ varias versiones, mostramos TODAS juntas
  // en "Mientras no estabas..." en lugar de abrir un popup por versi√≥n.
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
  // Novedades NO se muestra autom√°ticamente; queda manual.
  if (pendingData?.terms_pending) {
    showTermsUpdateModal();
    return;
  }

  if (pendingData?.tutorial_pending) {
    showTutorialModal();
    return;
  }

  // 6.1.0 ¬∑ EL PUENTE: comunicado √∫nico por cuenta. No anuncia el final de
  // LiveScroll 6; confirma que contin√∫a activo mientras construimos LS7.
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

  // 6.0.8 ¬∑ EL PULSO: no vive en el men√∫. Aparece autom√°ticamente una sola
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
  // obligatorio, pero el historial anterior queda disponible solo desde üì¢.
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
  // y completamos con la versi√≥n visible m√°s reciente si hiciera falta.
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

    // El backend compartido puede avisar que existe una versi√≥n pendiente de
    // la otra aplicaci√≥n. Si este runtime no tiene nada nuevo, no repetimos su
    // √∫ltima novedad ni confirmamos contenido ajeno.
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

  // 3) FALLBACK AUTOM√ÅTICO.
  // Desde la versi√≥n interna 25, si existe una versi√≥n nueva en el historial
  // que este dispositivo todav√≠a no vio, el cartel aparece aunque
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

  // 4) Teasers opcionales: como m√°ximo UNO por sesi√≥n y nunca inmediatamente
  // despu√©s de haber mostrado Novedades.
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
          <div class="ls-next-era-kicker">LIVE SCROLL ¬∑ NEXT ERA</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--gold);letter-spacing:.16em;margin:13px 0 5px;">NUEVA ETAPA</div>
          <h2 class="ls-next-era-title" style="font-size:clamp(29px,7vw,48px);line-height:.98;margin-bottom:8px;">5.7.9</h2>
          <div style="font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:900;color:var(--gold);letter-spacing:.12em;">CONNECTED</div>
        </div>

        <div class="ls-next-era-body" style="text-align:center;">
          <div style="font-size:40px;margin:3px 0 10px;">üì°</div>
          <h3 style="margin:0 0 8px;font-size:19px;">Una nueva forma de conectarnos comienza.</h3>
          <p style="font-size:12px;color:var(--text-dim);line-height:1.65;max-width:405px;margin:0 auto;">
            Empezamos a construir una nueva generaci√≥n de LiveScroll:
            directos m√°s r√°pidos, una experiencia m√≥vil m√°s inmediata
            y nuevas formas de mantenerte conectado.
          </p>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0 4px;">
            <div style="padding:11px 6px;border:1px solid var(--border);border-radius:12px;background:var(--panel-2);">
              <div style="font-size:20px;">‚ö°</div>
              <div style="font-size:9px;font-weight:800;margin-top:5px;">DIRECTOS M√ÅS R√ÅPIDOS</div>
            </div>
            <div style="padding:11px 6px;border:1px solid var(--border);border-radius:12px;background:var(--panel-2);">
              <div style="font-size:20px;">üì±</div>
              <div style="font-size:9px;font-weight:800;margin-top:5px;">M√ìVIL</div>
            </div>
            <div style="padding:11px 6px;border:1px solid var(--border);border-radius:12px;background:var(--panel-2);">
              <div style="font-size:20px;">üîî</div>
              <div style="font-size:9px;font-weight:800;margin-top:5px;">CONECTADOS</div>
            </div>
          </div>

          <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--gold);letter-spacing:.12em;margin-top:14px;">
            PR√ìXIMAMENTE
          </div>
        </div>

        <div class="ls-next-era-foot">
          <button class="ls-road6-btn" style="width:100%;" onclick="acknowledgeConnected579Launch(this)">
            CONTINUAR EL CAMINO ‚Üí
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
      btn.textContent = "CONTINUAR EL CAMINO ‚Üí";
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
          <div class="ls-next-era-kicker">LIVE SCROLL ¬∑ NEXT ERA</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--gold);letter-spacing:.16em;margin:13px 0 5px;">NUEVA ETAPA</div>
          <h2 class="ls-next-era-title" style="font-size:clamp(29px,7vw,48px);line-height:.98;margin-bottom:8px;">5.6.8</h2>
          <div style="font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:900;color:var(--gold);letter-spacing:.12em;">COLLECTION</div>
        </div>

        <div class="ls-next-era-body" style="text-align:center;">
          <div style="font-size:38px;margin:3px 0 10px;">üõçÔ∏è</div>
          <h3 style="margin:0 0 10px;font-size:18px;">Tu colecci√≥n est√° por evolucionar.</h3>
          <p style="font-size:12px;color:var(--text-dim);line-height:1.65;max-width:390px;margin:0 auto;">
            Comenzamos oficialmente a trabajar en una nueva etapa de LiveScroll.
            Nuevos coleccionables, ediciones especiales y nuevas formas de distinguir tu perfil.
          </p>

          <div style="margin:18px auto 4px;max-width:360px;padding:11px;border:1px solid rgba(250,204,21,.16);border-radius:12px;background:rgba(250,204,21,.035);">
            <div style="font-size:10px;color:var(--text-dim);">ESTO RECI√âN EMPIEZA</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:900;color:var(--gold);margin-top:4px;">RUMBO A LIVESCROLL 6</div>
          </div>
        </div>

        <div style="padding:0 22px 22px;">
          <button class="ls-road6-btn" style="width:100%;" onclick="acknowledgeCollection568Launch(this)">
            DESCUBRIR 5.6.8 ‚Üí
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
      btn.textContent = "DESCUBRIR 5.6.8 ‚Üí";
    }
    showToast("No se pudo guardar el aviso");
    return;
  }

  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";

  // Si todav√≠a no vio la siguiente etapa, la mostramos sin obligarlo
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
          <div class="ls-road6-kicker">LIVE SCROLL ¬∑ NEXT ERA</div>
          <div class="ls-road6-mark">‚óà</div>

          <h2 class="ls-road6-title">Algo grande<br>est√° comenzando.</h2>

          <div class="ls-road6-copy">
            LiveScroll est√° entrando en una nueva etapa. Durante las pr√≥ximas versiones vas a empezar a descubrir partes de lo que estamos preparando.
          </div>

          <div class="ls-road6-signals">
            <div class="ls-road6-signal"><b>‚ö°</b>M√°s r√°pido</div>
            <div class="ls-road6-signal"><b>üèÖ</b>M√°s personal</div>
            <div class="ls-road6-signal"><b>üîî</b>M√°s conectado</div>
            <div class="ls-road6-signal"><b>üì°</b>M√°s cerca</div>
          </div>

          <div class="ls-road6-road">
            5.4.6 ‚Üí 5.5.7 ‚Üí 5.6.8 ‚Üí 5.7.9<br>
            5.8.0 ‚Üí 5.9.0 ‚Üí 5.9.1 ‚Üí 5.9.2 ‚Üí 5.9.3 ‚Üí 5.9.4 ‚Üí 5.9.5 ‚Üí 5.9.6 ‚Üí 5.9.7 ‚Üí 5.9.8 ‚Üí 5.9.9 ‚Üí <strong>6.0.0</strong>
          </div>

          <button class="ls-road6-btn" onclick="acknowledgeRoadTo6Teaser()">
            Comenzar el camino ‚Üí
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
    showToast("No se pudo guardar todav√≠a");
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
// LIVESCROLL ¬∑ TUTORIAL V3.1 ¬∑ TOUR COMPLETO MEJORADO
// - PC: acceso visible al tutorial.
// - Omitir m√°s grande.
// - SIN Billetera ni Planes.
// - Mejor lectura.
// - Novedades/Configuraci√≥n visibles en ‚ò∞ m√≥vil.
// - Visi√≥n c√≥moda abre Configuraci√≥n real.
// - Recuperaci√≥n explicada con flujo visual.
// ============================================================

const LS_TUTORIAL_V31_STEPS = [
  {
    key:"welcome",
    icon:"üëã",
    eyebrow:"BIENVENIDA",
    title:"Conoc√© LiveScroll de verdad",
    text:"Este recorrido obligatorio aparece una sola vez para mostrarte todo lo nuevo. Pod√©s avanzar y volver atr√°s; al terminar no volver√° a interrumpirte."
  },
  {
    key:"feed",
    tab:"feed",
    selector:"#tab-feed",
    icon:"üé¨",
    eyebrow:"MIRAR",
    title:"El Feed principal",
    text:"Ac√° aparecen los videos de Usuarios y Creadores. Desliz√° o desplazate para descubrir contenido nuevo."
  },
  {
    key:"feed-actions",
    tab:"feed",
    selector:".feed-actions",
    icon:"‚ù§Ô∏è",
    eyebrow:"INTERACTUAR",
    title:"Me gusta, comentarios y compartir",
    text:"Los controles del video sirven para reaccionar, comentar y compartir. Si todav√≠a no hay videos, el recorrido contin√∫a normalmente."
  },
  {
    key:"foryou",
    tab:"foryou",
    selector:"#tab-foryou",
    icon:"‚ú®",
    eyebrow:"DESCUBRIR",
    title:"Para Ti",
    text:"Esta secci√≥n re√∫ne contenido destacado para ayudarte a encontrar publicaciones que pueden interesarte."
  },
  {
    key:"upload",
    tab:"upload",
    selector:"#tab-upload",
    icon:"‚¨ÜÔ∏è",
    eyebrow:"CREAR",
    title:"Subir video",
    text:"Desde ac√° public√°s tus clips. Eleg√≠s el archivo, complet√°s los datos y LiveScroll prepara la publicaci√≥n."
  },
  {
    key:"video-edit",
    tab:"upload",
    icon:"‚úÇÔ∏è",
    eyebrow:"RECORTAR",
    title:"Videos largos y reedici√≥n",
    text:"Pod√©s elegir un video largo, recortar solamente el fragmento que quer√©s publicar y reeditar despu√©s tus videos propios sin borrar primero el original."
  },
  {
    key:"profile",
    tab:"profile",
    selector:"#tab-profile",
    icon:"üë§",
    eyebrow:"TU ESPACIO",
    title:"Mi Perfil",
    text:"Tu perfil re√∫ne tu identidad, tus videos, medallas y actividad. Puede tardar un instante en cargar toda la informaci√≥n."
  },
  {
    key:"profile-edit",
    tab:"profile",
    selector:"button[onclick*='openEditProfile'],button[onclick*='showEditProfile']",
    icon:"‚úèÔ∏è",
    eyebrow:"PERSONALIZAR",
    title:"Editar perfil",
    text:"Desde Editar perfil pod√©s cambiar foto, portada, bio y otros datos de tu cuenta."
  },
  {
    key:"users",
    tab:"users",
    selector:"#tab-users",
    icon:"üë•",
    eyebrow:"USUARIOS",
    title:"Usuarios",
    text:"Busc√° otras personas, visit√° perfiles y descubr√≠ nuevos Usuarios y Creadores dentro de LiveScroll."
  },
  {
    key:"creators",
    tab:"profile",
    icon:"üîì",
    eyebrow:"CREADORES",
    title:"Acceso a Creador",
    text:"Todo Usuario puede agregar Instagram. Con al menos cinco videos puede solicitar acceso a Creador para desbloquear TikTok, YouTube, Twitch y Kick."
  },
  {
    key:"directos",
    tab:"directos",
    selector:"#tab-directos",
    icon:"üî¥",
    eyebrow:"EN VIVO",
    title:"Directos",
    text:"Cuando haya transmisiones p√∫blicas activas, las vas a encontrar ac√°."
  },
  {
    key:"store",
    tab:"store",
    selector:"#tab-store",
    icon:"üõçÔ∏è",
    eyebrow:"PERSONALIZAR",
    title:"Tienda",
    text:"Explor√° medallas, emojis, t√≠tulos y otros art√≠culos disponibles dentro de LiveScroll."
  },
  {
    key:"ranking",
    tab:"ranking",
    selector:"#tab-ranking",
    icon:"üèÜ",
    eyebrow:"COMUNIDAD",
    title:"Ranking",
    text:"Consult√° qui√©nes tuvieron m√°s actividad y puntos durante el per√≠odo mostrado."
  },
  {
    key:"notifications",
    selector:"#notifBell",
    icon:"üîî",
    eyebrow:"AL D√çA",
    title:"Notificaciones",
    text:"La campanita te avisa sobre interacciones, novedades y otros eventos importantes de tu cuenta."
  },
  {
    key:"news",
    selector:".nav-changelog-btn",
    icon:"üì¢",
    eyebrow:"NOVEDADES",
    title:"Novedades",
    text:"Ac√° pod√©s revisar versiones, mejoras, reparaciones y revisiones publicadas de LiveScroll."
  },
  {
    key:"settings",
    selector:".ls-pc-settings-gear",
    icon:"‚öôÔ∏è",
    eyebrow:"CONFIGURACI√ìN",
    title:"Configuraci√≥n",
    text:"En PC ten√©s acceso directo con la tuerquita. En celular est√° dentro del men√∫ ‚ò∞."
  },
  {
    key:"comfortable-vision",
    icon:"üëÅÔ∏è",
    eyebrow:"ACCESIBILIDAD",
    title:"Visi√≥n c√≥moda",
    text:"LiveScroll puede agrandar textos, botones y controles de forma ordenada. Tambi√©n pod√©s ajustar contraste y fuerza del texto."
  },
  {
    key:"android-back",
    icon:"‚Ü©Ô∏è",
    eyebrow:"ANDROID",
    title:"Bot√≥n Atr√°s inteligente",
    text:"Atr√°s cierra primero men√∫s y ventanas, vuelve al Feed desde otros apartados y solamente sale de la aplicaci√≥n con una segunda pulsaci√≥n."
  },
  {
    key:"nova-legacy",
    icon:"‚ú®",
    eyebrow:"RENDIMIENTO",
    title:"LiveScroll 6 Nova y Legacy",
    text:"Nova ofrece la experiencia visual completa. Legacy reduce efectos en celulares modestos para mantener la navegaci√≥n m√°s estable."
  },
  {
    key:"recovery",
    icon:"üîê",
    eyebrow:"SEGURIDAD",
    title:"Si olvid√°s tu contrase√±a",
    text:"Toc√° ‚ÄúOlvidaste tu contrase√±a‚Äù, abr√≠ el correo de recuperaci√≥n, escrib√≠ la nueva contrase√±a dos veces y LiveScroll te devuelve al inicio para entrar con la clave nueva.",
    visual:"recovery"
  },
  {
    key:"finish",
    icon:"üöÄ",
    eyebrow:"TODO LISTO",
    title:"Ya conoc√©s LiveScroll",
    text:"Terminaste el recorrido. Cuando quieras repasarlo, abr√≠ ‚ÄúC√≥mo funciona‚Äù desde el men√∫ o desde el acceso de PC."
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

  // Cerramos Configuraci√≥n cuando dejamos ese tramo del recorrido.
  if (!["comfortable-vision"].includes(step.key)) {
    const settingsOverlay = document.querySelector("#globalModalWrap .modal-overlay");
    if (settingsOverlay && settingsOverlay.textContent.includes("Configuraci√≥n")) {
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

  // Novedades y Configuraci√≥n: en m√≥vil abrimos el ‚ò∞ REAL.
  if (window.innerWidth <= 700 && ["news","settings"].includes(step.key)) {
    if (!document.getElementById("mobileMenuPanel")) {
      toggleMobileMenu();
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const mobileTarget =
      step.key === "news"
        ? findMobileMenuTutorialButton("Novedades")
        : findMobileMenuTutorialButton("Configuraci√≥n");

    if (mobileTarget) {
      mobileTarget.classList.add("ls-tutorial-spotlight");
      return mobileTarget;
    }
  } else if (window.innerWidth <= 700 && document.getElementById("mobileMenuPanel")) {
    closeMobileMenu();
  }

  // Visi√≥n c√≥moda: abrimos Configuraci√≥n REAL para que el usuario la vea.
  if (step.key === "comfortable-vision") {
    if (document.getElementById("mobileMenuPanel")) closeMobileMenu();

    openLiveScrollSettings();
    await new Promise(resolve => setTimeout(resolve, 60));

    // El tutorial queda arriba del modal, pero quitamos el velo para que
    // Configuraci√≥n se vea claramente detr√°s.
    const shade = document.getElementById("lsTutorialV3Shade");
    if (shade) shade.style.display = "none";

    const section = findSettingsSectionByText("Visi√≥n c√≥moda");
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

  // Editar perfil puede aparecer despu√©s de que el perfil termina de cargar.
  if (!target && step.key === "profile-edit") {
    for (let i = 0; i < 5 && !target; i++) {
      await new Promise(resolve => setTimeout(resolve, 80));
      target = findTutorialV31Target(step);
    }
  }

  if (target) {
    target.classList.add("ls-tutorial-spotlight");

    // Los controles del video deben quedarse EXACTAMENTE donde est√°n.
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
          Recorrido obligatorio ¬∑ aparece una sola vez
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
      <div><b>1Ô∏è‚É£</b><span>Ped√≠s recuperar</span></div>
      <div><b>üìß</b><span>Abr√≠s el correo</span></div>
      <div><b>üîê</b><span>Cre√°s una clave nueva</span></div>
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
    note.textContent = "Esta es la opci√≥n real de Visi√≥n c√≥moda dentro de Configuraci√≥n.";
  } else if (step.selector) {
    note.style.display = "";
    note.textContent = target
      ? "La zona resaltada es la parte real de LiveScroll que estamos explicando."
      : "La funci√≥n existe, aunque en este momento no haya un elemento disponible para resaltar.";
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
        <div class="modal-box-header"><h2>üìã Actualizamos los T√©rminos</h2></div>
        <div class="modal-box-body">
        <p style="color:var(--text-dim); font-size:13px;">Cambiamos nuestros T√©rminos y Condiciones. Por favor, revisalos antes de seguir usando LiveScroll.</p>
        <a href="terminos.html" target="_blank" rel="noopener noreferrer" class="btn-outline" style="display:block; text-align:center; text-decoration:none; margin-bottom:14px;">Leer T√©rminos y Condiciones</a>
        <div class="field" style="display:flex; align-items:flex-start; gap:8px;">
          <input type="checkbox" id="acceptNewTerms" style="margin-top:3px;">
          <label for="acceptNewTerms" style="font-size:12px; color:var(--text-dim); cursor:pointer;">Le√≠ y acepto los T√©rminos y Condiciones actualizados.</label>
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
    errEl.textContent = "Ten√©s que tildar el casillero para continuar.";
    return;
  }
  await sb.rpc("acknowledge_content", { p_user_id: currentUser.id, p_content_key: "terms" });
  document.getElementById("globalModalWrap").innerHTML = "";
  checkPendingContent(); // por si tambi√©n hay tutorial o changelog pendiente, se muestra despu√©s
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
    .replace(/^Revisi√≥n secundaria de LiveScroll\s+[0-9.]+\s+/i, "")
    .replace(/\bLiveScroll\b(?=\s+contin√∫a|\s+mantiene|\s+fue)/gi, "La app");

  return value;
}

function showLiveScroll7PulseUpdate(entries) {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  const categoryMeta = {
    nuevo:{ label:"NUEVO", icon:"‚ú¶", color:"#ff435c" },
    actualizado:{ label:"EVOLUCI√ìN", icon:"‚Üó", color:"#f4c95d" },
    emergencia:{ label:"ALERTA RESUELTA", icon:"!", color:"#fb923c" },
    reparado:{ label:"ESTABILIZADO", icon:"‚úì", color:"#7dd3fc" },
    proximamente:{ label:"PR√ìXIMA EVOLUCI√ìN", icon:"‚óå", color:"#c4b5fd" }
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
            <div class="ls7-pulse-update-kicker"><i></i> EVOLUCI√ìN DE LIVESCROLL 7</div>
            <h2>${multipleVersions ? "LiveScroll 7 evolucion√≥" : "Nueva evoluci√≥n disponible"}</h2>
            <p>${multipleVersions
              ? `Hay nuevas mejoras esperando por vos. Reunimos ${versions.length} etapas y ${totalSignals} cambios desde tu √∫ltima visita.`
              : `Hay nuevas mejoras esperando por vos. La experiencia avanz√≥ a ${escapeHtml(newestLabel)}.`}</p>
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
                    const meta = categoryMeta[line.category] || { label:String(line.category || "CAMBIO").toUpperCase(), icon:"‚Ä¢", color:"#a3a3a3" };
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
          <button onclick="handleAcceptChangelog()"><span>Descubrir los cambios</span><b>‚Üí</b></button>
          <small>LIVE<span>SCROLL</span> 7 ¬∑ TU EXPERIENCIA SIGUE EVOLUCIONANDO</small>
        </footer>
      </div>
    </div>`;
}

function showChangelogModal(entries) {
  applyLiveScrollSettings();
  const allEntries = Array.isArray(entries) ? entries : [];

  // LiveScroll 7 utiliza una experiencia propia. LiveScroll 6 conserva su
  // cartel cl√°sico y todo el comportamiento de confirmaci√≥n existente.
  if (isLiveScroll7App()) {
    const version7Entries = allEntries.filter(entry =>
      /^7(?:\.|$)/.test(String(entry?.display_version || ""))
    );
    if (version7Entries.length) showLiveScroll7PulseUpdate(version7Entries);
    return;
  }
  const secondaryEntries = allEntries.filter(isSecondaryRevisionEntry);

  // Si este aviso corresponde SOLO a una revisi√≥n secundaria,
  // lo mostramos separado de la publicaci√≥n principal de la versi√≥n.
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
      // El encabezado ya comunica que la revisi√≥n fue aprobada.
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
              ">üõ°Ô∏è REVISI√ìN SECUNDARIA</div>

              <h2 style="margin:0;font-size:22px;">Seguridad revisada y aprobada</h2>

              <div style="font-size:11px;color:var(--text-dim);margin-top:5px;">
                ${escapeHtml(displayVersion)} ¬∑ revisi√≥n adicional
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
              Completamos una nueva revisi√≥n interna enfocada en protecci√≥n,
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
                  <span style="color:#60a5fa;font-weight:900;">‚úì</span>
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
              Entendido ‚úì
            </button>
          </div>
        </div>
      </div>`;
    return;
  }

  const labels = {
    nuevo: { title: "üÜï Nuevo", color: "var(--green)" },
    actualizado: { title: "üîÑ Mejora", color: "var(--gold)" },
    emergencia: { title: "‚ö†Ô∏è Reparaci√≥n de emergencia", color: "#facc15" },
    reparado: { title: "üõ†Ô∏è Reparado", color: "#7dd3fc" },
    proximamente: { title: "üîú Pr√≥ximamente", color: "var(--text-dim)" }
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

  // Versiones anteriores al camino a 6 conservan el modal cl√°sico.
  if (!isNextEra) {
    const wrap = document.getElementById("globalModalWrap");
    wrap.innerHTML = `
      <div id="changelogOverlay" class="modal-overlay" style="transition:opacity .35s ease;">
        <div id="changelogBox" class="modal-box" style="max-width:440px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;transition:transform .35s ease,opacity .35s ease;">
          <div class="modal-box-header">
            <div>
              <h2 style="margin:0;">${multipleVersions ? "üëã Mientras no estabas..." : "‚ú® Novedades"}</h2>
              ${multipleVersions ? `<div style="font-size:11px;color:var(--text-dim);margin-top:4px;">Mir√° todo lo que fuimos sumando desde tu √∫ltima visita.</div>` : ""}
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
                    ${(info.cats[cat]?.length ? info.cats[cat] : ["No hubo ninguna reparaci√≥n en esta actualizaci√≥n."]).map(c => `<div style="font-size:13px;color:var(--text-dim);margin-bottom:5px;line-height:1.45;">‚Ä¢ ${escapeHtml(c)}</div>`).join("")}
                  </div>`:"").join("")}
              </div>`;
            }).join("")}
          </div>
          <div class="modal-box-footer"><button class="btn" style="width:100%;" onclick="handleAcceptChangelog()">${multipleVersions ? "Ya estoy al d√≠a ‚úì" : "Aceptar"}</button></div>
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
    "6.1.3":"ACTUALIZACI√ìN EN VIVO",
    "6.1.4":"CONEXI√ìN CONTINUA"
  };
  const stage = stageNames[newestLabel] || "ACTUALIZACI√ìN";

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
          <div class="ls-next-era-kicker">LIVE SCROLL ¬∑ ACTUALIZACI√ìN</div>
          <h2 class="ls-next-era-title">${multipleVersions ? "Mientras no estabas..." : `${escapeHtml(newestLabel)} ¬∑ ${stage}`}</h2>
          <div class="ls-next-era-sub">
            ${multipleVersions
              ? "Te perdiste algunas etapas del camino. Ac√° ten√©s todo lo que cambi√≥ desde la √∫ltima vez que estuviste."
              : newestLabel === "6.0.0"
                ? "Llegamos. Bienvenido a la nueva era de LiveScroll."
                : newestLabel === "6.0.1v"
                  ? "LiveScroll 6 refuerza su n√∫cleo para responder m√°s r√°pido, cargar mejor y proteger cada cuenta."
                  : newestLabel === "6.0.2v"
                    ? "LiveScroll comienza su preparaci√≥n para llegar a Android con permisos claros y mayor compatibilidad."
                : newestLabel === "5.8.1"
                  ? "Una actualizaci√≥n enfocada en seguridad, privacidad y protecci√≥n de tu cuenta."
                  : newestLabel === "5.8.2"
                    ? "Los puntos evolucionan: m√°s recompensas, Boost m√°s accesible y una econom√≠a m√°s clara."
                    : newestLabel === "5.8.6"
                      ? "Usuarios y Creadores ahora tienen accesos, perfiles y herramientas claramente diferenciados."
                    : newestLabel === "5.8.7"
                      ? "Directos se simplifica y queda enfocado en las integraciones de Kick y Twitch."
                    : newestLabel === "5.8.8"
                      ? "Una actualizaci√≥n enfocada en estabilidad m√≥vil, pantallas verticales y navegaci√≥n m√°s segura."
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
                  ${v === newest ? `<span class="ls-next-era-latest">M√ÅS RECIENTE</span>` : ""}
                </div>
                ${["nuevo","actualizado","reparado","proximamente"].map(cat => (info.cats[cat]?.length || cat === "reparado") ? `
                  <div class="ls-next-era-category">
                    <div class="ls-next-era-category-title" style="color:${labels[cat]?.color || "var(--text-dim)"}">${labels[cat]?.title || escapeHtml(cat)}</div>
                    ${(info.cats[cat]?.length ? info.cats[cat] : ["No hubo ninguna reparaci√≥n en esta actualizaci√≥n."]).map(c => `<div class="ls-next-era-line">‚Ä¢ ${escapeHtml(c)}</div>`).join("")}
                  </div>`:"").join("")}
              </div>`;
          }).join("")}
        </div>

        <div class="ls-next-era-foot">
          <button class="ls-next-era-btn" onclick="handleAcceptChangelog()">
            ${multipleVersions ? "Ya estoy al d√≠a ‚úì" : newestLabel === "6.0.0" ? "Entrar a la nueva era ‚Üí" : newestLabel.startsWith("6.") ? "Continuar en LiveScroll 6 ‚Üí" : "Continuar el camino ‚Üí"}
          </button>
          <div class="ls-next-era-road">6.1.2 NUBE LIVESCROLL ‚Üí 6.1.3 ACTUALIZACI√ìN EN VIVO ‚Üí 6.1.4 CONEXI√ìN CONTINUA</div>
        </div>
      </div>
    </div>`;
}


// ============================================================
// NOVEDADES ‚Äî SISTEMA DIN√ÅMICO DESDE 5.8.1
// El cartel toma la versi√≥n visible m√°s reciente del historial cuando existe
// una actualizaci√≥n pendiente, evitando quedar clavado en una versi√≥n anterior.
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
            <h2 style="margin:0;">${isLiveScroll7App() ? "Historial de Evoluci√≥n" : "üì¢ Novedades"}</h2>
            <div style="font-size:10px;color:var(--text-dim);margin-top:3px;">
              ${isLiveScroll7App() ? "Hay nuevas mejoras esperando por vos." : "Versiones y revisiones publicadas"}
            </div>
          </div>
          <button onclick="closeChangelogHistory()" style="background:none;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;">‚úï</button>
        </div>

        <div class="modal-box-body" style="overflow-y:auto;min-height:0;overscroll-behavior:contain;contain:layout paint style;">
          <div id="changelogHistoryList">Cargando...</div>
        </div>
      </div>
    </div>`;

  const labels = {
    nuevo: { title: "üÜï Nuevo", color: "var(--green)" },
    actualizado: { title: "üîÑ Mejora", color: "var(--gold)" },
    emergencia: { title: "‚ö†Ô∏è Reparaci√≥n de emergencia", color: "#facc15" },
    reparado: { title: "üõ†Ô∏è Reparado", color: "#7dd3fc" },
    proximamente: { title: "üîú Pr√≥ximamente", color: "var(--text-dim)" }
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
    list.innerHTML = `<p style="color:var(--text-dim);font-size:13px;">${isLiveScroll7App() ? "La primera evoluci√≥n de LiveScroll 7 todav√≠a no fue publicada." : "Todav√≠a no hay novedades publicadas."}</p>`;
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

  // Agrupamos primero por versi√≥n visible y luego por revisi√≥n interna.
  // As√≠ 5.8.3 principal y 5.8.3 revisi√≥n secundaria NO quedan mezcladas.
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
      // No repetimos una l√≠nea gen√©rica que ya expresa el encabezado.
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
            <span>üõ°Ô∏è</span>
            <span>Revisi√≥n secundaria</span>
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
          Seguridad y protecci√≥n
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
            <span style="color:#60a5fa;font-weight:900;">‚úì</span>
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
        : ["No hubo ninguna reparaci√≥n en esta actualizaci√≥n."];

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
            ">‚Ä¢ ${escapeHtml(c)}</div>
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
  // guarda tambi√©n qu√© versi√≥n vio. Esto evita que una falla puntual
  // del RPC vuelva a ocultar/romper el flujo autom√°tico.
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

    // No encadenamos otro popup autom√°tico en la misma sesi√≥n.
    // Lo pendiente queda guardado para el pr√≥ximo ingreso o accesible desde Novedades.
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
      <span style="font-size:21px;text-align:center;">${done ? "‚úÖ" : item.emoji}</span>
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
        <span style="width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:${summary.isSeven ? "rgba(57,231,255,.12)" : "color-mix(in srgb,var(--gold) 10%,transparent)"};font-size:18px;">${summary.isSeven ? "‚óâ" : "üéØ"}</span>
        <span style="min-width:0;">
          <span style="display:flex;align-items:center;justify-content:space-between;gap:8px;"><strong style="font-size:11px;">${title}</strong><small style="color:${accent};font:900 8px 'JetBrains Mono',monospace;">${summary.completed}/${summary.challenges.length}</small></span>
          <span style="display:block;height:4px;margin-top:6px;border-radius:99px;background:rgba(255,255,255,.09);overflow:hidden;"><i style="display:block;width:${summary.percent}%;height:100%;background:${summary.isSeven ? "linear-gradient(90deg,#39e7ff,#a970ff)" : "var(--gold)"};"></i></span>
        </span>
        <span style="color:var(--text-dim);font-size:16px;">‚Ä∫</span>
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
          <div><small style="color:${summary.isSeven ? "#58efff" : "var(--gold)"};font-weight:900;letter-spacing:.1em;">${summary.isSeven ? "LIVESCROLL PULSE" : "RETO DIARIO"}</small><h2 style="margin:3px 0 0;">${summary.isSeven ? "Tu Pulso de hoy" : "Tu misi√≥n de hoy"}</h2></div>
          <button type="button" onclick="closeDailyChallengesModal()" aria-label="Cerrar" style="width:40px;height:40px;border:1px solid var(--border);border-radius:50%;background:var(--panel-2);color:var(--text);font-size:18px;">‚úï</button>
        </div>
        <div class="modal-box-body">
          <div style="display:grid;gap:8px;">${renderDailyChallengeRows(summary.challenges)}</div>
          <div style="height:7px;margin-top:14px;border-radius:99px;background:rgba(255,255,255,.09);overflow:hidden;"><span style="display:block;width:${summary.percent}%;height:100%;background:${summary.isSeven ? "linear-gradient(90deg,#39e7ff,#a970ff)" : "var(--gold)"};"></span></div>
          <p style="margin:10px 0 0;color:var(--text-dim);font-size:9px;line-height:1.5;">Se renueva autom√°ticamente cada d√≠a. Esta etapa prueba el progreso antes de habilitar premios adicionales.</p>
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
      showToast("üî• Comenz√≥ una nueva semana en LiveScroll");
    }
  }
  const claimableDay = data.current_day >= 7 ? 1 : data.current_day + 1;

  if (banner) {
    banner.innerHTML = data.claimed_today ? "" : `
      <div class="form-card" style="margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; border-color:var(--gold-dim);" onclick="showLoginStreakModal()">
        <div><strong>üî• Inicio de Sesi√≥n</strong><div style="font-size:12px; color:var(--text-dim);">D√≠a ${claimableDay} de 7 ¬∑ toc√° para reclamar</div></div>
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
          <h2>üìÖ Inicio de Sesi√≥n</h2>
          <button onclick="closeLoginStreakModal()" style="background:none;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;">‚úï</button>
        </div>
        <div class="modal-box-body">
          <p style="color:var(--text-dim); font-size:12px; margin-top:0;">Entr√° todos los d√≠as que puedas ‚Äî si falt√°s uno, no se rompe nada, segu√≠s de donde quedaste.</p>
          <div class="login-streak-grid">
            ${days1to6.map(r => `
              <div class="login-streak-day ${isDayDone(r.day_number) ? "done" : ""} ${r.day_number === claimableDay ? "claimable" : ""}">
                <div class="d">D√≠a ${r.day_number}</div>
                <div class="ic">${r.emoji_reward || r.badge_icon || "‚≠ê"}</div>
                <div class="p">+${r.points}</div>
              </div>`).join("")}
          </div>
          ${day7 ? `
            <div class="login-streak-bigday ${isDayDone(7) ? "done" : ""}">
              <div class="tag">GRAN PREMIO ¬∑ D√çA 7</div>
              <div class="ic">${day7.emoji_reward || day7.badge_icon || "üéÅ"}</div>
              <div class="p">+${day7.points} pts${day7.badge_name ? ` ¬∑ üèÖ ${escapeHtml(day7.badge_name)}` : ""}</div>
            </div>` : ""}
        </div>
        <div class="modal-box-footer">
          ${claimedToday
            ? `<button class="btn-outline" style="width:100%;" disabled>Ya reclamaste hoy ‚úì</button>`
            : `<button class="btn" id="claimLoginStreakBtn" style="width:100%;min-height:48px;" onclick="handleClaimLoginStreak()">Reclamar D√≠a ${claimableDay}</button>`}
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
      not_authenticated: "Tu sesi√≥n venci√≥. Volv√© a iniciar sesi√≥n.",
      invalid_user: "No pudimos validar tu cuenta. Recarg√° LiveScroll.",
      cuenta_bloqueada: "Tu cuenta todav√≠a no puede reclamar recompensas."
    };

    showToast(messages[reason] || "No se pudo reclamar. Prob√° nuevamente.");

    if (btn) {
      btn.disabled = false;
      btn.textContent = "Reclamar";
    }

    console.warn("Error reclamando Inicio de Sesi√≥n:", reason, error || data);
    return;
  }

  currentProfile.points_balance += Number(data.points || 0);
  currentProfile.streak_current_day = data.day;
  currentProfile.streak_last_login_date = new Date().toISOString().slice(0, 10);

  updateBalanceUI();
  showFloatingPointsSafe(Number(data.points || 0));

  // Cerramos el selector, pero mantenemos oculta la navegaci√≥n
  // porque enseguida mostramos el premio.
  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";

  showStreakModal(data);

  const banner = document.getElementById("loginStreakBannerWrap");
  if (banner) banner.innerHTML = "";
}

async function handleClaimStreak() {
  const { data, error } = await sb.rpc("claim_daily_streak", { p_user_id: currentUser.id });
  if (error || !data.ok) { showToast("No se pudo reclamar, prob√° de nuevo"); return; }

  currentProfile.points_balance += data.points;
  currentProfile.streak_current_day = data.day;
  currentProfile.streak_last_login_date = new Date().toISOString().slice(0, 10);
  updateBalanceUI();
  showStreakModal(data);
  renderProfile();
}

async function claimDailyStreak() {
  if (currentProfile.is_blocked) return; // cuentas pendientes de verificar no acumulan racha todav√≠a
  if (window.streakClaimAttempted) return; // seguro: nunca reclamar m√°s de una vez por sesi√≥n
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
          <div style="font-size:44px; margin-bottom:8px;">üéâ</div>
          <h2>¬°Racha completa!</h2>
          <p style="color:var(--text-dim); font-size:14px;">Completaste los 7 d√≠as. ¬°Hasta la pr√≥xima semana!</p>
        ` : `
          <div style="font-size:44px; margin-bottom:8px;">üî•</div>
          <h2>D√≠a ${data.day} de 7</h2>
        `}
        <div class="mono" style="font-size:28px; color:var(--gold); margin:14px 0;">+${data.points} pts</div>
        ${data.badge_name ? `
          <div style="background:var(--panel-2); border:1px solid var(--gold-dim); border-radius:12px; padding:14px; margin-bottom:14px;">
            <div style="font-size:32px;">${data.badge_icon || "üèÖ"}</div>
            <div style="font-size:13px; color:var(--gold); margin-top:6px;">¬°Ganaste la medalla "${escapeHtml(data.badge_name)}"!</div>
          </div>` : ""}
        ${data.emoji_reward ? `
          <div style="background:var(--panel-2); border:1px solid var(--green); border-radius:12px; padding:14px; margin-bottom:14px;">
            <div style="font-size:32px;">${data.emoji_reward}</div>
            <div style="font-size:13px; color:var(--green); margin-top:6px;">¬°Nuevo emoji de avatar desbloqueado!</div>
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
  showToast("¬°Video anclado en Para Ti por 24hs!");
  lsPerfCache.profileVideos.at = 0;
  renderProfile();
}

async function handleDeleteOwnVideo(videoId) {
  if (!confirm("¬øEliminar este video para siempre? Se borran tambi√©n sus likes, comentarios y vistas. No se puede deshacer.")) return;
  const mediaToDelete = await getVideoMediaForCleanup(videoId);
  const { data, error } = await sb.rpc("delete_own_video", { p_video_id: videoId });
  if (error || !data?.ok) {
    console.error("delete_own_video:", error, data);
    const messages = {
      no_autenticado:"Tu sesi√≥n venci√≥. Volv√© a ingresar.",
      no_autorizado:"Solamente el due√±o puede eliminar este video.",
      video_no_encontrado:"El video ya no existe.",
      delete_failed:"No pudimos completar la eliminaci√≥n. Prob√° nuevamente."
    };
    showToast(messages[data?.error] || "No se pudo eliminar el video");
    return;
  }
  await cleanupR2VideoMedia(mediaToDelete);
  document.getElementById(`tile-${videoId}`)?.remove();
  showToast("Video eliminado definitivamente ‚úì");
  lsPerfCache.profileVideos.at = 0;
  lsPerfCache.feed.at = 0;
  renderProfile();
}

async function handleAdminDeleteProfileVideo(videoId, username) {
  if (!currentProfile?.is_admin) return;
  if (!confirm("¬øEliminar este video como administrador? Esta acci√≥n no se puede deshacer.")) return;
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
  showToast("Video eliminado por administraci√≥n ‚úì");
  await viewPublicProfile(username);
}
window.handleAdminDeleteProfileVideo = handleAdminDeleteProfileVideo;


function checkBlockedStatus() {
  const wrap = document.getElementById("blockedBannerWrap");
  if (currentProfile.is_blocked) {
    const verificationMessages = {
      correo_sin_confirmar:"Confirm√° el enlace que enviamos a tu correo y volv√© a ingresar.",
      nombre_invalido:"Tu nombre de usuario necesita una revisi√≥n r√°pida.",
      registro_masivo_misma_red:"Detectamos varios registros recientes desde la misma conexi√≥n. La cuenta qued√≥ protegida para revisi√≥n.",
      sancion_activa:"Esta cuenta tiene una restricci√≥n activa y requiere revisi√≥n del equipo.",
      perfil_incompleto:"Estamos terminando de preparar tu perfil.",
      revision_manual:"La cuenta necesita una revisi√≥n r√°pida del equipo."
    };
    const verificationDetail = verificationMessages[currentProfile.auto_verification_reason] || verificationMessages.revision_manual;
    wrap.innerHTML = `
      <div style="max-width:920px;margin:14px auto 0;padding:10px 18px;background:rgba(34,197,94,0.08);border:1px solid var(--gold-dim);border-radius:10px;color:var(--text);font-size:13px;text-align:center;">
        üïí ${escapeHtml(verificationDetail)} Pod√©s navegar, pero todav√≠a no vas a sumar puntos.
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
      ‚ö° Boost de bienvenida activo: gan√°s <strong>x2 puntos</strong> hasta ${expiresAt.toLocaleString("es-AR")}
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


    /* v5.3.5 ‚Äî Perfil Nova: actividad + profundidad */
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
    return `<button class="feed-action-btn" data-label="Compartir" aria-label="Compartir video" title="Compartir" onclick="handleShare('${videoId}', '${encodedUrl}')">üîó</button>`;
  }
  return `<button class="feed-action-btn ls7-action-share" data-label="Compartir" aria-label="Compartir video" title="Compartir" onclick="handleShare('${videoId}', '${encodedUrl}')"><span>‚Üó</span><i>ENVIAR</i></button>`;
}

function renderRuntimeHideButton(videoId) {
  const safeId = escapeHtml(String(videoId || ""));
  if (!isLiveScroll7App()) {
    return `<button class="feed-action-btn" data-label="No me interesa" aria-label="No me interesa" title="No me interesa" onclick="hideVideoFromDiscovery('${safeId}')">üôà</button>`;
  }
  return `<button class="feed-action-btn ls7-action-hide" data-label="No me interesa" aria-label="No me interesa" title="No me interesa" onclick="hideVideoFromDiscovery('${safeId}')"><span>‚àí</span><i>OCULTAR</i></button>`;
}

function renderRuntimeReportButton(videoId) {
  const safeId = escapeHtml(String(videoId || ""));
  if (!isLiveScroll7App()) {
    return `<button class="feed-action-btn" data-label="Reportar" aria-label="Reportar video" title="Reportar" onclick="openReportModal('${safeId}')">üö©</button>`;
  }
  return `<button class="feed-action-btn ls7-action-report" data-label="Reportar" aria-label="Reportar video" title="Reportar" onclick="openReportModal('${safeId}')"><span>!</span><i>REPORTE</i></button>`;
}

function lsCacheFresh(entry, maxAgeMs) {
  return !!entry?.data && (Date.now() - entry.at) < maxAgeMs;
}

function switchTab(tab) {
  // Los planes siguen disponibles dentro de Tienda, pero ya no existen como
  // apartado independiente. Los accesos viejos tambi√©n terminan all√≠.
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

  // En desktop conservamos la entrada Nova; en m√≥vil aparece instant√°neo.
  if (window.innerWidth > 700) {
    requestAnimationFrame(() => animateCurrentViewSafe());
  }

  // Seasonal: solo sincroniza controles si estamos en Admin.
  // No reconstruye el tema ni observa todo el DOM.
  if (tab === "admin") {
    setTimeout(syncSeasonalAdminControls, 250);
  }

}

// LiveScroll 7 ¬∑ navegaci√≥n horizontal con intenci√≥n.
// Solo act√∫a cuando el gesto es claramente lateral y nunca dentro de videos,
// formularios, men√∫s o ventanas modales.
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
  // la p√°gina. Esta peque√±a franja queda por encima del video y ofrece un
  // lugar seguro para cambiar de apartado sin pelear con el scroll vertical.
  const rail = document.createElement("div");
  rail.id = "ls7SwipeRail";
  rail.setAttribute("role", "navigation");
  rail.setAttribute("aria-label", "Deslizar entre Mirar, Para Ti y Perfil");
  rail.innerHTML = '<span>‚Äπ</span><b id="ls7SwipeRailLabel">MIRAR ¬∑ DESLIZ√Å</b><span>‚Ä∫</span>';
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
  if (label && names[tab]) label.textContent = `${names[tab]} ¬∑ DESLIZ√Å`;
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
  button.querySelector("span").textContent = wantsSound ? "üîä" : "üîá";
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
  const isSuccess = normalized === "success" || /‚úì|listo|publicad|actualizad|guardad|activad|enviad|copiad|restaurad/i.test(message);
  const kind = isError ? "error" : (isSuccess ? "success" : "info");
  const meta = {
    error:{ icon:"!", title:"Revis√° esto" },
    success:{ icon:"‚úì", title:"Todo listo" },
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
// FEED ‚Äî ver videos de otros y ganar puntos por minuto
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

  // Si el usuario ya toc√≥ otra pesta√±a, esta respuesta vieja no pisa la nueva vista.
  if (renderToken !== lsTabRenderToken || currentTab !== "feed") return;

  const list = document.getElementById("feedList");
  if (!list) return;
  if (error) { list.textContent = "Error cargando videos: " + error.message; return; }
  if (!videos.length) {
    list.innerHTML = `<div style="padding:40px 0; text-align:center;">
      <h1 class="page-title">${lsGenerationFeedFilter === "all" ? "Mir√° y gan√°" : `Generaci√≥n ${lsGenerationFeedFilter.toUpperCase()}`}</h1>
      <p style="color:var(--text-dim)">${lsGenerationFeedFilter === "all" ? "Todav√≠a no hay videos de otros usuarios. ¬°Sub√≠ el primero!" : "Todav√≠a no hay publicaciones nuevas de esta generaci√≥n."}</p>
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
            ${isMine ? `<div style="position:absolute; top:14px; left:14px; background:rgba(0,0,0,0.6); color:var(--gold); font-size:11px; padding:4px 10px; border-radius:20px; z-index:6;">Tu video ¬∑ sin puntos</div>` : ""}
            <div class="feed-actions">
              <button class="feed-action-btn ls-like-action-611 ${likedSet.has(v.id) ? "liked" : ""}" id="like-${v.id}" data-label="${likedSet.has(v.id) ? "Te gusta" : "Me gusta"}" aria-label="${likedSet.has(v.id) ? "Te gusta" : "Me gusta"}" aria-pressed="${likedSet.has(v.id)}" title="${likedSet.has(v.id) ? "Te gusta" : "Me gusta"}" onclick="handleLike('${v.id}')"><span>${likedSet.has(v.id) ? "‚ô•" : "‚ô°"}</span><i>${likedSet.has(v.id) ? "TU LIKE" : "LIKE"}</i></button>
              <button class="feed-action-btn ls-comment-action-611" data-label="Comentar" aria-label="Abrir comentarios" title="Comentarios" onclick="openComments('${v.id}')"><span>üí¨</span><i>COMENTAR</i></button>
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
            ${i === 0 ? `<div class="feed-nudge">Desliz√° hacia arriba para el siguiente ‚Üë</div>` : ""}
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
    indicator.textContent = pull > 70 ? "üîÑ Solt√° para actualizar" : "‚¨áÔ∏è Desliz√° para actualizar";
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
  heart.textContent = "‚ù§Ô∏è";
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
    <button type="button" class="ls-mp4-sound" onclick="event.stopPropagation();toggleFeedVideoSound(this)"><span>üîá</span><b>ACTIVAR SONIDO</b></button>
  </div>`;
  loadedEmbeds.add(video.id);
}

function activateLoadedEmbed(video) {
  if (!video) return;
  const player = document.querySelector(`#embed-${video.id} video`);
  if (!player) return;

  // Cada activaci√≥n recibe un identificador. As√≠ una respuesta de carga antigua
  // nunca puede volver a reproducir audio cuando la tarjeta ya sali√≥ de pantalla.
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
  const icons = { tiktok: "üéµ", kick: "üü¢", twitch: "üü£", youtube: "üî¥", upload: "üé¨" };
  const thumb = (video.platform === "youtube" || video.platform === "upload") ? getThumbnailHtml(video) : "";

  if (video.platform === "upload" && thumb.startsWith("<video")) {
    return `<div class="feed-fallback" style="position:relative;overflow:hidden;">
      ${thumb
        .replace('preload="metadata"', 'preload="none"')
        .replace("<video ", `<video style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.7;pointer-events:none;" `)}
      <div class="platform-icon" style="position:relative;z-index:2;">‚ñ∂Ô∏è</div>
    </div>`;
  }

  return `<div class="feed-fallback">
    ${thumb && thumb.startsWith("<img") ? thumb.replace(/alt="[^"]*"/, 'alt="miniatura"').replace("<img ", `<img style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;opacity:0.55;" `) : ""}
    <div class="platform-icon" style="position:relative;">${icons[video.platform] || "‚ñ∂Ô∏è"}</div>
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
    return `<div class="feed-fallback"><p>Link de video inv√°lido.</p></div>`;
  }
  if (video.platform === "upload") {
    const isLegacyMode = document.documentElement.classList.contains("ls-legacy");
    return `<div class="dbltap-like-zone" data-video-id="${video.id}" style="width:100%; height:100%; position:relative;">
      <video src="${escapeHtml(url)}" ${video.thumbnail_url && isSafeUrl(video.thumbnail_url) ? `poster="${escapeHtml(video.thumbnail_url)}"` : ""} controls muted loop playsinline preload="${isLegacyMode ? "metadata" : "auto"}" style="width:100%;height:100%;object-fit:contain;"></video>
      <button type="button" class="ls-mp4-sound" onclick="event.stopPropagation();toggleFeedVideoSound(this)"><span>üîá</span><b>ACTIVAR SONIDO</b></button>
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
    return getExternalVideoCard("kick", url, "Kick protege algunos videos contra la reproducci√≥n externa.");
  }
  if (video.platform === "tiktok") {
    const id = extractTikTokVideoId(url);
    if (id) return `<iframe src="https://www.tiktok.com/player/v1/${encodeURIComponent(id)}?autoplay=1&loop=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  }
  const icons = { tiktok: "üéµ", kick: "üü¢", twitch: "üü£" };
  return `<div class="feed-fallback">
    <div class="platform-icon">${icons[video.platform] || "‚ñ∂Ô∏è"}</div>
    <p>Este video se ve mejor en ${escapeHtml(video.platform)}</p>
    <a class="btn" href="${escapeHtml(url)}" target="_blank" rel="noopener">Abrir y mirar ah√≠</a>
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

function getExternalVideoCard(platform, url, reason = "") {
  const label = platform === "kick" ? "Kick" : platform === "twitch" ? "Twitch" : "TikTok";
  const icon = platform === "kick" ? "üü¢" : platform === "twitch" ? "üü£" : "üéµ";
  return `<div class="feed-fallback ls-external-video-card"><div class="platform-icon">${icon}</div><strong>${label}</strong>${reason ? `<p>${escapeHtml(reason)}</p>` : ""}<a class="btn" href="${escapeHtml(url)}" target="_blank" rel="noopener">Ver en ${label}</a></div>`;
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
      <button onclick="closeProfileVideoFeed()" style="position:absolute; top:max(14px, env(safe-area-inset-top)); right:14px; z-index:20; background:rgba(0,0,0,0.55); border:none; color:#fff; width:36px; height:36px; border-radius:50%; font-size:18px; cursor:pointer;">‚úï</button>
      <div class="feed-vertical" id="profileFeedVertical" style="height:100dvh; margin:0;">
        ${videos.map((v) => {
          const isMine = v.user_id === currentUser.id;
          return `
          <div class="feed-item${v.platform === "upload" ? " ls-upload-feed-item" : ""}" data-video-id="${v.id}" style="content-visibility:auto;contain-intrinsic-size:1px var(--ls-mobile-feed-height,720px);">
            <div class="feed-phone">
              <div class="feed-embed-frame" id="embed-${v.id}">${getEmbedPlaceholderHtml(v)}</div>
              ${isMine ? `<div style="position:absolute; top:14px; left:14px; background:rgba(0,0,0,0.6); color:var(--gold); font-size:11px; padding:4px 10px; border-radius:20px; z-index:6;">Tu video ¬∑ sin puntos</div>` : ""}
              <div class="feed-actions">
                <button class="feed-action-btn ls-like-action-611 ${likedSet.has(v.id) ? "liked" : ""}" id="like-${v.id}" data-label="${likedSet.has(v.id) ? "Te gusta" : "Me gusta"}" aria-label="${likedSet.has(v.id) ? "Te gusta" : "Me gusta"}" aria-pressed="${likedSet.has(v.id)}" title="${likedSet.has(v.id) ? "Te gusta" : "Me gusta"}" onclick="handleLike('${v.id}')"><span>${likedSet.has(v.id) ? "‚ô•" : "‚ô°"}</span><i>${likedSet.has(v.id) ? "TU LIKE" : "LIKE"}</i></button>
                <button class="feed-action-btn ls-comment-action-611" data-label="Comentar" aria-label="Abrir comentarios" title="Comentarios" onclick="openComments('${v.id}')"><span>üí¨</span><i>COMENTAR</i></button>
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

    /* Road to LiveScroll 6 ‚Äî teaser √∫nico por cuenta */
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



    /* NEXT ERA ‚Äî carteles de versi√≥n 5.4.6 ‚Üí 6.0.0 */
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



    /* 5.5.7 ‚Äî Medallas exclusivas de Tienda */
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

    /* LiveScroll 5.5.7 ‚Äî IDENTITY */
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
      content:"‚òÖ";
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

    /* LiveScroll 5.4.6 ‚Äî PERFORMANCE / Mobile Fast */
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
      /* En m√≥vil priorizamos respuesta inmediata sobre animaci√≥n decorativa. */
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

    /* v5.3.5 ‚Äî Mobile Feed Full View */
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
        <span class="ico">üìå</span>
        <span class="txt">
          <strong>Video anclado</strong>
          <small>Ya est√° destacado en Para Ti</small>
        </span>
      </button>`;
  } else if (canPin) {
    pinAction = `
      <button class="ls-sheet-action" ${limitReached ? "disabled" : ""}
        onclick="closeVideoActionSheet(); handlePinVideo('${videoId}')">
        <span class="ico">üìå</span>
        <span class="txt">
          <strong>Anclar 24 h</strong>
          <small>${limitReached
            ? `Ya usaste ${pin.pinsUsed}/${pin.maxPinned} espacios disponibles`
            : `Destacalo en Para Ti ¬∑ ${pin.pinsUsed}/${pin.maxPinned} usados`}</small>
        </span>
      </button>`;
  } else {
    pinAction = `
      <button class="ls-sheet-action" disabled>
        <span class="ico">üìå</span>
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
        <span class="ico">‚ñ∂Ô∏è</span>
        <span class="txt">
          <strong>Ver video</strong>
          <small>Abrir dentro de LiveScroll</small>
        </span>
      </button>

      ${video.platform === "upload" ? `
        <button class="ls-sheet-action" onclick="openVideoReeditor('${videoId}')">
          <span class="ico">‚úÇÔ∏è</span>
          <span class="txt">
            <strong>Reeditar video</strong>
            <small>Cambiar el inicio o el final sin perder interacciones</small>
          </span>
        </button>` : `
        <button class="ls-sheet-action" disabled>
          <span class="ico">‚úÇÔ∏è</span>
          <span class="txt"><strong>Reeditar video</strong><small>Disponible para MP4 subidos a LiveScroll</small></span>
        </button>`}

      <button class="ls-sheet-action"
        onclick="closeVideoActionSheet(); window.open('${escapeHtml(video.video_url)}', '_blank', 'noopener')">
        <span class="ico">üîó</span>
        <span class="txt">
          <strong>Abrir enlace</strong>
          <small>Ver el archivo o plataforma original</small>
        </span>
      </button>

      <button class="ls-sheet-action danger"
        onclick="closeVideoActionSheet(); handleDeleteOwnVideo('${videoId}')">
        <span class="ico">üóëÔ∏è</span>
        <span class="txt">
          <strong>Eliminar video</strong>
          <small>Esta acci√≥n no se puede deshacer</small>
        </span>
      </button>

      <button class="ls-sheet-action" onclick="closeVideoActionSheet()">
        <span class="ico">‚úï</span>
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
      return `<img src="${escapeHtml(video.thumbnail_url)}" alt="car√°tula del video" loading="lazy" decoding="async">`;
    }

    // En Legacy no abrimos varios MP4 solamente para fabricar miniaturas: eso
    // compite con el reproductor principal y en equipos antiguos deja audio sin imagen.
    if (document.documentElement.classList.contains("ls-legacy")) {
      return `<div class="ls-legacy-cover-placeholder"><span aria-hidden="true">‚ñ∂</span><small>VIDEO</small></div>`;
    }

    // Videos viejos sin car√°tula persistida: el MP4 se activa reci√©n cerca de la pantalla.
    if (isSafeUrl(video.video_url)) {
      return `<div class="ls-lazy-video-cover" data-ls-preview-src="${escapeHtml(video.video_url)}#t=0.3">
        <span aria-hidden="true">‚ñ∂</span>
        <video preload="none" muted playsinline disablepictureinpicture
          style="width:100%;height:100%;object-fit:cover;pointer-events:none;background:#071116;"></video>
      </div>`;
    }

    return "üé¨";
  }

  const icons = { kick: "üü¢", twitch: "üü£", tiktok: "üéµ" };
  return icons[video.platform] || "‚ñ∂Ô∏è";
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
    if (error) console.warn("Se√±al de descubrimiento no registrada:", error.message);
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
  bar.innerHTML = `<span><strong>Video ocultado</strong><small>Ya no aparecer√° en tu inicio.</small></span><button type="button">Deshacer</button>`;
  bar.querySelector("button").onclick = async () => {
    const { data, error } = await sb.rpc("restore_hidden_video", { p_video_id:videoId });
    if (error || !data?.ok) return showToast("No se pudo restablecer el video");
    bar.remove();
    lsPerfCache.feed = { data:null, at:0 };
    showToast("Video restablecido ‚úì");
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
  if (!videoIds.length) { list.textContent = "Todav√≠a no hay videos con esta etiqueta."; return; }
  const { data:videos } = await sb.from("videos").select("id,title,thumbnail_url,profiles!videos_user_id_fkey(username)").in("id", videoIds);
  const byId = new Map((videos || []).map(video => [video.id, video]));
  list.innerHTML = videoIds.map(id => byId.get(id)).filter(Boolean).map(video => `<button class="btn-outline" style="width:100%;display:flex;justify-content:space-between;gap:10px;margin:8px 0;text-align:left" onclick="openSharedVideo('${video.id}')"><span>${escapeHtml(video.title)}</span><span style="color:var(--text-dim)">@${escapeHtml(video.profiles?.username || "usuario")}</span></button>`).join("");
}
window.openHashtagFeed = openHashtagFeed;

function startWatching(video) {
  if (video.user_id === currentUser.id) return;
  if (watchIntervals[video.id]) return; // ya est√° corriendo, no duplicar

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
        showToast("Ya sumaste el m√°ximo por este video hoy ‚Äî mir√° otro para seguir ganando");
      } else if (data.error === "saldo_maximo") {
        stopWatching(video.id);
        showToast("Llegaste al tope de saldo de tu plan ‚Äî canje√° para seguir ganando üí∞");
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

  // 5.4.6 FINAL: nada del Feed queda reproduci√©ndose detr√°s de otra pantalla.
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
  preview.innerHTML = `${tags.map(tag => `<span style="border:1px solid rgba(103,232,249,.28);background:rgba(103,232,249,.08);color:#67e8f9;border-radius:20px;padding:5px 9px;">#${escapeHtml(tag)}</span>`).join("")}${tooMany ? `<span style="color:var(--red)">M√°ximo 5 etiquetas</span>` : ""}`;
}
window.refreshUploadHashtagPreview = refreshUploadHashtagPreview;

async function loadTrendingHashtagSuggestions() {
  const { data } = await sb.rpc("get_trending_hashtags", { p_limit:12 });
  const datalist = document.getElementById("uploadHashtagSuggestions");
  if (datalist) datalist.innerHTML = (data || []).map(tag => `<option value="#${escapeHtml(tag.slug)}"></option>`).join("");
}

async function saveVideoHashtags(videoId) {
  const { tags, tooMany } = getUploadHashtags();
  if (tooMany) throw new Error("Pod√©s usar como m√°ximo 5 hashtags.");
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
              Compart√≠ un enlace o public√° tu archivo. LiveScroll prepara todo antes de enviarlo.
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
          <span style="color:var(--text-dim);">Eleg√≠ origen</span>
        </div>
        <div style="padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--panel);font-size:11px;">
          <strong style="color:var(--gold);">02</strong><br>
          <span style="color:var(--text-dim);">Revis√° el contenido</span>
        </div>
        <div style="padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--panel);font-size:11px;">
          <strong style="color:var(--gold);">03</strong><br>
          <span style="color:var(--text-dim);">Public√°</span>
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
          üîó Usar enlace
          <span style="display:block;font-size:9px;opacity:.72;margin-top:3px;">Kick ¬∑ Twitch ¬∑ YouTube ¬∑ TikTok</span>
        </button>

        <button
          class="btn-outline"
          id="modeFileBtn"
          onclick="setUploadMode('file')"
          style="padding:14px;border-radius:12px;"
        >
          üé¨ Subir archivo
          <span style="display:block;font-size:9px;opacity:.72;margin-top:3px;">MP4 ¬∑ MKV ¬∑ WEBM</span>
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
          <div style="font-size:11px;font-weight:800;margin-bottom:12px;">üîó Video desde plataforma</div>

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
            <input type="text" id="uploadUrl" placeholder="Peg√° ac√° el enlace del video">
          </div>
        </div>

        <div id="fileFields" class="hidden">
          <div style="font-size:11px;font-weight:800;margin-bottom:12px;">üé¨ Archivo desde tu dispositivo</div>

          <div class="field">
            <label>Archivo de video</label>

            <button class="ls-upload-file-drop"
              type="button"
              onclick="openLiveScrollAndroidMedia('files','uploadFile','elegir el video que quer√©s publicar','files')"
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
              <div style="font-size:28px;margin-bottom:6px;">Ôºã</div>
              <div style="font-weight:800;font-size:12px;">Elegir video</div>
              <div style="font-size:10px;color:var(--text-dim);margin-top:4px;">
                MP4, MKV o WEBM ¬∑ m√°ximo 50 MB
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
              Si el video es demasiado largo o pesado, pod√©s seleccionarlo igual:
              LiveScroll te ofrecer√° recortarlo antes de subirlo.
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
          <label>T√≠tulo</label>
          <input
            type="text"
            id="uploadTitle"
            maxlength="100"
            placeholder="Ej: Jugada incre√≠ble en vivo"
          >
          <div style="font-size:9px;color:var(--text-dim);margin-top:5px;">
            Corto, claro y f√°cil de reconocer.
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
          Publicar video ¬∑ +${uploadReward} pts
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
  showToast("Preparaci√≥n cancelada. El video original sigue intacto.");
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
    msg.textContent = "Este formato no puede previsualizarse en este navegador, pero pod√©s subirlo normalmente.";
    msg.classList.add("active");
  };

  video.onloadedmetadata = () => {
    video.style.setProperty("display", "block", "important");
    msg.classList.remove("active");

    // Caja fija responsive 16:9:
    // horizontales llenan el ancho;
    // verticales quedan centrados con barras laterales;
    // nunca se modifica el tama√±o del contenedor seg√∫n metadata del MP4.
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
    ? `<span style="color:${overLimit ? "var(--red)" : "var(--green)"}">‚úÇÔ∏è Recortado: ${mb}MB${overLimit ? ` ‚Äî todav√≠a supera los ${MAX_FILE_MB}MB, recort√° un poco m√°s` : " ‚Äî perfecto"}</span>`
    : (overLimit
        ? `<span style="color:var(--red)">${mb}MB ‚Äî supera el m√°ximo de ${MAX_FILE_MB}MB</span>`
        : `<span style="color:var(--green)">${mb}MB ‚Äî perfecto, entra sin problema</span>`);

  const actionsWrap = document.createElement("div");
  actionsWrap.id = "trimActionsWrap";
  actionsWrap.style.cssText = "margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;";
  actionsWrap.innerHTML = `
    <button type="button" class="btn-outline" style="font-size:12px; padding:6px 12px;" onclick="openVideoTrimmer()">‚úÇÔ∏è ${trimmedFile ? "Recortar de nuevo" : "Recortar este video"}</button>
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
    showToast("Este navegador no permite reeditar videos. Prob√° con Chrome o Firefox actualizados.");
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
          <div style="font-size:38px;margin-bottom:12px;">‚úÇÔ∏è</div>
          <h2 style="margin:0 0 7px;">Preparando tu video</h2>
          <p id="videoReeditPrepareStatus" style="margin:0;color:var(--text-dim);font-size:12px;line-height:1.5;">Descargando una copia segura para editar. El original todav√≠a no se modifica.</p>
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
    if (!blob.size) throw new Error("El archivo recibido est√° vac√≠o");
    if (blob.size > MAX_FILE_MB * 1024 * 1024) {
      throw new Error(`El archivo supera los ${MAX_FILE_MB} MB permitidos para reedici√≥n`);
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
    console.error("No se pudo preparar la reedici√≥n:", error);
    wrap.innerHTML = "";
    videoReeditContext = null;
    rawSelectedFile = null;
    showToast(preparationTimedOut
      ? "La descarga tard√≥ demasiado. Prob√° nuevamente con una conexi√≥n m√°s estable."
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
  if (!context || !file) throw new Error("Falta el contexto de reedici√≥n");
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new Error(`La nueva edici√≥n supera los ${MAX_FILE_MB} MB`);
  }

  const progressText = document.getElementById("trimProgressText");
  const progressBar = document.getElementById("trimProgressBar");
  if (progressText) progressText.textContent = "Subiendo la nueva edici√≥n de forma segura...";
  if (progressBar) progressBar.style.width = "35%";

  const newR2Urls = [];
  try {
  const videoUpload = await uploadMediaToR2(file);
  const newVideoUrl = videoUpload.url;
  newR2Urls.push(newVideoUrl);
  if (!newVideoUrl) throw new Error("No se obtuvo la URL de la nueva edici√≥n");
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
    console.warn("No se pudo crear la nueva car√°tula:", thumbnailError);
  }
  if (progressBar) progressBar.style.width = "82%";

  const { data:updateResult, error:updateError } = await sb.rpc("replace_own_video_media", {
    p_video_id:context.videoId,
    p_video_url:newVideoUrl,
    p_thumbnail_url:newThumbnailUrl
  });
  if (updateError || !updateResult?.ok) {
    throw updateError || new Error(updateResult?.error || "No se pudo guardar la edici√≥n");
  }
  if (progressBar) progressBar.style.width = "100%";

  const oldPaths = [
    getClipStoragePathFromPublicUrl(context.oldVideoUrl),
    getClipStoragePathFromPublicUrl(context.oldThumbnailUrl)
  ].filter(Boolean);
  if (oldPaths.length) {
    sb.storage.from("clip-videos").remove(oldPaths).catch(error => {
      console.warn("La edici√≥n se guard√≥, pero no se pudo limpiar un archivo anterior:", error);
    });
  }

  const editedTitle = context.title;
  closeVideoTrimmer();
  lsPerfCache.profileVideos.at = 0;
  lsPerfCache.feed.at = 0;
  loadedEmbeds.clear();
  showToast(`‚úÇÔ∏è ‚Äú${editedTitle}‚Äù fue reeditado sin perder sus interacciones`);
  await renderProfile();
  } catch (error) {
    await Promise.allSettled(newR2Urls.map(deleteMediaFromR2));
    throw error;
  }
}

function openVideoTrimmer() {
  if (!rawSelectedFile) return;
  if (!window.MediaRecorder || !HTMLVideoElement.prototype.captureStream) {
    showToast("Tu navegador no permite recortar ac√°. Prob√° con Chrome o Firefox actualizados.");
    return;
  }

  const wrap = document.getElementById("globalModalWrap");
  const objectUrl = URL.createObjectURL(rawSel◊Õ∑Ÿº≠z &ä€^tÄÄÄÄÄÄÅçÖπŸÖÃπ°ï•ù°–ÄÙÅ5Ö—†πµÖ‡†ƒ∞Å5Ö—†π…Ω’πê°ÕΩ’…çï Ä®ÅÕçÖ±î§§Ï((ÄÄÄÄÄÄÄÅçΩπÕ–Åç—‡ÄÙÅçÖπŸÖÃπùï—Ωπ—ï·–†à…êà§Ï(ÄÄÄÄÄÄÄÅ•òÄ†Öç—‡§Å…ï—’…∏ÅôÖ•∞†§Ï((ÄÄÄÄÄÄÄÅç—‡πë…Ö›%µÖùî°Ÿ•ëïº∞Ä¿∞Ä¿∞ÅçÖπŸÖÃπ›•ë—†∞ÅçÖπŸÖÃπ°ï•ù°–§Ï((ÄÄÄÄÄÄÄÅçÖπŸÖÃπ—Ω	±Ωà†°â±Ωà§ÄÙ¯ÅÏ(ÄÄÄÄÄÄÄÄÄÅç±ïÖπ’¿†§Ï(ÄÄÄÄÄÄÄÄÄÅ…ïÕΩ±Ÿî°â±ΩàÅÒÅπ’±∞§Ï(ÄÄÄÄÄÄÄÅÙ∞Äâ•µÖùîΩ©¡ïúà∞Ä¿∏‡»§Ï(ÄÄÄÄÄÅÙÅçÖ—ç†Ä°|§ÅÏ(ÄÄÄÄÄÄÄÅôÖ•∞†§Ï(ÄÄÄÄÄÅÙ(ÄÄÄÅÙÏ((ÄÄÄÅ—…‰ÅÏ(ÄÄÄÄÄÅΩâ©ïç—U…∞ÄÙÅUI0πç…ïÖ—ï=â©ïç—UI0°ô•±î§Ï(ÄÄÄÄÄÅŸ•ëïºπÕ…åÄÙÅΩâ©ïç—U…∞Ï(ÄÄÄÅÙÅçÖ—ç†Ä°|§ÅÏ(ÄÄÄÄÄÅôÖ•∞†§Ï(ÄÄÄÅÙ(ÄÅÙ§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïU¡±ΩÖë•±î†§ÅÏ(ÄÅçΩπÕ–Å—•—±îÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â’¡±ΩÖëQ•—±îà§πŸÖ±’îπ—…•¥†§Ï(ÄÅçΩπÕ–Åô•±îÄÙÅ—…•µµïë•±îÅÒÅ…Ö›Mï±ïç—ïë•±îÏ(ÄÅçΩπÕ–Åï……∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â’¡±ΩÖë……Ω»à§Ï(ÄÅçΩπÕ–Åâ—∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â’¡±ΩÖëM’âµ•—	—∏à§Ï(ÄÅï……∞π—ï·—Ωπ—ïπ–ÄÙÄààÏ((ÄÅ•òÄ†Ö—•—±îÅÒÄÖô•±î§ÅÏÅï……∞π—ï·—Ωπ—ïπ–ÄÙÄâΩµ¡±ï”ÑÅï∞Å”µ—’±ºÅ‰Åï±ïü¥Å’∏ÅÖ…ç°•Ÿº∏àÏÅ…ï—’…∏ÏÅÙ(ÄÅ•òÄ°ùï—U¡±ΩÖë!ÖÕ°—ÖùÃ†§π—ΩΩ5Öπ‰§ÅÏÅï……∞π—ï·—Ωπ—ïπ–ÄÙÄâAΩì•ÃÅ’ÕÖ»ÅçΩµºÅ∑Ö·•µºÄ‘Å°ÖÕ°—ÖùÃ∏àÏÅ…ï—’…∏ÏÅÙ(ÄÅ•òÄ°ô•±îπÕ•ÈîÄ¯Å5a}%1}5Ä®Äƒ¿»–Ä®Äƒ¿»–§ÅÏÅï……∞π—ï·—Ωπ—ïπ–ÄÙÅÅ∞ÅÖ…ç°•ŸºÅÕ’¡ï…ÑÅ±ΩÃÄëÌ5a}%1}5	ı5Å¡ï…µ•—•ëΩÃ∏ÅA…ΩãÑÅ…ïçΩ…—Ö…±ºÅ’∏Å¡ΩçºÅ∑ÖÃπÄÏÅ…ï—’…∏ÏÅÙ((ÄÅâ—∏πë•ÕÖâ±ïêÄÙÅ—…’îÏ(ÄÅâ—∏π—ï·—Ωπ—ïπ–ÄÙÄâM’â•ïπëº∏∏∏àÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â’¡±ΩÖëA…Ωù…ïÕÃà§πç±ÖÕÕ1•Õ–π…ïµΩŸî†â°•ëëï∏à§Ï((ÄÅ±ï–ÅŸ•ëïΩU¡±ΩÖêÏ(ÄÅ—…‰ÅÏ(ÄÄÄÅŸ•ëïΩU¡±ΩÖêÄÙÅÖ›Ö•–Å’¡±ΩÖë5ïë•ÖQΩH»°ô•±î§Ï(ÄÅÙÅçÖ—ç†Ä°’¡±ΩÖë……Ω»§ÅÏ(ÄÄÄÅï……∞π—ï·—Ωπ—ïπ–ÄÙÄâ……Ω»ÅÖ∞ÅÕ’â•»ËÄàÄ¨Å’¡±ΩÖë……Ω»πµïÕÕÖùîÏ(ÄÄÄÅâ—∏πë•ÕÖâ±ïêÄÙÅôÖ±ÕîÏ(ÄÄÄÅâ—∏π—ï·—Ωπ—ïπ–ÄÙÄâA’â±•çÖ»ÅŸ•ëïºàÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅ±ï–Å—°’µâπÖ•±U…∞ÄÙÅπ’±∞Ï(ÄÅ—…‰ÅÏ(ÄÄÄÅçΩπÕ–Å—°’µâπÖ•±	±ΩàÄÙÅÖ›Ö•–Åç…ïÖ—ïY•ëïΩQ°’µâπÖ•±	±Ωà°ô•±î§Ï((ÄÄÄÅ•òÄ°—°’µâπÖ•±	±Ωà§ÅÏ(ÄÄÄÄÄÅçΩπÕ–Å—°’µâU¡±ΩÖêÄÙÅÖ›Ö•–Å’¡±ΩÖë5ïë•ÖQΩH»°—°’µâπÖ•±	±Ωà§Ï(ÄÄÄÄÄÅ—°’µâπÖ•±U…∞ÄÙÅ—°’µâU¡±ΩÖê¸π’…∞ÅÒÅπ’±∞Ï(ÄÄÄÅÙ(ÄÅÙÅçÖ—ç†Ä°—°’µâ…»§ÅÏ(ÄÄÄÅçΩπÕΩ±îπ›Ö…∏†â9ºÅÕîÅ¡’ëºÅùïπï…Ö»Å±ÑÅçÖÀÖ—’±Ñ∞Åï∞ÅŸ•ëïºÅÕîÅÕ’âîÅ•ù’Ö∞Ëà∞Å—°’µâ…»§Ï(ÄÅÙ((ÄÅçΩπÕ–ÅÏÅëÖ—ÑÈç…ïÖ—ïëY•ëïº∞Åï……Ω»ËÅ•πÕï…—……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†âŸ•ëïΩÃà§π•πÕï…–°Ï(ÄÄÄÅ’Õï…}•êËÅç’……ïπ—UÕï»π•ê∞(ÄÄÄÅ¡±Ö—ôΩ…¥ËÄâ’¡±ΩÖêà∞(ÄÄÄÅ—•—±î∞(ÄÄÄÅŸ•ëïΩ}’…∞ËÅŸ•ëïΩU¡±ΩÖêπ’…∞∞(ÄÄÄÅ—°’µâπÖ•±}’…∞ËÅ—°’µâπÖ•±U…∞∞(ÄÄÄÅç±•ïπ—}Ω…•ù•∏ËÅùï—1•ŸïMç…Ω±±±•ïπ—=…•ù•∏†§(ÄÅÙ§πÕï±ïç–†â•êà§πÕ•πù±î†§Ï((ÄÅâ—∏πë•ÕÖâ±ïêÄÙÅôÖ±ÕîÏ(ÄÅâ—∏π—ï·—Ωπ—ïπ–ÄÙÄâA’â±•çÖ»ÅŸ•ëïºàÏ((ÄÅ•òÄ°•πÕï…—……Ω»§ÅÏ(ÄÄÄÅÖ›Ö•–ÅA…Ωµ•ÕîπÖ±±Mï——±ïê°l(ÄÄÄÄÄÅëï±ï—ï5ïë•Ö…ΩµH»°Ÿ•ëïΩU¡±ΩÖê¸π’…∞§∞(ÄÄÄÄÄÅëï±ï—ï5ïë•Ö…ΩµH»°—°’µâπÖ•±U…∞§(ÄÄÄÅt§Ï(ÄÄÄÅï……∞π—ï·—Ωπ—ïπ–ÄÙÅ•πÕï…—……Ω»πµïÕÕÖùîÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅ—…‰ÅÏ(ÄÄÄÅÖ›Ö•–ÅÕÖŸïY•ëïΩ!ÖÕ°—ÖùÃ°ç…ïÖ—ïëY•ëïºπ•ê§Ï(ÄÅÙÅçÖ—ç†Ä°—Öù……Ω»§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†âY•ëïºÅ¡’â±•çÖëºÏÅπºÅ¡’ë•µΩÃÅù’Ö…ëÖ»ÅÕ’ÃÅ°ÖÕ°—ÖùÃà§Ï(ÄÅÙ(ÄÅ±ÕAï…ôÖç°îπôïïêÄÙÅÏÅëÖ—ÑÈπ’±∞∞ÅÖ–Ë¿ÅÙÏ((ÄÅçΩπÕ–Å…ï›Ö…êÄÙÅÖ›Ö•–Åùï—U¡±ΩÖëIï›Ö…ëAΩ•π—Ã†§Ï(ÄÅ±ï–ÅïÖ…πïêÄÙÄ¿Ï((ÄÅ•òÄ°ç’……ïπ—A…Ωô•±îπ•Õ}â±Ωç≠ïê§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†âY•ëïºÅ¡’â±•çÖëºÄ°Õ•∏Å¡’π—ΩÃËÅç’ïπ—ÑÅâ±Ω≈’ïÖëÑ§à§Ï(ÄÅÙÅï±ÕîÅÏ(ÄÄÄÅïÖ…πïêÄÙÅ…ï›Ö…êÏ(ÄÄÄÅç’……ïπ—A…Ωô•±îπ¡Ω•π—Õ}âÖ±ÖπçîÄ¨ÙÅ…ï›Ö…êÏ(ÄÄÄÅ’¡ëÖ—ï	Ö±ÖπçïU$†§Ï(ÄÄÄÅÕ°Ω›±ΩÖ—•πùAΩ•π—ÕMÖôî°…ï›Ö…ê§Ï(ÄÅÙ((ÄÅ…ïçΩ…ëÖ•±Â°Ö±±ïπùïŸïπ–†â’¡±ΩÖë}Ÿ•ëïºà∞Åç…ïÖ—ïëY•ëïºπ•ê§Ï(ÄÅÕ°Ω›Y•ëïΩA’â±•Õ°ïëM’ççïÕÃ°—•—±î∞ÅïÖ…πïê§Ï)Ù((ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ(ººÅ	%11QIÄºÅ9)(ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ)ÖÕÂπåÅô’πç—•Ω∏Å…ïπëï…]Ö±±ï–†§ÅÏ(ÄÅçΩπÕ–ÅµÖ•∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÖ¡¡Y•ï‹à§Ï(ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄÒ¿˘Ö…ùÖπëºÅâ•±±ï—ï…Ñ∏∏∏Ω¿˘ÄÏ((ÄÅçΩπÕ–Å¡±ÖπÃÄÙÅÖ›Ö•–Å±ΩÖëA±ÖπÃ†§Ï(ÄÅçΩπÕ–Å¡±Ö∏ÄÙÅ¡±ÖπÃπô•πê°¿ÄÙ¯Å¿π•êÄÙÙÙÅç’……ïπ—A…Ωô•±îπ¡±Öπ}•ê§ÅÒÅ¡±ÖπÕl¡tÏ((ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅ±ïëùï»ÅÙÄÙÅÖ›Ö•–ÅÕà(ÄÄÄÄπô…Ω¥†â¡Ω•π—Õ}±ïëùï»à§(ÄÄÄÄπÕï±ïç–†à®à§(ÄÄÄÄπïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§(ÄÄÄÄπΩ…ëï»†âç…ïÖ—ïë}Ö–à∞ÅÏÅÖÕçïπë•πúËÅôÖ±ÕîÅÙ§(ÄÄÄÄπ±•µ•–†ÿ¿§Ï((ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅâΩΩÕ—M—Ö—’ÃÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âùï—}âΩΩÕ—}Õ—Ö—’Ãà∞ÅÏÅ¡}’Õï…}•êËÅç’……ïπ—UÕï»π•êÅÙ§Ï(ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅ›Ö±±ï—Ωπô•úÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†âÖ¡¡}—ï·—}çΩπô•úà§πÕï±ïç–†à®à§πïƒ†â≠ï‰à∞Äâ›Ö±±ï—}Ÿ•Õ•â•±•—‰à§πÕ•πù±î†§Ï(ÄÅçΩπÕ–Å›Ö±±ï—±ΩÕïêÄÙÅ›Ö±±ï—Ωπô•ú¸πŸÖ±’îÄÙÙÙÄâç±ΩÕïêàÄòòÄÖç’……ïπ—A…Ωô•±îπ•Õ}Öëµ•∏Ï((ÄÅçΩπÕ–Å5%9}I4ÄÙÄƒ‘¿¿Ï(ÄÅçΩπÕ–Å¡…Ωù…ïÕÕAç–ÄÙÅ5Ö—†πµ•∏†ƒ¿¿∞Ä°ç’……ïπ—A…Ωô•±îπ¡Ω•π—Õ}âÖ±ÖπçîÄºÅ5%9}I4§Ä®Äƒ¿¿§Ï(ÄÅçΩπÕ–Åµ•ÕÕ•πúÄÙÅ5Ö—†πµÖ‡†¿∞Å5%9}I4Ä¥Åç’……ïπ—A…Ωô•±îπ¡Ω•π—Õ}âÖ±Öπçî§Ï(ÄÅçΩπÕ–ÅçΩµµ•ÕÕ•ΩπA…ïŸ•ï‹ÄÙÅ5Ö—†π…Ω’πê°5%9}I4Ä®Å¡±Ö∏πçΩµµ•ÕÕ•Ωπ}¡ç–§Ï((ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒ†ƒÅç±ÖÕÃÙâ¡Öùîµ—•—±îà˘	•±±ï—ï…ÑΩ†ƒ¯(ÄÄÄÄëÌ›Ö±±ï—Ωπô•ú¸πŸÖ±’îÄÙÙÙÄâç±ΩÕïêàÄòòÅç’……ïπ—A…Ωô•±îπ•Õ}Öëµ•∏Ä¸ÅÄÒë•ÿÅÕ—Â±îÙââÖç≠ù…Ω’πêÈ…ùâÑ†»–‡∞ƒƒÃ∞ƒƒÃ∞¿∏ƒ§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µ…ïê§ÏÅçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏÅ¡Öëë•πúËƒ¡¡‡Äƒ—¡‡ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅµÖ…ù•∏µâΩ——Ω¥ËƒŸ¡‡Ïà˚¬~RHÅ1ΩÃÅ…ï—•…ΩÃÅïÕ”Ö∏ÅII=LÅ¡Ö…ÑÅï∞Å…ïÕ—ºÅëîÅ±ΩÃÅ’Õ’Ö…•ΩÃÅÖ°Ω…ÑÅµ•Õµº∏ÅYΩÃÅÕïù◊µÃÅ¡’ë•ïπëºÅ…ï—•…Ö»∏ÅÖµâ•Ö±ºÅëïÕëîÅï∞Å¡Öπï∞ÅëîÅëµ•∏∏Ωë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÒ¿Åç±ÖÕÃÙâ¡ÖùîµÕ’àà˘A±Ö∏ÅÖç—’Ö∞ËÄÒÕ—…ΩπúÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§à¯ëÌ¡±Ö∏ππÖµïÙΩÕ—…Ωπú¯É
‹ÅΩµ•ÕßÕ∏Å¡Ω»Å…ï—•…ºËÄëÏ°¡±Ö∏πçΩµµ•ÕÕ•Ωπ}¡ç–Ä®Äƒ¿¿§π—Ω•·ïê†¿•ÙîÉ
‹ÅÖπ©îÅ∑µπ•µºËÄƒ∏‘¿¿Å¡—ÃΩ¿¯((ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ›Ö±±ï–µ°ï…ºà¯(ÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Öâï∞à˘	Ö±ÖπçîÅÖç—’Ö∞Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙââ•úÅµΩπºà¯ëÌç’……ïπ—A…Ωô•±îπ¡Ω•π—Õ}âÖ±ÖπçïÙÅ¡—ÃΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Öâï∞à˘≈’•ŸÖ±îÅÖ¡…Ω‡∏ÅÑÄ°Öπ—ïÃÅëîÅçΩµ•ÕßÕ∏§Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙââ•úÅµΩπºàÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§à¯êëÌç’……ïπ—A…Ωô•±îπ¡Ω•π—Õ}âÖ±Öπçîπ—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙÅILΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄëÌ…ïπëï…	ΩΩÕ—	Ω‡°¡±Ö∏∞ÅâΩΩÕ—M—Ö—’Ã•Ù((ÄÄÄÄÒë•ÿÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ë»·¡‡à¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌôΩπ–µÕ•ÈîËƒÕ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒÕ¡Ö∏˘A…Ωù…ïÕºÅ°Öç•ÑÅ—‘Å¡ÀÕ·•µºÅçÖπ©îΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÒÕ¡Ö∏Åç±ÖÕÃÙâµΩπºà¯ëÌç’……ïπ—A…Ωô•±îπ¡Ω•π—Õ}âÖ±ÖπçïÙÄºÄëÌ5%9}I5ÙÅ¡—ÃΩÕ¡Ö∏¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙââÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË»¡¡‡Ì°ï•ù°–Ëƒ—¡‡ÌΩŸï…ô±Ω‹È°•ëëï∏Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ›•ë—†ËëÌ¡…Ωù…ïÕÕAç—ÙîÌ°ï•ù°–Ëƒ¿¿îÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†‰¡ëïú∞ÅŸÖ»†¥µùΩ±êµë•¥§∞ÅŸÖ»†¥µùΩ±ê§§Ì—…ÖπÕ•—•Ω∏È›•ë—†Ä¿∏—ÃÅïÖÕîÏà¯Ωë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿ËŸ¡‡Ïà¯(ÄÄÄÄÄÄÄÄëÌµ•ÕÕ•πúÄ¯Ä¿Ä¸ÅÅQîÅôÖ±—Ö∏ÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§à¯ëÌµ•ÕÕ•πùÙÅ¡—ÃΩÕ¡Ö∏¯Å¡Ö…ÑÅ¡Ωëï»ÅçÖπ©ïÖ…ÄÄËÅÉ
ÖeÑÅ¡Ωì•ÃÅÕΩ±•ç•—Ö»Å—‘ÅçÖπ©îÑÉ¬~:%ÅÙ(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄëÌ›Ö±±ï—±ΩÕïêÄ¸ÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ë»·¡‡ÏÅ—ï·–µÖ±•ù∏Èçïπ—ï»ÏÅâΩ…ëï»µçΩ±Ω»ÈŸÖ»†¥µ…ïê§Ïà¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÃ…¡‡ÏÅµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà˚¬~RHΩë•ÿ¯(ÄÄÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë¿Ïà˘Iï—•…ΩÃÅ¡Ö’ÕÖëΩÃΩ†Ã¯(ÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒÕ¡‡Ïà˘Õ—ÖµΩÃÅÖ©’Õ—ÖπëºÅï∞ÅÕ•Õ—ïµÑÅëîÅçÖπ©ïÃ∏ÅQ’ÃÅ¡’π—ΩÃÅÕ•ù’ï∏ÅÑÅÕÖ±Ÿº∞ÅŸΩ±€§ÅÑÅ•π—ïπ—Ö»Å∑ÖÃÅ—Ö…ëî∏Ω¿¯(ÄÄÄÄΩë•ÿ˘ÄÄËÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ë»·¡‡à¯(ÄÄÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë¿à˘MΩ±•ç•—Ö»ÅçÖπ©îΩ†Ã¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâô•ï±êà¯(ÄÄÄÄÄÄÄÄÒ±Öâï∞˘A’π—ΩÃÅÑÅçÖπ©ïÖ»Ä°∑µπ•µºÄƒ∏‘¿¿§Ω±Öâï∞¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâπ’µâï»àÅ•êÙâ…ïëïïµAΩ•π—ÃàÅ¡±Öçï°Ω±ëï»Ùàƒ‘¿¿àÅµ•∏Ùàƒ‘¿¿àÅµÖ‡ÙàëÌç’……ïπ—A…Ωô•±îπ¡Ω•π—Õ}âÖ±ÖπçïÙàÅΩπ•π¡’–Ùâ’¡ëÖ—ïIïëïïµA…ïŸ•ï‹†ëÌ¡±Ö∏πçΩµµ•ÕÕ•Ωπ}¡ç—Ù§à¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâô•ï±êà¯(ÄÄÄÄÄÄÄÄÒ±Öâï∞˘±•ÖÃÅëîÅ5ï…çÖëΩAÖùºΩ±Öâï∞¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâ…ïëïïµ±•ÖÃàÅ¡±Öçï°Ω±ëï»Ùâ—‘πÖ±•ÖÃπµ¿à¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅ•êÙâ…ïëïïµA…ïŸ•ï‹àÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÄÅΩ∏Å±ÑÅçΩµ•ÕßÕ∏ÅëîÅ—‘Å¡±Ö∏Ä†ëÏ°¡±Ö∏πçΩµµ•ÕÕ•Ωπ}¡ç–Ä®Äƒ¿¿§π—Ω•·ïê†¿•Ùî§∞Äƒ∏‘¿¿Å¡—ÃÅ—îÅëÖÀµÖ∏ÄÒÕ—…ΩπúÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§à¯êëÏ†ƒ‘¿¿Ä¥ÅçΩµµ•ÕÕ•ΩπA…ïŸ•ï‹§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙΩÕ—…Ωπú¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨Ùâ°Öπë±ïIïëïï¥†ëÌ¡±Ö∏πçΩµµ•ÕÕ•Ωπ}¡ç—Ù§à˘MΩ±•ç•—Ö»ÅçÖπ©îΩâ’——Ω∏¯(ÄÄÄÄÄÄÒë•ÿÅ•êÙâ…ïëïïµ……Ω»àÅç±ÖÕÃÙâï……Ω»µµÕúà¯Ωë•ÿ¯(ÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏÅµÖ…ù•∏µ—Ω¿Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÄÅ1ΩÃÅçÖπ©ïÃÅÕîÅ…ïŸ•ÕÖ∏ÅµÖπ’Ö±µïπ—îÅÖπ—ïÃÅëîÅÖç…ïë•—Ö…Õî∏Å∞ÅÕÖ±ëºÅÕîÅëïÕç’ïπ—ÑÅÖ∞ÅÕΩ±•ç•—Ö»∏(ÄÄÄÄÄÄÄÅQΩ¡îÅëîÅçÖπ©îÅÕïµÖπÖ∞Åï∏Å—‘Å¡±Ö∏ËÄêëÌ¡±Ö∏π›ïï≠±Â}…ïëïµ¡—•Ωπ}çÖ¿π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•Ù∏(ÄÄÄÄÄÄΩ¿¯(ÄÄÄÄΩë•ÿ˘ÅÙ((ÄÄÄÄÒ†Ã˘!•Õ—Ω…•Ö∞ÅëîÅµΩŸ•µ•ïπ—ΩÃΩ†Ã¯(ÄÄÄÄÒë•ÿÅ•êÙâ±ïëùï…1•Õ–à¯(ÄÄÄÄÄÄëÏ°±ïëùï»ÅÒÅmt§πµÖ¿°∞ÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ïëùï»µ…Ω‹à¯(ÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏¯ëÌ…ïÖÕΩπ1Öâï∞°∞π…ïÖÕΩ∏•ÙÉ
‹ÄëÌπï‹ÅÖ—î°∞πç…ïÖ—ïë}Ö–§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏Åç±ÖÕÃÙâÖµ–ÅµΩπºÄëÌ∞πÖµΩ’π–Ä¯ÙÄ¿Ä¸Äâ¡ΩÃàÄËÄâπïúâÙà¯ëÌ∞πÖµΩ’π–Ä¯ÙÄ¿Ä¸Äà¨àÄËÄàâÙëÌ∞πÖµΩ’π—ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÅÄ§π©Ω•∏†àà§ÅÒÄàÒ¿ÅÕ—Â±îÙùçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ú˘M•∏ÅµΩŸ•µ•ïπ—ΩÃÅ—ΩëÖ€µÑ∏Ω¿¯âÙ(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ô’πç—•Ω∏Å…ïπëï…	ΩΩÕ—	Ω‡°¡±Ö∏∞ÅÕ—Ö—’Ã§ÅÏ(ÄÅ•òÄ†ÖÕ—Ö—’ÃÅÒÄÖÕ—Ö—’Ãπ°ÖÕ}âΩΩÕ—}¡±Ö∏§ÅÏ(ÄÄÄÅ…ï—’…∏ÅÄ(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ë»—¡‡ÏÅ—ï·–µÖ±•ù∏Èçïπ—ï»ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒÕ¡‡Ïà¯(ÄÄÄÄÄÄÄÅQ‘Å¡±Ö∏Ä†ëÌ¡±Ö∏ππÖµïÙ§ÅπºÅ•πç±’ÂîÅâΩΩÕ–ÅÖç—•ŸÖâ±î∏ÄÒâ’——Ω∏ÅΩπç±•ç¨ÙâÕ›•—ç°QÖà†ùÕ—Ω…îú§àÅÕ—Â±îÙââÖç≠ù…Ω’πêÈπΩπîÌâΩ…ëï»ÈπΩπîÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ìç’…ÕΩ»È¡Ω•π—ï»ÌôΩπ–µôÖµ•±‰È•π°ï…•–Ïà˘Yï»Å¡±ÖπïÃÅï∏ÅQ•ïπëÑÉäHΩâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ˘ÄÏ(ÄÅÙ(ÄÅ•òÄ°Õ—Ö—’ÃπÖç—•Ÿî§ÅÏ(ÄÄÄÅçΩπÕ–Åï·¡•…ïÃÄÙÅπï‹ÅÖ—î°Õ—Ö—’Ãπï·¡•…ïÕ}Ö–§Ï(ÄÄÄÅ…ï—’…∏ÅÄ(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ë»—¡‡ÏÅâΩ…ëï»µçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§Ïà¯(ÄÄÄÄÄÄÄÉäjÑÅ	ΩΩÕ–ÄÒÕ—…Ωπú˘‡ëÌ¡±Ö∏πâΩΩÕ—}µ’±—•¡±•ï…ÙΩÕ—…Ωπú¯ÅÖç—•ŸºÅ°ÖÕ—ÑÄÒÕ—…Ωπú¯ëÌï·¡•…ïÃπ—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙΩÕ—…Ωπú¯(ÄÄÄÄÄÄΩë•ÿ˘ÄÏ(ÄÅÙ(ÄÅ•òÄ†ÖÕ—Ö—’ÃπçÖπ}Öç—•ŸÖ—î§ÅÏ(ÄÄÄÅçΩπÕ–Åπï·–ÄÙÅπï‹ÅÖ—î°Õ—Ö—’Ãππï·—}ÖŸÖ•±Öâ±î§Ï(ÄÄÄÅ…ï—’…∏ÅÄ(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ë»—¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒÕ¡‡Ïà¯(ÄÄÄÄÄÄÄÅQ‘Å¡ÀÕ·•µºÅâΩΩÕ–Å‡ëÌ¡±Ö∏πâΩΩÕ—}µ’±—•¡±•ï…ÙÅïÕ—ÖÀÑÅë•Õ¡Ωπ•â±îÅï∞ÄÒÕ—…ΩπúÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–§à¯ëÌπï·–π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙΩÕ—…Ωπú¯(ÄÄÄÄÄÄΩë•ÿ˘ÄÏ(ÄÅÙ(ÄÅ…ï—’…∏ÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ë»—¡‡ÏÅë•Õ¡±Ö‰Èô±ï‡ÏÅ©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÏÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÏÅô±ï‡µ›…Ö¿È›…Ö¿ÏÅùÖ¿Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÒÕ¡Ö∏˘Qïª•ÃÅë•Õ¡Ωπ•â±îÅ—‘ÅâΩΩÕ–ÄÒÕ—…ΩπúÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§à˘‡ëÌ¡±Ö∏πâΩΩÕ—}µ’±—•¡±•ï…ÙΩÕ—…Ωπú¯Å¡Ω»Ä»—°ÃΩÕ¡Ö∏¯(ÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨Ùâ°Öπë±ïç—•ŸÖ—ï	ΩΩÕ–†§à˘ç—•ŸÖ»ÅâΩΩÕ–Ωâ’——Ω∏¯(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïç—•ŸÖ—ï	ΩΩÕ–†§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖç—•ŸÖ—ï}âΩΩÕ–à∞ÅÏÅ¡}’Õï…}•êËÅç’……ïπ—UÕï»π•êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅÖç—•ŸÖ»Åï∞ÅâΩΩÕ–à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–†ã
Ö	ΩΩÕ–ÅÖç—•ŸÖëºÅ¡Ω»Ä»—°ÃÑà§Ï(ÄÅ…ïπëï…]Ö±±ï–†§Ï)Ù()ô’πç—•Ω∏Å’¡ëÖ—ïIïëïïµA…ïŸ•ï‹°çΩµµ•ÕÕ•ΩπAç–§ÅÏ(ÄÅçΩπÕ–Å•π¡’–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â…ïëïïµAΩ•π—Ãà§Ï(ÄÅçΩπÕ–Å¡…ïŸ•ï‹ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â…ïëïïµA…ïŸ•ï‹à§Ï(ÄÅçΩπÕ–Å¡Ω•π—ÃÄÙÅ¡Ö…Õï%π–°•π¡’–πŸÖ±’î∞Äƒ¿§ÅÒÄƒ‘¿¿Ï(ÄÅçΩπÕ–ÅçΩµµ•ÕÕ•Ω∏ÄÙÅ5Ö—†π…Ω’πê°¡Ω•π—ÃÄ®ÅçΩµµ•ÕÕ•ΩπAç–§Ï(ÄÅ¡…ïŸ•ï‹π•ππï…!Q50ÄÙÅÅΩ∏Å±ÑÅçΩµ•ÕßÕ∏ÅëîÅ—‘Å¡±Ö∏Ä†ëÏ°çΩµµ•ÕÕ•ΩπAç–Ä®Äƒ¿¿§π—Ω•·ïê†¿•Ùî§∞ÄëÌ¡Ω•π—ÕÙÅ¡—ÃÅ—îÅëÖÀµÖ∏ÄÒÕ—…ΩπúÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§à¯êëÏ°¡Ω•π—ÃÄ¥ÅçΩµµ•ÕÕ•Ω∏§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙΩÕ—…Ωπú˘ÄÏ)Ù()ô’πç—•Ω∏Å…ïÖÕΩπ1Öâï∞°…ïÖÕΩ∏§ÅÏ(ÄÅçΩπÕ–Å±Öâï±ÃÄÙÅÏ(ÄÄÄÅ’¡±ΩÖêËÄâM’â•Õ—îÅ’∏ÅŸ•ëïºà∞(ÄÄÄÅ›Ö—ç†ËÄâ5•…ÖÕ—îÅ’∏ÅŸ•ëïºà∞(ÄÄÄÅ›Ö—ç°ïë}âÂ}Ω—°ï»ËÄâ5•…Ö…Ω∏Å—‘ÅŸ•ëïºà∞(ÄÄÄÅ…ïëïµ¡—•Ω∏ËÄâÖπ©îÅÕΩ±•ç•—Öëºà∞(ÄÄÄÅÖë©’Õ—µïπ–ËÄâ©’Õ—îÅµÖπ’Ö∞à(ÄÅÙÏ(ÄÅ…ï—’…∏Å±Öâï±Õm…ïÖÕΩπtÅÒÅ…ïÖÕΩ∏Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïIïëïï¥†§ÅÏ(ÄÅçΩπÕ–Å¡Ω•π—ÃÄÙÅ¡Ö…Õï%π–°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â…ïëïïµAΩ•π—Ãà§πŸÖ±’î∞Äƒ¿§Ï(ÄÅçΩπÕ–ÅÖ±•ÖÃÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â…ïëïïµ±•ÖÃà§πŸÖ±’îπ—…•¥†§Ï(ÄÅçΩπÕ–Åï……∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â…ïëïïµ……Ω»à§Ï(ÄÅï……∞π—ï·—Ωπ—ïπ–ÄÙÄààÏ((ÄÅ•òÄ†Ö¡Ω•π—ÃÅÒÄÖÖ±•ÖÃ§ÅÏÅï……∞π—ï·—Ωπ—ïπ–ÄÙÄâΩµ¡±ï”ÑÅ±ΩÃÅ¡’π—ΩÃÅ‰Åï∞ÅÖ±•ÖÃ∏àÏÅ…ï—’…∏ÏÅÙ((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†â…ï≈’ïÕ—}…ïëïµ¡—•Ω∏à∞ÅÏ(ÄÄÄÅ¡}’Õï…}•êËÅç’……ïπ—UÕï»π•ê∞(ÄÄÄÅ¡}¡Ω•π—ÃËÅ¡Ω•π—Ã∞(ÄÄÄÅ¡}Ö±•ÖÃËÅÖ±•ÖÃ(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»§ÅÏÅï……∞π—ï·—Ωπ—ïπ–ÄÙÅï……Ω»πµïÕÕÖùîÏÅ…ï—’…∏ÏÅÙ(ÄÅ•òÄ†ÖëÖ—ÑπΩ¨§ÅÏ(ÄÄÄÅçΩπÕ–ÅµïÕÕÖùïÃÄÙÅÏ(ÄÄÄÄÄÅâï±Ω›}µ•π•µ’¥ËÄâ∞Å∑µπ•µºÅ¡Ö…ÑÅçÖπ©ïÖ»ÅïÃÄƒ∏‘¿¿Å¡’π—ΩÃ∏à∞(ÄÄÄÄÄÅ•πÕ’ôô•ç•ïπ—}âÖ±ÖπçîËÄâ9ºÅ—ïª•ÃÅÕ’ô•ç•ïπ—ïÃÅ¡’π—ΩÃ∏à∞(ÄÄÄÄÄÅ›ïï≠±Â}çÖ¡}ï·çïïëïêËÅÅM’¡ï…ÖÕ—îÅï∞Å—Ω¡îÅëîÅçÖπ©îÅÕïµÖπÖ∞ÅëîÅ—‘Å¡±Ö∏∏ÅQîÅ≈’ïëÖ∏ÄêëÌ5Ö—†πµÖ‡†¿∞ÅëÖ—Ñπ…ïµÖ•π•πúÅÒÄ¿§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙÅë•Õ¡Ωπ•â±ïÃÅïÕ—ÑÅÕïµÖπÑπÄ∞(ÄÄÄÄÄÅç’ïπ—Ö}â±Ω≈’ïÖëÑËÄâQ‘Åç’ïπ—ÑÅïÕ”ÑÅâ±Ω≈’ïÖëÑÅ¡Ö…ÑÅçÖπ©ïÃÄ°ëï—ïç—ÖµΩÃÅΩ—…ÑÅç’ïπ—ÑÅëïÕëîÅ±ÑÅµ•ÕµÑÅ…ïê§∏ÅΩπ—Öç—ÖπΩÃÅÕ§Åç…ó•ÃÅ≈’îÅïÃÅ’∏Åï……Ω»∏à(ÄÄÄÅÙÏ(ÄÄÄÅï……∞π—ï·—Ωπ—ïπ–ÄÙÅµïÕÕÖùïÕmëÖ—Ñπï……Ω…tÅÒÅëÖ—Ñπï……Ω»Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅç’……ïπ—A…Ωô•±îπ¡Ω•π—Õ}âÖ±ÖπçîÄ¥ÙÅ¡Ω•π—ÃÏ(ÄÅ’¡ëÖ—ï	Ö±ÖπçïU$†§Ï(ÄÅÕ°Ω›QΩÖÕ–°ÅÖπ©îÅÕΩ±•ç•—ÖëºËÅ…ïç•ãµÃÄêëÌëÖ—ÑπÖµΩ’π—}Ö…Ãπ—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙÄ°çΩµ•ÕßÕ∏ËÄêëÌëÖ—ÑπçΩµµ•ÕÕ•Ωπ}Ö…ÕÙ•Ä§Ï(ÄÅ…ïπëï…]Ö±±ï–†§Ï)Ù((ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ(ººÅ5$ÅAI%0ÉäPÅŸ•ëïΩÃÅ¡…Ω¡•ΩÃÅ‰Åç◊Öπ—ºÅùïπï…Ö…Ω∏(ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ()ô’πç—•Ω∏Å±ÕQ•µïùº°ëÖ—ïM—…•πú§ÅÏ(ÄÅ•òÄ†ÖëÖ—ïM—…•πú§Å…ï—’…∏ÄààÏ(ÄÅçΩπÕ–Åë•ôòÄÙÅ5Ö—†πµÖ‡†¿∞ÅÖ—îππΩ‹†§Ä¥Åπï‹ÅÖ—î°ëÖ—ïM—…•πú§πùï—Q•µî†§§Ï(ÄÅçΩπÕ–Åµ•πÃÄÙÅ5Ö—†πô±ΩΩ»°ë•ôòÄºÄÿ¿¿¿¿§Ï(ÄÅ•òÄ°µ•πÃÄÄƒ§Å…ï—’…∏Äâ°Ω…ÑàÏ(ÄÅ•òÄ°µ•πÃÄÄÿ¿§Å…ï—’…∏ÅÅ!ÖçîÄëÌµ•πÕÙÅµ•πÄÏ(ÄÅçΩπÕ–Å°…ÃÄÙÅ5Ö—†πô±ΩΩ»°µ•πÃÄºÄÿ¿§Ï(ÄÅ•òÄ°°…ÃÄÄ»–§Å…ï—’…∏ÅÅ!ÖçîÄëÌ°…ÕÙÅ°ÄÏ(ÄÅçΩπÕ–ÅëÖÂÃÄÙÅ5Ö—†πô±ΩΩ»°°…ÃÄºÄ»–§Ï(ÄÅ…ï—’…∏ÅÅ!ÖçîÄëÌëÖÂÕÙÅëÄÏ)Ù()ô’πç—•Ω∏Å±Õ%Õ]•—°•π!Ω’…Ã°ëÖ—ïM—…•πú∞Å°Ω’…Ã§ÅÏ(ÄÅ•òÄ†ÖëÖ—ïM—…•πú§Å…ï—’…∏ÅôÖ±ÕîÏ(ÄÅçΩπÕ–Å–ÄÙÅπï‹ÅÖ—î°ëÖ—ïM—…•πú§πùï—Q•µî†§Ï(ÄÅ…ï—’…∏Å9’µâï»π•Õ•π•—î°–§ÄòòÄ°Ö—îππΩ‹†§Ä¥Å–§Ä¯ÙÄ¿ÄòòÄ°Ö—îππΩ‹†§Ä¥Å–§ÄÙÅ°Ω’…ÃÄ®ÄÃÿ¿¿¿¿¿Ï)Ù()ô’πç—•Ω∏Å±Õ	’•±ëIïçïπ—ç—•Ÿ•—‰°Ÿ•ëïΩÃ∞ÅâÖëùïÃ§ÅÏ(ÄÅçΩπÕ–Å•—ïµÃÄÙÅmtÏ((ÄÄ°Ÿ•ëïΩÃÅÒÅmt§πÕ±•çî†¿∞ÄÃ§πôΩ…Öç†°ÿÄÙ¯ÅÏ(ÄÄÄÅ•—ïµÃπ¡’Õ†°Ï(ÄÄÄÄÄÅ•çΩ∏Ëã¬~:∞à∞(ÄÄÄÄÄÅ—•—±îÈÅM’â•Õ—îÉäpëÌÿπ—•—±îÅÒÄâ’∏ÅŸ•ëïºâ˜äuÄ∞(ÄÄÄÄÄÅëÖ—îÈÿπç…ïÖ—ïë}Ö–(ÄÄÄÅÙ§Ï(ÄÅÙ§Ï((ÄÄ°âÖëùïÃÅÒÅmt§πÕ±•çî†¥»§πôΩ…Öç†°àÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–ÅêÄÙÅàπïÖ…πïë}Ö–ÅÒÅàπç…ïÖ—ïë}Ö–ÅÒÅàπ’π±Ωç≠ïë}Ö–Ï(ÄÄÄÅ•òÄ°ê§Å•—ïµÃπ¡’Õ†°Ï(ÄÄÄÄÄÅ•çΩ∏ÈàπâÖëùï}•çΩ∏ÅÒÄã¬~>à∞(ÄÄÄÄÄÅ—•—±îÈÅÖπÖÕ—îÅ±ÑÅµïëÖ±±ÑÉäpëÌàπâÖëùï}πÖµîÅÒÄâ9’ïŸÑÅµïëÖ±±Ñâ˜äuÄ∞(ÄÄÄÄÄÅëÖ—îÈê(ÄÄÄÅÙ§Ï(ÄÅÙ§Ï((ÄÅ…ï—’…∏Å•—ïµÃ(ÄÄÄÄπô•±—ï»°‡ÄÙ¯Å‡πëÖ—î§(ÄÄÄÄπÕΩ…–†°Ñ±à§ÄÙ¯Åπï‹ÅÖ—î°àπëÖ—î§Ä¥Åπï‹ÅÖ—î°ÑπëÖ—î§§(ÄÄÄÄπÕ±•çî†¿∞Ä–§Ï)Ù()ô’πç—•Ω∏Å•π•—A…Ωô•±ï9ΩŸÖQ•±–†§ÅÏ(ÄÅçΩπÕ–Å°ï…ºÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÕA…Ωô•±ï9ΩŸÖ!ï…ºà§Ï(ÄÅçΩπÕ–Å•ππï»ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÕA…Ωô•±ï9ΩŸÖ%ππï»à§Ï(ÄÅ•òÄ†Ö°ï…ºÅÒÄÖ•ππï»ÅÒÅ›•πëΩ‹πµÖ—ç°5ïë•Ñ†à°°ΩŸï»ÈπΩπî§à§πµÖ—ç°ïÃ§Å…ï—’…∏Ï((ÄÅ±ï–Åô…ÖµîÄÙÄ¿Ï(ÄÅ±ï–Å¡Ω•π—ï…`ÄÙÄ¿Ï(ÄÅ±ï–Å¡Ω•π—ï…dÄÙÄ¿Ï(ÄÅçΩπÕ–Å¡Ö•π–ÄÙÄ†§ÄÙ¯ÅÏ(ÄÄÄÅô…ÖµîÄÙÄ¿Ï(ÄÄÄÅçΩπÕ–Å»ÄÙÅ°ï…ºπùï—	Ω’πë•πù±•ïπ—Iïç–†§Ï(ÄÄÄÅçΩπÕ–Å‡ÄÙÅ5Ö—†πµÖ‡†¿∞Å5Ö—†πµ•∏†ƒ∞Ä°¡Ω•π—ï…`Ä¥Å»π±ïô–§ÄºÅ»π›•ë—†§§Ï(ÄÄÄÅçΩπÕ–Å‰ÄÙÅ5Ö—†πµÖ‡†¿∞Å5Ö—†πµ•∏†ƒ∞Ä°¡Ω•π—ï…dÄ¥Å»π—Ω¿§ÄºÅ»π°ï•ù°–§§Ï(ÄÄÄÅçΩπÕ–Å…‰ÄÙÄ°‡Ä¥Ä∏‘§Ä®ÄÃ∏»Ï(ÄÄÄÅçΩπÕ–Å…‡ÄÙÄ†∏‘Ä¥Å‰§Ä®Ä»∏–Ï(ÄÄÄÅ°ï…ºπÕ—Â±îπÕï—A…Ω¡ï…—‰†à¥µ±Ãµù±Ω‹µ‡à∞ÅÄëÌ‡®ƒ¿¡ÙïÄ§Ï(ÄÄÄÅ°ï…ºπÕ—Â±îπÕï—A…Ω¡ï…—‰†à¥µ±Ãµù±Ω‹µ‰à∞ÅÄëÌ‰®ƒ¿¡ÙïÄ§Ï(ÄÄÄÅ•ππï»πÕ—Â±îπ—…ÖπÕôΩ…¥ÄÙÅÅ…Ω—Ö—ï`†ëÌ…·ıëïú§Å…Ω—Ö—ïd†ëÌ…Âıëïú§Å—…ÖπÕ±Ö—ïh†¿•ÄÏ(ÄÅÙÏ(ÄÅçΩπÕ–ÅµΩŸîÄÙÄ°î§ÄÙ¯ÅÏ(ÄÄÄÅ¡Ω•π—ï…`ÄÙÅîπç±•ïπ—`Ï(ÄÄÄÅ¡Ω•π—ï…dÄÙÅîπç±•ïπ—dÏ(ÄÄÄÅ•òÄ†Öô…Öµî§Åô…ÖµîÄÙÅ…ï≈’ïÕ—π•µÖ—•Ωπ…Öµî°¡Ö•π–§Ï(ÄÅÙÏ(ÄÅçΩπÕ–Å…ïÕï–ÄÙÄ†§ÄÙ¯ÅÏ(ÄÄÄÅ•òÄ°ô…Öµî§ÅçÖπçï±π•µÖ—•Ωπ…Öµî°ô…Öµî§Ï(ÄÄÄÅô…ÖµîÄÙÄ¿Ï(ÄÄÄÅ•ππï»πÕ—Â±îπ—…ÖπÕôΩ…¥ÄÙÄààÏ(ÄÅÙÏ(ÄÅ°ï…ºπÖëëŸïπ—1•Õ—ïπï»†âµΩ’ÕïµΩŸîà∞ÅµΩŸî§Ï(ÄÅ°ï…ºπÖëëŸïπ—1•Õ—ïπï»†âµΩ’Õï±ïÖŸîà∞Å…ïÕï–§Ï)Ù(()ÖÕÂπåÅô’πç—•Ω∏Åùï—5ÂA…Ωô•±ïQ•—±î†§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âùï—}µÂ}¡…Ωô•±ï}—•—±îà§Ï(ÄÅ•òÄ°ï……Ω»§ÅÏ(ÄÄÄÅçΩπÕΩ±îπ›Ö…∏†â9ºÅÕîÅ¡’ëºÅçÖ…ùÖ»Åï∞Å”µ—’±ºÅ¡…Ω¡•ºËà∞Åï……Ω»§Ï(ÄÄÄÅ…ï—’…∏Åπ’±∞Ï(ÄÅÙ(ÄÅ…ï—’…∏ÅëÖ—Ñ¸π•—ïµ}•êÄ¸ÅÖ›Ö•–Å°Âë…Ö—ïA…Ωô•±ïQ•—±ïIÖ…•—‰°ëÖ—Ñ§ÄËÅπ’±∞Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Åùï—A’â±•çA…Ωô•±ïQ•—±î°’Õï…%ê§ÅÏ(ÄÅ•òÄ†Ö’Õï…%ê§Å…ï—’…∏Åπ’±∞Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âùï—}¡…Ωô•±ï}—•—±îà∞ÅÏÅ¡}’Õï…}•êÈ’Õï…%êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»§ÅÏ(ÄÄÄÅçΩπÕΩ±îπ›Ö…∏†â9ºÅÕîÅ¡’ëºÅçÖ…ùÖ»Åï∞Å”µ—’±ºÅ√Èâ±•çºËà∞Åï……Ω»§Ï(ÄÄÄÅ…ï—’…∏Åπ’±∞Ï(ÄÅÙ(ÄÅ…ï—’…∏ÅëÖ—Ñ¸π•—ïµ}•êÄ¸ÅÖ›Ö•–Å°Âë…Ö—ïA…Ωô•±ïQ•—±ïIÖ…•—‰°ëÖ—Ñ§ÄËÅπ’±∞Ï)Ù()ô’πç—•Ω∏ÅπΩ…µÖ±•ÈïA…Ωô•±ïQ•—±ïIÖ…•—‰°ŸÖ±’î§ÅÏ(ÄÅçΩπÕ–ÅπΩ…µÖ±•ÈïêÄÙÅM—…•πú°ŸÖ±’îÅÒÄâçΩµ’∏à§(ÄÄÄÄπ—…•¥†§(ÄÄÄÄπ—Ω1Ω›ï…ÖÕî†§(ÄÄÄÄππΩ…µÖ±•Èî†â9à§(ÄÄÄÄπ…ï¡±Öçî†Ωmq‘¿Ã¿¿µq‘¿ÃŸôtΩú∞Äàà§(ÄÄÄÄπ…ï¡±Öçî†ΩmyÑµÈtΩú∞Äàà§Ï(ÄÅçΩπÕ–ÅÖ±•ÖÕïÃÄÙÅÏ(ÄÄÄÅçΩµ’∏ËâçΩµ’∏à∞ÅçΩµµΩ∏ËâçΩµ’∏à∞(ÄÄÄÅ…Ö…ÑËâ…Ö…Ñà∞Å…Ö…ºËâ…Ö…Ñà∞Å…Ö…îËâ…Ö…Ñà∞(ÄÄÄÅï¡•çÑËâï¡•çÑà∞Åï¡•çºËâï¡•çÑà∞Åï¡•åËâï¡•çÑà∞(ÄÄÄÅ±ïùïπëÖ…•ÑËâ±ïùïπëÖ…•Ñà∞Å±ïùïπëÖ…•ºËâ±ïùïπëÖ…•Ñà∞Å±ïùïπëÖ…‰Ëâ±ïùïπëÖ…•Ñà∞(ÄÄÄÅï·ç±’Õ•ŸÑËâï·ç±’Õ•ŸÑà∞Åï·ç±’Õ•ŸºËâï·ç±’Õ•ŸÑà∞Åï·ç±’Õ•ŸîËâï·ç±’Õ•ŸÑà∞(ÄÄÄÅµ•—•çÑËâµ•—•çÑà∞Åµ•—•çºËâµ•—•çÑà∞ÅµÂ—°•åËâµ•—•çÑà(ÄÅÙÏ(ÄÅ…ï—’…∏ÅÖ±•ÖÕïÕmπΩ…µÖ±•ÈïëtÅÒÄâçΩµ’∏àÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Âë…Ö—ïA…Ωô•±ïQ•—±ïIÖ…•—‰°—•—±î§ÅÏ(ÄÅ•òÄ†Ö—•—±î¸π•—ïµ}•ê§Å…ï—’…∏Å—•—±îÏ(ÄÅ•òÄ°—•—±îπ…Ö…•—‰§Å…ï—’…∏ÅÏÄ∏∏π—•—±î∞Å…Ö…•—‰ÈπΩ…µÖ±•ÈïA…Ωô•±ïQ•—±ïIÖ…•—‰°—•—±îπ…Ö…•—‰§ÅÙÏ(ÄÅçΩπÕ–ÅÏÅëÖ—ÑÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†âÕ—Ω…ï}•—ïµÃà§πÕï±ïç–†â…Ö…•—‰à§πïƒ†â•êà∞Å—•—±îπ•—ïµ}•ê§πµÖÂâïM•πù±î†§Ï(ÄÅ…ï—’…∏ÅÏÄ∏∏π—•—±î∞Å…Ö…•—‰ÈπΩ…µÖ±•ÈïA…Ωô•±ïQ•—±ïIÖ…•—‰°ëÖ—Ñ¸π…Ö…•—‰§ÅÙÏ)Ù()ô’πç—•Ω∏Å…ïπëï…A…Ωô•±ïQ•—±ï%π±•πî°—•—±î∞Å•Õ=›πA…Ωô•±îÄÙÅôÖ±Õî§ÅÏ(ÄÅ•òÄ†Ö—•—±î¸π•—ïµ}•ê§ÅÏ(ÄÄÄÅ•òÄ†Ö•Õ=›πA…Ωô•±î§Å…ï—’…∏ÄààÏ((ÄÄÄÅ…ï—’…∏ÅÄ(ÄÄÄÄÄÄÒâ’——Ω∏(ÄÄÄÄÄÄÄÅ—Â¡îÙââ’——Ω∏à(ÄÄÄÄÄÄÄÅΩπç±•ç¨ÙâΩ¡ïπ5ÂQ•—±ïÕ…ΩµA…Ωô•±î†§à(ÄÄÄÄÄÄÄÅ—•—±îÙâ≈’•¡Ö»Å’∏Å”µ—’±ºà(ÄÄÄÄÄÄÄÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÅë•Õ¡±Ö‰È•π±•πîµô±ï‡Ï(ÄÄÄÄÄÄÄÄÄÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ï(ÄÄÄÄÄÄÄÄÄÅ©’Õ—•ô‰µçΩπ—ïπ–Èçïπ—ï»Ï(ÄÄÄÄÄÄÄÄÄÅ›•ë—†ËÃ¡¡‡Ï(ÄÄÄÄÄÄÄÄÄÅ°ï•ù°–ËÃ¡¡‡Ï(ÄÄÄÄÄÄÄÄÄÅµÖ…ù•∏µ—Ω¿Ë’¡‡Ï(ÄÄÄÄÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡Ï(ÄÄÄÄÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†Ã–∞ƒ‰‹∞‰–∞∏–‘§Ï(ÄÄÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†Ã–∞ƒ‰‹∞‰–∞∏ƒ¿§Ï(ÄÄÄÄÄÄÄÄÄÅçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§Ï(ÄÄÄÄÄÄÄÄÄÅôΩπ–µÕ•ÈîË»¡¡‡Ï(ÄÄÄÄÄÄÄÄÄÅôΩπ–µ›ï•ù°–Ë‰¿¿Ï(ÄÄÄÄÄÄÄÄÄÅç’…ÕΩ»È¡Ω•π—ï»Ï(ÄÄÄÄÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Äƒ—¡‡Å…ùâÑ†Ã–∞ƒ‰‹∞‰–∞∏ƒÿ§Ï(ÄÄÄÄÄÄÄÄà(ÄÄÄÄÄÄ¯¨Ωâ’——Ω∏˘ÄÏ(ÄÅÙ((ÄÅçΩπÕ–Å…Ö…•—‰ÄÙÅπΩ…µÖ±•ÈïA…Ωô•±ïQ•—±ïIÖ…•—‰°—•—±îπ…Ö…•—‰§Ï(ÄÅçΩπÕ–Å…Ö…•—Â±ÖÕÃÄÙÅùï—M—Ω…ï	ÖëùïIÖ…•—Â±ÖÕÃ°…Ö…•—‰§Ï(ÄÅçΩπÕ–Å…Ö…•—Â1Öâï∞ÄÙÅùï—M—Ω…ï	ÖëùïIÖ…•—Â1Öâï∞°…Ö…•—‰§Ï(ÄÅ…ï—’…∏ÅÄ(ÄÄÄÄÒâ’——Ω∏(ÄÄÄÄÄÅç±ÖÕÃÙâ±Ãµ¡…Ωô•±îµ—•—±îµç°•¿ÄëÌ…Ö…•—Â±ÖÕÕÙà(ÄÄÄÄÄÅ—Â¡îÙââ’——Ω∏à(ÄÄÄÄÄÄëÌ•Õ=›πA…Ωô•±îÄ¸ÄùΩπç±•ç¨ÙâΩ¡ïπ5ÂQ•—±ïÕ…ΩµA…Ωô•±î†§àúÄËÄàâÙ(ÄÄÄÄÄÅ—•—±îÙàëÌ•Õ=›πA…Ωô•±îÄ¸ÄâÖµâ•Ö»Å”µ—’±ºàÄËÄâSµ—’±ºÅëîÅ¡ï…ô•∞âÙà(ÄÄÄÄÄÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÅë•Õ¡±Ö‰È•π±•πîµô±ï‡Ï(ÄÄÄÄÄÄÄÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ï(ÄÄÄÄÄÄÄÅùÖ¿ËŸ¡‡Ï(ÄÄÄÄÄÄÄÅµÖ…ù•∏µ—Ω¿Ë’¡‡Ï(ÄÄÄÄÄÄÄÅ¡Öëë•πúË—¡‡ÄÂ¡‡Ï(ÄÄÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡Ï(ÄÄÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»¿Ã∞»ƒÃ∞»»‘∞∏»»§Ï(ÄÄÄÄÄÄÄÅôΩπ–µôÖµ•±‰Ëù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÏ(ÄÄÄÄÄÄÄÅôΩπ–µÕ•ÈîËÂ¡‡Ï(ÄÄÄÄÄÄÄÅôΩπ–µ›ï•ù°–Ë‰¿¿Ï(ÄÄÄÄÄÄÄÅ±ï——ï»µÕ¡Öç•πúË∏¿—ï¥Ï(ÄÄÄÄÄÄÄÅ—ï·–µ—…ÖπÕôΩ…¥È’¡¡ï…çÖÕîÏ(ÄÄÄÄÄÄÄÄëÌ•Õ=›πA…Ωô•±îÄ¸Äâç’…ÕΩ»È¡Ω•π—ï»ÏàÄËÄâç’…ÕΩ»ÈëïôÖ’±–ÏâÙ(ÄÄÄÄÄÄà(ÄÄÄÄ¯(ÄÄÄÄÄÄÒÕ¡Ö∏ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡Ïà¯ëÌ—•—±îπ•çΩ∏ÅÒÄã¬~>ﬂæ‚<âÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÒÕ¡Ö∏ÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡ËƒÏà¯ëÌïÕçÖ¡ï!—µ∞°—•—±îππÖµîÅÒÄâSµ—’±ºà•ÙÉ
‹ÄëÌïÕçÖ¡ï!—µ∞°…Ö…•—Â1Öâï∞•ÙΩÕ¡Ö∏¯(ÄÄÄÄΩâ’——Ω∏˘ÄÏ)Ù()ô’πç—•Ω∏ÅΩ¡ïπ5Â	ÖëùïÕ…ΩµA…Ωô•±î†§ÅÏ(ÄÅΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†ââÖëùîà§Ï)Ù()ô’πç—•Ω∏ÅΩ¡ïπ5ÂQ•—±ïÕ…ΩµA…Ωô•±î†§ÅÏ(ÄÅΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†â—•—±îà§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï≈’•¡A…Ωô•±ïQ•—±î°•—ïµ%ê§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âï≈’•¡}¡…Ωô•±ï}—•—±îà∞ÅÏÅ¡}•—ïµ}•êÈ•—ïµ%êÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅçΩπÕ–ÅµÕùÃÄÙÅÏ(ÄÄÄÄÄÅ—•—’±Ω}πΩ}ë•Õ¡Ωπ•â±îËâÕ—îÅ”µ—’±ºÅÂÑÅπºÅïÕ”ÑÅë•Õ¡Ωπ•â±î∏à∞(ÄÄÄÄÄÅ—•—’±Ω}πΩ}ëïÕâ±Ω≈’ïÖëºËâA…•µï…ºÅ—ïª•ÃÅ≈’îÅçΩπÕïù’•»ÅïÕ—îÅ”µ—’±º∏à∞(ÄÄÄÄÄÅπΩ—}Ö’—°ïπ—•çÖ—ïêËâYΩ±€§ÅÑÅ•π•ç•Ö»ÅÕïÕßÕ∏∏à(ÄÄÄÅÙÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°µÕùÕmëÖ—Ñ¸πï……Ω…tÅÒÄâ9ºÅÕîÅ¡’ëºÅï≈’•¡Ö»Åï∞Å”µ—’±ºà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅÕ°Ω›QΩÖÕ–°É¬~>ﬂæ‚<ÅSµ—’±ºÅï≈’•¡ÖëºËÄëÌëÖ—Ñπ—•—±îÅÒÄâ±•Õ—ºâıÄ§Ï(ÄÅ›•πëΩ‹π}}µÂA…Ωô•±ïQ•—±îÄÙÅëÖ—ÑÏ(ÄÅç±ΩÕï5ÖπÖùïë5ΩëÖ∞†§Ï(ÄÅÖ›Ö•–Å…ïπëï…A…Ωô•±î†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïUπï≈’•¡A…Ωô•±ïQ•—±î†§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†â’πï≈’•¡}¡…Ωô•±ï}—•—±îà§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅ≈’•—Ö»Åï∞Å”µ—’±ºà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅ›•πëΩ‹π}}µÂA…Ωô•±ïQ•—±îÄÙÅπ’±∞Ï(ÄÅÕ°Ω›QΩÖÕ–†âSµ—’±ºÅ≈’•—Öëºà§Ï(ÄÅç±ΩÕï5ÖπÖùïë5ΩëÖ∞†§Ï(ÄÅÖ›Ö•–Å…ïπëï…A…Ωô•±î†§Ï)Ù()ô’πç—•Ω∏ÅΩ¡ïπQ•—±ïï—Ö•∞°•—ïµ%ê∞ÅπÖµî∞Å•çΩ∏∞Åï≈’•¡¡ïêÄÙÅôÖ±Õî∞ÅΩâ—Ö•πïë–ÄÙÄàà∞Å…Ö…•—‰ÄÙÄâçΩµ’∏à§ÅÏ(ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ•òÄ†Ö›…Ö¿§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅÕÖôïIÖ…•—‰ÄÙÅπΩ…µÖ±•ÈïA…Ωô•±ïQ•—±ïIÖ…•—‰°…Ö…•—‰§Ï(ÄÅçΩπÕ–Å…Ö…•—Â±ÖÕÃÄÙÅùï—M—Ω…ï	ÖëùïIÖ…•—Â±ÖÕÃ°ÕÖôïIÖ…•—‰§Ï(ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µΩŸï…±Ö‰Å±ÃµµΩëÖ∞µ±Ωç≠ïêàÅÕ—Â±îÙâËµ•πëï‡Ë»–¿ÏàÅëÖ—ÑµµΩëÖ∞µ±Ωç≠ïêÙàƒà¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡àÅÕ—Â±îÙâµÖ‡µ›•ë—†ËÃ‘¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µâΩë‰àÅÕ—Â±îÙâ¡Öëë•πúË»Ÿ¡‡Ì—ï·–µÖ±•ù∏Èçïπ—ï»Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ãµ¡…Ωô•±îµ—•—±îµç°•¿ÄëÌ…Ö…•—Â±ÖÕÕÙàÅÕ—Â±îÙâ›•ë—†Ë‹Ÿ¡‡Ì°ï•ù°–Ë‹Ÿ¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÌâΩ…ëï»µ…Öë•’ÃË‘¿îÌë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ì©’Õ—•ô‰µçΩπ—ïπ–Èçïπ—ï»ÌôΩπ–µÕ•ÈîË–—¡‡ÌµÖ…ù•∏Ë¿ÅÖ’—ºÄƒ¡¡‡Ïà¯ëÌ•çΩ∏ÅÒÄã¬~>ﬂæ‚<âÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒ†»ÅÕ—Â±îÙâµÖ…ù•∏Ë¿Ä¿ÄŸ¡‡Ïà¯ëÌïÕçÖ¡ï!—µ∞°πÖµîÅÒÄâSµ—’±ºà•ÙΩ†»¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÌôΩπ–µôÖµ•±‰Ëù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌôΩπ–µ›ï•ù°–Ë‰¿¿Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÅS5QU1<ÄëÌïÕçÖ¡ï!—µ∞°ùï—M—Ω…ï	ÖëùïIÖ…•—Â1Öâï∞°ÕÖôïIÖ…•—‰§π—ΩU¡¡ï…ÖÕî†§•Ù(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ì±•πîµ°ï•ù°–Ëƒ∏‘ÌµÖ…ù•∏ËƒÕ¡‡Ä¿Ä¿Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—îÅ”µ—’±ºÅÕîÅµ’ïÕ—…ÑÅëïâÖ©ºÅëîÅ—‘ÅπΩµâ…îÅ—Öπ—ºÅï∏Å—‘Å¡ï…ô•∞ÅçΩµºÅç’ÖπëºÅΩ—…ÖÃÅ¡ï…ÕΩπÖÃÅŸ•Õ•—Ö∏Å—‘Å¡ï…ô•∞∏(ÄÄÄÄÄÄÄÄÄÄΩ¿¯(ÄÄÄÄÄÄÄÄÄÄëÌΩâ—Ö•πïë–Ä¸ÅÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ëƒ¡¡‡Ïà˘=â—ïπ•ëºÄëÌπï‹ÅÖ—î°Ωâ—Ö•πïë–§π—Ω1ΩçÖ±ïÖ—ïM—…•πú†âïÃµHà•ÙΩë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌùÖ¿Ë·¡‡ÌµÖ…ù•∏µ—Ω¿Ëƒ·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâô±ï‡ËƒÏàÅΩπç±•ç¨ÙâΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†§à˘YΩ±Ÿï»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌï≈’•¡¡ïê(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅÕ—Â±îÙâô±ï‡ËƒÏàÅΩπç±•ç¨Ùâ°Öπë±ïUπï≈’•¡A…Ωô•±ïQ•—±î†§à˘E’•—Ö»Ωâ’——Ω∏˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄËÅÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅÕ—Â±îÙâô±ï‡ËƒÏàÅΩπç±•ç¨Ùâ°Öπë±ï≈’•¡A…Ωô•±ïQ•—±î†úëÌ•—ïµ%ëÙú§à˘≈’•¡Ö»Ωâ’——Ω∏˘ÅÙ(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù(()ÖÕÂπåÅô’πç—•Ω∏Åùï—≈’•¡¡ïëA…Ωô•±ï5ïëÖ±Ã°’Õï…%ê§ÅÏ(ÄÅ•òÄ†Ö’Õï…%ê§Å…ï—’…∏ÅmtÏ((ÄÅçΩπÕ–ÅmÏÅëÖ—Ñ∞Åï……Ω»ÅÙ∞ÅÏÅëÖ—ÑËÅΩ›πïêÅÙ∞ÅÏÅëÖ—ÑËÅÕ—Ω…ï5ï—ÑÅÙ∞ÅÏÅëÖ—ÑËÅç±Ö•µÃÅıtÄÙÅÖ›Ö•–ÅA…Ωµ•ÕîπÖ±∞°l(ÄÄÄÅÕàπ…¡å†âùï—}ï≈’•¡¡ïë}¡…Ωô•±ï}âÖëùïÃà∞ÅÏÅ¡}’Õï…}•êÈ’Õï…%êÅÙ§∞(ÄÄÄÅÕàπô…Ω¥†â’Õï…}âÖëùïÃà§πÕï±ïç–†ââÖëùï}πÖµî±âÖëùï}•çΩ∏±ïÖ…πïë}Ö–à§πïƒ†â’Õï…}•êà∞Å’Õï…%ê§∞(ÄÄÄÅÕàπô…Ω¥†âÕ—Ω…ï}âÖëùïÃà§πÕï±ïç–†â•ê±âÖëùï}πÖµî±…Ö…•—‰±ëïÕç…•¡—•Ω∏±•Õ}±•µ•—ïê±Õ—Ωç≠}—Ω—Ö∞à§∞(ÄÄÄÅÕàπô…Ω¥†â’Õï…}Õ—Ω…ï}âÖëùï}ç±Ö•µÃà§πÕï±ïç–†ââÖëùï}•ê±Õï…•Ö±}π’µâï»à§πïƒ†â’Õï…}•êà∞Å’Õï…%ê§(ÄÅt§Ï((ÄÅ•òÄ°ï……Ω»§ÅÏ(ÄÄÄÅçΩπÕΩ±îπ›Ö…∏†â9ºÅÕîÅ¡’ë•ï…Ω∏ÅçÖ…ùÖ»ÅµïëÖ±±ÖÃÅï≈’•¡ÖëÖÃËà∞Åï……Ω»§Ï(ÄÄÄÅ…ï—’…∏ÅmtÏ(ÄÅÙ((ÄÅçΩπÕ–ÅΩ›πïë	Â9ÖµîÄÙÅÌÙÏ(ÄÄ°Ω›πïêÅÒÅmt§πôΩ…Öç†°àÄÙ¯ÅÏ(ÄÄÄÅΩ›πïë	Â9ÖµïmM—…•πú°àπâÖëùï}πÖµîÅÒÄàà§π—Ω1Ω›ï…ÖÕî†•tÄÙÅàÏ(ÄÅÙ§Ï((ÄÅçΩπÕ–ÅÕ—Ω…ï	Â9ÖµîÄÙÅÌÙÏ(ÄÄ°Õ—Ω…ï5ï—ÑÅÒÅmt§πôΩ…Öç†°àÄÙ¯ÅÏ(ÄÄÄÅÕ—Ω…ï	Â9ÖµïmM—…•πú°àπâÖëùï}πÖµîÅÒÄàà§π—Ω1Ω›ï…ÖÕî†•tÄÙÅàÏ(ÄÅÙ§Ï((ÄÅçΩπÕ–Åç±Ö•µ	Â	Öëùï%êÄÙÅÌÙÏ(ÄÄ°ç±Ö•µÃÅÒÅmt§πôΩ…Öç†°åÄÙ¯ÅÏ(ÄÄÄÅç±Ö•µ	Â	Öëùï%ëmåπâÖëùï}•ëtÄÙÅåÏ(ÄÅÙ§Ï((ÄÅ…ï—’…∏Ä°ëÖ—ÑÅÒÅmt§(ÄÄÄÄπµÖ¿°¥ÄÙ¯ÅÏ(ÄÄÄÄÄÅçΩπÕ–Å≠ï‰ÄÙÅM—…•πú°¥πâÖëùï}πÖµîÅÒÄàà§π—Ω1Ω›ï…ÖÕî†§Ï(ÄÄÄÄÄÅçΩπÕ–ÅΩ›πïë	ÖëùîÄÙÅΩ›πïë	Â9Öµïm≠ïÂtÅÒÅÌÙÏ(ÄÄÄÄÄÅçΩπÕ–ÅÕ—Ω…ï	ÖëùîÄÙÅÕ—Ω…ï	Â9Öµïm≠ïÂtÅÒÅÌÙÏ(ÄÄÄÄÄÅçΩπÕ–Å±Ö’πç°	ÖëùîÄÙÅùï—1•ŸïMç…Ω±∞Ÿ1Ö’πç°	Öëùï5ï—Ñ°¥πâÖëùï}πÖµî§ÅÒÅÌÙÏ(ÄÄÄÄÄÅçΩπÕ–Åç±Ö•¥ÄÙÅç±Ö•µ	Â	Öëùï%ëmÕ—Ω…ï	Öëùîπ•ëtÅÒÅÌÙÏ((ÄÄÄÄÄÅ…ï—’…∏ÅÏ(ÄÄÄÄÄÄÄÄ∏∏π¥∞(ÄÄÄÄÄÄÄÅâÖëùï}•çΩ∏ËÅ¥πâÖëùï}•çΩ∏ÅÒÅΩ›πïë	ÖëùîπâÖëùï}•çΩ∏ÅÒÄã¬~>à∞(ÄÄÄÄÄÄÄÅïÖ…πïë}Ö–ËÅΩ›πïë	ÖëùîπïÖ…πïë}Ö–ÅÒÄàà∞(ÄÄÄÄÄÄÄÅ…Ö…•—‰ËÅ¥π…Ö…•—‰ÅÒÅÕ—Ω…ï	Öëùîπ…Ö…•—‰ÅÒÅ±Ö’πç°	Öëùîπ…Ö…•—‰ÅÒÄàà∞(ÄÄÄÄÄÄÄÅëïÕç…•¡—•Ω∏ËÅÕ—Ω…ï	ÖëùîπëïÕç…•¡—•Ω∏ÅÒÅ±Ö’πç°	ÖëùîπëïÕç…•¡—•Ω∏ÅÒÄàà∞(ÄÄÄÄÄÄÄÅ•Õ}±•µ•—ïêËÄÑÖÕ—Ω…ï	Öëùîπ•Õ}±•µ•—ïêÅÒÄÑÖ±Ö’πç°	Öëùîπ•Õ}±•µ•—ïê∞(ÄÄÄÄÄÄÄÅÕ—Ωç≠}—Ω—Ö∞ËÅÕ—Ω…ï	ÖëùîπÕ—Ωç≠}—Ω—Ö∞ÅÒÅπ’±∞∞(ÄÄÄÄÄÄÄÅÕï…•Ö±}π’µâï»ËÅç±Ö•¥πÕï…•Ö±}π’µâï»ÅÒÅπ’±∞(ÄÄÄÄÄÅÙÏ(ÄÄÄÅÙ§(ÄÄÄÄπÕΩ…–†°Ñ±à§ÄÙ¯Å9’µâï»°ÑπÕ±Ω—}π’µâï»§Ä¥Å9’µâï»°àπÕ±Ω—}π’µâï»§§Ï)Ù(()ô’πç—•Ω∏Åùï—A…Ωô•±ï5ïëÖ±IÖ…•—Â±ÖÕÃ°…Ö…•—‰§ÅÏ(ÄÅçΩπÕ–ÅÕÖôîÄÙÅlâçΩµ’∏à∞â…Ö…Ñà∞âï¡•çÑà∞â±ïùïπëÖ…•Ñà∞âï·ç±’Õ•ŸÑà∞âµ•—•çÑâtπ•πç±’ëïÃ°…Ö…•—‰§(ÄÄÄÄ¸Å…Ö…•—‰(ÄÄÄÄËÄààÏ(ÄÅ…ï—’…∏ÅÕÖôîÄ¸ÅÅ±ÃµµïëÖ∞µ…Ö…•—‰¥ëÌÕÖôïıÄÄËÄààÏ)Ù()ô’πç—•Ω∏Åùï—A…Ωô•±ï5ïëÖ±IÖ…•—Â1Öâï∞°…Ö…•—‰§ÅÏ(ÄÅ…ï—’…∏Ä°Ï(ÄÄÄÅçΩµ’∏ËâΩ∑È∏à∞(ÄÄÄÅ…Ö…ÑËâIÖ…Ñà∞(ÄÄÄÅï¡•çÑËã%¡•çÑà∞(ÄÄÄÅ±ïùïπëÖ…•ÑËâ1ïùïπëÖ…•Ñà∞(ÄÄÄÅï·ç±’Õ•ŸÑËâ·ç±’Õ•ŸÑà∞(ÄÄÄÅµ•—•çÑËâ7µ—•çÑà(ÄÅÙ•m…Ö…•—ÂtÅÒÄààÏ)Ù()ô’πç—•Ω∏Åùï—1•ŸïMç…Ω±∞Ÿ1Ö’πç°	Öëùï5ï—Ñ°πÖµî§ÅÏ(ÄÅ…ï—’…∏ÅM—…•πú°πÖµîÅÒÄàà§π—…•¥†§π—Ω1Ω›ï…ÖÕî†§ÄÙÙÙÄâô’πëÖëΩ»ÅëîÅ±ÑÅπ’ïŸÑÅï…Ñà(ÄÄÄÄ¸ÅÏ(ÄÄÄÄÄÄÄÅ…Ö…•—‰Ëâµ•—•çÑà∞(ÄÄÄÄÄÄÄÅëïÕç…•¡—•Ω∏ËâIïçΩµ¡ïπÕÑÉÈπ•çÑÅ¡Ö…ÑÅ≈’•ïπïÃÅïÕ—’Ÿ•ï…Ω∏Å¡…ïÕïπ—ïÃÅë’…Öπ—îÅ±ΩÃÅ¡…•µï…ΩÃÄ‹ÅìµÖÃÅëîÅ1•ŸïMç…Ω±∞Äÿ∏à∞(ÄÄÄÄÄÄÄÅ•Õ}±•µ•—ïêÈ—…’î(ÄÄÄÄÄÅÙ(ÄÄÄÄËÅπ’±∞Ï)Ù()ô’πç—•Ω∏Å…ïπëï…≈’•¡¡ïë5ïëÖ±Õ%π±•πî°µïëÖ±Ã∞ÅΩ›πA…Ωô•±îÄÙÅôÖ±Õî§ÅÏ(ÄÅçΩπÕ–ÅÕÖôîÄÙÅ……Ö‰π•Õ……Ö‰°µïëÖ±Ã§Ä¸ÅµïëÖ±ÃπÕ±•çî†¿∞Ã§ÄËÅmtÏ(ÄÅçΩπÕ–ÅÕ±Ω—ÃÄÙÅmtÏ((ÄÅôΩ»Ä°±ï–Å§ÄÙÄƒÏÅ§ÄÙÄÃÏÅ§¨¨§ÅÏ(ÄÄÄÅçΩπÕ–ÅµïëÖ∞ÄÙÅÕÖôîπô•πê°¥ÄÙ¯Å9’µâï»°¥πÕ±Ω—}π’µâï»§ÄÙÙÙÅ§§Ï((ÄÄÄÅ•òÄ°µïëÖ∞§ÅÏ(ÄÄÄÄÄÅÕ±Ω—Ãπ¡’Õ†°Ä(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏à(ÄÄÄÄÄÄÄÄÄÅç±ÖÕÃÙâ±Ãµï≈’•¡¡ïêµµïëÖ∞ÄëÌùï—A…Ωô•±ï5ïëÖ±IÖ…•—Â±ÖÕÃ°µïëÖ∞π…Ö…•—‰•ÙëÌ9’µâï»°µïëÖ∞πÕ±Ω—}π’µâï»§ÄÙÙÙÄƒÄ¸ÄàÅ±ÃµµïëÖ∞µôÖŸΩ…•—îàÄËÄàâÙà(ÄÄÄÄÄÄÄÄÄÅ—•—±îÙàëÌïÕçÖ¡ï!—µ∞°µïëÖ∞πâÖëùï}πÖµîÅÒÄâ5ïëÖ±±Ñà•ÙëÌùï—A…Ωô•±ï5ïëÖ±IÖ…•—Â1Öâï∞°µïëÖ∞π…Ö…•—‰§Ä¸ÅÄÉ
‹ÄëÌùï—A…Ωô•±ï5ïëÖ±IÖ…•—Â1Öâï∞°µïëÖ∞π…Ö…•—‰•ıÄÄËÄàâÙà(ÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨ÙâïŸïπ–πÕ—Ω¡A…Ω¡ÖùÖ—•Ω∏†§ÏÅΩ¡ïπ5ïëÖ±ï—Ö•∞†úëÌïÕçÖ¡ï!—µ∞°µïëÖ∞πâÖëùï}πÖµîÅÒÄàà•Ùú∞ÄúëÌïÕçÖ¡ï!—µ∞°µïëÖ∞πâÖëùï}•çΩ∏ÅÒÄã¬~>à•Ùú∞ÄúëÌïÕçÖ¡ï!—µ∞°µïëÖ∞π…Ö…•—‰ÅÒÄàà•Ùú∞ÄúëÌïÕçÖ¡ï!—µ∞°µïëÖ∞πëïÕç…•¡—•Ω∏ÅÒÄàà•Ùú∞ÄúëÌïÕçÖ¡ï!—µ∞°µïëÖ∞πïÖ…πïë}Ö–ÅÒÄàà•Ùú∞ÄúëÌïÕçÖ¡ï!—µ∞°µïëÖ∞πÕï…•Ö±}π’µâï»ÅÒÄàà•Ùú∞ÄúëÌïÕçÖ¡ï!—µ∞°µïëÖ∞πÕ—Ωç≠}—Ω—Ö∞ÅÒÄàà•Ùú§à¯(ÄÄÄÄÄÄÄÄÄÄëÌµïëÖ∞πâÖëùï}•çΩ∏ÅÒÄã¬~>âÙ(ÄÄÄÄÄÄÄÄΩâ’——Ω∏˘Ä§Ï(ÄÄÄÅÙÅï±ÕîÅ•òÄ°Ω›πA…Ωô•±î§ÅÏ(ÄÄÄÄÄÅÕ±Ω—Ãπ¡’Õ†°ÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙâ±Ãµï≈’•¡¡ïêµµïëÖ∞µÕ±Ω–àÅ—•—±îÙâÕ¡Öç•ºÅ±•â…îàÅΩπç±•ç¨ÙâΩ¡ïπ≈’•¡5ïëÖ±ÕAÖπï∞†§à˚æÚ,Ωâ’——Ω∏˘Ä§Ï(ÄÄÄÅÙ(ÄÅÙ((ÄÅ…ï—’…∏ÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ãµï≈’•¡¡ïêµµïëÖ±Ãà¯(ÄÄÄÄÄÄëÌÕ±Ω—Ãπ©Ω•∏†àà•Ù(ÄÄÄÄÄÄëÌΩ›πA…Ωô•±îÄ¸ÅÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅΩπç±•ç¨ÙâΩ¡ïπ≈’•¡5ïëÖ±ÕAÖπï∞†§àÅÕ—Â±îÙââÖç≠ù…Ω’πêÈπΩπîÌâΩ…ëï»Ë¿ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÌôΩπ–µôÖµ•±‰È•π°ï…•–ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ìç’…ÕΩ»È¡Ω•π—ï»Ì¡Öëë•πúË’¡‡Ä…¡‡Ïà˘ë•—Ö»Ωâ’——Ω∏˘ÄÄËÄàâÙ(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ô’πç—•Ω∏ÅΩ¡ïπ5ïëÖ±ï—Ö•∞°πÖµî∞Å•çΩ∏∞Å…Ö…•—‰ÄÙÄàà∞ÅëïÕç…•¡—•Ω∏ÄÙÄàà∞ÅïÖ…πïë–ÄÙÄàà∞ÅÕï…•Ö±9’µâï»ÄÙÄàà∞ÅÕ—Ωç≠QΩ—Ö∞ÄÙÄàà§ÅÏ(ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ•òÄ†Ö›…Ö¿§Å…ï—’…∏Ï((ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µΩŸï…±Ö‰Å±ÃµµΩëÖ∞µ±Ωç≠ïêàÅÕ—Â±îÙâËµ•πëï‡Ë»–¿ÏàÅëÖ—ÑµµΩëÖ∞µ±Ωç≠ïêÙàƒà¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡àÅÕ—Â±îÙâµÖ‡µ›•ë—†ËÃ‘¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µâΩë‰àÅÕ—Â±îÙâ¡Öëë•πúË»Ÿ¡‡Ì—ï·–µÖ±•ù∏Èçïπ—ï»Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµµïëÖ∞µëï—Ö•∞µ•çΩ∏à¯ëÌ•çΩ∏ÅÒÄã¬~>âÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒ†»ÅÕ—Â±îÙâµÖ…ù•∏Ë¿Ä¿ÄŸ¡‡Ïà¯ëÌïÕçÖ¡ï!—µ∞°πÖµîÅÒÄâ5ïëÖ±±Ñà•ÙΩ†»¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÌôΩπ–µôÖµ•±‰Ëù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÏà¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌùï—A…Ωô•±ï5ïëÖ±IÖ…•—Â1Öâï∞°…Ö…•—‰§Ä¸ÅÅ511ÄëÌùï—A…Ωô•±ï5ïëÖ±IÖ…•—Â1Öâï∞°…Ö…•—‰§π—ΩU¡¡ï…ÖÕî†•ıÄÄËÄâ511ÅÅAI%0âÙ(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ì±•πîµ°ï•ù°–Ëƒ∏‘ÌµÖ…ù•∏ËƒÕ¡‡Ä¿Ä¿Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌïÕçÖ¡ï!—µ∞°ëïÕç…•¡—•Ω∏ÅÒÄâÕ—ÑÅµïëÖ±±ÑÅôΩ…µÑÅ¡Ö…—îÅëîÅ±ÑÅ•ëïπ—•ëÖêÅ√Èâ±•çÑÅëîÅïÕ—îÅ¡ï…ô•∞∏à•Ù(ÄÄÄÄÄÄÄÄÄÄΩ¿¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµµïëÖ∞µëï—Ö•∞µµï—Ñà¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌùï—A…Ωô•±ï5ïëÖ±IÖ…•—Â1Öâï∞°…Ö…•—‰§Ä¸ÅÄÒÕ¡Ö∏Åç±ÖÕÃÙâ±ÃµµïëÖ∞µëï—Ö•∞µç°•¿à¯ëÌùï—A…Ωô•±ï5ïëÖ±IÖ…•—Â1Öâï∞°…Ö…•—‰•ÙΩÕ¡Ö∏˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄëÌïÖ…πïë–Ä¸ÅÄÒÕ¡Ö∏Åç±ÖÕÃÙâ±ÃµµïëÖ∞µëï—Ö•∞µç°•¿à˘=â—ïπ•ëÑÄëÌπï‹ÅÖ—î°ïÖ…πïë–§π—Ω1ΩçÖ±ïÖ—ïM—…•πú†âïÃµHà•ÙΩÕ¡Ö∏˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄëÌÕï…•Ö±9’µâï»ÄòòÅÕ—Ωç≠QΩ—Ö∞Ä¸ÅÄÒÕ¡Ö∏Åç±ÖÕÃÙâ±ÃµµïëÖ∞µëï—Ö•∞µç°•¿àÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏»‘§Ïà˘1%5%QÄåëÌÕï…•Ö±9’µâï…ÙºëÌÕ—Ωç≠QΩ—Ö±ÙΩÕ¡Ö∏˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÌµÖ…ù•∏µ—Ω¿Ëƒ·¡‡ÏàÅΩπç±•ç¨ÙâëΩç’µïπ–πùï—±ïµïπ—	Â%ê†ùù±ΩâÖ±5ΩëÖ±]…Ö¿ú§π•ππï…!Q50Ùúúà˘ï……Ö»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅΩ¡ïπ≈’•¡5ïëÖ±ÕAÖπï∞†§ÅÏ(ÄÅçΩπÕ–ÅâÖëùïÃÄÙÅ›•πëΩ‹π}}µÂA…Ωô•±ï	ÖëùïÃÅÒÅmtÏ(ÄÅçΩπÕ–Åç’……ïπ–ÄÙÅÖ›Ö•–Åùï—≈’•¡¡ïëA…Ωô•±ï5ïëÖ±Ã°ç’……ïπ—UÕï»π•ê§Ï(ÄÅçΩπÕ–ÅÕï±ïç—ïêÄÙÅç’……ïπ–πµÖ¿°¥ÄÙ¯Å¥πâÖëùï}πÖµî§πô•±—ï»°	ΩΩ±ïÖ∏§Ï((ÄÅ›•πëΩ‹π}}Õï±ïç—ïëA…Ωô•±ï5ïëÖ±ÃÄÙÅÕï±ïç—ïêπÕ±•çî†¿∞Ã§Ï((ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ•òÄ†Ö›…Ö¿§Å…ï—’…∏Ï((ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µΩŸï…±Ö‰Å±ÃµµΩëÖ∞µ±Ωç≠ïêàÅÕ—Â±îÙâËµ•πëï‡Ë»Ã¿ÏàÅëÖ—ÑµµΩëÖ∞µ±Ωç≠ïêÙàƒà¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡àÅÕ—Â±îÙâµÖ‡µ›•ë—†Ë–‘¡¡‡ÌµÖ‡µ°ï•ù°–Ë‡·Ÿ†ÌΩŸï…ô±Ω‹È°•ëëï∏Ìë•Õ¡±Ö‰Èô±ï‡Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µ°ïÖëï»à¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒ†»ÅÕ—Â±îÙâµÖ…ù•∏Ë¿Ïà˚¬~>ÅQ‘Å•ëïπ—•ëÖêΩ†»¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë—¡‡Ïà˘±ïü¥Å°ÖÕ—ÑÄÃÅµïëÖ±±ÖÃ∏Å1ÑÅ¡…•µï…ÑÅ≈’ïëÑÅçΩµºÅ—‘ÅôÖŸΩ…•—ÑÉäb∏Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏ÅΩπç±•ç¨ÙâëΩç’µïπ–πùï—±ïµïπ—	Â%ê†ùù±ΩâÖ±5ΩëÖ±]…Ö¿ú§π•ππï…!Q50ÙúúàÅÕ—Â±îÙââÖç≠ù…Ω’πêÈπΩπîÌâΩ…ëï»Ë¿ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîËƒÂ¡‡Ìç’…ÕΩ»È¡Ω•π—ï»Ïà˚ärTΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µâΩë‰àÅÕ—Â±îÙâΩŸï…ô±Ω‹µ‰ÈÖ’—ºÌµ•∏µ°ï•ù°–Ë¿Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅ•êÙâµïëÖ±Mï±ïç—•ΩπΩ’π–àÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÌµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà¯ëÌ›•πëΩ‹π}}Õï±ïç—ïëA…Ωô•±ï5ïëÖ±Ãπ±ïπù—°ÙºÃÅÕï±ïçç•ΩπÖëÖÃΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµôÖŸΩ…•—îµπΩ—îà˚äbÅ1ÑÅµïëÖ±±ÑÅ≈’îÅ≈’ïëîÅ¡…•µï…ÑÅÕïÀÑÅ—‘ÅôÖŸΩ…•—ÑÅ‰Å—ïπëÀÑÅ’∏ÅëïÕ—Ö≈’îÅïÕ¡ïç•Ö∞Åï∏Å—‘Å¡ï…ô•∞∏Ωë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄëÌâÖëùïÃπ±ïπù—†Ä¸ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµµïëÖ∞µ¡•ç≠ï»µù…•êà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌâÖëùïÃπµÖ¿°àÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅç±ÖÕÃÙâ±ÃµµïëÖ∞µ¡•ç≠ï»µ•—ï¥ÄëÌ›•πëΩ‹π}}Õï±ïç—ïëA…Ωô•±ï5ïëÖ±Ãπ•πç±’ëïÃ°àπâÖëùï}πÖµî§Ä¸ÄâÕï±ïç—ïêàÄËÄàâÙà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅëÖ—ÑµµïëÖ∞µπÖµîÙàëÌïÕçÖ¡ï!—µ∞°àπâÖëùï}πÖµî•Ùà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨Ùâ—Ωùù±ïA…Ωô•±ï5ïëÖ±Mï±ïç—•Ω∏°—°•Ã∞ÄúëÌïÕçÖ¡ï!—µ∞°àπâÖëùï}πÖµî•Ùú§à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµµïëÖ∞µ¡•ç≠ï»µ•çΩ∏à¯ëÌàπâÖëùï}•çΩ∏ÅÒÄã¬~>âÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµµïëÖ∞µ¡•ç≠ï»µπÖµîà¯ëÌïÕçÖ¡ï!—µ∞°àπâÖëùï}πÖµî•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµµïëÖ∞µΩ…ëï»µ…Ω‹àÅΩπç±•ç¨ÙâïŸïπ–πÕ—Ω¡A…Ω¡ÖùÖ—•Ω∏†§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙâ±ÃµµïëÖ∞µΩ…ëï»µâ—∏àÅ—•—±îÙâ5ΩŸï»ÅÖπ—ïÃà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨ÙâµΩŸïMï±ïç—ïëA…Ωô•±ï5ïëÖ∞†úëÌïÕçÖ¡ï!—µ∞°àπâÖëùï}πÖµî•Ùú∞Ä¥ƒ§à˚ä@Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏Åç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏàÅ•êÙâµïëÖ±=…ëï»¥ëÌïÕçÖ¡ï!—µ∞°àπâÖëùï}πÖµî•Ùà¯ΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙâ±ÃµµïëÖ∞µΩ…ëï»µâ—∏àÅ—•—±îÙâ5ΩŸï»ÅëïÕ¡◊•Ãà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨ÙâµΩŸïMï±ïç—ïëA…Ωô•±ï5ïëÖ∞†úëÌïÕçÖ¡ï!—µ∞°àπâÖëùï}πÖµî•Ùú∞Äƒ§à˚äHΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅÄ§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ˘ÄÄË(ÄÄÄÄÄÄÄÄÄÄÄÅÄÒë•ÿÅÕ—Â±îÙâ¡Öëë•πúË»—¡‡Ä·¡‡Ì—ï·–µÖ±•ù∏Èçïπ—ï»ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîËƒ…¡‡Ïà˘QΩëÖ€µÑÅπºÅ—ïª•ÃÅµïëÖ±±ÖÃÅ¡Ö…ÑÅï≈’•¡Ö»∏Ωë•ÿ˘Ä(ÄÄÄÄÄÄÄÄÄÅÙ(ÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µôΩΩ—ï»àÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË≈ô»Ä≈ô»Ä≈ô»ÌùÖ¿Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨Ùâç±ΩÕï5ÖπÖùïë5ΩëÖ∞†§à˘Öπçï±Ö»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨Ùâç±ïÖ…A…Ωô•±ï5ïëÖ±Mï±ïç—•Ω∏†§à˘E’•—Ö»Å—ΩëÖÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨ÙâÕÖŸï≈’•¡¡ïëA…Ωô•±ï5ïëÖ±Ã†§à˘’Ö…ëÖ»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ((ÄÅÕï—Q•µïΩ’–††§ÄÙ¯Å…ïô…ïÕ°A…Ωô•±ï5ïëÖ±=…ëï…U$†§∞Ä¿§Ï)Ù(()ô’πç—•Ω∏Å…ïô…ïÕ°A…Ωô•±ï5ïëÖ±=…ëï…U$†§ÅÏ(ÄÅçΩπÕ–Å±•Õ–ÄÙÅ›•πëΩ‹π}}Õï±ïç—ïëA…Ωô•±ï5ïëÖ±ÃÅÒÅmtÏ((ÄÅëΩç’µïπ–π≈’ï…ÂMï±ïç—Ω…±∞†àπ±ÃµµïëÖ∞µ¡•ç≠ï»µ•—ï¥à§πôΩ…Öç†°ï∞ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–ÅπÖµîÄÙÅï∞πëÖ—ÖÕï–πµïëÖ±9ÖµîÏ(ÄÄÄÅçΩπÕ–Å•ë‡ÄÙÅ±•Õ–π•πëï·=ò°πÖµî§Ï(ÄÄÄÅï∞πç±ÖÕÕ1•Õ–π—Ωùù±î†âÕï±ïç—ïêà∞Å•ë‡Ä¯ÙÄ¿§Ï((ÄÄÄÅçΩπÕ–ÅΩ…ëï…∞ÄÙÅï∞π≈’ï…ÂMï±ïç—Ω»†âm•ëxÙùµïëÖ±=…ëï»¥ùtà§Ï(ÄÄÄÅ•òÄ°Ω…ëï…∞§ÅÏ(ÄÄÄÄÄÅΩ…ëï…∞π—ï·—Ωπ—ïπ–ÄÙÅ•ë‡Ä¯ÙÄ¿Ä¸Ä°•ë‡ÄÙÙÙÄ¿Ä¸ÄãäbÄƒàÄËÅÄëÌ•ë‡Ä¨Ä≈ıÄ§ÄËÄààÏ(ÄÄÄÅÙ(ÄÅÙ§Ï((ÄÅçΩπÕ–ÅçΩ’π–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âµïëÖ±Mï±ïç—•ΩπΩ’π–à§Ï(ÄÅ•òÄ°çΩ’π–§ÅçΩ’π–π—ï·—Ωπ—ïπ–ÄÙÅÄëÌ±•Õ–π±ïπù—°ÙºÃÅÕï±ïçç•ΩπÖëÖÕÄÏ)Ù()ô’πç—•Ω∏ÅµΩŸïMï±ïç—ïëA…Ωô•±ï5ïëÖ∞°âÖëùï9Öµî∞Åë•…ïç—•Ω∏§ÅÏ(ÄÅçΩπÕ–Å±•Õ–ÄÙÅ›•πëΩ‹π}}Õï±ïç—ïëA…Ωô•±ï5ïëÖ±ÃÅÒÅmtÏ(ÄÅçΩπÕ–Å•ë‡ÄÙÅ±•Õ–π•πëï·=ò°âÖëùï9Öµî§Ï((ÄÅ•òÄ°•ë‡ÄÄ¿§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†âA…•µï…ºÅÕï±ïçç•ΩªÑÅïÕÑÅµïëÖ±±Ñà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–Åπï·–ÄÙÅ•ë‡Ä¨Å9’µâï»°ë•…ïç—•Ω∏§Ï(ÄÅ•òÄ°πï·–ÄÄ¿ÅÒÅπï·–Ä¯ÙÅ±•Õ–π±ïπù—†§Å…ï—’…∏Ï((ÄÅm±•Õ—m•ë·t∞Å±•Õ—mπï·—utÄÙÅm±•Õ—mπï·—t∞Å±•Õ—m•ë·utÏ(ÄÅ›•πëΩ‹π}}Õï±ïç—ïëA…Ωô•±ï5ïëÖ±ÃÄÙÅ±•Õ–Ï(ÄÅ…ïô…ïÕ°A…Ωô•±ï5ïëÖ±=…ëï…U$†§Ï)Ù()ô’πç—•Ω∏Å—Ωùù±ïA…Ωô•±ï5ïëÖ±Mï±ïç—•Ω∏°â’——Ω∏∞ÅâÖëùï9Öµî§ÅÏ(ÄÅçΩπÕ–Å±•Õ–ÄÙÅ›•πëΩ‹π}}Õï±ïç—ïëA…Ωô•±ï5ïëÖ±ÃÅÒÅmtÏ(ÄÅçΩπÕ–Å•ë‡ÄÙÅ±•Õ–π•πëï·=ò°âÖëùï9Öµî§Ï((ÄÅ•òÄ°•ë‡Ä¯ÙÄ¿§ÅÏ(ÄÄÄÅ±•Õ–πÕ¡±•çî°•ë‡∞ƒ§Ï(ÄÄÄÅâ’——Ω∏¸πç±ÖÕÕ1•Õ–π…ïµΩŸî†âÕï±ïç—ïêà§Ï(ÄÅÙÅï±ÕîÅÏ(ÄÄÄÅ•òÄ°±•Õ–π±ïπù—†Ä¯ÙÄÃ§ÅÏ(ÄÄÄÄÄÅÕ°Ω›QΩÖÕ–†âAΩì•ÃÅµΩÕ—…Ö»Å°ÖÕ—ÑÄÃÅµïëÖ±±ÖÃà§Ï(ÄÄÄÄÄÅ…ï—’…∏Ï(ÄÄÄÅÙ(ÄÄÄÅ±•Õ–π¡’Õ†°âÖëùï9Öµî§Ï(ÄÄÄÅâ’——Ω∏¸πç±ÖÕÕ1•Õ–πÖëê†âÕï±ïç—ïêà§Ï(ÄÅÙ((ÄÅ›•πëΩ‹π}}Õï±ïç—ïëA…Ωô•±ï5ïëÖ±ÃÄÙÅ±•Õ–Ï(ÄÅ…ïô…ïÕ°A…Ωô•±ï5ïëÖ±=…ëï…U$†§Ï)Ù()ô’πç—•Ω∏Åç±ïÖ…A…Ωô•±ï5ïëÖ±Mï±ïç—•Ω∏†§ÅÏ(ÄÅ›•πëΩ‹π}}Õï±ïç—ïëA…Ωô•±ï5ïëÖ±ÃÄÙÅmtÏ(ÄÅ…ïô…ïÕ°A…Ωô•±ï5ïëÖ±=…ëï…U$†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅÕÖŸï≈’•¡¡ïëA…Ωô•±ï5ïëÖ±Ã†§ÅÏ(ÄÅçΩπÕ–ÅÕï±ïç—ïêÄÙÄ°›•πëΩ‹π}}Õï±ïç—ïëA…Ωô•±ï5ïëÖ±ÃÅÒÅmt§πÕ±•çî†¿∞Ã§Ï((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÕï—}ï≈’•¡¡ïë}¡…Ωô•±ï}âÖëùïÃà∞ÅÏ(ÄÄÄÅ¡}âÖëùï}πÖµïÃËÅÕï±ïç—ïê(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅçΩπÕΩ±îπï……Ω»°ï……Ω»ÅÒÅëÖ—Ñ§Ï(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ë•ï…Ω∏Åù’Ö…ëÖ»Å±ÖÃÅµïëÖ±±ÖÃà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§π•ππï…!Q50ÄÙÄààÏ(ÄÅÕ°Ω›QΩÖÕ–†ã¬~>Å%ëïπ—•ëÖêÅÖç—’Ö±•ÈÖëÑà§Ï(ÄÅ…ïπëï…A…Ωô•±î†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Åùï—5ÂΩ±±ïç—•ΩπM’µµÖ…‰†§ÅÏ(ÄÅçΩπÕ–Ål(ÄÄÄÅÏÅëÖ—ÑËÅ’π±Ωç≠ïëµΩ©•ÃÅÙ∞(ÄÄÄÅÏÅëÖ—ÑËÅ’π±Ωç≠ïë%—ïµÃÅÙ∞(ÄÄÄÅÏÅëÖ—ÑËÅ—•—±ï%—ïµÃÅÙ(ÄÅtÄÙÅÖ›Ö•–ÅA…Ωµ•ÕîπÖ±∞°l(ÄÄÄÅÕàπô…Ω¥†â’Õï…}’π±Ωç≠ïë}ïµΩ©•Ãà§πÕï±ïç–†âïµΩ©§à§πïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§∞(ÄÄÄÅÕàπô…Ω¥†â’Õï…}’π±Ωç≠ïë}•—ïµÃà§πÕï±ïç–†â•—ïµ}•êà§πïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§∞(ÄÄÄÅÕàπô…Ω¥†âÕ—Ω…ï}•—ïµÃà§πÕï±ïç–†â•ê±çÖ—ïùΩ…‰à§πïƒ†âçÖ—ïùΩ…‰à∞Äâ—•—±îà§(ÄÅt§Ï((ÄÅçΩπÕ–Å—•—±ï%ëÃÄÙÅπï‹ÅMï–†°—•—±ï%—ïµÃÅÒÅmt§πµÖ¿°–ÄÙ¯Å–π•ê§§Ï(ÄÅçΩπÕ–Å—•—±ïΩ’π–ÄÙÄ°’π±Ωç≠ïë%—ïµÃÅÒÅmt§πô•±—ï»°§ÄÙ¯Å—•—±ï%ëÃπ°ÖÃ°§π•—ïµ}•ê§§π±ïπù—†Ï((ÄÅ…ï—’…∏ÅÏ(ÄÄÄÅïµΩ©•ÃËÄ°’π±Ωç≠ïëµΩ©•ÃÅÒÅmt§π±ïπù—†∞(ÄÄÄÅ—•—±ïÃËÅ—•—±ïΩ’π–(ÄÅÙÏ)Ù()ô’πç—•Ω∏ÅïπÕ’…ï%ëïπ—•—Â·¡ï…•ïπçî‘‰ÕM—Â±ïÃ†§ÅÏ(ÄÅ•òÄ°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±Õ%ëïπ—•—Â·¡ï…•ïπçî‘‰ÕM—Â±ïÃà§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÕ—Â±îÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âÕ—Â±îà§Ï(ÄÅÕ—Â±îπ•êÄÙÄâ±Õ%ëïπ—•—Â·¡ï…•ïπçî‘‰ÕM—Â±ïÃàÏ(ÄÅÕ—Â±îπ—ï·—Ωπ—ïπ–ÄÙÅÄ(ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµ°ï…ºÅÏ(ÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘ÿ∞»»ƒ∞»–»∞∏ƒ‡§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃË»—¡‡ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêË(ÄÄÄÄÄÄÄÅ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‡‡îÄƒ‡î±…ùâÑ†‘ÿ∞»»ƒ∞»–»∞∏ƒƒ§±—…ÖπÕ¡Ö…ïπ–ÄÃ¿î§∞(ÄÄÄÄÄÄÄÅ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Äƒ¿îÄ‡»î±…ùâÑ†–ÿ∞»–»∞ƒ»–∞∏¿‰§±—…ÖπÕ¡Ö…ïπ–ÄÃ–î§∞(ÄÄÄÄÄÄÄÅ±•πïÖ»µù…Öë•ïπ–†ƒ‘¡ëïú±…ùâÑ†ƒÃ∞Ã»∞–¿∞∏‰‡§±…ùâÑ†‹∞ƒ‹∞»»∞∏‰‹§§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä»—¡‡Ä‹¡¡‡Å…ùâÑ†¿∞¿∞¿∞∏»‡§±•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿–§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµçΩŸï»ÅÏ(ÄÄÄÄÄÅ°ï•ù°–Ëƒ–…¡‡Ï(ÄÄÄÄÄÅâΩ…ëï»µâΩ——Ω¥Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘ÿ∞»»ƒ∞»–»∞∏ƒÃ§Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêµçΩ±Ω»Ëå¡à»‹Ã¿Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêµ•µÖùîË(ÄÄÄÄÄÄÄÅ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä»»îÄÃ¿î±…ùâÑ†–ÿ∞»–»∞ƒ»–∞∏ƒ‡§±—…ÖπÕ¡Ö…ïπ–Ä»‡î§∞(ÄÄÄÄÄÄÄÅ±•πïÖ»µù…Öë•ïπ–†ƒ»¡ëïú∞å¡ê»‰Ã»∞å¿‰»¿…ÑÄ‘‘î∞åƒ¿ÃÃÕå§Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµçΩŸï»ËÈâïôΩ…îÅÏ(ÄÄÄÄÄÅçΩπ—ïπ–ËààÏ(ÄÄÄÄÄÅ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÏ(ÄÄÄÄÄÅ•πÕï–Ë¿Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêµ•µÖùîÈ±•πïÖ»µù…Öë•ïπ–°…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿ƒ‡§Ä≈¡‡±—…ÖπÕ¡Ö…ïπ–Ä≈¡‡§±±•πïÖ»µù…Öë•ïπ–†‰¡ëïú±…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿ƒ‡§Ä≈¡‡±—…ÖπÕ¡Ö…ïπ–Ä≈¡‡§Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêµÕ•ÈîË»·¡‡Ä»·¡‡Ï(ÄÄÄÄÄÅ¡Ω•π—ï»µïŸïπ—ÃÈπΩπîÏ(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµçΩŸï»µïë•–µâ—∏ÅÏ(ÄÄÄÄÄÅ—Ω¿Ëƒ…¡‡Ï(ÄÄÄÄÄÅ…•ù°–Ëƒ…¡‡Ï(ÄÄÄÄÄÅµ•∏µ°ï•ù°–ËÃ—¡‡Ï(ÄÄÄÄÄÅ¡Öëë•πúËŸ¡‡Äƒ≈¡‡Ï(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏ƒÿ§Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†–∞ƒÃ∞ƒ‹∞∏ÿ‡§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä·¡‡Ä»¡¡‡Å…ùâÑ†¿∞¿∞¿∞∏»¿§Ï(ÄÄÄÄÄÅâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†·¡‡§Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµÖŸÖ—Ö»µ…•πúÅÏ(ÄÄÄÄÄÅ›•ë—†Ë‡…¡‡Ï(ÄÄÄÄÄÅ°ï•ù°–Ë‡…¡‡Ï(ÄÄÄÄÄÅâΩ…ëï»Ë…¡‡ÅÕΩ±•êÅŸÖ»†¥µùΩ±êµë•¥§Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú∞åƒ¿…êÃÿ∞å¿‹ƒƒƒÿ§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä¿Ä’¡‡Å…ùâÑ†‹∞ƒ‹∞»»∞∏‹‡§∞¿Äƒ—¡‡ÄÃ—¡‡Å…ùâÑ†¿∞¿∞¿∞∏»‹§∞¿Ä¿Ä»·¡‡Å…ùâÑ†–ÿ∞»–»∞ƒ»–∞∏¿‡§Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµÖŸÖ—Ö»µ…•πúÅ•µúÅÏ(ÄÄÄÄÄÅ›•ë—†Ë‹¡¡‡Ï(ÄÄÄÄÄÅ°ï•ù°–Ë‹¡¡‡Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµπÖµîµâ±Ωç¨Å†ƒÅÏ(ÄÄÄÄÄÅôΩπ–µÕ•ÈîË»—¡‡Ï(ÄÄÄÄÄÅôΩπ–µ›ï•ù°–Ë‹¿¿Ï(ÄÄÄÄÄÅ±ï——ï»µÕ¡Öç•πúË¥∏¿–’ï¥Ï(ÄÄÄÄÄÅ—ï·–µ›…Ö¿ÈâÖ±ÖπçîÏ(ÄÄÄÅÙ((ÄÄÄÄπ¡…Ωô•±îµ…Ω±îµâÖëùîÅÏ(ÄÄÄÄÄÅë•Õ¡±Ö‰È•π±•πîµô±ï‡Ï(ÄÄÄÄÄÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ï(ÄÄÄÄÄÅ›•ë—†ÈµÖ‡µçΩπ—ïπ–Ï(ÄÄÄÄÄÅµÖ…ù•∏µ—Ω¿Ë’¡‡Ï(ÄÄÄÄÄÅ¡Öëë•πúË’¡‡ÄÂ¡‡Ï(ÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ï(ÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡Ï(ÄÄÄÄÄÅôΩπ–Ë‡¿¿ÄÂ¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅ±ï——ï»µÕ¡Öç•πúË∏¿Ÿï¥Ï(ÄÄÄÄÄÅ—ï·–µ—…ÖπÕôΩ…¥È’¡¡ï…çÖÕîÏ(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµ…Ω±îµâÖëùîπ’Õï»ÅÏ(ÄÄÄÄÄÅçΩ±Ω»ËçÑÂå≈å‹Ï(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†ƒ‘–∞ƒ‹‰∞ƒ‡ÿ∞∏»¿§Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†ƒ‘–∞ƒ‹‰∞ƒ‡ÿ∞∏¿ÿ§Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµ…Ω±îµâÖëùîπç…ïÖ—Ω»ÅÏ(ÄÄÄÄÄÅçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ï(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†–ÿ∞»–»∞ƒ»–∞∏»‘§Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÃ’ëïú±…ùâÑ†–ÿ∞»–»∞ƒ»–∞∏ƒ¿§±…ùâÑ†‘ÿ∞»»ƒ∞»–»∞∏¿‘‘§§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä»¡¡‡Å…ùâÑ†–ÿ∞»–»∞ƒ»–∞∏¿ÿ§Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµâ•ºÅÏ(ÄÄÄÄÄÅµÖ‡µ›•ë—†Ëÿ‡¡¡‡Ï(ÄÄÄÄÄÅ¡Öëë•πúËƒ≈¡‡ÄƒÕ¡‡Ï(ÄÄÄÄÄÅâΩ…ëï»µ±ïô–Ë…¡‡ÅÕΩ±•êÅ…ùâÑ†‘ÿ∞»»ƒ∞»–»∞∏Ã‘§Ï(ÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃË¿Äƒ≈¡‡Äƒ≈¡‡Ä¿Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†–∞ƒ–∞ƒ‡∞∏Ã¿§Ï(ÄÄÄÄÄÅçΩ±Ω»ËçàÂçëê»Ï(ÄÄÄÅÙ((ÄÄÄÄπ±Ãµ¡…Ωô•±îµÕΩç•Ö±ÃÅÏ(ÄÄÄÄÄÅë•Õ¡±Ö‰Èô±ï‡Ï(ÄÄÄÄÄÅùÖ¿Ë·¡‡Ï(ÄÄÄÄÄÅµÖ…ù•∏Ë¿Ä¿ÄƒŸ¡‡Ï(ÄÄÄÄÄÅô±ï‡µ›…Ö¿È›…Ö¿Ï(ÄÄÄÄÄÅ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÏ(ÄÄÄÄÄÅËµ•πëï‡ËÃÏ(ÄÄÄÅÙ((ÄÄÄÄπ±Ãµ¡…Ωô•±îµÕΩç•Ö∞µ±•π¨ÅÏ(ÄÄÄÄÄÅë•Õ¡±Ö‰È•π±•πîµô±ï‡Ï(ÄÄÄÄÄÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ï(ÄÄÄÄÄÅùÖ¿ËŸ¡‡Ï(ÄÄÄÄÄÅµ•∏µ°ï•ù°–ËÃ—¡‡Ï(ÄÄÄÄÄÅ¡Öëë•πúËŸ¡‡Äƒ¡¡‡Ï(ÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ï(ÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒ¡¡‡Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§Ï(ÄÄÄÄÄÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ï(ÄÄÄÄÄÅ—ï·–µëïçΩ…Ö—•Ω∏ÈπΩπîÏ(ÄÄÄÄÄÅôΩπ–µÕ•ÈîËƒ¡¡‡Ï(ÄÄÄÄÄÅôΩπ–µ›ï•ù°–Ë‹‘¿Ï(ÄÄÄÄÄÅ—…ÖπÕ•—•Ω∏È—…ÖπÕôΩ…¥Ä∏ƒŸÃÅïÖÕî±âΩ…ëï»µçΩ±Ω»Ä∏ƒŸÃÅïÖÕî±âÖç≠ù…Ω’πêÄ∏ƒŸÃÅïÖÕîÏ(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ±Ãµ¡…Ωô•±îµÕΩç•Ö∞µ±•π¨ÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†‘ÿ∞»»ƒ∞»–»∞∏ƒ‘§Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†‹∞»–∞Ã¿∞∏ÿÿ§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿»‘§Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ±Ãµ¡…Ωô•±îµÕΩç•Ö∞µ±•π¨È°ΩŸï»ÅÏ(ÄÄÄÄÄÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ïd†¥…¡‡§Ï(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†–ÿ∞»–»∞ƒ»–∞∏Ã¿§Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†ƒ‡∞–‡∞‘‡∞∏‹‡§Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµÕ—Ö—Ãµ…Ω‹ÅÏ(ÄÄÄÄÄÅë•Õ¡±Ö‰Èù…•êÏ(ÄÄÄÄÄÅù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–†Ã±µ•πµÖ‡†¿∞≈ô»§§Ï(ÄÄÄÄÄÅùÖ¿ËÂ¡‡ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§ÄπÕ—Ö–µ¡•±∞ÅÏ(ÄÄÄÄÄÅµ•∏µ›•ë—†Ë¿Ï(ÄÄÄÄÄÅ¡Öëë•πúËƒ…¡‡Äƒ¡¡‡Ï(ÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘ÿ∞»»ƒ∞»–»∞∏ƒ–§Ï(ÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒ—¡‡ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†ƒ‡∞–‡∞‘‡∞∏‘‡§±…ùâÑ†‹∞»ƒ∞»‹∞∏‘¿§§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿»‘§Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§ÄπÕ—Ö–µ¡•±∞Äππ’¥ÅÏ(ÄÄÄÄÄÅôΩπ–µÕ•ÈîË»¡¡‡Ï(ÄÄÄÄÄÅçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ï(ÄÄÄÄÄÅ—ï·–µÕ°ÖëΩ‹Ë¿Ä¿Äƒ·¡‡Å…ùâÑ†–ÿ∞»–»∞ƒ»–∞∏ƒ»§Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµÕïç—•Ω∏µ°ïÖêÄπ•çºÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†‘ÿ∞»»ƒ∞»–»∞∏ƒ‹§Ï(ÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒ≈¡‡Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†–ÿ∞»–»∞ƒ»–∞∏¿‡§±…ùâÑ†‘ÿ∞»»ƒ∞»–»∞∏¿‹§§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿»‘§Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµÕïç—•Ω∏µ°ïÖêÅ†ÃÅÏ(ÄÄÄÄÄÅôΩπ–µÕ•ÈîËƒŸ¡‡Ï(ÄÄÄÄÄÅ±ï——ï»µÕ¡Öç•πúË¥∏¿»’ï¥Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§ÄπŸ•ëïºµù…•êµ—•±îÅÏ(ÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘ÿ∞»»ƒ∞»–»∞∏ƒ¿§Ï(ÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒ¡¡‡Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ¡¡‡Ä»—¡‡Å…ùâÑ†¿∞¿∞¿∞∏ƒ‡§Ï(ÄÄÄÄÄÅ—…ÖπÕ•—•Ω∏È—…ÖπÕôΩ…¥Ä∏ƒ·ÃÅïÖÕî±âΩ…ëï»µçΩ±Ω»Ä∏ƒ·ÃÅïÖÕî±âΩ‡µÕ°ÖëΩ‹Ä∏ƒ·ÃÅïÖÕîÏ(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§ÄπŸ•ëïºµù…•êµ—•±îÈ°ΩŸï»ÅÏ(ÄÄÄÄÄÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ïd†¥…¡‡§Ï(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†–ÿ∞»–»∞ƒ»–∞∏»–§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ—¡‡ÄÃ¡¡‡Å…ùâÑ†¿∞¿∞¿∞∏»‘§Ï(ÄÄÄÅÙ((ÄÄÄÄπ’Õï…Ãµë•…ïç—Ω…‰µ—ÖâÃÅÏ(ÄÄÄÄÄÅë•Õ¡±Ö‰Èù…•êÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–†»±µ•πµÖ‡†¿∞≈ô»§§Ï(ÄÄÄÄÄÅùÖ¿Ë·¡‡ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅµÖ…ù•∏µâΩ——Ω¥Ëƒ…¡‡Ï(ÄÄÄÄÄÅ¡Öëë•πúË’¡‡Ï(ÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ï(ÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒ’¡‡Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞§Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ’Õï…Ãµë•…ïç—Ω…‰µ—ÖâÃÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†‘ÿ∞»»ƒ∞»–»∞∏ƒ–§Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†ƒÃ∞Ã»∞–¿∞∏‡»§±…ùâÑ†‹∞ƒ‹∞»»∞∏‹ÿ§§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿»‘§Ï(ÄÄÄÅÙ((ÄÄÄÄπ’Õï…Ãµë•…ïç—Ω…‰µ—ÖâÃÅâ’——Ω∏ÅÏ(ÄÄÄÄÄÅ›•ë—†Ëƒ¿¿îÏ(ÄÄÄÄÄÅµ•∏µ›•ë—†Ë¿Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ’Õï»µë•…ïç—Ω…‰µÕïÖ…ç†ÅÏ(ÄÄÄÄÄÅµ•∏µ°ï•ù°–Ë–·¡‡Ï(ÄÄÄÄÄÅµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ï(ÄÄÄÄÄÅ¡Öëë•πúµ±ïô–Ëƒ’¡‡Ï(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†‘ÿ∞»»ƒ∞»–»∞∏ƒ‹§Ï(ÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒ—¡‡Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†–∞ƒ–∞ƒ‡∞∏ÿ‡§Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ’Õï»µë•…ïç—Ω…‰µ…Ω‹ÅÏ(ÄÄÄÄÄÅµ•∏µ°ï•ù°–Ëÿ·¡‡Ï(ÄÄÄÄÄÅµÖ…ù•∏µâΩ——Ω¥ËÂ¡‡Ï(ÄÄÄÄÄÅ¡Öëë•πúËƒ…¡‡Äƒ—¡‡Ï(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†‘ÿ∞»»ƒ∞»–»∞∏ƒ»§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†ƒÃ∞Ã»∞–¿∞∏‡‡§±…ùâÑ†‡∞»»∞»‡∞∏‡–§§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅ—…ÖπÕ•—•Ω∏È—…ÖπÕôΩ…¥Ä∏ƒ›ÃÅïÖÕî±âΩ…ëï»µçΩ±Ω»Ä∏ƒ›ÃÅïÖÕî±âÖç≠ù…Ω’πêÄ∏ƒ›ÃÅïÖÕîÏ(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ’Õï»µë•…ïç—Ω…‰µ…Ω‹È°ΩŸï»ÅÏ(ÄÄÄÄÄÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ï`†Õ¡‡§Ï(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†–ÿ∞»–»∞ƒ»–∞∏»–§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†ƒ‘∞Ã‰∞–‹∞∏‰–§±…ùâÑ†‡∞»‘∞Ãƒ∞∏‰¿§§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ’Õï»µë•…ïç—Ω…‰µ…Ω‹ÄπÖŸÖ—Ö»µÕ¥ÅÏ(ÄÄÄÄÄÅ›•ë—†Ë–—¡‡Ï(ÄÄÄÄÄÅ°ï•ù°–Ë–—¡‡Ï(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†‘ÿ∞»»ƒ∞»–»∞∏»¿§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä›¡‡Äƒ·¡‡Å…ùâÑ†¿∞¿∞¿∞∏»¿§Ï(ÄÄÄÅÙ((ÄÄÄÄπ±Ãµë•…ïç—Ω…‰µ…Ω±îÅÏ(ÄÄÄÄÄÅë•Õ¡±Ö‰È•π±•πîµô±ï‡Ï(ÄÄÄÄÄÅµÖ…ù•∏µ—Ω¿Ë—¡‡Ï(ÄÄÄÄÄÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ï(ÄÄÄÄÄÅôΩπ–Ë‹‘¿ÄÂ¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÏ(ÄÄÄÄÄÅ±ï——ï»µÕ¡Öç•πúË∏¿’ï¥Ï(ÄÄÄÄÄÅ—ï·–µ—…ÖπÕôΩ…¥È’¡¡ï…çÖÕîÏ(ÄÄÄÅÙ((ÄÄÄÄπ±Ãµë•…ïç—Ω…‰µ…Ω±îπç…ïÖ—Ω»ÅÏ(ÄÄÄÄÄÅçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞π±Ãµ±ïùÖç‰Äπ¡…Ωô•±îµ°ï…º∞(ÄÄÄÅ°—µ∞π±Ãµ±ïùÖç‰Äπ’Õï»µë•…ïç—Ω…‰µ…Ω‹∞(ÄÄÄÅ°—µ∞π±Ãµ±ïùÖç‰ÄπŸ•ëïºµù…•êµ—•±îÅÏ(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹ÈπΩπîÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ë…Ω¿µô•±—ï»ÈπΩπîÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ((ÄÄÄÅµïë•Ñ°µÖ‡µ›•ë—†Ëÿ¿¡¡‡§ÅÏ(ÄÄÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµ°ï…ºÅÏ(ÄÄÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒ·¡‡ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÄÄÅ¡Öëë•πúµ±ïô–ËƒŸ¡‡Ï(ÄÄÄÄÄÄÄÅ¡Öëë•πúµ…•ù°–ËƒŸ¡‡Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµçΩŸï»ÅÏ(ÄÄÄÄÄÄÄÅ°ï•ù°–Ëƒ»…¡‡Ï(ÄÄÄÄÄÄÄÅµÖ…ù•∏µ±ïô–Ë¥ƒŸ¡‡Ï(ÄÄÄÄÄÄÄÅµÖ…ù•∏µ…•ù°–Ë¥ƒŸ¡‡Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµÖŸÖ—Ö»µ…•πúÅÏ(ÄÄÄÄÄÄÄÅ›•ë—†Ëÿ·¡‡Ï(ÄÄÄÄÄÄÄÅ°ï•ù°–Ëÿ·¡‡Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµÖŸÖ—Ö»µ…•πúÅ•µúÅÏ(ÄÄÄÄÄÄÄÅ›•ë—†Ë‘·¡‡Ï(ÄÄÄÄÄÄÄÅ°ï•ù°–Ë‘·¡‡Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµπÖµîµâ±Ωç¨Å†ƒÅÏ(ÄÄÄÄÄÄÄÅôΩπ–µÕ•ÈîË»¡¡‡Ï(ÄÄÄÄÄÄÄÅΩŸï…ô±Ω‹µ›…Ö¿ÈÖπÂ›°ï…îÏ(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§Äπ¡…Ωô•±îµÕ—Ö—Ãµ…Ω‹ÅÏ(ÄÄÄÄÄÄÄÅùÖ¿ËŸ¡‡ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§ÄπÕ—Ö–µ¡•±∞ÅÏ(ÄÄÄÄÄÄÄÅ¡Öëë•πúËƒ¡¡‡Ä’¡‡Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§ÄπÕ—Ö–µ¡•±∞Äππ’¥ÅÏ(ÄÄÄÄÄÄÄÅôΩπ–µÕ•ÈîËƒ›¡‡Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÅ°—µ∞ÈπΩ–†π±Ãµ±ïùÖç‰§ÄπÕ—Ö–µ¡•±∞Äπ±â∞ÅÏ(ÄÄÄÄÄÄÄÅôΩπ–µÕ•ÈîË·¡‡Ï(ÄÄÄÄÄÅÙ(ÄÄÄÅÙ(ÄÅÄÏ(ÄÅëΩç’µïπ–π°ïÖêπÖ¡¡ïπë°•±ê°Õ—Â±î§Ï)Ù()ô’πç—•Ω∏Å…ïπëï…1•ŸïMç…Ω±∞›1•Ÿ•πùA…Ωô•±î°ÏÅ¡…Ωô•±î∞ÅŸ•ëïΩÃÄÙÅmt∞ÅôΩ±±Ω›ï…ÕΩ’π–ÄÙÄ¿∞Å—Ω—Ö±Y•ï›ÃÄÙÄ¿∞ÅΩ›∏ÄÙÅôÖ±ÕîÅÙ§ÅÏ(ÄÅ•òÄ†Ö•Õ1•ŸïMç…Ω±∞›¡¿†§§Å…ï—’…∏ÄààÏ(ÄÅçΩπÕ–ÅŸ•Õ’Ö±M—Â±îÄÙÅlâï±ïç—…•åà∞âçΩÕµ•åà∞âµ•π•µÖ∞âtπ•πç±’ëïÃ°¡…Ωô•±î¸π¡…Ωô•±ï}Ÿ•Õ’Ö±}Õ—Â±î§Ä¸Å¡…Ωô•±îπ¡…Ωô•±ï}Ÿ•Õ’Ö±}Õ—Â±îÄËÄâï±ïç—…•åàÏ(ÄÅçΩπÕ–ÅôïÖ—’…ïêÄÙÅŸ•ëïΩÃπô•πê°Ÿ•ëïºÄÙ¯ÅŸ•ëïºπ•êÄÙÙÙÅ¡…Ωô•±î¸π¡…Ωô•±ï}ôïÖ—’…ïë}Ÿ•ëïΩ}•ê§ÅÒÅŸ•ëïΩÕl¡tÅÒÅπ’±∞Ï(ÄÅçΩπÕ–Å±Ö—ïÕ—1Öâï∞ÄÙÅôïÖ—’…ïê¸πç…ïÖ—ïë}Ö–Ä¸Å±ÕQ•µïùº°ôïÖ—’…ïêπç…ïÖ—ïë}Ö–§ÄËÄâM•∏Å¡’â±•çÖç•ΩπïÃàÏ(ÄÅçΩπÕ–ÅÕ—Ö—’Õ1Öâï∞ÄÙÅ¡…Ωô•±î¸π•Õ}±•ŸîÄ¸Äâ8Å%IQ<àÄËÄ°ôïÖ—’…ïêÄ¸Äâ9UYÅME0àÄËÄâAI%0Å8ÅMAIà§Ï(ÄÅ…ï—’…∏ÅÄ(ÄÄÄÄÒÕïç—•Ω∏Åç±ÖÕÃÙâ±Ã‹µ±•Ÿ•πúµ¡…Ωô•±îÅ±Ã‹µ¡…Ωô•±îµÕ—Â±î¥ëÌŸ•Õ’Ö±M—Â±ïÙàÅÖ…•Ñµ±Öâï∞ÙâAï…ô•∞ÅY•ŸºÅ1•ŸïMç…Ω±∞Ä‹à¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ã‹µ±•Ÿ•πúµ°ïÖêà¯(ÄÄÄÄÄÄÄÄÒë•ÿ¯ÒÕµÖ±∞˚ä^ ÅAI%0ÅY%Y<Ä‹ΩÕµÖ±∞¯Ò†»˘°Ω…ÑÅµ•ÕµºΩ†»¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ã‹µ±•Ÿ•πúµ°ïÖêµÖç—•ΩπÃà¯(ÄÄÄÄÄÄÄÄÄÄëÌΩ›∏Ä¸ÅÄÒâ’——Ω∏Åç±ÖÕÃÙâ±Ã‹µ¡…Ωô•±îµç’Õ—Ωµ•Èîµâ—∏àÅΩπç±•ç¨ÙâΩ¡ïπ1•ŸïMç…Ω±∞›A…Ωô•±ï’Õ—Ωµ•Èï»†§à˘Aï…ÕΩπÖ±•ÈÖ»Ωâ’——Ω∏˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏Åç±ÖÕÃÙàëÌ¡…Ωô•±î¸π•Õ}±•ŸîÄ¸Äâ•Ãµ±•ŸîàÄËÄàâÙà¯Ò§¯Ω§¯ëÌÕ—Ö—’Õ1Öâï±ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ã‹µ±•Ÿ•πúµù…•êà¯(ÄÄÄÄÄÄÄÄëÌôïÖ—’…ïêÄ¸ÅÄ(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙâ±Ã‹µôïÖ—’…ïêµŸ•ëïºàÅΩπç±•ç¨ÙâΩ¡ïπA…Ωô•±ïY•ëïΩïïê°›•πëΩ‹π}}¡…Ωô•±ïïïëY•ëïΩÃ∞ÄúëÌôïÖ—’…ïêπ•ëÙú∞Å›•πëΩ‹π}}¡…Ωô•±ïïïë’—°Ω»§àÅÖ…•Ñµ±Öâï∞ÙâIï¡…Ωë’ç•»ÅŸ•ëïºÅëïÕ—ÖçÖëºà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ã‹µôïÖ—’…ïêµçΩŸï»à¯ëÌùï—…•ëΩŸï…!—µ∞°ôïÖ—’…ïê•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ã‹µôïÖ—’…ïêµÕ°Öëîà¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ã‹µôïÖ—’…ïêµçΩ¡‰à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕµÖ±∞˘Y%<ÅAI=Q=9%MQΩÕµÖ±∞¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕ—…Ωπú¯ëÌïÕçÖ¡ï!—µ∞°ôïÖ—’…ïêπ—•—±îÅÒÄãi±—•µÑÅ¡’â±•çÖçßÕ∏à•ÙΩÕ—…Ωπú¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏˚äZÿÅIï¡…Ωë’ç•»É
‹ÄëÌïÕçÖ¡ï!—µ∞°±Ö—ïÕ—1Öâï∞•ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩâ’——Ω∏˘ÄÄËÅÄ(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ã‹µôïÖ—’…ïêµïµ¡—‰à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒà˘Q‘ÅÕó≈Ö∞Åïµ¡•ïÈÑÅÖèÑΩà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏¯ëÌΩ›∏Ä¸ÄâA’â±•èÑÅ—‘Å¡…•µï»ÅŸ•ëïºÅ‰ÅçΩπŸï…”¥Å—‘Å¡ï…ô•∞Åï∏Å’πÑÅï·¡ï…•ïπç•Ñ∏àÄËÄâÕ—îÅUÕ’Ö…•ºÅ—ΩëÖ€µÑÅπºÅ¡’â±•èÃÅÕ‘Å¡…•µï…ÑÅÕó≈Ö∞∏âÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌΩ›∏Ä¸ÅÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨ÙâÕ›•—ç°QÖà†ù’¡±ΩÖêú§à˘…ïÖ»ÅÕó≈Ö∞Ωâ’——Ω∏˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ˘ÅÙ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ã‹µ±•ŸîµëÖ—Ñà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿ¯ÒÕµÖ±∞˘9I5Å0ÅAI%0ΩÕµÖ±∞¯ÒÕ—…Ωπú¯ëÌ5Ö—†πµ•∏†ƒ¿¿∞Äƒ‡Ä¨ÅŸ•ëïΩÃπ±ïπù—†Ä®Ä‰Ä¨Å5Ö—†πµ•∏†»‡∞ÅôΩ±±Ω›ï…ÕΩ’π–Ä®Ä»§•ÙîΩÕ—…Ωπú¯Ò§¯ÒàÅÕ—Â±îÙâ›•ë—†ËëÌ5Ö—†πµ•∏†ƒ¿¿∞Äƒ‡Ä¨ÅŸ•ëïΩÃπ±ïπù—†Ä®Ä‰Ä¨Å5Ö—†πµ•∏†»‡∞ÅôΩ±±Ω›ï…ÕΩ’π–Ä®Ä»§•Ùîà¯Ωà¯Ω§¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ã‹µëÖ—Ñµ¡Ö•»à¯ÒÕ¡Ö∏¯Òà¯ëÌŸ•ëïΩÃπ±ïπù—°ÙΩà¯ÒÕµÖ±∞˘Mó≈Ö±ïÃΩÕµÖ±∞¯ΩÕ¡Ö∏¯ÒÕ¡Ö∏¯Òà¯ëÌôΩ±±Ω›ï…ÕΩ’π—ÙΩà¯ÒÕµÖ±∞˘Ωπï·•ΩπïÃΩÕµÖ±∞¯ΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ã‹µëÖ—Ñµ¡Ö•»à¯ÒÕ¡Ö∏¯Òà¯ëÌ—Ω—Ö±Y•ï›ÕÙΩà¯ÒÕµÖ±∞˘%µ¡Öç—ΩÃΩÕµÖ±∞¯ΩÕ¡Ö∏¯ÒÕ¡Ö∏¯Òà¯ëÌ¡…Ωô•±î¸π•Õ}ç…ïÖ—Ω»Ä¸ÄâIQ=HàÄËÄâUMHâÙΩà¯ÒÕµÖ±∞˘9•Ÿï∞ΩÕµÖ±∞¯ΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒ¿¯Ò§¯Ω§¯ëÌ¡…Ωô•±î¸π•Õ}±•ŸîÄ¸ÄâQ…ÖπÕµ•—•ïπëºÅÖ°Ω…ÑÅï∏Å1•ŸïMç…Ω±∞∏àÄËÅôïÖ—’…ïêÄ¸ÅÉi±—•µºÅµΩŸ•µ•ïπ—ºËÄëÌïÕçÖ¡ï!—µ∞°±Ö—ïÕ—1Öâï∞•ÙπÄÄËÄâÕ¡ï…ÖπëºÅ±ÑÅ¡…•µï…ÑÅ¡’â±•çÖçßÕ∏∏âÙΩ¿¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩÕïç—•Ω∏˘ÄÏ)Ù()ô’πç—•Ω∏ÅΩ¡ïπ1•ŸïMç…Ω±∞›A…Ωô•±ï’Õ—Ωµ•Èï»†§ÅÏ(ÄÅ•òÄ†Ö•Õ1•ŸïMç…Ω±∞›¡¿†§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅŸ•ëïΩÃÄÙÅ……Ö‰π•Õ……Ö‰°›•πëΩ‹π}}¡…Ωô•±ïïïëY•ëïΩÃ§Ä¸Å›•πëΩ‹π}}¡…Ωô•±ïïïëY•ëïΩÃÄËÅmtÏ(ÄÅçΩπÕ–ÅÕï±ïç—ïëY•ëïºÄÙÅç’……ïπ—A…Ωô•±î¸π¡…Ωô•±ï}ôïÖ—’…ïë}Ÿ•ëïΩ}•êÅÒÅŸ•ëïΩÕl¡t¸π•êÅÒÄààÏ(ÄÅçΩπÕ–ÅÕï±ïç—ïëM—Â±îÄÙÅlâï±ïç—…•åà∞âçΩÕµ•åà∞âµ•π•µÖ∞âtπ•πç±’ëïÃ°ç’……ïπ—A…Ωô•±î¸π¡…Ωô•±ï}Ÿ•Õ’Ö±}Õ—Â±î§Ä¸Åç’……ïπ—A…Ωô•±îπ¡…Ωô•±ï}Ÿ•Õ’Ö±}Õ—Â±îÄËÄâï±ïç—…•åàÏ(ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µΩŸï…±Ö‰Å±ÃµµΩëÖ∞µ±Ωç≠ïêÅ±Ã‹µ¡…Ωô•±îµç’Õ—Ωµ•Èï»µΩŸï…±Ö‰àÅëÖ—ÑµµΩëÖ∞µ±Ωç≠ïêÙàƒà¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡Å±Ã‹µ¡…Ωô•±îµç’Õ—Ωµ•Èï»µâΩ‡à¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µ°ïÖêà¯Òë•ÿ¯ÒÕµÖ±∞˘AI%0ÅY%Y<Ä‹ΩÕµÖ±∞¯Ò†»˘Q‘Å¡ï…ô•∞∞Å—’ÃÅ…ïù±ÖÃΩ†»¯Ωë•ÿ¯Òâ’——Ω∏ÅΩπç±•ç¨Ùâç±ΩÕï1•ŸïMç…Ω±∞›A…Ωô•±ï’Õ—Ωµ•Èï»†§à˚ärTΩâ’——Ω∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µâΩë‰à¯(ÄÄÄÄÄÄÄÄÄÄÒ±Öâï∞Åç±ÖÕÃÙâ±Ã‹µç’Õ—Ωµ•Èï»µ±Öâï∞à˘Y•ëïºÅ¡…Ω—ÖùΩπ•Õ—ÑΩ±Öâï∞¯(ÄÄÄÄÄÄÄÄÄÄÒÕï±ïç–Å•êÙâ±Ã›ïÖ—’…ïëY•ëïΩMï±ïç–à¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌŸ•ëïΩÃπ±ïπù—†Ä¸ÅŸ•ëïΩÃπµÖ¿°Ÿ•ëïºÄÙ¯ÅÄÒΩ¡—•Ω∏ÅŸÖ±’îÙàëÌŸ•ëïºπ•ëÙàÄëÌŸ•ëïºπ•êÄÙÙÙÅÕï±ïç—ïëY•ëïºÄ¸ÄâÕï±ïç—ïêàÄËÄàâÙ¯ëÌïÕçÖ¡ï!—µ∞°Ÿ•ëïºπ—•—±îÅÒÄâY•ëïºÅÕ•∏Å”µ—’±ºà•ÙΩΩ¡—•Ω∏˘Ä§π©Ω•∏†àà§ÄËÅÄÒΩ¡—•Ω∏ÅŸÖ±’îÙàà˘QΩëÖ€µÑÅπºÅ°Ö‰ÅŸ•ëïΩÃΩΩ¡—•Ω∏˘ÅÙ(ÄÄÄÄÄÄÄÄÄÄΩÕï±ïç–¯(ÄÄÄÄÄÄÄÄÄÄÒ±Öâï∞Åç±ÖÕÃÙâ±Ã‹µç’Õ—Ωµ•Èï»µ±Öâï∞à˘Õ—•±ºÅŸ•Õ’Ö∞Ω±Öâï∞¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ã‹µÕ—Â±îµ¡•ç≠ï»àÅ•êÙâ±Ã›M—Â±ïA•ç≠ï»à¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌl(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅlâï±ïç—…•åà∞ãäjÑà∞â≥•ç—…•çºà∞â•Ö∏∞ÅÖÈ’∞Å‰Åïπï…üµÑÅŸ•ŸÑât∞(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅlâçΩÕµ•åà∞ãä^$à∞âÕÕµ•çºà∞âY•Ω±ï—ÑÅ¡…Ωô’πëºÅ‰ÅïÕ—…ï±±ÖÃât∞(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅlâµ•π•µÖ∞à∞ãä^à∞â5•π•µÖ∞à∞â=Õç’…º∞Å±•µ¡•ºÅ‰Åï±ïùÖπ—îât(ÄÄÄÄÄÄÄÄÄÄÄÅtπµÖ¿†°mŸÖ±’î±•çΩ∏±πÖµî±çΩ¡Ât§ÄÙ¯ÅÄÒâ’——Ω∏Åç±ÖÕÃÙàëÌŸÖ±’îÄÙÙÙÅÕï±ïç—ïëM—Â±îÄ¸ÄâÖç—•ŸîàÄËÄàâÙàÅëÖ—ÑµÕ—Â±îÙàëÌŸÖ±’ïÙàÅΩπç±•ç¨ÙâÕï±ïç—1•ŸïMç…Ω±∞›A…Ωô•±ïM—Â±î†úëÌŸÖ±’ïÙú§à¯Òà¯ëÌ•çΩπÙΩà¯ÒÕ¡Ö∏¯ÒÕ—…Ωπú¯ëÌπÖµïÙΩÕ—…Ωπú¯ÒÕµÖ±∞¯ëÌçΩ¡ÂÙΩÕµÖ±∞¯ΩÕ¡Ö∏¯Ωâ’——Ω∏˘Ä§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ã‹µÕ—Â±îµ¡…ïŸ•ï‹Å±Ã‹µ¡…Ωô•±îµÕ—Â±î¥ëÌÕï±ïç—ïëM—Â±ïÙàÅ•êÙâ±Ã›M—Â±ïA…ïŸ•ï‹à¯Ò§¯Ω§¯Òë•ÿ¯ÒÕµÖ±∞˘Y%MQÅAIY%ΩÕµÖ±∞¯ÒÕ—…Ωπú˘ ëÌïÕçÖ¡ï!—µ∞°ç’……ïπ—A…Ωô•±î¸π’Õï…πÖµîÅÒÄâ’Õ’Ö…•ºà•ÙΩÕ—…Ωπú¯ÒÕ¡Ö∏˘œ¥ÅÕîÅÕïπ—•ÀÑÅ—‘ÅAï…ô•∞ÅY•Ÿº∏ΩÕ¡Ö∏¯Ωë•ÿ¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µÖç—•ΩπÃà¯Òâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨Ùâç±ΩÕï1•ŸïMç…Ω±∞›A…Ωô•±ï’Õ—Ωµ•Èï»†§à˘Öπçï±Ö»Ωâ’——Ω∏¯Òâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅ•êÙâ±Ã›MÖŸïA…Ωô•±ïM—Â±îàÅΩπç±•ç¨ÙâÕÖŸï1•ŸïMç…Ω±∞›A…Ωô•±ï’Õ—Ωµ•ÈÖ—•Ω∏†§à˘’Ö…ëÖ»ÅçÖµâ•ΩÃΩâ’——Ω∏¯Ωë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ô’πç—•Ω∏ÅÕï±ïç—1•ŸïMç…Ω±∞›A…Ωô•±ïM—Â±î°Õ—Â±î§ÅÏ(ÄÅ•òÄ†Ölâï±ïç—…•åà∞âçΩÕµ•åà∞âµ•π•µÖ∞âtπ•πç±’ëïÃ°Õ—Â±î§§Å…ï—’…∏Ï(ÄÅëΩç’µïπ–π≈’ï…ÂMï±ïç—Ω…±∞†àç±Ã›M—Â±ïA•ç≠ï»Åâ’——Ω∏à§πôΩ…Öç†°â’——Ω∏ÄÙ¯Åâ’——Ω∏πç±ÖÕÕ1•Õ–π—Ωùù±î†âÖç—•Ÿîà∞Åâ’——Ω∏πëÖ—ÖÕï–πÕ—Â±îÄÙÙÙÅÕ—Â±î§§Ï(ÄÅçΩπÕ–Å¡…ïŸ•ï‹ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±Ã›M—Â±ïA…ïŸ•ï‹à§Ï(ÄÅ•òÄ°¡…ïŸ•ï‹§Å¡…ïŸ•ï‹πç±ÖÕÕ9ÖµîÄÙÅÅ±Ã‹µÕ—Â±îµ¡…ïŸ•ï‹Å±Ã‹µ¡…Ωô•±îµÕ—Â±î¥ëÌÕ—Â±ïıÄÏ)Ù()ô’πç—•Ω∏Åç±ΩÕï1•ŸïMç…Ω±∞›A…Ωô•±ï’Õ—Ωµ•Èï»†§ÅÏ(ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ›…Ö¿π•ππï…!Q50ÄÙÄààÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅÕÖŸï1•ŸïMç…Ω±∞›A…Ωô•±ï’Õ—Ωµ•ÈÖ—•Ω∏†§ÅÏ(ÄÅçΩπÕ–Åâ’——Ω∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±Ã›MÖŸïA…Ωô•±ïM—Â±îà§Ï(ÄÅçΩπÕ–ÅôïÖ—’…ïëY•ëïΩ%êÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±Ã›ïÖ—’…ïëY•ëïΩMï±ïç–à§¸πŸÖ±’îÅÒÅπ’±∞Ï(ÄÅçΩπÕ–ÅŸ•Õ’Ö±M—Â±îÄÙÅëΩç’µïπ–π≈’ï…ÂMï±ïç—Ω»†àç±Ã›M—Â±ïA•ç≠ï»Åâ’——Ω∏πÖç—•Ÿîà§¸πëÖ—ÖÕï–πÕ—Â±îÅÒÄâï±ïç—…•åàÏ(ÄÅ•òÄ°â’——Ω∏§ÅÏÅâ’——Ω∏πë•ÕÖâ±ïêÄÙÅ—…’îÌâ’——Ω∏π—ï·—Ωπ—ïπ–ÄÙÄâ’Ö…ëÖπëøäòàÏÅÙ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÕï—}µÂ}±Ã›}¡…Ωô•±ï}ç’Õ—Ωµ•ÈÖ—•Ω∏à∞ÅÏ(ÄÄÄÅ¡}ôïÖ—’…ïë}Ÿ•ëïΩ}•êÈôïÖ—’…ïëY•ëïΩ%ê∞(ÄÄÄÅ¡}Ÿ•Õ’Ö±}Õ—Â±îÈŸ•Õ’Ö±M—Â±î(ÄÅÙ§Ï(ÄÅ•òÄ°ï……Ω»§ÅÏ(ÄÄÄÅ•òÄ°â’——Ω∏§ÅÏÅâ’——Ω∏πë•ÕÖâ±ïêÄÙÅôÖ±ÕîÌâ’——Ω∏π—ï·—Ωπ—ïπ–ÄÙÄâ’Ö…ëÖ»ÅçÖµâ•ΩÃàÏÅÙ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅù’Ö…ëÖ»∏Å©ïç’”ÑÅ¡…•µï…ºÅï∞ÅME0Ä‹∏¿∏Õÿ∏à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅ•òÄ°ëÖ—Ñ¸πΩ¨ÄÙÙÙÅôÖ±Õî§ÅÏ(ÄÄÄÅ•òÄ°â’——Ω∏§ÅÏÅâ’——Ω∏πë•ÕÖâ±ïêÄÙÅôÖ±ÕîÌâ’——Ω∏π—ï·—Ωπ—ïπ–ÄÙÄâ’Ö…ëÖ»ÅçÖµâ•ΩÃàÏÅÙ(ÄÄÄÅÕ°Ω›QΩÖÕ–°ëÖ—Ñπï……Ω»ÄÙÙÙÄâŸ•ëïΩ}•πŸÖ±•ëºàÄ¸ÄâÕîÅŸ•ëïºÅπºÅ¡ï…—ïπïçîÅÑÅ—‘Å¡ï…ô•∞∏àÄËÄâ9ºÅÕîÅ¡’ëºÅù’Ö…ëÖ»Åï∞Å¡ï…ô•∞∏à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅç’……ïπ—A…Ωô•±îπ¡…Ωô•±ï}ôïÖ—’…ïë}Ÿ•ëïΩ}•êÄÙÅëÖ—Ñ¸π¡…Ωô•±ï}ôïÖ—’…ïë}Ÿ•ëïΩ}•êÅÒÅôïÖ—’…ïëY•ëïΩ%êÏ(ÄÅç’……ïπ—A…Ωô•±îπ¡…Ωô•±ï}Ÿ•Õ’Ö±}Õ—Â±îÄÙÅlâï±ïç—…•åà∞âçΩÕµ•åà∞âµ•π•µÖ∞âtπ•πç±’ëïÃ°ëÖ—Ñ¸π¡…Ωô•±ï}Ÿ•Õ’Ö±}Õ—Â±î§(ÄÄÄÄ¸ÅëÖ—Ñπ¡…Ωô•±ï}Ÿ•Õ’Ö±}Õ—Â±î(ÄÄÄÄËÅŸ•Õ’Ö±M—Â±îÏ(ÄÅç±ΩÕï1•ŸïMç…Ω±∞›A…Ωô•±ï’Õ—Ωµ•Èï»†§Ï(ÄÅÕ°Ω›QΩÖÕ–†âAï…ô•∞ÅY•ŸºÅÖç—’Ö±•ÈÖëºà§Ï(ÄÅ…ïπëï…A…Ωô•±î†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å…ïπëï…A…Ωô•±î†§ÅÏ(ÄÅïπÕ’…ï%ëïπ—•—Â·¡ï…•ïπçî‘‰ÕM—Â±ïÃ†§Ï(ÄÅçΩπÕ–ÅµÖ•∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÖ¡¡Y•ï‹à§Ï(ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄÒ¿˘Ö…ùÖπëºÅ—‘Å¡ï…ô•∞∏∏∏Ω¿˘ÄÏ((ÄÅçΩπÕ–ÅŸ•ëïΩÕA…Ωµ•ÕîÄÙÅ±ÕÖç°ï…ïÕ†°±ÕAï…ôÖç°îπ¡…Ωô•±ïY•ëïΩÃ∞ÄÃ¿¿¿¿§(ÄÄÄÄ¸ÅA…Ωµ•Õîπ…ïÕΩ±Ÿî°ÏÅëÖ—ÑÈ±ÕAï…ôÖç°îπ¡…Ωô•±ïY•ëïΩÃπëÖ—Ñ∞Åï……Ω»Èπ’±∞ÅÙ§(ÄÄÄÄËÅÕàπô…Ω¥†âŸ•ëïΩÃà§πÕï±ïç–†à®à§πïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§πΩ…ëï»†âç…ïÖ—ïë}Ö–à∞ÅÏÅÖÕçïπë•πúÈôÖ±ÕîÅÙ§Ï((ÄÅçΩπÕ–ÅŸ•ï›Õ1ïëùï…A…Ωµ•ÕîÄÙÅ±ÕÖç°ï…ïÕ†°±ÕAï…ôÖç°îπ¡…Ωô•±ïY•ï›Õ1ïëùï»∞ÄÃ¿¿¿¿§(ÄÄÄÄ¸ÅA…Ωµ•Õîπ…ïÕΩ±Ÿî°ÏÅëÖ—ÑÈ±ÕAï…ôÖç°îπ¡…Ωô•±ïY•ï›Õ1ïëùï»πëÖ—Ñ∞Åï……Ω»Èπ’±∞ÅÙ§(ÄÄÄÄËÅÕàπô…Ω¥†â¡Ω•π—Õ}±ïëùï»à§πÕï±ïç–†âÖµΩ’π–à§πïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§πïƒ†â…ïÖÕΩ∏à∞Äâ›Ö—ç°ïë}âÂ}Ω—°ï»à§Ï((ÄÅçΩπÕ–ÅmŸ•ëïΩÕIïÕ’±–∞ÅŸ•ï›Õ1ïëùï…IïÕ’±—tÄÙÅÖ›Ö•–ÅA…Ωµ•ÕîπÖ±∞°mŸ•ëïΩÕA…Ωµ•Õî∞ÅŸ•ï›Õ1ïëùï…A…Ωµ•Õït§Ï(ÄÅçΩπÕ–ÅŸ•ëïΩÃÄÙÅŸ•ëïΩÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅçΩπÕ–Åï……Ω»ÄÙÅŸ•ëïΩÕIïÕ’±–¸πï……Ω»Ï((ÄÅ•òÄ†Öï……Ω»ÄòòÄÖ±ÕÖç°ï…ïÕ†°±ÕAï…ôÖç°îπ¡…Ωô•±ïY•ëïΩÃ∞ÄÃ¿¿¿¿§§ÅÏ(ÄÄÄÅ±ÕAï…ôÖç°îπ¡…Ωô•±ïY•ëïΩÃÄÙÅÏÅëÖ—ÑÈŸ•ëïΩÃ∞ÅÖ–ÈÖ—îππΩ‹†§ÅÙÏ(ÄÅÙ((ÄÅ•òÄ°ï……Ω»§ÅÏÅµÖ•∏π•ππï…!Q50ÄÙÅÄÒ¿Åç±ÖÕÃÙâï……Ω»µµÕúà˘……Ω»ÅçÖ…ùÖπëºÅ—’ÃÅŸ•ëïΩÃËÄëÌïÕçÖ¡ï!—µ∞°ï……Ω»πµïÕÕÖùîÅÒÄâ……Ω»ÅëïÕçΩπΩç•ëºà•ÙΩ¿˘ÄÏÅ…ï—’…∏ÏÅÙ((ÄÅçΩπÕ–Å›Ö—ç°ïë	Â=—°ï»ÄÙÅŸ•ï›Õ1ïëùï…IïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅ•òÄ†ÖŸ•ï›Õ1ïëùï…IïÕ’±–¸πï……Ω»ÄòòÄÖ±ÕÖç°ï…ïÕ†°±ÕAï…ôÖç°îπ¡…Ωô•±ïY•ï›Õ1ïëùï»∞ÄÃ¿¿¿¿§§ÅÏ(ÄÄÄÅ±ÕAï…ôÖç°îπ¡…Ωô•±ïY•ï›Õ1ïëùï»ÄÙÅÏÅëÖ—ÑÈ›Ö—ç°ïë	Â=—°ï»∞ÅÖ–ÈÖ—îππΩ‹†§ÅÙÏ(ÄÅÙ((ÄÅçΩπÕ–Å—Ω—Ö±…ΩµY•ï›ÃÄÙÄ°›Ö—ç°ïë	Â=—°ï»ÅÒÅmt§π…ïë’çî†°Õ’¥∞Å»§ÄÙ¯ÅÕ’¥Ä¨Å»πÖµΩ’π–∞Ä¿§Ï((ÄÅçΩπÕ–ÅŸ•ëïΩ%ëÃÄÙÅŸ•ëïΩÃπµÖ¿°ÿÄÙ¯Åÿπ•ê§Ï(ÄÅçΩπÕ–Ål(ÄÄÄÅ¡•πÕIïÕ’±–∞(ÄÄÄÅ¡±ÖπÃ∞(ÄÄÄÅôΩ±±Ω›ï…ÕIïÕ’±–∞(ÄÄÄÅâÖëùïÕIïÕ’±–∞(ÄÄÄÅï≈’•¡¡ïë	ÖëùïÃ∞(ÄÄÄÅï≈’•¡¡ïëQ•—±î∞(ÄÄÄÅçΩ±±ïç—•ΩπM’µµÖ…‰∞(ÄÄÄÅÕïÕÕ•ΩπÕIïÕ’±–∞(ÄÄÄÅ±•≠ïÕIïÕ’±–∞(ÄÄÄÅ…ïôï……Ö±IïÕ’±–(ÄÅtÄÙÅÖ›Ö•–ÅA…Ωµ•ÕîπÖ±∞°l(ÄÄÄÅÕàπ…¡å†âùï—}µÂ}¡•ππïë}Ÿ•ëïΩÃà∞ÅÏÅ¡}’Õï…}•êÈç’……ïπ—UÕï»π•êÅÙ§∞(ÄÄÄÅ±ΩÖëA±ÖπÃ†§∞(ÄÄÄÅÕàπô…Ω¥†âôΩ±±Ω›Ãà§πÕï±ïç–†âôΩ±±Ω›ï…}•êà∞ÅÏÅçΩ’π–Ëâï·Öç–à∞Å°ïÖêÈ—…’îÅÙ§πïƒ†âôΩ±±Ω›ïë}•êà∞Åç’……ïπ—UÕï»π•ê§∞(ÄÄÄÅÕàπô…Ω¥†â’Õï…}âÖëùïÃà§πÕï±ïç–†à®à§πïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§πΩ…ëï»†âïÖ…πïë}Ö–à∞ÅÏÅÖÕçïπë•πúÈôÖ±ÕîÅÙ§∞(ÄÄÄÅùï—≈’•¡¡ïëA…Ωô•±ï5ïëÖ±Ã°ç’……ïπ—UÕï»π•ê§∞(ÄÄÄÅùï—5ÂA…Ωô•±ïQ•—±î†§∞(ÄÄÄÅùï—5ÂΩ±±ïç—•ΩπM’µµÖ…‰†§∞(ÄÄÄÅŸ•ëïΩ%ëÃπ±ïπù—†Ä¸ÅÕàπô…Ω¥†â›Ö—ç°}ÕïÕÕ•ΩπÃà§πÕï±ïç–†âŸ•ëïΩ}•ê∞ÅŸ•ï›ï…}•êà§π•∏†âŸ•ëïΩ}•êà∞ÅŸ•ëïΩ%ëÃ§ÄËÅA…Ωµ•Õîπ…ïÕΩ±Ÿî°ÏÅëÖ—ÑÈmtÅÙ§∞(ÄÄÄÅŸ•ëïΩ%ëÃπ±ïπù—†Ä¸ÅÕàπô…Ω¥†âŸ•ëïΩ}±•≠ïÃà§πÕï±ïç–†âŸ•ëïΩ}•êà§π•∏†âŸ•ëïΩ}•êà∞ÅŸ•ëïΩ%ëÃ§ÄËÅA…Ωµ•Õîπ…ïÕΩ±Ÿî°ÏÅëÖ—ÑÈmtÅÙ§∞(ÄÄÄÅÕàπô…Ω¥†âÖ¡¡}çΩπô•úà§πÕï±ïç–†â≠ï‰∞ÅŸÖ±’îà§π•∏†â≠ï‰à∞Ålâ…ïôï……Ö±}…ïôï……ï…}¡—Ãà∞Äâ…ïôï……Ö±}…ïôï……ïë}¡—Ãât§(ÄÅt§Ï((ÄÅçΩπÕ–ÅµÂA•πÃÄÙÅ¡•πÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅçΩπÕ–Å¡•ππïë%ëÃÄÙÅπï‹ÅMï–†°µÂA•πÃÅÒÅmt§πµÖ¿°¿ÄÙ¯Å¿πŸ•ëïΩ}•ê§§Ï(ÄÅçΩπÕ–ÅµÂA±Ö∏ÄÙÅ¡±ÖπÃπô•πê°¿ÄÙ¯Å¿π•êÄÙÙÙÅç’……ïπ—A…Ωô•±îπ¡±Öπ}•ê§Ï(ÄÅçΩπÕ–ÅçÖπA•∏ÄÙÅµÂA±Ö∏ÄòòÅµÂA±Ö∏πµÖ·}¡•ππïë}Ÿ•ëïΩÃÄ¯Ä¿Ï(ÄÅçΩπÕ–Å¡•πÕUÕïêÄÙÅ¡•ππïë%ëÃπÕ•ÈîÏ(ÄÅçΩπÕ–ÅôΩ±±Ω›ï…ÕΩ’π–ÄÙÅôΩ±±Ω›ï…ÕIïÕ’±–¸πçΩ’π–ÅÒÄ¿Ï(ÄÅçΩπÕ–ÅâÖëùïÃÄÙÅâÖëùïÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅçΩπÕ–ÅÕïÕÕ•ΩπÃÄÙÅÕïÕÕ•ΩπÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅçΩπÕ–Å±•≠ïÃÄÙÅ±•≠ïÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅçΩπÕ–Å…ïôï……Ö±Ωπô•úÄÙÅ…ïôï……Ö±IïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅ›•πëΩ‹π}}µÂA…Ωô•±ïQ•—±îÄÙÅï≈’•¡¡ïëQ•—±îÏ((ÄÅ±ï–ÅÕΩç•Ö±±•ç≠Õ!—µ∞ÄÙÄààÏ(ÄÅ•òÄ°µÂA±Ö∏ÄòòÅµÂA±Ö∏π•êÄÑÙÙÄâÕ—ÖπëÖ…êà§ÅÏ(ÄÄÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅç±•ç≠ÃÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âùï—}µÂ}ÕΩç•Ö±}ç±•ç≠Ãà∞ÅÏÅ¡}’Õï…}•êËÅç’……ïπ—UÕï»π•êÅÙ§Ï(ÄÄÄÅ•òÄ°ç±•ç≠ÃÄòòÅç±•ç≠Ãπ±ïπù—†§ÅÏ(ÄÄÄÄÄÅÕΩç•Ö±±•ç≠Õ!—µ∞ÄÙÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕïç—•Ω∏à¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕïç—•Ω∏µ°ïÖêà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ•çºà˚¬~N(Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒ†Ã˘±•çÃÅÑÅ—’ÃÅ…ïëïÃΩ†Ã¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÕ’àà˘	ïπïô•ç•ºÄëÌïÕçÖ¡ï!—µ∞°µÂA±Ö∏ππÖµî•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿ËƒŸ¡‡ÏÅô±ï‡µ›…Ö¿È›…Ö¿Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌç±•ç≠ÃπµÖ¿°åÄÙ¯ÅÄÒë•ÿÅÕ—Â±îÙâ—ï·–µÖ±•ù∏Èçïπ—ï»Ïà¯Òë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»¡¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ïà¯ëÌåπ—Ω—Ö±ÙΩë•ÿ¯Òë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà¯ëÌïÕçÖ¡ï!—µ∞°åπ¡±Ö—ôΩ…¥•ÙΩë•ÿ¯Ωë•ÿ˘Ä§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ˘ÄÏ(ÄÄÄÅÙ(ÄÅÙ((ÄÅçΩπÕ–ÅŸ•ï›Õ	ÂY•ëïºÄÙÅÌÙÏ(ÄÄ°ÕïÕÕ•ΩπÃÅÒÅmt§πôΩ…Öç†°ÃÄÙ¯ÅÏ(ÄÄÄÅŸ•ï›Õ	ÂY•ëïΩmÃπŸ•ëïΩ}•ëtÄÙÅŸ•ï›Õ	ÂY•ëïΩmÃπŸ•ëïΩ}•ëtÅÒÅπï‹ÅMï–†§Ï(ÄÄÄÅŸ•ï›Õ	ÂY•ëïΩmÃπŸ•ëïΩ}•ëtπÖëê°ÃπŸ•ï›ï…}•ê§Ï(ÄÅÙ§Ï(ÄÅçΩπÕ–Å±•≠ïÕ	ÂY•ëïºÄÙÅÌÙÏ(ÄÄ°±•≠ïÃÅÒÅmt§πôΩ…Öç†°∞ÄÙ¯ÅÏÅ±•≠ïÕ	ÂY•ëïΩm∞πŸ•ëïΩ}•ëtÄÙÄ°±•≠ïÕ	ÂY•ëïΩm∞πŸ•ëïΩ}•ëtÅÒÄ¿§Ä¨ÄƒÏÅÙ§Ï((ÄÅçΩπÕ–Å…ïôï……ï…A—ÃÄÙÅ…ïôï……Ö±Ωπô•ú¸πô•πê°åÄÙ¯Ååπ≠ï‰ÄÙÙÙÄâ…ïôï……Ö±}…ïôï……ï…}¡—Ãà§¸πŸÖ±’îÅÒÄƒ‘¿Ï(ÄÅçΩπÕ–Å…ïôï……ïëA—ÃÄÙÅ…ïôï……Ö±Ωπô•ú¸πô•πê°åÄÙ¯Ååπ≠ï‰ÄÙÙÙÄâ…ïôï……Ö±}…ïôï……ïë}¡—Ãà§¸πŸÖ±’îÅÒÄƒ¿¿Ï((ÄÅçΩπÕ–ÅÕ—…ïÖ≠Mïç—•Ωπ!—µ∞ÄÙÄààÏ(((ÄÅçΩπÕ–ÅçΩ±±ïç—•ΩπM’µµÖ…Â!—µ∞ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕïç—•Ω∏à¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕïç—•Ω∏µ°ïÖêà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ•çºà˚¬~J8Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒ†Ã˘5§ÅçΩ±ïççßÕ∏Ω†Ã¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÕ’àà¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏(ÄÄÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨ÙâΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†ùÖ±∞ú§à(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙââÖç≠ù…Ω’πêÈπΩπîÌâΩ…ëï»ÈπΩπîÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ìç’…ÕΩ»È¡Ω•π—ï»ÌôΩπ–µôÖµ•±‰È•π°ï…•–ÌôΩπ–µÕ•ÈîËƒ…¡‡Ïà(ÄÄÄÄÄÄÄÄÄÄ˘·¡±Ω…Ö»ÉäHΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÒë•ÿ(ÄÄÄÄÄÄÄÅç±ÖÕÃÙâôΩ…¥µçÖ…êÅ±Ãµ¡…Ωô•±îµçΩ±±ïç—•Ω∏µ°’àà(ÄÄÄÄÄÄÄÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ï(ÄÄÄÄÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒŸ¡‡Ï(ÄÄÄÄÄÄÄÄÄÅΩŸï…ô±Ω‹È°•ëëï∏Ï(ÄÄÄÄÄÄÄÄÄÅ¡Öëë•πúË¿Ï(ÄÄÄÄÄÄÄÄà(ÄÄÄÄÄÄ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÅë•Õ¡±Ö‰Èô±ï‡Ï(ÄÄÄÄÄÄÄÄÄÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ï(ÄÄÄÄÄÄÄÄÄÅ©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏Ï(ÄÄÄÄÄÄÄÄÄÅùÖ¿Ëƒ…¡‡Ï(ÄÄÄÄÄÄÄÄÄÅ¡Öëë•πúËƒ—¡‡Ï(ÄÄÄÄÄÄÄÄÄÅâΩ…ëï»µâΩ——Ω¥Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ï(ÄÄÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÃ’ëïú±…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿‘‘§±…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿ƒ»§§Ï(ÄÄÄÄÄÄÄÄÄÅô±ï‡µ›…Ö¿È›…Ö¿Ï(ÄÄÄÄÄÄÄÄà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ì—ï·–µ—…ÖπÕôΩ…¥È’¡¡ï…çÖÕîÌ±ï——ï»µÕ¡Öç•πúË∏¿·ï¥Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅ∏Å—‘Å¡ï…ô•∞(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÌôΩπ–µ›ï•ù°–Ë‡¿¿ÌµÖ…ù•∏µ—Ω¿ËÕ¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅQ’ÃÄÃÅµïëÖ±±ÖÃÅëïÕ—ÖçÖëÖÃ(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌùÖ¿Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌ…ïπëï…≈’•¡¡ïë5ïëÖ±Õ%π±•πî°ï≈’•¡¡ïë	ÖëùïÃ∞Å—…’î•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅç±ÖÕÃÙââ—∏µΩ’—±•πîà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨ÙâΩ¡ïπ≈’•¡5ïëÖ±ÕAÖπï∞†§à(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúË›¡‡Äƒ¡¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ì›°•—îµÕ¡ÖçîÈπΩ›…Ö¿Ïà(ÄÄÄÄÄÄÄÄÄÄÄÄ˘ë•—Ö»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÒâ’——Ω∏(ÄÄÄÄÄÄÄÄÄÅ—Â¡îÙââ’——Ω∏à(ÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨ÙâΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†ùÖ±∞ú§à(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÄÄÅ›•ë—†Ëƒ¿¿îÏ(ÄÄÄÄÄÄÄÄÄÄÄÅâΩ…ëï»Ë¿Ï(ÄÄÄÄÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ—…ÖπÕ¡Ö…ïπ–Ï(ÄÄÄÄÄÄÄÄÄÄÄÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ï(ÄÄÄÄÄÄÄÄÄÄÄÅç’…ÕΩ»È¡Ω•π—ï»Ï(ÄÄÄÄÄÄÄÄÄÄÄÅë•Õ¡±Ö‰Èù…•êÏ(ÄÄÄÄÄÄÄÄÄÄÄÅù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–†–∞≈ô»§Ï(ÄÄÄÄÄÄÄÄÄÄÄÅùÖ¿Ë¿Ï(ÄÄÄÄÄÄÄÄÄÄÄÅ¡Öëë•πúËƒ¡¡‡Ï(ÄÄÄÄÄÄÄÄÄÄà(ÄÄÄÄÄÄÄÄ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ—ï·–µÖ±•ù∏Èçïπ—ï»Ì¡Öëë•πúËƒ¡¡‡Ä’¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»¡¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ë—¡‡Ïà˚¬~J8Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÂ¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÏ°âÖëùïÃÅÒÅmt§π±ïπù—†Ä¨Ä°çΩ±±ïç—•ΩπM’µµÖ…‰πïµΩ©•ÃÅÒÄ¿§Ä¨Ä°çΩ±±ïç—•ΩπM’µµÖ…‰π—•—±ïÃÅÒÄ¿•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ì—ï·–µ—…ÖπÕôΩ…¥È’¡¡ï…çÖÕîÏà˘=â©ï—ΩÃΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ—ï·–µÖ±•ù∏Èçïπ—ï»Ì¡Öëë•πúËƒ¡¡‡Ä’¡‡ÌâΩ…ëï»µ±ïô–Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»¡¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ë—¡‡Ïà˚¬~>Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÂ¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿Ïà¯ëÏ°âÖëùïÃÅÒÅmt§π±ïπù—°ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ì—ï·–µ—…ÖπÕôΩ…¥È’¡¡ï…çÖÕîÏà˘5ïëÖ±±ÖÃΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ—ï·–µÖ±•ù∏Èçïπ—ï»Ì¡Öëë•πúËƒ¡¡‡Ä’¡‡ÌâΩ…ëï»µ±ïô–Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»¡¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ë—¡‡Ïà˚¬~b8Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÂ¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿Ïà¯ëÌçΩ±±ïç—•ΩπM’µµÖ…‰πïµΩ©•ÃÅÒÄ¡ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ì—ï·–µ—…ÖπÕôΩ…¥È’¡¡ï…çÖÕîÏà˘µΩ©•ÃΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ—ï·–µÖ±•ù∏Èçïπ—ï»Ì¡Öëë•πúËƒ¡¡‡Ä’¡‡ÌâΩ…ëï»µ±ïô–Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»¡¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ë—¡‡Ïà˚¬~>ﬂæ‚<Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÂ¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿Ïà¯ëÌçΩ±±ïç—•ΩπM’µµÖ…‰π—•—±ïÃÅÒÄ¡ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ì—ï·–µ—…ÖπÕôΩ…¥È’¡¡ï…çÖÕîÏà˘Sµ—’±ΩÃΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩâ’——Ω∏¯((ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÅë•Õ¡±Ö‰Èù…•êÏ(ÄÄÄÄÄÄÄÄÄÅù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–†Ã∞≈ô»§Ï(ÄÄÄÄÄÄÄÄÄÅâΩ…ëï»µ—Ω¿Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ï(ÄÄÄÄÄÄÄÄà¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏(ÄÄÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨ÙâΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†ùâÖëùîú§à(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâΩ…ëï»Ë¿ÌâΩ…ëï»µ…•ù°–Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâÖç≠ù…Ω’πêÈ—…ÖπÕ¡Ö…ïπ–ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ìç’…ÕΩ»È¡Ω•π—ï»ÌôΩπ–µôÖµ•±‰È•π°ï…•–ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà(ÄÄÄÄÄÄÄÄÄÄ˚¬~>Å5ïëÖ±±ÖÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏(ÄÄÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨ÙâΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†ùïµΩ©§ú§à(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâΩ…ëï»Ë¿ÌâΩ…ëï»µ…•ù°–Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâÖç≠ù…Ω’πêÈ—…ÖπÕ¡Ö…ïπ–ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ìç’…ÕΩ»È¡Ω•π—ï»ÌôΩπ–µôÖµ•±‰È•π°ï…•–ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà(ÄÄÄÄÄÄÄÄÄÄ˚¬~b8ÅµΩ©•ÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏(ÄÄÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨ÙâΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†ù—•—±îú§à(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâΩ…ëï»Ë¿ÌâÖç≠ù…Ω’πêÈ—…ÖπÕ¡Ö…ïπ–ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ìç’…ÕΩ»È¡Ω•π—ï»ÌôΩπ–µôÖµ•±‰È•π°ï…•–ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà(ÄÄÄÄÄÄÄÄÄÄ˚¬~>ﬂæ‚<ÅSµ—’±ΩÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ((ÄÅçΩπÕ–Å…ïçïπ—ç—•Ÿ•—‰ÄÙÅ±Õ	’•±ëIïçïπ—ç—•Ÿ•—‰°Ÿ•ëïΩÃ∞ÅâÖëùïÃÅÒÅmt§Ï(ÄÅçΩπÕ–Å±Ö—ïÕ—Y•ëïºÄÙÅŸ•ëïΩÃ¸πl¡tÅÒÅπ’±∞Ï(ÄÅçΩπÕ–Å°ÖÕ…ïÕ°ç—•Ÿ•—‰ÄÙÄÑÑ†(ÄÄÄÄ°±Ö—ïÕ—Y•ëïºÄòòÅ±Õ%Õ]•—°•π!Ω’…Ã°±Ö—ïÕ—Y•ëïºπç…ïÖ—ïë}Ö–∞Ä»–§§ÅÒ(ÄÄÄÅç’……ïπ—A…Ωô•±îπ•Õ}±•Ÿî(ÄÄ§Ï((ÄÅçΩπÕ–Å…ïçïπ—ç—•Ÿ•—Â!—µ∞ÄÙÅ…ïçïπ—ç—•Ÿ•—‰π±ïπù—†Ä¸ÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕïç—•Ω∏à¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕïç—•Ω∏µ°ïÖêà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ•çºà˚äjÑΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒ†Ã˘ç—•Ÿ•ëÖêÅ…ïç•ïπ—îΩ†Ã¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÕ’àà˘1ºÉÈ±—•µºÅï∏Å—‘Å¡ï…ô•∞Ωë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êÅ±Ãµ…ïçïπ–µÖç—•Ÿ•—‰à¯(ÄÄÄÄÄÄÄÄëÌ…ïçïπ—ç—•Ÿ•—‰πµÖ¿°ÑÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµÖç—•Ÿ•—‰µ•—ï¥à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµÖç—•Ÿ•—‰µ•çΩ∏à¯ëÌÑπ•çΩπÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµÖç—•Ÿ•—‰µçΩ¡‰à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµÖç—•Ÿ•—‰µ—•—±îà¯ëÌïÕçÖ¡ï!—µ∞°Ñπ—•—±î•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµÖç—•Ÿ•—‰µ—•µîà¯ëÌ±ÕQ•µïùº°ÑπëÖ—î•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ˘Ä§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÄËÄààÏ((ÄÅ›•πëΩ‹π}}µÂA…Ωô•±ï	ÖëùïÃÄÙÅâÖëùïÃÅÒÅmtÏ((ÄÅçΩπÕ–Å…ïôï……Ö±Mïç—•Ωπ!—µ∞ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕïç—•Ω∏à¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕïç—•Ω∏µ°ïÖêà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ•çºà˚¬~:Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒ†Ã˘%πŸ•”ÑÅ‰ÅùÖªÑΩ†Ã¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÕ’àà¯¨ëÌ…ïôï……ï…A—ÕÙÅ¡—ÃÅ¡Ω»Å•πŸ•—ÖëºΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êà¯(ÄÄÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅµÖ…ù•∏µ—Ω¿Ë¿ÏÅµÖ…ù•∏µâΩ——Ω¥Ëƒ…¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÅΩµ¡Ö…”¥Å—‘Å±•π¨∏Å’ÖπëºÅ±ÑÅ¡ï…ÕΩπÑÅ•πŸ•—ÖëÑÅÕ’âÑÅºÅµ•…îÅÖ±ùºÅ¡Ω»Å¡…•µï…ÑÅŸïË∞ÅùÖªÖÃÄëÌ…ïôï……ï…A—ÕÙÅ¡—ÃÅ‰Åï±±ÑÅùÖπÑÄëÌ…ïôï……ïëA—ÕÙÅ¡—Ã∏(ÄÄÄÄÄÄÄÄÄÅQΩ¡îËÄÃÅ•πŸ•—Öç•ΩπïÃÅ¡…ïµ•ÖëÖÃÅ¡Ω»ÅµïÃ∏(ÄÄÄÄÄÄÄÄΩ¿¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿Ë·¡‡ÏÅô±ï‡µ›…Ö¿È›…Ö¿Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å…ïÖëΩπ±‰Å•êÙâ…ïôï……Ö±1•π≠%π¡’–àÅŸÖ±’îÙàëÌ›•πëΩ‹π±ΩçÖ—•Ω∏πΩ…•ù•πÙëÌ›•πëΩ‹π±ΩçÖ—•Ω∏π¡Ö—°πÖµïÙ˝…ïòÙëÌïπçΩëïUI%Ωµ¡Ωπïπ–°ç’……ïπ—A…Ωô•±îπ’Õï…πÖµî•Ùà(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâô±ï‡ËƒÏÅµ•∏µ›•ë—†Ë»¿¡¡‡ÏÅ¡Öëë•πúËƒ¡¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÏÅôΩπ–µôÖµ•±‰Ëù)ï—	…Ö•πÃÅ5Ωπºú∞ÅµΩπΩÕ¡ÖçîÏÅôΩπ–µÕ•ÈîËƒ…¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨ÙâçΩ¡ÂIïôï……Ö±1•π¨†§à˘Ω¡•Ö»Å±•π¨Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ((ÄÅ›•πëΩ‹π}}¡…Ωô•±ïïïëY•ëïΩÃÄÙÅŸ•ëïΩÃÏ(ÄÅ›•πëΩ‹π}}¡…Ωô•±ïïïë’—°Ω»ÄÙÅÏÅ’Õï…πÖµîËÅç’……ïπ—A…Ωô•±îπ’Õï…πÖµî∞Å¡±Öπ}•êËÅç’……ïπ—A…Ωô•±îπ¡±Öπ}•êÅÙÏ(ÄÅ›•πëΩ‹π}}¡…Ωô•±ïA•πΩπ—ï·–ÄÙÅÏ(ÄÄÄÅçÖπA•∏∞(ÄÄÄÅ¡•πÕUÕïê∞(ÄÄÄÅµÖ·A•ππïêËÅµÂA±Ö∏¸πµÖ·}¡•ππïë}Ÿ•ëïΩÃÅÒÄ¿∞(ÄÄÄÅ¡•ππïë%ëÃËÅ……Ö‰πô…Ω¥°¡•ππïë%ëÃ§(ÄÅÙÏ((ÄÅçΩπÕ–ÅŸ•ëïΩÕMïç—•Ωπ!—µ∞ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕïç—•Ω∏à¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕïç—•Ω∏µ°ïÖêà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ•çºà˚¬~:∞Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒ†Ã˘5•ÃÅŸ•ëïΩÃΩ†Ã¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÕ’àà¯ëÌŸ•ëïΩÃπ±ïπù—°ÙÅï∏Å—Ω—Ö∞ëÌçÖπA•∏Ä¸ÅÄÉ
‹É¬~N0ÄëÌ¡•πÕUÕïëÙºëÌµÂA±Ö∏πµÖ·}¡•ππïë}Ÿ•ëïΩÕÙÅÖπç±ÖëΩÕÄÄËÄàâÙΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄëÌŸ•ëïΩÃπ±ïπù—†Ä¸ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâŸ•ëïºµù…•êà¯(ÄÄÄÄÄÄÄÄÄÄëÌŸ•ëïΩÃπµÖ¿°ÿÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâŸ•ëïºµù…•êµ—•±îàÅ•êÙâ—•±î¥ëÌÿπ•ëÙà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌùï—…•ëΩŸï…!—µ∞°ÿ•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌ±Õ%Õ]•—°•π!Ω’…Ã°ÿπç…ïÖ—ïë}Ö–∞Ä»–§Ä¸ÅÄÒë•ÿÅç±ÖÕÃÙâ±Ãµπï‹µŸ•ëïºµâÖëùîà˚¬~RîÅ9UY<Ωë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌ¡•ππïë%ëÃπ°ÖÃ°ÿπ•ê§Ä¸ÅÄÒë•ÿÅç±ÖÕÃÙâ¡•ππïêµâÖëùîà˚¬~N0Ωë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙâù…•êµµïπ‘µâ—∏àÅÖ…•Ñµ±Öâï∞Ùâ=¡ç•ΩπïÃÅëï∞ÅŸ•ëïºàÅ—•—±îÙâ=¡ç•ΩπïÃàÅΩπç±•ç¨ÙâïŸïπ–πÕ—Ω¡A…Ω¡ÖùÖ—•Ω∏†§ÏÅ—Ωùù±ïY•ëïΩQ•±ï5ïπ‘†úëÌÿπ•ëÙú§à˚ä.∏Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâù…•êµΩŸï…±Ö‰àÅΩπç±•ç¨ÙâΩ¡ïπA…Ωô•±ïY•ëïΩïïê°›•πëΩ‹π}}¡…Ωô•±ïïïëY•ëïΩÃ∞ÄúëÌÿπ•ëÙú∞Å›•πëΩ‹π}}¡…Ωô•±ïïïë’—°Ω»§à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâù…•êµÕ—Ö—Ãà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏˚¬~FÄëÏ°Ÿ•ï›Õ	ÂY•ëïΩmÿπ•ët¸πÕ•ÈîÅÒÄ¿•ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏˚ävìæ‚<ÄëÌ±•≠ïÕ	ÂY•ëïΩmÿπ•ëtÅÒÄ¡ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâŸ•ëïºµù…•êµµïπ‘Å°•ëëï∏àÅ•êÙâµïπ‘¥ëÌÿπ•ëÙà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ¡Öëë•πúËŸ¡‡Äƒ¡¡‡Ä—¡‡ÏÅôΩπ–µÕ•ÈîËƒ≈¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅ›°•—îµÕ¡ÖçîÈπΩ›…Ö¿ÏÅΩŸï…ô±Ω‹È°•ëëï∏ÏÅ—ï·–µΩŸï…ô±Ω‹Èï±±•¡Õ•ÃÏà¯ëÌïÕçÖ¡ï!—µ∞°ÿπ—•—±î•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌçÖπA•∏Ä¸Ä°¡•ππïë%ëÃπ°ÖÃ°ÿπ•ê§(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒë•ÿÅÕ—Â±îÙâ¡Öëë•πúË·¡‡Äƒ¡¡‡ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§Ïà˚¬~N0Åπç±ÖëºÅï∏ÄâAÖ…ÑÅQ§àΩë•ÿ˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄËÅÄÒâ’——Ω∏ÄëÌ¡•πÕUÕïêÄ¯ÙÅµÂA±Ö∏πµÖ·}¡•ππïë}Ÿ•ëïΩÃÄ¸Äâë•ÕÖâ±ïêàÄËÄàâÙÅΩπç±•ç¨Ùâ°Öπë±ïA•πY•ëïº†úëÌÿπ•ëÙú§à˚¬~N0Åπç±Ö»Ä»—°ÃΩâ’——Ω∏˘Ä§ÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌÿπ¡±Ö—ôΩ…¥ÄÙÙÙÄâ’¡±ΩÖêàÄ¸ÅÄÒâ’——Ω∏ÅΩπç±•ç¨ÙâΩ¡ïπY•ëïΩIïïë•—Ω»†úëÌÿπ•ëÙú§à˚äræ‚<ÅIïïë•—Ö»ÅŸ•ëïºΩâ’——Ω∏˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌ•ÕMÖôïU…∞°ÿπŸ•ëïΩ}’…∞§Ä¸ÅÄÒâ’——Ω∏ÅΩπç±•ç¨Ùâ›•πëΩ‹πΩ¡ï∏†úëÌïÕçÖ¡ï!—µ∞°ÿπŸ•ëïΩ}’…∞•Ùú∞Äù}â±Öπ¨ú∞ÄùπΩΩ¡ïπï»±πΩ…ïôï……ï»ú§à˚¬~R\Åâ…•»Å±•π¨Ωâ’——Ω∏˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙâëÖπùï»àÅΩπç±•ç¨Ùâ°Öπë±ïï±ï—ï=›πY•ëïº†úëÌÿπ•ëÙú§à˚¬~^DÅ±•µ•πÖ»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÅÄ§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÅÄÄËÅÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§à˘QΩëÖ€µÑÅπºÅÕ’â•Õ—îÅπ•πüÈ∏ÅŸ•ëïº∏ÄÒâ’——Ω∏ÅΩπç±•ç¨ÙâÕ›•—ç°QÖà†ù’¡±ΩÖêú§àÅÕ—Â±îÙââÖç≠ù…Ω’πêÈπΩπîÌâΩ…ëï»ÈπΩπîÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ìç’…ÕΩ»È¡Ω•π—ï»ÌôΩπ–µôÖµ•±‰È•π°ï…•–Ïà˘M’ã¥Åï∞Å¡…•µï…ºÉäHΩâ’——Ω∏¯Ω¿˘ÅÙ(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ((ÄÅçΩπÕ–Å±•Ÿ•πùA…Ωô•±ï!—µ∞ÄÙÅ…ïπëï…1•ŸïMç…Ω±∞›1•Ÿ•πùA…Ωô•±î°Ï(ÄÄÄÅ¡…Ωô•±îÈç’……ïπ—A…Ωô•±î∞(ÄÄÄÅŸ•ëïΩÃ∞(ÄÄÄÅôΩ±±Ω›ï…ÕΩ’π–∞(ÄÄÄÅ—Ω—Ö±Y•ï›ÃÈ—Ω—Ö±…ΩµY•ï›Ã∞(ÄÄÄÅΩ›∏È—…’î(ÄÅÙ§Ï((ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµ°ï…ºÅ±Ãµ¡…Ωô•±îµπΩŸÑëÌ•Õ1•ŸïMç…Ω±∞›¡¿†§Ä¸ÄàÅ±Ã‹µï±ïç—…•åµ¡…Ωô•±îàÄËÄàâÙàÅ•êÙâ±ÕA…Ωô•±ï9ΩŸÖ!ï…ºàÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÏÅΩŸï…ô±Ω‹È°•ëëï∏Ïà¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµçΩŸï»ëÌç’……ïπ—A…Ωô•±îπçΩŸï…}’…∞Ä¸ÄàÅ°ÖÃµ•µÖùîàÄËÄàâÙàÅ•êÙâ¡…Ωô•±ïΩŸï…	Öππï»à(ÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÏÅËµ•πëï‡Ë–ÏÄëÌç’……ïπ—A…Ωô•±îπçΩŸï…}’…∞Ä¸ÅÅâÖç≠ù…Ω’πêµ•µÖùîÈ’…∞†úëÌïÕçÖ¡ï!—µ∞°ç’……ïπ—A…Ωô•±îπçΩŸï…}’…∞•Ùú§ÏÅâÖç≠ù…Ω’πêµ¡ΩÕ•—•Ω∏Èçïπ—ï»ÄëÌ9’µâï»°ç’……ïπ—A…Ωô•±îπçΩŸï…}¡ΩÕ•—•Ωπ}‰Ä¸¸Ä‘¿•ÙîÌÄÄËÄàâÙà¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙâ¡…Ωô•±îµçΩŸï»µïë•–µâ—∏àÅΩπç±•ç¨ÙâΩ¡ïπë•—A…Ωô•±î†§à˚¬~ZÛæ‚<Åë•—Ö»Å¡Ω…—ÖëÑΩâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄëÌç’……ïπ—A…Ωô•±îπ¡…Ωô•±ï}Õ•ëï}•µÖùï}’…∞Ä¸ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅÖ…•Ñµ°•ëëï∏Ùâ—…’îàÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÅ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÏ(ÄÄÄÄÄÄÄÄÄÅ±ïô–Ë¿Ï(ÄÄÄÄÄÄÄÄÄÅ…•ù°–Ë¿Ï(ÄÄÄÄÄÄÄÄÄÅ—Ω¿Ëƒ‘¡¡‡Ï(ÄÄÄÄÄÄÄÄÄÅâΩ——Ω¥Ë¿Ï(ÄÄÄÄÄÄÄÄÄÅËµ•πëï‡ËƒÏ(ÄÄÄÄÄÄÄÄÄÅΩŸï…ô±Ω‹È°•ëëï∏Ï(ÄÄÄÄÄÄÄÄÄÅ¡Ω•π—ï»µïŸïπ—ÃÈπΩπîÏ(ÄÄÄÄÄÄÄÄà¯(ÄÄÄÄÄÄÄÄÄÄÒ•µú(ÄÄÄÄÄÄÄÄÄÄÄÅÕ…åÙàëÌïÕçÖ¡ï!—µ∞°ç’……ïπ—A…Ωô•±îπ¡…Ωô•±ï}Õ•ëï}•µÖùï}’…∞•Ùà(ÄÄÄÄÄÄÄÄÄÄÄÅÖ±–Ùàà(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÏ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅ•πÕï–Ë¿Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅ›•ë—†Ëƒ¿¿îÏ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅ°ï•ù°–Ëƒ¿¿îÏ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩâ©ïç–µô•–ÈçΩŸï»Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩâ©ïç–µ¡ΩÕ•—•Ω∏Èçïπ—ï»Åçïπ—ï»Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩ¡Öç•—‰Ë¿∏–»Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅô•±—ï»ÈÕÖ—’…Ö—î†¿∏‰‘§ÅçΩπ—…ÖÕ–†ƒ∏¿ÿ§Ï(ÄÄÄÄÄÄÄÄÄÄÄÄà(ÄÄÄÄÄÄÄÄÄÄ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÄÄÅ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÏ(ÄÄÄÄÄÄÄÄÄÄÄÅ•πÕï–Ë¿Ï(ÄÄÄÄÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêË(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅ±•πïÖ»µù…Öë•ïπ–†ƒ‡¡ëïú∞(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅ…ùâÑ†ƒÃ∞ƒÿ∞»¿∞¿∏ƒÿ§Ä¿î∞(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅ…ùâÑ†ƒÃ∞ƒÿ∞»¿∞¿∏»‡§Ä–‡î∞(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅ…ùâÑ†ƒÃ∞ƒÿ∞»¿∞¿∏‹»§Äƒ¿¿î§∞(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅ±•πïÖ»µù…Öë•ïπ–†‰¡ëïú∞(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅ…ùâÑ†ƒÃ∞ƒÿ∞»¿∞¿∏–¿§Ä¿î∞(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅ…ùâÑ†ƒÃ∞ƒÿ∞»¿∞¿∏ƒ‡§Ä‘¿î∞(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅ…ùâÑ†ƒÃ∞ƒÿ∞»¿∞¿∏Ã¿§Äƒ¿¿î§Ï(ÄÄÄÄÄÄÄÄÄÄà¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÅÄÄËÄàâÙ((ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ãµ¡…Ωô•±îµπΩŸÑµ•ππï»àÅ•êÙâ±ÕA…Ωô•±ï9ΩŸÖ%ππï»àÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÏÅËµ•πëï‡Ë»Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµ°ï…ºµ—Ω¿à¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÖŸÖ—Ö»µ…•πúÄëÌùï—ŸÖ—Ö…I•πù±ÖÕÃ°ç’……ïπ—A…Ωô•±îπ¡±Öπ}•ê•ÙëÌç’……ïπ—A…Ωô•±îπ•Õ}±•ŸîÄ¸ÄàÅÖŸÖ—Ö»µ±•Ÿîµ…•πúàÄËÄàâÙëÌ°ÖÕ…ïÕ°ç—•Ÿ•—‰Ä¸ÄàÅ±ÃµÖç—•Ÿ•—‰µÖ’…ÑàÄËÄàâÙàÅ—•—±îÙàëÌ°ÖÕ…ïÕ°ç—•Ÿ•—‰Ä¸Äâç—•Ÿ•ëÖêÅ…ïç•ïπ—îàÄËÄàâÙà¯ëÌ…ïπëï…ŸÖ—Ö…!—µ∞°ç’……ïπ—A…Ωô•±î∞Äÿ¿•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµπÖµîµâ±Ωç¨à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒ†ƒ˘ ëÌïÕçÖ¡ï!—µ∞°ç’……ïπ—A…Ωô•±îπ’Õï…πÖµî•ÙÄëÌùï—A±Öπ	Öëùï!—µ∞°ç’……ïπ—A…Ωô•±îπ¡±Öπ}•ê•ÙΩ†ƒ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ°Öπë±îÅ¡…Ωô•±îµ…Ω±îµâÖëùîÄëÌç’……ïπ—A…Ωô•±îπ•Õ}ç…ïÖ—Ω»Ä¸Äâç…ïÖ—Ω»àÄËÄâ’Õï»âÙà¯ëÌç’……ïπ—A…Ωô•±îπ•Õ}ç…ïÖ—Ω»Ä¸Äã¬~:∞Å…ïÖëΩ»àÄËÄã¬~FêÅUÕ’Ö…•ºâÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌ…ïπëï…A…Ωô•±ïQ•—±ï%π±•πî°ï≈’•¡¡ïëQ•—±î∞Å—…’î•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄëÌ…ïπëï…≈’•¡¡ïë5ïëÖ±Õ%π±•πî°ï≈’•¡¡ïë	ÖëùïÃ∞Å—…’î•Ù(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄëÌç’……ïπ—A…Ωô•±îπâ•ºÄ¸ÅÄÒ¿Åç±ÖÕÃÙâ¡…Ωô•±îµâ•ºà¯ëÌïÕçÖ¡ï!—µ∞°ç’……ïπ—A…Ωô•±îπâ•º•ÙΩ¿˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄëÌ…ïπëï…MΩç•Ö±%çΩπÃ°ç’……ïπ—A…Ωô•±î•Ù(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕ—Ö—Ãµ…Ω‹à¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÕ—Ö–µ¡•±∞à¯Òë•ÿÅç±ÖÕÃÙâπ’¥à¯ëÌŸ•ëïΩÃπ±ïπù—°ÙΩë•ÿ¯Òë•ÿÅç±ÖÕÃÙâ±â∞à˘Y•ëïΩÃΩë•ÿ¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÕ—Ö–µ¡•±∞à¯Òë•ÿÅç±ÖÕÃÙâπ’¥à¯ëÌ—Ω—Ö±…ΩµY•ï›ÕÙΩë•ÿ¯Òë•ÿÅç±ÖÕÃÙâ±â∞à˘A—Ã∏Å¡Ω»ÅŸ•Õ—ÖÃΩë•ÿ¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÕ—Ö–µ¡•±∞à¯Òë•ÿÅç±ÖÕÃÙâπ’¥à¯ëÌôΩ±±Ω›ï…ÕΩ’π–ÅÒÄ¡ÙΩë•ÿ¯Òë•ÿÅç±ÖÕÃÙâ±â∞à˘Mïù’•ëΩ…ïÃΩë•ÿ¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµ°ï…ºµÖç—•ΩπÃà¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâΩ¡ïπë•—A…Ωô•±î†§à˚är?æ‚<Åë•—Ö»Å¡ï…ô•∞Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄëÌ…ïπëï…ïπï…Ö—•Ωπ%ëïπ—•—ÂÖ…ê°Ÿ•ëïΩÃ∞Å—…’î•Ù(ÄÄÄÄëÌ±•Ÿ•πùA…Ωô•±ï!—µ±Ù((ÄÄÄÄëÌçΩ±±ïç—•ΩπM’µµÖ…Â!—µ±Ù(ÄÄÄÄëÌ…ïçïπ—ç—•Ÿ•—Â!—µ±Ù(ÄÄÄÄëÌÕΩç•Ö±±•ç≠Õ!—µ±Ù(ÄÄÄÄëÌÕ—…ïÖ≠Mïç—•Ωπ!—µ±Ù(ÄÄÄÄëÌ…ïôï……Ö±Mïç—•Ωπ!—µ±Ù(ÄÄÄÄëÌŸ•ëïΩÕMïç—•Ωπ!—µ±ıÄÏ((ÄÅ•π•—A…Ωô•±ï9ΩŸÖQ•±–†§Ï(ÄÅ•π•—1ÖÈÂA…Ωô•±ïA…ïŸ•ï›Ã†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï1•≠î°Ÿ•ëïΩ%ê§ÅÏ(ÄÅçΩπÕ–Åâ—∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê°Å±•≠î¥ëÌŸ•ëïΩ%ëıÄ§Ï(ÄÅ•òÄ†Öâ—∏§Å…ï—’…∏Ï(ÄÅ•òÄ°â—∏πç±ÖÕÕ1•Õ–πçΩπ—Ö•πÃ†â±•≠ïêà§§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âù•Ÿï}±•≠îà∞ÅÏÅ¡}Ÿ•ëïΩ}•êËÅŸ•ëïΩ%ê∞Å¡}’Õï…}•êËÅç’……ïπ—UÕï»π•êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏ(ÄÄÄÅ•òÄ°ëÖ—Ñ¸πï……Ω»ÄÙÙÙÄâ—Ω¡ï}ë•Ö…•ºà§ÅÕ°Ω›QΩÖÕ–†â±çÖπÈÖÕ—îÅ—‘Å—Ω¡îÅë•Ö…•ºÅëîÅ±•≠ïÃà§Ï(ÄÄÄÅ•òÄ°ëÖ—Ñ¸πï……Ω»ÄÙÙÙÄâπΩ}Õï±ô}±•≠îà§ÅÕ°Ω›QΩÖÕ–†â9ºÅ¡Ωì•ÃÅëÖ…±îÅ±•≠îÅÑÅ—‘Å¡…Ω¡•ºÅŸ•ëïºà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅâ—∏πç±ÖÕÕ1•Õ–πÖëê†â±•≠ïêà§Ï(ÄÅâ—∏πëÖ—ÖÕï–π±Öâï∞ÄÙÄâQîÅù’Õ—ÑàÏ(ÄÅâ—∏π—•—±îÄÙÄâQîÅù’Õ—ÑàÏ(ÄÅâ—∏πÕï———…•â’—î†âÖ…•Ñµ±Öâï∞à∞ÄâQîÅù’Õ—Ñà§Ï(ÄÅâ—∏πÕï———…•â’—î†âÖ…•Ñµ¡…ïÕÕïêà∞Äâ—…’îà§Ï(ÄÅçΩπÕ–Å•çΩ∏ÄÙÅâ—∏π≈’ï…ÂMï±ïç—Ω»†âÕ¡Ö∏à§Ï(ÄÅçΩπÕ–Å±Öâï∞ÄÙÅâ—∏π≈’ï…ÂMï±ïç—Ω»†â§à§Ï(ÄÅ•òÄ°•çΩ∏§Å•çΩ∏π—ï·—Ωπ—ïπ–ÄÙÄãäfîàÏ(ÄÅ•òÄ°±Öâï∞§Å±Öâï∞π—ï·—Ωπ—ïπ–ÄÙÄâQTÅ1%-àÏ(ÄÅÕÖôïA’±Õï±ïµïπ–°â—∏∞Äâ±Ãµ±•≠îµ¡Ω¿µÕÖôîà§Ï(ÄÅç’……ïπ—A…Ωô•±îπ¡Ω•π—Õ}âÖ±ÖπçîÄ¨ÙÅëÖ—Ñπ¡Ω•π—ÃÏ(ÄÅ’¡ëÖ—ï	Ö±ÖπçïU$†§Ï(ÄÅÕ°Ω›±ΩÖ—•πùAΩ•π—ÕMÖôî°ëÖ—Ñπ¡Ω•π—Ã∞Åâ—∏§Ï(ÄÅÕ°Ω›QΩÖÕ–°Ä¨ëÌëÖ—Ñπ¡Ω•π—ÕÙÅ¡–Å¡Ω»Åï∞Å±•≠ïÄ§Ï(ÄÅ…ïçΩ…ëÖ•±Â°Ö±±ïπùïŸïπ–†â±•≠ï}Ÿ•ëïºà∞ÅŸ•ëïΩ%ê§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïM°Ö…î°Ÿ•ëïΩ%ê∞Å’…∞§ÅÏ(ÄÅçΩπÕ–ÅÕ°Ö…ïU…∞ÄÙÅÄëÌ›•πëΩ‹π±ΩçÖ—•Ω∏πΩ…•ù•πÙëÌ›•πëΩ‹π±ΩçÖ—•Ω∏π¡Ö—°πÖµïÙ˝Ÿ•ëïºÙëÌŸ•ëïΩ%ëıÄÏ(ÄÅ±ï–ÅÕ°Ö…ïêÄÙÅôÖ±ÕîÏ(ÄÅ•òÄ°πÖŸ•ùÖ—Ω»πÕ°Ö…î§ÅÏ(ÄÄÄÅ—…‰ÅÏ(ÄÄÄÄÄÅçΩπÕ–ÅÏÅëÖ—ÑÈŸ•ëïºÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†âŸ•ëïΩÃà§(ÄÄÄÄÄÄÄÄπÕï±ïç–†â—•—±î±—°’µâπÖ•±}’…∞±¡…Ωô•±ïÃÖŸ•ëïΩÕ}’Õï…}•ë}ô≠ï‰°’Õï…πÖµî§à§(ÄÄÄÄÄÄÄÄπïƒ†â•êà±Ÿ•ëïΩ%ê§πµÖÂâïM•πù±î†§Ï(ÄÄÄÄÄÅçΩπÕ–Å—•—±îÄÙÅŸ•ëïº¸π—•—±îÅÒÄâ5•ÀÑÅïÕ—îÅŸ•ëïºÅï∏Å1•ŸïMç…Ω±∞àÏ(ÄÄÄÄÄÅçΩπÕ–Åç…ïÖ—Ω»ÄÙÅŸ•ëïº¸π¡…Ωô•±ïÃ¸π’Õï…πÖµîÄ¸ÅÄÅëîÅ ëÌŸ•ëïºπ¡…Ωô•±ïÃπ’Õï…πÖµïıÄÄËÄààÏ(ÄÄÄÄÄÅçΩπÕ–ÅÕ°Ö…ïÖ—ÑÄÙÅÏÅ—•—±î∞Å—ï·–ÈÅ5•ÀÑÉäpëÌ—•—±ï˜ätëÌç…ïÖ—Ω…ÙÅï∏Å1•ŸïMç…Ω±±Ä∞Å’…∞ÈÕ°Ö…ïU…∞ÅÙÏ((ÄÄÄÄÄÅ•òÄ°Ÿ•ëïº¸π—°’µâπÖ•±}’…∞ÄòòÅ•ÕMÖôïU…∞°Ÿ•ëïºπ—°’µâπÖ•±}’…∞§ÄòòÅ›•πëΩ‹π•±îÄòòÅπÖŸ•ùÖ—Ω»πçÖπM°Ö…î§ÅÏ(ÄÄÄÄÄÄÄÅ—…‰ÅÏ(ÄÄÄÄÄÄÄÄÄÅçΩπÕ–Å…ïÕ¡ΩπÕîÄÙÅÖ›Ö•–Åôï—ç†°Ÿ•ëïºπ—°’µâπÖ•±}’…∞∞ÅÏÅçÖç°îËâπºµÕ—Ω…îàÅÙ§Ï(ÄÄÄÄÄÄÄÄÄÅ•òÄ°…ïÕ¡ΩπÕîπΩ¨§ÅÏ(ÄÄÄÄÄÄÄÄÄÄÄÅçΩπÕ–Åâ±ΩàÄÙÅÖ›Ö•–Å…ïÕ¡ΩπÕîπâ±Ωà†§Ï(ÄÄÄÄÄÄÄÄÄÄÄÅçΩπÕ–Åï·—ïπÕ•Ω∏ÄÙÅâ±Ωàπ—Â¡îπ•πç±’ëïÃ†â¡πúà§Ä¸Äâ¡πúàÄËÄâ©¡úàÏ(ÄÄÄÄÄÄÄÄÄÄÄÅçΩπÕ–ÅçΩŸï»ÄÙÅπï‹Å•±î°mâ±Ωât∞ÅÅ±•ŸïÕç…Ω±∞µ¡Ω…—ÖëÑ¥ëÌŸ•ëïΩ%ëÙ∏ëÌï·—ïπÕ•ΩπıÄ∞ÅÏÅ—Â¡îÈâ±Ωàπ—Â¡îÅÒÄâ•µÖùîΩ©¡ïúàÅÙ§Ï(ÄÄÄÄÄÄÄÄÄÄÄÅ•òÄ°πÖŸ•ùÖ—Ω»πçÖπM°Ö…î°ÏÅô•±ïÃÈmçΩŸï…tÅÙ§§ÅÕ°Ö…ïÖ—Ñπô•±ïÃÄÙÅmçΩŸï…tÏ(ÄÄÄÄÄÄÄÄÄÅÙ(ÄÄÄÄÄÄÄÅÙÅçÖ—ç†Ä°|§ÅÌÙ(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÅ—…‰ÅÏ(ÄÄÄÄÄÄÄÅÖ›Ö•–ÅπÖŸ•ùÖ—Ω»πÕ°Ö…î°Õ°Ö…ïÖ—Ñ§Ï(ÄÄÄÄÄÅÙÅçÖ—ç†Ä°Õ°Ö…ï……Ω»§ÅÏ(ÄÄÄÄÄÄÄÅ•òÄ°Õ°Ö…ï……Ω»¸ππÖµîÄÙÙÙÄââΩ…—……Ω»àÅÒÄÖÕ°Ö…ïÖ—Ñπô•±ïÃ§Å—°…Ω‹ÅÕ°Ö…ï……Ω»Ï(ÄÄÄÄÄÄÄÅëï±ï—îÅÕ°Ö…ïÖ—Ñπô•±ïÃÏ(ÄÄÄÄÄÄÄÅÖ›Ö•–ÅπÖŸ•ùÖ—Ω»πÕ°Ö…î°Õ°Ö…ïÖ—Ñ§Ï(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÅÕ°Ö…ïêÄÙÅ—…’îÏ(ÄÄÄÅÙÅçÖ—ç†Ä°î§ÅÏ(ÄÄÄÄÄÅ•òÄ°î¸ππÖµîÄÑÙÙÄââΩ…—……Ω»à§ÅÕ°Ω›QΩÖÕ–†â9ºÅ¡’ë•µΩÃÅÖâ…•»Åï∞ÅµïªËÅ¡Ö…ÑÅçΩµ¡Ö…—•»∏à∞Äâï……Ω»à§Ï(ÄÄÄÅÙ(ÄÅÙÅï±ÕîÅÏ(ÄÄÄÅ—…‰ÅÏ(ÄÄÄÄÄÅÖ›Ö•–ÅπÖŸ•ùÖ—Ω»πç±•¡âΩÖ…êπ›…•—ïQï·–°Õ°Ö…ïU…∞§Ï(ÄÄÄÄÄÅÕ°Ω›QΩÖÕ–†â1•π¨ÅçΩ¡•ÖëºÅ¡Ö…ÑÅçΩµ¡Ö…—•»à§Ï(ÄÄÄÄÄÅÕ°Ö…ïêÄÙÅ—…’îÏ(ÄÄÄÅÙÅçÖ—ç†Ä°î§ÅÏÄº®ÅπÖëÑÄ®ºÅÙ(ÄÅÙ((ÄÅ•òÄ†ÖÕ°Ö…ïê§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âù•Ÿï}Õ°Ö…îà∞ÅÏÅ¡}Ÿ•ëïΩ}•êËÅŸ•ëïΩ%ê∞Å¡}’Õï…}•êËÅç’……ïπ—UÕï»π•êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§Å…ï—’…∏ÏÄººÅÂÑÅçΩµ¡Ö…—•ëºÅÖπ—ïÃ∞ÅºÅ—Ω¡îÅë•Ö…•ºËÅπºÅµΩ±ïÕ—ÖµΩÃÅçΩ∏Åï……Ω»(ÄÅç’……ïπ—A…Ωô•±îπ¡Ω•π—Õ}âÖ±ÖπçîÄ¨ÙÅëÖ—Ñπ¡Ω•π—ÃÏ(ÄÅ’¡ëÖ—ï	Ö±ÖπçïU$†§Ï(ÄÅÕ°Ω›±ΩÖ—•πùAΩ•π—ÕMÖôî°ëÖ—Ñπ¡Ω•π—Ã§Ï(ÄÅÕ°Ω›QΩÖÕ–°Ä¨ëÌëÖ—Ñπ¡Ω•π—ÕÙÅ¡—ÃÅ¡Ω»ÅçΩµ¡Ö…—•…Ä§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅΩ¡ïπΩµµïπ—Ã°Ÿ•ëïΩ%ê∞ÅôΩç’ÕΩµµïπ—%êÄÙÅπ’±∞§ÅÏ(ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµçΩµµïπ—ÃµΩŸï…±Ö‰¥ÿƒƒàÅΩπç±•ç¨Ùâ•ò°ïŸïπ–π—Ö…ùï–ÙÙı—°•Ã§Åç±ΩÕïΩµµïπ—Ã†§à¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµçΩµµïπ—Ãµ¡Öπï∞¥ÿƒƒà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅ©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÏÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÏÅµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡ÏÅô±ï‡µÕ°…•π¨Ë¿Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏Ë¿Ïà˚¬~J∞ÅΩµïπ—Ö…•ΩÃΩ†Ã¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏ÅΩπç±•ç¨Ùâç±ΩÕïΩµµïπ—Ã†§àÅÕ—Â±îÙââÖç≠ù…Ω’πêÈπΩπîÌâΩ…ëï»ÈπΩπîÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîË»¡¡‡Ìç’…ÕΩ»È¡Ω•π—ï»Ïà˚ärTΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅ•êÙâçΩµµïπ—Õ1•Õ–àÅÕ—Â±îÙâΩŸï…ô±Ω‹µ‰ÈÖ’—ºÏÄµ›ïâ≠•–µΩŸï…ô±Ω‹µÕç…Ω±±•πúÈ—Ω’ç†ÏÅô±ï‡ËƒÄƒÅÖ’—ºÏÅµ•∏µ°ï•ù°–Ë¿ÏÅµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà˘Ö…ùÖπëº∏∏∏Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµçΩµµïπ–µçΩµ¡ΩÕî¥ÿƒƒà¯(ÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å•êÙâπï›Ωµµïπ—%π¡’–àÅ¡±Öçï°Ω±ëï»ÙâÕç…•ã¥Å’∏ÅçΩµïπ—Ö…•º∏∏∏àÅµÖ·±ïπù—†Ùà‘¿¿àÅΩπ≠ïÂëΩ›∏Ùâ•ò°ïŸïπ–π≠ï‰ÙÙÙùπ—ï»úòòÖïŸïπ–πÕ°•ô—-ï‰•ÌïŸïπ–π¡…ïŸïπ—ïôÖ’±–†§ÌÕ’âµ•—Ωµµïπ–†úëÌŸ•ëïΩ%ëÙú§ÌÙà¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨ÙâÕ’âµ•—Ωµµïπ–†úëÌŸ•ëïΩ%ëÙú§à˘πŸ•Ö»ÉäzpΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ((ÄÅÖ›Ö•–Å±ΩÖëΩµµïπ—Ã°Ÿ•ëïΩ%ê∞ÅôΩç’ÕΩµµïπ—%ê§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖëΩµµïπ—Ã°Ÿ•ëïΩ%ê∞ÅôΩç’ÕΩµµïπ—%êÄÙÅπ’±∞§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅçΩµµïπ—ÃÅÙÄÙÅÖ›Ö•–ÅÕà(ÄÄÄÄπô…Ω¥†âŸ•ëïΩ}çΩµµïπ—Ãà§(ÄÄÄÄπÕï±ïç–†à®∞Å¡…Ωô•±ïÃÖŸ•ëïΩ}çΩµµïπ—Õ}’Õï…}•ë}ô≠ï‰°’Õï…πÖµî∞Å¡±Öπ}•ê§à§(ÄÄÄÄπïƒ†âŸ•ëïΩ}•êà∞ÅŸ•ëïΩ%ê§(ÄÄÄÄπΩ…ëï»†âç…ïÖ—ïë}Ö–à∞ÅÏÅÖÕçïπë•πúËÅôÖ±ÕîÅÙ§Ï((ÄÅçΩπÕ–Å±•Õ–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âçΩµµïπ—Õ1•Õ–à§Ï(ÄÅ•òÄ†Ö±•Õ–§Å…ï—’…∏Ï((ÄÅ±•Õ–π•ππï…!Q50ÄÙÅçΩµµïπ—ÃÄòòÅçΩµµïπ—Ãπ±ïπù—†(ÄÄÄÄ¸ÅçΩµµïπ—ÃπµÖ¿°åÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅ•êÙâçΩµµïπ–¥ëÌåπ•ëÙàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡ÏÅ¡Öëë•πúËƒ¡¡‡ÏÅôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅâΩ…ëï»µ…Öë•’ÃËƒ¡¡‡ÏÅ—…ÖπÕ•—•Ω∏ÈâÖç≠ù…Ω’πêÄ¿∏ÕÃÅïÖÕî∞ÅâΩ…ëï»µçΩ±Ω»Ä¿∏ÕÃÅïÖÕîÏÄëÌôΩç’ÕΩµµïπ—%êÄÙÙÙÅåπ•êÄ¸ÄââÖç≠ù…Ω’πêÈ…ùâÑ†»‘‘∞»‘‘∞»‘‘∞¿∏¿‘§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µùΩ±êµë•¥§ÏàÄËÄââΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ—…ÖπÕ¡Ö…ïπ–ÏâÙà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕ—…ΩπúÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÏÅç’…ÕΩ»È¡Ω•π—ï»ÏàÅΩπç±•ç¨Ùâç±ΩÕïΩµµïπ—Ã†§ÏÅŸ•ï›A’â±•çA…Ωô•±î†úëÌïÕçÖ¡ï!—µ∞°åπ¡…Ωô•±ïÃ¸π’Õï…πÖµîÅÒÄàà•Ùú§à˘ ëÌïÕçÖ¡ï!—µ∞°åπ¡…Ωô•±ïÃ¸π’Õï…πÖµîÅÒÄâ’Õ’Ö…•ºà•ÙΩÕ—…Ωπú¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌùï—A±Öπ	Öëùï!—µ∞°åπ¡…Ωô•±ïÃ¸π¡±Öπ}•ê•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄëÌ…ïπëï…±•ïπ—=…•ù•π	Öëùî°åπç±•ïπ—}Ω…•ù•∏∞Å—…’î•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒ≈¡‡Ïà¯É
‹ÄëÌπï‹ÅÖ—î°åπç…ïÖ—ïë}Ö–§π—Ω1ΩçÖ±ïÖ—ïM—…•πú†âïÃµHà•ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë—¡‡ÏÅ±•πîµ°ï•ù°–Ëƒ∏–Ïà¯ëÌïÕçÖ¡ï!—µ∞°åπçΩπ—ïπ–•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ˘Ä§π©Ω•∏†àà§(ÄÄÄÄËÅÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒÕ¡‡Ïà˘O§Åï∞Å¡…•µï…ºÅï∏ÅçΩµïπ—Ö»∏Ω¿˘ÄÏ((ÄÅ•òÄ°ôΩç’ÕΩµµïπ—%ê§ÅÏ(ÄÄÄÅÕï—Q•µïΩ’–††§ÄÙ¯ÅÏ(ÄÄÄÄÄÅçΩπÕ–ÅçΩµµïπ—∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê°ÅçΩµµïπ–¥ëÌôΩç’ÕΩµµïπ—%ëıÄ§Ï(ÄÄÄÄÄÅ•òÄ†ÖçΩµµïπ—∞§Å…ï—’…∏Ï(ÄÄÄÄÄÅçΩµµïπ—∞πÕç…Ω±±%π—ΩY•ï‹°ÏÅâï°ÖŸ•Ω»ËÄâÕµΩΩ—†à∞Åâ±Ωç¨ËÄâçïπ—ï»àÅÙ§Ï(ÄÄÄÄÄÅÕï—Q•µïΩ’–††§ÄÙ¯ÅÏ(ÄÄÄÄÄÄÄÅçΩµµïπ—∞πÕ—Â±îπâÖç≠ù…Ω’πêÄÙÄààÏ(ÄÄÄÄÄÄÄÅçΩµµïπ—∞πÕ—Â±îπâΩ…ëï…Ω±Ω»ÄÙÄâ—…ÖπÕ¡Ö…ïπ–àÏ(ÄÄÄÄÄÅÙ∞Ä»‘¿¿§Ï(ÄÄÄÅÙ∞Äƒ‘¿§Ï(ÄÅÙ)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅÕ’âµ•—Ωµµïπ–°Ÿ•ëïΩ%ê§ÅÏ(ÄÅçΩπÕ–Å•π¡’–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›Ωµµïπ—%π¡’–à§Ï(ÄÅçΩπÕ–ÅçΩπ—ïπ–ÄÙÅ•π¡’–πŸÖ±’îπ—…•¥†§Ï(ÄÅ•òÄ°çΩπ—ïπ–π±ïπù—†ÄÄÃ§ÅÏÅÕ°Ω›QΩÖÕ–†âÕç…•ã¥ÅÖ∞ÅµïπΩÃÄÃÅçÖ…Öç—ï…ïÃà§ÏÅ…ï—’…∏ÏÅÙ((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëë}çΩµµïπ–à∞ÅÏÅ¡}Ÿ•ëïΩ}•êËÅŸ•ëïΩ%ê∞Å¡}’Õï…}•êËÅç’……ïπ—UÕï»π•ê∞Å¡}çΩπ—ïπ–ËÅçΩπ—ïπ–ÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅçΩµïπ—Ö»à§ÏÅ…ï—’…∏ÏÅÙ((ÄÅçΩπÕ–ÅÏÅï……Ω»ËÅΩ…•ù•π……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âµÖ…≠}±Ö—ïÕ—}çΩµµïπ—}Ω…•ù•∏à∞ÅÏ(ÄÄÄÅ¡}Ÿ•ëïΩ}•êËÅŸ•ëïΩ%ê∞(ÄÄÄÅ¡}Ω…•ù•∏ËÅùï—1•ŸïMç…Ω±±±•ïπ—=…•ù•∏†§(ÄÅÙ§Ï(ÄÅ•òÄ°Ω…•ù•π……Ω»§ÅçΩπÕΩ±îπ›Ö…∏†â9ºÅÕîÅ¡’ëºÅ…ïù•Õ—…Ö»Åï∞ÅΩ…•ùï∏Åëï∞ÅçΩµïπ—Ö…•ºËà∞ÅΩ…•ù•π……Ω»πµïÕÕÖùî§Ï((ÄÅ•π¡’–πŸÖ±’îÄÙÄààÏ(ÄÅÖ›Ö•–Å±ΩÖëΩµµïπ—Ã°Ÿ•ëïΩ%ê§Ï(ÄÅÖ›Ö•–Å±ΩÖëA…Ωô•±î†§ÏÄººÅ¡Ω»ÅÕ§ÅÕ’∑ÃÅ¡’π—ΩÃÅ¡Ω»Å¡…•µï»ÅçΩµïπ—Ö…•º(ÄÅ’¡ëÖ—ï	Ö±ÖπçïU$†§Ï)Ù()ô’πç—•Ω∏Åç±ΩÕïΩµµïπ—Ã†§ÅÏ(ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ•òÄ°›…Ö¿§Å›…Ö¿π•ππï…!Q50ÄÙÄààÏ)Ù()ô’πç—•Ω∏Å…ïπëï…ŸÖ—Ö…!—µ∞°¡…Ωô•±î∞ÅÕ•Èî§ÅÏ(ÄÅÕ•ÈîÄÙÅÕ•ÈîÅÒÄÃ»Ï(ÄÅ•òÄ°¡…Ωô•±îπÖŸÖ—Ö…}’…∞§ÅÏ(ÄÄÄÅ…ï—’…∏ÅÄÒ•µúÅÕ…åÙàëÌïÕçÖ¡ï!—µ∞°¡…Ωô•±îπÖŸÖ—Ö…}’…∞•ÙàÅÖ±–ÙâÖŸÖ—Ö»àÅ±ΩÖë•πúÙâ±ÖÈ‰àÅëïçΩë•πúÙâÖÕÂπåàÅÕ—Â±îÙâ›•ë—†ËëÌÕ•Èïı¡‡ÏÅ°ï•ù°–ËëÌÕ•Èïı¡‡ÏÅâΩ…ëï»µ…Öë•’ÃË‘¿îÏÅΩâ©ïç–µô•–ÈçΩŸï»ÏÅŸï…—•çÖ∞µÖ±•ù∏Èµ•ëë±îÏà˘ÄÏ(ÄÅÙ(ÄÅ…ï—’…∏ÅÄÒÕ¡Ö∏ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËëÌ5Ö—†π…Ω’πê°Õ•ÈîÄ®Ä¿∏‡‘•ı¡‡ÏÅŸï…—•çÖ∞µÖ±•ù∏Èµ•ëë±îÏà¯ëÌ¡…Ωô•±îπÖŸÖ—Ö…}ïµΩ©§ÅÒÄã¬~:∞âÙΩÕ¡Ö∏˘ÄÏ)Ù()ô’πç—•Ω∏Åùï—A±Öπ	Öëùï!—µ∞°¡±Öπ%ê§ÅÏ(ÄÅ•òÄ°¡±Öπ%êÄÙÙÙÄâ¡±’Ãà§Å…ï—’…∏ÅÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÏÅôΩπ–µÕ•ÈîËƒ≈¡‡Ïà˚ä∂@ÅA±’ÃΩÕ¡Ö∏˘ÄÏ(ÄÅ•òÄ°¡±Öπ%êÄÙÙÙÄâë•ÖµÖπ—îà§Å…ï—’…∏ÅÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»Ëå›ëêÕôåÏÅôΩπ–µÕ•ÈîËƒ≈¡‡Ïà˚¬~J8Å•ÖµÖπ—îΩÕ¡Ö∏˘ÄÏ(ÄÅ…ï—’…∏ÄààÏ)Ù()ô’πç—•Ω∏Åùï—ŸÖ—Ö…I•πù±ÖÕÃ°¡±Öπ%ê§ÅÏ(ÄÅ•òÄ°¡±Öπ%êÄÙÙÙÄâ¡±’Ãà§Å…ï—’…∏Äâ¡±Ö∏µ¡±’ÃàÏ(ÄÅ•òÄ°¡±Öπ%êÄÙÙÙÄâë•ÖµÖπ—îà§Å…ï—’…∏Äâ¡±Ö∏µë•ÖµÖπ—îàÏ(ÄÅ…ï—’…∏ÄààÏ)Ù()ô’πç—•Ω∏Å…ïπëï…MΩç•Ö±%çΩπÃ°¡…Ωô•±î§ÅÏ(ÄÅçΩπÕ–ÅΩ›πΩππïç—ïëU…±ÃÄÙÅ¡…Ωô•±î¸π•êÄÙÙÙÅç’……ïπ—UÕï»¸π•êÄ¸ÅÏ(ÄÄÄÅÕΩç•Ö±}≠•ç¨È±Õï—Ωππïç—ïëM—…ïÖµA…Ωô•±ïU…∞†â≠•ç¨à§∞(ÄÄÄÅÕΩç•Ö±}—›•—ç†È±Õï—Ωππïç—ïëM—…ïÖµA…Ωô•±ïU…∞†â—›•—ç†à§(ÄÅÙÄËÅÌÙÏ(ÄÅçΩπÕ–ÅÕΩç•Ö±ÃÄÙÅl(ÄÄÄÅÏÅ≠ï‰ËÄâÕΩç•Ö±}≠•ç¨à∞Å•çΩ∏ËÄã¬~~àà∞Å±Öâï∞ËÄâ-•ç¨àÅÙ∞(ÄÄÄÅÏÅ≠ï‰ËÄâÕΩç•Ö±}—›•—ç†à∞Å•çΩ∏ËÄã¬~~åà∞Å±Öâï∞ËÄâQ›•—ç†àÅÙ∞(ÄÄÄÅÏÅ≠ï‰ËÄâÕΩç•Ö±}ÂΩ’—’âîà∞Å•çΩ∏ËÄã¬~R–à∞Å±Öâï∞ËÄâeΩ’Q’âîàÅÙ∞(ÄÄÄÅÏÅ≠ï‰ËÄâÕΩç•Ö±}—•≠—Ω¨à∞Å•çΩ∏ËÄãäj¨à∞Å±Öâï∞ËÄâQ•≠QΩ¨àÅÙ∞(ÄÄÄÅÏÅ≠ï‰ËÄâÕΩç•Ö±}•πÕ—Öù…Ö¥à∞Å•çΩ∏ËÄã¬~¶‹à∞Å±Öâï∞ËÄâ%πÕ—Öù…Ö¥àÅÙ(ÄÅtÏ(ÄÅçΩπÕ–ÅÖç—•ŸîÄÙÅÕΩç•Ö±ÃπµÖ¿°ÃÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–Å…Ö›U…∞ÄÙÅΩ›πΩππïç—ïëU…±ÕmÃπ≠ïÂtÅÒÅ¡…Ωô•±ïmÃπ≠ïÂtÅÒÄààÏ(ÄÄÄÅçΩπÕ–Å≠•ç≠°Öππï∞ÄÙÅÃπ≠ï‰ÄÙÙÙÄâÕΩç•Ö±}≠•ç¨àÄ¸Åùï—-•ç≠°Öππï±…ΩµU…∞°…Ö›U…∞§ÄËÄààÏ(ÄÄÄÅçΩπÕ–Å—›•—ç°°Öππï∞ÄÙÅÃπ≠ï‰ÄÙÙÙÄâÕΩç•Ö±}—›•—ç†àÄ¸Åùï—Q›•—ç°°Öππï±…ΩµU…∞°…Ö›U…∞§ÄËÄààÏ(ÄÄÄÅçΩπÕ–Å’…∞ÄÙÅ≠•ç≠°Öππï∞(ÄÄÄÄÄÄ¸ÅÅ°——¡ÃËºΩ≠•ç¨πçΩ¥ºëÌïπçΩëïUI%Ωµ¡Ωπïπ–°≠•ç≠°Öππï∞•ıÄ(ÄÄÄÄÄÄËÅ—›•—ç°°Öππï∞(ÄÄÄÄÄÄÄÄ¸ÅÅ°——¡ÃËºΩ››‹π—›•—ç†π—ÿºëÌïπçΩëïUI%Ωµ¡Ωπïπ–°—›•—ç°°Öππï∞•ıÄ(ÄÄÄÄÄÄÄÄËÅ…Ö›U…∞Ï(ÄÄÄÅ…ï—’…∏ÅÏÄ∏∏πÃ∞Å’…∞ÅÙÏ(ÄÅÙ§πô•±—ï»°ÃÄÙ¯ÅÏ(ÄÄÄÅ•òÄ°Ãπ≠ï‰ÄÙÙÙÄâÕΩç•Ö±}≠•ç¨à§Å…ï—’…∏ÄÑÖùï—-•ç≠°Öππï±…ΩµU…∞°Ãπ’…∞§Ï(ÄÄÄÅ•òÄ°Ãπ≠ï‰ÄÙÙÙÄâÕΩç•Ö±}—›•—ç†à§Å…ï—’…∏ÄÑÖùï—Q›•—ç°°Öππï±…ΩµU…∞°Ãπ’…∞§Ï(ÄÄÄÅ…ï—’…∏Å•ÕMÖôïU…∞°Ãπ’…∞§Ï(ÄÅÙ§Ï(ÄÅ•òÄ†ÖÖç—•Ÿîπ±ïπù—†§Å…ï—’…∏ÄààÏ(ÄÅ…ï—’…∏ÅÄÒë•ÿÅç±ÖÕÃÙâ±Ãµ¡…Ωô•±îµÕΩç•Ö±Ãà¯(ÄÄÄÄëÌÖç—•ŸîπµÖ¿°ÃÄÙ¯ÅÄÒÑÅç±ÖÕÃÙâ±Ãµ¡…Ωô•±îµÕΩç•Ö∞µ±•π¨àÅ°…ïòÙàëÌïÕçÖ¡ï!—µ∞°Ãπ’…∞•ÙàÅ—Ö…ùï–Ùâ}â±Öπ¨àÅ…ï∞ÙâπΩΩ¡ïπï»àÅ—•—±îÙàëÌÃπ±Öâï±ÙàÅΩπç±•ç¨Ùâ±ΩùMΩç•Ö±±•ç¨†úëÌ¡…Ωô•±îπ•ëÙú∞ÄúëÌÃπ±Öâï±Ùú§à¯ÒÕ¡Ö∏ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒŸ¡‡Ïà¯ëÌÃπ•çΩπÙΩÕ¡Ö∏¯ÒÕ¡Ö∏¯ëÌÃπ±Öâï±ÙΩÕ¡Ö∏¯ΩÑ˘Ä§π©Ω•∏†àà•Ù(ÄÄΩë•ÿ˘ÄÏ)Ù()ô’πç—•Ω∏Å±ΩùMΩç•Ö±±•ç¨°Ω›πï…%ê∞Å¡±Ö—ôΩ…¥§ÅÏ(ÄÅ•òÄ†ÖΩ›πï…%êÅÒÅΩ›πï…%êÄÙÙÙÅç’……ïπ—UÕï»¸π•ê§Å…ï—’…∏ÏÄººÅπºÅçΩπ—ÖµΩÃÅç±•çÃÅÑÅ—’ÃÅ¡…Ω¡•ÖÃÅ…ïëïÃ(ÄÅÕàπ…¡å†â±Ωù}ÕΩç•Ö±}ç±•ç¨à∞ÅÏÅ¡}Ω›πï…}•êËÅΩ›πï…%ê∞Å¡}¡±Ö—ôΩ…¥ËÅ¡±Ö—ôΩ…¥ÅÙ§πçÖ—ç†††§ÄÙ¯ÅÌÙ§Ï)Ù((ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ(ººÅAIÅQ$ÉäPÅŸ•ëïΩÃÅëïÕ—ÖçÖëΩÃΩÖπç±ÖëΩÃÅ¡Ω»ÅA±’ÃÅ‰Å•ÖµÖπ—î(ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ)ÖÕÂπåÅô’πç—•Ω∏Å…ïπëï…Ω…eΩ‘°…ïπëï…QΩ≠ï∏ÄÙÅ±ÕQÖâIïπëï…QΩ≠ï∏§ÅÏ(ÄÅçΩπÕ–ÅµÖ•∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÖ¡¡Y•ï‹à§Ï(ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄÒë•ÿÅ•êÙâôΩ…ÂΩ’1•Õ–à˘Ö…ùÖπëºÅëïÕ—ÖçÖëΩÃ∏∏∏Ωë•ÿ˘ÄÏ((ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅôïÖ—’…ïê∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âùï—}ôïÖ—’…ïë}Ÿ•ëïΩÃà§Ï(ÄÅ•òÄ°…ïπëï…QΩ≠ï∏ÄÑÙÙÅ±ÕQÖâIïπëï…QΩ≠ï∏ÅÒÅç’……ïπ—QÖàÄÑÙÙÄâôΩ…ÂΩ‘à§Å…ï—’…∏Ï(ÄÅçΩπÕ–Å±•Õ–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âôΩ…ÂΩ’1•Õ–à§Ï((ÄÅ•òÄ°ï……Ω»§ÅÏÅ±•Õ–π—ï·—Ωπ—ïπ–ÄÙÄâ……Ω»ÅçÖ…ùÖπëºÅëïÕ—ÖçÖëΩÃËÄàÄ¨Åï……Ω»πµïÕÕÖùîÏÅ…ï—’…∏ÏÅÙ(ÄÅ•òÄ†ÖôïÖ—’…ïêÅÒÄÖôïÖ—’…ïêπ±ïπù—†§ÅÏ(ÄÄÄÅ±•Õ–π•ππï…!Q50ÄÙÅÄÒë•ÿÅÕ—Â±îÙâ¡Öëë•πúË–¡¡‡Ä¿ÏÅ—ï·–µÖ±•ù∏Èçïπ—ï»Ïà¯(ÄÄÄÄÄÄÒ†ƒÅç±ÖÕÃÙâ¡Öùîµ—•—±îà˚är†ÅAÖ…ÑÅQ§Ω†ƒ¯(ÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§à˘QΩëÖ€µÑÅπºÅ°Ö‰ÅŸ•ëïΩÃÅëïÕ—ÖçÖëΩÃ∏Å1ΩÃÅ’Õ’Ö…•ΩÃÅA±’ÃÅ‰Å•ÖµÖπ—îÅ¡’ïëï∏ÅÖπç±Ö»Å±ΩÃÅÕ’ÂΩÃÅÖèÑÅëïÕëîÅ5§ÅAï…ô•∞∏Ω¿¯(ÄÄÄÄΩë•ÿ˘ÄÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅŸ•ëïΩÃÄÙÅôïÖ—’…ïêπµÖ¿°òÄÙ¯Ä°Ï(ÄÄÄÅ•êËÅòπŸ•ëïΩ}•ê∞Å—•—±îËÅòπ—•—±î∞ÅŸ•ëïΩ}’…∞ËÅòπŸ•ëïΩ}’…∞∞Å¡±Ö—ôΩ…¥ËÅòπ¡±Ö—ôΩ…¥∞(ÄÄÄÅ’Õï…}•êËÅòπΩ›πï…}•ê∞Å¡…Ωô•±ïÃËÅÏÅ’Õï…πÖµîËÅòπ’Õï…πÖµî∞Å¡±Öπ}•êËÅòπ¡±Öπ}•êÅÙ(ÄÅÙ§§Ï((ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅµÂ1•≠ïÃÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†âŸ•ëïΩ}±•≠ïÃà§πÕï±ïç–†âŸ•ëïΩ}•êà§πïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§π•∏†âŸ•ëïΩ}•êà∞ÅŸ•ëïΩÃπµÖ¿°ÿÄÙ¯Åÿπ•ê§§Ï(ÄÅ•òÄ°…ïπëï…QΩ≠ï∏ÄÑÙÙÅ±ÕQÖâIïπëï…QΩ≠ï∏ÅÒÅç’……ïπ—QÖàÄÑÙÙÄâôΩ…ÂΩ‘à§Å…ï—’…∏Ï(ÄÅçΩπÕ–Å±•≠ïëMï–ÄÙÅπï‹ÅMï–†°µÂ1•≠ïÃÅÒÅmt§πµÖ¿°∞ÄÙ¯Å∞πŸ•ëïΩ}•ê§§Ï((ÄÅ±•Õ–π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôïïêµŸï…—•çÖ∞àÅ•êÙâôïïëYï…—•çÖ∞à¯(ÄÄÄÄÄÄëÌŸ•ëïΩÃπµÖ¿†°ÿ∞Å§§ÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôïïêµ•—ï¥ëÌÿπ¡±Ö—ôΩ…¥ÄÙÙÙÄâ’¡±ΩÖêàÄ¸ÄàÅ±Ãµ’¡±ΩÖêµôïïêµ•—ï¥àÄËÄàâÙàÅëÖ—ÑµŸ•ëïºµ•êÙàëÌÿπ•ëÙà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôïïêµ¡°Ωπîà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÏÅ—Ω¿Ëƒ—¡‡ÏÅ±ïô–Ëƒ—¡‡ÏÅâÖç≠ù…Ω’πêÈ…ùâÑ†¿∞¿∞¿∞¿∏ÿ§ÏÅçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÏÅôΩπ–µÕ•ÈîËƒ≈¡‡ÏÅ¡Öëë•πúË—¡‡Äƒ¡¡‡ÏÅâΩ…ëï»µ…Öë•’ÃË»¡¡‡ÏÅËµ•πëï‡ËÿÏà˚¬~N0ÅïÕ—ÖçÖëºΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôïïêµïµâïêµô…ÖµîàÅ•êÙâïµâïê¥ëÌÿπ•ëÙà¯ëÌùï—µâïëA±Öçï°Ω±ëï…!—µ∞°ÿ•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôïïêµÖç—•ΩπÃà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙâôïïêµÖç—•Ω∏µâ—∏Å±Ãµ±•≠îµÖç—•Ω∏¥ÿƒƒÄëÌ±•≠ïëMï–π°ÖÃ°ÿπ•ê§Ä¸Äâ±•≠ïêàÄËÄàâÙàÅ•êÙâ±•≠î¥ëÌÿπ•ëÙàÅëÖ—Ñµ±Öâï∞ÙàëÌ±•≠ïëMï–π°ÖÃ°ÿπ•ê§Ä¸ÄâQîÅù’Õ—ÑàÄËÄâ5îÅù’Õ—ÑâÙàÅÖ…•Ñµ±Öâï∞ÙàëÌ±•≠ïëMï–π°ÖÃ°ÿπ•ê§Ä¸ÄâQîÅù’Õ—ÑàÄËÄâ5îÅù’Õ—ÑâÙàÅÖ…•Ñµ¡…ïÕÕïêÙàëÌ±•≠ïëMï–π°ÖÃ°ÿπ•ê•ÙàÅ—•—±îÙàëÌ±•≠ïëMï–π°ÖÃ°ÿπ•ê§Ä¸ÄâQîÅù’Õ—ÑàÄËÄâ5îÅù’Õ—ÑâÙàÅΩπç±•ç¨Ùâ°Öπë±ï1•≠î†úëÌÿπ•ëÙú§à¯ÒÕ¡Ö∏¯ëÌ±•≠ïëMï–π°ÖÃ°ÿπ•ê§Ä¸ÄãäfîàÄËÄãäfÑâÙΩÕ¡Ö∏¯Ò§¯ëÌ±•≠ïëMï–π°ÖÃ°ÿπ•ê§Ä¸ÄâQTÅ1%-àÄËÄâ1%-âÙΩ§¯Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙâôïïêµÖç—•Ω∏µâ—∏Å±ÃµçΩµµïπ–µÖç—•Ω∏¥ÿƒƒàÅëÖ—Ñµ±Öâï∞ÙâΩµïπ—Ö»àÅÖ…•Ñµ±Öâï∞Ùââ…•»ÅçΩµïπ—Ö…•ΩÃàÅ—•—±îÙâΩµïπ—Ö…•ΩÃàÅΩπç±•ç¨ÙâΩ¡ïπΩµµïπ—Ã†úëÌÿπ•ëÙú§à¯ÒÕ¡Ö∏˚¬~J∞ΩÕ¡Ö∏¯Ò§˘=59QHΩ§¯Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌ…ïπëï…I’π—•µïM°Ö…ï	’——Ω∏°ÿ•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôïïêµΩŸï…±Ö‰à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ—•—±îà¯ëÌïÕçÖ¡ï!—µ∞°ÿπ—•—±î•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÖ’—°Ω»àÅÕ—Â±îÙâç’…ÕΩ»È¡Ω•π—ï»ÏàÅΩπç±•ç¨ÙâŸ•ï›A’â±•çA…Ωô•±î†úëÌïÕçÖ¡ï!—µ∞°ÿπ¡…Ωô•±ïÃπ’Õï…πÖµî•Ùú§à¯ÒÕ¡Ö∏˘ ëÌïÕçÖ¡ï!—µ∞°ÿπ¡…Ωô•±ïÃπ’Õï…πÖµî•ÙΩÕ¡Ö∏¯ÄëÌùï—A±Öπ	Öëùï!—µ∞°ÿπ¡…Ωô•±ïÃπ¡±Öπ}•ê•ÙÄëÌ…ïπëï…±•ïπ—=…•ù•π	Öëùî°ÿπç±•ïπ—}Ω…•ù•∏•ÙÄÒÕ¡Ö∏Åç±ÖÕÃÙâôïïêµ¡±Ö—ôΩ…¥µç°•¿à¯ëÌïÕçÖ¡ï!—µ∞°ÿπ¡±Ö—ôΩ…¥•ÙΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±•Ÿîµ¡—ÃàÅ•êÙâ¡—Ã¥ëÌÿπ•ëÙà¯ÒÕ¡Ö∏Åç±ÖÕÃÙâµΩπºàÅ•êÙâÕïçÃ¥ëÌÿπ•ëÙà¯¡ÃΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌ§ÄÙÙÙÄ¿Ä¸ÅÄÒë•ÿÅç±ÖÕÃÙâôïïêµπ’ëùîà˘ïÕ±•ÎÑÅ°Öç•ÑÅÖ……•âÑÅ¡Ö…ÑÅï∞ÅÕ•ù’•ïπ—îÉäDΩë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÅÄ§π©Ω•∏†àà•Ù(ÄÄÄÄΩë•ÿ˘ÄÏ((ÄÅÕï—’¡ïïë=âÕï…Ÿï»°Ÿ•ëïΩÃ§Ï(ÄÅô•—5Ωâ•±ïïïëY•ï›¡Ω…–†âôïïëYï…—•çÖ∞à§Ï(ÄÅÕï—’¡Ω’â±ïQÖ¡1•≠î†§Ï(ÄÅÕï—’¡A’±±QΩIïô…ïÕ†°…ïπëï…Ω…eΩ‘§Ï(ÄÅÕï—’¡M›•¡ï9ÖŸ•ùÖ—•Ω∏†âôΩ…ÂΩ‘à∞ÅÏÅ…•ù°–ËÄâôïïêàÅÙ§Ï)Ù(()±ï–Å¡…ïŸ•Ω’ÕQÖâ	ïôΩ…ïA…Ωô•±îÄÙÄâôïïêàÏ((ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ(ººÅ%IQ=I%<ÅÅUMUI%=L(ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ)±ï–Å’Õï…Õ•…ïç—Ω…ÂMïÖ…ç°Q•µïΩ’–ÄÙÅπ’±∞Ï)±ï–Å’Õï…Õ•…ïç—Ω…ÂIï≈’ïÕ—QΩ≠ï∏ÄÙÄ¿Ï((ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ(ººÅ%IQ=LÄ°’Õ’Ö…•ΩÃÅï∏ÅŸ•ŸºÅÖ°Ω…Ñ§(ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ)±ï–Å±ÕΩππïç—ïë1•ŸïIïô…ïÕ°Q•µï»ÄÙÅπ’±∞Ï()ô’πç—•Ω∏ÅÕ—Ω¡Ωππïç—ïë1•ŸïIïô…ïÕ††§ÅÏ(ÄÅ•òÄ°±ÕΩππïç—ïë1•ŸïIïô…ïÕ°Q•µï»§ÅÏ(ÄÄÄÅç±ïÖ…%π—ï…ŸÖ∞°±ÕΩππïç—ïë1•ŸïIïô…ïÕ°Q•µï»§Ï(ÄÄÄÅ±ÕΩππïç—ïë1•ŸïIïô…ïÕ°Q•µï»ÄÙÅπ’±∞Ï(ÄÅÙ)Ù()ô’πç—•Ω∏ÅÕ—Ö…—Ωππïç—ïë1•ŸïIïô…ïÕ††§ÅÏ(ÄÅÕ—Ω¡Ωππïç—ïë1•ŸïIïô…ïÕ††§Ï(ÄÅ±ÕΩππïç—ïë1•ŸïIïô…ïÕ°Q•µï»ÄÙÅÕï—%π—ï…ŸÖ∞††§ÄÙ¯ÅÏ(ÄÄÄÅ•òÄ°ëΩç’µïπ–π°•ëëï∏ÅÒÅç’……ïπ—QÖàÄÑÙÙÄâë•…ïç—ΩÃà§Å…ï—’…∏Ï(ÄÄÄÅ±ÕAï…ôÖç°îπë•…ïç—ΩÃÄÙÅÏÅëÖ—ÑÈπ’±∞∞ÅÖ–Ë¿ÅÙÏ(ÄÄÄÅ…ïπëï…•…ïç—ΩÃ°±ÕQÖâIïπëï…QΩ≠ï∏§Ï(ÄÅÙ∞Ä»¿¿¿¿§Ï)Ù()ô’πç—•Ω∏Åùï—Q›•—ç°°Öππï±…ΩµU…∞°ŸÖ±’î§ÅÏ(ÄÅ—…‰ÅÏ(ÄÄÄÅçΩπÕ–Å¡Ö…ÕïêÄÙÅπï‹ÅUI0°M—…•πú°ŸÖ±’îÅÒÄàà§π—…•¥†§§Ï(ÄÄÄÅ•òÄ†Ñº°yÒp∏•—›•—ç°pπ—ÿêΩ§π—ïÕ–°¡Ö…Õïêπ°ΩÕ—πÖµî§§Å…ï—’…∏ÄààÏ(ÄÄÄÅçΩπÕ–Åç°Öππï∞ÄÙÅ¡Ö…Õïêπ¡Ö—°πÖµîπÕ¡±•–†àºà§πô•±—ï»°	ΩΩ±ïÖ∏•l¡tÅÒÄààÏ(ÄÄÄÅ…ï—’…∏ÄΩymÑµË¿¥Â}uÏÃ∞»’ÙêΩ§π—ïÕ–°ç°Öππï∞§Ä¸Åç°Öππï∞π—Ω1Ω›ï…ÖÕî†§ÄËÄààÏ(ÄÅÙÅçÖ—ç†Ä°|§ÅÏ(ÄÄÄÅ…ï—’…∏ÄààÏ(ÄÅÙ)Ù()ô’πç—•Ω∏Åùï—-•ç≠°Öππï±…ΩµU…∞°ŸÖ±’î§ÅÏ(ÄÅ—…‰ÅÏ(ÄÄÄÅçΩπÕ–Å¡Ö…ÕïêÄÙÅπï‹ÅUI0°M—…•πú°ŸÖ±’îÅÒÄàà§π—…•¥†§§Ï(ÄÄÄÅ•òÄ†Ñº°yÒqp∏•≠•ç≠qpπçΩ¥êΩ§π—ïÕ–°¡Ö…Õïêπ°ΩÕ—πÖµî§§Å…ï—’…∏ÄààÏ(ÄÄÄÅçΩπÕ–Åç°Öππï∞ÄÙÅ¡Ö…Õïêπ¡Ö—°πÖµîπÕ¡±•–†àºà§πô•±—ï»°	ΩΩ±ïÖ∏•l¡tÅÒÄààÏ(ÄÄÄÅ…ï—’…∏ÄΩymÑµË¿¥Â|∏µuÏ»∞‘¡ÙêΩ§π—ïÕ–°ç°Öππï∞§Ä¸Åç°Öππï∞π—Ω1Ω›ï…ÖÕî†§ÄËÄààÏ(ÄÅÙÅçÖ—ç†Ä°|§ÅÏ(ÄÄÄÅ…ï—’…∏ÄààÏ(ÄÅÙ)Ù()ô’πç—•Ω∏Åùï—eΩ’Q’âï°Öππï±U…∞°ŸÖ±’î§ÅÏ(ÄÅ—…‰ÅÏ(ÄÄÄÅçΩπÕ–Å¡Ö…ÕïêÄÙÅπï‹ÅUI0°M—…•πú°ŸÖ±’îÅÒÄàà§π—…•¥†§§Ï(ÄÄÄÅ•òÄ†Ñº°yÒp∏•ÂΩ’—’âïpπçΩ¥êΩ§π—ïÕ–°¡Ö…Õïêπ°ΩÕ—πÖµî§ÄòòÄÑº°yÒp∏•ÂΩ’—’pπâîêΩ§π—ïÕ–°¡Ö…Õïêπ°ΩÕ—πÖµî§§Å…ï—’…∏ÄààÏ(ÄÄÄÅ…ï—’…∏Å¡Ö…Õïêπ°…ïòÏ(ÄÅÙÅçÖ—ç†Ä°|§ÅÏÅ…ï—’…∏ÄààÏÅÙ)Ù()ô’πç—•Ω∏Åùï—Q•≠QΩ≠A…Ωô•±ïU…∞°ŸÖ±’î§ÅÏ(ÄÅ—…‰ÅÏ(ÄÄÄÅçΩπÕ–Å¡Ö…ÕïêÄÙÅπï‹ÅUI0°M—…•πú°ŸÖ±’îÅÒÄàà§π—…•¥†§§Ï(ÄÄÄÅ•òÄ†Ñº°yÒp∏•—•≠—Ω≠pπçΩ¥êΩ§π—ïÕ–°¡Ö…Õïêπ°ΩÕ—πÖµî§§Å…ï—’…∏ÄààÏ(ÄÄÄÅ…ï—’…∏Å¡Ö…Õïêπ°…ïòÏ(ÄÅÙÅçÖ—ç†Ä°|§ÅÏÅ…ï—’…∏ÄààÏÅÙ)Ù()ô’πç—•Ω∏Å±•ŸïA±Ö—ôΩ…µMï–°¡…Ωô•±î§ÅÏ(ÄÅçΩπÕ–ÅŸÖ±’ïÃÄÙÅM—…•πú°¡…Ωô•±î¸π±•Ÿï}¡±Ö—ôΩ…¥ÅÒÄàà§π—Ω1Ω›ï…ÖÕî†§πÕ¡±•–†ΩmyÑµÈt¨º§πô•±—ï»°	ΩΩ±ïÖ∏§Ï(ÄÅ•òÄ°¡…Ωô•±î¸πÂΩ’—’âï}•Õ}±•Ÿî§ÅŸÖ±’ïÃπ¡’Õ††âÂΩ’—’âîà§Ï(ÄÅ•òÄ°¡…Ωô•±î¸π—•≠—Ω≠}•Õ}±•Ÿî§ÅŸÖ±’ïÃπ¡’Õ††â—•≠—Ω¨à§Ï(ÄÅ…ï—’…∏Åπï‹ÅMï–°ŸÖ±’ïÃ§Ï)Ù()ô’πç—•Ω∏ÅïπÕ’…ï1•ŸïM—Ö…—±ï…—M—Â±ïÃ†§ÅÏ(ÄÅ•òÄ°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±Õ1•ŸïM—Ö…—±ï…—M—Â±ïÃà§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÕ—Â±îÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âÕ—Â±îà§Ï(ÄÅÕ—Â±îπ•êÄÙÄâ±Õ1•ŸïM—Ö…—±ï…—M—Â±ïÃàÏ(ÄÅÕ—Â±îπ—ï·—Ωπ—ïπ–ÄÙÅÄ(ÄÄÄÄπ±Ãµ›Ö—ç†µ•πÕ•ëïÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†ƒ–‘∞‹¿∞»‘‘∞∏‘‡§Ö•µ¡Ω…—Öπ–ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÃ’ëïú∞åŸê…ïî‡∞å‰ƒ–Ÿôò§Ö•µ¡Ω…—Öπ–ÌçΩ±Ω»ËçôôòÖ•µ¡Ω…—Öπ—Ù(ÄÄÄÄπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…—Ì¡ΩÕ•—•Ω∏Èô•·ïêÌËµ•πëï‡Ë»ƒ–‹–‡»‘¿¿Ì—Ω¿ÈµÖ‡†‹…¡‡±çÖ±å°ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µ—Ω¿§Ä¨Ä‘·¡‡§§Ì±ïô–Ë‘¿îÌ›•ë—†Èµ•∏†––¡¡‡±çÖ±å†ƒ¿¿îÄ¥Ä»—¡‡§§Ì—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ï`†¥‘¿î§Ìë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË‘…¡‡Ä≈ô»ÅÖ’—ºÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌùÖ¿Ëƒ≈¡‡Ì¡Öëë•πúËƒ≈¡‡Äƒ…¡‡ÌâΩ…ëï»µ…Öë•’ÃËƒ›¡‡ÌçΩ±Ω»ËçôôòÌ—ï·–µÖ±•ù∏È±ïô–ÌâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ·¡‡Ä‘’¡‡Å…ùâÑ†¿∞¿∞¿∞∏‘‘§ÌÖπ•µÖ—•Ω∏È±Õ1•Ÿï±ï…—%∏Ä∏’ÃÅç’â•åµâïÈ•ï»†∏ƒÿ∞ƒ∞∏Ã∞ƒ§ÅâΩ—†ÌΩŸï…ô±Ω‹È°•ëëïπÙ(ÄÄÄÄπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–π±ÃŸÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»‘‘∞ÿ»∞‰»∞∏–‡§ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÃ’ëïú±…ùâÑ†»¿∞»ÿ∞Ã‡∞∏‰‡§±…ùâÑ†‘¿∞ƒ»∞»‘∞∏‰‡§•Ùπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–π±Ã›ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏–‡§ÌâÖç≠ù…Ω’πêÈ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä¿Ä¿±…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»¿§±—…ÖπÕ¡Ö…ïπ–Ä–»î§±±•πïÖ»µù…Öë•ïπ–†ƒÃ’ëïú∞å¿ÿƒÿ…à∞åƒÿ¡ÑÃ»§ÌâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ·¡‡Äÿ¡¡‡Å…ùâÑ†¿∞¿∞¿∞∏ÿ»§∞¿Ä¿ÄÃ’¡‡Å…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒÿ•Ù(ÄÄÄÄπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–π±Ã‹ËÈÖô—ï…ÌçΩπ—ïπ–ËààÌ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÌ•πÕï–Ë¥‡¿îÄ¥»¿îÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒƒ¡ëïú±—…ÖπÕ¡Ö…ïπ–Ä–»î±…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»»§Ä–‰î±—…ÖπÕ¡Ö…ïπ–Ä‘ÿî§ÌÖπ•µÖ—•Ω∏È±Õ1•Ÿï±ï…—MçÖ∏Ä»∏…ÃÅ±•πïÖ»Å•πô•π•—îÌ¡Ω•π—ï»µïŸïπ—ÃÈπΩπïÙπ±Ãµ±•ŸîµÕ—Ö…–µÖŸÖ—Ö…Ì¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡ËƒÌ›•ë—†Ë–·¡‡Ì°ï•ù°–Ë–·¡‡Ìë•Õ¡±Ö‰Èù…•êÌ¡±Öçîµ•—ïµÃÈçïπ—ï»ÌâΩ…ëï»Ë…¡‡ÅÕΩ±•êÄçôòÃƒ’åÌâΩ…ëï»µ…Öë•’ÃË‘¿îÌâÖç≠ù…Ω’πêËåƒ¿ƒ‘»»ÌôΩπ–µÕ•ÈîË»—¡‡ÌΩŸï…ô±Ω‹È°•ëëï∏ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Äƒ·¡‡Å…ùâÑ†»‘‘∞–‰∞‰»∞∏Ã–•Ùπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–π±Ã‹Äπ±Ãµ±•ŸîµÕ—Ö…–µÖŸÖ—Ö…ÌâΩ…ëï»µçΩ±Ω»ËåÃÂî›ôòÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä»…¡‡Å…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏–‘•Ùπ±Ãµ±•ŸîµÕ—Ö…–µÖŸÖ—Ö»Å•µùÌ›•ë—†Ëƒ¿¿îÌ°ï•ù°–Ëƒ¿¿îÌΩâ©ïç–µô•–ÈçΩŸï…Ùπ±Ãµ±•ŸîµÕ—Ö…–µçΩ¡ÂÌ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡ËƒÌµ•∏µ›•ë—†Ë¿Ìë•Õ¡±Ö‰Èô±ï‡Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÌùÖ¿Ë…¡·Ùπ±Ãµ±•ŸîµÕ—Ö…–µçΩ¡‰ÅÕµÖ±±ÌçΩ±Ω»Ëçôò‹ƒ·êÌôΩπ–Ë‰¿¿Ä›¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏ƒ—ïµÙπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–π±Ã‹ÅÕµÖ±±ÌçΩ±Ω»Ëå‘·ïôôôÙπ±Ãµ±•ŸîµÕ—Ö…–µçΩ¡‰ÅÕ—…ΩπùÌôΩπ–µÕ•ÈîËƒÕ¡‡Ì›°•—îµÕ¡ÖçîÈπΩ›…Ö¿ÌΩŸï…ô±Ω‹È°•ëëï∏Ì—ï·–µΩŸï…ô±Ω‹Èï±±•¡Õ•ÕÙπ±Ãµ±•ŸîµÕ—Ö…–µçΩ¡‰ÅïµÌçΩ±Ω»ËçÖïà›å‡ÌôΩπ–µÕ•ÈîË·¡‡ÌôΩπ–µÕ—Â±îÈπΩ…µÖ±Ùπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–˘•Ì¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡ËƒÌ¡Öëë•πúËŸ¡‡Ä›¡‡ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌâÖç≠ù…Ω’πêËçôòÃƒ’åÌçΩ±Ω»ËçôôòÌôΩπ–Ë‰¿¿Ä›¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏¿·ï¥ÌôΩπ–µÕ—Â±îÈπΩ…µÖ∞ÌÖπ•µÖ—•Ω∏È±Õ1•ŸïA’±ÕîÄƒ∏≈ÃÅ•πô•π•—ïÙ(ÄÄÄÄπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–π¡±Ö—ôΩ…¥µ—›•—ç†˘•ÌâÖç≠ù…Ω’πêËå‰ƒ–ŸôôÙπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–π¡±Ö—ôΩ…¥µ—›•—ç†Äπ±Ãµ±•ŸîµÕ—Ö…–µÖŸÖ—Ö…ÌâΩ…ëï»µçΩ±Ω»ËçÑ‰‹¡ôôÙ(ÄÄÄÄπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–π¡±Ö—ôΩ…¥µ≠•ç¨˘•ÌâÖç≠ù…Ω’πêËå‘Õôåƒ‡ÌçΩ±Ω»Ëå¿‹ƒ¿¿ŸÙπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–π¡±Ö—ôΩ…¥µ≠•ç¨Äπ±Ãµ±•ŸîµÕ—Ö…–µÖŸÖ—Ö…ÌâΩ…ëï»µçΩ±Ω»Ëå‘Õôåƒ‡ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä»…¡‡Å…ùâÑ†‡Ã∞»‘»∞»–∞∏Ã–•Ù(ÄÄÄÄπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–π¡±Ö—ôΩ…¥µÂΩ’—’âî˘•ÌâÖç≠ù…Ω’πêËçôò¿¿ÃÕÙπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–π¡±Ö—ôΩ…¥µÂΩ’—’âîÄπ±Ãµ±•ŸîµÕ—Ö…–µÖŸÖ—Ö…ÌâΩ…ëï»µçΩ±Ω»Ëçôò¿¿ÃÕÙ(ÄÄÄÄπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–π¡±Ö—ôΩ…¥µ—•≠—Ω¨˘•ÌâÖç≠ù…Ω’πêËåƒƒƒÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÄåÃ’ò≈î’Ùπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–π¡±Ö—ôΩ…¥µ—•≠—Ω¨Äπ±Ãµ±•ŸîµÕ—Ö…–µÖŸÖ—Ö…ÌâΩ…ëï»µçΩ±Ω»ËåÃ’ò≈î’Ù(ÄÄÄÄπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–π¡±Ö—ôΩ…¥µâΩ—†˘•ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ¿¡ëïú∞å‘Õôåƒ‡Ä¿Ä–‡î∞å‰ƒ–ŸôòÄ‘»î§ÌçΩ±Ω»ËçôôôÙπ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–π¡±Ö—ôΩ…¥µâΩ—†Äπ±Ãµ±•ŸîµÕ—Ö…–µÖŸÖ—Ö…ÌâΩ…ëï»µçΩ±Ω»Ëçå‡·çôôÙ(ÄÄÄÅ≠ïÂô…ÖµïÃÅ±Õ1•ŸïA’±ÕïÏ‘¿ïÌΩ¡Öç•—‰Ë∏Ã‘Ì—…ÖπÕôΩ…¥ÈÕçÖ±î†∏‹‘•ıÙ(ÄÄÄÅ≠ïÂô…ÖµïÃÅ±Õ1•Ÿï±ï…—%πÌô…ΩµÌΩ¡Öç•—‰Ë¿Ì—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—î†¥‘¿î∞¥»—¡‡§ÅÕçÖ±î†∏‰–•ı—ΩÌΩ¡Öç•—‰ËƒÌ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—î†¥‘¿î∞¿§ÅÕçÖ±î†ƒ•ıı≠ïÂô…ÖµïÃÅ±Õ1•Ÿï±ï…—MçÖπÌ—ΩÌ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ï`†‹¿î•ıÙ(ÄÄÄÅ°—µ∞π±ÃÿµÖ¡¿µ…’π—•µîÅπÖŸÌ—Ω¿ÈµÖ‡†Ã¡¡‡±çÖ±å°ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µ—Ω¿§Ä¨ÄŸ¡‡§§Ö•µ¡Ω…—Öπ–ÌµÖ…ù•∏µ—Ω¿ÈµÖ‡†Ã¡¡‡±çÖ±å°ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µ—Ω¿§Ä¨ÄŸ¡‡§§Ö•µ¡Ω…—Öπ—Ù(ÄÅÄÏ(ÄÅëΩç’µïπ–π°ïÖêπÖ¡¡ïπë°•±ê°Õ—Â±î§Ï)Ù()ëΩç’µïπ–πÖëëŸïπ—1•Õ—ïπï»†â=5Ωπ—ïπ—1ΩÖëïêà∞ÅïπÕ’…ï1•ŸïM—Ö…—±ï…—M—Â±ïÃ§Ï((()ÖÕÂπåÅô’πç—•Ω∏Å…ïπëï…•…ïç—ΩÃ°…ïπëï…QΩ≠ï∏ÄÙÅ±ÕQÖâIïπëï…QΩ≠ï∏§ÅÏ(ÄÅÕ—Ö…—Ωππïç—ïë1•ŸïIïô…ïÕ††§Ï(ÄÅçΩπÕ–ÅµÖ•∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÖ¡¡Y•ï‹à§Ï(ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒ†ƒÅç±ÖÕÃÙâ¡Öùîµ—•—±îàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ë¿Ïà˚¬~R–Å•…ïç—ΩÃΩ†ƒ¯(ÄÄÄÄÒ¿Åç±ÖÕÃÙâ¡ÖùîµÕ’àà˘ïÕç’âÀ¥Å≈’ß•∏ÅïÕ”ÑÅï∏ÅŸ•ŸºÅï∏Å-•ç¨∞ÅQ›•—ç†∞ÅeΩ’Q’âîÅºÅQ•≠QΩ¨∏Ω¿¯(ÄÄÄÄÒë•ÿÅ•êÙâë•…ïç—ΩÕ1•Õ–à˘Ö…ùÖπëº∏∏∏Ωë•ÿ˘ÄÏ((ÄÄººÅΩπÕï…ŸÖµΩÃÅï·ç±’Õ•ŸÖµïπ—îÅ±ÑÅ•π—ïù…ÖçßÕ∏Åï·•Õ—ïπ—îÅëîÅ-•ç¨Å‰ÅQ›•—ç†∏(ÄÅçΩπÕ–ÅÏÅëÖ—ÑÈ±•ŸïUÕï…ÕÖ—ÑÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†â¡…Ωô•±ïÃà§(ÄÄÄÄπÕï±ïç–†â•ê±’Õï…πÖµî±ÖŸÖ—Ö…}ïµΩ©§±ÖŸÖ—Ö…}’…∞±¡±Öπ}•ê±±•Ÿï}¡±Ö—ôΩ…¥±±•Ÿï}Õ—Ö…—ïë}Ö–±ÕΩç•Ö±}≠•ç¨±ÕΩç•Ö±}—›•—ç†±ÕΩç•Ö±}ÂΩ’—’âî±ÕΩç•Ö±}—•≠—Ω¨±ÂΩ’—’âï}•Õ}±•Ÿî±ÂΩ’—’âï}±•Ÿï}Ÿ•ëïΩ}•ê±—•≠—Ω≠}•Õ}±•Ÿîà§(ÄÄÄÄπΩ»†â•Õ}±•Ÿîπïƒπ—…’î±ÂΩ’—’âï}•Õ}±•Ÿîπïƒπ—…’î±—•≠—Ω≠}•Õ}±•Ÿîπïƒπ—…’îà§(ÄÄÄÄπ•Ã†ââÖπ}…ïÖÕΩ∏à±π’±∞§(ÄÄÄÄπΩ…ëï»†â±•Ÿï}Õ—Ö…—ïë}Ö–à±ÌÖÕçïπë•πúÈôÖ±ÕïÙ§Ï((ÄÅçΩπÕ–Å±•ŸïUÕï…ÃÄÙÅ±•ŸïUÕï…ÕÖ—ÑÅÒÅmtÏ((ÄÅ•òÄ°…ïπëï…QΩ≠ï∏ÄÑÙÙÅ±ÕQÖâIïπëï…QΩ≠ï∏ÅÒÅç’……ïπ—QÖàÄÑÙÙÄâë•…ïç—ΩÃà§Å…ï—’…∏Ï(ÄÅçΩπÕ–Å±•Õ–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âë•…ïç—ΩÕ1•Õ–à§Ï(ÄÅ•òÄ†Ö±•Õ–§Å…ï—’…∏Ï((ÄÅ±ï–Å°—µ∞ÄÙÄààÏ((ÄÅ•òÄ°±•ŸïUÕï…Ãπ±ïπù—†§ÅÏ(ÄÄÄÅ°—µ∞Ä¨ÙÅÄÒÕïç—•Ω∏¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌùÖ¿Ëƒ¡¡‡ÌµÖ…ù•∏µâΩ——Ω¥ËÂ¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏Ë¿ÌôΩπ–µÕ•ÈîËƒ…¡‡Ì±ï——ï»µÕ¡Öç•πúË∏¿—ï¥Ïà˚¬~NËÅ%IQ=LÅ8Å1%YMI=10Ω†Ã¯(ÄÄÄÄÄÄÄÄÒÕ¡Ö∏ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘-%,É
‹ÅQ]%Q É
‹Åe=UQU	É
‹ÅQ%-Q=,ΩÕ¡Ö∏¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄëÌ±•ŸïUÕï…ÃπµÖ¿°‘ÄÙ¯ÅÏ(ÄÄÄÄÄÄÄÅçΩπÕ–Å¡±Ö—ôΩ…µÃÄÙÅ±•ŸïA±Ö—ôΩ…µMï–°‘§Ï(ÄÄÄÄÄÄÄÅçΩπÕ–Å¡±Ö—ôΩ…µ1Öâï∞ÄÙÅmlâ≠•ç¨à∞ã¬~~àÅ-•ç¨ât±lâ—›•—ç†à∞ã¬~~åÅQ›•—ç†ât±lâÂΩ’—’âîà∞ã¬~R–ÅeΩ’Q’âîât±lâ—•≠—Ω¨à∞ãäj¨ÅQ•≠QΩ¨âutπô•±—ï»†°m≠ïÂt§ÄÙ¯Å¡±Ö—ôΩ…µÃπ°ÖÃ°≠ï‰§§πµÖ¿†°l±±Öâï±t§ÄÙ¯Å±Öâï∞§π©Ω•∏†àÄ¨Äà§ÅÒÄã¬~R–Å∏ÅŸ•ŸºàÏ(ÄÄÄÄÄÄÄÅçΩπÕ–Å≠•ç≠°Öππï∞ÄÙÅùï—-•ç≠°Öππï±…ΩµU…∞°‘πÕΩç•Ö±}≠•ç¨§Ï(ÄÄÄÄÄÄÄÅçΩπÕ–Å—›•—ç°°Öππï∞ÄÙÅùï—Q›•—ç°°Öππï±…ΩµU…∞°‘πÕΩç•Ö±}—›•—ç†§Ï(ÄÄÄÄÄÄÄÅçΩπÕ–ÅÂΩ’—’âïU…∞ÄÙÅ‘πÂΩ’—’âï}±•Ÿï}Ÿ•ëïΩ}•êÄ¸ÅÅ°——¡ÃËºΩ››‹πÂΩ’—’âîπçΩ¥Ω›Ö—ç†˝ÿÙëÌïπçΩëïUI%Ωµ¡Ωπïπ–°‘πÂΩ’—’âï}±•Ÿï}Ÿ•ëïΩ}•ê•ıÄÄËÅùï—eΩ’Q’âï°Öππï±U…∞°‘πÕΩç•Ö±}ÂΩ’—’âî§Ï(ÄÄÄÄÄÄÄÅçΩπÕ–Å—•≠—Ω≠U…∞ÄÙÅùï—Q•≠QΩ≠A…Ωô•±ïU…∞°‘πÕΩç•Ö±}—•≠—Ω¨§Ï(ÄÄÄÄÄÄÄÅçΩπÕ–Å›Ö—ç°	’——ΩπÃÄÙÅl(ÄÄÄÄÄÄÄÄÄÅ¡±Ö—ôΩ…µÃπ°ÖÃ†â≠•ç¨à§ÄòòÅ≠•ç≠°Öππï∞(ÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒÑÅ°…ïòÙâ°——¡ÃËºΩ≠•ç¨πçΩ¥ºëÌïπçΩëïUI%Ωµ¡Ωπïπ–°≠•ç≠°Öππï∞•ÙàÅ—Ö…ùï–Ùâ}â±Öπ¨àÅ…ï∞ÙâπΩΩ¡ïπï»àÅç±ÖÕÃÙâ›Ö—ç†µâ—∏àÅÕ—Â±îÙâ—ï·–µëïçΩ…Ö—•Ω∏ÈπΩπîÏà˘Yï»Åï∏Å-•ç¨ΩÑ˘ÄÄËÄàà∞(ÄÄÄÄÄÄÄÄÄÅ¡±Ö—ôΩ…µÃπ°ÖÃ†â—›•—ç†à§ÄòòÅ—›•—ç°°Öππï∞(ÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒÑÅ°…ïòÙâ°——¡ÃËºΩ››‹π—›•—ç†π—ÿºëÌïπçΩëïUI%Ωµ¡Ωπïπ–°—›•—ç°°Öππï∞•ÙàÅ—Ö…ùï–Ùâ}â±Öπ¨àÅ…ï∞ÙâπΩΩ¡ïπï»àÅç±ÖÕÃÙâ›Ö—ç†µâ—∏Å±Ãµ›Ö—ç†µ•πÕ•ëîàÅÕ—Â±îÙâ—ï·–µëïçΩ…Ö—•Ω∏ÈπΩπîÏà˘Yï»Åï∏ÅQ›•—ç†ΩÑ˘ÄÄËÄàà∞(ÄÄÄÄÄÄÄÄÄÅ¡±Ö—ôΩ…µÃπ°ÖÃ†âÂΩ’—’âîà§ÄòòÅÂΩ’—’âïU…∞(ÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒÑÅ°…ïòÙàëÌïÕçÖ¡ï!—µ∞°ÂΩ’—’âïU…∞•ÙàÅ—Ö…ùï–Ùâ}â±Öπ¨àÅ…ï∞ÙâπΩΩ¡ïπï»àÅç±ÖÕÃÙâ›Ö—ç†µâ—∏àÅÕ—Â±îÙâ—ï·–µëïçΩ…Ö—•Ω∏ÈπΩπîÌâÖç≠ù…Ω’πêËçôò¿¿ÃÃÌçΩ±Ω»ËçôôòÏà˘Yï»Åï∏ÅeΩ’Q’âîΩÑ˘ÄÄËÄàà∞(ÄÄÄÄÄÄÄÄÄÅ¡±Ö—ôΩ…µÃπ°ÖÃ†â—•≠—Ω¨à§ÄòòÅ—•≠—Ω≠U…∞(ÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒÑÅ°…ïòÙàëÌïÕçÖ¡ï!—µ∞°—•≠—Ω≠U…∞•ÙàÅ—Ö…ùï–Ùâ}â±Öπ¨àÅ…ï∞ÙâπΩΩ¡ïπï»àÅç±ÖÕÃÙâ›Ö—ç†µâ—∏àÅÕ—Â±îÙâ—ï·–µëïçΩ…Ö—•Ω∏ÈπΩπîÌâÖç≠ù…Ω’πêËåƒƒƒÌçΩ±Ω»ËçôôòÌâΩ…ëï»µçΩ±Ω»ËåÃ’ò≈î‘Ïà˘Yï»Åï∏ÅQ•≠QΩ¨ΩÑ˘ÄÄËÄàà(ÄÄÄÄÄÄÄÅtπ©Ω•∏†àà§Ï(ÄÄÄÄÄÄÄÅ…ï—’…∏ÅÄÒë•ÿÅç±ÖÕÃÙâë•…ïç—ºµçÖ…êà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÖŸÖ—Ö»µ±úàÅΩπç±•ç¨ÙâŸ•ï›A’â±•çA…Ωô•±î†úëÌïÕçÖ¡ï!—µ∞°‘π’Õï…πÖµî•Ùú§àÅÕ—Â±îÙâç’…ÕΩ»È¡Ω•π—ï»Ïà¯ëÌ…ïπëï…ŸÖ—Ö…!—µ∞°‘∞‘»•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ•πôºàÅΩπç±•ç¨ÙâŸ•ï›A’â±•çA…Ωô•±î†úëÌïÕçÖ¡ï!—µ∞°‘π’Õï…πÖµî•Ùú§àÅÕ—Â±îÙâç’…ÕΩ»È¡Ω•π—ï»Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ’πÖµîà˘ ëÌïÕçÖ¡ï!—µ∞°‘π’Õï…πÖµî•ÙÄëÌùï—A±Öπ	Öëùï!—µ∞°‘π¡±Öπ}•ê•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡±Ö–à¯ëÌ¡±Ö—ôΩ…µ1Öâï±ÙÉ
‹Åï∏ÅŸ•ŸºΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÌùÖ¿ËŸ¡‡Ïà¯ëÌ›Ö—ç°	’——ΩπÕÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ˘ÄÏ(ÄÄÄÄÄÅÙ§π©Ω•∏†àà•Ù(ÄÄÄÄΩÕïç—•Ω∏˘ÄÏ(ÄÅÙ((ÄÅ•òÄ†Ö±•ŸïUÕï…Ãπ±ïπù—†§ÅÏ(ÄÄÄÅ°—µ∞ÄÙÅÄ(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÅµÖ…ù•∏µ—Ω¿Ëƒ…¡‡Ï(ÄÄÄÄÄÄÄÅ¡Öëë•πúË»…¡‡ÄƒŸ¡‡Ï(ÄÄÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ï(ÄÄÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒŸ¡‡Ï(ÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞§Ï(ÄÄÄÄÄÄÄÅ—ï·–µÖ±•ù∏Èçïπ—ï»Ï(ÄÄÄÄÄÄà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»·¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà˚¬~NÑΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿Ïà˘9ºÅ°Ö‰Åë•…ïç—ΩÃÅ√Èâ±•çΩÃÅÖ°Ω…ÑΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë’¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÅ’ÖπëºÅ’∏Åç…ïÖëΩ»Å•π•ç•îÅ’πÑÅ—…ÖπÕµ•ÕßÕ∏∞ÅŸÑÅÑÅÖ¡Ö…ïçï»ÅÖèÑ∏(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ˘ÄÏ(ÄÅÙ((ÄÅ±•Õ–π•ππï…!Q50ÄÙÅ°—µ∞Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å…ïπëï…UÕï…Õ•…ïç—Ω…‰†§ÅÏ(ÄÅïπÕ’…ï%ëïπ—•—Â·¡ï…•ïπçî‘‰ÕM—Â±ïÃ†§Ï(ÄÅçΩπÕ–ÅµÖ•∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÖ¡¡Y•ï‹à§Ï(ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒ†ƒÅç±ÖÕÃÙâ¡Öùîµ—•—±îà˚¬~FîÅUÕ’Ö…•ΩÃΩ†ƒ¯(ÄÄÄÄÒ¿Åç±ÖÕÃÙâ¡ÖùîµÕ’àà˘	’ÕèÑÅ¡ï…ÕΩπÖÃÅ‰ÅëïÕç’âÀ¥ÅÑÅ±ΩÃÅç…ïÖëΩ…ïÃÅëîÅ1•ŸïMç…Ω±∞∏Ω¿¯(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ’Õï…Ãµë•…ïç—Ω…‰µ—ÖâÃà¯(ÄÄÄÄÄÄÒâ’——Ω∏Å•êÙâ’Õï…Õ•±—ï…±∞àÅç±ÖÕÃÙââ—∏àÅΩπç±•ç¨ÙâÕï—UÕï…Õ•…ïç—Ω…ÂQÂ¡î†ù’Õï…Ãú§àÅÕ—Â±îÙâô±ï‡ËƒÌôΩπ–µÕ•ÈîËƒÕ¡‡Ì¡Öëë•πúËƒ≈¡‡Äƒ—¡‡Ïà˚¬~FîÅUÕ’Ö…•ΩÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÒâ’——Ω∏Å•êÙâ’Õï…Õ•±—ï……ïÖ—Ω…ÃàÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâÕï—UÕï…Õ•…ïç—Ω…ÂQÂ¡î†ùç…ïÖ—Ω…Ãú§àÅÕ—Â±îÙâô±ï‡ËƒÌôΩπ–µÕ•ÈîËƒÕ¡‡Ì¡Öëë•πúËƒ≈¡‡Äƒ—¡‡Ïà˚¬~:∞Å…ïÖëΩ…ïÃΩâ’——Ω∏¯(ÄÄÄÄΩë•ÿ¯(ÄÄÄÄÒ•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâ’Õï…MïÖ…ç°%π¡’–àÅç±ÖÕÃÙâ’Õï»µë•…ïç—Ω…‰µÕïÖ…ç†àÅ¡±Öçï°Ω±ëï»Ùâ	’ÕçÖ»Å¡Ω»ÅπΩµâ…îÅëîÅ’Õ’Ö…•º∏∏∏àÅΩπ•π¡’–Ùâ°Öπë±ïUÕï…MïÖ…ç°%π¡’–†§à¯(ÄÄÄÄÒë•ÿÅ•êÙâ’Õï…Õ•…ïç—Ω…Â1•Õ–à˘Ö…ùÖπëº∏∏∏Ωë•ÿ˘ÄÏ((ÄÅ›•πëΩ‹π}}’Õï…Õ•…ïç—Ω…ÂQÂ¡îÄÙÄâ’Õï…ÃàÏ(ÄÅÖ›Ö•–Å±ΩÖëUÕï…Õ•…ïç—Ω…‰†àà§Ï)Ù()ô’πç—•Ω∏ÅÕï—UÕï…Õ•…ïç—Ω…ÂQÂ¡î°—Â¡î§ÅÏ(ÄÅ›•πëΩ‹π}}’Õï…Õ•…ïç—Ω…ÂQÂ¡îÄÙÅ—Â¡îÄÙÙÙÄâç…ïÖ—Ω…ÃàÄ¸Äâç…ïÖ—Ω…ÃàÄËÄâ’Õï…ÃàÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â’Õï…Õ•±—ï…±∞à§¸πç±ÖÕÕ1•Õ–π—Ωùù±î†ââ—∏à∞Å›•πëΩ‹π}}’Õï…Õ•…ïç—Ω…ÂQÂ¡îÄÙÙÙÄâ’Õï…Ãà§Ï(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â’Õï…Õ•±—ï…±∞à§¸πç±ÖÕÕ1•Õ–π—Ωùù±î†ââ—∏µΩ’—±•πîà∞Å›•πëΩ‹π}}’Õï…Õ•…ïç—Ω…ÂQÂ¡îÄÑÙÙÄâ’Õï…Ãà§Ï(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â’Õï…Õ•±—ï……ïÖ—Ω…Ãà§¸πç±ÖÕÕ1•Õ–π—Ωùù±î†ââ—∏à∞Å›•πëΩ‹π}}’Õï…Õ•…ïç—Ω…ÂQÂ¡îÄÙÙÙÄâç…ïÖ—Ω…Ãà§Ï(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â’Õï…Õ•±—ï……ïÖ—Ω…Ãà§¸πç±ÖÕÕ1•Õ–π—Ωùù±î†ââ—∏µΩ’—±•πîà∞Å›•πëΩ‹π}}’Õï…Õ•…ïç—Ω…ÂQÂ¡îÄÑÙÙÄâç…ïÖ—Ω…Ãà§Ï(ÄÅ±ΩÖëUÕï…Õ•…ïç—Ω…‰°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â’Õï…MïÖ…ç°%π¡’–à§¸πŸÖ±’îπ—…•¥†§ÅÒÄàà§Ï)Ù()ô’πç—•Ω∏Å°Öπë±ïUÕï…MïÖ…ç°%π¡’–†§ÅÏ(ÄÅç±ïÖ…Q•µïΩ’–°’Õï…Õ•…ïç—Ω…ÂMïÖ…ç°Q•µïΩ’–§Ï(ÄÅçΩπÕ–Å•π¡’–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â’Õï…MïÖ…ç°%π¡’–à§Ï(ÄÅ•òÄ†Ö•π¡’–§Å…ï—’…∏Ï(ÄÅçΩπÕ–Å—ï…¥ÄÙÅ•π¡’–πŸÖ±’îπ—…•¥†§Ï(ÄÅ’Õï…Õ•…ïç—Ω…ÂMïÖ…ç°Q•µïΩ’–ÄÙÅÕï—Q•µïΩ’–††§ÄÙ¯Å±ΩÖëUÕï…Õ•…ïç—Ω…‰°—ï…¥§∞ÄÃ‘¿§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖëUÕï…Õ•…ïç—Ω…‰°—ï…¥§ÅÏ(ÄÅçΩπÕ–Å…ï≈’ïÕ—QΩ≠ï∏ÄÙÄ¨≠’Õï…Õ•…ïç—Ω…ÂIï≈’ïÕ—QΩ≠ï∏Ï(ÄÅçΩπÕ–Å±•Õ–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â’Õï…Õ•…ïç—Ω…Â1•Õ–à§Ï(ÄÅ•òÄ†Ö±•Õ–§Å…ï—’…∏Ï(ÄÅ±•Õ–π•ππï…!Q50ÄÙÄâ	’ÕçÖπëº∏∏∏àÏ((ÄÅ±ï–Å≈’ï…‰ÄÙÅÕàπô…Ω¥†â¡…Ωô•±ïÃà§(ÄÄÄÄπÕï±ïç–†â•ê∞Å’Õï…πÖµî∞ÅÖŸÖ—Ö…}ïµΩ©§∞ÅÖŸÖ—Ö…}’…∞∞Å¡±Öπ}•ê∞Å•Õ}±•Ÿî∞Å±•Ÿï}¡±Ö—ôΩ…¥∞Å•Õ}ç…ïÖ—Ω»à§(ÄÄÄÄπ•Ã†ââÖπ}…ïÖÕΩ∏à∞Åπ’±∞§(ÄÄÄÄππïƒ†â•êà∞Åç’……ïπ—UÕï»π•ê§(ÄÄÄÄπΩ…ëï»†â•Õ}±•Ÿîà∞ÅÏÅÖÕçïπë•πúËÅôÖ±ÕîÅÙ§(ÄÄÄÄπΩ…ëï»†â’Õï…πÖµîà§(ÄÄÄÄπ±•µ•–†–¿§Ï((ÄÅ•òÄ°—ï…¥§Å≈’ï…‰ÄÙÅ≈’ï…‰π•±•≠î†â’Õï…πÖµîà∞ÅÄîëÌ—ï…µÙïÄ§Ï(ÄÅ•òÄ°›•πëΩ‹π}}’Õï…Õ•…ïç—Ω…ÂQÂ¡îÄÙÙÙÄâç…ïÖ—Ω…Ãà§Å≈’ï…‰ÄÙÅ≈’ï…‰πïƒ†â•Õ}ç…ïÖ—Ω»à∞Å—…’î§Ï(ÄÅï±ÕîÅ≈’ï…‰ÄÙÅ≈’ï…‰πïƒ†â•Õ}ç…ïÖ—Ω»à∞ÅôÖ±Õî§Ï((ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅ’Õï…Ã∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–Å≈’ï…‰Ï(ÄÅ•òÄ°…ï≈’ïÕ—QΩ≠ï∏ÄÑÙÙÅ’Õï…Õ•…ïç—Ω…ÂIï≈’ïÕ—QΩ≠ï∏§Å…ï—’…∏Ï(ÄÅ•òÄ†ÖëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â’Õï…Õ•…ïç—Ω…Â1•Õ–à§§Å…ï—’…∏ÏÄººÅï∞Å’Õ’Ö…•ºÅÂÑÅçÖµâßÃÅëîÅ¡ïÕ—á≈Ñ(ÄÅ•òÄ°ï……Ω»§ÅÏÅ±•Õ–π•ππï…!Q50ÄÙÅÄÒ¿Åç±ÖÕÃÙâï……Ω»µµÕúà˘9ºÅÕîÅ¡’ëºÅçÖ…ùÖ»Å±ÑÅ±•Õ—ÑÅëîÅ’Õ’Ö…•ΩÃ∏Ω¿˘ÄÏÅ…ï—’…∏ÏÅÙ(ÄÅ•òÄ†Ö’Õï…ÃÅÒÄÖ’Õï…Ãπ±ïπù—†§ÅÏ(ÄÄÄÅ±•Õ–π•ππï…!Q50ÄÙÅÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒÕ¡‡Ïà˘9ºÅïπçΩπ—…ÖµΩÃÅ’Õ’Ö…•ΩÃëÌ—ï…¥Ä¸ÅÄÅ¡Ö…ÑÄàëÌïÕçÖ¡ï!—µ∞°—ï…¥•ÙâÄÄËÄàâÙ∏Ω¿˘ÄÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅ±•Õ–π•ππï…!Q50ÄÙÅ’Õï…ÃπµÖ¿°‘ÄÙ¯ÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ’Õï»µë•…ïç—Ω…‰µ…Ω‹àÅΩπç±•ç¨ÙâŸ•ï›A’â±•çA…Ωô•±î†úëÌïÕçÖ¡ï!—µ∞°‘π’Õï…πÖµî•Ùú§à¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÖŸÖ—Ö»µÕ¥ëÌ‘π•Õ}±•ŸîÄ¸ÄàÅÖŸÖ—Ö»µ±•Ÿîµ…•πúàÄËÄàâÙà¯ëÌ…ïπëï…ŸÖ—Ö…!—µ∞°‘∞Ä–¿•ÙΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ•πôºà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ’πÖµîàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ—¡‡Ïà¯ëÌ‘π•Õ}±•ŸîÄ¸ÅÄÒÕ¡Ö∏Åç±ÖÕÃÙâ±•ŸîµëΩ–µâÖëùîà¯ΩÕ¡Ö∏˘ÄÄËÄàâı ëÌïÕçÖ¡ï!—µ∞°‘π’Õï…πÖµî•ÙÄëÌùï—A±Öπ	Öëùï!—µ∞°‘π¡±Öπ}•ê•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ãµë•…ïç—Ω…‰µ…Ω±îÄëÌ‘π•Õ}ç…ïÖ—Ω»Ä¸Äâç…ïÖ—Ω»àÄËÄâ’Õï»âÙà¯ëÌ‘π•Õ}ç…ïÖ—Ω»Ä¸Äã¬~:∞Å…ïÖëΩ»àÄËÄã¬~FêÅUÕ’Ö…•ºâÙΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒŸ¡‡Ïà˚äËΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘Ä§π©Ω•∏†àà§Ï)Ù((()ô’πç—•Ω∏ÅΩ¡ïπµΩ©•ï—Ö•∞°πÖµî∞ÅïµΩ©§∞Å…Ö…•—‰ÄÙÄàà∞ÅΩâ—Ö•πïë–ÄÙÄàà∞ÅÕï…•Ö±9’µâï»ÄÙÄàà∞ÅÕ—Ωç≠QΩ—Ö∞ÄÙÄàà§ÅÏ(ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ•òÄ†Ö›…Ö¿§Å…ï—’…∏Ï((ÄÅçΩπÕ–Å…Ö…•—Â1Öâï∞ÄÙÅ…Ö…•—‰Ä¸Åùï—A…Ωô•±ï5ïëÖ±IÖ…•—Â1Öâï∞°…Ö…•—‰§ÄËÄâµΩ©§àÏ(ÄÅçΩπÕ–Å…Ö…•—Â±ÖÕÃÄÙÅ…Ö…•—‰Ä¸Åùï—A…Ωô•±ï5ïëÖ±IÖ…•—Â±ÖÕÃ°…Ö…•—‰§ÄËÄààÏ((ÄÅçΩπÕ–Å…Ö…•—ÂΩ±Ω»ÄÙ(ÄÄÄÅ…Ö…•—‰ÄÙÙÙÄâ…Ö…ÑàÄ¸Äàå›ëêÕôåàÄË(ÄÄÄÅ…Ö…•—‰ÄÙÙÙÄâï¡•çÑàÄ¸Äàçå¿‡—ôåàÄË(ÄÄÄÅ…Ö…•—‰ÄÙÙÙÄâ±ïùïπëÖ…•ÑàÄ¸Äàçôââò»–àÄË(ÄÄÄÅ…Ö…•—‰ÄÙÙÙÄâï·ç±’Õ•ŸÑàÄ¸Äàçôà‹ƒ‡‘àÄË(ÄÄÄÅ…Ö…•—‰ÄÙÙÙÄâçΩµ’∏àÄ¸Äàççâê’îƒàÄË(ÄÄÄÄâŸÖ»†¥µ—ï·–µë•¥§àÏ((ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µΩŸï…±Ö‰Å±ÃµµΩëÖ∞µ±Ωç≠ïêàÅÕ—Â±îÙâËµ•πëï‡Ë»–¿ÏàÅëÖ—ÑµµΩëÖ∞µ±Ωç≠ïêÙàƒà¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡àÅÕ—Â±îÙâµÖ‡µ›•ë—†ËÃ‰¡¡‡Ì—ï·–µÖ±•ù∏Èçïπ—ï»ÌΩŸï…ô±Ω‹È°•ëëï∏Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌ¡Öëë•πúË»·¡‡Ä»…¡‡Ä»¡¡‡ÌâÖç≠ù…Ω’πêË(ÄÄÄÄÄÄÄÄÄÅ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‘¿îÄƒ‘î∞ÄëÌ…Ö…•—ÂΩ±Ω…Ùƒ‡∞Å—…ÖπÕ¡Ö…ïπ–Ä–‡î§∞(ÄÄÄÄÄÄÄÄÄÅŸÖ»†¥µ¡Öπï∞§Ïà¯((ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅΩπç±•ç¨ÙâΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†§à(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÌ…•ù°–Ëƒ—¡‡Ì—Ω¿Ëƒ—¡‡Ì›•ë—†ËÃ·¡‡Ì°ï•ù°–ËÃ·¡‡ÌâΩ…ëï»µ…Öë•’ÃË‘¿îÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÌôΩπ–µÕ•ÈîËƒ›¡‡Ìç’…ÕΩ»È¡Ω•π—ï»Ïà˚ärTΩâ’——Ω∏¯((ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µôÖµ•±‰Ëù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌôΩπ–µÕ•ÈîËÂ¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿Ì±ï——ï»µÕ¡Öç•πúË∏ƒ—ï¥ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µâΩ——Ω¥Ëƒ›¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÅ1%YMI=10É
‹Å=11Q%=8(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ãµï≈’•¡¡ïêµµïëÖ∞ÄëÌ…Ö…•—Â±ÖÕÕÙà(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ›•ë—†Ë‰…¡‡Ì°ï•ù°–Ë‰…¡‡ÌµÖ…ù•∏Ë¿ÅÖ’—ºÄƒ’¡‡ÌôΩπ–µÕ•ÈîË‘…¡‡Ì¡Ω•π—ï»µïŸïπ—ÃÈπΩπîÏà¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌïµΩ©•Ù(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÒ†»ÅÕ—Â±îÙâµÖ…ù•∏Ë¿ÌôΩπ–µÕ•ÈîË»…¡‡Ïà¯ëÌïÕçÖ¡ï!—µ∞°πÖµîÅÒÄâµΩ©§à•ÙΩ†»¯((ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿Ì±ï——ï»µÕ¡Öç•πúË∏¿Âï¥Ì—ï·–µ—…ÖπÕôΩ…¥È’¡¡ï…çÖÕîÌçΩ±Ω»ËëÌ…Ö…•—ÂΩ±Ω…ÙÌµÖ…ù•∏µ—Ω¿Ë›¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌïÕçÖ¡ï!—µ∞°…Ö…•—Â1Öâï∞•Ù(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄëÌÕï…•Ö±9’µâï»ÄòòÅÕ—Ωç≠QΩ—Ö∞Ä¸ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰È•π±•πîµô±ï‡ÌµÖ…ù•∏µ—Ω¿ËƒÕ¡‡Ì¡Öëë•πúËŸ¡‡Äƒ¡¡‡ÌâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏»‘§ÌâÖç≠ù…Ω’πêÈ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿‘§ÌôΩπ–µôÖµ•±‰Ëù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌôΩπ–µÕ•ÈîËƒ¡¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅ1%5%QÄåëÌÕï…•Ö±9’µâï…ÙºëÌÕ—Ωç≠QΩ—Ö±Ù(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ˘ÄÄËÄàâÙ((ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâµÖ…ù•∏Ëƒ·¡‡ÅÖ’—ºÄ¿ÌµÖ‡µ›•ë—†Ë»‰¡¡‡Ì¡Öëë•πúËƒ…¡‡ÌâΩ…ëï»µ…Öë•’ÃËƒ…¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ì±•πîµ°ï•ù°–Ëƒ∏‘‘Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅµΩ©§ÅëïÕâ±Ω≈’ïÖëºÅ¡Ö…ÑÅ’ÕÖ»Åï∏Å—‘Å¡ï…ô•∞ÅëîÅ1•ŸïMç…Ω±∞∏(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌΩâ—Ö•πïë–Ä¸ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅ=â—ïπ•ëºÅï∞ÄëÌπï‹ÅÖ—î°Ωâ—Ö•πïë–§π—Ω1ΩçÖ±ïÖ—ïM—…•πú†âïÃµHà•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ¡Öëë•πúË¿Ä»…¡‡Ä»…¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏàÅΩπç±•ç¨ÙâΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†§à˘YΩ±Ÿï»ÅÑÅ5§ÅçΩ±ïççßÕ∏Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞°•π•—•Ö±•±—ï»ÄÙÄâÖ±∞à§ÅÏ(ÄÅçΩπÕ–ÅâÖëùïÃÄÙÅ›•πëΩ‹π}}µÂA…Ωô•±ï	ÖëùïÃÅÒÅmtÏ(ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ•òÄ†Ö›…Ö¿§Å…ï—’…∏Ï((ÄÅçΩπÕ–Ål(ÄÄÄÅÏÅëÖ—ÑËÅÕ—Ω…ï	ÖëùïÃÅÙ∞(ÄÄÄÅï≈’•¡¡ïê∞(ÄÄÄÅÏÅëÖ—ÑËÅâÖëùï±Ö•µÃÅÙ∞(ÄÄÄÅÏÅëÖ—ÑËÅ’π±Ωç≠ïëµΩ©•ÃÅÙ∞(ÄÄÄÅÏÅëÖ—ÑËÅÕ—Ω…ïµΩ©•ÃÅÙ∞(ÄÄÄÅÏÅëÖ—ÑËÅïµΩ©•±Ö•µÃÅÙ∞(ÄÄÄÅÏÅëÖ—ÑËÅ’π±Ωç≠ïë%—ïµÃÅÙ∞(ÄÄÄÅÏÅëÖ—ÑËÅ—•—±ï%—ïµÃÅÙ∞(ÄÄÄÅï≈’•¡¡ïëQ•—±î(ÄÅtÄÙÅÖ›Ö•–ÅA…Ωµ•ÕîπÖ±∞°l(ÄÄÄÅÕàπô…Ω¥†âÕ—Ω…ï}âÖëùïÃà§πÕï±ïç–†â•ê±âÖëùï}πÖµî±…Ö…•—‰±ëïÕç…•¡—•Ω∏±•Õ}±•µ•—ïê±Õ—Ωç≠}—Ω—Ö∞à§∞(ÄÄÄÅùï—≈’•¡¡ïëA…Ωô•±ï5ïëÖ±Ã°ç’……ïπ—UÕï»π•ê§∞(ÄÄÄÅÕàπô…Ω¥†â’Õï…}Õ—Ω…ï}âÖëùï}ç±Ö•µÃà§πÕï±ïç–†ââÖëùï}•ê±Õï…•Ö±}π’µâï»±ç±Ö•µïë}Ö–à§πïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§∞(ÄÄÄÅÕàπô…Ω¥†â’Õï…}’π±Ωç≠ïë}ïµΩ©•Ãà§πÕï±ïç–†âïµΩ©§à§πïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§∞(ÄÄÄÅÕàπô…Ω¥†âÕ—Ω…ï}ïµΩ©•Ãà§πÕï±ïç–†â•ê±ïµΩ©§±πÖµî±…Ö…•—‰±•Õ}±•µ•—ïê±Õ—Ωç≠}—Ω—Ö∞à§∞(ÄÄÄÅÕàπô…Ω¥†â’Õï…}Õ—Ω…ï}ïµΩ©•}ç±Ö•µÃà§πÕï±ïç–†âïµΩ©•}•ê±Õï…•Ö±}π’µâï»±ç±Ö•µïë}Ö–à§πïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§∞(ÄÄÄÅÕàπô…Ω¥†â’Õï…}’π±Ωç≠ïë}•—ïµÃà§πÕï±ïç–†â•—ïµ}•ê±’π±Ωç≠ïë}Ö–à§πïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§∞(ÄÄÄÅÕàπô…Ω¥†âÕ—Ω…ï}•—ïµÃà§πÕï±ïç–†â•ê±çÖ—ïùΩ…‰±•çΩ∏±πÖµî±…Ö…•—‰à§πïƒ†âçÖ—ïùΩ…‰à∞Äâ—•—±îà§∞(ÄÄÄÅùï—5ÂA…Ωô•±ïQ•—±î†§(ÄÅt§Ï((ÄÅçΩπÕ–ÅÕ—Ω…ï	Öëùï	Â9ÖµîÄÙÅÌÙÏ(ÄÄ°Õ—Ω…ï	ÖëùïÃÅÒÅmt§πôΩ…Öç†°àÄÙ¯ÅÏ(ÄÄÄÅÕ—Ω…ï	Öëùï	Â9ÖµïmM—…•πú°àπâÖëùï}πÖµîÅÒÄàà§π—Ω1Ω›ï…ÖÕî†•tÄÙÅàÏ(ÄÅÙ§Ï((ÄÅçΩπÕ–ÅâÖëùï±Ö•µ	Â%êÄÙÅÌÙÏ(ÄÄ°âÖëùï±Ö•µÃÅÒÅmt§πôΩ…Öç†°åÄÙ¯ÅÏÅâÖëùï±Ö•µ	Â%ëmåπâÖëùï}•ëtÄÙÅåÏÅÙ§Ï((ÄÅçΩπÕ–Åï≈’•¡¡ïëMï–ÄÙÅπï‹ÅMï–†°ï≈’•¡¡ïêÅÒÅmt§πµÖ¿°àÄÙ¯ÅàπâÖëùï}πÖµî§§Ï((ÄÅçΩπÕ–ÅπΩ…µÖ±•Èïë	ÖëùïÃÄÙÅâÖëùïÃπµÖ¿°àÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–Åµï—ÑÄÙÅÕ—Ω…ï	Öëùï	Â9ÖµïmM—…•πú°àπâÖëùï}πÖµîÅÒÄàà§π—Ω1Ω›ï…ÖÕî†•tÅÒÅÌÙÏ(ÄÄÄÅçΩπÕ–Å±Ö’πç°5ï—ÑÄÙÅùï—1•ŸïMç…Ω±∞Ÿ1Ö’πç°	Öëùï5ï—Ñ°àπâÖëùï}πÖµî§ÅÒÅÌÙÏ(ÄÄÄÅçΩπÕ–Åç±Ö•¥ÄÙÅâÖëùï±Ö•µ	Â%ëmµï—Ñπ•ëtÅÒÅÌÙÏ(ÄÄÄÅ…ï—’…∏ÅÏ(ÄÄÄÄÄÅ—Â¡îËââÖëùîà∞(ÄÄÄÄÄÅ•çΩ∏ÈàπâÖëùï}•çΩ∏ÅÒÄã¬~>à∞(ÄÄÄÄÄÅπÖµîÈàπâÖëùï}πÖµîÅÒÄâ5ïëÖ±±Ñà∞(ÄÄÄÄÄÅ…Ö…•—‰Èµï—Ñπ…Ö…•—‰ÅÒÅ±Ö’πç°5ï—Ñπ…Ö…•—‰ÅÒÅπ’±∞∞(ÄÄÄÄÄÅëïÕç…•¡—•Ω∏Èµï—ÑπëïÕç…•¡—•Ω∏ÅÒÅ±Ö’πç°5ï—ÑπëïÕç…•¡—•Ω∏ÅÒÄàà∞(ÄÄÄÄÄÅ•Õ}±•µ•—ïêËÑÖµï—Ñπ•Õ}±•µ•—ïêÅÒÄÑÖ±Ö’πç°5ï—Ñπ•Õ}±•µ•—ïê∞(ÄÄÄÄÄÅÕ—Ωç≠}—Ω—Ö∞Èµï—ÑπÕ—Ωç≠}—Ω—Ö∞ÅÒÅπ’±∞∞(ÄÄÄÄÄÅÕï…•Ö±}π’µâï»Èç±Ö•¥πÕï…•Ö±}π’µâï»ÅÒÅπ’±∞∞(ÄÄÄÄÄÅΩâ—Ö•πïë}Ö–Èç±Ö•¥πç±Ö•µïë}Ö–ÅÒÅàπïÖ…πïë}Ö–ÅÒÅπ’±∞∞(ÄÄÄÄÄÅï≈’•¡¡ïêÈï≈’•¡¡ïëMï–π°ÖÃ°àπâÖëùï}πÖµî§(ÄÄÄÅÙÏ(ÄÅÙ§Ï((ÄÅçΩπÕ–ÅïµΩ©•5ï—Ö	Â°Ö»ÄÙÅÌÙÏ(ÄÄ°Õ—Ω…ïµΩ©•ÃÅÒÅmt§πôΩ…Öç†°îÄÙ¯ÅÏÅïµΩ©•5ï—Ö	Â°Ö…mîπïµΩ©•tÄÙÅîÏÅÙ§Ï((ÄÅçΩπÕ–ÅïµΩ©•±Ö•µ	Â%êÄÙÅÌÙÏ(ÄÄ°ïµΩ©•±Ö•µÃÅÒÅmt§πôΩ…Öç†°åÄÙ¯ÅÏÅïµΩ©•±Ö•µ	Â%ëmåπïµΩ©•}•ëtÄÙÅåÏÅÙ§Ï((ÄÅçΩπÕ–ÅπΩ…µÖ±•ÈïëµΩ©•ÃÄÙÄ°’π±Ωç≠ïëµΩ©•ÃÅÒÅmt§πµÖ¿°îÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–Åµï—ÑÄÙÅïµΩ©•5ï—Ö	Â°Ö…mîπïµΩ©•tÅÒÅÌÙÏ(ÄÄÄÅçΩπÕ–Åç±Ö•¥ÄÙÅïµΩ©•±Ö•µ	Â%ëmµï—Ñπ•ëtÅÒÅÌÙÏ(ÄÄÄÅ…ï—’…∏ÅÏ(ÄÄÄÄÄÅ—Â¡îËâïµΩ©§à∞(ÄÄÄÄÄÅ•çΩ∏ÈîπïµΩ©§∞(ÄÄÄÄÄÅπÖµîÈµï—ÑππÖµîÅÒÄâµΩ©§à∞(ÄÄÄÄÄÅ…Ö…•—‰Èµï—Ñπ…Ö…•—‰ÅÒÅπ’±∞∞(ÄÄÄÄÄÅëïÕç…•¡—•Ω∏ËâµΩ©§ÅëïÕâ±Ω≈’ïÖëºÅ¡Ö…ÑÅ’ÕÖ»Åï∏Å—‘Å¡ï…ô•∞∏à∞(ÄÄÄÄÄÅ•Õ}±•µ•—ïêËÑÖµï—Ñπ•Õ}±•µ•—ïê∞(ÄÄÄÄÄÅÕ—Ωç≠}—Ω—Ö∞Èµï—ÑπÕ—Ωç≠}—Ω—Ö∞ÅÒÅπ’±∞∞(ÄÄÄÄÄÅÕï…•Ö±}π’µâï»Èç±Ö•¥πÕï…•Ö±}π’µâï»ÅÒÅπ’±∞∞(ÄÄÄÄÄÅΩâ—Ö•πïë}Ö–Èç±Ö•¥πç±Ö•µïë}Ö–ÅÒÅπ’±∞∞(ÄÄÄÄÄÅï≈’•¡¡ïêÈôÖ±Õî(ÄÄÄÅÙÏ(ÄÅÙ§Ï((ÄÅçΩπÕ–Å’π±Ωç≠ïë%—ïµ	Â%êÄÙÅÌÙÏ(ÄÄ°’π±Ωç≠ïë%—ïµÃÅÒÅmt§πôΩ…Öç†°§ÄÙ¯ÅÏÅ’π±Ωç≠ïë%—ïµ	Â%ëm§π•—ïµ}•ëtÄÙÅ§ÏÅÙ§Ï((ÄÅçΩπÕ–ÅπΩ…µÖ±•ÈïëQ•—±ïÃÄÙÄ°—•—±ï%—ïµÃÅÒÅmt§(ÄÄÄÄπô•±—ï»°–ÄÙ¯Å’π±Ωç≠ïë%—ïµ	Â%ëm–π•ët§(ÄÄÄÄπµÖ¿°–ÄÙ¯Ä°Ï(ÄÄÄÄÄÅ—Â¡îËâ—•—±îà∞(ÄÄÄÄÄÅ•—ïµ}•êÈ–π•ê∞(ÄÄÄÄÄÅ•çΩ∏È–π•çΩ∏ÅÒÄã¬~>ﬂæ‚<à∞(ÄÄÄÄÄÅπÖµîÈ–ππÖµîÅÒÄâSµ—’±ºà∞(ÄÄÄÄÄÅ…Ö…•—‰È–π…Ö…•—‰ÅÒÄâçΩµ’∏à∞(ÄÄÄÄÄÅëïÕç…•¡—•Ω∏ËâSµ—’±ºÅï≈’•¡Öâ±îÅ¡Ö…ÑÅµΩÕ—…Ö»ÅëïâÖ©ºÅëîÅ—‘ÅπΩµâ…î∏à∞(ÄÄÄÄÄÅ•Õ}±•µ•—ïêÈôÖ±Õî∞(ÄÄÄÄÄÅÕ—Ωç≠}—Ω—Ö∞Èπ’±∞∞(ÄÄÄÄÄÅÕï…•Ö±}π’µâï»Èπ’±∞∞(ÄÄÄÄÄÅΩâ—Ö•πïë}Ö–È’π±Ωç≠ïë%—ïµ	Â%ëm–π•ët¸π’π±Ωç≠ïë}Ö–ÅÒÅπ’±∞∞(ÄÄÄÄÄÅï≈’•¡¡ïêÈï≈’•¡¡ïëQ•—±î¸π•—ïµ}•êÄÙÙÙÅ–π•ê(ÄÄÄÅÙ§§Ï((ÄÅ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·%—ïµÃÄÙÅl∏∏ππΩ…µÖ±•Èïë	ÖëùïÃ∞Ä∏∏ππΩ…µÖ±•ÈïëµΩ©•Ã∞Ä∏∏ππΩ…µÖ±•ÈïëQ•—±ïÕtÏ(ÄÄººÅ1ÑÅçΩ±ïççßÕ∏ÅÕîÅ…ïçΩπÕ—…’ÂîÅëïÕëîÅM’¡ÖâÖÕîÅçÖëÑÅŸïËÅ≈’îÅÕîÅÖâ…î∞(ÄÄººÅïŸ•—ÖπëºÅµΩÕ—…Ö»ÅÕ—Ωç¨ΩÕï…•Ö±ïÃÅŸ•ï©ΩÃÅëïÕ¡◊•ÃÅëîÅ’πÑÅçΩµ¡…Ñ∏(ÄÅ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·•±—ï»ÄÙÅ•π•—•Ö±•±—ï»ÅÒÄâÖ±∞àÏ(ÄÅ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·IÖ…•—Â•±—ï»ÄÙÄâÖ±∞àÏ(ÄÅ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·MΩ…–ÄÙÄâ…Ö…•—‰àÏ((ÄÅçΩπÕ–ÅÖ±±%—ïµÃÄÙÅ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·%—ïµÃÏ((ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µΩŸï…±Ö‰Å±ÃµµΩëÖ∞µ±Ωç≠ïêàÅÕ—Â±îÙâËµ•πëï‡Ë»ƒ¿ÏàÅëÖ—ÑµµΩëÖ∞µ±Ωç≠ïêÙàƒà¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡àÅÕ—Â±îÙâµÖ‡µ›•ë—†Ë‘»¡¡‡ÌµÖ‡µ°ï•ù°–Ë‰¡ëŸ†ÌΩŸï…ô±Ω‹È°•ëëï∏Ìë•Õ¡±Ö‰Èô±ï‡Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µ°ïÖëï»àÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌùÖ¿Ëƒ…¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒ†»ÅÕ—Â±îÙâµÖ…ù•∏Ë¿ÌôΩπ–µÕ•ÈîËƒÂ¡‡Ïà˚¬~J8Å5§ÅçΩ±ïççßÕ∏Ω†»¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿ËÕ¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌÖ±±%—ïµÃπ±ïπù—°ÙÅΩâ©ï—ºëÌÖ±±%—ïµÃπ±ïπù—†ÙÙÙƒ¸ààËâÃâÙÉ
‹ÄëÌπΩ…µÖ±•Èïë	ÖëùïÃπ±ïπù—°ÙÅµïëÖ±±ÖÃÉ
‹ÄëÌπΩ…µÖ±•ÈïëµΩ©•Ãπ±ïπù—°ÙÅïµΩ©•ÃÉ
‹ÄëÌπΩ…µÖ±•ÈïëQ•—±ïÃπ±ïπù—°ÙÅ”µ—’±ΩÃ(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅΩπç±•ç¨Ùâç±ΩÕï5ÖπÖùïë5ΩëÖ∞†§à(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ›•ë—†Ë–¡¡‡Ì°ï•ù°–Ë–¡¡‡ÌâΩ…ëï»µ…Öë•’ÃË‘¿îÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÌôΩπ–µÕ•ÈîËƒ·¡‡Ìç’…ÕΩ»È¡Ω•π—ï»Ïà˚ärTΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µâΩë‰àÅÕ—Â±îÙâΩŸï…ô±Ω‹µ‰ÈÖ’—ºÏà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌùÖ¿Ë›¡‡Ìô±ï‡µ›…Ö¿È›…Ö¿ÌµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîÅ±ÃµçΩ±±ïç—•Ω∏µô•±—ï»ÅÖç—•ŸîàÅëÖ—Ñµô•±—ï»ÙâÖ±∞àÅΩπç±•ç¨ÙâÕï—Ω±±ïç—•Ω∏‘ÿ·•±—ï»†ùÖ±∞ú±—°•Ã§àÅÕ—Â±îÙâ¡Öëë•πúËŸ¡‡ÄÂ¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà˘QΩëΩÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîÅ±ÃµçΩ±±ïç—•Ω∏µô•±—ï»àÅëÖ—Ñµô•±—ï»ÙââÖëùîàÅΩπç±•ç¨ÙâÕï—Ω±±ïç—•Ω∏‘ÿ·•±—ï»†ùâÖëùîú±—°•Ã§àÅÕ—Â±îÙâ¡Öëë•πúËŸ¡‡ÄÂ¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà˘5ïëÖ±±ÖÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîÅ±ÃµçΩ±±ïç—•Ω∏µô•±—ï»àÅëÖ—Ñµô•±—ï»ÙâïµΩ©§àÅΩπç±•ç¨ÙâÕï—Ω±±ïç—•Ω∏‘ÿ·•±—ï»†ùïµΩ©§ú±—°•Ã§àÅÕ—Â±îÙâ¡Öëë•πúËŸ¡‡ÄÂ¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà˘µΩ©•ÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîÅ±ÃµçΩ±±ïç—•Ω∏µô•±—ï»àÅëÖ—Ñµô•±—ï»Ùâ—•—±îàÅΩπç±•ç¨ÙâÕï—Ω±±ïç—•Ω∏‘ÿ·•±—ï»†ù—•—±îú±—°•Ã§àÅÕ—Â±îÙâ¡Öëë•πúËŸ¡‡ÄÂ¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà˘Sµ—’±ΩÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîÅ±ÃµçΩ±±ïç—•Ω∏µô•±—ï»àÅëÖ—Ñµô•±—ï»Ùâ±•µ•—ïêàÅΩπç±•ç¨ÙâÕï—Ω±±ïç—•Ω∏‘ÿ·•±—ï»†ù±•µ•—ïêú±—°•Ã§àÅÕ—Â±îÙâ¡Öëë•πúËŸ¡‡ÄÂ¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà˘1•µ•—ÖëΩÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîÅ±ÃµçΩ±±ïç—•Ω∏µô•±—ï»àÅëÖ—Ñµô•±—ï»Ùâ—Ω¿àÅΩπç±•ç¨ÙâÕï—Ω±±ïç—•Ω∏‘ÿ·•±—ï»†ù—Ω¿ú±—°•Ã§àÅÕ—Â±îÙâ¡Öëë•πúËŸ¡‡ÄÂ¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà˘1ïùïπëÖ…•ΩÃ¨Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâµÖ…ù•∏Ë—¡‡Ä¿Äƒ…¡‡Ì¡Öëë•πúµ—Ω¿Ëƒ¡¡‡ÌâΩ…ëï»µ—Ω¿Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µôÖµ•±‰Ëù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌµÖ…ù•∏µâΩ——Ω¥ËŸ¡‡Ì—ï·–µ—…ÖπÕôΩ…¥È’¡¡ï…çÖÕîÌ±ï——ï»µÕ¡Öç•πúË∏¿·ï¥Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅIÖ…ïÈÑ(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅ•êÙâçΩ±±ïç—•Ω∏‘ÿ·IÖ…•—Â•±—ï…ÃàÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌùÖ¿ËŸ¡‡Ìô±ï‡µ›…Ö¿È›…Ö¿Ïà¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌùÖ¿Ëƒ¡¡‡ÌµÖ…ù•∏µâΩ——Ω¥ËƒÕ¡‡Ìô±ï‡µ›…Ö¿È›…Ö¿Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕï±ïç–Å•êÙâçΩ±±ïç—•Ω∏‘ÿ·MΩ…–àÅΩπç°ÖπùîÙâÕï—Ω±±ïç—•Ω∏‘ÿ·MΩ…–°—°•ÃπŸÖ±’î§à(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúË·¡‡Äƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÌôΩπ–µôÖµ•±‰È•π°ï…•–ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâ…Ö…•—‰à˘7ÖÃÅ…Ö…ΩÃΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâπï›ïÕ–à˘7ÖÃÅπ’ïŸΩÃΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâÕï…•Ö∞à˘;
ËÅëîÅïë•çßÕ∏ΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâπÖµîà˘9Ωµâ…îÅµhΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄΩÕï±ïç–¯((ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúËŸ¡‡Äƒ¡¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡ÏàÅΩπç±•ç¨ÙâΩ¡ïπ≈’•¡5ïëÖ±ÕAÖπï∞†§à˘ë•—Ö»Åµ•ÃÄÃÅµïëÖ±±ÖÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅ•êÙâçΩ±±ïç—•Ω∏‘ÿ·M’µµÖ…‰àÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡Ïà¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅ•êÙâçΩ±±ïç—•Ω∏‘ÿ·…•êà¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ((ÄÅçΩπÕ–Å•π•—•Ö±	—∏ÄÙÅëΩç’µïπ–π≈’ï…ÂMï±ïç—Ω»°Äπ±ÃµçΩ±±ïç—•Ω∏µô•±—ï…mëÖ—Ñµô•±—ï»ÙàëÌ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·•±—ï…ÙâuÄ§Ï(ÄÅëΩç’µïπ–π≈’ï…ÂMï±ïç—Ω…±∞†àπ±ÃµçΩ±±ïç—•Ω∏µô•±—ï»à§πôΩ…Öç†°â—∏ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–ÅÖç—•ŸîÄÙÅâ—∏ÄÙÙÙÅ•π•—•Ö±	—∏Ï(ÄÄÄÅâ—∏πç±ÖÕÕ1•Õ–π—Ωùù±î†âÖç—•Ÿîà∞ÅÖç—•Ÿî§Ï(ÄÄÄÅâ—∏πÕ—Â±îπâΩ…ëï…Ω±Ω»ÄÙÅÖç—•ŸîÄ¸ÄâŸÖ»†¥µùΩ±ê§àÄËÄààÏ(ÄÄÄÅâ—∏πÕ—Â±îπçΩ±Ω»ÄÙÅÖç—•ŸîÄ¸ÄâŸÖ»†¥µùΩ±ê§àÄËÄààÏ(ÄÅÙ§Ï((ÄÅ…ïπëï…Ω±±ïç—•Ω∏‘ÿ·IÖ…•—Â•±—ï…Ã°›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·•±—ï»§Ï(ÄÅ…ïπëï…Ω±±ïç—•Ω∏‘ÿ·…•ê†§Ï)Ù()ô’πç—•Ω∏ÅÕï—Ω±±ïç—•Ω∏‘ÿ·•±—ï»°ô•±—ï»∞Åâ’——Ω∏§ÅÏ(ÄÅ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·•±—ï»ÄÙÅô•±—ï»ÅÒÄâÖ±∞àÏ(ÄÅ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·IÖ…•—Â•±—ï»ÄÙÄâÖ±∞àÏ((ÄÅëΩç’µïπ–π≈’ï…ÂMï±ïç—Ω…±∞†àπ±ÃµçΩ±±ïç—•Ω∏µô•±—ï»à§πôΩ…Öç†°â—∏ÄÙ¯ÅÏ(ÄÄÄÅâ—∏πç±ÖÕÕ1•Õ–π—Ωùù±î†âÖç—•Ÿîà∞Åâ—∏ÄÙÙÙÅâ’——Ω∏§Ï(ÄÄÄÅâ—∏πÕ—Â±îπâΩ…ëï…Ω±Ω»ÄÙÅâ—∏ÄÙÙÙÅâ’——Ω∏Ä¸ÄâŸÖ»†¥µùΩ±ê§àÄËÄààÏ(ÄÄÄÅâ—∏πÕ—Â±îπçΩ±Ω»ÄÙÅâ—∏ÄÙÙÙÅâ’——Ω∏Ä¸ÄâŸÖ»†¥µùΩ±ê§àÄËÄààÏ(ÄÅÙ§Ï((ÄÅ…ïπëï…Ω±±ïç—•Ω∏‘ÿ·IÖ…•—Â•±—ï…Ã°›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·•±—ï»§Ï(ÄÅ…ïπëï…Ω±±ïç—•Ω∏‘ÿ·…•ê†§Ï)Ù()ô’πç—•Ω∏ÅÕï—Ω±±ïç—•Ω∏‘ÿ·IÖ…•—Â•±—ï»°ô•±—ï»∞Åâ’——Ω∏§ÅÏ(ÄÅ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·IÖ…•—Â•±—ï»ÄÙÅô•±—ï»ÅÒÄâÖ±∞àÏ((ÄÅëΩç’µïπ–π≈’ï…ÂMï±ïç—Ω…±∞†àπ±ÃµçΩ±±ïç—•Ω∏µ…Ö…•—‰µô•±—ï»à§πôΩ…Öç†°â—∏ÄÙ¯ÅÏ(ÄÄÄÅâ—∏πç±ÖÕÕ1•Õ–π—Ωùù±î†âÖç—•Ÿîà∞Åâ—∏ÄÙÙÙÅâ’——Ω∏§Ï(ÄÄÄÅâ—∏πÕ—Â±îπâΩ…ëï…Ω±Ω»ÄÙÅâ—∏ÄÙÙÙÅâ’——Ω∏Ä¸ÄâŸÖ»†¥µùΩ±ê§àÄËÄààÏ(ÄÄÄÅâ—∏πÕ—Â±îπçΩ±Ω»ÄÙÅâ—∏ÄÙÙÙÅâ’——Ω∏Ä¸ÄâŸÖ»†¥µùΩ±ê§àÄËÄààÏ(ÄÅÙ§Ï((ÄÅ…ïπëï…Ω±±ïç—•Ω∏‘ÿ·…•ê†§Ï)Ù()ô’πç—•Ω∏Å…ïπëï…Ω±±ïç—•Ω∏‘ÿ·IÖ…•—Â•±—ï…Ã°Öç—•ŸïQÂ¡î§ÅÏ(ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âçΩ±±ïç—•Ω∏‘ÿ·IÖ…•—Â•±—ï…Ãà§Ï(ÄÅ•òÄ†Ö›…Ö¿§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅÖ±∞ÄÙÅ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·%—ïµÃÅÒÅmtÏ(ÄÅçΩπÕ–ÅÕçΩ¡ïêÄÙÅlââÖëùîà∞âïµΩ©§à∞â—•—±îâtπ•πç±’ëïÃ°Öç—•ŸïQÂ¡î§(ÄÄÄÄ¸ÅÖ±∞πô•±—ï»°§ÄÙ¯Å§π—Â¡îÄÙÙÙÅÖç—•ŸïQÂ¡î§(ÄÄÄÄËÅÖ±∞Ï((ÄÅçΩπÕ–ÅÖŸÖ•±Öâ±îÄÙÅπï‹ÅMï–†§Ï(ÄÅÕçΩ¡ïêπôΩ…Öç†°•—ï¥ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–Å…Ö…•—‰ÄÙÅM—…•πú°•—ï¥π…Ö…•—‰ÅÒÄàà§π—Ω1Ω›ï…ÖÕî†§Ï(ÄÄÄÅ•òÄ°…Ö…•—‰§ÅÖŸÖ•±Öâ±îπÖëê°…Ö…•—‰§Ï(ÄÄÄÅ•òÄ°•—ï¥π•Õ}±•µ•—ïê§ÅÖŸÖ•±Öâ±îπÖëê†â±•µ•—ïêà§Ï(ÄÅÙ§Ï((ÄÅçΩπÕ–ÅΩ¡—•ΩπÃÄÙÅl(ÄÄÄÅlâÖ±∞à∞âQΩëΩÃât∞(ÄÄÄÅlâçΩµ’∏à∞âΩ∑È∏ât∞(ÄÄÄÅlâ…Ö…Ñà∞âIÖ…Ñât∞(ÄÄÄÅlâï¡•çÑà∞ã%¡•çÑât∞(ÄÄÄÅlâ±ïùïπëÖ…•Ñà∞â1ïùïπëÖ…•Ñât∞(ÄÄÄÅlâï·ç±’Õ•ŸÑà∞â·ç±’Õ•ŸÑât∞(ÄÄÄÅlâµ•—•çÑà∞â7µ—•çÑât∞(ÄÄÄÅlâ±•µ•—ïêà∞â1•µ•—ÖëÑât(ÄÅtπô•±—ï»†°m≠ïÂt§ÄÙ¯Å≠ï‰ÄÙÙÙÄâÖ±∞àÅÒÅÖŸÖ•±Öâ±îπ°ÖÃ°≠ï‰§§Ï((ÄÅ•òÄ†ÖΩ¡—•ΩπÃπÕΩµî†°m≠ïÂt§ÄÙ¯Å≠ï‰ÄÙÙÙÅ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·IÖ…•—Â•±—ï»§§ÅÏ(ÄÄÄÅ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·IÖ…•—Â•±—ï»ÄÙÄâÖ±∞àÏ(ÄÅÙ((ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅΩ¡—•ΩπÃπµÖ¿†°m≠ï‰±±Öâï±t§ÄÙ¯ÅÄ(ÄÄÄÄÒâ’——Ω∏(ÄÄÄÄÄÅç±ÖÕÃÙââ—∏µΩ’—±•πîÅ±ÃµçΩ±±ïç—•Ω∏µ…Ö…•—‰µô•±—ï»ÄëÌ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·IÖ…•—Â•±—ï»ÄÙÙÙÅ≠ï‰Ä¸ÄâÖç—•ŸîàÄËÄàâÙà(ÄÄÄÄÄÅΩπç±•ç¨ÙâÕï—Ω±±ïç—•Ω∏‘ÿ·IÖ…•—Â•±—ï»†úëÌ≠ïÂÙú±—°•Ã§à(ÄÄÄÄÄÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÅ¡Öëë•πúË’¡‡Ä·¡‡Ï(ÄÄÄÄÄÄÄÅôΩπ–µÕ•ÈîËÂ¡‡Ï(ÄÄÄÄÄÄÄÄëÌ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·IÖ…•—Â•±—ï»ÄÙÙÙÅ≠ï‰Ä¸ÄââΩ…ëï»µçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÏàÄËÄàâÙ(ÄÄÄÄÄÄà(ÄÄÄÄ¯ëÌ±Öâï±ÙΩâ’——Ω∏¯(ÄÅÄ§π©Ω•∏†àà§Ï)Ù()ô’πç—•Ω∏ÅÕï—Ω±±ïç—•Ω∏‘ÿ·MΩ…–°ÕΩ…–§ÅÏ(ÄÅ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·MΩ…–ÄÙÅÕΩ…–ÅÒÄâ…Ö…•—‰àÏ(ÄÅ…ïπëï…Ω±±ïç—•Ω∏‘ÿ·…•ê†§Ï)Ù()ô’πç—•Ω∏Å…ïπëï…Ω±±ïç—•Ω∏‘ÿ·…•ê†§ÅÏ(ÄÅçΩπÕ–Åù…•êÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âçΩ±±ïç—•Ω∏‘ÿ·…•êà§Ï(ÄÅçΩπÕ–ÅÕ’µµÖ…‰ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âçΩ±±ïç—•Ω∏‘ÿ·M’µµÖ…‰à§Ï(ÄÅ•òÄ†Öù…•ê§Å…ï—’…∏Ï((ÄÅçΩπÕ–Å…Ö…•—ÂIÖπ¨ÄÙÅÏÅµ•—•çÑËÿ∞Åï·ç±’Õ•ŸÑË‘∞Å±ïùïπëÖ…•ÑË–∞Åï¡•çÑËÃ∞Å…Ö…ÑË»∞ÅçΩµ’∏ËƒÅÙÏ(ÄÅçΩπÕ–Åô•±—ï»ÄÙÅ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·•±—ï»ÅÒÄâÖ±∞àÏ(ÄÅçΩπÕ–ÅÕΩ…–ÄÙÅ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·MΩ…–ÅÒÄâ…Ö…•—‰àÏ((ÄÅ±ï–Å•—ïµÃÄÙÅl∏∏∏°›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·%—ïµÃÅÒÅmt•tÏ((ÄÅ•òÄ°ô•±—ï»ÄÙÙÙÄââÖëùîà§Å•—ïµÃÄÙÅ•—ïµÃπô•±—ï»°§ÄÙ¯Å§π—Â¡îÄÙÙÙÄââÖëùîà§Ï(ÄÅ•òÄ°ô•±—ï»ÄÙÙÙÄâïµΩ©§à§Å•—ïµÃÄÙÅ•—ïµÃπô•±—ï»°§ÄÙ¯Å§π—Â¡îÄÙÙÙÄâïµΩ©§à§Ï(ÄÅ•òÄ°ô•±—ï»ÄÙÙÙÄâ—•—±îà§Å•—ïµÃÄÙÅ•—ïµÃπô•±—ï»°§ÄÙ¯Å§π—Â¡îÄÙÙÙÄâ—•—±îà§Ï(ÄÅ•òÄ°ô•±—ï»ÄÙÙÙÄâ±•µ•—ïêà§Å•—ïµÃÄÙÅ•—ïµÃπô•±—ï»°§ÄÙ¯Å§π•Õ}±•µ•—ïê§Ï(ÄÅ•òÄ°ô•±—ï»ÄÙÙÙÄâ—Ω¿à§Å•—ïµÃÄÙÅ•—ïµÃπô•±—ï»°§ÄÙ¯Ålâ±ïùïπëÖ…•Ñà∞âï·ç±’Õ•ŸÑà∞âµ•—•çÑâtπ•πç±’ëïÃ°§π…Ö…•—‰§§Ï((ÄÅçΩπÕ–Å…Ö…•—Â•±—ï»ÄÙÅ›•πëΩ‹π}}çΩ±±ïç—•Ω∏‘ÿ·IÖ…•—Â•±—ï»ÅÒÄâÖ±∞àÏ(ÄÅ•òÄ°…Ö…•—Â•±—ï»ÄÙÙÙÄâ±•µ•—ïêà§ÅÏ(ÄÄÄÅ•—ïµÃÄÙÅ•—ïµÃπô•±—ï»°§ÄÙ¯Å§π•Õ}±•µ•—ïê§Ï(ÄÅÙÅï±ÕîÅ•òÄ°…Ö…•—Â•±—ï»ÄÑÙÙÄâÖ±∞à§ÅÏ(ÄÄÄÅ•—ïµÃÄÙÅ•—ïµÃπô•±—ï»°§ÄÙ¯ÅM—…•πú°§π…Ö…•—‰ÅÒÄàà§π—Ω1Ω›ï…ÖÕî†§ÄÙÙÙÅ…Ö…•—Â•±—ï»§Ï(ÄÅÙ((ÄÅ•òÄ°ÕΩ…–ÄÙÙÙÄâ…Ö…•—‰à§ÅÏ(ÄÄÄÅ•—ïµÃπÕΩ…–†°Ñ±à§ÄÙ¯ÅÏ(ÄÄÄÄÄÅçΩπÕ–Å…Ö…•—Â•ôòÙ°…Ö…•—ÂIÖπ≠màπ…Ö…•—ÂuÒ¿§¥°…Ö…•—ÂIÖπ≠mÑπ…Ö…•—ÂuÒ¿§Ï(ÄÄÄÄÄÅ•òÄ°…Ö…•—Â•ôò§Å…ï—’…∏Å…Ö…•—Â•ôòÏ(ÄÄÄÄÄÅ…ï—’…∏Åπï‹ÅÖ—î°àπΩâ—Ö•πïë}Ö–ÅÒÄ¿§µπï‹ÅÖ—î°ÑπΩâ—Ö•πïë}Ö–ÅÒÄ¿§Ï(ÄÄÄÅÙ§Ï(ÄÅÙ((ÄÅ•òÄ°ÕΩ…–ÄÙÙÙÄâπï›ïÕ–à§ÅÏ(ÄÄÄÅ•—ïµÃπÕΩ…–†°Ñ±à§ÄÙ¯Åπï‹ÅÖ—î°àπΩâ—Ö•πïë}Ö–ÅÒÄ¿§µπï‹ÅÖ—î°ÑπΩâ—Ö•πïë}Ö–ÅÒÄ¿§§Ï(ÄÅÙ((ÄÅ•òÄ°ÕΩ…–ÄÙÙÙÄâÕï…•Ö∞à§ÅÏ(ÄÄÄÅ•—ïµÃπÕΩ…–†°Ñ±à§ÄÙ¯ÅÏ(ÄÄÄÄÄÅçΩπÕ–ÅÖ!ÖÃÄÙÅ9’µâï»π•Õ•π•—î°9’µâï»°ÑπÕï…•Ö±}π’µâï»§§ÄòòÅ9’µâï»°ÑπÕï…•Ö±}π’µâï»§Ä¯Ä¿Ï(ÄÄÄÄÄÅçΩπÕ–Åâ!ÖÃÄÙÅ9’µâï»π•Õ•π•—î°9’µâï»°àπÕï…•Ö±}π’µâï»§§ÄòòÅ9’µâï»°àπÕï…•Ö±}π’µâï»§Ä¯Ä¿Ï(ÄÄÄÄÄÅ•òÄ°Ö!ÖÃÄòòÄÖâ!ÖÃ§Å…ï—’…∏Ä¥ƒÏ(ÄÄÄÄÄÅ•òÄ†ÖÖ!ÖÃÄòòÅâ!ÖÃ§Å…ï—’…∏ÄƒÏ(ÄÄÄÄÄÅ•òÄ°Ö!ÖÃÄòòÅâ!ÖÃ§Å…ï—’…∏Å9’µâï»°ÑπÕï…•Ö±}π’µâï»§µ9’µâï»°àπÕï…•Ö±}π’µâï»§Ï(ÄÄÄÄÄÅ…ï—’…∏Ä°…Ö…•—ÂIÖπ≠màπ…Ö…•—ÂuÒ¿§¥°…Ö…•—ÂIÖπ≠mÑπ…Ö…•—ÂuÒ¿§Ï(ÄÄÄÅÙ§Ï(ÄÅÙ((ÄÅ•òÄ°ÕΩ…–ÄÙÙÙÄâπÖµîà§ÅÏ(ÄÄÄÅ•—ïµÃπÕΩ…–†°Ñ±à§ÄÙ¯ÅM—…•πú°ÑππÖµîÅÒÄàà§π±ΩçÖ±ïΩµ¡Ö…î°M—…•πú°àππÖµîÅÒÄàà§∞ÄâïÃà§§Ï(ÄÅÙ((ÄÅ•òÄ°Õ’µµÖ…‰§ÅÏ(ÄÄÄÅçΩπÕ–Å±Öâï±ÃÄÙÅÏ(ÄÄÄÄÄÅÖ±∞ËâQΩëΩÃà∞(ÄÄÄÄÄÅâÖëùîËâ5ïëÖ±±ÖÃà∞(ÄÄÄÄÄÅïµΩ©§ËâµΩ©•Ãà∞(ÄÄÄÄÄÅ—•—±îËâSµ—’±ΩÃà∞(ÄÄÄÄÄÅ±•µ•—ïêËâ1•µ•—ÖëΩÃà∞(ÄÄÄÄÄÅ—Ω¿Ëâ1ïùïπëÖ…•ΩÃ∞Åï·ç±’Õ•ŸΩÃÅ‰Å∑µ—•çΩÃà(ÄÄÄÅÙÏ(ÄÄÄÅçΩπÕ–Å…Ö…•—Â1Öâï±ÃÄÙÅÏ(ÄÄÄÄÄÅÖ±∞ËâQΩëΩÃà∞(ÄÄÄÄÄÅçΩµ’∏ËâΩ∑È∏à∞(ÄÄÄÄÄÅ…Ö…ÑËâIÖ…Ñà∞(ÄÄÄÄÄÅï¡•çÑËã%¡•çÑà∞(ÄÄÄÄÄÅ±ïùïπëÖ…•ÑËâ1ïùïπëÖ…•Ñà∞(ÄÄÄÄÄÅï·ç±’Õ•ŸÑËâ·ç±’Õ•ŸÑà∞(ÄÄÄÄÄÅµ•—•çÑËâ7µ—•çÑà∞(ÄÄÄÄÄÅ±•µ•—ïêËâ1•µ•—ÖëÑà(ÄÄÄÅÙÏ(ÄÄÄÅçΩπÕ–Å…Ö…•—ÂQï·–ÄÙÅ…Ö…•—Â•±—ï»ÄÙÙÙÄâÖ±∞à(ÄÄÄÄÄÄ¸Äàà(ÄÄÄÄÄÄËÅÄÉ
‹ÄëÌ…Ö…•—Â1Öâï±Õm…Ö…•—Â•±—ï…tÅÒÅ…Ö…•—Â•±—ï…ıÄÏ(ÄÄÄÅÕ’µµÖ…‰π—ï·—Ωπ—ïπ–ÄÙÅÄëÌ±Öâï±Õmô•±—ï…tÅÒÄâQΩëΩÃâÙëÌ…Ö…•—ÂQï·—ÙÉ
‹ÄëÌ•—ïµÃπ±ïπù—°ÙÅ…ïÕ’±—ÖëºëÌ•—ïµÃπ±ïπù—†ÙÙÙƒ¸ààËâÃâıÄÏ(ÄÅÙ((ÄÅ•òÄ†Ö•—ïµÃπ±ïπù—†§ÅÏ(ÄÄÄÅù…•êπ•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ—ï·–µÖ±•ù∏Èçïπ—ï»Ì¡Öëë•πúË»·¡‡Äƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîËƒ…¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÃŸ¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà˚¬~J8Ωë•ÿ¯(ÄÄÄÄÄÄÄÅ9ºÅ°Ö‰ÅΩâ©ï—ΩÃÅ≈’îÅçΩ•πç•ëÖ∏ÅçΩ∏ÅïÕ—îÅô•±—…º∏(ÄÄÄÄÄÄΩë•ÿ˘ÄÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–Å…ïπëï…%—ï¥ÄÙÄ°•—ï¥§ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–Å…Ö…•—Â±ÖÕÃı•—ï¥π…Ö…•—‰Ä¸Åùï—A…Ωô•±ï5ïëÖ±IÖ…•—Â±ÖÕÃ°•—ï¥π…Ö…•—‰§ÄËÄààÏ(ÄÄÄÅçΩπÕ–Å…Ö…•—Â1Öâï∞ı•—ï¥π…Ö…•—‰(ÄÄÄÄÄÄ¸Åùï—A…Ωô•±ï5ïëÖ±IÖ…•—Â1Öâï∞°•—ï¥π…Ö…•—‰§(ÄÄÄÄÄÄËÅ•—ï¥π—Â¡îÙÙÙâïµΩ©§à(ÄÄÄÄÄÄÄÄ¸ÄâµΩ©§à(ÄÄÄÄÄÄÄÄËÅ•—ï¥π—Â¡îÙÙÙâ—•—±îà(ÄÄÄÄÄÄÄÄÄÄ¸ÄâSµ—’±ºà(ÄÄÄÄÄÄÄÄÄÄËÄâ1Ωù…ºàÏ(ÄÄÄÅçΩπÕ–Å…Ö…•—ÂΩ±Ω»ÄÙ(ÄÄÄÄÄÅ•—ï¥π…Ö…•—‰ÄÙÙÙÄâ…Ö…ÑàÄ¸Äàå›ëêÕôåàÄË(ÄÄÄÄÄÅ•—ï¥π…Ö…•—‰ÄÙÙÙÄâï¡•çÑàÄ¸Äàçå¿‡—ôåàÄË(ÄÄÄÄÄÅ•—ï¥π…Ö…•—‰ÄÙÙÙÄâ±ïùïπëÖ…•ÑàÄ¸Äàçôââò»–àÄË(ÄÄÄÄÄÅ•—ï¥π…Ö…•—‰ÄÙÙÙÄâï·ç±’Õ•ŸÑàÄ¸Äàçôà‹ƒ‡‘àÄË(ÄÄÄÄÄÅ•—ï¥π…Ö…•—‰ÄÙÙÙÄâµ•—•çÑàÄ¸ÄàçôòÃÿ’êàÄË(ÄÄÄÄÄÅ•—ï¥π…Ö…•—‰ÄÙÙÙÄâçΩµ’∏àÄ¸Äàççâê’îƒàÄË(ÄÄÄÄÄÄâŸÖ»†¥µ—ï·–µë•¥§àÏ((ÄÄÄÅçΩπÕ–ÅΩπç±•ç¨ÄÙÅ•—ï¥π—Â¡îÄÙÙÙÄââÖëùîà(ÄÄÄÄÄÄ¸ÅÅΩ¡ïπ5ïëÖ±ï—Ö•∞†úëÌïÕçÖ¡ï!—µ∞°•—ï¥ππÖµî•Ùú∞úëÌïÕçÖ¡ï!—µ∞°•—ï¥π•çΩ∏•Ùú∞úëÌïÕçÖ¡ï!—µ∞°•—ï¥π…Ö…•—‰ÅÒÄàà•Ùú∞úëÌïÕçÖ¡ï!—µ∞°•—ï¥πëïÕç…•¡—•Ω∏ÅÒÄàà•Ùú∞úëÌïÕçÖ¡ï!—µ∞°•—ï¥πΩâ—Ö•πïë}Ö–ÅÒÄàà•Ùú∞úëÌïÕçÖ¡ï!—µ∞°•—ï¥πÕï…•Ö±}π’µâï»ÅÒÄàà•Ùú∞úëÌïÕçÖ¡ï!—µ∞°•—ï¥πÕ—Ωç≠}—Ω—Ö∞ÅÒÄàà•Ùú•Ä(ÄÄÄÄÄÄËÅ•—ï¥π—Â¡îÄÙÙÙÄâ—•—±îà(ÄÄÄÄÄÄÄÄ¸ÅÅΩ¡ïπQ•—±ïï—Ö•∞†úëÌ•—ï¥π•—ïµ}•ëÙú∞úëÌïÕçÖ¡ï!—µ∞°•—ï¥ππÖµî•Ùú∞úëÌïÕçÖ¡ï!—µ∞°•—ï¥π•çΩ∏•Ùú∞ëÌ•—ï¥πï≈’•¡¡ïêÄ¸Äâ—…’îàÄËÄâôÖ±ÕîâÙ∞úëÌïÕçÖ¡ï!—µ∞°•—ï¥πΩâ—Ö•πïë}Ö–ÅÒÄàà•Ùú∞úëÌïÕçÖ¡ï!—µ∞°•—ï¥π…Ö…•—‰ÅÒÄâçΩµ’∏à•Ùú•Ä(ÄÄÄÄÄÄÄÄËÅÅΩ¡ïπµΩ©•ï—Ö•∞†úëÌïÕçÖ¡ï!—µ∞°•—ï¥ππÖµî•Ùú∞úëÌïÕçÖ¡ï!—µ∞°•—ï¥π•çΩ∏•Ùú∞úëÌïÕçÖ¡ï!—µ∞°•—ï¥π…Ö…•—‰ÅÒÄàà•Ùú∞úëÌïÕçÖ¡ï!—µ∞°•—ï¥πΩâ—Ö•πïë}Ö–ÅÒÄàà•Ùú∞úëÌïÕçÖ¡ï!—µ∞°•—ï¥πÕï…•Ö±}π’µâï»ÅÒÄàà•Ùú∞úëÌïÕçÖ¡ï!—µ∞°•—ï¥πÕ—Ωç≠}—Ω—Ö∞ÅÒÄàà•Ùú•ÄÏ((ÄÄÄÅ…ï—’…∏ÅÄ(ÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅΩπç±•ç¨ÙàëÌΩπç±•ç≠Ùà(ÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÄëÌ•—ï¥π…Ö…•—‰Ä¸Å…Ö…•—ÂΩ±Ω»ÄËÄâŸÖ»†¥µâΩ…ëï»§âÙÌâΩ…ëï»µ…Öë•’ÃËƒ—¡‡Ì¡Öëë•πúËƒ—¡‡Ì—ï·–µÖ±•ù∏Èçïπ—ï»ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÌôΩπ–µôÖµ•±‰È•π°ï…•–Ìç’…ÕΩ»È¡Ω•π—ï»ÌΩŸï…ô±Ω‹È°•ëëï∏Ïà¯(ÄÄÄÄÄÄÄÄëÌ•—ï¥πï≈’•¡¡ïêÄ¸ÅÄÒë•ÿÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÌ—Ω¿Ë›¡‡Ì…•ù°–Ë›¡‡ÌôΩπ–µÕ•ÈîË·¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿ÌçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§ÌâÖç≠ù…Ω’πêÈ…ùâÑ†Ã–∞ƒ‰‹∞‰–∞∏¿‡§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†Ã–∞ƒ‰‹∞‰–∞∏»‘§ÌâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡Ì¡Öëë•πúË…¡‡ÄŸ¡‡Ïà¯ëÌ•—ï¥π—Â¡îÄÙÙÙÄâ—•—±îàÄ¸ÄâEU%A<àÄËÄâEU%AâÙΩë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ãµï≈’•¡¡ïêµµïëÖ∞ÄëÌ…Ö…•—Â±ÖÕÕÙàÅÕ—Â±îÙâ›•ë—†Ë‘…¡‡Ì°ï•ù°–Ë‘…¡‡ÌµÖ…ù•∏Ë…¡‡ÅÖ’—ºÄƒ¡¡‡ÌôΩπ–µÕ•ÈîË»·¡‡Ì¡Ω•π—ï»µïŸïπ—ÃÈπΩπîÏà¯(ÄÄÄÄÄÄÄÄÄÄëÌ•—ï¥π•çΩπÙ(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÌôΩπ–µ›ï•ù°–Ë‹¿¿ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯ëÌïÕçÖ¡ï!—µ∞°•—ï¥ππÖµî•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîË·¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿Ì±ï——ï»µÕ¡Öç•πúË∏¿Ÿï¥Ì—ï·–µ—…ÖπÕôΩ…¥È’¡¡ï…çÖÕîÌçΩ±Ω»ËëÌ…Ö…•—ÂΩ±Ω…ÙÌµÖ…ù•∏µ—Ω¿Ë’¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄëÌïÕçÖ¡ï!—µ∞°…Ö…•—Â1Öâï∞•Ù(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄëÌ•—ï¥πÕï…•Ö±}π’µâï»ÄòòÅ•—ï¥πÕ—Ωç≠}—Ω—Ö∞Ä¸ÅÄÒë•ÿÅÕ—Â±îÙâôΩπ–µôÖµ•±‰Ëù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÌôΩπ–µ›ï•ù°–Ë‰¿¿ÌµÖ…ù•∏µ—Ω¿Ë’¡‡Ïà˘1%5%QÄåëÌ•—ï¥πÕï…•Ö±}π’µâï…ÙºëÌ•—ï¥πÕ—Ωç≠}—Ω—Ö±ÙΩë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄëÌ•—ï¥πΩâ—Ö•πïë}Ö–Ä¸ÅÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë’¡‡Ïà¯ëÌπï‹ÅÖ—î°•—ï¥πΩâ—Ö•πïë}Ö–§π—Ω1ΩçÖ±ïÖ—ïM—…•πú†âïÃµHà•ÙΩë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÄÄΩâ’——Ω∏˘ÄÏ(ÄÅÙÏ((ÄÅù…•êπ•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–°Ö’—ºµô•–±µ•πµÖ‡†ƒ»’¡‡∞≈ô»§§ÌùÖ¿Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄëÌ•—ïµÃπµÖ¿°…ïπëï…%—ï¥§π©Ω•∏†àà•Ù(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅŸ•ï›A’â±•çA…Ωô•±î°’Õï…πÖµî§ÅÏ(ÄÅïπÕ’…ï%ëïπ—•—Â·¡ï…•ïπçî‘‰ÕM—Â±ïÃ†§Ï(ÄÅ•òÄ†Ö’Õï…πÖµî§Å…ï—’…∏Ï(ÄÅ•òÄ°’Õï…πÖµîÄÙÙÙÅç’……ïπ—A…Ωô•±îπ’Õï…πÖµî§ÅÏÅÕ›•—ç°QÖà†â¡…Ωô•±îà§ÏÅ…ï—’…∏ÏÅÙ((ÄÅç±ïÖ…±±]Ö—ç°%π—ï…ŸÖ±Ã†§Ï(ÄÅ¡…ïŸ•Ω’ÕQÖâ	ïôΩ…ïA…Ωô•±îÄÙÅç’……ïπ—QÖàÏ((ÄÅçΩπÕ–ÅµÖ•∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÖ¡¡Y•ï‹à§Ï(ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄÒ¿˘Ö…ùÖπëºÅ¡ï…ô•∞∏∏∏Ω¿˘ÄÏ(ÄÅëΩç’µïπ–π≈’ï…ÂMï±ïç—Ω…±∞†àππÖÿµ±•π≠ÃÅâ’——Ω∏à§πôΩ…Öç†°àÄÙ¯Åàπç±ÖÕÕ1•Õ–π…ïµΩŸî†âÖç—•Ÿîà§§Ï((ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅ¡…Ωô•±îÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†â¡…Ωô•±ïÃà§πÕï±ïç–†â•ê∞Å’Õï…πÖµî∞ÅÖŸÖ—Ö…}ïµΩ©§∞ÅÖŸÖ—Ö…}’…∞∞ÅçΩŸï…}’…∞∞ÅçΩŸï…}¡ΩÕ•—•Ωπ}‰∞Å¡…Ωô•±ï}Õ•ëï}•µÖùï}’…∞∞Åâ•º∞ÅÕΩç•Ö±}≠•ç¨∞ÅÕΩç•Ö±}—›•—ç†∞ÅÕΩç•Ö±}ÂΩ’—’âî∞ÅÕΩç•Ö±}—•≠—Ω¨∞ÅÕΩç•Ö±}•πÕ—Öù…Ö¥∞Å¡±Öπ}•ê∞Å•Õ}±•Ÿî∞Å±•Ÿï}¡±Ö—ôΩ…¥∞Å•Õ}ç…ïÖ—Ω»à§πïƒ†â’Õï…πÖµîà∞Å’Õï…πÖµî§πÕ•πù±î†§Ï(ÄÅ•òÄ†Ö¡…Ωô•±î§ÅÏÅµÖ•∏π•ππï…!Q50ÄÙÅÄÒ¿Åç±ÖÕÃÙâï……Ω»µµÕúà˘UÕ’Ö…•ºÅπºÅïπçΩπ—…Öëº∏Ω¿˘ÄÏÅ…ï—’…∏ÏÅÙ(ÄÅ…ïçΩ…ëÖ•±Â°Ö±±ïπùïŸïπ–†â¡…Ωô•±ï}Ÿ•ï‹à∞Å¡…Ωô•±îπ•ê§Ï((ÄÅçΩπÕ–Ål(ÄÄÄÅŸ•ëïΩÕIïÕ’±–∞(ÄÄÄÅôΩ±±Ω›ï…ÕIïÕ’±–∞(ÄÄÄÅôΩ±±Ω›•πùIïÕ’±–∞(ÄÄÄÅâÖëùïÕIïÕ’±–∞(ÄÄÄÅ—°ï•…≈’•¡¡ïë	ÖëùïÃ∞(ÄÄÄÅ—°ï•…Q•—±î(ÄÅtÄÙÅÖ›Ö•–ÅA…Ωµ•ÕîπÖ±∞°l(ÄÄÄÅÕàπô…Ω¥†âŸ•ëïΩÃà§πÕï±ïç–†à®à§πïƒ†â’Õï…}•êà∞Å¡…Ωô•±îπ•ê§πΩ…ëï»†âç…ïÖ—ïë}Ö–à∞ÅÏÅÖÕçïπë•πúÈôÖ±ÕîÅÙ§∞(ÄÄÄÅÕàπô…Ω¥†âôΩ±±Ω›Ãà§πÕï±ïç–†âôΩ±±Ω›ï…}•êà§πïƒ†âôΩ±±Ω›ïë}•êà∞Å¡…Ωô•±îπ•ê§∞(ÄÄÄÅÕàπô…Ω¥†âôΩ±±Ω›Ãà§πÕï±ïç–†âôΩ±±Ω›ï…}•êà§πïƒ†âôΩ±±Ω›ïë}•êà∞Å¡…Ωô•±îπ•ê§πïƒ†âôΩ±±Ω›ï…}•êà∞Åç’……ïπ—UÕï»π•ê§πµÖÂâïM•πù±î†§∞(ÄÄÄÅÕàπô…Ω¥†â’Õï…}âÖëùïÃà§πÕï±ïç–†à®à§πïƒ†â’Õï…}•êà∞Å¡…Ωô•±îπ•ê§πΩ…ëï»†âïÖ…πïë}Ö–à∞ÅÏÅÖÕçïπë•πúÈôÖ±ÕîÅÙ§∞(ÄÄÄÅùï—≈’•¡¡ïëA…Ωô•±ï5ïëÖ±Ã°¡…Ωô•±îπ•ê§∞(ÄÄÄÅùï—A’â±•çA…Ωô•±ïQ•—±î°¡…Ωô•±îπ•ê§(ÄÅt§Ï((ÄÅçΩπÕ–ÅŸ•ëïΩÃÄÙÅŸ•ëïΩÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅçΩπÕ–ÅôΩ±±Ω›ï…ÃÄÙÅôΩ±±Ω›ï…ÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅçΩπÕ–ÅÖµ%Ω±±Ω›•πúÄÙÅôΩ±±Ω›•πùIïÕ’±–¸πëÖ—ÑÅÒÅπ’±∞Ï(ÄÅçΩπÕ–Å—°ï•…	ÖëùïÃÄÙÅâÖëùïÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ((ÄÅçΩπÕ–ÅŸ•ëïΩ%ëÃÄÙÄ°Ÿ•ëïΩÃÅÒÅmt§πµÖ¿°ÿÄÙ¯Åÿπ•ê§Ï((ÄÅçΩπÕ–ÅmÕïÕÕ•ΩπÕIïÕ’±–∞Å±•≠ïÕIïÕ’±—tÄÙÅÖ›Ö•–ÅA…Ωµ•ÕîπÖ±∞°l(ÄÄÄÅŸ•ëïΩ%ëÃπ±ïπù—†Ä¸ÅÕàπô…Ω¥†â›Ö—ç°}ÕïÕÕ•ΩπÃà§πÕï±ïç–†âŸ•ëïΩ}•ê∞ÅŸ•ï›ï…}•êà§π•∏†âŸ•ëïΩ}•êà∞ÅŸ•ëïΩ%ëÃ§ÄËÅA…Ωµ•Õîπ…ïÕΩ±Ÿî°ÏÅëÖ—ÑÈmtÅÙ§∞(ÄÄÄÅŸ•ëïΩ%ëÃπ±ïπù—†Ä¸ÅÕàπô…Ω¥†âŸ•ëïΩ}±•≠ïÃà§πÕï±ïç–†âŸ•ëïΩ}•êà§π•∏†âŸ•ëïΩ}•êà∞ÅŸ•ëïΩ%ëÃ§ÄËÅA…Ωµ•Õîπ…ïÕΩ±Ÿî°ÏÅëÖ—ÑÈmtÅÙ§(ÄÅt§Ï(ÄÅçΩπÕ–ÅÕïÕÕ•ΩπÃÄÙÅÕïÕÕ•ΩπÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅçΩπÕ–Å±•≠ïÃÄÙÅ±•≠ïÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ((ÄÅçΩπÕ–ÅŸ•ï›Õ	ÂY•ëïºÄÙÅÌÙÏ(ÄÄ°ÕïÕÕ•ΩπÃÅÒÅmt§πôΩ…Öç†°ÃÄÙ¯ÅÏ(ÄÄÄÅŸ•ï›Õ	ÂY•ëïΩmÃπŸ•ëïΩ}•ëtÄÙÅŸ•ï›Õ	ÂY•ëïΩmÃπŸ•ëïΩ}•ëtÅÒÅπï‹ÅMï–†§Ï(ÄÄÄÅŸ•ï›Õ	ÂY•ëïΩmÃπŸ•ëïΩ}•ëtπÖëê°ÃπŸ•ï›ï…}•ê§Ï(ÄÅÙ§Ï(ÄÅçΩπÕ–Å±•≠ïÕ	ÂY•ëïºÄÙÅÌÙÏ(ÄÄ°±•≠ïÃÅÒÅmt§πôΩ…Öç†°∞ÄÙ¯ÅÏÅ±•≠ïÕ	ÂY•ëïΩm∞πŸ•ëïΩ}•ëtÄÙÄ°±•≠ïÕ	ÂY•ëïΩm∞πŸ•ëïΩ}•ëtÅÒÄ¿§Ä¨ÄƒÏÅÙ§Ï((ÄÅçΩπÕ–Å•ÕΩ±±Ω›•πúÄÙÄÑÖÖµ%Ω±±Ω›•πúÏ(ÄÅ›•πëΩ‹π}}¡…Ωô•±ïïïëY•ëïΩÃÄÙÅŸ•ëïΩÃÏ(ÄÅ›•πëΩ‹π}}¡…Ωô•±ïïïë’—°Ω»ÄÙÅÏÅ’Õï…πÖµîÈ¡…Ωô•±îπ’Õï…πÖµî∞Å¡±Öπ}•êÈ¡…Ωô•±îπ¡±Öπ}•êÅÙÏ(ÄÅçΩπÕ–Å±•Ÿ•πùA…Ωô•±ï!—µ∞ÄÙÅ…ïπëï…1•ŸïMç…Ω±∞›1•Ÿ•πùA…Ωô•±î°Ï(ÄÄÄÅ¡…Ωô•±î∞(ÄÄÄÅŸ•ëïΩÃ∞(ÄÄÄÅôΩ±±Ω›ï…ÕΩ’π–Ë°ôΩ±±Ω›ï…ÃÅÒÅmt§π±ïπù—†∞(ÄÄÄÅ—Ω—Ö±Y•ï›ÃÈ=â©ïç–πŸÖ±’ïÃ°Ÿ•ï›Õ	ÂY•ëïº§π…ïë’çî†°Õ’¥∞ÅŸ•ï›ï…Ã§ÄÙ¯ÅÕ’¥Ä¨ÅŸ•ï›ï…ÃπÕ•Èî∞Ä¿§∞(ÄÄÄÅΩ›∏ÈôÖ±Õî(ÄÅÙ§Ï((ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ·¡‡ÏàÅΩπç±•ç¨ÙâÕ›•—ç°QÖà†úëÌ¡…ïŸ•Ω’ÕQÖâ	ïôΩ…ïA…Ωô•±ïÙú§à˚ä@ÅYΩ±Ÿï»Ωâ’——Ω∏¯((ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµ°ï…ºëÌ•Õ1•ŸïMç…Ω±∞›¡¿†§Ä¸ÄàÅ±Ã‹µï±ïç—…•åµ¡…Ωô•±îàÄËÄàâÙàÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÏÅΩŸï…ô±Ω‹È°•ëëï∏Ïà¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµçΩŸï»ëÌ¡…Ωô•±îπçΩŸï…}’…∞Ä¸ÄàÅ°ÖÃµ•µÖùîàÄËÄàâÙà(ÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÏÅËµ•πëï‡Ë–ÏÄëÌ¡…Ωô•±îπçΩŸï…}’…∞Ä¸ÅÅâÖç≠ù…Ω’πêµ•µÖùîÈ’…∞†úëÌïÕçÖ¡ï!—µ∞°¡…Ωô•±îπçΩŸï…}’…∞•Ùú§ÏÅâÖç≠ù…Ω’πêµ¡ΩÕ•—•Ω∏Èçïπ—ï»ÄëÌ9’µâï»°¡…Ωô•±îπçΩŸï…}¡ΩÕ•—•Ωπ}‰Ä¸¸Ä‘¿•ÙîÌÄÄËÄàâÙà¯(ÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄëÌ¡…Ωô•±îπ¡…Ωô•±ï}Õ•ëï}•µÖùï}’…∞Ä¸ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅÖ…•Ñµ°•ëëï∏Ùâ—…’îàÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÌ±ïô–Ë¿Ì…•ù°–Ë¿Ì—Ω¿Ëƒ‘¡¡‡ÌâΩ——Ω¥Ë¿ÌËµ•πëï‡ËƒÌΩŸï…ô±Ω‹È°•ëëï∏Ì¡Ω•π—ï»µïŸïπ—ÃÈπΩπîÏà¯(ÄÄÄÄÄÄÄÄÄÄÒ•µúÅÕ…åÙàëÌïÕçÖ¡ï!—µ∞°¡…Ωô•±îπ¡…Ωô•±ï}Õ•ëï}•µÖùï}’…∞•ÙàÅÖ±–Ùàà(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÌ•πÕï–Ë¿Ì›•ë—†Ëƒ¿¿îÌ°ï•ù°–Ëƒ¿¿îÌΩâ©ïç–µô•–ÈçΩŸï»ÌΩâ©ïç–µ¡ΩÕ•—•Ω∏Èçïπ—ï»Åçïπ—ï»ÌΩ¡Öç•—‰Ë∏–»Ìô•±—ï»ÈÕÖ—’…Ö—î†∏‰‘§ÅçΩπ—…ÖÕ–†ƒ∏¿ÿ§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÌ•πÕï–Ë¿ÌâÖç≠ù…Ω’πêË(ÄÄÄÄÄÄÄÄÄÄÄÅ±•πïÖ»µù…Öë•ïπ–†ƒ‡¡ëïú±…ùâÑ†ƒÃ∞ƒÿ∞»¿∞∏ƒÿ§Ä¿î±…ùâÑ†ƒÃ∞ƒÿ∞»¿∞∏»‡§Ä–‡î±…ùâÑ†ƒÃ∞ƒÿ∞»¿∞∏‹»§Äƒ¿¿î§∞(ÄÄÄÄÄÄÄÄÄÄÄÅ±•πïÖ»µù…Öë•ïπ–†‰¡ëïú±…ùâÑ†ƒÃ∞ƒÿ∞»¿∞∏–¿§Ä¿î±…ùâÑ†ƒÃ∞ƒÿ∞»¿∞∏ƒ‡§Ä‘¿î±…ùâÑ†ƒÃ∞ƒÿ∞»¿∞∏Ã¿§Äƒ¿¿î§Ïà¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ˘ÄÄËÄàâÙ((ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡Ë»Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµ°ï…ºµ—Ω¿à¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÖŸÖ—Ö»µ…•πúÄëÌùï—ŸÖ—Ö…I•πù±ÖÕÃ°¡…Ωô•±îπ¡±Öπ}•ê•ÙëÌ¡…Ωô•±îπ•Õ}±•ŸîÄ¸ÄàÅÖŸÖ—Ö»µ±•Ÿîµ…•πúàÄËÄàâÙà¯ëÌ…ïπëï…ŸÖ—Ö…!—µ∞°¡…Ωô•±î∞Äÿ¿•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµπÖµîµâ±Ωç¨à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒ†ƒ˘ ëÌïÕçÖ¡ï!—µ∞°¡…Ωô•±îπ’Õï…πÖµî•ÙÄëÌùï—A±Öπ	Öëùï!—µ∞°¡…Ωô•±îπ¡±Öπ}•ê•ÙΩ†ƒ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ°Öπë±îÅ¡…Ωô•±îµ…Ω±îµâÖëùîÄëÌ¡…Ωô•±îπ•Õ}ç…ïÖ—Ω»Ä¸Äâç…ïÖ—Ω»àÄËÄâ’Õï»âÙà¯ëÌ¡…Ωô•±îπ•Õ}ç…ïÖ—Ω»Ä¸Äã¬~:∞Å…ïÖëΩ»àÄËÄã¬~FêÅUÕ’Ö…•ºâÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌ…ïπëï…A…Ωô•±ïQ•—±ï%π±•πî°—°ï•…Q•—±î∞ÅôÖ±Õî•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄëÌ—°ï•…≈’•¡¡ïë	ÖëùïÃπ±ïπù—†Ä¸ÅÄÒë•ÿÅç±ÖÕÃÙâ±Ãµ¡’â±•åµµïëÖ±Ãµ›…Ö¿à¯ëÌ…ïπëï…≈’•¡¡ïë5ïëÖ±Õ%π±•πî°—°ï•…≈’•¡¡ïë	ÖëùïÃ∞ÅôÖ±Õî•ÙΩë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄëÌ¡…Ωô•±îπâ•ºÄ¸ÅÄÒ¿Åç±ÖÕÃÙâ¡…Ωô•±îµâ•ºà¯ëÌïÕçÖ¡ï!—µ∞°¡…Ωô•±îπâ•º•ÙΩ¿˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄëÌ…ïπëï…MΩç•Ö±%çΩπÃ°¡…Ωô•±î•Ù(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕ—Ö—Ãµ…Ω‹à¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÕ—Ö–µ¡•±∞à¯Òë•ÿÅç±ÖÕÃÙâπ’¥à¯ëÌŸ•ëïΩÃ¸π±ïπù—†ÅÒÄ¡ÙΩë•ÿ¯Òë•ÿÅç±ÖÕÃÙâ±â∞à˘Y•ëïΩÃΩë•ÿ¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÕ—Ö–µ¡•±∞à¯Òë•ÿÅç±ÖÕÃÙâπ’¥à¯ëÏ°ôΩ±±Ω›ï…ÃÅÒÅmt§π±ïπù—°ÙΩë•ÿ¯Òë•ÿÅç±ÖÕÃÙâ±â∞à˘Mïù’•ëΩ…ïÃΩë•ÿ¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµ°ï…ºµÖç—•ΩπÃà¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏ëÌ•ÕΩ±±Ω›•πúÄ¸ÄàµΩ’—±•πîàÄËÄàâÙàÅ•êÙâôΩ±±Ω›	—∏àÅΩπç±•ç¨Ùâ°Öπë±ïQΩùù±ïΩ±±Ω‹†úëÌ¡…Ωô•±îπ•ëÙú§à¯ëÌ•ÕΩ±±Ω›•πúÄ¸ÄâM•ù’•ïπëºÉärLàÄËÄà¨ÅMïù’•»âÙΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄëÌ…ïπëï…ïπï…Ö—•Ωπ%ëïπ—•—ÂÖ…ê°Ÿ•ëïΩÃ∞ÅôÖ±Õî•Ù(ÄÄÄÄëÌ±•Ÿ•πùA…Ωô•±ï!—µ±Ù((ÄÄÄÄëÌ—°ï•…	ÖëùïÃÄòòÅ—°ï•…	ÖëùïÃπ±ïπù—†Ä¸ÅÄ(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕïç—•Ω∏à¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕïç—•Ω∏µ°ïÖêà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ•çºà˚¬~>Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒ†Ã˘5ïëÖ±±ÖÃΩ†Ã¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÕ’àà¯ëÌ—°ï•…	ÖëùïÃπ±ïπù—°ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÕ—…ïÖ¨µâÖëùïÃà¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌ—°ï•…	ÖëùïÃπµÖ¿°àÄÙ¯ÅÄÒë•ÿÅç±ÖÕÃÙââÖëùîµ•çΩ∏àÅ—•—±îÙàëÌïÕçÖ¡ï!—µ∞°àπâÖëùï}πÖµî•Ùà¯ëÌàπâÖëùï}•çΩ∏ÅÒÄã¬~>âÙΩë•ÿ˘Ä§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ˘ÄÄËÄàâÙ((ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕïç—•Ω∏à¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡…Ωô•±îµÕïç—•Ω∏µ°ïÖêà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ•çºà˚¬~:∞Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒ†Ã˘Y•ëïΩÃΩ†Ã¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÕ’àà¯ëÌŸ•ëïΩÃ¸π±ïπù—†ÅÒÄ¡ÙÅï∏Å—Ω—Ö∞Ωë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄëÌŸ•ëïΩÃÄòòÅŸ•ëïΩÃπ±ïπù—†Ä¸Ä††§ÄÙ¯ÅÏ(ÄÄÄÄÄÄÄÅ›•πëΩ‹π}}¡…Ωô•±ïïïëY•ëïΩÃÄÙÅŸ•ëïΩÃÏ(ÄÄÄÄÄÄÄÅ›•πëΩ‹π}}¡…Ωô•±ïïïë’—°Ω»ÄÙÅÏÅ’Õï…πÖµîËÅ¡…Ωô•±îπ’Õï…πÖµî∞Å¡±Öπ}•êËÅ¡…Ωô•±îπ¡±Öπ}•êÅÙÏ(ÄÄÄÄÄÄÄÅ…ï—’…∏ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâŸ•ëïºµù…•êà¯(ÄÄÄÄÄÄÄÄÄÄëÌŸ•ëïΩÃπµÖ¿°ÿÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâŸ•ëïºµù…•êµ—•±îàÅ•êÙâ¡’â±•åµ—•±î¥ëÌÿπ•ëÙàÅΩπç±•ç¨ÙâΩ¡ïπA…Ωô•±ïY•ëïΩïïê°›•πëΩ‹π}}¡…Ωô•±ïïïëY•ëïΩÃ∞ÄúëÌÿπ•ëÙú∞Å›•πëΩ‹π}}¡…Ωô•±ïïïë’—°Ω»§à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌùï—…•ëΩŸï…!—µ∞°ÿ•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌç’……ïπ—A…Ωô•±îπ•Õ}Öëµ•∏Ä¸ÅÄÒâ’——Ω∏Åç±ÖÕÃÙâ±ÃµÖëµ•∏µ¡…Ωô•±îµëï±ï—î¥ÿƒƒàÅ—•—±îÙâ±•µ•πÖ»ÅçΩµºÅÖëµ•π•Õ—…ÖëΩ»àÅÖ…•Ñµ±Öâï∞Ùâ±•µ•πÖ»ÅŸ•ëïºÅçΩµºÅÖëµ•π•Õ—…ÖëΩ»àÅΩπç±•ç¨ÙâïŸïπ–πÕ—Ω¡A…Ω¡ÖùÖ—•Ω∏†§Ì°Öπë±ïëµ•πï±ï—ïA…Ωô•±ïY•ëïº†úëÌÿπ•ëÙú∞úëÌïÕçÖ¡ï!—µ∞°¡…Ωô•±îπ’Õï…πÖµî•Ùú§à˚¬~^DΩâ’——Ω∏˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâù…•êµΩŸï…±Ö‰à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâù…•êµÕ—Ö—Ãà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏˚¬~FÄëÏ°Ÿ•ï›Õ	ÂY•ëïΩmÿπ•ët¸πÕ•ÈîÅÒÄ¿•ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏˚ävìæ‚<ÄëÌ±•≠ïÕ	ÂY•ëïΩmÿπ•ëtÅÒÄ¡ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÅÄ§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÅÄÏ(ÄÄÄÄÄÅÙ§†§ÄËÅÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§à˘QΩëÖ€µÑÅπºÅÕ’âßÃÅŸ•ëïΩÃ∏Ω¿˘ÅÙ(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïQΩùù±ïΩ±±Ω‹°ôΩ±±Ω›ïë%ê§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†â—Ωùù±ï}ôΩ±±Ω‹à∞ÅÏÅ¡}ôΩ±±Ω›ï…}•êËÅç’……ïπ—UÕï»π•ê∞Å¡}ôΩ±±Ω›ïë}•êËÅôΩ±±Ω›ïë%êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§Å…ï—’…∏Ï(ÄÅçΩπÕ–Åâ—∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âôΩ±±Ω›	—∏à§Ï(ÄÅ•òÄ°ëÖ—ÑπôΩ±±Ω›•πú§ÅÏ(ÄÄÄÅâ—∏π—ï·—Ωπ—ïπ–ÄÙÄâM•ù’•ïπëºÉärLàÏ(ÄÄÄÅâ—∏πç±ÖÕÕ9ÖµîÄÙÄââ—∏µΩ’—±•πîàÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â°Ω…ÑÅÕïù◊µÃÅÑÅïÕ—îÅç…ïÖëΩ»à§Ï(ÄÅÙÅï±ÕîÅÏ(ÄÄÄÅâ—∏π—ï·—Ωπ—ïπ–ÄÙÄà¨ÅMïù’•»àÏ(ÄÄÄÅâ—∏πç±ÖÕÕ9ÖµîÄÙÄââ—∏àÏ(ÄÅÙ)Ù()ô’πç—•Ω∏ÅΩ¡ïπIï¡Ω…—5ΩëÖ∞°Ÿ•ëïΩ%ê§ÅÏ(ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅçΩπÕ–Å…ïÖÕΩπÃÄÙÅlâΩπ—ïπ•ëºÅŸ•Ω±ïπ—ºà∞ÄâM¡Ö¥ÅºÅïπùá≈ΩÕºà∞Äâï…ïç°ΩÃÅëîÅÖ’—Ω»à∞ÄâΩπ—ïπ•ëºÅÕï·’Ö∞à∞Äâ=—…ºâtÏ(ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµµΩëÖ∞µ±Ωç≠ïêàÅëÖ—ÑµµΩëÖ∞µ±Ωç≠ïêÙàƒàÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏Èô•·ïêÏÅ•πÕï–Ë¿ÏÅâÖç≠ù…Ω’πêÈ…ùâÑ†¿∞¿∞¿∞¿∏‹‘§ÏÅËµ•πëï‡Ëƒ¿¿ÏÅë•Õ¡±Ö‰Èô±ï‡ÏÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÏÅ©’Õ—•ô‰µçΩπ—ïπ–Èçïπ—ï»ÏÅ¡Öëë•πúË»¡¡‡Ïà¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙââÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞§ÏÅ›•ë—†Ëƒ¿¿îÏÅµÖ‡µ›•ë—†ËÃ–¡¡‡ÏÅâΩ…ëï»µ…Öë•’ÃËƒŸ¡‡ÏÅ¡Öëë•πúË»…¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë¿Ïà˚¬~j§ÅIï¡Ω…—Ö»ÅŸ•ëïºΩ†Ã¯(ÄÄÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà˚
˝AΩ»Å≈◊§Å≈’ïÀ•ÃÅ…ï¡Ω…—Ö…±º¸Ω¿¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÏÅùÖ¿Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄëÌ…ïÖÕΩπÃπµÖ¿°»ÄÙ¯ÅÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ—ï·–µÖ±•ù∏È±ïô–ÏàÅΩπç±•ç¨ÙâÕ’âµ•—Iï¡Ω…–†úëÌŸ•ëïΩ%ëÙú∞ÄúëÌ…Ùú§à¯ëÌ…ÙΩâ’——Ω∏˘Ä§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÌµÖ…ù•∏µ—Ω¿Ëƒ…¡‡ÏàÅΩπç±•ç¨Ùâç±ΩÕï5ÖπÖùïë5ΩëÖ∞†§à˘Öπçï±Ö»Ωâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅÕ’âµ•—Iï¡Ω…–°Ÿ•ëïΩ%ê∞Å…ïÖÕΩ∏§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†â…ï¡Ω…—}Ÿ•ëïºà∞ÅÏÅ¡}Ÿ•ëïΩ}•êËÅŸ•ëïΩ%ê∞Å¡}…ï¡Ω…—ï…}•êËÅç’……ïπ—UÕï»π•ê∞Å¡}…ïÖÕΩ∏ËÅ…ïÖÕΩ∏ÅÙ§Ï(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§π•ππï…!Q50ÄÙÄààÏ(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°ëÖ—Ñ¸πï……Ω»ÄÙÙÙÄâÂÖ}…ï¡Ω…—ÖëºàÄ¸ÄâeÑÅ°ÖãµÖÃÅ…ï¡Ω…—ÖëºÅïÕ—îÅŸ•ëïºàÄËÄâ9ºÅÕîÅ¡’ëºÅ…ï¡Ω…—Ö»à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅÕ°Ω›QΩÖÕ–†âIï¡Ω…—Öëº∏Å…Öç•ÖÃÅ¡Ω»ÅÖŸ•ÕÖ…πΩÃ∏à§Ï)Ù()±ï–ÅπΩ—•ôÖç°îÄÙÅmtÏ)±ï–ÅπΩ—•ôIïÖ±—•µï°Öππï∞ÄÙÅπ’±∞Ï)±ï–ÅπΩ—•ôIïÖ±—•µïUÕï…%êÄÙÅπ’±∞Ï)±ï–ÅπΩ—•ôU•Iïô…ïÕ°…ÖµîÄÙÅπ’±∞Ï)±ï–ÅπΩ—•ôY•Õ•â±ïΩ’π–ÄÙÄƒ‡Ï)±ï–ÅπΩ—•ôMΩ’πëΩπ—ï·–ÄÙÅπ’±∞Ï)±ï–ÅπΩ—•ôIïÖ±—•µïΩππïç—ïêÄÙÅôÖ±ÕîÏ)±ï–ÅπΩ—•ôÖ±±âÖç≠Q•µï»ÄÙÅπ’±∞Ï)çΩπÕ–Å1M}9=Q%%Q%=9}M=U9}-dÄÙÄâ±•ŸïÕç…Ω±±}πΩ—•ô•çÖ—•Ωπ}ÕΩ’πë}ÿ‘‰‡àÏ()ô’πç—•Ω∏ÅÕ—Ω¡9Ω—•ô•çÖ—•ΩπÖ±±âÖç¨†§ÅÏ(ÄÅ•òÄ°πΩ—•ôÖ±±âÖç≠Q•µï»§Åç±ïÖ…%π—ï…ŸÖ∞°πΩ—•ôÖ±±âÖç≠Q•µï»§Ï(ÄÅπΩ—•ôÖ±±âÖç≠Q•µï»ÄÙÅπ’±∞Ï(ÄÅπΩ—•ôIïÖ±—•µïΩππïç—ïêÄÙÅôÖ±ÕîÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å¡Ω±±9Ω—•ô•çÖ—•ΩπÕÖ±±âÖç¨†§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—UÕï»¸π•êÅÒÅëΩç’µïπ–π°•ëëï∏ÅÒÅπΩ—•ôIïÖ±—•µïΩππïç—ïê§Å…ï—’…∏Ï(ÄÅçΩπÕ–Åπï›ïÕ—–ÄÙÅπΩ—•ôÖç°ïl¡t¸πç…ïÖ—ïë}Ö–ÅÒÅπï‹ÅÖ—î°Ö—îππΩ‹†§Ä¥Ä‘Ä®Äÿ¿Ä®Äƒ¿¿¿§π—Ω%M=M—…•πú†§Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕà(ÄÄÄÄπô…Ω¥†âπΩ—•ô•çÖ—•ΩπÃà§(ÄÄÄÄπÕï±ïç–†à®à§(ÄÄÄÄπïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§(ÄÄÄÄπù–†âç…ïÖ—ïë}Ö–à∞Åπï›ïÕ—–§(ÄÄÄÄπΩ…ëï»†âç…ïÖ—ïë}Ö–à∞ÅÏÅÖÕçïπë•πúÈôÖ±ÕîÅÙ§(ÄÄÄÄπ±•µ•–†»¿§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸π±ïπù—†§Å…ï—’…∏Ï(ÄÅçΩπÕ–Å≠πΩ›∏ÄÙÅπï‹ÅMï–°πΩ—•ôÖç°îπµÖ¿°∏ÄÙ¯Å∏π•ê§§Ï(ÄÅçΩπÕ–Åô…ïÕ†ÄÙÅëÖ—Ñπô•±—ï»°∏ÄÙ¯ÄÖ≠πΩ›∏π°ÖÃ°∏π•ê§§Ï(ÄÅ•òÄ†Öô…ïÕ†π±ïπù—†§Å…ï—’…∏Ï(ÄÅπΩ—•ôÖç°îÄÙÅl∏∏πô…ïÕ†∞Ä∏∏ππΩ—•ôÖç°ïtπÕ±•çî†¿∞Äÿ¿§Ï(ÄÅÕç°ïë’±ï9Ω—•ô•çÖ—•ΩπU%Iïô…ïÕ††§Ï(ÄÅ¡±ÖÂ1•ŸïMç…Ω±±9Ω—•ô•çÖ—•ΩπMΩ’πê†§Ï(ÄÅçΩπÕ–Å±Ö—ïÕ–ÄÙÅô…ïÕ°l¡tÏ(ÄÅÕ°Ω›QΩÖÕ–°ÄëÌùï—9Ω—•ô•çÖ—•Ωπ%çΩ∏°±Ö—ïÕ–π—Â¡î•ÙÄëÌ±Ö—ïÕ–πµïÕÕÖùîÅÒÄâ9’ïŸÑÅπΩ—•ô•çÖçßÕ∏âıÄ§Ï(ÄÅ•òÄ°±Ö—ïÕ–π—Â¡îÄÙÙÙÄâ±•Ÿîà§ÅÕ°Ω›1•ŸïM—Ö…—π•µÖ—•Ω∏°±Ö—ïÕ–§Ï)Ù()ô’πç—•Ω∏ÅÕ—Ö…—9Ω—•ô•çÖ—•ΩπÖ±±âÖç¨†§ÅÏ(ÄÅ•òÄ°πΩ—•ôÖ±±âÖç≠Q•µï»§Å…ï—’…∏Ï(ÄÅπΩ—•ôÖ±±âÖç≠Q•µï»ÄÙÅÕï—%π—ï…ŸÖ∞°¡Ω±±9Ω—•ô•çÖ—•ΩπÕÖ±±âÖç¨∞Ä‡¿¿¿§Ï)Ù()ô’πç—•Ω∏Å•Õ9Ω—•ô•çÖ—•ΩπMΩ’πëπÖâ±ïê†§ÅÏ(ÄÅ—…‰ÅÏÅ…ï—’…∏Å±ΩçÖ±M—Ω…Öùîπùï—%—ï¥°1M}9=Q%%Q%=9}M=U9}-d§ÄÙÙÙÄàƒàÏÅÙ(ÄÅçÖ—ç†Ä°|§ÅÏÅ…ï—’…∏ÅôÖ±ÕîÏÅÙ)Ù()ô’πç—•Ω∏Å¡±ÖÂ1•ŸïMç…Ω±±9Ω—•ô•çÖ—•ΩπMΩ’πê†§ÅÏ(ÄÅ•òÄ†Ö•Õ9Ω—•ô•çÖ—•ΩπMΩ’πëπÖâ±ïê†§ÅÒÅëΩç’µïπ–π°•ëëï∏§Å…ï—’…∏Ï(ÄÅ—…‰ÅÏ(ÄÄÄÅçΩπÕ–Å’ë•Ωπù•πîÄÙÅ›•πëΩ‹π’ë•ΩΩπ—ï·–ÅÒÅ›•πëΩ‹π›ïâ≠•—’ë•ΩΩπ—ï·–Ï(ÄÄÄÅ•òÄ†Ö’ë•Ωπù•πî§Å…ï—’…∏Ï(ÄÄÄÅπΩ—•ôMΩ’πëΩπ—ï·–ÄÙÅπΩ—•ôMΩ’πëΩπ—ï·–ÅÒÅπï‹Å’ë•Ωπù•πî†§Ï(ÄÄÄÅçΩπÕ–Åç—‡ÄÙÅπΩ—•ôMΩ’πëΩπ—ï·–Ï(ÄÄÄÅ•òÄ°ç—‡πÕ—Ö—îÄÙÙÙÄâÕ’Õ¡ïπëïêà§Åç—‡π…ïÕ’µî†§Ï(ÄÄÄÅçΩπÕ–ÅπΩ‹ÄÙÅç—‡πç’……ïπ—Q•µîÏ(ÄÄÄÅçΩπÕ–ÅΩÕåÄÙÅç—‡πç…ïÖ—ï=Õç•±±Ö—Ω»†§Ï(ÄÄÄÅçΩπÕ–ÅùÖ•∏ÄÙÅç—‡πç…ïÖ—ïÖ•∏†§Ï(ÄÄÄÅΩÕåπ—Â¡îÄÙÄâÕ•πîàÏ(ÄÄÄÅΩÕåπô…ï≈’ïπç‰πÕï—YÖ±’ï—Q•µî†ÿ»¿∞ÅπΩ‹§Ï(ÄÄÄÅΩÕåπô…ï≈’ïπç‰πï·¡Ωπïπ—•Ö±IÖµ¡QΩYÖ±’ï—Q•µî†‰–¿∞ÅπΩ‹Ä¨Ä∏ƒ»§Ï(ÄÄÄÅùÖ•∏πùÖ•∏πÕï—YÖ±’ï—Q•µî†∏¿¿¿ƒ∞ÅπΩ‹§Ï(ÄÄÄÅùÖ•∏πùÖ•∏πï·¡Ωπïπ—•Ö±IÖµ¡QΩYÖ±’ï—Q•µî†∏¿‡‘∞ÅπΩ‹Ä¨Ä∏¿ƒ‡§Ï(ÄÄÄÅùÖ•∏πùÖ•∏πï·¡Ωπïπ—•Ö±IÖµ¡QΩYÖ±’ï—Q•µî†∏¿¿¿ƒ∞ÅπΩ‹Ä¨Ä∏»¿§Ï(ÄÄÄÅΩÕåπçΩππïç–°ùÖ•∏§ÏÅùÖ•∏πçΩππïç–°ç—‡πëïÕ—•πÖ—•Ω∏§Ï(ÄÄÄÅΩÕåπÕ—Ö…–°πΩ‹§ÏÅΩÕåπÕ—Ω¿°πΩ‹Ä¨Ä∏»»§Ï(ÄÅÙÅçÖ—ç†Ä°|§ÅÌÙ)Ù()ô’πç—•Ω∏Å—Ωùù±ï1•ŸïMç…Ω±±9Ω—•ô•çÖ—•ΩπMΩ’πê†§ÅÏ(ÄÅçΩπÕ–ÅïπÖâ±ïêÄÙÄÖ•Õ9Ω—•ô•çÖ—•ΩπMΩ’πëπÖâ±ïê†§Ï(ÄÅ—…‰ÅÏÅ±ΩçÖ±M—Ω…ÖùîπÕï—%—ï¥°1M}9=Q%%Q%=9}M=U9}-d∞ÅïπÖâ±ïêÄ¸ÄàƒàÄËÄà¿à§ÏÅÙÅçÖ—ç†Ä°|§ÅÌÙ(ÄÅ•òÄ°ïπÖâ±ïê§Å¡±ÖÂ1•ŸïMç…Ω±±9Ω—•ô•çÖ—•ΩπMΩ’πê†§Ï(ÄÅ…ïπëï…9Ω—•ô•çÖ—•ΩπAÖπï±Ωπ—ïπ–†§Ï(ÄÅÕ°Ω›QΩÖÕ–°ïπÖâ±ïêÄ¸Äã¬~R(ÅMΩπ•ëºÅëîÅπΩ—•ô•çÖç•ΩπïÃÅÖç—•ŸÖëºàÄËÄã¬~RÅMΩπ•ëºÅëîÅπΩ—•ô•çÖç•ΩπïÃÅëïÕÖç—•ŸÖëºà§Ï)Ù()ô’πç—•Ω∏ÅÕç°ïë’±ï9Ω—•ô•çÖ—•ΩπU%Iïô…ïÕ††§ÅÏ(ÄÅ•òÄ°πΩ—•ôU•Iïô…ïÕ°…Öµî§Å…ï—’…∏Ï(ÄÅπΩ—•ôU•Iïô…ïÕ°…ÖµîÄÙÅ…ï≈’ïÕ—π•µÖ—•Ωπ…Öµî††§ÄÙ¯ÅÏ(ÄÄÄÅπΩ—•ôU•Iïô…ïÕ°…ÖµîÄÙÅπ’±∞Ï(ÄÄÄÅ’¡ëÖ—ï9Ω—•ô•çÖ—•Ωπ	Öëùî†§Ï(ÄÄÄÅ•òÄ°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπΩ—•ôAÖπï∞à§§Å…ïπëï…9Ω—•ô•çÖ—•ΩπAÖπï±Ωπ—ïπ–†§Ï(ÄÅÙ§Ï)Ù()ô’πç—•Ω∏Åùï—9Ω—•ô•çÖ—•Ωπ%çΩ∏°—Â¡î§ÅÏ(ÄÅçΩπÕ–Å•çΩπÃÄÙÅÏÅ±•≠îËÄãävìæ‚<à∞ÅçΩµµïπ–ËÄã¬~J∞à∞ÅôΩ±±Ω‹ËÄã¬~Fêà∞Å±•ŸîËÄã¬~R–à∞ÅÖëµ•∏ËÄã¬~nÉæ‚<à∞ÅÕÂÕ—ï¥ËÄã¬~RPà∞Å¡Ω•π—ÃËÄã¬~™dà∞ÅÕ—…ïÖ¨ËÄã¬~Rîà∞Å¡±Ö∏ËÄã¬~J8àÅÙÏ(ÄÅ…ï—’…∏Å•çΩπÕm—Â¡ïtÅÒÄã¬~RPàÏ)Ù()çΩπÕ–Å1M}1%Y}1IQ}!%MQ=Ie}-dÄÙÄâ±•ŸïÕç…Ω±±}±•Ÿï}Ö±ï…—}ÕïÕÕ•ΩπÕ}ÿƒàÏ()ô’πç—•Ω∏Å°ÖÕM°Ω›π1•ŸïMïÕÕ•Ωπ±ï…–°≠ï‰§ÅÏ(ÄÅ—…‰ÅÏ(ÄÄÄÅçΩπÕ–Å°•Õ—Ω…‰ÄÙÅ)M=8π¡Ö…Õî°ÕïÕÕ•ΩπM—Ω…Öùîπùï—%—ï¥°1M}1%Y}1IQ}!%MQ=Ie}-d§ÅÒÄâÌÙà§Ï(ÄÄÄÅçΩπÕ–ÅπΩ‹ÄÙÅÖ—îππΩ‹†§Ï(ÄÄÄÅ=â©ïç–π≠ïÂÃ°°•Õ—Ω…‰§πôΩ…Öç†°•—ï¥ÄÙ¯ÅÏ(ÄÄÄÄÄÅ•òÄ°πΩ‹Ä¥Å9’µâï»°°•Õ—Ω…Âm•—ïµtÅÒÄ¿§Ä¯Ä»–Ä®Äÿ¿Ä®Äÿ¿Ä®Äƒ¿¿¿§Åëï±ï—îÅ°•Õ—Ω…Âm•—ïµtÏ(ÄÄÄÅÙ§Ï(ÄÄÄÅ•òÄ°°•Õ—Ω…Âm≠ïÂt§Å…ï—’…∏Å—…’îÏ(ÄÄÄÅ°•Õ—Ω…Âm≠ïÂtÄÙÅπΩ‹Ï(ÄÄÄÅçΩπÕ–Å—…•µµïêÄÙÅ=â©ïç–πô…Ωµπ—…•ïÃ°=â©ïç–πïπ—…•ïÃ°°•Õ—Ω…‰§πÕ±•çî†¥–¿§§Ï(ÄÄÄÅÕïÕÕ•ΩπM—Ω…ÖùîπÕï—%—ï¥°1M}1%Y}1IQ}!%MQ=Ie}-d∞Å)M=8πÕ—…•πù•ô‰°—…•µµïê§§Ï(ÄÄÄÅ…ï—’…∏ÅôÖ±ÕîÏ(ÄÅÙÅçÖ—ç†Ä°|§ÅÏ(ÄÄÄÅ›•πëΩ‹π}}±Õ1•Ÿï±ï…—Ö±±âÖç≠!•Õ—Ω…‰ÄÙÅ›•πëΩ‹π}}±Õ1•Ÿï±ï…—Ö±±âÖç≠!•Õ—Ω…‰ÅÒÅπï‹ÅMï–†§Ï(ÄÄÄÅ•òÄ°›•πëΩ‹π}}±Õ1•Ÿï±ï…—Ö±±âÖç≠!•Õ—Ω…‰π°ÖÃ°≠ï‰§§Å…ï—’…∏Å—…’îÏ(ÄÄÄÅ›•πëΩ‹π}}±Õ1•Ÿï±ï…—Ö±±âÖç≠!•Õ—Ω…‰πÖëê°≠ï‰§Ï(ÄÄÄÅ…ï—’…∏ÅôÖ±ÕîÏ(ÄÅÙ)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅÕ°Ω›1•ŸïM—Ö…—π•µÖ—•Ω∏°πΩ—•ô•çÖ—•Ω∏§ÅÏ(ÄÅ•òÄ†ÖπΩ—•ô•çÖ—•Ω∏¸πÖç—Ω…}•ê§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÏÅëÖ—ÑÈç…ïÖ—Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†â¡…Ωô•±ïÃà§(ÄÄÄÄπÕï±ïç–†â’Õï…πÖµî±ÖŸÖ—Ö…}’…∞±ÖŸÖ—Ö…}ïµΩ©§±±•Ÿï}¡±Ö—ôΩ…¥±±•Ÿï}Õ—Ö…—ïë}Ö–à§(ÄÄÄÄπïƒ†â•êà±πΩ—•ô•çÖ—•Ω∏πÖç—Ω…}•ê§πµÖÂâïM•πù±î†§Ï(ÄÅ•òÄ†Öç…ïÖ—Ω»§Å…ï—’…∏Ï((ÄÅçΩπÕ–Å¡±Ö—ôΩ…¥ÄÙÅlâ≠•ç¨à∞â—›•—ç†à∞ââΩ—†à∞âÂΩ’—’âîà∞â—•≠—Ω¨âtπ•πç±’ëïÃ°ç…ïÖ—Ω»π±•Ÿï}¡±Ö—ôΩ…¥§(ÄÄÄÄ¸Åç…ïÖ—Ω»π±•Ÿï}¡±Ö—ôΩ…¥(ÄÄÄÄËÄâ—›•—ç†àÏ(ÄÅçΩπÕ–ÅÕïÕÕ•ΩπM—Ö…—ïêÄÙÅç…ïÖ—Ω»π±•Ÿï}Õ—Ö…—ïë}Ö–ÅÒÅπΩ—•ô•çÖ—•Ω∏πç…ïÖ—ïë}Ö–ÅÒÄâÖç—•ŸîàÏ(ÄÅçΩπÕ–ÅÕïÕÕ•Ωπ-ï‰ÄÙÅÄëÌπΩ—•ô•çÖ—•Ω∏πÖç—Ω…}•ëÙËëÌ¡±Ö—ôΩ…µÙËëÌÕïÕÕ•ΩπM—Ö…—ïëıÄÏ(ÄÅ•òÄ°°ÖÕM°Ω›π1•ŸïMïÕÕ•Ωπ±ï…–°ÕïÕÕ•Ωπ-ï‰§§Å…ï—’…∏Ï((ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±Õ1•ŸïM—Ö…—ïë±ï…–à§¸π…ïµΩŸî†§Ï((ÄÅçΩπÕ–Å¡±Ö—ôΩ…µ1Öâï∞ÄÙÅ¡±Ö—ôΩ…¥ÄÙÙÙÄââΩ—†à(ÄÄÄÄ¸Äâ-%,Ä¨ÅQ]%Q à(ÄÄÄÄËÅ¡±Ö—ôΩ…¥ÄÙÙÙÄâ≠•ç¨àÄ¸Äâ-%,àÄËÅ¡±Ö—ôΩ…¥ÄÙÙÙÄâÂΩ’—’âîàÄ¸Äâe=UQU	àÄËÅ¡±Ö—ôΩ…¥ÄÙÙÙÄâ—•≠—Ω¨àÄ¸ÄâQ%-Q=,àÄËÄâQ]%Q àÏ(ÄÅçΩπÕ–Å•Õ1Ã‹ÄÙÅ•Õ1•ŸïMç…Ω±∞›¡¿†§Ï(ÄÅçΩπÕ–ÅÖ±ï…–ÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†ââ’——Ω∏à§Ï(ÄÅÖ±ï…–π•êÄÙÄâ±Õ1•ŸïM—Ö…—ïë±ï…–àÏ(ÄÅÖ±ï…–π—Â¡îÄÙÄââ’——Ω∏àÏ(ÄÅÖ±ï…–πç±ÖÕÕ9ÖµîÄÙÅÅ±Ãµ±•ŸîµÕ—Ö…–µÖ±ï…–ÄëÌ•Õ1Ã‹Ä¸Äâ±Ã‹àÄËÄâ±ÃÿâÙÅ¡±Ö—ôΩ…¥¥ëÌ¡±Ö—ôΩ…µıÄÏ(ÄÅÖ±ï…–πΩπç±•ç¨ÄÙÄ†§ÄÙ¯ÅÏÅÖ±ï…–π…ïµΩŸî†§ÏÅÕ›•—ç°QÖà†âë•…ïç—ΩÃà§ÏÅÙÏ(ÄÅÖ±ï…–π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒÕ¡Ö∏Åç±ÖÕÃÙâ±Ãµ±•ŸîµÕ—Ö…–µÖŸÖ—Ö»à¯ëÌç…ïÖ—Ω»πÖŸÖ—Ö…}’…∞Ä¸ÅÄÒ•µúÅÕ…åÙàëÌïÕçÖ¡ï!—µ∞°ç…ïÖ—Ω»πÖŸÖ—Ö…}’…∞•ÙàÅÖ±–Ùàà˘ÄÄËÅïÕçÖ¡ï!—µ∞°ç…ïÖ—Ω»πÖŸÖ—Ö…}ïµΩ©§ÅÒÄã¬~:∞à•ÙΩÕ¡Ö∏¯(ÄÄÄÄÒÕ¡Ö∏Åç±ÖÕÃÙâ±Ãµ±•ŸîµÕ—Ö…–µçΩ¡‰à¯ÒÕµÖ±∞¯ëÌ•Õ1Ã‹Ä¸ÄâME0ÅQQàÄËÄâ9UY<Å%IQ<âÙÉ
‹ÄëÌ¡±Ö—ôΩ…µ1Öâï±ÙΩÕµÖ±∞¯ÒÕ—…Ωπú˘ ëÌïÕçÖ¡ï!—µ∞°ç…ïÖ—Ω»π’Õï…πÖµî•ÙÅïÕ”ÑÅï∏ÅŸ•ŸºΩÕ—…Ωπú¯Òï¥˘QΩèÑÅ¡Ö…ÑÅŸï»Å±ÖÃÅΩ¡ç•ΩπïÃÅëï∞Åë•…ïç—ºΩï¥¯ΩÕ¡Ö∏¯(ÄÄÄÄÒ§¯ëÌ¡±Ö—ôΩ…µ1Öâï±ÙΩ§˘ÄÏ(ÄÅëΩç’µïπ–πâΩë‰πÖ¡¡ïπë°•±ê°Ö±ï…–§Ï(ÄÅÕï—Q•µïΩ’–††§ÄÙ¯ÅÖ±ï…–π…ïµΩŸî†§∞Äƒ»¿¿¿§Ï)Ù()ô’πç—•Ω∏Å’¡ëÖ—ï9Ω—•ô•çÖ—•Ωπ	Öëùî†§ÅÏ(ÄÅçΩπÕ–Å’π…ïÖêÄÙÅπΩ—•ôÖç°îπô•±—ï»°∏ÄÙ¯ÄÖ∏π…ïÖê§π±ïπù—†Ï(ÄÅçΩπÕ–ÅâÖëùîÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπΩ—•ô	Öëùîà§Ï(ÄÅ•òÄ†ÖâÖëùî§Å…ï—’…∏Ï(ÄÅ•òÄ°’π…ïÖêÄ¯Ä¿§ÅÏ(ÄÄÄÅâÖëùîπ—ï·—Ωπ—ïπ–ÄÙÅ’π…ïÖêÄ¯Ä‰‰Ä¸Äà‰‰¨àÄËÅ’π…ïÖêÏ(ÄÄÄÅâÖëùîπç±ÖÕÕ1•Õ–π…ïµΩŸî†â°•ëëï∏à§Ï(ÄÅÙÅï±ÕîÅÏ(ÄÄÄÅâÖëùîπ—ï·—Ωπ—ïπ–ÄÙÄààÏ(ÄÄÄÅâÖëùîπç±ÖÕÕ1•Õ–πÖëê†â°•ëëï∏à§Ï(ÄÅÙ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖë9Ω—•ô•çÖ—•ΩπÃ†§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—UÕï»§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕà(ÄÄÄÄπô…Ω¥†âπΩ—•ô•çÖ—•ΩπÃà§(ÄÄÄÄπÕï±ïç–†à®à§(ÄÄÄÄπïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§(ÄÄÄÄπΩ…ëï»†âç…ïÖ—ïë}Ö–à∞ÅÏÅÖÕçïπë•πúËÅôÖ±ÕîÅÙ§(ÄÄÄÄπ±•µ•–†»¿§Ï((ÄÅ•òÄ°ï……Ω»§ÅÏ(ÄÄÄÅçΩπÕΩ±îπï……Ω»†â……Ω»ÅçÖ…ùÖπëºÅπΩ—•ô•çÖç•ΩπïÃËà∞Åï……Ω»§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅπΩ—•ôÖç°îÄÙÅëÖ—ÑÅÒÅmtÏ(ÄÅ’¡ëÖ—ï9Ω—•ô•çÖ—•Ωπ	Öëùî†§Ï(ÄÅ•òÄ°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπΩ—•ôAÖπï∞à§§Å…ïπëï…9Ω—•ô•çÖ—•ΩπAÖπï±Ωπ—ïπ–†§Ï(ÄÅ•òÄ†Ö›•πëΩ‹π}}±Õ1•ŸïM—Ö…—’¡±ï…—M°Ω›∏§ÅÏ(ÄÄÄÅçΩπÕ–Å…ïçïπ—1•ŸîÄÙÅπΩ—•ôÖç°îπô•πê°∏ÄÙ¯Å∏π—Â¡îÄÙÙÙÄâ±•ŸîàÄòòÄÖ∏π…ïÖêÄòòÅÖ—îππΩ‹†§Ä¥Åπï‹ÅÖ—î°∏πç…ïÖ—ïë}Ö–§πùï—Q•µî†§ÄÄÃÄ®Äÿ¿Ä®Äƒ¿¿¿§Ï(ÄÄÄÅ•òÄ°…ïçïπ—1•Ÿî§ÅÏ(ÄÄÄÄÄÅ›•πëΩ‹π}}±Õ1•ŸïM—Ö…—’¡±ï…—M°Ω›∏ÄÙÅ—…’îÏ(ÄÄÄÄÄÅÕ°Ω›1•ŸïM—Ö…—π•µÖ—•Ω∏°…ïçïπ—1•Ÿî§Ï(ÄÄÄÅÙ(ÄÅÙ)Ù()ô’πç—•Ω∏ÅÕ’âÕç…•âïQΩ9Ω—•ô•çÖ—•ΩπÃ†§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—UÕï»§Å…ï—’…∏Ï(ÄÅ•òÄ°πΩ—•ôIïÖ±—•µï°Öππï∞ÄòòÅπΩ—•ôIïÖ±—•µïUÕï…%êÄÙÙÙÅç’……ïπ—UÕï»π•ê§Å…ï—’…∏Ï(ÄÅ•òÄ°πΩ—•ôIïÖ±—•µï°Öππï∞§ÅÏ(ÄÄÄÅÕàπ…ïµΩŸï°Öππï∞°πΩ—•ôIïÖ±—•µï°Öππï∞§Ï(ÄÄÄÅπΩ—•ôIïÖ±—•µï°Öππï∞ÄÙÅπ’±∞Ï(ÄÄÄÅπΩ—•ôIïÖ±—•µïUÕï…%êÄÙÅπ’±∞Ï(ÄÅÙ((ÄÅπΩ—•ôIïÖ±—•µïUÕï…%êÄÙÅç’……ïπ—UÕï»π•êÏ(ÄÅπΩ—•ôIïÖ±—•µïΩππïç—ïêÄÙÅôÖ±ÕîÏ(ÄÅÕ—Ö…—9Ω—•ô•çÖ—•ΩπÖ±±âÖç¨†§Ï(ÄÅπΩ—•ôIïÖ±—•µï°Öππï∞ÄÙÅÕà(ÄÄÄÄπç°Öππï∞°ÅπΩ—•ô•çÖ—•ΩπÃ¥ëÌç’……ïπ—UÕï»π•ëıÄ§(ÄÄÄÄπΩ∏†â¡ΩÕ—ù…ïÕ}ç°ÖπùïÃà∞ÅÏ(ÄÄÄÄÄÅïŸïπ–ËÄâ%9MIPà∞(ÄÄÄÄÄÅÕç°ïµÑËÄâ¡’â±•åà∞(ÄÄÄÄÄÅ—Öâ±îËÄâπΩ—•ô•çÖ—•ΩπÃà∞(ÄÄÄÄÄÅô•±—ï»ËÅÅ’Õï…}•êıïƒ∏ëÌç’……ïπ—UÕï»π•ëıÄ(ÄÄÄÅÙ∞Å¡ÖÂ±ΩÖêÄÙ¯ÅÏ(ÄÄÄÄÄÅçΩπÕ–ÅπΩ—•ô•çÖ—•Ω∏ÄÙÅ¡ÖÂ±ΩÖêππï‹Ï(ÄÄÄÄÄÄººÅ∞ÅÕΩπëïºÅëîÅ…ïÕ¡Ö±ëºÅ¡’ïëîÅ°Öâï»Å•πçΩ…¡Ω…ÖëºÅï·Öç—Öµïπ—îÅïÕ—îÅÖŸ•Õº(ÄÄÄÄÄÄººÅ’πΩÃÅµ•±•Õïù’πëΩÃÅÖπ—ïÃ∏Å∏ÅïÕîÅçÖÕºÅπºÅ…ï¡ï—•µΩÃÅÕΩπ•ëº∞Å—ΩÖÕ–Åπ§ÅçÖ…—ï∞∏(ÄÄÄÄÄÅ•òÄ°πΩ—•ôÖç°îπÕΩµî°∏ÄÙ¯Å∏π•êÄÙÙÙÅπΩ—•ô•çÖ—•Ω∏π•ê§§Å…ï—’…∏Ï(ÄÄÄÄÄÅπΩ—•ôÖç°îπ’πÕ°•ô–°πΩ—•ô•çÖ—•Ω∏§Ï(ÄÄÄÄÄÅπΩ—•ôÖç°îÄÙÅπΩ—•ôÖç°îπÕ±•çî†¿∞Äÿ¿§Ï(ÄÄÄÄÄÅÕç°ïë’±ï9Ω—•ô•çÖ—•ΩπU%Iïô…ïÕ††§Ï(ÄÄÄÄÄÅ¡±ÖÂ1•ŸïMç…Ω±±9Ω—•ô•çÖ—•ΩπMΩ’πê†§Ï(ÄÄÄÄÄÅÕ°Ω›QΩÖÕ–°ÄëÌùï—9Ω—•ô•çÖ—•Ωπ%çΩ∏°πΩ—•ô•çÖ—•Ω∏π—Â¡î•ÙÄëÌπΩ—•ô•çÖ—•Ω∏πµïÕÕÖùîÅÒÄâ9’ïŸÑÅπΩ—•ô•çÖçßÕ∏âıÄ§Ï(ÄÄÄÄÄÅ•òÄ°πΩ—•ô•çÖ—•Ω∏π—Â¡îÄÙÙÙÄâ±•Ÿîà§ÅÕ°Ω›1•ŸïM—Ö…—π•µÖ—•Ω∏°πΩ—•ô•çÖ—•Ω∏§Ï(ÄÄÄÅÙ§(ÄÄÄÄπÕ’âÕç…•âî°Õ—Ö—’ÃÄÙ¯ÅÏ(ÄÄÄÄÄÅ•òÄ°Õ—Ö—’ÃÄÙÙÙÄâMU	MI%	à§ÅÏ(ÄÄÄÄÄÄÄÅπΩ—•ôIïÖ±—•µïΩππïç—ïêÄÙÅ—…’îÏ(ÄÄÄÄÄÄÄÅçΩπÕΩ±îπ±Ωú†â9Ω—•ô•çÖç•ΩπïÃÅIïÖ±—•µîÅçΩπïç—ÖëÖÃà§Ï(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÅ•òÄ°Õ—Ö—’ÃÄÙÙÙÄâ!991}II=HàÅÒÅÕ—Ö—’ÃÄÙÙÙÄâ1=Mà§ÅÏ(ÄÄÄÄÄÄÄÅπΩ—•ôIïÖ±—•µïΩππïç—ïêÄÙÅôÖ±ÕîÏ(ÄÄÄÄÄÄÄÅπΩ—•ôIïÖ±—•µï°Öππï∞ÄÙÅπ’±∞Ï(ÄÄÄÄÄÄÄÅπΩ—•ôIïÖ±—•µïUÕï…%êÄÙÅπ’±∞Ï(ÄÄÄÄÄÄÄÅÕï—Q•µïΩ’–††§ÄÙ¯ÅÏ(ÄÄÄÄÄÄÄÄÄÅ•òÄ°ç’……ïπ—UÕï»¸π•êÄòòÄÖëΩç’µïπ–π°•ëëï∏§ÅÕ’âÕç…•âïQΩ9Ω—•ô•çÖ—•ΩπÃ†§Ï(ÄÄÄÄÄÄÄÅÙ∞Äƒ‡¿¿§Ï(ÄÄÄÄÄÅÙ(ÄÄÄÅÙ§Ï)Ù()ô’πç—•Ω∏Å…ïπëï…9Ω—•ô•çÖ—•ΩπAÖπï±Ωπ—ïπ–†§ÅÏ(ÄÅçΩπÕ–Å±•Õ–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπΩ—•ôAÖπï±1•Õ–à§Ï(ÄÅ•òÄ†Ö±•Õ–§Å…ï—’…∏Ï(ÄÅ•òÄ†ÖπΩ—•ôÖç°îπ±ïπù—†§ÅÏ(ÄÄÄÅ±•Õ–π•ππï…!Q50ÄÙÅÄÒë•ÿÅç±ÖÕÃÙâ±ÃµπΩ—•òµïµ¡—‰à¯ÒÕ¡Ö∏˚¬~RPΩÕ¡Ö∏¯ÒÕ—…Ωπú˘QΩëºÅ—…Öπ≈’•±ºÅ¡Ω»ÅÖèÑΩÕ—…Ωπú¯ÒÕµÖ±∞˘1ÖÃÅπΩŸïëÖëïÃÅëîÅ—‘Åç’ïπ—ÑÅÖ¡Ö…ïçïÀÖ∏Åï∏ÅïÕ—îÅ±’ùÖ»∏ΩÕµÖ±∞¯Ωë•ÿ˘ÄÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–Åù…Ω’¡ïêÄÙÅmtÏ(ÄÅçΩπÕ–Åù…Ω’¡Õ	Â-ï‰ÄÙÅπï‹Å5Ö¿†§Ï(ÄÅπΩ—•ôÖç°îπôΩ…Öç†°∏ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–Å≠ï‰ÄÙÅ∏π—Â¡îÄÙÙÙÄâ±•≠îà(ÄÄÄÄÄÄ¸ÅÅ±•≠îËëÌ∏πŸ•ëïΩ}•êÅÒÅ∏πµïÕÕÖùîÅÒÄâùïπï…Ö∞âıÄ(ÄÄÄÄÄÄËÅ∏π—Â¡îÄÙÙÙÄâôΩ±±Ω‹à(ÄÄÄÄÄÄÄÄ¸ÅÅôΩ±±Ω‹ËëÌ∏πÖç—Ω…}•êÅÒÅ∏πµïÕÕÖùîÅÒÅ∏π•ëıÄ(ÄÄÄÄÄÄÄÄËÅ∏π—Â¡îÄÙÙÙÄâçΩµµïπ–à(ÄÄÄÄÄÄÄÄÄÄ¸ÅÅçΩµµïπ–ËëÌ∏πŸ•ëïΩ}•êÅÒÄàâÙËëÌ∏πÖç—Ω…}•êÅÒÅ∏π•ëıÄ(ÄÄÄÄÄÄÄÄÄÄËÅ∏π—Â¡îÄÙÙÙÄâ±•Ÿîà(ÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÅ±•ŸîËëÌ∏πÖç—Ω…}•êÅÒÅ∏πµïÕÕÖùîÅÒÅ∏π•ëıÄ(ÄÄÄÄÄÄÄÄÄÄÄÄËÅÄëÌ∏π—Â¡îÅÒÄâÕÂÕ—ï¥âÙËëÌ∏πµïÕÕÖùîÅÒÅ∏π•ëıÄÏ(ÄÄÄÅ±ï–Åù…Ω’¿ÄÙÅù…Ω’¡Õ	Â-ï‰πùï–°≠ï‰§Ï(ÄÄÄÅ•òÄ†Öù…Ω’¿§ÅÏ(ÄÄÄÄÄÅù…Ω’¿ÄÙÅÏÄ∏∏π∏∞Åµïµâï…ÃÈmt∞Åù…Ω’¡Uπ…ïÖêÈôÖ±ÕîÅÙÏ(ÄÄÄÄÄÅù…Ω’¡Õ	Â-ï‰πÕï–°≠ï‰∞Åù…Ω’¿§Ï(ÄÄÄÄÄÅù…Ω’¡ïêπ¡’Õ†°ù…Ω’¿§Ï(ÄÄÄÅÙ(ÄÄÄÅù…Ω’¿πµïµâï…Ãπ¡’Õ†°∏π•ê§Ï(ÄÄÄÅ•òÄ†Ö∏π…ïÖê§Åù…Ω’¿πù…Ω’¡Uπ…ïÖêÄÙÅ—…’îÏ(ÄÅÙ§Ï((ÄÅ›•πëΩ‹π}}πΩ—•ô…Ω’¡5ïµâï…ÃÄÙÅÌÙÏ(ÄÅù…Ω’¡ïêπôΩ…Öç†°ù…Ω’¿ÄÙ¯ÅÏÅ›•πëΩ‹π}}πΩ—•ô…Ω’¡5ïµâï…Õmù…Ω’¿π•ëtÄÙÅù…Ω’¿πµïµâï…ÃÏÅÙ§Ï(ÄÅçΩπÕ–ÅŸ•Õ•â±îÄÙÅù…Ω’¡ïêπÕ±•çî†¿∞ÅπΩ—•ôY•Õ•â±ïΩ’π–§Ï(ÄÅçΩπÕ–Åπï›%—ïµÃÄÙÅŸ•Õ•â±îπô•±—ï»°∏ÄÙ¯Å∏πù…Ω’¡Uπ…ïÖê§Ï(ÄÅçΩπÕ–Å¡…ïŸ•Ω’Õ%—ïµÃÄÙÅŸ•Õ•â±îπô•±—ï»°∏ÄÙ¯ÄÖ∏πù…Ω’¡Uπ…ïÖê§Ï((ÄÅçΩπÕ–Å…ïπëï……Ω’¿ÄÙÄ°•—ïµÃ∞Å—•—±î§ÄÙ¯Å•—ïµÃπ±ïπù—†Ä¸ÅÄ(ÄÄÄÄÒÕïç—•Ω∏Åç±ÖÕÃÙâ±ÃµπΩ—•òµÕïç—•Ω∏à¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµπΩ—•òµÕïç—•Ω∏µ—•—±îà¯ëÌ—•—±ïÙÒÕ¡Ö∏¯ëÌ•—ïµÃπ±ïπù—°ÙΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄëÌ•—ïµÃπµÖ¿°∏ÄÙ¯ÅÏ(ÄÄÄÄÄÄÄÅçΩπÕ–Åç±•ç≠Öâ±îÄÙÅ∏πŸ•ëïΩ}•êÅÒÅ∏πÖç—Ω…}•êÅÒÅ∏πçΩµµïπ—}•êÏ(ÄÄÄÄÄÄÄÅ…ï—’…∏ÅÄÒâ’——Ω∏Åç±ÖÕÃÙâ±ÃµπΩ—•òµ•—ï¥ëÌ∏πù…Ω’¡Uπ…ïÖêÄ¸ÄàÅ•Ãµ’π…ïÖêàÄËÄàâÙàÅΩπç±•ç¨ÙàëÌç±•ç≠Öâ±îÄ¸ÅÅ°Öπë±ï9Ω—•ô•çÖ—•Ωπ±•ç¨†úëÌ∏π•ëÙú•ÄÄËÄâŸΩ•ê†¿§âÙà¯(ÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏Åç±ÖÕÃÙâ±ÃµπΩ—•òµ•çΩ∏à¯ëÌùï—9Ω—•ô•çÖ—•Ωπ%çΩ∏°∏π—Â¡î•ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏Åç±ÖÕÃÙâ±ÃµπΩ—•òµçΩ¡‰à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕ—…Ωπú¯ëÌïÕçÖ¡ï!—µ∞°∏πµïÕÕÖùîÅÒÄâ9’ïŸÑÅπΩ—•ô•çÖçßÕ∏à•ÙëÌ∏πµïµâï…Ãπ±ïπù—†Ä¯ÄƒÄ¸ÅÄÄÒï¥¯¨ëÌ∏πµïµâï…Ãπ±ïπù—†Ä¥Ä≈ÙΩï¥˘ÄÄËÄàâÙΩÕ—…Ωπú¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕµÖ±∞¯ëÌôΩ…µÖ—9Ω—•ô•çÖ—•ΩπQ•µî°∏πç…ïÖ—ïë}Ö–•ÙëÌç±•ç≠Öâ±îÄ¸ÄàÉ
‹ÅQΩèÑÅ¡Ö…ÑÅÖâ…•»àÄËÄàâÙΩÕµÖ±∞¯(ÄÄÄÄÄÄÄÄÄÄΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄëÌ∏πù…Ω’¡Uπ…ïÖêÄ¸ÅÄÒ§ÅÖ…•Ñµ±Öâï∞Ùâ9’ïŸÑà¯Ω§˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄΩâ’——Ω∏˘ÄÏ(ÄÄÄÄÄÅÙ§π©Ω•∏†àà•Ù(ÄÄÄÄΩÕïç—•Ω∏˘ÄÄËÄààÏ((ÄÅ±•Õ–π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµπΩ—•òµ—ΩΩ±Ãà¯(ÄÄÄÄÄÄÒâ’——Ω∏ÅΩπç±•ç¨Ùâ—Ωùù±ï1•ŸïMç…Ω±±9Ω—•ô•çÖ—•ΩπMΩ’πê†§à¯ëÌ•Õ9Ω—•ô•çÖ—•ΩπMΩ’πëπÖâ±ïê†§Ä¸Äã¬~R(ÅMΩπ•ëºÅÖç—•ŸºàÄËÄã¬~RÅç—•ŸÖ»ÅÕΩπ•ëºâÙΩâ’——Ω∏¯(ÄÄÄÄÄÄëÌπΩ—•ôÖç°îπÕΩµî°∏ÄÙ¯ÄÖ∏π…ïÖê§Ä¸ÅÄÒâ’——Ω∏ÅΩπç±•ç¨ÙâµÖ…≠±±9Ω—•ô•çÖ—•ΩπÕIïÖê†§à˚ärLÅ1ïï»Å—ΩëÖÃΩâ’——Ω∏˘ÄÄËÅÄÒÕ¡Ö∏˘QΩëºÅ±óµëºΩÕ¡Ö∏˘ÅÙ(ÄÄÄÄΩë•ÿ¯(ÄÄÄÄëÌ…ïπëï……Ω’¿°πï›%—ïµÃ∞Äâ9’ïŸÖÃà•Ù(ÄÄÄÄëÌ…ïπëï……Ω’¿°¡…ïŸ•Ω’Õ%—ïµÃ∞Äâπ—ï…•Ω…ïÃà•Ù(ÄÄÄÄëÌù…Ω’¡ïêπ±ïπù—†Ä¯ÅŸ•Õ•â±îπ±ïπù—†Ä¸ÅÄÒâ’——Ω∏Åç±ÖÕÃÙâ±ÃµπΩ—•òµµΩ…îàÅΩπç±•ç¨ÙâπΩ—•ôY•Õ•â±ïΩ’π–Ä¨ÙÄƒ‡ÏÅ…ïπëï…9Ω—•ô•çÖ—•ΩπAÖπï±Ωπ—ïπ–†§à˘Yï»ÅÖπ—ï…•Ω…ïÃÄ†ëÌù…Ω’¡ïêπ±ïπù—†Ä¥ÅŸ•Õ•â±îπ±ïπù—°Ù§Ωâ’——Ω∏˘ÄÄËÄàâıÄÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅµÖ…≠±±9Ω—•ô•çÖ—•ΩπÕIïÖê†§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—UÕï»§Å…ï—’…∏Ï(ÄÅçΩπÕ–Å…ïÕ’±–ÄÙÅÖ›Ö•–ÅÕàπ…¡å†âµÖ…≠}πΩ—•ô•çÖ—•ΩπÕ}…ïÖêà∞ÅÏÅ¡}’Õï…}•êÈç’……ïπ—UÕï»π•êÅÙ§Ï(ÄÅ•òÄ°…ïÕ’±–¸πï……Ω»§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ë•ï…Ω∏ÅµÖ…çÖ»Å±ÖÃÅπΩ—•ô•çÖç•ΩπïÃà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅπΩ—•ôÖç°îÄÙÅπΩ—•ôÖç°îπµÖ¿°∏ÄÙ¯Ä°ÏÄ∏∏π∏∞Å…ïÖêÈ—…’îÅÙ§§Ï(ÄÅ’¡ëÖ—ï9Ω—•ô•çÖ—•Ωπ	Öëùî†§Ï(ÄÅ…ïπëï…9Ω—•ô•çÖ—•ΩπAÖπï±Ωπ—ïπ–†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅµÖ…≠9Ω—•ô•çÖ—•Ωπ…Ω’¡IïÖê°πΩ—•ô•çÖ—•Ωπ%ê§ÅÏ(ÄÅçΩπÕ–Å•ëÃÄÙÅ›•πëΩ‹π}}πΩ—•ô…Ω’¡5ïµâï…Ã¸πmπΩ—•ô•çÖ—•Ωπ%ëtÅÒÅmπΩ—•ô•çÖ—•Ωπ%ëtÏ(ÄÅçΩπÕ–Å•ëMï–ÄÙÅπï‹ÅMï–°•ëÃ§Ï(ÄÅπΩ—•ôÖç°îÄÙÅπΩ—•ôÖç°îπµÖ¿°∏ÄÙ¯Å•ëMï–π°ÖÃ°∏π•ê§Ä¸Ä°ÏÄ∏∏π∏∞Å…ïÖêÈ—…’îÅÙ§ÄËÅ∏§Ï(ÄÅ’¡ëÖ—ï9Ω—•ô•çÖ—•Ωπ	Öëùî†§Ï(ÄÅ—…‰ÅÏ(ÄÄÄÅÖ›Ö•–ÅÕàπô…Ω¥†âπΩ—•ô•çÖ—•ΩπÃà§π’¡ëÖ—î°ÏÅ…ïÖêÈ—…’îÅÙ§πïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§π•∏†â•êà∞Å•ëÃ§Ï(ÄÅÙÅçÖ—ç†Ä°|§ÅÌÙ)Ù()ô’πç—•Ω∏ÅôΩ…µÖ—9Ω—•ô•çÖ—•ΩπQ•µî°ëÖ—ïM—…•πú§ÅÏ(ÄÅçΩπÕ–ÅëÖ—îÄÙÅπï‹ÅÖ—î°ëÖ—ïM—…•πú§Ï(ÄÅçΩπÕ–Åë•ôôMïçΩπëÃÄÙÅ5Ö—†πµÖ‡†¿∞Å5Ö—†πô±ΩΩ»†°Ö—îππΩ‹†§Ä¥ÅëÖ—îπùï—Q•µî†§§ÄºÄƒ¿¿¿§§Ï(ÄÅ•òÄ°ë•ôôMïçΩπëÃÄÄÿ¿§Å…ï—’…∏Äâ°Ω…ÑàÏ(ÄÅçΩπÕ–Åµ•π’—ïÃÄÙÅ5Ö—†πô±ΩΩ»°ë•ôôMïçΩπëÃÄºÄÿ¿§Ï(ÄÅ•òÄ°µ•π’—ïÃÄÄÿ¿§Å…ï—’…∏ÅÅ!ÖçîÄëÌµ•π’—ïÕÙÅµ•πÄÏ(ÄÅçΩπÕ–Å°Ω’…ÃÄÙÅ5Ö—†πô±ΩΩ»°µ•π’—ïÃÄºÄÿ¿§Ï(ÄÅ•òÄ°°Ω’…ÃÄÄ»–§Å…ï—’…∏ÅÅ!ÖçîÄëÌ°Ω’…ÕÙÅ°ÄÏ(ÄÅçΩπÕ–ÅëÖÂÃÄÙÅ5Ö—†πô±ΩΩ»°°Ω’…ÃÄºÄ»–§Ï(ÄÅ•òÄ°ëÖÂÃÄÙÄ‹§Å…ï—’…∏ÅÅ!ÖçîÄëÌëÖÂÕÙÅëÄÏ(ÄÅ…ï—’…∏ÅëÖ—îπ—Ω1ΩçÖ±ïÖ—ïM—…•πú†âïÃµHà∞ÅÏÅëÖ‰ËÄà»µë•ù•–à∞ÅµΩπ—†ËÄà»µë•ù•–à∞ÅÂïÖ»ËÄâπ’µï…•åàÅÙ§Ï)Ù()ô’πç—•Ω∏Å—Ωùù±ï9Ω—•ôAÖπï∞†§ÅÏ(ÄÅçΩπÕ–Åï·•Õ—•πúÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπΩ—•ôAÖπï∞à§Ï(ÄÅ•òÄ°ï·•Õ—•πú§ÅÏÅï·•Õ—•πúπ…ïµΩŸî†§ÏÅ…ï—’…∏ÏÅÙ((ÄÅπΩ—•ôY•Õ•â±ïΩ’π–ÄÙÄƒ‡Ï(ÄÅçΩπÕ–Å¡Öπï∞ÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âë•ÿà§Ï(ÄÅ¡Öπï∞π•êÄÙÄâπΩ—•ôAÖπï∞àÏ(ÄÅ¡Öπï∞πç±ÖÕÕ9ÖµîÄÙÄâ±ÃµÕΩç•Ö∞µ¡’±Õîµ¡Öπï∞àÏ(ÄÅ¡Öπï∞π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµπΩ—•òµ°ïÖêà¯(ÄÄÄÄÄÄÒë•ÿ¯ÒÕ¡Ö∏˘M=%0ÅAU1MΩÕ¡Ö∏¯ÒÕ—…Ωπú˘9Ω—•ô•çÖç•ΩπïÃΩÕ—…Ωπú¯ÒÕµÖ±∞˘Q‘ÅÖç—•Ÿ•ëÖêÅï∏Å—•ïµ¡ºÅ…ïÖ∞ΩÕµÖ±∞¯Ωë•ÿ¯(ÄÄÄÄÄÄÒâ’——Ω∏ÅΩπç±•ç¨ÙâëΩç’µïπ–πùï—±ïµïπ—	Â%ê†ùπΩ—•ôAÖπï∞ú§¸π…ïµΩŸî†§àÅÖ…•Ñµ±Öâï∞Ùâï……Ö»à˚ärTΩâ’——Ω∏¯(ÄÄÄÄΩë•ÿ¯(ÄÄÄÄÒë•ÿÅ•êÙâπΩ—•ôAÖπï±1•Õ–àÅç±ÖÕÃÙâ±ÃµπΩ—•òµ±•Õ–à¯Ωë•ÿ˘ÄÏ(ÄÅëΩç’µïπ–πâΩë‰πÖ¡¡ïπë°•±ê°¡Öπï∞§Ï(ÄÅ…ïπëï…9Ω—•ô•çÖ—•ΩπAÖπï±Ωπ—ïπ–†§Ï((ÄÅÕï—Q•µïΩ’–††§ÄÙ¯ÅÏ(ÄÄÄÅëΩç’µïπ–πÖëëŸïπ—1•Õ—ïπï»†âç±•ç¨à∞Åô’πç—•Ω∏Åç±ΩÕï=π=’—Õ•ëï±•ç¨°î§ÅÏ(ÄÄÄÄÄÅçΩπÕ–Å¡Öπï±∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπΩ—•ôAÖπï∞à§Ï(ÄÄÄÄÄÅ•òÄ†Ö¡Öπï±∞§ÅÏÅëΩç’µïπ–π…ïµΩŸïŸïπ—1•Õ—ïπï»†âç±•ç¨à∞Åç±ΩÕï=π=’—Õ•ëï±•ç¨§ÏÅ…ï—’…∏ÏÅÙ(ÄÄÄÄÄÅ•òÄ†Ö¡Öπï±∞πçΩπ—Ö•πÃ°îπ—Ö…ùï–§ÄòòÅîπ—Ö…ùï–π•êÄÑÙÙÄâπΩ—•ô	ï±∞àÄòòÄÖîπ—Ö…ùï–πç±ΩÕïÕ–†àçπΩ—•ô	ï±∞à§§ÅÏ(ÄÄÄÄÄÄÄÅ¡Öπï±∞π…ïµΩŸî†§Ï(ÄÄÄÄÄÄÄÅëΩç’µïπ–π…ïµΩŸïŸïπ—1•Õ—ïπï»†âç±•ç¨à∞Åç±ΩÕï=π=’—Õ•ëï±•ç¨§Ï(ÄÄÄÄÄÅÙ(ÄÄÄÅÙ§Ï(ÄÅÙ∞Ä¿§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï9Ω—•ô•çÖ—•Ωπ±•ç¨°πΩ—•ô•çÖ—•Ωπ%ê§ÅÏ(ÄÅçΩπÕ–ÅπΩ—•ô•çÖ—•Ω∏ÄÙÅπΩ—•ôÖç°îπô•πê°∏ÄÙ¯Å∏π•êÄÙÙÙÅπΩ—•ô•çÖ—•Ωπ%ê§Ï(ÄÅ•òÄ†ÖπΩ—•ô•çÖ—•Ω∏§Å…ï—’…∏Ï(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπΩ—•ôAÖπï∞à§¸π…ïµΩŸî†§Ï(ÄÅµÖ…≠9Ω—•ô•çÖ—•Ωπ…Ω’¡IïÖê°πΩ—•ô•çÖ—•Ωπ%ê§Ï((ÄÅ•òÄ°πΩ—•ô•çÖ—•Ω∏π—Â¡îÄÙÙÙÄâçΩµµïπ–àÄòòÅπΩ—•ô•çÖ—•Ω∏πŸ•ëïΩ}•ê§ÅÏ(ÄÄÄÅÖ›Ö•–ÅΩ¡ïπΩµµïπ—Ã°πΩ—•ô•çÖ—•Ω∏πŸ•ëïΩ}•ê∞ÅπΩ—•ô•çÖ—•Ω∏πçΩµµïπ—}•êÅÒÅπ’±∞§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅ•òÄ°πΩ—•ô•çÖ—•Ω∏π—Â¡îÄÙÙÙÄâ±•≠îàÄòòÅπΩ—•ô•çÖ—•Ω∏πŸ•ëïΩ}•ê§ÅÏ(ÄÄÄÅÖ›Ö•–ÅΩ¡ïπM°Ö…ïëY•ëïº°πΩ—•ô•çÖ—•Ω∏πŸ•ëïΩ}•ê§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅ•òÄ°πΩ—•ô•çÖ—•Ω∏π—Â¡îÄÙÙÙÄâ±•Ÿîà§ÅÏ(ÄÄÄÅÕ›•—ç°QÖà†âë•…ïç—ΩÃà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅ•òÄ°πΩ—•ô•çÖ—•Ω∏π—Â¡îÄÙÙÙÄâôΩ±±Ω‹àÄòòÅπΩ—•ô•çÖ—•Ω∏πÖç—Ω…}•ê§ÅÏ(ÄÄÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅÖç—Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†â¡…Ωô•±ïÃà§πÕï±ïç–†â’Õï…πÖµîà§πïƒ†â•êà∞ÅπΩ—•ô•çÖ—•Ω∏πÖç—Ω…}•ê§πµÖÂâïM•πù±î†§Ï(ÄÄÄÅ•òÄ†ÖÖç—Ω»¸π’Õï…πÖµî§ÅÏÅÕ°Ω›QΩÖÕ–†âÕîÅ¡ï…ô•∞ÅÂÑÅπºÅïÕ”ÑÅë•Õ¡Ωπ•â±îà§ÏÅ…ï—’…∏ÏÅÙ(ÄÄÄÅÖ›Ö•–ÅŸ•ï›A’â±•çA…Ωô•±î°Öç—Ω»π’Õï…πÖµî§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅ•òÄ°πΩ—•ô•çÖ—•Ω∏πŸ•ëïΩ}•ê§ÅÏÅÖ›Ö•–ÅΩ¡ïπM°Ö…ïëY•ëïº°πΩ—•ô•çÖ—•Ω∏πŸ•ëïΩ}•ê§ÏÅ…ï—’…∏ÏÅÙ(ÄÅ•òÄ°πΩ—•ô•çÖ—•Ω∏πÖç—Ω…}•ê§ÅÏ(ÄÄÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅÖç—Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†â¡…Ωô•±ïÃà§πÕï±ïç–†â’Õï…πÖµîà§πïƒ†â•êà∞ÅπΩ—•ô•çÖ—•Ω∏πÖç—Ω…}•ê§πµÖÂâïM•πù±î†§Ï(ÄÄÄÅ•òÄ°Öç—Ω»¸π’Õï…πÖµî§ÅÖ›Ö•–ÅŸ•ï›A’â±•çA…Ωô•±î°Öç—Ω»π’Õï…πÖµî§Ï(ÄÅÙ)Ù()ô’πç—•Ω∏ÅçΩ¡ÂIïôï……Ö±1•π¨†§ÅÏ(ÄÅçΩπÕ–Å•π¡’–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â…ïôï……Ö±1•π≠%π¡’–à§Ï(ÄÅ•π¡’–πÕï±ïç–†§Ï(ÄÅπÖŸ•ùÖ—Ω»πç±•¡âΩÖ…êπ›…•—ïQï·–°•π¡’–πŸÖ±’î§π—°ï∏††§ÄÙ¯ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†ã
Ö1•π¨ÅçΩ¡•ÖëºÑà§Ï(ÄÅÙ§πçÖ—ç†††§ÄÙ¯ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅçΩ¡•Ö»∞ÅÕï±ïçç•ΩπÖ±ºÅÑÅµÖπºà§Ï(ÄÅÙ§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅΩ¡ïπë•—A…Ωô•±î†§ÅÏ(ÄÅçΩπÕ–ÅâÖÕïµΩ©•ÃÄÙÅlã¬~:∞à∞ãäjÑà∞ã¬~Rîà∞ã¬~:∏à∞ã¬~:úà∞ã¬~B@à∞ã¬~j à∞ã¬~J8à∞ã¬~b8à∞ã¬~:ºâtÏ(ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅ’π±Ωç≠ïêÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†â’Õï…}’π±Ωç≠ïë}ïµΩ©•Ãà§πÕï±ïç–†âïµΩ©§à§πïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§Ï(ÄÅçΩπÕ–ÅïµΩ©•ÃÄÙÅl∏∏πâÖÕïµΩ©•Ã∞Ä∏∏∏°’π±Ωç≠ïêÅÒÅmt§πµÖ¿°‘ÄÙ¯Å‘πïµΩ©§§πô•±—ï»°îÄÙ¯ÄÖâÖÕïµΩ©•Ãπ•πç±’ëïÃ°î§•tÏ(ÄÅçΩπÕ–Å•Õ…ïÖ—Ω»ÄÙÅç’……ïπ—A…Ωô•±îπ•Õ}ç…ïÖ—Ω»ÄÙÙÙÅ—…’îÏ(ÄÅçΩπÕ–Åç…ïÖ—Ω…M—Ö—’ÃÄÙÅç’……ïπ—A…Ωô•±îπç…ïÖ—Ω…}Ö¡¡±•çÖ—•Ωπ}Õ—Ö—’ÃÏ(ÄÅçΩπÕ–Åç…ïÖ—Ω…Iï≈’•…ïµïπ—Õ5ï–ÄÙÅç’……ïπ—A…Ωô•±îπç…ïÖ—Ω…}Ÿ•ëïΩ}çΩ’π–Ä¯ÙÄ‘ÄòòÅç’……ïπ—A…Ωô•±îπç…ïÖ—Ω…}ÖççΩ’π—}ëÖÂÃÄ¯ÙÄ‹ÄòòÄÖç’……ïπ—A…Ωô•±îπ•Õ}â±Ωç≠ïêÏ((ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µΩŸï…±Ö‰Å±ÃµµΩëÖ∞µ±Ωç≠ïêàÅëÖ—ÑµµΩëÖ∞µ±Ωç≠ïêÙàƒàÅÕ—Â±îÙâËµ•πëï‡Ëƒ¿¿Ïà¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡Å±Ãµ¡…Ωô•±îµïë•–µµΩëÖ∞àÅÕ—Â±îÙâµÖ‡µ›•ë—†Ë–»¡¡‡ÌµÖ‡µ°ï•ù°–Ë‰…ëŸ†ÌΩŸï…ô±Ω‹È°•ëëï∏Ìë•Õ¡±Ö‰Èô±ï‡Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µ°ïÖëï»Å±Ãµ¡…Ωô•±îµïë•–µ°ïÖëï»àÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌùÖ¿Ëƒ¡¡‡Ì¡ΩÕ•—•Ω∏ÈÕ—•ç≠‰Ì—Ω¿Ë¿ÌËµ•πëï‡Ë‘ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒ†»ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÂ¡‡ÌµÖ…ù•∏Ë¿Ïà˘ë•—Ö»Å¡ï…ô•∞Ω†»¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅΩπç±•ç¨Ùâç±ΩÕï5ÖπÖùïë5ΩëÖ∞†§à(ÄÄÄÄÄÄÄÄÄÄÄÅÖ…•Ñµ±Öâï∞Ùâï……Ö»à(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ›•ë—†Ë–¡¡‡Ì°ï•ù°–Ë–¡¡‡Ìµ•∏µ›•ë—†Ë–¡¡‡ÌâΩ…ëï»µ…Öë•’ÃË‘¿îÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÌôΩπ–µÕ•ÈîËƒ·¡‡Ìç’…ÕΩ»È¡Ω•π—ï»Ïà˚ärTΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µâΩë‰Å±Ãµ¡…Ωô•±îµïë•–µâΩë‰àÅÕ—Â±îÙâΩŸï…ô±Ω‹µ‰ÈÖ’—ºÌµ•∏µ°ï•ù°–Ë¿Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâô•ï±êàÅÕ—Â±îÙâ—ï·–µÖ±•ù∏Èçïπ—ï»Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒ±Öâï∞˘Ω—ºÅëîÅ¡ï…ô•∞Ω±Öâï∞¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌç’……ïπ—A…Ωô•±îπÖŸÖ—Ö…}’…∞(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒ•µúÅÕ…åÙàëÌïÕçÖ¡ï!—µ∞°ç’……ïπ—A…Ωô•±îπÖŸÖ—Ö…}’…∞•ÙàÅÖ±–ÙâÖŸÖ—Ö»àÅÕ—Â±îÙâ›•ë—†Ë‡¡¡‡ÏÅ°ï•ù°–Ë‡¡¡‡ÏÅâΩ…ëï»µ…Öë•’ÃË‘¿îÏÅΩâ©ïç–µô•–ÈçΩŸï»ÏÅâΩ…ëï»Ë…¡‡ÅÕΩ±•êÅŸÖ»†¥µùΩ±êµë•¥§Ïà˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄËÅÄÒë•ÿÅÕ—Â±îÙâ›•ë—†Ë‡¡¡‡ÏÅ°ï•ù°–Ë‡¡¡‡ÏÅâΩ…ëï»µ…Öë•’ÃË‘¿îÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§ÏÅë•Õ¡±Ö‰Èô±ï‡ÏÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÏÅ©’Õ—•ô‰µçΩπ—ïπ–Èçïπ—ï»ÏÅôΩπ–µÕ•ÈîËÃŸ¡‡ÏÅµÖ…ù•∏Ë¿ÅÖ’—ºÏà¯ëÌç’……ïπ—A…Ωô•±îπÖŸÖ—Ö…}ïµΩ©§ÅÒÄã¬~:∞âÙΩë•ÿ˘ÅÙ(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâô•±îàÅ•êÙâÖŸÖ—Ö…A°Ω—Ω%π¡’–àÅÖççï¡–Ùâ•µÖùîº®àÅΩπç°ÖπùîÙâ°Öπë±ïŸÖ—Ö…A°Ω—ΩU¡±ΩÖê†§àÅÕ—Â±îÙâë•Õ¡±Ö‰ÈπΩπîÏà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµÖπë…Ω•êµµïë•ÑµÖç—•ΩπÃà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâΩ¡ïπ1•ŸïMç…Ω±±πë…Ω•ë5ïë•Ñ†ùô•±ïÃú∞ùÖŸÖ—Ö…A°Ω—Ω%π¡’–ú∞ùï±ïù•»Å’πÑÅôΩ—ºÅ¡Ö…ÑÅ—‘Å¡ï…ô•∞ú∞ùô•±ïÃú§à˚¬~NÅ±ïù•»ÅôΩ—ºΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâΩ¡ïπ1•ŸïMç…Ω±±πë…Ω•ë5ïë•Ñ†ùçÖµï…Ñú∞ùÖŸÖ—Ö…A°Ω—Ω%π¡’–ú∞ù—ΩµÖ»Å’πÑÅôΩ—ºÅ¡Ö…ÑÅ—‘Å¡ï…ô•∞ú∞ùçÖµï…Ñú§à˚¬~N‹ÅUÕÖ»ÅèÖµÖ…ÑΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅ•êÙâÖŸÖ—Ö…U¡±ΩÖëM—Ö—’ÃàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅµÖ…ù•∏µ—Ω¿ËŸ¡‡Ïà˘7Ö·•µºÄÕ5∏ÅM§ÅÕ’ãµÃÅ’πÑÅôΩ—º∞Å—Ö¡ÑÅÖ∞ÅïµΩ©§∏Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄëÌç’……ïπ—A…Ωô•±îπÖŸÖ—Ö…}’…∞Ä¸ÅÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ëƒ¡¡‡ÏÅ¡Öëë•πúËÂ¡‡Äƒ—¡‡ÏÅôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅ›•ë—†Ëƒ¿¿îÏÅçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÏÅâΩ…ëï»µçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÏÅôΩπ–µ›ï•ù°–Ëÿ¿¿ÏàÅΩπç±•ç¨Ùâ°Öπë±ïIïµΩŸïŸÖ—Ö…A°Ω—º†§à˚¬~^Gæ‚<ÅE’•—Ö»ÅôΩ—ºÅ‰ÅŸΩ±Ÿï»ÅÖ∞ÅïµΩ©§Ωâ’——Ω∏˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâô•ï±êà¯(ÄÄÄÄÄÄÄÄÄÄÒ±Öâï∞˘AΩ…—ÖëÑÅëï∞Å¡ï…ô•∞Ω±Öâï∞¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅ•êÙâçΩŸï…AΩÕ•—•ΩπA…ïŸ•ï‹à(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙââΩ…ëï»µ…Öë•’ÃËƒ¡¡‡ÌΩŸï…ô±Ω‹È°•ëëï∏Ì°ï•ù°–Ëƒ¿’¡‡ÌâÖç≠ù…Ω’πêËëÌç’……ïπ—A…Ωô•±îπçΩŸï…}’…∞Ä¸ÅÅ’…∞†úëÌïÕçÖ¡ï!—µ∞°ç’……ïπ—A…Ωô•±îπçΩŸï…}’…∞•Ùú§Åçïπ—ï»ÄëÌ9’µâï»°ç’……ïπ—A…Ωô•±îπçΩŸï…}¡ΩÕ•—•Ωπ}‰Ä¸¸Ä‘¿•ÙîΩçΩŸï»Åπºµ…ï¡ïÖ—ÄÄËÄâŸÖ»†¥µ¡Öπï∞¥»§âÙÌµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ïà¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄëÌç’……ïπ—A…Ωô•±îπçΩŸï…}’…∞Ä¸ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ…¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌùÖ¿Ë·¡‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌµÖ…ù•∏µâΩ——Ω¥Ë’¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘çΩµΩëÖ»Å•µÖùï∏ΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏Å•êÙâçΩŸï…AΩÕ•—•ΩπYÖ±’îàÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ïà¯ëÌ9’µâï»°ç’……ïπ—A…Ωô•±îπçΩŸï…}¡ΩÕ•—•Ωπ}‰Ä¸¸Ä‘¿•ÙîΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ…ÖπùîàÅ•êÙâçΩŸï…AΩÕ•—•ΩπIÖπùîàÅµ•∏Ùà¿àÅµÖ‡Ùàƒ¿¿àÅÕ—ï¿Ùàƒà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅŸÖ±’îÙàëÌ9’µâï»°ç’……ïπ—A…Ωô•±îπçΩŸï…}¡ΩÕ•—•Ωπ}‰Ä¸¸Ä‘¿•Ùà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩπ•π¡’–Ùâ¡…ïŸ•ï›ΩŸï…AΩÕ•—•Ω∏°—°•ÃπŸÖ±’î§à(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë…¡‡Ïà¯ÒÕ¡Ö∏˘……•âÑΩÕ¡Ö∏¯ÒÕ¡Ö∏˘âÖ©ºΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ˘ÄÄËÄàâÙ((ÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâô•±îàÅ•êÙâçΩŸï…A°Ω—Ω%π¡’–àÅÖççï¡–Ùâ•µÖùîº®àÅΩπç°ÖπùîÙâ°Öπë±ïΩŸï…A°Ω—ΩU¡±ΩÖê†§àÅÕ—Â±îÙâë•Õ¡±Ö‰ÈπΩπîÏà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµÖπë…Ω•êµµïë•ÑµÖç—•ΩπÃà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâΩ¡ïπ1•ŸïMç…Ω±±πë…Ω•ë5ïë•Ñ†ùô•±ïÃú∞ùçΩŸï…A°Ω—Ω%π¡’–ú∞ùï±ïù•»Å±ÑÅ¡Ω…—ÖëÑÅëîÅ—‘Å¡ï…ô•∞ú∞ùô•±ïÃú§à˚¬~NÅ±ïù•»Å¡Ω…—ÖëÑΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâΩ¡ïπ1•ŸïMç…Ω±±πë…Ω•ë5ïë•Ñ†ùçÖµï…Ñú∞ùçΩŸï…A°Ω—Ω%π¡’–ú∞ù—ΩµÖ»Å’πÑÅôΩ—ºÅ¡Ö…ÑÅ—‘Å¡Ω…—ÖëÑú∞ùçÖµï…Ñú§à˚¬~N‹ÅUÕÖ»ÅèÖµÖ…ÑΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅ•êÙâçΩŸï…U¡±ΩÖëM—Ö—’ÃàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅµÖ…ù•∏µ—Ω¿ËŸ¡‡Ïà˘7Ö·•µºÄ’5∏ÅïÕ¡◊•ÃÅ¡Ωì•ÃÅï±ïù•»Å≈◊§Å¡Ö…—îÅëîÅ±ÑÅôΩ—ºÅÕîÅŸî∏Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄëÌç’……ïπ—A…Ωô•±îπçΩŸï…}’…∞Ä¸ÅÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ëƒ¡¡‡ÏÅ¡Öëë•πúËÂ¡‡Äƒ—¡‡ÏÅôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅ›•ë—†Ëƒ¿¿îÏÅçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÏÅâΩ…ëï»µçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÏÅôΩπ–µ›ï•ù°–Ëÿ¿¿ÏàÅΩπç±•ç¨Ùâ°Öπë±ïIïµΩŸïΩŸï…A°Ω—º†§à˚¬~^Gæ‚<ÅE’•—Ö»Å¡Ω…—ÖëÑΩâ’——Ω∏˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâô•ï±êà¯(ÄÄÄÄÄÄÄÄÄÄÒ±Öâï∞˘%µÖùï∏ÅëîÅôΩπëºÅëï∞Å¡ï…ô•∞Ω±Öâï∞¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÄÄÅ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÏ(ÄÄÄÄÄÄÄÄÄÄÄÅ°ï•ù°–Ëƒ‘¡¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒ…¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÅΩŸï…ô±Ω‹È°•ëëï∏Ï(ÄÄÄÄÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§Ï(ÄÄÄÄÄÄÄÄÄÄÄÅµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ï(ÄÄÄÄÄÄÄÄÄÄà¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌç’……ïπ—A…Ωô•±îπ¡…Ωô•±ï}Õ•ëï}•µÖùï}’…∞(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ•µú(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅÕ…åÙàëÌïÕçÖ¡ï!—µ∞°ç’……ïπ—A…Ωô•±îπ¡…Ωô•±ï}Õ•ëï}•µÖùï}’…∞•Ùà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅÖ±–ÙâΩπëºÅëïçΩ…Ö—•Ÿºà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅ›•ë—†Ëƒ¿¿îÏ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅ°ï•ù°–Ëƒ¿¿îÏ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩâ©ïç–µô•–ÈçΩŸï»Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩâ©ïç–µ¡ΩÕ•—•Ω∏Èçïπ—ï»Å—Ω¿Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩ¡Öç•—‰Ë¿∏‘‘Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÏÅ•πÕï–Ë¿ÏÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†‰¡ëïú∞Å…ùâÑ†ƒÃ∞ƒÿ∞»¿∞∏‰§∞Å…ùâÑ†ƒÃ∞ƒÿ∞»¿∞∏»§§Ïà¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÏÅ±ïô–Ëƒ…¡‡ÏÅâΩ——Ω¥Ëƒ¡¡‡ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ËçôôòÏÅôΩπ–µ›ï•ù°–Ëÿ¿¿Ïà˘Y•Õ—ÑÅ¡…ïŸ•ÑÉ
‹Å≈’ïëÑÅëï—ÀÖÃÅëï∞ÅçΩπ—ïπ•ëºΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄËÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ°ï•ù°–Ëƒ¿¿îÏÅë•Õ¡±Ö‰Èô±ï‡ÏÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÏÅ©’Õ—•ô‰µçΩπ—ïπ–Èçïπ—ï»ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏÅ—ï·–µÖ±•ù∏Èçïπ—ï»ÏÅ¡Öëë•πúËƒŸ¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅM’ã¥Å’πÑÅ•µÖùï∏ÅŸï…—•çÖ∞ÅºÅ—ï∑Ö—•çÑ∏Òâ»˘MîÅµΩÕ—…ÖÀÑÅëï—ÀÖÃÅëï∞ÅçΩπ—ïπ•ëº∞ÅπºÅ…ïïµ¡±ÖÈÑÅ±ÑÅ¡Ω…—ÖëÑ∏(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅÅÙ(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒ•π¡’–(ÄÄÄÄÄÄÄÄÄÄÄÅ—Â¡îÙâô•±îà(ÄÄÄÄÄÄÄÄÄÄÄÅ•êÙâ¡…Ωô•±ïM•ëï%µÖùï%π¡’–à(ÄÄÄÄÄÄÄÄÄÄÄÅÖççï¡–Ùâ•µÖùîº®à(ÄÄÄÄÄÄÄÄÄÄÄÅΩπç°ÖπùîÙâ°Öπë±ïA…Ωô•±ïM•ëï%µÖùïU¡±ΩÖê†§à(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâë•Õ¡±Ö‰ÈπΩπîÏà(ÄÄÄÄÄÄÄÄÄÄ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµÖπë…Ω•êµµïë•ÑµÖç—•ΩπÃà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâΩ¡ïπ1•ŸïMç…Ω±±πë…Ω•ë5ïë•Ñ†ùô•±ïÃú∞ù¡…Ωô•±ïM•ëï%µÖùï%π¡’–ú∞ùï±ïù•»Å±ÑÅ•µÖùï∏ÅëîÅôΩπëºÅëîÅ—‘Å¡ï…ô•∞ú∞ùô•±ïÃú§à˚¬~NÅ±ïù•»Å•µÖùï∏Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâΩ¡ïπ1•ŸïMç…Ω±±πë…Ω•ë5ïë•Ñ†ùçÖµï…Ñú∞ù¡…Ωô•±ïM•ëï%µÖùï%π¡’–ú∞ù—ΩµÖ»Å’πÑÅôΩ—ºÅ¡Ö…ÑÅï∞ÅôΩπëºÅëîÅ—‘Å¡ï…ô•∞ú∞ùçÖµï…Ñú§à˚¬~N‹ÅUÕÖ»ÅèÖµÖ…ÑΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅ•êÙâ¡…Ωô•±ïM•ëï%µÖùïM—Ö—’ÃàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅµÖ…ù•∏µ—Ω¿ËŸ¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÅ7Ö·•µºÄ’5∏ÅIïçΩµïπëÖëºËÅ•µÖùï∏ÅŸï…—•çÖ∞∏ÅMîÅ’ÕÑÅçΩµºÅôΩπëºÅëïçΩ…Ö—•ŸºÅï∏ÅÕïù’πëºÅ¡±Öπº∏(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄëÌç’……ïπ—A…Ωô•±îπ¡…Ωô•±ï}Õ•ëï}•µÖùï}’…∞(ÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ëƒ¡¡‡ÏÅ¡Öëë•πúËÂ¡‡Äƒ—¡‡ÏÅôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅ›•ë—†Ëƒ¿¿îÏÅçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÏÅâΩ…ëï»µçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÏÅôΩπ–µ›ï•ù°–Ëÿ¿¿ÏàÅΩπç±•ç¨Ùâ°Öπë±ïIïµΩŸïA…Ωô•±ïM•ëï%µÖùî†§à˚¬~^Gæ‚<ÅE’•—Ö»Å•µÖùï∏ÅëîÅôΩπëºΩâ’——Ω∏˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâô•ï±êà¯(ÄÄÄÄÄÄÄÄÄÄÒ±Öâï∞˘ŸÖ—Ö»Ä°Õ§ÅπºÅ—ïª•ÃÅôΩ—º§Ω±Öâï∞¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿Ë·¡‡ÏÅô±ï‡µ›…Ö¿È›…Ö¿Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌïµΩ©•ÃπµÖ¿°îÄÙ¯ÅÄÒâ’——Ω∏ÅΩπç±•ç¨ÙâÕï±ïç—ŸÖ—Ö…µΩ©§†úëÌïÙú§àÅ•êÙâïµΩ©§¥ëÌïÙàÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»¡¡‡ÏÅ¡Öëë•πúË·¡‡ÏÅâÖç≠ù…Ω’πêËëÌîÄÙÙÙÅç’……ïπ—A…Ωô•±îπÖŸÖ—Ö…}ïµΩ©§Ä¸ÄâŸÖ»†¥µ¡Öπï∞¥»§àÄËÄâ—…ÖπÕ¡Ö…ïπ–âÙÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅç’…ÕΩ»È¡Ω•π—ï»Ïà¯ëÌïÙΩâ’——Ω∏˘Ä§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâô•ï±êà¯(ÄÄÄÄÄÄÄÄÄÄÒ±Öâï∞˘9Ωµâ…îÅëîÅ’Õ’Ö…•ºΩ±Öâï∞¯(ÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâïë•—UÕï…πÖµîàÅŸÖ±’îÙàëÌïÕçÖ¡ï!—µ∞°ç’……ïπ—A…Ωô•±îπ’Õï…πÖµî•Ùà¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâô•ï±êà¯(ÄÄÄÄÄÄÄÄÄÄÒ±Öâï∞˘	•ºÄ°Ω¡ç•ΩπÖ∞§Ω±Öâï∞¯(ÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâïë•—	•ºàÅŸÖ±’îÙàëÌïÕçÖ¡ï!—µ∞°ç’……ïπ—A…Ωô•±îπâ•ºÅÒÄàà•ÙàÅ¡±Öçï°Ω±ëï»ÙâΩπ”ÑÅÖ±ùºÅÕΩâ…îÅŸΩÃàÅµÖ·±ïπù—†Ùàƒ»¿à¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâô•ï±êà¯(ÄÄÄÄÄÄÄÄÄÄÒ±Öâï∞˘5•ÃÅ…ïëïÃÄ°Ω¡ç•ΩπÖ∞§Ω±Öâï∞¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÏÅùÖ¿Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÏÅùÖ¿Ë·¡‡Ïà¯ÒÕ¡Ö∏˚¬~¶‹ΩÕ¡Ö∏¯Ò•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâÕΩç•Ö±%πÕ—Öù…Ö¥àÅŸÖ±’îÙàëÌïÕçÖ¡ï!—µ∞°ç’……ïπ—A…Ωô•±îπÕΩç•Ö±}•πÕ—Öù…Ö¥ÅÒÄàà•ÙàÅ¡±Öçï°Ω±ëï»Ùâ1•π¨ÅëîÅ—‘Å%πÕ—Öù…Ö¥àÅÕ—Â±îÙâô±ï‡ËƒÏà¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌ•Õ…ïÖ—Ω»Ä¸ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµçΩππïç—ïêµÕΩç•Ö∞µ¡…•µÖ…‰à¯ÒÕ¡Ö∏˚¬~~àΩÕ¡Ö∏¯Òë•ÿÅ•êÙâÕ—…ïÖµΩππïç—•Ωπ-•ç¨àÅÕ—Â±îÙâô±ï‡ËƒÏà¯Ωë•ÿ¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒëï—Ö•±ÃÅç±ÖÕÃÙâ±ÃµÕΩç•Ö∞µÕïçΩπëÖ…‰µ±•π¨à¯ÒÕ’µµÖ…‰˘π±ÖçîÅÖ±—ï…πÖ—•ŸºÅëîÅ-•ç¨Ä°Ω¡ç•ΩπÖ∞§ΩÕ’µµÖ…‰¯Ò•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâÕΩç•Ö±-•ç¨àÅŸÖ±’îÙàëÌïÕçÖ¡ï!—µ∞°ç’……ïπ—A…Ωô•±îπÕΩç•Ö±}≠•ç¨ÅÒÄàà•ÙàÅ¡±Öçï°Ω±ëï»ÙâMΩ±ºÅÕ§Å≈’ïÀ•ÃÅ’ÕÖ»ÅΩ—…ºÅïπ±Öçîà¯Ωëï—Ö•±Ã¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµçΩππïç—ïêµÕΩç•Ö∞µ¡…•µÖ…‰à¯ÒÕ¡Ö∏˚¬~~åΩÕ¡Ö∏¯Òë•ÿÅ•êÙâÕ—…ïÖµΩππïç—•ΩπQ›•—ç†àÅÕ—Â±îÙâô±ï‡ËƒÏà¯Ωë•ÿ¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒëï—Ö•±ÃÅç±ÖÕÃÙâ±ÃµÕΩç•Ö∞µÕïçΩπëÖ…‰µ±•π¨à¯ÒÕ’µµÖ…‰˘π±ÖçîÅÖ±—ï…πÖ—•ŸºÅëîÅQ›•—ç†Ä°Ω¡ç•ΩπÖ∞§ΩÕ’µµÖ…‰¯Ò•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâÕΩç•Ö±Q›•—ç†àÅŸÖ±’îÙàëÌïÕçÖ¡ï!—µ∞°ç’……ïπ—A…Ωô•±îπÕΩç•Ö±}—›•—ç†ÅÒÄàà•ÙàÅ¡±Öçï°Ω±ëï»ÙâMΩ±ºÅÕ§Å≈’ïÀ•ÃÅ’ÕÖ»ÅΩ—…ºÅïπ±Öçîà¯Ωëï—Ö•±Ã¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÏÅùÖ¿Ë·¡‡Ïà¯ÒÕ¡Ö∏˚¬~R–ΩÕ¡Ö∏¯Ò•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâÕΩç•Ö±eΩ’—’âîàÅŸÖ±’îÙàëÌïÕçÖ¡ï!—µ∞°ç’……ïπ—A…Ωô•±îπÕΩç•Ö±}ÂΩ’—’âîÅÒÄàà•ÙàÅ¡±Öçï°Ω±ëï»Ùâ1•π¨ÅëîÅ—‘ÅeΩ’Q’âîàÅÕ—Â±îÙâô±ï‡ËƒÏà¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÏÅùÖ¿Ë·¡‡Ïà¯ÒÕ¡Ö∏˚äj¨ΩÕ¡Ö∏¯Ò•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâÕΩç•Ö±Q•≠—Ω¨àÅŸÖ±’îÙàëÌïÕçÖ¡ï!—µ∞°ç’……ïπ—A…Ωô•±îπÕΩç•Ö±}—•≠—Ω¨ÅÒÄàà•ÙàÅ¡±Öçï°Ω±ëï»Ùâ1•π¨ÅëîÅ—‘ÅQ•≠QΩ¨àÅÕ—Â±îÙâô±ï‡ËƒÏà¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅ•êÙâ—•≠—Ω≠1•ŸïQΩùù±îàÅç±ÖÕÃÙàëÌç’……ïπ—A…Ωô•±îπ—•≠—Ω≠}•Õ}±•ŸîÄ¸Äââ—∏àÄËÄââ—∏µΩ’—±•πîâÙàÅΩπç±•ç¨Ùâ—Ωùù±ïQ•≠QΩ≠1•Ÿî†§àÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏà¯ëÌç’……ïπ—A…Ωô•±îπ—•≠—Ω≠}•Õ}±•ŸîÄ¸ÄãäZÄÅ•πÖ±•ÈÖ»Åë•…ïç—ºÅëîÅQ•≠QΩ¨àÄËÄã¬~R–ÅÕ—Ω‰Åï∏ÅŸ•ŸºÅ¡Ω»ÅQ•≠QΩ¨âÙΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘Q•≠QΩ¨ÅÕîÅëïÕÖç—•ŸÑÅÖ’—Ω∑Ö—•çÖµïπ—îÅëïÕ¡◊•ÃÅëîÄ–Å°Ω…ÖÃÅÕ§ÅΩ±Ÿ•ìÖÃÅô•πÖ±•ÈÖ…±º∏Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÅÄÄËÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ¡Öëë•πúËƒ…¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ—¡‡ÌôΩπ–µ›ï•ù°–Ë‡¿¿ÌµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà˚¬~RHÅ-•ç¨∞ÅQ›•—ç†∞ÅeΩ’Q’âîÅ‰ÅQ•≠QΩ¨Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ì±•πîµ°ï•ù°–Ëƒ∏‘‘ÌµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅAÖ…ÑÅ°Öâ•±•—Ö»ÅïÕ—ÖÃÅ…ïëïÃÅπïçïÕ•”ÖÃÅÕï»Å…ïÖëΩ»ËÄ‘ÅŸ•ëïΩÃ∞Å’πÑÅç’ïπ—ÑÅëîÄ‹ÅìµÖÃÅ‰ÅπºÅ—ïπï»ÅÕÖπç•ΩπïÃ∏(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌç…ïÖ—Ω…M—Ö—’ÃÄÙÙÙÄâ¡ïπë•πúà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅë•ÕÖâ±ïêÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏà˚ä>ÃÅMΩ±•ç•—’êÅï∏Å…ïŸ•ÕßÕ∏Ωâ’——Ω∏˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄËÅÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨Ùâ…ï≈’ïÕ—…ïÖ—Ω…ççïÕÃ†§àÄëÌç…ïÖ—Ω…Iï≈’•…ïµïπ—Õ5ï–Ä¸ÄààÄËÄâë•ÕÖâ±ïêâÙÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏà˚¬~:∞ÅMΩ±•ç•—Ö»ÅÖççïÕºÅçΩµºÅç…ïÖëΩ»Ωâ’——Ω∏˘ÅÙ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ËëÌç…ïÖ—Ω…Iï≈’•…ïµïπ—Õ5ï–Ä¸ÄâŸÖ»†¥µù…ïï∏§àÄËÄâŸÖ»†¥µ—ï·–µë•¥§âÙÌµÖ…ù•∏µ—Ω¿Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅY•ëïΩÃËÄëÌç’……ïπ—A…Ωô•±îπç…ïÖ—Ω…}Ÿ•ëïΩ}çΩ’π—Ùº‘É
‹Åπ—•üÒïëÖêËÄëÌç’……ïπ—A…Ωô•±îπç…ïÖ—Ω…}ÖççΩ’π—}ëÖÂÕÙº‹ÅìµÖÃ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÅÅÙ(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅ•êÙâïë•—A…Ωô•±ï……Ω»àÅç±ÖÕÃÙâï……Ω»µµÕúà¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙââΩ…ëï»µ—Ω¿Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅµÖ…ù•∏µ—Ω¿ËƒŸ¡‡ÏÅ¡Öëë•πúµ—Ω¿ËƒŸ¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏàÅΩπç±•ç¨ÙâΩ¡ïπ°ÖπùïAÖÕÕ›Ω…ê†§à˚¬~RHÅÖµâ•Ö»ÅçΩπ—…ÖÕó≈ÑΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µôΩΩ—ï»Å±Ãµ¡…Ωô•±îµïë•–µôΩΩ—ï»àÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌùÖ¿Ëƒ¡¡‡Ì¡ΩÕ•—•Ω∏ÈÕ—•ç≠‰ÌâΩ——Ω¥Ë¿ÌËµ•πëï‡ËÿÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞§ÌâΩ…ëï»µ—Ω¿Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâô±ï‡ËƒÌµ•∏µ°ï•ù°–Ë–·¡‡ÏàÅΩπç±•ç¨Ùâç±ΩÕï5ÖπÖùïë5ΩëÖ∞†§à˘Öπçï±Ö»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅÕ—Â±îÙâô±ï‡ËƒÌµ•∏µ°ï•ù°–Ë–·¡‡ÏàÅΩπç±•ç¨ÙâÕÖŸïA…Ωô•±ïë•—Ã†§à˘’Ö…ëÖ»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ(ÄÅ›•πëΩ‹πÕï±ïç—ïëŸÖ—Ö…µΩ©§ÄÙÅç’……ïπ—A…Ωô•±îπÖŸÖ—Ö…}ïµΩ©§ÅÒÄã¬~:∞àÏ(ÄÅ•òÄ°•Õ…ïÖ—Ω»§ÅÕï—Q•µïΩ’–°±ΩÖëM—…ïÖµççΩ’π—Ωππïç—•ΩπM—Ö—’Ã∞Ä¿§Ï)Ù()ô’πç—•Ω∏ÅÕ—…ïÖµΩππïç—•Ωππ—…‰°¡ÖÂ±ΩÖê∞Å¡…ΩŸ•ëï»§ÅÏ(ÄÅçΩπÕ–Åë•…ïç–ÄÙÅ¡ÖÂ±ΩÖê¸πm¡…ΩŸ•ëï…tÏ(ÄÅ•òÄ°ë•…ïç–ÄòòÅ—Â¡ïΩòÅë•…ïç–ÄÙÙÙÄâΩâ©ïç–à§Å…ï—’…∏Åë•…ïç–Ï(ÄÅçΩπÕ–Å±•Õ–ÄÙÅ¡ÖÂ±ΩÖê¸πçΩππïç—•ΩπÃÅÒÅ¡ÖÂ±ΩÖê¸πëÖ—ÑÅÒÅmtÏ(ÄÅ•òÄ°……Ö‰π•Õ……Ö‰°±•Õ–§§Å…ï—’…∏Å±•Õ–πô•πê°•—ï¥ÄÙ¯ÅM—…•πú°•—ï¥¸π¡…ΩŸ•ëï»ÅÒÄàà§π—Ω1Ω›ï…ÖÕî†§ÄÙÙÙÅ¡…ΩŸ•ëï»§ÅÒÅπ’±∞Ï(ÄÅ…ï—’…∏Åπ’±∞Ï)Ù()çΩπÕ–Å±ÕM—…ïÖµΩππïç—•ΩπÃÄÙÅÏÅ≠•ç¨Èπ’±∞∞Å—›•—ç†Èπ’±∞ÅÙÏ()ô’πç—•Ω∏Å±ÕΩππïç—•ΩπA…Ωô•±ïU…∞°çΩππïç—•Ω∏∞Å¡…ΩŸ•ëï»§ÅÏ(ÄÅçΩπÕ–Åë•…ïç—U…∞ÄÙÅçΩππïç—•Ω∏¸π¡…Ωô•±ï}’…∞ÅÒÅçΩππïç—•Ω∏¸πç°Öππï±}’…∞ÅÒÅçΩππïç—•Ω∏¸π’…∞ÅÒÄààÏ(ÄÅ•òÄ°•ÕMÖôïU…∞°ë•…ïç—U…∞§§Å…ï—’…∏Åë•…ïç—U…∞Ï(ÄÅçΩπÕ–Å’Õï…πÖµîÄÙÅM—…•πú°çΩππïç—•Ω∏¸π¡…ΩŸ•ëï…}’Õï…πÖµîÅÒÅçΩππïç—•Ω∏¸π’Õï…πÖµîÅÒÅçΩππïç—•Ω∏¸πë•Õ¡±ÖÂ}πÖµîÅÒÄàà§(ÄÄÄÄπ—…•¥†§(ÄÄÄÄπ…ï¡±Öçî†Ωy º∞Äàà§Ï(ÄÅ•òÄ†ÑΩymÑµÈµh¿¥Â|∏µuÏ»∞‘¡Ùêºπ—ïÕ–°’Õï…πÖµî§§Å…ï—’…∏ÄààÏ(ÄÅ…ï—’…∏Å¡…ΩŸ•ëï»ÄÙÙÙÄâ—›•—ç†à(ÄÄÄÄ¸ÅÅ°——¡ÃËºΩ››‹π—›•—ç†π—ÿºëÌïπçΩëïUI%Ωµ¡Ωπïπ–°’Õï…πÖµî•ıÄ(ÄÄÄÄËÅÅ°——¡ÃËºΩ≠•ç¨πçΩ¥ºëÌïπçΩëïUI%Ωµ¡Ωπïπ–°’Õï…πÖµî•ıÄÏ)Ù()ô’πç—•Ω∏Å±Õï—Ωππïç—ïëM—…ïÖµA…Ωô•±ïU…∞°¡…ΩŸ•ëï»§ÅÏ(ÄÅçΩπÕ–ÅçΩππïç—•Ω∏ÄÙÅ±ÕM—…ïÖµΩππïç—•ΩπÕm¡…ΩŸ•ëï…tÏ(ÄÅ•òÄ†ÖçΩππïç—•Ω∏ÅÒÅçΩππïç—•Ω∏πçΩππïç—ïêÄÙÙÙÅôÖ±ÕîÅÒÅçΩππïç—•Ω∏π•Õ}çΩππïç—ïêÄÙÙÙÅôÖ±Õî§Å…ï—’…∏ÄààÏ(ÄÅçΩπÕ–Å’…∞ÄÙÅ±ÕΩππïç—•ΩπA…Ωô•±ïU…∞°çΩππïç—•Ω∏∞Å¡…ΩŸ•ëï»§Ï(ÄÅ…ï—’…∏Å•ÕMÖôïU…∞°’…∞§Ä¸Å’…∞ÄËÄààÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅÕÂπçΩππïç—ïëM—…ïÖµA…Ωô•±ïU…±Ã†§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—UÕï»¸π•êÅÒÄÖç’……ïπ—A…Ωô•±î§Å…ï—’…∏Ï(ÄÅçΩπÕ–Å’¡ëÖ—ïÃÄÙÅÌÙÏ(ÄÅçΩπÕ–Å≠•ç≠U…∞ÄÙÅ±Õï—Ωππïç—ïëM—…ïÖµA…Ωô•±ïU…∞†â≠•ç¨à§Ï(ÄÅçΩπÕ–Å—›•—ç°U…∞ÄÙÅ±Õï—Ωππïç—ïëM—…ïÖµA…Ωô•±ïU…∞†â—›•—ç†à§Ï(ÄÅ•òÄ°≠•ç≠U…∞ÄòòÅ≠•ç≠U…∞ÄÑÙÙÅç’……ïπ—A…Ωô•±îπÕΩç•Ö±}≠•ç¨§Å’¡ëÖ—ïÃπÕΩç•Ö±}≠•ç¨ÄÙÅ≠•ç≠U…∞Ï(ÄÅ•òÄ°—›•—ç°U…∞ÄòòÅ—›•—ç°U…∞ÄÑÙÙÅç’……ïπ—A…Ωô•±îπÕΩç•Ö±}—›•—ç†§Å’¡ëÖ—ïÃπÕΩç•Ö±}—›•—ç†ÄÙÅ—›•—ç°U…∞Ï(ÄÅ•òÄ†Ö=â©ïç–π≠ïÂÃ°’¡ëÖ—ïÃ§π±ïπù—†§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅÏÅï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†â¡…Ωô•±ïÃà§π’¡ëÖ—î°’¡ëÖ—ïÃ§πïƒ†â•êà∞Åç’……ïπ—UÕï»π•ê§Ï(ÄÅ•òÄ°ï……Ω»§ÅÏ(ÄÄÄÅçΩπÕΩ±îπ›Ö…∏†â9ºÅÕîÅ¡’ëºÅÕ•πç…Ωπ•ÈÖ»Åï∞Åïπ±ÖçîÅëîÅ±ÑÅç’ïπ—ÑÅçΩπïç—ÖëÑËà∞Åï……Ω»πµïÕÕÖùî§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅ=â©ïç–πÖÕÕ•ù∏°ç’……ïπ—A…Ωô•±î∞Å’¡ëÖ—ïÃ§Ï(ÄÅ=â©ïç–πïπ—…•ïÃ°’¡ëÖ—ïÃ§πôΩ…Öç††°m≠ï‰∞ÅŸÖ±’ït§ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–Å•π¡’–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê°≠ï‰ÄÙÙÙÄâÕΩç•Ö±}≠•ç¨àÄ¸ÄâÕΩç•Ö±-•ç¨àÄËÄâÕΩç•Ö±Q›•—ç†à§Ï(ÄÄÄÅ•òÄ°•π¡’–ÄòòÄÖ•π¡’–πŸÖ±’î§Å•π¡’–πŸÖ±’îÄÙÅŸÖ±’îÏ(ÄÅÙ§Ï)Ù()ô’πç—•Ω∏Å…ïπëï…M—…ïÖµΩππïç—•ΩπΩπ—…Ω∞°¡…ΩŸ•ëï»∞ÅçΩππïç—•Ω∏§ÅÏ(ÄÅçΩπÕ–Å°ΩÕ–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê°ÅÕ—…ïÖµΩππïç—•Ω∏ëÌ¡…ΩŸ•ëï»ÄÙÙÙÄâ—›•—ç†àÄ¸ÄâQ›•—ç†àÄËÄâ-•ç¨âıÄ§Ï(ÄÅ•òÄ†Ö°ΩÕ–§Å…ï—’…∏Ï(ÄÅçΩπÕ–Å±Öâï∞ÄÙÅ¡…ΩŸ•ëï»ÄÙÙÙÄâ—›•—ç†àÄ¸ÄâQ›•—ç†àÄËÄâ-•ç¨àÏ(ÄÅçΩπÕ–ÅçΩππïç—ïêÄÙÄÑÖçΩππïç—•Ω∏ÄòòÅçΩππïç—•Ω∏πçΩππïç—ïêÄÑÙÙÅôÖ±ÕîÄòòÅçΩππïç—•Ω∏π•Õ}çΩππïç—ïêÄÑÙÙÅôÖ±ÕîÏ(ÄÅçΩπÕ–Å’Õï…πÖµîÄÙÅçΩππïç—•Ω∏¸π¡…ΩŸ•ëï…}’Õï…πÖµîÅÒÅçΩππïç—•Ω∏¸π’Õï…πÖµîÅÒÅçΩππïç—•Ω∏¸πë•Õ¡±ÖÂ}πÖµîÅÒÄààÏ(ÄÅ°ΩÕ–π•ππï…!Q50ÄÙÅçΩππïç—ïê(ÄÄÄÄ¸ÅÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌùÖ¿Ë·¡‡Ì¡Öëë•πúË·¡‡Äƒ¡¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃËÂ¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§Ïà¯(ÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§ÌôΩπ–µ›ï•ù°–Ë‡¿¿Ïà˚ärLÄëÌ±Öâï±ÙÅçΩπïç—ÖëºëÌ’Õï…πÖµîÄ¸ÅÄÉ
‹Å ëÌïÕçÖ¡ï!—µ∞°’Õï…πÖµî•ıÄÄËÄàâÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúËŸ¡‡ÄÂ¡‡ÌôΩπ–µÕ•ÈîËƒ≈¡‡ÏàÅΩπç±•ç¨Ùâë•ÕçΩππïç—M—…ïÖµççΩ’π–†úëÌ¡…ΩŸ•ëï…Ùú§à˘ïÕçΩπïç—Ö»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄΩë•ÿ˘Ä(ÄÄÄÄËÅÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÌ¡Öëë•πúË·¡‡Äƒ¡¡‡ÌôΩπ–µÕ•ÈîËƒ…¡‡ÏàÅΩπç±•ç¨ÙâçΩππïç—M—…ïÖµççΩ’π–†úëÌ¡…ΩŸ•ëï…Ùú§à˘Ωπïç—Ö»Åç’ïπ—ÑÅëîÄëÌ±Öâï±ÙΩâ’——Ω∏˘ÄÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖëM—…ïÖµççΩ’π—Ωππïç—•ΩπM—Ö—’Ã†§ÅÏ(ÄÅlâ≠•ç¨à∞Äâ—›•—ç†âtπôΩ…Öç†°¡…ΩŸ•ëï»ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–Å°ΩÕ–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê°ÅÕ—…ïÖµΩππïç—•Ω∏ëÌ¡…ΩŸ•ëï»ÄÙÙÙÄâ—›•—ç†àÄ¸ÄâQ›•—ç†àÄËÄâ-•ç¨âıÄ§Ï(ÄÄÄÅ•òÄ°°ΩÕ–§Å°ΩÕ–π•ππï…!Q50ÄÙÅÄÒÕ¡Ö∏ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘Ωµ¡…ΩâÖπëºÅçΩπï·ßÕªäòΩÕ¡Ö∏˘ÄÏ(ÄÅÙ§Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπô’πç—•ΩπÃπ•πŸΩ≠î†âÕ—…ïÖ¥µÖççΩ’π–µçΩππïç–à∞ÅÏÅâΩë‰ÈÏÅÖç—•Ω∏ËâÕ—Ö—’ÃàÅÙÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÅëÖ—Ñ¸πΩ¨ÄÙÙÙÅôÖ±Õî§ÅÏ(ÄÄÄÅ±ÕM—…ïÖµΩππïç—•ΩπÃπ≠•ç¨ÄÙÅπ’±∞Ï(ÄÄÄÅ±ÕM—…ïÖµΩππïç—•ΩπÃπ—›•—ç†ÄÙÅπ’±∞Ï(ÄÄÄÅlâ≠•ç¨à∞Äâ—›•—ç†âtπôΩ…Öç†°¡…ΩŸ•ëï»ÄÙ¯Å…ïπëï…M—…ïÖµΩππïç—•ΩπΩπ—…Ω∞°¡…ΩŸ•ëï»∞Åπ’±∞§§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅ±ÕM—…ïÖµΩππïç—•ΩπÃπ≠•ç¨ÄÙÅÕ—…ïÖµΩππïç—•Ωππ—…‰°ëÖ—Ñ∞Äâ≠•ç¨à§Ï(ÄÅ±ÕM—…ïÖµΩππïç—•ΩπÃπ—›•—ç†ÄÙÅÕ—…ïÖµΩππïç—•Ωππ—…‰°ëÖ—Ñ∞Äâ—›•—ç†à§Ï(ÄÅ…ïπëï…M—…ïÖµΩππïç—•ΩπΩπ—…Ω∞†â≠•ç¨à∞Å±ÕM—…ïÖµΩππïç—•ΩπÃπ≠•ç¨§Ï(ÄÅ…ïπëï…M—…ïÖµΩππïç—•ΩπΩπ—…Ω∞†â—›•—ç†à∞Å±ÕM—…ïÖµΩππïç—•ΩπÃπ—›•—ç†§Ï(ÄÅÖ›Ö•–ÅÕÂπçΩππïç—ïëM—…ïÖµA…Ωô•±ïU…±Ã†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅçΩππïç—M—…ïÖµççΩ’π–°¡…ΩŸ•ëï»§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—UÕï»§ÅÏÅÕ°Ω›QΩÖÕ–†âA…•µï…ºÅ•π•çßÑÅÕïÕßÕ∏Åï∏Å1•ŸïMç…Ω±∞à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–°Åâ…•ïπëºÄëÌ¡…ΩŸ•ëï»ÄÙÙÙÄâ—›•—ç†àÄ¸ÄâQ›•—ç†àÄËÄâ-•ç¨â˜äôÄ§Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπô’πç—•ΩπÃπ•πŸΩ≠î†âÕ—…ïÖ¥µÖççΩ’π–µçΩππïç–à∞ÅÏ(ÄÄÄÅâΩë‰ÈÏÅÖç—•Ω∏ËâÕ—Ö…–à∞Å¡…ΩŸ•ëï»ÅÙ(ÄÅÙ§Ï(ÄÅçΩπÕ–ÅÖ’—°Ω…•ÈÖ—•ΩπU…∞ÄÙÅëÖ—Ñ¸πÖ’—°Ω…•ÈÖ—•Ωπ}’…∞ÅÒÅëÖ—Ñ¸π’…∞Ï(ÄÅ•òÄ°ï……Ω»ÅÒÅëÖ—Ñ¸πΩ¨ÄÙÙÙÅôÖ±ÕîÅÒÄÖÖ’—°Ω…•ÈÖ—•ΩπU…∞§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°ëÖ—Ñ¸πï……Ω»ÅÒÄâ9ºÅÕîÅ¡’ëºÅ•π•ç•Ö»Å±ÑÅçΩπï·ßÕ∏à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅ±ΩçÖ±M—Ω…ÖùîπÕï—%—ï¥†â±Õ}Õ—…ïÖµ}ΩÖ’—°}¡ïπë•πúà∞Å¡…ΩŸ•ëï»§Ï(ÄÅ›•πëΩ‹π±ΩçÖ—•Ω∏πÖÕÕ•ù∏°Ö’—°Ω…•ÈÖ—•ΩπU…∞§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Åë•ÕçΩππïç—M—…ïÖµççΩ’π–°¡…ΩŸ•ëï»§ÅÏ(ÄÅçΩπÕ–Å±Öâï∞ÄÙÅ¡…ΩŸ•ëï»ÄÙÙÙÄâ—›•—ç†àÄ¸ÄâQ›•—ç†àÄËÄâ-•ç¨àÏ(ÄÅ•òÄ†ÖçΩπô•…¥°É
˝ïÕçΩπïç—Ö»Å—‘Åç’ïπ—ÑÅëîÄëÌ±Öâï±Ù˝Ä§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπô’πç—•ΩπÃπ•πŸΩ≠î†âÕ—…ïÖ¥µÖççΩ’π–µçΩππïç–à∞ÅÏ(ÄÄÄÅâΩë‰ÈÏÅÖç—•Ω∏Ëâë•ÕçΩππïç–à∞Å¡…ΩŸ•ëï»ÅÙ(ÄÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÅëÖ—Ñ¸πΩ¨ÄÙÙÙÅôÖ±Õî§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°ëÖ—Ñ¸πï……Ω»ÅÒÄâ9ºÅÕîÅ¡’ëºÅëïÕçΩπïç—Ö»Å±ÑÅç’ïπ—Ñà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅÕ°Ω›QΩÖÕ–°ÄëÌ±Öâï±ÙÅëïÕçΩπïç—ÖëΩÄ§Ï(ÄÅ±ÕM—…ïÖµΩππïç—•ΩπÕm¡…ΩŸ•ëï…tÄÙÅπ’±∞Ï(ÄÅ±ΩÖëM—…ïÖµççΩ’π—Ωππïç—•ΩπM—Ö—’Ã†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Åô•π•Õ°Aïπë•πùM—…ïÖµ=’—††§ÅÏ(ÄÅçΩπÕ–Å¡Ö…ÖµÃÄÙÅπï‹ÅUI1MïÖ…ç°AÖ…ÖµÃ°›•πëΩ‹π±ΩçÖ—•Ω∏πÕïÖ…ç†§Ï(ÄÅçΩπÕ–ÅçΩëîÄÙÅ¡Ö…ÖµÃπùï–†âçΩëîà§Ï(ÄÅçΩπÕ–ÅÕ—Ö—îÄÙÅ¡Ö…ÖµÃπùï–†âÕ—Ö—îà§Ï(ÄÅçΩπÕ–Å¡…ΩŸ•ëï»ÄÙÅ±ΩçÖ±M—Ω…Öùîπùï—%—ï¥†â±Õ}Õ—…ïÖµ}ΩÖ’—°}¡ïπë•πúà§Ï(ÄÅ•òÄ†ÖçΩëîÅÒÄÖÕ—Ö—îÅÒÄÖ¡…ΩŸ•ëï»§Å…ï—’…∏Ï((ÄÅ±ï–ÅÖ——ïµ¡—ÃÄÙÄ¿Ï(ÄÅçΩπÕ–Å›Ö•—Ω…MïÕÕ•Ω∏ÄÙÅÕï—%π—ï…ŸÖ∞°ÖÕÂπåÄ†§ÄÙ¯ÅÏ(ÄÄÄÅÖ——ïµ¡—Ã¨¨Ï(ÄÄÄÅ•òÄ†Öç’……ïπ—UÕï»ÄòòÅÖ——ïµ¡—ÃÄÄ–¿§Å…ï—’…∏Ï(ÄÄÄÅç±ïÖ…%π—ï…ŸÖ∞°›Ö•—Ω…MïÕÕ•Ω∏§Ï(ÄÄÄÅ•òÄ†Öç’……ïπ—UÕï»§ÅÏ(ÄÄÄÄÄÅÕ°Ω›QΩÖÕ–†â%π•çßÑÅÕïÕßÕ∏Åï∏Å1•ŸïMç…Ω±∞Å¡Ö…ÑÅçΩµ¡±ï—Ö»Å±ÑÅçΩπï·ßÕ∏à§Ï(ÄÄÄÄÄÅ…ï—’…∏Ï(ÄÄÄÅÙ(ÄÄÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπô’πç—•ΩπÃπ•πŸΩ≠î†âÕ—…ïÖ¥µÖççΩ’π–µçΩππïç–à∞ÅÏ(ÄÄÄÄÄÅâΩë‰ÈÏÅÖç—•Ω∏ËâçÖ±±âÖç¨à∞Å¡…ΩŸ•ëï»∞ÅçΩëî∞ÅÕ—Ö—îÅÙ(ÄÄÄÅÙ§Ï(ÄÄÄÅçΩπÕ–Åç±ïÖπU…∞ÄÙÅπï‹ÅUI0°›•πëΩ‹π±ΩçÖ—•Ω∏π°…ïò§Ï(ÄÄÄÅç±ïÖπU…∞πÕïÖ…ç°AÖ…ÖµÃπëï±ï—î†âçΩëîà§Ï(ÄÄÄÅç±ïÖπU…∞πÕïÖ…ç°AÖ…ÖµÃπëï±ï—î†âÕ—Ö—îà§Ï(ÄÄÄÅç±ïÖπU…∞πÕïÖ…ç°AÖ…ÖµÃπëï±ï—î†âÕçΩ¡îà§Ï(ÄÄÄÅ°•Õ—Ω…‰π…ï¡±ÖçïM—Ö—î°ÌÙ∞ÅëΩç’µïπ–π—•—±î∞Åç±ïÖπU…∞π¡Ö—°πÖµîÄ¨Åç±ïÖπU…∞πÕïÖ…ç†Ä¨Åç±ïÖπU…∞π°ÖÕ†§Ï(ÄÄÄÅ±ΩçÖ±M—Ω…Öùîπ…ïµΩŸï%—ï¥†â±Õ}Õ—…ïÖµ}ΩÖ’—°}¡ïπë•πúà§Ï(ÄÄÄÅ•òÄ°ï……Ω»ÅÒÅëÖ—Ñ¸πΩ¨ÄÙÙÙÅôÖ±Õî§ÅÏ(ÄÄÄÄÄÅÕ°Ω›QΩÖÕ–°ëÖ—Ñ¸πï……Ω»ÅÒÄâ9ºÅÕîÅ¡’ëºÅçΩπïç—Ö»Å±ÑÅç’ïπ—Ñà§Ï(ÄÄÄÄÄÅ…ï—’…∏Ï(ÄÄÄÅÙ(ÄÄÄÅÕ°Ω›QΩÖÕ–°ÉärLÅ’ïπ—ÑÅëîÄëÌ¡…ΩŸ•ëï»ÄÙÙÙÄâ—›•—ç†àÄ¸ÄâQ›•—ç†àÄËÄâ-•ç¨âÙÅçΩπïç—ÖëÖÄ§Ï(ÄÄÄÅ•òÄ°ëÖ—Ñ¸π¡…Ωô•±ï}’…∞ÄòòÅç’……ïπ—A…Ωô•±î§ÅÏ(ÄÄÄÄÄÅçΩπÕ–Å¡…Ωô•±ï-ï‰ÄÙÅ¡…ΩŸ•ëï»ÄÙÙÙÄâ—›•—ç†àÄ¸ÄâÕΩç•Ö±}—›•—ç†àÄËÄâÕΩç•Ö±}≠•ç¨àÏ(ÄÄÄÄÄÅç’……ïπ—A…Ωô•±ïm¡…Ωô•±ï-ïÂtÄÙÅëÖ—Ñπ¡…Ωô•±ï}’…∞Ï(ÄÄÄÄÄÅÖ›Ö•–ÅÕàπô…Ω¥†â¡…Ωô•±ïÃà§π’¡ëÖ—î°ÏÅm¡…Ωô•±ï-ïÂtÈëÖ—Ñπ¡…Ωô•±ï}’…∞ÅÙ§πïƒ†â•êà∞Åç’……ïπ—UÕï»π•ê§Ï(ÄÄÄÅÙ(ÄÄÄÅÖ›Ö•–Å±ΩÖëM—…ïÖµççΩ’π—Ωππïç—•ΩπM—Ö—’Ã†§Ï(ÄÅÙ∞Ä»‘¿§Ï)Ù()›•πëΩ‹πçΩππïç—M—…ïÖµççΩ’π–ÄÙÅçΩππïç—M—…ïÖµççΩ’π–Ï)›•πëΩ‹πë•ÕçΩππïç—M—…ïÖµççΩ’π–ÄÙÅë•ÕçΩππïç—M—…ïÖµççΩ’π–Ï)›•πëΩ‹π±ΩÖëM—…ïÖµççΩ’π—Ωππïç—•ΩπM—Ö—’ÃÄÙÅ±ΩÖëM—…ïÖµççΩ’π—Ωππïç—•ΩπM—Ö—’ÃÏ)Õï—Q•µïΩ’–°ô•π•Õ°Aïπë•πùM—…ïÖµ=’—†∞Ä¿§Ï()ô’πç—•Ω∏ÅΩ¡ïπ°ÖπùïAÖÕÕ›Ω…ê†§ÅÏ(ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµµΩëÖ∞µ±Ωç≠ïêàÅëÖ—ÑµµΩëÖ∞µ±Ωç≠ïêÙàƒàÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏Èô•·ïêÏÅ•πÕï–Ë¿ÏÅâÖç≠ù…Ω’πêÈ…ùâÑ†¿∞¿∞¿∞¿∏‹‘§ÏÅËµ•πëï‡Ëƒƒ¿ÏÅë•Õ¡±Ö‰Èô±ï‡ÏÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÏÅ©’Õ—•ô‰µçΩπ—ïπ–Èçïπ—ï»ÏÅ¡Öëë•πúË»¡¡‡Ïà¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâÖ’—†µâΩ‡àÅÕ—Â±îÙâµÖ…ù•∏Ë¿Ïà¯(ÄÄÄÄÄÄÄÄÒ†»˘Öµâ•Ö»ÅçΩπ—…ÖÕó≈ÑΩ†»¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâô•ï±êà¯(ÄÄÄÄÄÄÄÄÄÄÒ±Öâï∞˘9’ïŸÑÅçΩπ—…ÖÕó≈ÑΩ±Öâï∞¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ¡ÖÕÕ›Ω…êµô•ï±êµ›…Ö¿à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ¡ÖÕÕ›Ω…êàÅ•êÙâç°ÖπùïAÖÕÕ›Ω…ë%π¡’–àÅ¡±Öçï°Ω±ëï»Ùãäãäãäãäãäãäãäãäàà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙâ¡ÖÕÕ›Ω…êµ—Ωùù±îµâ—∏àÅΩπç±•ç¨Ùâ—Ωùù±ïAÖÕÕ›Ω…ëY•Õ•â•±•—‰†ùç°ÖπùïAÖÕÕ›Ω…ë%π¡’–ú∞Å—°•Ã§à˚¬~FΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌùÖ¿ËÂ¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâô±ï‡ËƒÏàÅΩπç±•ç¨Ùâç±ΩÕï5ÖπÖùïë5ΩëÖ∞†§à˘Öπçï±Ö»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅÕ—Â±îÙâô±ï‡ËƒÏàÅΩπç±•ç¨ÙâÕ’âµ•—°ÖπùïAÖÕÕ›Ω…ê†§à˘’Ö…ëÖ»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅ•êÙâç°ÖπùïAÖÕÕ›Ω…ë……Ω»àÅç±ÖÕÃÙâï……Ω»µµÕúà¯Ωë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅÕ’âµ•—°ÖπùïAÖÕÕ›Ω…ê†§ÅÏ(ÄÅçΩπÕ–Å¡ÖÕÕ›Ω…êÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âç°ÖπùïAÖÕÕ›Ω…ë%π¡’–à§πŸÖ±’îÏ(ÄÅçΩπÕ–Åï……∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âç°ÖπùïAÖÕÕ›Ω…ë……Ω»à§Ï(ÄÅ•òÄ†Ö¡ÖÕÕ›Ω…êÅÒÅ¡ÖÕÕ›Ω…êπ±ïπù—†ÄÄ‡§ÅÏ(ÄÄÄÅï……∞π—ï·—Ωπ—ïπ–ÄÙÄâ1ÑÅçΩπ—…ÖÕó≈ÑÅ—•ïπîÅ≈’îÅ—ïπï»ÅÖ∞ÅµïπΩÃÄ‡ÅçÖ…Öç—ï…ïÃ∏àÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅÏÅï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπÖ’—†π’¡ëÖ—ïUÕï»°ÏÅ¡ÖÕÕ›Ω…êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»§ÅÏÅï……∞π—ï·—Ωπ—ïπ–ÄÙÅï……Ω»πµïÕÕÖùîÏÅ…ï—’…∏ÏÅÙ((ÄÅΩ¡ïπë•—A…Ωô•±î†§Ï(ÄÅÕ°Ω›QΩÖÕ–†âΩπ—…ÖÕó≈ÑÅÖç—’Ö±•ÈÖëÑà§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïŸÖ—Ö…A°Ω—ΩU¡±ΩÖê†§ÅÏ(ÄÅçΩπÕ–Åô•±ï%π¡’–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÖŸÖ—Ö…A°Ω—Ω%π¡’–à§Ï(ÄÅçΩπÕ–Åô•±îÄÙÅô•±ï%π¡’–πô•±ïÕl¡tÏ(ÄÅçΩπÕ–ÅÕ—Ö—’Õ∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÖŸÖ—Ö…U¡±ΩÖëM—Ö—’Ãà§Ï(ÄÅ•òÄ†Öô•±î§Å…ï—’…∏Ï((ÄÅ•òÄ†Öô•±îπ—Â¡îπÕ—Ö…—Õ]•—††â•µÖùîºà§§ÅÏÅÕ—Ö—’Õ∞π—ï·—Ωπ—ïπ–ÄÙÄâQ•ïπîÅ≈’îÅÕï»Å’πÑÅ•µÖùï∏∏àÏÅÕ—Ö—’Õ∞πÕ—Â±îπçΩ±Ω»ÄÙÄâŸÖ»†¥µ…ïê§àÏÅ…ï—’…∏ÏÅÙ(ÄÅ•òÄ°ô•±îπÕ•ÈîÄ¯ÄÃÄ®Äƒ¿»–Ä®Äƒ¿»–§ÅÏÅÕ—Ö—’Õ∞π—ï·—Ωπ—ïπ–ÄÙÄâ∞ÅÖ…ç°•ŸºÅÕ’¡ï…ÑÅ±ΩÃÄÕ5∏àÏÅÕ—Ö—’Õ∞πÕ—Â±îπçΩ±Ω»ÄÙÄâŸÖ»†¥µ…ïê§àÏÅ…ï—’…∏ÏÅÙ((ÄÅÕ—Ö—’Õ∞π—ï·—Ωπ—ïπ–ÄÙÄâM’â•ïπëº∏∏∏àÏ(ÄÅÕ—Ö—’Õ∞πÕ—Â±îπçΩ±Ω»ÄÙÄâŸÖ»†¥µ—ï·–µë•¥§àÏ((ÄÅçΩπÕ–Åï·–ÄÙÅô•±îππÖµîπÕ¡±•–†à∏à§π¡Ω¿†§π…ï¡±Öçî†ΩmyÑµÈµh¿¥ÂtΩú∞Äàà§Ï(ÄÅçΩπÕ–Å¡Ö—†ÄÙÅÄëÌç’……ïπ—UÕï»π•ëÙΩÖŸÖ—Ö»∏ëÌï·—ıÄÏ((ÄÅçΩπÕ–ÅÏÅï……Ω»ËÅ’¡±ΩÖë……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπÕ—Ω…Öùîπô…Ω¥†âÖŸÖ—Ö…Ãà§π’¡±ΩÖê°¡Ö—†∞Åô•±î∞ÅÏÅçÖç°ïΩπ—…Ω∞ËÄàÃÿ¿¿à∞Å’¡Õï…–ËÅ—…’îÅÙ§Ï(ÄÅ•òÄ°’¡±ΩÖë……Ω»§ÅÏÅÕ—Ö—’Õ∞π—ï·—Ωπ—ïπ–ÄÙÄâ……Ω»ÅÖ∞ÅÕ’â•»ËÄàÄ¨Å’¡±ΩÖë……Ω»πµïÕÕÖùîÏÅÕ—Ö—’Õ∞πÕ—Â±îπçΩ±Ω»ÄÙÄâŸÖ»†¥µ…ïê§àÏÅ…ï—’…∏ÏÅÙ((ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅ¡’â±•çU…±Ö—ÑÅÙÄÙÅÕàπÕ—Ω…Öùîπô…Ω¥†âÖŸÖ—Ö…Ãà§πùï—A’â±•çU…∞°¡Ö—†§Ï(ÄÅçΩπÕ–Åô…ïÕ°U…∞ÄÙÅ¡’â±•çU…±Ö—Ñπ¡’â±•çU…∞Ä¨Äà˝–ÙàÄ¨ÅÖ—îππΩ‹†§ÏÄººÅïŸ•—ÑÅ≈’îÅ≈’ïëîÅ’πÑÅŸï…ÕßÕ∏ÅŸ•ï©ÑÅï∏ÅçÖç£§((ÄÅçΩπÕ–ÅÏÅï……Ω»ËÅ’¡ëÖ—ï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†â¡…Ωô•±ïÃà§π’¡ëÖ—î°ÏÅÖŸÖ—Ö…}’…∞ËÅô…ïÕ°U…∞ÅÙ§πïƒ†â•êà∞Åç’……ïπ—UÕï»π•ê§Ï(ÄÅ•òÄ°’¡ëÖ—ï……Ω»§ÅÏÅÕ—Ö—’Õ∞π—ï·—Ωπ—ïπ–ÄÙÄâ9ºÅÕîÅ¡’ëºÅù’Ö…ëÖ»∏àÏÅÕ—Ö—’Õ∞πÕ—Â±îπçΩ±Ω»ÄÙÄâŸÖ»†¥µ…ïê§àÏÅ…ï—’…∏ÏÅÙ((ÄÅç’……ïπ—A…Ωô•±îπÖŸÖ—Ö…}’…∞ÄÙÅô…ïÕ°U…∞Ï(ÄÅÕ°Ω›QΩÖÕ–†ã
ÖΩ—ºÅëîÅ¡ï…ô•∞ÅÖç—’Ö±•ÈÖëÑÑà§Ï(ÄÅΩ¡ïπë•—A…Ωô•±î†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïIïµΩŸïŸÖ—Ö…A°Ω—º†§ÅÏ(ÄÅçΩπÕ–ÅÏÅï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†â¡…Ωô•±ïÃà§π’¡ëÖ—î°ÏÅÖŸÖ—Ö…}’…∞ËÅπ’±∞ÅÙ§πïƒ†â•êà∞Åç’……ïπ—UÕï»π•ê§Ï(ÄÅ•òÄ°ï……Ω»§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅ≈’•—Ö»Å±ÑÅôΩ—ºà§ÏÅ…ï—’…∏ÏÅÙ(ÄÅç’……ïπ—A…Ωô•±îπÖŸÖ—Ö…}’…∞ÄÙÅπ’±∞Ï(ÄÅÕ°Ω›QΩÖÕ–†âΩ—ºÅ≈’•—ÖëÑ∞ÅŸΩ±Ÿ•Õ—îÅÖ∞ÅïµΩ©§à§Ï(ÄÅΩ¡ïπë•—A…Ωô•±î†§Ï)Ù(()ô’πç—•Ω∏Å¡…ïŸ•ï›ΩŸï…AΩÕ•—•Ω∏°ŸÖ±’î§ÅÏ(ÄÅçΩπÕ–Å‰ÄÙÅ5Ö—†πµÖ‡†¿∞Å5Ö—†πµ•∏†ƒ¿¿∞Å9’µâï»°ŸÖ±’î§ÅÒÄ‘¿§§Ï(ÄÅçΩπÕ–Å¡…ïŸ•ï‹ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âçΩŸï…AΩÕ•—•ΩπA…ïŸ•ï‹à§Ï(ÄÅçΩπÕ–Å±Öâï∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âçΩŸï…AΩÕ•—•ΩπYÖ±’îà§Ï((ÄÅ•òÄ°¡…ïŸ•ï‹ÄòòÅç’……ïπ—A…Ωô•±îπçΩŸï…}’…∞§ÅÏ(ÄÄÄÅ¡…ïŸ•ï‹πÕ—Â±îπâÖç≠ù…Ω’πëAΩÕ•—•Ω∏ÄÙÅÅçïπ—ï»ÄëÌÂÙïÄÏ(ÄÅÙ(ÄÅ•òÄ°±Öâï∞§Å±Öâï∞π—ï·—Ωπ—ïπ–ÄÙÅÄëÌÂÙïÄÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïΩŸï…A°Ω—ΩU¡±ΩÖê†§ÅÏ(ÄÅçΩπÕ–Åô•±ï%π¡’–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âçΩŸï…A°Ω—Ω%π¡’–à§Ï(ÄÅçΩπÕ–Åô•±îÄÙÅô•±ï%π¡’–πô•±ïÕl¡tÏ(ÄÅçΩπÕ–ÅÕ—Ö—’Õ∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âçΩŸï…U¡±ΩÖëM—Ö—’Ãà§Ï(ÄÅ•òÄ†Öô•±î§Å…ï—’…∏Ï((ÄÅ•òÄ†Öô•±îπ—Â¡îπÕ—Ö…—Õ]•—††â•µÖùîºà§§ÅÏÅÕ—Ö—’Õ∞π—ï·—Ωπ—ïπ–ÄÙÄâQ•ïπîÅ≈’îÅÕï»Å’πÑÅ•µÖùï∏∏àÏÅÕ—Ö—’Õ∞πÕ—Â±îπçΩ±Ω»ÄÙÄâŸÖ»†¥µ…ïê§àÏÅ…ï—’…∏ÏÅÙ(ÄÅ•òÄ°ô•±îπÕ•ÈîÄ¯Ä‘Ä®Äƒ¿»–Ä®Äƒ¿»–§ÅÏÅÕ—Ö—’Õ∞π—ï·—Ωπ—ïπ–ÄÙÄâ∞ÅÖ…ç°•ŸºÅÕ’¡ï…ÑÅ±ΩÃÄ’5∏àÏÅÕ—Ö—’Õ∞πÕ—Â±îπçΩ±Ω»ÄÙÄâŸÖ»†¥µ…ïê§àÏÅ…ï—’…∏ÏÅÙ((ÄÅÕ—Ö—’Õ∞π—ï·—Ωπ—ïπ–ÄÙÄâM’â•ïπëº∏∏∏àÏ(ÄÅÕ—Ö—’Õ∞πÕ—Â±îπçΩ±Ω»ÄÙÄâŸÖ»†¥µ—ï·–µë•¥§àÏ((ÄÅçΩπÕ–Åï·–ÄÙÅô•±îππÖµîπÕ¡±•–†à∏à§π¡Ω¿†§π…ï¡±Öçî†ΩmyÑµÈµh¿¥ÂtΩú∞Äàà§Ï(ÄÅçΩπÕ–Å¡Ö—†ÄÙÅÄëÌç’……ïπ—UÕï»π•ëÙΩçΩŸï»∏ëÌï·—ıÄÏ((ÄÅçΩπÕ–ÅÏÅï……Ω»ËÅ’¡±ΩÖë……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπÕ—Ω…Öùîπô…Ω¥†âÖŸÖ—Ö…Ãà§π’¡±ΩÖê°¡Ö—†∞Åô•±î∞ÅÏÅçÖç°ïΩπ—…Ω∞ËÄàÃÿ¿¿à∞Å’¡Õï…–ËÅ—…’îÅÙ§Ï(ÄÅ•òÄ°’¡±ΩÖë……Ω»§ÅÏÅÕ—Ö—’Õ∞π—ï·—Ωπ—ïπ–ÄÙÄâ……Ω»ÅÖ∞ÅÕ’â•»ËÄàÄ¨Å’¡±ΩÖë……Ω»πµïÕÕÖùîÏÅÕ—Ö—’Õ∞πÕ—Â±îπçΩ±Ω»ÄÙÄâŸÖ»†¥µ…ïê§àÏÅ…ï—’…∏ÏÅÙ((ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅ¡’â±•çU…±Ö—ÑÅÙÄÙÅÕàπÕ—Ω…Öùîπô…Ω¥†âÖŸÖ—Ö…Ãà§πùï—A’â±•çU…∞°¡Ö—†§Ï(ÄÅçΩπÕ–Åô…ïÕ°U…∞ÄÙÅ¡’â±•çU…±Ö—Ñπ¡’â±•çU…∞Ä¨Äà˝–ÙàÄ¨ÅÖ—îππΩ‹†§Ï((ÄÅçΩπÕ–ÅÏÅï……Ω»ËÅ’¡ëÖ—ï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†â¡…Ωô•±ïÃà§π’¡ëÖ—î°ÏÅçΩŸï…}’…∞ËÅô…ïÕ°U…∞∞ÅçΩŸï…}¡ΩÕ•—•Ωπ}‰ËÄ‘¿ÅÙ§πïƒ†â•êà∞Åç’……ïπ—UÕï»π•ê§Ï(ÄÅ•òÄ°’¡ëÖ—ï……Ω»§ÅÏÅÕ—Ö—’Õ∞π—ï·—Ωπ—ïπ–ÄÙÄâ9ºÅÕîÅ¡’ëºÅù’Ö…ëÖ»∏àÏÅÕ—Ö—’Õ∞πÕ—Â±îπçΩ±Ω»ÄÙÄâŸÖ»†¥µ…ïê§àÏÅ…ï—’…∏ÏÅÙ((ÄÅç’……ïπ—A…Ωô•±îπçΩŸï…}’…∞ÄÙÅô…ïÕ°U…∞Ï(ÄÅç’……ïπ—A…Ωô•±îπçΩŸï…}¡ΩÕ•—•Ωπ}‰ÄÙÄ‘¿Ï(ÄÅÕ°Ω›QΩÖÕ–†ã
ÖAΩ…—ÖëÑÅÖç—’Ö±•ÈÖëÑÑÅ°Ω…ÑÅ¡Ωì•ÃÅÖçΩµΩëÖ…±Ñ∏à§Ï(ÄÅΩ¡ïπë•—A…Ωô•±î†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïIïµΩŸïΩŸï…A°Ω—º†§ÅÏ(ÄÅçΩπÕ–ÅÏÅï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†â¡…Ωô•±ïÃà§π’¡ëÖ—î°ÏÅçΩŸï…}’…∞ËÅπ’±∞ÅÙ§πïƒ†â•êà∞Åç’……ïπ—UÕï»π•ê§Ï(ÄÅ•òÄ°ï……Ω»§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅ≈’•—Ö»Å±ÑÅ¡Ω…—ÖëÑà§ÏÅ…ï—’…∏ÏÅÙ(ÄÅç’……ïπ—A…Ωô•±îπçΩŸï…}’…∞ÄÙÅπ’±∞Ï(ÄÅÕ°Ω›QΩÖÕ–†âAΩ…—ÖëÑÅ≈’•—ÖëÑà§Ï(ÄÅΩ¡ïπë•—A…Ωô•±î†§Ï)Ù(()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïA…Ωô•±ïM•ëï%µÖùïU¡±ΩÖê†§ÅÏ(ÄÅçΩπÕ–Åô•±ï%π¡’–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡…Ωô•±ïM•ëï%µÖùï%π¡’–à§Ï(ÄÅçΩπÕ–Åô•±îÄÙÅô•±ï%π¡’–¸πô•±ïÃ¸πl¡tÏ(ÄÅçΩπÕ–ÅÕ—Ö—’Õ∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡…Ωô•±ïM•ëï%µÖùïM—Ö—’Ãà§Ï(ÄÅ•òÄ†Öô•±îÅÒÄÖÕ—Ö—’Õ∞§Å…ï—’…∏Ï((ÄÅ•òÄ†Öô•±îπ—Â¡îπÕ—Ö…—Õ]•—††â•µÖùîºà§§ÅÏ(ÄÄÄÅÕ—Ö—’Õ∞π—ï·—Ωπ—ïπ–ÄÙÄâQ•ïπîÅ≈’îÅÕï»Å’πÑÅ•µÖùï∏∏àÏ(ÄÄÄÅÕ—Ö—’Õ∞πÕ—Â±îπçΩ±Ω»ÄÙÄâŸÖ»†¥µ…ïê§àÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅ•òÄ°ô•±îπÕ•ÈîÄ¯Ä‘Ä®Äƒ¿»–Ä®Äƒ¿»–§ÅÏ(ÄÄÄÅÕ—Ö—’Õ∞π—ï·—Ωπ—ïπ–ÄÙÄâ∞ÅÖ…ç°•ŸºÅÕ’¡ï…ÑÅ±ΩÃÄ’5∏àÏ(ÄÄÄÅÕ—Ö—’Õ∞πÕ—Â±îπçΩ±Ω»ÄÙÄâŸÖ»†¥µ…ïê§àÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅÕ—Ö—’Õ∞π—ï·—Ωπ—ïπ–ÄÙÄâM’â•ïπëº∏∏∏àÏ(ÄÅÕ—Ö—’Õ∞πÕ—Â±îπçΩ±Ω»ÄÙÄâŸÖ»†¥µ—ï·–µë•¥§àÏ((ÄÅçΩπÕ–Åï·–ÄÙÅô•±îππÖµîπÕ¡±•–†à∏à§π¡Ω¿†§π…ï¡±Öçî†ΩmyÑµÈµh¿¥ÂtΩú∞Äàà§ÅÒÄâ©¡úàÏ(ÄÅçΩπÕ–Å¡Ö—†ÄÙÅÄëÌç’……ïπ—UÕï»π•ëÙΩ¡…Ωô•±îµâÖç≠ù…Ω’πê∏ëÌï·—ıÄÏ((ÄÅçΩπÕ–ÅÏÅï……Ω»ËÅ’¡±ΩÖë……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπÕ—Ω…Öùî(ÄÄÄÄπô…Ω¥†âÖŸÖ—Ö…Ãà§(ÄÄÄÄπ’¡±ΩÖê°¡Ö—†∞Åô•±î∞ÅÏÅçÖç°ïΩπ—…Ω∞ËÄàÃÿ¿¿à∞Å’¡Õï…–ËÅ—…’îÅÙ§Ï((ÄÅ•òÄ°’¡±ΩÖë……Ω»§ÅÏ(ÄÄÄÅÕ—Ö—’Õ∞π—ï·—Ωπ—ïπ–ÄÙÄâ……Ω»ÅÖ∞ÅÕ’â•»ËÄàÄ¨Å’¡±ΩÖë……Ω»πµïÕÕÖùîÏ(ÄÄÄÅÕ—Ö—’Õ∞πÕ—Â±îπçΩ±Ω»ÄÙÄâŸÖ»†¥µ…ïê§àÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅ¡’â±•çU…±Ö—ÑÅÙÄÙÅÕàπÕ—Ω…Öùîπô…Ω¥†âÖŸÖ—Ö…Ãà§πùï—A’â±•çU…∞°¡Ö—†§Ï(ÄÅçΩπÕ–Åô…ïÕ°U…∞ÄÙÅ¡’â±•çU…±Ö—Ñπ¡’â±•çU…∞Ä¨Äà˝–ÙàÄ¨ÅÖ—îππΩ‹†§Ï((ÄÅçΩπÕ–ÅÏÅï……Ω»ËÅ’¡ëÖ—ï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕà(ÄÄÄÄπô…Ω¥†â¡…Ωô•±ïÃà§(ÄÄÄÄπ’¡ëÖ—î°ÏÅ¡…Ωô•±ï}Õ•ëï}•µÖùï}’…∞ËÅô…ïÕ°U…∞ÅÙ§(ÄÄÄÄπïƒ†â•êà∞Åç’……ïπ—UÕï»π•ê§Ï((ÄÅ•òÄ°’¡ëÖ—ï……Ω»§ÅÏ(ÄÄÄÅÕ—Ö—’Õ∞π—ï·—Ωπ—ïπ–ÄÙÄâ9ºÅÕîÅ¡’ëºÅù’Ö…ëÖ»∏àÏ(ÄÄÄÅÕ—Ö—’Õ∞πÕ—Â±îπçΩ±Ω»ÄÙÄâŸÖ»†¥µ…ïê§àÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅç’……ïπ—A…Ωô•±îπ¡…Ωô•±ï}Õ•ëï}•µÖùï}’…∞ÄÙÅô…ïÕ°U…∞Ï(ÄÅÕ°Ω›QΩÖÕ–†ã
ÖΩπëºÅëï∞Å¡ï…ô•∞ÅÖç—’Ö±•ÈÖëºÑà§Ï(ÄÅΩ¡ïπë•—A…Ωô•±î†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïIïµΩŸïA…Ωô•±ïM•ëï%µÖùî†§ÅÏ(ÄÅçΩπÕ–ÅÏÅï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕà(ÄÄÄÄπô…Ω¥†â¡…Ωô•±ïÃà§(ÄÄÄÄπ’¡ëÖ—î°ÏÅ¡…Ωô•±ï}Õ•ëï}•µÖùï}’…∞ËÅπ’±∞ÅÙ§(ÄÄÄÄπïƒ†â•êà∞Åç’……ïπ—UÕï»π•ê§Ï((ÄÅ•òÄ°ï……Ω»§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅ≈’•—Ö»Å±ÑÅ•µÖùï∏ÅëîÅôΩπëºà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅç’……ïπ—A…Ωô•±îπ¡…Ωô•±ï}Õ•ëï}•µÖùï}’…∞ÄÙÅπ’±∞Ï(ÄÅÕ°Ω›QΩÖÕ–†â%µÖùï∏ÅëîÅôΩπëºÅ≈’•—ÖëÑà§Ï(ÄÅΩ¡ïπë•—A…Ωô•±î†§Ï)Ù()ô’πç—•Ω∏ÅÕï±ïç—ŸÖ—Ö…µΩ©§°ïµΩ©§§ÅÏ(ÄÅ›•πëΩ‹πÕï±ïç—ïëŸÖ—Ö…µΩ©§ÄÙÅïµΩ©§Ï(ÄÅëΩç’µïπ–π≈’ï…ÂMï±ïç—Ω…±∞†âm•ëxÙùïµΩ©§¥ùtà§πôΩ…Öç†°àÄÙ¯ÅàπÕ—Â±îπâÖç≠ù…Ω’πêÄÙÄâ—…ÖπÕ¡Ö…ïπ–à§Ï(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê°ÅïµΩ©§¥ëÌïµΩ©•ıÄ§πÕ—Â±îπâÖç≠ù…Ω’πêÄÙÄâŸÖ»†¥µ¡Öπï∞¥»§àÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å…ï≈’ïÕ—…ïÖ—Ω…ççïÕÃ†§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†â…ï≈’ïÕ—}ç…ïÖ—Ω…}ÖççïÕÃà§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅçΩπÕ–ÅµïÕÕÖùïÃÄÙÅÏ(ÄÄÄÄÄÅŸ•ëïΩÕ}•πÕ’ô•ç•ïπ—ïÃËâ9ïçïÕ•”ÖÃÅ¡’â±•çÖ»ÅÖ∞ÅµïπΩÃÄ‘ÅŸ•ëïΩÃ∏à∞(ÄÄÄÄÄÅç’ïπ—Ö}µ’Â}π’ïŸÑËâQ‘Åç’ïπ—ÑÅëïâîÅ—ïπï»ÅÖ∞ÅµïπΩÃÄ‹ÅìµÖÃ∏à∞(ÄÄÄÄÄÅç’ïπ—Ö}ÕÖπç•ΩπÖëÑËâ9ºÅ¡Ωì•ÃÅ¡ΩÕ—’±Ö…—îÅµ•ïπ—…ÖÃÅ—ïπùÖÃÅ’πÑÅÕÖπçßÕ∏∏à∞(ÄÄÄÄÄÅÕΩ±•ç•—’ë}¡ïπë•ïπ—îËâQ‘ÅÕΩ±•ç•—’êÅÂÑÅïÕ”ÑÅï∏Å…ïŸ•ÕßÕ∏∏à∞(ÄÄÄÄÄÅÂÖ}ïÕ}ç…ïÖëΩ»ËâQ‘Åç’ïπ—ÑÅÂÑÅïÃÅ…ïÖëΩ»∏à(ÄÄÄÅÙÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°µïÕÕÖùïÕmëÖ—Ñ¸πï……Ω…tÅÒÄâ9ºÅÕîÅ¡’ëºÅïπŸ•Ö»Å±ÑÅÕΩ±•ç•—’êà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅç’……ïπ—A…Ωô•±îπç…ïÖ—Ω…}Ö¡¡±•çÖ—•Ωπ}Õ—Ö—’ÃÄÙÄâ¡ïπë•πúàÏ(ÄÅÕ°Ω›QΩÖÕ–†ã¬~:∞ÅMΩ±•ç•—’êÅïπŸ•ÖëÑÅÖ∞ÅÖëµ•π•Õ—…ÖëΩ»à§Ï(ÄÅΩ¡ïπë•—A…Ωô•±î†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å—Ωùù±ïQ•≠QΩ≠1•Ÿî†§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—A…Ωô•±î¸π•Õ}ç…ïÖ—Ω»§ÅÏÅÕ°Ω›QΩÖÕ–†âÕ—ÑÅΩ¡çßÕ∏ÅïÃÅÕΩ±ºÅ¡Ö…ÑÅ…ïÖëΩ…ïÃà§ÏÅ…ï—’…∏ÏÅÙ(ÄÅçΩπÕ–Å’…∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕΩç•Ö±Q•≠—Ω¨à§¸πŸÖ±’îπ—…•¥†§ÅÒÅç’……ïπ—A…Ωô•±îπÕΩç•Ö±}—•≠—Ω¨ÅÒÄààÏ(ÄÅ•òÄ†Öç’……ïπ—A…Ωô•±îπ—•≠—Ω≠}•Õ}±•ŸîÄòòÄÖùï—Q•≠QΩ≠A…Ωô•±ïU…∞°’…∞§§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†âA…•µï…ºÅÖù…ïüÑÅï∞Åïπ±ÖçîÅëîÅ—‘Å¡ï…ô•∞ÅëîÅQ•≠QΩ¨à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅçΩπÕ–ÅÖç—•ŸÖ—îÄÙÄÖç’……ïπ—A…Ωô•±îπ—•≠—Ω≠}•Õ}±•ŸîÏ(ÄÅçΩπÕ–Åâ’——Ω∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â—•≠—Ω≠1•ŸïQΩùù±îà§Ï(ÄÅ•òÄ°â’——Ω∏§Åâ’——Ω∏πë•ÕÖâ±ïêÄÙÅ—…’îÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÕï—}µÂ}—•≠—Ω≠}±•Ÿîà∞ÅÏÅ¡}±•ŸîÈÖç—•ŸÖ—î∞Å¡}¡…Ωô•±ï}’…∞È’…∞ÅÒÅπ’±∞ÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÅëÖ—Ñ¸πΩ¨ÄÙÙÙÅôÖ±Õî§ÅÏ(ÄÄÄÅ•òÄ°â’——Ω∏§Åâ’——Ω∏πë•ÕÖâ±ïêÄÙÅôÖ±ÕîÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°ëÖ—Ñ¸πï……Ω»ÄÙÙÙÄâ•πŸÖ±•ë}—•≠—Ω≠}’…∞àÄ¸Äâ∞Åïπ±ÖçîÅëîÅQ•≠QΩ¨ÅπºÅïÃÅ€Ö±•ëºàÄËÄâ9ºÅÕîÅ¡’ëºÅÖç—’Ö±•ÈÖ»Åï∞Åë•…ïç—ºÅëîÅQ•≠QΩ¨à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅç’……ïπ—A…Ωô•±îπ—•≠—Ω≠}•Õ}±•ŸîÄÙÅÖç—•ŸÖ—îÏ(ÄÅ•òÄ°’…∞§Åç’……ïπ—A…Ωô•±îπÕΩç•Ö±}—•≠—Ω¨ÄÙÅ’…∞Ï(ÄÅÕ°Ω›QΩÖÕ–°Öç—•ŸÖ—îÄ¸Äã¬~R–ÅQ‘Åë•…ïç—ºÅëîÅQ•≠QΩ¨ÅÂÑÅÖ¡Ö…ïçîÅï∏Å•…ïç—ΩÃàÄËÄâ•…ïç—ºÅëîÅQ•≠QΩ¨Åô•πÖ±•ÈÖëºà§Ï(ÄÅΩ¡ïπë•—A…Ωô•±î†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅÕÖŸïA…Ωô•±ïë•—Ã†§ÅÏ(ÄÅçΩπÕ–Åπï›UÕï…πÖµîÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âïë•—UÕï…πÖµîà§πŸÖ±’îπ—…•¥†§Ï(ÄÅçΩπÕ–Åâ•ºÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âïë•—	•ºà§πŸÖ±’îπ—…•¥†§Ï(ÄÅçΩπÕ–Åï……∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âïë•—A…Ωô•±ï……Ω»à§Ï((ÄÅ•òÄ°πï›UÕï…πÖµîÄÑÙÙÅç’……ïπ—A…Ωô•±îπ’Õï…πÖµî§ÅÏ(ÄÄÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†â’¡ëÖ—ï}’Õï…πÖµîà∞ÅÏÅ¡}’Õï…}•êËÅç’……ïπ—UÕï»π•ê∞Å¡}πï›}’Õï…πÖµîËÅπï›UÕï…πÖµîÅÙ§Ï(ÄÄÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏ(ÄÄÄÄÄÅï……∞π—ï·—Ωπ—ïπ–ÄÙÅëÖ—Ñ¸πï……Ω»ÄÙÙÙÄâπΩµâ…ï}Ωç’¡ÖëºàÄ¸ÄâÕîÅπΩµâ…îÅëîÅ’Õ’Ö…•ºÅÂÑÅïÕ”ÑÅï∏Å’Õº∏àÄËÄâ∞ÅπΩµâ…îÅ—•ïπîÅ≈’îÅ—ïπï»ÅÖ∞ÅµïπΩÃÄÃÅçÖ…Öç—ï…ïÃ∏àÏ(ÄÄÄÄÄÅ…ï—’…∏Ï(ÄÄÄÅÙ(ÄÄÄÅç’……ïπ—A…Ωô•±îπ’Õï…πÖµîÄÙÅπï›UÕï…πÖµîÏ(ÄÅÙ((ÄÅçΩπÕ–ÅçΩŸï…AΩÕ•—•Ωπ∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âçΩŸï…AΩÕ•—•ΩπIÖπùîà§Ï(ÄÅçΩπÕ–ÅçΩŸï…AΩÕ•—•ΩπdÄÙÅçΩŸï…AΩÕ•—•Ωπ∞Ä¸Å5Ö—†πµÖ‡†¿∞Å5Ö—†πµ•∏†ƒ¿¿∞Å9’µâï»°çΩŸï…AΩÕ•—•Ωπ∞πŸÖ±’î§ÅÒÄ‘¿§§ÄËÅ9’µâï»°ç’……ïπ—A…Ωô•±îπçΩŸï…}¡ΩÕ•—•Ωπ}‰Ä¸¸Ä‘¿§Ï((ÄÅçΩπÕ–Å≠•ç≠∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕΩç•Ö±-•ç¨à§Ï(ÄÅçΩπÕ–Å—›•—ç°∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕΩç•Ö±Q›•—ç†à§Ï(ÄÅçΩπÕ–ÅÂΩ’—’âï∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕΩç•Ö±eΩ’—’âîà§Ï(ÄÅçΩπÕ–Å—•≠—Ω≠∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕΩç•Ö±Q•≠—Ω¨à§Ï(ÄÅçΩπÕ–ÅÕΩç•Ö±AÖÂ±ΩÖêÄÙÅÏ(ÄÄÄÅÕΩç•Ö±}•πÕ—Öù…Ö¥ÈëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕΩç•Ö±%πÕ—Öù…Ö¥à§πŸÖ±’îπ—…•¥†§ÅÒÅπ’±∞(ÄÅÙÏ(ÄÅ•òÄ°ç’……ïπ—A…Ωô•±îπ•Õ}ç…ïÖ—Ω»§ÅÏ(ÄÄÄÅÕΩç•Ö±AÖÂ±ΩÖêπÕΩç•Ö±}≠•ç¨ÄÙÅ±Õï—Ωππïç—ïëM—…ïÖµA…Ωô•±ïU…∞†â≠•ç¨à§ÅÒÅ≠•ç≠∞¸πŸÖ±’îπ—…•¥†§ÅÒÅπ’±∞Ï(ÄÄÄÅÕΩç•Ö±AÖÂ±ΩÖêπÕΩç•Ö±}—›•—ç†ÄÙÅ±Õï—Ωππïç—ïëM—…ïÖµA…Ωô•±ïU…∞†â—›•—ç†à§ÅÒÅ—›•—ç°∞¸πŸÖ±’îπ—…•¥†§ÅÒÅπ’±∞Ï(ÄÄÄÅÕΩç•Ö±AÖÂ±ΩÖêπÕΩç•Ö±}ÂΩ’—’âîÄÙÅÂΩ’—’âï∞¸πŸÖ±’îπ—…•¥†§ÅÒÅπ’±∞Ï(ÄÄÄÅÕΩç•Ö±AÖÂ±ΩÖêπÕΩç•Ö±}—•≠—Ω¨ÄÙÅ—•≠—Ω≠∞¸πŸÖ±’îπ—…•¥†§ÅÒÅπ’±∞Ï(ÄÅÙ((ÄÅçΩπÕ–Å•πŸÖ±•ëMΩç•Ö∞ÄÙÅ=â©ïç–πïπ—…•ïÃ°ÕΩç•Ö±AÖÂ±ΩÖê§πô•πê†°l∞ÅŸÖ±’ït§ÄÙ¯ÅŸÖ±’îÄòòÄÖ•ÕMÖôïU…∞°ŸÖ±’î§§Ï(ÄÅ•òÄ°•πŸÖ±•ëMΩç•Ö∞§ÅÏ(ÄÄÄÅï……∞π—ï·—Ωπ—ïπ–ÄÙÄâ1ΩÃÅïπ±ÖçïÃÅëîÅ…ïëïÃÅëïâï∏ÅçΩµïπÈÖ»ÅçΩ∏Å°——¡ÃËººÅºÅ°——¿ËººàÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅ•òÄ°ÕΩç•Ö±AÖÂ±ΩÖêπÕΩç•Ö±}≠•ç¨ÄòòÄÖùï—-•ç≠°Öππï±…ΩµU…∞°ÕΩç•Ö±AÖÂ±ΩÖêπÕΩç•Ö±}≠•ç¨§§ÅÏ(ÄÄÄÅï……∞π—ï·—Ωπ—ïπ–ÄÙÄâ∞Åïπ±ÖçîÅÖ±—ï…πÖ—•ŸºÅëîÅ-•ç¨ÅëïâîÅ¡ï…—ïπïçï»ÅÑÅ≠•ç¨πçΩ¥∏àÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅ•òÄ°ÕΩç•Ö±AÖÂ±ΩÖêπÕΩç•Ö±}—›•—ç†ÄòòÄÖùï—Q›•—ç°°Öππï±…ΩµU…∞°ÕΩç•Ö±AÖÂ±ΩÖêπÕΩç•Ö±}—›•—ç†§§ÅÏ(ÄÄÄÅï……∞π—ï·—Ωπ—ïπ–ÄÙÄâ∞Åïπ±ÖçîÅÖ±—ï…πÖ—•ŸºÅëîÅQ›•—ç†ÅëïâîÅ¡ï…—ïπïçï»ÅÑÅ—›•—ç†π—ÿ∏àÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅÏÅï……Ω»ËÅ’¡ëÖ—ï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†â¡…Ωô•±ïÃà§π’¡ëÖ—î°Ï(ÄÄÄÅâ•º∞(ÄÄÄÅÖŸÖ—Ö…}ïµΩ©§ËÅ›•πëΩ‹πÕï±ïç—ïëŸÖ—Ö…µΩ©§∞(ÄÄÄÅçΩŸï…}¡ΩÕ•—•Ωπ}‰ËÅçΩŸï…AΩÕ•—•Ωπd∞(ÄÄÄÄ∏∏πÕΩç•Ö±AÖÂ±ΩÖê(ÄÅÙ§πïƒ†â•êà∞Åç’……ïπ—UÕï»π•ê§Ï((ÄÅ•òÄ°’¡ëÖ—ï……Ω»§ÅÏÅï……∞π—ï·—Ωπ—ïπ–ÄÙÄâ9ºÅÕîÅ¡’ëºÅù’Ö…ëÖ»∏àÏÅ…ï—’…∏ÏÅÙ((ÄÅç’……ïπ—A…Ωô•±îπâ•ºÄÙÅâ•ºÏ(ÄÅç’……ïπ—A…Ωô•±îπÖŸÖ—Ö…}ïµΩ©§ÄÙÅ›•πëΩ‹πÕï±ïç—ïëŸÖ—Ö…µΩ©§Ï(ÄÅç’……ïπ—A…Ωô•±îπçΩŸï…}¡ΩÕ•—•Ωπ}‰ÄÙÅçΩŸï…AΩÕ•—•ΩπdÏ(ÄÅ•òÄ°ç’……ïπ—A…Ωô•±îπ•Õ}ç…ïÖ—Ω»§ÅÏ(ÄÄÄÅç’……ïπ—A…Ωô•±îπÕΩç•Ö±}≠•ç¨ÄÙÅÕΩç•Ö±AÖÂ±ΩÖêπÕΩç•Ö±}≠•ç¨ÅÒÄààÏ(ÄÄÄÅç’……ïπ—A…Ωô•±îπÕΩç•Ö±}—›•—ç†ÄÙÅÕΩç•Ö±AÖÂ±ΩÖêπÕΩç•Ö±}—›•—ç†ÅÒÄààÏ(ÄÄÄÅç’……ïπ—A…Ωô•±îπÕΩç•Ö±}ÂΩ’—’âîÄÙÅÂΩ’—’âï∞¸πŸÖ±’îπ—…•¥†§ÅÒÄààÏ(ÄÄÄÅç’……ïπ—A…Ωô•±îπÕΩç•Ö±}—•≠—Ω¨ÄÙÅ—•≠—Ω≠∞¸πŸÖ±’îπ—…•¥†§ÅÒÄààÏ(ÄÅÙ(ÄÅç’……ïπ—A…Ωô•±îπÕΩç•Ö±}•πÕ—Öù…Ö¥ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕΩç•Ö±%πÕ—Öù…Ö¥à§πŸÖ±’îπ—…•¥†§Ï(ÄÅç±ΩÕï5ÖπÖùïë5ΩëÖ∞†§Ï(ÄÅÕ°Ω›QΩÖÕ–†âAï…ô•∞ÅÖç—’Ö±•ÈÖëºà§Ï(ÄÅ…ïπëï…A…Ωô•±î†§Ï)Ù()ô’πç—•Ω∏ÅΩ¡ïπ1•ŸïMç…Ω±∞‘‰¡ëµ•πA…ïŸ•ï‹†§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—A…Ωô•±î¸π•Õ}Öëµ•∏§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†âÕ—ÑÅ¡…’ïâÑÅïÕ”ÑÅë•Õ¡Ωπ•â±îÅÕΩ±ºÅ¡Ö…ÑÅÖëµ•π•Õ—…ÖëΩ…ïÃà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ•òÄ†Ö›…Ö¿§Å…ï—’…∏Ï((ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µΩŸï…±Ö‰Å±ÃµµΩëÖ∞µ±Ωç≠ïêàÅëÖ—ÑµµΩëÖ∞µ±Ωç≠ïêÙàƒàÅÕ—Â±îÙâËµ•πëï‡Ë‰‰‰‡Ì¡Öëë•πúË¿ÌâÖç≠ù…Ω’πêËå¿¿¿Ïà¯(ÄÄÄÄÄÄÒâ’——Ω∏(ÄÄÄÄÄÄÄÅ—Â¡îÙââ’——Ω∏à(ÄÄÄÄÄÄÄÅÖ…•Ñµ±Öâï∞Ùâï……Ö»Å¡…ïŸ•Õ’Ö±•ÈÖçßÕ∏à(ÄÄÄÄÄÄÄÅΩπç±•ç¨Ùâç±ΩÕï1•ŸïMç…Ω±∞‘‰¡ëµ•πA…ïŸ•ï‹†§à(ÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏Èô•·ïêÌËµ•πëï‡Ëƒ¿¿¿»Ì—Ω¿ÈµÖ‡†ƒ—¡‡±ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µ—Ω¿§§Ì±ïô–ÈµÖ‡†ƒ—¡‡±ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µ±ïô–§§Ì›•ë—†Ë–…¡‡Ì°ï•ù°–Ë–…¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏»–§ÌâΩ…ëï»µ…Öë•’ÃË‘¿îÌâÖç≠ù…Ω’πêÈ…ùâÑ†‘∞ÿ∞‡∞∏‡»§ÌçΩ±Ω»ËçôôòÌôΩπ–µÕ•ÈîË»¡¡‡Ìç’…ÕΩ»È¡Ω•π—ï»ÌâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†ƒ¡¡‡§Ïà(ÄÄÄÄÄÄ˚ärTΩâ’——Ω∏¯(ÄÄÄÄÄÄÒ•ô…Öµî(ÄÄÄÄÄÄÄÅ—•—±îÙâA…’ïâÑÅ¡…•ŸÖëÑÅI=ÅQ<Ä‘∏‰à(ÄÄÄÄÄÄÄÅÕ…åÙâAIY%\µ%9QI<µ1%YMI=10¥ÿπ°—µ∞˝ÿÙ‘∏‡∏‰µ…ΩÖêµ—º¥‘‰à(ÄÄÄÄÄÄÄÅÖ±±Ω‹ÙâÖ’—Ω¡±Ö‰à(ÄÄÄÄÄÄÄÅÕ—Â±îÙâë•Õ¡±Ö‰Èâ±Ωç¨Ì›•ë—†Ëƒ¿¿îÌ°ï•ù°–Ëƒ¿¿îÌ°ï•ù°–Ëƒ¿¡ëŸ†ÌâΩ…ëï»Ë¿ÌâÖç≠ù…Ω’πêËå¿‘¿ÿ¿‡Ïà(ÄÄÄÄÄÄ¯Ω•ô…Öµî¯(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ô’πç—•Ω∏Åç±ΩÕï1•ŸïMç…Ω±∞‘‰¡ëµ•πA…ïŸ•ï‹†§ÅÏ(ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ•òÄ°›…Ö¿§Å›…Ö¿π•ππï…!Q50ÄÙÄààÏ)Ù()›•πëΩ‹πΩ¡ïπ1•ŸïMç…Ω±∞‘‰¡ëµ•πA…ïŸ•ï‹ÄÙÅΩ¡ïπ1•ŸïMç…Ω±∞‘‰¡ëµ•πA…ïŸ•ï‹Ï)›•πëΩ‹πç±ΩÕï1•ŸïMç…Ω±∞‘‰¡ëµ•πA…ïŸ•ï‹ÄÙÅç±ΩÕï1•ŸïMç…Ω±∞‘‰¡ëµ•πA…ïŸ•ï‹Ï()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖëëµ•πAïπë•πùY•ëïΩIï¡Ω…—Ã†§ÅÏ(ÄÅçΩπÕ–Å…¡çIïÕ’±–ÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ùï—}¡ïπë•πù}Ÿ•ëïΩ}…ï¡Ω…—Ãà§Ï(ÄÅ•òÄ†Ö…¡çIïÕ’±–¸πï……Ω»ÄòòÅ…¡çIïÕ’±–¸πëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅçΩπÕ–Å…ï¡Ω…—ÃÄÙÅ……Ö‰π•Õ……Ö‰°…¡çIïÕ’±–πëÖ—Ñπ…ï¡Ω…—Ã§Ä¸Å…¡çIïÕ’±–πëÖ—Ñπ…ï¡Ω…—ÃÄËÅmtÏ(ÄÄÄÅ…ï—’…∏ÅÏ(ÄÄÄÄÄÅëÖ—ÑÈ…ï¡Ω…—ÃπµÖ¿°»ÄÙ¯Ä°Ï(ÄÄÄÄÄÄÄÄ∏∏π»∞(ÄÄÄÄÄÄÄÅŸ•ëïΩÃÈÏÅ—•—±îÈ»πŸ•ëïΩ}—•—±îÅÒÅπ’±∞∞ÅŸ•ëïΩ}’…∞È»πŸ•ëïΩ}’…∞ÅÒÅπ’±∞ÅÙ∞(ÄÄÄÄÄÄÄÅ¡…Ωô•±ïÃÈÏÅ’Õï…πÖµîÈ»π…ï¡Ω…—ï…}’Õï…πÖµîÅÒÅπ’±∞ÅÙ(ÄÄÄÄÄÅÙ§§∞(ÄÄÄÄÄÅï……Ω»Èπ’±∞(ÄÄÄÅÙÏ(ÄÅÙ((ÄÄººÅIïÕ¡Ö±ëºÅçΩµ¡Ö—•â±îÅçΩ∏Å•πÕ—Ö±Öç•ΩπïÃÅëΩπëîÅ±ÑÅô’πçßÕ∏Åπ’ïŸÑÅ—ΩëÖ€µÑÅπº(ÄÄººÅô’îÅï©ïç’—ÖëÑ∏ÅŸ•—ÑÅëï¡ïπëï»Åëï∞ÅπΩµâ…îÅ•π—ï…πºÅëîÅ’πÑÅç±ÖŸîÅôΩÀÖπïÑ∏(ÄÅçΩπÕ–Å…Ö›IïÕ’±–ÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†âŸ•ëïΩ}…ï¡Ω…—Ãà§(ÄÄÄÄπÕï±ïç–†à®à§(ÄÄÄÄπΩ…ëï»†âç…ïÖ—ïë}Ö–à∞ÅÏÅÖÕçïπë•πúÈ—…’îÅÙ§Ï((ÄÅ•òÄ°…Ö›IïÕ’±–πï……Ω»§Å…ï—’…∏ÅÏÅëÖ—ÑÈmt∞Åï……Ω»È…Ö›IïÕ’±–πï……Ω»ÅÙÏ((ÄÅçΩπÕ–Åç±ΩÕïëM—Ö—’ÕïÃÄÙÅπï‹ÅMï–°lâë•Õµ•ÕÕïêà∞Äâ…ïÕΩ±Ÿïêà∞Äâç±ΩÕïêà∞Äâ…ï©ïç—ïêà∞ÄâëïÕçÖ…—Öëºà∞Äâ…ïÕ’ï±—ºà∞Äâçï……Öëºât§Ï(ÄÅçΩπÕ–Å…Ö›Iï¡Ω…—ÃÄÙÄ°…Ö›IïÕ’±–πëÖ—ÑÅÒÅmt§πô•±—ï»°»ÄÙ¯(ÄÄÄÄÖç±ΩÕïëM—Ö—’ÕïÃπ°ÖÃ°M—…•πú°»πÕ—Ö—’ÃÅÒÄâ¡ïπë•πúà§π—Ω1Ω›ï…ÖÕî†§§(ÄÄ§Ï(ÄÅçΩπÕ–ÅŸ•ëïΩ%ëÃÄÙÅl∏∏ππï‹ÅMï–°…Ö›Iï¡Ω…—ÃπµÖ¿°»ÄÙ¯Å»πŸ•ëïΩ}•ê§πô•±—ï»°	ΩΩ±ïÖ∏§•tÏ(ÄÅçΩπÕ–Å…ï¡Ω…—ï…%ëÃÄÙÅl∏∏ππï‹ÅMï–°…Ö›Iï¡Ω…—ÃπµÖ¿°»ÄÙ¯Å»π…ï¡Ω…—ï…}•ê§πô•±—ï»°	ΩΩ±ïÖ∏§•tÏ((ÄÅçΩπÕ–ÅmŸ•ëïΩÕIïÕ’±–∞Å¡…Ωô•±ïÕIïÕ’±—tÄÙÅÖ›Ö•–ÅA…Ωµ•ÕîπÖ±∞°l(ÄÄÄÅŸ•ëïΩ%ëÃπ±ïπù—†(ÄÄÄÄÄÄ¸ÅÕàπô…Ω¥†âŸ•ëïΩÃà§πÕï±ïç–†â•ê±—•—±î±Ÿ•ëïΩ}’…∞à§π•∏†â•êà∞ÅŸ•ëïΩ%ëÃ§(ÄÄÄÄÄÄËÅA…Ωµ•Õîπ…ïÕΩ±Ÿî°ÏÅëÖ—ÑÈmt∞Åï……Ω»Èπ’±∞ÅÙ§∞(ÄÄÄÅ…ï¡Ω…—ï…%ëÃπ±ïπù—†(ÄÄÄÄÄÄ¸ÅÕàπô…Ω¥†â¡…Ωô•±ïÃà§πÕï±ïç–†â•ê±’Õï…πÖµîà§π•∏†â•êà∞Å…ï¡Ω…—ï…%ëÃ§(ÄÄÄÄÄÄËÅA…Ωµ•Õîπ…ïÕΩ±Ÿî°ÏÅëÖ—ÑÈmt∞Åï……Ω»Èπ’±∞ÅÙ§(ÄÅt§Ï((ÄÅçΩπÕ–ÅŸ•ëïΩÕ	Â%êÄÙÅ=â©ïç–πô…Ωµπ—…•ïÃ†°Ÿ•ëïΩÕIïÕ’±–πëÖ—ÑÅÒÅmt§πµÖ¿°ÿÄÙ¯Åmÿπ•ê∞ÅŸt§§Ï(ÄÅçΩπÕ–Å¡…Ωô•±ïÕ	Â%êÄÙÅ=â©ïç–πô…Ωµπ—…•ïÃ†°¡…Ωô•±ïÕIïÕ’±–πëÖ—ÑÅÒÅmt§πµÖ¿°¿ÄÙ¯Åm¿π•ê∞Å¡t§§Ï((ÄÅ…ï—’…∏ÅÏ(ÄÄÄÅëÖ—ÑÈ…Ö›Iï¡Ω…—ÃπµÖ¿°»ÄÙ¯Ä°Ï(ÄÄÄÄÄÄ∏∏π»∞(ÄÄÄÄÄÅŸ•ëïΩÃÈŸ•ëïΩÕ	Â%ëm»πŸ•ëïΩ}•ëtÅÒÅπ’±∞∞(ÄÄÄÄÄÅ¡…Ωô•±ïÃÈ¡…Ωô•±ïÕ	Â%ëm»π…ï¡Ω…—ï…}•ëtÅÒÅπ’±∞(ÄÄÄÅÙ§§∞(ÄÄÄÅï……Ω»Èπ’±∞(ÄÅÙÏ)Ù()çΩπÕ–Å1M}%99}1	}-dÄÙÄâ±•ŸïÕç…Ω±∞Ÿ}ô•πÖπçï}±Öâ}ÿƒàÏ()ô’πç—•Ω∏Åùï—•πÖπçï1ÖâM—Ö—î†§ÅÏ(ÄÅçΩπÕ–Åïµ¡—‰ÄÙÅÏ(ÄÄÄÅ’Õï…Ω•πÃË¿∞(ÄÄÄÅç…ïÖ—Ω…Aïπë•πúË¿∞(ÄÄÄÅç…ïÖ—Ω…ŸÖ•±Öâ±îË¿∞(ÄÄÄÅ±•ŸïMç…Ω±±…ΩÕÃË¿∞(ÄÄÄÅçΩ±±ïç—ïë…ÃË¿∞(ÄÄÄÅµΩŸïµïπ—ÃÈmt(ÄÅÙÏ(ÄÅ—…‰ÅÏ(ÄÄÄÅçΩπÕ–ÅÕÖŸïêÄÙÅ)M=8π¡Ö…Õî°±ΩçÖ±M—Ω…Öùîπùï—%—ï¥°1M}%99}1	}-d§ÅÒÄâπ’±∞à§Ï(ÄÄÄÅ…ï—’…∏ÅÕÖŸïêÄòòÅ—Â¡ïΩòÅÕÖŸïêÄÙÙÙÄâΩâ©ïç–àÄ¸ÅÏÄ∏∏πïµ¡—‰∞Ä∏∏πÕÖŸïêÅÙÄËÅïµ¡—‰Ï(ÄÅÙÅçÖ—ç†Ä°|§ÅÏ(ÄÄÄÅ…ï—’…∏Åïµ¡—‰Ï(ÄÅÙ)Ù()ô’πç—•Ω∏ÅÕÖŸï•πÖπçï1ÖâM—Ö—î°Õ—Ö—î§ÅÏ(ÄÅ±ΩçÖ±M—Ω…ÖùîπÕï—%—ï¥°1M}%99}1	}-d∞Å)M=8πÕ—…•πù•ô‰°Õ—Ö—î§§Ï)Ù()ô’πç—•Ω∏ÅÖëë•πÖπçï1Öâ5ΩŸïµïπ–°Õ—Ö—î∞Å—Â¡î∞Åëï—Ö•∞∞ÅÖµΩ’π–∞Å—ΩπîÙâπΩ…µÖ∞à§ÅÏ(ÄÅÕ—Ö—îπµΩŸïµïπ—Ãπ’πÕ°•ô–°Ï(ÄÄÄÅ•êÈÅ±Öà¥ëÌÖ—îππΩ‹†•Ù¥ëÌ5Ö—†π…ÖπëΩ¥†§π—ΩM—…•πú†ƒÿ§πÕ±•çî†»•ıÄ∞(ÄÄÄÅ—Â¡î∞(ÄÄÄÅëï—Ö•∞∞(ÄÄÄÅÖµΩ’π–∞(ÄÄÄÅ—Ωπî∞(ÄÄÄÅç…ïÖ—ïë–Èπï‹ÅÖ—î†§π—Ω%M=M—…•πú†§(ÄÅÙ§Ï(ÄÅÕ—Ö—îπµΩŸïµïπ—ÃÄÙÅÕ—Ö—îπµΩŸïµïπ—ÃπÕ±•çî†¿∞Ä»¿§Ï)Ù()ô’πç—•Ω∏ÅÕ•µ’±Ö—ï•πÖπçï1ÖâA’…ç°ÖÕî†§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—A…Ωô•±î¸π•Õ}Öëµ•∏§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÕ—Ö—îÄÙÅùï—•πÖπçï1ÖâM—Ö—î†§Ï(ÄÅÕ—Ö—îπçΩ±±ïç—ïë…ÃÄ¨ÙÄƒ¿¿¿¿Ï(ÄÅÕ—Ö—îπ’Õï…Ω•πÃÄ¨ÙÄƒ¿¿¿¿Ï(ÄÅÖëë•πÖπçï1Öâ5ΩŸïµïπ–°Õ—Ö—î∞Äâ=5AIÅM%5U1à∞ÄâUÕ’Ö…•ºÅëîÅ¡…’ïâÑÅçΩµ¡ÀÃÄƒ¿∏¿¿¿ÅµΩπïëÖÃà∞Äƒ¿¿¿¿∞Äâù…ïï∏à§Ï(ÄÅÕÖŸï•πÖπçï1ÖâM—Ö—î°Õ—Ö—î§Ï(ÄÅÕ°Ω›QΩÖÕ–†âΩµ¡…ÑÅô•ç—•ç•ÑÅÖù…ïùÖëÑËÄƒ¿∏¿¿¿ÅµΩπïëÖÃà§Ï(ÄÅ…ïπëï…ëµ•∏†§Ï)Ù()ô’πç—•Ω∏ÅÕ•µ’±Ö—ï•πÖπçï1Öâ•ô–†§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—A…Ωô•±î¸π•Õ}Öëµ•∏§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÕ—Ö—îÄÙÅùï—•πÖπçï1ÖâM—Ö—î†§Ï(ÄÅ•òÄ°Õ—Ö—îπ’Õï…Ω•πÃÄÄ‘¿¿¿§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†âA…•µï…ºÅÕ•µ’≥ÑÅ’πÑÅçΩµ¡…ÑÅëîÅµΩπïëÖÃà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅÕ—Ö—îπ’Õï…Ω•πÃÄ¥ÙÄ‘¿¿¿Ï(ÄÅÕ—Ö—îπç…ïÖ—Ω…Aïπë•πúÄ¨ÙÄÃ‘¿¿Ï(ÄÅÕ—Ö—îπ±•ŸïMç…Ω±±…ΩÕÃÄ¨ÙÄƒ‘¿¿Ï(ÄÅÖëë•πÖπçï1Öâ5ΩŸïµïπ–°Õ—Ö—î∞ÄâI1<ÅM%5U1<à∞ÄâIïùÖ±ºÅëîÄ‘∏¿¿¿ÅµΩπïëÖÃÉ
‹Ä‹¿îÅç…ïÖëΩ»ÄºÄÃ¿îÅ1•ŸïMç…Ω±∞à∞Ä‘¿¿¿∞ÄâùΩ±êà§Ï(ÄÅÕÖŸï•πÖπçï1ÖâM—Ö—î°Õ—Ö—î§Ï(ÄÅÕ°Ω›QΩÖÕ–†âIïùÖ±ºÅô•ç—•ç•ºÅïπŸ•ÖëºËÄêÃ∏‘¿¿Å≈’ïëÖ…Ω∏Å¡ïπë•ïπ—ïÃÅ¡Ö…ÑÅï∞Åç…ïÖëΩ»à§Ï(ÄÅ…ïπëï…ëµ•∏†§Ï)Ù()ô’πç—•Ω∏ÅÕ•µ’±Ö—ï•πÖπçï1ÖâIï±ïÖÕî†§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—A…Ωô•±î¸π•Õ}Öëµ•∏§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÕ—Ö—îÄÙÅùï—•πÖπçï1ÖâM—Ö—î†§Ï(ÄÅ•òÄ°Õ—Ö—îπç…ïÖ—Ω…Aïπë•πúÄÙÄ¿§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅ°Ö‰ÅÕÖ±ëºÅ¡ïπë•ïπ—îÅ¡Ö…ÑÅ±•âï…Ö»à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅçΩπÕ–Å…ï±ïÖÕïêÄÙÅÕ—Ö—îπç…ïÖ—Ω…Aïπë•πúÏ(ÄÅÕ—Ö—îπç…ïÖ—Ω…Aïπë•πúÄÙÄ¿Ï(ÄÅÕ—Ö—îπç…ïÖ—Ω…ŸÖ•±Öâ±îÄ¨ÙÅ…ï±ïÖÕïêÏ(ÄÅÖëë•πÖπçï1Öâ5ΩŸïµïπ–°Õ—Ö—î∞ÄâM1<Å1%	I<à∞ÄâQï…µ•ªÃÅï∞Å¡±ÖÈºÅô•ç—•ç•ºÅëîÅÕïù’…•ëÖêà∞Å…ï±ïÖÕïê∞Äââ±’îà§Ï(ÄÅÕÖŸï•πÖπçï1ÖâM—Ö—î°Õ—Ö—î§Ï(ÄÅÕ°Ω›QΩÖÕ–†âMÖ±ëºÅô•ç—•ç•ºÅë•Õ¡Ωπ•â±îÅ¡Ö…ÑÅï∞Åç…ïÖëΩ»à§Ï(ÄÅ…ïπëï…ëµ•∏†§Ï)Ù()ô’πç—•Ω∏Å…ïÕï—•πÖπçï1Öà†§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—A…Ωô•±î¸π•Õ}Öëµ•∏§Å…ï—’…∏Ï(ÄÅ•òÄ†ÖçΩπô•…¥†ã
˝Iï•π•ç•Ö»ÅçΩµ¡±ï—Öµïπ—îÅï∞Å±ÖâΩ…Ö—Ω…•ºÅô•πÖπç•ï…º¸à§§Å…ï—’…∏Ï(ÄÅ±ΩçÖ±M—Ω…Öùîπ…ïµΩŸï%—ï¥°1M}%99}1	}-d§Ï(ÄÅÕ°Ω›QΩÖÕ–†â1ÖâΩ…Ö—Ω…•ºÅô•πÖπç•ï…ºÅ…ï•π•ç•Öëºà§Ï(ÄÅ…ïπëï…ëµ•∏†§Ï)Ù()ô’πç—•Ω∏Å…ïπëï…ëµ•π•πÖπç•Ö±1Öà†§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—A…Ωô•±î¸π•Õ}Öëµ•∏ÅÒÅ•Õ1•ŸïMç…Ω±∞›¡¿†§§Å…ï—’…∏ÄààÏ(ÄÅçΩπÕ–ÅÕ—Ö—îÄÙÅùï—•πÖπçï1ÖâM—Ö—î†§Ï(ÄÅçΩπÕ–ÅµΩπï‰ÄÙÅŸÖ±’îÄÙ¯Å9’µâï»°ŸÖ±’îÅÒÄ¿§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà§Ï(ÄÅ…ï—’…∏ÅÄ(ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë»—¡‡Ïà˚¬~û®Åïπ—…ºÅ•πÖπç•ï…ºÅ·¡ï…•µïπ—Ö∞Ω†Ã¯(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êÅ±Ãµô•πÖπçîµ±ÖààÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏Ã–§ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿‹§±…ùâÑ†‘‰∞ƒÃ¿∞»–ÿ∞∏¿–‘§§Ïà¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌÖ±•ù∏µ•—ïµÃÈô±ï‡µÕ—Ö…–ÌùÖ¿Ëƒ…¡‡Ìô±ï‡µ›…Ö¿È›…Ö¿ÌµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µ›ï•ù°–Ë‰¿¿ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ì±ï——ï»µÕ¡Öç•πúË∏¿…ï¥Ïà˘1	=IQ=I%<ÅAI%Y<É
‹ÅM=1<Å5%8Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ì±•πîµ°ï•ù°–Ëƒ∏‘ÌµÖ…ù•∏µ—Ω¿Ë’¡‡ÌµÖ‡µ›•ë—†Ëÿ‡¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÅM•Õ—ïµÑÅï·¡ï…•µïπ—Ö∞∏Å1ΩÃÅÕÖ±ëΩÃÅÕΩ∏Åô•ç—•ç•ΩÃ∞ÅπºÅ¡ΩÕïï∏ÅŸÖ±Ω»ÅµΩπï—Ö…•ºÅ‰ÅπºÅ¡’ïëï∏ÅçÖπ©ïÖ…ÕîÅ¡Ω»Åë•πï…º∏(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒÕ¡Ö∏ÅÕ—Â±îÙâ¡Öëë•πúË’¡‡ÄÂ¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏Ã»§ÌâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÌôΩπ–µÕ•ÈîËÂ¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿Ïà˘5=<ÅAIU	ΩÕ¡Ö∏¯(ÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–°Ö’—ºµô•–±µ•πµÖ‡†ƒÃ’¡‡∞≈ô»§§ÌùÖ¿ËÂ¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏Ë¿Ì¡Öëë•πúËƒ…¡‡Ïà¯Òë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘Ωâ…ÖëºÅô•ç—•ç•ºΩë•ÿ¯ÒÕ—…ΩπúÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ·¡‡Ïà¯êëÌµΩπï‰°Õ—Ö—îπçΩ±±ïç—ïë…Ã•ÙΩÕ—…Ωπú¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏Ë¿Ì¡Öëë•πúËƒ…¡‡Ïà¯Òë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘5ΩπïëÖÃÅëï∞Å’Õ’Ö…•ºΩë•ÿ¯ÒÕ—…ΩπúÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ïà¯ëÌµΩπï‰°Õ—Ö—îπ’Õï…Ω•πÃ•ÙΩÕ—…Ωπú¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏Ë¿Ì¡Öëë•πúËƒ…¡‡Ïà¯Òë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘…ïÖëΩ»Å¡ïπë•ïπ—îΩë•ÿ¯ÒÕ—…ΩπúÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ·¡‡ÌçΩ±Ω»Ëçôââò»–Ïà¯êëÌµΩπï‰°Õ—Ö—îπç…ïÖ—Ω…Aïπë•πú•ÙΩÕ—…Ωπú¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏Ë¿Ì¡Öëë•πúËƒ…¡‡Ïà¯Òë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘…ïÖëΩ»Åë•Õ¡Ωπ•â±îΩë•ÿ¯ÒÕ—…ΩπúÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ·¡‡ÌçΩ±Ω»Ëåÿ¡Ñ’ôÑÏà¯êëÌµΩπï‰°Õ—Ö—îπç…ïÖ—Ω…ŸÖ•±Öâ±î•ÙΩÕ—…Ωπú¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏Ë¿Ì¡Öëë•πúËƒ…¡‡Ïà¯Òë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘1•ŸïMç…Ω±∞Åâ…’—ºΩë•ÿ¯ÒÕ—…ΩπúÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§Ïà¯êëÌµΩπï‰°Õ—Ö—îπ±•ŸïMç…Ω±±…ΩÕÃ•ÙΩÕ—…Ωπú¯Ωë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌùÖ¿Ë·¡‡Ìô±ï‡µ›…Ö¿È›…Ö¿ÌµÖ…ù•∏µâΩ——Ω¥Ëƒ’¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨ÙâÕ•µ’±Ö—ï•πÖπçï1ÖâA’…ç°ÖÕî†§à¯ƒÉ
‹ÅM•µ’±Ö»ÅçΩµ¡…ÑÄêƒ¿∏¿¿¿Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâÕ•µ’±Ö—ï•πÖπçï1Öâ•ô–†§à¯»É
‹ÅπŸ•Ö»Å…ïùÖ±ºÄ‘∏¿¿¿Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâÕ•µ’±Ö—ï•πÖπçï1ÖâIï±ïÖÕî†§à¯ÃÉ
‹Å1•âï…Ö»ÅÕÖ±ëºÅ¡ïπë•ïπ—îΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÌµÖ…ù•∏µ±ïô–ÈÖ’—ºÏàÅΩπç±•ç¨Ùâ…ïÕï—•πÖπçï1Öà†§à˘Iï•π•ç•Ö»Ωâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌôΩπ–µ›ï•ù°–Ë‡‘¿ÌµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà˚i±—•µΩÃÅµΩŸ•µ•ïπ—ΩÃÅô•ç—•ç•ΩÃΩë•ÿ¯(ÄÄÄÄÄÄëÌÕ—Ö—îπµΩŸïµïπ—Ãπ±ïπù—†Ä¸ÅÕ—Ö—îπµΩŸïµïπ—ÃπµÖ¿°¥ÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ïëùï»µ…Ω‹àÅÕ—Â±îÙâùÖ¿Ëƒ¡¡‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏ÅÕ—Â±îÙâµ•∏µ›•ë—†Ë¿Ïà¯ÒÕ—…ΩπúÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡Ïà¯ëÌïÕçÖ¡ï!—µ∞°¥π—Â¡î•ÙΩÕ—…Ωπú¯Òâ»¯ÒÕ¡Ö∏ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà¯ëÌïÕçÖ¡ï!—µ∞°¥πëï—Ö•∞•ÙÉ
‹ÄëÌπï‹ÅÖ—î°¥πç…ïÖ—ïë–§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙΩÕ¡Ö∏¯ΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÒÕ—…ΩπúÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâçΩ±Ω»ËëÌ¥π—ΩπîÄÙÙÙÄâù…ïï∏àÄ¸ÄâŸÖ»†¥µù…ïï∏§àÄËÅ¥π—ΩπîÄÙÙÙÄâùΩ±êàÄ¸ÄâŸÖ»†¥µùΩ±ê§àÄËÅ¥π—ΩπîÄÙÙÙÄââ±’îàÄ¸Äàåÿ¡Ñ’ôÑàÄËÄâŸÖ»†¥µ—ï·–§âÙÏà¯ëÌµΩπï‰°¥πÖµΩ’π–•ÙΩÕ—…Ωπú¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÅÄ§π©Ω•∏†àà§ÄËÅÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ì¡Öëë•πúËƒ¡¡‡Ä¿Ïà˘QΩëÖ€µÑÅπºÅ…ïÖ±•ÈÖÕ—îÅµΩŸ•µ•ïπ—ΩÃÅëîÅ¡…’ïâÑ∏Ωë•ÿ˘ÅÙ(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù(()ÖÕÂπåÅô’πç—•Ω∏Å…ïπëï…ëµ•∏†§ÅÏ(ÄÅçΩπÕ–ÅµÖ•∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÖ¡¡Y•ï‹à§Ï(ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄÒ¿˘Ö…ùÖπëºÅ¡Öπï∞ÅëîÅëµ•∏∏∏∏Ω¿˘ÄÏ((ÄÄººÅÕ—ÖÃÅçΩπÕ’±—ÖÃÅπºÅëï¡ïπëï∏Åïπ—…îÅœ¥∏Å1ÖÃÅï©ïç’—ÖµΩÃÅ©’π—ÖÃÅ¡Ö…ÑÅçΩπÕï…ŸÖ»(ÄÄººÅ—ΩëÑÅ±ÑÅ•πôΩ…µÖçßÕ∏Åëï∞Å¡Öπï∞ÅÕ•∏ÅïÕ¡ï…Ö»ÅçÖëÑÅ…ïÕ¡’ïÕ—ÑÅï∏ÅçÖëïπÑ∏(ÄÅçΩπÕ–Ål(ÄÄÄÅ…ïëïµ¡—•ΩπÕIïÕ’±–∞(ÄÄÄÅ¡…Ωô•±ïÕ=Ÿï…Ÿ•ï›IïÕ’±–∞(ÄÄÄÅ¡ïπë•πùUÕï…ÕIïÕ’±–∞(ÄÄÄÅÕ’âÕç…•¡—•ΩπÕIïÕ’±–∞(ÄÄÄÅ¡±ÖπÃ∞(ÄÄÄÅ…ï¡Ω…—ÕIïÕ’±–∞(ÄÄÄÅÕ—Ö—ÕIïÕ’±–∞(ÄÄÄÅç…ïÖ—Ω…¡¡±•çÖ—•ΩπÕIïÕ’±–∞(ÄÄÄÅÕïç’…•—ÂIï¡Ω…—ÕIïÕ’±–∞(ÄÄÄÅÖ’—ΩYï…•ô•çÖ—•ΩπIïÕ’±–(ÄÅtÄÙÅÖ›Ö•–ÅA…Ωµ•ÕîπÖ±∞°l(ÄÄÄÅÕàπô…Ω¥†â…ïëïµ¡—•ΩπÃà§(ÄÄÄÄÄÄπÕï±ïç–†à®∞Å¡…Ωô•±ïÃÖ…ïëïµ¡—•ΩπÕ}’Õï…}•ë}ô≠ï‰°’Õï…πÖµî§à§(ÄÄÄÄÄÄπΩ…ëï»†âç…ïÖ—ïë}Ö–à∞ÅÏÅÖÕçïπë•πúÈ—…’îÅÙ§∞(ÄÄÄÅÕàπ…¡å†âÖëµ•π}ùï—}¡…Ωô•±ïÕ}ΩŸï…Ÿ•ï‹à§∞(ÄÄÄÅÕàπ…¡å†âÖëµ•π}ùï—}¡ïπë•πù}’Õï…Ãà§∞(ÄÄÄÅÕàπô…Ω¥†âÕ’âÕç…•¡—•Ωπ}…ï≈’ïÕ—Ãà§(ÄÄÄÄÄÄπÕï±ïç–†à®∞Å¡…Ωô•±ïÃÖÕ’âÕç…•¡—•Ωπ}…ï≈’ïÕ—Õ}’Õï…}•ë}ô≠ï‰°’Õï…πÖµî§à§(ÄÄÄÄÄÄπΩ…ëï»†âç…ïÖ—ïë}Ö–à∞ÅÏÅÖÕçïπë•πúÈ—…’îÅÙ§∞(ÄÄÄÅ±ΩÖëA±ÖπÃ†§∞(ÄÄÄÅ±ΩÖëëµ•πAïπë•πùY•ëïΩIï¡Ω…—Ã†§∞(ÄÄÄÅÕàπ…¡å†âÖëµ•π}ùï—}Õ—Ö—Ãà§∞(ÄÄÄÅÕàπ…¡å†âÖëµ•π}ùï—}ç…ïÖ—Ω…}Ö¡¡±•çÖ—•ΩπÃà§∞(ÄÄÄÅÕàπ…¡å†âÖëµ•π}ùï—}Õïç’…•—Â}•πç•ëïπ—}…ï¡Ω…—Ãà§∞(ÄÄÄÅÕàπ…¡å†âÖëµ•π}ùï—}Ö’—Ω}Ÿï…•ô•çÖ—•Ωπ}±Ωúà∞ÅÏÅ¡}±•µ•–ËÃ¿ÅÙ§(ÄÅt§Ï((ÄÅçΩπÕ–ÅÏÅëÖ—ÑÈ…ïëïµ¡—•ΩπÃ∞Åï……Ω»ÅÙÄÙÅ…ïëïµ¡—•ΩπÕIïÕ’±–Ï((ÄÅ•òÄ°ï……Ω»§ÅÏÅµÖ•∏π•ππï…!Q50ÄÙÅÄÒ¿Åç±ÖÕÃÙâï……Ω»µµÕúà˘……Ω»ËÄëÌïÕçÖ¡ï!—µ∞°ï……Ω»πµïÕÕÖùîÅÒÄâ……Ω»ÅëïÕçΩπΩç•ëºà•ÙΩ¿˘ÄÏÅ…ï—’…∏ÏÅÙ((ÄÄººÅY•Õ—ÑÅçΩµ¡±ï—ÑÅÕΩ±ºÅ¡Ö…ÑÅÖëµ•πÃËÅ%@Å‰ÅïÕ—ÖëºÅëîÅâ±Ω≈’ïºÅëîÅçÖëÑÅç’ïπ—Ñ(ÄÅçΩπÕ–Å¡…Ωô•±ïÕ=Ÿï…Ÿ•ï‹ÄÙÅ¡…Ωô•±ïÕ=Ÿï…Ÿ•ï›IïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅçΩπÕ–Å¡…Ωô•±ï	Â%êÄÙÅÌÙÏ(ÄÄ°¡…Ωô•±ïÕ=Ÿï…Ÿ•ï‹ÅÒÅmt§πôΩ…Öç†°¿ÄÙ¯ÅÏÅ¡…Ωô•±ï	Â%ëm¿π•ëtÄÙÅ¿ÏÅÙ§Ï((ÄÅçΩπÕ–Å•¡Ω’π—ÃÄÙÅÌÙÏ(ÄÄ°¡…Ωô•±ïÕ=Ÿï…Ÿ•ï‹ÅÒÅmt§πôΩ…Öç†°¿ÄÙ¯ÅÏ(ÄÄÄÅ•òÄ°¿πÕ•ùπ’¡}•¿§Å•¡Ω’π—Õm¿πÕ•ùπ’¡}•¡tÄÙÄ°•¡Ω’π—Õm¿πÕ•ùπ’¡}•¡tÅÒÄ¿§Ä¨ÄƒÏ(ÄÅÙ§Ï((ÄÅçΩπÕ–Å¡ïπë•πúÄÙÄ°…ïëïµ¡—•ΩπÃÅÒÅmt§πô•±—ï»°»ÄÙ¯Å»πÕ—Ö—’ÃÄÙÙÙÄâ¡ïπë•πúà§Ï(ÄÅçΩπÕ–Å…ïÕΩ±ŸïêÄÙÄ°…ïëïµ¡—•ΩπÃÅÒÅmt§πô•±—ï»°»ÄÙ¯Å»πÕ—Ö—’ÃÄÑÙÙÄâ¡ïπë•πúà§πÕ±•çî†¿∞Äƒ‘§Ï((ÄÅçΩπÕ–Å¡ïπë•πùUÕï…Õ’±∞ÄÙÅ¡ïπë•πùUÕï…ÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅ±ï–Åâ±Ωç≠ïëUÕï…ÃÄÙÄ°¡ïπë•πùUÕï…Õ’±∞ÄòòÅ¡ïπë•πùUÕï…Õ’±∞π±ïπù—†§Ä¸Å¡ïπë•πùUÕï…Õ’±∞ÄËÄ°¡…Ωô•±ïÕ=Ÿï…Ÿ•ï‹ÅÒÅmt§πô•±—ï»°¿ÄÙ¯Å¿π•Õ}â±Ωç≠ïê§Ï((ÄÅçΩπÕ–ÅÕ’âIï≈’ïÕ—ÃÄÙÅÕ’âÕç…•¡—•ΩπÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅçΩπÕ–Å¡ïπë•πùM’âÃÄÙÄ°Õ’âIï≈’ïÕ—ÃÅÒÅmt§πô•±—ï»°ÃÄÙ¯ÅÃπÕ—Ö—’ÃÄÙÙÙÄâ¡ïπë•πúà§Ï((ÄÅçΩπÕ–Å…ï¡Ω…—ÃÄÙÅ…ï¡Ω…—ÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅçΩπÕ–Å…ï¡Ω…—Õ……Ω»ÄÙÅ…ï¡Ω…—ÕIïÕ’±–¸πï……Ω»ÅÒÅπ’±∞Ï(ÄÅçΩπÕ–ÅÕ—Ö—ÃÄÙÅÕ—Ö—ÕIïÕ’±–¸πëÖ—ÑÏ(ÄÅçΩπÕ–Åç…ïÖ—Ω…¡¡±•çÖ—•ΩπÃÄÙÅç…ïÖ—Ω…¡¡±•çÖ—•ΩπÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅçΩπÕ–Å¡ïπë•πù…ïÖ—Ω…¡¡±•çÖ—•ΩπÃÄÙÄ°ç…ïÖ—Ω…¡¡±•çÖ—•ΩπÃÅÒÅmt§πô•±—ï»°ÑÄÙ¯ÅÑπÕ—Ö—’ÃÄÙÙÙÄâ¡ïπë•πúà§Ï(ÄÅçΩπÕ–ÅÖ’—ΩYï…•ô•çÖ—•Ωπ1ΩúÄÙÅÖ’—ΩYï…•ô•çÖ—•ΩπIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ((ÄÄººÅIï¡Ω…—ïÃÅëîÅÕïù’…•ëÖêÅÕï¡Ö…ÖëΩÃÅëï∞ÅÕ•Õ—ïµÑÅëîÅ…ï¡Ω…—ïÃÅëîÅŸ•ëïΩÃ∏(ÄÅçΩπÕ–ÅÕïç’…•—ÂIï¡Ω…—ÃÄÙÅÕïç’…•—ÂIï¡Ω…—ÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅçΩπÕ–Å¡ïπë•πùMïç’…•—ÂIï¡Ω…—ÃÄÙÄ°Õïç’…•—ÂIï¡Ω…—ÃÅÒÅmt§πô•±—ï»°»ÄÙ¯(ÄÄÄÅlâ¡ïπë•πúà∞Äâ…ïŸ•ï›•πúà∞Äâ…ïçΩŸï…Â}Ö’—°Ω…•Èïêâtπ•πç±’ëïÃ°»πÕ—Ö—’Ã§(ÄÄ§Ï((ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒ†ƒÅç±ÖÕÃÙâ¡Öùîµ—•—±îà˚¬~nÄÅAÖπï∞ÅëîÅëµ•∏Ω†ƒ¯((ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ·¡‡ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏Ã»§ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÃ’ëïú±…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿‰§±…ùâÑ†‘‰∞ƒÃ¿∞»–ÿ∞∏¿‘‘§§ÌΩŸï…ô±Ω‹È°•ëëï∏Ïà¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌùÖ¿Ëƒ—¡‡Ìô±ï‡µ›…Ö¿È›…Ö¿Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâµ•∏µ›•ë—†Ë¿Ìô±ï‡ËƒÏà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌùÖ¿Ë·¡‡Ìô±ï‡µ›…Ö¿È›…Ö¿ÌµÖ…ù•∏µâΩ——Ω¥Ë›¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕ—…ΩπúÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ïà¯ëÌ•Õ1•ŸïMç…Ω±∞›¡¿†§Ä¸Äãä^ Å	•ïπŸïπ•ëÑÅΩô•ç•Ö∞Å1•ŸïMç…Ω±∞Ä‹àÄËÄãär†ÅA…ïÕïπ—ÖçßÕ∏ÅI=ÅQ<ÄÿâÙΩÕ—…Ωπú¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏ÅÕ—Â±îÙâ¡Öëë•πúËÕ¡‡Ä›¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏Ã§ÌâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÌôΩπ–µÕ•ÈîËÂ¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿Ì±ï——ï»µÕ¡Öç•πúË∏¿·ï¥Ïà¯ëÌ•Õ1•ŸïMç…Ω±∞›¡¿†§Ä¸Äà‹∏¿∏¡ÿàÄËÄà‘∏‰∏¿âÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîËƒ…¡‡Ì±•πîµ°ï•ù°–Ëƒ∏‘Ïà¯ëÌ•Õ1•ŸïMç…Ω±∞›¡¿†§Ä¸ÄâIï¡…Ωë’è¥Åπ’ïŸÖµïπ—îÅ±ÑÅïπ—…ÖëÑÅŸ•Õ’Ö∞ÅëîÅïÕ—ÑÅ¡…•µï…ÑÅï—Ö¡ÑÅ¡Ö…ÑÅπë…Ω•ê∏àÄËÄâYΩ±€§ÅÑÅ…ï¡…Ωë’ç•»Å±ÑÅ¡…ïÕïπ—ÖçßÕ∏ÅΩô•ç•Ö∞Å≈’îÅ…ïç•âï∏Å±ΩÃÅ’Õ’Ö…•ΩÃ∏âÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅ—Â¡îÙââ’——Ω∏àÅΩπç±•ç¨ÙàëÌ•Õ1•ŸïMç…Ω±∞›¡¿†§Ä¸Äâ…ï¡±ÖÂ1•ŸïMç…Ω±∞›A’±Õî†§àÄËÄâ…ï¡±ÖÂ1•ŸïMç…Ω±±IΩÖëQºŸ%π—…º†§âÙà˚äZÿÅYΩ±Ÿï»ÅÑÅŸï…±ÑΩâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄëÌÕ—Ö—ÃÄòòÄÖÕ—Ö—Ãπï……Ω»Ä¸ÅÄ(ÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÏÅù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–°Ö’—ºµô•–±µ•πµÖ‡†ƒ–¡¡‡∞≈ô»§§ÏÅùÖ¿Ëƒ¡¡‡ÏÅµÖ…ù•∏µâΩ——Ω¥Ë»—¡‡Ïà¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êà¯Òë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘UÕ’Ö…•ΩÃÅ—Ω—Ö±ïÃΩë•ÿ¯Òë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»¡¡‡Ïà¯ëÌÕ—Ö—Ãπ—Ω—Ö±}’Õï…ÕÙΩë•ÿ¯Ωë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êà¯Òë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘Yï…•ô•çÖëΩÃΩë•ÿ¯Òë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§Ïà¯ëÌÕ—Ö—ÃπŸï…•ô•ïë}’Õï…ÕÙΩë•ÿ¯Ωë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êà¯Òë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘Aïπë•ïπ—ïÃΩë•ÿ¯Òë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ïà¯ëÌÕ—Ö—Ãπ¡ïπë•πù}’Õï…ÕÙΩë•ÿ¯Ωë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êà¯Òë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘ç—•ŸΩÃÄ†‹ÅìµÖÃ§Ωë•ÿ¯Òë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»¡¡‡Ïà¯ëÌÕ—Ö—ÃπÖç—•Ÿï}±ÖÕ—|›ëÙΩë•ÿ¯Ωë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êà¯Òë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘Y•ëïΩÃÅÕ’â•ëΩÃΩë•ÿ¯Òë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»¡¡‡Ïà¯ëÌÕ—Ö—Ãπ—Ω—Ö±}Ÿ•ëïΩÕÙΩë•ÿ¯Ωë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êà¯Òë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘A’π—ΩÃÅ—Ω—Ö±ïÃÄ°ëï’ëÑ§Ωë•ÿ¯Òë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ…ïê§Ïà¯êëÌ9’µâï»°Õ—Ö—Ãπ—Ω—Ö±}¡Ω•π—Õ}âÖ±Öπçî§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙΩë•ÿ¯Ωë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êà¯Òë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘eÑÅ¡ÖùÖëºΩë•ÿ¯Òë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»¡¡‡Ïà¯êëÌ9’µâï»°Õ—Ö—Ãπ—Ω—Ö±}¡Ö•ë}Ö…Ã§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙΩë•ÿ¯Ωë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êà¯Òë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘AΩ»Å¡ÖùÖ»Ä°¡ïπë•ïπ—î§Ωë•ÿ¯Òë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ïà¯êëÌ9’µâï»°Õ—Ö—Ãπ—Ω—Ö±}¡ïπë•πù}Ö…Ã§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙΩë•ÿ¯Ωë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÒ¿Åç±ÖÕÃÙâ¡ÖùîµÕ’àà¯ëÌ¡ïπë•πúπ±ïπù—°ÙÅçÖπ©îëÌ¡ïπë•πúπ±ïπù—†ÄÙÙÙÄƒÄ¸ÄààÄËÄâÃâÙÉ
‹ÄëÌ¡ïπë•πùM’âÃπ±ïπù—°ÙÅ¡ÖùºëÌ¡ïπë•πùM’âÃπ±ïπù—†ÄÙÙÙÄƒÄ¸ÄààÄËÄâÃâÙÅëîÅ¡±Ö∏É
‹ÄëÌ¡ïπë•πù…ïÖ—Ω…¡¡±•çÖ—•ΩπÃπ±ïπù—°ÙÅÕΩ±•ç•—’êëÌ¡ïπë•πù…ïÖ—Ω…¡¡±•çÖ—•ΩπÃπ±ïπù—†ÄÙÙÙÄƒÄ¸ÄààÄËÄâïÃâÙÅëîÅç…ïÖëΩ»É
‹ÄëÌ¡ïπë•πùMïç’…•—ÂIï¡Ω…—Ãπ±ïπù—°ÙÅçÖÕºëÌ¡ïπë•πùMïç’…•—ÂIï¡Ω…—Ãπ±ïπù—†ÄÙÙÙÄƒÄ¸ÄààÄËÄâÃâÙÅëîÅÕïù’…•ëÖêΩ¿¯((ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë»—¡‡Ïà˚¬~:∞ÅMΩ±•ç•—’ëïÃÅëîÅç…ïÖëΩ…ïÃÄ†ëÌ¡ïπë•πù…ïÖ—Ω…¡¡±•çÖ—•ΩπÃπ±ïπù—°Ù§Ω†Ã¯(ÄÄÄÄëÌ¡ïπë•πù…ïÖ—Ω…¡¡±•çÖ—•ΩπÃπ±ïπù—†Ä¸Å¡ïπë•πù…ïÖ—Ω…¡¡±•çÖ—•ΩπÃπµÖ¿°ÑÄÙ¯ÅÄ(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ…¡‡ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏»‡§Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌùÖ¿Ëƒ…¡‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ìô±ï‡µ›…Ö¿È›…Ö¿Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µ›ï•ù°–Ë‡¿¿Ïà˘ ëÌïÕçÖ¡ï!—µ∞°Ñπ’Õï…πÖµî•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë’¡‡Ì±•πîµ°ï•ù°–Ëƒ∏–‘Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌÑπŸ•ëïΩ}çΩ’π—ÙÅŸ•ëïΩÃÉ
‹ÄëÌÑπÖççΩ’π—}ëÖÂÕÙÅìµÖÃÅëîÅÖπ—•üÒïëÖêÉ
‹ÅÕΩ±•ç•”ÃÄëÌπï‹ÅÖ—î°Ñπ…ï≈’ïÕ—ïë}Ö–§π—Ω1ΩçÖ±ïÖ—ïM—…•πú†âïÃµHà•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌùÖ¿Ë›¡‡Ìô±ï‡µ›…Ö¿È›…Ö¿Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâŸ•ï›A’â±•çA…Ωô•±î†úëÌïÕçÖ¡ï!—µ∞°Ñπ’Õï…πÖµî•Ùú§à˘Yï»Å¡ï…ô•∞Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨Ùâ°Öπë±ï…ïÖ—Ω…¡¡±•çÖ—•Ω∏†úëÌÑπÖ¡¡±•çÖ—•Ωπ}•ëÙú∞ùÖ¡¡…ΩŸîú§à˚ärLÅ¡…ΩâÖ»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÏàÅΩπç±•ç¨Ùâ°Öπë±ï…ïÖ—Ω…¡¡±•çÖ—•Ω∏†úëÌÑπÖ¡¡±•çÖ—•Ωπ}•ëÙú∞ù…ï©ïç–ú§à˚ärTÅIïç°ÖÈÖ»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÅÄ§π©Ω•∏†àà§ÄËÅÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘9ºÅ°Ö‰ÅÕΩ±•ç•—’ëïÃÅ¡ïπë•ïπ—ïÃ∏Ωë•ÿ˘ÅÙ((ÄÄÄÄëÌ¡ïπë•πùMïç’…•—ÂIï¡Ω…—Ãπ±ïπù—†Ä¸ÅÄ(ÄÄÄÄÄÄÒ†Ã˚¬~j†ÅIï¡Ω…—ïÃÅëîÅÕïù’…•ëÖêΩ†Ã¯(ÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîËƒ…¡‡ÌµÖ…ù•∏Ë¥—¡‡Ä¿Äƒ…¡‡Ïà¯(ÄÄÄÄÄÄÄÅÖÕΩÃÅ…ï±Öç•ΩπÖëΩÃÅçΩ∏ÅÖççïÕº∞ÅçΩπ—…ÖÕó≈ÑÅºÅÖç—•Ÿ•ëÖêÅÕΩÕ¡ïç°ΩÕÑ∏(ÄÄÄÄÄÄΩ¿¯((ÄÄÄÄÄÄëÌ¡ïπë•πùMïç’…•—ÂIï¡Ω…—ÃπµÖ¿°»ÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÅµÖ…ù•∏µâΩ——Ω¥Ëƒ…¡‡Ï(ÄÄÄÄÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»ËëÌ»πÕ—Ö—’ÃÄÙÙÙÄâ¡ïπë•πúàÄ¸Äâ…ùâÑ†»–‡∞ƒƒÃ∞ƒƒÃ∞∏Ã¿§àÄËÄâ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏»–§âÙÏ(ÄÄÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÃ’ëïú±…ùâÑ†»–‡∞ƒƒÃ∞ƒƒÃ∞∏¿Ã‘§±…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿ƒ»§§Ï(ÄÄÄÄÄÄÄÄà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌÖ±•ù∏µ•—ïµÃÈô±ï‡µÕ—Ö…–ÌùÖ¿Ëƒ…¡‡Ìô±ï‡µ›…Ö¿È›…Ö¿Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâµ•∏µ›•ë—†Ë¿Ìô±ï‡ËƒÏà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌùÖ¿Ë·¡‡Ìô±ï‡µ›…Ö¿È›…Ö¿ÌµÖ…ù•∏µâΩ——Ω¥Ë’¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕ—…ΩπúÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâçΩ±Ω»Ëçôà‹ƒ‡‘Ïà¯ëÌïÕçÖ¡ï!—µ∞°»πçÖÕï}çΩëîÅÒÄâM%8µM%<à•ÙΩÕ—…Ωπú¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏ÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅôΩπ–µÕ•ÈîËÂ¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅôΩπ–µ›ï•ù°–Ë‰¿¿Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅ¡Öëë•πúËÕ¡‡Ä›¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅçΩ±Ω»ËëÌ»πÕ—Ö—’ÃÄÙÙÙÄâ¡ïπë•πúàÄ¸ÄàçôçÑ’Ñ‘àÄËÄâŸÖ»†¥µùΩ±ê§âÙÏ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄà¯ëÌïÕçÖ¡ï!—µ∞°ùï—ëµ•πMïç’…•—ÂM—Ö—’Õ1Öâï∞°»πÕ—Ö—’Ã§•ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÌôΩπ–µ›ï•ù°–Ë‹¿¿Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌïÕçÖ¡ï!—µ∞°»πïµÖ•∞ÅÒÄâ’ïπ—ÑÅÕ•∏ÅçΩ……ïºà•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë—¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌïÕçÖ¡ï!—µ∞°ùï—ëµ•πMïç’…•—ÂIïÖÕΩπ1Öâï∞°»π…ïÖÕΩ∏§•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅôΩπ–µÕ•ÈîËƒ≈¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅµÖ…ù•∏µ—Ω¿Ë›¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅ±•πîµ°ï•ù°–Ëƒ∏–‘Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅµÖ‡µ›•ë—†Ë‹»¡¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄà¯ëÌïÕçÖ¡ï!—µ∞°»πëï—Ö•±ÃÅÒÄâM•∏ÅëïÕç…•¡çßÕ∏à•ÙΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌ»πç…ïÖ—ïë}Ö–Ä¸Åπï‹ÅÖ—î°»πç…ïÖ—ïë}Ö–§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà§ÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨ÙâΩ¡ïπëµ•πMïç’…•—Â%πç•ëïπ—ï—Ö•∞†úëÌïÕçÖ¡ï!—µ∞°»πçÖÕï}çΩëîÅÒÄàà•Ùú§à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅIïŸ•ÕÖ»ÅçÖÕº(ÄÄÄÄÄÄÄÄÄÄÄÄΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÅÄ§π©Ω•∏†àà•Ù(ÄÄÄÅÄÄËÅÄ(ÄÄÄÄÄÄÒ†Ã˚¬~j†ÅIï¡Ω…—ïÃÅëîÅÕïù’…•ëÖêΩ†Ã¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîËƒ…¡‡Ïà¯(ÄÄÄÄÄÄÄÅ9ºÅ°Ö‰Å…ï¡Ω…—ïÃÅëîÅÕïù’…•ëÖêÅ¡ïπë•ïπ—ïÃ∏ÉärL(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÅÅÙ((ÄÄÄÄÒ†Ã˚¬~j§ÅY•ëïΩÃÅ…ï¡Ω…—ÖëΩÃÄ†ëÌ…ï¡Ω…—Ãπ±ïπù—°Ù§Ω†Ã¯(ÄÄÄÄëÌ…ï¡Ω…—Õ……Ω»Ä¸ÅÄ(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†»–‡∞ƒƒÃ∞ƒƒÃ∞∏»‡§ÌçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÌôΩπ–µÕ•ÈîËƒ…¡‡Ì±•πîµ°ï•ù°–Ëƒ∏‘Ïà¯(ÄÄÄÄÄÄÄÅ9ºÅÕîÅ¡’ë•ï…Ω∏ÅçΩπÕ’±—Ö»Å±ΩÃÅ…ï¡Ω…—ïÃ∏Å©ïç’”ÑÅï∞ÅME0ÅëîÅ…ï¡Ö…ÖçßÕ∏ÅëîÅ…ï¡Ω…—ïÃÅëµ•∏Å‰ÅŸΩ±€§ÅÑÅÖâ…•»Åï∞Å¡Öπï∞∏(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÅÄÄËÅ…ï¡Ω…—ÃÄòòÅ…ï¡Ω…—Ãπ±ïπù—†Ä¸ÅÄ(ÄÄÄÄÄÄëÌ…ï¡Ω…—ÃπµÖ¿°»ÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅ©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÏÅÖ±•ù∏µ•—ïµÃÈô±ï‡µÕ—Ö…–ÏÅô±ï‡µ›…Ö¿È›…Ö¿ÏÅùÖ¿Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µ›ï•ù°–Ëÿ¿¿Ïà¯ëÌïÕçÖ¡ï!—µ∞°»πŸ•ëïΩÃ¸π—•—±îÅÒÄâŸ•ëïºÅï±•µ•πÖëºà•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒ…¡‡Ïà˘Iï¡Ω…—ÖëºÅ¡Ω»Å ëÌïÕçÖ¡ï!—µ∞°»π¡…Ωô•±ïÃ¸π’Õï…πÖµîÅÒÄâ’Õ’Ö…•ºà•ÙÉ
‹ÄëÌπï‹ÅÖ—î°»πç…ïÖ—ïë}Ö–§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿ËŸ¡‡ÏÅôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ïà˘5Ω—•ŸºËÄëÌïÕçÖ¡ï!—µ∞°»π…ïÖÕΩ∏•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌ»πŸ•ëïΩÃ¸πŸ•ëïΩ}’…∞Ä¸Ä°•ÕMÖôïU…∞°»πŸ•ëïΩÃπŸ•ëïΩ}’…∞§Ä¸ÅÄÒÑÅ°…ïòÙàëÌïÕçÖ¡ï!—µ∞°»πŸ•ëïΩÃπŸ•ëïΩ}’…∞•ÙàÅ—Ö…ùï–Ùâ}â±Öπ¨àÅ…ï∞ÙâπΩΩ¡ïπï»àÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘Yï»ÅŸ•ëïºÉäHΩÑ˘ÄÄËÅÄÒÕ¡Ö∏ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ…ïê§Ïà˚äjÉæ‚<Å1•π¨ÅÕΩÕ¡ïç°ΩÕº∞ÅπºÅÕîÅÖâ…îΩÕ¡Ö∏˘Ä§ÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅÕ—Â±îÙââÖç≠ù…Ω’πêÈŸÖ»†¥µ…ïê§ÏÅçΩ±Ω»ËçôôòÏàÅΩπç±•ç¨Ùâ°Öπë±ïï±ï—ïY•ëïº†úëÌ»πŸ•ëïΩ}•ëÙú§à˚¬~^DÅ±•µ•πÖ»ÅŸ•ëïºΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨Ùâ°Öπë±ï•Õµ•ÕÕIï¡Ω…–†úëÌ»π•ëÙú§à˘ïÕçÖ…—Ö»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÅÄ§π©Ω•∏†àà•ıÄÄËÅÄ(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîËƒ…¡‡Ïà¯(ÄÄÄÄÄÄÄÅ9ºÅ°Ö‰ÅŸ•ëïΩÃÅ…ï¡Ω…—ÖëΩÃÅ¡ïπë•ïπ—ïÃ∏ÉärL(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÅÅÙ((ÄÄÄÄëÌ…ïπëï…ëµ•π•πÖπç•Ö±1Öà†•Ù((ÄÄÄÄëÌ¡ïπë•πùM’âÃπ±ïπù—†Ä¸ÅÄ(ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë»—¡‡Ïà˚¬~JÃÅAÖùΩÃÅëîÅÕ’Õç…•¡çßÕ∏ÅÑÅçΩπô•…µÖ»Ω†Ã¯(ÄÄÄÄÄÄëÌ¡ïπë•πùM’âÃπµÖ¿°ÃÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅ©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÏÅÖ±•ù∏µ•—ïµÃÈô±ï‡µÕ—Ö…–ÏÅô±ï‡µ›…Ö¿È›…Ö¿ÏÅùÖ¿Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µ›ï•ù°–Ëÿ¿¿Ïà˘ ëÌïÕçÖ¡ï!—µ∞°Ãπ¡…Ωô•±ïÃ¸π’Õï…πÖµîÅÒÄâ’Õ’Ö…•ºà•ÙÉäHÄëÌ¡±ÖπÃπô•πê°¿ÄÙ¯Å¿π•êÄÙÙÙÅÃπ¡±Öπ}•ê§¸ππÖµîÅÒÅÃπ¡±Öπ}•ëÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒ…¡‡Ïà¯ëÌπï‹ÅÖ—î°Ãπç…ïÖ—ïë}Ö–§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë·¡‡ÏÅôΩπ–µÕ•ÈîËƒÕ¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿ˘5Ωπ—ºËÄÒÕ¡Ö∏Åç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§à¯êëÌÃπÖµΩ’π—}Ö…ÕÙΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿ˘Õë•ùºÅÑÅâ’ÕçÖ»Åï∏Å—‘ÅâÖπçºËÄÒÕ—…ΩπúÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§à¯ëÌïÕçÖ¡ï!—µ∞°Ãπ…ïôï…ïπçî•ÙΩÕ—…Ωπú¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨Ùâ°Öπë±ï¡¡…ΩŸïM’âÕç…•¡—•Ω∏†úëÌÃπ•ëÙú§à˚ärLÅΩπô•…µÖ»Å¡ÖùºΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨Ùâ°Öπë±ïIï©ïç—M’âÕç…•¡—•Ω∏†úëÌÃπ•ëÙú§à˚ärTÅIïç°ÖÈÖ»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÅÄ§π©Ω•∏†àà•ıÄÄËÄàâÙ((ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë»—¡‡Ïà˚¬~J‡ÅÖπ©ïÃÅ¡ïπë•ïπ—ïÃΩ†Ã¯((ÄÄÄÄÒë•ÿÅ•êÙâ¡ïπë•πù1•Õ–à¯(ÄÄÄÄÄÄëÌ¡ïπë•πúπ±ïπù—†Ä¸Å¡ïπë•πúπµÖ¿°»ÄÙ¯ÅÏ(ÄÄÄÄÄÄÄÅçΩπÕ–Å’Õï…%¿ÄÙÅ¡…Ωô•±ï	Â%ëm»π’Õï…}•ët¸πÕ•ùπ’¡}•¿Ï(ÄÄÄÄÄÄÄÅçΩπÕ–ÅÕ°Ö…ïë%¿ÄÙÅ’Õï…%¿ÄòòÅ•¡Ω’π—Õm’Õï…%¡tÄ¯ÄƒÏ(ÄÄÄÄÄÄÄÅ…ï—’…∏ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡ÏÄëÌÕ°Ö…ïë%¿Ä¸ÄââΩ…ëï»µçΩ±Ω»ÈŸÖ»†¥µùΩ±êµë•¥§ÏàÄËÄàâÙà¯(ÄÄÄÄÄÄÄÄÄÄëÌÕ°Ö…ïë%¿Ä¸ÅÄÒë•ÿÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏÅµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà˚äjÉæ‚<ÅÕ—ÑÅç’ïπ—ÑÅçΩµ¡Ö…—îÅ…ïêÄ°›•ô§§ÅçΩ∏ÅΩ—…Ñ°Ã§ÄëÌ•¡Ω’π—Õm’Õï…%¡tÄ¥Ä≈ÙÅç’ïπ—Ñ°Ã§ÉäPÅ…ïŸ•œÑÅÖπ—ïÃÅëîÅÖ¡…ΩâÖ»Ωë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅ©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÏÅÖ±•ù∏µ•—ïµÃÈô±ï‡µÕ—Ö…–ÏÅô±ï‡µ›…Ö¿È›…Ö¿ÏÅùÖ¿Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µ›ï•ù°–Ëÿ¿¿Ïà˘ ëÌïÕçÖ¡ï!—µ∞°»π¡…Ωô•±ïÃ¸π’Õï…πÖµîÅÒÄâ’Õ’Ö…•ºà•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒ…¡‡Ïà¯ëÌπï‹ÅÖ—î°»πç…ïÖ—ïë}Ö–§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë·¡‡ÏÅôΩπ–µÕ•ÈîËƒÕ¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿ˘A’π—ΩÃÅ’ÕÖëΩÃËÄÒÕ¡Ö∏Åç±ÖÕÃÙâµΩπºà¯ëÌ»π¡Ω•π—Õ}’ÕïëÙΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿ˘Ωµ•ÕßÕ∏ËÄÒÕ¡Ö∏Åç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§à¯êëÌ»πçΩµµ•ÕÕ•Ωπ}Ö…ÕÙΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿ˘Å—…ÖπÕôï…•»ËÄÒÕ¡Ö∏Åç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§à¯êëÌ»πÖµΩ’π—}Ö…ÕÙΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿ˘±•ÖÃÅ5@ËÄÒÕ—…ΩπúÅç±ÖÕÃÙâµΩπºà¯ëÌïÕçÖ¡ï!—µ∞°»πµï…çÖëΩ¡ÖùΩ}Ö±•ÖÃ•ÙΩÕ—…Ωπú¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨Ùâ°Öπë±ï¡¡…ΩŸïIïëïµ¡—•Ω∏†úëÌ»π•ëÙú§à˚ärLÅ¡…ΩâÖ»Ä°ÂÑÅ¡Öù◊§§Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨Ùâ°Öπë±ïIï©ïç—Iïëïµ¡—•Ω∏†úëÌ»π•ëÙú§à˚ärTÅIïç°ÖÈÖ»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ˘ÄÏ(ÄÄÄÄÄÅÙ§π©Ω•∏†àà§ÄËÅÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§à˘9ºÅ°Ö‰ÅçÖπ©ïÃÅ¡ïπë•ïπ—ïÃÅ¡Ω»ÅÖ°Ω…Ñ∏É¬~:$Ω¿˘ÅÙ(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄëÌâ±Ωç≠ïëUÕï…ÃÄòòÅâ±Ωç≠ïëUÕï…Ãπ±ïπù—†Ä¸ÅÄ(ÄÄÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿ËÃ…¡‡Ïà˚¬~TÅ’ïπ—ÖÃÅπ’ïŸÖÃÅ¡ïπë•ïπ—ïÃÅëîÅŸï…•ô•çÖ»Ä†ëÌâ±Ωç≠ïëUÕï…Ãπ±ïπù—°Ù§Ω†Ã¯(ÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏÅµÖ…ù•∏µâΩ——Ω¥Ëƒ…¡‡Ïà˘M5IPÅYI%%Q%=8ÅœÕ±ºÅëï©ÑÅÖèÑÅ±ÖÃÅç’ïπ—ÖÃÅ≈’îÅπïçïÕ•—Ö∏Å’πÑÅ…ïŸ•ÕßÕ∏Å°’µÖπÑ∏Ω¿¯(ÄÄÄÄÄÄëÌâ±Ωç≠ïëUÕï…ÃπµÖ¿°‘ÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ïëùï»µ…Ω‹à¯(ÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏˘ ëÌïÕçÖ¡ï!—µ∞°‘π’Õï…πÖµî•ÙÉ
‹ÄÒÕ¡Ö∏Å•êÙâïµÖ•∞µ¡ïπë•πú¥ëÌ‘π•ëÙàÅëÖ—ÑµµÖÕ≠ïêÙâ—…’îà¯ëÌïÕçÖ¡ï!—µ∞°µÖÕ≠µÖ•∞°‘πïµÖ•∞§•ÙΩÕ¡Ö∏¯ÄÒâ’——Ω∏ÅΩπç±•ç¨Ùâ—Ωùù±ïµÖ•±Y•Õ•â•±•—‰†ùïµÖ•∞µ¡ïπë•πú¥ëÌ‘π•ëÙú∞ÄúëÌïÕçÖ¡ï!—µ∞°‘πïµÖ•∞ÅÒÄàà•Ùú§àÅÕ—Â±îÙââÖç≠ù…Ω’πêÈπΩπîÌâΩ…ëï»ÈπΩπîÌç’…ÕΩ»È¡Ω•π—ï»ÌôΩπ–µÕ•ÈîËƒ…¡‡Ïà˚¬~FΩâ’——Ω∏¯É
‹ÄëÌπï‹ÅÖ—î°‘πç…ïÖ—ïë}Ö–§π—Ω1ΩçÖ±ïÖ—ïM—…•πú†âïÃµHà•ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Äƒ…¡‡ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏàÅΩπç±•ç¨Ùâ°Öπë±ïUπâ±Ωç≠UÕï»†úëÌ‘π•ëÙú§à˚ärLÅYï…•ô•çÖ»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÅÄ§π©Ω•∏†àà•ıÄÄËÄàâÙ((ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿ËÃ…¡‡Ïà˚¬~náæ‚<ÅYï…•ô•çÖçßÕ∏ÅÖ’—Ω∑Ö—•çÑΩ†Ã¯(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡Ïà˚i±—•µΩÃÅçΩπ—…Ω±ïÃÅëîÅUÕ’Ö…•ΩÃÅπ’ïŸΩÃ∏Å1ÖÃÅÕΩ±•ç•—’ëïÃÅëîÅ…ïÖëΩ…ïÃÅô’πç•ΩπÖ∏Å¡Ω»ÅÕï¡Ö…Öëº∏Ωë•ÿ¯(ÄÄÄÄÄÄëÌÖ’—ΩYï…•ô•çÖ—•Ωπ1Ωúπ±ïπù—†Ä¸ÅÖ’—ΩYï…•ô•çÖ—•Ωπ1ΩúπÕ±•çî†¿∞ƒ»§πµÖ¿°ïπ—…‰ÄÙ¯ÅÄÒë•ÿÅç±ÖÕÃÙâ±ïëùï»µ…Ω‹àÅÕ—Â±îÙâùÖ¿Ëƒ¡¡‡Ïà¯ÒÕ¡Ö∏˘ ëÌïÕçÖ¡ï!—µ∞°ïπ—…‰π’Õï…πÖµîÅÒÄâ’Õ’Ö…•ºà•ÙÉ
‹ÄëÌïÕçÖ¡ï!—µ∞°ïπ—…‰π…ïÖÕΩ∏ÅÒÄâçΩπ—…Ω∞à•ÙΩÕ¡Ö∏¯ÒÕ¡Ö∏Åç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâçΩ±Ω»ËëÌïπ—…‰πëïç•Õ•Ω∏ÄÙÙÙÄâŸï…•ô•ïêàÄ¸ÄâŸÖ»†¥µù…ïï∏§àÄËÄâŸÖ»†¥µùΩ±ê§âÙÏà¯ëÌïπ—…‰πëïç•Õ•Ω∏ÄÙÙÙÄâŸï…•ô•ïêàÄ¸ÄâYI%%<àÄËÄâIY%M'M8âÙΩÕ¡Ö∏¯Ωë•ÿ˘Ä§π©Ω•∏†àà§ÄËÅÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘QΩëÖ€µÑÅπºÅ°Ö‰ÅŸï…•ô•çÖç•ΩπïÃÅÖ’—Ω∑Ö—•çÖÃÅ…ïù•Õ—…ÖëÖÃ∏Ωë•ÿ˘ÅÙ(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿ËÃ…¡‡Ïà˚¬~:†ÅŸïπ—ΩÃÅŸ•Õ’Ö±ïÃΩ†Ã¯(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌùÖ¿Ëƒ—¡‡Ìô±ï‡µ›…Ö¿È›…Ö¿Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâô±ï‡ËƒÌµ•∏µ›•ë—†Ë»»¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÌôΩπ–µ›ï•ù°–Ë‡¿¿Ïà˘MïÖÕΩπÖ∞Å1•ŸïMç…Ω±∞Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿ËÕ¡‡Ì±•πîµ°ï•ù°–Ëƒ∏‘Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÅ∏Å’—Ω∑Ö—•çº∞Å1•ŸïMç…Ω±∞ÅçÖµâ•ÑÅÕΩ±ºÅÕïüÈ∏Å±ÑÅôïç°ÑÅëîÅ…ùïπ—•πÑ∏(ÄÄÄÄÄÄÄÄÄÄÄÅ1ºÅ≈’îÅ¡’â±•≈’ïÃÅÖèÑÅÕîÅÖ¡±•çÑÅÑÅ—ΩëΩÃÅ±ΩÃÅUÕ’Ö…•ΩÃÅï∏ÅAÅ‰Åçï±’±Ö»∏(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅ•êÙâÕïÖÕΩπÖ±ëµ•πM—Ö—’ÃàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÌµÖ…ù•∏µ—Ω¿Ë›¡‡Ïà¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÒÕï±ïç–(ÄÄÄÄÄÄÄÄÄÅ•êÙâÕïÖÕΩπÖ±Q°ïµïëµ•πMï±ïç–à(ÄÄÄÄÄÄÄÄÄÅΩπç°ÖπùîÙâÕï—MïÖÕΩπÖ±ëµ•πA…ïŸ•ï‹°—°•ÃπŸÖ±’î§à(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÄÄÅµ•∏µ›•ë—†Ëƒ‰¡¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÅ¡Öëë•πúËƒ¡¡‡Äƒ…¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§Ï(ÄÄÄÄÄÄÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ï(ÄÄÄÄÄÄÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒ¡¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ï(ÄÄÄÄÄÄÄÄÄÄà(ÄÄÄÄÄÄÄÄ¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâÖ’—ºà˚¬~^Oæ‚<Å’—Ω∑Ö—•çºΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâπΩ…µÖ∞à˚äj¨Å9Ω…µÖ∞ΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâÕ¡…•πúà˚¬~2‡ÅA…•µÖŸï…ÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâ°Ö±±Ω›ïï∏à˚¬~:Å!Ö±±Ω›ïï∏ΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâç°…•Õ—µÖÃà˚¬~:Å9ÖŸ•ëÖêΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâπï›ÂïÖ»à˚¬~:Å≈ºÅ9’ïŸºΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâ…ïÂïÃà˚¬~FDÅIïÂïÃΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâŸÖ±ïπ—•πïÃà˚¬~J\ÅMÖ∏ÅYÖ±ïπ”µ∏ΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâ¡Ö—…•Ñà˚¬~õ¬~‹Åïç°ÑÅ¡Ö—…•ÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâôÖ—°ï»à˚¬~F†ÅµÑÅëï∞ÅAÖë…îΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâç°•±ë°ΩΩêà˚¬~ûHÅµÑÅëîÅ±ÖÃÅ%πôÖπç•ÖÃΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâµΩ—°ï»à˚¬~2‹ÅµÑÅëîÅ±ÑÅ5Öë…îΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâïÖÕ—ï»à˚¬~B¿ÅAÖÕç’ÖÃΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄΩÕï±ïç–¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿ËÃ…¡‡Ïà˚¬~RHÅççïÕºÅÑÅ	•±±ï—ï…ÑΩ†Ã¯(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ì¡Öëë•πúË¿ÌΩŸï…ô±Ω‹È°•ëëï∏Ïà¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ìô±ï‡µ›…Ö¿È›…Ö¿ÌùÖ¿Ëƒ…¡‡Ì¡Öëë•πúËƒ—¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâô±ï‡ËƒÌµ•∏µ›•ë—†Ëƒ‰¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÌôΩπ–µ›ï•ù°–Ë‹¿¿Ïà˚¬~FlÅ	•±±ï—ï…ÑΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë…¡‡Ïà˘AÖ’œÑÅºÅ°Öâ•±•”ÑÅï∞ÅÖççïÕºÅÑÅçÖπ©ïÃ∏Ωë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅ•êÙâ›Ö±±ï—1Ωç≠	—∏àÅΩπç±•ç¨Ùâ°Öπë±ïQΩùù±ï]Ö±±ï—1Ωç¨†§à˘Ö…ùÖπëº∏∏∏Ωâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ¡Öëë•πúË¿Äƒ—¡‡Äƒ…¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÄÅQ‘Åç’ïπ—ÑÅëîÅÖëµ•π•Õ—…ÖëΩ»ÅµÖπ—•ïπîÅÖççïÕºÅÑÅ±ÑÅ	•±±ï—ï…ÑÅÖ’π≈’îÅïÕ”§Å¡Ö’ÕÖëÑÅ¡Ö…ÑÅ±ΩÃÅëï∑ÖÃÅ’Õ’Ö…•ΩÃ∏(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿ËÃ…¡‡Ïà˚¬~J‘ÅA…ïç•ΩÃÅëîÅ±ÑÅ—•ïπëÑΩ†Ã¯(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅµÖ…ù•∏µ—Ω¿Ë¿Ïà˘Õ—ΩÃÅ¡…ïç•ΩÃÅÕîÅÖ¡±•çÖ∏ÅÖ∞Å—Ω≈’î∞ÅπºÅ°ÖçîÅôÖ±—ÑÅ¡’â±•çÖ»Åπ•πù’πÑÅŸï…ÕßÕ∏∏Ω¿¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÏÅù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË≈ô»Ä≈ô»ÏÅùÖ¿Ëƒ…¡‡ÏÅµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒ±Öâï∞ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅë•Õ¡±Ö‰Èâ±Ωç¨ÏÅµÖ…ù•∏µâΩ——Ω¥Ë—¡‡Ïà˘	ΩΩÕ–Åï·—…ÑÉäPÅ¡±Ö∏ÅA±’ÃΩ±Öâï∞¯(ÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâπ’µâï»àÅ•êÙâ¡…•çï	ΩΩÕ—A±’ÃàÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏÅ¡Öëë•πúËƒ¡¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒ±Öâï∞ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅë•Õ¡±Ö‰Èâ±Ωç¨ÏÅµÖ…ù•∏µâΩ——Ω¥Ë—¡‡Ïà˘	ΩΩÕ–Åï·—…ÑÉäPÅ¡±Ö∏Å•ÖµÖπ—îΩ±Öâï∞¯(ÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâπ’µâï»àÅ•êÙâ¡…•çï	ΩΩÕ—•ÖµÖπ—îàÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏÅ¡Öëë•πúËƒ¡¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒ±Öâï∞ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅë•Õ¡±Ö‰Èâ±Ωç¨ÏÅµÖ…ù•∏µâΩ——Ω¥Ë—¡‡Ïà˘Öµâ•Ö»ÅÑÅA±’ÃÅçΩ∏Å¡’π—ΩÃΩ±Öâï∞¯(ÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâπ’µâï»àÅ•êÙâ¡…•çïA±ÖπA±’ÃàÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏÅ¡Öëë•πúËƒ¡¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒ±Öâï∞ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅë•Õ¡±Ö‰Èâ±Ωç¨ÏÅµÖ…ù•∏µâΩ——Ω¥Ë—¡‡Ïà˘Öµâ•Ö»ÅÑÅ•ÖµÖπ—îÅçΩ∏Å¡’π—ΩÃΩ±Öâï∞¯(ÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâπ’µâï»àÅ•êÙâ¡…•çïA±Öπ•ÖµÖπ—îàÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏÅ¡Öëë•πúËƒ¡¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨Ùâ°Öπë±ïMÖŸïM—Ω…ïA…•çïÃ†§à˘’Ö…ëÖ»Å¡…ïç•ΩÃΩâ’——Ω∏¯(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿ËÃ…¡‡Ïà˚¬~:†ÅµΩ©•ÃÅëîÅ±ÑÅ—•ïπëÑΩ†Ã¯(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿Ë·¡‡ÏÅô±ï‡µ›…Ö¿È›…Ö¿ÏÅµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâπï›µΩ©•°Ö»àÅ¡±Öçï°Ω±ëï»Ùã¬~B@àÅµÖ·±ïπù—†Ùà–àÅÕ—Â±îÙâ›•ë—†Ëÿ¡¡‡ÏÅ¡Öëë•πúËƒ¡¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÏÅ—ï·–µÖ±•ù∏Èçïπ—ï»Ïà¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâΩ¡ïπµΩ©•A•ç≠ï»†ùπï›µΩ©•°Ö»ú∞Å}5=)%L§à˘±ïù•»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâπï›µΩ©•9ÖµîàÅ¡±Öçï°Ω±ëï»Ùâ9Ωµâ…îÄ°ï®ËÅ=P§àÅÕ—Â±îÙâô±ï‡ËƒÏÅµ•∏µ›•ë—†Ëƒ–¡¡‡ÏÅ¡Öëë•πúËƒ¡¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâπ’µâï»àÅ•êÙâπï›µΩ©•A…•çîàÅµ•∏Ùà¿àÅ¡±Öçï°Ω±ëï»Ùà¿ÄÙÅIQ%LàÅÕ—Â±îÙâ›•ë—†Ëƒ»¡¡‡ÏÅ¡Öëë•πúËƒ¡¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË≈ô»Ä≈ô»Äƒ»¡¡‡ÌùÖ¿Ë·¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒÕï±ïç–Å•êÙâπï›µΩ©•IÖ…•—‰àÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâçΩµ’∏à˘Ω∑È∏ΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâ…Ö…Ñà˘IÖ…ÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâï¡•çÑà˚%¡•çÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâ±ïùïπëÖ…•Ñà˘1ïùïπëÖ…•ÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâï·ç±’Õ•ŸÑà˘·ç±’Õ•ŸÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄΩÕï±ïç–¯((ÄÄÄÄÄÄÄÄÒÕï±ïç–Å•êÙâπï›µΩ©•ë•—•Ω∏à(ÄÄÄÄÄÄÄÄÄÅΩπç°ÖπùîÙâëΩç’µïπ–πùï—±ïµïπ—	Â%ê†ùπï›µΩ©•M—Ωç¨ú§πë•ÕÖâ±ïêı—°•ÃπŸÖ±’îÑÙÙù±•µ•—ïêúÏà(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâÕ—ÖπëÖ…êà˘ë•çßÕ∏ÅπΩ…µÖ∞ΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâ±•µ•—ïêà˘ë•çßÕ∏Å±•µ•—ÖëÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄΩÕï±ïç–¯((ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâπ’µâï»àÅ•êÙâπï›µΩ©•M—Ωç¨àÅµ•∏ÙàƒàÅ¡±Öçï°Ω±ëï»ÙâM—Ωç¨àÅë•ÕÖâ±ïê(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨Ùâ°Öπë±ïëëM—Ω…ïµΩ©§†§à˘ù…ïùÖ»ÅïµΩ©§Ωâ’——Ω∏¯(ÄÄÄÄÄÄÒë•ÿÅ•êÙâÕ—Ω…ïµΩ©•Õ1•Õ–à˘Ö…ùÖπëº∏∏∏Ωë•ÿ¯(ÄÄÄÄΩë•ÿ¯(((ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿ËÃ…¡‡Ïà˚¬~>Å5ïëÖ±±ÖÃÅï·ç±’Õ•ŸÖÃÅëîÅ±ÑÅ—•ïπëÑΩ†Ã¯(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë¿Ïà¯(ÄÄÄÄÄÄÄÅ…óÑÅµïëÖ±±ÖÃÅçΩ±ïçç•ΩπÖâ±ïÃ∏Å’ÖπëºÅÖ±ù’•ï∏Å±ÑÅçΩµ¡…Ñ∞Å¡ÖÕÑÅÑÅÕ‘ÅçΩ±ïççßÕ∏Å…ïÖ∞Å‰Å¡’ïëîÅï≈’•¡Ö…±ÑÅïπ—…îÅÕ’ÃÄÃÅµïëÖ±±ÖÃÅëîÅ¡ï…ô•∞∏(ÄÄÄÄÄÄΩ¿¯((ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË‹¡¡‡Ä≈ô»ÌùÖ¿Ë·¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâπï›M—Ω…ï	Öëùï%çΩ∏àÅ¡±Öçï°Ω±ëï»Ùã¬~>àÅµÖ·±ïπù—†Ùà‡à(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ì—ï·–µÖ±•ù∏Èçïπ—ï»ÌôΩπ–µÕ•ÈîË»¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâπï›M—Ω…ï	Öëùï9ÖµîàÅ¡±Öçï°Ω±ëï»Ùâ9Ωµâ…îÅëîÅ±ÑÅµïëÖ±±Ñà(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÒ—ï·—Ö…ïÑÅ•êÙâπï›M—Ω…ï	ÖëùïïÕç…•¡—•Ω∏àÅµÖ·±ïπù—†Ùàƒ‡¿àÅ…Ω›ÃÙà»àÅ¡±Öçï°Ω±ëï»ÙâïÕç…•¡çßÕ∏ÅçΩ…—Ñ∏∏∏à(ÄÄÄÄÄÄÄÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÌ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ì…ïÕ•ÈîÈŸï…—•çÖ∞ÌµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà¯Ω—ï·—Ö…ïÑ¯((ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË≈ô»ÄƒÃ¡¡‡ÌùÖ¿Ë·¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒÕï±ïç–Å•êÙâπï›M—Ω…ï	ÖëùïIÖ…•—‰à(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâçΩµ’∏à˘Ω∑È∏ΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâ…Ö…Ñà˘IÖ…ÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâï¡•çÑà˚%¡•çÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâ±ïùïπëÖ…•Ñà˘1ïùïπëÖ…•ÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâï·ç±’Õ•ŸÑà˘·ç±’Õ•ŸÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄΩÕï±ïç–¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâπ’µâï»àÅ•êÙâπï›M—Ω…ï	ÖëùïA…•çîàÅµ•∏Ùà¿àÅ¡±Öçï°Ω±ëï»ÙâA…ïç•ºÅ¡—ÃÉ
‹Ä¿ÄÙÅIQ%Là(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË≈ô»ÄƒÃ¡¡‡ÌùÖ¿Ë·¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒÕï±ïç–Å•êÙâπï›M—Ω…ï	Öëùïë•—•Ω∏à(ÄÄÄÄÄÄÄÄÄÅΩπç°ÖπùîÙâëΩç’µïπ–πùï—±ïµïπ—	Â%ê†ùπï›M—Ω…ï	ÖëùïM—Ωç¨ú§πë•ÕÖâ±ïêı—°•ÃπŸÖ±’îÑÙÙù±•µ•—ïêúÏà(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâÕ—ÖπëÖ…êà˘ë•çßÕ∏ÅπΩ…µÖ∞ΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâ±•µ•—ïêà˘ë•çßÕ∏Å±•µ•—ÖëÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄΩÕï±ïç–¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâπ’µâï»àÅ•êÙâπï›M—Ω…ï	ÖëùïM—Ωç¨àÅµ•∏ÙàƒàÅ¡±Öçï°Ω±ëï»ÙâUπ•ëÖëïÃàÅë•ÕÖâ±ïê(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌùÖ¿Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâΩ¡ïπµΩ©•A•ç≠ï»†ùπï›M—Ω…ï	Öëùï%çΩ∏ú∞Å51}5=)%L§à˘±ïù•»ÉµçΩπºΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨Ùâ°Öπë±ïëëM—Ω…ï	Öëùî†§à˘…ïÖ»ÅµïëÖ±±ÑΩâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÒë•ÿÅ•êÙâÕ—Ω…ï	ÖëùïÕëµ•π1•Õ–àÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ëƒ—¡‡Ïà˘Ö…ùÖπëº∏∏∏Ωë•ÿ¯(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿ËÃ…¡‡Ïà˚¬~>ﬂæ‚<ÅSµ—’±ΩÃÅëîÅ¡ï…ô•∞Ω†Ã¯(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë¿Ì±•πîµ°ï•ù°–Ëƒ∏‘Ïà¯(ÄÄÄÄÄÄÄÅ…óÑÅ”µ—’±ΩÃÅ≈’îÅ±ΩÃÅ’Õ’Ö…•ΩÃÅ¡’ïëï∏ÅçΩµ¡…Ö»∞Åù’Ö…ëÖ»Åï∏Å5§ÅçΩ±ïççßÕ∏Å‰Åï≈’•¡Ö»ÅëïâÖ©ºÅëîÅÕ‘ÅπΩµâ…î∏(ÄÄÄÄÄÄÄÅ1ÑÅçÖ—ïùΩÀµÑÅÕîÅÖÕ•ùπÑÅÖ’—Ω∑Ö—•çÖµïπ—îÅçΩµºÄÒçΩëî˘—•—±îΩçΩëî¯∏(ÄÄÄÄÄÄΩ¿¯((ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌùÖ¿Ë·¡‡Ìô±ï‡µ›…Ö¿È›…Ö¿ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ïà¯(ÄÄÄÄÄÄÄÄÒ•π¡’–(ÄÄÄÄÄÄÄÄÄÅ—Â¡îÙâ—ï·–à(ÄÄÄÄÄÄÄÄÄÅ•êÙâπï›A…Ωô•±ïQ•—±ï%çΩ∏à(ÄÄÄÄÄÄÄÄÄÅ¡±Öçï°Ω±ëï»Ùã¬~FDà(ÄÄÄÄÄÄÄÄÄÅµÖ·±ïπù—†Ùà–à(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ›•ë—†Ëÿ…¡‡Ì¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ì—ï·–µÖ±•ù∏Èçïπ—ï»Ïà(ÄÄÄÄÄÄÄÄ¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâΩ¡ïπµΩ©•A•ç≠ï»†ùπï›A…Ωô•±ïQ•—±ï%çΩ∏ú∞Å}5=)%L§à˘±ïù•»Ωâ’——Ω∏¯((ÄÄÄÄÄÄÄÄÒ•π¡’–(ÄÄÄÄÄÄÄÄÄÅ—Â¡îÙâ—ï·–à(ÄÄÄÄÄÄÄÄÄÅ•êÙâπï›A…Ωô•±ïQ•—±ï9Öµîà(ÄÄÄÄÄÄÄÄÄÅ¡±Öçï°Ω±ëï»Ùâ®ËÅ1ïÂïπëÑà(ÄÄÄÄÄÄÄÄÄÅµÖ·±ïπù—†Ùà–¿à(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâô±ï‡ËƒÌµ•∏µ›•ë—†Ëƒÿ¡¡‡Ì¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà(ÄÄÄÄÄÄÄÄ¯((ÄÄÄÄÄÄÄÄÒÕï±ïç–(ÄÄÄÄÄÄÄÄÄÅ•êÙâπï›A…Ωô•±ïQ•—±ïIÖ…•—‰à(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ›•ë—†Ëƒ–’¡‡Ì¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà(ÄÄÄÄÄÄÄÄ¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâçΩµ’∏à˘Ω∑È∏ΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâ…Ö…Ñà˘IÖ…ÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâï¡•çÑà˚%¡•çÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâ±ïùïπëÖ…•Ñà˘1ïùïπëÖ…•ÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâï·ç±’Õ•ŸÑà˘·ç±’Õ•ŸÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄΩÕï±ïç–¯((ÄÄÄÄÄÄÄÄÒ•π¡’–(ÄÄÄÄÄÄÄÄÄÅ—Â¡îÙâπ’µâï»à(ÄÄÄÄÄÄÄÄÄÅ•êÙâπï›A…Ωô•±ïQ•—±ïA…•çîà(ÄÄÄÄÄÄÄÄÄÅµ•∏Ùà¿à(ÄÄÄÄÄÄÄÄÄÅ¡±Öçï°Ω±ëï»ÙâA…ïç•ºÅ¡—Ãà(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ›•ë—†Ëƒ»’¡‡Ì¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà(ÄÄÄÄÄÄÄÄ¯((ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨Ùâ°Öπë±ïëëA…Ωô•±ïQ•—±ïëµ•∏†§à˘…ïÖ»Å”µ—’±ºΩâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÒë•ÿÅ•êÙâ¡…Ωô•±ïQ•—±ïÕëµ•π1•Õ–àÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ëƒ—¡‡Ïà˘Ö…ùÖπëº∏∏∏Ωë•ÿ¯(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿ËÃ…¡‡Ïà˚är†Å=—…ΩÃÅÖ…”µç’±ΩÃÅëîÅ±ÑÅ—•ïπëÑΩ†Ã¯(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅµÖ…ù•∏µ—Ω¿Ë¿Ïà˘’Ö±≈’•ï»ÅçΩÕÑÅπ’ïŸÑÅ≈’îÅ≈’•ï…ÖÃÅŸïπëï»ËÅ•πÕ•ùπ•ÖÃ∞ÅµÖ…çΩÃ∞Å±ºÅ≈’îÅÕîÅ—îÅΩç’……Ñ∏ÅYΩÃÅï±ïüµÃÅ±ÑÅçÖ—ïùΩÀµÑÄ°ï∞Å—ï·—º§∞Åï∞ÉµçΩπº∞Åï∞ÅπΩµâ…îÅ‰Åï∞Å¡…ïç•º∏Ω¿¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿Ë·¡‡ÏÅô±ï‡µ›…Ö¿È›…Ö¿ÏÅµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâπï›%—ïµÖ—ïùΩ…‰àÅ¡±Öçï°Ω±ëï»ÙâÖ—ïùΩÀµÑÄ°ï®ËÅ%πÕ•ùπ•Ñ§àÅÕ—Â±îÙâ›•ë—†Ëƒ–¡¡‡ÏÅ¡Öëë•πúËƒ¡¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâπï›%—ïµ%çΩ∏àÅ¡±Öçï°Ω±ëï»Ùã¬~>àÅµÖ·±ïπù—†Ùà–àÅÕ—Â±îÙâ›•ë—†Ëÿ¡¡‡ÏÅ¡Öëë•πúËƒ¡¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÏÅ—ï·–µÖ±•ù∏Èçïπ—ï»Ïà¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâΩ¡ïπµΩ©•A•ç≠ï»†ùπï›%—ïµ%çΩ∏ú∞Å}5=)%L§à˘±ïù•»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâπï›%—ïµ9ÖµîàÅ¡±Öçï°Ω±ëï»Ùâ9Ωµâ…îàÅÕ—Â±îÙâô±ï‡ËƒÏÅµ•∏µ›•ë—†Ëƒ–¡¡‡ÏÅ¡Öëë•πúËƒ¡¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâπ’µâï»àÅ•êÙâπï›%—ïµA…•çîàÅ¡±Öçï°Ω±ëï»ÙâA…ïç•ºÅï∏Å¡—ÃàÅÕ—Â±îÙâ›•ë—†Ëƒ»¡¡‡ÏÅ¡Öëë•πúËƒ¡¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨Ùâ°Öπë±ïëëM—Ω…ï%—ï¥†§à˘ù…ïùÖ»Ωâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅ•êÙâÕ—Ω…ï%—ïµÕ1•Õ–à˘Ö…ùÖπëº∏∏∏Ωë•ÿ¯(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿ËÃ…¡‡Ïà˚¬~NàÅ9ΩŸïëÖëïÃÅ‰ÅS•…µ•πΩÃΩ†Ã¯(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅµÖ…ù•∏µâΩ——Ω¥Ëƒ…¡‡Ïà¯(ÄÄÄÄÄÄÄÅAÖ…ÑÅ¡’â±•çÖ»ÅπΩŸïëÖëïÃÅπ’ïŸÖÃËÅçÖ…üÑÅô•±ÖÃÅï∏Å±ÑÅ—Öâ±ÑÄÒçΩëî˘ç°Öπùï±Ωù}ïπ—…•ïÃΩçΩëî¯ÅçΩ∏Åï∞ÅªÈµï…ºÅëîÅŸï…ÕßÕ∏ÅÕ•ù’•ïπ—î∞Å‰ÅëïÕ¡◊•ÃÅÕ’ã¥Å±ÑÅŸï…ÕßÕ∏ÅÖèÑ∏ÅAÖ…ÑÅ”•…µ•πΩÃËÅÖç—’Ö±•ÎÑÄÒçΩëî˘—ï…µ•πΩÃπ°—µ∞ΩçΩëî¯Å‰ÅÕ’ã¥Å±ÑÅŸï…ÕßÕ∏ÅëîÄâS•…µ•πΩÃàÉäPÅÑÅ—ΩëΩÃÅ±ïÃÅŸÑÅÑÅŸΩ±Ÿï»ÅÑÅÖ¡Ö…ïçï»Å¡Ö…ÑÅÖçï¡—Ö»∏(ÄÄÄÄÄÄΩ¿¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿Ë·¡‡ÏÅô±ï‡µ›…Ö¿È›…Ö¿Ïà¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨Ùâ°Öπë±ï	’µ¡Yï…Õ•Ω∏†ùç°Öπùï±Ωúú§à˚¬~NåÅM’â•»ÅŸï…ÕßÕ∏ÅëîÅ9ΩŸïëÖëïÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨Ùâ°Öπë±ï	’µ¡Yï…Õ•Ω∏†ù—ï…µÃú§à˚¬~N,ÅM’â•»ÅŸï…ÕßÕ∏ÅëîÅS•…µ•πΩÃΩâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯((((ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿ËÃ…¡‡Ïà˚¬~RîÅIÖç°ÑÅÕïµÖπÖ∞ÉäPÅçÖ…ùÖ»Å¡…ïµ•ΩÃΩ†Ã¯(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅµÖ…ù•∏µâΩ——Ω¥Ëƒ…¡‡Ïà¯(ÄÄÄÄÄÄÄÅ±ïü¥Åï∞Å±’πïÃÅëîÅ±ÑÅÕïµÖπÑÅ≈’îÅ≈’ïÀ•ÃÅçΩπô•ù’…Ö»∞Å‰ÅçΩµ¡±ï”ÑÅ±ΩÃÄ‹ÅìµÖÃ∏ÅMîÅ¡’ïëîÅçÖ…ùÖ»ÅçΩ∏ÅÖπ—•ç•¡ÖçßÕ∏∏(ÄÄÄÄÄÄΩ¿¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâô•ï±êà¯(ÄÄÄÄÄÄÄÄÒ±Öâï∞˘MïµÖπÑÅ≈’îÅïµ¡•ïÈÑÅï∞Ä°ôïç°ÑÅëï∞Å±’πïÃ§Ω±Öâï∞¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâëÖ—îàÅ•êÙâÕ—…ïÖ≠]ïï≠M—Ö…–àÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏÅ¡Öëë•πúËƒ¡¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÏÅôΩπ–µôÖµ•±‰È•π°ï…•–Ïà¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅ•êÙâÕ—…ïÖ≠ÖÂÕΩ…¥à¯Ωë•ÿ¯(ÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨Ùâ±ΩÖëM—…ïÖ≠ÖÂÕΩ…¥†§àÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡Ïà˘Ö…ùÖ»ÅôΩ…µ’±Ö…•ºÅëîÅïÕÑÅÕïµÖπÑΩâ’——Ω∏¯(ÄÄÄÄÄÄÒë•ÿÅ•êÙâÕ—…ïÖ≠MÖŸïIïÕ’±–à¯Ωë•ÿ¯(ÄÄÄÄΩë•ÿ¯(ÄÄÄÄÒë•ÿÅ•êÙâÕ—…ïÖ≠]ïï≠Õ=Ÿï…Ÿ•ï‹àÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯Ωë•ÿ¯((ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿ËÃ…¡‡Ïà˚¬~R4Å	’ÕçÖ»Å‰ÅùïÕ—•ΩπÖ»Åç’Ö±≈’•ï»Åç’ïπ—ÑΩ†Ã¯(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿Ë·¡‡ÏÅô±ï‡µ›…Ö¿È›…Ö¿Ïà¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâ’Õï…MïÖ…ç°%π¡’–àÅ¡±Öçï°Ω±ëï»Ùâ9Ωµâ…îÅëîÅ’Õ’Ö…•ºÅºÅïµÖ•∞∏∏∏àÅÕ—Â±îÙâô±ï‡ËƒÏÅµ•∏µ›•ë—†Ëƒ‡¡¡‡ÏÅ¡Öëë•πúËƒ¡¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÏÅôΩπ–µôÖµ•±‰È•π°ï…•–Ïà¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨Ùâ°Öπë±ïUÕï…MïÖ…ç††§àÅÕ—Â±îÙâô±ï‡ËƒÏÅµ•∏µ›•ë—†Ëƒ¿¡¡‡Ïà˘	’ÕçÖ»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨Ùâ°Öπë±ï1•Õ—±±UÕï…Ã†§àÅÕ—Â±îÙâô±ï‡ËƒÏÅµ•∏µ›•ë—†Ëƒ¿¡¡‡Ïà˚¬~N,ÅYï»Å—ΩëΩÃΩâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅ•êÙâ’Õï…MïÖ…ç°IïÕ’±—ÃàÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ëƒ—¡‡Ïà¯Ωë•ÿ¯(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄëÌ…ïÕΩ±Ÿïêπ±ïπù—†Ä¸ÅÄ(ÄÄÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿ËÃ…¡‡Ïà˘!•Õ—Ω…•Ö∞Å…ïç•ïπ—îΩ†Ã¯(ÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄëÌ…ïÕΩ±ŸïêπµÖ¿°»ÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ïëùï»µ…Ω‹à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏˘ ëÌïÕçÖ¡ï!—µ∞°»π¡…Ωô•±ïÃ¸π’Õï…πÖµîÅÒÄâ’Õ’Ö…•ºà•ÙÉ
‹ÄêëÌ»πÖµΩ’π—}Ö…ÕÙÉ
‹ÄëÌπï‹ÅÖ—î°»πç…ïÖ—ïë}Ö–§π—Ω1ΩçÖ±ïÖ—ïM—…•πú†âïÃµHà•ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏Åç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâçΩ±Ω»ËëÌ»πÕ—Ö—’ÃÄÙÙÙÄù¡Ö•êúÄ¸ÄùŸÖ»†¥µù…ïï∏§úÄËÅ»πÕ—Ö—’ÃÄÙÙÙÄùÖ¡¡…ΩŸïêúÄ¸ÄùŸÖ»†¥µù…ïï∏§úÄËÄùŸÖ»†¥µ…ïê§ùÙà¯ëÌ»πÕ—Ö—’ÕÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÅÄ§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄΩë•ÿ˘ÄÄËÄàâıÄÏ((ÄÅΩ…ùÖπ•Èïëµ•πAÖπï∞†§Ï(ÄÅ±ΩÖëM—…ïÖ≠]ïï≠Õ=Ÿï…Ÿ•ï‹†§Ï(ÄÅ±ΩÖë]Ö±±ï—1Ωç≠M—Ö—’Ã†§Ï(ÄÅÕï—Q•µïΩ’–°ÕÂπçMïÖÕΩπÖ±ëµ•πΩπ—…Ω±Ã∞Ä¿§Ï(ÄÅ±ΩÖëM—Ω…ïµΩ©•Õ1•Õ–†§Ï(ÄÅ±ΩÖëM—Ω…ïA…•çïÃ†§Ï(ÄÅ±ΩÖëM—Ω…ï	ÖëùïÕëµ•π1•Õ–†§Ï(ÄÅ±ΩÖëM—Ω…ï%—ïµÕ1•Õ–†§Ï(ÄÅ±ΩÖëA…Ωô•±ïQ•—±ïÕëµ•π1•Õ–†§Ï)Ù(()ô’πç—•Ω∏Åùï—ëµ•πMïç’…•—ÂIïÖÕΩπ1Öâï∞°…ïÖÕΩ∏§ÅÏ(ÄÅçΩπÕ–Å±Öâï±ÃÄÙÅÏ(ÄÄÄÅ¡ÖÕÕ›Ω…ë}ç°Öπùï}πΩ—}…ïçΩùπ•ÈïêËÄâÖµâ•ºÅëîÅçΩπ—…ÖÕó≈ÑÅπºÅ…ïçΩπΩç•ëºà∞(ÄÄÄÅ±ΩÕ—}ÖççïÕÕ}Öô—ï…}ç°ÖπùîËÄâAï…ëßÃÅÖççïÕºÅëïÕ¡◊•ÃÅëï∞ÅçÖµâ•ºà∞(ÄÄÄÅ¡ΩÕÕ•â±ï}ÖççΩ’π—}—Ö≠ïΩŸï»ËÄâAΩÕ•â±îÅÖççïÕºÅëîÅΩ—…ÑÅ¡ï…ÕΩπÑà∞(ÄÄÄÅÕ’Õ¡•ç•Ω’Õ}Õïç’…•—Â}ïµÖ•∞ËÄâΩ……ïºÅëîÅÕïù’…•ëÖêÅÕΩÕ¡ïç°ΩÕºà∞(ÄÄÄÅΩ—°ï»ËÄâ=—…ºÅ¡…Ωâ±ïµÑÅëîÅÕïù’…•ëÖêà(ÄÅÙÏ(ÄÅ…ï—’…∏Å±Öâï±Õm…ïÖÕΩπtÅÒÅ…ïÖÕΩ∏ÅÒÄâM•∏ÅµΩ—•ŸºàÏ)Ù()ô’πç—•Ω∏Åùï—ëµ•πMïç’…•—ÂM—Ö—’Õ1Öâï∞°Õ—Ö—’Ã§ÅÏ(ÄÅçΩπÕ–Å±Öâï±ÃÄÙÅÏ(ÄÄÄÅ¡ïπë•πúËÄâA9%9Qà∞(ÄÄÄÅ…ïŸ•ï›•πúËÄâ8ÅIY%M'M8à∞(ÄÄÄÅ…ïçΩŸï…Â}Ö’—°Ω…•ÈïêËÄâIUAI'M8ÅUQ=I%ià∞(ÄÄÄÅ…ïÕΩ±ŸïêËÄâIMU1Q<à∞(ÄÄÄÅ…ï©ïç—ïêËÄâI!i<à(ÄÅÙÏ(ÄÅ…ï—’…∏Å±Öâï±ÕmÕ—Ö—’ÕtÅÒÅM—…•πú°Õ—Ö—’ÃÅÒÄàà§π—ΩU¡¡ï…ÖÕî†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅΩ¡ïπëµ•πMïç’…•—Â%πç•ëïπ—ï—Ö•∞°çÖÕïΩëî§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅ…Ω›Ã∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ùï—}Õïç’…•—Â}•πç•ëïπ—}…ï¡Ω…—Ãà§Ï((ÄÅ•òÄ°ï……Ω»§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅ¡’ë•µΩÃÅÖâ…•»Åï∞Å…ï¡Ω…—îà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–Å•πç•ëïπ–ÄÙÄ°…Ω›ÃÅÒÅmt§πô•πê°»ÄÙ¯Å»πçÖÕï}çΩëîÄÙÙÙÅçÖÕïΩëî§Ï((ÄÅ•òÄ†Ö•πç•ëïπ–§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†âIï¡Ω…—îÅπºÅïπçΩπ—…Öëºà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅçÖπIïŸ•ï‹ÄÙÅ•πç•ëïπ–πÕ—Ö—’ÃÄÙÙÙÄâ¡ïπë•πúàÏ(ÄÅçΩπÕ–ÅçÖπ’—°Ω…•ÈîÄÙÅlâ¡ïπë•πúà∞Äâ…ïŸ•ï›•πúâtπ•πç±’ëïÃ°•πç•ëïπ–πÕ—Ö—’Ã§Ï(ÄÅçΩπÕ–ÅçÖπIï©ïç–ÄÙÅlâ¡ïπë•πúà∞Äâ…ïŸ•ï›•πúâtπ•πç±’ëïÃ°•πç•ëïπ–πÕ—Ö—’Ã§Ï((ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ•òÄ†Ö›…Ö¿§Å…ï—’…∏Ï((ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µΩŸï…±Ö‰Å±ÃµµΩëÖ∞µ±Ωç≠ïêàÅëÖ—ÑµµΩëÖ∞µ±Ωç≠ïêÙàƒàÅÕ—Â±îÙâËµ•πëï‡ËÃ»¿Ïà¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡àÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÅµÖ‡µ›•ë—†Ë‘ÿ¡¡‡Ï(ÄÄÄÄÄÄÄÅµÖ‡µ°ï•ù°–Ë‰¡ëŸ†Ï(ÄÄÄÄÄÄÄÅΩŸï…ô±Ω‹È°•ëëï∏Ï(ÄÄÄÄÄÄÄÅë•Õ¡±Ö‰Èô±ï‡Ï(ÄÄÄÄÄÄÄÅô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏Ï(ÄÄÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»–‡∞ƒƒÃ∞ƒƒÃ∞∏»–§Ï(ÄÄÄÄÄÄà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µ°ïÖëï»àÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌùÖ¿Ëƒ…¡‡ÌÖ±•ù∏µ•—ïµÃÈô±ï‡µÕ—Ö…–Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»Ëçôà‹ƒ‡‘ÌôΩπ–µ›ï•ù°–Ë‰¿¿Ì±ï——ï»µÕ¡Öç•πúË∏ƒ…ï¥Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÉ¬~j†ÅMUI%(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒ†»ÅÕ—Â±îÙâµÖ…ù•∏Ë—¡‡Ä¿ÄÕ¡‡Ïà¯ëÌïÕçÖ¡ï!—µ∞°•πç•ëïπ–πçÖÕï}çΩëî•ÙΩ†»¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌïÕçÖ¡ï!—µ∞°ùï—ëµ•πMïç’…•—ÂM—Ö—’Õ1Öâï∞°•πç•ëïπ–πÕ—Ö—’Ã§•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅΩπç±•ç¨Ùâç±ΩÕï5ÖπÖùïë5ΩëÖ∞†§à(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ›•ë—†Ë–¡¡‡Ì°ï•ù°–Ë–¡¡‡ÌâΩ…ëï»µ…Öë•’ÃË‘¿îÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÌôΩπ–µÕ•ÈîËƒ·¡‡Ìç’…ÕΩ»È¡Ω•π—ï»Ïà˚ärTΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µâΩë‰àÅÕ—Â±îÙâΩŸï…ô±Ω‹µ‰ÈÖ’—ºÌµ•∏µ°ï•ù°–Ë¿Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘U9QΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÌôΩπ–µ›ï•ù°–Ë‡¿¿ÌµÖ…ù•∏µ—Ω¿ËÕ¡‡Ïà¯ëÌïÕçÖ¡ï!—µ∞°•πç•ëïπ–πïµÖ•∞ÅÒÄàà•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë—¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌïÕçÖ¡ï!—µ∞°•πç•ëïπ–π’Õï…}•êÅÒÄâM•∏Å’Õï…}•êà•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘5=Q%Y<Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÌôΩπ–µ›ï•ù°–Ë‡¿¿ÌµÖ…ù•∏µ—Ω¿Ë—¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌïÕçÖ¡ï!—µ∞°ùï—ëµ•πMïç’…•—ÂIïÖÕΩπ1Öâï∞°•πç•ëïπ–π…ïÖÕΩ∏§•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘MI%A'M8Å0ÅUMUI%<Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡Ì±•πîµ°ï•ù°–Ëƒ∏‘‘ÌµÖ…ù•∏µ—Ω¿Ë’¡‡Ì›°•—îµÕ¡ÖçîÈ¡…îµ›…Ö¿Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌïÕçÖ¡ï!—µ∞°•πç•ëïπ–πëï—Ö•±ÃÅÒÄâM•∏ÅëïÕç…•¡çßÕ∏à•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ì±•πîµ°ï•ù°–Ëƒ∏‘Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÅIï¡Ω…—ÖëºËÄëÌ•πç•ëïπ–πç…ïÖ—ïë}Ö–Ä¸Åπï‹ÅÖ—î°•πç•ëïπ–πç…ïÖ—ïë}Ö–§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà§ÄËÄãäPâÙÒâ»¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌ•πç•ëïπ–π…ïŸ•ï›ïë}Ö–Ä¸ÅÅIïŸ•ÕÖëºËÄëÌπï‹ÅÖ—î°•πç•ëïπ–π…ïŸ•ï›ïë}Ö–§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙÒâ»˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—ÖëºÅÖç—’Ö∞ËÄëÌïÕçÖ¡ï!—µ∞°ùï—ëµ•πMïç’…•—ÂM—Ö—’Õ1Öâï∞°•πç•ëïπ–πÕ—Ö—’Ã§•Ù(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄëÌ•πç•ëïπ–πÕ—Ö—’ÃÄÙÙÙÄâ…ïçΩŸï…Â}Ö’—°Ω…•ÈïêàÄ¸ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅµÖ…ù•∏µ—Ω¿Ëƒ—¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅ¡Öëë•πúËƒ…¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†Ã–∞ƒ‰‹∞‰–∞∏»»§Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†Ã–∞ƒ‰‹∞‰–∞∏¿‘§Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒ≈¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅôΩπ–µÕ•ÈîËƒ¡¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅ±•πîµ°ï•ù°–Ëƒ∏‘Ï(ÄÄÄÄÄÄÄÄÄÄÄÄà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÉ¬~R@ÅIïç’¡ï…ÖçßÕ∏ÅÖ’—Ω…•ÈÖëÑ∏Å∞ÅèÕë•ùºÅ—ïµ¡Ω…Ö∞Åô’îÅùïπï…ÖëºÅ¡Ω»Åï∞ÅÕï…Ÿ•ëΩ»∞(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅŸïπçîÅï∏Ä‘Åµ•π’—ΩÃÅ‰Å—•ïπîÅ’∏Å∑Ö·•µºÅëîÄ‘Å•π—ïπ—ΩÃ∏(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÅÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µôΩΩ—ï»àÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–†»±µ•πµÖ‡†¿∞≈ô»§§ÌùÖ¿Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄëÌçÖπIïŸ•ï‹Ä¸ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨ÙâÖëµ•πMï—Mïç’…•—Â%πç•ëïπ—M—Ö—’Ã†úëÌïÕçÖ¡ï!—µ∞°•πç•ëïπ–πçÖÕï}çΩëî•Ùú∞ù…ïŸ•ï›•πúú§à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÉ¬~R8Å∏Å…ïŸ•ÕßÕ∏(ÄÄÄÄÄÄÄÄÄÄÄÄΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÅÄÄËÄàâÙ((ÄÄÄÄÄÄÄÄÄÄëÌçÖπ’—°Ω…•ÈîÄ¸ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏à(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨ÙâÖëµ•π’—°Ω…•ÈïMïç’…•—ÂIïçΩŸï…‰†úëÌïÕçÖ¡ï!—µ∞°•πç•ëïπ–πçÖÕï}çΩëî•Ùú§à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÉ¬~R@Å’—Ω…•ÈÖ»Å…ïç’¡ï…ÖçßÕ∏(ÄÄÄÄÄÄÄÄÄÄÄÄΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÅÄÄËÄàâÙ((ÄÄÄÄÄÄÄÄÄÄëÌçÖπIï©ïç–Ä¸ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†»–‡∞ƒƒÃ∞ƒƒÃ∞∏Ã‘§Ïà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨ÙâÖëµ•πIï©ïç—Mïç’…•—Â%πç•ëïπ–†úëÌïÕçÖ¡ï!—µ∞°•πç•ëïπ–πçÖÕï}çΩëî•Ùú§à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÉärTÅIïç°ÖÈÖ»(ÄÄÄÄÄÄÄÄÄÄÄÄΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÅÄÄËÄàâÙ((ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨Ùâç±ΩÕï5ÖπÖùïë5ΩëÖ∞†§à˘ï……Ö»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅÖëµ•πMï—Mïç’…•—Â%πç•ëïπ—M—Ö—’Ã°çÖÕïΩëî∞ÅÕ—Ö—’Ã§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Õï—}Õïç’…•—Â}•πç•ëïπ—}Õ—Ö—’Ãà∞ÅÏ(ÄÄÄÅ¡}çÖÕï}çΩëîËÅçÖÕïΩëî∞(ÄÄÄÅ¡}Õ—Ö—’ÃËÅÕ—Ö—’Ã∞(ÄÄÄÅ¡}Öëµ•π}πΩ—ïÃËÅπ’±∞(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅ¡’ë•µΩÃÅÖç—’Ö±•ÈÖ»Åï∞ÅçÖÕºà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅÕ°Ω›QΩÖÕ–°Õ—Ö—’ÃÄÙÙÙÄâ…ïŸ•ï›•πúàÄ¸ÄâÖÕºÅµÖ…çÖëºÅ∏Å…ïŸ•ÕßÕ∏àÄËÄâÖÕºÅÖç—’Ö±•ÈÖëºà§Ï(ÄÅç±ΩÕï5ÖπÖùïë5ΩëÖ∞†§Ï(ÄÅÖ›Ö•–Å…ïπëï…ëµ•∏†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅÖëµ•πIï©ïç—Mïç’…•—Â%πç•ëïπ–°çÖÕïΩëî§ÅÏ(ÄÅ•òÄ†ÖçΩπô•…¥†ã
˝Iïç°ÖÈÖ»ÅïÕ—îÅ…ï¡Ω…—îÅëîÅÕïù’…•ëÖê¸à§§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅπΩ—îÄÙÅ¡…Ωµ¡–†â5Ω—•ŸºÅ•π—ï…πºÅëï∞Å…ïç°ÖÈºÄ°Ω¡ç•ΩπÖ∞§Ëà∞Äàà§Ä¸¸Åπ’±∞Ï((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Õï—}Õïç’…•—Â}•πç•ëïπ—}Õ—Ö—’Ãà∞ÅÏ(ÄÄÄÅ¡}çÖÕï}çΩëîËÅçÖÕïΩëî∞(ÄÄÄÅ¡}Õ—Ö—’ÃËÄâ…ï©ïç—ïêà∞(ÄÄÄÅ¡}Öëµ•π}πΩ—ïÃËÅπΩ—î(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅ¡’ë•µΩÃÅ…ïç°ÖÈÖ»Åï∞ÅçÖÕºà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅÕ°Ω›QΩÖÕ–†âIï¡Ω…—îÅ…ïç°ÖÈÖëºà§Ï(ÄÅç±ΩÕï5ÖπÖùïë5ΩëÖ∞†§Ï(ÄÅÖ›Ö•–Å…ïπëï…ëµ•∏†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅÖëµ•π’—°Ω…•ÈïMïç’…•—ÂIïçΩŸï…‰°çÖÕïΩëî§ÅÏ(ÄÅ•òÄ†ÖçΩπô•…¥†(ÄÄÄÄã
˝’—Ω…•ÈÖ»Å…ïç’¡ï…ÖçßÕ∏Å¡Ö…ÑÅïÕ—îÅçÖÕº˝qqπqq∏àÄ¨(ÄÄÄÄâMîÅùïπï…ÖÀÑÅ’∏ÅèÕë•ùºÅ—ïµ¡Ω…Ö∞ÅëîÄÿÅìµù•—ΩÃ∞Å€Ö±•ëºÅ¡Ω»Ä‘Åµ•π’—ΩÃ∞ÄàÄ¨(ÄÄÄÄâ‰ÅÕîÅïπŸ•ÖÀÑÅÖ∞ÅçΩ……ïºÅëîÅ±ÑÅç’ïπ—Ñ∏à(ÄÄ§§Å…ï—’…∏Ï((ÄÅÕ°Ω›QΩÖÕ–†âïπï…ÖπëºÅèÕë•ùºÅ—ïµ¡Ω…Ö∞∏∏∏à§Ï((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπô’πç—•ΩπÃπ•πŸΩ≠î†âÕïç’…•—‰µ…ïçΩŸï…‰à∞ÅÏ(ÄÄÄÅâΩë‰ËÅÏ(ÄÄÄÄÄÅÖç—•Ω∏ËÄâ•ÕÕ’ï}çΩëîà∞(ÄÄÄÄÄÅçÖÕï}çΩëîËÅçÖÕïΩëî(ÄÄÄÅÙ(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅçΩπÕΩ±îπï……Ω»†âÕïç’…•—‰µ…ïçΩŸï…‰Ëà∞Åï……Ω»∞ÅëÖ—Ñ§Ï((ÄÄÄÅçΩπÕ–ÅµÕúÄÙ(ÄÄÄÄÄÅëÖ—Ñ¸πï……Ω»ÄÙÙÙÄâπΩ}Ö’—Ω…•ÈÖëºàÄ¸Äâ1ÑÅô’πçßÕ∏ÅπºÅ…ïçΩπΩçßÃÅ—‘Åç’ïπ—ÑÅçΩµºÅëµ•∏àÄË(ÄÄÄÄÄÅëÖ—Ñ¸πï……Ω»ÄÙÙÙÄâçÖÕï}πΩ—}ôΩ’πêàÄ¸Äâ9ºÅïπçΩπ—…ÖµΩÃÅïÕîÅçÖÕºàÄË(ÄÄÄÄÄÅëÖ—Ñ¸πï……Ω»ÄÙÙÙÄâçÖÕï}πΩ—}…ïçΩŸï…Öâ±îàÄ¸ÄâÕîÅçÖÕºÅÂÑÅπºÅÖëµ•—îÅ…ïç’¡ï…ÖçßÕ∏àÄË(ÄÄÄÄÄÅëÖ—Ñ¸πï……Ω»ÄÙÙÙÄâïµÖ•±}Õïπë}ôÖ•±ïêàÄ¸ÄâMîÅùïπïÀÃÅï∞ÅèÕë•ùºÅ¡ï…ºÅôÖ±≥ÃÅï∞Åïπ€µºÅëï∞ÅçΩ……ïºàÄË(ÄÄÄÄÄÅëÖ—Ñ¸πï……Ω»ÄÙÙÙÄâ…ïÕïπë}πΩ—}çΩπô•ù’…ïêàÄ¸ÄâÖ±—ÑÅçΩπô•ù’…Ö»ÅIïÕïπêÅï∏Å±ÑÅô’πçßÕ∏àÄË(ÄÄÄÄÄÄâ9ºÅ¡’ë•µΩÃÅÖ’—Ω…•ÈÖ»Å±ÑÅ…ïç’¡ï…ÖçßÕ∏àÏ((ÄÄÄÅÕ°Ω›QΩÖÕ–°µÕú§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅÕ°Ω›QΩÖÕ–†âÕë•ùºÅ—ïµ¡Ω…Ö∞ÅïπŸ•ÖëºÉärLà§Ï(ÄÅç±ΩÕï5ÖπÖùïë5ΩëÖ∞†§Ï(ÄÅÖ›Ö•–Å…ïπëï…ëµ•∏†§Ï)Ù()ô’πç—•Ω∏ÅΩ…ùÖπ•Èïëµ•πAÖπï∞†§ÅÏ(ÄÅçΩπÕ–ÅµÖ•∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÖ¡¡Y•ï‹à§Ï(ÄÅ•òÄ†ÖµÖ•∏§Å…ï—’…∏Ï((ÄÄººÅ…ïπëï…ëµ•∏†§Å…ïïµ¡±ÖÈÑÅ—ΩëºÅï∞Å•ππï…!Q50ÅçÖëÑÅŸïËÅ≈’îÅÕîÅÖç—’Ö±•ÈÑÅï∞Å¡Öπï∞∏(ÄÄººÅ∞ÅÖ—…•â’—ºÅëÖ—ÑµÖëµ•∏µΩ…ùÖπ•ÈïêÅ≈’ïëÑÅï∏ÅÖ¡¡Y•ï‹∞Å¡Ω»Å±ºÅ≈’îÅ9<ÅëïâïµΩÃ(ÄÄººÅ’ÕÖ…±ºÅ¡Ö…ÑÅ•µ¡ïë•»Å’πÑÅπ’ïŸÑÅΩ…ùÖπ•ÈÖçßÕ∏ËÅÕ§Å±ºÅ°ÖçïµΩÃ∞ÅëïÕ¡◊•ÃÅëîÅ’πÑ(ÄÄººÅÖççßÕ∏Åëµ•∏Åï∞ÅçΩπ—ïπ•ëºÅŸ’ï±ŸîÅÑÅ≈’ïëÖ»Å—ΩëºÅÖ¡•±Öëº∏(ÄÅµÖ•∏πëÖ—ÖÕï–πÖëµ•π=…ùÖπ•ÈïêÄÙÄàƒàÏ((ÄÅ•òÄ†ÖëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±Õëµ•π=…ùÖπ•ÈÖ—•ΩπM—Â±ïÃà§§ÅÏ(ÄÄÄÅçΩπÕ–ÅÕ—Â±îÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âÕ—Â±îà§Ï(ÄÄÄÅÕ—Â±îπ•êÄÙÄâ±Õëµ•π=…ùÖπ•ÈÖ—•ΩπM—Â±ïÃàÏ(ÄÄÄÅÕ—Â±îπ—ï·—Ωπ—ïπ–ÄÙÅÄ(ÄÄÄÄÄÄπ±ÃµÖëµ•∏µπÖÿÅÏ(ÄÄÄÄÄÄÄÅ¡ΩÕ•—•Ω∏ÈÕ—•ç≠‰Ï(ÄÄÄÄÄÄÄÅ—Ω¿Ë·¡‡Ï(ÄÄÄÄÄÄÄÅËµ•πëï‡ËÃ¿Ï(ÄÄÄÄÄÄÄÅë•Õ¡±Ö‰Èô±ï‡Ï(ÄÄÄÄÄÄÄÅùÖ¿Ë›¡‡Ï(ÄÄÄÄÄÄÄÅΩŸï…ô±Ω‹µ‡ÈÖ’—ºÏ(ÄÄÄÄÄÄÄÅ¡Öëë•πúË›¡‡Ï(ÄÄÄÄÄÄÄÅµÖ…ù•∏Ë¿Ä¿Äƒ·¡‡Ï(ÄÄÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§Ï(ÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈçΩ±Ω»µµ•‡°•∏ÅÕ…ùà±ŸÖ»†¥µ¡Öπï∞§Ä‰–î±—…ÖπÕ¡Ö…ïπ–§Ï(ÄÄÄÄÄÄÄÅâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†ƒ…¡‡§Ï(ÄÄÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒ—¡‡Ï(ÄÄÄÄÄÄÄÅÕç…Ω±±âÖ»µ›•ë—†ÈπΩπîÏ(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÄπ±ÃµÖëµ•∏µπÖÿËËµ›ïâ≠•–µÕç…Ω±±âÖ»ÅÏÅë•Õ¡±Ö‰ÈπΩπîÏÅÙ((ÄÄÄÄÄÄπ±ÃµÖëµ•∏µπÖÿÅâ’——Ω∏ÅÏ(ÄÄÄÄÄÄÄÅ›°•—îµÕ¡ÖçîÈπΩ›…Ö¿Ï(ÄÄÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ—…ÖπÕ¡Ö…ïπ–Ï(ÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ—…ÖπÕ¡Ö…ïπ–Ï(ÄÄÄÄÄÄÄÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ï(ÄÄÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒ¡¡‡Ï(ÄÄÄÄÄÄÄÅ¡Öëë•πúËÂ¡‡Äƒ…¡‡Ï(ÄÄÄÄÄÄÄÅç’…ÕΩ»È¡Ω•π—ï»Ï(ÄÄÄÄÄÄÄÅôΩπ–µôÖµ•±‰È•π°ï…•–Ï(ÄÄÄÄÄÄÄÅôΩπ–µÕ•ÈîËƒ¡¡‡Ï(ÄÄÄÄÄÄÄÅôΩπ–µ›ï•ù°–Ë‡‘¿Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÄπ±ÃµÖëµ•∏µπÖÿÅâ’——Ω∏πÖç—•ŸîÅÏ(ÄÄÄÄÄÄÄÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ï(ÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§Ï(ÄÄÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»ÈŸÖ»†¥µâΩ…ëï»§Ï(ÄÄÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä—¡‡ÄƒŸ¡‡Å…ùâÑ†¿∞¿∞¿∞∏ƒ‡§Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÄπ±ÃµÖëµ•∏µù…Ω’¿ÅÏ(ÄÄÄÄÄÄÄÅë•Õ¡±Ö‰ÈπΩπîÏ(ÄÄÄÄÄÄÄÅÖπ•µÖ—•Ω∏È±Õëµ•π…Ω’¡%∏Ä∏ƒŸÃÅïÖÕîÏ(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÄπ±ÃµÖëµ•∏µù…Ω’¿πÖç—•ŸîÅÏ(ÄÄÄÄÄÄÄÅë•Õ¡±Ö‰Èâ±Ωç¨Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÄπ±ÃµÖëµ•∏µù…Ω’¿Ä¯Å†ÃÈô•…Õ–µç°•±êÅÏ(ÄÄÄÄÄÄÄÅµÖ…ù•∏µ—Ω¿Ë—¡‡ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÅ≠ïÂô…ÖµïÃÅ±Õëµ•π…Ω’¡%∏ÅÏ(ÄÄÄÄÄÄÄÅô…Ω¥ÅÏÅΩ¡Öç•—‰Ë∏–‘ÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ïd†Õ¡‡§ÏÅÙ(ÄÄÄÄÄÄÄÅ—ºÅÏÅΩ¡Öç•—‰ËƒÏÅ—…ÖπÕôΩ…¥ÈπΩπîÏÅÙ(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÅµïë•Ñ°µÖ‡µ›•ë—†Ë‹¿¡¡‡§ÅÏ(ÄÄÄÄÄÄÄÄπ±ÃµÖëµ•∏µπÖÿÅÏ(ÄÄÄÄÄÄÄÄÄÅ—Ω¿Ë—¡‡Ï(ÄÄÄÄÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒ…¡‡Ï(ÄÄÄÄÄÄÄÄÄÅµÖ…ù•∏µ±ïô–Ë¥…¡‡Ï(ÄÄÄÄÄÄÄÄÄÅµÖ…ù•∏µ…•ù°–Ë¥…¡‡Ï(ÄÄÄÄÄÄÄÅÙ(ÄÄÄÄÄÄÄÄπ±ÃµÖëµ•∏µπÖÿÅâ’——Ω∏ÅÏ(ÄÄÄÄÄÄÄÄÄÅ¡Öëë•πúËÂ¡‡Äƒ¡¡‡Ï(ÄÄÄÄÄÄÄÅÙ(ÄÄÄÄÄÅÙ(ÄÄÄÅÄÏ(ÄÄÄÅëΩç’µïπ–π°ïÖêπÖ¡¡ïπë°•±ê°Õ—Â±î§Ï(ÄÅÙ((ÄÅçΩπÕ–Å—•—±îÄÙÅµÖ•∏π≈’ï…ÂMï±ïç—Ω»†àπ¡Öùîµ—•—±îà§Ï(ÄÅ•òÄ†Ö—•—±î§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅπÖÿÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âë•ÿà§Ï(ÄÅçΩπÕ–ÅÕïç’…•—Â!ïÖë•πùÕQï·–ÄÙÅ……Ö‰πô…Ω¥°µÖ•∏π≈’ï…ÂMï±ïç—Ω…±∞†â†Ãà§§(ÄÄÄÄπµÖ¿°†ÄÙ¯Å†π—ï·—Ωπ—ïπ–ÅÒÄàà§(ÄÄÄÄπ©Ω•∏†àÄà§Ï(ÄÅçΩπÕ–ÅŸ•ëïΩIï¡Ω…—Õ5Ö—ç†ÄÙÅÕïç’…•—Â!ïÖë•πùÕQï·–πµÖ—ç††ΩY•ëïΩÃÅ…ï¡Ω…—ÖëΩÕqÃ©p†°qê¨•p§Ω§§Ï(ÄÅçΩπÕ–ÅŸ•Õ•â±ïY•ëïΩIï¡Ω…—ÕΩ’π–ÄÙÅŸ•ëïΩIï¡Ω…—Õ5Ö—ç†Ä¸Å9’µâï»°Ÿ•ëïΩIï¡Ω…—Õ5Ö—ç°l≈t§ÄËÄ¿Ï(ÄÅπÖÿπç±ÖÕÕ9ÖµîÄÙÄâ±ÃµÖëµ•∏µπÖÿàÏ(ÄÅπÖÿπ•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒâ’——Ω∏ÅëÖ—ÑµÖëµ•∏µ—ÖàÙâ…ïÕ’µï∏àÅç±ÖÕÃÙâÖç—•ŸîàÅΩπç±•ç¨ÙâÕ›•—ç°ëµ•πAÖπï±…Ω’¿†ù…ïÕ’µï∏ú±—°•Ã§à˚¬~N(ÅIïÕ’µï∏Ωâ’——Ω∏¯(ÄÄÄÄÒâ’——Ω∏ÅëÖ—ÑµÖëµ•∏µ—ÖàÙâÕïù’…•ëÖêàÅΩπç±•ç¨ÙâÕ›•—ç°ëµ•πAÖπï±…Ω’¿†ùÕïù’…•ëÖêú±—°•Ã§à˚¬~j†ÅMïù’…•ëÖêëÌŸ•Õ•â±ïY•ëïΩIï¡Ω…—ÕΩ’π–Ä¸ÅÄÄ†ëÌŸ•Õ•â±ïY•ëïΩIï¡Ω…—ÕΩ’π—Ù•ÄÄËÄàâÙΩâ’——Ω∏¯(ÄÄÄÄÒâ’——Ω∏ÅëÖ—ÑµÖëµ•∏µ—ÖàÙâ’Õ’Ö…•ΩÃàÅΩπç±•ç¨ÙâÕ›•—ç°ëµ•πAÖπï±…Ω’¿†ù’Õ’Ö…•ΩÃú±—°•Ã§à˚¬~FîÅUÕ’Ö…•ΩÃΩâ’——Ω∏¯(ÄÄÄÄÒâ’——Ω∏ÅëÖ—ÑµÖëµ•∏µ—ÖàÙâô•πÖπÈÖÃàÅΩπç±•ç¨ÙâÕ›•—ç°ëµ•πAÖπï±…Ω’¿†ùô•πÖπÈÖÃú±—°•Ã§à˚¬~J¿Å•πÖπÈÖÃΩâ’——Ω∏¯(ÄÄÄÄÒâ’——Ω∏ÅëÖ—ÑµÖëµ•∏µ—ÖàÙâ—•ïπëÑàÅΩπç±•ç¨ÙâÕ›•—ç°ëµ•πAÖπï±…Ω’¿†ù—•ïπëÑú±—°•Ã§à˚¬~n7æ‚<ÅQ•ïπëÑΩâ’——Ω∏¯(ÄÄÄÄÒâ’——Ω∏ÅëÖ—ÑµÖëµ•∏µ—ÖàÙâÕ•Õ—ïµÑàÅΩπç±•ç¨ÙâÕ›•—ç°ëµ•πAÖπï±…Ω’¿†ùÕ•Õ—ïµÑú±—°•Ã§à˚äjgæ‚<ÅM•Õ—ïµÑΩâ’——Ω∏¯(ÄÅÄÏ((ÄÅ—•—±îπ•πÕï…—ë©Öçïπ—±ïµïπ–†âÖô—ï…ïπêà∞ÅπÖÿ§Ï((ÄÅçΩπÕ–ÅπΩëïÃÄÙÅ……Ö‰πô…Ω¥°µÖ•∏πç°•±ë…ï∏§πô•±—ï»°∏ÄÙ¯Å∏ÄÑÙÙÅ—•—±îÄòòÅ∏ÄÑÙÙÅπÖÿ§Ï((ÄÅçΩπÕ–Å°ïÖë•πù…Ω’¿ÄÙÅ—ï·–ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–ÅŸÖ±’îÄÙÅM—…•πú°—ï·–ÅÒÄàà§π—Ω1Ω›ï…ÖÕî†§Ï((ÄÄÄÅ•òÄ°ŸÖ±’îπ•πç±’ëïÃ†â…ï¡Ω…—ïÃÅëîÅÕïù’…•ëÖêà§ÅÒÅŸÖ±’îπ•πç±’ëïÃ†âŸ•ëïΩÃÅ…ï¡Ω…—ÖëΩÃà§§Å…ï—’…∏ÄâÕïù’…•ëÖêàÏ(ÄÄÄÅ•òÄ°ŸÖ±’îπ•πç±’ëïÃ†âÕΩ±•ç•—’ëïÃÅëîÅç…ïÖëΩ…ïÃà§ÅÒÅŸÖ±’îπ•πç±’ëïÃ†âç’ïπ—ÖÃÅπ’ïŸÖÃà§ÅÒÅŸÖ±’îπ•πç±’ëïÃ†ââ’ÕçÖ»Å‰ÅùïÕ—•ΩπÖ»à§§Å…ï—’…∏Äâ’Õ’Ö…•ΩÃàÏ(ÄÄÄÅ•òÄ°ŸÖ±’îπ•πç±’ëïÃ†âçïπ—…ºÅô•πÖπç•ï…ºÅï·¡ï…•µïπ—Ö∞à§ÅÒÅŸÖ±’îπ•πç±’ëïÃ†â¡ÖùΩÃÅëîÅÕ’Õç…•¡çßÕ∏à§ÅÒÅŸÖ±’îπ•πç±’ëïÃ†âçÖπ©ïÃÅ¡ïπë•ïπ—ïÃà§ÅÒÅŸÖ±’îπ•πç±’ëïÃ†â°•Õ—Ω…•Ö∞Å…ïç•ïπ—îà§§Å…ï—’…∏Äâô•πÖπÈÖÃàÏ(ÄÄÄÅ•òÄ°ŸÖ±’îπ•πç±’ëïÃ†â¡…ïç•ΩÃÅëîÅ±ÑÅ—•ïπëÑà§ÅÒÅŸÖ±’îπ•πç±’ëïÃ†âïµΩ©•ÃÅëîÅ±ÑÅ—•ïπëÑà§ÅÒ(ÄÄÄÄÄÄÄÅŸÖ±’îπ•πç±’ëïÃ†âµïëÖ±±ÖÃÅï·ç±’Õ•ŸÖÃà§ÅÒÅŸÖ±’îπ•πç±’ëïÃ†â”µ—’±ΩÃÅëîÅ¡ï…ô•∞à§ÅÒ(ÄÄÄÄÄÄÄÅŸÖ±’îπ•πç±’ëïÃ†âΩ—…ΩÃÅÖ…”µç’±ΩÃà§§Å…ï—’…∏Äâ—•ïπëÑàÏ(ÄÄÄÅ•òÄ°ŸÖ±’îπ•πç±’ëïÃ†âïŸïπ—ΩÃÅŸ•Õ’Ö±ïÃà§ÅÒÅŸÖ±’îπ•πç±’ëïÃ†âÖççïÕºÅÑÅâ•±±ï—ï…Ñà§ÅÒ(ÄÄÄÄÄÄÄÅŸÖ±’îπ•πç±’ëïÃ†âπΩŸïëÖëïÃÅ‰Å”•…µ•πΩÃà§ÅÒÅŸÖ±’îπ•πç±’ëïÃ†â…Öç°ÑÅÕïµÖπÖ∞à§§Å…ï—’…∏ÄâÕ•Õ—ïµÑàÏ((ÄÄÄÅ…ï—’…∏Äâ…ïÕ’µï∏àÏ(ÄÅÙÏ((ÄÅçΩπÕ–Åù…Ω’¡ÃÄÙÅÌÙÏ(ÄÅlâ…ïÕ’µï∏à∞âÕïù’…•ëÖêà∞â’Õ’Ö…•ΩÃà∞âô•πÖπÈÖÃà∞â—•ïπëÑà∞âÕ•Õ—ïµÑâtπôΩ…Öç†°≠ï‰ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–Åï∞ÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âë•ÿà§Ï(ÄÄÄÅï∞πç±ÖÕÕ9ÖµîÄÙÅÅ±ÃµÖëµ•∏µù…Ω’¿ÄëÌ≠ï‰ÄÙÙÙÄâ…ïÕ’µï∏àÄ¸ÄâÖç—•ŸîàÄËÄàâıÄÏ(ÄÄÄÅï∞πëÖ—ÖÕï–πÖëµ•π…Ω’¿ÄÙÅ≠ï‰Ï(ÄÄÄÅù…Ω’¡Õm≠ïÂtÄÙÅï∞Ï(ÄÄÄÅµÖ•∏πÖ¡¡ïπë°•±ê°ï∞§Ï(ÄÅÙ§Ï((ÄÅ±ï–Åç’……ïπ—…Ω’¿ÄÙÄâ…ïÕ’µï∏àÏ((ÄÅπΩëïÃπôΩ…Öç†°πΩëîÄÙ¯ÅÏ(ÄÄÄÅ•òÄ°πΩëîπ—Öù9ÖµîÄÙÙÙÄâ Ãà§ÅÏ(ÄÄÄÄÄÅç’……ïπ—…Ω’¿ÄÙÅ°ïÖë•πù…Ω’¿°πΩëîπ—ï·—Ωπ—ïπ–§Ï(ÄÄÄÅÙ(ÄÄÄÅù…Ω’¡Õmç’……ïπ—…Ω’¡tπÖ¡¡ïπë°•±ê°πΩëî§Ï(ÄÅÙ§Ï)Ù()ô’πç—•Ω∏ÅÕ›•—ç°ëµ•πAÖπï±…Ω’¿°ù…Ω’¿∞Åâ’——Ω∏§ÅÏ(ÄÅçΩπÕ–ÅµÖ•∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÖ¡¡Y•ï‹à§Ï(ÄÅ•òÄ†ÖµÖ•∏§Å…ï—’…∏Ï((ÄÅµÖ•∏π≈’ï…ÂMï±ïç—Ω…±∞†àπ±ÃµÖëµ•∏µù…Ω’¿à§πôΩ…Öç†°ï∞ÄÙ¯ÅÏ(ÄÄÄÅï∞πç±ÖÕÕ1•Õ–π—Ωùù±î†âÖç—•Ÿîà∞Åï∞πëÖ—ÖÕï–πÖëµ•π…Ω’¿ÄÙÙÙÅù…Ω’¿§Ï(ÄÅÙ§Ï((ÄÅµÖ•∏π≈’ï…ÂMï±ïç—Ω…±∞†àπ±ÃµÖëµ•∏µπÖÿÅâ’——Ω∏à§πôΩ…Öç†°â—∏ÄÙ¯ÅÏ(ÄÄÄÅâ—∏πç±ÖÕÕ1•Õ–π—Ωùù±î†âÖç—•Ÿîà∞Åâ—∏ÄÙÙÙÅâ’——Ω∏§Ï(ÄÅÙ§Ï((ÄÅ—…‰ÅÏ(ÄÄÄÅ›•πëΩ‹πÕç…Ω±±Qº°ÏÅ—Ω¿Ë¿∞Åâï°ÖŸ•Ω»ËâÕµΩΩ—†àÅÙ§Ï(ÄÅÙÅçÖ—ç†Ä°|§ÅÏ(ÄÄÄÅ›•πëΩ‹πÕç…Ω±±Qº†¿∞¿§Ï(ÄÅÙ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïï±ï—ïY•ëïº°Ÿ•ëïΩ%ê§ÅÏ(ÄÅ•òÄ†ÖçΩπô•…¥†ã
˝±•µ•πÖ»ÅïÕ—îÅŸ•ëïºÅ¡Ö…ÑÅÕ•ïµ¡…î¸ÅMîÅâΩ……Ö∏Å—Öµâß•∏ÅÕ’ÃÅ±•≠ïÃ∞ÅçΩµïπ—Ö…•ΩÃÅ‰Å…ï¡Ω…—ïÃ∏à§§Å…ï—’…∏Ï(ÄÅçΩπÕ–Åµïë•ÖQΩï±ï—îÄÙÅÖ›Ö•–Åùï—Y•ëïΩ5ïë•ÖΩ…±ïÖπ’¿°Ÿ•ëïΩ%ê§Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ëï±ï—ï}Ÿ•ëïºà∞ÅÏÅ¡}Ÿ•ëïΩ}•êËÅŸ•ëïΩ%êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅçΩπÕΩ±îπï……Ω»†âÖëµ•π}ëï±ï—ï}Ÿ•ëïºËà∞Åï……Ω»∞ÅëÖ—Ñ§Ï(ÄÄÄÅçΩπÕ–Åëï—Ö•∞ÄÙÅëÖ—Ñ¸πëï—Ö•∞ÅÒÅï……Ω»¸πµïÕÕÖùîÅÒÄâ……Ω»ÅëïÕçΩπΩç•ëºàÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°Å9ºÅÕîÅ¡’ëºÅï±•µ•πÖ»ËÄëÌëï—Ö•±ıÄ§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅÖ›Ö•–Åç±ïÖπ’¡H…Y•ëïΩ5ïë•Ñ°µïë•ÖQΩï±ï—î§Ï(ÄÅÕ°Ω›QΩÖÕ–†âY•ëïºÅï±•µ•πÖëºà§Ï(ÄÅ…ïπëï…ëµ•∏†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï•Õµ•ÕÕIï¡Ω…–°…ï¡Ω…—%ê§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ë•Õµ•ÕÕ}…ï¡Ω…–à∞ÅÏÅ¡}…ï¡Ω…—}•êËÅ…ï¡Ω…—%êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅëïÕçÖ…—Ö»à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–†âIï¡Ω…—îÅëïÕçÖ…—Öëºà§Ï(ÄÅ…ïπëï…ëµ•∏†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï¡¡…ΩŸïM’âÕç…•¡—•Ω∏°•ê§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Ö¡¡…ΩŸï}Õ’âÕç…•¡—•Ω∏à∞ÅÏÅ¡}…ï≈’ïÕ—}•êËÅ•êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅçΩπô•…µÖ»Åï∞Å¡Öùºà§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–†âAÖùºÅçΩπô•…µÖëº∞Å¡±Ö∏ÅÖç—•ŸÖëºà§Ï(ÄÅ…ïπëï…ëµ•∏†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïIï©ïç—M’âÕç…•¡—•Ω∏°•ê§ÅÏ(ÄÅ•òÄ†ÖçΩπô•…¥†ã
˝Iïç°ÖÈÖ»ÅïÕ—îÅ¡ÖùºÅëîÅÕ’Õç…•¡çßÕ∏¸à§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}…ï©ïç—}Õ’âÕç…•¡—•Ω∏à∞ÅÏÅ¡}…ï≈’ïÕ—}•êËÅ•êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅ…ïç°ÖÈÖ»à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–†âAÖùºÅ…ïç°ÖÈÖëºà§Ï(ÄÅ…ïπëï…ëµ•∏†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅΩ¡ïπµΩ©•A•ç≠ï»°—Ö…ùï—%π¡’—%ê∞Å±•Õ–§ÅÏ(ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µΩŸï…±Ö‰Å±ÃµµΩëÖ∞µ±Ωç≠ïêàÅÕ—Â±îÙâËµ•πëï‡Ëƒ–¿ÏàÅëÖ—ÑµµΩëÖ∞µ±Ωç≠ïêÙàƒà¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡àÅÕ—Â±îÙâµÖ‡µ›•ë—†ËÃÿ¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µ°ïÖëï»à¯Ò†»ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒŸ¡‡Ïà˘±ïü¥Å’πºΩ†»¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µâΩë‰à¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÏÅù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–†ÿ∞≈ô»§ÏÅùÖ¿Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌ±•Õ–πµÖ¿°îÄÙ¯ÅÄÒâ’——Ω∏ÅΩπç±•ç¨Ùâ¡•ç≠µΩ©§†úëÌ—Ö…ùï—%π¡’—%ëÙú∞úëÌïÙú§àÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»…¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅ¡Öëë•πúË·¡‡ÏÅç’…ÕΩ»È¡Ω•π—ï»Ïà¯ëÌïÙΩâ’——Ω∏˘Ä§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µôΩΩ—ï»à¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏàÅΩπç±•ç¨ÙâëΩç’µïπ–πùï—±ïµïπ—	Â%ê†ùù±ΩâÖ±5ΩëÖ±]…Ö¿ú§π•ππï…!Q50Ùúúà˘ï……Ö»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ô’πç—•Ω∏Å¡•ç≠µΩ©§°—Ö…ùï—%π¡’—%ê∞ÅïµΩ©§§ÅÏ(ÄÅçΩπÕ–Å•π¡’–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê°—Ö…ùï—%π¡’—%ê§Ï(ÄÅ•òÄ°•π¡’–§Å•π¡’–πŸÖ±’îÄÙÅïµΩ©§Ï(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§π•ππï…!Q50ÄÙÄààÏ)Ù()çΩπÕ–Å51}5=)%LÄÙÅlã¬~ñà∞ã¬~ñ à∞ã¬~ñ$à∞ã¬~>à∞ã¬~:[æ‚<à∞ã¬~>à∞ã¬~2|à∞ãä∂@à∞ãär†à∞ã¬~Rîà∞ã¬~J®à∞ã¬~FDà∞ã¬~:_æ‚<à∞ã¬~R¿à∞ã¬~JÄà∞ã¬~náæ‚<à∞ãäjÑà∞ã¬~:ºâtÏ)çΩπÕ–Å}5=)%LÄÙÅlã¬~b à∞ã¬~b8à∞ã¬~í§à∞ã¬~ñÃà∞ã¬~bà∞ã¬~íÄà∞ã¬~ñ‹à∞ã¬~íXà∞ã¬~FÙà∞ã¬~B@à∞ã¬~B$à∞ã¬~öà∞ã¬~Bºà∞ã¬~ö(à∞ã¬~öà∞ã¬~BËà∞ã¬~öà∞ã¬~ö$à∞ã¬~B‡à∞ã¬~Bàà∞ã¬~ö à∞ã¬~Bdà∞ã¬~öXà∞ã¬~öTà∞ã¬~FÏà∞ã¬~J à∞ã¬~:à∞ã¬~íÑà∞ã¬~FDà∞ã¬~J8à∞ã¬~Rîà∞ãäjÑà∞ã¬~2 à∞ã¬~6 à∞ã¬~:∏à∞ã¬~:úà∞ã¬~j à∞ã¬~n‡à∞ã¬~2dà∞ãäbæ‚<âtÏ()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖëM—…ïÖ≠ÖÂÕΩ…¥†§ÅÏ(ÄÅçΩπÕ–Å›ïï≠M—Ö…–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕ—…ïÖ≠]ïï≠M—Ö…–à§πŸÖ±’îÏ(ÄÅ•òÄ†Ö›ïï≠M—Ö…–§ÅÏÅÕ°Ω›QΩÖÕ–†â±ïü¥Å¡…•µï…ºÅ’πÑÅôïç°Ñà§ÏÅ…ï—’…∏ÏÅÙ((ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅï·•Õ—•πúÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ùï—}Õ—…ïÖ≠}…ï›Ö…ëÃà§Ï(ÄÅçΩπÕ–Åï·•Õ—•πùΩ…]ïï¨ÄÙÄ°ï·•Õ—•πúÅÒÅmt§πô•±—ï»°»ÄÙ¯Å»π›ïï≠}Õ—Ö…–ÄÙÙÙÅ›ïï≠M—Ö…–§Ï(ÄÅçΩπÕ–ÅâÂÖ‰ÄÙÅÌÙÏ(ÄÅï·•Õ—•πùΩ…]ïï¨πôΩ…Öç†°»ÄÙ¯ÅÏÅâÂÖÂm»πëÖÂ}π’µâï…tÄÙÅ»ÏÅÙ§Ï((ÄÅçΩπÕ–ÅôΩ…µ∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕ—…ïÖ≠ÖÂÕΩ…¥à§Ï(ÄÅôΩ…µ∞π•ππï…!Q50ÄÙÅ……Ö‰πô…Ω¥°ÏÅ±ïπù—†ËÄ‹ÅÙ∞Ä°|∞Å§§ÄÙ¯Å§Ä¨Äƒ§πµÖ¿°ëÖ‰ÄÙ¯ÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡ÏÅ¡Öëë•πúËƒ…¡‡Ïà¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÏÅôΩπ–µ›ï•ù°–Ëÿ¿¿ÏÅµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà˘µÑÄëÌëÖÂÙΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿Ë·¡‡ÏÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÏÅµÖ…ù•∏µâΩ——Ω¥Ë·¡‡ÏÅô±ï‡µ›…Ö¿È›…Ö¿Ïà¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâπ’µâï»àÅ•êÙâÕ—…ïÖ≠A—ÃëÌëÖÂÙàÅ¡±Öçï°Ω±ëï»Ùâ¡’π—ΩÃàÅŸÖ±’îÙàëÌâÂÖÂmëÖÂt¸π¡Ω•π—ÃÄ¸¸ÄàâÙàÅÕ—Â±îÙâ›•ë—†Ë‰¡¡‡ÏÅ¡Öëë•πúË·¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâÕ—…ïÖ≠	Öëùï9ÖµîëÌëÖÂÙàÅ¡±Öçï°Ω±ëï»ÙâπΩµâ…îÅµïëÖ±±ÑÄ°Ω¡ç•ΩπÖ∞§àÅŸÖ±’îÙàëÌïÕçÖ¡ï!—µ∞°âÂÖÂmëÖÂt¸πâÖëùï}πÖµîÅÒÄàà•ÙàÅÕ—Â±îÙâô±ï‡ËƒÏÅµ•∏µ›•ë—†Ëƒ»¡¡‡ÏÅ¡Öëë•πúË·¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâÕ—…ïÖ≠	Öëùï%çΩ∏ëÌëÖÂÙàÅ¡±Öçï°Ω±ëï»Ùã¬~>àÅµÖ·±ïπù—†Ùà–àÅŸÖ±’îÙàëÌïÕçÖ¡ï!—µ∞°âÂÖÂmëÖÂt¸πâÖëùï}•çΩ∏ÅÒÄàà•ÙàÅÕ—Â±îÙâ›•ë—†Ë‘¡¡‡ÏÅ¡Öëë•πúË·¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÏÅ—ï·–µÖ±•ù∏Èçïπ—ï»Ïà¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË·¡‡Äƒ¡¡‡ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏàÅΩπç±•ç¨ÙâΩ¡ïπµΩ©•A•ç≠ï»†ùÕ—…ïÖ≠	Öëùï%çΩ∏ëÌëÖÂÙú∞Å51}5=)%L§à˘±ïù•»Ωâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿Ë·¡‡ÏÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µùΩ±êµë•¥§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅ¡Öëë•πúË·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒÕ¡Ö∏ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÏÅ›°•—îµÕ¡ÖçîÈπΩ›…Ö¿Ïà˚¬~:ÅµΩ©§Å≈’îÅÕîÅùÖπÑÅù…Ö—•ÃÅïÕîÅìµÑËΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâ—ï·–àÅ•êÙâÕ—…ïÖ≠µΩ©•Iï›Ö…êëÌëÖÂÙàÅ¡±Öçï°Ω±ëï»Ùâï®ËÉ¬~B$àÅµÖ·±ïπù—†Ùà–àÅŸÖ±’îÙàëÌïÕçÖ¡ï!—µ∞°âÂÖÂmëÖÂt¸πïµΩ©•}…ï›Ö…êÅÒÄàà•ÙàÅÕ—Â±îÙâ›•ë—†Ëÿ¡¡‡ÏÅ¡Öëë•πúËŸ¡‡ÏÅâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅâΩ…ëï»µ…Öë•’ÃËŸ¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÏÅ—ï·–µÖ±•ù∏Èçïπ—ï»Ïà¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Å—Â¡îÙââ’——Ω∏àÅç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúËŸ¡‡Äƒ¡¡‡ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏàÅΩπç±•ç¨ÙâΩ¡ïπµΩ©•A•ç≠ï»†ùÕ—…ïÖ≠µΩ©•Iï›Ö…êëÌëÖÂÙú∞Å}5=)%L§à˘±ïù•»Ωâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯(ÄÅÄ§π©Ω•∏†àà§Ä¨ÅÄ(ÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿Ë·¡‡ÏÅµÖ…ù•∏µ—Ω¿Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅÕ—Â±îÙâô±ï‡ËƒÏàÅΩπç±•ç¨ÙâÕÖŸïM—…ïÖ≠]ïï¨†§à˘’Ö…ëÖ»Å—ΩëÑÅ±ÑÅÕïµÖπÑΩâ’——Ω∏¯(ÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâçÖπçï±M—…ïÖ≠Ω…¥†§à˘Öπçï±Ö»Ωâ’——Ω∏¯(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ô’πç—•Ω∏ÅçÖπçï±M—…ïÖ≠Ω…¥†§ÅÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕ—…ïÖ≠ÖÂÕΩ…¥à§π•ππï…!Q50ÄÙÄààÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕ—…ïÖ≠]ïï≠M—Ö…–à§πŸÖ±’îÄÙÄààÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅÕÖŸïM—…ïÖ≠]ïï¨†§ÅÏ(ÄÅçΩπÕ–Å›ïï≠M—Ö…–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕ—…ïÖ≠]ïï≠M—Ö…–à§πŸÖ±’îÏ(ÄÅçΩπÕ–Å…ïÕ’±—∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕ—…ïÖ≠MÖŸïIïÕ’±–à§Ï(ÄÅ…ïÕ’±—∞π—ï·—Ωπ—ïπ–ÄÙÄâ’Ö…ëÖπëº∏∏∏àÏ((ÄÅôΩ»Ä°±ï–ÅëÖ‰ÄÙÄƒÏÅëÖ‰ÄÙÄ‹ÏÅëÖ‰¨¨§ÅÏ(ÄÄÄÅçΩπÕ–Å¡Ω•π—ÃÄÙÅ¡Ö…Õï%π–°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê°ÅÕ—…ïÖ≠A—ÃëÌëÖÂıÄ§πŸÖ±’î∞Äƒ¿§ÅÒÄ¿Ï(ÄÄÄÅçΩπÕ–ÅâÖëùï9ÖµîÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê°ÅÕ—…ïÖ≠	Öëùï9ÖµîëÌëÖÂıÄ§πŸÖ±’îπ—…•¥†§Ï(ÄÄÄÅçΩπÕ–ÅâÖëùï%çΩ∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê°ÅÕ—…ïÖ≠	Öëùï%çΩ∏ëÌëÖÂıÄ§πŸÖ±’îπ—…•¥†§Ï(ÄÄÄÅçΩπÕ–ÅïµΩ©•Iï›Ö…êÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê°ÅÕ—…ïÖ≠µΩ©•Iï›Ö…êëÌëÖÂıÄ§πŸÖ±’îπ—…•¥†§Ï((ÄÄÄÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Õï—}Õ—…ïÖ≠}…ï›Ö…êà∞ÅÏ(ÄÄÄÄÄÅ¡}›ïï≠}Õ—Ö…–ËÅ›ïï≠M—Ö…–∞(ÄÄÄÄÄÅ¡}ëÖ‰ËÅëÖ‰∞(ÄÄÄÄÄÅ¡}¡Ω•π—ÃËÅ¡Ω•π—Ã∞(ÄÄÄÄÄÅ¡}âÖëùï}πÖµîËÅâÖëùï9Öµî∞(ÄÄÄÄÄÅ¡}âÖëùï}•çΩ∏ËÅâÖëùï%çΩ∏∞(ÄÄÄÄÄÅ¡}ïµΩ©•}…ï›Ö…êËÅïµΩ©•Iï›Ö…ê(ÄÄÄÅÙ§Ï(ÄÅÙ((ÄÅ…ïÕ’±—∞π—ï·—Ωπ—ïπ–ÄÙÄààÏ(ÄÅÕ°Ω›QΩÖÕ–†âMïµÖπÑÅù’Ö…ëÖëÑà§Ï(ÄÅ±ΩÖëM—…ïÖ≠]ïï≠Õ=Ÿï…Ÿ•ï‹†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖëM—…ïÖ≠]ïï≠Õ=Ÿï…Ÿ•ï‹†§ÅÏ(ÄÅçΩπÕ–Åï∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕ—…ïÖ≠]ïï≠Õ=Ÿï…Ÿ•ï‹à§Ï(ÄÅ•òÄ†Öï∞§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÏÅëÖ—ÑÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ùï—}Õ—…ïÖ≠}…ï›Ö…ëÃà§Ï(ÄÅ•òÄ†ÖëÖ—ÑÅÒÄÖëÖ—Ñπ±ïπù—†§ÅÏÅï∞π•ππï…!Q50ÄÙÄààÏÅ…ï—’…∏ÏÅÙ((ÄÅçΩπÕ–ÅâÂ]ïï¨ÄÙÅÌÙÏ(ÄÅëÖ—ÑπôΩ…Öç†°»ÄÙ¯ÅÏ(ÄÄÄÅâÂ]ïï≠m»π›ïï≠}Õ—Ö…—tÄÙÅâÂ]ïï≠m»π›ïï≠}Õ—Ö…—tÅÒÅmtÏ(ÄÄÄÅâÂ]ïï≠m»π›ïï≠}Õ—Ö…—tπ¡’Õ†°»§Ï(ÄÅÙ§Ï((ÄÅï∞π•ππï…!Q50ÄÙÅÄÒ†–ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ—¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà˘MïµÖπÖÃÅÂÑÅçÖ…ùÖëÖÃËΩ†–˘ÄÄ¨(ÄÄÄÅ=â©ïç–π≠ïÂÃ°âÂ]ïï¨§πÕΩ…–†§π…ïŸï…Õî†§πµÖ¿°›ïï¨ÄÙ¯ÅÄ(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ïëùï»µ…Ω‹à¯(ÄÄÄÄÄÄÄÄÒÕ¡Ö∏˘MïµÖπÑÅëï∞ÄëÌπï‹ÅÖ—î°›ïï¨Ä¨ÄâP¿¿Ë¿¿Ë¿¿à§π—Ω1ΩçÖ±ïÖ—ïM—…•πú†âïÃµHà•ÙÉäPÄëÌâÂ]ïï≠m›ïï≠tπ±ïπù—°Ùº‹ÅìµÖÃÅçÖ…ùÖëΩÃΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Äƒ¡¡‡ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÏàÅΩπç±•ç¨Ùâ°Öπë±ïï±ï—ïM—…ïÖ≠]ïï¨†úëÌ›ïï≠Ùú§à˚¬~^DÅ±•µ•πÖ»Ωâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÅÄ§π©Ω•∏†àà§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïï±ï—ïM—…ïÖ≠]ïï¨°›ïï≠M—Ö…–§ÅÏ(ÄÅ•òÄ†ÖçΩπô•…¥°É
˝±•µ•πÖ»Å—ΩëÑÅ±ÑÅçΩπô•ù’…ÖçßÕ∏ÅëîÅ±ÑÅÕïµÖπÑÅëï∞ÄëÌπï‹ÅÖ—î°›ïï≠M—Ö…–Ä¨ÄâP¿¿Ë¿¿Ë¿¿à§π—Ω1ΩçÖ±ïÖ—ïM—…•πú†âïÃµHà•Ù˝Ä§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ëï±ï—ï}Õ—…ïÖ≠}›ïï¨à∞ÅÏÅ¡}›ïï≠}Õ—Ö…–ËÅ›ïï≠M—Ö…–ÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅï±•µ•πÖ»à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–†âMïµÖπÑÅï±•µ•πÖëÑà§Ï(ÄÅ±ΩÖëM—…ïÖ≠]ïï≠Õ=Ÿï…Ÿ•ï‹†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖëM—Ω…ïµΩ©•Õ1•Õ–†§ÅÏ(ÄÅçΩπÕ–Åï∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕ—Ω…ïµΩ©•Õ1•Õ–à§Ï(ÄÅ•òÄ†Öï∞§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÏÅëÖ—ÑÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ùï—}Õ—Ω…ï}ïµΩ©•Ãà§Ï(ÄÅ•òÄ†ÖëÖ—ÑÅÒÄÖëÖ—Ñπ±ïπù—†§ÅÏÅï∞π•ππï…!Q50ÄÙÅÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒ…¡‡Ïà˘QΩëÖ€µÑÅπºÅçÖ…ùÖÕ—îÅπ•πüÈ∏ÅïµΩ©§∏Ω¿˘ÄÏÅ…ï—’…∏ÏÅÙ((ÄÅï∞π•ππï…!Q50ÄÙÅëÖ—ÑπµÖ¿°îÄÙ¯ÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ïëùï»µ…Ω‹à¯(ÄÄÄÄÄÄÒÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄëÌîπïµΩ©•ÙÄëÌïÕçÖ¡ï!—µ∞°îππÖµî•Ù(ÄÄÄÄÄÄÄÉ
‹ÄÒÕ¡Ö∏Åç±ÖÕÃÙàëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â±ÖÕÃ°îπ…Ö…•—‰ÅÒÄâçΩµ’∏à•Ùà¯ëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â1Öâï∞°îπ…Ö…•—‰ÅÒÄâçΩµ’∏à•ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÉ
‹ÄÒÕ¡Ö∏Åç±ÖÕÃÙâµΩπºà¯ëÌ9’µâï»°îπ¡…•çï}¡Ω•π—Ã§ÄÙÙÙÄ¿Ä¸ÄâIQ%LàÄËÅÄëÌîπ¡…•çï}¡Ω•π—ÕÙÅ¡—ÕÅÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄëÌîπ•Õ}±•µ•—ïêÄ¸ÅÄÉ
‹ÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÌôΩπ–µ›ï•ù°–Ë‡¿¿Ïà˘1%5%QÄëÌ5Ö—†πµÖ‡†¿∞Å9’µâï»°îπÕ—Ωç≠}—Ω—Ö∞ÅÒÄ¿§µ9’µâï»°îπÕ—Ωç≠}ÕΩ±êÅÒÄ¿§•ÙºëÌîπÕ—Ωç≠}—Ω—Ö±ÙΩÕ¡Ö∏˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄëÏÖîπÖç—•ŸîÄ¸ÄúÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà¯°ëïÕÖç—•ŸÖëº§ΩÕ¡Ö∏¯úÄËÄàâÙ(ÄÄÄÄÄÄΩÕ¡Ö∏¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿ËŸ¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Ä·¡‡ÏÅôΩπ–µÕ•ÈîËƒ≈¡‡ÏàÅΩπç±•ç¨Ùâ°Öπë±ïQΩùù±ïM—Ω…ïµΩ©§†úëÌîπ•ëÙú∞ÄëÏÖîπÖç—•ŸïÙ§à¯ëÌîπÖç—•ŸîÄ¸ÄâïÕÖç—•ŸÖ»àÄËÄâç—•ŸÖ»âÙΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Ä·¡‡ÏÅôΩπ–µÕ•ÈîËƒ≈¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÏàÅΩπç±•ç¨Ùâ°Öπë±ïï±ï—ïM—Ω…ïµΩ©§†úëÌîπ•ëÙú§à˚¬~^DΩâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯(ÄÅÄ§π©Ω•∏†àà§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïëëM—Ω…ïµΩ©§†§ÅÏ(ÄÅçΩπÕ–ÅïµΩ©§ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›µΩ©•°Ö»à§πŸÖ±’îπ—…•¥†§Ï(ÄÅçΩπÕ–ÅπÖµîÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›µΩ©•9Öµîà§πŸÖ±’îπ—…•¥†§Ï(ÄÅçΩπÕ–Å¡…•çîÄÙÅ9’µâï»°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›µΩ©•A…•çîà§πŸÖ±’îÅÒÄ¿§Ï(ÄÅçΩπÕ–Å…Ö…•—‰ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›µΩ©•IÖ…•—‰à§¸πŸÖ±’îÅÒÄâçΩµ’∏àÏ(ÄÅçΩπÕ–Å•Õ1•µ•—ïêÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›µΩ©•ë•—•Ω∏à§¸πŸÖ±’îÄÙÙÙÄâ±•µ•—ïêàÏ(ÄÅçΩπÕ–ÅÕ—Ωç¨ÄÙÅ9’µâï»°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›µΩ©•M—Ωç¨à§¸πŸÖ±’îÅÒÄ¿§Ï((ÄÅ•òÄ†ÖïµΩ©§ÅÒÄÖπÖµîÅÒÅ9’µâï»π•Õ9Ö8°¡…•çî§ÅÒÅ¡…•çîÄÄ¿§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†âΩµ¡±ï”ÑÅïµΩ©§∞ÅπΩµâ…îÅ‰Å¡…ïç•ºà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅ•òÄ°•Õ1•µ•—ïêÄòòÅÕ—Ωç¨ÄÄƒ§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â%πë•èÑÅï∞ÅÕ—Ωç¨ÅëîÅ±ÑÅïë•çßÕ∏Å±•µ•—ÖëÑà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Öëë}Õ—Ω…ï}ïµΩ©§à∞ÅÏ(ÄÄÄÅ¡}ïµΩ©§ËÅïµΩ©§∞(ÄÄÄÅ¡}πÖµîËÅπÖµî∞(ÄÄÄÅ¡}¡…•çîËÅ5Ö—†πô±ΩΩ»°¡…•çî§∞(ÄÄÄÅ¡}…Ö…•—‰ËÅ…Ö…•—‰∞(ÄÄÄÅ¡}•Õ}±•µ•—ïêËÅ•Õ1•µ•—ïê∞(ÄÄÄÅ¡}Õ—Ωç≠}—Ω—Ö∞ËÅ•Õ1•µ•—ïêÄ¸Å5Ö—†πô±ΩΩ»°Õ—Ωç¨§ÄËÅπ’±∞(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°ëÖ—Ñ¸πï……Ω»ÄÙÙÙÄâë’¡±•çÖ—ï}ïµΩ©§àÄ¸ÄâÕîÅïµΩ©§ÅÂÑÅï·•Õ—îàÄËÄâ9ºÅÕîÅ¡’ëºÅÖù…ïùÖ»à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›µΩ©•°Ö»à§πŸÖ±’îÄÙÄààÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›µΩ©•9Öµîà§πŸÖ±’îÄÙÄààÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›µΩ©•A…•çîà§πŸÖ±’îÄÙÄààÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›µΩ©•IÖ…•—‰à§πŸÖ±’îÄÙÄâçΩµ’∏àÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›µΩ©•ë•—•Ω∏à§πŸÖ±’îÄÙÄâÕ—ÖπëÖ…êàÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›µΩ©•M—Ωç¨à§πŸÖ±’îÄÙÄààÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›µΩ©•M—Ωç¨à§πë•ÕÖâ±ïêÄÙÅ—…’îÏ((ÄÅÕ°Ω›QΩÖÕ–°•Õ1•µ•—ïêÄ¸Äã¬~b8ÅµΩ©§Å±•µ•—ÖëºÅç…ïÖëºàÄËÄâµΩ©§ÅÖù…ïùÖëºà§Ï(ÄÅ±ΩÖëM—Ω…ïµΩ©•Õ1•Õ–†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïQΩùù±ïM—Ω…ïµΩ©§°•ê∞Åπï›ç—•Ÿî§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}—Ωùù±ï}Õ—Ω…ï}ïµΩ©§à∞ÅÏÅ¡}•êËÅ•ê∞Å¡}Öç—•ŸîËÅπï›ç—•ŸîÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅçÖµâ•Ö»à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅ±ΩÖëM—Ω…ïµΩ©•Õ1•Õ–†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïï±ï—ïM—Ω…ïµΩ©§°•ê§ÅÏ(ÄÅ•òÄ†ÖçΩπô•…¥†ã
˝±•µ•πÖ»ÅïÕ—îÅïµΩ©§Åëï∞ÅçÖ”Ö±Ωùº¸ÅE’•ï∏ÅÂÑÅ±ºÅçΩµ¡ÀÃÅ±ºÅçΩπÕï…ŸÑÅ•ù’Ö∞∏à§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ëï±ï—ï}Õ—Ω…ï}ïµΩ©§à∞ÅÏÅ¡}•êËÅ•êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅï±•µ•πÖ»à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–†âµΩ©§Åï±•µ•πÖëºà§Ï(ÄÅ±ΩÖëM—Ω…ïµΩ©•Õ1•Õ–†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖëM—Ω…ïA…•çïÃ†§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—ÑÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ùï—}Õ—Ω…ï}¡…•çïÃà§Ï(ÄÅ•òÄ†ÖëÖ—ÑÅÒÄÖëÖ—ÑπΩ¨ÅÒÄÖëÖ—Ñπ¡…•çïÃ§Å…ï—’…∏Ï(ÄÅçΩπÕ–Å¿ÄÙÅëÖ—Ñπ¡…•çïÃÏ(ÄÅ•òÄ°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡…•çï	ΩΩÕ—A±’Ãà§§ÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡…•çï	ΩΩÕ—A±’Ãà§πŸÖ±’îÄÙÅ¿πâΩΩÕ—}¡…•çï}¡±’ÃÅÒÄààÏ(ÄÅ•òÄ°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡…•çï	ΩΩÕ—•ÖµÖπ—îà§§ÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡…•çï	ΩΩÕ—•ÖµÖπ—îà§πŸÖ±’îÄÙÅ¿πâΩΩÕ—}¡…•çï}ë•ÖµÖπ—îÅÒÄààÏ(ÄÅ•òÄ°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡…•çïA±ÖπA±’Ãà§§ÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡…•çïA±ÖπA±’Ãà§πŸÖ±’îÄÙÅ¿π¡±Öπ}’¡ù…Öëï}¡…•çï}¡±’ÃÅÒÄààÏ(ÄÅ•òÄ°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡…•çïA±Öπ•ÖµÖπ—îà§§ÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡…•çïA±Öπ•ÖµÖπ—îà§πŸÖ±’îÄÙÅ¿π¡±Öπ}’¡ù…Öëï}¡…•çï}ë•ÖµÖπ—îÅÒÄààÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïMÖŸïM—Ω…ïA…•çïÃ†§ÅÏ(ÄÅçΩπÕ–ÅâΩΩÕ—A±’ÃÄÙÅ¡Ö…Õï%π–°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡…•çï	ΩΩÕ—A±’Ãà§πŸÖ±’î∞Äƒ¿§Ï(ÄÅçΩπÕ–ÅâΩΩÕ—•ÖµÖπ—îÄÙÅ¡Ö…Õï%π–°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡…•çï	ΩΩÕ—•ÖµÖπ—îà§πŸÖ±’î∞Äƒ¿§Ï(ÄÅçΩπÕ–Å¡±ÖπA±’ÃÄÙÅ¡Ö…Õï%π–°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡…•çïA±ÖπA±’Ãà§πŸÖ±’î∞Äƒ¿§Ï(ÄÅçΩπÕ–Å¡±Öπ•ÖµÖπ—îÄÙÅ¡Ö…Õï%π–°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡…•çïA±Öπ•ÖµÖπ—îà§πŸÖ±’î∞Äƒ¿§Ï((ÄÅ•òÄ°mâΩΩÕ—A±’Ã∞ÅâΩΩÕ—•ÖµÖπ—î∞Å¡±ÖπA±’Ã∞Å¡±Öπ•ÖµÖπ—ïtπÕΩµî°∏ÄÙ¯Å•Õ9Ö8°∏§ÅÒÅ∏ÄÄ¿§§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†âIïŸ•œÑÅ≈’îÅ±ΩÃÄ–Å¡…ïç•ΩÃÅÕïÖ∏ÅªÈµï…ΩÃÅ€Ö±•ëΩÃà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Õï—}Õ—Ω…ï}¡…•çïÃà∞ÅÏ(ÄÄÄÅ¡}âΩΩÕ—}¡…•çï}¡±’ÃËÅâΩΩÕ—A±’Ã∞(ÄÄÄÅ¡}âΩΩÕ—}¡…•çï}ë•ÖµÖπ—îËÅâΩΩÕ—•ÖµÖπ—î∞(ÄÄÄÅ¡}¡±Öπ}¡…•çï}¡±’ÃËÅ¡±ÖπA±’Ã∞(ÄÄÄÅ¡}¡±Öπ}¡…•çï}ë•ÖµÖπ—îËÅ¡±Öπ•ÖµÖπ—î∞(ÄÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ë•ï…Ω∏Åù’Ö…ëÖ»Å±ΩÃÅ¡…ïç•ΩÃà§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–†âA…ïç•ΩÃÅÖç—’Ö±•ÈÖëΩÃà§Ï)Ù(()ô’πç—•Ω∏Åùï—1•µ•—ïëM—Ωç≠M—Ö—’Ã°âÖëùî§ÅÏ(ÄÅ•òÄ†ÖâÖëùî¸π•Õ}±•µ•—ïê§Å…ï—’…∏ÄààÏ((ÄÅçΩπÕ–Å—Ω—Ö∞ÄÙÅ5Ö—†πµÖ‡†¿∞Å9’µâï»°âÖëùîπÕ—Ωç≠}—Ω—Ö∞ÅÒÄ¿§§Ï(ÄÅçΩπÕ–ÅÕΩ±êÄÙÅ5Ö—†πµÖ‡†¿∞Å9’µâï»°âÖëùîπÕ—Ωç≠}ÕΩ±êÅÒÄ¿§§Ï(ÄÅçΩπÕ–Å±ïô–ÄÙÅ5Ö—†πµÖ‡†¿∞Å—Ω—Ö∞Ä¥ÅÕΩ±ê§Ï((ÄÅ•òÄ°±ïô–ÄÙÙÙÄ¿§Å…ï—’…∏ÄâÕΩ±ëΩ’–àÏ(ÄÅ•òÄ°±ïô–ÄÙÙÙÄƒ§Å…ï—’…∏Äâ±ÖÕ–àÏ(ÄÅ•òÄ°±ïô–ÄÙÄ‘§Å…ï—’…∏Äâ±Ω‹àÏ(ÄÅ…ï—’…∏ÄààÏ)Ù()ô’πç—•Ω∏Åùï—M—Ω…ï	ÖëùïIÖ…•—Â1Öâï∞°…Ö…•—‰§ÅÏ(ÄÅ…ï—’…∏Ä°Ï(ÄÄÄÅçΩµ’∏ËâΩ∑È∏à∞(ÄÄÄÅ…Ö…ÑËâIÖ…Ñà∞(ÄÄÄÅï¡•çÑËã%¡•çÑà∞(ÄÄÄÅ±ïùïπëÖ…•ÑËâ1ïùïπëÖ…•Ñà∞(ÄÄÄÅï·ç±’Õ•ŸÑËâ·ç±’Õ•ŸÑà∞(ÄÄÄÅµ•—•çÑËâ7µ—•çÑà(ÄÅÙ•m…Ö…•—ÂtÅÒÄâΩ∑È∏àÏ)Ù()ô’πç—•Ω∏Åùï—M—Ω…ï	ÖëùïIÖ…•—Â±ÖÕÃ°…Ö…•—‰§ÅÏ(ÄÅ…ï—’…∏ÅÅ±Ãµ…Ö…•—‰¥ëÌlâçΩµ’∏à∞â…Ö…Ñà∞âï¡•çÑà∞â±ïùïπëÖ…•Ñà∞âï·ç±’Õ•ŸÑà∞âµ•—•çÑâtπ•πç±’ëïÃ°…Ö…•—‰§Ä¸Å…Ö…•—‰ÄËÄâçΩµ’∏âıÄÏ)Ù()ô’πç—•Ω∏Å…ïπëï…1•ŸïMç…Ω±∞Ÿ5Â—°•ç5ΩëÖ∞°•Õ=ôô•ç•Ö±Iï›Ö…êÄÙÅôÖ±Õî§ÅÏ(ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ•òÄ†Ö›…Ö¿ÅÒÄÖëΩç’µïπ–πëΩç’µïπ—±ïµïπ–πç±ÖÕÕ1•Õ–πçΩπ—Ö•πÃ†â±ÃÿµùΩ±ëï∏µ¡…ïŸ•ï‹à§§Å…ï—’…∏Ï(ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µΩŸï…±Ö‰Å±ÃµµΩëÖ∞µ±Ωç≠ïêÅ±ÃÿµµÂ—°•åµ¡…ïŸ•ï‹µΩŸï…±Ö‰àÅÕ—Â±îÙâËµ•πëï‡Ë»ÿ¿ÏàÅëÖ—ÑµµΩëÖ∞µ±Ωç≠ïêÙàƒà¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡Å±ÃÿµµÂ—°•åµ¡…ïŸ•ï‹µâΩ‡à¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µâΩë‰à¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ãÿµ¡…ïŸ•ï‹µ±Öâï∞à¯ëÌ•Õ=ôô•ç•Ö±Iï›Ö…êÄ¸ÄâI=5A9MÅM	1=EUÉ
‹ÅQUeÅAIÅM%5AIàÄËÄâY%MQÅAIY%É
‹ÅQ=[5Å9<Å9QIâÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃÿµµÂ—°•åµµïëÖ∞Å±Ãµï≈’•¡¡ïêµµïëÖ∞Å±ÃµµïëÖ∞µ…Ö…•—‰µµ•—•çÑàÅÖ…•Ñµ±Öâï∞Ùâ5ïëÖ±±ÑÅ∑µ—•çÑÅ’πëÖëΩ»ÅëîÅ±ÑÅ9’ïŸÑÅ…Ñà¯ÒÕ¡Ö∏¯ÿΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃÿµµÂ—°•åµ…Ö…•—‰à˘511Å75Q%Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒ†»˘’πëÖëΩ»ÅëîÅ±ÑÅ9’ïŸÑÅ…ÑΩ†»¯(ÄÄÄÄÄÄÄÄÄÄÒ¿¯ëÌ•Õ=ôô•ç•Ö±Iï›Ö…êÄ¸ÄâÕ—’Ÿ•Õ—îÅ¡…ïÕïπ—îÅï∏Åï∞ÅçΩµ•ïπÈºÅëîÅ±ÑÅ9’ïŸÑÅ…Ñ∏àÄËÄâIïçΩµ¡ïπÕÑÉÈπ•çÑÅëï∞Å±ÖπÈÖµ•ïπ—ºÅëîÅ1•ŸïMç…Ω±∞Äÿ∏âÙΩ¿¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ãÿµ±Ö’πç†µ›•πëΩ‹à¯Òà¯ëÌ•Õ=ôô•ç•Ö±Iï›Ö…êÄ¸Äâ=	Q9%àÄËÄà‹Å5LâÙΩà¯ÒÕ¡Ö∏¯ëÌ•Õ=ôô•ç•Ö±Iï›Ö…êÄ¸ÄâÂÑÅôΩ…µÑÅ¡Ö…—îÅ¡ï…µÖπïπ—îÅëîÅ—‘ÅçΩ±ïççßÕ∏àÄËÄâ¡Ö…ÑÅçΩπÕïù’•…±ÑÅëïÕëîÅï∞Å±ÖπÈÖµ•ïπ—ºâÙΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒÕµÖ±∞¯ëÌ•Õ=ôô•ç•Ö±Iï›Ö…êÄ¸ÄâÃÉÈπ•çÑÅ¡Ω»Åç’ïπ—Ñ∞ÅπºÅ¡’ïëîÅçΩµ¡…Ö…Õî∞ÅŸïπëï…ÕîÅπ§Å—…ÖπÕôï…•…Õî∏àÄËÄâïÕ¡◊•ÃÅëïÕÖ¡Ö…ïçîÅ¡Ö…ÑÅ≈’•ïπïÃÅπºÅ±ÑÅΩâ—’Ÿ•ï…Ω∏∏ÅE’•ï∏Å±ÑÅùÖπîÅ±ÑÅçΩπÕï…ŸÑÅ¡Ö…ÑÅÕ•ïµ¡…î∏âÙΩÕµÖ±∞¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨ÙâëΩç’µïπ–πùï—±ïµïπ—	Â%ê†ùù±ΩâÖ±5ΩëÖ±]…Ö¿ú§π•ππï…!Q50Ùúúà˘=9Q%9UHÅÅ1%YMI=10ÄÿΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ô’πç—•Ω∏ÅΩ¡ïπ1•ŸïMç…Ω±∞Ÿ5Â—°•çA…ïŸ•ï‹†§ÅÏ(ÄÅ…ïπëï…1•ŸïMç…Ω±∞Ÿ5Â—°•ç5ΩëÖ∞°ôÖ±Õî§Ï)Ù()ô’πç—•Ω∏Å≈’ï’ï1•ŸïMç…Ω±∞Ÿ5Â—°•çIï›Ö…ëIïŸïÖ∞†§ÅÏ(ÄÅ±ï–ÅÖ——ïµ¡—ÃÄÙÄ¿Ï(ÄÅçΩπÕ–Å—…ÂIïŸïÖ∞ÄÙÄ†§ÄÙ¯ÅÏ(ÄÄÄÅÖ——ïµ¡—ÃÄ¨ÙÄƒÏ(ÄÄÄÅçΩπÕ–Å¡Ω…—Ö±Y•Õ•â±îÄÙÄÑÖëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÃŸ1Ö’πç°AΩ…—Ö∞à§Ï(ÄÄÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÄÄÅçΩπÕ–ÅÖπΩ—°ï…5ΩëÖ±Y•Õ•â±îÄÙÄÑÖM—…•πú°›…Ö¿¸π•ππï…!Q50ÅÒÄàà§π—…•¥†§Ï(ÄÄÄÅ•òÄ†Ö¡Ω…—Ö±Y•Õ•â±îÄòòÄÖÖπΩ—°ï…5ΩëÖ±Y•Õ•â±î§ÅÏ(ÄÄÄÄÄÅ…ïπëï…1•ŸïMç…Ω±∞Ÿ5Â—°•ç5ΩëÖ∞°—…’î§Ï(ÄÄÄÄÄÅ…ï—’…∏Ï(ÄÄÄÅÙ(ÄÄÄÅ•òÄ°Ö——ïµ¡—ÃÄÄ–¿§ÅÕï—Q•µïΩ’–°—…ÂIïŸïÖ∞∞Ä‹‘¿§Ï(ÄÅÙÏ(ÄÅÕï—Q•µïΩ’–°—…ÂIïŸïÖ∞∞Ä‰¿¿§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Åç±Ö•µ1•ŸïMç…Ω±∞Ÿ1Ö’πç°Iï›Ö…ê†§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—UÕï»¸π•êÅÒÅ›•πëΩ‹π}}±ÃŸ1Ö’πç°±Ö•µ——ïµ¡—ïëΩ»ÄÙÙÙÅç’……ïπ—UÕï»π•ê§Å…ï—’…∏Ï(ÄÅ›•πëΩ‹π}}±ÃŸ1Ö’πç°±Ö•µ——ïµ¡—ïëΩ»ÄÙÅç’……ïπ—UÕï»π•êÏ(ÄÅ—…‰ÅÏ(ÄÄÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âç±Ö•µ}±•ŸïÕç…Ω±∞Ÿ}±Ö’πç°}…ï›Ö…êà§Ï(ÄÄÄÅ•òÄ°ï……Ω»§ÅÏ(ÄÄÄÄÄÅçΩπÕΩ±îπ›Ö…∏†âIïçΩµ¡ïπÕÑÅ1•ŸïMç…Ω±∞ÄÿÅπºÅë•Õ¡Ωπ•â±îËà∞Åï……Ω»πµïÕÕÖùîÅÒÅï……Ω»§Ï(ÄÄÄÄÄÅ…ï—’…∏Ï(ÄÄÄÅÙ(ÄÄÄÅ•òÄ°ëÖ—Ñ¸πΩ¨ÄòòÅëÖ—Ñ¸πç±Ö•µïê§ÅÏ(ÄÄÄÄÄÅ›•πëΩ‹π}}µÂA…Ωô•±ï	ÖëùïÃÄÙÅπ’±∞Ï(ÄÄÄÄÄÅ≈’ï’ï1•ŸïMç…Ω±∞Ÿ5Â—°•çIï›Ö…ëIïŸïÖ∞†§Ï(ÄÄÄÅÙ(ÄÅÙÅçÖ—ç†Ä°ï……Ω»§ÅÏ(ÄÄÄÅçΩπÕΩ±îπ›Ö…∏†â9ºÅÕîÅ¡’ëºÅçΩµ¡…ΩâÖ»Å±ÑÅ…ïçΩµ¡ïπÕÑÅ1•ŸïMç…Ω±∞ÄÿËà∞Åï……Ω»§Ï(ÄÅÙ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖëM—Ω…ï	ÖëùïÕëµ•π1•Õ–†§ÅÏ(ÄÅçΩπÕ–Åï∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕ—Ω…ï	ÖëùïÕëµ•π1•Õ–à§Ï(ÄÅ•òÄ†Öï∞§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ùï—}Õ—Ω…ï}âÖëùïÃà§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸π±ïπù—†§ÅÏ(ÄÄÄÅï∞π•ππï…!Q50ÄÙÅÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîËƒ…¡‡Ïà˘QΩëÖ€µÑÅπºÅç…ïÖÕ—îÅµïëÖ±±ÖÃÅëîÅ—•ïπëÑ∏Ω¿˘ÄÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅï∞π•ππï…!Q50ÄÙÅëÖ—ÑπµÖ¿°àÄÙ¯ÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ïëùï»µ…Ω‹à¯(ÄÄÄÄÄÄÒÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄëÌàπâÖëùï}•çΩ∏ÅÒÄã¬~>âÙÄëÌïÕçÖ¡ï!—µ∞°àπâÖëùï}πÖµî•Ù(ÄÄÄÄÄÄÄÉ
‹ÄÒÕ¡Ö∏Åç±ÖÕÃÙàëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â±ÖÕÃ°àπ…Ö…•—‰•Ùà¯ëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â1Öâï∞°àπ…Ö…•—‰•ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÉ
‹ÄÒÕ¡Ö∏Åç±ÖÕÃÙâµΩπºà¯ëÌàπ¡…•çï}¡Ω•π—ÕÙÅ¡—ÃΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄëÌàπ•Õ}±•µ•—ïêÄ¸ÅÄÉ
‹ÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÌôΩπ–µ›ï•ù°–Ë‡¿¿Ïà˘1%5%QÄëÌ5Ö—†πµÖ‡†¿∞Å9’µâï»°àπÕ—Ωç≠}—Ω—Ö∞ÅÒÄ¿§Ä¥Å9’µâï»°àπÕ—Ωç≠}ÕΩ±êÅÒÄ¿§•ÙºëÌàπÕ—Ωç≠}—Ω—Ö±ÙΩÕ¡Ö∏˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄëÏÖàπÖç—•ŸîÄ¸ÅÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà¯°ëïÕÖç—•ŸÖëÑ§ΩÕ¡Ö∏˘ÄÄËÄàâÙ(ÄÄÄÄÄÄΩÕ¡Ö∏¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌùÖ¿ËŸ¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Ä·¡‡ÌôΩπ–µÕ•ÈîËƒ≈¡‡Ïà(ÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨ÙâΩ¡ïπë•—M—Ω…ï	Öëùî†úëÌàπ•ëÙú§à˚är?æ‚<Åë•—Ö»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Ä·¡‡ÌôΩπ–µÕ•ÈîËƒ≈¡‡Ïà(ÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨Ùâ°Öπë±ïQΩùù±ïM—Ω…ï	Öëùî†úëÌàπ•ëÙú∞ÄëÏÖàπÖç—•ŸïÙ§à¯ëÌàπÖç—•ŸîÄ¸ÄâïÕÖç—•ŸÖ»àÄËÄâç—•ŸÖ»âÙΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Ä·¡‡ÌôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ…ïê§Ïà(ÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨Ùâ°Öπë±ïï±ï—ïM—Ω…ï	Öëùî†úëÌàπ•ëÙú§à˚¬~^DΩâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯(ÄÅÄ§π©Ω•∏†àà§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïëëM—Ω…ï	Öëùî†§ÅÏ(ÄÅçΩπÕ–Å•çΩ∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›M—Ω…ï	Öëùï%çΩ∏à§¸πŸÖ±’îπ—…•¥†§ÅÒÄààÏ(ÄÅçΩπÕ–ÅπÖµîÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›M—Ω…ï	Öëùï9Öµîà§¸πŸÖ±’îπ—…•¥†§ÅÒÄààÏ(ÄÅçΩπÕ–ÅëïÕç…•¡—•Ω∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›M—Ω…ï	ÖëùïïÕç…•¡—•Ω∏à§¸πŸÖ±’îπ—…•¥†§ÅÒÄààÏ(ÄÅçΩπÕ–Å…Ö…•—‰ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›M—Ω…ï	ÖëùïIÖ…•—‰à§¸πŸÖ±’îÅÒÄâçΩµ’∏àÏ(ÄÅçΩπÕ–Å¡…•çîÄÙÅ9’µâï»°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›M—Ω…ï	ÖëùïA…•çîà§¸πŸÖ±’îÅÒÄ¿§Ï(ÄÅçΩπÕ–Å•Õ1•µ•—ïêÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›M—Ω…ï	Öëùïë•—•Ω∏à§¸πŸÖ±’îÄÙÙÙÄâ±•µ•—ïêàÏ(ÄÅçΩπÕ–ÅÕ—Ωç¨ÄÙÅ9’µâï»°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›M—Ω…ï	ÖëùïM—Ωç¨à§¸πŸÖ±’îÅÒÄ¿§Ï((ÄÅ•òÄ†Ö•çΩ∏ÅÒÄÖπÖµîÅÒÅ9’µâï»π•Õ9Ö8°¡…•çî§ÅÒÅ¡…•çîÄÄ¿§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†âΩµ¡±ï”ÑÉµçΩπº∞ÅπΩµâ…îÅ‰Å¡…ïç•ºà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅ•òÄ°•Õ1•µ•—ïêÄòòÅÕ—Ωç¨ÄÄƒ§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â%πë•èÑÅç◊Öπ—ÖÃÅ’π•ëÖëïÃÅ—ïπëÀÑÅ±ÑÅïë•çßÕ∏Å±•µ•—ÖëÑà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Öëë}Õ—Ω…ï}âÖëùîà∞ÅÏ(ÄÄÄÅ¡}âÖëùï}•çΩ∏ËÅ•çΩ∏∞(ÄÄÄÅ¡}âÖëùï}πÖµîËÅπÖµî∞(ÄÄÄÅ¡}ëïÕç…•¡—•Ω∏ËÅëïÕç…•¡—•Ω∏∞(ÄÄÄÅ¡}…Ö…•—‰ËÅ…Ö…•—‰∞(ÄÄÄÅ¡}¡…•çï}¡Ω•π—ÃËÅ5Ö—†πô±ΩΩ»°¡…•çî§∞(ÄÄÄÅ¡}•Õ}±•µ•—ïêËÅ•Õ1•µ•—ïê∞(ÄÄÄÅ¡}Õ—Ωç≠}—Ω—Ö∞ËÅ•Õ1•µ•—ïêÄ¸Å5Ö—†πô±ΩΩ»°Õ—Ωç¨§ÄËÅπ’±∞(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°ëÖ—Ñ¸πï……Ω»ÄÙÙÙÄâë’¡±•çÖ—ï}πÖµîàÄ¸ÄâeÑÅï·•Õ—îÅ’πÑÅµïëÖ±±ÑÅçΩ∏ÅïÕîÅπΩµâ…îàÄËÄâ9ºÅÕîÅ¡’ëºÅç…ïÖ»à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›M—Ω…ï	Öëùï%çΩ∏à§πŸÖ±’îÄÙÄààÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›M—Ω…ï	Öëùï9Öµîà§πŸÖ±’îÄÙÄààÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›M—Ω…ï	ÖëùïïÕç…•¡—•Ω∏à§πŸÖ±’îÄÙÄààÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›M—Ω…ï	ÖëùïA…•çîà§πŸÖ±’îÄÙÄààÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›M—Ω…ï	Öëùïë•—•Ω∏à§πŸÖ±’îÄÙÄâÕ—ÖπëÖ…êàÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›M—Ω…ï	ÖëùïM—Ωç¨à§πŸÖ±’îÄÙÄààÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›M—Ω…ï	ÖëùïM—Ωç¨à§πë•ÕÖâ±ïêÄÙÅ—…’îÏ(ÄÅÕ°Ω›QΩÖÕ–°•Õ1•µ•—ïêÄ¸Äã¬~J8Åë•çßÕ∏Å±•µ•—ÖëÑÅç…ïÖëÑàÄËÄã¬~>Å5ïëÖ±±ÑÅç…ïÖëÑà§Ï(ÄÅ±ΩÖëM—Ω…ï	ÖëùïÕëµ•π1•Õ–†§Ï)Ù(()ÖÕÂπåÅô’πç—•Ω∏ÅΩ¡ïπë•—M—Ω…ï	Öëùî°•ê§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ùï—}Õ—Ω…ï}âÖëùïÃà§Ï(ÄÅ•òÄ°ï……Ω»§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅçÖ…ùÖ»Å±ÑÅµïëÖ±±Ñà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅâÖëùîÄÙÄ°ëÖ—ÑÅÒÅmt§πô•πê°àÄÙ¯Åàπ•êÄÙÙÙÅ•ê§Ï(ÄÅ•òÄ†ÖâÖëùî§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â5ïëÖ±±ÑÅπºÅïπçΩπ—…ÖëÑà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅ•òÄ†Ö›…Ö¿§Å…ï—’…∏Ï((ÄÅ›…Ö¿π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µΩŸï…±Ö‰Å±ÃµµΩëÖ∞µ±Ωç≠ïêàÅÕ—Â±îÙâËµ•πëï‡Ë»ÿ¿ÏàÅëÖ—ÑµµΩëÖ∞µ±Ωç≠ïêÙàƒà¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡àÅÕ—Â±îÙâµÖ‡µ›•ë—†Ë––¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µ°ïÖëï»àÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒ†»ÅÕ—Â±îÙâµÖ…ù•∏Ë¿ÌôΩπ–µÕ•ÈîËƒ·¡‡Ïà˚är?æ‚<Åë•—Ö»ÅµïëÖ±±ÑΩ†»¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿ËÕ¡‡Ïà˘AΩì•ÃÅçÖµâ•Ö»ÅÕ’ÃÅëÖ—ΩÃÅÕ•∏ÅâΩ……Ö…±Ñ∏Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏ÅΩπç±•ç¨ÙâëΩç’µïπ–πùï—±ïµïπ—	Â%ê†ùù±ΩâÖ±5ΩëÖ±]…Ö¿ú§π•ππï…!Q50Ùúúà(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙââÖç≠ù…Ω’πêÈπΩπîÌâΩ…ëï»Ë¿ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîËƒÂ¡‡Ìç’…ÕΩ»È¡Ω•π—ï»Ïà˚ärTΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µâΩë‰à¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË‹¡¡‡Ä≈ô»ÌùÖ¿Ë·¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å•êÙâïë•—M—Ω…ï	Öëùï%çΩ∏àÅŸÖ±’îÙàëÌïÕçÖ¡ï!—µ∞°âÖëùîπâÖëùï}•çΩ∏ÅÒÄã¬~>à•ÙàÅµÖ·±ïπù—†Ùà‡à(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ì—ï·–µÖ±•ù∏Èçïπ—ï»ÌôΩπ–µÕ•ÈîË»¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å•êÙâïë•—M—Ω…ï	Öëùï9ÖµîàÅŸÖ±’îÙàëÌïÕçÖ¡ï!—µ∞°âÖëùîπâÖëùï}πÖµîÅÒÄàà•Ùà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÒ—ï·—Ö…ïÑÅ•êÙâïë•—M—Ω…ï	ÖëùïïÕç…•¡—•Ω∏àÅ…Ω›ÃÙà»àÅµÖ·±ïπù—†Ùàƒ‡¿à(ÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÌ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ì…ïÕ•ÈîÈŸï…—•çÖ∞ÌµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà¯ëÌïÕçÖ¡ï!—µ∞°âÖëùîπëïÕç…•¡—•Ω∏ÅÒÄàà•ÙΩ—ï·—Ö…ïÑ¯((ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË≈ô»ÄƒÃ¡¡‡ÌùÖ¿Ë·¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕï±ïç–Å•êÙâïë•—M—Ω…ï	ÖëùïIÖ…•—‰à(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌlâçΩµ’∏à∞â…Ö…Ñà∞âï¡•çÑà∞â±ïùïπëÖ…•Ñà∞âï·ç±’Õ•ŸÑâtπµÖ¿°»ÄÙ¯ÅÄÒΩ¡—•Ω∏ÅŸÖ±’îÙàëÌ…ÙàÄëÌâÖëùîπ…Ö…•—‰ÙÙı»Ä¸ÄâÕï±ïç—ïêàÄËÄàâÙ¯ëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â1Öâï∞°»•ÙΩΩ¡—•Ω∏˘Ä§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄΩÕï±ïç–¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâπ’µâï»àÅ•êÙâïë•—M—Ω…ï	ÖëùïA…•çîàÅµ•∏Ùà¿àÅŸÖ±’îÙàëÌ9’µâï»°âÖëùîπ¡…•çï}¡Ω•π—ÃÅÒÄ¿•Ùà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË≈ô»ÄƒÃ¡¡‡ÌùÖ¿Ë·¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕï±ïç–Å•êÙâïë•—M—Ω…ï	Öëùïë•—•Ω∏à(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩπç°ÖπùîÙâëΩç’µïπ–πùï—±ïµïπ—	Â%ê†ùïë•—M—Ω…ï	ÖëùïM—Ωç¨ú§πë•ÕÖâ±ïêı—°•ÃπŸÖ±’îÑÙÙù±•µ•—ïêúÏà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâÕ—ÖπëÖ…êàÄëÌâÖëùîπ•Õ}±•µ•—ïêÄ¸ÄààÄËÄâÕï±ïç—ïêâÙ˘ë•çßÕ∏ÅπΩ…µÖ∞ΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâ±•µ•—ïêàÄëÌâÖëùîπ•Õ}±•µ•—ïêÄ¸ÄâÕï±ïç—ïêàÄËÄàâÙ˘ë•çßÕ∏Å±•µ•—ÖëÑΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄΩÕï±ïç–¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Å—Â¡îÙâπ’µâï»àÅ•êÙâïë•—M—Ω…ï	ÖëùïM—Ωç¨àÅµ•∏ÙàëÌ5Ö—†πµÖ‡†ƒ∞Å9’µâï»°âÖëùîπÕ—Ωç≠}ÕΩ±êÅÒÄ¿§•Ùà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅŸÖ±’îÙàëÌâÖëùîπ•Õ}±•µ•—ïêÄ¸Å9’µâï»°âÖëùîπÕ—Ωç≠}—Ω—Ö∞ÅÒÄƒ§ÄËÄàâÙà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌâÖëùîπ•Õ}±•µ•—ïêÄ¸ÄààÄËÄâë•ÕÖâ±ïêâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúËƒ¡¡‡ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÌâΩ…ëï»µ…Öë•’ÃË·¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄëÌâÖëùîπ•Õ}±•µ•—ïêÄ¸ÅÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÂ¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿ËŸ¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÅeÑÅ…ïç±ÖµÖëÖÃΩçΩµ¡…ÖëÖÃËÄëÌ9’µâï»°âÖëùîπÕ—Ωç≠}ÕΩ±êÅÒÄ¿•Ù∏Å∞ÅÕ—Ωç¨Å—Ω—Ö∞ÅπºÅ¡’ïëîÅ≈’ïëÖ»Å¡Ω»ÅëïâÖ©ºÅëîÅïÕîÅªÈµï…º∏(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩëÖ∞µâΩ‡µôΩΩ—ï»àÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌùÖ¿ËÂ¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâô±ï‡ËƒÏàÅΩπç±•ç¨Ùâç±ΩÕï5ÖπÖùïë5ΩëÖ∞†§à˘Öπçï±Ö»Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅÕ—Â±îÙâô±ï‡ËƒÏàÅΩπç±•ç¨Ùâ°Öπë±ïMÖŸïM—Ω…ï	Öëùïë•–†úëÌâÖëùîπ•ëÙú§à˘’Ö…ëÖ»ÅçÖµâ•ΩÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïMÖŸïM—Ω…ï	Öëùïë•–°•ê§ÅÏ(ÄÅçΩπÕ–Å•çΩ∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âïë•—M—Ω…ï	Öëùï%çΩ∏à§¸πŸÖ±’îπ—…•¥†§ÅÒÄààÏ(ÄÅçΩπÕ–ÅπÖµîÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âïë•—M—Ω…ï	Öëùï9Öµîà§¸πŸÖ±’îπ—…•¥†§ÅÒÄààÏ(ÄÅçΩπÕ–ÅëïÕç…•¡—•Ω∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âïë•—M—Ω…ï	ÖëùïïÕç…•¡—•Ω∏à§¸πŸÖ±’îπ—…•¥†§ÅÒÄààÏ(ÄÅçΩπÕ–Å…Ö…•—‰ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âïë•—M—Ω…ï	ÖëùïIÖ…•—‰à§¸πŸÖ±’îÅÒÄâçΩµ’∏àÏ(ÄÅçΩπÕ–Å¡…•çîÄÙÅ9’µâï»°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âïë•—M—Ω…ï	ÖëùïA…•çîà§¸πŸÖ±’îÅÒÄ¿§Ï(ÄÅçΩπÕ–Å•Õ1•µ•—ïêÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âïë•—M—Ω…ï	Öëùïë•—•Ω∏à§¸πŸÖ±’îÄÙÙÙÄâ±•µ•—ïêàÏ(ÄÅçΩπÕ–ÅÕ—Ωç¨ÄÙÅ9’µâï»°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âïë•—M—Ω…ï	ÖëùïM—Ωç¨à§¸πŸÖ±’îÅÒÄ¿§Ï((ÄÅ•òÄ†Ö•çΩ∏ÅÒÄÖπÖµîÅÒÅ9’µâï»π•Õ9Ö8°¡…•çî§ÅÒÅ¡…•çîÄÄ¿§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†âIïŸ•œÑÉµçΩπº∞ÅπΩµâ…îÅ‰Å¡…ïç•ºà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅ•òÄ°•Õ1•µ•—ïêÄòòÅÕ—Ωç¨ÄÄƒ§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â1ÑÅïë•çßÕ∏Å±•µ•—ÖëÑÅπïçïÕ•—ÑÅÕ—Ωç¨à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}’¡ëÖ—ï}Õ—Ω…ï}âÖëùîà∞ÅÏ(ÄÄÄÅ¡}âÖëùï}•êËÅ•ê∞(ÄÄÄÅ¡}âÖëùï}•çΩ∏ËÅ•çΩ∏∞(ÄÄÄÅ¡}âÖëùï}πÖµîËÅπÖµî∞(ÄÄÄÅ¡}ëïÕç…•¡—•Ω∏ËÅëïÕç…•¡—•Ω∏∞(ÄÄÄÅ¡}…Ö…•—‰ËÅ…Ö…•—‰∞(ÄÄÄÅ¡}¡…•çï}¡Ω•π—ÃËÅ5Ö—†πô±ΩΩ»°¡…•çî§∞(ÄÄÄÅ¡}•Õ}±•µ•—ïêËÅ•Õ1•µ•—ïê∞(ÄÄÄÅ¡}Õ—Ωç≠}—Ω—Ö∞ËÅ•Õ1•µ•—ïêÄ¸Å5Ö—†πô±ΩΩ»°Õ—Ωç¨§ÄËÅπ’±∞(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅçΩπÕ–ÅµïÕÕÖùïÃÄÙÅÏ(ÄÄÄÄÄÅë’¡±•çÖ—ï}πÖµîËâeÑÅï·•Õ—îÅΩ—…ÑÅµïëÖ±±ÑÅçΩ∏ÅïÕîÅπΩµâ…îà∞(ÄÄÄÄÄÅÕ—Ωç≠}âï±Ω›}ÕΩ±êËâ∞ÅÕ—Ωç¨Å—Ω—Ö∞ÅπºÅ¡’ïëîÅÕï»ÅµïπΩ»ÅÑÅ±ºÅÂÑÅïπ—…ïùÖëºà∞(ÄÄÄÄÄÅ•πŸÖ±•ë}¡…•çîËâ∞Å¡…ïç•ºÅπºÅ¡’ïëîÅÕï»ÅπïùÖ—•Ÿºà∞(ÄÄÄÄÄÅ•πŸÖ±•ë}Õ—Ωç¨ËâIïŸ•œÑÅï∞ÅÕ—Ωç¨à(ÄÄÄÅÙÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°µïÕÕÖùïÕmëÖ—Ñ¸πï……Ω…tÅÒÄâ9ºÅÕîÅ¡’ëºÅù’Ö…ëÖ»à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§π•ππï…!Q50ÄÙÄààÏ(ÄÅÕ°Ω›QΩÖÕ–†ã¬~>Å5ïëÖ±±ÑÅÖç—’Ö±•ÈÖëÑà§Ï(ÄÅ±ΩÖëM—Ω…ï	ÖëùïÕëµ•π1•Õ–†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïQΩùù±ïM—Ω…ï	Öëùî°•ê∞ÅÖç—•Ÿî§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}—Ωùù±ï}Õ—Ω…ï}âÖëùîà∞ÅÏ(ÄÄÄÅ¡}âÖëùï}•êËÅ•ê∞(ÄÄÄÅ¡}Öç—•ŸîËÅÖç—•Ÿî(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅçÖµâ•Ö»à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅ±ΩÖëM—Ω…ï	ÖëùïÕëµ•π1•Õ–†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïï±ï—ïM—Ω…ï	Öëùî°•ê§ÅÏ(ÄÅ•òÄ†ÖçΩπô•…¥†ã
˝±•µ•πÖ»ÅïÕ—ÑÅµïëÖ±±ÑÅëîÅ±ÑÅ—•ïπëÑ¸ÅE’•ïπïÃÅÂÑÅ±ÑÅçΩµ¡…Ö…Ω∏Å±ÑÅçΩπÕï…ŸÖ∏∏à§§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ëï±ï—ï}Õ—Ω…ï}âÖëùîà∞ÅÏ(ÄÄÄÅ¡}âÖëùï}•êËÅ•ê(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅï±•µ•πÖ»à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅÕ°Ω›QΩÖÕ–†â5ïëÖ±±ÑÅï±•µ•πÖëÑÅëîÅ±ÑÅ—•ïπëÑà§Ï(ÄÅ±ΩÖëM—Ω…ï	ÖëùïÕëµ•π1•Õ–†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖëM—Ω…ï%—ïµÕ1•Õ–†§ÅÏ(ÄÅçΩπÕ–Åï∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕ—Ω…ï%—ïµÕ1•Õ–à§Ï(ÄÅ•òÄ†Öï∞§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÏÅëÖ—ÑÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ùï—}Õ—Ω…ï}•—ïµÃà§Ï(ÄÅ•òÄ†ÖëÖ—ÑÅÒÄÖëÖ—Ñπ±ïπù—†§ÅÏÅï∞π•ππï…!Q50ÄÙÅÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒ…¡‡Ïà˘QΩëÖ€µÑÅπºÅçÖ…ùÖÕ—îÅπ•πüÈ∏ÅÖ…”µç’±ºÅπ’ïŸº∏Ω¿˘ÄÏÅ…ï—’…∏ÏÅÙ((ÄÅï∞π•ππï…!Q50ÄÙÅëÖ—ÑπµÖ¿°•–ÄÙ¯ÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ïëùï»µ…Ω‹à¯(ÄÄÄÄÄÄÒÕ¡Ö∏¯ëÌ•–π•çΩπÙÄëÌïÕçÖ¡ï!—µ∞°•–ππÖµî•ÙÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒ≈¡‡Ïà¯†ëÌïÕçÖ¡ï!—µ∞°•–πçÖ—ïùΩ…‰•Ù§ΩÕ¡Ö∏¯É
‹ÄÒÕ¡Ö∏Åç±ÖÕÃÙâµΩπºà¯ëÌ•–π¡…•çï}¡Ω•π—ÕÙÅ¡—ÃΩÕ¡Ö∏¯ÄëÏÖ•–πÖç—•ŸîÄ¸ÄúÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà¯°ëïÕÖç—•ŸÖëº§ΩÕ¡Ö∏¯úÄËÄàâÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿ËŸ¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Ä·¡‡ÏÅôΩπ–µÕ•ÈîËƒ≈¡‡ÏàÅΩπç±•ç¨Ùâ°Öπë±ïQΩùù±ïM—Ω…ï%—ï¥†úëÌ•–π•—ïµ}•ëÙú∞ÄëÏÖ•–πÖç—•ŸïÙ§à¯ëÌ•–πÖç—•ŸîÄ¸ÄâïÕÖç—•ŸÖ»àÄËÄâç—•ŸÖ»âÙΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Ä·¡‡ÏÅôΩπ–µÕ•ÈîËƒ≈¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÏàÅΩπç±•ç¨Ùâ°Öπë±ïï±ï—ïM—Ω…ï%—ï¥†úëÌ•–π•—ïµ}•ëÙú§à˚¬~^DΩâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯(ÄÅÄ§π©Ω•∏†àà§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖëA…Ωô•±ïQ•—±ïÕëµ•π1•Õ–†§ÅÏ(ÄÅçΩπÕ–Åï∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡…Ωô•±ïQ•—±ïÕëµ•π1•Õ–à§Ï(ÄÅ•òÄ†Öï∞§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅmÏÅëÖ—Ñ∞Åï……Ω»ÅÙ∞ÅÏÅëÖ—ÑËÅ…Ö…•—ÂIΩ›ÃÅıtÄÙÅÖ›Ö•–ÅA…Ωµ•ÕîπÖ±∞°l(ÄÄÄÅÕàπ…¡å†âÖëµ•π}ùï—}Õ—Ω…ï}•—ïµÃà§∞(ÄÄÄÅÕàπô…Ω¥†âÕ—Ω…ï}•—ïµÃà§πÕï±ïç–†â•ê±…Ö…•—‰à§πïƒ†âçÖ—ïùΩ…‰à∞Äâ—•—±îà§(ÄÅt§Ï(ÄÅ•òÄ°ï……Ω»§ÅÏ(ÄÄÄÅï∞π•ππï…!Q50ÄÙÅÄÒ¿Åç±ÖÕÃÙâï……Ω»µµÕúà˘9ºÅÕîÅ¡’ë•ï…Ω∏ÅçÖ…ùÖ»Å±ΩÃÅ”µ—’±ΩÃ∏Ω¿˘ÄÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–Å…Ö…•—Â	Â%êÄÙÅπï‹Å5Ö¿†°…Ö…•—ÂIΩ›ÃÅÒÅmt§πµÖ¿°…Ω‹ÄÙ¯Åm…Ω‹π•ê∞ÅπΩ…µÖ±•ÈïA…Ωô•±ïQ•—±ïIÖ…•—‰°…Ω‹π…Ö…•—‰•t§§Ï(ÄÅçΩπÕ–Å—•—±ïÃÄÙÄ°ëÖ—ÑÅÒÅmt§(ÄÄÄÄπô•±—ï»°•–ÄÙ¯ÅM—…•πú°•–πçÖ—ïùΩ…‰ÅÒÄàà§π—Ω1Ω›ï…ÖÕî†§ÄÙÙÙÄâ—•—±îà§(ÄÄÄÄπµÖ¿°•–ÄÙ¯Ä°Ï(ÄÄÄÄÄÄ∏∏π•–∞(ÄÄÄÄÄÅ…Ö…•—‰È…Ö…•—Â	Â%êπùï–°•–π•—ïµ}•êÅÒÅ•–π•ê§ÅÒÅπΩ…µÖ±•ÈïA…Ωô•±ïQ•—±ïIÖ…•—‰°•–π…Ö…•—‰§(ÄÄÄÅÙ§§Ï((ÄÅ•òÄ†Ö—•—±ïÃπ±ïπù—†§ÅÏ(ÄÄÄÅï∞π•ππï…!Q50ÄÙÅÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîËƒ…¡‡Ïà˘QΩëÖ€µÑÅπºÅç…ïÖÕ—îÅ”µ—’±ΩÃÅëîÅ¡ï…ô•∞∏Ω¿˘ÄÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅï∞π•ππï…!Q50ÄÙÅ—•—±ïÃπµÖ¿°•–ÄÙ¯ÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ïëùï»µ…Ω‹à¯(ÄÄÄÄÄÄÒÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄëÌ•–π•çΩ∏ÅÒÄã¬~>ﬂæ‚<âÙÄëÌïÕçÖ¡ï!—µ∞°•–ππÖµî•Ù(ÄÄÄÄÄÄÄÉ
‹ÄÒÕ¡Ö∏Åç±ÖÕÃÙàëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â±ÖÕÃ°πΩ…µÖ±•ÈïA…Ωô•±ïQ•—±ïIÖ…•—‰°•–π…Ö…•—‰§•ÙàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ¡¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿Ì—ï·–µ—…ÖπÕôΩ…¥È’¡¡ï…çÖÕîÏà¯ëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â1Öâï∞°πΩ…µÖ±•ÈïA…Ωô•±ïQ•—±ïIÖ…•—‰°•–π…Ö…•—‰§•ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÉ
‹ÄÒÕ¡Ö∏Åç±ÖÕÃÙâµΩπºà¯ëÌ•–π¡…•çï}¡Ω•π—ÕÙÅ¡—ÃΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄëÏÖ•–πÖç—•ŸîÄ¸ÄúÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà¯°ëïÕÖç—•ŸÖëº§ΩÕ¡Ö∏¯úÄËÄàâÙ(ÄÄÄÄÄÄΩÕ¡Ö∏¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÌùÖ¿ËŸ¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒÕï±ïç–(ÄÄÄÄÄÄÄÄÄÅ•êÙâ¡…Ωô•±ïQ•—±ïIÖ…•—‰¥ëÌ•–π•—ïµ}•ëÙà(ÄÄÄÄÄÄÄÄÄÅç±ÖÕÃÙàëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â±ÖÕÃ°πΩ…µÖ±•ÈïA…Ωô•±ïQ•—±ïIÖ…•—‰°•–π…Ö…•—‰§•Ùà(ÄÄÄÄÄÄÄÄÄÅΩπç°ÖπùîÙâ°Öπë±ïMÖŸïA…Ωô•±ïQ•—±ïIÖ…•—Âëµ•∏†úëÌ•–π•—ïµ}•ëÙú∞Å—°•ÃπŸÖ±’î§à(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Ä›¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿ÌâÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅç’……ïπ—Ω±Ω»ÌâΩ…ëï»µ…Öë•’ÃË›¡‡Ïà(ÄÄÄÄÄÄÄÄÄÅ—•—±îÙâÖµâ•Ö»Å…Ö…ïÈÑà(ÄÄÄÄÄÄÄÄ¯(ÄÄÄÄÄÄÄÄÄÄëÌlâçΩµ’∏à∞â…Ö…Ñà∞âï¡•çÑà∞â±ïùïπëÖ…•Ñà∞âï·ç±’Õ•ŸÑâtπµÖ¿°»ÄÙ¯ÅÄÒΩ¡—•Ω∏ÅŸÖ±’îÙàëÌ…ÙàÄëÌπΩ…µÖ±•ÈïA…Ωô•±ïQ•—±ïIÖ…•—‰°•–π…Ö…•—‰§ÄÙÙÙÅ»Ä¸ÄâÕï±ïç—ïêàÄËÄàâÙ¯ëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â1Öâï∞°»•ÙΩΩ¡—•Ω∏˘Ä§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄÄÄΩÕï±ïç–¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏(ÄÄÄÄÄÄÄÄÄÅç±ÖÕÃÙââ—∏µΩ’—±•πîà(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Ä·¡‡ÌôΩπ–µÕ•ÈîËƒ≈¡‡Ïà(ÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨Ùâ°Öπë±ïQΩùù±ïM—Ω…ï%—ï¥†úëÌ•–π•—ïµ}•ëÙú∞ÄëÏÖ•–πÖç—•ŸïÙ§ÏÅÕï—Q•µïΩ’–°±ΩÖëA…Ωô•±ïQ•—±ïÕëµ•π1•Õ–∞»‘¿§Ïà(ÄÄÄÄÄÄÄÄ¯ëÌ•–πÖç—•ŸîÄ¸ÄâïÕÖç—•ŸÖ»àÄËÄâç—•ŸÖ»âÙΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏(ÄÄÄÄÄÄÄÄÄÅç±ÖÕÃÙââ—∏µΩ’—±•πîà(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Ä·¡‡ÌôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ…ïê§Ïà(ÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨Ùâ°Öπë±ïï±ï—ïM—Ω…ï%—ï¥†úëÌ•–π•—ïµ}•ëÙú§ÏÅÕï—Q•µïΩ’–°±ΩÖëA…Ωô•±ïQ•—±ïÕëµ•π1•Õ–∞»‘¿§Ïà(ÄÄÄÄÄÄÄÄ˚¬~^DΩâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯(ÄÅÄ§π©Ω•∏†àà§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïMÖŸïA…Ωô•±ïQ•—±ïIÖ…•—Âëµ•∏°•—ïµ%ê∞Å…Ö…•—‰§ÅÏ(ÄÅçΩπÕ–ÅÕÖôïIÖ…•—‰ÄÙÅπΩ…µÖ±•ÈïA…Ωô•±ïQ•—±ïIÖ…•—‰°…Ö…•—‰§Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Õï—}Õ—Ω…ï}•—ïµ}…Ö…•—‰à∞ÅÏ(ÄÄÄÅ¡}•—ïµ}•êÈ•—ïµ%ê∞(ÄÄÄÅ¡}…Ö…•—‰ÈÕÖôïIÖ…•—‰(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅù’Ö…ëÖ»Å±ÑÅ…Ö…ïÈÑ∏Å©ïç’”ÑÅï∞ÅME0Å•πç±’•ëº∏à§Ï(ÄÄÄÅÖ›Ö•–Å±ΩÖëA…Ωô•±ïQ•—±ïÕëµ•π1•Õ–†§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅÕ°Ω›QΩÖÕ–°ÅIÖ…ïÈÑÅù’Ö…ëÖëÑËÄëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â1Öâï∞°ÕÖôïIÖ…•—‰•ıÄ§Ï(ÄÅÖ›Ö•–Å±ΩÖëA…Ωô•±ïQ•—±ïÕëµ•π1•Õ–†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïëëA…Ωô•±ïQ•—±ïëµ•∏†§ÅÏ(ÄÅçΩπÕ–Å•çΩ∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›A…Ωô•±ïQ•—±ï%çΩ∏à§¸πŸÖ±’îπ—…•¥†§Ï(ÄÅçΩπÕ–ÅπÖµîÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›A…Ωô•±ïQ•—±ï9Öµîà§¸πŸÖ±’îπ—…•¥†§Ï(ÄÅçΩπÕ–Å…Ö…•—‰ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›A…Ωô•±ïQ•—±ïIÖ…•—‰à§¸πŸÖ±’îÅÒÄâçΩµ’∏àÏ(ÄÅçΩπÕ–Å…Ö›A…•çîÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›A…Ωô•±ïQ•—±ïA…•çîà§¸πŸÖ±’îÏ(ÄÅçΩπÕ–Å¡…•çîÄÙÅ9’µâï»π¡Ö…Õï%π–°…Ö›A…•çî∞Äƒ¿§Ï((ÄÅ•òÄ†Ö•çΩ∏ÅÒÄÖπÖµîÅÒÅ9’µâï»π•Õ9Ö8°¡…•çî§ÅÒÅ¡…•çîÄÄ¿§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†âΩµ¡±ï”ÑÉµçΩπº∞ÅπΩµâ…îÅ‰Å¡…ïç•ºà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Öëë}¡…Ωô•±ï}—•—±îà∞ÅÏ(ÄÄÄÅ¡}•çΩ∏È•çΩ∏∞(ÄÄÄÅ¡}πÖµîÈπÖµî∞(ÄÄÄÅ¡}…Ö…•—‰È…Ö…•—‰∞(ÄÄÄÅ¡}¡…•çîÈ¡…•çî(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅçΩπÕ–ÅµïÕÕÖùïÃÄÙÅÏ(ÄÄÄÄÄÅπΩ}Ö’—Ω…•ÈÖëºËâ9ºÅ—ïª•ÃÅ¡ï…µ•ÕºÅëîÅÖëµ•π•Õ—…ÖëΩ»∏à∞(ÄÄÄÄÄÅëÖ—ΩÕ}•πçΩµ¡±ï—ΩÃËâΩµ¡±ï”ÑÉµçΩπºÅ‰ÅπΩµâ…î∏à∞(ÄÄÄÄÄÅ¡…ïç•Ω}•πŸÖ±•ëºËâ∞Å¡…ïç•ºÅπºÅïÃÅ€Ö±•ëº∏à∞(ÄÄÄÄÄÅ…Ö…ïÈÖ}•πŸÖ±•ëÑËâ1ÑÅ…Ö…ïÈÑÅπºÅïÃÅ€Ö±•ëÑ∏à∞(ÄÄÄÄÄÅ—•—’±Ω}ë’¡±•çÖëºËâeÑÅï·•Õ—îÅ’∏Å”µ—’±ºÅçΩ∏ÅïÕîÅπΩµâ…î∏à(ÄÄÄÅÙÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°µïÕÕÖùïÕmëÖ—Ñ¸πï……Ω…tÅÒÄâ9ºÅÕîÅ¡’ëºÅç…ïÖ»Åï∞Å”µ—’±º∏Å©ïç’”ÑÅï∞ÅME0Å•πç±’•ëº∏à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›A…Ωô•±ïQ•—±ï%çΩ∏à§πŸÖ±’îÄÙÄààÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›A…Ωô•±ïQ•—±ï9Öµîà§πŸÖ±’îÄÙÄààÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›A…Ωô•±ïQ•—±ïIÖ…•—‰à§πŸÖ±’îÄÙÄâçΩµ’∏àÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›A…Ωô•±ïQ•—±ïA…•çîà§πŸÖ±’îÄÙÄààÏ((ÄÅÕ°Ω›QΩÖÕ–°É¬~>ﬂæ‚<ÅSµ—’±ºÄëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â1Öâï∞°…Ö…•—‰•ÙÅç…ïÖëºÅçΩ……ïç—Öµïπ—ïÄ§Ï(ÄÅÖ›Ö•–Å±ΩÖëA…Ωô•±ïQ•—±ïÕëµ•π1•Õ–†§Ï(ÄÅ±ΩÖëM—Ω…ï%—ïµÕ1•Õ–†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïëëM—Ω…ï%—ï¥†§ÅÏ(ÄÅçΩπÕ–ÅçÖ—ïùΩ…‰ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›%—ïµÖ—ïùΩ…‰à§πŸÖ±’îπ—…•¥†§Ï(ÄÅçΩπÕ–Å•çΩ∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›%—ïµ%çΩ∏à§πŸÖ±’îπ—…•¥†§Ï(ÄÅçΩπÕ–ÅπÖµîÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›%—ïµ9Öµîà§πŸÖ±’îπ—…•¥†§Ï(ÄÅçΩπÕ–Å¡…•çîÄÙÅ¡Ö…Õï%π–°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›%—ïµA…•çîà§πŸÖ±’î∞Äƒ¿§Ï((ÄÅ•òÄ†ÖçÖ—ïùΩ…‰ÅÒÄÖ•çΩ∏ÅÒÄÖπÖµîÅÒÄÖ¡…•çî§ÅÏÅÕ°Ω›QΩÖÕ–†âΩµ¡±ï”ÑÅ±ΩÃÄ–ÅçÖµ¡ΩÃà§ÏÅ…ï—’…∏ÏÅÙ((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Öëë}Õ—Ω…ï}•—ï¥à∞ÅÏÅ¡}çÖ—ïùΩ…‰ËÅçÖ—ïùΩ…‰∞Å¡}•çΩ∏ËÅ•çΩ∏∞Å¡}πÖµîËÅπÖµî∞Å¡}¡…•çîËÅ¡…•çîÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅÖù…ïùÖ»à§ÏÅ…ï—’…∏ÏÅÙ((ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›%—ïµÖ—ïùΩ…‰à§πŸÖ±’îÄÙÄààÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›%—ïµ%çΩ∏à§πŸÖ±’îÄÙÄààÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›%—ïµ9Öµîà§πŸÖ±’îÄÙÄààÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âπï›%—ïµA…•çîà§πŸÖ±’îÄÙÄààÏ(ÄÅÕ°Ω›QΩÖÕ–†â…”µç’±ºÅÖù…ïùÖëºà§Ï(ÄÅ±ΩÖëM—Ω…ï%—ïµÕ1•Õ–†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïQΩùù±ïM—Ω…ï%—ï¥°•ê∞Åπï›ç—•Ÿî§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}—Ωùù±ï}Õ—Ω…ï}•—ï¥à∞ÅÏÅ¡}•êËÅ•ê∞Å¡}Öç—•ŸîËÅπï›ç—•ŸîÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅçÖµâ•Ö»à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅ±ΩÖëM—Ω…ï%—ïµÕ1•Õ–†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïï±ï—ïM—Ω…ï%—ï¥°•ê§ÅÏ(ÄÅ•òÄ†ÖçΩπô•…¥†ã
˝±•µ•πÖ»ÅïÕ—îÅÖ…”µç’±º¸ÅE’•ï∏ÅÂÑÅ±ºÅçΩµ¡ÀÃÅ±ºÅçΩπÕï…ŸÑÅ•ù’Ö∞∏à§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ëï±ï—ï}Õ—Ω…ï}•—ï¥à∞ÅÏÅ¡}•êËÅ•êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅï±•µ•πÖ»à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–†â…”µç’±ºÅï±•µ•πÖëºà§Ï(ÄÅ±ΩÖëM—Ω…ï%—ïµÕ1•Õ–†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï	’µ¡Yï…Õ•Ω∏°≠ï‰§ÅÏ(ÄÅ•òÄ†ÖçΩπô•…¥°É
˝M’â•»Å±ÑÅŸï…ÕßÕ∏ÅëîÄàëÌ≠ïÂÙà¸ÅÕ—ºÅ°ÖçîÅ≈’îÅ±îÅŸ’ï±ŸÑÅÑÅÖ¡Ö…ïçï»ÅÑÅQ==LÅ±ΩÃÅ’Õ’Ö…•ΩÃπÄ§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}â’µ¡}çΩπ—ïπ—}Ÿï…Õ•Ω∏à∞ÅÏÅ¡}çΩπ—ïπ—}≠ï‰ËÅ≠ï‰ÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏ(ÄÄÄÅ•òÄ°ëÖ—Ñ¸πï……Ω»ÄÙÙÙÄâÕ•π}çΩπ—ïπ•ëΩ}çÖ…ùÖëºà§ÅÏ(ÄÄÄÄÄÅÕ°Ω›QΩÖÕ–°ÅÖ…üÑÅ¡…•µï…ºÅ±ÖÃÅπΩŸïëÖëïÃÅëîÅ±ÑÅŸï…ÕßÕ∏ÄëÌëÖ—ÑπŸï…Õ•Ωπ}ïÕ¡ï…ÖëÖÙÅï∏Å±ÑÅ—Öâ±ÑÅç°Öπùï±Ωù}ïπ—…•ïÕÄ§Ï(ÄÄÄÅÙÅï±ÕîÅÏ(ÄÄÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅÖç—’Ö±•ÈÖ»à§Ï(ÄÄÄÅÙ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅ•òÄ°≠ï‰ÄÙÙÙÄâç°Öπùï±Ωúà§ÅÏ(ÄÄÄÅ±ÕM—Ö…—’¡°Öπùï±Ωù!•Õ—Ω…ÂÖç°îÄÙÅÏÅëÖ—ÑÈπ’±∞∞ÅÖ–Ë¿ÅÙÏ(ÄÅÙ(ÄÅÕ°Ω›QΩÖÕ–†âYï…ÕßÕ∏ÅÖç—’Ö±•ÈÖëÑà§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖëA±ÖπÕ1Ωç≠M—Ö—’Ã†§ÅÏ(ÄÅçΩπÕ–Åâ—∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡±ÖπÕ1Ωç≠	—∏à§Ï(ÄÅ•òÄ†Öâ—∏§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âùï—}Ö¡¡}Ÿ•Õ•â•±•—‰à§Ï((ÄÅ•òÄ°ï……Ω»§ÅÏ(ÄÄÄÅçΩπÕΩ±îπ›Ö…∏†â9ºÅÕîÅ¡’ëºÅ±ïï»ÅŸ•Õ•â•±•ëÖêÅëîÅA±ÖπïÃËà∞Åï……Ω»§Ï(ÄÄÄÅâ—∏π—ï·—Ωπ—ïπ–ÄÙÄãäjÉæ‚<Å9ºÅÕîÅ¡’ëºÅ±ïï»Åï∞ÅïÕ—ÖëºàÏ(ÄÄÄÅâ—∏πç±ÖÕÕ9ÖµîÄÙÄââ—∏µΩ’—±•πîàÏ(ÄÄÄÅâ—∏πëÖ—ÖÕï–πç’……ïπ–ÄÙÄâΩ¡ï∏àÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅÕ—Ö—’ÃÄÙÅM—…•πú°ëÖ—Ñ¸π¡±ÖπÕ}Ÿ•Õ•â•±•—‰ÅÒÄâΩ¡ï∏à§Ï(ÄÅâ—∏π—ï·—Ωπ—ïπ–ÄÙÅÕ—Ö—’ÃÄÙÙÙÄâΩ¡ï∏à(ÄÄÄÄ¸Äã¬~~àÅâ•ï…—ºÉäPÅçï……Ö»ÅÖ°Ω…Ñà(ÄÄÄÄËÄã¬~R–Åï……ÖëºÉäPÅÖâ…•»ÅÖ°Ω…ÑàÏ(ÄÅâ—∏πç±ÖÕÕ9ÖµîÄÙÅÕ—Ö—’ÃÄÙÙÙÄâΩ¡ï∏àÄ¸Äââ—∏àÄËÄââ—∏µΩ’—±•πîàÏ(ÄÅâ—∏πëÖ—ÖÕï–πç’……ïπ–ÄÙÅÕ—Ö—’ÃÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïQΩùù±ïA±ÖπÕ1Ωç¨†§ÅÏ(ÄÅçΩπÕ–Åâ—∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â¡±ÖπÕ1Ωç≠	—∏à§Ï(ÄÅ•òÄ†Öâ—∏§Å…ï—’…∏Ï((ÄÄººÅπ—ïÃÅëîÅçÖµâ•Ö»∞ÅçΩπÕ’±—ÖµΩÃÅï∞ÅïÕ—ÖëºÅI0Åï∏ÅM’¡ÖâÖÕî∏(ÄÄººÅœ¥ÅπºÅëï¡ïπëïµΩÃÅëîÅ’∏ÅëÖ—ÖÕï–ÅŸ•ï©ºÅëï∞ÅâΩ”Õ∏∏(ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅŸ•Õ•â•±•—Â	ïôΩ…î∞Åï……Ω»ËÅ…ïÖë……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âùï—}Ö¡¡}Ÿ•Õ•â•±•—‰à§Ï((ÄÅ•òÄ°…ïÖë……Ω»§ÅÏ(ÄÄÄÅçΩπÕΩ±îπ›Ö…∏†â9ºÅÕîÅ¡’ëºÅ±ïï»ÅA±ÖπïÃÅÖπ—ïÃÅëï∞ÅçÖµâ•ºËà∞Å…ïÖë……Ω»§Ï(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅ±ïï»Åï∞ÅïÕ—ÖëºÅÖç—’Ö∞ÅëîÅA±ÖπïÃà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–Åç’……ïπ–ÄÙÅM—…•πú°Ÿ•Õ•â•±•—Â	ïôΩ…î¸π¡±ÖπÕ}Ÿ•Õ•â•±•—‰ÅÒÄâΩ¡ï∏à§Ï(ÄÅçΩπÕ–Åπï›M—Ö—’ÃÄÙÅç’……ïπ–ÄÙÙÙÄâΩ¡ï∏àÄ¸Äâç±ΩÕïêàÄËÄâΩ¡ï∏àÏ((ÄÅâ—∏πë•ÕÖâ±ïêÄÙÅ—…’îÏ(ÄÅâ—∏π—ï·—Ωπ—ïπ–ÄÙÅπï›M—Ö—’ÃÄÙÙÙÄâΩ¡ï∏àÄ¸Äââ…•ïπëº∏∏∏àÄËÄâï……Öπëº∏∏∏àÏ((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Õï—}¡±ÖπÕ}Ÿ•Õ•â•±•—‰à∞ÅÏ(ÄÄÄÅ¡}Õ—Ö—’ÃËÅπï›M—Ö—’Ã(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅâ—∏πë•ÕÖâ±ïêÄÙÅôÖ±ÕîÏ(ÄÄÄÅçΩπÕΩ±îπ›Ö…∏†â9ºÅÕîÅ¡’ëºÅçÖµâ•Ö»ÅA±ÖπïÃËà∞Åï……Ω»ÅÒÅëÖ—Ñ§Ï((ÄÄÄÅçΩπÕ–Åï……Ω…ÃÄÙÅÏ(ÄÄÄÄÄÅπΩ}Ö’—Ω…•ÈÖëºËÄâQ‘Åç’ïπ—ÑÅπºÅô•ù’…ÑÅçΩµºÅÖëµ•π•Õ—…ÖëΩ…Ñà∞(ÄÄÄÄÄÅπΩ—}Ö’—°ïπ—•çÖ—ïêËÄâYΩ±€§ÅÑÅ•π•ç•Ö»ÅÕïÕßÕ∏à∞(ÄÄÄÄÄÅïÕ—ÖëΩ}•πŸÖ±•ëºËÄâÕ—ÖëºÅëîÅA±ÖπïÃÅ•π€Ö±•ëºà(ÄÄÄÅÙÏ((ÄÄÄÅÕ°Ω›QΩÖÕ–°ï……Ω…ÕmëÖ—Ñ¸πï……Ω…tÅÒÅÅ9ºÅÕîÅ¡’ëºÅçÖµâ•Ö»ÅA±ÖπïÃëÌï……Ω»¸πµïÕÕÖùîÄ¸ÄàËÄàÄ¨Åï……Ω»πµïÕÕÖùîÄËÄàâıÄ§Ï(ÄÄÄÅÖ›Ö•–Å±ΩÖëA±ÖπÕ1Ωç≠M—Ö—’Ã†§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÄººÅYï…•ô•çÖçßÕ∏ÅI0Å¡ΩÕ—ï…•Ω»ÅÖ∞ÅçÖµâ•º∏(ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅŸ•Õ•â•±•—Âô—ï»∞Åï……Ω»ËÅŸï…•ôÂ……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âùï—}Ö¡¡}Ÿ•Õ•â•±•—‰à§Ï(ÄÅçΩπÕ–ÅÕÖŸïëM—Ö—’ÃÄÙÅM—…•πú°Ÿ•Õ•â•±•—Âô—ï»¸π¡±ÖπÕ}Ÿ•Õ•â•±•—‰ÅÒÄàà§Ï((ÄÅâ—∏πë•ÕÖâ±ïêÄÙÅôÖ±ÕîÏ((ÄÅ•òÄ°Ÿï…•ôÂ……Ω»ÅÒÅÕÖŸïëM—Ö—’ÃÄÑÙÙÅπï›M—Ö—’Ã§ÅÏ(ÄÄÄÅçΩπÕΩ±îπ›Ö…∏†âA±ÖπïÃÅπºÅçΩπô•…∑ÃÅï∞ÅçÖµâ•ºËà∞ÅŸï…•ôÂ……Ω»∞ÅŸ•Õ•â•±•—Âô—ï»§Ï(ÄÄÄÅÕ°Ω›QΩÖÕ–†âM’¡ÖâÖÕîÅπºÅçΩπô•…∑ÃÅï∞ÅçÖµâ•ºÅëîÅA±ÖπïÃà§Ï(ÄÄÄÅÖ›Ö•–Å±ΩÖëA±ÖπÕ1Ωç≠M—Ö—’Ã†§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅÖ›Ö•–Å±ΩÖëA±ÖπÕ1Ωç≠M—Ö—’Ã†§Ï((ÄÅÕ°Ω›QΩÖÕ–†(ÄÄÄÅÕÖŸïëM—Ö—’ÃÄÙÙÙÄâΩ¡ï∏à(ÄÄÄÄÄÄ¸Äã¬~~àÅA±ÖπïÃÅÖç—•ŸÖëΩÃà(ÄÄÄÄÄÄËÄã¬~R–ÅA±ÖπïÃÅëïÕÖç—•ŸÖëΩÃà(ÄÄ§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖë]Ö±±ï—1Ωç≠M—Ö—’Ã†§ÅÏ(ÄÅçΩπÕ–Åâ—∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â›Ö±±ï—1Ωç≠	—∏à§Ï(ÄÅ•òÄ†Öâ—∏§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÏÅëÖ—ÑÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†âÖ¡¡}—ï·—}çΩπô•úà§πÕï±ïç–†à®à§πïƒ†â≠ï‰à∞Äâ›Ö±±ï—}Ÿ•Õ•â•±•—‰à§πÕ•πù±î†§Ï(ÄÅçΩπÕ–ÅÕ—Ö—’ÃÄÙÅëÖ—Ñ¸πŸÖ±’îÅÒÄâΩ¡ï∏àÏ(ÄÅâ—∏π—ï·—Ωπ—ïπ–ÄÙÅÕ—Ö—’ÃÄÙÙÙÄâΩ¡ï∏àÄ¸Äã¬~~àÅâ•ï…—ºÉäPÅçï……Ö»ÅÖ°Ω…ÑàÄËÄã¬~R–Åï……ÖëºÉäPÅÖâ…•»ÅÖ°Ω…ÑàÏ(ÄÅâ—∏πç±ÖÕÕ9ÖµîÄÙÅÕ—Ö—’ÃÄÙÙÙÄâΩ¡ï∏àÄ¸Äââ—∏àÄËÄââ—∏µΩ’—±•πîàÏ(ÄÅâ—∏πëÖ—ÖÕï–πç’……ïπ–ÄÙÅÕ—Ö—’ÃÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïQΩùù±ï]Ö±±ï—1Ωç¨†§ÅÏ(ÄÅçΩπÕ–Åâ—∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â›Ö±±ï—1Ωç≠	—∏à§Ï(ÄÅçΩπÕ–Åπï›M—Ö—’ÃÄÙÅâ—∏πëÖ—ÖÕï–πç’……ïπ–ÄÙÙÙÄâΩ¡ï∏àÄ¸Äâç±ΩÕïêàÄËÄâΩ¡ï∏àÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Õï—}›Ö±±ï—}Ÿ•Õ•â•±•—‰à∞ÅÏÅ¡}Õ—Ö—’ÃËÅπï›M—Ö—’ÃÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅçÖµâ•Ö»à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–°πï›M—Ö—’ÃÄÙÙÙÄâç±ΩÕïêàÄ¸Äâ	•±±ï—ï…ÑÅçï……ÖëÑÅ¡Ö…ÑÅ±ΩÃÅëï∑ÖÃàÄËÄâ	•±±ï—ï…ÑÅÖâ•ï…—ÑÅëîÅπ’ïŸºà§Ï(ÄÅ±ΩÖë]Ö±±ï—1Ωç≠M—Ö—’Ã†§Ï)Ù(()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïëµ•πMï—UÕï…A±Ö∏°’Õï…%ê∞Å¡±Öπ%ê§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—A…Ωô•±î¸π•Õ}Öëµ•∏§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†âMΩ±ºÅ’∏ÅÖëµ•π•Õ—…ÖëΩ»Å¡’ïëîÅçÖµâ•Ö»Å¡±ÖπïÃà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–Å¡±Öπ9ÖµïÃÄÙÅÏ(ÄÄÄÅÕ—ÖπëÖ…êËâÕ”ÖπëÖ»à∞(ÄÄÄÅ¡±’ÃËâA±’Ãà∞(ÄÄÄÅë•ÖµÖπ—îËâ•ÖµÖπ—îà(ÄÅÙÏ((ÄÅçΩπÕ–Å±Öâï∞ÄÙÅ¡±Öπ9ÖµïÕm¡±Öπ%ëtÅÒÅ¡±Öπ%êÏ((ÄÅ•òÄ†ÖçΩπô•…¥°É
˝Õ•ùπÖ»Åï∞Å¡±Ö∏ÄëÌ±Öâï±ÙÅÑÅïÕ—îÅ’Õ’Ö…•º˝Ä§§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Õï—}’Õï…}¡±Ö∏à∞ÅÏ(ÄÄÄÅ¡}’Õï…}•êÈ’Õï…%ê∞(ÄÄÄÅ¡}¡±Öπ}•êÈ¡±Öπ%ê(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅçΩπÕΩ±îπ›Ö…∏†â9ºÅÕîÅ¡’ëºÅÖÕ•ùπÖ»Åï∞Å¡±Ö∏Ëà∞Åï……Ω»ÅÒÅëÖ—Ñ§Ï((ÄÄÄÅçΩπÕ–Åï……Ω…ÃÄÙÅÏ(ÄÄÄÄÄÅπΩ}Ö’—Ω…•ÈÖëºËâMΩ±ºÅ’∏ÅÖëµ•π•Õ—…ÖëΩ»Å¡’ïëîÅçÖµâ•Ö»Å¡±ÖπïÃà∞(ÄÄÄÄÄÅ’Õ’Ö…•Ω}πΩ}ïπçΩπ—…ÖëºËâ9ºÅÕîÅïπçΩπ—ÀÃÅï∞Å’Õ’Ö…•ºà∞(ÄÄÄÄÄÅ¡±Öπ}•πŸÖ±•ëºËâÕîÅ¡±Ö∏ÅπºÅï·•Õ—îà(ÄÄÄÅÙÏ((ÄÄÄÅÕ°Ω›QΩÖÕ–°ï……Ω…ÕmëÖ—Ñ¸πï……Ω…tÅÒÄâ9ºÅÕîÅ¡’ëºÅÖç—•ŸÖ»Åï∞Å¡±Ö∏à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅÕ°Ω›QΩÖÕ–°É¬~J8ÅA±Ö∏ÄëÌ±Öâï±ÙÅÖç—•ŸÖëΩÄ§Ï(ÄÅÖ›Ö•–Å…ïπëï…ëµ•∏†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïUÕï…MïÖ…ç††§ÅÏ(ÄÅçΩπÕ–Å≈’ï…‰ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â’Õï…MïÖ…ç°%π¡’–à§πŸÖ±’îπ—…•¥†§Ï(ÄÅçΩπÕ–Å…ïÕ’±—Õ∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â’Õï…MïÖ…ç°IïÕ’±—Ãà§Ï(ÄÅ•òÄ†Ö≈’ï…‰§ÅÏÅ…ïÕ’±—Õ∞π•ππï…!Q50ÄÙÄààÏÅ…ï—’…∏ÏÅÙ((ÄÅ…ïÕ’±—Õ∞π•ππï…!Q50ÄÙÄâ	’ÕçÖπëº∏∏∏àÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ÕïÖ…ç°}’Õï…Ãà∞ÅÏÅ¡}≈’ï…‰ËÅ≈’ï…‰ÅÙ§Ï(ÄÅ…ïπëï…UÕï…Ö…ëÃ°ëÖ—Ñ∞Åï……Ω»∞Å…ïÕ’±—Õ∞§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï…ïÖ—Ω…¡¡±•çÖ—•Ω∏°Ö¡¡±•çÖ—•Ωπ%ê∞Åëïç•Õ•Ω∏§ÅÏ(ÄÅçΩπÕ–ÅÖ¡¡…ΩŸ•πúÄÙÅëïç•Õ•Ω∏ÄÙÙÙÄâÖ¡¡…ΩŸîàÏ(ÄÅ•òÄ†ÖçΩπô•…¥°Ö¡¡…ΩŸ•πúÄ¸Äã
˝¡…ΩâÖ»ÅïÕ—ÑÅç’ïπ—ÑÅçΩµºÅ…ïÖëΩ»¸àÄËÄã
˝Iïç°ÖÈÖ»ÅïÕ—ÑÅÕΩ±•ç•—’ê¸à§§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ëïç•ëï}ç…ïÖ—Ω…}Ö¡¡±•çÖ—•Ω∏à∞ÅÏ(ÄÄÄÅ¡}Ö¡¡±•çÖ—•Ωπ}•êÈÖ¡¡±•çÖ—•Ωπ%ê∞(ÄÄÄÅ¡}ëïç•Õ•Ω∏ÈÖ¡¡…ΩŸ•πúÄ¸ÄâÖ¡¡…ΩŸïêàÄËÄâ…ï©ïç—ïêà(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅ¡…ΩçïÕÖ»Å±ÑÅÕΩ±•ç•—’êà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅÕ°Ω›QΩÖÕ–°Ö¡¡…ΩŸ•πúÄ¸Äã¬~:∞Å…ïÖëΩ»ÅÖ¡…ΩâÖëºàÄËÄâMΩ±•ç•—’êÅ…ïç°ÖÈÖëÑà§Ï(ÄÅÖ›Ö•–Å…ïπëï…ëµ•∏†§Ï(ÄÅÕï—Q•µïΩ’–††§ÄÙ¯ÅÕ›•—ç°ëµ•πAÖπï±…Ω’¿†â’Õ’Ö…•ΩÃà∞ÅëΩç’µïπ–π≈’ï…ÂMï±ïç—Ω»†ùmëÖ—ÑµÖëµ•∏µ—ÖàÙâ’Õ’Ö…•ΩÃâtú§§∞Ä¿§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï1•Õ—±±UÕï…Ã†§ÅÏ(ÄÅçΩπÕ–Å…ïÕ’±—Õ∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â’Õï…MïÖ…ç°IïÕ’±—Ãà§Ï(ÄÅ…ïÕ’±—Õ∞π•ππï…!Q50ÄÙÄâÖ…ùÖπëºÅ—ΩëΩÃÅ±ΩÃÅ’Õ’Ö…•ΩÃ∏∏∏àÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}±•Õ—}Ö±±}’Õï…Ãà§Ï(ÄÅ…ïπëï…UÕï…Ö…ëÃ°ëÖ—Ñ∞Åï……Ω»∞Å…ïÕ’±—Õ∞∞Å—…’î§Ï)Ù()ô’πç—•Ω∏ÅµÖÕ≠AÖÂµïπ—%πôº°ŸÖ±’î§ÅÏ(ÄÅ•òÄ†ÖŸÖ±’î§Å…ï—’…∏ÄààÏ(ÄÅ…ï—’…∏Äãäààπ…ï¡ïÖ–°5Ö—†πµ•∏°ŸÖ±’îπ±ïπù—†∞Äƒ–§§Ï)Ù()ô’πç—•Ω∏Å—Ωùù±ïAÖÂµïπ—%πôº°ï±%ê§ÅÏ(ÄÅçΩπÕ–Åï∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê°ï±%ê§Ï(ÄÅçΩπÕ–Å•Õ5ÖÕ≠ïêÄÙÅï∞πëÖ—ÖÕï–πµÖÕ≠ïêÄÑÙÙÄâôÖ±ÕîàÏ(ÄÅçΩπÕ–Å…ïÖ±YÖ±’îÄÙÅï∞πëÖ—ÖÕï–π…ïÖ∞Ï(ÄÅï∞π—ï·—Ωπ—ïπ–ÄÙÅ•Õ5ÖÕ≠ïêÄ¸Å…ïÖ±YÖ±’îÄËÄ°ï±%êÄÙÙÙÄâ¡ÖÂµÖ•∞àÄ¸ÅµÖÕ≠µÖ•∞°…ïÖ±YÖ±’î§ÄËÅµÖÕ≠AÖÂµïπ—%πôº°…ïÖ±YÖ±’î§§Ï(ÄÅï∞πëÖ—ÖÕï–πµÖÕ≠ïêÄÙÅ•Õ5ÖÕ≠ïêÄ¸ÄâôÖ±ÕîàÄËÄâ—…’îàÏ)Ù()ô’πç—•Ω∏ÅµÖÕ≠µÖ•∞°ïµÖ•∞§ÅÏ(ÄÅ•òÄ†ÖïµÖ•∞§Å…ï—’…∏ÄààÏ(ÄÅçΩπÕ–Åm’Õï»∞ÅëΩµÖ•πtÄÙÅïµÖ•∞πÕ¡±•–†â à§Ï(ÄÅ•òÄ†ÖëΩµÖ•∏§Å…ï—’…∏ÅïµÖ•∞Ï(ÄÅçΩπÕ–ÅŸ•Õ•â±îÄÙÅ’Õï»πÕ±•çî†¿∞Ä»§Ï(ÄÅ…ï—’…∏ÅÄëÌŸ•Õ•â±ïÙëÏãäààπ…ï¡ïÖ–°5Ö—†πµÖ‡†Ã∞Å’Õï»π±ïπù—†Ä¥Ä»§•ı ëÌëΩµÖ•πıÄÏ)Ù()ô’πç—•Ω∏Å—Ωùù±ïµÖ•±Y•Õ•â•±•—‰°Õ¡Öπ%ê∞Å…ïÖ±µÖ•∞§ÅÏ(ÄÅçΩπÕ–Åï∞ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê°Õ¡Öπ%ê§Ï(ÄÅçΩπÕ–Å•Õ5ÖÕ≠ïêÄÙÅï∞πëÖ—ÖÕï–πµÖÕ≠ïêÄÑÙÙÄâôÖ±ÕîàÏ(ÄÅï∞π—ï·—Ωπ—ïπ–ÄÙÅ•Õ5ÖÕ≠ïêÄ¸Å…ïÖ±µÖ•∞ÄËÅµÖÕ≠µÖ•∞°…ïÖ±µÖ•∞§Ï(ÄÅï∞πëÖ—ÖÕï–πµÖÕ≠ïêÄÙÅ•Õ5ÖÕ≠ïêÄ¸ÄâôÖ±ÕîàÄËÄâ—…’îàÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å…ïπëï…UÕï…Ö…ëÃ°ëÖ—Ñ∞Åï……Ω»∞Å…ïÕ’±—Õ∞∞ÅÕ°Ω›±∞§ÅÏ(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑÅÒÄÖëÖ—Ñπ±ïπù—†§ÅÏ(ÄÄÄÅ…ïÕ’±—Õ∞π•ππï…!Q50ÄÙÅÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒÕ¡‡Ïà˘M•∏Å…ïÕ’±—ÖëΩÃ∏Ω¿˘ÄÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–Å¡±ÖπÃÄÙÅÖ›Ö•–Å±ΩÖëA±ÖπÃ†§Ï((ÄÅ…ïÕ’±—Õ∞π•ππï…!Q50ÄÙÄ°Õ°Ω›±∞Ä¸ÅÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏÅµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡Ïà¯ëÌëÖ—Ñπ±ïπù—°ÙÅ’Õ’Ö…•ºëÌëÖ—Ñπ±ïπù—†ÄÙÙÙÄƒÄ¸ÄààÄËÄâÃâÙÅï∏Å—Ω—Ö∞Ω¿˘ÄÄËÄàà§Ä¨ÅëÖ—ÑπµÖ¿°‘ÄÙ¯ÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µ›ï•ù°–Ëÿ¿¿Ïà˘ ëÌïÕçÖ¡ï!—µ∞°‘π’Õï…πÖµî•ÙÄëÌ‘πâÖπ}…ïÖÕΩ∏Ä¸ÅÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÏÅôΩπ–µÕ•ÈîËƒ≈¡‡Ïà˚¬~j¨Å	9<ΩÕ¡Ö∏˘ÄÄËÅ‘π•Õ}â±Ωç≠ïêÄ¸ÅÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÏÅôΩπ–µÕ•ÈîËƒ≈¡‡Ïà˚¬~VHÅ¡ïπë•ïπ—îΩÕ¡Ö∏˘ÄÄËÄàâÙΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒ…¡‡Ïà¯ÒÕ¡Ö∏Å•êÙâïµÖ•∞µçÖ…ê¥ëÌ‘π•ëÙàÅëÖ—ÑµµÖÕ≠ïêÙâ—…’îà¯ëÌïÕçÖ¡ï!—µ∞°µÖÕ≠µÖ•∞°‘πïµÖ•∞§•ÙΩÕ¡Ö∏¯ÄÒâ’——Ω∏ÅΩπç±•ç¨Ùâ—Ωùù±ïµÖ•±Y•Õ•â•±•—‰†ùïµÖ•∞µçÖ…ê¥ëÌ‘π•ëÙú∞ÄúëÌïÕçÖ¡ï!—µ∞°‘πïµÖ•∞ÅÒÄàà•Ùú§àÅÕ—Â±îÙââÖç≠ù…Ω’πêÈπΩπîÌâΩ…ëï»ÈπΩπîÌç’…ÕΩ»È¡Ω•π—ï»ÌôΩπ–µÕ•ÈîËƒ…¡‡Ïà˚¬~FΩâ’——Ω∏¯É
‹ÄëÌ‘π¡Ω•π—Õ}âÖ±ÖπçïÙÅ¡—ÃëÌ‘π¡±Öπ}•êÄ¸ÅÄÉ
‹Å¡±Ö∏ÄëÌïÕçÖ¡ï!—µ∞°¡±ÖπÃπô•πê°¿ÄÙ¯Å¿π•êÄÙÙÙÅ‘π¡±Öπ}•ê§¸ππÖµîÅÒÅ‘π¡±Öπ}•ê•ıÄÄËÄàâÙÉ
‹ÅëïÕëîÄëÌπï‹ÅÖ—î°‘πç…ïÖ—ïë}Ö–§π—Ω1ΩçÖ±ïÖ—ïM—…•πú†âïÃµHà•ÙΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿ËŸ¡‡ÏÅô±ï‡µ›…Ö¿È›…Ö¿ÏÅµÖ…ù•∏µ—Ω¿Ëƒ¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Äƒ¡¡‡ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏàÅΩπç±•ç¨Ùâ°Öπë±ïë©’Õ—AΩ•π—Ã†úëÌ‘π•ëÙú∞ÄúëÌïÕçÖ¡ï!—µ∞°‘π’Õï…πÖµî•Ùú§à˚
ƒÅ©’Õ—Ö»Å¡’π—ΩÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Äƒ¡¡‡ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏàÅΩπç±•ç¨Ùâ°Öπë±ïMï—A±Ö∏†úëÌ‘π•ëÙú∞ÄúëÌïÕçÖ¡ï!—µ∞°‘π’Õï…πÖµî•Ùú§à˚¬~NòÅç—•ŸÖ»Å¡±Ö∏Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄëÌ‘πâÖπ}…ïÖÕΩ∏(ÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Äƒ¡¡‡ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏàÅΩπç±•ç¨Ùâ°Öπë±ïUπâÖπUÕï»†úëÌ‘π•ëÙú§à˘1ïŸÖπ—Ö»ÅâÖ∏Ωâ’——Ω∏˘Ä(ÄÄÄÄÄÄÄÄÄÄËÅÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Äƒ¡¡‡ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÏàÅΩπç±•ç¨Ùâ°Öπë±ï	ÖπUÕï»†úëÌ‘π•ëÙú∞ÄúëÌïÕçÖ¡ï!—µ∞°‘π’Õï…πÖµî•Ùú§à˚¬~j¨Å	ÖπïÖ»Ωâ’——Ω∏˘ÅÙ(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Äƒ¡¡‡ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÏàÅΩπç±•ç¨Ùâ°Öπë±ïï±ï—ïççΩ’π–†úëÌ‘π•ëÙú∞ÄúëÌïÕçÖ¡ï!—µ∞°‘π’Õï…πÖµî•Ùú§à˚¬~^DÅ±•µ•πÖ»Åç’ïπ—ÑΩâ’——Ω∏¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯(ÄÅÄ§π©Ω•∏†àà§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïMï—A±Ö∏°’Õï…%ê∞Å’Õï…πÖµî§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—A…Ωô•±î¸π•Õ}Öëµ•∏§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†âMΩ±ºÅ’∏ÅÖëµ•π•Õ—…ÖëΩ»Å¡’ïëîÅçÖµâ•Ö»Å¡±ÖπïÃà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–Å¡±ÖπÃÄÙÅÖ›Ö•–Å±ΩÖëA±ÖπÃ†§Ï(ÄÅçΩπÕ–ÅΩ¡—•ΩπÃÄÙÅ¡±ÖπÃπµÖ¿°¿ÄÙ¯Å¿ππÖµî§π©Ω•∏†àÄºÄà§Ï(ÄÅçΩπÕ–Åç°ΩÕï∏ÄÙÅ¡…Ωµ¡–°Åç—•ŸÖ»Å¡±Ö∏Å¡Ö…ÑÅ ëÌ’Õï…πÖµïÙ∏()Õç…•ã¥Åï·Öç—Öµïπ—îÅ’πºÅëîÅïÕ—ΩÃËÄëÌΩ¡—•ΩπÕıÄ§Ï(ÄÅ•òÄ†Öç°ΩÕï∏§Å…ï—’…∏Ï((ÄÅçΩπÕ–Å¡±Ö∏ÄÙÅ¡±ÖπÃπô•πê†(ÄÄÄÅ¿ÄÙ¯Å¿ππÖµîπ—Ω1Ω›ï…ÖÕî†§ÄÙÙÙÅç°ΩÕï∏π—…•¥†§π—Ω1Ω›ï…ÖÕî†§(ÄÄ§Ï((ÄÅ•òÄ†Ö¡±Ö∏§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†âÕîÅ¡±Ö∏ÅπºÅï·•Õ—î∞ÅïÕç…•â•±ºÅï·Öç—ºà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Õï—}’Õï…}¡±Ö∏à∞ÅÏ(ÄÄÄÅ¡}’Õï…}•êÈ’Õï…%ê∞(ÄÄÄÅ¡}¡±Öπ}•êÈ¡±Ö∏π•ê(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅçΩπÕΩ±îπ›Ö…∏†â……Ω»ÅÖç—•ŸÖπëºÅ¡±Ö∏Ëà∞Åï……Ω»ÅÒÅëÖ—Ñ§Ï(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅÖç—•ŸÖ»Åï∞Å¡±Ö∏à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅÕ°Ω›QΩÖÕ–°É¬~J8ÅA±Ö∏ÄëÌ¡±Ö∏ππÖµïÙÅÖç—•ŸÖëΩÄ§Ï(ÄÅ°Öπë±ïUÕï…MïÖ…ç††§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïë©’Õ—AΩ•π—Ã°’Õï…%ê∞Å’Õï…πÖµî§ÅÏ(ÄÅçΩπÕ–ÅÖµΩ’π—M—»ÄÙÅ¡…Ωµ¡–°Å©’Õ—Ö»Å¡’π—ΩÃÅëîÅ ëÌ’Õï…πÖµïÙπqπqπAΩª§Å’∏ÅªÈµï…ºÅπïùÖ—•ŸºÅ¡Ö…ÑÅëïÕçΩπ—Ö»Ä°ï®ËÄ¥ƒ¿¿§∞ÅºÅ¡ΩÕ•—•ŸºÅ¡Ö…ÑÅÕ’µÖ»Ä°ï®ËÄ‘¿§ÈÄ§Ï(ÄÅ•òÄ°ÖµΩ’π—M—»ÄÙÙÙÅπ’±∞ÅÒÅÖµΩ’π—M—»π—…•¥†§ÄÙÙÙÄàà§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÖµΩ’π–ÄÙÅ¡Ö…Õï%π–°ÖµΩ’π—M—»∞Äƒ¿§Ï(ÄÅ•òÄ°•Õ9Ö8°ÖµΩ’π–§§ÅÏÅÕ°Ω›QΩÖÕ–†âÕºÅπºÅïÃÅ’∏ÅªÈµï…ºÅ€Ö±•ëºà§ÏÅ…ï—’…∏ÏÅÙ((ÄÅçΩπÕ–Å…ïÖÕΩ∏ÄÙÅ¡…Ωµ¡–†â5Ω—•ŸºÄ°¡Ö…ÑÅï∞Å…ïù•Õ—…ºÅ•π—ï…πº§Ëà§ÅÒÄààÏ((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Öë©’Õ—}¡Ω•π—Ãà∞ÅÏ(ÄÄÄÅ¡}’Õï…}•êÈ’Õï…%ê∞(ÄÄÄÅ¡}ÖµΩ’π–ÈÖµΩ’π–∞(ÄÄÄÅ¡}…ïÖÕΩ∏È…ïÖÕΩ∏(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅçΩπÕΩ±îπ›Ö…∏†â……Ω»ÅÖ©’Õ—ÖπëºÅ¡’π—ΩÃËà∞Åï……Ω»ÅÒÅëÖ—Ñ§Ï(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅÖ©’Õ—Ö»Å±ΩÃÅ¡’π—ΩÃà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅÕ°Ω›QΩÖÕ–°ÅA’π—ΩÃÅÖ©’Õ—ÖëΩÃËÄëÌÖµΩ’π–Ä¯Ä¿Ä¸Äà¨àÄËÄàâÙëÌÖµΩ’π—ıÄ§Ï(ÄÅ°Öπë±ïUÕï…MïÖ…ç††§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï	ÖπUÕï»°’Õï…%ê∞Å’Õï…πÖµî§ÅÏ(ÄÅçΩπÕ–Å…ïÖÕΩ∏ÄÙÅ¡…Ωµ¡–°É
˝AΩ»Å≈◊§ÅâÖπóÖÃÅÑÅ ëÌ’Õï…πÖµïÙ¸Ä°ïÕ—ºÅ≈’ïëÑÅ…ïù•Õ—…Öëº•Ä§Ï(ÄÅ•òÄ†Ö…ïÖÕΩ∏ÅÒÄÖ…ïÖÕΩ∏π—…•¥†§§ÅÏÅÕ°Ω›QΩÖÕ–†â9ïçïÕ•”ÖÃÅ¡Ωπï»Å’∏ÅµΩ—•Ÿºà§ÏÅ…ï—’…∏ÏÅÙ(ÄÅ•òÄ†ÖçΩπô•…¥°É
˝Mïù’…ºÅ≈’îÅ≈’ïÀ•ÃÅâÖπïÖ»ÅÑÅ ëÌ’Õï…πÖµïÙ¸Å9ºÅŸÑÅÑÅ¡Ωëï»ÅùÖπÖ»Å¡’π—ΩÃÅπ§ÅçÖπ©ïÖ»πÄ§§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}âÖπ}’Õï»à∞ÅÏÅ¡}’Õï…}•êËÅ’Õï…%ê∞Å¡}…ïÖÕΩ∏ËÅ…ïÖÕΩ∏π—…•¥†§ÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅâÖπïÖ»à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–†â’ïπ—ÑÅâÖπïÖëÑà§Ï(ÄÅ°Öπë±ïUÕï…MïÖ…ç††§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïUπâÖπUÕï»°’Õï…%ê§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}’πâÖπ}’Õï»à∞ÅÏÅ¡}’Õï…}•êËÅ’Õï…%êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅ±ïŸÖπ—Ö»Åï∞ÅâÖ∏à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–†â	Ö∏Å±ïŸÖπ—Öëºà§Ï(ÄÅ°Öπë±ïUÕï…MïÖ…ç††§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïï±ï—ïççΩ’π–°’Õï…%ê∞Å’Õï…πÖµî§ÅÏ(ÄÅçΩπÕ–ÅçΩπô•…µQï·–ÄÙÅ¡…Ωµ¡–°ÅÕ—ºÅâΩ……ÑÅQ=<ÅëîÅ ëÌ’Õï…πÖµïÙÅ¡Ö…ÑÅÕ•ïµ¡…îÄ°Ÿ•ëïΩÃ∞Å¡’π—ΩÃ∞ÅçΩµïπ—Ö…•ΩÃ∞Å—Ωëº§∏Å9ºÅÕîÅ¡’ïëîÅëïÕ°Öçï»πqπqπÕç…•ã¥Äâï±•µ•πÖ»àÅ¡Ö…ÑÅçΩπô•…µÖ»ÈÄ§Ï(ÄÅ•òÄ°çΩπô•…µQï·–¸π—…•¥†§π—Ω1Ω›ï…ÖÕî†§ÄÑÙÙÄâï±•µ•πÖ»à§ÅÏÅÕ°Ω›QΩÖÕ–†âÖπçï±Öëºà§ÏÅ…ï—’…∏ÏÅÙ((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}ëï±ï—ï}ÖççΩ’π–à∞ÅÏÅ¡}’Õï…}•êËÅ’Õï…%êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅï±•µ•πÖ»à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–†â’ïπ—ÑÅï±•µ•πÖëÑÅ¡Ω»ÅçΩµ¡±ï—ºà§Ï(ÄÅ°Öπë±ïUÕï…MïÖ…ç††§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïUπâ±Ωç≠UÕï»°’Õï…%ê§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}’πâ±Ωç≠}’Õï»à∞ÅÏÅ¡}’Õï…}•êËÅ’Õï…%êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅëïÕâ±Ω≈’ïÖ»à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–†â’ïπ—ÑÅëïÕâ±Ω≈’ïÖëÑà§Ï(ÄÅ…ïπëï…ëµ•∏†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï¡¡…ΩŸïIïëïµ¡—•Ω∏°•ê§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Ö¡¡…ΩŸï}…ïëïµ¡—•Ω∏à∞ÅÏÅ¡}…ïëïµ¡—•Ωπ}•êËÅ•êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅÖ¡…ΩâÖ»à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–†âÖπ©îÅµÖ…çÖëºÅçΩµºÅ¡ÖùÖëºà§Ï(ÄÅ…ïπëï…ëµ•∏†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïIï©ïç—Iïëïµ¡—•Ω∏°•ê§ÅÏ(ÄÅ•òÄ†ÖçΩπô•…¥†ã
˝Mïù’…ºÅ≈’îÅ≈’ïÀ•ÃÅ…ïç°ÖÈÖ»ÅïÕ—îÅçÖπ©î¸Å1ΩÃÅ¡’π—ΩÃÅÕîÅ±îÅëïŸ’ï±Ÿï∏ÅÖ∞Å’Õ’Ö…•º∏à§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}…ï©ïç—}…ïëïµ¡—•Ω∏à∞ÅÏÅ¡}…ïëïµ¡—•Ωπ}•êËÅ•êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅ…ïç°ÖÈÖ»à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅÕ°Ω›QΩÖÕ–†âÖπ©îÅ…ïç°ÖÈÖëº∞Å¡’π—ΩÃÅëïŸ’ï±—ΩÃà§Ï(ÄÅ…ïπëï…ëµ•∏†§Ï)Ù((ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ(ººÅI9-%9ÅM590(ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ)ÖÕÂπåÅô’πç—•Ω∏Å…ïπëï…IÖπ≠•πú†§ÅÏ(ÄÅçΩπÕ–ÅµÖ•∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÖ¡¡Y•ï‹à§Ï(ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄÒ¿˘Ö…ùÖπëºÅ…Öπ≠•πú∏∏∏Ω¿˘ÄÏ((ÄÅçΩπÕ–ÅÏÅëÖ—ÑËÅ±ïÖëï…âΩÖ…ê∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âùï—}›ïï≠±Â}±ïÖëï…âΩÖ…êà§Ï(ÄÅ•òÄ°ï……Ω»§ÅÏÅµÖ•∏π•ππï…!Q50ÄÙÅÄÒ¿Åç±ÖÕÃÙâï……Ω»µµÕúà¯ëÌïÕçÖ¡ï!—µ∞°ï……Ω»πµïÕÕÖùîÅÒÄâ……Ω»ÅëïÕçΩπΩç•ëºà•ÙΩ¿˘ÄÏÅ…ï—’…∏ÏÅÙ((ÄÅçΩπÕ–ÅµïëÖ±ÃÄÙÅlã¬~ñà∞Äã¬~ñ à∞Äã¬~ñ$âtÏ((ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒ†ƒÅç±ÖÕÃÙâ¡Öùîµ—•—±îà˚¬~>ÅIÖπ≠•πúÅÕïµÖπÖ∞Ω†ƒ¯(ÄÄÄÄÒ¿Åç±ÖÕÃÙâ¡ÖùîµÕ’àà˘1ΩÃÅ≈’îÅ∑ÖÃÅ¡’π—ΩÃÅùïπï…Ö…Ω∏Åï∏Å±ΩÃÉÈ±—•µΩÃÄ‹ÅìµÖÃ∏Ω¿¯(ÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄëÏ°±ïÖëï…âΩÖ…êÅÒÅmt§πµÖ¿†°‘∞Å§§ÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ïëùï»µ…Ω‹àÅÕ—Â±îÙàëÌ‘π’Õï…πÖµîÄÙÙÙÅç’……ïπ—A…Ωô•±îπ’Õï…πÖµîÄ¸ÄùâÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞¥»§ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅ¡Öëë•πúËƒ¡¡‡ÏúÄËÄúùÙà¯(ÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏¯ëÌµïëÖ±Õm•tÅÒÅÄåëÌ§Ä¨Ä≈ıÅÙÄëÌ‘πÖŸÖ—Ö…}ïµΩ©§ÅÒÄã¬~:∞âÙÅ ëÌïÕçÖ¡ï!—µ∞°‘π’Õï…πÖµî•ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏Åç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§à¯ëÌ‘π—Ω—Ö±}¡Ω•π—ÕÙÅ¡—ÃΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÅÄ§π©Ω•∏†àà§ÅÒÅÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§à˘QΩëÖ€µÑÅπºÅ°Ö‰ÅÖç—•Ÿ•ëÖêÅïÕ—ÑÅÕïµÖπÑ∏Ω¿˘ÅÙ(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù((ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ(ººÅQ%9ÅÅAU9Q=L(ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ)ÖÕÂπåÅô’πç—•Ω∏Å…ïπëï…M—Ω…î†§ÅÏ(ÄÅçΩπÕ–ÅµÖ•∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÖ¡¡Y•ï‹à§Ï(ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄÒ¿˘Ö…ùÖπëºÅ—•ïπëÑ∏∏∏Ω¿˘ÄÏ((ÄÅ±ï–ÅïµΩ©•Ã∞ÅµÂµΩ©•Ã∞Å¡±ÖπÃ∞ÅÕ—Ω…ï%—ïµÃ∞ÅµÂ%—ïµÃ∞Å¡…•çïÕÖ—Ñ∞ÅÕ—Ω…ï	ÖëùïÃ∞ÅµÂ	ÖëùïÃÏ(ÄÅ—…‰ÅÏ(ÄÄÄÅçΩπÕ–Å…ïÕ’±—ÃÄÙÅÖ›Ö•–ÅA…Ωµ•ÕîπÖ±±Mï——±ïê°l(ÄÄÄÄÄÅÕàπô…Ω¥†âÕ—Ω…ï}ïµΩ©•Ãà§πÕï±ïç–†à®à§πïƒ†âÖç—•Ÿîà∞Å—…’î§πΩ…ëï»†â¡…•çï}¡Ω•π—Ãà§∞(ÄÄÄÄÄÅÕàπô…Ω¥†â’Õï…}’π±Ωç≠ïë}ïµΩ©•Ãà§πÕï±ïç–†âïµΩ©§à§πïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§∞(ÄÄÄÄÄÅ±ΩÖëA±ÖπÃ†§∞(ÄÄÄÄÄÅÕàπô…Ω¥†âÕ—Ω…ï}•—ïµÃà§πÕï±ïç–†à®à§πïƒ†âÖç—•Ÿîà∞Å—…’î§πΩ…ëï»†âçÖ—ïùΩ…‰à§πΩ…ëï»†âÕΩ…—}Ω…ëï»à§∞(ÄÄÄÄÄÅÕàπô…Ω¥†â’Õï…}’π±Ωç≠ïë}•—ïµÃà§πÕï±ïç–†â•—ïµ}•êà§πïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§∞(ÄÄÄÄÄÅÕàπ…¡å†âùï—}Õ—Ω…ï}¡…•çïÃà§∞(ÄÄÄÄÄÅÕàπô…Ω¥†âÕ—Ω…ï}âÖëùïÃà§πÕï±ïç–†à®à§πïƒ†âÖç—•Ÿîà∞Å—…’î§πΩ…ëï»†âÕΩ…—}Ω…ëï»à§πΩ…ëï»†â¡…•çï}¡Ω•π—Ãà§∞(ÄÄÄÄÄÅÕàπô…Ω¥†â’Õï…}âÖëùïÃà§πÕï±ïç–†ââÖëùï}πÖµîà§πïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§(ÄÄÄÅt§Ï((ÄÄÄÅïµΩ©•ÃÄÙÅ…ïÕ’±—Õl¡tπÕ—Ö—’ÃÄÙÙÙÄâô’±ô•±±ïêàÄ¸Å…ïÕ’±—Õl¡tπŸÖ±’î¸πëÖ—ÑÄËÅπ’±∞Ï(ÄÄÄÅµÂµΩ©•ÃÄÙÅ…ïÕ’±—Õl≈tπÕ—Ö—’ÃÄÙÙÙÄâô’±ô•±±ïêàÄ¸Å…ïÕ’±—Õl≈tπŸÖ±’î¸πëÖ—ÑÄËÅπ’±∞Ï(ÄÄÄÅ¡±ÖπÃÄÙÅ…ïÕ’±—Õl…tπÕ—Ö—’ÃÄÙÙÙÄâô’±ô•±±ïêàÄ¸Å…ïÕ’±—Õl…tπŸÖ±’îÄËÅmtÏ(ÄÄÄÅÕ—Ω…ï%—ïµÃÄÙÅ…ïÕ’±—ÕlÕtπÕ—Ö—’ÃÄÙÙÙÄâô’±ô•±±ïêàÄ¸Å…ïÕ’±—ÕlÕtπŸÖ±’î¸πëÖ—ÑÄËÅπ’±∞Ï(ÄÄÄÅµÂ%—ïµÃÄÙÅ…ïÕ’±—Õl—tπÕ—Ö—’ÃÄÙÙÙÄâô’±ô•±±ïêàÄ¸Å…ïÕ’±—Õl—tπŸÖ±’î¸πëÖ—ÑÄËÅπ’±∞Ï(ÄÄÄÅ¡…•çïÕÖ—ÑÄÙÅ…ïÕ’±—Õl’tπÕ—Ö—’ÃÄÙÙÙÄâô’±ô•±±ïêàÄ¸Å…ïÕ’±—Õl’tπŸÖ±’î¸πëÖ—ÑÄËÅπ’±∞Ï(ÄÄÄÅÕ—Ω…ï	ÖëùïÃÄÙÅ…ïÕ’±—ÕlŸtπÕ—Ö—’ÃÄÙÙÙÄâô’±ô•±±ïêàÄ¸Å…ïÕ’±—ÕlŸtπŸÖ±’î¸πëÖ—ÑÄËÅπ’±∞Ï(ÄÄÄÅµÂ	ÖëùïÃÄÙÅ…ïÕ’±—Õl›tπÕ—Ö—’ÃÄÙÙÙÄâô’±ô•±±ïêàÄ¸Å…ïÕ’±—Õl›tπŸÖ±’î¸πëÖ—ÑÄËÅπ’±∞Ï((ÄÄÄÅ…ïÕ’±—ÃπôΩ…Öç††°»∞Å§§ÄÙ¯ÅÏÅ•òÄ°»πÕ—Ö—’ÃÄÙÙÙÄâ…ï©ïç—ïêà§ÅçΩπÕΩ±îπ±Ωú†âQ•ïπëÑËÅôÖ±≥ÃÅ±ÑÅçΩπÕ’±—ÑÄåàÄ¨Å§∞Å»π…ïÖÕΩ∏§ÏÅÙ§Ï(ÄÅÙÅçÖ—ç†Ä°î§ÅÏ(ÄÄÄÅçΩπÕΩ±îπ±Ωú†â……Ω»ÅçÖ…ùÖπëºÅ±ÑÅ—•ïπëÑËà∞Åî§Ï(ÄÄÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄÒ¿Åç±ÖÕÃÙâï……Ω»µµÕúà˘9ºÅÕîÅ¡’ëºÅçÖ…ùÖ»Å±ÑÅ—•ïπëÑ∏ÅA…ΩãÑÅ…ïçÖ…ùÖ»Å±ÑÅ√Öù•πÑ∏Ω¿˘ÄÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅµÂµΩ©•Mï–ÄÙÅπï‹ÅMï–†°µÂµΩ©•ÃÅÒÅmt§πµÖ¿°îÄÙ¯ÅîπïµΩ©§§§Ï(ÄÅçΩπÕ–ÅµÂ%—ïµMï–ÄÙÅπï‹ÅMï–†°µÂ%—ïµÃÅÒÅmt§πµÖ¿°§ÄÙ¯Å§π•—ïµ}•ê§§Ï(ÄÅçΩπÕ–ÅµÂ	ÖëùïMï–ÄÙÅπï‹ÅMï–†°µÂ	ÖëùïÃÅÒÅmt§πµÖ¿°àÄÙ¯ÅàπâÖëùï}πÖµî§§Ï(ÄÅçΩπÕ–ÅµÂA±Ö∏ÄÙÅ¡±ÖπÃπô•πê°¿ÄÙ¯Å¿π•êÄÙÙÙÅç’……ïπ—A…Ωô•±îπ¡±Öπ}•ê§Ï(ÄÅçΩπÕ–ÅçÖπ	ΩΩÕ–ÄÙÅµÂA±Ö∏ÄòòÅµÂA±Ö∏π•êÄÑÙÙÄâÕ—ÖπëÖ…êàÏ(ÄÅçΩπÕ–Å¡±ÖπA…•çïÃÄÙÄ°¡…•çïÕÖ—ÑÄòòÅ¡…•çïÕÖ—ÑπΩ¨ÄòòÅ¡…•çïÕÖ—Ñπ¡…•çïÃ§Ä¸Å¡…•çïÕÖ—Ñπ¡…•çïÃÄËÅÌÙÏ(ÄÅçΩπÕ–ÅâΩΩÕ—A…•çîÄÙÅµÂA±Ö∏¸π•êÄÙÙÙÄâë•ÖµÖπ—îàÄ¸Ä°¡±ÖπA…•çïÃπâΩΩÕ—}¡…•çï}ë•ÖµÖπ—îÄ¸¸ÄƒÃ‘¿¿§ÄËÄ°¡±ÖπA…•çïÃπâΩΩÕ—}¡…•çï}¡±’ÃÄ¸¸ÄÃ‘¿¿§Ï(ÄÅçΩπÕ–Å¡±ÖπIÖπ¨ÄÙÅÏÅÕ—ÖπëÖ…êË¿∞Å¡±’ÃËƒ∞Åë•ÖµÖπ—îË»ÅÙÏ(ÄÅçΩπÕ–Åç’……ïπ—A±ÖπIÖπ¨ÄÙÅ¡±ÖπIÖπ≠mç’……ïπ—A…Ωô•±îπ¡±Öπ}•ëtÄ¸¸Ä¿Ï((ÄÅçΩπÕ–Å•—ïµÕ	ÂÖ—ïùΩ…Â5Ö¿ÄÙÅÌÙÏ(ÄÄ°Õ—Ω…ï%—ïµÃÅÒÅmt§πôΩ…Öç†°•–ÄÙ¯ÅÏ(ÄÄÄÅ•—ïµÕ	ÂÖ—ïùΩ…Â5Ö¡m•–πçÖ—ïùΩ…ÂtÄÙÅ•—ïµÕ	ÂÖ—ïùΩ…Â5Ö¡m•–πçÖ—ïùΩ…ÂtÅÒÅmtÏ(ÄÄÄÅ•—ïµÕ	ÂÖ—ïùΩ…Â5Ö¡m•–πçÖ—ïùΩ…Âtπ¡’Õ†°•–§Ï(ÄÅÙ§Ï(ÄÅçΩπÕ–Å•—ïµÕ	ÂÖ—ïùΩ…‰ÄÙÅ=â©ïç–πïπ—…•ïÃ°•—ïµÕ	ÂÖ—ïùΩ…Â5Ö¿§Ï((ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒ†ƒÅç±ÖÕÃÙâ¡Öùîµ—•—±îà˚¬~n7æ‚<ÅQ•ïπëÑÅëîÅ¡’π—ΩÃΩ†ƒ¯(ÄÄÄÄÒ¿Åç±ÖÕÃÙâ¡ÖùîµÕ’àà˘	Ö±ÖπçîËÄÒÕ—…ΩπúÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§à¯ëÌç’……ïπ—A…Ωô•±îπ¡Ω•π—Õ}âÖ±ÖπçïÙÅ¡—ÃΩÕ—…Ωπú¯Ω¿¯((ÄÄÄÄÒë•ÿÅÕ—Â±îÙà(ÄÄÄÄÄÅë•Õ¡±Ö‰Èô±ï‡Ï(ÄÄÄÄÄÅùÖ¿Ë›¡‡Ï(ÄÄÄÄÄÅΩŸï…ô±Ω‹µ‡ÈÖ’—ºÏ(ÄÄÄÄÄÅ¡Öëë•πúË—¡‡Ä¿Äƒ¡¡‡Ï(ÄÄÄÄÄÅµÖ…ù•∏µâΩ——Ω¥Ë·¡‡Ï(ÄÄÄÄÄÅÕç…Ω±±âÖ»µ›•ë—†ÈπΩπîÏ(ÄÄÄÄà¯(ÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâëΩç’µïπ–πùï—±ïµïπ—	Â%ê†ùÕ—Ω…ïA±ÖπÃú§¸πÕç…Ω±±%π—ΩY•ï‹°Ìâï°ÖŸ•Ω»ËùÕµΩΩ—†ùÙ§àÅÕ—Â±îÙâ›°•—îµÕ¡ÖçîÈπΩ›…Ö¿Ì¡Öëë•πúË›¡‡Äƒ¡¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà˚¬~J8ÅA±ÖπïÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâëΩç’µïπ–πùï—±ïµïπ—	Â%ê†ùÕ—Ω…ï	ΩΩÕ–ú§¸πÕç…Ω±±%π—ΩY•ï‹°Ìâï°ÖŸ•Ω»ËùÕµΩΩ—†ùÙ§àÅÕ—Â±îÙâ›°•—îµÕ¡ÖçîÈπΩ›…Ö¿Ì¡Öëë•πúË›¡‡Äƒ¡¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà˚äjÑÅ	ΩΩÕ–Ωâ’——Ω∏¯(ÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâëΩç’µïπ–πùï—±ïµïπ—	Â%ê†ùÕ—Ω…ï	ÖëùïÃú§¸πÕç…Ω±±%π—ΩY•ï‹°Ìâï°ÖŸ•Ω»ËùÕµΩΩ—†ùÙ§àÅÕ—Â±îÙâ›°•—îµÕ¡ÖçîÈπΩ›…Ö¿Ì¡Öëë•πúË›¡‡Äƒ¡¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà˚¬~>Å5ïëÖ±±ÖÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâëΩç’µïπ–πùï—±ïµïπ—	Â%ê†ùÕ—Ω…ïµΩ©•Ãú§¸πÕç…Ω±±%π—ΩY•ï‹°Ìâï°ÖŸ•Ω»ËùÕµΩΩ—†ùÙ§àÅÕ—Â±îÙâ›°•—îµÕ¡ÖçîÈπΩ›…Ö¿Ì¡Öëë•πúË›¡‡Äƒ¡¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà˚¬~b8ÅµΩ©•ÃΩâ’——Ω∏¯(ÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅΩπç±•ç¨ÙâëΩç’µïπ–πùï—±ïµïπ—	Â%ê†ùÕ—Ω…ï·—…ÖÃú§¸πÕç…Ω±±%π—ΩY•ï‹°Ìâï°ÖŸ•Ω»ËùÕµΩΩ—†ùÙ§àÅÕ—Â±îÙâ›°•—îµÕ¡ÖçîÈπΩ›…Ö¿Ì¡Öëë•πúË›¡‡Äƒ¡¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ïà˚är†Å·—…ÖÃΩâ’——Ω∏¯(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄÒë•ÿÅ•êÙâÕ—Ω…ïA±ÖπÃàÅÕ—Â±îÙâÕç…Ω±∞µµÖ…ù•∏µ—Ω¿Ë‰¡¡‡Ïà¯(ÄÄÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ëƒ·¡‡Ïà˚¬~J8ÅA±ÖπïÃΩ†Ã¯(ÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë¥’¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ëƒ…¡‡Ïà¯(ÄÄÄÄÄÄÄÅΩµ¡ÖÀÑÅ±ΩÃÅ¡±ÖπïÃÅ‰Åµ•ÀÑÅç±Ö…Öµïπ—îÅç◊Ö∞Å—ïª•ÃÅÖç—•Ÿº∏(ÄÄÄÄÄÄΩ¿¯((ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–°Ö’—ºµô•–±µ•πµÖ‡†ƒ‰¡¡‡∞≈ô»§§ÌùÖ¿Ëƒ¡¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ë»—¡‡Ïà¯(ÄÄÄÄÄÄÄÄëÏ°¡±ÖπÃÅÒÅmt§πµÖ¿°¿ÄÙ¯ÅÏ(ÄÄÄÄÄÄÄÄÄÅçΩπÕ–Å•Õ’……ïπ–ÄÙÅ¿π•êÄÙÙÙÅç’……ïπ—A…Ωô•±îπ¡±Öπ}•êÏ(ÄÄÄÄÄÄÄÄÄÅçΩπÕ–Å…Öπ¨ÄÙÅ¡±ÖπIÖπ≠m¿π•ëtÄ¸¸Ä¿Ï(ÄÄÄÄÄÄÄÄÄÅçΩπÕ–ÅçÖπU¡ù…ÖëîÄÙÅ…Öπ¨Ä¯Åç’……ïπ—A±ÖπIÖπ¨ÄòòÅ¿π•êÄÑÙÙÄâÕ—ÖπëÖ…êàÏ(ÄÄÄÄÄÄÄÄÄÅçΩπÕ–Å¡±ÖπA…•çîÄÙÅ¿π•êÄÙÙÙÄâ¡±’Ãà(ÄÄÄÄÄÄÄÄÄÄÄÄ¸Å¡±ÖπA…•çïÃπ¡±Öπ}’¡ù…Öëï}¡…•çï}¡±’Ã(ÄÄÄÄÄÄÄÄÄÄÄÄËÅ¿π•êÄÙÙÙÄâë•ÖµÖπ—îà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¸Å¡±ÖπA…•çïÃπ¡±Öπ}’¡ù…Öëï}¡…•çï}ë•ÖµÖπ—î(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄËÄ¿Ï((ÄÄÄÄÄÄÄÄÄÅ…ï—’…∏ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÏ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅâΩ…ëï»ËëÌ•Õ’……ïπ–Ä¸Äà≈¡‡ÅÕΩ±•êÅ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏–»§àÄËÄà≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§âÙÏ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒ—¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅ¡Öëë•πúËƒ—¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩŸï…ô±Ω‹È°•ëëï∏Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌ•Õ’……ïπ–Ä¸ÄââΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä»—¡‡Å…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿‡§ÏàÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌ•Õ’……ïπ–Ä¸ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÌ—Ω¿ËÂ¡‡Ì…•ù°–ËÂ¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅôΩπ–µÕ•ÈîË·¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏»‡§Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿‹§Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅ¡Öëë•πúËÕ¡‡ÄŸ¡‡ÌâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡Ï(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄà˘QTÅA18Ωë•ÿ˘ÄÄËÄàâÙ((ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒŸ¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿ÌµÖ…ù•∏µâΩ——Ω¥Ë›¡‡Ïà¯ëÌïÕçÖ¡ï!—µ∞°¿ππÖµî•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÌùÖ¿Ë’¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µâΩ——Ω¥Ëƒ…¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿ˚äjÑÅ	ΩΩÕ–Å‡ëÌ¿πâΩΩÕ—}µ’±—•¡±•ï…ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿ˚¬~:ºÅQΩ¡îÅë•Ö…•ºËÄëÌ9’µâï»°¿πëÖ•±Â}çÖ¡}πΩ…µÖ∞ÅÒÄ¿§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙÅ¡—ÃΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿ˚¬~N0ÅY•ëïΩÃÅÖπç±ÖëΩÃËÄëÌ¿πµÖ·}¡•ππïë}Ÿ•ëïΩÃÅÒÄ¡ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÄÄÄÄëÌ•Õ’……ïπ–(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅë•ÕÖâ±ïêÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÌΩ¡Öç•—‰Ë∏ÿ‘Ïà˘ç—•ŸºΩâ’——Ω∏˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄËÅçÖπU¡ù…Öëî(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨Ùâ°Öπë±ï	’ÂA±Ö∏†úëÌ¿π•ëÙú§àÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅ5ï©Ω…Ö»É
‹ÄëÌ9’µâï»°¡±ÖπA…•çîÅÒÄ¿§π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙÅ¡—Ã(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩâ’——Ω∏˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄËÅÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅë•ÕÖâ±ïêÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÌΩ¡Öç•—‰Ë∏‘‘Ïà¯ëÌ…Öπ¨ÄÅç’……ïπ—A±ÖπIÖπ¨Ä¸ÄâA±Ö∏Å•πôï…•Ω»àÄËÄâ…Ö—•ÃâÙΩâ’——Ω∏˘ÅÙ(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ˘ÄÏ(ÄÄÄÄÄÄÄÅÙ§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄÒë•ÿÅ•êÙâÕ—Ω…ï	ÖëùïÃàÅÕ—Â±îÙâÕç…Ω±∞µµÖ…ù•∏µ—Ω¿Ë‰¡¡‡Ïà¯(ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë»—¡‡Ïà˚¬~>Å5ïëÖ±±ÖÃÅï·ç±’Õ•ŸÖÃΩ†Ã¯(ÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë¥’¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ëƒ…¡‡Ïà¯(ÄÄÄÄÄÅΩ±ïçç•ΩπÖ±ÖÃÅ¡Ö…ÑÅÕ•ïµ¡…îÅ‰Åï≈’•√ÑÅ°ÖÕ—ÑÄÃÅï∏Å—‘Å¡ï…ô•∞∏(ÄÄÄÄΩ¿¯((ÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–°Ö’—ºµô•±∞±µ•πµÖ‡†ƒ‘¡¡‡∞≈ô»§§ÌùÖ¿Ëƒ¡¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ë»—¡‡Ïà¯(ÄÄÄÄÄÄëÏ°Õ—Ω…ï	ÖëùïÃÅÒÅmt§π±ïπù—†Ä¸ÅÕ—Ω…ï	ÖëùïÃπµÖ¿°àÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êÅ±ÃµÕ—Ω…îµâÖëùîµçÖ…êÄëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â±ÖÕÃ°àπ…Ö…•—‰•Ùà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµÕ—Ω…îµâÖëùîµ•çΩ∏à¯ëÌàπâÖëùï}•çΩ∏ÅÒÄã¬~>âÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡ËƒÌôΩπ–µÕ•ÈîËƒ…¡‡ÌôΩπ–µ›ï•ù°–Ë‹¿¿ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯ëÌïÕçÖ¡ï!—µ∞°àπâÖëùï}πÖµî•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ãµ…Ö…•—‰µ—Öúà¯ëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â1Öâï∞°àπ…Ö…•—‰•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄëÌàπ•Õ}±•µ•—ïêÄ¸ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡ËƒÌôΩπ–µôÖµ•±‰Ëù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌôΩπ–µÕ•ÈîË·¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿Ì±ï——ï»µÕ¡Öç•πúË∏¿·ï¥ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏»»§ÌâÖç≠ù…Ω’πêÈ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿‘§Ì¡Öëë•πúËÕ¡‡Ä›¡‡ÌâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅ1%5%QÉ
‹ÄëÌ5Ö—†πµÖ‡†¿∞Å9’µâï»°àπÕ—Ωç≠}—Ω—Ö∞ÅÒÄ¿§Ä¥Å9’µâï»°àπÕ—Ωç≠}ÕΩ±êÅÒÄ¿§•ÙºëÌàπÕ—Ωç≠}—Ω—Ö±Ù(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌùï—1•µ•—ïëM—Ωç≠M—Ö—’Ã°à§ÄÙÙÙÄâ±ÖÕ–à(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒë•ÿÅç±ÖÕÃÙâ±Ãµ±•µ•—ïêµ’…ùïπç‰Å±Ãµ±•µ•—ïêµ±ÖÕ–à˚äjÄÉi1Q%5ÅU9%Ωë•ÿ˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄËÅùï—1•µ•—ïëM—Ωç≠M—Ö—’Ã°à§ÄÙÙÙÄâ±Ω‹à(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒë•ÿÅç±ÖÕÃÙâ±Ãµ±•µ•—ïêµ’…ùïπç‰à˚¬~RîÉi1Q%5LÄëÌ5Ö—†πµÖ‡†¿∞Å9’µâï»°àπÕ—Ωç≠}—Ω—Ö∞ÅÒÄ¿§Ä¥Å9’µâï»°àπÕ—Ωç≠}ÕΩ±êÅÒÄ¿§•ÙΩë•ÿ˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄËÄàâıÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµÕ—Ω…îµâÖëùîµëïÕåà¯ëÌïÕçÖ¡ï!—µ∞°àπëïÕç…•¡—•Ω∏ÅÒÄâ5ïëÖ±±ÑÅï·ç±’Õ•ŸÑÅëîÅ1•ŸïMç…Ω±∞∏à•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄëÌµÂ	ÖëùïMï–π°ÖÃ°àπâÖëùï}πÖµî§(ÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒë•ÿÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡ËƒÌôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§ÌµÖ…ù•∏µ—Ω¿Ë’¡‡Ïà˚ärLÅ∏Å—‘ÅçΩ±ïççßÕ∏Ωë•ÿ˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄËÄ°àπ•Õ}±•µ•—ïêÄòòÅ9’µâï»°àπÕ—Ωç≠}ÕΩ±êÅÒÄ¿§Ä¯ÙÅ9’µâï»°àπÕ—Ωç≠}—Ω—Ö∞ÅÒÄ¿§§(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒë•ÿÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡ËƒÌôΩπ–µÕ•ÈîËƒ¡¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë’¡‡Ïà˘=QΩë•ÿ˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄËÅÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡ËƒÌ¡Öëë•πúËŸ¡‡Äƒ¡¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡ÌµÖ…ù•∏µ—Ω¿Ë’¡‡Ïà(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅΩπç±•ç¨Ùâ°Öπë±ï	’ÂM—Ω…ï	Öëùî†úëÌàπ•ëÙú§à¯ëÌ9’µâï»°àπ¡…•çï}¡Ω•π—Ã§ÄÙÙÙÄ¿Ä¸ÄâIQ%LàÄËÅÄëÌàπ¡…•çï}¡Ω•π—ÕÙÅ¡—ÕÅÙΩâ’——Ω∏˘ÅÙ(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÅÄ§π©Ω•∏†àà§ÄËÅÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘QΩëÖ€µÑÅπºÅ°Ö‰ÅµïëÖ±±ÖÃÅë•Õ¡Ωπ•â±ïÃ∏Ω¿˘ÅÙ(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄΩë•ÿ¯((ÄÄÄÄÒë•ÿÅ•êÙâÕ—Ω…ïµΩ©•ÃàÅÕ—Â±îÙâÕç…Ω±∞µµÖ…ù•∏µ—Ω¿Ë‰¡¡‡Ïà¯(ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë»—¡‡Ïà˚¬~b8ÅµΩ©•ÃÅï·ç±’Õ•ŸΩÃΩ†Ã¯(ÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÏÅù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–°Ö’—ºµô•±∞±µ•πµÖ‡†ƒ»¡¡‡∞≈ô»§§ÏÅùÖ¿Ëƒ¡¡‡ÏÅµÖ…ù•∏µâΩ——Ω¥Ë»—¡‡Ïà¯(ÄÄÄÄÄÄëÏ°ïµΩ©•ÃÅÒÅmt§πµÖ¿°îÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êÅ±ÃµÕ—Ω…îµâÖëùîµçÖ…êÄëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â±ÖÕÃ°îπ…Ö…•—‰ÅÒÄâçΩµ’∏à•ÙàÅÕ—Â±îÙâ—ï·–µÖ±•ù∏Èçïπ—ï»Ìµ•∏µ°ï•ù°–Ëƒ‹¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ÃµÕ—Ω…îµâÖëùîµ•çΩ∏àÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÃ—¡‡Ïà¯ëÌîπïµΩ©•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡ËƒÌôΩπ–µÕ•ÈîËƒ…¡‡ÌôΩπ–µ›ï•ù°–Ë‹¿¿ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§Ïà¯ëÌïÕçÖ¡ï!—µ∞°îππÖµî•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±Ãµ…Ö…•—‰µ—Öúà¯ëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â1Öâï∞°îπ…Ö…•—‰ÅÒÄâçΩµ’∏à•ÙΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄëÌîπ•Õ}±•µ•—ïêÄ¸ÅÄ(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡ËƒÌôΩπ–µôÖµ•±‰Ëù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌôΩπ–µÕ•ÈîË·¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿Ì±ï——ï»µÕ¡Öç•πúË∏¿·ï¥ÌçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏»»§ÌâÖç≠ù…Ω’πêÈ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿‘§Ì¡Öëë•πúËÕ¡‡Ä›¡‡ÌâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅ1%5%QÉ
‹ÄëÌ5Ö—†πµÖ‡†¿∞Å9’µâï»°îπÕ—Ωç≠}—Ω—Ö∞ÅÒÄ¿§µ9’µâï»°îπÕ—Ωç≠}ÕΩ±êÅÒÄ¿§•ÙºëÌîπÕ—Ωç≠}—Ω—Ö±Ù(ÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌùï—1•µ•—ïëM—Ωç≠M—Ö—’Ã°î§ÄÙÙÙÄâ±ÖÕ–à(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒë•ÿÅç±ÖÕÃÙâ±Ãµ±•µ•—ïêµ’…ùïπç‰Å±Ãµ±•µ•—ïêµ±ÖÕ–à˚äjÄÉi1Q%5ÅU9%Ωë•ÿ˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄËÅùï—1•µ•—ïëM—Ωç≠M—Ö—’Ã°î§ÄÙÙÙÄâ±Ω‹à(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒë•ÿÅç±ÖÕÃÙâ±Ãµ±•µ•—ïêµ’…ùïπç‰à˚¬~RîÉi1Q%5LÄëÌ5Ö—†πµÖ‡†¿∞Å9’µâï»°îπÕ—Ωç≠}—Ω—Ö∞ÅÒÄ¿§µ9’µâï»°îπÕ—Ωç≠}ÕΩ±êÅÒÄ¿§•ÙΩë•ÿ˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄËÄàâıÄÄËÄàâÙ((ÄÄÄÄÄÄÄÄÄÄëÌµÂµΩ©•Mï–π°ÖÃ°îπïµΩ©§§(ÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒÕ¡Ö∏ÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡ËƒÌôΩπ–µÕ•ÈîËƒ¡¡‡ÌçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§ÌµÖ…ù•∏µ—Ω¿Ë’¡‡Ïà˚ärLÅ∏Å—‘ÅçΩ±ïççßÕ∏ΩÕ¡Ö∏˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄËÄ°îπ•Õ}±•µ•—ïêÄòòÅ9’µâï»°îπÕ—Ωç≠}ÕΩ±êÅÒÄ¿§Ä¯ÙÅ9’µâï»°îπÕ—Ωç≠}—Ω—Ö∞ÅÒÄ¿§§(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒÕ¡Ö∏ÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡ËƒÌôΩπ–µÕ•ÈîËƒ¡¡‡ÌôΩπ–µ›ï•ù°–Ë‰¿¿ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌµÖ…ù•∏µ—Ω¿Ë’¡‡Ïà˘=Q<ΩÕ¡Ö∏˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄËÅÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡ËƒÌ¡Öëë•πúËŸ¡‡Äƒ¡¡‡ÌôΩπ–µÕ•ÈîËƒ¡¡‡ÌµÖ…ù•∏µ—Ω¿Ë’¡‡ÏàÅΩπç±•ç¨Ùâ°Öπë±ï	’ÂµΩ©§†úëÌîπ•ëÙú§à¯ëÌ9’µâï»°îπ¡…•çï}¡Ω•π—Ã§ÄÙÙÙÄ¿Ä¸ÄâIQ%LàÄËÅÄëÌîπ¡…•çï}¡Ω•π—ÕÙÅ¡—ÕÅÙΩâ’——Ω∏˘ÅÙ(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÅÄ§π©Ω•∏†àà•Ù(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄΩë•ÿ¯((ÄÄÄÄÒë•ÿÅ•êÙâÕ—Ω…ï	ΩΩÕ–àÅÕ—Â±îÙâÕç…Ω±∞µµÖ…ù•∏µ—Ω¿Ë‰¡¡‡Ïà¯(ÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë»—¡‡Ïà˚äjÑÅ	ΩΩÕ–Åï·—…ÑΩ†Ã¯(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ë»—¡‡Ïà¯(ÄÄÄÄÄÄëÌçÖπ	ΩΩÕ–Ä¸ÅÄ(ÄÄÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡Ïà˘ç—•€ÑÅ’∏ÅâΩΩÕ–Å‡ëÌµÂA±Ö∏πâΩΩÕ—}µ’±—•¡±•ï…ÙÅ¡Ω»Ä»—°ÃÅÖ°Ω…ÑÅµ•Õµº∞ÅÖ¡Ö…—îÅëï∞Åù…Ö—•ÃÅëîÅ—‘Å¡±Ö∏∏Ω¿¯(ÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅΩπç±•ç¨Ùâ°Öπë±ï	’Â	ΩΩÕ–†§à˘Ωµ¡…Ö»ÅâΩΩÕ–ÉäPÄëÌâΩΩÕ—A…•çïÙÅ¡—ÃΩâ’——Ω∏¯(ÄÄÄÄÄÅÄÄËÅÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘Õ—îÅâïπïô•ç•ºÅïÃÅÕΩ±ºÅ¡Ö…ÑÅ¡±ÖπïÃÅA±’ÃÅºÅ•ÖµÖπ—î∏Ω¿˘ÅÙ(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄΩë•ÿ¯((ÄÄÄÄÒë•ÿÅ•êÙâÕ—Ω…ï·—…ÖÃàÅÕ—Â±îÙâÕç…Ω±∞µµÖ…ù•∏µ—Ω¿Ë‰¡¡‡Ïà¯(ÄÄÄÄëÌ•—ïµÕ	ÂÖ—ïùΩ…‰π±ïπù—†Ä¸Å•—ïµÕ	ÂÖ—ïùΩ…‰πµÖ¿†°mçÖ—ïùΩ…‰∞Å•—ïµÕt§ÄÙ¯ÅÄ(ÄÄÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë»—¡‡Ïà¯ëÌM—…•πú°çÖ—ïùΩ…‰§π—Ω1Ω›ï…ÖÕî†§ÄÙÙÙÄâ—•—±îàÄ¸Äã¬~>ﬂæ‚<ÅSµ—’±ΩÃÅëîÅ¡ï…ô•∞àÄËÅÉär†ÄëÌïÕçÖ¡ï!—µ∞°çÖ—ïùΩ…‰•ıÅÙΩ†Ã¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èù…•êÏÅù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–°Ö’—ºµô•±∞±µ•πµÖ‡†ƒ»¡¡‡∞≈ô»§§ÏÅùÖ¿Ëƒ¡¡‡ÏÅµÖ…ù•∏µâΩ——Ω¥Ë»—¡‡Ïà¯(ÄÄÄÄÄÄÄÄëÌ•—ïµÃπµÖ¿°•–ÄÙ¯ÅÏ(ÄÄÄÄÄÄÄÄÄÅçΩπÕ–Å•ÕQ•—±îÄÙÅM—…•πú°•–πçÖ—ïùΩ…‰ÅÒÄàà§π—Ω1Ω›ï…ÖÕî†§ÄÙÙÙÄâ—•—±îàÏ(ÄÄÄÄÄÄÄÄÄÅçΩπÕ–Å•—ïµIÖ…•—‰ÄÙÅπΩ…µÖ±•ÈïA…Ωô•±ïQ•—±ïIÖ…•—‰°•–π…Ö…•—‰§Ï(ÄÄÄÄÄÄÄÄÄÅçΩπÕ–Å…Ö…•—Â±ÖÕÃÄÙÅ•ÕQ•—±îÄ¸Åùï—M—Ω…ï	ÖëùïIÖ…•—Â±ÖÕÃ°•—ïµIÖ…•—‰§ÄËÄààÏ(ÄÄÄÄÄÄÄÄÄÅ…ï—’…∏ÅÄ(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êÄëÌ•ÕQ•—±îÄ¸ÅÅ±ÃµÕ—Ω…îµâÖëùîµçÖ…êÄëÌ…Ö…•—Â±ÖÕÕıÄÄËÄàâÙàÅÕ—Â±îÙâ—ï·–µÖ±•ù∏Èçïπ—ï»Ïà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙàëÌ•ÕQ•—±îÄ¸Äâ±ÃµÕ—Ω…îµâÖëùîµ•çΩ∏àÄËÄàâÙàÅÕ—Â±îÙâôΩπ–µÕ•ÈîËÃ¡¡‡ÏëÌ•ÕQ•—±îÄ¸ÄâµÖ…ù•∏µ±ïô–ÈÖ’—ºÌµÖ…ù•∏µ…•ù°–ÈÖ’—ºÏàÄËÄàâÙà¯ëÌ•–π•çΩπÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÏÅµÖ…ù•∏Ë—¡‡Ä¿Ïà¯ëÌïÕçÖ¡ï!—µ∞°•–ππÖµî•ÙΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄëÌ•ÕQ•—±îÄ¸ÅÄÒë•ÿÅç±ÖÕÃÙâ±Ãµ…Ö…•—‰µ—Öúà¯ëÌùï—M—Ω…ï	ÖëùïIÖ…•—Â1Öâï∞°•—ïµIÖ…•—‰•ÙΩë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄëÌµÂ%—ïµMï–π°ÖÃ°•–π•ê§(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒÕ¡Ö∏ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ≈¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§Ïà˚ärLÅQïª•ÃÅïÕ—îΩÕ¡Ö∏˘Ä(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄËÅÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ¡Öëë•πúË—¡‡Ä·¡‡ÏÅôΩπ–µÕ•ÈîËƒ≈¡‡ÏàÅΩπç±•ç¨Ùâ°Öπë±ï	’ÂM—Ω…ï%—ï¥†úëÌ•–π•ëÙú§à¯ëÌ•–π¡…•çï}¡Ω•π—ÕÙÅ¡—ÃΩâ’——Ω∏˘ÅÙ(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÅÅÙ§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÅÄ§π©Ω•∏†àà§ÄËÄàâıÄÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï	’ÂµΩ©§°ïµΩ©•%ê§ÅÏ(ÄÅçΩπÕ–Åâ—∏ÄÙÅëΩç’µïπ–π≈’ï…ÂMï±ïç—Ω»°ÅmΩπç±•ç¨Ùâ°Öπë±ï	’ÂµΩ©§†úëÌïµΩ©•%ëÙú§âuÄ§Ï(ÄÅçΩπÕ–Å•Õ…ïîÄÙÅâ—∏¸π—ï·—Ωπ—ïπ–¸π—…•¥†§ÄÙÙÙÄâIQ%LàÏ((ÄÅ•òÄ†ÖçΩπô•…¥°•Õ…ïî(ÄÄÄÄ¸Äã
˝Iïç±ÖµÖ»ÅïÕ—îÅïµΩ©§Åù…Ö—•Ã¸ÅE’ïëÖÀÑÅï∏Å—‘ÅçΩ±ïççßÕ∏∏à(ÄÄÄÄËÄã
˝Ωµ¡…Ö»ÅïÕ—îÅïµΩ©§¸ÅE’ïëÖÀÑÅï∏Å—‘ÅçΩ±ïççßÕ∏∏à§§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†ââ’Â}ïµΩ©§à∞ÅÏ(ÄÄÄÅ¡}’Õï…}•êËÅç’……ïπ—UÕï»π•ê∞(ÄÄÄÅ¡}ïµΩ©•}•êËÅïµΩ©•%ê(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅçΩπÕ–ÅµÕùÃÄÙÅÏ(ÄÄÄÄÄÅÕÖ±ëΩ}•πÕ’ô•ç•ïπ—îËâ9ºÅ—ïª•ÃÅÕ’ô•ç•ïπ—ïÃÅ¡’π—ΩÃ∏à∞(ÄÄÄÄÄÅÂÖ}±Ω}—ïπïÃËâeÑÅ—ïª•ÃÅïÕ—îÅïµΩ©§∏à∞(ÄÄÄÄÄÅπΩ}ë•Õ¡Ωπ•â±îËâÕ—îÅïµΩ©§ÅÂÑÅπºÅïÕ”ÑÅë•Õ¡Ωπ•â±î∏à∞(ÄÄÄÄÄÅÖùΩ—ÖëºËâÕ—ÑÅïë•çßÕ∏Å±•µ•—ÖëÑÅÕîÅÖùΩ”Ã∏à(ÄÄÄÅÙÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°µÕùÕmëÖ—Ñ¸πï……Ω…tÅÒÄâ9ºÅÕîÅ¡’ëºÅΩâ—ïπï»Åï∞ÅïµΩ©§à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅç’……ïπ—A…Ωô•±îπ¡Ω•π—Õ}âÖ±ÖπçîÄÙÅ9’µâï»°ëÖ—Ñππï›}âÖ±ÖπçîÄ¸¸Åç’……ïπ—A…Ωô•±îπ¡Ω•π—Õ}âÖ±Öπçî§Ï(ÄÅ’¡ëÖ—ï	Ö±ÖπçïU$†§Ï((ÄÅçΩπÕ–ÅÕï…•Ö±Qï·–ÄÙÅëÖ—ÑπÕï…•Ö±}π’µâï»ÄòòÅëÖ—ÑπÕ—Ωç≠}—Ω—Ö∞(ÄÄÄÄ¸ÅÄÉ
‹ÄåëÌëÖ—ÑπÕï…•Ö±}π’µâï…ÙºëÌëÖ—ÑπÕ—Ωç≠}—Ω—Ö±ıÄ(ÄÄÄÄËÄààÏ((ÄÅÕ°Ω›QΩÖÕ–°É
ÖïÕâ±Ω≈’ïÖÕ—îÄëÌëÖ—ÑπïµΩ©•ÙÑëÌÕï…•Ö±Qï·—ıÄ§Ï(ÄÅ…ïπëï…M—Ω…î†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï	’Â	ΩΩÕ–†§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†ââ’Â}ï·—…Ö}âΩΩÕ–à∞ÅÏÅ¡}’Õï…}•êËÅç’……ïπ—UÕï»π•êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏ(ÄÄÄÅçΩπÕ–ÅµÕùÃÄÙÅÏÅÕÖ±ëΩ}•πÕ’ô•ç•ïπ—îËÄâ9ºÅ—ïª•ÃÅÕ’ô•ç•ïπ—ïÃÅ¡’π—ΩÃ∏à∞ÅâΩΩÕ—}ÂÖ}Öç—•ŸºËÄâeÑÅ—ïª•ÃÅ’∏ÅâΩΩÕ–ÅÖç—•Ÿº∏àÅÙÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°µÕùÕmëÖ—Ñ¸πï……Ω…tÅÒÄâ9ºÅÕîÅ¡’ëºÅçΩµ¡…Ö»à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅÖ›Ö•–Å±ΩÖëA…Ωô•±î†§Ï(ÄÅ’¡ëÖ—ï	Ö±ÖπçïU$†§Ï(ÄÅÕ°Ω›QΩÖÕ–†ã
Ö	ΩΩÕ–ÅÖç—•ŸÖëºÅ¡Ω»Ä»—°ÃÑà§Ï(ÄÅ…ïπëï…M—Ω…î†§Ï)Ù(()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï	’ÂM—Ω…ï	Öëùî°âÖëùï%ê§ÅÏ(ÄÅçΩπÕ–ÅâÖëùïÖ…êÄÙÅëΩç’µïπ–π≈’ï…ÂMï±ïç—Ω»°ÅmΩπç±•ç¨Ùâ°Öπë±ï	’ÂM—Ω…ï	Öëùî†úëÌâÖëùï%ëÙú§âuÄ§Ï(ÄÅçΩπÕ–Å•Õ…ïîÄÙÅâÖëùïÖ…ê¸π—ï·—Ωπ—ïπ–¸π—…•¥†§ÄÙÙÙÄâIQ%LàÏ((ÄÅ•òÄ†ÖçΩπô•…¥°•Õ…ïî(ÄÄÄÄ¸Äã
˝Iïç±ÖµÖ»ÅïÕ—ÑÅµïëÖ±±ÑÅù…Ö—•Ã¸ÅE’ïëÖÀÑÅ¡ï…µÖπïπ—ïµïπ—îÅï∏Å—‘ÅçΩ±ïççßÕ∏∏à(ÄÄÄÄËÄã
˝Ωµ¡…Ö»ÅïÕ—ÑÅµïëÖ±±Ñ¸ÅE’ïëÖÀÑÅ¡ï…µÖπïπ—ïµïπ—îÅï∏Å—‘ÅçΩ±ïççßÕ∏∏à§§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†ââ’Â}Õ—Ω…ï}âÖëùîà∞ÅÏ(ÄÄÄÅ¡}âÖëùï}•êËÅâÖëùï%ê(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅçΩπÕΩ±îπï……Ω»†âΩµ¡…ÑÅëîÅµïëÖ±±ÑÅôÖ±≥ÃËà∞Åï……Ω»ÅÒÅëÖ—Ñ§Ï(ÄÄÄÅçΩπÕ–ÅçΩëîÄÙÅëÖ—Ñ¸πï……Ω»ÅÒÄààÏ(ÄÄÄÅçΩπÕ–ÅµïÕÕÖùïÃÄÙÅÏ(ÄÄÄÄÄÅÕÖ±ëΩ}•πÕ’ô•ç•ïπ—îËâ9ºÅ—ïª•ÃÅÕ’ô•ç•ïπ—ïÃÅ¡’π—ΩÃ∏à∞(ÄÄÄÄÄÅÂÖ}±Ö}—ïπïÃËâeÑÅ—ïª•ÃÅïÕ—ÑÅµïëÖ±±Ñ∏à∞(ÄÄÄÄÄÅπΩ}ë•Õ¡Ωπ•â±îËâÕ—ÑÅµïëÖ±±ÑÅÂÑÅπºÅïÕ”ÑÅë•Õ¡Ωπ•â±î∏à∞(ÄÄÄÄÄÅÖùΩ—ÖëÑËâÕ—ÑÅïë•çßÕ∏Å±•µ•—ÖëÑÅÕîÅÖùΩ”Ã∏à∞(ÄÄÄÄÄÅπΩ—}Ö’—°ïπ—•çÖ—ïêËâQ‘ÅÕïÕßÕ∏ÅπïçïÕ•—ÑÅ…ïπΩŸÖ…Õî∏à(ÄÄÄÅÙÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°µïÕÕÖùïÕmçΩëïtÅÒÄâ9ºÅÕîÅ¡’ëºÅçΩµ¡…Ö»Å±ÑÅµïëÖ±±Ñà§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅç’……ïπ—A…Ωô•±îπ¡Ω•π—Õ}âÖ±ÖπçîÄÙÅ9’µâï»°ëÖ—Ñππï›}âÖ±ÖπçîÄ¸¸Åç’……ïπ—A…Ωô•±îπ¡Ω•π—Õ}âÖ±Öπçî§Ï(ÄÅ’¡ëÖ—ï	Ö±ÖπçïU$†§Ï((ÄÄººÅΩ…ÈÖµΩÃÅ…ïô…ïÕçºÅëï∞Å¡ï…ô•∞Å¡Ö…ÑÅ≈’îÅÖ¡Ö…ïÈçÑÅ•πµïë•Ö—Öµïπ—î(ÄÄººÅï∏Å±ÑÅ±•Õ—ÑÅëîÅµïëÖ±±ÖÃÅï≈’•¡Öâ±ïÃ∏(ÄÅ±ÕAï…ôÖç°îπ¡…Ωô•±ïY•ëïΩÃπÖ–ÄÙÄ¿Ï((ÄÅÕ°Ω›QΩÖÕ–°É¬~>É
ÑëÌëÖ—ÑπâÖëùï}πÖµîÅÒÄâ5ïëÖ±±ÑâÙÅÖù…ïùÖëÑÅÑÅ—‘ÅçΩ±ïççßÕ∏ÖÄ§Ï(ÄÅ…ïπëï…M—Ω…î†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï	’ÂM—Ω…ï%—ï¥°•—ïµ%ê§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†ââ’Â}Õ—Ω…ï}•—ï¥à∞ÅÏÅ¡}•—ïµ}•êËÅ•—ïµ%êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏ(ÄÄÄÅçΩπÕ–ÅµÕùÃÄÙÅÏÅÕÖ±ëΩ}•πÕ’ô•ç•ïπ—îËÄâ9ºÅ—ïª•ÃÅÕ’ô•ç•ïπ—ïÃÅ¡’π—ΩÃ∏à∞ÅÂÖ}±Ω}—ïπïÃËÄâeÑÅ—ïª•ÃÅïÕ—îÅÖ…”µç’±º∏à∞ÅπΩ}ë•Õ¡Ωπ•â±îËÄâÕ—îÅÖ…”µç’±ºÅÂÑÅπºÅïÕ”ÑÅë•Õ¡Ωπ•â±î∏àÅÙÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°µÕùÕmëÖ—Ñ¸πï……Ω…tÅÒÄâ9ºÅÕîÅ¡’ëºÅçΩµ¡…Ö»à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅÖ›Ö•–Å±ΩÖëA…Ωô•±î†§Ï(ÄÅ’¡ëÖ—ï	Ö±ÖπçïU$†§Ï(ÄÅÕ°Ω›QΩÖÕ–†ã
ÖΩµ¡…ÑÅ…ïÖ±•ÈÖëÑÑÅIïŸ•œÑÅ5§ÅçΩ±ïççßÕ∏Å¡Ö…ÑÅï≈’•¡Ö…±º∏à§Ï(ÄÅ…ïπëï…M—Ω…î†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï	’ÂA±Ö∏°¡±Öπ%ê§ÅÏ(ÄÅ•òÄ†ÖçΩπô•…¥°É
˝Öµâ•Ö»Å—‘Å¡±Ö∏Å’ÕÖπëºÅ¡’π—ΩÃ¸ÅÕ—ºÅ—îÅŸÑÅÑÅëïÕçΩπ—Ö»Åï∞ÅÕÖ±ëºÅçΩ……ïÕ¡Ωπë•ïπ—îπÄ§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†ââ’Â}¡±Öπ}›•—°}¡Ω•π—Ãà∞ÅÏÅ¡}’Õï…}•êËÅç’……ïπ—UÕï»π•ê∞Å¡}¡±Öπ}•êËÅ¡±Öπ%êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–°ëÖ—Ñ¸πï……Ω»ÄÙÙÙÄâÕÖ±ëΩ}•πÕ’ô•ç•ïπ—îàÄ¸Äâ9ºÅ—ïª•ÃÅÕ’ô•ç•ïπ—ïÃÅ¡’π—ΩÃ∏àÄËÄâ9ºÅÕîÅ¡’ëºÅçÖµâ•Ö»à§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅÖ›Ö•–Å±ΩÖëA…Ωô•±î†§Ï(ÄÅ’¡ëÖ—ï	Ö±ÖπçïU$†§Ï(ÄÅÕ°Ω›QΩÖÕ–†ã
ÖA±Ö∏ÅÖç—’Ö±•ÈÖëºÑà§Ï(ÄÅ…ïπëï…M—Ω…î†§Ï)Ù()±ï–Å¡±ÖπÕÖç°îÄÙÅπ’±∞Ï()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖëA±ÖπÃ†§ÅÏ(ÄÅ•òÄ°¡±ÖπÕÖç°î§Å…ï—’…∏Å¡±ÖπÕÖç°îÏ(ÄÅçΩπÕ–ÅÏÅëÖ—ÑÅÙÄÙÅÖ›Ö•–ÅÕàπô…Ω¥†â¡±ÖπÃà§πÕï±ïç–†à®à§πΩ…ëï»†â¡…•çï}Ö…Ãà∞ÅÏÅÖÕçïπë•πúËÅ—…’îÅÙ§Ï(ÄÅ¡±ÖπÕÖç°îÄÙÅëÖ—ÑÅÒÅmtÏ(ÄÅ…ï—’…∏Å¡±ÖπÕÖç°îÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏Å…ïπëï…A±ÖπÃ°…ïπëï…QΩ≠ï∏ÄÙÅ±ÕQÖâIïπëï…QΩ≠ï∏§ÅÏ(ÄÅçΩπÕ–ÅµÖ•∏ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÖ¡¡Y•ï‹à§Ï(ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄÒ¿˘Ö…ùÖπëºÅ¡±ÖπïÃ∏∏∏Ω¿˘ÄÏ((ÄÄººÅA±ÖπïÃ∞ÅëÖ—ΩÃÅëîÅ¡ÖùºÅ‰ÅÕΩ±•ç•—’ëïÃÅπºÅëï¡ïπëï∏Åïπ—…îÅœ¥∏Å∞ÅçÖ…ùÖ…±ΩÃ(ÄÄººÅ©’π—ΩÃÅïŸ•—ÖµΩÃÅ—…ïÃÅïÕ¡ï…ÖÃÅçΩπÕïç’—•ŸÖÃÅçÖëÑÅŸïËÅ≈’îÅÕîÅÖâ…îÅ±ÑÅÕïççßÕ∏∏(ÄÅçΩπÕ–Åm¡ÖÂµïπ—IïÕ’±–∞Å¡±ÖπÃ∞Å…ï≈’ïÕ—ÕIïÕ’±—tÄÙÅÖ›Ö•–ÅA…Ωµ•ÕîπÖ±∞°l(ÄÄÄÅÕàπô…Ω¥†âÖ¡¡}—ï·—}çΩπô•úà§(ÄÄÄÄÄÄπÕï±ïç–†â≠ï‰±ŸÖ±’îà§(ÄÄÄÄÄÄπ•∏†â≠ï‰à∞Ålâ¡±ÖπÕ}Ÿ•Õ•â•±•—‰à∞Äâ¡ÖÂµïπ—}çŸ‘à∞Äâ¡ÖÂµïπ—}Ö±•ÖÃât§∞(ÄÄÄÅ±ΩÖëA±ÖπÃ†§∞(ÄÄÄÅÕàπô…Ω¥†âÕ’âÕç…•¡—•Ωπ}…ï≈’ïÕ—Ãà§(ÄÄÄÄÄÄπÕï±ïç–†à®à§(ÄÄÄÄÄÄπïƒ†â’Õï…}•êà∞Åç’……ïπ—UÕï»π•ê§(ÄÄÄÄÄÄπΩ…ëï»†âç…ïÖ—ïë}Ö–à∞ÅÏÅÖÕçïπë•πúËÅôÖ±ÕîÅÙ§(ÄÄÄÄÄÄπ±•µ•–†‘§(ÄÅt§Ï((ÄÄººÅUπÑÅ…ïÕ¡’ïÕ—ÑÅŸ•ï©ÑÅπºÅëïâîÅ…ïïµ¡±ÖÈÖ»Å±ÑÅ¡ïÕ—á≈ÑÅ≈’îÅï∞Å’Õ’Ö…•ºÅÖâ…ßÃÅëïÕ¡◊•Ã∏(ÄÅ•òÄ°…ïπëï…QΩ≠ï∏ÄÑÙÙÅ±ÕQÖâIïπëï…QΩ≠ï∏ÅÒÅç’……ïπ—QÖàÄÑÙÙÄâ¡±ÖπÃà§Å…ï—’…∏Ï((ÄÅçΩπÕ–Å¡ÖÂµïπ—%πôºÄÙÅ¡ÖÂµïπ—IïÕ’±–¸πëÖ—ÑÅÒÅmtÏ(ÄÅçΩπÕ–Å¡±ÖπÕY•Õ•â•±•—‰ÄÙÅ¡ÖÂµïπ—%πôº¸πô•πê°åÄÙ¯Ååπ≠ï‰ÄÙÙÙÄâ¡±ÖπÕ}Ÿ•Õ•â•±•—‰à§¸πŸÖ±’îÅÒÄâΩ¡ï∏àÏ((ÄÅ•òÄ°¡±ÖπÕY•Õ•â•±•—‰ÄÙÙÙÄâç±ΩÕïêàÄòòÄÖç’……ïπ—A…Ωô•±îπ•Õ}Öëµ•∏§ÅÏ(ÄÄÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâ—ï·–µÖ±•ù∏Èçïπ—ï»ÏÅ¡Öëë•πúËÿ¡¡‡Ä»¡¡‡Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîË–—¡‡ÏÅµÖ…ù•∏µâΩ——Ω¥Ëƒ¡¡‡Ïà˚¬~RúΩë•ÿ¯(ÄÄÄÄÄÄÄÄÒ†ƒÅç±ÖÕÃÙâ¡Öùîµ—•—±îà˘Õ—ÖµΩÃÅÖ©’Õ—ÖπëºÅ±ΩÃÅ¡±ÖπïÃΩ†ƒ¯(ÄÄÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘YΩ±€§Å¡…Ωπ—º∞ÅÂÑÅçÖÕ§ÅïÕ”Ñ∏Ω¿¯(ÄÄÄÄÄÄΩë•ÿ˘ÄÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅçŸ‘ÄÙÅ¡ÖÂµïπ—%πôº¸πô•πê°åÄÙ¯Ååπ≠ï‰ÄÙÙÙÄâ¡ÖÂµïπ—}çŸ‘à§¸πŸÖ±’îÅÒÄãäPàÏ(ÄÅçΩπÕ–ÅÖ±•ÖÃÄÙÅ¡ÖÂµïπ—%πôº¸πô•πê°åÄÙ¯Ååπ≠ï‰ÄÙÙÙÄâ¡ÖÂµïπ—}Ö±•ÖÃà§¸πŸÖ±’îÅÒÄãäPàÏ(ÄÅçΩπÕ–ÅµÂIï≈’ïÕ—ÃÄÙÅ…ï≈’ïÕ—ÕIïÕ’±–¸πëÖ—ÑÅÒÅmtÏ((ÄÅµÖ•∏π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒ†ƒÅç±ÖÕÃÙâ¡Öùîµ—•—±îà˘A±ÖπïÃΩ†ƒ¯(ÄÄÄÄÒ¿Åç±ÖÕÃÙâ¡ÖùîµÕ’àà˘7ÖÃÅ¡±Ö∏∞Å∑ÖÃÅâΩΩÕ–∞ÅµïπΩÃÅçΩµ•ÕßÕ∏ÅÖ∞Å…ï—•…Ö»∏Ω¿¯(ÄÄÄÄëÌ¡±ÖπÕY•Õ•â•±•—‰ÄÙÙÙÄâç±ΩÕïêàÄòòÅç’……ïπ—A…Ωô•±îπ•Õ}Öëµ•∏Ä¸ÅÄÒë•ÿÅÕ—Â±îÙââÖç≠ù…Ω’πêÈ…ùâÑ†»–‡∞ƒƒÃ∞ƒƒÃ∞¿∏ƒ§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µ…ïê§ÏÅçΩ±Ω»ÈŸÖ»†¥µ…ïê§ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏÅ¡Öëë•πúËƒ¡¡‡Äƒ—¡‡ÏÅâΩ…ëï»µ…Öë•’ÃË·¡‡ÏÅµÖ…ù•∏µâΩ——Ω¥ËƒŸ¡‡Ïà˚¬~RHÅÕ—ÑÅÕïççßÕ∏ÅïÕ”ÑÅIIÅ¡Ö…ÑÅï∞Å…ïÕ—ºÅëîÅ±ΩÃÅ’Õ’Ö…•ΩÃÅÖ°Ω…ÑÅµ•Õµº∏ÅMΩ±ºÅŸΩÃÅ±ÑÅŸïÃÅçΩµ¡±ï—Ñ∏ÅÖµâ•Ö±ºÅëïÕëîÅï∞Å¡Öπï∞ÅëîÅëµ•∏∏Ωë•ÿ˘ÄÄËÄàâÙ((ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâµÖ…ù•∏µâΩ——Ω¥Ë»¡¡‡ÏÅâΩ…ëï»µçΩ±Ω»ÈŸÖ»†¥µùΩ±êµë•¥§Ïà¯(ÄÄÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë¿Ïà˚¬~JÃÅÕµºÅ¡ÖùÖ»Å’∏Å¡±Ö∏Ω†Ã¯(ÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅµÖ…ù•∏µâΩ——Ω¥Ëƒ…¡‡Ïà¯(ÄÄÄÄÄÄÄÅQ…ÖπÕôïÀ¥Åï∞ÅµΩπ—ºÅëîÅ—‘Å¡±Ö∏ÅÑÅïÕ—ΩÃÅëÖ—ΩÃ∞Å‰ÅëïÕ¡◊•ÃÅ…ï¡Ω…—Ö±ºÅÖâÖ©ºÅçΩ∏Åï∞ÅªÈµï…ºÅëîÅçΩµ¡…ΩâÖπ—î∏(ÄÄÄÄÄÄÄÅΩπô•…µÖµΩÃÅµÖπ’Ö±µïπ—îÅ‰Å—îÅÖç—•ŸÖµΩÃÅï∞Å¡±Ö∏Ä°¡’ïëîÅëïµΩ…Ö»Å’πÖÃÅ°Ω…ÖÃ§∏(ÄÄÄÄÄÄΩ¿¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅ±•πîµ°ï•ù°–Ëƒ∏‡Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿ˘YTËÄÒÕ—…ΩπúÅç±ÖÕÃÙâµΩπºàÅ•êÙâ¡ÖÂŸ‘àÅëÖ—Ñµ…ïÖ∞ÙàëÌïÕçÖ¡ï!—µ∞°çŸ‘•ÙàÅëÖ—ÑµµÖÕ≠ïêÙâ—…’îà¯ëÌµÖÕ≠AÖÂµïπ—%πôº°çŸ‘•ÙΩÕ—…Ωπú¯ÄÒâ’——Ω∏ÅΩπç±•ç¨Ùâ—Ωùù±ïAÖÂµïπ—%πôº†ù¡ÖÂŸ‘ú§àÅÕ—Â±îÙââÖç≠ù…Ω’πêÈπΩπîÌâΩ…ëï»ÈπΩπîÌç’…ÕΩ»È¡Ω•π—ï»ÌôΩπ–µÕ•ÈîËƒ…¡‡Ïà˚¬~FΩâ’——Ω∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿ˘±•ÖÃËÄÒÕ—…ΩπúÅç±ÖÕÃÙâµΩπºàÅ•êÙâ¡ÖÂ±•ÖÃàÅëÖ—Ñµ…ïÖ∞ÙàëÌïÕçÖ¡ï!—µ∞°Ö±•ÖÃ•ÙàÅëÖ—ÑµµÖÕ≠ïêÙâ—…’îà¯ëÌµÖÕ≠AÖÂµïπ—%πôº°Ö±•ÖÃ•ÙΩÕ—…Ωπú¯ÄÒâ’——Ω∏ÅΩπç±•ç¨Ùâ—Ωùù±ïAÖÂµïπ—%πôº†ù¡ÖÂ±•ÖÃú§àÅÕ—Â±îÙââÖç≠ù…Ω’πêÈπΩπîÌâΩ…ëï»ÈπΩπîÌç’…ÕΩ»È¡Ω•π—ï»ÌôΩπ–µÕ•ÈîËƒ…¡‡Ïà˚¬~FΩâ’——Ω∏¯Ωë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ëƒ—¡‡ÏÅ¡Öëë•πúµ—Ω¿Ëƒ—¡‡ÏÅâΩ…ëï»µ—Ω¿Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÏÅôΩπ–µÕ•ÈîËƒÕ¡‡Ïà¯(ÄÄÄÄÄÄÄÉ¬~NúÅ5ÖπìÑÅï∞ÅçΩµ¡…ΩâÖπ—îÅëîÅ±ÑÅ—…ÖπÕôï…ïπç•ÑÅÑÄÒÕ—…ΩπúÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§àÅ•êÙâ¡ÖÂµÖ•∞àÅëÖ—Ñµ…ïÖ∞Ùâ±•ŸïÕç…Ω±∞πΩô•ç•Ö±ùµÖ•∞πçΩ¥àÅëÖ—ÑµµÖÕ≠ïêÙâ—…’îà¯ëÌµÖÕ≠µÖ•∞†â±•ŸïÕç…Ω±∞πΩô•ç•Ö±ùµÖ•∞πçΩ¥à•ÙΩÕ—…Ωπú¯ÄÒâ’——Ω∏ÅΩπç±•ç¨Ùâ—Ωùù±ïAÖÂµïπ—%πôº†ù¡ÖÂµÖ•∞ú§àÅÕ—Â±îÙââÖç≠ù…Ω’πêÈπΩπîÌâΩ…ëï»ÈπΩπîÌç’…ÕΩ»È¡Ω•π—ï»ÌôΩπ–µÕ•ÈîËƒ…¡‡Ïà˚¬~FΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅôΩπ–µÕ•ÈîËƒ…¡‡ÏÅµÖ…ù•∏µ—Ω¿Ë—¡‡Ïà˘Q•ïµ¡ºÅëîÅ…ïÕ¡’ïÕ—ÑÅïÕ—•µÖëºËÄ‘ÅÑÄƒ¿Åµ•π’—ΩÃ∞ÅÕïüÈ∏Åï∞Å—ÀÖπÕ•—º∏É¬~jòΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄÒë•ÿÅÕ—Â±îÙâë•Õ¡±Ö‰Èô±ï‡ÏÅùÖ¿ËƒŸ¡‡ÏÅô±ï‡µ›…Ö¿È›…Ö¿ÏÅµÖ…ù•∏µâΩ——Ω¥Ë»—¡‡Ïà¯(ÄÄÄÄÄÄëÌ¡±ÖπÃπµÖ¿°¿ÄÙ¯Å…ïπëï…A±ÖπÖ…ê°¿§§π©Ω•∏†àà•Ù(ÄÄÄÄΩë•ÿ¯((ÄÄÄÄëÌµÂIï≈’ïÕ—ÃÄòòÅµÂIï≈’ïÕ—Ãπ±ïπù—†Ä¸ÅÄ(ÄÄÄÄÄÄÒ†Ã˘Q’ÃÅ¡ÖùΩÃÅ…ï¡Ω…—ÖëΩÃΩ†Ã¯(ÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄëÌµÂIï≈’ïÕ—ÃπµÖ¿°»ÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâ±ïëùï»µ…Ω‹à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏¯ëÌ¡±ÖπÃπô•πê°¿ÄÙ¯Å¿π•êÄÙÙÙÅ»π¡±Öπ}•ê§¸ππÖµîÅÒÅ»π¡±Öπ}•ëÙÉ
‹ÄêëÌ»πÖµΩ’π—}Ö…ÕÙÉ
‹ÄëÌπï‹ÅÖ—î°»πç…ïÖ—ïë}Ö–§π—Ω1ΩçÖ±ïÖ—ïM—…•πú†âïÃµHà•ÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏Åç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâçΩ±Ω»ËëÌ»πÕ—Ö—’ÃÄÙÙÙÄùÖ¡¡…ΩŸïêúÄ¸ÄùŸÖ»†¥µù…ïï∏§úÄËÅ»πÕ—Ö—’ÃÄÙÙÙÄù…ï©ïç—ïêúÄ¸ÄùŸÖ»†¥µ…ïê§úÄËÄùŸÖ»†¥µùΩ±ê§ùÙà¯ëÌ»πÕ—Ö—’ÕÙΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÅÄ§π©Ω•∏†àà•Ù(ÄÄÄÄÄÄΩë•ÿ˘ÄÄËÄàâıÄÏ)Ù()ô’πç—•Ω∏Å…ïπëï…A±ÖπÖ…ê°¡±Ö∏§ÅÏ(ÄÅçΩπÕ–Å•Õ’……ïπ–ÄÙÅç’……ïπ—A…Ωô•±îπ¡±Öπ}•êÄÙÙÙÅ¡±Ö∏π•êÏ(ÄÅçΩπÕ–ÅâΩΩÕ—Qï·–ÄÙÅ¡±Ö∏πâΩΩÕ—}çΩΩ±ëΩ›π}ëÖÂÃ(ÄÄÄÄ¸ÅÅ‡ëÌ¡±Ö∏πâΩΩÕ—}µ’±—•¡±•ï…Ù∞ÅÖç—•ŸÖâ±îÄƒÅŸïËÅçÖëÑÄëÌ¡±Ö∏πâΩΩÕ—}çΩΩ±ëΩ›π}ëÖÂÕÙÅìµÖÕÄ(ÄÄÄÄËÅÅ‡ƒÄ°Õ•∏ÅâΩΩÕ–ÅÖç—•ŸÖâ±î•ÄÏ((ÄÅ…ï—’…∏ÅÄ(ÄÄÄÄÒë•ÿÅç±ÖÕÃÙâôΩ…¥µçÖ…êàÅÕ—Â±îÙâô±ï‡ËƒÏÅµ•∏µ›•ë—†Ë»–¡¡‡ÏÄëÌ•Õ’……ïπ–Ä¸ÄââΩ…ëï»µçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§àÄËÄàâÙà¯(ÄÄÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë¿ÏÅçΩ±Ω»ËëÌ¡±Ö∏π•êÄÙÙÙÄùë•ÖµÖπ—îúÄ¸ÄùŸÖ»†¥µùΩ±ê§úÄËÄùŸÖ»†¥µ—ï·–§ùÙà¯ëÌ¡±Ö∏ππÖµïÙΩ†Ã¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙâôΩπ–µÕ•ÈîË»—¡‡ÏÅµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡Ïà¯(ÄÄÄÄÄÄÄÄëÌ¡±Ö∏π¡…•çï}Ö…ÃÄ¯Ä¿Ä¸ÄàêàÄ¨Å¡±Ö∏π¡…•çï}Ö…Ãπ—Ω1ΩçÖ±ïM—…•πú†âïÃµHà§Ä¨ÄàΩµïÃàÄËÄâ…Ö—•ÃâÙ(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÒë•ÿÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÏÅ±•πîµ°ï•ù°–Ëƒ∏‡Ïà¯(ÄÄÄÄÄÄÄÄÒë•ÿ˚äjÑÅ	ΩΩÕ–ËÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–§à¯ëÌâΩΩÕ—Qï·—ÙΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄÒë•ÿ˚¬~NÅQΩ¡îÅë•Ö…•ºÅπΩ…µÖ∞ËÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–§à¯ëÌ¡±Ö∏πëÖ•±Â}çÖ¡}πΩ…µÖ±ÙÅ¡—ÃΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄëÌ¡±Ö∏πëÖ•±Â}çÖ¡}âΩΩÕ—ïêÄ¸ÅÄÒë•ÿ˚¬~j ÅQΩ¡îÅë•Ö…•ºÅâΩΩÕ—ïÖëºËÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–§à¯ëÌ¡±Ö∏πëÖ•±Â}çÖ¡}âΩΩÕ—ïëÙÅ¡—ÃΩÕ¡Ö∏¯Ωë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÒë•ÿ˚¬~J¿ÅQΩ¡îÅëîÅçÖπ©îÅÕïµÖπÖ∞ËÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–§à¯êëÌ¡±Ö∏π›ïï≠±Â}…ïëïµ¡—•Ωπ}çÖ¿π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄÄÄëÌ¡±Ö∏πµÖ·}âÖ±ÖπçîÄ¸ÅÄÒë•ÿ˚¬~>òÅMÖ±ëºÅ∑Ö·•µºÅÖç’µ’±Öâ±îËÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–§à¯ëÌ¡±Ö∏πµÖ·}âÖ±Öπçîπ—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙÅ¡—ÃΩÕ¡Ö∏¯Ωë•ÿ˘ÄÄËÄàâÙ(ÄÄÄÄÄÄÄÄÒë•ÿ˚¬~J‡ÅΩµ•ÕßÕ∏Å¡Ω»Å…ï—•…ºËÄÒÕ¡Ö∏ÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µ—ï·–§à¯ëÏ°¡±Ö∏πçΩµµ•ÕÕ•Ωπ}¡ç–Ä®Äƒ¿¿§π—Ω•·ïê†¿•ÙîΩÕ¡Ö∏¯Ωë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄëÌ•Õ’……ïπ–(ÄÄÄÄÄÄÄÄ¸ÅÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏µΩ’—±•πîàÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏÅµÖ…ù•∏µ—Ω¿ËƒŸ¡‡ÏàÅë•ÕÖâ±ïê˘A±Ö∏ÅÖç—’Ö∞Ωâ’——Ω∏˘Ä(ÄÄÄÄÄÄÄÄËÅ¡±Ö∏π¡…•çï}Ö…ÃÄÙÙÙÄ¿(ÄÄÄÄÄÄÄÄÄÄ¸ÅÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏÅµÖ…ù•∏µ—Ω¿ËƒŸ¡‡ÏàÅΩπç±•ç¨Ùâ°Öπë±ï°ÖπùïA±Ö∏†úëÌ¡±Ö∏π•ëÙú§à˘Öµâ•Ö»ÅÑÅïÕ—îÅ¡±Ö∏Ωâ’——Ω∏˘Ä(ÄÄÄÄÄÄÄÄÄÄËÅÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏÅµÖ…ù•∏µ—Ω¿ËƒŸ¡‡ÏàÅΩπç±•ç¨ÙâΩ¡ïπM’âÕç…•¡—•ΩπΩ…¥†úëÌ¡±Ö∏π•ëÙú∞ÄëÌ¡±Ö∏π¡…•çï}Ö…ÕÙ§à˘AÖùÖ»ÅïÕ—îÅ¡±Ö∏Ωâ’——Ω∏˘Ä(ÄÄÄÄÄÅÙ(ÄÄÄÄΩë•ÿ˘ÄÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅΩ¡ïπM’âÕç…•¡—•ΩπΩ…¥°¡±Öπ%ê∞ÅÖµΩ’π–§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âç…ïÖ—ï}Õ’âÕç…•¡—•Ωπ}…ï≈’ïÕ–à∞ÅÏ(ÄÄÄÅ¡}’Õï…}•êËÅç’……ïπ—UÕï»π•ê∞(ÄÄÄÅ¡}¡±Öπ}•êËÅ¡±Öπ%ê(ÄÅÙ§Ï((ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅùïπï…Ö»Åï∞ÅèÕë•ùºÅëîÅ¡Öùºà§ÏÅ…ï—’…∏ÏÅÙ((ÄÅÕ°Ω›AÖÂµïπ—Ωëï5ΩëÖ∞°ëÖ—ÑπçΩëî∞ÅëÖ—ÑπÖµΩ’π–§Ï(ÄÅπΩ—•ôÂëµ•π	ÂµÖ•∞°ç’……ïπ—A…Ωô•±îπ’Õï…πÖµî∞Å¡±Öπ%ê∞ÅÖµΩ’π–∞ÅëÖ—ÑπçΩëî§Ï)Ù((ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ(ººÅ5%1)LÉäPÅÖŸ•ÕºÅÖ’—Ω∑Ö—•çºÅÑÅ—‘ÅçΩ……ïºÅëïë•çÖëºÅëîÅ¡ÖùΩÃ(ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ(ººÅΩµ¡±ï”ÑÅïÕ—ΩÃÄÃÅëÖ—ΩÃÅëïÕ¡◊•ÃÅëîÅÖ…µÖ»Å—‘Åç’ïπ—ÑÅï∏ÅïµÖ•±©ÃπçΩ¥)çΩπÕ–Å5%1)M}AU	1%}-dÄÙÄâQTµAU	1%µ-dàÏ)çΩπÕ–Å5%1)M}MIY%}%ÄÙÄâQTµMIY%µ%àÏ)çΩπÕ–Å5%1)M}Q5A1Q}%ÄÙÄâQTµQ5A1Qµ%àÏ()ô’πç—•Ω∏ÅπΩ—•ôÂëµ•π	ÂµÖ•∞°’Õï…πÖµî∞Å¡±Öπ%ê∞ÅÖµΩ’π–∞ÅçΩëî§ÅÏ(ÄÅ•òÄ°5%1)M}AU	1%}-dÄÙÙÙÄâQTµAU	1%µ-dà§Å…ï—’…∏ÏÄººÅ—ΩëÖ€µÑÅπºÅÕîÅçΩπô•ù’ÀÃ∞ÅπºÅ°ÖçïµΩÃÅπÖëÑ((ÄÅ—…‰ÅÏ(ÄÄÄÅïµÖ•±©ÃπÕïπê°5%1)M}MIY%}%∞Å5%1)M}Q5A1Q}%∞ÅÏ(ÄÄÄÄÄÅ’Õï…πÖµî∞Å¡±Ö∏ËÅ¡±Öπ%ê∞ÅÖµΩ’π–∞ÅçΩëî(ÄÄÄÅÙ∞Å5%1)M}AU	1%}-d§πçÖ—ç†††§ÄÙ¯ÅÌÙ§Ï(ÄÅÙÅçÖ—ç†Ä°î§ÅÏÄº®ÅÕ§ÅôÖ±±ÑÅï∞ÅÖŸ•Õº∞ÅπºÅ…Ωµ¡ïµΩÃÅï∞Åô±’©ºÅëï∞Å’Õ’Ö…•ºÄ®ºÅÙ)Ù()ô’πç—•Ω∏ÅÕ°Ω›AÖÂµïπ—Ωëï5ΩëÖ∞°çΩëî∞ÅÖµΩ’π–§ÅÏ(ÄÅçΩπÕ–Å›…Ö¿ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âù±ΩâÖ±5ΩëÖ±]…Ö¿à§Ï(ÄÅçΩπÕ–ÅµΩëÖ∞ÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âë•ÿà§Ï(ÄÅµΩëÖ∞πÕ—Â±îπçÕÕQï·–ÄÙÄâ¡ΩÕ•—•Ω∏Èô•·ïêÏÅ•πÕï–Ë¿ÏÅâÖç≠ù…Ω’πêÈ…ùâÑ†¿∞¿∞¿∞¿∏‡§ÏÅËµ•πëï‡Ëƒ¿¿ÏÅë•Õ¡±Ö‰Èô±ï‡ÏÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÏÅ©’Õ—•ô‰µçΩπ—ïπ–Èçïπ—ï»ÏÅ¡Öëë•πúË»¡¡‡ÏàÏ(ÄÅµΩëÖ∞π•ππï…!Q50ÄÙÅÄ(ÄÄÄÄÒë•ÿÅÕ—Â±îÙââÖç≠ù…Ω’πêÈŸÖ»†¥µ¡Öπï∞§ÏÅµÖ‡µ›•ë—†ËÃ‡¡¡‡ÏÅâΩ…ëï»µ…Öë•’ÃËƒŸ¡‡ÏÅ¡Öëë•πúË»·¡‡ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µùΩ±êµë•¥§Ïà¯(ÄÄÄÄÄÄÒ†ÃÅÕ—Â±îÙâµÖ…ù•∏µ—Ω¿Ë¿Ïà˚¬~JÃÅU∏ÉÈ±—•µºÅ¡ÖÕºΩ†Ã¯(ÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘Q…ÖπÕôïÀ¥ÄÒÕ—…ΩπúÅÕ—Â±îÙâçΩ±Ω»ÈŸÖ»†¥µù…ïï∏§à¯êëÌÖµΩ’π–π—Ω1ΩçÖ±ïM—…•πú†âïÃµHà•ÙΩÕ—…Ωπú¯Å‰Å¡Ωª§ÅïÕ—îÅèÕë•ùºÅaQ<Åï∏Åï∞ÅçΩπçï¡—ºÅëîÅ±ÑÅ—…ÖπÕôï…ïπç•ÑËΩ¿¯(ÄÄÄÄÄÄÒë•ÿÅç±ÖÕÃÙâµΩπºàÅÕ—Â±îÙââÖç≠ù…Ω’πêÈŸÖ»†¥µ•π¨§ÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µùΩ±ê§ÏÅâΩ…ëï»µ…Öë•’ÃËƒ¡¡‡ÏÅ¡Öëë•πúËƒ—¡‡ÏÅ—ï·–µÖ±•ù∏Èçïπ—ï»ÏÅôΩπ–µÕ•ÈîË»¡¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÏÅµÖ…ù•∏Ëƒ—¡‡Ä¿Ïà¯ëÌçΩëïÙΩë•ÿ¯(ÄÄÄÄÄÄÒ¿ÅÕ—Â±îÙâôΩπ–µÕ•ÈîËƒ…¡‡ÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§Ïà˘M•∏ÅïÕîÅèÕë•ùºÅπºÅ¡ΩëïµΩÃÅçΩπô•…µÖ»Å≈’îÅ±ÑÅ—…ÖπÕôï…ïπç•ÑÅïÃÅ—’ÂÑ∏Å’Ö…ëÖ±ºÅ°ÖÕ—ÑÅ≈’îÅ—îÅçΩπô•…µïµΩÃÄ†‘ÅÑÄƒ¿Åµ•∏ÅÕïüÈ∏Åï∞Å—ÀÖπÕ•—ºÉ¬~jò§∏Ω¿¯(ÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÃÙââ—∏àÅÕ—Â±îÙâ›•ë—†Ëƒ¿¿îÏÅµÖ…ù•∏µ—Ω¿Ëƒ¡¡‡ÏàÅΩπç±•ç¨Ùâ—°•Ãπç±ΩÕïÕ–†ùë•ŸmÕ—Â±î®ıô•·ïëtú§π…ïµΩŸî†§ÏÅÕ›•—ç°QÖà†ùÕ—Ω…îú§Ïà˘1•Õ—º∞ÅÂÑÅ±ºÅÖπΩ”§Ωâ’——Ω∏¯(ÄÄÄÄΩë•ÿ˘ÄÏ(ÄÅëΩç’µïπ–πâΩë‰πÖ¡¡ïπë°•±ê°µΩëÖ∞§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ï°ÖπùïA±Ö∏°¡±Öπ%ê§ÅÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âç°Öπùï}¡±Ö∏à∞ÅÏÅ¡}’Õï…}•êËÅç’……ïπ—UÕï»π•ê∞Å¡}¡±Öπ}•êËÅ¡±Öπ%êÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—ÑπΩ¨§ÅÏÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅçÖµâ•Ö»Åï∞Å¡±Ö∏à§ÏÅ…ï—’…∏ÏÅÙ(ÄÅç’……ïπ—A…Ωô•±îπ¡±Öπ}•êÄÙÅ¡±Öπ%êÏ(ÄÅÕ°Ω›QΩÖÕ–†âA±Ö∏ÅÖç—’Ö±•ÈÖëºà§Ï(ÄÅ…ïπëï…A±ÖπÃ†§Ï)Ù(((ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ(ººÅUQ%1L(ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ)ô’πç—•Ω∏ÅïÕçÖ¡ï!—µ∞°Õ—»§ÅÏ(ÄÅçΩπÕ–Åë•ÿÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âë•ÿà§Ï(ÄÅë•ÿπ—ï·—Ωπ—ïπ–ÄÙÅÕ—»Ï(ÄÅ…ï—’…∏Åë•ÿπ•ππï…!Q50Ï)Ù(((ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ(ººÅUA1=ÅAIY%\Å!IÅ1e=UPÅ%`(ººÅ1ÑÅ¡…ïŸ•ï‹ÅÕ•ïµ¡…îÅ’ÕÑÅ’∏Åô…ÖµîÄƒÿË‰Åëïπ—…ºÅëï∞ÅÖπç°ºÅëï∞ÅôΩ…µ’±Ö…•º∏(ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ)ëΩç’µïπ–πÖëëŸïπ—1•Õ—ïπï»†â=5Ωπ—ïπ—1ΩÖëïêà∞Ä†§ÄÙ¯ÅÏ(ÄÅ•òÄ°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÕU¡±ΩÖëA…ïŸ•ï›!Ö…ë•‡à§§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅÕ—Â±îÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âÕ—Â±îà§Ï(ÄÅÕ—Â±îπ•êÄÙÄâ±ÕU¡±ΩÖëA…ïŸ•ï›!Ö…ë•‡àÏ(ÄÅÕ—Â±îπ—ï·—Ωπ—ïπ–ÄÙÅÄ(ÄÄÄÄçô•±ï•ï±ëÃ∞(ÄÄÄÄçô•±ï•ï±ëÃÄπô•ï±ê∞(ÄÄÄÄç’¡±ΩÖëA…ïŸ•ï›MÖôîÅÏ(ÄÄÄÄÄÅµ•∏µ›•ë—†Ë¿ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅµÖ‡µ›•ë—†Ëƒ¿¿îÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ‡µÕ•È•πúÈâΩ…ëï»µâΩ‡ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ((ÄÄÄÄç’¡±ΩÖëA…ïŸ•ï›MÖôîπÖç—•ŸîÅÏ(ÄÄÄÄÄÅë•Õ¡±Ö‰Èâ±Ωç¨ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅ›•ë—†Ëƒ¿¿îÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅÖÕ¡ïç–µ…Ö—•ºËƒÿÄºÄ‰ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅ°ï•ù°–ÈÖ’—ºÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅΩŸï…ô±Ω‹È°•ëëï∏ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ((ÄÄÄÄç’¡±ΩÖëA…ïŸ•ï›Y•ëïΩMÖôîÅÏ(ÄÄÄÄÄÅ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅ•πÕï–Ë¿ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅ›•ë—†Ëƒ¿¿îÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅ°ï•ù°–Ëƒ¿¿îÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅµÖ‡µ›•ë—†ÈπΩπîÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅµÖ‡µ°ï•ù°–ÈπΩπîÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅΩâ©ïç–µô•–ÈçΩπ—Ö•∏ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅΩâ©ïç–µ¡ΩÕ•—•Ω∏Èçïπ—ï»ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ((ÄÄÄÅµïë•ÑÄ°µÖ‡µ›•ë—†Ë‹¿¡¡‡§ÅÏ(ÄÄÄÄÄÄç’¡±ΩÖëA…ïŸ•ï›MÖôîπÖç—•ŸîÅÏ(ÄÄÄÄÄÄÄÅ›•ë—†Ëƒ¿¿îÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÄÄÅÖÕ¡ïç–µ…Ö—•ºËƒÿÄºÄ‰ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÄÄÅ°ï•ù°–ÈÖ’—ºÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅÙ(ÄÄÄÅÙ(ÄÅÄÏ(ÄÅëΩç’µïπ–π°ïÖêπÖ¡¡ïπë°•±ê°Õ—Â±î§Ï)Ù§Ï(((ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ(ººÅ1%YMI=10É
‹ÅU$ÅY%YÅXƒ(ººÅ5ï©Ω…ÑÅŸ•Õ’Ö∞Åù±ΩâÖ∞ËÅ∑ÖÃÅçΩπ—…ÖÕ—î∞ÅÕÖ—’…ÖçßÕ∏Å‰Å¡…Ωô’πë•ëÖê∏(ººÅ9ºÅçÖµâ•ÑÅ≥Õù•çÑ∞Å—Öµá≈ΩÃÅçÀµ—•çΩÃÅëï∞ÅôïïêÅπ§ÅçΩµ¡Ω…—Öµ•ïπ—º∏(ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ)ëΩç’µïπ–πÖëëŸïπ—1•Õ—ïπï»†â=5Ωπ—ïπ—1ΩÖëïêà∞Ä†§ÄÙ¯ÅÏ(ÄÅ•òÄ°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÕU•Y•ŸÖXƒà§§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅÕ—Â±îÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âÕ—Â±îà§Ï(ÄÅÕ—Â±îπ•êÄÙÄâ±ÕU•Y•ŸÖXƒàÏ(ÄÅÕ—Â±îπ—ï·—Ωπ—ïπ–ÄÙÅÄ(ÄÄÄÄÈ…ΩΩ–ÅÏ(ÄÄÄÄÄÄ¥µ±Ãµù±Ω‹µùΩ±êËÅ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏ƒ‡§Ï(ÄÄÄÄÄÄ¥µ±Ãµù±Ω‹µù…ïï∏ËÅ…ùâÑ†Ã–∞ƒ‰‹∞‰–∞∏ƒ‘§Ï(ÄÄÄÄÄÄ¥µ±Ãµù±Ω‹µ…ïêËÅ…ùâÑ†»Ã‰∞ÿ‡∞ÿ‡∞∏ƒ‘§Ï(ÄÄÄÄÄÄ¥µ±Ãµ¡Öπï∞µÕ°•πîËÅ…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿»‘§Ï(ÄÄÄÅÙ((ÄÄÄÅâΩë‰ÅÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêË(ÄÄÄÄÄÄÄÅ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Äƒ‡îÄ¥‡î∞Å…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿‹§∞Å—…ÖπÕ¡Ö…ïπ–Ä»‡î§∞(ÄÄÄÄÄÄÄÅ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‰»îÄƒ»î∞Å…ùâÑ†Ã–∞ƒ‰‹∞‰–∞∏¿–‘§∞Å—…ÖπÕ¡Ö…ïπ–Ä»–î§∞(ÄÄÄÄÄÄÄÅŸÖ»†¥µ•π¨§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ((ÄÄÄÄçÖ¡¡Y•ï‹ÅÏ(ÄÄÄÄÄÅ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÏ(ÄÄÄÅÙ((ÄÄÄÄº®Å9ÖŸïùÖçßÕ∏Å∑ÖÃÅ¡…ïÕïπ—îÅÕ•∏ÅçÖµâ•Ö»ÅïÕ—…’ç—’…ÑÄ®º(ÄÄÄÅπÖÿ∞(ÄÄÄÄπ—Ω¿µπÖÿ∞(ÄÄÄÄππÖŸâÖ»ÅÏ(ÄÄÄÄÄÅâÖç≠ë…Ω¿µô•±—ï»ËÅâ±’»†ƒ—¡‡§Ï(ÄÄÄÄÄÄµ›ïâ≠•–µâÖç≠ë…Ω¿µô•±—ï»ËÅâ±’»†ƒ—¡‡§Ï(ÄÄÄÅÙ((ÄÄÄÄçπÖŸ1•π≠ÃÅâ’——Ω∏∞(ÄÄÄÄçπÖŸI•ù°–Åâ’——Ω∏ÅÏ(ÄÄÄÄÄÅ—…ÖπÕ•—•Ω∏Ë(ÄÄÄÄÄÄÄÅ—…ÖπÕôΩ…¥Ä∏ƒŸÃÅïÖÕî∞(ÄÄÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»Ä∏ƒŸÃÅïÖÕî∞(ÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÄ∏ƒŸÃÅïÖÕî∞(ÄÄÄÄÄÄÄÅçΩ±Ω»Ä∏ƒŸÃÅïÖÕî∞(ÄÄÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ä∏ƒŸÃÅïÖÕîÏ(ÄÄÄÅÙ((ÄÄÄÄçπÖŸ1•π≠ÃÅâ’——Ω∏È°ΩŸï»∞(ÄÄÄÄçπÖŸI•ù°–Åâ’——Ω∏È°ΩŸï»ÅÏ(ÄÄÄÄÄÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ïd†¥≈¡‡§Ï(ÄÄÄÅÙ((ÄÄÄÄçπÖŸ1•π≠ÃÅâ’——Ω∏πÖç—•Ÿî∞(ÄÄÄÄçπÖŸ1•π≠ÃÅâ’——ΩπmÖ…•Ñµç’……ïπ–Ùâ¡ÖùîâtÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏–»§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿‡§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅçΩ±Ω»ÈŸÖ»†¥µùΩ±ê§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Äƒ·¡‡Å…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿‡§Ï(ÄÄÄÅÙ((ÄÄÄÄº®ÅAÖπï±ïÃËÅµï©Ω»ÅÕï¡Ö…ÖçßÕ∏Åëï∞ÅôΩπëºÄ®º(ÄÄÄÄπôΩ…¥µçÖ…ê∞(ÄÄÄÄπµΩëÖ∞µâΩ‡∞(ÄÄÄÄπ±ïëùï»µ…Ω‹∞(ÄÄÄÄπ¡…Ωô•±îµçÖ…ê∞(ÄÄÄÄπ¡±Ö∏µçÖ…ê∞(ÄÄÄÄπÕ—Ω…îµçÖ…ê∞(ÄÄÄÄππΩ—•ô•çÖ—•Ω∏µ¡Öπï∞ÅÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêË(ÄÄÄÄÄÄÄÅ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú∞ÅŸÖ»†¥µ±Ãµ¡Öπï∞µÕ°•πî§∞Å—…ÖπÕ¡Ö…ïπ–Ä‘¿î§∞(ÄÄÄÄÄÄÄÅŸÖ»†¥µ¡Öπï∞§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ((ÄÄÄÄπôΩ…¥µçÖ…ê∞(ÄÄÄÄπ¡…Ωô•±îµçÖ…ê∞(ÄÄÄÄπ¡±Ö∏µçÖ…ê∞(ÄÄÄÄπÕ—Ω…îµçÖ…êÅÏ(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë(ÄÄÄÄÄÄÄÄ¿Äƒ—¡‡ÄÃ·¡‡Å…ùâÑ†¿∞¿∞¿∞∏»¿§∞(ÄÄÄÄÄÄÄÅ•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿ƒ‡§Ï(ÄÄÄÅÙ((ÄÄÄÄº®Å%π¡’—ÃÅ∑ÖÃÅ±ïù•â±ïÃÄ®º(ÄÄÄÅ•π¡’–∞(ÄÄÄÅ—ï·—Ö…ïÑ∞(ÄÄÄÅÕï±ïç–ÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏ƒƒ§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅ—…ÖπÕ•—•Ω∏Ë(ÄÄÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»Ä∏ƒŸÃÅïÖÕî∞(ÄÄÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ä∏ƒŸÃÅïÖÕî∞(ÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÄ∏ƒŸÃÅïÖÕîÏ(ÄÄÄÅÙ((ÄÄÄÅ•π¡’–ÈôΩç’Ã∞(ÄÄÄÅ—ï·—Ö…ïÑÈôΩç’Ã∞(ÄÄÄÅÕï±ïç–ÈôΩç’ÃÅÏ(ÄÄÄÄÄÅΩ’—±•πîÈπΩπîÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏‘»§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä¿ÄÕ¡‡Å…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿‹§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿»‘§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ((ÄÄÄÄº®Å	Ω—ΩπïÃÅ¡…•πç•¡Ö±ïÃÅçΩ∏Å’∏Å¡ΩçºÅ∑ÖÃÅëîÅŸ•ëÑÄ®º(ÄÄÄÄπâ—∏ÅÏ(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä·¡‡Ä»…¡‡Å…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏ƒ¿§Ï(ÄÄÄÄÄÅ—…ÖπÕ•—•Ω∏Ë(ÄÄÄÄÄÄÄÅ—…ÖπÕôΩ…¥Ä∏ƒ’ÃÅïÖÕî∞(ÄÄÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ä∏ƒ’ÃÅïÖÕî∞(ÄÄÄÄÄÄÄÅô•±—ï»Ä∏ƒ’ÃÅïÖÕîÏ(ÄÄÄÅÙ((ÄÄÄÄπâ—∏È°ΩŸï»ÅÏ(ÄÄÄÄÄÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ïd†¥≈¡‡§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ¡¡‡Ä»·¡‡Å…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏ƒÿ§Ï(ÄÄÄÄÄÅô•±—ï»ÈÕÖ—’…Ö—î†ƒ∏¿‡§Ï(ÄÄÄÅÙ((ÄÄÄÄπâ—∏ÈÖç—•ŸîÅÏ(ÄÄÄÄÄÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ïd†¿§ÅÕçÖ±î†∏‰‡‘§Ï(ÄÄÄÅÙ((ÄÄÄÄπâ—∏µΩ’—±•πîÅÏ(ÄÄÄÄÄÅ—…ÖπÕ•—•Ω∏Ë(ÄÄÄÄÄÄÄÅ—…ÖπÕôΩ…¥Ä∏ƒ’ÃÅïÖÕî∞(ÄÄÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»Ä∏ƒ’ÃÅïÖÕî∞(ÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÄ∏ƒ’ÃÅïÖÕîÏ(ÄÄÄÅÙ((ÄÄÄÄπâ—∏µΩ’—±•πîÈ°ΩŸï»ÅÏ(ÄÄÄÄÄÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ïd†¥≈¡‡§Ï(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏Ã–§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿Ã‘§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ((ÄÄÄÄº®ÅSµ—’±ΩÃÅ‰Åç°•¡ÃÄ®º(ÄÄÄÄπ¡Öùîµ—•—±îÅÏ(ÄÄÄÄÄÅ±ï——ï»µÕ¡Öç•πúË¥∏¿»’ï¥Ï(ÄÄÄÄÄÅ—ï·–µÕ°ÖëΩ‹Ë¿Ä¿Ä»·¡‡Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿»‘§Ï(ÄÄÄÅÙ((ÄÄÄÄπ—Öú∞(ÄÄÄÄππÖÿµ¡±Ö∏µç°•¿ÅÏ(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿»‘§Ï(ÄÄÄÅÙ((ÄÄÄÄº®ÅïïêËÅπºÅ—ΩçÖµΩÃÅµïë•ëÖÃÅπ§ÅΩâ©ïç–µô•–Ä®º(ÄÄÄÄπôïïêµ¡°ΩπîÅÏ(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë(ÄÄÄÄÄÄÄÄ¿Ä»…¡‡Ä‘Ÿ¡‡Å…ùâÑ†¿∞¿∞¿∞∏»‡§∞(ÄÄÄÄÄÄÄÄ¿Ä¿Ä¿Ä≈¡‡Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿ƒ‡§Ï(ÄÄÄÅÙ((ÄÄÄÄπôïïêµÖç—•Ω∏µâ—∏ÅÏ(ÄÄÄÄÄÅâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†·¡‡§Ï(ÄÄÄÄÄÄµ›ïâ≠•–µâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†·¡‡§Ï(ÄÄÄÅÙ((ÄÄÄÄº®ÅAï…ô•∞ËÅ’∏Å—Ω≈’îÅ∑ÖÃÅŸ•ŸºÅÖ±…ïëïëΩ»ÅëîÅ±ÑÅ•ëïπ—•ëÖêÄ®º(ÄÄÄÄπ¡…Ωô•±îµÖŸÖ—Ö»∞(ÄÄÄÄπÖŸÖ—Ö»µç•…ç±îÅÏ(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë(ÄÄÄÄÄÄÄÄ¿Ä¿Ä¿Ä≈¡‡Å…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏ƒÿ§∞(ÄÄÄÄÄÄÄÄ¿Ä¿Ä»—¡‡Å…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿ÿ§Ï(ÄÄÄÅÙ((ÄÄÄÄº®ÅQ•ïπëÑÄºÅçΩ±ïççßÕ∏Ä®º(ÄÄÄÄπ±ÃµçΩ±±ïç—•Ω∏µô•±—ï»πÖç—•Ÿî∞(ÄÄÄÄπ±ÃµçΩ±±ïç—•Ω∏µ…Ö…•—‰µô•±—ï»πÖç—•ŸîÅÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿‡§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Äƒ—¡‡Å…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿‹§Ï(ÄÄÄÅÙ((ÄÄÄÄº®Å5ΩëÖ±ïÃÅ∑ÖÃÅªµ—•ëΩÃÄ®º(ÄÄÄÄπµΩëÖ∞µΩŸï…±Ö‰ÅÏ(ÄÄÄÄÄÅâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†·¡‡§Ï(ÄÄÄÄÄÄµ›ïâ≠•–µâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†·¡‡§Ï(ÄÄÄÅÙ((ÄÄÄÄπµΩëÖ∞µâΩ‡ÅÏ(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë(ÄÄÄÄÄÄÄÄ¿Ä»·¡‡Ä‰¡¡‡Å…ùâÑ†¿∞¿∞¿∞∏‘»§∞(ÄÄÄÄÄÄÄÄ¿Ä¿Ä¿Ä≈¡‡Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿ƒ‡§Ï(ÄÄÄÅÙ((ÄÄÄÄº®ÅMç…Ω±±âÖ»ÅëïÕ≠—Ω¿Ä®º(ÄÄÄÅµïë•ÑÄ°µ•∏µ›•ë—†Ë‹¿≈¡‡§ÅÏ(ÄÄÄÄÄÄ®ÅÏ(ÄÄÄÄÄÄÄÅÕç…Ω±±âÖ»µ›•ë—†È—°•∏Ï(ÄÄÄÄÄÄÄÅÕç…Ω±±âÖ»µçΩ±Ω»È…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏Ã¿§Å—…ÖπÕ¡Ö…ïπ–Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÄ®ËËµ›ïâ≠•–µÕç…Ω±±âÖ»ÅÏ(ÄÄÄÄÄÄÄÅ›•ë—†Ë·¡‡Ï(ÄÄÄÄÄÄÄÅ°ï•ù°–Ë·¡‡Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÄ®ËËµ›ïâ≠•–µÕç…Ω±±âÖ»µ—°’µàÅÏ(ÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏»–§Ï(ÄÄÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÄ®ËËµ›ïâ≠•–µÕç…Ω±±âÖ»µ—…Öç¨ÅÏ(ÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ—…ÖπÕ¡Ö…ïπ–Ï(ÄÄÄÄÄÅÙ(ÄÄÄÅÙ((ÄÄÄÄº®Å5Ωâ•±îËÅçΩπÕï…ŸÖ»Åô±’•ëïËÅ‰ÅπºÅÖ±—ï…Ö»Å±ÖÂΩ’–Ä®º(ÄÄÄÅµïë•ÑÄ°µÖ‡µ›•ë—†Ë‹¿¡¡‡§ÅÏ(ÄÄÄÄÄÅâΩë‰ÅÏ(ÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêË(ÄÄÄÄÄÄÄÄÄÅ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‘¿îÄ¥‘î∞Å…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿‘‘§∞Å—…ÖπÕ¡Ö…ïπ–Ä»‘î§∞(ÄÄÄÄÄÄÄÄÄÅŸÖ»†¥µ•π¨§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÄπôΩ…¥µçÖ…ê∞(ÄÄÄÄÄÄπµΩëÖ∞µâΩ‡ÅÏ(ÄÄÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ…¡‡ÄÃ—¡‡Å…ùâÑ†¿∞¿∞¿∞∏»–§Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÄπâ—∏È°ΩŸï»∞(ÄÄÄÄÄÄπâ—∏µΩ’—±•πîÈ°ΩŸï»∞(ÄÄÄÄÄÄçπÖŸ1•π≠ÃÅâ’——Ω∏È°ΩŸï»∞(ÄÄÄÄÄÄçπÖŸI•ù°–Åâ’——Ω∏È°ΩŸï»ÅÏ(ÄÄÄÄÄÄÄÅ—…ÖπÕôΩ…¥ÈπΩπîÏ(ÄÄÄÄÄÅÙ(ÄÄÄÅÙ((ÄÄÄÅµïë•ÑÄ°¡…ïôï…Ãµ…ïë’çïêµµΩ—•Ω∏È…ïë’çî§ÅÏ(ÄÄÄÄÄÄπâ—∏∞(ÄÄÄÄÄÄπâ—∏µΩ’—±•πî∞(ÄÄÄÄÄÄçπÖŸ1•π≠ÃÅâ’——Ω∏∞(ÄÄÄÄÄÄçπÖŸI•ù°–Åâ’——Ω∏∞(ÄÄÄÄÄÅ•π¡’–∞(ÄÄÄÄÄÅ—ï·—Ö…ïÑ∞(ÄÄÄÄÄÅÕï±ïç–ÅÏ(ÄÄÄÄÄÄÄÅ—…ÖπÕ•—•Ω∏ÈπΩπîÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅÙ(ÄÄÄÅÙ(ÄÅÄÏ((ÄÅëΩç’µïπ–π°ïÖêπÖ¡¡ïπë°•±ê°Õ—Â±î§Ï)Ù§Ï(((ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ(ººÅAI%0É
‹ÅIMU58ÅÅ=1'M8(ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ)ëΩç’µïπ–πÖëëŸïπ—1•Õ—ïπï»†â=5Ωπ—ïπ—1ΩÖëïêà∞Ä†§ÄÙ¯ÅÏ(ÄÅ•òÄ°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÕΩ±±ïç—•ΩπM’µµÖ…Â5Ωâ•±îà§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÕ—Â±îÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âÕ—Â±îà§Ï(ÄÅÕ—Â±îπ•êÄÙÄâ±ÕΩ±±ïç—•ΩπM’µµÖ…Â5Ωâ•±îàÏ(ÄÅÕ—Â±îπ—ï·—Ωπ—ïπ–ÄÙÅÄ(ÄÄÄÅµïë•ÑÄ°µÖ‡µ›•ë—†Ë‘»¡¡‡§ÅÏ(ÄÄÄÄÄÄπ¡…Ωô•±îµÕïç—•Ω∏Åâ’——Ω∏πôΩ…¥µçÖ…ëmΩπç±•ç¨ÙâΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†§âtÅÏ(ÄÄÄÄÄÄÄÅù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–†»∞≈ô»§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÄπ¡…Ωô•±îµÕïç—•Ω∏Åâ’——Ω∏πôΩ…¥µçÖ…ëmΩπç±•ç¨ÙâΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†§âtÄ¯Åë•ÿÅÏ(ÄÄÄÄÄÄÄÅâΩ…ëï»µ±ïô–ÈπΩπîÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÄπ¡…Ωô•±îµÕïç—•Ω∏Åâ’——Ω∏πôΩ…¥µçÖ…ëmΩπç±•ç¨ÙâΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†§âtÄ¯Åë•ÿÈπ—†µç°•±ê°ïŸï∏§ÅÏ(ÄÄÄÄÄÄÄÅâΩ…ëï»µ±ïô–Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅÙ(ÄÄÄÅÙ(ÄÅÄÏ(ÄÅëΩç’µïπ–π°ïÖêπÖ¡¡ïπë°•±ê°Õ—Â±î§Ï)Ù§Ï()ëΩç’µïπ–πÖëëŸïπ—1•Õ—ïπï»†â=5Ωπ—ïπ—1ΩÖëïêà∞Ä†§ÄÙ¯ÅÏ(ÄÅ•òÄ°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÕUπ•ô•ïëΩ±±ïç—•ΩπA…Ωô•±ïXƒà§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÕ—Â±îÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âÕ—Â±îà§Ï(ÄÅÕ—Â±îπ•êÄÙÄâ±ÕUπ•ô•ïëΩ±±ïç—•ΩπA…Ωô•±ïXƒàÏ(ÄÅÕ—Â±îπ—ï·—Ωπ—ïπ–ÄÙÅÄ(ÄÄÄÄπ±Ãµ¡…Ωô•±îµçΩ±±ïç—•Ω∏µ°’àÅâ’——Ω∏ÅÏ(ÄÄÄÄÄÅ—…ÖπÕ•—•Ω∏ÈâÖç≠ù…Ω’πêÄ∏ƒ’ÃÅïÖÕî±çΩ±Ω»Ä∏ƒ’ÃÅïÖÕîÏ(ÄÄÄÅÙ(ÄÄÄÄπ±Ãµ¡…Ωô•±îµçΩ±±ïç—•Ω∏µ°’àÅâ’——Ω∏È°ΩŸï»ÅÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†»‘¿∞»¿–∞»ƒ∞∏¿Ã‘§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ(ÄÄÄÅµïë•ÑÄ°µÖ‡µ›•ë—†Ë‘»¡¡‡§ÅÏ(ÄÄÄÄÄÄπ±Ãµ¡…Ωô•±îµçΩ±±ïç—•Ω∏µ°’àÄ¯Åâ’——ΩπmΩπç±•ç¨®ÙâΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†ùÖ±∞ú§âtÅÏ(ÄÄÄÄÄÄÄÅù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–†»∞≈ô»§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÄπ±Ãµ¡…Ωô•±îµçΩ±±ïç—•Ω∏µ°’àÄ¯Åâ’——ΩπmΩπç±•ç¨®ÙâΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†ùÖ±∞ú§âtÄ¯Åë•ÿÈπ—†µç°•±ê°Ωëê§ÅÏ(ÄÄÄÄÄÄÄÅâΩ…ëï»µ±ïô–ÈπΩπîÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÄπ±Ãµ¡…Ωô•±îµçΩ±±ïç—•Ω∏µ°’àÄ¯Åâ’——ΩπmΩπç±•ç¨®ÙâΩ¡ïπ5Â5ïëÖ±ÕAÖπï∞†ùÖ±∞ú§âtÄ¯Åë•ÿÈπ—†µç°•±ê°ïŸï∏§ÅÏ(ÄÄÄÄÄÄÄÅâΩ…ëï»µ±ïô–Ë≈¡‡ÅÕΩ±•êÅŸÖ»†¥µâΩ…ëï»§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅÙ(ÄÄÄÅÙ(ÄÅÄÏ(ÄÅëΩç’µïπ–π°ïÖêπÖ¡¡ïπë°•±ê°Õ—Â±î§Ï)Ù§Ï((ººÅΩµ¡Ö—•â•±•ëÖêÅçΩ∏ÅâΩ—ΩπïÃÅŸ•ï©ΩÃÅëï∞Åëµ•∏Å≈’îÅ¡’ïëÖ∏ÅÕïù’•»Å±±ÖµÖπëºÅπΩµâ…ïÃÅÖπ—ï…•Ω…ïÃ∏)ÖÕÂπåÅô’πç—•Ω∏Å°Öπë±ïëµ•π°ÖπùïA±Ö∏°’Õï…%ê∞Å¡±Öπ%ê§ÅÏ(ÄÅ…ï—’…∏Å°Öπë±ïëµ•πMï—UÕï…A±Ö∏°’Õï…%ê∞Å¡±Öπ%ê§Ï)Ù)ÖÕÂπåÅô’πç—•Ω∏ÅÖëµ•π°ÖπùïUÕï…A±Ö∏°’Õï…%ê∞Å¡±Öπ%ê§ÅÏ(ÄÅ…ï—’…∏Å°Öπë±ïëµ•πMï—UÕï…A±Ö∏°’Õï…%ê∞Å¡±Öπ%ê§Ï)Ù(((ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ(ººÅ1%YMI=10É
‹ÅMM=90Å9%9ÅXƒ(ººÅŸïπ—ΩÃÅŸ•Õ’Ö±ïÃÅÖ’—Ω∑Ö—•çΩÃÅÕïüÈ∏Åôïç°ÑÅëîÅ…ùïπ—•πÑ∏(ººÅ∞Å•çΩπºÅ•πÕ—Ö±ÖëºΩA]Å9<ÅÕîÅµΩë•ô•çÑ∏(ººÅMΩ±ºÅëïçΩ…ÖµΩÃÅ±ÑÅ•π—ï…ôÖËÅ‰Åï∞Å±ΩùºÅëïπ—…ºÅëîÅ±ÑÅÖ¡¿∏(ººÄÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙÙ()çΩπÕ–Å1M}MM=91}=YII%}-dÄÙÄâ±•ŸïÕç…Ω±±}ÕïÖÕΩπÖ±}Öëµ•π}¡…ïŸ•ï‹àÏ)›•πëΩ‹π}}±Õ±ΩâÖ±MïÖÕΩπÖ±Q°ïµîÄÙÅ›•πëΩ‹π}}±Õ±ΩâÖ±MïÖÕΩπÖ±Q°ïµîÅÒÄâÖ’—ºàÏ()çΩπÕ–Å1M}MM=91}Q!5LÄÙÅÏ(ÄÅπΩ…µÖ∞ËÅÏ(ÄÄÄÅ±Öâï∞Ëâ1•ŸïMç…Ω±∞ÅπΩ…µÖ∞à∞(ÄÄÄÅïµΩ©§Ëàà∞(ÄÄÄÅÖççïπ–Èπ’±∞∞(ÄÄÄÅÖççïπ–»Èπ’±∞∞(ÄÄÄÅù±Ω‹Èπ’±∞∞(ÄÄÄÅëïçΩ…Ö—•ΩπÃÈmt(ÄÅÙ∞(ÄÅÕ¡…•πúËÅÏ(ÄÄÄÅ±Öâï∞ËâA…•µÖŸï…Ñà∞(ÄÄÄÅïµΩ©§Ëã¬~2‡à∞(ÄÄÄÅÖççïπ–Ëàçôò·ôâêà∞(ÄÄÄÅÖççïπ–»Ëàçôôò—ôÑà∞(ÄÄÄÅù±Ω‹Ëâ…ùâÑ†»‘‘∞ƒ–Ã∞ƒ‡‰∞∏ƒ‡§à∞(ÄÄÄÅëïçΩ…Ö—•ΩπÃÈlã¬~2‡à∞ã¬~2à∞ã¬~2‡ât(ÄÅÙ∞(ÄÅ°Ö±±Ω›ïï∏ËÅÏ(ÄÄÄÅ±Öâï∞Ëâ!Ö±±Ω›ïï∏à∞(ÄÄÄÅïµΩ©§Ëã¬~:à∞(ÄÄÄÅÖççïπ–Ëàçôò·ÑÃ–à∞(ÄÄÄÅÖççïπ–»ËàçÑ‡‹Âôòà∞(ÄÄÄÅù±Ω‹Ëâ…ùâÑ†»‘‘∞ƒÃ‡∞‘»∞∏ƒ‡§à∞(ÄÄÄÅëïçΩ…Ö—•ΩπÃÈlã¬~:à∞ã¬~V„æ‚<à∞ã¬~FÏât(ÄÅÙ∞(ÄÅç°…•Õ—µÖÃËÅÏ(ÄÄÄÅ±Öâï∞Ëâ9ÖŸ•ëÖêà∞(ÄÄÄÅïµΩ©§Ëã¬~:à∞(ÄÄÄÅÖççïπ–Ëàçïò‘Ã‘¿à∞(ÄÄÄÅÖççïπ–»Ëàçò›ò›ò‹à∞(ÄÄÄÅù±Ω‹Ëâ…ùâÑ†»Ã‰∞‡Ã∞‡¿∞∏ƒ‹§à∞(ÄÄÄÅëïçΩ…Ö—•ΩπÃÈlãävæ‚<à∞ã¬~:à∞ãävæ‚<ât(ÄÅÙ∞(ÄÅπï›ÂïÖ»ËÅÏ(ÄÄÄÅ±Öâï∞Ëâ≈ºÅ9’ïŸºà∞(ÄÄÄÅïµΩ©§Ëã¬~:à∞(ÄÄÄÅÖççïπ–Ëàçôôê–’åà∞(ÄÄÄÅÖççïπ–»Ëàçò·ò·ôòà∞(ÄÄÄÅù±Ω‹Ëâ…ùâÑ†»‘‘∞»ƒ»∞‰»∞∏ƒ‡§à∞(ÄÄÄÅëïçΩ…Ö—•ΩπÃÈlãär†à∞ã¬~:à∞ãär†ât(ÄÅÙ∞(ÄÅ…ïÂïÃËÅÏ(ÄÄÄÅ±Öâï∞ËâµÑÅëîÅIïÂïÃà∞(ÄÄÄÅïµΩ©§Ëã¬~FDà∞(ÄÄÄÅÖççïπ–Ëàçê›à›ôòà∞(ÄÄÄÅÖççïπ–»Ëàçôôê‹’îà∞(ÄÄÄÅù±Ω‹Ëâ…ùâÑ†»ƒ‘∞ƒ‡Ã∞»‘‘∞∏ƒ‹§à∞(ÄÄÄÅëïçΩ…Ö—•ΩπÃÈlãä∂@à∞ã¬~FDà∞ãä∂@ât(ÄÅÙ∞(ÄÅŸÖ±ïπ—•πïÃËÅÏ(ÄÄÄÅ±Öâï∞ËâMÖ∏ÅYÖ±ïπ”µ∏à∞(ÄÄÄÅïµΩ©§Ëã¬~J\à∞(ÄÄÄÅÖççïπ–ËàçôòŸòÂòà∞(ÄÄÄÅÖççïπ–»ËàçôôêŸî–à∞(ÄÄÄÅù±Ω‹Ëâ…ùâÑ†»‘‘∞ƒƒƒ∞ƒ‘‰∞∏ƒ‹§à∞(ÄÄÄÅëïçΩ…Ö—•ΩπÃÈlã¬~J\à∞ãär†à∞ã¬~J\ât(ÄÅÙ∞(ÄÅ¡Ö—…•ÑËÅÏ(ÄÄÄÅ±Öâï∞Ëâïç°ÑÅ¡Ö—…•Ñà∞(ÄÄÄÅïµΩ©§Ëã¬~õ¬~‹à∞(ÄÄÄÅÖççïπ–Ëàå‹’çôôòà∞(ÄÄÄÅÖççïπ–»Ëàçôôôôôòà∞(ÄÄÄÅù±Ω‹Ëâ…ùâÑ†ƒƒ‹∞»¿‹∞»‘‘∞∏ƒ‹§à∞(ÄÄÄÅëïçΩ…Ö—•ΩπÃÈlã¬~õ¬~‹à∞ãäbæ‚<à∞ã¬~õ¬~‹ât(ÄÅÙ∞(ÄÅôÖ—°ï»ËÅÏ(ÄÄÄÅ±Öâï∞ËâµÑÅëï∞ÅAÖë…îà∞(ÄÄÄÅïµΩ©§Ëã¬~F†à∞(ÄÄÄÅÖççïπ–Ëàå‹Õà·ôòà∞(ÄÄÄÅÖççïπ–»ËàçîÂò’ôòà∞(ÄÄÄÅù±Ω‹Ëâ…ùâÑ†ƒƒ‘∞ƒ‡–∞»‘‘∞∏ƒÿ§à∞(ÄÄÄÅëïçΩ…Ö—•ΩπÃÈlã¬~Jdà∞ã¬~F†à∞ã¬~Jdât(ÄÅÙ∞(ÄÅç°•±ë°ΩΩêËÅÏ(ÄÄÄÅ±Öâï∞ËâµÑÅëîÅ±ÖÃÅ%πôÖπç•ÖÃà∞(ÄÄÄÅïµΩ©§Ëã¬~ûHà∞(ÄÄÄÅÖççïπ–Ëàå‹’ëôà‘à∞(ÄÄÄÅÖççïπ–»Ëàçôôê‰Ÿîà∞(ÄÄÄÅù±Ω‹Ëâ…ùâÑ†ƒƒ‹∞»»Ã∞ƒ‡ƒ∞∏ƒ‹§à∞(ÄÄÄÅëïçΩ…Ö—•ΩπÃÈlã¬~: à∞ã¬~û‡à∞ã¬~: ât(ÄÅÙ∞(ÄÅµΩ—°ï»ËÅÏ(ÄÄÄÅ±Öâï∞ËâµÑÅëîÅ±ÑÅ5Öë…îà∞(ÄÄÄÅïµΩ©§Ëã¬~2‹à∞(ÄÄÄÅÖççïπ–Ëàçôò‰Õà‰à∞(ÄÄÄÅÖççïπ–»Ëàçôôò¡òÿà∞(ÄÄÄÅù±Ω‹Ëâ…ùâÑ†»‘‘∞ƒ–‹∞ƒ‡‘∞∏ƒ‹§à∞(ÄÄÄÅëïçΩ…Ö—•ΩπÃÈlã¬~2‹à∞ã¬~J\à∞ã¬~2‹ât(ÄÅÙ∞(ÄÅïÖÕ—ï»ËÅÏ(ÄÄÄÅ±Öâï∞ËâAÖÕç’ÖÃà∞(ÄÄÄÅïµΩ©§Ëã¬~B¿à∞(ÄÄÄÅÖççïπ–Ëàçà‰Âçôòà∞(ÄÄÄÅÖççïπ–»Ëàçôôî·ÑÃà∞(ÄÄÄÅù±Ω‹Ëâ…ùâÑ†ƒ‡‘∞ƒ‘ÿ∞»‘‘∞∏ƒ‹§à∞(ÄÄÄÅëïçΩ…Ö—•ΩπÃÈlã¬~B¿à∞ã¬~ñhà∞ã¬~2‹ât(ÄÅÙ)ÙÏ((ººÅ1•ŸïMç…Ω±∞Ä‹É
‹ÅÖ—∑ÕÕôï…ÖÃÅçΩ∏Å±’Ë∞Å¡…Ωô’πë•ëÖêÅ‰ÅµÖ—ï…•Ö±ïÃÅ¡…Ω¡•ΩÃ∏(ººÅMîÅµÖπ—•ïπï∏Å±ÖÃÅµ•ÕµÖÃÅ—ïµ¡Ω…ÖëÖÃÅ‰Åôïç°ÖÃÏÅïÕ—ÑÅçÖ¡ÑÅÕΩ±ºÅï±ïŸÑÅÕ‘ÅÖ¡Ö…•ïπç•Ñ∏)çΩπÕ–Å1M}MM=91}Q5=MA!ILÄÙÅÏ(ÄÅÕ¡…•πúÈÌÕ≠‰Ëâ…ùâÑ†»‘‘∞ƒ»ÿ∞ƒ‰¿∞∏ƒ‡§à±±•ù°–Ëâ…ùâÑ†ƒÃ‹∞»‘‘∞»¿¿∞∏ƒÃ§à±Õ’…ôÖçîËâ…ùâÑ†»‘‘∞»»¿∞»Ã‹∞∏¿‹§âÙ∞(ÄÅ°Ö±±Ω›ïï∏ÈÌÕ≠‰Ëâ…ùâÑ†»‘‘∞ƒ¿»∞»ƒ∞∏»¿§à±±•ù°–Ëâ…ùâÑ†ƒ¿‹∞–‰∞ƒ‰¿∞∏»¿§à±Õ’…ôÖçîËâ…ùâÑ†»‘‘∞ƒ‘ƒ∞‘‹∞∏¿ÿ§âÙ∞(ÄÅç°…•Õ—µÖÃÈÌÕ≠‰Ëâ…ùâÑ†»–∞ƒ‘Ã∞ƒ»ƒ∞∏ƒÿ§à±±•ù°–Ëâ…ùâÑ†»ƒ‡∞–‘∞ÿÿ∞∏ƒ‹§à±Õ’…ôÖçîËâ…ùâÑ†»Ã‘∞»‘¿∞»‘‘∞∏¿‰§âÙ∞(ÄÅπï›ÂïÖ»ÈÌÕ≠‰Ëâ…ùâÑ†»‘‘∞»¿Ã∞‹–∞∏ƒ‰§à±±•ù°–Ëâ…ùâÑ†ƒ»‡∞‰ƒ∞»‘‘∞∏ƒ‡§à±Õ’…ôÖçîËâ…ùâÑ†»‘‘∞»–‘∞ƒ‰–∞∏¿‡§âÙ∞(ÄÅ…ïÂïÃÈÌÕ≠‰Ëâ…ùâÑ†ƒÿ¿∞‰ÿ∞»‘‘∞∏ƒ‹§à±±•ù°–Ëâ…ùâÑ†»‘‘∞»¿»∞ÿ»∞∏ƒ‡§à±Õ’…ôÖçîËâ…ùâÑ†»–‘∞»»‘∞»‘‘∞∏¿‡§âÙ∞(ÄÅŸÖ±ïπ—•πïÃÈÌÕ≠‰Ëâ…ùâÑ†»‘‘∞‹Ã∞ƒÃ‹∞∏ƒ‡§à±±•ù°–Ëâ…ùâÑ†ƒ‹‰∞ÿƒ∞»‘‘∞∏ƒÃ§à±Õ’…ôÖçîËâ…ùâÑ†»‘‘∞»»»∞»Ã–∞∏¿‡§âÙ∞(ÄÅ¡Ö—…•ÑÈÌÕ≠‰Ëâ…ùâÑ†‹ƒ∞ƒ‡‘∞»‘‘∞∏ƒ‡§à±±•ù°–Ëâ…ùâÑ†»‘‘∞»Ãÿ∞ƒ–ÿ∞∏ƒ–§à±Õ’…ôÖçîËâ…ùâÑ†»»‘∞»–‹∞»‘‘∞∏¿‰§âÙ∞(ÄÅôÖ—°ï»ÈÌÕ≠‰Ëâ…ùâÑ†‘‘∞ƒÃ‘∞»‘‘∞∏ƒ‹§à±±•ù°–Ëâ…ùâÑ†‹ÿ∞»»–∞»ƒÿ∞∏ƒ»§à±Õ’…ôÖçîËâ…ùâÑ†»»¿∞»Ã‡∞»‘‘∞∏¿‹§âÙ∞(ÄÅç°•±ë°ΩΩêÈÌÕ≠‰Ëâ…ùâÑ†‘¿∞»»¿∞ƒÿ‹∞∏ƒ‘§à±±•ù°–Ëâ…ùâÑ†»‘‘∞ƒ‰ƒ∞‘‡∞∏ƒ‹§à±Õ’…ôÖçîËâ…ùâÑ†»Ã»∞»‘‘∞»–‹∞∏¿‡§âÙ∞(ÄÅµΩ—°ï»ÈÌÕ≠‰Ëâ…ùâÑ†»‘‘∞ƒƒ»∞ƒÿÃ∞∏ƒ‹§à±±•ù°–Ëâ…ùâÑ†»‘‘∞»¿ÿ∞»»‡∞∏ƒÃ§à±Õ’…ôÖçîËâ…ùâÑ†»‘‘∞»Ã¿∞»–¿∞∏¿‡§âÙ∞(ÄÅïÖÕ—ï»ÈÌÕ≠‰Ëâ…ùâÑ†ƒÿ–∞ƒƒ»∞»‘‘∞∏ƒ‹§à±±•ù°–Ëâ…ùâÑ†»‘‘∞»¿‰∞‰‡∞∏ƒÿ§à±Õ’…ôÖçîËâ…ùâÑ†»––∞»Ãƒ∞»‘‘∞∏¿‡§âÙ)ÙÏ()ô’πç—•Ω∏Å±Õ…ùïπ—•πÖÖ—ïAÖ…—Ã°ëÖ—îÄÙÅπï‹ÅÖ—î†§§ÅÏ(ÄÅçΩπÕ–Å¡Ö…—ÃÄÙÅπï‹Å%π—∞πÖ—ïQ•µïΩ…µÖ–†âï∏µà∞ÅÏ(ÄÄÄÅ—•µïiΩπîËâµï…•çÑΩ…ùïπ—•πÑΩ	’ïπΩÕ}•…ïÃà∞(ÄÄÄÅÂïÖ»Ëâπ’µï…•åà∞(ÄÄÄÅµΩπ—†Ëà»µë•ù•–à∞(ÄÄÄÅëÖ‰Ëà»µë•ù•–à∞(ÄÄÄÅ›ïï≠ëÖ‰ËâÕ°Ω…–à(ÄÅÙ§πôΩ…µÖ—QΩAÖ…—Ã°ëÖ—î§Ï((ÄÅçΩπÕ–Å¡•ç¨ÄÙÅ—Â¡îÄÙ¯Å¡Ö…—Ãπô•πê°¿ÄÙ¯Å¿π—Â¡îÄÙÙÙÅ—Â¡î§¸πŸÖ±’îÏ(ÄÅ…ï—’…∏ÅÏ(ÄÄÄÅÂïÖ»È9’µâï»°¡•ç¨†âÂïÖ»à§§∞(ÄÄÄÅµΩπ—†È9’µâï»°¡•ç¨†âµΩπ—†à§§∞(ÄÄÄÅëÖ‰È9’µâï»°¡•ç¨†âëÖ‰à§§∞(ÄÄÄÅ›ïï≠ëÖ‰È¡•ç¨†â›ïï≠ëÖ‰à§(ÄÅÙÏ)Ù()ô’πç—•Ω∏Å±ÕÖ—ï-ï‰°‰∞Å¥∞Åê§ÅÏ(ÄÅ…ï—’…∏Å‰Ä®Äƒ¿¿¿¿Ä¨Å¥Ä®Äƒ¿¿Ä¨ÅêÏ)Ù()ô’πç—•Ω∏Å±Õ9—°]ïï≠ëÖÂ=ô5Ωπ—†°ÂïÖ»∞ÅµΩπ—†∞Å›ïï≠ëÖ‰∞Åπ—†§ÅÏ(ÄÄººÅ›ïï≠ëÖ‰ËÄ¿ÅëΩµ•πùºÄ∏∏∏ÄÿÅœÖâÖëº(ÄÅçΩπÕ–Åô•…Õ–ÄÙÅπï‹ÅÖ—î°Ö—îπUQ°ÂïÖ»∞ÅµΩπ—†Ä¥Äƒ∞Äƒ∞Äƒ»§§Ï(ÄÅçΩπÕ–Åô•…Õ—Ö‰ÄÙÅô•…Õ–πùï—UQÖ‰†§Ï(ÄÅçΩπÕ–ÅΩôôÕï–ÄÙÄ°›ïï≠ëÖ‰Ä¥Åô•…Õ—Ö‰Ä¨Ä‹§ÄîÄ‹Ï(ÄÅ…ï—’…∏ÄƒÄ¨ÅΩôôÕï–Ä¨Ä°π—†Ä¥Äƒ§Ä®Ä‹Ï)Ù()ô’πç—•Ω∏Å±ÕÖÕ—ï…Ö—î°ÂïÖ»§ÅÏ(ÄÄººÅ±ùΩ…•—µºÅù…ïùΩ…•ÖπºÅëîÅ5ïï’ÃΩ)ΩπïÃΩ	’—ç°ï»∏(ÄÅçΩπÕ–ÅÑÄÙÅÂïÖ»ÄîÄƒ‰Ï(ÄÅçΩπÕ–ÅàÄÙÅ5Ö—†πô±ΩΩ»°ÂïÖ»ÄºÄƒ¿¿§Ï(ÄÅçΩπÕ–ÅåÄÙÅÂïÖ»ÄîÄƒ¿¿Ï(ÄÅçΩπÕ–ÅêÄÙÅ5Ö—†πô±ΩΩ»°àÄºÄ–§Ï(ÄÅçΩπÕ–ÅîÄÙÅàÄîÄ–Ï(ÄÅçΩπÕ–ÅòÄÙÅ5Ö—†πô±ΩΩ»†°àÄ¨Ä‡§ÄºÄ»‘§Ï(ÄÅçΩπÕ–ÅúÄÙÅ5Ö—†πô±ΩΩ»†°àÄ¥ÅòÄ¨Äƒ§ÄºÄÃ§Ï(ÄÅçΩπÕ–Å†ÄÙÄ†ƒ‰Ä®ÅÑÄ¨ÅàÄ¥ÅêÄ¥ÅúÄ¨Äƒ‘§ÄîÄÃ¿Ï(ÄÅçΩπÕ–Å§ÄÙÅ5Ö—†πô±ΩΩ»°åÄºÄ–§Ï(ÄÅçΩπÕ–Å¨ÄÙÅåÄîÄ–Ï(ÄÅçΩπÕ–Å∞ÄÙÄ†Ã»Ä¨Ä»Ä®ÅîÄ¨Ä»Ä®Å§Ä¥Å†Ä¥Å¨§ÄîÄ‹Ï(ÄÅçΩπÕ–Å¥ÄÙÅ5Ö—†πô±ΩΩ»†°ÑÄ¨ÄƒƒÄ®Å†Ä¨Ä»»Ä®Å∞§ÄºÄ–‘ƒ§Ï(ÄÅçΩπÕ–ÅµΩπ—†ÄÙÅ5Ö—†πô±ΩΩ»†°†Ä¨Å∞Ä¥Ä‹Ä®Å¥Ä¨Äƒƒ–§ÄºÄÃƒ§Ï(ÄÅçΩπÕ–ÅëÖ‰ÄÙÄ†°†Ä¨Å∞Ä¥Ä‹Ä®Å¥Ä¨Äƒƒ–§ÄîÄÃƒ§Ä¨ÄƒÏ(ÄÅ…ï—’…∏ÅÏÅµΩπ—†∞ÅëÖ‰ÅÙÏ)Ù()ô’πç—•Ω∏Åùï—’—ΩµÖ—•çMïÖÕΩπÖ±Q°ïµî°ëÖ—îÄÙÅπï‹ÅÖ—î†§§ÅÏ(ÄÅçΩπÕ–Å¿ÄÙÅ±Õ…ùïπ—•πÖÖ—ïAÖ…—Ã°ëÖ—î§Ï(ÄÅçΩπÕ–Å≠ï‰ÄÙÅ±ÕÖ—ï-ï‰°¿πÂïÖ»∞Å¿πµΩπ—†∞Å¿πëÖ‰§Ï((ÄÄººÅA…•Ω…•ëÖêËÅïŸïπ—ΩÃÅ¡’π—’Ö±ïÃÄ¯Å—ïµ¡Ω…ÖëÖÃÅÖµ¡±•ÖÃ∏(ÄÅçΩπÕ–ÅïÖÕ—ï»ÄÙÅ±ÕÖÕ—ï…Ö—î°¿πÂïÖ»§Ï(ÄÅ•òÄ°¿πµΩπ—†ÄÙÙÙÅïÖÕ—ï»πµΩπ—†ÄòòÅ¿πëÖ‰ÄÙÙÙÅïÖÕ—ï»πëÖ‰§Å…ï—’…∏ÄâïÖÕ—ï»àÏ((ÄÄººÅ≈ºÅ9’ïŸºËÄ»‹Åë•åÄ¥¯Ä»Åïπî(ÄÅ•òÄ†(ÄÄÄÅ≠ï‰Ä¯ÙÅ±ÕÖ—ï-ï‰°¿πÂïÖ»∞Äƒ»∞Ä»‹§ÅÒ(ÄÄÄÅ≠ï‰ÄÙÅ±ÕÖ—ï-ï‰°¿πÂïÖ»∞Äƒ∞Ä»§(ÄÄ§Å…ï—’…∏Äâπï›ÂïÖ»àÏ((ÄÄººÅIïÂïÃËÄ‘Å‰ÄÿÅëîÅïπï…º∏(ÄÅ•òÄ°¿πµΩπ—†ÄÙÙÙÄƒÄòòÅ¿πëÖ‰Ä¯ÙÄ‘ÄòòÅ¿πëÖ‰ÄÙÄÿ§Å…ï—’…∏Äâ…ïÂïÃàÏ((ÄÅ•òÄ°¿πµΩπ—†ÄÙÙÙÄ»ÄòòÅ¿πëÖ‰ÄÙÙÙÄƒ–§Å…ï—’…∏ÄâŸÖ±ïπ—•πïÃàÏ((ÄÄººÅïç°ÖÃÅ¡Ö—…•ÖÃÅ¡…•πç•¡Ö±ïÃÅëîÅ…ùïπ—•πÑ∏(ÄÅ•òÄ†°¿πµΩπ—†ÄÙÙÙÄ‘ÄòòÅ¿πëÖ‰ÄÙÙÙÄ»‘§ÅÒÄ°¿πµΩπ—†ÄÙÙÙÄ‹ÄòòÅ¿πëÖ‰ÄÙÙÙÄ‰§§ÅÏ(ÄÄÄÅ…ï—’…∏Äâ¡Ö—…•ÑàÏ(ÄÅÙ((ÄÄººÅµÑÅëï∞ÅAÖë…îËÅ—ï…çï»ÅëΩµ•πùºÅëîÅ©’π•º∏(ÄÅçΩπÕ–ÅôÖ—°ï…Ö‰ÄÙÅ±Õ9—°]ïï≠ëÖÂ=ô5Ωπ—†°¿πÂïÖ»∞Äÿ∞Ä¿∞ÄÃ§Ï(ÄÅ•òÄ°¿πµΩπ—†ÄÙÙÙÄÿÄòòÅ¿πëÖ‰ÄÙÙÙÅôÖ—°ï…Ö‰§Å…ï—’…∏ÄâôÖ—°ï»àÏ((ÄÄººÅµÑÅëîÅ±ÖÃÅ%πôÖπç•ÖÃËÅ—ï…çï»ÅëΩµ•πùºÅëîÅÖùΩÕ—º∏(ÄÅçΩπÕ–Åç°•±ë°ΩΩëÖ‰ÄÙÅ±Õ9—°]ïï≠ëÖÂ=ô5Ωπ—†°¿πÂïÖ»∞Ä‡∞Ä¿∞ÄÃ§Ï(ÄÅ•òÄ°¿πµΩπ—†ÄÙÙÙÄ‡ÄòòÅ¿πëÖ‰ÄÙÙÙÅç°•±ë°ΩΩëÖ‰§Å…ï—’…∏Äâç°•±ë°ΩΩêàÏ((ÄÄººÅA…•µÖŸï…ÑËÅÕïµÖπÑÅëîÅ±ÖπÈÖµ•ïπ—º∏(ÄÅ•òÄ°¿πµΩπ—†ÄÙÙÙÄ‰ÄòòÅ¿πëÖ‰Ä¯ÙÄ»ƒÄòòÅ¿πëÖ‰ÄÙÄÃ¿§Å…ï—’…∏ÄâÕ¡…•πúàÏ((ÄÄººÅµÑÅëîÅ±ÑÅ5Öë…îËÅ—ï…çï»ÅëΩµ•πùºÅëîÅΩç—’â…î∏(ÄÅçΩπÕ–ÅµΩ—°ï…Ö‰ÄÙÅ±Õ9—°]ïï≠ëÖÂ=ô5Ωπ—†°¿πÂïÖ»∞Äƒ¿∞Ä¿∞ÄÃ§Ï(ÄÅ•òÄ°¿πµΩπ—†ÄÙÙÙÄƒ¿ÄòòÅ¿πëÖ‰ÄÙÙÙÅµΩ—°ï…Ö‰§Å…ï—’…∏ÄâµΩ—°ï»àÏ((ÄÄººÅ!Ö±±Ω›ïï∏ËÉÈ±—•µΩÃÄ‹ÅìµÖÃÅëîÅΩç—’â…î∏(ÄÅ•òÄ°¿πµΩπ—†ÄÙÙÙÄƒ¿ÄòòÅ¿πëÖ‰Ä¯ÙÄ»‘ÄòòÅ¿πëÖ‰ÄÙÄÃƒ§Å…ï—’…∏Äâ°Ö±±Ω›ïï∏àÏ((ÄÄººÅ9ÖŸ•ëÖêËÄ‡ÅÖ∞Ä»ÿÅëîÅë•ç•ïµâ…î∏(ÄÅ•òÄ°¿πµΩπ—†ÄÙÙÙÄƒ»ÄòòÅ¿πëÖ‰Ä¯ÙÄ‡ÄòòÅ¿πëÖ‰ÄÙÄ»ÿ§Å…ï—’…∏Äâç°…•Õ—µÖÃàÏ((ÄÅ…ï—’…∏ÄâπΩ…µÖ∞àÏ)Ù()ô’πç—•Ω∏Åùï—MïÖÕΩπÖ±Q°ïµï-ï‰†§ÅÏ(ÄÄººÅ1•ŸïMç…Ω±∞Ä‹Å¡ï…µ•—îÅ’πÑÅ¡…ïôï…ïπç•ÑÅ±ΩçÖ∞Å¡Ω»Åë•Õ¡ΩÕ•—•Ÿº∏(ÄÄººÅ1ÑÅXÿÅçΩπÕï…ŸÑÅï·Öç—Öµïπ—îÅ±ÑÅÖ¡Ö…•ïπç•ÑÅù±ΩâÖ∞Å¡’â±•çÖëÑ∏(ÄÅ•òÄ°•Õ1•ŸïMç…Ω±∞›¡¿†§§ÅÏ(ÄÄÄÅçΩπÕ–Å¡ï…ÕΩπÖ∞ÄÙÅM—…•πú°ùï—1•ŸïMç…Ω±±Mï——•πùÃ†§¸πÕïÖÕΩπÖ±Q°ïµîÅÒÄâÖ’—ºà§Ï(ÄÄÄÅ•òÄ°¡ï…ÕΩπÖ∞ÄÙÙÙÄâΩôòà§Å…ï—’…∏ÄâπΩ…µÖ∞àÏ(ÄÄÄÅ•òÄ°¡ï…ÕΩπÖ∞ÄÑÙÙÄâÖ’—ºàÄòòÅ1M}MM=91}Q!5Mm¡ï…ÕΩπÖ±t§Å…ï—’…∏Å¡ï…ÕΩπÖ∞Ï(ÄÅÙ((ÄÅçΩπÕ–Å¡’â±•Õ°ïêÄÙÅM—…•πú°›•πëΩ‹π}}±Õ±ΩâÖ±MïÖÕΩπÖ±Q°ïµîÅÒÄâÖ’—ºà§Ï(ÄÅ•òÄ°¡’â±•Õ°ïêÄÑÙÙÄâÖ’—ºàÄòòÅ1M}MM=91}Q!5Mm¡’â±•Õ°ïët§ÅÏ(ÄÄÄÅ…ï—’…∏Å¡’â±•Õ°ïêÏ(ÄÅÙ(ÄÅ…ï—’…∏Åùï—’—ΩµÖ—•çMïÖÕΩπÖ±Q°ïµî†§Ï)Ù()ÖÕÂπåÅô’πç—•Ω∏Å±ΩÖë±ΩâÖ±MïÖÕΩπÖ±Q°ïµî†§ÅÏ(ÄÅ—…‰ÅÏ(ÄÄÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âùï—}ù±ΩâÖ±}ÕïÖÕΩπÖ±}—°ïµîà§Ï(ÄÄÄÅ•òÄ†Öï……Ω»§ÅÏ(ÄÄÄÄÄÅçΩπÕ–Å≠ï‰ÄÙÅM—…•πú°ëÖ—Ñ¸π—°ïµîÅÒÅëÖ—ÑÅÒÄâÖ’—ºà§Ï(ÄÄÄÄÄÅ›•πëΩ‹π}}±Õ±ΩâÖ±MïÖÕΩπÖ±Q°ïµîÄÙÅ≠ï‰ÄÙÙÙÄâÖ’—ºàÅÒÅ1M}MM=91}Q!5Mm≠ïÂtÄ¸Å≠ï‰ÄËÄâÖ’—ºàÏ(ÄÄÄÄÄÅ±ΩçÖ±M—Ω…Öùîπ…ïµΩŸï%—ï¥°1M}MM=91}=YII%}-d§Ï(ÄÄÄÅÙ(ÄÅÙÅçÖ—ç†Ä°|§ÅÌÙ(ÄÅÖ¡¡±ÂMïÖÕΩπÖ±Q°ïµî†§Ï)Ù()ô’πç—•Ω∏Åç±ïÖ…MïÖÕΩπÖ±ïçΩ…Ö—•ΩπÃ†§ÅÏ(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÕMïÖÕΩπÖ±M—Â±îà§¸π…ïµΩŸî†§Ï(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÕMïÖÕΩπÖ±1ΩùΩïçΩ»à§¸π…ïµΩŸî†§Ï(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÕMïÖÕΩπÖ±µâ•ïπ–à§¸π…ïµΩŸî†§Ï(ÄÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÕMïÖÕΩπÖ±—µΩÕ¡°ï…îà§¸π…ïµΩŸî†§Ï(ÄÅëΩç’µïπ–πâΩë‰¸π…ïµΩŸï——…•â’—î†âëÖ—Ñµ±ÃµÕïÖÕΩ∏à§Ï)Ù()ô’πç—•Ω∏ÅÖ¡¡±ÂMïÖÕΩπÖ±Q°ïµî†§ÅÏ(ÄÅ•òÄ†ÖëΩç’µïπ–πâΩë‰ÅÒÅ›•πëΩ‹π}}±ÕMïÖÕΩπÖ±¡¡±Â•πú§Å…ï—’…∏Ï((ÄÅ›•πëΩ‹π}}±ÕMïÖÕΩπÖ±¡¡±Â•πúÄÙÅ—…’îÏ((ÄÅçΩπÕ–Å≠ï‰ÄÙÅùï—MïÖÕΩπÖ±Q°ïµï-ï‰†§Ï(ÄÅçΩπÕ–Å—°ïµîÄÙÅ1M}MM=91}Q!5Mm≠ïÂtÅÒÅ1M}MM=91}Q!5LππΩ…µÖ∞Ï(ÄÅçΩπÕ–ÅÖ—µΩÕ¡°ï…îÄÙÅ1M}MM=91}Q5=MA!IMm≠ïÂtÅÒÅÏ(ÄÄÄÅÕ≠‰È—°ïµîπù±Ω‹∞(ÄÄÄÅ±•ù°–Ëâ…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿–§à∞(ÄÄÄÅÕ’…ôÖçîËâ…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿Ã‘§à(ÄÅÙÏ((ÄÄººÅYÖ…•ÖÃÅÈΩπÖÃÅ¡’ïëï∏Å¡ïë•»ÅÕ•πç…Ωπ•ÈÖ»Åï∞Å—ïµÑÅë’…Öπ—îÅï∞ÅÖ……Öπ≈’î∏(ÄÄººÅM§ÅÂÑÅïÕ”ÑÅçΩµ¡±ï—º∞Å±ºÅ…ï’—•±•ÈÖµΩÃÅÕ•∏Å≈’•—Ö»ÅïÕ—•±ΩÃÅπ§Å…ïçΩπÕ—…’•»Å=4∏(ÄÅçΩπÕ–ÅÕÖµïQ°ïµîÄÙÅëΩç’µïπ–πâΩë‰πëÖ—ÖÕï–π±ÕMïÖÕΩ∏ÄÙÙÙÅ≠ï‰Ï(ÄÅçΩπÕ–ÅπÖŸ·•Õ—ÃÄÙÄÑÖëΩç’µïπ–π≈’ï…ÂMï±ïç—Ω»†âπÖÿà§Ï(ÄÅçΩπÕ–ÅÕïÖÕΩπÖ±M—Â±ïIïÖë‰ÄÙÅ≠ï‰ÄÙÙÙÄâπΩ…µÖ∞àÅÒÄÑÖëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÕMïÖÕΩπÖ±M—Â±îà§Ï(ÄÅçΩπÕ–ÅπÖŸïçΩ…Ö—•ΩπIïÖë‰ÄÙÅ≠ï‰ÄÙÙÙÄâπΩ…µÖ∞àÅÒÄÖπÖŸ·•Õ—ÃÅÒÄÑÖëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÕMïÖÕΩπÖ±1ΩùΩïçΩ»à§Ï(ÄÅçΩπÕ–ÅÖ—µΩÕ¡°ï…ïIïÖë‰ÄÙÅ≠ï‰ÄÙÙÙÄâπΩ…µÖ∞àÅÒÄÑÖëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÕMïÖÕΩπÖ±—µΩÕ¡°ï…îà§Ï((ÄÅ•òÄ°ÕÖµïQ°ïµîÄòòÅÕïÖÕΩπÖ±M—Â±ïIïÖë‰ÄòòÅπÖŸïçΩ…Ö—•ΩπIïÖë‰ÄòòÅÖ—µΩÕ¡°ï…ïIïÖë‰§ÅÏ(ÄÄÄÅÕÂπçMïÖÕΩπÖ±ëµ•πΩπ—…Ω±Ã†§Ï(ÄÄÄÅ›•πëΩ‹π}}±ÕMïÖÕΩπÖ±¡¡±Â•πúÄÙÅôÖ±ÕîÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅç±ïÖ…MïÖÕΩπÖ±ïçΩ…Ö—•ΩπÃ†§Ï(ÄÅëΩç’µïπ–πâΩë‰πëÖ—ÖÕï–π±ÕMïÖÕΩ∏ÄÙÅ≠ï‰Ï((ÄÅ•òÄ°≠ï‰ÄÙÙÙÄâπΩ…µÖ∞à§ÅÏ(ÄÄÄÅÕÂπçMïÖÕΩπÖ±ëµ•πΩπ—…Ω±Ã†§Ï(ÄÄÄÅ›•πëΩ‹π}}±ÕMïÖÕΩπÖ±¡¡±Â•πúÄÙÅôÖ±ÕîÏ(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ((ÄÅçΩπÕ–ÅÕ—Â±îÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âÕ—Â±îà§Ï(ÄÅÕ—Â±îπ•êÄÙÄâ±ÕMïÖÕΩπÖ±M—Â±îàÏ((ÄÅçΩπÕ–ÅÕ¡…•πù·—…ÑÄÙÅ≠ï‰ÄÙÙÙÄâÕ¡…•πúàÄ¸ÅÄ(ÄÄÄÅâΩëÂmëÖ—Ñµ±ÃµÕïÖÕΩ∏ÙâÕ¡…•πúâtÄπôΩ…¥µçÖ…ê∞(ÄÄÄÅâΩëÂmëÖ—Ñµ±ÃµÕïÖÕΩ∏ÙâÕ¡…•πúâtÄπµΩëÖ∞µâΩ‡ÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘‘∞ƒ–Ã∞ƒ‡‰∞∏ƒÿ§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ(ÄÄÄÅâΩëÂmëÖ—Ñµ±ÃµÕïÖÕΩ∏ÙâÕ¡…•πúâtÄπ¡Öùîµ—•—±îËÈÖô—ï»ÅÏ(ÄÄÄÄÄÅçΩπ—ïπ–ËàÄÉ¬~2‡àÏ(ÄÄÄÄÄÅôΩπ–µÕ•ÈîË∏‘’ï¥Ï(ÄÄÄÄÄÅŸï…—•çÖ∞µÖ±•ù∏Èµ•ëë±îÏ(ÄÄÄÄÄÅΩ¡Öç•—‰Ë∏‡‘Ï(ÄÄÄÅÙ(ÄÅÄÄËÄààÏ((ÄÅÕ—Â±îπ—ï·—Ωπ—ïπ–ÄÙÅÄ(ÄÄÄÅâΩëÂmëÖ—Ñµ±ÃµÕïÖÕΩ∏ÙàëÌ≠ïÂÙâtÅÏ(ÄÄÄÄÄÄ¥µùΩ±êËëÌ—°ïµîπÖççïπ—ÙÏ(ÄÄÄÄÄÄ¥µùΩ±êµë•¥ËëÌ—°ïµîπÖççïπ—ÙÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêË(ÄÄÄÄÄÄÄÅ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–ÄƒÿîÄ¿î∞ÄëÌ—°ïµîπù±Ω›Ù∞Å—…ÖπÕ¡Ö…ïπ–Ä»‹î§∞(ÄÄÄÄÄÄÄÅ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‰»îÄƒ–î∞ÅçΩ±Ω»µµ•‡°•∏ÅÕ…ùà∞ÄëÌ—°ïµîπÖççïπ–…ÙÄƒ»î∞Å—…ÖπÕ¡Ö…ïπ–§∞Å—…ÖπÕ¡Ö…ïπ–Ä»ÿî§∞(ÄÄÄÄÄÄÄÅŸÖ»†¥µ•π¨§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ((ÄÄÄÄç±ÕMïÖÕΩπÖ±—µΩÕ¡°ï…îÅÏ(ÄÄÄÄÄÅ¡ΩÕ•—•Ω∏Èô•·ïêÏ(ÄÄÄÄÄÅ•πÕï–Ë¿Ï(ÄÄÄÄÄÅËµ•πëï‡Ë¿Ï(ÄÄÄÄÄÅΩŸï…ô±Ω‹È°•ëëï∏Ï(ÄÄÄÄÄÅ¡Ω•π—ï»µïŸïπ—ÃÈπΩπîÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêË(ÄÄÄÄÄÄÄÅ…Öë•Ö∞µù…Öë•ïπ–°ï±±•¡ÕîÅÖ–ÄƒÿîÄÃî∞ëÌÖ—µΩÕ¡°ï…îπÕ≠ÂÙ±—…ÖπÕ¡Ö…ïπ–ÄÃ‹î§∞(ÄÄÄÄÄÄÄÅ…Öë•Ö∞µù…Öë•ïπ–°ï±±•¡ÕîÅÖ–Ä‡‡îÄ»ÿî∞ëÌÖ—µΩÕ¡°ï…îπ±•ù°—Ù±—…ÖπÕ¡Ö…ïπ–Ä–»î§∞(ÄÄÄÄÄÄÄÅ±•πïÖ»µù…Öë•ïπ–†ƒƒ·ëïú±—…ÖπÕ¡Ö…ïπ–Äƒ‡î∞ëÌÖ—µΩÕ¡°ï…îπÕ’…ôÖçïÙÄ–‰î±—…ÖπÕ¡Ö…ïπ–Ä‹»î§Ï(ÄÄÄÄÄÅΩ¡Öç•—‰Ë∏‰»Ï(ÄÄÄÄÄÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ïh†¿§Ï(ÄÄÄÅÙ((ÄÄÄÄç±ÕMïÖÕΩπÖ±—µΩÕ¡°ï…îËÈâïôΩ…î∞(ÄÄÄÄç±ÕMïÖÕΩπÖ±—µΩÕ¡°ï…îËÈÖô—ï»ÅÏ(ÄÄÄÄÄÅçΩπ—ïπ–ËààÏ(ÄÄÄÄÄÅ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÏ(ÄÄÄÄÄÅ•πÕï–Ë¥»‘îÏ(ÄÄÄÄÄÅ¡Ω•π—ï»µïŸïπ—ÃÈπΩπîÏ(ÄÄÄÅÙ((ÄÄÄÄç±ÕMïÖÕΩπÖ±—µΩÕ¡°ï…îËÈâïôΩ…îÅÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈçΩπ•åµù…Öë•ïπ–°ô…Ω¥Äƒƒ¡ëïú±—…ÖπÕ¡Ö…ïπ–∞ëÌÖ—µΩÕ¡°ï…îπÕ’…ôÖçïÙ±—…ÖπÕ¡Ö…ïπ–Äƒ‰î∞ëÌÖ—µΩÕ¡°ï…îπÕ≠ÂÙ±—…ÖπÕ¡Ö…ïπ–Ä–»î§Ï(ÄÄÄÄÄÅΩ¡Öç•—‰Ë∏ÃÿÏ(ÄÄÄÄÄÅÖπ•µÖ—•Ω∏È±ÕMïÖÕΩπÖ±1•ù°—=…â•–Ä»ŸÃÅ±•πïÖ»Å•πô•π•—îÏ(ÄÄÄÅÙ((ÄÄÄÄç±ÕMïÖÕΩπÖ±—µΩÕ¡°ï…îËÈÖô—ï»ÅÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêµ•µÖùîÈ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±î±…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏»–§Ä¿Ä≈¡‡±—…ÖπÕ¡Ö…ïπ–Äƒ∏—¡‡§Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêµÕ•ÈîË–Ÿ¡‡Ä–Ÿ¡‡Ï(ÄÄÄÄÄÅΩ¡Öç•—‰Ë∏¿‘‘Ï(ÄÄÄÄÄÅ—…ÖπÕôΩ…¥È…Ω—Ö—î†Âëïú§Ï(ÄÄÄÅÙ((ÄÄÄÅâΩëÂmëÖ—Ñµ±ÃµÕïÖÕΩ∏ÙàëÌ≠ïÂÙâtÅπÖÿÅÏ(ÄÄÄÄÄÅâΩ…ëï»µâΩ——Ω¥µçΩ±Ω»ÈçΩ±Ω»µµ•‡°•∏ÅÕ…ùà∞ÄëÌ—°ïµîπÖççïπ—ÙÄ»‘î∞ÅŸÖ»†¥µâΩ…ëï»§§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä·¡‡ÄÃ¡¡‡ÄëÌ—°ïµîπù±Ω›ÙÏ(ÄÄÄÅÙ((ÄÄÄÅâΩëÂmëÖ—Ñµ±ÃµÕïÖÕΩ∏ÙàëÌ≠ïÂÙâtÄπâ—∏ÅÏ(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä·¡‡Ä»—¡‡ÄëÌ—°ïµîπù±Ω›ÙÏ(ÄÄÄÅÙ((ÄÄÄÅâΩëÂmëÖ—Ñµ±ÃµÕïÖÕΩ∏ÙàëÌ≠ïÂÙâtÄπôΩ…¥µçÖ…ê∞(ÄÄÄÅâΩëÂmëÖ—Ñµ±ÃµÕïÖÕΩ∏ÙàëÌ≠ïÂÙâtÄπµΩëÖ∞µâΩ‡∞(ÄÄÄÅâΩëÂmëÖ—Ñµ±ÃµÕïÖÕΩ∏ÙàëÌ≠ïÂÙâtÄπ¡…Ωô•±îµçÖ…ê∞(ÄÄÄÅâΩëÂmëÖ—Ñµ±ÃµÕïÖÕΩ∏ÙàëÌ≠ïÂÙâtÄπÕ—Ω…îµçÖ…êÅÏ(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë(ÄÄÄÄÄÄÄÄ¿ÄƒŸ¡‡Ä–…¡‡Å…ùâÑ†¿∞¿∞¿∞∏»»§∞(ÄÄÄÄÄÄÄÄ¿Ä¿Ä»—¡‡ÄëÌ—°ïµîπù±Ω›ÙÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêµ•µÖùîÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú∞ëÌÖ—µΩÕ¡°ï…îπÕ’…ôÖçïÙ±—…ÖπÕ¡Ö…ïπ–Ä–ÿî§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ((ÄÄÄÄπ±ÃµÕïÖÕΩπÖ∞µ±ΩùºµëïçΩ»ÅÏ(ÄÄÄÄÄÅë•Õ¡±Ö‰Èô±ï‡Ï(ÄÄÄÄÄÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ï(ÄÄÄÄÄÅùÖ¿Ë≈¡‡Ï(ÄÄÄÄÄÅôΩπ–µÕ•ÈîËƒ’¡‡Ï(ÄÄÄÄÄÅ±•πîµ°ï•ù°–ËƒÏ(ÄÄÄÄÄÅ¡Ω•π—ï»µïŸïπ—ÃÈπΩπîÏ(ÄÄÄÄÄÅô•±—ï»Èë…Ω¿µÕ°ÖëΩ‹†¿Ä…¡‡Ä·¡‡ÄëÌ—°ïµîπù±Ω›Ù§Ï(ÄÄÄÄÄÅÖπ•µÖ—•Ω∏È±ÕMïÖÕΩπÖ±±ΩÖ–ÄÃ∏…ÃÅïÖÕîµ•∏µΩ’–Å•πô•π•—îÏ(ÄÄÄÅÙ((ÄÄÄÄπ±ÃµÕïÖÕΩπÖ∞µ±ΩùºµëïçΩ»ÅÕ¡Ö∏Èπ—†µç°•±ê†»§ÅÏ(ÄÄÄÄÄÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ïd†¥—¡‡§ÅÕçÖ±î†∏‡»§Ï(ÄÄÄÅÙ((ÄÄÄÅ≠ïÂô…ÖµïÃÅ±ÕMïÖÕΩπÖ±±ΩÖ–ÅÏ(ÄÄÄÄÄÄ¿î∞ƒ¿¿îÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ïd†¿§Å…Ω—Ö—î†¥…ëïú§ÏÅÙ(ÄÄÄÄÄÄ‘¿îÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ïd†¥…¡‡§Å…Ω—Ö—î†…ëïú§ÏÅÙ(ÄÄÄÅÙ((ÄÄÄÄπ±ÃµÕïÖÕΩπÖ∞µÖµâ•ïπ–µ•—ï¥ÅÏ(ÄÄÄÄÄÅ¡ΩÕ•—•Ω∏Èô•·ïêÏ(ÄÄÄÄÄÅ—Ω¿Ë¥Ã¡¡‡Ï(ÄÄÄÄÄÅËµ•πëï‡Ë‡Ï(ÄÄÄÄÄÅ¡Ω•π—ï»µïŸïπ—ÃÈπΩπîÏ(ÄÄÄÄÄÅôΩπ–µÕ•ÈîËƒÕ¡‡Ï(ÄÄÄÄÄÅΩ¡Öç•—‰Ë∏Ã–Ï(ÄÄÄÄÄÅ›•±∞µç°ÖπùîÈ—…ÖπÕôΩ…¥∞ÅΩ¡Öç•—‰Ï(ÄÄÄÄÄÅô•±—ï»Èë…Ω¿µÕ°ÖëΩ‹†¿ÄŸ¡‡ÄÂ¡‡Å…ùâÑ†¿∞¿∞¿∞∏»‡§§Ï(ÄÄÄÅÙ((ÄÄÄÄπ±ÃµÕïÖÕΩπÖ∞µÖµâ•ïπ–µ•—ï¥Èπ—†µç°•±ê†Õ∏¨ƒ§ÅÏÅô•±—ï»Èâ±’»†∏»’¡‡§Åë…Ω¿µÕ°ÖëΩ‹†¿Ä·¡‡Äƒ…¡‡Å…ùâÑ†¿∞¿∞¿∞∏»‡§§Ì—…ÖπÕôΩ…¥ÈÕçÖ±î†∏‡»§ÌΩ¡Öç•—‰Ë∏»»ÏÅÙ(ÄÄÄÄπ±ÃµÕïÖÕΩπÖ∞µÖµâ•ïπ–µ•—ï¥Èπ—†µç°•±ê†Õ∏¨»§ÅÏÅôΩπ–µÕ•ÈîËƒ·¡‡ÌΩ¡Öç•—‰Ë∏–¿ÏÅÙ((ÄÄÄÅ≠ïÂô…ÖµïÃÅ±ÕMïÖÕΩπÖ±1•ù°—=…â•–ÅÏ(ÄÄÄÄÄÅô…Ω¥ÅÏÅ—…ÖπÕôΩ…¥È…Ω—Ö—î†¡ëïú§ÅÕçÖ±î†ƒ§ÏÅÙ(ÄÄÄÄÄÄ‘¿îÅÏÅ—…ÖπÕôΩ…¥È…Ω—Ö—î†ƒ‡¡ëïú§ÅÕçÖ±î†ƒ∏¿‡§ÏÅÙ(ÄÄÄÄÄÅ—ºÅÏÅ—…ÖπÕôΩ…¥È…Ω—Ö—î†Ãÿ¡ëïú§ÅÕçÖ±î†ƒ§ÏÅÙ(ÄÄÄÅÙ((ÄÄÄÄπ±ÃµÕïÖÕΩπÖ∞µôÖ±∞ÅÏ(ÄÄÄÄÄÅÖπ•µÖ—•Ω∏È±ÕMïÖÕΩπÖ±Ö±∞Å±•πïÖ»Å•πô•π•—îÏ(ÄÄÄÅÙ((ÄÄÄÄπ±ÃµÕïÖÕΩπÖ∞µô±‰ÅÏ(ÄÄÄÄÄÅ—Ω¿ÈÖ’—ºÏ(ÄÄÄÄÄÅâΩ——Ω¥Ëƒ‡îÏ(ÄÄÄÄÄÅÖπ•µÖ—•Ω∏È±ÕMïÖÕΩπÖ±±‰ÅïÖÕîµ•∏µΩ’–Å•πô•π•—îÏ(ÄÄÄÅÙ((ÄÄÄÄπ±ÃµÕïÖÕΩπÖ∞µ—›•π≠±îÅÏ(ÄÄÄÄÄÅ—Ω¿Ëƒ»îÏ(ÄÄÄÄÄÅÖπ•µÖ—•Ω∏È±ÕMïÖÕΩπÖ±Q›•π≠±îÅïÖÕîµ•∏µΩ’–Å•πô•π•—îÏ(ÄÄÄÅÙ((ÄÄÄÄπ±ÃµÕïÖÕΩπÖ∞µô±ΩÖ–ÅÏ(ÄÄÄÄÄÅ—Ω¿ÈÖ’—ºÏ(ÄÄÄÄÄÅâΩ——Ω¥Ë¥Ã¡¡‡Ï(ÄÄÄÄÄÅÖπ•µÖ—•Ω∏È±ÕMïÖÕΩπÖ±±ΩÖ—U¿ÅïÖÕîµ•∏µΩ’–Å•πô•π•—îÏ(ÄÄÄÅÙ((ÄÄÄÄπ±ÃµÕïÖÕΩπÖ∞µ›ÖŸîÅÏ(ÄÄÄÄÄÅ—Ω¿ÈÖ’—ºÏ(ÄÄÄÄÄÅâΩ——Ω¥Ë‡îÏ(ÄÄÄÄÄÅÖπ•µÖ—•Ω∏È±ÕMïÖÕΩπÖ±]ÖŸîÅïÖÕîµ•∏µΩ’–Å•πô•π•—îÏ(ÄÄÄÅÙ((ÄÄÄÄπ±ÃµÕïÖÕΩπÖ∞µâΩ’πçîÅÏ(ÄÄÄÄÄÅ—Ω¿ÈÖ’—ºÏ(ÄÄÄÄÄÅâΩ——Ω¥Ë¥»’¡‡Ï(ÄÄÄÄÄÅÖπ•µÖ—•Ω∏È±ÕMïÖÕΩπÖ±	Ω’πçîÅïÖÕîµ•∏µΩ’–Å•πô•π•—îÏ(ÄÄÄÅÙ((ÄÄÄÅ≠ïÂô…ÖµïÃÅ±ÕMïÖÕΩπÖ±Ö±∞ÅÏ(ÄÄÄÄÄÅô…Ω¥ÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—îÕê†¿∞¥Ã’¡‡∞¿§Å…Ω—Ö—î†¡ëïú§ÏÅÙ(ÄÄÄÄÄÅ—ºÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—îÕê†Ã·¡‡∞ƒƒ¡Ÿ†∞¿§Å…Ω—Ö—î†Ãÿ¡ëïú§ÏÅÙ(ÄÄÄÅÙ((ÄÄÄÅ≠ïÂô…ÖµïÃÅ±ÕMïÖÕΩπÖ±±‰ÅÏ(ÄÄÄÄÄÄ¿î∞ƒ¿¿îÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—îÕê†¥ƒ·¡‡∞¿∞¿§Å…Ω—Ö—î†¥›ëïú§ÏÅÙ(ÄÄÄÄÄÄ‘¿îÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—îÕê†–…¡‡∞¥ÿ’¡‡∞¿§Å…Ω—Ö—î†›ëïú§ÏÅÙ(ÄÄÄÅÙ((ÄÄÄÅ≠ïÂô…ÖµïÃÅ±ÕMïÖÕΩπÖ±Q›•π≠±îÅÏ(ÄÄÄÄÄÄ¿î∞ƒ¿¿îÅÏÅΩ¡Öç•—‰Ë∏ƒ»ÏÅ—…ÖπÕôΩ…¥ÈÕçÖ±î†∏‹§Å…Ω—Ö—î†¡ëïú§ÏÅÙ(ÄÄÄÄÄÄ‘¿îÅÏÅΩ¡Öç•—‰Ë∏‘»ÏÅ—…ÖπÕôΩ…¥ÈÕçÖ±î†ƒ∏ƒ‡§Å…Ω—Ö—î†»’ëïú§ÏÅÙ(ÄÄÄÅÙ((ÄÄÄÅ≠ïÂô…ÖµïÃÅ±ÕMïÖÕΩπÖ±±ΩÖ—U¿ÅÏ(ÄÄÄÄÄÄ¿îÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—îÕê†¿∞¿∞¿§Å…Ω—Ö—î†¥’ëïú§ÏÅΩ¡Öç•—‰Ë∏ƒ»ÏÅÙ(ÄÄÄÄÄÄ‘¿îÅÏÅΩ¡Öç•—‰Ë∏Ã‡ÏÅÙ(ÄÄÄÄÄÄƒ¿¿îÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—îÕê†ƒ·¡‡∞¥ƒƒ¡Ÿ†∞¿§Å…Ω—Ö—î†·ëïú§ÏÅΩ¡Öç•—‰Ë∏¿‡ÏÅÙ(ÄÄÄÅÙ((ÄÄÄÅ≠ïÂô…ÖµïÃÅ±ÕMïÖÕΩπÖ±]ÖŸîÅÏ(ÄÄÄÄÄÄ¿î∞ƒ¿¿îÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—îÕê†¥ƒ…¡‡∞¿∞¿§Å…Ω—Ö—î†¥—ëïú§ÏÅÙ(ÄÄÄÄÄÄ‘¿îÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—îÕê†»¡¡‡∞¥ƒ·¡‡∞¿§Å…Ω—Ö—î†—ëïú§ÏÅÙ(ÄÄÄÅÙ((ÄÄÄÅ≠ïÂô…ÖµïÃÅ±ÕMïÖÕΩπÖ±	Ω’πçîÅÏ(ÄÄÄÄÄÄ¿îÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—îÕê†¿∞¿∞¿§ÅÕçÖ±î†∏‰§ÏÅÙ(ÄÄÄÄÄÄ‘¿îÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—îÕê†¿∞¥‹’Ÿ†∞¿§ÅÕçÖ±î†ƒ∏¿‘§ÏÅÙ(ÄÄÄÄÄÄƒ¿¿îÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—îÕê†»¡¡‡∞¥ƒƒ¡Ÿ†∞¿§ÅÕçÖ±î†∏‰»§ÏÅÙ(ÄÄÄÅÙ((ÄÄÄÅµïë•ÑÄ°¡…ïôï…Ãµ…ïë’çïêµµΩ—•Ω∏È…ïë’çî§ÅÏ(ÄÄÄÄÄÄπ±ÃµÕïÖÕΩπÖ∞µ±ΩùºµëïçΩ»∞(ÄÄÄÄÄÄπ±ÃµÕïÖÕΩπÖ∞µÖµâ•ïπ–µ•—ï¥∞(ÄÄÄÄÄÄç±ÕMïÖÕΩπÖ±—µΩÕ¡°ï…îËÈâïôΩ…îÅÏ(ÄÄÄÄÄÄÄÅÖπ•µÖ—•Ω∏ÈπΩπîÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÄπ±ÃµÕïÖÕΩπÖ∞µÖµâ•ïπ–µ•—ï¥ÅÏÅë•Õ¡±Ö‰ÈπΩπîÄÖ•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞π±Ãµ±ïùÖç‰Äπ±ÃµÕïÖÕΩπÖ∞µÖµâ•ïπ–µ•—ï¥ÅÏ(ÄÄÄÄÄÅë•Õ¡±Ö‰ÈπΩπîÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ((ÄÄÄÅ°—µ∞π±Ãµ±ïùÖç‰Äç±ÕMïÖÕΩπÖ±—µΩÕ¡°ï…îËÈâïôΩ…î∞(ÄÄÄÅ°—µ∞π±Ãµ±ïùÖç‰Äç±ÕMïÖÕΩπÖ±—µΩÕ¡°ï…îËÈÖô—ï»ÅÏÅë•Õ¡±Ö‰ÈπΩπîÄÖ•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅ°—µ∞π±Ãµ±ïùÖç‰Äç±ÕMïÖÕΩπÖ±—µΩÕ¡°ï…îÅÏÅΩ¡Öç•—‰Ë∏–»ÏÅÙ((ÄÄÄÄëÌÕ¡…•πù·—…ÖÙ(ÄÅÄÏ(ÄÅëΩç’µïπ–π°ïÖêπÖ¡¡ïπë°•±ê°Õ—Â±î§Ï((ÄÅçΩπÕ–ÅÖ—µΩÕ¡°ï…ï1ÖÂï»ÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âë•ÿà§Ï(ÄÅÖ—µΩÕ¡°ï…ï1ÖÂï»π•êÄÙÄâ±ÕMïÖÕΩπÖ±—µΩÕ¡°ï…îàÏ(ÄÅÖ—µΩÕ¡°ï…ï1ÖÂï»πÕï———…•â’—î†âÖ…•Ñµ°•ëëï∏à∞Äâ—…’îà§Ï(ÄÅëΩç’µïπ–πâΩë‰π¡…ï¡ïπê°Ö—µΩÕ¡°ï…ï1ÖÂï»§Ï((ÄÄººÅïçΩ…ÖµΩÃÅï∞Å±ΩùºøÖ…ïÑÅëîÅµÖ…çÑÅM%8Å…ïïµ¡±ÖÈÖ…±º∏(ÄÅçΩπÕ–ÅπÖÿÄÙÅëΩç’µïπ–π≈’ï…ÂMï±ïç—Ω»†âπÖÿà§Ï(ÄÅ•òÄ°πÖÿ§ÅÏ(ÄÄÄÅçΩπÕ–ÅëïçΩ»ÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âë•ÿà§Ï(ÄÄÄÅëïçΩ»π•êÄÙÄâ±ÕMïÖÕΩπÖ±1ΩùΩïçΩ»àÏ(ÄÄÄÅëïçΩ»πç±ÖÕÕ9ÖµîÄÙÄâ±ÃµÕïÖÕΩπÖ∞µ±ΩùºµëïçΩ»àÏ(ÄÄÄÅëïçΩ»πÕï———…•â’—î†âÖ…•Ñµ°•ëëï∏à∞Äâ—…’îà§Ï(ÄÄÄÅëïçΩ»π•ππï…!Q50ÄÙÄ°—°ïµîπëïçΩ…Ö—•ΩπÃÅÒÅmt§πµÖ¿°‡ÄÙ¯ÅÄÒÕ¡Ö∏¯ëÌ·ÙΩÕ¡Ö∏˘Ä§π©Ω•∏†àà§Ï((ÄÄÄÅçΩπÕ–Åâ…ÖπëÖπë•ëÖ—ïÃÄÙÅl(ÄÄÄÄÄÅπÖÿπ≈’ï…ÂMï±ïç—Ω»†àπâ…Öπêà§∞(ÄÄÄÄÄÅπÖÿπ≈’ï…ÂMï±ïç—Ω»†àπ±Ωùºà§∞(ÄÄÄÄÄÅπÖÿπ≈’ï…ÂMï±ïç—Ω»†àππÖÿµâ…Öπêà§∞(ÄÄÄÄÄÅπÖÿπ≈’ï…ÂMï±ïç—Ω»†âmç±ÖÕÃ®Ùùâ…Öπêùtà§∞(ÄÄÄÄÄÅπÖÿπ≈’ï…ÂMï±ïç—Ω»†âmç±ÖÕÃ®Ùù±Ωùºùtà§(ÄÄÄÅtπô•±—ï»°	ΩΩ±ïÖ∏§Ï((ÄÄÄÅçΩπÕ–Åâ…ÖπêÄÙÅâ…ÖπëÖπë•ëÖ—ïÕl¡tÏ((ÄÄÄÅ•òÄ°â…Öπê§ÅÏ(ÄÄÄÄÄÅâ…ÖπêπÕ—Â±îπ¡ΩÕ•—•Ω∏ÄÙÅâ…ÖπêπÕ—Â±îπ¡ΩÕ•—•Ω∏ÅÒÄâ…ï±Ö—•ŸîàÏ(ÄÄÄÄÄÅëïçΩ»πÕ—Â±îπ¡ΩÕ•—•Ω∏ÄÙÄâÖâÕΩ±’—îàÏ(ÄÄÄÄÄÅëïçΩ»πÕ—Â±îπ…•ù°–ÄÙÄà¥»›¡‡àÏ(ÄÄÄÄÄÅëïçΩ»πÕ—Â±îπ—Ω¿ÄÙÄà¥›¡‡àÏ(ÄÄÄÄÄÅâ…ÖπêπÖ¡¡ïπë°•±ê°ëïçΩ»§Ï(ÄÄÄÅÙÅï±ÕîÅÏ(ÄÄÄÄÄÄººÅÖ±±âÖç¨ÅÕïù’…ºËÅëïçΩ…ÖçßÕ∏Å¡ï≈’ó≈ÑÅï∏Å±ÑÅïÕ≈’•πÑÅëï∞ÅπÖÿ∏(ÄÄÄÄÄÅπÖÿπÕ—Â±îπ¡ΩÕ•—•Ω∏ÄÙÅπÖÿπÕ—Â±îπ¡ΩÕ•—•Ω∏ÅÒÄâ…ï±Ö—•ŸîàÏ(ÄÄÄÄÄÅëïçΩ»πÕ—Â±îπ¡ΩÕ•—•Ω∏ÄÙÄâÖâÕΩ±’—îàÏ(ÄÄÄÄÄÅëïçΩ»πÕ—Â±îπ±ïô–ÄÙÄà›¡‡àÏ(ÄÄÄÄÄÅëïçΩ»πÕ—Â±îπ—Ω¿ÄÙÄàÕ¡‡àÏ(ÄÄÄÄÄÅëïçΩ»πÕ—Â±îπÈ%πëï‡ÄÙÄà‘àÏ(ÄÄÄÄÄÅπÖÿπÖ¡¡ïπë°•±ê°ëïçΩ»§Ï(ÄÄÄÅÙ(ÄÅÙ((ÄÄººÅôïç—ΩÃÅÖµâ•ïπ—Ö±ïÃÅÕ’ÖŸïÃÅ¡Ω»ÅïŸïπ—º∏(ÄÅ•òÄ†ÖëΩç’µïπ–πëΩç’µïπ—±ïµïπ–πç±ÖÕÕ1•Õ–πçΩπ—Ö•πÃ†â±Ãµ±ïùÖç‰à§§ÅÏ(ÄÄÄÅçΩπÕ–ÅÖµâ•ïπ—5Ö¿ÄÙÅÏ(ÄÄÄÄÄÅÕ¡…•πúËÅÏ(ÄÄÄÄÄÄÄÅ•—ïµÃÈlã¬~2‡à∞ã¬~2à∞ã¬~2‡à∞ã¬~2‡à∞ã¬~2à∞ã¬~2‡ât∞(ÄÄÄÄÄÄÄÅç±ÖÕÕ9ÖµîËâ±ÃµÕïÖÕΩπÖ∞µôÖ±∞à(ÄÄÄÄÄÅÙ∞(ÄÄÄÄÄÅ°Ö±±Ω›ïï∏ËÅÏ(ÄÄÄÄÄÄÄÅ•—ïµÃÈlã¬~öà∞ã¬~öà∞ã¬~öà∞ã¬~öà∞ã¬~öât∞(ÄÄÄÄÄÄÄÅç±ÖÕÕ9ÖµîËâ±ÃµÕïÖÕΩπÖ∞µô±‰à(ÄÄÄÄÄÅÙ∞(ÄÄÄÄÄÅç°…•Õ—µÖÃËÅÏ(ÄÄÄÄÄÄÄÅ•—ïµÃÈlã¬~:à∞ãävæ‚<à∞ã¬~:à∞ãävæ‚<à∞ã¬~:ât∞(ÄÄÄÄÄÄÄÅç±ÖÕÕ9ÖµîËâ±ÃµÕïÖÕΩπÖ∞µôÖ±∞à(ÄÄÄÄÄÅÙ∞(ÄÄÄÄÄÅπï›ÂïÖ»ËÅÏ(ÄÄÄÄÄÄÄÅ•—ïµÃÈlãär†à∞ãä∂@à∞ãär†à∞ã¬~2|à∞ãär†à∞ãä∂@ât∞(ÄÄÄÄÄÄÄÅç±ÖÕÕ9ÖµîËâ±ÃµÕïÖÕΩπÖ∞µ—›•π≠±îà(ÄÄÄÄÄÅÙ∞(ÄÄÄÄÄÅ…ïÂïÃËÅÏ(ÄÄÄÄÄÄÄÅ•—ïµÃÈlã¬~FDà∞ãä∂@à∞ã¬~FDà∞ãä∂@ât∞(ÄÄÄÄÄÄÄÅç±ÖÕÕ9ÖµîËâ±ÃµÕïÖÕΩπÖ∞µô±ΩÖ–à(ÄÄÄÄÄÅÙ∞(ÄÄÄÄÄÅŸÖ±ïπ—•πïÃËÅÏ(ÄÄÄÄÄÄÄÅ•—ïµÃÈlã¬~J\à∞ã¬~JTà∞ã¬~J\à∞ã¬~JTà∞ã¬~J\ât∞(ÄÄÄÄÄÄÄÅç±ÖÕÕ9ÖµîËâ±ÃµÕïÖÕΩπÖ∞µô±ΩÖ–à(ÄÄÄÄÄÅÙ∞(ÄÄÄÄÄÅ¡Ö—…•ÑËÅÏ(ÄÄÄÄÄÄÄÅ•—ïµÃÈlã¬~õ¬~‹à∞ã¬~õ¬~‹à∞ãäbæ‚<à∞ã¬~õ¬~‹ât∞(ÄÄÄÄÄÄÄÅç±ÖÕÕ9ÖµîËâ±ÃµÕïÖÕΩπÖ∞µ›ÖŸîà(ÄÄÄÄÄÅÙ∞(ÄÄÄÄÄÅôÖ—°ï»ËÅÏ(ÄÄÄÄÄÄÄÅ•—ïµÃÈlã¬~FPà∞ã¬~Jdà∞ã¬~FPà∞ã¬~Jdât∞(ÄÄÄÄÄÄÄÅç±ÖÕÕ9ÖµîËâ±ÃµÕïÖÕΩπÖ∞µô±ΩÖ–à(ÄÄÄÄÄÅÙ∞(ÄÄÄÄÄÅç°•±ë°ΩΩêËÅÏ(ÄÄÄÄÄÄÄÅ•—ïµÃÈlã¬~û‡à∞ã¬~™ à∞ã¬~: à∞ã¬~û‡à∞ã¬~: ât∞(ÄÄÄÄÄÄÄÅç±ÖÕÕ9ÖµîËâ±ÃµÕïÖÕΩπÖ∞µô±ΩÖ–à(ÄÄÄÄÄÅÙ∞(ÄÄÄÄÄÅµΩ—°ï»ËÅÏ(ÄÄÄÄÄÄÄÅ•—ïµÃÈlã¬~2‰à∞ã¬~2‹à∞ã¬~2‰à∞ã¬~2‹à∞ã¬~2‰ât∞(ÄÄÄÄÄÄÄÅç±ÖÕÕ9ÖµîËâ±ÃµÕïÖÕΩπÖ∞µôÖ±∞à(ÄÄÄÄÄÅÙ∞(ÄÄÄÄÄÅïÖÕ—ï»ËÅÏ(ÄÄÄÄÄÄÄÅ•—ïµÃÈlã¬~ñhà∞ã¬~B¿à∞ã¬~ñhà∞ã¬~2‹à∞ã¬~ñhât∞(ÄÄÄÄÄÄÄÅç±ÖÕÕ9ÖµîËâ±ÃµÕïÖÕΩπÖ∞µâΩ’πçîà(ÄÄÄÄÄÅÙ(ÄÄÄÅÙÏ((ÄÄÄÅçΩπÕ–ÅçΩπô•úÄÙÅÖµâ•ïπ—5Ö¡m≠ïÂtÏ((ÄÄÄÅ•òÄ°çΩπô•ú§ÅÏ(ÄÄÄÄÄÅçΩπÕ–ÅÖµâ•ïπ–ÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âë•ÿà§Ï(ÄÄÄÄÄÅÖµâ•ïπ–π•êÄÙÄâ±ÕMïÖÕΩπÖ±µâ•ïπ–àÏ(ÄÄÄÄÄÅÖµâ•ïπ–πÕï———…•â’—î†âÖ…•Ñµ°•ëëï∏à∞Äâ—…’îà§Ï((ÄÄÄÄÄÅÖµâ•ïπ–π•ππï…!Q50ÄÙÅçΩπô•úπ•—ïµÃπµÖ¿†°•—ï¥∞Å§§ÄÙ¯ÅÄ(ÄÄÄÄÄÄÄÄÒÕ¡Ö∏(ÄÄÄÄÄÄÄÄÄÅç±ÖÕÃÙâ±ÃµÕïÖÕΩπÖ∞µÖµâ•ïπ–µ•—ï¥ÄëÌçΩπô•úπç±ÖÕÕ9ÖµïÙà(ÄÄÄÄÄÄÄÄÄÅÕ—Â±îÙà(ÄÄÄÄÄÄÄÄÄÄÄÅ±ïô–ËëÏÿÄ¨Ä°§Ä®Äƒ‹•ÙîÏ(ÄÄÄÄÄÄÄÄÄÄÄÅÖπ•µÖ—•Ω∏µë’…Ö—•Ω∏ËëÏ‡Ä¨Ä°§Ä®Äƒ∏Ã•ıÃÏ(ÄÄÄÄÄÄÄÄÄÄÄÅÖπ•µÖ—•Ω∏µëï±Ö‰Ë¥ëÌ§Ä®Äƒ∏›ıÃÏ(ÄÄÄÄÄÄÄÄÄÄà(ÄÄÄÄÄÄÄÄ¯ëÌ•—ïµÙΩÕ¡Ö∏¯(ÄÄÄÄÄÅÄ§π©Ω•∏†àà§Ï((ÄÄÄÄÄÅëΩç’µïπ–πâΩë‰πÖ¡¡ïπë°•±ê°Öµâ•ïπ–§Ï(ÄÄÄÅÙ(ÄÅÙ((ÄÅÕÂπçMïÖÕΩπÖ±ëµ•πΩπ—…Ω±Ã†§Ï(ÄÅ›•πëΩ‹π}}±ÕMïÖÕΩπÖ±¡¡±Â•πúÄÙÅôÖ±ÕîÏ)Ù()ÖÕÂπåÅô’πç—•Ω∏ÅÕï—MïÖÕΩπÖ±ëµ•πA…ïŸ•ï‹°ŸÖ±’î§ÅÏ(ÄÅ•òÄ†Öç’……ïπ—A…Ωô•±î¸π•Õ}Öëµ•∏§Å…ï—’…∏Ï(ÄÅçΩπÕ–Åπï·–ÄÙÄÖŸÖ±’îÄ¸ÄâÖ’—ºàÄËÅŸÖ±’îÏ(ÄÅçΩπÕ–ÅÏÅëÖ—Ñ∞Åï……Ω»ÅÙÄÙÅÖ›Ö•–ÅÕàπ…¡å†âÖëµ•π}Õï—}ù±ΩâÖ±}ÕïÖÕΩπÖ±}—°ïµîà∞ÅÏÅ¡}—°ïµîÈπï·–ÅÙ§Ï(ÄÅ•òÄ°ï……Ω»ÅÒÄÖëÖ—Ñ¸πΩ¨§ÅÏ(ÄÄÄÅÕ°Ω›QΩÖÕ–†â9ºÅÕîÅ¡’ëºÅ¡’â±•çÖ»Å±ÑÅÖ¡Ö…•ïπç•Ñà§Ï(ÄÄÄÅÕÂπçMïÖÕΩπÖ±ëµ•πΩπ—…Ω±Ã†§Ï(ÄÄÄÅ…ï—’…∏Ï(ÄÅÙ(ÄÅ›•πëΩ‹π}}±Õ±ΩâÖ±MïÖÕΩπÖ±Q°ïµîÄÙÅπï·–Ï(ÄÅ±ΩçÖ±M—Ω…Öùîπ…ïµΩŸï%—ï¥°1M}MM=91}=YII%}-d§Ï(ÄÅÖ¡¡±ÂMïÖÕΩπÖ±Q°ïµî†§Ï(ÄÅÕ°Ω›QΩÖÕ–†(ÄÄÄÅπï·–ÄÙÙÙÄâÖ’—ºà(ÄÄÄÄÄÄ¸Äã¬~:†Å¡Ö…•ïπç•ÑÅù±ΩâÖ∞Åï∏Å’—Ω∑Ö—•çºà(ÄÄÄÄÄÄËÅÉ¬~:†ÅA’â±•çÖëºÅ¡Ö…ÑÅ—ΩëΩÃËÄëÌ1M}MM=91}Q!5Mmπï·—t¸π±Öâï∞ÅÒÅπï·—ıÄ(ÄÄ§Ï)Ù()ô’πç—•Ω∏ÅÕÂπçMïÖÕΩπÖ±ëµ•πΩπ—…Ω±Ã†§ÅÏ(ÄÅçΩπÕ–ÅÕï±ïç–ÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕïÖÕΩπÖ±Q°ïµïëµ•πMï±ïç–à§Ï(ÄÅçΩπÕ–ÅÕ—Ö—’ÃÄÙÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†âÕïÖÕΩπÖ±ëµ•πM—Ö—’Ãà§Ï(ÄÅ•òÄ†ÖÕï±ïç–ÄòòÄÖÕ—Ö—’Ã§Å…ï—’…∏Ï((ÄÅçΩπÕ–ÅôΩ…çïêÄÙÅM—…•πú°›•πëΩ‹π}}±Õ±ΩâÖ±MïÖÕΩπÖ±Q°ïµîÅÒÄâÖ’—ºà§Ï((ÄÅ•òÄ°Õï±ïç–§ÅÏ(ÄÄÄÅÕï±ïç–πŸÖ±’îÄÙÄ°ôΩ…çïêÄÙÙÙÄâÖ’—ºàÅÒÅ1M}MM=91}Q!5MmôΩ…çïët§Ä¸ÅôΩ…çïêÄËÄâÖ’—ºàÏ(ÄÅÙ((ÄÅ•òÄ°Õ—Ö—’Ã§ÅÏ(ÄÄÄÅçΩπÕ–ÅÖ’—ΩµÖ—•åÄÙÅùï—’—ΩµÖ—•çMïÖÕΩπÖ±Q°ïµî†§Ï(ÄÄÄÅçΩπÕ–ÅÖç—•ŸîÄÙÅùï—MïÖÕΩπÖ±Q°ïµï-ï‰†§Ï(ÄÄÄÅçΩπÕ–ÅÖç—•Ÿï1Öâï∞ÄÙÅ1M}MM=91}Q!5MmÖç—•Ÿït¸π±Öâï∞ÅÒÅÖç—•ŸîÏ(ÄÄÄÅçΩπÕ–ÅÖ’—Ω1Öâï∞ÄÙÅ1M}MM=91}Q!5MmÖ’—ΩµÖ—•çt¸π±Öâï∞ÅÒÅÖ’—ΩµÖ—•åÏ((ÄÄÄÅÕ—Ö—’Ãπ—ï·—Ωπ—ïπ–ÄÙÅôΩ…çïêÄÙÙÙÄâÖ’—ºà(ÄÄÄÄÄÄ¸ÅÅA’â±•çÖëºËÅ’—Ω∑Ö—•çºÉ
‹Å°Ω…ÑËÄëÌÖç—•Ÿï1Öâï±ıÄ(ÄÄÄÄÄÄËÅÅA’â±•çÖëºÅ¡Ö…ÑÅ—ΩëΩÃËÄëÌÖç—•Ÿï1Öâï±ÙÉ
‹Å∏ÅÖ’—Ω∑Ö—•çºÅÕïÀµÑËÄëÌÖ’—Ω1Öâï±ıÄÏ(ÄÅÙ)Ù((ººÅ¡±•çÖµΩÃÅï∞Å—ïµÑÅÖ∞ÅçÖ…ùÖ»∏(ººÅ9ºÅ’ÕÖµΩÃÅ5’—Ö—•Ωπ=âÕï…Ÿï»Åù±ΩâÖ∞ËÅï∞Åëµ•∏Å…ïçΩπÕ—…’ÂîÅµ’ç°ºÅ=4Å‰ÅïÕº(ººÅ¡ΩìµÑÅùïπï…Ö»Å’∏Åç•ç±ºÅëîÅ…ïÖ¡±•çÖçßÕ∏Å≈’îÅô…ïπÖâÑÅ±ÑÅçÖ…ùÑÅëï∞Å¡Öπï∞∏)ëΩç’µïπ–πÖëëŸïπ—1•Õ—ïπï»†â=5Ωπ—ïπ—1ΩÖëïêà∞Ä†§ÄÙ¯ÅÏ(ÄÅÕï—Q•µïΩ’–°±ΩÖë±ΩâÖ±MïÖÕΩπÖ±Q°ïµî∞Ä‡¿§Ï)Ù§Ï((ººÅM§Åï∞ÅÖ¡¿ÅÂÑÅïÕ—ÖâÑÅçÖ…ùÖëºÅÖπ—ïÃÅëîÅ…ïù•Õ—…Ö»Å=5Ωπ—ïπ—1ΩÖëïê∏)•òÄ°ëΩç’µïπ–π…ïÖëÂM—Ö—îÄÑÙÙÄâ±ΩÖë•πúà§ÅÏ(ÄÅÕï—Q•µïΩ’–°Ö¡¡±ÂMïÖÕΩπÖ±Q°ïµî∞Ä‡¿§Ï)Ù((ººÄÿ∏ƒ∏≈ÿÉ
‹ÅM=%0Å1I%Qd)ô’πç—•Ω∏ÅïπÕ’…ïMΩç•Ö±±Ö…•—‰ÿƒ≈M—Â±ïÃ†§ÅÏ(ÄÅ•òÄ°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÕMΩç•Ö±±Ö…•—‰ÿƒ≈M—Â±ïÃà§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÕ—Â±îÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âÕ—Â±îà§Ï(ÄÅÕ—Â±îπ•êÄÙÄâ±ÕMΩç•Ö±±Ö…•—‰ÿƒ≈M—Â±ïÃàÏ(ÄÅÕ—Â±îπ—ï·—Ωπ—ïπ–ÄÙÅÄ(ÄÄÄÄπôïïêµÖç—•Ω∏µâ—∏π±Ãµ±•≠îµÖç—•Ω∏¥ÿƒƒ∞(ÄÄÄÄπôïïêµÖç—•Ω∏µâ—∏π±ÃµçΩµµïπ–µÖç—•Ω∏¥ÿƒƒÅÏ(ÄÄÄÄÄÅ›•ë—†Ë‘·¡‡ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅµ•∏µ°ï•ù°–Ë‘—¡‡Ï(ÄÄÄÄÄÅ°ï•ù°–ÈÖ’—ºÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅ¡Öëë•πúË›¡‡Ä—¡‡ÄŸ¡‡ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃËƒ·¡‡ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅë•Õ¡±Ö‰Èô±ï‡ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏Ï(ÄÄÄÄÄÅÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ï(ÄÄÄÄÄÅ©’Õ—•ô‰µçΩπ—ïπ–Èçïπ—ï»Ï(ÄÄÄÄÄÅùÖ¿Ë…¡‡Ï(ÄÄÄÅÙ(ÄÄÄÄπôïïêµÖç—•Ω∏µâ—∏π±Ãµ±•≠îµÖç—•Ω∏¥ÿƒƒÄ¯ÅÕ¡Ö∏∞(ÄÄÄÄπôïïêµÖç—•Ω∏µâ—∏π±ÃµçΩµµïπ–µÖç—•Ω∏¥ÿƒƒÄ¯ÅÕ¡Ö∏ÅÏ(ÄÄÄÄÄÅôΩπ–µÕ•ÈîË»’¡‡Ï(ÄÄÄÄÄÅ±•πîµ°ï•ù°–ËƒÏ(ÄÄÄÄÄÅôΩπ–µÕ—Â±îÈπΩ…µÖ∞Ï(ÄÄÄÅÙ(ÄÄÄÄπôïïêµÖç—•Ω∏µâ—∏π±Ãµ±•≠îµÖç—•Ω∏¥ÿƒƒÄ¯Å§∞(ÄÄÄÄπôïïêµÖç—•Ω∏µâ—∏π±ÃµçΩµµïπ–µÖç—•Ω∏¥ÿƒƒÄ¯Å§ÅÏ(ÄÄÄÄÄÅôΩπ–Ë‰¿¿Ä›¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÏ(ÄÄÄÄÄÅ±ï——ï»µÕ¡Öç•πúË∏¿‘’ï¥Ï(ÄÄÄÄÄÅçΩ±Ω»È…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏‹»§Ï(ÄÄÄÅÙ(ÄÄÄÄπôïïêµÖç—•Ω∏µâ—∏π±Ãµ±•≠îµÖç—•Ω∏¥ÿƒƒπ±•≠ïêÅÏ(ÄÄÄÄÄÅçΩ±Ω»ËçôôòÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘‘∞‹‡∞ƒƒƒ∞∏‡‡§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú∞çôò–ƒŸå∞å‡»≈à–»§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä¿ÄÕ¡‡Å…ùâÑ†»‘‘∞ÿ‘∞ƒ¿‡∞∏ƒÿ§∞¿Äƒ¡¡‡Ä»·¡‡Å…ùâÑ†»‘‘∞ÿ‘∞ƒ¿‡∞∏Ã‡§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ(ÄÄÄÄπôïïêµÖç—•Ω∏µâ—∏π±Ãµ±•≠îµÖç—•Ω∏¥ÿƒƒπ±•≠ïêÄ¯ÅÕ¡Ö∏ÅÏ(ÄÄÄÄÄÅô•±—ï»Èë…Ω¿µÕ°ÖëΩ‹†¿Ä¿Ä·¡‡Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏ÿ»§§Ï(ÄÄÄÅÙ(ÄÄÄÄπôïïêµÖç—•Ω∏µâ—∏π±Ãµ±•≠îµÖç—•Ω∏¥ÿƒƒπ±•≠ïêÄ¯Å§ÅÏÅçΩ±Ω»ËçôôòÏÅÙ(ÄÄÄÄπôïïêµÖç—•Ω∏µâ—∏π±ÃµçΩµµïπ–µÖç—•Ω∏¥ÿƒƒÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†‹»∞»»ƒ∞»–»∞∏Ã‡§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†»¿∞‰»∞ƒƒ»∞∏‡»§±…ùâÑ†‘∞Ãƒ∞–Ã∞∏‡‡§§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ(ÄÄÄÄπ±ÃµçΩµµïπ—ÃµΩŸï…±Ö‰¥ÿƒƒÅÏ(ÄÄÄÄÄÅ¡ΩÕ•—•Ω∏Èô•·ïêÌ•πÕï–Ë¿ÌËµ•πëï‡ËÃ¿¿Ìë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈô±ï‡µïπêÌ©’Õ—•ô‰µçΩπ—ïπ–Èçïπ—ï»Ï(ÄÄÄÄÄÅ¡Öëë•πúµ—Ω¿Ë–¡¡‡ÌâÖç≠ù…Ω’πêÈ…ùâÑ†¿∞¿∞¿∞∏‹ÿ§ÌâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†›¡‡§Ï(ÄÄÄÅÙ(ÄÄÄÄπ±ÃµçΩµµïπ—Ãµ¡Öπï∞¥ÿƒƒÅÏ(ÄÄÄÄÄÅ›•ë—†Èµ•∏†ƒ¿¿î∞‘»¡¡‡§ÌµÖ‡µ°ï•ù°–Ë‹·Ÿ†ÌµÖ‡µ°ï•ù°–Ë‹·ëŸ†Ì¡Öëë•πúË»¡¡‡Ï(ÄÄÄÄÄÅ¡Öëë•πúµâΩ——Ω¥ÈµÖ‡†»¡¡‡±ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µâΩ——Ω¥§§Ìë•Õ¡±Ö‰Èô±ï‡Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÌΩŸï…ô±Ω‹È°•ëëï∏Ï(ÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‹»∞»»ƒ∞»–»∞∏»–§ÌâΩ…ëï»µâΩ——Ω¥Ë¿ÌâΩ…ëï»µ…Öë•’ÃË»Ÿ¡‡Ä»Ÿ¡‡Ä¿Ä¿Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ‡¡ëïú±…ùâÑ†ƒ‡∞»‹∞Ã–∞∏‰‡§±…ùâÑ†‹∞ƒ»∞ƒ‹∞∏‰‰§§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä¥»—¡‡Ä‹¡¡‡Å…ùâÑ†¿∞¿∞¿∞∏–‡§∞¿Ä¿ÄÃ…¡‡Å…ùâÑ†‹»∞»»ƒ∞»–»∞∏¿‹§Ï(ÄÄÄÅÙ(ÄÄÄÄπ±ÃµçΩµµïπ–µçΩµ¡ΩÕî¥ÿƒƒÅÏÅë•Õ¡±Ö‰Èô±ï‡ÌùÖ¿ËÂ¡‡Ìô±ï‡µÕ°…•π¨Ë¿ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÏÅÙ(ÄÄÄÄπ±ÃµçΩµµïπ–µçΩµ¡ΩÕî¥ÿƒƒÅ•π¡’–ÅÏ(ÄÄÄÄÄÅô±ï‡ËƒÌµ•∏µ›•ë—†Ë¿Ì¡Öëë•πúËƒÕ¡‡Äƒ—¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‹»∞»»ƒ∞»–»∞∏»»§ÌâΩ…ëï»µ…Öë•’ÃËƒ—¡‡Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†»∞‰∞ƒÃ∞∏‹–§ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÌôΩπ–µôÖµ•±‰È•π°ï…•–ÌΩ’—±•πîÈπΩπîÏ(ÄÄÄÅÙ(ÄÄÄÄπ±ÃµçΩµµïπ–µçΩµ¡ΩÕî¥ÿƒƒÅ•π¡’–ÈôΩç’ÃÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†‹»∞»»ƒ∞»–»∞∏‹»§ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä¿ÄÕ¡‡Å…ùâÑ†‹»∞»»ƒ∞»–»∞∏¿‰§Ï(ÄÄÄÅÙ(ÄÄÄÄπ±Ãµ°•ëëï∏µ’πëº¥ÿƒƒÅÏ(ÄÄÄÄÄÅ¡ΩÕ•—•Ω∏Èô•·ïêÌ±ïô–Ë‘¿îÌâΩ——Ω¥ÈµÖ‡†»…¡‡±ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µâΩ——Ω¥§§ÌËµ•πëï‡Ë‡¿¿Ï(ÄÄÄÄÄÅ›•ë—†Èµ•∏°çÖ±å†ƒ¿¿îÄ¥Ä»·¡‡§∞––¡¡‡§Ì—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ï`†¥‘¿î§Ìë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌùÖ¿Ëƒ…¡‡Ï(ÄÄÄÄÄÅ¡Öëë•πúËƒ…¡‡ÄƒÕ¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†ƒ¿Ã∞»Ã»∞»–‰∞∏Ã‘§ÌâΩ…ëï»µ…Öë•’ÃËƒŸ¡‡Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†‘∞ƒ‘∞»ƒ∞∏‰ÿ§ÌâΩ‡µÕ°ÖëΩ‹Ë¿ÄƒŸ¡‡Ä–’¡‡Å…ùâÑ†¿∞¿∞¿∞∏–‡§ÌâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†ƒ—¡‡§Ï(ÄÄÄÄÄÅÖπ•µÖ—•Ω∏È±ÕUπëΩ%∏ÿƒƒÄ∏»…ÃÅïÖÕîÅâΩ—†Ï(ÄÄÄÅÙ(ÄÄÄÄπ±Ãµ°•ëëï∏µ’πëº¥ÿƒƒÅÕ¡Ö∏ÅÏÅµ•∏µ›•ë—†Ë¿Ìô±ï‡ËƒÌë•Õ¡±Ö‰Èô±ï‡Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÌùÖ¿Ë…¡‡ÏÅÙ(ÄÄÄÄπ±Ãµ°•ëëï∏µ’πëº¥ÿƒƒÅÕ—…ΩπúÅÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÌôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅÙ(ÄÄÄÄπ±Ãµ°•ëëï∏µ’πëº¥ÿƒƒÅÕµÖ±∞ÅÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîËƒ¡¡‡ÏÅÙ(ÄÄÄÄπ±Ãµ°•ëëï∏µ’πëº¥ÿƒƒÅâ’——Ω∏ÅÏ(ÄÄÄÄÄÅô±ï‡ÈπΩπîÌ¡Öëë•πúËÂ¡‡Äƒ…¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†ƒ¿Ã∞»Ã»∞»–‰∞∏–‡§ÌâΩ…ëï»µ…Öë•’ÃËƒ≈¡‡Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†ƒ¿Ã∞»Ã»∞»–‰∞∏ƒ¿§ÌçΩ±Ω»Ëåÿ›î·ò‰ÌôΩπ–Ë‰¿¿Äƒ≈¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌç’…ÕΩ»È¡Ω•π—ï»Ï(ÄÄÄÅÙ(ÄÄÄÄπ±ÃµÖëµ•∏µ¡…Ωô•±îµëï±ï—î¥ÿƒƒÅÏ(ÄÄÄÄÄÅ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÌ—Ω¿Ë·¡‡Ì…•ù°–Ë·¡‡ÌËµ•πëï‡Ëƒ»Ì›•ë—†ËÃ·¡‡Ì°ï•ù°–ËÃ·¡‡ÌâΩ…ëï»µ…Öë•’ÃËƒ…¡‡Ï(ÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»‘‘∞‰¿∞ƒƒ¿∞∏ÿ»§ÌâÖç≠ù…Ω’πêÈ…ùâÑ†‡¿∞‡∞»»∞∏‰¿§ÌçΩ±Ω»ËçôôòÌôΩπ–µÕ•ÈîËƒŸ¡‡Ìç’…ÕΩ»È¡Ω•π—ï»Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä·¡‡Ä»…¡‡Å…ùâÑ†¿∞¿∞¿∞∏Ã–§Ï(ÄÄÄÅÙ(ÄÄÄÅ≠ïÂô…ÖµïÃÅ±ÕUπëΩ%∏ÿƒƒÅÏÅô…ΩµÌΩ¡Öç•—‰Ë¿Ì—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—î†¥‘¿î∞ƒ…¡‡•ÙÅ—ΩÌΩ¡Öç•—‰ËƒÌ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—î†¥‘¿î∞¿•ÙÅÙ(ÄÄÄÄπ±Ãµ±ïùÖç‰ÄπôïïêµÖç—•Ω∏µâ—∏π±Ãµ±•≠îµÖç—•Ω∏¥ÿƒƒ∞(ÄÄÄÄπ±Ãµ±ïùÖç‰ÄπôïïêµÖç—•Ω∏µâ—∏π±ÃµçΩµµïπ–µÖç—•Ω∏¥ÿƒƒÅÏÅâΩ‡µÕ°ÖëΩ‹ÈπΩπîÄÖ•µ¡Ω…—Öπ–ÌâÖç≠ë…Ω¿µô•±—ï»ÈπΩπîÄÖ•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅµïë•Ñ°µÖ‡µ›•ë—†Ë‹¿¡¡‡§ÅÏ(ÄÄÄÄÄÄπôïïêµÖç—•Ω∏µâ—∏π±Ãµ±•≠îµÖç—•Ω∏¥ÿƒƒ∞πôïïêµÖç—•Ω∏µâ—∏π±ÃµçΩµµïπ–µÖç—•Ω∏¥ÿƒƒÅÏÅ›•ë—†Ë‘—¡‡ÄÖ•µ¡Ω…—Öπ–Ìµ•∏µ°ï•ù°–Ë‘≈¡‡ÏÅÙ(ÄÄÄÄÄÄπ±ÃµçΩµµïπ—Ãµ¡Öπï∞¥ÿƒƒÅÏÅµÖ‡µ°ï•ù°–Ë‡…ëŸ†Ì¡Öëë•πúËƒ›¡‡Äƒ’¡‡ÅµÖ‡†ƒŸ¡‡±ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µâΩ——Ω¥§§ÏÅÙ(ÄÄÄÅÙ(ÄÅÄÏ(ÄÅëΩç’µïπ–π°ïÖêπÖ¡¡ïπë°•±ê°Õ—Â±î§Ï)Ù()ëΩç’µïπ–πÖëëŸïπ—1•Õ—ïπï»†âŸ•Õ•â•±•—Âç°Öπùîà∞Ä†§ÄÙ¯ÅÏ(ÄÅ•òÄ†ÖëΩç’µïπ–π°•ëëï∏ÄòòÅç’……ïπ—UÕï»¸π•ê§ÅÏ(ÄÄÄÅ¡Ω±±9Ω—•ô•çÖ—•ΩπÕÖ±±âÖç¨†§Ï(ÄÄÄÅ•òÄ†ÖπΩ—•ôIïÖ±—•µï°Öππï∞§ÅÕ’âÕç…•âïQΩ9Ω—•ô•çÖ—•ΩπÃ†§Ï(ÄÅÙ)Ù§Ï()ïπÕ’…ïMΩç•Ö±±Ö…•—‰ÿƒ≈M—Â±ïÃ†§Ï()ô’πç—•Ω∏ÅïπÕ’…ï1•ŸïMç…Ω±∞›I’π—•µïM—Â±ïÃ†§ÅÏ(ÄÅ•òÄ†Ö•Õ1•ŸïMç…Ω±∞›¡¿†§ÅÒÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±Ã›I’π—•µïM—Â±ïÃà§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÕ—Â±îÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âÕ—Â±îà§Ï(ÄÅÕ—Â±îπ•êÄÙÄâ±Ã›I’π—•µïM—Â±ïÃàÏ(ÄÅÕ—Â±îπ—ï·—Ωπ—ïπ–ÄÙÅÄ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅÏ(ÄÄÄÄÄÄ¥µ±Ã‹µâ±’îËå‘·ê·ôòÏ¥µ±Ã‹µŸ•Ω±ï–Ëå·Ñ’çôòÏ¥µ±Ã‹µùΩ±êËçò—å‰’êÏ(ÄÄÄÄÄÄ¥µ•π¨Ëå¿‘¿‹ƒƒÏ¥µ¡Öπï∞Ëå¡àƒ»»ƒÏ¥µ¡Öπï∞¥»Ëåƒƒ≈êÃ»Ï¥µùΩ±êËå‹—î—ôòÏ¥µùΩ±êµë•¥Ëå–ÕàÂëåÏ(ÄÄÄÄÄÄ¥µù…ïï∏Ëå›àÿ…ôòÏ¥µ—ï·–Ëçò›òÂôòÏ¥µ—ï·–µë•¥ËçÖïââêƒÏ¥µâΩ…ëï»Ëå»ÃÃÿ‘ÃÏ(ÄÄÄÄÄÅçΩ±Ω»µÕç°ïµîÈëÖ…¨Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅâΩë‰ÅÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Äƒ»îÄ¥ƒ¿î±…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏ƒ¿§±—…ÖπÕ¡Ö…ïπ–ÄÃ¿î§±…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Äƒ¿‡îÄÃ‘î±…ùâÑ†ƒÃ‡∞‰»∞»‘‘∞∏ƒ¿§±—…ÖπÕ¡Ö…ïπ–ÄÃƒî§±ŸÖ»†¥µ•π¨§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅπÖÿÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏ƒÿ§ÌâÖç≠ù…Ω’πêÈ…ùâÑ†‘∞‹∞ƒ‹∞∏‡‡§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ¡¡‡ÄÃ—¡‡Å…ùâÑ†¿∞¿∞¿∞∏»»§ÌâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†ƒŸ¡‡§ÅÕÖ—’…Ö—î†ƒÃ¿î§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄππÖÿµâ…ÖπêÅÏÅùÖ¿Ë¿ÌôΩπ–µÕ•ÈîË»¡¡‡ÌôΩπ–µ›ï•ù°–Ë‡‘¿Ì±ï——ï»µÕ¡Öç•πúË¥∏¿–’ï¥ÌçΩ±Ω»Ëçò›òÂôòÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄππÖÿµâ…Öπêµ±•ŸîÅÏÅçΩ±Ω»Ëçò›òÂôòÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄππÖÿµâ…ÖπêµÕç…Ω±∞ÅÏÅçΩ±Ω»ÈŸÖ»†¥µ±Ã‹µâ±’î§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄππÖÿµâ…ÖπêÅàÅÏ(ÄÄÄÄÄÅçΩ±Ω»Ëåƒ‹ƒ¿¿ÃÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú∞çôôò…Ñ‡∞çî›Ñ‰…î§ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘‘∞»Ã‘∞ƒ‘‡∞∏ÿ–§Ï(ÄÄÄÄÄÅô•±—ï»Èë…Ω¿µÕ°ÖëΩ‹†¿Ä¿ÄÂ¡‡Å…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏Ã‡§§ÌâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏‘§∞¿Ä’¡‡Äƒ·¡‡Å…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ƒ‹§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπôΩ…¥µçÖ…ê±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπŸ•ëïºµçÖ…ê±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπÖ’—†µâΩ‡ÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏ƒ‘§ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†ƒ‘∞»‹∞–‹∞∏‰–§±…ùâÑ†‡∞ƒ–∞»‡∞∏‰ÿ§§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿»‘§∞¿Äƒ—¡‡Ä–¡¡‡Å…ùâÑ†¿∞¿∞¿∞∏ƒÿ§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅ•π¡’–±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅ—ï·—Ö…ïÑ±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅÕï±ïç–ÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†ƒƒ‡∞ƒ‘ƒ∞ƒ‰–∞∏Ã»§ÌâÖç≠ù…Ω’πêËå¿‡¡î≈àÌçΩ±Ω»Ëçò›òÂôòÏ(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅ•π¡’–ÈôΩç’Ã±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅ—ï·—Ö…ïÑÈôΩç’Ã±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅÕï±ïç–ÈôΩç’ÃÅÏ(ÄÄÄÄÄÅΩ’—±•πîËÕ¡‡ÅÕΩ±•êÅ…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏ƒÃ§ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏‹§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅâ’——Ω∏ÈôΩç’ÃµŸ•Õ•â±î±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅÑÈôΩç’ÃµŸ•Õ•â±îÅÏ(ÄÄÄÄÄÅΩ’—±•πîËÕ¡‡ÅÕΩ±•êÅ…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏‘‘§Ö•µ¡Ω…—Öπ–ÌΩ’—±•πîµΩôôÕï–ËÕ¡‡Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπâ—∏ÅÏÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÃ’ëïú∞å–Õçâïê∞å‹ÿ‘·ïî§ÌçΩ±Ω»ËçôôòÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†ƒ»ÿ∞»»ÿ∞»‘‘∞∏Ã‘§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπâ—∏µΩ’—±•πîÅÏÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏»‡§ÌçΩ±Ω»Ëçëôò·ôòÌâÖç≠ù…Ω’πêÈ…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏¿Ã‘§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ¡Öùîµ—•—±îÅÏÅçΩ±Ω»ËçòÂôâôòÌ—ï·–µÕ°ÖëΩ‹Ë¿Ä¿Ä»Ÿ¡‡Å…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏¿‡§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄππÖÿµ±•π≠ÃÅâ’——Ω∏πÖç—•ŸîÅÏÅçΩ±Ω»ËçëôôÖôòÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÃ’ëïú±…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏ƒ»§±…ùâÑ†ƒÃ‡∞‰»∞»‘‘∞∏ƒ¿§§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄππÖÿµ±•π≠ÃÅâ’——Ω∏πÖç—•ŸîËÈÖô—ï»ÅÏÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†‰¡ëïú±ŸÖ»†¥µ±Ã‹µâ±’î§±ŸÖ»†¥µ±Ã‹µŸ•Ω±ï–§±ŸÖ»†¥µ±Ã‹µùΩ±ê§§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµÖççïÕÃµïŸΩ±’—•Ω∏ÅÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä»¿îÄƒ¿î±…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏ƒÃ§±—…ÖπÕ¡Ö…ïπ–ÄÃ–î§±…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‡‘îÄ‡¿î±…ùâÑ†ƒÃ‡∞‰»∞»‘‘∞∏ƒ‹§±—…ÖπÕ¡Ö…ïπ–ÄÃ‡î§∞å¿‘¿‹ƒƒÏ(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµÖççïÕÃµ±ΩùºÅÏ(ÄÄÄÄÄÅçΩ±Ω»ÈŸÖ»†¥µ±Ã‹µùΩ±ê§ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏–‡§Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏ƒ‘§±…ùâÑ†ƒÃ‡∞‰»∞»‘‘∞∏ƒÿ§§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä»·¡‡Å…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏ƒ–§Ï(ÄÄÄÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµÕï——•πùÃµçÖ…ê∞π±Ã‹µ…’π—•µîµÕ—Ö—’ÃµçÖ…êÅÏ(ÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏»‡§ÌâΩ…ëï»µ…Öë•’ÃËƒŸ¡‡Ì¡Öëë•πúËƒ—¡‡Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†»¿∞ÿ–∞‰»∞∏ƒ–§±…ùâÑ†ÿ‡∞Ã–∞ƒƒÿ∞∏ƒÃ§§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿»‘§Ï(ÄÄÄÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµÕï——•πùÃµ°ïÖêÅÏÅë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌùÖ¿Ëƒ≈¡‡ÌµÖ…ù•∏µâΩ——Ω¥ËÂ¡‡ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµÕï——•πùÃµ°ïÖêÄ¯ÅÕ¡Ö∏ÅÏ(ÄÄÄÄÄÅ›•ë—†Ë–…¡‡Ì°ï•ù°–Ë–…¡‡Ìë•Õ¡±Ö‰Èù…•êÌ¡±Öçîµ•—ïµÃÈçïπ—ï»ÌâΩ…ëï»µ…Öë•’ÃËƒ—¡‡Ï(ÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏–‡§ÌçΩ±Ω»ÈŸÖ»†¥µ±Ã‹µùΩ±ê§ÌôΩπ–Ë‰‘¿Ä»—¡‡ÄùM¡ÖçîÅ…Ω—ïÕ¨ú±ÕÖπÃµÕï…•òÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏¿‹§ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä»—¡‡Å…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ƒ¿§Ï(ÄÄÄÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµÕï——•πùÃµ°ïÖêÅë•ÿÅÏÅµ•∏µ›•ë—†Ë¿Ìë•Õ¡±Ö‰Èô±ï‡Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÌùÖ¿Ë…¡‡ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµÕï——•πùÃµ°ïÖêÅÕ—…ΩπúÅÏÅçΩ±Ω»Ëçò·ôâôòÌôΩπ–µÕ•ÈîËƒÕ¡‡ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµÕï——•πùÃµ°ïÖêÅÕµÖ±∞ÅÏÅçΩ±Ω»Ëå·ïÑÂå‹ÌôΩπ–µÕ•ÈîËÂ¡‡ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµÕï——•πùÃµçÖ…êÅ¿∞π±Ã‹µ…’π—•µîµÕ—Ö—’ÃµçÖ…êÅ¿ÅÏÅµÖ…ù•∏Ë¿Ä¿Äƒ≈¡‡ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîËƒ¡¡‡Ì±•πîµ°ï•ù°–Ëƒ∏‘ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµÕ—Ö—’ÃµçÖ…êÅÏÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†ƒÃ‡∞‰»∞»‘‘∞∏Ã–§ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµÕ—Ö—’Ãµ°ïÖêÅÏÅë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌùÖ¿Ë·¡‡ÌµÖ…ù•∏µâΩ——Ω¥ËŸ¡‡ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµÕ—Ö—’Ãµ°ïÖêÅÕ¡Ö∏ÅÏÅ›•ë—†Ë·¡‡Ì°ï•ù°–Ë·¡‡ÌâΩ…ëï»µ…Öë•’ÃË‘¿îÌâÖç≠ù…Ω’πêËå‘·ê·ôòÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Äƒ—¡‡Äå‘·ê·ôòÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµÕ—Ö—’Ãµ°ïÖêÅÕ—…ΩπúÅÏÅçΩ±Ω»Ëçå·ò—ôòÌôΩπ–µÕ•ÈîËƒ…¡‡ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµπΩ—•çîµΩŸï…±Ö‰ÅÏÅâÖç≠ù…Ω’πêÈ…ùâÑ†ƒ∞Ã∞ƒ¿∞∏‡ÿ§ÌâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†ƒ¡¡‡§ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµπΩ—•çîÅÏÅµÖ‡µ›•ë—†Ë–‡¡¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏Ã¿§ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÿ’ëïú∞å¡Ñƒ–»‘∞åƒÃ¡à»‰§ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµπΩ—•çîÄπµΩëÖ∞µâΩ‡µâΩë‰ÅÏÅ—ï·–µÖ±•ù∏Èçïπ—ï»Ì¡Öëë•πúµ—Ω¿Ë»Ÿ¡‡ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµπΩ—•çîµµÖ…¨ÅÏ(ÄÄÄÄÄÅ›•ë—†Ë‡—¡‡Ì°ï•ù°–Ë‡—¡‡ÌµÖ…ù•∏Ë¿ÅÖ’—ºÄƒ—¡‡Ìë•Õ¡±Ö‰Èù…•êÌ¡±Öçîµ•—ïµÃÈçïπ—ï»ÌâΩ…ëï»µ…Öë•’ÃË»Ÿ¡‡Ï(ÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏‘‘§ÌçΩ±Ω»ÈŸÖ»†¥µ±Ã‹µùΩ±ê§ÌôΩπ–Ë‰‘¿Ä‘—¡‡ÄùM¡ÖçîÅ…Ω—ïÕ¨ú±ÕÖπÃµÕï…•òÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±î±…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ƒÃ§±…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏¿‘§§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä‘¡¡‡Å…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏ƒ¿§Ï(ÄÄÄÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµπΩ—•çîÅÕµÖ±∞ÅÏÅçΩ±Ω»ÈŸÖ»†¥µ±Ã‹µâ±’î§ÌôΩπ–Ë‰¿¿ÄÂ¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏ƒŸï¥ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµπΩ—•çîÅ†»ÅÏÅµÖ…ù•∏ËÂ¡‡Ä¿Äƒ…¡‡ÌôΩπ–µÕ•ÈîË»·¡‡ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµπΩ—•çîÅ¿ÅÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîËƒÕ¡‡Ì±•πîµ°ï•ù°–Ëƒ∏‘‘ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµ…ΩÖëµÖ¿ÅÏÅë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈÖ’—ºÄ≈ô»ÌùÖ¿Ë·¡‡Äƒ≈¡‡ÌµÖ…ù•∏Ëƒ·¡‡Ä¿Ì¡Öëë•πúËƒÕ¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‡‡∞»ƒÿ∞»‘‘∞∏ƒÿ§ÌâΩ…ëï»µ…Öë•’ÃËƒ—¡‡Ì—ï·–µÖ±•ù∏È±ïô–ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµ…ΩÖëµÖ¿ÅÕ¡Ö∏ÅÏÅçΩ±Ω»ÈŸÖ»†¥µ±Ã‹µâ±’î§ÌôΩπ–Ë‰¿¿Ä·¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµ…ΩÖëµÖ¿ÅàÅÏÅçΩ±Ω»ÈŸÖ»†¥µ—ï·–§ÌôΩπ–µÕ•ÈîËƒ≈¡‡ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµπΩ—•çîÅâ±Ωç≠≈’Ω—îÅÏÅµÖ…ù•∏Ëƒ—¡‡Ä¿Ä¿ÌçΩ±Ω»ÈŸÖ»†¥µ—ï·–µë•¥§ÌôΩπ–µÕ•ÈîËƒÕ¡‡Ì±•πîµ°ï•ù°–Ëƒ∏‘‘ÏÅÙ(ÄÄÄÄπ±Ã‹µ…’π—•µîµπΩ—•çîÅâ±Ωç≠≈’Ω—îÅÕ—…ΩπúÅÏÅçΩ±Ω»ÈŸÖ»†¥µ±Ã‹µùΩ±ê§ÏÅÙ((ÄÄÄÄº®Å%9QIÅ5=Q%=8Ä»É
‹Å•ëïπ—•ëÖêÅù…Öô•—º∞Å—•—Öπ•º∞ÅëΩ…ÖëºÅ‰Å…Ω©ºÅï≥•ç—…•çºÄ®º(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅÏ(ÄÄÄÄÄÄ¥µ±Ã‹µâ±’îËçåÂê—ëòÏ¥µ±Ã‹µŸ•Ω±ï–Ëçôò—ê–‘Ï¥µ±Ã‹µùΩ±êËçò—å‰’êÏ(ÄÄÄÄÄÄ¥µ•π¨Ëå¿‰¡Ñ¡êÏ¥µ¡Öπï∞Ëåƒ»ƒ–ƒ‰Ï¥µ¡Öπï∞¥»Ëå≈à≈î»–Ï¥µùΩ±êËçò—å‰’êÏ¥µùΩ±êµë•¥Ëçå‰ÂåÃÿÏ(ÄÄÄÄÄÄ¥µù…ïï∏Ëçôò‘‘—åÏ¥µ—ï·–Ëçò›ò’ïòÏ¥µ—ï·–µë•¥ËçàÂâïåÿÏ¥µâΩ…ëï»ËåÃ»ÃÿÕîÏ(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅâΩë‰ÅÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Äƒ»îÄ¥ƒ¿î±…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏¿‰§±—…ÖπÕ¡Ö…ïπ–Ä»‡î§±…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Äƒ¿‡îÄÃ‡î±…ùâÑ†»‘‘∞‹‹∞ÿ‰∞∏¿‹‘§±—…ÖπÕ¡Ö…ïπ–ÄÃ¿î§±±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú∞å¿‰¡Ñ¡ê∞å¡ê¡òƒÃÄ‘»î∞å¿‡¿‰¡à§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅπÖÿÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ƒÿ§ÌâÖç≠ù…Ω’πêÈ…ùâÑ†‰∞ƒ¿∞ƒÃ∞∏‰¿§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ…¡‡ÄÃ·¡‡Å…ùâÑ†¿∞¿∞¿∞∏Ã–§±•πÕï–Ä¿Ä¥≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿ƒ‡§ÌâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†ƒ·¡‡§ÅÕÖ—’…Ö—î†ƒ»¿î§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄππÖÿµâ…ÖπêµÕç…Ω±∞ÅÏÅçΩ±Ω»ËçêÂëïî‘ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπôΩ…¥µçÖ…ê±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπŸ•ëïºµçÖ…ê±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπÖ’—†µâΩ‡ÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»¿ƒ∞»ƒ»∞»»Ã∞∏ƒÃ§ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†»ÿ∞»‡∞Ã–∞∏‰ÿ§±…ùâÑ†ƒÃ∞ƒ–∞ƒ‡∞∏‰‹§§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿Ã‘§∞¿Äƒ·¡‡Ä–’¡‡Å…ùâÑ†¿∞¿∞¿∞∏»–§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅ•π¡’–±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅ—ï·—Ö…ïÑ±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅÕï±ïç–ÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»¿ƒ∞»ƒ»∞»»Ã∞∏»‘§ÌâÖç≠ù…Ω’πêËå¡ê¡òƒÃÌçΩ±Ω»Ëçò›ò’ïòÏ(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅ•π¡’–ÈôΩç’Ã±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅ—ï·—Ö…ïÑÈôΩç’Ã±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅÕï±ïç–ÈôΩç’ÃÅÏ(ÄÄÄÄÄÅΩ’—±•πîËÕ¡‡ÅÕΩ±•êÅ…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ƒÃ§ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ÿÿ§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπâ—∏ÅÏÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÃ’ëïú∞çëâÖàÕî∞çôò‘‘—å§ÌçΩ±Ω»ËåƒƒƒÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘‘∞»»‘∞ƒ–‘∞∏Ã‡§ÌâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ¡¡‡Ä»·¡‡Å…ùâÑ†»‘‘∞‡‘∞‹ÿ∞∏ƒ»§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπâ—∏µΩ’—±•πîÅÏÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»¿ƒ∞»ƒ»∞»»Ã∞∏»‘§ÌçΩ±Ω»Ëçïëò¡ò–ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿–‘§±…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿ƒ»§§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ¡Öùîµ—•—±îÅÏÅçΩ±Ω»Ëçôâò·ïòÌ—ï·–µÕ°ÖëΩ‹Ë¿Ä¿Ä»·¡‡Å…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏¿‹§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄππÖÿµ±•π≠ÃÅâ’——Ω∏πÖç—•ŸîÅÏÅçΩ±Ω»Ëçôôò…åƒÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÃ’ëïú±…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ƒƒ§±…ùâÑ†»‘‘∞‹‹∞ÿ‰∞∏¿‹§§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄππÖÿµ±•π≠ÃÅâ’——Ω∏πÖç—•ŸîËÈÖô—ï»ÅÏÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†‰¡ëïú∞çêÂëïî‘±ŸÖ»†¥µ±Ã‹µùΩ±ê§∞çôò‘‘—å§ÏÅÙ((ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπôïïêµÖç—•ΩπÃÅÏ(ÄÄÄÄÄÅùÖ¿Ë·¡‡Ö•µ¡Ω…—Öπ–Ì¡Öëë•πúË·¡‡ÄŸ¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»¿ƒ∞»ƒ»∞»»Ã∞∏ƒÃ§ÌâΩ…ëï»µ…Öë•’ÃË»Ÿ¡‡Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÿ¡ëïú±…ùâÑ†»‘∞»‹∞ÃÃ∞∏‹ÿ§±…ùâÑ†‡∞‰∞ƒ»∞∏‹¿§§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ·¡‡Ä–—¡‡Å…ùâÑ†¿∞¿∞¿∞∏Ã‡§±•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿–‘§Ï(ÄÄÄÄÄÅâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†ƒ’¡‡§ÅÕÖ—’…Ö—î†ƒ»‘î§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπôïïêµÖç—•Ω∏µâ—∏ÅÏ(ÄÄÄÄÄÅ›•ë—†Ë‘¡¡‡Ö•µ¡Ω…—Öπ–Ìµ•∏µ°ï•ù°–Ë‘¡¡‡Ö•µ¡Ω…—Öπ–Ì°ï•ù°–Ë‘¡¡‡Ö•µ¡Ω…—Öπ–Ì¡Öëë•πúË’¡‡Ö•µ¡Ω…—Öπ–ÌâΩ…ëï»µ…Öë•’ÃËƒ›¡‡Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»¿ƒ∞»ƒ»∞»»Ã∞∏ƒÿ§Ö•µ¡Ω…—Öπ–ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†–¿∞–Ã∞‘ƒ∞∏‡‡§±…ùâÑ†ƒ–∞ƒ‘∞ƒ‰∞∏‰»§§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿‘‘§∞¿Ä·¡‡Äƒ·¡‡Å…ùâÑ†¿∞¿∞¿∞∏»‘§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅçΩ±Ω»Ëçïëò¡ò–Ö•µ¡Ω…—Öπ–Ìë•Õ¡±Ö‰Èô±ï‡Ö•µ¡Ω…—Öπ–Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ì©’Õ—•ô‰µçΩπ—ïπ–Èçïπ—ï»ÌùÖ¿Ë≈¡‡Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπôïïêµÖç—•Ω∏µâ—∏Ä¯ÅÕ¡Ö∏ÅÏÅôΩπ–Ë‡‘¿Ä»…¡‡ÄùM¡ÖçîÅ…Ω—ïÕ¨ú±ÕÖπÃµÕï…•òÌ±•πîµ°ï•ù°–ËƒÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπôïïêµÖç—•Ω∏µâ—∏Ä¯Å§ÅÏÅçΩ±Ω»ËçÖïà—âêÌôΩπ–Ë‡‘¿ÄŸ¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏¿’ï¥ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπôïïêµÖç—•Ω∏µâ—∏ÈÖç—•ŸîÅÏÅ—…ÖπÕôΩ…¥ÈÕçÖ±î†∏‡‡§Ö•µ¡Ω…—Öπ–ÌâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿ÄÕ¡‡Äƒ…¡‡Å…ùâÑ†¿∞¿∞¿∞∏Ã‘§Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπôïïêµÖç—•Ω∏µâ—∏π±•≠ïêÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘‘∞‡»∞‹–∞∏ÿ‘§Ö•µ¡Ω…—Öπ–ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú∞çå‰…òÃƒ∞åŸêƒ‘≈ê§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä¿ÄÕ¡‡Å…ùâÑ†»‘‘∞‡»∞‹–∞∏ƒ»§∞¿Äƒ¡¡‡Ä»’¡‡Å…ùâÑ†»¿ƒ∞–‹∞–‰∞∏»‡§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÖç—•Ω∏µÕ°Ö…îÄ¯ÅÕ¡Ö∏ÅÏÅçΩ±Ω»Ëçò—å‰’êÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÖç—•Ω∏µ°•ëîÄ¯ÅÕ¡Ö∏ÅÏÅçΩ±Ω»ËçåÂê—ëòÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÖç—•Ω∏µ…ï¡Ω…–ÅÏÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘‘∞‡»∞‹–∞∏»‘§Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÖç—•Ω∏µ…ï¡Ω…–Ä¯ÅÕ¡Ö∏ÅÏÅçΩ±Ω»Ëçôòÿ»‘‰ÌôΩπ–µ›ï•ù°–Ë‰‘¿ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄçÖ¡¡Y•ï‹π±Ã‹µÕ›•¡îµ±ïô–ÅÏÅÖπ•µÖ—•Ω∏È±Ã›M›•¡ï1ïô–Ä∏ƒÕÃÅïÖÕîÅâΩ—†ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄçÖ¡¡Y•ï‹π±Ã‹µÕ›•¡îµ…•ù°–ÅÏÅÖπ•µÖ—•Ω∏È±Ã›M›•¡ïI•ù°–Ä∏ƒÕÃÅïÖÕîÅâΩ—†ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄç±Ã›M›•¡ïIÖ•∞ÅÏ(ÄÄÄÄÄÅ¡ΩÕ•—•Ω∏Èô•·ïêÌ±ïô–Ë‘¿îÌ—Ω¿ÈçÖ±å°µÖ‡†ÿ—¡‡±ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µ—Ω¿§Ä¨Ä‘Ÿ¡‡§§ÌËµ•πëï‡Ë‹–Ï(ÄÄÄÄÄÅ›•ë—†Ëƒ‘—¡‡Ì°ï•ù°–Ë»Â¡‡Ì—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ï`†¥‘¿î§Ìë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»Ì©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏Ï(ÄÄÄÄÄÅ¡Öëë•πúË¿Äƒ≈¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏»»§ÌâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…ùâÑ†ƒ»∞ƒÃ∞ƒ‹∞∏‹‡§ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä·¡‡Ä»’¡‡Å…ùâÑ†¿∞¿∞¿∞∏»‡§±•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿–§Ï(ÄÄÄÄÄÅçΩ±Ω»Ëçò—å‰’êÌâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†ƒ…¡‡§Ì—Ω’ç†µÖç—•Ω∏È¡Ö∏µ‡Ì—…ÖπÕ•—•Ω∏ÈΩ¡Öç•—‰Ä∏ƒŸÃÅïÖÕî±—…ÖπÕôΩ…¥Ä∏ƒŸÃÅïÖÕîÏ(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄç±Ã›M›•¡ïIÖ•∞ÅàÅÏÅçΩ±Ω»Ëçê·ëçî»ÌôΩπ–Ë‡‘¿Ä›¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏¿Âï¥ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄç±Ã›M›•¡ïIÖ•∞ÅÕ¡Ö∏ÅÏÅôΩπ–µÕ•ÈîËƒŸ¡‡Ì±•πîµ°ï•ù°–ËƒÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄç±Ã›M›•¡ïIÖ•∞π•Ãµ±ïô–ÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ï`°çÖ±å†¥‘¿îÄ¥Ä·¡‡§§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄç±Ã›M›•¡ïIÖ•∞π•Ãµ…•ù°–ÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ï`°çÖ±å†¥‘¿îÄ¨Ä·¡‡§§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄç±Ã›M›•¡ïIÖ•∞π•Ãµ°•ëëï∏ÅÏÅΩ¡Öç•—‰Ë¿Ì¡Ω•π—ï»µïŸïπ—ÃÈπΩπîÏÅÙ((ÄÄÄÄº®Å5ïªËÅ°Öµâ’…ù’ïÕÑÅ1•ŸïMç…Ω±∞Ä‹É
‹Åçïπ—…ºÅëîÅçΩπ—…Ω∞Ä®º(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπµΩâ•±îµµïπ‘µΩŸï…±Ö‰ÅÏÅâÖç≠ù…Ω’πêÈ…ùâÑ†Ã∞–∞ÿ∞∏‹ÿ§ÌâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†›¡‡§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µµΩâ•±îµµïπ‘µ¡Öπï∞ÅÏ(ÄÄÄÄÄÅ›•ë—†Èµ•∏†‰¿î∞Ãÿ’¡‡§ÌµÖ‡µ›•ë—†ËÃÿ’¡‡Ì¡Öëë•πúËƒ·¡‡Äƒ—¡‡Ä¿ÌâΩ…ëï»µ±ïô–Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ƒ‡§Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Äƒƒ¿îÄ¥‘î±…ùâÑ†»‘‘∞‹‹∞ÿ‰∞∏ƒ–§±—…ÖπÕ¡Ö…ïπ–ÄÃ¿î§±±•πïÖ»µù…Öë•ïπ–†ƒÿ’ëïú±…ùâÑ†»‹∞»‰∞Ã‘∞∏‰‰§±…ùâÑ†‰∞ƒ¿∞ƒÃ∞∏‰‰‘§§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¥»Ÿ¡‡Ä¿Ä‹¡¡‡Å…ùâÑ†¿∞¿∞¿∞∏‘‡§±•πÕï–Ä≈¡‡Ä¿Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿»‘§Ï(ÄÄÄÄÄÅÖπ•µÖ—•Ω∏È±Ã›Ωπ—…Ω±ïπ—ï…%∏Ä∏Ã…ÃÅç’â•åµâïÈ•ï»†∏ƒÿ∞ƒ∞∏Ã∞ƒ§ÅâΩ—†Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µµΩâ•±îµµïπ‘µ¡Öπï∞Äπ±ÃµµΩâ•±îµµïπ‘µ°ïÖêÅÏ(ÄÄÄÄÄÅ¡Öëë•πúËÕ¡‡Ä—¡‡Äƒ’¡‡ÌâΩ…ëï»µâΩ——Ω¥Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ƒÃ§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µµΩâ•±îµµïπ‘µ¡Öπï∞Äπ±ÃµµΩâ•±îµµïπ‘µ°ïÖêÅÕ—…ΩπúÅÏÅôΩπ–µÕ•ÈîË»—¡‡Ì±ï——ï»µÕ¡Öç•πúË¥∏¿‘’ï¥ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µµΩâ•±îµµïπ‘µ¡Öπï∞Äπ±ÃµµΩâ•±îµµïπ‘µ°ïÖêÅÕ—…ΩπúÅï¥ÅÏÅçΩ±Ω»Ëçò—å‰’êÌ—ï·–µÕ°ÖëΩ‹Ë¿Ä¿ÄƒŸ¡‡Å…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏»‡§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µµΩâ•±îµµïπ‘µ¡Öπï∞Äπ±ÃµµΩâ•±îµµïπ‘µ°ïÖêÅÕµÖ±∞ÅÏÅçΩ±Ω»ËçÖïà—âêÌ±ï——ï»µÕ¡Öç•πúË∏ƒ’ï¥ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µµΩâ•±îµµïπ‘µ¡Öπï∞Äπ±ÃµµΩâ•±îµµïπ‘µç±ΩÕîÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»¿ƒ∞»ƒ»∞»»Ã∞∏ƒ‡§ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿ÿ§±…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿ƒ»§§ÌçΩ±Ω»ËçîŸîÂïêÏ(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µµïπ‘µ…’π—•µîµ±•πîÅÏ(ÄÄÄÄÄÅµÖ…ù•∏Ëƒ≈¡‡Ä…¡‡Ä—¡‡Ì¡Öëë•πúË·¡‡Äƒ¡¡‡Ìë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌùÖ¿Ë›¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ƒ»§ÌâΩ…ëï»µ…Öë•’ÃËƒ≈¡‡Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†‰¡ëïú±…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏¿‘‘§±…ùâÑ†»‘‘∞‹‹∞ÿ‰∞∏¿Ã‘§§ÌôΩπ–Ë‡¿¿Ä›¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏¿Âï¥ÌçΩ±Ω»ËçÖïà—âêÏ(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µµïπ‘µ…’π—•µîµ±•πîÅ§ÅÏÅ›•ë—†ËŸ¡‡Ì°ï•ù°–ËŸ¡‡ÌâΩ…ëï»µ…Öë•’ÃË‘¿îÌâÖç≠ù…Ω’πêËçôò‘‘—åÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Äƒ¡¡‡Å…ùâÑ†»‘‘∞‡‘∞‹ÿ∞∏‹‘§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µµïπ‘µ…’π—•µîµ±•πîÅàÅÏÅµÖ…ù•∏µ±ïô–ÈÖ’—ºÌçΩ±Ω»Ëçò—å‰’êÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µµΩâ•±îµµïπ‘µ¡Öπï∞Äπ±ÃµµΩâ•±îµµïπ‘µ±Öâï∞ÅÏÅçΩ±Ω»Ëå‹‹›ò·ÑÌ±ï——ï»µÕ¡Öç•πúË∏ƒ›ï¥Ì¡Öëë•πúµ—Ω¿Ëƒ’¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µµΩâ•±îµµïπ‘µ¡Öπï∞Äπ±ÃµµΩâ•±îµµïπ‘µÕç…Ω±∞Ä¯Åâ’——Ω∏ÅÏ(ÄÄÄÄÄÅµ•∏µ°ï•ù°–Ë‘≈¡‡ÌµÖ…ù•∏µâΩ——Ω¥ËÕ¡‡Ì¡Öëë•πúË›¡‡Äƒ¡¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ—…ÖπÕ¡Ö…ïπ–ÌâΩ…ëï»µâΩ——Ω¥µçΩ±Ω»È…ùâÑ†»¿ƒ∞»ƒ»∞»»Ã∞∏¿ÿ‘§ÌâΩ…ëï»µ…Öë•’ÃËƒ—¡‡Ï(ÄÄÄÄÄÅçΩ±Ω»Ëçê›ëâîƒÌ—…ÖπÕ•—•Ω∏È—…ÖπÕôΩ…¥Ä∏ƒ’ÃÅïÖÕî±âÖç≠ù…Ω’πêÄ∏ƒ’ÃÅïÖÕî±âΩ…ëï»µçΩ±Ω»Ä∏ƒ’ÃÅïÖÕîÏ(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µµΩâ•±îµµïπ‘µ¡Öπï∞Äπ±ÃµµΩâ•±îµµïπ‘µÕç…Ω±∞Ä¯Åâ’——Ω∏ÅÕ¡Ö∏ÅÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†»¿ƒ∞»ƒ»∞»»Ã∞∏¿‹‘§±…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿ƒ‘§§ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»¿ƒ∞»ƒ»∞»»Ã∞∏¿‹§Ìô•±—ï»Èù…ÖÂÕçÖ±î†∏»§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µµΩâ•±îµµïπ‘µ¡Öπï∞Äπ±ÃµµΩâ•±îµµïπ‘µÕç…Ω±∞Ä¯Åâ’——Ω∏πÖç—•ŸîÅÏ(ÄÄÄÄÄÅçΩ±Ω»Ëçôôò≈âêÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ƒ‰§ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÃ’ëïú±…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ƒ¿‘§±…ùâÑ†»‘‘∞‹‹∞ÿ‰∞∏¿‘‘§§Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹È•πÕï–ÄÕ¡‡Ä¿Ä¿Äçò—å‰’ê∞¿Ä·¡‡Ä»…¡‡Å…ùâÑ†¿∞¿∞¿∞∏ƒÃ§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µµΩâ•±îµµïπ‘µ¡Öπï∞Äπ±ÃµµΩâ•±îµµïπ‘µÕç…Ω±∞Ä¯Åâ’——Ω∏ÈÖç—•ŸîÅÏÅ—…ÖπÕôΩ…¥ÈÕçÖ±î†∏‰‹‘§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µµΩâ•±îµµïπ‘µ¡Öπï∞Äπ±ÃµµΩâ•±îµµïπ‘µï·•–ÅÏÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ƒÃ§ÏÅÙ(ÄÄÄÅ≠ïÂô…ÖµïÃÅ±Ã›Ωπ—…Ω±ïπ—ï…%∏ÅÏÅô…ΩµÌΩ¡Öç•—‰Ë∏ÿ‘Ì—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—îÕê†Ã·¡‡∞¿∞¿•ı—ΩÌΩ¡Öç•—‰ËƒÌ—…ÖπÕôΩ…¥ÈπΩπïÙÅÙ((ÄÄÄÄº®Å…ïÖ—Ω»ÅM—’ë•ºÅ1•ŸïMç…Ω±∞Ä‹É
‹ÅÕ’â•ëÑÅµΩëï…πÑÅ‰ÅÖççïÕ•â±îÄ®º(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµÕ—’ë•ºµÕ°ï±∞ÅÏÅ¡ï…Õ¡ïç—•ŸîË‰¿¡¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµÕ—’ë•ºµ°ï…ºÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏»»§Ö•µ¡Ω…—Öπ–ÌâΩ…ëï»µ…Öë•’ÃË»—¡‡Ö•µ¡Ω…—Öπ–Ì¡Öëë•πúË»’¡‡Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‡‡îÄ‡î±…ùâÑ†»‘‘∞‹‹∞ÿ‰∞∏ƒÿ§±—…ÖπÕ¡Ö…ïπ–ÄÃ»î§±…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Äƒ»îÄƒƒ¿î±…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏¿‰§±—…ÖπÕ¡Ö…ïπ–ÄÃÿî§±±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†Ã‘∞Ã‹∞––∞∏‰‡§±…ùâÑ†ƒƒ∞ƒ»∞ƒÿ∞∏‰‡§§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä»—¡‡Äÿ¡¡‡Å…ùâÑ†¿∞¿∞¿∞∏Ã¿§±•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿‘§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµÕ—’ë•ºµ°ï…ºËÈÖô—ï»ÅÏ(ÄÄÄÄÄÅçΩπ—ïπ–Ëà‹àÌ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÌ…•ù°–Ë»¡¡‡Ì—Ω¿Ë¥»’¡‡ÌçΩ±Ω»È…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏¿Ã‘§ÌôΩπ–Ë‰‘¿Äƒ‘¡¡‡ÄùM¡ÖçîÅ…Ω—ïÕ¨ú±ÕÖπÃµÕï…•òÌ¡Ω•π—ï»µïŸïπ—ÃÈπΩπîÏ(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµÕ—’ë•ºµÕ—ï¡ÃÄ¯Åë•ÿÅÏ(ÄÄÄÄÄÅ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌΩŸï…ô±Ω‹È°•ëëï∏Ìµ•∏µ°ï•ù°–Ëÿ·¡‡Ö•µ¡Ω…—Öπ–Ì¡Öëë•πúËƒÕ¡‡Ö•µ¡Ω…—Öπ–ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†»¿ƒ∞»ƒ»∞»»Ã∞∏ƒÃ§Ö•µ¡Ω…—Öπ–ÌâΩ…ëï»µ…Öë•’ÃËƒ’¡‡Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†Ã¿∞Ã»∞Ã‡∞∏‰–§±…ùâÑ†ƒÃ∞ƒ–∞ƒ‡∞∏‰‘§§Ö•µ¡Ω…—Öπ–ÌâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿Ã§∞¿ÄÂ¡‡Ä»Õ¡‡Å…ùâÑ†¿∞¿∞¿∞∏ƒ‘§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµÕ—’ë•ºµÕ—ï¡ÃÄ¯Åë•ÿÅÕ—…ΩπúÅÏÅçΩ±Ω»Ëçò—å‰’êÖ•µ¡Ω…—Öπ–ÌôΩπ–Ë‰¿¿ÄƒÕ¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµµΩëîµù…•êÅâ’——Ω∏ÅÏ(ÄÄÄÄÄÅµ•∏µ°ï•ù°–Ë‹…¡‡ÌâΩ…ëï»µ…Öë•’ÃËƒ›¡‡Ö•µ¡Ω…—Öπ–ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»¿ƒ∞»ƒ»∞»»Ã∞∏ƒÿ§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†Ã‡∞–¿∞–‹∞∏‰ÿ§±…ùâÑ†ƒÃ∞ƒ–∞ƒ‡∞∏‰ÿ§§Ö•µ¡Ω…—Öπ–ÌçΩ±Ω»Ëçïïò¡òÃÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿–‘§∞¿Äƒ…¡‡ÄÃ¡¡‡Å…ùâÑ†¿∞¿∞¿∞∏ƒ‡§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµµΩëîµù…•êÅâ’——Ω∏πâ—∏ÅÏ(ÄÄÄÄÄÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏–»§Ö•µ¡Ω…—Öπ–ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÃ’ëïú±…ùâÑ†»ƒÿ∞ƒÿ‘∞‘¿∞∏‰ÿ§±…ùâÑ†»‘‘∞‡‘∞‹ÿ∞∏‡‡§§Ö•µ¡Ω…—Öπ–ÌçΩ±Ω»Ëåƒ–ƒ¿¡åÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµÕ—’ë•ºµôΩ…¥ÅÏ(ÄÄÄÄÄÅâΩ…ëï»µ…Öë•’ÃË»Õ¡‡Ö•µ¡Ω…—Öπ–Ì¡Öëë•πúË»≈¡‡Ö•µ¡Ω…—Öπ–ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†»¿ƒ∞»ƒ»∞»»Ã∞∏ƒ–§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ‘’ëïú±…ùâÑ†»‹∞»‰∞Ã‘∞∏‰‡§±…ùâÑ†ƒ¿∞ƒƒ∞ƒ–∞∏‰‡‘§§Ö•µ¡Ω…—Öπ–ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä»…¡‡Ä‘’¡‡Å…ùâÑ†¿∞¿∞¿∞∏»‡§±•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿Ã‘§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµÕ—’ë•ºµôΩ…¥Äπô•ï±êÅ±Öâï∞ÅÏÅçΩ±Ω»Ëçî·îÂïàÌôΩπ–µ›ï•ù°–Ë‹‘¿ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµÕ—’ë•ºµôΩ…¥Å•π¡’–±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµÕ—’ë•ºµôΩ…¥ÅÕï±ïç–ÅÏ(ÄÄÄÄÄÅµ•∏µ°ï•ù°–Ë–·¡‡ÌâΩ…ëï»µ…Öë•’ÃËƒÕ¡‡Ö•µ¡Ω…—Öπ–ÌâÖç≠ù…Ω’πêÈ…ùâÑ†‹∞‡∞ƒƒ∞∏‹‡§Ö•µ¡Ω…—Öπ–ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†»¿ƒ∞»ƒ»∞»»Ã∞∏»¿§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµô•±îµë…Ω¿ÅÏ(ÄÄÄÄÄÅµ•∏µ°ï•ù°–Ëƒ‘¡¡‡Ö•µ¡Ω…—Öπ–ÌâΩ…ëï»Ë≈¡‡ÅëÖÕ°ïêÅ…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏––§Ö•µ¡Ω…—Öπ–ÌâΩ…ëï»µ…Öë•’ÃË»¡¡‡Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‘¿îÄ–¿î±…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ƒ¿§±—…ÖπÕ¡Ö…ïπ–ÄÃ‡î§±±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿»‘§±…ùâÑ†»‘‘∞‹‹∞ÿ‰∞∏¿»‘§§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä¿Ä¿Ä’¡‡Å…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏¿ƒ‡§Ì—…ÖπÕ•—•Ω∏È—…ÖπÕôΩ…¥Ä∏ƒ·ÃÅïÖÕî±âΩ…ëï»µçΩ±Ω»Ä∏ƒ·ÃÅïÖÕî±âÖç≠ù…Ω’πêÄ∏ƒ·ÃÅïÖÕîÏ(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµô•±îµë…Ω¿ÈÖç—•ŸîÅÏÅ—…ÖπÕôΩ…¥ÈÕçÖ±î†∏‰‡‘§ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†»‘‘∞‡‘∞‹ÿ∞∏ÿ»§Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄç’¡±ΩÖëM’âµ•—	—∏ÅÏÅµ•∏µ°ï•ù°–Ë‘—¡‡ÌâΩ…ëï»µ…Öë•’ÃËƒŸ¡‡Ö•µ¡Ω…—Öπ–ÌôΩπ–µÕ•ÈîËƒ—¡‡Ì±ï——ï»µÕ¡Öç•πúË∏¿≈ï¥ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄç’¡±ΩÖëA…Ωù…ïÕÕ	Ö»ÅÏÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†‰¡ëïú∞çò—å‰’ê∞çôò‘‘—å§Ö•µ¡Ω…—Öπ–ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Äƒ’¡‡Å…ùâÑ†»‘‘∞‡‘∞‹ÿ∞∏Ã‘§ÏÅÙ(ÄÄÄÅµïë•Ñ°µÖ‡µ›•ë—†Ë‘ÿ¡¡‡§ÅÏ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµÕ—’ë•ºµ°ï…ºÅÏÅ¡Öëë•πúË»¡¡‡Äƒ›¡‡Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµÕ—’ë•ºµÕ—ï¡ÃÅÏÅùÖ¿Ë’¡‡Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµÕ—’ë•ºµÕ—ï¡ÃÄ¯Åë•ÿÅÏÅ¡Öëë•πúËƒ¡¡‡Ä·¡‡Ö•µ¡Ω…—Öπ–ÌôΩπ–µÕ•ÈîËÂ¡‡Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ’¡±ΩÖêµÕ—’ë•ºµôΩ…¥ÅÏÅ¡Öëë•πúËƒŸ¡‡Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅÙ((ÄÄÄÄº®Å	Ö……ÑÅ•πôï…•Ω»Å1•ŸïMç…Ω±∞Ä‹É
‹Åô±Ω—Öπ—î∞Åµï”Ö±•çÑÅ‰ÅÕï¡Ö…ÖëÑÅëîÅ1LÿÄ®º(ÄÄÄÅµïë•Ñ°µÖ‡µ›•ë—†Ë‹‡¡¡‡§ÅÏ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅâΩë‰π±ÃµπÖŸ•ùÖ—•Ω∏µ…ïÖë‰Äπ±ÃµµΩâ•±îµëΩç¨ÅÏ(ÄÄÄÄÄÄÄÅ±ïô–ÈµÖ‡†ƒ…¡‡±ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µ±ïô–§§Ì…•ù°–ÈµÖ‡†ƒ…¡‡±ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µ…•ù°–§§Ï(ÄÄÄÄÄÄÄÅâΩ——Ω¥ÈµÖ‡†ƒ¡¡‡±ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µâΩ——Ω¥§§Ì›•ë—†ÈÖ’—ºÌµÖ‡µ›•ë—†Ë‘»¡¡‡Ì°ï•ù°–Ëÿ·¡‡ÌµÖ…ù•∏Ë¿ÅÖ’—ºÏ(ÄÄÄÄÄÄÄÅ—…ÖπÕôΩ…¥ÈπΩπîÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÄÄÅ¡Öëë•πúË›¡‡Ä·¡‡ÄŸ¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»ƒ‡∞»»–∞»Ã»∞∏ƒÿ§ÌâΩ…ëï»µ…Öë•’ÃË»—¡‡Ï(ÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÿ’ëïú±…ùâÑ†ÃÃ∞Ã‘∞–»∞∏‰–§±…ùâÑ†ƒ¿∞ƒƒ∞ƒ–∞∏‰ÿ§§Ï(ÄÄÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Ä»¡¡‡Ä–·¡‡Å…ùâÑ†¿∞¿∞¿∞∏–‡§±•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿ÿ‘§±•πÕï–Ä¿Ä¥≈¡‡Ä¿Å…ùâÑ†¿∞¿∞¿∞∏ÿ‘§Ï(ÄÄÄÄÄÄÄÅâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†»¡¡‡§ÅÕÖ—’…Ö—î†ƒÃ¿î§Ï(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµΩâ•±îµëΩç¨ËÈâïôΩ…îÅÏ(ÄÄÄÄÄÄÄÅçΩπ—ïπ–ËààÌ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÌ±ïô–Ëƒ–îÌ…•ù°–Ëƒ–îÌ—Ω¿Ë¥≈¡‡Ì°ï•ù°–Ë≈¡‡Ï(ÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†‰¡ëïú±—…ÖπÕ¡Ö…ïπ–±…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ÿ»§±…ùâÑ†»‘‘∞‹‹∞ÿ‰∞∏‘»§±—…ÖπÕ¡Ö…ïπ–§Ï(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµΩâ•±îµëΩç¨Åâ’——Ω∏ÅÏ(ÄÄÄÄÄÄÄÅµ•∏µ°ï•ù°–Ë‘…¡‡ÌâΩ…ëï»µ…Öë•’ÃËƒ›¡‡ÌçΩ±Ω»Ëå‰»‰ÂÑ–Ì—…ÖπÕ•—•Ω∏È—…ÖπÕôΩ…¥Ä∏ƒ·ÃÅç’â•åµâïÈ•ï»†∏»∞∏‡∞∏»∞ƒ§±çΩ±Ω»Ä∏ƒ·ÃÅïÖÕî±âÖç≠ù…Ω’πêÄ∏ƒ·ÃÅïÖÕîÏ(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµΩâ•±îµëΩç¨Åâ’——Ω∏ÅÕµÖ±∞ÅÏÅôΩπ–Ë‡¿¿Ä›¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏¿Ã’ï¥ÏÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµΩâ•±îµëΩç¨Åâ’——Ω∏πÖç—•ŸîÅÏ(ÄÄÄÄÄÄÄÅçΩ±Ω»Ëçò’ò≈î‹ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏ƒƒ§±…ùâÑ†»‘‘∞‹‹∞ÿ‰∞∏¿‘‘§§Ï(ÄÄÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿Ã‘§Ï(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµΩâ•±îµëΩç¨Åâ’——Ω∏πÖç—•ŸîËÈÖô—ï»ÅÏ(ÄÄÄÄÄÄÄÅâΩ——Ω¥Ë≈¡‡Ì›•ë—†Ë»…¡‡Ì°ï•ù°–Ë…¡‡ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†‰¡ëïú∞çò—å‰’ê∞çôò‘‘—å§ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Äƒ¡¡‡Å…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏Ãÿ§Ï(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µëΩç¨µ•çΩ∏ÅÏÅ›•ë—†Ë»’¡‡Ì°ï•ù°–Ë»’¡‡Ìë•Õ¡±Ö‰Èù…•êÌ¡±Öçîµ•—ïµÃÈçïπ—ï»ÏÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µëΩç¨µ•çΩ∏ÅÕŸúÅÏÅ›•ë—†Ë»≈¡‡Ì°ï•ù°–Ë»≈¡‡ÌΩŸï…ô±Ω‹ÈŸ•Õ•â±îÌô•±∞ÈπΩπîÌÕ—…Ω≠îÈç’……ïπ—Ω±Ω»ÌÕ—…Ω≠îµ›•ë—†Ëƒ∏‹‘ÌÕ—…Ω≠îµ±•πïçÖ¿È…Ω’πêÌÕ—…Ω≠îµ±•πï©Ω•∏È…Ω’πêÏÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµΩâ•±îµëΩç¨Åâ’——Ω∏πÖç—•ŸîÄπ±Ã‹µëΩç¨µ•çΩ∏ÅÏÅô•±—ï»Èë…Ω¿µÕ°ÖëΩ‹†¿Ä¿Ä›¡‡Å…ùâÑ†»––∞»¿ƒ∞‰Ã∞∏Ã¿§§ÌÖπ•µÖ—•Ω∏È±Ã›Ωç≠%çΩπ%∏Ä∏ÕÃÅç’â•åµâïÈ•ï»†∏ƒÿ∞ƒ∞∏Ã∞ƒ§ÅâΩ—†ÏÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµΩâ•±îµëΩç¨Äπ±ÃµëΩç¨µç…ïÖ—îÅÏÅΩŸï…ô±Ω‹ÈŸ•Õ•â±îÌâÖç≠ù…Ω’πêÈ—…ÖπÕ¡Ö…ïπ–Ö•µ¡Ω…—Öπ–ÌâΩ‡µÕ°ÖëΩ‹ÈπΩπîÖ•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµΩâ•±îµëΩç¨Äπ±ÃµëΩç¨µç…ïÖ—îËÈÖô—ï»ÅÏÅë•Õ¡±Ö‰ÈπΩπîÏÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µëΩç¨µç…ïÖ—îµçΩ…îÅÏ(ÄÄÄÄÄÄÄÅ›•ë—†Ë–’¡‡Ì°ï•ù°–Ë–’¡‡ÌµÖ…ù•∏µ—Ω¿Ë¥»’¡‡Ìë•Õ¡±Ö‰Èù…•êÌ¡±Öçîµ•—ïµÃÈçïπ—ï»ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†»‘‘∞»Ãƒ∞ƒ‘‰∞∏‘‡§ÌâΩ…ëï»µ…Öë•’ÃËƒŸ¡‡Ï(ÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú∞çôôî‘‰–∞çê–ÂÑ»‰Ä‘‡î∞çôò‘‘—å§ÌçΩ±Ω»Ëåƒ‘ƒ¿¡ÑÏ(ÄÄÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ¡¡‡Ä»›¡‡Å…ùâÑ†¿∞¿∞¿∞∏–»§∞¿Ä¿Ä¿Ä’¡‡Å…ùâÑ†‰∞ƒ¿∞ƒÃ∞∏‰§±•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏‘‡§Ï(ÄÄÄÄÄÄÄÅ—…ÖπÕôΩ…¥È…Ω—Ö—î†–’ëïú§Ì—…ÖπÕ•—•Ω∏È—…ÖπÕôΩ…¥Ä∏…ÃÅç’â•åµâïÈ•ï»†∏»∞∏‡∞∏»∞ƒ§Ï(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µëΩç¨µç…ïÖ—îµçΩ…îÅÕŸúÅÏÅ›•ë—†Ë»—¡‡Ì°ï•ù°–Ë»—¡‡Ìô•±∞ÈπΩπîÌÕ—…Ω≠îÈç’……ïπ—Ω±Ω»ÌÕ—…Ω≠îµ›•ë—†Ë»ÌÕ—…Ω≠îµ±•πïçÖ¿È…Ω’πêÌ—…ÖπÕôΩ…¥È…Ω—Ö—î†¥–’ëïú§ÏÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµëΩç¨µç…ïÖ—îπÖç—•ŸîÄπ±Ã‹µëΩç¨µç…ïÖ—îµçΩ…îÅÏÅ—…ÖπÕôΩ…¥È…Ω—Ö—î†–’ëïú§ÅÕçÖ±î†ƒ∏¿‹§ÌâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ…¡‡ÄÃ…¡‡Å…ùâÑ†¿∞¿∞¿∞∏–‡§∞¿Ä¿Ä¿Ä’¡‡Å…ùâÑ†‰∞ƒ¿∞ƒÃ∞∏‰»§∞¿Ä¿Ä»…¡‡Å…ùâÑ†»‘‘∞‡‘∞‹ÿ∞∏»–§±•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏ÿ»§ÏÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµΩâ•±îµëΩç¨Äπ±ÃµëΩç¨µç…ïÖ—îÅÕµÖ±∞ÅÏÅµÖ…ù•∏µ—Ω¿Ë…¡‡ÌçΩ±Ω»Ëçê·ëëî–ÏÅÙ(ÄÄÄÄÄÅ≠ïÂô…ÖµïÃÅ±Ã›Ωç≠%çΩπ%∏ÅÏÅô…ΩµÌ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ïd†Õ¡‡§ÅÕçÖ±î†∏‡ÿ§ÌΩ¡Öç•—‰Ë∏›ı—ΩÌ—…ÖπÕôΩ…¥ÈπΩπîÌΩ¡Öç•—‰Ë≈ÙÅÙ(ÄÄÄÅÙ((ÄÄÄÄº®Å5ïëÖ±±ÖÃÅ1•ŸïMç…Ω±∞Ä‹É
‹Åµï—Ö∞∞Åù…ÖâÖëº∞Å…ï±•ïŸîÅ‰Å—ï·—’…ÑÅ¡Ω»Å…Ö…ïÈÑÄ®º(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµï≈’•¡¡ïêµµïëÖ∞∞(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµÕ—Ω…îµâÖëùîµ•çΩ∏∞(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµïëÖ∞µëï—Ö•∞µ•çΩ∏∞(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµïëÖ∞µ¡•ç≠ï»µ•çΩ∏ÅÏ(ÄÄÄÄÄÄ¥µ±Ã‹µµïëÖ∞µÑËçî›ïâïòÏ¥µ±Ã‹µµïëÖ∞µàËåÿ‰‹ƒ›åÏ¥µ±Ã‹µµïëÖ∞µïëùîËççâê…ê‰Ï¥µ±Ã‹µµïëÖ∞µù±Ω‹È…ùâÑ†»¿Ã∞»ƒ¿∞»ƒ‹∞∏ƒ–§Ï(ÄÄÄÄÄÅ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌ•ÕΩ±Ö—•Ω∏È•ÕΩ±Ö—îÌâΩ…ëï»µçΩ±Ω»ÈŸÖ»†¥µ±Ã‹µµïëÖ∞µïëùî§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêË(ÄÄÄÄÄÄÄÅ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä»‰îÄ»¿î±…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏‡¿§Ä¿ÄÃî±…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏ƒ‡§Ä‰î±—…ÖπÕ¡Ö…ïπ–Ä»–î§∞(ÄÄÄÄÄÄÄÅ…ï¡ïÖ—•πúµçΩπ•åµù…Öë•ïπ–°ô…Ω¥Äƒ·ëïú±…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿‘‘§Ä¿Ä—ëïú±…ùâÑ†¿∞¿∞¿∞∏¿Ã‘§Ä—ëïúÄ·ëïú§∞(ÄÄÄÄÄÄÄÅ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‘¿îÄ–‡î±ŸÖ»†¥µ±Ã‹µµïëÖ∞µÑ§±ŸÖ»†¥µ±Ã‹µµïëÖ∞µà§Ä‹–î∞å»Ã»ÿ…åÄƒ¿¿î§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹Ë(ÄÄÄÄÄÄÄÅ•πÕï–Ä¿Ä¿Ä¿Ä…¡‡Å…ùâÑ†‡∞‰∞ƒ»∞∏Ã–§±•πÕï–Ä¿Ä¿Ä¿Ä—¡‡Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿‡‘§∞(ÄÄÄÄÄÄÄÅ•πÕï–ÄÕ¡‡Ä—¡‡Ä·¡‡Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏ƒ»§±•πÕï–Ä¥—¡‡Ä¥’¡‡ÄÂ¡‡Å…ùâÑ†¿∞¿∞¿∞∏––§∞(ÄÄÄÄÄÄÄÄ¿Ä·¡‡Äƒ›¡‡Å…ùâÑ†¿∞¿∞¿∞∏–¿§∞¿Ä¿Ä»…¡‡ÅŸÖ»†¥µ±Ã‹µµïëÖ∞µù±Ω‹§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅ—ï·–µÕ°ÖëΩ‹Ë¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏Ã‡§∞¿Ä…¡‡Ä’¡‡Å…ùâÑ†¿∞¿∞¿∞∏‘ÿ§Ï(ÄÄÄÄÄÅô•±—ï»ÈÕÖ—’…Ö—î†ƒ∏¿‡§ÅçΩπ—…ÖÕ–†ƒ∏¿–§Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµïëÖ∞µ…Ö…•—‰µ…Ö…Ñ∞(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ…Ö…•—‰µ…Ö…ÑÅÏÄ¥µ±Ã‹µµïëÖ∞µÑËçê›ò’ôòÏ¥µ±Ã‹µµïëÖ∞µàËå»Ã‡›Ñ‡Ï¥µ±Ã‹µµïëÖ∞µïëùîËå‡Õî…ôòÏ¥µ±Ã‹µµïëÖ∞µù±Ω‹È…ùâÑ†‹¿∞»¿»∞»–ƒ∞∏»‡§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµïëÖ∞µ…Ö…•—‰µï¡•çÑ∞(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ…Ö…•—‰µï¡•çÑÅÏÄ¥µ±Ã‹µµïëÖ∞µÑËçïôêÂôòÏ¥µ±Ã‹µµïëÖ∞µàËåŸò…ÖÑƒÏ¥µ±Ã‹µµïëÖ∞µïëùîËçê‘ÂçôòÏ¥µ±Ã‹µµïëÖ∞µù±Ω‹È…ùâÑ†ƒ‰¿∞ƒ¿ƒ∞»‘‘∞∏Ãƒ§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµïëÖ∞µ…Ö…•—‰µ±ïùïπëÖ…•Ñ∞(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ…Ö…•—‰µ±ïùïπëÖ…•ÑÅÏÄ¥µ±Ã‹µµïëÖ∞µÑËçôôò¡Ñ‡Ï¥µ±Ã‹µµïëÖ∞µàËçàƒŸê¿‰Ï¥µ±Ã‹µµïëÖ∞µïëùîËçôôêÿ’îÏ¥µ±Ã‹µµïëÖ∞µù±Ω‹È…ùâÑ†»––∞ƒ‰¿∞–‡∞∏Ã–§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµïëÖ∞µ…Ö…•—‰µï·ç±’Õ•ŸÑ∞(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ…Ö…•—‰µï·ç±’Õ•ŸÑÅÏÄ¥µ±Ã‹µµïëÖ∞µÑËçôôê—ëòÏ¥µ±Ã‹µµïëÖ∞µàËçÑÃ…î‘‹Ï¥µ±Ã‹µµïëÖ∞µïëùîËçôò·ëÖÑÏ¥µ±Ã‹µµïëÖ∞µù±Ω‹È…ùâÑ†»‘‘∞‡‹∞ƒÃ‹∞∏Ã–§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµïëÖ∞µ…Ö…•—‰µµ•—•çÑ∞(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµ…Ö…•—‰µµ•—•çÑÅÏ(ÄÄÄÄÄÄ¥µ±Ã‹µµïëÖ∞µÑËçôôçå‹ÃÏ¥µ±Ã‹µµïëÖ∞µàËçÑ‹¡ê»‹Ï¥µ±Ã‹µµïëÖ∞µïëùîËçôòÕå—òÏ¥µ±Ã‹µµïëÖ∞µù±Ω‹È…ùâÑ†»‘‘∞–»∞ÿ‹∞∏‘¿§Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêË(ÄÄÄÄÄÄÄÅ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä»‰îÄƒ‡î±…ùâÑ†»‘‘∞»–‘∞ƒ‡Ã∞∏‡‡§Ä¿ÄÃî±…ùâÑ†»‘‘∞ƒ‰–∞ƒ¿Ã∞∏»»§Ä‰î±—…ÖπÕ¡Ö…ïπ–Ä»Ãî§∞(ÄÄÄÄÄÄÄÅ…ï¡ïÖ—•πúµçΩπ•åµù…Öë•ïπ–°ô…Ω¥Äƒ…ëïú±…ùâÑ†»‘‘∞»ƒ»∞‰Ã∞∏ƒ–§Ä¿Ä’ëïú±…ùâÑ†‹‘∞¿∞ƒÃ∞∏¿‰§Ä’ëïúÄƒ¡ëïú§∞(ÄÄÄÄÄÄÄÅ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‘¿îÄ–‡î∞çôôâê‘ÿ∞çåÃƒ‘Ã‘Ä‘‡î∞å’ê¿‹ƒ‹Ä‡Ãî∞çêÂÑÿ…àÄƒ¿¿î§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµï≈’•¡¡ïêµµïëÖ∞ÅÏÅôΩπ–µÕ•ÈîËƒ·¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµï≈’•¡¡ïêµµïëÖ∞Ä¯Ä®±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµÕ—Ω…îµâÖëùîµ•çΩ∏Ä¯Ä®ÅÏÅ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡Ë»ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµÕ—Ω…îµâÖëùîµ•çΩ∏ÅÏÅ›•ë—†Ë‹Ÿ¡‡Ì°ï•ù°–Ë‹Ÿ¡‡ÌâΩ…ëï»µ›•ë—†Ë…¡‡ÌôΩπ–µÕ•ÈîËÃÂ¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµïëÖ∞µëï—Ö•∞µ•çΩ∏ÅÏÅ›•ë—†Ë‡·¡‡Ì°ï•ù°–Ë‡·¡‡ÌâΩ…ëï»µ›•ë—†Ë…¡‡ÌôΩπ–µÕ•ÈîË–·¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµïëÖ∞µ¡•ç≠ï»µ•çΩ∏ÅÏÅ›•ë—†Ë–Õ¡‡Ì°ï•ù°–Ë–Õ¡‡Ìë•Õ¡±Ö‰Èù…•êÌ¡±Öçîµ•—ïµÃÈçïπ—ï»ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÌâΩ…ëï»µ…Öë•’ÃË‘¿îÌôΩπ–µÕ•ÈîË»’¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±ÃµµïëÖ∞µ¡•ç≠ï»µ•—ï¥ÅÏÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ‘’ëïú±…ùâÑ†Ã‹∞Ã‰∞–ÿ∞∏‰¿§±…ùâÑ†ƒ–∞ƒ‘∞ƒ‰∞∏‰–§§ÌâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿Ã‘§∞¿ÄÂ¡‡Ä»…¡‡Å…ùâÑ†¿∞¿∞¿∞∏ƒ‡§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ãµï≈’•¡¡ïêµµïëÖ∞È°ΩŸï»ÅÏÅ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ïd†¥Õ¡‡§Å…Ω—Ö—ï`†›ëïú§Å…Ω—Ö—ïd†¥Ÿëïú§ÅÕçÖ±î†ƒ∏¿‡§ÏÅÙ(ÄÄÄÅ≠ïÂô…ÖµïÃÅ±Ã›M›•¡ï1ïô–ÅÏÅ—ΩÌΩ¡Öç•—‰Ë∏‘‘Ì—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—îÕê†¥»…¡‡∞¿∞¿§ÅÕçÖ±î†∏‰‰‘•ÙÅÙ(ÄÄÄÅ≠ïÂô…ÖµïÃÅ±Ã›M›•¡ïI•ù°–ÅÏÅ—ΩÌΩ¡Öç•—‰Ë∏‘‘Ì—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—îÕê†»…¡‡∞¿∞¿§ÅÕçÖ±î†∏‰‰‘•ÙÅÙ(ÄÄÄÅµïë•Ñ°µÖ‡µ›•ë—†Ë‹¿¡¡‡§ÅÏ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπôïïêµÖç—•ΩπÃÅÏÅ…•ù°–Ë·¡‡Ö•µ¡Ω…—Öπ–Ì¡Öëë•πúËŸ¡‡Ä’¡‡ÏÅÙ(ÄÄÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπôïïêµÖç—•Ω∏µâ—∏ÅÏÅ›•ë—†Ë–Ÿ¡‡Ö•µ¡Ω…—Öπ–Ìµ•∏µ°ï•ù°–Ë–Ÿ¡‡Ö•µ¡Ω…—Öπ–Ì°ï•ù°–Ë–Ÿ¡‡Ö•µ¡Ω…—Öπ–ÌâΩ…ëï»µ…Öë•’ÃËƒ’¡‡Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅÙ(ÄÅÄÏ(ÄÅëΩç’µïπ–π°ïÖêπÖ¡¡ïπë°•±ê°Õ—Â±î§Ï)Ù()ïπÕ’…ï1•ŸïMç…Ω±∞›I’π—•µïM—Â±ïÃ†§Ï((ººÄ‹∏¿∏ƒÉ
‹Å%9Q%Å3%QI%(ººÅÕ—ÑÅçÖ¡ÑÅïÕ”ÑÅÖ∞Åô•πÖ∞ÅÑÅ¡…Ω√ÕÕ•—ºËÅ…ïïµ¡±ÖÈÑÅ±ÑÅ¡…’ïâÑÅ…Ω©ÑÅÖπ—ï…•Ω»(ººÉÈπ•çÖµïπ—îÅëïπ—…ºÅëîÅ±ÑÅA,Å1•ŸïMç…Ω±∞Ä‹∏)ô’πç—•Ω∏ÅïπÕ’…ï1•ŸïMç…Ω±∞›±ïç—…•ç%ëïπ—•—‰†§ÅÏ(ÄÅ•òÄ†Ö•Õ1•ŸïMç…Ω±∞›¡¿†§ÅÒÅëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±Ã›±ïç—…•ç%ëïπ—•—‰‹¿ƒà§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÕ—Â±îÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âÕ—Â±îà§Ï(ÄÅÕ—Â±îπ•êÄÙÄâ±Ã›±ïç—…•ç%ëïπ—•—‰‹¿ƒàÏ(ÄÅÕ—Â±îπ—ï·—Ωπ—ïπ–ÄÙÅÄ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅÏ(ÄÄÄÄÄÄ¥µ±Ã‹µçÂÖ∏ËåÃÂî›ôòÏ¥µ±Ã‹µâ±’îËå»‘‡·ôòÏ¥µ±Ã‹µŸ•Ω±ï–Ëå·Ñ‘’ôòÏ¥µ±Ã‹µùΩ±êËçôôêÿŸàÏ(ÄÄÄÄÄÄ¥µ•π¨Ëå¿»¿ÿƒ¿Ï¥µ¡Öπï∞Ëå¿‹ƒ–»ÿÏ¥µ¡Öπï∞¥»Ëå¡à≈êÃ‘Ï¥µùΩ±êËåÃÂî›ôòÏ¥µùΩ±êµë•¥Ëå»‘‡·ôòÏ(ÄÄÄÄÄÄ¥µù…ïï∏ËåÃÂî›ôòÏ¥µ…ïêËå·Ñ‘’ôòÏ¥µ—ï·–Ëçò’ôâôòÏ¥µ—ï·–µë•¥ËåÂïàŸêƒÏ¥µâΩ…ëï»Ëåƒ‡ÕàÿƒÏ(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅâΩë‰ÅÏ(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‡îÄ¥‘î±…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒÿ§±—…ÖπÕ¡Ö…ïπ–Ä»‡î§±…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Äƒ¿‡îÄ»»î±…ùâÑ†ƒÃ‡∞‡‘∞»‘‘∞∏ƒ‡§±—…ÖπÕ¡Ö…ïπ–ÄÃƒî§±±•πïÖ»µù…Öë•ïπ–†ƒ‘’ëïú∞å¿»¿ÿƒ¿∞å¿ÿƒƒ»–Ä‘‘î∞å¿Ã¿‹ƒÃ§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅπÖÿÅÏÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»¿§Ö•µ¡Ω…—Öπ–ÌâÖç≠ù…Ω’πêÈ…ùâÑ†»∞‡∞»¿∞∏‡‡§Ö•µ¡Ω…—Öπ–ÌâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ—¡‡Ä–—¡‡Å…ùâÑ†¿∞¿∞¿∞∏Ã‡§∞¿Ä¿Ä–¡¡‡Å…ùâÑ†Ã‹∞ƒÃÿ∞»‘‘∞∏¿‘‘§Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÅπÖÿÅÏÅ—Ω¿ÈµÖ‡†Ã¡¡‡±çÖ±å°ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µ—Ω¿§Ä¨ÄŸ¡‡§§Ö•µ¡Ω…—Öπ–ÌµÖ…ù•∏µ—Ω¿ÈµÖ‡†Ã¡¡‡±çÖ±å°ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µ—Ω¿§Ä¨ÄŸ¡‡§§Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄππÖÿµâ…ÖπêµÕç…Ω±∞ÅÏÅçΩ±Ω»ËåÃÂî›ôòÖ•µ¡Ω…—Öπ–Ì—ï·–µÕ°ÖëΩ‹Ë¿Ä¿Äƒ·¡‡Å…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏Ã‘§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄππÖÿµâ…ÖπêÅàÅÏÅçΩ±Ω»ËçïÖôâôòÖ•µ¡Ω…—Öπ–ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú∞å»‘‡·ôò∞å·Ñ‘’ôò§Ö•µ¡Ω…—Öπ–ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†ƒ»¿∞»»ÿ∞»‘‘∞∏‘‘§Ö•µ¡Ω…—Öπ–ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä»¡¡‡Å…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»‡§Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπôΩ…¥µçÖ…ê±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπŸ•ëïºµçÖ…ê±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπÖ’—†µâΩ‡ÅÏÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒ‘§Ö•µ¡Ω…—Öπ–ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†‡∞»‡∞‘»∞∏‰ÿ§±…ùâÑ†–∞ƒ¿∞»‘∞∏‰‡§§Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπâ—∏ÅÏÅçΩ±Ω»ËçôôòÖ•µ¡Ω…—Öπ–ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ»’ëïú∞åƒÿ·çî‡∞åÿ‡—ëôòÄ‘‡î∞å»›ê·ïî§Ö•µ¡Ω…—Öπ–ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†ƒ»¿∞»»‰∞»‘‘∞∏–¿§Ö•µ¡Ω…—Öπ–ÌâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ¡¡‡ÄÃ¡¡‡Å…ùâÑ†Ã‹∞ƒÃÿ∞»‘‘∞∏ƒ‡§Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπâ—∏µΩ’—±•πîÅÏÅçΩ±Ω»ËçëôôÖôòÖ•µ¡Ω…—Öπ–ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»‡§Ö•µ¡Ω…—Öπ–ÌâÖç≠ù…Ω’πêÈ…ùâÑ†»‹∞ƒ»¿∞ƒ‰¿∞∏¿‡§Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄππÖÿµ±•π≠ÃÅâ’——Ω∏πÖç—•ŸîÅÏÅçΩ±Ω»Ëçî›ôâôòÖ•µ¡Ω…—Öπ–ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÃ’ëïú±…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒÃ§±…ùâÑ†ƒÃ‡∞‡‘∞»‘‘∞∏ƒƒ§§Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄππÖÿµ±•π≠ÃÅâ’——Ω∏πÖç—•ŸîËÈÖô—ï»ÅÏÅâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†‰¡ëïú∞åÃÂî›ôò∞å»‘‡·ôò∞å·Ñ‘’ôò∞çôôêÿŸà§Ö•µ¡Ω…—Öπ–ÏÅÙ((ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ¡…Ωô•±îÅÏ(ÄÄÄÄÄÅ•ÕΩ±Ö—•Ω∏È•ÕΩ±Ö—îÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏Ã¿§Ö•µ¡Ω…—Öπ–ÌâΩ…ëï»µ…Öë•’ÃË»·¡‡Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêÈ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‰¿îÄ–î±…ùâÑ†ƒÃ‡∞‡‘∞»‘‘∞∏»»§±—…ÖπÕ¡Ö…ïπ–ÄÃ–î§±…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‘îÄ‹»î±…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒ–§±—…ÖπÕ¡Ö…ïπ–ÄÃ‘î§±±•πïÖ»µù…Öë•ïπ–†ƒ‘¡ëïú∞å¿‰≈êÃ‡∞å¿‘¡àƒ‰Äÿ»î∞åƒ¿¡Ñ»‰§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿‹§∞¿Ä»…¡‡Äÿ’¡‡Å…ùâÑ†¿∞¿∞¿∞∏–¿§∞¿Ä¿Ä‘¡¡‡Å…ùâÑ†Ã‹∞ƒÃÿ∞»‘‘∞∏¿‡§Ö•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ¡…Ωô•±îËÈâïôΩ…îÅÏÅçΩπ—ïπ–ËààÌ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÌ•πÕï–Ë¿ÌËµ•πëï‡Ë¿Ì¡Ω•π—ï»µïŸïπ—ÃÈπΩπîÌΩ¡Öç•—‰Ë∏Ã–ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒƒ’ëïú±—…ÖπÕ¡Ö…ïπ–Ä¿Ä–»î±…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒ»§Ä–Ãî±—…ÖπÕ¡Ö…ïπ–Ä––îÄ‘‘î±…ùâÑ†ƒÃ‡∞‡‘∞»‘‘∞∏ƒ¿§Ä‘ÿî±—…ÖπÕ¡Ö…ïπ–Ä‘‹î§ÌâÖç≠ù…Ω’πêµÕ•ÈîËƒ‡¿îÄƒ¿¿îÌÖπ•µÖ—•Ω∏È±Ã›A…Ωô•±ïMçÖ∏ÄŸÃÅ±•πïÖ»Å•πô•π•—îÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ¡…Ωô•±îÄπ¡…Ωô•±îµçΩŸï»ÅÏÅµ•∏µ°ï•ù°–Ëƒÿ—¡‡ÌâΩ…ëï»µâΩ——Ω¥Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»»§Ö•µ¡Ω…—Öπ–ÌâÖç≠ù…Ω’πêµçΩ±Ω»Ëå¿ÿƒ‘»‰ÌâÖç≠ù…Ω’πêµ•µÖùîÈ±•πïÖ»µù…Öë•ïπ–†ƒ»¡ëïú±…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒ»§±…ùâÑ†Ã‹∞ƒÃÿ∞»‘‘∞∏¿–§±…ùâÑ†ƒÃ‡∞‡‘∞»‘‘∞∏ƒÿ§§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ¡…Ωô•±îµïµâ±ï¥ÅÏÅ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÌ…•ù°–Ëƒ’¡‡Ì—Ω¿Ëƒ¿·¡‡ÌËµ•πëï‡ËÿÌ›•ë—†ËÿŸ¡‡Ì°ï•ù°–ËÿŸ¡‡ÌΩâ©ïç–µô•–ÈçΩπ—Ö•∏Ìô•±—ï»Èë…Ω¿µÕ°ÖëΩ‹†¿Ä¿Äƒ—¡‡Å…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ÿ‘§§Åë…Ω¿µÕ°ÖëΩ‹†¿Ä¿Ä»·¡‡Å…ùâÑ†ƒÃ‡∞‡‘∞»‘‘∞∏Ã¿§§ÌÖπ•µÖ—•Ω∏È±Ã›µâ±ïµ±ΩÖ–ÄÃ∏’ÃÅïÖÕîµ•∏µΩ’–Å•πô•π•—îÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ¡…Ωô•±îÄπ¡…Ωô•±îµÖŸÖ—Ö»µ…•πúÅÏÅ¡Öëë•πúËÕ¡‡Ö•µ¡Ω…—Öπ–ÌâΩ…ëï»Ë¿Ö•µ¡Ω…—Öπ–ÌâÖç≠ù…Ω’πêÈçΩπ•åµù…Öë•ïπ–°ô…Ω¥ÄÃ¡ëïú∞åÃÂî›ôò∞å»‘‡·ôò∞å·Ñ‘’ôò∞çôôêÿŸà∞åÃÂî›ôò§Ö•µ¡Ω…—Öπ–ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä¿Ä’¡‡Å…ùâÑ†‘∞ƒ–∞Ãƒ∞∏‰»§∞¿Ä¿ÄÃ…¡‡Å…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏Ã‘§Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ¡…Ωô•±îÄπ¡…Ωô•±îµπÖµîµâ±Ωç¨Å†ƒÅÏÅçΩ±Ω»Ëçò·ôëôòÌ±ï——ï»µÕ¡Öç•πúË¥∏¿—ï¥Ì—ï·–µÕ°ÖëΩ‹Ë¿Ä¿Ä»…¡‡Å…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒ‘§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ¡…Ωô•±îÄπ¡…Ωô•±îµ…Ω±îµâÖëùîÅÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»ÿ§ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†‰¡ëïú±…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒƒ§±…ùâÑ†ƒÃ‡∞‡‘∞»‘‘∞∏ƒ¿§§ÌçΩ±Ω»ËççÖò·ôòÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ¡…Ωô•±îÄπ¡…Ωô•±îµâ•ºÅÏÅçΩ±Ω»ËçåŸê·ïÑÌ±•πîµ°ï•ù°–Ëƒ∏ÿÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ¡…Ωô•±îÄπÕ—Ö–µ¡•±∞ÅÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒ‡§Ö•µ¡Ω…—Öπ–ÌâΩ…ëï»µ…Öë•’ÃËƒŸ¡‡Ö•µ¡Ω…—Öπ–ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†ƒ‹∞‘‘∞‡‰∞∏‘»§±…ùâÑ†‡∞ƒ‘∞Ã–∞∏‹»§§Ö•µ¡Ω…—Öπ–ÌâΩ‡µÕ°ÖëΩ‹È•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿Ã‘§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ¡…Ωô•±îÄπÕ—Ö–µ¡•±∞Äππ’¥ÅÏÅçΩ±Ω»Ëå‹…ïôôòÖ•µ¡Ω…—Öπ–Ì—ï·–µÕ°ÖëΩ‹Ë¿Ä¿Äƒ—¡‡Å…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»‡§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ¡…Ωô•±îµÕïç—•Ω∏ÅÏÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒ¿§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ¡…Ωô•±îµÕïç—•Ω∏µ°ïÖêÄπ•çºÅÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»¿§ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒƒ§±…ùâÑ†ƒÃ‡∞‡‘∞»‘‘∞∏¿‰§§ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Äƒ·¡‡Å…ùâÑ†Ã‹∞ƒÃÿ∞»‘‘∞∏¿‹§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπŸ•ëïºµù…•êµ—•±îÅÏÅâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒ‘§ÌâΩ…ëï»µ…Öë•’ÃËƒ·¡‡ÌΩŸï…ô±Ω‹È°•ëëï∏ÌâÖç≠ù…Ω’πêËå¿‹ƒÃ»ÿÌâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ…¡‡Ä»·¡‡Å…ùâÑ†¿∞¿∞¿∞∏»‡§Ì—…ÖπÕ•—•Ω∏È—…ÖπÕôΩ…¥Ä∏…ÃÅïÖÕî±âΩ…ëï»µçΩ±Ω»Ä∏…ÃÅïÖÕî±âΩ‡µÕ°ÖëΩ‹Ä∏…ÃÅïÖÕîÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπŸ•ëïºµù…•êµ—•±îÈÖç—•ŸîÅÏÅ—…ÖπÕôΩ…¥ÈÕçÖ±î†∏‰ÿ‘§ÌâΩ…ëï»µçΩ±Ω»È…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏‘»§ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä»·¡‡Å…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒÿ§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ¡…Ωô•±îÅÏÅµÖ…ù•∏Ëƒ·¡‡Ä¿Ä»…¡‡Ì¡Öëë•πúËƒ·¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»»§ÌâΩ…ëï»µ…Öë•’ÃË»Ÿ¡‡ÌâÖç≠ù…Ω’πêÈ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä–îÄ¿±…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒ¿§±—…ÖπÕ¡Ö…ïπ–ÄÃ¿î§±±•πïÖ»µù…Öë•ïπ–†ƒ‘¡ëïú±…ùâÑ†‡∞»‡∞‘Ã∞∏‰ÿ§±…ùâÑ†‘∞‰∞»Ã∞∏‰‡§§ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä»¡¡‡Ä–·¡‡Å…ùâÑ†¿∞¿∞¿∞∏»‡§±•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿–§ÌΩŸï…ô±Ω‹È°•ëëï∏Ì¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ¡…Ωô•±îËÈÖô—ï»ÅÏÅçΩπ—ïπ–ËààÌ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÌ•πÕï–Ë¥ÿ¿îÄ¥Ã¿îÌ¡Ω•π—ï»µïŸïπ—ÃÈπΩπîÌâÖç≠ù…Ω’πêÈçΩπ•åµù…Öë•ïπ–°ô…Ω¥Ä‰¡ëïú±—…ÖπÕ¡Ö…ïπ–±…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏¿ÿ§±—…ÖπÕ¡Ö…ïπ–Äƒ‡î±…ùâÑ†ƒÃ‡∞‡‘∞»‘‘∞∏¿ÿ§±—…ÖπÕ¡Ö…ïπ–ÄÃÿî§ÌÖπ•µÖ—•Ω∏È±Ã›1•Ÿ•πù=…â•–ÄƒÕÃÅ±•πïÖ»Å•πô•π•—îÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ°ïÖê±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµù…•êÅÏÅ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡ËƒÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ°ïÖêÅÏÅë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈô±ï‡µïπêÌ©’Õ—•ô‰µçΩπ—ïπ–ÈÕ¡Öçîµâï—›ïï∏ÌùÖ¿Ëƒ…¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ°ïÖêÅÕµÖ±∞ÅÏÅçΩ±Ω»Ëå‘’ïÖôòÌôΩπ–Ë‰¿¿Ä·¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏ƒ›ï¥ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ°ïÖêÅ†»ÅÏÅµÖ…ù•∏Ë—¡‡Ä¿Ä¿ÌôΩπ–µÕ•ÈîË»—¡‡Ì±ï——ï»µÕ¡Öç•πúË¥∏¿–’ï¥ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ°ïÖêÄ¯ÅÕ¡Ö∏ÅÏÅë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌùÖ¿Ë›¡‡Ì¡Öëë•πúË›¡‡ÄÂ¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»¿§ÌâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡ÌçΩ±Ω»ËçÑÂå›ëòÌôΩπ–Ë‡‘¿Ä›¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏¿Âï¥ÌâÖç≠ù…Ω’πêÈ…ùâÑ†–∞ƒ–∞Ã¿∞∏‹»§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ°ïÖêÄ¯ÅÕ¡Ö∏Å§ÅÏÅ›•ë—†Ë›¡‡Ì°ï•ù°–Ë›¡‡ÌâΩ…ëï»µ…Öë•’ÃË‘¿îÌâÖç≠ù…Ω’πêËåÃÂî›ôòÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿ÄƒÕ¡‡ÄåÃÂî›ôòÌÖπ•µÖ—•Ω∏È±Ã›M•ùπÖ±A’±ÕîÄƒ∏ŸÃÅïÖÕîµ•∏µΩ’–Å•πô•π•—îÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ°ïÖêÄ¯ÅÕ¡Ö∏π•Ãµ±•ŸîÅ§ÅÏÅâÖç≠ù…Ω’πêËçôôêÿŸàÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Äƒ’¡‡ÄçôôêÿŸàÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ°ïÖêµÖç—•ΩπÃÅÏÅë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌùÖ¿Ë·¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ°ïÖêµÖç—•ΩπÃÄ¯ÅÕ¡Ö∏ÅÏÅë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌùÖ¿Ë›¡‡Ì¡Öëë•πúË›¡‡ÄÂ¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»¿§ÌâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡ÌçΩ±Ω»ËçÑÂå›ëòÌôΩπ–Ë‡‘¿Ä›¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏¿Âï¥ÌâÖç≠ù…Ω’πêÈ…ùâÑ†–∞ƒ–∞Ã¿∞∏‹»§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ°ïÖêµÖç—•ΩπÃÄ¯ÅÕ¡Ö∏Å§ÅÏÅ›•ë—†Ë›¡‡Ì°ï•ù°–Ë›¡‡ÌâΩ…ëï»µ…Öë•’ÃË‘¿îÌâÖç≠ù…Ω’πêËåÃÂî›ôòÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿ÄƒÕ¡‡ÄåÃÂî›ôòÌÖπ•µÖ—•Ω∏È±Ã›M•ùπÖ±A’±ÕîÄƒ∏ŸÃÅïÖÕîµ•∏µΩ’–Å•πô•π•—îÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ¡…Ωô•±îµç’Õ—Ωµ•Èîµâ—∏ÅÏÅµ•∏µ°ï•ù°–ËÃ≈¡‡Ì¡Öëë•πúË¿Äƒ≈¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†ƒÃ‡∞‡‘∞»‘‘∞∏Ã‘§ÌâΩ…ëï»µ…Öë•’ÃË‰‰Â¡‡ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒÃ’ëïú±…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒ¿§±…ùâÑ†ƒÃ‡∞‡‘∞»‘‘∞∏ƒÿ§§ÌçΩ±Ω»ËçîÂôÖôòÌôΩπ–Ë‡‘¿Ä·¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏¿›ï¥Ìç’…ÕΩ»È¡Ω•π—ï»ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµù…•êÅÏÅë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈµ•πµÖ‡†¿∞ƒ∏–’ô»§Åµ•πµÖ‡†»»¡¡‡∞∏‘’ô»§ÌùÖ¿ËƒÕ¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µôïÖ—’…ïêµŸ•ëïºÅÏÅµ•∏µ°ï•ù°–Ë»ÿ¡¡‡Ì¡Öëë•πúË¿Ì¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌΩŸï…ô±Ω‹È°•ëëï∏ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»»§ÌâΩ…ëï»µ…Öë•’ÃË»≈¡‡ÌâÖç≠ù…Ω’πêËå¿–¡ÑƒÿÌçΩ±Ω»ËçôôòÌ—ï·–µÖ±•ù∏È±ïô–Ìç’…ÕΩ»È¡Ω•π—ï»ÌâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ·¡‡ÄÃ’¡‡Å…ùâÑ†¿∞¿∞¿∞∏Ã¿§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µôïÖ—’…ïêµçΩŸï»±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µôïÖ—’…ïêµçΩŸï»Ä¯Ä®ÅÏÅ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÖ•µ¡Ω…—Öπ–Ì•πÕï–Ë¿Ö•µ¡Ω…—Öπ–Ì›•ë—†Ëƒ¿¿îÖ•µ¡Ω…—Öπ–Ì°ï•ù°–Ëƒ¿¿îÖ•µ¡Ω…—Öπ–ÌΩâ©ïç–µô•–ÈçΩŸï»Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µôïÖ—’…ïêµÕ°ÖëîÅÏÅ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÌ•πÕï–Ë¿ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ‡¡ëïú±…ùâÑ†Ã∞‹∞ƒ‡∞∏¿‘§±…ùâÑ†Ã∞‡∞ƒ‰∞∏Ã¿§Ä–‘î±…ùâÑ†Ã∞‡∞»¿∞∏‰‘§§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µôïÖ—’…ïêµçΩ¡‰ÅÏÅ¡ΩÕ•—•Ω∏ÈÖâÕΩ±’—îÌ±ïô–Ëƒ›¡‡Ì…•ù°–Ëƒ›¡‡ÌâΩ——Ω¥ËƒŸ¡‡Ìë•Õ¡±Ö‰Èô±ï‡Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÌùÖ¿Ë—¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µôïÖ—’…ïêµçΩ¡‰ÅÕµÖ±∞ÅÏÅçΩ±Ω»Ëåÿ…ïëôòÌôΩπ–Ë‰¿¿Ä·¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏ƒ—ï¥ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µôïÖ—’…ïêµçΩ¡‰ÅÕ—…ΩπúÅÏÅôΩπ–µÕ•ÈîË»¡¡‡Ì±•πîµ°ï•ù°–Ëƒ∏ƒ‘Ì—ï·–µÕ°ÖëΩ‹Ë¿Ä…¡‡Äƒ¡¡‡Äå¿¿¿ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µôïÖ—’…ïêµçΩ¡‰ÅÕ¡Ö∏ÅÏÅçΩ±Ω»Ëçå—êŸîÿÌôΩπ–µÕ•ÈîËƒ¡¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µôïÖ—’…ïêµïµ¡—‰ÅÏÅµ•∏µ°ï•ù°–Ë»–¡¡‡Ìë•Õ¡±Ö‰Èô±ï‡Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÌÖ±•ù∏µ•—ïµÃÈô±ï‡µÕ—Ö…–Ì©’Õ—•ô‰µçΩπ—ïπ–Èçïπ—ï»ÌùÖ¿Ëƒ¡¡‡Ì¡Öëë•πúË»—¡‡ÌâΩ…ëï»Ë≈¡‡ÅëÖÕ°ïêÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏Ã¿§ÌâΩ…ëï»µ…Öë•’ÃË»≈¡‡ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏¿ÿ§±…ùâÑ†ƒÃ‡∞‡‘∞»‘‘∞∏¿‘§§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µôïÖ—’…ïêµïµ¡—‰ÅàÅÏÅôΩπ–µÕ•ÈîË»≈¡‡ÏÅı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µôïÖ—’…ïêµïµ¡—‰ÅÕ¡Ö∏ÅÏÅçΩ±Ω»ËåÂïàŸêƒÌôΩπ–µÕ•ÈîËƒ…¡‡Ì±•πîµ°ï•ù°–Ëƒ∏‘ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•ŸîµëÖ—ÑÅÏÅë•Õ¡±Ö‰Èô±ï‡Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÌùÖ¿Ëƒ¡¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•ŸîµëÖ—ÑÄ¯Åë•ÿ±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•ŸîµëÖ—ÑÄ¯Å¿ÅÏÅµÖ…ù•∏Ë¿Ì¡Öëë•πúËƒÕ¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒ–§ÌâΩ…ëï»µ…Öë•’ÃËƒŸ¡‡ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†»»∞‘‰∞‰–∞∏Ã‘§±…ùâÑ†‡∞ƒ–∞Ãƒ∞∏‹»§§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•ŸîµëÖ—ÑÄ¯Åë•ÿÈô•…Õ–µç°•±êÅÏÅë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË≈ô»ÅÖ’—ºÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌùÖ¿Ë›¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•ŸîµëÖ—ÑÅÕµÖ±∞ÅÏÅçΩ±Ω»Ëå‡ÂÑŸå»ÌôΩπ–Ë‡‘¿Ä›¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏¿·ï¥ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•ŸîµëÖ—ÑÅÕ—…ΩπúÅÏÅçΩ±Ω»Ëå‹≈ïôôòÌôΩπ–Ë‰¿¿ÄƒÂ¡‡ÄùM¡ÖçîÅ…Ω—ïÕ¨ú±ÕÖπÃµÕï…•òÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•ŸîµëÖ—ÑÄ¯Åë•ÿÈô•…Õ–µç°•±êÄ¯Å§ÅÏÅù…•êµçΩ±’µ∏Ëƒº¥ƒÌ°ï•ù°–Ë—¡‡ÌâΩ…ëï»µ…Öë•’ÃË‰Â¡‡ÌâÖç≠ù…Ω’πêËå¿‹ƒ¿≈òÌΩŸï…ô±Ω‹È°•ëëï∏ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•ŸîµëÖ—ÑÄ¯Åë•ÿÈô•…Õ–µç°•±êÄ¯Å§ÅàÅÏÅë•Õ¡±Ö‰Èâ±Ωç¨Ì°ï•ù°–Ëƒ¿¿îÌâΩ…ëï»µ…Öë•’ÃÈ•π°ï…•–ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†‰¡ëïú∞åÃÂî›ôò∞å»‘‡·ôò∞å·Ñ‘’ôò§ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Äƒ…¡‡Äå»‘‡·ôòÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µëÖ—Ñµ¡Ö•»ÅÏÅë•Õ¡±Ö‰Èù…•êÖ•µ¡Ω…—Öπ–Ìù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË≈ô»Ä≈ô»ÌùÖ¿ËÂ¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µëÖ—Ñµ¡Ö•»ÅÕ¡Ö∏ÅÏÅë•Õ¡±Ö‰Èô±ï‡Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÌùÖ¿ËÕ¡‡Ìµ•∏µ›•ë—†Ë¿ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µëÖ—Ñµ¡Ö•»ÅàÅÏÅçΩ±Ω»ËçïïôâôòÌôΩπ–µÕ•ÈîËƒ’¡‡ÌΩŸï…ô±Ω‹È°•ëëï∏Ì—ï·–µΩŸï…ô±Ω‹Èï±±•¡Õ•ÃÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•ŸîµëÖ—ÑÄ¯Å¿ÅÏÅçΩ±Ω»ËçÑÂå¡ê‹ÌôΩπ–µÕ•ÈîËÂ¡‡Ì±•πîµ°ï•ù°–Ëƒ∏–‘Ìë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌùÖ¿Ë›¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•ŸîµëÖ—ÑÄ¯Å¿Å§ÅÏÅô±ï‡Ë¿Ä¿ÅÖ’—ºÌ›•ë—†ËŸ¡‡Ì°ï•ù°–ËŸ¡‡ÌâΩ…ëï»µ…Öë•’ÃË‘¿îÌâÖç≠ù…Ω’πêËå·Ñ‘’ôòÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Äƒ¡¡‡Äå·Ñ‘’ôòÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ¡…Ωô•±îπ±Ã‹µ¡…Ωô•±îµÕ—Â±îµçΩÕµ•åÅÏÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†ƒ‡ƒ∞ƒƒ‹∞»‘‘∞∏Ã–§ÌâÖç≠ù…Ω’πêÈ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‡»îÄ»î±…ùâÑ†ƒ‹‘∞ƒ¿Ã∞»‘‘∞∏»–§±—…ÖπÕ¡Ö…ïπ–ÄÃ–î§±…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‡îÄ‡»î±…ùâÑ†Ã‹∞ƒÃÿ∞»‘‘∞∏ƒ–§±—…ÖπÕ¡Ö…ïπ–ÄÃ‘î§±±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú∞åƒ¿¡Ñ…å∞å¿‘¿‹ƒ‹Äÿÿî∞å¿‹≈ÑÃ‘§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ¡…Ωô•±îπ±Ã‹µ¡…Ωô•±îµÕ—Â±îµµ•π•µÖ∞ÅÏÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†ƒ‹–∞»¿Ã∞»»‘∞∏ƒ‘§ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ‘’ëïú∞å¡àƒ¿ƒ‰∞å¿‘¿‹¡å§ÌâΩ‡µÕ°ÖëΩ‹Ë¿Äƒ·¡‡Ä–’¡‡Å…ùâÑ†¿∞¿∞¿∞∏Ã»§Ö•µ¡Ω…—Öπ–ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ¡…Ωô•±îπ±Ã‹µ¡…Ωô•±îµÕ—Â±îµµ•π•µÖ∞ËÈÖô—ï»ÅÏÅë•Õ¡±Ö‰ÈπΩπîÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ¡…Ωô•±îµç’Õ—Ωµ•Èï»µΩŸï…±Ö‰ÅÏÅÖ±•ù∏µ•—ïµÃÈô±ï‡µÕ—Ö…–Ì©’Õ—•ô‰µçΩπ—ïπ–Èçïπ—ï»Ì¡Öëë•πúÈç±Öµ¿†»—¡‡∞ŸŸ†∞‘·¡‡§Äƒ…¡‡ÅµÖ‡†‹Ÿ¡‡±çÖ±å°ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µâΩ——Ω¥§Ä¨Äÿ—¡‡§§ÌâÖç≠ù…Ω’πêÈ…ùâÑ†ƒ∞–∞ƒ»∞∏‡‡§ÌâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†ƒ…¡‡§ÌΩŸï…ô±Ω‹È°•ëëï∏ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ¡…Ωô•±îµç’Õ—Ωµ•Èï»µâΩ‡ÅÏÅ›•ë—†Èµ•∏†‘»¡¡‡∞ƒ¿¿î§ÌµÖ‡µ°ï•ù°–ÈçÖ±å†ƒ¿¡ëŸ†Ä¥ÅµÖ‡†ƒƒŸ¡‡±çÖ±å°ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µâΩ——Ω¥§Ä¨Äƒ¿…¡‡§§§Ìë•Õ¡±Ö‰Èô±ï‡Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÌΩŸï…ô±Ω‹È°•ëëï∏ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»‡§ÌâΩ…ëï»µ…Öë•’ÃË»Ÿ¡‡ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ‘’ëïú∞å¿‹ƒ‹…à∞å¿‰¿‹ƒ‰Ä‹»î∞åƒ‘¡à…à§ÌâΩ‡µÕ°ÖëΩ‹Ë¿ÄÃ¡¡‡Ä‰¡¡‡Å…ùâÑ†¿∞¿∞¿∞∏ÿ‘§∞¿Ä¿Ä‘¡¡‡Å…ùâÑ†Ã‹∞ƒÃÿ∞»‘‘∞∏ƒ¿§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ¡…Ωô•±îµç’Õ—Ωµ•Èï»µâΩ‡ÄπµΩëÖ∞µâΩ‡µ°ïÖêÅÏÅô±ï‡Ë¿Ä¿ÅÖ’—ºÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ¡…Ωô•±îµç’Õ—Ωµ•Èï»µâΩ‡ÄπµΩëÖ∞µâΩ‡µâΩë‰ÅÏÅô±ï‡ËƒÄƒÅÖ’—ºÌµ•∏µ°ï•ù°–Ë¿ÌΩŸï…ô±Ω‹µ‰ÈÖ’—ºÌΩŸï…Õç…Ω±∞µâï°ÖŸ•Ω»ÈçΩπ—Ö•∏Ì¡Öëë•πúµâΩ——Ω¥Ëƒ·¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ¡…Ωô•±îµç’Õ—Ωµ•Èï»µâΩ‡ÄπµΩëÖ∞µâΩ‡µÖç—•ΩπÃÅÏÅ¡ΩÕ•—•Ω∏È…ï±Ö—•ŸîÌËµ•πëï‡Ë»Ìô±ï‡Ë¿Ä¿ÅÖ’—ºÌµÖ…ù•∏Ë¿Ì¡Öëë•πúËƒ…¡‡ÄƒŸ¡‡ÅµÖ‡†ƒ’¡‡±ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µâΩ——Ω¥§§ÌâΩ…ëï»µ—Ω¿Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒ–§ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ‡¡ëïú±…ùâÑ†‹∞ƒÃ∞Ãƒ∞∏‰ÿ§∞å¿‡¡à≈å§ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¥ƒ…¡‡Ä»’¡‡Å…ùâÑ†ƒ∞–∞ƒ»∞∏Ã–§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ¡…Ωô•±îµç’Õ—Ωµ•Èï»µâΩ‡ÄπµΩëÖ∞µâΩ‡µ°ïÖêÅÕµÖ±∞ÅÏÅçΩ±Ω»Ëå‘›ïÖôòÌôΩπ–Ë‰¿¿Ä·¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏ƒŸï¥ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ¡…Ωô•±îµç’Õ—Ωµ•Èï»µâΩ‡ÄπµΩëÖ∞µâΩ‡µ°ïÖêÅ†»ÅÏÅµÖ…ù•∏Ë—¡‡Ä¿Ä¿ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µç’Õ—Ωµ•Èï»µ±Öâï∞ÅÏÅë•Õ¡±Ö‰Èâ±Ωç¨ÌµÖ…ù•∏Ë’¡‡Ä¿Ä›¡‡ÌçΩ±Ω»ËåÂôàÂê»ÌôΩπ–Ë‡‘¿Ä·¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏ƒ¡ï¥Ì—ï·–µ—…ÖπÕôΩ…¥È’¡¡ï…çÖÕîÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄç±Ã›ïÖ—’…ïëY•ëïΩMï±ïç–ÅÏÅ›•ë—†Ëƒ¿¿îÌµÖ…ù•∏µâΩ——Ω¥Ëƒ·¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡•ç≠ï»ÅÏÅë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃÈ…ï¡ïÖ–†Ã∞≈ô»§ÌùÖ¿Ë·¡‡ÌµÖ…ù•∏µâΩ——Ω¥Ëƒ—¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡•ç≠ï»Åâ’——Ω∏ÅÏÅµ•∏µ°ï•ù°–Ë‡Ÿ¡‡Ì¡Öëë•πúËƒ¡¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒÃ§ÌâΩ…ëï»µ…Öë•’ÃËƒ’¡‡ÌâÖç≠ù…Ω’πêÈ…ùâÑ†‡∞»¿∞Ã‡∞∏‹»§ÌçΩ±Ω»ËçïÖò·ôòÌ—ï·–µÖ±•ù∏È±ïô–Ìë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈô±ï‡µÕ—Ö…–ÌùÖ¿Ë·¡‡Ìç’…ÕΩ»È¡Ω•π—ï»ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡•ç≠ï»Åâ’——Ω∏πÖç—•ŸîÅÏÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏‘ÿ§ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú±…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒ–§±…ùâÑ†ƒÃ‡∞‡‘∞»‘‘∞∏ƒ–§§ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä»—¡‡Å…ùâÑ†Ã‹∞ƒÃÿ∞»‘‘∞∏ƒ¿§±•πÕï–Ä¿Ä≈¡‡Ä¿Å…ùâÑ†»‘‘∞»‘‘∞»‘‘∞∏¿ÿ§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡•ç≠ï»Åâ’——Ω∏Ä¯ÅàÅÏÅôΩπ–µÕ•ÈîË»¡¡‡ÌçΩ±Ω»ËåÿÕïëôòÏÅı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡•ç≠ï»Åâ’——Ω∏ÅÕ¡Ö∏ÅÏÅë•Õ¡±Ö‰Èô±ï‡Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÌùÖ¿Ë—¡‡ÏÅı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡•ç≠ï»Åâ’——Ω∏ÅÕ—…ΩπúÅÏÅôΩπ–µÕ•ÈîËƒ≈¡‡ÏÅı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡•ç≠ï»Åâ’——Ω∏ÅÕµÖ±∞ÅÏÅçΩ±Ω»Ëå·ôÑÂå»ÌôΩπ–µÕ•ÈîË·¡‡Ì±•πîµ°ï•ù°–Ëƒ∏Ã‘ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡…ïŸ•ï‹ÅÏÅµ•∏µ°ï•ù°–Ëƒ¿—¡‡Ì¡Öëë•πúËƒ’¡‡ÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»»§ÌâΩ…ëï»µ…Öë•’ÃËƒ›¡‡Ìë•Õ¡±Ö‰Èô±ï‡ÌÖ±•ù∏µ•—ïµÃÈçïπ—ï»ÌùÖ¿ËƒÕ¡‡ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú∞å¿‰»»–ƒ∞å¿‰¡Ñ≈à§Ì—…ÖπÕ•—•Ω∏ÈâÖç≠ù…Ω’πêÄ∏…ÃÅïÖÕî±âΩ…ëï»µçΩ±Ω»Ä∏…ÃÅïÖÕîÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡…ïŸ•ï‹Ä¯Å§ÅÏÅ›•ë—†Ë–·¡‡Ì°ï•ù°–Ë–·¡‡ÌâΩ…ëï»µ…Öë•’ÃË‘¿îÌâÖç≠ù…Ω’πêÈçΩπ•åµù…Öë•ïπ–†åÃÂî›ôò∞å»‘‡·ôò∞å·Ñ‘’ôò∞çôôêÿŸà∞åÃÂî›ôò§ÌâΩ‡µÕ°ÖëΩ‹Ë¿Ä¿Ä»—¡‡Å…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏»‡§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡…ïŸ•ï‹Ä¯Åë•ÿÅÏÅë•Õ¡±Ö‰Èô±ï‡Ìô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÌùÖ¿ËÕ¡‡ÏÅı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡…ïŸ•ï‹ÅÕµÖ±∞ÅÏÅçΩ±Ω»Ëåÿ…ïëôòÌôΩπ–Ë‡‘¿Ä›¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏≈ï¥ÏÅı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡…ïŸ•ï‹ÅÕ—…ΩπúÅÏÅôΩπ–µÕ•ÈîËƒ·¡‡ÏÅı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡…ïŸ•ï‹ÅÕ¡Ö∏ÅÏÅçΩ±Ω»ËåÂôà—å‰ÌôΩπ–µÕ•ÈîËÂ¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡…ïŸ•ï‹π±Ã‹µ¡…Ωô•±îµÕ—Â±îµçΩÕµ•åÅÏÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†ƒ‹Ã∞ƒ¿Ã∞»‘‘∞∏Ã‡§ÌâÖç≠ù…Ω’πêÈ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‡‘îÄ‘î±…ùâÑ†ƒÿ¿∞‡»∞»‘‘∞∏»‡§±—…ÖπÕ¡Ö…ïπ–Ä–¿î§±±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú∞åƒ‰¡êÕÑ∞å¿‡¿‰≈Ñ§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡…ïŸ•ï‹π±Ã‹µ¡…Ωô•±îµÕ—Â±îµµ•π•µÖ∞ÅÏÅâΩ…ëï»µçΩ±Ω»È…ùâÑ†ƒ‡¿∞»¿‘∞»»‘∞∏ƒÿ§ÌâÖç≠ù…Ω’πêÈ±•πïÖ»µù…Öë•ïπ–†ƒ–’ëïú∞åƒƒƒ‹»¿∞å¿ÿ¿‡¡ê§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ’¡ëÖ—îµΩŸï…±Ö‰ÅÏÅ¡ΩÕ•—•Ω∏Èô•·ïêÌ•πÕï–Ë¿ÌËµ•πëï‡Ë»ƒ–‹–‡Ã¿¿¿Ìë•Õ¡±Ö‰Èù…•êÌ¡±Öçîµ•—ïµÃÈçïπ—ï»Ì¡Öëë•πúË»¡¡‡Ä»¡¡‡ÅçÖ±å†»¡¡‡Ä¨ÄÂŸ†§ÌâÖç≠ù…Ω’πêÈ…ùâÑ†ƒ∞–∞ƒÃ∞∏‡‡§ÌâÖç≠ë…Ω¿µô•±—ï»Èâ±’»†ƒÕ¡‡§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ’¡ëÖ—îµçÖ…êÅÏÅ›•ë—†Èµ•∏†––¡¡‡∞ƒ¿¿î§Ì¡Öëë•πúË»’¡‡Ì—ï·–µÖ±•ù∏Èçïπ—ï»ÌçΩ±Ω»Ëçò›ôçôòÌâΩ…ëï»Ë≈¡‡ÅÕΩ±•êÅ…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏Ã‡§ÌâΩ…ëï»µ…Öë•’ÃË»·¡‡ÌâÖç≠ù…Ω’πêÈ…Öë•Ö∞µù…Öë•ïπ–°ç•…ç±îÅÖ–Ä‘¿îÄ¿±…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏ƒ–§±—…ÖπÕ¡Ö…ïπ–ÄÃ‡î§±±•πïÖ»µù…Öë•ïπ–†ƒ‘’ëïú∞å¿‹≈ÑÃƒ∞å¿‰¿‡ƒ‹Äÿ‡î∞åƒ‡¡àÃ‘§ÌâΩ‡µÕ°ÖëΩ‹Ë¿ÄÃ¡¡‡Ä‰¡¡‡Å…ùâÑ†¿∞¿∞¿∞∏ÿ‡§∞¿Ä¿Ä‘’¡‡Å…ùâÑ†Ã‹∞ƒÃÿ∞»‘‘∞∏ƒ–§ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ’¡ëÖ—îµ±ΩùºÅÏÅ›•ë—†Ë‰—¡‡Ì°ï•ù°–Ë‰—¡‡ÌΩâ©ïç–µô•–ÈçΩπ—Ö•∏Ìô•±—ï»Èë…Ω¿µÕ°ÖëΩ‹†¿Ä¿Äƒ·¡‡Å…ùâÑ†‘‹∞»Ãƒ∞»‘‘∞∏‘ÿ§§ÌÖπ•µÖ—•Ω∏È±Ã›µâ±ïµ±ΩÖ–ÄÕÃÅïÖÕîµ•∏µΩ’–Å•πô•π•—îÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ’¡ëÖ—îµ≠•ç≠ï»ÅÏÅµÖ…ù•∏Ë—¡‡Ä¿Ä·¡‡ÌçΩ±Ω»ËåÿŸïÖôòÌôΩπ–Ë‰¿¿Äƒ¡¡‡Äù)ï—	…Ö•πÃÅ5Ωπºú±µΩπΩÕ¡ÖçîÌ±ï——ï»µÕ¡Öç•πúË∏ƒ›ï¥ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ’¡ëÖ—îµçÖ…êÅ†»ÅÏÅµÖ…ù•∏Ë¿Ä¿Äƒ¡¡‡ÌôΩπ–µÕ•ÈîË»Ÿ¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ’¡ëÖ—îµçÖ…êÅ¿ÅÏÅµÖ…ù•∏Ë¿Ä¿Ä»¡¡‡ÌçΩ±Ω»ËçÖëå…ê‰ÌôΩπ–µÕ•ÈîËƒ—¡‡Ì±•πîµ°ï•ù°–Ëƒ∏‘‘ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ’¡ëÖ—îµÖç—•ΩπÃÅÏÅë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË≈ô»Äƒ∏»’ô»ÌùÖ¿Ëƒ¡¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ’¡ëÖ—îµÖç—•ΩπÃÅâ’——Ω∏ÅÏÅµ•∏µ°ï•ù°–Ë–Â¡‡ÏÅÙ(ÄÄÄÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ’¡ëÖ—îµçÖ…êÅÕµÖ±∞ÅÏÅë•Õ¡±Ö‰Èâ±Ωç¨ÌµÖ…ù•∏µ—Ω¿ËƒÕ¡‡ÌçΩ±Ω»Ëå‡¿Ââà‡ÏÅÙ(ÄÄÄÅ≠ïÂô…ÖµïÃÅ±Ã›A…Ωô•±ïMçÖ∏ÅÏÅô…ΩµÌâÖç≠ù…Ω’πêµ¡ΩÕ•—•Ω∏Ëƒ‡¿îÄ¡ı—ΩÌâÖç≠ù…Ω’πêµ¡ΩÕ•—•Ω∏Ë¥ƒ‡¿îÄ¡ÙÅÙ(ÄÄÄÅ≠ïÂô…ÖµïÃÅ±Ã›µâ±ïµ±ΩÖ–ÅÏÄ¿î∞ƒ¿¿ïÌ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ïd†¿§Å…Ω—Ö—î†¥…ëïú•Ù‘¿ïÌ—…ÖπÕôΩ…¥È—…ÖπÕ±Ö—ïd†¥Ÿ¡‡§Å…Ω—Ö—î†…ëïú•ÙÅÙ(ÄÄÄÅ≠ïÂô…ÖµïÃÅ±Ã›1•Ÿ•πù=…â•–ÅÏÅ—ΩÌ—…ÖπÕôΩ…¥È…Ω—Ö—î†Ãÿ¡ëïú•ÙÅÙ(ÄÄÄÅ≠ïÂô…ÖµïÃÅ±Ã›M•ùπÖ±A’±ÕîÅÏÄ‘¿ïÌΩ¡Öç•—‰Ë∏–Ì—…ÖπÕôΩ…¥ÈÕçÖ±î†∏‹‘•ÙÅÙ(ÄÄÄÅµïë•Ñ°µÖ‡µ›•ë—†Ë‹¿¡¡‡§ÅÏÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ¡…Ωô•±îÅÏÅâΩ…ëï»µ…Öë•’ÃË»…¡‡Ö•µ¡Ω…—Öπ–ÏÅı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ¡…Ωô•±îµïµâ±ï¥ÅÏÅ›•ë—†Ë‘Ÿ¡‡Ì°ï•ù°–Ë‘Ÿ¡‡Ì—Ω¿ËƒƒŸ¡‡Ì…•ù°–Ëƒ≈¡‡ÏÅı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ¡…Ωô•±ïÌ¡Öëë•πúËƒ—¡‡ÌâΩ…ëï»µ…Öë•’ÃË»…¡·ı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµù…•ëÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË≈ô…ı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µôïÖ—’…ïêµŸ•ëïΩÌµ•∏µ°ï•ù°–Ë»Ã¡¡·ı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•ŸîµëÖ—ÖÌë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË≈ô»Ä≈ô…ı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•ŸîµëÖ—Ñ˘ë•ÿÈô•…Õ–µç°•±ê±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•ŸîµëÖ—Ñ˘¡Ìù…•êµçΩ±’µ∏Ëƒº¥≈ı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡•ç≠ï…Ìù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË≈ô…ı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µÕ—Â±îµ¡•ç≠ï»Åâ’——ΩπÌµ•∏µ°ï•ù°–Ëÿ—¡·ı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ°ïÖëÌÖ±•ù∏µ•—ïµÃÈô±ï‡µÕ—Ö…—ı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ±•Ÿ•πúµ°ïÖêµÖç—•ΩπÕÌô±ï‡µë•…ïç—•Ω∏ÈçΩ±’µ∏ÌÖ±•ù∏µ•—ïµÃÈô±ï‡µïπëı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ¡…Ωô•±îµç’Õ—Ωµ•Èï»µΩŸï…±ÖÂÌ¡Öëë•πúµ—Ω¿ÈµÖ‡†»¡¡‡±çÖ±å°ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µ—Ω¿§Ä¨Äƒ—¡‡§§Ì¡Öëë•πúµâΩ——Ω¥ÈµÖ‡†‡…¡‡±çÖ±å°ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µâΩ——Ω¥§Ä¨Ä‹¡¡‡§•ı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ¡…Ωô•±îµç’Õ—Ωµ•Èï»µâΩ·ÌµÖ‡µ°ï•ù°–ÈçÖ±å†ƒ¿¡ëŸ†Ä¥ÅµÖ‡†ƒ»…¡‡±çÖ±å°ïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µ—Ω¿§Ä¨Åïπÿ°ÕÖôîµÖ…ïÑµ•πÕï–µâΩ——Ω¥§Ä¨Äƒ¿¡¡‡§§§ÌâΩ…ëï»µ…Öë•’ÃË»…¡·ı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ¡…Ωô•±îµç’Õ—Ωµ•Èï»µâΩ‡ÄπµΩëÖ∞µâΩ‡µÖç—•ΩπÕÌë•Õ¡±Ö‰Èù…•êÌù…•êµ—ïµ¡±Ö—îµçΩ±’µπÃË∏·ô»Äƒ∏…ô»ÌùÖ¿ËÂ¡·ı°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ¡…Ωô•±îµç’Õ—Ωµ•Èï»µâΩ‡ÄπµΩëÖ∞µâΩ‡µÖç—•ΩπÃÅâ’——ΩπÌµ•∏µ°ï•ù°–Ë‘¡¡·ÙÅÙ(ÄÄÄÅµïë•Ñ°¡…ïôï…Ãµ…ïë’çïêµµΩ—•Ω∏È…ïë’çî§ÅÏÅ°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ¡…Ωô•±îËÈâïôΩ…î±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µ¡…Ωô•±îµïµâ±ï¥±°—µ∞π±Ã‹µÖ¡¿µ…’π—•µîÄπ±Ã‹µï±ïç—…•åµ’¡ëÖ—îµ±ΩùºÅÏÅÖπ•µÖ—•Ω∏ÈπΩπîÖ•µ¡Ω…—Öπ–ÏÅÙÅÙ(ÄÅÄÏ(ÄÅëΩç’µïπ–π°ïÖêπÖ¡¡ïπë°•±ê°Õ—Â±î§Ï)Ù)ïπÕ’…ï1•ŸïMç…Ω±∞›±ïç—…•ç%ëïπ—•—‰†§Ï(()ëΩç’µïπ–πÖëëŸïπ—1•Õ—ïπï»†â=5Ωπ—ïπ—1ΩÖëïêà∞Ä†§ÄÙ¯ÅÏ(ÄÅ•òÄ°ëΩç’µïπ–πùï—±ïµïπ—	Â%ê†â±ÕMïÖÕΩπÖ±Mï±ïç—Ωπ—…ÖÕ—•‡à§§Å…ï—’…∏Ï(ÄÅçΩπÕ–ÅÕ—Â±îÄÙÅëΩç’µïπ–πç…ïÖ—ï±ïµïπ–†âÕ—Â±îà§Ï(ÄÅÕ—Â±îπ•êÄÙÄâ±ÕMïÖÕΩπÖ±Mï±ïç—Ωπ—…ÖÕ—•‡àÏ(ÄÅÕ—Â±îπ—ï·—Ωπ—ïπ–ÄÙÅÄ(ÄÄÄÄçÕïÖÕΩπÖ±Q°ïµïëµ•πMï±ïç–ÅÏ(ÄÄÄÄÄÅçΩ±Ω»ËÅŸÖ»†¥µ—ï·–§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêËÅŸÖ»†¥µ•π¨§ÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÅÙ((ÄÄÄÄçÕïÖÕΩπÖ±Q°ïµïëµ•πMï±ïç–ÅΩ¡—•Ω∏ÅÏ(ÄÄÄÄÄÅçΩ±Ω»ËÄå≈ê≈ò»ÃÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅâÖç≠ù…Ω’πêËÄçôôôôôòÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅôΩπ–µ›ï•ù°–ËÄ‹¿¿Ï(ÄÄÄÅÙ((ÄÄÄÅµïë•ÑÄ°¡…ïôï…ÃµçΩ±Ω»µÕç°ïµîËÅëÖ…¨§ÅÏ(ÄÄÄÄÄÄçÕïÖÕΩπÖ±Q°ïµïëµ•πMï±ïç–ÅΩ¡—•Ω∏ÅÏ(ÄÄÄÄÄÄÄÅçΩ±Ω»ËÄå≈ê≈ò»ÃÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÄÄÅâÖç≠ù…Ω’πêËÄçôôôôôòÄÖ•µ¡Ω…—Öπ–Ï(ÄÄÄÄÄÅÙ(ÄÄÄÅÙ(ÄÅÄÏ(ÄÅëΩç’µïπ–π°ïÖêπÖ¡¡ïπë°•±ê°Õ—Â±î§Ï)Ù§Ï(