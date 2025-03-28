import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import CreateReport from './create-report'
import Header from './components/ui/custom/Header'
import { Toaster } from './components/ui/sonner'
import { GoogleOAuthProvider } from '@react-oauth/google'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/create-report',
    element: <CreateReport />
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <Header />
      <Toaster />
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </StrictMode>,
)
