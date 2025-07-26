const express = require('express');
const app = express();
const PORT = process.env.PORT || 3003;
const tareaRoutes = require('./routes/taskRoutes');

app.use(express.json()); 
app.use('/tareas', tareaRoutes);

app.get('/', (req, res) => {
  res.send('Microservicio de tareas funcionando');
});

app.listen(PORT, () => {
  console.log(`Tareas service listening on port ${PORT}`);
});