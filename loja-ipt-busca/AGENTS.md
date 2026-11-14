# Instruções para o agente: catálogo técnico unificado na Loja IPT (WordPress)

## Contexto

A Loja IPT (https://loja.ipt.br) roda WordPress 7.0 com tema Kadence, Elementor Pro 4.3, WooCommerce 11.3 e WPForms, em servidor LiteSpeed. Levantamento de 14/11/2026:

- A página `loja-15` (ID 565, "Loja IPT – Nova versão") é a candidata a nova página inicial. A home atual é a página 99.
- A `loja-15` é montada com widgets HTML do Elementor. O topo tem um campo "Buscar" (`#ipt-top-search`) e oito atalhos de área (`.ipt-interest`) que **não buscam nada**: só rolam a página até um iframe do Scriba (https://escriba.ipt.br/Busca_EAC/), que não funciona no celular.
- A loja tem 24 produtos WooCommerce: 5 de compra direta e 19 de solicitação de serviço (ensaios de solo, Bionano, areia normal…). Nenhum deles está no catálogo do Scriba, que tem 568 serviços de 19 laboratórios. Hoje nenhuma busca cobre as duas fontes.

O trabalho é supervisionado por Robson Santos da Silva (LID-IPT). É um sistema institucional: siga "Quando parar e perguntar".

## Decisão de arquitetura (aprovada)

1. **Página própria `/catalogo-tecnico/`** com a busca unificada (plugin, shortcode). É o endereço institucional do catálogo, citável por laboratórios, pela área comercial e pelo portal ipt.br.
2. **`loja-15` ligada ao catálogo:** o "Buscar" do topo e os atalhos de área levam a `/catalogo-tecnico/?q=termo`. O iframe sai, e no lugar dele entra um bloco curto com link para o catálogo. A página inicial não carrega os 400 KB do catálogo e deixa de ter dois campos de busca.

## O que já está pronto e testado

| Item | Situação |
|---|---|
| `wordpress/busca-servicos-ipt.zip` (v1.1.0) | Plugin com shortcode `[busca_servicos_ipt]` |
| Busca unificada | Catálogo técnico (568 serviços) + produtos WooCommerce, lidos direto do banco e entregues na página. Selos "Compra direta" e "Solicitação de serviço", filtro "Modalidade", botões "Adicionar ao carrinho", "Ver opções" ou "Solicitar orçamento" |
| Painel | Ferramentas → Busca de Serviços IPT: situação, envio de catálogo novo com validação, retorno ao catálogo do plugin, reconstrução do índice de produtos |
| Cache | Ao salvar um produto, o índice é refeito e o cache das páginas com a busca é limpo (LiteSpeed Cache e WP Rocket) |
| Isolamento do tema | CSS restrito a `#busca-ipt`, classes e IDs com prefixo `bi-`, blindagem contra estilos de elementos do tema |
| Resiliência | Se o catálogo técnico não carregar, a busca continua com os produtos e avisa |
| `integracao/` | Script do topo, bloco que substitui o iframe e CSS adicional com a paleta do Kadence |
| Testes | `scripts/testar_busca.js`: 35 verificações com produtos e 31 sem produtos. Passam na demonstração, na página avulsa e no plugin dentro do WordPress simulado (com e sem WooCommerce) |

**Não reescreva a busca.** O trabalho é de instalação e integração.

## Mapa da pasta

| Caminho | Papel |
|---|---|
| `src/busca.css`, `src/busca.js`, `src/busca.html` | Código-fonte da busca. **Edite aqui** |
| `src/wordpress/` | Código-fonte do plugin: `busca-servicos-ipt.php`, `includes/produtos.php`, `includes/admin.php`, `uninstall.php`, `readme.txt`. **Edite aqui** |
| `wordpress/busca-servicos-ipt/` e `.zip` | Plugin gerado. Não edite à mão |
| `integracao/loja-15-script-topo.js` | Substitui o primeiro `<script>` do widget do topo da `loja-15` |
| `integracao/loja-15-bloco-catalogo.html` | Substitui o widget do iframe na `loja-15` |
| `integracao/catalogo-tecnico-css-adicional.css` | CSS adicional com a identidade da loja |
| `integracao/loja-15-correcoes.css` | Corrige cor e centralização do título do topo da `loja-15` |
| `dados/servicos.json` e afins | Catálogo técnico estruturado |
| `dados/produtos_loja.json` | Amostra dos 24 produtos (14/11/2026), usada só na demonstração |
| `publicar/busca-servicos.json` | Catálogo no formato do plugin, para envio pelo painel |
| `prototipo/index.html` | Demonstração offline (catálogo + amostra de produtos) |
| `scripts/montar_prototipo.py` | `src/` + `dados/` → plugin, `publicar/`, `prototipo/` |
| `scripts/extrair_escriba.py` | HTML do Scriba → `dados/` |
| `scripts/produtos_loja.py` | Store API do WooCommerce → `dados/produtos_loja.json` (demonstração) |
| `scripts/testar_busca.js` | Teste de aceitação (Playwright) |
| `scripts/wp_simulado.php` | WordPress simulado, com WooCommerce falso alimentado pelos produtos reais e tema agressivo |

Fluxo para mudar código: editar `src/` → `python3 -I scripts/montar_prototipo.py` → testar no simulado → instalar o `.zip` novo.

## Shortcode

```
[busca_servicos_ipt titulo="" tema="claro"]
```

| Atributo | Padrão | Uso |
|---|---|---|
| `titulo` | `Ensaios, análises e calibrações` | `titulo=""` oculta; use quando a página já tem H1 |
| `subtitulo` | automático ("Pesquise entre 568 serviços de 19 laboratórios do IPT e 24 itens da Loja IPT.") | Texto fixo alternativo |
| `tema` | `claro` | `claro`, `escuro` ou `auto`. A loja não tem modo escuro: mantenha `claro` |
| `produtos` | `sim` | `nao` mostra só o catálogo técnico |
| `fonte` | `arquivo` | `rest` lê o catálogo de `/wp-json/busca-servicos-ipt/v1/dados`, se o servidor bloquear `.json` |
| `dados` | vazio | URL alternativa do catálogo, no mesmo domínio |

Parâmetros de URL aceitos pela página: `?q=`, `&lab=LME,LMM`, `&mod=compra` ou `solicitacao`, `&tipo=`, `&cgcre=1`, `&ordem=nome|cod`, `&servico=7422` (abre o detalhe).

## Etapa 1: confirmação do ambiente (sem alterar nada)

Confirme e informe a Robson, em até 10 linhas:

1. Se o plugin LiteSpeed Cache está ativo e quais otimizações de JS estão ligadas ("Load JS Deferred", "JS Combine", "Delay JS").
2. Se o seu usuário pode instalar plugins (Plugins → Adicionar novo → "Enviar plugin").
3. A altura do cabeçalho fixo do Kadence, para `--topo-fixo`.
4. Se o slug `catalogo-tecnico` está livre.
5. Se há plugin de SEO (Yoast, Rank Math…) para título e descrição da página nova.

**Aguarde o "ok" de Robson.**

## Etapa 2: testar fora do site

```bash
cd loja-ipt-busca
npm i -D playwright && npx playwright install chromium     # uma vez
php -S 127.0.0.1:8765 scripts/wp_simulado.php &
node scripts/testar_busca.js http://127.0.0.1:8765/loja-15/            # esperado: 35 ok, 0 falha(s)
node scripts/testar_busca.js "http://127.0.0.1:8765/loja-15/?semwoo=1" # esperado: 31 ok, 0 falha(s)
```

## Etapa 3: instalar o plugin (com autorização)

1. Plugins → Adicionar novo → Enviar plugin → `wordpress/busca-servicos-ipt.zip` → Instalar → Ativar.
2. Em Ferramentas → Busca de Serviços IPT, confira: catálogo "incluído no plugin", coleta 14/11/2026, 568 / 19 / 132, produtos na busca 24 (5 de compra direta) ou o número atual da loja.

## Etapa 4: criar a página `/catalogo-tecnico/` (em rascunho)

1. Páginas → Adicionar nova, editar com Elementor.
   - Título: **Catálogo técnico: ensaios, análises e calibrações**. Exiba-o como H1, pelo título do Kadence ou por um widget Título com tag H1.
   - Layout do Kadence: largura total, sem barra lateral.
   - Um widget **Shortcode** com `[busca_servicos_ipt titulo="" tema="claro"]`. Não use widget HTML para a busca.
2. Aparência → Personalizar → CSS adicional: cole `integracao/catalogo-tecnico-css-adicional.css` e ajuste `--topo-fixo` à altura do cabeçalho.
3. SEO, se houver plugin. Título: "Catálogo técnico do IPT: ensaios, análises e calibrações". Descrição: "Pesquise mais de 560 serviços de ensaio, análise e calibração dos laboratórios do IPT e os itens da Loja IPT. Filtre por laboratório, acreditação Cgcre e modalidade de atendimento."
4. Na prévia: busca carrega, cards com selos, filtros. Abra pelo celular ou emule 390 px.
5. **Com autorização de Robson**, publique a página, ainda fora do menu. Rode `node scripts/testar_busca.js https://loja.ipt.br/catalogo-tecnico/` e confirme `35 ok, 0 falha(s)`. O número de produtos é lido da própria página.
6. Se aparecer "Não foi possível carregar o catálogo", abra o console:
   - 403 ou 404 no `.json`: use `fonte="rest"`;
   - erro de script: exclua `busca-servicos-ipt/assets/busca.js` das otimizações de JS do LiteSpeed.

## Etapa 5: ajustar a `loja-15` (com autorização)

Antes de editar, anote o número da revisão atual (Revisões) ou duplique a página como rascunho.

1. **Formulário do topo:** no widget HTML do topo, acrescente ao `<form id="ipt-top-search">` os atributos `action="/catalogo-tecnico/" method="get"` e ao `<input id="ipt-top-query">` o atributo `name="q"`. Assim a busca funciona mesmo se o JavaScript falhar.
2. **Script do topo:** substitua o **primeiro** `<script>` desse widget pelo conteúdo de `integracao/loja-15-script-topo.js`. Ele leva "Buscar" e os atalhos para o catálogo e preserva os ajustes de títulos e selos que o script antigo fazia.
   - Não acrescente barras invertidas ao código: o editor as remove. O script atual já sofreu isso, e sua função `n()` contém `/s+/` no lugar de `/\s+/`.
3. **Remova:**
   - o **container inteiro** do iframe (Elementor `70280232`), não só o widget `21dc7708`. Esse container tem margem superior negativa (−367 px no desktop, −234 px no celular) para esconder o cabeçalho do Scriba atrás do banner. É a causa da sobreposição do banner sobre o título no celular. Se ficar vazio na página, ele puxa a seção "Não encontrou o que precisa?" por cima do bloco novo;
   - o widget do banner com texto gravado na imagem (`209515de`, classe `ipt-banner-scriba`, com `z-index: 20`);
   - o `<script>` `addMobileScribaAccess`, que insere o aviso "abra a pesquisa em uma nova página".
4. **No lugar do banner** (dentro do container `70678bbc`): um widget HTML com `integracao/loja-15-bloco-catalogo.html`. Confira no editor que nenhum container vizinho tem margem negativa.
5. **Texto:** em "Não encontrou o que precisa?", troque "mais de 100 serviços técnicos" por "mais de 560 serviços técnicos".
6. **Título do topo ilegível:** o H1 "Encontre a solução técnica adequada para sua necessidade" sai quase preto sobre o fundo azul e deslocado para a esquerda, porque o Kadence sobrescreve cor e margem. Cole `integracao/loja-15-correcoes.css` no CSS adicional.
7. Limpe o cache do LiteSpeed e confira em 390 px e em desktop: topo legível, atalhos, bloco novo e nenhuma rolagem automática ao abrir a página (o script antigo rolava até o iframe).

Mapa dos atalhos de área, com resultados em 14/11/2026 (catálogo + loja):

| Atalho | Busca | Resultados |
|---|---|---|
| Solo | `solo` | 10 (6 da loja) |
| Água | `água` | 50 (1 da loja) |
| Têxteis | `tecido` | 10 (1 da loja) |
| Papel e Embalagem | `papel` | 126 (4 da loja) |
| Metrologia | `calibração` | 110 (1 da loja) |
| Energia | `energia` | 60 (2 da loja) |
| Construção | `construção` | 53 |
| Materiais | `materiais` | 131 (6 da loja) |

## Etapa 6: menu (com autorização)

Aparência → Menus (ou o cabeçalho do Kadence): inclua **Catálogo técnico** → `/catalogo-tecnico/`. O item "Solicitar Orçamento" aponta para `#`; não altere sem a decisão listada em "Pendências institucionais".

## Atualização do catálogo técnico

Pelo painel, sem reinstalar o plugin:

1. Coleta, uma única requisição e no máximo uma vez por semana:
   `curl -sS -o bruto/escriba_busca_todos_AAAA-MM-DD.html --data-urlencode "TxtTermo=%" https://escriba.ipt.br/Busca_EAC/pesquisas.asp`
2. `python3 -I scripts/extrair_escriba.py bruto/escriba_busca_todos_AAAA-MM-DD.html dados`, depois `python3 -I scripts/montar_prototipo.py`.
3. Ferramentas → Busca de Serviços IPT → envie `publicar/busca-servicos.json`. O painel recusa arquivo inválido e pede confirmação se o número de serviços cair mais da metade, o que costuma indicar extração quebrada.

Os produtos não precisam de atualização manual: entram e saem conforme o WooCommerce.

Limites com o Scriba: não faça varredura nem requisições em laço, não use outros endpoints e não teste o campo de busca com entradas maliciosas. O Scriba é mantido por outra equipe.

## Regras da busca (não alterar sem autorização)

| Regra | Implementação em `src/busca.js` |
|---|---|
| Ignora acento e maiúscula | `norm()` |
| Plural e início de palavra | `variantes()`, `casa()` |
| Várias palavras = E | Se nada atender, recorre a OU e avisa |
| Frase entre aspas | Substring exata |
| Correção de digitação | Levenshtein ≤1 (≤2 para 7+ letras) no vocabulário do catálogo, com aviso |
| Sinônimos | `vocabulario_use.json` (ex.: AEAC → Etanol), com aviso |
| Relevância | nome > palavras-chave/categorias > laboratório > descrição; código do Scriba ou SKU exatos = 100; **itens da loja +4**, porque têm ação imediata |
| Ordem sem busca | Itens da loja primeiro, depois catálogo técnico em ordem alfabética |
| Itens da loja | Compra direta com preço: "Adicionar ao carrinho" (simples) ou "Ver opções" (variações). Sem preço: "Solicitar orçamento" (página do produto) |
| Serviços do catálogo | "Ver detalhes" (janela) e "Solicitar serviço" (Fale Conosco do ipt.br com registro e unidade) |
| Produtos indexados | Publicados, com visibilidade "Loja e pesquisa" ou "Somente pesquisa"; respeita "ocultar sem estoque" |

## Quando parar e perguntar

Pergunte a Robson antes de:

- instalar ou atualizar o plugin;
- publicar `/catalogo-tecnico/` ou alterar o menu;
- editar a `loja-15` ou remover o iframe;
- mudar o destino de "Solicitar serviço" ou "Solicitar Orçamento";
- alterar regras da busca, textos institucionais ou campos exibidos;
- desligar otimizações, cache ou segurança, ou instalar outro plugin;
- tornar a `loja-15` a página inicial.

Nunca edite o plugin pelo editor de plugins do WordPress, nem cole a busca em widget HTML.

## Pendências institucionais (decisão de Robson e das áreas responsáveis)

1. **Repositório institucional:** o código está num repositório pessoal. Transferir para a organização do IPT/LID e dar acesso à equipe da loja.
2. **Fonte oficial do catálogo:** combinar com a equipe do Scriba uma exportação periódica (CSV ou JSON) que substitua a coleta pela busca pública.
3. **Destino de "Solicitar serviço":** hoje vai ao Fale Conosco do ipt.br. A alternativa é um formulário WPForms da loja que chegue preenchido com o serviço. Decisão da área comercial.
4. **Menu "Solicitar Orçamento":** aponta para `#`.
5. **Categorias da loja:** "Ensaio de Granulometria de Solo" está em "Bionano", e os demais ensaios de solo em "Geotecnia e Meio Ambiente". Os oito cards de "Navegue por categorias técnicas" apontam todos para `/loja/`.
6. **Textos:** submeter à comunicação os textos do bloco novo, da página do catálogo e do rodapé da busca.
7. **Sobreposição:** se o mesmo serviço existir como produto e no catálogo técnico, aparecem dois cards. Definir qual fonte é a oficial para cada serviço.

## Entrega esperada

1. Versão do plugin ativa e números do painel.
2. Endereço de `/catalogo-tecnico/` e resultado de `testar_busca.js` nele.
3. Revisão de segurança anotada da `loja-15` e lista do que foi alterado nela.
4. Capturas da `loja-15` e do catálogo em 390 px e em desktop.
5. CSS adicional aplicado.
6. Situação de cada pendência institucional que dependa de você.
