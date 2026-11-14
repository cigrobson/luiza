/* Loja IPT, página loja-15, widget HTML do topo (formulário #ipt-top-search).
   Substitui o PRIMEIRO <script> desse widget. Os demais scripts do widget (selos dos produtos) continuam.
   Escrito SEM barra invertida de propósito: o editor do WordPress costuma removê-las ao salvar.
   O que muda: "Buscar" e os atalhos de área levam à página do catálogo com o termo já pesquisado,
   em vez de rolar até o iframe do Scriba. */
(function(){
  var CATALOGO = '/catalogo-tecnico/';
  var AREAS = {
    'Solo': 'solo',
    'Água': 'água',
    'Têxteis': 'tecido',
    'Papel e Embalagem': 'papel',
    'Metrologia': 'calibração',
    'Energia': 'energia',
    'Construção': 'construção',
    'Materiais': 'materiais'
  };
  function ir(termo){
    termo = (termo || '').trim();
    window.location.href = CATALOGO + (termo ? '?q=' + encodeURIComponent(termo) : '');
  }
  function texto(v){ return (v || '').trim().toLowerCase(); }
  function ajustar(){
    var campo = document.getElementById('ipt-top-query');
    var form = document.getElementById('ipt-top-search');
    if (form && !form.dataset.catalogo) {
      form.addEventListener('submit', function(e){ e.preventDefault(); ir(campo && campo.value); });
      document.querySelectorAll('.ipt-interest[data-area]').forEach(function(b){
        b.addEventListener('click', function(){ ir(AREAS[b.dataset.area] || b.dataset.area); });
      });
      form.dataset.catalogo = '1';
    }
    /* Mantido do script anterior: títulos e selo "Solicitação de serviço" nos produtos sem preço. */
    document.querySelectorAll('h1,h2,h3,h4,h5,h6,.elementor-heading-title').forEach(function(h){
      var t = texto(h.textContent);
      if (t.indexOf('destaques da semana') === 0) h.textContent = 'Produtos e serviços em destaque';
      if (t.indexOf('categorias de servi') === 0 || t === 'categorias e especialidades') h.textContent = 'Navegue por categorias técnicas';
    });
    document.querySelectorAll('li.product').forEach(function(c){
      if (c.querySelector('.price') || c.querySelector('.ipt-attendance-badge')) return;
      var l = Array.from(c.querySelectorAll('a')).find(function(e){
        var r = texto(e.textContent + ' ' + (e.getAttribute('aria-label') || ''));
        return r.indexOf('ler mais') > -1 || r.indexOf('leia mais') > -1;
      });
      if (l) { l.textContent = 'Ver serviço'; l.setAttribute('aria-label', 'Ver serviço'); l.classList.add('ipt-service-link'); }
      var h = c.querySelector('h2,h3');
      if (h) { var b = document.createElement('span'); b.className = 'ipt-attendance-badge'; b.textContent = '◉ Solicitação de serviço'; h.parentNode.insertBefore(b, h); }
    });
  }
  var n = 0, timer = setInterval(function(){ ajustar(); if (++n > 48) clearInterval(timer); }, 250);
})();
