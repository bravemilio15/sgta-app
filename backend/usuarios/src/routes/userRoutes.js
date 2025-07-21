const express = require('express');
const router = express.Router();
const { registrarUsuario } = require('../controllers/userController');

// Ruta para registrar usuario
router.post('/register', registrarUsuario);

module.exports = router;
