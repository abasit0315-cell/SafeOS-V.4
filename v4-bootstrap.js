(() => {
'use strict';
const $=(s,r=document)=>r.querySelector(s);
function toast(message){const el=$('#toast');if(!el)return;el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2800);}
async function updateFolderStatus(){
  const badge=$('#folderConnectionBadge'),name=$('#folderConnectionName');
  if(!window.SafeOSStorage){if(badge)badge.textContent='Unavailable';return;}
  const state=await window.SafeOSStorage.status();
  if(badge){badge.textContent=state.connected?'Connected':state.supported?'Not connected':'Download fallback';badge.className='status-badge '+(state.connected?'good':state.supported?'neutral':'warn');}
  if(name)name.textContent=state.connected?(state.name||'Connected folder'):(state.supported?'No folder selected':'Folder access is not supported in this browser. Reports will download normally.');
}
async function connect(){try{const name=await window.SafeOSStorage.connectFolder();toast(`SafeOS folder connected: ${name}`);await updateFolderStatus();}catch(error){toast(error.message||'Folder connection failed');}}
async function disconnect(){await window.SafeOSStorage?.disconnect?.();toast('SafeOS folder disconnected');await updateFolderStatus();}
async function backup(){try{const result=await window.SafeOSStorage.backupAll();toast(result.mode==='folder'?`Backup saved: ${result.filename}`:`Backup downloaded: ${result.filename}`);}catch(error){toast(error.message||'Backup failed');}}
async function restore(file){if(!file)return;try{if(!confirm('Restore this SafeOS backup? Existing records with the same storage keys will be replaced.'))return;await window.SafeOSStorage.restoreFile(file);}catch(error){toast(error.message||'Backup restore failed');}}
function routeFromLocation(){const page=location.hash.slice(1)||'home';if(['camps','transport'].includes(page))window.SafeOSSpecialist?.showPage?.(page,false);else if(window.SafeOS?.go)window.SafeOS.go(page);}
function init(){
  $('#connectSafeosFolder')?.addEventListener('click',connect);
  $('#disconnectSafeosFolder')?.addEventListener('click',disconnect);
  $('#backupSafeosData')?.addEventListener('click',backup);
  $('#restoreSafeosData')?.addEventListener('change',event=>restore(event.target.files?.[0]));
  window.addEventListener('safeos-folder-connected',updateFolderStatus);
  window.addEventListener('safeos-folder-disconnected',updateFolderStatus);
  window.addEventListener('popstate',routeFromLocation);
  updateFolderStatus();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(error=>console.warn('Service worker registration failed',error));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
