<?php
/** Remove o que o plugin guardou no site. O conteúdo das páginas (shortcode) não é alterado. */
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}
delete_option( 'bsipt_paginas' );
delete_transient( 'bsipt_produtos_v1' );
$bsipt_up  = wp_upload_dir( null, false );
$bsipt_dir = trailingslashit( $bsipt_up['basedir'] ) . 'busca-servicos-ipt';
foreach ( array( 'busca-servicos.json', 'index.php' ) as $bsipt_f ) {
	if ( file_exists( $bsipt_dir . '/' . $bsipt_f ) ) {
		wp_delete_file( $bsipt_dir . '/' . $bsipt_f );
	}
}
if ( is_dir( $bsipt_dir ) ) {
	@rmdir( $bsipt_dir );
}
