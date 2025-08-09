import PollCard from './components/PollCard';
import { getPolls } from '@/lib/actions';

export default async function Home() {
  const polls = await getPolls();

  return (
    <div className="min-h-[calc(100vh-8rem)]"> {/* Adjust height calculation */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Latest Polls</h1>
        
        {polls.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300 mb-4">No polls available yet.</p>
            <a
              href="/polls/create"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
            >
              Create First Poll
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8"> {/* Added bottom padding */}
            {polls.map(poll => (
              <PollCard key={poll._id} poll={poll} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}