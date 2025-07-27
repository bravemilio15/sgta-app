const express = require('express');
const router = express.Router();
const { 
  registrarUsuario, 
  registrarEstudianteConMatriculas,
  aprobarUsuario, 
  registrarAdministrador, 
  registrarDocente, 
  solicitarRecuperacionContrasena,
  cambiarContrasenaConToken,
  obtenerUsuarioPorUid, 
  obtenerUsuariosPendientes,
  obtenerUsuariosPorTipo,
  obtenerEstadisticas
} = require('../controllers/userController');

// Importar rutas de matrículas
const matriculaRoutes = require('./matriculaRoutes');
// Importar rutas de períodos académicos
const periodoAcademicoRoutes = require('./periodoAcademicoRoutes');

// Ruta para registrar usuario estudiante
router.post('/register', registrarUsuario);
// Ruta para registrar estudiante con matrículas
router.post('/register-with-matriculas', registrarEstudianteConMatriculas);
// Ruta para aprobar usuario
router.post('/approve', aprobarUsuario);
// Ruta para registrar administrador
router.post('/register-admin', registrarAdministrador);
// Ruta para registrar docente
router.post('/register-docente', registrarDocente);
// Ruta para solicitar recuperación de contraseña
router.post('/solicitar-recuperacion', solicitarRecuperacionContrasena);
// Ruta para cambiar contraseña con token
router.post('/cambiar-contrasena', cambiarContrasenaConToken);
// Usar rutas de matrículas
router.use('/matriculas', matriculaRoutes);
// Usar rutas de períodos académicos
router.use('/periodos-academicos', periodoAcademicoRoutes);

// Ruta para obtener estadísticas
router.get('/estadisticas', obtenerEstadisticas);
// Ruta para obtener usuarios (con filtros)
router.get('/', (req, res) => {
  if (req.query.estado === 'Pendiente') {
    return obtenerUsuariosPendientes(req, res);
  }
  if (req.query.tipo) {
    return obtenerUsuariosPorTipo(req, res);
  }
  // Si no se proporciona ningún parámetro, retornar error
  res.status(400).json({ error: 'Parámetro de estado o tipo requerido' });
});
// Ruta para obtener usuario por uid
router.get('/:uid', obtenerUsuarioPorUid);

module.exports = router;
