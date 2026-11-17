const { chromium } = require('playwright');
const fs=require('fs');const src=fs.readFileSync('mock3.js','utf8');
const LOGO=src.match(/const LOGO='([^']+)'/)[1];const TXT=eval(src.match(/const TXT_SAA=('.*?');\n/s)[1]);
const OUT='/home/user/luiza/loja-ipt-busca/visualizacao/proposta-2026-11-v3/';
const LONGA='O SAA é um serviço online do IPT que monitora e atualiza normas técnicas, regulamentos e leis, oferecendo informações sobre a última edição, erratas, emendas, suplementos, cancelamentos, substituições, projetos de revisão e equivalência entre normas. O IPT monitora normas de mais de 200 organismos normativos nacionais e internacionais. A assinatura inclui alertas periódicos por e-mail sobre alterações nas normas de interesse, consulta presencial ao acervo do IPT, atendimento preferencial, desconto na aquisição de normas e acesso simultâneo de múltiplos usuários ao sistema. O SAA é instrumento válido para auditorias de sistemas de gestão da qualidade, demonstrando o registro e controle da documentação técnica, e de sistemas de gestão de riscos, prevenindo o uso de documentos normativos desatualizados.';
(async()=>{const b=await chromium.launch();
for(const [n,vp,mob] of [['computador',{width:1366,height:900},false],['celular',{width:390,height:844},true]]){
const p=await b.newPage({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});
await p.goto('https://loja.ipt.br/produto/saa-assinatura-anual-de-monitoramento-de-normas-tecnicas/',{waitUntil:'load'});await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>[...document.querySelectorAll('.woocommerce-tabs li a, .summary > *')].map(e=>e.tagName+'.'+e.className.split(' ')[0]+':'+e.innerText.slice(0,40).replace(/\n/g,' '))));
await p.evaluate(([LOGO,TXT,LONGA])=>{
 const tag=(el,t)=>{el.style.position='relative';const s=document.createElement('span');s.textContent=t;s.style.cssText='position:absolute;z-index:50;top:-12px;left:6px;background:#FFD23F;color:#1a1a1a;font:700 12px/1.2 sans-serif;padding:4px 8px;border-radius:4px;white-space:nowrap';el.appendChild(s)};
 const g=document.querySelector('.woocommerce-product-gallery');g.innerHTML='<img src="'+LOGO+'" alt="SAA – Monitoramento de Normas Técnicas" style="width:100%;height:auto;background:#fff;padding:24px;box-sizing:border-box;border:1px solid #e3e8ee;border-radius:8px">';g.style.opacity=1;tag(g,'Logomarca do SAA');
 const sm=document.querySelector('.summary');
 sm.querySelectorAll('.price, .bsipt-aviso-frete, p.stock').forEach(e=>e.remove());
 [...sm.querySelectorAll('p,div')].filter(e=>/Valores sem frete/.test(e.innerText)&&e.children.length<3).forEach(e=>e.remove());
 const sd=sm.querySelector('.woocommerce-product-details__short-description');if(sd){sd.innerHTML='<p>'+TXT.replace('color:#7fd3ff','color:#00749a')+'</p>';tag(sd,'Mesmo texto do formulário, com link no “SAA”')}
 const btn=[...sm.querySelectorAll('a,button')].find(e=>/Solicitar compra/.test(e.innerText));if(btn){btn.textContent='Solicitar orçamento';tag(btn.parentElement,'“Solicitar orçamento”; sem preço')}
 document.querySelectorAll('.woocommerce-tabs li').forEach(li=>{if(!/Descri/.test(li.innerText))li.remove()});
 const d=document.querySelector('#tab-description');if(d){d.innerHTML='<h2>Descrição</h2><p>'+LONGA+'</p>';tag(d,'Descrição sem a frase das 1000 normas; abas “Informação adicional” e “Avaliações” retiradas')}
},[LOGO,TXT,LONGA]);
await p.waitForTimeout(400);await p.screenshot({path:OUT+'05-pagina-produto-saa-'+n+'.png',fullPage:true});await p.close();}
await b.close();})();
