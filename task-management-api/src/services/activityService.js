const { ActivityQueueItem } = require('../models/ActivityQueueItem');

async function enqueueActivity({ teamId, taskId, action, actorId, meta }) {
  const payload = {
    teamId,
    taskId: taskId || null,
    action,
    actorId,
    meta: meta || {},
    occurredAt: new Date().toISOString(),
  };

  // Redis queue logic removed for clean MongoDB-only implementation

  await ActivityQueueItem.create({
    team: teamId,
    task: taskId || null,
    action,
    actor: actorId,
    meta: meta || {},
    occurredAt: new Date(),
  });
}

module.exports = { enqueueActivity };
