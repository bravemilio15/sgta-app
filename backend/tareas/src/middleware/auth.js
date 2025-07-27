const admin = require('firebase-admin');

async function verificarToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.usuario = decodedToken;
    
    // Obtener información adicional del usuario desde Firestore
    const db = admin.firestore();
    const userDoc = await db.collection('usuarios').doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      req.usuario = { ...decodedToken, ...userDoc.data() };
    }
    
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
}

function verificarRol(rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    if (!rolesPermitidos.includes(req.usuario.tipo)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }
    
    next();
  };
}

module.exports = {
  verificarToken,
  verificarRol
};