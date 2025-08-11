import { NextResponse } from 'next/server';
import Poll from '@/models/Poll';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET(request) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { exists: false },
        { status: 200 }
      );
    }

    const exists = await Poll.exists({ _id: id });
    return NextResponse.json(
      { exists: !!exists },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking poll existence:', error);
    return NextResponse.json(
      { exists: false },
      { status: 200 }
    );
  }
}