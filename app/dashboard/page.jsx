'use client';
import { useSession } from 'next-auth/react';
import PollCard from '../components/PollCard';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const pollImages = [
    { src: 'https://www.slido.com/static/slido-live-polling-hero.828ea0d3.1600.jpg', alt: 'Slido polling interface' },
    { src: 'https://www.surveylegend.com/wordpress/wp-content/uploads/2018/07/10-live-survey-tools.png', alt: 'Survey tools comparison' },
    { src: 'https://www.participoll.com/wp-content/uploads/2017/05/Conf-Guide-Infographic.png', alt: 'Conference polling infographic' },
    { src: 'https://connecteam.com/wp-content/uploads/2022/03/1578-hero-image-Surveys-Feature-page-Desktopx2-1024x717.jpg', alt: 'Mobile survey app' },
    { src: 'https://www.mypinio.com/wp-content/uploads/2023/01/Create-Live-Polls-easily-with-Free-Live-Survey-Tool.jpg', alt: 'Live poll creation' },
    { src: 'https://www.slido.com/static/slido-live-polling-use-case-feedback.bab38e10.1600.png', alt: 'Live polling feedback' },
    { src: 'https://www.cvent.com/sites/default/files/styles/tablet_landscape/public/image/2020-02/survey-poll-img_2.png?itok=kQ8P0o7k', alt: 'Event polling' },
    { src: 'https://blog.polling.com/wp-content/uploads/2024/11/Introduction-to-Live-Polling.png', alt: 'Live polling introduction' }
  ];

  const pollQuotes = [
    "The voice of the people is the voice of democracy.",
    "Every poll tells a story - what's yours?",
    "Opinions shape the world. Collect them wisely.",
    "A single question can reveal a thousand truths.",
    "Polling is the pulse of public perception."
  ];

  const pollHistory = [
    { year: "8th Century BC", fact: "First known straw polls conducted in Athens to gauge public opinion" },
    { year: "1960", fact: "First televised presidential debate uses instant polling for reaction analysis" },
    { year: "1824", fact: "First known presidential poll conducted by The Harrisburg Pennsylvanian newspaper" },
    { year: "2000", fact: "Online polling begins to gain mainstream acceptance" },
    { year: "1936", fact: "George Gallup correctly predicts FDR's win, revolutionizing scientific polling" },
    { year: "2020", fact: "Real-time polling becomes integral to virtual events during the pandemic" }
  ];

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/polls')
        .then(res => res.json())
        .then(data => {
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
      {/* Polling History */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Polling Through History</h2>
        {pollHistory.map((item, index) => (
          <div key={index} className="border-b border-gray-200 pb-4">
            <h3 className="font-bold">{item.year}</h3>
            <p>{item.fact}</p>
          </div>
        ))}
      </div>

      {/* Quote Section */}
      <div className="py-8">
        <p className="text-xl italic font-bold text-center">
          "{pollQuotes[Math.floor(Math.random() * pollQuotes.length)]}"
        </p>
      </div>

      {/* Image Carousel */}
      <div className="overflow-x-auto py-8">
        <div className="flex space-x-4">
          {pollImages.map((img, index) => (
            <div key={index} className="flex-shrink-0 w-64 h-48 relative">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover rounded"
                unoptimized={true}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Create Poll Button */}
      <div className="flex justify-end">
        <Link
          href="/polls/create"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
        >
          + Create Poll
        </Link>
      </div>

      {/* My Polls Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">My Polls</h2>
        
        {polls.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-gray-600">You haven't created any polls yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {polls.map(poll => (
              <div key={poll._id} className="scale-90 origin-left">
                <PollCard poll={poll} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}