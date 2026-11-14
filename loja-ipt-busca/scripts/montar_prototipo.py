"""Gera as duas versões da busca a partir de prototipo/template.html e dados/.

  prototipo/index.html            arquivo único, dados embutidos (demonstração, abre offline)
  publicar/index.html             página sem dados, carrega publicar/busca-servicos.json (produção)
  publicar/busca-servicos.json    dados consumidos pela página

Uso (a partir de loja-ipt-busca/): python3 -I scripts/montar_prototipo.py"""
import json, pathlib
raiz = pathlib.Path(__file__).resolve().parent.parent
d = json.loads((raiz / 'dados/servicos.json').read_text(encoding='utf-8'))
use = json.loads((raiz / 'dados/vocabulario_use.json').read_text(encoding='utf-8'))
payload = {'meta': d['meta'], 'servicos': d['servicos'], 'use': use}
compacto = json.dumps(payload, ensure_ascii=False, separators=(',', ':'))
tpl = (raiz / 'prototipo/template.html').read_text(encoding='utf-8')
marca = '/*__DADOS__*/null'
assert tpl.count(marca) == 1
embutido = compacto.replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
(raiz / 'prototipo/index.html').write_text(tpl.replace(marca, embutido), encoding='utf-8')
pub = raiz / 'publicar'; pub.mkdir(exist_ok=True)
(pub / 'index.html').write_text(tpl, encoding='utf-8')
(pub / 'busca-servicos.json').write_text(compacto, encoding='utf-8')
print('ok', len(d['servicos']), 'serviços | prototipo/index.html | publicar/index.html + busca-servicos.json')
