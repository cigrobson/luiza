// Exporta o índice derivado da busca (textos em caixa normal, área técnica, tipo de solução) para dados/indice_busca.json.
// Usa a própria lógica de src/busca.js, carregando prototipo/index.html. Rodar depois de montar_prototipo.py.
const {chromium} = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const raiz = path.resolve(__dirname, '..');
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.join(raiz, 'prototipo/index.html'));
  await p.waitForFunction(() => window.BUSCA_IPT && window.BUSCA_IPT.servicos && window.BUSCA_IPT.servicos.length > 500);
  const d = await p.evaluate(() => {
    const B = window.BUSCA_IPT;
    return {
      areas: B.areas, solucoes: B.solucoes,
      servicos: B.servicos.map(s => ({registro: s.registro, tipo: s.tipo_servico, nome: s.nome, nomeV: s.nomeV, descricao: s.descricao, descV: s.descV,
        palavras: s.kwV, labs: s.laboratorios, cgcre: s.certificados_cgcre, contato: s.contato, area: s.area, sol: s.sol}))
    };
  });
  fs.writeFileSync(path.join(raiz, 'dados/indice_busca.json'), JSON.stringify(d, null, 1));
  console.log('ok:', d.servicos.length, 'serviços em dados/indice_busca.json');
  await b.close();
})();
