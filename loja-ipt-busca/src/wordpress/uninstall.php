<?php
/** Remove o que o plugin guardou no site. O conteúdo das páginas (shortcode) não é alterado. */
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}
delete_option( 'bsipt_paginas' );
delete_option( 'bsipt_ultima_sync' );
delete_option( 'bsipt_sync_semanal' );
delete_transient( 'bsipt_sync_trava' );
wp_clear_scheduled_hook( 'bsipt_sincronizar_semanal' );
delete_transient( 'bsipt_produtos_v1' );
delete_transient( 'bsipt_produtos_v2' );
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
