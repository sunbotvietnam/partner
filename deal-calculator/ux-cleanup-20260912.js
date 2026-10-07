// Sunbot Deal Calculator UX cleanup — V43
(function(){
'use strict';

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

function clean(){
  hideDerivedMonths();
  fixSchedulePlacement();
}

let timer;
function schedule(){clearTimeout(timer);timer=setTimeout(clean,80)}
document.addEventListener('input',schedule,true);
document.addEventListener('change',schedule,true);
document.addEventListener('click',schedule,true);
const target=document.querySelector('.wrap')||document.body;
new MutationObserver(schedule).observe(target,{subtree:true,childList:true});
clean();
})();