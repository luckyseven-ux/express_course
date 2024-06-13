import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import userRoutes from './src/routes/userRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import { testDatabaseConnection } from './src/database/connection.js';



dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Ratelimit untuk menangani serangan DDOS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware untuk mem-parsing JSON pada body permintaan
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(limiter);

// Middleware untuk mengelola sesi
app.use(session({
  secret: process.env.SESSION_SECRET || 'some secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 300000 },
}));

// Middleware untuk logging
app.use((req, res, next) => {
  console.log(`${req.method} - ${req.url}`);
  next();
});

// Routes tanpa caching
app.use('/category', categoryRoutes);
app.use('/user', userRoutes);
app.use('/auth', authRoutes);


// Menguji koneksi ke database
testDatabaseConnection().catch(err => {
  console.error('Error connecting to the database:', err);
  process.exit(1);
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Berhasil! Server berjalan pada port: ${port}`);
});
