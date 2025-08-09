import { NextResponse } from 'next/server';
import Poll from '@/models/Poll';
import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET all polls
export async function GET(request) {
  await dbConnect();
  
  try {
    const polls = await Poll.find({ isOpen: true }).populate('creator', 'name');
    return NextResponse.json(polls);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// CREATE a new poll
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  
  try {
    const { question, options, closesAt, type } = await request.json();
    
    if (!question || !options || options.length < 2) {
      return NextResponse.json({ error: 'Invalid poll data' }, { status: 400 });
    }
    
    const poll = new Poll({
      question,
      options: options.map(opt => ({ text: opt })),
      creator: session.user.id,
      closesAt: closesAt ? new Date(closesAt) : null,
      type: type || 'multiple-choice'
    });
    
    await poll.save();
    return NextResponse.json(poll);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}