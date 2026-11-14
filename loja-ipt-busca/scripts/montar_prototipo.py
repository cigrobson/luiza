"""Embute os dados de ../dados no template e gera prototipo/index.html (arquivo único, funciona offline).
Uso: python3 -I scripts/montar_prototipo.py   (a partir de loja-ipt-busca/)"""
import json, pathlib
raiz = pathlib.Path(__file__).resolve().parent.parent
d = json.loads((raiz / 'dados/servicos.json').read_text(encoding='utf-8'))
use = json.loads((raiz / 'dados/vocabulario_use.json').read_text(encoding='utf-8'))
dados = json.dumps({'meta': d['meta'], 'servicos': d['servicos'], 'use': use}, ensure_ascii=False, separators=(',', ':'))
dados = dados.replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
tpl = (raiz / 'prototipo/template.html').read_text(encoding='utf-8')
assert tpl.count('/*__DADOS__*/null') == 1
(raiz / 'prototipo/index.html').write_text(tpl.replace('/*__DADOS__*/null', dados), encoding='utf-8')
print('ok', len(d['servicos']), 'serviços')
