# PASSO 23 — Busca: painel de filtros oculto, filtros funcionando (plugin 1.4.16)

Decisão de Robson (18/11/2026): o painel de filtros da busca deixa de aparecer para o cliente, em todas as telas. Os filtros **continuam funcionando** pelos caminhos que já existem: áreas técnicas do topo, cartões de categoria, coleção de microbiológicos, endereços com parâmetros e etiquetas de filtro ativo.

Autorização: Robson autoriza instalar em produção antes de devolver o resultado, como nos PASSOS 21 e 22.

Regras comuns:

- Partir do plugin **1.4.15 em produção**. Guardar o ZIP 1.4.15 como caminho de volta.
- Não alterar menu, tema, outras páginas, produtos, preços, variações, WPForms 232 nem WPCode 560. Não enviar formulários.
- Depois de instalar: LiteSpeed Cache → Purgar tudo.
- Se algum teste falhar depois da instalação, voltar para a 1.4.15, purgar o cache e relatar, sem tentar correções não pedidas.

---

## O que fazer

1. **Ocultar o painel de filtros** do catálogo (bloco "Filtros" com Área técnica, Tipo de solução, Acreditação, Modalidade e Laboratório) no computador, no tablet e no celular.
   - O painel não aparece, não ocupa espaço e não recebe foco pelo teclado (nenhuma caixa de seleção oculta pode ser alcançada com Tab). Usar `hidden` ou `display: none`. Não usar recurso que só esconda visualmente e deixe os controles acessíveis.
   - A lógica dos filtros, as contagens e o estado continuam no código, sem alteração.
2. **Resultados ocupam a largura toda** do catálogo, sem a coluna lateral vazia. No computador (1366 px), 3 colunas de cartões; nas larguras menores, o mesmo número de colunas que a 1.4.15 já usa quando a tela é estreita.
3. **Continuam visíveis e funcionando:**
   - a contagem ("103 resultados") e o seletor "Mais relevantes";
   - as **etiquetas de filtro ativo** acima dos resultados (ex.: "Área: Construção Civil ✕", "Ensaios Microbiológicos e Antimicrobianos ✕"). São a única forma de o cliente ver e desfazer um filtro aplicado pelos atalhos; o ✕ remove o filtro, como hoje;
   - as 8 áreas técnicas do topo, os 6 cartões de categoria com filtro, o cartão "Ensaios Microbiológicos e Antimicrobianos", "Certificação de Produto" (formulário) e "Ensino Tecnológico" (Sapiens);
   - os endereços `?q=`, `?area=`, `?solucao=`, `?colecao=`, `?mod=`, `?cgcre=1`, `?lab=`, `?servico=` e o alias `?solucao=microbiologicos-antimicrobianos`;
   - sugestões ao digitar, Enter, "Ver detalhes", "Solicitar orçamento" e "Solicitar compra".
4. **Opção no painel do plugin**, para desfazer sem nova versão: "Mostrar painel de filtros na busca", **desmarcada** por padrão. Marcada, o painel volta exatamente como na 1.4.15.
5. Versão 1.4.16 no arquivo principal e no readme. Nenhuma outra mudança.

---

## Testes

Antes de instalar, anotar na 1.4.15 as contagens da coluna "Esperado" que dependem do catálogo; depois de instalar, elas devem ser **iguais**.

| Ação | Esperado |
|---|---|
| Abrir `https://loja.ipt.br/?q=calibração#catalogo` em 1366, 768, 390 e 360 px | Nenhum painel de filtros visível; sem espaço vazio no lugar dele; contagem igual à da 1.4.15 |
| Tab a partir da caixa de busca até o primeiro cartão de resultado (1366 px) | Nenhuma caixa de seleção de filtro recebe foco |
| Resultados em 1366 px | 3 colunas, na largura toda do catálogo |
| Resultados em 390 px | Sem rolagem lateral |
| Clicar na área "Construção Civil" | 103 resultados e etiqueta "Área: Construção Civil ✕" |
| Clicar no ✕ dessa etiqueta | Filtro removido; volta ao total do catálogo (592) |
| Clicar no cartão "Calibrações" | 111 resultados e etiqueta do tipo |
| Clicar no cartão "Ensaios Microbiológicos e Antimicrobianos" | 10 resultados e etiqueta da coleção |
| `?solucao=microbiologicos-antimicrobianos#catalogo` | Os mesmos 10 |
| `?mod=compra#catalogo` | 4 resultados (Óleo, Tubo, Luva, Tampa) |
| `?cgcre=1#catalogo` e `?lab=LMM#catalogo` | Contagens iguais às da 1.4.15, com etiqueta |
| `?colecao=microbiologicos&mod=compra#catalogo` | 0, com a mensagem de lista vazia atual |
| Digitar `inclinôm` | Sugestões com os grupos atuais |
| Opção "Mostrar painel de filtros" marcada (testar e desmarcar de novo) | Painel volta como na 1.4.15; desmarcada, some de novo |
| `testar_pagina.js` (versão adaptada) | 22 ok, 0 falha, sem erros de JavaScript. Se algum teste clicar em caixa de seleção do painel, trocar por endereço ou cartão equivalente, sem mudar o que é verificado, e informar qual |

---

## Devolução esperada (um único relatório)

```
RESULTADO DO PASSO 23

1. Versão instalada em produção: 1.4.16 (confirmação no painel e em busca.js?ver=…)
2. ZIP 1.4.16: anexar, com SHA256, tamanho e número de arquivos
3. Arquivos alterados em relação à 1.4.15 e resumo do que mudou em cada um
4. Tabela dos testes, com contagens antes (1.4.15) e depois (1.4.16), cada linha com ok ou falha
5. Saída de testar_pagina.js na 1.4.16 e testes adaptados, se houver
6. Capturas em 1366, 768, 390 e 360 px: catálogo com busca "calibração", área Construção Civil com etiqueta, coleção de microbiológicos
7. Estado final da opção "Mostrar painel de filtros" (deve ficar desmarcada)
8. Confirmação de que não houve envio de formulário nem mudança em produtos, preços, menu, tema, WPForms 232 e WPCode 560
9. Se houve volta para a 1.4.15: motivo e estado final
```
