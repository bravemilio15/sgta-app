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

    // Validar campos requeridos
    if (!primerNombre || !primerApellido || !identificacion || !tipoIdentificacion || !correoPersonal || !correoUsuario) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios: primerNombre, primerApellido, identificacion, tipoIdentificacion, correoPersonal, correoUsuario' 
      });
    }

    // Construir correo institucional
    const correoInstitucional = `${correoUsuario}@uni.edu.ec`;
    // Generar nombre completo
    const nombreCompleto = `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.replace(/  +/g, ' ').trim();
    // Fecha de creación
    const fechaPerf = new Date().toISOString();

    // Verificar si ya existe un usuario con esa identificación
    const db = admin.firestore();
    const usuariosRef = db.collection('usuarios');
    const queryIdentificacion = await usuariosRef.where('identificacion', '==', identificacion).get();
    
    if (!queryIdentificacion.empty) {
      return res.status(400).json({ 
        error: 'Ya existe un usuario registrado con esa identificación' 
      });
    }

    // Verificar si ya existe un usuario con ese correo personal
    const queryCorreoPersonal = await usuariosRef.where('correoPersonal', '==', correoPersonal).get();
    
    if (!queryCorreoPersonal.empty) {
      return res.status(400).json({ 
        error: 'Ya existe un usuario registrado con ese correo personal' 
      });
    }

    // Verificar si ya existe un usuario con ese correo institucional
    const queryCorreoInstitucional = await usuariosRef.where('correoInstitucional', '==', correoInstitucional).get();
    
    if (!queryCorreoInstitucional.empty) {
      return res.status(400).json({ 
        error: 'Ya existe un usuario registrado con ese correo institucional' 
      });
    }

    // Para estudiantes: siempre generar contraseña temporal (no ingresan contraseña)
    const plainPassword = Math.random().toString(36).slice(-8) + 'A1';
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

    // NO enviar correo con credenciales hasta que sea aprobado
    res.status(201).json({
      message: '¡Registro exitoso! Tu cuenta está pendiente de aprobación por el administrador.',
      uid: userRecord.uid,
      correoInstitucional
    });
  } catch (error) {
    console.error('Error al registrar estudiante:', error);
    
    // Manejar errores específicos de Firebase Auth
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ 
        error: 'El correo institucional ya está registrado en el sistema' 
      });
    }
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ 
        error: 'El formato del correo institucional no es válido' 
      });
    }
    
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ 
        error: 'La contraseña generada es muy débil' 
      });
    }
    
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
    
    // Validar campos requeridos
    if (!nombreCompleto || !correoPersonal || !correoUsuario || !identificacion || !tipoIdentificacion) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios: nombreCompleto, correoPersonal, correoUsuario, identificacion, tipoIdentificacion' 
      });
    }
    
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
      titulos, // Array de títulos académicos
      departamento
    } = req.body;
    
    // Validar campos requeridos
    if (!nombreCompleto || !correoUsuario || !identificacion || !tipoIdentificacion) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios: nombreCompleto, correoUsuario, identificacion, tipoIdentificacion' 
      });
    }
    
    const correoInstitucional = `${correoUsuario}@uni.edu.ec`;
    const fechaPerf = new Date().toISOString();

    // Verificar si ya existe un usuario con esa identificación
    const db = admin.firestore();
    const usuariosRef = db.collection('usuarios');
    const queryIdentificacion = await usuariosRef.where('identificacion', '==', identificacion).get();
    
    if (!queryIdentificacion.empty) {
      return res.status(400).json({ 
        error: 'Ya existe un usuario registrado con esa identificación' 
      });
    }

    // Verificar si ya existe un usuario con ese correo personal (solo si se proporciona)
    if (correoPersonal) {
      const queryCorreoPersonal = await usuariosRef.where('correoPersonal', '==', correoPersonal).get();
      
      if (!queryCorreoPersonal.empty) {
        return res.status(400).json({ 
          error: 'Ya existe un usuario registrado con ese correo personal' 
        });
      }
    }

    // Verificar si ya existe un usuario con ese correo institucional
    const queryCorreoInstitucional = await usuariosRef.where('correoInstitucional', '==', correoInstitucional).get();
    
    if (!queryCorreoInstitucional.empty) {
      return res.status(400).json({ 
        error: 'Ya existe un usuario registrado con ese correo institucional' 
      });
    }

    // Para docentes: generar contraseña temporal automáticamente (misma lógica que estudiantes)
    const plainPassword = Math.random().toString(36).slice(-8) + 'A1';
    const userRecord = await crearUsuarioAuth(correoInstitucional, plainPassword);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    const docente = new Docente({
      nombreCompleto,
      correoPersonal,
      correoInstitucional,
      identificacion,
      tipoIdentificacion,
      fechaPerf,
      estadoRegistro: EstadoRegistro.PENDIENTE, // Los docentes requieren aprobación del administrador
      passwordHash: hashedPassword,
      passwordTemporal: plainPassword,
      asignaturasUid: Array.isArray(asignaturasUid) ? asignaturasUid : [],
      titulos: Array.isArray(titulos) ? titulos : (titulos ? titulos.split(',').map(t => t.trim()) : [])
    });
    
    await guardarUsuarioEnFirestore(userRecord.uid, docente);
    
    // NO enviar correo con credenciales hasta que sea aprobado
    res.status(201).json({
      message: '¡Registro exitoso! Tu cuenta está pendiente de aprobación por el administrador.',
      uid: userRecord.uid,
      correoInstitucional
    });
  } catch (error) {
    console.error('Error al registrar docente:', error);
    
    // Manejar errores específicos de Firebase Auth
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ 
        error: 'El correo institucional ya está registrado en el sistema' 
      });
    }
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ 
        error: 'El formato del correo institucional no es válido' 
      });
    }
    
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ 
        error: 'La contraseña generada es muy débil' 
      });
    }
    
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
    const usuarios = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        uid: doc.id, 
        ...data,
        estado: data.estadoRegistro?.toLowerCase() || 'pendiente' // Agregar campo estado para compatibilidad
      };
    });
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
    const usuarios = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        uid: doc.id, 
        ...data,
        estado: data.estadoRegistro?.toLowerCase() || 'pendiente', // Agregar campo estado para compatibilidad
        fechaRegistro: data.fechaRegistro || data.fechaPerf ? new Date(data.fechaPerf).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
    });
    
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
