const express = require('express');
const router = express.Router();
const { registrarUsuario, aprobarUsuario, registrarAdministrador, registrarDocente, obtenerUsuarioPorUid } = require('../controllers/userController');

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

module.exports = router;
