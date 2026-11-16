# PASSO 15 — Painel simples da Loja IPT (plugin 1.4.0)

Robson pediu uma versão simples do painel. Este passo substitui a proposta do PASSO 14: sem tabelas de eventos, sem histórico de alterações, sem regras compartilhadas entre PHP e JavaScript, sem integração com CRM. Parta do plugin **1.3.15 em produção**.

## Etapa 1: conferência (só leitura)

Com Robson logado, confira e informe:

1. Versão do WordPress, do PHP e do MySQL/MariaDB (Ferramentas → Saúde do site → Informações).
2. Versão do WPForms Lite e os IDs e rótulos de todos os campos do formulário 232.
3. Onde o protocolo `IPT-LOJA-AAAAMMDD-HHMMSS-XXXX` é gerado e se ele pode ser lido no momento do envio.

Se algum desses itens impedir o plano abaixo, pare e explique.

## Etapa 2: o que construir

Um módulo **"Painel da Loja"** dentro do plugin, **desligado por padrão** (opção no painel do plugin). Desligado, o plugin se comporta exatamente como a 1.3.15.

### Duas tabelas

| Tabela | Colunas |
|---|---|
| `{prefixo}bsipt_visitas_dia` | `dia` (DATE, chave primária), `total` |
| `{prefixo}bsipt_solicitacoes` | `id`, `protocolo` (único), `recebida_em`, `nome`, `email`, demais campos de contato que o formulário 232 tiver, `mensagem`, `pedido`, `area`, `lab_sigla`, `servico_sugerido`, `corrigida` (0/1), `situacao`, `observacao` |

### Visitas

No mesmo POST de primeira visita que já incrementa `bsipt_visitas_loja_565`, somar 1 na linha do dia (fuso do WordPress). Nada mais muda no contador.

### Solicitações

- Gancho `wpforms_process_complete_232`, depois do envio do e-mail. Se a gravação falhar, o cliente e o e-mail para loja@ipt.br não podem ser afetados.
- Gravar o mesmo protocolo que vai no e-mail.

### Classificação (simples)

1. Se a mensagem tiver "Pedido: …" com o nome de um produto ou serviço do catálogo, usar a área e o laboratório desse item.
2. Senão, comparar as palavras da mensagem (sem acento, minúsculas, sem palavras vazias, com os sinônimos do catálogo) com nome e descrição dos serviços. O serviço com mais pontos define laboratório e área.
3. Abaixo de uma pontuação mínima: área "Não identificada".

Casos que devem passar:

| Texto | Área | Laboratório |
|---|---|---|
| "Preciso calibrar um manômetro analógico de 600 bar" | Metrologia e Calibração | LMM |
| "Ensaio de extintor de incêndio classe C" | Segurança ao Fogo | LSFEX |
| "Determinar o poder calorífico superior de um óleo diesel" | Bioenergia e Combustíveis | LBE |
| "Absorção de água pelo método Cobb em caixa de papelão" | Papel e Embalagem | LCPE |
| "Transmitância térmica de uma parede de bloco" | Energia e Conforto Ambiental | LCAP |
| "Reatividade álcali-agregado em barras de argamassa" | Construção Civil | LMPC |
| "Pedido: Óleo de Silicone" | área do produto | — |
| "Desenvolvimento de aplicativo para gestão escolar" | Não identificada | — |

### Uma tela: Loja IPT → Painel

- Seletor de mês.
- Quatro números: visitas no mês, solicitações no mês, aguardando encaminhamento, não identificadas.
- Dois gráficos de barras feitos em HTML/CSS, sem biblioteca externa: visitas por dia; solicitações por área. Cada barra mostra o número.
- Lista das solicitações do mês: data, protocolo, nome, trecho da mensagem, área, laboratório, situação. Ao abrir: mensagem completa e campos editáveis (área, laboratório, situação, observação). Situações: Nova, Encaminhada, Respondida, Arquivada. Ao corrigir área ou laboratório, marcar `corrigida = 1`.
- Botão "Excluir" por solicitação, com confirmação.
- Botão "Exportar CSV" do mês (UTF-8 com BOM, separador ";", valores iniciados por `=`, `+`, `-` ou `@` precedidos de apóstrofo).

### Acesso e guarda

- Capacidade própria `bsipt_ver_painel`, concedida só ao usuário de Robson. `nonce` e verificação de capacidade em todas as ações; `$wpdb->prepare` em todas as consultas.
- Tarefa diária (WP-Cron) que exclui solicitações com mais de 24 meses.
- Desinstalação: apagar as duas tabelas e as opções do plugin (inclusive `bsipt_campo_pedido`, `bsipt_orcamento_publicado` e a do modo vitrine) só se a opção "Apagar dados ao desinstalar" estiver marcada. Padrão: não.

## Fora do escopo

Origem e dispositivo das visitas, registro de termos buscados e cliques, funil, histórico de alterações, IA, CRM, Power BI, resumo por e-mail.

## Etapa 3: testes e entrega

1. Testes locais: `php -l` em todos os arquivos, os 8 casos acima, `node scripts/testar_pagina.js` com o módulo ligado e desligado (22 ok nos dois).
2. Envie o zip e o "RESULTADO DO PASSO 15" com: o que mudou por arquivo, o resultado da Etapa 1 e dos testes. **Não instale sem o "ok" de Robson.**
3. Depois do "ok": instalar, ligar o módulo, purgar o cache do LiteSpeed, rodar `node scripts/testar_pagina.js https://loja.ipt.br/` (22 ok).
4. Com autorização de Robson, fazer **um envio de teste** pelo formulário com "Pedido: Óleo de Silicone" e confirmar: (a) o e-mail chegou a loja@ipt.br com o protocolo; (b) a solicitação aparece no painel com o mesmo protocolo e a área do produto. Excluir a solicitação de teste depois.
5. Enviar capturas da tela do painel.
