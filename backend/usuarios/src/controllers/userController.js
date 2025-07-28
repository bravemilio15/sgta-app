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
      fechaRegistro: fechaPerf,
      estadoAcademico: 'REGULAR'
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

// Controlador para solicitar recuperación de contraseña
async function solicitarRecuperacionContrasena(req, res) {
  try {
    const { correoPersonal } = req.body;
    
    if (!correoPersonal) {
      return res.status(400).json({ 
        error: 'El correo personal es requerido' 
      });
    }

    // Buscar usuario por correo personal
    const db = admin.firestore();
    const usuariosRef = db.collection('usuarios');
    const queryCorreoPersonal = await usuariosRef.where('correoPersonal', '==', correoPersonal).get();
    
    if (queryCorreoPersonal.empty) {
      return res.status(404).json({ 
        error: 'No se encontró una cuenta con este correo personal' 
      });
    }

    const usuarioDoc = queryCorreoPersonal.docs[0];
    const usuarioData = usuarioDoc.data();
    const uid = usuarioDoc.id;

    // Generar token único para recuperación
    const tokenRecuperacion = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 1); // Expira en 1 hora

    // Guardar token en Firestore
    await db.collection('tokensRecuperacion').doc(uid).set({
      token: tokenRecuperacion,
      expiracion: expiracion.toISOString(),
      usado: false
    });

    // URL de recuperación (ajusta según tu dominio)
    const urlRecuperacion = `http://localhost:5173/cambiar-contrasena?token=${tokenRecuperacion}&uid=${uid}`;

    // Enviar correo con el link
    await enviarCorreo(
      correoPersonal,
      'Recuperación de Contraseña - SGTA',
      `Hola ${usuarioData.nombreCompleto},\n\nSe ha solicitado la recuperación de tu contraseña en el sistema SGTA.\n\nHaz clic en el siguiente enlace para cambiar tu contraseña:\n\n${urlRecuperacion}\n\nEste enlace expira en 1 hora.\n\nSi no solicitaste esta recuperación, puedes ignorar este email.\n\nSaludos,\nEquipo SGTA - Universidad Nacional de Loja`
    );

    res.status(200).json({
      message: 'Se ha enviado un enlace de recuperación a tu correo personal.',
      uid
    });
  } catch (error) {
    console.error('Error al solicitar recuperación de contraseña:', error);
    res.status(500).json({ error: error.message });
  }
}

// Controlador para cambiar contraseña usando token de recuperación
async function cambiarContrasenaConToken(req, res) {
  try {
    const { token, uid, nuevaContrasena } = req.body;
    
    if (!token || !uid || !nuevaContrasena) {
      return res.status(400).json({ 
        error: 'Token, UID y nueva contraseña son requeridos' 
      });
    }

    // Validar que la contraseña tenga al menos 6 caracteres
    if (nuevaContrasena.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    const db = admin.firestore();
    
    // Verificar token en Firestore
    const tokenDoc = await db.collection('tokensRecuperacion').doc(uid).get();
    
    if (!tokenDoc.exists) {
      return res.status(404).json({ 
        error: 'Token de recuperación no encontrado' 
      });
    }

    const tokenData = tokenDoc.data();
    
    // Verificar que el token coincida
    if (tokenData.token !== token) {
      return res.status(400).json({ 
        error: 'Token de recuperación inválido' 
      });
    }

    // Verificar que no haya expirado
    const expiracion = new Date(tokenData.expiracion);
    if (new Date() > expiracion) {
      return res.status(400).json({ 
        error: 'Token de recuperación expirado' 
      });
    }

    // Verificar que no haya sido usado
    if (tokenData.usado) {
      return res.status(400).json({ 
        error: 'Token de recuperación ya ha sido usado' 
      });
    }

    // Actualizar contraseña en Firebase Auth
    await admin.auth().updateUser(uid, { password: nuevaContrasena });

    // Cifrar la nueva contraseña y actualizar en Firestore
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    await db.collection('usuarios').doc(uid).update({ 
      passwordHash: hashedPassword,
      passwordTemporal: null // Limpiar contraseña temporal
    });

    // Marcar token como usado
    await db.collection('tokensRecuperacion').doc(uid).update({ 
      usado: true 
    });

    res.status(200).json({
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
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
    const { tipo } = req.params; // Cambiar de req.query a req.params
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

// Registrar estudiante con matrículas
async function registrarEstudianteConMatriculas(req, res) {
  try {
    const {
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      identificacion,
      tipoIdentificacion,
      correoPersonal,
      correoUsuario,
      asignaturasIds,
      periodoId
    } = req.body;

    // Validar campos requeridos
    if (!primerNombre || !primerApellido || !identificacion || !tipoIdentificacion || !correoPersonal || !correoUsuario) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios: primerNombre, primerApellido, identificacion, tipoIdentificacion, correoPersonal, correoUsuario' 
      });
    }

    if (!asignaturasIds || !Array.isArray(asignaturasIds) || asignaturasIds.length === 0) {
      return res.status(400).json({
        error: 'Debe seleccionar al menos una asignatura'
      });
    }

    if (!periodoId) {
      return res.status(400).json({
        error: 'periodoId es obligatorio'
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

    // Para estudiantes: siempre generar contraseña temporal
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
      carrera: 'Computación',
      fechaRegistro: fechaPerf,
      estadoAcademico: 'REGULAR'
    });

    // Guardar en Firestore
    await guardarUsuarioEnFirestore(userRecord.uid, estudiante);

    // Crear matrícula para las asignaturas seleccionadas
    const MatriculaService = require('../services/matriculaService');
    const matricula = await MatriculaService.crearMatricula(
      userRecord.uid, 
      periodoId, 
      asignaturasIds
    );

    res.status(201).json({
      message: '¡Registro exitoso! Tu cuenta está pendiente de aprobación por el administrador.',
      uid: userRecord.uid,
      correoInstitucional,
      matricula: matricula.toJSON()
    });
  } catch (error) {
    console.error('Error al registrar estudiante con matrículas:', error);
    
    // Manejar errores específicos de Firebase Auth
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ 
        error: 'Ya existe un usuario con ese correo institucional' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error interno del servidor: ' + error.message 
    });
  }
}

// Obtener docentes con sus asignaturas
async function obtenerDocentesConAsignaturas(req, res) {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('usuarios')
      .where('tipo', '==', 'docente')
      .get();
    
    const docentes = [];
    snapshot.forEach(doc => {
      docentes.push({
        uid: doc.id,
        ...doc.data()
      });
    });
    
    res.json(docentes);
  } catch (error) {
    console.error('Error al obtener docentes con asignaturas:', error);
    res.status(500).json({ error: error.message });
  }
}

// Agregar asignatura a un docente
async function agregarAsignaturaADocente(req, res) {
  try {
    const { docenteUid, asignaturaId } = req.body;

    if (!docenteUid || !asignaturaId) {
      return res.status(400).json({
        error: 'docenteUid y asignaturaId son obligatorios'
      });
    }

    const db = admin.firestore();
    
    // Verificar que el docente existe
    const docenteDoc = await db.collection('usuarios').doc(docenteUid).get();
    if (!docenteDoc.exists) {
      return res.status(404).json({
        error: 'Docente no encontrado'
      });
    }

    const docente = docenteDoc.data();
    if (docente.tipo !== 'docente') {
      return res.status(400).json({
        error: 'El usuario no es un docente'
      });
    }

    // Agregar la asignatura al docente
    await db.collection('usuarios').doc(docenteUid).update({
      asignaturasUid: admin.firestore.FieldValue.arrayUnion(asignaturaId)
    });

    res.json({ 
      message: 'Asignatura agregada al docente correctamente',
      docenteUid,
      asignaturaId
    });
  } catch (error) {
    console.error('Error al agregar asignatura al docente:', error);
    res.status(500).json({ error: error.message });
  }
}

// Remover asignatura de un docente
async function removerAsignaturaDeDocente(req, res) {
  try {
    const { docenteUid, asignaturaId } = req.body;

    if (!docenteUid || !asignaturaId) {
      return res.status(400).json({
        error: 'docenteUid y asignaturaId son obligatorios'
      });
    }

    const db = admin.firestore();
    
    // Verificar que el docente existe
    const docenteDoc = await db.collection('usuarios').doc(docenteUid).get();
    if (!docenteDoc.exists) {
      return res.status(404).json({
        error: 'Docente no encontrado'
      });
    }

    // Remover la asignatura del docente
    await db.collection('usuarios').doc(docenteUid).update({
      asignaturasUid: admin.firestore.FieldValue.arrayRemove(asignaturaId)
    });

    res.json({ 
      message: 'Asignatura removida del docente correctamente',
      docenteUid,
      asignaturaId
    });
  } catch (error) {
    console.error('Error al remover asignatura del docente:', error);
    res.status(500).json({ error: error.message });
  }
}

// Obtener asignaturas de un docente específico
async function obtenerAsignaturasDeDocente(req, res) {
  try {
    const { docenteUid } = req.params;

    if (!docenteUid) {
      return res.status(400).json({
        error: 'docenteUid es obligatorio'
      });
    }

    const db = admin.firestore();
    
    // Obtener el docente
    const docenteDoc = await db.collection('usuarios').doc(docenteUid).get();
    if (!docenteDoc.exists) {
      return res.status(404).json({
        error: 'Docente no encontrado'
      });
    }

    const docente = docenteDoc.data();
    const asignaturasUid = docente.asignaturasUid || [];

    // Obtener información de las asignaturas
    const asignaturas = [];
    for (const asignaturaId of asignaturasUid) {
      const asignaturaDoc = await db.collection('asignaturas').doc(asignaturaId).get();
      if (asignaturaDoc.exists) {
        asignaturas.push({
          id: asignaturaId,
          ...asignaturaDoc.data()
        });
      }
    }

    res.json({
      docente: {
        uid: docenteUid,
        nombreCompleto: docente.nombreCompleto,
        numeroAsignaturas: asignaturasUid.length
      },
      asignaturas
    });
  } catch (error) {
    console.error('Error al obtener asignaturas del docente:', error);
    res.status(500).json({ error: error.message });
  }
}

// Obtener matrículas de un estudiante
async function obtenerMatriculasEstudiante(req, res) {
  try {
    const { estudianteUid } = req.params;
    const { periodoId } = req.query;

    if (!estudianteUid) {
      return res.status(400).json({
        error: 'estudianteUid es obligatorio'
      });
    }

    const MatriculaService = require('../services/matriculaService');
    
    let matriculas;
    if (periodoId) {
      // Obtener matrícula específica del período
      const matricula = await MatriculaService.obtenerMatriculaEstudiante(estudianteUid, periodoId);
      matriculas = matricula ? [matricula.toJSON()] : [];
    } else {
      // Obtener todas las matrículas del estudiante
      matriculas = await MatriculaService.obtenerMatriculasEstudiante(estudianteUid);
      matriculas = matriculas.map(matricula => matricula.toJSON());
    }

    res.json(matriculas);
  } catch (error) {
    console.error('Error al obtener matrículas del estudiante:', error);
    res.status(500).json({ error: error.message });
  }
}

// Crear una nueva matrícula
async function crearMatricula(req, res) {
  try {
    const { estudianteUid, asignaturaId, periodoId } = req.body;

    if (!estudianteUid || !asignaturaId || !periodoId) {
      return res.status(400).json({
        error: 'estudianteUid, asignaturaId y periodoId son obligatorios'
      });
    }

    const MatriculaService = require('../services/matriculaService');
    const matricula = await MatriculaService.crearMatricula(
      estudianteUid, 
      periodoId, 
      [asignaturaId]
    );

    res.status(201).json({
      message: 'Matrícula creada correctamente',
      matricula: matricula.toJSON()
    });
  } catch (error) {
    console.error('Error al crear matrícula:', error);
    res.status(500).json({ error: error.message });
  }
}

// Crear matrículas masivas
async function crearMatriculasMasivas(req, res) {
  try {
    const { estudianteUid, asignaturasIds, periodoId } = req.body;

    if (!estudianteUid || !asignaturasIds || !periodoId) {
      return res.status(400).json({
        error: 'estudianteUid, asignaturasIds y periodoId son obligatorios'
      });
    }

    const MatriculaService = require('../services/matriculaService');
    const matricula = await MatriculaService.crearMatricula(
      estudianteUid, 
      periodoId, 
      asignaturasIds
    );

    res.status(201).json({
      message: 'Matrículas masivas creadas correctamente',
      matricula: matricula.toJSON()
    });
  } catch (error) {
    console.error('Error al crear matrículas masivas:', error);
    res.status(500).json({ error: error.message });
  }
}

// Asignar nota a una unidad
async function asignarNotaUnidad(req, res) {
  try {
    const { matriculaId } = req.params;
    const { tipoUnidad, nota } = req.body;

    if (!matriculaId || !tipoUnidad || nota === undefined) {
      return res.status(400).json({
        error: 'matriculaId, tipoUnidad y nota son obligatorios'
      });
    }

    const MatriculaService = require('../services/matriculaService');
    await MatriculaService.asignarNotaUnidad(matriculaId, null, tipoUnidad, nota);

    res.json({
      message: 'Nota asignada correctamente'
    });
  } catch (error) {
    console.error('Error al asignar nota:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  registrarUsuario,
  aprobarUsuario,
  registrarAdministrador,
  registrarDocente,
  solicitarRecuperacionContrasena,
  cambiarContrasenaConToken,
  obtenerUsuarioPorUid,
  obtenerUsuariosPendientes,
  obtenerUsuariosPorTipo,
  obtenerEstadisticas,
  registrarEstudianteConMatriculas,
  obtenerDocentesConAsignaturas,
  agregarAsignaturaADocente,
  removerAsignaturaDeDocente,
  obtenerAsignaturasDeDocente,
  obtenerMatriculasEstudiante,
  crearMatricula,
  crearMatriculasMasivas,
  asignarNotaUnidad
};
