#!/usr/bin/env node
/*
  Teste de aceitação da busca de serviços da Loja IPT.

  Uso:
    node scripts/testar_busca.js                  # testa ./publicar (sobe servidor local)
    node scripts/testar_busca.js prototipo        # testa outra pasta
    node scripts/testar_busca.js https://loja.ipt.br/caminho/da/busca/

  Requer Playwright:  npm i -D playwright && npx playwright install chromium
  Sai com código 1 se qualquer verificação falhar.

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
    await p.goto(base + qs);
    await p.waitForFunction(() => document.documentElement.dataset.buscaPronta === '1', null, { timeout: 15000 });
    return p;
  };
  const buscar = async (p, q) => { await p.fill('#q', q); await p.waitForTimeout(400); };
  const estado = p => p.evaluate(() => ({
    n: [...document.querySelectorAll('.card')].length,
    total: parseInt((document.getElementById('count').innerText.match(/\d+/) || ['0'])[0], 10),
    titulos: [...document.querySelectorAll('.card h2')].map(h => h.innerText),
    avisos: [...document.querySelectorAll('.notice')].map(n => n.innerText).join(' | '),
    vazio: !!document.querySelector('.empty'),
  }));

  const p = await abrir();
  let e = await estado(p);
  console.log('\nCarga inicial');
  verifica(e.total === 568, `dados: catálogo carregado com 568 serviços (veio ${e.total})`);
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
  const marcas = await p.$$eval('.card mark', m => m.length);
  verifica(marcas > 0, `termo destacado nos cards (${marcas} marcas)`);

  console.log('\nCards e ações');
  const link = await p.getAttribute('.card a.btn.pri', 'href');
  verifica(/faleconosco\/\?Manifestacao=\d&Ensaio=\d+&CRD=\w+/.test(link || ''), `"Solicitar serviço" leva registro e unidade (${link})`);
  verifica(await p.getAttribute('.card a.btn.pri', 'target') === '_blank', `"Solicitar serviço" abre em nova aba`);
  await p.click('.card [data-det]'); await p.waitForTimeout(200);
  verifica(await p.evaluate(() => document.getElementById('dlg').open), `"Ver detalhes" abre a janela`);
  verifica(/servico=\d+/.test(p.url()), `URL registra o serviço aberto (${p.url().split('?')[1]})`);
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  verifica(!(await p.evaluate(() => document.getElementById('dlg').open)), `Esc fecha a janela`);

  console.log('\nFiltros');
  await buscar(p, '');
  await p.check('#fcgcre'); await p.waitForTimeout(200); e = await estado(p);
  verifica(e.total === 101, `dados: filtro Cgcre = 101 (veio ${e.total})`);
  verifica(/cgcre=1/.test(p.url()), `filtro gravado na URL`);
  await p.click('#freset'); await p.waitForTimeout(200);
  await p.check('input[data-f="lab"][value="LV"]'); await p.waitForTimeout(200); e = await estado(p);
  verifica(e.total === 34, `dados: filtro laboratório LV = 34 (veio ${e.total})`);

  console.log('\nLink direto');
  const p2 = await abrir('?q=vazao&lab=LV&servico=870');
  verifica(await p2.inputValue('#q') === 'vazao', `busca restaurada da URL`);
  verifica(await p2.evaluate(() => document.getElementById('dlg').open), `serviço da URL aberto`);

  console.log('\nCelular e tema escuro');
  const m = await abrir('?q=dureza', { viewport: { width: 360, height: 780 } });
  verifica(!(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `360 px sem rolagem horizontal`);
  const d = await abrir('', { colorScheme: 'dark' });
  const fundo = await d.evaluate(() => getComputedStyle(document.body).backgroundColor);
  verifica(fundo !== 'rgb(244, 246, 250)', `tema escuro aplicado (${fundo})`);

  console.log('\nErros de JavaScript');
  verifica(erros.length === 0, `nenhum erro no console${erros.length ? ': ' + erros.join(' / ') : ''}`);

  await nav.close(); if (srv) srv.close();
  console.log(`\n${ok} ok, ${falhas.length} falha(s)`);
  process.exit(falhas.length ? 1 : 0);
})().catch(err => { console.error(err); process.exit(1); });
