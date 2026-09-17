const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bienvenido a los servicios de Cuchipu Cloud - Sistema En Línea');
});

app.get('/api/ping', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Cuchipu Cloud escuchando en puerto ${PORT}`);
});
