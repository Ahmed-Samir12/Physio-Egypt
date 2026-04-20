import{a as h}from"../chunk-M5WYQG72.js";import{b as B}from"../chunk-JC2HHO6E.js";import{a as T}from"../chunk-QTSKM2GQ.js";import{a as y}from"../chunk-HVCWB66H.js";var I={confirmed:"مؤكد",pending:"قيد الانتظار",done:"مكتمل",cancelled:"ملغى",retrieval:"مسترد"},q={paid:"مدفوع",partial:"جزئي",unpaid:"غير مدفوع"};function A(t){return t=String(t||"").toLowerCase(),t==="confirmed"?"badge badge-green":t==="pending"?"badge badge-amber":t==="cancelled"||t==="canceled"?"badge badge-red":t==="done"?"badge badge-blue":t==="retrieval"?"badge badge-green":"badge badge-muted"}function D(t){return t=String(t||"").toLowerCase(),t==="paid"?"badge badge-green":t==="partial"?"badge badge-amber":"badge badge-muted"}function F(t,a,d=String){if(!t)return;if(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches){t.textContent=d(a);return}let o=700,e=performance.now(),r=i=>{let l=Math.min(1,(i-e)/o),s=1-Math.pow(1-l,3);t.textContent=d(Math.round(a*s)),l<1&&requestAnimationFrame(r)};requestAnimationFrame(r)}function f(t,a,d,o=!1){let e=document.querySelector(`[data-stat-label="${t}"]`),r=document.querySelector(`[data-stat-value="${t}"]`);e&&(e.textContent=a),r&&(o?r.textContent=B(d??0):F(r,Number(d)||0,i=>String(i)))}function w(){return new Date().toISOString().slice(0,10)}async function g(t){let a=document.querySelector("[data-appointments-body]");a&&h(a,6,7);let d=t?`?date=${t}`:"";try{let o=await y(`/employee/dashboard${d}`);if(!o)return;let e=await o.json().catch(()=>({}));if(!o.ok)throw new Error(e?.message||"فشل تحميل لوحة التحكم");let r=e?.data||e,i=r?.today||{},l=r?.allTime||{},s=!t||t===w();f("todayBookings",s?"حجوزات اليوم":"حجوزات اليوم المحدد",i?.bookingsCount??0,!1),f("todayDeposits",s?"عربون اليوم":"عربون اليوم المحدد",i?.depositsCollected??0,!0),f("allBookings","إجمالي الحجوزات",l?.totalBookings??0,!1),f("allRevenue","إجمالي الإيرادات",l?.totalRevenue??0,!0);let v=r?.bookings||[],$=[...Array.isArray(v)?v:[]].sort((n,c)=>String(n?.appointmentTime||"").localeCompare(String(c?.appointmentTime||"")));if(!a)return;if(a.innerHTML="",!$.length){let n=s?"لا توجد مواعيد مجدولة لليوم.":"لا توجد مواعيد في هذا اليوم.";a.innerHTML=`
        <tr><td colspan="7">
          <div class="empty-state">
            <div class="empty-illus" aria-hidden="true">📅</div>
            <div style="font-weight:700;font-family:var(--font-display);margin-top:.5rem">لا يوجد مواعيد</div>
            <div class="secondary" style="margin-top:.25rem">${n}</div>
          </div>
        </td></tr>`;return}for(let n of $){let c=n?.patient||{},u=c?.name||n?.patientName||"—",p=c?.phone||n?.phone||"—",C=n?.serviceType||n?.service||"—",S=String(n?.status||"").toLowerCase(),b=String(n?.paymentStatus||"unpaid").toLowerCase(),E=n?.appointmentTime||n?.time||"—",M=n?._id||n?.id,k=c?._id,L=document.createElement("tr");L.innerHTML=`
        <td class="tnum" dir="ltr">${E}</td>
        <td>
          ${k?`<a href="/patients/${k}" style="font-weight:600;color:var(--accent)">${u}</a>`:`<span style="font-weight:600">${u}</span>`}
        </td>
        <td>
          <button class="btn btn-ghost btn-sm" type="button" data-call="${p}" dir="ltr">${p}</button>
        </td>
        <td>${C}</td>
        <td><span class="${A(S)}">${I[S]||n?.status||"—"}</span></td>
        <td><span class="${D(b)}">${q[b]||b}</span></td>
        <td>
          <a class="btn btn-ghost btn-sm" href="/bookings/${M}">
            <i data-lucide="eye"></i> عرض
          </a>
        </td>
      `,a.appendChild(L)}window.lucide?.createIcons?.({attrs:{"stroke-width":1.8}}),a.addEventListener("click",n=>{let c=n.target?.closest("[data-call]");if(!c)return;let u=c.getAttribute("data-call");if(u&&u!=="—"){let p=u.replace(/\D/g,"");window.location.href=`tel:+${p.startsWith("20")?p:"20"+p}`}})}catch(o){T("error",o?.message||"فشل تحميل لوحة التحكم",{title:"خطأ"})}}var m=document.getElementById("dashDateFilter"),H=document.getElementById("dashDateBtn"),x=document.getElementById("dashTodayBtn");m&&(m.value=w());H?.addEventListener("click",()=>g(m?.value||""));x?.addEventListener("click",()=>{m&&(m.value=w()),g("")});m?.addEventListener("keydown",t=>{t.key==="Enter"&&g(m.value||"")});await g("");async function j(){let t=document.querySelector("[data-perf-body]");if(t){h(t,5,6);try{let a=await y("/admin/performance",{method:"GET"});if(!a)return;let d=await a.json().catch(()=>({}));if(!a.ok)return;let o=d?.data?.performance||[];if(t.innerHTML="",!o.length){t.innerHTML='<tr><td colspan="6"><div class="empty-state"><div class="secondary">لا يوجد موظفون</div></div></td></tr>';return}for(let e of o){let r=e?.employeeId,i=e.role==="admin"?"badge badge-red":e.role==="mini-admin"?"badge badge-amber":"badge badge-blue",l=e.role==="admin"?"مدير":e.role==="mini-admin"?"مدير مساعد":"موظف",s=document.createElement("tr");s.innerHTML=`
        <td style="font-weight:600">${e.name||"—"}</td>
        <td class="secondary" style="font-size:13px">${e.email||"—"}</td>
        <td><span class="${i}">${l}</span></td>
        <td class="tnum">${e.totalBookings??0}</td>
        <td class="tnum">${e.confirmedBookings??0}</td>
        <td>
          <a class="btn btn-ghost btn-sm" href="/admin/employees/${r}">
            <i data-lucide="eye"></i> التفاصيل
          </a>
        </td>
      `,t.appendChild(s)}window.lucide?.createIcons?.({attrs:{"stroke-width":1.8}})}catch{}}}document.querySelector("[data-perf-body]")&&await j();
