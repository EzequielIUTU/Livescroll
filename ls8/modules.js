let ls8ActiveView="inicio";
let ls8User=null;
let ls8Profile=null;
const ls8Meta={
  inicio:["HOY EN TU MUNDO","No recorrés un feed.<br><em>Descubrís señales.</em>","TRANSMISIONES CERCANAS"],
  explorar:["EXPLORADOR DE MUNDOS","Cada creador deja una señal.<br><em>Encontrá la próxima.</em>","SEÑALES RECIENTES"],
  directos:["SEÑAL EN TIEMPO REAL","Todos los directos.<br><em>Un solo centro.</em>","CREADORES EN VIVO"],
  usuarios:["COMUNIDAD LIVESCROLL","Personas, creadores<br><em>y mundos por descubrir.</em>","DIRECTORIO DE USUARIOS"],
  perfil:["TU IDENTIDAD EN LS8","Este es tu espacio.<br><em>Este es tu mundo.</em>","RESUMEN DE TU CUENTA"]
};
function ls8SetCount(value){document.querySelector("#signalCount").textContent=String(Number(value)||0).padStart(2,"0")}
function ls8Avatar(p){return p&&p.avatar_url?'<img src="'+escapeHtml(p.avatar_url)+'" alt="" loading="lazy">':'<span>'+escapeHtml(p&&p.avatar_emoji||"◇")+'</span>'}
function ls8SetMeta(view){const m=ls8Meta[view]||ls8Meta.inicio;document.querySelector("#worldHeroKicker").textContent=m[0];document.querySelector("#worldHeroTitle").innerHTML=m[1];document.querySelector("#worldSectionTitle").textContent=m[2]}
async function ls8GetProfile(id){
  let r=await sb.from("profiles").select("id,username,avatar_url,avatar_emoji,bio,is_creator,is_creator_verified,is_live,live_platform,kick_is_live,twitch_is_live,youtube_is_live,tiktok_is_live,social_kick,social_twitch,social_youtube,social_tiktok,points").eq("id",id).maybeSingle();
  if(r.error)r=await sb.from("profiles").select("id,username,avatar_url,avatar_emoji,bio,is_creator,is_live,live_platform,social_kick,social_twitch,social_youtube,social_tiktok,points").eq("id",id).maybeSingle();
  return r.data||null;
}
async function ls8Identity(){
  const auth=await sb.auth.getUser();ls8User=auth.data.user||null;if(!ls8User)return;
  ls8Profile=await ls8GetProfile(ls8User.id);
  const name=ls8Profile&&ls8Profile.username||ls8User.email.split("@")[0]||"creador";
  document.querySelector("#worldGreeting").textContent="Buenas, "+name+".";
  document.querySelector("#worldAvatar").innerHTML=ls8Avatar(ls8Profile);
}
function ls8LivePlatforms(p){
  return [["kick",p.kick_is_live||p.live_platform==="kick"],["twitch",p.twitch_is_live||p.live_platform==="twitch"],["youtube",p.youtube_is_live||p.live_platform==="youtube"],["tiktok",p.tiktok_is_live||p.live_platform==="tiktok"]].filter(function(x){return x[1]}).map(function(x){return x[0]});
}
async function ls8LoadLives(){
  feed.innerHTML='<div class="feed-loading">Localizando transmisiones…</div>';
  let r=await sb.from("profiles").select("id,username,avatar_url,avatar_emoji,bio,is_live,live_platform,kick_is_live,twitch_is_live,youtube_is_live,tiktok_is_live").limit(80);
  if(r.error)r=await sb.from("profiles").select("id,username,avatar_url,avatar_emoji,bio,is_live,live_platform").eq("is_live",true).limit(80);
  const lives=(r.data||[]).map(function(p){return {p:p,platforms:ls8LivePlatforms(p)}}).filter(function(x){return x.p.is_live||x.platforms.length});
  ls8SetCount(lives.length);feed.className="signal-feed world-directory";
  feed.innerHTML=lives.map(function(x){return '<article class="world-person is-live"><div class="world-person-avatar">'+ls8Avatar(x.p)+'</div><div><small>EN VIVO · '+escapeHtml((x.platforms[0]||x.p.live_platform||"LIVE").toUpperCase())+'</small><strong>@'+escapeHtml(x.p.username||"creador")+'</strong><p>'+escapeHtml(x.p.bio||"Transmitiendo ahora en LiveScroll.")+'</p><div class="platform-pills">'+x.platforms.map(function(p){return "<span>"+escapeHtml(p)+"</span>"}).join("")+'</div></div></article>'}).join("")||'<div class="feed-empty">No hay creadores en directo en este momento.</div>';
}
async function ls8LoadUsers(){
  feed.innerHTML='<div class="feed-loading">Abriendo el mapa de la comunidad…</div>';
  let r=await sb.from("profiles").select("id,username,avatar_url,avatar_emoji,bio,is_creator,is_creator_verified").not("username","is",null).order("username").limit(60);
  if(r.error)r=await sb.from("profiles").select("id,username,avatar_url,avatar_emoji,bio,is_creator").not("username","is",null).order("username").limit(60);
  const users=r.data||[];ls8SetCount(users.length);feed.className="signal-feed world-directory";
  feed.innerHTML=users.map(function(p){return '<article class="world-person"><div class="world-person-avatar">'+ls8Avatar(p)+'</div><div><small>'+(p.is_creator?"MUNDO DE CREADOR":"USUARIO LIVESCROLL")+(p.is_creator_verified?" · VERIFICADO":"")+'</small><strong>@'+escapeHtml(p.username)+'</strong><p>'+escapeHtml(p.bio||"Una nueva señal dentro de LiveScroll.")+'</p></div></article>'}).join("")||'<div class="feed-empty">Todavía no hay usuarios para mostrar.</div>';
}
async function ls8LoadProfile(){
  if(!ls8User){showAccess(true);return}
  ls8Profile=await ls8GetProfile(ls8User.id);
  const results=await Promise.all([sb.from("videos").select("id",{count:"exact",head:true}).eq("user_id",ls8User.id),sb.from("follows").select("id",{count:"exact",head:true}).eq("following_id",ls8User.id),sb.from("follows").select("id",{count:"exact",head:true}).eq("follower_id",ls8User.id)]);
  ls8SetCount(results[0].count||0);feed.className="signal-feed world-directory";
  feed.innerHTML='<article class="own-world-card"><div class="own-world-head"><div class="world-person-avatar">'+ls8Avatar(ls8Profile)+'</div><div><small>'+(ls8Profile&&ls8Profile.is_creator?"MUNDO DE CREADOR":"MI MUNDO")+'</small><h4>@'+escapeHtml(ls8Profile&&ls8Profile.username||"usuario")+'</h4><p>'+escapeHtml(ls8Profile&&ls8Profile.bio||"Tu mundo está listo para recibir su primera identidad.")+'</p></div></div><div class="world-stats"><div><b>'+(results[0].count||0)+'</b><span>SEÑALES</span></div><div><b>'+(results[1].count||0)+'</b><span>SEGUIDORES</span></div><div><b>'+(results[2].count||0)+'</b><span>SIGUIENDO</span></div><div><b>'+Number(ls8Profile&&ls8Profile.points||0)+'</b><span>PUNTOS</span></div></div><div class="world-foundation-note"><b>MUNDO LS8 · BASE ACTIVA</b><span>Acá vivirán la personalización, los eventos y los coleccionables interactivos.</span></div></article>';
}
async function ls8RenderView(view){
  ls8ActiveView=view;ls8SetMeta(view);document.querySelectorAll("[data-view]").forEach(function(x){x.classList.toggle("active",x.dataset.view===view)});
  if(view==="inicio"||view==="explorar"){feed.className="signal-feed";await loadWorld();if(view==="explorar")document.querySelector("#worldSectionTitle").textContent="SEÑALES RECIENTES"}
  else if(view==="directos")await ls8LoadLives();
  else if(view==="usuarios")await ls8LoadUsers();
  else await ls8LoadProfile();
}
async function ls8Start(){await ls8Identity();await ls8RenderView(ls8ActiveView)}
document.querySelectorAll("[data-view]").forEach(function(btn){btn.onclick=function(){ls8RenderView(btn.dataset.view)}});
document.querySelector("#refreshBtn").onclick=function(){ls8RenderView(ls8ActiveView)};
sb.auth.onAuthStateChange(function(event,session){if(event==="SIGNED_IN"&&session)setTimeout(ls8Start,0)});
sb.auth.getSession().then(function(r){if(r.data.session)ls8Start()});

