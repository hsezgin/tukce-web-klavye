
const express = require('express');
const app = express();
const port = 3000;

// CORS desteği ekle
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static('.'));

app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on port ${port}`);
});
