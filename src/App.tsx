import { BrowserRouter, createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import './App.css'
import SignUp from './pages/signup/SignUp'
import Login from './pages/login/Login'
import Dashboard from './pages/dashboard/Dashboard'

function App() {


 const router = createBrowserRouter(createRoutesFromElements(
  <Route>
     <Route index element={""} />
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/signin" element={<Login/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
  </Route>
 )) 


  return (
    <>
    <RouterProvider router={router}/>
    </>
  )
}

export default App
