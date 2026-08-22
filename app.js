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

// ============================================================
// ARRANQUE
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
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
  await sb.auth.signOut();
}

async function loadProfile() {
  const { data, error } = await sb.from("profiles").select("id, username, points_balance, plan_id, created_at, bio, avatar_emoji, avatar_url, cover_url, social_kick, social_twitch, social_youtube, social_tiktok, social_instagram, streak_current_day, streak_last_login_date, is_live, live_platform").eq("id", currentUser.id).single();
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
    <button onclick="switchTab('wallet'); closeMobileMenu();">Billetera</button>
    <button onclick="switchTab('plans'); closeMobileMenu();">Planes</button>
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

async function renderApp() {
  document.getElementById("landingView").classList.add("hidden");
  document.getElementById("appView").classList.remove("hidden");

  document.getElementById("navLinks").innerHTML = `
    <button id="tab-feed" onclick="switchTab('feed')">Mirar</button>
    <button id="tab-foryou" onclick="switchTab('foryou')">✨ Para Ti</button>
    <button id="tab-upload" onclick="switchTab('upload')">Subir video</button>
    <button id="tab-profile" onclick="switchTab('profile')">Mi Perfil</button>
    <button id="tab-users" onclick="switchTab('users')">👥 Usuarios</button>
    <button id="tab-directos" onclick="switchTab('directos')" style="color:var(--red)">🔴 Directos</button>
    <button id="tab-wallet" onclick="switchTab('wallet')">Billetera</button>
    <button id="tab-plans" onclick="switchTab('plans')">Planes</button>
    <button id="tab-store" onclick="switchTab('store')">🛍️ Tienda</button>
    <button id="tab-ranking" onclick="switchTab('ranking')">🏆 Ranking</button>
    ${currentProfile.is_admin ? `<button id="tab-admin" onclick="switchTab('admin')" style="color:var(--green)">🛠 Admin</button>` : ""}`;

  const plans = await loadPlans();
  const currentPlan = plans.find(p => p.id === currentProfile.plan_id) || plans[0];

  document.getElementById("navRight").innerHTML = `
    <div class="nav-plan-chip">
      <span class="plan-name">${currentPlan.name}</span>
      <span class="divider"></span>
      <span class="pts mono" id="navBalance">${currentProfile.points_balance} pts</span>
    </div>
    <button onclick="openChangelogHistory()" title="Novedades" class="nav-changelog-btn" style="background:none; border:none; font-size:17px; cursor:pointer; margin-left:8px;">📢</button>
    <button id="notifBell" onclick="toggleNotifPanel()" style="position:relative; background:none; border:none; font-size:18px; cursor:pointer; margin-left:4px;">
      🔔<span id="notifBadge" class="hidden" style="position:absolute; top:-4px; right:-6px; background:var(--red); color:#fff; font-size:10px; border-radius:10px; padding:1px 5px;"></span>
    </button>
    <button class="btn-outline nav-logout-btn" style="margin-left:10px" onclick="handleLogout()">Salir</button>`;

  loadNotifications();

  checkBoostStatus();
  checkBlockedStatus();
  checkPendingContent();
  // La racha ahora se reclama a mano desde Mi Perfil, no automático al entrar
  switchTab("feed");
}

async function checkPendingContent() {
  const { data } = await sb.rpc("get_pending_content", { p_user_id: currentUser.id });
  if (!data) return;

  if (data.terms_pending) {
    showTermsUpdateModal();
  } else if (data.tutorial_pending) {
    showTutorialModal();
  } else if (data.changelog_pending) {
    showChangelogModal(data.changelog_entries || []);
  }
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
    reparado: { title: "🛠️ Reparado", color: "#7dd3fc" },
    proximamente: { title: "🔜 Próximamente", color: "var(--text-dim)" }
  };
  const byCategory = {};
  entries.forEach(e => { byCategory[e.category] = byCategory[e.category] || []; byCategory[e.category].push(e.content); });

  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div id="changelogOverlay" class="modal-overlay" style="transition:opacity 0.35s ease;">
      <div id="changelogBox" class="modal-box" style="transition:transform 0.35s cubic-bezier(0.4,0,1,1), opacity 0.35s ease;">
        <div class="modal-box-header"><h2>✨ Novedades</h2></div>
        <div class="modal-box-body">
          ${["nuevo","actualizado","reparado","proximamente"].map(cat => byCategory[cat] ? `
            <div style="margin-bottom:14px;">
              <div style="font-weight:600; font-size:13px; color:${labels[cat].color}; margin-bottom:6px;">${labels[cat].title}</div>
              ${byCategory[cat].map(c => `<div style="font-size:13px; color:var(--text-dim); margin-bottom:4px;">• ${escapeHtml(c)}</div>`).join("")}
            </div>` : "").join("")}
        </div>
        <div class="modal-box-footer">
          <button class="btn" style="width:100%;" onclick="handleAcceptChangelog()">Aceptar</button>
        </div>
      </div>
    </div>`;
}

async function openChangelogHistory() {
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="modal-overlay" style="z-index:100;" onclick="if(event.target===this) closeChangelogHistory()">
      <div class="modal-box" style="max-width:440px;">
        <div class="modal-box-header">
          <h2>📢 Novedades</h2>
          <button onclick="closeChangelogHistory()" style="background:none;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;">✕</button>
        </div>
        <div class="modal-box-body">
          <p style="color:var(--text-dim); font-size:12px; margin-top:0; margin-bottom:16px;">Todo lo que fuimos sumando y mejorando en LiveScroll.</p>
          <div id="changelogHistoryList">Cargando...</div>
        </div>
      </div>
    </div>`;

  const labels = {
    nuevo: { title: "🆕 Nuevo", color: "var(--green)" },
    actualizado: { title: "🔄 Actualizado", color: "var(--gold)" },
    reparado: { title: "🛠️ Reparado", color: "#7dd3fc" },
    proximamente: { title: "🔜 Próximamente", color: "var(--text-dim)" }
  };

  const { data: entries, error } = await sb.rpc("get_changelog_history", { p_limit: 30 });
  const list = document.getElementById("changelogHistoryList");
  if (!list) return;

  if (error || !entries || !entries.length) {
    list.innerHTML = `<p style="color:var(--text-dim); font-size:13px;">Todavía no hay novedades publicadas.</p>`;
    return;
  }

  const byVersion = {};
  entries.forEach(e => {
    byVersion[e.version] = byVersion[e.version] || { display: null, cats: {} };
    if (e.display_version && !byVersion[e.version].display) byVersion[e.version].display = e.display_version;
    byVersion[e.version].cats[e.category] = byVersion[e.version].cats[e.category] || [];
    byVersion[e.version].cats[e.category].push(e.content);
  });
  const versions = Object.keys(byVersion).map(Number).sort((a, b) => b - a);
  const currentVersion = versions[0];

  list.innerHTML = versions.map(v => {
    const label = byVersion[v].display || `${v}.0.0`;
    return `
    <div style="margin-bottom:18px; padding-bottom:16px; border-bottom:1px solid var(--border);">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
        <div style="font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--text-dim);">v${escapeHtml(label)}</div>
        ${v === currentVersion ? `<span style="font-size:10px; font-weight:700; color:#12130f; background:var(--gold); padding:2px 8px; border-radius:20px; letter-spacing:0.04em;">ACTUAL</span>` : ""}
      </div>
      ${["nuevo","actualizado","reparado","proximamente"].map(cat => byVersion[v].cats[cat] ? `
        <div style="margin-bottom:10px;">
          <div style="font-weight:600; font-size:13px; color:${labels[cat].color}; margin-bottom:6px;">${labels[cat].title}</div>
          ${byVersion[v].cats[cat].map(c => `<div style="font-size:13px; color:var(--text-dim); margin-bottom:4px;">• ${escapeHtml(c)}</div>`).join("")}
        </div>` : "").join("")}
    </div>`;
  }).join("");
}

function closeChangelogHistory() {
  document.getElementById("globalModalWrap").innerHTML = "";
}

async function handleAcceptChangelog() {
  await sb.rpc("acknowledge_content", { p_user_id: currentUser.id, p_content_key: "changelog" });

  const box = document.getElementById("changelogBox");
  const overlay = document.getElementById("changelogOverlay");
  if (box && overlay) {
    box.style.transform = "translate(140%, 140%) scale(0.15)";
    box.style.opacity = "0";
    overlay.style.opacity = "0";
    setTimeout(() => { document.getElementById("globalModalWrap").innerHTML = ""; }, 350);
  } else {
    document.getElementById("globalModalWrap").innerHTML = "";
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
          <button onclick="document.getElementById('globalModalWrap').innerHTML=''" style="background:none;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;">✕</button>
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
            : `<button class="btn" style="width:100%;" onclick="handleClaimLoginStreak()">Reclamar Día ${claimableDay}</button>`}
        </div>
      </div>
    </div>`;
}

async function handleClaimLoginStreak() {
  const { data, error } = await sb.rpc("claim_daily_streak", { p_user_id: currentUser.id });
  if (error || !data.ok) { showToast("No se pudo reclamar, probá de nuevo"); return; }

  currentProfile.points_balance += data.points;
  currentProfile.streak_current_day = data.day;
  updateBalanceUI();
  document.getElementById("globalModalWrap").innerHTML = "";
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
  showStreakModal(data);
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
        <button class="btn" style="width:100%;" onclick="document.getElementById('globalModalWrap').innerHTML=''">Genial</button>
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
  renderProfile();
}

async function handleDeleteOwnVideo(videoId) {
  if (!confirm("¿Eliminar este video para siempre? Se borran también sus likes, comentarios y vistas. No se puede deshacer.")) return;
  const { data, error } = await sb.rpc("delete_own_video", { p_video_id: videoId });
  if (error || !data.ok) { showToast("No se pudo eliminar el video"); return; }
  showToast("Video eliminado");
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

function switchTab(tab) {
  clearAllWatchIntervals();
  currentTab = tab;
  document.querySelectorAll(".nav-links button").forEach(b => b.classList.remove("active"));
  const activeBtn = document.getElementById("tab-" + tab);
  if (activeBtn) activeBtn.classList.add("active");

  if (tab === "feed") renderFeed();
  if (tab === "foryou") renderForYou();
  if (tab === "upload") renderUpload();
  if (tab === "profile") renderProfile();
  if (tab === "users") renderUsersDirectory();
  if (tab === "directos") renderDirectos();
  if (tab === "wallet") renderWallet();
  if (tab === "plans") renderPlans();
  if (tab === "store") renderStore();
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
    <div id="loginStreakBannerWrap" class="login-streak-banner-float"></div>
    <div id="feedList">Cargando videos...</div>`;
  checkAndShowLoginStreak();

  const { data: videos, error } = await sb
    .from("videos")
    .select("*, profiles!videos_user_id_fkey(username, plan_id)")
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
  setupPullToRefresh(renderFeed);
  setupSwipeNavigation("feed", { left: "foryou" });
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

function setupFeedObserver(videos) {
  const videoMap = Object.fromEntries(videos.map(v => [v.id, v]));
  loadedEmbeds.clear();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const videoId = entry.target.dataset.videoId;
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        loadEmbed(videoMap[videoId]);
        startWatching(videoMap[videoId]);
      } else {
        stopWatching(videoId);
        unloadEmbed(videoId, videoMap[videoId]);
      }
    });
  }, { threshold: [0, 0.6, 1] });

  document.querySelectorAll(".feed-item").forEach(el => observer.observe(el));
  feedObserverInstance = observer;

  // Cargamos el primero de una, sin esperar a que el observer dispare
  if (videos[0]) loadEmbed(videos[0]);
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
  const thumb = video.platform === "youtube" ? getThumbnailHtml(video) : "";
  return `<div class="feed-fallback">
    ${thumb && thumb.startsWith("<img") ? thumb.replace('alt="miniatura"', 'alt="miniatura" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;opacity:0.5;"') : ""}
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
      <video src="${escapeHtml(url)}" controls autoplay muted loop playsinline style="width:100%;height:100%;object-fit:contain;"></video>
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
          <div class="feed-item" data-video-id="${v.id}">
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

  const container = document.getElementById("profileFeedVertical");
  const startEl = document.querySelector(`#profileFeedVertical [data-video-id="${startVideoId}"]`);
  if (container && startEl) container.scrollTop = startEl.offsetTop;
}

function closeProfileVideoFeed() {
  clearAllWatchIntervals();
  document.getElementById("globalModalWrap").innerHTML = "";
}

function getGridCoverHtml(video) {
  const thumb = getThumbnailHtml(video);
  if (thumb.startsWith("<img")) {
    return thumb.replace("<img ", `<img style="width:100%;height:100%;object-fit:cover;" `);
  }
  return `<div class="grid-fallback">${thumb}</div>`;
}

function toggleVideoTileMenu(videoId) {
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
  loadedEmbeds.clear();
  if (feedObserverInstance) {
    feedObserverInstance.disconnect();
    feedObserverInstance = null;
  }
}

// ============================================================
// SUBIR VIDEO
// ============================================================
function renderUpload() {
  rawSelectedFile = null;
  trimmedFile = null;
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
            💡 Si tu video es más largo o pesa de más, elegilo igual — te va a aparecer la opción de recortarlo acá mismo antes de subirlo.
          </p>
          <input type="file" id="uploadFile" accept=".mp4,.mkv,video/mp4,video/x-matroska,video/webm"
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
let rawSelectedFile = null;
let trimmedFile = null;

function previewFileSize() {
  rawSelectedFile = document.getElementById("uploadFile").files[0] || null;
  trimmedFile = null;
  refreshFileSizeUI();
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

  const streakSectionHtml = badges && badges.length ? `
    <div class="profile-section">
      <div class="profile-section-head">
        <div class="ico">🏅</div>
        <h3>Medallas</h3>
        <div class="sub"><button onclick="switchTab('feed')" style="background:none; border:none; color:var(--gold); cursor:pointer; font-family:inherit; font-size:12px;">Ver Inicio de Sesión →</button></div>
      </div>
      <div class="form-card">
        <div class="streak-badges">
          ${badges.map(b => `<div class="badge-icon" title="${escapeHtml(b.badge_name)}">${b.badge_icon || "🏅"}</div>`).join("")}
        </div>
      </div>
    </div>` : "";

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
              ${pinnedIds.has(v.id) ? `<div class="pinned-badge">📌</div>` : ""}
              <button class="grid-menu-btn" onclick="event.stopPropagation(); toggleVideoTileMenu('${v.id}')">⋮</button>
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
    <div class="profile-hero">
      <div class="profile-cover${currentProfile.cover_url ? " has-image" : ""}" id="profileCoverBanner" style="${currentProfile.cover_url ? `background-image:url('${escapeHtml(currentProfile.cover_url)}');` : ""}">
        <button class="profile-cover-edit-btn" onclick="openEditProfile()">🖼️ Editar portada</button>
      </div>
      <div class="profile-hero-top">
        <div class="profile-avatar-ring ${getAvatarRingClass(currentProfile.plan_id)}${currentProfile.is_live ? " avatar-live-ring" : ""}">${renderAvatarHtml(currentProfile, 60)}</div>
        <div class="profile-name-block">
          <h1>@${escapeHtml(currentProfile.username)} ${getPlanBadgeHtml(currentProfile.plan_id)}</h1>
          <div class="handle">Tu perfil en LiveScroll</div>
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

    ${socialClicksHtml}
    ${streakSectionHtml}
    ${referralSectionHtml}
    ${videosSectionHtml}`;
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
  showToast(`+${data.points} pts por compartir`);
}

async function openComments(videoId) {
  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div style="position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:100; display:flex; align-items:flex-end; justify-content:center;" onclick="if(event.target===this) closeComments()">
      <div style="background:var(--panel); width:100%; max-width:420px; max-height:70vh; max-height:70dvh; border-radius:20px 20px 0 0; padding:20px; padding-bottom:max(20px, env(safe-area-inset-bottom)); display:flex; flex-direction:column; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-shrink:0;">
          <h3 style="margin:0;">Comentarios</h3>
          <button onclick="closeComments()" style="background:none;border:none;color:var(--text-dim);font-size:20px;cursor:pointer;">✕</button>
        </div>
        <div id="commentsList" style="overflow-y:auto; -webkit-overflow-scrolling:touch; flex:1 1 auto; min-height:0; margin-bottom:14px;">Cargando...</div>
        <div style="display:flex; gap:8px; flex-shrink:0;">
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
    .select("*, profiles!video_comments_user_id_fkey(username, plan_id)")
    .eq("video_id", videoId)
    .order("created_at", { ascending: false });

  const list = document.getElementById("commentsList");
  if (!list) return;
  list.innerHTML = comments && comments.length
    ? comments.map(c => `
        <div style="margin-bottom:12px; font-size:13px;">
          <strong style="color:var(--gold);">@${escapeHtml(c.profiles?.username || "usuario")}</strong> ${getPlanBadgeHtml(c.profiles?.plan_id)}
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
        <div class="feed-item" data-video-id="${v.id}">
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
async function renderDirectos() {
  const main = document.getElementById("appView");
  main.innerHTML = `
    <h1 class="page-title">🔴 Directos</h1>
    <p class="page-sub">Creadores de LiveScroll transmitiendo en vivo ahora mismo.</p>
    <div id="directosList">Cargando...</div>`;

  const { data: liveUsers, error } = await sb
    .from("profiles")
    .select("id, username, avatar_emoji, avatar_url, plan_id, live_platform, live_started_at, social_kick, social_twitch")
    .eq("is_live", true)
    .is("ban_reason", null)
    .order("live_started_at", { ascending: false });

  const list = document.getElementById("directosList");
  if (!list) return;

  if (error) { list.innerHTML = `<p class="error-msg">No se pudo cargar quién está en vivo.</p>`; return; }
  if (!liveUsers || !liveUsers.length) {
    list.innerHTML = `<p style="color:var(--text-dim); font-size:13px;">Nadie está en vivo ahora mismo. Volvé más tarde 👀</p>`;
    return;
  }

  list.innerHTML = liveUsers.map(u => {
    const platformLabel = u.live_platform === "both" ? "🟢 Kick + 🟣 Twitch" : u.live_platform === "kick" ? "🟢 Kick" : "🟣 Twitch";
    const watchButtons = [
      (u.live_platform === "kick" || u.live_platform === "both") && u.social_kick && isSafeUrl(u.social_kick)
        ? `<a href="${escapeHtml(u.social_kick)}" target="_blank" rel="noopener" class="watch-btn" style="text-decoration:none;">Ver en Kick</a>` : "",
      (u.live_platform === "twitch" || u.live_platform === "both") && u.social_twitch && isSafeUrl(u.social_twitch)
        ? `<a href="${escapeHtml(u.social_twitch)}" target="_blank" rel="noopener" class="watch-btn" style="text-decoration:none;">Ver en Twitch</a>` : "",
    ].join("");
    return `
    <div class="directo-card">
      <div class="avatar-lg" onclick="viewPublicProfile('${escapeHtml(u.username)}')" style="cursor:pointer;">${renderAvatarHtml(u, 52)}</div>
      <div class="info" onclick="viewPublicProfile('${escapeHtml(u.username)}')" style="cursor:pointer;">
        <div class="uname">@${escapeHtml(u.username)} ${getPlanBadgeHtml(u.plan_id)}</div>
        <div class="plat">${platformLabel} · en vivo</div>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">${watchButtons}</div>
    </div>`;
  }).join("");
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

async function viewPublicProfile(username) {
  if (!username) return;
  if (username === currentProfile.username) { switchTab("profile"); return; }

  clearAllWatchIntervals();
  previousTabBeforeProfile = currentTab;

  const main = document.getElementById("appView");
  main.innerHTML = `<p>Cargando perfil...</p>`;
  document.querySelectorAll(".nav-links button").forEach(b => b.classList.remove("active"));

  const { data: profile } = await sb.from("profiles").select("id, username, avatar_emoji, avatar_url, cover_url, bio, social_kick, social_twitch, social_youtube, social_tiktok, social_instagram, plan_id, is_live, live_platform").eq("username", username).single();
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

  main.innerHTML = `
    <button class="btn-outline" style="margin-bottom:18px;" onclick="switchTab('${previousTabBeforeProfile}')">← Volver</button>

    <div class="profile-hero">
      <div class="profile-cover${profile.cover_url ? " has-image" : ""}" style="${profile.cover_url ? `background-image:url('${escapeHtml(profile.cover_url)}');` : ""}"></div>
      <div class="profile-hero-top">
        <div class="profile-avatar-ring ${getAvatarRingClass(profile.plan_id)}${profile.is_live ? " avatar-live-ring" : ""}">${renderAvatarHtml(profile, 60)}</div>
        <div class="profile-name-block">
          <h1>@${escapeHtml(profile.username)} ${getPlanBadgeHtml(profile.plan_id)}</h1>
          <div class="handle">Perfil público</div>
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
  panel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding:0 2px;">
      <strong style="font-size:14px;">Notificaciones</strong>
      <button onclick="document.getElementById('notifPanel')?.remove()" style="background:none; border:none; color:var(--text-dim); font-size:18px; cursor:pointer; line-height:1; padding:2px 4px;">✕</button>
    </div>
    ${notifCache.length
      ? notifCache.map(n => `
          <div style="padding:10px; border-bottom:1px solid var(--border); font-size:13px; ${n.read ? "opacity:0.5;" : ""}">
            <div>${escapeHtml(n.message)}</div>
            <div style="color:var(--text-dim); font-size:11px; margin-top:2px;">${new Date(n.created_at).toLocaleString("es-AR")}</div>
          </div>`).join("")
      : `<p style="color:var(--text-dim); font-size:13px; padding:10px;">Sin notificaciones todavía.</p>`}`;

  document.body.appendChild(panel);

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

async function openEditProfile() {
  const baseEmojis = ["🎬","⚡","🔥","🎮","🎧","🐐","🚀","💎","😎","🎯"];
  const { data: unlocked } = await sb.from("user_unlocked_emojis").select("emoji").eq("user_id", currentUser.id);
  const emojis = [...baseEmojis, ...(unlocked || []).map(u => u.emoji).filter(e => !baseEmojis.includes(e))];

  const wrap = document.getElementById("globalModalWrap");
  wrap.innerHTML = `
    <div class="modal-overlay" style="z-index:100;" onclick="if(event.target===this) this.remove()">
      <div class="modal-box" style="max-width:380px;">
        <div class="modal-box-header"><h2 style="font-size:19px;">Editar perfil</h2></div>
        <div class="modal-box-body">
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
          <div style="border-radius:10px; overflow:hidden; height:70px; background:${currentProfile.cover_url ? `url('${escapeHtml(currentProfile.cover_url)}') center/cover` : "var(--panel-2)"}; margin-bottom:10px;"></div>
          <input type="file" id="coverPhotoInput" accept="image/*" onchange="handleCoverPhotoUpload()" style="width:100%; padding:8px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:inherit; font-size:12px;">
          <div id="coverUploadStatus" style="font-size:11px; color:var(--text-dim); margin-top:6px;">Máximo 5MB. Se ve mejor en formato horizontal (ancha).</div>
          ${currentProfile.cover_url ? `<button type="button" class="btn-outline" style="margin-top:10px; padding:9px 14px; font-size:13px; width:100%; color:var(--red); border-color:var(--red); font-weight:600;" onclick="handleRemoveCoverPhoto()">🗑️ Quitar portada</button>` : ""}
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
        <div class="modal-box-footer" style="display:flex; gap:10px;">
          <button class="btn-outline" style="flex:1;" onclick="document.getElementById('globalModalWrap').innerHTML=''">Cancelar</button>
          <button class="btn" style="flex:1;" onclick="saveProfileEdits()">Guardar</button>
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

  const { error: updateError } = await sb.from("profiles").update({ cover_url: freshUrl }).eq("id", currentUser.id);
  if (updateError) { statusEl.textContent = "No se pudo guardar."; statusEl.style.color = "var(--red)"; return; }

  currentProfile.cover_url = freshUrl;
  showToast("¡Portada actualizada!");
  openEditProfile();
}

async function handleRemoveCoverPhoto() {
  const { error } = await sb.from("profiles").update({ cover_url: null }).eq("id", currentUser.id);
  if (error) { showToast("No se pudo quitar la portada"); return; }
  currentProfile.cover_url = null;
  showToast("Portada quitada");
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

    <h3 style="margin-top:32px;">🔒 Candado de Planes</h3>
    <div class="form-card" style="margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <div style="font-size:13px;">Controla si el resto de los usuarios puede ver la pestaña de Planes.</div>
        <div style="font-size:12px; color:var(--text-dim); margin-top:2px;">Vos (admin) siempre ves todo, esto no te afecta.</div>
      </div>
      <button class="btn" id="plansLockBtn" onclick="handleTogglePlansLock()">Cargando...</button>
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
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px;">
        <input type="text" id="newEmojiChar" placeholder="🐐" maxlength="4" style="width:60px; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text); text-align:center;">
        <button type="button" class="btn-outline" onclick="openEmojiPicker('newEmojiChar', FACE_EMOJIS)">Elegir</button>
        <input type="text" id="newEmojiName" placeholder="Nombre (ej: GOAT)" style="flex:1; min-width:140px; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text);">
        <input type="number" id="newEmojiPrice" placeholder="Precio en pts" style="width:120px; padding:10px; background:var(--ink); border:1px solid var(--border); border-radius:8px; color:var(--text);">
        <button class="btn" onclick="handleAddStoreEmoji()">Agregar</button>
      </div>
      <div id="storeEmojisList">Cargando...</div>
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

    <h3 style="margin-top:32px;">🔒 Candado de Billetera</h3>
    <div class="form-card" style="margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <div style="font-size:13px;">Pausa que cualquiera pueda pedir un canje, sin tocar los puntos de nadie.</div>
        <div style="font-size:12px; color:var(--text-dim); margin-top:2px;">Vos (admin) siempre podés retirar igual, esto no te afecta.</div>
      </div>
      <button class="btn" id="walletLockBtn" onclick="handleToggleWalletLock()">Cargando...</button>
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
  loadStoreEmojisList();
  loadStorePrices();
  loadStoreItemsList();
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
      <span>${e.emoji} ${escapeHtml(e.name)} · <span class="mono">${e.price_points} pts</span> ${!e.active ? '<span style="color:var(--text-dim);">(desactivado)</span>' : ""}</span>
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
  const price = parseInt(document.getElementById("newEmojiPrice").value, 10);

  if (!emoji || !name || !price) { showToast("Completá los 3 campos"); return; }

  const { data, error } = await sb.rpc("admin_add_store_emoji", { p_emoji: emoji, p_name: name, p_price: price });
  if (error || !data.ok) { showToast("No se pudo agregar"); return; }

  document.getElementById("newEmojiChar").value = "";
  document.getElementById("newEmojiName").value = "";
  document.getElementById("newEmojiPrice").value = "";
  showToast("Emoji agregado");
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
  const { data } = await sb.from("app_text_config").select("*").eq("key", "plans_visibility").single();
  const status = data?.value || "open";
  btn.textContent = status === "open" ? "🟢 Abierto — cerrar ahora" : "🔴 Cerrado — abrir ahora";
  btn.className = status === "open" ? "btn" : "btn-outline";
  btn.dataset.current = status;
}

async function handleTogglePlansLock() {
  const btn = document.getElementById("plansLockBtn");
  const newStatus = btn.dataset.current === "open" ? "closed" : "open";
  const { data, error } = await sb.rpc("admin_set_plans_visibility", { p_status: newStatus });
  if (error || !data.ok) { showToast("No se pudo cambiar"); return; }
  showToast(newStatus === "closed" ? "Planes cerrado para los demás" : "Planes abierto de nuevo");
  loadPlansLockStatus();
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
  const plans = await loadPlans();
  const options = plans.map(p => p.name).join(" / ");
  const chosen = prompt(`Activar plan para @${username}.\n\nEscribí exactamente uno de estos: ${options}`);
  if (!chosen) return;
  const plan = plans.find(p => p.name.toLowerCase() === chosen.trim().toLowerCase());
  if (!plan) { showToast("Ese plan no existe, escribilo exacto"); return; }

  const { data, error } = await sb.rpc("admin_set_plan", { p_user_id: userId, p_plan_id: plan.id });
  if (error || !data.ok) { showToast("No se pudo activar el plan"); return; }
  showToast(`Plan ${plan.name} activado`);
  handleUserSearch();
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

  let emojis, myEmojis, plans, storeItems, myItems, pricesData;
  try {
    const results = await Promise.allSettled([
      sb.from("store_emojis").select("*").eq("active", true).order("price_points"),
      sb.from("user_unlocked_emojis").select("emoji").eq("user_id", currentUser.id),
      loadPlans(),
      sb.from("store_items").select("*").eq("active", true).order("category").order("sort_order"),
      sb.from("user_unlocked_items").select("item_id").eq("user_id", currentUser.id),
      sb.rpc("get_store_prices")
    ]);

    emojis = results[0].status === "fulfilled" ? results[0].value?.data : null;
    myEmojis = results[1].status === "fulfilled" ? results[1].value?.data : null;
    plans = results[2].status === "fulfilled" ? results[2].value : [];
    storeItems = results[3].status === "fulfilled" ? results[3].value?.data : null;
    myItems = results[4].status === "fulfilled" ? results[4].value?.data : null;
    pricesData = results[5].status === "fulfilled" ? results[5].value?.data : null;

    results.forEach((r, i) => { if (r.status === "rejected") console.log("Tienda: falló la consulta #" + i, r.reason); });
  } catch (e) {
    console.log("Error cargando la tienda:", e);
    main.innerHTML = `<p class="error-msg">No se pudo cargar la tienda. Probá recargar la página.</p>`;
    return;
  }

  const myEmojiSet = new Set((myEmojis || []).map(e => e.emoji));
  const myItemSet = new Set((myItems || []).map(i => i.item_id));
  const myPlan = plans.find(p => p.id === currentProfile.plan_id);
  const canBoost = myPlan && myPlan.id !== "standard";
  const planPrices = (pricesData && pricesData.ok && pricesData.prices) ? pricesData.prices : {};
  const boostPrice = myPlan?.id === "diamante" ? (planPrices.boost_price_diamante ?? 13500) : (planPrices.boost_price_plus ?? 3500);
  const higherPlans = plans.filter(p => p.id !== "standard" && p.id !== currentProfile.plan_id);

  const itemsByCategoryMap = {};
  (storeItems || []).forEach(it => {
    itemsByCategoryMap[it.category] = itemsByCategoryMap[it.category] || [];
    itemsByCategoryMap[it.category].push(it);
  });
  const itemsByCategory = Object.entries(itemsByCategoryMap);

  main.innerHTML = `
    <h1 class="page-title">🛍️ Tienda de puntos</h1>
    <p class="page-sub">Balance: <strong class="mono" style="color:var(--gold)">${currentProfile.points_balance} pts</strong></p>

    <h3 style="margin-top:24px;">😎 Emojis exclusivos</h3>
    <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:10px; margin-bottom:24px;">
      ${(emojis || []).map(e => `
        <div class="form-card" style="text-align:center;">
          <div style="font-size:30px;">${e.emoji}</div>
          <div style="font-size:12px; margin:4px 0;">${escapeHtml(e.name)}</div>
          ${myEmojiSet.has(e.emoji)
            ? `<span style="font-size:11px; color:var(--green);">✓ Tenés este</span>`
            : `<button class="btn-outline" style="padding:4px 8px; font-size:11px;" onclick="handleBuyEmoji('${e.id}')">${e.price_points} pts</button>`}
        </div>
      `).join("")}
    </div>

    <h3 style="margin-top:24px;">⚡ Boost extra</h3>
    <div class="form-card" style="margin-bottom:24px;">
      ${canBoost ? `
        <p style="font-size:13px; color:var(--text-dim); margin-bottom:10px;">Activá un boost x${myPlan.boost_multiplier} por 24hs ahora mismo, aparte del gratis de tu plan.</p>
        <button class="btn" onclick="handleBuyBoost()">Comprar boost — ${boostPrice} pts</button>
      ` : `<p style="font-size:13px; color:var(--text-dim);">Este beneficio es solo para planes Plus o Diamante.</p>`}
    </div>

    <h3 style="margin-top:24px;">💎 Cambiar de plan con puntos</h3>
    <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:24px;">
      ${higherPlans.map(p => `
        <div class="form-card" style="flex:1; min-width:180px;">
          <div style="font-weight:600;">${p.name}</div>
          <div style="font-size:12px; color:var(--text-dim); margin-bottom:10px;">Boost x${p.boost_multiplier}, tope semanal $${p.weekly_redemption_cap.toLocaleString("es-AR")}</div>
          <button class="btn-outline" onclick="handleBuyPlan('${p.id}')">${planPrices[p.id === "plus" ? "plan_upgrade_price_plus" : "plan_upgrade_price_diamante"] ?? (p.id === "plus" ? "2.999" : "6.999")} pts</button>
        </div>
      `).join("") || `<p style="color:var(--text-dim); font-size:13px;">Ya tenés el plan más alto.</p>`}
    </div>

    ${itemsByCategory.length ? itemsByCategory.map(([category, items]) => `
      <h3 style="margin-top:24px;">✨ ${escapeHtml(category)}</h3>
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
  const { data, error } = await sb.rpc("buy_emoji", { p_user_id: currentUser.id, p_emoji_id: emojiId });
  if (error || !data.ok) {
    const msgs = { saldo_insuficiente: "No tenés suficientes puntos.", ya_lo_tenes: "Ya tenés este emoji." };
    showToast(msgs[data?.error] || "No se pudo comprar");
    return;
  }
  await loadProfile();
  updateBalanceUI();
  showToast(`¡Desbloqueaste ${data.emoji}!`);
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

async function handleBuyStoreItem(itemId) {
  const { data, error } = await sb.rpc("buy_store_item", { p_item_id: itemId });
  if (error || !data.ok) {
    const msgs = { saldo_insuficiente: "No tenés suficientes puntos.", ya_lo_tenes: "Ya tenés este artículo.", no_disponible: "Este artículo ya no está disponible." };
    showToast(msgs[data?.error] || "No se pudo comprar");
    return;
  }
  await loadProfile();
  updateBalanceUI();
  showToast("¡Compra realizada!");
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
