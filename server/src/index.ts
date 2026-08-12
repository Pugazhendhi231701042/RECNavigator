import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { router as apiRouter } from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rec_wayfinder';

app.use(cors());
app.use(express.json());

// Attach DB flag to app local state
app.locals.dbConnected = false;

// Attempt MongoDB Connection with Graceful Fallback
mongoose.connect(MONGO_URI)
  .then(() => {
    app.locals.dbConnected = true;
    console.log(' Successfully connected to MongoDB:', MONGO_URI);
  })
  .catch((err) => {
    app.locals.dbConnected = false;
    console.log('ℹ️ MongoDB not available. Running in standalone fallback mode with verified REC campus dataset.');
  });

// API Routes
app.use('/api', apiRouter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'REC WayFinder API',
    database: app.locals.dbConnected ? 'MongoDB Connected' : 'In-Memory REC Dataset',
    timestamp: new Date(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 REC WayFinder Backend Server running on http://localhost:${PORT}`);
});
