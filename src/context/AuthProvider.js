


import { createContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
export const UserContext = createContext(); 
export default function UserContextProvider(props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [company, setcompany] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Add token validation here - you can call your API to verify the token
          // For now, we'll assume the token is valid if it exists
          // TODO: Replace with actual API call to validate token
          // const response = await fetch('/api/auth/verify', {
          //   headers: { Authorization: `Bearer ${token}` }
          // });
          // if (response.ok) {
          //   const userData = await response.json();
          //   setUser(userData);
          //   setIsAuthenticated(true);
          // } else {
          //   localStorage.removeItem('token');
          //   setIsAuthenticated(false);
          // }
          
          // For now, trust the token exists
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData, token) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setcompany(null);
    setAdmin(null);
  };

  function Errors(error) { 
      console.error(error);
      const errors = error && error.response && error.response.data && error.response.data.errors;
      console.log("errors",errors)
      if (errors !== undefined ) {
        errors.map((m, i) => { 
          toast.error(m); 
        });
      } else {
          if(error && error.data && error.data.message !== undefined){ 
            toast.error(error.data.message);
          } 
      }
  }

  const values = {
    Errors,
    isAuthenticated, setIsAuthenticated,
    user, setUser,
    login, company, setcompany,
    logout, admin, setAdmin,
    loading
  };

    return <>
        <UserContext.Provider value={values} >
            {props.children}
        </UserContext.Provider>
    </>
}
 