const { Team } = require('../models/Team');
const { ApiError } = require('../utils/ApiError');

async function createTeam(req, res, next) {
  try {
    const team = await Team.create({
      name: req.body.name,
      creator: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json({
      id: team._id.toString(),
      name: team.name,
      creator: team.creator.toString(),
      membersCount: team.members.length,
    });
  } catch (err) {
    next(err);
  }
}

async function getTeam(req, res, next) {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) throw new ApiError(404, 'Team not found');

    const isMember = team.members.some((m) => m.toString() === req.user.id);
    if (!isMember) throw new ApiError(403, 'Forbidden');

    res.json({
      id: team._id.toString(),
      name: team.name,
      creator: team.creator.toString(),
      membersCount: team.members.length,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createTeam, getTeam };
