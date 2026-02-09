const { User } = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { signToken } = require('../utils/jwt');

async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) throw new ApiError(400, 'Email already exists');

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ email: email.toLowerCase(), passwordHash });

    res.status(201).json({
      id: user._id.toString(),
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new ApiError(401, 'Invalid credentials');

    const ok = await user.verifyPassword(password);
    if (!ok) throw new ApiError(401, 'Invalid credentials');

    const token = signToken({ userId: user._id.toString() });
    res.json({ token });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
