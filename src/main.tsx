import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Clarity from '@microsoft/clarity'
import './index.css'
import App from './App'

const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID as string | undefined
if (import.meta.env.PROD && clarityProjectId) {
  Clarity.init(clarityProjectId)
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
