import React from 'react';
import ChatMessage from './ChatMessage';

const ChatMessageDiagnostic = () => {
    // Test different attachment configurations to see what renders
    const testMessages = [
        {
            id: 'test-image',
            messageId: 'test-image',
            text: 'Image test',
            attachments: [{
                filename: 'sample_image.png',
                localPath: '/media/files/sample_image.png',
                contentType: 'image/png',
                isImage: true,
                mediaType: 'image',
                fileSize: 3131
            }]
        },
        {
            id: 'test-video-full',
            messageId: 'test-video-full',
            text: 'Video test - with all flags',
            attachments: [{
                filename: 'sample_video.mp4',
                localPath: '/media/files/sample_video.mp4',
                contentType: 'video/mp4',
                isVideo: true,
                mediaType: 'video',
                fileSize: 35575
            }]
        },
        {
            id: 'test-video-minimal',
            messageId: 'test-video-minimal',
            text: 'Video test - filename only',
            attachments: [{
                filename: 'sample_video.mp4',
                contentType: 'video/mp4',
                fileSize: 32
            }]
        },
        {
            id: 'test-video-localpath',
            messageId: 'test-video-localpath',
            text: 'Video test - with localPath',
            attachments: [{
                filename: 'sample_video.mp4',
                localPath: '/media/files/sample_video.mp4',
                contentType: 'video/mp4',
                fileSize: 32
            }]
        },
        {
            id: 'test-pdf-full',
            messageId: 'test-pdf-full',
            text: 'PDF test - with all flags',
            attachments: [{
                filename: 'sample.pdf',
                localPath: '/media/files/sample.pdf',
                contentType: 'application/pdf',
                isDocument: true,
                mediaType: 'document',
                fileSize: 455
            }]
        },
        {
            id: 'test-pdf-minimal',
            messageId: 'test-pdf-minimal',
            text: 'PDF test - filename only',
            attachments: [{
                filename: 'sample.pdf',
                contentType: 'application/pdf',
                fileSize: 455
            }]
        }
    ];

    const analyzeAttachment = (attachment) => {
        const analysis = {
            filename: attachment.filename,
            hasMediaData: !!(attachment.isImage || attachment.isVideo || attachment.isAudio || attachment.mediaType || attachment.localPath),
            isImage: !!(attachment.isImage || attachment.mediaType === 'image' || attachment.mimeType?.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(attachment.filename?.toLowerCase().split('.').pop())),
            isVideo: !!(attachment.isVideo || attachment.mediaType === 'video' || attachment.mimeType?.includes('video') || ['mp4', 'webm', 'avi', 'mov', 'wmv'].includes(attachment.filename?.toLowerCase().split('.').pop())),
            isDocument: !((attachment.isImage || attachment.mediaType === 'image' || attachment.mimeType?.includes('image')) || (attachment.isVideo || attachment.mediaType === 'video' || attachment.mimeType?.includes('video')) || (attachment.isAudio || attachment.mediaType === 'audio' || attachment.mimeType?.includes('audio'))),
            willShowBasicOnly: !(attachment.isImage || attachment.isVideo || attachment.isAudio || attachment.mediaType || attachment.localPath)
        };
        return analysis;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    🔍 ChatMessage Diagnostic Test
                </h1>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-yellow-800 mb-2">💡 Purpose:</h3>
                    <p className="text-sm text-yellow-700">
                        This tests different attachment configurations to understand why videos and documents 
                        show placeholders instead of actual media players/previews.
                    </p>
                </div>

                <div className="space-y-8">
                    {testMessages.map((message, index) => {
                        const attachment = message.attachments[0];
                        const analysis = analyzeAttachment(attachment);
                        
                        return (
                            <div key={message.id} className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Test #{index + 1}: {message.text}
                                </h3>
                                
                                {/* Analysis */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Attachment Data:</h4>
                                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                                            {JSON.stringify(attachment, null, 2)}
                                        </pre>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Logic Analysis:</h4>
                                        <div className="text-xs space-y-1">
                                            <div className={`p-2 rounded ${analysis.hasMediaData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                hasMediaData: {analysis.hasMediaData.toString()}
                                            </div>
                                            <div className={`p-2 rounded ${analysis.isImage ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                                isImage: {analysis.isImage.toString()}
                                            </div>
                                            <div className={`p-2 rounded ${analysis.isVideo ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                                                isVideo: {analysis.isVideo.toString()}
                                            </div>
                                            <div className={`p-2 rounded ${analysis.isDocument ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}`}>
                                                isDocument: {analysis.isDocument.toString()}
                                            </div>
                                            <div className={`p-2 rounded ${analysis.willShowBasicOnly ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                willShowBasicOnly: {analysis.willShowBasicOnly.toString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Actual Rendering */}
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Actual Rendering:</h4>
                                    <div className="border rounded-lg p-4 bg-gray-50">
                                        <ChatMessage 
                                            message={message}
                                            isOwn={false}
                                            showAvatar={false}
                                            showName={false}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">🔍 What to Look For:</h3>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                        <li><strong>hasMediaData: false</strong> → Will show basic placeholder</li>
                        <li><strong>isVideo: false</strong> → Video won't render even with localPath</li>
                        <li><strong>willShowBasicOnly: true</strong> → Only placeholder will show</li>
                        <li>Check browser console for any error messages</li>
                        <li>Check Network tab for failed media requests</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ChatMessageDiagnostic;
