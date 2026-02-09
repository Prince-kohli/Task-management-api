const { Team } = require('../models/Team');
const { ApiError } = require('../utils/ApiError');

async function loadTeam(req, res, next) {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) throw new ApiError(404, 'Team not found');
    req.team = team;
    next();
  } catch (err) {
    next(err);
  }
}

function requireTeamMember(req, res, next) {
  try {
    const isMember = req.team.members.some((m) => m.toString() === req.user.id);
    if (!isMember) throw new ApiError(403, 'Forbidden');
    next();
  } catch (err) {
    next(err);
  }
}

function requireTeamCreator(req, res, next) {
  try {
    if (req.team.creator.toString() !== req.user.id) throw new ApiError(403, 'Forbidden');
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { loadTeam, requireTeamMember, requireTeamCreator };
