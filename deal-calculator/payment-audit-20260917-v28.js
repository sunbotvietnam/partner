// Sunbot Deal Calculator V28 — audited school payment schedule + clean supplement wording, 17/09/2026
(function(){
'use strict';
const $=id=>document.getElementById(id);
const M=n=>typeof mil==='function'?mil(n):(Number(n||0)/1e6).toLocaleString('vi-VN',{maximumFractionDigits:1})+' triệu';
const MONEY=n=>typeof money==='function'?money(n):new Intl.NumberFormat('vi-VN').format(Math.round(Number(n||0)))+'đ';
const MONTH={9:'Tháng 9',10:'Tháng 10',11:'Tháng 11',12:'Tháng 12',1:'Tháng 1',2:'Tháng 2',3:'Tháng 3',4:'Tháng 4',5:'Tháng 5'};
let raf=0;

function equipmentSource(){return document.querySelector('#equipmentSourceButtons .btn.active')?.dataset.source||'sunbot'}
function nextMonth(m){return m===12?1:m+1}
function chunks(n){return ({9:[2,2,2,3],8:[2,2,2,2],7:[2,2,3],6:[2,2,2],5:[3,2],4:[2,2],3:[3],2:[2],1:[1]})[n]||[n]}
function periodLabel(start,n){let end=start;for(let i=1;i<n;i++)end=nextMonth(end);return n===1?MONTH[start]:`${MONTH[start]}–${String(MONTH[end]).replace('Tháng ','')}`}

function cleanSupplementWording(){
  const note=$('supplementPolicyV27');
  if(note){
    note.innerHTML='<h4>Khuyến nghị để trải nghiệm của trẻ đầy đủ hơn</h4><p>Đây là <b>ngân sách trải nghiệm bổ sung, không bắt buộc</b> và nằm ngoài phí chương trình cốt lõi. Sunbot cung cấp tiêu chuẩn gợi ý cho từng mức; nhà trường có thể tự tổ chức hoặc đặt mua từng hạng mục phù hợp từ Sunbot, ví dụ kit mang về theo tháng, in chứng nhận cứng, thi đua – khen thưởng, mini-project và sự kiện lớn/nhỏ. Nhà trường chủ động lựa chọn nguồn chi và mức thực hiện phù hợp với kế hoạch của mình.</p>';
  }
  ['schoolServiceShareControl','wholesaleControl','serviceCostControl','serviceCostNote'].forEach(id=>{const e=$(id);if(e)e.hidden=true});
  document.querySelectorAll('body *').forEach(el=>{
    if(el.children.length)return;
    const t=(el.textContent||'').trim();
    if(/70\s*\/\s*30|70%|30%.*nhà trường giữ|phần nhà trường giữ lại/i.test(t)){
      if(el.closest('#supplementPolicyV27'))return;
      el.style.display='none';
    }
  });
}

function audited(){
  const s=typeof window.SunbotDealCurrent==='function'?window.SunbotDealCurrent():null;
  if(!s)return null;
  const source=equipmentSource();
  const directEquipment=(s.md!=='provide'&&source==='sunbot')?Number(s.schoolInvest||0):0;
  const program=Number(s.pf||0),site=Number(s.site||0),training=Number(s.training||0),assessment=Number(s.assessment||0),recovery=Number(s.recovery||0);
  const total=program+site+training+assessment+recovery+directEquipment;
  return {...s,source,directEquipment,program,site,training,assessment,recovery,total};
}

function ensureBreakdownBox(){
  const schedule=$('paymentScheduleBox');if(!schedule)return null;
  let box=$('sunbotPaymentBreakdownV28');
  if(!box){
    box=document.createElement('div');box.id='sunbotPaymentBreakdownV28';box.className='summary';box.style.marginTop='10px';
    box.innerHTML='<h4>Bóc tách khoản nhà trường thanh toán Sunbot</h4><div id="sunbotPaymentBreakdownRows"></div><p class="sub" id="sunbotPaymentBreakdownNote"></p>';
    schedule.insertAdjacentElement('afterend',box);
  }
  return box;
}

function renderPayment(){
  if(window.SunbotPaymentV29)return;
  cleanSupplementWording();
  const a=audited();if(!a)return;
  const totalTargets=['sunbotTotalOut','sunbotTotalTable','schoolLiveSunbot','saleLiveSunbot'];
  if(!a.blocked)totalTargets.forEach(id=>{const e=$(id);if(e)e.textContent=M(a.total)});

  const intro=$('payIntro'),body=$('payBody'),after=$('payAfter');
  if(a.blocked){
    if(intro)intro.textContent='Cần lập phương án riêng trước khi sinh lịch thanh toán.';
    if(body)body.innerHTML='<tr><td colspan="3">Phương án riêng</td></tr>';
    return;
  }

  const parts=chunks(a.months),rows=[];let cur=a.start;
  const pm=a.months?a.program/a.months:0,sm=a.months?a.site/a.months:0,rm=Number(a.recoveryMonthly||0);
  parts.forEach((n,i)=>{
    const program=pm*n,site=sm*n,recovery=rm*n;
    const training=i===0?a.training:0,assessment=i===0?a.assessment:0,equipment=i===0?a.directEquipment:0;
    const total=program+site+recovery+training+assessment+equipment;
    rows.push({i:i+1,n,label:periodLabel(cur,n),program,site,recovery,training,assessment,equipment,total});
    for(let k=0;k<n;k++)cur=nextMonth(cur);
  });
  if(intro)intro.textContent=`Bắt đầu ${(MONTH[a.start]||'').toLowerCase()}, còn ${a.months} tháng đến hết tháng 5 → ${rows.length} kỳ. Kỳ đầu thu các khoản khởi tạo phát sinh; phí chương trình, đồng hành điểm và hoàn trả thiết bị được phân bổ theo thời gian.`;
  if(body)body.innerHTML=rows.map(r=>{
    const detail=[`Chương trình ${M(r.program)}`];
    if(r.site)detail.push(`Đồng hành điểm ${M(r.site)}`);
    if(r.recovery)detail.push(`Hoàn trả thiết bị ${M(r.recovery)}`);
    if(r.training)detail.push(`Đào tạo ${M(r.training)}`);
    if(r.assessment)detail.push(`Sát hạch ${M(r.assessment)}`);
    if(r.equipment)detail.push(`Thiết bị mua trực tiếp ${M(r.equipment)}`);
    return `<tr><td>Kỳ ${r.i}</td><td>${r.label} (${r.n} tháng)</td><td><b>${M(r.total)}</b><div class="sub">${detail.join(' · ')}</div></td></tr>`;
  }).join('');
  if(after){
    after.textContent=a.recoveryMonthly>0
      ?`Sau hết tháng 5, phần hoàn trả thiết bị tiếp tục ${a.remainingRecoveryMonths} tháng còn lại của kỳ hạn ${a.tm} tháng kể từ ngày bàn giao, khoảng ${M(a.recoveryMonthly)}/tháng. Tháng hè không phát sinh phí chương trình; nghĩa vụ hoàn trả thiết bị vẫn tiếp tục. Nếu dừng Sunbot trước khi hết kỳ hạn, phần thiết bị chưa hoàn trả vẫn phải thanh toán hoặc tất toán theo thỏa thuận.`
      :(a.directEquipment>0?'Thiết bị được nhà trường mua trực tiếp từ Sunbot và thanh toán ở kỳ đầu; không phát sinh khoản hoàn trả thiết bị sau đó.':'Nhà trường tự trang bị thiết bị theo cấu hình thống nhất; khoản này không nằm trong thanh toán cho Sunbot.');
  }

  ensureBreakdownBox();
  const rowsBox=$('sunbotPaymentBreakdownRows');
  const breakdown=[
    ['Phí chương trình',a.program],
    ['Phí đồng hành điểm triển khai bổ sung',a.site],
    ['Đào tạo giáo viên',a.training],
    ['Sát hạch giáo viên',a.assessment],
    ['Hoàn trả thiết bị trong năm học này',a.recovery],
    ['Thiết bị mua trực tiếp từ Sunbot',a.directEquipment]
  ].filter(x=>x[1]>0);
  if(rowsBox)rowsBox.innerHTML=`<table class="table"><tbody>${breakdown.map(([n,v])=>`<tr><td>${n}</td><td><b>${M(v)}</b></td></tr>`).join('')}<tr><td><b>Tổng thanh toán Sunbot trong năm học này</b></td><td><b>${M(a.total)}</b></td></tr></tbody></table>`;
  const note=$('sunbotPaymentBreakdownNote');
  if(note)note.textContent='Ngân sách trải nghiệm bổ sung cho trẻ không được mặc định tính là khoản thanh toán Sunbot. Chỉ hạng mục nhà trường thực tế đặt mua từ Sunbot mới được đưa vào báo giá/đơn hàng tương ứng.';
}

function summary(){
  const a=audited();if(!a)return 'Máy tính chưa sẵn sàng.';
  const school=String($('planSchoolName')?.value||'').trim(),prepared=String($('planPreparedBy')?.value||'').trim();
  const lines=[school?`PHƯƠNG ÁN TRIỂN KHAI SUNBOT – ${school}`:'TÓM TẮT PHƯƠNG ÁN TRIỂN KHAI SUNBOT'];
  if(prepared)lines.push(`Người lập/phụ trách: ${prepared}`,'');
  if(a.blocked){lines.push(`Trạng thái: ${a.blockedReason}`);return lines.join('\n')}
  lines.push(
    `1. Quy mô: ${a.c.toLocaleString('vi-VN')} trẻ; ${a.classes} lớp; ${a.points} điểm triển khai; ${a.rooms} mô-đun tiêu chuẩn.`,
    `2. Thời gian: bắt đầu ${(MONTH[a.start]||'').toLowerCase()}, còn ${a.months} tháng đến hết tháng 5.`,
    `3. Cường độ: ${a.l} tiết/lớp/tháng; 1 chương trình; mức thu dự kiến ${MONEY(a.f)}/trẻ/tiết.`,
    `4. Phí chương trình: ${M(a.program)}.`,
    `5. Phí đồng hành điểm triển khai bổ sung: ${M(a.site)}.`,
    `6. Đào tạo: ${a.trainTeachers} giáo viên, ${M(a.training)}; sát hạch: ${a.assessTeachers} giáo viên × 1 chương trình, ${M(a.assessment)}.`
  );
  if(a.md==='provide')lines.push(`7. Thiết bị: Sunbot bố trí vốn thiết bị ${M(a.roomValue*a.share+a.extraInvest)}; phần hoàn trả trong năm học này ${M(a.recovery)}, kỳ hạn ${a.tm} tháng liên tục từ ngày bàn giao.`);
  else if(a.directEquipment>0)lines.push(`7. Thiết bị: Nhà trường mua trực tiếp từ Sunbot ${M(a.directEquipment)}, thanh toán theo lịch kỳ đầu.`);
  else lines.push(`7. Thiết bị: Nhà trường tự trang bị theo cấu hình thống nhất; không tính vào khoản thanh toán Sunbot.`);
  lines.push(`8. Tổng nhà trường thanh toán Sunbot trong năm học này: ${M(a.total)}.`);
  lines.push('9. Bóc tách khoản thanh toán Sunbot:');
  [['Phí chương trình',a.program],['Đồng hành điểm bổ sung',a.site],['Đào tạo',a.training],['Sát hạch',a.assessment],['Hoàn trả thiết bị trong năm học này',a.recovery],['Thiết bị mua trực tiếp từ Sunbot',a.directEquipment]].filter(x=>x[1]>0).forEach(([n,v])=>lines.push(`   - ${n}: ${M(v)}.`));
  lines.push(`10. Nguồn còn lại dự kiến của nhà trường sau các khoản đang tính: ${M(a.remain)}.`);
  lines.push(`11. Ngân sách trải nghiệm bổ sung: ${a.sv?MONEY(a.sv*1000)+'/trẻ/tháng':'không bố trí'}. Đây là khoản khuyến nghị để nhà trường chủ động nâng trải nghiệm; không mặc định là khoản phải trả Sunbot.`);
  lines.push('12. Lịch thanh toán dự kiến: xem bảng theo kỳ trên máy tính; kỳ đầu gồm các khoản khởi tạo phát sinh, các kỳ sau gồm phần chương trình/đồng hành/hoàn trả thiết bị tương ứng.');
  if(a.recoveryMonthly>0)lines.push(`13. Sau tháng 5, hoàn trả thiết bị tiếp tục khoảng ${M(a.recoveryMonthly)}/tháng trong ${a.remainingRecoveryMonths} tháng còn lại. Nếu dừng Sunbot trước hạn, phần thiết bị chưa hoàn trả vẫn phải tiếp tục thanh toán hoặc tất toán theo thỏa thuận.`);
  return lines.join('\n');
}

function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;renderPayment()})}
document.addEventListener('input',schedule,true);document.addEventListener('change',schedule,true);document.addEventListener('click',schedule,true);
try{planText=summary}catch(e){}
renderPayment();
})();