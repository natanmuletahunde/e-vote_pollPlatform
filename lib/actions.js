import Poll from '@/models/Poll';
import dbConnect from '@/lib/dbConnect';

export async function getPolls() {
  await dbConnect();
  
  try {
    const polls = await Poll.find({})
      .populate('creator', 'name')
      .sort({ createdAt: -1 })
      .lean();
      
    return polls.map(poll => ({
      ...poll,
      _id: poll._id.toString(),
      creator: {
        ...poll.creator,
        _id: poll.creator._id.toString()
      },
      options: poll.options.map(opt => ({
        ...opt,
        _id: opt._id.toString()
      }))
    }));
  } catch (error) {
    console.error('Error fetching polls:', error);
    return [];
  }
}