require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { connectMongo } = require('./config/db');
const { startActivityCron } = require('./jobs/activityCron');
const { notFoundHandler } = require('./middleware/notFoundHandler');
const { errorHandler } = require('./middleware/errorHandler');
const { mountSwagger } = require('./config/swagger');
const { authRoutes } = require('./routes/authRoutes');
const { teamRoutes } = require('./routes/teamRoutes');

async function createServer() {
  await connectMongo();

  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  mountSwagger(app);

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/teams', teamRoutes);

  startActivityCron();

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createServer };
