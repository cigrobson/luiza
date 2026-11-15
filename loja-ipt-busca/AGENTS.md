# Instruções para o Codex: incorporar a busca do catálogo técnico à Loja IPT, tudo dentro do WordPress

## O que se quer

Substituir o iframe do Scriba na Loja IPT (https://loja.ipt.br) por uma busca própria que roda **inteira dentro do WordPress**:

| Parte | Onde fica | Como se mantém |
|---|---|---|
| Código da busca | Plugin "Busca de Serviços IPT" (`wordpress/busca-servicos-ipt.zip`, versão 1.2.0) | Plugins → Enviar plugin |
| Catálogo técnico (568 serviços, 19 laboratórios, 132 sinônimos) | Arquivo dentro do plugin e, após cada coleta, em `wp-content/uploads/busca-servicos-ipt/` | Ferramentas → Busca de Serviços IPT → "Buscar catálogo atualizado no Scriba agora" ou coleta semanal |
| Produtos da loja | WooCommerce, lidos direto do banco pelo plugin | Automático ao salvar produtos |
| Página do catálogo | Página WordPress `/catalogo-tecnico/` editada no Elementor, com o shortcode `[busca_servicos_ipt]` | Elementor |
| Visual | CSS adicional do tema (Aparência → Personalizar) | Personalizar |

O Scriba passa a ser só a **fonte** do catálogo: uma consulta de leitura à busca pública, feita pelo próprio WordPress quando um administrador pede (ou uma vez por semana, se ligado). Nenhum iframe, script externo ou servidor fora do WordPress.

Você trabalha pelo painel do WordPress, sob supervisão de Robson Santos da Silva (LID-IPT). O sistema é institucional: siga "Quando parar e perguntar". **Não reescreva a busca.** O trabalho é instalação, configuração e ajuste de páginas.

## Situação da loja (levantamento de 14 e 15/11/2026)

- WordPress 7.0, tema Kadence, Elementor Pro 4.3, WooCommerce 11.3, WPForms, servidor LiteSpeed.
- `loja-15` (página ID 565, "Loja IPT – Nova versão") é a candidata a nova página inicial. A home atual é a página 99.
- O topo da `loja-15` tem o campo "Buscar" (`#ipt-top-search`) e oito atalhos de área (`.ipt-interest`). Hoje eles **não buscam**: só rolam a página até o iframe. O script do topo também rola a página sozinho ao abrir.
- O container Elementor `70280232`, que guarda o iframe, tem margem superior de −367 px (−234 px no celular). É isso que faz o banner cobrir o título no celular.
- O H1 do topo sai quase preto sobre o fundo azul e deslocado para a esquerda, porque o Kadence sobrescreve cor e margem.
- A loja tem 24 produtos: 5 de compra direta e 19 de solicitação de serviço. Nenhum está no Scriba.

## Arquivos que você vai usar

Todos estão nesta pasta do repositório (peça a Robson se não tiver acesso):

| Arquivo | Para quê |
|---|---|
| `wordpress/busca-servicos-ipt.zip` | Plugin a instalar |
| `integracao/catalogo-tecnico-css-adicional.css` | Cores e fontes da loja aplicadas à busca |
| `integracao/loja-15-correcoes.css` | Corrige o título do topo da `loja-15` |
| `integracao/loja-15-script-topo.js` | Substitui o primeiro `<script>` do widget do topo |
| `integracao/loja-15-bloco-catalogo.html` | Bloco que entra no lugar do banner e do iframe |
| `visualizacao/loja-ipt-apos-implantacao.png` | Como as páginas devem ficar |

## Etapa 1: reconhecimento, sem alterar nada

Verifique pelo painel e informe a Robson, em até 10 linhas:

1. Se o seu usuário pode instalar plugins (Plugins → Adicionar novo → botão "Enviar plugin").
2. Se o LiteSpeed Cache está ativo e quais otimizações de JS estão ligadas (LiteSpeed Cache → Otimização de página → JS).
3. Se o slug `catalogo-tecnico` está livre (Páginas → buscar "catalogo").
4. A altura do cabeçalho fixo do Kadence (Aparência → Personalizar → Cabeçalho), para `--topo-fixo`.
5. Se há plugin de SEO (Yoast, Rank Math…).
6. Se o WP-Cron está ativo. Em Ferramentas → Saúde do site, um aviso sobre "eventos agendados" indica que não está.

**Aguarde o "ok" de Robson antes da etapa 2.**

## Etapa 2: instalar o plugin

Com autorização de Robson:

1. Plugins → Adicionar novo → Enviar plugin → escolha `busca-servicos-ipt.zip` → Instalar agora → Ativar.
2. Abra **Ferramentas → Busca de Serviços IPT** e confira:
   - Versão 1.2.0;
   - Catálogo "incluído no plugin", coleta 14/11/2026, 568 / 19 / 132;
   - Produtos da loja na busca: o número atual de produtos publicados (24 em 15/11/2026).
3. Clique em **"Buscar catálogo atualizado no Scriba agora"**. Resultado esperado: "Catálogo atualizado a partir do Scriba. Catálogo com N serviços, coletado em [hoje]". Na situação, "Catálogo técnico em uso" passa a "Arquivo enviado pela administração".
   - Se aparecer "O Scriba não respondeu", o servidor da loja não alcança `escriba.ipt.br`. A busca continua funcionando com o catálogo do plugin. Informe Robson: a equipe de infraestrutura precisa liberar a saída do servidor para esse endereço.
   - Se aparecer "Coleta não aplicada" com queda grande de serviços, o Scriba mudou ou respondeu pela metade. Nada foi substituído. Informe Robson.
4. **Não ligue** ainda a opção "Atualizar automaticamente uma vez por semana". Isso depende da etapa 7.

## Etapa 3: criar a página `/catalogo-tecnico/` como rascunho

1. Páginas → Adicionar nova. Título: **Catálogo técnico: ensaios, análises e calibrações**. Slug: `catalogo-tecnico`.
2. Kadence (painel lateral da página): layout de largura total, sem barra lateral, título da página visível como H1.
3. Editar com Elementor. Adicione **um widget "Shortcode"** com:
   ```
   [busca_servicos_ipt titulo="" tema="claro"]
   ```
   Não use widget "HTML" para a busca.
4. Salve como rascunho e abra a **Pré-visualização**.

## Etapa 4: identidade visual

Aparência → Personalizar → **CSS adicional**: cole o conteúdo de `integracao/catalogo-tecnico-css-adicional.css` e ajuste `--topo-fixo` à altura do cabeçalho medida na etapa 1. Publicar.

Não edite os arquivos do plugin: seriam perdidos na próxima atualização.

## Etapa 5: conferir a página de teste

Na pré-visualização de `/catalogo-tecnico/`, no computador e com a janela estreita, como num celular (cerca de 390 px):

| Ação | Esperado |
|---|---|
| Abrir a página | Frase "Pesquise entre 568 serviços de 19 laboratórios do IPT e 24 itens da Loja IPT" (ou os números atuais) |
| Buscar `solo` | 10 resultados; primeiro os ensaios de solo da loja, com o selo "Solicitação de serviço" e o botão "Solicitar orçamento" |
| Buscar `inclinômetro` | Itens com preço, selo "Compra direta" e o botão "Adicionar ao carrinho" |
| Buscar `dureza` | Primeiro resultado "Dureza Janka ABPM"; "Ver detalhes" abre a janela com descrição, normas e laboratório |
| Buscar `AEAC` | Aviso de sinônimo e resultados de Etanol |
| Buscar `multímtero` | Aviso "Buscando por multimetro" e 6 resultados |
| Marcar "Compra direta" em Filtros | Só os itens de compra direta |
| Janela estreita | Nenhuma rolagem lateral; filtros recolhidos; botões legíveis |
| Visual | Cores e fontes da loja; botões sem herdar o estilo do tema |

Se aparecer **"Não foi possível carregar o catálogo"**:
- Troque o shortcode por `[busca_servicos_ipt titulo="" tema="claro" fonte="rest"]`. Isso resolve quando o servidor bloqueia arquivos `.json`.
- Se persistir, em LiteSpeed Cache → Otimização de página → JS, adicione `busca-servicos-ipt/assets/busca.js` às exclusões de "Combinar", "Adiar" e "Atrasar". Não desligue a otimização do site inteiro.

Com autorização de Robson, publique a página, ainda **fora do menu**.

## Etapa 6: ajustar a `loja-15`

Com autorização de Robson. Antes, anote o número da revisão atual da página (Revisões) ou duplique-a como rascunho.

No editor Elementor da `loja-15`:

1. **Widget do topo** (o HTML com `ipt-top-search`):
   - no `<form id="ipt-top-search" ...>`, acrescente `action="/catalogo-tecnico/" method="get"`;
   - no `<input id="ipt-top-query" ...>`, acrescente `name="q"`;
   - substitua o **primeiro** `<script>` desse widget pelo conteúdo de `integracao/loja-15-script-topo.js`. Ele preserva os ajustes de títulos e selos que o script antigo fazia.
   - O arquivo não tem barras invertidas e não deve ganhar nenhuma: o editor as apaga ao salvar. Foi o que estragou a função `n()` do script atual.
2. **Remova o container inteiro `70280232`** (o do iframe), não só o widget interno. Vazio, ele continuaria puxando a seção seguinte para cima por causa da margem negativa.
3. **Remova o widget do banner** (`209515de`, imagem com texto sobre aspas), dentro do container `70678bbc`.
4. **No mesmo container `70678bbc`**, adicione um widget HTML com o conteúdo de `integracao/loja-15-bloco-catalogo.html`.
5. **Remova** o `<script>` que contém `addMobileScribaAccess`, que cria o aviso "abra a pesquisa em uma nova página".
6. **Texto:** em "Não encontrou o que precisa?", troque "mais de 100 serviços técnicos" por "mais de 560 serviços técnicos".
7. **CSS adicional:** acrescente o conteúdo de `integracao/loja-15-correcoes.css`.
8. Atualize a página, limpe o cache (LiteSpeed Cache → Purgar tudo) e confira, no computador e no celular:
   - a página abre no topo, sem rolar sozinha;
   - o título do topo está branco e centralizado;
   - digitar "dureza" e clicar em "Buscar" abre `/catalogo-tecnico/?q=dureza` com resultados;
   - o atalho "Metrologia" abre `/catalogo-tecnico/?q=calibração`;
   - o bloco "Pesquise ensaios, análises e calibrações" aparece entre os produtos e "Não encontrou o que precisa?", sem nada por cima;
   - o resultado bate com `visualizacao/loja-ipt-apos-implantacao.png`.

Os atalhos usam estas buscas. Em discussão com Robson, a lista de áreas pode mudar; não altere sem a decisão dele.

| Atalho | Abre | Resultados em 15/11/2026 |
|---|---|---|
| Solo | `?q=solo` | 10 |
| Água | `?q=água` | 50 |
| Têxteis | `?q=tecido` | 10 |
| Papel e Embalagem | `?q=papel` | 126 |
| Metrologia | `?q=calibração` | 110 |
| Energia | `?q=energia` | 60 |
| Construção | `?q=construção` | 53 |
| Materiais | `?q=materiais` | 131 |

## Etapa 7: menu e atualização semanal

Com autorização de Robson:

1. Aparência → Menus (ou cabeçalho do Kadence): acrescente **Catálogo técnico** → `/catalogo-tecnico/`, depois de "Produtos e Serviços". O item "Solicitar Orçamento" aponta para `#`; não altere sem decisão.
2. Ferramentas → Busca de Serviços IPT: marque **"Atualizar automaticamente uma vez por semana"** e salve, se Robson autorizar e o WP-Cron estiver ativo (etapa 1). O painel mostra a data da próxima coleta.
   - A coleta semanal faz uma única consulta ao Scriba. Se a resposta vier inválida ou com menos da metade dos serviços, o catálogo atual é mantido, e o motivo aparece em "Última coleta".
   - Sem WP-Cron, deixe desligado: a atualização fica manual, pelo botão.

## Manutenção depois de implantado

| Situação | O que fazer |
|---|---|
| Laboratórios mudaram serviços no Scriba | Ferramentas → Busca de Serviços IPT → "Buscar catálogo atualizado no Scriba agora" (ou aguardar a semanal) |
| Produto novo, alterado ou retirado na loja | Nada: o índice é refeito e o cache da página é limpo ao salvar |
| Produtos importados em lote | Botão "Refazer índice de produtos e limpar cache" |
| Coleta recusada | Ler a mensagem em "Última coleta" e avisar Robson. A busca segue com o catálogo anterior |
| Exportação oficial do Scriba disponível | "Enviar um arquivo de catálogo" no mesmo painel |
| Nova versão do plugin | Plugins → Enviar plugin → "Substituir a versão atual pela enviada". O catálogo coletado fica em uploads e não se perde |

## Regras da busca (não alterar sem autorização)

| Regra | Comportamento |
|---|---|
| Acentos e maiúsculas | Ignorados |
| Plural e início de palavra | `durezas` = `dureza`; `calibra` encontra calibração |
| Várias palavras | Precisam aparecer todas; se nenhum serviço tiver todas, mostra os que têm alguma e avisa |
| Aspas | Expressão exata |
| Erro de digitação | Corrigido pelo vocabulário do catálogo, com aviso |
| Sinônimos | Vocabulário controlado do Scriba (132 remissivas) |
| Ordem | Nome > palavras-chave e categorias > laboratório > descrição; itens da loja ganham prioridade leve, porque têm ação imediata |
| Itens da loja | Com preço: "Adicionar ao carrinho" ou "Ver opções". Sem preço: "Solicitar orçamento" na página do produto |
| Serviços do catálogo | "Ver detalhes" (janela) e "Solicitar serviço" (Fale Conosco do ipt.br com registro e unidade) |
| Endereços | `?q=`, `&lab=`, `&mod=compra|solicitacao`, `&tipo=`, `&cgcre=1`, `&ordem=nome|cod`, `&servico=7422` |

## Quando parar e perguntar

Pergunte a Robson antes de:

- instalar, atualizar ou desativar o plugin;
- publicar `/catalogo-tecnico/`, alterar o menu ou tornar a `loja-15` página inicial;
- editar a `loja-15` ou remover o iframe;
- ligar a coleta semanal;
- mudar o destino de "Solicitar serviço" ou de "Solicitar Orçamento";
- alterar atalhos de área, textos institucionais ou regras da busca;
- desligar cache, otimização ou segurança, ou instalar outro plugin.

Nunca edite o plugin pelo editor de plugins do WordPress, nunca cole a busca em widget HTML e nunca use iframe.

## Pendências institucionais (decisão de Robson e das áreas responsáveis)

1. **Repositório:** transferir o código para um repositório institucional do IPT/LID.
2. **Fonte oficial:** combinar com a equipe do Scriba uma exportação periódica, ou ao menos informá-la da coleta semanal (uma consulta por semana à busca pública).
3. **"Solicitar serviço":** Fale Conosco do ipt.br (atual) ou formulário WPForms da loja já preenchido com o serviço.
4. **Menu "Solicitar Orçamento":** aponta para `#`.
5. **Áreas do topo:** os oito atalhos cobrem 355 dos 568 serviços. Há proposta de oito áreas por laboratório que cobre todos; aguarda validação.
6. **Cadastro da loja:** "Ensaio de Granulometria de Solo" está em "Bionano"; três produtos estão sem categoria coerente; os cards de categorias apontam todos para `/loja/`.
7. **Textos:** submeter à comunicação os textos do bloco novo, da página do catálogo e do rodapé da busca.

## Entrega esperada

1. Versão do plugin e o que o painel mostra (catálogo em uso, data da coleta, contagens, produtos).
2. Resultado do botão "Buscar catálogo atualizado no Scriba agora".
3. Endereço de `/catalogo-tecnico/` e a tabela da etapa 5 preenchida (passou ou não, por linha).
4. Revisão de segurança da `loja-15` e lista do que foi alterado nela.
5. Capturas da `loja-15` e do catálogo, no computador e no celular.
6. Situação de cada pendência que dependa de você.

## Anexo: testes automáticos (opcional, só com terminal)

Se houver um computador com Node.js e PHP, a pasta permite testar o plugin fora da loja e a página publicada:

```bash
cd loja-ipt-busca
npm i -D playwright && npx playwright install chromium
php -S 127.0.0.1:8765 scripts/wp_simulado.php &
node scripts/testar_busca.js http://127.0.0.1:8765/loja-15/             # esperado: 35 ok, 0 falha(s)
node scripts/testar_busca.js https://loja.ipt.br/catalogo-tecnico/       # após publicar: 35 ok, 0 falha(s)
```

Para mudar o código da busca: editar `src/`, rodar `python3 -I scripts/montar_prototipo.py`, testar e enviar o `.zip` novo pelo painel.
