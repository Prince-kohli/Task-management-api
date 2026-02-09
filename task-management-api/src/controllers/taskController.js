const { Task } = require('../models/Task');
const { User } = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { getCached, setCached, invalidateTeam } = require('../services/cacheService');
const { enqueueActivity } = require('../services/queueService');

async function listTasks(req, res, next) {
  try {
    const teamId = req.team._id.toString();
    const { page, limit, search, assignedTo, status, order } = req.query;

    const cacheQuery = { page, limit, search: search || '', assignedTo: assignedTo || '', status: status || '', order };
    const cached = await getCached(teamId, cacheQuery);
    if (cached) return res.json(cached);

    const filter = { team: req.team._id };
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const sort = { createdAt: order === 'asc' ? 1 : -1 };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Task.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'email'),
      Task.countDocuments(filter),
    ]);

    const response = {
      page,
      limit,
      total,
      items: items.map((t) => ({
        id: t._id.toString(),
        title: t.title,
        description: t.description,
        status: t.status,
        assignedTo: t.assignedTo ? { id: t.assignedTo._id.toString(), email: t.assignedTo.email } : null,
        comments: t.comments,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    };

    await setCached(teamId, cacheQuery, response);

    return res.json(response);
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    let assignedTo = null;
    if (req.body.assignedTo) {
      const user = await User.findById(req.body.assignedTo);
      if (!user) throw new ApiError(404, 'Assigned user not found');

      const isMember = req.team.members.some((m) => m.toString() === user._id.toString());
      if (!isMember) throw new ApiError(400, 'Assigned user must be a team member');
      assignedTo = user._id;
    }

    const task = await Task.create({
      team: req.team._id,
      title: req.body.title,
      description: req.body.description || '',
      assignedTo,
      status: 'TODO',
    });

    await invalidateTeam(req.team._id.toString());
    await enqueueActivity({ teamId: req.team._id, taskId: task._id, action: 'Created', actorId: req.user.id });

    res.status(201).json({ id: task._id.toString() });
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, team: req.team._id });
    if (!task) throw new ApiError(404, 'Task not found');

    if (typeof req.body.title !== 'undefined') task.title = req.body.title;
    if (typeof req.body.description !== 'undefined') task.description = req.body.description;

    await task.save();

    await invalidateTeam(req.team._id.toString());
    await enqueueActivity({ teamId: req.team._id, taskId: task._id, action: 'Updated', actorId: req.user.id });

    res.json({ message: 'Task updated' });
  } catch (err) {
    next(err);
  }
}

async function moveTask(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, team: req.team._id });
    if (!task) throw new ApiError(404, 'Task not found');

    task.status = req.body.status;
    await task.save();

    await invalidateTeam(req.team._id.toString());
    await enqueueActivity({
      teamId: req.team._id,
      taskId: task._id,
      action: 'Moved',
      actorId: req.user.id,
      meta: { status: task.status },
    });

    res.json({ message: 'Task moved' });
  } catch (err) {
    next(err);
  }
}

async function assignTask(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, team: req.team._id });
    if (!task) throw new ApiError(404, 'Task not found');

    let assignedTo = null;
    if (req.body.assignedTo) {
      const user = await User.findById(req.body.assignedTo);
      if (!user) throw new ApiError(404, 'Assigned user not found');

      const isMember = req.team.members.some((m) => m.toString() === user._id.toString());
      if (!isMember) throw new ApiError(400, 'Assigned user must be a team member');

      assignedTo = user._id;
    }

    task.assignedTo = assignedTo;
    await task.save();

    await invalidateTeam(req.team._id.toString());
    await enqueueActivity({
      teamId: req.team._id,
      taskId: task._id,
      action: 'Assigned',
      actorId: req.user.id,
      meta: { assignedTo: assignedTo ? assignedTo.toString() : null },
    });

    res.json({ message: 'Task assigned' });
  } catch (err) {
    next(err);
  }
}

async function commentOnTask(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, team: req.team._id });
    if (!task) throw new ApiError(404, 'Task not found');

    task.comments.push({ text: req.body.text, createdBy: req.user.id, createdAt: new Date() });
    await task.save();

    await invalidateTeam(req.team._id.toString());

    res.status(201).json({ message: 'Comment added' });
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.taskId, team: req.team._id });
    if (!task) throw new ApiError(404, 'Task not found');

    await invalidateTeam(req.team._id.toString());
    await enqueueActivity({ teamId: req.team._id, taskId: task._id, action: 'Deleted', actorId: req.user.id });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listTasks, createTask, updateTask, moveTask, assignTask, commentOnTask, deleteTask };
