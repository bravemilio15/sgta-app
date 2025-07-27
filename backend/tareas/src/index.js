const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tareas', taskRoutes);

app.get('/', (req, res) => {
  res.send('Microservicio de tareas funcionando correctamente');
});

app.listen(PORT, () => {
  console.log(`Servicio de tareas corriendo en puerto ${PORT}`);
});