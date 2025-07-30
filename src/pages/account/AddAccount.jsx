import { useContext, useState } from 'react'
import toast from 'react-hot-toast';
import Api from '../../api/Api';
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
  
    const add_customer = () => {
      setLoading(true);
      const respA = Api.post(`/account/add`, data);
      respA.then((res) => {
        setLoading(false);
        if (res.data.status === true) {
          toast.success(res.data.message);
         //  fetchLists && fetchLists();
          setaction('close');
          setData({
            email:  "",
          });
        } else {
          toast.error(res.data.message);
        }
      }).catch((err) => {
        setLoading(false);
        Errors(err);
      });
    }
    

  return (
    <div>
      <Popup action={action} size="md:max-w-xl" space='p-8' bg="bg-black" btnclasses={classes} btntext={<>
         <IoMdAdd className="me-2" size={20}/> Add New Email
         </>} >
         <div className='py-2'>
            <h2 className='text-black font-bold text-xl text-center'>Add New Account</h2>
            <div className='input-item'>
               <input name='email' onChange={handleinput} type={'email'} placeholder={"Enter new email address"} className="input-sm mt-6 text-center" />
            </div>
            <div className='flex justify-center items-center'>
               <button disabled={data.email === ""}  onClick={add_customer} className={`${data.email === "" ? "disabled" : ""} btn md mt-6 px-[50px] font-bold`}>{loading ? "Updating..." : "Submit"}</button>
            </div>
         </div>

      </Popup>
    </div>
  )
}
