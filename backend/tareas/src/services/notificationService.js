const admin = require('firebase-admin');

async function notificarNuevaTarea(estudiantes, tarea) {
  // Aquí podrías implementar notificaciones push, email, etc.
  // Por ahora, guardaremos las notificaciones en Firestore
  const db = admin.firestore();
  const batch = db.batch();
  
  estudiantes.forEach(estudianteId => {
    const notificacionRef = db.collection('notificaciones').doc();
    batch.set(notificacionRef, {
      tipo: 'nueva_tarea',
      usuarioId: estudianteId,
      titulo: `Nueva tarea: ${tarea.titulo}`,
      mensaje: `Se ha asignado una nueva tarea en ${tarea.asignatura}`,
      fechaCreacion: new Date().toISOString(),
      leida: false,
      datos: {
        tareaId: tarea.id,
        fechaEntrega: tarea.fechaEntrega
      }
    });
  });
  
  await batch.commit();
}

async function notificarCalificacion(estudianteId, tarea, calificacion) {
  const db = admin.firestore();
  await db.collection('notificaciones').add({
    tipo: 'calificacion',
    usuarioId: estudianteId,
    titulo: `Tarea calificada: ${tarea.titulo}`,
    mensaje: `Tu tarea ha sido calificada con ${calificacion}/10`,
    fechaCreacion: new Date().toISOString(),
    leida: false,
    datos: {
      tareaId: tarea.id,
      calificacion
    }
  });
}

module.exports = {
  notificarNuevaTarea,
  notificarCalificacion
};