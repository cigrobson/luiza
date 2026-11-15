# Catálogo de serviços do Scriba (base para a nova busca da Loja IPT)

Cópia estruturada do catálogo público exibido em https://escriba.ipt.br/Busca_EAC/, coletada em 14/11/2026 por uma única requisição normal ao formulário público (`POST pesquisas.asp`, campo `TxtTermo=%`, curinga documentado na própria página). Nenhuma autenticação, varredura ou alteração do sistema de origem.

## Conteúdo

| Caminho | Conteúdo |
|---|---|
| `agente-ia/` | Base de conhecimento em Markdown para agente de IA (serviços, produtos, laboratórios, sinônimos) e instruções de sistema sugeridas |
| `AGENTS.md` | Roteiro para o Codex: novo layout só na página `loja-15`, com o shortcode `[loja_ipt_pagina]` |
| `visualizacao/` | Imagens: `loja-15-nova-*` (layout final) e versões anteriores das propostas |
| `integracao/loja-15-css-pagina.css` | CSS da página `loja-15` (só se o cabeçalho for fixo) |
| `wordpress/busca-servicos-ipt.zip` | **Plugin WordPress 1.3.0**: seções da página da Loja IPT (`[loja_ipt_pagina]`), busca unificada com áreas técnicas e tipos de solução, coleta do Scriba pelo WordPress, painel em Ferramentas |
| `publicar/` | Versão em página avulsa: `index.html` + `busca-servicos.json` |
| `prototipo/index.html` | Demonstração em arquivo único, funciona offline |
| `src/` | Código-fonte: `busca.css`, `busca.js`, `busca.html` e `wordpress/` (PHP do plugin: principal, `includes/catalogo.php`, `includes/produtos.php`, `includes/admin.php`, `uninstall.php`) |
| `dados/produtos_loja.json` | Amostra dos 24 produtos da loja (14/11/2026), para a demonstração |
| `scripts/produtos_loja.py` | Converte a Store API do WooCommerce para o formato da busca |
| `scripts/fixtures/` | Resposta pública da Store API usada pelos testes |
| `dados/servicos.json` | 568 serviços com registro, tipo, nome, descrição, palavras-chave, laboratórios, certificados Cgcre e link de contato |
| `dados/servicos.csv` | Mesmo conteúdo em tabela (UTF-8 com BOM, separador `;`, abre direto no Excel) |
| `dados/laboratorios.json` | 19 laboratórios/seções com sigla, nome, código CRD e total de serviços |
| `dados/vocabulario_use.json` | 132 remissivas do vocabulário controlado (termo não preferido → termo a usar) |
| `bruto/escriba_busca_todos_2026-11-14.html` | Resposta HTML original (Windows-1252), para auditoria |
| `scripts/extrair_escriba.py` | HTML do Scriba → `dados/` |
| `scripts/exportar_indice.js` e `scripts/gerar_base_agente.py` | Geram `dados/indice_busca.json` e a base de `agente-ia/` |
| `scripts/montar_prototipo.py` | `src/` + `dados/` → `wordpress/`, `publicar/`, `prototipo/` |
| `scripts/testar_pagina.js` | Teste da página completa (22 verificações) |
| `scripts/testar_busca.js` | Teste de aceitação com Playwright (35 verificações com produtos, 31 sem), local ou em URL publicada |
| `scripts/wp_simulado.php` | WordPress simulado com WooCommerce falso (produtos reais) e tema agressivo, para testar o plugin sem instalar WordPress |

Para atualizar os dados no site: Ferramentas → Busca de Serviços IPT → "Buscar catálogo atualizado no Scriba agora". O conversor PHP do plugin (`includes/catalogo.php`) gera saída idêntica à do extrator Python. Fora do WordPress: salvar uma nova resposta de `pesquisas.asp` com `TxtTermo=%`, rodar
`python3 -I scripts/extrair_escriba.py <arquivo.html> dados` e depois `python3 -I scripts/montar_prototipo.py`.

## Protótipo da nova busca

No WordPress: instalar `wordpress/busca-servicos-ipt.zip` e inserir `[busca_servicos_ipt]` num bloco Shortcode. Para ver sem instalar: abrir `prototipo/index.html` no navegador. Nenhuma versão depende de iframe nem do Scriba.

| Recurso | Comportamento |
|---|---|
| Busca | Ao digitar; ignora acentos e maiúsculas; aceita plural (“durezas”), início de palavra (“calibra”), código (“7422”), norma (“NBR 7190”), sigla de laboratório (“LTDC”) e frase entre aspas |
| Várias palavras | Exige todas (E). Se nada atender, mostra os serviços com qualquer uma e avisa |
| Erro de digitação | Corrige pelo vocabulário do próprio catálogo (“multímtero” → multímetro) e avisa |
| Sinônimos | Usa as 132 remissivas do Scriba (“AEAC” → Etanol) |
| Relevância | Nome pesa mais que palavras-chave, que pesam mais que laboratório e descrição |
| Filtros | Laboratório, tipo de serviço e acreditação Cgcre, com contagem conforme a busca |
| Cards | Código, selo Cgcre, nome, laboratório, descrição em 3 linhas, palavras-chave, “Ver detalhes” e “Solicitar serviço” |
| Detalhes | Descrição completa, normas citadas (extraídas do texto), laboratórios, certificados em PDF, link copiável |
| “Solicitar serviço” | Abre o Fale Conosco do IPT já com o registro e a unidade (`Ensaio=` e `CRD=`) |
| URL | Guarda busca, filtros e serviço aberto (`?q=dureza&lab=LTDC&servico=7422`) |
| Leitura | Textos convertidos da caixa alta para caixa normal, preservando siglas, unidades (kV, °C, pH) e nomes de métodos; o conteúdo não é alterado |
| Layout | Responde à largura da área de conteúdo (não da tela); modo claro, escuro ou automático |
| Convivência com o tema | CSS restrito a `#busca-ipt`, classes e IDs com prefixo `bi-`, blindagem contra estilos de elementos do tema; fonte herdada do tema |

Teste automatizado: `node scripts/testar_busca.js`. Passam 35 verificações com produtos (demonstração e plugin no WordPress simulado) e 31 sem produtos (página avulsa e simulado sem WooCommerce).

Na versão 1.1, os produtos da loja entram na mesma busca, com selo e filtro de modalidade (compra direta ou solicitação de serviço). A busca por "solo" passa de 4 resultados (só Scriba) para 10, com os 6 itens da loja primeiro.

## Diagnóstico técnico da busca atual

- **Plataforma:** ASP clássico em IIS 10, HTML de 2017 com estilos inline, sem JavaScript na busca, sem AJAX nem API. Cookie de sessão `ASPSESSIONID`, sem token anti-CSRF.
- **Formulário:** `POST pesquisas.asp`, um único campo, `TxtTermo` (máx. 255). Parâmetros enviados por GET são ignorados. A URL não muda após a pesquisa.
- **Renderização:** toda no servidor. Cada resultado é uma `<table>` com rótulos fixos (Serviço, Tipo de serviço, Nome, Descrição, Palavras-chave, Certificado Cgcre, Laboratório, Contato). O termo encontrado aparece em `<B>`.
- **Regras de busca observadas:** termo convertido para maiúsculas; insensível a acentos; várias palavras funcionam como OU (“dureza madeira” = 45 resultados); aspas buscam a frase exata; `%` é curinga; envio vazio não retorna nada. A busca cobre Nome, Descrição e Palavras-chave.
- **Paginação:** não existe. `%` devolve os 574 blocos (1,7 MB) numa página só.
- **Endpoint auxiliar:** `POST USE.asp` (campo `TermoUse`) lista os serviços de um termo preferido do vocabulário controlado; é aberto num iframe pelos links “pesquise por”.
- **Duplicatas:** 6 registros aparecem duas vezes porque o banco faz junção com laboratório ou certificado (ex.: 7212 pertence a LARI e SIRGA). No JSON, cada serviço aparece uma vez, com listas.
- **Ausências:** não existe página de detalhe por serviço (o HTML guarda `</a>` órfãos de um link removido). Não há preço, prazo, norma em campo próprio, amostra exigida nem imagem. Normas aparecem só dentro do texto da descrição.
- **Link de contato:** `https://www.ipt.br/faleconosco/?Manifestacao={1|2}&Ensaio={registro}&CRD={código da unidade}`. Pode ser reaproveitado pelo botão “Solicitar serviço”.

## Cobertura dos campos (568 serviços)

| Campo | Preenchido |
|---|---|
| Registro, nome, tipo, laboratório, contato | 568 (100%) |
| Descrição | 466 (82%) |
| Certificado Cgcre (PDF PT/EN) | 101 (18%) |
| Palavras-chave | 125 (22%) |

Tipos: 561 “Ensaios, análises e calibrações correntes” e 7 “Serviços tecnológicos”.

## Cuidados

- O catálogo é público, mas a cópia fica desatualizada assim que o Scriba muda. Para produção, o caminho adequado é pedir à equipe responsável pelo Scriba uma exportação periódica oficial (view, CSV ou endpoint JSON) em vez de depender do HTML.
- Ao converter aspas duplas em simples, o servidor dá sinal de que monta a consulta SQL concatenando o texto digitado. Não foi testado. Recomenda-se comunicar à equipe do Scriba para revisão.
