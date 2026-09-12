// Role-scoped view switch for Deal Calculator.
(function(){
  'use strict';
  function setup(){
    const workspace=new URLSearchParams(location.search).get('workspace')||'';
    const internal=document.getElementById('internalView');
    const sale=document.getElementById('saleView');
    const school=document.getElementById('schoolView');
    const switcher=document.querySelector('.viewSwitch');
    if(!switcher)return;
    if(workspace==='sale'){
      if(internal)internal.style.display='none';
      if(sale){sale.textContent='Sale';sale.click();}
      if(school)school.textContent='Trình nhà trường';
      const caption=document.getElementById('viewCaption');if(caption)caption.textContent='Dành cho Sale · phương án nhà trường';
    }else if(workspace==='admin'){
      if(sale)sale.style.display='none';
      if(internal){internal.textContent='Quản trị';internal.click();}
      if(school)school.textContent='Trình nhà trường';
      const caption=document.getElementById('viewCaption');if(caption)caption.textContent='Quản trị nội bộ';
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(setup,120)});else setTimeout(setup,120);
})();
