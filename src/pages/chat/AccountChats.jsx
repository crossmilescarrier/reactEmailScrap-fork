import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/AuthLayout';
import AccountApi from '../../api/AccountApi';
import toast from 'react-hot-toast';
import { 
    FiMessageCircle, FiSearch, FiMoreVertical, FiRefreshCw, 
    FiUser, FiClock, FiArrowLeft, FiTrash2 
} from 'react-icons/fi';
import Loading, { PageLoader, ButtonLoader, ChatLoader, SkeletonLoader, useLoadingStates } from '../../components/Loading';
import ChatMessage from '../../components/ChatMessage';

export default function AccountChats() {
    const { accountEmail, chatId } = useParams();
    const navigate = useNavigate();
    
    const [account, setAccount] = useState(null);
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { setLoading: setSyncLoading, isLoading } = useLoadingStates();
    
    // Ref for auto-scrolling to the bottom of messages
    const messagesEndRef = useRef(null);
    
    // Scroll to bottom helper function
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Fetch chat list
    const fetchChats = async () => {
        try {
            setLoading(true);
            const response = await AccountApi.getChats(accountEmail);
            
            if (response.status === true) {
                setChats(response.data.chats);
                setAccount(response.data.account);
                
                // Auto-select first chat or the one from URL
                if (chatId) {
                    const selectedChat = response.data.chats.find(c => c._id === chatId);
                    if (selectedChat) {
                        setActiveChat(selectedChat);
                        fetchChatMessages(selectedChat._id);
                    }
                } else if (response.data.chats.length > 0) {
                    setActiveChat(response.data.chats[0]);
                    fetchChatMessages(response.data.chats[0]._id);
                }
            } else {
                toast.error(response.message || 'Failed to fetch chats');
            }
            
        } catch (error) {
            console.error('Error fetching chats:', error);
            toast.error('Failed to load chats');
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages for selected chat
    const fetchChatMessages = async (selectedChatId) => {
        try {
            setLoadingMessages(true);
            const response = await AccountApi.getChatMessages(accountEmail, selectedChatId);
            
            if (response.status === true) {
                setMessages(response.data.messages);
            } else {
                toast.error(response.message || 'Failed to fetch messages');
                setMessages([]);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setLoadingMessages(false);
        }
    };

    // Handle chat selection
    const handleChatSelect = (chat) => {
        setActiveChat(chat);
        navigate(`/account/${accountEmail}/chats/${chat._id}`);
        fetchChatMessages(chat._id);
    };

    // Handle sync with better state management
    const handleSync = async () => {
        console.log('🔄 Starting sync for account:', accountEmail);
        setSyncLoading('sync', true);
        
        try {
            const response = await AccountApi.syncChats(accountEmail);
            console.log('✅ Sync response:', response);
            
            if (response.status === true) {
                const syncedChats = response.data?.syncedChats || 0;
                const syncedMessages = response.data?.syncedMessages || 0;
                toast.success(`Chat sync completed: ${syncedChats} chats, ${syncedMessages} messages`);
                
                // Refresh chat list after successful sync
                await fetchChats();
            } else {
                const errorMessage = response.message || response.error || "Failed to sync chats";
                console.error('❌ Sync failed:', errorMessage);
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("❌ Sync error:", error);
            const errorMessage = error.message || error.toString() || "Failed to sync chats";
            toast.error(`Sync failed: ${errorMessage}`);
        } finally {
            // Ensure loading state is always cleared
            console.log('🔄 Clearing sync loading state');
            setSyncLoading('sync', false);
        }
    };

    // Handle clear all chats
    const handleClearAllChats = async () => {
        console.log('🗑️ Clear All Chats button clicked for account:', accountEmail);
        
        if (!window.confirm('Are you sure you want to clear ALL chats? This action cannot be undone.')) {
            console.log('❌ User cancelled clear all chats operation');
            return;
        }
        
        console.log('✅ User confirmed clear all chats operation');
        setSyncLoading('clearChats', true);
        
        try {
            console.log('🔄 Calling AccountApi.clearAllChats for:', accountEmail);
            const response = await AccountApi.clearAllChats(accountEmail);
            console.log('📤 Clear chats API response:', response);
            
            if (response.status === true) {
                console.log('✅ Clear chats successful:', response.data);
                toast.success(response.message || 'All chats cleared successfully');
                
                // Clear local state and refresh
                console.log('🧹 Clearing local state and refreshing chat list');
                setChats([]);
                setActiveChat(null);
                setMessages([]);
                await fetchChats(); // Refresh to show empty state
            } else {
                console.error('❌ Clear chats failed:', response.message);
                toast.error(response.message || 'Failed to clear chats');
            }
        } catch (error) {
            console.error('💥 Clear chats error:', error);
            console.error('💥 Error details:', {
                message: error.message,
                status: error.status,
                data: error.data,
                response: error.response
            });
            
            const errorMessage = error.message || error.data?.message || 'Failed to clear chats';
            toast.error(`Clear failed: ${errorMessage}`);
        } finally {
            console.log('🔄 Clearing loading state for clearChats');
            setSyncLoading('clearChats', false);
        }
    };

    // Format date for sidebar
    const formatSidebarDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (messageDate.getTime() === today.getTime()) {
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } else if (messageDate.getTime() === today.getTime() - (24 * 60 * 60 * 1000)) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    // Filter chats based on search
    const filteredChats = chats.filter(chat => 
        chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Auto-scroll when chat changes or messages update
    useEffect(() => {
        if (activeChat && messages.length > 0 && !loadingMessages) {
            // Small delay to ensure DOM has updated
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    }, [activeChat, messages, loadingMessages]);

    useEffect(() => {
        if (accountEmail) {
            fetchChats();
        }
    }, [accountEmail]);

    if (loading) {
        return (
            <AuthLayout>
                <Loading 
                    variant="spinner" 
                    size="lg" 
                    message="Loading chats..."
                    theme="light"
                    fullPage={true}
                />
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="flex border rounded-3xl overflow-hidden">
                {/* Sidebar - Chat List */}
                <div className="w-1/3 bg-gray-100 rounded-3xl border-r border-gray-200 flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => navigate(`/account/${accountEmail}/threads/inbox`)}
                                className="inline-flex items-center text-blue-600 hover:text-blue-700"
                            >
                                <FiArrowLeft className="mr-2" size={16} />
                                Back to Threads
                            </button>
                            
                            <div className="flex space-x-2">
                                <button
                                    onClick={(e) => {
                                        console.log('🔥🔥🔥 BUTTON CLICKED - Clear All Chats button was clicked!', {
                                            accountEmail,
                                            event: e,
                                            isLoading: isLoading('clearChats')
                                        });
                                        handleClearAllChats();
                                    }}
                                    disabled={isLoading('clearChats')}
                                    className={`cursor-pointer p-2 bg-red-100 text-red-600 hover:text-red-700 hover:bg-red-200 rounded-full transition-colors duration-200 ${
                                        isLoading('clearChats') ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    title="Clear All Chats"
                                >
                                    <FiTrash2 size={16} className={isLoading('clearChats') ? 'animate-pulse' : ''} />
                                </button>
                                
                                <button
                                    onClick={handleSync}
                                    disabled={isLoading('sync')}
                                    className={`p-2 bg-blue-100 text-blue-600 hover:text-blue-700 hover:bg-blue-300 rounded-full transition-colors duration-200 ${
                                        isLoading('sync') ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    title="Sync Chats"
                                >
                                    <FiRefreshCw size={16} className={isLoading('sync') ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        </div>
                        
                        <h1 className="text-xl font-semibold text-gray-900 mb-2">
                            💬 Chats
                        </h1>
                        <p className="text-sm text-gray-600 mb-4">
                            {account?.email}
                        </p>
                        
                        {/* Search */}
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search chats..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    
                    {/* Chat List */}
                    <div className="flex-1 chatlist  overflow-y-auto max-h-[45vh]">
                        {loading ? (
                            <div className="space-y-3 p-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <SkeletonLoader key={i} lines={2} height="h-4" className="p-4 border rounded-lg" />
                                ))}
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-500 text-lg mb-2">💬 No chats found</div>
                                <p className="text-gray-400 text-sm">
                                    {searchTerm ? 'Try a different search term' : 'No Google Chat or Hangouts conversations available'}
                                </p>
                            </div>
                        ) : (
                            filteredChats.map((chat) => (
                                <div
                                    key={chat._id}
                                    onClick={() => handleChatSelect(chat)}
                                    className={`px-6 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                        activeChat?._id === chat._id ? 'text-black bg-blue-100 border-r-2 border-r-blue-500' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                                            {chat.avatar}
                                        </div>
                                        
                                        {/* Chat Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {chat.title}
                                                </h3>
                                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                                    {formatSidebarDate(chat.lastMessageTime)}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-gray-600 truncate">
                                                    {chat.lastMessage}
                                                </p>
                                                {chat.unreadCount > 0 && (
                                                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">
                                                        {chat.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {chat.isGroup && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {chat.participants.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                {/* Main Panel - Chat Messages */}
                <div className="flex-1 flex flex-col chal panel  max-h-[70vh] overflow-y-auto ">
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                                            {activeChat.avatar}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                {activeChat.title}
                                            </h2>
                                            {activeChat.isGroup && (
                                                <p className="text-sm text-gray-600">
                                                    {activeChat.participants.length} participants
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Messages Area */}
                            <div className="messagelist flex-1  p-6 space-y-4">
                                {loadingMessages ? (
                                    <div className="flex flex-col space-y-4">
                                        <ChatLoader />
                                        <ChatLoader />
                                        <ChatLoader />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-gray-500 text-lg mb-2">💬 No messages</div>
                                        <p className="text-gray-400">This chat conversation is empty</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((message, messageIndex) => (
                                            <ChatMessage
                                                key={message._id}
                                                message={{ ...message, chatId: activeChat._id, messageIndex }}
                                                isOwn={message.from === accountEmail || message.isOwn}
                                                currentUserEmail={accountEmail}
                                            />
                                        ))}
                                        {/* Auto-scroll anchor */}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>
                            
                        </>
                    ) : (
                        /* No Chat Selected */
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiMessageCircle size={24} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Chat</h3>
                                <p className="text-gray-600">Choose a conversation from the sidebar to view messages</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthLayout>
    );
}
