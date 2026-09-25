/**
 * Configuracion del formulario.
 * Este es el unico fichero que normalmente necesitareis tocar.
 */
window.NAF_CONFIG = {
  // Endpoint que envia el formulario por email. Es el unico sitio de todo el
  // proyecto donde aparece la direccion de destino; la web no la escribe en
  // ninguna pantalla.
  //
  // Usa FormSubmit (gratis y sin registro): el primer envio genera un email de
  // activacion con un enlace que hay que pulsar UNA sola vez. A partir de ahi
  // todo llega automaticamente.
  //
  // RECOMENDADO tras activarlo: FormSubmit da un codigo aleatorio propio.
  // Ponerlo aqui en lugar del email quita la direccion tambien del codigo
  // fuente, que es lo que rastrean los robots de spam.
  //   Ej: "https://formsubmit.co/ajax/a1b2c3d4e5f6g7h8i9j0"
  endpoint: "https://formsubmit.co/ajax/noviafuga@gmail.com",

  // Maximo de canciones que puede elegir el cliente.
  maxCanciones: 20,

  // Enviar una copia de confirmacion automatica al cliente.
  autorespuesta: true,

  // Texto de esa autorespuesta.
  textoAutorespuesta:
    "¡Gracias por enviarnos vuestra selección! Hemos recibido correctamente " +
    "vuestras canciones y los datos del show. Nos ponemos con ello y os " +
    "escribimos muy pronto.\n\nUn abrazo,\nNovia a la Fuga",

  // Enlace de Instagram del pie de pagina.
  // El email no se escribe en ninguna parte de la web, a proposito.
  contacto: {
    instagram: "https://www.instagram.com/noviaalafuga/"
  }
};
