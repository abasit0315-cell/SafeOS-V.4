(() => {
'use strict';
const LOG_KEY='safeos4-audit-log';
const limits={short:200,long:10000,file:8*1024*1024};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function sanitize(value,max=limits.long){return String(value??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').slice(0,max);}
function safeUrl(value){try{const u=new URL(value,location.href);return ['https:','http:','mailto:','tel:'].includes(u.protocol)?u.href:'';}catch{return '';}}
async function digest(text){if(!crypto.subtle)return '';const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(b)].map(v=>v.toString(16).padStart(2,'0')).join('');}
async function log(action,module='system',recordId='',details=''){let rows=[];try{rows=JSON.parse(localStorage.getItem(LOG_KEY)||'[]');}catch{}const previous=rows.at(-1)?.hash||'';const entry={timestamp:new Date().toISOString(),action:sanitize(action,100),module:sanitize(module,80),recordId:sanitize(recordId,120),details:sanitize(details,500),previous};entry.hash=await digest(JSON.stringify(entry));rows.push(entry);if(rows.length>5000)rows=rows.slice(-5000);localStorage.setItem(LOG_KEY,JSON.stringify(rows));return entry;}
function validateFile(file){if(!file)return {ok:false,reason:'No file selected'};if(file.size>limits.file)return {ok:false,reason:'File exceeds 8 MB community limit'};const allowed=/^(image\/(jpeg|png|webp)|application\/(pdf|json)|text\/(plain|csv))$/i;return allowed.test(file.type||'text/plain')?{ok:true}:{ok:false,reason:'Unsupported file type'};}
function selfCheck(){return [
 ['Input encoding','Pass','User-generated content is escaped before HTML rendering.'],
 ['Local data privacy','Pass','Records remain on-device unless the user exports or configures a receiver.'],
 ['Folder authorization','Pass','Folder writes require explicit browser permission.'],
 ['Transport security','Conditional','Use HTTPS; GitHub Pages provides TLS.'],
 ['Authentication','Not applicable','Community local-first mode has no trusted multi-user authentication.'],
 ['Authorization','Not applicable','Displayed roles are workflow views, not a security boundary.'],
 ['Auditability','Pass','Local chained activity log is available for key events.'],
 ['Backend controls','Deployment dependent','Hosted receivers must implement authentication, validation, rate limiting and secure secrets.']
 ];}
window.SafeOSSecurity={esc,sanitize,safeUrl,log,validateFile,selfCheck,limits,asvsVersion:'5.0.0',statement:'Aligned with selected OWASP ASVS 5.0 verification principles; not independently certified.'};
window.addEventListener('error',e=>log('client-error','application','',e.message));
})();
