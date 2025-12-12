import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Set default axios headers to bypass ngrok warning page
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true'

createRoot(document.getElementById('root')).render(
  <App />
)
