# Abertura da sessão "Loja IPT 3": funcionalidade, design e experiência do usuário

Continuação do projeto Loja IPT (https://loja.ipt.br/). Esta sessão trata só de **funcionalidade, design e experiência do usuário** da loja. Painel de gestão, catálogo do Scriba e infraestrutura ficam em outras conversas.

## 1. Preparação

1. Traga a branch do trabalho anterior e continue nela (os commits vão para ela):
   ```
   git fetch origin claude/wonderful-tesla-8l8y1h
   git checkout claude/wonderful-tesla-8l8y1h
   ```
2. Leia `loja-ipt-busca/PASSAGEM.md` (estado, decisões, pendências e papéis) e `loja-ipt-busca/AGENTS.md` (comportamentos que não mudam sem autorização).
3. Confirme em poucas linhas: versão do plugin em produção (`curl -s https://loja.ipt.br/ | grep -o 'busca.js?ver=[0-9.]*'`, esperado 1.4.1) e o resultado de `node scripts/testar_pagina.js https://loja.ipt.br/` (esperado 22 ok), a partir de `loja-ipt-busca/`.

## 2. Papéis (não mudam)

- **Robson Santos da Silva (LID-IPT)**: responsável pela loja. Decide e autoriza. Não programa.
- **Codex**: altera o WordPress e o plugin. Recebe prompts "PASSO N" e responde "RESULTADO DO PASSO N". O último foi o PASSO 15.1.
- **Claude Code (você)**: audita, analisa e escreve os prompts para o Codex. **Não altera o site** e não envia zip de plugin. A referência é o plugin em produção, não `src/` (parou na 1.3.1). Para conferir um zip do Codex, Robson o anexa na conversa.

Regras: nunca pedir senha no chat; não sobrecarregar o Scriba; textos em português, formais, sem frases de efeito; preferir soluções simples (Robson recusou propostas grandes demais e pediu o essencial).

## 3. O que já foi feito

- A página inicial da loja (página 565) é montada pelo plugin "Busca de Serviços IPT": topo com 8 áreas técnicas, categorias, produtos em destaque, busca de 568 serviços do Scriba com sugestões e filtros, formulário WPForms 232 e bloco institucional.
- Modelo de venda: **vitrine com pedido manual**. Preço visível, sem pagamento online; botões "Solicitar compra" (com preço) e "Solicitar orçamento" (sem preço) preenchem o formulário com "Pedido: …". Carrinho e finalização redirecionam para `/#contato`.
- Formulário confirmado em 16/11/2026: o pedido chega a loja@ipt.br com protocolo `IPT-LOJA-…`.
- Plugin 1.4.1 (16/11/2026) incluiu um painel de gestão só para Robson: visitas por dia, solicitações classificadas por área e laboratório, situação do atendimento e exportação CSV. O registro diário de visitas começou em 16/11 (antes havia 67 no total).
- O layout atual foi aprovado; as decisões de cores, rótulos, menu e rodapé estão na tabela "Decisões tomadas" da PASSAGEM.md. Não reverter sem Robson.

## 4. Pendências que pertencem a esta sessão

- **Passo 13 (acabamento visual)**, nunca executado: "Valores sem frete" uma vez por seção; imagens dos cards padronizadas; 8 sugestões na busca; fonte única; larguras do formulário; categorias com ícone; 2 colunas no celular; contador no rodapé; rodapé em 2 linhas; destaques variados (3 dos 8 são Areia Normal).
- **Widget "Pergunte à IA"** cobre parte do card "Meio Ambiente" em telas menores.
- **Vídeo de fundo no topo** (Passo 12): especificação pronta, aguarda a escolha do vídeo.
- **Página antiga `/versao1/`** ainda pública.

## 5. O que preciso de você

Uma **avaliação da loja como um cliente a usa**, com evidências, e um plano de correções em ordem de prioridade. Você tem liberdade para escolher métodos e incluir o que achar relevante; o que segue é o mínimo.

**a) Tarefas de usuário reais.** Percorra a loja no computador e no celular (390 px) com tarefas como:
- uma empresa que precisa calibrar um manômetro e quer saber se o IPT faz e como pedir;
- um comprador que quer o Óleo de Silicone e precisa saber preço, frete e prazo;
- um engenheiro que procura um ensaio com nome técnico ou sigla de norma (ex.: "NBR 8197", "Cobb");
- alguém que não sabe o nome do serviço e descreve o problema com as próprias palavras;
- alguém que não encontra o que procura e precisa falar com o IPT.

Para cada tarefa: passos, onde houve dúvida ou erro, se foi concluída.

**b) Avaliação por critérios conhecidos.** Use referências reais e cite-as: as 10 heurísticas de Nielsen; WCAG 2.2 nível AA (contraste, teclado, foco visível, rótulos, áreas de toque); Core Web Vitals (LCP, INP, CLS). O Chromium e o Playwright já estão instalados no ambiente; Lighthouse pode ser usado com `--chrome-flags="--headless --no-sandbox"` e o caminho `/opt/pw-browsers/chromium`.

**c) Conteúdo e confiança.** Clareza dos textos (o cliente entende "Preço definido", "Solicitar orçamento", "Valores sem frete"?), o que acontece depois do envio do formulário (prazo de resposta, protocolo), sinais de confiança (acreditação Cgcre, CNPJ, contato) e consistência entre a busca, os destaques e o formulário.

**d) Capturas.** Telas de cada problema, em computador e celular, salvas em `loja-ipt-busca/visualizacao/ux-2026-11/`.

## 6. Entregas

1. Uma tabela de problemas: local, descrição, evidência (captura), critério violado, gravidade (alta / média / baixa), esforço estimado, recomendação.
2. Uma lista curta das 5 a 8 correções que mais melhoram a experiência com menor esforço, incorporando o que ainda vale do Passo 13.
3. Só depois do "ok" de Robson: os prompts para o Codex (PASSO 16 em diante), um assunto por passo, com testes verificáveis.

Antes de entregar textos, aplique a revisão anti-IA: nada de frases de efeito, slogans ou fechamentos motivacionais; cada frase com fato, dado ou mecanismo concreto.

Se identificar especialidades úteis (por exemplo, redação técnica ou acessibilidade), proponha a Robson antes de incorporá-las.
