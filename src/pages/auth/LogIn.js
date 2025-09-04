import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/AuthProvider";
import toast from "react-hot-toast";
import Logotext from "../common/Logotext";
import Api from "../../api/Api";
import CheckLogin from "./CheckLogin";

export default function Login() {
  
    const {Errors, user, setIsAuthenticated, setUser} = useContext(UserContext);
    function LoginForm(){

      const inputFields = [
        { type:"email", name :"email", label: "Enter your email" },
        { type:"password", name :"password", label: "Enter your password" },
      ];
        
      const [data, setData] = useState({
        email: "",
        password: "",
      });

      const handleinput = (e) => {
        setData({ ...data, [e.target.name]: e.target.value});
      }

      const [loading, setLoading] = useState(false);
      const navigate = useNavigate();
      function handleLogin(e) {
        e.preventDefault();
        if (data.email === "" || data.password === "") {
          toast.error("All fields are required.");
          return false
        }
        setLoading(true);
        const resp = Api.post(`/user/login`, data);
        resp.then((res) => {
          setLoading(false);
          if(res.data.status){
              localStorage.setItem("token", res.data.token);
              toast.success(res.data.message);
              setUser(res.data.user);
              setIsAuthenticated(true);
              navigate("/home");
          } else { 
            toast.error(res.data.message);
          }
        }).catch((err) => {
          setLoading(false);
          Errors(err);
        });
      }

      return (
        <>
        <form onSubmit={handleLogin} >
            {inputFields.map((field, index) => (
              <>
              <input required key={index} name={field.name} onChange={handleinput} type={field.type} placeholder={field.label} className="input" />
              </>
            ))}
            <div className="mt-2 flex justify-center">
              <button type="submit" onClick={handleLogin} className="btn lg mt-6 px-[50px] w-full lg:w-auto font-bold">{loading ? "Logging in..." : "Submit"}</button>
            </div>
          </form>
        </>
      );
    }

    return (
      <>
        <CheckLogin redirect={true} takeaction={true} />
        <div className="h-[100vh] overflow-hidden lg:flex justify-center items-center" >
          <div className="w-full h-screen  flex lg:block items-center lg:items-auto lg:h-auto lg:max-w-[50%]">
            <div className=" py-6">
              <div className="w-full py-8 max-w-[390px] lg:max-w-[600px] m-auto  lg:py-0 px-8 lg:px-5   text-slate-500">
                <div className="flex items-center justify-center">
                  <Link to="/" className="text-3xl font-mono font-bold  text-red-500 drunk lowercase">
                    <Logotext />
                  </Link>
                </div>
                <p className="text-black text-lg text-center mb-2 mt-6 ">Enter your credentials to login to your account </p>
                <div className="flex justify-center">
                  <div className='bg-[#000000] m-auto lg:m-0 h-[3px] w-[100px] mt-4'></div>
                </div>
                <main className="mt-8 " >
                    <LoginForm />
                </main> 
              </div>
            </div>
          </div>
        </div>
      </>
    );
}
