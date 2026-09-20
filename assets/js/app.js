/* =========================================================================
   Novia a la Fuga · Selector de canciones
   ========================================================================= */
(function () {
  'use strict';

  var CFG   = window.NAF_CONFIG || {};
  var SONGS = (window.NAF_SONGS || []).slice();
  var MAX   = CFG.maxCanciones || 20;
  var STORE = 'naf-seleccion-v1';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var form        = $('#naf-form');
  var lista       = $('#lista-canciones');
  var buscador    = $('#buscador');
  var btnLimpiar  = $('#limpiar-busqueda');
  var btnSoloSel  = $('#ver-seleccion');
  var btnVaciar   = $('#vaciar');
  var btnEnviar   = $('#enviar');
  var btnIrEnviar = $('#ir-a-enviar');
  var barra       = $('#barra');
  var contador    = $('#contador');
  var contTexto   = $('#contador-texto');
  var progreso    = $('#progreso');
  var resumenList = $('#resumen-lista');
  var resumenNum  = $('#resumen-count');
  var sinResult   = $('#sin-resultados');
  var alerta      = $('#alerta');
  var pantallaOk  = $('#pantalla-ok');
  var toastEl     = $('#toast');

  var seleccion = [];          // indices de SONGS
  var soloSeleccionadas = false;

  /* ------------------------------------------------------------------ util */

  function normalizar(txt) {
    return String(txt)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  function escapar(txt) {
    var d = document.createElement('div');
    d.textContent = txt;
    return d.innerHTML;
  }

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2600);
  }

  function mostrarAlerta(html, ok) {
    alerta.innerHTML = html;
    alerta.className = ok ? 'alert alert--ok' : 'alert';
    alerta.hidden = false;
  }

  function ocultarAlerta() { alerta.hidden = true; }

  /* --------------------------------------------------------- textos config */

  function aplicarConfig() {
    $$('.js-max').forEach(function (el) { el.textContent = MAX; });
    var heroMax = $('#hero-max');
    if (heroMax) heroMax.textContent = MAX;

    var destino = $('#destino-email');
    if (destino && CFG.emailDestino) destino.textContent = CFG.emailDestino;

    var fEmail = $('#footer-email');
    if (fEmail && CFG.contacto && CFG.contacto.email) {
      fEmail.textContent = CFG.contacto.email;
      fEmail.href = 'mailto:' + CFG.contacto.email;
    }
    var fIg = $('#footer-ig');
    if (fIg && CFG.contacto && CFG.contacto.instagram) fIg.href = CFG.contacto.instagram;

    // La fecha del evento no puede ser anterior a hoy.
    var fecha = $('#fecha');
    if (fecha) {
      var hoy = new Date();
      var iso = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 10);
      fecha.min = iso;
    }
  }

  /* ------------------------------------------------------------ persistencia */

  function guardar() {
    try {
      var datos = { canciones: seleccion, campos: {} };
      $$('#naf-form input, #naf-form textarea').forEach(function (el) {
        if (el.name && el.name !== '_honey' && el.type !== 'checkbox') {
          if (el.type === 'radio') {
            if (el.checked) datos.campos[el.name] = el.value;
          } else if (el.value) {
            datos.campos[el.name] = el.value;
          }
        }
      });
      localStorage.setItem(STORE, JSON.stringify(datos));
    } catch (e) { /* modo privado: seguimos sin guardar */ }
  }

  function restaurar() {
    var datos;
    try { datos = JSON.parse(localStorage.getItem(STORE) || 'null'); }
    catch (e) { return; }
    if (!datos) return;

    if (Array.isArray(datos.canciones)) {
      seleccion = datos.canciones.filter(function (i) {
        return typeof i === 'number' && i >= 0 && i < SONGS.length;
      }).slice(0, MAX);
    }
    if (datos.campos) {
      Object.keys(datos.campos).forEach(function (name) {
        var campos = $$('[name="' + name + '"]', form);
        campos.forEach(function (el) {
          if (el.type === 'radio') {
            if (el.value === datos.campos[name]) el.checked = true;
          } else {
            el.value = datos.campos[name];
          }
        });
      });
    }
  }

  /* ------------------------------------------------------------- render */

  function pintarCanciones() {
    var orden = SONGS.map(function (s, i) { return { s: s, i: i }; })
      .sort(function (a, b) {
        var c = a.s.artista.localeCompare(b.s.artista, 'es', { sensitivity: 'base' });
        return c !== 0 ? c : a.s.titulo.localeCompare(b.s.titulo, 'es', { sensitivity: 'base' });
      });

    var check = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
                '<path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';

    lista.innerHTML = orden.map(function (o) {
      var id = 'song-' + o.i;
      return '<label class="song" for="' + id + '" data-index="' + o.i + '" ' +
             'data-buscar="' + escapar(normalizar(o.s.artista + ' ' + o.s.titulo)) + '">' +
               '<input type="checkbox" id="' + id + '" value="' + o.i + '">' +
               '<span class="song__box">' + check + '</span>' +
               '<span class="song__text">' +
                 '<span class="song__artist">' + escapar(o.s.artista) + '</span>' +
                 '<span class="song__title">' + escapar(o.s.titulo) + '</span>' +
               '</span>' +
             '</label>';
    }).join('');

    // Marcar lo restaurado desde localStorage.
    seleccion.forEach(function (i) {
      var input = $('#song-' + i);
      if (input) input.checked = true;
    });
  }

  function pintarResumen() {
    if (!seleccion.length) {
      resumenList.innerHTML = '<li class="resumen__empty">Todavía no habéis elegido ninguna canción.</li>';
    } else {
      resumenList.innerHTML = seleccion.map(function (i) {
        return '<li><strong>' + escapar(SONGS[i].artista) + '</strong> — <span>' +
               escapar(SONGS[i].titulo) + '</span></li>';
      }).join('');
    }
    resumenNum.textContent = seleccion.length;
  }

  function actualizar() {
    var n = seleccion.length;
    var lleno = n >= MAX;

    contador.textContent = n;
    contTexto.textContent = lleno
      ? '¡lista completa!'
      : (n === 1 ? 'canción elegida' : 'canciones elegidas');
    progreso.style.width = Math.min(100, (n / MAX) * 100) + '%';
    barra.classList.toggle('is-full', lleno);
    barra.classList.toggle('is-visible', n > 0);

    // Bloquear las no marcadas al llegar al maximo.
    $$('.song', lista).forEach(function (label) {
      var input = $('input', label);
      var blocked = lleno && !input.checked;
      label.classList.toggle('is-blocked', blocked);
      label.classList.toggle('is-checked', input.checked); // fallback sin :has()
      input.disabled = blocked;
    });

    pintarResumen();
    filtrar();
    guardar();
  }

  function filtrar() {
    var q = normalizar(buscador.value.trim());
    var visibles = 0;

    $$('.song', lista).forEach(function (label) {
      var coincide = !q || label.dataset.buscar.indexOf(q) !== -1;
      if (soloSeleccionadas) coincide = coincide && $('input', label).checked;
      label.hidden = !coincide;
      if (coincide) visibles++;
    });

    sinResult.hidden = visibles > 0;
    if (visibles === 0) {
      sinResult.textContent = soloSeleccionadas && !seleccion.length
        ? 'Todavía no habéis elegido ninguna canción.'
        : 'No encontramos ninguna canción con esa búsqueda.';
    }
    btnLimpiar.hidden = !buscador.value;
  }

  /* ------------------------------------------------------------- eventos */

  lista.addEventListener('change', function (ev) {
    var input = ev.target;
    if (input.type !== 'checkbox') return;

    var idx = parseInt(input.value, 10);

    if (input.checked) {
      if (seleccion.length >= MAX) {
        input.checked = false;
        toast('Máximo ' + MAX + ' canciones. Quitad alguna para añadir otra.');
        return;
      }
      if (seleccion.indexOf(idx) === -1) seleccion.push(idx);
      if (seleccion.length === MAX) toast('¡Ya tenéis vuestras ' + MAX + ' canciones!');
    } else {
      seleccion = seleccion.filter(function (i) { return i !== idx; });
    }

    limpiarError('canciones');
    actualizar();
  });

  buscador.addEventListener('input', filtrar);

  btnLimpiar.addEventListener('click', function () {
    buscador.value = '';
    filtrar();
    buscador.focus();
  });

  btnSoloSel.addEventListener('click', function () {
    soloSeleccionadas = !soloSeleccionadas;
    btnSoloSel.setAttribute('aria-pressed', String(soloSeleccionadas));
    btnSoloSel.textContent = soloSeleccionadas ? 'Ver todas' : 'Ver solo elegidas';
    filtrar();
  });

  btnVaciar.addEventListener('click', function () {
    if (!seleccion.length) { toast('No hay ninguna canción elegida.'); return; }
    if (!window.confirm('¿Seguro que queréis quitar las ' + seleccion.length + ' canciones elegidas?')) return;
    seleccion = [];
    $$('.song input', lista).forEach(function (i) { i.checked = false; });
    actualizar();
    toast('Selección vaciada.');
  });

  btnIrEnviar.addEventListener('click', function () {
    $('#enviar').scrollIntoView({ block: 'center' });
  });

  // Etiqueta contextual segun el tipo de evento.
  $$('[name="tipo_evento"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      var l = $('#entidad-label');
      if (radio.value === 'Boda')                   l.textContent = 'Nombre de la pareja';
      else if (radio.value === 'Fiesta de empresa') l.textContent = 'Nombre de la empresa';
      else                                          l.textContent = 'Empresa o nombre de la pareja';
      limpiarError('tipo_evento');
      guardar();
    });
  });

  form.addEventListener('input', function (ev) {
    if (ev.target.name) limpiarError(ev.target.name);
    guardar();
  });

  /* ------------------------------------------------------------ validacion */

  function ponerError(name, msg) {
    var p = $('[data-error-for="' + name + '"]');
    if (p) p.textContent = msg;
    $$('[name="' + name + '"]', form).forEach(function (el) {
      el.setAttribute('aria-invalid', 'true');
    });
  }

  function limpiarError(name) {
    var p = $('[data-error-for="' + name + '"]');
    if (p) p.textContent = '';
    $$('[name="' + name + '"]', form).forEach(function (el) {
      el.removeAttribute('aria-invalid');
    });
  }

  function validar() {
    var errores = [];
    var val = function (n) {
      var el = $('[name="' + n + '"]', form);
      return el ? el.value.trim() : '';
    };

    ['tipo_evento', 'nombre', 'email', 'telefono', 'fecha', 'lugar', 'canciones']
      .forEach(limpiarError);

    if (!$('[name="tipo_evento"]:checked', form)) {
      ponerError('tipo_evento', 'Indicadnos qué tipo de evento es.');
      errores.push('tipo_evento');
    }
    if (val('nombre').length < 2) {
      ponerError('nombre', 'Necesitamos un nombre de contacto.');
      errores.push('nombre');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email'))) {
      ponerError('email', 'Revisad el email, parece incompleto.');
      errores.push('email');
    }
    if (val('telefono').replace(/[^0-9]/g, '').length < 9) {
      ponerError('telefono', 'Escribid un teléfono de contacto válido.');
      errores.push('telefono');
    }
    if (!val('fecha')) {
      ponerError('fecha', 'Indicadnos la fecha del evento.');
      errores.push('fecha');
    }
    if (val('lugar').length < 2) {
      ponerError('lugar', '¿Dónde se celebra? Finca, sala o ciudad.');
      errores.push('lugar');
    }
    if (!seleccion.length) {
      ponerError('canciones', 'Elegid al menos una canción de la lista.');
      errores.push('canciones');
    }

    return errores;
  }

  /* ------------------------------------------------------------- payload */

  function fechaLegible(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    if (p.length !== 3) return iso;
    return p[2] + '/' + p[1] + '/' + p[0];
  }

  function listaTexto() {
    return seleccion.map(function (i, n) {
      return (n + 1) + '. ' + SONGS[i].artista + ' — ' + SONGS[i].titulo;
    }).join('\n');
  }

  function construirResumen() {
    var val = function (n) {
      var el = $('[name="' + n + '"]', form);
      return el ? el.value.trim() : '';
    };
    var tipoEl = $('[name="tipo_evento"]:checked', form);
    var tipo = tipoEl ? tipoEl.value : '';

    var txt =
      'NOVIA A LA FUGA · SELECCIÓN DE CANCIONES\n' +
      '========================================\n\n' +
      'Tipo de evento: ' + tipo + '\n' +
      'Contacto: '       + val('nombre') + '\n';
    if (val('entidad')) txt += 'Empresa / pareja: ' + val('entidad') + '\n';
    txt +=
      'Email: '    + val('email') + '\n' +
      'Teléfono: ' + val('telefono') + '\n' +
      'Fecha: '    + fechaLegible(val('fecha')) + '\n' +
      'Lugar: '    + val('lugar') + '\n';
    if (val('notas')) txt += '\nComentarios:\n' + val('notas') + '\n';
    txt += '\nCANCIONES ELEGIDAS (' + seleccion.length + '/' + MAX + ')\n' +
           '----------------------------------------\n' + listaTexto() + '\n';
    return txt;
  }

  function construirPayload() {
    var val = function (n) {
      var el = $('[name="' + n + '"]', form);
      return el ? el.value.trim() : '';
    };
    var tipoEl = $('[name="tipo_evento"]:checked', form);
    var tipo = tipoEl ? tipoEl.value : '';

    var datos = {
      _subject: '🎸 ' + tipo + ' · ' + val('nombre') + ' · ' + fechaLegible(val('fecha')),
      _template: 'table',
      _captcha: 'false',
      _replyto: val('email'),
      'Tipo de evento': tipo,
      'Nombre de contacto': val('nombre'),
      'Empresa / pareja': val('entidad') || '—',
      'Email': val('email'),
      'Teléfono': val('telefono'),
      'Fecha del evento': fechaLegible(val('fecha')),
      'Lugar del evento': val('lugar'),
      'Comentarios': val('notas') || '—',
      'Nº de canciones': seleccion.length + ' de ' + MAX,
      'Canciones elegidas': listaTexto()
    };

    if (CFG.autorespuesta && CFG.textoAutorespuesta) {
      datos._autoresponse = CFG.textoAutorespuesta;
    }
    return datos;
  }

  function enlaceMailto() {
    var asunto = 'Selección de canciones · Novia a la Fuga';
    return 'mailto:' + (CFG.emailDestino || '') +
           '?subject=' + encodeURIComponent(asunto) +
           '&body='    + encodeURIComponent(construirResumen());
  }

  /* --------------------------------------------------------------- envio */

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    ocultarAlerta();

    // Honeypot: si viene relleno es un bot, cortamos en silencio.
    var honey = $('[name="_honey"]', form);
    if (honey && honey.value) return;

    var errores = validar();
    if (errores.length) {
      var primero = $('[name="' + errores[0] + '"]', form) ||
                    $('[data-error-for="' + errores[0] + '"]');
      if (primero) {
        primero.scrollIntoView({ block: 'center' });
        if (primero.focus) { try { primero.focus({ preventScroll: true }); } catch (e) { primero.focus(); } }
      }
      mostrarAlerta('Faltan algunos datos por completar. Los hemos marcado en rojo.');
      return;
    }

    btnEnviar.disabled = true;
    btnEnviar.classList.add('is-loading');
    $('.btn__label', btnEnviar).textContent = 'Enviando…';

    fetch(CFG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(construirPayload())
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; })
          .then(function (data) {
            if (!res.ok) throw new Error(data.message || ('HTTP ' + res.status));
            return data;
          });
      })
      .then(function (data) { exito(data); })
      .catch(function (err) { fallo(err); });
  });

  function exito(data) {
    try { localStorage.removeItem(STORE); } catch (e) {}

    $('#done-resumen').textContent = construirResumen();

    // FormSubmit responde con este aviso hasta que se activa el email destino.
    var msg = String((data && (data.message || data.success)) || '');
    if (/activat|confirm/i.test(msg)) {
      $('#done-text').innerHTML =
        'Hemos registrado vuestra selección. <strong>Aviso para la banda:</strong> ' +
        'el buzón todavía no está activado, revisad el correo de confirmación de FormSubmit.';
    }

    form.hidden = true;
    pantallaOk.hidden = false;
    barra.classList.remove('is-visible');
    document.body.classList.add('is-done');
    pantallaOk.scrollIntoView({ block: 'start' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function fallo(err) {
    btnEnviar.disabled = false;
    btnEnviar.classList.remove('is-loading');
    $('.btn__label', btnEnviar).textContent = 'Enviar selección';

    mostrarAlerta(
      '<strong>No hemos podido enviar el formulario.</strong><br>' +
      'Revisad la conexión y volved a intentarlo. Si sigue fallando, ' +
      '<a href="' + enlaceMailto() + '">enviádnoslo por email</a> ' +
      'o escribidnos a ' + escapar(CFG.emailDestino || '') + '.' +
      '<br><small>Detalle técnico: ' + escapar(err && err.message ? err.message : 'error desconocido') + '</small>'
    );
    console.error('[Novia a la Fuga] Error al enviar:', err);
  }

  $('#copiar-resumen').addEventListener('click', function () {
    var texto = $('#done-resumen').textContent;
    var ok = function () { toast('Resumen copiado.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(ok).catch(function () { toast('No se pudo copiar.'); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { toast('No se pudo copiar.'); }
      document.body.removeChild(ta);
    }
  });

  /* ---------------------------------------------------------------- init */

  aplicarConfig();
  restaurar();

  // Reaplicar la etiqueta contextual si veniamos de una sesion guardada.
  var tipoGuardado = $('[name="tipo_evento"]:checked', form);
  if (tipoGuardado) tipoGuardado.dispatchEvent(new Event('change'));

  pintarCanciones();
  actualizar();
})();
