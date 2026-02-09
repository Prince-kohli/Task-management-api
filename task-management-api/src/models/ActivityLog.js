const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null, index: true },
    action: { type: String, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    meta: { type: Object, default: {} },
    occurredAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

activityLogSchema.index({ team: 1, occurredAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = { ActivityLog };
