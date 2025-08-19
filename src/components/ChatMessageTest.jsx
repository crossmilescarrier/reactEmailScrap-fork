import React from 'react';
import ChatMessage from './ChatMessage';

// Test component to verify ChatMessage behavior with different message types
export default function ChatMessageTest() {
    // Test cases for different message configurations
    const testMessages = [
        {
            id: 'test-1',
            messageId: 'msg-1',
            text: '',  // Empty text
            body: '',  // Empty body
            attachments: [],  // No attachments
            senderDisplayName: 'Test User',
            createTime: new Date().toISOString(),
            isOwn: false
        },
        {
            id: 'test-2',
            messageId: 'msg-2',
            text: null,  // Null text
            body: null,  // Null body
            attachments: [],  // No attachments
            senderDisplayName: 'Test User',
            createTime: new Date().toISOString(),
            isOwn: false
        },
        {
            id: 'test-3',
            messageId: 'msg-3',
            text: '',  // Empty text
            body: '',  // Empty body
            attachments: [  // Has attachments
                {
                    filename: 'test-image.jpg',
                    contentType: 'image/jpeg',
                    mimeType: 'image/jpeg',
                    isImage: true,
                    mediaType: 'image',
                    localPath: '/media/files/test-image.jpg',
                    downloadStatus: 'completed'
                }
            ],
            senderDisplayName: 'Test User',
            createTime: new Date().toISOString(),
            isOwn: false
        },
        {
            id: 'test-4',
            messageId: 'msg-4',
            text: null,  // Null text
            body: null,  // Null body
            attachments: [  // Has attachments
                {
                    filename: 'test-document.pdf',
                    contentType: 'application/pdf',
                    mimeType: 'application/pdf',
                    isDocument: true,
                    mediaType: 'document',
                    downloadStatus: 'completed'
                }
            ],
            senderDisplayName: 'Test User',
            createTime: new Date().toISOString(),
            isOwn: false
        },
        {
            id: 'test-5',
            messageId: 'msg-5',
            // No text field at all
            // No body field at all
            attachments: [  // Has attachments
                {
                    filename: 'test-video.mp4',
                    contentType: 'video/mp4',
                    mimeType: 'video/mp4',
                    isVideo: true,
                    mediaType: 'video',
                    localPath: '/media/files/test-video.mp4',
                    downloadStatus: 'completed'
                }
            ],
            senderDisplayName: 'Test User',
            createTime: new Date().toISOString(),
            isOwn: false
        },
        {
            id: 'test-6',
            messageId: 'msg-6',
            text: 'This message has both text and attachments',
            body: 'This message has both text and attachments',
            attachments: [
                {
                    filename: 'combined-test.png',
                    contentType: 'image/png',
                    mimeType: 'image/png',
                    isImage: true,
                    mediaType: 'image',
                    localPath: '/media/files/combined-test.png',
                    downloadStatus: 'completed'
                }
            ],
            senderDisplayName: 'Test User',
            createTime: new Date().toISOString(),
            isOwn: false
        }
    ];

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    🧪 ChatMessage Test Cases
                </h1>
                
                <p className="text-gray-600 mb-8">
                    Testing different message configurations to identify the "no text" issue:
                </p>
                
                <div className="space-y-8">
                    {testMessages.map((message, index) => (
                        <div key={message.id} className="border-l-4 border-blue-500 pl-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                Test Case {index + 1}: {getTestCaseDescription(message, index)}
                            </h3>
                            
                            <div className="mb-2 text-xs text-gray-500 font-mono">
                                text: {JSON.stringify(message.text)} | 
                                body: {JSON.stringify(message.body)} | 
                                attachments: {message.attachments ? message.attachments.length : 0}
                            </div>
                            
                            <ChatMessage
                                message={message}
                                isOwn={message.isOwn}
                                currentUserEmail="test@example.com"
                                showAvatar={true}
                                showName={true}
                                groupMessage={true}
                            />
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Expected Results:</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li><strong>Test 1 & 2:</strong> Should show "No content" (empty/null text, no attachments)</li>
                        <li><strong>Test 3, 4 & 5:</strong> Should show ONLY attachments, NO "No content" text</li>
                        <li><strong>Test 6:</strong> Should show both text content and attachments</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

function getTestCaseDescription(message, index) {
    switch (index) {
        case 0:
            return "Empty text & body, no attachments";
        case 1:
            return "Null text & body, no attachments";
        case 2:
            return "Empty text & body, has image attachment";
        case 3:
            return "Null text & body, has document attachment";
        case 4:
            return "No text/body fields, has video attachment";
        case 5:
            return "Has both text and attachment";
        default:
            return "Unknown test case";
    }
}
