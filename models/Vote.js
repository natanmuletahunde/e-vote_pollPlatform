import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const voteSchema = new Schema({
  poll: { 
    type: Schema.Types.ObjectId, 
    ref: 'Poll', 
    required: true,
    index: true 
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  option: { 
    type: Number, 
    required: true,
    min: 0
  },
  votedAt: { 
    type: Date, 
    default: Date.now 
  },
  demographicData: {
    age: { 
      type: Number, 
      min: 13, 
      max: 120 
    },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other', null] 
    }
  }
}, {
  timestamps: true
});

// Add compound index to prevent duplicate votes
voteSchema.index({ poll: 1, user: 1 }, { unique: true });

const Vote = mongoose.models.Vote || mongoose.model('Vote', voteSchema);

export default Vote;