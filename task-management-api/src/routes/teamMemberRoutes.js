const express = require('express');
const Joi = require('joi');

const { User } = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { validate } = require('../middleware/validate');
const { loadTeam, requireTeamMember, requireTeamCreator } = require('../middleware/teamAccess');

const router = express.Router({ mergeParams: true });

router.use(loadTeam);
router.use(requireTeamMember);

router.get('/', async (req, res, next) => {
  try {
    const team = await req.team.populate('members', 'email');
    res.json({
      teamId: team._id.toString(),
      members: team.members.map((m) => ({ id: m._id.toString(), email: m.email })),
    });
  } catch (err) {
    next(err);
  }
});

const addMemberSchema = Joi.object({
  body: Joi.object({
    userId: Joi.string().required(),
  }).required(),
  query: Joi.object().required(),
  params: Joi.object({ teamId: Joi.string().required() }).unknown(true).required(),
});

router.post('/', validate(addMemberSchema), requireTeamCreator, async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) throw new ApiError(404, 'User not found');

    const exists = req.team.members.some((m) => m.toString() === user._id.toString());
    if (!exists) {
      req.team.members.push(user._id);
      await req.team.save();
    }

    res.status(201).json({ message: 'Member added' });
  } catch (err) {
    next(err);
  }
});

const removeMemberSchema = Joi.object({
  body: Joi.object().optional(),
  query: Joi.object().required(),
  params: Joi.object({
    teamId: Joi.string().required(),
    userId: Joi.string().required(),
  }).required(),
});

router.delete('/:userId', validate(removeMemberSchema), requireTeamCreator, async (req, res, next) => {
  try {
    const userId = req.params.userId;

    if (userId === req.team.creator.toString()) {
      throw new ApiError(400, 'Cannot remove team creator');
    }

    req.team.members = req.team.members.filter((m) => m.toString() !== userId);
    await req.team.save();

    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = { teamMemberRoutes: router };
