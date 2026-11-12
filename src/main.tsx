import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Clarity from '@microsoft/clarity'
import { isSignaturePage } from './posthog'
import './index.css'
import App from './App'

const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID as string | undefined
// Clarity enregistre l'URL et l'écran : jamais sur la page de signature (token, signature manuscrite)
if (import.meta.env.PROD && clarityProjectId && !isSignaturePage()) {
  Clarity.init(clarityProjectId)
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
