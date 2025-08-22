require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();


const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : '*';
app.use(cors({ origin: allowedOrigins, credentials: true }));


app.use(express.json());


app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is missing in .env');
  process.exit(1);
}


mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });