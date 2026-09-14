// Sunbot Deal Calculator — human-readable output + lossless Sale/Admin round-trip, 14/09/2026
(function(){
'use strict';
const VERSION='SBP1';
const ENGINE_VERSION='2026.09.14';
const $=id=>document.getElementById(id);
const N=(id,d=0)=>Number($(id)?.value||d);
const M=n=>typeof mil==='function'?mil(n):(Number(n||0)/1e6).toLocaleString('vi-VN',{maximumFractionDigits:1})+' triệu';
const MONEY=n=>typeof money==='function'?money(n):new Intl.NumberFormat('vi-VN').format(Math.round(Number(n||0)))+'đ';
const MONTH={9:'Tháng 9',10:'Tháng 10',11:'Tháng 11',12:'Tháng 12',1:'Tháng 1',2:'Tháng 2',3:'Tháng 3',4:'Tháng 4',5:'Tháng 5'};

function toast(msg,bad){
  let t=$('planTransferToast');
  if(!t){t=document.createElement('div');t.id='planTransferToast';t.style.cssText='position:fixed;right:18px;bottom:22px;z-index:9999;max-width:380px;padding:12px 15px;border-radius:13px;background:#17323a;color:white;box-shadow:0 12px 30px #0003;font:12px/1.45 system-ui;opacity:0;transform:translateY(8px);transition:.18s';document.body.appendChild(t)}
  t.style.background=bad?'#991b1b':'#17323a';t.textContent=msg;t.style.opacity='1';t.style.transform='none';clearTimeout(t._h);t._h=setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(8px)'},3000);
}
function activeData(group,attr,fallback){const b=document.querySelector(`${group} .btn.active`);return b&&b.dataset[attr]!==undefined?b.dataset[attr]:fallback;}
function viewName(){if(document.body.classList.contains('school-view'))return'school';if(document.body.classList.contains('sale-view'))return'sale';return'internal';}
function meta(){return{school_name:String($('planSchoolName')?.value||'').trim(),prepared_by:String($('planPreparedBy')?.value||'').trim()};}
function capture(){
  const current=typeof window.SunbotDealCurrent==='function'?window.SunbotDealCurrent():null;
  return {
    schema:VERSION,engine_version:ENGINE_VERSION,created_at:new Date().toISOString(),view:viewName(),meta:meta(),
    inputs:{
      children:N('children'),class_size:N('classSize',20),class_count:String($('classCountInput')?.value||'').trim(),campus_count:N('campusCount',1),
      fee:N('fee'),lessons:N('lessons',4),programs:Number(activeData('#programButtons','programs',1)),start_month:N('startMonth',9),
      service:Number(activeData('#serviceButtons','service',0)),teacher_rate:N('teacherRate'),training_teachers:N('trainingTeacherCount'),assessment_teachers:N('teacherCount'),
      launch:activeData('#launchButtons','launch','new'),investment_mode:activeData('#investmentButtons','mode','own'),capital_share:N('capitalShare',50),
      term:Number(activeData('#termButtons','term',24)),rollout_funding:activeData('#rolloutFundingButtons','rollout','upfront'),extra:activeData('#extraButtons','extra','no'),extra_pct:N('extraPct',10),
      contract_scope:activeData('#contractScopeButtons','scope','same_unit'),other_cost:N('otherCost'),
      program_cost_pct:N('programCostPct',20),training_cost_pct:N('trainingCostPct',50),entry_cost_pct:N('entryCostPct',3),renewal_cost_pct:N('renewalCostPct',2),sales_cost_pct:N('salesCostPct',5),relationship_cost_pct:N('relationshipCostPct',3),ops_cost_pct:N('opsCostPct',5)
    },
    reference:current?{total:current.total,remain:current.remain,program_fee:current.pf,rooms:current.rooms}:null
  };
}
function b64(obj){const bytes=new TextEncoder().encode(JSON.stringify(obj));let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function unb64(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const bin=atob(s),bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes));}
function token(snapshot){return `SUNBOT PLAN · ${VERSION}-${b64(snapshot)}`;}
function readable(forSchool){
  const s=typeof window.SunbotDealCurrent==='function'?window.SunbotDealCurrent():null;if(!s)throw new Error('Máy tính chưa sẵn sàng.');
  const x=capture(),m=x.meta,i=x.inputs,name=m.school_name||'Trường đang xây dựng phương án',by=m.prepared_by||'Chưa ghi';
  if(s.blocked)return [`PHƯƠNG ÁN TRIỂN KHAI SUNBOT – ${name}`,`Người lập/phụ trách: ${by}`,`Trạng thái: ${s.blockedReason}`].join('\n');
  const invest=i.investment_mode==='own'?`Nhà trường đầu tư ${s.rooms} mô-đun tiêu chuẩn, tổng ${M(s.schoolInvest)}.`:i.investment_mode==='provide'?`Sunbot đầu tư ${s.rooms} mô-đun tiêu chuẩn, tổng giá trị ${M(s.roomValue)}; phần vốn được phân bổ trong ${s.tm} tháng.`:`Hai bên cùng đầu tư ${s.rooms} mô-đun; Sunbot góp ${Math.round(s.share*100)}% vốn thiết bị, nhà trường thanh toán ban đầu ${M(s.schoolInvest)}.`;
  const lines=[
    `PHƯƠNG ÁN TRIỂN KHAI SUNBOT – ${name}`,
    `Người lập/phụ trách: ${by}`,
    '',
    `1. Quy mô: ${s.c.toLocaleString('vi-VN')} trẻ; ${s.classes} lớp; ${s.points} điểm triển khai; ${s.rooms} mô-đun tiêu chuẩn.`,
    `2. Thời gian: bắt đầu ${(MONTH[s.start]||'').toLowerCase()}, còn ${s.months} tháng đến hết tháng 5.`,
    `3. Cường độ: ${s.l} tiết/lớp/tháng/chương trình; ${s.p} chương trình; mức thu dự kiến ${MONEY(s.f)}/trẻ/tiết.`,
    `4. Phí chương trình trong năm học này: ${M(s.pf)}.`,
    `5. Phí đồng hành điểm triển khai bổ sung: ${M(s.site)} trong năm học này.`,
    `6. Đào tạo: ${s.trainTeachers} giáo viên, ${M(s.training)}; sát hạch: ${s.assessTeachers} giáo viên × ${s.p} chương trình, ${M(s.assessment)}.`,
    `7. Thiết bị: ${invest}`,
    `8. Thu hồi vốn thiết bị trong năm học này: ${M(s.recovery)}${s.recoveryMonthly>0?`, khoảng ${M(s.recoveryMonthly)}/tháng`:''}.`,
    `9. Tổng nhà trường thanh toán Sunbot trong năm học này: ${M(s.total)}.`,
    `10. Nguồn còn lại dự kiến của nhà trường sau các khoản đang tính: ${M(s.remain)}.`,
    `11. Lịch thanh toán dự kiến:`
  ];
  (s.rows||[]).forEach(r=>lines.push(`   - Kỳ ${r.i}, ${r.label} (${r.n} tháng): ${M(r.total)}.`));
  if(!forSchool)lines.push('',`Phiên bản máy tính: ${ENGINE_VERSION}. Bản nội bộ này có mã khôi phục để Admin/Sale nạp lại đầy đủ các biến đầu vào.`);
  return lines.join('\n');
}
async function copyText(text,msg){try{await navigator.clipboard.writeText(text)}catch(e){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove()}toast(msg);}
function clickData(group,attr,value){const b=[...document.querySelectorAll(`${group} .btn`)].find(x=>String(x.dataset[attr])===String(value));if(b&&!b.disabled)b.click();}
function setInput(id,value,allowBlank){const e=$(id);if(!e)return;if(allowBlank&&value===''){e.value='';e.dispatchEvent(new Event('input',{bubbles:true}));return}if(value===undefined||value===null||value==='')return;e.value=String(value);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));}
function apply(snapshot){
  if(!snapshot||snapshot.schema!==VERSION||!snapshot.inputs)throw new Error('Không nhận diện được dữ liệu phương án Sunbot.');
  const i=snapshot.inputs,m=snapshot.meta||{};
  if($('planSchoolName'))$('planSchoolName').value=m.school_name||'';if($('planPreparedBy'))$('planPreparedBy').value=m.prepared_by||'';
  setInput('children',i.children);setInput('classSize',i.class_size);setInput('classCountInput',i.class_count,true);setInput('campusCount',i.campus_count);setInput('fee',i.fee);setInput('lessons',i.lessons);
  clickData('#programButtons','programs',i.programs);if($('startMonth'))setInput('startMonth',i.start_month);clickData('#serviceButtons','service',i.service);
  setInput('teacherRate',i.teacher_rate);setInput('trainingTeacherCount',i.training_teachers);setInput('teacherCount',i.assessment_teachers);clickData('#launchButtons','launch',i.launch);
  clickData('#investmentButtons','mode',i.investment_mode);setInput('capitalShare',i.capital_share);clickData('#termButtons','term',i.term);clickData('#rolloutFundingButtons','rollout',i.rollout_funding);clickData('#extraButtons','extra',i.extra);setInput('extraPct',i.extra_pct);clickData('#contractScopeButtons','scope',i.contract_scope);
  setInput('otherCost',i.other_cost);setInput('programCostPct',i.program_cost_pct);setInput('trainingCostPct',i.training_cost_pct);setInput('entryCostPct',i.entry_cost_pct);setInput('renewalCostPct',i.renewal_cost_pct);setInput('salesCostPct',i.sales_cost_pct);setInput('relationshipCostPct',i.relationship_cost_pct);setInput('opsCostPct',i.ops_cost_pct);
  const visible=$('childrenInput');if(visible)visible.value=String(i.children||'');
  setTimeout(()=>{if(typeof window.SunbotDealFastRefresh==='function')window.SunbotDealFastRefresh();toast(`Đã nạp phương án${m.school_name?' · '+m.school_name:''}. Có thể chỉnh sửa ngay.`)},30);
}
function extract(text){const re=/SUNBOT PLAN\s*·\s*SBP1-([A-Za-z0-9_-]+)/i,m=text.match(re);if(!m)throw new Error('Đoạn dán chưa có mã khôi phục SUNBOT PLAN. Hãy dùng “Copy gửi nội bộ” từ máy tính.');return unb64(m[1]);}
function modal(){let w=$('planImportModal');if(w){w.hidden=false;$('planImportText').focus();return}w=document.createElement('div');w.id='planImportModal';w.style.cssText='position:fixed;inset:0;z-index:9998;background:#17212b99;display:grid;place-items:center;padding:18px';w.innerHTML=`<div style="width:min(720px,100%);background:white;border-radius:20px;padding:20px;box-shadow:0 24px 70px #0004"><div style="display:flex;justify-content:space-between;gap:12px;align-items:start"><div><b style="font-size:18px">Nhập phương án</b><div style="font-size:12px;color:#667085;margin-top:4px">Dán nguyên đoạn Sale/Admin đã gửi. Máy sẽ tìm mã SUNBOT PLAN và khôi phục các biến đầu vào.</div></div><button id="planImportClose" class="softBtn">Đóng</button></div><textarea id="planImportText" style="width:100%;min-height:260px;margin-top:14px;border:1px solid #d0d5dd;border-radius:14px;padding:12px;font:13px/1.45 system-ui;resize:vertical" placeholder="Dán phương án vào đây…"></textarea><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px"><button id="planImportApply" class="softBtn" style="background:#f97316;color:white;border-color:#f97316">Nạp phương án</button></div></div>`;document.body.appendChild(w);$('planImportClose').onclick=()=>w.hidden=true;$('planImportApply').onclick=()=>{try{const snap=extract($('planImportText').value);apply(snap);w.hidden=true}catch(e){toast(e.message,true)}};$('planImportText').focus();}
function install(){
  const top=document.querySelector('.top');const old=$('copyPlan');if(!top||!old||$('planTransferActions'))return;
  const identity=document.createElement('div');identity.id='planIdentity';identity.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:-6px 0 16px;padding:12px 14px;background:#fff;border:1px solid #fed7aa;border-radius:16px';identity.innerHTML='<label style="font-size:12px;color:#667085">Tên trường<input id="planSchoolName" class="input" placeholder="VD: Mầm non Mai Dịch" style="margin-top:5px"></label><label style="font-size:12px;color:#667085">Người lập/phụ trách<input id="planPreparedBy" class="input" placeholder="VD: Thu" style="margin-top:5px"></label>';top.insertAdjacentElement('afterend',identity);
  const actions=document.createElement('div');actions.id='planTransferActions';actions.style.cssText='display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end';actions.innerHTML='<button class="softBtn" id="importPlanBtn">Nhập phương án</button><button class="softBtn" id="copySchoolBtn">Copy cho nhà trường</button><button class="softBtn" id="copyInternalBtn" style="background:#fff7ed">Copy gửi nội bộ</button>';
  old.replaceWith(actions);
  $('importPlanBtn').onclick=modal;
  $('copySchoolBtn').onclick=()=>{try{copyText(readable(true),'Đã copy bản trình nhà trường — không có mã kỹ thuật.')}catch(e){toast(e.message,true)}};
  $('copyInternalBtn').onclick=()=>{try{const snap=capture();copyText(readable(false)+'\n\n'+token(snap),'Đã copy bản nội bộ — có thể nạp lại nguyên trạng.')}catch(e){toast(e.message,true)}};
  const style=document.createElement('style');style.textContent='@media(max-width:900px){#planIdentity{grid-template-columns:1fr!important}.top{flex-wrap:wrap!important}#planTransferActions{width:100%;justify-content:flex-start!important}}';document.head.appendChild(style);
}
install();
})();