const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;
const userRoutes = require('./routes/userRoutes');

app.use(express.json()); // Middleware para JSON

app.get('/', (req, res) => {
  res.send('Microservicio de usuarios funcionando');
});

// Rutas de usuario
app.use('/api/usuarios', userRoutes);

app.listen(PORT, () => {
  console.log(`Funcionando en: ${PORT}`);
});