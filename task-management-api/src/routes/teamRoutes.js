const express = require('express');
const Joi = require('joi');

const { validate } = require('../middleware/validate');
const { authRequired } = require('../middleware/authRequired');
const { createTeam, getTeam } = require('../controllers/teamController');

const { teamMemberRoutes } = require('./teamMemberRoutes');
const { taskRoutes } = require('./taskRoutes');
const { activityLogRoutes } = require('./activityLogRoutes');

const router = express.Router();

router.use(authRequired);

const createTeamSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
  }).required(),
  query: Joi.object().required(),
  params: Joi.object().required(),
});

router.post('/', validate(createTeamSchema), async (req, res, next) => {
  createTeam(req, res, next);
});

router.get('/:teamId', async (req, res, next) => {
  getTeam(req, res, next);
});

router.use('/:teamId/members', teamMemberRoutes);
router.use('/:teamId/tasks', taskRoutes);
router.use('/:teamId/activity-logs', activityLogRoutes);

module.exports = { teamRoutes: router };
