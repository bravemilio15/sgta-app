const multer = require('multer');
const path = require('path');

// Configuración de multer para manejar archivos
const storage = multer.memoryStorage();

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'doc'
  };
  
  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan PDF, Excel y Word.'), false);
  }
};

// Configuración de límites
const limits = {
  fileSize: 10 * 1024 * 1024 // 10MB
};

const upload = multer({
  storage,
  fileFilter,
  limits
});

// Validar archivos según configuración de la tarea
function validarArchivos(archivos, configuracionTarea) {
  const errores = [];
  
  archivos.forEach(archivo => {
    // Validar tamaño
    if (archivo.size > configuracionTarea.tamanioMaximoMB * 1024 * 1024) {
      errores.push(`${archivo.originalname} excede el tamaño máximo permitido`);
    }
    
    // Validar tipo
    const extension = path.extname(archivo.originalname).toLowerCase().substring(1);
    if (!configuracionTarea.archivosPermitidos.includes(extension)) {
      errores.push(`${archivo.originalname} no es un tipo de archivo permitido`);
    }
  });
  
  // Validar archivos obligatorios
  const extensionesSubidas = archivos.map(a => 
    path.extname(a.originalname).toLowerCase().substring(1)
  );
  
  if (!extensionesSubidas.includes('pdf')) {
    errores.push('Debe incluir al menos un archivo PDF');
  }
  
  if (!extensionesSubidas.some(ext => ['xlsx', 'xls'].includes(ext))) {
    errores.push('Debe incluir al menos un archivo Excel');
  }
  
  return errores;
}

module.exports = {
  upload,
  validarArchivos
};