# Catálogo de serviços do Scriba (base para a nova busca da Loja IPT)

Cópia estruturada do catálogo público exibido em https://escriba.ipt.br/Busca_EAC/, coletada em 14/11/2026 por uma única requisição normal ao formulário público (`POST pesquisas.asp`, campo `TxtTermo=%`, curinga documentado na própria página). Nenhuma autenticação, varredura ou alteração do sistema de origem.

## Conteúdo

| Arquivo | Conteúdo |
|---|---|
| `dados/servicos.json` | 568 serviços com registro, tipo, nome, descrição, palavras-chave, laboratórios, certificados Cgcre e link de contato |
| `dados/servicos.csv` | Mesmo conteúdo em tabela (UTF-8 com BOM, separador `;`, abre direto no Excel) |
| `dados/laboratorios.json` | 19 laboratórios/seções com sigla, nome, código CRD e total de serviços |
| `dados/vocabulario_use.json` | 132 remissivas do vocabulário controlado (termo não preferido → termo a usar) |
| `bruto/escriba_busca_todos_2026-11-14.html` | Resposta HTML original (Windows-1252), para auditoria |
| `prototipo/index.html` | Protótipo da nova busca, arquivo único que funciona offline |
| `prototipo/template.html` | Código do protótipo sem os dados |
| `scripts/montar_prototipo.py` | Embute `dados/` no template e gera `index.html` |
| `scripts/extrair_escriba.py` | Conversor do HTML bruto para os arquivos acima |

Para atualizar: salvar uma nova resposta de `pesquisas.asp` com `TxtTermo=%` e rodar
`python3 -I scripts/extrair_escriba.py <arquivo.html> dados` e depois `python3 -I scripts/montar_prototipo.py`.

## Protótipo da nova busca

Abrir `prototipo/index.html` no navegador. Não depende de servidor, iframe nem do Scriba.

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
| Layout | Responsivo (celular sem rolagem lateral), modo claro e escuro |

Testado no Chromium: 14 buscas de referência, filtros, detalhes, link direto, celular 390 px e modo escuro, sem erros de JavaScript.

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
