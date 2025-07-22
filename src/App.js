import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import UserContextProvider from './context/AuthProvider';
import Error404 from './404';
import Login from './pages/auth/LogIn';
import Emails from './pages/Emails';


function App() {
  return (
    <UserContextProvider>
        <div className="App">
              <BrowserRouter>
                <div className="routes">
                  <Routes>
                    {/* Public routes */}
                    {/* <Route path="/login" element={<Login />} /> */}
                    <Route path="/" element={<Emails />} />
                    <Route path="*" element={<Error404 />} /> 
                  </Routes>
                </div>
              </BrowserRouter>
              <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                containerClassName="toaster-container"
                containerStyle={{}}
                toastOptions={{
                  className: '',
                  duration: 2000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    theme: {
                      primary: 'green',
                      secondary: 'black',
                    },
                  },
                }}
              />
        </div>
    </UserContextProvider>
  );
}

export default App;
