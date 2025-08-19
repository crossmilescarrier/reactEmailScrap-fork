import React from 'react'
import { FiRefreshCw, FiMail, FiSend, FiClock, FiUser, FiArrowRight, FiInbox, FiMessageCircle, FiSearch, FiX } from 'react-icons/fi';

export default function ThreadEmailItem({thread}) {
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
  return (
    <>
      <div className='bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 ahover:border-blue-300 cursor-pointer'>
         <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0'>
               <div className='flex-1'>
                  <h3 className='font-semibold text-base sm:text-lg text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2'>
                     {thread.subject || '(No Subject)'}
                  </h3>
                  
                  <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3'>
                     <div className='flex items-center'>
                           <FiUser className="mr-1" size={14} />
                           <span className="truncate">From: {thread.from}</span>
                     </div>
                     <div className='flex items-center'>
                           <FiClock className="mr-1" size={14} />
                           <span>{formatDate(thread.date)}</span>
                     </div>
                  </div>
                  
                  <div className='text-xs sm:text-sm text-gray-500 mb-2 sm:mb-0'>
                     <span className="truncate">To: {thread.to}</span>
                  </div>
               </div>
               
               <div className='flex items-center justify-between sm:justify-end sm:flex-col gap-2'>
                  <span className='bg-blue-100 text-blue-600 px-2 py-1 text-xs rounded-full whitespace-nowrap'>
                     {thread.emailCount || 0} emails
                  </span>
                  <FiArrowRight className="text-gray-400 sm:hidden" size={16} />
                  <FiArrowRight className="text-gray-400 hidden sm:block" size={16} />
               </div>
         </div>
         
         {/* Show preview of emails in thread */}
         {thread.emails && thread.emails.length > 0 && (
               <div className='mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100'>
                  <div className='text-xs sm:text-sm text-gray-600'>
                     <div className='line-clamp-1'>
                           {thread.emails[0].textBlocks?.slice(0, 3).join(' ') || 
                           'No preview available'}
                     </div>
                  </div>
               </div>
         )}
      </div>
    </>
  )
}
