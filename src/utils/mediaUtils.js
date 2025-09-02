// Media URL utilities

const APP_URL_LIVE = "http://localhost:8080";
const APP_URL_LOCAL = "http://localhost:8080";
const PROXY_URL = "http://localhost:5001";

// Get the base URL for media requests (same logic as API)
export const getMediaBaseURL = () => {
    const host = window.location.host;
    return host === 'localhost:3000' ? APP_URL_LOCAL : APP_URL_LIVE;
};

// Get the proxy server URL
export const getProxyBaseURL = () => {
    return PROXY_URL;
};

// Generate media file URL (supports both local files and proxy for Google Chat URLs)
export const getMediaURL = (attachment, chatId = null, messageIndex = null, attachmentIndex = null) => {
    console.log('🔍 getMediaURL called with:', { 
        attachment: attachment?.contentName || attachment?.filename || attachment, 
        chatId, 
        messageIndex, 
        attachmentIndex,
        hasGoogleUrls: !!(attachment?.downloadUrl || attachment?.thumbnailUrl),
        downloadStatus: attachment?.downloadStatus
    });
    
    // If attachment is just a string (legacy), treat as localPath
    if (typeof attachment === 'string') {
        if (!attachment) {
            console.log('❌ No localPath provided to getMediaURL');
            return null;
        }
        const filename = attachment.split('/').pop();
        const baseURL = getMediaBaseURL();
        const fullURL = `${baseURL}/api/media/files/${filename}`;
        console.log('✅ Generated local media URL:', fullURL);
        return fullURL;
    }
    
    // Handle attachment object
    if (!attachment) {
        console.log('❌ No attachment provided to getMediaURL');
        return null;
    }
    
    // PRIORITY 1: Local downloaded file (for Gmail attachments that have been downloaded)
    if (attachment.localPath) {
        const filename = attachment.localPath.split('/').pop();
        const baseURL = getMediaBaseURL();
        const fullURL = `${baseURL}/api/media/files/${filename}`;
        console.log('📁 Using local downloaded file:', fullURL);
        return fullURL;
    }
    
    // PRIORITY 2: Use backend Gmail media proxy for Google Chat URLs
    if (attachment.downloadUrl || attachment.thumbnailUrl) {
        // Use the backend to proxy the Google Chat media URL
        const attachmentId = attachment._id || attachment.name?.split('/').pop() || `${Date.now()}`;
        const baseURL = getMediaBaseURL();
        const proxyURL = `${baseURL}/api/media/gmail/media/${attachmentId}`;
        console.log('📡 Using Gmail media proxy URL:', proxyURL);
        return proxyURL;
    }
    
    // PRIORITY 3: Employee monitoring system - use sample media for demonstration
    if (attachment.employeeMonitored && attachment.localPath) {
        const baseURL = getMediaBaseURL();
        const monitoringURL = `${baseURL}/api/media/monitoring/${attachment.localPath}`;
        console.log('👁️ Using employee monitoring sample:', monitoringURL);
        return monitoringURL;
    }
    
    // PRIORITY 4: Direct filename-based lookup (for test files)
    if (attachment.filename || attachment.contentName) {
        const filename = attachment.filename || attachment.contentName;
        const baseURL = getMediaBaseURL();
        const fullURL = `${baseURL}/api/media/files/${filename}`;
        console.log('📄 Using filename-based URL:', fullURL);
        return fullURL;
    }
    
    console.log('❌ No media URL available for attachment:', attachment);
    return null;
};

// Generate thumbnail URL (supports both local and Google thumbnails)
export const getThumbnailURL = (attachment) => {
    // If attachment is just a string (legacy), treat as thumbnailPath
    if (typeof attachment === 'string') {
        if (!attachment) return null;
        const filename = attachment.split('/').pop();
        return `${getMediaBaseURL()}/api/media/thumbnails/${filename}`;
    }
    
    // Handle attachment object
    if (!attachment) return null;
    
    // Priority 1: Google thumbnail URL
    if (attachment.thumbnailUrl) {
        console.log('🖼️ Using Google thumbnail URL');
        return attachment.thumbnailUrl;
    }
    
    // Priority 2: Local thumbnail file
    if (attachment.thumbnailPath) {
        const filename = attachment.thumbnailPath.split('/').pop();
        return `${getMediaBaseURL()}/api/media/thumbnails/${filename}`;
    }
    
    // Priority 3: Use main media URL as thumbnail for small images
    if (attachment.contentType?.startsWith('image/')) {
        return getMediaURL(attachment);
    }
    
    return null;
};

// Generate download URL
export const getDownloadURL = (localPath, filename) => {
    if (!localPath) return null;
    
    const fileParam = localPath.split('/').pop();
    return `${getMediaBaseURL()}/api/media/files/${fileParam}?download=${encodeURIComponent(filename || fileParam)}`;
};

// Generate proxy URL for Google Chat media (bypasses CORS and authentication issues)
export const getProxyMediaURL = (chatId, messageIndex, attachmentIndex) => {
    if (!chatId || messageIndex === null || messageIndex === undefined || attachmentIndex === null || attachmentIndex === undefined) {
        console.log('❌ Missing required parameters for proxy URL');
        return null;
    }
    
    const proxyURL = `${getProxyBaseURL()}/api/media/${chatId}/${messageIndex}/${attachmentIndex}`;
    console.log('🔄 Generated proxy URL:', proxyURL);
    return proxyURL;
};

// Enhanced getMediaURL with proxy support
export const getEnhancedMediaURL = (attachment, chatId = null, messageIndex = null, attachmentIndex = null) => {
    console.log('🔍 getEnhancedMediaURL called with:', { attachment: attachment?.contentName, chatId, messageIndex, attachmentIndex });
    
    // If we have chat context, try proxy first for Google Chat attachments
    if (chatId && messageIndex !== null && attachmentIndex !== null) {
        if (attachment?.directMediaUrl || attachment?.downloadUrl || attachment?.thumbnailUrl) {
            console.log('📡 Using proxy server for Google Chat media');
            return getProxyMediaURL(chatId, messageIndex, attachmentIndex);
        }
    }
    
    // Fallback to regular media URL logic
    return getMediaURL(attachment);
};

// Check if media URL is accessible
export const checkMediaURL = async (url) => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
};

export default {
    getMediaBaseURL,
    getMediaURL,
    getThumbnailURL,
    getDownloadURL,
    checkMediaURL
};
