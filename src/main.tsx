import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import './assets/styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </StrictMode>,
)
