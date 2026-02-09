const express = require('express');
const Joi = require('joi');

const { ActivityLog } = require('../models/ActivityLog');
const { validate } = require('../middleware/validate');
const { loadTeam, requireTeamMember } = require('../middleware/teamAccess');
const { activityLogsLimiter } = require('../middleware/rateLimiters');

const router = express.Router({ mergeParams: true });

router.use(loadTeam);
router.use(requireTeamMember);

const listSchema = Joi.object({
  body: Joi.object().optional(),
  params: Joi.object({ teamId: Joi.string().required() }).unknown(true).required(),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }).required(),
});

router.get('/', activityLogsLimiter, validate(listSchema), async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ActivityLog.find({ team: req.team._id })
        .sort({ occurredAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'email')
        .populate('task', 'title'),
      ActivityLog.countDocuments({ team: req.team._id }),
    ]);

    res.json({
      page,
      limit,
      total,
      items: items.map((a) => ({
        id: a._id.toString(),
        action: a.action,
        occurredAt: a.occurredAt,
        actor: a.actor ? { id: a.actor._id.toString(), email: a.actor.email } : null,
        task: a.task ? { id: a.task._id.toString(), title: a.task.title } : null,
        meta: a.meta,
      })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = { activityLogRoutes: router };
