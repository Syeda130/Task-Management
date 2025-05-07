// src/models/Notification.js
import mongoose, { Schema, models, model } from 'mongoose';

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true },
  link: { type: String },
  read: { type: Boolean, default: false, index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

const Notification = models.Notification || model('Notification', NotificationSchema);
export default Notification;