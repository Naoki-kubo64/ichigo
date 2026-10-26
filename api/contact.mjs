import {createHash} from 'node:crypto';
const recipients=['info.ichigo.kubo@gmail.com','info.ichigo.matsumoto@gmail.com'];
const ready=()=>Boolean(process.env.RESEND_API_KEY&&process.env.CONTACT_FROM&&process.env.TURNSTILE_SECRET_KEY&&process.env.TURNSTILE_SITE_KEY);
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export function GET(){return json({enabled:ready(),siteKey:ready()?process.env.TURNSTILE_SITE_KEY:null});}
export async function POST(request){
 if(!ready())return json({error:'送信機能は準備中です。'},503);
 const origin=request.headers.get('origin');
 const allowed=new Set([new URL(request.url).origin,...(process.env.CONTACT_ALLOWED_ORIGINS||'').split(',').filter(Boolean)]);
 if(!origin||!allowed.has(origin))return json({error:'このページから再度お試しください。'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'形式が正しくありません。'},415);
 let body;try{const raw=await request.text();if(Buffer.byteLength(raw)>24000)return json({error:'入力内容が長すぎます。'},413);body=JSON.parse(raw);}catch{return json({error:'入力内容を確認してください。'},400);}
 if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'入力内容を確認してください。'},400);
 const limits={name:100,email:254,phone:30,message:5000,kind:30,token:2048};
 for(const [k,max] of Object.entries(limits)){if(typeof body[k]!=='string'||body[k].length>max)return json({error:'入力内容を確認してください。'},400);body[k]=body[k].trim();}
 if(body.website||body.consent!==true||!body.name||!body.message||!body.token||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)||/[\r\n]/.test(body.name+body.email+body.phone)||!['見学について','入居について','その他のご相談'].includes(body.kind))return json({error:'必須項目と同意欄をご確認ください。'},400);
 try{
  const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:body.token}),signal:AbortSignal.timeout(10000)});
  const check=await verification.json();
  if(!verification.ok||!check.success||check.hostname!==new URL(origin).hostname||check.action!=='contact')return json({error:'不正送信防止の確認をやり直してください。'},400);
  const text=`凪のホームページからのお問い合わせ\n\n種類：${body.kind}\nお名前：${body.name}\nメール：${body.email}\n電話：${body.phone||'未入力'}\n\n${body.message}\n\nこの通知は問い合わせ担当2名に配信しています。返信の重複にご注意ください。`;
  const key=createHash('sha256').update(JSON.stringify([body.kind,body.name,body.email,body.phone,body.message,Math.floor(Date.now()/300000)])).digest('hex');
  const sent=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`nagi-${key}`},body:JSON.stringify({from:process.env.CONTACT_FROM,to:recipients,reply_to:body.email,subject:`【凪】${body.kind}`,text}),signal:AbortSignal.timeout(15000)});
  if(!sent.ok){console.error('contact_delivery_failed',sent.status);return json({error:'送信を完了できませんでした。時間をおいて再度お試しください。'},502);}
  return json({ok:true});
 }catch{console.error('contact_delivery_unavailable');return json({error:'送信結果を確認できませんでした。時間をおいて再度お試しください。'},502);}
}
