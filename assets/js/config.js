/**
 * Configuracion del formulario.
 * Este es el unico fichero que normalmente necesitareis tocar.
 */
window.NAF_CONFIG = {
  // Correo donde llegan las selecciones de los clientes.
  emailDestino: "noviafuga@gmail.com",

  // Endpoint que envia el formulario por email.
  // Por defecto usa FormSubmit (gratis y sin registro): el primer envio
  // genera un email de activacion a emailDestino con un enlace que hay que
  // pulsar UNA sola vez. A partir de ahi todo llega automaticamente.
  //
  // Recomendado tras activarlo: sustituir el email por el codigo aleatorio
  // que FormSubmit envia, para no exponer la direccion en el codigo fuente.
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

  // Datos de contacto que se muestran en el pie de pagina.
  contacto: {
    email: "noviafuga@gmail.com",
    instagram: "https://www.instagram.com/noviaalafuga/"
  }
};
