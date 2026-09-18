// Sunbot Deal Calculator regression tests — commercial oracle, 18/09/2026
// Not loaded by production UI. Run with: node deal-calculator/regression-tests-20260918.mjs
import assert from 'node:assert/strict';

const MONTHS_LEFT={9:9,10:8,11:7,12:6,1:5,2:4,3:3,4:2,5:1};
const MOD=31_700_000;
const SITE=5_000_000;

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
  const share=x.mode==='own'?0:x.mode==='provide'?1:x.share/100;
  const schoolInvest=roomValue*(1-share);
  const extraInvest=x.mode!=='own'&&x.extra?roomValue*x.extraPct/100:0;
  const pf=programFee(x.children,x.lessons,months);
  const training=x.launch==='new'?trainingFee(x.trainingTeachers):0;
  const assessment=x.launch==='new'?x.assessmentTeachers*500000:0;
  const site=x.scope==='same_unit'?Math.max(x.points-1,0)*SITE*months/9:null;
  const blocked=x.scope!=='same_unit'||x.children>800||training===null;
  if(blocked)return {blocked:true};

  const directEquipment=x.mode!=='provide'&&x.source==='sunbot'?schoolInvest:0;
  const externalEquipment=x.mode!=='provide'&&x.source!=='sunbot'?schoolInvest:0;
  const financedCapital=roomValue*share+extraInvest;
  const equipmentTotal=Math.round(financedCapital*1.30);
  const installmentCount=equipmentTotal?x.term/6:0;
  const installments=[];
  if(installmentCount){
    const base=Math.floor(equipmentTotal/installmentCount);
    for(let i=0;i<installmentCount;i++){
      installments.push(i===installmentCount-1?equipmentTotal-base*(installmentCount-1):base);
    }
  }
  const equipmentDueCurrent=installments.reduce((sum,v,i)=>sum+(i*6<months?v:0),0);
  const serviceYearTotal=pf+site+training+assessment;
  const totalDueCurrent=serviceYearTotal+directEquipment+equipmentDueCurrent;
  const revenue=x.children*x.fee*x.lessons*months;
  const teacherCost=classes*x.lessons*months*x.teacherRate;
  const remain=revenue-teacherCost-totalDueCurrent-externalEquipment-x.other;
  return {blocked:false,months,classes,rooms,roomValue,share,schoolInvest,pf,site,training,assessment,
    directEquipment,externalEquipment,financedCapital,equipmentTotal,installmentCount,installments,
    equipmentDueCurrent,serviceYearTotal,totalDueCurrent,revenue,teacherCost,remain};
}
const D={children:300,classSize:25,classCount:0,points:1,fee:25000,lessons:4,start:9,
  teacherRate:120000,trainingTeachers:10,assessmentTeachers:10,launch:'new',
  mode:'own',share:50,term:24,source:'sunbot',extra:false,extraPct:10,scope:'same_unit',other:0};

const vinh=calculate({...D,children:450,points:2,lessons:8,mode:'provide',term:36});
assert.equal(vinh.pf,96_700_000);
assert.equal(vinh.roomValue,63_400_000);
assert.equal(vinh.equipmentTotal,82_420_000);
assert.equal(vinh.installmentCount,6);
assert.equal(vinh.equipmentDueCurrent,27_473_332);
assert.equal(vinh.totalDueCurrent,145_173_332);
assert.equal(vinh.revenue,810_000_000);
assert.equal(vinh.teacherCost,155_520_000);
assert.equal(vinh.remain,509_306_668);

const renew=calculate({...D,children:300,launch:'renew'});
assert.equal(renew.training,0);
assert.equal(renew.assessment,0);

const oct=calculate({...D,children:450,points:2,lessons:4,start:10});
assert.equal(oct.months,8);
assert.equal(oct.site,5_000_000*8/9);

const dec36=calculate({...D,children:450,points:2,lessons:8,start:12,mode:'provide',term:36});
assert.equal(dec36.months,6);
assert.equal(dec36.equipmentDueCurrent,dec36.installments[0]);

assert.equal(calculate({...D,children:150}).pf,27_000_000);
assert.equal(calculate({...D,children:151}).pf,27_144_000);
assert.equal(calculate({...D,children:300}).pf,48_600_000);
assert.equal(calculate({...D,children:301}).pf,48_708_000);
assert.equal(calculate({...D,children:450,points:3}).rooms,3);
assert.equal(calculate({...D,children:801}).blocked,true);

const custom=calculate({...D,children:450,points:2,mode:'custom',share:50,term:36});
assert.equal(custom.financedCapital,31_700_000);
assert.equal(custom.schoolInvest,31_700_000);
assert.equal(custom.equipmentTotal,41_210_000);

// Broad invariant matrix: 10,368 scenarios.
let count=0;
for(const children of [80,150,151,300,301,450,800,801])
for(const lessons of [4,6,8])
for(const start of [9,10,12,1,3,5])
for(const mode of ['own','provide','custom'])
for(const term of [24,36])
for(const points of [1,2,3])
for(const launch of ['new','renew'])
for(const source of ['sunbot','school']){
  const r=calculate({...D,children,lessons,start,mode,term,points,launch,source});
  count++;
  if(children>800){assert.equal(r.blocked,true);continue;}
  assert.equal(r.blocked,false);
  assert.equal(r.rooms,Math.max(children<=300?1:2,points));
  if(launch==='renew'){assert.equal(r.training,0);assert.equal(r.assessment,0);}
  if(mode==='provide'){assert.equal(r.schoolInvest,0);assert.equal(r.directEquipment,0);assert.equal(r.externalEquipment,0);}
  if(mode==='own')assert.equal(r.equipmentTotal,0);
  assert.equal(r.totalDueCurrent,r.pf+r.site+r.training+r.assessment+r.directEquipment+r.equipmentDueCurrent);
  assert.equal(r.remain,r.revenue-r.teacherCost-r.totalDueCurrent-r.externalEquipment);
}
assert.equal(count,10368);
console.log('PASS',count,'matrix scenarios + golden cases');
