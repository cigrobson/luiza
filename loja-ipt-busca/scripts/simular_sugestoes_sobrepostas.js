const { chromium } = require('playwright');
const OUT='/home/user/luiza/loja-ipt-busca/visualizacao/proposta-2026-11/';
const fs=require('fs');const src=fs.readFileSync('mock.js','utf8');const T=eval('('+src.match(/const T = (\(\) => \{[\s\S]*?\n\});/)[1]+')');
const FIX=(mob)=>{const st=document.createElement('style');st.textContent=`
.mk-busca .bi-caixa{position:relative}
.mk-busca #bi-sugestoes{position:absolute!important;left:0;right:0;top:calc(100% + 6px);z-index:40;max-height:min(420px,calc(100dvh - 160px));overflow-y:auto!important;box-shadow:0 12px 32px rgba(0,0,0,.35)}
@media (max-width:600px){.mk-busca #bi-sugestoes .bi-sug .bi-sug-acao,.mk-busca #bi-sugestoes .bi-sug a.bi-btn,.mk-busca #bi-sugestoes .bi-sug button,.mk-busca #bi-sugestoes .bi-sug [class*=lab],.mk-busca #bi-sugestoes .bi-sug [class*=cgcre],.mk-busca #bi-sugestoes .bi-sug-dica,.mk-busca #bi-sugestoes [class*=atalho]{display:none!important}
.mk-busca #bi-sugestoes{max-height:calc(100dvh - 140px)}}`;document.head.appendChild(st);
const q=document.getElementById('bi-q');q.addEventListener('focus',()=>{if(innerWidth<600){const y=q.getBoundingClientRect().top+scrollY-12;scrollTo({top:y})}});
window.__tag(document.querySelector('.mk-busca .bi-caixa'),'1','Sugestões sobrepostas, altura máxima fixa, rolagem interna','tl')};
(async()=>{const b=await chromium.launch();
 const run=async(nome,vp,mob,q)=>{const p=await b.newPage({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});await p.goto('https://loja.ipt.br/',{waitUntil:'load'});await p.waitForFunction(()=>document.documentElement.dataset.buscaPronta==='1');await p.waitForTimeout(800);await p.evaluate(T);await p.evaluate(()=>document.querySelectorAll('.mk-tag').forEach(t=>{if(/^1 /.test(t.textContent))t.remove()}));await p.evaluate(FIX,mob);
  await p.click('#bi-q');await p.type('#bi-q',q,{delay:20});await p.waitForTimeout(900);
  const r=await p.evaluate(()=>{const s=document.getElementById('bi-sugestoes').getBoundingClientRect();return {top:Math.round(s.top),h:Math.round(s.height),areasTop:Math.round(document.querySelector('.lip-areas-bloco').getBoundingClientRect().top)}});
  console.log(nome,q,JSON.stringify(r));await p.screenshot({path:OUT+nome});await p.close()};
 await run('08-sugestoes-sobrepostas-computador.png',{width:1366,height:800},false,'calibração');
 await run('09-sugestoes-celular-sem-teclado.png',{width:390,height:844},true,'calibração');
 // teclado aberto: altura visível ~ 844-336
 await run('10-sugestoes-celular-teclado-aberto.png',{width:390,height:508},true,'calibração');
 // antes: posição estática na proposta anterior com teclado
 const p=await b.newPage({viewport:{width:390,height:508},isMobile:true,hasTouch:true,deviceScaleFactor:2});await p.goto('https://loja.ipt.br/',{waitUntil:'load'});await p.waitForFunction(()=>document.documentElement.dataset.buscaPronta==='1');await p.waitForTimeout(800);await p.evaluate(T);
 await p.click('#bi-q');await p.type('#bi-q','calibração',{delay:20});await p.waitForTimeout(900);await p.screenshot({path:OUT+'07-problema-celular-teclado-aberto.png'});
 await b.close();})();
