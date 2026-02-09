const mongoose = require('mongoose');

const activityQueueItemSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null, index: true },
    action: { type: String, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    meta: { type: Object, default: {} },
    occurredAt: { type: Date, required: true },
    processedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

activityQueueItemSchema.index({ processedAt: 1, createdAt: 1 });

const ActivityQueueItem = mongoose.model('ActivityQueueItem', activityQueueItemSchema);

module.exports = { ActivityQueueItem };
