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
        attachment: attachment?.contentName || attachment, 
        chatId, 
        messageIndex, 
        attachmentIndex,
        hasRealUrls: !!(attachment?.downloadUri || attachment?.downloadUrl)
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
    
    // PRIORITY 1: Real Google Chat URLs (direct from Google)
    if (attachment.downloadUri || attachment.downloadUrl) {
        const url = attachment.downloadUri || attachment.downloadUrl;
        console.log('📡 Using REAL Google Chat media URL');
        return url;
    }
    
    // PRIORITY 2: Google thumbnail URLs (for images)
    if (attachment.contentType?.startsWith('image/') && (attachment.thumbnailUri || attachment.thumbnailUrl)) {
        const url = attachment.thumbnailUri || attachment.thumbnailUrl;
        console.log('🖼️ Using REAL Google thumbnail URL');
        return url;
    }
    
    // PRIORITY 3: Employee monitoring system - use sample media for demonstration
    if (attachment.employeeMonitored && attachment.localPath) {
        const baseURL = getMediaBaseURL();
        const monitoringURL = `${baseURL}/api/media/monitoring/${attachment.localPath}`;
        console.log('👁️ Using employee monitoring sample:', monitoringURL);
        return monitoringURL;
    }
    
    // Priority 1: Use proxy server if we have chat context and Google URLs
    if (chatId && messageIndex !== null && attachmentIndex !== null && 
        (attachment.directMediaUrl || attachment.downloadUrl || attachment.thumbnailUrl)) {
        const proxyURL = `${getProxyBaseURL()}/api/media/${chatId}/${messageIndex}/${attachmentIndex}`;
        console.log('📡 Using proxy server for Google Chat media:', proxyURL);
        return proxyURL;
    }
    
    // Priority 2: Direct Google URL (might not work due to CORS/auth)
    if (attachment.directMediaUrl) {
        console.log('🔗 Using direct Google URL:', attachment.directMediaUrl.substring(0, 80) + '...');
        return attachment.directMediaUrl;
    }
    
    // Priority 3: Local file (downloaded)
    if (attachment.localPath) {
        const filename = attachment.localPath.split('/').pop();
        const baseURL = getMediaBaseURL();
        const fullURL = `${baseURL}/api/media/files/${filename}`;
        console.log('📁 Using local media URL:', fullURL);
        return fullURL;
    }
    
    // Priority 4: Fallback to thumbnail for images (might not work due to CORS/auth)
    if (attachment.thumbnailUrl && attachment.contentType?.startsWith('image/')) {
        console.log('🖼️ Using thumbnail URL as fallback:', attachment.thumbnailUrl.substring(0, 80) + '...');
        return attachment.thumbnailUrl;
    }
    
    console.log('❌ No media URL available for attachment');
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
