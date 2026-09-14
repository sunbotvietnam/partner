// Sunbot Deal Calculator — explicit import success confirmation, 14/09/2026
(function(){
'use strict';
const $=id=>document.getElementById(id);
function showSuccess(){
  let w=$('planImportSuccessModal');
  const school=String($('planSchoolName')?.value||'').trim();
  if(!w){
    w=document.createElement('div');
    w.id='planImportSuccessModal';
    w.style.cssText='position:fixed;inset:0;z-index:10001;background:#17212b66;display:grid;place-items:center;padding:18px';
    w.innerHTML='<div style="width:min(430px,100%);background:#fff;border-radius:20px;padding:24px;box-shadow:0 24px 70px #0004;text-align:center"><div style="width:48px;height:48px;margin:0 auto 12px;border-radius:999px;background:#dcfce7;color:#166534;display:grid;place-items:center;font-size:25px;font-weight:900">✓</div><b style="font-size:19px;color:#17212b">Nạp phương án thành công</b><div id="planImportSuccessText" style="font-size:13px;line-height:1.5;color:#667085;margin:8px 0 18px"></div><button id="planImportSuccessOk" class="softBtn" style="min-width:110px;background:#f97316;color:#fff;border-color:#f97316">OK</button></div>';
    document.body.appendChild(w);
    $('planImportSuccessOk').onclick=()=>{w.hidden=true;};
  }
  const msg=$('planImportSuccessText');
  if(msg)msg.textContent=school?`Đã khôi phục phương án của ${school}. Có thể tiếp tục kiểm tra và điều chỉnh trên máy tính.`:'Đã khôi phục phương án. Có thể tiếp tục kiểm tra và điều chỉnh trên máy tính.';
  const t=$('planTransferToast');if(t)t.style.opacity='0';
  w.hidden=false;
  setTimeout(()=>$('planImportSuccessOk')?.focus(),0);
}

document.addEventListener('click',e=>{
  const btn=e.target&&e.target.closest?e.target.closest('#planImportApply'):null;
  if(!btn)return;
  setTimeout(()=>{
    const importModal=$('planImportModal');
    // Existing import code hides the import window only after a successful parse/apply.
    if(importModal&&importModal.hidden)showSuccess();
  },90);
},true);
})();