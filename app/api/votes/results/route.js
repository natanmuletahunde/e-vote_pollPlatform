import { NextResponse } from 'next/server';
import Poll from '@/models/Poll';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET(request) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const pollId = searchParams.get('pollId');
    
    // Validate poll ID
    if (!pollId || !mongoose.Types.ObjectId.isValid(pollId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

    // Fetch poll with proper error handling
    const poll = await Poll.findById(pollId).lean();
    if (!poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Ensure options exist and are properly formatted
    const options = Array.isArray(poll.options) 
      ? poll.options.map(opt => ({
          text: opt.text || 'Unnamed option',
          votes: opt.votes || 0,
          _id: opt._id?.toString() || Math.random().toString()
        }))
      : [];

    // Calculate total votes and percentages
    const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);
    const optionsWithPercentages = options.map(opt => ({
      ...opt,
      percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0
    }));

    return NextResponse.json({
      success: true,
      poll: {
        _id: poll._id.toString(),
        question: poll.question || 'Untitled Poll',
        options: optionsWithPercentages,
        totalVotes,
        isOpen: poll.isOpen ?? true,
        closesAt: poll.closesAt?.toISOString() || null
      }
    });

  } catch (error) {
    console.error('Results fetch error:', error);
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