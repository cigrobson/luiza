<?php
/**
 * Seções da página da Loja IPT (loja-15), conforme a proposta de layout aprovada:
 * topo com áreas técnicas, categorias técnicas, destaques, busca (vitrine), contato e bloco institucional.
 * Cada seção é um shortcode; [loja_ipt_pagina] monta todas na ordem.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const BSIPT_SAPIENS_URL = 'https://sapiens.ipt.br/index_new.aspx';

/** Áreas técnicas: mesmos ids do mapa em assets/busca.js. */
function bsipt_pagina_areas() {
	return array(
		array( 'papel-embalagem', 'Papel e Embalagem', '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>' ),
		array( 'metrologia-calibracao', 'Metrologia e Calibração', '<circle cx="12" cy="14" r="7"/><path d="M12 14l3-3"/><path d="M10 3h4"/><path d="M12 3v4"/>' ),
		array( 'construcao-civil', 'Construção Civil', '<path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M10 21v-5h4v5"/>' ),
		array( 'energia-conforto', 'Energia e Conforto Ambiental', '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>' ),
		array( 'bioenergia-combustiveis', 'Bioenergia e Combustíveis', '<path d="M12 3s-6 6.2-6 10.8a6 6 0 0 0 12 0C18 9.2 12 3 12 3z"/>' ),
		array( 'seguranca-fogo', 'Segurança ao Fogo', '<path d="M12 22c3.9 0 7-2.9 7-6.8 0-3.6-2.6-5.8-3.7-8.7-1 2.7-2.6 3.7-3.6 3.9.2-2.9-.9-5.4-3-7.4.1 3.8-3.7 6.6-3.7 11.4 0 4.3 3.1 7.6 7 7.6z"/>' ),
		array( 'quimica-processos', 'Química e Processos', '<path d="M9 3h6"/><path d="M10 3v6L4.6 18.6A1.6 1.6 0 0 0 6 21h12a1.6 1.6 0 0 0 1.4-2.4L14 9V3"/><path d="M7.5 15h9"/>' ),
		array( 'meio-ambiente', 'Meio Ambiente, Geotecnia e Biotecnologia', '<path d="M11 20A7 7 0 0 1 4 13C4 7 10 3 20 3c0 10-4 17-9 17z"/><path d="M4 21c3-6 7-9 12-11"/>' ),
	);
}

/**
 * Categorias técnicas (tipo de solução). acao: 'filtro' (busca da página), 'contato' (formulário) ou 'externo'.
 */
function bsipt_pagina_categorias() {
	return array(
		array( 'Ensaios e Análises', 'Cerca de 450 serviços em 19 laboratórios', 'filtro', 'ensaios-analises' ),
		array( 'Calibrações', '111 serviços de calibração de instrumentos', 'filtro', 'calibracoes' ),
		array( 'Materiais de Referência', 'Areia Normal Brasileira', 'filtro', 'materiais-referencia' ),
		array( 'Normas Técnicas — SAA', 'Monitoramento de normas', 'filtro', 'normas-tecnicas' ),
		array( 'Diagnósticos e Laudos', 'Risco de queda de árvores, contaminantes e pareceres', 'filtro', 'diagnosticos-laudos' ),
		array( 'Consultoria e Desenvolvimento', 'Métodos analíticos, validação e assessoria técnica', 'filtro', 'consultoria-desenvolvimento' ),
		array( 'Certificação de Produto', 'IPT OCP / INMETRO', 'contato', 'Certificação de produto' ),
		array( 'Ensino Tecnológico', 'Cursos e capacitações', 'externo', BSIPT_SAPIENS_URL ),
	);
}

function bsipt_pagina_assets() {
	wp_enqueue_style( 'bsipt-fonte', 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap', array(), null );
	wp_enqueue_style( 'bsipt-pagina', BSIPT_URL . 'assets/pagina.css', array( 'bsipt-fonte' ), bsipt_versao_arquivo( BSIPT_DIR . 'assets/pagina.css' ) );
}

function bsipt_pagina_ancora( $atts ) {
	$a = isset( $atts['ancora'] ) ? sanitize_title( $atts['ancora'] ) : '';
	return '' !== $a ? $a : 'catalogo';
}

/* ------------------------------------------------------------------ topo */
function bsipt_sc_topo( $atts ) {
	$atts = shortcode_atts( array( 'ancora' => 'catalogo' ), $atts, 'loja_ipt_topo' );
	bsipt_pagina_assets();
	$anc   = bsipt_pagina_ancora( $atts );
	$areas = '';
	foreach ( bsipt_pagina_areas() as $a ) {
		$areas .= sprintf(
			'<a class="lip-area" href="?area=%1$s#%3$s" data-busca-area="%1$s"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%4$s</svg><span>%2$s</span></a>',
			esc_attr( $a[0] ),
			esc_html( $a[1] ),
			esc_attr( $anc ),
			$a[2]
		);
	}
	return '<section class="lip lip-topo"><div class="lip-wrap">'
		. '<p class="lip-selo">Loja IPT</p>'
		. '<h1 class="lip-h1">Encontre a solução técnica adequada para sua necessidade</h1>'
		. '<p class="lip-sub">Produtos, ensaios, análises, calibrações e capacitações dos laboratórios do IPT.</p>'
		. '<a class="lip-cta" href="#' . esc_attr( $anc ) . '" data-busca-foco><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>Buscar ensaios e calibrações</a>'
		. '<div class="lip-areas-bloco"><p class="lip-rotulo">Áreas técnicas</p><nav class="lip-areas" aria-label="Áreas técnicas">' . $areas . '</nav></div>'
		. '</div></section>';
}
add_shortcode( 'loja_ipt_topo', 'bsipt_sc_topo' );

/* ------------------------------------------------------------------ categorias */
function bsipt_sc_categorias( $atts ) {
	$atts = shortcode_atts( array( 'ancora' => 'catalogo', 'contato' => 'contato' ), $atts, 'loja_ipt_categorias' );
	bsipt_pagina_assets();
	$anc   = bsipt_pagina_ancora( $atts );
	$cards = '';
	foreach ( bsipt_pagina_categorias() as $c ) {
		list( $titulo, $desc, $acao, $valor ) = $c;
		if ( 'filtro' === $acao ) {
			$attrs = sprintf( 'href="?solucao=%1$s#%2$s" data-busca-solucao="%1$s"', esc_attr( $valor ), esc_attr( $anc ) );
			$extra = '';
		} elseif ( 'contato' === $acao ) {
			$attrs = sprintf(
				'href="#%1$s" data-preencher-contato="%2$s" data-contato-rotulo="%3$s" data-contato-prefixo="Assunto:"',
				esc_attr( sanitize_title( $atts['contato'] ) ),
				esc_attr( 'Assunto: ' . $valor . ' (IPT OCP / INMETRO). Produto a certificar e norma de referência: ' ),
				esc_attr( $valor )
			);
			$extra = '';
		} else {
			$attrs = sprintf( 'href="%s" target="_blank" rel="noopener"', esc_url( $valor ) );
			$extra = '<span class="lip-externo" aria-label="abre em nova aba">↗</span>';
		}
		$cards .= '<a class="lip-cat" ' . $attrs . '><span class="lip-cat-titulo">' . esc_html( $titulo ) . $extra . '</span><span class="lip-cat-desc">' . esc_html( $desc ) . '</span></a>';
	}
	return '<section class="lip lip-categorias"><div class="lip-wrap">'
		. '<div class="lip-cab"><h2 class="lip-h2">Categorias técnicas</h2><p class="lip-cab-sub">O que você precisa contratar ou comprar, por tipo de solução</p></div>'
		. '<div class="lip-cats">' . $cards . '</div>'
		. '</div></section>';
}
add_shortcode( 'loja_ipt_categorias', 'bsipt_sc_categorias' );

/* ------------------------------------------------------------------ destaques */
function bsipt_sc_destaques( $atts ) {
	static $n = 0;
	$n++;
	$atts = shortcode_atts( array( 'limite' => 8, 'ids' => '' ), $atts, 'loja_ipt_destaques' );
	bsipt_pagina_assets();
	$todos = bsipt_indice_produtos();
	if ( ! $todos ) {
		return '';
	}
	$limite = max( 1, min( 24, (int) $atts['limite'] ) );
	if ( '' !== trim( $atts['ids'] ) ) {
		$ids  = array_map( 'intval', explode( ',', $atts['ids'] ) );
		$mapa = array();
		foreach ( $todos as $p ) {
			$mapa[ $p['id'] ] = $p;
		}
		$lista = array();
		foreach ( $ids as $id ) {
			if ( isset( $mapa[ $id ] ) ) {
				$lista[] = $mapa[ $id ];
			}
		}
	} else {
		$compra = array_values( array_filter( $todos, function ( $p ) { return ! empty( $p['compra'] ); } ) );
		$solic  = array_values( array_filter( $todos, function ( $p ) { return empty( $p['compra'] ); } ) );
		$metade = (int) ceil( $limite / 2 );
		$lista  = array_merge( array_slice( $compra, 0, $metade ), array_slice( $solic, 0, $limite - min( $metade, count( $compra ) ) ) );
	}
	$lista = array_slice( $lista, 0, $limite );
	$cards = '';
	foreach ( $lista as $p ) {
		$compra = ! empty( $p['compra'] );
		if ( $compra ) {
			$botao = ! empty( $p['carrinho'] )
				? '<a class="lip-prod-btn" href="' . esc_url( $p['carrinho'] ) . '">Adicionar ao carrinho</a>'
				: '<a class="lip-prod-btn" href="' . esc_url( $p['url'] ) . '">Ver opções</a>';
			$preco = '<p class="lip-prod-preco">' . esc_html( $p['preco'] ) . '</p>';
		} else {
			$botao = '<a class="lip-prod-btn lip-prod-btn-sec" href="' . esc_url( $p['url'] ) . '">Solicitar orçamento</a>';
			$preco = '<p class="lip-prod-valor">Valor após avaliação técnica</p>';
		}
		$foto   = ! empty( $p['imagem'] ) ? '<img src="' . esc_url( $p['imagem'] ) . '" alt="" loading="lazy">' : '';
		$cards .= '<article class="lip-prod ' . ( $compra ? 'is-compra' : 'is-solic' ) . '">'
			. '<a class="lip-prod-foto" href="' . esc_url( $p['url'] ) . '" tabindex="-1" aria-hidden="true">' . $foto . '</a>'
			. '<div class="lip-prod-corpo"><p class="lip-prod-selo">' . ( $compra ? 'Compra direta' : 'Solicitação de serviço' ) . '</p>'
			. '<h3 class="lip-prod-nome"><a href="' . esc_url( $p['url'] ) . '">' . esc_html( $p['nome'] ) . '</a></h3>'
			. $preco . $botao . '</div></article>';
	}
	$id = 'lip-dest-' . $n;
	return '<section class="lip lip-destaques">'
		. '<input type="radio" class="lip-radio lip-r-todos" name="' . $id . '" id="' . $id . '-todos" checked>'
		. '<input type="radio" class="lip-radio lip-r-compra" name="' . $id . '" id="' . $id . '-compra">'
		. '<input type="radio" class="lip-radio lip-r-solic" name="' . $id . '" id="' . $id . '-solic">'
		. '<div class="lip-wrap"><div class="lip-dest-cab"><h2 class="lip-h2">Produtos e serviços em destaque</h2>'
		. '<div class="lip-abas" role="group" aria-label="Filtrar destaques">'
		. '<label class="lip-aba lip-aba-todos" for="' . $id . '-todos">Todos</label>'
		. '<label class="lip-aba lip-aba-compra" for="' . $id . '-compra">Compra direta</label>'
		. '<label class="lip-aba lip-aba-solic" for="' . $id . '-solic">Solicitação de serviço</label></div></div>'
		. '<div class="lip-prods">' . $cards . '</div></div></section>';
}
add_shortcode( 'loja_ipt_destaques', 'bsipt_sc_destaques' );

/* ------------------------------------------------------------------ contato */
function bsipt_sc_contato( $atts ) {
	$atts = shortcode_atts( array( 'form' => '232', 'id' => 'contato' ), $atts, 'loja_ipt_contato' );
	bsipt_pagina_assets();
	$n_servicos = 0;
	if ( function_exists( 'bsipt_servicos_atuais' ) ) {
		$n_servicos = bsipt_servicos_atuais();
	}
	$form = do_shortcode( '[wpforms id="' . absint( $atts['form'] ) . '" title="false" description="false"]' );
	return '<section class="lip lip-contato" id="' . esc_attr( sanitize_title( $atts['id'] ) ) . '"><div class="lip-wrap lip-contato-grade">'
		. '<div class="lip-contato-texto"><p class="lip-sobre lip-sobre-azul">Atendimento especializado</p>'
		. '<h2 class="lip-h2 lip-h2-grande">Não encontrou o que precisa?</h2>'
		. '<p class="lip-contato-p">Descreva a amostra, a norma ou o objetivo do ensaio. A equipe técnica indica o serviço adequado entre os ' . ( $n_servicos ? esc_html( number_format_i18n( $n_servicos ) ) : '568' ) . ' do catálogo ou avalia uma demanda fora dele.</p>'
		. '<p class="lip-nota">O termo buscado segue junto com a mensagem.</p><p class="lip-nota">A solicitação vai ao laboratório responsável.</p></div>'
		. '<div class="lip-contato-card" data-busca-contato>'
		. '<div class="lip-sua-busca" data-sua-busca hidden><span><span data-sua-busca-prefixo>Sua busca:</span> <strong data-sua-busca-texto></strong></span><button type="button" class="lip-remover" data-sua-busca-remover>remover</button></div>'
		. $form
		. '<p class="lip-lgpd">Dados tratados conforme a <a href="https://ipt.br/politica-de-privacidade/" target="_blank" rel="noopener">Política de Privacidade</a>.</p>'
		. '</div></div></section>';
}
add_shortcode( 'loja_ipt_contato', 'bsipt_sc_contato' );

/* ------------------------------------------------------------------ institucional */
function bsipt_sc_institucional() {
	bsipt_pagina_assets();
	$itens = array(
		array( '127 anos', 'Fundado em 1899, a serviço da indústria e do Estado' ),
		array( 'Acreditação Cgcre/INMETRO', 'Laboratórios conforme a ISO/IEC 17025' ),
		array( 'Governo de SP', 'Empresa pública vinculada à SCTI-SP' ),
		array( '+1.000 profissionais', 'Pesquisadores, engenheiros e técnicos' ),
	);
	$h = '';
	foreach ( $itens as $i ) {
		$h .= '<div class="lip-inst-item"><p class="lip-inst-titulo">' . esc_html( $i[0] ) . '</p><p class="lip-inst-desc">' . esc_html( $i[1] ) . '</p></div>';
	}
	return '<section class="lip lip-inst"><div class="lip-wrap">'
		. '<p class="lip-sobre">IPT · Qualidade e credibilidade</p>'
		. '<h2 class="lip-h2">Referência nacional em pesquisa e ensaio tecnológico</h2>'
		. '<div class="lip-inst-grade">' . $h . '</div></div></section>'
		. '<div class="lip lip-rodape"><div class="lip-wrap lip-rodape-linha"><nav aria-label="Links institucionais">'
		. '<a href="https://ipt.br/sic-transparencia/" target="_blank" rel="noopener">SIC SP</a>'
		. '<a href="https://ipt.br/politica-de-privacidade/" target="_blank" rel="noopener">Política de Privacidade</a>'
		. '<a href="https://ipt.br/termos-de-uso/" target="_blank" rel="noopener">Termos de Uso</a></nav>'
		. '<p>© ' . esc_html( gmdate( 'Y' ) ) . ' Instituto de Pesquisas Tecnológicas</p></div></div>';
}
add_shortcode( 'loja_ipt_institucional', 'bsipt_sc_institucional' );

/* ------------------------------------------------------------------ página completa */
function bsipt_sc_pagina( $atts ) {
	$atts = shortcode_atts( array( 'form' => '232', 'ancora' => 'catalogo', 'destaques' => 8, 'fonte' => 'arquivo' ), $atts, 'loja_ipt_pagina' );
	$anc  = bsipt_pagina_ancora( $atts );
	return '<div class="lip-pagina">'
		. bsipt_sc_topo( array( 'ancora' => $anc ) )
		. bsipt_sc_categorias( array( 'ancora' => $anc ) )
		. bsipt_sc_destaques( array( 'limite' => $atts['destaques'] ) )
		. bsipt_shortcode( array( 'layout' => 'vitrine', 'titulo' => 'Busca de ensaios, análises e calibrações', 'ancora' => $anc, 'fonte' => 'rest' === $atts['fonte'] ? 'rest' : 'arquivo' ) )
		. bsipt_sc_contato( array( 'form' => $atts['form'] ) )
		. bsipt_sc_institucional()
		. '</div>';
}
add_shortcode( 'loja_ipt_pagina', 'bsipt_sc_pagina' );
