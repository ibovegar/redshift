import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from 'store';
import { thunk } from 'redux-thunk';

import { ThemeProvider } from '@mui/material/styles';
import ThemeDark from './ui/theme/dark.theme';
// import ThemeLight from './ui/theme/light.theme';

import App from './App';
import * as serviceWorker from './serviceWorker';

import 'normalize.css';
import './assets/css/styles.css';
import { CssBaseline } from '@mui/material';

const middleware = [thunk];
const composeEnhancers =
  typeof window === 'object' &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
    : compose;

const enhancer = composeEnhancers(applyMiddleware(...middleware));
const store = createStore(rootReducer, enhancer);

const app = (
  <Provider store={store}>
    <BrowserRouter>
      <ThemeProvider theme={ThemeDark}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
);

const root = createRoot(document.getElementById('root')!);
root.render(app);
serviceWorker.unregister();
