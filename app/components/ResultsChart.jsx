'use client';
import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ResultsChart({ pollId, isCreator }) {
  const [pollData, setPollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState('pie');

  useEffect(() => {
    const fetchPollResults = async () => {
      try {
        const response = await fetch(`/api/votes?pollId=${pollId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch poll results');
        }
        const data = await response.json();
        setPollData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPollResults();

    // Set up polling for real-time updates if poll is open
    const interval = setInterval(fetchPollResults, 3000);
    return () => clearInterval(interval);
  }, [pollId]);

  if (loading) return <div className="text-center py-8">Loading results...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!pollData) return <div className="text-center py-8">No data available</div>;

  const { poll, votes, demographics } = pollData;

  const chartData = {
    labels: poll.options.map(opt => opt.text),
    datasets: [
      {
        label: 'Votes',
        data: poll.options.map(opt => opt.votes),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const ageData = demographics?.age?.distribution && {
    labels: Object.keys(demographics.age.distribution).map(age => `${age}-${parseInt(age)+9}`),
    datasets: [
      {
        label: 'Voters by Age Group',
        data: Object.values(demographics.age.distribution),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      },
    ],
  };

  const genderData = demographics?.gender && {
    labels: Object.keys(demographics.gender).map(g => g.charAt(0).toUpperCase() + g.slice(1)),
    datasets: [
      {
        label: 'Voters by Gender',
        data: Object.values(demographics.gender),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
        ],
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Poll Results</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded ${chartType === 'pie' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            Pie
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded ${chartType === 'bar' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            Bar
          </button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        {chartType === 'pie' ? (
          <Pie data={chartData} />
        ) : (
          <Bar data={chartData} options={{ indexAxis: 'y' }} />
        )}
      </div>
      
      <div className="text-center text-gray-600">
        Total votes: {votes}
      </div>
      
      {isCreator && demographics && (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold">Demographics</h4>
          
          {demographics.age && (
            <div>
              <h5 className="font-medium mb-2">Age Distribution</h5>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="mb-2">Average age: {Math.round(demographics.age.average)}</p>
                {ageData && <Bar data={ageData} />}
              </div>
            </div>
          )}
          
          {demographics.gender && (
            <div>
              <h5 className="font-medium mb-2">Gender Distribution</h5>
              <div className="bg-white p-4 rounded-lg shadow">
                {genderData && <Pie data={genderData} />}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}