const WHATSAPP_ATENDIMENTO = '+55 63 98469-2450';

(function () {
  window.paginaPronta = true;
  var h = document.documentElement;
  var abrir = document.querySelector('.abrir-menu');
  var menu = document.querySelector('.menu');
  if (abrir && menu) {
    menu.id = 'menu-secoes';
    abrir.setAttribute('aria-controls', menu.id);
    var resto = document.querySelectorAll('main, footer');
    var inerte = function (valor) { resto.forEach(function (el) { if (valor) el.setAttribute('inert', ''); else el.removeAttribute('inert'); }); };
    var fecha = function () {
      h.classList.remove('menu-aberto'); inerte(false);
      abrir.setAttribute('aria-expanded', 'false'); abrir.setAttribute('aria-label', 'Abrir o menu');
    };
    abrir.addEventListener('click', function () {
      var aberto = h.classList.toggle('menu-aberto');
      inerte(aberto); abrir.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      abrir.setAttribute('aria-label', aberto ? 'Fechar o menu' : 'Abrir o menu');
      if (aberto) menu.querySelector('a').focus();
    });
    document.querySelectorAll('.topo a').forEach(function (a) { a.addEventListener('click', fecha); });
    document.addEventListener('keydown', function (e) {
      if (!h.classList.contains('menu-aberto')) return;
      if (e.key === 'Escape') { fecha(); abrir.focus(); }
      if (e.key === 'Tab') {
        var itens = Array.from(document.querySelectorAll('.topo a, .topo button')).filter(function (x) { return x.getClientRects().length && getComputedStyle(x).visibility !== 'hidden'; });
        var primeiro = itens[0], ultimo = itens[itens.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
      }
    });
  }

  var form = document.getElementById('form-lista');
  if (!form) return;
  var botao = form.querySelector('button[type="submit"]');
  var status = document.getElementById('lista-status');
  var nomePessoa = form.elements.namedItem('nome');
  var contatoPessoa = form.elements.namedItem('whatsapp');
  var numero = WHATSAPP_ATENDIMENTO.replace(/\D/g, '');
  var disponivel = /^[1-9]\d{9,14}$/.test(numero);
  botao.disabled = !disponivel;
  if (disponivel) {
    status.textContent = 'Ao enviar, o WhatsApp será aberto com a mensagem preenchida. Revise e envie a mensagem para pedir sua entrada na lista.';
    document.querySelectorAll('.topo .zap, #whatsapp-atendimento').forEach(function (link) {
      link.href = 'https://wa.me/' + numero;
      link.hidden = false;
      if (link.id === 'whatsapp-atendimento') link.textContent = 'WhatsApp do atendimento';
    });
    var contato = document.getElementById('whatsapp');
    if (contato) contato.hidden = false;
  }
  contatoPessoa.addEventListener('input', function () { contatoPessoa.setCustomValidity(''); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!disponivel) return;
    nomePessoa.value = nomePessoa.value.trim();
    contatoPessoa.value = contatoPessoa.value.trim();
    var digitos = contatoPessoa.value.replace(/\D/g, '');
    contatoPessoa.setCustomValidity(digitos.length >= 10 && digitos.length <= 15 ? '' : 'Informe seu WhatsApp com DDD.');
    if (!form.reportValidity()) return;
    var dados = new FormData(form);
    var valor = function (nome) { return String(dados.get(nome) || '').trim(); };
    var mensagem = 'Olá! Quero entrar na lista de espera para o personal presencial em Palmas.\n\n' +
      'Nome: ' + valor('nome') + '\n' +
      'WhatsApp: ' + valor('whatsapp') + '\n' +
      'Objetivo: ' + valor('objetivo') + '\n' +
      'Horário de preferência: ' + valor('horario');
    window.location.assign('https://wa.me/' + numero + '?text=' + encodeURIComponent(mensagem));
  });
})();

(function () {
  var galeria = document.getElementById('galeria-resultados');
  var anterior = document.getElementById('resultado-anterior');
  var proximo = document.getElementById('resultado-proximo');
  if (!galeria || !anterior || !proximo) return;
  var cartoes = Array.from(galeria.querySelectorAll('.resultado'));
  if (!cartoes.length) return;
  var limite = function () { return Math.max(0, galeria.scrollWidth - galeria.clientWidth); };
  var atualiza = function () {
    anterior.disabled = galeria.scrollLeft <= 1;
    proximo.disabled = galeria.scrollLeft >= limite() - 1;
  };
  var vai = function (posicao) {
    galeria.scrollTo({
      left: Math.max(0, Math.min(posicao, limite())),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  };
  var avanca = function (sentido) {
    var posicoes = cartoes.map(function (cartao) { return cartao.offsetLeft; });
    var atual = galeria.scrollLeft;
    var destino = sentido > 0
      ? posicoes.find(function (x) { return x > atual + 2; })
      : posicoes.reverse().find(function (x) { return x < atual - 2; });
    vai(destino === undefined ? (sentido > 0 ? limite() : 0) : destino);
  };
  anterior.addEventListener('click', function () { avanca(-1); });
  proximo.addEventListener('click', function () { avanca(1); });
  galeria.addEventListener('scroll', atualiza, { passive: true });
  galeria.addEventListener('keydown', function (e) {
    if (e.target !== galeria) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault(); avanca(e.key === 'ArrowRight' ? 1 : -1);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault(); vai(e.key === 'Home' ? 0 : limite());
    }
  });
  window.addEventListener('resize', atualiza);
  document.querySelector('.resultados-controles').hidden = false;
  atualiza();
})();
