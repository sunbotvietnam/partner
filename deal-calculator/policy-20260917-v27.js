// Sunbot Deal Calculator V27 — policy clarity + single-program + fast import, 17/09/2026
(function(){
'use strict';
const $=id=>document.getElementById(id);
const M=n=>typeof mil==='function'?mil(n):(Number(n||0)/1e6).toLocaleString('vi-VN',{maximumFractionDigits:1})+' triệu';
const MONEY=n=>typeof money==='function'?money(n):new Intl.NumberFormat('vi-VN').format(Math.round(Number(n||0)))+'đ';
const MONTH={9:'Tháng 9',10:'Tháng 10',11:'Tháng 11',12:'Tháng 12',1:'Tháng 1',2:'Tháng 2',3:'Tháng 3',4:'Tháng 4',5:'Tháng 5'};
let raf=0;

function forceSingleProgram(){
  try{programs=1}catch(e){}
  try{if(typeof activate==='function')activate('#programButtons','programs',1)}catch(e){}
  const box=$('programButtons')?.closest('.control');
  if(box)box.style.display='none';
  const val=$('programCountVal');if(val)val.textContent='1 chương trình';
  document.querySelectorAll('.talk').forEach(el=>{
    if(/Chương trình thứ hai bằng 70%/i.test(el.textContent||'')){
      el.textContent='Phí chương trình được tính cho 1 chương trình theo quy mô trẻ, cường độ và số tháng chính khóa còn lại.';
    }
  });
}

function configureSupplementPolicy(){
  // Dịch vụ bổ sung là ngân sách trải nghiệm gợi ý, không phải revenue-share mặc định.
  try{
    [30,60,90].forEach(k=>{
      if(servicePlans&&servicePlans[k]){
        servicePlans[k].sunbotFeeMonthly=0;
        servicePlans[k].costYear=0;
      }
    });
    if(servicePlans?.[0])servicePlans[0].desc='Chỉ triển khai chương trình cốt lõi. Nhà trường chưa bố trí ngân sách trải nghiệm bổ sung.';
    if(servicePlans?.[30])servicePlans[30].desc='Ngân sách trải nghiệm gợi ý 30.000 đồng/trẻ/tháng. Nhà trường có thể tự thực hiện theo tiêu chuẩn Sunbot hoặc đặt mua từng hạng mục phù hợp từ Sunbot.';
    if(servicePlans?.[60])servicePlans[60].desc='Ngân sách trải nghiệm gợi ý 60.000 đồng/trẻ/tháng. Có thể dùng cho kit mang về, in chứng nhận, thi đua – khen thưởng, mini-project hoặc hoạt động trải nghiệm theo kế hoạch.';
    if(servicePlans?.[90])servicePlans[90].desc='Ngân sách trải nghiệm gợi ý 90.000 đồng/trẻ/tháng. Phù hợp khi nhà trường muốn tăng mật độ học liệu mang về, dự án và sự kiện; cấu phần thực tế được chọn theo nhu cầu.';
  }catch(e){}

  const buttons=$('serviceButtons');
  if(buttons){
    const labels={0:'Không bổ sung',30:'Gợi ý<br>30.000đ/tháng',60:'Gợi ý<br>60.000đ/tháng',90:'Gợi ý<br>90.000đ/tháng'};
    buttons.querySelectorAll('[data-service]').forEach(b=>{const k=Number(b.dataset.service);if(labels[k])b.innerHTML=labels[k]});
    let note=$('supplementPolicyV27');
    if(!note){
      note=document.createElement('div');note.id='supplementPolicyV27';note.className='summary';
      note.style.marginTop='10px';
      note.innerHTML='<h4>Khuyến nghị để trải nghiệm của trẻ đầy đủ hơn</h4><p>Đây là <b>ngân sách trải nghiệm bổ sung, không bắt buộc</b> và nằm ngoài phí chương trình cốt lõi. Sunbot cung cấp tiêu chuẩn gợi ý cho từng mức; nhà trường có thể tự tổ chức hoặc đặt mua từng hạng mục từ Sunbot, ví dụ kit mang về theo tháng, in chứng nhận cứng, thi đua – khen thưởng, mini-project và sự kiện lớn/nhỏ. <b>App không mặc định chia doanh thu 70/30.</b> Nhà trường tự quyết định thu thêm từ phụ huynh hay bố trí từ nguồn còn lại; chỉ các hạng mục thực tế đặt mua từ Sunbot mới được tính thành khoản thanh toán cho Sunbot.</p>';
      const summary=buttons.nextElementSibling;
      if(summary)summary.insertAdjacentElement('afterend',note);else buttons.insertAdjacentElement('afterend',note);
    }
  }

  ['wholesaleControl','schoolServiceShareControl','serviceCostControl','serviceCostNote'].forEach(id=>{const e=$(id);if(e)e.hidden=true});
  ['serviceFeeRow','wholesaleRevenueOut','schoolServiceShareOut','serviceGrossOut'].forEach(id=>{const e=$(id);const row=e?.closest?.('tr');if(row)row.style.display='none'});

  const name=$('serviceName'),desc=$('serviceDescription');
  try{
    const sv=typeof service==='undefined'?0:Number(service)||0;
    if(name)name.textContent=sv?`Ngân sách trải nghiệm gợi ý · ${MONEY(sv*1000)}/trẻ/tháng`:'Không bố trí ngân sách bổ sung';
    if(desc&&servicePlans?.[sv])desc.textContent=servicePlans[sv].desc;
  }catch(e){}
}

function equipmentPolicyNote(){
  const termButtons=$('termButtons');if(!termButtons)return;
  const control=termButtons.closest('.control')||termButtons.parentElement;
  if(!control||$('equipmentTermPolicyV27'))return;
  const d=document.createElement('div');d.id='equipmentTermPolicyV27';d.className='warning';
  d.style.marginTop='9px';
  d.innerHTML='<b>Nguyên tắc hoàn trả thiết bị:</b> khi Sunbot bố trí/ứng vốn thiết bị, kỳ hạn 24 hoặc 36 tháng được tính <b>liên tục từ ngày bàn giao</b>, không chỉ theo các tháng trẻ đi học. Các tháng hè không thu phí chương trình nhưng nghĩa vụ hoàn trả thiết bị vẫn tiếp tục. Nếu nhà trường dừng Sunbot trước khi hết kỳ hạn, phần giá trị thiết bị chưa hoàn trả vẫn phải tiếp tục thanh toán hoặc tất toán theo thỏa thuận.';
  control.insertAdjacentElement('afterend',d);
}

function refreshPolicyUi(){
  forceSingleProgram();configureSupplementPolicy();equipmentPolicyNote();
  const after=$('payAfter');
  if(after&&/Nghĩa vụ thu hồi vốn không kết thúc theo năm học/i.test(after.textContent||'')){
    after.textContent=after.textContent.replace(/Nghĩa vụ thu hồi vốn không kết thúc theo năm học\.?/i,'Kỳ hạn hoàn trả thiết bị chạy liên tục từ ngày bàn giao; nếu dừng chương trình trước hạn, phần chưa hoàn trả vẫn phải tiếp tục thanh toán hoặc tất toán theo thỏa thuận.');
  }
}
function scheduleUi(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;refreshPolicyUi()})}

function repaymentText(s){
  if(!s||!(s.recoveryMonthly>0))return '';
  const total=s.recoveryMonthly*s.tm;
  return `Sunbot ứng/bố trí vốn thiết bị ${M(s.roomValue*s.share+s.extraInvest)}; tổng giá trị hoàn trả theo kỳ hạn ${s.tm} tháng là ${M(total)}, tương đương khoảng ${M(s.recoveryMonthly)}/tháng. Kỳ hạn tính liên tục từ ngày bàn giao.`;
}

function summaryV27(){
  try{forceSingleProgram()}catch(e){}
  const s=typeof window.SunbotDealCurrent==='function'?window.SunbotDealCurrent():null;
  if(!s)return 'Máy tính chưa sẵn sàng.';
  const school=String($('planSchoolName')?.value||'').trim();
  const prepared=String($('planPreparedBy')?.value||'').trim();
  const title=school?`PHƯƠNG ÁN TRIỂN KHAI SUNBOT – ${school}`:'TÓM TẮT PHƯƠNG ÁN TRIỂN KHAI SUNBOT';
  if(s.blocked)return [title,prepared?`Người lập/phụ trách: ${prepared}`:'',`Trạng thái: ${s.blockedReason}`].filter(Boolean).join('\n');
  const serviceBudget=s.sv?`${MONEY(s.sv*1000)}/trẻ/tháng`:'không bố trí';
  const lines=[title];
  if(prepared)lines.push(`Người lập/phụ trách: ${prepared}`,'');
  lines.push(
    `1. Quy mô: ${s.c.toLocaleString('vi-VN')} trẻ; ${s.classes} lớp; ${s.points} điểm triển khai; ${s.rooms} mô-đun tiêu chuẩn.`,
    `2. Thời gian: bắt đầu ${(MONTH[s.start]||'').toLowerCase()}, còn ${s.months} tháng đến hết tháng 5.`,
    `3. Cường độ: ${s.l} tiết/lớp/tháng; 1 chương trình; mức thu dự kiến ${MONEY(s.f)}/trẻ/tiết.`,
    `4. Phí chương trình trong năm học này: ${M(s.pf)}.`,
    `5. Phí đồng hành điểm triển khai bổ sung: ${M(s.site)} trong năm học này.`,
    `6. Đào tạo: ${s.trainTeachers} giáo viên, ${M(s.training)}; sát hạch: ${s.assessTeachers} giáo viên × 1 chương trình, ${M(s.assessment)}.`
  );
  if(s.md==='provide')lines.push(`7. Thiết bị: ${repaymentText(s)}`);
  else if(s.md==='own')lines.push(`7. Thiết bị: Nhà trường đầu tư cấu hình thiết bị ${M(s.schoolInvest)} theo phương án đã thống nhất.`);
  else lines.push(`7. Thiết bị: Hai bên cùng đầu tư; phần Sunbot bố trí vốn thực hiện theo kỳ hạn ${s.tm} tháng liên tục từ bàn giao.`);
  lines.push(
    `8. Phần hoàn trả thiết bị tính trong năm học này: ${M(s.recovery)}${s.recoveryMonthly>0?`, tương đương khoảng ${M(s.recoveryMonthly)}/tháng`:''}.`,
    `9. Tổng nhà trường thanh toán Sunbot trong năm học này: ${M(s.total)}.`,
    `10. Nguồn còn lại dự kiến của nhà trường sau các khoản đang tính: ${M(s.remain)}.`,
    `11. Ngân sách trải nghiệm bổ sung khuyến nghị: ${serviceBudget}. Đây không phải khoản chia mặc định 70/30; nhà trường có thể tự thực hiện theo tiêu chuẩn Sunbot hoặc đặt mua từng hạng mục từ Sunbot.`,
    '12. Lịch thanh toán dự kiến:'
  );
  (s.rows||[]).forEach(r=>lines.push(`   - Kỳ ${r.i}, ${r.label} (${r.n} tháng): ${M(r.total)}.`));
  if(s.recoveryMonthly>0){
    lines.push(`13. Sau tháng 5, phần hoàn trả thiết bị tiếp tục khoảng ${M(s.recoveryMonthly)}/tháng trong ${s.remainingRecoveryMonths} tháng còn lại của kỳ hạn ${s.tm} tháng.`);
    lines.push('14. Khoản hoàn trả thiết bị là nghĩa vụ độc lập với phí chương trình. Nếu nhà trường dừng Sunbot trước khi hết kỳ hạn, phần thiết bị chưa hoàn trả vẫn tiếp tục được thanh toán hoặc tất toán theo thỏa thuận; tháng hè không phát sinh phí chương trình nhưng kỳ hạn thiết bị vẫn chạy liên tục.');
  }
  lines.push(`${s.recoveryMonthly>0?'15':'13'}. Hạng mục bổ sung cho trải nghiệm trẻ có thể gồm kit mang về, chứng nhận cứng, thi đua – khen thưởng, mini-project và sự kiện; nhà trường lựa chọn tự tổ chức hoặc đặt mua theo nhu cầu.`);
  return lines.join('\n');
}

function parseSnapshot(text){
  const m=String(text||'').match(/SUNBOT PLAN\s*·\s*SBP1-([A-Za-z0-9_-]+)/i);
  if(!m)throw new Error('Đoạn dán chưa có mã khôi phục SUNBOT PLAN. Hãy dùng “Copy gửi nội bộ” từ máy tính.');
  let s=m[1].replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';
  const bin=atob(s),bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}
function setDirect(id,value,allowBlank){const e=$(id);if(!e)return;if(value===undefined||value===null)return;if(value===''&&!allowBlank)return;e.value=String(value)}
function activeDirect(group,attr,value){document.querySelectorAll(`${group} .btn`).forEach(b=>b.classList.toggle('active',String(b.dataset[attr])===String(value)))}
function fastApply(snapshot){
  if(!snapshot||snapshot.schema!=='SBP1'||!snapshot.inputs)throw new Error('Không nhận diện được dữ liệu phương án Sunbot.');
  const i=snapshot.inputs,m=snapshot.meta||{};
  if($('planSchoolName'))$('planSchoolName').value=m.school_name||'';
  if($('planPreparedBy'))$('planPreparedBy').value=m.prepared_by||'';
  setDirect('children',i.children);setDirect('childrenInput',i.children);setDirect('classSize',i.class_size);setDirect('classCountInput',i.class_count,true);setDirect('campusCount',i.campus_count);
  setDirect('fee',i.fee);setDirect('lessons',i.lessons);setDirect('startMonth',i.start_month);setDirect('teacherRate',i.teacher_rate);setDirect('trainingTeacherCount',i.training_teachers);setDirect('teacherCount',i.assessment_teachers);
  setDirect('capitalShare',i.capital_share);setDirect('extraPct',i.extra_pct);setDirect('otherCost',i.other_cost);setDirect('programCostPct',i.program_cost_pct);setDirect('trainingCostPct',i.training_cost_pct);setDirect('entryCostPct',i.entry_cost_pct);setDirect('renewalCostPct',i.renewal_cost_pct);setDirect('salesCostPct',i.sales_cost_pct);setDirect('relationshipCostPct',i.relationship_cost_pct);setDirect('opsCostPct',i.ops_cost_pct);
  try{programs=1;mode=i.investment_mode||'own';launch=i.launch||'new';term=Number(i.term)||24;service=Number(i.service)||0;extra=String(i.extra)==='yes';rolloutFunding=i.rollout_funding||'upfront'}catch(e){}
  activeDirect('#programButtons','programs',1);activeDirect('#investmentButtons','mode',i.investment_mode||'own');activeDirect('#launchButtons','launch',i.launch||'new');activeDirect('#termButtons','term',Number(i.term)||24);activeDirect('#serviceButtons','service',Number(i.service)||0);activeDirect('#extraButtons','extra',String(i.extra)==='yes'?'yes':'no');activeDirect('#rolloutFundingButtons','rollout',i.rollout_funding||'upfront');
  // contractScope lives inside the policy overlay closure, so use exactly one click only when needed.
  const scopeBtn=[...document.querySelectorAll('#contractScopeButtons .btn')].find(b=>String(b.dataset.scope)===String(i.contract_scope||'same_unit'));
  if(scopeBtn&&!scopeBtn.classList.contains('active'))scopeBtn.click();
  try{if(typeof update==='function')update()}catch(e){}
  try{if(typeof refreshClassPresentation==='function')refreshClassPresentation()}catch(e){}
  try{if(typeof window.SunbotDealFastRefresh==='function')window.SunbotDealFastRefresh()}catch(e){}
  try{document.dispatchEvent(new CustomEvent('sunbot:deal-change'))}catch(e){}
  scheduleUi();
}

// Capture import actions before the legacy importer dispatches dozens of events.
document.addEventListener('click',e=>{
  const close=e.target?.closest?.('#planImportClose');
  if(close){
    const w=$('planImportModal');if(w){w.hidden=true;w.style.display='none'}
    e.preventDefault();e.stopImmediatePropagation();return;
  }
  const applyBtn=e.target?.closest?.('#planImportApply');
  if(!applyBtn)return;
  e.preventDefault();e.stopImmediatePropagation();
  let snap;try{snap=parseSnapshot($('planImportText')?.value||'')}catch(err){if(typeof showToast==='function')showToast(err.message);else alert(err.message);return}
  applyBtn.disabled=true;applyBtn.textContent='Đang nạp…';
  const w=$('planImportModal');if(w){w.hidden=true;w.style.display='none'}
  if(typeof showToast==='function')showToast('Đang nạp phương án…');
  requestAnimationFrame(()=>{
    try{fastApply(snap);if(typeof showToast==='function')showToast(`Đã nạp phương án${snap.meta?.school_name?' · '+snap.meta.school_name:''}.`)}catch(err){if(typeof showToast==='function')showToast(err.message);else alert(err.message)}finally{applyBtn.disabled=false;applyBtn.textContent='Nạp phương án'}
  });
},true);

// Re-open import modal even after fast close used display:none.
document.addEventListener('click',e=>{if(!e.target?.closest?.('#importPlanBtn'))return;setTimeout(()=>{const w=$('planImportModal');if(w){w.hidden=false;w.style.display='grid'}},0)},true);

document.addEventListener('input',scheduleUi,true);
document.addEventListener('change',scheduleUi,true);
document.addEventListener('click',scheduleUi,true);

// Override copied summaries after all older overlays have loaded.
try{planText=summaryV27}catch(e){}
forceSingleProgram();configureSupplementPolicy();equipmentPolicyNote();scheduleUi();
})();