import React, { useState } from 'react';
import MediaPreviewModal from './MediaPreviewModal';
import { getMediaURL, getThumbnailURL, getDownloadURL, getEnhancedMediaURL } from '../utils/mediaUtils';

// Modern chat message component with left/right alignment and bubble styling
export default function ChatMessage({ message, isOwn = null, currentUserEmail = '', showAvatar = true, showName = true, groupMessage = false }) {
    // Debug logging
    console.log('🔍 ChatMessage rendering message:', {
        messageId: message.messageId,
        text: message.text,
        attachments: message.attachments,
        hasAttachments: message.attachments && message.attachments.length > 0
    });
    
    const [previewModal, setPreviewModal] = useState({ isOpen: false, attachments: [], initialIndex: 0 });
    // Determine if message is own - use multiple data sources
    const isOwnMessage = isOwn ?? message.isOwn ?? message.align === 'right' ?? false;
    
    // Extract sender information from various message formats
    const getSenderData = () => {
        // Use new backend format if available
        if (message.sender) {
            return {
                name: message.sender.name || message.sender.displayName || 'Unknown',
                avatar: message.sender.avatar || message.sender.name?.charAt(0).toUpperCase() || 'U',
                isCurrentUser: message.sender.isCurrentUser
            };
        }
        
        // Legacy format support
        const senderName = isOwnMessage ? 'You' : 
            (message.senderDisplayName && message.senderDisplayName !== 'Unknown' ? message.senderDisplayName :
            message.from ? extractNameFromEmail(message.from) : 'Unknown User');
            
        return {
            name: senderName,
            avatar: senderName.charAt(0).toUpperCase(),
            isCurrentUser: isOwnMessage
        };
    };
    
    // Extract name from "Name <email>" format or email
    const extractNameFromEmail = (fromField) => {
        if (!fromField) return 'Unknown';
        
        const match = fromField.match(/^([^<]+)/);
        const name = match ? match[1].trim().replace(/"/g, '') : fromField;
        
        if (name.includes('@')) {
            return name.split('@')[0];
        }
        
        return name;
    };
    
    // Format time for chat display
    const formatTime = () => {
        // Use new time format if available
        if (message.time?.short) {
            return message.time.short;
        }
        
        // Legacy time formatting
        const dateStr = message.date || message.timestamp;
        if (!dateStr) return '';
        
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };
    
    // Get avatar color based on sender name
    const getAvatarColor = (senderName) => {
        if (isOwnMessage) {
            return 'from-blue-500 to-blue-600';
        }
        
        const colors = [
            'from-green-500 to-green-600',
            'from-purple-500 to-purple-600', 
            'from-red-500 to-red-600',
            'from-orange-500 to-orange-600',
            'from-indigo-500 to-indigo-600',
            'from-pink-500 to-pink-600',
            'from-teal-500 to-teal-600',
            'from-cyan-500 to-cyan-600'
        ];
        
        let hash = 0;
        for (let i = 0; i < senderName.length; i++) {
            hash = senderName.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    };
    
    // Enhanced message content with URL detection
    const getMessageContent = () => {
        const text = message.text || message.body || '';
        
        // Check if text is empty/null/undefined and we have attachments
        const hasText = text && text.trim().length > 0;
        const hasAttachments = message.attachments && message.attachments.length > 0;
        
        // If no text but has attachments, don't show "No content"
        if (!hasText && hasAttachments) {
            return null; // Don't render text content for media-only messages
        }
        
        if (!hasText) {
            return 'No content';
        }
        
        return renderMessageWithLinks(text);
    };
    
    // Function to render message text with clickable URLs
    const renderMessageWithLinks = (text) => {
        if (!text || text === 'No content') {
            return text;
        }
        
        const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
        
        const parts = text.split(urlRegex);
        
        return parts.map((part, index) => {
            if (urlRegex.test(part)) {
                let url = part;
                if (!url.startsWith('http')) {
                    url = 'https://' + url;
                }
                return (
                    <a 
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`underline hover:no-underline transition-all duration-200 ${
                            isOwnMessage ? 'text-blue-200 hover:text-white' : 'text-blue-600 hover:text-blue-800'
                        }`}
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };
    
    // Get bubble styling based on message data
    const getBubbleStyle = () => {
        // Use new bubble hints if available
        if (message.bubble) {
            return message.bubble.color === 'primary' || isOwnMessage
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md';
        }
        
        // Default bubble styling
        return isOwnMessage
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md';
    };
    
    const sender = getSenderData();
    const avatarColor = getAvatarColor(sender.name);
    const timeString = formatTime();
    const messageContent = getMessageContent();
    const bubbleStyle = getBubbleStyle();
    
    // Check if we should show avatar and name based on message type
    const shouldShowAvatar = showAvatar && (message.bubble?.showAvatar !== false);
    const shouldShowName = showName && (message.bubble?.showName !== false) && (groupMessage || !isOwnMessage);
    
    // Handle media preview modal
    const openMediaPreview = (attachments, initialIndex = 0) => {
        setPreviewModal({ isOpen: true, attachments, initialIndex });
    };
    
    const closeMediaPreview = () => {
        setPreviewModal({ isOpen: false, attachments: [], initialIndex: 0 });
    };
    
    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group chat-message`}>
            {/* Left avatar for others */}
            {!isOwnMessage && shouldShowAvatar && (
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-medium flex-shrink-0 mr-3 mt-1`}>
                    {sender.avatar}
                </div>
            )}
            
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                {/* Sender name for others in group chats or when specified */}
                {shouldShowName && (
                    <div className={`flex items-center mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs font-medium text-gray-600">
                            {sender.name}
                        </span>
                    </div>
                )}
                
                {/* Message bubble */}
                <div className={`relative rounded-2xl px-4 py-2 shadow-sm ${bubbleStyle} max-w-full break-words`}>
                    {/* Message content - only show if there's actual text content */}
                    {messageContent && (
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {messageContent}
                        </div>
                    )}
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                        <div className={`${messageContent ? 'mt-2 pt-2 border-t border-opacity-20 border-current' : ''}`}>
                            {message.attachments.map((attachment, index) => {
                                // Enhanced attachment detection - handle both processed and unprocessed attachments
                                const hasMediaData = attachment.isImage || attachment.isVideo || attachment.isAudio || 
                                                   attachment.mediaType || attachment.localPath;
                                
                                return (
                                <div key={`${message.messageId || message.id}-${index}`} className="attachment-item mt-2">
                                    {/* If no media data, show basic attachment info */}
                                    {!hasMediaData && (
                                        <div className="basic-attachment mb-2">
                                            <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                <span className="mr-3 text-2xl">📎</span>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium">
                                                        {attachment.filename || attachment.name || attachment.contentName || 'Unknown file'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {attachment.contentType || attachment.mimeType || 'Unknown type'}
                                                        {attachment.size && ` • ${Math.round(attachment.size / 1024)} KB`}
                                                    </div>
                                                    <div className="text-xs text-blue-500 mt-1">
                                                        📥 Not processed yet - trigger sync to download
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Image attachments - show as thumbnails */}
                                    {(attachment.isImage || attachment.mediaType === 'image' || 
                                      attachment.mimeType?.includes('image') ||
                                      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(attachment.filename?.toLowerCase().split('.').pop())) && (
                                        <div className="image-attachment mb-2">
                                            {(attachment.localPath || attachment.directMediaUrl || attachment.thumbnailUrl) ? (
                                                <div className="relative inline-block">
                                                    <img 
                                                        src={getMediaURL(attachment, message.chatId, message.messageIndex, index)}
                                                        alt={attachment.contentName || attachment.filename || 'Image'}
                                                        className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity shadow-md border border-gray-200"
                                                        onClick={() => openMediaPreview(message.attachments, index)}
                                                        onError={(e) => {
                                                            console.error('Image failed to load:', e.target.src);
                                                            e.target.style.display = 'none';
                                                            e.target.nextElementSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                    {/* Overlay icon to indicate it's clickable */}
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center opacity-0 hover:opacity-100">
                                                        <span className="text-white text-2xl">🔍</span>
                                                    </div>
                                                    {/* Image info overlay */}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 rounded-b-lg">
                                                        <div className="truncate">{(attachment.filename || attachment.name || 'Image').split('.')[0]}</div>
                                                    </div>
                                                </div>
                                            ) : null}
                                            <div className="fallback-attachment hidden items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                <span className="mr-2 text-2xl">🖼️</span>
                                                <div>
                                                    <div className="text-sm font-medium">{attachment.filename || attachment.name || 'Image'}</div>
                                                    <div className="text-xs text-gray-500">Image • {attachment.fileSize ? Math.round(attachment.fileSize / 1024) + ' KB' : 'Unknown size'}</div>
                                                    {attachment.downloadStatus && attachment.downloadStatus !== 'completed' && (
                                                        <div className="text-xs text-red-500 mt-1">
                                                            {attachment.downloadStatus === 'failed' && '❌ Download failed'}
                                                            {attachment.downloadStatus === 'skipped' && '⏭️ File too large'}
                                                            {attachment.downloadStatus === 'pending' && '⏳ Processing...'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Video attachments */}
                                    {(attachment.isVideo || attachment.mediaType === 'video' ||
                                      attachment.mimeType?.includes('video') ||
                                      ['mp4', 'webm', 'avi', 'mov', 'wmv'].includes(attachment.filename?.toLowerCase().split('.').pop())) && (
                                        <div className="video-attachment mb-2">
                                            {(attachment.localPath || attachment.directMediaUrl) ? (
                                                <div className="relative">
                                                    <video 
                                                        src={getMediaURL(attachment, message.chatId, message.messageIndex, index)}
                                                        poster={getThumbnailURL(attachment)}
                                                        controls
                                                        className="max-w-full h-auto rounded-lg shadow-md"
                                                        style={{ maxHeight: '300px' }}
                                                    >
                                                        Your browser does not support video playback.
                                                    </video>
                                                    <button
                                                        onClick={() => openMediaPreview(message.attachments, index)}
                                                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded hover:bg-opacity-70 transition-opacity"
                                                        title="Open in preview"
                                                    >
                                                        🔍
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                    <span className="mr-2 text-2xl">🎥</span>
                                                    <div>
                                                        <div className="text-sm font-medium">{attachment.filename || attachment.name || 'Video'}</div>
                                                        <div className="text-xs text-gray-500">
                                                            Video • {attachment.fileSize ? Math.round(attachment.fileSize / 1024 / 1024) + ' MB' : 'Unknown size'}
                                                            {attachment.duration && ` • ${Math.floor(attachment.duration / 60)}:${String(Math.floor(attachment.duration % 60)).padStart(2, '0')}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Audio attachments */}
                                    {(attachment.isAudio || attachment.mediaType === 'audio' ||
                                      attachment.mimeType?.includes('audio') ||
                                      ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(attachment.filename?.toLowerCase().split('.').pop())) && (
                                        <div className="audio-attachment mb-2">
                                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                                <div className="flex items-center mb-2">
                                                    <span className="mr-2 text-xl">🎵</span>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium">{attachment.filename || attachment.name || 'Audio'}</div>
                                                        <div className="text-xs text-gray-500">
                                                            Audio • {attachment.fileSize ? Math.round(attachment.fileSize / 1024) + ' KB' : 'Unknown size'}
                                                            {attachment.duration && ` • ${Math.floor(attachment.duration / 60)}:${String(Math.floor(attachment.duration % 60)).padStart(2, '0')}`}
                                                        </div>
                                                    </div>
                                                </div>
                                                {(attachment.localPath || attachment.directMediaUrl) ? (
                                                    <audio 
                                                        src={getMediaURL(attachment, message.chatId, message.messageIndex, index)}
                                                        controls
                                                        className="w-full"
                                                    >
                                                        Your browser does not support audio playback.
                                                    </audio>
                                                ) : (
                                                    <div className="text-xs text-red-500">
                                                        {attachment.downloadStatus === 'failed' && '❌ Download failed'}
                                                        {attachment.downloadStatus === 'skipped' && '⏭️ File too large'}
                                                        {attachment.downloadStatus === 'pending' && '⏳ Processing...'}
                                                        {!attachment.downloadStatus && '📁 File not available'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Document and other file attachments - show everything that's not media */}
                                    {!((attachment.isImage || attachment.mediaType === 'image' || attachment.mimeType?.includes('image')) ||
                                       (attachment.isVideo || attachment.mediaType === 'video' || attachment.mimeType?.includes('video')) ||
                                       (attachment.isAudio || attachment.mediaType === 'audio' || attachment.mimeType?.includes('audio'))) && (
                                        <div className="file-attachment mb-2">
                                            <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                                <span className="mr-3 text-2xl">
                                                    {(() => {
                                                        const fileName = attachment.filename || attachment.name || '';
                                                        const ext = fileName.toLowerCase().split('.').pop();
                                                        const mimeType = attachment.contentType || attachment.mimeType || '';
                                                        
                                                        // Image files
                                                        if (attachment.isImage || mimeType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
                                                            return '🖼️';
                                                        }
                                                        // Video files
                                                        if (attachment.isVideo || mimeType.includes('video') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(ext)) {
                                                            return '🎥';
                                                        }
                                                        // Audio files
                                                        if (attachment.isAudio || mimeType.includes('audio') || ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext)) {
                                                            return '🎵';
                                                        }
                                                        // PDF files
                                                        if (mimeType.includes('pdf') || ext === 'pdf') {
                                                            return '📄';
                                                        }
                                                        // Word documents
                                                        if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) {
                                                            return '📝';
                                                        }
                                                        // Excel spreadsheets
                                                        if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
                                                            return '📊';
                                                        }
                                                        // PowerPoint presentations
                                                        if (['ppt', 'pptx', 'odp'].includes(ext)) {
                                                            return '📽️';
                                                        }
                                                        // Text files
                                                        if (['txt', 'md', 'readme'].includes(ext)) {
                                                            return '📄';
                                                        }
                                                        // Archive files
                                                        if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
                                                            return '🗜️';
                                                        }
                                                        // Code files
                                                        if (['js', 'html', 'css', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs'].includes(ext)) {
                                                            return '💻';
                                                        }
                                                        // Default
                                                        return '📎';
                                                    })()
                                                    }
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">
                                                        {attachment.filename || attachment.name || 'Unknown file'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {attachment.mimeType && <span className="mr-2">{attachment.mimeType}</span>}
                                                        {attachment.fileSize && (
                                                            <span>
                                                                {attachment.fileSize > 1024 * 1024 
                                                                    ? `${(attachment.fileSize / 1024 / 1024).toFixed(1)} MB`
                                                                    : `${Math.round(attachment.fileSize / 1024)} KB`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {attachment.downloadStatus && attachment.downloadStatus !== 'completed' && (
                                                        <div className="text-xs mt-1">
                                                            {attachment.downloadStatus === 'failed' && <span className="text-red-500">❌ Download failed</span>}
                                                            {attachment.downloadStatus === 'skipped' && <span className="text-yellow-500">⏭️ File too large</span>}
                                                            {attachment.downloadStatus === 'pending' && <span className="text-blue-500">⏳ Processing...</span>}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center ml-3 space-x-2">
                                                    {attachment.localPath && (
                                                        <>
                                                            <button
                                                                onClick={() => openMediaPreview([attachment], 0)}
                                                                className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                                                                title="Preview file"
                                                            >
                                                                👁️
                                                            </button>
                                                            <a 
                                                                href={getDownloadURL(attachment.localPath, attachment.filename)}
                                                                download={attachment.filename || attachment.name}
                                                                className="p-1 text-green-500 hover:text-green-700 transition-colors"
                                                                title="Download file"
                                                            >
                                                                ⬇️
                                                            </a>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {/* Time and status */}
                    <div className={`flex items-center justify-between mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'} opacity-75`}>
                            {timeString}
                        </span>
                        
                        {/* Message status for own messages */}
                        {isOwnMessage && (
                            <span className={`ml-2 text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'} opacity-75`}>
                                {message.status === 'sent' && '✓'}
                                {message.status === 'delivered' && '✓✓'}
                                {message.status === 'read' && '✓✓'}
                                {!message.status && '✓'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Right avatar for own messages (optional, typically not shown) */}
            {isOwnMessage && shouldShowAvatar && false && (
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ml-3 mt-1 order-2`}>
                    {sender.avatar}
                </div>
            )}
            
            {/* Media Preview Modal */}
            <MediaPreviewModal
                isOpen={previewModal.isOpen}
                onClose={closeMediaPreview}
                attachments={previewModal.attachments}
                initialIndex={previewModal.initialIndex}
            />
        </div>
    );
}
