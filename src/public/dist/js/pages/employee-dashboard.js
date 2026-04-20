import{a as v}from"../chunk-M5WYQG72.js";import{b as I}from"../chunk-JC2HHO6E.js";import{a as C}from"../chunk-QTSKM2GQ.js";import{a as w}from"../chunk-HVCWB66H.js";var A={confirmed:"مؤكد",pending:"قيد الانتظار",done:"مكتمل",cancelled:"ملغى",retrieval:"مسترد"},H={paid:"مدفوع",partial:"جزئي",unpaid:"غير مدفوع"};function x(t){return t=String(t||"").toLowerCase(),t==="confirmed"?"badge badge-green":t==="pending"?"badge badge-amber":t==="cancelled"||t==="canceled"?"badge badge-red":t==="done"?"badge badge-blue":t==="retrieval"?"badge badge-green":"badge badge-muted"}function j(t){return t=String(t||"").toLowerCase(),t==="paid"?"badge badge-green":t==="partial"?"badge badge-amber":"badge badge-muted"}function N(t,o,a=String){if(!t)return;if(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches){t.textContent=a(o);return}let d=700,n=performance.now(),r=i=>{let s=Math.min(1,(i-n)/d),m=1-Math.pow(1-s,3);t.textContent=a(Math.round(o*m)),s<1&&requestAnimationFrame(r)};requestAnimationFrame(r)}function b(t,o,a,d=!1){let n=document.querySelector(`[data-stat-label="${t}"]`),r=document.querySelector(`[data-stat-value="${t}"]`);n&&(n.textContent=o),r&&(d?r.textContent=I(a??0):N(r,Number(a)||0,i=>String(i)))}function l(){return new Date().toISOString().slice(0,10)}async function $(t="",o=""){let a=document.querySelector("[data-appointments-body]");a&&v(a,6,7);let d=new URLSearchParams;t&&d.set("from",t),o&&d.set("to",o);let n=d.toString()?`?${d}`:"";try{let r=await w(`/employee/dashboard${n}`);if(!r)return;let i=await r.json().catch(()=>({}));if(!r.ok)throw new Error(i?.message||"فشل تحميل لوحة التحكم");let s=i?.data||i,m=s?.today||{},S=s?.allTime||{},y=!t&&!o;b("todayBookings",y?"حجوزات اليوم":"حجوزات الفترة المحددة",m?.bookingsCount??0,!1),b("todayDeposits",y?"عربون اليوم":"عربون الفترة المحددة",m?.depositsCollected??0,!0),b("allBookings","إجمالي الحجوزات",S?.totalBookings??0,!1),b("allRevenue","إجمالي الإيرادات",S?.totalRevenue??0,!0);let k=s?.bookings||[],L=[...Array.isArray(k)?k:[]].sort((e,c)=>String(e?.appointmentTime||"").localeCompare(String(c?.appointmentTime||"")));if(!a)return;if(a.innerHTML="",!L.length){let e=y?"لا توجد مواعيد مجدولة لليوم.":"لا توجد مواعيد في هذا اليوم.";a.innerHTML=`
        <tr><td colspan="7">
          <div class="empty-state">
            <div class="empty-illus" aria-hidden="true">📅</div>
            <div style="font-weight:700;font-family:var(--font-display);margin-top:.5rem">لا يوجد مواعيد</div>
            <div class="secondary" style="margin-top:.25rem">${e}</div>
          </div>
        </td></tr>`;return}for(let e of L){let c=e?.patient||{},u=c?.name||e?.patientName||"—",p=c?.phone||e?.phone||"—",q=e?.serviceType||e?.service||"—",T=String(e?.status||"").toLowerCase(),h=String(e?.paymentStatus||"unpaid").toLowerCase(),D=e?.appointmentTime||e?.time||"—",F=e?._id||e?.id,E=c?._id,B=document.createElement("tr");B.innerHTML=`
        <td class="tnum" dir="ltr">${D}</td>
        <td>
          ${E?`<a href="/patients/${E}" style="font-weight:600;color:var(--accent)">${u}</a>`:`<span style="font-weight:600">${u}</span>`}
        </td>
        <td>
          <button class="btn btn-ghost btn-sm" type="button" data-call="${p}" dir="ltr">${p}</button>
        </td>
        <td>${q}</td>
        <td><span class="${x(T)}">${A[T]||e?.status||"—"}</span></td>
        <td><span class="${j(h)}">${H[h]||h}</span></td>
        <td>
          <a class="btn btn-ghost btn-sm" href="/bookings/${F}">
            <i data-lucide="eye"></i> عرض
          </a>
        </td>
      `,a.appendChild(B)}window.lucide?.createIcons?.({attrs:{"stroke-width":1.8}}),a.addEventListener("click",e=>{let c=e.target?.closest("[data-call]");if(!c)return;let u=c.getAttribute("data-call");if(u&&u!=="—"){let p=u.replace(/\D/g,"");window.location.href=`tel:+${p.startsWith("20")?p:"20"+p}`}})}catch(r){C("error",r?.message||"فشل تحميل لوحة التحكم",{title:"خطأ"})}}var f=document.getElementById("dashDateFrom"),g=document.getElementById("dashDateTo"),M=document.getElementById("dashDateBtn"),P=document.getElementById("dashTodayBtn");f&&(f.value=l());g&&(g.value=l());M?.addEventListener("click",()=>$(f?.value||"",g?.value||""));P?.addEventListener("click",()=>{f&&(f.value=l()),g&&(g.value=l()),$(l(),l())});[f,g].forEach(t=>t?.addEventListener("keydown",o=>{o.key==="Enter"&&M?.click()}));await $(l(),l());async function R(){let t=document.querySelector("[data-perf-body]");if(t){v(t,5,6);try{let o=await w("/admin/performance",{method:"GET"});if(!o)return;let a=await o.json().catch(()=>({}));if(!o.ok)return;let d=a?.data?.performance||[];if(t.innerHTML="",!d.length){t.innerHTML='<tr><td colspan="6"><div class="empty-state"><div class="secondary">لا يوجد موظفون</div></div></td></tr>';return}for(let n of d){let r=n?.employeeId,i=n.role==="admin"?"badge badge-red":n.role==="mini-admin"?"badge badge-amber":"badge badge-blue",s=n.role==="admin"?"مدير":n.role==="mini-admin"?"مدير مساعد":"موظف",m=document.createElement("tr");m.innerHTML=`
        <td style="font-weight:600">${n.name||"—"}</td>
        <td class="secondary" style="font-size:13px">${n.email||"—"}</td>
        <td><span class="${i}">${s}</span></td>
        <td class="tnum">${n.totalBookings??0}</td>
        <td class="tnum">${n.confirmedBookings??0}</td>
        <td>
          <a class="btn btn-ghost btn-sm" href="/admin/employees/${r}">
            <i data-lucide="eye"></i> التفاصيل
          </a>
        </td>
      `,t.appendChild(m)}window.lucide?.createIcons?.({attrs:{"stroke-width":1.8}})}catch{}}}document.querySelector("[data-perf-body]")&&await R();
