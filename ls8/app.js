const SUPABASE_URL="https://lxpjqvlphvjyygifedeb.supabase.co";
const SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4cGpxdmxwaHZqeXlnaWZlZGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTMyMTMsImV4cCI6MjA5ODk4OTIxM30.9ovZlNQ-XKdSszZuMYb6PzRnXtX5eejuzBeqpKgkVnk";
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const $=selector=>document.querySelector(selector);
const esc=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
let authMode="login",activeFeed="para-ti",currentUser=null,currentProfile=null,videos=[];

function showApp(open){$("#authScreen").classList.toggle("hidden",open);$("#mainApp").classList.toggle("open",open);$("#mainApp").setAttribute("aria-hidden",String(!open));if(open)bootApp()}
function setAvatar(target,profile){if(profile?.avatar_url)target.innerHTML=`<img src="${esc(profile.avatar_url)}" alt="">`;else target.textContent=profile?.avatar_emoji||"8"}
function playableUrl(video){return video.video_url||""}
function posterUrl(video){return video.thumbnail_url||""}

async function loadIdentity(){
  const {data:{user}}=await sb.auth.getUser();currentUser=user;if(!user)return;
  const {data}=await sb.from("profiles").select("id,username,avatar_url,avatar_emoji,bio,points,is_creator,is_creator_verified").eq("id",user.id).maybeSingle();
  currentProfile=data||{};setAvatar($("#topAvatar"),currentProfile);
}

function videoCard(video,index){
  const profile=video.profiles||{},url=playableUrl(video),poster=posterUrl(video),isFile=/\.(mp4|webm|mov)(\?|$)/i.test(url)||video.platform==="upload";
  const media=isFile?`<video src="${esc(url)}" ${poster?`poster="${esc(poster)}"`:""} playsinline loop preload="metadata"></video>`:poster?`<img src="${esc(poster)}" alt="" loading="lazy">`:`<div class="video-placeholder"><b>LS8</b><span>Abrir publicación</span></div>`;
  return `<article class="video-card" data-index="${index}" data-url="${esc(url)}"><div class="video-media">${media}</div><div class="shade"></div><div class="video-copy"><strong>@${esc(profile.username||"usuario")}</strong><p>${esc(video.title||"Nueva publicación en LiveScroll")}</p><small>${esc((video.client_origin||video.platform||"LS8").toUpperCase())}</small></div><aside class="video-actions"><button data-action="profile" type="button"><span class="action-avatar">${profile.avatar_url?`<img src="${esc(profile.avatar_url)}" alt="">`:esc(profile.avatar_emoji||"○")}</span></button><button data-action="like" type="button"><i>♥</i><span>${Number(video.likes_count||0)}</span></button><button data-action="comments" type="button"><i>●</i><span>${Number(video.comments_count||0)}</span></button><button data-action="share" type="button"><i>↗</i><span>Compartir</span></button><button data-action="save" type="button"><i>▣</i><span>Guardar</span></button></aside></article>`;
}

async function loadFeed(){
  const feed=$("#videoFeed");feed.innerHTML='<div class="state">Buscando videos…</div>';
  let query=sb.from("videos").select("id,user_id,title,video_url,thumbnail_url,platform,client_origin,created_at,profiles!videos_user_id_fkey(username,avatar_url,avatar_emoji)").order("created_at",{ascending:false}).limit(30);
  if(activeFeed==="siguiendo"&&currentUser){const {data:follows}=await sb.from("follows").select("following_id").eq("follower_id",currentUser.id);const ids=(follows||[]).map(row=>row.following_id);if(!ids.length){feed.innerHTML='<div class="state">Todavía no seguís a ningún creador.</div>';return}query=query.in("user_id",ids)}
  const {data,error}=await query;if(error){feed.innerHTML='<div class="state error">No pudimos cargar el feed. Tocá para reintentar.</div>';feed.onclick=loadFeed;return}
  videos=data||[];feed.innerHTML=videos.map(videoCard).join("")||'<div class="state">Todavía no hay videos para mostrar.</div>';bindVideoCards();observeVideos();
}

function bindVideoCards(){
  document.querySelectorAll(".video-card").forEach(card=>card.addEventListener("click",event=>{const action=event.target.closest("[data-action]")?.dataset.action;if(action){event.stopPropagation();if(action==="share"&&navigator.share)navigator.share({title:"LiveScroll 8",url:card.dataset.url||location.href});else if(action==="like"||action==="save")event.target.closest("button").classList.toggle("selected");return}const video=card.querySelector("video");if(video)video.paused?video.play():video.pause();else if(card.dataset.url)window.open(card.dataset.url,"_blank","noopener")}));
}
function observeVideos(){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{const video=entry.target.querySelector("video");if(!video)return;if(entry.isIntersecting&&entry.intersectionRatio>.7)video.play().catch(()=>{});else video.pause()}),{threshold:[.2,.7]});document.querySelectorAll(".video-card").forEach(card=>observer.observe(card))}

async function loadProfile(){
  await loadIdentity();const target=$("#profileView");if(!currentUser)return;
  const [{count:posts},{count:followers},{count:following}]=await Promise.all([sb.from("videos").select("id",{count:"exact",head:true}).eq("user_id",currentUser.id),sb.from("follows").select("id",{count:"exact",head:true}).eq("following_id",currentUser.id),sb.from("follows").select("id",{count:"exact",head:true}).eq("follower_id",currentUser.id)]);
  target.innerHTML=`<header class="profile-head"><div class="profile-avatar" id="profileAvatar"></div><div><small>${currentProfile?.is_creator?"CREADOR":"USUARIO"}${currentProfile?.is_creator_verified?" · VERIFICADO":""}</small><h2>@${esc(currentProfile?.username||currentUser.email?.split("@")[0]||"usuario")}</h2><p>${esc(currentProfile?.bio||"Este es tu espacio en LiveScroll 8.")}</p></div></header><div class="profile-stats"><div><b>${posts||0}</b><span>Videos</span></div><div><b>${followers||0}</b><span>Seguidores</span></div><div><b>${following||0}</b><span>Siguiendo</span></div><div><b>${Number(currentProfile?.points||0)}</b><span>Puntos</span></div></div><button class="logout" id="logoutBtn" type="button">Cerrar sesión</button>`;setAvatar($("#profileAvatar"),currentProfile);$("#logoutBtn").onclick=async()=>{await sb.auth.signOut();location.reload()};
}

async function switchView(view){document.querySelectorAll("[data-view]").forEach(button=>button.classList.toggle("active",button.dataset.view===view));document.querySelectorAll(".view").forEach(section=>section.classList.toggle("active",section.id===`view-${view}`));$("#feedTabs").classList.toggle("hidden",view!=="inicio");if(view==="perfil")loadProfile();if(view==="alertas")$("#alertsList").innerHTML='<div class="empty-card"><b>Tus alertas aparecerán acá.</b><span>Likes, comentarios y nuevos seguidores en un solo lugar.</span></div>'}
async function bootApp(){await loadIdentity();await loadFeed()}

document.querySelectorAll("[data-auth-mode]").forEach(button=>button.onclick=()=>{authMode=button.dataset.authMode;document.querySelectorAll("[data-auth-mode]").forEach(item=>item.classList.toggle("active",item===button));$("#authSubmit").textContent=authMode==="login"?"ENTRAR A LS8":"CREAR MI CUENTA";$("#authStatus").textContent=""});
$("#authForm").onsubmit=async event=>{event.preventDefault();const button=$("#authSubmit"),email=$("#email").value.trim(),password=$("#password").value;button.disabled=true;$("#authStatus").textContent="Conectando…";const result=authMode==="login"?await sb.auth.signInWithPassword({email,password}):await sb.auth.signUp({email,password});button.disabled=false;if(result.error){$("#authStatus").textContent=result.error.message;return}if(authMode==="login")showApp(true);else $("#authStatus").textContent="Cuenta creada. Revisá tu correo si se solicita confirmación."};
document.querySelectorAll("[data-view]").forEach(button=>button.onclick=()=>switchView(button.dataset.view));
document.querySelectorAll("[data-feed]").forEach(button=>button.onclick=()=>{activeFeed=button.dataset.feed;document.querySelectorAll("[data-feed]").forEach(item=>item.classList.toggle("active",item===button));loadFeed()});
$("#topAvatar").onclick=()=>switchView("perfil");
sb.auth.getSession().then(({data})=>showApp(Boolean(data.session)));
