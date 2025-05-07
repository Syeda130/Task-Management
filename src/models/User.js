// src/models/User.js
import mongoose, { Schema, models, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  name: { type: String, required: [true, 'Please provide a name'] },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    select: false, // Don't return password by default
  },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const user = await models.User.findById(this._id).select('+password').exec();
  if (!user || !user.password) {
      return false;
  }
  return bcrypt.compare(candidatePassword, user.password);
};

const User = models.User || model('User', UserSchema);
export default User;



