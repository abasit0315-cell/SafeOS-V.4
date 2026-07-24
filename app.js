(() => {
'use strict';

const APP_VERSION = '4.0.0-dev';
const STORAGE = Object.freeze({
  company:'hseqt2-company', risks:'hseqt2-risks', jsas:'hseqt2-jsas',
  incidents:'hseqt2-incidents', toolboxes:'hseqt2-toolboxes',
  inspections:'hseqt2-inspections', capa:'hseqt2-capa',
  language:'hseqt2-language', theme:'hseqt2-theme'
});

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const val = id => ($('#'+id)?.value ?? '').trim();
const setVal = (id, value='') => { const el=$('#'+id); if(el) el.value=value ?? ''; };
const today = () => new Date().toISOString().slice(0,10);
const nowIso = () => new Date().toISOString();
const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`.toUpperCase();
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nl = value => esc(value).replace(/\n/g,'<br>');
const clamp = (number,min,max) => Math.min(max,Math.max(min,Number(number)||0));
const load = (key, fallback) => { try { const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
const save = (key, value) => { localStorage.setItem(key, JSON.stringify(value)); window.SafeOSStorage?.mirror?.(key,value); window.SafeOSSecurity?.log?.('save',key); signalSaved(); };
const getCollection = key => load(key, []);
const setCollection = (key, rows) => save(key, rows);

const translations = {
  en:{tagline:'Free Safety Tools for Everyone',home:'Home',riskRegister:'Risk Register',jsaBuilder:'JSA / TRA Builder',incidentBuilder:'Incident Report',toolboxTalk:'Toolbox Talk',inspection:'Inspection Checklist',capa:'Action Centre',companySetup:'Settings & Data',privacyFirst:'Privacy First',privacyNote:'Records and uploaded logos stay in this browser unless you export a backup.',heroTitle:'Professional safety records. No login. No ads.',heroText:'Build risk assessments, JSA/TRA documents, incident reports, toolbox talks, inspections and action trackers directly in your browser.',startNow:'Start now',addCompanyLogo:'Add company logo',advancedTools:'Advanced tools',loginRequired:'Logins required',browserBased:'Browser based',toolkit:'TOOLKIT',chooseTool:'Choose a tool'},
  ar:{tagline:'أدوات سلامة مجانية للجميع',home:'الرئيسية',riskRegister:'سجل المخاطر',jsaBuilder:'إعداد JSA / TRA',incidentBuilder:'تقرير الحادث',toolboxTalk:'حديث السلامة',inspection:'قائمة التفتيش',capa:'مركز الإجراءات',companySetup:'الإعدادات والبيانات',privacyFirst:'الخصوصية أولاً',privacyNote:'تبقى السجلات والشعار في هذا المتصفح ما لم تصدر نسخة احتياطية.',heroTitle:'سجلات سلامة احترافية. بدون تسجيل. بدون إعلانات.',heroText:'أنشئ تقييمات المخاطر وتقارير الحوادث والتفتيش والإجراءات مباشرة من المتصفح.',startNow:'ابدأ الآن',addCompanyLogo:'أضف شعار الشركة',advancedTools:'أدوات متقدمة',loginRequired:'تسجيل دخول مطلوب',browserBased:'تعمل عبر المتصفح',toolkit:'مجموعة الأدوات',chooseTool:'اختر أداة'},
  ur:{tagline:'ہر ایک کے لیے مفت حفاظتی ٹولز',home:'ہوم',riskRegister:'رسک رجسٹر',jsaBuilder:'JSA / TRA بلڈر',incidentBuilder:'حادثہ رپورٹ',toolboxTalk:'ٹول باکس ٹاک',inspection:'انسپیکشن چیک لسٹ',capa:'ایکشن سینٹر',companySetup:'سیٹنگز اور ڈیٹا',privacyFirst:'پرائیویسی پہلے',privacyNote:'ریکارڈ اور لوگو اسی براؤزر میں رہتے ہیں جب تک آپ بیک اپ ایکسپورٹ نہ کریں۔',heroTitle:'پروفیشنل سیفٹی ریکارڈز۔ لاگ اِن نہیں۔ اشتہار نہیں۔',heroText:'رسک اسیسمنٹ، JSA، حادثہ رپورٹ، ٹول باکس ٹاک، انسپیکشن اور ایکشن ٹریکر بنائیں۔',startNow:'ابھی شروع کریں',addCompanyLogo:'کمپنی لوگو شامل کریں',advancedTools:'ایڈوانس ٹولز',loginRequired:'لاگ اِن درکار',browserBased:'براؤزر پر مبنی',toolkit:'ٹول کٹ',chooseTool:'ٹول منتخب کریں'},
  hi:{tagline:'सभी के लिए निःशुल्क सुरक्षा उपकरण',home:'होम',riskRegister:'जोखिम रजिस्टर',jsaBuilder:'JSA / TRA बिल्डर',incidentBuilder:'घटना रिपोर्ट',toolboxTalk:'टूलबॉक्स टॉक',inspection:'निरीक्षण चेकलिस्ट',capa:'कार्य केंद्र',companySetup:'सेटिंग्स और डेटा',privacyFirst:'गोपनीयता पहले',privacyNote:'बैकअप निर्यात करने तक रिकॉर्ड और लोगो इसी ब्राउज़र में रहते हैं।',heroTitle:'पेशेवर सुरक्षा रिकॉर्ड। कोई लॉगिन नहीं। कोई विज्ञापन नहीं।',heroText:'जोखिम आकलन, JSA, घटना रिपोर्ट, निरीक्षण और कार्रवाई ट्रैकर बनाएं।',startNow:'अभी शुरू करें',addCompanyLogo:'कंपनी लोगो जोड़ें',advancedTools:'उन्नत उपकरण',loginRequired:'लॉगिन आवश्यक',browserBased:'ब्राउज़र आधारित',toolkit:'टूलकिट',chooseTool:'एक उपकरण चुनें'},
  bn:{tagline:'সবার জন্য বিনামূল্যের নিরাপত্তা টুল',home:'হোম',riskRegister:'ঝুঁকি রেজিস্টার',jsaBuilder:'JSA / TRA বিল্ডার',incidentBuilder:'ঘটনা প্রতিবেদন',toolboxTalk:'টুলবক্স টক',inspection:'পরিদর্শন চেকলিস্ট',capa:'অ্যাকশন সেন্টার',companySetup:'সেটিংস ও ডেটা',privacyFirst:'গোপনীয়তা আগে',privacyNote:'ব্যাকআপ রপ্তানি না করা পর্যন্ত রেকর্ড ও লোগো এই ব্রাউজারেই থাকে।',heroTitle:'পেশাদার নিরাপত্তা রেকর্ড। লগইন নেই। বিজ্ঞাপন নেই।',heroText:'ঝুঁকি মূল্যায়ন, JSA, ঘটনা প্রতিবেদন, পরিদর্শন এবং অ্যাকশন ট্র্যাকার তৈরি করুন।',startNow:'এখনই শুরু করুন',addCompanyLogo:'কোম্পানির লোগো যোগ করুন',advancedTools:'উন্নত টুল',loginRequired:'লগইন প্রয়োজন',browserBased:'ব্রাউজার ভিত্তিক',toolkit:'টুলকিট',chooseTool:'একটি টুল বেছে নিন'}
};

let toastTimer;
function toast(message){
  const el=$('#toast'); if(!el) return;
  el.textContent=message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2600);
}
let savedTimer;
function signalSaved(){
  const el=$('#autosaveStatus'); if(!el) return;
  el.textContent='Saved locally';
  clearTimeout(savedTimer); savedTimer=setTimeout(()=>el.textContent='Local data ready',1700);
  updateDashboard(); updateStorageMeter();
}

function navigate(page){
  if(!$('#page-'+page)) return;
  $$('.page').forEach(section=>section.classList.toggle('active',section.id==='page-'+page));
  $$('.nav-link').forEach(link=>link.classList.toggle('active',link.dataset.nav===page));
  $('#sidebar')?.classList.remove('open');
  $('#menuBtn')?.setAttribute('aria-expanded','false');
  if(location.hash!=='#'+page) history.pushState({safeosPage:page},'','#'+page);
  window.scrollTo({top:0,behavior:'smooth'});
  if(page==='home') updateDashboard();
  if(page==='settings') { renderCompany(); updateStorageMeter(); }
  if(page==='capa') renderCapa();
}
$$('[data-nav]').forEach(el=>{
  el.addEventListener('click',()=>navigate(el.dataset.nav));
  if(el.matches('[tabindex]')) el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();navigate(el.dataset.nav);}});
});
$('#menuBtn')?.addEventListener('click',()=>{
  const open=$('#sidebar').classList.toggle('open');
  $('#menuBtn').setAttribute('aria-expanded',String(open));
});

function applyLanguage(language){
  const dictionary=translations[language]||translations.en;
  $$('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;if(dictionary[key])el.textContent=dictionary[key];});
  document.documentElement.lang=language;
  document.body.dir=['ar','ur'].includes(language)?'rtl':'ltr';
  localStorage.setItem(STORAGE.language,language);
}
const savedLanguage=localStorage.getItem(STORAGE.language)||'en';
$('#languageSelect').value=savedLanguage;
$('#languageSelect').addEventListener('change',e=>applyLanguage(e.target.value));
applyLanguage(savedLanguage);

const savedTheme=localStorage.getItem(STORAGE.theme)||'light';
document.documentElement.dataset.theme=savedTheme;
$('#themeToggle').addEventListener('click',()=>{
  const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
  document.documentElement.dataset.theme=next; localStorage.setItem(STORAGE.theme,next);
});

function cleanFilePart(value,fallback='Document'){
  const cleaned=String(value||fallback).normalize('NFKD').replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'_').slice(0,70);
  return cleaned||fallback;
}
function documentRef(type){
  const company=load(STORAGE.company,{prefix:'HSE'});
  const prefix=cleanFilePart(company.prefix||'HSE','HSE').toUpperCase();
  return `${prefix}-${type}-${today().replaceAll('-','')}-${Math.random().toString(36).slice(2,5).toUpperCase()}`;
}
function downloadBlob(filename,blob){
  const link=document.createElement('a');
  link.href=URL.createObjectURL(blob); link.download=filename; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(()=>URL.revokeObjectURL(link.href),1000);
}
function downloadCSV(filename,rows){
  const csv='\ufeff'+rows.map(row=>row.map(cell=>`"${String(cell??'').replaceAll('"','""')}"`).join(',')).join('\r\n');
  downloadBlob(filename,new Blob([csv],{type:'text/csv;charset=utf-8'}));
}
function formatDate(value){
  if(!value) return '';
  const date=new Date(value+'T00:00:00');
  return Number.isNaN(date.getTime())?value:date.toLocaleDateString(document.documentElement.lang||'en',{year:'numeric',month:'short',day:'2-digit'});
}
function daysOverdue(due,status){
  if(!due||['Completed','Closed'].includes(status)) return 0;
  const oneDay=86400000;
  return Math.max(0,Math.floor((new Date(today())-new Date(due))/oneDay));
}
function setDefaults(){
  const company=load(STORAGE.company,{});
  const defaults={
    riskDate:today(),riskReviewDate:addDays(today(),365),riskRef:documentRef('RA'),riskLocation:company.project||'',riskAssessor:company.preparedBy||'',
    jsaDate:today(),jsaReviewDate:addDays(today(),365),jsaRef:documentRef('JSA'),jsaProject:company.project||'',jsaPreparedBy:company.preparedBy||'',
    incDate:today(),incRef:documentRef('INC'),incReporter:company.preparedBy||'',
    tbDate:today(),tbRef:documentRef('TBT'),tbSite:company.project||'',tbPresenter:company.preparedBy||'',
    inspectionDate:today(),inspectionRef:documentRef('INS'),inspectionSite:company.project||'',inspectionInspector:company.preparedBy||'',
    capaOpened:today(),capaId:documentRef('CAPA')
  };
  Object.entries(defaults).forEach(([id,value])=>{const el=$('#'+id);if(el&&!el.value)el.value=value;});
}
function addDays(dateString,days){
  const date=new Date((dateString||today())+'T00:00:00'); date.setDate(date.getDate()+days); return date.toISOString().slice(0,10);
}

function updateDashboard(){
  setText('dashRisks',getCollection(STORAGE.risks).length);
  setText('dashJsa',getCollection(STORAGE.jsas).length);
  setText('dashIncidents',getCollection(STORAGE.incidents).length);
  const overdue=getCollection(STORAGE.capa).filter(row=>daysOverdue(row.due,row.status)>0).length;
  setText('dashOverdue',overdue);
}
function setText(id,value){const el=$('#'+id);if(el)el.textContent=value;}
$('#refreshDashboard').addEventListener('click',()=>{updateDashboard();toast('Dashboard refreshed');});

const defaultCompany={name:'',address:'',prefix:'HSE',project:'',preparedBy:'',revision:'00',paper:'A4',logo:''};
function getCompany(){return {...defaultCompany,...load(STORAGE.company,{})};}
function renderCompany(){
  const company=getCompany();
  setVal('companyName',company.name);setVal('companyAddress',company.address);setVal('companyPrefix',company.prefix);
  setVal('companyProject',company.project);setVal('companyPreparedBy',company.preparedBy);setVal('companyRevision',company.revision);
  setVal('companyPaper',company.paper);
  renderLogoPreview(company.logo);
}
function collectCompany(){
  return {...getCompany(),name:val('companyName'),address:val('companyAddress'),prefix:val('companyPrefix')||'HSE',
    project:val('companyProject'),preparedBy:val('companyPreparedBy'),revision:val('companyRevision')||'00',
    paper:val('companyPaper')||'A4'};
}
function renderLogoPreview(dataUrl){
  const wrap=$('#companyLogoPreview');if(!wrap)return;
  wrap.innerHTML=dataUrl?`<img src="${esc(dataUrl)}" alt="Company logo preview" />`:'<span>No logo</span>';
}
$('#saveCompany').addEventListener('click',()=>{save(STORAGE.company,collectCompany());setDefaults();toast('Company profile saved');});
$('#removeCompanyLogo').addEventListener('click',()=>{const company=collectCompany();company.logo='';save(STORAGE.company,company);renderLogoPreview('');toast('Company logo removed');});
$('#companyLogoInput').addEventListener('change',async event=>{
  const file=event.target.files?.[0]; if(!file)return;
  if(file.size>5*1024*1024){toast('Please choose a logo smaller than 5 MB');event.target.value='';return;}
  try{
    const logo=await compressImage(file,700,300,.9,true);
    const company=collectCompany();company.logo=logo;save(STORAGE.company,company);renderLogoPreview(logo);toast('Company logo added');
  }catch{toast('This image could not be processed');}
  event.target.value='';
});
function compressImage(file,maxWidth,maxHeight,quality=.82,preservePng=false){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=reject;
    reader.onload=()=>{
      const image=new Image();
      image.onerror=reject;
      image.onload=()=>{
        const ratio=Math.min(1,maxWidth/image.width,maxHeight/image.height);
        const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));
        const context=canvas.getContext('2d');context.drawImage(image,0,0,canvas.width,canvas.height);
        const mime=preservePng&&file.type==='image/png'?'image/png':'image/jpeg';
        resolve(canvas.toDataURL(mime,quality));
      };
      image.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function updateStorageMeter(){
  let bytes=0;for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);bytes+=(key.length+(localStorage.getItem(key)||'').length)*2;}
  const mb=bytes/1024/1024;setText('storageText',`${mb.toFixed(2)} MB used locally`);
  const percent=Math.min(100,mb/5*100);const bar=$('#storageBar');if(bar)bar.style.width=percent+'%';
}
$('#exportBackup').addEventListener('click',()=>{
  const backup={app:'SafeOS Community',version:APP_VERSION,exportedAt:nowIso(),data:{}};
  for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&(key.startsWith('hseqt2-')||key.startsWith('safeos3-'))){const value=localStorage.getItem(key);if(value!==null)backup.data[key]=value;}}
  downloadBlob(`SafeOS_Community_Backup_${today()}.json`,new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}));
});
$('#importBackup').addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{
    const backup=JSON.parse(await file.text());
    if(!['HSE QuickTools','SafeOS Community'].includes(backup.app)||!backup.data)throw new Error('invalid');
    Object.entries(backup.data).forEach(([key,value])=>localStorage.setItem(key,String(value)));
    toast('Backup restored. Reloading...');
    setTimeout(()=>location.reload(),900);
  }catch{toast('Invalid SafeOS backup file');}
  event.target.value='';
});
$('#clearAllData').addEventListener('click',()=>{
  if(!confirm('Delete all SafeOS records, settings and uploaded logo from this browser?'))return;
  const keys=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&(key.startsWith('hseqt2-')||key.startsWith('safeos3-')))keys.push(key);}keys.forEach(key=>localStorage.removeItem(key));
  toast('All local data deleted');setTimeout(()=>location.reload(),700);
});

function riskInfo(score){
  const value=Number(score)||0;
  if(value<=4)return{level:'Low',className:'low',action:'Maintain controls and monitor.'};
  if(value<=9)return{level:'Medium',className:'medium',action:'Improve controls, assign ownership and supervise the activity.'};
  if(value<=16)return{level:'High',className:'high',action:'Do not proceed until additional controls reduce the risk.'};
  return{level:'Extreme',className:'extreme',action:'Stop the activity. Major controls and senior approval are required.'};
}
const likelihoodLabels=['','1 — Rare','2 — Unlikely','3 — Possible','4 — Likely','5 — Almost certain'];
const severityLabels=['','1 — Insignificant','2 — Minor','3 — Moderate','4 — Major','5 — Catastrophic'];
function fillRiskSelect(selectId,labels,selected=1){
  const select=$('#'+selectId);if(!select)return;
  select.innerHTML=labels.slice(1).map((label,index)=>`<option value="${index+1}" ${index+1===selected?'selected':''}>${label}</option>`).join('');
}
['riskInitialL','riskResidualL'].forEach(id=>fillRiskSelect(id,likelihoodLabels,1));
['riskInitialS','riskResidualS'].forEach(id=>fillRiskSelect(id,severityLabels,1));
function updateRiskSummary(prefix,l,s){
  const score=Number(val(l))*Number(val(s));const info=riskInfo(score);
  const badge=$('#'+prefix+'Score');badge.textContent=`${score} — ${info.level}`;badge.className=`risk-pill ${info.className}`;
  setText(prefix+'Action',info.action);return{score,...info};
}
['riskInitialL','riskInitialS','riskResidualL','riskResidualS'].forEach(id=>$('#'+id).addEventListener('change',()=>{
  updateRiskSummary('riskInitial','riskInitialL','riskInitialS');updateRiskSummary('riskResidual','riskResidualL','riskResidualS');
}));


function upsertRecord(storageKey, record){
  const rows=getCollection(storageKey);const index=rows.findIndex(item=>item.id===record.id);
  if(index>=0)rows[index]=record;else rows.unshift(record);
  setCollection(storageKey,rows);return record;
}
function deleteRecord(storageKey,id){
  if(!id)return false;
  setCollection(storageKey,getCollection(storageKey).filter(item=>item.id!==id));return true;
}
function populateRecordSelect(selectId,storageKey,labelFn){
  const select=$('#'+selectId);if(!select)return;
  const selected=select.value;const rows=getCollection(storageKey);
  select.innerHTML='<option value="">Current unsaved document</option>'+rows.map(item=>`<option value="${esc(item.id)}">${esc(labelFn(item))}</option>`).join('');
  if(rows.some(item=>item.id===selected))select.value=selected;
}
function selectedRecord(selectId,storageKey){const id=val(selectId);return getCollection(storageKey).find(item=>item.id===id)||null;}
function confirmDeleteSelected(selectId,storageKey,refreshFn){
  const id=val(selectId);if(!id){toast('Select a saved record first');return;}
  if(!confirm('Delete the selected saved record from this browser?'))return;
  deleteRecord(storageKey,id);refreshFn();toast('Record deleted');
}
function clearInputs(ids){ids.forEach(id=>setVal(id,''));}

const riskFieldIds=['riskRef','riskTitle','riskActivity','riskLocation','riskDate','riskReviewDate','riskAssessor','riskApprover','riskHazard','riskAffected','riskExistingControls','riskFurtherControls','riskInitialL','riskInitialS','riskHierarchy','riskOwner','riskDue','riskStatus','riskResidualL','riskResidualS','riskNotes'];
let currentRiskId='';
function collectRisk(){
  const data={};riskFieldIds.forEach(id=>data[id]=val(id));
  const initial=updateRiskSummary('riskInitial','riskInitialL','riskInitialS');
  const residual=updateRiskSummary('riskResidual','riskResidualL','riskResidualS');
  return{id:currentRiskId||uid('RA'),createdAt:nowIso(),updatedAt:nowIso(),...data,initialScore:initial.score,initialLevel:initial.level,residualScore:residual.score,residualLevel:residual.level};
}
function fillRisk(record){
  currentRiskId=record?.id||'';riskFieldIds.forEach(id=>setVal(id,record?.[id]??''));
  if(!record){setVal('riskRef',documentRef('RA'));setVal('riskDate',today());setVal('riskReviewDate',addDays(today(),365));setVal('riskLocation',getCompany().project);setVal('riskAssessor',getCompany().preparedBy);setVal('riskInitialL','1');setVal('riskInitialS','1');setVal('riskResidualL','1');setVal('riskResidualS','1');setVal('riskHierarchy','Elimination');setVal('riskStatus','Open');}
  updateRiskSummary('riskInitial','riskInitialL','riskInitialS');updateRiskSummary('riskResidual','riskResidualL','riskResidualS');
}
function refreshRiskRecords(){populateRecordSelect('riskRecordSelect',STORAGE.risks,item=>`${item.riskRef||'RA'} — ${item.riskTitle||item.riskHazard||'Untitled'}`);updateDashboard();}
$('#newRisk').addEventListener('click',()=>{fillRisk(null);$('#riskRecordSelect').value='';toast('New risk assessment ready');});
$('#saveRisk').addEventListener('click',()=>{
  if(!val('riskTitle')&&!val('riskHazard')){toast('Enter an assessment title or hazard');return;}
  const record=collectRisk();currentRiskId=record.id;upsertRecord(STORAGE.risks,record);refreshRiskRecords();$('#riskRecordSelect').value=record.id;toast('Risk assessment saved');
});
$('#loadRisk').addEventListener('click',()=>{const record=selectedRecord('riskRecordSelect',STORAGE.risks);if(!record){toast('Select a saved assessment');return;}fillRisk(record);toast('Risk assessment loaded');});
$('#deleteRisk').addEventListener('click',()=>confirmDeleteSelected('riskRecordSelect',STORAGE.risks,()=>{fillRisk(null);refreshRiskRecords();}));
$('#exportRiskCsv').addEventListener('click',()=>{
  const rows=[['Reference','Title','Activity','Location','Hazard','Who might be harmed','Existing controls','Initial score','Initial level','Further controls','Hierarchy','Owner','Due date','Status','Residual score','Residual level','Review date','Assessor','Approved by','Notes']];
  getCollection(STORAGE.risks).forEach(r=>rows.push([r.riskRef,r.riskTitle,r.riskActivity,r.riskLocation,r.riskHazard,r.riskAffected,r.riskExistingControls,r.initialScore,r.initialLevel,r.riskFurtherControls,r.riskHierarchy,r.riskOwner,r.riskDue,r.riskStatus,r.residualScore,r.residualLevel,r.riskReviewDate,r.riskAssessor,r.riskApprover,r.riskNotes]));
  downloadCSV(`${cleanFilePart(getCompany().prefix,'HSE')}_Risk_Register_${today()}.csv`,rows);
});

// JSA / TRA
const hierarchyOptions=['Elimination','Substitution','Engineering','Administrative','PPE'];
function selectHtml(options,selected=''){return `<select>${options.map(option=>`<option ${option===selected?'selected':''}>${esc(option)}</option>`).join('')}</select>`;}
function numericRiskSelect(selected=1){return `<select>${[1,2,3,4,5].map(n=>`<option value="${n}" ${Number(selected)===n?'selected':''}>${n}</option>`).join('')}</select>`;}
function makeCellInput(value='',type='input'){
  const element=document.createElement(type==='textarea'?'textarea':'input');element.value=value??'';if(type==='textarea')element.rows=2;return element;
}
function addJsaRow(data={}){
  const tr=document.createElement('tr');
  tr.dataset.id=data.id||uid('STEP');
  tr.innerHTML='<td class="rownum"></td>';
  ['step','hazard','affected','existing'].forEach((field,index)=>{const td=document.createElement('td');td.appendChild(makeCellInput(data[field]||'',index===3?'textarea':'input'));tr.appendChild(td);});
  const initialL=document.createElement('td');initialL.innerHTML=numericRiskSelect(data.initialL||1);tr.appendChild(initialL);
  const initialS=document.createElement('td');initialS.innerHTML=numericRiskSelect(data.initialS||1);tr.appendChild(initialS);
  const initialScore=document.createElement('td');initialScore.className='jsa-risk initial-score';tr.appendChild(initialScore);
  const further=document.createElement('td');further.appendChild(makeCellInput(data.further||'','textarea'));tr.appendChild(further);
  const hierarchy=document.createElement('td');hierarchy.innerHTML=selectHtml(hierarchyOptions,data.hierarchy||'Elimination');tr.appendChild(hierarchy);
  const residualL=document.createElement('td');residualL.innerHTML=numericRiskSelect(data.residualL||1);tr.appendChild(residualL);
  const residualS=document.createElement('td');residualS.innerHTML=numericRiskSelect(data.residualS||1);tr.appendChild(residualS);
  const residualScore=document.createElement('td');residualScore.className='jsa-risk residual-score';tr.appendChild(residualScore);
  const responsible=document.createElement('td');responsible.appendChild(makeCellInput(data.responsible||''));tr.appendChild(responsible);
  const remove=document.createElement('td');remove.innerHTML='<button class="remove-row" type="button">✕</button>';tr.appendChild(remove);
  $('#jsaTable tbody').appendChild(tr);
  $$('select',tr).forEach(select=>select.addEventListener('change',()=>updateJsaRowRisk(tr)));
  $('.remove-row',tr).addEventListener('click',()=>{tr.remove();renumber('#jsaTable');});
  updateJsaRowRisk(tr);renumber('#jsaTable');
}
function updateJsaRowRisk(tr){
  const selects=$$('select',tr);const initial=Number(selects[0].value)*Number(selects[1].value);const residual=Number(selects[3].value)*Number(selects[4].value);
  const initialInfo=riskInfo(initial),residualInfo=riskInfo(residual);
  $('.initial-score',tr).innerHTML=`<span class="risk-pill ${initialInfo.className}">${initial}</span>`;
  $('.residual-score',tr).innerHTML=`<span class="risk-pill ${residualInfo.className}">${residual}</span>`;
}
function renumber(tableId){$$(tableId+' tbody tr').forEach((tr,index)=>{$('.rownum',tr).textContent=index+1;});}
function collectJsaRows(){
  return $$('#jsaTable tbody tr').map(tr=>{
    const inputs=$$('input,textarea',tr);const selects=$$('select',tr);
    return{id:tr.dataset.id,step:inputs[0].value.trim(),hazard:inputs[1].value.trim(),affected:inputs[2].value.trim(),existing:inputs[3].value.trim(),
      initialL:Number(selects[0].value),initialS:Number(selects[1].value),initialScore:Number(selects[0].value)*Number(selects[1].value),
      further:inputs[4].value.trim(),hierarchy:selects[2].value,residualL:Number(selects[3].value),residualS:Number(selects[4].value),
      residualScore:Number(selects[3].value)*Number(selects[4].value),responsible:inputs[5].value.trim()};
  });
}
const jsaMetaIds=['jsaRef','jsaProject','jsaActivity','jsaLocation','jsaDate','jsaReviewDate','jsaPreparedBy','jsaApprovedBy','jsaPermit','jsaPpe','jsaEmergency','jsaConsultation','jsaRemarks'];
let currentJsaId='';
function collectJsa(){const data={};jsaMetaIds.forEach(id=>data[id]=val(id));return{id:currentJsaId||uid('JSA'),createdAt:nowIso(),updatedAt:nowIso(),...data,rows:collectJsaRows()};}
function fillJsa(record){
  currentJsaId=record?.id||'';jsaMetaIds.forEach(id=>setVal(id,record?.[id]??''));$('#jsaTable tbody').innerHTML='';
  (record?.rows||[]).forEach(addJsaRow);
  if(!record){setVal('jsaRef',documentRef('JSA'));setVal('jsaProject',getCompany().project);setVal('jsaDate',today());setVal('jsaReviewDate',addDays(today(),365));setVal('jsaPreparedBy',getCompany().preparedBy);}
  if(!$('#jsaTable tbody').children.length){addJsaRow();addJsaRow();addJsaRow();}
}
function refreshJsaRecords(){populateRecordSelect('jsaRecordSelect',STORAGE.jsas,item=>`${item.jsaRef||'JSA'} — ${item.jsaActivity||'Untitled activity'}`);updateDashboard();}
$('#addJsaRow').addEventListener('click',()=>addJsaRow());
$('#newJsa').addEventListener('click',()=>{fillJsa(null);$('#jsaRecordSelect').value='';toast('New JSA / TRA ready');});
$('#saveJsa').addEventListener('click',()=>{
  if(!val('jsaActivity')){toast('Enter the activity / task');return;}
  const record=collectJsa();currentJsaId=record.id;upsertRecord(STORAGE.jsas,record);refreshJsaRecords();$('#jsaRecordSelect').value=record.id;toast('JSA / TRA saved');
});
$('#loadJsa').addEventListener('click',()=>{const record=selectedRecord('jsaRecordSelect',STORAGE.jsas);if(!record){toast('Select a saved JSA / TRA');return;}fillJsa(record);toast('JSA / TRA loaded');});
$('#deleteJsa').addEventListener('click',()=>confirmDeleteSelected('jsaRecordSelect',STORAGE.jsas,()=>{fillJsa(null);refreshJsaRecords();}));


// Incident report
const incidentFieldIds=['incRef','incTitle','incType','incSeverity','incDate','incTime','incLocation','incStatus','incReporter','incLead','incPersons','incWitnesses','incDescription','incImpact','incImmediate','incConditions','incImmediateCategory','incRootCategory','incReportable','incWhy1','incWhy2','incWhy3','incWhy4','incWhy5','incCauses','incActions','incLessons','incActionOwner','incActionDue'];
let currentIncidentId='',incidentImages=[];
function renderIncidentImages(){
  const wrap=$('#incImagePreview');wrap.innerHTML='';
  incidentImages.forEach((src,index)=>{
    const card=document.createElement('div');card.className='image-card';
    card.innerHTML=`<img src="${esc(src)}" alt="Incident evidence ${index+1}" /><button type="button" aria-label="Remove image">✕</button>`;
    $('button',card).addEventListener('click',()=>{incidentImages.splice(index,1);renderIncidentImages();});
    wrap.appendChild(card);
  });
}
$('#incImages').addEventListener('change',async event=>{
  const files=[...(event.target.files||[])].slice(0,Math.max(0,3-incidentImages.length));
  for(const file of files){
    try{incidentImages.push(await compressImage(file,1100,850,.78));}catch{toast(`Could not process ${file.name}`);}
  }
  renderIncidentImages();event.target.value='';
  if(incidentImages.length>=3)toast('Maximum 3 evidence images stored');
});
function collectIncident(){const data={};incidentFieldIds.forEach(id=>data[id]=val(id));return{id:currentIncidentId||uid('INC'),createdAt:nowIso(),updatedAt:nowIso(),...data,images:[...incidentImages]};}
function fillIncident(record){
  currentIncidentId=record?.id||'';incidentFieldIds.forEach(id=>setVal(id,record?.[id]??''));incidentImages=[...(record?.images||[])];renderIncidentImages();
  if(!record){setVal('incRef',documentRef('INC'));setVal('incDate',today());setVal('incType','Near Miss');setVal('incSeverity','Low');setVal('incStatus','Initial');setVal('incReporter',getCompany().preparedBy);setVal('incImmediateCategory','Unsafe condition');setVal('incRootCategory','Management system');setVal('incReportable','To be assessed');}
}
function refreshIncidentRecords(){populateRecordSelect('incidentRecordSelect',STORAGE.incidents,item=>`${item.incRef||'INC'} — ${item.incTitle||item.incType||'Untitled'}`);updateDashboard();}
$('#newIncident').addEventListener('click',()=>{fillIncident(null);$('#incidentRecordSelect').value='';toast('New incident report ready');});
$('#saveIncident').addEventListener('click',()=>{
  if(!val('incTitle')&&!val('incDescription')){toast('Enter an incident title or description');return;}
  const record=collectIncident();currentIncidentId=record.id;upsertRecord(STORAGE.incidents,record);refreshIncidentRecords();$('#incidentRecordSelect').value=record.id;toast('Incident report saved');
});
$('#loadIncident').addEventListener('click',()=>{const record=selectedRecord('incidentRecordSelect',STORAGE.incidents);if(!record){toast('Select a saved incident report');return;}fillIncident(record);toast('Incident report loaded');});
$('#deleteIncident').addEventListener('click',()=>confirmDeleteSelected('incidentRecordSelect',STORAGE.incidents,()=>{fillIncident(null);refreshIncidentRecords();}));
$('#sendIncidentToCapa').addEventListener('click',()=>{
  if(!val('incActions')){toast('Enter corrective or preventive actions first');return;}
  const action={
    id:uid('CAPA'),capaId:documentRef('CAPA'),source:'Incident',category:mapIncidentCategory(val('incRootCategory')),
    finding:`${val('incRef')} — ${val('incTitle')}\n${val('incCauses')}`.trim(),action:val('incActions'),responsible:val('incActionOwner'),
    department:'',opened:today(),due:val('incActionDue'),priority:['High','Critical','Fatal / Catastrophic'].includes(val('incSeverity'))?'High':'Medium',
    status:'Open',progress:0,completedDate:'',verifiedBy:'',verifiedDate:'',effectiveness:'Not verified',closure:'',createdAt:nowIso(),updatedAt:nowIso()
  };
  const rows=getCollection(STORAGE.capa);rows.unshift(action);setCollection(STORAGE.capa,rows);renderCapa();toast('CAPA created from incident');
});
function mapIncidentCategory(category){
  if(/training|competence/i.test(category))return'Training / competence';
  if(/maintenance|inspection/i.test(category))return'Equipment / maintenance';
  if(/management/i.test(category))return'Management system';
  return'Other';
}

// Toolbox talks
const toolboxTemplates={
  'Working at Height':{objective:'Prevent falls of persons and materials during work at height.',hazards:'Falls from edges, ladders or scaffolds; falling objects; fragile surfaces; suspension trauma.',points:'• Use an approved work-at-height plan and permit where required.\n• Inspect access equipment before use.\n• Maintain guardrails or use suitable fall-arrest/restraint systems.\n• Secure tools and materials.\n• Stop work during unsafe weather or when controls are missing.',emergency:'Confirm rescue arrangements before starting. Do not rely only on the public emergency service for suspended-person rescue.'},
  'Heat Stress':{objective:'Prevent heat illness through planning, hydration and early recognition.',hazards:'Dehydration, heat exhaustion, heat stroke, reduced concentration and errors.',points:'• Follow work/rest schedules and applicable midday restrictions.\n• Drink water frequently; do not wait for thirst.\n• Provide shade, cooling and acclimatisation.\n• Use the buddy system and report symptoms immediately.\n• Supervisors must act on high heat index or worker symptoms.',emergency:'Move the person to a cool area, cool rapidly and obtain emergency medical help for confusion, collapse or suspected heat stroke.'},
  'Manual Handling':{objective:'Reduce sprains, strains and crush injuries during lifting and carrying.',hazards:'Back injury, trapped fingers, dropped loads, slips and overexertion.',points:'• Assess the load, route and landing point.\n• Use mechanical aids or team lifting.\n• Keep the load close and avoid twisting.\n• Clear the route and wear suitable gloves/footwear.\n• Stop if the load is unstable or beyond personal capability.',emergency:'Report pain or injury promptly. Do not continue lifting when symptoms develop.'},
  'Electrical Safety':{objective:'Prevent shock, burns, fire and arc-flash incidents.',hazards:'Damaged cables, exposed conductors, wet conditions, overloaded sockets, unauthorised repairs.',points:'• Inspect tools, plugs and cables before use.\n• Use appropriate RCD/GFCI protection.\n• Isolate, lock out and verify dead before work.\n• Keep electricity away from water.\n• Only competent authorised persons may repair equipment.',emergency:'Do not touch a casualty still in contact with electricity. Isolate power, call emergency services and provide first aid/CPR when safe.'},
  'Excavation Safety':{objective:'Prevent collapse, falls, utility strikes and hazardous-atmosphere exposure.',hazards:'Cave-in, falling loads, plant movement, underground services, water ingress and toxic/flammable gases.',points:'• Use a valid excavation permit and service drawings/scans.\n• Provide shoring, shielding or safe battering.\n• Keep spoil and plant away from edges.\n• Provide safe access and barricading.\n• Inspect after changes, rain or vibration.',emergency:'Do not enter a collapsed or suspect excavation for rescue without a controlled rescue plan and competent response.'},
  'Housekeeping':{objective:'Maintain clean, orderly work and living areas to prevent common injuries and fire risks.',hazards:'Trips, blocked exits, sharp waste, pests, fire loading and poor hygiene.',points:'• Clean as you go.\n• Keep access and emergency routes clear.\n• Segregate and remove waste.\n• Store tools, chemicals and materials correctly.\n• Report leaks and defects immediately.',emergency:'Spills and blocked exits require immediate action. Escalate hazards that cannot be safely corrected.'},
  'PPE':{objective:'Ensure PPE is correctly selected, used, inspected and maintained.',hazards:'Exposure to impact, dust, chemicals, noise, sharp materials and falls.',points:'• PPE is the last line of defence, not a replacement for stronger controls.\n• Use the specified type and correct size.\n• Inspect before use and replace damaged items.\n• Maintain hygiene and storage.\n• Report shortages or unsuitable PPE.',emergency:'Stop the task if mandatory PPE is missing or defective and risk cannot otherwise be controlled.'},
  'Vehicle and Plant Safety':{objective:'Prevent collisions, rollovers, reversing incidents and struck-by injuries.',hazards:'Blind spots, speeding, fatigue, pedestrians, defective equipment, unstable ground and unsecured loads.',points:'• Complete pre-start checks.\n• Use seat belts and authorised operators only.\n• Separate pedestrians and vehicles.\n• Use a trained banksman where visibility is restricted.\n• Follow speed limits and parking/isolation rules.',emergency:'Stop and secure equipment after an incident. Protect the scene and summon emergency assistance.'},
  'Fire and Emergency Response':{objective:'Ensure workers prevent fires and respond safely to alarms.',hazards:'Ignition sources, flammables, overloaded electrical systems, blocked exits and panic.',points:'• Keep exits and firefighting equipment clear.\n• Control hot work and ignition sources.\n• Know the alarm, assembly point and headcount method.\n• Raise the alarm before attempting first-aid firefighting.\n• Never re-enter until authorised.',emergency:'Call emergency services, evacuate by the nearest safe route and report to the assembly point.'},
  'Labour Camp Hygiene':{objective:'Maintain healthy accommodation and prevent disease, pests and welfare complaints.',hazards:'Poor housekeeping, overcrowding, contaminated food/water, pests, waste and blocked emergency routes.',points:'• Follow room capacity and cleaning schedules.\n• Keep toilets, kitchens and common areas hygienic.\n• Store food safely and remove waste daily.\n• Report leaks, pests and maintenance defects.\n• Keep corridors and exits free of personal items.',emergency:'Report suspected food poisoning, communicable disease clusters, water contamination or serious welfare concerns immediately.'},
  'Food Safety':{objective:'Prevent contamination and foodborne illness.',hazards:'Cross-contamination, incorrect temperatures, poor personal hygiene, expired food and pests.',points:'• Separate raw and cooked food.\n• Maintain safe cooking, cooling and storage temperatures.\n• Wash hands and use clean utensils.\n• Label, date and rotate stock.\n• Exclude ill food handlers and report symptoms.',emergency:'Isolate suspect food, retain samples where required and obtain medical/authority guidance for suspected outbreaks.'},
  'Behaviour and Workplace Violence':{objective:'Prevent escalation and ensure safe, respectful intervention.',hazards:'Threats, fighting, alcohol-related behaviour, weapons, harassment and crowd escalation.',points:'• Do not physically intervene unless trained and necessary for immediate safety.\n• Maintain distance, calm communication and an exit route.\n• Call security/management and emergency services when required.\n• Separate persons only when safe.\n• Preserve evidence and report without blame.',emergency:'Prioritise personal safety, summon help, provide first aid when safe and secure the area.'}
};
const toolboxMetaIds=['tbRef','tbTemplate','tbTopic','tbSite','tbDate','tbTime','tbDuration','tbPresenter','tbLanguage','tbPpe','tbObjective','tbHazards','tbPoints','tbEmergency','tbFeedback','tbFollowup'];
let currentToolboxId='';
$('#tbTemplate').addEventListener('change',()=>{
  const topic=val('tbTemplate');if(!topic)return;
  const template=toolboxTemplates[topic];setVal('tbTopic',topic);setVal('tbObjective',template.objective);setVal('tbHazards',template.hazards);setVal('tbPoints',template.points);setVal('tbEmergency',template.emergency);
});
function addAttendeeRow(data={}){
  const tr=document.createElement('tr');tr.dataset.id=data.id||uid('ATT');tr.innerHTML='<td class="rownum"></td>';
  ['name','employeeId','company','signature'].forEach(field=>{const td=document.createElement('td');td.appendChild(makeCellInput(data[field]||''));tr.appendChild(td);});
  const remove=document.createElement('td');remove.innerHTML='<button class="remove-row" type="button">✕</button>';tr.appendChild(remove);
  $('.remove-row',tr).addEventListener('click',()=>{tr.remove();renumber('#attendanceTable');});$('#attendanceTable tbody').appendChild(tr);renumber('#attendanceTable');
}
function collectAttendees(){return $$('#attendanceTable tbody tr').map(tr=>{const values=$$('input',tr).map(input=>input.value.trim());return{id:tr.dataset.id,name:values[0],employeeId:values[1],company:values[2],signature:values[3]};});}
function collectToolbox(){const data={};toolboxMetaIds.forEach(id=>data[id]=val(id));return{id:currentToolboxId||uid('TBT'),createdAt:nowIso(),updatedAt:nowIso(),...data,attendees:collectAttendees()};}
function fillToolbox(record){
  currentToolboxId=record?.id||'';toolboxMetaIds.forEach(id=>setVal(id,record?.[id]??''));$('#attendanceTable tbody').innerHTML='';(record?.attendees||[]).forEach(addAttendeeRow);
  if(!record){setVal('tbRef',documentRef('TBT'));setVal('tbSite',getCompany().project);setVal('tbDate',today());setVal('tbDuration','15');setVal('tbPresenter',getCompany().preparedBy);setVal('tbLanguage','English');}
  if(!$('#attendanceTable tbody').children.length){for(let i=0;i<5;i++)addAttendeeRow();}
}
function refreshToolboxRecords(){populateRecordSelect('toolboxRecordSelect',STORAGE.toolboxes,item=>`${item.tbRef||'TBT'} — ${item.tbTopic||'Untitled topic'}`);}
$('#addAttendee').addEventListener('click',()=>addAttendeeRow());
$('#newToolbox').addEventListener('click',()=>{fillToolbox(null);$('#toolboxRecordSelect').value='';toast('New toolbox talk ready');});
$('#saveToolbox').addEventListener('click',()=>{
  if(!val('tbTopic')){toast('Enter or select a toolbox topic');return;}
  const record=collectToolbox();currentToolboxId=record.id;upsertRecord(STORAGE.toolboxes,record);refreshToolboxRecords();$('#toolboxRecordSelect').value=record.id;toast('Toolbox talk saved');
});
$('#loadToolbox').addEventListener('click',()=>{const record=selectedRecord('toolboxRecordSelect',STORAGE.toolboxes);if(!record){toast('Select a saved toolbox talk');return;}fillToolbox(record);toast('Toolbox talk loaded');});
$('#deleteToolbox').addEventListener('click',()=>confirmDeleteSelected('toolboxRecordSelect',STORAGE.toolboxes,()=>{fillToolbox(null);refreshToolboxRecords();}));


// Inspection checklists
const inspectionTemplates={
  camp:[
    'Approved room occupancy is not exceeded','Rooms, corridors and common areas are clean','Emergency exits and routes are unobstructed',
    'Fire extinguishers are available, accessible and inspected','Electrical sockets, plugs and wiring are in safe condition',
    'Drinking water is available and dispensers/tanks are hygienic','Toilets and washing facilities are clean and functional',
    'Kitchen and food-storage areas are hygienic','Waste is segregated, covered and removed regularly',
    'Pest-control records and follow-up actions are available','Worker complaints and maintenance requests are tracked',
    'Emergency contacts and assembly-point information are displayed'
  ],
  accommodation:[
    'Room occupancy and bed spacing meet the approved arrangement','Adequate ventilation and cooling are available',
    'Beds, lockers and personal storage are maintained safely','No cooking or unauthorised heating appliances are used in bedrooms',
    'Toilets, showers and wash basins are sufficient and functional','Hot and cold water systems operate safely',
    'Cleaning schedules are displayed and completed','Laundry and drying arrangements do not obstruct access or create fire risk',
    'First-aid arrangements are available','Workers have access to complaint and welfare escalation channels',
    'No signs of pest infestation are present','Infectious-disease concerns are promptly escalated'
  ],
  kitchen:[
    'Food handlers demonstrate good personal hygiene','Raw and cooked foods are segregated',
    'Refrigerator and freezer temperatures are monitored','Cooking and hot-holding temperatures are controlled',
    'Food is labelled, dated and within expiry','Dry stores are clean, dry and protected from pests',
    'Utensils, chopping boards and surfaces are cleaned and sanitised','Chemicals are stored away from food',
    'Waste bins are covered and emptied regularly','Gas, ventilation and fire controls are safe',
    'Pest-control evidence is available','Suspected illness or food complaints are recorded and escalated'
  ],
  site:[
    'Site access and visitor control are effective','Workers use task-required PPE correctly','Work areas are barricaded and warning signs are suitable',
    'Excavations are protected, accessed safely and inspected','Scaffolds and work platforms have current inspection status',
    'Lifting equipment, accessories and operators have valid certification','Housekeeping and material storage are acceptable',
    'Emergency arrangements, first aid and fire equipment are available','High-risk work has valid permits and method statements',
    'Electrical distribution and temporary wiring are protected','Traffic routes separate pedestrians and mobile plant',
    'Supervision and worker competence are adequate for current work'
  ],
  vehicle:[
    'Daily pre-start inspection is completed','Driver/operator licence and authorisation are valid','Registration, insurance and certification are current',
    'Seat belts and operator restraints are functional','Tyres, wheels and braking systems appear safe',
    'Lights, horn, beacon, mirrors/cameras and reverse alarm work','Fire extinguisher and first-aid kit are available',
    'No visible hydraulic, fuel or oil leakage is present','Loads and attachments are secured and within limits',
    'Cab is clean and visibility is unobstructed','Telematics/speed controls operate where required','Defects are reported, isolated and closed out'
  ],
  fire:[
    'Emergency exits are clearly marked','Exit routes and final exits are unobstructed','Extinguishers are correctly selected and located',
    'Extinguisher inspection tags and service dates are valid','Fire alarm and detection systems are operational',
    'Emergency lighting and exit signs are functional','Flammable materials and ignition sources are controlled',
    'Electrical panels and firefighting equipment remain accessible','Assembly points and emergency numbers are displayed',
    'Hot-work controls are implemented','Fire doors are not wedged open','Emergency drills and corrective actions are recorded'
  ],
  electrical:[
    'Electrical panels are closed, labelled and accessible','No exposed conductors or makeshift joints are present','Sockets and plugs show no damage or overheating',
    'Portable equipment has required inspection/testing status','RCD/GFCI protection is used where required','Cables are protected from water, traffic and sharp edges',
    'Extension leads and adaptors are not overloaded','Isolation and lockout arrangements are available','Only authorised competent persons perform electrical work',
    'Earthing and bonding appear intact','Temporary electrical systems are weather protected','Electrical defects are isolated and reported'
  ],
  environment:[
    'Waste is correctly segregated and labelled','Hazardous waste is contained and stored securely','Spill kits are available and complete',
    'Fuel and chemical storage has suitable secondary containment','No uncontrolled discharge to soil, drains or water is observed',
    'Dust, noise and emissions controls are implemented','Water and energy consumption is monitored where required',
    'Environmental permits and waste records are available','Chemicals have labels and current safety data sheets',
    'Leaks and spills are reported and investigated','Sensitive receptors and public areas are protected','Environmental corrective actions are tracked'
  ],
  custom:[]
};
const inspectionMetaIds=['inspectionRef','inspectionTemplate','inspectionSite','inspectionArea','inspectionDate','inspectionInspector','inspectionAccompanied','inspectionOverall','inspectionSummary'];
let currentInspectionId='';
function addInspectionRow(data={}){
  const tr=document.createElement('tr');tr.dataset.id=data.id||uid('CHK');tr.innerHTML='<td class="rownum"></td>';
  const item=document.createElement('td');item.appendChild(makeCellInput(data.item||''));tr.appendChild(item);
  const status=document.createElement('td');status.innerHTML=selectHtml(['Unassessed','Compliant','Non-Compliant','Not Applicable'],data.status||'Unassessed');tr.appendChild(status);
  const risk=document.createElement('td');risk.innerHTML=selectHtml(['Low','Medium','High','Critical'],data.risk||'Low');tr.appendChild(risk);
  ['observation','action','responsible'].forEach((field,index)=>{const td=document.createElement('td');td.appendChild(makeCellInput(data[field]||'',index<2?'textarea':'input'));tr.appendChild(td);});
  const due=document.createElement('td');const dueInput=document.createElement('input');dueInput.type='date';dueInput.value=data.due||'';due.appendChild(dueInput);tr.appendChild(due);
  const remove=document.createElement('td');remove.innerHTML='<button class="remove-row" type="button">✕</button>';tr.appendChild(remove);
  $('select',status).addEventListener('change',updateInspectionScore);$('.remove-row',tr).addEventListener('click',()=>{tr.remove();renumber('#inspectionTable');updateInspectionScore();});
  $('#inspectionTable tbody').appendChild(tr);renumber('#inspectionTable');updateInspectionScore();
}
function renderInspectionTemplate(templateKey,existing=[]){
  const tbody=$('#inspectionTable tbody');tbody.innerHTML='';
  if(existing.length){existing.forEach(addInspectionRow);return;}
  (inspectionTemplates[templateKey]||[]).forEach(item=>addInspectionRow({item}));
  if(templateKey==='custom'||!tbody.children.length)addInspectionRow();
}
function collectInspectionRows(){
  return $$('#inspectionTable tbody tr').map(tr=>{
    const inputs=$$('input,textarea',tr);const selects=$$('select',tr);
    return{id:tr.dataset.id,item:inputs[0].value.trim(),status:selects[0].value,risk:selects[1].value,observation:inputs[1].value.trim(),action:inputs[2].value.trim(),responsible:inputs[3].value.trim(),due:inputs[4].value};
  });
}
function updateInspectionScore(){
  const rows=collectInspectionRows();const assessed=rows.filter(row=>!['Unassessed','Not Applicable'].includes(row.status));
  const compliant=assessed.filter(row=>row.status==='Compliant').length;const non=assessed.filter(row=>row.status==='Non-Compliant').length;
  const unassessed=rows.filter(row=>row.status==='Unassessed').length;const score=assessed.length?Math.round(compliant/assessed.length*100):0;
  setText('inspectionScore',score+'%');setText('inspectionCompliant',compliant);setText('openFindings',non);setText('inspectionUnassessed',unassessed);
  return{score,compliant,non,unassessed};
}
function collectInspection(){
  const data={};inspectionMetaIds.forEach(id=>data[id]=val(id));const stats=updateInspectionScore();
  return{id:currentInspectionId||uid('INS'),createdAt:nowIso(),updatedAt:nowIso(),...data,...stats,rows:collectInspectionRows()};
}
function fillInspection(record){
  currentInspectionId=record?.id||'';inspectionMetaIds.forEach(id=>setVal(id,record?.[id]??''));
  if(!record){setVal('inspectionRef',documentRef('INS'));setVal('inspectionTemplate','camp');setVal('inspectionSite',getCompany().project);setVal('inspectionDate',today());setVal('inspectionInspector',getCompany().preparedBy);setVal('inspectionOverall','Satisfactory');}
  renderInspectionTemplate(val('inspectionTemplate')||'camp',record?.rows||[]);updateInspectionScore();
}
function refreshInspectionRecords(){populateRecordSelect('inspectionRecordSelect',STORAGE.inspections,item=>`${item.inspectionRef||'INS'} — ${item.inspectionSite||item.inspectionArea||'Inspection'}`);}
$('#inspectionTemplate').addEventListener('change',()=>{
  if($('#inspectionTable tbody').children.length&&collectInspectionRows().some(row=>row.item||row.observation||row.action)){
    if(!confirm('Load this template and replace the current checklist rows?'))return;
  }
  renderInspectionTemplate(val('inspectionTemplate'));updateInspectionScore();
});
$('#addInspectionItem').addEventListener('click',()=>addInspectionRow());
$('#newInspection').addEventListener('click',()=>{fillInspection(null);$('#inspectionRecordSelect').value='';toast('New inspection ready');});
$('#saveInspection').addEventListener('click',()=>{
  if(!val('inspectionSite')&&!val('inspectionArea')){toast('Enter a site or inspection area');return;}
  const record=collectInspection();currentInspectionId=record.id;upsertRecord(STORAGE.inspections,record);refreshInspectionRecords();$('#inspectionRecordSelect').value=record.id;toast('Inspection saved');
});
$('#loadInspection').addEventListener('click',()=>{const record=selectedRecord('inspectionRecordSelect',STORAGE.inspections);if(!record){toast('Select a saved inspection');return;}fillInspection(record);toast('Inspection loaded');});
$('#deleteInspection').addEventListener('click',()=>confirmDeleteSelected('inspectionRecordSelect',STORAGE.inspections,()=>{fillInspection(null);refreshInspectionRecords();}));
$('#exportInspection').addEventListener('click',()=>{
  const data=collectInspection();const rows=[['Reference',data.inspectionRef],['Site',data.inspectionSite],['Area',data.inspectionArea],['Date',data.inspectionDate],['Inspector',data.inspectionInspector],['Score',data.score+'%'],[],['Item','Status','Risk','Observation / Evidence','Required Action','Responsible','Due Date']];
  data.rows.forEach(row=>rows.push([row.item,row.status,row.risk,row.observation,row.action,row.responsible,row.due]));
  downloadCSV(`${cleanFilePart(getCompany().prefix,'HSE')}_Inspection_${cleanFilePart(data.inspectionRef||data.inspectionSite)}_${today()}.csv`,rows);
});
$('#createCapaFromInspection').addEventListener('click',()=>{
  const inspection=collectInspection();const findings=inspection.rows.filter(row=>row.status==='Non-Compliant');
  if(!findings.length){toast('No non-compliant items found');return;}
  const actions=getCollection(STORAGE.capa);
  findings.forEach(row=>actions.unshift({id:uid('CAPA'),capaId:documentRef('CAPA'),source:'Inspection',category:mapInspectionCategory(val('inspectionTemplate')),
    finding:`${inspection.inspectionRef} — ${row.item}\n${row.observation}`.trim(),action:row.action||`Correct the non-compliance: ${row.item}`,responsible:row.responsible,
    department:inspection.inspectionArea,opened:today(),due:row.due,priority:row.risk,status:'Open',progress:0,completedDate:'',verifiedBy:'',verifiedDate:'',effectiveness:'Not verified',closure:'',createdAt:nowIso(),updatedAt:nowIso()}));
  setCollection(STORAGE.capa,actions);renderCapa();toast(`${findings.length} CAPA action(s) created`);
});
function mapInspectionCategory(template){
  return({fire:'Fire safety',electrical:'Electrical safety',camp:'Welfare / hygiene',accommodation:'Welfare / hygiene',kitchen:'Welfare / hygiene',environment:'Environmental',vehicle:'Equipment / maintenance'}[template]||'Unsafe condition');
}

// CAPA tracker
const capaFieldMap={
  capaId:'capaId',source:'capaSource',category:'capaCategory',priority:'capaPriority',finding:'capaFinding',action:'capaAction',
  responsible:'capaResponsible',department:'capaDepartment',opened:'capaOpened',due:'capaDue',status:'capaStatus',progress:'capaProgress',
  completedDate:'capaCompletedDate',verifiedBy:'capaVerifiedBy',verifiedDate:'capaVerifiedDate',effectiveness:'capaEffectiveness',closure:'capaClosure'
};
function collectCapaForm(){
  const data={};Object.entries(capaFieldMap).forEach(([field,id])=>data[field]=val(id));
  data.progress=clamp(data.progress,0,100);return data;
}
function clearCapaForm(){
  setVal('capaEditId','');Object.values(capaFieldMap).forEach(id=>setVal(id,''));
  setVal('capaId',documentRef('CAPA'));setVal('capaSource','Inspection');setVal('capaCategory','Unsafe condition');setVal('capaPriority','Low');
  setVal('capaOpened',today());setVal('capaStatus','Open');setVal('capaProgress','0');setVal('capaEffectiveness','Not verified');
  setText('capaFormTitle','Add corrective / preventive action');$('#cancelCapaEdit').classList.add('hidden');
}
function saveCapaFromForm(){
  const data=collectCapaForm();if(!data.action){toast('Enter the required action');return;}
  const rows=getCollection(STORAGE.capa);const editId=val('capaEditId');const existing=rows.find(row=>row.id===editId);
  const record={id:existing?.id||uid('CAPA'),createdAt:existing?.createdAt||nowIso(),updatedAt:nowIso(),...data};
  if(['Completed','Closed'].includes(record.status)&&!record.completedDate)record.completedDate=today();
  const index=rows.findIndex(row=>row.id===record.id);if(index>=0)rows[index]=record;else rows.unshift(record);
  setCollection(STORAGE.capa,rows);clearCapaForm();renderCapa();toast(index>=0?'Action updated':'Action added');
}
$('#saveCapaAction').addEventListener('click',saveCapaFromForm);
$('#cancelCapaEdit').addEventListener('click',clearCapaForm);
function editCapa(id){
  const row=getCollection(STORAGE.capa).find(item=>item.id===id);if(!row)return;
  setVal('capaEditId',row.id);Object.entries(capaFieldMap).forEach(([field,inputId])=>setVal(inputId,row[field]??''));
  setText('capaFormTitle',`Edit action ${row.capaId||''}`);$('#cancelCapaEdit').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});
}
function deleteCapa(id){
  if(!confirm('Delete this action from the local tracker?'))return;
  setCollection(STORAGE.capa,getCollection(STORAGE.capa).filter(row=>row.id!==id));renderCapa();toast('Action deleted');
}
function getFilteredCapa(){
  const query=val('capaSearch').toLowerCase(),status=val('capaFilterStatus'),priority=val('capaFilterPriority'),overdueOnly=$('#capaOnlyOverdue').checked;
  return getCollection(STORAGE.capa).filter(row=>{
    const haystack=[row.capaId,row.source,row.category,row.finding,row.action,row.responsible,row.department].join(' ').toLowerCase();
    return(!query||haystack.includes(query))&&(!status||row.status===status)&&(!priority||row.priority===priority)&&(!overdueOnly||daysOverdue(row.due,row.status)>0);
  });
}
function renderCapa(){
  const all=getCollection(STORAGE.capa),rows=getFilteredCapa(),tbody=$('#capaTable tbody');if(!tbody)return;tbody.innerHTML='';
  rows.forEach((row,index)=>{
    const overdue=daysOverdue(row.due,row.status);const tr=document.createElement('tr');
    tr.innerHTML=`<td>${index+1}</td><td><strong>${esc(row.capaId||'')}</strong><br><small>${esc(row.source||'')}</small></td>
      <td>${nl(row.action)}${row.finding?`<br><small>${nl(row.finding)}</small>`:''}</td><td>${esc(row.responsible||'')}<br><small>${esc(row.department||'')}</small></td>
      <td class="${overdue?'overdue-text':''}">${esc(formatDate(row.due))}${overdue?`<br>${overdue} day(s) overdue`:''}</td>
      <td class="priority-${String(row.priority||'').toLowerCase()}">${esc(row.priority||'')}</td><td>${esc(row.status||'')}</td>
      <td><div class="progress-wrap"><progress max="100" value="${clamp(row.progress,0,100)}"></progress><small>${clamp(row.progress,0,100)}%</small></div></td>
      <td>${esc(row.effectiveness||'Not verified')}</td><td><div class="row-actions"><button class="edit-row" data-edit="${esc(row.id)}">Edit</button><button class="remove-row" data-delete="${esc(row.id)}">Delete</button></div></td>`;
    tbody.appendChild(tr);
  });
  $$('[data-edit]',tbody).forEach(button=>button.addEventListener('click',()=>editCapa(button.dataset.edit)));
  $$('[data-delete]',tbody).forEach(button=>button.addEventListener('click',()=>deleteCapa(button.dataset.delete)));
  setText('capaTotal',all.length);setText('capaOverdue',all.filter(row=>daysOverdue(row.due,row.status)>0).length);
  setText('capaCompleted',all.filter(row=>['Completed','Closed'].includes(row.status)).length);
  setText('capaVerified',all.filter(row=>row.effectiveness==='Effective').length);updateDashboard();
}
['capaSearch','capaFilterStatus','capaFilterPriority','capaOnlyOverdue'].forEach(id=>$('#'+id).addEventListener(id==='capaSearch'?'input':'change',renderCapa));
$('#exportCapa').addEventListener('click',()=>{
  const rows=[['Action ID','Source','Category','Finding / Root Cause','Required Action','Responsible','Department','Opened','Due','Priority','Status','Progress %','Completion Date','Verified By','Verification Date','Effectiveness','Closure Notes']];
  getFilteredCapa().forEach(r=>rows.push([r.capaId,r.source,r.category,r.finding,r.action,r.responsible,r.department,r.opened,r.due,r.priority,r.status,r.progress,r.completedDate,r.verifiedBy,r.verifiedDate,r.effectiveness,r.closure]));
  downloadCSV(`${cleanFilePart(getCompany().prefix,'HSE')}_CAPA_Register_${today()}.csv`,rows);
});


// Professional print / PDF reports
function printField(label,value,className=''){
  return `<div class="print-field ${className}"><b>${esc(label)}</b><span>${nl(value)||'—'}</span></div>`;
}
function printSection(title,content){return `<section class="print-section"><h2>${esc(title)}</h2>${content}</section>`;}
function printGrid(fields){return `<div class="print-grid">${fields.join('')}</div>`;}
function printRiskBadge(score){const info=riskInfo(score);return `<span class="print-risk">${esc(score)} — ${esc(info.level)}</span>`;}
function setupPrintHeader(title,subtitle,reference){
  const company=getCompany();
  $('#printCompanyName').textContent=company.name||'Company / Organisation';
  $('#printCompanyAddress').textContent=company.address||'';
  $('#printLogo').innerHTML=company.logo?`<img src="${esc(company.logo)}" alt="Company logo" />`:'';
  $('#printDocRef').textContent=`Document ref: ${reference||'—'}`;
  $('#printRevision').textContent=`Revision: ${company.revision||'00'}`;
  $('#printGenerated').textContent=`Generated: ${new Date().toLocaleString()}`;
  $('#printTitle').textContent=title;$('#printSubtitle').textContent=subtitle||'';
  let pageStyle=$('#dynamicPageStyle');
  if(!pageStyle){pageStyle=document.createElement('style');pageStyle.id='dynamicPageStyle';document.head.appendChild(pageStyle);}
  pageStyle.textContent=`@page{size:${company.paper||'A4'};margin:14mm}`;
}
function buildRiskPrint(){
  const r=collectRisk();setupPrintHeader('Risk Assessment / Risk Register',`${r.riskTitle||r.riskActivity||''}`,r.riskRef);
  $('#printContent').innerHTML=
    printSection('Assessment details',printGrid([
      printField('Assessment title',r.riskTitle,'wide'),printField('Activity / task',r.riskActivity,'wide'),
      printField('Location / site',r.riskLocation),printField('Assessment date',formatDate(r.riskDate)),printField('Review date',formatDate(r.riskReviewDate)),printField('Status',r.riskStatus),
      printField('Assessor',r.riskAssessor,'wide'),printField('Approved by',r.riskApprover,'wide')
    ]))+
    printSection('Hazard identification',printGrid([
      printField('Hazard description',r.riskHazard,'wide'),printField('Who might be harmed and how',r.riskAffected,'wide'),
      printField('Existing controls',r.riskExistingControls,'full')
    ]))+
    printSection('Risk evaluation and action',`<table class="print-table"><thead><tr><th>Initial risk</th><th>Further controls</th><th>Hierarchy</th><th>Owner</th><th>Target date</th><th>Residual risk</th></tr></thead><tbody><tr>
      <td>${printRiskBadge(r.initialScore)}</td><td>${nl(r.riskFurtherControls)||'—'}</td><td>${esc(r.riskHierarchy)}</td><td>${esc(r.riskOwner)}</td><td>${esc(formatDate(r.riskDue))}</td><td>${printRiskBadge(r.residualScore)}</td></tr></tbody></table>`)+
    printSection('Monitoring, communication and review',printGrid([printField('Notes',r.riskNotes,'full')]));
  return `${cleanFilePart(getCompany().prefix,'HSE')}_Risk_Assessment_${cleanFilePart(r.riskRef||r.riskTitle)}_${today()}`;
}
function buildJsaPrint(){
  const j=collectJsa();setupPrintHeader('Job Safety Analysis / Task Risk Assessment',j.jsaActivity,j.jsaRef);
  const rows=j.rows.map((r,index)=>`<tr><td>${index+1}</td><td>${nl(r.step)}</td><td>${nl(r.hazard)}</td><td>${nl(r.affected)}</td><td>${nl(r.existing)}</td><td>${printRiskBadge(r.initialScore)}</td><td>${nl(r.further)}</td><td>${esc(r.hierarchy)}</td><td>${printRiskBadge(r.residualScore)}</td><td>${esc(r.responsible)}</td></tr>`).join('');
  $('#printContent').innerHTML=
    printSection('Document details',printGrid([
      printField('Project / site',j.jsaProject),printField('Specific location',j.jsaLocation),printField('Date',formatDate(j.jsaDate)),printField('Review date',formatDate(j.jsaReviewDate)),
      printField('Prepared by',j.jsaPreparedBy),printField('Approved by',j.jsaApprovedBy),printField('Permit / method statement',j.jsaPermit),printField('Required PPE',j.jsaPpe),
      printField('Emergency arrangements',j.jsaEmergency,'full')
    ]))+
    printSection('Task steps and controls',`<table class="print-table"><thead><tr><th>#</th><th>Job step</th><th>Hazard</th><th>Who/how harmed</th><th>Existing controls</th><th>Initial risk</th><th>Further controls</th><th>Hierarchy</th><th>Residual risk</th><th>Responsible</th></tr></thead><tbody>${rows}</tbody></table>`)+
    printSection('Consultation and remarks',printGrid([printField('Team consultation / briefing',j.jsaConsultation,'wide'),printField('Remarks and restrictions',j.jsaRemarks,'wide')]));
  return `${cleanFilePart(getCompany().prefix,'HSE')}_JSA_TRA_${cleanFilePart(j.jsaRef||j.jsaActivity)}_${today()}`;
}
function buildIncidentPrint(){
  const i=collectIncident();setupPrintHeader('Incident Investigation Report',i.incTitle||i.incType,i.incRef);
  const whyRows=[i.incWhy1,i.incWhy2,i.incWhy3,i.incWhy4,i.incWhy5].map((why,index)=>`<tr><td>Why ${index+1}</td><td>${nl(why)||'—'}</td></tr>`).join('');
  const images=i.images.length?`<div class="print-images">${i.images.map((src,index)=>`<figure><img src="${esc(src)}" alt="Evidence ${index+1}" /><figcaption>Evidence ${index+1}</figcaption></figure>`).join('')}</div>`:'<p>No images attached.</p>';
  $('#printContent').innerHTML=
    printSection('Incident details',printGrid([
      printField('Title',i.incTitle,'wide'),printField('Type',i.incType),printField('Severity',i.incSeverity),
      printField('Date',formatDate(i.incDate)),printField('Time',i.incTime),printField('Location',i.incLocation),printField('Report status',i.incStatus),
      printField('Reported by',i.incReporter),printField('Investigation lead',i.incLead),printField('Persons involved',i.incPersons),printField('Witnesses',i.incWitnesses)
    ]))+
    printSection('Facts and impact',printGrid([
      printField('Incident description',i.incDescription,'wide'),printField('Injury, damage or environmental impact',i.incImpact,'wide'),
      printField('Immediate actions and scene controls',i.incImmediate,'wide'),printField('Equipment, material and conditions',i.incConditions,'wide')
    ]))+
    printSection('Evidence images',images)+
    printSection('Cause analysis',printGrid([
      printField('Immediate cause category',i.incImmediateCategory),printField('Root cause category',i.incRootCategory),printField('Notification required',i.incReportable,'wide')
    ])+`<table class="print-table"><thead><tr><th>Five Whys</th><th>Analysis</th></tr></thead><tbody>${whyRows}</tbody></table>`+
    printGrid([printField('Root and contributing causes',i.incCauses,'full')]))+
    printSection('Corrective action and learning',printGrid([
      printField('Corrective and preventive actions',i.incActions,'wide'),printField('Lessons learned / communication',i.incLessons,'wide'),
      printField('Action owner',i.incActionOwner,'wide'),printField('Target completion date',formatDate(i.incActionDue),'wide')
    ]));
  return `${cleanFilePart(getCompany().prefix,'HSE')}_Incident_Report_${cleanFilePart(i.incRef||i.incTitle)}_${today()}`;
}
function buildToolboxPrint(){
  const t=collectToolbox();setupPrintHeader('Toolbox Talk & Attendance Record',t.tbTopic,t.tbRef);
  const attendees=t.attendees.map((a,index)=>`<tr><td>${index+1}</td><td>${esc(a.name)}</td><td>${esc(a.employeeId)}</td><td>${esc(a.company)}</td><td>${esc(a.signature)}</td></tr>`).join('');
  $('#printContent').innerHTML=
    printSection('Talk details',printGrid([
      printField('Topic',t.tbTopic,'wide'),printField('Project / site',t.tbSite,'wide'),printField('Date',formatDate(t.tbDate)),printField('Start time',t.tbTime),
      printField('Duration',t.tbDuration?`${t.tbDuration} minutes`:''),printField('Presenter',t.tbPresenter),printField('Language',t.tbLanguage),printField('Required PPE',t.tbPpe,'wide')
    ]))+
    printSection('Briefing content',printGrid([
      printField('Objective',t.tbObjective,'wide'),printField('Hazards and consequences',t.tbHazards,'wide'),
      printField('Key controls / discussion points',t.tbPoints,'wide'),printField('Emergency arrangements / stop-work triggers',t.tbEmergency,'wide'),
      printField('Questions and worker feedback',t.tbFeedback,'wide'),printField('Presenter observations / follow-up',t.tbFollowup,'wide')
    ]))+
    printSection(`Attendance — ${t.attendees.filter(a=>a.name).length} participant(s)`,`<table class="print-table"><thead><tr><th>#</th><th>Name</th><th>Employee ID</th><th>Company / trade</th><th>Signature / confirmation</th></tr></thead><tbody>${attendees}</tbody></table>`);
  return `${cleanFilePart(getCompany().prefix,'HSE')}_Toolbox_Talk_${cleanFilePart(t.tbRef||t.tbTopic)}_${today()}`;
}
function buildInspectionPrint(){
  const i=collectInspection();setupPrintHeader('HSE Inspection Report',`${i.inspectionSite}${i.inspectionArea?' — '+i.inspectionArea:''}`,i.inspectionRef);
  const rows=i.rows.map((r,index)=>`<tr><td>${index+1}</td><td>${nl(r.item)}</td><td>${esc(r.status)}</td><td>${esc(r.risk)}</td><td>${nl(r.observation)}</td><td>${nl(r.action)}</td><td>${esc(r.responsible)}</td><td>${esc(formatDate(r.due))}</td></tr>`).join('');
  $('#printContent').innerHTML=
    printSection('Inspection details',printGrid([
      printField('Template',$('#inspectionTemplate').selectedOptions[0]?.textContent||i.inspectionTemplate),printField('Project / site',i.inspectionSite),
      printField('Area / department',i.inspectionArea),printField('Date',formatDate(i.inspectionDate)),printField('Inspector',i.inspectionInspector),
      printField('Accompanied by',i.inspectionAccompanied),printField('Overall status',i.inspectionOverall),printField('Compliance score',i.score+'%')
    ]))+
    printSection('Inspection findings',`<table class="print-table"><thead><tr><th>#</th><th>Inspection item</th><th>Status</th><th>Risk</th><th>Observation / evidence</th><th>Required action</th><th>Responsible</th><th>Due date</th></tr></thead><tbody>${rows}</tbody></table>`)+
    printSection('Summary and positive observations',printGrid([printField('Summary',i.inspectionSummary,'full')]));
  return `${cleanFilePart(getCompany().prefix,'HSE')}_Inspection_${cleanFilePart(i.inspectionRef||i.inspectionSite)}_${today()}`;
}
function buildCapaPrint(){
  const rows=getFilteredCapa();setupPrintHeader('Corrective & Preventive Action Register',`${rows.length} filtered action(s)`,`${getCompany().prefix||'HSE'}-CAPA`);
  const tableRows=rows.map((r,index)=>`<tr><td>${index+1}</td><td>${esc(r.capaId)}</td><td>${esc(r.source)}</td><td>${nl(r.finding)}</td><td>${nl(r.action)}</td><td>${esc(r.responsible)}</td><td>${esc(formatDate(r.due))}${daysOverdue(r.due,r.status)?` (${daysOverdue(r.due,r.status)} overdue)`:''}</td><td>${esc(r.priority)}</td><td>${esc(r.status)}</td><td>${esc(r.progress)}%</td><td>${esc(r.effectiveness)}</td></tr>`).join('');
  $('#printContent').innerHTML=
    printSection('Register summary',printGrid([
      printField('Total filtered actions',rows.length),printField('Overdue',rows.filter(r=>daysOverdue(r.due,r.status)>0).length),
      printField('Completed / closed',rows.filter(r=>['Completed','Closed'].includes(r.status)).length),printField('Effectiveness verified',rows.filter(r=>r.effectiveness==='Effective').length)
    ]))+
    printSection('Action register',`<table class="print-table"><thead><tr><th>#</th><th>ID</th><th>Source</th><th>Finding / root cause</th><th>Required action</th><th>Responsible</th><th>Due</th><th>Priority</th><th>Status</th><th>Progress</th><th>Effectiveness</th></tr></thead><tbody>${tableRows}</tbody></table>`);
  return `${cleanFilePart(getCompany().prefix,'HSE')}_CAPA_Register_${today()}`;
}
const printBuilders={risk:buildRiskPrint,jsa:buildJsaPrint,incident:buildIncidentPrint,toolbox:buildToolboxPrint,inspection:buildInspectionPrint,capa:buildCapaPrint};
let originalTitle=document.title;
$$('[data-print]').forEach(button=>button.addEventListener('click',()=>{
  const builder=printBuilders[button.dataset.print];if(!builder)return;
  const filename=builder();originalTitle=document.title;document.title=filename;$('#printArea').setAttribute('aria-hidden','false');
  setTimeout(()=>window.print(),100);
}));
window.addEventListener('afterprint',()=>{document.title=originalTitle;$('#printArea').setAttribute('aria-hidden','true');});

// Initialise
function initialise(){
  renderCompany();setDefaults();
  fillRisk(null);fillJsa(null);fillIncident(null);fillToolbox(null);fillInspection(null);clearCapaForm();
  refreshRiskRecords();refreshJsaRecords();refreshIncidentRecords();refreshToolboxRecords();refreshInspectionRecords();
  renderCapa();updateDashboard();updateStorageMeter();
  const hash=location.hash.replace('#','');navigate(['home','dashboard','projects','risk','jsa','incident','toolbox','inspection','capa','training','assets','emergency','compliance','analytics','public','settings'].includes(hash)?hash:'home');
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
initialise();
})();
