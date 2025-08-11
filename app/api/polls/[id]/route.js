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
      _id: option._id?.toString()
    })) || [],
    createdAt: poll.createdAt?.toISOString(),
    updatedAt: poll.updatedAt?.toISOString(),
    closesAt: poll.closesAt?.toISOString(),
    isOpen: poll.isOpen ?? true
  };
};

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// GET single poll
export async function GET(request, { params }) {
  await dbConnect();
  
  try {
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

    const poll = await Poll.findById(id)
      .populate('creator', 'name')
      .lean();

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(serializePoll(poll));
  } catch (error) {
    console.error('Error fetching poll:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// UPDATE poll
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  await dbConnect();
  
  try {
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

    const poll = await Poll.findById(id);
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' }, 
        { status: 404 }
      );
    }

    if (poll.creator.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this poll' }, 
        { status: 403 }
      );
    }

    const { question, options, closesAt, isOpen } = await request.json();
    
    if (question?.trim()) poll.question = question.trim();
    if (options) {
      poll.options = options
        .filter(opt => typeof opt.text === 'string' && opt.text.trim())
        .slice(0, 10)
        .map(opt => ({ text: opt.text.trim() }));
    }
    if (closesAt) poll.closesAt = new Date(closesAt);
    if (typeof isOpen === 'boolean') poll.isOpen = isOpen;

    const updatedPoll = await poll.save();
    return NextResponse.json(serializePoll(updatedPoll));
  } catch (error) {
    console.error('Poll update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// DELETE poll
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  await dbConnect();
  
  try {
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

    const poll = await Poll.findById(id);
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' }, 
        { status: 404 }
      );
    }

    if (poll.creator.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this poll' }, 
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
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}