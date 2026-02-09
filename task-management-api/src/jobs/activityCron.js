const cron = require('node-cron');

const { ActivityQueueItem } = require('../models/ActivityQueueItem');
const { ActivityLog } = require('../models/ActivityLog');

async function processBatch(limit = 100) {
  const items = await ActivityQueueItem.find({ processedAt: null }).sort({ createdAt: 1 }).limit(limit);
  if (items.length === 0) return 0;

  const logs = items.map((i) => ({
    team: i.team,
    task: i.task,
    action: i.action,
    actor: i.actor,
    meta: i.meta,
    occurredAt: i.occurredAt,
  }));

  await ActivityLog.insertMany(logs);

  const ids = items.map((i) => i._id);
  await ActivityQueueItem.updateMany({ _id: { $in: ids } }, { $set: { processedAt: new Date() } });

  return items.length;
}

function startActivityCron() {
  if (process.env.REDIS_URL) return null;

  const task = cron.schedule('*/1 * * * *', async () => {
    try {
      await processBatch();
    } catch (err) {
      console.error('Activity cron failed', err);
    }
  });

  task.start();
  return task;
}

module.exports = { startActivityCron };
