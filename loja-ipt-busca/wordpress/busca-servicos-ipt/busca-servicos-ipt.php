<?php
/**
 * Plugin Name:       Busca de Serviços IPT
 * Description:       Busca unificada no catálogo técnico do IPT e nos produtos da loja, com as seções da página da Loja IPT. Shortcodes: [loja_ipt_pagina], [busca_servicos_ipt] e seções [loja_ipt_*].
 * Version:           1.3.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            LID-IPT – Laboratório Virtual de Inteligência Digital Aplicada
 * License:           GPL-2.0-or-later
 * Text Domain:       busca-servicos-ipt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BSIPT_VERSAO', '1.3.0' );
define( 'BSIPT_DIR', plugin_dir_path( __FILE__ ) );
define( 'BSIPT_URL', plugin_dir_url( __FILE__ ) );

require_once BSIPT_DIR . 'includes/produtos.php';
require_once BSIPT_DIR . 'includes/catalogo.php';
require_once BSIPT_DIR . 'includes/pagina.php';
if ( is_admin() ) {
	require_once BSIPT_DIR . 'includes/admin.php';
}

/** Ao desativar, cancela a coleta semanal (a opção fica guardada para quando reativar). */
function bsipt_desativar() {
	wp_clear_scheduled_hook( 'bsipt_sincronizar_semanal' );
}
register_deactivation_hook( __FILE__, 'bsipt_desativar' );

/** Ao reativar, religa a coleta semanal se estava ligada. */
function bsipt_ativar() {
	if ( get_option( 'bsipt_sync_semanal' ) && ! wp_next_scheduled( 'bsipt_sincronizar_semanal' ) ) {
		wp_schedule_event( time() + HOUR_IN_SECONDS, 'weekly', 'bsipt_sincronizar_semanal' );
	}
}
register_activation_hook( __FILE__, 'bsipt_ativar' );

/**
 * Arquivo do catálogo técnico em uso: o enviado pela página de administração
 * (wp-content/uploads/busca-servicos-ipt/) tem prioridade sobre o que acompanha o plugin.
 *
 * @return array{caminho:string,url:string,origem:string}
 */
function bsipt_arquivo_dados() {
	$up      = wp_upload_dir( null, false );
	$enviado = trailingslashit( $up['basedir'] ) . 'busca-servicos-ipt/busca-servicos.json';
	if ( is_readable( $enviado ) ) {
		return array(
			'caminho' => $enviado,
			'url'     => trailingslashit( $up['baseurl'] ) . 'busca-servicos-ipt/busca-servicos.json',
			'origem'  => 'enviado',
		);
	}
	return array(
		'caminho' => BSIPT_DIR . 'assets/busca-servicos.json',
		'url'     => BSIPT_URL . 'assets/busca-servicos.json',
		'origem'  => 'plugin',
	);
}

/** Versão para quebrar o cache do navegador quando um arquivo muda. */
function bsipt_versao_arquivo( $caminho ) {
	return file_exists( $caminho ) ? BSIPT_VERSAO . '.' . filemtime( $caminho ) : BSIPT_VERSAO;
}

function bsipt_registrar_assets() {
	wp_register_style( 'busca-servicos-ipt', BSIPT_URL . 'assets/busca.css', array(), bsipt_versao_arquivo( BSIPT_DIR . 'assets/busca.css' ) );
	wp_register_script( 'busca-servicos-ipt', BSIPT_URL . 'assets/busca.js', array(), bsipt_versao_arquivo( BSIPT_DIR . 'assets/busca.js' ), array( 'in_footer' => true, 'strategy' => 'defer' ) );
}
add_action( 'wp_enqueue_scripts', 'bsipt_registrar_assets', 5 );

/** Carrega o CSS no <head> quando o shortcode está no conteúdo (evita piscar sem estilo). */
function bsipt_enfileirar_cedo() {
	$post = get_post();
	if ( $post && has_shortcode( (string) $post->post_content, 'busca_servicos_ipt' ) ) {
		wp_enqueue_style( 'busca-servicos-ipt' );
	}
}
add_action( 'wp_enqueue_scripts', 'bsipt_enfileirar_cedo', 20 );

/** Rota alternativa para o catálogo, caso o servidor bloqueie arquivos .json em wp-content. */
function bsipt_rota_rest() {
	register_rest_route(
		'busca-servicos-ipt/v1',
		'/dados',
		array(
			'methods'             => 'GET',
			'permission_callback' => '__return_true',
			'callback'            => function () {
				$arquivo = bsipt_arquivo_dados();
				if ( ! is_readable( $arquivo['caminho'] ) ) {
					return new WP_Error( 'bsipt_sem_dados', 'Catálogo indisponível.', array( 'status' => 503 ) );
				}
				$resposta = new WP_REST_Response( json_decode( file_get_contents( $arquivo['caminho'] ), true ) );
				$resposta->header( 'Cache-Control', 'public, max-age=3600' );
				return $resposta;
			},
		)
	);
}
add_action( 'rest_api_init', 'bsipt_rota_rest' );

/** Guarda as páginas que usam o shortcode, para limpar o cache delas quando produtos mudarem. */
function bsipt_registrar_pagina() {
	$id = (int) get_the_ID();
	if ( $id <= 0 ) {
		return;
	}
	$paginas = (array) get_option( 'bsipt_paginas', array() );
	if ( ! in_array( $id, $paginas, true ) ) {
		$paginas[] = $id;
		update_option( 'bsipt_paginas', array_values( array_unique( array_map( 'intval', $paginas ) ) ), false );
	}
}

/**
 * [busca_servicos_ipt titulo="..." subtitulo="..." tema="claro|escuro|auto" produtos="sim|nao" fonte="arquivo|rest" dados="URL" ancora="catalogo" layout="catalogo|vitrine"]
 */
function bsipt_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'titulo'    => 'Ensaios, análises e calibrações',
			'subtitulo' => '',
			'tema'      => 'claro',
			'produtos'  => 'sim',
			'fonte'     => 'arquivo',
			'dados'     => '',
			'ancora'    => 'catalogo',
			'layout'    => 'catalogo',
		),
		$atts,
		'busca_servicos_ipt'
	);

	$arquivo = bsipt_arquivo_dados();
	$versao  = bsipt_versao_arquivo( $arquivo['caminho'] );
	if ( '' !== $atts['dados'] ) {
		$dados_url = $atts['dados'];
	} elseif ( 'rest' === $atts['fonte'] ) {
		$dados_url = add_query_arg( 'v', $versao, rest_url( 'busca-servicos-ipt/v1/dados' ) );
	} else {
		$dados_url = add_query_arg( 'v', $versao, $arquivo['url'] );
	}

	$temas      = array( 'claro' => 'light', 'escuro' => 'dark', 'auto' => '' );
	$data_theme = isset( $temas[ $atts['tema'] ] ) ? $temas[ $atts['tema'] ] : 'light';

	wp_enqueue_style( 'busca-servicos-ipt' );
	wp_enqueue_script( 'busca-servicos-ipt' );
	bsipt_registrar_pagina();

	$titulo = '' === trim( $atts['titulo'] ) ? '' : '<h2 class="bi-titulo">' . esc_html( $atts['titulo'] ) . '</h2>';
	$html   = file_get_contents( BSIPT_DIR . 'templates/busca.html' );
	$html   = str_replace( '{{TITULO}}', $titulo, $html );
	$html   = str_replace( '{{DADOS_URL}}', esc_url( $dados_url ), $html );
	$ancora = sanitize_title( $atts['ancora'] );
	$html   = str_replace( '{{LAYOUT}}', 'vitrine' === $atts['layout'] ? 'vitrine' : 'catalogo', $html );
	$html   = str_replace( '{{ANCORA}}', esc_attr( '' !== $ancora ? $ancora : 'catalogo' ), $html );
	if ( $data_theme ) {
		$html = str_replace( '<div id="busca-ipt" ', '<div id="busca-ipt" data-theme="' . esc_attr( $data_theme ) . '" ', $html );
	}
	if ( '' !== trim( $atts['subtitulo'] ) ) {
		$html = preg_replace( '#<p id="bi-sub">.*?</p>#s', '<p id="bi-sub" data-fixo="1">' . esc_html( $atts['subtitulo'] ) . '</p>', $html, 1 );
	}

	if ( 'nao' !== $atts['produtos'] ) {
		$produtos = bsipt_indice_produtos();
		if ( $produtos ) {
			$json = wp_json_encode( $produtos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP );
			$html .= "\n" . '<script type="application/json" id="bi-produtos">' . $json . '</script>';
		}
	}
	return $html;
}
add_shortcode( 'busca_servicos_ipt', 'bsipt_shortcode' );
