# PASSO 14 — Adendo (incorporar à proposta; continua sem alterar o site)

Considere estes cinco pontos na resposta às perguntas 5, 7 e 8 do PASSO 14.

## 1. Dados pessoais digitados na busca

Antes de gravar um termo de busca, descartar o termo inteiro (não gravar versão mascarada) se contiver:

- endereço de e-mail;
- sequência de 8 ou mais dígitos, com ou sem pontuação (telefone, CPF, CNPJ);
- mais de 80 caracteres.

No painel, os termos só aparecem quando tiverem sido buscados ao menos 2 vezes no período. Informe quantos termos foram descartados por esse filtro (só o número).

## 2. Anonimização ao fim do prazo de guarda

Ao fim do prazo (24 meses, sujeito à validação das regras de retenção do IPT), apagar de cada solicitação: nome, e-mail, telefone, empresa, **texto original da demanda, observações e os valores antigos e novos do histórico que sejam texto livre**. Manter: protocolo, datas, origem, classificação automática e revisada (tipo, serviço ou produto, laboratório, área, confiança), situação e marca "não contemplada". A rotina roda uma vez por dia pelo WP-Cron e registra quantas solicitações anonimizou.

## 3. Classificação: casos adicionais

A classificação automática e a revisada continuam em campos separados. Acrescentar estes casos de teste:

| Texto | Esperado |
|---|---|
| "Ensaio de compressão" | Confiança média; sugere serviços de mais de um laboratório (ex.: LTDC e LMM) e não escolhe um só |
| "Ensaio de absorção de água em caixa de papelão e reação ao fogo do revestimento" | Duas áreas (Papel e Embalagem; Segurança ao Fogo), cada uma com o seu laboratório |
| "Gostaria de saber o preço" | Confiança baixa; tipo "outro"; não marcar como "não contemplada" (não há demanda técnica identificável) |
| "Calibração de anemômetro para parque eólico" | Metrologia e Calibração; LV |

Prever no modelo de dados mais de uma área e mais de um laboratório por solicitação.

## 4. Funil

Apresentar o funil como totais do período (visitas, buscas, cliques em "Solicitar", solicitações) e, quando houver razão entre eles, rotulá-la como "razão entre totais do período". Não usar o termo "taxa de conversão" nem sugerir acompanhamento de pessoas.

## 5. Confiabilidade do registro das solicitações

- A gravação roda dentro de `try/catch`. Qualquer falha do módulo é registrada no log do plugin e **não pode impedir o envio do formulário nem o e-mail para loja@ipt.br**.
- Evitar duplicação: chave única por envio (identificador do WPForms quando existir; senão, hash do conteúdo + formulário + minuto).
- O painel mostra os erros de gravação dos últimos 30 dias.
- Recuperação: como o e-mail continua sendo enviado, prever o cadastro manual de uma solicitação no painel, a partir do e-mail recebido, marcada como "registrada manualmente".
- Descrever na resposta o procedimento para desligar só o módulo e para voltar à 1.3.15, se necessário.

Responda no formato "RESULTADO DO PASSO 14", com as 8 respostas do prompt original. Não instale nada, não crie tabelas, não altere a página.
