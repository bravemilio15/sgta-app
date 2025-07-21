const express = require('express');
const router = express.Router();
const { registrarUsuario, aprobarUsuario } = require('../controllers/userController');

// Ruta para registrar usuario
router.post('/register', registrarUsuario);
// Ruta para aprobar usuario
router.post('/approve', aprobarUsuario);

module.exports = router;
