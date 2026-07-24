(() => {
'use strict';

const APP_VERSION = '3.0.0';
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nl = value => esc(value).replace(/\n/g,'<br>');
const today = () => new Date().toISOString().slice(0,10);
const currentMonth = () => new Date().toISOString().slice(0,7);
const nowIso = () => new Date().toISOString();
const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`.toUpperCase();
const number = value => Number(value) || 0;
const clamp = (value,min,max) => Math.max(min,Math.min(max,number(value)));
const load = (key,fallback=[]) => { try { const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
const save = (key,value) => { localStorage.setItem(key,JSON.stringify(value)); window.SafeOSStorage?.mirror?.(key,value); window.SafeOSSecurity?.log?.('save',key); signalSaved(); };
const val = id => ($('#'+id)?.value ?? '').trim();
const setVal = (id,value='') => { const el=$('#'+id); if(el) el.value=value ?? ''; };
const setText = (id,value) => { const el=$('#'+id); if(el) el.textContent=value; };
const fmt = value => {
  if(!value) return '—';
  const source=String(value);
  const date=new Date(source.length===7?source+'-01T00:00:00':source.length===10?source+'T00:00:00':source);
  return Number.isNaN(date.getTime())?source:date.toLocaleDateString(document.documentElement.lang||'en',{year:'numeric',month:'short',day:source.length===7?undefined:'2-digit'});
};
const cleanFilePart = (value,fallback='SafeOS') => String(value||fallback).normalize('NFKD').replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'_').slice(0,70)||fallback;
const daysUntil = value => {
  if(!value) return null;
  const target=new Date(String(value).length===10?value+'T00:00:00':value);
  const base=new Date(today()+'T00:00:00');
  if(Number.isNaN(target.getTime())) return null;
  return Math.ceil((target-base)/86400000);
};
const closedStatus = status => ['Completed','Closed','Cancelled','Archived','Superseded','Disposed'].includes(status);

const KEYS = Object.freeze({
  projects:'safeos3-projects', training:'safeos3-training', assets:'safeos3-assets', permits:'safeos3-permits',
  drills:'safeos3-drills', environment:'safeos3-environment', documents:'safeos3-documents', legal:'safeos3-legal',
  performance:'safeos3-performance', publicReports:'safeos3-public-reports', config:'safeos3-config'
});
const BASE = Object.freeze({
  company:'hseqt2-company', risks:'hseqt2-risks', jsas:'hseqt2-jsas', incidents:'hseqt2-incidents',
  toolboxes:'hseqt2-toolboxes', inspections:'hseqt2-inspections', capa:'hseqt2-capa'
});
const defaultConfig={publicEmail:'',rateBasis:200000,expiryWindow:30,jurisdiction:'',role:'Administrator',complianceTarget:90};
const getConfig=()=>({...defaultConfig,...load(KEYS.config,{})});

let toastTimer;
function toast(message){
  const el=$('#toast'); if(!el) return;
  el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),2800);
}
function signalSaved(){
  const status=$('#autosaveStatus'); if(status){ status.textContent='SafeOS data saved'; setTimeout(()=>status.textContent='Local data ready',1600); }
  updateAll();
}
function go(page){
  const target=$('#page-'+page); if(!target) return;
  $$('.page').forEach(section=>section.classList.toggle('active',section===target));
  $$('.nav-link').forEach(link=>link.classList.toggle('active',link.dataset.nav===page));
  $('#sidebar')?.classList.remove('open');
  $('#menuBtn')?.setAttribute('aria-expanded','false');
  if(location.hash!=='#'+page) history.pushState({safeosPage:page},'','#'+page);
  window.scrollTo({top:0,behavior:'smooth'});
  if(page==='dashboard') renderDashboard();
  if(page==='analytics') renderAnalytics();
  if(page==='public') renderPublicArea();
}

function ref(prefix){
  const company=load(BASE.company,{}); const p=cleanFilePart(company.prefix||'HSE','HSE').toUpperCase();
  return `${p}-${prefix}-${today().replaceAll('-','')}-${Math.random().toString(36).slice(2,5).toUpperCase()}`;
}
function badge(status){
  const lower=String(status||'').toLowerCase();
  const cls=/closed|completed|compliant|approved|competent|satisfactory|in service|active/.test(lower)?'good':/critical|emergency|expired|non-compliant|unsatisfactory|quarantined/.test(lower)?'bad':/due|progress|review|planned|partial|hold|suspended|closing|needs/.test(lower)?'warn':'neutral';
  return `<span class="status-badge ${cls}">${esc(status||'—')}</span>`;
}
function manageButtons(name,id,extra=''){
  return `<div class="table-actions">${extra}<button class="mini-btn" data-registry="${name}" data-action="edit" data-id="${esc(id)}">Edit</button><button class="mini-btn danger-mini" data-registry="${name}" data-action="delete" data-id="${esc(id)}">Delete</button></div>`;
}
function dueLabel(date,windowDays=getConfig().expiryWindow){
  const days=daysUntil(date); if(days===null) return '<span class="muted">No date</span>';
  if(days<0) return `<span class="due-label overdue">Expired ${Math.abs(days)}d</span>`;
  if(days<=windowDays) return `<span class="due-label soon">Due ${days}d</span>`;
  return `<span>${esc(fmt(date))}</span>`;
}
function downloadBlob(filename,blob){
  const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download=filename; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(()=>URL.revokeObjectURL(link.href),1200);
}
function downloadCsv(filename,headers,rows){
  const all=[headers,...rows];
  const csv='\ufeff'+all.map(row=>row.map(cell=>`"${String(cell??'').replaceAll('"','""')}"`).join(',')).join('\r\n');
  downloadBlob(filename,new Blob([csv],{type:'text/csv;charset=utf-8'}));
}

const registries={
  projects:{
    key:KEYS.projects, edit:'projEditId', save:'saveProject', cancel:'cancelProjectEdit', title:'projectFormTitle', body:'projectTableBody', titleNew:'Add project / site', titleEdit:'Edit project / site',
    fields:['projCode','projName','projClient','projLocation','projManager','projHseLead','projWorkforce','projStatus','projStart','projEnd','projScope'], required:['projName'],
    defaults:{projCode:()=>ref('PRJ'),projStatus:'Active',projStart:today},
    row:(r,i)=>`<tr><td>${i+1}</td><td><strong>${esc(r.projCode||'—')}</strong><br>${esc(r.projName)}</td><td>${esc(r.projLocation||'—')}</td><td>${esc(r.projClient||'—')}</td><td>${esc(r.projManager||'—')}<br><small>HSE: ${esc(r.projHseLead||'—')}</small></td><td>${number(r.projWorkforce).toLocaleString()}</td><td>${fmt(r.projStart)}<br><small>to ${fmt(r.projEnd)}</small></td><td>${badge(r.projStatus)}</td><td>${manageButtons('projects',r.id)}</td></tr>`,
    filter:r=>{const q=val('projectSearch').toLowerCase(),st=val('projectFilterStatus');return(!q||[r.projCode,r.projName,r.projClient,r.projLocation,r.projManager,r.projHseLead].join(' ').toLowerCase().includes(q))&&(!st||r.projStatus===st);},
    headers:['Code','Project / Site','Client','Location','Project Manager','HSE Lead','Workforce','Status','Start Date','End Date','Scope'],
    export:r=>[r.projCode,r.projName,r.projClient,r.projLocation,r.projManager,r.projHseLead,r.projWorkforce,r.projStatus,r.projStart,r.projEnd,r.projScope]
  },
  training:{
    key:KEYS.training,edit:'trainingEditId',save:'saveTraining',cancel:'cancelTrainingEdit',title:'trainingFormTitle',body:'trainingTableBody',titleNew:'Add training record',titleEdit:'Edit training record',
    fields:['trainingRef','trainingTopic','trainingType','trainingSite','trainingDate','trainingExpiry','trainingTrainer','trainingStatus','trainingPlanned','trainingAttendees','trainingResult','trainingEvidence'],required:['trainingTopic'],
    defaults:{trainingRef:()=>ref('TRN'),trainingDate:today,trainingType:'Induction',trainingStatus:'Planned',trainingResult:'Not Assessed'},
    row:(r,i)=>`<tr><td>${i+1}</td><td><strong>${esc(r.trainingRef||'—')}</strong><br>${esc(r.trainingTopic)}</td><td>${esc(r.trainingType)}<br><small>${esc(r.trainingSite||'—')}</small></td><td>${fmt(r.trainingDate)}<br>${dueLabel(r.trainingExpiry)}</td><td>${number(r.trainingPlanned)}</td><td>${number(r.trainingAttendees)}</td><td>${badge(r.trainingResult)}</td><td>${badge(r.trainingStatus)}</td><td>${manageButtons('training',r.id)}</td></tr>`,
    filter:r=>{const q=val('trainingSearch').toLowerCase(),st=val('trainingFilterStatus'),only=$('#trainingOnlyDue')?.checked;const due=daysUntil(r.trainingExpiry);return(!q||[r.trainingRef,r.trainingTopic,r.trainingType,r.trainingSite,r.trainingTrainer,r.trainingEvidence].join(' ').toLowerCase().includes(q))&&(!st||r.trainingStatus===st)&&(!only||(due!==null&&due<=getConfig().expiryWindow));},
    headers:['Reference','Topic','Type','Site','Date','Expiry / Refresher','Trainer','Planned','Attended','Assessment Result','Status','Evidence'],
    export:r=>[r.trainingRef,r.trainingTopic,r.trainingType,r.trainingSite,r.trainingDate,r.trainingExpiry,r.trainingTrainer,r.trainingPlanned,r.trainingAttendees,r.trainingResult,r.trainingStatus,r.trainingEvidence]
  },
  assets:{
    key:KEYS.assets,edit:'assetEditId',save:'saveAsset',cancel:'cancelAssetEdit',title:'assetFormTitle',body:'assetTableBody',titleNew:'Add equipment / certificate',titleEdit:'Edit equipment / certificate',
    fields:['assetRef','assetCategory','assetDescription','assetSerial','assetSite','assetOwner','assetInspectionDue','assetCertificateDue','assetStatus','assetEvidence'],required:['assetDescription'],
    defaults:{assetRef:()=>ref('AST'),assetCategory:'Heavy Equipment',assetStatus:'In Service'},
    row:(r,i)=>`<tr><td>${i+1}</td><td><strong>${esc(r.assetRef||'—')}</strong><br>${esc(r.assetDescription)}</td><td>${esc(r.assetSerial||'—')}<br><small>${esc(r.assetSite||'—')}</small></td><td>${dueLabel(r.assetInspectionDue)}</td><td>${dueLabel(r.assetCertificateDue)}</td><td>${badge(r.assetStatus)}</td><td>${esc(r.assetEvidence||'—')}</td><td>${manageButtons('assets',r.id)}</td></tr>`,
    headers:['Reference','Category','Description','Serial / Registration','Site','Owner','Inspection Due','Certificate Expiry','Status','Evidence'],
    export:r=>[r.assetRef,r.assetCategory,r.assetDescription,r.assetSerial,r.assetSite,r.assetOwner,r.assetInspectionDue,r.assetCertificateDue,r.assetStatus,r.assetEvidence]
  },
  permits:{
    key:KEYS.permits,edit:'permitEditId',save:'savePermit',cancel:'cancelPermitEdit',title:'permitFormTitle',body:'permitTableBody',titleNew:'Add permit to work',titleEdit:'Edit permit to work',
    fields:['permitRef','permitType','permitSite','permitArea','permitIssuer','permitReceiver','permitIssue','permitExpiry','permitStatus','permitEvidence'],required:['permitRef','permitType'],
    defaults:{permitRef:()=>ref('PTW'),permitType:'Hot Work',permitStatus:'Draft'},
    row:(r,i)=>`<tr><td>${i+1}</td><td><strong>${esc(r.permitRef)}</strong><br>${esc(r.permitType)}</td><td>${esc(r.permitSite||'—')}<br><small>${esc(r.permitArea||'—')}</small></td><td>${esc(r.permitIssuer||'—')}<br><small>Receiver: ${esc(r.permitReceiver||'—')}</small></td><td>${fmt(r.permitIssue)}<br>${dueLabel(r.permitExpiry,0)}</td><td>${badge(r.permitStatus)}</td><td>${manageButtons('permits',r.id)}</td></tr>`,
    headers:['Permit Reference','Type','Site','Area / Equipment','Issuer','Receiver','Issue Date / Time','Valid Until','Status','Evidence'],
    export:r=>[r.permitRef,r.permitType,r.permitSite,r.permitArea,r.permitIssuer,r.permitReceiver,r.permitIssue,r.permitExpiry,r.permitStatus,r.permitEvidence]
  },
  drills:{
    key:KEYS.drills,edit:'drillEditId',save:'saveDrill',cancel:'cancelDrillEdit',title:'drillFormTitle',body:'drillTableBody',titleNew:'Add emergency drill',titleEdit:'Edit emergency drill',
    fields:['drillRef','drillType','drillSite','drillDate','drillResponse','drillParticipants','drillScore','drillStatus','drillFindings'],required:['drillType','drillSite'],
    defaults:{drillRef:()=>ref('DRL'),drillType:'Fire / Evacuation',drillDate:today,drillStatus:'Satisfactory'},
    row:(r,i)=>`<tr><td>${i+1}</td><td><strong>${esc(r.drillRef||'—')}</strong><br>${esc(r.drillType)}</td><td>${esc(r.drillSite)}<br><small>${fmt(r.drillDate)}</small></td><td>${number(r.drillResponse).toFixed(1)} min</td><td>${number(r.drillParticipants)}</td><td><strong>${clamp(r.drillScore,0,100)}%</strong></td><td>${badge(r.drillStatus)}<br><small>${esc(r.drillFindings||'—')}</small></td><td>${manageButtons('drills',r.id)}</td></tr>`,
    headers:['Reference','Type','Site','Date','Response Time (min)','Participants','Score %','Status','Findings'],
    export:r=>[r.drillRef,r.drillType,r.drillSite,r.drillDate,r.drillResponse,r.drillParticipants,r.drillScore,r.drillStatus,r.drillFindings]
  },
  environment:{
    key:KEYS.environment,edit:'envEditId',save:'saveEnvironment',cancel:'cancelEnvironmentEdit',title:'envFormTitle',body:'environmentTableBody',titleNew:'Add monthly environmental data',titleEdit:'Edit environmental data',
    fields:['envMonth','envSite','envWater','envElectricity','envFuel','envWaste','envRecycled','envSpills'],required:['envMonth','envSite'],
    defaults:{envMonth:currentMonth},
    row:(r,i)=>{const rate=number(r.envWaste)?number(r.envRecycled)/number(r.envWaste)*100:0;return `<tr><td>${i+1}</td><td><strong>${fmt(r.envMonth)}</strong><br>${esc(r.envSite)}</td><td>${number(r.envWater).toLocaleString()} m³</td><td>${number(r.envElectricity).toLocaleString()} kWh</td><td>${number(r.envFuel).toLocaleString()} L</td><td>${number(r.envWaste).toLocaleString()} kg</td><td>${number(r.envRecycled).toLocaleString()} kg</td><td>${rate.toFixed(1)}%</td><td>${number(r.envSpills)}</td><td>${manageButtons('environment',r.id)}</td></tr>`;},
    headers:['Month','Site','Water m3','Electricity kWh','Fuel L','Total Waste kg','Recycled kg','Spills'],
    export:r=>[r.envMonth,r.envSite,r.envWater,r.envElectricity,r.envFuel,r.envWaste,r.envRecycled,r.envSpills]
  },
  documents:{
    key:KEYS.documents,edit:'docEditId',save:'saveDocument',cancel:'cancelDocumentEdit',title:'documentFormTitle',body:'documentTableBody',titleNew:'Add controlled document',titleEdit:'Edit controlled document',
    fields:['docRef','docTitle','docType','docRevision','docOwner','docIssue','docReview','docStatus','docLocation'],required:['docTitle'],
    defaults:{docRef:()=>ref('DOC'),docType:'Procedure / SOP',docRevision:'00',docIssue:today,docStatus:'Draft'},
    row:(r,i)=>`<tr><td>${i+1}</td><td><strong>${esc(r.docRef||'—')}</strong><br>${esc(r.docTitle)}</td><td>${esc(r.docType)}<br><small>Rev ${esc(r.docRevision||'—')}</small></td><td>${esc(r.docOwner||'—')}</td><td>${fmt(r.docIssue)}<br>${dueLabel(r.docReview)}</td><td>${badge(r.docStatus)}</td><td>${esc(r.docLocation||'—')}</td><td>${manageButtons('documents',r.id)}</td></tr>`,
    headers:['Reference','Title','Type','Revision','Owner','Issue Date','Review Date','Status','File Location / Notes'],
    export:r=>[r.docRef,r.docTitle,r.docType,r.docRevision,r.docOwner,r.docIssue,r.docReview,r.docStatus,r.docLocation]
  },
  legal:{
    key:KEYS.legal,edit:'legalEditId',save:'saveLegal',cancel:'cancelLegalEdit',title:'legalFormTitle',body:'legalTableBody',titleNew:'Add legal / other obligation',titleEdit:'Edit legal / other obligation',
    fields:['legalJurisdiction','legalAuthority','legalObligation','legalOwner','legalEvidence','legalReview','legalStatus'],required:['legalObligation'],
    defaults:{legalJurisdiction:()=>getConfig().jurisdiction,legalStatus:'Not Assessed'},
    row:(r,i)=>`<tr><td>${i+1}</td><td><strong>${esc(r.legalJurisdiction||'—')}</strong><br>${esc(r.legalAuthority||'—')}</td><td>${nl(r.legalObligation)}</td><td>${esc(r.legalOwner||'—')}</td><td>${esc(r.legalEvidence||'—')}</td><td>${dueLabel(r.legalReview)}</td><td>${badge(r.legalStatus)}</td><td>${manageButtons('legal',r.id)}</td></tr>`,
    headers:['Jurisdiction','Authority / Source','Requirement / Obligation','Owner','Evidence','Review Date','Compliance Status'],
    export:r=>[r.legalJurisdiction,r.legalAuthority,r.legalObligation,r.legalOwner,r.legalEvidence,r.legalReview,r.legalStatus]
  },
  performance:{
    key:KEYS.performance,edit:'perfEditId',save:'savePerformance',cancel:'cancelPerformanceEdit',title:'performanceFormTitle',body:'performanceTableBody',titleNew:'Add monthly performance data',titleEdit:'Edit monthly performance data',
    fields:['perfMonth','perfSite','perfHours','perfWorkforce','perfRecordables','perfLti','perfLostDays','perfNearMisses','perfInspections','perfTrainings','perfObservations','perfConsultations'],required:['perfMonth','perfSite'],
    defaults:{perfMonth:currentMonth},
    row:(r,i)=>`<tr><td>${i+1}</td><td><strong>${fmt(r.perfMonth)}</strong><br>${esc(r.perfSite)}</td><td>${number(r.perfHours).toLocaleString()}<br><small>WF ${number(r.perfWorkforce)}</small></td><td>${number(r.perfRecordables)} / ${number(r.perfLti)}</td><td>${number(r.perfLostDays)}</td><td>${number(r.perfNearMisses)}</td><td>${number(r.perfInspections)}</td><td>${number(r.perfTrainings)}</td><td>${number(r.perfObservations)}</td><td>${number(r.perfConsultations)}</td><td>${manageButtons('performance',r.id)}</td></tr>`,
    headers:['Month','Site','Hours Worked','Average Workforce','Recordable Cases','Lost Time Injuries','Lost Days','Near Misses','Inspections / Audits','Training Sessions','Safety Observations','Worker Consultations'],
    export:r=>[r.perfMonth,r.perfSite,r.perfHours,r.perfWorkforce,r.perfRecordables,r.perfLti,r.perfLostDays,r.perfNearMisses,r.perfInspections,r.perfTrainings,r.perfObservations,r.perfConsultations]
  }
};

function resolveDefault(value){return typeof value==='function'?value():value;}
function clearRegistry(name){
  const def=registries[name]; if(!def) return;
  setVal(def.edit,''); def.fields.forEach(id=>setVal(id,''));
  Object.entries(def.defaults||{}).forEach(([id,value])=>setVal(id,resolveDefault(value)));
  setText(def.title,def.titleNew); $('#'+def.cancel)?.classList.add('hidden');
}
function collectRegistry(name){
  const def=registries[name]; const data={}; def.fields.forEach(id=>data[id]=val(id)); return data;
}
function saveRegistry(name){
  const def=registries[name], data=collectRegistry(name);
  const missing=def.required.filter(id=>!data[id]); if(missing.length){toast('Complete the required information before saving');return;}
  const rows=load(def.key,[]), editId=val(def.edit), existing=rows.find(r=>r.id===editId);
  const record={id:existing?.id||uid(name.slice(0,3).toUpperCase()),createdAt:existing?.createdAt||nowIso(),updatedAt:nowIso(),...data};
  const index=rows.findIndex(r=>r.id===record.id); if(index>=0) rows[index]=record; else rows.unshift(record);
  save(def.key,rows); clearRegistry(name); renderRegistry(name); toast(index>=0?'Record updated':'Record saved');
}
function editRegistry(name,id){
  const def=registries[name], record=load(def.key,[]).find(r=>r.id===id); if(!record) return;
  setVal(def.edit,record.id); def.fields.forEach(field=>setVal(field,record[field]??'')); setText(def.title,def.titleEdit); $('#'+def.cancel)?.classList.remove('hidden');
  go(pageForRegistry(name)); window.scrollTo({top:0,behavior:'smooth'});
}
function deleteRegistry(name,id){
  const def=registries[name]; if(!def||!confirm('Delete this local SafeOS record?')) return;
  save(def.key,load(def.key,[]).filter(r=>r.id!==id)); renderRegistry(name); toast('Record deleted');
}
function renderRegistry(name){
  const def=registries[name], body=$('#'+def.body); if(!def||!body) return;
  let rows=load(def.key,[]); if(def.filter) rows=rows.filter(def.filter);
  body.innerHTML=rows.length?rows.map((r,i)=>def.row(r,i)).join(''):`<tr><td colspan="20"><div class="empty-state">No records saved yet.</div></td></tr>`;
  updateRegistryStats(); updateSiteOptions();
}
function pageForRegistry(name){return({projects:'projects',training:'training',assets:'assets',permits:'assets',drills:'emergency',environment:'emergency',documents:'compliance',legal:'compliance',performance:'analytics'})[name]||'dashboard';}

Object.entries(registries).forEach(([name,def])=>{
  $('#'+def.save)?.addEventListener('click',()=>saveRegistry(name));
  $('#'+def.cancel)?.addEventListener('click',()=>clearRegistry(name));
});
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-registry][data-action]'); if(!button) return;
  const {registry,action,id}=button.dataset; if(action==='edit') editRegistry(registry,id); if(action==='delete') deleteRegistry(registry,id);
});
['projectSearch','projectFilterStatus','trainingSearch','trainingFilterStatus','trainingOnlyDue'].forEach(id=>$('#'+id)?.addEventListener(id.includes('Search')?'input':'change',()=>renderRegistry(id.startsWith('project')?'projects':'training')));

function updateRegistryStats(){
  const projects=load(KEYS.projects,[]),training=load(KEYS.training,[]),assets=load(KEYS.assets,[]),permits=load(KEYS.permits,[]),drills=load(KEYS.drills,[]),env=load(KEYS.environment,[]),docs=load(KEYS.documents,[]),legal=load(KEYS.legal,[]);
  setText('projectTotal',projects.length);setText('projectActive',projects.filter(r=>r.projStatus==='Active').length);setText('projectWorkforce',projects.reduce((a,r)=>a+number(r.projWorkforce),0).toLocaleString());setText('projectClosing',projects.filter(r=>{const d=daysUntil(r.projEnd);return d!==null&&d>=0&&d<=60&&!closedStatus(r.projStatus);}).length);
  setText('trainingTotal',training.length);setText('trainingPlannedTotal',training.reduce((a,r)=>a+number(r.trainingPlanned),0).toLocaleString());setText('trainingAttendedTotal',training.reduce((a,r)=>a+number(r.trainingAttendees),0).toLocaleString());setText('trainingDue',training.filter(r=>{const d=daysUntil(r.trainingExpiry);return d!==null&&d<=getConfig().expiryWindow;}).length);
  setText('assetTotal',assets.length);setText('assetDue',assets.filter(r=>[r.assetInspectionDue,r.assetCertificateDue].some(v=>{const d=daysUntil(v);return d!==null&&d<=getConfig().expiryWindow;})).length);setText('permitOpen',permits.filter(r=>r.permitStatus==='Active').length);setText('permitExpired',permits.filter(r=>{const d=daysUntil(r.permitExpiry);return d!==null&&d<0&&!closedStatus(r.permitStatus);}).length);
  setText('drillTotal',drills.length);setText('drillAverage',drills.length?`${Math.round(drills.reduce((a,r)=>a+number(r.drillScore),0)/drills.length)}%`:'0%');setText('envTotal',env.length);const waste=env.reduce((a,r)=>a+number(r.envWaste),0),recycled=env.reduce((a,r)=>a+number(r.envRecycled),0);setText('envRecycleRate',waste?`${(recycled/waste*100).toFixed(1)}%`:'0%');
  setText('documentTotal',docs.length);setText('documentDue',docs.filter(r=>{const d=daysUntil(r.docReview);return d!==null&&d<=getConfig().expiryWindow&&!['Superseded','Archived'].includes(r.docStatus);}).length);setText('legalTotal',legal.length);setText('legalDue',legal.filter(r=>{const d=daysUntil(r.legalReview);return d!==null&&d<=getConfig().expiryWindow;}).length);
}

function updateSiteOptions(){
  let list=$('#safeosSiteOptions'); if(!list){list=document.createElement('datalist');list.id='safeosSiteOptions';document.body.appendChild(list);}
  const sites=[...new Set(load(KEYS.projects,[]).map(r=>r.projName).filter(Boolean))].sort(); list.innerHTML=sites.map(s=>`<option value="${esc(s)}"></option>`).join('');
  ['trainingSite','assetSite','permitSite','drillSite','envSite','perfSite','pubSite','riskLocation','jsaProject','tbSite','inspectionSite'].forEach(id=>$('#'+id)?.setAttribute('list','safeosSiteOptions'));
  const select=$('#analyticsSiteFilter'); if(select){const old=select.value;select.innerHTML='<option value="">All projects / sites</option>'+sites.map(s=>`<option>${esc(s)}</option>`).join('');select.value=old;}
}

function exportRegistry(name){
  if(name==='publicReports'){const rows=load(KEYS.publicReports,[]);downloadCsv(`SafeOS_Public_Reports_${today()}.csv`,['Reference','Date','Type','Urgency','Site','Location','Description','Contact','Language','Status'],rows.map(r=>[r.ref,r.date,r.type,r.severity,r.site,r.location,r.description,r.contact,r.language,r.status]));return;}
  const def=registries[name]; if(!def) return; const rows=load(def.key,[]); downloadCsv(`SafeOS_${cleanFilePart(name)}_${today()}.csv`,def.headers,rows.map(def.export));
}
$$('[data-export-registry]').forEach(button=>button.addEventListener('click',()=>exportRegistry(button.dataset.exportRegistry)));

function renderConfig(){
  const c=getConfig();setVal('safeosPublicEmail',c.publicEmail);setVal('safeosRateBasis',String(c.rateBasis));setVal('safeosExpiryWindow',String(c.expiryWindow));setVal('safeosJurisdiction',c.jurisdiction);setVal('safeosRole',c.role);setVal('safeosComplianceTarget',String(c.complianceTarget));
}
$('#saveSafeosConfig')?.addEventListener('click',()=>{
  const c={publicEmail:val('safeosPublicEmail'),rateBasis:number(val('safeosRateBasis'))||200000,expiryWindow:number(val('safeosExpiryWindow'))||30,jurisdiction:val('safeosJurisdiction'),role:val('safeosRole')||'Administrator',complianceTarget:clamp(val('safeosComplianceTarget'),1,100)||90};
  save(KEYS.config,c);renderPublicArea();toast('SafeOS settings saved');
});

function chartColours(){return ['#0b6b57','#1f86c7','#e59f24','#c94b4b','#7455b7','#3f8f5f','#d56b2c','#667085'];}
function emptyChart(el,message){if(el){el.className='chart-box empty-chart';el.textContent=message;}}
function renderBar(el,labels,values,{max=null,suffix='',title=''}={}){
  if(!el||!values.length||!values.some(v=>number(v)!==0)){emptyChart(el,'No data available');return;}
  const width=720,height=260,pad={l:50,r:20,t:24,b:60},plotW=width-pad.l-pad.r,plotH=height-pad.t-pad.b;
  const peak=max||Math.max(...values.map(number),1),step=plotW/values.length,bar=Math.max(10,Math.min(48,step*.62)),colors=chartColours();
  const grid=[0,.25,.5,.75,1].map(f=>{const y=pad.t+plotH*(1-f);return `<line x1="${pad.l}" y1="${y}" x2="${width-pad.r}" y2="${y}" class="chart-grid"/><text x="${pad.l-8}" y="${y+4}" text-anchor="end" class="chart-axis">${Math.round(peak*f)}${suffix}</text>`;}).join('');
  const bars=values.map((v,i)=>{const n=number(v),h=peak?plotH*n/peak:0,x=pad.l+i*step+(step-bar)/2,y=pad.t+plotH-h;const label=String(labels[i]??'');return `<rect x="${x}" y="${y}" width="${bar}" height="${h}" rx="4" fill="${colors[i%colors.length]}"/><text x="${x+bar/2}" y="${Math.max(14,y-6)}" text-anchor="middle" class="chart-value">${n}${suffix}</text><text x="${x+bar/2}" y="${height-31}" text-anchor="middle" class="chart-label">${esc(label.length>12?label.slice(0,11)+'…':label)}</text>`;}).join('');
  el.className='chart-box';el.innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title||'Bar chart')}">${grid}${bars}</svg>`;
}
function renderDonut(el,labels,values){
  if(!el||!values.length||!values.some(v=>number(v)>0)){emptyChart(el,'No data available');return;}
  const total=values.reduce((a,v)=>a+number(v),0),colors=chartColours();let offset=0;
  const circles=values.map((v,i)=>{const pct=number(v)/total*100,segment=`<circle cx="130" cy="120" r="72" fill="none" stroke="${colors[i%colors.length]}" stroke-width="34" stroke-dasharray="${pct} ${100-pct}" stroke-dashoffset="${-offset}" pathLength="100"/>`;offset+=pct;return segment;}).join('');
  const legend=labels.map((label,i)=>`<g transform="translate(260,${55+i*29})"><rect width="13" height="13" rx="3" fill="${colors[i%colors.length]}"/><text x="21" y="11" class="chart-label legend">${esc(label)}: ${number(values[i])}</text></g>`).join('');
  el.className='chart-box';el.innerHTML=`<svg viewBox="0 0 600 250" role="img" aria-label="Distribution chart"><g transform="rotate(-90 130 120)">${circles}</g><text x="130" y="113" text-anchor="middle" class="donut-total">${total}</text><text x="130" y="136" text-anchor="middle" class="chart-label">Total</text>${legend}</svg>`;
}
function renderLines(el,labels,series,{suffix=''}={}){
  const all=series.flatMap(s=>s.values.map(number)); if(!el||!labels.length||!all.some(v=>v!==0)){emptyChart(el,'No data available');return;}
  const width=720,height=270,pad={l:50,r:24,t:28,b:55},plotW=width-pad.l-pad.r,plotH=height-pad.t-pad.b,peak=Math.max(...all,1),colors=chartColours();
  const grid=[0,.25,.5,.75,1].map(f=>{const y=pad.t+plotH*(1-f);return `<line x1="${pad.l}" y1="${y}" x2="${width-pad.r}" y2="${y}" class="chart-grid"/><text x="${pad.l-8}" y="${y+4}" text-anchor="end" class="chart-axis">${(peak*f).toFixed(peak<10?1:0)}${suffix}</text>`;}).join('');
  const x=i=>labels.length===1?pad.l+plotW/2:pad.l+i*plotW/(labels.length-1),y=v=>pad.t+plotH-number(v)/peak*plotH;
  const paths=series.map((s,si)=>{const points=s.values.map((v,i)=>`${x(i)},${y(v)}`).join(' ');const dots=s.values.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="${colors[si%colors.length]}"/>`).join('');return `<polyline points="${points}" fill="none" stroke="${colors[si%colors.length]}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${dots}`;}).join('');
  const labelsSvg=labels.map((label,i)=>`<text x="${x(i)}" y="${height-27}" text-anchor="middle" class="chart-label">${esc(String(label).slice(0,10))}</text>`).join('');
  const legend=series.map((s,i)=>`<g transform="translate(${pad.l+i*145},12)"><line x1="0" y1="0" x2="20" y2="0" stroke="${colors[i%colors.length]}" stroke-width="4"/><text x="27" y="4" class="chart-label legend">${esc(s.name)}</text></g>`).join('');
  el.className='chart-box';el.innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Trend chart">${grid}${paths}${labelsSvg}${legend}</svg>`;
}
function monthSequence(count=12){const result=[];const d=new Date();d.setDate(1);for(let i=count-1;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);result.push(x.toISOString().slice(0,7));}return result;}
function monthLabel(month){return new Date(month+'-01T00:00:00').toLocaleDateString(document.documentElement.lang||'en',{month:'short',year:'2-digit'});}

function systemHealth(){
  const checks=[
    ['Company profile and report branding',Boolean(load(BASE.company,{}).name),12],
    ['Project / site structure',load(KEYS.projects,[]).length>0,10],
    ['Hazard and risk management',load(BASE.risks,[]).length>0,12],
    ['Inspections and assurance',load(BASE.inspections,[]).length>0,10],
    ['Action tracking and verification',load(BASE.capa,[]).length>0,12],
    ['Training and competency records',load(KEYS.training,[]).length>0,10],
    ['Equipment / permit control',load(KEYS.assets,[]).length+load(KEYS.permits,[]).length>0,8],
    ['Emergency / environmental records',load(KEYS.drills,[]).length+load(KEYS.environment,[]).length>0,8],
    ['Controlled documents and legal register',load(KEYS.documents,[]).length+load(KEYS.legal,[]).length>0,10],
    ['Performance measurement',load(KEYS.performance,[]).length>0,8]
  ];
  return{score:checks.reduce((sum,[,pass,weight])=>sum+(pass?weight:0),0),checks};
}
function priorityAlerts(){
  const cfg=getConfig(),alerts=[];
  load(BASE.capa,[]).forEach(r=>{const d=daysUntil(r.due);if(d!==null&&d<0&&!closedStatus(r.status))alerts.push({level:'critical',page:'capa',title:`Overdue CAPA ${r.capaId||''}`,detail:`${r.action||'Action'} — ${Math.abs(d)} day(s) overdue`});});
  load(BASE.risks,[]).forEach(r=>{if(['High','Critical','Extreme'].includes(r.residualLevel)&&!closedStatus(r.riskStatus))alerts.push({level:'critical',page:'risk',title:`${r.residualLevel} residual risk`,detail:r.riskTitle||r.riskHazard||r.riskRef});});
  load(KEYS.training,[]).forEach(r=>{const d=daysUntil(r.trainingExpiry);if(d!==null&&d<=cfg.expiryWindow)alerts.push({level:d<0?'critical':'warning',page:'training',title:d<0?'Training expired':'Training renewal due',detail:`${r.trainingTopic} — ${d<0?Math.abs(d)+' day(s) expired':d+' day(s)'}`});});
  load(KEYS.assets,[]).forEach(r=>{[['inspection',r.assetInspectionDue],['certificate',r.assetCertificateDue]].forEach(([kind,date])=>{const d=daysUntil(date);if(d!==null&&d<=cfg.expiryWindow)alerts.push({level:d<0?'critical':'warning',page:'assets',title:`Equipment ${kind} ${d<0?'expired':'due'}`,detail:`${r.assetDescription} — ${d<0?Math.abs(d)+' day(s) expired':d+' day(s)'}`});});});
  load(KEYS.documents,[]).forEach(r=>{const d=daysUntil(r.docReview);if(d!==null&&d<=cfg.expiryWindow&&!['Archived','Superseded'].includes(r.docStatus))alerts.push({level:d<0?'critical':'warning',page:'compliance',title:'Document review due',detail:`${r.docTitle} — ${d<0?Math.abs(d)+' day(s) overdue':d+' day(s)'}`});});
  load(KEYS.legal,[]).forEach(r=>{const d=daysUntil(r.legalReview);if(d!==null&&d<=cfg.expiryWindow)alerts.push({level:d<0?'critical':'warning',page:'compliance',title:'Legal obligation review due',detail:`${r.legalAuthority||r.legalJurisdiction} — ${d<0?Math.abs(d)+' day(s) overdue':d+' day(s)'}`});});
  load(KEYS.publicReports,[]).filter(r=>!['Actioned','Closed'].includes(r.status)).forEach(r=>alerts.push({level:r.severity==='Emergency'?'critical':'warning',page:'public',title:`Public report ${r.ref}`,detail:`${r.type}: ${r.description.slice(0,90)}`}));
  return alerts.slice(0,30);
}
function renderDashboard(){
  const incidents=load(BASE.incidents,[]),risks=load(BASE.risks,[]),capa=load(BASE.capa,[]),inspections=load(BASE.inspections,[]),training=load(KEYS.training,[]),assets=load(KEYS.assets,[]),pub=load(KEYS.publicReports,[]),cfg=getConfig();
  const highRisks=risks.filter(r=>['High','Critical','Extreme'].includes(r.residualLevel)&&!closedStatus(r.riskStatus)).length;
  const overdue=capa.filter(r=>{const d=daysUntil(r.due);return d!==null&&d<0&&!closedStatus(r.status);}).length;
  const trainingDue=training.filter(r=>{const d=daysUntil(r.trainingExpiry);return d!==null&&d<=cfg.expiryWindow;}).length;
  const assetDue=assets.filter(r=>[r.assetInspectionDue,r.assetCertificateDue].some(v=>{const d=daysUntil(v);return d!==null&&d<=cfg.expiryWindow;})).length;
  const avgInspection=inspections.length?Math.round(inspections.reduce((a,r)=>a+number(r.score),0)/inspections.length):0;
  const health=systemHealth();
  setText('kpiIncidents',incidents.length);setText('kpiIncidentsSub',incidents.length?`${incidents.filter(r=>/Lost Time|Fatal/i.test(r.incType||'')).length} serious / LTI`:'No records');setText('kpiHighRisks',highRisks);setText('kpiOverdueActions',overdue);setText('kpiTrainingDue',trainingDue);setText('kpiAssetsDue',assetDue);setText('kpiCompliance',`${avgInspection}%`);setText('kpiPublicOpen',pub.filter(r=>!['Actioned','Closed'].includes(r.status)).length);setText('kpiSystemHealth',`${health.score}%`);setText('systemHealthScore',`${health.score}%`);const bar=$('#systemHealthBar');if(bar)bar.style.width=health.score+'%';
  const checks=$('#systemHealthChecks');if(checks)checks.innerHTML=health.checks.map(([label,pass])=>`<div class="health-check ${pass?'pass':'gap'}"><span>${pass?'✓':'!'}</span>${esc(label)}</div>`).join('');
  const months=monthSequence(12),counts=months.map(m=>incidents.filter(r=>String(r.incDate||'').slice(0,7)===m).length);renderBar($('#chartIncidentTrend'),months.map(monthLabel),counts,{title:'Incident trend'});
  const statuses=['Open','In Progress','Pending Verification','Completed / Closed'];const actionValues=[capa.filter(r=>r.status==='Open').length,capa.filter(r=>r.status==='In Progress').length,capa.filter(r=>r.status==='Pending Verification').length,capa.filter(r=>['Completed','Closed'].includes(r.status)).length];renderDonut($('#chartActionStatus'),statuses,actionValues);
  const levels=['Low','Medium','High','Critical'];const riskValues=levels.map(l=>risks.filter(r=>r.residualLevel===l||(l==='Critical'&&r.residualLevel==='Extreme')).length);renderDonut($('#chartRiskProfile'),levels,riskValues);
  const recent=[...inspections].sort((a,b)=>String(a.inspectionDate).localeCompare(String(b.inspectionDate))).slice(-8);renderBar($('#chartInspectionTrend'),recent.map(r=>r.inspectionSite||r.inspectionArea||fmt(r.inspectionDate)),recent.map(r=>number(r.score)),{max:100,suffix:'%',title:'Inspection compliance'});
  const alerts=priorityAlerts(),wrap=$('#priorityAlerts');setText('alertCountChip',`${alerts.length} alert${alerts.length===1?'':'s'}`);if(wrap)wrap.innerHTML=alerts.length?alerts.map(a=>`<button class="alert-item ${a.level}" data-alert-page="${a.page}"><span>${a.level==='critical'?'!':'⏳'}</span><div><strong>${esc(a.title)}</strong><small>${esc(a.detail)}</small></div><b>›</b></button>`).join(''):'<div class="empty-state">No priority alerts. Keep monitoring and reviewing records.</div>';
}
$('#priorityAlerts')?.addEventListener('click',e=>{const b=e.target.closest('[data-alert-page]');if(b)go(b.dataset.alertPage);});
$('#refreshSafeosDashboard')?.addEventListener('click',()=>{renderDashboard();toast('Dashboard refreshed');});

function filteredPerformance(){
  let rows=load(KEYS.performance,[]);const site=val('analyticsSiteFilter'),period=number(val('analyticsPeriodFilter'));
  if(site)rows=rows.filter(r=>r.perfSite===site);if(period){const allowed=new Set(monthSequence(period));rows=rows.filter(r=>allowed.has(r.perfMonth));}
  return rows.sort((a,b)=>String(a.perfMonth).localeCompare(String(b.perfMonth)));
}
function renderAnalytics(){
  const rows=filteredPerformance(),cfg=getConfig(),basis=cfg.rateBasis||200000;
  const sum=field=>rows.reduce((a,r)=>a+number(r[field]),0),hours=sum('perfHours'),recordables=sum('perfRecordables'),lti=sum('perfLti'),lost=sum('perfLostDays');
  const trir=hours?recordables*basis/hours:0,ltifr=hours?lti*basis/hours:0,severity=hours?lost*basis/hours:0;
  setText('anaHours',hours.toLocaleString());setText('anaTrir',trir.toFixed(2));setText('anaLtifr',ltifr.toFixed(2));setText('anaSeverity',severity.toFixed(2));setText('anaTrirBasis',`per ${basis.toLocaleString()} hours`);setText('anaNearMisses',sum('perfNearMisses'));setText('anaInspections',sum('perfInspections'));setText('anaTrainings',sum('perfTrainings'));setText('anaObservations',sum('perfObservations'));
  const labels=rows.map(r=>monthLabel(r.perfMonth));renderLines($('#chartRates'),labels,[{name:'TRIR',values:rows.map(r=>number(r.perfHours)?number(r.perfRecordables)*basis/number(r.perfHours):0)},{name:'LTIFR',values:rows.map(r=>number(r.perfHours)?number(r.perfLti)*basis/number(r.perfHours):0)},{name:'Severity',values:rows.map(r=>number(r.perfHours)?number(r.perfLostDays)*basis/number(r.perfHours):0)}]);
  renderLines($('#chartLeading'),labels,[{name:'Inspections',values:rows.map(r=>number(r.perfInspections))},{name:'Training',values:rows.map(r=>number(r.perfTrainings))},{name:'Observations',values:rows.map(r=>number(r.perfObservations))},{name:'Consultations',values:rows.map(r=>number(r.perfConsultations))}]);
  const env=[...load(KEYS.environment,[])].sort((a,b)=>String(a.envMonth).localeCompare(String(b.envMonth))).slice(-12);renderLines($('#chartEnvironment'),env.map(r=>monthLabel(r.envMonth)),[{name:'Total waste kg',values:env.map(r=>number(r.envWaste))},{name:'Recycled kg',values:env.map(r=>number(r.envRecycled))}]);
  const inspections=load(BASE.inspections,[]),siteMap={};inspections.forEach(r=>{const site=r.inspectionSite||'Unassigned';(siteMap[site]??=[]).push(number(r.score));});const sites=Object.keys(siteMap).slice(0,10);renderBar($('#chartSiteComparison'),sites,sites.map(s=>Math.round(siteMap[s].reduce((a,v)=>a+v,0)/siteMap[s].length)),{max:100,suffix:'%',title:'Site compliance comparison'});
}
$('#refreshAnalytics')?.addEventListener('click',renderAnalytics);$('#analyticsSiteFilter')?.addEventListener('change',renderAnalytics);$('#analyticsPeriodFilter')?.addEventListener('change',renderAnalytics);

function setupPrintHeader(title,subtitle,reference){
  const company={name:'',address:'',prefix:'HSE',revision:'00',paper:'A4',logo:'',...load(BASE.company,{})};
  setText('printCompanyName',company.name||'Company / Organisation');setText('printCompanyAddress',company.address||'');$('#printLogo').innerHTML=company.logo?`<img src="${esc(company.logo)}" alt="Company logo" />`:'';setText('printDocRef',`Document ref: ${reference||ref('RPT')}`);setText('printRevision',`Revision: ${company.revision||'00'}`);setText('printGenerated',`Generated: ${new Date().toLocaleString()}`);setText('printTitle',title);setText('printSubtitle',subtitle||'');
  let style=$('#dynamicSafeosPageStyle');if(!style){style=document.createElement('style');style.id='dynamicSafeosPageStyle';document.head.appendChild(style);}style.textContent=`@page{size:${company.paper||'A4'};margin:14mm}`;
}
function tablePrint(title,subtitle,headers,rows,reference){
  setupPrintHeader(title,subtitle,reference);$('#printContent').innerHTML=`<section class="print-section"><table class="print-table"><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(row=>`<tr>${row.map(v=>`<td>${nl(v)||'—'}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${headers.length}">No records available.</td></tr>`}</tbody></table></section>`;$('#printArea').setAttribute('aria-hidden','false');setTimeout(()=>window.print(),100);
}
function printRegistry(name){
  const def=registries[name],rows=load(def.key,[]);tablePrint(`SafeOS ${name[0].toUpperCase()+name.slice(1)} Register`,'Local community management report',def.headers,rows.map(def.export),ref('RPT'));
}
function printDashboard(){
  const alerts=priorityAlerts(),health=systemHealth(),ins=load(BASE.incidents,[]),risks=load(BASE.risks,[]),capa=load(BASE.capa,[]),insp=load(BASE.inspections,[]);
  setupPrintHeader('Executive HSE Dashboard','Management overview and priority alerts',ref('DASH'));
  $('#printContent').innerHTML=`<section class="print-section"><h2>Key indicators</h2><div class="print-grid"><div class="print-field"><b>Incidents</b><span>${ins.length}</span></div><div class="print-field"><b>High / critical risks</b><span>${risks.filter(r=>['High','Critical','Extreme'].includes(r.residualLevel)).length}</span></div><div class="print-field"><b>Overdue actions</b><span>${capa.filter(r=>{const d=daysUntil(r.due);return d!==null&&d<0&&!closedStatus(r.status)}).length}</span></div><div class="print-field"><b>Average compliance</b><span>${insp.length?Math.round(insp.reduce((a,r)=>a+number(r.score),0)/insp.length):0}%</span></div><div class="print-field"><b>System health</b><span>${health.score}%</span></div></div></section><section class="print-section"><h2>Priority alerts</h2><table class="print-table"><thead><tr><th>Level</th><th>Alert</th><th>Details</th></tr></thead><tbody>${alerts.length?alerts.map(a=>`<tr><td>${esc(a.level)}</td><td>${esc(a.title)}</td><td>${esc(a.detail)}</td></tr>`).join(''):'<tr><td colspan="3">No priority alerts.</td></tr>'}</tbody></table></section><section class="print-section"><h2>System completeness</h2><table class="print-table"><tbody>${health.checks.map(([label,pass])=>`<tr><td>${esc(label)}</td><td>${pass?'In place':'Gap / not evidenced'}</td></tr>`).join('')}</tbody></table></section>`;
  $('#printArea').setAttribute('aria-hidden','false');setTimeout(()=>window.print(),100);
}
function printAnalytics(){
  const rows=filteredPerformance(),cfg=getConfig(),basis=cfg.rateBasis,sum=field=>rows.reduce((a,r)=>a+number(r[field]),0),hours=sum('perfHours');
  setupPrintHeader('HSE Performance Analytics',`Rate basis: ${basis.toLocaleString()} hours`,ref('KPI'));
  const trir=hours?sum('perfRecordables')*basis/hours:0,ltifr=hours?sum('perfLti')*basis/hours:0,severity=hours?sum('perfLostDays')*basis/hours:0;
  $('#printContent').innerHTML=`<section class="print-section"><h2>Summary</h2><div class="print-grid"><div class="print-field"><b>Hours worked</b><span>${hours.toLocaleString()}</span></div><div class="print-field"><b>TRIR</b><span>${trir.toFixed(2)}</span></div><div class="print-field"><b>LTIFR</b><span>${ltifr.toFixed(2)}</span></div><div class="print-field"><b>Severity rate</b><span>${severity.toFixed(2)}</span></div></div></section><section class="print-section"><h2>Monthly data</h2><table class="print-table"><thead><tr>${registries.performance.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${registries.performance.export(r).map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></section>`;$('#printArea').setAttribute('aria-hidden','false');setTimeout(()=>window.print(),100);
}
function printPublicPoster(){
  generateQr();const data=$('#publicQrCanvas')?.toDataURL('image/png')||'';setupPrintHeader('Report a Hazard or Safety Concern','Scan the QR code. No login is required.',ref('QR'));
  $('#printContent').innerHTML=`<section class="qr-poster-print"><h2>Your voice can prevent an incident.</h2><p>Workers, contractors, visitors and members of the public can report unsafe conditions, near misses, environmental concerns, welfare issues or positive safety observations.</p>${data?`<img src="${data}" alt="SafeOS public reporting QR code"/>`:''}<h3>SCAN • REPORT • PREVENT</h3><p class="print-url">${esc(val('publicUrl'))}</p><div class="poster-steps"><div><b>1</b><span>Scan the QR code</span></div><div><b>2</b><span>Describe the concern</span></div><div><b>3</b><span>Submit or send the report</span></div></div></section>`;$('#printArea').setAttribute('aria-hidden','false');setTimeout(()=>window.print(),100);
}
$$('[data-print-ext]').forEach(button=>button.addEventListener('click',()=>{const type=button.dataset.printExt;if(type==='dashboard')printDashboard();else if(type==='analytics')printAnalytics();else if(type==='publicPoster')printPublicPoster();else if(type==='assets'){const assets=load(KEYS.assets,[]),permits=load(KEYS.permits,[]);setupPrintHeader('Equipment, Certificates & Permit Register','Operational control summary',ref('OPS'));$('#printContent').innerHTML=`<section class="print-section"><h2>Equipment and certificates</h2><table class="print-table"><thead><tr>${registries.assets.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${assets.map(r=>`<tr>${registries.assets.export(r).map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></section><section class="print-section"><h2>Permits to work</h2><table class="print-table"><thead><tr>${registries.permits.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${permits.map(r=>`<tr>${registries.permits.export(r).map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></section>`;$('#printArea').setAttribute('aria-hidden','false');setTimeout(()=>window.print(),100);}else if(type==='emergency'||type==='compliance'){const names=type==='emergency'?['drills','environment']:['documents','legal'];setupPrintHeader(type==='emergency'?'Emergency & Environmental Register':'Document & Legal Register','SafeOS community summary',ref('RPT'));$('#printContent').innerHTML=names.map(name=>{const def=registries[name],rows=load(def.key,[]);return `<section class="print-section"><h2>${esc(name[0].toUpperCase()+name.slice(1))}</h2><table class="print-table"><thead><tr>${def.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${def.export(r).map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></section>`;}).join('');$('#printArea').setAttribute('aria-hidden','false');setTimeout(()=>window.print(),100);}else printRegistry(type);}));

function publicBaseUrl(){
  const cfg=getConfig(),url=new URL(location.href);url.hash='';url.search='';url.searchParams.set('public','1');if(cfg.publicEmail)url.searchParams.set('recipient',cfg.publicEmail);const defaultSite=load(BASE.company,{}).project;if(defaultSite)url.searchParams.set('site',defaultSite);return url.protocol==='file:'?'https://your-published-domain.example/?public=1':url.toString();
}
function generateQr(){
  const input=$('#publicUrl');if(input)input.value=publicBaseUrl();const canvas=$('#publicQrCanvas');if(!canvas||!window.QRCodeModel)return;
  try{const qr=new window.QRCodeModel(0,window.QRErrorCorrectLevel.M);qr.addData(input.value);qr.make();const count=qr.getModuleCount(),size=canvas.width,cell=Math.floor(size/(count+8)),offset=Math.floor((size-cell*count)/2),ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);ctx.fillStyle='#111';for(let r=0;r<count;r++)for(let c=0;c<count;c++)if(qr.isDark(r,c))ctx.fillRect(offset+c*cell,offset+r*cell,cell,cell);}catch(error){console.error(error);toast('QR code could not be generated for this URL');}
}
function renderPublicArea(){generateQr();renderPublicReports();}
$('#generatePublicQr')?.addEventListener('click',()=>{generateQr();toast('QR code refreshed');});
$('#copyPublicLink')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(val('publicUrl'));toast('Public link copied');}catch{toast('Copy the link manually from the field');}});
$('#downloadPublicQr')?.addEventListener('click',()=>{generateQr();const canvas=$('#publicQrCanvas');if(!canvas)return;canvas.toBlob(blob=>blob&&downloadBlob(`SafeOS_Public_Reporting_QR_${today()}.png`,blob),'image/png');});
function publicRecipient(){return new URLSearchParams(location.search).get('recipient')||getConfig().publicEmail||'';}
function publicSite(){return new URLSearchParams(location.search).get('site')||load(BASE.company,{}).project||'';}
$('#publicReportForm')?.addEventListener('submit',event=>{
  event.preventDefault();if(!val('pubDescription')){toast('Describe the safety concern');return;}if(!$('#pubConsent').checked){toast('Please confirm consent to process the report');return;}
  const record={id:uid('PUB'),ref:ref('PUB'),date:nowIso(),type:val('pubType'),severity:val('pubSeverity'),site:val('pubSite'),location:val('pubLocation'),description:val('pubDescription'),contact:val('pubContact'),language:val('pubLanguage'),status:'New',createdAt:nowIso(),updatedAt:nowIso()};
  const rows=load(KEYS.publicReports,[]);rows.unshift(record);save(KEYS.publicReports,rows);renderPublicReports();
  const recipient=publicRecipient(),subject=`SafeOS Safety Report ${record.ref} — ${record.severity}`,body=`Reference: ${record.ref}\nDate: ${new Date(record.date).toLocaleString()}\nType: ${record.type}\nUrgency: ${record.severity}\nSite: ${record.site}\nLocation: ${record.location}\nReporter contact: ${record.contact||'Anonymous / not provided'}\nLanguage: ${record.language}\n\nDescription:\n${record.description}`;
  const result=$('#publicSubmitResult');if(result){result.hidden=false;result.innerHTML=`<strong>Report prepared: ${esc(record.ref)}</strong><p>Your report has been saved on this device.${recipient?' Tap below to send it to the company safety contact.':' Download a copy and provide it to the relevant company contact.'}</p>${recipient?`<a class="primary button-link" href="mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">Send report by email</a>`:`<button class="secondary" id="downloadPublicReceipt">Download report copy</button>`}`;if(!recipient)$('#downloadPublicReceipt')?.addEventListener('click',()=>downloadBlob(`${record.ref}.json`,new Blob([JSON.stringify(record,null,2)],{type:'application/json'})));}
  event.target.reset();setVal('pubSite',publicSite());toast('Safety report prepared');
});
function renderPublicReports(){
  const rows=load(KEYS.publicReports,[]),body=$('#publicReportTableBody');if(!body)return;
  body.innerHTML=rows.length?rows.map((r,i)=>`<tr><td>${i+1}</td><td><strong>${esc(r.ref)}</strong><br><small>${new Date(r.date).toLocaleString()}</small></td><td>${esc(r.type)}<br>${badge(r.severity)}</td><td>${esc(r.site||'—')}<br><small>${esc(r.location||'—')}</small></td><td>${esc(r.description)}</td><td>${esc(r.contact||'Not provided')}</td><td>${badge(r.status)}</td><td><div class="table-actions"><button class="mini-btn" data-public-action="status" data-id="${r.id}">Next status</button><button class="mini-btn" data-public-action="capa" data-id="${r.id}">Create CAPA</button><button class="mini-btn danger-mini" data-public-action="delete" data-id="${r.id}">Delete</button></div></td></tr>`).join(''):'<tr><td colspan="8"><div class="empty-state">No local public reports.</div></td></tr>';
}
$('#publicReportTableBody')?.addEventListener('click',event=>{
  const b=event.target.closest('[data-public-action]');if(!b)return;let rows=load(KEYS.publicReports,[]),r=rows.find(x=>x.id===b.dataset.id);if(!r)return;
  if(b.dataset.publicAction==='delete'){if(confirm('Delete this public report?')){rows=rows.filter(x=>x.id!==r.id);save(KEYS.publicReports,rows);renderPublicReports();}}
  if(b.dataset.publicAction==='status'){const states=['New','Under Review','Actioned','Closed'];r.status=states[(states.indexOf(r.status)+1)%states.length];r.updatedAt=nowIso();save(KEYS.publicReports,rows);renderPublicReports();}
  if(b.dataset.publicAction==='capa'){const actions=load(BASE.capa,[]);actions.unshift({id:uid('CAPA'),capaId:ref('CAPA'),source:'Observation',category:r.type.includes('Environmental')?'Environmental':'Unsafe condition',finding:`${r.ref} — ${r.type}\n${r.description}`,action:'Assess the report, implement proportionate controls and verify effectiveness.',responsible:'',department:r.site,opened:today(),due:'',priority:r.severity==='Emergency'?'Critical':r.severity,status:'Open',progress:0,completedDate:'',verifiedBy:'',verifiedDate:'',effectiveness:'Not verified',closure:'',createdAt:nowIso(),updatedAt:nowIso()});localStorage.setItem(BASE.capa,JSON.stringify(actions));r.status='Actioned';save(KEYS.publicReports,rows);renderPublicReports();toast('CAPA created from public report');}
});

function globalSearch(query){
  const q=query.trim().toLowerCase();if(q.length<2)return[];const results=[];
  const add=(page,type,refValue,title,detail,id='')=>{const text=[refValue,title,detail].join(' ').toLowerCase();if(text.includes(q))results.push({page,type,ref:refValue,title,detail,id});};
  load(BASE.risks,[]).forEach(r=>add('risk','Risk',r.riskRef,r.riskTitle||r.riskHazard,r.riskLocation,r.id));
  load(BASE.jsas,[]).forEach(r=>add('jsa','JSA / TRA',r.jsaRef,r.jsaActivity,r.jsaProject,r.id));
  load(BASE.incidents,[]).forEach(r=>add('incident','Incident',r.incRef,r.incTitle||r.incType,r.incLocation,r.id));
  load(BASE.inspections,[]).forEach(r=>add('inspection','Inspection',r.inspectionRef,r.inspectionSite,r.inspectionArea,r.id));
  load(BASE.capa,[]).forEach(r=>add('capa','CAPA',r.capaId,r.action,r.responsible,r.id));
  Object.entries(registries).forEach(([name,def])=>load(def.key,[]).forEach(r=>add(pageForRegistry(name),name,def.export(r)[0],def.export(r)[1],def.export(r).slice(2,5).join(' '),r.id)));
  load(KEYS.publicReports,[]).forEach(r=>add('public','Public report',r.ref,r.type,r.description,r.id));return results.slice(0,30);
}
const searchInput=$('#globalSearch'),searchPanel=$('#globalSearchResults');
searchInput?.addEventListener('input',()=>{const results=globalSearch(searchInput.value);if(!searchInput.value.trim()){searchPanel.hidden=true;return;}searchPanel.hidden=false;searchPanel.innerHTML=results.length?`<div class="search-result-header">${results.length} matching record${results.length===1?'':'s'}</div>${results.map(r=>`<button data-search-page="${r.page}"><span class="search-type">${esc(r.type)}</span><strong>${esc(r.ref||r.title||'Record')}</strong><small>${esc(r.title||r.detail||'')}</small></button>`).join('')}`:'<div class="empty-state">No matching records.</div>';});
searchPanel?.addEventListener('click',event=>{const b=event.target.closest('[data-search-page]');if(b){go(b.dataset.searchPage);searchPanel.hidden=true;searchInput.value='';}});
document.addEventListener('click',event=>{if(searchPanel&&!searchPanel.contains(event.target)&&event.target!==searchInput)searchPanel.hidden=true;});

function publicMode(){
  const params=new URLSearchParams(location.search);if(params.get('public')!=='1')return false;
  document.body.classList.add('public-mode');$$('.page').forEach(p=>p.classList.remove('active'));$('#page-public')?.classList.add('active');setVal('pubSite',params.get('site')||'');generateQr();return true;
}
function updateAll(){
  Object.keys(registries).forEach(renderRegistry);updateRegistryStats();renderDashboard();renderAnalytics();renderPublicReports();
}
function initialise(){
  renderConfig();Object.keys(registries).forEach(clearRegistry);updateAll();updateSiteOptions();setVal('pubSite',publicSite());generateQr();
  const allowed=['home','dashboard','projects','risk','jsa','incident','inspection','capa','toolbox','training','assets','emergency','compliance','analytics','public','settings'];
  if(!publicMode()){const hash=location.hash.replace('#','');if(allowed.includes(hash))go(hash);}
  window.SafeOS={version:APP_VERSION,go,refresh:updateAll};
}
initialise();
})();
