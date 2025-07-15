const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Microservicio de notificaciones funcionando');
});

app.listen(PORT, () => {
  console.log(`Users service listening on port ${PORT}`);
});