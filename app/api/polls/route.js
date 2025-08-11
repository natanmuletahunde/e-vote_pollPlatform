import { NextResponse } from 'next/server';
import Poll from '@/models/Poll';
import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Enhanced serialization function
const serializePoll = (poll) => {
  if (!poll) return null;

  return {
    ...poll._doc,
    _id: poll._id?.toString(),
    creator: poll.creator ? {
      ...poll.creator._doc,
      _id: poll.creator._id?.toString(),
      name: poll.creator.name || 'Unknown'
    } : { _id: null, name: 'Unknown' },
    options: poll.options?.map(option => ({
      ...option._doc,
      _id: option._id?.toString()
    })) || [],
    createdAt: poll.createdAt?.toISOString(),
    updatedAt: poll.updatedAt?.toISOString(),
    closesAt: poll.closesAt?.toISOString(),
    isOpen: poll.isOpen ?? true
  };
};

// GET all polls
export async function GET(request) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    const [polls, total] = await Promise.all([
      Poll.find({})
        .populate('creator', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Poll.countDocuments()
    ]);
    
    const serializedPolls = polls.map(poll => serializePoll(poll));
    return NextResponse.json({
      polls: serializedPolls,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// CREATE a new poll
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  await dbConnect();
  
  try {
    const { question, options, closesAt, type } = await request.json();
    
    // Validate input
    if (!question?.trim() || question.trim().length < 5) {
      return NextResponse.json(
        { error: 'Question must be at least 5 characters' }, 
        { status: 400 }
      );
    }
    
    const validOptions = options
      ?.filter(opt => typeof opt === 'string' && opt.trim())
      ?.slice(0, 10); // Limit to 10 options
      
    if (!validOptions || validOptions.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 valid options are required' }, 
        { status: 400 }
      );
    }
    
    // Create and save poll
    const poll = new Poll({
      question: question.trim(),
      options: validOptions.map(text => ({ text })),
      creator: session.user.id,
      closesAt: closesAt ? new Date(closesAt) : null,
      type: type === 'open-ended' ? 'open-ended' : 'multiple-choice',
      isOpen: true
    });
    
    const savedPoll = await poll.save();
    return NextResponse.json(serializePoll(savedPoll), { 
      status: 201 
    });
  } catch (error) {
    console.error('Poll creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}