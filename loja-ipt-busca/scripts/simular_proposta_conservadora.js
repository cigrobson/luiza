const { chromium } = require('playwright');
const OUT='/home/user/luiza/loja-ipt-busca/visualizacao/proposta-2026-11-conservadora/';
require('fs').mkdirSync(OUT,{recursive:true});
const T = () => {
  const tag=(el,n,txt,pos='tr')=>{if(!el)return;el.style.position=el.style.position||'relative';const t=document.createElement('span');t.className='mk-tag';t.textContent=n+' · '+txt;t.style.cssText='position:absolute;z-index:50;background:#FFD23F;color:#1a1a1a;font:700 12px/1.2 "IBM Plex Sans",sans-serif;padding:4px 8px;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.35);white-space:nowrap;pointer-events:none;'+(pos==='tr'?'top:-10px;right:8px;':pos==='tl'?'top:-10px;left:8px;':pos==='br'?'bottom:-10px;right:8px;':'top:6px;right:8px;');el.appendChild(t)};
  window.__tag=tag;
  // 1. caixa no topo que leva à busca de baixo (opção conservadora)
  const cta=document.querySelector('.lip-cta');
  const fake=cta.cloneNode(false); fake.removeAttribute('class');
  fake.setAttribute('aria-label','Buscar ensaio, material, norma ou produto (vai para a caixa de busca)');
  fake.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#5b6b7f" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg><span style="flex:1;color:#5b6b7f;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Ensaio, material, norma ou produto</span><span style="background:#2c9fd9;color:#0b1f33;font-weight:700;padding:9px 18px;border-radius:6px;font-size:15px">Buscar</span>';
  fake.style.cssText='display:flex;align-items:center;gap:12px;max-width:640px;margin:28px auto 0;background:#fff;border-radius:8px;padding:7px 7px 7px 16px;text-decoration:none;font:16px "IBM Plex Sans",sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.25);cursor:text;position:relative';
  fake.addEventListener('click',e=>{e.preventDefault();const q=document.getElementById('bi-q');q.closest('.bi-hero').scrollIntoView({behavior:'instant',block:'start'});q.focus()});
  cta.replaceWith(fake);
  const ex=document.getElementById('bi-examples'); ex.style.display='none';
  tag(fake,'1','Aparência de caixa de busca; ao tocar, leva à busca abaixo','tl');
  const bh=document.querySelector('#busca-ipt .bi-caixa'); tag(bh,'1','Busca real no lugar atual; sugestões só ao digitar','tl');
  // destaques: rótulos e SAA
  document.querySelectorAll('.lip-aba-mobile').forEach(e=>{e.textContent=e.closest('.lip-aba-compra')?'Preço definido':'Solicitação de serviço'});
  const aviso=document.querySelector('.lip-aviso-frete'); aviso.innerHTML='Itens com preço definido: valores sem frete; o frete é calculado e informado pela equipe junto com a confirmação do pedido.';
  const ref=[...document.querySelectorAll('.lip-prod')].find(e=>!e.classList.contains('is-compra'));
  const saa=[...document.querySelectorAll('.lip-prod')].find(e=>/SAA/.test(e.innerText));
  if(saa&&ref){saa.className=ref.className;saa.querySelector('.lip-prod-selo').textContent=ref.querySelector('.lip-prod-selo').textContent;
    const pr=saa.querySelector('.lip-prod-preco');const rp=ref.querySelector('.lip-prod-preco')||ref.querySelector('p:not(.lip-prod-selo)');pr.outerHTML=rp?rp.outerHTML:'<p>Valor após avaliação técnica</p>';
    const bt=saa.querySelector('.lip-prod-btn'),rb=ref.querySelector('.lip-prod-btn');bt.className=rb.className;bt.textContent='Solicitar orçamento';
    tag(saa,'5','SAA passa a orçamento','tl');}
  tag(document.querySelector('.lip-abas'),'7','Rótulos padronizados','tr');
  // Areia duplicada: variar destaques (simulação) - não alterado
  // 4. formulário
  const txt=document.querySelector('.lip-contato-texto');
  const box=document.createElement('div');
  box.innerHTML='<p style="font-weight:700;margin:18px 0 8px;color:#fff">O que acontece depois do envio</p><ol style="margin:0;padding-left:20px;line-height:1.6;color:#cfe3f3;text-align:left"><li>Você recebe por e-mail o número de protocolo (IPT-LOJA-…).</li><li>A equipe da Loja IPT responde em até <mark style="background:#FFD23F;padding:0 4px">[prazo a confirmar]</mark> dias úteis.</li><li>Produtos com preço definido: confirmamos disponibilidade, frete e forma de pagamento.</li><li>Serviços: o laboratório avalia a solicitação e envia o orçamento.</li></ol>';
  box.style.cssText='max-width:640px;margin:0 auto;font-size:15px;';
  txt.appendChild(box); tag(box,'4','Aviso do que acontece após o envio','tl');
  const tel=document.querySelector('.lip-contato-p');
  // 6. institucional / certificado
};
const RES = () => {
  document.querySelectorAll('#bi-resultados .bi-lab').forEach(e=>e.remove());
  document.querySelectorAll('#bi-resultados .bi-desc').forEach(e=>{if(/LGE\/IPT/.test(e.innerHTML)){e.innerHTML=e.innerHTML.replace('LGE/IPT','IPT');window.__tag(e.closest('.bi-card'),'6','Certificado “emitido pelo IPT”, sem sigla','br')}});
  const h=[...document.querySelectorAll('#bi-resultados h3')].find(x=>/LABORAT/i.test(x.innerText));
  if(h){let g=h.parentElement; if(g.querySelectorAll('h3').length>1){ // irmãos
     let n=h; const rm=[]; while(n){rm.push(n);n=n.nextElementSibling; if(n&&n.tagName==='H3')break;} rm.forEach(x=>x.remove());} else g.remove();}
  const hm=[...document.querySelectorAll('#bi-resultados h3')].find(x=>/MODALIDADE/i.test(x.innerText));
  if(hm){const g=hm.parentElement;[...g.querySelectorAll('label')].forEach(l=>{l.innerHTML=l.innerHTML.replace('Pedido pelo formulário','Preço fixo; pedido pelo formulário, sem pagamento on-line').replace('Avaliação técnica e orçamento','O laboratório avalia e envia orçamento')});}
  const a=[...document.querySelectorAll('#bi-resultados h3')].find(x=>/ÁREA/i.test(x.innerText));
  const card=document.querySelector('#bi-resultados .bi-card');
  window.__tag(card,'2','Sem laboratório no cartão (fica no detalhe)','tl');
  if(a)window.__tag(a.parentElement,'3','Filtro Laboratório retirado; Área mantida','tl');
};
(async()=>{
 const b=await chromium.launch();
 const abrir=async(vp,mob)=>{const p=await b.newPage({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});await p.goto('https://loja.ipt.br/',{waitUntil:'load'});await p.waitForFunction(()=>document.documentElement.dataset.buscaPronta==='1');await p.evaluate(()=>document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager'));await p.waitForTimeout(1500);await p.evaluate(T);await p.waitForTimeout(500);return p};
 for(const [n,vp,mob] of [['computador',{width:1366,height:800},false],['celular',{width:390,height:844},true]]){
  let p=await abrir(vp,mob);
  await p.screenshot({path:OUT+'01-topo-'+n+'.png'});
  await p.screenshot({path:OUT+'00-pagina-inteira-'+n+'.png',fullPage:true});
  await p.evaluate(()=>{const f=[...document.querySelectorAll('.lip-topo a')].find(a=>/Ensaio, material/.test(a.innerText));f.click()});await p.waitForTimeout(600);
  await p.screenshot({path:OUT+'02-apos-tocar-'+n+'.png'});
  await p.type('#bi-q','calibração',{delay:20});await p.waitForTimeout(900);
  await p.screenshot({path:OUT+'03-digitando-'+n+'.png'});
  await p.keyboard.press('Enter');await p.waitForTimeout(1500);await p.evaluate(RES);
  await p.evaluate(()=>{document.getElementById('bi-resultados').scrollIntoView();scrollBy(0,-20)});await p.waitForTimeout(400);
  await p.screenshot({path:OUT+'04-resultados-'+n+'.png'});
  await p.close();
 }
 await b.close();
})();
