import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

// Reset scroll position on page load
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}
window.scrollTo(0, 0)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
