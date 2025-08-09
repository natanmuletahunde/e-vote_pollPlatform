import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['creator', 'voter'], default: 'voter' },
  age: { type: Number, required: false },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'], required: false },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;