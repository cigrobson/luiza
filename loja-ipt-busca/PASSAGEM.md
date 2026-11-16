# Passagem de contexto: Loja IPT (estado em 16/11/2026)

Leia este arquivo antes de qualquer trabalho na Loja IPT. Ele resume as decisões, o estado do site e as pendências de uma conversa longa anterior.

## Papéis

- **Robson Santos da Silva (LID-IPT)**: responsável. Decide e autoriza. Não programa.
- **Codex**: faz as alterações no WordPress e no plugin. Recebe prompts numerados ("PASSO N") e responde no formato "RESULTADO DO PASSO N".
- **Claude Code**: só audita e escreve os prompts para o Codex. Não altera o site e não envia zip de plugin para instalar (sobrescreveria o trabalho do Codex). A referência é o plugin em produção, não `src/` deste repositório (que parou na 1.3.1).

Regras de trabalho: confirmar com Robson antes de qualquer ação fora da página; nunca pedir senha no chat; não sobrecarregar o Scriba (no máximo uma requisição por vez, coleta no máximo semanal); textos em português, formais, sem frases de efeito.

## Estado do site

- Endereço: https://loja.ipt.br/ (página 565, página inicial). `/loja-15/` redireciona (301) para `/`.
- Plugin "Busca de Serviços IPT" **1.4.1** em produção (painel de gestão ligado) (zip mais recente no computador de Robson: `C:/Users/robsonss/Downloads/claude/`).
- Auditoria de 16/11/2026: `node scripts/testar_pagina.js https://loja.ipt.br/` = **22 ok, 0 falha**; sem erros de JavaScript; sem rolagem lateral em 390 px.
- WordPress com tema Kadence, WooCommerce, WPForms **Lite** (não guarda entradas; conferir pelo e-mail), LiteSpeed Cache. O "CSS adicional" do tema força `.wpforms-container .wpforms-submit { background:#00AEEF !important; color:#FFF !important }` — por isso as regras do plugin para o botão usam `!important`.

## Decisões tomadas (não reverter sem Robson)

| Tema | Decisão |
|---|---|
| Layout | Mantido como está; só ajustes de acabamento |
| Modelo de venda | **Vitrine com pedido manual.** Preço visível, sem pagamento online. `woocommerce_is_purchasable` = false (opção "Modo vitrine" no painel do plugin). Botões "Solicitar compra" (com preço) e "Solicitar orçamento" (sem preço). `/carrinho/` e `/finalizar-compra/` redirecionam para `/#contato`. Mensagem "não existem métodos de pagamento" substituída |
| Formulário | WPForms 232 → loja@ipt.br. Rótulo do campo de texto: "Insira sua solicitação ou complemente o pedido descrevendo suas necessidades no campo abaixo." O pedido vai para esse campo como "Pedido: …" (campo Pedido separado é opcional; ID 0 = não usado) |
| Botão Enviar | Letra branca, fundo `#00749a` (hover `#005f7e`), contraste aprovado |
| Menu | Início (https://loja.ipt.br) · Solicitar Orçamento (`/#contato`) · Sobre o IPT. Sem "Produtos e Serviços", "Minha conta" e "Carrinho" (voltam só se houver venda online). Cadastro de clientes desligado |
| Rótulos | "Compra direta" virou "Preço definido" |
| Contador de visitas | Mantido (uma vez por sessão, ignora robôs) |
| Certificados Cgcre | Os 16 PDFs do Scriba dão 404; links removidos na exibição (1.3.15). Mostra só o código (ex.: "CAL 0003") |
| Rodapé | Inclui: Instituto de Pesquisas Tecnológicas do Estado de São Paulo S.A. – IPT · CNPJ 60.633.674/0001-55 · Avenida Professor Almeida Prado, 532, Cidade Universitária, Butantã, São Paulo – SP, CEP 05508-901 · loja@ipt.br |
| Áreas técnicas | 8 áreas definidas pelos laboratórios (ver `AGENTS.md` e `src/busca.js`) |

## Pendências

1. **Envio de teste do formulário**: confirmar que a mensagem chega a loja@ipt.br com "Pedido: …". Nunca confirmado.
2. **Página antiga `/versao1/`** (página 99, com iframe do Scriba) ainda pública: passar para Privado.
3. **Preços** dos 5 itens com preço confirmados com a área (Óleo de Silicone R$ 1.400,00; SAA R$ 435,00–10.568,00; Tubo para Inclinômetro R$ 152,91 — a descrição diz "por metro linear", conflita com "× 3 m"; Luva e Tampa R$ 49,66).
4. **Passo 13 (acabamento visual)**: prompt pronto na conversa anterior; não executado. Itens: frase "Valores sem frete" uma vez por seção; imagens dos cards padronizadas; 8 sugestões na busca; fonte única; larguras do formulário; categorias com ícone; 2 colunas no celular; contador no rodapé; rodapé em 2 linhas; variar os destaques (3 são Areia Normal).
5. **Vídeo de fundo no topo** (Passo 12): especificação pronta (até 2 MB, WebM+MP4, poster, só depois do load, desligado no celular e com "reduzir movimento", botão de pausa). Aguarda Robson escolher o vídeo.
6. **Encaminhamento por laboratório**: depende da lista de e-mails por código CRD (tabela em `dados/laboratorios.json`). Fazer no plugin (tabela no servidor), não em campo da página.
7. **Widget "Pergunte à IA"**: o robô cobre parte do card "Meio Ambiente" em telas menores; conferir.
8. Avisar a equipe do Scriba sobre os certificados fora do ar.
9. Plugin 1.3.14+: desinstalação não apaga `bsipt_campo_pedido`, `bsipt_orcamento_publicado` e opção do modo vitrine (baixa prioridade).
10. Decisões de TI: cache de página do LiteSpeed na home, imagens WebP, cabeçalhos de segurança, descrição para o Google.

## Painel da Loja (Passos 14 a 15.1)

- Robson pediu um painel simples de gestão. A proposta ampla do Passo 14 foi descartada; vale o Passo 15 (`prompts/passo-15-painel-simples.md`) com os ajustes do 15.1.
- Plugin **1.4.1** auditado em 16/11/2026: só `painel-classificacao.php`, `painel.php`, versão e readme mudaram em relação à 1.4.0; arquivos públicos idênticos aos da 1.3.15; 21 de 22 casos do classificador corretos (falha conhecida: "Ensaio de embalagem" vai para LQM; corrigir à mão no painel).
- **Instalado em 16/11/2026**, painel ligado (usuário robsonss). Envio de teste IPT-LOJA-20261116-194854-5F5A apareceu no painel em Metrologia e Calibração. Auditoria pós-instalação: 22 ok. Falta Robson confirmar o e-mail em loja@ipt.br e excluir o registro de teste.
- Produção: WordPress 7.1.4, PHP 8.3.36, MariaDB 11.8.9, WPForms Lite 2.0.3.1. Formulário 232: campo 1 Nome, 2 E-mail, 3 Mensagem. Protocolo gerado pelo snippet WPCode 560 (`ipt_loja_v4_protocolo()`).

## Agente de IA

Base em `agente-ia/` (568 serviços, 24 produtos, 19 laboratórios, 132 sinônimos), gerada por `scripts/exportar_indice.js` + `scripts/gerar_base_agente.py`. Instruções de sistema e testes em `agente-ia/instrucoes-agente.md`.

## Como auditar

A partir de `loja-ipt-busca/`:

```
node scripts/testar_pagina.js https://loja.ipt.br/        # esperado: 22 ok
curl -s https://loja.ipt.br/ | grep -o 'busca.js?ver=[0-9.]*'   # versão em produção
```

Para conferir um zip do Codex: extrair numa pasta do scratchpad, `diff -r` contra a versão anterior, `php -l` e `node --check`. O simulador `scripts/wp_simulado.php` serve para testes locais, mas precisa de funções extras (is_page, wp_get_current_user, etc.) para as versões 1.3.7+.
