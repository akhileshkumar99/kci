import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Wake up backend (Render free tier cold start)
fetch('https://kci-backend.onrender.com/api/courses').catch(() => {})

createRoot(document.getElementById('root')).render(<App />)
