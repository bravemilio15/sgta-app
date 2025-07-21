const { crearUsuarioAuth, guardarUsuarioEnFirestore } = require('../services/firebaseService');
const { Usuario, EstadoRegistro } = require('../models/usuario');

async function registrarUsuario(req, res) {
  try {
    const {
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      identificacion,
      tipoIdentificacion,
      asignatura,
      correoUsuario // parte antes del @
    } = req.body;

    // Construir correo institucional
    const correoInstitucional = `${correoUsuario}@uni.unl.ec`;
    // Generar nombre completo
    const nombreCompleto = `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.replace(/  +/g, ' ').trim();
    // Fecha de creación
    const fechaPerf = new Date().toISOString();

    // Crear usuario en Auth (contraseña temporal aleatoria)
    const password = Math.random().toString(36).slice(-8) + 'A1'; // Ejemplo simple
    const userRecord = await crearUsuarioAuth(correoInstitucional, password);

    // Crear objeto usuario
    const usuario = new Usuario({
      nombreCompleto,
      correoInstitucional,
      identificacion,
      tipoIdentificacion,
      asignatura,
      fechaPerf,
      estadoRegistro: EstadoRegistro.PENDIENTE
    });

    // Guardar en Firestore
    await guardarUsuarioEnFirestore(userRecord.uid, usuario);

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      uid: userRecord.uid,
      correoInstitucional,
      passwordTemporal: password // En producción, envía por correo seguro
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { registrarUsuario };
