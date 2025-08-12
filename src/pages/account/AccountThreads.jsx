import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/AuthLayout';
import AccountApi from '../../api/AccountApi';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiMail, FiSend, FiClock, FiUser, FiArrowRight, FiInbox } from 'react-icons/fi';
import { PageLoader, InlineSpinner } from '../../components/Spinner';
import useApiCall from '../../hooks/useApiCall';

export default function AccountThreads() {
    const { accountEmail } = useParams(); // Get account email from URL
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [activeTab, setActiveTab] = useState('INBOX');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });
    
    // Tab constants
    const tabs = ['INBOX', 'SENT', 'ALL'];

    // Fetch account threads
    const fetchThreads = async (labelType = activeTab, page = 1) => {
        try {
            setLoading(true);
            
            if (labelType === 'ALL') {
                // Fetch both INBOX and SENT, then merge results
                const [inboxResponse, sentResponse] = await Promise.all([
                    AccountApi.getAccountThreads(accountEmail, 'INBOX', page, pagination.limit / 2),
                    AccountApi.getAccountThreads(accountEmail, 'SENT', page, pagination.limit / 2)
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
                const response = await AccountApi.getAccountThreads(accountEmail, labelType, page, pagination.limit);
                
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
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        fetchThreads(tab, 1);
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

    // Load threads on component mount
    useEffect(() => {
        if (accountEmail) {
            fetchThreads();
        }
    }, [accountEmail]);

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
                <div className='flex items-center justify-between mb-6'>
                    <div>
                        <h1 className='heading text-2xl font-bold'>
                            {account?.email || 'Account'} - Email Threads
                        </h1>
                        <p className='text-gray-600 mt-1'>
                            View and manage your email conversations
                        </p>
                    </div>
                    
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                            syncing ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {syncing ? (
                            <>
                                <InlineSpinner color="white" className="mr-2" />
                                Syncing...
                            </>
                        ) : (
                            <>
                                <FiRefreshCw className="mr-2" size={16} />
                                Sync Emails
                            </>
                        )}
                    </button>
                </div>

                {/* Tabs */}
                <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6'>
                    <button
                        onClick={() => handleTabChange('INBOX')}
                        className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors duration-200 ${
                            activeTab === 'INBOX'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <FiMail className="mr-2" size={16} />
                        Primary Inbox
                        {activeTab === 'INBOX' && (
                            <span className='ml-2 bg-blue-100 text-blue-600 px-2 py-1 text-xs rounded-full'>
                                {pagination.total}
                            </span>
                        )}
                    </button>
                    
                    <button
                        onClick={() => handleTabChange('SENT')}
                        className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors duration-200 ${
                            activeTab === 'SENT'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <FiSend className="mr-2" size={16} />
                        Sent
                        {activeTab === 'SENT' && (
                            <span className='ml-2 bg-blue-100 text-blue-600 px-2 py-1 text-xs rounded-full'>
                                {pagination.total}
                            </span>
                        )}
                    </button>
                    
                    <button
                        onClick={() => handleTabChange('ALL')}
                        className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors duration-200 ${
                            activeTab === 'ALL'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <FiInbox className="mr-2" size={16} />
                        All Emails
                        {activeTab === 'ALL' && (
                            <span className='ml-2 bg-blue-100 text-blue-600 px-2 py-1 text-xs rounded-full'>
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
                            📭 No {activeTab === 'ALL' ? 'emails' : activeTab.toLowerCase()} emails found
                        </div>
                        <p className='text-gray-400 mb-6'>
                            {activeTab === 'INBOX' 
                                ? 'Your inbox is empty or emails haven\'t been synced yet.' 
                                : activeTab === 'SENT'
                                ? 'No sent emails found or emails haven\'t been synced yet.'
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
                    threads.map((thread) => (
                        <div
                            key={thread._id} 
                            onClick={() => navigate(`/account/${account.email}/thread/${thread._id}`)}
                            className='block cursor-pointer'
                        >
                            <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-blue-300 cursor-pointer'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex-1'>
                                        <h3 className='font-semibold text-lg text-gray-900 mb-2 hover:text-blue-600 transition-colors sm:line-clamp-2'>
                                            {thread.subject || '(No Subject)'}
                                        </h3>
                                        
                                        <div className='flex items-center space-x-4 text-sm text-gray-600 mb-3'>
                                            <div className='flex items-center'>
                                                <FiUser className="mr-1" size={14} />
                                                <span>From: {thread.from}</span>
                                            </div>
                                            <div className='flex items-center'>
                                                <FiClock className="mr-1" size={14} />
                                                <span>{formatDate(thread.date)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className='text-sm text-gray-500'>
                                            <span>To: {thread.to}</span>
                                        </div>
                                    </div>
                                    
                                    <div className='flex items-center space-x-2'>
                                        <span className='bg-blue-100 text-blue-600 px-2 py-1 text-xs rounded-full'>
                                            {thread.emailCount || 0} emails
                                        </span>
                                        <FiArrowRight className="text-gray-400" size={16} />
                                    </div>
                                </div>
                                
                                {/* Show preview of emails in thread */}
                                {thread.emails && thread.emails.length > 0 && (
                                    <div className='mt-4 pt-4 border-t border-gray-100'>
                                        <div className='text-sm text-gray-600'>
                                            <div className='sm:line-clamp-2'>
                                                {thread.emails[0].textBlocks?.slice(0, 3).join(' ') || 
                                                 'No preview available'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
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
