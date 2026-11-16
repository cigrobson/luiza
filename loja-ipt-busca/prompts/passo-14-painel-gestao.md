# PASSO 14 — Painel de gestão da Loja IPT (reconhecimento e proposta, sem alterar o site)

Robson, responsável pela Loja IPT, quer um painel de acompanhamento só para ele dentro do WordPress: visitas, uso da busca, solicitações recebidas pelo formulário, classificação automática de cada solicitação por serviço ou produto, laboratório e área responsáveis, situação do atendimento e gráficos.

Neste passo **não altere nada no site**: nem plugin, nem página, nem formulário, nem banco de dados. Faça o reconhecimento, responda às perguntas e proponha o modelo de dados. A implementação será o PASSO 15, depois da aprovação de Robson.

## Base de trabalho

- Parta do plugin **em produção (1.3.15)**, não de `src/` do repositório (parou na 1.3.1).
- O painel será um **módulo do próprio plugin "Busca de Serviços IPT"** (versão 1.4.0), com menu próprio no painel: **Loja IPT → Painel**. Motivo: o contador de visitas, o índice de serviços (`indice_busca.json`), o mapa de áreas (`AREAS`) e os produtos já estão nesse plugin. O módulo deve poder ser desligado por uma opção sem afetar a vitrine.
- Nada de serviço externo de IA. A classificação usa só os cadastros do plugin.
- Nenhuma biblioteca carregada de CDN. Se usar Chart.js, a versão fica fixa e o arquivo vai dentro do plugin, carregado só na tela do painel.

## O que o painel deve mostrar

### 1. Visitas (agregadas, sem dados pessoais)

| Indicador | Regra |
|---|---|
| Visitas por dia, semana e mês | O mesmo critério do contador atual: uma por sessão, sem robôs |
| Origem | Só o domínio de referência agrupado: Google, outros buscadores, ipt.br, redes sociais, direto, outros |
| Dispositivo | Celular ou computador, pela largura da tela |
| Página de entrada | Página inicial ou link direto com `?area=`, `?solucao=`, `?q=` |

Gravar **contagens por dia**, não registros por visitante. Não gravar IP, agente do navegador completo nem identificador persistente. A página usa cache do LiteSpeed, então o registro deve ser feito por chamada JavaScript depois do carregamento, como o contador atual (confirme como ele funciona).

### 2. Uso da página (eventos agregados por dia)

- Termos buscados (normalizados, sem acento, minúsculos) e número de resultados.
- **Buscas sem resultado**, com o termo.
- Cliques em cada área técnica e em cada categoria.
- Cliques em "Solicitar compra" e "Solicitar orçamento", por produto ou serviço.
- Funil do período: visitas → buscas → cliques em solicitar → solicitações enviadas.

O ponto de registro (REST ou admin-ajax) deve aceitar só uma lista fechada de tipos de evento, limitar o tamanho dos textos (termo até 80 caracteres), descartar robôs e limitar a frequência por sessão. Nenhum dado pessoal.

### 3. Solicitações do formulário (WPForms 232)

O WPForms Lite não guarda os envios. Registrar cada envio em tabela própria pelo gancho `wpforms_process_complete` (confirme que ele dispara no Lite), **sem mudar o formulário nem o e-mail enviado a loja@ipt.br**.

| Grupo | Campos |
|---|---|
| Identificação | Protocolo (`LOJA-AAAA-NNNN`), data e hora, origem da solicitação: item selecionado na página, busca sem resultado, categoria Certificação de Produto ou texto livre |
| Contato | Nome, e-mail, telefone, empresa (os campos que o formulário 232 já tem) |
| Demanda | Texto original, item selecionado ("Pedido: …"), termo da busca quando houver |
| Classificação automática | Tipo (serviço, produto, certificação, ensino, outro); até 3 serviços ou produtos mais próximos, com pontuação; laboratório(s) com sigla e CRD; área técnica; confiança (alta, média, baixa); marca **"Demanda não contemplada pelo catálogo"** quando a confiança for baixa |
| Classificação revisada | Os mesmos campos, editáveis por Robson, com a marca "automática" ou "corrigida por Robson". Guardar as duas versões, para medir a taxa de acerto do classificador |
| Acompanhamento | Situação: Nova, Encaminhada, Respondida, Proposta enviada, Sem atendimento, Arquivada. Laboratório para o qual foi encaminhada, data de encaminhamento, data da resposta, observações, número no CRM (texto livre) |

Histórico: cada mudança de situação ou de classificação grava data, usuário e valor anterior.

### 4. Classificador (no servidor, em PHP)

- Usa `indice_busca.json` (568 serviços, laboratórios com CRD), `vocabulario_use.json` (sinônimos do Scriba), os produtos da loja e o mapa laboratório → área (`AREAS` em `busca.js`; manter uma única fonte para os dois lados, sem duplicar a tabela à mão).
- Mesma normalização da busca da página: sem acento, minúsculas, plural, palavras vazias removidas, sinônimos.
- Pontuação por termos do nome, da descrição e das palavras-chave. Se houver item selecionado ("Pedido: …"), ele define a classificação com confiança alta.
- Limiares de confiança configuráveis no painel.
- Botão "Reclassificar" por solicitação e "Reclassificar todas as não revisadas" (para quando o índice for atualizado).

Casos de teste obrigatórios (resultado esperado em 1º lugar):

| Texto | Área | Laboratório |
|---|---|---|
| "Preciso calibrar um manômetro analógico de 600 bar" | Metrologia e Calibração | LMM |
| "Ensaio de extintor de incêndio classe C" | Segurança ao Fogo | LSFEX |
| "Determinar o poder calorífico superior de um óleo diesel" | Bioenergia e Combustíveis | LBE |
| "Absorção de água pelo método Cobb em caixa de papelão" | Papel e Embalagem | LCPE |
| "Transmitância térmica de uma parede de bloco" | Energia e Conforto Ambiental | LCAP |
| "Reatividade álcali-agregado em barras de argamassa" | Construção Civil | LMPC |
| "Pedido: Óleo de Silicone" | produto (confiança alta) | — |
| "Desenvolvimento de aplicativo para gestão escolar" | — (não contemplada, confiança baixa) | — |

### 5. Telas do painel

| Tela | Conteúdo |
|---|---|
| Visão geral | Filtro de período (7 dias, 30 dias, mês, ano, personalizado). Cartões: visitas, buscas, buscas sem resultado, solicitações, aguardando encaminhamento, não contempladas, tempo médio até o encaminhamento e até a resposta. Gráficos: visitas por dia; solicitações por mês; solicitações por área; por laboratório; por situação; 10 termos mais buscados; 10 buscas sem resultado; funil |
| Solicitações | Lista com filtros (período, situação, área, laboratório, confiança, não contempladas) e busca por texto. Ao abrir uma solicitação: texto original, classificação, edição, histórico |
| Catálogo | Serviços e produtos mais procurados (cliques + solicitações); áreas sem procura no período |
| Exportar | CSV das solicitações e dos indicadores do período (UTF-8 com BOM, separador ";", para abrir no Excel e no Power BI) |
| Configurações | Ligar ou desligar o módulo; limiares do classificador; prazo de guarda dos dados pessoais; resumo por e-mail (desligado por padrão) |

Gráficos com cores que funcionem para daltônicos e um texto alternativo com os números de cada gráfico (tabela abaixo do gráfico).

### 6. Segurança e proteção de dados

- Acesso só para administradores (capacidade `manage_options`). Prever uma capacidade própria (`bsipt_ver_painel`) para liberar a outra pessoa no futuro, sem dar acesso de administrador.
- `nonce` e verificação de capacidade em todas as ações; `$wpdb->prepare` em todas as consultas; saída escapada.
- Nenhum dado de solicitação exposto em endpoint público.
- Prazo de guarda configurável (proposta: 24 meses). Depois do prazo, apagar nome, e-mail, telefone e empresa e manter o restante para as estatísticas.
- Registrar o módulo nas ferramentas de privacidade do WordPress (exportar e apagar dados pessoais por e-mail).
- Desinstalação: apagar as tabelas só se a opção "apagar dados ao desinstalar" estiver marcada (padrão: não). Na mesma revisão, resolver a pendência antiga: `bsipt_campo_pedido`, `bsipt_orcamento_publicado` e a opção do modo vitrine também devem ser removidas nesse caso.

## O que responder agora (RESULTADO DO PASSO 14)

1. Como o contador de visitas da 1.3.15 funciona hoje: onde grava, por qual chamada, como descarta robôs e o que ele pode reaproveitar.
2. Se `wpforms_process_complete` dispara no WPForms Lite instalado (versão) e os IDs e nomes dos campos do formulário 232.
3. Versões de WordPress, PHP e MySQL/MariaDB; se o usuário do banco pode criar tabelas (`dbDelta`).
4. Se o LiteSpeed ou outro plugin de segurança bloqueia chamadas REST ou admin-ajax de visitantes.
5. O modelo de dados proposto: tabelas, colunas, tipos e índices, e o volume estimado em 2 anos.
6. Se a classificação pode reaproveitar a lógica de pontuação de `busca.js` sem duplicá-la, ou como manter as duas iguais.
7. Riscos para a página pública e como evitá-los (tempo de carregamento, cache, erros).
8. Estimativa de esforço e divisão da implementação em entregas que possam ser testadas separadamente.

Não instale nada, não crie tabelas, não altere a página. Aguarde o "ok" de Robson.
