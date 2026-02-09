const express = require('express');
const Joi = require('joi');

const { validate } = require('../middleware/validate');
const { loginLimiter } = require('../middleware/rateLimiters');
const { register, login } = require('../controllers/authController');

const router = express.Router();

const registerSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }).required(),
  query: Joi.object().required(),
  params: Joi.object().required(),
});

router.post('/register', validate(registerSchema), async (req, res, next) => {
  register(req, res, next);
});

const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).required(),
  query: Joi.object().required(),
  params: Joi.object().required(),
});

router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  login(req, res, next);
});

module.exports = { authRoutes: router };
