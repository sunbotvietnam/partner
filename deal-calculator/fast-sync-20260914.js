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
  // Fast-sync only maintains input presentation. Financial/payment outputs are
  // owned exclusively by Payment Engine V35.
  try{if(typeof window.update==='function')window.update();}catch(e){}
  const get=window.SunbotDealCurrent;
  if(typeof get!=='function')return;
  let s;try{s=get();}catch(e){return;}

  text('monthsVal',s.months+' tháng');
  const months=$('months');if(months)months.value=String(s.months);

  const cv=$('childrenVal');if(cv)cv.textContent=Number(s.c||0).toLocaleString('vi-VN')+' trẻ';

  const manualClass=Number($('classCountInput')?.value||0);
  const authoritativeClasses=Number(s.classes||0) || (manualClass?Math.max(1,Math.round(manualClass)):Math.ceil(Number(s.c||0)/Math.max(1,Number(s.cs||20))));
  text('classCount',authoritativeClasses+' lớp');
  const source=$('classCountSource');
  if(source)source.textContent=manualClass?'Đang dùng số lớp thực tế':'Tự tính '+authoritativeClasses+' lớp';
  const classNote=$('classCalculationNote');
  if(classNote&&!manualClass)classNote.textContent=`Ước tính ${Number(s.c||0).toLocaleString('vi-VN')} trẻ ÷ ${Number(s.cs||20)} trẻ/lớp = ${authoritativeClasses} lớp (làm tròn lên).`;

  const visible=$('childrenInput');if(visible&&visible.dataset.fastSync==='1'&&!typingChildren&&document.activeElement!==visible)visible.value=String(s.c||'');
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