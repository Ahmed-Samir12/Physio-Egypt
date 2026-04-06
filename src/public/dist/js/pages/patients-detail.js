import{a as E}from"../chunk-BDEPFTOE.js";import{a as q}from"../chunk-QACXIG2G.js";import{a as m,b as h,d as I}from"../chunk-JC2HHO6E.js";import{a as c}from"../chunk-QTSKM2GQ.js";import{a as C}from"../chunk-HVCWB66H.js";var B=window.location.pathname.split("/").pop(),t={big:document.querySelector("[data-big-initials]"),name:document.querySelector("[data-patient-name]"),phoneBtn:document.querySelector("[data-copy-phone]"),waLink:document.querySelector("[data-wa-link]"),gender:document.querySelector("[data-gender]"),age:document.querySelector("[data-age]"),address:document.querySelector("[data-address]"),nationality:document.querySelector("[data-nationality]"),notes:document.querySelector("[data-notes]"),patientId:document.querySelector("[data-patient-id]"),created:document.querySelector("[data-created]"),history:document.querySelector("[data-history]"),downloadBtn:document.querySelector("[data-download-card]")};function j(e){return String(e||"").split(" ").filter(Boolean).slice(0,2).map(o=>o[0]?.toUpperCase()).join("")}function M(e){return e==="male"?"ذكر":e==="female"?"أنثى":e||"—"}function A(e){return e=String(e||"").toLowerCase(),e==="confirmed"?"badge badge-green":e==="pending"?"badge badge-amber":e==="cancelled"||e==="canceled"?"badge badge-red":e==="done"?"badge badge-blue":"badge badge-muted"}var H={confirmed:"مؤكد",pending:"قيد الانتظار",done:"مكتمل",cancelled:"ملغى"},F={paid:"مدفوع",partial:"جزئي",unpaid:"غير مدفوع"};function R(e){let o=String(e||"").toLowerCase();return o==="paid"?"badge badge-green":o==="partial"?"badge badge-amber":"badge badge-muted"}async function U(){try{let e=await C(`/patients/${encodeURIComponent(B)}`);if(!e)return;let o=await e.json().catch(()=>({}));if(!e.ok)throw new Error(o?.message||"فشل تحميل المريض");let i=o?.data?.patient||o?.data||o,r=o?.data?.bookings||[],s=i?.name||"—",d=i?.phone||"—",u=I(s),v=j(s)||"م";t.big&&(t.big.textContent=v,t.big.style.background=u,t.big.style.color="#fff"),t.name&&(t.name.textContent=s),t.gender&&(t.gender.textContent=M(i?.gender)),t.age&&(t.age.textContent=i?.age!=null?`${i.age} سنة`:"—"),t.address&&(t.address.textContent=i?.address||"—"),t.nationality&&(t.nationality.textContent=i?.nationality||"—"),t.notes&&(t.notes.textContent=i?.notes||"—"),t.created&&(t.created.textContent=m(i?.createdAt)),t.patientId&&(i?.patientId?(t.patientId.textContent=`📋 ${i.patientId}`,t.patientId.classList.remove("hidden"),t.patientId.style.cursor="pointer",t.patientId.title="انقر لنسخ رقم المريض",t.patientId.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(i.patientId),c("success",`تم نسخ ${i.patientId}`)}catch{c("error","فشل النسخ")}})):(t.patientId.textContent="—",t.patientId.classList.add("hidden"))),t.phoneBtn&&(t.phoneBtn.textContent=d,t.phoneBtn.addEventListener("click",()=>{if(d&&d!=="—"){let n=d.replace(/\D/g,"");window.location.href=`tel:+${n.startsWith("20")?n:"20"+n}`}}));let x=(i?.whatsappNumber||d||"").replace(/\D/g,"");t.waLink&&x&&(t.waLink.href=`https://wa.me/${x}`,t.waLink.classList.remove("hidden"));let l=Array.isArray(r)?[...r].sort((n,p)=>new Date(p?.appointmentDate||0)-new Date(n?.appointmentDate||0)):[];t.history&&(t.history.innerHTML="",l.length?l.forEach(n=>{let p=n?._id||n?.id,y=String(n?.status||"pending").toLowerCase(),f=String(n?.paymentStatus||"unpaid").toLowerCase(),w=n?.companion?`<span class="badge badge-muted" style="font-size:.75rem">👥 ${n.companion}</span>`:"",b=Math.max(0,(n?.totalPrice||0)-(n?.deposit||0)),g=document.createElement("div");g.className="history-item",g.innerHTML=`
            <div style="display:grid;gap:.3rem;flex:1;min-width:0">
              <div style="font-family:var(--font-display);font-weight:700;font-size:.95rem">
                ${n?.serviceType||"خدمة"}
              </div>
              <div class="history-date">
                ${m(n?.appointmentDate||n?.date)}
                · <span class="tnum">${n?.appointmentTime||""}</span>
              </div>
              <div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.15rem;align-items:center">
                <span class="${A(y)}">
                  ${H[y]||n?.status||"—"}
                </span>
                <span class="${R(f)}">
                  ${F[f]||f}
                </span>
                ${w}
              </div>
              <div style="font-size:.8rem;color:var(--text-muted);margin-top:.1rem">
                إجمالي: <strong>${h(n?.totalPrice||0)}</strong>
                &nbsp;·&nbsp; متبقي:
                <strong style="color:${b>0?"var(--danger)":"var(--success)"}">
                  ${h(b)}
                </strong>
              </div>
            </div>
            <a class="btn btn-ghost btn-sm" href="/bookings/${p}" style="flex-shrink:0">
              <i data-lucide="eye"></i> عرض
            </a>`,t.history.appendChild(g)}):t.history.innerHTML=`
          <div class="empty-state">
            <div class="empty-illus" aria-hidden="true">📋</div>
            <div style="font-weight:700;font-family:var(--font-display);margin-top:.5rem">
              لا يوجد حجوزات
            </div>
            <div class="secondary" style="margin-top:.25rem">
              لا يوجد تاريخ حجوزات لهذا المريض.
            </div>
          </div>`),window.lucide?.createIcons?.({attrs:{"stroke-width":1.8}}),t.downloadBtn&&(t.downloadBtn.disabled=!1,t.downloadBtn.addEventListener("click",()=>O(i,r,u)))}catch(e){c("error",e?.message||"فشل تحميل المريض",{title:"خطأ"})}}function N(e,o,i){let r=e?.name||"—",s=e?.phone||"—",d=e?.patientId||"—",u=e?.age!=null?`${e.age} سنة`:"—",v=e?.gender==="male"?"ذكر":e?.gender==="female"?"أنثى":"—",x=e?.address||"—",l=e?.nationality||"—",n=e?.notes||"—",p=e?.complaint||"—",y=m(e?.createdAt),f=r.split(" ").filter(Boolean).slice(0,2).map(a=>a[0]?.toUpperCase()).join("")||"م",w={confirmed:"مؤكد",pending:"قيد الانتظار",done:"مكتمل",cancelled:"ملغى",retrieval:"مسترد"},b={paid:"مدفوع",partial:"جزئي",unpaid:"غير مدفوع"},g=a=>(a=String(a||"").toLowerCase(),a==="confirmed"?"#16a34a":a==="pending"?"#d97706":a==="done"?"#2563eb":a==="cancelled"||a==="canceled"?"#dc2626":a==="retrieval"?"#16a34a":"#64748b"),T=a=>(a=String(a||"").toLowerCase(),a==="paid"?"#16a34a":a==="partial"?"#d97706":"#64748b"),P=o.length?o.map(a=>{let $=String(a?.status||"pending").toLowerCase(),k=String(a?.paymentStatus||"unpaid").toLowerCase(),z=Math.max(0,(a?.totalPrice||0)-(a?.deposit||0));return`
          <tr>
            <td>${m(a?.appointmentDate||a?.date)}</td>
            <td>${a?.appointmentTime||"—"}</td>
            <td>${a?.serviceType||"—"}</td>
            <td>
              <span style="background:${g($)};color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700">
                ${w[$]||$}
              </span>
            </td>
            <td>
              <span style="background:${T(k)};color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700">
                ${b[k]||k}
              </span>
            </td>
            <td style="text-align:left">${h(a?.totalPrice||0)}</td>
            <td style="text-align:left;color:${z>0?"#dc2626":"#16a34a"};font-weight:700">
              ${h(z)}
            </td>
          </tr>`}).join(""):'<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:24px">لا يوجد تاريخ حجوزات</td></tr>';return`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${d}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', Arial, sans-serif;
      background: #fff;
      color: #0f172a;
      font-size: 13px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm 16mm;
      margin: 0 auto;
    }

    /* ── Header ─────────────── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 14px;
      border-bottom: 2px solid #0ea5e9;
      margin-bottom: 20px;
    }
    .header-brand { display: flex; align-items: center; gap: 10px; }
    .header-logo {
      width: 40px; height: 40px; border-radius: 10px;
      background: #0ea5e9; display: grid; place-items: center;
      color: #fff; font-size: 18px; font-weight: 800;
    }
    .header-name  { font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; }
    .header-sub   { font-size: 11px; color: #64748b; margin-top: 1px; }
    .header-right { text-align: left; }
    .header-pid   {
      font-size: 22px; font-weight: 800; color: #0ea5e9;
      letter-spacing: -0.04em; font-variant-numeric: tabular-nums;
    }
    .header-date  { font-size: 11px; color: #64748b; margin-top: 2px; }

    /* ── Patient profile ─────── */
    .profile {
      display: flex;
      gap: 16px;
      align-items: center;
      background: #f0f7ff;
      border-radius: 14px;
      padding: 16px 18px;
      margin-bottom: 18px;
    }
    .avatar {
      width: 64px; height: 64px; border-radius: 16px;
      display: grid; place-items: center;
      font-size: 22px; font-weight: 800; color: #fff;
      flex-shrink: 0;
    }
    .profile-name  { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; }
    .profile-phone { font-size: 13px; color: #0ea5e9; font-weight: 600; margin-top: 3px; direction: ltr; text-align: right; }
    .badges { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
    .badge {
      font-size: 11px; font-weight: 700; padding: 2px 10px;
      border-radius: 20px; background: #e0f2fe; color: #0369a1;
    }

    /* ── Info grid ───────────── */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .info-card {
      background: #f8faff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
    }
    .info-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #94a3b8; margin-bottom: 3px;
    }
    .info-value { font-size: 13px; font-weight: 600; color: #0f172a; }

    /* ── Bookings table ──────── */
    .section-title {
      font-size: 14px; font-weight: 800; color: #0f172a;
      letter-spacing: -0.02em; margin-bottom: 10px;
      display: flex; align-items: center; gap: 8px;
    }
    .section-title::before {
      content: '';
      display: inline-block;
      width: 3px; height: 16px;
      background: #0ea5e9;
      border-radius: 2px;
    }
    table {
      width: 100%; border-collapse: collapse; font-size: 12px;
    }
    thead th {
      background: #0ea5e9; color: #fff;
      font-weight: 700; font-size: 11px;
      padding: 8px 10px; text-align: right;
    }
    thead th:first-child { border-radius: 0 8px 0 0; }
    thead th:last-child  { border-radius: 8px 0 0 0; }
    tbody td {
      padding: 8px 10px; border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:nth-child(even) td { background: #f8faff; }

    /* ── Footer ─────────────── */
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #94a3b8;
      font-size: 10px;
    }

    @media print {
      body { background: #fff; }
      .page { padding: 12mm 12mm; }
      @page { size: A4; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- Header -->
    <div class="header">
      <div class="header-brand">
        <div class="header-logo">P</div>
        <div>
          <div class="header-name">Physio Egypt</div>
          <div class="header-sub">Home Physio Services</div>
        </div>
      </div>
      <div class="header-right">
        <div class="header-pid">${d}</div>
        <div class="header-date">تاريخ الإصدار: ${new Date().toLocaleDateString("ar-EG")}</div>
      </div>
    </div>

    <!-- Patient profile -->
    <div class="profile">
      <div class="avatar" style="background:${i}">${f}</div>
      <div style="flex:1">
        <div class="profile-name">${r}</div>
        <div class="profile-phone">${s}</div>
        <div class="badges">
          <span class="badge">${v}</span>
          <span class="badge">${u}</span>
          ${l&&l!=="—"?`<span class="badge">${l}</span>`:""}
        </div>
      </div>
      <div style="text-align:left">
        <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.06em">تاريخ التسجيل</div>
        <div style="font-size:13px;font-weight:700;margin-top:2px">${y}</div>
      </div>
    </div>

    <!-- Info grid -->
    <div class="info-grid">
      <div class="info-card">
        <div class="info-label">العنوان</div>
        <div class="info-value">${x}</div>
      </div>
      <div class="info-card">
        <div class="info-label">الشكوى</div>
        <div class="info-value">${p}</div>
      </div>
      <div class="info-card">
        <div class="info-label">ملاحظات</div>
        <div class="info-value">${n}</div>
      </div>
    </div>

    <!-- Booking history -->
    <div class="section-title">تاريخ الحجوزات (${o.length})</div>
    <table>
      <thead>
        <tr>
          <th>التاريخ</th>
          <th>الوقت</th>
          <th>الخدمة</th>
          <th>الحالة</th>
          <th>الدفع</th>
          <th>الإجمالي</th>
          <th>المتبقي</th>
        </tr>
      </thead>
      <tbody>${P}</tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
      <span>Physio Egypt · نظام إدارة العيادة</span>
      <span>${d} · ${r}</span>
    </div>

  </div>
</body>
</html>`}function O(e,o,i){let r=e?.patientId||"patient-card",s=N(e,o,i),d=window.open("","_blank","width=900,height=1100,scrollbars=yes");if(!d){c("error","تعذّر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.",{title:"خطأ"});return}d.document.open(),d.document.write(s),d.document.close(),d.document.title=r,d.addEventListener("load",()=>{setTimeout(()=>d.print(),400)})}await U();var L=await q(),D=L?.data?.user?.role||L?.user?.role||L?.role,S=document.querySelector("[data-delete-patient-btn]");S&&(D==="admin"||D==="mini-admin")&&(S.classList.remove("hidden"),S.addEventListener("click",()=>{let e=document.querySelector("[data-patient-name]")?.textContent||"هذا المريض";E({title:"حذف المريض؟",body:`سيتم حذف سجل "${e}" نهائياً بما في ذلك جميع بياناته. لا يمكن التراجع عن هذا.`,confirmText:"حذف نهائي",onConfirm:async()=>{let o=await C(`/patients/${encodeURIComponent(B)}`,{method:"DELETE"});if(o){if(!o.ok){let i=await o.json().catch(()=>({}));throw new Error(i?.message||"فشل حذف المريض")}c("warning","تم حذف سجل المريض.",{title:"تم الحذف"}),setTimeout(()=>window.location.href="/patients",1200)}}})}));
