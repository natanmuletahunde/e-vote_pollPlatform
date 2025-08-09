import Poll from '@/models/Poll';
import dbConnect from '@/lib/dbConnect';

export async function getPolls() {
  await dbConnect();
  
  try {
    const polls = await Poll.find({ isOpen: true })
      .populate('creator', 'name')
      .sort({ createdAt: -1 })
      .lean();
      
    return polls.map(poll => ({
      ...poll,
      _id: poll._id.toString(),
      creator: {
        ...poll.creator,
        _id: poll.creator._id.toString()
      }
    }));
  } catch (error) {
    console.error('Failed to fetch polls:', error);
    return [];
  }
}