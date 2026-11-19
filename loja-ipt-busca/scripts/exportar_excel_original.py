"""Exporta para Excel o conteúdo do Scriba exatamente como publicado, a partir da página original salva.

Sem conversão de caixa, sem classificação, sem remoção de blocos repetidos e sem campos criados.
Única transformação: retirar as marcações HTML, decodificar entidades (&amp; etc.) e juntar espaços e quebras
de linha do código-fonte em um espaço simples.

Uso, a partir de loja-ipt-busca/:
  python3 -I scripts/exportar_excel_original.py bruto/escriba_busca_todos_2026-11-14.html dados/scriba_original_2026-11-14.xlsx
"""
import html, re, sys
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

src, out = sys.argv[1], sys.argv[2]
raw = open(src, encoding='cp1252').read()

def texto(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()

ROTULOS = ['Serviço', 'Tipo de serviço', 'Nome', 'Descrição', 'Palavras-chave', 'Certificado Cgcre', 'Laboratório', 'Contato']
blocos = re.findall(r'<table>\s*<tr>\s*<td style="vertical-align:text-top;width:120px;">.*?</table>', raw, re.S)

linhas = []
for i, b in enumerate(blocos, start=1):
    campos = {}
    for rot, val in re.findall(r'width:120px;">\s*<font class="cinza_13">\s*([^<]+?):</font>\s*</td>\s*<td\s*>(.*?)</td>', b, re.S):
        rot = rot.strip()
        assert rot in ROTULOS, f'rótulo inesperado no bloco {i}: {rot}'
        campos[rot] = val
    certs = re.findall(r'href="([^"]+)"[^>]*>(.*?)</a>', campos.get('Certificado Cgcre', ''), re.S)
    cont = re.findall(r"href='([^']+)'[^>]*>(.*?)</a>", campos.get('Contato', ''), re.S)
    linhas.append([
        i,
        texto(campos.get('Serviço', '')),
        texto(campos.get('Tipo de serviço', '')),
        texto(campos.get('Nome', '')),
        texto(campos.get('Descrição', '')),
        texto(campos.get('Palavras-chave', '')),
        ' | '.join(texto(t) for _, t in certs) if certs else texto(campos.get('Certificado Cgcre', '')),
        ' | '.join(html.unescape(h) for h, _ in certs),
        texto(campos.get('Laboratório', '')),
        ' | '.join(texto(t) for _, t in cont) if cont else texto(campos.get('Contato', '')),
        ' | '.join(html.unescape(h) for h, _ in cont),
    ])

use = [(texto(a), html.unescape(b).strip()) for a, b in re.findall(
    r'<td width="500px">\s*<font class="cinza_13">(.*?)</font>\s*</td>\s*<td width="100px">\s*'
    r'<font class="cinza_13">pesquise por:</font>.*?name="TermoUse" value="([^"]*)"', raw, re.S)]

# ---------- conferência: todo texto exportado existe na página original ----------
plano = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', raw)))
for l in linhas:
    for v in (l[1], l[2], l[3], l[4], l[5], l[8]):
        assert v in plano, v[:80]
regs = [re.search(r'\d+', l[1]).group() for l in linhas]
unicos = len(set(regs))
repetidos = sorted({r for r in regs if regs.count(r) > 1}, key=int)

# ---------- planilha ----------
wb = Workbook()
cab = ['Ordem no Scriba', 'Serviço', 'Tipo de serviço', 'Nome', 'Descrição', 'Palavras-chave',
       'Certificado Cgcre (texto exibido)', 'Certificado Cgcre (endereço do link)', 'Laboratório',
       'Contato (texto exibido)', 'Contato (endereço do link)']
larg = [10, 18, 34, 50, 80, 40, 26, 60, 50, 14, 62]
negrito, fundo = Font(bold=True, color='FFFFFF'), PatternFill('solid', fgColor='1B3A5C')

def aba(ws, cabecalho, dados, larguras):
    ws.append(cabecalho)
    for c in ws[1]:
        c.font, c.fill, c.alignment = negrito, fundo, Alignment(wrap_text=True, vertical='center')
    for d in dados:
        ws.append(d)
    for j, w in enumerate(larguras, start=1):
        ws.column_dimensions[get_column_letter(j)].width = w
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.alignment = Alignment(wrap_text=True, vertical='top')
    ws.freeze_panes = 'A2'
    ws.auto_filter.ref = ws.dimensions

ws = wb.active; ws.title = 'Serviços (como no Scriba)'
aba(ws, cab, linhas, larg)
ws2 = wb.create_sheet('Vocabulário (pesquise por)')
aba(ws2, ['Ordem no Scriba', 'Termo exibido', 'pesquise por:'], [[i, a, b] for i, (a, b) in enumerate(use, start=1)], [10, 60, 50])

ws3 = wb.create_sheet('Leia-me')
info = [
    ['Origem', 'Catálogo público do IPT (Scriba): https://escriba.ipt.br/Busca_EAC/'],
    ['Como foi obtido', 'Uma única consulta ao formulário público pesquisas.asp com o termo "%" (curinga indicado na própria página), em 14/11/2026. A resposta HTML foi guardada sem alteração (arquivo bruto/escriba_busca_todos_2026-11-14.html, codificação Windows-1252).'],
    ['O que foi feito', 'Cada bloco de resultado virou uma linha, na mesma ordem da página. Foram retiradas apenas as marcações HTML, decodificadas as entidades (ex.: &amp;) e juntados os espaços e quebras de linha do código-fonte em um espaço. Nenhum texto foi alterado, criado ou removido.'],
    ['O que NÃO foi feito', 'Sem conversão de maiúsculas, sem correção ortográfica, sem classificação por área, sem remoção de linhas repetidas, sem preenchimento de campos vazios.'],
    ['Campos vazios', 'Célula vazia = o Scriba não exibe aquele campo (ou o exibe sem conteúdo) naquele serviço.'],
    ['Blocos (linhas)', len(linhas)],
    ['Números de serviço diferentes', unicos],
    ['Serviços que o Scriba exibe mais de uma vez', f"{len(repetidos)} ({', '.join(repetidos)}): mantidos como no Scriba, uma linha por exibição (em geral, um laboratório ou certificado diferente em cada uma)."],
    ['Termos do vocabulário ("pesquise por")', f'{len(use)} ocorrências, na ordem da página (podem existir repetições, mantidas).'],
    ['Colunas "endereço do link"', 'Endereço exato do link no Scriba. Os 16 endereços de certificado (qualidade_acreditacao/*.pdf) retornavam "não encontrado" (erro 404) em 16/11/2026; o endereço do Fale Conosco (Contato) pode também não funcionar no site atual do IPT.'],
    ['Conferência automática', 'Todo texto das colunas Serviço, Tipo, Nome, Descrição, Palavras-chave e Laboratório foi comparado com a página original: 100% encontrado literalmente.'],
    ['Gerado por', 'scripts/exportar_excel_original.py (repositório cigrobson/luiza)'],
]
for r in info:
    ws3.append(r)
ws3.column_dimensions['A'].width, ws3.column_dimensions['B'].width = 38, 120
for row in ws3.iter_rows():
    row[0].font = Font(bold=True)
    for c in row:
        c.alignment = Alignment(wrap_text=True, vertical='top')
wb.move_sheet('Leia-me', offset=-2)
wb.active = 1
wb.save(out)
print(f'ok: {len(linhas)} linhas, {unicos} serviços distintos, repetidos {repetidos}, {len(use)} termos -> {out}')
