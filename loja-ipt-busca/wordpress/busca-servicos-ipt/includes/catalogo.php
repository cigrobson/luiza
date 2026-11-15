<?php
/**
 * Catálogo técnico: coleta no Scriba, conversão, validação e gravação, tudo dentro do WordPress.
 * A conversão reproduz scripts/extrair_escriba.py (mesmas regras, mesmo formato de saída).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const BSIPT_TAMANHO_MAXIMO = 5242880; // 5 MB
const BSIPT_SCRIBA_URL     = 'https://escriba.ipt.br/Busca_EAC/pesquisas.asp';
const BSIPT_EVENTO_SEMANAL = 'bsipt_sincronizar_semanal';

/* ---------------------------------------------------------------- validação e gravação */

/**
 * Valida o conteúdo de um catálogo (JSON).
 *
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
		return $falha( 'O JSON não tem a estrutura do catálogo (meta, servicos, use).' );
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
		return $falha( sprintf( 'O novo catálogo tem %d serviços e o atual tem %d. Uma queda desse tamanho costuma indicar falha na coleta ou mudança na página do Scriba. O catálogo atual foi mantido.', $n, $n_atual ) );
	}
	return array( 'ok' => true, 'mensagem' => sprintf( 'Catálogo com %d serviços, coletado em %s.', $n, $dados['meta']['coletado_em'] ), 'dados' => $dados );
}

/** Quantidade de serviços no catálogo em uso. */
function bsipt_servicos_atuais() {
	$arquivo = bsipt_arquivo_dados();
	if ( ! is_readable( $arquivo['caminho'] ) ) {
		return 0;
	}
	$d = json_decode( file_get_contents( $arquivo['caminho'] ), true );
	return ( is_array( $d ) && isset( $d['servicos'] ) ) ? count( $d['servicos'] ) : 0;
}

/**
 * Grava o catálogo validado em wp-content/uploads/busca-servicos-ipt/ e limpa o cache das páginas.
 *
 * @return true|string true ou mensagem de erro.
 */
function bsipt_salvar_catalogo( array $dados ) {
	$up  = wp_upload_dir( null, false );
	$dir = trailingslashit( $up['basedir'] ) . 'busca-servicos-ipt';
	if ( ! wp_mkdir_p( $dir ) ) {
		return 'Não foi possível criar a pasta em uploads.';
	}
	$json = wp_json_encode( $dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
	$tmp  = $dir . '/busca-servicos.json.tmp';
	if ( false === file_put_contents( $tmp, $json ) || ! rename( $tmp, $dir . '/busca-servicos.json' ) ) {
		return 'Não foi possível gravar o arquivo em uploads.';
	}
	if ( ! file_exists( $dir . '/index.php' ) ) {
		file_put_contents( $dir . '/index.php', "<?php // Silêncio.\n" );
	}
	bsipt_limpar_cache_paginas();
	return true;
}

/* ---------------------------------------------------------------- conversão do HTML do Scriba */

/** Equivale a limpa() do extrator Python: sem tags, entidades decodificadas, espaços (inclusive &nbsp;) colapsados. */
function bsipt_limpa( $s ) {
	$s = preg_replace( '/<[^>]+>/u', ' ', (string) $s );
	$s = html_entity_decode( $s, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	$s = preg_replace( '/[\s\x{00A0}]+/u', ' ', $s );
	return preg_replace( '/^[\s\x{00A0}]+|[\s\x{00A0}]+$/u', '', $s );
}

/** Converte a resposta do Scriba (Windows-1252, sem declaração de charset) para UTF-8. */
function bsipt_para_utf8( $bruto ) {
	if ( function_exists( 'mb_convert_encoding' ) ) {
		return mb_convert_encoding( $bruto, 'UTF-8', 'Windows-1252' );
	}
	$r = function_exists( 'iconv' ) ? iconv( 'Windows-1252', 'UTF-8//IGNORE', $bruto ) : false;
	return false === $r ? utf8_encode( $bruto ) : $r;
}

/**
 * Extrai serviços e vocabulário controlado do HTML (UTF-8) de pesquisas.asp com TxtTermo=%.
 *
 * @return array{meta:array,servicos:array,use:array}
 */
function bsipt_extrair_scriba( $t, $data = null ) {
	// Vocabulário controlado: termo não preferido -> "pesquise por" termo preferido.
	$use = array();
	preg_match_all(
		'#<td width="500px">\s*<font class="cinza_13">(.*?)</font>\s*</td>\s*<td width="100px">\s*<font class="cinza_13">pesquise por:</font>.*?name="TermoUse" value="([^"]*)"#su',
		$t,
		$mu,
		PREG_SET_ORDER
	);
	foreach ( $mu as $m ) {
		$termo                       = bsipt_limpa( $m[1] );
		$pref                        = trim( html_entity_decode( $m[2], ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
		$use[ $termo . "\0" . $pref ] = array( 'termo' => $termo, 'use' => $pref );
	}
	$use = array_values( $use );
	usort(
		$use,
		function ( $a, $b ) {
			return strcmp( $a['termo'], $b['termo'] );
		}
	);

	// Serviços: um <table> por resultado; o mesmo registro pode repetir com outro laboratório ou certificado.
	preg_match_all( '#<table>\s*<tr>\s*<td style="vertical-align:text-top;width:120px;">.*?</table>#su', $t, $mb );
	$blocos = $mb[0];
	$servs  = array();
	foreach ( $blocos as $b ) {
		$campos = array();
		preg_match_all( '#width:120px;">\s*<font class="cinza_13">\s*([^<]+?):</font>\s*</td>\s*<td\s*>(.*?)</td>#su', $b, $mc, PREG_SET_ORDER );
		foreach ( $mc as $c ) {
			$campos[ trim( $c[1] ) ] = $c[2];
		}
		if ( ! isset( $campos['Serviço'], $campos['Nome'], $campos['Laboratório'], $campos['Tipo de serviço'] ) || ! preg_match( '/\d+/', bsipt_limpa( $campos['Serviço'] ), $mr ) ) {
			continue;
		}
		$reg = (int) $mr[0];
		$url = null;
		if ( isset( $campos['Contato'] ) && preg_match( "#href='([^']+)'#u", $campos['Contato'], $mh ) ) {
			$url = html_entity_decode( $mh[1], ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		}
		$crd = null;
		$man = null;
		if ( $url && preg_match( '/Manifestacao=(\d+)&Ensaio=(\d+)&CRD=(\w+)/', $url, $mm ) ) {
			$man = $mm[1];
			$crd = $mm[3];
		}
		$certs = array();
		if ( isset( $campos['Certificado Cgcre'] ) ) {
			preg_match_all( '#href="([^"]+)"[^>]*>(.*?)</a>#su', $campos['Certificado Cgcre'], $mcert, PREG_SET_ORDER );
			foreach ( $mcert as $x ) {
				$certs[] = array( 'codigo' => bsipt_limpa( $x[2] ), 'url' => $x[1] );
			}
		}
		$lab_txt = bsipt_limpa( $campos['Laboratório'] );
		$partes  = explode( '-', $lab_txt, 2 );
		$nome_l  = isset( $partes[1] ) ? trim( $partes[1] ) : '';
		$lab     = array( 'sigla' => trim( $partes[0] ), 'nome' => '' !== $nome_l ? $nome_l : $lab_txt, 'crd' => $crd );

		if ( ! isset( $servs[ $reg ] ) ) {
			$pc   = isset( $campos['Palavras-chave'] ) ? bsipt_limpa( $campos['Palavras-chave'] ) : '';
			$desc = isset( $campos['Descrição'] ) ? bsipt_limpa( $campos['Descrição'] ) : '';
			$servs[ $reg ] = array(
				'registro'           => $reg,
				'tipo_servico'       => bsipt_limpa( $campos['Tipo de serviço'] ),
				'nome'               => bsipt_limpa( $campos['Nome'] ),
				'descricao'          => '' !== $desc ? $desc : null,
				'palavras_chave'     => array_values( array_filter( array_map( 'trim', explode( ';', $pc ) ), 'strlen' ) ),
				'laboratorios'       => array(),
				'certificados_cgcre' => array(),
				'contato'            => array( 'url' => $url, 'manifestacao' => $man ),
			);
		}
		if ( ! in_array( $lab, $servs[ $reg ]['laboratorios'], true ) ) {
			$servs[ $reg ]['laboratorios'][] = $lab;
		}
		foreach ( $certs as $c ) {
			if ( ! in_array( $c, $servs[ $reg ]['certificados_cgcre'], true ) ) {
				$servs[ $reg ]['certificados_cgcre'][] = $c;
			}
		}
	}
	$servs = array_values( $servs );
	$labs  = array();
	foreach ( $servs as $s ) {
		foreach ( $s['laboratorios'] as $l ) {
			$labs[ $l['sigla'] ] = true;
		}
	}
	return array(
		'meta'     => array(
			'fonte'           => 'https://escriba.ipt.br/Busca_EAC/pesquisas.asp (POST TxtTermo=%)',
			'coletado_em'     => $data ? $data : gmdate( 'Y-m-d' ),
			'blocos_html'     => count( $blocos ),
			'servicos_unicos' => count( $servs ),
			'laboratorios'    => count( $labs ),
			'termos_use'      => count( $use ),
		),
		'servicos' => $servs,
		'use'      => $use,
	);
}

/* ---------------------------------------------------------------- coleta no Scriba */

/**
 * Faz UMA requisição à busca pública do Scriba, converte, valida e grava.
 * Nunca substitui o catálogo atual por um inválido ou muito menor.
 *
 * @param string $origem 'manual' ou 'agendada'.
 * @return array{ok:bool,mensagem:string}
 */
function bsipt_sincronizar_scriba( $origem = 'manual' ) {
	if ( get_transient( 'bsipt_sync_trava' ) ) {
		return bsipt_registrar_sync( false, 'Já houve uma coleta na última hora. Aguarde para não sobrecarregar o Scriba.', $origem );
	}
	set_transient( 'bsipt_sync_trava', 1, HOUR_IN_SECONDS );

	$resposta = wp_remote_post(
		BSIPT_SCRIBA_URL,
		array(
			'timeout'    => 90,
			'user-agent' => 'Loja IPT - Busca de Servicos (WordPress)',
			'body'       => array( 'TxtTermo' => '%' ),
		)
	);
	if ( is_wp_error( $resposta ) ) {
		return bsipt_registrar_sync( false, 'O Scriba não respondeu: ' . $resposta->get_error_message(), $origem );
	}
	$codigo = (int) wp_remote_retrieve_response_code( $resposta );
	$corpo  = (string) wp_remote_retrieve_body( $resposta );
	if ( 200 !== $codigo || false === strpos( $corpo, 'Registro n' ) ) {
		return bsipt_registrar_sync( false, sprintf( 'Resposta inesperada do Scriba (HTTP %d, %d bytes). O catálogo atual foi mantido.', $codigo, strlen( $corpo ) ), $origem );
	}

	$dados = bsipt_extrair_scriba( bsipt_para_utf8( $corpo ), current_time( 'Y-m-d' ) );
	$v     = bsipt_validar_catalogo( wp_json_encode( $dados, JSON_UNESCAPED_UNICODE ), bsipt_servicos_atuais(), false );
	if ( ! $v['ok'] ) {
		return bsipt_registrar_sync( false, $v['mensagem'], $origem );
	}
	$gravou = bsipt_salvar_catalogo( $v['dados'] );
	if ( true !== $gravou ) {
		return bsipt_registrar_sync( false, $gravou, $origem );
	}
	return bsipt_registrar_sync( true, 'Catálogo atualizado a partir do Scriba. ' . $v['mensagem'], $origem );
}

function bsipt_registrar_sync( $ok, $mensagem, $origem ) {
	update_option(
		'bsipt_ultima_sync',
		array(
			'quando'   => current_time( 'mysql' ),
			'ok'       => (bool) $ok,
			'mensagem' => $mensagem,
			'origem'   => $origem,
		),
		false
	);
	return array( 'ok' => (bool) $ok, 'mensagem' => $mensagem );
}

/* ---------------------------------------------------------------- atualização semanal (opcional) */

function bsipt_executar_sync_agendada() {
	bsipt_sincronizar_scriba( 'agendada' );
}
add_action( BSIPT_EVENTO_SEMANAL, 'bsipt_executar_sync_agendada' );

/** Liga ou desliga a coleta semanal. Desligada por padrão. */
function bsipt_definir_sync_semanal( $ligar ) {
	update_option( 'bsipt_sync_semanal', $ligar ? 1 : 0, false );
	wp_clear_scheduled_hook( BSIPT_EVENTO_SEMANAL );
	if ( $ligar ) {
		wp_schedule_event( time() + HOUR_IN_SECONDS, 'weekly', BSIPT_EVENTO_SEMANAL );
	}
}
