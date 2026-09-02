const SUPABASE_URL = "https://lxpjqvlphvjyygifedeb.supabase.co",
  SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4cGpxdmxwaHZqeXlnaWZlZGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTMyMTMsImV4cCI6MjA5ODk4OTIxM30.9ovZlNQ-XKdSszZuMYb6PzRnXtX5eejuzBeqpKgkVnk",
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY),
  grid = document.getElementById("versionGrid"),
  news = document.getElementById("evolutionNews"),
  NEWS_KEY = "livescroll_multi_version_news_seen_1";
if (localStorage.getItem(NEWS_KEY)) news.classList.add("closed");
document.getElementById("discoverVersions").onclick = () => {
  localStorage.setItem(NEWS_KEY, "1");
  news.classList.add("closed");
};
const labels = {
  6: {
    name: "Clásica",
    className: "six",
    copy: "La experiencia estable que comenzó esta etapa.",
  },
  7: {
    name: "Inmersiva",
    className: "seven",
    copy: "Una generación visual, profunda y más natural.",
  },
  8: {
    name: "Nueva generación",
    className: "eight",
    copy: "El futuro de LiveScroll, construido desde cero.",
  },
};
function countdown(value) {
  if (!value) return "";
  const diff = new Date(value) - Date.now();
  if (diff <= 0) return "LISTA PARA ABRIR";
  const days = Math.ceil(diff / 86400000);
  return days === 1 ? "FALTA 1 DÍA" : `FALTAN ${days} DÍAS`;
}
function card(v, isAdmin) {
  const info = labels[v.generation],
    open = v.status === "open" || isAdmin,
    url =
      v.generation === 8
        ? "/ls8/?lsentry=1"
        : `/?lsversion=${v.generation}&lsentry=1`,
    state = open
      ? isAdmin && v.status !== "open"
        ? "VISTA ADMIN"
        : "DISPONIBLE"
      : v.status === "maintenance"
        ? "MANTENIMIENTO"
        : "BLOQUEADA",
    date = v.release_label || countdown(v.launch_at) || "PRÓXIMAMENTE";
  return `<article class="version-card ${info.className} ${open ? "" : "locked"}"><header><small>${info.name.toUpperCase()}</small><i>${open ? "●" : "🔒"}</i></header><h3>LS<b>${v.generation}</b></h3><p>${v.message || info.copy}</p><div class="version-meta"><span>ESTADO <b>${state}</b></span><span>LANZAMIENTO <b>${date}</b></span>${v.launch_at && !open ? `<span>CUENTA REGRESIVA <b>${countdown(v.launch_at)}</b></span>` : ""}</div><footer>${open ? `<a class="primary" data-select-generation="${v.generation}" href="${url}">ABRIR LIVESCROLL ${v.generation}</a>` : `<button class="primary">🔒 ${date}</button>`}${v.demo_available ? `<a href="/ls8/demo.html?from=ls6">PROBAR DEMO</a>` : ""}</footer></article>`;
}
let generationNews = { 6: [], 7: [], 8: [] };
const newsModal = document.getElementById("generationNewsModal");
function newsGeneration(entry) {
  const match = String(entry.display_version || "").match(/^(6|7|8)(?:\.|$)/);
  return match ? Number(match[1]) : 0;
}
function newsSeenKey(generation) {
  return `livescroll_selector_news_seen_ls${generation}`;
}
function latestNewsId(generation) {
  return Math.max(0, ...generationNews[generation].map((entry) => Number(entry.version || 0)));
}
function renderNewsButtons() {
  [6, 7, 8].forEach((generation) => {
    const card = grid.querySelector(`.version-card.${labels[generation].className}`);
    if (!card || card.querySelector("[data-open-news]")) return;
    const entries = generationNews[generation];
    if (!entries.length) return;
    const unseen = latestNewsId(generation) > Number(localStorage.getItem(newsSeenKey(generation)) || 0);
    card.querySelector("footer")?.insertAdjacentHTML("beforeend", `<button class="version-news-button" data-open-news="${generation}"><span class="version-news-dot${unseen ? " visible" : ""}"></span>NOVEDADES LS${generation}</button>`);
  });
}
async function loadGenerationNews() {
  let result = await sb.from("changelog_entries").select("version,display_version,category,content,created_at").order("version", { ascending: false }).limit(160);
  if (result.error) result = await sb.from("changelog_entries").select("version,display_version,category,content").order("version", { ascending: false }).limit(160);
  if (result.error) return;
  generationNews = { 6: [], 7: [], 8: [] };
  (result.data || []).forEach((entry) => { const generation = newsGeneration(entry); if (generation) generationNews[generation].push(entry); });
  renderNewsButtons();
}
function openGenerationNews(generation) {
  const entries = generationNews[generation] || [], latest = latestNewsId(generation);
  if (latest) localStorage.setItem(newsSeenKey(generation), String(latest));
  grid.querySelector(`[data-open-news="${generation}"] .version-news-dot`)?.classList.remove("visible");
  const groups = new Map();
  entries.forEach((entry) => { const version = entry.display_version || `LS${generation}`; if (!groups.has(version)) groups.set(version, []); groups.get(version).push(entry); });
  document.getElementById("generationNewsContent").innerHTML = `<header><span><small>EVOLUCIÓN DE LA GENERACIÓN</small><h2>Novedades LS${generation}</h2><p>${entries.length ? `${entries.length} cambios publicados` : "Todavía no hay actualizaciones publicadas."}</p></span><button data-close-generation-news>×</button></header><div class="generation-news-list">${[...groups].map(([version, rows], index) => `<section class="generation-news-release${index === 0 ? " latest" : ""}"><div><small>${index === 0 ? "ÚLTIMA ACTUALIZACIÓN" : "HISTORIAL"}</small><b>${version}</b></div>${rows.map((row) => `<article><i class="${String(row.category || "mejora").toLowerCase()}"></i><span><small>${String(row.category || "mejora").toUpperCase()}</small><p>${String(row.content || "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char])}</p></span></article>`).join("")}</section>`).join("") || '<div class="generation-news-empty">Esta generación todavía no publicó novedades.</div>'}</div>`;
  newsModal.classList.add("open");
  newsModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("news-modal-open");
  newsModal.querySelector("[data-close-generation-news]").onclick = closeGenerationNews;
}
function closeGenerationNews() {
  newsModal.classList.remove("open");newsModal.setAttribute("aria-hidden", "true");document.body.classList.remove("news-modal-open");
}
async function load() {
  const [control, status] = await Promise.all([
      sb.rpc("get_version_control"),
      sb.rpc("get_my_status"),
    ]),
    versions = control.data?.versions || [],
    isAdmin = status.data?.is_admin === true;
  document.getElementById("versionStatus").innerHTML =
    `<i></i><span>${isAdmin ? "Modo administrador · podés previsualizar versiones bloqueadas" : "Disponibilidad sincronizada con LiveScroll"}</span>`;
  grid.innerHTML =
    versions.map((v) => card(v, isAdmin)).join("") ||
    "<p>No pudimos consultar las versiones.</p>";
  loadGenerationNews();
}
grid.addEventListener("click", async (event) => {
  const newsButton = event.target.closest("[data-open-news]");
  if (newsButton) { event.preventDefault(); openGenerationNews(Number(newsButton.dataset.openNews)); return; }
  const link = event.target.closest("[data-select-generation]");
  if (!link || link.dataset.opening) return;
  event.preventDefault();
  link.dataset.opening = "1";
  link.classList.add("is-connecting");
  const generation = Number(link.dataset.selectGeneration);
  const destination = link.href;
  const open = () => location.assign(destination);
  const timer = setTimeout(open, 900);
  try {
    sessionStorage.setItem("livescroll_selected_generation", String(generation));
    await sb.rpc("set_my_generation", { p_generation: generation });
  } catch (error) {
    console.warn("Pasaporte de generación no disponible", error);
  } finally {
    clearTimeout(timer);
    open();
  }
});
newsModal.addEventListener("click", (event) => { if (event.target === newsModal) closeGenerationNews(); });
load();
