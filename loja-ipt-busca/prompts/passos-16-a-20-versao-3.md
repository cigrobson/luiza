# PASSOS 16 a 20: versão 3 da página da Loja IPT

Origem: pedido de Robson de 17/11/2026, a partir da contraproposta do cliente (`avaliacao-contraproposta-cliente-rev1.md`) e da simulação `visualizacao/proposta-2026-11-v3/simulacao-loja-ipt-v3.html`.

Envie **um passo por vez** ao Codex, na ordem. Cada passo termina com "RESULTADO DO PASSO N" e espera o "ok" de Robson antes do seguinte.

Regras comuns a todos os passos:

- Partir do plugin **1.4.2 em produção**. Cada passo que mexe no plugin gera uma versão nova (1.4.3, 1.4.4…), com o zip enviado a Robson antes de instalar.
- Antes de alterar qualquer produto no WooCommerce, copiar para um arquivo de texto os campos atuais (título, preço, descrição, descrição curta, imagem) e entregar junto com o resultado. É o caminho de volta.
- Não alterar menu, tema, outras páginas, formulário 232 nem o snippet WPCode 560.
- Depois de cada passo: LiteSpeed Cache → Purgar tudo; `node scripts/testar_pagina.js https://loja.ipt.br/` (os testes que o próprio passo altera estão indicados).
- Autorização: Robson autorizou em 17/11/2026 a alteração do produto SAA (ID 407), dos produtos 436, 79, 81, 82 e 83 (textos de certificado), das categorias técnicas e do botão do topo. Fora disso, perguntar.

---

## PASSO 16 — SAA como solicitação de orçamento

### O que fazer

**No WooCommerce (produto 407):**

1. Imagem principal: substituir pela logomarca do SAA (arquivo `saa-logo.jpg`, 2000 × 863 px, enviado por Robson). Texto alternativo: "SAA – Monitoramento de Normas Técnicas".
2. **Descrição curta** (aparece no alto da página do produto):

   > A assinatura inclui alertas periódicos por e-mail sobre alterações nas normas de interesse, consulta presencial ao acervo do IPT, atendimento preferencial, desconto na aquisição de normas DIN. Conheça nosso serviço **SAA** e verifique as opções de assinatura do serviço e as vantagens de ser um assinante SAA do IPT. Aguardamos seu contato.

   A palavra "SAA" em "Conheça nosso serviço SAA" é um link para `https://ipt.br/saa-monitoramento-de-normas-tecnicas/`, abrindo em nova aba.
3. **Descrição** (aba "Descrição"):

   > O SAA é um serviço online do IPT que monitora e atualiza normas técnicas, regulamentos e leis, oferecendo informações sobre a última edição, erratas, emendas, suplementos, cancelamentos, substituições, projetos de revisão e equivalência entre normas. O IPT monitora normas de mais de 200 organismos normativos nacionais e internacionais. A assinatura inclui alertas periódicos por e-mail sobre alterações nas normas de interesse, consulta presencial ao acervo do IPT, atendimento preferencial, desconto na aquisição de normas e acesso simultâneo de múltiplos usuários ao sistema. O SAA é instrumento válido para auditorias de sistemas de gestão da qualidade, demonstrando o registro e controle da documentação técnica, e de sistemas de gestão de riscos, prevenindo o uso de documentos normativos desatualizados.

4. **Não apagar as variações nem os preços** do produto. O preço deixa de aparecer pelo plugin (item seguinte); assim a mudança pode ser desfeita sem recadastrar as faixas.

**No plugin (1.4.3):**

5. Nova opção no painel do plugin: "Produtos sempre sob orçamento" (lista de IDs), com valor inicial `407`. Para esses IDs:
   - modalidade "Solicitação de serviço" em todos os lugares (destaques, sugestões da busca, catálogo, filtros, abas dos destaques), com o rótulo "Valor após avaliação técnica";
   - botão "Solicitar orçamento" no lugar de "Solicitar compra";
   - preço oculto na página do produto, nos destaques, nas sugestões e no catálogo (filtro `woocommerce_get_price_html` só para esses IDs), sem o aviso "Valores sem frete";
   - página do produto sem as abas "Informação adicional" e "Avaliações" (filtro `woocommerce_product_tabs` só para esses IDs).
6. Texto do SAA no catálogo (cartão de resultado e "Ver detalhes"): usar o texto abaixo, guardado no plugin para o ID 407, no lugar da descrição curta:

   > O SAA é um serviço online do IPT que monitora e atualiza normas técnicas, regulamentos e leis, oferecendo informações sobre a última edição, erratas, emendas, suplementos, cancelamentos, substituições, projetos de revisão e equivalência entre normas. O IPT monitora normas de mais de 200 organismos normativos nacionais e internacionais. A assinatura inclui alertas periódicos por e-mail sobre alterações nas normas de interesse, consulta presencial ao acervo do IPT, atendimento preferencial, desconto na aquisição de normas e acesso simultâneo de múltiplos usuários ao sistema. O SAA é instrumento válido para auditorias de sistemas de gestão da qualidade, demonstrando o registro e controle da documentação técnica, e de sistemas de gestão de riscos, prevenindo o uso de documentos normativos desatualizados. Para mais de 1000 normas, solicite orçamento pelo formulário de contato.

7. Clique em "Solicitar orçamento" do SAA (em qualquer lugar: destaques, sugestões, catálogo, página do produto):
   - o campo de mensagem recebe, como hoje, `Pedido: SAA – Assinatura Anual de Monitoramento de Normas Técnicas (Produto IPT 407)`;
   - acima do formulário aparece um quadro com a logomarca e o texto do item 2, com o link no "SAA". O quadro é só informativo: **não entra no campo de mensagem, não cria campo obrigatório e não altera a validação nem o envio do WPForms 232**;
   - o título do bloco muda para "Solicitar orçamento";
   - "remover" na faixa "Sua busca" também apaga o quadro.

### Testes

| Ação | Esperado |
|---|---|
| Abrir `/produto/saa-assinatura-anual-de-monitoramento-de-normas-tecnicas/` | Logomarca; sem preço e sem "Valores sem frete"; descrição curta com link em "SAA" para `https://ipt.br/saa-monitoramento-de-normas-tecnicas/`; botão "Solicitar orçamento"; só a aba "Descrição", sem a frase das 1000 normas |
| Destaques | Cartão do SAA com "Solicitação de serviço", "Valor após avaliação técnica" e "Solicitar orçamento" |
| Busca: digitar `SAA` | Sugestão no grupo "sob orçamento", sem preço |
| Catálogo: filtro Modalidade "Preço definido" | O SAA não aparece |
| Clicar "Solicitar orçamento" no SAA | Mensagem `Pedido: SAA – … (Produto IPT 407)`; quadro com o texto e o link; título "Solicitar orçamento" |
| Enviar um pedido de teste do SAA | E-mail chega a loja@ipt.br com protocolo `IPT-LOJA-…`; o registro aparece no painel; depois, excluir o registro de teste |
| Outros produtos com preço (436, 346, 351, 355) | Sem mudança: preço, "Sem frete" e "Solicitar compra" |
| `testar_pagina.js` | 22 ok |

---

## PASSO 17 — Destaques: SAA em 1º, 3 orçamentos e 4 compras

### O que fazer (plugin 1.4.4)

1. `[loja_ipt_pagina]` passa a aceitar `destaques_ids` e repassa a lista a `[loja_ipt_destaques ids="…"]`. O atributo `ids` existia na 1.3.1 e mantinha a ordem dos IDs; conferir se continua igual na 1.4.2 antes de usar.
2. Opção no painel do plugin: "Destaques (IDs, na ordem)", valor inicial:

   `407,440,434,83,436,346,351,355`

   | Posição | ID | Produto | Modalidade |
   |---|---|---|---|
   | 1 | 407 | SAA – Assinatura Anual de Monitoramento de Normas Técnicas | Solicitação de serviço |
   | 2 | 440 | Diagnóstico e Análise de Risco de Queda de Árvore | Solicitação de serviço |
   | 3 | 434 | Ensaio de Emissão Radiada em Luminária e Lâmpada LED | Solicitação de serviço |
   | 4 | 83 | Areia Normal Brasileira N.100, Embalagem 25 kg | Solicitação de serviço |
   | 5 | 436 | Óleo de Silicone Dow Corning — Frasco 30 ml | Preço definido |
   | 6 | 346 | Tubo para Inclinômetro, Alumínio 4″ × 3 m | Preço definido |
   | 7 | 351 | Luva de Emenda para Inclinômetro, Alumínio 30 cm | Preço definido |
   | 8 | 355 | Tampa de Proteção para Inclinômetro, Polipropileno | Preço definido |

   Os três itens sob orçamento são de áreas diferentes (Meio Ambiente, Energia, Construção Civil), e só uma das quatro Areias Normais fica nos destaques.
3. Se um ID estiver em rascunho ou não existir, pular sem erro.
4. Imagem do SAA no cartão: mostrar inteira (`object-fit: contain`, fundo branco), sem corte.

### Testes

| Ação | Esperado |
|---|---|
| Computador | 1ª fileira: 407, 440, 434, 83, todos "Solicitar orçamento"; 2ª fileira: 436, 346, 351, 355, todos "Solicitar compra" |
| Celular (390 px) | Mesma ordem em 2 colunas; sem rolagem lateral |
| Abas "Preço definido" e "Solicitação de serviço" | Filtram 4 e 4 cartões |
| Logomarca do SAA no cartão | Inteira, sem corte |
| `testar_pagina.js` | 22 ok |

---

## PASSO 18 — Categorias: "Serviços acreditados Cgcre" no lugar de "Normas Técnicas — SAA"

### O que fazer (plugin 1.4.5)

1. Na lista `bsipt_pagina_categorias()`, trocar o cartão "Normas Técnicas — SAA / Monitoramento de normas" por:
   - Título: **Serviços acreditados Cgcre**
   - Linha: **"N serviços com acreditação Cgcre/Inmetro"**, com N calculado do catálogo carregado (hoje 101 de 568), não escrito à mão.
   - Ícone: escudo com marca de verificação (diferente do ícone de Certificação de Produto).
   - Ação: novo tipo `filtro-cgcre`, que liga o filtro "Somente com certificado Cgcre" e rola até os resultados, como os outros cartões de filtro. Endereço do link: `?cgcre=1#catalogo`.
2. O cartão fica na mesma posição (1º da primeira fileira).
3. **Manter** "Normas Técnicas — SAA" como opção do filtro "Tipo de solução" no catálogo. Só o cartão sai.
4. Atualizar a tabela "Comportamentos que não devem ser alterados" do `AGENTS.md` (categorias técnicas) com a nova lista.

### Testes

| Ação | Esperado |
|---|---|
| Clicar "Serviços acreditados Cgcre" | Resultados com o chip "Somente com certificado Cgcre" e a mesma contagem do cartão (hoje 101) |
| Abrir `https://loja.ipt.br/?cgcre=1#catalogo` | Mesmo resultado |
| Filtro "Tipo de solução" no catálogo | "Normas Técnicas — SAA" continua disponível |
| `testar_pagina.js` | O teste "6 categorias filtram a busca com ids válidos" precisa aceitar o novo tipo; ajustar o teste e informar |

---

## PASSO 19 — Topo sem botão de busca; sugestões fixas recolhidas

### O que fazer (plugin 1.4.6)

1. Retirar do `[loja_ipt_topo]` o link `.lip-cta` ("Buscar ensaios e calibrações"), **sem substituto**.
2. Suprimir o espaço que ele ocupava: o subtítulo fica a uma distância normal da linha "Áreas técnicas" (a mesma usada entre título e subtítulo). Conferir no computador e em 390 px.
3. A busca "Busca de ensaios, análises e calibrações" continua onde está e passa a ser a única da página.
4. Ocultar a faixa de 24 sugestões fixas (`#bi-examples`) até o cliente focar ou digitar na caixa. As sugestões ao digitar continuam iguais.

### Testes

| Ação | Esperado |
|---|---|
| Abrir a página | Topo com selo, título, subtítulo e 8 áreas; nenhum botão de busca no topo |
| Contar caixas e botões de busca na página | 1 |
| Abrir a página sem clicar em nada | Faixa de sugestões fixas oculta |
| Clicar na caixa de busca | Sugestões aparecem; digitar `inclinôm` mostra os grupos atuais |
| Áreas técnicas e categorias | Continuam filtrando e rolando até os resultados |
| `testar_pagina.js` | O teste "Buscar ensaios e calibrações leva o foco à caixa de busca" deixa de existir; substituir por "topo sem botão de busca e 1 caixa de busca na página" e informar |

---

## PASSO 20 — Certificados "emitidos pelo IPT", sem sigla de laboratório

### O que fazer

**No WooCommerce:**

| Produto | Onde | Trocar | Por |
|---|---|---|---|
| 436 Óleo de Silicone | Descrição curta | "certificado de calibração emitido pelo LGE/IPT" | "certificado de calibração emitido pelo IPT" |
| 436 Óleo de Silicone | Descrição | "certificado de calibração emitido pelo Laboratório de Gestão de Energia (LGE) do Instituto de Pesquisas Tecnológicas do Estado de São Paulo (IPT)" | "certificado de calibração emitido pelo Instituto de Pesquisas Tecnológicas do Estado de São Paulo (IPT)" |
| 79, 81, 82, 83 Areia Normal Brasileira | Descrição e descrição curta | "certificado de conformidade do LMPC" | "certificado de conformidade emitido pelo IPT" |

Procurar também, nos 24 produtos, qualquer outra ocorrência de "certificado" seguida de sigla de laboratório (LARI, LBE, LBI, LCAP, LCP, LCPE, LEL, LGE, LME, LMM, LMPC, LPP, LQM, LRM, LSFEX, LTDC, LV, NUTABES, SIRGA) e listar antes de trocar.

**No catálogo do plugin:**

- Depois das trocas, regenerar o índice da busca (`busca-servicos.json`) para que sugestões, cartões e "Ver detalhes" mostrem os textos novos.
- Nos 568 serviços do Scriba (coleta de 14/11/2026) não há "certificado" seguido de sigla. Como a coleta do Scriba sobrescreve o texto, não editar os serviços à mão: se uma coleta futura trouxer esse padrão, o relatório da coleta deve apontar.
- Os códigos de acreditação ("Cgcre CAL 0003") **continuam**: são números da acreditação, não siglas de laboratório.
- Repositório: a base do agente de IA (`agente-ia/`) e `dados/produtos_loja.json` já foram atualizados em 17/11/2026 com os mesmos textos.
- O campo "Laboratório" do "Ver detalhes" dos serviços continua (é a informação do laboratório responsável, não do certificado).

### Testes

| Ação | Esperado |
|---|---|
| Páginas dos produtos 436, 79, 81, 82, 83 | "emitido pelo IPT"; nenhuma sigla junto de "certificado" |
| Busca `óleo de silicone` e `areia normal` | Cartões e "Ver detalhes" com o texto novo |
| `curl -s` no `busca-servicos.json` + busca por `emitido pelo LGE` e `do LMPC` | 0 ocorrências |
| `testar_pagina.js` | 22 ok |

---

## Pontos que Robson precisa confirmar antes do envio

1. **"Aguardemos seu contato"** foi escrito como "Aguardamos seu contato" (o IPT aguarda o contato do cliente). Confirmar.
2. **Frase das 1000 normas:** o cliente pediu para apagá-la; o texto indicado por Robson para o catálogo (PASSO 16, item 6) a mantém. A versão acima segue Robson: sai da página do produto e fica no catálogo.
3. **Abas da página do SAA:** o cliente pediu só a retirada de "Informação adicional"; o PASSO 16 retira também "Avaliações", que não tem uso no modo vitrine.
4. **Cartão Cgcre:** escolhido entre os dados do catálogo porque usa um filtro que já existe (`?cgcre=1`) e cobre 101 serviços de 10 laboratórios. Alternativa, se Robson preferir: "Ensaios antimicrobianos e de biodegradabilidade" (7 produtos da categoria Bionano na loja).
5. **Produto 434 (Ensaio de Emissão Radiada):** a descrição diz "Realizado pelo LGE/IPT" e cita o Laboratório de Gestão de Energia (LGE). Não é certificado (é relatório de ensaio), por isso ficou fora do PASSO 20. Confirmar se a regra "sem sigla" vale também para esse caso.
