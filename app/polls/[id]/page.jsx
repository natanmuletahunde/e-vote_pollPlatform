'use client';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ResultsChart from '@/components/ResultsChart';

export default function PollPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [demographicData, setDemographicData] = useState({
    age: '',
    gender: '',
  });
  const [hasVoted, setHasVoted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch(`/api/polls`);
        if (!response.ok) throw new Error('Failed to fetch poll');
        
        const polls = await response.json();
        const foundPoll = polls.find(p => p._id === id);
        
        if (!foundPoll) {
          throw new Error('Poll not found');
        }
        
        setPoll(foundPoll);
        
        // Check if user has already voted
        if (status === 'authenticated') {
          const voteCheck = await fetch(`/api/votes?pollId=${id}`);
          if (voteCheck.ok) {
            const voteData = await voteCheck.json();
            const userVoted = voteData.votes.some(v => v.user === session.user.id);
            setHasVoted(userVoted);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [id, status, session]);

  const handleVote = async () => {
    if (selectedOption === null) {
      setError('Please select an option');
      return;
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pollId: id,
          option: selectedOption,
          demographicData: {
            age: demographicData.age ? parseInt(demographicData.age) : undefined,
            gender: demographicData.gender || undefined,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit vote');
      }

      setHasVoted(true);
      setError('');
      // Refresh poll data
      const pollResponse = await fetch(`/api/polls`);
      const polls = await pollResponse.json();
      setPoll(polls.find(p => p._id === id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading poll...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!poll) return <div className="text-center py-8">Poll not found</div>;

  const isCreator = session?.user?.id === poll.creator._id.toString();

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{poll.question}</h1>
      <p className="text-gray-600 mb-6">
        Created by: {poll.creator.name} • {poll.isOpen ? 'Open' : 'Closed'}
      </p>
      
      {hasVoted || isCreator || !poll.isOpen ? (
        <ResultsChart pollId={id} isCreator={isCreator} />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-3 mb-6">
            {poll.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`option-${index}`}
                  name="pollOption"
                  checked={selectedOption === index}
                  onChange={() => setSelectedOption(index)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <label htmlFor={`option-${index}`} className="ml-3 block text-gray-700">
                  {option.text}
                </label>
              </div>
            ))}
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Optional Demographic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  min="13"
                  max="120"
                  value={demographicData.age}
                  onChange={(e) => setDemographicData({...demographicData, age: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  value={demographicData.gender}
                  onChange={(e) => setDemographicData({...demographicData, gender: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleVote}
            className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Submit Vote
          </button>
        </div>
      )}
    </div>
  );
}