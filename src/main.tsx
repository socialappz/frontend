import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import MainProvider from './context/MainProvider.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="max-w-7xl mx-auto px-4">
  <MainProvider>
  <GoogleOAuthProvider clientId="1091903990138-o2dq78j1740onnnbn9mftad75o7kj032.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
  </MainProvider>
  </div>
  </StrictMode>,
)
