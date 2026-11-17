const { chromium } = require('playwright');
const OUT='/home/user/luiza/loja-ipt-busca/visualizacao/proposta-2026-11/';
require('fs').mkdirSync(OUT,{recursive:true});
const T = () => {
  const tag=(el,n,txt,pos='tr')=>{if(!el)return;el.style.position=el.style.position||'relative';const t=document.createElement('span');t.className='mk-tag';t.textContent=n+' · '+txt;t.style.cssText='position:absolute;z-index:50;background:#FFD23F;color:#1a1a1a;font:700 12px/1.2 "IBM Plex Sans",sans-serif;padding:4px 8px;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.35);white-space:nowrap;pointer-events:none;'+(pos==='tr'?'top:-10px;right:8px;':pos==='tl'?'top:-10px;left:8px;':pos==='br'?'bottom:-10px;right:8px;':'top:6px;right:8px;');el.appendChild(t)};
  window.__tag=tag;
  // 1. busca no topo
  const caixa=document.querySelector('.bi-caixa'), cta=document.querySelector('.lip-cta');
  caixa.style.cssText+='max-width:720px;margin:28px auto 0;text-align:left;';
  const css=[];for(const sh of document.styleSheets){let rs;try{rs=sh.cssRules}catch(e){continue}for(const r of rs){if(r.cssText&&/#busca-ipt|\.busca-ipt/.test(r.cssText))css.push(r.cssText.replace(/#busca-ipt/g,'.mk-busca').replace(/\.busca-ipt(?![\w-])/g,'.mk-busca'))}}
  const st=document.createElement('style');st.textContent=css.join('\n');document.head.appendChild(st);
  const w=document.createElement('div');w.className='mk-busca';w.dataset.theme='light';w.dataset.layout='vitrine';w.dataset.buscaPronta='1';w.style.cssText='background:transparent;';
  const bw=document.createElement('div');bw.className='bi-hero';bw.style.cssText='background:transparent;padding:0;display:block !important;';bw.appendChild(caixa);w.appendChild(bw);
  cta.replaceWith(w);
  const ex=document.getElementById('bi-examples'); ex.style.display='none';
  const sub=document.querySelector('.lip-sub'); sub.textContent='Digite um ensaio, material, norma, produto ou descreva o que precisa.';
  // seção escura antiga vira só o cabeçalho dos resultados (oculta antes da busca)
  document.querySelector('#busca-ipt .bi-hero').style.display='none';
  tag(caixa,'1','Busca única no topo; sugestões só ao digitar','tl');
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
 const abrir=async(vp,mob,url='https://loja.ipt.br/')=>{const p=await b.newPage({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});await p.goto(url,{waitUntil:'load'});await p.waitForFunction(()=>document.documentElement.dataset.buscaPronta==='1');await p.evaluate(()=>document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager'));await p.waitForTimeout(1500);await p.evaluate(T);await p.waitForTimeout(500);return p};
 const D={width:1366,height:800};
 let p=await abrir(D,false);
 await p.screenshot({path:OUT+'01-topo-computador.png'});
 await p.click('#bi-q');await p.type('#bi-q','manômetro',{delay:30});await p.waitForTimeout(900);
 await p.screenshot({path:OUT+'02-sugestoes-ao-digitar-computador.png'});
 await p.keyboard.press('Escape');
 await p.evaluate(()=>document.querySelector('.lip-destaques').scrollIntoView());await p.waitForTimeout(400);
 await p.screenshot({path:OUT+'04-destaques-computador.png'});
 // resultados
 await p.fill('#bi-q','calibração');await p.keyboard.press('Enter');await p.waitForTimeout(1500);
 await p.evaluate(RES);await p.evaluate(()=>document.getElementById('bi-resultados').scrollIntoView());await p.evaluate(()=>window.scrollBy(0,-20));await p.waitForTimeout(400);
 await p.screenshot({path:OUT+'03-resultados-computador.png'});
 // formulário via Solicitar compra
 await p.goto('about:blank');p=await abrir(D,false);
 await p.locator('.lip-prod.is-compra .lip-prod-btn').first().click();await p.waitForTimeout(1500);
 await p.evaluate(()=>{const h=document.querySelector('.lip-contato h2');h.textContent='Solicitar compra';document.querySelector('.lip-contato-p').textContent='Confira o pedido no campo de mensagem, informe seus dados e envie. Não há pagamento nesta etapa.';window.__tag(h,'4','Título conforme a origem (compra ou orçamento)','tr');document.getElementById('contato').scrollIntoView()});await p.waitForTimeout(400);
 await p.screenshot({path:OUT+'05-formulario-computador.png',fullPage:false});
 // página inteira
 p=await abrir(D,false); await p.screenshot({path:OUT+'00-pagina-inteira-computador.png',fullPage:true});
 const m=await abrir({width:390,height:844},true); await m.screenshot({path:OUT+'00-pagina-inteira-celular.png',fullPage:true});
 await m.screenshot({path:OUT+'01-topo-celular.png'});
 await b.close();
})();
