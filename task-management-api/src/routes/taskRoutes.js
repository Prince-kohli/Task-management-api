const express = require('express');
const Joi = require('joi');

const { validate } = require('../middleware/validate');
const { loadTeam, requireTeamMember } = require('../middleware/teamAccess');
const {
  listTasks,
  createTask,
  updateTask,
  moveTask,
  assignTask,
  commentOnTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router({ mergeParams: true });

router.use(loadTeam);
router.use(requireTeamMember);

const listSchema = Joi.object({
  body: Joi.object().optional(),
  params: Joi.object({ teamId: Joi.string().required() }).unknown(true).required(),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow('').optional(),
    assignedTo: Joi.string().optional(),
    status: Joi.string().valid('TODO', 'DOING', 'DONE').optional(),
    sort: Joi.string().valid('createdAt').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }).required(),
});

router.get('/', validate(listSchema), async (req, res, next) => {
  listTasks(req, res, next);
});

const createSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().allow('').optional(),
    assignedTo: Joi.string().optional(),
  }).required(),
  query: Joi.object().required(),
  params: Joi.object({ teamId: Joi.string().required() }).unknown(true).required(),
});

router.post('/', validate(createSchema), async (req, res, next) => {
  createTask(req, res, next);
});

const updateSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().allow('').optional(),
  }).required(),
  query: Joi.object().required(),
  params: Joi.object({ teamId: Joi.string().required(), taskId: Joi.string().required() }).required(),
});

router.patch('/:taskId', validate(updateSchema), async (req, res, next) => {
  updateTask(req, res, next);
});

const moveSchema = Joi.object({
  body: Joi.object({
    status: Joi.string().valid('TODO', 'DOING', 'DONE').required(),
  }).required(),
  query: Joi.object().required(),
  params: Joi.object({ teamId: Joi.string().required(), taskId: Joi.string().required() }).required(),
});

router.post('/:taskId/move', validate(moveSchema), async (req, res, next) => {
  moveTask(req, res, next);
});

const assignSchema = Joi.object({
  body: Joi.object({
    assignedTo: Joi.string().allow(null).required(),
  }).required(),
  query: Joi.object().required(),
  params: Joi.object({ teamId: Joi.string().required(), taskId: Joi.string().required() }).required(),
});

router.post('/:taskId/assign', validate(assignSchema), async (req, res, next) => {
  assignTask(req, res, next);
});

const commentSchema = Joi.object({
  body: Joi.object({
    text: Joi.string().min(1).max(2000).required(),
  }).required(),
  query: Joi.object().required(),
  params: Joi.object({ teamId: Joi.string().required(), taskId: Joi.string().required() }).required(),
});

router.post('/:taskId/comments', validate(commentSchema), async (req, res, next) => {
  commentOnTask(req, res, next);
});

const deleteSchema = Joi.object({
  body: Joi.object().optional(),
  query: Joi.object().required(),
  params: Joi.object({ teamId: Joi.string().required(), taskId: Joi.string().required() }).required(),
});

router.delete('/:taskId', validate(deleteSchema), async (req, res, next) => {
  deleteTask(req, res, next);
});

module.exports = { taskRoutes: router };
