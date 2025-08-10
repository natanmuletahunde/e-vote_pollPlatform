import { NextResponse } from 'next/server';
import Poll from '@/models/Poll';
import Vote from '@/models/Vote';
import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login to vote' }, 
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { pollId, option, demographicData } = await request.json();
    
    if (!pollId || option === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const poll = await Poll.findById(pollId);
    if (!poll || !poll.isOpen) {
      return NextResponse.json(
        { success: false, error: 'Poll not found or closed' },
        { status: 404 }
      );
    }
    
    const existingVote = await Vote.findOne({ 
      poll: pollId, 
      user: session.user.id 
    });
    
    if (existingVote) {
      return NextResponse.json(
        { success: false, error: 'You have already voted in this poll' },
        { status: 409 }
      );
    }
    
    const vote = new Vote({
      poll: pollId,
      user: session.user.id,
      option,
      demographicData: demographicData || undefined
    });
    
    poll.options[option].votes += 1;
    
    await Promise.all([vote.save(), poll.save()]);
    
    return NextResponse.json(
      { 
        success: true,
        vote: {
          id: vote._id,
          option: vote.option,
          createdAt: vote.votedAt
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Vote submission error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const pollId = searchParams.get('pollId');
    
    if (!pollId) {
      return NextResponse.json(
        { success: false, error: 'Poll ID required' },
        { status: 400 }
      );
    }
    
    const votes = await Vote.find({ poll: pollId })
      .populate('user', 'name email')
      .lean();
    
    const poll = await Poll.findById(pollId).lean();
    if (!poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }
    
    let demographics = null;
    if (votes.some(v => v.demographicData)) {
      const totalAge = votes.reduce((sum, v) => sum + (v.demographicData?.age || 0), 0);
      const ageDistribution = votes.reduce((acc, v) => {
        if (v.demographicData?.age) {
          const ageGroup = Math.floor(v.demographicData.age / 10) * 10;
          acc[ageGroup] = (acc[ageGroup] || 0) + 1;
        }
        return acc;
      }, {});

      const genderDistribution = votes.reduce((acc, v) => {
        if (v.demographicData?.gender) {
          acc[v.demographicData.gender] = (acc[v.demographicData.gender] || 0) + 1;
        }
        return acc;
      }, {});

      demographics = {
        age: {
          average: Math.round(totalAge / votes.length),
          distribution: ageDistribution
        },
        gender: genderDistribution
      };
    }
    
    return NextResponse.json({
      success: true,
      votes,
      poll,
      totalVotes: votes.length,
      demographics
    });
    
  } catch (error) {
    console.error('Votes fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}