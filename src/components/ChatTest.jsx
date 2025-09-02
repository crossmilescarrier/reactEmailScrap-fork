import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

// Test component to validate chat auto-scroll and message alignment
export default function ChatTest() {
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    
    // Sample test messages
    const testMessages = [
        {
            _id: 'msg-1',
            text: 'Hello! How are you doing today?',
            from: 'john@example.com',
            senderDisplayName: 'John Doe',
            date: new Date(Date.now() - 120000).toISOString(),
            isOwn: false,
            attachments: []
        },
        {
            _id: 'msg-2', 
            text: 'I am doing great, thanks for asking! How about you?',
            from: 'me@example.com',
            senderDisplayName: 'Me',
            date: new Date(Date.now() - 60000).toISOString(),
            isOwn: true,
            attachments: []
        },
        {
            _id: 'msg-3',
            text: 'That\'s wonderful to hear! I\'m doing well too. Check out this link: https://www.google.com',
            from: 'john@example.com',
            senderDisplayName: 'John Doe',
            date: new Date(Date.now() - 30000).toISOString(),
            isOwn: false,
            attachments: []
        },
        {
            _id: 'msg-4',
            text: 'Nice! I also found this interesting: https://react.dev',
            from: 'me@example.com',
            senderDisplayName: 'Me',
            date: new Date().toISOString(),
            isOwn: true,
            attachments: []
        }
    ];

    // Scroll to bottom helper
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Load messages gradually to test auto-scroll
    useEffect(() => {
        const loadMessages = () => {
            let index = 0;
            const interval = setInterval(() => {
                if (index < testMessages.length) {
                    setMessages(prev => [...prev, testMessages[index]]);
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 1000);
            
            return () => clearInterval(interval);
        };

        const cleanup = loadMessages();
        return cleanup;
    }, []);

    // Auto-scroll when messages change
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    }, [messages]);

    // Add a new test message
    const addTestMessage = () => {
        const newMessage = {
            _id: `msg-${Date.now()}`,
            text: `Test message added at ${new Date().toLocaleTimeString()}`,
            from: 'me@example.com',
            senderDisplayName: 'Me',
            date: new Date().toISOString(),
            isOwn: true,
            attachments: []
        };
        setMessages(prev => [...prev, newMessage]);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-lg">
                {/* Header */}
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 rounded-t-lg">
                    <h1 className="text-xl font-semibold text-gray-900">🧪 Chat Test</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Testing auto-scroll and message alignment functionality
                    </p>
                    <button
                        onClick={addTestMessage}
                        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        ➕ Add Test Message
                    </button>
                </div>

                {/* Messages Area */}
                <div 
                    className="p-6 space-y-4 max-h-96 overflow-y-auto"
                    style={{ height: '400px' }}
                >
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            Loading test messages...
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <ChatMessage
                                    key={message._id}
                                    message={message}
                                    isOwn={message.isOwn}
                                    currentUserEmail="me@example.com"
                                    showAvatar={true}
                                    showName={true}
                                    groupMessage={false}
                                />
                            ))}
                            {/* Auto-scroll anchor */}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Test Results */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Test Checklist:</h3>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li>✅ Messages load progressively and auto-scroll to bottom</li>
                        <li>✅ Sent messages (blue) appear on the right</li>
                        <li>✅ Received messages (white/gray) appear on the left</li>
                        <li>✅ URLs in messages are clickable</li>
                        <li>✅ Timestamps are displayed</li>
                        <li>✅ Adding new messages triggers smooth scroll</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

// Usage:
// Import and use in your App.js or route:
// import ChatTest from './components/ChatTest';
// <ChatTest />
