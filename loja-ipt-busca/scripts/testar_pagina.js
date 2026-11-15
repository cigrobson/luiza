#!/usr/bin/env node
/*
  Teste de aceitação da página da Loja IPT montada com [loja_ipt_pagina] (ou com as seções separadas).

  Uso:
    node scripts/testar_pagina.js "http://127.0.0.1:8765/loja-15/?limpo=1&sc=[loja_ipt_pagina form=\"232\"]"   (WordPress simulado)
    node scripts/testar_pagina.js https://loja.ipt.br/loja-15/                                                   (página publicada)

  Requer Playwright. Sai com código 1 se alguma verificação falhar.
*/
const { chromium } = require('playwright');
const alvo = process.argv[2];
if (!alvo) { console.error('Informe a URL da página.'); process.exit(2); }
const falhas = []; let ok = 0;
const verifica = (c, m) => { if (c) { ok++; console.log('  ok  ', m); } else { falhas.push(m); console.log('  FALHA', m); } };

(async () => {
  const nav = await chromium.launch();
  const erros = [];
  const abrir = async (extra = '', vp = { width: 1280, height: 900 }) => {
    const p = await nav.newPage({ viewport: vp });
    p.on('pageerror', e => erros.push(e.message));
    const u = new URL(alvo);
    if (extra) { const [qs, hash] = extra.split('#'); new URLSearchParams(qs.replace(/^\?/, '')).forEach((v, k) => u.searchParams.set(k, v)); if (hash) u.hash = hash; }
    await p.goto(u.href, { waitUntil: 'load' });
    await p.waitForFunction(() => document.documentElement.dataset.buscaPronta === '1', null, { timeout: 20000 });
    await p.waitForTimeout(300);
    return p;
  };
  const visivel = (p, sel) => p.$eval(sel, el => !el.hidden && el.offsetParent !== null).catch(() => false);
  const contagem = p => p.$eval('#bi-count', el => parseInt((el.innerText.match(/\d+/) || ['0'])[0], 10));

  const p = await abrir();
  console.log('\nEstrutura');
  const est = await p.evaluate(() => ({
    secoes: ['lip-topo', 'lip-categorias', 'lip-destaques', 'lip-contato', 'lip-inst'].filter(c => document.querySelector('.' + c)).length,
    h1: (document.querySelector('.lip-h1') || {}).innerText || '',
    areas: [...document.querySelectorAll('.lip-area[data-busca-area]')].map(a => a.dataset.buscaArea),
    areasValidas: [...document.querySelectorAll('.lip-area[data-busca-area]')].every(a => window.BUSCA_IPT.areas.some(x => x.id === a.dataset.buscaArea)),
    filtros: [...document.querySelectorAll('.lip-cat[data-busca-solucao]')].every(a => window.BUSCA_IPT.solucoes.some(x => x.id === a.dataset.buscaSolucao)),
    nFiltros: document.querySelectorAll('.lip-cat[data-busca-solucao]').length,
    cert: !!document.querySelector('.lip-cat[data-preencher-contato]'),
    ensino: (() => { const a = [...document.querySelectorAll('.lip-cat')].find(x => /Ensino Tecnológico/.test(x.innerText)); return a ? [a.getAttribute('href'), a.getAttribute('target')] : null; })(),
    vitrine: document.getElementById('busca-ipt').dataset.layout,
    form: !!document.querySelector('[data-busca-contato] textarea'),
  }));
  verifica(est.secoes === 5, `cinco seções da página presentes (${est.secoes})`);
  verifica(/Encontre a solução técnica/.test(est.h1), `título do topo`);
  verifica(est.areas.length === 8 && est.areasValidas, `8 áreas técnicas com ids válidos`);
  verifica(est.nFiltros === 6 && est.filtros, `6 categorias filtram a busca com ids válidos`);
  verifica(est.cert, `Certificação de Produto leva ao formulário`);
  verifica(est.ensino && est.ensino[0] === 'https://sapiens.ipt.br/index_new.aspx' && est.ensino[1] === '_blank', `Ensino Tecnológico abre o Sapiens em nova aba`);
  verifica(est.vitrine === 'vitrine' && est.form, `busca em modo vitrine e formulário de contato presente`);
  verifica(!(await visivel(p, '#bi-resultados')), `resultados ocultos ao abrir a página`);

  console.log('\nTopo e sugestões');
  await p.click('.lip-cta'); await p.waitForTimeout(900);
  verifica(await p.evaluate(() => document.activeElement && document.activeElement.id === 'bi-q'), `"Buscar ensaios e calibrações" leva o foco à caixa de busca`);
  await p.keyboard.type('inclinôm', { delay: 25 }); await p.waitForTimeout(600);
  const sug = await p.evaluate(() => { const c = document.getElementById('bi-sugestoes'); return { v: !c.hidden, g: [...c.querySelectorAll('.bi-sug-grupo')].map(x => x.innerText.toLowerCase()), n: c.querySelectorAll('.bi-sug').length }; });
  verifica(sug.v && sug.n >= 3 && sug.g.some(x => /compra direta/.test(x)), `sugestões agrupadas aparecem ao digitar (${sug.n} itens)`);
  await p.keyboard.press('ArrowDown'); await p.waitForTimeout(150);
  verifica(await p.$eval('#bi-sug-0', el => el.classList.contains('bi-sug-ativa')), `seta para baixo destaca a primeira sugestão`);
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  verifica(await p.$eval('#bi-sugestoes', el => el.hidden), `Esc fecha as sugestões`);
  await p.keyboard.press('Enter'); await p.waitForTimeout(800);
  verifica(await visivel(p, '#bi-resultados') && (await contagem(p)) === 4 && /q=inclin/.test(decodeURIComponent(p.url())), `Enter abre o catálogo completo com 4 resultados`);

  console.log('\nÁreas, categorias e destaques');
  const esperado = await p.evaluate(() => { const T = window.BUSCA_IPT.todos; return { metro: T.filter(x => x.area === 'metrologia-calibracao').length, calib: T.filter(x => x.sol === 'calibracoes').length }; });
  await p.evaluate(() => scrollTo(0, 0));
  await p.click('.lip-area[data-busca-area="metrologia-calibracao"]'); await p.waitForTimeout(900);
  verifica((await contagem(p)) === esperado.metro && (await p.$eval('#bi-q', el => el.value)) === '', `área "Metrologia e Calibração" filtra ${esperado.metro} itens e limpa o termo`);
  await p.click('.lip-cat[data-busca-solucao="calibracoes"]'); await p.waitForTimeout(900);
  verifica((await contagem(p)) === esperado.calib && /solucao=calibracoes/.test(p.url()), `categoria "Calibrações" filtra ${esperado.calib} itens`);
  const tot = await p.$$eval('.lip-prod', l => l.length);
  await p.click('.lip-aba-compra'); await p.waitForTimeout(200);
  const soCompra = await p.$$eval('.lip-prod', l => l.filter(e => e.offsetParent !== null).every(e => e.classList.contains('is-compra')));
  await p.click('.lip-aba-solic'); await p.waitForTimeout(200);
  const soSolic = await p.$$eval('.lip-prod', l => l.filter(e => e.offsetParent !== null).every(e => e.classList.contains('is-solic')));
  await p.click('.lip-aba-todos'); await p.waitForTimeout(200);
  const todosVis = await p.$$eval('.lip-prod', l => l.filter(e => e.offsetParent !== null).length);
  verifica(tot > 0 && soCompra && soSolic && todosVis === tot, `abas dos destaques filtram compra direta e solicitação (${tot} produtos)`);

  console.log('\nFormulário de contato');
  await p.click('.lip-cat[data-preencher-contato]'); await p.waitForTimeout(800);
  const c1 = await p.evaluate(() => ({ faixa: !document.querySelector('[data-sua-busca]').hidden, pre: document.querySelector('[data-sua-busca-prefixo]').innerText, txt: document.querySelector('[data-busca-contato] textarea').value }));
  verifica(c1.faixa && c1.pre === 'Assunto:' && /Certificação de produto/.test(c1.txt), `Certificação preenche a mensagem e mostra "Assunto: Certificação de produto"`);
  await p.click('[data-sua-busca-remover]'); await p.waitForTimeout(200);
  const c2 = await p.evaluate(() => ({ faixa: document.querySelector('[data-sua-busca]').hidden, txt: document.querySelector('[data-busca-contato] textarea').value }));
  verifica(c2.faixa && c2.txt === '', `"remover" tira a faixa e o texto inserido`);
  await p.fill('#bi-q', 'xyzabcqwe'); await p.waitForTimeout(400); await p.keyboard.press('Enter'); await p.waitForTimeout(700);
  const btn = await p.$('#bi-grid [data-preencher-contato]');
  if (btn) { await btn.click(); await p.waitForTimeout(700); }
  const c3 = await p.evaluate(() => ({ pre: document.querySelector('[data-sua-busca-prefixo]').innerText, rot: document.querySelector('[data-sua-busca-texto]').innerText, txt: document.querySelector('[data-busca-contato] textarea').value }));
  verifica(!!btn && c3.pre === 'Sua busca:' && /xyzabcqwe/.test(c3.rot) && /xyzabcqwe/.test(c3.txt), `busca sem resultado leva o termo ao formulário ("Sua busca")`);

  console.log('\nLink direto e celular');
  const d = await abrir('?area=seguranca-fogo#catalogo');
  verifica(await visivel(d, '#bi-resultados') && (await contagem(d)) > 0, `?area=seguranca-fogo#catalogo abre a página já filtrada`);
  const m = await abrir('', { width: 390, height: 844 });
  verifica(!(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `390 px sem rolagem horizontal`);

  console.log('\nErros de JavaScript');
  verifica(erros.length === 0, `nenhum erro${erros.length ? ': ' + erros.join(' / ') : ''}`);
  await nav.close();
  console.log(`\n${ok} ok, ${falhas.length} falha(s)`);
  process.exit(falhas.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
