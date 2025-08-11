import { NextResponse } from 'next/server';
import Poll from '@/models/Poll';
import Vote from '@/models/Vote';
import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Please login to vote' }, 
      { status: 401 }
    );
  }

  await dbConnect();
  
  try {
    const { pollId, option, demographicData } = await request.json();
    
    // Validate input
    if (!pollId || !mongoose.Types.ObjectId.isValid(pollId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid poll ID' },
        { status: 400 }
      );
    }
    
    if (option === undefined || option === null) {
      return NextResponse.json(
        { success: false, error: 'Option selection required' },
        { status: 400 }
      );
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }
    
    if (!poll.isOpen) {
      return NextResponse.json(
        { success: false, error: 'This poll is closed for voting' },
        { status: 403 }
      );
    }
    
    // Validate option index
    if (option < 0 || option >= poll.options.length) {
      return NextResponse.json(
        { success: false, error: 'Invalid option selected' },
        { status: 400 }
      );
    }
    
    // Check for existing vote
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
    
    // Create new vote
    const vote = new Vote({
      poll: pollId,
      user: session.user.id,
      option,
      demographicData: demographicData || undefined,
      votedAt: new Date()
    });
    
    // Update poll vote count
    poll.options[option].votes += 1;
    poll.totalVotes = (poll.totalVotes || 0) + 1;
    
    // Save both in transaction
    await Promise.all([vote.save(), poll.save()]);
    
    return NextResponse.json(
      { 
        success: true,
        vote: {
          id: vote._id.toString(),
          option: vote.option,
          createdAt: vote.votedAt.toISOString()
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
    
    // Validate pollId
    if (!pollId || !mongoose.Types.ObjectId.isValid(pollId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid poll ID' },
        { status: 400 }
      );
    }
    
    // Check if poll exists
    const poll = await Poll.findById(pollId).lean();
    if (!poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }
    
    // Get votes with user info
    const votes = await Vote.find({ poll: pollId })
      .populate('user', 'name email')
      .lean();
    
    // Calculate statistics
    const optionStats = poll.options.map((opt, index) => ({
      text: opt.text,
      votes: opt.votes,
      percentage: poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0
    }));
    
    // Calculate demographics if available
    let demographics = null;
    const votesWithDemographics = votes.filter(v => v.demographicData);
    
    if (votesWithDemographics.length > 0) {
      // Age statistics
      const totalAge = votesWithDemographics.reduce((sum, v) => sum + (v.demographicData?.age || 0), 0);
      const ageDistribution = votesWithDemographics.reduce((acc, v) => {
        if (v.demographicData?.age) {
          const ageGroup = `${Math.floor(v.demographicData.age / 10) * 10}s`;
          acc[ageGroup] = (acc[ageGroup] || 0) + 1;
        }
        return acc;
      }, {});

      // Gender statistics
      const genderDistribution = votesWithDemographics.reduce((acc, v) => {
        if (v.demographicData?.gender) {
          const gender = v.demographicData.gender.toLowerCase();
          acc[gender] = (acc[gender] || 0) + 1;
        }
        return acc;
      }, {});

      // Location statistics
      const locationDistribution = votesWithDemographics.reduce((acc, v) => {
        if (v.demographicData?.location) {
          const location = v.demographicData.location;
          acc[location] = (acc[location] || 0) + 1;
        }
        return acc;
      }, {});

      demographics = {
        age: {
          average: votesWithDemographics.length > 0 
            ? Math.round(totalAge / votesWithDemographics.length)
            : 0,
          distribution: ageDistribution
        },
        gender: genderDistribution,
        location: locationDistribution,
        totalWithDemographics: votesWithDemographics.length
      };
    }
    
    return NextResponse.json({
      success: true,
      poll: {
        ...poll,
        _id: poll._id.toString(),
        options: optionStats
      },
      totalVotes: poll.totalVotes || 0,
      demographics,
      votes: votes.map(vote => ({
        ...vote,
        _id: vote._id.toString(),
        user: vote.user ? {
          ...vote.user,
          _id: vote.user._id.toString()
        } : null
      }))
    });
    
  } catch (error) {
    console.error('Votes fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}