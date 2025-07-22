const express = require('express');
const router = express.Router();
const { registrarUsuario, aprobarUsuario, registrarAdministrador, registrarDocente, obtenerUsuarioPorUid, obtenerUsuariosPendientes } = require('../controllers/userController');

// Ruta para registrar usuario estudiante
router.post('/register', registrarUsuario);
// Ruta para aprobar usuario
router.post('/approve', aprobarUsuario);
// Ruta para registrar administrador
router.post('/register-admin', registrarAdministrador);
// Ruta para registrar docente
router.post('/register-docente', registrarDocente);
// Ruta para obtener usuario por uid
router.get('/:uid', obtenerUsuarioPorUid);
// Ruta para obtener usuarios pendientes
router.get('/', (req, res) => {
  if (req.query.estado === 'Pendiente') {
    return obtenerUsuariosPendientes(req, res);
  }
  // Si no se proporciona el parámetro de estado, retornar error
  res.status(400).json({ error: 'Parámetro de estado requerido' });
});

module.exports = router;
