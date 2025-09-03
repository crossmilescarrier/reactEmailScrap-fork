import * as React from "react";
import CheckLogin from "../pages/auth/CheckLogin";
import Logo from "../pages/common/Logo";
import { UserContext } from "../context/AuthProvider";
import {Helmet} from "react-helmet";
import { MdOutlineLogout } from "react-icons/md";
import { FiSettings } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import AddAccount from "../pages/account/AddAccount";


export default function AuthLayout({children, heading}) {

  const {user} = React.useContext(UserContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const goToSettings = () => {
    navigate('/admin/settings');
  };

  
  // const [windowWidth, setWindowWidth] = React.useState(window && window.innerWidth);
  // React.useEffect(() => {
  //   const handleResize = () => {
  //     setWindowWidth(window.innerWidth);
  //   };
  //   window.addEventListener("resize", handleResize);
  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []);

  const [toggle, setToggle] = React.useState(false);
  function showSidebar() {
   const Sidebar = document.getElementById("sidebar");
    Sidebar.classList.toggle("open");
    setToggle(!toggle);
  }
   
  return (
    <>
      <Helmet>
         <meta charSet="utf-8" />
         <title>{heading ? `${heading} | ` : '' } Cross Miles Carrier </title>
         <link rel="canonical" href={window.location.href || "https://runstream.co"} />
      </Helmet>

          <header className="sticky top-0 !z-10 bg-white transition-opacity border-b border-gray-300   py-3 xl:py-4 w-full">
            <div className="container">
              <div className="!flex items-center w-full justify-between gap-3">
                <Logo /> 
                <div className="flex  gap-5 items-start sm:items-center">
                    <button 
                      onClick={goToSettings} 
                      className='cursor-pointer  text-black text-xl sm:text-2xl hover:text-blue-600 flex items-center font-bold'
                      title="Admin Settings"
                    >
                      <FiSettings className='me-2 cursor-pointer' size={'1.8rem'} />
                      {/* <span className="text-sm sm:hidden">Settings</span> */}
                    </button>
                    
                    <button onClick={logout} className=' cursor-pointer text-black text-xl sm:text-2xl hover:text-blue-600 flex items-center font-bold'>
                      <MdOutlineLogout className='me-2 cursor-pointer' size={'1.8rem'} />
                      {/* <span className="text-sm sm:hidden">Logout</span> */}
                    </button>

                    <div className=" hidden sm:flex  w-full sm:w-auto">
                      <AddAccount 
                        classes="btn btn-primary flex items-center w-full sm:w-auto justify-center text-sm px-4 py-2" 
                        text="Add Account"  
                      />
                    </div>
                </div>
              </div>
            </div>
          </header>
          <div className="content  w-full " >
            <div className="container  py-4 sm:py-6 md:py-12">
              {children}  
            </div>
            <CheckLogin />
          </div>
    </>
  );
}
