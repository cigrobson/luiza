#!/usr/bin/env node
/*
  Teste de aceitação da busca de serviços da Loja IPT.

  Uso:
    node scripts/testar_busca.js                  # testa ./publicar (sobe servidor local)
    node scripts/testar_busca.js prototipo        # testa outra pasta
    node scripts/testar_busca.js https://loja.ipt.br/caminho/da/busca/

  Requer Playwright:  npm i -D playwright && npx playwright install chromium
  Sai com código 1 se qualquer verificação falhar.
  Com a página do WordPress, aponte para a URL da página que contém o shortcode.

  Os números esperados valem para a coleta de 14/11/2026 (568 serviços).
  Depois de atualizar os dados, reveja só as verificações marcadas "dados:".
*/
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');

const alvo = process.argv[2] || path.join(__dirname, '..', 'publicar');
const falhas = []; let ok = 0;
const verifica = (cond, msg) => { if (cond) { ok++; console.log('  ok  ', msg); } else { falhas.push(msg); console.log('  FALHA', msg); } };

function servir(dir) {
  const tipos = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
  return new Promise(res => {
    const srv = http.createServer((req, resp) => {
      const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
      const f = path.join(dir, rel);
      if (!f.startsWith(path.resolve(dir)) || !fs.existsSync(f)) { resp.writeHead(404); return resp.end(); }
      resp.writeHead(200, { 'Content-Type': tipos[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(resp);
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}

(async () => {
  let srv, base = alvo;
  if (!/^https?:\/\//.test(alvo)) { srv = await servir(path.resolve(alvo)); base = `http://127.0.0.1:${srv.address().port}/`; }
  console.log('Testando', base);
  const nav = await chromium.launch();
  const erros = [];
  const abrir = async (qs = '', opts = {}) => {
    const p = await nav.newPage({ viewport: { width: 1280, height: 900 }, ...opts });
    p.on('pageerror', e => erros.push(e.message));
    p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
    const u = new URL(base);  // preserva parâmetros já existentes (ex.: ?page_id=123 no WordPress)
    new URLSearchParams(qs.replace(/^\?/, '')).forEach((v, k) => u.searchParams.set(k, v));
    await p.goto(u.href);
    await p.waitForFunction(() => document.documentElement.dataset.buscaPronta === '1', null, { timeout: 15000 });
    return p;
  };
  const buscar = async (p, q) => { await p.fill('#bi-q', q); await p.waitForTimeout(400); };
  const estado = p => p.evaluate(() => ({
    n: [...document.querySelectorAll('.bi-card')].length,
    total: parseInt((document.getElementById('bi-count').innerText.match(/\d+/) || ['0'])[0], 10),
    titulos: [...document.querySelectorAll('.bi-card h2')].map(h => h.innerText),
    avisos: [...document.querySelectorAll('.bi-notice')].map(n => n.innerText).join(' | '),
    vazio: !!document.querySelector('.bi-empty'),
  }));

  const p = await abrir();
  let e = await estado(p);
  console.log('\nCarga inicial');
  const nProd = await p.evaluate(() => window.BUSCA_IPT.produtos.length);
  const nCompra = await p.evaluate(() => window.BUSCA_IPT.produtos.filter(x => x.compra).length);
  console.log(`  (produtos da loja nesta página: ${nProd}, de compra direta: ${nCompra})`);
  verifica(e.total === 568 + nProd, `dados: 568 serviços do catálogo técnico + ${nProd} produtos (veio ${e.total})`);
  verifica(e.n === 24, `primeira página mostra 24 cards (veio ${e.n})`);
  verifica(!/^[^A-Za-zÀ-ÿ]/.test(e.titulos[0]), `ordem inicial alfabética sem pontuação no início ("${e.titulos[0]}")`);

  console.log('\nBusca');
  await buscar(p, 'dureza'); e = await estado(p);
  verifica(e.titulos[0] === 'Dureza Janka ABPM', `"dureza": primeiro resultado "Dureza Janka ABPM" (veio "${e.titulos[0]}")`);
  await buscar(p, 'durezas'); const plural = (await estado(p)).total;
  verifica(plural === e.total, `plural "durezas" = singular (${plural} x ${e.total})`);
  await buscar(p, 'multimetro'); const semAcento = (await estado(p)).total;
  await buscar(p, 'multímetro'); const comAcento = (await estado(p)).total;
  verifica(semAcento === comAcento && comAcento > 0, `acento indiferente: multimetro=${semAcento}, multímetro=${comAcento}`);
  await buscar(p, 'multímtero'); e = await estado(p);
  verifica(e.total === comAcento && /multimetro/i.test(e.avisos), `erro de digitação corrigido com aviso ("${e.avisos}")`);
  await buscar(p, 'AEAC'); e = await estado(p);
  verifica(e.total > 0 && /Etanol/.test(e.avisos), `sinônimo do vocabulário: AEAC → Etanol (${e.total}, "${e.avisos}")`);
  await buscar(p, 'NBR 7190'); e = await estado(p);
  verifica(e.total >= 10, `dados: norma "NBR 7190" encontra ≥10 serviços (veio ${e.total})`);
  await buscar(p, '7422'); e = await estado(p);
  verifica(e.total === 1 && e.titulos[0] === 'Dureza Janka ABPM', `código "7422" encontra o serviço exato`);
  await buscar(p, '"dureza janka"'); e = await estado(p);
  verifica(e.total === 1, `frase entre aspas restringe (veio ${e.total})`);
  await buscar(p, 'resistencia fogo'); const eTodos = (await estado(p)).total;
  await buscar(p, 'resistencia'); const so1 = (await estado(p)).total;
  verifica(eTodos > 0 && eTodos < so1, `várias palavras = E (resistencia fogo=${eTodos} < resistencia=${so1})`);
  await buscar(p, 'xyzabcqwe'); e = await estado(p);
  verifica(e.total === 0 && e.vazio, `sem resultado mostra estado vazio com contato`);
  await buscar(p, 'dureza');
  const marcas = await p.$$eval('.bi-card mark', m => m.length);
  verifica(marcas > 0, `termo destacado nos cards (${marcas} marcas)`);

  console.log('\nCards e ações');
  const link = await p.getAttribute('.bi-card a.bi-btn.bi-pri', 'href');
  verifica(/faleconosco\/\?Manifestacao=\d&Ensaio=\d+&CRD=\w+/.test(link || ''), `"Solicitar serviço" leva registro e unidade (${link})`);
  verifica(await p.getAttribute('.bi-card a.bi-btn.bi-pri', 'target') === '_blank', `"Solicitar serviço" abre em nova aba`);
  await p.click('.bi-card [data-det]'); await p.waitForTimeout(200);
  verifica(await p.evaluate(() => document.getElementById('bi-dlg').open), `"Ver detalhes" abre a janela`);
  verifica(/servico=\d+/.test(p.url()), `URL registra o serviço aberto (${p.url().split('?')[1]})`);
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  verifica(!(await p.evaluate(() => document.getElementById('bi-dlg').open)), `Esc fecha a janela`);

  console.log('\nFiltros');
  await buscar(p, '');
  await p.evaluate(() => { document.getElementById('bi-filters').open = true; });  // em contêiner estreito os filtros começam recolhidos
  await p.check('#bi-fcgcre'); await p.waitForTimeout(200); e = await estado(p);
  verifica(e.total === 101, `dados: filtro Cgcre = 101 (veio ${e.total})`);
  verifica(/cgcre=1/.test(p.url()), `filtro gravado na URL`);
  await p.click('#bi-freset'); await p.waitForTimeout(200);
  await p.check('input[data-f="lab"][value="LV"]'); await p.waitForTimeout(200); e = await estado(p);
  verifica(e.total === 34, `dados: filtro laboratório LV = 34 (veio ${e.total})`);

  console.log('\nProdutos da loja');
  if (nProd === 0) {
    verifica(await p.evaluate(() => document.getElementById('bi-gmod').hidden), `sem produtos, o filtro "Modalidade" fica oculto`);
  } else {
    await p.click('#bi-freset').catch(() => {});
    await buscar(p, 'solo'); e = await estado(p);
    const lojaSolo = await p.$$eval('.bi-card-loja', c => c.length);
    verifica(lojaSolo >= 5 && (await p.$eval('.bi-card', c => c.classList.contains('bi-card-loja'))), `"solo" traz os ensaios de solo da loja primeiro (${lojaSolo} itens da loja)`);
    await buscar(p, 'inclinômetro'); e = await estado(p);
    const cards = await p.$$eval('.bi-card-loja', cs => cs.map(c => ({ selo: c.querySelector('.bi-badge').innerText, preco: (c.querySelector('.bi-preco') || {}).innerText || '', acao: c.querySelector('.bi-btn.bi-pri').innerText, href: c.querySelector('.bi-btn.bi-pri').getAttribute('href') })));
    verifica(cards.length >= 3 && cards.every(c => c.selo === 'Compra direta' && /R\$/.test(c.preco) && c.acao === 'Adicionar ao carrinho' && /add-to-cart=\d+/.test(c.href)),
      `compra direta: selo, preço e "Adicionar ao carrinho" (${cards.length} itens)`);
    await buscar(p, 'assinatura normas');
    const saa = await p.$eval('.bi-card-loja', c => ({ acao: c.querySelector('.bi-btn.bi-pri').innerText, href: c.querySelector('.bi-btn.bi-pri').getAttribute('href'), preco: c.querySelector('.bi-preco').innerText }));
    verifica(saa.acao === 'Ver opções' && /\/produto\//.test(saa.href) && /–/.test(saa.preco), `produto com variações: faixa de preço e "Ver opções" (${saa.preco})`);
    await buscar(p, 'árvore');
    const arv = await p.$eval('.bi-card-loja', c => ({ selo: c.querySelector('.bi-badge').innerText, acao: c.querySelector('.bi-btn.bi-pri').innerText, preco: !!c.querySelector('.bi-preco') }));
    verifica(arv.selo === 'Solicitação de serviço' && arv.acao === 'Solicitar orçamento' && !arv.preco, `sem preço: "Solicitação de serviço" e "Solicitar orçamento"`);
    await buscar(p, '');
    await p.evaluate(() => { document.getElementById('bi-filters').open = true; });
    await p.check('input[data-f="mod"][value="compra"]'); await p.waitForTimeout(200); e = await estado(p);
    verifica(e.total === nCompra && /mod=compra/.test(p.url()), `filtro "Compra direta" = ${nCompra} itens e gravado na URL (veio ${e.total})`);
    await p.click('#bi-freset'); await p.waitForTimeout(150);
  }

  console.log('\nÁreas técnicas e tipos de solução');
  const conta = await p.evaluate(() => { const T = window.BUSCA_IPT.todos, c = (k, v) => T.filter(x => x[k] === v).length;
    return { metro: c('area', 'metrologia-calibracao'), fogo: c('area', 'seguranca-fogo'), calib: c('sol', 'calibracoes'),
      calibServ: window.BUSCA_IPT.servicos.filter(x => x.sol === 'calibracoes').length,
      semArea: window.BUSCA_IPT.servicos.filter(x => !x.area).length }; });
  verifica(conta.semArea === 0, `todos os serviços do catálogo têm área técnica (sem área: ${conta.semArea})`);
  verifica(conta.calibServ === 111, `dados: 111 serviços classificados como Calibrações (veio ${conta.calibServ})`);
  const pa = await abrir('?area=metrologia-calibracao');
  e = await estado(pa);
  verifica(e.total === conta.metro, `?area=metrologia-calibracao filtra a área (${e.total} = ${conta.metro})`);
  verifica(await pa.$eval('#bi-ativos', el => !el.hidden && /Metrologia e Calibração/.test(el.innerText)), `chip "Área: Metrologia e Calibração" visível`);
  await pa.click('#bi-ativos [data-remover="area"]'); await pa.waitForTimeout(200);
  verifica((await estado(pa)).total === 568 + nProd && !/area=/.test(pa.url()), `remover o chip volta ao catálogo inteiro e limpa a URL`);
  const ps = await abrir('?solucao=calibracoes');
  verifica((await estado(ps)).total === conta.calib, `?solucao=calibracoes filtra o tipo (${conta.calib})`);
  // blocos da página fora da busca (como os cards da loja-15)
  await ps.evaluate(() => {
    const d = document.createElement('div'); d.id = 'teste-integracao';
    d.innerHTML = '<a href="?area=seguranca-fogo#catalogo" id="t-area" data-busca-area="seguranca-fogo">Segurança ao Fogo</a>'
      + '<form id="t-form" data-busca-ipt action="#catalogo"><input name="q" value="dureza"><button>Buscar</button></form>'
      + '<a href="#contato" id="t-cert" data-preencher-contato="Assunto: Certificação de produto. ">Certificação</a>'
      + '<form class="wpforms-form" id="t-wpf"><input type="text" name="nome"><textarea name="msg"></textarea></form>';
    document.body.insertBefore(d, document.body.firstChild);
    window.scrollTo(0, 0);
  });
  await ps.click('#t-area'); await ps.waitForTimeout(900);
  e = await estado(ps);
  const topo = await ps.evaluate(() => document.getElementById('busca-ipt').getBoundingClientRect().top);
  verifica(e.total === conta.fogo && /area=seguranca-fogo/.test(ps.url()) && topo < 300, `clique em bloco de área filtra sem recarregar e rola até a busca (${e.total}, topo ${Math.round(topo)} px)`);
  await ps.evaluate(() => window.scrollTo(0, 0));
  await ps.click('#t-form button'); await ps.waitForTimeout(700);
  e = await estado(ps);
  verifica(e.titulos[0] === 'Dureza Janka ABPM' && (await ps.inputValue('#bi-q')) === 'dureza', `campo de busca da página pesquisa na busca ("dureza")`);
  await ps.click('#t-cert'); await ps.waitForTimeout(600);
  verifica((await ps.inputValue('#t-wpf textarea')) === 'Assunto: Certificação de produto. ', `"Certificação de Produto" preenche a mensagem do formulário`);
  await buscar(ps, 'xyzabcqwe');
  const btn = await ps.$('#busca-ipt [data-preencher-contato]');
  verifica(!!btn, `busca sem resultado oferece "Descrever minha necessidade ao IPT"`);
  if (btn) { await btn.click(); await ps.waitForTimeout(400);
    verifica(/xyzabcqwe/.test(await ps.inputValue('#t-wpf textarea')), `o termo buscado segue para a mensagem do formulário`); }

  console.log('\nLink direto');
  const p2 = await abrir('?q=vazao&lab=LV&servico=870');
  verifica(await p2.inputValue('#bi-q') === 'vazao', `busca restaurada da URL`);
  verifica(await p2.evaluate(() => document.getElementById('bi-dlg').open), `serviço da URL aberto`);

  console.log('\nCelular e tema escuro');
  const m = await abrir('?q=dureza', { viewport: { width: 360, height: 780 } });
  verifica(!(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `360 px sem rolagem horizontal`);
  const d = await abrir('', { colorScheme: 'dark' });
  const tema = await d.evaluate(() => ({ forcado: document.getElementById('busca-ipt').dataset.theme || '', fundo: getComputedStyle(document.getElementById('busca-ipt')).backgroundColor }));
  if (tema.forcado === 'light') verifica(tema.fundo === 'rgb(244, 246, 250)', `tema claro fixo respeitado com sistema escuro (${tema.fundo})`);
  else verifica(tema.fundo !== 'rgb(244, 246, 250)', `tema escuro automático aplicado (${tema.fundo})`);

  console.log('\nLargura do contêiner');
  const colunas = async pg => pg.evaluate(() => ({ larg: document.getElementById('busca-ipt').clientWidth,
    cols: getComputedStyle(document.querySelector('#busca-ipt .bi-layout')).gridTemplateColumns.split(' ').length }));
  const c1 = await colunas(p);
  verifica(c1.larg < 860 ? c1.cols === 1 : c1.cols === 2, `layout acompanha a largura do contêiner (${c1.larg}px → ${c1.cols} coluna(s))`);
  const estreito = await abrir('', { viewport: { width: 1280, height: 900 } });
  await estreito.evaluate(() => { document.getElementById('busca-ipt').style.maxWidth = '720px'; });
  await estreito.waitForTimeout(150);
  const c2 = await colunas(estreito);
  verifica(c2.cols === 1, `contêiner de 720 px em tela larga empilha filtros e resultados (${c2.cols} coluna)`);

  console.log('\nIsolamento de estilos');
  const iso = await p.evaluate(() => {
    const r = document.getElementById('busca-ipt');
    const st = (sel, prop) => getComputedStyle(r.querySelector(sel))[prop];
    return { btnTransform: st('.bi-btn', 'textTransform'), cardBorder: st('.bi-card', 'borderTopWidth'), countDisplay: st('#bi-count', 'display'), h2Size: st('.bi-card h2', 'fontSize') };
  });
  verifica(iso.btnTransform === 'none' && iso.cardBorder === '1px' && iso.countDisplay !== 'none' && iso.h2Size === '16.5px',
    `estilos da busca preservados (${JSON.stringify(iso)})`);

  console.log('\nErros de JavaScript');
  verifica(erros.length === 0, `nenhum erro no console${erros.length ? ': ' + erros.join(' / ') : ''}`);

  await nav.close(); if (srv) srv.close();
  console.log(`\n${ok} ok, ${falhas.length} falha(s)`);
  process.exit(falhas.length ? 1 : 0);
})().catch(err => { console.error(err); process.exit(1); });
