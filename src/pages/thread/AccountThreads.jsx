import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/AuthLayout';
import AccountApi from '../../api/AccountApi';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiMail, FiSend, FiClock, FiUser, FiArrowRight, FiInbox, FiMessageCircle, FiSearch, FiX, FiTrash2 } from 'react-icons/fi';
import { PageLoader, InlineSpinner } from '../../components/Spinner';
import ChatMessage from '../../components/ChatMessage';
import useApiCall from '../../hooks/useApiCall';
import { useDebounce } from '../../utils/debounce';
import ThreadEmailItem from './ThreadEmailItem';

export default function AccountThreads() {
    const { accountEmail, tab } = useParams(); // Get account email and tab from URL
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [clearingEmails, setClearingEmails] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Debounce search term with 300ms delay
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    
    // Map URL tab to label type, default to INBOX
    const getTabFromUrl = (urlTab) => {
        const tabMap = {
            'inbox': 'INBOX',
            'sent': 'SENT',
            'all': 'ALL',
            'chats': 'CHATS'
        };
        return tabMap[urlTab?.toLowerCase()] || 'INBOX';
    };
    
    const [activeTab, setActiveTab] = useState(getTabFromUrl(tab));
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });
    
    // Tab constants
    const tabs = ['INBOX', 'SENT', 'ALL', 'CHATS'];

    // Fetch account threads
    const fetchThreads = async (labelType = activeTab, page = 1, query = null) => {
        try {
            setLoading(true);
            
            if (labelType === 'CHATS') {
                // For now, show placeholder for chat functionality
                // In future, this would call a dedicated chat API endpoint
                // For demo purposes, we'll use sample chat data
                const sampleChatData = [
                    {
                        _id: 'chat1',
                        subject: 'Team Discussion',
                        from: 'John Doe <john@company.com>',
                        to: accountEmail,
                        date: new Date().toISOString(),
                        isChat: true,
                        messages: [
                            {
                                _id: 'msg1',
                                from: 'John Doe <john@company.com>',
                                body: 'Hey team, how are we doing with the project?',
                                date: new Date(Date.now() - 3600000).toISOString(),
                                isOwn: false
                            },
                            {
                                _id: 'msg2',
                                from: accountEmail,
                                body: 'We are making good progress! Just finishing up the final touches.',
                                date: new Date(Date.now() - 1800000).toISOString(),
                                isOwn: true
                            },
                            {
                                _id: 'msg3',
                                from: 'Jane Smith <jane@company.com>',
                                body: 'Great work everyone! Let me know if you need any help.',
                                date: new Date(Date.now() - 900000).toISOString(),
                                isOwn: false
                            }
                        ]
                    },
                    {
                        _id: 'chat2',
                        subject: 'Quick Question',
                        from: 'Sarah Wilson <sarah@company.com>',
                        to: accountEmail,
                        date: new Date(Date.now() - 7200000).toISOString(),
                        isChat: true,
                        messages: [
                            {
                                _id: 'msg4',
                                from: 'Sarah Wilson <sarah@company.com>',
                                body: 'Hi! Do you have a minute to discuss the new requirements?',
                                date: new Date(Date.now() - 7200000).toISOString(),
                                isOwn: false
                            },
                            {
                                _id: 'msg5',
                                from: accountEmail,
                                body: 'Sure! I can chat now. What do you need to know?',
                                date: new Date(Date.now() - 6900000).toISOString(),
                                isOwn: true
                            }
                        ]
                    }
                ];
                
                setThreads(sampleChatData);
                setAccount({ email: accountEmail });
                setPagination({
                    page: 1,
                    limit: pagination.limit,
                    total: sampleChatData.length,
                    pages: 1
                });
                setLoading(false);
                return;
            } else if (labelType === 'ALL') {
                // Fetch both INBOX and SENT, then merge results
                const [inboxResponse, sentResponse] = await Promise.all([
                    AccountApi.getAccountThreads(accountEmail, 'INBOX', page, pagination.limit / 2, query),
                    AccountApi.getAccountThreads(accountEmail, 'SENT', page, pagination.limit / 2, query)
                ]);
                
                if (inboxResponse.status === true && sentResponse.status === true) {
                    setAccount(inboxResponse.data.account || sentResponse.data.account);
                    
                    // Merge and sort threads by date (most recent first)
                    const allThreads = [...inboxResponse.data.threads, ...sentResponse.data.threads]
                        .sort((a, b) => new Date(b.date) - new Date(a.date));
                    
                    setThreads(allThreads);
                    
                    // Merge pagination data
                    const totalThreads = inboxResponse.data.pagination.total + sentResponse.data.pagination.total;
                    const totalPages = Math.ceil(totalThreads / pagination.limit);
                    
                    setPagination({
                        page: page,
                        limit: pagination.limit,
                        total: totalThreads,
                        pages: totalPages
                    });
                } else {
                    toast.error('Failed to fetch all threads');
                }
            } else {
                // Fetch single label type
                const response = await AccountApi.getAccountThreads(accountEmail, labelType, page, pagination.limit, query);
                
                if (response.status === true) {
                    setAccount(response.data.account);
                    setThreads(response.data.threads);
                    setPagination(response.data.pagination);
                } else {
                    toast.error(response.message || 'Failed to fetch threads');
                }
            }
        } catch (error) {
            console.error('Error fetching threads:', error);
            toast.error('Failed to load threads');
        } finally {
            setLoading(false);
        }
    };

    // Handle tab change
    const handleTabChange = (newTab) => {
        // If CHATS tab is selected, navigate to dedicated chat page
        if (newTab === 'CHATS') {
            navigate(`/account/${accountEmail}/chats`);
            return;
        }
        
        // Reset search term when switching tabs
        setSearchTerm('');
        setActiveTab(newTab);
        
        // Update URL based on tab
        const tabUrlMap = {
            'INBOX': 'inbox',
            'SENT': 'sent', 
            'ALL': 'all'
        };
        
        const urlTab = tabUrlMap[newTab];
        navigate(`/account/${accountEmail}/threads/${urlTab}`, { replace: true });
        fetchThreads(newTab, 1);
    };

    // Handle sync
    const handleSync = async () => {
        setSyncing(true);
        try {
            const response = await AccountApi.syncAccount(accountEmail);
            
            if (response.status === true) {
                toast.success(`Sync completed: ${response.data.total} emails processed`);
                // Refresh threads after sync
                fetchThreads(activeTab, pagination.page);
            } else {
                toast.error(response.message || "Failed to sync account");
            }
        } catch (error) {
            console.error("Sync error:", error);
            toast.error(error.message || "Failed to sync account");
        } finally {
            setSyncing(false);
        }
    };

    // Handle clear all emails
    const handleClearAllEmails = async () => {
        if (!window.confirm('Are you sure you want to clear ALL emails? This action cannot be undone.')) {
            return;
        }
        
        setClearingEmails(true);
        try {
            const response = await AccountApi.clearAllEmails(accountEmail);
            
            if (response.status === true) {
                toast.success(response.message || 'All emails cleared successfully');
                // Refresh threads after clearing
                fetchThreads(activeTab, 1); // Reset to first page
            } else {
                toast.error(response.message || 'Failed to clear emails');
            }
        } catch (error) {
            console.error('Clear emails error:', error);
            toast.error(error.message || 'Failed to clear emails');
        } finally {
            setClearingEmails(false);
        }
    };

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

    // Update active tab when URL parameter changes
    useEffect(() => {
        const newTab = getTabFromUrl(tab);
        if (newTab !== activeTab) {
            setActiveTab(newTab);
        }
    }, [tab]);
    
    // Load threads on component mount or when tab changes
    useEffect(() => {
        if (accountEmail) {
            fetchThreads(activeTab, 1, debouncedSearchTerm || null);
        }
    }, [accountEmail, activeTab]);
    
    // Handle debounced search
    useEffect(() => {
        if (accountEmail) {
            fetchThreads(activeTab, 1, debouncedSearchTerm || null);
        }
    }, [debouncedSearchTerm]);

    if (loading && threads.length === 0) {
        return (
            <AuthLayout>
                <PageLoader message="Loading threads..." />
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className='mb-6'>
                {/* Header */}
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6'>
                    <div className='flex-1'>
                        <h1 className='heading text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3'>
                            Email Threads
                        </h1>
                        <h1 className='heading text-base sm:text-lg lg:text-xl font-bold break-all'>
                            {account?.email || 'Account'} 
                        </h1>
                        <p className='text-gray-600 mt-1 text-sm sm:text-base'>
                            View and manage your email conversations
                        </p>
                    </div>
                    
                    <div className="flex space-x-3 w-full sm:w-auto">
                        {/* Clear All Emails Button - Only show for email tabs */}
                        {activeTab !== 'CHATS' && (
                            <button
                                onClick={handleClearAllEmails}
                                disabled={clearingEmails}
                                className={`flex items-center btn bg-red-800 hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base px-4 sm:px-4 py-2 sm:py-3 flex-1 sm:flex-none justify-center ${
                                    clearingEmails ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {clearingEmails ? (
                                    <>
                                        <InlineSpinner color="white" className="mr-2" />
                                        <span className="hidden sm:inline">Clearing...</span>
                                        <span className="sm:hidden">Clear...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 className="mr-2" size={16} />
                                        <span className="hidden sm:inline">Clear All</span>
                                        <span className="sm:hidden">Clear</span>
                                    </>
                                )}
                            </button>
                        )}
                        
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className={`flex items-center btn hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 flex-1 sm:flex-none justify-center ${
                                syncing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {syncing ? (
                                <>
                                    <InlineSpinner color="white" className="mr-2" />
                                    <span className="hidden sm:inline">Syncing...</span>
                                    <span className="sm:hidden">Sync...</span>
                                </>
                            ) : (
                                <>
                                    <FiRefreshCw className="mr-2" size={16} />
                                    <span className="hidden sm:inline">Re-Sync Emails</span>
                                    <span className="sm:hidden">Sync</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Search Input */}
                <div className='mb-6  bg-white z-10'>
                    <div className='relative'>
                        <input
                            type="text"
                            placeholder="Search by message-ID, sender, recipient or content…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 pl-10 pr-12 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Clear search"
                            >
                                <FiX size={16} />
                            </button>
                        )}
                    </div>
                    
                    {/* Search Results Badge */}
                    {searchTerm && (
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-3">
                                <span className="bg-blue-100 text-blue-600 px-3 py-1 text-sm rounded-full font-medium">
                                    {pagination.total} {pagination.total === 1 ? 'result' : 'results'} found
                                </span>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors"
                                >
                                    Clear search
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 bg-gray-100 p-3 rounded-2xl mb-6'>
                    <button
                        onClick={() => handleTabChange('INBOX')}
                        className={`flex-1 flex items-center justify-center px-3 sm:px-4 py-3 rounded-2xl transition-colors duration-200 text-xs sm:text-sm ${
                            activeTab === 'INBOX'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <FiMail className="mr-1 sm:mr-2" size={14} />
                        <span className="hidden sm:inline me-2">Primary </span>Inbox
                        {activeTab === 'INBOX' && (
                            <span className='ml-1 sm:ml-2 bg-blue-100 text-blue-600 px-2 py-1 text-xs rounded-full'>
                                {pagination.total}
                            </span>
                        )}
                    </button>
                    
                    <button
                        onClick={() => handleTabChange('SENT')}
                        className={`flex-1 flex items-center justify-center px-3 sm:px-4 py-3 rounded-2xl transition-colors duration-200 text-xs sm:text-sm ${
                            activeTab === 'SENT'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <FiSend className="mr-1 sm:mr-2" size={14} />
                        Sent
                        {activeTab === 'SENT' && (
                            <span className='ml-1 sm:ml-2 bg-blue-100 text-blue-600 px-2 py-1 text-xs rounded-full'>
                                {pagination.total}
                            </span>
                        )}
                    </button>
                    
                    <button
                        onClick={() => handleTabChange('ALL')}
                        className={`flex-1 flex items-center justify-center px-3 sm:px-4 py-3 rounded-2xl transition-colors duration-200 text-xs sm:text-sm ${
                            activeTab === 'ALL'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <FiInbox className="mr-1 sm:mr-2" size={14} />
                        <span className="hidden sm:inline">All </span>Emails
                        {activeTab === 'ALL' && (
                            <span className='ml-1 sm:ml-2 bg-blue-100 text-blue-600 px-2 py-1 text-xs rounded-full'>
                                {pagination.total}
                            </span>
                        )}
                    </button>
                    
                    <button
                        onClick={() => handleTabChange('CHATS')}
                        className={`flex-1 flex items-center justify-center px-3 sm:px-4 py-3 rounded-2xl transition-colors duration-200 text-xs sm:text-sm ${
                            activeTab === 'CHATS'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <FiMessageCircle className="mr-1 sm:mr-2" size={14} />
                        Chats
                        {activeTab === 'CHATS' && (
                            <span className='ml-1 sm:ml-2 bg-blue-100 text-blue-600 px-2 py-1 text-xs rounded-full'>
                                {pagination.total}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Threads List */}
            <div className='space-y-4'>
                {loading && threads.length > 0 && (
                    <div className='text-center py-4'>
                        <div className="inline-flex items-center">
                            <InlineSpinner color="blue" className="mr-2" />
                            Loading...
                        </div>
                    </div>
                )}

                {threads.length === 0 && !loading ? (
                    <div className='text-center py-12'>
                        <div className='text-gray-500 text-lg mb-4'>
                            {activeTab === 'CHATS' ? '💬 No chats found' : `📭 No ${activeTab === 'ALL' ? 'emails' : activeTab.toLowerCase()} emails found`}
                        </div>
                        <p className='text-gray-400 mb-6'>
                            {activeTab === 'INBOX' 
                                ? 'Your inbox is empty or emails haven\'t been synced yet.' 
                                : activeTab === 'SENT'
                                ? 'No sent emails found or emails haven\'t been synced yet.'
                                : activeTab === 'CHATS'
                                ? 'No Google Chat or Hangouts messages found. Chat sync is coming soon.'
                                : 'No emails found or emails haven\'t been synced yet.'}
                        </p>
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                        >
                            {syncing ? 'Syncing...' : 'Sync Now'}
                        </button>
                    </div>
                ) : (
                    activeTab === 'CHATS' ? (
                        // Chat-like interface for CHATS tab
                        threads.map((thread) => (
                            <div key={thread._id} className='bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden'>
                                {/* Chat header */}
                                <div className='bg-gray-50 px-6 py-4 border-b border-gray-200'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <h3 className='font-semibold text-gray-900 text-lg'>
                                                💬 {thread.subject || 'Chat Conversation'}
                                            </h3>
                                            <p className='text-sm text-gray-600 mt-1'>
                                                {thread.messages?.length || 0} messages • {formatDate(thread.date)}
                                            </p>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <span className='bg-green-100 text-green-600 px-2 py-1 text-xs rounded-full'>
                                                Chat
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Chat messages */}
                                <div className='p-6 max-h-96 overflow-y-auto'>
                                    {thread.messages && thread.messages.length > 0 ? (
                                        thread.messages.map((message) => (
                                            <ChatMessage 
                                                key={message._id}
                                                message={message}
                                                isOwn={message.from === accountEmail || message.isOwn}
                                            />
                                        ))
                                    ) : (
                                        <div className='text-center text-gray-500 py-8'>
                                            No messages in this chat
                                        </div>
                                    )}
                                </div>
                                
                                {/* Chat input placeholder (read-only) */}
                                <div className='bg-gray-50 px-6 py-4 border-t border-gray-200'>
                                    <div className='flex items-center space-x-3'>
                                        <div className='flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-gray-500 cursor-not-allowed'>
                                            Message (read-only)
                                        </div>
                                        <button 
                                            disabled
                                            className='bg-gray-300 text-gray-500 px-4 py-2 rounded-full cursor-not-allowed'
                                        >
                                            Send
                                        </button>
                                    </div>
                                    <p className='text-xs text-gray-500 mt-2 text-center'>
                                        Chat messages are read-only. No replies can be sent.
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Regular email thread interface
                        threads.map((thread) => (
                            <Link 
                                to={`/account/${account.email}/thread/${thread._id}`}
                                key={thread._id} 
                                className='block cursor-pointer' >
                                <ThreadEmailItem thread={thread} />
                            </Link>
                        ))
                    )
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className='flex items-center justify-center space-x-2 mt-8'>
                    <button
                        onClick={() => fetchThreads(activeTab, pagination.page - 1)}
                        disabled={pagination.page <= 1 || loading}
                        className='px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        Previous
                    </button>
                    
                    <span className='px-3 py-2 text-sm text-gray-600'>
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    
                    <button
                        onClick={() => fetchThreads(activeTab, pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages || loading}
                        className='px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        Next
                    </button>
                </div>
            )}
        </AuthLayout>
    );
}
