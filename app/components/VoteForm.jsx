'use client';
import { useState } from 'react';

export default function VoteForm({ pollId, options, onVoteSuccess }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleVote = async (e) => {
    e.preventDefault();
    if (!selectedOption) {
      setError('Please select an option');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pollId,
          option: selectedOption,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit vote');
      }

      onVoteSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleVote} className="space-y-4">
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                type="radio"
                id={`option-${index}`}
                name="pollOption"
                value={index}
                checked={selectedOption === index}
                onChange={() => setSelectedOption(index)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor={`option-${index}`}
                className="ml-3 block text-sm font-medium text-gray-700"
              >
                {option.text}
              </label>
            </div>
          ))}
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Vote'}
        </button>
      </form>
    </div>
  );
}