import React, { useState, useEffect } from 'react';
import { FiPlay, FiPause, FiRefreshCw, FiUsers, FiMessageSquare, FiSettings, FiClock } from 'react-icons/fi';
import Loading, { ButtonLoader, OverlayLoader, TableLoader, useLoadingStates } from './Loading';

const ChatDashboard = () => {
    const [syncStatus, setSyncStatus] = useState(null);
    const [userMappings, setUserMappings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setLoading: setActionLoading, isLoading } = useLoadingStates();

    // Fetch sync status and user mappings
    const fetchStatus = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Fetch sync status
            const statusResponse = await fetch('/api/chat-sync/status', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statusData = await statusResponse.json();
            
            if (statusData.status) {
                setSyncStatus(statusData.data);
            }
            
            // Fetch user mappings
            const mappingsResponse = await fetch('/api/user-mappings?limit=10', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const mappingsData = await mappingsResponse.json();
            
            if (mappingsData.status) {
                setUserMappings(mappingsData.data.userMappings);
            }
            
        } catch (error) {
            console.error('Error fetching chat dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Start chat sync scheduler
    const startScheduler = async () => {
        try {
            setActionLoading('startScheduler', true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/chat-sync/start', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cronExpression: '0 */6 * * *' }) // Every 6 hours
            });
            
            const data = await response.json();
            if (data.status) {
                fetchStatus(); // Refresh status
            } else {
                alert(data.message || 'Failed to start scheduler');
            }
        } catch (error) {
            console.error('Error starting scheduler:', error);
            alert('Error starting scheduler');
        } finally {
            setActionLoading('startScheduler', false);
        }
    };

    // Run sync now
    const runSyncNow = async () => {
        try {
            setActionLoading('syncNow', true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/chat-sync/run', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            if (data.status) {
                alert(data.message || 'Sync started successfully');
                // Refresh status after a delay
                setTimeout(() => {
                    fetchStatus();
                }, 5000);
            } else {
                alert(data.message || 'Failed to start sync');
            }
        } catch (error) {
            console.error('Error running sync:', error);
            alert('Error running sync');
        } finally {
            setActionLoading('syncNow', false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Never';
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <FiMessageSquare className="mr-3" />
                        Chat Management Dashboard
                    </h1>
                </div>
                <Loading 
                    variant="spinner" 
                    size="lg" 
                    message="Loading chat dashboard..."
                    theme="light"
                />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <FiMessageSquare className="mr-3" />
                    Chat Management Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                    Monitor and manage chat synchronization across all accounts
                </p>
            </div>

            {/* Scheduler Status Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <FiSettings className="mr-2" />
                            Sync Scheduler
                        </h2>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            syncStatus?.scheduler?.isRunning 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                            {syncStatus?.scheduler?.isRunning ? 'Running' : 'Stopped'}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Last Run:</span>
                                <p className="font-medium">{formatDate(syncStatus?.scheduler?.stats?.lastRun)}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Next Run:</span>
                                <p className="font-medium">{formatDate(syncStatus?.scheduler?.stats?.nextRun)}</p>
                            </div>
                        </div>
                        
                        <div className="flex space-x-3">
                            {!syncStatus?.scheduler?.isRunning ? (
                                <button
                                    onClick={startScheduler}
                                    disabled={isLoading('startScheduler')}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading('startScheduler') ? (
                                        <ButtonLoader size="sm" color="white" className="mr-2" />
                                    ) : (
                                        <FiPlay className="mr-2" />
                                    )}
                                    {isLoading('startScheduler') ? 'Starting...' : 'Start Scheduler'}
                                </button>
                            ) : (
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-600 transition-colors"
                                >
                                    <FiPause className="mr-2" />
                                    Stop Scheduler
                                </button>
                            )}
                            
                            <button
                                onClick={runSyncNow}
                                disabled={isLoading('syncNow')}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading('syncNow') ? (
                                    <ButtonLoader size="sm" color="white" className="mr-2" />
                                ) : (
                                    <FiRefreshCw className="mr-2" />
                                )}
                                {isLoading('syncNow') ? 'Syncing...' : 'Sync Now'}
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Statistics Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiUsers className="mr-2" />
                        Statistics
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <p className="text-2xl font-bold text-blue-600">
                                {syncStatus?.userMappings?.total || 0}
                            </p>
                            <p className="text-sm text-gray-500">Total User Mappings</p>
                        </div>
                        
                        <div>
                            <p className="text-2xl font-bold text-green-600">
                                {syncStatus?.scheduler?.stats?.totalAccountsSynced || 0}
                            </p>
                            <p className="text-sm text-gray-500">Accounts Synced</p>
                        </div>
                        
                        <div>
                            <p className="text-2xl font-bold text-purple-600">
                                {syncStatus?.scheduler?.stats?.totalChatsSynced || 0}
                            </p>
                            <p className="text-sm text-gray-500">Chats Synced</p>
                        </div>
                        
                        <div>
                            <p className="text-2xl font-bold text-orange-600">
                                {Math.round(syncStatus?.userMappings?.avgConfidence || 0)}%
                            </p>
                            <p className="text-sm text-gray-500">Avg Confidence</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Mappings Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <FiUsers className="mr-2" />
                        Recent User Mappings
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                        User ID to name mappings discovered during chat sync
                    </p>
                </div>
                
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-4">
                            <TableLoader rows={5} columns={4} showHeader={true} />
                        </div>
                    ) : userMappings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2">No user mappings found. Run a chat sync to populate data.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Resolved By
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Confidence
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {userMappings.map((mapping) => (
                                    <tr key={mapping._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm mr-3">
                                                    {mapping.displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {mapping.displayName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {mapping.userId.substring(0, 12)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {mapping.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                mapping.resolvedBy === 'admin_directory' ? 'bg-green-100 text-green-800' :
                                                mapping.resolvedBy === 'chat_members' ? 'bg-blue-100 text-blue-800' :
                                                mapping.resolvedBy === 'email_direct' ? 'bg-purple-100 text-purple-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {mapping.resolvedBy.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                mapping.confidence >= 90 ? 'text-green-600 bg-green-100' :
                                                mapping.confidence >= 70 ? 'text-yellow-600 bg-yellow-100' :
                                                'text-red-600 bg-red-100'
                                            }`}>
                                                {mapping.confidence}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatDashboard;
