'use strict';
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu(){ nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }
toggle.addEventListener('click',()=>{ const expanded=toggle.getAttribute('aria-expanded')==='true'; toggle.setAttribute('aria-expanded',String(!expanded)); nav.classList.toggle('open',!expanded); });
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape' && nav.classList.contains('open')){closeMenu();toggle.focus();}});
window.matchMedia('(min-width:851px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
document.querySelector('#contact-form').addEventListener('submit',event=>{event.preventDefault(); const status=document.querySelector('.form-result'); status.hidden=false; status.focus();});
