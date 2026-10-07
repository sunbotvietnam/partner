// Sunbot Deal Calculator regression tests — V43 QC, 07/10/2026
import assert from 'node:assert/strict';

const MONTHS_LEFT={9:9,10:8,11:7,12:6,1:5,2:4,3:3,4:2,5:1};
const MOD=31_700_000, SITE=5_000_000;

function programFee(c,l,m){
  if(c>800)return null;
  const base={4:27e6,6:33e6,8:40e6}[l];
  const t151={4:16000,6:20000,8:24000}[l];
  const t301={4:12000,6:15000,8:18000}[l];
  const full=base+Math.max(0,Math.min(c,300)-150)*t151*9+Math.max(0,c-300)*t301*9;
  return full*m/9;
}
function trainingFee(t){
  t=Math.max(0,Math.round(Number(t)||0));
  if(!t)return 0;
  if(t>50)return null;
  return 11e6+Math.ceil(Math.max(t-20,0)/10)*4e6;
}
function calculate(x){
  const months=MONTHS_LEFT[x.start];
  const classes=x.classCount||Math.ceil(x.children/x.classSize);
  const rooms=Math.max(x.children<=300?1:x.children<=800?2:3,x.points);
  const roomValue=rooms*MOD;
  const pf=programFee(x.children,x.lessons,months);
  const training=trainingFee(x.trainingTeachers);
  const assessment=x.assessmentTeachers*500000;
  const site=x.scope==='same_unit'?Math.max(x.points-1,0)*SITE*months/9:null;
  const blocked=x.scope!=='same_unit'||x.children>800||training===null;
  if(blocked)return {blocked:true};

  const share=x.mode==='provide'?1:0;
  const schoolInvest=roomValue*(1-share);
  const directEquipment=x.mode==='own'?schoolInvest:0;
  const financedCapital=x.mode==='provide'?roomValue+Math.max(0,x.extraAmount||0):0;
  const equipmentTotal=Math.round(financedCapital*1.30);
  const installmentCount=equipmentTotal?x.term/6:0;
  const installments=[];
  if(installmentCount){
    const base=Math.floor(equipmentTotal/installmentCount);
    for(let i=0;i<installmentCount;i++){
      installments.push({offset:i*6,amount:i===installmentCount-1?equipmentTotal-base*(installmentCount-1):base});
    }
  }
  const equipmentDueCurrent=installments.filter(v=>v.offset<months).reduce((s,v)=>s+v.amount,0);
  const serviceYearTotal=pf+site+training+assessment;
  const totalDueCurrent=serviceYearTotal+directEquipment+equipmentDueCurrent;
  const revenue=x.children*x.fee*x.lessons*months;
  const teacherCost=classes*x.lessons*months*x.teacherRate;
  const remain=revenue-teacherCost-totalDueCurrent-x.other;
  return {blocked:false,months,classes,rooms,roomValue,pf,training,assessment,site,share,schoolInvest,directEquipment,
    financedCapital,equipmentTotal,installmentCount,installments,equipmentDueCurrent,serviceYearTotal,totalDueCurrent,revenue,teacherCost,remain};
}

const D={children:300,classSize:25,classCount:0,points:1,fee:27500,lessons:4,start:9,
  teacherRate:120000,trainingTeachers:10,assessmentTeachers:10,mode:'own',term:24,
  extraAmount:0,scope:'same_unit',other:0};

assert.equal(calculate({...D,children:150}).pf,27_000_000);
assert.equal(calculate({...D,children:151}).pf,27_144_000);
assert.equal(calculate({...D,children:300}).pf,48_600_000);
assert.equal(calculate({...D,children:301}).pf,48_708_000);
assert.equal(calculate({...D,children:500}).rooms,2);
assert.equal(calculate({...D,children:300,points:3}).rooms,3);
assert.equal(calculate({...D,children:801}).blocked,true);

const jan3=calculate({...D,points:3,start:1});
assert.equal(jan3.months,5);
assert.equal(Math.round(jan3.site),5_555_556);

const own=calculate({...D,children:300,mode:'own'});
assert.equal(own.schoolInvest,31_700_000);
assert.equal(own.directEquipment,31_700_000);
assert.equal(own.equipmentTotal,0);

const provide24=calculate({...D,children:300,mode:'provide',term:24});
assert.equal(provide24.schoolInvest,0);
assert.equal(provide24.financedCapital,31_700_000);
assert.equal(provide24.equipmentTotal,41_210_000);
assert.equal(provide24.installmentCount,4);
assert.equal(provide24.equipmentDueCurrent,20_605_000);

const provide36Jan=calculate({...D,children:300,mode:'provide',term:36,start:1,extraAmount:20_000_000});
assert.equal(provide36Jan.financedCapital,51_700_000);
assert.equal(provide36Jan.equipmentTotal,67_210_000);
assert.equal(provide36Jan.installmentCount,6);
assert.equal(provide36Jan.equipmentDueCurrent,provide36Jan.installments[0].amount);

assert.equal(calculate({...D,trainingTeachers:20}).training,11_000_000);
assert.equal(calculate({...D,trainingTeachers:21}).training,15_000_000);
assert.equal(calculate({...D,trainingTeachers:31}).training,19_000_000);
assert.equal(calculate({...D,trainingTeachers:51}).blocked,true);

let count=0;
for(const children of [80,150,151,300,301,450,800,801])
for(const lessons of [4,6,8])
for(const start of [9,10,11,12,1,2,3,4,5])
for(const mode of ['own','provide'])
for(const term of [24,36])
for(const points of [1,2,3,5]){
  const x=calculate({...D,children,lessons,start,mode,term,points});
  count++;
  if(children>800){assert.equal(x.blocked,true);continue;}
  assert.equal(x.blocked,false);
  assert.equal(x.rooms,Math.max(children<=300?1:2,points));
  assert.equal(x.site,Math.max(points-1,0)*SITE*x.months/9);
  assert.equal(x.totalDueCurrent,x.serviceYearTotal+x.directEquipment+x.equipmentDueCurrent);
  assert.equal(x.remain,x.revenue-x.teacherCost-x.totalDueCurrent);
  if(mode==='own'){assert.equal(x.equipmentTotal,0);assert.equal(x.schoolInvest,x.roomValue);}
  if(mode==='provide'){assert.equal(x.schoolInvest,0);assert.equal(x.directEquipment,0);}
}
assert.equal(count,3456);
console.log('PASS',count,'V43 matrix scenarios + golden cases');
