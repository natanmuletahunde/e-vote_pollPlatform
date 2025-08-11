'use client';
import { useEffect, useState, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ResultsChart({ pollId, isCreator = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false); // Default to false

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!pollId || typeof pollId !== 'string') {
        throw new Error('Invalid poll ID');
      }

      const existsRes = await fetch(`/api/polls/exists?id=${pollId}`);
      if (!existsRes.ok) throw new Error('Failed to check poll existence');
      
      const existsData = await existsRes.json();
      if (!existsData?.exists) {
        throw new Error('Poll not found');
      }

      const resultsRes = await fetch(`/api/votes/results?pollId=${pollId}`);
      if (!resultsRes.ok) {
        throw new Error(resultsRes.status === 404 
          ? 'Poll results not available' 
          : 'Failed to fetch results');
      }
      
      const result = await resultsRes.json();
      
      if (!result?.poll || !Array.isArray(result.poll.options)) {
        throw new Error('Invalid data format');
      }

      setData({
        ...result,
        poll: {
          ...result.poll,
          options: result.poll.options.map(opt => ({
            text: opt.text || 'Unnamed option',
            votes: typeof opt.votes === 'number' ? opt.votes : 0,
            percentage: typeof opt.percentage === 'number' ? opt.percentage : 0
          }))
        }
      });
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    fetchData();
    
    // Only set up interval if autoRefresh is EXPLICITLY enabled
    const interval = autoRefresh ? setInterval(fetchData, 5000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchData, autoRefresh]);

  // Prepare chart data directly (without useMemo)
  const backgroundColors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)'
  ];

  const chartData = data ? {
    labels: data.poll.options.map((opt, index) => `${opt.text} (${opt.percentage}%)`),
    datasets: [{
      label: 'Votes',
      data: data.poll.options.map(opt => opt.votes),
      backgroundColor: data.poll.options.map((_, index) => 
        backgroundColors[index % backgroundColors.length]
      ),
      borderColor: 'rgba(255, 255, 255, 0.8)',
      borderWidth: 1
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} votes`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading poll results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No data available for this poll</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{data.poll.question}</h2>
        {isCreator && (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span>Auto-refresh</span>
          </label>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md h-80">
        {chartData && <Pie data={chartData} options={chartOptions} />}
      </div>

      <div className="text-center py-2 font-medium">
        Total votes: <span className="text-blue-600">{data.poll.totalVotes || 0}</span>
      </div>
    </div>
  );
}