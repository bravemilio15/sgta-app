const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3004;
const userRoutes = require('./routes/userRoutes');
const periodoAcademicoRoutes = require('./routes/periodoAcademicoRoutes');
const periodoAcademicoService = require('./services/periodoAcademicoService');

app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('Microservicio de usuarios funcionando');
});

app.use('/api/usuarios', userRoutes);
app.use('/api/periodos-academicos', periodoAcademicoRoutes);

// Iniciar el servicio de actualización automática de períodos académicos
// Se ejecutará cada hora por defecto
periodoAcademicoService.iniciarActualizacionAutomatica(60);

app.listen(PORT, () => {
  console.log(`Funcionando en: ${PORT}`);
  console.log('Servicio de actualización automática de períodos académicos iniciado');
});