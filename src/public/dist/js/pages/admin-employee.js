import{a as D}from"../chunk-QACXIG2G.js";import{a as E}from"../chunk-M5WYQG72.js";import{a as $,b as o}from"../chunk-JC2HHO6E.js";import{a as w}from"../chunk-QTSKM2GQ.js";import{a as S}from"../chunk-HVCWB66H.js";await D({allowRoles:["admin"]});var T=window.location.pathname.split("/").pop(),s=e=>document.querySelector(e),M={confirmed:"مؤكد",pending:"قيد الانتظار",done:"مكتمل",cancelled:"ملغى",retrieval:"مسترد"};function R(e){return e=String(e||"").toLowerCase(),e==="confirmed"?"badge badge-green":e==="pending"?"badge badge-amber":e==="cancelled"?"badge badge-red":e==="done"?"badge badge-blue":e==="retrieval"?"badge badge-green":"badge badge-muted"}var l={},u={},k=[];async function P(){let e=s("[data-emp-bookings-body]");e&&E(e,8,7);let a=s("[data-from]"),m=s("[data-to]"),p=s("[data-status-filter]"),h=a?.value||"",v=m?.value||"",x=p?.value||"",c=new URLSearchParams({limit:1e3});h&&c.set("from",h),v&&c.set("to",v),x&&c.set("status",x);try{let n=await S(`/admin/employees/${encodeURIComponent(T)}?${c}`);if(!n)return;let f=await n.json().catch(()=>({}));if(!n.ok)throw new Error(f?.message||"فشل تحميل بيانات الموظف");let r=f?.data||f;l=r?.employee||{},u=r?.stats||{},k=Array.isArray(r?.bookings)?r.bookings:[];let d=(i,b)=>{let g=s(i);g&&(g.textContent=b)};if(d("[data-emp-name]",l.name||"—"),d("[data-emp-email]",l.email||"—"),d("[data-emp-role]",l.role||"—"),d("[data-emp-total-bookings]",String(u.totalBookings??0)),d("[data-emp-total-revenue]",o(u.totalRevenue??0)),d("[data-emp-total-deposits]",o(u.totalDeposits??0)),e)if(e.innerHTML="",!k.length)e.innerHTML='<tr><td colspan="7"><div class="empty-state"><div class="empty-illus">📋</div><div style="font-weight:700">لا توجد حجوزات</div></div></td></tr>';else for(let i of k){let b=i?._id||i?.id,g=i?.patient||{},y=document.createElement("tr");y.innerHTML=`
            <td>${$(i?.appointmentDate)}</td>
            <td class="tnum">${i?.appointmentTime||"—"}</td>
            <td>${g?.name||"—"}</td>
            <td>${i?.serviceType||"—"}</td>
            <td><span class="${R(i?.status)}">${M[String(i?.status||"").toLowerCase()]||i?.status||"—"}</span></td>
            <td class="tnum">${o(i?.totalPrice??0)}</td>
            <td><a class="btn btn-ghost btn-sm" href="/bookings/${b}"><i data-lucide="eye"></i> عرض</a></td>
          `,e.appendChild(y)}window.lucide?.createIcons?.({attrs:{"stroke-width":1.8}})}catch(n){w("error",n?.message||"فشل تحميل بيانات الموظف",{title:"خطأ"})}}function A(e,a,m){let p=e?.name||"—",h=e?.email||"—",v=e?.role||"—",x=$(e?.createdAt),c=a?.totalBookings||0,n=a?.totalRevenue||0,f=a?.depositsCollected||a?.totalDeposits||0,r=n-f,d={confirmed:"مؤكد",pending:"قيد الانتظار",done:"مكتمل",cancelled:"ملغى",retrieval:"مسترد"},i={paid:"مدفوع",partial:"جزئي",unpaid:"غير مدفوع"},b=t=>(t=String(t||"").toLowerCase(),t==="confirmed"?"#16a34a":t==="pending"?"#d97706":t==="done"?"#2563eb":t==="cancelled"||t==="canceled"?"#dc2626":t==="retrieval"?"#16a34a":"#64748b"),g=t=>(t=String(t||"").toLowerCase(),t==="paid"?"#16a34a":t==="partial"?"#d97706":"#64748b"),y=m.length?m.map(t=>{let z=String(t?.status||"pending").toLowerCase(),L=String(t?.paymentStatus||"unpaid").toLowerCase(),C=Math.max(0,(t?.totalPrice||0)-(t?.deposit||0));return`
          <tr>
            <td>${t?.patient?.name||"—"}</td>
            <td>${t?.patient?.phone||"—"}</td>
            <td>${$(t?.appointmentDate)}</td>
            <td>${t?.appointmentTime||"—"}</td>
            <td>${t?.serviceType||"—"}</td>
            <td><span style="background:${b(z)};color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700">${d[z]||z}</span></td>
            <td><span style="background:${g(L)};color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700">${i[L]||L}</span></td>
            <td style="text-align:left">${o(t?.totalPrice||0)}</td>
            <td style="text-align:left;color:${C>0?"#dc2626":"#16a34a"};font-weight:700">${o(C)}</td>
          </tr>`}).join(""):'<tr><td colspan="9" style="text-align:center;color:#94a3b8;padding:24px">لا يوجد حجوزات</td></tr>',j=p.split(" ").filter(Boolean).slice(0,2).map(t=>t[0]?.toUpperCase()).join("")||"E";return`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${p}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',Arial,sans-serif;background:#fff;color:#0f172a;font-size:13px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .page{width:210mm;min-height:297mm;padding:20mm 16mm;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:2px solid #7c3aed;margin-bottom:20px}
    .header-brand{display:flex;align-items:center;gap:10px}
    .header-logo{width:40px;height:40px;border-radius:10px;background:#7c3aed;display:grid;place-items:center;color:#fff;font-size:18px;font-weight:800}
    .header-name{font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.03em}
    .header-sub{font-size:11px;color:#64748b;margin-top:1px}
    .header-right{text-align:left}
    .header-label{font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
    .header-date{font-size:11px;color:#64748b;margin-top:2px}
    .profile{display:flex;gap:16px;align-items:center;background:#f5f3ff;border-radius:14px;padding:16px 18px;margin-bottom:18px}
    .avatar{width:64px;height:64px;border-radius:16px;display:grid;place-items:center;font-size:22px;font-weight:800;color:#fff;background:#7c3aed;flex-shrink:0}
    .profile-name{font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-0.03em}
    .profile-email{font-size:13px;color:#7c3aed;font-weight:600;margin-top:3px}
    .badge{font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;background:#ede9fe;color:#5b21b6;display:inline-block}
    .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
    .stat-card{background:#f8faff;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;text-align:center}
    .stat-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:4px}
    .stat-value{font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.03em}
    .stat-value.green{color:#16a34a} .stat-value.red{color:#dc2626}
    .section-title{font-size:14px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;margin-bottom:10px;display:flex;align-items:center;gap:8px}
    .section-title::before{content:'';display:inline-block;width:3px;height:16px;background:#7c3aed;border-radius:2px}
    table{width:100%;border-collapse:collapse;font-size:11px}
    thead th{background:#7c3aed;color:#fff;font-weight:700;font-size:10px;padding:8px;text-align:right}
    thead th:first-child{border-radius:0 8px 0 0} thead th:last-child{border-radius:8px 0 0 0}
    tbody td{padding:7px 8px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
    tbody tr:last-child td{border-bottom:none}
    tbody tr:nth-child(even) td{background:#f8faff}
    .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;color:#94a3b8;font-size:10px}
    @media print{body{background:#fff}.page{padding:12mm 12mm}@page{size:A4;margin:0}}
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-brand">
        <div class="header-logo">P</div>
        <div>
          <div class="header-name">Physio Egypt</div>
          <div class="header-sub">تقرير أداء موظف</div>
        </div>
      </div>
      <div class="header-right">
        <div class="header-label">تاريخ الإصدار</div>
        <div class="header-date">${new Date().toLocaleDateString("ar-EG")}</div>
      </div>
    </div>
    <div class="profile">
      <div class="avatar">${j}</div>
      <div style="flex:1">
        <div class="profile-name">${p}</div>
        <div class="profile-email">${h}</div>
        <span class="badge" style="margin-top:6px">${v}</span>
      </div>
      <div style="text-align:left">
        <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.06em">تاريخ الانضمام</div>
        <div style="font-size:13px;font-weight:700;margin-top:2px">${x}</div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">إجمالي الحجوزات</div><div class="stat-value">${c}</div></div>
      <div class="stat-card"><div class="stat-label">إجمالي الإيرادات</div><div class="stat-value green">${o(n)}</div></div>
      <div class="stat-card"><div class="stat-label">إجمالي العربون</div><div class="stat-value green">${o(f)}</div></div>
      <div class="stat-card"><div class="stat-label">إجمالي المتبقي</div><div class="stat-value ${r>0?"red":"green"}">${o(r)}</div></div>
    </div>
    <div class="section-title">سجل الحجوزات (${m.length})</div>
    <table>
      <thead><tr><th>المريض</th><th>الهاتف</th><th>التاريخ</th><th>الوقت</th><th>الخدمة</th><th>الحالة</th><th>الدفع</th><th>الإجمالي</th><th>المتبقي</th></tr></thead>
      <tbody>${y}</tbody>
    </table>
    <div class="footer">
      <span>Physio Egypt · نظام إدارة العيادة</span>
      <span>${p} · ${h}</span>
    </div>
  </div>
</body>
</html>`}function B(){if(!l?.name){w("error","البيانات لم تُحمَّل بعد. انتظر قليلاً.",{title:"خطأ"});return}let e=A(l,u,k),a=window.open("","_blank","width=1000,height=1200,scrollbars=yes");if(!a){w("error","تعذّر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.",{title:"خطأ"});return}a.document.open(),a.document.write(e),a.document.close(),a.document.title=`تقرير - ${l?.name||T}`,a.addEventListener("load",()=>setTimeout(()=>a.print(),400))}s("[data-filter-btn]")?.addEventListener("click",P);s("[data-export-employee-pdf]")?.addEventListener("click",B);await P();
