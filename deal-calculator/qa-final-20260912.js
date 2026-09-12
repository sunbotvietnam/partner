// Final QA alignment — keeps all internal metrics on the same prorated state as payment schedule.
(function(){
'use strict';
const N=(id,d=0)=>Number(document.getElementById(id)?.value||d);
const M=n=>typeof mil==='function'?mil(n):(n/1e6).toLocaleString('vi-VN',{maximumFractionDigits:1})+' triệu';
function text(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
function render(){
  if(typeof window.SunbotDealCurrent!=='function')return;
  const s=window.SunbotDealCurrent();
  if(!s)return;
  if(s.blocked){
    ['sunbotContributionOut','liveContribution','liveInternalCost','liveMargin','serviceGrossOut'].forEach(id=>text(id,'Chưa kết luận'));
    const rb=document.getElementById('ratioBadge');if(rb){rb.className='badge bad';rb.textContent='Cần duyệt'}
    text('ratioNote',s.blockedReason||'Cần lập phương án riêng.');
    return;
  }
  const servicePlan=(typeof servicePlans!=='undefined'&&servicePlans[s.sv])?servicePlans[s.sv]:{costYear:0};
  const serviceCOGS=s.c*servicePlan.costYear*s.months/9;
  const equipmentCost=s.equipmentSale;
  const programDeliveryCost=(s.pf||0)*N('programCostPct')/100;
  const trainingDeliveryCost=(s.training+s.assessment)*N('trainingCostPct')/100;
  const percentageBase=(s.pf||0)+s.training+s.assessment+s.site+s.serviceFee;
  const entryCost=percentageBase*N('entryCostPct')/100;
  const salesCost=percentageBase*N('salesCostPct')/100;
  const relationshipCost=percentageBase*N('relationshipCostPct')/100;
  const opsCost=percentageBase*N('opsCostPct')/100;
  const internalCosts=serviceCOGS+equipmentCost+programDeliveryCost+trainingDeliveryCost+entryCost+salesCost+relationshipCost+opsCost;
  const principalCurrent=(s.roomValue*s.share+s.extraInvest)*s.months/s.tm;
  const capitalMargin=s.recovery-principalCurrent;
  const contribution=(s.pf||0)+s.training+s.assessment+s.site+s.serviceFee+s.equipmentSale+capitalMargin-internalCosts;
  const contributionBase=(s.pf||0)+s.training+s.assessment+s.site+s.serviceFee+capitalMargin;
  const margin=contributionBase?contribution/contributionBase:0;
  const serviceGross=s.serviceFee-serviceCOGS;
  text('serviceGrossOut',M(serviceGross));
  text('sunbotContributionOut',M(contribution));
  text('liveInternalCost',M(internalCosts));
  text('liveContribution',M(contribution));
  text('liveMargin',(margin*100).toLocaleString('vi-VN',{maximumFractionDigits:1})+'%');
  const summary=document.getElementById('internalSummary');
  if(summary)summary.textContent=`Trong năm học này, chi phí nội bộ hoạch định khoảng ${M(internalCosts)}; phần đóng góp Sunbot còn lại khoảng ${M(contribution)}, tương đương biên đóng góp ${(margin*100).toLocaleString('vi-VN',{maximumFractionDigits:1})}%, trước chi phí chung và thuế. Phần thu hồi vốn thiết bị chỉ tính đúng ${s.months} tháng triển khai trong năm học.`;
  const ratio=s.parent?s.receipts/s.parent:0,rb=document.getElementById('ratioBadge'),bar=document.getElementById('ratioBar');
  if(rb){rb.className='badge';if(ratio<=.10){rb.textContent='Dễ giải thích';rb.classList.add('good')}else if(ratio<=.18){rb.textContent='Cần giải thích rõ';rb.classList.add('mid')}else{rb.textContent='Cần xem lại';rb.classList.add('bad')}}
  if(bar)bar.style.width=Math.min(100,ratio/.30*100)+'%';
  text('ratioNote',ratio<=.10?'Tổng khoản Sunbot thu không vượt 10% doanh thu dự kiến.':ratio<=.18?'Khoản Sunbot chiếm 10–18%; sale cần bóc tách phí chương trình, phí đồng hành điểm, đào tạo và phần vốn.':'Trên 18%; cần rà lại mức thu, quy mô lớp, thời hạn thu hồi vốn hoặc phạm vi trước khi trình trường.');
}
let timer;function queue(){clearTimeout(timer);timer=setTimeout(render,230)}
document.addEventListener('input',queue,true);document.addEventListener('change',queue,true);document.addEventListener('click',queue,true);
const root=document.querySelector('.wrap')||document.body;new MutationObserver(queue).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','value']});
setTimeout(render,260);
})();