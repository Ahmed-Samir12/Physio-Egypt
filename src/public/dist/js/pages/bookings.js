import{a as k}from"../chunk-M5WYQG72.js";import{a as y,c as v,e as b}from"../chunk-JC2HHO6E.js";import{a as s}from"../chunk-QTSKM2GQ.js";import{a as h}from"../chunk-HVCWB66H.js";var i=document.querySelector("[data-bookings-body]"),S=document.querySelector("[data-bookings-search]"),c=document.querySelector("[data-date-from]"),d=document.querySelector("[data-date-to]"),w=document.querySelector("[data-date-search]"),x=document.querySelector("[data-date-clear]"),E=document.querySelector("[data-page-info]"),m=document.querySelector("[data-prev]"),g=document.querySelector("[data-next]"),L=[...document.querySelectorAll("[data-chip]")],a={page:1,limit:10,status:"all",from:"",to:"",search:"",total:0},C={confirmed:"مؤكد",pending:"قيد الانتظار",done:"مكتمل",cancelled:"ملغى",retrieval:"مسترد"};function M(t){return t=String(t||"").toLowerCase(),t==="confirmed"?"badge badge-green":t==="pending"?"badge badge-amber":t==="cancelled"||t==="canceled"?"badge badge-red":t==="done"?"badge badge-blue":t==="retrieval"?"badge badge-dark-blue":"badge badge-muted"}function B(){L.forEach(t=>t.classList.toggle("is-active",t.getAttribute("data-chip")===a.status))}function F(){let t=Math.max(1,Math.ceil((a.total||0)/a.limit));E&&(E.textContent=`الصفحة ${a.page} من ${t} · ${a.total||0} إجمالي`),m&&(m.disabled=a.page<=1),g&&(g.disabled=a.page>=t)}function H(t){let e=t?.data||t||{},n=e?.bookings||e?.results||e?.data?.bookings||e?.data||[],o=e?.total||e?.totalResults||e?.count||e?.resultsCount||e?.pagination?.total||0;return{list:Array.isArray(n)?n:[],total:Number(o)||0}}function I(t){if(i){if(i.innerHTML="",!t.length){i.innerHTML=`
      <tr><td colspan="7">
        <div class="empty-state">
          <div class="empty-illus" aria-hidden="true">📋</div>
          <div style="font-weight:700;font-family:var(--font-display);margin-top:.5rem">لا يوجد حجوزات</div>
          <div class="secondary" style="margin-top:.25rem">جرّب فلتراً أو تاريخاً مختلفاً.</div>
        </div>
      </td></tr>`;return}t.forEach(e=>{let n=e?._id||e?.id,o=e?.patient||e?.patientId||{},l=o?.name||e?.patientName||"—",p=o?.phone||e?.phone||"—",$=e?.appointmentDate||e?.date||e?.createdAt,q=e?.appointmentTime||e?.time||"—",A=e?.serviceType||e?.service||"—",u=e?.status||"—",T=C[String(u).toLowerCase()]||u,f=document.createElement("tr");f.innerHTML=`
      <td>${y($)}</td>
      <td class="tnum">${q}</td>
      <td><a href="/patients/${o?._id||""}" style="font-weight:600;color:var(--accent)">${l}</a></td>
      <td style="position:relative">
        <button class="btn btn-ghost btn-sm" type="button" data-copy="${String(p)}" dir="ltr">${p}</button>
      </td>
      <td>${A}</td>
      <td><span class="${M(u)}">${T}</span></td>
      <td>
        <div class="actions">
          <a class="btn btn-ghost btn-sm" href="/bookings/${n}">
            <i data-lucide="eye"></i> عرض
          </a>
        </div>
      </td>
    `,i.appendChild(f)}),window.lucide?.createIcons?.({attrs:{"stroke-width":1.8}})}}async function r(){i&&k(i,7,7),B();try{let t=new URLSearchParams({page:String(a.page),limit:String(a.limit)});a.status!=="all"&&t.set("status",a.status),a.from&&t.set("from",a.from),a.to&&t.set("to",a.to),a.search.trim()&&t.set("search",a.search.trim());let e=await h(`/bookings?${t}`);if(!e)return;let n=await e.json().catch(()=>({}));if(!e.ok)throw new Error(n?.message||"فشل تحميل الحجوزات");let{list:o,total:l}=H(n);a.total=l||o.length,I(o),F()}catch(t){s("error",t?.message||"فشل تحميل الحجوزات",{title:"خطأ"})}}document.addEventListener("click",async t=>{let e=t.target?.closest?.("[data-copy]");if(!e)return;let n=e.getAttribute("data-copy")||"";try{await b(n),s("success","تم نسخ رقم الهاتف.",{title:"تم النسخ!"})}catch{s("error","تعذّر النسخ.",{title:"فشل"})}});L.forEach(t=>t.addEventListener("click",()=>{a.status=t.getAttribute("data-chip"),a.page=1,r()}));w?.addEventListener("click",()=>{a.from=c?.value||"",a.to=d?.value||"",a.page=1,r()});x?.addEventListener("click",()=>{c&&(c.value=""),d&&(d.value=""),a.from="",a.to="",a.page=1,r()});[c,d].forEach(t=>t?.addEventListener("keydown",e=>{e.key==="Enter"&&w?.click()}));S?.addEventListener("input",v(()=>{a.search=S.value||"",a.page=1,r()},300));m?.addEventListener("click",()=>{a.page=Math.max(1,a.page-1),r()});g?.addEventListener("click",()=>{a.page++,r()});await r();
