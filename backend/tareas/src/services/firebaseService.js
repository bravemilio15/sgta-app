const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  const serviceAccount = require(path.resolve(__dirname, '../../../firebase/serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'your-project-id.appspot.com'
  });
}

const db = admin.firestore();
const storage = admin.storage().bucket();

// Funciones para Tareas
async function crearTarea(tarea) {
  const ref = await db.collection('tareas').add(tarea);
  return ref.id;
}

async function obtenerTarea(tareaId) {
  const doc = await db.collection('tareas').doc(tareaId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function actualizarTarea(tareaId, datos) {
  await db.collection('tareas').doc(tareaId).update(datos);
  return tareaId;
}

async function eliminarTarea(tareaId) {
  await db.collection('tareas').doc(tareaId).delete();
  return tareaId;
}

async function obtenerTareasPorDocente(docenteId) {
  const snapshot = await db.collection('tareas')
    .where('docenteId', '==', docenteId)
    .orderBy('fechaCreacion', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Funciones para Asignaciones
async function crearAsignacion(asignacion) {
  const ref = await db.collection('asignaciones').add(asignacion);
  return ref.id;
}

async function obtenerAsignacionesPorTarea(tareaId) {
  const snapshot = await db.collection('asignaciones')
    .where('tareaId', '==', tareaId)
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Funciones para Entregas
async function crearEntrega(entrega) {
  const ref = await db.collection('entregas').add(entrega);
  return ref.id;
}

async function obtenerEntrega(entregaId) {
  const doc = await db.collection('entregas').doc(entregaId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function actualizarEntrega(entregaId, datos) {
  await db.collection('entregas').doc(entregaId).update(datos);
  return entregaId;
}

async function obtenerEntregasPorTarea(tareaId) {
  const snapshot = await db.collection('entregas')
    .where('tareaId', '==', tareaId)
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function obtenerEntregaPorEstudianteTarea(estudianteId, tareaId) {
  const snapshot = await db.collection('entregas')
    .where('estudianteId', '==', estudianteId)
    .where('tareaId', '==', tareaId)
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

// Funciones para obtener tareas del estudiante
async function obtenerTareasEstudiante(estudianteId) {
  // Obtener asignaciones del estudiante
  const asignacionesSnapshot = await db.collection('asignaciones')
    .where('destinatarios', 'array-contains', estudianteId)
    .get();
  
  const tareasIds = asignacionesSnapshot.docs.map(doc => doc.data().tareaId);
  
  if (tareasIds.length === 0) return [];
  
  // Obtener las tareas correspondientes
  const tareasPromises = tareasIds.map(id => obtenerTarea(id));
  const tareas = await Promise.all(tareasPromises);
  
  return tareas.filter(t => t !== null);
}

// Funciones para Storage
async function subirArchivo(archivo, carpeta) {
  const nombreArchivo = `${carpeta}/${Date.now()}_${archivo.originalname}`;
  const file = storage.file(nombreArchivo);
  
  await file.save(archivo.buffer, {
    metadata: {
      contentType: archivo.mimetype
    }
  });
  
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: '03-09-2491'
  });
  
  return {
    nombre: archivo.originalname,
    url,
    tipo: archivo.mimetype,
    tamanio: archivo.size
  };
}

async function eliminarArchivo(nombreArchivo) {
  await storage.file(nombreArchivo).delete();
}

module.exports = {
  crearTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  obtenerTareasPorDocente,
  crearAsignacion,
  obtenerAsignacionesPorTarea,
  crearEntrega,
  obtenerEntrega,
  actualizarEntrega,
  obtenerEntregasPorTarea,
  obtenerEntregaPorEstudianteTarea,
  obtenerTareasEstudiante,
  subirArchivo,
  eliminarArchivo
};