# PASSOS 21 e 22: acabamento no celular e texto do produto 434

Autorização de Robson (18/11/2026): executar os dois passos, **instalar em produção** e só então devolver o resultado. Partir do plugin **1.4.13 em produção** (ZIP de referência: SHA256 `5bbfb3144918c980c34ef8535f386d35e458b404bf14f88042a2b6d29a6a4750`).

Regras comuns:

- Não alterar menu, tema, outras páginas, formulário WPForms 232, snippet WPCode 560, preços, variações, imagens ou outros produtos.
- Não enviar formulários nem gerar pedidos. Testes só preenchem e limpam campos.
- Antes de instalar: guardar o ZIP 1.4.13 como caminho de volta. Antes de editar o produto 434: copiar para um arquivo de texto título, descrição, descrição curta e preço atuais.
- Depois de instalar e editar: LiteSpeed Cache → Purgar tudo.
- Se algum teste falhar depois da instalação, voltar para a 1.4.13 (reinstalar o ZIP de referência), purgar o cache e relatar, sem tentar correções não pedidas.

---

## PASSO 21 — Celular: texto do SAA alinhado à esquerda e nomes completos nas abas (plugin 1.4.14)

### O que fazer

1. **Texto do SAA no celular.** Em telas de até 600 px de largura, o texto do SAA passa de justificado para **alinhado à esquerda**, nos dois lugares:
   - resumo (descrição curta) da página do produto 407;
   - quadro informativo acima do formulário, depois do clique em "Solicitar orçamento" do SAA.

   Acima de 600 px, continua justificado. Fonte, links ("Clique aqui" e "SAA", sublinhados, nova aba), negrito do "SAA" e conteúdo do texto não mudam.
2. **Abas dos destaques no celular.** Trocar "Com preço" por **"Preço definido"** e "Sob orçamento" por **"Solicitação de serviço"**, iguais ao computador, aos selos dos cartões e ao filtro "Modalidade".
   - O nome pode quebrar em duas linhas dentro da aba. Não pode ser cortado (sem reticências, sem texto escondido) nem criar rolagem lateral.
   - As três abas ("Todos", "Preço definido", "Solicitação de serviço") ficam na mesma linha, com área de toque de pelo menos 24 × 24 px (WCAG 2.2, critério 2.5.8).
3. Nada mais muda no plugin. Atualizar versão para 1.4.14 no arquivo principal e no readme.

### Testes (depois de instalar e purgar)

| Ação | Esperado |
|---|---|
| Produto 407 em 390 px | Resumo com `text-align: left` |
| Produto 407 em 1366 px | Resumo com `text-align: justify`; fonte 19,6667 px |
| Clique em "Solicitar orçamento" do SAA, 390 px | Quadro com texto alinhado à esquerda; mensagem `Pedido: SAA – … (Produto IPT 407)`; quadro fora do campo de mensagem |
| O mesmo em 1366 px | Quadro justificado; fonte 17,6667 px |
| Abas em 390 px e em 360 px | "Todos", "Preço definido", "Solicitação de serviço"; nenhum texto cortado; sem rolagem lateral; cada aba com pelo menos 24 px de altura |
| Clicar nas abas (390 px) | 4 cartões em "Preço definido", 4 em "Solicitação de serviço", 8 em "Todos" |
| Abas em 1366 px | Sem mudança |
| `testar_pagina.js` (versão adaptada) | 22 ok, 0 falha, sem erros de JavaScript |

---

## PASSO 22 — Produto 434: "Realizado pelo IPT"

### O que fazer (WooCommerce, só o produto 434 "Ensaio de Emissão Radiada em Luminária e Lâmpada LED")

1. Listar todas as ocorrências de "LGE" e "Laboratório de Gestão de Energia" nos campos de texto do produto 434 (título, descrição, descrição curta) **antes** de trocar.
2. Trocas:

   | Campo | Trocar | Por |
   |---|---|---|
   | Descrição curta | "Realizado pelo LGE/IPT." | **"Realizado pelo IPT."** |
   | Descrição | "realizado em luminária e lâmpada LED pelo Laboratório de Gestão de Energia (LGE) do Instituto de Pesquisas Tecnológicas do Estado de São Paulo (IPT)" | **"realizado em luminária e lâmpada LED pelo IPT"** |

   Se aparecer outra ocorrência no passo 1, aplicar o mesmo critério ("pelo IPT") e informar qual foi.
3. Não mudar título, preço, imagem (o nome do arquivo da imagem pode continuar com "LGE"), categoria nem endereço do produto.
4. Reconstruir o índice dos produtos e purgar o cache.

### Testes

| Ação | Esperado |
|---|---|
| Página do produto 434 | "Realizado pelo IPT"; nenhuma ocorrência de "LGE" nem de "Laboratório de Gestão de Energia" no texto visível |
| API pública `wp-json/wc/store/v1/products/434` | Mesmo resultado em `description` e `short_description`; `name`, `prices` e `permalink` iguais aos de antes |
| Destaques (cartão 434) e busca `emissão radiada` | Texto do cartão sem "LGE" |
| Demais 23 produtos | Sem mudança |
| `testar_pagina.js` (versão adaptada) | 22 ok, 0 falha |

---

## Devolução esperada (um único relatório)

```
RESULTADO DOS PASSOS 21 E 22

1. Versão instalada em produção: 1.4.14 (confirmação no painel e em busca.js?ver=…)
2. ZIP 1.4.14: anexar o arquivo, com SHA256, tamanho e número de arquivos
3. Arquivos alterados em relação à 1.4.13 (lista) e resumo do que mudou em cada um
4. Produto 434: texto antes e depois (descrição e descrição curta) e ocorrências encontradas no item 1
5. Tabela dos testes do PASSO 21 e do PASSO 22, cada um com ok ou falha
6. Saída de testar_pagina.js na 1.4.14 (contagem final)
7. Capturas em 390 px e 1366 px: abas dos destaques, resumo do SAA, quadro do SAA, produto 434
8. Confirmação de que não houve envio de formulário, nem mudança em preços, variações, menu, tema, WPForms 232 e WPCode 560
9. Se houve volta para a 1.4.13: motivo e estado final
```
