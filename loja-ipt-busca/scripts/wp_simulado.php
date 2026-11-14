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
function do_action($h, ...$args) { global $ACOES; if (!isset($ACOES[$h])) return; ksort($ACOES[$h]); foreach ($ACOES[$h] as $fs) foreach ($fs as $f) $f(...array_slice($args, 0, 0)); }
function add_filter($h, $f, $p = 10, $n = 1) {}
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
// ---- utilitários do WordPress usados pelo plugin 1.1 ----
define('HOUR_IN_SECONDS', 3600);
$OPCOES = ['woocommerce_hide_out_of_stock_items' => 'no']; $TRANS = [];
function is_admin() { return false; }
function get_option($k, $d = false) { global $OPCOES; return $OPCOES[$k] ?? $d; }
function update_option($k, $v, $a = null) { global $OPCOES; $OPCOES[$k] = $v; return true; }
function get_transient($k) { global $TRANS; return $TRANS[$k] ?? false; }
function set_transient($k, $v, $e = 0) { global $TRANS; $TRANS[$k] = $v; return true; }
function delete_transient($k) { global $TRANS; unset($TRANS[$k]); return true; }
function get_the_ID() { return 565; }
function get_post_type($id) { return 'page'; }
function wp_json_encode($v, $f = 0) { return json_encode($v, $f); }
function wp_strip_all_tags($s) { return trim(strip_tags(preg_replace('@<(script|style)[^>]*?>.*?</\\1>@si', '', (string)$s))); }
function trailingslashit($s) { return rtrim($s, '/\\') . '/'; }
function wp_upload_dir($t = null, $c = true) { $b = sys_get_temp_dir() . '/bsipt-uploads'; return ['basedir' => $b, 'baseurl' => '/wp-content/uploads']; }
// ---- WooCommerce simulado com os produtos reais da Loja IPT (fixture da Store API) ----
if (!isset($_GET['semwoo'])) {
  class BsiptProdutoSimulado {
    private $d; function __construct($d) { $this->d = $d; }
    private function reais($c) { $u = $this->d['prices']['currency_minor_unit'] ?? 2; return 'R$&nbsp;' . number_format($c / (10 ** $u), 2, ',', '.'); }
    function get_id() { return $this->d['id']; }
    function get_name() { return $this->d['name']; }
    function get_short_description() { return $this->d['short_description'] ?? ''; }
    function get_description() { return $this->d['description'] ?? ''; }
    function get_sku() { return $this->d['sku'] ?? ''; }
    function get_type() { return $this->d['type']; }
    function get_price() { $p = (int)($this->d['prices']['price'] ?? 0); return $p ? $p / 100 : ''; }
    function is_purchasable() { return (bool)$this->d['is_purchasable']; }
    function is_in_stock() { return (bool)($this->d['is_in_stock'] ?? true); }
    function get_catalog_visibility() { return 'visible'; }
    function get_permalink() { return $this->d['permalink']; }
    function get_price_html() {
      $pr = $this->d['prices']; $r = $pr['price_range'] ?? null;
      if ($r && $r['min_amount'] !== $r['max_amount']) {
        $a = $this->reais($r['min_amount']); $b = $this->reais($r['max_amount']);
        return "<span class=\"woocommerce-Price-amount amount\">$a</span> &ndash; <span class=\"woocommerce-Price-amount amount\">$b</span><span class=\"screen-reader-text\">Faixa de preço: $a através $b</span>";
      }
      return (int)$pr['price'] ? '<span class="woocommerce-Price-amount amount"><bdi>' . $this->reais((int)$pr['price']) . '</bdi></span>' : '';
    }
  }
  function bsipt_fixture() { static $f; if (!$f) $f = json_decode(file_get_contents(__DIR__ . '/fixtures/loja_store_api_2026-11-14.json'), true); return $f; }
  function wc_get_products($args) { return array_map(fn($d) => new BsiptProdutoSimulado($d), bsipt_fixture()); }
  function wc_get_product_terms($id, $tax, $a) { foreach (bsipt_fixture() as $d) if ($d['id'] == $id) return array_column($tax === 'product_cat' ? $d['categories'] : $d['tags'], 'name'); return []; }
  function wc_get_cart_url() { return 'https://loja.ipt.br/carrinho/'; }
}
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
