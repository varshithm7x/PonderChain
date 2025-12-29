import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#000000',
            border: '2px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
            borderRadius: '0px',
            fontWeight: 'bold',
            padding: '12px 16px',
            fontFamily: '"Space Grotesk", sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#4ECDC4',
              secondary: '#000000',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF6B6B',
              secondary: '#000000',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
