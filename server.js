
const express = require('express');
const app = express();
const port = 3000;

// CORS desteği ekle
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static(__dirname));
app.use('/test', express.static(__dirname + '/test'));

// Root endpoint için özel yanıt
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/popup.html');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on port ${port}`);
});
