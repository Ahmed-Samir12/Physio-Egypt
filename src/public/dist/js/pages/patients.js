import{a as E}from"../chunk-BDEPFTOE.js";import{a as $}from"../chunk-WAWAZ7XK.js";import{b as w}from"../chunk-M5WYQG72.js";import{c as v,d as b}from"../chunk-JC2HHO6E.js";import{a as d}from"../chunk-QTSKM2GQ.js";import{a as u}from"../chunk-HVCWB66H.js";function x(){let e=document.querySelectorAll(".reveal");if(!e.length)return;if(!("IntersectionObserver"in window)){e.forEach(a=>a.classList.add("is-in"));return}let t=new IntersectionObserver(a=>{a.forEach(n=>{n.isIntersecting&&(n.target.classList.add("is-in"),t.unobserve(n.target))})},{threshold:.12});e.forEach((a,n)=>{a.style.getPropertyValue("--d")||a.style.setProperty("--d",`${Math.min(360,n*45)}ms`),t.observe(a)})}var g=await $(),L=g?.data?.user?.role||g?.user?.role||g?.role,I=L==="admin"||L==="mini-admin",s=document.querySelector("[data-patient-grid]"),S=document.querySelector("[data-patients-search]"),k=document.querySelector("[data-total]"),q=document.querySelector("[data-page-info]"),f=document.querySelector("[data-prev]"),h=document.querySelector("[data-next]"),i={page:1,limit:12,search:"",total:0};function R(e){let t=e?.data||e||{},a=t?.patients||t?.results||t?.data||[],n=t?.total||t?.totalResults||t?.count||t?.pagination?.total||0;return{list:Array.isArray(a)?a:[],total:Number(n)||0}}function T(e){return String(e||"").split(" ").filter(Boolean).slice(0,2).map(t=>t[0]?.toUpperCase()).join("")}function A(e){let t=String(e||"").toLowerCase();return t==="male"?"ذكر":t==="female"?"أنثى":e||"—"}function B(){let e=Math.max(1,Math.ceil((i.total||0)/i.limit));q&&(q.textContent=`الصفحة ${i.page} من ${e}`),f&&(f.disabled=i.page<=1),h&&(h.disabled=i.page>=e)}function j(e){if(s){if(s.innerHTML="",!e.length){s.innerHTML=`
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-illus" aria-hidden="true">👥</div>
        <div style="font-weight:700;font-family:var(--font-display);margin-top:.5rem">لا يوجد مرضى</div>
        <div class="secondary" style="margin-top:.25rem">جرّب بحثاً مختلفاً.</div>
      </div>`;return}e.forEach((t,a)=>{let n=t?._id||t?.id,r=t?.name||"—",o=t?.phone||"—",m=A(t?.gender),C=t?.age!=null?`${t.age} سنة`:"—",M=T(r)||"م",P=b(r),y=t?.nationality||"",p=t?.patientId||"",l=document.createElement("div");l.className="card card-pad patient-card reveal",l.style.setProperty("--d",`${Math.min(320,a*35)}ms`),l.innerHTML=`
      <div class="patient-head">
        <div class="initials" style="background:${P}">${M}</div>
        <div style="min-width:0;flex:1">
          <div style="font-family:var(--font-display);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r}</div>
          <div class="secondary" style="margin-top:.1rem;font-size:.83rem;direction:ltr;text-align:right">${o}</div>
        </div>
      </div>
      <div class="patient-meta">
        <span class="badge ${t?.gender==="female"?"badge-red":"badge-blue"}">${m}</span>
        <span class="badge badge-muted">${C}</span>
        ${p?`<span class="badge badge-muted" data-copy-pid="${p}" title="انقر لنسخ رقم المريض" style="cursor:pointer;user-select:none">📋 ${p}</span>`:""}
        ${y?`<span class="badge badge-muted">🌍 ${y}</span>`:""}
      </div>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        <a class="btn btn-primary btn-sm" href="/patients/${n}">
          <i data-lucide="user"></i> عرض
        </a>
        <a class="btn btn-ghost btn-sm" href="/bookings/new">
          <i data-lucide="calendar-plus"></i> حجز
        </a>
        ${I?`<button class="btn btn-danger btn-sm" type="button" data-delete-patient="${n}" data-patient-name="${r}">
          <i data-lucide="trash-2"></i>
        </button>`:""}
      </div>
    `,s.appendChild(l)}),window.lucide?.createIcons?.({attrs:{"stroke-width":1.8}}),x()}}s?.addEventListener("click",async e=>{let t=e.target?.closest("[data-copy-pid]");if(t){let n=t.dataset.copyPid;try{await navigator.clipboard.writeText(n),d("success",`تم نسخ ${n}`)}catch{d("error","فشل النسخ، يرجى المحاولة مرة أخرى")}return}let a=e.target?.closest("[data-delete-patient]");if(a){let n=a.dataset.deletePatient,r=a.dataset.patientName||"هذا المريض";E({title:"حذف المريض؟",body:`سيتم حذف سجل "${r}" نهائياً بما في ذلك جميع بياناته. لا يمكن التراجع عن هذا.`,confirmText:"حذف نهائي",onConfirm:async()=>{let o=await u(`/patients/${encodeURIComponent(n)}`,{method:"DELETE"});if(o){if(!o.ok){let m=await o.json().catch(()=>({}));throw new Error(m?.message||"فشل حذف المريض")}d("warning",`تم حذف سجل "${r}".`,{title:"تم الحذف"}),await c()}}})}});async function c(){s&&w(s,9);try{let e=new URLSearchParams({page:String(i.page),limit:String(i.limit)});i.search.trim()&&e.set("search",i.search.trim());let t=await u(`/patients?${e}`);if(!t)return;let a=await t.json().catch(()=>({}));if(!t.ok)throw new Error(a?.message||"فشل تحميل المرضى");let{list:n,total:r}=R(a);i.total=r||n.length,k&&(k.textContent=`${i.total} مريض (مؤكد)`),j(n),B()}catch(e){d("error",e?.message||"فشل تحميل المرضى",{title:"خطأ"})}}S?.addEventListener("input",v(()=>{i.search=S.value||"",i.page=1,c()},300));f?.addEventListener("click",()=>{i.page=Math.max(1,i.page-1),c()});h?.addEventListener("click",()=>{i.page++,c()});await c();
