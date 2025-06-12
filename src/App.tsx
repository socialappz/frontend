import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import './App.css'
import SignUp from './pages/signup/SignUp'
import Login from './pages/login/Login'
import Dashboard from './pages/dashboard/Dashboard'
import MatchList from './pages/matchList/MatchList'
import Profile from './pages/profile/Profile'
import ChatHistory from './components/chatHistory/ChatHistory'
import Layout from './layout/Layout'
import Chat from './components/chat/Chat'
import Home from './pages/home/Home'
import ProtectedRoute from './protectedRoute/ProtectedRoute'



function App() {


 const router = createBrowserRouter(createRoutesFromElements(
  <Route path='/' element={<Layout/>}>
     <Route index element={<Home/>} />
        <Route path="signup" element={<SignUp/>}/>
        <Route path="signin" element={<Login/>}/>
        <Route path='dashboard' element={
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>
          }/>
          
        <Route path='matche' element={
          <ProtectedRoute>
            <MatchList/>
          </ProtectedRoute>
          }/>
      <Route path="matche/:id" element={
        <ProtectedRoute>
          <Profile/>
        </ProtectedRoute>
          }/>
      <Route path='chat/:id' element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
        } />

      <Route path="chats" element={
        <ProtectedRoute>
          <ChatHistory />
        </ProtectedRoute>
        } />

  </Route>
 )) 


  return (
    <>
    <RouterProvider router={router}/>
    </>
  )
}

export default App
