import{a as b}from"../chunk-M5WYQG72.js";import{a as f,c as h,e as y}from"../chunk-JC2HHO6E.js";import{a as s}from"../chunk-QTSKM2GQ.js";import{a as m}from"../chunk-HVCWB66H.js";var i=document.querySelector("[data-bookings-body]"),v=document.querySelector("[data-bookings-search]"),w=document.querySelector("[data-date]"),k=document.querySelector("[data-page-info]"),l=document.querySelector("[data-prev]"),u=document.querySelector("[data-next]"),S=[...document.querySelectorAll("[data-chip]")],a={page:1,limit:10,status:"all",date:"",search:"",total:0},A={confirmed:"مؤكد",pending:"قيد الانتظار",done:"مكتمل",cancelled:"ملغى",retrieval:"مسترد"};function x(t){return t=String(t||"").toLowerCase(),t==="confirmed"?"badge badge-green":t==="pending"?"badge badge-amber":t==="cancelled"||t==="canceled"?"badge badge-red":t==="done"?"badge badge-blue":t==="retrieval"?"badge badge-dark-blue":"badge badge-muted"}function T(){S.forEach(t=>t.classList.toggle("is-active",t.getAttribute("data-chip")===a.status))}function C(){let t=Math.max(1,Math.ceil((a.total||0)/a.limit));k&&(k.textContent=`الصفحة ${a.page} من ${t} · ${a.total||0} إجمالي`),l&&(l.disabled=a.page<=1),u&&(u.disabled=a.page>=t)}function M(t){let e=t?.data||t||{},n=e?.bookings||e?.results||e?.data?.bookings||e?.data||[],o=e?.total||e?.totalResults||e?.count||e?.resultsCount||e?.pagination?.total||0;return{list:Array.isArray(n)?n:[],total:Number(o)||0}}function B(t){if(i){if(i.innerHTML="",!t.length){i.innerHTML=`
      <tr><td colspan="7">
        <div class="empty-state">
          <div class="empty-illus" aria-hidden="true">📋</div>
          <div style="font-weight:700;font-family:var(--font-display);margin-top:.5rem">لا يوجد حجوزات</div>
          <div class="secondary" style="margin-top:.25rem">جرّب فلتراً أو تاريخاً مختلفاً.</div>
        </div>
      </td></tr>`;return}t.forEach(e=>{let n=e?._id||e?.id,o=e?.patient||e?.patientId||{},c=o?.name||e?.patientName||"—",g=o?.phone||e?.phone||"—",L=e?.appointmentDate||e?.date||e?.createdAt,$=e?.appointmentTime||e?.time||"—",E=e?.serviceType||e?.service||"—",d=e?.status||"—",q=A[String(d).toLowerCase()]||d,p=document.createElement("tr");p.innerHTML=`
      <td>${f(L)}</td>
      <td class="tnum">${$}</td>
      <td><a href="/patients/${o?._id||""}" style="font-weight:600;color:var(--accent)">${c}</a></td>
      <td style="position:relative">
        <button class="btn btn-ghost btn-sm" type="button" data-copy="${String(g)}" dir="ltr">${g}</button>
      </td>
      <td>${E}</td>
      <td><span class="${x(d)}">${q}</span></td>
      <td>
        <div class="actions">
          <a class="btn btn-ghost btn-sm" href="/bookings/${n}">
            <i data-lucide="eye"></i> عرض
          </a>
        </div>
      </td>
    `,i.appendChild(p)}),window.lucide?.createIcons?.({attrs:{"stroke-width":1.8}})}}async function r(){i&&b(i,7,7),T();try{let t=new URLSearchParams({page:String(a.page),limit:String(a.limit)});a.status!=="all"&&t.set("status",a.status),a.date&&t.set("date",a.date),a.search.trim()&&t.set("search",a.search.trim());let e=await m(`/bookings?${t}`);if(!e)return;let n=await e.json().catch(()=>({}));if(!e.ok)throw new Error(n?.message||"فشل تحميل الحجوزات");let{list:o,total:c}=M(n);a.total=c||o.length,B(o),C()}catch(t){s("error",t?.message||"فشل تحميل الحجوزات",{title:"خطأ"})}}document.addEventListener("click",async t=>{let e=t.target?.closest?.("[data-copy]");if(!e)return;let n=e.getAttribute("data-copy")||"";try{await y(n),s("success","تم نسخ رقم الهاتف.",{title:"تم النسخ!"})}catch{s("error","تعذّر النسخ.",{title:"فشل"})}});S.forEach(t=>t.addEventListener("click",()=>{a.status=t.getAttribute("data-chip"),a.page=1,r()}));w?.addEventListener("change",()=>{a.date=w.value||"",a.page=1,r()});v?.addEventListener("input",h(()=>{a.search=v.value||"",a.page=1,r()},300));l?.addEventListener("click",()=>{a.page=Math.max(1,a.page-1),r()});u?.addEventListener("click",()=>{a.page++,r()});await r();
