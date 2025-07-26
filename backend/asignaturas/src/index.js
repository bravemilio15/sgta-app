const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3005;
const asignaturaRoutes = require('./routes/asignaturaRoutes');

app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('Microservicio de asignaturas funcionando');
});

app.use('/api/asignaturas', asignaturaRoutes);

app.listen(PORT, () => {
  console.log(`Funcionando en: ${PORT}`);
}); 