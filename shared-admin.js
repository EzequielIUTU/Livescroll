/* LiveScroll Shared Admin · ficha moderna para LS6 y LS7.
   Se monta sobre el panel existente sin reemplazar sus funciones. */
(function(){
  const esc=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]);
  const money=value=>Number(value||0).toLocaleString("es-AR");
  let users=new Map(),activeUser=null;

  function toast(message){if(typeof showToast==="function")showToast(message)}
  function close(){const wrap=document.getElementById("globalModalWrap");if(wrap)wrap.innerHTML=""}
  function statusLabel(user,access){return user.ban_reason?"BANEADO":user.is_blocked?"BLOQUEADO":access?.suspension_reason?"SUSPENDIDO":"ACTIVO"}
  function historyLabel(type){return({suspension_temporary:"Suspensión temporal",suspension_permanent:"Suspensión permanente",suspension_cleared:"Suspensión levantada",suspension_expired:"Suspensión vencida"})[type]||"Acción administrativa"}

  async function open(userId){
    const user=users.get(String(userId));if(!user)return toast("Volvé a cargar la lista de usuarios");
    activeUser=user;const wrap=document.getElementById("globalModalWrap");if(!wrap)return;
    wrap.innerHTML='<div class="modal-overlay shared-admin-overlay"><section class="shared-admin-center"><div class="shared-admin-loading">Abriendo ficha administrativa…</div></section></div>';
    const [videos,ledger,accessResult,historyResult]=await Promise.all([
      sb.from("videos").select("id,title,platform,created_at",{count:"exact"}).eq("user_id",user.id).order("created_at",{ascending:false}).limit(8),
      sb.from("points_ledger").select("amount,reason,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(10),
      sb.rpc("admin_get_user_controls",{p_user_id:user.id}),
      sb.rpc("admin_get_user_history",{p_user_id:user.id,p_limit:20})
    ]);
    const center=wrap.querySelector(".shared-admin-center");if(!center)return;
    const access=accessResult.data?.ok?accessResult.data:{plans_blocked:false,wallet_blocked:false,admin_notes:""};user._sharedControls=access;
    const status=statusLabel(user,access),isActive=status==="ACTIVO";
    const publications=(videos.data||[]).map(video=>`<article><span><b>${esc(video.title||"Publicación")}</b><small>${esc(String(video.platform||"video").toUpperCase())} · ${new Date(video.created_at).toLocaleDateString("es-AR")}</small></span></article>`).join("");
    const movements=(ledger.data||[]).map(item=>`<article><span><b>${esc(item.reason||"Movimiento")}</b><small>${new Date(item.created_at).toLocaleString("es-AR")}</small></span><strong class="${Number(item.amount)>=0?"positive":"negative"}">${Number(item.amount)>=0?"+":""}${money(item.amount)}</strong></article>`).join("");
    const history=(historyResult.data?.history||[]).map(item=>`<article><i>${String(item.action_type||"").includes("cleared")?"✓":"!"}</i><span><b>${historyLabel(item.action_type)}</b><small>${esc(item.detail||"Acción administrativa")} · ${new Date(item.created_at).toLocaleString("es-AR")}</small></span></article>`).join("");
    center.innerHTML=`<header><span><small>FICHA ADMINISTRATIVA · LS${typeof getLiveScrollRuntimeGeneration==="function"?getLiveScrollRuntimeGeneration():6}</small><h2>@${esc(user.username||"usuario")}</h2><p>${esc(user.email||"Correo protegido")}</p></span><button data-shared-close>×</button></header>
      <section class="shared-admin-status ${isActive?"active":"blocked"}"><i>${isActive?"✓":"!"}</i><span><small>CONTROL DE CUENTA</small><b>${isActive?"Sin sanciones activas":status}</b><em>${esc(isActive?"La cuenta está habilitada actualmente.":user.ban_reason||access.suspension_reason||"Acceso restringido")}</em></span></section>
      <section class="shared-admin-metrics"><div><b>${money(user.points_balance)}</b><span>Puntos</span></div><div><b>${Number(videos.count||0)}</b><span>Videos</span></div><div><b>${esc(String(user.plan_id||"standard").toUpperCase())}</b><span>Plan</span></div><div><b>${user.is_creator?"SÍ":"NO"}</b><span>Creador</span></div></section>
      <nav class="shared-admin-tools"><button data-shared-action="points">± Puntos</button><button data-shared-action="plan">Cambiar plan</button><button class="${access.plans_blocked?"safe":"warning"}" data-shared-action="plans">${access.plans_blocked?"Habilitar Planes":"Bloquear Planes"}</button><button class="${access.wallet_blocked?"safe":"warning"}" data-shared-action="wallet">${access.wallet_blocked?"Habilitar Billetera":"Bloquear Billetera"}</button><button data-shared-action="note">Nota privada</button><button class="warning" data-shared-action="suspend">${access.suspension_reason?"Cambiar suspensión":"Suspender temporalmente"}</button><button data-shared-action="creator">${user.is_creator?"Quitar Creador":"Dar Creador"}</button><button data-shared-action="verify" ${user.is_creator?"":"disabled"}>${user.is_creator_verified?"Quitar verificado":"Verificar"}</button><button data-shared-action="profile">Ver perfil público</button><button class="${isActive?"danger":"safe"}" data-shared-action="block">${isActive?"Bloqueo permanente":"Desbloquear cuenta"}</button>${String(user.id)===String(currentUser?.id)?'<button class="critical" disabled>Cuenta administradora actual</button>':'<button class="critical" data-shared-action="delete">Eliminar cuenta</button>'}</nav>
      <section class="shared-admin-history"><h3>Nota administrativa privada</h3><div class="shared-admin-note">◆ <span>${esc(access.admin_notes||"Todavía no hay notas sobre este usuario.")}</span></div><h3>Historial administrativo</h3><div>${history||"<p>Sin acciones registradas todavía.</p>"}</div><h3>Publicaciones recientes</h3><div>${publications||"<p>Sin publicaciones.</p>"}</div><h3>Movimientos de billetera</h3><div>${movements||"<p>Sin movimientos.</p>"}</div></section>`;
    center.querySelector("[data-shared-close]").onclick=close;
    center.querySelectorAll("[data-shared-action]").forEach(button=>button.onclick=()=>action(button.dataset.sharedAction,user));
  }

  async function action(type,user){
    if(type==="points"){close();return handleAdjustPoints(user.id,user.username)}
    if(type==="plan"){close();return handleSetPlan(user.id,user.username)}
    if(type==="creator"){close();return handleAdminCreatorAccess(user.id,user.username,!user.is_creator)}
    if(type==="verify"){close();return handleAdminCreatorProgram(user.id,user.username,!user.is_creator_verified)}
    if(type==="profile"){close();return viewPublicProfile(user.username)}
    if(type==="block"){close();return statusLabel(user,user._sharedControls)==="ACTIVO"?handleBanUser(user.id,user.username):handleUnbanUser(user.id)}
    if(type==="plans"||type==="wallet"){
      const key=type+"_blocked",blocked=!Boolean(user._sharedControls?.[key]);
      const result=await sb.rpc("admin_set_user_service_access",{p_user_id:user.id,p_service:type,p_blocked:blocked});
      if(result.error||!result.data?.ok)return toast("No pudimos cambiar ese acceso");toast((type==="plans"?"Planes":"Billetera")+(blocked?" bloqueado":" habilitado"));return open(user.id)
    }
    if(type==="note"){
      const note=prompt(`Nota privada sobre @${user.username}:`,user._sharedControls?.admin_notes||"");if(note===null)return;
      const result=await sb.rpc("admin_save_user_note",{p_user_id:user.id,p_note:note});if(result.error||!result.data?.ok)return toast("No pudimos guardar la nota");toast("Nota guardada");return open(user.id)
    }
    if(type==="suspend"){
      const hours=prompt("Duración de la suspensión en horas (1, 24, 72, 168 o 720):","24");if(hours===null)return;const duration=Number(hours);if(![1,24,72,168,720].includes(duration))return toast("Elegí una duración válida");
      const reason=prompt("Motivo de la suspensión:");if(!reason?.trim())return toast("Necesitás escribir un motivo");
      const result=await sb.rpc("admin_set_ls8_suspension",{p_user_id:user.id,p_reason:reason.trim(),p_until:new Date(Date.now()+duration*3600000).toISOString()});if(result.error||!result.data?.ok)return toast("No pudimos aplicar la suspensión");toast("Suspensión aplicada");return open(user.id)
    }
    if(type==="delete"){
      const confirmation=prompt(`Se eliminará definitivamente a @${user.username}. Escribí ELIMINAR:`);if(confirmation?.trim().toUpperCase()!=="ELIMINAR")return toast("Cancelado");
      const result=await sb.rpc("admin_delete_account_ls8",{p_user_id:user.id});if(result.error||!result.data?.ok)return toast("No pudimos eliminar la cuenta");close();toast("Cuenta eliminada por completo");return refreshAdminUsersResults()
    }
  }

  function install(){
    if(typeof window.renderUserCards!=="function")return setTimeout(install,200);
    const base=window.renderUserCards;
    window.renderUserCards=async function(data,error,resultsEl,showAll){
      (data||[]).forEach(user=>users.set(String(user.id),user));
      await base.call(this,data,error,resultsEl,showAll);
      if(error)return;
      [...resultsEl.querySelectorAll(".form-card")].forEach((card,index)=>{const user=(data||[])[index];if(!user||card.querySelector("[data-shared-manage]"))return;const actions=card.querySelector("div:last-child");if(!actions)return;const button=document.createElement("button");button.className="btn shared-admin-manage";button.dataset.sharedManage=user.id;button.textContent="Gestionar";button.onclick=()=>open(user.id);actions.prepend(button)})
    };
  }
  window.openSharedAdminUser=open;document.readyState==="loading"?document.addEventListener("DOMContentLoaded",install,{once:true}):install();
})();
