const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(__dirname, '../../../firebase/serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Guarda una tarea en Firestore
async function guardarTareaEnFirestore(datos) {
  const ref = await db.collection('tareas').add(datos);
  return ref.id;
}

// Obtiene todas las tareas
async function obtenerTareasDeFirestore() {
  const snapshot = await db.collection('tareas').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Edicion de una tarea existente
async function editarTareaEnFirestore(id, datosActualizados) {
  const tareaRef = db.collection('tareas').doc(id);
  await tareaRef.update(datosActualizados);
  return tareaRef.id;
}

// Eliminacion de una tarea
async function eliminarTareaEnFirestore(id) {
  const tareaRef = db.collection('tareas').doc(id);
  await tareaRef.delete();
  return id;
}

module.exports = {
  guardarTareaEnFirestore,
  obtenerTareasDeFirestore,
  editarTareaEnFirestore,
  eliminarTareaEnFirestore
};
