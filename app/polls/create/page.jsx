'use client';
import { useSession } from 'next-auth/react';
import PollForm from '../../components/PollForm';
import { useRouter } from 'next/navigation';

export default function CreatePollPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="py-8">
      <PollForm />
    </div>
  );
}