=== Busca de Serviços IPT ===
Requires at least: 5.8
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.1.0
License: GPLv2 or later

Busca unificada no catálogo técnico do IPT (ensaios, análises e calibrações) e nos produtos da Loja IPT, sem iframe.

== Uso ==

Insira o shortcode numa página (widget "Shortcode" do Elementor ou bloco "Shortcode" do Gutenberg):

[busca_servicos_ipt titulo="" tema="claro"]

Atributos:

* titulo="..."      Título acima da busca. titulo="" oculta (use quando a página já tem título).
* subtitulo="..."   Substitui a frase "Pesquise entre N serviços...".
* tema="claro"      claro (padrão), escuro ou auto (segue o sistema do visitante).
* produtos="sim"    sim (padrão) inclui os produtos do WooCommerce na busca; nao mostra só o catálogo técnico.
* fonte="arquivo"   arquivo (padrão) ou rest (/wp-json/busca-servicos-ipt/v1/dados), se o servidor bloquear .json.
* dados="URL"       Endereço alternativo do catálogo (mesmo domínio).

Endereços aceitos pela página da busca: ?q=termo, &lab=LME,LMM, &mod=compra|solicitacao, &cgcre=1, &servico=7422.

== Painel ==

Ferramentas → Busca de Serviços IPT: situação dos dados, envio de catálogo novo (validado antes de entrar em uso), retorno ao catálogo do plugin e reconstrução do índice de produtos.

== Produtos ==

Entram na busca os produtos publicados com visibilidade "Loja e resultados de pesquisa" ou "Somente resultados de pesquisa". Produto com preço e comprável aparece como "Compra direta"; sem preço, como "Solicitação de serviço". O índice é refeito ao salvar produtos, e o cache das páginas com a busca é limpo (LiteSpeed Cache e WP Rocket).

== Identidade visual ==

Sobrescreva as variáveis no CSS adicional do tema, sem editar o plugin:

#busca-ipt { --primary: #1b3a5c; --accent: #00aeef; --bg: transparent; --fonte: "Open Sans", Arial, sans-serif; }

== Changelog ==

= 1.1.0 =
* Produtos do WooCommerce na mesma busca, com selo e filtro de modalidade (compra direta ou solicitação de serviço).
* Painel em Ferramentas para atualizar o catálogo sem reinstalar o plugin.
* Limpeza automática do cache das páginas com a busca quando produtos mudam.
* Rodapé institucional com fonte e data dos dados.

= 1.0.0 =
* Primeira versão: catálogo técnico do Scriba com busca, filtros e detalhes.
