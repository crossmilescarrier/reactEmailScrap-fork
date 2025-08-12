import React from 'react'
import AuthLayout from '../layout/AuthLayout'

// Mocked email data for demonstration
const mockEmails = [
  {
    id: 1,
    subject: "Project Status Update - Q4 2024",
    from: "john.doe@company.com",
    to: "team@company.com",
    date: "2024-01-15T10:30:00Z",
    snippet: "Here's the latest update on our Q4 project milestones...",
    isRead: false,
    isImportant: true,
    labels: ["Work", "Projects"]
  },
  {
    id: 2,
    subject: "Your Order #12345 Has Been Shipped",
    from: "orders@ecommerce.com",
    to: "customer@email.com",
    date: "2024-01-14T15:45:00Z",
    snippet: "Your recent order has been processed and shipped. Tracking number: ABC123456...",
    isRead: true,
    isImportant: false,
    labels: ["Shopping", "Orders"]
  },
  {
    id: 3,
    subject: "Meeting Reminder: Team Standup Tomorrow",
    from: "calendar@company.com",
    to: "team@company.com",
    date: "2024-01-13T09:15:00Z",
    snippet: "Don't forget about our weekly team standup meeting scheduled for tomorrow at 9 AM...",
    isRead: false,
    isImportant: false,
    labels: ["Meetings", "Work"]
  },
  {
    id: 4,
    subject: "Security Alert: New Login Detected",
    from: "security@platform.com",
    to: "user@email.com",
    date: "2024-01-12T18:20:00Z",
    snippet: "We detected a new login to your account from a new device. If this wasn't you...",
    isRead: true,
    isImportant: true,
    labels: ["Security", "Alerts"]
  },
  {
    id: 5,
    subject: "Newsletter: Latest Tech Trends",
    from: "newsletter@techblog.com",
    to: "subscriber@email.com",
    date: "2024-01-11T12:00:00Z",
    snippet: "This week's edition covers AI developments, cloud computing trends, and more...",
    isRead: false,
    isImportant: false,
    labels: ["Newsletter", "Tech"]
  }
];

export default function Emails() {     
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AuthLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading">All Emails</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Refresh
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Compose
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-700">
          {mockEmails.map((email, index) => (
            <div 
              key={email.id} 
              className={`p-4 hover:bg-gray-750 transition-colors cursor-pointer ${
                !email.isRead ? 'bg-gray-750' : ''
              }`}
            > 
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {!email.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      {email.isImportant && (
                        <span className="text-yellow-500 text-sm">⭐</span>
                      )}
                    </div>
                    <span className="text-gray-400 text-sm truncate max-w-xs">
                      {email.from}
                    </span>
                  </div>
                  
                  <h3 className={`text-lg mb-1 sm:line-clamp-2 ${
                    !email.isRead ? 'font-bold text-white' : 'font-normal text-gray-200'
                  }`}>
                    {email.subject}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-3 sm:line-clamp-2">
                    {email.snippet}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    {email.labels.map((label, labelIndex) => (
                      <span 
                        key={labelIndex}
                        className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <span className="text-gray-400 text-sm">
                    {formatDate(email.date)}
                  </span>
                  <div className="mt-2">
                    <button className="text-gray-500 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 gap-4">
        <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        <span className="text-gray-400">Page 1 of 5</span>
        <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
          Next
        </button>
      </div>
    </AuthLayout>
  );
}
