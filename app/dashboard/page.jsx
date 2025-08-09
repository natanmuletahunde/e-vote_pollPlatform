'use client';
import { useSession } from 'next-auth/react';
import PollCard from '../components/PollCard';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/polls')
        .then(res => res.json())
        .then(data => {
          // Filter polls created by the current user
          const userPolls = data.filter(poll => poll.creator._id === session.user.id);
          setPolls(userPolls);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch polls:', err);
          setLoading(false);
        });
    }
  }, [status, session]);

  if (status === 'loading' || loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="text-center py-8">Please login to view your dashboard</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Polls</h1>
        <Link
          href="/polls/create"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Create New Poll
        </Link>
      </div>
      
      {polls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't created any polls yet.</p>
          <Link
            href="/polls/create"
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Create Your First Poll
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map(poll => (
            <PollCard key={poll._id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}