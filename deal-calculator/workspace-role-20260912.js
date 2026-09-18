// Role-scoped view switch for Deal Calculator.
// Role only protects management economics; calculator workflow stays the same for Admin and Sales.
(function(){
  'use strict';
  function setup(){
    const workspace=new URLSearchParams(location.search).get('workspace')||'';
    const internal=document.getElementById('internalView');
    const sale=document.getElementById('saleView');
    const school=document.getElementById('schoolView');
    const switcher=document.querySelector('.viewSwitch');
    if(!switcher)return;

    // Everyone keeps the operational calculator views/actions.
    if(sale){sale.style.display='';sale.textContent='Dành cho kinh doanh';}
    if(school){school.style.display='';school.textContent='Trình nhà trường';}

    if(workspace==='sale'){
      // Sales should not see management-only cost/margin controls.
      if(internal)internal.style.display='none';
      if(sale)sale.click();
      const caption=document.getElementById('viewCaption');
      if(caption)caption.textContent='Dành cho kinh doanh · máy tính phương án nhà trường';
    }else if(workspace==='admin'){
      if(internal){internal.style.display='';internal.textContent='Quản trị';internal.click();}
      const caption=document.getElementById('viewCaption');
      if(caption)caption.textContent='Quản trị nội bộ · máy tính phương án nhà trường';
    }else{
      // Standalone calculator: keep all three views. No role-specific feature stripping.
      if(internal)internal.style.display='';
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(setup,120)});else setTimeout(setup,120);
})();