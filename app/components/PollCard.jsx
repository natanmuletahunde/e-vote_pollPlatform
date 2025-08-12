'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function PollCard({ poll }) {
  const { data: session } = useSession();
  
  const creatorId = poll.creator?._id?.toString?.() || poll.creator?._id || '';
  const isCreator = session?.user?.id === creatorId;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{poll.question}</h3>
      <p className="text-gray-600 mb-4">
        {poll.options?.length || 0} options • {poll.isOpen ? 'Open' : 'Closed'}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Created by: {poll.creator?.name || 'Unknown'}
        </span>
        <Link
          href={`/polls/${poll._id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {isCreator ? 'View Results' : 'Vote Now'}
        </Link>
      </div>
    </div>
  );
}