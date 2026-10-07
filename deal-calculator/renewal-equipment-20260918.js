// Sunbot Deal Calculator — renewal core-kit policy, V42
(function(){
'use strict';
const $=id=>document.getElementById(id);
function isRenew(){try{return typeof launch!=='undefined'&&launch==='renew'}catch(e){return document.querySelector('#launchButtons .btn.active')?.dataset.launch==='renew'}}
function requiredKits(){
  const children=Number($('children')?.value||0);
  const points=Math.max(1,Number($('campusCount')?.value||1));
  if(typeof roomCount==='function')return roomCount(children);
  return Math.max(children<=300?1:children<=800?2:3,points);
}
function existingKits(){return Math.max(0,Math.round(Number($('existingCoreKits')?.value||0)))}
function kitsToAdd(){return isRenew()?Math.max(0,requiredKits()-existingKits()):requiredKits()}
function install(){
  if($('renewalEquipmentControl'))return;
  const inv=$('investmentButtons'); if(!inv)return;
  const d=document.createElement('div');
  d.id='renewalEquipmentControl';d.className='control';d.hidden=true;
  d.innerHTML='<div class="head"><label>Số bộ học cụ lõi hiện trường đang có</label><span class="value" id="existingCoreKitsVal">0 bộ</span></div><input class="input" id="existingCoreKits" type="number" min="0" max="20" step="1" value="0"><div class="sub" id="renewalEquipmentNote">Máy tính sẽ tự so sánh số bộ hiện có với số bộ cần theo quy mô trẻ và số điểm triển khai.</div>';
  const label=inv.previousElementSibling;
  if(label)label.insertAdjacentElement('beforebegin',d); else inv.insertAdjacentElement('beforebegin',d);
  $('existingCoreKits').addEventListener('input',()=>{sync();try{document.dispatchEvent(new CustomEvent('sunbot:deal-change'))}catch(e){}});
}
function setVisible(el,show){if(!el)return;el.style.display=show?'':'none'}
function sync(){
  install();
  const renew=isRenew(),required=requiredKits();
  const control=$('renewalEquipmentControl');if(control)control.hidden=!renew;
  const input=$('existingCoreKits');
  if(renew&&input&&!input.dataset.initialized){
    input.value=required;
    input.dataset.initialized='1';
  }
  const existing=existingKits(),add=kitsToAdd();
  const val=$('existingCoreKitsVal');if(val)val.textContent=existing+' bộ';
  const note=$('renewalEquipmentNote');
  if(note)note.textContent=add>0
    ?`Phương án hiện cần ${required} bộ; trường có ${existing} bộ → cần bổ sung ${add} bộ học cụ lõi.`
    :`Phương án hiện cần ${required} bộ; trường có ${existing} bộ → chưa cần đầu tư thêm bộ học cụ lõi.`;
  const inv=$('investmentButtons'),label=inv?.previousElementSibling,noteInv=inv?.nextElementSibling;
  const showInvestment=!renew||add>0;
  setVisible(inv,showInvestment);
  if(label&&label.id!=='renewalEquipmentControl')setVisible(label,showInvestment);
  if(noteInv&&noteInv.classList?.contains('sub'))setVisible(noteInv,showInvestment);
  const options=$('sunbotCapitalOptions');
  if(options)options.hidden=!showInvestment||document.querySelector('#investmentButtons .btn.active')?.dataset.mode!=='provide';
  const sourceButtons=$('equipmentSourceButtons');
  if(sourceButtons){const box=sourceButtons.closest('.control')||sourceButtons.parentElement;setVisible(box,showInvestment);}
  document.body.classList.toggle('renew-existing-equipment',renew&&add===0);
}
function legacyMode(){return kitsToAdd()>0?'add':'existing'}
function setLegacyMode(value){
  install();
  const input=$('existingCoreKits');if(!input)return;
  const required=requiredKits();
  input.value=value==='add'?Math.max(0,required-1):required;
  input.dataset.initialized='1';
  sync();
}
window.SunbotRenewalEquipmentMode=legacyMode;
window.SunbotSetRenewalEquipmentMode=setLegacyMode;
window.SunbotRenewalKitsToAdd=kitsToAdd;
document.addEventListener('input',e=>{if(e.target?.matches?.('#children,#campusCount,#existingCoreKits'))setTimeout(sync,0)},true);
document.addEventListener('click',e=>{if(e.target?.closest?.('#launchButtons .btn')||e.target?.closest?.('#investmentButtons .btn'))setTimeout(sync,0)},true);
document.addEventListener('sunbot:deal-change',sync,true);
install();sync();
})();