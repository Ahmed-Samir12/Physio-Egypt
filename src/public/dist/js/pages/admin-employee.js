import{a as E}from"../chunk-WAWAZ7XK.js";import{a as D}from"../chunk-M5WYQG72.js";import{a as w,b as m}from"../chunk-JC2HHO6E.js";import{a as y}from"../chunk-QTSKM2GQ.js";import{a as S}from"../chunk-HVCWB66H.js";await E({allowRoles:["admin","mini-admin"]});var C=window.location.pathname.split("/").pop(),l=e=>document.querySelector(e),j={confirmed:"مؤكد",pending:"قيد الانتظار",done:"مكتمل",cancelled:"ملغى",retrieval:"مسترد"};function M(e){return e=String(e||"").toLowerCase(),e==="confirmed"?"badge badge-green":e==="pending"?"badge badge-amber":e==="cancelled"?"badge badge-red":e==="done"?"badge badge-blue":e==="retrieval"?"badge badge-green":"badge badge-muted"}var p={},x={},$=[],T={};async function P(){let e=l("[data-emp-bookings-body]");e&&D(e,8,7);let i=l("[data-from]"),g=l("[data-to]"),a=l("[data-status-filter]"),r=i?.value||"",h=g?.value||"",v=a?.value||"",c=new URLSearchParams({limit:1e3});r&&c.set("from",r),h&&c.set("to",h),v&&c.set("status",v);try{let d=await S(`/admin/employees/${encodeURIComponent(C)}?${c}`);if(!d)return;let b=await d.json().catch(()=>({}));if(!d.ok)throw new Error(b?.message||"فشل تحميل بيانات الموظف");let s=b?.data||b;p=s?.employee||{},x=s?.stats||{},$=Array.isArray(s?.bookings)?s.bookings:[],T=s?.filters||{};let n=(o,u)=>{let f=l(o);f&&(f.textContent=u)};if(n("[data-emp-name]",p.name||"—"),n("[data-emp-email]",p.email||"—"),n("[data-emp-role]",p.role||"—"),n("[data-emp-total-bookings]",String(x.totalBookings??0)),n("[data-emp-total-revenue]",m(x.totalRevenue??0)),n("[data-emp-total-deposits]",m(x.totalDeposits??0)),e)if(e.innerHTML="",!$.length)e.innerHTML='<tr><td colspan="7"><div class="empty-state"><div class="empty-illus">📋</div><div style="font-weight:700">لا توجد حجوزات</div></div></td></tr>';else for(let o of $){let u=o?._id||o?.id,f=o?.patient||{},t=document.createElement("tr");t.innerHTML=`
            <td>${w(o?.appointmentDate)}</td>
            <td class="tnum">${o?.appointmentTime||"—"}</td>
            <td>${f?.name||"—"}</td>
            <td>${o?.serviceType||"—"}</td>
            <td><span class="${M(o?.status)}">${j[String(o?.status||"").toLowerCase()]||o?.status||"—"}</span></td>
            <td class="tnum">${m(o?.totalPrice??0)}</td>
            <td><a class="btn btn-ghost btn-sm" href="/bookings/${u}"><i data-lucide="eye"></i> عرض</a></td>
          `,e.appendChild(t)}window.lucide?.createIcons?.({attrs:{"stroke-width":1.8}})}catch(d){y("error",d?.message||"فشل تحميل بيانات الموظف",{title:"خطأ"})}}function A(e,i,g,a={}){let r=e?.name||"—",h=e?.email||"—",v=e?.role||"—",c=w(e?.createdAt),d=i?.totalBookings||0,b={confirmed:"مؤكد",pending:"قيد الانتظار",done:"مكتمل",cancelled:"ملغى",retrieval:"مسترد"},s={paid:"مدفوع",partial:"جزئي",unpaid:"غير مدفوع"},n=t=>(t=String(t||"").toLowerCase(),t==="confirmed"?"#16a34a":t==="pending"?"#d97706":t==="done"?"#2563eb":t==="cancelled"||t==="canceled"?"#dc2626":t==="retrieval"?"#16a34a":"#64748b"),o=t=>(t=String(t||"").toLowerCase(),t==="paid"?"#16a34a":t==="partial"?"#d97706":"#64748b"),u=g.length?g.map(t=>{let k=String(t?.status||"pending").toLowerCase(),z=String(t?.paymentStatus||"unpaid").toLowerCase(),L=Math.max(0,(t?.totalPrice||0)-(t?.deposit||0));return`
          <tr>
            <td>${t?.patient?.name||"—"}</td>
            <td>${t?.patient?.phone||"—"}</td>
            <td>${w(t?.appointmentDate)}</td>
            <td>${t?.appointmentTime||"—"}</td>
            <td>${t?.serviceType||"—"}</td>
            <td><span style="background:${n(k)};color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700">${b[k]||k}</span></td>
            <td><span style="background:${o(z)};color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700">${s[z]||z}</span></td>
            <td style="text-align:left">${m(t?.totalPrice||0)}</td>
            <td style="text-align:left;color:${L>0?"#dc2626":"#16a34a"};font-weight:700">${m(L)}</td>
          </tr>`}).join(""):'<tr><td colspan="9" style="text-align:center;color:#94a3b8;padding:24px">لا يوجد حجوزات</td></tr>',f=r.split(" ").filter(Boolean).slice(0,2).map(t=>t[0]?.toUpperCase()).join("")||"E";return`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${r}</title>
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
    .stats-grid{margin-bottom:20px}
    .stat-card{background:#f8faff;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;text-align:center}
    .stat-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:4px}
    .stat-value{font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.03em}
    .stat-value.green{color:#16a34a} .stat-value.red{color:#dc2626}
    .section-title{font-size:14px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;margin-bottom:10px;display:flex;align-items:center;gap:8px}
    .section-title::before{content:'';display:inline-block;width:3px;height:16px;background:#7c3aed;border-radius:2px}
    table{width:100%;border-collapse:collapse;font-size:11px}
    thead th{background:#7c3aed;color:#fff;font-weight:700;font-size:10px;padding:8px;text-align:right}
    thead th:first-child{border-radius:0 8px 0 0} thead th:last-child{border-radius:8px 0 0 0}
    tbody td{padding:7px 7px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
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
      <div class="header-right" style="text-align:left">
        <div class="header-label">تاريخ الإصدار</div>
        <div class="header-date">${new Date().toLocaleDateString("ar-EG")}</div>
        ${a.from||a.to?`<div class="header-label" style="margin-top:6px">الفترة</div>
               <div class="header-date">${a.from?new Date(a.from).toLocaleDateString("ar-EG"):"—"} إلى ${a.to?new Date(a.to).toLocaleDateString("ar-EG"):"—"}</div>`:'<div class="header-date" style="margin-top:4px;color:#94a3b8">جميع الفترات</div>'}
      </div>
    </div>
    <div class="profile">
      <div class="avatar">${f}</div>
      <div style="flex:1">
        <div class="profile-name">${r}</div>
        <div class="profile-email">${h}</div>
        <span class="badge" style="margin-top:6px">${v}</span>
      </div>
      <div style="text-align:left">
        <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.06em">تاريخ الانضمام</div>
        <div style="font-size:13px;font-weight:700;margin-top:2px">${c}</div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stats-grid" style="grid-template-columns:repeat(1,1fr);max-width:200px">
      <div class="stat-card"><div class="stat-label">إجمالي الحجوزات</div><div class="stat-value">${d}</div></div>
    </div>
    <div class="section-title">سجل الحجوزات (${g.length})${a.from||a.to?` — ${a.from?new Date(a.from).toLocaleDateString("ar-EG"):""} ${a.to?"إلى "+new Date(a.to).toLocaleDateString("ar-EG"):""}`:""}</div>
    <table>
      <thead><tr><th>المريض</th><th>الهاتف</th><th>التاريخ</th><th>الوقت</th><th>الخدمة</th><th>الحالة</th><th>الدفع</th><th>الإجمالي</th><th>المتبقي</th></tr></thead>
      <tbody>${u}</tbody>
    </table>
    <div class="footer">
      <span>Physio Egypt · نظام إدارة العيادة</span>
      <span>${r} · ${h}</span>
    </div>
  </div>
</body>
</html>`}function _(){if(!p?.name){y("error","البيانات لم تُحمَّل بعد. انتظر قليلاً.",{title:"خطأ"});return}let e=A(p,x,$,T),i=window.open("","_blank","width=1000,height=1200,scrollbars=yes");if(!i){y("error","تعذّر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.",{title:"خطأ"});return}i.document.open(),i.document.write(e),i.document.close(),i.document.title=`تقرير - ${p?.name||C}`,i.addEventListener("load",()=>setTimeout(()=>i.print(),400))}l("[data-filter-btn]")?.addEventListener("click",P);l("[data-export-employee-pdf]")?.addEventListener("click",_);await P();
