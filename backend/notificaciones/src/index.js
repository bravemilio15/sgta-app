const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
// Microservico de notificaciones
app.get('/', (req, res) => {
  res.send('Microservicio de notificaciones funcionando');
});
// Notificacion de uso de puerto
app.listen(PORT, () => {
  console.log(`Users service listening on port ${PORT}`);
});