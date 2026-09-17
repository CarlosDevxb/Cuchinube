const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const sendPage = (page) => (req, res) => {
  res.sendFile(path.join(__dirname, 'public', page));
};

app.get('/', sendPage('index.html'));
app.get('/servicios', sendPage('servicios.html'));
app.get('/monitoreo', sendPage('monitoreo.html'));
app.get('/documentacion', sendPage('documentacion.html'));
app.get('/about', sendPage('about.html'));

app.get('/api/ping', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime().toFixed(2) + 's',
    region: 'us-east-1'
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    cpu: (Math.random() * 40 + 10).toFixed(1) + '%',
    memory: (Math.random() * 30 + 40).toFixed(1) + '%',
    requests: Math.floor(Math.random() * 5000 + 1000),
    errors: Math.floor(Math.random() * 5),
    latency: Math.floor(Math.random() * 20 + 5) + 'ms'
  });
});

app.get('/api/services', (req, res) => {
  res.json([
    { name: 'API Gateway', status: 'active', region: 'us-east-1', uptime: '99.99%' },
    { name: 'Base de Datos', status: 'active', region: 'us-east-1', uptime: '99.95%' },
    { name: 'Worker Pool', status: 'active', region: 'eu-west-1', uptime: '99.90%' },
    { name: 'Cache Layer', status: 'maintenance', region: 'ap-south-1', uptime: '98.50%' },
    { name: 'CDN Global', status: 'active', region: 'global', uptime: '99.98%' },
    { name: 'Auth Service', status: 'active', region: 'us-east-1', uptime: '99.97%' }
  ]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Cuchipu Cloud escuchando en puerto ${PORT}`);
});
