import { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import AccountApi from '../../api/AccountApi';
import { UserContext } from '../../context/AuthProvider';
import Popup from '../common/Popup';
import { IoMdAdd } from 'react-icons/io';
import { ButtonLoader } from '../../components/Loading';

export default function AddAccount({item, fetchLists, classes, text}){

    const [data, setData] = useState({
      email:  item?.email || "",
    });

    const [action, setaction] = useState();
    const [emailError, setEmailError] = useState("");
    const {Errors} = useContext(UserContext);

    const handleinput = (e) => {
      const email = e.target.value;
      setData({ ...data, [e.target.name]: email});
      
      // Validate domain if email is not empty
      if (email.trim() !== "") {
        const valid = /^[^\s@]+@crossmilescarrier\.com$/i.test(email);
        if (!valid) {
          setEmailError("Only crossmilescarrier.com emails allowed");
        } else {
          setEmailError("");
        }
      } else {
        setEmailError("");
      }
    }

    const [loading, setLoading] = useState(false);
  
    const add_customer = async () => {
      // Validate domain before making API call
      const valid = /^[^\s@]+@crossmilescarrier\.com$/i.test(data.email);
      if (!valid) {
        setEmailError("Only crossmilescarrier.com emails allowed");
        toast.error('Only crossmilescarrier.com emails allowed');
        return;
      }
      
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
          setEmailError("");
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
        size="w-full max-w-md sm:max-w-lg md:max-w-xl" 
        space='p-4 sm:p-6 md:p-8' 
        bg="bg-white" 
        btnclasses={classes || "btn bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"} 
        btntext={text || (
          <>
            <IoMdAdd className="me-1 sm:me-2" size={18}/> 
            <span className="hidden sm:inline">Add New </span>Email
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
                 className={`input-sm w-full text-center border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent ${
                   emailError 
                     ? "border-red-500 focus:ring-red-500" 
                     : "border-gray-300 focus:ring-blue-500"
                 }`}
               />
               {emailError && (
                 <p className="text-red-500 text-sm mt-1 text-center">{emailError}</p>
               )}
            </div>
            <div className='flex justify-center items-center space-x-4 mt-6'>
               <button 
                 disabled={!data.email || data.email.trim() === "" || emailError || loading}  
                 onClick={add_customer} 
                 className={`${
                   (!data.email || data.email.trim() === "" || emailError || loading) 
                     ? "opacity-50 cursor-not-allowed bg-gray-300" 
                     : "bg-blue-600 hover:bg-blue-700 text-white"
                 } px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2`}
               >
                 {loading && <ButtonLoader size="sm" color="white" />}
                 <span>{loading ? "Adding Account..." : "Add Account"}</span>
               </button>
            </div>
         </div>
      </Popup>
    </div>
  )
}
