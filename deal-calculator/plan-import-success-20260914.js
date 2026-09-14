// Sunbot Deal Calculator — explicit import success confirmation, hardened 14/09/2026
(function(){
'use strict';
const $=id=>document.getElementById(id);

function hideImportModal(){
  const w=$('planImportModal');
  if(!w)return;
  w.hidden=true;
  w.style.display='none';
}

function restoreImportModal(){
  const w=$('planImportModal');
  if(!w)return;
  w.hidden=false;
  w.style.display='grid';
  setTimeout(()=>$('planImportText')?.focus(),0);
}

function showSuccess(){
  let w=$('planImportSuccessModal');
  const school=String($('planSchoolName')?.value||'').trim();
  if(!w){
    w=document.createElement('div');
    w.id='planImportSuccessModal';
    w.style.cssText='position:fixed;inset:0;z-index:10001;background:#17212b66;display:none;place-items:center;padding:18px';
    w.innerHTML='<div style="width:min(430px,100%);background:#fff;border-radius:20px;padding:24px;box-shadow:0 24px 70px #0004;text-align:center"><div style="width:48px;height:48px;margin:0 auto 12px;border-radius:999px;background:#dcfce7;color:#166534;display:grid;place-items:center;font-size:25px;font-weight:900">✓</div><b style="font-size:19px;color:#17212b">Nạp phương án thành công</b><div id="planImportSuccessText" style="font-size:13px;line-height:1.5;color:#667085;margin:8px 0 18px"></div><button id="planImportSuccessOk" class="softBtn" style="min-width:110px;background:#f97316;color:#fff;border-color:#f97316">OK</button></div>';
    document.body.appendChild(w);
    $('planImportSuccessOk').onclick=()=>{w.hidden=true;w.style.display='none';};
    w.addEventListener('click',e=>{if(e.target===w){w.hidden=true;w.style.display='none';}});
  }
  const msg=$('planImportSuccessText');
  if(msg)msg.textContent=school?`Đã khôi phục phương án của ${school}. Có thể tiếp tục kiểm tra và điều chỉnh trên máy tính.`:'Đã khôi phục phương án. Có thể tiếp tục kiểm tra và điều chỉnh trên máy tính.';
  const t=$('planTransferToast');if(t)t.style.opacity='0';
  w.hidden=false;
  w.style.display='grid';
  setTimeout(()=>$('planImportSuccessOk')?.focus(),0);
}

// Ensure reopening works even after we explicitly set display:none on a previous close.
document.addEventListener('click',e=>{
  if(e.target&&e.target.closest&&e.target.closest('#importPlanBtn')){
    setTimeout(restoreImportModal,0);
  }
},true);

// The main importer only hides its window after parse + apply succeed.
// We wait for that state, force-close the input window, then show a single OK confirmation.
document.addEventListener('click',e=>{
  const btn=e.target&&e.target.closest?e.target.closest('#planImportApply'):null;
  if(!btn)return;
  setTimeout(()=>{
    const importModal=$('planImportModal');
    if(importModal&&importModal.hidden){
      hideImportModal();
      showSuccess();
    }
  },120);
},true);

// ESC closes whichever import-related modal is currently open.
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  const ok=$('planImportSuccessModal');
  if(ok&&ok.style.display!=='none'){ok.hidden=true;ok.style.display='none';return;}
  const input=$('planImportModal');
  if(input&&input.style.display!=='none')hideImportModal();
});
})();