import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const pollSchema = new Schema({
  question: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      votes: { type: Number, default: 0 },
    },
  ],
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isOpen: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  closesAt: { type: Date, required: false },
  type: { type: String, enum: ['multiple-choice', 'open-ended'], default: 'multiple-choice' },
});

const Poll = mongoose.models.Poll || mongoose.model('Poll', pollSchema);

export default Poll;