import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import UserContextProvider from './context/AuthProvider';
import Error404 from './404';
import Login from './pages/auth/LogIn';
import Emails from './pages/Emails';
import Chats from './pages/Chats';
import AllAccounts from './pages/account/AllAccounts';
import ThreadDetail from './pages/thread/ThreadDetail';
import AccountThreads from './pages/thread/AccountThreads';
import AccountChats from './pages/chat/AccountChats';
import Unauthorized from './components/Unauthorized';
import PrivateRoute from './components/PrivateRoute';
import ChatMessageDebug from './components/ChatMessageDebug';
import ChatMessageTest from './components/ChatMessageTest';
import MediaPreviewTest from './components/MediaPreviewTest';
import MediaDebugTest from './components/MediaDebugTest';


function App() {
  return (
    <UserContextProvider>
        <div className="App">
              <BrowserRouter>
                <div className="routes">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/debug-media" element={<ChatMessageDebug />} />
                    <Route path="/test-chat" element={<ChatMessageTest />} />
                    <Route path="/test-media-preview" element={<MediaPreviewTest />} />
                    <Route path="/media-debug" element={<MediaDebugTest />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={
                      <PrivateRoute>
                        <AllAccounts />
                      </PrivateRoute>
                    } />
                    
                    <Route path="/home" element={
                      <PrivateRoute>
                        <AllAccounts />
                      </PrivateRoute>
                    } />

                    <Route path="/account/:accountEmail/threads" element={
                      <PrivateRoute>
                        <AccountThreads />
                      </PrivateRoute>
                    } />

                    <Route path="/account/:accountEmail/threads/:tab" element={
                      <PrivateRoute>
                        <AccountThreads />
                      </PrivateRoute>
                    } />

                    <Route path="/emails" element={
                      <PrivateRoute>
                        <Emails />
                      </PrivateRoute>
                    } />

                    <Route path="/account/:accountEmail/thread/:threadId" element={
                      <PrivateRoute>
                        <ThreadDetail />
                      </PrivateRoute>
                    } />

                    <Route path="/account/:accountEmail/chats" element={
                      <PrivateRoute>
                        <AccountChats />
                      </PrivateRoute>
                    } />

                    <Route path="/account/:accountEmail/chats/:chatId" element={
                      <PrivateRoute>
                        <AccountChats />
                      </PrivateRoute>
                    } />

                    <Route path="/chats" element={
                      <PrivateRoute>
                        <Chats />
                      </PrivateRoute>
                    } />

                    {/* Catch all - 404 */}
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
