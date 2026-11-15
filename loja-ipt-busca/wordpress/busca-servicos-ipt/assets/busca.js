/* Busca de Serviços IPT
   Catálogo de ensaios, análises e calibrações (origem: Scriba/Busca_EAC).
   A marcação vive em #busca-ipt. Catálogo técnico: window.BUSCA_IPT_DADOS (embutido) ou o JSON
   indicado em data-dados. Produtos da loja (opcional): <script type="application/json" id="bi-produtos">
   gerado pelo plugin WordPress, ou window.BUSCA_IPT_PRODUTOS. */
(function(){
"use strict";
const RAIZ = document.getElementById('busca-ipt');
if(!RAIZ) return;
function lerProdutos(){
  const el = document.getElementById('bi-produtos');
  if(el){ try{ const v = JSON.parse(el.textContent||'[]'); if(Array.isArray(v)) return v; }catch(e){ console.warn('Busca IPT: produtos inválidos', e); } }
  return Array.isArray(window.BUSCA_IPT_PRODUTOS) ? window.BUSCA_IPT_PRODUTOS : [];
}
const PRODUTOS = lerProdutos();

/* ===================== MAPA DE ÁREAS TÉCNICAS E TIPOS DE SOLUÇÃO =====================
   Único lugar a editar para mudar nomes, laboratórios ou o enquadramento dos produtos.
   id: usado nos endereços (?area=..., ?solucao=...) e nos links da página.
   Serviços do catálogo técnico entram na área pelo laboratório; produtos da loja pela
   categoria do WooCommerce ou pelo ID (PRODUTO_AREA / PRODUTO_SOLUCAO), sem alterar a loja. */
const AREAS = [
  {id:'papel-embalagem',         nome:'Papel e Embalagem',                         labs:['LCPE'],                        cats:[]},
  {id:'metrologia-calibracao',   nome:'Metrologia e Calibração',                   labs:['LME','LMM','LV','LRM'],        cats:['Energia e Metrologia']},
  {id:'construcao-civil',        nome:'Construção Civil',                          labs:['LMPC','LTDC','LEL'],           cats:['Materiais de Referência']},
  {id:'energia-conforto',        nome:'Energia e Conforto Ambiental',              labs:['LGE','LCAP'],                  cats:[]},
  {id:'bioenergia-combustiveis', nome:'Bioenergia e Combustíveis',                 labs:['LBE'],                         cats:[]},
  {id:'seguranca-fogo',          nome:'Segurança ao Fogo',                         labs:['LSFEX'],                       cats:[]},
  {id:'quimica-processos',       nome:'Química e Processos',                       labs:['LQM','LPP','LCP'],             cats:[]},
  {id:'meio-ambiente',           nome:'Meio Ambiente, Geotecnia e Biotecnologia',  labs:['LARI','SIRGA','LBI','NUTABES'], cats:['Geotecnia e Meio Ambiente','Bionano']},
];
const SOLUCOES = [
  {id:'ensaios-analises',            nome:'Ensaios e Análises'},
  {id:'calibracoes',                 nome:'Calibrações'},
  {id:'materiais-referencia',        nome:'Materiais de Referência'},
  {id:'normas-tecnicas',             nome:'Normas Técnicas — SAA'},
  {id:'diagnosticos-laudos',         nome:'Diagnósticos e Laudos'},
  {id:'consultoria-desenvolvimento', nome:'Consultoria e Desenvolvimento'},
];
/* Produtos sem categoria coerente na loja (IDs do WooCommerce em 15/11/2026). */
const PRODUTO_AREA    = {440:'meio-ambiente', 386:'meio-ambiente'};
const PRODUTO_SOLUCAO = {436:'materiais-referencia', 440:'diagnosticos-laudos'};
/* ==================================================================================== */
function iniciar(DADOS, semCatalogo){

/* ---------- texto: normalização e caixa ---------- */
const norm = s => (s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const STOP = new Set('a o as os e de da do das dos em no na nos nas para por com sem ao aos um uma ou se que sob ate pelo pela pelos pelas sua seu suas seus via entre conforme'.split(' '));
const SIGLAS = new Set(('ABNT NBR ISO ASTM IEC NM EN BS IPT CGCRE AGA UV AC DC CIE DIN IESNA LM CRL RBLE RBC CCA IRC TCC PCS DSC CCB CAL RTAC RTQ RTQAC HPLC TAPPI LED CISPR PTS PCI API RF MRPM NEA DN CUV TF FTIR FTP CMAR TRRF BSI PA CD IP EFT AM RLC TGA NT DMA JIS EAC CST RMN ANSI CEN NR TAG IA AWPA OM ICMS PFI PTB ND EMC INMETRO ABPM ANP ASME UL SAE OIML IPX IK TÜV NFPA UNE NEMA EPA OCDE OECD CONAMA ANVISA MAPA PBE ENCE IEEE GLP GNV BTU NOX SOX AEAC AEHC TOC COT ABCP LCPE LTDC LMM LME LV LQM LBE LGE LBI LCAP LCP LEL LMPC LPP LRM LSFEX LARI SIRGA NUTABES ASTMD').split(' '));
const UNID = {KV:'kV',MM:'mm',KG:'kg',CM:'cm',KN:'kN',GHZ:'GHz',HZ:'Hz',KHZ:'kHz',MHZ:'MHz',KPA:'kPa',MPA:'MPa',MG:'mg',MJ:'MJ',ML:'mL',PH:'pH',RPM:'rpm',KW:'kW',KWH:'kWh',MW:'MW',VA:'VA',KVA:'kVA',LUX:'lux'};
const PROPRIOS = new Set('janka rockwell brinell vickers shore breuning karl fischer cobb bekk klemm taber jokro pitot coriolis kjeldahl charpy izod los angeles abrams mullen schopper elmendorf gurley sheffield bendtsen martindale wyzenbeek venturi pfi'.split(' '));
function caso(s, titulo){
  if(!s) return '';
  let out = s.toLowerCase().replace(/[\p{L}\p{N}][\p{L}\p{N}\/\-]*/gu, w=>{
    const up = w.toUpperCase();
    if(SIGLAS.has(up) || /^[A-Z]+\d/i.test(up) && up.length<=12 && /\d/.test(up) && /[A-Z]/i.test(up) && !/^\d/.test(up)) return up;
    if(UNID[up]) return UNID[up];
    if(up.includes('/') && up.split('/').every(p=>SIGLAS.has(p))) return up;
    if(PROPRIOS.has(w) || (titulo && !STOP.has(w))) return w.charAt(0).toUpperCase()+w.slice(1);
    return w;
  });
  out = out.replace(/°c\b/g,'°C').replace(/°f\b/g,'°F').replace(/(\d)\s?ºc\b/g,'$1 ºC');
  if(!titulo) out = out.replace(/(^|[.!?:]\s+)(\p{Ll})/gu,(m,a,b)=>a+b.toUpperCase());
  return out;
}
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function marcar(texto, termos){
  const t = esc(texto);
  if(!termos.length) return t;
  return t.replace(/[\p{L}\p{N}]+/gu, w=>{
    const n = norm(w);
    return termos.some(v=> v.length>=2 && n.startsWith(v)) ? '<mark>'+w+'</mark>' : w;
  });
}
const tokens = s => norm(s).split(/[^a-z0-9]+/).filter(Boolean);

/* ---------- índice ---------- */
const TIPO_LOJA = 'Itens da Loja IPT';
const P = PRODUTOS.map(p=>{
  const cats = (p.categorias||[]).filter(Boolean), tags = (p.tags||[]).filter(Boolean);
  const o = {
    fonte:'loja', mod: p.compra ? 'compra' : 'solicitacao', registro:null, id:p.id,
    tipo_servico: TIPO_LOJA, nome:p.nome||'', descricao:p.descricao||'', palavras_chave:[...cats,...tags],
    laboratorios:[], certificados_cgcre:[], contato:{url:p.url}, url:p.url, preco:p.preco||'',
    carrinho:p.carrinho||'', compra:!!p.compra, sku:p.sku||'', categorias:cats, imagem:p.imagem||'',
    nomeV:p.nome||'', descV:p.descricao||'', kwV:cats, labsV:[], cgcre:false,
  };
  o.tNome = tokens(o.nome); o.tKw = tokens([...cats,...tags,o.sku].join(' ')); o.tDesc = tokens(o.descricao);
  o.tLab = tokens(cats.join(' ')); o.fNome = norm(o.nome); o.fAll = norm([o.nome,o.descricao,cats.join(' '),tags.join(' ')].join(' '));
  o.area = PRODUTO_AREA[p.id] || (AREAS.find(a=>a.cats.some(c=>cats.includes(c)))||{}).id || null;
  const nn = norm(o.nome);
  o.sol = PRODUTO_SOLUCAO[p.id]
    || (cats.some(c=>/^SAA/.test(c)) || /^saa\b/.test(nn) ? 'normas-tecnicas'
    : cats.includes('Materiais de Referência') ? 'materiais-referencia'
    : /^diagnostic/.test(nn) ? 'diagnosticos-laudos'
    : /^(ensaio|analise)/.test(nn) ? 'ensaios-analises' : null);
  return o;
});
const SC = DADOS.servicos.map(s=>{
  const lab = s.laboratorios;
  const o = {
    ...s, fonte:'scriba', mod:'solicitacao',
    nomeV: caso(s.nome),
    descV: caso(s.descricao||''),
    kwV: s.palavras_chave.map(k=>caso(k)),
    labsV: lab.map(l=>({sigla:l.sigla, nome:caso(l.nome,true)})),
    cgcre: s.certificados_cgcre.length>0,
  };
  o.tNome = tokens(s.nome); o.tKw = tokens(s.palavras_chave.join(' ')); o.tDesc = tokens(s.descricao||'');
  o.tLab = tokens(lab.map(l=>l.sigla+' '+l.nome).join(' '));
  o.fNome = norm(s.nome); o.fAll = norm([s.nome,s.descricao,s.palavras_chave.join(' ')].join(' '));
  return o;
});
SC.forEach(s=>{
  s.area = (AREAS.find(a=>s.laboratorios.some(l=>a.labs.includes(l.sigla)))||{}).id || null;
  const nn = norm(s.nome), tudo = norm(s.nome+' '+(s.descricao||''));
  s.sol = s.tipo_servico==='Serviços tecnológicos'
    ? (/(diagnostic|identificac|parecer)/.test(nn) ? 'diagnosticos-laudos' : 'consultoria-desenvolvimento')
    : (tudo.includes('calibra') ? 'calibracoes' : 'ensaios-analises');
});
const S = [...P, ...SC];
const NOME_AREA = Object.fromEntries(AREAS.map(a=>[a.id,a.nome])), NOME_SOL = Object.fromEntries(SOLUCOES.map(x=>[x.id,x.nome]));
const VOCAB = new Set(); S.forEach(s=>[s.tNome,s.tKw,s.tDesc,s.tLab].forEach(a=>a.forEach(t=>VOCAB.add(t))));
const VOCARR = [...VOCAB];
const USE = DADOS.use.map(u=>({termo:u.termo, use:u.use, n:norm(u.termo), nu:norm(u.use)}));
const LABS = (()=>{const m=new Map();S.forEach(s=>s.labsV.forEach(l=>{if(!m.has(l.sigla))m.set(l.sigla,l.nome)}));return [...m].sort((a,b)=>a[0].localeCompare(b[0]))})();
const MODS = [['compra','Compra direta','Preço definido, compra imediata'],['solicitacao','Solicitação de serviço','Avaliação técnica e orçamento']];

function lev(a,b,max){
  if(Math.abs(a.length-b.length)>max) return max+1;
  let prev = Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    const cur=[i]; let best=i;
    for(let j=1;j<=b.length;j++){
      cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
      if(cur[j]<best) best=cur[j];
    }
    if(best>max) return max+1;
    prev=cur;
  }
  return prev[b.length];
}
function variantes(t){
  const v=new Set([t]);
  if(t.length>4){
    if(t.endsWith('oes')||t.endsWith('aes')) v.add(t.slice(0,-3)+'ao');
    if(t.endsWith('eis')) v.add(t.slice(0,-3)+'el');
    if(t.endsWith('ais')) v.add(t.slice(0,-3)+'al');
    if(t.endsWith('es')) v.add(t.slice(0,-2));
    if(t.endsWith('s')) v.add(t.slice(0,-1));
  }
  return [...v];
}
const casa = (arr,v) => v.length<3 ? arr.includes(v) : arr.some(x=>x.startsWith(v));
const conhecido = v => v.length<3 ? VOCAB.has(v) : VOCARR.some(x=>x.startsWith(v));

function analisar(q, semCorrecao){
  const frases=[]; q = q.replace(/["“”']([^"“”']+)["“”']/g,(m,f)=>{frases.push(norm(f).trim());return ' '});
  const brutos = tokens(q);
  const termos=[], corrigidos=[];
  for(const t of brutos){
    if(STOP.has(t) && brutos.length>1) continue;
    let vs = variantes(t);
    if(!semCorrecao && !/^\d+$/.test(t) && !vs.some(conhecido) && t.length>=4){
      const max = t.length>=7?2:1; let best=[],bd=max+1;
      for(const w of VOCARR){ if(w.length<3) continue; const d=lev(t,w,max); if(d<bd){bd=d;best=[w]} else if(d===bd&&best.length<4) best.push(w) }
      if(bd<=max){ corrigidos.push([t,best[0]]); vs = best; }
    }
    termos.push({t,vs});
  }
  return {frases,termos,corrigidos};
}
function pontuar(s,a,modo){
  let score=0, hit=0;
  for(const f of a.frases){ if(!s.fAll.includes(f)) return 0; score += s.fNome.includes(f)?30:12; }
  for(const {t,vs} of a.termos){
    let sc=0;
    if(/^\d+$/.test(t) && String(s.registro)===t) sc=100;
    if(s.sku && norm(s.sku)===t) sc=100;
    for(const v of vs){
      if(casa(s.tNome,v)) sc=Math.max(sc, s.tNome.includes(v)?14:10);
      if(casa(s.tKw,v)) sc=Math.max(sc, 7);
      if(casa(s.tLab,v)) sc=Math.max(sc, 5);
      if(casa(s.tDesc,v)) sc=Math.max(sc, 3);
    }
    if(sc){hit++; score+=sc} else if(modo==='e') return 0;
  }
  if(a.termos.length && !hit) return 0;
  if(s.tNome.length && a.termos.length && a.termos.every(({vs})=>vs.some(v=>casa(s.tNome,v)))) score+=8;
  if(score && s.fonte==='loja') score+=4;  // itens da loja têm ação imediata
  return score;
}
function sinonimos(qn){
  if(qn.length<4) return [];
  return USE.filter(u=> u.n===qn || (qn.length>=5 && u.n.includes(qn)) || (u.n.length>=5 && qn.includes(u.n)) || tokens(u.n).includes(qn))
            .filter(u=> u.nu!==qn).slice(0,3);
}

/* ---------- estado ---------- */
const VITRINE = RAIZ.dataset.layout === 'vitrine';
const st = {q:'', labs:new Set(), tipos:new Set(), mods:new Set(), areas:new Set(), sols:new Set(), cgcre:false, sort:'rel', shown:24, ou:false, aberto:!VITRINE};
const CHAVES_URL = ['q','lab','tipo','mod','area','solucao','cgcre','ordem','servico'];
const $ = id => document.getElementById('bi-'+id);
function lerURL(){
  try{
    const p = new URLSearchParams(location.search);
    st.q = p.get('q')||''; st.cgcre = p.get('cgcre')==='1'; st.sort = p.get('ordem')||'rel';
    (p.get('lab')||'').split(',').filter(Boolean).forEach(x=>st.labs.add(x));
    (p.get('tipo')||'').split(',').filter(Boolean).forEach(x=>st.tipos.add(x));
    (p.get('mod')||'').split(',').filter(x=>x==='compra'||x==='solicitacao').forEach(x=>st.mods.add(x));
    (p.get('area')||'').split(',').filter(x=>NOME_AREA[x]).forEach(x=>st.areas.add(x));
    (p.get('solucao')||'').split(',').filter(x=>NOME_SOL[x]).forEach(x=>st.sols.add(x));
    if(['q','area','solucao','lab','mod','cgcre','servico'].some(k=>p.get(k))) st.aberto = true;
    return p.get('servico');
  }catch(e){return null}
}
function gravarURL(servico){
  try{
    const p = new URLSearchParams(location.search);
    CHAVES_URL.forEach(k=>p.delete(k));
    if(st.q) p.set('q',st.q);
    if(st.labs.size) p.set('lab',[...st.labs].join(','));
    if(st.tipos.size) p.set('tipo',[...st.tipos].join(','));
    if(st.mods.size) p.set('mod',[...st.mods].join(','));
    if(st.areas.size) p.set('area',[...st.areas].join(','));
    if(st.sols.size) p.set('solucao',[...st.sols].join(','));
    if(st.cgcre) p.set('cgcre','1');
    if(st.sort!=='rel') p.set('ordem',st.sort);
    if(servico) p.set('servico',servico);
    const qs = p.toString();
    history.replaceState(history.state,'',location.pathname+(qs?('?'+qs):'')+location.hash);
  }catch(e){}
}

/* ---------- busca ---------- */
let ultimo = {lista:[], termosMarca:[]};
function buscar(){
  const q = st.q.trim();
  const syn = sinonimos(norm(q));
  const a = analisar(q, syn.length>0);
  const vazio = !a.frases.length && !a.termos.length;
  let pontos = new Map(), modo='e', notas=[], extras=[];
  if(semCatalogo) notas.push('O catálogo técnico está temporariamente indisponível. Mostrando apenas os itens da Loja IPT.');
  if(!vazio){
    S.forEach(s=>{const p=pontuar(s,a,'e'); if(p) pontos.set(s,p)});
    syn.forEach(u=>{
      const b = analisar(u.use);
      S.forEach(s=>{const p=pontuar(s,b,'e'); if(p) pontos.set(s, Math.max(pontos.get(s)||0, p*0.8))});
      extras.push(...b.termos);
    });
    if(syn.length) notas.push('Incluindo resultados do termo preferido '+syn.map(u=>'<strong>'+esc(u.use)+'</strong>').join(', ')+' ('+syn.map(u=>esc(caso(u.termo))).join(', ')+' → use '+syn.map(u=>esc(u.use)).join(', ')+').');
    if(!pontos.size && a.termos.length>1){
      modo='ou';
      S.forEach(s=>{const p=pontuar(s,a,'ou'); if(p) pontos.set(s,p)});
      if(pontos.size) notas.push('Nenhum resultado contém todos os termos. Mostrando os que contêm pelo menos um deles.');
    }
    if(a.corrigidos.length) notas.push('Buscando por '+a.corrigidos.map(([o,c])=>'<strong>'+esc(c)+'</strong> em vez de “'+esc(o)+'”').join(', ')+'.');
  }
  const base = vazio ? S.slice() : [...pontos.keys()];
  const passa = (s,ignorar) => (ignorar==='lab'||!st.labs.size||s.laboratorios.some(l=>st.labs.has(l.sigla)))
    && (ignorar==='tipo'||!st.tipos.size||st.tipos.has(s.tipo_servico)) && (ignorar==='cgcre'||!st.cgcre||s.cgcre)
    && (ignorar==='mod'||!st.mods.size||st.mods.has(s.mod))
    && (ignorar==='area'||!st.areas.size||st.areas.has(s.area))
    && (ignorar==='sol'||!st.sols.size||st.sols.has(s.sol));
  const cont = {lab:new Map(), tipo:new Map(), mod:new Map(), area:new Map(), sol:new Map(), cgcre:0};
  base.forEach(s=>{
    if(passa(s,'lab')) s.laboratorios.forEach(l=>cont.lab.set(l.sigla,(cont.lab.get(l.sigla)||0)+1));
    if(passa(s,'tipo')) cont.tipo.set(s.tipo_servico,(cont.tipo.get(s.tipo_servico)||0)+1);
    if(passa(s,'cgcre') && s.cgcre) cont.cgcre++;
    if(passa(s,'mod')) cont.mod.set(s.mod,(cont.mod.get(s.mod)||0)+1);
    if(passa(s,'area') && s.area) cont.area.set(s.area,(cont.area.get(s.area)||0)+1);
    if(passa(s,'sol') && s.sol) cont.sol.set(s.sol,(cont.sol.get(s.sol)||0)+1);
  });
  let lista = base.filter(s=>passa(s));
  const chave=s=>s.nomeV.replace(/^[^\p{L}]+/u,'');
  const porNome=(x,y)=>chave(x).localeCompare(chave(y),'pt');
  const lojaAntes=(x,y)=>(y.fonte==='loja')-(x.fonte==='loja');
  if(st.sort==='nome') lista.sort(porNome);
  else if(st.sort==='cod') lista.sort((x,y)=>(x.registro??1e9)-(y.registro??1e9)||porNome(x,y));
  else lista.sort(vazio?((x,y)=>lojaAntes(x,y)||porNome(x,y)):((x,y)=>pontos.get(y)-pontos.get(x)||porNome(x,y)));
  const termosMarca = [...new Set([...a.termos.concat(extras).flatMap(x=>x.vs), ...a.frases.flatMap(f=>tokens(f))])].filter(v=>v.length>=2 && !STOP.has(v));
  ultimo = {lista, termosMarca};
  render(lista, cont, notas, vazio, termosMarca);
  $('resultados').hidden = !st.aberto;
  renderSugestoes();
}

/* ---------- render ---------- */
function cardLoja(s,tm){
  const selo = s.compra ? '<span class="bi-badge bi-compra">Compra direta</span>' : '<span class="bi-badge bi-solic">Solicitação de serviço</span>';
  const onde = s.categorias.length ? `<div class="bi-lab"><span>${marcar(s.categorias.join(' · '),tm)}</span></div>` : '';
  const desc = s.descV ? `<p class="bi-desc">${marcar(s.descV,tm)}</p>` : '';
  const preco = s.compra && s.preco ? `<p class="bi-preco">${esc(s.preco)}</p>` : '';
  const acao = s.compra
    ? (s.carrinho ? `<a class="bi-btn bi-pri" href="${esc(s.carrinho)}">Adicionar ao carrinho</a>` : `<a class="bi-btn bi-pri" href="${esc(s.url)}">Ver opções</a>`)
    : `<a class="bi-btn bi-pri" href="${esc(s.url)}">Solicitar orçamento</a>`;
  return `<article class="bi-card bi-card-loja">
    <div class="bi-meta"><span class="bi-code">Loja IPT</span>${selo}</div>
    <h2>${marcar(s.nomeV,tm)}</h2>
    ${onde}
    ${desc}
    ${preco}
    <div class="bi-actions">
      <a class="bi-btn bi-sec" href="${esc(s.url)}">Ver detalhes</a>
      ${acao}
    </div>
  </article>`;
}
function card(s,tm){
  if(s.fonte==='loja') return cardLoja(s,tm);
  const desc = s.descV ? `<p class="bi-desc">${marcar(s.descV,tm)}</p>` : `<p class="bi-desc bi-none">Descrição não informada no catálogo.</p>`;
  const kws = s.kwV.length ? `<div class="bi-kw">${s.kwV.slice(0,4).map(k=>`<span>${marcar(k,tm)}</span>`).join('')}</div>` : '';
  const labs = s.labsV.map(l=>`<div class="bi-lab"><span class="bi-sigla">${esc(l.sigla)}</span><span>${marcar(l.nome,tm)}</span></div>`).join('');
  return `<article class="bi-card">
    <div class="bi-meta"><span class="bi-code">Nº ${s.registro}</span>
      ${s.cgcre?'<span class="bi-badge" title="Serviço com acreditação Cgcre/Inmetro">Acreditado Cgcre</span>':''}
      ${s.tipo_servico!=='Ensaios, análises e calibrações correntes'?`<span class="bi-badge bi-type">${esc(s.tipo_servico)}</span>`:''}
    </div>
    <h2>${marcar(s.nomeV,tm)}</h2>
    ${labs}
    ${desc}
    ${kws}
    <div class="bi-actions">
      <button class="bi-btn bi-sec" type="button" data-det="${s.registro}">Ver detalhes</button>
      <a class="bi-btn bi-pri" href="${esc(s.contato.url)}" target="_blank" rel="noopener">Solicitar orçamento</a>
    </div>
  </article>`;
}
function opcoes(el, itens, sel, cont, nome){
  el.innerHTML = itens.map(([v,rot,sub])=>{
    const n = cont.get(v)||0;
    return `<label class="bi-opt${n||sel.has(v)?'':' bi-zero'}"><input type="checkbox" data-f="${nome}" value="${esc(v)}" ${sel.has(v)?'checked':''}>
      <span class="bi-lbl">${esc(rot)}${sub?`<small>${esc(sub)}</small>`:''}</span><span class="bi-n">${n}</span></label>`;
  }).join('');
}
function render(lista, cont, notas, vazio, tm){
  const n = lista.length;
  const semFiltro = vazio && !st.labs.size && !st.tipos.size && !st.mods.size && !st.areas.size && !st.sols.size && !st.cgcre;
  $('count').innerHTML = semFiltro
    ? (P.length && SC.length ? `<strong>${n}</strong> itens: ${SC.length} serviços do catálogo técnico e ${P.length} da Loja IPT`
       : P.length ? `<strong>${n}</strong> itens da Loja IPT` : `<strong>${n}</strong> serviços no catálogo`)
    : `<strong>${n}</strong> ${n===1?'resultado':'resultados'}${st.q.trim()?` para “${esc(st.q.trim())}”`:''}`;
  $('notices').innerHTML = notas.map(t=>`<div class="bi-notice">${t}</div>`).join('');
  $('grid').innerHTML = lista.slice(0,st.shown).map(s=>card(s,tm)).join('');
  $('more').innerHTML = n>st.shown ? `<button class="bi-btn bi-sec" type="button" id="bi-maisbtn">Mostrar mais ${Math.min(24,n-st.shown)} de ${n-st.shown} restantes</button>` : '';
  if(!n){
    const temForm = !!formularioContato();
    const termo = st.q.trim();
    const msg = termo ? `Busquei no catálogo técnico por "${termo}" e não encontrei o que preciso. Descrição da necessidade: ` : 'Não encontrei no catálogo técnico o que preciso. Descrição da necessidade: ';
    const acao = temForm
      ? `<button class="bi-btn bi-pri" type="button" style="display:inline-flex;padding:0 18px" data-preencher-contato="${esc(msg)}" data-contato-rotulo="${esc(termo ? '“'+termo+'”' : 'catálogo técnico')}">Descrever minha necessidade ao IPT</button>`
      : `<a class="bi-btn bi-pri" style="display:inline-flex;padding:0 18px" href="https://ipt.br/contato" target="_blank" rel="noopener">Falar com o IPT</a>`;
    $('grid').innerHTML = `<div class="bi-empty" style="grid-column:1/-1"><h2>Nenhum resultado encontrado</h2>
      <p>Tente outra palavra, use o singular ou remova filtros. Alguns laboratórios atendem demandas que não estão neste catálogo.</p>
      <p>${acao}</p></div>`;
  }
  opcoes($('flab'), LABS.map(([sg,nm])=>[sg,sg,nm]), st.labs, cont.lab, 'lab');
  opcoes($('farea'), AREAS.map(a=>[a.id,a.nome]), st.areas, cont.area, 'area');
  opcoes($('fsol'), SOLUCOES.map(x=>[x.id,x.nome]), st.sols, cont.sol, 'sol');
  renderAtivos();
  if(P.length) opcoes($('fmod'), MODS, st.mods, cont.mod, 'mod');
  $('fcgcre').checked = st.cgcre; $('ncgcre').textContent = cont.cgcre;
  const nf = st.labs.size+st.tipos.size+st.mods.size+st.areas.size+st.sols.size+(st.cgcre?1:0);
  $('factive').textContent = nf ? nf+(nf===1?' ativo':' ativos') : '';
  $('freset').style.display = nf ? '' : 'none';
  $('clear').style.display = st.q ? 'block' : 'none';
  $('sort').value = st.sort;
}

function renderAtivos(){
  const tags = [
    ...[...st.areas].map(v=>['area',v,'Área: '+NOME_AREA[v]]),
    ...[...st.sols].map(v=>['sol',v,'Tipo: '+NOME_SOL[v]]),
    ...[...st.mods].map(v=>['mod',v,v==='compra'?'Compra direta':'Solicitação de serviço']),
    ...(st.cgcre?[['cgcre','1','Acreditado Cgcre']]:[]),
    ...[...st.labs].map(v=>['lab',v,'Laboratório: '+v]),
  ];
  $('ativos').innerHTML = tags.map(([f,v,rot])=>`<button type="button" class="bi-tag" data-remover="${f}" data-valor="${esc(v)}" aria-label="Remover filtro ${esc(rot)}">${esc(rot)} <span aria-hidden="true">✕</span></button>`).join('');
  $('ativos').hidden = !tags.length;
}

/* ---------- sugestões (modo vitrine) ---------- */
let sugAtiva = -1, sugItens = [];
const ICONE_CAL = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 13l3-3M10 2h4"/></svg>';
const ICONE_ENS = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6L4.6 18.6A1.6 1.6 0 0 0 6 21h12a1.6 1.6 0 0 0 1.4-2.4L14 9V3"/></svg>';
function fecharSugestoes(){ $('sugestoes').hidden = true; $('q').setAttribute('aria-expanded','false'); $('q').removeAttribute('aria-activedescendant'); sugAtiva = -1; }
function renderSugestoes(){
  const caixa = $('sugestoes');
  if(!VITRINE || st.aberto || !st.q.trim() || document.activeElement !== $('q')){ fecharSugestoes(); return; }
  const tm = ultimo.termosMarca, L = ultimo.lista;
  const compra = L.filter(s=>s.fonte==='loja' && s.compra).slice(0,3);
  const outros = L.filter(s=>!(s.fonte==='loja' && s.compra)).slice(0,4);
  sugItens = [...compra, ...outros];
  const linha = (s,i) => {
    const loja = s.fonte==='loja';
    const ic = loja ? (s.imagem ? `<img src="${esc(s.imagem)}" alt="">` : '') : (s.sol==='calibracoes' ? ICONE_CAL : ICONE_ENS);
    const sub = loja ? esc(s.categorias.join(' · ') || 'Loja IPT') : `${esc(s.labsV.map(l=>l.sigla).join(', '))} · ${esc(s.labsV[0] ? s.labsV[0].nome : '')}`;
    const lado = loja && s.compra ? `<span class="bi-sug-preco">${esc(s.preco)}</span>` : (s.cgcre ? `<span class="bi-sug-cgcre">Cgcre ${esc((s.certificados_cgcre[0]||{}).codigo||'')}</span>` : '');
    const acao = loja && s.compra
      ? (s.carrinho ? `<a class="bi-sug-acao bi-sug-pri" href="${esc(s.carrinho)}">Adicionar ao carrinho</a>` : `<a class="bi-sug-acao bi-sug-pri" href="${esc(s.url)}">Ver opções</a>`)
      : `<a class="bi-sug-acao" href="${esc(loja ? s.url : s.contato.url)}"${loja?'':' target="_blank" rel="noopener"'}>Solicitar orçamento</a>`;
    return `<div class="bi-sug${i===sugAtiva?' bi-sug-ativa':''}" role="option" id="bi-sug-${i}" data-sug="${i}" aria-selected="${i===sugAtiva}">
      <span class="bi-sug-ic${loja?' bi-sug-foto':''}">${ic}</span>
      <span class="bi-sug-txt"><b>${marcar(s.nomeV,tm)}</b><small>${sub}</small></span>
      ${lado}${acao}</div>`;
  };
  let h = '';
  if(compra.length) h += `<p class="bi-sug-grupo">Compra direta · preço fixo</p>` + compra.map((s,i)=>linha(s,i)).join('');
  if(outros.length) h += `<p class="bi-sug-grupo">Serviços técnicos · sob orçamento</p>` + outros.map((s,i)=>linha(s,compra.length+i)).join('');
  if(!sugItens.length){
    const msg = `Busquei no catálogo técnico por "${st.q.trim()}" e não encontrei o que preciso. Descrição da necessidade: `;
    h = `<p class="bi-sug-vazio">Nenhum resultado para “${esc(st.q.trim())}”.${formularioContato()?` <button type="button" class="bi-sug-link" data-preencher-contato="${esc(msg)}" data-contato-rotulo="${esc('“'+st.q.trim()+'”')}">Descrever minha necessidade ao IPT</button>`:''}</p>`;
  }
  h += `<div class="bi-sug-rodape"><button type="button" class="bi-sug-todos" data-ver-todos>Ver todos os resultados para “${esc(st.q.trim())}”</button><span>↑↓ navegar · Enter abrir · Esc fechar</span></div>`;
  caixa.innerHTML = h; caixa.hidden = false; $('q').setAttribute('aria-expanded','true');
  if(sugAtiva>=0) $('q').setAttribute('aria-activedescendant','bi-sug-'+sugAtiva); else $('q').removeAttribute('aria-activedescendant');
}
function abrirSugestao(i){
  const s = sugItens[i]; if(!s) return;
  if(s.fonte==='loja') { location.href = s.url; return; }
  fecharSugestoes(); detalhes(s.registro);
}
function confirmarBusca(){
  fecharSugestoes(); st.aberto = true; st.shown = 24;
  buscar(); gravarURL(); if(VITRINE) rolarPara($('resultados'));
}

/* ---------- integração com a página (blocos de área e categoria, formulário de contato) ---------- */
function formularioContato(){
  return document.querySelector('[data-busca-contato]') || document.querySelector('.wpforms-form') || null;
}
function topoFixo(){
  const v = parseFloat(getComputedStyle(RAIZ).getPropertyValue('--topo-fixo'));
  return isNaN(v) ? 12 : v;
}
function rolarPara(el){
  if(!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - topoFixo() - 8;
  window.scrollTo({top:Math.max(0,y), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
}
function aplicarFiltro({area, solucao, termo}){
  st.areas.clear(); st.sols.clear(); st.labs.clear(); st.tipos.clear(); st.mods.clear(); st.cgcre=false;
  if(area && NOME_AREA[area]) st.areas.add(area);
  if(solucao && NOME_SOL[solucao]) st.sols.add(solucao);
  st.q = termo || ''; $('q').value = st.q; st.shown = 24; st.aberto = true;
  buscar(); gravarURL(); rolarPara(VITRINE ? $('resultados') : RAIZ);
}
function preencherContato(texto, rotulo, prefixo){
  const f = formularioContato(); if(!f) return false;
  const faixa = document.querySelector('[data-sua-busca]');
  if(faixa){ const alvo = faixa.querySelector('[data-sua-busca-texto]'); if(alvo) alvo.textContent = rotulo || texto;
    const pre = faixa.querySelector('[data-sua-busca-prefixo]'); if(pre) pre.textContent = prefixo || 'Sua busca:'; faixa.hidden = false; faixa.dataset.textoInserido = texto; }
  const campo = f.querySelector('textarea') || f.querySelector('input[type="text"]');
  if(campo){
    campo.value = texto;
    campo.dispatchEvent(new Event('input',{bubbles:true})); campo.dispatchEvent(new Event('change',{bubbles:true}));
  }
  rolarPara(f);
  const vazio = [...f.querySelectorAll('input:not([type=hidden]):not([type=submit]),textarea')].find(x=>!x.value);
  setTimeout(()=>{ try{ (vazio||campo).focus({preventScroll:true}); }catch(_){ } }, 450);
  return true;
}
document.addEventListener('click', e=>{
  const alvo = e.target.closest('[data-busca-area],[data-busca-solucao],[data-busca-termo]');
  if(alvo){ e.preventDefault(); aplicarFiltro({area:alvo.dataset.buscaArea, solucao:alvo.dataset.buscaSolucao, termo:alvo.dataset.buscaTermo}); return; }
  const ct = e.target.closest('[data-preencher-contato]');
  if(ct && preencherContato(ct.dataset.preencherContato, ct.dataset.contatoRotulo, ct.dataset.contatoPrefixo)) { e.preventDefault(); return; }
  const rm = e.target.closest('[data-sua-busca-remover]');
  if(rm){ e.preventDefault(); const faixa = rm.closest('[data-sua-busca]'); const f = formularioContato();
    const campo = f && (f.querySelector('textarea') || f.querySelector('input[type="text"]'));
    if(campo && faixa && campo.value.indexOf(faixa.dataset.textoInserido || '\u0000') === 0) campo.value = campo.value.slice(faixa.dataset.textoInserido.length);
    if(faixa) faixa.hidden = true; return; }
  const fo = e.target.closest('[data-busca-foco]');
  if(fo){ e.preventDefault(); rolarPara(RAIZ); setTimeout(()=>{ try{ $('q').focus({preventScroll:true}); }catch(_){ } }, 450); return; }
});
document.addEventListener('submit', e=>{
  const f = e.target.closest('form[data-busca-ipt]'); if(!f) return;
  e.preventDefault();
  const campo = f.querySelector('[name="q"]') || f.querySelector('input[type="search"],input[type="text"]');
  aplicarFiltro({termo: campo ? campo.value.trim() : ''});
});

/* ---------- detalhes ---------- */
function normas(t){
  const re = /\b(?:ABNT\s+)?(?:NBR(?:\s+(?:ISO|IEC|NM))*(?:\/IEC)?|ISO(?:\/IEC)?|IEC|ASTM|DIN(?:\s+EN)?(?:\s+ISO)?|BS(?:\s+EN)?|EN(?:\s+ISO)?|NM(?:\s+ISO)?|TAPPI|CISPR|ANSI|JIS|AWPA|IESNA\s+LM|UL)\s*[A-Z]?\s?\d[\dA-Z.\-\/]*(?:\s*-\s*\d+)?/g;
  return [...new Set((t||'').match(re)||[])].map(x=>x.replace(/\s+/g,' ').trim());
}
function detalhes(reg){
  const s = S.find(x=>String(x.registro)===String(reg)); if(!s) return;
  const tm = ultimo.termosMarca, nm = normas(s.descricao);
  const certs = s.certificados_cgcre.map(c=>`<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.codigo)} (PDF)</a>`).join(' · ');
  $('dlg').innerHTML = `
    <div class="bi-dlg-head"><div>
      <div class="bi-meta"><span class="bi-code">Nº ${s.registro}</span>${s.cgcre?'<span class="bi-badge">Acreditado Cgcre</span>':''}<span class="bi-badge bi-type">${esc(s.tipo_servico)}</span></div>
      <h2 id="bi-dlg-title">${marcar(s.nomeV,tm)}</h2></div>
      <button class="bi-x" type="button" data-close aria-label="Fechar">✕</button></div>
    <div class="bi-dlg-body"><dl>
      <dt>Descrição</dt><dd>${s.descV?marcar(s.descV,tm):'<span class="bi-hint">Não informada no catálogo.</span>'}</dd>
      ${nm.length?`<dt>Normas citadas</dt><dd><div class="bi-norms">${nm.map(x=>`<span>${esc(x)}</span>`).join('')}</div><div class="bi-hint">Identificadas automaticamente no texto da descrição.</div></dd>`:''}
      <dt>Laboratório${s.labsV.length>1?'s':''}</dt><dd>${s.labsV.map(l=>`<strong>${esc(l.sigla)}</strong> · ${esc(l.nome)}`).join('<br>')}</dd>
      ${s.kwV.length?`<dt>Palavras-chave</dt><dd>${s.kwV.map(k=>marcar(k,tm)).join(' · ')}</dd>`:''}
      ${certs?`<dt>Certificado Cgcre</dt><dd>${certs}</dd>`:''}
      <dt>Código no Scriba</dt><dd>${s.registro}</dd>
    </dl></div>
    <div class="bi-dlg-foot">
      <a class="bi-btn bi-pri" href="${esc(s.contato.url)}" target="_blank" rel="noopener">Solicitar orçamento</a>
      <button class="bi-btn bi-sec" type="button" data-copy="${s.registro}">Copiar link deste serviço</button>
    </div>`;
  if(!$('dlg').open) $('dlg').showModal();
  gravarURL(s.registro);
}

/* ---------- eventos ---------- */
let tmr;
$('q').addEventListener('input', e=>{ st.q=e.target.value; st.shown=24; sugAtiva=-1; clearTimeout(tmr); tmr=setTimeout(()=>{buscar(); if(st.aberto) gravarURL();},140); });
$('form').addEventListener('submit', e=>{ e.preventDefault();
  if(VITRINE && !$('sugestoes').hidden && sugAtiva>=0){ abrirSugestao(sugAtiva); return; }
  st.q = $('q').value; confirmarBusca(); });
$('q').addEventListener('keydown', e=>{
  if($('sugestoes').hidden) return;
  if(e.key==='ArrowDown' || e.key==='ArrowUp'){ e.preventDefault(); const n = sugItens.length; if(!n) return;
    sugAtiva = e.key==='ArrowDown' ? (sugAtiva+1)%n : (sugAtiva<=0 ? n-1 : sugAtiva-1); renderSugestoes();
    const el = document.getElementById('bi-sug-'+sugAtiva); if(el) el.scrollIntoView({block:'nearest'}); }
  else if(e.key==='Escape'){ e.preventDefault(); fecharSugestoes(); }
});
$('q').addEventListener('focus', ()=>{ if(VITRINE && !st.aberto && st.q.trim()) renderSugestoes(); });
document.addEventListener('click', e=>{ if(!$('sugestoes').hidden && !e.target.closest('.bi-caixa')) fecharSugestoes(); });
$('clear').addEventListener('click', ()=>{ st.q=''; $('q').value=''; st.shown=24;
  if(VITRINE && !st.areas.size && !st.sols.size && !st.labs.size && !st.mods.size && !st.cgcre) st.aberto=false;
  buscar(); gravarURL(); $('q').focus(); });
$('sort').addEventListener('change', e=>{ st.sort=e.target.value; buscar(); gravarURL(); });
$('fcgcre').addEventListener('change', e=>{ st.cgcre=e.target.checked; st.shown=24; buscar(); gravarURL(); });
$('freset').addEventListener('click', ()=>{ st.labs.clear(); st.tipos.clear(); st.mods.clear(); st.areas.clear(); st.sols.clear(); st.cgcre=false; st.shown=24; buscar(); gravarURL(); });
RAIZ.addEventListener('change', e=>{
  const f=e.target.dataset.f; if(!f) return;
  const set = {lab:st.labs, mod:st.mods, area:st.areas, sol:st.sols}[f] || st.tipos;
  e.target.checked?set.add(e.target.value):set.delete(e.target.value);
  st.shown=24; buscar(); gravarURL();
});
RAIZ.addEventListener('click', e=>{
  const rm=e.target.closest('[data-remover]');
  if(rm){ const f=rm.dataset.remover, v=rm.dataset.valor;
    if(f==='cgcre') st.cgcre=false; else ({area:st.areas, sol:st.sols, mod:st.mods, lab:st.labs}[f]).delete(v);
    st.shown=24; buscar(); gravarURL(); return; }
  const d=e.target.closest('[data-det]'); if(d){detalhes(d.dataset.det);return}
  if(e.target.closest('[data-close]')){$('dlg').close();return}
  const c=e.target.closest('[data-copy]');
  if(c){
    let url=location.href; try{const u=new URL(location.href);CHAVES_URL.forEach(k=>u.searchParams.delete(k));u.searchParams.set('servico',c.dataset.copy);url=u.href}catch(_){}
    const ok=()=>{c.textContent='Link copiado'};
    try{navigator.clipboard.writeText(url).then(ok,()=>{c.textContent=url})}catch(_){c.textContent=url}
    return;
  }
  if(e.target.id==='bi-maisbtn'){ st.shown+=24; buscar(); }
  if(e.target.closest('[data-ver-todos]')){ confirmarBusca(); return; }
  const sg=e.target.closest('[data-sug]'); if(sg && !e.target.closest('a')){ abrirSugestao(+sg.dataset.sug); return; }
  const ch=e.target.closest('[data-ex]'); if(ch){ st.q=ch.dataset.ex; $('q').value=st.q; confirmarBusca(); }
});
$('dlg').addEventListener('click', e=>{ if(e.target===$('dlg')) $('dlg').close(); });
$('dlg').addEventListener('close', ()=>gravarURL());
if(RAIZ.clientWidth < 860) $('filters').open=false;

/* ---------- início ---------- */
['dureza','NBR 7190','etanol','torquímetro','reação ao fogo'].forEach(x=>{
  const b=document.createElement('button'); b.type='button'; b.className='bi-chip'; b.dataset.ex=x; b.textContent=x; $('examples').appendChild(b);
});
const m = DADOS.meta || {};
if(!P.length) { const g=$('gmod'); if(g) g.hidden=true; }
if(!$('sub').dataset.fixo) $('sub').innerHTML = VITRINE
  ? `${m.servicos_unicos||0} serviços de ${m.laboratorios||0} laboratórios${P.length?` e ${P.length} produtos da loja`:''}, pesquisados em uma única caixa.<br>Digite um ensaio, material, norma ou laboratório.`
  : (SC.length ? `Pesquise entre ${m.servicos_unicos} serviços de ${m.laboratorios} laboratórios do IPT${P.length?` e ${P.length} itens da Loja IPT`:''}.` : `Pesquise entre ${P.length} itens da Loja IPT.`);
const data = m.coletado_em ? m.coletado_em.split('-').reverse().join('/') : '';
$('foot').textContent = `Fontes: catálogo técnico do IPT (Scriba)${data?`, atualizado em ${data}`:''}${P.length?', e produtos da Loja IPT':''}. Os textos do catálogo técnico são exibidos em caixa normal para facilitar a leitura, sem alteração de conteúdo.`;
const servicoURL = lerURL();
$('q').value = st.q;
buscar();
if(servicoURL) detalhes(servicoURL);
window.BUSCA_IPT = {servicos:SC, produtos:P, todos:S, buscar, analisar, filtrar:aplicarFiltro, areas:AREAS, solucoes:SOLUCOES};
RAIZ.dataset.buscaPronta = '1';
document.documentElement.dataset.buscaPronta = '1';
}

function falha(err){
  console.error('Busca IPT: falha ao carregar dados', err);
  if(PRODUTOS.length && !RAIZ.dataset.buscaPronta){
    try{ iniciar({meta:{servicos_unicos:0,laboratorios:0,coletado_em:''},servicos:[],use:[]}, true); return; }catch(e){ console.error(e); }
  }
  const g = document.getElementById('bi-grid');
  if(g) g.innerHTML = '<div class="bi-empty" style="grid-column:1/-1"><h2>Não foi possível carregar o catálogo</h2><p>Tente novamente em alguns instantes ou <a href="https://ipt.br/contato" target="_blank" rel="noopener">fale com o IPT</a>.</p></div>';
}
const embutidos = window.BUSCA_IPT_DADOS;
const fonte = RAIZ.getAttribute('data-dados');
(embutidos ? Promise.resolve(embutidos)
  : fetch(fonte, {cache:'no-cache', credentials:'same-origin'}).then(r=>{ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }))
  .then(iniciar).catch(falha);
})();
