import { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import AccountApi from '../../api/AccountApi';
import { UserContext } from '../../context/AuthProvider';
import Popup from '../common/Popup';
import { IoMdAdd } from 'react-icons/io';

export default function AddAccount({item, fetchLists, classes, text}){

    const [data, setData] = useState({
      email:  item?.email || "",
    });

    const [action, setaction] = useState();
    const {Errors} = useContext(UserContext);

    const handleinput = (e) => {
      setData({ ...data, [e.target.name]: e.target.value});
    }

    const [loading, setLoading] = useState(false);
  
    const add_customer = async () => {
      setLoading(true);
      try {
        const response = await AccountApi.addAccount(data.email);
        
        if (response.status === true) {
          toast.success(response.message);
          // Refresh the accounts list
          if (fetchLists) {
            fetchLists();
          }
          setaction('close');
          setData({
            email:  "",
          });
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error('Add account error:', error);
        if (error.message) {
          toast.error(error.message);
        } else {
          Errors(error);
        }
      } finally {
        setLoading(false);
      }
    }
    

  return (
    <div>
      <Popup 
        action={action} 
        size="md:max-w-xl" 
        space='p-8' 
        bg="bg-white" 
        btnclasses={classes || "btn bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"} 
        btntext={text || (
          <>
            <IoMdAdd className="me-2" size={20}/> Add New Email
          </>
        )}
      >
         <div className='py-2'>
            <h2 className='text-black font-bold text-xl text-center mb-6'>Add New Account</h2>
            <div className='input-item'>
               <label className='block text-sm font-medium text-gray-700 mb-2'>
                 Email Address
               </label>
               <input 
                 name='email' 
                 onChange={handleinput} 
                 value={data.email}
                 type='email' 
                 placeholder="Enter new email address" 
                 className="input-sm w-full text-center border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
               />
            </div>
            <div className='flex justify-center items-center space-x-4 mt-6'>
               <button 
                 disabled={!data.email || data.email.trim() === "" || loading}  
                 onClick={add_customer} 
                 className={`${
                   (!data.email || data.email.trim() === "" || loading) 
                     ? "opacity-50 cursor-not-allowed bg-gray-300" 
                     : "bg-blue-600 hover:bg-blue-700 text-white"
                 } px-6 py-2 rounded-md font-medium transition-colors duration-200`}
               >
                 {loading ? "Adding..." : "Add Account"}
               </button>
            </div>
         </div>
      </Popup>
    </div>
  )
}
