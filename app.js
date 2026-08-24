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
let loadedEmbeds = new Set(); // video_id -> reproductor real cargado ahora mismo


document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("lsStudioLiveStyles")) return;
  const style = document.createElement("style");
  style.id = "lsStudioLiveStyles";
  style.textContent = `
    .ls-studio-live-section{margin-bottom:18px}
    .ls-studio-live-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}
    .ls-studio-live-head h3{margin:0;font-size:12px;letter-spacing:.04em}
    .ls-studio-live-head span{font-size:9px;color:var(--text-dim)}
    .ls-studio-live-card{display:grid;grid-template-columns:150px 1fr auto;gap:13px;align-items:center;min-height:92px;padding:10px;border:1px solid rgba(34,197,94,.25);border-radius:14px;background:linear-gradient(90deg,rgba(34,197,94,.045),transparent 45%),var(--panel);cursor:pointer;margin-bottom:9px;overflow:hidden}
    .ls-studio-live-preview{aspect-ratio:16/9;border-radius:10px;background:#050607;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
    .ls-studio-live-preview img{width:100%;height:100%;object-fit:cover}
    .ls-studio-live-chip{position:absolute;top:6px;left:6px;padding:3px 6px;border-radius:6px;background:#dc2626;color:#fff;font-size:8px;font-weight:900}
    .ls-studio-live-title{font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ls-studio-live-user{margin-top:5px;font-size:10px;color:var(--text-dim)}
    .ls-studio-live-meta{margin-top:7px;font-size:9px;color:var(--green)}
    .ls-studio-live-open{padding:8px 10px;border-radius:9px;border:1px solid rgba(34,197,94,.28);color:var(--green);font-size:10px;font-weight:800}
    .ls-live-viewer-layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:14px;min-height:540px}
    .ls-live-video-shell,.ls-live-chat{border:1px solid var(--border);border-radius:15px;background:var(--panel);overflow:hidden}
    .ls-live-video-area{aspect-ratio:16/9;background:#000;display:flex;align-items:center;justify-content:center}
    .ls-live-video-placeholder{text-align:center;color:var(--text-dim);padding:20px}
    .ls-live-video-placeholder .ico{font-size:44px;margin-bottom:8px}
    .ls-live-details{padding:13px 14px;border-top:1px solid var(--border)}
    .ls-live-chat{display:flex;flex-direction:column;min-height:0}
    .ls-live-chat-head{padding:12px 13px;border-bottom:1px solid var(--border);font-size:11px;font-weight:800}
    .ls-live-chat-messages{flex:1;overflow-y:auto;padding:10px;min-height:340px}
    .ls-live-chat-message{margin-bottom:8px;font-size:10px;line-height:1.4;word-break:break-word}
    .ls-live-chat-message b{color:var(--gold);margin-right:4px}
    .ls-live-chat-form{display:flex;gap:7px;padding:10px;border-top:1px solid var(--border)}
    .ls-live-chat-form input{flex:1;min-width:0;padding:9px 10px;border:1px solid var(--border);border-radius:9px;background:var(--ink);color:var(--text)}
    .ls-live-chat-form button{width:auto;margin:0;padding:8px 11px}
    @media(max-width:760px){.ls-studio-live-card{grid-template-columns:120px 1fr}.ls-studio-live-open{display:none}.ls-live-viewer-layout{grid-template-columns:1fr}.ls-live-chat-messages{min-height:220px;max-height:330px}}
  `;
  document.head.appendChild(style);
});


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
document.addEventListener("DOMContentLoaded", async () => {
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

  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    currentUser = session.user;
    await loadProfile();
    renderApp();
    if (window.sharedVideoId) openSharedVideo(window.sharedVideoId);
  } else {
    renderLanding();
  }

  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      showNewPasswordForm();
      return;
    }
    if (event === "SIGNED_IN") {
      if (currentUser && currentUser.id === session.user.id) {
        // Ya estábamos logueados con esta cuenta: Supabase solo está
        // revalidando el token en segundo plano (pasa al volver a la
        // pestaña). No reiniciamos la pantalla en la que estaba el usuario.
        return;
      }
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

function renderAuthForm(mode) {
  const wrap = document.getElementById("globalModalWrap");
  const isSignup = mode === "signup";
  wrap.innerHTML = `
    <div style="position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.15s ease;" onclick="if(event.target===this) closeAuthModal()">
      <div class="auth-box" style="margin:0; animation:scaleIn 0.15s ease;">
        <button onclick="closeAuthModal()" style="position:absolute; top:16px; right:20px; background:none; border:none; color:var(--text-dim); font-size:20px; cursor:pointer;">✕</button>
        <div style="display:flex; gap:6px; margin-bottom:18px;">
          <button onclick="renderAuthForm('login')" class="${!isSignup ? "btn" : "btn-outline"}" style="flex:1; padding:8px; font-size:13px;">Iniciar sesión</button>
          <button onclick="renderAuthForm('signup')" class="${isSignup ? "btn" : "btn-outline"}" style="flex:1; padding:8px; font-size:13px;">Crear cuenta</button>
        </div>
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
          <div class="password-field-wrap">
            <input type="password" id="authPassword" placeholder="••••••••">
            <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('authPassword', this)">👁</button>
          </div>
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
      </div>
    </div>`;
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
  renderApp();
}

function showNewPasswordForm() {
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div style="position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px;">
      <div class="auth-box" style="margin:0;">
        <h2>Elegí tu nueva contraseña</h2>
        <div class="field">
          <label>Nueva contraseña</label>
          <div class="password-field-wrap">
            <input type="password" id="newPasswordInput" placeholder="••••••••">
            <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('newPasswordInput', this)">👁</button>
          </div>
        </div>
        <button class="btn" style="width:100%" onclick="submitNewPassword()">Guardar contraseña</button>
        <div id="newPasswordError" class="error-msg"></div>
      </div>
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

  document.getElementById("globalModalWrap").innerHTML = "";
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
  closeAuthModal();
  renderApp();
  if (window.sharedVideoId) openSharedVideo(window.sharedVideoId);
}

async function handleLogout() {
  clearAllWatchIntervals();

  if (notifRealtimeChannel) {
    await sb.removeChannel(notifRealtimeChannel);
    notifRealtimeChannel = null;
  }

  await sb.auth.signOut();
}

async function loadProfile() {
  const [profileResult, statusResult] = await Promise.all([
    sb.rpc("get_my_profile_data"),
    sb.rpc("get_my_status")
  ]);

  if (!profileResult.error && profileResult.data?.ok) {
    currentProfile = profileResult.data.profile;
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

async function animateLandingOdometer() {
  const el = document.getElementById("landingOdometer");
  const { data, error } = await sb.rpc("get_todays_total_points");
  if (!error && data !== null) {
    el.textContent = data.toLocaleString("es-AR");
  } else {
    el.textContent = "0";
  }

  // Refresca cada 60s para que se sienta viva, siempre con el dato real
  setInterval(async () => {
    const { data: fresh } = await sb.rpc("get_todays_total_points");
    if (fresh !== null && fresh !== undefined) el.textContent = fresh.toLocaleString("es-AR");
  }, 60000);
}

// ============================================================
// APP SHELL
// ============================================================
function toggleMobileMenu() {
  const existing = document.getElementById("mobileMenuPanel");
  if (existing) { closeMobileMenu(); return; }

  const overlay = document.createElement("div");
  overlay.className = "mobile-menu-overlay";
  overlay.id = "mobileMenuOverlay";
  overlay.onclick = closeMobileMenu;

  const panel = document.createElement("div");
  panel.className = "mobile-menu-panel";
  panel.id = "mobileMenuPanel";
  panel.innerHTML = `
    <button onclick="switchTab('feed'); closeMobileMenu();">Mirar</button>
    <button onclick="switchTab('foryou'); closeMobileMenu();">✨ Para Ti</button>
    <button onclick="switchTab('upload'); closeMobileMenu();">Subir video</button>
    <button onclick="switchTab('profile'); closeMobileMenu();">Mi Perfil</button>
    <button onclick="switchTab('users'); closeMobileMenu();">👥 Usuarios</button>
    <button onclick="switchTab('directos'); closeMobileMenu();" style="color:var(--red)">🔴 Directos</button>
    ${!window.__navWalletLocked ? `<button onclick="switchTab('wallet'); closeMobileMenu();">Billetera</button>` : ""}
    ${!window.__navPlansLocked ? `<button onclick="switchTab('plans'); closeMobileMenu();">Planes</button>` : ""}
    <button onclick="switchTab('store'); closeMobileMenu();">🛍️ Tienda</button>
    <button onclick="switchTab('ranking'); closeMobileMenu();">🏆 Ranking</button>
    <button onclick="openChangelogHistory(); closeMobileMenu();">📢 Novedades</button>
    <button onclick="showTutorialModal(); closeMobileMenu();">❓ Cómo funciona</button>
    ${currentProfile.is_admin ? `<button onclick="switchTab('admin'); closeMobileMenu();" style="color:var(--green)">🛠 Admin</button>` : ""}
    <div style="border-top:1px solid var(--border); margin-top:10px; padding-top:10px;">
      <button onclick="handleLogout(); closeMobileMenu();" style="color:var(--red);">Salir</button>
    </div>`;

  document.body.appendChild(overlay);
  document.body.appendChild(panel);
}

function closeMobileMenu() {
  document.getElementById("mobileMenuOverlay")?.remove();
  document.getElementById("mobileMenuPanel")?.remove();
}


// ============================================================
// COMPATIBILIDAD LEGACY — Android/celulares de recursos limitados
// No cambia la experiencia normal: solo activa ajustes livianos cuando
// el navegador/dispositivo parece antiguo o muy limitado.
// ============================================================
function detectLiveScrollExperience() {
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
  closeLiveScrollModeInfo();

  const overlay = document.createElement("div");
  overlay.id = "lsModeInfoOverlay";
  overlay.className = "ls-mode-overlay";
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeLiveScrollModeInfo();
  });

  const isLegacy = mode === "legacy";

  overlay.innerHTML = `
    <div class="ls-mode-panel" role="dialog" aria-modal="true" aria-label="Modo de experiencia LiveScroll">
      <div class="ls-mode-handle"></div>

      <div class="ls-mode-head">
        <div class="ls-mode-icon">${isLegacy ? "🪶" : "✨"}</div>
        <div class="ls-mode-title">
          <strong>LiveScroll ${isLegacy ? "Legacy" : "Nova"}</strong>
          <span>${isLegacy ? "Experiencia optimizada" : "Experiencia completa"}</span>
        </div>
      </div>

      <div class="ls-mode-current">
        <strong>Este dispositivo está usando ${isLegacy ? "Legacy" : "Nova"}.</strong><br>
        LiveScroll elige automáticamente el modo que mejor se adapta al dispositivo.
      </div>

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
          <div><strong>Adaptación automática</strong><span>Si LiveScroll detecta un dispositivo limitado, puede activar Legacy automáticamente.</span></div>
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

function initLiveScrollExperienceMode() {
  const mode = detectLiveScrollExperience();
  window.__liveScrollExperienceMode = mode;
  window.__liveScrollLegacyMode = mode === "legacy";

  document.documentElement.classList.toggle("ls-legacy", mode === "legacy");
  document.documentElement.classList.toggle("ls-nova", mode === "nova");

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

  let badge = document.getElementById("lsExperienceBadge");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "lsExperienceBadge";
    badge.className = "ls-experience-badge";
    document.body.appendChild(badge);
  }

  badge.textContent = mode === "legacy"
    ? "🪶 LiveScroll Legacy"
    : "✨ LiveScroll Nova";

  badge.setAttribute("role", "button");
  badge.setAttribute("tabindex", "0");
  badge.setAttribute("aria-label", `Ver información sobre LiveScroll ${mode === "legacy" ? "Legacy" : "Nova"}`);

  if (!badge.dataset.modeInfoBound) {
    badge.dataset.modeInfoBound = "1";
    badge.addEventListener("click", openLiveScrollModeInfo);
    badge.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLiveScrollModeInfo();
      }
    });
  }

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
        <strong>🪶 LiveScroll Legacy activado</strong>
        Optimizamos automáticamente la experiencia para que LiveScroll funcione mejor en este dispositivo.
      `;
    } else {
      toast.innerHTML = `
        <strong>✨ LiveScroll Nova</strong>
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
  // Anti-spam POR CUENTA. Si en el mismo teléfono se cierra sesión y entra
  // otra cuenta, esa cuenta debe poder recibir sus propias Novedades.
  if (window.__lsStartupUserId !== currentUser?.id) {
    window.__lsStartupUserId = currentUser?.id || null;
    window.__lsStartupOptionalModalShown = false;
  }

  initLiveScrollExperienceMode();
  setTimeout(applySeasonalTheme, 0);
  ensureModernMobileStyles();

  document.getElementById("landingView").classList.add("hidden");
  document.getElementById("appView").classList.remove("hidden");

  // 5.4.6: mostramos respuesta inmediata mientras resolvemos
  // las pocas cosas necesarias para construir la navegación.
  const appView = document.getElementById("appView");
  if (appView) appView.innerHTML = renderFastSkeleton(7, "feed");

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
    ${!plansLocked ? `<button id="tab-plans" onclick="switchTab('plans')">Planes</button>` : ""}
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
    <button id="notifBell" onclick="toggleNotifPanel()" style="position:relative; background:none; border:none; font-size:18px; cursor:pointer; margin-left:4px;">
      🔔<span id="notifBadge" class="hidden" style="position:absolute; top:-4px; right:-6px; background:var(--red); color:#fff; font-size:10px; border-radius:10px; padding:1px 5px;"></span>
    </button>
    <button class="btn-outline nav-logout-btn" style="margin-left:10px" onclick="handleLogout()">Salir</button>`;

  // Lo visible primero.
  checkBlockedStatus();
  switchTab("feed");

  // Lo secundario ya no bloquea la aparición del Feed.
  // Realtime se conecta enseguida y el historial se carga en paralelo.
  subscribeToNotifications();

  Promise.allSettled([
    loadNotifications(),
    checkBoostStatus(),
    checkPendingContent()
  ]).catch(() => {});
}

const CHANGELOG_AUTO_BASELINE_VERSION = 24; // 5.8.1: desde la 25 en adelante el aviso tiene fallback automático

// Evita el efecto "cerré un cartel y apareció otro".
// Términos y tutorial conservan prioridad, pero las novedades/teasers opcionales
// se limitan a UNA interrupción automática por sesión.
window.__lsStartupOptionalModalShown = window.__lsStartupOptionalModalShown || false;

async function checkPendingContent() {
  if (!currentUser?.id) return;

  const seenKey = `livescroll_changelog_seen_${currentUser.id}`;

  // Leemos backend + historial en paralelo.
  // Si el backend por algún motivo no marca "pending", el historial funciona
  // como respaldo desde la versión interna 25 en adelante.
  const [pendingResult, historyResult] = await Promise.allSettled([
    sb.rpc("get_pending_content", { p_user_id: currentUser.id }),
    sb.rpc("get_changelog_history_v2", { p_limit: 200 })
  ]);

  const pendingData =
    pendingResult.status === "fulfilled"
      ? pendingResult.value?.data
      : null;

  const history =
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
  const locallySeen = storedSeenRaw === null
    ? 0
    : Number(storedSeenRaw || 0);

  // Si es un dispositivo nuevo, locallySeen=0. Eso permite que el teléfono
  // muestre en un solo "Mientras no estabas..." las versiones que tenga
  // disponibles en el historial aunque la cuenta las haya visto en otro equipo.

  // Si el usuario se perdió varias versiones, mostramos TODAS juntas
  // en "Mientras no estabas..." en lugar de abrir un popup por versión.
  const unseenRows = history
    .filter(e => Number(e.version || 0) > locallySeen)
    .sort((a, b) => {
      const va = Number(a.version || 0);
      const vb = Number(b.version || 0);
      if (va !== vb) return va - vb;
      return Number(a.sort_order || 0) - Number(b.sort_order || 0);
    });

  // 1) Contenido obligatorio / tutorial conservan prioridad.
  if (pendingData?.terms_pending) {
    showTermsUpdateModal();
    return;
  }

  if (pendingData?.tutorial_pending) {
    showTutorialModal();
    return;
  }

  // 2) Backend normal: si marca Novedades pendientes, mostramos eso
  // y completamos con la versión visible más reciente si hiciera falta.
  if (pendingData?.changelog_pending && !window.__lsStartupOptionalModalShown) {
    let entries = Array.isArray(pendingData.changelog_entries)
      ? [...pendingData.changelog_entries]
      : [];

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
            5.8.0 → 5.9.0 → <strong>6.0.0</strong>
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


const tutorialSteps = [
  { icon: "👋", title: "¡Bienvenido a LiveScroll!", text: "Acá subís y mirás clips de Kick, Twitch, YouTube y TikTok, y ganás puntos por cada cosa que hacés." },
  { icon: "🎬", title: "Subí tus clips", text: "Compartí el link de tu video favorito o subí tu propio archivo. Ganás puntos al instante." },
  { icon: "👀", title: "Mirá y ganá", text: "Cada minuto que mirás contenido de otros usuarios suma puntos — y si ellos miran el tuyo, también ganás vos." },
  { icon: "🔴", title: "Directos", text: "Fijate quién de la comunidad está transmitiendo ahora mismo en Kick o Twitch, en el apartado Directos." },
  { icon: "🛍️", title: "Tienda y racha diaria", text: "Entrá todos los días para sumar tu racha, y usá tus puntos en la Tienda para desbloquear emojis y beneficios." },
  { icon: "🚀", title: "¡Listo, a explorar!", text: "Eso es todo lo básico. El resto lo vas descubriendo scrolleando. ¡Que lo disfrutes!" },
];
let tutorialStepIndex = 0;

function showTutorialModal() {
  tutorialStepIndex = 0;
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="modal-overlay" style="z-index:135;">
      <div class="modal-box" id="tutorialBox" style="max-width:380px;">
        <div class="modal-box-header"><h2 id="tutorialStepTitle"></h2></div>
        <div class="modal-box-body" id="tutorialStepBody" style="text-align:center;"></div>
        <div class="modal-box-footer">
          <div style="display:flex; justify-content:center; gap:6px; margin-bottom:12px;" id="tutorialDots"></div>
          <div style="display:flex; gap:10px;">
            <button class="btn-outline" id="tutorialSkipBtn" onclick="handleAcceptTutorial()" style="flex:1;">Saltear</button>
            <button class="btn" id="tutorialNextBtn" onclick="tutorialNextStep()" style="flex:1;">Siguiente</button>
          </div>
        </div>
      </div>
    </div>`;
  renderTutorialStep();
}

function renderTutorialStep() {
  const step = tutorialSteps[tutorialStepIndex];
  const isLast = tutorialStepIndex === tutorialSteps.length - 1;

  document.getElementById("tutorialStepTitle").textContent = step.title;
  document.getElementById("tutorialStepBody").innerHTML = `
    <div style="font-size:56px; margin:10px 0 18px;">${step.icon}</div>
    <p style="color:var(--text-dim); font-size:14px; line-height:1.6; margin:0 0 8px;">${escapeHtml(step.text)}</p>`;
  document.getElementById("tutorialDots").innerHTML = tutorialSteps.map((_, i) =>
    `<div style="width:${i === tutorialStepIndex ? 18 : 6}px; height:6px; border-radius:4px; background:${i === tutorialStepIndex ? "var(--gold)" : "var(--border)"}; transition:width 0.2s ease;"></div>`
  ).join("");
  document.getElementById("tutorialSkipBtn").classList.toggle("hidden", isLast);
  document.getElementById("tutorialNextBtn").textContent = isLast ? "¡Empezar!" : "Siguiente";
  document.getElementById("tutorialNextBtn").style.flex = isLast ? "1 1 100%" : "1";
}

function tutorialNextStep() {
  if (tutorialStepIndex < tutorialSteps.length - 1) {
    tutorialStepIndex++;
    renderTutorialStep();
  } else {
    handleAcceptTutorial();
  }
}

async function handleAcceptTutorial() {
  await sb.rpc("acknowledge_content", { p_user_id: currentUser.id, p_content_key: "tutorial" });
  document.getElementById("globalModalWrap").innerHTML = "";
  checkPendingContent(); // por si también hay changelog pendiente, se muestra después
}

function showTermsUpdateModal() {
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="modal-overlay" style="z-index:130;">
      <div class="modal-box">
        <div class="modal-box-header"><h2>📋 Actualizamos los Términos</h2></div>
        <div class="modal-box-body">
        <p style="color:var(--text-dim); font-size:13px;">Cambiamos nuestros Términos y Condiciones. Por favor, revisalos antes de seguir usando LiveScroll.</p>
        <a href="terminos.html" target="_blank" class="btn-outline" style="display:block; text-align:center; text-decoration:none; margin-bottom:14px;">Leer Términos y Condiciones</a>
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

function showChangelogModal(entries) {
  const labels = {
    nuevo: { title: "🆕 Nuevo", color: "var(--green)" },
    actualizado: { title: "🔄 Actualizado", color: "var(--gold)" },
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
    byVersion[version].cats[e.category] = byVersion[version].cats[e.category] || [];
    byVersion[version].cats[e.category].push(e.content);
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
                <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text);font-weight:700;margin-bottom:10px;">LiveScroll v${escapeHtml(label)}</div>
                ${["emergencia","nuevo","actualizado","reparado","proximamente"].map(cat => info.cats[cat] ? `
                  <div style="margin-bottom:11px;">
                    <div style="font-weight:600;font-size:12px;color:${labels[cat]?.color || "var(--text-dim)"};margin-bottom:5px;">${labels[cat]?.title || escapeHtml(cat)}</div>
                    ${info.cats[cat].map(c => `<div style="font-size:13px;color:var(--text-dim);margin-bottom:5px;line-height:1.45;">• ${escapeHtml(c)}</div>`).join("")}
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
    "5.9.0":"CORE",
    "6.0.0":"NEW ERA"
  };
  const stage = stageNames[newestLabel] || "NEXT ERA";

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
          <div class="ls-next-era-kicker">LIVE SCROLL · NEXT ERA</div>
          <h2 class="ls-next-era-title">${multipleVersions ? "Mientras no estabas..." : `v${escapeHtml(newestLabel)} · ${stage}`}</h2>
          <div class="ls-next-era-sub">
            ${multipleVersions
              ? "Te perdiste algunas etapas del camino. Acá tenés todo lo que cambió desde la última vez que estuviste."
              : newestLabel === "6.0.0"
                ? "Llegamos. Bienvenido a la nueva era de LiveScroll."
                : newestLabel === "5.8.1"
                  ? "Una actualización enfocada en seguridad, privacidad y protección de tu cuenta."
                  : newestLabel === "5.8.2"
                    ? "Los puntos evolucionan: más recompensas, Boost más accesible y una economía más clara."
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
                    <div class="ls-next-era-version-name">LiveScroll v${escapeHtml(label)}</div>
                    ${info.releaseDate ? `<div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-dim);margin-top:3px;">${escapeHtml(formatLaunchDate(info.releaseDate))}</div>` : ""}
                  </div>
                  ${v === newest ? `<span class="ls-next-era-latest">MÁS RECIENTE</span>` : ""}
                </div>
                ${["emergencia","nuevo","actualizado","reparado","proximamente"].map(cat => info.cats[cat] ? `
                  <div class="ls-next-era-category">
                    <div class="ls-next-era-category-title" style="color:${labels[cat]?.color || "var(--text-dim)"}">${labels[cat]?.title || escapeHtml(cat)}</div>
                    ${info.cats[cat].map(c => `<div class="ls-next-era-line">• ${escapeHtml(c)}</div>`).join("")}
                  </div>`:"").join("")}
              </div>`;
          }).join("")}
        </div>

        <div class="ls-next-era-foot">
          <button class="ls-next-era-btn" onclick="handleAcceptChangelog()">
            ${multipleVersions ? "Ya estoy al día ✓" : newestLabel === "6.0.0" ? "Entrar a la nueva era →" : "Continuar el camino →"}
          </button>
          <div class="ls-next-era-road">5.4.6 → 5.5.7 → 5.6.8 → 5.7.9 → 5.8.0 → 5.8.1 → 5.8.2 → 5.9.0 → 6.0.0</div>
        </div>
      </div>
    </div>`;
}


// ============================================================
// NOVEDADES — SISTEMA DINÁMICO DESDE 5.8.1
// El cartel toma la versión visible más reciente del historial cuando existe
// una actualización pendiente, evitando quedar clavado en una versión anterior.
// ============================================================

async function openChangelogHistory() {
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="modal-overlay" style="z-index:100;" onclick="if(event.target===this) closeChangelogHistory()">
      <div class="modal-box" style="max-width:440px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;">
        <div class="modal-box-header">
          <h2>📢 Novedades</h2>
          <button onclick="closeChangelogHistory()" style="background:none;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;">✕</button>
        </div>
        <div class="modal-box-body" style="overflow-y:auto;min-height:0;">
          <p style="color:var(--text-dim);font-size:12px;margin-top:0;margin-bottom:16px;">
            Historial completo de las últimas versiones publicadas de LiveScroll.
          </p>
          <div id="changelogHistoryList">Cargando...</div>
        </div>
      </div>
    </div>`;

  const labels = {
    nuevo: { title: "🆕 Nuevo", color: "var(--green)" },
    actualizado: { title: "🔄 Actualizado", color: "var(--gold)" },
    emergencia: { title: "⚠️ Reparación de emergencia", color: "#facc15" },
    reparado: { title: "🛠️ Reparado", color: "#7dd3fc" },
    proximamente: { title: "🔜 Próximamente", color: "var(--text-dim)" }
  };

  // Pedimos más filas porque p_limit limita entradas, no versiones completas.
  const { data: entries, error } = await sb.rpc("get_changelog_history_v2", { p_limit: 200 });
  const list = document.getElementById("changelogHistoryList");
  if (!list) return;

  if (error || !entries || !entries.length) {
    list.innerHTML = `<p style="color:var(--text-dim);font-size:13px;">Todavía no hay novedades publicadas.</p>`;
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

  // Agrupamos por la versión que ve el usuario, NO por el número interno.
  const byDisplayVersion = {};
  entries.forEach(e => {
    const display = String(e.display_version || `${e.version}.0.0`);
    if (!byDisplayVersion[display]) {
      byDisplayVersion[display] = {
        display,
        releaseDate: e.release_date || null,
        internalVersions: new Set(),
        cats: {}
      };
    }

    if (!byDisplayVersion[display].releaseDate && e.release_date) {
      byDisplayVersion[display].releaseDate = e.release_date;
    }

    byDisplayVersion[display].internalVersions.add(Number(e.version || 0));
    byDisplayVersion[display].cats[e.category] =
      byDisplayVersion[display].cats[e.category] || [];

    // Evitamos líneas duplicadas si una versión tuvo más de una publicación interna.
    if (!byDisplayVersion[display].cats[e.category].includes(e.content)) {
      byDisplayVersion[display].cats[e.category].push(e.content);
    }
  });

  const versions = Object.keys(byDisplayVersion).sort(compareSemverDesc);
  const currentDisplayVersion = versions[0];

  const formatReleaseDate = (value) => {
    if (!value) return "Fecha no registrada";
    const d = new Date(`${value}T12:00:00`);
    return Number.isNaN(d.getTime())
      ? String(value)
      : d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
  };

  list.innerHTML = versions.map(display => {
    const info = byDisplayVersion[display];

    return `
      <div style="margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid var(--border);">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text-dim);">
            v${escapeHtml(display)} · ${escapeHtml(formatReleaseDate(info.releaseDate))}
          </div>
          ${display === currentDisplayVersion
            ? `<span style="font-size:10px;font-weight:700;color:#12130f;background:var(--green);padding:2px 8px;border-radius:20px;letter-spacing:.04em;">ACTUAL</span>`
            : ""}
        </div>

        ${["emergencia","nuevo","actualizado","reparado","proximamente"].map(cat =>
          info.cats[cat] ? `
            <div style="margin-bottom:10px;">
              <div style="font-weight:600;font-size:13px;color:${labels[cat].color};margin-bottom:6px;">
                ${labels[cat].title}
              </div>
              ${info.cats[cat].map(c =>
                `<div style="font-size:13px;color:var(--text-dim);margin-bottom:4px;">• ${escapeHtml(c)}</div>`
              ).join("")}
            </div>`
          : ""
        ).join("")}
      </div>`;
  }).join("");
}

function closeChangelogHistory() {
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

async function checkAndShowLoginStreak() {
  const { data } = await sb.rpc("get_login_streak_status", { p_user_id: currentUser.id });
  const banner = document.getElementById("loginStreakBannerWrap");
  if (!data || !data.ok || !data.rewards || !data.rewards.length) { if (banner) banner.innerHTML = ""; return; }

  window.__loginStreakData = data;
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
  const { data, error } = await sb.rpc("delete_own_video", { p_video_id: videoId });
  if (error || !data.ok) { showToast("No se pudo eliminar el video"); return; }
  showToast("Video eliminado");
  lsPerfCache.profileVideos.at = 0;
  lsPerfCache.feed.at = 0;
  renderProfile();
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
let lsTabRenderToken = 0;

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

function lsCacheFresh(entry, maxAgeMs) {
  return !!entry?.data && (Date.now() - entry.at) < maxAgeMs;
}

function switchTab(tab) {
  stopConnectedLiveRefresh();

  clearAllWatchIntervals();
  currentTab = tab;
  const renderToken = ++lsTabRenderToken;

  document.querySelectorAll(".nav-links button").forEach(b => b.classList.remove("active"));
  const activeBtn = document.getElementById("tab-" + tab);
  if (activeBtn) activeBtn.classList.add("active");

  const main = document.getElementById("appView");

  // Feedback visual en el mismo frame del toque.
  if (main && ["feed","foryou","profile","users","directos","wallet","plans","store","ranking","admin"].includes(tab)) {
    const skeletonType = (tab === "feed" || tab === "foryou") ? "feed" : tab === "profile" ? "profile" : tab === "directos" ? "directos" : "generic";
    main.innerHTML = renderFastSkeleton(5, skeletonType);
  }

  if (tab === "feed") renderFeed(renderToken);
  if (tab === "foryou") renderForYou();
  if (tab === "upload") renderUpload();
  if (tab === "profile") renderProfile();
  if (tab === "users") renderUsersDirectory();
  if (tab === "directos") renderDirectos(renderToken);
  if (tab === "wallet") renderWallet();
  if (tab === "plans") renderPlans();
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

function updateBalanceUI() {
  const el = document.getElementById("navBalance");
  if (el) {
    el.textContent = currentProfile.points_balance + " pts";
    safePulseElement(el, "ls-balance-pop-safe");
  }
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
async function renderFeed(renderToken = lsTabRenderToken) {
  const main = document.getElementById("appView");
  if (!main) return;

  main.innerHTML = `
    <div id="loginStreakBannerWrap" class="login-streak-banner-float"></div>
    <div id="feedList">${renderFastSkeleton(7, "feed")}</div>`;
  checkAndShowLoginStreak();

  let videos = null;
  let error = null;

  if (lsCacheFresh(lsPerfCache.feed, 45000)) {
    videos = lsPerfCache.feed.data;
  } else {
    const result = await sb
      .from("videos")
      .select("*, profiles!videos_user_id_fkey(username, plan_id)")
      .order("created_at", { ascending: false })
      .limit(20);

    videos = result.data;
    error = result.error;

    if (!error && videos) {
      lsPerfCache.feed = { data:videos, at:Date.now() };
    }
  }

  // Si el usuario ya tocó otra pestaña, esta respuesta vieja no pisa la nueva vista.
  if (renderToken !== lsTabRenderToken || currentTab !== "feed") return;

  const list = document.getElementById("feedList");
  if (!list) return;
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
        <div class="feed-item${v.platform === "upload" ? " ls-upload-feed-item" : ""}" data-video-id="${v.id}">
          <div class="feed-phone">
            <div class="feed-embed-frame" id="embed-${v.id}">${getEmbedPlaceholderHtml(v)}</div>
            ${isMine ? `<div style="position:absolute; top:14px; left:14px; background:rgba(0,0,0,0.6); color:var(--gold); font-size:11px; padding:4px 10px; border-radius:20px; z-index:6;">Tu video · sin puntos</div>` : ""}
            <div class="feed-actions">
              <button class="feed-action-btn ${likedSet.has(v.id) ? "liked" : ""}" id="like-${v.id}" onclick="handleLike('${v.id}')">❤️</button>
              <button class="feed-action-btn" onclick="openComments('${v.id}')">💬</button>
              <button class="feed-action-btn" onclick="handleShare('${v.id}', '${encodeURIComponent(v.video_url)}')">🔗</button>
              ${!isMine ? `<button class="feed-action-btn" onclick="openReportModal('${v.id}')">🚩</button>` : ""}
            </div>
            <div class="feed-overlay">
              <div>
                <div class="title">${escapeHtml(v.title)}</div>
                <div class="author" style="cursor:pointer;" onclick="viewPublicProfile('${escapeHtml(v.profiles?.username || "")}')">@${escapeHtml(v.profiles?.username || "usuario")} ${getPlanBadgeHtml(v.profiles?.plan_id)} · ${v.platform}</div>
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

  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const top = Math.max(0, container.getBoundingClientRect().top);

  // Dejamos solo una pequeña zona segura inferior. La altura se calcula
  // según dónde empieza realmente el feed, así no desperdiciamos espacio.
  const safeBottom = 8;
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
  const isLegacyMode = document.body.classList.contains("ls-legacy");

  if (saveData || slowNetwork || isLegacyMode) return;

  el.innerHTML = `<div class="dbltap-like-zone" data-video-id="${video.id}" style="width:100%;height:100%;">
    <video src="${escapeHtml(video.video_url)}" controls muted loop playsinline preload="auto" style="width:100%;height:100%;object-fit:contain;"></video>
  </div>`;
  loadedEmbeds.add(video.id);
}

function activateLoadedEmbed(video) {
  if (!video) return;
  const player = document.querySelector(`#embed-${video.id} video`);
  if (player) {
    player.autoplay = true;
    player.play().catch(() => {});
  }
}

function pauseFeedMedia(videoId = null) {
  const selector = videoId
    ? `#embed-${videoId} video, #embed-${videoId} audio`
    : ".feed-item video, .feed-item audio";

  document.querySelectorAll(selector).forEach(media => {
    try { media.pause(); } catch (_) {}
  });
}

function pauseAllFeedMediaExcept(videoId) {
  document.querySelectorAll(".feed-item video, .feed-item audio").forEach(media => {
    const host = media.closest("[id^='embed-']");
    const hostId = host?.id?.replace("embed-", "");
    if (String(hostId) !== String(videoId)) {
      try { media.pause(); } catch (_) {}
    }
  });
}

function releaseFeedMediaElement(el) {
  if (!el) return;

  el.querySelectorAll("video, audio").forEach(media => {
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
    const keep = new Set([orderedIds[idx - 1], orderedIds[idx], orderedIds[idx + 1]].filter(Boolean));
    const nextId = orderedIds[idx + 1];
    if (nextId && videoMap[nextId]) preloadFeedVideo(videoMap[nextId]);

    Array.from(loadedEmbeds).forEach(id => {
      if (!keep.has(String(id))) unloadEmbed(id, videoMap[String(id)]);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const videoId = String(entry.target.dataset.videoId);
      if (entry.isIntersecting && entry.intersectionRatio > 0.58) {
        pauseAllFeedMediaExcept(videoId);
        loadEmbed(videoMap[videoId]);
        activateLoadedEmbed(videoMap[videoId]);
        keepWarmAround(videoId);
        startWatching(videoMap[videoId]);
      } else if (entry.intersectionRatio < 0.25) {
        pauseFeedMedia(videoId);
        stopWatching(videoId);
      }
    });
  }, { threshold:[0,.25,.58,1], rootMargin:"18% 0px 18% 0px" });

  document.querySelectorAll(".feed-item").forEach(el => observer.observe(el));
  feedObserverInstance = observer;

  if (videos[0]) {
    loadEmbed(videos[0]);
    activateLoadedEmbed(videos[0]);
    if (videos[1]) preloadFeedVideo(videos[1]);
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
      ${thumb.replace("<video ", `<video style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.7;pointer-events:none;" `)}
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
    return `<div class="dbltap-like-zone" data-video-id="${video.id}" style="width:100%; height:100%;">
      <video src="${escapeHtml(url)}" controls autoplay muted loop playsinline preload="auto" style="width:100%;height:100%;object-fit:contain;"></video>
    </div>`;
  }
  if (video.platform === "youtube") {
    const id = extractYoutubeId(url);
    if (id) return `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&mute=1&playsinline=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  }
  if (video.platform === "twitch") {
    return `<iframe src="https://player.twitch.tv/?video=${encodeURIComponent(url)}&parent=${location.hostname}&autoplay=true&muted=true" allowfullscreen></iframe>`;
  }
  if (video.platform === "kick") {
    return `<iframe src="${escapeHtml(url)}" allowfullscreen></iframe>`;
  }
  const icons = { tiktok: "🎵", kick: "🟢", twitch: "🟣" };
  return `<div class="feed-fallback">
    <div class="platform-icon">${icons[video.platform] || "▶️"}</div>
    <p>Este video se ve mejor en ${escapeHtml(video.platform)}</p>
    <a class="btn" href="${escapeHtml(url)}" target="_blank" rel="noopener">Abrir y mirar ahí</a>
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
          <div class="feed-item${v.platform === "upload" ? " ls-upload-feed-item" : ""}" data-video-id="${v.id}">
            <div class="feed-phone">
              <div class="feed-embed-frame" id="embed-${v.id}">${getEmbedPlaceholderHtml(v)}</div>
              ${isMine ? `<div style="position:absolute; top:14px; left:14px; background:rgba(0,0,0,0.6); color:var(--gold); font-size:11px; padding:4px 10px; border-radius:20px; z-index:6;">Tu video · sin puntos</div>` : ""}
              <div class="feed-actions">
                <button class="feed-action-btn ${likedSet.has(v.id) ? "liked" : ""}" id="like-${v.id}" onclick="handleLike('${v.id}')">❤️</button>
                <button class="feed-action-btn" onclick="openComments('${v.id}')">💬</button>
                <button class="feed-action-btn" onclick="handleShare('${v.id}', '${encodeURIComponent(v.video_url)}')">🔗</button>
                ${!isMine ? `<button class="feed-action-btn" onclick="openReportModal('${v.id}')">🚩</button>` : ""}
              </div>
              <div class="feed-overlay">
                <div>
                  <div class="title">${escapeHtml(v.title)}</div>
                  <div class="author">@${escapeHtml(authorInfo.username)} ${getPlanBadgeHtml(authorInfo.plan_id)} · ${v.platform}</div>
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
    if (id) return `<img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" alt="miniatura" loading="lazy">`;
  }

  if (video.platform === "upload") {
    if (video.thumbnail_url && isSafeUrl(video.thumbnail_url)) {
      return `<img src="${escapeHtml(video.thumbnail_url)}" alt="carátula del video" loading="lazy">`;
    }

    // Videos viejos sin carátula persistida: mostramos el propio MP4 como preview.
    if (isSafeUrl(video.video_url)) {
      return `<video src="${escapeHtml(video.video_url)}#t=0.3" preload="metadata" muted playsinline
        style="width:100%;height:100%;object-fit:cover;pointer-events:none;background:#050607;"></video>`;
    }

    return "🎬";
  }

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
    <div style="max-width:860px;margin:0 auto;">
      <div style="
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

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;">
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

      <div style="
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

      <div class="form-card" style="
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

            <label
              for="uploadFile"
              style="
                display:block;
                border:1px dashed rgba(250,204,21,.35);
                background:rgba(250,204,21,.035);
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
            </label>

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
}

const MAX_FILE_MB = 50;
let rawSelectedFile = null;
let trimmedFile = null;
let uploadPreviewUrlSafe = null;

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
        <div class="modal-box-header"><h2>✂️ Recortar video</h2></div>
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
            <div style="font-size:12px; color:var(--text-dim); margin-top:6px; text-align:center;">Procesando, no cierres esta ventana...</div>
          </div>
        </div>
        <div class="modal-box-footer">
          <div style="display:flex; gap:10px;">
            <button class="btn-outline" style="flex:1;" onclick="closeVideoTrimmer()">Cancelar</button>
            <button class="btn" id="trimConfirmBtn" style="flex:1;" onclick="confirmVideoTrim()" disabled>Recortar y usar</button>
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
  document.getElementById("globalModalWrap").innerHTML = "";
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

    closeVideoTrimmer();
    refreshFileSizeUI();
    refreshUploadPreviewSafe();
    showToast("¡Video recortado!");
  } catch (e) {
    showToast("No se pudo recortar. Probá con otro navegador o un archivo distinto.");
    closeVideoTrimmer();
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

  const { error } = await sb.from("videos").insert({
    user_id: currentUser.id,
    platform,
    title,
    video_url: url
  });

  if (error) { errEl.textContent = error.message; return; }

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
  if (file.size > MAX_FILE_MB * 1024 * 1024) { errEl.textContent = `El archivo supera los ${MAX_FILE_MB}MB permitidos. Probá recortarlo un poco más.`; return; }

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
    btn.textContent = "Publicar video";
    return;
  }

  const { data: publicUrlData } = sb.storage.from("clip-videos").getPublicUrl(path);

  let thumbnailUrl = null;
  try {
    const thumbnailBlob = await createVideoThumbnailBlob(file);

    if (thumbnailBlob) {
      const thumbPath = `${currentUser.id}/thumbnails/${Date.now()}-thumb.jpg`;
      const { error: thumbUploadError } = await sb.storage.from("clip-videos").upload(thumbPath, thumbnailBlob, {
        cacheControl: "3600",
        contentType: "image/jpeg",
        upsert: false
      });

      if (!thumbUploadError) {
        const { data: thumbPublic } = sb.storage.from("clip-videos").getPublicUrl(thumbPath);
        thumbnailUrl = thumbPublic?.publicUrl || null;
      }
    }
  } catch (thumbErr) {
    console.warn("No se pudo generar la carátula, el video se sube igual:", thumbErr);
  }

  const { error: insertError } = await sb.from("videos").insert({
    user_id: currentUser.id,
    platform: "upload",
    title,
    video_url: publicUrlData.publicUrl,
    thumbnail_url: thumbnailUrl
  });

  btn.disabled = false;
  btn.textContent = "Publicar video";

  if (insertError) { errEl.textContent = insertError.message; return; }

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
    .limit(30);

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

  const move = (e) => {
    const r = hero.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    const ry = (x - .5) * 3.2;
    const rx = (.5 - y) * 2.4;
    hero.style.setProperty("--ls-glow-x", `${x*100}%`);
    hero.style.setProperty("--ls-glow-y", `${y*100}%`);
    inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  };
  const reset = () => { inner.style.transform = ""; };
  hero.addEventListener("mousemove", move);
  hero.addEventListener("mouseleave", reset);
}


async function getMyProfileTitle() {
  const { data, error } = await sb.rpc("get_my_profile_title");
  if (error) {
    console.warn("No se pudo cargar el título propio:", error);
    return null;
  }
  return data?.item_id ? data : null;
}

async function getPublicProfileTitle(userId) {
  if (!userId) return null;
  const { data, error } = await sb.rpc("get_profile_title", { p_user_id:userId });
  if (error) {
    console.warn("No se pudo cargar el título público:", error);
    return null;
  }
  return data?.item_id ? data : null;
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

  return `
    <button
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
        border:1px solid rgba(250,204,21,.22);
        background:rgba(250,204,21,.06);
        color:var(--gold);
        font-family:'JetBrains Mono',monospace;
        font-size:9px;
        font-weight:900;
        letter-spacing:.04em;
        text-transform:uppercase;
        ${isOwnProfile ? "cursor:pointer;" : "cursor:default;"}
      "
    >
      <span style="font-size:13px;">${title.icon || "🏷️"}</span>
      ${escapeHtml(title.name || "Título")}
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

function openTitleDetail(itemId, name, icon, equipped = false, obtainedAt = "") {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="modal-overlay" style="z-index:240;" onclick="if(event.target===this) openMyMedalsPanel()">
      <div class="modal-box" style="max-width:350px;">
        <div class="modal-box-body" style="padding:26px;text-align:center;">
          <div style="font-size:50px;margin-bottom:8px;">${icon || "🏷️"}</div>
          <h2 style="margin:0 0 6px;">${escapeHtml(name || "Título")}</h2>
          <div style="font-size:10px;color:var(--gold);font-family:'JetBrains Mono',monospace;font-weight:900;">
            TÍTULO DE PERFIL
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
      const claim = claimByBadgeId[storeBadge.id] || {};

      return {
        ...m,
        badge_icon: m.badge_icon || ownedBadge.badge_icon || "🏅",
        earned_at: ownedBadge.earned_at || "",
        rarity: m.rarity || storeBadge.rarity || "",
        description: storeBadge.description || "",
        is_limited: !!storeBadge.is_limited,
        stock_total: storeBadge.stock_total || null,
        serial_number: claim.serial_number || null
      };
    })
    .sort((a,b) => Number(a.slot_number) - Number(b.slot_number));
}


function getProfileMedalRarityClass(rarity) {
  const safe = ["comun","rara","epica","legendaria","exclusiva"].includes(rarity)
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
    exclusiva:"Exclusiva"
  })[rarity] || "";
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
    <div class="modal-overlay" style="z-index:240;" onclick="if(event.target===this) document.getElementById('globalModalWrap').innerHTML=''">
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
    <div class="modal-overlay" style="z-index:230;" onclick="if(event.target===this) document.getElementById('globalModalWrap').innerHTML=''">
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

        <div class="modal-box-footer" style="display:flex;gap:9px;">
          <button class="btn-outline" style="flex:1;" onclick="clearProfileMedalSelection()">Quitar todas</button>
          <button class="btn" style="flex:1;" onclick="saveEquippedProfileMedals()">Guardar</button>
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

async function renderProfile() {
  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando tu perfil...</p>`;

  let videos = null;
  let error = null;

  if (lsCacheFresh(lsPerfCache.profileVideos, 30000)) {
    videos = lsPerfCache.profileVideos.data;
  } else {
    const result = await sb.from("videos").select("*").eq("user_id", currentUser.id).order("created_at", { ascending:false });
    videos = result.data;
    error = result.error;
    if (!error && videos) lsPerfCache.profileVideos = { data:videos, at:Date.now() };
  }

  if (error) { main.innerHTML = `<p class="error-msg">Error cargando tus videos: ${error.message}</p>`; return; }

  let watchedByOther = null;
  if (lsCacheFresh(lsPerfCache.profileViewsLedger, 30000)) {
    watchedByOther = lsPerfCache.profileViewsLedger.data;
  } else {
    const result = await sb.from("points_ledger").select("amount").eq("user_id", currentUser.id).eq("reason", "watched_by_other");
    watchedByOther = result.data || [];
    lsPerfCache.profileViewsLedger = { data:watchedByOther, at:Date.now() };
  }

  const totalFromViews = (watchedByOther || []).reduce((sum, r) => sum + r.amount, 0);

  const { data: myPins } = await sb.rpc("get_my_pinned_videos", { p_user_id: currentUser.id });
  const pinnedIds = new Set((myPins || []).map(p => p.video_id));
  const plans = await loadPlans();
  const myPlan = plans.find(p => p.id === currentProfile.plan_id);
  const canPin = myPlan && myPlan.max_pinned_videos > 0;
  const pinsUsed = pinnedIds.size;

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

  const { count: followersCount } = await sb
    .from("follows")
    .select("follower_id", { count: "exact", head: true })
    .eq("followed_id", currentUser.id);

  const { data: badges } = await sb.from("user_badges").select("*").eq("user_id", currentUser.id).order("earned_at", { ascending: false });
  const [equippedBadges, equippedTitle, collectionSummary] = await Promise.all([
    getEquippedProfileMedals(currentUser.id),
    getMyProfileTitle(),
    getMyCollectionSummary()
  ]);
  window.__myProfileTitle = equippedTitle;

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
                <button onclick="window.open('${escapeHtml(v.video_url)}', '_blank')">🔗 Abrir link</button>
                <button class="danger" onclick="handleDeleteOwnVideo('${v.id}')">🗑 Eliminar</button>
              </div>
            </div>
          `).join("")}
        </div>
      ` : `<p style="color:var(--text-dim)">Todavía no subiste ningún video. <button onclick="switchTab('upload')" style="background:none;border:none;color:var(--gold);cursor:pointer;font-family:inherit;">Subí el primero →</button></p>`}
      </div>
    </div>`;

  main.innerHTML = `
    <div class="profile-hero ls-profile-nova" id="lsProfileNovaHero" style="position:relative; overflow:hidden;">
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
            <div class="handle">Tu perfil en LiveScroll</div>
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

    ${collectionSummaryHtml}
    ${recentActivityHtml}
    ${socialClicksHtml}
    ${streakSectionHtml}
    ${referralSectionHtml}
    ${videosSectionHtml}`;

  initProfileNovaTilt();
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
  safePulseElement(btn, "ls-like-pop-safe");
  currentProfile.points_balance += data.points;
  updateBalanceUI();
  showFloatingPointsSafe(data.points, btn);
  showToast(`+${data.points} pt por el like`);
}

async function handleShare(videoId, url) {
  const shareUrl = `${window.location.origin}${window.location.pathname}?video=${videoId}`;
  if (navigator.share) {
    try { await navigator.share({ title: "Mirá este clip en LiveScroll", url: shareUrl }); } catch (e) { /* cancelado, seguimos igual */ }
  } else {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Link copiado para compartir");
    } catch (e) { /* nada */ }
  }

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
    <div style="position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:100; display:flex; align-items:flex-end; justify-content:center;" onclick="if(event.target===this) closeComments()">
      <div style="background:var(--panel); width:100%; max-width:420px; max-height:70vh; max-height:70dvh; border-radius:20px 20px 0 0; padding:20px; padding-bottom:max(20px, env(safe-area-inset-bottom)); display:flex; flex-direction:column; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-shrink:0;">
          <h3 style="margin:0;">💬 Comentarios</h3>
          <button onclick="closeComments()" style="background:none;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;">✕</button>
        </div>
        <div id="commentsList" style="overflow-y:auto; -webkit-overflow-scrolling:touch; flex:1 1 auto; min-height:0; margin-bottom:14px;">Cargando...</div>
        <div style="display:flex; gap:8px; flex-shrink:0;">
          <input id="newCommentInput" placeholder="Escribí un comentario..." style="flex:1; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:inherit;">
          <button class="btn" onclick="submitComment('${videoId}')">Enviar</button>
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
    return `<img src="${escapeHtml(profile.avatar_url)}" alt="avatar" style="width:${size}px; height:${size}px; border-radius:50%; object-fit:cover; vertical-align:middle;">`;
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

function renderSocialIcons(profile) {
  const socials = [
    { key: "social_kick", icon: "🟢", label: "Kick" },
    { key: "social_twitch", icon: "🟣", label: "Twitch" },
    { key: "social_youtube", icon: "🔴", label: "YouTube" },
    { key: "social_tiktok", icon: "⚫", label: "TikTok" },
    { key: "social_instagram", icon: "🩷", label: "Instagram" }
  ];
  const active = socials.filter(s => profile[s.key] && isSafeUrl(profile[s.key]));
  if (!active.length) return "";
  return `<div style="display:flex; gap:10px; margin-bottom:16px;">
    ${active.map(s => `<a href="${escapeHtml(profile[s.key])}" target="_blank" rel="noopener" title="${s.label}" style="font-size:20px; text-decoration:none;" onclick="logSocialClick('${profile.id}', '${s.label}')">${s.icon}</a>`).join("")}
  </div>`;
}

function logSocialClick(ownerId, platform) {
  if (!ownerId || ownerId === currentUser?.id) return; // no contamos clics a tus propias redes
  sb.rpc("log_social_click", { p_owner_id: ownerId, p_platform: platform }).catch(() => {});
}

// ============================================================
// PARA TI — videos destacados/anclados por Plus y Diamante
// ============================================================
async function renderForYou() {
  const main = document.getElementById("appView");
  main.innerHTML = `<div id="foryouList">Cargando destacados...</div>`;

  const { data: featured, error } = await sb.rpc("get_featured_videos");
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
  const likedSet = new Set((myLikes || []).map(l => l.video_id));

  list.innerHTML = `
    <div class="feed-vertical" id="feedVertical">
      ${videos.map((v, i) => `
        <div class="feed-item${v.platform === "upload" ? " ls-upload-feed-item" : ""}" data-video-id="${v.id}">
          <div class="feed-phone">
            <div style="position:absolute; top:14px; left:14px; background:rgba(0,0,0,0.6); color:var(--gold); font-size:11px; padding:4px 10px; border-radius:20px; z-index:6;">📌 Destacado</div>
            <div class="feed-embed-frame" id="embed-${v.id}">${getEmbedPlaceholderHtml(v)}</div>
            <div class="feed-actions">
              <button class="feed-action-btn ${likedSet.has(v.id) ? "liked" : ""}" id="like-${v.id}" onclick="handleLike('${v.id}')">❤️</button>
              <button class="feed-action-btn" onclick="openComments('${v.id}')">💬</button>
              <button class="feed-action-btn" onclick="handleShare('${v.id}', '${encodeURIComponent(v.video_url)}')">🔗</button>
            </div>
            <div class="feed-overlay">
              <div>
                <div class="title">${escapeHtml(v.title)}</div>
                <div class="author" style="cursor:pointer;" onclick="viewPublicProfile('${escapeHtml(v.profiles.username)}')">@${escapeHtml(v.profiles.username)} ${getPlanBadgeHtml(v.profiles.plan_id)} · ${v.platform}</div>
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
  }, 60000);
}


function openObsStreamingSetup() {
  const wrap = document.getElementById("globalModalWrap");
  if (!wrap) {
    alert("No se encontró el contenedor de ventanas de LiveScroll.");
    return;
  }

  wrap.innerHTML = `
    <div style="
      position:fixed;
      inset:0;
      z-index:99999;
      background:rgba(0,0,0,.82);
      display:flex;
      align-items:center;
      justify-content:center;
      padding:18px;
    " onclick="if(event.target===this) closeObsStreamingSetup()">

      <div style="
        width:min(560px,96vw);
        max-height:90vh;
        overflow:auto;
        background:var(--panel);
        border:1px solid var(--gold-dim);
        border-radius:18px;
        box-shadow:0 20px 70px rgba(0,0,0,.55);
      ">
        <div style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          padding:18px;
          border-bottom:1px solid var(--border);
        ">
          <div>
            <div style="font-size:19px;font-weight:900;">🎥 Configurar OBS</div>
            <div style="font-size:10px;color:var(--text-dim);margin-top:4px;">LiveScroll 5.8.0 · OBS Streaming</div>
          </div>

          <button type="button"
            onclick="closeObsStreamingSetup()"
            style="
              width:38px;
              height:38px;
              border-radius:50%;
              border:1px solid var(--border);
              background:var(--panel-2);
              color:var(--text);
              cursor:pointer;
              font-size:18px;
            ">✕</button>
        </div>

        <div style="padding:18px;">
          <div style="
            padding:14px;
            border:1px solid rgba(244,197,66,.28);
            background:rgba(244,197,66,.06);
            border-radius:12px;
            margin-bottom:14px;
          ">
            <div style="font-weight:800;margin-bottom:6px;">📡 Transmitir desde OBS</div>
            <div style="font-size:12px;color:var(--text-dim);line-height:1.55;">
              Esta sección va a darte los datos privados que OBS necesita para transmitir directamente a LiveScroll.
            </div>
          </div>

          <label style="font-size:10px;color:var(--text-dim);">SERVIDOR DE TRANSMISIÓN</label>
          <div style="display:flex;gap:7px;margin-top:5px;margin-bottom:13px;">
            <input id="obsServerValue"
              value="Servidor todavía no conectado"
              readonly
              style="flex:1;min-width:0;padding:11px;background:var(--ink);border:1px solid var(--border);border-radius:9px;color:var(--text);">
          </div>

          <label style="font-size:10px;color:var(--text-dim);">STREAM KEY</label>
          <div style="display:flex;gap:7px;margin-top:5px;">
            <input id="obsStreamKeyValue"
              value="Se generará cuando conectemos el servidor"
              readonly
              style="flex:1;min-width:0;padding:11px;background:var(--ink);border:1px solid var(--border);border-radius:9px;color:var(--text);">
          </div>

          <div style="
            margin-top:16px;
            padding:13px;
            border:1px solid var(--border);
            border-radius:12px;
            background:var(--panel-2);
          ">
            <div style="font-size:12px;font-weight:800;margin-bottom:8px;">Cómo se conecta en OBS</div>
            <div style="font-size:11px;color:var(--text-dim);line-height:1.75;">
              1. Abrí <b style="color:var(--text);">OBS → Ajustes → Emisión</b>.<br>
              2. Elegí <b style="color:var(--text);">Servicio personalizado</b>.<br>
              3. Pegá el servidor de LiveScroll.<br>
              4. Pegá tu Stream Key privada.<br>
              5. Tocá <b style="color:var(--text);">Iniciar transmisión</b>.
            </div>
          </div>

          <div style="
            margin-top:13px;
            padding:11px;
            border-radius:10px;
            background:rgba(34,197,94,.06);
            border:1px solid rgba(34,197,94,.18);
            color:var(--text-dim);
            font-size:10px;
            line-height:1.5;
          ">
            🔒 La Stream Key será privada y exclusiva de tu cuenta.
          </div>
        </div>
      </div>
    </div>`;
}

function closeObsStreamingSetup() {
  const wrap = document.getElementById("globalModalWrap");
  if (wrap) wrap.innerHTML = "";
}

window.openObsStreamingSetup = openObsStreamingSetup;
window.closeObsStreamingSetup = closeObsStreamingSetup;


function openLocalObsLive() {
  stopConnectedLiveRefresh();

  const main = document.getElementById("appView");
  if (!main) return;

  main.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <button class="btn-outline" style="padding:7px 10px;" onclick="renderDirectos()">← Directos</button>
      <div>
        <div style="font-size:10px;color:var(--green);font-weight:900;">● EN VIVO · OBS</div>
        <div style="font-size:9px;color:var(--text-dim);margin-top:2px;">Prueba HTTPS con MediaMTX</div>
      </div>
    </div>

    <div class="ls-live-viewer-layout">
      <section class="ls-live-video-shell">
        <div class="ls-live-video-area" style="background:#000;">
          <iframe
            src="https://controversial-queen-filter-approach.trycloudflare.com/livescroll/"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
            scrolling="no"
            style="display:block;width:100%;height:100%;min-height:520px;border:0;background:#000;"
          ></iframe>
        </div>

        <div class="ls-live-details">
          <div style="display:flex;justify-content:space-between;gap:10px;">
            <div>
              <div style="font-size:15px;font-weight:800;">Prueba de transmisión OBS</div>
              <div style="font-size:10px;color:var(--text-dim);margin-top:5px;">
                OBS → MediaMTX → LiveScroll
              </div>
            </div>
            <div style="font-size:10px;color:var(--green);">● EN VIVO</div>
          </div>
        </div>
      </section>

      <aside class="ls-live-chat">
        <div class="ls-live-chat-head">💬 Chat del directo</div>
        <div class="ls-live-chat-messages" style="display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;color:var(--text-dim);font-size:11px;">
          El reproductor OBS ya está conectado.<br><br>
          En la siguiente etapa vinculamos este directo a tu usuario y al chat real de LiveScroll.
        </div>
      </aside>
    </div>`;
}
window.openLocalObsLive = openLocalObsLive;

async function renderDirectos(renderToken = lsTabRenderToken) {
  startConnectedLiveRefresh();
  const main = document.getElementById("appView");
  main.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
      <h1 class="page-title" style="margin-bottom:0;">🔴 Directos</h1>
      <button class="btn" onclick="window.openObsStreamingSetup && window.openObsStreamingSetup()">🎥 Configurar OBS</button>
    </div>
    <p class="page-sub">Creadores transmitiendo ahora mismo dentro y fuera de LiveScroll.</p>
    ${currentProfile?.is_admin ? `
    <div class="ls-obs-local-test" style="
      margin:14px 0;
      padding:14px;
      border:1px solid rgba(244,197,66,.22);
      border-radius:16px;
      background:linear-gradient(135deg,rgba(244,197,66,.055),var(--panel));
    ">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div style="min-width:0;">
          <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
            <div style="font-weight:900;">🎥 OBS · entorno de prueba</div>
            <span style="
              font-size:8px;
              font-weight:900;
              letter-spacing:.06em;
              color:var(--gold);
              border:1px solid rgba(244,197,66,.25);
              background:rgba(244,197,66,.06);
              padding:3px 6px;
              border-radius:999px;
            ">SOLO ADMIN</span>
          </div>
          <div style="font-size:10px;color:var(--text-dim);margin-top:4px;">
            MediaMTX · Cloudflare HTTPS · ruta livescroll
          </div>
          <div style="font-size:9px;color:var(--text-dim);margin-top:4px;opacity:.8;">
            Herramienta técnica: no cuenta como un directo público.
          </div>
        </div>
        <button class="btn-outline" type="button" onclick="openLocalObsLive()" style="white-space:nowrap;">
          Abrir prueba OBS →
        </button>
      </div>
    </div>` : ""}
    <div id="directosList">Cargando...</div>`;

  const [ext, studio] = await Promise.allSettled([
    sb.from("profiles")
      .select("id,username,avatar_emoji,avatar_url,plan_id,live_platform,live_started_at,social_kick,social_twitch")
      .eq("is_live",true)
      .is("ban_reason",null)
      .order("live_started_at",{ascending:false}),
    sb.from("studio_live_sessions")
      .select("id,user_id,title,started_at,viewer_count,preview_url,profiles!studio_live_sessions_user_id_fkey(id,username,avatar_emoji,avatar_url,plan_id)")
      .eq("status","live")
      .order("started_at",{ascending:false})
  ]);

  const liveUsers = ext.status === "fulfilled" ? (ext.value?.data || []) : [];
  const studioLives = studio.status === "fulfilled" ? (studio.value?.data || []) : [];

  if (renderToken !== lsTabRenderToken || currentTab !== "directos") return;
  const list = document.getElementById("directosList");
  if (!list) return;

  let html = "";

  if (studioLives.length) {
    html += `<section class="ls-studio-live-section">
      <div class="ls-studio-live-head"><h3>📡 EN VIVO DESDE LIVESCROLL STUDIO</h3><span>${studioLives.length} directo${studioLives.length===1?"":"s"}</span></div>
      ${studioLives.map(s => {
        const p = s.profiles || {};
        return `<div class="ls-studio-live-card" onclick="window.openStudioLive ? window.openStudioLive('${s.id}') : openStudioLive('${s.id}')">
          <div class="ls-studio-live-preview">
            ${s.preview_url && isSafeUrl(s.preview_url) ? `<img src="${escapeHtml(s.preview_url)}">` : `<div style="font-size:28px;">📡</div>`}
            <div class="ls-studio-live-chip">EN VIVO</div>
          </div>
          <div>
            <div class="ls-studio-live-title">${escapeHtml(s.title || "Directo en LiveScroll")}</div>
            <div class="ls-studio-live-user">@${escapeHtml(p.username || "usuario")} ${getPlanBadgeHtml(p.plan_id)}</div>
            <div class="ls-studio-live-meta">LiveScroll Studio · ${Number(s.viewer_count || 0)} viendo</div>
          </div>
          <div class="ls-studio-live-open">Entrar →</div>
        </div>`;
      }).join("")}
    </section>`;
  }

  if (liveUsers.length) {
    html += `<section>
      <div class="ls-studio-live-head"><h3>🌐 DIRECTOS EXTERNOS</h3><span>Kick / Twitch</span></div>
      ${liveUsers.map(u => {
        const platformLabel = u.live_platform === "both" ? "🟢 Kick + 🟣 Twitch" : u.live_platform === "kick" ? "🟢 Kick" : "🟣 Twitch";
        const watchButtons = [
          (u.live_platform === "kick" || u.live_platform === "both") && u.social_kick && isSafeUrl(u.social_kick)
            ? `<a href="${escapeHtml(u.social_kick)}" target="_blank" rel="noopener" class="watch-btn" style="text-decoration:none;">Ver en Kick</a>` : "",
          (u.live_platform === "twitch" || u.live_platform === "both") && u.social_twitch && isSafeUrl(u.social_twitch)
            ? `<a href="${escapeHtml(u.social_twitch)}" target="_blank" rel="noopener" class="watch-btn" style="text-decoration:none;">Ver en Twitch</a>` : ""
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

  if (!studioLives.length && !liveUsers.length) {
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

let lsStudioChatChannel = null;

function stopStudioLiveChat() {
  if (lsStudioChatChannel) {
    sb.removeChannel(lsStudioChatChannel);
    lsStudioChatChannel = null;
  }
}

function renderStudioChatMessage(m) {
  return `<div class="ls-live-chat-message"><b>@${escapeHtml(m.profiles?.username || "usuario")}</b>${escapeHtml(m.message || "")}</div>`;
}

async function openStudioLive(sessionId) {
  stopConnectedLiveRefresh();
  stopStudioLiveChat();

  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando directo...</p>`;

  const [{data:session,error},{data:messages}] = await Promise.all([
    sb.from("studio_live_sessions")
      .select("id,user_id,title,status,started_at,viewer_count,playback_url,profiles!studio_live_sessions_user_id_fkey(id,username,avatar_emoji,avatar_url,plan_id)")
      .eq("id",sessionId).single(),
    sb.from("studio_live_chat_messages")
      .select("id,user_id,message,created_at,profiles!studio_live_chat_messages_user_id_fkey(username)")
      .eq("session_id",sessionId).order("created_at",{ascending:true}).limit(100)
  ]);

  if (error || !session) {
    main.innerHTML = `<button class="btn-outline" onclick="renderDirectos()">← Volver a Directos</button><p class="error-msg" style="margin-top:14px;">Este directo ya no está disponible.</p>`;
    return;
  }

  const p = session.profiles || {};
  main.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <button class="btn-outline" style="padding:7px 10px;" onclick="stopStudioLiveChat();renderDirectos()">← Directos</button>
      <div><div style="font-size:10px;color:var(--green);font-weight:900;">● EN VIVO · LIVESCROLL STUDIO</div><div style="font-size:9px;color:var(--text-dim);margin-top:2px;">Experiencia interna de LiveScroll</div></div>
    </div>

    <div class="ls-live-viewer-layout">
      <section class="ls-live-video-shell">
        <div class="ls-live-video-area">
          ${session.playback_url && isSafeUrl(session.playback_url)
            ? `<iframe
                src="${escapeHtml(session.playback_url)}"
                allow="autoplay; fullscreen; picture-in-picture"
                allowfullscreen
                scrolling="no"
                style="width:100%;height:100%;border:0;background:#000;"
              ></iframe>`
            : `<div class="ls-live-video-placeholder"><div class="ico">📡</div><strong>La señal de LiveScroll Studio aparecerá acá.</strong><div>El reproductor ya está preparado para recibir el stream.</div></div>`}
        </div>
        <div class="ls-live-details">
          <div style="display:flex;justify-content:space-between;gap:10px;">
            <div>
              <div style="font-size:15px;font-weight:800;">${escapeHtml(session.title || "Directo en LiveScroll")}</div>
              <div style="font-size:10px;color:var(--text-dim);margin-top:5px;cursor:pointer;" onclick="viewPublicProfile('${escapeHtml(p.username || "")}')">@${escapeHtml(p.username || "usuario")} ${getPlanBadgeHtml(p.plan_id)}</div>
            </div>
            <div style="font-size:10px;color:var(--green);">${Number(session.viewer_count || 0)} viendo</div>
          </div>
        </div>
      </section>

      <aside class="ls-live-chat">
        <div class="ls-live-chat-head">💬 Chat del directo</div>
        <div class="ls-live-chat-messages" id="studioLiveChatMessages">${(messages || []).map(renderStudioChatMessage).join("")}</div>
        <form class="ls-live-chat-form" onsubmit="sendStudioLiveChat(event,'${session.id}')">
          <input id="studioLiveChatInput" maxlength="220" placeholder="Escribí un mensaje..." autocomplete="off">
          <button class="btn" type="submit">Enviar</button>
        </form>
      </aside>
    </div>`;

  const box = document.getElementById("studioLiveChatMessages");
  if (box) box.scrollTop = box.scrollHeight;

  lsStudioChatChannel = sb.channel(`studio-live-chat-${session.id}`)
    .on("postgres_changes",{event:"INSERT",schema:"public",table:"studio_live_chat_messages",filter:`session_id=eq.${session.id}`},async payload => {
      const {data} = await sb.from("studio_live_chat_messages")
        .select("id,user_id,message,created_at,profiles!studio_live_chat_messages_user_id_fkey(username)")
        .eq("id",payload.new.id).single();
      const target = document.getElementById("studioLiveChatMessages");
      if (target && data) {
        target.insertAdjacentHTML("beforeend",renderStudioChatMessage(data));
        target.scrollTop = target.scrollHeight;
      }
    }).subscribe();
}

async function sendStudioLiveChat(event,sessionId) {
  event.preventDefault();
  const input = document.getElementById("studioLiveChatInput");
  const message = input?.value.trim() || "";
  if (!message) return;

  input.disabled = true;
  const {data,error} = await sb.rpc("send_studio_live_chat_message",{p_session_id:sessionId,p_message:message});
  input.disabled = false;

  if (error || !data?.ok) {
    showToast("No se pudo enviar el mensaje");
    return;
  }
  input.value = "";
  input.focus();
}


async function renderUsersDirectory() {
  const main = document.getElementById("appView");
  main.innerHTML = `
    <h1 class="page-title">👥 Usuarios</h1>
    <p class="page-sub">Buscá y descubrí a otros creadores de LiveScroll.</p>
    <input type="text" id="userSearchInput" class="user-directory-search" placeholder="Buscar por nombre de usuario..." oninput="handleUserSearchInput()">
    <div id="usersDirectoryList">Cargando...</div>`;

  await loadUsersDirectory("");
}

function handleUserSearchInput() {
  clearTimeout(usersDirectorySearchTimeout);
  const input = document.getElementById("userSearchInput");
  if (!input) return;
  const term = input.value.trim();
  usersDirectorySearchTimeout = setTimeout(() => loadUsersDirectory(term), 350);
}

async function loadUsersDirectory(term) {
  const list = document.getElementById("usersDirectoryList");
  if (!list) return;
  list.innerHTML = "Buscando...";

  let query = sb.from("profiles")
    .select("id, username, avatar_emoji, avatar_url, plan_id, is_live, live_platform")
    .is("ban_reason", null)
    .neq("id", currentUser.id)
    .order("is_live", { ascending: false })
    .order("username")
    .limit(40);

  if (term) query = query.ilike("username", `%${term}%`);

  const { data: users, error } = await query;
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
        <div class="uname">${u.is_live ? `<span class="live-dot-badge"></span>` : ""}@${escapeHtml(u.username)} ${getPlanBadgeHtml(u.plan_id)}</div>
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
    <div class="modal-overlay" style="z-index:240;" onclick="if(event.target===this) openMyMedalsPanel()">
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
    const claim = badgeClaimById[meta.id] || {};
    return {
      type:"badge",
      icon:b.badge_icon || "🏅",
      name:b.badge_name || "Medalla",
      rarity:meta.rarity || null,
      description:meta.description || "",
      is_limited:!!meta.is_limited,
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
    <div class="modal-overlay" style="z-index:210;" onclick="if(event.target===this) closeManagedModal()">
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

  const rarityRank = { exclusiva:5, legendaria:4, epica:3, rara:2, comun:1 };
  const filter = window.__collection568Filter || "all";
  const sort = window.__collection568Sort || "rarity";

  let items = [...(window.__collection568Items || [])];

  if (filter === "badge") items = items.filter(i => i.type === "badge");
  if (filter === "emoji") items = items.filter(i => i.type === "emoji");
  if (filter === "title") items = items.filter(i => i.type === "title");
  if (filter === "limited") items = items.filter(i => i.is_limited);
  if (filter === "top") items = items.filter(i => ["legendaria","exclusiva"].includes(i.rarity));

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
      top:"Legendarios y exclusivos"
    };
    const rarityLabels = {
      all:"Todos",
      comun:"Común",
      rara:"Rara",
      epica:"Épica",
      legendaria:"Legendaria",
      exclusiva:"Exclusiva",
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
      item.rarity === "comun" ? "#cbd5e1" :
      "var(--text-dim)";

    const onclick = item.type === "badge"
      ? `openMedalDetail('${escapeHtml(item.name)}','${escapeHtml(item.icon)}','${escapeHtml(item.rarity || "")}','${escapeHtml(item.description || "")}','${escapeHtml(item.obtained_at || "")}','${escapeHtml(item.serial_number || "")}','${escapeHtml(item.stock_total || "")}')`
      : item.type === "title"
        ? `openTitleDetail('${item.item_id}','${escapeHtml(item.name)}','${escapeHtml(item.icon)}',${item.equipped ? "true" : "false"},'${escapeHtml(item.obtained_at || "")}')`
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
  if (!username) return;
  if (username === currentProfile.username) { switchTab("profile"); return; }

  clearAllWatchIntervals();
  previousTabBeforeProfile = currentTab;

  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando perfil...</p>`;
  document.querySelectorAll(".nav-links button").forEach(b => b.classList.remove("active"));

  const { data: profile } = await sb.from("profiles").select("id, username, avatar_emoji, avatar_url, cover_url, cover_position_y, profile_side_image_url, bio, social_kick, social_twitch, social_youtube, social_tiktok, social_instagram, plan_id, is_live, live_platform").eq("username", username).single();
  if (!profile) { main.innerHTML = `<p class="error-msg">Usuario no encontrado.</p>`; return; }

  const { data: videos } = await sb
    .from("videos")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const videoIds = (videos || []).map(v => v.id);

  const [{ data: sessions }, { data: likes }, { data: followers }, { data: amIFollowing }, { data: theirBadges }] = await Promise.all([
    videoIds.length ? sb.from("watch_sessions").select("video_id, viewer_id").in("video_id", videoIds) : { data: [] },
    videoIds.length ? sb.from("video_likes").select("video_id").in("video_id", videoIds) : { data: [] },
    sb.from("follows").select("follower_id").eq("followed_id", profile.id),
    sb.from("follows").select("follower_id").eq("followed_id", profile.id).eq("follower_id", currentUser.id).maybeSingle(),
    sb.from("user_badges").select("*").eq("user_id", profile.id).order("earned_at", { ascending: false })
  ]);

  const viewsByVideo = {};
  (sessions || []).forEach(s => {
    viewsByVideo[s.video_id] = viewsByVideo[s.video_id] || new Set();
    viewsByVideo[s.video_id].add(s.viewer_id);
  });
  const likesByVideo = {};
  (likes || []).forEach(l => { likesByVideo[l.video_id] = (likesByVideo[l.video_id] || 0) + 1; });

  const isFollowing = !!amIFollowing;
  const [theirEquippedBadges, theirTitle] = await Promise.all([
    getEquippedProfileMedals(profile.id),
    getPublicProfileTitle(profile.id)
  ]);

  main.innerHTML = `
    <button class="btn-outline" style="margin-bottom:18px;" onclick="switchTab('${previousTabBeforeProfile}')">← Volver</button>

    <div class="profile-hero" style="position:relative; overflow:hidden;">
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
            <div class="handle">Perfil público</div>
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
            <div class="video-grid-tile" onclick="openProfileVideoFeed(window.__profileFeedVideos, '${v.id}', window.__profileFeedAuthor)">
              ${getGridCoverHtml(v)}
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
let notifRealtimeChannel = null;

function getNotificationIcon(type) {
  const icons = { like: "❤️", comment: "💬", follow: "👤", admin: "🛠️", system: "🔔", points: "🪙", streak: "🔥", plan: "💎" };
  return icons[type] || "🔔";
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
    .limit(30);

  if (error) {
    console.error("Error cargando notificaciones:", error);
    return;
  }

  notifCache = data || [];
  updateNotificationBadge();
  if (document.getElementById("notifPanel")) renderNotificationPanelContent();
}

function subscribeToNotifications() {
  if (!currentUser) return;
  if (notifRealtimeChannel) {
    sb.removeChannel(notifRealtimeChannel);
    notifRealtimeChannel = null;
  }

  notifRealtimeChannel = sb
    .channel(`notifications-${currentUser.id}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "notifications",
      filter: `user_id=eq.${currentUser.id}`
    }, payload => {
      const notification = payload.new;
      if (!notifCache.some(n => n.id === notification.id)) notifCache.unshift(notification);
      notifCache = notifCache.slice(0, 30);
      updateNotificationBadge();
      if (document.getElementById("notifPanel")) renderNotificationPanelContent();
      showToast(`${getNotificationIcon(notification.type)} ${notification.message || "Nueva notificación"}`);
    })
    .subscribe(status => {
      if (status === "SUBSCRIBED") console.log("Notificaciones Realtime conectadas");
    });
}

function renderNotificationPanelContent() {
  const list = document.getElementById("notifPanelList");
  if (!list) return;
  if (!notifCache.length) {
    list.innerHTML = `<p style="color:var(--text-dim);font-size:13px;padding:18px 10px;text-align:center;">Sin notificaciones todavía.</p>`;
    return;
  }

  list.innerHTML = notifCache.map(n => {
    const clickable = n.video_id || n.actor_id || n.comment_id;
    return `
      <div onclick="${clickable ? `handleNotificationClick('${n.id}')` : ""}" style="display:flex;gap:10px;padding:11px 8px;border-bottom:1px solid var(--border);font-size:13px;cursor:${clickable ? "pointer" : "default"};border-radius:8px;transition:background 0.15s ease;${n.read ? "opacity:0.62;" : "background:rgba(255,255,255,0.025);"}">
        <div style="font-size:20px;width:28px;flex-shrink:0;text-align:center;padding-top:1px;">${getNotificationIcon(n.type)}</div>
        <div style="min-width:0;flex:1;">
          <div style="color:var(--text);line-height:1.35;">${escapeHtml(n.message || "Nueva notificación")}</div>
          <div style="color:var(--text-dim);font-size:10px;margin-top:4px;">${formatNotificationTime(n.created_at)}${clickable ? " · Tocá para ver" : ""}</div>
        </div>
        ${!n.read ? `<div style="width:7px;height:7px;border-radius:50%;background:var(--gold);margin-top:7px;flex-shrink:0;"></div>` : ""}
      </div>`;
  }).join("");
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

  const panel = document.createElement("div");
  panel.id = "notifPanel";
  panel.style.cssText = "position:absolute;top:60px;right:20px;width:min(360px, calc(100vw - 24px));max-height:480px;background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:10px;z-index:160;box-shadow:0 14px 40px rgba(0,0,0,0.55);";
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;padding:3px 5px 8px;border-bottom:1px solid var(--border);">
      <div><strong style="font-size:14px;">🔔 Notificaciones</strong><div style="color:var(--text-dim);font-size:10px;margin-top:2px;">Actividad reciente</div></div>
      <button onclick="document.getElementById('notifPanel')?.remove()" style="background:none;border:none;color:var(--text-dim);font-size:18px;cursor:pointer;padding:4px 7px;">✕</button>
    </div>
    <div id="notifPanelList" style="max-height:400px;overflow-y:auto;padding-right:2px;"></div>`;
  document.body.appendChild(panel);
  renderNotificationPanelContent();

  sb.rpc("mark_notifications_read", { p_user_id: currentUser.id }).then(() => {
    notifCache = notifCache.map(n => ({ ...n, read: true }));
    updateNotificationBadge();
  });

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
  notification.read = true;
  updateNotificationBadge();

  if (notification.type === "comment" && notification.video_id) {
    await openComments(notification.video_id, notification.comment_id || null);
    return;
  }
  if (notification.type === "like" && notification.video_id) {
    await openSharedVideo(notification.video_id);
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

  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="modal-overlay" style="z-index:100;" onclick="if(event.target===this) closeManagedModal()">
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
          <input type="file" id="avatarPhotoInput" accept="image/*" onchange="handleAvatarPhotoUpload()" style="width:100%; padding:8px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:inherit; font-size:12px;">
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

          <input type="file" id="coverPhotoInput" accept="image/*" onchange="handleCoverPhotoUpload()" style="width:100%; padding:8px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:inherit; font-size:12px;">
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
            style="width:100%; padding:8px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:inherit; font-size:12px;"
          >
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
            <div style="display:flex; align-items:center; gap:8px;"><span>🟢</span><input type="text" id="socialKick" value="${escapeHtml(currentProfile.social_kick || "")}" placeholder="Link de tu Kick" style="flex:1;"></div>
            <div style="display:flex; align-items:center; gap:8px;"><span>🟣</span><input type="text" id="socialTwitch" value="${escapeHtml(currentProfile.social_twitch || "")}" placeholder="Link de tu Twitch" style="flex:1;"></div>
            <div style="display:flex; align-items:center; gap:8px;"><span>🔴</span><input type="text" id="socialYoutube" value="${escapeHtml(currentProfile.social_youtube || "")}" placeholder="Link de tu YouTube" style="flex:1;"></div>
            <div style="display:flex; align-items:center; gap:8px;"><span>⚫</span><input type="text" id="socialTiktok" value="${escapeHtml(currentProfile.social_tiktok || "")}" placeholder="Link de tu TikTok" style="flex:1;"></div>
            <div style="display:flex; align-items:center; gap:8px;"><span>🩷</span><input type="text" id="socialInstagram" value="${escapeHtml(currentProfile.social_instagram || "")}" placeholder="Link de tu Instagram" style="flex:1;"></div>
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
}

function openChangePassword() {
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div style="position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:110; display:flex; align-items:center; justify-content:center; padding:20px;" onclick="if(event.target===this) this.remove()">
      <div class="auth-box" style="margin:0;">
        <h2>Cambiar contraseña</h2>
        <div class="field">
          <label>Nueva contraseña</label>
          <div class="password-field-wrap">
            <input type="password" id="changePasswordInput" placeholder="••••••••">
            <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('changePasswordInput', this)">👁</button>
          </div>
        </div>
        <button class="btn" style="width:100%" onclick="submitChangePassword()">Guardar</button>
        <div id="changePasswordError" class="error-msg"></div>
      </div>
    </div>`;
}

async function submitChangePassword() {
  const password = document.getElementById("changePasswordInput").value;
  const errEl = document.getElementById("changePasswordError");
  if (!password || password.length < 6) {
    errEl.textContent = "La contraseña tiene que tener al menos 6 caracteres.";
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

  const { error: updateError } = await sb.from("profiles").update({
    bio,
    avatar_emoji: window.selectedAvatarEmoji,
    cover_position_y: coverPositionY,
    social_kick: document.getElementById("socialKick").value.trim() || null,
    social_twitch: document.getElementById("socialTwitch").value.trim() || null,
    social_youtube: document.getElementById("socialYoutube").value.trim() || null,
    social_tiktok: document.getElementById("socialTiktok").value.trim() || null,
    social_instagram: document.getElementById("socialInstagram").value.trim() || null
  }).eq("id", currentUser.id);

  if (updateError) { errEl.textContent = "No se pudo guardar."; return; }

  currentProfile.bio = bio;
  currentProfile.avatar_emoji = window.selectedAvatarEmoji;
  currentProfile.cover_position_y = coverPositionY;
  currentProfile.social_kick = document.getElementById("socialKick").value.trim();
  currentProfile.social_twitch = document.getElementById("socialTwitch").value.trim();
  currentProfile.social_youtube = document.getElementById("socialYoutube").value.trim();
  currentProfile.social_tiktok = document.getElementById("socialTiktok").value.trim();
  currentProfile.social_instagram = document.getElementById("socialInstagram").value.trim();
  closeManagedModal();
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
              ${r.videos?.video_url ? (isSafeUrl(r.videos.video_url) ? `<a href="${escapeHtml(r.videos.video_url)}" target="_blank" rel="noopener" style="font-size:12px; color:var(--text-dim);">Ver video →</a>` : `<span style="font-size:12px; color:var(--red);">⚠️ Link sospechoso, no se abre</span>`) : ""}
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
          <span>@${escapeHtml(u.username)} · <span id="email-pending-${u.id}" data-masked="true">${escapeHtml(maskEmail(u.email))}</span> <button onclick="toggleEmailVisibility('email-pending-${u.id}', '${escapeHtml(u.email || "")}')" style="background:none;border:none;cursor:pointer;font-size:12px;">👁</button> · ${new Date(u.created_at).toLocaleDateString("es-AR")}</span>
          <button class="btn-outline" style="padding:4px 12px; font-size:12px;" onclick="handleUnblockUser('${u.id}')">✓ Verificar</button>
        </div>
      `).join("")}` : ""}

    <h3 style="margin-top:32px;">🎨 Eventos visuales</h3>
    <div class="form-card" style="margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;">
        <div style="flex:1;min-width:220px;">
          <div style="font-size:13px;font-weight:800;">Seasonal LiveScroll</div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:3px;line-height:1.5;">
            En Automático, LiveScroll cambia solo según la fecha de Argentina.
            Este selector sirve únicamente para que vos pruebes los diseños antes del día.
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

    <h3 style="margin-top:32px;">🔒 Acceso a Planes y Billetera</h3>
    <div class="form-card" style="margin-bottom:14px;padding:0;overflow:hidden;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding:14px;">
        <div style="flex:1;min-width:190px;">
          <div style="font-size:13px;font-weight:700;">💎 Planes</div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:2px;">Mostrá u ocultá la sección para los demás usuarios.</div>
        </div>
        <button class="btn" id="plansLockBtn" onclick="handleTogglePlansLock()">Cargando...</button>
      </div>

      <div style="border-top:1px solid var(--border);"></div>

      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding:14px;">
        <div style="flex:1;min-width:190px;">
          <div style="font-size:13px;font-weight:700;">👛 Billetera</div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:2px;">Pausá o habilitá el acceso a canjes.</div>
        </div>
        <button class="btn" id="walletLockBtn" onclick="handleToggleWalletLock()">Cargando...</button>
      </div>

      <div style="padding:0 14px 12px;color:var(--text-dim);font-size:10px;">
        Tu cuenta de administrador mantiene acceso a ambas secciones.
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

  loadStreakWeeksOverview();
  loadPlansLockStatus();
  loadWalletLockStatus();
  setTimeout(syncSeasonalAdminControls, 0);
  loadStoreEmojisList();
  loadStorePrices();
  loadStoreBadgesAdminList();
  loadStoreItemsList();
  loadProfileTitlesAdminList();
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

async function openEmojiPicker(targetInputId, list) {
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="modal-overlay" style="z-index:140;" onclick="if(event.target===this) this.remove()">
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
    exclusiva:"Exclusiva"
  })[rarity] || "Común";
}

function getStoreBadgeRarityClass(rarity) {
  return `ls-rarity-${["comun","rara","epica","legendaria","exclusiva"].includes(rarity) ? rarity : "comun"}`;
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
    <div class="modal-overlay" style="z-index:260;" onclick="if(event.target===this) document.getElementById('globalModalWrap').innerHTML=''">
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

        <div class="modal-box-footer">
          <button class="btn" style="width:100%;" onclick="handleSaveStoreBadgeEdit('${badge.id}')">Guardar cambios</button>
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

  const { data, error } = await sb.rpc("admin_get_store_items");
  if (error) {
    el.innerHTML = `<p class="error-msg">No se pudieron cargar los títulos.</p>`;
    return;
  }

  const titles = (data || []).filter(it => String(it.category || "").toLowerCase() === "title");

  if (!titles.length) {
    el.innerHTML = `<p style="color:var(--text-dim);font-size:12px;">Todavía no creaste títulos de perfil.</p>`;
    return;
  }

  el.innerHTML = titles.map(it => `
    <div class="ledger-row">
      <span>
        ${it.icon || "🏷️"} ${escapeHtml(it.name)}
        · <span style="font-size:10px;font-weight:900;color:var(--gold);text-transform:uppercase;">${escapeHtml(it.rarity || "comun")}</span>
        · <span class="mono">${it.price_points} pts</span>
        ${!it.active ? '<span style="color:var(--text-dim);">(desactivado)</span>' : ""}
      </span>
      <div style="display:flex;gap:6px;">
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

  const { data, error } = await sb.rpc("admin_add_store_item", {
    p_category:"title",
    p_icon:icon,
    p_name:name,
    p_price:price
  });

  if (error || !data?.ok) {
    showToast("No se pudo crear el título");
    return;
  }

  // admin_add_store_item conserva el sistema existente.
  // Luego asignamos la rareza al título recién creado buscando el registro exacto.
  const { data: createdRows } = await sb
    .from("store_items")
    .select("id")
    .eq("category", "title")
    .eq("name", name)
    .eq("icon", icon)
    .eq("price_points", price)
    .order("created_at", { ascending:false })
    .limit(1);

  const createdId = createdRows?.[0]?.id;
  if (createdId) {
    await sb.rpc("admin_set_store_item_rarity", {
      p_item_id: createdId,
      p_rarity: rarity
    });
  }

  document.getElementById("newProfileTitleIcon").value = "";
  document.getElementById("newProfileTitleName").value = "";
  document.getElementById("newProfileTitleRarity").value = "comun";
  document.getElementById("newProfileTitlePrice").value = "";

  showToast("🏷️ Título creado");
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
        ${items.map(it => `
          <div class="form-card" style="text-align:center;">
            <div style="font-size:30px;">${it.icon}</div>
            <div style="font-size:12px; margin:4px 0;">${escapeHtml(it.name)}</div>
            ${myItemSet.has(it.id)
              ? `<span style="font-size:11px; color:var(--green);">✓ Tenés este</span>`
              : `<button class="btn-outline" style="padding:4px 8px; font-size:11px;" onclick="handleBuyStoreItem('${it.id}')">${it.price_points} pts</button>`}
          </div>
        `).join("")}
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

async function renderPlans() {
  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando planes...</p>`;

  const { data: paymentInfo } = await sb.from("app_text_config").select("*");
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

  const plans = await loadPlans();
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
  // El override es SOLO una herramienta local de prueba para Admin.
  if (currentProfile?.is_admin) {
    const forced = localStorage.getItem(LS_SEASONAL_OVERRIDE_KEY);
    if (forced && forced !== "auto" && LS_SEASONAL_THEMES[forced]) {
      return forced;
    }
  }
  return getAutomaticSeasonalTheme();
}

function clearSeasonalDecorations() {
  document.getElementById("lsSeasonalStyle")?.remove();
  document.getElementById("lsSeasonalLogoDecor")?.remove();
  document.getElementById("lsSeasonalAmbient")?.remove();
  document.body?.removeAttribute("data-ls-season");
}

function applySeasonalTheme() {
  if (!document.body || window.__lsSeasonalApplying) return;

  window.__lsSeasonalApplying = true;

  clearSeasonalDecorations();

  const key = getSeasonalThemeKey();
  const theme = LS_SEASONAL_THEMES[key] || LS_SEASONAL_THEMES.normal;
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
      opacity:.30;
      will-change:transform, opacity;
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
      .ls-seasonal-ambient-item {
        animation:none !important;
      }
      .ls-seasonal-ambient-item { display:none !important; }
    }

    body.ls-legacy .ls-seasonal-ambient-item {
      display:none !important;
    }

    ${springExtra}
  `;
  document.head.appendChild(style);

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
  if (!document.body.classList.contains("ls-legacy")) {
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

function setSeasonalAdminPreview(value) {
  if (!currentProfile?.is_admin) return;

  if (!value || value === "auto") {
    localStorage.removeItem(LS_SEASONAL_OVERRIDE_KEY);
  } else {
    localStorage.setItem(LS_SEASONAL_OVERRIDE_KEY, value);
  }

  applySeasonalTheme();
  showToast(
    value === "auto"
      ? "🎨 Eventos visuales en Automático"
      : `🎨 Vista previa: ${LS_SEASONAL_THEMES[value]?.label || value}`
  );
}

function syncSeasonalAdminControls() {
  const select = document.getElementById("seasonalThemeAdminSelect");
  const status = document.getElementById("seasonalAdminStatus");
  if (!select && !status) return;

  const forced = currentProfile?.is_admin
    ? (localStorage.getItem(LS_SEASONAL_OVERRIDE_KEY) || "auto")
    : "auto";

  if (select) {
    select.value = (forced === "auto" || LS_SEASONAL_THEMES[forced]) ? forced : "auto";
  }

  if (status) {
    const automatic = getAutomaticSeasonalTheme();
    const active = getSeasonalThemeKey();
    const activeLabel = LS_SEASONAL_THEMES[active]?.label || active;
    const autoLabel = LS_SEASONAL_THEMES[automatic]?.label || automatic;

    status.textContent = forced === "auto"
      ? `Ahora: ${activeLabel} · Automático`
      : `Vista previa local: ${activeLabel} · En la fecha real sería: ${autoLabel}`;
  }
}

// Aplicamos el tema al cargar.
// No usamos MutationObserver global: el Admin reconstruye mucho DOM y eso
// podía generar un ciclo de reaplicación que frenaba la carga del panel.
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(applySeasonalTheme, 80);
});

// Si el app ya estaba cargado antes de registrar DOMContentLoaded.
if (document.readyState !== "loading") {
  setTimeout(applySeasonalTheme, 80);
}


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
