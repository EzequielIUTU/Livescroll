(function(){
  "use strict";
  if(window.__lsViralesReady)return;
  window.__lsViralesReady=true;

  const esc=value=>typeof escapeHtml==="function"?escapeHtml(String(value??"")):String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let activeHours=24;

  function installLaunchers(){
    const nav=document.getElementById("navLinks");
    if(nav&&!document.getElementById("tab-virales")){
      const button=document.createElement("button");
      button.id="tab-virales";
      button.className="ls-viral-launch";
      button.type="button";
      button.textContent="#Virales";
      button.onclick=()=>window.openLiveScrollVirales();
      nav.insertBefore(button,document.getElementById("tab-upload")||null);
    }
    document.querySelectorAll(".mobile-menu-panel,.mobile-menu-content,#mobileMenuPanel").forEach(panel=>{
      if(panel.querySelector("[data-ls-virales]"))return;
      const button=document.createElement("button");
      button.type="button";button.dataset.lsVirales="1";button.className="ls-viral-launch";
      button.innerHTML="<span>🔥</span><b>#Virales</b>";
      button.onclick=()=>{window.openLiveScrollVirales();window.closeMobileMenu?.();};
      panel.prepend(button);
    });
  }

  async function loadViralData(hours){
    const tagsPromise=sb.rpc("get_trending_hashtags",{p_limit:12});
    const videosPromise=sb.rpc("get_viral_videos_v1",{p_window_hours:hours,p_limit:20,p_origin:null});
    const [tagsResult,videosResult]=await Promise.allSettled([tagsPromise,videosPromise]);
    const tags=tagsResult.status==="fulfilled"&&!tagsResult.value.error?(tagsResult.value.data||[]):[];
    let videos=videosResult.status==="fulfilled"&&!videosResult.value.error?(videosResult.value.data||[]):[];

    // Degradación segura: mientras el SQL nuevo no esté activado, mostramos
    // publicaciones recientes sin alterar el Feed principal.
    if(!videos.length){
      const fallback=await sb.from("videos")
        .select("id,title,platform,created_at,profiles!videos_user_id_fkey(username)")
        .order("created_at",{ascending:false}).limit(12);
      videos=(fallback.data||[]).map((v,index)=>({...v,creator_username:v.profiles?.username,viral_score:Math.max(1,12-index)}));
    }
    return {tags,videos};
  }

  function renderShell(){
    const main=document.getElementById("appView");
    if(!main)return null;
    document.querySelectorAll(".nav-links button").forEach(b=>b.classList.remove("active"));
    document.getElementById("tab-virales")?.classList.add("active");
    main.innerHTML=`<main class="ls-viral-shell">
      <section class="ls-viral-hero">
        <div class="ls-viral-kicker">Pulso de la comunidad · Shared Core</div>
        <h1>Esto está<br><span>explotando.</span></h1>
        <p>Videos y etiquetas que están creciendo de verdad. El orden combina actividad reciente, conversación, compartidos y tiempo de reproducción. Comprar puntos no entrega un lugar acá.</p>
        <div class="ls-viral-periods" role="group" aria-label="Período de tendencias">
          <button data-hours="24" class="${activeHours===24?"active":""}">AHORA · 24 H</button>
          <button data-hours="168" class="${activeHours===168?"active":""}">SEMANA</button>
        </div>
      </section>
      <section class="ls-viral-section"><div class="ls-viral-section-head"><h2>Etiquetas en movimiento</h2><small>Hasta 5 por video</small></div><div id="lsViralTags" class="ls-viral-tags"><div class="ls-viral-empty">Calculando tendencias…</div></div></section>
      <section class="ls-viral-section"><div class="ls-viral-section-head"><h2>Videos que suben</h2><small>Actividad real, no pagada</small></div><div id="lsViralVideos" class="ls-viral-list"><div class="ls-viral-empty">Leyendo el pulso…</div></div></section>
    </main>`;
    main.querySelectorAll("[data-hours]").forEach(button=>button.onclick=()=>{activeHours=Number(button.dataset.hours)||24;window.openLiveScrollVirales();});
    return main;
  }

  window.openLiveScrollVirales=async function(){
    if(typeof clearAllWatchIntervals==="function")clearAllWatchIntervals();
    const main=renderShell();
    if(!main)return;
    try{
      const {tags,videos}=await loadViralData(activeHours);
      const tagsEl=document.getElementById("lsViralTags");
      const videosEl=document.getElementById("lsViralVideos");
      if(tagsEl)tagsEl.innerHTML=tags.length?tags.map((tag,index)=>`<button class="ls-viral-tag" onclick="openHashtagFeed('${esc(tag.slug)}')"><b>#${esc(tag.display_name||tag.slug)}</b><span>${index<3?"Subiendo rápido":"En conversación"}</span></button>`).join(""):`<div class="ls-viral-empty">Las primeras etiquetas virales aparecerán cuando la comunidad empiece a usarlas.</div>`;
      if(videosEl)videosEl.innerHTML=videos.length?videos.map((video,index)=>`<button class="ls-viral-video" onclick="openSharedVideo('${esc(video.video_id||video.id)}')"><span class="ls-viral-rank">${index+1}</span><span><strong>${esc(video.title||"Video")}</strong><small>@${esc(video.creator_username||video.profiles?.username||"usuario")} · ${esc(video.platform||"LiveScroll")}</small></span><span class="ls-viral-score">${Number(video.viral_score||0).toFixed(0)} IMPULSO</span></button>`).join(""):`<div class="ls-viral-empty">Todavía no hay suficiente actividad para formar el ranking.</div>`;
    }catch(error){
      const list=document.getElementById("lsViralVideos");
      if(list)list.innerHTML='<div class="ls-viral-empty">No pudimos calcular #Virales ahora. El resto de LiveScroll sigue funcionando normalmente.</div>';
      console.warn("#Virales:",error);
    }
  };

  const observer=new MutationObserver(installLaunchers);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener("DOMContentLoaded",installLaunchers,{once:true});
  installLaunchers();
})();
