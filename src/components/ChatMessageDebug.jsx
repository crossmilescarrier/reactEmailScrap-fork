import React from 'react';
import ChatMessage from './ChatMessage';

const ChatMessageDebug = () => {
  // Sample message with media attachments for testing
  const sampleMessagesWithMedia = [
    {
      id: 'test-1',
      messageId: 'msg-test-1',
      text: 'Here is an image I wanted to share with everyone! 📸',
      from: 'john@company.com',
      senderDisplayName: 'John Doe',
      date: new Date().toISOString(),
      isOwn: false,
      attachments: [
        {
          filename: 'vacation-photo.jpg',
          contentType: 'image/jpeg',
          mimeType: 'image/jpeg',
          size: 245760,
          fileSize: 245760,
          isImage: true,
          mediaType: 'image',
          localPath: '/media/files/vacation-photo.jpg',
          downloadStatus: 'completed',
          thumbnailUrl: '/media/thumbnails/vacation-photo_thumb.jpg'
        }
      ]
    },
    {
      id: 'test-2',
      messageId: 'msg-test-2', 
      text: 'Check out this presentation from our last meeting',
      from: 'you@company.com',
      senderDisplayName: 'You',
      date: new Date().toISOString(),
      isOwn: true,
      attachments: [
        {
          filename: 'Q4-presentation.pdf',
          contentType: 'application/pdf',
          mimeType: 'application/pdf',
          size: 1024000,
          fileSize: 1024000,
          isDocument: true,
          mediaType: 'document',
          downloadStatus: 'pending'
        }
      ]
    },
    {
      id: 'test-3',
      messageId: 'msg-test-3',
      text: 'Here\'s a quick video demo of the new feature 🎥',
      from: 'sarah@company.com',
      senderDisplayName: 'Sarah Wilson',
      date: new Date().toISOString(),
      isOwn: false,
      attachments: [
        {
          filename: 'demo-video.mp4',
          contentType: 'video/mp4',
          mimeType: 'video/mp4',
          size: 5242880,
          fileSize: 5242880,
          isVideo: true,
          mediaType: 'video',
          localPath: '/media/files/demo-video.mp4',
          downloadStatus: 'completed',
          duration: 120,
          thumbnailUrl: '/media/thumbnails/demo-video_thumb.jpg'
        }
      ]
    },
    {
      id: 'test-4',
      messageId: 'msg-test-4',
      text: 'Audio note from the client meeting 🎵',
      from: 'mike@company.com',
      senderDisplayName: 'Mike Chen',
      date: new Date().toISOString(),
      isOwn: false,
      attachments: [
        {
          filename: 'meeting-audio.m4a',
          contentType: 'audio/mp4',
          mimeType: 'audio/mp4',
          size: 1048576,
          fileSize: 1048576,
          isAudio: true,
          mediaType: 'audio',
          localPath: '/media/files/meeting-audio.m4a',
          downloadStatus: 'completed',
          duration: 180
        }
      ]
    },
    {
      id: 'test-5',
      messageId: 'msg-test-5',
      text: 'Attachment failed to process 😞',
      from: 'alex@company.com',
      senderDisplayName: 'Alex Johnson',
      date: new Date().toISOString(),
      isOwn: false,
      attachments: [
        {
          filename: 'large-file.zip',
          contentType: 'application/zip',
          mimeType: 'application/zip',
          size: 52428800, // 50MB
          fileSize: 52428800,
          mediaType: 'archive',
          downloadStatus: 'failed'
        }
      ]
    },
    {
      id: 'test-6',
      messageId: 'msg-test-6',
      text: 'Multiple attachments in one message',
      from: 'lisa@company.com',
      senderDisplayName: 'Lisa Thompson',
      date: new Date().toISOString(),
      isOwn: false,
      attachments: [
        {
          filename: 'document1.pdf',
          contentType: 'application/pdf',
          mimeType: 'application/pdf',
          size: 512000,
          fileSize: 512000,
          isDocument: true,
          mediaType: 'document',
          downloadStatus: 'skipped'
        },
        {
          filename: 'screenshot.png',
          contentType: 'image/png',
          mimeType: 'image/png',
          size: 156000,
          fileSize: 156000,
          isImage: true,
          mediaType: 'image',
          localPath: '/media/files/screenshot.png',
          downloadStatus: 'completed'
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          💬 Chat Message Media Debug
        </h1>
        <p className="text-gray-600">
          This debug page shows how different types of media attachments should render in chat messages.
          Use this to test and verify your media attachment display logic.
        </p>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">🔍 Debug Info:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Media Endpoint:</strong> <code>/api/media/files/filename.ext</code></li>
            <li>• <strong>Thumbnail Endpoint:</strong> <code>/api/media/thumbnails/filename_thumb.jpg</code></li>
            <li>• <strong>Media Directory:</strong> <code>/backend/media/</code></li>
            <li>• <strong>Server Status:</strong> <span className="text-green-600">✅ Running on localhost:3001</span></li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Sample Messages with Media</h2>
        
        <div className="space-y-6">
          {sampleMessagesWithMedia.map((message, index) => (
            <div key={message.id}>
              <div className="flex items-center mb-2">
                <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded text-gray-600">
                  Test #{index + 1} - {message.attachments[0]?.mediaType || 'unknown'} attachment
                </span>
              </div>
              <ChatMessage
                message={message}
                isOwn={message.isOwn}
                currentUserEmail="you@company.com"
                showAvatar={true}
                showName={true}
                groupMessage={true}
              />
              <hr className="my-6 border-gray-200" />
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Expected Behavior:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Images:</strong> Should display inline with click-to-expand</li>
            <li>• <strong>Videos:</strong> Should show video player with controls</li>
            <li>• <strong>Audio:</strong> Should show audio player with controls</li>
            <li>• <strong>Documents:</strong> Should show file icon with download link</li>
            <li>• <strong>Failed attachments:</strong> Should show error status</li>
            <li>• <strong>404 errors:</strong> Media files don't exist yet - sync needed</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-2">✅ Next Steps to See Real Media:</h3>
        <ol className="text-sm text-green-700 space-y-1 ml-4 list-decimal">
          <li>Go to your chat application and select an account</li>
          <li>Run a chat sync (click the sync button)</li>
          <li>Check messages that actually have attachments in Google Chat</li>
          <li>The media processing service will download and process attachments automatically</li>
          <li>Media files will be saved to <code>/backend/media/</code> directory</li>
          <li>Return to chat view to see real processed media</li>
        </ol>
      </div>
    </div>
  );
};

export default ChatMessageDebug;
