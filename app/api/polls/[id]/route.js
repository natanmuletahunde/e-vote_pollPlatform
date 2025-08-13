import { NextResponse } from 'next/server';
import Poll from '@/models/Poll';
import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import mongoose from 'mongoose';

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
      _id: option._id?.toString(),
      votes: option.votes || 0
    })) || [],
    createdAt: poll.createdAt?.toISOString(),
    updatedAt: poll.updatedAt?.toISOString(),
    closesAt: poll.closesAt?.toISOString(),
    isOpen: poll.isOpen ?? true,
    totalVotes: poll.totalVotes || 0
  };
};

export async function GET(request, { params }) {
  await dbConnect();
  
  try {
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

    const poll = await Poll.findById(id)
      .populate('creator', 'name')
      .lean();

    if (!poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      poll: serializePoll(poll)
    });
  } catch (error) {
    console.error('Error fetching poll:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  await dbConnect();
  
  try {
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

    const poll = await Poll.findById(id);
    if (!poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' }, 
        { status: 404 }
      );
    }

    if (poll.creator.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this poll' }, 
        { status: 403 }
      );
    }

    const { question, options, closesAt, isOpen } = await request.json();
    
    if (question?.trim()) poll.question = question.trim();
    if (options) {
      poll.options = options
        .filter(opt => typeof opt.text === 'string' && opt.text.trim())
        .slice(0, 10)
        .map(opt => ({ 
          text: opt.text.trim(),
          votes: opt.votes || 0
        }));
    }
    if (closesAt) poll.closesAt = new Date(closesAt);
    if (typeof isOpen === 'boolean') poll.isOpen = isOpen;

    const updatedPoll = await poll.save();
    return NextResponse.json({
      success: true,
      poll: serializePoll(updatedPoll)
    });
  } catch (error) {
    console.error('Poll update error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  await dbConnect();
  
  try {
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

    const poll = await Poll.findById(id);
    if (!poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' }, 
        { status: 404 }
      );
    }

    if (poll.creator.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this poll' }, 
        { status: 403 }
      );
    }

    await poll.deleteOne();
    return NextResponse.json(
      { success: true, message: 'Poll deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Poll deletion error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}