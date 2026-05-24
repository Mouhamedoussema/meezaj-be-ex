require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const uploadRoutes = require('./routes/upload');

const app = express();

connectDB().catch((err) => {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
  })
);
app.use(express.json());

// Serve uploaded files — fall back to /tmp/uploads on read-only filesystems (e.g. serverless)
function resolveUploadDir() {
  const preferred = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), 'uploads');
  try {
    fs.mkdirSync(preferred, { recursive: true });
    return preferred;
  } catch {
    const fallback = path.join(require('os').tmpdir(), 'uploads');
    fs.mkdirSync(fallback, { recursive: true });
    console.warn(`Upload dir ${preferred} not writable, using ${fallback}`);
    return fallback;
  }
}
const uploadDir = resolveUploadDir();
app.use('/uploads', express.static(uploadDir));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
