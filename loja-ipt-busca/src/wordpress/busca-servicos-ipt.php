<?php
/**
 * Plugin Name:       Busca de Serviços IPT
 * Description:       Busca no catálogo de ensaios, análises e calibrações do IPT. Use o shortcode [busca_servicos_ipt] na página desejada.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            LID-IPT
 * License:           GPL-2.0-or-later
 * Text Domain:       busca-servicos-ipt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BSIPT_VERSAO', '1.0.0' );
define( 'BSIPT_DIR', plugin_dir_path( __FILE__ ) );
define( 'BSIPT_URL', plugin_dir_url( __FILE__ ) );

/** Versão dos arquivos para quebrar cache quando forem substituídos. */
function bsipt_versao_arquivo( $relativo ) {
	$caminho = BSIPT_DIR . $relativo;
	return file_exists( $caminho ) ? BSIPT_VERSAO . '.' . filemtime( $caminho ) : BSIPT_VERSAO;
}

function bsipt_registrar_assets() {
	wp_register_style( 'busca-servicos-ipt', BSIPT_URL . 'assets/busca.css', array(), bsipt_versao_arquivo( 'assets/busca.css' ) );
	wp_register_script( 'busca-servicos-ipt', BSIPT_URL . 'assets/busca.js', array(), bsipt_versao_arquivo( 'assets/busca.js' ), array( 'in_footer' => true, 'strategy' => 'defer' ) );
}
add_action( 'wp_enqueue_scripts', 'bsipt_registrar_assets', 5 );

/** Carrega CSS no <head> quando o shortcode está no conteúdo (evita piscar sem estilo). */
function bsipt_enfileirar_cedo() {
	$post = get_post();
	if ( $post && has_shortcode( (string) $post->post_content, 'busca_servicos_ipt' ) ) {
		wp_enqueue_style( 'busca-servicos-ipt' );
	}
}
add_action( 'wp_enqueue_scripts', 'bsipt_enfileirar_cedo', 20 );

/** Endpoint alternativo para os dados, caso o servidor bloqueie arquivos .json em wp-content. */
function bsipt_rota_rest() {
	register_rest_route(
		'busca-servicos-ipt/v1',
		'/dados',
		array(
			'methods'             => 'GET',
			'permission_callback' => '__return_true',
			'callback'            => function () {
				$arquivo = BSIPT_DIR . 'assets/busca-servicos.json';
				if ( ! is_readable( $arquivo ) ) {
					return new WP_Error( 'bsipt_sem_dados', 'Catálogo indisponível.', array( 'status' => 503 ) );
				}
				$resposta = new WP_REST_Response( json_decode( file_get_contents( $arquivo ), true ) );
				$resposta->header( 'Cache-Control', 'public, max-age=3600' );
				return $resposta;
			},
		)
	);
}
add_action( 'rest_api_init', 'bsipt_rota_rest' );

/**
 * [busca_servicos_ipt titulo="..." subtitulo="..." tema="claro|escuro|auto" fonte="arquivo|rest" dados="URL"]
 */
function bsipt_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'titulo'    => 'Ensaios, análises e calibrações',
			'subtitulo' => '',
			'tema'      => 'claro',
			'fonte'     => 'arquivo',
			'dados'     => '',
		),
		$atts,
		'busca_servicos_ipt'
	);

	if ( '' !== $atts['dados'] ) {
		$dados_url = $atts['dados'];
	} elseif ( 'rest' === $atts['fonte'] ) {
		$dados_url = add_query_arg( 'v', bsipt_versao_arquivo( 'assets/busca-servicos.json' ), rest_url( 'busca-servicos-ipt/v1/dados' ) );
	} else {
		$dados_url = add_query_arg( 'v', bsipt_versao_arquivo( 'assets/busca-servicos.json' ), BSIPT_URL . 'assets/busca-servicos.json' );
	}

	$temas      = array( 'claro' => 'light', 'escuro' => 'dark', 'auto' => '' );
	$data_theme = isset( $temas[ $atts['tema'] ] ) ? $temas[ $atts['tema'] ] : 'light';

	wp_enqueue_style( 'busca-servicos-ipt' );
	wp_enqueue_script( 'busca-servicos-ipt' );

	$titulo = '' === trim( $atts['titulo'] ) ? '' : '<h2 class="bi-titulo">' . esc_html( $atts['titulo'] ) . '</h2>';
	$html   = file_get_contents( BSIPT_DIR . 'templates/busca.html' );
	$html   = str_replace( '{{TITULO}}', $titulo, $html );
	$html   = str_replace( '{{DADOS_URL}}', esc_url( $dados_url ), $html );
	if ( $data_theme ) {
		$html = str_replace( '<div id="busca-ipt" ', '<div id="busca-ipt" data-theme="' . esc_attr( $data_theme ) . '" ', $html );
	}
	if ( '' !== trim( $atts['subtitulo'] ) ) {
		$html = preg_replace( '#<p id="bi-sub">.*?</p>#s', '<p id="bi-sub" data-fixo="1">' . esc_html( $atts['subtitulo'] ) . '</p>', $html, 1 );
	}
	return $html;
}
add_shortcode( 'busca_servicos_ipt', 'bsipt_shortcode' );
