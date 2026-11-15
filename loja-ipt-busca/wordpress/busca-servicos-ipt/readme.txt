=== Busca de Serviços IPT ===
Requires at least: 5.8
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.3.0
License: GPLv2 or later

Busca unificada no catálogo técnico do IPT (ensaios, análises e calibrações) e nos produtos da Loja IPT, sem iframe.

== Uso ==

Página da Loja IPT (loja-15), todas as seções: [loja_ipt_pagina form="232"] (atributos: form, destaques, ancora, fonte).
Seções separadas: [loja_ipt_topo], [loja_ipt_categorias], [loja_ipt_destaques limite="8"], [busca_servicos_ipt layout="vitrine"], [loja_ipt_contato form="232"], [loja_ipt_institucional].

Só a busca:

Insira o shortcode numa página (widget "Shortcode" do Elementor ou bloco "Shortcode" do Gutenberg):

[busca_servicos_ipt titulo="" tema="claro"]

Atributos:

* titulo="..."      Título acima da busca. titulo="" oculta (use quando a página já tem título).
* subtitulo="..."   Substitui a frase "Pesquise entre N serviços...".
* tema="claro"      claro (padrão), escuro ou auto (segue o sistema do visitante).
* produtos="sim"    sim (padrão) inclui os produtos do WooCommerce na busca; nao mostra só o catálogo técnico.
* fonte="arquivo"   arquivo (padrão) ou rest (/wp-json/busca-servicos-ipt/v1/dados), se o servidor bloquear .json.
* dados="URL"       Endereço alternativo do catálogo (mesmo domínio).
* ancora="catalogo" id da seção, para links como #catalogo (padrão: catalogo).

Endereços aceitos pela página da busca: ?q=termo, &area=metrologia-calibracao, &solucao=calibracoes, &lab=LME,LMM, &mod=compra|solicitacao, &cgcre=1, &servico=7422.

Integração com a página, sem recarregar:
* Qualquer elemento com data-busca-area="ID", data-busca-solucao="ID" ou data-busca-termo="texto" aplica o filtro e rola até a busca.
* Um <form data-busca-ipt> com campo name="q" pesquisa na busca da página.
* Um elemento com data-preencher-contato="texto" preenche a mensagem do formulário WPForms da página e rola até ele.

Áreas: papel-embalagem, metrologia-calibracao, construcao-civil, energia-conforto, bioenergia-combustiveis, seguranca-fogo, quimica-processos, meio-ambiente.
Tipos de solução: ensaios-analises, calibracoes, materiais-referencia, normas-tecnicas, diagnosticos-laudos, consultoria-desenvolvimento.

== Painel ==

Ferramentas → Busca de Serviços IPT: situação dos dados; coleta do catálogo no Scriba (botão ou uma vez por semana, desligada por padrão), com validação antes de substituir; envio de arquivo de catálogo; retorno ao catálogo do plugin; reconstrução do índice de produtos.

== Produtos ==

Entram na busca os produtos publicados com visibilidade "Loja e resultados de pesquisa" ou "Somente resultados de pesquisa". Produto com preço e comprável aparece como "Compra direta"; sem preço, como "Solicitação de serviço". O índice é refeito ao salvar produtos, e o cache das páginas com a busca é limpo (LiteSpeed Cache e WP Rocket).

== Identidade visual ==

Sobrescreva as variáveis no CSS adicional do tema, sem editar o plugin:

#busca-ipt { --primary: #1b3a5c; --accent: #00aeef; --bg: transparent; --fonte: "Open Sans", Arial, sans-serif; }

== Changelog ==

= 1.3.0 =
* Seções da página da Loja IPT conforme o layout aprovado ([loja_ipt_pagina] e [loja_ipt_*]), com destaques de produtos, busca em modo vitrine com sugestões e formulário com a faixa "Sua busca".
* Filtros Área técnica e Tipo de solução, com chips de filtro ativo removíveis.
* Integração com blocos da página (data-busca-area, data-busca-solucao, data-busca-termo, form data-busca-ipt) sem recarregar.
* Preenchimento do formulário de contato da página (data-preencher-contato); busca sem resultado oferece enviar o termo ao IPT.
* Âncora configurável (padrão #catalogo).

= 1.2.0 =
* Coleta do catálogo no Scriba feita pelo próprio WordPress (botão no painel e opção semanal), sem scripts externos.
* Validação compartilhada entre coleta e envio de arquivo; o catálogo em uso nunca é trocado por um inválido ou muito menor.
* Caixas de seleção e botões ajustados para telas estreitas.

= 1.1.0 =
* Produtos do WooCommerce na mesma busca, com selo e filtro de modalidade (compra direta ou solicitação de serviço).
* Painel em Ferramentas para atualizar o catálogo sem reinstalar o plugin.
* Limpeza automática do cache das páginas com a busca quando produtos mudam.
* Rodapé institucional com fonte e data dos dados.

= 1.0.0 =
* Primeira versão: catálogo técnico do Scriba com busca, filtros e detalhes.
