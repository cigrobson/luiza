"""Converte a lista pública de produtos da Loja IPT (WooCommerce Store API) para o formato
que a busca usa. Serve à demonstração offline e aos testes. No WordPress, o plugin monta
esse mesmo índice direto do WooCommerce (includes/produtos.php), sem esta etapa.

Uso: python3 -I scripts/produtos_loja.py scripts/fixtures/loja_store_api_AAAA-MM-DD.json dados/produtos_loja.json
Para obter o arquivo de entrada (uma requisição): https://loja.ipt.br/wp-json/wc/store/v1/products?per_page=100
"""
import html, json, re, sys

def limpar(txt, limite=700):
    """Mesma regra do plugin (bsipt_limpar_texto): sem HTML, sem o botão 'Solicitar orçamento', até 700 caracteres."""
    t = re.sub(r'<[^>]+>', ' ', txt or '')
    t = html.unescape(t)
    t = re.sub(r'\s+', ' ', t).strip()
    t = re.sub(r'\s*Solicitar orçamento\s*$', '', t, flags=re.I).strip()
    if len(t) > limite:
        t = t[:limite].rsplit(' ', 1)[0].rstrip(' ,.;:') + '…'
    return t

def reais(centavos, p):
    unid = int(p.get('currency_minor_unit', 2))
    v = int(centavos) / (10 ** unid)
    s = f'{v:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    return f"{p.get('currency_prefix', 'R$ ')}{s}".replace('R$', 'R$ ').replace('  ', ' ').strip()

def converter(p, base='https://loja.ipt.br'):
    pr = p.get('prices') or {}
    preco_num = int(pr.get('price') or 0)
    compra = bool(p.get('is_purchasable')) and preco_num > 0
    faixa = pr.get('price_range')
    if compra and faixa and faixa.get('min_amount') != faixa.get('max_amount'):
        preco = f"{reais(faixa['min_amount'], pr)} – {reais(faixa['max_amount'], pr)}"
    else:
        preco = reais(preco_num, pr) if compra else ''
    carrinho = ''
    if compra and p.get('type') == 'simple' and p.get('is_in_stock', True):
        carrinho = f"{base}/carrinho/?add-to-cart={p['id']}"
    return {
        'id': p['id'],
        'nome': html.unescape(p.get('name', '')).strip(),
        'descricao': limpar(p.get('short_description') or p.get('description')),
        'categorias': [html.unescape(c['name']) for c in p.get('categories', [])],
        'tags': [html.unescape(c['name']) for c in p.get('tags', [])],
        'sku': p.get('sku') or '',
        'tipo': p.get('type'),
        'compra': compra,
        'preco': preco,
        'url': p.get('permalink'),
        'carrinho': carrinho,
    }

if __name__ == '__main__':
    entrada = json.load(open(sys.argv[1], encoding='utf-8'))
    saida = [converter(p) for p in entrada]
    json.dump(saida, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{len(saida)} produtos ({sum(p["compra"] for p in saida)} compra direta) → {sys.argv[2]}')
