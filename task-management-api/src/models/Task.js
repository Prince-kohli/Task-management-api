const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    status: { type: String, enum: ['TODO', 'DOING', 'DONE'], default: 'TODO', index: true },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

taskSchema.index({ team: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = { Task };
