const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;
const { app: firebaseApp } = require('../../firebase/firebase');

//prueba
app.get('/', (req, res) => {
  res.send('Microservicio de usuarios funcionando');
});

app.listen(PORT, () => {
  console.log(`Funcionando en: ${PORT}`);
});