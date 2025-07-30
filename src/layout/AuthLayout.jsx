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

          <header className=" sticky top-0 bg-white transition-opacity border-b border-gray-300 px-6 md:px-7 py-2 xl:py-4 w-full">
            <div className="container flex items-center w-full justify-between">
              <Logo /> 
              <div className="flex gap-8 items-center">
                {/* <Link to="/emails" className="text-black text-2xl hover:text-blue-600 flex items-center font-bold">
                  <RiMailSendFill /><span className="ms-2 uppercase">Emails</span>
                </Link>
                <Link to="/chats" className="text-black text-2xl hover:text-blue-600 flex items-center font-bold">
                  <BsChatSquareDotsFill /><span className="ms-2 uppercase">Chats</span>
                </Link> */}
                 
                <AddAccount classes="btn btn-primary flex items-center" text="Add New Account"  />
                <button onClick={logout} className='cursor-pointer text-black text-2xl hover:text-blue-600 flex items-center font-bold'  >
                  <MdOutlineLogout  className='me-2 cursor-pointer' size={'2.3rem'} />
                </button>
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
