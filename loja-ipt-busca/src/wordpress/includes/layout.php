<?php
/**
 * Exibição do layout novo na página da loja (loja-15) sem editar o Elementor.
 * Desligado por padrão. Pré-visualização só para administradores logados (?bsipt_previa=1).
 * O conteúdo do Elementor não é alterado; volta a aparecer ao desligar.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function bsipt_layout_config() {
	$c = (array) get_option( 'bsipt_layout_loja', array() );
	return array(
		'ativo'   => ! empty( $c['ativo'] ),
		'pagina'  => isset( $c['pagina'] ) ? (int) $c['pagina'] : 565,
		'form'    => isset( $c['form'] ) ? (int) $c['form'] : 232,
		'quando'  => isset( $c['quando'] ) ? (string) $c['quando'] : '',
	);
}

function bsipt_layout_salvar( array $c ) {
	update_option( 'bsipt_layout_loja', $c, false );
	bsipt_layout_limpar_cache( (int) $c['pagina'] );
}

function bsipt_layout_limpar_cache( $pagina ) {
	if ( $pagina > 0 ) {
		do_action( 'litespeed_purge_post', $pagina );
		if ( function_exists( 'rocket_clean_post' ) ) {
			rocket_clean_post( $pagina );
		}
		if ( function_exists( 'clean_post_cache' ) ) {
			clean_post_cache( $pagina );
		}
	}
}

/** O layout novo deve ser exibido nesta requisição? */
function bsipt_layout_exibir_agora() {
	$c = bsipt_layout_config();
	if ( $c['pagina'] <= 0 || ! is_page( $c['pagina'] ) ) {
		return false;
	}
	if ( $c['ativo'] ) {
		return true;
	}
	return isset( $_GET['bsipt_previa'] ) && current_user_can( 'edit_pages' );
}

function bsipt_layout_template( $template ) {
	if ( bsipt_layout_exibir_agora() ) {
		$novo = BSIPT_DIR . 'templates/loja-ipt.php';
		if ( is_readable( $novo ) ) {
			return $novo;
		}
	}
	return $template;
}
add_filter( 'template_include', 'bsipt_layout_template', 99 );

/** Pré-visualização nunca vai para o cache de página. */
function bsipt_layout_sem_cache() {
	if ( isset( $_GET['bsipt_previa'] ) && bsipt_layout_exibir_agora() && ! bsipt_layout_config()['ativo'] ) {
		if ( ! defined( 'DONOTCACHEPAGE' ) ) {
			define( 'DONOTCACHEPAGE', true );
		}
		do_action( 'litespeed_control_set_nocache', 'pre-visualizacao do layout da loja' );
		nocache_headers();
	}
}
add_action( 'template_redirect', 'bsipt_layout_sem_cache', 1 );
