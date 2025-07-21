const path = require('path');

// Exporta la ruta absoluta a la clave de servicio
const serviceAccount = require(path.resolve(__dirname, 'serviceAccountKey.json'));

module.exports = serviceAccount; 