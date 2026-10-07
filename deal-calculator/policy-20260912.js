// Sunbot Deal Calculator policy overlay — 12/09/2026
// Keeps the approved UI intact and adds only the agreed commercial logic.
(function(){
  'use strict';
  const QA_PER_EXTRA_SITE=5000000;

  function m(n){return typeof mil==='function'?mil(n):(n/1e6).toLocaleString('vi-VN',{maximumFractionDigits:1})+' triệu'}
  function cash(n){return typeof money==='function'?money(n):new Intl.NumberFormat('vi-VN').format(Math.round(n))+'đ'}
  function nval(id,fallback=0){const e=document.getElementById(id);return e?Number(e.value||fallback):fallback}
  function text(id,value){const e=document.getElementById(id);if(e)e.textContent=value}

  function trainingFee(teachers){
    teachers=Math.max(0,Math.round(Number(teachers)||0));
    if(teachers===0)return 0;
    if(teachers>50)return null;
    const extraBlocks=Math.ceil(Math.max(teachers-20,0)/10);
    return 11000000+extraBlocks*4000000;
  }

  function addControls(){
    const assess=document.getElementById('teacherCountControl');
    if(assess&&!document.getElementById('trainingTeacherCountControl')){
      const d=document.createElement('div');
      d.className='control';d.id='trainingTeacherCountControl';
      d.innerHTML='<div class="head"><label>Tổng số giáo viên tham gia đào tạo</label><span class="value" id="trainingTeacherCountVal">10 giáo viên</span></div><input class="range" id="trainingTeacherCount" type="range" min="0" max="60" step="1" value="10"><div class="sub">Tính trên tổng giáo viên của toàn đơn vị ký hợp đồng, không nhân theo số điểm. 1 chương trình: 11 triệu/≤20 GV, +4 triệu cho mỗi nhóm tăng thêm tối đa 10 GV. Trên 50 GV: phương án riêng.</div>';
      assess.insertAdjacentElement('beforebegin',d);
      const old=document.getElementById('teacherCount');if(old)old.max='60';
    }

    const programRow=document.getElementById('programFeeOut')?.closest('tr');
    if(programRow&&!document.getElementById('qaSiteRow')){
      const tr=document.createElement('tr');tr.id='qaSiteRow';
      tr.innerHTML='<td>Phí đồng hành điểm triển khai bổ sung (từ điểm thứ 2)</td><td id="qaSiteOut">0 triệu</td>';
      programRow.insertAdjacentElement('afterend',tr);
    }

    const table=document.getElementById('sunbotTotalTable')?.closest('table');
    if(table&&!document.getElementById('multiSitePolicyNote')){
      const d=document.createElement('div');d.id='multiSitePolicyNote';d.className='sub';d.style.marginTop='8px';
      d.textContent='Điểm thứ 2 trở đi: 5 triệu/điểm/năm, tính theo số tháng triển khai còn lại.';
      table.insertAdjacentElement('afterend',d);
    }

    // Theo chính sách đã chốt, đào tạo và sát hạch luôn thanh toán khi khởi tạo.
    if(typeof rolloutFunding!=='undefined')rolloutFunding='upfront';
  }

  function policyState(){
    const c=nval('children'),cs=nval('classSize',20),f=nval('fee'),l=nval('lessons',4),months=nval('months',9),tr=nval('teacherRate'),points=nval('campusCount',1);
    const manual=nval('classCountInput',0),classes=manual?Math.max(1,Math.round(manual)):Math.ceil(c/cs);
    const trainTeachers=nval('trainingTeacherCount',0),assessTeachers=nval('teacherCount',0);
    const rooms=typeof roomCount==='function'?roomCount(c):Math.max(c<=300?1:c<=800?2:3,points);
    const roomValue=rooms*31700000;
    const sunbotShare=mode==='provide'?1:0;
    const schoolInvest=roomValue*(1-sunbotShare);
    const equipmentSale=mode!=='provide'?schoolInvest:0;
    const extraInvest=mode!=='own'&&extra?Math.max(0,nval('extraAmount',0)):0;
    const basePrincipalRecovery=roomValue*sunbotShare/(term/12);
    const extraPrincipalRecovery=extraInvest/(term/12);
    const principalRecovery=basePrincipalRecovery+extraPrincipalRecovery;
    const capitalRecovery=basePrincipalRecovery*1.3;
    const extraCapitalRecovery=extraPrincipalRecovery*1.3;
    const totalCapitalRecovery=capitalRecovery+extraCapitalRecovery;
    const capitalMargin=totalCapitalRecovery-principalRecovery;
    const programFee=typeof feeByScale==='function'?feeByScale(c,l,months):null;
    const training=trainingFee(trainTeachers);
    const assessment=assessTeachers*500000;
    const qa=Math.max(points-1,0)*QA_PER_EXTRA_SITE*months/9;
    const lessonRevenue=c*f*l*months;
    const totalParentRevenue=lessonRevenue;
    const teacherCost=classes*l*months*tr;
    const other=nval('otherCost',0);
    const blockedReason=c>800?'Quy mô trên 800 trẻ cần phương án riêng do CEO duyệt.':training===null?'Trên 50 giáo viên cần phương án đào tạo riêng.':'';
    const blocked=Boolean(blockedReason);
    const receipts=blocked?null:programFee+training+assessment+qa+totalCapitalRecovery;
    const total=blocked?null:receipts+equipmentSale;
    const remain=blocked?null:totalParentRevenue-teacherCost-receipts-schoolInvest-other;
    return {c,cs,f,l,months,tr,points,classes,trainTeachers,assessTeachers,rooms,roomValue,sunbotShare,schoolInvest,equipmentSale,extraInvest,principalRecovery,capitalRecovery,extraCapitalRecovery,totalCapitalRecovery,capitalMargin,programFee,training,assessment,qa,totalParentRevenue,teacherCost,other,blocked,blockedReason,receipts,total,remain};
  }

  function policyUpdate(){
    if(typeof rolloutFunding!=='undefined')rolloutFunding='upfront';
    const s=policyState();
    text('trainingTeacherCountVal',s.trainTeachers+' giáo viên');
    const tc=document.getElementById('trainingTeacherCountControl');if(tc)tc.hidden=false;
    text('qaSiteOut',m(s.qa));
    text('trainingOut',s.training===null?'Phương án riêng':m(s.training));
    text('assessmentOut',m(s.assessment));
    text('rolloutRecoveryOut',m(0));
    const rr=document.getElementById('rolloutRecoveryRow');if(rr)rr.hidden=true;
    const tl=document.getElementById('trainingLabel');if(tl)tl.textContent='Đào tạo giáo viên';
    const note=document.querySelector('#sunbotTotalTable')?.closest('table')?.nextElementSibling;
    if(note&&note.id==='multiSitePolicyNote')note.textContent=`${s.points} điểm triển khai → ${s.rooms} bộ học cụ lõi; phí điểm bổ sung ${m(s.qa)}.`;

    if(s.blocked){
      text('sunbotTotalOut','Phương án riêng');
      text('sunbotTotalTable','Phương án riêng');
      text('remaining','Chưa kết luận');
      text('schoolLiveSunbot','Đang xây dựng');
      text('schoolLiveRemaining','Đang xây dựng');
      const rb=document.getElementById('ratioBadge');if(rb){rb.className='badge bad';rb.textContent='Cần duyệt'}
      text('ratioNote',s.blockedReason);
      const talk=document.getElementById('talkTrack');if(talk)talk.textContent=s.blockedReason;
    }

  }

  function correctedPlanText(){
    const s=policyState();
    const inv=mode==='provide'?`Sunbot đầu tư bộ học cụ cần bổ sung; hoàn trả phần vốn thiết bị trong ${term} tháng`:`Nhà trường đầu tư bộ học cụ cần bổ sung; thanh toán ban đầu ${cash(s.schoolInvest)}`;
    return ['TÓM TẮT PHƯƠNG ÁN TRIỂN KHAI SUNBOT',
      `1. Phạm vi: một đơn vị ký hợp đồng, ${s.points} điểm triển khai.`,
      `2. Quy mô: ${s.c.toLocaleString('vi-VN')} trẻ; ${s.classes} lớp; ${programs} chương trình; ${s.l} tiết/lớp/tháng trong ${s.months} tháng.`,
      `3. Phí chương trình: ${s.programFee===null?'phương án riêng':cash(s.programFee)}; tính theo tổng số trẻ cam kết của đơn vị ký hợp đồng.`,
      `4. Điểm triển khai và thiết bị: ${s.points} điểm; ${s.rooms} mô-đun × 31,7 triệu = ${cash(s.roomValue)}. Số bộ học cụ lõi = max(chuẩn theo quy mô trẻ, số điểm).`,
      `5. Phí đồng hành điểm bổ sung: ${cash(s.qa)}; chuẩn 5 triệu/điểm/năm và quy đổi theo số tháng triển khai còn lại; không đưa vào vốn thiết bị.`,
      `6. Đào tạo: ${(s.training===null?'trên 50 GV — phương án riêng':s.trainTeachers+' GV, '+cash(s.training))}; tính tổng GV toàn đơn vị, không nhân theo điểm.`,
      `7. Sát hạch: ${s.assessTeachers+' GV × 1 chương trình = '+cash(s.assessment)}.`,
      `8. Đầu tư thiết bị: ${inv}. Hệ số thu hồi vốn thiết bị 1,30; QA/đào tạo/sát hạch thu trực tiếp.`,
      `9. Thanh toán Sunbot trong năm học: ${s.blocked?'phương án riêng — '+s.blockedReason:cash(s.total)}.`,
      '10. Khảo sát, lắp đặt và vận chuyển tiêu chuẩn không tách phí; công tác hoặc điều kiện đặc biệt báo giá riêng và duyệt trước.'
    ].join('\n');
  }

  addControls();
  if(typeof planText!=='undefined')planText=correctedPlanText;
  document.addEventListener('input',()=>setTimeout(policyUpdate,0));
  document.addEventListener('click',()=>setTimeout(policyUpdate,0));
  window.addEventListener('load',()=>setTimeout(policyUpdate,0));
  setTimeout(policyUpdate,0);
})();