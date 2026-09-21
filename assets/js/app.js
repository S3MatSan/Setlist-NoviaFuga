/* =========================================================================
   Novia a la Fuga · Selector de canciones
   ========================================================================= */
(function () {
  'use strict';

  var CFG   = window.NAF_CONFIG || {};
  var SONGS = (window.NAF_SONGS || []).slice();
  var MAX   = CFG.maxCanciones || 20;
  var STORE = 'naf-seleccion-v2';

  // Campos del formulario, en el orden en que viajan en el email.
  var CAMPOS = [
    { n: 'nombre',   etiqueta: 'Nombre y apellidos', obligatorio: true },
    { n: 'email',    etiqueta: 'Email',              obligatorio: true },
    { n: 'telefono', etiqueta: 'Teléfono',           obligatorio: true },
    { n: 'fecha',    etiqueta: 'Fecha del show',     obligatorio: true },
    { n: 'hora',     etiqueta: 'Hora del show',      obligatorio: true },
    { n: 'lugar',    etiqueta: 'Lugar del evento',   obligatorio: true },
    { n: 'notas',    etiqueta: 'Comentarios',        obligatorio: false }
  ];

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var form      = $('#naf-form');
  var lista     = $('#lista');
  var buscador  = $('#buscador');
  var btnLimpia = $('#limpiar');
  var fTodas    = $('#f-todas');
  var fElegidas = $('#f-elegidas');
  var btnVaciar = $('#vaciar');
  var enviar    = $('#enviar');
  var bar       = $('#bar');
  var contador  = $('#contador');
  var contTexto = $('#contador-texto');
  var progreso  = $('#progreso');
  var pillN     = $('#pill-n');
  var resLista  = $('#resumen-lista');
  var resN      = $('#resumen-n');
  var vacio     = $('#sin-resultados');
  var alerta    = $('#alerta');
  var pantallaOk= $('#ok');
  var toastEl   = $('#toast');

  var seleccion = [];
  var soloElegidas = false;

  /* --------------------------------------------------------------- util */

  function normalizar(t) {
    return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function escapar(t) {
    var d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }

  function valor(n) {
    var el = $('[name="' + n + '"]', form);
    return el ? el.value.trim() : '';
  }

  var toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.hidden = true; }, 2800);
  }

  function alertar(html) {
    alerta.innerHTML = html;
    alerta.hidden = false;
  }

  /* ------------------------------------------------------------- config */

  function aplicarConfig() {
    $$('.js-max').forEach(function (el) { el.textContent = MAX; });

    var d = $('#destino');
    if (d && CFG.emailDestino) d.textContent = CFG.emailDestino;

    var fe = $('#f-email');
    if (fe && CFG.contacto && CFG.contacto.email) {
      fe.textContent = CFG.contacto.email;
      fe.href = 'mailto:' + CFG.contacto.email;
    }
    var fi = $('#f-ig');
    if (fi && CFG.contacto && CFG.contacto.instagram) fi.href = CFG.contacto.instagram;

    var fecha = $('#fecha');
    if (fecha) {
      var h = new Date();
      fecha.min = new Date(h.getTime() - h.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    }
  }

  /* -------------------------------------------------------- persistencia */

  function guardar() {
    try {
      var d = { canciones: seleccion, campos: {} };
      CAMPOS.forEach(function (c) { if (valor(c.n)) d.campos[c.n] = valor(c.n); });
      localStorage.setItem(STORE, JSON.stringify(d));
    } catch (e) { /* navegacion privada: seguimos sin guardar */ }
  }

  function restaurar() {
    var d;
    try { d = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { return; }
    if (!d) return;

    if (Array.isArray(d.canciones)) {
      seleccion = d.canciones.filter(function (i) {
        return typeof i === 'number' && i >= 0 && i < SONGS.length;
      }).slice(0, MAX);
    }
    if (d.campos) {
      Object.keys(d.campos).forEach(function (n) {
        var el = $('[name="' + n + '"]', form);
        if (el) el.value = d.campos[n];
      });
    }
  }

  /* --------------------------------------------------------------- lista */

  function pintarCanciones() {
    var orden = SONGS.map(function (s, i) { return { s: s, i: i }; })
      .sort(function (a, b) {
        var c = a.s.artista.localeCompare(b.s.artista, 'es', { sensitivity: 'base' });
        return c !== 0 ? c : a.s.titulo.localeCompare(b.s.titulo, 'es', { sensitivity: 'base' });
      });

    var tick = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';

    lista.innerHTML = orden.map(function (o) {
      var id = 'c' + o.i;
      return '<label class="song" for="' + id + '" data-i="' + o.i + '" ' +
             'data-q="' + escapar(normalizar(o.s.artista + ' ' + o.s.titulo)) + '">' +
               '<input type="checkbox" id="' + id + '" value="' + o.i + '">' +
               '<span class="song__box">' + tick + '</span>' +
               '<span class="song__txt">' +
                 '<span class="song__t">' + escapar(o.s.titulo) + '</span>' +
                 '<span class="song__a">' + escapar(o.s.artista) + '</span>' +
               '</span>' +
             '</label>';
    }).join('');

    seleccion.forEach(function (i) {
      var el = $('#c' + i);
      if (el) el.checked = true;
    });
  }

  function pintarResumen() {
    if (!seleccion.length) {
      resLista.innerHTML = '<li class="picked__empty">Todavía no habéis elegido ninguna canción.</li>';
    } else {
      resLista.innerHTML = seleccion.map(function (i) {
        return '<li><em>' + escapar(SONGS[i].titulo) + '</em><br><strong>' +
               escapar(SONGS[i].artista) + '</strong></li>';
      }).join('');
    }
    resN.textContent = seleccion.length;
    pillN.textContent = seleccion.length;
  }

  function actualizar() {
    var n = seleccion.length;
    var lleno = n >= MAX;

    contador.textContent = n;
    contTexto.textContent = lleno ? 'lista completa'
      : (n === 1 ? 'canción elegida' : 'canciones elegidas');
    progreso.style.width = Math.min(100, (n / MAX) * 100) + '%';
    bar.classList.toggle('is-full', lleno);

    $$('.song', lista).forEach(function (el) {
      var input = $('input', el);
      var off = lleno && !input.checked;
      el.classList.toggle('is-off', off);
      el.classList.toggle('is-on', input.checked);
      input.disabled = off;
    });

    pintarResumen();
    filtrar();
    guardar();
  }

  function filtrar() {
    var q = normalizar(buscador.value.trim());
    var n = 0;

    $$('.song', lista).forEach(function (el) {
      var ok = !q || el.dataset.q.indexOf(q) !== -1;
      if (soloElegidas) ok = ok && $('input', el).checked;
      el.hidden = !ok;
      if (ok) n++;
    });

    vacio.hidden = n > 0;
    if (!n) {
      vacio.textContent = (soloElegidas && !seleccion.length)
        ? 'Todavía no habéis elegido ninguna canción.'
        : 'No hay ninguna canción con esa búsqueda.';
    }
    btnLimpia.hidden = !buscador.value;
  }

  /* -------------------------------------------------------------- eventos */

  lista.addEventListener('change', function (ev) {
    var input = ev.target;
    if (input.type !== 'checkbox') return;
    var i = parseInt(input.value, 10);

    if (input.checked) {
      if (seleccion.length >= MAX) {
        input.checked = false;
        toast('Máximo ' + MAX + ' canciones. Quitad alguna para añadir otra.');
        return;
      }
      if (seleccion.indexOf(i) === -1) seleccion.push(i);
      if (seleccion.length === MAX) toast('Ya tenéis vuestras ' + MAX + ' canciones.');
    } else {
      seleccion = seleccion.filter(function (x) { return x !== i; });
    }
    limpiarErr('canciones');
    actualizar();
  });

  buscador.addEventListener('input', filtrar);

  btnLimpia.addEventListener('click', function () {
    buscador.value = '';
    filtrar();
    buscador.focus();
  });

  function modo(soloSel) {
    soloElegidas = soloSel;
    fTodas.setAttribute('aria-pressed', String(!soloSel));
    fElegidas.setAttribute('aria-pressed', String(soloSel));
    filtrar();
  }
  fTodas.addEventListener('click', function () { modo(false); });
  fElegidas.addEventListener('click', function () { modo(true); });

  btnVaciar.addEventListener('click', function () {
    if (!seleccion.length) { toast('No hay ninguna canción elegida.'); return; }
    if (!window.confirm('¿Quitar las ' + seleccion.length + ' canciones elegidas?')) return;
    seleccion = [];
    $$('.song input', lista).forEach(function (i) { i.checked = false; });
    actualizar();
    toast('Selección vaciada.');
  });

  form.addEventListener('input', function (ev) {
    if (ev.target.name) limpiarErr(ev.target.name);
    guardar();
  });

  /* ------------------------------------------------------------ validacion */

  function ponerErr(n, msg) {
    var p = $('[data-err="' + n + '"]');
    if (p) p.textContent = msg;
    var el = $('[name="' + n + '"]', form);
    if (el) el.setAttribute('aria-invalid', 'true');
  }

  function limpiarErr(n) {
    var p = $('[data-err="' + n + '"]');
    if (p) p.textContent = '';
    var el = $('[name="' + n + '"]', form);
    if (el) el.removeAttribute('aria-invalid');
  }

  function validar() {
    var malos = [];
    CAMPOS.forEach(function (c) { limpiarErr(c.n); });
    limpiarErr('canciones');

    if (valor('nombre').length < 2) {
      ponerErr('nombre', 'Necesitamos un nombre de contacto.'); malos.push('nombre');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor('email'))) {
      ponerErr('email', 'Revisad el email, parece incompleto.'); malos.push('email');
    }
    if (valor('telefono').replace(/[^0-9]/g, '').length < 9) {
      ponerErr('telefono', 'Escribid un teléfono válido.'); malos.push('telefono');
    }
    if (!valor('fecha')) {
      ponerErr('fecha', 'Indicad la fecha del show.'); malos.push('fecha');
    }
    if (!valor('hora')) {
      ponerErr('hora', 'Indicad la hora del show.'); malos.push('hora');
    }
    if (valor('lugar').length < 2) {
      ponerErr('lugar', '¿Dónde se celebra? Finca, sala o ciudad.'); malos.push('lugar');
    }
    if (!seleccion.length) {
      ponerErr('canciones', 'Elegid al menos una canción.'); malos.push('canciones');
    }
    return malos;
  }

  /* --------------------------------------------------------------- datos */

  function fechaLegible(iso) {
    var p = String(iso).split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
  }

  function listaTexto() {
    return seleccion.map(function (i, n) {
      return (n + 1) + '. ' + SONGS[i].titulo + ' — ' + SONGS[i].artista;
    }).join('\n');
  }

  function resumenTexto() {
    var t = 'NOVIA A LA FUGA · SELECCIÓN DE CANCIONES\n' +
            '========================================\n\n' +
            'Nombre y apellidos: ' + valor('nombre') + '\n' +
            'Email: '             + valor('email') + '\n' +
            'Teléfono: '          + valor('telefono') + '\n' +
            'Fecha del show: '    + fechaLegible(valor('fecha')) + '\n' +
            'Hora del show: '     + valor('hora') + '\n' +
            'Lugar del evento: '  + valor('lugar') + '\n';
    if (valor('notas')) t += '\nComentarios:\n' + valor('notas') + '\n';
    t += '\nCANCIONES (' + seleccion.length + '/' + MAX + ')\n' +
         '----------------------------------------\n' + listaTexto() + '\n';
    return t;
  }

  function payload() {
    var d = {
      _subject: 'Canciones · ' + valor('nombre') + ' · ' + fechaLegible(valor('fecha')),
      _template: 'table',
      _captcha: 'false',
      _replyto: valor('email'),
      'Nombre y apellidos': valor('nombre'),
      'Email': valor('email'),
      'Teléfono': valor('telefono'),
      'Fecha del show': fechaLegible(valor('fecha')),
      'Hora del show': valor('hora'),
      'Lugar del evento': valor('lugar'),
      'Comentarios': valor('notas') || '—',
      'Nº de canciones': seleccion.length + ' de ' + MAX,
      'Canciones elegidas': listaTexto()
    };
    if (CFG.autorespuesta && CFG.textoAutorespuesta) d._autoresponse = CFG.textoAutorespuesta;
    return d;
  }

  /* --------------------------------------------------------------- envio */

  function ocupado(si) {
    enviar.disabled = si;
    enviar.classList.toggle('is-busy', si);
    $('.send__label', enviar).textContent = si ? 'Enviando' : 'Enviar';
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    alerta.hidden = true;

    var honey = $('[name="_honey"]', form);
    if (honey && honey.value) return;   // bot

    var malos = validar();
    if (malos.length) {
      var primero = $('[name="' + malos[0] + '"]', form) || $('[data-err="' + malos[0] + '"]');
      if (primero) {
        primero.scrollIntoView({ block: 'center' });
        if (primero.focus) { try { primero.focus({ preventScroll: true }); } catch (e) {} }
      }
      alertar('Faltan datos por completar. Los hemos marcado en rojo.');
      return;
    }

    // Abierto como fichero local: fetch siempre falla por seguridad del navegador.
    if (location.protocol === 'file:') {
      fallo(new Error('La página está abierta como fichero local (file://) y el ' +
                      'navegador bloquea el envío. Hay que usar la web publicada.'));
      return;
    }

    ocupado(true);

    fetch(CFG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload())
    })
      .then(function (res) {
        return res.text().then(function (txt) {
          var data = {};
          try { data = JSON.parse(txt); } catch (e) { data = { message: txt.slice(0, 200) }; }
          return { res: res, data: data };
        });
      })
      .then(function (r) {
        // FormSubmit responde 200 con success:"false" cuando algo no va bien,
        // asi que no basta con mirar el codigo HTTP.
        var ok = r.res.ok && String(r.data.success).toLowerCase() !== 'false';
        if (!ok) throw new Error(r.data.message || ('El servidor respondió ' + r.res.status));
        exito(r.data);
      })
      .catch(fallo);
  });

  // Red de seguridad: si el navegador no soporta el atributo form="" en el boton.
  enviar.addEventListener('click', function (ev) {
    if (enviar.form) return;            // el submit nativo ya se encarga
    ev.preventDefault();
    if (form.requestSubmit) form.requestSubmit();
    else form.dispatchEvent(new Event('submit', { cancelable: true }));
  });

  function exito(data) {
    try { localStorage.removeItem(STORE); } catch (e) {}

    $('#ok-resumen').textContent = resumenTexto();

    var msg = String((data && data.message) || '');
    if (/activat|confirm/i.test(msg)) {
      $('#ok-text').innerHTML =
        'Hemos registrado vuestra selección.<br>' +
        '<strong>Aviso para la banda:</strong> el buzón aún no está activado. ' +
        'Revisad el correo de confirmación de FormSubmit en ' +
        escapar(CFG.emailDestino || '') + '.';
    }

    form.hidden = true;
    pantallaOk.hidden = false;
    bar.hidden = true;
    document.body.classList.add('is-done');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function fallo(err) {
    ocupado(false);
    var detalle = (err && err.message) ? err.message : 'error desconocido';
    alertar(
      '<strong>No hemos podido enviar la selección.</strong><br>' +
      'Vuestros datos y vuestras canciones siguen guardados en esta página: ' +
      'comprobad la conexión y volved a pulsar <strong>Enviar</strong>.' +
      '<small>Detalle: ' + escapar(detalle) + '</small>'
    );
    alerta.scrollIntoView({ block: 'center' });
    if (window.console) console.error('[Novia a la Fuga] Error al enviar:', err);
  }

  $('#copiar').addEventListener('click', function () {
    var txt = $('#ok-resumen').textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt)
        .then(function () { toast('Resumen copiado.'); })
        .catch(function () { toast('No se pudo copiar.'); });
      return;
    }
    var ta = document.createElement('textarea');
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('Resumen copiado.'); }
    catch (e) { toast('No se pudo copiar.'); }
    document.body.removeChild(ta);
  });

  /* ---------------------------------------------------------------- init */

  aplicarConfig();
  restaurar();
  pintarCanciones();
  actualizar();
})();
