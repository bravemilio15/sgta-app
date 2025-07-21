const { crearUsuarioAuth, guardarUsuarioEnFirestore } = require('../services/firebaseService');
const { Usuario, Administrador, Docente, EstadoRegistro } = require('../models/usuario');
const admin = require('firebase-admin');
const { enviarCorreo } = require('../services/mailService');
const bcrypt = require('bcryptjs');

// Controlador para registrar un usuario
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
      correoUsuario, // parte antes del @
      password // opcional
    } = req.body;

    // Construir correo institucional
    const correoInstitucional = req.body.correo || `${correoUsuario}@uni.edu.ec`;
    // Generar nombre completo
    const nombreCompleto = `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.replace(/  +/g, ' ').trim();
    // Fecha de creación
    const fechaPerf = new Date().toISOString();

    // Usar la contraseña proporcionada o generar una aleatoria
    const plainPassword = password || (Math.random().toString(36).slice(-8) + 'A1');
    // Crear usuario en Auth
    const userRecord = await crearUsuarioAuth(correoInstitucional, plainPassword);
    // Hashear la contraseña para guardar en Firestore
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Crear objeto usuario
    const usuario = {
      nombreCompleto,
      correoInstitucional,
      identificacion,
      tipoIdentificacion,
      asignatura,
      fechaPerf,
      estadoRegistro: EstadoRegistro.PENDIENTE,
      tipo: 'estudiante',
      passwordHash: hashedPassword
    };

    // Guardar en Firestore
    await guardarUsuarioEnFirestore(userRecord.uid, usuario);

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      uid: userRecord.uid,
      correoInstitucional,
      passwordTemporal: plainPassword // En producción, envía por correo seguro
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: error.message });
  }
}

// Controlador para aprobar usuario y generar nueva contraseña o link de restablecimiento
async function aprobarUsuario(req, res) {
  try {
    const { uid } = req.body;
    // Generar nueva contraseña temporal
    const nuevaPassword = Math.random().toString(36).slice(-8) + 'A1';

    // Cambiar estado en Firestore
    const db = admin.firestore();
    await db.collection('usuarios').doc(uid).update({ estadoRegistro: EstadoRegistro.APROBADO });

    // Actualizar contraseña en Auth
    await admin.auth().updateUser(uid, { password: nuevaPassword });

    // Cifrar la nueva contraseña y actualizar en Firestore
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
    await db.collection('usuarios').doc(uid).update({ passwordHash: hashedPassword });

    // Obtener correo del usuario
    const usuarioDoc = await db.collection('usuarios').doc(uid).get();
    const correo = usuarioDoc.data().correoInstitucional;

    // Enviar correo con la contraseña temporal
    await enviarCorreo(
      correo,
      'Tu cuenta ha sido aprobada',
      `¡Felicidades! Tu cuenta ha sido aprobada. Tu contraseña temporal es: ${nuevaPassword}\nPor favor, cámbiala al iniciar sesión.`
    );

    res.status(200).json({
      message: 'Usuario aprobado y contraseña generada',
      uid,
      nuevaPassword
    });
  } catch (error) {
    console.error('Error al aprobar usuario:', error);
    res.status(500).json({ error: error.message });
  }
}

// Controlador para registrar un administrador
async function registrarAdministrador(req, res) {
  try {
    const {
      nombreCompleto,
      correoUsuario,
      identificacion,
      tipoIdentificacion,
      password // opcional
    } = req.body;
    const correoInstitucional = req.body.correo || `${correoUsuario}@uni.edu.ec`;
    const fechaPerf = new Date().toISOString();
    const plainPassword = password || (Math.random().toString(36).slice(-8) + 'A1');
    const userRecord = await crearUsuarioAuth(correoInstitucional, plainPassword);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const admin = new Administrador({
      nombreCompleto,
      correoInstitucional,
      identificacion,
      tipoIdentificacion,
      fechaPerf,
      passwordHash: hashedPassword
    });
    await guardarUsuarioEnFirestore(userRecord.uid, { ...admin });
    res.status(201).json({
      message: 'Administrador registrado correctamente',
      uid: userRecord.uid,
      correoInstitucional,
      passwordTemporal: plainPassword
    });
  } catch (error) {
    console.error('Error al registrar administrador:', error);
    res.status(500).json({ error: error.message });
  }
}

// Controlador para registrar un docente
async function registrarDocente(req, res) {
  try {
    const {
      nombreCompleto,
      correoUsuario,
      identificacion,
      tipoIdentificacion
    } = req.body;
    const correoInstitucional = `${correoUsuario}@uni.edu.ec`;
    const fechaPerf = new Date().toISOString();
    const password = Math.random().toString(36).slice(-8) + 'A1';
    const userRecord = await crearUsuarioAuth(correoInstitucional, password);
    const docente = new Docente({
      nombreCompleto,
      correoInstitucional,
      identificacion,
      tipoIdentificacion,
      fechaPerf
    });
    await guardarUsuarioEnFirestore(userRecord.uid, { ...docente });
    res.status(201).json({
      message: 'Docente registrado correctamente',
      uid: userRecord.uid,
      correoInstitucional,
      passwordTemporal: password
    });
  } catch (error) {
    console.error('Error al registrar docente:', error);
    res.status(500).json({ error: error.message });
  }
}

// Obtener usuario por uid
async function obtenerUsuarioPorUid(req, res) {
  try {
    const { uid } = req.params;
    const db = admin.firestore();
    const usuarioDoc = await db.collection('usuarios').doc(uid).get();
    if (!usuarioDoc.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuarioDoc.data());
  } catch (error) {
    console.error('Error al obtener usuario por uid:', error);
    res.status(500).json({ error: error.message });
  }
}

// Obtener usuarios pendientes
async function obtenerUsuariosPendientes(req, res) {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('usuarios').where('estadoRegistro', '==', 'Pendiente').get();
    const usuarios = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios pendientes:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { registrarUsuario, aprobarUsuario, registrarAdministrador, registrarDocente, obtenerUsuarioPorUid, obtenerUsuariosPendientes };
