import { NextResponse } from 'next/server';
import Poll from '@/models/Poll';
import Vote from '@/models/Vote';
import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// SUBMIT a vote
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  
  try {
    const { pollId, option, demographicData } = await request.json();
    
    // Check if poll exists and is open
    const poll = await Poll.findById(pollId);
    if (!poll || !poll.isOpen) {
      return NextResponse.json({ error: 'Poll not found or closed' }, { status: 404 });
    }
    
    // Check if user already voted
    const existingVote = await Vote.findOne({ poll: pollId, user: session.user.id });
    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted in this poll' }, { status: 400 });
    }
    
    // Record the vote
    const vote = new Vote({
      poll: pollId,
      user: session.user.id,
      option,
      demographicData
    });
    
    // Update poll counts
    poll.options[option].votes += 1;
    
    await Promise.all([vote.save(), poll.save()]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET poll results

// GET poll results
export async function GET(request) {
    await dbConnect();
    
    try {
      const { searchParams } = new URL(request.url);
      const pollId = searchParams.get('pollId');
      
      if (!pollId) {
        return NextResponse.json({ error: 'Poll ID required' }, { status: 400 });
      }
      
      // Get votes for this poll and populate user data
      const votes = await Vote.find({ poll: pollId })
        .populate('user', 'name email')
        .lean();
      
      // Get poll data
      const poll = await Poll.findById(pollId).lean();
      if (!poll) {
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
      }
      
      // Calculate demographics if available
      let demographics = null;
      if (votes.some(v => v.demographicData)) {
        // ... keep your existing demographics calculation code ...
      }
      
      // Return simplified response
      return NextResponse.json({
        success: true,
        votes,  // Direct array of votes
        poll,
        totalVotes: votes.length,
        demographics
      });
      
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }