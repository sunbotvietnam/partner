// Sunbot Deal Calculator V28 — simplify supplementary services wording, 17/09/2026
(function(){
'use strict';
const $=id=>document.getElementById(id);
let raf=0;

function simplifySupplementaryServices(){
  // Remove all legacy fee/revenue-share presentation. Supplementary services are advisory only.
  ['wholesaleControl','schoolServiceShareControl','serviceCostControl','serviceCostNote'].forEach(id=>{
    const e=$(id); if(e) e.remove();
  });
  ['serviceFeeRow','wholesaleRevenueOut','schoolServiceShareOut','serviceGrossOut'].forEach(id=>{
    const e=$(id); const row=e?.closest?.('tr'); if(row) row.remove();
  });

  const note=$('supplementPolicyV27');
  if(note){
    note.innerHTML='<h4>Khuyến nghị để trải nghiệm của trẻ đầy đủ hơn</h4><p>Đây là <b>ngân sách trải nghiệm bổ sung, không bắt buộc</b> và nằm ngoài phí chương trình cốt lõi. Sunbot cung cấp tiêu chuẩn gợi ý cho từng mức; nhà trường có thể tự tổ chức hoặc đặt mua từng hạng mục từ Sunbot, ví dụ kit mang về theo tháng, in chứng nhận cứng, thi đua – khen thưởng, mini-project và sự kiện lớn/nhỏ. Nhà trường chủ động quyết định nguồn thực hiện phù hợp với kế hoạch của mình.</p>';
  }

  // Remove any leftover school-facing labels/text from older layers.
  document.querySelectorAll('body *').forEach(el=>{
    if(el.children.length) return;
    const t=String(el.textContent||'').trim();
    if(t==='Mức phí dịch vụ Sunbot' || t==='Phần nhà trường giữ lại' || t==='Giá vốn thực hiện dự kiến của Sunbot') el.remove();
  });
}

function cleanSummaryText(text){
  return String(text||'')
    .replace(/\s*Đây không phải khoản chia mặc định 70\/30;\s*/gi,' ')
    .replace(/\s*App không mặc định chia doanh thu 70\/30\.?\s*/gi,' ')
    .replace(/;\s*nhà trường giữ 30%/gi,'')
    .replace(/;\s*mức phí dịch vụ Sunbot[^.\n]*/gi,'')
    .replace(/\s{2,}/g,' ')
    .replace(/ \n/g,'\n');
}

function installSummaryCleaner(){
  if(typeof planText==='function' && !planText.__v28clean){
    const previous=planText;
    const wrapped=function(){return cleanSummaryText(previous())};
    wrapped.__v28clean=true;
    planText=wrapped;
  }
}

function refresh(){
  simplifySupplementaryServices();
  installSummaryCleaner();
}
function schedule(){
  if(raf)return;
  raf=requestAnimationFrame(()=>{raf=0;refresh()});
}

document.addEventListener('input',schedule,true);
document.addEventListener('change',schedule,true);
document.addEventListener('click',schedule,true);
const observer=new MutationObserver(schedule);
observer.observe(document.body,{subtree:true,childList:true,characterData:true});
refresh();
})();