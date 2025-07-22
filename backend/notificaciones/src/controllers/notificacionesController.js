const notificacionesService = require('../services/notificacionesService');

// Obtener notificaciones de un usuario
async function obtenerNotificacionesUsuario(req, res) {
  try {
    const { uid } = req.params;
    const limite = parseInt(req.query.limite) || 50;
    
    const notificaciones = await notificacionesService.obtenerNotificacionesUsuario(uid, limite);
    
    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: error.message });
  }
}

// Crear nueva notificación
async function crearNotificacion(req, res) {
  try {
    const {
      titulo,
      mensaje,
      tipo,
      destinatarioUid,
      remitenteUid,
      remitente,
      accionUrl
    } = req.body;

    if (!titulo || !mensaje || !destinatarioUid) {
      return res.status(400).json({ 
        error: 'Título, mensaje y destinatarioUid son obligatorios' 
      });
    }

    const notificacion = await notificacionesService.crearNotificacion({
      titulo,
      mensaje,
      tipo: tipo || 'info',
      destinatarioUid,
      remitenteUid,
      remitente: remitente || 'Sistema SGTA',
      accionUrl
    });

    res.status(201).json(notificacion);
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({ error: error.message });
  }
}

// Marcar notificación como leída
async function marcarComoLeida(req, res) {
  try {
    const { id } = req.params;
    
    const resultado = await notificacionesService.marcarComoLeida(id);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error al marcar como leída:', error);
    res.status(500).json({ error: error.message });
  }
}

// Marcar notificación como no leída
async function marcarComoNoLeida(req, res) {
  try {
    const { id } = req.params;
    
    const resultado = await notificacionesService.marcarComoNoLeida(id);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error al marcar como no leída:', error);
    res.status(500).json({ error: error.message });
  }
}

// Eliminar notificación
async function eliminarNotificacion(req, res) {
  try {
    const { id } = req.params;
    
    const resultado = await notificacionesService.eliminarNotificacion(id);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ error: error.message });
  }
}

// Marcar todas las notificaciones como leídas
async function marcarTodasComoLeidas(req, res) {
  try {
    const { uid } = req.params;
    
    const resultado = await notificacionesService.marcarTodasComoLeidas(uid);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    res.status(500).json({ error: error.message });
  }
}

// Obtener conteo de notificaciones no leídas
async function contarNoLeidas(req, res) {
  try {
    const { uid } = req.params;
    
    const conteo = await notificacionesService.contarNoLeidas(uid);
    
    res.json({ conteo });
  } catch (error) {
    console.error('Error al contar no leídas:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  obtenerNotificacionesUsuario,
  crearNotificacion,
  marcarComoLeida,
  marcarComoNoLeida,
  eliminarNotificacion,
  marcarTodasComoLeidas,
  contarNoLeidas
};
