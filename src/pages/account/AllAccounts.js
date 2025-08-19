import React, { useState, useEffect } from 'react';
import AuthLayout from '../../layout/AuthLayout';
import AccountItem from './AccountItem';
import AddAccount from './AddAccount';
import AccountApi from '../../api/AccountApi';
import toast from 'react-hot-toast';
import Loading, { PageLoader, SkeletonLoader } from '../../components/Loading';
import { useDebounce } from '../../utils/debounce';
import { IoSearchOutline } from "react-icons/io5";

export default function AllAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Debounce search term with 300ms delay
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Fetch accounts from API
    const fetchAccounts = async (search = null) => {
        try {
            setLoading(true);
            setError(null);
            const response = await AccountApi.getAllAccounts(search);
            
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
    
    // Handle debounced search
    useEffect(() => {
        if (debouncedSearchTerm !== '') {
            fetchAccounts(debouncedSearchTerm);
        } else {
            fetchAccounts();
        }
    }, [debouncedSearchTerm]);

    // Loading state
    if (loading) {
        return (
            <AuthLayout>
                <div className='flex items-center justify-between mb-6'>
                    <h1 className='heading'>All Email Accounts</h1>
                </div>
                <Loading 
                    variant="spinner" 
                    size="lg" 
                    message="Loading accounts..."
                    theme="light"
                />
                <div className="mt-8 space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <SkeletonLoader key={i} lines={3} height="h-4" className="p-6 border rounded-lg bg-white" />
                    ))}
                </div>
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
                        className='btn bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'>
                        Retry
                    </button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6'>
                <h1 className='heading text-xl sm:text-2xl'>All Email Accounts ({accounts.length})</h1>
                <div className='search-account relative w-full sm:w-auto'>
                  <IoSearchOutline className="absolute top-4 left-3" />
                  <input 
                      type="text" 
                      placeholder="Search email accounts..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="focus:outline-none border border-gray-300 bg-gray-200 rounded-xl px-4 py-3 ps-[40px] w-full sm:w-64"
                  />
                </div>
                {/* <AddAccount fetchLists={fetchAccounts} /> */}
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
