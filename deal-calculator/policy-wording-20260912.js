// Sunbot Deal Calculator — wording and policy clarity overlay, 12/09/2026
// Does not alter the approved layout or commercial arithmetic.
(function(){
  'use strict';
  const SITE_FEE_NAME='Phí đồng hành điểm triển khai bổ sung';

  function cleanText(value){
    return String(value||'')
      .replace(/QA điểm triển khai bổ sung/g,SITE_FEE_NAME)
      .replace(/QA điểm bổ sung/g,SITE_FEE_NAME)
      .replace(/QA điểm/g,'đồng hành điểm')
      .replace(/\bQA\b/g,'kiểm tra chất lượng')
      .replace(/multi-school/g,'nhiều trường')
      .replace(/tivi\/máy chiếu hoặc thiết bị hiển thị bài giảng số; điều hòa; bàn ghế, giá kệ và nội thất mầm non;/gi,'tivi/máy chiếu hoặc thiết bị hiển thị bài giảng số; bàn ghế, giá kệ và nội thất mầm non;')
      .replace(/thiết bị hiển thị, điều hòa, bàn ghế, giá kệ, nội thất/gi,'thiết bị hiển thị, bàn ghế, giá kệ, nội thất')
      .replace(/thiết bị hiển thị, điều hòa, giá kệ/gi,'thiết bị hiển thị, giá kệ')
      .replace(/thiết bị hiển thị bài giảng số, điều hòa, bàn ghế, giá kệ, nội thất mầm non/gi,'thiết bị hiển thị bài giảng số, bàn ghế, giá kệ, nội thất mầm non')
      .replace(/, điều hòa,/gi,',')
      .replace(/; điều hòa;/gi,';');
  }

  function normalizeVisibleText(){
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];let node;
    while((node=walker.nextNode()))nodes.push(node);
    nodes.forEach(n=>{const next=cleanText(n.nodeValue);if(next!==n.nodeValue)n.nodeValue=next});

    const row=document.getElementById('qaSiteRow');
    if(row){
      const first=row.querySelector('td');
      if(first)first.textContent=SITE_FEE_NAME+' (từ điểm thứ 2)';
      row.id='siteSupportFeeRow';
    }

    const feeOut=document.getElementById('qaSiteOut');
    if(feeOut)feeOut.id='siteSupportFeeOut';

    const note=document.getElementById('multiSitePolicyNote');
    if(note){
      note.textContent=cleanText(note.textContent);
      if(!/được cộng trực tiếp/i.test(note.textContent) && !/Nhiều trường độc lập/i.test(note.textContent)){
        note.textContent += ' Khoản này được cộng trực tiếp vào tổng số tiền nhà trường thanh toán Sunbot trong năm, không đưa vào vốn thiết bị.';
      }
    }
  }

  // Keep copied summaries consistent with the interface wording.
  if(typeof planText==='function'){
    const oldPlanText=planText;
    planText=function(){return cleanText(oldPlanText())};
  }

  function schedule(){setTimeout(normalizeVisibleText,0);setTimeout(normalizeVisibleText,60)}
  document.addEventListener('input',schedule,true);
  document.addEventListener('change',schedule,true);
  document.addEventListener('click',schedule,true);

  const observer=new MutationObserver(schedule);
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  schedule();
})();
