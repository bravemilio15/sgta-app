const { upload } = require('../services/fileService');

// Middleware para manejar múltiples archivos
const uploadMultiple = upload.array('archivos', 5); // Máximo 5 archivos

// Middleware para manejar errores de multer
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo excede el tamaño máximo permitido (10MB)' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
}

module.exports = {
  uploadMultiple,
  handleMulterError
};