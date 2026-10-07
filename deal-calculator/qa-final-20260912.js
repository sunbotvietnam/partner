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
    text('liveInternalCost','Chưa kết luận');
    const rb=document.getElementById('ratioBadge');if(rb){rb.className='badge bad';rb.textContent='Cần duyệt'}
    text('ratioNote',s.blockedReason||'Cần lập phương án riêng.');
    return;
  }
  const equipmentCost=s.equipmentSale;
  const programDeliveryCost=(s.pf||0)*N('programCostPct')/100;
  const trainingDeliveryCost=(s.training+s.assessment)*N('trainingCostPct')/100;
  const percentageBase=(s.pf||0)+s.training+s.assessment+s.site;
  const entryCost=percentageBase*N('entryCostPct')/100;
  const salesCost=percentageBase*N('salesCostPct')/100;
  const relationshipCost=percentageBase*N('relationshipCostPct')/100;
  const opsCost=percentageBase*N('opsCostPct')/100;
  const internalCosts=equipmentCost+programDeliveryCost+trainingDeliveryCost+entryCost+salesCost+relationshipCost+opsCost;
  text('liveInternalCost',M(internalCosts));
  const pay=window.SunbotPaymentV29||null;
  const ratio=pay&&pay.coreParentRevenue?pay.totalDueCurrent/pay.coreParentRevenue:(s.parent?s.receipts/s.parent:0),rb=document.getElementById('ratioBadge'),bar=document.getElementById('ratioBar');
  if(rb){rb.className='badge';if(ratio<=.10){rb.textContent='Dễ giải thích';rb.classList.add('good')}else if(ratio<=.18){rb.textContent='Cần giải thích rõ';rb.classList.add('mid')}else{rb.textContent='Cần xem lại';rb.classList.add('bad')}}
  if(bar)bar.style.width=Math.min(100,ratio/.30*100)+'%';
  text('ratioNote',ratio<=.10?'Mức thanh toán Sunbot đang ở ngưỡng dễ giải thích.':ratio<=.18?'Cần giải thích rõ phí chương trình, đào tạo, sát hạch và phần vốn.':'Tỷ lệ cao; nên rà lại mức thu, quy mô lớp hoặc kỳ hạn đầu tư.');
}
let timer;function queue(){clearTimeout(timer);timer=setTimeout(render,230)}
document.addEventListener('input',queue,true);document.addEventListener('change',queue,true);document.addEventListener('click',queue,true);
const root=document.querySelector('.controls');if(root)new MutationObserver(queue).observe(root,{subtree:true,attributes:true,attributeFilter:['class','hidden','value']});
setTimeout(render,260);
})();