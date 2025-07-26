const { crearUsuarioAuth, guardarUsuarioEnFirestore } = require('../services/firebaseService');
const { Usuario, Estudiante, Docente, Administrador, EstadoRegistro } = require('../models/usuario');
const admin = require('firebase-admin');
const { enviarCorreo } = require('../services/mailService');
const bcrypt = require('bcryptjs');

// Controlador para registrar un estudiante
async function registrarUsuario(req, res) {
  try {
    const {
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      identificacion,
      tipoIdentificacion,
      correoPersonal, // Correo personal del usuario
      correoUsuario, // parte antes del @ para correo institucional
      password // opcional
    } = req.body;

    // Construir correo institucional
    const correoInstitucional = `${correoUsuario}@uni.edu.ec`;
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

    // Crear objeto estudiante usando la nueva clase
    const estudiante = new Estudiante({
      nombreCompleto,
      correoPersonal,
      correoInstitucional,
      identificacion,
      tipoIdentificacion,
      fechaPerf,
      estadoRegistro: EstadoRegistro.PENDIENTE,
      passwordHash: hashedPassword,
      passwordTemporal: plainPassword,
      carrera: 'Computación', // Quemada como solicitaste
      asignaturasUid: [],
      fechaRegistro: fechaPerf
    });

    // Guardar en Firestore
    await guardarUsuarioEnFirestore(userRecord.uid, estudiante);

    // Enviar correo con la contraseña temporal
    await enviarCorreo(
      correoPersonal,
      'Registro Exitoso - SGTA',
      `Hola ${nombreCompleto},\n\nTu registro en el sistema SGTA ha sido exitoso.\n\nTus credenciales temporales son:\nCorreo: ${correoInstitucional}\nContraseña: ${plainPassword}\n\nPor favor, cambia tu contraseña al iniciar sesión.\n\nSaludos,\nEquipo SGTA`
    );

    res.status(201).json({
      message: 'Estudiante registrado correctamente',
      uid: userRecord.uid,
      correoInstitucional,
      passwordTemporal: plainPassword
    });
  } catch (error) {
    console.error('Error al registrar estudiante:', error);
    res.status(500).json({ error: error.message });
  }
}

// Controlador para aprobar usuario y generar nueva contraseña
async function aprobarUsuario(req, res) {
  try {
    const { uid } = req.body;
    // Generar nueva contraseña temporal
    const nuevaPassword = Math.random().toString(36).slice(-8) + 'A1';

    // Cambiar estado en Firestore
    const db = admin.firestore();
    await db.collection('usuarios').doc(uid).update({ 
      estadoRegistro: EstadoRegistro.APROBADO,
      passwordTemporal: nuevaPassword
    });

    // Actualizar contraseña en Auth
    await admin.auth().updateUser(uid, { password: nuevaPassword });

    // Cifrar la nueva contraseña y actualizar en Firestore
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
    await db.collection('usuarios').doc(uid).update({ passwordHash: hashedPassword });

    // Obtener datos del usuario
    const usuarioDoc = await db.collection('usuarios').doc(uid).get();
    const usuarioData = usuarioDoc.data();
    const correoPersonal = usuarioData.correoPersonal;
    const nombreCompleto = usuarioData.nombreCompleto;

    // Enviar correo con la nueva contraseña temporal
    await enviarCorreo(
      correoPersonal,
      'Tu cuenta ha sido aprobada - SGTA',
      `¡Felicidades ${nombreCompleto}!\n\nTu cuenta ha sido aprobada en el sistema SGTA.\n\nTus nuevas credenciales son:\nCorreo: ${usuarioData.correoInstitucional}\nContraseña temporal: ${nuevaPassword}\n\nPor favor, cambia tu contraseña al iniciar sesión.\n\nSaludos,\nEquipo SGTA`
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
      correoPersonal,
      correoUsuario,
      identificacion,
      tipoIdentificacion,
      password // opcional
    } = req.body;
    const correoInstitucional = `${correoUsuario}@uni.edu.ec`;
    const fechaPerf = new Date().toISOString();
    const plainPassword = password || (Math.random().toString(36).slice(-8) + 'A1');
    const userRecord = await crearUsuarioAuth(correoInstitucional, plainPassword);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    const administrador = new Administrador({
      nombreCompleto,
      correoPersonal,
      correoInstitucional,
      identificacion,
      tipoIdentificacion,
      fechaPerf,
      estadoRegistro: EstadoRegistro.APROBADO,
      passwordHash: hashedPassword,
      passwordTemporal: plainPassword,
      nivelAcceso: 'admin'
    });
    
    await guardarUsuarioEnFirestore(userRecord.uid, administrador);
    
    // Enviar correo con credenciales
    await enviarCorreo(
      correoPersonal,
      'Cuenta de Administrador Creada - SGTA',
      `Hola ${nombreCompleto},\n\nTu cuenta de administrador ha sido creada exitosamente.\n\nTus credenciales son:\nCorreo: ${correoInstitucional}\nContraseña: ${plainPassword}\n\nSaludos,\nEquipo SGTA`
    );
    
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
      correoPersonal,
      correoUsuario,
      identificacion,
      tipoIdentificacion,
      asignaturasUid, // Array de IDs de asignaturas
      titulos, // Array de títulos
      departamento,
      password // opcional
    } = req.body;
    const correoInstitucional = `${correoUsuario}@uni.edu.ec`;
    const fechaPerf = new Date().toISOString();
    const plainPassword = password || (Math.random().toString(36).slice(-8) + 'A1');
    const userRecord = await crearUsuarioAuth(correoInstitucional, plainPassword);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    const docente = new Docente({
      nombreCompleto,
      correoPersonal,
      correoInstitucional,
      identificacion,
      tipoIdentificacion,
      fechaPerf,
      estadoRegistro: EstadoRegistro.APROBADO,
      passwordHash: hashedPassword,
      passwordTemporal: plainPassword,
      asignaturasUid: Array.isArray(asignaturasUid) ? asignaturasUid : [],
      titulos: Array.isArray(titulos) ? titulos : titulos.split(',').map(t => t.trim()),
      departamento
    });
    
    await guardarUsuarioEnFirestore(userRecord.uid, docente);
    
    // Enviar correo con credenciales
    await enviarCorreo(
      correoPersonal,
      'Cuenta de Docente Creada - SGTA',
      `Hola ${nombreCompleto},\n\nTu cuenta de docente ha sido creada exitosamente.\n\nTus credenciales son:\nCorreo: ${correoInstitucional}\nContraseña: ${plainPassword}\n\nAsignaturas asignadas: ${docente.asignaturasUid.length} asignaturas\n\nSaludos,\nEquipo SGTA`
    );
    
    res.status(201).json({
      message: 'Docente registrado correctamente',
      uid: userRecord.uid,
      correoInstitucional,
      passwordTemporal: plainPassword
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

// Obtener usuarios por tipo
async function obtenerUsuariosPorTipo(req, res) {
  try {
    const { tipo } = req.query;
    const db = admin.firestore();
    
    if (!tipo) {
      return res.status(400).json({ error: 'Parámetro tipo requerido' });
    }

    const snapshot = await db.collection('usuarios').where('tipo', '==', tipo).get();
    const usuarios = snapshot.docs.map(doc => ({ 
      uid: doc.id, 
      ...doc.data(),
      fechaRegistro: doc.data().fechaRegistro || doc.data().fechaPerf ? new Date(doc.data().fechaPerf).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));
    
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios por tipo:', error);
    res.status(500).json({ error: error.message });
  }
}

// Obtener estadísticas generales
async function obtenerEstadisticas(req, res) {
  try {
    const db = admin.firestore();
    
    // Obtener todos los usuarios
    const snapshot = await db.collection('usuarios').get();
    const usuarios = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    
    // Obtener asignaturas
    const asignaturasSnapshot = await db.collection('asignaturas').get();
    const totalAsignaturas = asignaturasSnapshot.size;
    
    // Calcular estadísticas
    const estadisticas = {
      totalEstudiantes: usuarios.filter(u => u.tipo === 'estudiante').length,
      totalDocentes: usuarios.filter(u => u.tipo === 'docente').length,
      estudiantesPendientes: usuarios.filter(u => u.tipo === 'estudiante' && u.estadoRegistro === 'Pendiente').length,
      docentesActivos: usuarios.filter(u => u.tipo === 'docente' && u.estadoRegistro === 'Aprobado').length,
      totalAsignaturas: totalAsignaturas
    };
    
    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { 
  registrarUsuario, 
  aprobarUsuario, 
  registrarAdministrador, 
  registrarDocente, 
  obtenerUsuarioPorUid, 
  obtenerUsuariosPendientes,
  obtenerUsuariosPorTipo,
  obtenerEstadisticas
};
