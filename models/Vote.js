import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const voteSchema = new Schema({
  poll: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  option: { type: Number, required: true },
  votedAt: { type: Date, default: Date.now },
  demographicData: {
    age: { type: Number, required: false },
    gender: { type: String, required: false },
  },
});

const Vote = mongoose.models.Vote || mongoose.model('Vote', voteSchema);

export default Vote;