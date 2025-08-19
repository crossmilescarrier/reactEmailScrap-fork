import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import AuthLayout from '../../layout/AuthLayout';
import AccountApi from '../../api/AccountApi';
import Api from '../../api/Api';
import toast from 'react-hot-toast';
import { 
   FiArrowLeft,   FiPaperclip, FiDownload, 
   FiChevronDown, FiChevronRight, FiCornerUpLeft, FiUsers, FiShare,
    FiMoreVertical, FiEye, FiMaximize2
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { PageLoader } from '../../components/Spinner';

export default function ThreadDetail() {
   const { accountEmail, threadId } = useParams();
   const [thread, setThread] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   // Fetch thread details
   const fetchThread = async () => {
      try {
         setLoading(true);
         const response = await AccountApi.getThread(threadId);
         
         if (response.status === true) {
            setThread(response.data);
            setError(null);
         } else {
            setError(response.message || 'Failed to fetch thread');
            toast.error(response.message || 'Failed to fetch thread');
         }
      } catch (error) {
         console.error('Error fetching thread:', error);
         setError('Failed to load thread details');
         toast.error('Failed to load thread details');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (threadId) {
         fetchThread();
      }
   }, [threadId]);

   // Format date
   const formatDate = (dateString) => {
      if (!dateString) return 'No date';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   };

   // Format file size
   const formatFileSize = (bytes) => {
      if (!bytes) return 'Unknown size';
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
   };


   // Determine default collapse state like original ITEM logic
   const defaultCollapse = (emailIndex, totalEmails) => {
      if (totalEmails < 2) {
         return true;
      }
      return emailIndex === totalEmails - 1; // Only show last email by default
   };

   // Get attachment icon based on file type
   const getAttachmentIcon = (mimeType, filename) => {
      const extension = filename?.split('.').pop()?.toLowerCase();
      
      if (mimeType?.startsWith('image/')) return '🖼️';
      if (mimeType?.includes('pdf') || extension === 'pdf') return '📄';
      if (mimeType?.includes('word') || ['doc', 'docx'].includes(extension)) return '📝';
      if (mimeType?.includes('excel') || ['xls', 'xlsx'].includes(extension)) return '📊';
      if (mimeType?.includes('powerpoint') || ['ppt', 'pptx'].includes(extension)) return '📊';
      if (mimeType?.startsWith('video/')) return '🎥';
      if (mimeType?.startsWith('audio/')) return '🎵';
      if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return '📦';
      
      return '📎';
   };

   // Handle authenticated download
   const handleDownload = async (attachment) => {
      try {
         const response = await Api.get(`/attachment/${attachment._id || attachment.filename}/download`, {
            responseType: 'blob',
         });
         
         // Create blob URL and trigger download
         const url = window.URL.createObjectURL(new Blob([response.data]));
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', attachment.filename || 'download');
         document.body.appendChild(link);
         link.click();
         link.remove();
         window.URL.revokeObjectURL(url);
      } catch (error) {
         console.error('Download failed:', error);
         toast.error('Failed to download attachment');
      }
   };

   // Get authenticated image URL for preview
   const getAuthenticatedImageUrl = async (attachment) => {
      try {
         const response = await Api.get(`/attachment/${attachment._id || attachment.filename}/download`, {
            responseType: 'blob',
         });
         const url = window.URL.createObjectURL(new Blob([response.data]));
         return url;
      } catch (error) {
         console.error('Failed to load image:', error);
         return null;
      }
   };

   // Render attachment preview
   const AttachmentPreview = ({ attachment }) => {
      const [showPreview, setShowPreview] = useState(false);
      const [imageUrl, setImageUrl] = useState(null);
      const [loadingImage, setLoadingImage] = useState(false);
      const isImage = attachment.mimeType?.startsWith('image/');
      const isPdf = attachment.mimeType?.includes('pdf');
      const isText = attachment.mimeType?.startsWith('text/');

      const handlePreviewToggle = async () => {
         if (!showPreview && isImage && !imageUrl) {
            setLoadingImage(true);
            const url = await getAuthenticatedImageUrl(attachment);
            setImageUrl(url);
            setLoadingImage(false);
         }
         setShowPreview(!showPreview);
      };

      // Cleanup blob URL on unmount
      useEffect(() => {
         return () => {
            if (imageUrl) {
               window.URL.revokeObjectURL(imageUrl);
            }
         };
      }, [imageUrl]);

      return (
         <div className='bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200'>
            <div className='p-4'>
               <div className='flex items-start justify-between'>
                  <div className='flex items-center flex-1'>
                     <div className='text-2xl mr-3'>
                        {getAttachmentIcon(attachment.mimeType, attachment.filename)}
                     </div>
                     <div className='flex-1'>
                        <div className='text-sm font-medium text-gray-900 truncate'>
                           {attachment.filename || 'Unknown filename'}
                        </div>
                        <div className='text-xs text-gray-500 mt-1'>
                           {attachment.mimeType || 'Unknown type'} • {formatFileSize(attachment.size)}
                        </div>
                     </div>
                  </div>
                  <div className='flex items-center space-x-2 ml-4'>
                     {(isImage || isPdf) && (
                        <button 
                           onClick={handlePreviewToggle}
                           className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors'
                           title='Preview'
                           disabled={loadingImage}
                        >
                           {loadingImage ? (
                              <div className='w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin'></div>
                           ) : (
                              <FiEye size={16} />
                           )}
                        </button>
                     )}
                     <button 
                        onClick={() => handleDownload(attachment)}
                        className='p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors'
                        title={`Download ${attachment.filename}`}
                     >
                        <FiDownload size={16} />
                     </button>
                  </div>
               </div>
               
               {/* Preview */}
               {showPreview && (
                  <div className='mt-4 border-t border-gray-100 pt-4'>
                     {isImage && (
                        <div className='max-h-64 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center'>
                           {imageUrl ? (
                              <img 
                                 src={imageUrl}
                                 alt={attachment.filename}
                                 className='max-w-full max-h-full object-contain'
                                 onError={() => {
                                    toast.error('Failed to load image preview');
                                 }}
                              />
                           ) : (
                              <div className='text-gray-500 text-sm p-4'>
                                 {loadingImage ? 'Loading preview...' : 'Preview not available'}
                              </div>
                           )}
                        </div>
                     )}
                     {isPdf && (
                        <div className='bg-gray-50 rounded-lg p-4 text-center'>
                           <div className='text-gray-600 text-sm mb-2'>
                              PDF Preview (Click download to view full document)
                           </div>
                           <button 
                              onClick={() => handleDownload(attachment)}
                              className='inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors'
                           >
                              <FiMaximize2 className='mr-2' size={14} />
                              Download PDF
                           </button>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>
      );
   };

   // Email item component with Gmail-like design
   const EmailItem = ({ email, isLast, index, totalEmails }) => {
      const [showMail, setShowMail] = useState(defaultCollapse(index, totalEmails));
      const [showQuote, setShowQuote] = useState(!false);
      const emailRef = useRef(null);

      useEffect(() => {
         if (emailRef.current && showMail) {
            const quoteContainers = emailRef.current.querySelectorAll('.gmail_quote, [class*="gmail_quote"]');
            quoteContainers.forEach(container => {
               container.style.display = showQuote ? 'block' : 'none';
            });
         }
      }, [showMail, showQuote]);

      const toggleQuote = () => {
         if (emailRef.current) {
            const quoteContainers = emailRef.current.querySelectorAll('.gmail_quote, [class*="gmail_quote"]');
            quoteContainers.forEach(container => {
               container.style.display = showQuote ? 'none' : 'block';
            });
            setShowQuote(!showQuote);
         }
      };

      const extractSenderName = (fromEmail) => {
         const match = fromEmail.match(/^([^<]+)/);
         return match ? match[1].trim().replace(/"/g, '') : fromEmail;
      };

      const extractSenderEmail = (fromEmail) => {
         const match = fromEmail.match(/<([^>]+)>/);
         return match ? match[1] : fromEmail;
      };

      return (
         <div className={`bg-white rounded-[30px] mb-3 shadow-sm border border-gray-200 transition-all duration-200   ${showMail ? 'shadow-md' : ''}`}>
            {showMail ? (
               <div className='p-5 md:p-6' ref={emailRef}>
                  <div className='mb-5 pb-3 border-b border-gray-100'>
                     <div className='flex items-start justify-between'>
                        <div className='flex items-start space-x-4 flex-1'>
                           <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-base flex-shrink-0'>
                              {extractSenderName(email.from).charAt(0).toUpperCase()}
                           </div>
                           
                           <div className='flex-1'>
                              <div className='flex items-center justify-between'>
                                 <div className='flex flex-col'>
                                    <span className='font-semibold text-gray-900 text-sm mb-0.5'>
                                       {extractSenderName(email.from)}
                                    </span>
                                    <span className='text-gray-500 text-xs ml-1.5'>
                                       &lt;{extractSenderEmail(email.from)}&gt;
                                    </span>
                                 </div>
                                 
                                 <div className='flex flex-col items-end space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-3'>
                                    <span className='text-gray-500 text-xs whitespace-nowrap'>
                                       {formatDate(email.date)}
                                    </span>
                                    <div className='flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:opacity-100'>
                                       <button 
                                          className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200'
                                          onClick={() => setShowMail(false)}
                                          title='Minimize' >
                                          <FiChevronDown size={16} />
                                       </button>
                                    </div>
                                 </div>
                              </div>
                              
                              <div className='text-gray-500 text-xs mt-1'>
                                 <span>to </span>
                                 <span className='text-gray-900'>{email.to}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Email Body */}
                  <div className='my-4 leading-relaxed text-gray-900 text-sm'>
                     {email.body ? (
                        <div 
                           className='prose prose-sm max-w-none [&_img]:max-w-full [&_img]:h-auto [&_table]:w-auto [&_table]:max-w-full [&_table]:border-collapse [&_td]:p-2 [&_td]:align-top [&_th]:p-2 [&_th]:align-top [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-700 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_blockquote]:ml-0 [&_blockquote]:italic [&_blockquote]:bg-gray-50 [&_blockquote]:p-3 [&_blockquote]:rounded [&_.gmail_quote]:border-l-3 [&_.gmail_quote]:border-gray-300 [&_.gmail_quote]:pl-3 [&_.gmail_quote]:ml-0 [&_.gmail_quote]:text-gray-600 [&_.gmail_quote]:bg-gray-50 [&_.gmail_quote]:mt-4 [&_.gmail_quote]:p-3 [&_.gmail_quote]:rounded'
                           style={{
                              contain: 'layout style',
                              isolation: 'isolate',
                              maxWidth: '100%',
                              overflowX: 'auto',
                              wordWrap: 'break-word',
                              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                           }}
                           dangerouslySetInnerHTML={{ __html: email.body }}
                        />
                     ) : (
                        <div className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                           {email.textBlocks?.join('\n') || 'No content available'}
                        </div>
                     )}
                  </div>

                  {/* Quoted Text Toggle */}
                  <div className='my-3'>
                     <button 
                        onClick={toggleQuote} 
                        className='text-blue-600 hover:text-blue-700 text-sm flex items-center transition-colors duration-200 bg-none border-0 p-0'
                     >
                        <span className='mr-2'>...</span>
                        <span>{showQuote ? 'Hide' : 'Show'} quoted text</span>
                     </button>
                  </div>

                  {/* Attachments */}
                  {email.attachments && email.attachments.length > 0 && (
                     <div className='mt-5 pt-4 border-t border-gray-100'>
                        <div className='flex items-center text-gray-500 text-sm font-medium mb-3'>
                           <FiPaperclip className='mr-2' size={16} />
                           <span>
                              {email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}
                           </span>
                        </div>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                           {email.attachments.map((attachment, attachIndex) => (
                              <AttachmentPreview 
                                 key={attachIndex} 
                                 attachment={attachment}
                              />
                           ))}
                        </div>
                     </div>
                  )}

               </div>
            ) : (
               <div 
                  className='p-3 md:p-4 cursor-pointer transition-colors duration-200 hover:bg-gray-50 group'
                  onClick={() => setShowMail(true)}
               >
                  <div className='flex items-center space-x-4'>
                     {/* Avatar */}
                     <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0'>
                        {extractSenderName(email.from).charAt(0).toUpperCase()}
                     </div>
                     
                     {/* Content */}
                     <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                           <div className='flex items-center space-x-2 min-w-0 flex-1'>
                              <span className='font-medium text-gray-900 text-sm truncate'>
                                 {extractSenderName(email.from)}
                              </span>
                              {email.attachments && email.attachments.length > 0 && (
                                 <FiPaperclip className='text-gray-400 flex-shrink-0' size={14} />
                              )}
                           </div>
                           <span className='text-gray-500 text-xs whitespace-nowrap'>
                              {formatDate(email.date)}
                           </span>
                        </div>
                        <div className='text-gray-500 text-sm mt-0.5 leading-snug line-clamp-2'>
                           {email.textBlocks?.join(' ').slice(0, 100) || 'No preview available'}...
                        </div>
                     </div>
                     
                     {/* Expand Icon */}
                     <FiChevronRight className='text-gray-400 flex-shrink-0 group-hover:text-gray-600 transition-colors duration-200' size={16} />
                  </div>
               </div>
            )}
         </div>
      );
   };

   if (loading) {
      return (
         <AuthLayout>
            <PageLoader message="Loading thread..." />
         </AuthLayout>
      );
   }

   if (error || !thread) {
      return (
         <AuthLayout>
            <div className='text-center py-12'>
               <div className='text-red-500 text-lg mb-4'>
                  {error || 'Thread not found'}
               </div>
               <Link 
                  to={`/account/${accountEmail}/threads/inbox`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700"
               >
                  <FiArrowLeft className="mr-1" size={16} />
                  Back to threads
               </Link>
            </div>
         </AuthLayout>
      );
   }

   return (
      <AuthLayout>
         <div className='mb-6'>
            <div className='flex items-center mb-4'>
               <Link 
                  to={`/account/${accountEmail}/threads/inbox`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 mr-4" >
                  <FiArrowLeft className="mr-1" size={16} />
                  Back to threads
               </Link>
            </div>
            
            <h1 className="heading text-2xl font-bold text-gray-900 mb-2">
               {thread.subject || 'No Subject'}
            </h1>
            
            <div className='flex items-center space-x-4 text-sm text-gray-600'>
               <span className='bg-blue-100 text-blue-600 px-2 py-1 rounded-full'>
                  {thread.emails?.length || 0} emails
               </span>
               <span>Thread ID: {threadId}</span>
            </div>
         </div>

         {/* Emails */}
         <div className="space-y-4">
            {thread.emails && thread.emails.length > 0 ? (
               thread.emails.map((email, index) => (
                  <EmailItem 
                     key={email._id || index} 
                     email={email} 
                     isLast={index === thread.emails.length - 1}
                     index={index}
                     totalEmails={thread.emails.length}
                  />
               ))
            ) : (
               <div className='text-center py-12'>
                  <div className='text-gray-500 text-lg mb-4'>
                     📭 No emails found in this thread
                  </div>
                  <p className='text-gray-400'>
                     This thread appears to be empty or the emails haven't loaded properly.
                  </p>
               </div>
            )}
         </div>
      </AuthLayout>
   );
}
