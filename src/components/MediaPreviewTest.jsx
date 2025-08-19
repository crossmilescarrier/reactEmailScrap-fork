import React, { useState } from 'react';
import MediaPreviewModal from './MediaPreviewModal';

export default function MediaPreviewTest() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Sample attachments for testing
    const sampleAttachments = [
        {
            filename: 'sample_image.jpg',
            mimeType: 'image/jpeg',
            mediaType: 'image',
            isImage: true,
            localPath: '/Users/naveentehrpariya/Work/EmailScrap/backend/media/sample_image.jpg',
            fileSize: 9201,
            downloadStatus: 'completed',
            thumbnailUrl: '/api/media/thumbnails/thumb_sample_image.jpg'
        },
        {
            filename: 'sample_document.txt',
            mimeType: 'text/plain',
            mediaType: 'document',
            isDocument: true,
            localPath: '/Users/naveentehrpariya/Work/EmailScrap/backend/media/sample_document.txt',
            fileSize: 246,
            downloadStatus: 'completed'
        },
        {
            filename: 'sample_document.pdf',
            mimeType: 'application/pdf',
            mediaType: 'document',
            isDocument: true,
            localPath: '/Users/naveentehrpariya/Work/EmailScrap/backend/media/sample_document.pdf',
            fileSize: 55,
            downloadStatus: 'completed'
        }
    ];
    
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Media Preview Test</h2>
            
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Media Files:</h3>
                
                {sampleAttachments.map((attachment, index) => (
                    <div key={index} className="border p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">{attachment.filename}</div>
                                <div className="text-sm text-gray-500">
                                    {attachment.mimeType} • {Math.round(attachment.fileSize / 1024)} KB
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Preview
                            </button>
                        </div>
                        
                        {/* Direct image test */}
                        {attachment.isImage && (
                            <div className="mt-4">
                                <img 
                                    src={`/api/media/files/${attachment.localPath.split('/').pop()}`}
                                    alt={attachment.filename}
                                    className="max-w-xs h-auto rounded border"
                                    style={{ maxHeight: '200px' }}
                                    onLoad={() => console.log('✅ Image loaded:', attachment.filename)}
                                    onError={(e) => {
                                        console.error('❌ Image failed to load:', attachment.filename, e.target.src);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ))}
                
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Direct API Tests:</h3>
                    <div className="space-y-2">
                        <div>
                            <a 
                                href="/api/media/files/sample_image.jpg" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                Test Image: /api/media/files/sample_image.jpg
                            </a>
                        </div>
                        <div>
                            <a 
                                href="/api/media/files/sample_document.txt" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                Test Text: /api/media/files/sample_document.txt
                            </a>
                        </div>
                        <div>
                            <a 
                                href="/api/media/files/sample_document.pdf" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                Test PDF: /api/media/files/sample_document.pdf
                            </a>
                        </div>
                        <div>
                            <a 
                                href="/api/media/thumbnails/thumb_sample_image.jpg" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                Test Thumbnail: /api/media/thumbnails/thumb_sample_image.jpg
                            </a>
                        </div>
                    </div>
                </div>
                
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 mt-6"
                >
                    Open Media Preview Modal
                </button>
            </div>
            
            <MediaPreviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                attachments={sampleAttachments}
                initialIndex={0}
            />
        </div>
    );
}
