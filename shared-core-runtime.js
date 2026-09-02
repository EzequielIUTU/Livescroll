/* LiveScroll Shared Core · estabilidad común LS6/LS7.
   Capa reversible: no reemplaza el núcleo histórico. */
(function(){
  const RELEASE={6:"6.2.4",7:"7.0.9"};
  let accessCheckRunning=false,accessCheckedUser="";

  function generation(){
    try{return typeof getLiveScrollRuntimeGeneration==="function"?Number(getLiveScrollRuntimeGeneration()):6}catch(_){return 6}
  }
  function stopLegacyUpdateFlow(){
    try{if(typeof ls6UpdateWatchTimer!=="undefined"&&ls6UpdateWatchTimer){clearInterval(ls6UpdateWatchTimer);ls6UpdateWatchTimer=null}}catch(_){}
    try{if(typeof ls7UpdateWatchTimer!=="undefined"&&ls7UpdateWatchTimer){clearInterval(ls7UpdateWatchTimer);ls7UpdateWatchTimer=null}}catch(_){}
    document.getElementById("ls6LiveUpdatePrompt")?.remove();
    document.getElementById("ls7LiveUpdatePrompt")?.remove();
  }
  try{
    showLiveScroll6UpdatePrompt=function(){};
    showLiveScroll7UpdatePrompt=function(){};
    startLiveScroll6UpdateWatcher=function(){stopLegacyUpdateFlow()};
    startLiveScroll7UpdateWatcher=function(){stopLegacyUpdateFlow()};
  }catch(_){}

  function releaseMedia(){
    document.querySelectorAll("video,audio").forEach(media=>{try{media.pause()}catch(_){}});
    document.querySelectorAll("iframe[src*='youtube.com/embed'],iframe[src*='player.twitch.tv'],iframe[src*='kick.com']").forEach(frame=>{if(frame.offsetParent===null)frame.src="about:blank"});
  }
  function hardenExternalLinks(root=document){
    root.querySelectorAll?.('a[target="_blank"]').forEach(link=>{
      const rel=new Set(String(link.rel||"").split(/\s+/).filter(Boolean));rel.add("noopener");rel.add("noreferrer");link.rel=[...rel].join(" ");
    });
  }
  function showSuspension(access){
    if(document.getElementById("sharedCoreSuspension"))return;
    const layer=document.createElement("section");layer.id="sharedCoreSuspension";layer.className="shared-core-suspension";
    const reason=String(access.suspension_reason||"Suspensión administrativa").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]);
    const until=access.suspended_until?new Date(access.suspended_until).toLocaleString("es-AR"):"Hasta nuevo aviso";
    layer.innerHTML='<article><small>CUENTA PAUSADA · SHARED CORE</small><h2>Tu acceso está suspendido</h2><p>'+reason+'</p><div><span>FINALIZA</span><b>'+until+'</b></div><button type="button">Cerrar sesión</button></article>';
    document.body.appendChild(layer);layer.querySelector("button").onclick=()=>typeof handleLogout==="function"?handleLogout():sb.auth.signOut()
  }
  async function checkAccountAccess(){
    if(accessCheckRunning||typeof currentUser==="undefined"||!currentUser?.id||typeof currentProfile==="undefined"||currentProfile?.is_admin)return;
    if(accessCheckedUser===currentUser.id)return;accessCheckRunning=true;
    try{const result=await sb.rpc("get_my_service_access");if(result.data?.suspended)showSuspension(result.data);accessCheckedUser=currentUser.id}catch(_){}finally{accessCheckRunning=false}
  }
  function boot(){
    document.documentElement.dataset.sharedCore="1";document.documentElement.dataset.sharedRelease=RELEASE[generation()]||RELEASE[6];
    stopLegacyUpdateFlow();hardenExternalLinks();
    const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)hardenExternalLinks(node)})));observer.observe(document.body,{childList:true,subtree:true});
    let attempts=0;const timer=setInterval(()=>{attempts++;stopLegacyUpdateFlow();checkAccountAccess();if(accessCheckedUser||attempts>90)clearInterval(timer)},1000);
    window.addEventListener("pagehide",()=>{releaseMedia();stopLegacyUpdateFlow();observer.disconnect();clearInterval(timer)},{once:true});
    document.addEventListener("visibilitychange",()=>{if(document.hidden)releaseMedia();else checkAccountAccess()});
  }
  window.LiveScrollSharedCore={release:RELEASE,generation,checkAccountAccess};
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot,{once:true}):boot();
})();
