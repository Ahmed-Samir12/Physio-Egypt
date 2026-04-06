import{a as m}from"../chunk-BDEPFTOE.js";import{a as y}from"../chunk-QACXIG2G.js";import{a as p}from"../chunk-M5WYQG72.js";import{a as g}from"../chunk-JC2HHO6E.js";import{a as c}from"../chunk-QTSKM2GQ.js";import{a as d}from"../chunk-HVCWB66H.js";var u=await y({allowRoles:["admin","mini-admin"]}),h=u?.data?.user?.role||u?.user?.role||u?.role,i=document.querySelector("[data-users-body]");function $(e){return e==="admin"?"badge badge-red":e==="mini-admin"?"badge badge-amber":e==="employee"?"badge badge-blue":"badge badge-muted"}async function b(){i&&p(i,6,6);try{let e=await d("/admin/users?all=1",{method:"GET"});if(!e)return;let n=await e.json().catch(()=>({}));if(!e.ok)throw new Error(n?.message||"فشل تحميل المستخدمين");let s=n?.data||n,r=s?.users||s?.data||s||[],a=Array.isArray(r)?r:[];if(!i)return;if(i.innerHTML="",!a.length){i.innerHTML='<tr><td colspan="6"><div class="empty-state"><div class="empty-illus"></div><div class="title" style="font-family:var(--font-display);font-weight:700">لا يوجد مستخدمون</div><div class="msg">لا يوجد شيء للإدارة حتى الآن.</div></div></td></tr>';return}a.forEach(t=>{let f=t?._id||t?.id,o=t?.isActive!==!1,w=h==="admin"||t?.role==="employee",v=o?`<button class="btn btn-danger btn-sm" type="button" data-deactivate="${f}" ${w?"":'disabled title="لا يمكن تعطيل هذه الصلاحية"'}>
             <i data-lucide="user-x"></i> تعطيل
           </button>`:`<button class="btn btn-success btn-sm" type="button" data-reactivate="${f}">
             <i data-lucide="user-check"></i> تفعيل
           </button>`,l=document.createElement("tr");l.style.opacity=o?"1":"0.55",l.innerHTML=`
        <td>${t?.name||"—"}</td>
        <td class="secondary">${t?.email||"—"}</td>
        <td><span class="${$(t?.role)}">${t?.role||"—"}</span></td>
        <td>
          <span class="badge ${o?"badge-green":"badge-muted"}">
            ${o?"نشط":"معطّل"}
          </span>
        </td>
        <td>${g(t?.createdAt)}</td>
        <td>${v}</td>
      `,i.appendChild(l)}),window.lucide?.createIcons?.({attrs:{"stroke-width":1.8}})}catch(e){c("error",e?.message||"فشل تحميل المستخدمين")}}document.addEventListener("click",e=>{let n=e.target?.closest?.("[data-deactivate]");if(n){let r=n.getAttribute("data-deactivate");m({title:"تعطيل المستخدم؟",body:"سيفقد هذا المستخدم صلاحية الدخول فور التأكيد.",confirmText:"تأكيد التعطيل",onConfirm:async()=>{let a=await d(`/admin/users/${encodeURIComponent(r)}/deactivate`,{method:"PATCH"});if(!a)return;let t=await a.json().catch(()=>({}));if(!a.ok)throw new Error(t?.message||"فشل إلغاء تفعيل المستخدم");c("warning","تم إلغاء تفعيل حساب المستخدم.",{title:"تم إلغاء التفعيل"}),await b()}});return}let s=e.target?.closest?.("[data-reactivate]");if(s){let r=s.getAttribute("data-reactivate");m({title:"تفعيل المستخدم؟",body:"سيستعيد هذا المستخدم صلاحية الدخول.",confirmText:"تأكيد التفعيل",onConfirm:async()=>{let a=await d(`/admin/users/${encodeURIComponent(r)}/reactivate`,{method:"PATCH"});if(!a)return;let t=await a.json().catch(()=>({}));if(!a.ok)throw new Error(t?.message||"فشل إعادة تفعيل المستخدم");c("success","تم إعادة تفعيل الحساب.",{title:"تم التفعيل"}),await b()}})}});await b();
