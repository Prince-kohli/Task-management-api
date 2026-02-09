const { ApiError } = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');
const { User } = require('../models/User');

async function authRequired(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const [type, token] = auth.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new ApiError(401, 'Unauthorized');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new ApiError(401, 'Unauthorized');
    }

    const user = await User.findById(decoded.userId);
    if (!user) throw new ApiError(401, 'Unauthorized');

    req.user = { id: user._id.toString(), email: user.email };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authRequired };
