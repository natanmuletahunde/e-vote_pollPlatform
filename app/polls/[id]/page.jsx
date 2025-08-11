'use client';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ResultsChart from '../../components/ResultsChart';

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
        setLoading(true);
        setError('');
        
        const response = await fetch(`/api/polls/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch poll');
        }
        
        const pollData = await response.json();
        
        // Data should already be serialized from API, but we'll double-check
        const finalPoll = {
          ...pollData,
          _id: String(pollData._id),
          creator: {
            ...pollData.creator,
            _id: String(pollData.creator._id)
          },
          options: pollData.options.map(option => ({
            ...option,
            _id: String(option._id)
          }))
        };

        setPoll(finalPoll);
        
        if (status === 'authenticated') {
          const voteCheck = await fetch(`/api/votes/check?pollId=${id}&userId=${session.user.id}`);
          if (voteCheck.ok) {
            const voteData = await voteCheck.json();
            setHasVoted(voteData.hasVoted);
          }
        }
      } catch (err) {
        setError(err.message);
        setPoll(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [id, status, session?.user?.id]);

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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit vote');
      }

      setHasVoted(true);
      setError('');
      
      // Refresh poll data
      const pollResponse = await fetch(`/api/polls/${id}`);
      const updatedPoll = await pollResponse.json();
      
      setPoll({
        ...updatedPoll,
        _id: String(updatedPoll._id),
        creator: {
          ...updatedPoll.creator,
          _id: String(updatedPoll.creator._id)
        },
        options: updatedPoll.options.map(option => ({
          ...option,
          _id: String(option._id)
        }))
      });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading poll data...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-12">
      <div className="text-red-500 text-xl mb-4">Error</div>
      <p className="text-gray-700 mb-4">{error}</p>
      <button 
        onClick={() => router.push('/')}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
      >
        Back to Home
      </button>
    </div>
  );

  if (!poll) return (
    <div className="text-center py-12">
      <p className="text-gray-600 mb-4">Poll not found</p>
      <button 
        onClick={() => router.push('/')}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
      >
        Back to Home
      </button>
    </div>
  );

  const isCreator = session?.user?.id === poll.creator._id;

  return (
    <div className="py-8 max-w-4xl mx-auto px-4">
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
              <div key={option._id} className="flex items-center">
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