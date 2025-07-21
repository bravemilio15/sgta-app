const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(__dirname, '../../../firebase/serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function crearUsuarioAuth(email, password) {
  return await auth.createUser({
    email,
    password,
    emailVerified: false,
    disabled: false
  });
}

async function guardarUsuarioEnFirestore(uid, datos) {
  return await db.collection('usuarios').doc(uid).set(datos);
}

module.exports = {
  crearUsuarioAuth,
  guardarUsuarioEnFirestore
};
