<?php
/**
 * Modelo da página da Loja IPT com o layout novo.
 * O conteúdo é montado antes do cabeçalho para que os estilos do plugin entrem no <head>.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$bsipt_cfg      = bsipt_layout_config();
$bsipt_conteudo = do_shortcode( '[loja_ipt_pagina form="' . (int) $bsipt_cfg['form'] . '"]' );
$bsipt_previa   = ! $bsipt_cfg['ativo'];
get_header();
if ( $bsipt_previa ) {
	echo '<div style="background:#fff4d6;color:#5c4400;border-bottom:1px solid #e9cf86;padding:10px 16px;text-align:center;font:14px/1.4 Arial,sans-serif">'
		. 'Pré-visualização do layout novo — visível só para administradores. Os visitantes ainda veem a página atual. '
		. '<a style="color:#5c4400;font-weight:bold" href="' . esc_url( admin_url( 'tools.php?page=busca-servicos-ipt#layout' ) ) . '">Voltar ao painel</a></div>';
}
echo '<main id="bsipt-loja" class="bsipt-loja-pagina">' . $bsipt_conteudo . '</main>';
get_footer();
