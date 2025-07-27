const express = require('express');
const router = express.Router();
const {
  obtenerNotificacionesUsuario,
  crearNotificacion,
  marcarComoLeida,
  marcarComoNoLeida,
  eliminarNotificacion,
  marcarTodasComoLeidas,
  contarNoLeidas
} = require('../controllers/notificacionesController');

// Rutas para notificaciones

// GET /api/notificaciones/usuario/:uid - Obtener notificaciones de un usuario
router.get('/usuario/:uid', obtenerNotificacionesUsuario);

// GET /api/notificaciones/usuario/:uid/conteo-no-leidas - Contar notificaciones no leídas
router.get('/usuario/:uid/conteo-no-leidas', contarNoLeidas);

// POST /api/notificaciones - Crear nueva notificación
router.post('/', crearNotificacion);

// PATCH /api/notificaciones/:id/leida - Marcar como leída
router.patch('/:id/leida', marcarComoLeida);

// PATCH /api/notificaciones/:id/no-leida - Marcar como no leída
router.patch('/:id/no-leida', marcarComoNoLeida);

// PATCH /api/notificaciones/usuario/:uid/marcar-todas-leidas - Marcar todas como leídas
router.patch('/usuario/:uid/marcar-todas-leidas', marcarTodasComoLeidas);

// DELETE /api/notificaciones/:id - Eliminar notificación
router.delete('/:id', eliminarNotificacion);

module.exports = router;
