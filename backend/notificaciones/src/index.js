const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Importar rutas de notificaciones
const notificacionesRoutes = require('./routes/notificacionesRoutes');

app.get('/', (req, res) => {
  res.send('Microservicio de notificaciones funcionando');
});

// Rutas para notificaciones
app.use('/api/notificaciones', notificacionesRoutes);

app.listen(PORT, () => {
  console.log(`Notificaciones service listening on port ${PORT}`);
});