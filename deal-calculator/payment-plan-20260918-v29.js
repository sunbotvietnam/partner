// Sunbot Deal Calculator V29 — six-month equipment installments + reconciled school-year cash schedule, 18/09/2026
(function(){
'use strict';
const $=id=>document.getElementById(id);
const MONTH={1:'Tháng 1',2:'Tháng 2',3:'Tháng 3',4:'Tháng 4',5:'Tháng 5',6:'Tháng 6',7:'Tháng 7',8:'Tháng 8',9:'Tháng 9',10:'Tháng 10',11:'Tháng 11',12:'Tháng 12'};
const F=n=>(Number(n||0)/1e6).toLocaleString('vi-VN',{minimumFractionDigits:0,maximumFractionDigits:2})+' triệu';
const MONEY=n=>new Intl.NumberFormat('vi-VN').format(Math.round(Number(n||0)))+'đ';
let raf=0;

function equipmentSource(){return document.querySelector('#equipmentSourceButtons .btn.active')?.dataset.source||'sunbot'}
function nextMonth(m,steps=1){let x=m;for(let i=0;i<steps;i++)x=x===12?1:x+1;return x}
function chunks(n){return ({9:[2,2,2,3],8:[2,2,2,2],7:[2,2,3],6:[2,2,2],5:[3,2],4:[2,2],3:[3],2:[2],1:[1]})[n]||[n]}
function periodLabel(start,n){const end=nextMonth(start,n-1);return n===1?MONTH[start]:`${MONTH[start]}–${String(MONTH[end]).replace('Tháng ','')}`}

function current(){
  const s=typeof window.SunbotDealCurrent==='function'?window.SunbotDealCurrent():null;
  if(!s)return null;
  const source=equipmentSource();
  const isNew=(typeof launch==='undefined'?true:launch==='new');
  const program=Number(s.pf||0),site=Number(s.site||0),training=isNew?Number(s.training||0):0,assessment=isNew?Number(s.assessment||0):0;
  const directEquipment=(s.md!=='provide'&&source==='sunbot')?Number(s.schoolInvest||0):0;
  const externalEquipment=(s.md!=='provide'&&source!=='sunbot')?Number(s.schoolInvest||0):0;
  const financedCapital=Math.max(0,Number(s.roomValue||0)*Number(s.share||0)+Number(s.extraInvest||0));
  const term=[24,36].includes(Number(s.tm))?Number(s.tm):24;
  const equipmentTotal=Math.round(financedCapital*1.30);
  const installmentCount=equipmentTotal>0?term/6:0;
  const installments=[];
  if(installmentCount){
    const base=Math.floor(equipmentTotal/installmentCount);
    for(let i=0;i<installmentCount;i++){
      const amount=i===installmentCount-1?equipmentTotal-base*(installmentCount-1):base;
      installments.push({i:i+1,offset:i*6,month:nextMonth(Number(s.start||9),i*6),amount});
    }
  }
  const currentYearInstallments=installments.filter(x=>x.offset<Number(s.months||0));
  const equipmentDueCurrent=currentYearInstallments.reduce((a,x)=>a+x.amount,0);
  const serviceYearTotal=program+site+training+assessment;
  const totalDueCurrent=serviceYearTotal+directEquipment+equipmentDueCurrent;

  // Supplementary experience budgets are advisory only: they must not inflate school revenue or Sunbot receipts.
  const coreParentRevenue=Number(s.c||0)*Number(s.f||0)*Number(s.l||0)*Number(s.months||0);
  const teacherCost=Number(s.classes||0)*Number(s.l||0)*Number(s.months||0)*Number(s.tr||0);
  const remain=coreParentRevenue-teacherCost-totalDueCurrent-externalEquipment-Number(s.other||0);

  return {...s,source,program,site,training,assessment,directEquipment,externalEquipment,financedCapital,term,equipmentTotal,installmentCount,installments,currentYearInstallments,equipmentDueCurrent,serviceYearTotal,totalDueCurrent,coreParentRevenue,teacherCost,remain};
}

function ensureStructure(){
  const schedule=$('paymentScheduleBox');if(!schedule)return;
  let service=$('schoolYearServiceV29');
  if(!service){
    service=document.createElement('div');service.id='schoolYearServiceV29';service.className='summary';service.style.marginTop='10px';
    service.innerHTML='<h4>A. Chi phí triển khai trong năm học</h4><div id="schoolYearServiceRowsV29"></div><p class="sub">Các khoản này gắn với hoạt động triển khai năm học và kết thúc theo phạm vi năm học đã tính.</p>';
    schedule.insertAdjacentElement('beforebegin',service);
  }
  let equip=$('equipmentPlanV29');
  if(!equip){
    equip=document.createElement('div');equip.id='equipmentPlanV29';equip.className='summary';equip.style.marginTop='10px';
    equip.innerHTML='<h4>B. Phương án thiết bị</h4><div id="equipmentPlanRowsV29"></div><p class="sub" id="equipmentPlanNoteV29"></p>';
    service.insertAdjacentElement('afterend',equip);
  }
  const h=schedule.querySelector('h4');if(h)h.textContent='C. Lịch thanh toán tổng hợp dự kiến';
  const old=$('sunbotPaymentBreakdownV28');if(old)old.remove();
}

function render(){
  ensureStructure();
  const a=current();if(!a)return;
  if(a.blocked)return;

  // Keep top-line metrics aligned with actual cash due through May.
  ['sunbotTotalOut','sunbotTotalTable','schoolLiveSunbot','saleLiveSunbot'].forEach(id=>{const e=$(id);if(e)e.textContent=F(a.totalDueCurrent)});
  ['annualRevenue','schoolLiveRevenue','saleLiveRevenue'].forEach(id=>{const e=$(id);if(e)e.textContent=F(a.coreParentRevenue)});
  ['teacherCostOut','schoolLiveTeacher','saleLiveTeacher'].forEach(id=>{const e=$(id);if(e)e.textContent=F(a.teacherCost)});
  ['remaining','schoolLiveRemaining','saleLiveRemaining'].forEach(id=>{const e=$(id);if(e)e.textContent=F(a.remain)});

  const sr=$('schoolYearServiceRowsV29');
  if(sr){
    const rows=[['Phí chương trình',a.program],['Phí đồng hành điểm triển khai bổ sung',a.site],['Đào tạo giáo viên',a.training],['Sát hạch giáo viên',a.assessment]].filter(x=>x[1]>0);
    sr.innerHTML=`<table class="table"><tbody>${rows.map(([n,v])=>`<tr><td>${n}</td><td><b>${F(v)}</b></td></tr>`).join('')}<tr><td><b>Tổng chi phí triển khai năm học</b></td><td><b>${F(a.serviceYearTotal)}</b></td></tr></tbody></table>`;
  }

  const er=$('equipmentPlanRowsV29'),en=$('equipmentPlanNoteV29');
  if(er){
    if(a.equipmentTotal>0){
      const installment=a.installments[0]?.amount||0;
      er.innerHTML=`<table class="table"><tbody>
        <tr><td>Vốn thiết bị Sunbot bố trí</td><td><b>${F(a.financedCapital)}</b></td></tr>
        <tr><td>Tổng giá trị hoàn trả</td><td><b>${F(a.equipmentTotal)}</b></td></tr>
        <tr><td>Kỳ hạn tính</td><td><b>${a.term} tháng</b></td></tr>
        <tr><td>Lịch thanh toán</td><td><b>${a.installmentCount} kỳ · 6 tháng/kỳ</b></td></tr>
        <tr><td>Giá trị mỗi kỳ</td><td><b>${F(installment)}</b></td></tr>
      </tbody></table>`;
      if(en)en.textContent=`Kỳ 1 thanh toán khi bàn giao; các kỳ tiếp theo cách nhau 6 tháng. Đây là lịch thu tiền, còn ${a.term} tháng là kỳ hạn tính của phương án. Nếu dừng chương trình trước hạn, phần thiết bị chưa hoàn trả vẫn tiếp tục thanh toán hoặc được tất toán theo thỏa thuận.`;
    }else if(a.directEquipment>0){
      er.innerHTML=`<table class="table"><tbody><tr><td>Thiết bị nhà trường mua trực tiếp từ Sunbot</td><td><b>${F(a.directEquipment)}</b></td></tr><tr><td>Thanh toán</td><td><b>Kỳ đầu</b></td></tr></tbody></table>`;
      if(en)en.textContent='Không phát sinh nghĩa vụ hoàn trả thiết bị sau khi khoản mua trực tiếp đã được thanh toán.';
    }else{
      er.innerHTML='<p class="sub">Nhà trường tự trang bị thiết bị theo cấu hình thống nhất; không phát sinh khoản thanh toán thiết bị cho Sunbot.</p>';
      if(en)en.textContent='';
    }
  }

  const parts=chunks(a.months),rows=[];let cur=a.start,offset=0;
  const pm=a.months?a.program/a.months:0,sm=a.months?a.site/a.months:0;
  parts.forEach((n,i)=>{
    const program=pm*n,site=sm*n;
    const training=i===0?a.training:0,assessment=i===0?a.assessment:0,direct=i===0?a.directEquipment:0;
    const equipmentInst=a.currentYearInstallments.filter(x=>x.offset>=offset&&x.offset<offset+n).reduce((sum,x)=>sum+x.amount,0);
    const total=program+site+training+assessment+direct+equipmentInst;
    rows.push({i:i+1,n,label:periodLabel(cur,n),program,site,training,assessment,direct,equipmentInst,total});
    cur=nextMonth(cur,n);offset+=n;
  });
  const scheduleSum=rows.reduce((sum,r)=>sum+r.total,0);
  const diff=Math.round(scheduleSum-a.totalDueCurrent);

  const intro=$('payIntro'),body=$('payBody'),after=$('payAfter');
  if(intro)intro.textContent=`Từ ${MONTH[a.start].toLowerCase()} đến hết tháng 5 có ${rows.length} kỳ thanh toán vận hành. Thiết bị được thu theo kỳ 6 tháng; kỳ thiết bị đến hạn được gộp vào kỳ thanh toán gần tương ứng để giảm số lần xử lý.`;
  if(body)body.innerHTML=rows.map(r=>{
    const d=[`Chương trình ${F(r.program)}`];
    if(r.site)d.push(`Đồng hành điểm ${F(r.site)}`);
    if(r.training)d.push(`Đào tạo ${F(r.training)}`);
    if(r.assessment)d.push(`Sát hạch ${F(r.assessment)}`);
    if(r.direct)d.push(`Thiết bị mua trực tiếp ${F(r.direct)}`);
    if(r.equipmentInst)d.push(`Kỳ hoàn trả thiết bị ${F(r.equipmentInst)}`);
    return `<tr><td>Kỳ ${r.i}</td><td>${r.label} (${r.n} tháng)</td><td><b>${F(r.total)}</b><div class="sub">${d.join(' · ')}</div></td></tr>`;
  }).join('');

  const paidEquipment=a.equipmentDueCurrent;
  const outstanding=Math.max(0,a.equipmentTotal-paidEquipment);
  if(after){
    if(a.equipmentTotal>0){
      const future=a.installments.filter(x=>x.offset>=a.months);
      after.innerHTML=`<b>Sau tháng 5:</b> không phát sinh phí chương trình của năm học này. Phần thiết bị còn ${F(outstanding)}, tương ứng ${future.length} kỳ 6 tháng theo lịch đã ký. Không thu lẻ từng tháng hè.${diff!==0?` <b style="color:#b42318">Cảnh báo đối soát: lịch đang lệch ${MONEY(diff)}.</b>`:''}`;
    }else after.textContent=diff===0?'Lịch thanh toán đã đối soát đủ với tổng khoản phải thanh toán Sunbot.':`Cảnh báo đối soát: lịch đang lệch ${MONEY(diff)}.`;
  }

  // Add a compact reconciliation line so Admin/Sales can detect any future formula regression.
  let audit=$('paymentReconcileV29');
  if(!audit&&$('paymentScheduleBox')){audit=document.createElement('p');audit.id='paymentReconcileV29';audit.className='sub';$('paymentScheduleBox').appendChild(audit)}
  if(audit){
    audit.innerHTML=diff===0
      ?`Đối soát: tổng các kỳ = <b>${F(scheduleSum)}</b> = tổng thanh toán Sunbot đến hết tháng 5. Không thừa/thiếu.`
      :`<b style="color:#b42318">Đối soát lỗi: tổng các kỳ ${F(scheduleSum)} khác tổng phải thu ${F(a.totalDueCurrent)} (${MONEY(diff)}).</b>`;
  }

  // Hide monthly-recovery wording left by older layers.
  const capital=$('capitalRecoveryOut');if(capital)capital.textContent=a.equipmentTotal>0?F(a.equipmentDueCurrent):F(0);
  const capitalRow=$('capitalRecoveryRow');if(capitalRow){const td=capitalRow.querySelector('td');if(td)td.textContent='Kỳ hoàn trả thiết bị đến hạn đến hết tháng 5';}
  document.querySelectorAll('body *').forEach(el=>{
    if(el.children.length)return;
    const t=String(el.textContent||'');
    if(/khoảng .*\/tháng.*hoàn trả|Thu hồi vốn thiết bị trong năm học này/i.test(t)){
      if(!el.closest('#paymentScheduleBox')&&!el.closest('#equipmentPlanV29'))el.style.display='none';
    }
  });

  // Keep the 4/6/8 comparison on the same authoritative cash logic.
  const cmp=$('compareBody');
  if(cmp){
    cmp.innerHTML=[4,6,8].map(x=>{
      const programX=typeof feeByScale==='function'?feeByScale(a.c,x,a.months):null;
      if(programX===null)return `<tr><td>${x} tiết/tháng</td><td>${F(a.c*a.f*x*a.months)}</td><td>${F(a.classes*x*a.months*a.tr)}</td><td>Phương án riêng</td></tr>`;
      const revenueX=a.c*a.f*x*a.months;
      const teacherX=a.classes*x*a.months*a.tr;
      const totalX=programX+a.site+a.training+a.assessment+a.directEquipment+a.equipmentDueCurrent;
      const remainX=revenueX-teacherX-totalX-a.externalEquipment-a.other;
      return `<tr><td>${x} tiết/tháng</td><td>${F(revenueX)}</td><td>${F(teacherX)}</td><td>${F(remainX)}</td></tr>`;
    }).join('');
  }

  // Supplementary experience remains advisory and must not alter revenue/remain.
  const note=$('supplementPolicyV27');
  if(note){
    note.innerHTML='<h4>Khuyến nghị để trải nghiệm của trẻ đầy đủ hơn</h4><p>Đây là <b>ngân sách trải nghiệm bổ sung, không bắt buộc</b>, tách khỏi phép tính thu – chi cốt lõi của phương án. Sunbot cung cấp tiêu chuẩn gợi ý; nhà trường có thể tự tổ chức hoặc đặt mua từng hạng mục phù hợp như kit mang về, chứng nhận cứng, thi đua – khen thưởng, mini-project và sự kiện.</p>';
  }

  window.SunbotPaymentV29={...a,scheduleRows:rows,scheduleSum,reconcileDiff:diff,outstandingEquipment:outstanding};
}

function summary(){
  const a=current();if(!a)return 'Máy tính chưa sẵn sàng.';
  const school=String($('planSchoolName')?.value||'').trim(),prepared=String($('planPreparedBy')?.value||'').trim();
  const lines=[school?`PHƯƠNG ÁN TRIỂN KHAI SUNBOT – ${school}`:'TÓM TẮT PHƯƠNG ÁN TRIỂN KHAI SUNBOT'];
  if(prepared)lines.push(`Người lập/phụ trách: ${prepared}`,'');
  if(a.blocked){lines.push(`Trạng thái: ${a.blockedReason}`);return lines.join('\n')}
  lines.push(
    `1. Quy mô: ${a.c.toLocaleString('vi-VN')} trẻ; ${a.classes} lớp; ${a.points} điểm triển khai; ${a.rooms} mô-đun tiêu chuẩn.`,
    `2. Thời gian: bắt đầu ${(MONTH[a.start]||'').toLowerCase()}, còn ${a.months} tháng đến hết tháng 5.`,
    `3. Cường độ: ${a.l} tiết/lớp/tháng; 1 chương trình; mức thu dự kiến ${MONEY(a.f)}/trẻ/tiết.`,
    `4. Chi phí triển khai năm học: chương trình ${F(a.program)}; đồng hành điểm bổ sung ${F(a.site)}; đào tạo ${F(a.training)}; sát hạch ${F(a.assessment)}. Tổng ${F(a.serviceYearTotal)}.`
  );
  if(a.equipmentTotal>0){
    lines.push(`5. Thiết bị: Sunbot bố trí vốn ${F(a.financedCapital)}; tổng giá trị hoàn trả ${F(a.equipmentTotal)} trong ${a.term} tháng, thanh toán ${a.installmentCount} kỳ, mỗi kỳ 6 tháng; kỳ đầu khi bàn giao.`);
    lines.push(`6. Các kỳ thiết bị đến hạn trước hết tháng 5: ${a.currentYearInstallments.length} kỳ, tổng ${F(a.equipmentDueCurrent)}.`);
  }else if(a.directEquipment>0)lines.push(`5. Thiết bị: nhà trường mua trực tiếp từ Sunbot ${F(a.directEquipment)}, thanh toán ở kỳ đầu.`);
  else lines.push('5. Thiết bị: nhà trường tự trang bị; không tính vào khoản thanh toán Sunbot.');
  lines.push(
    `7. Tổng thanh toán Sunbot đến hết tháng 5 theo lịch dự kiến: ${F(a.totalDueCurrent)}.`,
    `8. Nguồn thu học phí cốt lõi dự kiến: ${F(a.coreParentRevenue)}; chi phí giáo viên dự kiến ${F(a.teacherCost)}; nguồn còn lại sau các khoản đang tính ${F(a.remain)}.`,
    '9. Ngân sách trải nghiệm bổ sung là khuyến nghị riêng, không tự động cộng vào doanh thu, chi phí hay khoản thanh toán Sunbot.',
    '10. Lịch thanh toán: các khoản chương trình/đồng hành được chia theo kỳ trong năm học; đào tạo, sát hạch và thiết bị mua trực tiếp (nếu có) ở kỳ đầu; kỳ hoàn trả thiết bị 6 tháng được gộp vào kỳ tương ứng.'
  );
  if(a.equipmentTotal>0){
    const future=a.installments.filter(x=>x.offset>=a.months),outstanding=Math.max(0,a.equipmentTotal-a.equipmentDueCurrent);
    lines.push(`11. Sau tháng 5 còn ${F(outstanding)} thiết bị, tương ứng ${future.length} kỳ 6 tháng. Không thu lẻ từng tháng hè; nếu dừng Sunbot trước hạn, phần chưa hoàn trả vẫn tiếp tục thanh toán hoặc tất toán theo thỏa thuận.`);
  }
  return lines.join('\n');
}

let settleTimer=0;
function schedule(){
  if(!raf)raf=requestAnimationFrame(()=>{raf=0;render();try{planText=summary}catch(e){}});
  clearTimeout(settleTimer);
  settleTimer=setTimeout(()=>{render();try{planText=summary}catch(e){}},90);
}
document.addEventListener('input',schedule,true);
document.addEventListener('change',schedule,true);
document.addEventListener('click',schedule,true);
// Watch only state-bearing controls. Do not observe rendered result HTML, otherwise
// render() would trigger its own observer and create a continuous repaint loop.
const controls=document.querySelector('.controls');
if(controls){
  const observer=new MutationObserver(schedule);
  observer.observe(controls,{subtree:true,attributes:true,attributeFilter:['class','hidden']});
}
document.addEventListener('sunbot:deal-change',schedule,true);
render();try{planText=summary}catch(e){}
})();