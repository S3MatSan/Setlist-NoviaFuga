# Novia a la Fuga · Selector de canciones

Página web para que los clientes (bodas y fiestas de empresa) elijan **hasta 20
canciones** del repertorio de Novia a la Fuga y nos envíen sus datos por email.

👉 **El enlace que se manda al cliente es la URL de la web publicada** (ver más abajo).

---

## Qué recibe el cliente

1. Rellena sus datos: tipo de evento, nombre, empresa/pareja, email, teléfono,
   fecha, lugar y comentarios.
2. Marca hasta 20 canciones del repertorio (buscador incluido).
3. Pulsa **Enviar selección**.

## Qué recibimos nosotros

Un email en **noviafuga@gmail.com** con una tabla con todos los datos del evento
y la lista numerada de las canciones elegidas. Respondiendo a ese email se
responde directamente al cliente (va con `reply-to`).

---

## Puesta en marcha (2 pasos)

### 1. Publicar la web en GitHub Pages

1. En GitHub: **Settings → Pages**.
2. En *Build and deployment → Source*, elegir **GitHub Actions**.
   (El workflow intenta activarlo solo; este paso es la red de seguridad.)
3. Al hacer push a `main` se publica sola gracias a
   `.github/workflows/deploy-pages.yml`.

La URL queda así:

```
https://s3matsan.github.io/Setlist-NoviaFuga/
```

> También se puede usar la opción *Deploy from a branch* (rama `main`, carpeta
> `/ (root)`): la web es HTML estático, no necesita compilarse.

### 2. Activar el envío de emails (solo la primera vez)

El formulario usa [FormSubmit](https://formsubmit.co) — gratuito y sin registro.

1. Entrar en la web publicada y hacer **un envío de prueba**.
2. Llegará un email de FormSubmit a `noviafuga@gmail.com` pidiendo confirmar.
3. Pulsar el enlace de activación. **A partir de ahí todo llega automáticamente.**

**Recomendado después de activarlo:** FormSubmit da un código aleatorio propio.
Ponerlo en `assets/js/config.js` en lugar del email evita que la dirección quede
visible en el código de la página (menos spam):

```js
endpoint: "https://formsubmit.co/ajax/TU_CODIGO_ALEATORIO",
```

---

## Cómo editar cosas

| Quiero cambiar… | Fichero |
|---|---|
| Las canciones del repertorio | `assets/js/songs.js` |
| El email de destino, el máximo de canciones, Instagram | `assets/js/config.js` |
| Los textos de la página | `index.html` |
| Colores y diseño | `assets/css/styles.css` |

### Añadir o quitar canciones

En `assets/js/songs.js`, cada tema es una línea:

```js
{ artista: "Pereza", titulo: "Estrella polar" },
```

Se ordenan solas alfabéticamente por grupo, no hace falta colocarlas en orden.

### Cambiar el máximo de canciones

En `assets/js/config.js`:

```js
maxCanciones: 20,
```

El número se actualiza automáticamente en todos los textos de la página.

---

## Detalles técnicos

- HTML, CSS y JavaScript puros. **Sin dependencias ni build.**
- Diseño *mobile first*: la mayoría de clientes lo abren desde el móvil.
- La selección se guarda en el navegador (`localStorage`): si cierran la página
  por error, al volver siguen ahí sus canciones y sus datos.
- Al llegar a 20 temas el resto se bloquean, con aviso.
- Campo trampa (*honeypot*) contra bots de spam.
- Si falla el envío, se ofrece un enlace `mailto:` con el resumen ya escrito.
- Accesibilidad: navegable con teclado, etiquetas correctas y `aria-live` en el
  contador.

### Probar en local

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

---

## Alternativas al envío por email

Si algún día FormSubmit no encaja, basta con cambiar `endpoint` en
`assets/js/config.js` por otro servicio que acepte `POST` con JSON:

- [Formspree](https://formspree.io) — `https://formspree.io/f/TU_ID`
- [Web3Forms](https://web3forms.com) — `https://api.web3forms.com/submit`
  (requiere añadir el campo `access_key` en el payload)
