import React, { useState, useEffect } from 'react';
import { getMediaURL, getThumbnailURL, getMediaBaseURL } from '../utils/mediaUtils';

const MediaDebug = () => {
    const [mediaStats, setMediaStats] = useState(null);
    const [testUrls, setTestUrls] = useState([]);
    const [urlTests, setUrlTests] = useState({});

    useEffect(() => {
        // Fetch media statistics to see what files are available
        fetch(`${getMediaBaseURL()}/api/media/statistics`)
            .then(response => response.json())
            .then(data => {
                console.log('📊 Media Statistics:', data);
                setMediaStats(data.data);
            })
            .catch(error => {
                console.error('❌ Failed to fetch media statistics:', error);
            });

        // Test various media URLs
        const testFiles = [
            'sample_image.png',
            'sample_video.mp4', 
            'sample.pdf',
            'sample.txt',
            'debug_download.html'
        ];

        const testUrls = testFiles.map(filename => ({
            filename,
            url: `${getMediaBaseURL()}/api/media/files/${filename}`,
            type: getFileType(filename)
        }));

        setTestUrls(testUrls);

        // Test each URL
        testUrls.forEach(testUrl => {
            testUrlAccess(testUrl.filename, testUrl.url);
        });
    }, []);

    const getFileType = (filename) => {
        const ext = filename.toLowerCase().split('.').pop();
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
        if (['mp4', 'webm', 'avi', 'mov'].includes(ext)) return 'video';
        if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
        if (['pdf'].includes(ext)) return 'pdf';
        if (['txt', 'md'].includes(ext)) return 'text';
        return 'other';
    };

    const testUrlAccess = async (filename, url) => {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            setUrlTests(prev => ({
                ...prev,
                [filename]: {
                    status: response.status,
                    success: response.ok,
                    headers: {
                        contentType: response.headers.get('content-type'),
                        contentLength: response.headers.get('content-length')
                    }
                }
            }));
        } catch (error) {
            setUrlTests(prev => ({
                ...prev,
                [filename]: {
                    status: 'ERROR',
                    success: false,
                    error: error.message
                }
            }));
        }
    };

    // Test attachment objects like those that would come from chat messages
    const testAttachments = [
        {
            filename: 'sample_image.png',
            localPath: '/media/files/sample_image.png',
            contentType: 'image/png',
            isImage: true,
            mediaType: 'image',
            fileSize: 3131,
            downloadStatus: 'completed'
        },
        {
            filename: 'sample_video.mp4',
            localPath: '/media/files/sample_video.mp4',
            contentType: 'video/mp4',
            isVideo: true,
            mediaType: 'video',
            fileSize: 35575,
            downloadStatus: 'completed'
        },
        {
            filename: 'sample.pdf',
            localPath: '/media/files/sample.pdf',
            contentType: 'application/pdf',
            isDocument: true,
            mediaType: 'document',
            fileSize: 45,
            downloadStatus: 'completed'
        }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    🔍 Media Debug Dashboard
                </h1>

                {/* Media Statistics */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Backend Media Statistics</h2>
                    {mediaStats ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{mediaStats.totalFiles}</div>
                                <div className="text-sm text-blue-800">Total Files</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{mediaStats.totalSizeMB?.toFixed(2)}MB</div>
                                <div className="text-sm text-green-800">Total Size</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">{mediaStats.totalThumbnails}</div>
                                <div className="text-sm text-purple-800">Thumbnails</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">
                                    {Object.keys(mediaStats.fileTypeBreakdown || {}).length}
                                </div>
                                <div className="text-sm text-orange-800">File Types</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">Loading statistics...</div>
                    )}
                </div>

                {/* URL Testing Results */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">🌐 URL Accessibility Test</h2>
                    <div className="space-y-3">
                        {testUrls.map(({ filename, url, type }) => {
                            const test = urlTests[filename];
                            return (
                                <div key={filename} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800">{filename}</div>
                                        <div className="text-sm text-gray-600">{url}</div>
                                    </div>
                                    <div className="text-right">
                                        {test ? (
                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                test.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {test.success ? `✅ ${test.status}` : `❌ ${test.status || 'ERROR'}`}
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                                ⏳ Testing...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Media URL Generation Test */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 Media URL Generation Test</h2>
                    <div className="space-y-4">
                        {testAttachments.map((attachment, index) => {
                            const generatedUrl = getMediaURL(attachment);
                            const thumbnailUrl = getThumbnailURL(attachment);
                            
                            return (
                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                    <div className="font-medium text-gray-800 mb-2">{attachment.filename}</div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-600 mb-1">Input Data:</div>
                                            <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                                                {JSON.stringify(attachment, null, 2)}
                                            </pre>
                                        </div>
                                        
                                        <div>
                                            <div className="text-sm font-medium text-gray-600 mb-1">Generated URLs:</div>
                                            <div className="space-y-2">
                                                <div className="bg-white p-2 rounded border">
                                                    <div className="text-xs font-medium text-blue-600">Media URL:</div>
                                                    <div className="text-xs break-all">{generatedUrl || 'null'}</div>
                                                </div>
                                                {thumbnailUrl && (
                                                    <div className="bg-white p-2 rounded border">
                                                        <div className="text-xs font-medium text-purple-600">Thumbnail URL:</div>
                                                        <div className="text-xs break-all">{thumbnailUrl}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Test actual media display */}
                                    {generatedUrl && (
                                        <div className="mt-4 border-t pt-4">
                                            <div className="text-sm font-medium text-gray-600 mb-2">Actual Render Test:</div>
                                            
                                            {/* Image test */}
                                            {attachment.isImage && (
                                                <div className="mb-3">
                                                    <div className="text-xs text-gray-500 mb-1">Image rendering:</div>
                                                    <img 
                                                        src={generatedUrl}
                                                        alt={attachment.filename}
                                                        className="max-w-xs max-h-40 object-contain border rounded"
                                                        onLoad={() => console.log(`✅ Image loaded: ${attachment.filename}`)}
                                                        onError={(e) => {
                                                            console.error(`❌ Image failed to load: ${attachment.filename}`, e);
                                                            e.target.className = 'hidden';
                                                            e.target.nextElementSibling.className = 'text-red-500 text-sm block';
                                                        }}
                                                    />
                                                    <div className="hidden">❌ Image failed to load</div>
                                                </div>
                                            )}
                                            
                                            {/* Video test */}
                                            {attachment.isVideo && (
                                                <div className="mb-3">
                                                    <div className="text-xs text-gray-500 mb-1">Video rendering:</div>
                                                    <video 
                                                        src={generatedUrl}
                                                        controls
                                                        preload="metadata"
                                                        className="max-w-xs max-h-40 border rounded"
                                                        onLoadedData={() => console.log(`✅ Video loaded: ${attachment.filename}`)}
                                                        onLoadedMetadata={() => console.log(`✅ Video metadata loaded: ${attachment.filename}`)}
                                                        onError={(e) => {
                                                            console.error(`❌ Video failed to load: ${attachment.filename}`, e.target.error, e);
                                                            e.target.className = 'hidden';
                                                            e.target.nextElementSibling.className = 'text-red-500 text-sm block';
                                                        }}
                                                    >
                                                        Your browser does not support video playback.
                                                    </video>
                                                    <div className="hidden">❌ Video failed to load</div>
                                                </div>
                                            )}
                                            
                                            {/* Document/PDF test */}
                                            {attachment.isDocument && (
                                                <div className="mb-3">
                                                    <div className="text-xs text-gray-500 mb-1">Document rendering:</div>
                                                    <div className="space-y-2">
                                                        {/* PDF iframe test */}
                                                        {attachment.contentType === 'application/pdf' && (
                                                            <div>
                                                                <div className="text-xs text-blue-600 mb-1">PDF Preview (iframe):</div>
                                                                <iframe 
                                                                    src={generatedUrl}
                                                                    className="w-full h-40 border rounded"
                                                                    onLoad={() => console.log(`✅ PDF iframe loaded: ${attachment.filename}`)}
                                                                    onError={(e) => {
                                                                        console.error(`❌ PDF iframe failed: ${attachment.filename}`, e);
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                        
                                                        {/* Download link test */}
                                                        <div>
                                                            <div className="text-xs text-green-600 mb-1">Download link:</div>
                                                            <a 
                                                                href={generatedUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                                                onClick={() => console.log(`✅ Download link clicked: ${attachment.filename}`)}
                                                            >
                                                                📄 Open {attachment.filename}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Direct URL test */}
                                            <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                                                <div className="font-medium mb-1">Direct URL Test:</div>
                                                <a 
                                                    href={generatedUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline break-all"
                                                >
                                                    {generatedUrl}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Console Log Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">🔍 Debugging Instructions:</h3>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                        <li>Open your browser's Developer Tools (F12)</li>
                        <li>Go to the Console tab</li>
                        <li>Look for any error messages related to media loading</li>
                        <li>Check the Network tab to see if media requests are failing</li>
                        <li>Verify that the backend server is running on localhost:5001</li>
                        <li>Check that CORS is properly configured</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MediaDebug;
