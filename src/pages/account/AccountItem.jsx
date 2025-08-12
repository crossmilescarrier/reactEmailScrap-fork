import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiEdit, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AccountApi from '../../api/AccountApi';
import EditAccount from './EditAccount';
import { InlineSpinner } from '../../components/Spinner';

export default function AccountItem({ account, fetchAccounts }) {
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    
    if (!account) return null;
    
    // Format dates for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Not available';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    
    // Format last sync time
    const formatLastSync = (dateString) => {
        if (!dateString) return 'Never synced';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        }
    };
    
    const handleSync = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        setSyncing(true);
        try {
            const response = await AccountApi.syncAccount(account._id);
            
            if (response.status === true) {
                toast.success(`Sync completed: ${response.data.total} emails processed`);
                // Refresh the accounts list to update lastSync time
                if (fetchAccounts) {
                    fetchAccounts();
                }
            } else {
                toast.error(response.message || "Failed to sync account");
            }
        } catch (error) {
            console.error("Sync account error:", error);
            toast.error(error.message || "Failed to sync account");
        } finally {
            setSyncing(false);
        }
    };
    
    const handleDelete = async (e) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();
        
        if (!window.confirm(`Are you sure you want to delete the account "${account.email}"? This action cannot be undone.`)) {
            return;
        }
        
        setLoading(true);
        try {
            const response = await AccountApi.deleteAccount(account._id);
            
            if (response.status === true) {
                toast.success(response.message);
                // Refresh the accounts list
                if (fetchAccounts) {
                    fetchAccounts();
                }
            } else {
                toast.error(response.message || "Failed to delete account");
            }
        } catch (error) {
            console.error("Delete account error:", error);
            toast.error(error.message || "Failed to delete account");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className='email-item flex items-center justify-between p-6 bg-gray-200 hover:bg-gray-300 rounded-[20px] mb-4 relative'>
            <Link 
                to={`/account/${account.email}/threads`} 
                className='flex-1 flex items-center justify-between'
            >
                <div>
                    <h2 className='font-bold text-2xl text-gray-800'>{account.email}</h2>
                    <div className='mt-3 flex'>
                        <p className='me-4 text-gray-600'>Last synced: {formatLastSync(account.lastSync)}</p>
                        <p className='text-gray-600'>Added on: {formatDate(account.createdAt)}</p>
                    </div>
                </div>
                <span className='bg-green-700 text-white py-1 px-3 text-sm rounded-full'>
                    Active
                </span>
            </Link>
            
            {/* Action buttons */}
            <div className='flex items-center space-x-2 ml-4'>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className={`p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-md transition-colors duration-200 ${
                        syncing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Sync Emails"
                >
                    {syncing ? (
                        <InlineSpinner color="green" />
                    ) : (
                        <FiRefreshCw size={16} />
                    )}
                </button>
                
                <EditAccount 
                    account={account}
                    fetchAccounts={fetchAccounts}
                    classes="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors duration-200"
                    text={<FiEdit size={16} />}
                />
                
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className={`p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors duration-200 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Delete Account"
                >
                    {loading ? (
                        <InlineSpinner color="red" />
                    ) : (
                        <FiTrash2 size={16} />
                    )}
                </button>
            </div>
        </div>
    );
}
