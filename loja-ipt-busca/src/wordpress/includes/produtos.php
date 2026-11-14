<?php
/**
 * Índice dos produtos WooCommerce para a busca unificada.
 * Gerado no servidor, guardado em transient e entregue dentro da página (sem requisição extra).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const BSIPT_TRANSIENT_PRODUTOS = 'bsipt_produtos_v1';

/** Remove HTML, o texto do botão "Solicitar orçamento" e limita o tamanho (mesma regra de scripts/produtos_loja.py). */
function bsipt_limpar_texto( $texto, $limite = 700 ) {
	$t = wp_strip_all_tags( (string) $texto );
	$t = html_entity_decode( $t, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	$t = trim( preg_replace( '/\s+/u', ' ', $t ) );
	$t = trim( preg_replace( '/\s*Solicitar orçamento\s*$/iu', '', $t ) );
	if ( function_exists( 'mb_strlen' ) && mb_strlen( $t ) > $limite ) {
		$t = mb_substr( $t, 0, $limite );
		$t = rtrim( preg_replace( '/\s+\S*$/u', '', $t ), ' ,.;:' ) . '…';
	}
	return $t;
}

/**
 * @return array<int,array<string,mixed>> Produtos publicados e visíveis no catálogo.
 */
function bsipt_indice_produtos() {
	if ( ! function_exists( 'wc_get_products' ) ) {
		return array();
	}
	$cache = get_transient( BSIPT_TRANSIENT_PRODUTOS );
	if ( is_array( $cache ) ) {
		return $cache;
	}

	$itens               = array();
	$ocultar_sem_estoque = 'yes' === get_option( 'woocommerce_hide_out_of_stock_items' );
	$produtos = wc_get_products(
		array(
			'status'  => 'publish',
			'limit'   => -1,
			'orderby' => 'title',
			'order'   => 'ASC',
		)
	);
	foreach ( $produtos as $p ) {
		// Visibilidade WooCommerce: "visible" e "search" aparecem em buscas; "catalog" (só vitrine) e "hidden" não.
		if ( ! in_array( $p->get_catalog_visibility(), array( 'visible', 'search' ), true ) ) {
			continue;
		}
		if ( $ocultar_sem_estoque && ! $p->is_in_stock() ) {
			continue;
		}
		$preco_num = (float) $p->get_price();
		$compra    = $p->is_purchasable() && $preco_num > 0;
		$preco     = '';
		if ( $compra ) {
			$preco = trim( html_entity_decode( wp_strip_all_tags( $p->get_price_html() ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
			$preco = preg_replace( '/\s+/u', ' ', $preco );
			$preco = preg_replace( '/\s*Faixa de preço:.*$/u', '', $preco );
		}
		$carrinho = '';
		if ( $compra && 'simple' === $p->get_type() && $p->is_in_stock() && function_exists( 'wc_get_cart_url' ) ) {
			$carrinho = add_query_arg( 'add-to-cart', $p->get_id(), wc_get_cart_url() );
		}
		$categorias = wc_get_product_terms( $p->get_id(), 'product_cat', array( 'fields' => 'names' ) );
		$tags       = wc_get_product_terms( $p->get_id(), 'product_tag', array( 'fields' => 'names' ) );
		$descricao  = $p->get_short_description() ? $p->get_short_description() : $p->get_description();

		$itens[] = array(
			'id'         => $p->get_id(),
			'nome'       => html_entity_decode( wp_strip_all_tags( $p->get_name() ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ),
			'descricao'  => bsipt_limpar_texto( $descricao ),
			'categorias' => array_values( array_map( 'html_entity_decode', (array) $categorias ) ),
			'tags'       => array_values( array_map( 'html_entity_decode', (array) $tags ) ),
			'sku'        => (string) $p->get_sku(),
			'tipo'       => $p->get_type(),
			'compra'     => $compra,
			'preco'      => $preco,
			'url'        => $p->get_permalink(),
			'carrinho'   => $carrinho,
		);
	}
	set_transient( BSIPT_TRANSIENT_PRODUTOS, $itens, 12 * HOUR_IN_SECONDS );
	return $itens;
}

/** Limpa o índice e o cache de página das páginas que usam o shortcode. */
function bsipt_limpar_cache_produtos() {
	delete_transient( BSIPT_TRANSIENT_PRODUTOS );
	bsipt_limpar_cache_paginas();
}

function bsipt_limpar_cache_paginas() {
	foreach ( (array) get_option( 'bsipt_paginas', array() ) as $id ) {
		$id = (int) $id;
		if ( $id <= 0 ) {
			continue;
		}
		do_action( 'litespeed_purge_post', $id );       // LiteSpeed Cache
		if ( function_exists( 'rocket_clean_post' ) ) { // WP Rocket
			rocket_clean_post( $id );
		}
		if ( function_exists( 'clean_post_cache' ) ) {
			clean_post_cache( $id );
		}
	}
}

function bsipt_ao_salvar_post( $post_id, $post = null ) {
	$tipo = $post ? $post->post_type : get_post_type( $post_id );
	if ( 'product' === $tipo || 'product_variation' === $tipo ) {
		bsipt_limpar_cache_produtos();
	}
}
add_action( 'save_post', 'bsipt_ao_salvar_post', 20, 2 );
add_action( 'deleted_post', 'bsipt_ao_salvar_post', 20, 1 );
add_action( 'trashed_post', 'bsipt_ao_salvar_post', 20, 1 );
add_action( 'woocommerce_update_product', 'bsipt_limpar_cache_produtos', 20, 0 );
add_action( 'woocommerce_product_set_stock', 'bsipt_limpar_cache_produtos', 20, 0 );
add_action( 'woocommerce_variation_set_stock', 'bsipt_limpar_cache_produtos', 20, 0 );
add_action( 'edited_product_cat', 'bsipt_limpar_cache_produtos', 20, 0 );
