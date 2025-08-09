'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function PollCard({ poll }) {
  const { data: session } = useSession();
  const isCreator = session?.user?.id === poll.creator._id.toString();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{poll.question}</h3>
      <p className="text-gray-600 mb-4">
        {poll.options.length} options • {poll.isOpen ? 'Open' : 'Closed'}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Created by: {poll.creator.name}
        </span>
        <Link
          href={`/polls/${poll._id}`}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
        >
          {isCreator ? 'View Results' : 'Vote Now'}
        </Link>
      </div>
    </div>
  );
}