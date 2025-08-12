import React, { useState, useEffect } from 'react';
import AuthLayout from '../../layout/AuthLayout';
import AccountItem from './AccountItem';
import AddAccount from './AddAccount';
import AccountApi from '../../api/AccountApi';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/Spinner';

export default function AllAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch accounts from API
    const fetchAccounts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await AccountApi.getAllAccounts();
            
            if (response.status === true) {
                setAccounts(response.accounts || []);
            } else {
                setError(response.message || 'Failed to fetch accounts');
                toast.error(response.message || 'Failed to fetch accounts');
            }
        } catch (err) {
            console.error('Error fetching accounts:', err);
            setError('Failed to load accounts');
            toast.error('Failed to load accounts');
        } finally {
            setLoading(false);
        }
    };

    // Load accounts on component mount
    useEffect(() => {
        fetchAccounts();
    }, []);

    // Loading state
    if (loading) {
        return (
            <AuthLayout>
                <div className='flex items-center justify-between mb-6'>
                    <h1 className='heading'>All Email Accounts</h1>
                </div>
                <PageLoader message="Loading accounts..." />
            </AuthLayout>
        );
    }

    // Error state
    if (error && !loading) {
        return (
            <AuthLayout>
                <div className='flex items-center justify-between mb-6'>
                    <h1 className='heading'>All Email Accounts</h1>
                    <AddAccount fetchLists={fetchAccounts} />
                </div>
                <div className='flex flex-col justify-center items-center py-12'>
                    <div className='text-red-600 text-lg mb-4'>⚠️ {error}</div>
                    <button 
                        onClick={fetchAccounts}
                        className='btn bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
                    >
                        Retry
                    </button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className='flex items-center justify-between mb-6'>
                <h1 className='heading'>All Email Accounts ({accounts.length})</h1>
                <AddAccount fetchLists={fetchAccounts} />
            </div>
            
            <div className='email-list'>
                {accounts.length === 0 ? (
                    <div className='text-center py-12'>
                        <div className='text-gray-500 text-lg mb-4'>
                            📧 No email accounts found
                        </div>
                        <p className='text-gray-400 mb-6'>
                            Add your first email account to get started with email management.
                        </p>
                        <AddAccount 
                            fetchLists={fetchAccounts} 
                            classes="btn bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                            text="Add Your First Account"
                        />
                    </div>
                ) : (
                    accounts.map((account) => (
                        <AccountItem 
                            key={account._id} 
                            account={account} 
                            fetchAccounts={fetchAccounts}
                        />
                    ))
                )}
            </div>
        </AuthLayout>
    );
}
