const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(__dirname, '../../../firebase/serviceAccountKey.json'));
// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();
const db = admin.firestore();
//Functions para crear usuario en Firebase Auth y guardar en Firestore
async function crearUsuarioAuth(email, password) {
  return await auth.createUser({
    email,
    password,
    emailVerified: false,
    disabled: false
  });
}
//Guardar usuario en Firestore
async function guardarUsuarioEnFirestore(uid, datos) {
  // Convertir el objeto de clase a JSON para Firestore
  const datosJSON = datos.toJSON ? datos.toJSON() : datos;
  return await db.collection('usuarios').doc(uid).set(datosJSON);
}

module.exports = {
  crearUsuarioAuth,
  guardarUsuarioEnFirestore
};
