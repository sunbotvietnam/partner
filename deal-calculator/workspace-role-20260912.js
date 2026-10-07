// Role-scoped behavior for Máy tính phương án Sunbot — QC 07/10/2026
(function(){
'use strict';
function setup(){
  const workspace=new URLSearchParams(location.search).get('workspace')||'';
  const internal=document.getElementById('internalView');
  const school=document.getElementById('schoolView');
  if(!internal||!school)return;

  internal.textContent='Tính phương án';
  school.textContent='Trình nhà trường';

  if(workspace==='sale'){
    document.body.classList.add('sale-workspace');
    internal.style.display='';
    school.style.display='';
    internal.click();
    document.querySelectorAll('.internal-only').forEach(el=>el.style.display='none');
    const caption=document.getElementById('viewCaption');
    if(caption)caption.textContent='Dùng để lập phương án tư vấn triển khai tại trường';
  }else{
    document.body.classList.remove('sale-workspace');
    document.querySelectorAll('.internal-only').forEach(el=>el.style.display='');
    internal.style.display='';
    school.style.display='';
    internal.click();
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(setup,120));
else setTimeout(setup,120);
})();