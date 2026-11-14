# Instruções para o agente: integrar a busca de serviços na Loja IPT

## Contexto

A página https://loja.ipt.br/loja-15/ exibe o catálogo de ensaios, análises e calibrações do IPT por meio de um iframe apontando para o Scriba (https://escriba.ipt.br/Busca_EAC/). O Scriba é ASP clássico de 2017, sem layout responsivo. Por isso a página hoje pede que usuários de celular abram a busca em outra aba.

Esta pasta contém uma busca nova, independente do Scriba, já validada: 568 serviços, 19 laboratórios e 132 sinônimos extraídos do catálogo público em 14/11/2026. A tarefa é substituir o iframe por ela, com a identidade visual da loja.

O trabalho é supervisionado por Robson Santos da Silva (LID-IPT). Siga a seção "Quando parar e perguntar".

## Mapa da pasta

| Caminho | Papel | Pode editar? |
|---|---|---|
| `publicar/index.html` | Página de produção. Carrega os dados do JSON indicado em `<meta name="busca-dados">` | Gerado, não edite à mão |
| `publicar/busca-servicos.json` | Dados que a página consome (≈400 KB) | Gerado, não edite à mão |
| `prototipo/template.html` | Código-fonte da página (HTML, CSS e JS num arquivo) | **Sim, edite aqui** |
| `prototipo/index.html` | Versão de demonstração com dados embutidos, abre offline | Gerado |
| `dados/*.json`, `dados/servicos.csv` | Catálogo estruturado | Só pelos scripts |
| `bruto/*.html` | Resposta original do Scriba, para auditoria | Não |
| `scripts/extrair_escriba.py` | HTML do Scriba → `dados/` | Só se o Scriba mudar o HTML |
| `scripts/montar_prototipo.py` | `template.html` + `dados/` → `publicar/` e `prototipo/index.html` | Raramente |
| `scripts/testar_busca.js` | Teste de aceitação (27 verificações) | Acrescente casos, não remova |
| `README.md` | Diagnóstico do Scriba e documentação | Atualize ao final |

Fluxo de edição: alterar `prototipo/template.html` → `python3 -I scripts/montar_prototipo.py` → `node scripts/testar_busca.js` → copiar `publicar/` para a loja.

## Etapa 1: reconhecimento (sem alterar nada)

1. Identifique a plataforma da loja (WordPress/WooCommerce, VTEX, Nuvemshop, site estático etc.), o tema e como se cria ou edita uma página.
2. Localize o bloco da página `loja-15` que contém o iframe do Scriba, o banner e o botão "Abrir catálogo técnico".
3. Verifique se a plataforma permite: (a) página com HTML próprio completo; (b) bloco de HTML personalizado dentro de uma página do tema; (c) envio de arquivo `.json` para o mesmo domínio.
4. Leve a Robson um resumo de até 10 linhas com plataforma, opção de integração escolhida (abaixo) e onde ficarão os arquivos. **Aguarde o "ok" antes da etapa 2.**

## Etapa 2: escolher a forma de integração

| Opção | Quando usar | Como |
|---|---|---|
| **A. Página própria** (preferida) | A plataforma aceita uma página/template com HTML completo, ou arquivos estáticos em uma pasta do domínio | Publique `publicar/index.html` e `publicar/busca-servicos.json` juntos, por exemplo em `loja.ipt.br/busca-servicos/`. Na `loja-15`, o banner passa a levar para essa página, ou a página substitui a `loja-15` |
| **B. Bloco dentro do tema** | Só há bloco de HTML personalizado dentro do layout da loja | Ver "Cuidados da opção B" |

Iframe não é opção: o objetivo é justamente eliminar o iframe.

### Cuidados da opção B

O CSS do template tem seletores globais (`*`, `body`, `a`, `button`, `header`, `footer`, `aside`, `dialog`, `mark`, `h1`, `h2`), que vão colidir com o tema. Antes de embutir:

1. Envolva o conteúdo de `<body>` do template em `<div id="busca-ipt">…</div>`.
2. Prefixe todos os seletores do `<style>` com `#busca-ipt` e troque `:root` por `#busca-ipt`. Os seletores de `body` passam para `#busca-ipt`.
3. Remova do template o `<header class="topbar">` e o `<footer>`, porque a loja já tem os seus. Mantenha a frase de origem dos dados em algum lugar visível, pode ser abaixo da busca.
4. Os IDs (`q`, `grid`, `count`, `dlg`, `flab`, `ftipo`, `fcgcre`, `sort`, `more`, `notices`, `examples`, `clear`, `freset`, `factive`, `ncgcre`, `sub`, `foot`) são usados pelo JavaScript. Se houver conflito com o tema, renomeie no HTML e no JS juntos.
5. A busca grava estado na query string (`?q=`, `lab=`, `tipo=`, `cgcre=`, `ordem=`, `servico=`). Confirme que a plataforma não usa esses nomes na mesma página.
6. Aponte `<meta name="busca-dados">` (ou a constante `FONTE_DADOS`) para o endereço real do JSON.

## Etapa 3: identidade visual

- Mude apenas as variáveis de cor em `:root` (há três blocos: claro, escuro automático e `[data-theme="dark"]`) e a pilha de fontes em `body`. Use as cores e a fonte do tema da loja.
- Os botões "Solicitar serviço" usam `--primary`. O destaque de foco e os selos usam `--accent`. Mantenha contraste mínimo de 4.5:1 no texto.
- Não carregue bibliotecas de CDN para a busca. Ela não precisa de nenhuma.
- Se a loja não tiver modo escuro, pode remover os dois blocos escuros e `color-scheme`.

## Etapa 4: ajustes na página atual (`loja-15`)

1. **Banner sobrepondo o conteúdo no celular:** no print de 14/11/2026, o banner cobre o título e o parágrafo. Corrija para que ele fique no fluxo normal (`position: static`, sem margem negativa, `width: 100%; height: auto`).
2. **Texto dentro da imagem:** as instruções sobre aspas estão gravadas no banner. Retire-as da imagem ou deixe-as decorativas, e ponha o texto em HTML.
3. **Instrução desatualizada:** o banner diz que, sem aspas, o sistema procura cada palavra separadamente. Isso descreve o Scriba (várias palavras = OU). Na busca nova, várias palavras precisam aparecer todas (E). Use este texto:

   > Digite o nome do ensaio, material, norma ou laboratório. Ex.: dureza, NBR 7190, etanol. Use aspas para buscar uma expressão exata.

4. Remova o aviso "Para pesquisar no catálogo técnico do IPT pelo celular, abra a pesquisa em uma nova página" e o botão "Abrir catálogo técnico", que deixam de ser necessários.

## Regras da busca (não alterar sem autorização)

Estas regras foram validadas com Robson. "Melhorar" qualquer uma delas exige pedido explícito.

| Regra | Implementação |
|---|---|
| Ignora acento e maiúscula | `norm()` com NFD |
| Plural e início de palavra | `variantes()` e `casa()` (prefixo a partir de 3 letras) |
| Várias palavras = E | `pontuar(…,'e')`. Se nada atender, recorre a OU e mostra aviso |
| Frase entre aspas | Substring exata em nome, descrição e palavras-chave |
| Correção de digitação | Levenshtein ≤1 (≤2 para 7+ letras) contra o vocabulário do catálogo, com aviso |
| Sinônimos | `vocabulario_use.json` (ex.: AEAC → Etanol), com aviso, sem passar pela correção |
| Relevância | nome 10–14 > palavras-chave 7 > laboratório 5 > descrição 3, +8 se todos os termos estão no nome, código exato 100 |
| Exibição | Caixa alta convertida para leitura, preservando `SIGLAS`, `UNID` e `PROPRIOS`. O conteúdo não é alterado. Para corrigir uma sigla, acrescente-a à lista |
| "Solicitar serviço" | `https://www.ipt.br/faleconosco/?Manifestacao=…&Ensaio={registro}&CRD={unidade}`, em nova aba |

## Testes

```bash
npm i -D playwright && npx playwright install chromium   # uma vez
python3 -I scripts/montar_prototipo.py
node scripts/testar_busca.js                    # testa ./publicar com servidor local
node scripts/testar_busca.js https://loja.ipt.br/<caminho-da-busca>/   # após publicar
```

Os 27 testes devem passar localmente e na URL publicada. Na opção B, rode o teste contra a página da loja. Se algum seletor mudou (por exemplo, IDs renomeados), atualize o teste no mesmo commit e explique o motivo.

Verifique também, manualmente, em celular real ou emulado (360 px e 390 px): a busca aparece sem rolagem lateral, o banner não cobre nada e a janela de detalhes rola até o botão "Solicitar serviço".

## Atualização dos dados

O catálogo muda quando os laboratórios alteram o Scriba. Até haver exportação oficial:

1. Uma única requisição, no máximo uma vez por semana:
   `curl -sS -o bruto/escriba_busca_todos_AAAA-MM-DD.html --data-urlencode "TxtTermo=%" https://escriba.ipt.br/Busca_EAC/pesquisas.asp`
2. `python3 -I scripts/extrair_escriba.py bruto/escriba_busca_todos_AAAA-MM-DD.html dados`
3. `python3 -I scripts/montar_prototipo.py`
4. Rode o teste. Os itens marcados "dados:" podem mudar de valor. Atualize os números se a mudança for coerente (por exemplo, 568 → 571) e investigue se for brusca (por exemplo, 568 → 0 ou 568 → 120, que indicam mudança no HTML do Scriba).
5. Publique só `publicar/busca-servicos.json`. A página não precisa ser republicada.

Limites: não faça varredura, não envie requisições em laço, não tente outros endpoints do Scriba e não teste o campo de busca com entradas maliciosas. O Scriba é de outra equipe.

## Quando parar e perguntar

Pergunte a Robson antes de:

- publicar em produção ou substituir a página `loja-15`;
- mudar o destino do botão "Solicitar serviço" (por exemplo, para formulário ou carrinho da loja);
- alterar regras da busca, textos institucionais ou a lista de campos exibidos;
- excluir o iframe antigo antes de a busca nova estar publicada e testada;
- instalar plugin ou dependência na loja.

## Entrega esperada

Ao terminar, informe a Robson:

1. A opção de integração usada e os endereços finais (página e JSON).
2. O resultado de `testar_busca.js` local e na URL publicada (`27 ok, 0 falha(s)`).
3. Capturas em 390 px e em desktop, antes e depois.
4. Os arquivos alterados na loja e neste repositório.
5. Pendências: exportação oficial do Scriba, destino final do "Solicitar serviço" e rotina de atualização dos dados.
