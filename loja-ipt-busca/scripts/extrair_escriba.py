"""Converte o HTML da busca pública do Scriba (Busca_EAC/pesquisas.asp, TxtTermo=%)
em dados estruturados. Uso: python3 -I extrair_escriba.py <html_latin1> <pasta_saida>"""
import csv, html, json, re, sys, collections, datetime

def limpa(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()

def main(src, out):
    t = open(src, encoding='latin-1').read()
    # --- vocabulário controlado (termo não preferido -> USE termo preferido)
    use = []
    for nao_pref, pref in re.findall(
            r'<td width="500px">\s*<font class="cinza_13">(.*?)</font>\s*</td>\s*<td width="100px">\s*'
            r'<font class="cinza_13">pesquise por:</font>.*?name="TermoUse" value="([^"]*)"', t, re.S):
        use.append({'termo': limpa(nao_pref), 'use': html.unescape(pref).strip()})
    use = [dict(x) for x in {(u['termo'], u['use']): u for u in use}.values()]
    # --- serviços
    servs = collections.OrderedDict()
    blocos = re.findall(r'<table>\s*<tr>\s*<td style="vertical-align:text-top;width:120px;">.*?</table>', t, re.S)
    for b in blocos:
        campos = dict()
        for lab, val in re.findall(r'width:120px;">\s*<font class="cinza_13">\s*([^<]+?):</font>\s*</td>\s*<td\s*>(.*?)</td>', b, re.S):
            campos[lab.strip()] = val
        reg = int(re.search(r'\d+', limpa(campos['Serviço'])).group())
        cont = re.search(r"href='([^']+)'", campos.get('Contato', ''))
        url = html.unescape(cont.group(1)) if cont else None
        m = re.search(r'Manifestacao=(\d+)&Ensaio=(\d+)&CRD=(\w+)', url or '')
        certs = [{'codigo': limpa(txt), 'url': href} for href, txt in
                 re.findall(r'href="([^"]+)"[^>]*>(.*?)</a>', campos.get('Certificado Cgcre', ''), re.S)]
        lab_txt = limpa(campos['Laboratório'])
        sigla, _, nome_lab = lab_txt.partition('-')
        lab = {'sigla': sigla.strip(), 'nome': nome_lab.strip() or lab_txt, 'crd': m.group(3) if m else None}
        s = servs.get(reg)
        if s is None:
            pc = limpa(campos.get('Palavras-chave', ''))
            s = servs[reg] = {
                'registro': reg,
                'tipo_servico': limpa(campos['Tipo de serviço']),
                'nome': limpa(campos['Nome']),
                'descricao': limpa(campos.get('Descrição', '')) or None,
                'palavras_chave': [p.strip() for p in pc.split(';') if p.strip()],
                'laboratorios': [], 'certificados_cgcre': [],
                'contato': {'url': url, 'manifestacao': m.group(1) if m else None},
            }
        if lab not in s['laboratorios']: s['laboratorios'].append(lab)
        for c in certs:
            if c not in s['certificados_cgcre']: s['certificados_cgcre'].append(c)
    servs = list(servs.values())
    labs = collections.OrderedDict()
    for s in servs:
        for l in s['laboratorios']:
            k = l['sigla']; labs.setdefault(k, dict(l, total_servicos=0))['total_servicos'] += 1
    meta = {'fonte': 'https://escriba.ipt.br/Busca_EAC/pesquisas.asp (POST TxtTermo=%)',
            'coletado_em': datetime.date.today().isoformat(),
            'blocos_html': len(blocos), 'servicos_unicos': len(servs),
            'laboratorios': len(labs), 'termos_use': len(use)}
    w = lambda n, o: json.dump(o, open(f'{out}/{n}', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    w('servicos.json', {'meta': meta, 'servicos': servs})
    w('laboratorios.json', sorted(labs.values(), key=lambda x: x['sigla']))
    w('vocabulario_use.json', sorted(use, key=lambda x: x['termo']))
    with open(f'{out}/servicos.csv', 'w', newline='', encoding='utf-8-sig') as f:
        cw = csv.writer(f, delimiter=';')
        cw.writerow(['registro', 'tipo_servico', 'nome', 'descricao', 'palavras_chave', 'laboratorio_sigla',
                     'laboratorio_nome', 'crd', 'certificados_cgcre', 'certificados_urls', 'contato_url'])
        for s in servs:
            L = s['laboratorios']; C = s['certificados_cgcre']
            cw.writerow([s['registro'], s['tipo_servico'], s['nome'], s['descricao'] or '', ' ; '.join(s['palavras_chave']),
                         ' | '.join(l['sigla'] for l in L), ' | '.join(l['nome'] for l in L), ' | '.join(l['crd'] or '' for l in L),
                         ' ; '.join(c['codigo'] for c in C), ' ; '.join(c['url'] for c in C), s['contato']['url']])
    print(json.dumps(meta, ensure_ascii=False, indent=1))

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
