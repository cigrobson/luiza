# Instruções para o agente: integrar a busca de serviços na Loja IPT (WordPress)

## Contexto

A Loja IPT é um site WordPress. A página https://loja.ipt.br/loja-15/ exibe o catálogo de ensaios, análises e calibrações por meio de um iframe apontando para o Scriba (https://escriba.ipt.br/Busca_EAC/). O Scriba é ASP clássico de 2017, sem layout responsivo. Por isso a página hoje pede que usuários de celular abram a busca em outra aba.

Esta pasta contém uma busca nova, independente do Scriba, empacotada como **plugin WordPress** com shortcode. Os dados (568 serviços, 19 laboratórios e 132 sinônimos) foram extraídos do catálogo público em 14/11/2026. A tarefa é instalar o plugin, substituir o iframe pelo shortcode e ajustar a página.

O trabalho é supervisionado por Robson Santos da Silva (LID-IPT). Siga a seção "Quando parar e perguntar".

## O que já está pronto e testado

| Item | Situação |
|---|---|
| `wordpress/busca-servicos-ipt.zip` | Plugin pronto para Plugins → Adicionar novo → Enviar plugin |
| Shortcode `[busca_servicos_ipt]` | Renderiza a busca completa: campo, filtros, cards, detalhes |
| Isolamento do tema | CSS restrito a `#busca-ipt`, classes e IDs com prefixo `bi-`, blindagem contra seletores de elemento do tema (`button`, `input`, `label`, `dialog`…). Validado contra um tema que imita Bootstrap/Elementor |
| Responsividade | Responde à largura da área de conteúdo, não da tela. Em áreas abaixo de 860 px empilha filtros e resultados e recolhe os filtros |
| Dados | `assets/busca-servicos.json` dentro do plugin, com rota REST alternativa |
| Testes | `scripts/testar_busca.js`: 30 verificações, todas passando nas versões avulsa, plugin com JSON, plugin com REST e URL com `?page_id=` |

**Não reescreva a busca.** O trabalho é de integração.

## Mapa da pasta

| Caminho | Papel |
|---|---|
| `src/busca.css`, `src/busca.js`, `src/busca.html` | Código-fonte da busca. **Edite aqui** |
| `src/wordpress/busca-servicos-ipt.php`, `readme.txt` | Código-fonte do plugin. **Edite aqui** |
| `wordpress/busca-servicos-ipt/` e `.zip` | Plugin gerado. Não edite à mão |
| `publicar/` | Versão em página avulsa (fora do WordPress). Gerada |
| `prototipo/index.html` | Demonstração offline com dados embutidos. Gerada |
| `dados/` | Catálogo estruturado (JSON e CSV). Só pelos scripts |
| `scripts/montar_prototipo.py` | `src/` + `dados/` → `wordpress/`, `publicar/`, `prototipo/` |
| `scripts/extrair_escriba.py` | HTML do Scriba → `dados/` |
| `scripts/testar_busca.js` | Teste de aceitação (Playwright) |
| `scripts/wp_simulado.php` | WordPress simulado com tema agressivo, para testar o plugin sem instalar WordPress |

Fluxo para qualquer mudança de código: editar `src/` → `python3 -I scripts/montar_prototipo.py` → testar (abaixo) → instalar o `.zip` novo.

## Shortcode

```
[busca_servicos_ipt titulo="" tema="claro"]
```

| Atributo | Padrão | Uso |
|---|---|---|
| `titulo` | `Ensaios, análises e calibrações` | `titulo=""` oculta o título (use na `loja-15`, que já tem título próprio). Quando exibido, sai como `<h2>` |
| `subtitulo` | Frase automática "Pesquise entre 568 serviços…" | Texto fixo alternativo |
| `tema` | `claro` | `claro`, `escuro` ou `auto`. Mantenha `claro` se o site não tiver modo escuro, senão a busca escurece sozinha dentro de uma página branca |
| `fonte` | `arquivo` | `rest` lê os dados de `/wp-json/busca-servicos-ipt/v1/dados`. Use se o servidor bloquear `.json` em `wp-content` |
| `dados` | vazio | URL alternativa do JSON, no mesmo domínio |

## Etapa 1: reconhecimento (sem alterar nada)

Levante e informe a Robson, em até 12 linhas:

1. Versão do WordPress e do PHP (o plugin exige WP 5.8+ e PHP 7.4+).
2. Tema ativo e se há construtor de páginas (Gutenberg, Elementor, Divi, WPBakery…).
3. Como a `loja-15` foi montada: qual bloco ou widget contém o iframe, o banner e o botão "Abrir catálogo técnico".
4. Plugins de cache e otimização (WP Rocket, LiteSpeed Cache, W3 Total Cache, Autoptimize, SiteGround Optimizer…) e de segurança (Wordfence, iThemes…).
5. Se o usuário atual pode instalar plugins (Plugins → Adicionar novo → botão "Enviar plugin"). Em WordPress gerenciado ou multisite isso pode estar bloqueado.
6. Se o cabeçalho do tema é fixo (sticky) e qual a altura dele.
7. Se existe modelo de página de largura total no tema.

**Aguarde o "ok" de Robson antes da etapa 2.**

## Etapa 2: testar o plugin fora do site (opcional, recomendado)

```bash
cd loja-ipt-busca
npm i -D playwright && npx playwright install chromium     # uma vez
php -S 127.0.0.1:8765 scripts/wp_simulado.php &
node scripts/testar_busca.js http://127.0.0.1:8765/loja-15/   # esperado: 30 ok, 0 falha(s)
```

## Etapa 3: instalar e testar numa página de teste

1. Instale `wordpress/busca-servicos-ipt.zip`:
   - painel: Plugins → Adicionar novo → Enviar plugin → escolher o `.zip` → Instalar → Ativar;
   - ou WP-CLI: `wp plugin install busca-servicos-ipt.zip --activate`;
   - ou SFTP: descompactar em `wp-content/plugins/` e ativar no painel.
2. Crie uma página de teste, sem link no menu, com slug `teste-busca-servicos`, contendo só o bloco **Shortcode** (Gutenberg) ou o widget **Shortcode** (Elementor) com `[busca_servicos_ipt titulo="" tema="claro"]`. Use o modelo de página do tema que será usado na `loja-15`.
3. Verifique, na prévia, se a busca carrega. Se aparecer "Não foi possível carregar o catálogo", abra o console do navegador:
   - 403 ou 404 no `busca-servicos.json`: use `fonte="rest"`;
   - erro de script: veja "Cache e otimização".
4. Para rodar `testar_busca.js`, a página precisa estar acessível sem login. **Peça autorização a Robson** para publicá-la temporariamente (se houver plugin de SEO, marque "noindex"). Rode `node scripts/testar_busca.js https://loja.ipt.br/teste-busca-servicos/` e confirme `30 ok, 0 falha(s)`. Depois volte a página para rascunho ou exclua.
5. Confira manualmente em 390 px e em desktop: a busca não tem rolagem lateral, a janela "Ver detalhes" abre centralizada e larga, e os botões não herdaram estilo do tema.

## Etapa 4: substituir o iframe na `loja-15`

Só depois de a etapa 3 passar e com autorização de Robson.

1. Antes de editar, anote o número da revisão atual da página (Revisões) ou duplique a página como rascunho de segurança.
2. Remova o bloco ou widget do iframe do Scriba.
3. No mesmo lugar, insira um bloco/widget **Shortcode** com `[busca_servicos_ipt titulo="" tema="claro"]`.
   - Não use bloco "HTML personalizado" nem cole `<script>`: o WordPress remove scripts de usuários sem `unfiltered_html`, e plugins de otimização costumam quebrá-los.
4. Remova o aviso "Para pesquisar no catálogo técnico do IPT pelo celular, abra a pesquisa em uma nova página" e o botão "Abrir catálogo técnico".
5. Se o tema tiver modelo de largura total, use-o nesta página. A busca mostra filtros ao lado dos resultados a partir de 860 px de área útil. Abaixo disso, empilha.

## Etapa 5: banner e textos da `loja-15`

1. **Banner sobrepondo o conteúdo no celular:** no print de 14/11/2026, o banner cobre o título e o parágrafo. Verifique no bloco/seção do banner se há posição absoluta, margem negativa, altura fixa ou "sobreposição" (recurso comum no Elementor). Deixe o banner no fluxo normal da página (`width: 100%; height: auto`).
2. **Texto dentro da imagem:** as instruções sobre aspas estão gravadas no banner. Peça a Robson a versão da arte sem esse texto, ou recorte a imagem, e coloque o texto em HTML, abaixo do banner.
3. **Instrução desatualizada:** o banner diz que, sem aspas, o sistema procura cada palavra separadamente. Isso descreve o Scriba (várias palavras = OU). Na busca nova, várias palavras precisam aparecer todas (E). Use este texto:

   > Digite o nome do ensaio, material, norma ou laboratório. Ex.: dureza, NBR 7190, etanol. Use aspas para buscar uma expressão exata.

## Etapa 6: identidade visual

Não edite os arquivos do plugin no servidor: serão sobrescritos na próxima atualização. Sobrescreva as variáveis no **CSS adicional** (Aparência → Personalizar → CSS adicional, ou CSS personalizado do Elementor/tema):

```css
#busca-ipt {
  --primary: #1d3557;      /* botão "Solicitar serviço", siglas */
  --primary-ink: #ffffff;  /* texto sobre --primary */
  --accent: #01adef;       /* foco, links, destaques */
  --accent-soft: #e3f6fe;  /* fundo de avisos e anel de foco */
  --bg: transparent;       /* fundo do bloco; transparent herda o da página */
  --surface: #ffffff;      /* cards e painel de filtros */
  --radius: 12px;          /* cantos dos cards */
  --topo-fixo: 90px;       /* altura do cabeçalho fixo do tema + folga */
  /* --fonte: "Montserrat", sans-serif;  por padrão a busca herda a fonte do tema */
}
```

Use as cores reais do tema (inspecione o cabeçalho e os botões da loja). Mantenha contraste mínimo de 4.5:1 entre texto e fundo.

## Cache e otimização

- Limpe o cache do site (e da CDN, se houver) depois de instalar ou atualizar o plugin.
- Se a busca não iniciar com "Atrasar JavaScript", "Combinar JS" ou similares ligados, exclua `busca-servicos-ipt/assets/busca.js` dessas otimizações. Não desligue a otimização do site inteiro.
- Os arquivos do plugin levam `?ver=` com a data de modificação, então o navegador recebe a versão nova sozinho.

## Atualização do catálogo

Até haver exportação oficial do Scriba:

1. Uma única requisição, no máximo uma vez por semana:
   `curl -sS -o bruto/escriba_busca_todos_AAAA-MM-DD.html --data-urlencode "TxtTermo=%" https://escriba.ipt.br/Busca_EAC/pesquisas.asp`
2. `python3 -I scripts/extrair_escriba.py bruto/escriba_busca_todos_AAAA-MM-DD.html dados`
3. Aumente a versão em `src/wordpress/busca-servicos-ipt.php`, nos dois lugares (`Version:` e `BSIPT_VERSAO`), e em `src/wordpress/readme.txt` (`Stable tag`).
4. `python3 -I scripts/montar_prototipo.py`, depois teste com o WordPress simulado. Os itens marcados "dados:" no teste podem mudar de valor. Atualize-os se a mudança for coerente (568 → 571) e investigue se for brusca (568 → 0 ou 568 → 120, que indicam mudança no HTML do Scriba).
5. Envie o `.zip` novo em Plugins → Adicionar novo → Enviar plugin. O WordPress oferece "Substituir a versão atual pela enviada". Ou substitua só `wp-content/plugins/busca-servicos-ipt/assets/busca-servicos.json` por SFTP.
6. Limpe o cache.

Limites: não faça varredura, não envie requisições em laço, não use outros endpoints do Scriba e não teste o campo de busca do Scriba com entradas maliciosas. O Scriba é mantido por outra equipe.

## Regras da busca (não alterar sem autorização)

| Regra | Implementação em `src/busca.js` |
|---|---|
| Ignora acento e maiúscula | `norm()` com NFD |
| Plural e início de palavra | `variantes()` e `casa()` (prefixo a partir de 3 letras) |
| Várias palavras = E | `pontuar(…,'e')`. Se nada atender, recorre a OU e mostra aviso |
| Frase entre aspas | Substring exata em nome, descrição e palavras-chave |
| Correção de digitação | Levenshtein ≤1 (≤2 para 7+ letras) contra o vocabulário do catálogo, com aviso |
| Sinônimos | `vocabulario_use.json` (ex.: AEAC → Etanol), com aviso |
| Relevância | nome 10–14 > palavras-chave 7 > laboratório 5 > descrição 3, +8 se todos os termos estão no nome, código exato 100 |
| Exibição | Caixa alta convertida para leitura, preservando `SIGLAS`, `UNID` e `PROPRIOS`. O conteúdo não muda. Para corrigir uma sigla, acrescente-a à lista |
| "Solicitar serviço" | `https://www.ipt.br/faleconosco/?Manifestacao=…&Ensaio={registro}&CRD={unidade}`, em nova aba |
| Estado na URL | `q`, `lab`, `tipo`, `cgcre`, `ordem`, `servico`. Demais parâmetros (ex.: `page_id`) são preservados |

## Quando parar e perguntar

Pergunte a Robson antes de:

- instalar ou atualizar o plugin no site;
- publicar a página de teste, mesmo temporariamente;
- editar a `loja-15` ou remover o iframe antigo;
- mudar o destino do botão "Solicitar serviço" (por exemplo, para formulário ou carrinho da loja);
- alterar regras da busca, textos institucionais ou campos exibidos;
- desativar plugins de cache, otimização ou segurança;
- instalar qualquer outro plugin.

Nunca edite arquivos do plugin pelo editor de plugins do WordPress, nem cole `<script>` em blocos de HTML.

## Entrega esperada

1. Plugin instalado e ativo (versão) e o atributo do shortcode usado na `loja-15`.
2. Resultado de `testar_busca.js` na página de teste ou na `loja-15` (`30 ok, 0 falha(s)`).
3. Capturas da `loja-15` em 390 px e em desktop, antes e depois.
4. CSS adicional aplicado (variáveis e valores).
5. Revisão de segurança anotada da `loja-15`.
6. Pendências: exportação oficial do Scriba, destino final do "Solicitar serviço", arte do banner sem texto e rotina de atualização dos dados.
