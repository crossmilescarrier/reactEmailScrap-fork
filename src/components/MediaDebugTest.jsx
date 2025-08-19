import React, { useState, useEffect } from 'react';
import MediaPreviewModal from './MediaPreviewModal';

export default function MediaDebugTest() {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewModal, setPreviewModal] = useState({ isOpen: false, attachments: [], initialIndex: 0 });
    
    useEffect(() => {
        fetchChats();
    }, []);
    
    const fetchChats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/chat/list');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 Fetched chats:', data);
            setChats(data);
            
        } catch (err) {
            console.error('❌ Error fetching chats:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const openPreview = (attachments, initialIndex = 0) => {
        console.log('🎬 Opening preview modal with:', { attachments, initialIndex });
        setPreviewModal({ isOpen: true, attachments, initialIndex });
    };
    
    const closePreview = () => {
        console.log('🔒 Closing preview modal');
        setPreviewModal({ isOpen: false, attachments: [], initialIndex: 0 });
    };
    
    const testMediaUrls = [
        '/api/media/files/sample_image.jpg',
        '/api/media/files/sample_document.txt',
        '/api/media/files/sample_document.pdf',
        '/api/media/thumbnails/thumb_sample_image.jpg'
    ];
    
    const handleImageLoad = (url) => {
        console.log('✅ Image loaded successfully:', url);
    };
    
    const handleImageError = (url, error) => {
        console.error('❌ Image failed to load:', url, error);
    };
    
    if (loading) {
        return <div className="p-8">Loading chats...</div>;
    }
    
    if (error) {
        return (
            <div className="p-8">
                <div className="text-red-500">Error: {error}</div>
                <button 
                    onClick={fetchChats}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }
    
    const messagesWithMedia = chats.flatMap(chat => 
        chat.messages
            ?.filter(msg => msg.attachments && msg.attachments.length > 0)
            ?.map(msg => ({ ...msg, chatName: chat.displayName }))
        || []
    );
    
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Media Debug Test</h1>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Backend Status:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Total Chats: {chats.length}</div>
                        <div>Messages with Media: {messagesWithMedia.length}</div>
                    </div>
                </div>
            </div>
            
            {/* Direct URL Tests */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Direct URL Tests</h2>
                <div className="grid grid-cols-2 gap-4">
                    {testMediaUrls.map((url, index) => (
                        <div key={index} className="border p-4 rounded">
                            <div className="text-sm text-gray-600 mb-2">{url}</div>
                            {url.includes('image') ? (
                                <img 
                                    src={url}
                                    alt="Test"
                                    className="max-w-full h-32 object-cover"
                                    onLoad={() => handleImageLoad(url)}
                                    onError={(e) => handleImageError(url, e)}
                                />
                            ) : (
                                <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    Test Link
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Messages with Media */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Messages with Media ({messagesWithMedia.length})</h2>
                {messagesWithMedia.length === 0 ? (
                    <div className="text-gray-500">No messages with media found</div>
                ) : (
                    <div className="space-y-4">
                        {messagesWithMedia.map((msg, index) => (
                            <div key={index} className="border p-4 rounded-lg">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-medium">{msg.chatName}</div>
                                        <div className="text-sm text-gray-600">
                                            {msg.text || '(media only)'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {msg.senderDisplayName} • {msg.attachments.length} attachments
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openPreview(msg.attachments, 0)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                    >
                                        Preview
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {msg.attachments.map((attachment, attIndex) => {
                                        const filename = attachment.localPath?.split('/').pop();
                                        const url = filename ? `/api/media/files/${filename}` : null;
                                        
                                        return (
                                            <div key={attIndex} className="border p-3 rounded bg-gray-50">
                                                <div className="text-sm font-medium">{attachment.filename}</div>
                                                <div className="text-xs text-gray-500">
                                                    {attachment.mimeType} • {Math.round(attachment.fileSize / 1024)} KB
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Status: {attachment.downloadStatus}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Type: {attachment.mediaType}
                                                </div>
                                                {url && (
                                                    <div className="mt-2">
                                                        {attachment.isImage || attachment.mediaType === 'image' ? (
                                                            <img 
                                                                src={url}
                                                                alt={attachment.filename}
                                                                className="w-24 h-24 object-cover rounded border cursor-pointer"
                                                                onClick={() => openPreview(msg.attachments, attIndex)}
                                                                onLoad={() => handleImageLoad(url)}
                                                                onError={(e) => handleImageError(url, e)}
                                                            />
                                                        ) : (
                                                            <button
                                                                onClick={() => openPreview(msg.attachments, attIndex)}
                                                                className="text-blue-500 text-sm hover:underline"
                                                            >
                                                                Preview {attachment.filename}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                {!url && (
                                                    <div className="text-xs text-red-500 mt-1">No local path</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Modal Debug Info */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Modal Debug Info</h2>
                <div className="bg-gray-100 p-4 rounded">
                    <div>Modal Open: {previewModal.isOpen ? 'Yes' : 'No'}</div>
                    <div>Attachments Count: {previewModal.attachments.length}</div>
                    <div>Initial Index: {previewModal.initialIndex}</div>
                </div>
            </div>
            
            {/* MediaPreviewModal */}
            <MediaPreviewModal
                isOpen={previewModal.isOpen}
                onClose={closePreview}
                attachments={previewModal.attachments}
                initialIndex={previewModal.initialIndex}
            />
        </div>
    );
}
