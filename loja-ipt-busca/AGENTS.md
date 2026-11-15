# Instruções para o Codex: novo layout da página loja-15 da Loja IPT

## Escopo (regra principal)

**Só a página https://loja.ipt.br/loja-15/ muda.** Não altere menu, tema, CSS adicional do tema, outras páginas, produtos ou categorias do WooCommerce. A única ação fora da página é instalar o plugin, que não aparece em nenhum lugar onde seus shortcodes não forem usados.

Trabalho supervisionado por Robson Santos da Silva (LID-IPT). Siga "Quando parar e perguntar".

## O que será feito

Substituir o conteúdo atual da `loja-15` (topo com atalhos, categorias antigas, iframe do Scriba, banner, formulário e bloco institucional) pelo layout aprovado, entregue pelo plugin **Busca de Serviços IPT 1.3.0** (`wordpress/busca-servicos-ipt.zip`):

| Seção | Shortcode | O que faz |
|---|---|---|
| Topo + Áreas técnicas | `[loja_ipt_topo]` | "Buscar ensaios e calibrações" leva à caixa de busca; as 8 áreas filtram a busca da própria página |
| Categorias técnicas | `[loja_ipt_categorias]` | 6 filtram a busca; Certificação de Produto vai ao formulário com o assunto preenchido; Ensino Tecnológico abre https://sapiens.ipt.br/index_new.aspx |
| Produtos e serviços em destaque | `[loja_ipt_destaques limite="8"]` | Produtos reais da loja; abas Todos / Compra direta / Solicitação de serviço |
| Busca de ensaios, análises e calibrações | `[busca_servicos_ipt layout="vitrine"]` | Substitui o iframe do Scriba: 568 serviços + produtos, sugestões ao digitar, catálogo completo com filtros |
| Não encontrou o que precisa? | `[loja_ipt_contato form="232"]` | O formulário WPForms 232 que já existe na página, com a faixa "Sua busca" |
| Referência nacional | `[loja_ipt_institucional]` | Bloco institucional e links SIC SP, Privacidade e Termos |
| **Tudo junto** | **`[loja_ipt_pagina form="232"]`** | **As seis seções na ordem acima. É o que vai na página** |

Referência visual: `visualizacao/loja-15-nova-computador.png`, `visualizacao/loja-15-nova-celular.png` e `visualizacao/loja-15-nova-busca-sugestoes.png`.

## Etapa 1: reconhecimento, sem alterar nada

Informe a Robson, em até 8 linhas:

1. Se o seu usuário pode instalar plugins (Plugins → Adicionar novo → "Enviar plugin").
2. Se o LiteSpeed Cache está ativo e quais otimizações de JS e CSS estão ligadas.
3. Se o cabeçalho do Kadence é fixo e a altura dele em px.
4. O ID do formulário WPForms usado hoje na `loja-15` (esperado: 232) e se ele é usado em outras páginas.
5. Se o Elementor permite "Salvar rascunho" na `loja-15` sem publicar (página já publicada).

**Aguarde o "ok" de Robson.**

## Etapa 2: instalar o plugin (com autorização)

1. Plugins → Adicionar novo → Enviar plugin → `busca-servicos-ipt.zip` → Instalar → Ativar. Se já houver uma versão, aceite "Substituir a versão atual pela enviada".
2. Ferramentas → Busca de Serviços IPT: confira a versão 1.3.0, 568 / 19 / 132 e o número de produtos. Clique em **"Buscar catálogo atualizado no Scriba agora"**.
   - "O Scriba não respondeu": o servidor não alcança `escriba.ipt.br`. A página funciona com o catálogo do plugin. Avise Robson.
3. Não ligue a coleta semanal sem autorização.

Nada muda no site depois desta etapa: os shortcodes ainda não estão em nenhuma página.

## Etapa 3: guardar a versão atual da loja-15

No Elementor da `loja-15`: menu ☰ → **Salvar como modelo** → nome `loja-15 antes do layout novo (AAAA-MM-DD)`. Anote também o número da revisão atual (Revisões). É o caminho de volta.

## Etapa 4: montar o layout novo (com autorização)

No Elementor da `loja-15`:

1. Apague **todos** os contêineres e widgets atuais da página: topo, categorias, produtos, banner, container do iframe (`70280232`, com margem negativa), formulário e bloco institucional. Todos passam a vir do shortcode. Manter o formulário antigo duplicaria o WPForms 232.
2. Adicione **um contêiner** de largura total, com preenchimento 0 e espaçamento 0.
3. Dentro dele, um widget **Shortcode** com:
   ```
   [loja_ipt_pagina form="232"]
   ```
   Use o ID real do formulário, se for outro. Não use widget HTML.
4. Se o cabeçalho for fixo: ⚙ Configurações da página → Avançado → **CSS personalizado** → cole `integracao/loja-15-css-pagina.css`, trocando 96px pela altura medida na etapa 1. Esse CSS vale só para esta página.
5. Clique em **"Salvar rascunho"** (não em "Atualizar") e abra **"Visualizar alterações"**.

## Etapa 5: conferir na pré-visualização

No computador e com a janela estreita (cerca de 390 px):

| Ação | Esperado |
|---|---|
| Abrir a página | Topo azul-escuro com 8 áreas; categorias; destaques com fotos; busca escura; formulário; bloco institucional. A página abre no topo e os resultados da busca ficam ocultos |
| "Buscar ensaios e calibrações" | Rola até a caixa de busca, com o cursor nela |
| Digitar `inclinôm` | Sugestões: "Compra direta · preço fixo" (3 itens com preço) e "Serviços técnicos · sob orçamento" (transdutor de deslocamento angular, Cgcre CAL 0003) |
| Enter | Abre o catálogo completo abaixo, com 4 resultados e filtros |
| Área "Metrologia e Calibração" | Rola até os resultados filtrados, com o chip "Área: Metrologia e Calibração" |
| Categoria "Calibrações" | 111 resultados |
| Categoria "Certificação de Produto" | Rola até o formulário, com "Assunto: Certificação de produto" e a mensagem iniciada |
| "remover" na faixa do formulário | Faixa e texto inserido somem |
| Categoria "Ensino Tecnológico" | Abre o Sapiens em nova aba |
| Abas dos destaques | "Compra direta" e "Solicitação de serviço" filtram os cards |
| Celular | Sem rolagem lateral; áreas em 2 colunas; destaques em 2 colunas |

Se aparecer "Não foi possível carregar o catálogo", use `[loja_ipt_pagina form="232" fonte="rest"]` (o servidor pode estar bloqueando arquivos `.json`). Se houver erro de script, exclua `busca-servicos-ipt/assets/busca.js` das otimizações de JS do LiteSpeed, só esse arquivo.

## Etapa 6: publicar (com autorização expressa de Robson)

1. Com o "ok" de Robson sobre a pré-visualização, clique em **"Atualizar"**.
2. LiteSpeed Cache → Purgar tudo, ou purgar só a `loja-15`.
3. Se houver terminal disponível: `node scripts/testar_pagina.js https://loja.ipt.br/loja-15/` deve dar `22 ok, 0 falha(s)`.
4. Envie a Robson as capturas no computador e no celular.

**Para voltar atrás:** Elementor → apagar o contêiner novo → Inserir modelo → `loja-15 antes do layout novo` → Atualizar. Ou restaure a revisão anotada.

## Comportamentos que não devem ser alterados sem autorização

| Item | Comportamento |
|---|---|
| Áreas técnicas | Papel e Embalagem; Metrologia e Calibração; Construção Civil; Energia e Conforto Ambiental; Bioenergia e Combustíveis; Segurança ao Fogo; Química e Processos; Meio Ambiente, Geotecnia e Biotecnologia. Definidas pelos laboratórios do catálogo; cobrem os 568 serviços |
| Categorias técnicas | Ensaios e Análises; Calibrações; Materiais de Referência; Normas Técnicas — SAA; Diagnósticos e Laudos; Consultoria e Desenvolvimento; Certificação de Produto (formulário); Ensino Tecnológico (Sapiens) |
| Produtos | Área e tipo de cada produto vêm do mapa em `src/busca.js` (`AREAS`, `PRODUTO_AREA`, `PRODUTO_SOLUCAO`). Nada é gravado no WooCommerce |
| Endereços | `?area=`, `?solucao=`, `?q=`, `&mod=`, `&cgcre=1`, `&servico=`; âncoras `#catalogo` e `#contato` |
| Busca | Ignora acentos; plural; várias palavras = E; aspas = expressão exata; correção de digitação; sinônimos do Scriba |

Para mudar nomes ou enquadramentos: editar `src/busca.js` (mapa) e `src/wordpress/includes/pagina.php` (textos e links), rodar `python3 -I scripts/montar_prototipo.py` e testar.

## Quando parar e perguntar

Pergunte a Robson antes de:

- instalar ou atualizar o plugin;
- salvar qualquer alteração na `loja-15`, inclusive o rascunho;
- publicar ("Atualizar");
- mexer em qualquer coisa fora da `loja-15`: menu, tema, outras páginas, produtos, formulários;
- ligar a coleta semanal do Scriba;
- desligar otimizações, cache ou segurança.

Nunca edite o plugin pelo editor de plugins, nunca use iframe e nunca cole a busca em widget HTML.

## Pendências institucionais (decisão de Robson)

1. Textos do layout para validação da comunicação. Em especial: "+1.000 profissionais", "Empresa pública vinculada à SCTI-SP" e "A solicitação vai ao laboratório responsável" (depende de como o WPForms 232 encaminha as mensagens).
2. Botão "Solicitar orçamento" dos serviços do catálogo: hoje vai ao Fale Conosco do ipt.br, com registro e unidade. A alternativa é o formulário da própria página.
3. Areia Normal Brasileira: na loja, é "solicitação de serviço" (sem preço); a proposta original mostrava "compra direta".
4. Repositório do código: transferir para um repositório institucional.
5. Exportação oficial do catálogo pelo Scriba.

## Anexo: testes automáticos (opcional, com Node.js e PHP)

```bash
cd loja-ipt-busca
npm i -D playwright && npx playwright install chromium
php -S 127.0.0.1:8765 scripts/wp_simulado.php &
node scripts/testar_pagina.js 'http://127.0.0.1:8765/loja-15/?limpo=1&sc=[loja_ipt_pagina form="232"]'   # 22 ok
node scripts/testar_busca.js http://127.0.0.1:8765/loja-15/                                              # 46 ok
```
