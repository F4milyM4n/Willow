{
// ---------- program data ----------
const TIERS={h:{n:'Fired up',d:'Heavy, low reps, long rests. Your strongest work.'},s:{n:'Steady',d:'Moderate weight, medium reps. A solid normal day.'},t:{n:'Tired',d:'Lighter weight, higher reps. Glute work and movement, low stress.'}};
// Loads come from Epley: weight = e1RM/(1+(reps+cushion)/30), as % of TM (TM = 0.9 x e1RM).
//  h: 4x3, ~2 reps cushion -> .857 e1RM = 95% TM   s: 4x6, ~3 cushion -> .769 = 85% TM   t: 3x12, ~4 cushion -> .652 = 72.5% TM
// On h and s the LAST set is as-many-as-possible; only that set updates the estimate, assumed taken to failure (0 in reserve).
const SCH={h:{sets:4,reps:3,pct:.95,cush:2,lo:5,hi:8},s:{sets:4,reps:6,pct:.85,cush:3,lo:8,hi:12},t:{sets:3,reps:12,pct:.725,cush:4,lo:12,hi:15}};
const GROUPS=[['Glutes','The most direct butt builders — little thigh growth'],['Hinge','Glutes and hamstrings'],['Squat','Squats and lunges — these also build the thighs'],['Push',''],['Pull','Rings and rows'],['Grip and trunk','Grip for the gi, a strong brace for everything else']];
const BASE_EX=[
{id:'hipthrust',n:'Barbell hip thrust',p:'Glutes',k:'bb',t:'hst',main:1,note:'Upper back on the bench, chin tucked, squeeze 1 s at the top. Pad the bar.'},
{id:'bridge',n:'Barbell glute bridge',p:'Glutes',k:'bb',t:'hst',main:1,note:'Shoulders on the floor, pad the bar.'},
{id:'bstance',n:'B-stance hip thrust',p:'Glutes',k:'kb',t:'st',main:1,note:'Back foot on its toes; the front leg does the work. Log one side.'},
{id:'slthrust',n:'Single-leg hip thrust',p:'Glutes',k:'bw',t:'st',bw:{s:[3,8,12],t:[3,12,20]},harder:'Hold a kettlebell on the hip.',note:'Shoulders on the bench. Optional bell on the hip (log it as +lb).'},
{id:'revhyper',n:'Bench reverse hyper',p:'Glutes',k:'bw',t:'st',bw:{s:[3,10,15],t:[3,12,20]},harder:'Pause 2 s at the top, or hold a light bell between the feet.',note:'Lie face down on the bench, hips at the edge; lift straight legs with the glutes, not the low back.'},
{id:'frog',n:'Frog pumps',p:'Glutes',k:'bw',t:'t',bw:{t:[3,15,25]},harder:'Rest a kettlebell on the hips.',note:'Soles together, knees out, short hard squeezes.'},
{id:'swing',n:'Kettlebell swing',p:'Glutes',k:'bell',t:'hst',sch:{h:[8,'10'],s:[5,'15'],t:[4,'12']},note:'Snap the hips; arms just guide the bell.'},
{id:'rdl',n:'Romanian deadlift',p:'Hinge',k:'bb',t:'hst',main:1,note:'Push the hips back until the hamstrings stop you.'},
{id:'dl',n:'Deadlift',p:'Hinge',k:'bb',t:'hs',grip:1},
{id:'sumo',n:'Sumo deadlift',p:'Hinge',k:'bb',t:'hs',thigh:1},
{id:'slrdl',n:'Single-leg kettlebell deadlift',p:'Hinge',k:'kb',t:'st',note:'Log the bell in one hand.'},
{id:'zercher',n:'Zercher squat',p:'Squat',k:'bb',t:'hs',thigh:1,note:'Bar in the elbow crooks.'},
{id:'front',n:'Front squat',p:'Squat',k:'bb',t:'hs',thigh:1,note:'Elbows high, bar on the shoulders.'},
{id:'goblet',n:'Goblet squat',p:'Squat',k:'kb',t:'st',thigh:1},
{id:'rlunge',n:'Kettlebell reverse lunge',p:'Squat',k:'kb',t:'st',thigh:1,note:'Long step and a slight forward lean puts more on the glutes. Log one bell.'},
{id:'bench',n:'Bench press',p:'Push',k:'bb',t:'hst',main:1,note:'Bench inside the rack with the safety arms just below chest height.'},
{id:'ohp',n:'Overhead press',p:'Push',k:'bb',t:'hs',main:1},
{id:'kbpress',n:'Single-arm kettlebell press',p:'Push',k:'kb',t:'hst'},
{id:'ringpush',n:'Ring push-up',p:'Push',k:'bw',t:'st',bw:{s:[3,6,12],t:[3,8,15]},harder:'Lower the rings or elevate the feet.',note:'Rings a few inches off the floor; knees down is fine.'},
{id:'row',n:'Barbell row',p:'Pull',k:'bb',t:'hs',main:1,grip:1},
{id:'pullup',n:'Ring pull-up',p:'Pull',k:'bw',t:'hs',grip:1,bw:{h:[5,1,5],s:[4,2,6]},harder:'Add a kettlebell between the feet.',note:'Can’t do one yet? Jump up and lower for 5 s; log those reps.'},
{id:'ringrow',n:'Ring row',p:'Pull',k:'bw',t:'hst',bw:{h:[4,6,10],s:[3,8,12],t:[3,10,15]},harder:'Walk the feet forward so the body is more horizontal.',note:'Body straight like a plank; more horizontal is harder.'},
{id:'kbrow',n:'Single-arm kettlebell row',p:'Pull',k:'kb',t:'hst'},
{id:'tgu',n:'Turkish get-up',p:'Grip and trunk',k:'bell',t:'hs',sch:{h:[3,'1 per side'],s:[3,'2 per side']}},
{id:'suitcase',n:'Suitcase carry',p:'Grip and trunk',k:'bell',t:'hst',grip:1,sch:{h:[4,'30 m per side'],s:[3,'40 m per side'],t:[3,'30 m per side']}},
{id:'rack',n:'Double front-rack carry',p:'Grip and trunk',k:'bell',t:'st',sch:{s:[3,'40 m'],t:[3,'30 m']},note:'Two bells; log the weight of one.'},
{id:'towelhang',n:'Towel hang',p:'Grip and trunk',k:'bw',u:'s',t:'hst',grip:1,bw:{h:[3,20,40],s:[3,20,45],t:[2,15,30]},harder:'Hang from one towel and one ring, switching each set.',note:'Towel looped over each ring, grip it like a gi collar. Log seconds.'},
{id:'towelrow',n:'Towel ring row',p:'Grip and trunk',k:'bw',t:'hs',grip:1,bw:{h:[4,6,10],s:[3,8,12]},harder:'Walk the feet forward so the body is more horizontal.',note:'Towels over the rings; pull with a gi grip.'},
{id:'farmer',n:'Heavy farmer carry',p:'Grip and trunk',k:'bell',t:'hs',grip:1,sch:{h:[4,'30 m'],s:[3,'40 m']},note:'A bell in each hand; log the weight of one.'},
{id:'bottomsup',n:'Bottoms-up kettlebell press',p:'Grip and trunk',k:'kb',t:'st',note:'Bell upside down; a crushing grip keeps it balanced. Log one bell.'},
{id:'hollow',n:'Hollow hold',p:'Grip and trunk',k:'bw',u:'s',t:'hst',bw:{h:[3,20,40],s:[3,20,40],t:[3,15,30]},harder:'Arms overhead, legs lower to the floor.',note:'Low back pressed to the floor the whole time. Log seconds.'},
{id:'sideplank',n:'Side plank',p:'Grip and trunk',k:'bw',u:'s',t:'st',bw:{s:[3,20,45],t:[2,20,40]},harder:'Lift the top leg, or hold a light bell on the hip.',note:'Seconds per side.'},
{id:'deadbug',n:'Deadbug',p:'Grip and trunk',k:'bw',t:'st',bw:{s:[3,6,10],t:[2,6,10]},harder:'Hold a light bell overhead with both hands.',note:'Reps per side; slow, back flat.'}];
const EX=[],EXM={}; // live library = built-ins with her edits applied, plus her own exercises
// Body check-in: areas she can flag, and what each exercise / conditioning mode puts load on.
const AREAS=[['neck','Neck'],['shoulder','Shoulders'],['elbow','Elbows'],['wrist','Wrists & hands'],['back','Back'],['ribs','Ribs'],['hip','Hips'],['knee','Knees'],['ankle','Ankles & feet']];
const AL=Object.fromEntries(AREAS);
const STRESS={hipthrust:['hip'],bridge:['hip'],bstance:['hip','knee'],slthrust:['hip'],revhyper:['back','hip'],frog:['hip'],swing:['back','hip','wrist'],
 rdl:['back','hip'],dl:['back','hip'],sumo:['back','hip','knee'],slrdl:['back','hip','ankle'],zercher:['knee','hip','back','elbow'],front:['knee','hip','back','wrist'],
 goblet:['knee','hip','ankle'],rlunge:['knee','hip','ankle'],bench:['shoulder','elbow','wrist','ribs'],ohp:['shoulder','elbow','wrist','back','neck'],
 kbpress:['shoulder','elbow','wrist'],ringpush:['shoulder','elbow','wrist','ribs'],row:['back','elbow'],pullup:['shoulder','elbow'],ringrow:['shoulder','elbow'],
 kbrow:['back','elbow'],tgu:['shoulder','wrist','neck','ribs'],suitcase:['wrist','ribs','ankle'],rack:['wrist','back'],towelhang:['shoulder','elbow','wrist'],
 towelrow:['shoulder','elbow','wrist'],farmer:['wrist','back','ankle'],bottomsup:['shoulder','elbow','wrist'],hollow:['neck','ribs','back'],sideplank:['shoulder','ribs'],deadbug:['ribs','back']};
const MSTRESS={row:['back','hip','knee','ankle'],kick:['wrist','elbow','shoulder','hip','knee','ribs','ankle'],ropes:['shoulder','elbow','wrist','back'],kb:['back','hip','wrist']};
const flagged=()=>Object.entries(S.body||{}).filter(([k,v])=>AL[k]&&v&&v.l);
function hits(areas){const out=[];for(const [k,v] of flagged())if((areas||[]).includes(k))out.push([k,v.l]);return out}
const hitTxt=h=>h.map(([k,l])=>`${AL[k].toLowerCase()}${l>1?' (painful)':''}`).join(', ');
function bodyCard(){const f=Object.fromEntries(flagged().map(([k,v])=>[k,v.l]));const newest=Math.max(0,...flagged().map(([,v])=>v.d||0));
 if(!newest&&!V.bodyOpen)return `<div class="card row" style="justify-content:space-between;flex-wrap:nowrap"><span><b>Body check-in</b><br><span class="small">Nothing flagged.</span></span><button class="btn ghost sm" data-act="bodyOpen">Something's sore</button></div>`;
 return `<div class="card"><div class="row" style="justify-content:space-between"><h3>Body check-in</h3>${newest?'<button class="btn ghost sm" data-act="bodyClear">All good</button>':''}</div>
 <div class="small">Anything sore or hurting? Tap once for “a little”, twice for “painful”, a third time to clear.${newest?` Updated ${ago(newest)}.`:''}</div>
 <div class="body">${AREAS.map(([k,l])=>`<button data-body="${k}" class="lv${f[k]||0}" aria-label="${l}: ${['fine','a little','painful'][f[k]||0]}"><b>${l}</b><span>${['fine','a little','painful'][f[k]||0]}</span></button>`).join('')}</div>
 ${Object.values(f).some(l=>l>1)?'<div class="small" style="margin-top:8px">Sharp pain, swelling, numbness, or pain that changes how you move: get it checked before training through it.</div>':''}</div>`}
const KINDS={bb:'Barbell — weight from her training max',kb:'Kettlebell — picks the bell from her estimated max',bell:'Kettlebell — fixed sets × reps',bw:'Bodyweight or rings — rep range'};
const DEF_SCH={bell:{h:[4,'8'],s:[3,'10'],t:[3,'12']},bw:{h:[4,5,8],s:[3,8,12],t:[3,12,20]}};
// Text she types is stored clean (no markup characters) so it can never break the page.
const clean=v=>String(v??'').replace(/&/g,' and ').replace(/'/g,'’').replace(/[<>"`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,90);
function normDef(d){const o={id:String(d.id||'').replace(/[^a-z0-9_-]/gi,'').slice(0,40),n:clean(d.n)||'Exercise',p:GROUPS.some(g=>g[0]===d.p)?d.p:d.p==='Carry and core'?'Grip and trunk':'Glutes',
 k:KINDS[d.k]?d.k:'bw',t:[...'hst'].filter(x=>String(d.t||'').includes(x)).join('')||'s',note:clean(d.note),harder:clean(d.harder),main:d.main?1:0,thigh:d.thigh?1:0,grip:d.grip?1:0,u:d.u==='s'?'s':'',a:Array.isArray(d.a)?d.a.filter(x=>AL[x]):undefined};
 const num=(v,lo,hi,df)=>{v=Math.round(+v);return v>=lo&&v<=hi?v:df};
 if(o.k==='bell'){o.sch={};for(const x of o.t){const v=(d.sch||{})[x]||DEF_SCH.bell[x];o.sch[x]=[num(v[0],1,12,3),clean(v[1])||'10']}}
 if(o.k==='bw'){o.bw={};for(const x of o.t){const v=(d.bw||{})[x]||DEF_SCH.bw[x];const lo=num(v[1],1,100,8);o.bw[x]=[num(v[0],1,12,3),lo,Math.max(lo,num(v[2],1,100,lo))]}}
 return o}
const PR=[
{id:'mat',t:'h',n:'Mat rounds',w:300,r:60,rounds:5,surge:{every:45,len:10},rpe:'7, surges 9',spm:'22–24 spm, surges 30+',why:'A steady base pace with a 10 s all-out surge every 45 s, like scrambles in a roll.'},
{id:'sprint',t:'h',n:'Sprints',w:30,r:90,rounds:8,rpe:'9–10',spm:'30–34 spm',why:'Near all-out bursts. Long rest so every one stays fast.'},
{id:'tabata',t:'h',n:'Tabata blocks',w:20,r:10,rounds:8,blocks:2,br:120,rpe:'9',spm:'30+ spm',why:'Two blocks of eight. Rest is too short to recover — output will fade, that is the point.'},
{id:'fight',t:'h',n:'Fight rounds',w:180,r:60,rounds:5,rpe:'8',spm:'26–28 spm',why:'Kickboxing round format at a hard, held pace.'},
{id:'matS',t:'s',n:'Mat rounds',w:300,r:60,rounds:4,surge:{every:60,len:10},rpe:'6, surges 8',spm:'20–22 spm, surges 28+',why:'Easier base, one 10 s surge a minute.'},
{id:'minute',t:'s',n:'Minute on, minute off',w:60,r:60,rounds:10,rpe:'7–8',spm:'26–28 spm',why:'Hard but repeatable. Last round should match the first.'},
{id:'fours',t:'s',n:'Fours',w:240,r:120,rounds:4,rpe:'7',spm:'24–26 spm',why:'Comfortably hard. You could speak a few words, not sentences.'},
{id:'steadyrounds',t:'s',n:'Steady rounds',w:180,r:60,rounds:4,rpe:'6–7',spm:'24–26 spm',why:'Round format at a pace you could hold all day.'},
{id:'easy',t:'t',n:'Easy fives',w:300,r:60,rounds:4,rpe:'4–5',spm:'18–22 spm',why:'Conversational pace. Should leave you feeling better than you started.'},
{id:'tech',t:'t',n:'Technique rounds',w:120,r:60,rounds:6,rpe:'4–5',spm:'18–20 spm',why:'Half speed. Clean form, relaxed shoulders, breathe out on every strike or stroke.'},
{id:'flush',t:'t',n:'Flush',w:1200,r:0,rounds:1,rpe:'3–4',spm:'18–20 spm',why:'One continuous easy block. Just move.'}];
// What each protocol trains and when to choose it.
const GUIDE={
mat:{b:'The stop-start pattern of a jiu-jitsu match: mostly working, short pauses, repeated bursts.',p:'A competition is coming, or you want conditioning that feels like rolling.'},
matS:{b:'The stop-start pattern of a jiu-jitsu match, at a pace you can repeat.',p:'You want jiu-jitsu-style conditioning without emptying the tank.'},
sprint:{b:'Power and the ability to repeat it — the fast, short-burst energy systems.',p:'You feel sharp and want it short and intense. On the rower, best when your legs are fresh.'},
tabata:{b:'Tolerance to the burn, plus aerobic ceiling, in very little time.',p:'Short on time and want it over fast. Expect the last rounds to fall off.'},
fight:{b:'Holding hard output for a full round — exactly what a kickboxing round demands.',p:'You want to hit the bag hard. Good the day after a lower-body lift, since punching spares the legs.'},
minute:{b:'Aerobic power (VO2 max) — raises the ceiling every other session works under.',p:'A normal good day. The best all-round choice if you are unsure.'},
fours:{b:'Threshold — the hard pace you can hold without falling apart. Makes all other cardio feel easier.',p:'You want steady, rhythmic, controllable work rather than all-out bursts.'},
steadyrounds:{b:'Aerobic base with a round rhythm.',p:'You want to move and sweat without redlining. Good bag practice.'},
easy:{b:'Aerobic base and recovery — more blood flow to sore muscles.',p:'Tired but want to move. Helps you recover from lifting.'},
tech:{b:'Skill and coordination, at very low fatigue cost.',p:'Body is tired but your head wants to train. Sharpen form.'},
flush:{b:'Recovery.',p:'Sore or stiff and just want to feel better afterward.'}};
const LOWER=['Glutes','Hinge','Squat'];
// Jiu-jitsu context: no fixed schedule, so she taps it when it applies.
function bjj(){const now=Date.now(),last=S.sessions.find(x=>x.kind==='bjj');const rolled=last&&now-last.d<24*36e5?last:null;
 return {rolled,gi:!!(rolled&&rolled.gi),soon:!!(S.bjjNext&&now-S.bjjNext<30*36e5),last}}
const bodySnap=()=>{const f=flagged();return f.length?Object.fromEntries(f.map(([k,v])=>[k,v.l])):null};
function bjjCard(){const b=bjj(),c=compDays();
 return `<div class="card"><h3>Jiu-jitsu</h3><div class="small">${b.last?`Last class ${ago(b.last.d)}${b.last.gi?' (gi)':' (no-gi)'}.`:'Tap when you roll — the suggestions adjust.'}${c!=null&&c>=0?` Competition in ${c} day${c===1?'':'s'}.`:''}</div>
 <div class="seg"><button data-bjj="gi" aria-pressed="${!!(b.rolled&&b.rolled.gi)}">Rolled · gi</button><button data-bjj="nogi" aria-pressed="${!!(b.rolled&&!b.rolled.gi)}">Rolled · no-gi</button><button data-bjj="soon" aria-pressed="${b.soon}">Class within a day</button></div></div>`}
function suggestCond(t){const list=PR.filter(p=>p.t===t),now=Date.now(),bj=bjj(),cd=compDays();
 const lastP=id=>Math.max(0,...Object.entries(S.cond).filter(([k])=>k.split(':')[1]===id).map(([,v])=>v.d||0));
 const lastM=m=>Math.max(0,...Object.entries(S.cond).filter(([k])=>subModes(k.split(':')[0]).includes(m)).map(([,v])=>v.d||0));
 const legs=Math.max(0,...EX.filter(e=>LOWER.includes(e.p)).map(e=>lastD(e.id)));const legsRecent=legs&&now-legs<30*36e5;
 const lifted=S.sessions.find(x=>x.kind==='str');const inWeights=lifted&&now-lifted.d<3*36e5;
 const hard=['sprint','tabata','mat','matS'],compSoon=cd!=null&&cd>7&&cd<=28;
 const pen=x=>(t==='h'&&legsRecent&&x.id==='sprint'?1:0)+(bj.rolled&&hard.includes(x.id)?2:0)-(compSoon&&x.id.startsWith('mat')?3:0);
 const p=list.slice().sort((a,b)=>pen(a)-pen(b)||lastP(a.id)-lastP(b.id))[0];
 const why=[];
 if(compSoon&&p.id.startsWith('mat'))why.push(`competition in ${cd} days — Mat rounds match how a match is fought`);
 else why.push(lastP(p.id)?`${p.n} was last done ${ago(lastP(p.id))}; rotating keeps every energy system trained`:`you haven't tried ${p.n} yet`);
 if(bj.rolled)why.push(`you rolled ${ago(bj.rolled.d)} — rolling already covered the hardest intervals`);
 let cands=['row','kick','ropes','kb'];
 if(inWeights){cands=['ropes','kb'];why.push('you lifted in the last few hours — ropes and kettlebells are already in the weights room')}
 if(legsRecent){cands=cands.filter(m=>m!=='row'&&m!=='kb');if(!cands.length)cands=['ropes'];why.push(`you trained glutes/legs ${ago(legs)} — the bag and ropes spare them; rowing and swings are leg-driven`)}
 const sore=m=>hits(MSTRESS[m]),worst=m=>Math.max(0,...sore(m).map(x=>x[1]));
 const ok=cands.filter(m=>worst(m)<2);if(ok.length&&ok.length<cands.length){why.push(`skipping ${cands.filter(m=>worst(m)>1).map(m=>MODES[m].toLowerCase()).join(' and ')} — it loads your ${hitTxt(flagged().filter(([,v])=>v.l>1).map(([k,v])=>[k,v.l]))}`)}if(ok.length)cands=ok;
 const mode=cands.slice().sort((a,b)=>worst(a)-worst(b)||lastM(a)-lastM(b))[0];
 if(!inWeights&&!legsRecent&&cands.some(m=>lastM(m)))why.push(`${MODES[mode].toLowerCase()} is the one you've done least recently`);
 return {id:p.id,mode,why}}
const COMBOS={h:['1-2, full power, nonstop','Jab · cross · lead hook · cross','Rear roundhouse to the bag, alternate sides','Clinch and knees, both sides','Jab · cross · rear roundhouse','Body shots: hook · hook · uppercut'],
s:['Jab · cross · lead hook','Jab · cross · rear roundhouse','Lead teep · cross · lead hook','Double jab · cross · lead low kick','Cross · lead hook · cross','Jab · rear knee · rear knee'],
t:['Jab · cross, light touches','Jab · jab · cross','Lead teep, light','Footwork around the bag: step, pivot, reset','Slow roundhouse, check the balance','Jab · cross · slip · cross']};
const MODES={row:'Rowing',kick:'Heavy bag',mix:'Row + bag',ropes:'Battle ropes',kb:'Kettlebell',mixw:'Ropes + bell'};
const ROOMS=[['Bag room',['row','kick','mix']],['Weights room',['ropes','kb','mixw']]];
const MLAB={row:'Row',kick:'Heavy bag',ropes:'Ropes',kb:'Kettlebell'};
const CUES={kick:COMBOS,
ropes:{h:['Double-arm waves, fast and big','Overhead slams','Alternating waves, max speed','Lateral whips','Waves in a half squat'],s:['Alternating waves, steady','Double waves, steady','Outside circles','Inside circles','Waves with a side step'],t:['Easy alternating waves','Small circles, relaxed','Slow double waves, long breaths','Floor snakes, easy']},
kb:{h:['Two-hand swings, heavy and crisp','Alternating swings','2 swings + 1 goblet squat','Single-arm swings, switch every 5','Clean and press, alternate sides'],s:['Two-hand swings','Goblet squats, steady pace','Single-arm swings, switch every 10','Swing + halo'],t:['Light two-hand swings','Halos, slow','Easy goblet squats','Suitcase walk, switch hands']}};
const SURGE={row:'Sprint — hardest strokes you have',kick:'Nonstop punches, full speed',ropes:'Fastest waves you can make',kb:'Fast, crisp swings'};
const subModes=m=>m==='mix'?['row','kick']:m==='mixw'?['ropes','kb']:[m];

// ---------- storage ----------
const KEY='tt-state-v1',WKEY='tt-work-v1';
const blank=()=>({v:1,updatedAt:0,settings:{bar:45,plates:[45,35,25,10,5,2.5,1.25,0.75],round:2.5,bells:[15,25,35,53,70,88,106]},exDefs:{},exHidden:[],body:{},bjjNext:0,ex:{},sessions:[],cond:{}});
function migrate(o){const s=Object.assign(blank(),o);s.settings=Object.assign(blank().settings,s.settings);delete s.settings.inc;
 if(String(s.settings.plates)==='45,35,25,10,5,2.5')s.settings.plates=[45,35,25,10,5,2.5,1.25,0.75];
 if(!s.settings.round)s.settings.round=2.5;if(typeof s.bjjNext!=='number')s.bjjNext=0;if(!s.body||typeof s.body!=='object')s.body={};if(!s.exDefs||typeof s.exDefs!=='object')s.exDefs={};if(!Array.isArray(s.exHidden))s.exHidden=[];
 if(String(s.settings.bells)==='10,15,20,25,30,35,40,45,53')s.settings.bells=[15,25,35,53,70,88,106];return s}
let S=blank();try{const l=JSON.parse(localStorage.getItem(KEY));if(l&&l.v===1)S=migrate(l)}catch(e){}
function rebuildEx(){EX.length=0;for(const k in EXM)delete EXM[k];const defs=S.exDefs||{},hid=S.exHidden||[];
 for(const b of BASE_EX){let e=b;if(defs[b.id])try{e=normDef(Object.assign({},b,defs[b.id],{id:b.id}))}catch(x){}EX.push(Object.assign({},e,{base:1,edited:!!defs[b.id],hide:hid.includes(b.id)}))}
 for(const id in defs)if(!BASE_EX.some(b=>b.id===id)){try{const e=normDef(Object.assign({},defs[id],{id}));if(e.id)EX.push(Object.assign(e,{hide:hid.includes(id)}))}catch(x){}}
 for(const e of EX){if(!Array.isArray(e.a))e.a=STRESS[e.id]||[];EXM[e.id]=e}}
rebuildEx();
let W=null;try{W=JSON.parse(localStorage.getItem(WKEY));if(W&&W.type==='str'&&W.items.some(it=>!EXM[it.id]))W=null}catch(e){}
let ref=null,writing=false,pending=false;
const syncEl=document.getElementById('sync');
function saveLocal(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function saveW(){try{W?localStorage.setItem(WKEY,JSON.stringify(W)):localStorage.removeItem(WKEY)}catch(e){}}
async function pushDb(){if(!ref)return;if(writing){pending=true;return}writing=true;
 try{await ref.set(JSON.parse(JSON.stringify(S)));syncEl.textContent='Synced'}catch(e){syncEl.textContent='On this phone'}
 writing=false;if(pending){pending=false;pushDb()}}
function save(){S.updatedAt=Date.now();if(S.sessions.length>300)S.sessions.length=300;saveLocal();pushDb()}
(async()=>{try{const db=await claude.use('db'),u=await claude.use('user');if(!db||!u)return;const id=await u.id();if(!id)return;
 ref=db.doc('data/users/'+id+'/profile');const to=setTimeout(()=>{syncEl.textContent='Offline — on this phone'},10000);
 const snap=await ref.get();clearTimeout(to);const d=snap.exists?snap.data():null;
 if(d&&d.v===1&&(d.updatedAt||0)>(S.updatedAt||0)){S=migrate(JSON.parse(JSON.stringify(d)));rebuildEx();saveLocal();if(V.view!=='timer')render()}
 else if(S.updatedAt)await pushDb();syncEl.textContent='Synced'}catch(e){ref=null}})();

// ---------- helpers ----------
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inc=()=>S.settings.round||2.5; // barbell rounding step: 2.5 lb = a 1.25 plate per side
const rnd=(v,i)=>Math.floor(v/i+0.5)*i; // round half up
const epley=(w,r)=>w*(1+Math.min(r,10)/30); // reps capped at 10: Epley drifts high beyond that
const days=ts=>Math.round((Date.now()-ts)/864e5);
const ago=ts=>{const d=days(ts);return d<=0?'today':d===1?'yesterday':d+' days ago'};
const mmss=s=>Math.floor(s/60)+':'+String(Math.round(s%60)).padStart(2,'0');
const exS=id=>S.ex[id]||(S.ex[id]={e1:null,log:[]});
const tm=id=>{const e=S.ex[id];return e&&e.e1?rnd(e.e1*0.9,inc()):null};
const lastD=id=>{const e=S.ex[id];return e&&e.log.length?e.log[0].d:0};
const fmtSet=(id,s)=>{const e=EXM[id]||{};return e.k==='bw'?(+s[0]?`${s[1]}${e.u==='s'?' s':''} (+${s[0]})`:`${s[1]}${e.u==='s'?' s':''}`):s[0]+'×'+s[1]};
function lastLine(id){const e=S.ex[id];if(!e||!e.log.length)return null;const l=e.log[0];return `${ago(l.d)} · ${TIERS[l.tier].n} · ${l.sets.map(s=>fmtSet(id,s)).join(', ')}`}
function plateSide(w){const bar=S.settings.bar;let side=(w-bar)/2;const out=[];if(side<=0)return out;
 for(const p of S.settings.plates.slice().sort((a,b)=>b-a)){while(side>=p-1e-9){out.push(p);side-=p}}return out}
function plateHTML(w){const bar=S.settings.bar,side=plateSide(w);if(!side.length)return `<div class="plates"><span class="small">Empty ${bar} lb bar — no plates.</span></div>`;
 const sum=side.reduce((a,b)=>a+b,0);
 return `<div class="plates" aria-label="Plates for ${w} lb"><span class="sleeve"></span>${side.map(p=>`<span class="pl" style="height:${Math.round(18+Math.sqrt(p)*4.4)}px">${p}</span>`).join('')}<span class="small" style="margin-left:6px">each side</span></div>
 <div class="small">${bar} bar + ${sum} on each side (${side.join(' + ')}) = ${bar+2*sum} lb</div>`}
function warmups(w){const bar=S.settings.bar,i=inc(),out=[[bar,8]];for(const [p,r] of [[.5,5],[.7,3],[.85,1]]){const v=Math.max(bar,rnd(w*p,i));if(v>out[out.length-1][0]&&v<w)out.push([v,r])}return out}
function bellFor(target){const b=S.settings.bells.slice().sort((a,c)=>a-c);let pick=b[0];for(const x of b)if(x<=target)pick=x;return pick}
function nextBell(w){const b=S.settings.bells.slice().sort((a,c)=>a-c);return b.find(x=>x>w)??w}

// Prescribe sets for an exercise on a tier from the current estimate (e1 = estimated 1RM).
// Competition taper: weights stay, volume drops (both source programs cut volume before an event).
function compDays(){const c=S.settings.comp;if(!c)return null;const t=new Date(c+'T12:00:00').getTime();if(isNaN(t))return null;const d=new Date();d.setHours(12,0,0,0);return Math.round((t-d.getTime())/864e5)}
function taper(n){const d=compDays();if(d==null||d<0)return n;if(d<=7)return Math.ceil(n/2);if(d<=14)return Math.max(2,n-1);return n}
const lockEst=()=>{const d=compDays();return d!=null&&d>=0&&d<=7};
function prescribe(id,tier,e1){const ex=EXM[id],sc0=SCH[tier],sc=Object.assign({},sc0,{sets:taper(sc0.sets)}),amrap=tier!=='t'&&!lockEst();
 if(ex.k==='bell'){const [n,reps]=ex.sch[tier]||Object.values(ex.sch)[0];const e=S.ex[id];let w=null,hint='Pick a bell you can control for every rep.';
  if(e&&e.log.length){const same=e.log.find(l=>l.tier===tier)||e.log[0];w=same.sets[0][0];hint=`Last time ${w} lb. Felt easy? Go to ${nextBell(w)}.`}
  return {n:taper(n),reps,w,txt:`${taper(n)} × ${reps}`,hint,kind:'bell'}}
 if(ex.k==='bw'){const [n,lo,hi]=ex.bw[tier]||Object.values(ex.bw)[0];const e=S.ex[id];const un=ex.u==='s'?' s':'';let hint=ex.u==='s'?`Hold ${lo}–${hi} s each set.`:`Aim for ${lo}–${hi} good reps each set.`,reps=lo,w=0;
  const same=e&&e.log.find(l=>l.tier===tier);
  if(same){w=same.sets[0][0]||0;const all=same.sets.length>=n&&same.sets.every(s=>+s[1]>=hi);reps=Math.min(hi,Math.max(...same.sets.map(s=>+s[1]||0)));
   hint=all?`You hit ${hi} on every set last time — make it harder: ${ex.harder}`:`Beat last time: ${same.sets.map(s=>s[1]).join(', ')}.`}
  return {n:taper(n),reps,w,txt:`${taper(n)} × ${lo}–${hi}${un}`,hint,kind:'bw'}}
 if(!e1)return null;
 if(ex.k==='bb'){const w=Math.max(S.settings.bar,rnd(e1*0.9*sc.pct,inc()));
  return {n:sc.sets,reps:sc.reps,w,amrap,txt:`${sc.sets} × ${sc.reps}${amrap?'+':''} @ ${w} lb`,hint:amrap?`Last set: as many good reps as you can.`:`Every set: stop with a few reps left.`,kind:'bb',wu:tier==='t'?null:warmups(w)}}
 // kettlebell: bell for the bottom of the rep range, then the reps that bell allows
 const target=e1/(1+(sc.lo+sc.cush)/30),w=bellFor(target);const can=Math.floor(30*(e1/w-1)-sc.cush);const reps=Math.max(sc.lo,Math.min(sc.hi,can));
 return {n:sc.sets,reps,w,amrap,txt:`${sc.sets} × ${reps}${amrap?'+':''} @ ${w} lb`,hint:(amrap?'Last set: as many good reps as you can. ':'')+(can>sc.hi&&nextBell(w)===w?'This is your heaviest bell — add reps.':`Rep range ${sc.lo}–${sc.hi}.`),kind:'kb'}}

// Suggest a session from history: glutes first (her goal), then the patterns trained least recently.
function groupLast(g){return Math.max(0,...EX.filter(e=>e.p===g).map(e=>lastD(e.id)))}
function blocked(e){const b=bjj();return hits(e.a).length>0||((b.soon||b.gi)&&e.grip)||(b.soon&&e.k==='bb'&&(e.p==='Hinge'||e.p==='Squat'))}
function freshest(g,t,skip){const c=EX.filter(e=>!e.hide&&!blocked(e)&&e.p===g&&e.t.includes(t)&&!skip.includes(e.id));if(!c.length)return null;
 const mains=c.filter(e=>e.main);const pool=t!=='t'&&mains.length?mains:c;return pool.slice().sort((a,b)=>lastD(a.id)-lastD(b.id))[0]}
function suggest(t){const out=[],ids=()=>out.map(o=>o.id),why=g=>{const d=groupLast(g);return d?`${g.toLowerCase()} last trained ${ago(d)}`:`${g.toLowerCase()} not trained yet`};
 const add=(g,reason)=>{const e=freshest(g,t,ids());if(e)out.push({id:e.id,why:reason||why(g)})};
 add('Glutes','glutes are the priority');
 const rest=['Hinge','Push','Pull'].sort((a,b)=>groupLast(a)-groupLast(b));add(rest[0]);if(t!=='t')add(rest[1]);
 if(t!=='h'){const acc=EX.filter(e=>!e.hide&&!blocked(e)&&e.p==='Glutes'&&e.k==='bw'&&e.t.includes(t)&&!ids().includes(e.id)).sort((a,b)=>lastD(a.id)-lastD(b.id))[0];if(acc)out.push({id:acc.id,why:'extra glute work, no thigh load'})}
 const bj=bjj();add('Grip and trunk',bj.soon||bj.gi?'trunk work; grip saved for the mat':'grip and bracing for jiu-jitsu');
 const sq=groupLast('Squat');if(t==='h'&&sq&&days(sq)>=7)add('Squat',`squat last trained ${ago(sq)} — keeps strength`);
 return out}

// ---------- view state ----------
let V={view:W?(W.type==='str'?'lift':W.phase||'home'):'home',type:null,tier:null,sel:[],proto:null,mode:'row',rounds:null};
const ICON={str:'<svg viewBox="0 0 32 32" fill="currentColor"><rect x="2" y="12" width="4" height="8" rx="1"/><rect x="6" y="9" width="4" height="14" rx="1"/><rect x="10" y="15" width="12" height="2"/><rect x="22" y="9" width="4" height="14" rx="1"/><rect x="26" y="12" width="4" height="8" rx="1"/></svg>',
cond:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="16" cy="17" r="11"/><path d="M16 17V10M12 3h8"/></svg>',
h:'<svg viewBox="0 0 32 32" fill="currentColor"><path d="M18 2 6 18h8l-2 12 12-16h-8z"/></svg>',
s:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M4 16h24M4 10h24M4 22h24"/></svg>',
t:'<svg viewBox="0 0 32 32" fill="currentColor"><path d="M20 4a12 12 0 1 0 8 19A10 10 0 0 1 20 4z"/></svg>'};
const head=(t,p)=>{$('#head').innerHTML=`<h1>${t}</h1>${p?`<p>${p}</p>`:''}`};
function bar(btns){const b=$('#bar');if(!btns){b.hidden=true;return}b.hidden=false;$('#barIn').innerHTML=btns}
function render(){const v=V.view;document.querySelectorAll('#nav button').forEach(b=>b.setAttribute('aria-current',String(b.dataset.go===v||(b.dataset.go==='home'&&!['history','settings','exEdit'].includes(v))||(b.dataset.go==='settings'&&v==='exEdit'))));
 ({home,feel,pick,lift,condPick,timer,condLog,done,history:histView,settings:setView,exEdit})[v]();window.scrollTo(0,0)}

function home(){const last=S.sessions[0];head('What are we training?',last?`Last session: ${esc(last.title)}, ${ago(last.d)}.`:'Pick one. You can change your mind tomorrow.');
 $('#app').innerHTML=`<div class="big">
 <button class="choice t-h" data-type="str"><span class="sw">${ICON.str}</span><span><b>Strength</b><span>Barbell, kettlebells and rings. Weights from last time are filled in.</span></span></button>
 <button class="choice t-t" data-type="cond"><span class="sw">${ICON.cond}</span><span><b>Conditioning</b><span>Rower, heavy bag, battle ropes or kettlebell intervals with a timer.</span></span></button></div>`+bjjCard();bar()}
function feel(){const ed=W&&W.type==='str'&&V.type==='str';head(ed?'Change energy level':'How do you feel?',ed?'Your lifts stay; the weights and reps update to match.':'Be honest — every answer gets a good session.');
 const bj=bjj(),cd=compDays(),notes=[];
 if(!ed&&V.type==='cond'&&bj.rolled)notes.push(`You rolled ${ago(bj.rolled.d)}. Rolling already hit the hard intervals — Steady or Tired is plenty.`);
 if(!ed&&V.type==='str'&&bj.soon)notes.push('Class within a day: heavy hinges, squats and grip-heavy lifts won’t be suggested.');
 if(!ed&&V.type==='str'&&bj.gi&&!bj.soon)notes.push('Gi class today: grip-heavy lifts won’t be suggested.');
 if(cd!=null&&cd>=0&&cd<=14)notes.push(`Competition in ${cd} day${cd===1?'':'s'}: ${cd<=7?'half the sets, same weights, no max-rep sets':'one set fewer per lift'}.`);
 if(cd!=null&&cd<0&&cd>=-7)notes.push('Competition was this week — keep it light for a few days.');
 $('#app').innerHTML=(ed?'':bodyCard())+notes.map(n=>`<div class="card note2">${esc(n)}</div>`).join('')+`<div class="big">${['h','s','t'].map(k=>`<button class="choice t-${k}" data-tier="${k}"><span class="sw">${ICON[k]}</span><span><b>${TIERS[k].n}</b><span>${V.type==='cond'?{h:'Short, hard bursts with long recoveries.',s:'Hard-but-repeatable intervals.',t:'Easy rounds. Move, sweat a little, feel better.'}[k]:TIERS[k].d}</span></span></button>`).join('')}</div>`+(ed?'':bjjCard());
 bar(ed?`<button class="btn ghost" data-act="backPick">Back</button>`:`<button class="btn ghost" data-go="home">Back</button>`)}

function pick(){const t=V.tier,sug=suggest(t),sids=sug.map(s=>s.id),ed=W&&W.type==='str';head(ed?'Change your lifts':`${TIERS[t].n} strength`,ed?`${TIERS[t].n} · sets you've already ticked off are kept.`:'Pick what you feel like doing, or take the suggestion.');
 const list=EX.filter(e=>!e.hide&&e.t.includes(t));
 $('#app').innerHTML=(ed?`<div class="row" style="margin-bottom:12px"><button class="btn ghost sm" data-act="chgTier">Change energy level</button><button class="btn ghost sm" data-act="quit">Discard workout</button></div>`:'')+`<div class="card sug"><h3>Suggested today</h3>${sug.map(s=>`<div class="srow"><b>${EXM[s.id].n}</b><span class="small">${esc(s.why)}</span></div>`).join('')}
 <button class="btn sm" style="margin-top:10px;width:100%" data-act="useSug">Use these</button></div>`+
 GROUPS.filter(([g])=>list.some(e=>e.p===g)).map(([g,sub])=>`<div class="grp">${g}${sub?` <span class="small">· ${sub}</span>`:''}</div>`+list.filter(e=>e.p===g).map(e=>{const l=lastLine(e.id);const on=V.sel.includes(e.id);
  return `<div class="ex" role="button" tabindex="0" data-pick="${e.id}" aria-pressed="${on}"><span class="box">✓</span><span><span class="nm">${e.n}</span>${sids.includes(e.id)?' <span class="tag">suggested</span>':''}${e.thigh?' <span class="tag th">thighs too</span>':''}${e.grip?' <span class="tag th">hard on grip</span>':''}${(h=>h.length?` <span class="tag pain${h.some(x=>x[1]>1)?' hi':''}">${h.some(x=>x[1]>1)?'loads':'may bother'}: ${hitTxt(h)}</span>`:'')(hits(e.a))}<br><span class="ln">${l?'Last: '+esc(l):e.k==='bb'||e.k==='kb'?'New — one test set first':'New'}</span></span></div>`}).join('')).join('');
 bar(ed?`<button class="btn ghost" data-act="backLift">Keep as is</button><button class="btn" data-act="startLift" ${V.sel.length?'':'disabled'}>Update · ${V.sel.length} lift${V.sel.length===1?'':'s'}</button>`
  :`<button class="btn ghost" data-go="feel">Back</button><button class="btn" data-act="startLift" ${V.sel.length?'':'disabled'}>Start · ${V.sel.length} lift${V.sel.length===1?'':'s'}</button>`)}

// Keep what she has already done when lifts or energy level change mid-workout.
function mergeItem(old,id,tier){if(old&&W.tier===tier)return old;const fresh=buildItem(id,tier);if(!old)return fresh;
 const done=old.sets.filter(s=>s.done),e1=old.e1||fresh.e1;if(!e1&&!done.length)return fresh;
 const p=prescribe(id,tier,e1);if(!p)return Object.assign(fresh,{sets:done});
 const left=Math.max(done.length?0:1,p.n-done.length);
 return {id,e1,cal:false,sets:done.concat(Array.from({length:left},()=>({w:p.w??'',r:p.reps,done:false})))}}
function buildItem(id,tier){const e=S.ex[id],p=prescribe(id,tier,e&&e.e1);const it={id,e1:e&&e.e1||null,sets:[],cal:!p};
 if(p)it.sets=Array.from({length:p.n},()=>({w:p.w??'',r:p.reps,done:false}));return it}
function liftCard(it,i){const ex=EXM[it.id],t=W.tier;const p=prescribe(it.id,t,it.e1);const l=lastLine(it.id);const T=ex.k==='bb'&&it.e1?rnd(it.e1*.9,inc()):null;
 let h=`<div class="card"><div class="row" style="justify-content:space-between"><h3>${ex.n}</h3>${T?`<span class="chip">TM ${T} lb</span>`:''}</div>
 <div class="small">${l?'Last: '+esc(l):'First time'}${ex.note?' · '+ex.note:''}</div>${(h=>h.length?`<div class="caution${h.some(x=>x[1]>1)?' hi':''}">${h.some(x=>x[1]>1)?`Painful ${h.filter(x=>x[1]>1).map(x=>AL[x[0]].toLowerCase()).join(', ')} noted — this lift loads it. Consider swapping it out.`:`Noted: ${hitTxt(h)}. Go lighter, and stop if it turns into pain.`}</div>`:'')(hits(ex.a))}`;
 if(it.cal){const tgt=t==='t'?10:5;h+=`<div class="cal"><b>Test set</b><ol>
 ${ex.k==='bb'?`<li>Warm up: empty bar × 8, then add weight in small jumps, 3–5 reps each.</li><li>Stop adding when the bar starts to slow.</li><li>Load a weight you think you could lift about <b>${tgt}</b> times.</li>`:`<li>Do a light warm-up set of 8.</li><li>Pick a bell you think you could lift about <b>${tgt}</b> times.</li>`}
 <li>Do as many good reps as you can. Stop when a rep slows way down or form slips.</li></ol>
 <div class="set"><span></span><input inputmode="decimal" placeholder="lb" data-cal="w" data-i="${i}" aria-label="Test weight"><input inputmode="numeric" placeholder="reps" data-cal="r" data-i="${i}" aria-label="Test reps"><span class="small">test set</span></div>
 <button class="btn sm" style="margin-top:10px;width:100%" data-act="cal" data-i="${i}">Set my numbers</button>
 <div class="note">Treated as a set to failure. Your training max is 90% of the one-rep max it predicts — no true max test needed.</div></div></div>`;return h}
 h+=`<div class="presc"><span class="num">${p.txt}</span></div>`;
 if(p.kind==='bb')h+=plateHTML(p.w);
 h+=`<div class="small" style="margin-top:4px">${esc(p.hint)}</div>`;
 if(p.wu)h+=`<details style="margin-top:8px"><summary class="small">Warm-up sets and plates</summary>${p.wu.map(x=>{const s=plateSide(x[0]);return `<div class="small" style="margin-top:4px"><b>${x[0]} × ${x[1]}</b> — ${s.length?s.join(' + ')+' each side':'empty bar'}</div>`}).join('')}</details>`;
 const last=it.sets.length-1;
 h+=`<div class="sets">`+it.sets.map((s,j)=>`<div class="set"><button class="chk" data-chk="${i}.${j}" aria-pressed="${s.done}" aria-label="Set ${j+1} done">✓</button>
 <input inputmode="decimal" placeholder="${ex.k==='bw'?'+lb':'lb'}" value="${ex.k==='bw'&&!+s.w?'':esc(s.w)}" data-f="w" data-k="${i}.${j}" aria-label="Weight set ${j+1}"><input ${ex.k==='bell'?'':'inputmode="numeric"'} value="${esc(s.r)}" data-f="r" data-k="${i}.${j}" aria-label="Reps set ${j+1}"><span class="small">${j===last&&p.amrap?'<b>max reps</b>':'set '+(j+1)}${j===0?(ex.k==='bw'?(ex.u==='s'?' · added lb, seconds':' · added lb, reps'):' · lb, reps'):''}</span></div>`).join('')+`</div>
 <div class="row" style="margin-top:8px"><button class="btn ghost sm" data-act="addSet" data-i="${i}">+ set</button></div></div>`;return h}
function lift(){head(`${TIERS[W.tier].n} strength`,'Tap ✓ as you finish each set. Change any number to what you actually did.');
 $('#app').innerHTML=W.items.map(liftCard).join('');bar(`<button class="btn ghost" data-act="editLift">Change lifts</button><button class="btn" data-act="finishLift">Finish</button>`)}

function condPick(){const t=V.tier,sg=suggestCond(t);head(`${TIERS[t].n} conditioning`,'Take the suggestion or pick your own.');
 const list=PR.filter(p=>p.t===t);if(!V.proto||!list.find(p=>p.id===V.proto)){V.proto=sg.id;V.mode=sg.mode}const p=PR.find(x=>x.id===V.proto);const cd=compDays(),tap=cd!=null&&cd>=0&&cd<=7;const R=V.rounds??(tap?Math.ceil(p.rounds/2):p.rounds);
 const last=S.cond[V.mode+':'+p.id],key=[t,p.id,R,V.mode].join('|');if(!V.plan||V.planKey!==key){V.plan=buildPhases(p,R,V.mode,t);V.planKey=key}
 const works=V.plan.filter(x=>x.k==='work');
 const sp=PR.find(x=>x.id===sg.id),onSug=V.proto===sg.id&&V.mode===sg.mode;
 $('#app').innerHTML=`<div class="card sug"><h3>Suggested: ${sp.n} · ${MODES[sg.mode]}</h3><ul class="why">${sg.why.map(w=>`<li>${esc(w)}</li>`).join('')}</ul><div class="small"><b>Builds:</b> ${GUIDE[sp.id].b}</div>${onSug?'<div class="small" style="margin-top:6px">Selected below.</div>':`<button class="btn sm" style="margin-top:10px;width:100%" data-act="useCond">Use this</button>`}</div>
 ${tap?`<div class="card note2">Competition in ${cd} day${cd===1?'':'s'}: rounds are halved. Stay sharp, don't dig a hole.</div>`:''}
 ${ROOMS.map(([r,ms])=>`<div class="small" style="margin:6px 0 2px">${r}${r==='Weights room'?' · kettlebells go anywhere':''}</div><div class="seg">${ms.map(m=>`<button data-mode="${m}" aria-pressed="${V.mode===m}">${MODES[m]}</button>`).join('')}</div>`).join('')}<div style="height:14px"></div>`+
 list.map(x=>`<button class="proto" data-proto="${x.id}" aria-pressed="${x.id===V.proto}"><span class="r">${x.r?ratio(x.w,x.r):'steady'}</span><b>${x.n}</b><br><span class="small">${x.r?`${mmss(x.w)} work / ${mmss(x.r)} rest`:mmss(x.w)+' continuous'} · effort ${x.rpe}/10</span><div class="small" style="margin-top:6px"><b>Builds:</b> ${GUIDE[x.id].b}</div><div class="small"><b>Pick it when:</b> ${GUIDE[x.id].p}</div><div class="small"><b>Feels like:</b> ${x.why}</div>${x.id===sg.id?'<span class="tag" style="margin-top:6px;display:inline-block">suggested</span>':''}</button>`).join('')+
 `<div class="card"><div class="row" style="justify-content:space-between"><span>${p.blocks?'Rounds per block':'Rounds'}</span><span class="stepper"><button data-rd="-1" aria-label="Fewer rounds">−</button><span class="num" style="font-size:28px">${R}</span><button data-rd="1" aria-label="More rounds">+</button></span></div>
 <div class="small" style="margin-top:6px">Total ${mmss(total(p,R))} plus a 10 s countdown.${modeNotes(V.mode,p,t)}${(h=>h.length?` Heads up: ${MODES[V.mode].toLowerCase()} loads your ${hitTxt(h)}.`:'')(hits([...new Set(subModes(V.mode).flatMap(m=>MSTRESS[m]))]))}${p.surge?` A double beep starts each ${p.surge.len} s surge; one low beep ends it.`:''}</div>
 ${last?`<div class="small" style="margin-top:6px">Last time (${ago(last.d)}): effort ${last.rpe}/10${last.m?', '+esc(last.m)+' m':''}${last.rounds?', '+last.rounds+' rounds':''}</div>`:''}
 <div class="row" style="margin-top:10px"><button class="btn ghost sm" data-act="testSound">Test sound</button><span class="small">Three short beeps, then a long one. Silent? Check the ring switch.</span></div></div>`+
 (V.mode!=='row'?`<div class="card"><div class="row" style="justify-content:space-between"><h3>${V.mode==='kick'?'Your combinations':'Your round plan'}</h3><button class="btn ghost sm" data-act="shuffle">Shuffle</button></div>
 <div class="small">Same order the timer will call them.${p.w>=120?' A new combo every 30 s.':''}</div>
 <ol class="plan">${works.map((w,n)=>`<li><b>Round ${n+1}</b> ${w.m==='row'?'<span class="small">— row</span>':(V.mode.startsWith('mix')?`<span class="small">${MLAB[w.m]}:</span> `:'')+w.c.map(esc).join(' <span class="small">→</span> ')}</li>`).join('')}</ol></div>`:'');
 bar(`<button class="btn ghost" data-go="feel">Back</button><button class="btn" data-act="startCond">Start timer</button>`)}
function modeNotes(mode,p,t){const ms=subModes(mode),o=[];
 if(ms.includes('row'))o.push(' Rowing: '+p.spm+'.');
 if(ms.includes('kick'))o.push(' Heavy bag: wraps and gloves on'+(t==='t'?', light touches.':'.'));
 if(ms.includes('ropes'))o.push(' Ropes: anchor them, soft knees, brace.');
 if(ms.includes('kb')){const e=S.ex.swing,b=e&&e.log.length?e.log[0].sets[0][0]:null;o.push(b?` Kettlebell: your swing bell is ${b} lb${t==='t'?' — go one lighter today':''}.`:' Kettlebell: pick a bell you can swing crisply for 20.')}
 return o.join('')}
const ratio=(w,r)=>{const g=(a,b)=>b?g(b,a%b):a,d=g(w,r);return w/d+':'+r/d};
const total=(p,R)=>{const b=p.blocks||1;return b*(R*p.w+(R-1)*p.r)+(b-1)*(p.br||0)};

// ---------- interval timer ----------
let T=null,actx=null,wake=null;
// Keep the screen on: Wake Lock API first; fallback is a tiny muted looping video, which phones treat as media playback.
const VID='data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAMvbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAB9AAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAll0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAB9AAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAABAAAAAQAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAfQAAAAAAABAAAAAAHRbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAABAAAAAgABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABfG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAATxzdGJsAAAAvHN0c2QAAAAAAAAAAQAAAKxhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAABAAEABIAAAASAAAAAAAAAABFUxhdmM2MC4zMS4xMDIgbGlieDI2NAAAAAAAAAAAAAAAGP//AAAAMmF2Y0MBZAAK/+EAF2dkAAqs2V7ARAAAAwAEAAADAAg8SJZYAQAEaO+8sP34+AAAAAAQcGFzcAAAAAEAAAABAAAAFGJ0cnQAAAAAAAALhAAAC4QAAAAYc3R0cwAAAAAAAAABAAAAAgAAQAAAAAAUc3RzcwAAAAAAAAABAAAAAQAAABxzdHNjAAAAAAAAAAEAAAABAAAAAgAAAAEAAAAcc3RzegAAAAAAAAAAAAAAAgAAAtQAAAANAAAAFHN0Y28AAAAAAAAAAQAAA18AAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjYwLjE2LjEwMAAAAAhmcmVlAAAC6W1kYXQAAAK5BgX//7XcRem95tlIt5Ys2CDZI+7veDI2NCAtIGNvcmUgMTY0IHIzMTA4IDMxZTE5ZjkgLSBILjI2NC9NUEVHLTQgQVZDIGNvZGVjIC0gQ29weWxlZnQgMjAwMy0yMDIzIC0gaHR0cDovL3d3dy52aWRlb2xhbi5vcmcveDI2NC5odG1sIC0gb3B0aW9uczogY2FiYWM9MSByZWY9MSBkZWJsb2NrPTE6LTM6LTMgYW5hbHlzZT0weDM6MHgzIG1lPWhleCBzdWJtZT0yIHBzeT0xIHBzeV9yZD0yLjAwOjAuNzAgbWl4ZWRfcmVmPTAgbWVfcmFuZ2U9MTYgY2hyb21hX21lPTEgdHJlbGxpcz0wIDh4OGRjdD0xIGNxbT0wIGRlYWR6b25lPTIxLDExIGZhc3RfcHNraXA9MSBjaHJvbWFfcXBfb2Zmc2V0PTAgdGhyZWFkcz0xIGxvb2thaGVhZF90aHJlYWRzPTEgc2xpY2VkX3RocmVhZHM9MCBucj0wIGRlY2ltYXRlPTEgaW50ZXJsYWNlZD0wIGJsdXJheV9jb21wYXQ9MCBzdGl0Y2hhYmxlPTEgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTMgYl9weXJhbWlkPTIgYl9hZGFwdD0xIGJfYmlhcz0wIGRpcmVjdD0xIHdlaWdodGI9MSBvcGVuX2dvcD0wIHdlaWdodHA9MSBrZXlpbnQ9MjUwIGtleWludF9taW49MSBzY2VuZWN1dD00MCBpbnRyYV9yZWZyZXNoPTAgcmNfbG9va2FoZWFkPTEwIHJjPWNyZiBtYnRyZWU9MSBjcmY9MjMuMCBxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40MCBhcT0xOjEuMjAAgAAAABNliIQAGs5/7P/CVf/Y9kSiv//xAAAACUGaIRiDWc/+8A==';let awakeVia='';
async function keepAwake(){awakeVia='';try{if(navigator.wakeLock){wake=await navigator.wakeLock.request('screen');awakeVia='lock';wake.addEventListener('release',()=>{if(awakeVia==='lock')awakeVia=''});showAwake();return}}catch(e){}
 try{let v=document.getElementById('nosleep');if(!v){v=document.createElement('video');v.id='nosleep';v.muted=true;v.loop=true;v.setAttribute('playsinline','');v.setAttribute('muted','');v.style.cssText='position:fixed;left:0;bottom:0;width:2px;height:2px;opacity:.01;pointer-events:none';v.src=VID;document.body.appendChild(v)}
  await v.play();awakeVia='video'}catch(e){awakeVia=''}showAwake()}
function letSleep(){awakeVia='';try{wake&&wake.release()}catch(e){}wake=null;const v=document.getElementById('nosleep');if(v)try{v.pause()}catch(e){}}
function showAwake(){const el=$('#awake');if(el)el.textContent=awakeVia?'Screen will stay on.':'This phone may still dim the screen — set Auto-Lock to Never for this workout.'}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&V.view==='timer'&&W&&W.ph)keepAwake()});
function audio(){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();actx.resume()}catch(e){}}
function beep(f,d){try{if(!actx)return;const o=actx.createOscillator(),g=actx.createGain(),t0=actx.currentTime;o.type='square';o.frequency.value=f;o.connect(g);g.connect(actx.destination);g.gain.setValueAtTime(.35,t0);g.gain.exponentialRampToValueAtTime(.001,t0+d);o.start(t0);o.stop(t0+d)}catch(e){}}
const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};
const SLOT=30; // long rounds change combo every 30 s
function buildPhases(p,R,mode,tier){const ph=[{k:'ready',d:10,l:'Get ready'}],b=p.blocks||1;let n=0;const tot=R*b;
 const decks={};const draw=m=>{let pool=decks[m];if(!pool||!pool.length){pool=decks[m]=CUES[m][tier].slice();for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}}return pool.pop()};
 const sm=subModes(mode);
 for(let bi=0;bi<b;bi++)for(let i=0;i<R;i++){n++;const m=sm[(n-1)%sm.length];
  ph.push({k:'work',d:p.w,l:`Work · ${n}/${tot}`,m,surge:p.surge||null,c:m==='row'?null:Array.from({length:p.w>=120?Math.ceil(p.w/SLOT):1},()=>draw(m))});
  if(i<R-1&&p.r)ph.push({k:'rest',d:p.r,l:'Rest'});else if(i===R-1&&bi<b-1)ph.push({k:'rest',d:p.br,l:'Block rest'})}return ph}
function rowCue(){return PR.find(x=>x.id===W.proto).spm+' · '+(W.tier==='h'?'drive hard with the legs':W.tier==='s'?'strong, even strokes':'relaxed, long strokes')}
const firstOf=ph=>ph.m==='row'?'Row · '+rowCue():((ph.c||[])[0]||'');
function timer(){if(!W||!W.ph){V.view='home';return render()}const p=PR.find(x=>x.id===W.proto);head(p.n,`${MODES[W.mode]||W.mode} · effort ${p.rpe}/10`);
 $('#app').innerHTML=`<div class="row" style="margin-bottom:10px"><button class="btn ghost sm" data-act="leaveTimer" id="leave">Change workout</button></div><div class="clock" id="clk"><div id="plab" style="font:600 18px Barlow,system-ui,sans-serif"></div><div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff33" stroke-width="7"/><circle id="arc" cx="50" cy="50" r="45" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="0"/></svg><div class="tt"><span class="num" id="tnum">0:00</span><span id="tsub" class="small" style="color:#ffffffcc"></span></div></div><div class="small" id="clab" style="color:#ffffffcc"></div><div class="combo" id="combo"></div><div class="cnext" id="cnext"></div></div><p class="small" id="awake" style="text-align:center"></p>`;
 bar(`<button class="btn ghost" data-act="pause" id="pbtn">${W.paused?'Resume':'Pause'}</button><button class="btn ghost" data-act="skip">Skip</button><button class="btn" data-act="endCond">End</button>`);clearTimeout(T);showAwake();if(!awakeVia)keepAwake();tick()}
function startPhase(){const ph=W.ph[W.i];W.endAt=Date.now()+ph.d*1000;W.lastS=null;W.surgeOn=false;if(ph.k==='work'){beep(1320,.6);buzz(300)}else{beep(520,.6);buzz([120,80,120])}}
function tick(){if(V.view!=='timer'||!W||!W.ph)return;const ph=W.ph[W.i];if(!ph){finishTimer();return}
 const rem=W.paused?W.rem:Math.max(0,(W.endAt-Date.now())/1000);const s=Math.ceil(rem);
 if(!W.paused&&s!==W.lastS&&s<=3&&s>0){beep(880,.15);buzz(60)}W.lastS=s;
 const clk=$('#clk');if(!clk)return;clk.className='clock '+(ph.k==='work'?'work':ph.k==='rest'?'rest':'');
 $('#plab').textContent=ph.l+(ph.k==='work'?' · '+(MLAB[ph.m]||''):'');$('#tnum').textContent=mmss(s);
 $('#arc').setAttribute('stroke-dashoffset',String(100-100*rem/ph.d));
 let j=W.i+1;while(j<W.ph.length&&W.ph[j].k!=='work')j++;const nw=W.ph[j];
 const nx=W.ph[W.i+1];$('#tsub').textContent=nx?'Next: '+nx.l:'Last one';
 let lab='',big='',next='';
 if(ph.k==='work'){const el=ph.d-rem;
  if(ph.m==='row'){lab='Row';big=rowCue()}else{const c=ph.c||[''],slot=Math.min(c.length-1,Math.floor(el/SLOT));lab='Now';big=c[slot];
   if(slot<c.length-1)next=`Next in ${Math.ceil((slot+1)*SLOT-el)} s: ${c[slot+1]}`}
  if(ph.surge){const E=ph.surge.every,L=ph.surge.len,pos=el%E,on=el>=E-L&&pos>=E-L&&rem>1;
   if(!W.paused&&on!==!!W.surgeOn){W.surgeOn=on;if(on){beep(1500,.12);setTimeout(()=>beep(1500,.12),180);buzz([100,60,100])}else beep(700,.25)}
   if(on){lab='Surge';big=SURGE[ph.m];next=`Back to base pace in ${Math.ceil(E-pos)} s`}
   else{const to=E-L-pos;if(el+to<ph.d-1)next=`Surge in ${Math.ceil(to)} s`+(next?' · '+next:'')}
   clk.classList.toggle('surge',on)}
  if(!next&&nw)next='After the rest: '+firstOf(nw)}
 else{lab=nw?'Next up':'';big=nw?firstOf(nw):'';next=ph.k==='rest'?(W.tier==='h'?'Walk it off. Breathe slow.':'Shake it out.'):'Get in your stance.'}
 $('#clab').textContent=lab;$('#combo').textContent=big;$('#cnext').textContent=next;
 if(!W.paused&&rem<=0){W.i++;if(W.i>=W.ph.length){finishTimer();return}startPhase()}
 T=setTimeout(tick,200)}
function finishTimer(){clearTimeout(T);beep(1040,.6);W.phase='condLog';W.doneRounds=W.ph.filter((p,i)=>p.k==='work'&&i<W.i).length;saveW();letSleep();V.view='condLog';render()}
function condLog(){const p=PR.find(x=>x.id===W.proto);head('Nice work.','How hard did that feel overall?');
 $('#app').innerHTML=`<div class="card"><div class="small">${p.n} · ${MODES[W.mode]||W.mode} · ${W.doneRounds} work rounds</div>
 <div class="seg" style="grid-template-columns:repeat(5,minmax(0,1fr))">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button data-rpe="${n}" aria-pressed="${W.rpe===n}">${n}</button>`).join('')}</div>
 <div class="small" style="margin-top:4px">1 = barely moving · 10 = could not do one more second</div>
 ${subModes(W.mode).includes('row')?`<label class="small" style="display:block;margin-top:12px">Meters rowed (optional)<input inputmode="numeric" id="meters" value="${esc(W.m||'')}"></label>`:''}
 <label class="small" style="display:block;margin-top:12px">Note (optional)<input id="cnote" value="${esc(W.note||'')}"></label></div>`;
 bar(`<button class="btn" data-act="saveCond" ${W.rpe?'':'disabled'}>Save session</button>`)}
function done(){head('Logged.',esc(V.summary||''));$('#app').innerHTML=`<div class="card">${V.doneHtml||''}</div>`;bar(`<button class="btn" data-go="home">Done</button>`)}

function histView(){head('History',S.sessions.length?`${S.sessions.length} sessions logged.`:'Nothing logged yet.');
 const done=EX.filter(e=>S.ex[e.id]&&S.ex[e.id].log.length);
 const since=Date.now()-30*864e5,recent=S.sessions.filter(x=>x.d>=since&&(x.kind==='str'||x.kind==='cond')),cnt={};
 for(const x of recent)for(const k in (x.body||{}))if(AL[k])cnt[k]=(cnt[k]||0)+1;
 const bodyHtml=Object.keys(cnt).length?`<div class="card"><h3>Body notes, last 30 days</h3><div class="small">Sessions where an area was flagged, out of ${recent.length}.</div>${Object.entries(cnt).sort((a,b)=>b[1]-a[1]).map(([k,n])=>`<div class="row" style="justify-content:space-between;margin-top:6px"><span>${AL[k]}</span><span class="chip">${n} of ${recent.length}</span></div>`).join('')}${Object.values(cnt).some(n=>n>=3)?'<div class="small" style="margin-top:8px">Something that keeps coming back is worth having looked at.</div>':''}</div>`:'';
 $('#app').innerHTML=bodyHtml+(done.length?`<div class="card"><h3>Lifts</h3><table><tr><th>Lift</th><th>Last</th><th style="text-align:right">Now</th></tr>${done.map(e=>{const x=S.ex[e.id],l=x.log[0];return `<tr><td>${e.n}</td><td class="small">${ago(l.d)}</td><td class="n">${e.k==='bb'&&x.e1?tm(e.id)+' lb TM':esc(fmtSet(e.id,l.sets[0]))+(e.k==='bw'?' reps':' lb')}</td></tr>`}).join('')}</table></div>`:'')+
 `<div class="card"><h3>Sessions</h3>${S.sessions.map(s=>`<div class="hist"><b>${esc(s.title)}</b> <span class="small">· ${new Date(s.d).toLocaleDateString()}</span><div class="small">${esc(s.detail)}</div>${s.body?`<div class="small">Noted: ${esc(hitTxt(Object.entries(s.body).filter(([k])=>AL[k])))}</div>`:''}</div>`).join('')||'<p class="muted">Your sessions will show here.</p>'}</div>`;bar()}

function setView(){head('Setup','Match these to your equipment.');const st=S.settings;
 $('#app').innerHTML=`<div class="card"><label>Barbell weight (lb)<input id="sBar" inputmode="decimal" value="${st.bar}"></label>
 <label style="display:block;margin-top:10px">Plate sizes you own (lb, commas)<input id="sPl" value="${st.plates.join(', ')}"></label>
 <label style="display:block;margin-top:10px">Kettlebells you own (lb, commas)<input id="sBells" value="${st.bells.join(', ')}"></label>
 <label style="display:block;margin-top:10px">Round barbell weights to (lb)<input id="sRound" inputmode="decimal" value="${inc()}"></label>
 <div class="small" style="margin-top:6px">2.5 lb means a 1.25 plate per side at most. Use 5 to skip the small plates.</div>
 <label style="display:block;margin-top:10px">Next competition (optional)<input id="sComp" type="date" value="${esc(st.comp||'')}"></label>
 <div class="small" style="margin-top:4px">Two weeks out: one set fewer. The last week: half the sets, same weights.</div>
 <button class="btn sm" style="margin-top:12px" data-act="saveSet">Save setup</button></div>
 <div class="card"><h3>Training maxes</h3><div class="small">Edit if a number looks wrong. Barbell lifts only.</div><table>${EX.filter(e=>e.k==='bb').map(e=>`<tr><td>${e.n}</td><td style="width:110px"><input inputmode="decimal" data-tm="${e.id}" value="${tm(e.id)??''}" placeholder="—" aria-label="${e.n} training max"></td></tr>`).join('')}</table>
 <button class="btn sm" style="margin-top:12px" data-act="saveTm">Save maxes</button></div>
 <div class="card"><div class="row" style="justify-content:space-between"><h3>Exercises</h3><button class="btn sm" data-act="exNew">+ Add</button></div>
 <div class="small">The list she picks from. Edit any exercise, add your own, or hide what you don't use — hidden ones keep their history.</div>
 ${GROUPS.map(([g])=>{const l=EX.filter(e=>e.p===g);return l.length?`<div class="grp">${g}</div>`+l.map(e=>`<div class="exrow${e.hide?' off':''}"><span><b>${e.n}</b><br><span class="small">${{bb:'Barbell',kb:'Kettlebell',bell:'Kettlebell sets',bw:'Bodyweight'}[e.k]} · ${[...e.t].map(x=>TIERS[x].n).join(', ')}${e.edited?' · edited':''}${e.base?'':' · yours'}</span></span><span class="row" style="flex-wrap:nowrap"><button class="btn ghost sm" data-act="exVis" data-id="${e.id}">${e.hide?'Show':'Hide'}</button><button class="btn ghost sm" data-act="exEdit" data-id="${e.id}">Edit</button></span></div>`).join(''):''}).join('')}</div>
 <div class="card"><h3>Backup</h3><div class="small">Copy your data to keep somewhere safe, or paste a backup to restore it.</div>
 <div class="row" style="margin-top:8px"><button class="btn ghost sm" data-act="copy">Copy data</button><span class="small" id="cmsg"></span></div>
 ${typeof claude==='undefined'?`<div class="row" style="margin-top:8px"><button class="btn ghost sm" data-act="dl">Download backup file</button><label class="btn ghost sm" style="display:inline-flex;align-items:center;cursor:pointer">Load backup file<input type="file" accept=".json,application/json" id="upl" style="display:none"></label></div>`:''}
 <textarea id="restore" rows="3" style="margin-top:8px" placeholder="Paste backup here"></textarea><button class="btn ghost sm" style="margin-top:8px" data-act="restore">Restore</button></div>`;bar()}

function exEdit(){const F=V.form;if(!F){V.view='settings';return render()}const isNew=!EXM[F.id],hist=!isNew&&S.ex[F.id]&&S.ex[F.id].log.length,base=BASE_EX.some(b=>b.id===F.id);
 head(isNew?'Add an exercise':'Edit exercise',isNew?'It shows up in the list for the energy levels you choose.':'Changes apply from her next workout.');
 const sch=[...F.t].map(x=>F.k==='bell'?`<div class="set3"><span>${TIERS[x].n}</span><input inputmode="numeric" data-fs="${x}.0" value="${esc(F.sch[x][0])}" aria-label="${TIERS[x].n} sets"><input data-fs="${x}.1" value="${esc(F.sch[x][1])}" aria-label="${TIERS[x].n} reps or distance"></div>`
  :`<div class="set3 four"><span>${TIERS[x].n}</span><input inputmode="numeric" data-fs="${x}.0" value="${esc(F.bw[x][0])}" aria-label="${TIERS[x].n} sets"><input inputmode="numeric" data-fs="${x}.1" value="${esc(F.bw[x][1])}" aria-label="${TIERS[x].n} fewest reps"><input inputmode="numeric" data-fs="${x}.2" value="${esc(F.bw[x][2])}" aria-label="${TIERS[x].n} most reps"></div>`).join('');
 $('#app').innerHTML=`<div class="card"><label>Name<input data-ff="n" value="${esc(F.n)}" maxlength="60"></label>
 <label style="display:block;margin-top:10px">Group<select data-ff="p">${GROUPS.map(([g])=>`<option ${g===F.p?'selected':''}>${g}</option>`).join('')}</select></label>
 <label style="display:block;margin-top:10px">How it's loaded<select data-ff="k" ${hist?'disabled':''}>${Object.entries(KINDS).map(([k,l])=>`<option value="${k}" ${k===F.k?'selected':''}>${l}</option>`).join('')}</select></label>
 ${hist?'<div class="small">Locked: this lift already has history logged this way.</div>':''}
 <div style="margin-top:12px">Offered on</div><div class="seg">${['h','s','t'].map(x=>`<button data-ft="${x}" aria-pressed="${F.t.includes(x)}">${TIERS[x].n}</button>`).join('')}</div>
 ${F.k==='bell'?`<div style="margin-top:12px">Sets and reps</div><div class="set3 hd"><span></span><span class="small">sets</span><span class="small">reps or distance</span></div>${sch}`:''}
 ${F.k==='bw'?`<div style="margin-top:12px">Sets and rep range</div><div class="set3 four hd"><span></span><span class="small">sets</span><span class="small">from</span><span class="small">to</span></div>${sch}
  <label style="display:block;margin-top:10px">Counted in<select data-ff="u"><option value="" ${F.u?'':'selected'}>Reps</option><option value="s" ${F.u==='s'?'selected':''}>Seconds</option></select></label>
  <label style="display:block;margin-top:10px">When every set hits the top, make it harder by…<input data-ff="harder" value="${esc(F.harder)}" maxlength="90"></label>`:''}
 ${F.k==='bb'||F.k==='kb'?`<div class="small" style="margin-top:12px">Sets and reps follow the energy level: ${F.k==='bb'?'4×3 heavy, 4×6 steady, 3×12 tired':'heavier bell for 5–8, 8–12 or 12–15 reps'}. A first-time test set sets the weight.</div>`:''}
 <label style="display:block;margin-top:12px">Coaching note (optional)<input data-ff="note" value="${esc(F.note)}" maxlength="90"></label>
 <div style="margin-top:12px">Puts load on</div><div class="body sm">${AREAS.map(([k,l])=>`<button data-fa="${k}" aria-pressed="${(F.a||[]).includes(k)}">${l}</button>`).join('')}</div>
 <div class="small" style="margin-top:4px">If she flags one of these as sore, this exercise isn’t suggested.</div>
 <div class="seg" style="margin-top:12px"><button data-fb="main" aria-pressed="${!!F.main}">Main lift</button><button data-fb="thigh" aria-pressed="${!!F.thigh}">Builds thighs too</button><button data-fb="grip" aria-pressed="${!!F.grip}">Hard on grip</button></div>
 <div class="small" style="margin-top:4px">Main lifts are suggested first on Fired up and Steady days. “Thighs too” adds a tag. “Hard on grip” lifts aren’t suggested around a gi class.</div>
 <p class="small" id="fmsg" style="color:var(--hot)"></p>
 ${base&&EXM[F.id]&&EXM[F.id].edited?'<button class="btn ghost sm" data-act="exReset">Reset to the original</button>':''}
 ${!isNew&&!base?(hist?'<div class="small">Has history — hide it instead of deleting.</div>':'<button class="btn ghost sm" data-act="exDel">Delete exercise</button>'):''}</div>`;
 bar(`<button class="btn ghost" data-act="exCancel">Cancel</button><button class="btn" data-act="exSave">Save</button>`)}
function formFrom(e){const o=JSON.parse(JSON.stringify({id:e.id,n:e.n,p:e.p,k:e.k,t:e.t,note:e.note||'',harder:e.harder||'',main:e.main||0,thigh:e.thigh||0,grip:e.grip||0,u:e.u||'',a:(e.a||[]).slice(),sch:e.sch||{},bw:e.bw||{}}));fillSch(o);return o}
function fillSch(F){for(const x of 'hst'){if(!F.sch[x])F.sch[x]=DEF_SCH.bell[x].slice();if(!F.bw[x])F.bw[x]=DEF_SCH.bw[x].slice()}}

// ---------- actions ----------
function finishLift(){const parts=[];
 for(const it of W.items){const ex=EXM[it.id],done=it.sets.filter(s=>s.done&&(ex.k==='bw'?+s.r>0:+s.w>0));if(!done.length)continue;const e=exS(it.id);
  const sets=done.map(s=>[+s.w||0,ex.k==='bell'?s.r:+s.r]);e.log.unshift({d:Date.now(),tier:W.tier,sets});e.log.length=Math.min(e.log.length,20);
  if(ex.k==='bb'||ex.k==='kb'){const old=e.e1||it.e1;const ls=it.sets[it.sets.length-1];
   if(W.tier!=='t'&&!lockEst()&&ls.done&&+ls.w>0&&+ls.r>0){const est=epley(+ls.w,+ls.r);
    // first estimate as-is; rises capped at +5%/session; drops close 25% of the gap so one bad day can't crater the numbers
    e.e1=!old?est:est>old?Math.min(est,old*1.05):old-(old-est)*.25}
   else if(!e.e1&&old)e.e1=old}
  parts.push(`${ex.n} ${sets.map(s=>fmtSet(it.id,s)).join(', ')}`)}
 if(!parts.length){V.view='lift';return render()}
 S.sessions.unshift({d:Date.now(),kind:'str',tier:W.tier,title:`${TIERS[W.tier].n} strength`,detail:parts.join(' · '),body:bodySnap()});save();
 V.summary=`${parts.length} lift${parts.length>1?'s':''} saved. Next time these numbers are waiting for you.`;
 V.doneHtml=W.items.filter(it=>EXM[it.id].k==='bb'&&S.ex[it.id]&&S.ex[it.id].e1).map(it=>`<div class="row" style="justify-content:space-between"><span>${EXM[it.id].n}</span><span class="chip">TM ${tm(it.id)} lb</span></div>`).join('')||'<p class="muted">Saved.</p>';
 W=null;saveW();V.view='done';render()}

document.addEventListener('click',ev=>{const b=ev.target.closest('button,[data-pick]');if(!b)return;const d=b.dataset;
 if(d.go){if(W&&V.view==='timer')return;V.view=d.go;if(d.go==='home'&&W)V.view=W.type==='str'?'lift':W.phase;return render()}
 if(d.type){V.type=d.type;V.view='feel';return render()}
 if(d.tier){const ed=W&&W.type==='str'&&V.type==='str';V.tier=d.tier;if(!ed)V.sel=[];V.proto=null;V.rounds=null;V.plan=null;V.view=V.type==='str'?'pick':'condPick';return render()}
 if(d.pick){const i=V.sel.indexOf(d.pick);i<0?V.sel.push(d.pick):V.sel.splice(i,1);const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(d.mode){V.mode=d.mode;return render()}
 if(d.proto){V.proto=d.proto;V.rounds=null;return render()}
 if(d.rd){const p=PR.find(x=>x.id===V.proto);V.rounds=Math.max(1,Math.min(30,(V.rounds??p.rounds)+ +d.rd));return render()}
 if(d.ft&&V.form){const F=V.form;F.t=F.t.includes(d.ft)?F.t.replace(d.ft,''):[...'hst'].filter(x=>F.t.includes(x)||x===d.ft).join('');const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(d.fa&&V.form){const A=V.form.a=V.form.a||[],i=A.indexOf(d.fa);i<0?A.push(d.fa):A.splice(i,1);b.setAttribute('aria-pressed',String(i<0));return}
 if(d.fb&&V.form){V.form[d.fb]=V.form[d.fb]?0:1;b.setAttribute('aria-pressed',String(!!V.form[d.fb]));return}
 if(d.body){const k=d.body,cur=(S.body[k]&&S.body[k].l)||0,nx=(cur+1)%3;if(nx)S.body[k]={l:nx,d:Date.now()};else delete S.body[k];save();const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(d.bjj){const now=Date.now(),b=bjj();
  if(d.bjj==='soon'){S.bjjNext=b.soon?0:now}
  else{const gi=d.bjj==='gi';if(b.rolled&&b.rolled.gi===gi)S.sessions.splice(S.sessions.indexOf(b.rolled),1);
   else{if(b.rolled)S.sessions.splice(S.sessions.indexOf(b.rolled),1);S.sessions.unshift({d:now,kind:'bjj',gi,title:`Jiu-jitsu · ${gi?'gi':'no-gi'}`,detail:'Class logged'});S.bjjNext=0}}
  save();const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(d.chk){const [i,j]=d.chk.split('.').map(Number);const s=W.items[i].sets[j];s.done=!s.done;b.setAttribute('aria-pressed',s.done);saveW();return}
 if(d.rpe){W.rpe=+d.rpe;W.m=($('#meters')||{}).value;W.note=$('#cnote').value;saveW();return render()}
 const a=d.act;if(!a)return;
 if(a==='bodyOpen'){V.bodyOpen=true;const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(a==='bodyClear'){V.bodyOpen=false;S.body={};save();const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(a==='useSug'){V.sel=suggest(V.tier).map(s=>s.id);return render()}
 if(a==='startLift'){if(W&&W.type==='str'){W.items=V.sel.map(id=>mergeItem(W.items.find(i=>i.id===id),id,V.tier));W.tier=V.tier}
  else W={type:'str',tier:V.tier,items:V.sel.map(id=>buildItem(id,V.tier))};saveW();V.view='lift';return render()}
 if(a==='editLift'){V.type='str';V.tier=W.tier;V.sel=W.items.map(i=>i.id);V.view='pick';return render()}
 if(a==='backLift'){V.view='lift';return render()}
 if(a==='backPick'){V.view='pick';return render()}
 if(a==='chgTier'){V.type='str';V.view='feel';return render()}
 if(a==='cal'){const i=+d.i,it=W.items[i];const w=+document.querySelector(`[data-cal=w][data-i="${i}"]`).value,r=+document.querySelector(`[data-cal=r][data-i="${i}"]`).value;
  if(!(w>0&&r>0)){b.textContent='Enter the weight and reps first';return}
  it.e1=epley(w,r);it.cal=false;const p=prescribe(it.id,W.tier,it.e1);
  it.sets=[{w,r,done:true}].concat(Array.from({length:Math.max(1,p.n-1)},()=>({w:p.w,r:p.reps,done:false})));saveW();const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(a==='addSet'){const it=W.items[+d.i],l=it.sets[it.sets.length-1]||{w:'',r:''};it.sets.push({w:l.w,r:l.r,done:false});saveW();const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(a==='finishLift')return finishLift();
 if(a==='quit'){if(b.dataset.sure){W=null;saveW();V.sel=[];V.view='home';return render()}b.dataset.sure=1;b.textContent='Tap again to discard';return}
 if(a==='useCond'){const sg=suggestCond(V.tier);V.proto=sg.id;V.mode=sg.mode;V.rounds=null;return render()}
 if(a==='testSound'){audio();[0,1,2].forEach(k=>setTimeout(()=>beep(880,.15),k*1000));setTimeout(()=>beep(1320,.6),3000);return}
 if(a==='shuffle'){V.planKey=null;const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(a==='startCond'){const p=PR.find(x=>x.id===V.proto),R=V.rounds??p.rounds;audio();
  keepAwake();
  W={type:'cond',phase:'timer',tier:V.tier,proto:p.id,mode:V.mode,rounds:R,ph:V.plan||buildPhases(p,R,V.mode,V.tier),i:0};V.plan=null;V.planKey=null;startPhase();saveW();V.view='timer';return render()}
 if(a==='pause'){const lv=$('#leave');if(lv){delete lv.dataset.sure;lv.textContent='Change workout'}if(W.paused){W.paused=false;W.endAt=Date.now()+W.rem*1000;b.textContent='Pause'}else{W.paused=true;W.rem=Math.max(0,(W.endAt-Date.now())/1000);b.textContent='Resume'}saveW();return}
 if(a==='skip'){W.i++;W.paused=false;$('#pbtn').textContent='Pause';if(W.i>=W.ph.length)return finishTimer();startPhase();return}
 if(a==='endCond')return finishTimer();
 if(a==='leaveTimer'){if(!b.dataset.sure){if(!W.paused){W.paused=true;W.rem=Math.max(0,(W.endAt-Date.now())/1000);const pb=$('#pbtn');if(pb)pb.textContent='Resume';saveW()}
   b.dataset.sure=1;b.textContent='Paused · tap again to leave without saving';return}
  clearTimeout(T);letSleep();V.type='cond';V.tier=W.tier;V.proto=W.proto;V.mode=W.mode;V.rounds=W.rounds;V.plan=null;W=null;saveW();V.view='condPick';return render()}
 if(a==='saveCond'){W.m=($('#meters')||{}).value||'';W.note=$('#cnote').value;const p=PR.find(x=>x.id===W.proto);
  S.cond[W.mode+':'+W.proto]={d:Date.now(),rpe:W.rpe,m:W.m,rounds:W.doneRounds};
  S.sessions.unshift({d:Date.now(),kind:'cond',body:bodySnap(),tier:W.tier,title:`${p.n} — ${MODES[W.mode]||W.mode}`,detail:`${W.doneRounds} rounds · effort ${W.rpe}/10${W.m?' · '+W.m+' m':''}${W.note?' · '+W.note:''}`});save();
  V.summary='Conditioning saved.';V.doneHtml=`<p class="muted">${esc(S.sessions[0].detail)}</p>`;W=null;saveW();V.view='done';return render()}
 if(a==='saveSet'){const nums=id=>$(id).value.split(/[ ,]+/).map(Number).filter(x=>x>0).sort((x,y)=>x-y);const bw=+$('#sBar').value,pl=nums('#sPl'),bl=nums('#sBells');
  const ro=+$('#sRound').value;if(ro>0)S.settings.round=ro;const cv=$('#sComp').value;S.settings.comp=/^\d{4}-\d{2}-\d{2}$/.test(cv)?cv:'';if(bw>0)S.settings.bar=bw;if(pl.length)S.settings.plates=pl;if(bl.length)S.settings.bells=bl;save();render();return}
 if(a==='saveTm'){document.querySelectorAll('[data-tm]').forEach(inp=>{const v=+inp.value;if(v>0){const e=exS(inp.dataset.tm);if(tm(inp.dataset.tm)!==v)e.e1=v/0.9}});save();b.textContent='Saved';return}
 if(a==='exNew'){V.form=formFrom({id:'c'+Date.now().toString(36),n:'',p:'Glutes',k:'bw',t:'st'});V.view='exEdit';return render()}
 if(a==='exEdit'){V.form=formFrom(EXM[d.id]);V.view='exEdit';return render()}
 if(a==='exCancel'){V.form=null;V.view='settings';return render()}
 if(a==='exVis'){const h=S.exHidden,i=h.indexOf(d.id);i<0?h.push(d.id):h.splice(i,1);save();rebuildEx();const y=window.scrollY;render();window.scrollTo(0,y);return}
 if(a==='exSave'){const F=V.form;if(!clean(F.n)){$('#fmsg').textContent='Give it a name.';return}if(!F.t){$('#fmsg').textContent='Pick at least one energy level.';return}
  const keep=Object.assign({},F);keep.sch={};keep.bw={};for(const x of F.t){keep.sch[x]=F.sch[x];keep.bw[x]=F.bw[x]}if(F.k!=='bell')delete keep.sch;if(F.k!=='bw')delete keep.bw;
  const n=normDef(keep);S.exDefs[n.id]=n;save();rebuildEx();V.form=null;V.view='settings';return render()}
 if(a==='exReset'){delete S.exDefs[V.form.id];save();rebuildEx();V.form=null;V.view='settings';return render()}
 if(a==='exDel'){if(!b.dataset.sure){b.dataset.sure=1;b.textContent='Tap again to delete';return}delete S.exDefs[V.form.id];S.exHidden=S.exHidden.filter(x=>x!==V.form.id);save();rebuildEx();V.form=null;V.view='settings';return render()}
 if(a==='copy'){navigator.clipboard.writeText(JSON.stringify(S)).then(()=>$('#cmsg').textContent='Copied.').catch(()=>{$('#restore').value=JSON.stringify(S);$('#cmsg').textContent='Copy it from the box below.'});return}
 if(a==='dl'){const url=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));const l=document.createElement('a');l.href=url;l.download='willow-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);$('#cmsg').textContent='Saved to downloads.';return}
 if(a==='restore'){try{const d=JSON.parse($('#restore').value);if(d.v!==1)throw 0;S=migrate(d);rebuildEx();save();b.textContent='Restored'}catch(e){b.textContent='That is not a valid backup'}return}
});
document.addEventListener('change',ev=>{if(ev.target.tagName==='SELECT'&&formField(ev.target))return;if(ev.target.id!=='upl'||!ev.target.files[0])return;ev.target.files[0].text().then(t=>{$('#restore').value=t;$('#cmsg').textContent='Loaded — tap Restore to apply.'})});
document.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&ev.target.dataset&&ev.target.dataset.pick){ev.preventDefault();ev.target.click()}});
function formField(t){const d=t.dataset,F=V.form;if(!F)return false;
 if(d.ff){F[d.ff]=t.value;if(d.ff==='k'&&t.tagName==='SELECT'){const y=window.scrollY;render();window.scrollTo(0,y)}return true}
 if(d.fs){const [x,i]=d.fs.split('.');(F.k==='bell'?F.sch:F.bw)[x][+i]=t.value;return true}return false}
document.addEventListener('input',ev=>{const t=ev.target,d=t.dataset;if(formField(t))return;if(d.k&&W){const [i,j]=d.k.split('.').map(Number);W.items[i].sets[j][d.f]=t.value;saveW()}});
render();
}
