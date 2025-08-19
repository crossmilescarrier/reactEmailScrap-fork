import React, { useState, useEffect } from 'react';
import { getMediaURL, getDownloadURL } from '../utils/mediaUtils';

export default function MediaPreviewModal({ 
    isOpen, 
    onClose, 
    attachments = [], 
    initialIndex = 0 
}) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const currentAttachment = attachments[currentIndex];

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setError(null);
            setZoomLevel(1);
            setPosition({ x: 0, y: 0 });
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, currentIndex]);

    if (!isOpen || !currentAttachment) return null;

    const handleNext = () => {
        if (currentIndex < attachments.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev * 1.5, 5));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
    };

    const handleZoomReset = () => {
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e) => {
        if (zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoomLevel > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e) => {
        if (isImage()) {
            e.preventDefault();
            const delta = e.deltaY * -0.01;
            const newZoom = Math.max(0.5, Math.min(5, zoomLevel * (1 + delta)));
            setZoomLevel(newZoom);
        }
    };

    const getFileUrl = () => {
        return getMediaURL(currentAttachment.localPath);
    };

    const getFileName = () => {
        return currentAttachment.filename || currentAttachment.name || 'Unknown file';
    };

    const getFileSize = () => {
        if (currentAttachment.fileSize) {
            const size = currentAttachment.fileSize;
            if (size > 1024 * 1024) {
                return `${(size / 1024 / 1024).toFixed(1)} MB`;
            } else {
                return `${Math.round(size / 1024)} KB`;
            }
        }
        return '';
    };

    const isImage = () => {
        return currentAttachment.isImage || 
               currentAttachment.mediaType === 'image' || 
               currentAttachment.mimeType?.includes('image') ||
               ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(
                   getFileName().toLowerCase().split('.').pop()
               );
    };

    const isVideo = () => {
        const fileName = getFileName().toLowerCase();
        const ext = fileName.split('.').pop();
        const contentType = currentAttachment.contentType || currentAttachment.mimeType || '';
        
        return currentAttachment.isVideo || 
               currentAttachment.mediaType === 'video' ||
               contentType.includes('video') ||
               ['mp4', 'webm', 'avi', 'mov', 'wmv', 'mkv', 'flv'].includes(ext) ||
               fileName.includes('video');
    };

    const isAudio = () => {
        return currentAttachment.isAudio || 
               currentAttachment.mediaType === 'audio' ||
               currentAttachment.mimeType?.includes('audio') ||
               ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(
                   getFileName().toLowerCase().split('.').pop()
               );
    };

    const isPDF = () => {
        return currentAttachment.mimeType?.includes('pdf') ||
               getFileName().toLowerCase().endsWith('.pdf');
    };

    const isDocument = () => {
        return currentAttachment.isDocument ||
               currentAttachment.mediaType === 'document' ||
               ['doc', 'docx', 'txt', 'rtf', 'odt'].includes(
                   getFileName().toLowerCase().split('.').pop()
               );
    };

    const isSpreadsheet = () => {
        return ['xls', 'xlsx', 'csv', 'ods'].includes(
            getFileName().toLowerCase().split('.').pop()
        );
    };

    const isPresentation = () => {
        return ['ppt', 'pptx', 'odp'].includes(
            getFileName().toLowerCase().split('.').pop()
        );
    };

    const isArchive = () => {
        return ['zip', 'rar', '7z', 'tar', 'gz'].includes(
            getFileName().toLowerCase().split('.').pop()
        );
    };

    const isTextFile = () => {
        return ['txt', 'md', 'json', 'csv', 'log', 'js', 'html', 'css', 'xml'].includes(
            getFileName().toLowerCase().split('.').pop()
        );
    };

    const getFileIcon = () => {
        if (isImage()) return '🖼️';
        if (isVideo()) return '🎥';
        if (isAudio()) return '🎵';
        if (isPDF()) return '📄';
        if (isTextFile()) return '📄';
        if (isDocument()) return '📝';
        if (isSpreadsheet()) return '📊';
        if (isPresentation()) return '📽️';
        if (isArchive()) return '🗜️';
        return '📁';
    };

    // Text File Preview Component
    const TextFilePreview = ({ filename, onLoad, onError }) => {
        const [content, setContent] = useState('');
        const [loading, setLoading] = useState(true);
        
        useEffect(() => {
            if (filename && currentAttachment.localPath) {
                const previewUrl = `${getMediaURL(currentAttachment.localPath).replace('/files/', '/preview/')}`;
                
                fetch(previewUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            setContent(data.content || 'Empty file');
                        } else {
                            throw new Error(data.message || 'Failed to load file');
                        }
                        setLoading(false);
                        onLoad();
                    })
                    .catch(error => {
                        setContent('Failed to load file content');
                        setLoading(false);
                        onError(error.message);
                    });
            }
        }, [filename, currentAttachment.localPath, onLoad, onError]);
        
        if (loading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-white">Loading file content...</div>
                </div>
            );
        }
        
        return (
            <div className="h-full flex flex-col">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-600">
                    <div className="text-white text-sm font-medium">{filename}</div>
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap break-words">
                        {content}
                    </pre>
                </div>
            </div>
        );
    };

    const renderMediaContent = () => {
        const fileUrl = getFileUrl();
        
        if (!fileUrl) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-6xl mb-4">📁</div>
                        <div className="text-lg text-gray-300 mb-2">{getFileName()}</div>
                        <div className="text-sm text-gray-400">File not available for preview</div>
                        {currentAttachment.downloadStatus !== 'completed' && (
                            <div className="text-sm text-orange-400 mt-2">
                                Status: {currentAttachment.downloadStatus || 'pending'}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (isImage()) {
            return (
                <div 
                    className="flex items-center justify-center h-full cursor-move"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <img
                        src={fileUrl}
                        alt={getFileName()}
                        className="max-w-none max-h-none object-contain transition-transform duration-200"
                        style={{
                            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                            cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                        }}
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setError('Failed to load image');
                            setIsLoading(false);
                        }}
                        draggable={false}
                    />
                </div>
            );
        }

        if (isVideo()) {
            return (
                <div className="flex items-center justify-center h-full">
                    <video
                        src={fileUrl}
                        controls
                        className="max-w-full max-h-full"
                        onLoadedData={() => setIsLoading(false)}
                        onError={() => {
                            setError('Failed to load video');
                            setIsLoading(false);
                        }}
                    >
                        Your browser does not support video playback.
                    </video>
                </div>
            );
        }

        if (isAudio()) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="text-8xl mb-6">🎵</div>
                        <div className="text-xl text-white mb-4">{getFileName()}</div>
                        <audio
                            src={fileUrl}
                            controls
                            className="w-80"
                            onLoadedData={() => setIsLoading(false)}
                            onError={() => {
                                setError('Failed to load audio');
                                setIsLoading(false);
                            }}
                        >
                            Your browser does not support audio playback.
                        </audio>
                        <div className="text-sm text-gray-400 mt-2">{getFileSize()}</div>
                    </div>
                </div>
            );
        }

        if (isPDF()) {
            return (
                <div className="flex items-center justify-center h-full">
                    <iframe
                        src={fileUrl}
                        className="w-full h-full border-none"
                        title={getFileName()}
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setError('Failed to load PDF');
                            setIsLoading(false);
                        }}
                    />
                </div>
            );
        }

        // Text file preview
        if (isTextFile()) {
            return (
                <div className="flex items-center justify-center h-full p-4">
                    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
                        <TextFilePreview 
                            filename={getFileName()}
                            onLoad={() => setIsLoading(false)}
                            onError={(error) => {
                                setError(error);
                                setIsLoading(false);
                            }}
                        />
                    </div>
                </div>
            );
        }

        // Default document/file view
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="text-8xl mb-6">📄</div>
                    <div className="text-xl text-white mb-2">{getFileName()}</div>
                    <div className="text-sm text-gray-400 mb-4">
                        {currentAttachment.mimeType && (
                            <div>{currentAttachment.mimeType}</div>
                        )}
                        {getFileSize() && <div>{getFileSize()}</div>}
                    </div>
                    <button
                        onClick={() => window.open(fileUrl, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Open File
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4 z-10">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-medium truncate max-w-md">
                            {getFileName()}
                        </h3>
                        <span className="text-sm text-gray-300">
                            {currentIndex + 1} of {attachments.length}
                        </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        {/* Zoom controls for images */}
                        {isImage() && (
                            <>
                                <button
                                    onClick={handleZoomOut}
                                    className="p-2 hover:bg-gray-700 rounded transition-colors"
                                    title="Zoom out"
                                >
                                    🔍-
                                </button>
                                <span className="text-sm px-2">{Math.round(zoomLevel * 100)}%</span>
                                <button
                                    onClick={handleZoomIn}
                                    className="p-2 hover:bg-gray-700 rounded transition-colors"
                                    title="Zoom in"
                                >
                                    🔍+
                                </button>
                                <button
                                    onClick={handleZoomReset}
                                    className="p-2 hover:bg-gray-700 rounded transition-colors"
                                    title="Reset zoom"
                                >
                                    ↻
                                </button>
                            </>
                        )}
                        
                        {/* Download button */}
                        {getFileUrl() && (
                            <a
                                href={getDownloadURL(currentAttachment.localPath, getFileName())}
                                download={getFileName()}
                                className="p-2 hover:bg-gray-700 rounded transition-colors"
                                title="Download file"
                            >
                                ⬇️
                            </a>
                        )}
                        
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-700 rounded transition-colors text-xl"
                            title="Close"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation arrows */}
            {attachments.length > 1 && (
                <>
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
                        title="Previous"
                    >
                        ‹
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === attachments.length - 1}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
                        title="Next"
                    >
                        ›
                    </button>
                </>
            )}

            {/* Main content area */}
            <div className="w-full h-full pt-16 pb-4 px-4">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-lg">Loading...</div>
                    </div>
                )}
                
                {error ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-6xl mb-4">⚠️</div>
                            <div className="text-xl text-red-400 mb-2">Error loading media</div>
                            <div className="text-gray-400">{error}</div>
                        </div>
                    </div>
                ) : (
                    renderMediaContent()
                )}
            </div>

            {/* Keyboard shortcuts info */}
            <div className="absolute bottom-4 left-4 text-xs text-gray-400">
                <div>ESC: Close • ←/→: Navigate • Mouse wheel: Zoom (images)</div>
            </div>

            {/* Keyboard event handler */}
            <div
                onKeyDown={(e) => {
                    switch (e.key) {
                        case 'Escape':
                            onClose();
                            break;
                        case 'ArrowLeft':
                            handlePrevious();
                            break;
                        case 'ArrowRight':
                            handleNext();
                            break;
                        case '+':
                        case '=':
                            if (isImage()) handleZoomIn();
                            break;
                        case '-':
                            if (isImage()) handleZoomOut();
                            break;
                        case '0':
                            if (isImage()) handleZoomReset();
                            break;
                    }
                }}
                tabIndex={-1}
                className="absolute inset-0 outline-none"
                autoFocus
            />
        </div>
    );
}
