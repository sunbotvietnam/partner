// Sunbot Deal Calculator — wording and policy clarity overlay, 14/09/2026
// Copy-only layer. Does not alter approved pricing, formulas, IDs, role logic or commercial arithmetic.
(function(){
  'use strict';
  const SITE_FEE_NAME='Phí đồng hành điểm triển khai bổ sung';

  function cleanText(value){
    return String(value||'')
      .replace(/QA điểm triển khai bổ sung/g,SITE_FEE_NAME)
      .replace(/QA điểm bổ sung/g,SITE_FEE_NAME)
      .replace(/QA điểm/g,'đồng hành điểm')
      .replace(/\bQA\b/g,'đảm bảo chất lượng')
      .replace(/Mentoring/gi,'Đồng hành chuyên môn')
      .replace(/Commercial Snapshot/gi,'Phương án thương mại đã chốt')
      .replace(/commercial snapshot/gi,'phương án thương mại đã chốt')
      .replace(/Margin/gi,'Biên lợi nhuận')
      .replace(/Recovery target/gi,'Mục tiêu thu hồi đầu tư')
      .replace(/Recovery/gi,'Thu hồi đầu tư')
      .replace(/Broker fee/gi,'Phí đối tác giới thiệu')
      .replace(/Dành cho sale/g,'Dành cho kinh doanh')
      .replace(/Sale đi theo 7 bước/g,'Quy trình tư vấn 7 bước')
      .replace(/Sale gửi Admin/g,'Kinh doanh gửi quản trị')
      .replace(/Sale gửi admin/g,'Kinh doanh gửi quản trị')
      .replace(/Admin/gi,'Quản trị')
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

    // School-facing microcopy: wording only, no change to values or calculations.
    if(document.body.classList.contains('school-view')){
      const caption=document.getElementById('viewCaption');
      if(caption)caption.textContent='Phương án triển khai dành cho nhà trường';
      const heroTitle=document.getElementById('heroTitle');
      if(heroTitle)heroTitle.textContent='Nhìn rõ quy mô triển khai, nguồn lực và chi phí trước khi quyết định.';
      const heroText=document.getElementById('heroText');
      if(heroText)heroText.textContent='Phương án được tính từ số trẻ, số lớp, tần suất học, nhân sự và cấu hình đầu tư thực tế. Nhà trường có thể so sánh các lựa chọn triển khai theo cùng một cách tính minh bạch.';
    }

    // Keep internal IDs unchanged because pricing and workflow overlays use them for recalculation.
    const row=document.getElementById('qaSiteRow');
    if(row){
      const first=row.querySelector('td');
      if(first)first.textContent=SITE_FEE_NAME+' (từ điểm thứ 2)';
    }

    const note=document.getElementById('multiSitePolicyNote');
    if(note){
      note.textContent=cleanText(note.textContent);
      if(!/được cộng trực tiếp/i.test(note.textContent) && !/Nhiều trường độc lập/i.test(note.textContent)){
        note.textContent += ' Khoản này được cộng trực tiếp vào tổng số tiền nhà trường thanh toán Sunbot trong năm, không đưa vào vốn thiết bị.';
      }
    }
  }

  // Keep copied summaries consistent with the interface wording only.
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
