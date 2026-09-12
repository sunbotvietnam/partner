// Sunbot Deal Calculator policy overlay — 12/09/2026
// Keeps the approved UI intact and adds only the agreed commercial logic.
(function(){
  'use strict';
  let contractScope='same_unit';
  const QA_PER_EXTRA_SITE=5000000;

  function m(n){return typeof mil==='function'?mil(n):(n/1e6).toLocaleString('vi-VN',{maximumFractionDigits:1})+' triệu'}
  function cash(n){return typeof money==='function'?money(n):new Intl.NumberFormat('vi-VN').format(Math.round(n))+'đ'}
  function nval(id,fallback=0){const e=document.getElementById(id);return e?Number(e.value||fallback):fallback}
  function text(id,value){const e=document.getElementById(id);if(e)e.textContent=value}

  function trainingFee(teachers,programCount){
    teachers=Math.max(0,Math.round(Number(teachers)||0));
    if(teachers===0)return 0;
    if(teachers>50)return null;
    const extraBlocks=Math.ceil(Math.max(teachers-20,0)/10);
    return programCount===2 ? 19000000+extraBlocks*7000000 : 11000000+extraBlocks*4000000;
  }

  function addControls(){
    const campus=document.getElementById('campusCount');
    const campusControl=campus&&campus.closest('.control');
    if(campusControl&&!document.getElementById('contractScopeControl')){
      const d=document.createElement('div');
      d.className='control';d.id='contractScopeControl';
      d.innerHTML='<div class="head"><label>Phạm vi đơn vị ký hợp đồng</label><span class="value" id="contractScopeVal">Một đơn vị / nhiều điểm</span></div><div class="buttons two" id="contractScopeButtons"><button class="btn active" data-scope="same_unit">Cùng một trường / đơn vị</button><button class="btn" data-scope="multi_school">Nhiều trường độc lập</button></div><div class="sub" id="contractScopeNote">Cùng pháp nhân/ban giám hiệu/hợp đồng/tài chính: cộng tổng trẻ; mỗi điểm có tối thiểu 1 mô-đun; từ điểm thứ hai thu QA điểm bổ sung.</div>';
      campusControl.insertAdjacentElement('afterend',d);
      d.querySelectorAll('.btn').forEach(b=>b.addEventListener('click',()=>{
        contractScope=b.dataset.scope;
        d.querySelectorAll('.btn').forEach(x=>x.classList.toggle('active',x===b));
        text('contractScopeVal',contractScope==='same_unit'?'Một đơn vị / nhiều điểm':'Nhiều trường độc lập');
        text('contractScopeNote',contractScope==='same_unit'?'Cùng pháp nhân/ban giám hiệu/hợp đồng/tài chính: cộng tổng trẻ; mỗi điểm có tối thiểu 1 mô-đun; từ điểm thứ hai thu QA điểm bổ sung.':'Không được coi các trường độc lập là “điểm” để dùng chung một quyền chương trình. Mỗi trường có phí chương trình riêng hoặc hợp đồng multi-school do CEO duyệt.');
        setTimeout(policyUpdate,0);
      }));
    }

    const assess=document.getElementById('teacherCountControl');
    if(assess&&!document.getElementById('trainingTeacherCountControl')){
      const d=document.createElement('div');
      d.className='control';d.id='trainingTeacherCountControl';
      d.innerHTML='<div class="head"><label>Tổng số giáo viên tham gia đào tạo</label><span class="value" id="trainingTeacherCountVal">10 giáo viên</span></div><input class="range" id="trainingTeacherCount" type="range" min="0" max="60" step="1" value="10"><div class="sub">Tính trên tổng giáo viên của toàn đơn vị ký hợp đồng, không nhân theo số điểm. 1 chương trình: 11 triệu/≤20 GV, +4 triệu mỗi block tối đa 10 GV. 2 chương trình: 19 triệu/≤20 GV, +7 triệu mỗi block. Trên 50 GV: phương án riêng.</div>';
      assess.insertAdjacentElement('beforebegin',d);
      const old=document.getElementById('teacherCount');if(old)old.max='60';
    }

    const programRow=document.getElementById('programFeeOut')?.closest('tr');
    if(programRow&&!document.getElementById('qaSiteRow')){
      const tr=document.createElement('tr');tr.id='qaSiteRow';
      tr.innerHTML='<td>QA điểm triển khai bổ sung (từ điểm thứ 2)</td><td id="qaSiteOut">0 triệu</td>';
      programRow.insertAdjacentElement('afterend',tr);
    }

    const table=document.getElementById('sunbotTotalTable')?.closest('table');
    if(table&&!document.getElementById('multiSitePolicyNote')){
      const d=document.createElement('div');d.id='multiSitePolicyNote';d.className='sub';d.style.marginTop='8px';
      d.textContent='QA điểm bổ sung: 5 triệu/điểm/năm, là phí dịch vụ thường niên và không đưa vào vốn thiết bị. Khảo sát, lắp đặt và vận chuyển tiêu chuẩn không tách phí; điều kiện đặc biệt báo giá riêng.';
      table.insertAdjacentElement('afterend',d);
    }

    // Theo chính sách đã chốt, chỉ vốn thiết bị mới đi vào cơ chế thu hồi vốn 24/36 tháng.
    const rf=document.getElementById('rolloutFundingButtons');
    if(rf){
      const finance=rf.querySelector('[data-rollout="finance"]');
      if(finance){finance.disabled=true;finance.title='Đào tạo và sát hạch thu trực tiếp; không đưa vào vốn thiết bị.';finance.style.opacity='.45'}
      const upfront=rf.querySelector('[data-rollout="upfront"]');
      if(upfront)upfront.classList.add('active');
      if(typeof rolloutFunding!=='undefined')rolloutFunding='upfront';
      const sub=rf.nextElementSibling;if(sub&&sub.classList.contains('sub'))sub.textContent='Đào tạo và sát hạch thu trực tiếp theo quy mô giáo viên; không đưa vào phần vốn thiết bị thu hồi 24/36 tháng.';
    }
  }

  function policyState(){
    const c=nval('children'),cs=nval('classSize',20),f=nval('fee'),l=nval('lessons',4),months=nval('months',9),tr=nval('teacherRate'),points=nval('campusCount',1);
    const manual=nval('classCountInput',0),classes=manual?Math.max(1,Math.round(manual)):Math.ceil(c/cs);
    const trainTeachers=nval('trainingTeacherCount',0),assessTeachers=nval('teacherCount',0);
    const rooms=typeof roomCount==='function'?roomCount(c):Math.max(c<=300?1:c<=800?2:3,points);
    const roomValue=rooms*31700000;
    const sunbotShare=mode==='own'?0:mode==='provide'?1:nval('capitalShare',50)/100;
    const schoolInvest=roomValue*(1-sunbotShare);
    const equipmentSale=mode!=='provide'?schoolInvest:0;
    const extraInvest=mode!=='own'&&extra?roomValue*(nval('extraPct',10)/100):0;
    const basePrincipalRecovery=roomValue*sunbotShare/(term/12);
    const extraPrincipalRecovery=extraInvest/(term/12);
    const principalRecovery=basePrincipalRecovery+extraPrincipalRecovery;
    const capitalRecovery=basePrincipalRecovery*1.3;
    const extraCapitalRecovery=extraPrincipalRecovery*1.3;
    const totalCapitalRecovery=capitalRecovery+extraCapitalRecovery;
    const capitalMargin=totalCapitalRecovery-principalRecovery;
    const programFee=typeof feeByScale==='function'?feeByScale(c,l,months):null;
    const training=launch==='new'?trainingFee(trainTeachers,programs):0;
    const assessment=launch==='new'?assessTeachers*500000*programs:0;
    const qa=contractScope==='same_unit'?Math.max(points-1,0)*QA_PER_EXTRA_SITE:0;
    const lessonRevenue=c*f*l*months*programs;
    const supplementRevenue=c*service*1000*months;
    const totalParentRevenue=lessonRevenue+supplementRevenue;
    const teacherCost=classes*l*months*tr*programs;
    const sunbotServiceFee=c*servicePlans[service].sunbotFeeMonthly*months;
    const schoolServiceShare=supplementRevenue-sunbotServiceFee;
    const other=nval('otherCost',0);
    const blockedReason=contractScope==='multi_school'?'Nhiều trường độc lập cần tách phí chương trình hoặc hợp đồng multi-school do CEO duyệt.':c>800?'Quy mô trên 800 trẻ cần phương án riêng do CEO duyệt.':training===null?'Trên 50 giáo viên cần phương án đào tạo riêng.':'';
    const blocked=Boolean(blockedReason);
    const receipts=blocked?null:programFee+training+assessment+qa+totalCapitalRecovery+sunbotServiceFee;
    const total=blocked?null:receipts+equipmentSale;
    const remain=blocked?null:totalParentRevenue-teacherCost-receipts-schoolInvest-other;
    return {c,cs,f,l,months,tr,points,classes,trainTeachers,assessTeachers,rooms,roomValue,sunbotShare,schoolInvest,equipmentSale,extraInvest,principalRecovery,capitalRecovery,extraCapitalRecovery,totalCapitalRecovery,capitalMargin,programFee,training,assessment,qa,totalParentRevenue,teacherCost,sunbotServiceFee,schoolServiceShare,other,blocked,blockedReason,receipts,total,remain};
  }

  function policyUpdate(){
    if(typeof rolloutFunding!=='undefined')rolloutFunding='upfront';
    const s=policyState();
    text('trainingTeacherCountVal',s.trainTeachers+' giáo viên');
    const tc=document.getElementById('trainingTeacherCountControl');if(tc)tc.hidden=launch==='renew';
    text('qaSiteOut',contractScope==='multi_school'?'Không áp dụng':m(s.qa));
    text('trainingOut',s.training===null?'Phương án riêng':m(s.training));
    text('assessmentOut',m(s.assessment));
    text('rolloutRecoveryOut',m(0));
    const rr=document.getElementById('rolloutRecoveryRow');if(rr)rr.hidden=true;
    const tl=document.getElementById('trainingLabel');if(tl)tl.textContent='Đào tạo khởi tạo theo tổng giáo viên toàn đơn vị';
    const note=document.querySelector('#sunbotTotalTable')?.closest('table')?.nextElementSibling;
    if(note&&note.id==='multiSitePolicyNote')note.textContent=contractScope==='same_unit'?`Phí chương trình tính một lần theo tổng ${s.c.toLocaleString('vi-VN')} trẻ của đơn vị ký hợp đồng. ${s.points} điểm triển khai → ${s.rooms} mô-đun; QA điểm bổ sung ${m(s.qa)}/năm. QA là dịch vụ thường niên, không đưa vào vốn thiết bị. Khảo sát/lắp đặt/vận chuyển tiêu chuẩn không tách phí; điều kiện đặc biệt báo giá riêng.`:'Nhiều trường độc lập không được gộp thành các “điểm” để dùng chung một quyền chương trình. Cần báo giá từng trường hoặc hợp đồng multi-school có phạm vi quyền và sản lượng do CEO duyệt.';

    if(s.blocked){
      text('sunbotTotalOut','Phương án riêng');text('sunbotTotalTable','Phương án riêng');text('remaining','Chưa kết luận');text('schoolLiveSunbot','Đang xây dựng');text('schoolLiveRemaining','Đang xây dựng');
      const rb=document.getElementById('ratioBadge');if(rb){rb.className='badge bad';rb.textContent='Cần duyệt'}
      text('ratioNote',s.blockedReason);
    }else{
      text('sunbotTotalOut',m(s.total));text('sunbotTotalTable',m(s.total));text('remaining',m(s.remain));text('schoolLiveSunbot',m(s.total));text('schoolLiveRemaining',m(s.remain));
      const ratio=s.totalParentRevenue?s.receipts/s.totalParentRevenue:0,rb=document.getElementById('ratioBadge'),bar=document.getElementById('ratioBar');
      if(rb){rb.className='badge';if(ratio<=.10){rb.textContent='Dễ giải thích';rb.classList.add('good')}else if(ratio<=.18){rb.textContent='Cần giải thích rõ';rb.classList.add('mid')}else{rb.textContent='Cần xem lại';rb.classList.add('bad')}}
      if(bar)bar.style.width=Math.min(100,ratio/.30*100)+'%';
      text('ratioNote',ratio<=.10?'Tổng khoản Sunbot thu không vượt 10% doanh thu dự kiến.':ratio<=.18?'Khoản Sunbot chiếm 10–18%; sale cần bóc tách phí chương trình, QA điểm, đào tạo và phần vốn.':'Trên 18%; cần rà lại mức thu, quy mô lớp, thời hạn thu hồi vốn hoặc phạm vi trước khi trình trường.');
    }

    // Cập nhật so sánh 4/6/8 theo cùng logic thương mại.
    const body=document.getElementById('compareBody');
    if(body){body.innerHTML=[4,6,8].map(x=>{const revenue=s.c*s.f*x*s.months*programs+s.c*service*1000*s.months,teacher=s.classes*x*s.months*s.tr*programs,p=typeof feeByScale==='function'?feeByScale(s.c,x,s.months):null;if(s.blocked||p===null)return `<tr><td>${x} tiết/tháng</td><td>${m(revenue)}</td><td>${m(teacher)}</td><td>Phương án riêng</td></tr>`;const receipts=p+s.training+s.assessment+s.qa+s.totalCapitalRecovery+s.sunbotServiceFee,rm=revenue-teacher-receipts-s.schoolInvest-s.other;return `<tr><td>${x} tiết/tháng</td><td>${m(revenue)}</td><td>${m(teacher)}</td><td>${m(rm)}</td></tr>`}).join('')}

    // Chỉ số nội bộ được tính lại để không bị lệch khi thay đổi training/QA.
    if(!s.blocked){
      const serviceCOGS=s.c*servicePlans[service].costYear*s.months/9;
      const programDeliveryCost=(s.programFee||0)*nval('programCostPct')/100;
      const trainingDeliveryCost=(s.training+s.assessment)*nval('trainingCostPct')/100;
      const percentageBase=(s.programFee||0)+s.training+s.assessment+s.qa+s.sunbotServiceFee;
      const entryCost=launch==='new'?percentageBase*nval('entryCostPct')/100:0;
      const renewalCost=launch==='renew'?percentageBase*nval('renewalCostPct')/100:0;
      const salesCost=percentageBase*nval('salesCostPct')/100,relationshipCost=percentageBase*nval('relationshipCostPct')/100,opsCost=percentageBase*nval('opsCostPct')/100;
      const internalCosts=serviceCOGS+s.equipmentSale+programDeliveryCost+trainingDeliveryCost+entryCost+renewalCost+salesCost+relationshipCost+opsCost;
      const contribution=(s.programFee||0)+s.training+s.assessment+s.qa+s.sunbotServiceFee+s.equipmentSale+s.capitalMargin-internalCosts;
      const base=(s.programFee||0)+s.training+s.assessment+s.qa+s.sunbotServiceFee+s.capitalMargin;
      text('sunbotContributionOut',m(contribution));text('liveInternalCost',m(internalCosts));text('liveContribution',m(contribution));text('liveMargin',base?(contribution/base*100).toLocaleString('vi-VN',{maximumFractionDigits:1})+'%':'—');
    }

    const talk=document.getElementById('talkTrack');if(talk)talk.innerHTML=s.blocked?s.blockedReason:`Với ${s.c.toLocaleString('vi-VN')} trẻ, ${s.points} điểm triển khai và ${s.rooms} mô-đun, khoản trường thanh toán Sunbot năm đầu là <b>${m(s.total)}</b>, trong đó QA điểm bổ sung là <b>${m(s.qa)}</b>. Sau các khoản đang tính, trường còn khoảng <b>${m(s.remain)}</b> để trang trải quản lý, thuế và các chi phí khác.`;
  }

  function correctedPlanText(){
    const s=policyState();
    const inv=mode==='own'?`Nhà trường đầu tư toàn bộ cấu hình; thanh toán ban đầu ${cash(s.schoolInvest)}`:mode==='provide'?`Sunbot đầu tư thiết bị; thu hồi phần vốn thiết bị trong ${term} tháng`:`Hai bên cùng đầu tư; Sunbot góp ${Math.round(s.sunbotShare*100)}%; phần vốn thiết bị Sunbot thu hồi trong ${term} tháng`;
    return ['TÓM TẮT PHƯƠNG ÁN TRIỂN KHAI SUNBOT',
      `1. Phạm vi hợp đồng: ${contractScope==='same_unit'?'một đơn vị ký hợp đồng, '+s.points+' điểm triển khai':'nhiều trường độc lập — cần hợp đồng multi-school/CEO duyệt'}.`,
      `2. Quy mô: ${s.c.toLocaleString('vi-VN')} trẻ; ${s.classes} lớp; ${programs} chương trình; ${s.l} tiết/lớp/tháng trong ${s.months} tháng.`,
      `3. Phí chương trình: ${s.programFee===null?'phương án riêng':cash(s.programFee)}; tính theo tổng số trẻ cam kết của đơn vị ký hợp đồng.`,
      `4. Điểm triển khai và thiết bị: ${s.points} điểm; ${s.rooms} mô-đun × 31,7 triệu = ${cash(s.roomValue)}. Số mô-đun = max(chuẩn theo quy mô trẻ, số điểm).`,
      `5. QA điểm bổ sung: ${contractScope==='same_unit'?cash(s.qa)+'/năm':'không áp dụng cách tính gộp'}; từ điểm thứ hai 5 triệu/điểm/năm; không đưa vào vốn thiết bị.`,
      `6. Đào tạo: ${launch==='new'?(s.training===null?'trên 50 GV — phương án riêng':s.trainTeachers+' GV, '+cash(s.training)):'gia hạn — chưa tính tái đào tạo'}; tính tổng GV toàn đơn vị, không nhân theo điểm.`,
      `7. Sát hạch: ${launch==='new'?s.assessTeachers+' GV × '+programs+' chương trình = '+cash(s.assessment):'gia hạn — chưa tính sát hạch lại'}.`,
      `8. Đầu tư thiết bị: ${inv}. Hệ số thu hồi vốn thiết bị 1,30; QA/đào tạo/sát hạch thu trực tiếp.`,
      `9. Tổng nhà trường thanh toán Sunbot năm đầu: ${s.blocked?'phương án riêng — '+s.blockedReason:cash(s.total)}.`,
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