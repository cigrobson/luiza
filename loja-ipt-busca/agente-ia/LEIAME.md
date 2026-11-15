# Base de conhecimento para o agente de IA

| Arquivo | Uso |
|---|---|
| `base-conhecimento-servicos-ipt.md` | Base completa em um arquivo (568 serviços, 24 produtos, 19 laboratórios, 132 termos equivalentes, orientações e perguntas frequentes) |
| `por-area/` | A mesma base em 10 arquivos (geral, produtos e uma por área técnica), para plataformas que limitam o tamanho por arquivo |
| `instrucoes-agente.md` | Instruções de sistema sugeridas, exemplos de teste e como atualizar |

Cada serviço é um bloco independente (título com nome e número, seguido dos campos), o que permite à busca por trechos (RAG) recuperar o serviço inteiro.

Gerado por `scripts/gerar_base_agente.py`. Não edite os arquivos à mão: gere de novo quando o catálogo mudar.
