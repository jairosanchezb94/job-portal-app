import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App/App'
import './styles/global.scss'
import './styles/overrides.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)