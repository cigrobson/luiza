"""Gera a base de conhecimento em Markdown para um agente de IA responder sobre os serviços do IPT.

Entradas:
  dados/indice_busca.json   (scripts/exportar_indice.js: textos em caixa normal, área e tipo de solução)
  dados/laboratorios.json, dados/vocabulario_use.json
  arquivo da Store API do WooCommerce (produtos atuais da loja), passado como argumento

Saída (agente-ia/):
  base-conhecimento-servicos-ipt.md   arquivo único, completo
  por-area/*.md                       a mesma base dividida (geral, produtos e uma por área técnica)
  instrucoes-agente.md                instruções de sistema sugeridas para o agente

Uso, a partir de loja-ipt-busca/:
  python3 -I scripts/montar_prototipo.py && node scripts/exportar_indice.js
  python3 -I scripts/gerar_base_agente.py <store_api.json>
"""
import html, json, pathlib, re, sys
from collections import Counter, defaultdict

raiz = pathlib.Path(__file__).resolve().parent.parent
ler = lambda p: json.loads(pathlib.Path(p).read_text(encoding='utf-8'))
idx = ler(raiz / 'dados/indice_busca.json')
meta = ler(raiz / 'dados/servicos.json')['meta']
labs_info = {l['sigla']: l for l in ler(raiz / 'dados/laboratorios.json')}
use = ler(raiz / 'dados/vocabulario_use.json')
store = ler(sys.argv[1]) if len(sys.argv) > 1 else []
saida = raiz / 'agente-ia'
(saida / 'por-area').mkdir(parents=True, exist_ok=True)

LOJA = 'https://loja.ipt.br/'
FORM = 'https://loja.ipt.br/#contato'
SAPIENS = 'https://sapiens.ipt.br/index_new.aspx'
AREAS = {a['id']: a for a in idx['areas']}
SOL = {s['id']: s['nome'] for s in idx['solucoes']}
PRODUTO_AREA = {440: 'meio-ambiente', 386: 'meio-ambiente'}
PRODUTO_SOL = {436: 'materiais-referencia', 440: 'diagnosticos-laudos'}

NOMES_LAB = {}
for s in idx['servicos']:
    for l in s['labs']:
        NOMES_LAB.setdefault(l['sigla'], l['nome'])
MINUSC = {'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'a', 'o', 'as', 'os', 'à', 'ao'}
def nome_lab(sigla):
    n = labs_info.get(sigla, {}).get('nome') or NOMES_LAB.get(sigla, sigla)
    ps = n.lower().split()
    return ' '.join(w if (i and w in MINUSC) else w[:1].upper() + w[1:] for i, w in enumerate(ps))

def siglas_parenteses(original, convertido):
    """Devolve em maiúsculas as siglas entre parênteses que a conversão de caixa baixou (ex.: '(wom)' -> '(WOM)')."""
    for m in re.finditer(r'\(([A-ZÀ-Ü0-9][A-ZÀ-Ü0-9\-/]{1,9})\)', original or ''):
        sig = m.group(1)
        convertido = re.sub(r'\(' + re.escape(sig.lower()) + r'\)', '(' + sig + ')', convertido)
    return convertido

RE_NORMA = re.compile(r'\b(?:ABNT\s+)?(?:NBR(?:\s+(?:ISO|IEC|NM))*(?:/IEC)?|ISO(?:/IEC)?|IEC|ASTM|DIN(?:\s+EN)?(?:\s+ISO)?|BS(?:\s+EN)?|EN(?:\s+ISO)?|NM(?:\s+ISO)?|TAPPI|CISPR|ANSI|JIS|AWPA|IESNA\s+LM|UL)\s*[A-Z]?\s?\d[\dA-Z.\-/]*(?:\s*-\s*\d+)?')
def normas(*textos):
    vistas = []
    for t in textos:
        for m in RE_NORMA.finditer(t or ''):
            n = re.sub(r'\s+', ' ', m.group(0)).strip(' .-/')
            if n not in vistas:
                vistas.append(n)
    return vistas

def grafia_normas(original, convertido):
    """Restaura a grafia original dos códigos de norma que a conversão de caixa alterou (ex.: 'ASTM d 3273' -> 'ASTM D 3273')."""
    for m in RE_NORMA.finditer(original or ''):
        convertido = re.sub(re.escape(m.group(0)), lambda _: m.group(0), convertido, flags=re.I)
    return convertido

def limpar_html(t):
    t = re.sub(r'<br\s*/?>|</p>|</li>', '\n', t or '')
    t = html.unescape(re.sub(r'<[^>]+>', '', t))
    return re.sub(r'\n{2,}', '\n', re.sub(r'[ \t]+', ' ', t)).strip()

def brl(centavos):
    v = int(centavos) / 100
    return 'R$ ' + f'{v:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')

# ---------- serviços ----------
servicos = []
for s in idx['servicos']:
    nome = grafia_normas(s['nome'], siglas_parenteses(s['nome'], s['nomeV']))
    desc = grafia_normas(s['descricao'], siglas_parenteses(s['descricao'], s['descV']))
    certs = [c for c in s['cgcre'] if 'Inglês' not in c['codigo'] and 'Ingles' not in c['codigo']]
    ingl = {c['codigo'].split('(')[0].strip(): c['url'] for c in s['cgcre'] if '(' in c['codigo']}
    servicos.append({**s, 'nome_f': nome, 'desc_f': desc, 'certs': certs, 'certs_en': ingl,
                     'normas': normas(s['nome'], s['descricao'], ' '.join(s['palavras']))})

def bloco_servico(s):
    labs = s['labs']
    principal = labs[0]
    linhas = [f"### {s['nome_f']} — Serviço IPT nº {s['registro']}", '']
    linhas.append(f"- **Número do serviço (registro no Scriba):** {s['registro']}")
    linhas.append(f"- **Área técnica:** {AREAS[s['area']]['nome']}")
    linhas.append(f"- **Tipo de solução:** {SOL.get(s['sol'], 'Ensaios e Análises')}")
    linhas.append(f"- **Classificação no catálogo:** {s['tipo']}")
    lab_txt = '; '.join(f"{l['sigla']} – {nome_lab(l['sigla'])} (unidade {l['crd']})" for l in labs)
    linhas.append(f"- **Laboratório responsável:** {lab_txt}")
    linhas.append(f"- **Descrição:** {s['desc_f'] if s['desc_f'] else 'não informada no catálogo do IPT.'}")
    if s['palavras']:
        linhas.append(f"- **Palavras-chave:** {', '.join(s['palavras'])}")
    if s['normas']:
        linhas.append(f"- **Normas citadas no texto:** {', '.join(s['normas'])}")
    if s['certs']:
        # Os PDFs dos certificados no Scriba retornam 404 (verificado em 16/11/2026): só o código é publicado.
        cs = list(dict.fromkeys(c['codigo'] for c in s['certs']))
        linhas.append(f"- **Acreditação Cgcre/Inmetro:** sim — certificado {', '.join(cs)}")
    else:
        linhas.append('- **Acreditação Cgcre/Inmetro:** não consta para este serviço no catálogo.')
    linhas.append(f"- **Preço e prazo:** sob orçamento, definidos pelo laboratório após análise da demanda.")
    linhas.append(f"- **Como solicitar:** formulário da Loja IPT ({FORM}) ou botão \"Solicitar orçamento\" do serviço na busca de {LOJA}, informando \"{s['nome_f']} (Serviço IPT nº {s['registro']})\".")
    return '\n'.join(linhas) + '\n'

# ---------- produtos ----------
produtos = []
for p in store:
    cats = [html.unescape(c['name']) for c in p.get('categories', [])]
    area = PRODUTO_AREA.get(p['id'])
    if not area:
        for a in AREAS.values():
            if any(c in a['cats'] for c in cats):
                area = a['id']; break
    pr = p['prices']
    faixa = pr.get('price_range')
    if faixa:
        preco = f"{brl(faixa['min_amount'])} a {brl(faixa['max_amount'])}, conforme a opção escolhida"
    elif int(pr.get('price') or 0) > 0:
        preco = brl(pr['price'])
    else:
        preco = None
    produtos.append({'id': p['id'], 'nome': html.unescape(p['name']), 'cats': cats, 'area': area,
                     'sku': p.get('sku', ''), 'preco': preco, 'url': p['permalink'],
                     'desc': limpar_html(p.get('description') or p.get('short_description'))})

def bloco_produto(p):
    l = [f"### {p['nome']} — Produto IPT {p['id']}", '']
    if p['area']:
        l.append(f"- **Área técnica:** {AREAS[p['area']]['nome']}")
    if p['cats']:
        l.append(f"- **Categoria na loja:** {', '.join(p['cats'])}")
    if p['sku']:
        l.append(f"- **Código (SKU):** {p['sku']}")
    if p['preco']:
        l.append(f"- **Preço publicado:** {p['preco']}. Valores sem frete.")
        l.append(f"- **Como pedir:** botão \"Solicitar compra\" na página do produto ({p['url']}) ou formulário {FORM}, informando \"{p['nome']} (Produto IPT {p['id']})\" e a quantidade. A loja não recebe pagamento online: a equipe confirma a disponibilidade e informa as formas de pagamento.")
    else:
        l.append('- **Preço:** definido após avaliação técnica (sob orçamento).')
        l.append(f"- **Como pedir:** botão \"Solicitar orçamento\" na página do produto ({p['url']}) ou formulário {FORM}, informando \"{p['nome']} (Produto IPT {p['id']})\".")
    if p['desc']:
        l.append(f"- **Descrição:** {p['desc'].replace(chr(10), ' ')}")
    return '\n'.join(l) + '\n'

# ---------- seções gerais ----------
n_serv = len(servicos)
n_cgcre = sum(1 for s in servicos if s['certs'])
por_area = Counter(s['area'] for s in servicos)
por_lab = Counter(l['sigla'] for s in servicos for l in s['labs'])
cgcre_lab = Counter(l['sigla'] for s in servicos if s['certs'] for l in s['labs'])
area_do_lab = {}
for a in AREAS.values():
    for sig in a['labs']:
        area_do_lab[sig] = a['nome']

CAB = f"""# Base de conhecimento: serviços técnicos e produtos do IPT

Fonte dos serviços: catálogo público do IPT (Scriba, {meta['fonte'].split(' ')[0]}), coletado em {meta['coletado_em'][8:10]}/{meta['coletado_em'][5:7]}/{meta['coletado_em'][:4]}: {n_serv} serviços de {len(por_lab)} laboratórios e seções, {n_cgcre} deles com acreditação Cgcre/Inmetro. Fonte dos produtos: Loja IPT ({LOJA}), {len(produtos)} itens. Os textos do catálogo foram convertidos da caixa alta para a caixa normal, sem alteração de conteúdo. Áreas técnicas e tipos de solução seguem a classificação da Loja IPT.
"""

ORIENT = f"""## Orientações para responder

Esta base é a única fonte para respostas sobre serviços e produtos. Para cada pergunta:

1. Procure o serviço pelo nome, pelas palavras-chave, pela norma citada, pelo laboratório ou pelo número do serviço. Use a seção "Termos equivalentes" quando o usuário usar outro nome (ex.: AEAC = etanol).
2. Ao indicar um serviço, informe o nome, o número do serviço, o laboratório, se há acreditação Cgcre e como solicitar. Indique no máximo 5 serviços por resposta e ofereça mais se houver.
3. Não informe preço, prazo, tipo ou quantidade de amostra de serviços técnicos: esses dados não constam do catálogo e são definidos pelo laboratório no orçamento. Preço só existe para os produtos marcados com "Preço publicado".
4. Uma norma citada na descrição indica que o ensaio a menciona; não afirme que o serviço atende a uma versão específica da norma sem que o texto diga isso.
5. Se nada na base corresponder ao pedido, diga isso e oriente o envio da necessidade pelo formulário {FORM}. Alguns laboratórios atendem demandas que não estão no catálogo.
6. Não invente serviços, normas, acreditações, laboratórios, preços ou contatos.

## Como solicitar

| Situação | Caminho |
|---|---|
| Serviço técnico do catálogo (ensaio, análise, calibração) | Formulário da Loja IPT: {FORM}, informando o nome e o número do serviço. Também pela busca em {LOJA}, botão "Solicitar orçamento" |
| Produto com preço publicado | Botão "Solicitar compra" na página do produto ou formulário {FORM}. Não há pagamento online: a equipe confirma a disponibilidade e informa as formas de pagamento |
| Produto ou serviço sem preço | Botão "Solicitar orçamento" ou formulário {FORM} |
| Certificação de produto (IPT OCP / Inmetro) | Formulário {FORM}, com o produto a certificar e a norma de referência |
| Cursos e ensino tecnológico | Portal Sapiens: {SAPIENS} |
| Necessidade não encontrada no catálogo | Formulário {FORM}, descrevendo a necessidade |

As solicitações do formulário chegam à equipe da Loja IPT (loja@ipt.br).

Identificação: Instituto de Pesquisas Tecnológicas do Estado de São Paulo S.A. – IPT · CNPJ 60.633.674/0001-55 · Avenida Professor Almeida Prado, 532, Cidade Universitária, Butantã, São Paulo – SP, CEP 05508-901.

## Perguntas frequentes

**Quanto custa um ensaio ou calibração?** O catálogo não traz preços de serviços técnicos. O valor depende do ensaio, da quantidade de amostras e das condições de execução, e é informado pelo laboratório no orçamento.

**Qual o prazo?** Não consta no catálogo. O laboratório informa o prazo junto com o orçamento.

**Que amostra devo enviar?** O catálogo não define tipo, quantidade ou forma de envio de amostras. Essas condições são combinadas com o laboratório após a solicitação.

**O que significa acreditação Cgcre?** A Coordenação-Geral de Acreditação do Inmetro (Cgcre) reconhece formalmente a competência técnica de laboratórios de ensaio e calibração, com base na norma ABNT NBR ISO/IEC 17025. Um serviço marcado como acreditado traz o código do certificado (ex.: CAL 0003 para calibração, CRL 0111 para ensaio). O escopo exato da acreditação deve ser confirmado com o laboratório no orçamento.

**Que documento recebo?** Pela ABNT NBR ISO/IEC 17025, resultados de ensaio são emitidos em relatório e os de calibração em certificado. O catálogo não detalha o documento de cada serviço; o laboratório informa no orçamento.

**Posso comprar e pagar pelo site?** Não. A Loja IPT mostra preços de alguns produtos, mas todo pedido é feito pelo formulário, e a cobrança e a nota fiscal são emitidas pela equipe do IPT.

**O serviço que procuro não aparece.** Envie a necessidade pelo formulário {FORM}. O catálogo não cobre todas as competências dos laboratórios.
"""

def tabela_areas():
    l = ['## Áreas técnicas', '', '| Área técnica | Laboratórios | Serviços no catálogo |', '|---|---|---|']
    for a in idx['areas']:
        l.append(f"| {a['nome']} | {', '.join(a['labs'])} | {por_area[a['id']]} |")
    l += ['', 'Tipos de solução usados na loja: ' + '; '.join(f"{n} ({sum(1 for s in servicos if s['sol']==i)} serviços)" for i, n in SOL.items() if any(s['sol']==i for s in servicos)) + '. Materiais de referência e Normas Técnicas (SAA) aparecem entre os produtos da loja.', '']
    return '\n'.join(l)

def tabela_labs():
    l = ['## Laboratórios e seções', '', '| Sigla | Nome | Unidade (CRD) | Área técnica | Serviços | Com acreditação Cgcre |', '|---|---|---|---|---|---|']
    for sig in sorted(por_lab):
        l.append(f"| {sig} | {nome_lab(sig)} | {labs_info.get(sig, {}).get('crd', '')} | {area_do_lab.get(sig, '')} | {por_lab[sig]} | {cgcre_lab[sig]} |")
    return '\n'.join(l) + '\n'

def tabela_use():
    l = ['## Termos equivalentes (vocabulário do catálogo)', '', 'Quando o usuário usar o termo da esquerda, procure pelo termo da direita.', '', '| Termo usado pelo usuário | Termo do catálogo |', '|---|---|']
    for u in sorted(use, key=lambda x: x['termo']):
        l.append(f"| {u['termo'].capitalize()} | {u['use']} |")
    return '\n'.join(l) + '\n'

def secao_produtos():
    l = ['## Produtos da Loja IPT', '', f"Situação em {meta['coletado_em'][8:10]}/{meta['coletado_em'][5:7]}/{meta['coletado_em'][:4]} conforme a loja. Preços publicados valem como oferta e devem ser confirmados pela equipe no atendimento.", '']
    for p in sorted(produtos, key=lambda x: (x['preco'] is None, x['nome'])):
        l.append(bloco_produto(p))
    return '\n'.join(l)

def secao_area(aid):
    a = AREAS[aid]
    l = [f"## Serviços — {a['nome']}", '', f"{por_area[aid]} serviços. Laboratórios: {', '.join(f'{s} – {nome_lab(s)}' for s in a['labs'] if por_lab[s])}.", '']
    grupos = defaultdict(list)
    for s in servicos:
        if s['area'] == aid:
            grupos[s['labs'][0]['sigla']].append(s)
    for sig in sorted(grupos):
        l += [f"## {a['nome']} — {sig} ({nome_lab(sig)})", '']
        for s in sorted(grupos[sig], key=lambda x: x['nome_f'].lower()):
            l.append(bloco_servico(s))
    return '\n'.join(l)

geral = '\n'.join([CAB, ORIENT, tabela_areas(), tabela_labs(), tabela_use()])
partes_area = {aid: secao_area(aid) for aid in AREAS}
prod = secao_produtos()

completo = '\n'.join([geral, prod, '# Catálogo de serviços técnicos\n'] + list(partes_area.values()))
(saida / 'base-conhecimento-servicos-ipt.md').write_text(completo, encoding='utf-8')

aviso = f"Parte da base de conhecimento dos serviços do IPT (catálogo de {meta['coletado_em'][8:10]}/{meta['coletado_em'][5:7]}/{meta['coletado_em'][:4]}). Orientações de resposta e formas de solicitação estão em 00-geral.md. Como solicitar qualquer serviço: {FORM}.\n\n"
(saida / 'por-area/00-geral.md').write_text(geral, encoding='utf-8')
(saida / 'por-area/01-produtos-loja.md').write_text(f"# Produtos da Loja IPT\n\n{aviso}{prod}", encoding='utf-8')
for i, (aid, txt) in enumerate(partes_area.items(), start=2):
    (saida / f"por-area/{i:02d}-{aid}.md").write_text(f"# Serviços do IPT — {AREAS[aid]['nome']}\n\n{aviso}{txt}", encoding='utf-8')

print(f"ok: {n_serv} serviços, {len(produtos)} produtos, {len(use)} termos | {(saida / 'base-conhecimento-servicos-ipt.md').stat().st_size // 1024} KB")
