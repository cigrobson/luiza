# Avaliação da contraproposta do cliente (LOJA_VIRTUAL_IPT_Alteracoes_rev_1.docx)

Data: 17/11/2026. Base: site em produção (plugin 1.4.2), conferido com Playwright no computador (1366 px) e no celular (390 px). Capturas em `visualizacao/ux-2026-11/`.

## 1. Conferência do diagnóstico do cliente

| Afirmação do documento | Situação no site | Conclusão |
|---|---|---|
| O botão "Buscar ensaios e calibrações" só rola até a busca | Confirmado: o botão leva o foco à caixa `#bi-q`, cerca de 1.250 px abaixo no computador | Procede |
| Há muitas sugestões abaixo da busca | 24 sugestões fixas visíveis antes de qualquer digitação | Procede |
| Cada resultado repete unidade e laboratório | O cartão mostra sigla e nome do laboratório (ex.: "LCPE · Laboratório de Celulose, Papel e Embalagem"); o detalhe ("Ver detalhes") repete a informação | Procede. O cliente não viu os cartões; foram verificados aqui |
| Cinco filtros | Confirmado: Área técnica, Tipo de solução, Acreditação, Modalidade, Laboratório (19 opções) | Procede |
| Filtros sem quantidade e Modalidade sem explicação | Na 1.4.2 cada opção já mostra a quantidade, e a Modalidade já tem subtítulo ("Pedido pelo formulário"; "Avaliação técnica e orçamento") | Não procede para a versão atual; vale ajustar o texto |
| Não há carrinho nem pagamento | Confirmado (decisão "vitrine com pedido manual") | Procede |
| Não se informa o que acontece após o envio | Confirmado: não há prazo de resposta nem menção ao protocolo antes do envio | Procede |

## 2. Avaliação por mudança

| Mudança | Parecer | Observação técnica | Esforço |
|---|---|---|---|
| 1. Busca única na primeira tela, sugestões recolhidas | Concordo | Mover a mesma caixa de busca para o topo azul, no lugar do botão. As sugestões aparecem ao focar ou digitar (padrão "combobox" da WAI-ARIA APG). Os resultados continuam abrindo no catálogo. O teste automático "botão leva o foco à busca" precisa ser substituído | Médio |
| 2. Resultados sem laboratório | Concordo | Em `dados/servicos.json` não há dois serviços com o mesmo nome em laboratórios diferentes, então tirar o laboratório do cartão não gera ambiguidade. O laboratório continua no detalhe. Sugere-se manter no cartão: nome, selo Cgcre, tipo de solução e descrição em 2 linhas. A frase "Talvez poderia aparecerem antes da busca" precisa ser esclarecida | Baixo |
| 3. Três filtros | Concordo com a retirada do filtro de Laboratório; tenho ressalva quanto à retirada da Área técnica | As 8 áreas do topo usam o filtro de Área (`?area=`). A regra de `AGENTS.md` protege as áreas e os endereços. Se a Área sair do painel, os atalhos do topo também precisam sair (decisão A). A Modalidade separa pouco no catálogo de serviços (ex.: busca "calibração": 1 com preço contra 109 sob orçamento) | Baixo a médio |
| 4. Informar o que acontece após o envio | Concordo | O texto depende do prazo real de resposta, a ser informado pela equipe da loja. O formulário mantém o título "Não encontrou o que precisa?" mesmo quando o cliente chega por "Solicitar compra" | Baixo |
| SAA como orçamento | Concordo | A modalidade "Preço definido" é atribuída a todo produto com preço no WooCommerce (`compra:!!p.compra`). Para o SAA virar orçamento: retirar o preço do produto ou criar uma exceção no plugin. Com isso ficam 4 itens com preço: Óleo de Silicone, Tubo, Luva e Tampa | Baixo |
| Texto do SAA | Concordo, com 2 pontos a confirmar | A versão do cliente termina em "normas DIN." e deixa de fora "e acesso simultâneo de múltiplos usuários ao sistema". Confirmar se a omissão é intencional | Baixo |
| Logotipo SAA e link "Conheça nosso serviço SAA" | Concordo; faltam insumos | A imagem enviada tem 197 × 85 px (JPEG) e fica borrada em tela de alta densidade. Pedir PNG com no mínimo 400 px de largura, ou SVG. Falta o endereço do link | Baixo |
| Aba "Informação adicional" | Concordo | Remover. Sugere-se remover também "Avaliações (0)", sem uso no modelo vitrine | Baixo |
| Certificado "emitido pelo IPT", sem sigla | Concordo | Ocorrências: Óleo de Silicone ("LGE/IPT" e "Laboratório de Gestão de Energia (LGE)") e as 4 Areias Normais ("certificado de conformidade do LMPC"). Muda só o texto do site; o certificado emitido continua identificando o laboratório | Baixo |

## 3. Pontos para decidir

| Ponto | Recomendação |
|---|---|
| A. Área técnica e Laboratório | Retirar o filtro de Laboratório. Manter a Área (filtro e atalhos do topo), porque é o caminho de quem não conhece o nome do serviço. Se o cliente insistir em 3 filtros, retirar os atalhos junto |
| B. Carrinho e pagamento | Manter sem carrinho. Com o SAA fora, restam 4 itens com preço. Pagamento online exige contrato com intermediador, cálculo de frete e emissão de nota fiscal integrada. O botão continua "Solicitar compra" |
| C. "IPT Qualidade ok" | Manter o bloco institucional |
| D. Certificação de Produto e Ensino Tecnológico | Continuam como cartões de "Categorias técnicas", não como filtros, como já ocorre hoje |
| E. Telas | Verificado em 390 px e 1366 px. Falta conferir o tablet (768 px) depois das mudanças |

## 4. O que a contraproposta não cobre

1. **Busca por descrição livre**: "minha parede está com rachaduras" retorna 104 resultados, nenhum relacionado nos primeiros. Isso pesa mais do que o número de filtros para quem não sabe o nome do serviço.
2. **Frete e prazo**: o cliente lê "Sem frete" sem saber como o frete será cobrado.
3. **Vocabulário**: o documento adota "Preço definido" e "Solicitação de serviço". O site usa ainda "Com preço", "Sob orçamento" e "Valor após avaliação técnica"; convém padronizar pelos termos do cliente.
4. **Decisão anterior**: a tabela da PASSAGEM registra "Layout mantido; só ajustes de acabamento". As Mudanças 1 e 3 alteram o layout e exigem a revisão formal dessa decisão.

## 5. Ordem sugerida dos passos para o Codex

1. Conteúdo dos produtos (SAA, certificados, abas): só WooCommerce, sem plugin.
2. Busca no topo com sugestões recolhidas.
3. Cartões de resultado e painel de filtros.
4. Texto do pós-envio e título do formulário conforme a origem (compra ou orçamento).
5. Padronização dos rótulos de modalidade.
