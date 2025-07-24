import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AuthLayout from '../../layout/AuthLayout';
import ThreadItem from './ThreadItem';

// Dummy thread data (replace with your fetched Gmail threads)
const dummyThreads = [
  {
    id: 'thread-1',
    sender: 'John Doe <john@example.com>',
    subject: 'Project Update',
    snippet: 'Hi Naveen, just wanted to give you a quick update on the project...',
    time: '2:15 PM',
  },
  {
    id: 'thread-2',
    sender: 'Amazon <order-update@amazon.com>',
    subject: 'Your Order Has Shipped',
    snippet: 'Your order #123-4567890-1234567 has been shipped...',
    time: '11:40 AM',
  },
  {
    id: 'thread-3',
    sender: 'Slack',
    subject: 'You were mentioned in #general',
    snippet: 'Naveen mentioned you in #general: "Check the new design here..."',
    time: '9:05 AM',
  },
];

export default function ThreadsLists() {
  const { email } = useParams();
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    // Replace with your actual API call
    setThreads(dummyThreads);
  }, []);

  return (
   <AuthLayout>
         <h2 className="heading">All Emails Threads</h2>
         <p>Account : naveen@crossmilescarrier.com</p>

         <div className="space-y-3 pt-6">
            {threads.map((thread) => (
               <ThreadItem key={thread.id} thread={thread} />
            ))}
         </div>
   </AuthLayout>
  );
};

