<?php
/**
 * Página Ferramentas → Busca de Serviços IPT: situação dos dados, envio de catálogo novo
 * e reconstrução do índice de produtos. Apenas administradores (manage_options).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const BSIPT_TAMANHO_MAXIMO = 5242880; // 5 MB

/**
 * Valida o conteúdo de um busca-servicos.json.
 *
 * @param string $conteudo   Texto do arquivo.
 * @param int    $n_atual    Quantidade de serviços no catálogo em uso (0 = desconhecida).
 * @param bool   $confirmado O administrador confirmou uma redução grande.
 * @return array{ok:bool,mensagem:string,dados:array|null}
 */
function bsipt_validar_catalogo( $conteudo, $n_atual = 0, $confirmado = false ) {
	$falha = function ( $m ) {
		return array( 'ok' => false, 'mensagem' => $m, 'dados' => null );
	};
	if ( '' === trim( (string) $conteudo ) ) {
		return $falha( 'O arquivo está vazio.' );
	}
	if ( strlen( $conteudo ) > BSIPT_TAMANHO_MAXIMO ) {
		return $falha( 'O arquivo passa de 5 MB.' );
	}
	$dados = json_decode( $conteudo, true );
	if ( ! is_array( $dados ) ) {
		return $falha( 'O arquivo não é um JSON válido.' );
	}
	if ( ! isset( $dados['meta'], $dados['servicos'], $dados['use'] ) || ! is_array( $dados['servicos'] ) || ! is_array( $dados['use'] ) ) {
		return $falha( 'O JSON não tem a estrutura do catálogo (meta, servicos, use). Use o busca-servicos.json gerado por scripts/montar_prototipo.py.' );
	}
	$n = count( $dados['servicos'] );
	if ( $n < 1 ) {
		return $falha( 'O catálogo não contém serviços.' );
	}
	foreach ( $dados['servicos'] as $i => $s ) {
		if ( ! is_array( $s ) || ! isset( $s['registro'], $s['nome'] ) || ! is_int( $s['registro'] ) || ! is_string( $s['nome'] ) || '' === $s['nome']
			|| ! isset( $s['laboratorios'], $s['palavras_chave'], $s['certificados_cgcre'], $s['contato'] ) ) {
			return $falha( sprintf( 'O serviço na posição %d está incompleto (registro, nome, laboratorios, palavras_chave, certificados_cgcre e contato são obrigatórios).', $i + 1 ) );
		}
	}
	if ( empty( $dados['meta']['coletado_em'] ) || ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) $dados['meta']['coletado_em'] ) ) {
		return $falha( 'meta.coletado_em ausente ou fora do formato AAAA-MM-DD.' );
	}
	if ( $n_atual > 0 && $n < $n_atual / 2 && ! $confirmado ) {
		return $falha( sprintf( 'O arquivo tem %d serviços e o catálogo atual tem %d. Uma queda desse tamanho costuma indicar falha na extração. Se estiver correto, marque a confirmação e envie de novo.', $n, $n_atual ) );
	}
	return array( 'ok' => true, 'mensagem' => sprintf( 'Catálogo com %d serviços, coletado em %s.', $n, $dados['meta']['coletado_em'] ), 'dados' => $dados );
}

/** Resumo do catálogo em uso. */
function bsipt_resumo_catalogo() {
	$arquivo = bsipt_arquivo_dados();
	$resumo  = array( 'arquivo' => $arquivo, 'servicos' => 0, 'laboratorios' => 0, 'use' => 0, 'coletado_em' => '' );
	if ( is_readable( $arquivo['caminho'] ) ) {
		$d = json_decode( file_get_contents( $arquivo['caminho'] ), true );
		if ( is_array( $d ) ) {
			$resumo['servicos']     = isset( $d['servicos'] ) ? count( $d['servicos'] ) : 0;
			$resumo['laboratorios'] = isset( $d['meta']['laboratorios'] ) ? (int) $d['meta']['laboratorios'] : 0;
			$resumo['use']          = isset( $d['use'] ) ? count( $d['use'] ) : 0;
			$resumo['coletado_em']  = isset( $d['meta']['coletado_em'] ) ? $d['meta']['coletado_em'] : '';
		}
	}
	return $resumo;
}

function bsipt_admin_menu() {
	add_management_page( 'Busca de Serviços IPT', 'Busca de Serviços IPT', 'manage_options', 'busca-servicos-ipt', 'bsipt_admin_pagina' );
}
add_action( 'admin_menu', 'bsipt_admin_menu' );

function bsipt_admin_url( $msg = '' ) {
	$url = admin_url( 'tools.php?page=busca-servicos-ipt' );
	return $msg ? add_query_arg( 'bsipt_msg', rawurlencode( $msg ), $url ) : $url;
}

function bsipt_admin_pagina() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$r        = bsipt_resumo_catalogo();
	$produtos = bsipt_indice_produtos();
	$compra   = count( array_filter( $produtos, function ( $p ) { return ! empty( $p['compra'] ); } ) );
	$paginas  = (array) get_option( 'bsipt_paginas', array() );
	$msg      = isset( $_GET['bsipt_msg'] ) ? sanitize_text_field( wp_unslash( $_GET['bsipt_msg'] ) ) : '';
	$data     = $r['coletado_em'] ? implode( '/', array_reverse( explode( '-', $r['coletado_em'] ) ) ) : '—';
	?>
	<div class="wrap">
		<h1>Busca de Serviços IPT</h1>
		<?php if ( $msg ) : ?>
			<div class="notice notice-info is-dismissible"><p><?php echo esc_html( $msg ); ?></p></div>
		<?php endif; ?>

		<h2>Situação</h2>
		<table class="widefat striped" style="max-width:760px">
			<tbody>
				<tr><th>Versão do plugin</th><td><?php echo esc_html( BSIPT_VERSAO ); ?></td></tr>
				<tr><th>Catálogo técnico em uso</th><td><?php echo 'enviado' === $r['arquivo']['origem'] ? 'Arquivo enviado pela administração' : 'Arquivo incluído no plugin'; ?></td></tr>
				<tr><th>Data da coleta</th><td><?php echo esc_html( $data ); ?></td></tr>
				<tr><th>Serviços / laboratórios / sinônimos</th><td><?php echo esc_html( $r['servicos'] . ' / ' . $r['laboratorios'] . ' / ' . $r['use'] ); ?></td></tr>
				<tr><th>Produtos da loja na busca</th><td><?php echo esc_html( count( $produtos ) . ' (' . $compra . ' de compra direta)' ); ?><?php echo function_exists( 'wc_get_products' ) ? '' : ' — WooCommerce inativo'; ?></td></tr>
				<tr><th>Páginas com o shortcode</th><td>
					<?php
					if ( ! $paginas ) {
						echo 'Nenhuma visitada ainda.';
					}
					foreach ( $paginas as $id ) {
						$link = get_permalink( (int) $id );
						if ( $link ) {
							echo '<a href="' . esc_url( $link ) . '">' . esc_html( get_the_title( (int) $id ) ) . '</a><br>';
						}
					}
					?>
				</td></tr>
			</tbody>
		</table>

		<h2>Atualizar o catálogo técnico</h2>
		<p>Envie o <code>busca-servicos.json</code> gerado por <code>scripts/montar_prototipo.py</code> (pasta <code>publicar/</code>). O arquivo é validado antes de entrar em uso, e o cache das páginas com a busca é limpo em seguida.</p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" enctype="multipart/form-data">
			<?php wp_nonce_field( 'bsipt_enviar' ); ?>
			<input type="hidden" name="action" value="bsipt_enviar">
			<p><input type="file" name="bsipt_arquivo" accept=".json,application/json" required></p>
			<p><label><input type="checkbox" name="bsipt_confirmar_reducao" value="1"> Confirmo que o novo catálogo pode ter bem menos serviços que o atual</label></p>
			<?php submit_button( 'Enviar e validar', 'primary', 'submit', false ); ?>
		</form>
		<?php if ( 'enviado' === $r['arquivo']['origem'] ) : ?>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="margin-top:12px">
				<?php wp_nonce_field( 'bsipt_restaurar' ); ?>
				<input type="hidden" name="action" value="bsipt_restaurar">
				<?php submit_button( 'Voltar ao catálogo incluído no plugin', 'secondary', 'submit', false ); ?>
			</form>
		<?php endif; ?>

		<h2>Produtos da loja</h2>
		<p>O índice de produtos é refeito sozinho quando um produto é salvo. Use o botão se alterar produtos por importação ou diretamente no banco.</p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<?php wp_nonce_field( 'bsipt_reindexar' ); ?>
			<input type="hidden" name="action" value="bsipt_reindexar">
			<?php submit_button( 'Refazer índice de produtos e limpar cache', 'secondary', 'submit', false ); ?>
		</form>
	</div>
	<?php
}

function bsipt_admin_enviar() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Sem permissão.' );
	}
	check_admin_referer( 'bsipt_enviar' );
	$f = isset( $_FILES['bsipt_arquivo'] ) ? $_FILES['bsipt_arquivo'] : null;
	if ( ! $f || UPLOAD_ERR_OK !== (int) $f['error'] || ! is_uploaded_file( $f['tmp_name'] ) ) {
		wp_safe_redirect( bsipt_admin_url( 'Nenhum arquivo recebido.' ) );
		exit;
	}
	if ( (int) $f['size'] > BSIPT_TAMANHO_MAXIMO ) {
		wp_safe_redirect( bsipt_admin_url( 'O arquivo passa de 5 MB.' ) );
		exit;
	}
	$atual = bsipt_resumo_catalogo();
	$v     = bsipt_validar_catalogo( file_get_contents( $f['tmp_name'] ), (int) $atual['servicos'], ! empty( $_POST['bsipt_confirmar_reducao'] ) );
	if ( ! $v['ok'] ) {
		wp_safe_redirect( bsipt_admin_url( 'Arquivo recusado: ' . $v['mensagem'] ) );
		exit;
	}
	$up  = wp_upload_dir( null, false );
	$dir = trailingslashit( $up['basedir'] ) . 'busca-servicos-ipt';
	if ( ! wp_mkdir_p( $dir ) ) {
		wp_safe_redirect( bsipt_admin_url( 'Não foi possível criar a pasta em uploads.' ) );
		exit;
	}
	$ok = file_put_contents( $dir . '/busca-servicos.json', wp_json_encode( $v['dados'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) );
	if ( false === $ok ) {
		wp_safe_redirect( bsipt_admin_url( 'Não foi possível gravar o arquivo em uploads.' ) );
		exit;
	}
	if ( ! file_exists( $dir . '/index.php' ) ) {
		file_put_contents( $dir . '/index.php', "<?php // Silêncio.\n" );
	}
	bsipt_limpar_cache_paginas();
	wp_safe_redirect( bsipt_admin_url( 'Catálogo atualizado. ' . $v['mensagem'] ) );
	exit;
}
add_action( 'admin_post_bsipt_enviar', 'bsipt_admin_enviar' );

function bsipt_admin_restaurar() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Sem permissão.' );
	}
	check_admin_referer( 'bsipt_restaurar' );
	$up      = wp_upload_dir( null, false );
	$arquivo = trailingslashit( $up['basedir'] ) . 'busca-servicos-ipt/busca-servicos.json';
	if ( file_exists( $arquivo ) ) {
		wp_delete_file( $arquivo );
	}
	bsipt_limpar_cache_paginas();
	wp_safe_redirect( bsipt_admin_url( 'Voltou a valer o catálogo incluído no plugin.' ) );
	exit;
}
add_action( 'admin_post_bsipt_restaurar', 'bsipt_admin_restaurar' );

function bsipt_admin_reindexar() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Sem permissão.' );
	}
	check_admin_referer( 'bsipt_reindexar' );
	bsipt_limpar_cache_produtos();
	$n = count( bsipt_indice_produtos() );
	wp_safe_redirect( bsipt_admin_url( sprintf( 'Índice refeito: %d produtos. Cache das páginas limpo.', $n ) ) );
	exit;
}
add_action( 'admin_post_bsipt_reindexar', 'bsipt_admin_reindexar' );

/** Link "Configurações" na lista de plugins. */
function bsipt_link_plugins( $links ) {
	array_unshift( $links, '<a href="' . esc_url( bsipt_admin_url() ) . '">Painel</a>' );
	return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( BSIPT_DIR . 'busca-servicos-ipt.php' ), 'bsipt_link_plugins' );
