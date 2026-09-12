// Sunbot Deal Calculator — authoritative recalculation + summary integrity, 12/09/2026
(function(){
'use strict';
const ANNUAL_SITE=5000000, MOD=31700000;
const MONTHS_LEFT={9:9,10:8,11:7,12:6,1:5,2:4,3:3,4:2,5:1};
const MONTH_NAME={9:'Tháng 9',10:'Tháng 10',11:'Tháng 11',12:'Tháng 12',1:'Tháng 1',2:'Tháng 2',3:'Tháng 3',4:'Tháng 4',5:'Tháng 5'};
const N=(id,d=0)=>Number(document.getElementById(id)?.value||d);
const M=n=>typeof mil==='function'?mil(n):(n/1e6).toLocaleString('vi-VN',{maximumFractionDigits:1})+' triệu';
const MONEY=n=>typeof money==='function'?money(n):new Intl.NumberFormat('vi-VN').format(Math.round(n))+'đ';
const scope=()=>document.querySelector('#contractScopeButtons .btn.active')?.dataset.scope||'same_unit';
function trainingFee(t,p){t=Math.max(0,Math.round(t||0));if(!t)return 0;if(t>50)return null;const blocks=Math.ceil(Math.max(t-20,0)/10);return p===2?19000000+blocks*7000000:11000000+blocks*4000000}
function chunks(n){return ({9:[2,2,2,3],8:[2,2,2,2],7:[2,2,3],6:[2,2,2],5:[3,2],4:[2,2],3:[3],2:[2],1:[1]})[n]||[n]}
function nextMonth(m){return m===12?1:m+1}
function periodLabel(start,n){let end=start;for(let i=1;i<n;i++)end=nextMonth(end);return n===1?MONTH_NAME[start]:`${MONTH_NAME[start]}–${String(MONTH_NAME[end]).replace('Tháng ','')}`}
function current(){
  const start=Number(document.getElementById('startMonth')?.value||9), months=MONTHS_LEFT[start]||9;
  const c=N('children'),cs=N('classSize',20),f=N('fee'),l=N('lessons',4),tr=N('teacherRate'),points=N('campusCount',1);
  const p=typeof programs==='undefined'?1:Number(programs)||1, md=typeof mode==='undefined'?'own':mode, tm=typeof term==='undefined'?24:Number(term)||24, sv=typeof service==='undefined'?0:Number(service)||0;
  const manual=N('classCountInput'), classes=manual?Math.max(1,Math.round(manual)):Math.ceil(c/cs);
  const trainTeachers=N('trainingTeacherCount'), assessTeachers=N('teacherCount');
  const rooms=typeof roomCount==='function'?roomCount(c):Math.max(c<=300?1:c<=800?2:3,points), roomValue=rooms*MOD;
  const share=md==='own'?0:md==='provide'?1:N('capitalShare',50)/100;
  const schoolInvest=roomValue*(1-share), equipmentSale=md!=='provide'?schoolInvest:0;
  const extraInvest=md!=='own'&&typeof extra!=='undefined'&&extra?roomValue*N('extraPct',10)/100:0;
  const pf=typeof feeByScale==='function'?feeByScale(c,l,months):null;
  const training=trainingFee(trainTeachers,p), assessment=assessTeachers*500000*p;
  const site=scope()==='same_unit'?Math.max(points-1,0)*ANNUAL_SITE*months/9:0;
  const serviceMonthly=typeof servicePlans!=='undefined'&&servicePlans[sv]?c*servicePlans[sv].sunbotFeeMonthly:0, serviceFee=serviceMonthly*months;
  const recoveryMonthly=(roomValue*share+extraInvest)*1.3/tm, recovery=recoveryMonthly*months;
  const parent=c*f*l*months*p+c*sv*1000*months, teacher=classes*l*months*tr*p, other=N('otherCost');
  const blockedReason=scope()==='multi_school'?'Nhiều trường độc lập cần báo giá riêng từng trường hoặc hợp đồng nhiều trường do CEO duyệt.':c>800?'Quy mô trên 800 trẻ cần phương án riêng do CEO duyệt.':training===null?'Trên 50 giáo viên cần phương án đào tạo riêng.':'';
  const blocked=Boolean(blockedReason);
  const receipts=blocked?null:pf+training+assessment+site+recovery+serviceFee;
  const total=blocked?null:receipts+equipmentSale;
  const remain=blocked?null:parent-teacher-receipts-schoolInvest-other;
  const rows=[];let cur=start;
  if(!blocked){const pm=pf/months, sm=site/months;chunks(months).forEach((n,i)=>{const program=pm*n,sitePart=sm*n,servicePart=serviceMonthly*n,recoveryPart=recoveryMonthly*n,once=i===0?training+assessment+equipmentSale:0,totalRow=program+sitePart+servicePart+recoveryPart+once;rows.push({i:i+1,n,label:periodLabel(cur,n),program,site:sitePart,service:servicePart,recovery:recoveryPart,once,total:totalRow});for(let k=0;k<n;k++)cur=nextMonth(cur)})}
  return {start,months,c,cs,f,l,tr,points,p,md,tm,sv,classes,trainTeachers,assessTeachers,rooms,roomValue,share,schoolInvest,equipmentSale,extraInvest,pf,training,assessment,site,serviceMonthly,serviceFee,recoveryMonthly,recovery,parent,teacher,other,blocked,blockedReason,receipts,total,remain,rows,remainingRecoveryMonths:share>0||extraInvest>0?Math.max(tm-months,0):0};
}
function render(){
  const s=current();
  const months=document.getElementById('months');if(months&&Number(months.value)!==s.months)months.value=s.months;
  const intro=document.getElementById('payIntro'),body=document.getElementById('payBody'),after=document.getElementById('payAfter');
  if(intro)intro.textContent=s.blocked?'Cần lập phương án riêng trước khi sinh lịch thanh toán.':`Bắt đầu ${MONTH_NAME[s.start].toLowerCase()}, còn ${s.months} tháng đến hết tháng 5 → ${s.rows.length} kỳ. Đào tạo và sát hạch thu ở kỳ đầu.`;
  if(body)body.innerHTML=s.blocked?'<tr><td colspan="3">Phương án riêng</td></tr>':s.rows.map(r=>`<tr><td>Kỳ ${r.i}</td><td>${r.label} (${r.n} tháng)</td><td><b>${M(r.total)}</b><div class="sub">Chương trình ${M(r.program)}${r.site?` · Đồng hành điểm ${M(r.site)}`:''}${r.service?` · Dịch vụ ${M(r.service)}`:''}${r.recovery?` · Thu hồi vốn ${M(r.recovery)}`:''}${r.once?` · Khởi tạo/thiết bị ${M(r.once)}`:''}</div></td></tr>`).join('');
  if(after)after.textContent=s.blocked?'':s.recoveryMonthly>0?`Sau hết tháng 5, khoản vốn thiết bị còn tiếp tục ${s.remainingRecoveryMonths} tháng theo kỳ hạn ${s.tm} tháng kể từ lúc bàn giao, khoảng ${M(s.recoveryMonthly)}/tháng. Nghĩa vụ thu hồi vốn không kết thúc theo năm học.`:'Nhà trường đầu tư phần thiết bị của mình ngay từ đầu; không phát sinh thu hồi vốn thiết bị của Sunbot.';
  const siteOut=document.getElementById('qaSiteOut')||document.getElementById('siteSupportFeeOut');if(siteOut)siteOut.textContent=scope()==='multi_school'?'Không áp dụng':M(s.site);
  if(!s.blocked){['sunbotTotalOut','sunbotTotalTable','schoolLiveSunbot','saleLiveSunbot'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=M(s.total)});['remaining','schoolLiveRemaining','saleLiveRemaining'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=M(s.remain)});const e=document.getElementById('capitalRecoveryOut');if(e)e.textContent=M(s.recovery)}
  const sr=document.getElementById('saleLiveRevenue');if(sr)sr.textContent=M(s.parent);const st=document.getElementById('saleLiveTeacher');if(st)st.textContent=M(s.teacher);
  window.SunbotDealCurrent=current;
}
function summary(){
  const s=current();
  if(s.blocked)return ['TÓM TẮT PHƯƠNG ÁN TRIỂN KHAI SUNBOT',`Trạng thái: ${s.blockedReason}`].join('\n');
  const invest=s.md==='own'?`Nhà trường đầu tư ${M(s.schoolInvest)} thiết bị ban đầu.`:s.md==='provide'?`Sunbot đầu tư toàn bộ thiết bị ${M(s.roomValue)}; thu hồi trong ${s.tm} tháng.`:`Hai bên cùng đầu tư; Sunbot góp ${Math.round(s.share*100)}% vốn thiết bị, nhà trường thanh toán ban đầu ${M(s.schoolInvest)}; phần vốn Sunbot thu hồi trong ${s.tm} tháng.`;
  const lines=['TÓM TẮT PHƯƠNG ÁN TRIỂN KHAI SUNBOT',
    `1. Quy mô: ${s.c.toLocaleString('vi-VN')} trẻ; ${s.classes} lớp; ${s.points} điểm triển khai; ${s.rooms} mô-đun tiêu chuẩn.`,
    `2. Thời gian: bắt đầu ${MONTH_NAME[s.start].toLowerCase()}, còn ${s.months} tháng đến hết tháng 5.`,
    `3. Cường độ: ${s.l} tiết/lớp/tháng/chương trình; ${s.p} chương trình; mức thu dự kiến ${MONEY(s.f)}/trẻ/tiết.`,
    `4. Phí chương trình trong năm học này: ${M(s.pf)}.`,
    `5. Phí đồng hành điểm triển khai bổ sung: ${M(s.site)} trong năm học này.`,
    `6. Đào tạo: ${s.trainTeachers} giáo viên, ${M(s.training)}; sát hạch: ${s.assessTeachers} giáo viên × ${s.p} chương trình, ${M(s.assessment)}.`,
    `7. Đầu tư thiết bị: ${invest}${s.extraInvest?` Sunbot đầu tư bổ sung ${M(s.extraInvest)} cho hạng mục phục vụ trực tiếp không gian học.`:''}`,
    `8. Thu hồi vốn thiết bị trong năm học này: ${M(s.recovery)}${s.recoveryMonthly>0?`, tương đương khoảng ${M(s.recoveryMonthly)}/tháng`:''}.`,
    `9. Tổng nhà trường thanh toán Sunbot trong năm học này: ${M(s.total)}.`,
    `10. Nguồn còn lại dự kiến của nhà trường sau các khoản đang tính: ${M(s.remain)}.`,
    '11. Lịch thanh toán dự kiến:'];
  s.rows.forEach(r=>lines.push(`   - Kỳ ${r.i}, ${r.label} (${r.n} tháng): ${M(r.total)}.`));
  if(s.recoveryMonthly>0)lines.push(`12. Sau tháng 5, phần vốn thiết bị tiếp tục khoảng ${M(s.recoveryMonthly)}/tháng trong ${s.remainingRecoveryMonths} tháng còn lại của kỳ hạn ${s.tm} tháng.`);
  lines.push('13. Hạng mục bổ sung chỉ ưu tiên các hạng mục phục vụ trực tiếp không gian học như thiết bị hiển thị, bàn ghế, giá kệ và nội thất học tập; không mặc định bao gồm tiện ích phòng khác.');
  if(typeof view!=='undefined'&&view==='internal')lines.push(`14. Ghi chú nội bộ: đây là phương án quản trị; ngoại lệ về giá, phạm vi hoặc đầu tư cần Admin/CEO phê duyệt.`);
  return lines.join('\n');
}
planText=summary;
let timer;function queue(){clearTimeout(timer);timer=setTimeout(render,60)}
document.addEventListener('input',queue,true);document.addEventListener('change',queue,true);document.addEventListener('click',()=>setTimeout(render,0),true);
const root=document.querySelector('.controls')||document.body;new MutationObserver(queue).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','value']});
render();
})();