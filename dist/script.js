'use strict';
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu(){ nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }
toggle.addEventListener('click',()=>{ const expanded=toggle.getAttribute('aria-expanded')==='true'; toggle.setAttribute('aria-expanded',String(!expanded)); nav.classList.toggle('open',!expanded); });
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape' && nav.classList.contains('open')){closeMenu();toggle.focus();}});
window.matchMedia('(min-width:851px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
const form=document.querySelector('#contact-form');
const fields=document.querySelector('#contact-fields');
const notice=document.querySelector('.form-notice');
const status=document.querySelector('.form-result');
const review=document.querySelector('#form-review');
const submit=form.querySelector('.submit');
let confirmed=false,token='',widgetId;
function showStatus(message){status.textContent=message;status.hidden=false;status.focus();}
function edit(){confirmed=false;review.hidden=true;submit.textContent='入力内容を確認する →';}
document.querySelector('#edit-message').addEventListener('click',edit);
form.addEventListener('input',edit);
(async()=>{try{
 const response=await fetch('/api/contact');if(!response.ok)return;const config=await response.json();if(!config.enabled)return;
 window.nagiCaptchaReady=()=>{widgetId=window.turnstile.render('#captcha',{sitekey:config.siteKey,action:'contact',callback:value=>{token=value;},'expired-callback':()=>{token='';},'error-callback':()=>{token='';showStatus('不正送信防止の確認を読み込めません。再読み込みしてください。');}});fields.disabled=false;notice.textContent='ご相談内容は問い合わせ担当2名へ届きます。病歴や服薬などの詳しい情報は記入しないでください。';document.querySelector('.privacy p').textContent='入力内容は株式会社壱期の問い合わせ担当2名へメールで通知し、ご相談への回答・連絡のために使用します。メール配送にResend、不正送信防止にCloudflare Turnstileを利用します。病歴・服薬などの詳しい情報はフォームに記入せず、必要に応じて個別にお伺いします。';};
 const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?onload=nagiCaptchaReady&render=explicit';script.async=true;script.onerror=()=>{notice.textContent='フォームを読み込めませんでした。ページを再読み込みしてください。';};document.head.append(script);
}catch{/* Keep the clear unavailable state; never claim delivery. */}})();
form.addEventListener('submit',async event=>{
 event.preventDefault();if(fields.disabled||!form.reportValidity())return;
 if(!confirmed){
  const dl=review.querySelector('dl');dl.replaceChildren();
  for(const [key,label] of [['kind','種類'],['name','お名前'],['email','メール'],['phone','電話'],['message','内容']]){const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=form.elements[key].value||'未入力';dl.append(dt,dd);}
  confirmed=true;review.hidden=false;submit.textContent='この内容で送信する →';review.scrollIntoView({block:'center'});return;
 }
 if(!token){showStatus('不正送信防止の確認が完了するまでお待ちください。');return;}
 const data=Object.fromEntries(new FormData(form));data.consent=form.elements.consent.checked;data.token=token;
 submit.disabled=true;submit.textContent='送信中…';
 try{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.error||'送信できませんでした。');form.reset();edit();showStatus('お問い合わせを受け付けました。担当者からのご連絡をお待ちください。');}
 catch(error){showStatus(error.message||'通信できませんでした。時間をおいて再度お試しください。');}
 finally{submit.disabled=false;submit.textContent=confirmed?'この内容で送信する →':'入力内容を確認する →';token='';if(window.turnstile&&widgetId!==undefined)window.turnstile.reset(widgetId);}
});
