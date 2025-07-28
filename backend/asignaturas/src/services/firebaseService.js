const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(__dirname, '../../../firebase/serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Guardar una nueva asignatura en Firestore
async function guardarAsignaturaEnFirestore(datos) {
  const ref = await db.collection('asignaturas').add(datos);
  return ref.id;
}

// Obtener todas las asignaturas de Firestore
async function obtenerAsignaturasDeFirestore() {
  const snapshot = await db.collection('asignaturas').get();
  const asignaturas = [];
  snapshot.forEach(doc => {
    asignaturas.push({
      id: doc.id,
      ...doc.data()
    });
  });
  return asignaturas;
}

// Obtener una asignatura específica por ID
async function obtenerAsignaturaPorId(id) {
  const doc = await db.collection('asignaturas').doc(id).get();
  if (!doc.exists) {
    throw new Error('Asignatura no encontrada');
  }
  return {
    id: doc.id,
    ...doc.data()
  };
}

// Editar una asignatura existente en Firestore
async function editarAsignaturaEnFirestore(id, datos) {
  await db.collection('asignaturas').doc(id).update(datos);
}

// Eliminar una asignatura de Firestore
async function eliminarAsignaturaDeFirestore(id) {
  await db.collection('asignaturas').doc(id).delete();
}

// Obtener asignaturas por docente
async function obtenerAsignaturasPorDocente(docenteUid) {
  const snapshot = await db.collection('asignaturas')
    .where('docenteUid', '==', docenteUid)
    .get();
  
  const asignaturas = [];
  snapshot.forEach(doc => {
    asignaturas.push({
      id: doc.id,
      ...doc.data()
    });
  });
  return asignaturas;
}

// Obtener asignaturas por estudiante
async function obtenerAsignaturasPorEstudiante(estudianteUid) {
  const snapshot = await db.collection('asignaturas')
    .where('estudiantesUid', 'array-contains', estudianteUid)
    .get();
  
  const asignaturas = [];
  snapshot.forEach(doc => {
    asignaturas.push({
      id: doc.id,
      ...doc.data()
    });
  });
  return asignaturas;
}

// Agregar estudiante a una asignatura
async function agregarEstudianteAAsignatura(asignaturaId, estudianteUid) {
  await db.collection('asignaturas').doc(asignaturaId).update({
    estudiantesUid: admin.firestore.FieldValue.arrayUnion(estudianteUid)
  });
}

// Remover estudiante de una asignatura
async function removerEstudianteDeAsignatura(asignaturaId, estudianteUid) {
  await db.collection('asignaturas').doc(asignaturaId).update({
    estudiantesUid: admin.firestore.FieldValue.arrayRemove(estudianteUid)
  });
}

// Agregar asignatura a un docente
async function agregarAsignaturaADocente(docenteUid, asignaturaId) {
  await db.collection('usuarios').doc(docenteUid).update({
    asignaturasUid: admin.firestore.FieldValue.arrayUnion(asignaturaId)
  });
}

// Remover asignatura de un docente
async function removerAsignaturaDeDocente(docenteUid, asignaturaId) {
  await db.collection('usuarios').doc(docenteUid).update({
    asignaturasUid: admin.firestore.FieldValue.arrayRemove(asignaturaId)
  });
}

// Obtener docentes con sus asignaturas
async function obtenerDocentesConAsignaturas() {
  const snapshot = await db.collection('usuarios')
    .where('tipo', '==', 'docente')
    .get();
  
  const docentes = [];
  snapshot.forEach(doc => {
    docentes.push({
      uid: doc.id,
      ...doc.data()
    });
  });
  return docentes;
}

// Obtener asignaturas de un docente con información completa
async function obtenerAsignaturasCompletasPorDocente(docenteUid) {
  const asignaturas = await obtenerAsignaturasPorDocente(docenteUid);
  
  // Obtener información adicional de cada asignatura
  const asignaturasCompletas = await Promise.all(
    asignaturas.map(async (asignatura) => {
      // Contar estudiantes
      const estudiantesCount = asignatura.estudiantesUid ? asignatura.estudiantesUid.length : 0;
      
      return {
        ...asignatura,
        numeroEstudiantes: estudiantesCount,
        estado: asignatura.docenteUid ? 'ASIGNADA' : 'SIN_DOCENTE'
      };
    })
  );
  
  return asignaturasCompletas;
}

module.exports = {
  guardarAsignaturaEnFirestore,
  obtenerAsignaturasDeFirestore,
  obtenerAsignaturaPorId,
  editarAsignaturaEnFirestore,
  eliminarAsignaturaDeFirestore,
  obtenerAsignaturasPorDocente,
  obtenerAsignaturasPorEstudiante,
  agregarEstudianteAAsignatura,
  removerEstudianteDeAsignatura,
  agregarAsignaturaADocente,
  removerAsignaturaDeDocente,
  obtenerDocentesConAsignaturas,
  obtenerAsignaturasCompletasPorDocente
};
