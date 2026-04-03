import{b as h}from"../chunk-M5WYQG72.js";import{c as f,d as u}from"../chunk-JC2HHO6E.js";import{a as g}from"../chunk-QTSKM2GQ.js";import{a as p}from"../chunk-D2GOMEHW.js";function v(){let e=document.querySelectorAll(".reveal");if(!e.length)return;if(!("IntersectionObserver"in window)){e.forEach(n=>n.classList.add("is-in"));return}let t=new IntersectionObserver(n=>{n.forEach(i=>{i.isIntersecting&&(i.target.classList.add("is-in"),t.unobserve(i.target))})},{threshold:.12});e.forEach((n,i)=>{n.style.getPropertyValue("--d")||n.style.setProperty("--d",`${Math.min(360,i*45)}ms`),t.observe(n)})}var r=document.querySelector("[data-patient-grid]"),y=document.querySelector("[data-patients-search]"),b=document.querySelector("[data-total]"),w=document.querySelector("[data-page-info]"),d=document.querySelector("[data-prev]"),c=document.querySelector("[data-next]"),a={page:1,limit:12,search:"",total:0};function q(e){let t=e?.data||e||{},n=t?.patients||t?.results||t?.data||[],i=t?.total||t?.totalResults||t?.count||t?.pagination?.total||0;return{list:Array.isArray(n)?n:[],total:Number(i)||0}}function M(e){return String(e||"").split(" ").filter(Boolean).slice(0,2).map(t=>t[0]?.toUpperCase()).join("")}function k(e){let t=String(e||"").toLowerCase();return t==="male"?"ذكر":t==="female"?"أنثى":e||"—"}function C(){let e=Math.max(1,Math.ceil((a.total||0)/a.limit));w&&(w.textContent=`الصفحة ${a.page} من ${e}`),d&&(d.disabled=a.page<=1),c&&(c.disabled=a.page>=e)}function I(e){if(r){if(r.innerHTML="",!e.length){r.innerHTML=`
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-illus" aria-hidden="true">👥</div>
        <div style="font-weight:700;font-family:var(--font-display);margin-top:.5rem">لا يوجد مرضى</div>
        <div class="secondary" style="margin-top:.25rem">جرّب بحثاً مختلفاً.</div>
      </div>`;return}e.forEach((t,n)=>{let i=t?._id||t?.id,s=t?.name||"—",$=t?.phone||"—",S=k(t?.gender),x=t?.age!=null?`${t.age} سنة`:"—",E=M(s)||"م",L=u(s),m=t?.nationality||"",o=document.createElement("div");o.className="card card-pad patient-card reveal",o.style.setProperty("--d",`${Math.min(320,n*35)}ms`),o.innerHTML=`
      <div class="patient-head">
        <div class="initials" style="background:${L}">${E}</div>
        <div style="min-width:0;flex:1">
          <div style="font-family:var(--font-display);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s}</div>
          <div class="secondary" style="margin-top:.1rem;font-size:.83rem;direction:ltr;text-align:right">${$}</div>
        </div>
      </div>
      <div class="patient-meta">
        <span class="badge ${t?.gender==="female"?"badge-red":"badge-blue"}">${S}</span>
        <span class="badge badge-muted">${x}</span>
        ${t?.patientId?`<span class="badge badge-muted">${t.patientId}</span>`:""}
        ${m?`<span class="badge badge-muted">🌍 ${m}</span>`:""}
      </div>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        <a class="btn btn-primary btn-sm" href="/patients/${i}">
          <i data-lucide="user"></i> عرض
        </a>
        <a class="btn btn-ghost btn-sm" href="/bookings/new">
          <i data-lucide="calendar-plus"></i> حجز
        </a>
      </div>
    `,r.appendChild(o)}),window.lucide?.createIcons?.({attrs:{"stroke-width":1.8}}),v()}}async function l(){r&&h(r,9);try{let e=new URLSearchParams({page:String(a.page),limit:String(a.limit)});a.search.trim()&&e.set("search",a.search.trim());let t=await p(`/patients?${e}`);if(!t)return;let n=await t.json().catch(()=>({}));if(!t.ok)throw new Error(n?.message||"فشل تحميل المرضى");let{list:i,total:s}=q(n);a.total=s||i.length,b&&(b.textContent=`${a.total} مريض`),I(i),C()}catch(e){g("error",e?.message||"فشل تحميل المرضى",{title:"خطأ"})}}y?.addEventListener("input",f(()=>{a.search=y.value||"",a.page=1,l()},300));d?.addEventListener("click",()=>{a.page=Math.max(1,a.page-1),l()});c?.addEventListener("click",()=>{a.page++,l()});await l();
