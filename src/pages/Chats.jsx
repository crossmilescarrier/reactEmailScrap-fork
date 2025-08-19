import React, { useState, useEffect } from 'react'
import AuthLayout from '../layout/AuthLayout'
import Loading, { ButtonLoader, useLoadingStates } from '../components/Loading'

// Mocked chat data for demonstration
const mockChats = [
  {
    spaceId: 'chat-1',
    displayName: 'Project Alpha Team',
    lastActivity: '2024-01-15T14:30:00Z',
    participantCount: 5,
    unreadCount: 3,
    messages: [
      {
        id: 'msg-1',
        sender: 'John Doe',
        senderEmail: 'john@company.com',
        text: 'Hey team, just uploaded the latest design mockups to the shared drive.',
        createTime: '2024-01-15T14:30:00Z',
        attachments: [
          {
            id: 'att-1',
            name: 'design-mockups-v2.pdf',
            type: 'pdf',
            size: '2.4 MB'
          }
        ]
      },
      {
        id: 'msg-2',
        sender: 'Sarah Wilson',
        senderEmail: 'sarah@company.com',
        text: 'Great work! The new navigation flow looks much cleaner.',
        createTime: '2024-01-15T14:25:00Z',
        attachments: []
      },
      {
        id: 'msg-3',
        sender: 'Mike Chen',
        senderEmail: 'mike@company.com',
        text: 'Quick question - should we implement the dark mode toggle in this sprint?',
        createTime: '2024-01-15T14:20:00Z',
        attachments: []
      }
    ]
  },
  {
    spaceId: 'chat-2',
    displayName: 'Marketing Campaign Discussion',
    lastActivity: '2024-01-15T12:15:00Z',
    participantCount: 8,
    unreadCount: 0,
    messages: [
      {
        id: 'msg-4',
        sender: 'Emily Rodriguez',
        senderEmail: 'emily@company.com',
        text: 'The Q1 campaign metrics are looking promising. CTR is up 15% from last quarter.',
        createTime: '2024-01-15T12:15:00Z',
        attachments: [
          {
            id: 'att-2',
            name: 'Q1-campaign-metrics.xlsx',
            type: 'excel',
            size: '1.2 MB'
          }
        ]
      },
      {
        id: 'msg-5',
        sender: 'David Kim',
        senderEmail: 'david@company.com',
        text: 'That\'s excellent news! Should we increase the budget for the social media ads?',
        createTime: '2024-01-15T12:10:00Z',
        attachments: []
      }
    ]
  },
  {
    spaceId: 'chat-3',
    displayName: 'General',
    lastActivity: '2024-01-15T10:45:00Z',
    participantCount: 23,
    unreadCount: 1,
    messages: [
      {
        id: 'msg-6',
        sender: 'Lisa Thompson',
        senderEmail: 'lisa@company.com',
        text: 'Reminder: Company all-hands meeting tomorrow at 10 AM. Coffee and bagels will be provided! ☕🥯',
        createTime: '2024-01-15T10:45:00Z',
        attachments: []
      }
    ]
  }
];

export default function Chats() {
  const [loading, setLoading] = useState(true);
  const { setLoading: setActionLoading, isLoading } = useLoadingStates();

  // Simulate loading for demo data
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    setActionLoading('refresh', true);
    // Simulate API call
    setTimeout(() => {
      setActionLoading('refresh', false);
    }, 2000);
  };

  const handleNewChat = async () => {
    setActionLoading('newChat', true);
    // Simulate API call
    setTimeout(() => {
      setActionLoading('newChat', false);
    }, 1500);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'excel':
        return '📊';
      case 'image':
        return '🖼️';
      default:
        return '📎';
    }
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="heading">Team Chats</h1>
        </div>
        <Loading 
          variant="spinner" 
          size="lg" 
          message="Loading team chats..."
          theme="light"
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading">Team Chats</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleNewChat}
            disabled={isLoading('newChat')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading('newChat') && <ButtonLoader size="sm" color="white" />}
            <span>{isLoading('newChat') ? 'Creating...' : 'New Chat'}</span>
          </button>
          <button 
            onClick={handleRefresh}
            disabled={isLoading('refresh')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading('refresh') && <ButtonLoader size="sm" color="white" />}
            <span>{isLoading('refresh') ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {mockChats.map((chat) => (
          <div key={chat.spaceId} className="bg-gray-800 rounded-lg overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    {chat.displayName}
                    {chat.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-300">
                    <span>👥 {chat.participantCount} members</span>
                    <span>🕐 Last activity: {formatDate(chat.lastActivity)}</span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="p-6 space-y-4">
              {chat.messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {message.sender.split(' ').map(name => name[0]).join('')}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{message.sender}</span>
                      <span className="text-gray-400 text-sm">{formatTime(message.createTime)}</span>
                    </div>
                    
                    <p className="text-gray-300 mb-2">{message.text}</p>
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="space-y-2">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center gap-2 bg-gray-700 p-3 rounded-lg w-fit">
                            <span className="text-2xl">{getFileIcon(attachment.type)}</span>
                            <div>
                              <div className="text-white text-sm font-medium">{attachment.name}</div>
                              <div className="text-gray-400 text-xs">{attachment.size}</div>
                            </div>
                            <button className="ml-2 text-blue-400 hover:text-blue-300 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Message Input */}
              <div className="border-t border-gray-700 pt-4 mt-6">
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AuthLayout>
  )
}
