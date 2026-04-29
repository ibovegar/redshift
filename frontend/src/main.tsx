import { ThemeProvider } from '@mui/material/styles'
import { createRoot } from 'react-dom/client'

import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'
import { applyMiddleware, compose, createStore } from 'redux'
import { thunk } from 'redux-thunk'
import rootReducer from 'store'
import ThemeDark from './ui/theme/dark.theme'
// import ThemeLight from './ui/theme/light.theme';

import App from 'containers/app/app.component'

import 'normalize.css'
import './assets/css/styles.css'
import { CssBaseline } from '@mui/material'

const middleware = [thunk]

interface WindowWithDevTools extends Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose
}

const composeEnhancers: typeof compose =
  (typeof window === 'object' && (window as WindowWithDevTools).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose

const enhancer = composeEnhancers(applyMiddleware(...middleware))
// @ts-expect-error createStore with enhancer
const store = createStore(rootReducer, enhancer)

const app = (
  <Provider store={store}>
    <BrowserRouter>
      <ThemeProvider theme={ThemeDark}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
)

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')
const root = createRoot(rootElement)
root.render(app)
