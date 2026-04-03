import{a as l,b as p,d as b}from"../chunk-JC2HHO6E.js";import{a as w}from"../chunk-QTSKM2GQ.js";import{a as h}from"../chunk-D2GOMEHW.js";var $=window.location.pathname.split("/").pop(),e={big:document.querySelector("[data-big-initials]"),name:document.querySelector("[data-patient-name]"),phoneBtn:document.querySelector("[data-copy-phone]"),waLink:document.querySelector("[data-wa-link]"),gender:document.querySelector("[data-gender]"),age:document.querySelector("[data-age]"),address:document.querySelector("[data-address]"),nationality:document.querySelector("[data-nationality]"),notes:document.querySelector("[data-notes]"),created:document.querySelector("[data-created]"),history:document.querySelector("[data-history]")};function L(t){return String(t||"").split(" ").filter(Boolean).slice(0,2).map(a=>a[0]?.toUpperCase()).join("")}function x(t){return t==="male"?"ذكر":t==="female"?"أنثى":t||"—"}function k(t){return t=String(t||"").toLowerCase(),t==="confirmed"?"badge badge-green":t==="pending"?"badge badge-amber":t==="cancelled"||t==="canceled"?"badge badge-red":t==="done"?"badge badge-blue":"badge badge-muted"}var q={confirmed:"مؤكد",pending:"قيد الانتظار",done:"مكتمل",cancelled:"ملغى"},D={paid:"مدفوع",partial:"جزئي",unpaid:"غير مدفوع"};function B(t){let a=String(t||"").toLowerCase();return a==="paid"?"badge badge-green":a==="partial"?"badge badge-amber":"badge badge-muted"}async function T(){try{let t=await h(`/patients/${encodeURIComponent($)}`);if(!t)return;let a=await t.json().catch(()=>({}));if(!t.ok)throw new Error(a?.message||"فشل تحميل المريض");let i=a?.data?.patient||a?.data||a,m=a?.data?.bookings||[],r=i?.name||"—",o=i?.phone||"—",v=b(r),C=L(r)||"م";e.big&&(e.big.textContent=C,e.big.style.background=v,e.big.style.color="#fff"),e.name&&(e.name.textContent=r),e.gender&&(e.gender.textContent=x(i?.gender)),e.age&&(e.age.textContent=i?.age!=null?`${i.age} سنة`:"—"),e.address&&(e.address.textContent=i?.address||"—"),e.nationality&&(e.nationality.textContent=i?.nationality||"—"),e.notes&&(e.notes.textContent=i?.notes||"—"),e.created&&(e.created.textContent=l(i?.createdAt)),e.phoneBtn&&(e.phoneBtn.textContent=o,e.phoneBtn.addEventListener("click",()=>{if(o&&o!=="—"){let n=o.replace(/\D/g,"");window.location.href=`tel:+${n.startsWith("20")?n:"20"+n}`}}));let g=(i?.whatsappNumber||o||"").replace(/\D/g,"");e.waLink&&g&&(e.waLink.href=`https://wa.me/${g}`,e.waLink.classList.remove("hidden"));let u=Array.isArray(m)?[...m].sort((n,s)=>new Date(s?.appointmentDate||0)-new Date(n?.appointmentDate||0)):[];e.history&&(e.history.innerHTML="",u.length?u.forEach(n=>{let s=n?._id||n?.id,f=String(n?.status||"pending").toLowerCase(),d=String(n?.paymentStatus||"unpaid").toLowerCase(),S=n?.companion?`<span class="badge badge-muted" style="font-size:.75rem">👥 ${n.companion}</span>`:"",y=Math.max(0,(n?.totalPrice||0)-(n?.deposit||0)),c=document.createElement("div");c.className="history-item",c.innerHTML=`
            <div style="display:grid;gap:.3rem;flex:1;min-width:0">
              <div style="font-family:var(--font-display);font-weight:700;font-size:.95rem">
                ${n?.serviceType||"خدمة"}
              </div>
              <div class="history-date">
                ${l(n?.appointmentDate||n?.date)}
                · <span class="tnum">${n?.appointmentTime||""}</span>
              </div>
              <div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.15rem;align-items:center">
                <span class="${k(f)}">
                  ${q[f]||n?.status||"—"}
                </span>
                <span class="${B(d)}">
                  ${D[d]||d}
                </span>
                ${S}
              </div>
              <div style="font-size:.8rem;color:var(--text-muted);margin-top:.1rem">
                إجمالي: <strong>${p(n?.totalPrice||0)}</strong>
                &nbsp;·&nbsp; متبقي:
                <strong style="color:${y>0?"var(--danger)":"var(--success)"}">
                  ${p(y)}
                </strong>
              </div>
            </div>
            <a class="btn btn-ghost btn-sm" href="/bookings/${s}" style="flex-shrink:0">
              <i data-lucide="eye"></i> عرض
            </a>`,e.history.appendChild(c)}):e.history.innerHTML=`
          <div class="empty-state">
            <div class="empty-illus" aria-hidden="true">📋</div>
            <div style="font-weight:700;font-family:var(--font-display);margin-top:.5rem">
              لا يوجد حجوزات
            </div>
            <div class="secondary" style="margin-top:.25rem">
              لا يوجد تاريخ حجوزات لهذا المريض.
            </div>
          </div>`),window.lucide?.createIcons?.({attrs:{"stroke-width":1.8}})}catch(t){w("error",t?.message||"فشل تحميل المريض",{title:"خطأ"})}}await T();
