import { NextResponse } from 'next/server';
import Poll from '@/models/Poll';
import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET all open polls
export async function GET(request) {
  await dbConnect();
  
  try {
    const polls = await Poll.find({ isOpen: true })
      .populate('creator', 'name')
      .sort({ createdAt: -1 })
      .lean();
      
    return NextResponse.json(polls);
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
      { error: 'Unauthorized - Please login to create a poll' }, 
      { status: 401 }
    );
  }

  await dbConnect();
  
  try {
    const { question, options, closesAt, type } = await request.json();
    
    // Validate input
    if (!question || typeof question !== 'string' || question.trim().length < 5) {
      return NextResponse.json(
        { error: 'Question must be at least 5 characters' }, 
        { status: 400 }
      );
    }
    
    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options are required' }, 
        { status: 400 }
      );
    }
    
    // Filter and validate options
    const validOptions = options
      .map(opt => (typeof opt === 'string' ? opt.trim() : ''))
      .filter(opt => opt.length > 0);
      
    if (validOptions.length < 2) {
      return NextResponse.json(
        { error: 'Options must have text content' }, 
        { status: 400 }
      );
    }
    
    // Validate close date if provided
    let validClosesAt = null;
    if (closesAt) {
      const date = new Date(closesAt);
      if (isNaN(date.getTime())) {  // Fixed this line
        return NextResponse.json(
          { error: 'Invalid close date format' }, 
          { status: 400 }
        );
      }
      validClosesAt = date;
    }
    
    // Create and save poll
    const poll = new Poll({
      question: question.trim(),
      options: validOptions.map(text => ({ text })),
      creator: session.user.id,
      closesAt: validClosesAt,
      type: type === 'open-ended' ? 'open-ended' : 'multiple-choice'
    });
    
    await poll.save();
    
    return NextResponse.json(poll, { status: 201 });
  } catch (error) {
    console.error('Poll creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}