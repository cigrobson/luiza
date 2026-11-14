"""Gera todas as versões da busca a partir de src/ e dados/.

  prototipo/index.html                  demonstração: arquivo único, dados embutidos (catálogo + amostra de produtos da loja), abre offline
  publicar/index.html                   página avulsa que carrega publicar/busca-servicos.json
  publicar/busca-servicos.json          dados
  wordpress/busca-servicos-ipt/         plugin WordPress (shortcode [busca_servicos_ipt])
  wordpress/busca-servicos-ipt.zip      o mesmo plugin, pronto para Plugins > Adicionar novo > Enviar plugin

Edite apenas src/ (busca.css, busca.js, busca.html, wordpress/*) e rode, a partir de loja-ipt-busca/:
  python3 -I scripts/montar_prototipo.py
"""
import json, pathlib, shutil, zipfile

raiz = pathlib.Path(__file__).resolve().parent.parent
src = raiz / 'src'
ler = lambda p: p.read_text(encoding='utf-8')

d = json.loads(ler(raiz / 'dados/servicos.json'))
use = json.loads(ler(raiz / 'dados/vocabulario_use.json'))
dados = json.dumps({'meta': d['meta'], 'servicos': d['servicos'], 'use': use}, ensure_ascii=False, separators=(',', ':'))
css, js, html = ler(src / 'busca.css'), ler(src / 'busca.js'), ler(src / 'busca.html')
for marca in ('{{TITULO}}', '{{DADOS_URL}}'):
    assert html.count(marca) == 1, marca

produtos_demo = (raiz / 'dados/produtos_loja.json')
produtos = ler(produtos_demo) if produtos_demo.exists() else '[]'

def pagina(dados_url, embutir, com_produtos=False):
    corpo = html.replace('{{TITULO}}', '<h1 class="bi-titulo">Ensaios, análises e calibrações</h1>').replace('{{DADOS_URL}}', dados_url)
    script_dados = ''
    if embutir:
        seguro = dados.replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
        script_dados = f'<script>window.BUSCA_IPT_DADOS={seguro};</script>\n'
    if com_produtos:
        prod = json.dumps(json.loads(produtos), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
        script_dados += f'<script type="application/json" id="bi-produtos">{prod}</script>\n'
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Busca de Serviços IPT</title>
<meta name="description" content="Busca no catálogo de ensaios, análises e calibrações do IPT.">
<style>
html{{-webkit-text-size-adjust:100%}}
body{{margin:0;background:#f4f6fa}}
@media (prefers-color-scheme:dark){{body{{background:#0b1220}}}}
#busca-ipt{{--fonte:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;min-height:100vh}}
</style>
<style>
{css}</style>
</head>
<body>
{corpo}
{script_dados}<script>
{js}</script>
</body>
</html>
'''

(raiz / 'prototipo').mkdir(exist_ok=True)
(raiz / 'prototipo/index.html').write_text(pagina('', True, com_produtos=True), encoding='utf-8')

pub = raiz / 'publicar'; pub.mkdir(exist_ok=True)
(pub / 'index.html').write_text(pagina('busca-servicos.json', False), encoding='utf-8')
(pub / 'busca-servicos.json').write_text(dados, encoding='utf-8')

wp = raiz / 'wordpress'
plug = wp / 'busca-servicos-ipt'
if plug.exists():
    shutil.rmtree(plug)
(plug / 'assets').mkdir(parents=True)
(plug / 'templates').mkdir()
shutil.copy(src / 'wordpress/busca-servicos-ipt.php', plug)
shutil.copy(src / 'wordpress/readme.txt', plug)
shutil.copy(src / 'wordpress/uninstall.php', plug)
shutil.copytree(src / 'wordpress/includes', plug / 'includes')
(plug / 'includes/index.php').write_text('<?php // Silêncio.\n', encoding='utf-8')
(plug / 'assets/busca.css').write_text(css, encoding='utf-8')
(plug / 'assets/busca.js').write_text(js, encoding='utf-8')
(plug / 'assets/busca-servicos.json').write_text(dados, encoding='utf-8')
(plug / 'templates/busca.html').write_text(html, encoding='utf-8')
(plug / 'index.php').write_text('<?php // Silêncio.\n', encoding='utf-8')
(plug / 'assets/index.php').write_text('<?php // Silêncio.\n', encoding='utf-8')
(plug / 'templates/index.php').write_text('<?php // Silêncio.\n', encoding='utf-8')
zip_path = wp / 'busca-servicos-ipt.zip'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for f in sorted(plug.rglob('*')):
        if f.is_file():
            z.write(f, f.relative_to(wp).as_posix())

print(f'ok: {len(d["servicos"])} serviços | prototipo/index.html | publicar/ | {zip_path.relative_to(raiz)} ({zip_path.stat().st_size // 1024} KB)')
