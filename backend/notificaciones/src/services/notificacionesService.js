const admin = require('firebase-admin');
const path = require('path');
const { Notificacion } = require('../models/notificacion');

// Inicializar Firebase Admin si no está inicializado
const serviceAccount = require(path.resolve(__dirname, '../../../firebase/serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

class NotificacionesService {
  constructor() {
    this.coleccion = 'notificaciones';
  }

  // Crear una nueva notificación
  async crearNotificacion(datos) {
    try {
      const notificacion = new Notificacion(datos);
      await db.collection(this.coleccion).doc(notificacion.id).set(notificacion.toJSON());
      return notificacion;
    } catch (error) {
      throw new Error('Error al crear notificación: ' + error.message);
    }
  }

  // Obtener notificaciones de un usuario
  async obtenerNotificacionesUsuario(uid, limite = 50) {
    try {
      const snapshot = await db.collection(this.coleccion)
        .where('destinatarioUid', '==', uid)
        .orderBy('fechaCreacion', 'desc')
        .limit(limite)
        .get();

      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      throw new Error('Error al obtener notificaciones: ' + error.message);
    }
  }

  // Marcar notificación como leída
  async marcarComoLeida(notificacionId) {
    try {
      const now = new Date().toISOString();
      await db.collection(this.coleccion).doc(notificacionId).update({
        estado: 'leida',
        fechaLectura: now
      });
      return { success: true };
    } catch (error) {
      throw new Error('Error al marcar como leída: ' + error.message);
    }
  }

  // Marcar notificación como no leída
  async marcarComoNoLeida(notificacionId) {
    try {
      await db.collection(this.coleccion).doc(notificacionId).update({
        estado: 'no_leida',
        fechaLectura: null
      });
      return { success: true };
    } catch (error) {
      throw new Error('Error al marcar como no leída: ' + error.message);
    }
  }

  // Eliminar notificación
  async eliminarNotificacion(notificacionId) {
    try {
      await db.collection(this.coleccion).doc(notificacionId).delete();
      return { success: true };
    } catch (error) {
      throw new Error('Error al eliminar notificación: ' + error.message);
    }
  }

  // Marcar todas las notificaciones de un usuario como leídas
  async marcarTodasComoLeidas(uid) {
    try {
      const snapshot = await db.collection(this.coleccion)
        .where('destinatarioUid', '==', uid)
        .where('estado', '==', 'no_leida')
        .get();

      const batch = db.batch();
      const now = new Date().toISOString();

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          estado: 'leida',
          fechaLectura: now
        });
      });

      await batch.commit();
      return { success: true, actualizadas: snapshot.docs.length };
    } catch (error) {
      throw new Error('Error al marcar todas como leídas: ' + error.message);
    }
  }

  // Obtener conteo de notificaciones no leídas
  async contarNoLeidas(uid) {
    try {
      const snapshot = await db.collection(this.coleccion)
        .where('destinatarioUid', '==', uid)
        .where('estado', '==', 'no_leida')
        .get();

      return snapshot.size;
    } catch (error) {
      throw new Error('Error al contar no leídas: ' + error.message);
    }
  }

  // Crear notificación automática del sistema
  async crearNotificacionSistema(destinatarioUid, titulo, mensaje, tipo = 'info', accionUrl = null) {
    return this.crearNotificacion({
      titulo,
      mensaje,
      tipo,
      destinatarioUid,
      remitente: 'Sistema SGTA',
      accionUrl
    });
  }
}

module.exports = new NotificacionesService();
