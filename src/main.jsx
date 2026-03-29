import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import './App.css'

// Reset scroll position on page load
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}
window.scrollTo(0, 0)

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env')
}

const clerkAppearance = {
  variables: {
    borderRadius: '0px',
    colorBackground: '#1a1a2e',
    colorPrimary: '#95baf5',
    colorText: '#ffffff',
    colorTextSecondary: '#ccccee',
    colorInputBackground: '#2a2a4e',
    colorInputText: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '14px',
  },
  elements: {
    card: { boxShadow: '4px 4px 0 #000', border: '2px solid #444' },
    formButtonPrimary: { borderRadius: '0px', fontFamily: 'inherit' },
    userButtonPopoverCard: { borderRadius: '0px', boxShadow: '4px 4px 0 #000', border: '2px solid #444', backgroundColor: '#1a1a2e' },
    userButtonPopoverActionButton: { color: '#ffffff', transition: 'color 0.2s' },
    userButtonPopoverActionButtonText: { color: '#ffffff' },
    userPreviewMainIdentifier: { color: '#ffffff' },
    userPreviewSecondaryIdentifier: { color: '#ccccee' },
    dividerLine: { backgroundColor: '#444' },
    dividerText: { color: '#aaa' },
    formFieldLabel: { color: '#ffffff' },
    formFieldInput: { color: '#ffffff', border: '1px solid #555' },
    headerTitle: { color: '#ffffff' },
    headerSubtitle: { color: '#ccccee' },
    socialButtonsBlockButton: { border: '1px solid #555', color: '#ffffff' },
    socialButtonsBlockButtonText: { color: '#ffffff' },
    footerActionText: { color: '#ccccee' },
    footerActionLink: { color: '#95baf5' },
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={clerkAppearance}>
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
