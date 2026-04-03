import{a as E}from"../chunk-M5WYQG72.js";import{b as L}from"../chunk-JC2HHO6E.js";import{a as C}from"../chunk-QTSKM2GQ.js";import{a as k}from"../chunk-D2GOMEHW.js";var M={confirmed:"مؤكد",pending:"قيد الانتظار",done:"مكتمل",cancelled:"ملغى",retrieval:"مسترد"},A={paid:"مدفوع",partial:"جزئي",unpaid:"غير مدفوع"};function D(t){return t=String(t||"").toLowerCase(),t==="confirmed"?"badge badge-green":t==="pending"?"badge badge-amber":t==="cancelled"||t==="canceled"?"badge badge-red":t==="done"?"badge badge-blue":t==="retrieval"?"badge badge-green":"badge badge-muted"}function F(t){return t=String(t||"").toLowerCase(),t==="paid"?"badge badge-green":t==="partial"?"badge badge-amber":"badge badge-muted"}function q(t,n,s=String){if(!t)return;if(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches){t.textContent=s(n);return}let o=700,r=performance.now(),a=c=>{let m=Math.min(1,(c-r)/o),p=1-Math.pow(1-m,3);t.textContent=s(Math.round(n*p)),m<1&&requestAnimationFrame(a)};requestAnimationFrame(a)}function g(t,n,s,o=!1){let r=document.querySelector(`[data-stat-label="${t}"]`),a=document.querySelector(`[data-stat-value="${t}"]`);r&&(r.textContent=n),a&&(o?a.textContent=L(s??0):q(a,Number(s)||0,c=>String(c)))}function y(){return new Date().toISOString().slice(0,10)}async function f(t){let n=document.querySelector("[data-appointments-body]");n&&E(n,6,7);let s=t?`?date=${t}`:"";try{let o=await k(`/employee/dashboard${s}`);if(!o)return;let r=await o.json().catch(()=>({}));if(!o.ok)throw new Error(r?.message||"فشل تحميل لوحة التحكم");let a=r?.data||r,c=a?.today||{},m=a?.allTime||{},p=!t||t===y();g("todayBookings",p?"حجوزات اليوم":"حجوزات اليوم المحدد",c?.bookingsCount??0,!1),g("todayDeposits",p?"عربون اليوم":"عربون اليوم المحدد",c?.depositsCollected??0,!0),g("allBookings","إجمالي الحجوزات",m?.totalBookings??0,!1),g("allRevenue","إجمالي الإيرادات",m?.totalRevenue??0,!0);let h=a?.bookings||[],v=[...Array.isArray(h)?h:[]].sort((e,i)=>String(e?.appointmentTime||"").localeCompare(String(i?.appointmentTime||"")));if(!n)return;if(n.innerHTML="",!v.length){let e=p?"لا توجد مواعيد مجدولة لليوم.":"لا توجد مواعيد في هذا اليوم.";n.innerHTML=`
        <tr><td colspan="7">
          <div class="empty-state">
            <div class="empty-illus" aria-hidden="true">📅</div>
            <div style="font-weight:700;font-family:var(--font-display);margin-top:.5rem">لا يوجد مواعيد</div>
            <div class="secondary" style="margin-top:.25rem">${e}</div>
          </div>
        </td></tr>`;return}for(let e of v){let i=e?.patient||{},l=i?.name||e?.patientName||"—",u=i?.phone||e?.phone||"—",T=e?.serviceType||e?.service||"—",w=String(e?.status||"").toLowerCase(),b=String(e?.paymentStatus||"unpaid").toLowerCase(),B=e?.appointmentTime||e?.time||"—",I=e?._id||e?.id,$=i?._id,S=document.createElement("tr");S.innerHTML=`
        <td class="tnum" dir="ltr">${B}</td>
        <td>
          ${$?`<a href="/patients/${$}" style="font-weight:600;color:var(--accent)">${l}</a>`:`<span style="font-weight:600">${l}</span>`}
        </td>
        <td>
          <button class="btn btn-ghost btn-sm" type="button" data-call="${u}" dir="ltr">${u}</button>
        </td>
        <td>${T}</td>
        <td><span class="${D(w)}">${M[w]||e?.status||"—"}</span></td>
        <td><span class="${F(b)}">${A[b]||b}</span></td>
        <td>
          <a class="btn btn-ghost btn-sm" href="/bookings/${I}">
            <i data-lucide="eye"></i> عرض
          </a>
        </td>
      `,n.appendChild(S)}window.lucide?.createIcons?.({attrs:{"stroke-width":1.8}}),n.addEventListener("click",e=>{let i=e.target?.closest("[data-call]");if(!i)return;let l=i.getAttribute("data-call");if(l&&l!=="—"){let u=l.replace(/\D/g,"");window.location.href=`tel:+${u.startsWith("20")?u:"20"+u}`}})}catch(o){C("error",o?.message||"فشل تحميل لوحة التحكم",{title:"خطأ"})}}var d=document.getElementById("dashDateFilter"),x=document.getElementById("dashDateBtn"),N=document.getElementById("dashTodayBtn");d&&(d.value=y());x?.addEventListener("click",()=>f(d?.value||""));N?.addEventListener("click",()=>{d&&(d.value=y()),f("")});d?.addEventListener("keydown",t=>{t.key==="Enter"&&f(d.value||"")});await f("");
