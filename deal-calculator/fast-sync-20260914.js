// Sunbot Deal Calculator — fast live synchronization, 14/09/2026
(function(){
'use strict';
const $=id=>document.getElementById(id);
const M=n=>typeof mil==='function'?mil(n):(Number(n||0)/1e6).toLocaleString('vi-VN',{maximumFractionDigits:1})+' triệu';
const MONEY=n=>typeof money==='function'?money(n):new Intl.NumberFormat('vi-VN').format(Math.round(Number(n||0)))+'đ';
const MONTH_NAME={9:'Tháng 9',10:'Tháng 10',11:'Tháng 11',12:'Tháng 12',1:'Tháng 1',2:'Tháng 2',3:'Tháng 3',4:'Tháng 4',5:'Tháng 5'};
let raf=0, typingChildren=false;

function text(id,v){const e=$(id);if(e)e.textContent=v;}

// Replace only the visible exact-number field so the old handler cannot clamp
// partial typing (e.g. typing 650 used to become 50 after the first digit).
function installChildrenInput(){
  const old=$('childrenInput'),slider=$('children');
  if(!old||!slider||old.dataset.fastSync==='1')return;
  const fresh=old.cloneNode(true);
  fresh.dataset.fastSync='1';
  fresh.value=slider.value;
  old.replaceWith(fresh);

  function commit(finalize){
    typingChildren=true;
    const raw=String(fresh.value||'').trim();
    if(raw===''){if(finalize){fresh.value=slider.value;} typingChildren=false;return;}
    let n=Number(raw);
    if(!Number.isFinite(n)){if(finalize)fresh.value=slider.value;typingChildren=false;return;}
    n=Math.round(n);
    if(finalize)n=Math.max(50,Math.min(1000,n));
    if(n>=50&&n<=1000){
      slider.value=String(n);
      if(finalize)fresh.value=String(n);
      slider.dispatchEvent(new Event('input',{bubbles:true}));
      schedule();
    }
    typingChildren=false;
  }
  fresh.addEventListener('input',()=>commit(false));
  fresh.addEventListener('change',()=>commit(true));
  fresh.addEventListener('blur',()=>commit(true));
  fresh.addEventListener('keydown',e=>{if(e.key==='Enter'){commit(true);fresh.blur();}});

  slider.addEventListener('input',()=>{if(!typingChildren)fresh.value=slider.value;},{passive:true});
}

function renderAuthoritative(){
  // First let the original calculator update its ordinary labels synchronously.
  try{if(typeof window.update==='function')window.update();}catch(e){}
  const get=window.SunbotDealCurrent;
  if(typeof get!=='function')return;
  let s;try{s=get();}catch(e){return;}

  // Critical outputs: these must never wait for a tab switch or delayed overlay.
  text('monthsVal',s.months+' tháng');
  const months=$('months');if(months)months.value=String(s.months);
  text('programFeeOut',s.blocked?'Phương án riêng':M(s.pf));
  text('trainingOut',s.training===null?'Phương án riêng':M(s.training));
  text('assessmentOut',M(s.assessment));
  text('qaSiteOut',s.blocked&&String(s.blockedReason||'').includes('Nhiều trường')?'Không áp dụng':M(s.site));
  text('capitalRecoveryOut',M(s.recovery));
  text('equipmentSaleOut',M(s.equipmentSale));

  if(s.blocked){
    ['sunbotTotalOut','sunbotTotalTable','schoolLiveSunbot','saleLiveSunbot'].forEach(id=>text(id,'Phương án riêng'));
    ['remaining','schoolLiveRemaining','saleLiveRemaining'].forEach(id=>text(id,'Chưa kết luận'));
  }else{
    ['sunbotTotalOut','sunbotTotalTable','schoolLiveSunbot','saleLiveSunbot'].forEach(id=>text(id,M(s.total)));
    ['remaining','schoolLiveRemaining','saleLiveRemaining'].forEach(id=>text(id,M(s.remain)));
  }
  text('saleLiveRevenue',M(s.parent));text('saleLiveTeacher',M(s.teacher));
  text('schoolLiveRevenue',M(s.parent));text('schoolLiveTeacher',M(s.teacher));

  const cv=$('childrenVal');if(cv)cv.textContent=Number(s.c||0).toLocaleString('vi-VN')+' trẻ';
  const visible=$('childrenInput');if(visible&&visible.dataset.fastSync==='1'&&!typingChildren&&document.activeElement!==visible)visible.value=String(s.c||'');

  // Payment schedule is part of the result panel, so render it in the same frame.
  const intro=$('payIntro'),body=$('payBody'),after=$('payAfter');
  if(intro)intro.textContent=s.blocked?'Cần lập phương án riêng trước khi sinh lịch thanh toán.':`Bắt đầu ${(MONTH_NAME[s.start]||'').toLowerCase()}, còn ${s.months} tháng đến hết tháng 5 → ${(s.rows||[]).length} kỳ. Đào tạo và sát hạch thu ở kỳ đầu.`;
  if(body)body.innerHTML=s.blocked?'<tr><td colspan="3">Phương án riêng</td></tr>':(s.rows||[]).map(r=>`<tr><td>Kỳ ${r.i}</td><td>${r.label} (${r.n} tháng)</td><td><b>${M(r.total)}</b><div class="sub">Chương trình ${M(r.program)}${r.site?` · Đồng hành điểm ${M(r.site)}`:''}${r.service?` · Dịch vụ ${M(r.service)}`:''}${r.recovery?` · Thu hồi vốn ${M(r.recovery)}`:''}${r.once?` · Khởi tạo/thiết bị ${M(r.once)}`:''}</div></td></tr>`).join('');
  if(after)after.textContent=s.blocked?'':s.recoveryMonthly>0?`Sau hết tháng 5, khoản vốn thiết bị còn tiếp tục ${s.remainingRecoveryMonths} tháng theo kỳ hạn ${s.tm} tháng kể từ lúc bàn giao, khoảng ${M(s.recoveryMonthly)}/tháng. Nghĩa vụ thu hồi vốn không kết thúc theo năm học.`:'Nhà trường đầu tư phần thiết bị của mình ngay từ đầu; không phát sinh thu hồi vốn thiết bị của Sunbot.';
}

function schedule(){
  if(raf)return;
  raf=requestAnimationFrame(()=>{raf=0;renderAuthoritative();});
}

// Capture every control change and update once in the next animation frame (~16 ms),
// instead of waiting 60–150 ms for several legacy overlays independently.
document.addEventListener('input',schedule,true);
document.addEventListener('change',schedule,true);
document.addEventListener('click',schedule,true);

installChildrenInput();
schedule();
window.SunbotDealFastRefresh=schedule;
})();