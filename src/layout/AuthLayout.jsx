import * as React from "react";
import CheckLogin from "../pages/auth/CheckLogin";
import Logo from "../pages/common/Logo";
import { UserContext } from "../context/AuthProvider";
import {Helmet} from "react-helmet";
import { MdOutlineLogout } from "react-icons/md";
import AddAccount from "../pages/account/AddAccount";


export default function AuthLayout({children, heading}) {

  const {user} = React.useContext(UserContext);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
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

          <header className="sticky top-0 !z-10 bg-white transition-opacity border-b border-gray-300 px-4 sm:px-6 md:px-7 py-3 xl:py-4 w-full">
            <div className="container flex flex-col sm:flex-row items-start sm:items-center w-full justify-between gap-3 sm:gap-0">
              <Logo /> 
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 lg:gap-8 items-start sm:items-center w-full sm:w-auto">
                {/* <Link to="/emails" className="text-black text-xl sm:text-2xl hover:text-blue-600 flex items-center font-bold">
                  <RiMailSendFill /><span className="ms-2 uppercase hidden sm:inline">Emails</span>
                </Link>
                <Link to="/chats" className="text-black text-xl sm:text-2xl hover:text-blue-600 flex items-center font-bold">
                  <BsChatSquareDotsFill /><span className="ms-2 uppercase hidden sm:inline">Chats</span>
                </Link> */}
                 
                <button onClick={logout} className='cursor-pointer text-black text-xl sm:text-2xl hover:text-blue-600 flex items-center font-bold'>
                  <MdOutlineLogout className='me-2 cursor-pointer' size={'1.8rem'} />
                  <span className="text-sm sm:hidden">Logout</span>
                </button>
                <div className="w-full sm:w-auto">
                  <AddAccount 
                    classes="btn btn-primary flex items-center w-full sm:w-auto justify-center text-sm px-4 py-2" 
                    text="Add Account"  
                  />
                </div>
              </div>
            </div>
          </header>
          <div className="content  w-full " >
            <div className="container py-12">
              {children}  
            </div>
            <CheckLogin />
          </div>
    </>
  );
}
