// src/models/Task.js
import mongoose, { Schema, models, model } from 'mongoose';

const TaskSchema = new Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  description: { type: String, trim: true },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Under Review', 'Done'],
    default: 'To Do',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  dueDate: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

TaskSchema.index({ title: 'text', description: 'text' });
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ assignedTo: 1 });

const Task = models.Task || model('Task', TaskSchema);
export default Task;