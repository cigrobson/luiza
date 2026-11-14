=== Busca de Serviços IPT ===
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

Busca no catálogo de ensaios, análises e calibrações do IPT, sem iframe.

== Uso ==

Insira o shortcode na página (bloco "Shortcode" do Gutenberg ou widget "Shortcode" do Elementor):

[busca_servicos_ipt]

Atributos opcionais:

* titulo="..."      Título acima da busca. titulo="" oculta (use quando a página já tem título).
* subtitulo="..."   Substitui a frase "Pesquise entre N serviços...".
* tema="claro"      claro (padrão), escuro ou auto (segue o sistema do visitante).
* fonte="arquivo"   arquivo (padrão) lê assets/busca-servicos.json; rest usa /wp-json/busca-servicos-ipt/v1/dados.
* dados="URL"       Endereço alternativo do JSON (mesmo domínio).

== Identidade visual ==

Altere as variáveis no início de assets/busca.css (cores, --fonte, --topo-fixo) ou sobrescreva-as no CSS adicional do tema:

#busca-ipt { --primary: #1d3557; --accent: #01adef; --bg: transparent; }

== Atualizar o catálogo ==

Substitua assets/busca-servicos.json (gerado por scripts/montar_prototipo.py no repositório do projeto) e limpe o cache do site. A versão do arquivo muda sozinha e quebra o cache do navegador.
