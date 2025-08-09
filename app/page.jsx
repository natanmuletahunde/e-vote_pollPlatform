import PollCard from '@/components/PollCard';
import { getPolls } from '@/lib/actions';

export default async function Home() {
  const polls = await getPolls();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Latest Polls</h1>
      
      {polls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No polls available yet.</p>
          <a
            href="/polls/create"
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Create First Poll
          </a>
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