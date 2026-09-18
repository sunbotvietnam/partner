// Sunbot Deal Calculator — renewal equipment policy, 18/09/2026
(function(){
'use strict';
const $=id=>document.getElementById(id);
function isRenew(){try{return typeof launch!=='undefined'&&launch==='renew'}catch(e){return document.querySelector('#launchButtons .btn.active')?.dataset.launch==='renew'}}
function mode(){return document.querySelector('#renewalEquipmentButtons .btn.active')?.dataset.renewalEquipment||'existing'}
function setMode(value){
  const v=value==='add'?'add':'existing';
  document.querySelectorAll('#renewalEquipmentButtons .btn').forEach(b=>b.classList.toggle('active',b.dataset.renewalEquipment===v));
  sync();
  try{document.dispatchEvent(new CustomEvent('sunbot:deal-change'))}catch(e){}
}
function install(){
  if($('renewalEquipmentControl'))return;
  const inv=$('investmentButtons'); if(!inv)return;
  const d=document.createElement('div');
  d.id='renewalEquipmentControl';
  d.className='control';
  d.hidden=true;
  d.innerHTML='<div class="head"><label>Thiết bị khi gia hạn</label><span class="value" id="renewalEquipmentVal">Dùng thiết bị hiện hữu</span></div><div class="buttons two" id="renewalEquipmentButtons"><button class="btn active" data-renewal-equipment="existing">Sử dụng thiết bị hiện hữu</button><button class="btn" data-renewal-equipment="add">Bổ sung / thay thế thiết bị</button></div><div class="sub">Mặc định gia hạn tiếp tục dùng thiết bị đã có và không phát sinh đầu tư thiết bị mới. Chỉ chọn “Bổ sung / thay thế” khi trường thực sự cần mua thêm, thay thế hoặc mở rộng mô-đun.</div>';
  const label=inv.previousElementSibling;
  if(label)label.insertAdjacentElement('beforebegin',d); else inv.insertAdjacentElement('beforebegin',d);
  d.querySelectorAll('.btn').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.renewalEquipment)));
}
function setVisible(el,show){if(!el)return;el.style.display=show?'':'none'}
function sync(){
  install();
  const renew=isRenew(), add=mode()==='add';
  const control=$('renewalEquipmentControl'); if(control)control.hidden=!renew;
  const val=$('renewalEquipmentVal'); if(val)val.textContent=add?'Có bổ sung thiết bị':'Dùng thiết bị hiện hữu';
  const inv=$('investmentButtons');
  const label=inv?.previousElementSibling;
  const note=inv?.nextElementSibling;
  const showInvestment=!renew||add;
  setVisible(inv,showInvestment);
  if(label&&label.id!=='renewalEquipmentControl')setVisible(label,showInvestment);
  if(note&&note.classList?.contains('sub'))setVisible(note,showInvestment);
  const capital=$('capitalShareControl'); if(capital)capital.hidden=!showInvestment||document.querySelector('#investmentButtons .btn.active')?.dataset.mode!=='custom';
  const capitalOptions=$('sunbotCapitalOptions'); if(capitalOptions)capitalOptions.hidden=!showInvestment||document.querySelector('#investmentButtons .btn.active')?.dataset.mode==='own';
  const sourceButtons=$('equipmentSourceButtons'); if(sourceButtons){const box=sourceButtons.closest('.control')||sourceButtons.parentElement;setVisible(box,showInvestment);}
  document.body.classList.toggle('renew-existing-equipment',renew&&!add);
}
window.SunbotRenewalEquipmentMode=mode;
window.SunbotSetRenewalEquipmentMode=setMode;
document.addEventListener('click',e=>{
  if(e.target?.closest?.('#launchButtons .btn')||e.target?.closest?.('#investmentButtons .btn'))setTimeout(sync,0);
},true);
document.addEventListener('sunbot:deal-change',sync,true);
install();sync();
})();