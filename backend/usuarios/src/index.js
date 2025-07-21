const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3004;
const userRoutes = require('./routes/userRoutes');

app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('Microservicio de usuarios funcionando');
});


app.use('/api/usuarios', userRoutes);

app.listen(PORT, () => {
  console.log(`Funcionando en: ${PORT}`);
});