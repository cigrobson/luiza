<?php
// Simulação mínima do WordPress, com tema propositalmente agressivo, para testar o plugin real sem instalar WordPress.
// Uso (a partir de loja-ipt-busca/): php -S 127.0.0.1:8765 scripts/wp_simulado.php
// Depois: node scripts/testar_busca.js http://127.0.0.1:8765/loja-15/
// Outro shortcode: http://127.0.0.1:8765/loja-15/?sc=[busca_servicos_ipt titulo="Catálogo" tema="auto" fonte="rest"]
$PLUGIN = dirname(__DIR__) . '/wordpress/busca-servicos-ipt/';
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (strpos($uri, '/wp-content/plugins/busca-servicos-ipt/') === 0) {
  $f = $PLUGIN . substr($uri, strlen('/wp-content/plugins/busca-servicos-ipt/'));
  if (!is_file($f) || str_ends_with($f, '.php')) { http_response_code(404); exit; }
  $tipos = ['css'=>'text/css','js'=>'text/javascript','json'=>'application/json','html'=>'text/html'];
  header('Content-Type: '.($tipos[pathinfo($f, PATHINFO_EXTENSION)] ?? 'application/octet-stream')); readfile($f); exit;
}
define('ABSPATH', '/');
$ACOES = []; $SHORT = []; $ESTILOS = []; $SCRIPTS = []; $REG = []; $ROTAS = [];
function add_action($h, $f, $p = 10) { global $ACOES; $ACOES[$h][$p][] = $f; }
function do_action($h) { global $ACOES; if (!isset($ACOES[$h])) return; ksort($ACOES[$h]); foreach ($ACOES[$h] as $fs) foreach ($fs as $f) $f(); }
function add_shortcode($t, $f) { global $SHORT; $SHORT[$t] = $f; }
function shortcode_atts($d, $a, $t = '') { $a = (array)$a; $o = []; foreach ($d as $k => $v) $o[$k] = array_key_exists($k, $a) ? $a[$k] : $v; return $o; }
function has_shortcode($c, $t) { return strpos($c, '['.$t) !== false; }
function plugin_dir_path($f) { return dirname($f).'/'; }
function plugin_dir_url($f) { return '/wp-content/plugins/busca-servicos-ipt/'; }
function wp_register_style($h, $s, $d = [], $v = '') { global $REG; $REG['css'][$h] = $s.'?ver='.$v; }
function wp_register_script($h, $s, $d = [], $v = '', $a = []) { global $REG; $REG['js'][$h] = $s.'?ver='.$v; }
function wp_enqueue_style($h) { global $ESTILOS, $REG; $ESTILOS[$h] = $REG['css'][$h]; }
function wp_enqueue_script($h) { global $SCRIPTS, $REG; $SCRIPTS[$h] = $REG['js'][$h]; }
function esc_url($u) { return htmlspecialchars($u, ENT_QUOTES); }
function esc_html($s) { return htmlspecialchars($s, ENT_QUOTES); }
function esc_attr($s) { return htmlspecialchars($s, ENT_QUOTES); }
function add_query_arg($k, $v, $u) { return $u.(strpos($u, '?') === false ? '?' : '&').$k.'='.rawurlencode($v); }
function rest_url($p) { return '/wp-json/'.$p; }
function register_rest_route($ns, $r, $o) { global $ROTAS; $ROTAS['/wp-json/'.$ns.$r] = $o['callback']; }
function __return_true() { return true; }
class WP_REST_Response { public $data; public $h = []; function __construct($d) { $this->data = $d; } function header($k, $v) { $this->h[$k] = $v; } }
class WP_Error { function __construct($c, $m, $d) {} }
$CONTEUDO = $_GET['sc'] ?? '[busca_servicos_ipt titulo=""]';
function get_post() { global $CONTEUDO; return (object)['post_content' => $CONTEUDO]; }
require $PLUGIN.'busca-servicos-ipt.php';

do_action('rest_api_init');
if (isset($ROTAS[$uri])) { $r = $ROTAS[$uri](); header('Content-Type: application/json'); echo json_encode($r->data, JSON_UNESCAPED_UNICODE); exit; }
do_action('wp_enqueue_scripts');
$saida = preg_replace_callback('/\[busca_servicos_ipt([^\]]*)\]/', function ($m) use ($SHORT) {
  preg_match_all('/(\w+)="([^"]*)"/', $m[1], $p, PREG_SET_ORDER); $a = []; foreach ($p as $x) $a[$x[1]] = $x[2];
  return $SHORT['busca_servicos_ipt']($a);
}, $CONTEUDO);
?><!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Loja IPT (simulação)</title>
<style>/* TEMA HOSTIL: imita Bootstrap/Elementor e temas agressivos */
body{margin:0;font-family:Georgia,serif;font-size:18px;line-height:2;color:#333;background:#fff}
.site-header{position:sticky;top:0;z-index:10;height:70px;background:#1d3557;color:#fff;display:flex;align-items:center;padding:0 24px}
.entry-content{max-width:760px;margin:0 auto;padding:0 20px}
.entry-content h1{font-size:44px}
.entry-content h2,h2{font-size:42px;text-transform:uppercase;letter-spacing:3px;margin:60px 0}
.entry-content p{margin:0 0 40px}
button,input[type=submit],.btn{background:#e00;color:#fff;padding:20px 40px;text-transform:uppercase;border-radius:0;font-size:22px;display:block;width:100%}
input{border:4px solid #000;padding:20px;height:auto;font-size:24px}
a{color:#c00;text-decoration:underline}
label{display:block;font-weight:bold;margin-bottom:20px}
.card{border:10px solid lime;transform:rotate(2deg);float:left;width:50%}
.badge{display:none}
.count{display:none}
.grid{display:block;columns:3}
.notice{background:yellow;border:5px dashed red}
.panel{position:fixed;bottom:0}
.hero{min-height:500px;background:url(x.jpg)}
.empty,.meta,.code,.wrap{padding:50px}
dialog{max-width:200px}
mark{background:red;color:#fff}
</style>
<?php foreach ($ESTILOS as $s) echo '<link rel="stylesheet" href="'.$s.'">'."\n"; ?>
</head><body>
<header class="site-header">Loja IPT</header>
<main class="entry-content"><h1>Pesquise ensaios, análises e calibrações</h1>
<?= $saida ?>
</main>
<?php foreach ($SCRIPTS as $s) echo '<script src="'.$s.'" defer></script>'."\n"; ?>
</body></html>
