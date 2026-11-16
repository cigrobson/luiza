# PASSO 15.1 — Ajustes no classificador antes da instalação (plugin 1.4.1)

A auditoria da 1.4.0 foi aprovada: sintaxe ok, os 5 arquivos públicos idênticos aos de produção, os 8 casos obrigatórios passam. Antes de instalar, faça três ajustes pequenos só em `includes/painel-classificacao.php` e `includes/painel.php`. Não mude mais nada.

## 1. Pedido com um único instrumento não é classificado

"Gostaria de um orçamento para calibração de paquímetro e micrômetro" sai como "Não identificada". O serviço "PAQUÍMETRO ATÉ 1000 MM" (LMM) casa só uma palavra do nome (4 pontos) e o mínimo é 7.

Ajuste: aceitar também 1 palavra no nome quando essa palavra aparece no nome de no máximo 5 serviços do catálogo (termo específico). Manter a exigência de 7 pontos para palavras comuns.

## 2. Texto livre não considera os produtos da loja

"Precisamos de laudo de risco de queda de árvore no condomínio" sai como "Não identificada", mas o produto 440 ("Diagnóstico e Análise de Risco de Queda de Árvore") existe. Hoje os produtos só são usados quando há "Pedido: …".

Ajuste: na pontuação por texto livre, incluir nome e descrição dos produtos de `bsipt_indice_produtos()`, com a mesma regra dos serviços. A área vem de `bsipt_painel_produto_area()`.

## 3. Falha silenciosa do protocolo

Em `bsipt_painel_capturar()`, quando o protocolo não bate com `IPT-LOJA-AAAAMMDD-HHMMSS-XXXX`, a função retorna sem registrar nada. Acrescente `error_log` nesse caso, como nos demais.

## Testes

Os 8 casos do PASSO 15 continuam passando e mais estes:

| Texto | Área | Laboratório |
|---|---|---|
| "Gostaria de um orçamento para calibração de paquímetro e micrômetro" | Metrologia e Calibração | LMM |
| "Precisamos de laudo de risco de queda de árvore no condomínio" | Meio Ambiente, Geotecnia e Biotecnologia | — |
| "Ensaio de resistência à compressão de corpos de prova de concreto" | Construção Civil | LTDC |
| "Pedido: Areia Normal Brasileira N.50, Embalagem 25 kg (Produto IPT 82)" | Construção Civil | — |

Entregue o zip 1.4.1 e o "RESULTADO DO PASSO 15.1" com o trecho alterado. Não instale sem o "ok" de Robson.
