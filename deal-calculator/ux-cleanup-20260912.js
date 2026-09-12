// Sunbot Deal Calculator UX cleanup — 12/09/2026
// Keeps calculation logic intact; simplifies the new-school workflow and sale view.
(function(){
'use strict';

function hideRenewal(){
  if(typeof launch!=='undefined')launch='new';
  const group=document.getElementById('launchButtons');
  if(group){
    group.style.display='none';
    group.querySelectorAll('.btn').forEach(b=>b.classList.toggle('active',b.dataset.launch==='new'));
  }
  const renewal=document.getElementById('renewalCostControl');if(renewal)renewal.hidden=true;
  const entry=document.getElementById('entryCostControl');if(entry)entry.hidden=false;
}

function hideDerivedMonths(){
  const months=document.getElementById('months');
  const box=months?.closest('.control');
  if(box)box.style.display='none';
}

function fixSchedulePlacement(){
  const schedule=document.getElementById('paymentScheduleBox');
  const compare=document.getElementById('compareBody')?.closest('table');
  if(!schedule||!compare)return;
  const compareLabel=compare.previousElementSibling===schedule?schedule.previousElementSibling:compare.previousElementSibling;
  if(compareLabel&&compareLabel.classList?.contains('label')&&/So sánh 4\s*\/\s*6\s*\/\s*8/i.test(compareLabel.textContent||'')){
    compareLabel.parentNode.insertBefore(schedule,compareLabel);
  }
  schedule.style.marginTop='18px';
}

function addSaleBar(){
  if(document.getElementById('saleLiveBar'))return;
  const wrap=document.querySelector('.wrap');
  if(!wrap)return;
  const d=document.createElement('div');
  d.className='liveBar sale-only';d.id='saleLiveBar';
  d.innerHTML='<div class="liveGrid schoolLiveGrid"><div class="liveTitle">Phương án sale đang tính<b>Kết quả cập nhật ngay khi điều chỉnh</b></div><div class="liveMetric"><span>Tổng thu dự kiến</span><strong id="saleLiveRevenue">—</strong></div><div class="liveMetric"><span>Chi phí giáo viên</span><strong id="saleLiveTeacher">—</strong></div><div class="liveMetric"><span>Thanh toán Sunbot trong năm học này</span><strong id="saleLiveSunbot">—</strong></div><div class="liveMetric accent"><span>Nguồn còn lại của trường</span><strong id="saleLiveRemaining">—</strong></div></div>';
  wrap.appendChild(d);
}

function copyText(from,to){const a=document.getElementById(from),b=document.getElementById(to);if(a&&b)b.textContent=a.textContent||'—'}
function syncSaleBar(){
  copyText('annualRevenue','saleLiveRevenue');
  copyText('teacherCostOut','saleLiveTeacher');
  copyText('sunbotTotalOut','saleLiveSunbot');
  copyText('remaining','saleLiveRemaining');
}

function clean(){hideRenewal();hideDerivedMonths();fixSchedulePlacement();addSaleBar();syncSaleBar()}

let timer;function schedule(){clearTimeout(timer);timer=setTimeout(clean,80)}
document.addEventListener('input',schedule,true);
document.addEventListener('change',schedule,true);
document.addEventListener('click',schedule,true);
const target=document.querySelector('.wrap')||document.body;
new MutationObserver(schedule).observe(target,{subtree:true,childList:true,characterData:true});
clean();
})();
