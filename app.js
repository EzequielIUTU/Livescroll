// ============================================================
// CONFIGURACIÓN — reemplazá con tus datos de Supabase
// (Project Settings > API en tu dashboard de Supabase)
// ============================================================
const SUPABASE_URL = "https://lxpjqvlphvjyygifedeb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4cGpxdmxwaHZqeXlnaWZlZGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTMyMTMsImV4cCI6MjA5ODk4OTIxM30.9ovZlNQ-XKdSszZuMYb6PzRnXtX5eejuzBeqpKgkVnk";

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
let watchIntervals = {}; // video_id -> intervalId
let watchSeconds = {};   // video_id -> segundos acumulados sin enviar aún
let feedObserverInstance = null;

// ============================================================
// ARRANQUE
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  const params = new URLSearchParams(window.location.search);
  window.referralCode = params.get("ref");

  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    currentUser = session.user;
    await loadProfile();
    renderApp();
  } else {
    renderLanding();
  }

  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      showNewPasswordForm();
      return;
    }
    if (event === "SIGNED_IN") {
      currentUser = session.user;
      await loadProfile();
      renderApp();
    } else if (event === "SIGNED_OUT") {
      currentUser = null;
      currentProfile = null;
      clearAllWatchIntervals();
      renderLanding();
    }
  });

  animateLandingOdometer();
});

// ============================================================
// AUTH
// ============================================================
function showAuth(mode) {
  document.getElementById("authWrap").classList.remove("hidden");
  document.querySelector(".hero").scrollIntoView({ behavior: "smooth" });
  renderAuthForm(mode);
}

function renderAuthForm(mode) {
  const wrap = document.getElementById("authWrap");
  const isSignup = mode === "signup";
  wrap.innerHTML = `
    <div class="auth-box">
      <h2>${isSignup ? "Crear cuenta" : "Iniciar sesión"}</h2>
      ${isSignup && window.referralCode ? `<p style="font-size:12px; color:var(--gold); margin-top:-8px; margin-bottom:14px;">🎉 Te invitó @${escapeHtml(window.referralCode)}</p>` : ""}
      ${isSignup ? `
        <div class="field">
          <label>Nombre de usuario</label>
          <input type="text" id="authUsername" placeholder="ej: ezequieliutu">
        </div>` : ""}
      <div class="field">
        <label>Email</label>
        <input type="email" id="authEmail" placeholder="tu@email.com">
      </div>
      <div class="field">
        <label>Contraseña</label>
        <input type="password" id="authPassword" placeholder="••••••••">
      </div>
      ${isSignup ? `
        <div class="field" style="display:flex; align-items:flex-start; gap:8px;">
          <input type="checkbox" id="authAcceptTerms" style="margin-top:3px;">
          <label for="authAcceptTerms" style="font-size:12px; color:var(--text-dim); cursor:pointer;">
            Soy mayor de 18 años y acepto los <a href="terminos.html" target="_blank">Términos y Condiciones</a>.
          </label>
        </div>` : ""}
      <button class="btn" style="width:100%" onclick="${isSignup ? "handleSignup()" : "handleLogin()"}">
        ${isSignup ? "Crear cuenta" : "Entrar"}
      </button>
      ${!isSignup ? `<div style="text-align:center; margin-top:10px;"><button onclick="handleForgotPassword()" style="background:none;border:none;color:var(--text-dim);font-size:12px;cursor:pointer;text-decoration:underline;">¿Olvidaste tu contraseña?</button></div>` : ""}
      <div id="authError" class="error-msg"></div>
      <div class="auth-toggle">
        ${isSignup
          ? `¿Ya tenés cuenta? <button onclick="renderAuthForm('login')">Iniciar sesión</button>`
          : `¿No tenés cuenta? <button onclick="renderAuthForm('signup')">Crear una</button>`}
      </div>
    </div>`;
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

  renderApp();
}

function showNewPasswordForm() {
  document.getElementById("landingView").classList.remove("hidden");
  document.getElementById("appView").classList.add("hidden");
  document.getElementById("authWrap").classList.remove("hidden");
  const wrap = document.getElementById("authWrap");
  wrap.innerHTML = `
    <div class="auth-box">
      <h2>Elegí tu nueva contraseña</h2>
      <div class="field">
        <label>Nueva contraseña</label>
        <input type="password" id="newPasswordInput" placeholder="••••••••">
      </div>
      <button class="btn" style="width:100%" onclick="submitNewPassword()">Guardar contraseña</button>
      <div id="newPasswordError" class="error-msg"></div>
    </div>`;
}

async function submitNewPassword() {
  const password = document.getElementById("newPasswordInput").value;
  const errEl = document.getElementById("newPasswordError");
  if (!password || password.length < 6) {
    errEl.textContent = "La contraseña tiene que tener al menos 6 caracteres.";
    return;
  }

  const { error } = await sb.auth.updateUser({ password });
  if (error) { errEl.textContent = error.message; return; }

  showToast("¡Contraseña actualizada! Ya podés usarla.");
  currentUser = (await sb.auth.getUser()).data.user;
  await loadProfile();
  renderApp();
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
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const errEl = document.getElementById("authError");
  errEl.textContent = "";

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { errEl.textContent = error.message; return; }

  currentUser = data.user;
  await loadProfile();
  renderApp();
}

async function handleLogout() {
  clearAllWatchIntervals();
  await sb.auth.signOut();
}

async function loadProfile() {
  const { data, error } = await sb.from("profiles").select("id, username, points_balance, plan_id, created_at").eq("id", currentUser.id).single();
  if (!error) currentProfile = data;

  const { data: status } = await sb.rpc("get_my_status");
  if (status && currentProfile) {
    currentProfile.is_admin = status.is_admin;
    currentProfile.is_blocked = status.is_blocked;
  }
}

// ============================================================
// LANDING
// ============================================================
function renderLanding() {
  document.getElementById("landingView").classList.remove("hidden");
  document.getElementById("appView").classList.add("hidden");
  document.getElementById("navLinks").innerHTML = "";
  document.getElementById("navRight").innerHTML = `
    <button class="btn-outline" onclick="showAuth('login')">Iniciar sesión</button>`;
}

function animateLandingOdometer() {
  // Puramente decorativo: un contador ambiente para transmitir "esto vive y crece"
  const el = document.getElementById("landingOdometer");
  let n = 128340;
  setInterval(() => {
    n += Math.floor(Math.random() * 8) + 1;
    el.textContent = n.toLocaleString("es-AR");
  }, 1800);
}

// ============================================================
// APP SHELL
// ============================================================
async function renderApp() {
  document.getElementById("landingView").classList.add("hidden");
  document.getElementById("appView").classList.remove("hidden");

  document.getElementById("navLinks").innerHTML = `
    <button id="tab-feed" onclick="switchTab('feed')">Mirar</button>
    <button id="tab-upload" onclick="switchTab('upload')">Subir video</button>
    <button id="tab-profile" onclick="switchTab('profile')">Mi Perfil</button>
    <button id="tab-wallet" onclick="switchTab('wallet')">Billetera</button>
    <button id="tab-plans" onclick="switchTab('plans')">Planes</button>
    <button id="tab-ranking" onclick="switchTab('ranking')">🏆 Ranking</button>
    ${currentProfile.is_admin ? `<button id="tab-admin" onclick="switchTab('admin')" style="color:var(--green)">🛠 Admin</button>` : ""}`;

  const plans = await loadPlans();
  const currentPlan = plans.find(p => p.id === currentProfile.plan_id) || plans[0];

  document.getElementById("navRight").innerHTML = `
    <span style="font-size:12px; color:var(--gold-dim); margin-right:8px;">${currentPlan.name}</span>
    <button id="notifBell" onclick="toggleNotifPanel()" style="position:relative; background:none; border:none; font-size:18px; cursor:pointer; margin-right:8px;">
      🔔<span id="notifBadge" class="hidden" style="position:absolute; top:-4px; right:-6px; background:var(--red); color:#fff; font-size:10px; border-radius:10px; padding:1px 5px;"></span>
    </button>
    <span class="nav-balance mono" id="navBalance">${currentProfile.points_balance} pts</span>
    <button class="btn-outline" style="margin-left:10px" onclick="handleLogout()">Salir</button>`;

  loadNotifications();

  checkBoostStatus();
  checkBlockedStatus();
  switchTab("feed");
}

function checkBlockedStatus() {
  const wrap = document.getElementById("blockedBannerWrap");
  if (currentProfile.is_blocked) {
    wrap.innerHTML = `
      <div style="max-width:920px;margin:14px auto 0;padding:10px 18px;background:rgba(34,197,94,0.08);border:1px solid var(--gold-dim);border-radius:10px;color:var(--text);font-size:13px;text-align:center;">
        🕒 Tu cuenta está pendiente de verificación por el equipo. Podés navegar tranquilo, pero todavía no vas a sumar puntos hasta que te habilitemos (normalmente es rápido).
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

function switchTab(tab) {
  clearAllWatchIntervals();
  currentTab = tab;
  document.querySelectorAll(".nav-links button").forEach(b => b.classList.remove("active"));
  const activeBtn = document.getElementById("tab-" + tab);
  if (activeBtn) activeBtn.classList.add("active");

  if (tab === "feed") renderFeed();
  if (tab === "upload") renderUpload();
  if (tab === "profile") renderProfile();
  if (tab === "wallet") renderWallet();
  if (tab === "plans") renderPlans();
  if (tab === "ranking") renderRanking();
  if (tab === "admin") renderAdmin();
}

function updateBalanceUI() {
  const el = document.getElementById("navBalance");
  if (el) el.textContent = currentProfile.points_balance + " pts";
}

function showToast(msg) {
  const wrap = document.getElementById("toastWrap");
  const t = document.createElement("div");
  t.className = "toast mono";
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

// ============================================================
// FEED — ver videos de otros y ganar puntos por minuto
// ============================================================
async function renderFeed() {
  const main = document.getElementById("appView");
  main.innerHTML = `
    <div id="feedList">Cargando videos...</div>`;

  const { data: videos, error } = await sb
    .from("videos")
    .select("*, profiles!videos_user_id_fkey(username)")
    .order("created_at", { ascending: false })
    .limit(20);

  const list = document.getElementById("feedList");
  if (error) { list.textContent = "Error cargando videos: " + error.message; return; }
  if (!videos.length) {
    list.innerHTML = `<div style="padding:40px 0; text-align:center;">
      <h1 class="page-title">Mirá y ganá</h1>
      <p style="color:var(--text-dim)">Todavía no hay videos de otros usuarios. ¡Subí el primero!</p>
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
        <div class="feed-item" data-video-id="${v.id}">
          <div class="feed-phone">
            <div class="feed-embed-frame">${getEmbedHtml(v)}</div>
            ${isMine ? `<div style="position:absolute; top:14px; right:14px; background:rgba(0,0,0,0.6); color:var(--gold); font-size:11px; padding:4px 10px; border-radius:20px; z-index:6;">Tu video · sin puntos</div>` : ""}
            <div class="feed-actions">
              <button class="feed-action-btn ${likedSet.has(v.id) ? "liked" : ""}" id="like-${v.id}" onclick="handleLike('${v.id}')">❤️</button>
              <button class="feed-action-btn" onclick="openComments('${v.id}')">💬</button>
              <button class="feed-action-btn" onclick="handleShare('${v.id}', '${v.video_url.replace(/'/g, "\\'")}')">🔗</button>
              ${!isMine ? `<button class="feed-action-btn" onclick="openReportModal('${v.id}')">🚩</button>` : ""}
            </div>
            <div class="feed-overlay">
              <div>
                <div class="title">${escapeHtml(v.title)}</div>
                <div class="author" style="cursor:pointer;" onclick="viewPublicProfile('${escapeHtml(v.profiles?.username || "")}')">@${escapeHtml(v.profiles?.username || "usuario")} · ${v.platform}</div>
              </div>
              <div class="live-pts" id="pts-${v.id}"><span class="mono" id="secs-${v.id}">0s</span></div>
            </div>
            ${i === 0 ? `<div class="feed-nudge">Deslizá hacia arriba para el siguiente ↑</div>` : ""}
          </div>
        </div>`;
      }).join("")}
    </div>`;

  setupFeedObserver(videos);
}

function setupFeedObserver(videos) {
  const videoMap = Object.fromEntries(videos.map(v => [v.id, v]));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const videoId = entry.target.dataset.videoId;
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        startWatching(videoMap[videoId]);
      } else {
        stopWatching(videoId);
      }
    });
  }, { threshold: [0, 0.6, 1] });

  document.querySelectorAll(".feed-item").forEach(el => observer.observe(el));
  feedObserverInstance = observer;
}

function getEmbedHtml(video) {
  const url = video.video_url;
  if (video.platform === "upload") {
    return `<video src="${url}" controls autoplay muted loop playsinline style="width:100%;height:100%;object-fit:contain;"></video>`;
  }
  if (video.platform === "youtube") {
    const id = extractYoutubeId(url);
    if (id) return `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  }
  if (video.platform === "twitch") {
    return `<iframe src="https://player.twitch.tv/?video=${encodeURIComponent(url)}&parent=${location.hostname}&autoplay=true&muted=true" allowfullscreen></iframe>`;
  }
  if (video.platform === "kick") {
    return `<iframe src="${url}" allowfullscreen></iframe>`;
  }
  const icons = { tiktok: "🎵", kick: "🟢", twitch: "🟣" };
  return `<div class="feed-fallback">
    <div class="platform-icon">${icons[video.platform] || "▶️"}</div>
    <p>Este video se ve mejor en ${video.platform}</p>
    <a class="btn" href="${url}" target="_blank" rel="noopener">Abrir y mirar ahí</a>
  </div>`;
}

function getThumbnailHtml(video) {
  if (video.platform === "youtube") {
    const id = extractYoutubeId(video.video_url);
    if (id) return `<img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" alt="miniatura" loading="lazy">`;
  }
  if (video.platform === "upload") return "🎬";
  const icons = { kick: "🟢", twitch: "🟣", tiktok: "🎵" };
  return icons[video.platform] || "▶️";
}

function extractYoutubeId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function startWatching(video) {
  if (video.user_id === currentUser.id) return;
  if (watchIntervals[video.id]) return; // ya está corriendo, no duplicar

  watchSeconds[video.id] = watchSeconds[video.id] || 0;

  const interval = setInterval(async () => {
    if (document.hidden) return;

    watchSeconds[video.id] += 5;
    const secsEl = document.getElementById(`secs-${video.id}`);
    if (secsEl) secsEl.textContent = watchSeconds[video.id] + "s";

    if (watchSeconds[video.id] % 15 === 0) {
      const { data, error } = await sb.rpc("award_watch_points", {
        p_video_id: video.id,
        p_viewer_id: currentUser.id,
        p_new_seconds: 15
      });

      if (error) return;

      if (data.ok) {
        currentProfile.points_balance += data.points_viewer;
        updateBalanceUI();
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
  if (feedObserverInstance) {
    feedObserverInstance.disconnect();
    feedObserverInstance = null;
  }
}

// ============================================================
// SUBIR VIDEO
// ============================================================
function renderUpload() {
  const main = document.getElementById("appView");
  main.innerHTML = `
    <h1 class="page-title">Subir video</h1>
    <p class="page-sub">Compartí un link o subí tu archivo directamente. Ganás 25 puntos al instante.</p>

    <div style="display:flex; gap:8px; margin-bottom:18px;">
      <button class="btn" id="modeLinkBtn" onclick="setUploadMode('link')">🔗 Link</button>
      <button class="btn-outline" id="modeFileBtn" onclick="setUploadMode('file')">🎬 Archivo (MP4/MKV)</button>
    </div>

    <div class="form-card">
      <div id="linkFields">
        <div class="field">
          <label>Plataforma</label>
          <select id="uploadPlatform" style="width:100%;padding:11px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:inherit">
            <option value="kick">Kick</option>
            <option value="twitch">Twitch</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
        <div class="field">
          <label>Link del video</label>
          <input type="text" id="uploadUrl" placeholder="https://...">
        </div>
      </div>

      <div id="fileFields" class="hidden">
        <div class="field">
          <label>Archivo de video (MP4 o MKV, máx. 50MB)</label>
          <p style="font-size:12px; color:var(--text-dim); margin:-6px 0 10px;">
            💡 Pensado para <strong style="color:var(--text)">clips cortos (30s a 1 min)</strong>, no streams completos.
            Si tu contenido es más largo, subilo a Kick/YouTube y compartí el link en la pestaña "🔗 Link".
          </p>
          <input type="file" id="uploadFile" accept=".mp4,.mkv,video/mp4,video/x-matroska"
            onchange="previewFileSize()"
            style="width:100%;padding:11px;background:var(--ink);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:inherit">
          <div id="fileSizeInfo" style="font-size:12px;margin-top:6px;"></div>
        </div>
        <div id="uploadProgress" class="hidden" style="margin-bottom:14px;">
          <div style="background:var(--panel-2);border-radius:20px;height:10px;overflow:hidden;">
            <div id="uploadProgressBar" style="width:0%;height:100%;background:var(--gold);transition:width 0.2s;"></div>
          </div>
        </div>
      </div>

      <div class="field">
        <label>Título</label>
        <input type="text" id="uploadTitle" placeholder="ej: Jugada increíble en vivo">
      </div>

      <button class="btn" id="uploadSubmitBtn" onclick="handleUpload()">Subir y ganar 25 pts</button>
      <div id="uploadError" class="error-msg"></div>
    </div>`;

  setUploadMode("link");
}

const MAX_FILE_MB = 50;

function previewFileSize() {
  const file = document.getElementById("uploadFile").files[0];
  const info = document.getElementById("fileSizeInfo");
  if (!file) { info.textContent = ""; return; }

  const mb = (file.size / (1024 * 1024)).toFixed(1);
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    info.innerHTML = `<span style="color:var(--red)">${mb}MB — supera el máximo de ${MAX_FILE_MB}MB, elegí un archivo más liviano</span>`;
  } else {
    info.innerHTML = `<span style="color:var(--green)">${mb}MB — perfecto, entra sin problema</span>`;
  }
}

async function setUploadMode(mode) {
  window.currentUploadMode = mode;
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

async function handleUploadLink() {
  const platform = document.getElementById("uploadPlatform").value;
  const title = document.getElementById("uploadTitle").value.trim();
  const url = document.getElementById("uploadUrl").value.trim();
  const errEl = document.getElementById("uploadError");
  errEl.textContent = "";

  if (!title || !url) { errEl.textContent = "Completá título y link."; return; }

  const { error } = await sb.from("videos").insert({
    user_id: currentUser.id,
    platform,
    title,
    video_url: url
  });

  if (error) { errEl.textContent = error.message; return; }

  if (currentProfile.is_blocked) {
    showToast("Video subido (sin puntos: cuenta bloqueada)");
  } else {
    currentProfile.points_balance += 25;
    updateBalanceUI();
    showToast("+25 pts por tu video");
  }
  switchTab("feed");
}

async function handleUploadFile() {
  const title = document.getElementById("uploadTitle").value.trim();
  const fileInput = document.getElementById("uploadFile");
  const file = fileInput.files[0];
  const errEl = document.getElementById("uploadError");
  const btn = document.getElementById("uploadSubmitBtn");
  errEl.textContent = "";

  if (!title || !file) { errEl.textContent = "Completá el título y elegí un archivo."; return; }
  if (file.size > MAX_FILE_MB * 1024 * 1024) { errEl.textContent = `El archivo supera los ${MAX_FILE_MB}MB permitidos.`; return; }

  btn.disabled = true;
  btn.textContent = "Subiendo...";
  document.getElementById("uploadProgress").classList.remove("hidden");

  const path = `${currentUser.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;

  const { error: uploadError } = await sb.storage.from("clip-videos").upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (uploadError) {
    errEl.textContent = "Error al subir: " + uploadError.message;
    btn.disabled = false;
    btn.textContent = "Subir y ganar 25 pts";
    return;
  }

  const { data: publicUrlData } = sb.storage.from("clip-videos").getPublicUrl(path);

  const { error: insertError } = await sb.from("videos").insert({
    user_id: currentUser.id,
    platform: "upload",
    title,
    video_url: publicUrlData.publicUrl
  });

  btn.disabled = false;
  btn.textContent = "Subir y ganar 25 pts";

  if (insertError) { errEl.textContent = insertError.message; return; }

  if (currentProfile.is_blocked) {
    showToast("Video subido (sin puntos: cuenta bloqueada)");
  } else {
    currentProfile.points_balance += 25;
    updateBalanceUI();
    showToast("+25 pts por tu video");
  }
  switchTab("feed");
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
    .limit(30);

  const { data: boostStatus } = await sb.rpc("get_boost_status", { p_user_id: currentUser.id });

  const MIN_REDEEM = 1500;
  const progressPct = Math.min(100, (currentProfile.points_balance / MIN_REDEEM) * 100);
  const missing = Math.max(0, MIN_REDEEM - currentProfile.points_balance);
  const commissionPreview = Math.round(MIN_REDEEM * plan.commission_pct);

  main.innerHTML = `
    <h1 class="page-title">Billetera</h1>
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
    </div>

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
        Tu plan (${plan.name}) no incluye boost activable. <button onclick="switchTab('plans')" style="background:none;border:none;color:var(--gold);cursor:pointer;font-family:inherit;">Mejorá tu plan →</button>
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
async function renderProfile() {
  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando tu perfil...</p>`;

  const { data: videos, error } = await sb
    .from("videos")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) { main.innerHTML = `<p class="error-msg">Error cargando tus videos: ${error.message}</p>`; return; }

  // Puntos totales generados por ser visto (no incluye el 25 fijo de subir)
  const { data: watchedByOther } = await sb
    .from("points_ledger")
    .select("amount")
    .eq("user_id", currentUser.id)
    .eq("reason", "watched_by_other");

  const totalFromViews = (watchedByOther || []).reduce((sum, r) => sum + r.amount, 0);

  const videoIds = videos.map(v => v.id);
  const [{ data: sessions }, { data: likes }] = await Promise.all([
    videoIds.length ? sb.from("watch_sessions").select("video_id, viewer_id").in("video_id", videoIds) : { data: [] },
    videoIds.length ? sb.from("video_likes").select("video_id").in("video_id", videoIds) : { data: [] }
  ]);
  const viewsByVideo = {};
  (sessions || []).forEach(s => {
    viewsByVideo[s.video_id] = viewsByVideo[s.video_id] || new Set();
    viewsByVideo[s.video_id].add(s.viewer_id);
  });
  const likesByVideo = {};
  (likes || []).forEach(l => { likesByVideo[l.video_id] = (likesByVideo[l.video_id] || 0) + 1; });

  const { data: referralConfig } = await sb
    .from("app_config")
    .select("key, value")
    .in("key", ["referral_referrer_pts", "referral_referred_pts"]);
  const referrerPts = referralConfig?.find(c => c.key === "referral_referrer_pts")?.value || 150;
  const referredPts = referralConfig?.find(c => c.key === "referral_referred_pts")?.value || 100;

  main.innerHTML = `
    <h1 class="page-title">Mi Perfil</h1>
    <p class="page-sub">${currentProfile.avatar_emoji || "🎬"} @${escapeHtml(currentProfile.username)} · ${videos.length} video${videos.length === 1 ? "" : "s"} subido${videos.length === 1 ? "" : "s"} · ${totalFromViews} pts generados por vistas</p>
    ${currentProfile.bio ? `<p style="color:var(--text-dim); font-size:13px; margin-top:-10px; margin-bottom:14px;">${escapeHtml(currentProfile.bio)}</p>` : ""}
    ${renderSocialIcons(currentProfile)}
    <button class="btn-outline" style="margin-bottom:20px;" onclick="openEditProfile()">✏️ Editar perfil</button>

    <div class="form-card" style="margin-bottom:24px; border-color:var(--gold-dim);">
      <h3 style="margin-top:0;">🎁 Invitá y ganá ${referrerPts} pts</h3>
      <p style="font-size:13px; color:var(--text-dim); margin-bottom:12px;">
        Compartí tu link. Cuando la persona invitada suba o mire algo por primera vez, ganás ${referrerPts} pts y ella gana ${referredPts} pts.
        Tope: 3 invitaciones premiadas por mes.
      </p>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <input readonly id="referralLinkInput" value="${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(currentProfile.username)}"
          style="flex:1; min-width:200px; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:'JetBrains Mono', monospace; font-size:12px;">
        <button class="btn" onclick="copyReferralLink()">Copiar link</button>
      </div>
    </div>

    <div id="myVideosList">
      ${videos.length ? videos.map(v => `
        <div class="video-card with-thumb">
          <div class="video-thumb">${getThumbnailHtml(v)}</div>
          <div class="card-body">
            <div class="meta">
              <div>
                <div class="title">${escapeHtml(v.title)}</div>
                <div style="color:var(--text-dim); font-size:12px;">${new Date(v.created_at).toLocaleString("es-AR")} · 👁 ${(viewsByVideo[v.id]?.size || 0)} vistas · ❤️ ${likesByVideo[v.id] || 0}</div>
              </div>
              <div class="platform">${v.platform}</div>
            </div>
            <a href="${v.video_url}" target="_blank" rel="noopener" style="font-size:13px; color:var(--gold);">${v.video_url}</a>
          </div>
        </div>
      `).join("") : `<p style="color:var(--text-dim)">Todavía no subiste ningún video. <button onclick="switchTab('upload')" style="background:none;border:none;color:var(--gold);cursor:pointer;font-family:inherit;">Subí el primero →</button></p>`}
    </div>`;
}

async function handleLike(videoId) {
  const btn = document.getElementById(`like-${videoId}`);
  if (btn.classList.contains("liked")) return;

  const { data, error } = await sb.rpc("give_like", { p_video_id: videoId, p_user_id: currentUser.id });
  if (error || !data.ok) {
    if (data?.error === "tope_diario") showToast("Alcanzaste tu tope diario de likes");
    if (data?.error === "no_self_like") showToast("No podés darle like a tu propio video");
    return;
  }

  btn.classList.add("liked");
  currentProfile.points_balance += data.points;
  updateBalanceUI();
  showToast(`+${data.points} pt por el like`);
}

async function handleShare(videoId, url) {
  if (navigator.share) {
    try { await navigator.share({ title: "Mirá este clip", url }); } catch (e) { /* cancelado, seguimos igual */ }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copiado para compartir");
    } catch (e) { /* nada */ }
  }

  const { data, error } = await sb.rpc("give_share", { p_video_id: videoId, p_user_id: currentUser.id });
  if (error || !data.ok) return; // ya compartido antes, o tope diario: no molestamos con error
  currentProfile.points_balance += data.points;
  updateBalanceUI();
  showToast(`+${data.points} pts por compartir`);
}

async function openComments(videoId) {
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div style="position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:100; display:flex; align-items:flex-end; justify-content:center;" onclick="if(event.target===this) closeComments()">
      <div style="background:var(--panel); width:100%; max-width:420px; max-height:70vh; border-radius:20px 20px 0 0; padding:20px; display:flex; flex-direction:column;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h3 style="margin:0;">Comentarios</h3>
          <button onclick="closeComments()" style="background:none;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;">✕</button>
        </div>
        <div id="commentsList" style="overflow-y:auto; flex:1; margin-bottom:14px;">Cargando...</div>
        <div style="display:flex; gap:8px;">
          <input id="newCommentInput" placeholder="Escribí un comentario..." style="flex:1; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:inherit;">
          <button class="btn" onclick="submitComment('${videoId}')">Enviar</button>
        </div>
      </div>
    </div>`;

  await loadComments(videoId);
}

async function loadComments(videoId) {
  const { data: comments } = await sb
    .from("video_comments")
    .select("*, profiles!video_comments_user_id_fkey(username)")
    .eq("video_id", videoId)
    .order("created_at", { ascending: false });

  const list = document.getElementById("commentsList");
  if (!list) return;
  list.innerHTML = comments && comments.length
    ? comments.map(c => `
        <div style="margin-bottom:12px; font-size:13px;">
          <strong style="color:var(--gold);">@${escapeHtml(c.profiles?.username || "usuario")}</strong>
          <span style="color:var(--text-dim); font-size:11px;"> · ${new Date(c.created_at).toLocaleDateString("es-AR")}</span>
          <div>${escapeHtml(c.content)}</div>
        </div>`).join("")
    : `<p style="color:var(--text-dim); font-size:13px;">Sé el primero en comentar.</p>`;
}

async function submitComment(videoId) {
  const input = document.getElementById("newCommentInput");
  const content = input.value.trim();
  if (content.length < 3) { showToast("Escribí al menos 3 caracteres"); return; }

  const { data, error } = await sb.rpc("add_comment", { p_video_id: videoId, p_user_id: currentUser.id, p_content: content });
  if (error || !data.ok) { showToast("No se pudo comentar"); return; }

  input.value = "";
  await loadComments(videoId);
  await loadProfile(); // por si sumó puntos por primer comentario
  updateBalanceUI();
}

function closeComments() {
  document.getElementById("globalModalWrap").innerHTML = "";
}

function renderSocialIcons(profile) {
  const socials = [
    { key: "social_kick", icon: "🟢", label: "Kick" },
    { key: "social_twitch", icon: "🟣", label: "Twitch" },
    { key: "social_youtube", icon: "🔴", label: "YouTube" },
    { key: "social_tiktok", icon: "⚫", label: "TikTok" },
    { key: "social_instagram", icon: "🩷", label: "Instagram" }
  ];
  const active = socials.filter(s => profile[s.key]);
  if (!active.length) return "";
  return `<div style="display:flex; gap:10px; margin-bottom:16px;">
    ${active.map(s => `<a href="${profile[s.key]}" target="_blank" rel="noopener" title="${s.label}" style="font-size:20px; text-decoration:none;">${s.icon}</a>`).join("")}
  </div>`;
}

// ============================================================
// PERFIL PÚBLICO (de otro usuario)
// ============================================================
let previousTabBeforeProfile = "feed";

async function viewPublicProfile(username) {
  if (!username) return;
  if (username === currentProfile.username) { switchTab("profile"); return; }

  clearAllWatchIntervals();
  previousTabBeforeProfile = currentTab;

  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando perfil...</p>`;
  document.querySelectorAll(".nav-links button").forEach(b => b.classList.remove("active"));

  const { data: profile } = await sb.from("profiles").select("id, username, avatar_emoji, bio, social_kick, social_twitch, social_youtube, social_tiktok, social_instagram").eq("username", username).single();
  if (!profile) { main.innerHTML = `<p class="error-msg">Usuario no encontrado.</p>`; return; }

  const { data: videos } = await sb
    .from("videos")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const videoIds = (videos || []).map(v => v.id);

  const [{ data: sessions }, { data: likes }, { data: followers }, { data: amIFollowing }] = await Promise.all([
    videoIds.length ? sb.from("watch_sessions").select("video_id, viewer_id").in("video_id", videoIds) : { data: [] },
    videoIds.length ? sb.from("video_likes").select("video_id").in("video_id", videoIds) : { data: [] },
    sb.from("follows").select("follower_id").eq("followed_id", profile.id),
    sb.from("follows").select("follower_id").eq("followed_id", profile.id).eq("follower_id", currentUser.id).maybeSingle()
  ]);

  const viewsByVideo = {};
  (sessions || []).forEach(s => {
    viewsByVideo[s.video_id] = viewsByVideo[s.video_id] || new Set();
    viewsByVideo[s.video_id].add(s.viewer_id);
  });
  const likesByVideo = {};
  (likes || []).forEach(l => { likesByVideo[l.video_id] = (likesByVideo[l.video_id] || 0) + 1; });

  const isFollowing = !!amIFollowing;

  main.innerHTML = `
    <button class="btn-outline" style="margin-bottom:18px;" onclick="switchTab('${previousTabBeforeProfile}')">← Volver</button>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
      <h1 class="page-title" style="margin-bottom:0;">${profile.avatar_emoji || "🎬"} @${escapeHtml(profile.username)}</h1>
      <button class="btn${isFollowing ? "-outline" : ""}" id="followBtn" onclick="handleToggleFollow('${profile.id}')">${isFollowing ? "Siguiendo ✓" : "+ Seguir"}</button>
    </div>
    ${profile.bio ? `<p style="color:var(--text-dim); font-size:13px; margin-top:0;">${escapeHtml(profile.bio)}</p>` : ""}
    ${renderSocialIcons(profile)}
    <p class="page-sub">${videos?.length || 0} videos · ${(followers || []).length} seguidores</p>

    <div id="publicVideosList">
      ${videos && videos.length ? videos.map(v => `
        <div class="video-card with-thumb">
          <div class="video-thumb">${getThumbnailHtml(v)}</div>
          <div class="card-body">
            <div class="meta">
              <div>
                <div class="title">${escapeHtml(v.title)}</div>
                <div style="color:var(--text-dim); font-size:12px;">${new Date(v.created_at).toLocaleDateString("es-AR")} · 👁 ${(viewsByVideo[v.id]?.size || 0)} vistas · ❤️ ${likesByVideo[v.id] || 0}</div>
              </div>
              <div class="platform">${v.platform}</div>
            </div>
            <a href="${v.video_url}" target="_blank" rel="noopener" style="font-size:13px; color:var(--gold);">${v.video_url}</a>
          </div>
        </div>
      `).join("") : `<p style="color:var(--text-dim)">Todavía no subió videos.</p>`}
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
    <div style="position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px;" onclick="if(event.target===this) this.remove()">
      <div style="background:var(--panel); width:100%; max-width:340px; border-radius:16px; padding:22px;">
        <h3 style="margin-top:0;">🚩 Reportar video</h3>
        <p style="font-size:13px; color:var(--text-dim); margin-bottom:14px;">¿Por qué querés reportarlo?</p>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${reasons.map(r => `<button class="btn-outline" style="text-align:left;" onclick="submitReport('${videoId}', '${r}')">${r}</button>`).join("")}
        </div>
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

async function loadNotifications() {
  const { data } = await sb
    .from("notifications")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(20);

  notifCache = data || [];
  const unread = notifCache.filter(n => !n.read).length;
  const badge = document.getElementById("notifBadge");
  if (badge) {
    if (unread > 0) { badge.textContent = unread; badge.classList.remove("hidden"); }
    else { badge.classList.add("hidden"); }
  }
}

function toggleNotifPanel() {
  const existing = document.getElementById("notifPanel");
  if (existing) { existing.remove(); return; }

  const panel = document.createElement("div");
  panel.id = "notifPanel";
  panel.style.cssText = "position:absolute; top:60px; right:20px; width:300px; max-height:400px; overflow-y:auto; background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:12px; z-index:60; box-shadow:0 10px 30px rgba(0,0,0,0.5);";
  panel.innerHTML = notifCache.length
    ? notifCache.map(n => `
        <div style="padding:10px; border-bottom:1px solid var(--border); font-size:13px; ${n.read ? "opacity:0.5;" : ""}">
          <div>${escapeHtml(n.message)}</div>
          <div style="color:var(--text-dim); font-size:11px; margin-top:2px;">${new Date(n.created_at).toLocaleString("es-AR")}</div>
        </div>`).join("")
    : `<p style="color:var(--text-dim); font-size:13px; padding:10px;">Sin notificaciones todavía.</p>`;

  document.body.appendChild(panel);

  sb.rpc("mark_notifications_read", { p_user_id: currentUser.id }).then(() => {
    document.getElementById("notifBadge")?.classList.add("hidden");
  });
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

function openEditProfile() {
  const emojis = ["🎬","⚡","🔥","🎮","🎧","🐐","🚀","💎","😎","🎯"];
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div style="position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px;" onclick="if(event.target===this) this.remove()">
      <div style="background:var(--panel); width:100%; max-width:360px; border-radius:16px; padding:22px;">
        <h3 style="margin-top:0;">Editar perfil</h3>
        <div class="field">
          <label>Avatar</label>
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
            <div style="display:flex; align-items:center; gap:8px;"><span>🟢</span><input type="text" id="socialKick" value="${escapeHtml(currentProfile.social_kick || "")}" placeholder="Link de tu Kick" style="flex:1;"></div>
            <div style="display:flex; align-items:center; gap:8px;"><span>🟣</span><input type="text" id="socialTwitch" value="${escapeHtml(currentProfile.social_twitch || "")}" placeholder="Link de tu Twitch" style="flex:1;"></div>
            <div style="display:flex; align-items:center; gap:8px;"><span>🔴</span><input type="text" id="socialYoutube" value="${escapeHtml(currentProfile.social_youtube || "")}" placeholder="Link de tu YouTube" style="flex:1;"></div>
            <div style="display:flex; align-items:center; gap:8px;"><span>⚫</span><input type="text" id="socialTiktok" value="${escapeHtml(currentProfile.social_tiktok || "")}" placeholder="Link de tu TikTok" style="flex:1;"></div>
            <div style="display:flex; align-items:center; gap:8px;"><span>🩷</span><input type="text" id="socialInstagram" value="${escapeHtml(currentProfile.social_instagram || "")}" placeholder="Link de tu Instagram" style="flex:1;"></div>
          </div>
        </div>
        <button class="btn" style="width:100%;" onclick="saveProfileEdits()">Guardar</button>
        <div id="editProfileError" class="error-msg"></div>
      </div>
    </div>`;
  window.selectedAvatarEmoji = currentProfile.avatar_emoji || "🎬";
}

function selectAvatarEmoji(emoji) {
  window.selectedAvatarEmoji = emoji;
  document.querySelectorAll("[id^='emoji-']").forEach(b => b.style.background = "transparent");
  document.getElementById(`emoji-${emoji}`).style.background = "var(--panel-2)";
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

  const { error: updateError } = await sb.from("profiles").update({
    bio,
    avatar_emoji: window.selectedAvatarEmoji,
    social_kick: document.getElementById("socialKick").value.trim() || null,
    social_twitch: document.getElementById("socialTwitch").value.trim() || null,
    social_youtube: document.getElementById("socialYoutube").value.trim() || null,
    social_tiktok: document.getElementById("socialTiktok").value.trim() || null,
    social_instagram: document.getElementById("socialInstagram").value.trim() || null
  }).eq("id", currentUser.id);

  if (updateError) { errEl.textContent = "No se pudo guardar."; return; }

  currentProfile.bio = bio;
  currentProfile.avatar_emoji = window.selectedAvatarEmoji;
  currentProfile.social_kick = document.getElementById("socialKick").value.trim();
  currentProfile.social_twitch = document.getElementById("socialTwitch").value.trim();
  currentProfile.social_youtube = document.getElementById("socialYoutube").value.trim();
  currentProfile.social_tiktok = document.getElementById("socialTiktok").value.trim();
  currentProfile.social_instagram = document.getElementById("socialInstagram").value.trim();
  document.getElementById("globalModalWrap").innerHTML = "";
  showToast("Perfil actualizado");
  renderProfile();
}


async function renderAdmin() {
  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando canjes...</p>`;

  const { data: redemptions, error } = await sb
    .from("redemptions")
    .select("*, profiles!redemptions_user_id_fkey(username)")
    .order("created_at", { ascending: true });

  if (error) { main.innerHTML = `<p class="error-msg">Error: ${error.message}</p>`; return; }

  // Vista completa solo para admins: IP y estado de bloqueo de cada cuenta
  const { data: profilesOverview } = await sb.rpc("admin_get_profiles_overview");
  const profileById = {};
  (profilesOverview || []).forEach(p => { profileById[p.id] = p; });

  const ipCounts = {};
  (profilesOverview || []).forEach(p => {
    if (p.signup_ip) ipCounts[p.signup_ip] = (ipCounts[p.signup_ip] || 0) + 1;
  });

  const pending = (redemptions || []).filter(r => r.status === "pending");
  const resolved = (redemptions || []).filter(r => r.status !== "pending").slice(0, 15);

  const { data: pendingUsersFull } = await sb.rpc("admin_get_pending_users");
  let blockedUsers = (pendingUsersFull && pendingUsersFull.length) ? pendingUsersFull : (profilesOverview || []).filter(p => p.is_blocked);

  const { data: subRequests } = await sb
    .from("subscription_requests")
    .select("*, profiles!subscription_requests_user_id_fkey(username)")
    .order("created_at", { ascending: true });
  const plans = await loadPlans();
  const pendingSubs = (subRequests || []).filter(s => s.status === "pending");

  const { data: reports } = await sb
    .from("video_reports")
    .select("*, videos(title, video_url), profiles!video_reports_reporter_id_fkey(username)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const { data: stats } = await sb.rpc("admin_get_stats");

  main.innerHTML = `
    <h1 class="page-title">🛠 Panel de Admin</h1>

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
    <p class="page-sub">${pending.length} canje${pending.length === 1 ? "" : "s"} · ${pendingSubs.length} pago${pendingSubs.length === 1 ? "" : "s"} de plan · ${(reports || []).length} reporte${(reports || []).length === 1 ? "" : "s"} pendiente${(reports || []).length === 1 ? "" : "s"}</p>

    ${reports && reports.length ? `
      <h3>🚩 Videos reportados</h3>
      ${reports.map(r => `
        <div class="form-card" style="margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
            <div>
              <div style="font-weight:600;">${escapeHtml(r.videos?.title || "video eliminado")}</div>
              <div style="color:var(--text-dim); font-size:12px;">Reportado por @${escapeHtml(r.profiles?.username || "usuario")} · ${new Date(r.created_at).toLocaleString("es-AR")}</div>
              <div style="margin-top:6px; font-size:13px; color:var(--gold);">Motivo: ${escapeHtml(r.reason)}</div>
              ${r.videos?.video_url ? `<a href="${r.videos.video_url}" target="_blank" rel="noopener" style="font-size:12px; color:var(--text-dim);">Ver video →</a>` : ""}
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn" style="background:var(--red); color:#fff;" onclick="handleDeleteVideo('${r.video_id}')">🗑 Eliminar video</button>
              <button class="btn-outline" onclick="handleDismissReport('${r.id}')">Descartar</button>
            </div>
          </div>
        </div>
      `).join("")}` : ""}

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
      <p style="color:var(--text-dim); font-size:12px; margin-bottom:12px;">Toda cuenta nueva arranca así hasta que la verifiques. Revisá que el email tenga sentido y verificala.</p>
      ${blockedUsers.map(u => `
        <div class="ledger-row">
          <span>@${escapeHtml(u.username)} · ${escapeHtml(u.email || "")} · ${new Date(u.created_at).toLocaleDateString("es-AR")}</span>
          <button class="btn-outline" style="padding:4px 12px; font-size:12px;" onclick="handleUnblockUser('${u.id}')">✓ Verificar</button>
        </div>
      `).join("")}` : ""}

    <h3 style="margin-top:32px;">🔍 Buscar y gestionar cualquier cuenta</h3>
    <div class="form-card" style="margin-bottom:14px;">
      <div style="display:flex; gap:8px;">
        <input type="text" id="userSearchInput" placeholder="Nombre de usuario o email..." style="flex:1; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:inherit;">
        <button class="btn" onclick="handleUserSearch()">Buscar</button>
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
}

async function handleDeleteVideo(videoId) {
  if (!confirm("¿Eliminar este video para siempre? Se borran también sus likes, comentarios y reportes.")) return;
  const { data, error } = await sb.rpc("admin_delete_video", { p_video_id: videoId });
  if (error || !data.ok) { showToast("No se pudo eliminar"); return; }
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

async function handleUserSearch() {
  const query = document.getElementById("userSearchInput").value.trim();
  const resultsEl = document.getElementById("userSearchResults");
  if (!query) { resultsEl.innerHTML = ""; return; }

  resultsEl.innerHTML = "Buscando...";
  const { data, error } = await sb.rpc("admin_search_users", { p_query: query });

  if (error || !data || !data.length) {
    resultsEl.innerHTML = `<p style="color:var(--text-dim); font-size:13px;">Sin resultados.</p>`;
    return;
  }

  resultsEl.innerHTML = data.map(u => `
    <div class="form-card" style="margin-bottom:10px;">
      <div style="font-weight:600;">@${escapeHtml(u.username)} ${u.ban_reason ? `<span style="color:var(--red); font-size:11px;">🚫 BANEADO</span>` : u.is_blocked ? `<span style="color:var(--gold); font-size:11px;">🕒 pendiente</span>` : ""}</div>
      <div style="color:var(--text-dim); font-size:12px;">${escapeHtml(u.email || "")} · ${u.points_balance} pts · desde ${new Date(u.created_at).toLocaleDateString("es-AR")}</div>
      <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn-outline" style="padding:4px 10px; font-size:12px;" onclick="handleAdjustPoints('${u.id}', '${escapeHtml(u.username)}')">± Ajustar puntos</button>
        ${u.ban_reason
          ? `<button class="btn-outline" style="padding:4px 10px; font-size:12px;" onclick="handleUnbanUser('${u.id}')">Levantar ban</button>`
          : `<button class="btn-outline" style="padding:4px 10px; font-size:12px; color:var(--red);" onclick="handleBanUser('${u.id}', '${escapeHtml(u.username)}')">🚫 Banear</button>`}
        <button class="btn-outline" style="padding:4px 10px; font-size:12px; color:var(--red);" onclick="handleDeleteAccount('${u.id}', '${escapeHtml(u.username)}')">🗑 Eliminar cuenta</button>
      </div>
    </div>
  `).join("");
}

async function handleAdjustPoints(userId, username) {
  const amountStr = prompt(`Ajustar puntos de @${username}.\n\nPoné un número negativo para descontar (ej: -100), o positivo para sumar (ej: 50):`);
  if (amountStr === null || amountStr.trim() === "") return;
  const amount = parseInt(amountStr, 10);
  if (isNaN(amount)) { showToast("Eso no es un número válido"); return; }

  const reason = prompt("Motivo (para el registro interno):") || "";

  const { data, error } = await sb.rpc("admin_adjust_points", { p_user_id: userId, p_amount: amount, p_reason: reason });
  if (error || !data.ok) { showToast("No se pudo ajustar"); return; }
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
  const confirmText = prompt(`Esto borra TODO de @${username} para siempre (videos, puntos, comentarios, todo). No se puede deshacer.\n\nEscribí "ELIMINAR" para confirmar:`);
  if (confirmText !== "ELIMINAR") { showToast("Cancelado"); return; }

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
  if (error) { main.innerHTML = `<p class="error-msg">${error.message}</p>`; return; }

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

let plansCache = null;

async function loadPlans() {
  if (plansCache) return plansCache;
  const { data } = await sb.from("plans").select("*").order("price_ars", { ascending: true });
  plansCache = data || [];
  return plansCache;
}

async function renderPlans() {
  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando planes...</p>`;
  const plans = await loadPlans();

  const { data: paymentInfo } = await sb.from("app_text_config").select("*");
  const cvu = paymentInfo?.find(c => c.key === "payment_cvu")?.value || "—";
  const alias = paymentInfo?.find(c => c.key === "payment_alias")?.value || "—";

  const { data: myRequests } = await sb
    .from("subscription_requests")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(5);

  main.innerHTML = `
    <h1 class="page-title">Planes</h1>
    <p class="page-sub">Más plan, más boost, menos comisión al retirar.</p>

    <div class="form-card" style="margin-bottom:20px; border-color:var(--gold-dim);">
      <h3 style="margin-top:0;">💳 Cómo pagar un plan</h3>
      <p style="font-size:13px; color:var(--text-dim); margin-bottom:12px;">
        Transferí el monto de tu plan a estos datos, y después reportalo abajo con el número de comprobante.
        Confirmamos manualmente y te activamos el plan (puede demorar unas horas).
      </p>
      <div style="font-size:13px; line-height:1.8;">
        <div>CVU: <strong class="mono">${escapeHtml(cvu)}</strong></div>
        <div>Alias: <strong class="mono">${escapeHtml(alias)}</strong></div>
      </div>
      <div style="margin-top:14px; padding-top:14px; border-top:1px solid var(--border); font-size:13px;">
        📧 Mandá el comprobante de la transferencia a <strong class="mono" style="color:var(--gold)">ezequielmarcosrodriguez@gmail.com</strong>
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
      <button class="btn" style="width:100%; margin-top:10px;" onclick="this.closest('div[style*=fixed]').remove(); switchTab('plans');">Listo, ya lo anoté</button>
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
