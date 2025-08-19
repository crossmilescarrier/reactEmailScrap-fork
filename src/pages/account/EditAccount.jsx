import { useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AccountApi from '../../api/AccountApi';
import { UserContext } from '../../context/AuthProvider';
import Popup from '../common/Popup';
import { FiEdit } from 'react-icons/fi';

export default function EditAccount({ account, fetchAccounts, classes, text }) {
    const [data, setData] = useState({
        email: account?.email || "",
    });
    
    const [action, setAction] = useState();
    const [loading, setLoading] = useState(false);
    const { Errors } = useContext(UserContext);

    // Update local state when account prop changes
    useEffect(() => {
        if (account) {
            setData({
                email: account.email || "",
            });
        }
    }, [account]);

    const handleInput = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const editAccount = async () => {
        if (!account?._id) {
            toast.error("Account ID is required");
            return;
        }

        setLoading(true);
        try {
            const response = await AccountApi.editAccount(account._id, data.email);
            
            if (response.status === true) {
                toast.success(response.message);
                setAction('close');
                // Refresh the accounts list if function is provided
                if (fetchAccounts) {
                    fetchAccounts();
                }
            } else {
                toast.error(response.message || "Failed to update account");
            }
        } catch (error) {
            console.error("Edit account error:", error);
            if (error.message) {
                toast.error(error.message);
            } else {
                Errors(error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Reset form when closing
        setData({
            email: account?.email || "",
        });
        setAction('close');
    };

    return (
        <div>
            <Popup 
                action={action} 
                size="md:max-w-xl" 
                space='p-8' 
                bg="bg-white" 
                btnclasses={classes || "text-blue-600 hover:text-blue-800"} 
                btntext={
                    <> {text || "Edit"} </>
                }
                onClose={handleClose}
            >
                <div className='py-2'>
                    <h2 className='text-black font-bold text-xl text-center mb-6'>
                        Edit Account
                    </h2>
                    <div className='input-item'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Email Address
                        </label>
                        <input 
                            name='email' 
                            onChange={handleInput} 
                            value={data.email}
                            type='email' 
                            placeholder="Enter email address" 
                            className="input-sm w-full text-center border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        />
                    </div>
                    
                    <div className='flex justify-center items-center space-x-4 mt-6'>
                        <button 
                            onClick={handleClose}
                            className="btn-secondary px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button 
                            disabled={!data.email || data.email.trim() === "" || loading}  
                            onClick={editAccount} 
                            className={`${
                                (!data.email || data.email.trim() === "" || loading) 
                                    ? "opacity-50 cursor-not-allowed bg-gray-300" 
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                            } px-6 py-2 rounded-md font-medium transition-colors duration-200`}
                        >
                            {loading ? "Updating..." : "Update Account"}
                        </button>
                    </div>
                </div>
            </Popup>
        </div>
    );
}
